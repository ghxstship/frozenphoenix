import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandlerParams } from "@/lib/api/with-api-handler";

export const GET = withApiHandlerParams(
    {
        method: "GET",
        route: "/api/invitations/[token]/details",
        skipAuth: true,
    },
    async (_request, { log }, { params }) => {
        const { token } = await params;

        if (!token || typeof token !== "string" || token.length < 10) {
            return ApiErrors.badRequest("Invalid invitation token");
        }

        const admin = createAdminClient();
        if (!admin) return ApiErrors.serviceUnavailable();

        const { data: invitation, error: invError } = await admin
            .from("invitations")
            .select("id, invite_type, role, status, expires_at, organization_id, invited_by")
            .eq("token", token)
            .single();

        if (invError || !invitation) {
            log.info("Invitation not found", { token: token.slice(0, 8) + "…" });
            return ApiErrors.notFound("Invitation");
        }

        // Resolve organization name
        let organizationName: string | null = null;
        if (invitation.organization_id) {
            const { data: org } = await admin
                .from("organizations")
                .select("name")
                .eq("id", invitation.organization_id)
                .single();
            organizationName = org?.name ?? null;
        }

        // Resolve inviter display name
        let inviterName: string | null = null;
        if (invitation.invited_by) {
            const { data: inviter } = await admin
                .from("user_profiles")
                .select("display_name")
                .eq("id", invitation.invited_by)
                .single();
            inviterName = inviter?.display_name ?? null;
        }

        // Check expired status and auto-update if needed
        const isExpired = invitation.expires_at && new Date(invitation.expires_at) < new Date();
        if (isExpired && invitation.status === "pending") {
            await admin.from("invitations").update({ status: "expired" }).eq("id", invitation.id);
        }

        return NextResponse.json({
            id: invitation.id,
            invite_type: invitation.invite_type,
            role: invitation.role,
            status: isExpired && invitation.status === "pending" ? "expired" : invitation.status,
            expires_at: invitation.expires_at,
            inviter_name: inviterName,
            organization_name: organizationName,
        });
    }
);
