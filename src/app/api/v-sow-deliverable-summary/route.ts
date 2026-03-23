import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/v-sow-deliverable-summary",
        rbac: { resource: "sow", action: "read" },
    },
    async (request, { supabase, log }) => {
        const sowId = request.nextUrl.searchParams.get("sow_id");

        let query = serverFromTable(supabase, "v_sow_deliverable_summary").select(
            "sow_id, deliverable_id, title, status, due_date, completed_at, organization_id"
        );
        if (sowId) query = query.eq("sow_id", sowId);

        const { data, error } = await query;

        if (error) {
            log.error("[GET /api/v-sow-deliverable-summary] failed", { error: error.message });
            return ApiErrors.internalError("Failed to fetch SOW deliverable summary");
        }

        return NextResponse.json({ data });
    }
);
