/**
 * POST /api/join-requests/review
 *
 * HARBOR-MASTER §6.6 — Approve or deny a join request.
 */

import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { z } from "zod";

const reviewSchema = z.object({
    join_request_id: z.string().uuid(),
    action: z.enum(["approve", "deny"]),
    deny_reason: z.string().max(1000).optional(),
    role_id: z.string().uuid().optional(),
});

export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/join-requests/review",
        mutation: true,
    },
    async (request, { supabase, user }) => {
        const body: unknown = await request.json();
        const parsed = reviewSchema.safeParse(body);
        if (!parsed.success) {
            return ApiErrors.badRequest(parsed.error.issues[0]?.message ?? "Invalid payload");
        }
        const { join_request_id, action, deny_reason, role_id: overrideRoleId } = parsed.data;

        // ── 1. Fetch join request ──────────────────────────────────────────
        const { data: joinRequest } = await serverFromTable(supabase, "join_requests")
            .select("id, user_id, organization_id, project_id, status")
            .eq("id", join_request_id)
            .single();

        if (!joinRequest) return ApiErrors.notFound("Join request");

        if (joinRequest.status !== "pending") {
            return ApiErrors.conflict(`This join request has already been ${joinRequest.status}`);
        }

        // ── 2. Caller must have can_approve_requests permission ────────────
        const canApprove = await resolveCanApprove(supabase, user.id, joinRequest.organization_id);
        if (!canApprove) {
            return ApiErrors.forbidden(
                "Your role does not have permission to review join requests"
            );
        }

        // ── 3. If approve: validate role_id ceiling ────────────────────────
        if (action === "approve") {
            // Resolve org's default_member_role_id → fall back to 'member' text role
            let assignRoleId: string | null = overrideRoleId ?? null;

            if (!assignRoleId) {
                const { data: org } = await serverFromTable(supabase, "organizations")
                    .select("default_member_role_id")
                    .eq("id", joinRequest.organization_id)
                    .single();
                assignRoleId = org?.default_member_role_id ?? null;
            }

            // Role hierarchy ceiling check if override provided
            if (overrideRoleId) {
                const { data: targetRole } = await serverFromTable(supabase, "roles")
                    .select("hierarchy_level, name")
                    .eq("id", overrideRoleId)
                    .single();

                if (!targetRole) return ApiErrors.badRequest("Invalid role_id override");

                const callerLevel = await resolveCallerHierarchyLevel(
                    supabase,
                    user.id,
                    joinRequest.organization_id
                );

                if (
                    targetRole.hierarchy_level !== null &&
                    targetRole.hierarchy_level < callerLevel
                ) {
                    return ApiErrors.forbidden(
                        `Cannot assign role "${targetRole.name}" — it outranks your role`
                    );
                }
            }

            // Create membership
            const { data: membership, error: memberError } = await serverFromTable(
                supabase,
                "org_memberships"
            )
                .upsert(
                    {
                        user_id: joinRequest.user_id,
                        organization_id: joinRequest.organization_id,
                        project_id: joinRequest.project_id ?? null,
                        role_id: assignRoleId,
                        role: "member", // legacy text-role fallback
                        status: "active",
                        is_default_org: false,
                        joined_via: "join_request",
                        approved_by: user.id,
                        joined_at: new Date().toISOString(),
                    },
                    { onConflict: "user_id,organization_id" }
                )
                .select("id")
                .single();

            if (memberError || !membership) {
                return ApiErrors.internalError("Failed to create membership");
            }

            // Update join request
            await serverFromTable(supabase, "join_requests")
                .update({
                    status: "approved",
                    reviewed_by: user.id,
                    reviewed_at: new Date().toISOString(),
                })
                .eq("id", join_request_id);

            return NextResponse.json({
                action: "approved",
                membership_id: membership.id,
                join_request_id,
            });
        }

        // ── 4. Deny ────────────────────────────────────────────────────────
        await serverFromTable(supabase, "join_requests")
            .update({
                status: "denied",
                reviewed_by: user.id,
                reviewed_at: new Date().toISOString(),
                deny_reason: deny_reason ?? null,
            })
            .eq("id", join_request_id);

        return NextResponse.json({
            action: "denied",
            join_request_id,
            deny_reason: deny_reason ?? null,
        });
    }
);

/**
 * GET /api/join-requests/review
 * Returns pending join requests for orgs where caller has can_approve_requests.
 */
export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/join-requests/review",
    },
    async (request, { supabase, user }) => {
        const url = new URL(request.url);
        const orgId = url.searchParams.get("organization_id");
        const status = url.searchParams.get("status") ?? "pending";

        // Get orgs where user has approve permission
        const { data: memberships } = await serverFromTable(supabase, "org_memberships")
            .select("organization_id, role")
            .eq("user_id", user.id)
            .eq("status", "active")
            .in("role", ["exec", "director", "pm"]);

        const approverOrgIds = orgId
            ? [orgId]
            : ((memberships as Array<{ organization_id: string }> | null)?.map(
                  (m) => m.organization_id
              ) ?? []);

        if (approverOrgIds.length === 0) {
            return NextResponse.json({ join_requests: [] });
        }

        const { data, error } = await serverFromTable(supabase, "join_requests")
            .select(
                "id, user_id, organization_id, project_id, status, requested_at, " +
                    "reviewed_at, deny_reason, " +
                    "user_profiles(id, display_name, email, avatar_url), " +
                    "organizations(id, name, slug)"
            )
            .in("organization_id", approverOrgIds)
            .eq("status", status)
            .order("requested_at", { ascending: true });

        if (error) return ApiErrors.internalError("Failed to fetch join requests");

        return NextResponse.json({ join_requests: data ?? [] });
    }
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function resolveCanApprove(
    supabase: Parameters<typeof serverFromTable>[0],
    userId: string,
    orgId: string
): Promise<boolean> {
    const { data } = await serverFromTable(supabase, "org_memberships")
        .select("role, roles(can_approve_requests)")
        .eq("user_id", userId)
        .eq("organization_id", orgId)
        .eq("status", "active")
        .maybeSingle();

    if (!data) return false;
    const r = data.roles as unknown as { can_approve_requests: boolean } | null;
    if (r) return r.can_approve_requests;
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
