/**
 * use-column-preferences Hook Tests
 *
 * Verifies localStorage persistence, reorder, toggle visibility,
 * show/hide all, reset, and new-column merge behavior.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useColumnPreferences } from "@/hooks/use-column-preferences";

// ─── Storage Mock ────────────────────────────────────────────

const storageMap = new Map<string, string>();

beforeEach(() => {
    storageMap.clear();
    vi.stubGlobal("localStorage", {
        getItem: (key: string) => storageMap.get(key) ?? null,
        setItem: (key: string, value: string) => storageMap.set(key, value),
        removeItem: (key: string) => storageMap.delete(key),
    });
});

const DEFAULT_COLUMNS = [
    { id: "name", hidden: false, sticky: true },
    { id: "status", hidden: false },
    { id: "priority", hidden: false },
    { id: "created_at", hidden: true },
];

function setup(entityKey = "test_entity", defaultColumns = DEFAULT_COLUMNS) {
    return renderHook(() => useColumnPreferences({ entityKey, defaultColumns }));
}

// ═════════════════════════════════════════════════════════════

describe("useColumnPreferences", () => {
    it("returns default visibility from column definitions", () => {
        const { result } = setup();
        expect(result.current.visibility).toEqual({
            name: true,
            status: true,
            priority: true,
            created_at: false,
        });
    });

    it("returns default order matching column definition order", () => {
        const { result } = setup();
        expect(result.current.order).toEqual(["name", "status", "priority", "created_at"]);
    });

    // ─── Toggle Visibility ───

    it("toggleVisibility flips a column's visibility", () => {
        const { result } = setup();
        act(() => result.current.toggleVisibility("status"));
        expect(result.current.visibility.status).toBe(false);
        act(() => result.current.toggleVisibility("status"));
        expect(result.current.visibility.status).toBe(true);
    });

    it("toggleVisibility persists to localStorage", () => {
        const { result } = setup();
        act(() => result.current.toggleVisibility("priority"));
        expect(storageMap.has("fp-col-prefs-test_entity")).toBe(true);
        const stored = JSON.parse(storageMap.get("fp-col-prefs-test_entity")!);
        expect(stored.visibility.priority).toBe(false);
    });

    // ─── Show All / Hide All ───

    it("showAll makes all columns visible", () => {
        const { result } = setup();
        act(() => result.current.hideAll());
        act(() => result.current.showAll());
        for (const val of Object.values(result.current.visibility)) {
            expect(val).toBe(true);
        }
    });

    it("hideAll hides all non-sticky columns", () => {
        const { result } = setup();
        act(() => result.current.hideAll());
        expect(result.current.visibility.name).toBe(true); // sticky
        expect(result.current.visibility.status).toBe(false);
        expect(result.current.visibility.priority).toBe(false);
        expect(result.current.visibility.created_at).toBe(false);
    });

    // ─── Reset ───

    it("reset restores defaults", () => {
        const { result } = setup();
        act(() => {
            result.current.toggleVisibility("status");
            result.current.reorder("priority", "name");
        });
        act(() => result.current.reset());
        expect(result.current.visibility).toEqual({
            name: true,
            status: true,
            priority: true,
            created_at: false,
        });
        expect(result.current.order).toEqual(["name", "status", "priority", "created_at"]);
    });

    // ─── Reorder ───

    it("reorder moves a column to a new position", () => {
        const { result } = setup();
        // Move "priority" before "status"
        act(() => result.current.reorder("priority", "status"));
        expect(result.current.order).toEqual(["name", "priority", "status", "created_at"]);
    });

    it("reorder is a no-op for same ID", () => {
        const { result } = setup();
        act(() => result.current.reorder("status", "status"));
        expect(result.current.order).toEqual(["name", "status", "priority", "created_at"]);
    });

    it("reorder persists to localStorage", () => {
        const { result } = setup();
        act(() => result.current.reorder("created_at", "name"));
        const stored = JSON.parse(storageMap.get("fp-col-prefs-test_entity")!);
        expect(stored.order[0]).toBe("created_at");
    });

    // ─── New Column Merge ───

    it("merges new columns onto the end when loading existing prefs", () => {
        // Simulate stored prefs without a "due_date" column
        storageMap.set(
            "fp-col-prefs-test_entity",
            JSON.stringify({
                visibility: { name: true, status: false, priority: true, created_at: false },
                order: ["name", "priority", "status", "created_at"],
            })
        );

        const columnsWithNew = [...DEFAULT_COLUMNS, { id: "due_date", hidden: false }];

        const { result } = renderHook(() =>
            useColumnPreferences({ entityKey: "test_entity", defaultColumns: columnsWithNew })
        );

        // Old prefs preserved
        expect(result.current.visibility.status).toBe(false);
        // New column appears at end of order
        expect(result.current.order.at(-1)).toBe("due_date");
        // New column inherits default visibility
        expect(result.current.visibility.due_date).toBe(true);
    });
});
