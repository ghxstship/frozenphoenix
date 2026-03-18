/* ═══════════════════════════════════════════════════════════════
   AUTH AUDIT — Client-side helper to write login_audit_log entries
   
   Calls POST /api/auth/log-event (fire-and-forget).
   Never throws — audit logging must not break auth flows.
   ═══════════════════════════════════════════════════════════════ */

type LoginEventType =
    | "login_success"
    | "login_failure"
    | "logout"
    | "token_refresh"
    | "password_reset_request"
    | "password_reset_complete"
    | "mfa_challenge"
    | "mfa_success"
    | "mfa_failure"
    | "api_token_auth"
    | "session_revoked"
    | "account_locked"
    | "org_security_updated";

export function logAuthEvent(
    eventType: LoginEventType,
    metadata?: Record<string, unknown>,
    options?: { errorCode?: string; organizationId?: string }
): void {
    try {
        fetch("/api/auth/log-event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                event_type: eventType,
                metadata: metadata ?? {},
                error_code: options?.errorCode,
                organization_id: options?.organizationId,
            }),
            // Fire-and-forget — do not block the caller
            keepalive: true,
        }).catch(() => {
            // Swallow — audit must never break auth
        });
    } catch {
        // Swallow
    }
}
