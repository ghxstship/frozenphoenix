/* ═══════════════════════════════════════════════════════════════
   DASHBOARD PAGE CONFIG REGISTRY — Discovery Index

   Maps string keys to the page modules that define their
   DashboardPageConfig. Unlike ListPageConfig (pure data),
   DashboardPageConfig contains React nodes (contentSlot,
   headerActions, cardRenderer) so configs remain co-located
   with their page components.

   This registry provides:
   1. A canonical list of all dashboard-shell pages (type-safe keys)
   2. Domain grouping for discoverability
   3. A foundation for future lazy-loading if configs are
      extracted to pure factory functions

   Consumers reference DASHBOARD_PAGE_KEYS for validation,
   navigation generation, and architecture enforcement scripts.
   ═══════════════════════════════════════════════════════════════ */

// ─── Domain Groups ───────────────────────────────────────────

/** All dashboard-shell page keys grouped by domain */
export const DASHBOARD_PAGE_GROUPS = {
    home: ["DASHBOARD_HOME", "HOME_TASKS", "HOME_DOCUMENTS"],
    advancing: [
        "ADVANCING_CATALOG",
        "ADVANCING_FULFILLMENT",
        "ADVANCING_INVENTORY",
        "ADVANCING_NEW",
        "ADVANCING_QUEUE",
        "ADVANCING_REPORTS",
        "ADVANCING_TEMPLATES",
    ],
    finance: ["FINANCE_OVERVIEW", "FINANCE_REVENUE_RECOGNITION"],
    live_ops: [
        "LIVE_OPS_OVERVIEW",
        "LIVE_OPS_COMMS",
        "LIVE_OPS_CREDENTIALS",
        "LIVE_OPS_CREW",
        "LIVE_OPS_DEPARTMENTS",
        "LIVE_OPS_ENVIRONMENT",
        "LIVE_OPS_EQUIPMENT",
        "LIVE_OPS_FINANCIALS",
        "LIVE_OPS_FOH",
        "LIVE_OPS_GATE",
        "LIVE_OPS_GUEST_INCIDENTS",
        "LIVE_OPS_READINESS",
        "LIVE_OPS_RECONCILIATION",
        "LIVE_OPS_REPORTS",
        "LIVE_OPS_RUN_OF_SHOW",
        "LIVE_OPS_STRIKE",
        "LIVE_OPS_VIP",
    ],
    operations: [
        "APPROVALS",
        "AUTOMATIONS",
        "CALENDAR",
        "CLIENT_PORTAL",
        "COMPLIANCE",
        "CREDENTIALS_ASSIGNMENTS",
        "DASHBOARDS",
        "DATA_EXPORT",
        "FORECASTING",
        "INTEGRATIONS_MARKETPLACE",
        "INTEGRATIONS_SYNC_LOG",
        "KNOWLEDGE_BASE_COLLABORATIVE",
        "MESSAGES",
        "ORG_CHART",
        "REPORTS",
        "REPORTS_AI",
        "RESOURCE_PLANNER",
        "SCHEDULING",
    ],
    assets: ["ASSETS_SCAN", "ASSETS_SCAN_BATCH"],
    projects: ["PROJECTS_TEMPLATES"],
    templates: ["TEMPLATE_EDITOR"],
} as const;

// ─── Flat key union ──────────────────────────────────────────

type DashboardPageGroupValues = typeof DASHBOARD_PAGE_GROUPS;
type DashboardPageGroupKeys = keyof DashboardPageGroupValues;
type FlattenGroup<G extends DashboardPageGroupKeys> = DashboardPageGroupValues[G][number];

export type DashboardPageConfigKey = {
    [G in DashboardPageGroupKeys]: FlattenGroup<G>;
}[DashboardPageGroupKeys];

// ─── All keys as a flat set (for validation) ─────────────────

export const DASHBOARD_PAGE_KEYS: ReadonlySet<string> = new Set(
    Object.values(DASHBOARD_PAGE_GROUPS).flat()
);

// ─── Key → route path mapping (for navigation/enforcement) ──

export const DASHBOARD_PAGE_ROUTES: Record<DashboardPageConfigKey, string> = {
    // home
    DASHBOARD_HOME: "/dashboard",
    HOME_TASKS: "/home/tasks",
    HOME_DOCUMENTS: "/home/documents",

    // advancing
    ADVANCING_CATALOG: "/advancing/catalog",
    ADVANCING_FULFILLMENT: "/advancing/fulfillment",
    ADVANCING_INVENTORY: "/advancing/inventory",
    ADVANCING_NEW: "/advancing/new",
    ADVANCING_QUEUE: "/advancing/queue",
    ADVANCING_REPORTS: "/advancing/reports",
    ADVANCING_TEMPLATES: "/advancing/templates",

    // finance
    FINANCE_OVERVIEW: "/finance",
    FINANCE_REVENUE_RECOGNITION: "/finance/revenue-recognition",

    // live ops
    LIVE_OPS_OVERVIEW: "/live-ops",
    LIVE_OPS_COMMS: "/live-ops/comms",
    LIVE_OPS_CREDENTIALS: "/live-ops/credentials",
    LIVE_OPS_CREW: "/live-ops/crew",
    LIVE_OPS_DEPARTMENTS: "/live-ops/departments",
    LIVE_OPS_ENVIRONMENT: "/live-ops/environment",
    LIVE_OPS_EQUIPMENT: "/live-ops/equipment",
    LIVE_OPS_FINANCIALS: "/live-ops/financials",
    LIVE_OPS_FOH: "/live-ops/foh",
    LIVE_OPS_GATE: "/live-ops/gate",
    LIVE_OPS_GUEST_INCIDENTS: "/live-ops/guest-incidents",
    LIVE_OPS_READINESS: "/live-ops/readiness",
    LIVE_OPS_RECONCILIATION: "/live-ops/reconciliation",
    LIVE_OPS_REPORTS: "/live-ops/reports",
    LIVE_OPS_RUN_OF_SHOW: "/live-ops/run-of-show",
    LIVE_OPS_STRIKE: "/live-ops/strike",
    LIVE_OPS_VIP: "/live-ops/vip",

    // operations
    APPROVALS: "/approvals",
    AUTOMATIONS: "/automations",
    CALENDAR: "/calendar",
    CLIENT_PORTAL: "/client-portal",
    COMPLIANCE: "/compliance",
    CREDENTIALS_ASSIGNMENTS: "/credentials/assignments",
    DASHBOARDS: "/dashboards",
    DATA_EXPORT: "/data-export",
    FORECASTING: "/forecasting",
    INTEGRATIONS_MARKETPLACE: "/integrations/marketplace",
    INTEGRATIONS_SYNC_LOG: "/integrations/sync-log",
    KNOWLEDGE_BASE_COLLABORATIVE: "/knowledge-base/collaborative",
    MESSAGES: "/messages",
    ORG_CHART: "/org-chart",
    REPORTS: "/reports",
    REPORTS_AI: "/reports/ai",
    RESOURCE_PLANNER: "/resource-planner",
    SCHEDULING: "/scheduling",

    // assets
    ASSETS_SCAN: "/assets/scan",
    ASSETS_SCAN_BATCH: "/assets/scan/batch",

    // projects
    PROJECTS_TEMPLATES: "/projects/templates",

    // templates
    TEMPLATE_EDITOR: "/templates/[id]/edit",
};
