import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { integrationConnectionCreateSchema, validate } from "@/lib/validation/schemas";

export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/integrations/connections",
        rbac: { resource: "integrations", action: "read" },
    },
    async (request, { supabase, log }) => {
        const url = new URL(request.url);
        const providerType = url.searchParams.get("provider_type");
        const eventId = url.searchParams.get("event_id");
        const isActive = url.searchParams.get("is_active");

        let query = serverFromTable(supabase, "provider_connections")
            .select("*")
            .order("created_at", { ascending: false });

        if (providerType) query = query.eq("provider_type", providerType);
        if (eventId) query = query.eq("event_id", eventId);
        if (isActive !== null && isActive !== undefined)
            query = query.eq("is_active", isActive === "true");

        const { data, error } = await query;
        if (error) {
            log.error("[GET /api/integrations/connections]", { error });
            return ApiErrors.internalError("Failed to fetch connections");
        }

        return NextResponse.json({ data });
    }
);

export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/integrations/connections",
        mutation: true,
        rbac: { resource: "integrations", action: "write" },
    },
    async (request, { supabase, user, log }) => {
        let rawBody: unknown;
        try {
            rawBody = await request.json();
        } catch {
            return ApiErrors.badRequest("Invalid JSON body");
        }

        const result = validate(integrationConnectionCreateSchema, rawBody);
        if (!result.success) {
            return ApiErrors.validationError(result.errors);
        }

        const {
            provider_type,
            display_name,
            event_id,
            api_key,
            api_secret,
            webhook_secret,
            sync_direction,
        } = result.data;

        // Generate webhook URL for inbound connections
        const webhookUrl = ["inbound", "bidirectional"].includes(sync_direction ?? "inbound")
            ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/webhook-${provider_type}`
            : null;

        const { data: connection, error } = await serverFromTable(supabase, "provider_connections")
            .insert({
                provider_type,
                display_name,
                event_id: event_id ?? null,
                api_key: api_key ?? null,
                api_secret: api_secret ?? null,
                webhook_secret: webhook_secret ?? null,
                webhook_url: webhookUrl,
                sync_direction: sync_direction ?? "inbound",
                created_by: user.id,
                updated_by: user.id,
            } as Record<string, unknown>)
            .select()
            .single();

        if (error) {
            log.error("[POST /api/integrations/connections]", { error });
            return ApiErrors.internalError("Failed to create connection");
        }

        return NextResponse.json({ data: connection }, { status: 201 });
    }
);
