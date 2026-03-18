import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/time-tracking-compliance",
        rbac: { resource: "time_entries", action: "read" },
    },
    async (_request, { supabase, log }) => {
        const { data, error } = await serverFromTable(supabase, "time_tracking_compliance").select(
            "*"
        );

        if (error) {
            log.error("[GET /api/time-tracking-compliance] failed", { error: error.message });
            return ApiErrors.internalError("Failed to fetch time tracking compliance");
        }

        return NextResponse.json({ data });
    }
);
