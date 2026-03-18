/* ═══════════════════════════════════════════════════════════════
   EMAIL SEND SERVICE — Server-side only
   ═══════════════════════════════════════════════════════════════
   
   Shared email delivery abstraction used by:
   - Automation engine (send_email action)
   - Notification dispatch (notification→email pipeline)
   - Invitation emails (existing send-email route delegates here)
   
   Strategy priority:
   1. Resend (if RESEND_API_KEY is set)
   2. Console log fallback (dev mode)
   
   All callers get a deterministic { sent, fallback?, error? } result.
   ═══════════════════════════════════════════════════════════════ */

import { logger } from "@/lib/logger";

export interface SendEmailParams {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
    replyTo?: string;
}

export interface SendEmailResult {
    sent: boolean;
    fallback?: "logged";
    error?: string;
}

/**
 * Send an email via the configured provider.
 * Returns a result object — never throws.
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    const { to, subject, html, from, replyTo } = params;
    const recipients = Array.isArray(to) ? to : [to];

    // Strategy 1: Resend
    if (process.env.RESEND_API_KEY) {
        try {
            const body: Record<string, unknown> = {
                from: from || process.env.RESEND_FROM_EMAIL || "ATLVS <noreply@atlvs.io>",
                to: recipients,
                subject,
                html,
            };
            if (replyTo) body.reply_to = replyTo;

            const res = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const err = await res.text();
                logger.error("Resend delivery error", { err, to: recipients });
                return { sent: false, error: "Email delivery failed" };
            }

            return { sent: true };
        } catch (err) {
            logger.error("Resend delivery exception", { err, to: recipients });
            return { sent: false, error: "Email delivery failed" };
        }
    }

    // Strategy 2: Dev fallback — log to console
    logger.warn("No email provider configured — email logged", {
        to: recipients,
        subject,
    });
    return { sent: false, fallback: "logged" };
}

// ─── HTML Helpers ──────────────────────────────────────────────

export function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Wraps content in a branded email shell (responsive table layout).
 */
export function wrapEmailLayout(params: {
    title: string;
    preheader?: string;
    body: string;
    footer?: string;
}): string {
    const { title, preheader, body, footer } = params;

    const preheaderBlock = preheader
        ? `<div style="display:none;font-size:1px;color:#f9fafb;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(preheader)}</div>`
        : "";

    const footerBlock =
        footer ||
        `<p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center;">
            You received this email because you have an account on the platform.
            If you believe this was sent in error, you can safely ignore it.
        </p>`;

    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
${preheaderBlock}
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f9fafb;padding:40px 0;">
<tr><td align="center">
<table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

<tr><td style="padding:40px 40px 24px;">
${body}
</td></tr>

<tr><td style="padding:16px 40px 40px;border-top:1px solid #f4f4f5;">
${footerBlock}
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

/**
 * Build a simple transactional email (automation, notification, etc.)
 */
export function buildTransactionalEmail(params: {
    heading: string;
    message: string;
    ctaLabel?: string;
    ctaUrl?: string;
    footerNote?: string;
}): string {
    const { heading, message, ctaLabel, ctaUrl, footerNote } = params;

    const ctaBlock =
        ctaLabel && ctaUrl
            ? `<div style="text-align:center;padding:24px 0 8px;">
                <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;padding:12px 32px;background:#2563eb;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">
                    ${escapeHtml(ctaLabel)}
                </a>
            </div>`
            : "";

    const body = `
        <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#09090b;">${escapeHtml(heading)}</h1>
        <p style="margin:0;font-size:15px;line-height:1.6;color:#3f3f46;">${escapeHtml(message)}</p>
        ${ctaBlock}
    `;

    return wrapEmailLayout({
        title: heading,
        preheader: message.slice(0, 120),
        body,
        footer: footerNote
            ? `<p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center;">${escapeHtml(footerNote)}</p>`
            : undefined,
    });
}
