/* ═══════════════════════════════════════════════════════════════
   SETTINGS PAGE CONFIG REGISTRY — Discovery Index

   Canonical list of all SettingsPageShell-driven pages.
   Configs contain React nodes (section.content, tab.content)
   so they remain co-located with their page components.

   This registry provides type-safe keys, route mapping,
   and a foundation for architecture enforcement scripts.
   ═══════════════════════════════════════════════════════════════ */

// ─── All settings page keys ──────────────────────────────────

export const SETTINGS_PAGE_KEYS = [
    "SETTINGS_GENERAL",
    "SETTINGS_AI",
    "SETTINGS_DEVELOPER",
    "SETTINGS_EMAIL_INTEGRATION",
    "SETTINGS_NOTIFICATIONS",
    "SETTINGS_SECURITY",
    "SETTINGS_ORG_SECURITY",
] as const;

export type SettingsPageConfigKey = (typeof SETTINGS_PAGE_KEYS)[number];

// ─── Key → route path mapping ───────────────────────────────

export const SETTINGS_PAGE_ROUTES: Record<SettingsPageConfigKey, string> = {
    SETTINGS_GENERAL: "/settings",
    SETTINGS_AI: "/settings/ai",
    SETTINGS_DEVELOPER: "/settings/developer",
    SETTINGS_EMAIL_INTEGRATION: "/settings/email-integration",
    SETTINGS_NOTIFICATIONS: "/settings/notifications",
    SETTINGS_SECURITY: "/settings/security",
    SETTINGS_ORG_SECURITY: "/settings/org-security",
};

// ─── Flat set (for validation) ───────────────────────────────

export const SETTINGS_PAGE_KEY_SET: ReadonlySet<string> = new Set(SETTINGS_PAGE_KEYS);
