import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { escalateStep } from "@/lib/approval-engine";

const uuidField = z.string().min(36).max(36);

const escalateSchema = z.object({
    instanceId: uuidField,
    stepId: uuidField,
    reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

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
                return ApiErrors.internalError(result.error);
        }
    }

    return NextResponse.json({ data: result.data });
}
