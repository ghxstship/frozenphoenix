import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fromTable = (sb: SupabaseClient, table: string) => (sb as any).from(table);

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) {
        return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { emails, organization_id, role, message } = body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return NextResponse.json({ error: "At least one email is required" }, { status: 400 });
    }

    if (!organization_id) {
        return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
    }

    // Verify the inviter has permission (exec or pm)
    const { data: membership } = await fromTable(supabase, "org_memberships")
        .select("role")
        .eq("user_id", user.id)
        .eq("organization_id", organization_id)
        .eq("status", "active")
        .single();

    if (!membership || !["exec", "pm"].includes(membership.role)) {
        return NextResponse.json({ error: "Insufficient permissions to invite users" }, { status: 403 });
    }

    const assignedRole = role || "pm";
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const invitations = emails.map((email: string) => ({
        email: email.trim().toLowerCase(),
        organization_id,
        role: assignedRole,
        invited_by: user.id,
        token: randomBytes(32).toString("base64url"),
        status: "pending",
        expires_at: expiresAt,
        personal_message: message || null,
    }));

    const { data, error } = await fromTable(supabase, "invitations")
        .insert(invitations)
        .select("id, email, role, token, expires_at");

    if (error) {
        return NextResponse.json({ error: "Failed to create invitations" }, { status: 500 });
    }

    return NextResponse.json({ invitations: data }, { status: 201 });
}
