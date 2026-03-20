/* ═══════════════════════════════════════════════════════════════
   DASHBOARD PAGE CONFIGS — Declarative operational dashboard definitions

   Each config file in this directory exports a DashboardPageConfig
   consumed by OperationalDashboardShell. Follows the same pattern as
   config/list-page-configs/ for ListPageShell.

   Pattern: PermissionGate → PageHeader → StatCard grid →
            Filter bar → Card list/grid → Empty state
   ═══════════════════════════════════════════════════════════════ */

// Barrel re-exports
export {
    DASHBOARD_PAGE_GROUPS,
    DASHBOARD_PAGE_KEYS,
    DASHBOARD_PAGE_ROUTES,
    type DashboardPageConfigKey,
} from "./registry";
