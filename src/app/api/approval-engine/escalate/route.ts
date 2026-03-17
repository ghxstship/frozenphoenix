import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { escalateStep } from "@/lib/approval-engine";
import { withApiHandler } from "@/lib/api/with-api-handler";

const uuidField = z.string().min(36).max(36);

const escalateSchema = z.object({
    instanceId: uuidField,
    stepId: uuidField,
    reason: z.string().optional(),
});

export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/approval-engine/escalate",
        mutation: true,
        rbac: { resource: "approvals", action: "write" },
    },
    async (request, { supabase, user }) => {
        const parsed = await parseAndValidate(request, escalateSchema);
        if (!parsed.success) return parsed.response;

        const result = await escalateStep(supabase, {
            instanceId: parsed.data.instanceId,
            stepId: parsed.data.stepId,
            escalatedBy: user.id,
            reason: parsed.data.reason,
        });

        if (!result.success) {
            switch (result.code) {
                case "INVALID_STATE":
                    return ApiErrors.badRequest(result.error!);
                case "STEP_MISMATCH":
                    return ApiErrors.badRequest(result.error!);
                case "NO_ESCALATION_TARGET":
                    return ApiErrors.badRequest(result.error!);
                default:
                    return ApiErrors.internalError("Escalation failed");
            }
        }

        return NextResponse.json({ data: result.data });
    }
);
