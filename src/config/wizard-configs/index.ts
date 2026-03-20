/* ═══════════════════════════════════════════════════════════════
   WIZARD CONFIG REGISTRY — Discovery Index

   Canonical list of all WizardShell-driven pages.
   WizardConfig objects contain React nodes (step.content)
   so they remain co-located with their page components.

   This registry provides type-safe keys, route mapping,
   and a foundation for architecture enforcement scripts.
   ═══════════════════════════════════════════════════════════════ */

// ─── All wizard page keys ────────────────────────────────────

export const WIZARD_PAGE_KEYS = [
    "ONBOARDING_CLAIM_USERNAME",
    "ONBOARDING_COMPLETE",
    "ONBOARDING_ORG_SETUP",
    "ONBOARDING_INVITE_TEAM",
    "ONBOARDING_BILLING",
] as const;

export type WizardConfigKey = (typeof WIZARD_PAGE_KEYS)[number];

// ─── Key → route path mapping ───────────────────────────────

export const WIZARD_PAGE_ROUTES: Record<WizardConfigKey, string> = {
    ONBOARDING_CLAIM_USERNAME: "/onboarding/claim-username",
    ONBOARDING_COMPLETE: "/onboarding/complete",
    ONBOARDING_ORG_SETUP: "/onboarding/org-setup",
    ONBOARDING_INVITE_TEAM: "/onboarding/invite-team",
    ONBOARDING_BILLING: "/onboarding/billing",
};

// ─── Flat set (for validation) ───────────────────────────────

export const WIZARD_PAGE_KEY_SET: ReadonlySet<string> = new Set(WIZARD_PAGE_KEYS);
