import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/review-stats",
        rbac: { resource: "reviews", action: "read" },
    },
    async (_request, { supabase, log }) => {
        const { data, error } = await serverFromTable(supabase, "review_stats").select("*");

        if (error) {
            log.error("[GET /api/review-stats] failed", { error: error.message });
            return ApiErrors.internalError("Failed to fetch review stats");
        }

        return NextResponse.json({ data });
    }
);
