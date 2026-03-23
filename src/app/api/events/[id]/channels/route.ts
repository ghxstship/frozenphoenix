import { NextResponse } from "next/server";
import { createAdminClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandlerParams } from "@/lib/api/with-api-handler";
import { eventChannelCreateSchema, validate } from "@/lib/validation/schemas";

export const POST = withApiHandlerParams(
    {
        method: "POST",
        route: "/api/events/[id]/channels",
        mutation: true,
        rbac: { resource: "messaging_channels", action: "write" },
    },
    async (request, { user, log }, { params }) => {
        const { id: eventId } = await params;

        const admin = createAdminClient();
        if (!admin) return ApiErrors.serviceUnavailable();

        let rawBody: unknown;
        try {
            rawBody = await request.json();
        } catch {
            return ApiErrors.badRequest("Invalid JSON body");
        }

        const result = validate(eventChannelCreateSchema, rawBody);
        if (!result.success) {
            return ApiErrors.validationError(result.errors);
        }

        const { template_id } = result.data;

        // Get event details
        const { data: event, error: eventErr } = await serverFromTable(
            admin!,
            "live_event_instances"
        )
            .select("id, organization_id, name")
            .eq("id", eventId)
            .single();

        if (eventErr || !event) {
            return ApiErrors.notFound("Event");
        }

        let channelsConfig: Array<{
            name: string;
            slug: string;
            category?: string | undefined;
            is_public?: boolean | undefined;
            is_announcement_only?: boolean | undefined;
            is_restricted?: boolean | undefined;
            required_role?: string | undefined;
            required_credential_type?: string | undefined;
        }> = [];

        // Load template if provided
        if (template_id) {
            const { data: template } = await serverFromTable(admin!, "channel_templates")
                .select("channels_config")
                .eq("id", template_id)
                .single();

            if (template?.channels_config) {
                channelsConfig = template.channels_config as typeof channelsConfig;
            }
        }

        // Default channels if no template
        if (channelsConfig.length === 0) {
            const eventSlug =
                event.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") ??
                (eventId ?? "event").slice(0, 8);
            channelsConfig = [
                {
                    name: `${event.name} — General`,
                    slug: `${eventSlug}-general`,
                    category: "general",
                    is_public: true,
                },
                {
                    name: `${event.name} — Production`,
                    slug: `${eventSlug}-production`,
                    category: "production",
                    is_public: false,
                },
                {
                    name: `${event.name} — Safety`,
                    slug: `${eventSlug}-safety`,
                    category: "safety",
                    is_public: true,
                    is_announcement_only: true,
                },
                {
                    name: `${event.name} — Logistics`,
                    slug: `${eventSlug}-logistics`,
                    category: "logistics",
                    is_public: false,
                },
            ];
        }

        // Create conversations for each channel config
        const createdChannels = [];
        for (const ch of channelsConfig) {
            const { data: conversation, error: convErr } = await serverFromTable(
                admin!,
                "conversations"
            )
                .insert({
                    organization_id: event.organization_id,
                    type: "channel",
                    name: ch.name,
                    slug: ch.slug,
                    category: ch.category ?? "general",
                    is_public: ch.is_public ?? false,
                    is_announcement_only: ch.is_announcement_only ?? false,
                    event_id: eventId,
                    is_ephemeral: true,
                    is_restricted: ch.is_restricted ?? false,
                    required_role: ch.required_role,
                    required_credential_type: ch.required_credential_type,
                    template_id: template_id ?? null,
                    created_by: user.id,
                })
                .select("id, name, slug, category, is_public, event_id, created_at")
                .single();

            if (convErr) {
                log.error(`[POST /api/events/[id]/channels] Failed to create channel ${ch.name}`, {
                    error: convErr,
                });
                continue;
            }

            // Add creator as owner
            await serverFromTable(admin!, "conversation_members").insert({
                conversation_id: conversation.id,
                user_id: user.id,
                role: "owner",
            });

            createdChannels.push(conversation);
        }

        // Auto-add crew from live_crew_assignments
        const { data: crewAssignments } = await serverFromTable(admin!, "live_crew_assignments")
            .select("user_id, department")
            .eq("event_id", eventId);

        if (crewAssignments && crewAssignments.length > 0) {
            for (const channel of createdChannels) {
                const members = crewAssignments
                    .filter((ca: Record<string, unknown>) => ca.user_id !== user.id)
                    .map((ca: Record<string, unknown>) => ({
                        conversation_id: channel.id,
                        user_id: ca.user_id,
                        role: "member" as const,
                    }));

                if (members.length > 0) {
                    await serverFromTable(admin!, "conversation_members").insert(members);
                }
            }
        }

        return NextResponse.json({ channels: createdChannels, count: createdChannels.length });
    }
);

export const GET = withApiHandlerParams(
    {
        method: "GET",
        route: "/api/events/[id]/channels",
        rbac: { resource: "messaging_channels", action: "read" },
    },
    async (_request, { log }, { params }) => {
        const { id: eventId } = await params;

        const admin = createAdminClient();
        if (!admin) return ApiErrors.serviceUnavailable();

        const { data: channels, error } = await serverFromTable(admin!, "conversations")
            .select(
                "id, organization_id, type, name, slug, description, is_public, is_announcement_only, category, event_id, created_by, created_at"
            )
            .eq("event_id", eventId)
            .eq("type", "channel")
            .order("created_at", { ascending: true });

        if (error) {
            log.error("[GET /api/events/[id]/channels]", { error });
            return ApiErrors.internalError("Failed to fetch event channels");
        }

        return NextResponse.json({ channels: channels ?? [] });
    }
);
