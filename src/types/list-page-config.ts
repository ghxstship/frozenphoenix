/* ═══════════════════════════════════════════════════════════════
   LIST PAGE CONFIG — Pure data type for declarative list pages
   
   Consumed by ListPageShell to render entity list pages without
   imperative code. Maps to DataTable ColumnDef, FieldRenderer,
   FilterBar, and CreateEntityDialog contracts.
   ═══════════════════════════════════════════════════════════════ */

import type { LucideIcon } from "lucide-react";
import type { FieldConfig, FieldType } from "@/components/data-view/field-renderers";
import type { CreateEntityConfig } from "@/components/app/create-entity-dialog";
import type { BadgeVariant } from "@/config/ui-variants";
import type { ViewMode } from "@/components/ui/view-switcher";
import type { QuickViewConfig } from "@/types/detail-page-config";

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

// ─── Timeline Config ────────────────────────────────────────

export interface ListTimelineConfig {
    /** Record key for bar label */
    labelKey: string;
    /** Record key for bar sub-label */
    sublabelKey?: string;
    /** Record key for start date (ISO string) */
    startDateKey: string;
    /** Record key for end date (ISO string) */
    endDateKey: string;
    /** Record key for optional progress (0-100) */
    progressKey?: string;
    /** Record key to color-code bars */
    colorKey?: string;
    /** Map of colorKey values → CSS color classes */
    colorMap?: Record<string, string>;
    /** Record key for grouping rows (e.g. assignee, project) */
    groupByKey?: string;
}

// ─── Calendar Config ────────────────────────────────────────

export interface ListCalendarConfig {
    /** Record key for event title */
    titleKey: string;
    /** Record key for event date or start date (ISO string) */
    dateKey: string;
    /** Record key for optional end date (multi-day events) */
    endDateKey?: string;
    /** Record key for dot/badge color */
    colorKey?: string;
    /** Map of colorKey values → CSS color classes */
    colorMap?: Record<string, string>;
}

// ─── Gallery Config ─────────────────────────────────────────

export interface ListGalleryConfig {
    /** Record key for image URL */
    imageKey: string;
    /** Record key for title overlay */
    titleKey: string;
    /** Record key for subtitle overlay */
    subtitleKey?: string;
    /** Record key for status badge */
    statusKey?: string;
    /** Aspect ratio of thumbnails */
    aspectRatio?: "square" | "video" | "wide";
}

// ─── Chart Config ───────────────────────────────────────────

export interface ListChartConfig {
    /** Chart type */
    type: "bar" | "pie" | "donut";
    /** Record key to aggregate (group-by axis / segment label) */
    categoryKey: string;
    /** Record key for numeric value (defaults to count if omitted) */
    valueKey?: string;
    /** Aggregation function when valueKey provided */
    aggregation?: "sum" | "avg" | "count";
    /** Map of category values → CSS color classes */
    colorMap?: Record<string, string>;
}

// ─── Map Config ─────────────────────────────────────────────

export interface ListMapConfig {
    /** Record key for latitude */
    latKey: string;
    /** Record key for longitude */
    lngKey: string;
    /** Record key for marker popup title */
    titleKey: string;
    /** Record key for marker popup subtitle */
    subtitleKey?: string;
    /** Record key for marker color */
    colorKey?: string;
    /** Map of colorKey values → CSS color classes */
    colorMap?: Record<string, string>;
}

// ─── Workload Config ────────────────────────────────────────

export interface ListWorkloadConfig {
    /** Record key for resource/person name */
    resourceKey: string;
    /** Record key for resource avatar URL */
    resourceAvatarKey?: string;
    /** Record key for start date */
    startDateKey: string;
    /** Record key for end date */
    endDateKey: string;
    /** Record key for hours per day */
    hoursKey?: string;
    /** Record key for booking type / category (color coding) */
    categoryKey?: string;
    /** Map of category values → CSS color classes */
    colorMap?: Record<string, string>;
    /** Max hours per day for capacity line */
    capacityHoursPerDay?: number;
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
    /** Allowed display modes (default: ["table"]). Only views listed here appear in the switcher.
     *  This is the contextual visibility mechanism — omit a view type if it isn't
     *  meaningful for this entity's data shape. */
    views?: ViewMode[];
    /** Default display mode */
    defaultView?: ViewMode;
    /** Board (kanban) configuration — required when views includes "board" */
    boardConfig?: ListBoardConfig;
    /** Card grid configuration — required when views includes "cards" */
    cardConfig?: ListCardConfig;
    /** Timeline configuration — required when views includes "timeline" */
    timelineConfig?: ListTimelineConfig;
    /** Calendar configuration — required when views includes "calendar" */
    calendarConfig?: ListCalendarConfig;
    /** Gallery configuration — required when views includes "gallery" */
    galleryConfig?: ListGalleryConfig;
    /** Chart configuration — required when views includes "chart" */
    chartConfig?: ListChartConfig;
    /** Map configuration — required when views includes "map" */
    mapConfig?: ListMapConfig;
    /** Workload configuration — required when views includes "workload" */
    workloadConfig?: ListWorkloadConfig;

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

    // ─── Quick View ───
    /** Quick-view panel config — enables slide-panel preview on row click instead of full-page navigation */
    quickViewConfig?: QuickViewConfig;

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
