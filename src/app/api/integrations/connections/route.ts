import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const url = new URL(request.url);
    const providerType = url.searchParams.get("provider_type");
    const eventId = url.searchParams.get("event_id");
    const isActive = url.searchParams.get("is_active");

    let query = serverFromTable(supabase!, "provider_connections")
        .select("*")
        .order("created_at", { ascending: false });

    if (providerType) query = query.eq("provider_type", providerType);
    if (eventId) query = query.eq("event_id", eventId);
    if (isActive !== null && isActive !== undefined) query = query.eq("is_active", isActive === "true");

    const { data, error } = await query;
    if (error) {
        logger.error("[GET /api/integrations/connections]", { error });
        return ApiErrors.internalError("Failed to fetch connections");
    }

    return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const body = await request.json();
    const {
        provider_type,
        display_name,
        event_id,
        api_key,
        api_secret,
        webhook_secret,
        sync_direction,
    } = body;

    if (!provider_type || !display_name) {
        return ApiErrors.badRequest("provider_type and display_name are required");
    }

    // Generate webhook URL for inbound connections
    const webhookUrl = ["inbound", "bidirectional"].includes(sync_direction ?? "inbound")
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/webhook-${provider_type}`
        : null;

    const { data: connection, error } = await serverFromTable(supabase!, "provider_connections")
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
        logger.error("[POST /api/integrations/connections]", { error });
        return ApiErrors.internalError("Failed to create connection");
    }

    return NextResponse.json({ data: connection }, { status: 201 });
}
