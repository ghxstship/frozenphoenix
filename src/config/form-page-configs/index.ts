/* ═══════════════════════════════════════════════════════════════
   FORM PAGE CONFIG REGISTRY — Discovery Index

   Canonical list of all FormPageShell-driven pages.
   FormPageConfig objects may contain React nodes (contentSlot,
   footerSlot) so they remain co-located with their page
   components.

   This registry provides type-safe keys, route mapping,
   and a foundation for architecture enforcement scripts.
   ═══════════════════════════════════════════════════════════════ */

// ─── All form page keys ──────────────────────────────────────

export const FORM_PAGE_KEYS = [
    "ASSETS_NEW",
    "CONTRACTS_NEW",
    "CREW_NEW",
    "PIPELINE_NEW",
    "PROJECTS_EDIT",
    "PROJECTS_NEW",
    "VENDORS_NEW",
] as const;

export type FormPageConfigKey = (typeof FORM_PAGE_KEYS)[number];

// ─── Key → route path mapping ───────────────────────────────

export const FORM_PAGE_ROUTES: Record<FormPageConfigKey, string> = {
    ASSETS_NEW: "/assets/new",
    CONTRACTS_NEW: "/contracts/new",
    CREW_NEW: "/crew/new",
    PIPELINE_NEW: "/pipeline/new",
    PROJECTS_EDIT: "/projects/[id]/edit",
    PROJECTS_NEW: "/projects/new",
    VENDORS_NEW: "/vendors/new",
};

// ─── Flat set (for validation) ───────────────────────────────

export const FORM_PAGE_KEY_SET: ReadonlySet<string> = new Set(FORM_PAGE_KEYS);
