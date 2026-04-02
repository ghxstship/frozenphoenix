import { NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandlerParams } from "@/lib/api/with-api-handler";

export const POST = withApiHandlerParams(
    {
        method: "POST",
        route: "/api/invitations/[token]/accept",
        mutation: true,
        rbac: { resource: "invitations", action: "write" },
    },
    async (_request, { supabase, user }, { params }) => {
        const { token } = await params;

        // Find the invitation
        const { data: invitation, error: invError } = await serverFromTable(supabase, "invitations")
            .select(
                "id, token, email, invited_email, role, role_id, status, expires_at, invite_type, organization_id, project_id, invited_by, accepted_by, accepted_at"
            )
            .eq("token", token)
            .single();

        if (invError || !invitation) {
            return ApiErrors.notFound("Invitation");
        }

        // Validate invitation state
        if (invitation.status !== "pending") {
            return ApiErrors.gone(
                invitation.status === "accepted"
                    ? "This invitation has already been accepted"
                    : "This invitation is no longer valid"
            );
        }

        if (new Date(invitation.expires_at) < new Date()) {
            // Mark as expired
            await serverFromTable(supabase, "invitations")
                .update({ status: "expired" })
                .eq("id", invitation.id);

            return ApiErrors.gone("This invitation has expired");
        }

        // ── HARBOR-MASTER §6.2: STRICT email mismatch check ──────────────
        // For org_invites, the authenticated user's email MUST match invited_email.
        // No overrides. This is the security gate.
        const isReferral = invitation.invite_type === "referral" || !invitation.organization_id;
        if (!isReferral) {
            const canonicalInvitedEmail = (invitation.invited_email ?? invitation.email)
                .toLowerCase()
                .trim();
            const authenticatedEmail = (user.email ?? "").toLowerCase().trim();

            if (!authenticatedEmail || canonicalInvitedEmail !== authenticatedEmail) {
                return NextResponse.json(
                    {
                        error: "Email mismatch",
                        message:
                            "This invitation was sent to a different email address. " +
                            "Please sign in with the account that matches the invited email.",
                    },
                    { status: 403 }
                );
            }
        }

        if (!isReferral && invitation.organization_id) {
            // Check not already an active member
            const memberQuery = serverFromTable(supabase, "org_memberships")
                .select("id, status")
                .eq("user_id", user.id)
                .eq("organization_id", invitation.organization_id);

            const { data: existingMember } = invitation.project_id
                ? await memberQuery.eq("project_id", invitation.project_id).maybeSingle()
                : await memberQuery.is("project_id", null).maybeSingle();

            if (existingMember?.status === "active") {
                // Mark invitation accepted for UX, then return success
                await serverFromTable(supabase, "invitations")
                    .update({
                        status: "accepted",
                        accepted_by: user.id,
                        accepted_at: new Date().toISOString(),
                    })
                    .eq("id", invitation.id);

                return NextResponse.json({
                    success: true,
                    invite_type: "org_invite",
                    organization_id: invitation.organization_id,
                    already_member: true,
                });
            }

            // Create org membership
            const { error: memberError } = await serverFromTable(
                supabase,
                "org_memberships"
            ).upsert(
                {
                    user_id: user.id,
                    organization_id: invitation.organization_id,
                    project_id: invitation.project_id ?? null,
                    role_id: invitation.role_id ?? null,
                    role: invitation.role ?? "member",
                    status: "active",
                    is_default_org: false,
                    is_owner: false,
                    joined_via: "direct_invite",
                    invited_by: invitation.invited_by ?? null,
                    joined_at: new Date().toISOString(),
                },
                { onConflict: "user_id,organization_id" }
            );

            if (memberError) {
                return ApiErrors.internalError("Failed to join organization");
            }
        }

        // Mark invitation as accepted
        await serverFromTable(supabase, "invitations")
            .update({
                status: "accepted",
                accepted_by: user.id,
                accepted_at: new Date().toISOString(),
            })
            .eq("id", invitation.id);

        return NextResponse.json({
            success: true,
            invite_type: isReferral ? "referral" : "org_invite",
            organization_id: invitation.organization_id || null,
        });
    }
);

export const GET = withApiHandlerParams(
    {
        method: "GET",
        route: "/api/invitations/[token]/accept",
        skipAuth: true,
    },
    async (_request, _ctx, { params }) => {
        const { token } = await params;

        // Public endpoint — returns invitation details without requiring auth
        const supabase = await createClient();
        if (!supabase) return ApiErrors.serviceUnavailable();

        const { data: invitation, error } = await serverFromTable(supabase, "invitations")
            .select(
                "invited_email, email, role, status, expires_at, personal_message, organizations(id, name, slug)"
            )
            .eq("token", token)
            .single();

        if (error || !invitation) {
            return ApiErrors.notFound("Invitation");
        }

        if (invitation.status !== "pending") {
            return ApiErrors.gone(
                invitation.status === "accepted"
                    ? "This invitation has already been accepted"
                    : "This invitation is no longer valid"
            );
        }

        if (new Date(invitation.expires_at) < new Date()) {
            return ApiErrors.gone("This invitation has expired");
        }

        return NextResponse.json({
            invitation: {
                ...invitation,
                invited_email: invitation.invited_email ?? invitation.email,
            },
        });
    }
);
