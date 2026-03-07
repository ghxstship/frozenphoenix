import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { z } from "zod";
import { logger } from "@/lib/logger";

const cancelSchema = z.object({
    reason: z.string().optional(),
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
    const parsed = await parseAndValidate(request, cancelSchema);
    if (!parsed.success) return parsed.response;

    const { data: advance, error: fetchError } = await serverFromTable(supabase!, "production_advances")
        .select("id, status")
        .eq("id", id)
        .is("deleted_at", null)
        .single();

    if (fetchError || !advance) return ApiErrors.notFound("Advance");

    const currentStatus = (advance as Record<string, unknown>).status as string;
    const cancellable = ["draft", "submitted", "in_review", "approved", "in_progress"];
    if (!cancellable.includes(currentStatus)) {
        return ApiErrors.badRequest(`Cannot cancel an advance in '${currentStatus}' status`);
    }

    const { data, error } = await serverFromTable(supabase!, "production_advances")
        .update({ status: "cancelled" } as Record<string, unknown>)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        logger.error("[POST /api/advancing/[id]/cancel]", { error });
        return ApiErrors.internalError("Failed to cancel advance");
    }

    if (parsed.data.reason) {
        await serverFromTable(supabase!, "advance_status_history").insert({
            entity_type: "advance",
            entity_id: id,
            from_status: currentStatus,
            to_status: "cancelled",
            changed_by: user.id,
            reason: parsed.data.reason,
            metadata: { action: "cancellation" },
        } as Record<string, unknown>);
    }

    return NextResponse.json({ data });
}
