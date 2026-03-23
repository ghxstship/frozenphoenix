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
    | "repeater"
    | "file";

export interface FormFieldDef {
    /** Unique field ID — also used as the form data key */
    id: string;
    /** Display label */
    label: string;
    /** Field input type */
    type: FormFieldType;
    /** Placeholder text */
    placeholder?: string | undefined; /** Help text below the field */
    description?: string | undefined; /** Whether the field is required */
    required?: boolean | undefined; /** Options for select fields */
    options?: FormFieldOption[] | undefined; /** Default value */
    defaultValue?:
        | unknown
        | undefined; /** Span full row width (default: false — fields use grid layout) */
    fullWidth?: boolean | undefined; /** Icon for the field */
    icon?: LucideIcon | undefined; /** Custom validation function — returns error string or null */
    validate?: (value: unknown) => string | null | undefined; /** Whether the field is disabled */
    disabled?:
        | boolean
        | undefined; /** Whether the field is hidden (still in form data but not rendered) */
    hidden?: boolean | undefined;
    // ─── File-specific ───
    /** Accepted file types for file inputs (e.g. ".pdf,.png,image/*") */
    accept?: string | undefined; /** Allow multiple file selection (default: false) */
    multiple?: boolean | undefined;
    // ─── Repeater-specific ───
    /** Sub-field definitions for repeater type — each row contains these fields */
    subFields?: FormFieldDef[] | undefined; /** Minimum number of repeater rows (default: 0) */
    minRows?: number | undefined; /** Maximum number of repeater rows (default: unlimited) */
    maxRows?: number | undefined; /** Label for the "Add Row" button (default: "Add Item") */
    addLabel?: string | undefined;
}

// ─── Section Definition ─────────────────────────────────────

export interface FormSectionDef {
    /** Unique section ID */
    id: string;
    /** Section title */
    title: string;
    /** Section description */
    description?: string | undefined; /** Whether the section is collapsible (default: false) */
    collapsible?: boolean | undefined; /** Whether the section starts collapsed (default: false) */
    defaultCollapsed?: boolean | undefined; /** Fields in this section */
    fields: FormFieldDef[];
}

// ─── Wizard Step Definition ─────────────────────────────────

export interface FormWizardStepDef {
    /** Step ID */
    id: string;
    /** Step label */
    label: string;
    /** Step icon */
    icon?:
        | LucideIcon
        | undefined; /** Fields in this step (rendered via FormSection-style layout) */
    fields?: FormFieldDef[] | undefined; /** Custom content slot (overrides fields) */
    content?:
        | React.ReactNode
        | undefined; /** Step-level validation — returns true if step can advance */
    canAdvance?: (formData: Record<string, unknown>) => boolean | undefined;
}

// ─── Main Config ────────────────────────────────────────────

export interface FormPageConfig {
    /** Entity config key (snake_case) — resolves EntityConfig for RBAC, API path */
    entityKey: string;
    /** Page title (e.g., "Add Asset", "Edit Project") */
    title: string;
    /** i18n key for title — when provided, resolved at runtime via t() */
    titleKey?: string | undefined; /** Page description */
    description?: string | undefined; /** i18n key for description */
    descriptionKey?: string | undefined; /** Page icon */
    icon?: LucideIcon | undefined;
    // ─── Navigation ───
    /** Back link href */
    backHref: string;
    /** Back link label (default: "Back") */
    backLabel?: string | undefined;
    // ─── Form Mode ───
    /** Form mode: "create" or "edit" */
    mode: "create" | "edit";
    /** Record ID when editing */
    recordId?: string | undefined;
    // ─── Layout ───
    /**
     * Layout mode:
     * - "sections" — Standard section-based form (default)
     * - "wizard" — Multi-step wizard form
     */
    layout?: "sections" | "wizard" | undefined;
    // ─── Sections (for layout: "sections") ───
    /** Form sections containing field definitions */
    sections?: FormSectionDef[] | undefined;
    // ─── Wizard (for layout: "wizard") ───
    /** Wizard step definitions */
    steps?: FormWizardStepDef[] | undefined;
    // ─── Submission ───
    /** Submit button label (default: "Save" for edit, "Create" for create) */
    submitLabel?: string | undefined; /** Cancel button label (default: "Cancel") */
    cancelLabel?: string | undefined;
    // ─── Transform ───
    /**
     * Transform form data before submission.
     * Maps camelCase form keys to snake_case API keys, applies
     * null coercion, etc. Receives raw form data, returns API payload.
     */
    transformSubmit?: (formData: Record<string, unknown>) => Record<string, unknown> | undefined;
    // ─── Initial Data (for edit mode) ───
    /**
     * Transform fetched record into initial form data.
     * Maps snake_case API keys to camelCase form keys.
     */
    transformRecord?: (record: Record<string, unknown>) => Record<string, unknown> | undefined;
    // ─── Redirect ───
    /** Path to redirect to after successful submission (default: backHref) */
    successRedirect?: string | undefined;
    // ─── Slots (escape hatches) ───
    /** Override the entire form content */
    contentSlot?:
        | React.ReactNode
        | undefined; /** Additional content after the form sections but before submit */
    footerSlot?: React.ReactNode | undefined;
}
