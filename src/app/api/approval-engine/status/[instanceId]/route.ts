import { NextResponse } from "next/server";
import { ApiErrors } from "@/lib/api-utils";
import { getInstanceStatus } from "@/lib/approval-engine";
import { withApiHandlerParams } from "@/lib/api/with-api-handler";

export const GET = withApiHandlerParams(
    {
        method: "GET",
        route: "/api/approval-engine/status/[instanceId]",
        rbac: { resource: "approvals", action: "read" },
    },
    async (_request, { supabase }, { params }) => {
        const { instanceId } = await params;

        if (!instanceId || instanceId.length !== 36) {
            return ApiErrors.badRequest("Invalid instance ID");
        }

        const result = await getInstanceStatus(supabase, instanceId);

        if (!result.success) {
            if (result.code === "NOT_FOUND") return ApiErrors.notFound("Workflow instance");
            return ApiErrors.internalError("Failed to fetch workflow status");
        }

        return NextResponse.json({ data: result.data });
    }
);
