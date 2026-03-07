import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { cancelWorkflow } from "@/lib/approval-engine";

const uuidField = z.string().min(36).max(36);

const cancelSchema = z.object({
    instanceId: uuidField,
    reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

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
                return ApiErrors.internalError(result.error);
        }
    }

    return NextResponse.json({ success: true });
}
