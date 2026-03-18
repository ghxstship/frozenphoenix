/* ═══════════════════════════════════════════════════════════════
   CSRF Protection — Double-Submit Cookie Pattern
   
   How it works:
   1. Middleware sets a `fp-csrf` cookie with a random token on every
      authenticated response (HttpOnly=false so JS can read it).
   2. Client-side fetch() reads the cookie and sends it as
      `X-CSRF-Token` header on all state-mutating requests.
   3. Server validates that the header matches the cookie value.
   
   This is defense-in-depth on top of SameSite=Lax cookies.
   ═══════════════════════════════════════════════════════════════ */

export const CSRF_COOKIE_NAME = "fp-csrf";
export const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * Generate a cryptographically random CSRF token.
 */
export function generateCsrfToken(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

/**
 * Validate that the CSRF header matches the CSRF cookie.
 * Returns true if valid, false if mismatched or missing.
 */
export function validateCsrf(
    cookieValue: string | undefined | null,
    headerValue: string | undefined | null
): boolean {
    if (!cookieValue || !headerValue) return false;
    if (cookieValue.length !== headerValue.length) return false;
    // Constant-time comparison to prevent timing attacks
    let result = 0;
    for (let i = 0; i < cookieValue.length; i++) {
        result |= cookieValue.charCodeAt(i) ^ headerValue.charCodeAt(i);
    }
    return result === 0;
}

/**
 * Client-side helper: read the CSRF token from cookies.
 */
export function getCsrfToken(): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${CSRF_COOKIE_NAME}=([^;]*)`));
    return match?.[1] ? decodeURIComponent(match[1]) : null;
}

/**
 * Client-side helper: return headers object with CSRF token included.
 * Merge into your fetch() headers for state-mutating requests.
 */
export function csrfHeaders(extra?: Record<string, string>): Record<string, string> {
    const token = getCsrfToken();
    return {
        ...(extra ?? {}),
        ...(token ? { [CSRF_HEADER_NAME]: token } : {}),
    };
}
