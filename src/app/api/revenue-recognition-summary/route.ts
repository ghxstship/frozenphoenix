import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/revenue-recognition-summary",
        rbac: { resource: "invoices", action: "read" },
    },
    async (_request, { supabase, log }) => {
        const { data, error } = await serverFromTable(
            supabase,
            "revenue_recognition_summary"
        ).select("*");

        if (error) {
            log.error("[GET /api/revenue-recognition-summary] failed", { error: error.message });
            return ApiErrors.internalError("Failed to fetch revenue recognition summary");
        }

        return NextResponse.json({ data });
    }
);
