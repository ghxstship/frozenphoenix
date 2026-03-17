/* ═══════════════════════════════════════════════════════════════
   FORM PAGE CONFIG — Pure data type for declarative form pages

   Consumed by FormPageShell to render create/edit form pages
   without imperative code. Supports both section-based and
   wizard-based form layouts. Maps to FormLayout, FormSection,
   and PermissionGate contracts.
   ═══════════════════════════════════════════════════════════════ */

import type { LucideIcon } from "lucide-react";

// ─── Field Definition ───────────────────────────────────────

export interface FormFieldOption {
    value: string;
    label: string;
}

export type FormFieldType =
    | "text"
    | "email"
    | "tel"
    | "url"
    | "number"
    | "currency"
    | "date"
    | "datetime"
    | "textarea"
    | "select"
    | "checkbox"
    | "color"
    | "password"
    | "hidden"
    | "repeater";

export interface FormFieldDef {
    /** Unique field ID — also used as the form data key */
    id: string;
    /** Display label */
    label: string;
    /** Field input type */
    type: FormFieldType;
    /** Placeholder text */
    placeholder?: string;
    /** Help text below the field */
    description?: string;
    /** Whether the field is required */
    required?: boolean;
    /** Options for select fields */
    options?: FormFieldOption[];
    /** Default value */
    defaultValue?: unknown;
    /** Span full row width (default: false — fields use grid layout) */
    fullWidth?: boolean;
    /** Icon for the field */
    icon?: LucideIcon;
    /** Custom validation function — returns error string or null */
    validate?: (value: unknown) => string | null;
    /** Whether the field is disabled */
    disabled?: boolean;
    /** Whether the field is hidden (still in form data but not rendered) */
    hidden?: boolean;

    // ─── Repeater-specific ───
    /** Sub-field definitions for repeater type — each row contains these fields */
    subFields?: FormFieldDef[];
    /** Minimum number of repeater rows (default: 0) */
    minRows?: number;
    /** Maximum number of repeater rows (default: unlimited) */
    maxRows?: number;
    /** Label for the "Add Row" button (default: "Add Item") */
    addLabel?: string;
}

// ─── Section Definition ─────────────────────────────────────

export interface FormSectionDef {
    /** Unique section ID */
    id: string;
    /** Section title */
    title: string;
    /** Section description */
    description?: string;
    /** Whether the section is collapsible (default: false) */
    collapsible?: boolean;
    /** Whether the section starts collapsed (default: false) */
    defaultCollapsed?: boolean;
    /** Fields in this section */
    fields: FormFieldDef[];
}

// ─── Wizard Step Definition ─────────────────────────────────

export interface FormWizardStepDef {
    /** Step ID */
    id: string;
    /** Step label */
    label: string;
    /** Step icon */
    icon?: LucideIcon;
    /** Fields in this step (rendered via FormSection-style layout) */
    fields?: FormFieldDef[];
    /** Custom content slot (overrides fields) */
    content?: React.ReactNode;
    /** Step-level validation — returns true if step can advance */
    canAdvance?: (formData: Record<string, unknown>) => boolean;
}

// ─── Main Config ────────────────────────────────────────────

export interface FormPageConfig {
    /** Entity config key (snake_case) — resolves EntityConfig for RBAC, API path */
    entityKey: string;
    /** Page title (e.g., "Add Asset", "Edit Project") */
    title: string;
    /** Page description */
    description?: string;
    /** Page icon */
    icon?: LucideIcon;

    // ─── Navigation ───
    /** Back link href */
    backHref: string;
    /** Back link label (default: "Back") */
    backLabel?: string;

    // ─── Form Mode ───
    /** Form mode: "create" or "edit" */
    mode: "create" | "edit";
    /** Record ID when editing */
    recordId?: string;

    // ─── Layout ───
    /**
     * Layout mode:
     * - "sections" — Standard section-based form (default)
     * - "wizard" — Multi-step wizard form
     */
    layout?: "sections" | "wizard";

    // ─── Sections (for layout: "sections") ───
    /** Form sections containing field definitions */
    sections?: FormSectionDef[];

    // ─── Wizard (for layout: "wizard") ───
    /** Wizard step definitions */
    steps?: FormWizardStepDef[];

    // ─── Submission ───
    /** Submit button label (default: "Save" for edit, "Create" for create) */
    submitLabel?: string;
    /** Cancel button label (default: "Cancel") */
    cancelLabel?: string;

    // ─── Transform ───
    /**
     * Transform form data before submission.
     * Maps camelCase form keys to snake_case API keys, applies
     * null coercion, etc. Receives raw form data, returns API payload.
     */
    transformSubmit?: (formData: Record<string, unknown>) => Record<string, unknown>;

    // ─── Initial Data (for edit mode) ───
    /**
     * Transform fetched record into initial form data.
     * Maps snake_case API keys to camelCase form keys.
     */
    transformRecord?: (record: Record<string, unknown>) => Record<string, unknown>;

    // ─── Redirect ───
    /** Path to redirect to after successful submission (default: backHref) */
    successRedirect?: string;

    // ─── Slots (escape hatches) ───
    /** Override the entire form content */
    contentSlot?: React.ReactNode;
    /** Additional content after the form sections but before submit */
    footerSlot?: React.ReactNode;
}
