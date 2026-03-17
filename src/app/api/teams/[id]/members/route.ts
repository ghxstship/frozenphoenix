import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { teamMemberCreateSchema } from "@/lib/validation/entity-schemas";
import { withApiHandlerParams } from "@/lib/api/with-api-handler";

export const GET = withApiHandlerParams(
    {
        method: "GET",
        route: "/api/teams/[id]/members",
        rbac: { resource: "team_members", action: "read" },
    },
    async (_request, { supabase, log }, { params }) => {
        const { id: teamId } = await params;

        const { data, error } = await serverFromTable(supabase, "team_members")
            .select(
                "id, team_id, user_id, role, joined_at, user_profiles(id, display_name, avatar_url, email)"
            )
            .eq("team_id", teamId)
            .order("role")
            .order("joined_at");

        if (error) {
            log.error("[GET /api/teams/[id]/members] failed", { teamId, error: error.message });
            return ApiErrors.internalError("Failed to fetch team members");
        }

        return NextResponse.json({ data });
    }
);

export const POST = withApiHandlerParams(
    {
        method: "POST",
        route: "/api/teams/[id]/members",
        mutation: true,
        rbac: { resource: "team_members", action: "write" },
    },
    async (request, { supabase, log }, { params }) => {
        const parsed = await parseAndValidate(request, teamMemberCreateSchema);
        if (!parsed.success) return parsed.response;

        const { id: teamId } = await params;

        const { data, error } = await serverFromTable(supabase, "team_members")
            .insert({
                team_id: teamId,
                user_id: parsed.data.user_id,
                role: parsed.data.role,
            })
            .select(
                "id, team_id, user_id, role, joined_at, user_profiles(id, display_name, avatar_url, email)"
            )
            .single();

        if (error) {
            if (error.code === "23505") {
                return ApiErrors.conflict("User is already a member of this team");
            }
            if (error.code === "23503") {
                return ApiErrors.badRequest("Team or user does not exist");
            }
            log.error("[POST /api/teams/[id]/members] failed", { teamId, error: error.message });
            return ApiErrors.internalError("Failed to add team member");
        }

        log.info("[POST /api/teams/[id]/members] added", { teamId, userId: parsed.data.user_id });
        return NextResponse.json({ data }, { status: 201 });
    }
);
