import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: orgId } = await params;
    const supabase = await createClient();
    if (!supabase) {
        return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the user is exec in this org
    const { data: membership } = await supabase.from("org_memberships")
        .select("role")
        .eq("user_id", user.id)
        .eq("organization_id", orgId)
        .eq("status", "active")
        .single();

    if (!membership || membership.role !== "exec") {
        return NextResponse.json({ error: "Only executives can view security settings" }, { status: 403 });
    }

    const { data: org, error } = await supabase.from("organizations")
        .select(
            "id, name, slug, require_mfa, enforce_sso, sso_domain, allowed_email_domains, session_timeout_hours, max_sessions_per_user, invitation_expiry_days, default_role"
        )
        .eq("id", orgId)
        .single();

    if (error || !org) {
        return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json({ organization: org });
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: orgId } = await params;
    const supabase = await createClient();
    if (!supabase) {
        return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the user is exec in this org
    const { data: membership } = await supabase.from("org_memberships")
        .select("role")
        .eq("user_id", user.id)
        .eq("organization_id", orgId)
        .eq("status", "active")
        .single();

    if (!membership || membership.role !== "exec") {
        return NextResponse.json({ error: "Only executives can modify security settings" }, { status: 403 });
    }

    const body = await request.json();

    // Whitelist of allowed fields
    const allowedFields: Record<string, unknown> = {};
    if (typeof body.require_mfa === "boolean") allowedFields.require_mfa = body.require_mfa;
    if (typeof body.enforce_sso === "boolean") allowedFields.enforce_sso = body.enforce_sso;
    if (typeof body.sso_domain === "string") allowedFields.sso_domain = body.sso_domain || null;
    if (Array.isArray(body.allowed_email_domains)) allowedFields.allowed_email_domains = body.allowed_email_domains;
    if (typeof body.session_timeout_hours === "number" && body.session_timeout_hours >= 1) {
        allowedFields.session_timeout_hours = Math.min(body.session_timeout_hours, 8760); // max 1 year
    }
    if (typeof body.max_sessions_per_user === "number" && body.max_sessions_per_user >= 1) {
        allowedFields.max_sessions_per_user = Math.min(body.max_sessions_per_user, 50);
    }
    if (typeof body.invitation_expiry_days === "number" && body.invitation_expiry_days >= 1) {
        allowedFields.invitation_expiry_days = Math.min(body.invitation_expiry_days, 90);
    }
    if (typeof body.default_role === "string" && ["exec", "pm", "client", "vendor"].includes(body.default_role)) {
        allowedFields.default_role = body.default_role;
    }

    if (Object.keys(allowedFields).length === 0) {
        return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const { data: org, error } = await supabase.from("organizations")
        .update(allowedFields)
        .eq("id", orgId)
        .select(
            "id, name, slug, require_mfa, enforce_sso, sso_domain, allowed_email_domains, session_timeout_hours, max_sessions_per_user, invitation_expiry_days, default_role"
        )
        .single();

    if (error) {
        return NextResponse.json({ error: "Failed to update security settings" }, { status: 500 });
    }

    // Audit log the change
    try {
        await supabase.from("login_audit_log").insert({
            user_id: user.id,
            event_type: "org_security_updated",
            metadata: { organization_id: orgId, changes: Object.keys(allowedFields) } as unknown as Json,
        });
    } catch {
        // Non-blocking — audit table may not exist
    }

    return NextResponse.json({ organization: org });
}
