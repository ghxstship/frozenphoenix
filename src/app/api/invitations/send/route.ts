/**
 * POST /api/invitations/send
 *
 * HARBOR-MASTER §6.1 — Direct Invitation (Flow A).
 * Server-side validation: membership check, can_invite permission,
 * role hierarchy ceiling, duplicate check, email delivery.
 */

import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { randomBytes } from "crypto";
import { z } from "zod";

const sendSchema = z.object({
    organization_id: z.string().uuid(),
    project_id: z.string().uuid().optional(),
    invited_email: z.string().email().toLowerCase(),
    role_id: z.string().uuid(),
    message: z.string().max(1000).optional(),
});

export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/invitations/send",
        mutation: true,
    },
    async (request, { supabase, user }) => {
        const body: unknown = await request.json();
        const parsed = sendSchema.safeParse(body);
        if (!parsed.success) {
            return ApiErrors.badRequest(parsed.error.issues[0]?.message ?? "Invalid payload");
        }
        const { organization_id, project_id, invited_email, role_id, message } = parsed.data;

        // ── 1. Caller must have active membership ──────────────────────────
        const { data: callerMembership } = await serverFromTable(supabase, "org_memberships")
            .select("role, role_id, status")
            .eq("user_id", user.id)
            .eq("organization_id", organization_id)
            .eq("status", "active")
            .limit(1)
            .single();

        if (!callerMembership) {
            return ApiErrors.forbidden("You are not a member of this organization");
        }

        // ── 2. Caller must have can_invite permission ───────────────────────
        // Check via role_id FK first, fall back to text-role check
        const canInvite = await resolveCanInvite(supabase, user.id, organization_id);
        if (!canInvite) {
            return ApiErrors.forbidden("Your role does not have permission to send invitations");
        }

        // ── 3. Resolve invited role and check hierarchy ceiling ────────────
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

        // ── 4. Check no existing active membership for invitee ─────────────
        const { data: existingMembership } = await serverFromTable(supabase, "org_memberships")
            .select("id, status")
            .eq("organization_id", organization_id)
            .eq("status", "active")
            .limit(1)
            .maybeSingle();

        // Check by joining user_profiles on email
        const { data: inviteeProfile } = await serverFromTable(supabase, "user_profiles")
            .select("id")
            .eq("email", invited_email)
            .maybeSingle();

        if (inviteeProfile && existingMembership) {
            const { data: activeMember } = await serverFromTable(supabase, "org_memberships")
                .select("id")
                .eq("user_id", inviteeProfile.id)
                .eq("organization_id", organization_id)
                .eq("status", "active")
                .maybeSingle();

            if (activeMember) {
                return ApiErrors.conflict(
                    "This user is already an active member of this organization"
                );
            }
        }

        // ── 5. Check no existing pending invitation ───────────────────────
        const duplicateQuery = serverFromTable(supabase, "invitations")
            .select("id")
            .eq("status", "pending")
            .eq("organization_id", organization_id);

        const { data: duplicateInvite } = project_id
            ? await duplicateQuery
                  .eq("project_id", project_id)
                  .ilike("invited_email", invited_email)
                  .maybeSingle()
            : await duplicateQuery
                  .is("project_id", null)
                  .ilike("invited_email", invited_email)
                  .maybeSingle();

        if (duplicateInvite) {
            return ApiErrors.conflict(
                "A pending invitation already exists for this email in this scope"
            );
        }

        // ── 6. Fetch org for email content + expiry ────────────────────────
        const { data: org } = await serverFromTable(supabase, "organizations")
            .select("name, invitation_expiry_days")
            .eq("id", organization_id)
            .single();

        const expiryDays = org?.invitation_expiry_days ?? 7;
        const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString();
        const token = randomBytes(32).toString("base64url");

        // ── 7. Insert invitation ───────────────────────────────────────────
        const { data: invitation, error: insertError } = await serverFromTable(
            supabase,
            "invitations"
        )
            .insert({
                organization_id,
                project_id: project_id ?? null,
                email: invited_email,
                invited_email,
                role: "member", // legacy text-role column compatibility
                role_id,
                invite_type: "org_invite",
                invited_by: user.id,
                token,
                status: "pending",
                expires_at: expiresAt,
                personal_message: message ?? null,
            })
            .select("id, expires_at")
            .single();

        if (insertError || !invitation) {
            return ApiErrors.internalError("Failed to create invitation");
        }

        // ── 8. Fire transactional email (non-blocking) ────────────────────
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://atlvs.one";
        void sendInviteEmail({
            to: invited_email,
            token,
            orgName: org?.name ?? "your organization",
            roleName: targetRole.name,
            personalMessage: message,
            appUrl,
        });

        return NextResponse.json(
            { invitation_id: invitation.id, expires_at: invitation.expires_at },
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
    // Try role_id-linked permission first
    const { data: withRoleLink } = await serverFromTable(supabase, "org_memberships")
        .select("roles!inner(can_invite)")
        .eq("user_id", userId)
        .eq("organization_id", orgId)
        .eq("status", "active")
        .maybeSingle();

    if (withRoleLink) {
        const roles = withRoleLink.roles as unknown as { can_invite: boolean } | null;
        if (roles) return roles.can_invite;
    }

    // Fallback: text-role check
    const { data: membership } = await serverFromTable(supabase, "org_memberships")
        .select("role")
        .eq("user_id", userId)
        .eq("organization_id", orgId)
        .eq("status", "active")
        .maybeSingle();

    return ["exec", "director", "pm"].includes(membership?.role ?? "");
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

    const roleHierarchy = data.roles as unknown as { hierarchy_level: number | null } | null;
    if (roleHierarchy?.hierarchy_level != null) return roleHierarchy.hierarchy_level;

    const textFallback: Record<string, number> = {
        exec: 1,
        director: 2,
        pm: 3,
        member: 4,
        client: 5,
        collaborator: 6,
    };
    return textFallback[data.role ?? ""] ?? 99;
}

async function sendInviteEmail(params: {
    to: string;
    token: string;
    orgName: string;
    roleName: string;
    personalMessage: string | undefined;
    appUrl: string;
}): Promise<void> {
    try {
        await fetch(`${params.appUrl}/api/invitations/send-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                to: params.to,
                token: params.token,
                role: params.roleName,
                orgName: params.orgName,
                personalMessage: params.personalMessage ?? null,
                inviteType: "org_invite",
                appUrl: params.appUrl,
            }),
        });
    } catch {
        // Email delivery failure is non-blocking — invitation row is already created
    }
}
