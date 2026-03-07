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

    // Fetch current advance
    const { data: advance, error: fetchError } = await serverFromTable(supabase!, "production_advances")
        .select("id, status, total_items")
        .eq("id", id)
        .is("deleted_at", null)
        .single();

    if (fetchError || !advance) return ApiErrors.notFound("Advance");

    // Validate transition: only draft → submitted
    if ((advance as Record<string, unknown>).status !== "draft") {
        return ApiErrors.badRequest("Only draft advances can be submitted");
    }

    // Must have at least one item
    if (((advance as Record<string, unknown>).total_items as number) < 1) {
        return ApiErrors.badRequest("Cannot submit an advance with no items");
    }

    const { data, error } = await serverFromTable(supabase!, "production_advances")
        .update({ status: "submitted" } as Record<string, unknown>)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        logger.error("[POST /api/advancing/[id]/submit]", { error });
        return ApiErrors.internalError("Failed to submit advance");
    }

    return NextResponse.json({ data });
}
