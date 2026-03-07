import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { z } from "zod";
import { logger } from "@/lib/logger";

const rejectSchema = z.object({
    reason: z.string().min(1, "Rejection reason is required"),
});

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const { id } = await params;
    const parsed = await parseAndValidate(request, rejectSchema);
    if (!parsed.success) return parsed.response;

    const { data: advance, error: fetchError } = await serverFromTable(supabase!, "production_advances")
        .select("id, status")
        .eq("id", id)
        .is("deleted_at", null)
        .single();

    if (fetchError || !advance) return ApiErrors.notFound("Advance");

    const currentStatus = (advance as Record<string, unknown>).status as string;
    if (currentStatus !== "in_review" && currentStatus !== "submitted") {
        return ApiErrors.badRequest(`Cannot reject an advance in '${currentStatus}' status`);
    }

    // Return to submitted (for revision) rather than cancelling
    const { data, error } = await serverFromTable(supabase!, "production_advances")
        .update({ status: "submitted" } as Record<string, unknown>)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        logger.error("[POST /api/advancing/[id]/reject]", { error });
        return ApiErrors.internalError("Failed to reject advance");
    }

    // Log rejection reason via status history
    await serverFromTable(supabase!, "advance_status_history").insert({
        entity_type: "advance",
        entity_id: id,
        from_status: currentStatus,
        to_status: "submitted",
        changed_by: user.id,
        reason: parsed.data.reason,
        metadata: { action: "rejection" },
    } as Record<string, unknown>);

    return NextResponse.json({ data });
}
