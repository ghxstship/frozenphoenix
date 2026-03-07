import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { hasPermission } from "@/config/rbac";
import type { PermissionLevel } from "@/types";
import { initiateWorkflow } from "@/lib/approval-engine";

const uuidField = z.string().min(36).max(36);

const initiateSchema = z.object({
    workflowId: uuidField,
    entityId: uuidField,
    entityType: z.string().min(1),
    entityName: z.string().optional(),
    context: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    // RBAC: must have create permission on approvals
    const { data: membership } = await supabase
        .from("org_memberships")
        .select("role")
        .eq("user_id", user.id)
        .eq("is_default_org", true)
        .single();

    const role = (membership?.role ?? "member") as PermissionLevel;
    if (!hasPermission(role, "approvals", "write")) {
        return ApiErrors.forbidden("Insufficient permissions to initiate approval workflows");
    }

    const parsed = await parseAndValidate(request, initiateSchema);
    if (!parsed.success) return parsed.response;

    // Get user's org
    const { data: org } = await supabase
        .from("org_memberships")
        .select("organization_id")
        .eq("user_id", user.id)
        .eq("is_default_org", true)
        .single();

    if (!org) return ApiErrors.badRequest("No organization found for user");

    const result = await initiateWorkflow(supabase, {
        workflowId: parsed.data.workflowId,
        entityId: parsed.data.entityId,
        entityType: parsed.data.entityType,
        entityName: parsed.data.entityName,
        organizationId: org.organization_id,
        initiatedBy: user.id,
        context: parsed.data.context,
    });

    if (!result.success) {
        switch (result.code) {
            case "NOT_FOUND":
                return ApiErrors.notFound("Workflow");
            case "CONFLICT":
                return ApiErrors.conflict(result.error!);
            case "ENTITY_MISMATCH":
                return ApiErrors.badRequest(result.error!);
            case "INVALID_STATE":
                return ApiErrors.badRequest(result.error!);
            case "NO_STEPS":
                return ApiErrors.badRequest(result.error!);
            default:
                return ApiErrors.internalError(result.error);
        }
    }

    return NextResponse.json({ data: result.data }, { status: 201 });
}
