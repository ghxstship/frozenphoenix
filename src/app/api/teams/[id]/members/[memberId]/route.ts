import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { teamMemberUpdateSchema } from "@/lib/validation/entity-schemas";
import { withApiHandlerParams } from "@/lib/api/with-api-handler";

export const PATCH = withApiHandlerParams(
    {
        method: "PATCH",
        route: "/api/teams/[id]/members/[memberId]",
        mutation: true,
        rbac: { resource: "team_members", action: "write" },
    },
    async (request, { supabase, log }, { params }) => {
        const parsed = await parseAndValidate(request, teamMemberUpdateSchema);
        if (!parsed.success) return parsed.response;

        const { id: teamId, memberId } = await params;

        const { data, error } = await serverFromTable(supabase, "team_members")
            .update({ role: parsed.data.role })
            .eq("id", memberId)
            .eq("team_id", teamId)
            .select(
                "id, team_id, user_id, role, joined_at, user_profiles(id, display_name, avatar_url, email)"
            )
            .single();

        if (error) {
            if (error.code === "PGRST116") return ApiErrors.notFound("Team member");
            log.error("[PATCH /api/teams/[id]/members/[memberId]] failed", {
                teamId,
                memberId,
                error: error.message,
            });
            return ApiErrors.internalError("Failed to update team member");
        }

        log.info("[PATCH /api/teams/[id]/members/[memberId]] updated", { teamId, memberId });
        return NextResponse.json({ data });
    }
);

export const DELETE = withApiHandlerParams(
    {
        method: "DELETE",
        route: "/api/teams/[id]/members/[memberId]",
        mutation: true,
        rbac: { resource: "team_members", action: "delete" },
    },
    async (_request, { supabase, log }, { params }) => {
        const { id: teamId, memberId } = await params;

        const { error } = await serverFromTable(supabase, "team_members")
            .delete()
            .eq("id", memberId)
            .eq("team_id", teamId);

        if (error) {
            log.error("[DELETE /api/teams/[id]/members/[memberId]] failed", {
                teamId,
                memberId,
                error: error.message,
            });
            return ApiErrors.internalError("Failed to remove team member");
        }

        log.info("[DELETE /api/teams/[id]/members/[memberId]] removed", { teamId, memberId });
        return NextResponse.json({ success: true });
    }
);
