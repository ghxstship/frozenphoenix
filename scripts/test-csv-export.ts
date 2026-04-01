/* eslint-disable no-console */
/**
 * CSV Export Audit Script
 *
 * Validates the CSV template registry and export field generation
 * for every entity in ENTITY_CONFIGS. Ensures:
 * 1. Every entity has a valid template in CSV_ENTITY_TEMPLATES
 * 2. All templates have at least one exportable field
 * 3. Select strings don't contain relation joins (nested objects)
 * 4. Field types map correctly from Zod schemas
 * 5. System fields are properly appended
 *
 * Run: npx tsx scripts/test-csv-export.ts
 */

import { ENTITY_CONFIGS } from "../src/lib/api/entity-config";
import { getEntityTemplate, getExportableFields } from "../src/lib/csv/csv-templates";
import { serializeCsv } from "../src/lib/csv/csv-utils";

// ─── Test Suite ───

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assert(label: string, condition: boolean, detail?: string) {
    if (condition) {
        passed++;
    } else {
        failed++;
        const msg = detail ? `FAIL: ${label} — ${detail}` : `FAIL: ${label}`;
        failures.push(msg);
        console.error(`  ❌ ${msg}`);
    }
}

console.log("═══════════════════════════════════════════════════");
console.log("  CSV Export Audit");
console.log("═══════════════════════════════════════════════════\n");

// 1. Verify every entity config produces a template
console.log("1. Template Generation\n");

const entityKeys = Object.keys(ENTITY_CONFIGS);
console.log(`   Total entity configs: ${entityKeys.length}\n`);

for (const entityKey of entityKeys) {
    const config = ENTITY_CONFIGS[entityKey]!;
    const template = getEntityTemplate(entityKey);

    assert(
        `${entityKey}: template exists`,
        template != null,
        `No template found for entity "${entityKey}" (table: ${config.table})`
    );

    if (!template) continue;

    // Table name matches
    assert(
        `${entityKey}: dbTable matches config.table`,
        template.dbTable === config.table,
        `Expected "${config.table}", got "${template.dbTable}"`
    );

    // Has at least one field
    assert(`${entityKey}: has fields`, template.fields.length > 0, `Template has 0 fields`);

    // Has exportable fields
    const exportable = getExportableFields(template);
    assert(
        `${entityKey}: has exportable fields`,
        exportable.length > 0,
        `Template has 0 exportable fields`
    );

    // selectQuery does NOT contain relation joins
    if (template.selectQuery) {
        const hasJoins = /\w+:\w+\(/.test(template.selectQuery);
        assert(
            `${entityKey}: selectQuery has no relation joins`,
            !hasJoins,
            `selectQuery "${template.selectQuery}" contains relation joins that will produce nested objects in CSV`
        );
    }

    // System fields present
    const hasId = template.fields.some((f) => f.dbColumn === "id");
    const hasCreatedAt = template.fields.some((f) => f.dbColumn === "created_at");
    assert(`${entityKey}: has 'id' field`, hasId);
    assert(`${entityKey}: has 'created_at' field`, hasCreatedAt);

    // Field types are valid
    const validTypes = [
        "string",
        "number",
        "boolean",
        "date",
        "enum",
        "email",
        "url",
        "uuid",
        "json",
    ];
    for (const field of template.fields) {
        assert(
            `${entityKey}.${field.dbColumn}: valid type`,
            validTypes.includes(field.type),
            `Invalid type "${field.type}"`
        );
    }
}

// 2. Verify CSV serialization works
console.log("\n2. CSV Serialization\n");

for (const entityKey of entityKeys) {
    const template = getEntityTemplate(entityKey);
    if (!template) continue;

    const exportFields = getExportableFields(template);
    if (exportFields.length === 0) continue;

    // Build mock data matching field structure
    const mockRow: Record<string, unknown> = {};
    for (const field of exportFields) {
        switch (field.type) {
            case "number":
                mockRow[field.dbColumn] = 42;
                break;
            case "boolean":
                mockRow[field.dbColumn] = true;
                break;
            case "uuid":
                mockRow[field.dbColumn] = "00000000-0000-0000-0000-000000000000";
                break;
            case "date":
                mockRow[field.dbColumn] = "2025-01-15T10:00:00Z";
                break;
            default:
                mockRow[field.dbColumn] = `test_${field.dbColumn}`;
        }
    }

    const headers = exportFields.map((f) => ({ key: f.dbColumn, label: f.csvHeader }));
    try {
        const csv = serializeCsv([mockRow], headers);
        assert(
            `${entityKey}: serialization succeeds`,
            csv.length > 0 && csv.includes(","),
            `CSV output empty or malformed`
        );

        // Verify header line contains all labels
        const headerLine = csv.split("\r\n")[0]!;
        for (const h of headers) {
            const labelPresent =
                headerLine.includes(h.label) || headerLine.includes(`"${h.label}"`);
            assert(
                `${entityKey}: header contains "${h.label}"`,
                labelPresent,
                `Header "${h.label}" missing from CSV header line`
            );
        }
    } catch (err) {
        assert(
            `${entityKey}: serialization succeeds`,
            false,
            `Serialization threw: ${err instanceof Error ? err.message : String(err)}`
        );
    }
}

// 3. Verify select string building
console.log("\n3. Select String Validation\n");

for (const entityKey of entityKeys) {
    const template = getEntityTemplate(entityKey);
    if (!template) continue;

    const exportFields = getExportableFields(template);
    const selectColumns = exportFields.map((f) => f.dbColumn).join(", ");

    // Select string should be valid PostgreSQL column list
    const invalidChars = selectColumns.match(/[()]/);
    assert(
        `${entityKey}: select string is flat columns only`,
        !invalidChars,
        `Select string contains parentheses (joins): "${selectColumns.substring(0, 100)}..."`
    );
}

// ─── Summary ───

console.log("\n═══════════════════════════════════════════════════");
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log("═══════════════════════════════════════════════════\n");

if (failures.length > 0) {
    console.log("Failures:\n");
    for (const f of failures) {
        console.log(`  • ${f}`);
    }
    console.log();
    process.exit(1);
}

console.log("✅ All tests passed!\n");
process.exit(0);
