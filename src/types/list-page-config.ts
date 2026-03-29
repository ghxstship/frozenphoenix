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
    accessorKey?: string | undefined; /** Custom accessor function */
    accessorFn?: (
        row: Record<string, unknown>
    ) => unknown | undefined; /** FieldRenderer type for automatic rendering */
    fieldType?: FieldType | undefined; /** Additional FieldRenderer config */
    fieldConfig?: Partial<FieldConfig> | undefined; /** Custom render function (escape hatch) */
    render?:
        | ((value: unknown, row: Record<string, unknown>) => React.ReactNode)
        | undefined; /** Whether this column is sortable (default: true) */
    sortable?: boolean | undefined; /** Column width (CSS value) */
    width?: string | number | undefined; /** Minimum column width */
    minWidth?: number | undefined; /** Text alignment */
    align?: "left" | "center" | "right" | undefined; /** Whether column is hidden by default */
    hidden?: boolean | undefined; /** Sticky column */
    sticky?: boolean | undefined;
}

// ─── Stat Card Definition ───────────────────────────────────

export interface ListStatDef {
    /** Display label */
    label: string;
    /** Icon */
    icon?: LucideIcon | undefined; /** Count records matching this predicate */
    filter?: (record: Record<string, unknown>) => boolean | undefined; /** Static value */
    value?: string | number | undefined; /** Compute value from full dataset */
    compute?: (records: Record<string, unknown>[]) => string | number | undefined;
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
    /** Default selected value — when provided, the filter starts pre-selected
     *  instead of "All". Useful for showing only active/open items by default. */
    defaultValue?: string | undefined;
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
    icon?: LucideIcon | undefined;
}

// ─── Bulk Action Definition ─────────────────────────────────

export interface ListBulkActionDef {
    /** Action ID */
    id: string;
    /** Display label */
    label: string;
    /** Icon */
    icon?: LucideIcon | undefined; /** Destructive action styling */
    variant?: "default" | "destructive" | undefined; /** Handler receiving selected record IDs */
    onExecute: (selectedIds: string[]) => void | Promise<void>;
}

// ─── Row Action Definition ──────────────────────────────────

export interface ListRowActionDef {
    /** Action ID */
    id: string;
    /** Display label */
    label: string;
    /** Icon */
    icon?: LucideIcon | undefined; /** Destructive styling */
    variant?: "default" | "destructive" | undefined; /** Handler receiving the row record */
    onExecute: (record: Record<string, unknown>) => void | Promise<void>;
}

// ─── Board Config (Kanban) ──────────────────────────────────

export interface ListBoardConfig {
    /** Record key to group by */
    groupByKey: string;
    /** Labels for each column value */
    columnLabels?: Record<string, string> | undefined; /** Badge variants for columns */
    columnVariants?: Record<string, BadgeVariant> | undefined; /** Card title key */
    cardTitleKey?: string | undefined; /** Card subtitle key */
    cardSubtitleKey?: string | undefined;
}

// ─── Timeline Config ────────────────────────────────────────

export interface ListTimelineConfig {
    /** Record key for bar label */
    labelKey: string;
    /** Record key for bar sub-label */
    sublabelKey?: string | undefined; /** Record key for start date (ISO string) */
    startDateKey: string;
    /** Record key for end date (ISO string) */
    endDateKey: string;
    /** Record key for optional progress (0-100) */
    progressKey?: string | undefined; /** Record key to color-code bars */
    colorKey?: string | undefined; /** Map of colorKey values → CSS color classes */
    colorMap?:
        | Record<string, string>
        | undefined; /** Record key for grouping rows (e.g. assignee, project) */
    groupByKey?: string | undefined;
}

// ─── Calendar Config ────────────────────────────────────────

export interface ListCalendarConfig {
    /** Record key for event title */
    titleKey: string;
    /** Record key for event date or start date (ISO string) */
    dateKey: string;
    /** Record key for optional end date (multi-day events) */
    endDateKey?: string | undefined; /** Record key for dot/badge color */
    colorKey?: string | undefined; /** Map of colorKey values → CSS color classes */
    colorMap?: Record<string, string> | undefined;
}

// ─── Gallery Config ─────────────────────────────────────────

export interface ListGalleryConfig {
    /** Record key for image URL */
    imageKey: string;
    /** Record key for title overlay */
    titleKey: string;
    /** Record key for subtitle overlay */
    subtitleKey?: string | undefined; /** Record key for status badge */
    statusKey?: string | undefined; /** Aspect ratio of thumbnails */
    aspectRatio?: "square" | "video" | "wide" | undefined;
}

// ─── Chart Config ───────────────────────────────────────────

export interface ListChartConfig {
    /** Chart type */
    type: "bar" | "pie" | "donut";
    /** Record key to aggregate (group-by axis / segment label) */
    categoryKey: string;
    /** Record key for numeric value (defaults to count if omitted) */
    valueKey?: string | undefined; /** Aggregation function when valueKey provided */
    aggregation?:
        | "sum"
        | "avg"
        | "count"
        | undefined; /** Map of category values → CSS color classes */
    colorMap?: Record<string, string> | undefined;
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
    subtitleKey?: string | undefined; /** Record key for marker color */
    colorKey?: string | undefined; /** Map of colorKey values → CSS color classes */
    colorMap?: Record<string, string> | undefined;
}

// ─── Workload Config ────────────────────────────────────────

export interface ListWorkloadConfig {
    /** Record key for resource/person name */
    resourceKey: string;
    /** Record key for resource avatar URL */
    resourceAvatarKey?: string | undefined; /** Record key for start date */
    startDateKey: string;
    /** Record key for end date */
    endDateKey: string;
    /** Record key for hours per day */
    hoursKey?: string | undefined; /** Record key for booking type / category (color coding) */
    categoryKey?: string | undefined; /** Map of category values → CSS color classes */
    colorMap?: Record<string, string> | undefined; /** Max hours per day for capacity line */
    capacityHoursPerDay?: number | undefined;
}

// ─── Card Config (Grid) ─────────────────────────────────────

export interface ListCardFieldDef {
    /** Unique ID */
    id: string;
    /** Display label */
    label?: string | undefined; /** Record key */
    accessorKey?: string | undefined; /** Custom accessor */
    accessorFn?: (row: Record<string, unknown>) => unknown | undefined; /** FieldRenderer type */
    fieldType?: FieldType | undefined; /** Additional config */
    fieldConfig?: Partial<FieldConfig> | undefined; /** Custom render */
    render?: ((value: unknown, row: Record<string, unknown>) => React.ReactNode) | undefined;
}

export interface ListCardConfig {
    /** Card title key or accessor */
    titleKey: string;
    /** Card subtitle key */
    subtitleKey?: string | undefined; /** Status badge key */
    statusKey?: string | undefined; /** Fields to display on card body */
    fields?: ListCardFieldDef[] | undefined;
}

// ─── Tab Definition ─────────────────────────────────────────

export interface ListTabDef {
    /** Tab ID — used as URL search param value */
    id: string;
    /** Tab label */
    label: string;
    /** Tab icon */
    icon?: LucideIcon | undefined;
    /** Tab content (slot) */
    content?: React.ReactNode | undefined;
}

// ─── Main Config ────────────────────────────────────────────

export interface ListPageConfig {
    /** Entity config key (snake_case) — resolves EntityConfig for RBAC, title, API path.
     *  For dashboard-style pages without a matching entity config, set this to any
     *  unique identifier and use `resource` for RBAC gating. */
    entityKey: string;
    /** Override page description */
    description?: string | undefined;
    /** Override page title */
    title?: string | undefined;
    /** Page icon */
    icon?: LucideIcon | undefined;
    // ─── RBAC ───
    /** RBAC resource key override — when provided, used instead of the resource
     *  resolved from `entityKey`. Required for dashboard pages that don't have
     *  a matching EntityConfig. */
    resource?: string | undefined;
    /** RBAC action (default: "read") */
    action?: string | undefined;
    // ─── Stats ───
    /** Stat cards (computed from live data). If omitted, default stats are shown. */
    stats?: ListStatDef[] | undefined;
    // ─── Columns ───
    /** Column definitions for DataTable. If omitted, default columns are inferred. */
    columns?: ListColumnDef[] | undefined;
    /** Default sort state */
    defaultSort?: { column: string; direction: "asc" | "desc" } | undefined;
    /** Record keys to search against */
    searchKeys?: string[] | undefined;
    /** Search input placeholder text override */
    searchPlaceholder?: string | undefined;
    // ─── Views ───
    /** Allowed display modes (default: ["table"]). Only views listed here appear in the switcher.
     *  This is the contextual visibility mechanism — omit a view type if it isn't
     *  meaningful for this entity's data shape. */
    views?: ViewMode[] | undefined;
    /** Default display mode */
    defaultView?: ViewMode | undefined;
    /** Board (kanban) configuration — required when views includes "board" */
    boardConfig?: ListBoardConfig | undefined;
    /** Card grid configuration — required when views includes "cards" */
    cardConfig?: ListCardConfig | undefined;
    /** Timeline configuration — required when views includes "timeline" */
    timelineConfig?: ListTimelineConfig | undefined;
    /** Calendar configuration — required when views includes "calendar" */
    calendarConfig?: ListCalendarConfig | undefined;
    /** Gallery configuration — required when views includes "gallery" */
    galleryConfig?: ListGalleryConfig | undefined;
    /** Chart configuration — required when views includes "chart" */
    chartConfig?: ListChartConfig | undefined;
    /** Map configuration — required when views includes "map" */
    mapConfig?: ListMapConfig | undefined;
    /** Workload configuration — required when views includes "workload" */
    workloadConfig?: ListWorkloadConfig | undefined;
    // ─── Tabs ───
    /** Tab definitions — when provided, shell uses tabbed layout with URL-synced state.
     *  Renders TabBar below the toolbar and TabPanel for each tab. */
    tabs?: ListTabDef[] | undefined;
    // ─── Filters ───
    /** Declarative filter definitions */
    filters?: ListFilterDef[] | undefined;
    // ─── Alerts ───
    /** Contextual alert banners */
    alerts?: ListAlertDef[] | undefined;
    // ─── Actions ───
    /** Create form config */
    createConfig?: CreateEntityConfig | undefined;
    /** Override create button label */
    createLabel?: string | undefined;
    /** Bulk actions on selected rows */
    bulkActions?: ListBulkActionDef[] | undefined;
    /** Per-row actions */
    rowActions?: ListRowActionDef[] | undefined;
    // ─── Quick View ───
    /** Quick-view panel config — enables slide-panel preview on row click instead of full-page navigation */
    quickViewConfig?: QuickViewConfig | undefined;
    // ─── CSV ───
    /** Enable CSV export */
    exportable?: boolean | undefined;
    /** Enable CSV import */
    importable?: boolean | undefined;
    // ─── Empty State ───
    /** Custom empty state title */
    emptyTitle?: string | undefined;
    /** Custom empty state description */
    emptyDescription?: string | undefined;
    /** Custom empty state icon */
    emptyIcon?: LucideIcon | undefined;
    // ─── Card Renderer (Dashboard-style) ───
    /** Custom card renderer — when provided, renders each filtered item through this
     *  function instead of DataTable/Board/Cards. Used by dashboard-style pages. */
    cardRenderer?: ((item: Record<string, unknown>, index: number) => React.ReactNode) | undefined;
    /** Card layout mode for cardRenderer (default: "list") */
    cardLayout?: "grid" | "list" | undefined;
    /** Grid columns for "grid" layout (default: responsive 1/2/3) */
    gridCols?: string | undefined;
    // ─── Header ───
    /** Action buttons rendered inside PageHeader */
    headerActions?: React.ReactNode | undefined;
    // ─── Toolbar ───
    /** Additional action buttons for the toolbar right zone (alongside built-in actions) */
    toolbarActions?: React.ReactNode | undefined;
    /** External search state override — when provided, the shell uses this instead of
     *  its own internal search state. Use for pages that manage their own search. */
    searchState?:
        | {
              value: string;
              onValueChange: (value: string) => void;
              placeholder?: string | undefined;
          }
        | undefined;
    // ─── Slots (escape hatches) ───
    /** Override the header section */
    headerSlot?: React.ReactNode | undefined;
    /** Override the stats section */
    statsSlot?: React.ReactNode | undefined;
    /** Override the toolbar section */
    toolbarSlot?: React.ReactNode | undefined;
    /** Override the content section (replaces DataTable/Board/Cards) */
    contentSlot?: React.ReactNode | undefined;
    /** Additional content between stats and toolbar */
    afterStatsSlot?: React.ReactNode | undefined;
    /** Additional content after the main content area */
    afterCardsSlot?: React.ReactNode | undefined;
    /** Additional content after the main content */
    footerSlot?: React.ReactNode | undefined;
}
