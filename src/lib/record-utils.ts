/* ═══════════════════════════════════════════════════════════════
   RECORD UTILS — Shared utility functions for entity records

   Single Source of Truth for:
   - getNestedValue: dot-notation access on record objects
   - matchesSearch: multi-key case-insensitive search
   - computeStatValue: stat value resolution for detail/dashboard
   - toDataTableColumn: ListColumnDef → ColumnDef mapping
   ═══════════════════════════════════════════════════════════════ */

import type { EntityRecord } from "@/types/entity";
import type { ColumnDef } from "@/components/data-view/data-table";
import type { ListColumnDef } from "@/types/list-page-config";

// ─── Nested Value Access ─────────────────────────────────────

/** Access a nested value on a record using dot notation (e.g. "project.name"). */
export function getNestedValue(record: EntityRecord, key: string): unknown {
    const parts = key.split(".");
    let current: unknown = record;
    for (const part of parts) {
        if (current == null || typeof current !== "object") return undefined;
        current = (current as EntityRecord)[part];
    }
    return current;
}

// ─── Search ──────────────────────────────────────────────────

/** Returns true if at least one of `keys` on `record` contains the `search` string (case-insensitive). */
export function matchesSearch(record: EntityRecord, search: string, keys: string[]): boolean {
    if (!search) return true;
    const q = search.toLowerCase();
    return keys.some((key) => {
        const val = getNestedValue(record, key);
        return val != null && String(val).toLowerCase().includes(q);
    });
}

// ─── Stat Value Resolution ───────────────────────────────────

interface StatDefLike {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    compute?: (data: any) => string | number;
    accessorKey?: string;
    value?: string | number;
}

/**
 * Resolve a stat definition to a concrete value.
 * Works with both record-based stats (DetailStatDef) and array-based stats (DashboardStatDef).
 */
export function computeStatValue(
    stat: StatDefLike,
    data: EntityRecord | EntityRecord[]
): string | number {
    if (stat.compute) return stat.compute(data);
    if (stat.value != null) return stat.value;
    if (stat.accessorKey && !Array.isArray(data)) {
        const val = getNestedValue(data, stat.accessorKey);
        return val != null ? String(val) : "—";
    }
    return "—";
}

// ─── Column Mapping ──────────────────────────────────────────

/** Map a ListColumnDef to a DataTable ColumnDef. */
export function toDataTableColumn(col: ListColumnDef): ColumnDef<EntityRecord> {
    return {
        id: col.id,
        header: col.header,
        accessorKey: col.accessorKey as keyof EntityRecord | undefined,
        accessorFn: col.accessorFn,
        fieldType: col.fieldType,
        fieldConfig: col.fieldConfig,
        render: col.render,
        sortable: col.sortable,
        width: col.width,
        minWidth: col.minWidth,
        align: col.align,
        hidden: col.hidden,
        sticky: col.sticky,
    };
}
