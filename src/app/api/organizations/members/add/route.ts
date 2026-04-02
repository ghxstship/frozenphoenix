/**
 * POST /api/organizations/members/add
 *
 * HARBOR-MASTER Flow E — Manual Add.
 * Admin (with can_invite permission) adds an existing platform user directly.
 * Role hierarchy ceiling enforced. Membership created as 'active' immediately.
 */

import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { z } from "zod";

const addMemberSchema = z.object({
    organization_id: z.string().uuid(),
    project_id: z.string().uuid().optional(),
    /** Email of the existing platform user to add */
    email: z.string().email().toLowerCase(),
    role_id: z.string().uuid(),
});

export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/organizations/members/add",
        mutation: true,
    },
    async (request, { supabase, user }) => {
        const body: unknown = await request.json();
        const parsed = addMemberSchema.safeParse(body);
        if (!parsed.success) {
            return ApiErrors.badRequest(parsed.error.issues[0]?.message ?? "Invalid payload");
        }
        const { organization_id, project_id, email, role_id } = parsed.data;

        // ── 1. Caller must have active membership with can_invite ──────────
        const canInvite = await resolveCanInvite(supabase, user.id, organization_id);
        if (!canInvite) {
            return ApiErrors.forbidden("Your role does not have permission to add members");
        }

        // ── 2. Target user must exist on the platform ─────────────────────
        const { data: targetProfile } = await serverFromTable(supabase, "user_profiles")
            .select("id, display_name, email")
            .eq("email", email)
            .maybeSingle();

        if (!targetProfile) {
            return ApiErrors.notFound(
                "No platform user found with that email. Use direct invitation instead."
            );
        }

        // ── 3. Target must not already be an active member ─────────────────
        const memberQuery = serverFromTable(supabase, "org_memberships")
            .select("id, status")
            .eq("user_id", targetProfile.id)
            .eq("organization_id", organization_id);

        const { data: existingMembership } = project_id
            ? await memberQuery.eq("project_id", project_id).maybeSingle()
            : await memberQuery.is("project_id", null).maybeSingle();

        if (existingMembership?.status === "active") {
            return ApiErrors.conflict("This user is already an active member");
        }

        // ── 4. Role hierarchy ceiling ─────────────────────────────────────
        const { data: targetRole } = await serverFromTable(supabase, "roles")
            .select("id, name, hierarchy_level")
            .eq("id", role_id)
            .single();

        if (!targetRole) {
            return ApiErrors.badRequest("Invalid role_id — role does not exist");
        }

        const callerLevel = await resolveCallerHierarchyLevel(supabase, user.id, organization_id);
        if (targetRole.hierarchy_level !== null && targetRole.hierarchy_level < callerLevel) {
            return ApiErrors.forbidden(
                `Cannot assign role "${targetRole.name}" — it outranks your current role`
            );
        }

        // ── 5. Create or update membership ────────────────────────────────
        const { data: membership, error: memberError } = await serverFromTable(
            supabase,
            "org_memberships"
        )
            .upsert(
                {
                    user_id: targetProfile.id,
                    organization_id,
                    project_id: project_id ?? null,
                    role_id,
                    role: "member", // legacy text-role column
                    status: "active",
                    is_default_org: false,
                    joined_via: "manual_add",
                    invited_by: user.id,
                    joined_at: new Date().toISOString(),
                },
                { onConflict: "user_id,organization_id" }
            )
            .select("id")
            .single();

        if (memberError || !membership) {
            return ApiErrors.internalError("Failed to add member");
        }

        // ── 6. Notify the added user (non-blocking) ──────────────────────
        const { data: org } = await serverFromTable(supabase, "organizations")
            .select("name")
            .eq("id", organization_id)
            .single();

        void serverFromTable(supabase, "notifications")
            .insert({
                user_id: targetProfile.id,
                target_user_id: targetProfile.id,
                title: "You have been added to an organization",
                message: `You have been added to ${org?.name ?? "an organization"} as ${targetRole.name}.`,
                type: "info",
            })
            .then(() => {
                /* non-blocking */
            });

        return NextResponse.json(
            {
                membership_id: membership.id,
                user_id: targetProfile.id,
                organization_id,
                role: targetRole.name,
                joined_via: "manual_add",
            },
            { status: 201 }
        );
    }
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function resolveCanInvite(
    supabase: Parameters<typeof serverFromTable>[0],
    userId: string,
    orgId: string
): Promise<boolean> {
    const { data } = await serverFromTable(supabase, "org_memberships")
        .select("role, roles(can_invite)")
        .eq("user_id", userId)
        .eq("organization_id", orgId)
        .eq("status", "active")
        .maybeSingle();

    if (!data) return false;
    const r = data.roles as unknown as { can_invite: boolean } | null;
    if (r) return r.can_invite;
    return ["exec", "director", "pm"].includes(data.role ?? "");
}

async function resolveCallerHierarchyLevel(
    supabase: Parameters<typeof serverFromTable>[0],
    userId: string,
    orgId: string
): Promise<number> {
    const { data } = await serverFromTable(supabase, "org_memberships")
        .select("role, roles(hierarchy_level)")
        .eq("user_id", userId)
        .eq("organization_id", orgId)
        .eq("status", "active")
        .maybeSingle();

    if (!data) return 99;
    const r = data.roles as unknown as { hierarchy_level: number | null } | null;
    if (r?.hierarchy_level != null) return r.hierarchy_level;
    const map: Record<string, number> = {
        exec: 1,
        director: 2,
        pm: 3,
        member: 4,
        client: 5,
        collaborator: 6,
    };
    return map[data.role ?? ""] ?? 99;
}
