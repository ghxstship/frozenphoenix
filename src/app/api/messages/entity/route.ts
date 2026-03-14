import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { z } from "zod";
import { logger } from "@/lib/logger";

const entityMessageSchema = z.object({
    body: z.string().min(1).max(10000),
    body_html: z.string().max(50000).optional(),
    entity_type: z.string().min(1).max(100),
    entity_id: z.string().uuid(),
    mentioned_user_ids: z.array(z.string().uuid()).optional(),
    is_internal: z.boolean().optional(),
    priority: z.enum(["normal", "high", "urgent", "critical"]).optional(),
});

/**
 * GET /api/messages/entity?entity_type=...&entity_id=...
 * Get messages for a specific entity (record comments).
 */
export async function GET(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const admin = createAdminClient();
    if (!admin) return ApiErrors.serviceUnavailable();

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entity_type");
    const entityId = searchParams.get("entity_id");

    if (!entityType || !entityId) {
        return ApiErrors.badRequest("entity_type and entity_id are required");
    }

    const { data: messages, error } = await serverFromTable(admin!, "messages")
        .select("*, user_profiles:sender_id(id, display_name, avatar_url)")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });

    if (error) return ApiErrors.internalError("Failed to fetch entity messages");

    const enriched =
        (messages as Record<string, unknown>[] | null)?.map((m) => {
            const up = m.user_profiles as {
                id: string;
                display_name: string;
                avatar_url: string | null;
            } | null;
            const profile = up
                ? { id: up.id, name: up.display_name, avatar_url: up.avatar_url }
                : null;
            return {
                ...m,
                user_profiles: undefined,
                sender: profile,
                reactions: [],
            };
        }) ?? [];

    return NextResponse.json({ data: enriched });
}

/**
 * POST /api/messages/entity
 * Create a record-scoped message (comment on an entity).
 */
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const admin = createAdminClient();
    if (!admin) return ApiErrors.serviceUnavailable();

    const parsed = await parseAndValidate(request, entityMessageSchema);
    if (!parsed.success) return parsed.response;

    const { body, body_html, entity_type, entity_id, mentioned_user_ids, is_internal, priority } =
        parsed.data;

    // Get user's org
    const { data: membership } = await serverFromTable(admin!, "org_memberships")
        .select("organization_id")
        .eq("user_id", user.id)
        .eq("is_default_org", true)
        .eq("status", "active")
        .single();
    const orgId = (membership as Record<string, unknown> | null)?.organization_id as string | null;

    const { data: message, error } = await serverFromTable(admin!, "messages")
        .insert({
            sender_id: user.id,
            body,
            body_html: body_html ?? null,
            entity_type,
            entity_id,
            mentioned_user_ids: mentioned_user_ids ?? [],
            is_internal: is_internal ?? false,
            priority: priority ?? "normal",
            organization_id: orgId,
        })
        .select("*, user_profiles:sender_id(id, display_name, avatar_url)")
        .single();

    if (error) {
        logger.error("[POST /api/messages/entity] insert failed", { error });
        return ApiErrors.internalError("Failed to create message");
    }

    // Dispatch @mention notifications (async, non-blocking)
    if (mentioned_user_ids && mentioned_user_ids.length > 0) {
        const senderProfile = (message as Record<string, unknown>).user_profiles as {
            display_name: string;
        } | null;
        const senderName = senderProfile?.display_name ?? "Someone";

        for (const mentionedUserId of mentioned_user_ids) {
            if (mentionedUserId === user.id) continue;
            fetch(new URL("/api/notifications/dispatch", request.url).toString(), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: mentionedUserId,
                    title: `${senderName} mentioned you on a ${entity_type}`,
                    body: body.slice(0, 200),
                    type: "mention",
                    action_url: `/${entity_type}s/${entity_id}`,
                    organization_id: orgId,
                }),
            }).catch(() => {
                // Best-effort
            });
        }
    }

    return NextResponse.json({ data: message }, { status: 201 });
}
