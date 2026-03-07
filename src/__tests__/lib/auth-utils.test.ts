/**
 * Auth Utilities Tests (WS-13)
 *
 * Covers: redirect validation, auth error mapping, password validation,
 * and lockout time formatting.
 */

import { describe, expect, it } from "vitest";
import {
    formatLockoutTime,
    mapAuthError,
    validatePassword,
    validateRedirectUrl,
} from "@/lib/auth-utils";

// ═══════════════════════════════════════════════════════════════
// REDIRECT VALIDATION (Open Redirect Prevention)
// ═══════════════════════════════════════════════════════════════

describe("validateRedirectUrl", () => {
    it("returns fallback for null/undefined", () => {
        expect(validateRedirectUrl(null)).toBe("/dashboard");
    });

    it("allows valid dashboard paths", () => {
        expect(validateRedirectUrl("/dashboard")).toBe("/dashboard");
        expect(validateRedirectUrl("/dashboard/projects")).toBe("/dashboard/projects");
    });

    it("allows valid onboarding paths", () => {
        expect(validateRedirectUrl("/onboarding/org-setup")).toBe("/onboarding/org-setup");
    });

    it("allows valid settings paths", () => {
        expect(validateRedirectUrl("/settings/security")).toBe("/settings/security");
    });

    it("allows valid project paths", () => {
        expect(validateRedirectUrl("/projects/p-123")).toBe("/projects/p-123");
    });

    it("allows valid invite paths", () => {
        expect(validateRedirectUrl("/invite/token-abc")).toBe("/invite/token-abc");
    });

    it("blocks absolute HTTP URLs", () => {
        expect(validateRedirectUrl("http://evil.com")).toBe("/dashboard");
        expect(validateRedirectUrl("https://evil.com/dashboard")).toBe("/dashboard");
    });

    it("blocks protocol-relative URLs", () => {
        expect(validateRedirectUrl("//evil.com")).toBe("/dashboard");
    });

    it("blocks javascript: scheme", () => {
        expect(validateRedirectUrl("javascript:alert(1)")).toBe("/dashboard");
    });

    it("blocks backslash-based URLs", () => {
        expect(validateRedirectUrl("/dashboard\\@evil.com")).toBe("/dashboard");
    });

    it("blocks paths not matching allowed prefixes", () => {
        expect(validateRedirectUrl("/admin")).toBe("/dashboard");
        expect(validateRedirectUrl("/api/secret")).toBe("/dashboard");
        expect(validateRedirectUrl("/login")).toBe("/dashboard");
    });

    it("blocks relative paths (no leading slash)", () => {
        expect(validateRedirectUrl("dashboard")).toBe("/dashboard");
    });
});

// ═══════════════════════════════════════════════════════════════
// AUTH ERROR MAPPING (prevents Supabase error leakage)
// ═══════════════════════════════════════════════════════════════

describe("mapAuthError", () => {
    it("maps known errors exactly", () => {
        expect(mapAuthError("Invalid login credentials")).toBe(
            "Email or password is incorrect. Please try again."
        );
        expect(mapAuthError("Email not confirmed")).toBe(
            "Please check your email and confirm your account first."
        );
        expect(mapAuthError("User already registered")).toBe("Check your email for next steps.");
    });

    it("maps partial matches (case-insensitive)", () => {
        expect(mapAuthError("Error: Invalid login credentials")).toBe(
            "Email or password is incorrect. Please try again."
        );
    });

    it("maps rate limit errors generically", () => {
        expect(mapAuthError("Unknown rate limit exceeded")).toBe(
            "Too many attempts. Please wait a few minutes and try again."
        );
    });

    it("returns generic fallback for unknown errors", () => {
        expect(mapAuthError("some random supabase error")).toBe(
            "Something went wrong. Please try again or contact support."
        );
    });

    it("returns generic fallback for null/undefined", () => {
        expect(mapAuthError(null)).toBe("An unexpected error occurred. Please try again.");
        expect(mapAuthError(undefined)).toBe("An unexpected error occurred. Please try again.");
    });

    it("never leaks raw Supabase error text", () => {
        const result = mapAuthError('relation "profiles" does not exist');
        expect(result).not.toContain("relation");
        expect(result).not.toContain("profiles");
    });
});

// ═══════════════════════════════════════════════════════════════
// PASSWORD VALIDATION
// ═══════════════════════════════════════════════════════════════

describe("validatePassword", () => {
    it("accepts valid strong password", () => {
        expect(validatePassword("MyStr0ng!Pass")).toBeNull();
    });

    it("rejects too short password", () => {
        expect(validatePassword("Aa1!")).toContain("at least 10");
    });

    it("rejects missing uppercase", () => {
        expect(validatePassword("mystrongpass1!")).toContain("uppercase");
    });

    it("rejects missing lowercase", () => {
        expect(validatePassword("MYSTRONGPASS1!")).toContain("lowercase");
    });

    it("rejects missing number", () => {
        expect(validatePassword("MyStrongPass!")).toContain("number");
    });

    it("rejects missing special character", () => {
        expect(validatePassword("MyStrongPass1")).toContain("special character");
    });

    it("validates boundary: exactly 10 chars with all requirements", () => {
        expect(validatePassword("Abcdefgh1!")).toBeNull();
    });
});

// ═══════════════════════════════════════════════════════════════
// LOCKOUT TIME FORMATTING
// ═══════════════════════════════════════════════════════════════

describe("formatLockoutTime", () => {
    it("formats seconds", () => {
        expect(formatLockoutTime(2000)).toBe("2s");
        expect(formatLockoutTime(8000)).toBe("8s");
        expect(formatLockoutTime(30000)).toBe("30s");
    });

    it("formats minutes", () => {
        expect(formatLockoutTime(60000)).toBe("1m");
        expect(formatLockoutTime(120000)).toBe("2m");
    });

    it("rounds up partial seconds", () => {
        expect(formatLockoutTime(1500)).toBe("2s");
    });

    it("rounds up partial minutes", () => {
        expect(formatLockoutTime(61000)).toBe("2m");
    });
});
