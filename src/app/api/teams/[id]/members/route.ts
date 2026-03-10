import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { hasPermission } from "@/config/rbac";
import type { PermissionLevel } from "@/types";
import { logger } from "@/lib/logger";
import { teamMemberCreateSchema } from "@/lib/validation/entity-schemas";

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

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const userRole = await resolveUserRole(supabase, user.id);
    if (!hasPermission(userRole, "team_members", "read")) {
        return ApiErrors.forbidden(`Role "${userRole}" cannot read team members`);
    }

    const { id: teamId } = await params;

    const { data, error } = await serverFromTable(supabase, "team_members")
        .select("id, team_id, user_id, role, joined_at, user_profiles(id, display_name, avatar_url, email)")
        .eq("team_id", teamId)
        .order("role")
        .order("joined_at");

    if (error) {
        logger.error("[GET /api/teams/[id]/members] failed", { teamId, error: error.message });
        return ApiErrors.internalError("Failed to fetch team members");
    }

    return NextResponse.json({ data });
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const userRole = await resolveUserRole(supabase, user.id);
    if (!hasPermission(userRole, "team_members", "write")) {
        return ApiErrors.forbidden(`Role "${userRole}" cannot add team members`);
    }

    const parsed = await parseAndValidate(request, teamMemberCreateSchema);
    if (!parsed.success) return parsed.response;

    const { id: teamId } = await params;

    const { data, error } = await serverFromTable(supabase, "team_members")
        .insert({
            team_id: teamId,
            user_id: parsed.data.user_id,
            role: parsed.data.role,
        })
        .select("id, team_id, user_id, role, joined_at, user_profiles(id, display_name, avatar_url, email)")
        .single();

    if (error) {
        if (error.code === "23505") {
            return ApiErrors.conflict("User is already a member of this team");
        }
        if (error.code === "23503") {
            return ApiErrors.badRequest("Team or user does not exist");
        }
        logger.error("[POST /api/teams/[id]/members] failed", { teamId, error: error.message });
        return ApiErrors.internalError("Failed to add team member");
    }

    logger.info("[POST /api/teams/[id]/members] added", { teamId, userId: parsed.data.user_id });
    return NextResponse.json({ data }, { status: 201 });
}
