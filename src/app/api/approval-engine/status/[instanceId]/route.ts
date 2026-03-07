import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { getInstanceStatus } from "@/lib/approval-engine";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ instanceId: string }> }
) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const { instanceId } = await params;

    if (!instanceId || instanceId.length !== 36) {
        return ApiErrors.badRequest("Invalid instance ID");
    }

    const result = await getInstanceStatus(supabase, instanceId);

    if (!result.success) {
        if (result.code === "NOT_FOUND") return ApiErrors.notFound("Workflow instance");
        return ApiErrors.internalError(result.error);
    }

    return NextResponse.json({ data: result.data });
}
