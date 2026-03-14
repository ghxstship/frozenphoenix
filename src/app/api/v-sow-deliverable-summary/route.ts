import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const url = new URL(request.url);
    const sowId = url.searchParams.get("sow_id");

    let query = serverFromTable(supabase, "v_sow_deliverable_summary").select("*");
    if (sowId) query = query.eq("sow_id", sowId);

    const { data, error } = await query;

    if (error) {
        logger.error("[GET /api/v-sow-deliverable-summary] failed", { error: error.message });
        return ApiErrors.internalError("Failed to fetch SOW deliverable summary");
    }

    return NextResponse.json({ data });
}
