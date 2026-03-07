import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const { id } = await params;

    const { data: advance, error: fetchError } = await serverFromTable(supabase!, "production_advances")
        .select("id, status")
        .eq("id", id)
        .is("deleted_at", null)
        .single();

    if (fetchError || !advance) return ApiErrors.notFound("Advance");

    const currentStatus = (advance as Record<string, unknown>).status as string;
    if (currentStatus !== "in_review" && currentStatus !== "submitted") {
        return ApiErrors.badRequest(`Cannot approve an advance in '${currentStatus}' status`);
    }

    const { data, error } = await serverFromTable(supabase!, "production_advances")
        .update({
            status: "approved",
            approved_by: user.id,
        } as Record<string, unknown>)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        logger.error("[POST /api/advancing/[id]/approve]", { error });
        return ApiErrors.internalError("Failed to approve advance");
    }

    return NextResponse.json({ data });
}
