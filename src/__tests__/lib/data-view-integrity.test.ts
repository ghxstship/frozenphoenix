/**
 * Data View Integrity Validation
 *
 * Verifies that every ListPageConfig with multi-view support has
 * the required sub-configs for each declared view, and that the
 * slug registry → config key registry chain is fully connected.
 */

import { describe, expect, it } from "vitest";

// Import all configs from the barrel export (used by tests only)
import * as allConfigs from "@/config/list-page-configs";
import { SLUG_TO_CONFIG_KEY } from "@/config/list-page-configs/slug-registry";
import type { ListPageConfig } from "@/types/list-page-config";

// ═══════════════════════════════════════════════════════════════
// Collect every exported config into a flat record
// ═══════════════════════════════════════════════════════════════

const CONFIGS: Record<string, ListPageConfig> = {};
for (const [key, val] of Object.entries(allConfigs)) {
    if (key.endsWith("_PAGE") && typeof val === "object" && val !== null && "entityKey" in val) {
        CONFIGS[key] = val as ListPageConfig;
    }
}

// Mapping from ViewMode → config property name
const VIEW_TO_CONFIG: Record<string, keyof ListPageConfig> = {
    board: "boardConfig",
    cards: "cardConfig",
    timeline: "timelineConfig",
    calendar: "calendarConfig",
    gallery: "galleryConfig",
    chart: "chartConfig",
    map: "mapConfig",
    workload: "workloadConfig",
};

// ═══════════════════════════════════════════════════════════════
// VIEW CONFIG INTEGRITY — Every declared view has its sub-config
// ═══════════════════════════════════════════════════════════════

describe("Data View Config Integrity", () => {
    const configEntries = Object.entries(CONFIGS);

    it("has configs to validate", () => {
        expect(configEntries.length).toBeGreaterThan(50);
    });

    // Build test cases: [configKey, viewMode, requiredConfigProp]
    const testCases: [string, string, string][] = [];
    for (const [configKey, config] of configEntries) {
        const views = config.views ?? ["table"];
        for (const view of views) {
            if (view === "table") continue; // table has no sub-config requirement
            const configProp = VIEW_TO_CONFIG[view];
            if (configProp) {
                testCases.push([configKey, view, configProp]);
            }
        }
    }

    it("found multi-view configs to validate", () => {
        expect(testCases.length).toBeGreaterThan(30);
    });

    it.each(testCases)("%s declares '%s' view → requires %s", (configKey, _view, configProp) => {
        const config = CONFIGS[configKey]!;
        expect(
            config[configProp as keyof ListPageConfig],
            `${configKey} has '${_view}' in views[] but is missing ${configProp}`
        ).toBeDefined();
    });
});

// ═══════════════════════════════════════════════════════════════
// DEFAULT VIEW VALIDITY — defaultView must be in views[]
// ═══════════════════════════════════════════════════════════════

describe("Default View Validity", () => {
    const withDefaultView = Object.entries(CONFIGS).filter(([, c]) => c.defaultView);

    it.each(withDefaultView)("%s defaultView is in views[]", (_key, config) => {
        const views = config.views ?? ["table"];
        expect(
            views,
            `${_key}: defaultView="${config.defaultView}" is not in views=[${views.join(", ")}]`
        ).toContain(config.defaultView);
    });
});

// ═══════════════════════════════════════════════════════════════
// SLUG REGISTRY → CONFIG KEY CROSS-REFERENCE
// ═══════════════════════════════════════════════════════════════

describe("Slug Registry ↔ Config Key Integrity", () => {
    const slugEntries = Object.entries(SLUG_TO_CONFIG_KEY);

    it("slug registry has entries", () => {
        expect(slugEntries.length).toBeGreaterThan(100);
    });

    it.each(slugEntries)("slug '%s' → config key '%s' exists in configs", (_slug, configKey) => {
        expect(
            CONFIGS[configKey],
            `Slug "${_slug}" maps to "${configKey}" which is not a valid exported config`
        ).toBeDefined();
    });
});

// ═══════════════════════════════════════════════════════════════
// ENTITY KEY PRESENCE — Every config must have an entityKey
// ═══════════════════════════════════════════════════════════════

describe("Entity Key Presence", () => {
    it.each(Object.entries(CONFIGS))("%s has a non-empty entityKey", (_key, config) => {
        expect(config.entityKey).toBeTruthy();
        expect(typeof config.entityKey).toBe("string");
    });
});

// ═══════════════════════════════════════════════════════════════
// COLUMN DEFINITIONS — Configs with columns have valid structure
// ═══════════════════════════════════════════════════════════════

describe("Column Definition Validity", () => {
    const withColumns = Object.entries(CONFIGS).filter(
        ([, c]) => c.columns && c.columns.length > 0
    );

    it("found configs with explicit columns", () => {
        expect(withColumns.length).toBeGreaterThan(20);
    });

    it.each(withColumns)("%s columns all have id and header", (_key, config) => {
        for (const col of config.columns!) {
            expect(col.id, `Column in ${_key} missing id`).toBeTruthy();
            expect(col.header, `Column ${col.id} in ${_key} missing header`).toBeTruthy();
            // Must have either accessorKey or accessorFn
            expect(
                col.accessorKey || col.accessorFn || col.render,
                `Column ${col.id} in ${_key} has no accessor or render`
            ).toBeTruthy();
        }
    });
});
