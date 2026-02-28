import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fromTable = (sb: SupabaseClient, table: string) => (sb as any).from(table);

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;
    const supabase = await createClient();
    if (!supabase) {
        return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the invitation
    const { data: invitation, error: invError } = await fromTable(supabase, "invitations")
        .select("*")
        .eq("token", token)
        .single();

    if (invError || !invitation) {
        return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    // Validate invitation state
    if (invitation.status !== "pending") {
        return NextResponse.json({
            error: invitation.status === "accepted"
                ? "This invitation has already been accepted"
                : "This invitation is no longer valid",
        }, { status: 410 });
    }

    if (new Date(invitation.expires_at) < new Date()) {
        // Mark as expired
        await fromTable(supabase, "invitations")
            .update({ status: "expired" })
            .eq("id", invitation.id);

        return NextResponse.json({ error: "This invitation has expired" }, { status: 410 });
    }

    // Create org membership
    const { error: memberError } = await fromTable(supabase, "org_memberships")
        .upsert(
            {
                user_id: user.id,
                organization_id: invitation.organization_id,
                role: invitation.role,
                status: "active",
                is_default: false,
            },
            { onConflict: "user_id,organization_id" }
        );

    if (memberError) {
        return NextResponse.json({ error: "Failed to join organization" }, { status: 500 });
    }

    // Mark invitation as accepted
    await fromTable(supabase, "invitations")
        .update({
            status: "accepted",
            accepted_by: user.id,
            accepted_at: new Date().toISOString(),
        })
        .eq("id", invitation.id);

    // Update profile org_id if user has no org yet
    const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

    if (profile && !profile.organization_id) {
        await supabase
            .from("profiles")
            .update({ organization_id: invitation.organization_id })
            .eq("id", user.id);
    }

    return NextResponse.json({
        success: true,
        organization_id: invitation.organization_id,
    });
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;
    const supabase = await createClient();
    if (!supabase) {
        return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    // Public endpoint — returns invitation details without requiring auth
    const { data: invitation, error } = await fromTable(supabase, "invitations")
        .select("email, role, status, expires_at, personal_message, organizations(id, name, slug)")
        .eq("token", token)
        .single();

    if (error || !invitation) {
        return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    if (invitation.status !== "pending") {
        return NextResponse.json({
            error: invitation.status === "accepted"
                ? "This invitation has already been accepted"
                : "This invitation is no longer valid",
            status: invitation.status,
        }, { status: 410 });
    }

    if (new Date(invitation.expires_at) < new Date()) {
        return NextResponse.json({ error: "This invitation has expired", status: "expired" }, { status: 410 });
    }

    return NextResponse.json({ invitation });
}
