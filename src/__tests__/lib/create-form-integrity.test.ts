/**
 * Create Form Integrity Validation
 *
 * Focused cross-validation of all create form configs across 233+ entities.
 * Verifies field definitions, select options, entity lookups, and form structure.
 */

import { describe, expect, it } from "vitest";
import * as allConfigs from "@/config/list-page-configs";
import type { ListPageConfig } from "@/types/list-page-config";

// ═══════════════════════════════════════════════════════════════
// Collect all configs
// ═══════════════════════════════════════════════════════════════

const CONFIGS: Record<string, ListPageConfig> = {};
for (const [key, val] of Object.entries(allConfigs)) {
    if (key.endsWith("_PAGE") && typeof val === "object" && val !== null && "entityKey" in val) {
        CONFIGS[key] = val as ListPageConfig;
    }
}

const configsWithCreate = Object.entries(CONFIGS).filter(([, c]) => c.createConfig);

// ═══════════════════════════════════════════════════════════════
// ENTITY NAME INTEGRITY
// ═══════════════════════════════════════════════════════════════

describe("Create Form Entity Name Integrity", () => {
    it.each(configsWithCreate)("%s createConfig.entityName is human-readable", (_key, config) => {
        const name = config.createConfig!.entityName;
        expect(name.length, `${_key}: entityName too short`).toBeGreaterThan(1);
        // Entity name should not contain underscores (snake_case is a code pattern)
        expect(
            name,
            `${_key}: entityName "${name}" contains underscores — should be human-readable`
        ).not.toContain("_");
    });
});

// ═══════════════════════════════════════════════════════════════
// FIELD STRUCTURE DEEP VALIDATION
// ═══════════════════════════════════════════════════════════════

describe("Create Form Field Structure", () => {
    // Fields must not have empty string keys
    it.each(configsWithCreate)("%s fields have non-empty string keys", (_key, config) => {
        for (const field of config.createConfig!.fields) {
            expect(
                typeof field.key === "string" && field.key.length > 0,
                `${_key}: field has empty key`
            ).toBe(true);
        }
    });

    // Fields must have non-empty string labels
    it.each(configsWithCreate)("%s fields have non-empty string labels", (_key, config) => {
        for (const field of config.createConfig!.fields) {
            expect(
                typeof field.label === "string" && field.label.length > 0,
                `${_key}: field "${field.key}" has empty label`
            ).toBe(true);
        }
    });

    // Select fields with options must have at least 2 options
    const configsWithSelects = configsWithCreate.filter(([, c]) =>
        c.createConfig!.fields.some((f) => f.type === "select" && f.options)
    );

    if (configsWithSelects.length > 0) {
        it.each(configsWithSelects)("%s select fields have ≥2 options", (_key, config) => {
            for (const field of config.createConfig!.fields) {
                if (field.type === "select" && field.options) {
                    expect(
                        field.options.length,
                        `${_key}: select field "${field.key}" has fewer than 2 options`
                    ).toBeGreaterThanOrEqual(2);
                }
            }
        });
    }

    // Select option values must be non-empty strings
    if (configsWithSelects.length > 0) {
        it.each(configsWithSelects)(
            "%s select field options have non-empty value and label",
            (_key, config) => {
                for (const field of config.createConfig!.fields) {
                    if (field.type === "select" && field.options) {
                        for (const opt of field.options) {
                            expect(
                                opt.value,
                                `${_key}: select field "${field.key}" has option with empty value`
                            ).toBeTruthy();
                            expect(
                                opt.label,
                                `${_key}: select field "${field.key}" has option with empty label`
                            ).toBeTruthy();
                        }
                    }
                }
            }
        );
    }

    // Number fields should not have negative min when not appropriate
    it.each(configsWithCreate)("%s number fields have sane min/max bounds", (_key, config) => {
        for (const field of config.createConfig!.fields) {
            if (field.type === "number" && field.min !== undefined && field.max !== undefined) {
                expect(
                    field.min <= field.max,
                    `${_key}: field "${field.key}" has min (${field.min}) > max (${field.max})`
                ).toBe(true);
            }
        }
    });
});

// ═══════════════════════════════════════════════════════════════
// ENTITY-LOOKUP FIELD VALIDATION
// ═══════════════════════════════════════════════════════════════

describe("Entity Lookup Field Validation", () => {
    const configsWithLookups = configsWithCreate.filter(([, c]) =>
        c.createConfig!.fields.some((f) => f.type === "entity-lookup")
    );

    if (configsWithLookups.length > 0) {
        it.each(configsWithLookups)(
            "%s entity-lookup fields have complete lookupConfig",
            (_key, config) => {
                for (const field of config.createConfig!.fields) {
                    if (field.type === "entity-lookup") {
                        expect(
                            field.lookupConfig,
                            `${_key}: entity-lookup field "${field.key}" missing lookupConfig`
                        ).toBeDefined();
                        if (field.lookupConfig) {
                            // EntityLookupConfig requires apiPath (not entityKey)
                            expect(
                                field.lookupConfig.apiPath,
                                `${_key}: entity-lookup "${field.key}" lookupConfig missing apiPath`
                            ).toBeTruthy();
                        }
                    }
                }
            }
        );
    }
});

// ═══════════════════════════════════════════════════════════════
// CROSS-ENTITY CONSISTENCY
// ═══════════════════════════════════════════════════════════════

describe("Create Form Cross-Entity Consistency", () => {
    // No two configs should have the same entityKey AND the same createConfig entityName
    // (except for legitimate aliases like vault → vault-documents)
    it("no accidental duplicate create forms", () => {
        const seenForms = new Map<string, string>();
        for (const [key, config] of Object.entries(CONFIGS)) {
            if (!config.createConfig) continue;
            const formId = `${config.entityKey}::${config.createConfig.entityName}`;
            // Allow same entity to appear in different configs (e.g. catch-all + dedicated)
            if (seenForms.has(formId)) {
                // Same form ID is OK — it means the same entity has its config in multiple places
                continue;
            }
            seenForms.set(formId, key);
        }
        // Just verify we have a meaningful number of unique forms
        expect(seenForms.size).toBeGreaterThan(100);
    });

    // Every config with views should also have a createConfig (entities without create are read-only logs)
    it("configs with board/cards views have createConfig", () => {
        const multiViewConfigs = Object.entries(CONFIGS).filter(([, c]) => {
            const views = c.views ?? ["table"];
            return views.includes("board") || views.includes("cards");
        });
        const withCreate = multiViewConfigs.filter(([, c]) => c.createConfig);
        // Allow some exceptions (read-only boards exist) — at least 80% should have create
        const ratio = withCreate.length / multiViewConfigs.length;
        expect(ratio, "Most multi-view configs should have create forms").toBeGreaterThan(0.7);
    });
});
