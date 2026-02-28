/* ═══════════════════════════════════════════════════════════════
   AUTH UTILITIES — Security helpers for authentication flows
   ═══════════════════════════════════════════════════════════════ */

// ─── Redirect Validation (prevents open redirect) ──────────────
const ALLOWED_REDIRECT_PREFIXES = ["/dashboard", "/onboarding", "/settings", "/projects", "/invite"];

export function validateRedirectUrl(url: string | null): string {
    const fallback = "/dashboard";
    if (!url) return fallback;

    // Block absolute URLs, protocol-relative URLs, and javascript: schemes
    if (
        url.startsWith("http:") ||
        url.startsWith("https:") ||
        url.startsWith("//") ||
        url.startsWith("javascript:") ||
        url.includes("\\")
    ) {
        return fallback;
    }

    // Must start with / and match an allowed prefix
    if (!url.startsWith("/")) return fallback;

    const isAllowed = ALLOWED_REDIRECT_PREFIXES.some((prefix) =>
        url.startsWith(prefix)
    );

    return isAllowed ? url : fallback;
}

// ─── Client-Side Rate Limiting ─────────────────────────────────
interface RateLimitState {
    attempts: number;
    lastAttempt: number;
    lockedUntil: number;
}

const RATE_LIMIT_KEY = "fp-auth-rate-limit";
const LOCKOUT_DURATIONS = [0, 0, 0, 2000, 4000, 8000, 16000, 30000, 60000];

function getRateLimitState(): RateLimitState {
    if (typeof window === "undefined") return { attempts: 0, lastAttempt: 0, lockedUntil: 0 };
    try {
        const stored = sessionStorage.getItem(RATE_LIMIT_KEY);
        if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return { attempts: 0, lastAttempt: 0, lockedUntil: 0 };
}

function setRateLimitState(state: RateLimitState) {
    if (typeof window === "undefined") return;
    try {
        sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(state));
    } catch { /* ignore */ }
}

export function checkRateLimit(): { allowed: boolean; retryAfterMs: number } {
    const state = getRateLimitState();
    const now = Date.now();

    if (state.lockedUntil > now) {
        return { allowed: false, retryAfterMs: state.lockedUntil - now };
    }

    // Reset after 5 minutes of inactivity
    if (now - state.lastAttempt > 5 * 60 * 1000) {
        setRateLimitState({ attempts: 0, lastAttempt: now, lockedUntil: 0 });
        return { allowed: true, retryAfterMs: 0 };
    }

    return { allowed: true, retryAfterMs: 0 };
}

export function recordFailedAttempt() {
    const state = getRateLimitState();
    const now = Date.now();
    const newAttempts = state.attempts + 1;
    const lockoutIdx = Math.min(newAttempts, LOCKOUT_DURATIONS.length - 1);
    const lockoutMs = LOCKOUT_DURATIONS[lockoutIdx] ?? 0;

    setRateLimitState({
        attempts: newAttempts,
        lastAttempt: now,
        lockedUntil: lockoutMs > 0 ? now + lockoutMs : 0,
    });
}

export function resetRateLimit() {
    if (typeof window === "undefined") return;
    try {
        sessionStorage.removeItem(RATE_LIMIT_KEY);
    } catch { /* ignore */ }
}

export function formatLockoutTime(ms: number): string {
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.ceil(seconds / 60);
    return `${minutes}m`;
}

// ─── Auth Error Mapping ────────────────────────────────────────
const AUTH_ERROR_MAP: Record<string, string> = {
    "Invalid login credentials": "Email or password is incorrect. Please try again.",
    "Email not confirmed": "Please check your email and confirm your account first.",
    "User already registered": "Check your email for next steps.",
    "Signup requires a valid password": "Please enter a valid password.",
    "Password should be at least 6 characters": "Password must be at least 10 characters.",
    "Email rate limit exceeded": "Too many attempts. Please wait a few minutes and try again.",
    "For security purposes, you can only request this once every 60 seconds":
        "Please wait 60 seconds before requesting another email.",
    "Auth session missing!": "Your session has expired. Please sign in again.",
    "New password should be different from the old password.":
        "Your new password must be different from your current password.",
    "Unable to validate email address: invalid format":
        "Please enter a valid email address.",
};

export function mapAuthError(message: string | undefined | null): string {
    if (!message) return "An unexpected error occurred. Please try again.";

    // Check exact matches first
    if (AUTH_ERROR_MAP[message]) return AUTH_ERROR_MAP[message];

    // Check partial matches
    for (const [key, value] of Object.entries(AUTH_ERROR_MAP)) {
        if (message.toLowerCase().includes(key.toLowerCase())) return value;
    }

    // Generic fallback (never expose raw Supabase errors)
    if (message.toLowerCase().includes("rate limit")) {
        return "Too many attempts. Please wait a few minutes and try again.";
    }

    return "Something went wrong. Please try again or contact support.";
}

// ─── Password Validation (server-side parity) ──────────────────
export function validatePassword(password: string): string | null {
    if (password.length < 10) return "Password must be at least 10 characters.";
    if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter.";
    if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter.";
    if (!/\d/.test(password)) return "Password must contain a number.";
    if (!/[^A-Za-z0-9]/.test(password)) return "Password must contain a special character.";
    return null;
}
