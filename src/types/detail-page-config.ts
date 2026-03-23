/* ═══════════════════════════════════════════════════════════════
   DETAIL PAGE CONFIG — Pure data type for declarative detail pages
   
   Consumed by DetailPageShell to render entity detail/[id] pages
   without imperative code. Maps to FieldGrid, RelatedEntities,
   RecordChatter, and DetailLayout contracts.
   ═══════════════════════════════════════════════════════════════ */

import type { LucideIcon } from "lucide-react";
import type { FieldConfig, FieldType } from "@/components/data-view/field-renderers";
import type { CreateEntityConfig } from "@/components/app/create-entity-dialog";
import type { ListColumnDef } from "./list-page-config";

// ─── Field Definition (for FieldGrid) ───────────────────────

export interface DetailFieldDef {
    /** Unique field ID */
    id: string;
    /** Display label */
    label: string;
    /** Record key to access value (dot notation supported) */
    accessorKey?: string | undefined; /** Custom accessor */
    accessorFn?: (record: Record<string, unknown>) => unknown | undefined; /** FieldRenderer type */
    fieldType?: FieldType | undefined; /** Additional FieldRenderer config */
    fieldConfig?: Partial<FieldConfig> | undefined; /** Custom render (escape hatch) */
    render?:
        | ((value: unknown, record: Record<string, unknown>) => React.ReactNode)
        | undefined; /** Span full width (2 columns) */
    fullWidth?: boolean | undefined; /** Icon for the field label */
    icon?: LucideIcon | undefined;
}

// ─── Related Entity Definition ──────────────────────────────

export interface RelatedEntityDef {
    /** Section title (e.g. "Tasks", "Invoices") */
    title: string;
    /** Entity key for the related entity */
    entityKey: string;
    /** Foreign key on the related entity pointing to parent record */
    foreignKey: string;
    /** Columns for the sub-table */
    columns: ListColumnDef[];
    /** Link path pattern (e.g. "/tasks/{id}") — {id} is replaced with record.id */
    linkPattern?: string | undefined; /** Icon */
    icon?: LucideIcon | undefined; /** Empty state message */
    emptyMessage?: string | undefined; /** Maximum rows to display (default: 10) */
    limit?: number | undefined;
}

// ─── Stat Definition (for detail header) ────────────────────

export interface DetailStatDef {
    /** Display label */
    label: string;
    /** Icon */
    icon?: LucideIcon | undefined; /** Record key */
    accessorKey?: string | undefined; /** Custom compute from record */
    compute?: (
        record: Record<string, unknown>
    ) => string | number | undefined; /** FieldRenderer type for formatting */
    fieldType?: FieldType | undefined; /** Additional FieldRenderer config */
    fieldConfig?: Partial<FieldConfig> | undefined;
}

// ─── Tab Definition ─────────────────────────────────────────

export interface DetailTabDef {
    /** Tab ID */
    id: string;
    /** Tab label */
    label: string;
    /** Tab icon */
    icon?: LucideIcon | undefined; /** Optional badge count */
    count?: number | undefined; /** Tab content (slot) */
    content?: React.ReactNode | undefined;
}

// ─── Quick View Config (for slide-panel preview) ────────────

export interface QuickViewConfig {
    /** Fields shown in the preview panel (subset of full detail) */
    previewFields: DetailFieldDef[];
    /** Optional preview stats (defaults to first 3 from DetailPageConfig.stats when used with DetailPageShell) */
    previewStats?: DetailStatDef[] | undefined; /** Panel width class (default: "max-w-lg") */
    width?: string | undefined; /** Enable prev/next record navigation via ↑/↓ keys */
    navigable?: boolean | undefined;
}

// ─── Main Config ────────────────────────────────────────────

export interface DetailPageConfig {
    /** Entity config key (snake_case) — resolves EntityConfig for RBAC, API path */
    entityKey: string;
    /** Record key used as page title (optional if titleFn provided) */
    titleKey?: string | undefined; /** Compute title from record (overrides titleKey) */
    titleFn?:
        | ((record: Record<string, unknown>) => string)
        | undefined; /** Record key for subtitle */
    subtitleKey?: string | undefined; /** Compute subtitle from record (overrides subtitleKey) */
    subtitleFn?:
        | ((record: Record<string, unknown>) => string)
        | undefined; /** Record key for status badge */
    statusKey?: string | undefined; /** Compute status from record (overrides statusKey) */
    statusFn?: ((record: Record<string, unknown>) => string) | undefined; /** Page icon */
    icon?: LucideIcon | undefined;
    // ─── Back navigation ───
    /** Back link href (default: derived from entityKey slug) */
    backHref?: string | undefined; /** Back link label */
    backLabel?: string | undefined;
    // ─── Stats ───
    /** Stat cards displayed below header */
    stats?: DetailStatDef[] | undefined;
    // ─── Overview tab — declarative field grid ───
    /** Fields for the overview tab (rendered via FieldGrid) */
    fields: DetailFieldDef[];
    /** Fields for the sidebar (rendered via FieldGrid) */
    sidebarFields?: DetailFieldDef[] | undefined;
    // ─── Related entities — sub-tables ───
    /** Related entity sub-tables (each gets its own section or tab) */
    relatedEntities?: RelatedEntityDef[] | undefined;
    // ─── Tabs ───
    /** Custom tabs beyond the auto-generated overview/related/activity tabs */
    tabs?: DetailTabDef[] | undefined;
    // ─── Actions ───
    /** Edit form config (reuses CreateEntityConfig for form definition) */
    editConfig?: CreateEntityConfig | undefined; /** Enable archive action */
    archivable?: boolean | undefined; /** Enable delete action */
    deletable?: boolean | undefined;
    // ─── Chatter ───
    /** Enable RecordChatter activity tab (default: true) */
    chatter?:
        | boolean
        | undefined; /** RecordChatter recordType (defaults to entityKey with hyphens→underscores) */
    chatterRecordType?: string | undefined;
    // ─── Messaging ───
    /** Entity type for messaging context */
    messagingEntityType?: string | undefined;
    // ─── Slots (escape hatches) ───
    /** Override the header section */
    headerSlot?: React.ReactNode | undefined; /** Override the sidebar section */
    sidebarSlot?: React.ReactNode | undefined; /** Override the overview tab content */
    overviewSlot?: React.ReactNode | undefined;
}
