/* ═══════════════════════════════════════════════════════════════
   AUTH ANALYTICS — Client-side event tracking for auth flows.
   Fires both to the server-side audit log and an optional
   analytics provider (e.g. PostHog, Segment, Amplitude).
   ═══════════════════════════════════════════════════════════════ */

export type AuthEvent =
    | "login"
    | "logout"
    | "signup"
    | "password_reset"
    | "password_change"
    | "mfa_enroll"
    | "mfa_verify"
    | "mfa_unenroll"
    | "invite_accepted"
    | "org_created"
    | "org_switched"
    | "profile_updated"
    | "failed_login"
    | "oauth_started"
    | "oauth_completed"
    | "onboarding_step_completed"
    | "onboarding_skipped";

interface AuthEventMetadata {
    [key: string]: string | number | boolean | null | undefined;
}

/**
 * Log an auth event to the server-side audit log.
 * Fire-and-forget — never blocks the UI or throws.
 */
export async function logAuthEvent(
    event: AuthEvent,
    metadata?: AuthEventMetadata
): Promise<void> {
    try {
        await fetch("/api/auth/log-event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ event_type: event, metadata: metadata || {} }),
        });
    } catch {
        // Fire-and-forget — never block the UI
    }
}

/**
 * Track an auth event with an external analytics provider.
 * This is a no-op stub. Replace the body with your provider's SDK call.
 *
 * Example for PostHog:
 *   posthog.capture(event, { ...metadata, category: "auth" });
 *
 * Example for Segment:
 *   analytics.track(event, { ...metadata, category: "auth" });
 */
export function trackAuthEvent(
    event: AuthEvent,
    metadata?: AuthEventMetadata
): void {
    if (typeof window === "undefined") return;

    // ─── External provider hook (replace with your SDK) ────────
    // posthog?.capture?.(event, { ...metadata, category: "auth" });

    // ─── Console in development for debugging ──────────────────
    if (process.env.NODE_ENV === "development") {
        console.debug(`[auth-analytics] ${event}`, metadata);
    }
}

/**
 * Convenience: log to both the server audit log and external analytics.
 */
export function emitAuthEvent(
    event: AuthEvent,
    metadata?: AuthEventMetadata
): void {
    logAuthEvent(event, metadata);
    trackAuthEvent(event, metadata);
}
