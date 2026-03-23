import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { invitationCreateSchema } from "@/lib/validation/schemas";
import { hasPermission } from "@/config/rbac";
import { ROLE_HIERARCHY } from "@/lib/permissions/field-resolver";
import type { PermissionLevel } from "@/types";
import { randomBytes } from "crypto";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/invitations",
        mutation: true,
    },
    async (request, { supabase, user }) => {
        // Validate request body with Zod
        const parsed = await parseAndValidate(request, invitationCreateSchema);
        if (!parsed.success) return parsed.response;

        const { invite_type, invitees, organization_id, message, referral_code } = parsed.data;

        // ── Referral invites: any authenticated user can send ──
        if (invite_type === "referral") {
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

            const invitations = invitees.map((invitee: { email: string; role?: string }) => ({
                email: invitee.email.trim().toLowerCase(),
                organization_id: null,
                role: null,
                invite_type: "referral" as const,
                invited_by: user.id,
                token: randomBytes(32).toString("base64url"),
                referral_code: referral_code || null,
                status: "pending" as const,
                expires_at: expiresAt,
                personal_message: message || null,
            }));

            const { data, error } = await serverFromTable(supabase, "invitations")
                .insert(invitations)
                .select("id, email, invite_type, expires_at, token");

            if (error) {
                return ApiErrors.internalError("Failed to create referral invitations");
            }

            return sendInviteEmails(data, null, message, invite_type);
        }

        // ── Org invites: verify membership + RBAC + role escalation ──
        if (!organization_id) {
            return ApiErrors.forbidden("Organization is required for org invites");
        }

        const { data: membership } = await serverFromTable(supabase, "org_memberships")
            .select("role")
            .eq("user_id", user.id)
            .eq("organization_id", organization_id)
            .eq("status", "active")
            .single();

        if (!membership) {
            return ApiErrors.forbidden("You are not a member of this organization");
        }

        const inviterRole = membership.role as PermissionLevel;

        // Check RBAC permission matrix (declarative, not hardcoded)
        if (!hasPermission(inviterRole, "invitations", "write")) {
            return ApiErrors.forbidden("Your role does not have permission to send invitations");
        }

        // Role escalation prevention: can only invite at your level or below
        const inviterLevel = ROLE_HIERARCHY[inviterRole] ?? 0;
        for (const invitee of invitees) {
            const inviteeRole = (invitee.role || "member") as PermissionLevel;
            const inviteeLevel = ROLE_HIERARCHY[inviteeRole] ?? 0;
            if (inviteeLevel > inviterLevel) {
                return ApiErrors.forbidden(
                    `Cannot invite someone as "${inviteeRole}" — your "${inviterRole}" role ` +
                        `can only invite at your level or below`
                );
            }
        }

        // Fetch org name for email content
        const { data: org } = await serverFromTable(supabase, "organizations")
            .select("name")
            .eq("id", organization_id)
            .single();

        const orgName = org?.name || "your organization";
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        const invitations = invitees.map((invitee: { email: string; role?: string }) => ({
            email: invitee.email.trim().toLowerCase(),
            organization_id,
            role: invitee.role || "member",
            invite_type: "org_invite" as const,
            invited_by: user.id,
            token: randomBytes(32).toString("base64url"),
            status: "pending" as const,
            expires_at: expiresAt,
            personal_message: message || null,
        }));

        const { data, error } = await serverFromTable(supabase, "invitations")
            .insert(invitations)
            .select("id, email, role, invite_type, expires_at, token");

        if (error) {
            return ApiErrors.internalError("Failed to create invitations");
        }

        return sendInviteEmails(data, orgName, message, invite_type);
    }
);

// ── Helper: send emails + return safe response ──────────────────────────
function sendInviteEmails(
    data: Array<{
        id: string;
        email: string;
        role?: string | null | undefined;
        token: string;
        invite_type?: string | undefined;
        [key: string]: unknown;
    }> | null,
    orgName: string | null,
    message: string | undefined,
    inviteType: string
) {
    if (data) {
        // Use trusted server-side env var — never derive URLs from user-controlled headers
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://atlvs.one";

        Promise.allSettled(
            data.map(async (inv) => {
                try {
                    await fetch(`${appUrl}/api/invitations/send-email`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            to: inv.email,
                            token: inv.token,
                            role: inv.role || null,
                            orgName: orgName || "the platform",
                            personalMessage: message || null,
                            inviteType,
                            appUrl,
                        }),
                    });
                } catch {
                    // Email delivery failure is non-blocking
                }
            })
        );
    }

    // Strip tokens from the response — they are delivered via email only
    const safeData = (data || []).map(
        ({ token: _stripToken, ...rest }: { token: string; [key: string]: unknown }) => {
            void _stripToken;
            return rest;
        }
    );
    return NextResponse.json({ invitations: safeData }, { status: 201 });
}
