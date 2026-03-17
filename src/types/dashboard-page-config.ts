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
    icon?: LucideIcon;
    /** Static value — ignored when `compute` is provided */
    value?: string | number;
    /** Compute value from the full data array */
    compute?: (data: Record<string, unknown>[]) => string | number;
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
    defaultValue?: string;
    /** Filter predicate — returns true if item matches */
    predicate: (item: Record<string, unknown>, filterValue: string) => boolean;
}

// ─── Tab Definition ─────────────────────────────────────────

export interface DashboardTabDef {
    /** Tab ID */
    id: string;
    /** Tab label */
    label: string;
    /** Tab icon */
    icon?: LucideIcon;
    /** Tab content (slot) — receives filtered data */
    content?: React.ReactNode;
}

// ─── Alert Definition ───────────────────────────────────────

export interface DashboardAlertDef {
    /** Condition to show the alert — evaluated against the full data array */
    condition: (data: Record<string, unknown>[]) => boolean;
    /** Alert message — can be static or computed */
    message: string | ((data: Record<string, unknown>[]) => string);
    /** Alert severity */
    severity?: "info" | "warning" | "destructive";
    /** Alert icon */
    icon?: LucideIcon;
}

// ─── Empty State Definition ─────────────────────────────────

export interface DashboardEmptyStateDef {
    /** Icon for empty state */
    icon?: LucideIcon;
    /** Title */
    title: string;
    /** Description */
    description?: string;
}

// ─── Main Config ────────────────────────────────────────────

export interface DashboardPageConfig {
    /** RBAC resource key for PermissionGate */
    resource: string;
    /** RBAC action (default: "read") */
    action?: string;

    // ─── Header ───
    /** Page title */
    title: string;
    /** Page description */
    description?: string;
    /** Page icon */
    icon?: LucideIcon;
    /** Action buttons in the header area */
    headerActions?: React.ReactNode;

    // ─── Stats ───
    /** Stat cards displayed below header */
    stats?: DashboardStatDef[];

    // ─── Alerts ───
    /** Conditional alert banners */
    alerts?: DashboardAlertDef[];

    // ─── Search ───
    /** Enable search bar (default: true) */
    searchable?: boolean;
    /** Search placeholder text */
    searchPlaceholder?: string;
    /** Keys to match search against (dot notation supported) */
    searchKeys?: string[];

    // ─── Filters ───
    /** Filter definitions */
    filters?: DashboardFilterDef[];

    // ─── Tabs ───
    /** Tab definitions — when provided, shell uses tabbed layout */
    tabs?: DashboardTabDef[];

    // ─── Card layout ───
    /** Card layout mode (default: "list") */
    cardLayout?: "grid" | "list";
    /** Grid columns for "grid" layout (default: responsive 1/2/3) */
    gridCols?: string;
    /** Card renderer — receives each filtered item and its index */
    cardRenderer?: (item: Record<string, unknown>, index: number) => React.ReactNode;

    // ─── Empty state ───
    /** Empty state when no data or no filtered results */
    emptyState?: DashboardEmptyStateDef;

    // ─── Content slots (escape hatches) ───
    /** Override the entire content area below stats (replaces filters + cards) */
    contentSlot?: React.ReactNode;
    /** Additional content between stats and filters/cards */
    afterStatsSlot?: React.ReactNode;
    /** Additional content after the card list */
    afterCardsSlot?: React.ReactNode;
}
