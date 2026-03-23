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
                "id, token, email, role, status, expires_at, invite_type, organization_id, accepted_by, accepted_at"
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

        // Referral invites: just mark as accepted — no org membership needed
        const isReferral = invitation.invite_type === "referral" || !invitation.organization_id;

        if (!isReferral && invitation.organization_id) {
            // Create org membership for org invites
            const { error: memberError } = await serverFromTable(
                supabase,
                "org_memberships"
            ).upsert(
                {
                    user_id: user.id,
                    organization_id: invitation.organization_id,
                    role: invitation.role ?? "member",
                    status: "active",
                    is_default_org: false,
                    is_owner: false,
                },
                { onConflict: "user_id,organization_id" }
            );

            if (memberError) {
                return ApiErrors.internalError("Failed to join organization");
            }

            // org_memberships upsert above already tracks user→org relationship (profiles table dropped)
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
                "email, role, status, expires_at, personal_message, organizations(id, name, slug)"
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

        return NextResponse.json({ invitation });
    }
);
