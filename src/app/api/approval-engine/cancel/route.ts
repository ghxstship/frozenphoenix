import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { cancelWorkflow } from "@/lib/approval-engine";
import { withApiHandler } from "@/lib/api/with-api-handler";

const uuidField = z.string().min(36).max(36);

const cancelSchema = z.object({
    instanceId: uuidField,
    reason: z.string().optional(),
});

export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/approval-engine/cancel",
        mutation: true,
        rbac: { resource: "approvals", action: "write" },
    },
    async (request, { supabase, user }) => {
        const parsed = await parseAndValidate(request, cancelSchema);
        if (!parsed.success) return parsed.response;

        const result = await cancelWorkflow(
            supabase,
            parsed.data.instanceId,
            user.id,
            parsed.data.reason
        );

        if (!result.success) {
            switch (result.code) {
                case "NOT_FOUND":
                    return ApiErrors.notFound("Workflow instance");
                case "INVALID_STATE":
                    return ApiErrors.badRequest(result.error!);
                default:
                    return ApiErrors.internalError("Failed to cancel workflow");
            }
        }

        return NextResponse.json({ success: true });
    }
);
