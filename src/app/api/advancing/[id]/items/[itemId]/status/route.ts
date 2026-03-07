import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { advanceItemStatusTransitionSchema } from "@/lib/validation/advancing-schemas";
import { logger } from "@/lib/logger";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; itemId: string }> }
) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const { id, itemId } = await params;
    const parsed = await parseAndValidate(request, advanceItemStatusTransitionSchema);
    if (!parsed.success) return parsed.response;

    const updates: Record<string, unknown> = { status: parsed.data.status };
    if (parsed.data.quantity_confirmed !== undefined) {
        updates.quantity_confirmed = parsed.data.quantity_confirmed;
    }

    const { data, error } = await serverFromTable(supabase!, "production_advance_items")
        .update(updates)
        .eq("id", itemId)
        .eq("advance_id", id)
        .select()
        .single();

    if (error) {
        if (error.code === "PGRST116") return ApiErrors.notFound("Advance item");
        logger.error("[POST /api/advancing/[id]/items/[itemId]/status]", { error });
        return ApiErrors.internalError("Failed to update item status");
    }

    return NextResponse.json({ data });
}
