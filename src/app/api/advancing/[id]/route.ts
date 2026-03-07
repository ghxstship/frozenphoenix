import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { updateAdvanceSchema } from "@/lib/validation/advancing-schemas";
import { logger } from "@/lib/logger";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const { id } = await params;

    const { data, error } = await serverFromTable(supabase!, "production_advances")
        .select(`
            *,
            events:event_id(name),
            projects:project_id(name),
            submitted_by_profile:submitted_by(name, avatar_url),
            point_of_contact_profile:point_of_contact(name, avatar_url),
            approved_by_profile:approved_by(name)
        `)
        .eq("id", id)
        .is("deleted_at", null)
        .single();

    if (error) {
        if (error.code === "PGRST116") return ApiErrors.notFound("Advance");
        logger.error("[GET /api/advancing/[id]]", { error });
        return ApiErrors.internalError("Failed to fetch advance");
    }

    return NextResponse.json({ data });
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const { id } = await params;
    const parsed = await parseAndValidate(request, updateAdvanceSchema);
    if (!parsed.success) return parsed.response;

    const { data, error } = await serverFromTable(supabase!, "production_advances")
        .update(parsed.data as Record<string, unknown>)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        if (error.code === "PGRST116") return ApiErrors.notFound("Advance");
        logger.error("[PATCH /api/advancing/[id]]", { error });
        return ApiErrors.internalError("Failed to update advance");
    }

    return NextResponse.json({ data });
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const { id } = await params;

    const { error } = await serverFromTable(supabase!, "production_advances")
        .update({ deleted_at: new Date().toISOString() } as Record<string, unknown>)
        .eq("id", id);

    if (error) {
        logger.error("[DELETE /api/advancing/[id]]", { error });
        return ApiErrors.internalError("Failed to delete advance");
    }

    return NextResponse.json({ success: true });
}
