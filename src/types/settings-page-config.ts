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
    description?: string;
    /** Icon */
    icon?: LucideIcon;
    /** Control type */
    type: "toggle" | "select" | "input" | "custom";
    /** Current value (for toggle/select/input) */
    value?: unknown;
    /** Options for select type */
    options?: { value: string; label: string }[];
    /** Placeholder for input type */
    placeholder?: string;
    /** Disabled state */
    disabled?: boolean;
    /** onChange handler */
    onChange?: (value: unknown) => void;
    /** Custom render function — overrides type-based rendering */
    render?: () => React.ReactNode;
}

// ─── Section Definition ─────────────────────────────────────

export interface SettingsSectionDef {
    /** Section ID */
    id: string;
    /** Section title */
    title: string;
    /** Section description */
    description?: string;
    /** Setting rows in this section */
    rows?: SettingsRowDef[];
    /** Custom content — replaces rows when provided */
    content?: React.ReactNode;
}

// ─── Tab Definition ─────────────────────────────────────────

export interface SettingsTabDef {
    /** Tab ID (used as URL param value) */
    id: string;
    /** Tab label */
    label: string;
    /** Tab icon */
    icon?: LucideIcon;
    /** Sections within this tab */
    sections?: SettingsSectionDef[];
    /** Custom content — replaces sections when provided */
    content?: React.ReactNode;
}

// ─── Main Config ────────────────────────────────────────────

export interface SettingsPageConfig {
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
    /** Header action buttons */
    headerActions?: React.ReactNode;

    // ─── Tabs ───
    /** Tab definitions */
    tabs: SettingsTabDef[];

    // ─── Layout ───
    /** Tab orientation — "horizontal" (default) or "vertical" (sidebar nav) */
    orientation?: "horizontal" | "vertical";

    // ─── URL tab state key (default: "tab") ───
    tabParamKey?: string;
}
