/* ═══════════════════════════════════════════════════════════════
   DASHBOARD PAGE CONFIG — Pure data type for declarative dashboard pages

   Consumed by OperationalDashboardShell to render operational
   dashboard pages without imperative code. Maps to StatCard,
   SearchInput, filter bars, and card/list layouts.

   Pattern: PermissionGate → PageHeader → StatCard grid →
            Filter bar → Card list/grid → Empty state
   ═══════════════════════════════════════════════════════════════ */

import type { LucideIcon } from "lucide-react";

// ─── Stat Definition ────────────────────────────────────────

export interface DashboardStatDef {
    /** Display label */
    label: string;
    /** Icon for the stat card */
    icon?: LucideIcon | undefined; /** Static value — ignored when `compute` is provided */
    value?: string | number | undefined; /** Compute value from the full data array */
    compute?: (data: Record<string, unknown>[]) => string | number | undefined;
}

// ─── Filter Definition ──────────────────────────────────────

export interface DashboardFilterDef {
    /** Unique filter ID — used as URL search param key */
    id: string;
    /** Display label */
    label: string;
    /** Filter type */
    type: "select" | "button-group";
    /** Filter options */
    options: { value: string; label: string }[];
    /** Default value (default: first option) */
    defaultValue?: string | undefined; /** Filter predicate — returns true if item matches */
    predicate: (item: Record<string, unknown>, filterValue: string) => boolean;
}

// ─── Tab Definition ─────────────────────────────────────────

export interface DashboardTabDef {
    /** Tab ID */
    id: string;
    /** Tab label */
    label: string;
    /** Tab icon */
    icon?: LucideIcon | undefined; /** Tab content (slot) — receives filtered data */
    content?: React.ReactNode | undefined;
}

// ─── Alert Definition ───────────────────────────────────────

export interface DashboardAlertDef {
    /** Condition to show the alert — evaluated against the full data array */
    condition: (data: Record<string, unknown>[]) => boolean;
    /** Alert message — can be static or computed */
    message: string | ((data: Record<string, unknown>[]) => string);
    /** Alert severity */
    severity?: "info" | "warning" | "destructive" | undefined; /** Alert icon */
    icon?: LucideIcon | undefined;
}

// ─── Empty State Definition ─────────────────────────────────

export interface DashboardEmptyStateDef {
    /** Icon for empty state */
    icon?: LucideIcon | undefined; /** Title */
    title: string;
    /** Description */
    description?: string | undefined;
}

// ─── Main Config ────────────────────────────────────────────

export interface DashboardPageConfig {
    /** RBAC resource key for PermissionGate */
    resource: string;
    /** RBAC action (default: "read") */
    action?: string | undefined;
    // ─── Header ───
    /** Page title */
    title: string;
    /** i18n key for title — when provided, resolved at runtime via t() */
    titleKey?: string | undefined; /** Page description */
    description?: string | undefined; /** i18n key for description */
    descriptionKey?: string | undefined; /** Page icon */
    icon?: LucideIcon | undefined; /** Action buttons in the header area */
    headerActions?: React.ReactNode | undefined;
    // ─── Stats ───
    /** Stat cards displayed below header */
    stats?: DashboardStatDef[] | undefined;
    // ─── Alerts ───
    /** Conditional alert banners */
    alerts?: DashboardAlertDef[] | undefined;
    // ─── Search ───
    /** Enable search bar (default: true) */
    searchable?: boolean | undefined; /** Search placeholder text */
    searchPlaceholder?:
        | string
        | undefined; /** Keys to match search against (dot notation supported) */
    searchKeys?: string[] | undefined;
    // ─── Filters ───
    /** Filter definitions */
    filters?: DashboardFilterDef[] | undefined;
    // ─── Tabs ───
    /** Tab definitions — when provided, shell uses tabbed layout */
    tabs?: DashboardTabDef[] | undefined;
    // ─── Card layout ───
    /** Card layout mode (default: "list") */
    cardLayout?:
        | "grid"
        | "list"
        | undefined; /** Grid columns for "grid" layout (default: responsive 1/2/3) */
    gridCols?: string | undefined; /** Card renderer — receives each filtered item and its index */
    cardRenderer?: ((item: Record<string, unknown>, index: number) => React.ReactNode) | undefined;
    // ─── Empty state ───
    /** Empty state when no data or no filtered results */
    emptyState?: DashboardEmptyStateDef | undefined;
    // ─── Content slots (escape hatches) ───
    /** Override the entire content area below stats (replaces filters + cards) */
    contentSlot?:
        | React.ReactNode
        | undefined; /** Additional content between stats and filters/cards */
    afterStatsSlot?: React.ReactNode | undefined; /** Additional content after the card list */
    afterCardsSlot?: React.ReactNode | undefined;
    // ─── Toolbar ───
    /** Action buttons for the canonical toolbar (right side) — icons, view switcher, etc. */
    toolbarActions?: React.ReactNode | undefined;
    /** External search state override — when provided, the shell uses this instead of its own internal search state.
     *  Use this for contentSlot pages that manage their own search filtering. */
    searchState?:
        | {
              value: string;
              onValueChange: (value: string) => void;
              placeholder?: string | undefined;
          }
        | undefined;
}
