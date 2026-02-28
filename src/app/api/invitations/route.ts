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

    const { emails, organization_id, role, message } = parsed.data;

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

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const invitations = emails.map((email: string) => ({
        email: email.trim().toLowerCase(),
        organization_id,
        role,
        invited_by: user.id,
        token: randomBytes(32).toString("base64url"),
        status: "pending" as const,
        expires_at: expiresAt,
        personal_message: message || null,
    }));

    const { data, error } = await supabase.from("invitations")
        .insert(invitations)
        .select("id, email, role, expires_at");

    if (error) {
        return ApiErrors.internalError("Failed to create invitations");
    }

    // SECURITY: tokens are intentionally excluded from the response.
    // Invitation tokens should only be delivered via email to the invitee.
    return NextResponse.json({ invitations: data }, { status: 201 });
}
