/* ═══════════════════════════════════════════════════════════════
   API REQUEST SCHEMAS — FIND-022 Remediation
   ═══════════════════════════════════════════════════════════════
   
   Zod schemas for all API routes that previously parsed
   request.json() without validation. Used with parseAndValidate()
   from api-utils.ts for consistent validation error responses.
   ═══════════════════════════════════════════════════════════════ */

import { z } from "zod";

// ─── POST /api/onboarding/progress ───────────────────────────
export const onboardingProgressSchema = z.object({
    step_definition_id: z.string().min(1, "step_definition_id is required"),
    status: z
        .enum(["not_started", "in_progress", "completed", "skipped"])
        .optional()
        .default("completed"),
});

// ─── POST /api/auth/log-event ────────────────────────────────
export const logEventSchema = z.object({
    event_type: z.enum([
        "login_success",
        "login_failure",
        "logout",
        "token_refresh",
        "password_reset_request",
        "password_reset_complete",
        "mfa_challenge",
        "mfa_success",
        "mfa_failure",
        "api_token_auth",
        "session_revoked",
        "account_locked",
        "org_security_updated",
    ]),
    metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

// ─── PATCH /api/organizations/[id]/security ──────────────────
export const orgSecurityPatchSchema = z
    .object({
        require_mfa: z.boolean().optional(),
        enforce_sso: z.boolean().optional(),
        sso_domain: z.string().nullable().optional(),
        allowed_email_domains: z.array(z.string()).optional(),
        session_timeout_hours: z.number().int().min(1).max(8760).optional(),
        max_sessions_per_user: z.number().int().min(1).max(50).optional(),
        invitation_expiry_days: z.number().int().min(1).max(90).optional(),
        default_role: z
            .enum(["exec", "director", "pm", "member", "client", "collaborator"])
            .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided",
    });

// ─── POST /api/billing/subscribe ─────────────────────────────
export const billingSubscribeSchema = z.object({
    pricing_tier: z.enum(["starter", "core", "team", "pro", "enterprise"]),
    billing_cycle: z.enum(["monthly", "annual"]),
});

// ─── POST /api/invitations/send-email ────────────────────────
export const sendEmailSchema = z.object({
    to: z.string().email("Valid email required"),
    token: z.string().min(1, "token is required"),
    role: z.string().min(1),
    orgName: z.string().min(1),
    personalMessage: z.string().nullable().default(null),
    appUrl: z.string().url("Valid URL required"),
});
