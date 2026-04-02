/**
 * POST /api/invite-codes/redeem
 *
 * HARBOR-MASTER §6.3 — Redeem an invite code (Flow B).
 * Full validation: code validity, depletion, approval gate, existing membership.
 */

import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { z } from "zod";

const redeemSchema = z.object({
    code: z.string().min(1).max(100).toUpperCase(),
});

export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/invite-codes/redeem",
        mutation: true,
    },
    async (request, { supabase, user }) => {
        const body: unknown = await request.json();
        const parsed = redeemSchema.safeParse(body);
        if (!parsed.success) {
            return ApiErrors.badRequest(parsed.error.issues[0]?.message ?? "Invalid payload");
        }
        const { code } = parsed.data;

        // ── 1. Fetch the invite code ───────────────────────────────────────
        const { data: inviteCode } = await serverFromTable(supabase, "invite_codes")
            .select(
                "id, code, organization_id, project_id, role_id, created_by, " +
                    "max_uses, current_uses, is_active, requires_approval, expires_at"
            )
            .eq("code", code)
            .maybeSingle();

        if (!inviteCode) {
            return ApiErrors.notFound("Invite code not found");
        }

        // ── 2. Code must be active ─────────────────────────────────────────
        if (!inviteCode.is_active) {
            return ApiErrors.gone("This invite code has been deactivated");
        }

        // ── 3. Expiry check ────────────────────────────────────────────────
        if (inviteCode.expires_at && new Date(inviteCode.expires_at) < new Date()) {
            return ApiErrors.gone("This invite code has expired");
        }

        // ── 4. Depletion check ─────────────────────────────────────────────
        if (inviteCode.max_uses !== null && inviteCode.current_uses >= inviteCode.max_uses) {
            return ApiErrors.gone("This invite code has reached its maximum number of uses");
        }

        // ── 5. Org invite_code_enabled ─────────────────────────────────────
        const { data: org } = await serverFromTable(supabase, "organizations")
            .select("invite_code_enabled, require_admin_approval")
            .eq("id", inviteCode.organization_id)
            .single();

        if (!org) return ApiErrors.notFound("Organization");
        if (org.invite_code_enabled === false) {
            return ApiErrors.forbidden("Invite codes are disabled for this organization");
        }

        // ── 6. Project invite_code_enabled (if project-scoped) ────────────
        let projectRequiresApproval = false;
        if (inviteCode.project_id) {
            const { data: project } = await serverFromTable(supabase, "projects")
                .select("invite_code_enabled, require_admin_approval")
                .eq("id", inviteCode.project_id)
                .single();

            if (!project) return ApiErrors.notFound("Project");
            if (project.invite_code_enabled === false) {
                return ApiErrors.forbidden("Invite codes are disabled for this project");
            }
            projectRequiresApproval = project.require_admin_approval === true;
        }

        // ── 7. User not already a member ──────────────────────────────────
        const existingQuery = serverFromTable(supabase, "org_memberships")
            .select("id, status")
            .eq("user_id", user.id)
            .eq("organization_id", inviteCode.organization_id);

        const { data: existingMembership } = inviteCode.project_id
            ? await existingQuery.eq("project_id", inviteCode.project_id).maybeSingle()
            : await existingQuery.is("project_id", null).maybeSingle();

        if (existingMembership && existingMembership.status === "active") {
            return ApiErrors.conflict("You are already a member of this organization");
        }

        // ── 8. User hasn't already redeemed this code ──────────────────────
        const { data: existingRedemption } = await serverFromTable(
            supabase,
            "invite_code_redemptions"
        )
            .select("id")
            .eq("invite_code_id", inviteCode.id)
            .eq("user_id", user.id)
            .maybeSingle();

        if (existingRedemption) {
            return ApiErrors.conflict("You have already redeemed this invite code");
        }

        // ── 9. Determine if approval is required ──────────────────────────
        const requiresApproval =
            inviteCode.requires_approval || org.require_admin_approval || projectRequiresApproval;

        if (requiresApproval) {
            // Create join_request (membership deferred)
            const { data: joinRequest, error: jrError } = await serverFromTable(
                supabase,
                "join_requests"
            )
                .insert({
                    user_id: user.id,
                    organization_id: inviteCode.organization_id,
                    project_id: inviteCode.project_id ?? null,
                    status: "pending",
                })
                .select("id")
                .single();

            if (jrError || !joinRequest) {
                return ApiErrors.internalError("Failed to create join request");
            }

            // Record redemption (no membership yet)
            await serverFromTable(supabase, "invite_code_redemptions").insert({
                invite_code_id: inviteCode.id,
                user_id: user.id,
                resulted_in_membership_id: null,
            });

            return NextResponse.json({
                status: "pending_approval",
                message: "Your request has been submitted and is pending admin approval",
                join_request_id: joinRequest.id,
            });
        }

        // ── 10. No approval required — create membership immediately ───────
        const { data: membership, error: memberError } = await serverFromTable(
            supabase,
            "org_memberships"
        )
            .upsert(
                {
                    user_id: user.id,
                    organization_id: inviteCode.organization_id,
                    project_id: inviteCode.project_id ?? null,
                    role_id: inviteCode.role_id,
                    role: "member", // legacy text-role fallback
                    status: "active",
                    is_default_org: false,
                    joined_via: "invite_code",
                    joined_at: new Date().toISOString(),
                },
                { onConflict: "user_id,organization_id" }
            )
            .select("id")
            .single();

        if (memberError || !membership) {
            return ApiErrors.internalError("Failed to create membership");
        }

        // ── 11. Record redemption with membership FK ───────────────────────
        const { error: redemptionError } = await serverFromTable(
            supabase,
            "invite_code_redemptions"
        ).insert({
            invite_code_id: inviteCode.id,
            user_id: user.id,
            resulted_in_membership_id: membership.id,
        });

        if (redemptionError) {
            return ApiErrors.internalError("Failed to record redemption");
        }

        // ── 12. Increment current_uses (optimistic — trigger handles notification) ──
        await serverFromTable(supabase, "invite_codes")
            .update({ current_uses: inviteCode.current_uses + 1 })
            .eq("id", inviteCode.id);

        return NextResponse.json({
            status: "active",
            membership_id: membership.id,
            organization_id: inviteCode.organization_id,
            project_id: inviteCode.project_id ?? null,
        });
    }
);
