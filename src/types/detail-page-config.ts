/* ═══════════════════════════════════════════════════════════════
   DETAIL PAGE CONFIG — Pure data type for declarative detail pages
   
   Consumed by DetailPageShell to render entity detail/[id] pages
   without imperative code. Maps to FieldGrid, RelatedEntities,
   RecordChatter, and DetailLayout contracts.
   ═══════════════════════════════════════════════════════════════ */

import type { LucideIcon } from "lucide-react";
import type { FieldConfig, FieldType } from "@/components/data-view/field-renderers";
import type { CreateEntityConfig } from "@/components/create-entity-dialog";
import type { ListColumnDef } from "./list-page-config";

// ─── Field Definition (for FieldGrid) ───────────────────────

export interface DetailFieldDef {
    /** Unique field ID */
    id: string;
    /** Display label */
    label: string;
    /** Record key to access value (dot notation supported) */
    accessorKey?: string;
    /** Custom accessor */
    accessorFn?: (record: Record<string, unknown>) => unknown;
    /** FieldRenderer type */
    fieldType?: FieldType;
    /** Additional FieldRenderer config */
    fieldConfig?: Partial<FieldConfig>;
    /** Custom render (escape hatch) */
    render?: (value: unknown, record: Record<string, unknown>) => React.ReactNode;
    /** Span full width (2 columns) */
    fullWidth?: boolean;
    /** Icon for the field label */
    icon?: LucideIcon;
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
    linkPattern?: string;
    /** Icon */
    icon?: LucideIcon;
    /** Empty state message */
    emptyMessage?: string;
    /** Maximum rows to display (default: 10) */
    limit?: number;
}

// ─── Stat Definition (for detail header) ────────────────────

export interface DetailStatDef {
    /** Display label */
    label: string;
    /** Icon */
    icon?: LucideIcon;
    /** Record key */
    accessorKey?: string;
    /** Custom compute from record */
    compute?: (record: Record<string, unknown>) => string | number;
    /** FieldRenderer type for formatting */
    fieldType?: FieldType;
    /** Additional FieldRenderer config */
    fieldConfig?: Partial<FieldConfig>;
}

// ─── Tab Definition ─────────────────────────────────────────

export interface DetailTabDef {
    /** Tab ID */
    id: string;
    /** Tab label */
    label: string;
    /** Tab icon */
    icon?: LucideIcon;
    /** Optional badge count */
    count?: number;
    /** Tab content (slot) */
    content?: React.ReactNode;
}

// ─── Quick View Config (for slide-panel preview) ────────────

export interface QuickViewConfig {
    /** Fields shown in the preview panel (subset of full detail) */
    previewFields: DetailFieldDef[];
    /** Optional preview stats (defaults to first 3 from DetailPageConfig.stats when used with DetailPageShell) */
    previewStats?: DetailStatDef[];
    /** Panel width class (default: "max-w-lg") */
    width?: string;
    /** Enable prev/next record navigation via ↑/↓ keys */
    navigable?: boolean;
}

// ─── Main Config ────────────────────────────────────────────

export interface DetailPageConfig {
    /** Entity config key (snake_case) — resolves EntityConfig for RBAC, API path */
    entityKey: string;
    /** Record key used as page title (optional if titleFn provided) */
    titleKey?: string;
    /** Compute title from record (overrides titleKey) */
    titleFn?: (record: Record<string, unknown>) => string;
    /** Record key for subtitle */
    subtitleKey?: string;
    /** Compute subtitle from record (overrides subtitleKey) */
    subtitleFn?: (record: Record<string, unknown>) => string;
    /** Record key for status badge */
    statusKey?: string;
    /** Compute status from record (overrides statusKey) */
    statusFn?: (record: Record<string, unknown>) => string;
    /** Page icon */
    icon?: LucideIcon;

    // ─── Back navigation ───
    /** Back link href (default: derived from entityKey slug) */
    backHref?: string;
    /** Back link label */
    backLabel?: string;

    // ─── Stats ───
    /** Stat cards displayed below header */
    stats?: DetailStatDef[];

    // ─── Overview tab — declarative field grid ───
    /** Fields for the overview tab (rendered via FieldGrid) */
    fields: DetailFieldDef[];
    /** Fields for the sidebar (rendered via FieldGrid) */
    sidebarFields?: DetailFieldDef[];

    // ─── Related entities — sub-tables ───
    /** Related entity sub-tables (each gets its own section or tab) */
    relatedEntities?: RelatedEntityDef[];

    // ─── Tabs ───
    /** Custom tabs beyond the auto-generated overview/related/activity tabs */
    tabs?: DetailTabDef[];

    // ─── Actions ───
    /** Edit form config (reuses CreateEntityConfig for form definition) */
    editConfig?: CreateEntityConfig;
    /** Enable archive action */
    archivable?: boolean;
    /** Enable delete action */
    deletable?: boolean;

    // ─── Chatter ───
    /** Enable RecordChatter activity tab (default: true) */
    chatter?: boolean;
    /** RecordChatter recordType (defaults to entityKey with hyphens→underscores) */
    chatterRecordType?: string;

    // ─── Messaging ───
    /** Entity type for messaging context */
    messagingEntityType?: string;

    // ─── Slots (escape hatches) ───
    /** Override the header section */
    headerSlot?: React.ReactNode;
    /** Override the sidebar section */
    sidebarSlot?: React.ReactNode;
    /** Override the overview tab content */
    overviewSlot?: React.ReactNode;
}
