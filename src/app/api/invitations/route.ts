import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseAndValidate, ApiErrors } from "@/lib/api-utils";
import { invitationCreateSchema } from "@/lib/validation/schemas";
import { randomBytes } from "crypto";

export async function POST(request: Request) {
    const supabase = await createClient();
    if (!supabase) {
        return ApiErrors.serviceUnavailable();
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return ApiErrors.unauthorized();
    }

    // Validate request body with Zod
    const parsed = await parseAndValidate(request, invitationCreateSchema);
    if (!parsed.success) return parsed.response;

    const { invitees, organization_id, message } = parsed.data;

    // Verify the inviter has permission (exec or pm)
    const { data: membership } = await supabase.from("org_memberships")
        .select("role")
        .eq("user_id", user.id)
        .eq("organization_id", organization_id)
        .eq("status", "active")
        .single();

    if (!membership || !["exec", "pm"].includes(membership.role)) {
        return ApiErrors.forbidden("Insufficient permissions to invite users");
    }

    // Fetch org name for email content
    const { data: org } = await supabase.from("organizations")
        .select("name")
        .eq("id", organization_id)
        .single();

    const orgName = org?.name || "your organization";
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const invitations = invitees.map((invitee: { email: string; role: string }) => ({
        email: invitee.email.trim().toLowerCase(),
        organization_id,
        role: invitee.role,
        invited_by: user.id,
        token: randomBytes(32).toString("base64url"),
        status: "pending" as const,
        expires_at: expiresAt,
        personal_message: message || null,
    }));

    const { data, error } = await supabase.from("invitations")
        .insert(invitations)
        .select("id, email, role, expires_at, token");

    if (error) {
        return ApiErrors.internalError("Failed to create invitations");
    }

    // Send invitation emails (fire-and-forget — don't block the response)
    if (data) {
        const baseUrl = request.headers.get("origin") || request.headers.get("x-forwarded-host") || "";
        const protocol = request.headers.get("x-forwarded-proto") || "https";
        const appUrl = baseUrl.startsWith("http") ? baseUrl : `${protocol}://${baseUrl}`;

        Promise.allSettled(
            data.map(async (inv: { email: string; token: string; role: string }) => {
                try {
                    await fetch(`${appUrl}/api/invitations/send-email`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            to: inv.email,
                            token: inv.token,
                            role: inv.role,
                            orgName,
                            personalMessage: message || null,
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const safeData = (data || []).map(({ token: _t, ...rest }: { token: string; [key: string]: unknown }) => rest);
    return NextResponse.json({ invitations: safeData }, { status: 201 });
}
