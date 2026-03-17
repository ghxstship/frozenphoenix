import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { sendEmailSchema } from "@/lib/validation/api-schemas";
import { withApiHandler } from "@/lib/api/with-api-handler";

const ROLE_LABELS: Record<string, string> = {
    exec: "Executive",
    director: "Director",
    pm: "Project Manager",
    member: "Team Member",
    client: "Client",
    collaborator: "Collaborator",
};

/**
 * Internal-only endpoint called by the invitations API to deliver
 * invitation emails via Supabase Auth's built-in email or a configured
 * SMTP/Resend provider.
 *
 * This route is NOT publicly documented — it is called server-to-server
 * by the POST /api/invitations handler after invitation rows are created.
 *
 * When no external email provider is configured, it falls back to
 * Supabase Auth admin.inviteUserByEmail which sends the built-in
 * invite email template. When RESEND_API_KEY is set, it sends a
 * branded HTML email via Resend.
 */
export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/invitations/send-email",
        mutation: true,
        skipAuth: true,
    },
    async (request, { log }) => {
        const supabase = await createClient();
        if (!supabase) {
            return ApiErrors.serviceUnavailable();
        }

        const validated = await parseAndValidate(request, sendEmailSchema);
        if (!validated.success) return validated.response;

        const { to, token, role, orgName, personalMessage, appUrl } = validated.data;

        const inviteUrl = `${appUrl}/invite/${token}`;
        const roleLabel = ROLE_LABELS[role] || role;

        // Strategy 1: Use Resend if configured
        if (process.env.RESEND_API_KEY) {
            try {
                const res = await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        from: process.env.RESEND_FROM_EMAIL || "Playbook <noreply@playbook.app>",
                        to: [to],
                        subject: `You're invited to join ${orgName}`,
                        html: buildInvitationEmail({
                            orgName,
                            roleLabel,
                            inviteUrl,
                            personalMessage,
                        }),
                    }),
                });

                if (!res.ok) {
                    const err = await res.text();
                    log.error("Resend email delivery error", { err });
                    return ApiErrors.badGateway("Email delivery failed");
                }

                return NextResponse.json({ sent: true });
            } catch (err) {
                log.error("Resend email delivery exception", { err });
                return ApiErrors.badGateway("Email delivery failed");
            }
        }

        // Strategy 2: Use Supabase Auth admin invite (sends Supabase's built-in email template)
        // This requires the service_role key and admin API access.
        // The invite will create the user if they don't exist, or send a magic link if they do.
        try {
            const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(to, {
                data: {
                    invite_token: token,
                    invited_role: role,
                    org_name: orgName,
                },
                redirectTo: inviteUrl,
            });

            if (inviteError) {
                // admin.inviteUserByEmail requires service_role — if we only have anon key,
                // fall back to logging the invite URL for development
                if (inviteError.message.includes("not authorized") || inviteError.status === 403) {
                    log.warn("No email provider configured — invite URL logged", { to, inviteUrl });
                    return NextResponse.json({
                        sent: false,
                        fallback: "logged",
                        message:
                            "No email provider configured. Invite URL logged to server console.",
                    });
                }
                log.error("Supabase invite error", { message: inviteError.message });
                return ApiErrors.badGateway("Email delivery failed");
            }

            return NextResponse.json({ sent: true });
        } catch {
            // Final fallback: log the invite URL
            log.warn("Email delivery unavailable — invite URL logged", { to, inviteUrl });
            return NextResponse.json({
                sent: false,
                fallback: "logged",
                message: "Invite URL logged to server console.",
            });
        }
    }
);

// ─── HTML Email Template ────────────────────────────────────────
function buildInvitationEmail(params: {
    orgName: string;
    roleLabel: string;
    inviteUrl: string;
    personalMessage: string | null;
}): string {
    const { orgName, roleLabel, inviteUrl, personalMessage } = params;

    const messageBlock = personalMessage
        ? `<div style="background:#f4f4f5;border-radius:8px;padding:16px;margin:16px 0;font-style:italic;color:#52525b;">&ldquo;${escapeHtml(personalMessage)}&rdquo;</div>`
        : "";

    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f9fafb;padding:40px 0;">
<tr><td align="center">
<table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

<tr><td style="padding:40px 40px 24px;text-align:center;">
  <div style="display:inline-block;padding:12px;background:#eff6ff;border-radius:12px;margin-bottom:16px;">
    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#2563eb" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
  </div>
  <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#09090b;">You're invited!</h1>
  <p style="margin:0;font-size:15px;color:#71717a;">Join <strong style="color:#09090b;">${escapeHtml(orgName)}</strong> as a <strong style="color:#09090b;">${escapeHtml(roleLabel)}</strong></p>
</td></tr>

${messageBlock ? `<tr><td style="padding:0 40px;">${messageBlock}</td></tr>` : ""}

<tr><td style="padding:24px 40px;" align="center">
  <a href="${escapeHtml(inviteUrl)}" style="display:inline-block;padding:12px 32px;background:#2563eb;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">
    Accept Invitation
  </a>
</td></tr>

<tr><td style="padding:0 40px 16px;">
  <p style="margin:0;font-size:13px;color:#a1a1aa;text-align:center;">
    Or copy this link: <a href="${escapeHtml(inviteUrl)}" style="color:#2563eb;word-break:break-all;">${escapeHtml(inviteUrl)}</a>
  </p>
</td></tr>

<tr><td style="padding:16px 40px 40px;border-top:1px solid #f4f4f5;">
  <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center;">
    This invitation expires in 7 days. If you didn't expect this email, you can safely ignore it.
  </p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
