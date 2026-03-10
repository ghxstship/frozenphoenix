import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { hasPermission } from "@/config/rbac";
import type { PermissionLevel } from "@/types";
import { logger } from "@/lib/logger";
import { teamMemberUpdateSchema } from "@/lib/validation/entity-schemas";

async function resolveUserRole(
    supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
    userId: string
): Promise<PermissionLevel> {
    const { data } = await supabase
        .from("org_memberships")
        .select("role")
        .eq("user_id", userId)
        .eq("is_default_org", true)
        .single();
    return (data?.role as PermissionLevel) ?? "member";
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; memberId: string }> }
): Promise<NextResponse> {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const userRole = await resolveUserRole(supabase, user.id);
    if (!hasPermission(userRole, "team_members", "write")) {
        return ApiErrors.forbidden(`Role "${userRole}" cannot update team members`);
    }

    const parsed = await parseAndValidate(request, teamMemberUpdateSchema);
    if (!parsed.success) return parsed.response;

    const { id: teamId, memberId } = await params;

    const { data, error } = await serverFromTable(supabase, "team_members")
        .update({ role: parsed.data.role })
        .eq("id", memberId)
        .eq("team_id", teamId)
        .select("id, team_id, user_id, role, joined_at, user_profiles(id, display_name, avatar_url, email)")
        .single();

    if (error) {
        if (error.code === "PGRST116") return ApiErrors.notFound("Team member");
        logger.error("[PATCH /api/teams/[id]/members/[memberId]] failed", { teamId, memberId, error: error.message });
        return ApiErrors.internalError("Failed to update team member");
    }

    logger.info("[PATCH /api/teams/[id]/members/[memberId]] updated", { teamId, memberId });
    return NextResponse.json({ data });
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string; memberId: string }> }
): Promise<NextResponse> {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const userRole = await resolveUserRole(supabase, user.id);
    if (!hasPermission(userRole, "team_members", "write")) {
        return ApiErrors.forbidden(`Role "${userRole}" cannot remove team members`);
    }

    const { id: teamId, memberId } = await params;

    const { error } = await serverFromTable(supabase, "team_members")
        .delete()
        .eq("id", memberId)
        .eq("team_id", teamId);

    if (error) {
        logger.error("[DELETE /api/teams/[id]/members/[memberId]] failed", { teamId, memberId, error: error.message });
        return ApiErrors.internalError("Failed to remove team member");
    }

    logger.info("[DELETE /api/teams/[id]/members/[memberId]] removed", { teamId, memberId });
    return NextResponse.json({ success: true });
}
