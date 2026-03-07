import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;
    const supabase = await createClient();
    if (!supabase) {
        return ApiErrors.serviceUnavailable();
    }

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return ApiErrors.unauthorized();
    }

    // Find the invitation
    const { data: invitation, error: invError } = await serverFromTable(supabase!, "invitations")
        .select("*")
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
        await serverFromTable(supabase!, "invitations").update({ status: "expired" }).eq("id", invitation.id);

        return ApiErrors.gone("This invitation has expired");
    }

    // Referral invites: just mark as accepted — no org membership needed
    const isReferral = invitation.invite_type === "referral" || !invitation.organization_id;

    if (!isReferral && invitation.organization_id) {
        // Create org membership for org invites
        const { error: memberError } = await serverFromTable(supabase!, "org_memberships").upsert(
            {
                user_id: user.id,
                organization_id: invitation.organization_id,
                role: invitation.role ?? "member",
                status: "active",
                is_default_org: false,
            },
            { onConflict: "user_id,organization_id" }
        );

        if (memberError) {
            return ApiErrors.internalError("Failed to join organization");
        }

        // Update profile org_id if user has no org yet
        const { data: profile } = await serverFromTable(supabase!, "profiles")
            .select("organization_id")
            .eq("id", user.id)
            .single();

        if (profile && !profile.organization_id) {
            await serverFromTable(supabase!, "profiles")
                .update({ organization_id: invitation.organization_id })
                .eq("id", user.id);
        }
    }

    // Mark invitation as accepted
    await serverFromTable(supabase!, "invitations")
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

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;
    const supabase = await createClient();
    if (!supabase) {
        return ApiErrors.serviceUnavailable();
    }

    // Public endpoint — returns invitation details without requiring auth
    const { data: invitation, error } = await serverFromTable(supabase!, "invitations")
        .select("email, role, status, expires_at, personal_message, organizations(id, name, slug)")
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
