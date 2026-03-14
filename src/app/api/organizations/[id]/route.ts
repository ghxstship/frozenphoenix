import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const { id } = await params;

    const { data, error } = await serverFromTable(supabase, "organizations")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        if (error.code === "PGRST116") return ApiErrors.notFound("Organization");
        logger.error("[GET /api/organizations/:id] failed", { id, error: error.message });
        return ApiErrors.internalError("Failed to fetch organization");
    }

    return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const { id } = await params;
    let payload: Record<string, unknown>;
    try {
        payload = await request.json();
    } catch {
        return ApiErrors.badRequest("Request body must be valid JSON");
    }

    payload.updated_at = new Date().toISOString();

    const { data, error } = await serverFromTable(supabase, "organizations")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();

    if (error) {
        if (error.code === "PGRST116") return ApiErrors.notFound("Organization");
        logger.error("[PATCH /api/organizations/:id] failed", { id, error: error.message });
        return ApiErrors.internalError("Failed to update organization");
    }

    return NextResponse.json({ data });
}
