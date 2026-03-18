import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/user-directory",
        rbac: { resource: "user_profiles", action: "read" },
    },
    async (_request, { supabase, log }) => {
        const { data, error } = await serverFromTable(supabase, "user_profiles").select(
            "id, full_name, email, avatar_url, role, department, organization_id"
        );

        if (error) {
            log.error("[GET /api/user-directory] failed", { error: error.message });
            return ApiErrors.internalError("Failed to fetch user directory");
        }

        return NextResponse.json({ data });
    }
);
