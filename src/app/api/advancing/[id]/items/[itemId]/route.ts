import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { updateAdvanceItemSchema } from "@/lib/validation/advancing-schemas";
import { logger } from "@/lib/logger";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; itemId: string }> }
) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const { id, itemId } = await params;
    const parsed = await parseAndValidate(request, updateAdvanceItemSchema);
    if (!parsed.success) return parsed.response;

    const { data, error } = await serverFromTable(supabase!, "production_advance_items")
        .update(parsed.data as Record<string, unknown>)
        .eq("id", itemId)
        .eq("advance_id", id)
        .select()
        .single();

    if (error) {
        if (error.code === "PGRST116") return ApiErrors.notFound("Advance item");
        logger.error("[PATCH /api/advancing/[id]/items/[itemId]]", { error });
        return ApiErrors.internalError("Failed to update item");
    }

    return NextResponse.json({ data });
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string; itemId: string }> }
) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const { id, itemId } = await params;

    const { error } = await serverFromTable(supabase!, "production_advance_items")
        .update({ deleted_at: new Date().toISOString() } as Record<string, unknown>)
        .eq("id", itemId)
        .eq("advance_id", id);

    if (error) {
        logger.error("[DELETE /api/advancing/[id]/items/[itemId]]", { error });
        return ApiErrors.internalError("Failed to delete item");
    }

    return NextResponse.json({ success: true });
}
