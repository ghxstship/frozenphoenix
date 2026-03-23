import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/sla-status",
        rbac: { resource: "sla_policies", action: "read" },
    },
    async (_request, { supabase, log }) => {
        const { data, error } = await serverFromTable(supabase, "sla_status").select(
            "id, policy_name, entity_type, entity_id, status, due_at, breached, organization_id"
        );

        if (error) {
            log.error("[GET /api/sla-status] failed", { error: error.message });
            return ApiErrors.internalError("Failed to fetch SLA status");
        }

        return NextResponse.json({ data });
    }
);
