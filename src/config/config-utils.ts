/* ═══════════════════════════════════════════════════════════════
   CONFIG UTILS — Shared helpers for config modules
   
   Single Source of Truth for utility functions, interfaces, and
   constants used across domain-config, advancing-config, and
   create-entity-configs.
   ═══════════════════════════════════════════════════════════════ */

import type { LucideIcon } from "lucide-react";
import type { BadgeVariant } from "./ui-variants";

// ─── Shared Enum Config Interface ────────────────────────────
export interface EnumConfig<T extends string = string> {
    value: T;
    label: string;
    variant: BadgeVariant;
    description?: string;
    icon?: LucideIcon;
}

// ─── Enum Map Factory ────────────────────────────────────────
export function toEnumMap<T extends string>(entries: readonly EnumConfig<T>[]): Record<T, EnumConfig<T>> {
    return Object.fromEntries(entries.map((e) => [e.value, e])) as Record<T, EnumConfig<T>>;
}

// ─── Form Option Helpers ─────────────────────────────────────
export function mapToOptions(map: Record<string, { label: string }>): { value: string; label: string }[] {
    return Object.entries(map).map(([value, { label }]) => ({ value, label }));
}

export const YES_NO_OPTIONS = [
    { value: "true", label: "Yes" },
    { value: "false", label: "No" },
];
