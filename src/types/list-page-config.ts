/* ═══════════════════════════════════════════════════════════════
   LIST PAGE CONFIG — Pure data type for declarative list pages
   
   Consumed by ListPageShell to render entity list pages without
   imperative code. Maps to DataTable ColumnDef, FieldRenderer,
   FilterBar, and CreateEntityDialog contracts.
   ═══════════════════════════════════════════════════════════════ */

import type { LucideIcon } from "lucide-react";
import type { FieldConfig, FieldType } from "@/components/data-view/field-renderers";
import type { CreateEntityConfig } from "@/components/create-entity-dialog";
import type { BadgeVariant } from "@/config/ui-variants";

// ─── Column Definition ──────────────────────────────────────

export interface ListColumnDef {
    /** Unique column identifier */
    id: string;
    /** Column header label */
    header: string;
    /** Key to access the value from the record (dot notation supported) */
    accessorKey?: string;
    /** Custom accessor function */
    accessorFn?: (row: Record<string, unknown>) => unknown;
    /** FieldRenderer type for automatic rendering */
    fieldType?: FieldType;
    /** Additional FieldRenderer config */
    fieldConfig?: Partial<FieldConfig>;
    /** Custom render function (escape hatch) */
    render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
    /** Whether this column is sortable (default: true) */
    sortable?: boolean;
    /** Column width (CSS value) */
    width?: string | number;
    /** Minimum column width */
    minWidth?: number;
    /** Text alignment */
    align?: "left" | "center" | "right";
    /** Whether column is hidden by default */
    hidden?: boolean;
    /** Sticky column */
    sticky?: boolean;
}

// ─── Stat Card Definition ───────────────────────────────────

export interface ListStatDef {
    /** Display label */
    label: string;
    /** Icon */
    icon?: LucideIcon;
    /** Count records matching this predicate */
    filter?: (record: Record<string, unknown>) => boolean;
    /** Static value */
    value?: string | number;
    /** Compute value from full dataset */
    compute?: (records: Record<string, unknown>[]) => string | number;
}

// ─── Filter Definition ──────────────────────────────────────

export interface ListFilterOption {
    value: string;
    label: string;
}

export interface ListFilterDef {
    /** Unique filter ID */
    id: string;
    /** Display label */
    label: string;
    /** Record key to filter against */
    column: string;
    /** Available filter options */
    options: ListFilterOption[];
}

// ─── Alert Definition ───────────────────────────────────────

export interface ListAlertDef {
    /** Alert severity */
    severity: "warning" | "info" | "destructive";
    /** Show alert when predicate returns true */
    when: (records: Record<string, unknown>[]) => boolean;
    /** Message (string or function receiving records) */
    message: string | ((records: Record<string, unknown>[]) => string);
    /** Alert icon */
    icon?: LucideIcon;
}

// ─── Bulk Action Definition ─────────────────────────────────

export interface ListBulkActionDef {
    /** Action ID */
    id: string;
    /** Display label */
    label: string;
    /** Icon */
    icon?: LucideIcon;
    /** Destructive action styling */
    variant?: "default" | "destructive";
    /** Handler receiving selected record IDs */
    onExecute: (selectedIds: string[]) => void | Promise<void>;
}

// ─── Row Action Definition ──────────────────────────────────

export interface ListRowActionDef {
    /** Action ID */
    id: string;
    /** Display label */
    label: string;
    /** Icon */
    icon?: LucideIcon;
    /** Destructive styling */
    variant?: "default" | "destructive";
    /** Handler receiving the row record */
    onExecute: (record: Record<string, unknown>) => void | Promise<void>;
}

// ─── Board Config (Kanban) ──────────────────────────────────

export interface ListBoardConfig {
    /** Record key to group by */
    groupByKey: string;
    /** Labels for each column value */
    columnLabels?: Record<string, string>;
    /** Badge variants for columns */
    columnVariants?: Record<string, BadgeVariant>;
    /** Card title key */
    cardTitleKey?: string;
    /** Card subtitle key */
    cardSubtitleKey?: string;
}

// ─── Card Config (Grid) ─────────────────────────────────────

export interface ListCardFieldDef {
    /** Unique ID */
    id: string;
    /** Display label */
    label?: string;
    /** Record key */
    accessorKey?: string;
    /** Custom accessor */
    accessorFn?: (row: Record<string, unknown>) => unknown;
    /** FieldRenderer type */
    fieldType?: FieldType;
    /** Additional config */
    fieldConfig?: Partial<FieldConfig>;
    /** Custom render */
    render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

export interface ListCardConfig {
    /** Card title key or accessor */
    titleKey: string;
    /** Card subtitle key */
    subtitleKey?: string;
    /** Status badge key */
    statusKey?: string;
    /** Fields to display on card body */
    fields?: ListCardFieldDef[];
}

// ─── Main Config ────────────────────────────────────────────

export interface ListPageConfig {
    /** Entity config key (snake_case) — resolves EntityConfig for RBAC, title, API path */
    entityKey: string;
    /** Override page description */
    description?: string;
    /** Override page title */
    title?: string;
    /** Page icon */
    icon?: LucideIcon;

    // ─── Stats ───
    /** Stat cards (computed from live data). If omitted, default stats are shown. */
    stats?: ListStatDef[];

    // ─── Columns ───
    /** Column definitions for DataTable. If omitted, default columns are inferred. */
    columns?: ListColumnDef[];
    /** Default sort state */
    defaultSort?: { column: string; direction: "asc" | "desc" };
    /** Record keys to search against */
    searchKeys?: string[];

    // ─── Views ───
    /** Allowed display modes (default: ["table"]) */
    views?: ("table" | "board" | "cards")[];
    /** Default display mode */
    defaultView?: "table" | "board" | "cards";
    /** Board (kanban) configuration */
    boardConfig?: ListBoardConfig;
    /** Card grid configuration */
    cardConfig?: ListCardConfig;

    // ─── Filters ───
    /** Declarative filter definitions */
    filters?: ListFilterDef[];

    // ─── Alerts ───
    /** Contextual alert banners */
    alerts?: ListAlertDef[];

    // ─── Actions ───
    /** Create form config */
    createConfig?: CreateEntityConfig;
    /** Override create button label */
    createLabel?: string;
    /** Bulk actions on selected rows */
    bulkActions?: ListBulkActionDef[];
    /** Per-row actions */
    rowActions?: ListRowActionDef[];

    // ─── CSV ───
    /** Enable CSV export */
    exportable?: boolean;
    /** Enable CSV import */
    importable?: boolean;

    // ─── Empty State ───
    /** Custom empty state title */
    emptyTitle?: string;
    /** Custom empty state description */
    emptyDescription?: string;

    // ─── Slots (escape hatches) ───
    /** Override the header section */
    headerSlot?: React.ReactNode;
    /** Override the stats section */
    statsSlot?: React.ReactNode;
    /** Override the toolbar section */
    toolbarSlot?: React.ReactNode;
    /** Override the content section (replaces DataTable/Board/Cards) */
    contentSlot?: React.ReactNode;
    /** Additional content after the main content */
    footerSlot?: React.ReactNode;
}
