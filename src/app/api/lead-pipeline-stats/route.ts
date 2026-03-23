import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/lead-pipeline-stats",
        rbac: { resource: "leads", action: "read" },
    },
    async (_request, { supabase, log }) => {
        const { data, error } = await serverFromTable(supabase, "lead_pipeline_stats").select(
            "stage, count, value, organization_id"
        );

        if (error) {
            log.error("[GET /api/lead-pipeline-stats] failed", { error: error.message });
            return ApiErrors.internalError("Failed to fetch lead pipeline stats");
        }

        return NextResponse.json({ data });
    }
);
