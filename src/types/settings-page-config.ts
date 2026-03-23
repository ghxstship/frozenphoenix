/* ═══════════════════════════════════════════════════════════════
   SETTINGS PAGE CONFIG — Pure data type for declarative settings pages

   Consumed by SettingsPageShell to render tab-based settings pages
   without imperative scaffolding. Maps to TabBar, SettingRow,
   and section-based layouts.

   Pattern: PermissionGate → PageHeader → TabBar (URL-synced) →
            Settings sections with rows / custom content
   ═══════════════════════════════════════════════════════════════ */

import type { LucideIcon } from "lucide-react";

// ─── Setting Row Definition ─────────────────────────────────

export interface SettingsRowDef {
    /** Unique row key */
    key: string;
    /** Display label */
    label: string;
    /** Row description */
    description?: string | undefined; /** Icon */
    icon?: LucideIcon | undefined; /** Control type */
    type: "toggle" | "select" | "input" | "custom";
    /** Current value (for toggle/select/input) */
    value?: unknown | undefined; /** Options for select type */
    options?: { value: string; label: string }[] | undefined; /** Placeholder for input type */
    placeholder?: string | undefined; /** Disabled state */
    disabled?: boolean | undefined; /** onChange handler */
    onChange?:
        | ((value: unknown) => void)
        | undefined; /** Custom render function — overrides type-based rendering */
    render?: (() => React.ReactNode) | undefined;
}

// ─── Section Definition ─────────────────────────────────────

export interface SettingsSectionDef {
    /** Section ID */
    id: string;
    /** Section title */
    title: string;
    /** Section description */
    description?: string | undefined; /** Setting rows in this section */
    rows?: SettingsRowDef[] | undefined; /** Custom content — replaces rows when provided */
    content?: React.ReactNode | undefined;
}

// ─── Tab Definition ─────────────────────────────────────────

export interface SettingsTabDef {
    /** Tab ID (used as URL param value) */
    id: string;
    /** Tab label */
    label: string;
    /** Tab icon */
    icon?: LucideIcon | undefined; /** Sections within this tab */
    sections?:
        | SettingsSectionDef[]
        | undefined; /** Custom content — replaces sections when provided */
    content?: React.ReactNode | undefined;
}

// ─── Main Config ────────────────────────────────────────────

export interface SettingsPageConfig {
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
    icon?: LucideIcon | undefined; /** Header action buttons */
    headerActions?: React.ReactNode | undefined;
    // ─── Tabs ───
    /** Tab definitions */
    tabs: SettingsTabDef[];

    // ─── Layout ───
    /** Tab orientation — "horizontal" (default) or "vertical" (sidebar nav) */
    orientation?: "horizontal" | "vertical" | undefined;
    // ─── URL tab state key (default: "tab") ───
    tabParamKey?: string | undefined;
}
