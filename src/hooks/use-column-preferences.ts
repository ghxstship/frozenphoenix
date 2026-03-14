"use client";

/* ═══════════════════════════════════════════════════════════════
   USE COLUMN PREFERENCES — Persist column visibility & order

   Stores per-entity column visibility and order in localStorage.
   Falls back to config defaults when no stored prefs exist.
   ═══════════════════════════════════════════════════════════════ */

import { useCallback, useMemo, useState } from "react";

// ─── Types ───

export interface ColumnPreferences {
    /** Map of columnId → visible (true/false) */
    visibility: Record<string, boolean>;
    /** Ordered array of column IDs */
    order: string[];
}

interface UseColumnPreferencesOptions {
    /** Storage key prefix (typically entity name) */
    entityKey: string;
    /** Default column definitions — used to derive initial state */
    defaultColumns: { id: string; hidden?: boolean; sticky?: boolean }[];
}

interface UseColumnPreferencesReturn {
    /** Current visibility map */
    visibility: Record<string, boolean>;
    /** Current column order */
    order: string[];
    /** Toggle a single column's visibility */
    toggleVisibility: (columnId: string) => void;
    /** Show all columns */
    showAll: () => void;
    /** Hide all non-sticky columns */
    hideAll: () => void;
    /** Reset to config defaults */
    reset: () => void;
    /** Reorder columns (move columnId to newIndex) */
    reorder: (activeId: string, overId: string) => void;
}

// ─── Storage Helpers ───

const STORAGE_PREFIX = "fp-col-prefs-";

function loadPrefs(entityKey: string): ColumnPreferences | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(`${STORAGE_PREFIX}${entityKey}`);
        if (!raw) return null;
        return JSON.parse(raw) as ColumnPreferences;
    } catch {
        return null;
    }
}

function savePrefs(entityKey: string, prefs: ColumnPreferences): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(`${STORAGE_PREFIX}${entityKey}`, JSON.stringify(prefs));
    } catch {
        // Storage full or unavailable — silently ignore
    }
}

// ─── Hook ───

export function useColumnPreferences({
    entityKey,
    defaultColumns,
}: UseColumnPreferencesOptions): UseColumnPreferencesReturn {
    const defaults = useMemo(() => {
        const vis: Record<string, boolean> = {};
        const ord: string[] = [];
        for (const col of defaultColumns) {
            vis[col.id] = !col.hidden;
            ord.push(col.id);
        }
        return { visibility: vis, order: ord };
    }, [defaultColumns]);

    const [prefs, setPrefs] = useState<ColumnPreferences>(() => {
        const stored = loadPrefs(entityKey);
        if (stored) {
            // Merge stored prefs with any new columns not in storage
            const merged: ColumnPreferences = {
                visibility: { ...defaults.visibility },
                order: [...defaults.order],
            };
            // Apply stored visibility
            for (const [id, vis] of Object.entries(stored.visibility)) {
                if (id in merged.visibility) {
                    merged.visibility[id] = vis;
                }
            }
            // Apply stored order (only for columns that still exist)
            const validStoredOrder = stored.order.filter((id) => id in merged.visibility);
            const newColumns = merged.order.filter((id) => !validStoredOrder.includes(id));
            merged.order = [...validStoredOrder, ...newColumns];
            return merged;
        }
        return defaults;
    });

    const update = useCallback(
        (next: ColumnPreferences) => {
            setPrefs(next);
            savePrefs(entityKey, next);
        },
        [entityKey]
    );

    const toggleVisibility = useCallback(
        (columnId: string) => {
            const next = {
                ...prefs,
                visibility: { ...prefs.visibility, [columnId]: !prefs.visibility[columnId] },
            };
            update(next);
        },
        [prefs, update]
    );

    const showAll = useCallback(() => {
        const vis: Record<string, boolean> = {};
        for (const id of Object.keys(prefs.visibility)) {
            vis[id] = true;
        }
        update({ ...prefs, visibility: vis });
    }, [prefs, update]);

    const hideAll = useCallback(() => {
        const vis: Record<string, boolean> = {};
        for (const col of defaultColumns) {
            vis[col.id] = col.sticky === true;
        }
        update({ ...prefs, visibility: vis });
    }, [prefs, defaultColumns, update]);

    const reset = useCallback(() => {
        update(defaults);
    }, [defaults, update]);

    const reorder = useCallback(
        (activeId: string, overId: string) => {
            if (activeId === overId) return;
            const currentOrder = [...prefs.order];
            const activeIdx = currentOrder.indexOf(activeId);
            const overIdx = currentOrder.indexOf(overId);
            if (activeIdx === -1 || overIdx === -1) return;
            currentOrder.splice(activeIdx, 1);
            currentOrder.splice(overIdx, 0, activeId);
            update({ ...prefs, order: currentOrder });
        },
        [prefs, update]
    );

    return {
        visibility: prefs.visibility,
        order: prefs.order,
        toggleVisibility,
        showAll,
        hideAll,
        reset,
        reorder,
    };
}
