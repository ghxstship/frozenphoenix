/* ═══════════════════════════════════════════════════════════════
   WIZARD CONFIG — Pure data type for declarative wizard/onboarding flows

   Consumed by WizardShell to render multi-step flows without
   imperative scaffolding. Supports step validation, skip logic,
   progress indicators, and completion callbacks.

   Pattern D from NON_LIST_PAGE_INFRASTRUCTURE_AUDIT.md:
   Step indicator → Step content panels → Navigation buttons
   ═══════════════════════════════════════════════════════════════ */

import type { LucideIcon } from "lucide-react";

// ─── Step Definition ────────────────────────────────────────

export interface WizardStepDef {
    /** Unique step ID */
    id: string;
    /** Step label (shown in indicator) */
    label: string;
    /** i18n key for step label — when provided, resolved at runtime via t() */
    labelKey?: string;
    /** Step description (shown below label in indicator) */
    description?: string;
    /** i18n key for step description */
    descriptionKey?: string;
    /** Step icon */
    icon?: LucideIcon;
    /** Step content — rendered in the step panel */
    content: React.ReactNode;
    /** Validate before advancing — return true to allow, string for error message */
    validate?: () => boolean | string;
    /** Whether this step can be skipped */
    skippable?: boolean;
    /** Whether to hide this step from the indicator (for conditional steps) */
    hidden?: boolean;
}

// ─── Main Config ────────────────────────────────────────────

export interface WizardConfig {
    /** RBAC resource key for PermissionGate (optional — omit for public wizards like onboarding) */
    resource?: string;
    /** RBAC action (default: "read") */
    action?: string;

    // ─── Header ───
    /** Wizard title */
    title: string;
    /** i18n key for title — when provided, resolved at runtime via t() */
    titleKey?: string;
    /** Wizard description */
    description?: string;
    /** i18n key for description */
    descriptionKey?: string;
    /** Page icon */
    icon?: LucideIcon;

    // ─── Steps ───
    /** Step definitions */
    steps: WizardStepDef[];

    // ─── Behavior ───
    /** Show step progress indicator (default: true) */
    showProgress?: boolean;
    /** Allow navigating to previous steps (default: true) */
    allowBack?: boolean;
    /** Label for the final step's submit button (default: "Complete") */
    submitLabel?: string;
    /** Label for the next button (default: "Continue") */
    nextLabel?: string;
    /** Label for the back button (default: "Back") */
    backLabel?: string;
    /** Label for the skip button (default: "Skip") */
    skipLabel?: string;
    /** Completion callback — called when the final step is submitted */
    onComplete?: () => void | Promise<void>;
    /** Cancel callback — called when the user exits the wizard */
    onCancel?: () => void;
}
