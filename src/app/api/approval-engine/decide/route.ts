import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { recordDecision } from "@/lib/approval-engine";

const uuidField = z.string().min(36).max(36);

const decideSchema = z.object({
    instanceId: uuidField,
    stepId: uuidField,
    decision: z.enum(["approved", "rejected", "delegated"]),
    comments: z.string().optional(),
    delegateTo: uuidField.optional(),
});

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const parsed = await parseAndValidate(request, decideSchema);
    if (!parsed.success) return parsed.response;

    const result = await recordDecision(supabase, {
        instanceId: parsed.data.instanceId,
        stepId: parsed.data.stepId,
        approverId: user.id,
        decision: parsed.data.decision,
        comments: parsed.data.comments,
        delegateTo: parsed.data.delegateTo,
    });

    if (!result.success) {
        switch (result.code) {
            case "NOT_FOUND":
                return ApiErrors.notFound("Workflow instance");
            case "INVALID_STATE":
                return ApiErrors.badRequest(result.error!);
            case "STEP_MISMATCH":
                return ApiErrors.badRequest(result.error!);
            case "NOT_ASSIGNED":
                return ApiErrors.forbidden(result.error!);
            case "ALREADY_DECIDED":
                return ApiErrors.conflict(result.error!);
            case "VALIDATION":
                return ApiErrors.badRequest(result.error!);
            default:
                return ApiErrors.internalError(result.error);
        }
    }

    return NextResponse.json({ data: result.data });
}
