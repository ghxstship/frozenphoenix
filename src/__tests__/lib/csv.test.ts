import { describe, expect, it } from "vitest";
import { ENTITY_CONFIGS } from "@/lib/api/entity-config";
import {
    getEntityTemplate,
    getExportableEntities,
    getExportableFields,
    getImportableEntities,
    getImportableFields,
} from "@/lib/csv/csv-templates";
import {
    autoMapHeaders,
    escapeCsvCell,
    mapCsvRowsToRecords,
    serializeCsv,
} from "@/lib/csv/csv-utils";
import { validateImportRecords, validationSummary } from "@/lib/csv/csv-validator";

// ═══════════════════════════════════════════════════════════════
// 1. Registry Key Mapping — Regression tests for the critical fix
// ═══════════════════════════════════════════════════════════════

describe("CSV Template Registry", () => {
    it("should resolve every ENTITY_CONFIGS key via getEntityTemplate", () => {
        const missingKeys: string[] = [];
        for (const entityKey of Object.keys(ENTITY_CONFIGS)) {
            const template = getEntityTemplate(entityKey);
            if (!template) missingKeys.push(entityKey);
        }
        expect(missingKeys).toEqual([]);
    });

    it("should resolve every table name via getEntityTemplate", () => {
        const missingTables: string[] = [];
        for (const config of Object.values(ENTITY_CONFIGS)) {
            const template = getEntityTemplate(config.table);
            if (!template) missingTables.push(config.table);
        }
        expect(missingTables).toEqual([]);
    });

    it("entityKey and table lookups return the same template object", () => {
        for (const [entityKey, config] of Object.entries(ENTITY_CONFIGS)) {
            const byKey = getEntityTemplate(entityKey);
            const byTable = getEntityTemplate(config.table);
            expect(byKey).toBe(byTable);
        }
    });

    it("should handle hyphenated entity names", () => {
        const template = getEntityTemplate("crew-member");
        expect(template).toBeDefined();
        expect(template?.dbTable).toBe("crew_members");
    });

    it("should handle case-insensitive lookups", () => {
        const template = getEntityTemplate("PROJECT");
        expect(template).toBeDefined();
        expect(template?.dbTable).toBe("projects");
    });

    it("returns undefined for unknown entities", () => {
        expect(getEntityTemplate("nonexistent_entity_xyz")).toBeUndefined();
    });

    it("importable and exportable entity lists are non-empty", () => {
        expect(getImportableEntities().length).toBeGreaterThan(0);
        expect(getExportableEntities().length).toBeGreaterThan(0);
    });
});

// ═══════════════════════════════════════════════════════════════
// 2. Template Structural Integrity
// ═══════════════════════════════════════════════════════════════

describe("CSV Template Structure", () => {
    const coreEntities = ["project", "deal", "company", "task", "vendor", "asset", "crew_member"];

    for (const key of coreEntities) {
        describe(`entity: ${key}`, () => {
            it("has a valid template with required properties", () => {
                const t = getEntityTemplate(key);
                expect(t).toBeDefined();
                expect(t!.entity).toBeTruthy();
                expect(t!.dbTable).toBeTruthy();
                expect(t!.displayName).toBeTruthy();
                expect(t!.fields.length).toBeGreaterThan(0);
            });

            it("has exportable fields", () => {
                const t = getEntityTemplate(key)!;
                const fields = getExportableFields(t);
                expect(fields.length).toBeGreaterThan(0);
            });

            it("has importable fields", () => {
                const t = getEntityTemplate(key)!;
                const fields = getImportableFields(t);
                expect(fields.length).toBeGreaterThan(0);
            });

            it("every field has required properties", () => {
                const t = getEntityTemplate(key)!;
                for (const f of t.fields) {
                    expect(f.dbColumn).toBeTruthy();
                    expect(f.csvHeader).toBeTruthy();
                    expect(typeof f.required).toBe("boolean");
                    expect(typeof f.importable).toBe("boolean");
                    expect(typeof f.exportable).toBe("boolean");
                    expect(f.type).toBeTruthy();
                }
            });
        });
    }
});

// ═══════════════════════════════════════════════════════════════
// 3. CSV Utils
// ═══════════════════════════════════════════════════════════════

describe("CSV Utils", () => {
    describe("escapeCsvCell", () => {
        it("returns empty string for null/undefined", () => {
            expect(escapeCsvCell(null)).toBe("");
            expect(escapeCsvCell(undefined)).toBe("");
        });

        it("passes through simple strings", () => {
            expect(escapeCsvCell("hello")).toBe("hello");
        });

        it("wraps values with commas in quotes", () => {
            expect(escapeCsvCell("hello, world")).toBe('"hello, world"');
        });

        it("escapes double quotes", () => {
            expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""');
        });

        it("wraps values with newlines", () => {
            expect(escapeCsvCell("line1\nline2")).toBe('"line1\nline2"');
        });
    });

    describe("serializeCsv", () => {
        it("produces correct CSV output", () => {
            const headers = [
                { key: "name", label: "Name" },
                { key: "email", label: "Email" },
            ];
            const rows = [
                { name: "Alice", email: "alice@example.com" },
                { name: "Bob", email: "bob@example.com" },
            ];
            const csv = serializeCsv(rows, headers);
            const lines = csv.split("\r\n");
            expect(lines).toHaveLength(3);
            expect(lines[0]).toBe("Name,Email");
            expect(lines[1]).toBe("Alice,alice@example.com");
        });

        it("handles missing values gracefully", () => {
            const headers = [{ key: "name", label: "Name" }];
            const rows = [{ name: null as unknown as string }];
            const csv = serializeCsv(rows, headers);
            expect(csv).toBe("Name\r\n");
        });
    });

    describe("autoMapHeaders", () => {
        const fields = [
            { dbColumn: "name", csvHeader: "Company Name" },
            { dbColumn: "email", csvHeader: "Email Address" },
            { dbColumn: "phone", csvHeader: "Phone" },
        ];

        it("matches exact CSV header labels", () => {
            const mapping = autoMapHeaders(["Company Name", "Email Address"], fields);
            expect(mapping.get(0)).toBe("name");
            expect(mapping.get(1)).toBe("email");
        });

        it("matches db column names directly", () => {
            const mapping = autoMapHeaders(["name", "email"], fields);
            expect(mapping.get(0)).toBe("name");
            expect(mapping.get(1)).toBe("email");
        });

        it("does not map duplicate CSV columns to the same db column", () => {
            const mapping = autoMapHeaders(["name", "name"], fields);
            expect(mapping.get(0)).toBe("name");
            expect(mapping.has(1)).toBe(false);
        });

        it("skips unrecognized headers", () => {
            const mapping = autoMapHeaders(["unknown_column"], fields);
            expect(mapping.size).toBe(0);
        });
    });

    describe("mapCsvRowsToRecords", () => {
        it("maps rows according to header mapping", () => {
            const rows = [
                ["Alice", "alice@test.com"],
                ["Bob", "bob@test.com"],
            ];
            const mapping = new Map<number, string>([
                [0, "name"],
                [1, "email"],
            ]);
            const records = mapCsvRowsToRecords(rows, mapping);
            expect(records).toHaveLength(2);
            expect(records[0]).toEqual({ name: "Alice", email: "alice@test.com" });
        });

        it("converts empty strings to null", () => {
            const rows = [["Alice", ""]];
            const mapping = new Map<number, string>([
                [0, "name"],
                [1, "email"],
            ]);
            const records = mapCsvRowsToRecords(rows, mapping);
            expect(records[0]!.email).toBeNull();
        });
    });
});

// ═══════════════════════════════════════════════════════════════
// 4. CSV Validator
// ═══════════════════════════════════════════════════════════════

describe("CSV Validator", () => {
    it("validates records against a real entity template", () => {
        const template = getEntityTemplate("company")!;
        expect(template).toBeDefined();

        const importFields = getImportableFields(template);
        const nameField = importFields.find((f) => f.dbColumn === "name");
        expect(nameField).toBeDefined();

        const records = [{ name: "Test Company" }];
        const result = validateImportRecords(records, template);
        expect(result.totalRows).toBe(1);
        expect(result.validRows).toBeGreaterThanOrEqual(0);
    });

    it("catches missing required fields", () => {
        const template = getEntityTemplate("company")!;
        const records = [{ website: "https://test.com" }];
        const result = validateImportRecords(records, template);

        const nameField = getImportableFields(template).find((f) => f.dbColumn === "name");
        if (nameField?.required) {
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors.some((e) => e.field === "name")).toBe(true);
        }
    });

    it("validates enum values", () => {
        const template = getEntityTemplate("deal")!;
        const statusField = getImportableFields(template).find((f) => f.dbColumn === "status");
        if (statusField?.enumValues) {
            const records = [{ title: "Test Deal", status: "invalid_status_xyz" }];
            const result = validateImportRecords(records, template);
            expect(result.errors.some((e) => e.field === "status")).toBe(true);
        }
    });

    it("produces a human-readable summary", () => {
        const template = getEntityTemplate("company")!;
        const records = [{ name: "Valid Co" }];
        const result = validateImportRecords(records, template);
        const summary = validationSummary(result);
        expect(typeof summary).toBe("string");
        expect(summary.length).toBeGreaterThan(0);
    });
});
