/* ═══════════════════════════════════════════════════════════════
   CSV TEMPLATE GENERATOR — Dynamic CsvEntityTemplate derivation

   Introspects Zod create schemas and EntityConfig metadata to
   produce CsvEntityTemplate objects for every registered entity.
   Replaces the previous approach of hand-coding each template.

   Human-authored overrides (descriptions, examples, import/export
   flags) are merged from csv-template-overrides.ts so existing
   curated templates retain their polish.
   ═══════════════════════════════════════════════════════════════ */

import { z } from "zod";
import type { EntityConfig } from "@/lib/api/entity-config";
import type { CsvEntityTemplate, CsvFieldDef, CsvFieldType } from "./csv-templates";

// ─── Zod v4 Introspection Helpers ───────────────────────────
//
// Zod v4 does not expose `_def` or `typeName` on public TypeScript types.
// Runtime introspection of the internal schema structure requires `any`
// casts. This is stable across Zod 3 & 4 and is the standard approach
// used by the Zod ecosystem (e.g. zod-to-json-schema).
//
// The `any` usage is scoped to this section only.
/* eslint-disable @typescript-eslint/no-explicit-any */

/** Read the internal `_def` of any Zod schema. */
function getDef(schema: any): any {
    return schema?._def ?? null;
}

/**
 * Read the Zod type discriminator string.
 * Zod v3: `_def.typeName` = "ZodObject"
 * Zod v4: `_def.type` = "object"
 * We normalize to v3 format for consistency.
 */
function getTypeName(schema: any): string | null {
    const def = getDef(schema);
    if (!def) return null;
    // Zod v3
    if (def.typeName) return def.typeName;
    // Zod v4 — normalize to v3-style names
    if (def.type) return ZOD_V4_TO_V3[def.type] ?? null;
    return null;
}

/** Map Zod v4 `_def.type` strings to their v3 `_def.typeName` equivalents. */
const ZOD_V4_TO_V3: Record<string, string> = {
    object: "ZodObject",
    string: "ZodString",
    number: "ZodNumber",
    boolean: "ZodBoolean",
    enum: "ZodEnum",
    optional: "ZodOptional",
    nullable: "ZodNullable",
    default: "ZodDefault",
    catch: "ZodCatch",
    readonly: "ZodReadonly",
    effects: "ZodEffects",
    pipeline: "ZodPipeline",
    lazy: "ZodLazy",
    union: "ZodUnion",
    array: "ZodArray",
    record: "ZodRecord",
    tuple: "ZodTuple",
    literal: "ZodLiteral",
    branded: "ZodBranded",
    intersection: "ZodIntersection",
    nativeEnum: "ZodNativeEnum",
};

/**
 * Unwrap Zod wrappers (optional, default, nullable, pipe, effects,
 * branded, lazy, catch) to reach the innermost "leaf" type.
 */
function unwrapZod(schema: any): any {
    let current = schema;
    for (let i = 0; i < 20; i++) {
        const def = getDef(current);
        if (!def) break;
        const tn = def.typeName as string | undefined;

        if (
            tn === "ZodOptional" ||
            tn === "ZodNullable" ||
            tn === "ZodDefault" ||
            tn === "ZodCatch" ||
            tn === "ZodBranded" ||
            tn === "ZodReadonly"
        ) {
            current = def.innerType;
            continue;
        }
        if (tn === "ZodEffects") {
            current = def.schema;
            continue;
        }
        if (tn === "ZodPipeline") {
            current = def.out;
            continue;
        }
        if (tn === "ZodLazy") {
            current = def.getter();
            continue;
        }
        if (tn === "ZodUnion") {
            const options = def.options as any[];
            const nonLiteral = options.find((o: any) => getTypeName(o) !== "ZodLiteral");
            if (nonLiteral) {
                current = nonLiteral;
                continue;
            }
        }
        break;
    }
    return current;
}

/**
 * Determine whether a Zod field is required (i.e. not optional/nullable
 * and has no default).
 */
function isRequired(schema: any): boolean {
    let current = schema;
    for (let i = 0; i < 20; i++) {
        const def = getDef(current);
        if (!def) break;
        const tn = def.typeName as string | undefined;

        if (tn === "ZodOptional" || tn === "ZodNullable") {
            return false;
        }
        if (tn === "ZodDefault" || tn === "ZodCatch") {
            return false;
        }
        if (tn === "ZodEffects") {
            current = def.schema;
            continue;
        }
        if (tn === "ZodPipeline") {
            current = def.in;
            continue;
        }
        if (tn === "ZodUnion") {
            const options = def.options as any[];
            if (
                options.some((o: any) => {
                    const otn = getTypeName(o);
                    return otn === "ZodLiteral" || otn === "ZodOptional";
                })
            ) {
                return false;
            }
        }
        break;
    }
    return true;
}

/**
 * Map the innermost Zod type to a CsvFieldType.
 */
function inferCsvFieldType(schema: any): CsvFieldType {
    const inner = unwrapZod(schema);
    const typeName = getTypeName(inner);

    switch (typeName) {
        case "ZodNumber":
            return "number";
        case "ZodBoolean":
            return "boolean";
        case "ZodEnum":
        case "ZodNativeEnum":
            return "enum";
        case "ZodString": {
            const checks = getDef(inner)?.checks as Array<{ kind: string }> | undefined;
            if (checks) {
                for (const check of checks) {
                    if (check.kind === "email") return "email";
                    if (check.kind === "uuid") return "uuid";
                    if (check.kind === "url") return "url";
                    if (check.kind === "datetime") return "date";
                }
                for (const check of checks) {
                    if (check.kind === "regex" && /\\d\{4\}/.test(String((check as any).regex))) {
                        return "date";
                    }
                }
            }
            return "string";
        }
        case "ZodArray":
        case "ZodObject":
        case "ZodRecord":
        case "ZodTuple":
            return "json";
        default:
            return "string";
    }
}

/**
 * Extract enum values from a Zod schema (if it wraps a ZodEnum).
 */
function extractEnumValues(schema: any): string[] | undefined {
    const inner = unwrapZod(schema);
    const tn = getTypeName(inner);
    if (tn === "ZodEnum") {
        return getDef(inner).values as string[];
    }
    if (tn === "ZodNativeEnum") {
        return Object.values(getDef(inner).values) as string[];
    }
    return undefined;
}

/* eslint-enable @typescript-eslint/no-explicit-any */

// ─── Column Name → Header Formatting ────────────────────────

/**
 * Convert a snake_case DB column name into a human-readable CSV header.
 * e.g. "expected_close_date" → "Expected Close Date"
 */
function columnToHeader(column: string): string {
    return column
        .split("_")
        .map((word) => {
            if (word === "id") return "ID";
            if (word === "url") return "URL";
            if (word === "uuid") return "UUID";
            if (word === "po") return "PO";
            if (word === "sla") return "SLA";
            if (word === "ip") return "IP";
            if (word === "hr") return "HR";
            if (word === "qc") return "QC";
            if (word === "rfq") return "RFQ";
            if (word === "sop") return "SOP";
            if (word === "roi") return "ROI";
            if (word === "etl") return "ETL";
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(" ");
}

// ─── System Field Definitions ────────────────────────────────

const SYSTEM_FIELDS: CsvFieldDef[] = [
    {
        dbColumn: "id",
        csvHeader: "ID",
        required: false,
        type: "uuid",
        importable: false,
        exportable: true,
        example: "auto-generated",
        description: "System-generated unique identifier",
    },
    {
        dbColumn: "created_at",
        csvHeader: "Created At",
        required: false,
        type: "date",
        importable: false,
        exportable: true,
        example: "2025-01-15T10:30:00Z",
        description: "Record creation timestamp (ISO 8601)",
    },
    {
        dbColumn: "updated_at",
        csvHeader: "Updated At",
        required: false,
        type: "date",
        importable: false,
        exportable: true,
        example: "2025-02-01T14:00:00Z",
        description: "Last update timestamp (ISO 8601)",
    },
    {
        dbColumn: "organization_id",
        csvHeader: "Organization ID",
        required: false,
        type: "uuid",
        importable: false,
        exportable: false,
        example: "",
        description: "Auto-set from authenticated user",
    },
];

/** Columns that should never appear as importable user fields */
const SYSTEM_COLUMN_NAMES = new Set([
    "id",
    "created_at",
    "updated_at",
    "deleted_at",
    "organization_id",
    "tenant_id",
    "created_by",
    "updated_by",
]);

// ─── Example Value Generation ────────────────────────────────

function generateExample(column: string, fieldType: CsvFieldType, enumValues?: string[]): string {
    if (enumValues && enumValues.length > 0) {
        return enumValues[0] ?? "";
    }
    switch (fieldType) {
        case "uuid":
            return column.endsWith("_id") ? `uuid-of-${column.replace(/_id$/, "")}` : "uuid";
        case "email":
            return "user@example.com";
        case "url":
            return "https://example.com";
        case "date":
            return "2025-06-15";
        case "number":
            return "0";
        case "boolean":
            return "true";
        case "json":
            return "{}";
        case "string":
        default:
            return "";
    }
}

// ─── Field Override Types ────────────────────────────────────

export interface FieldOverride {
    csvHeader?: string | undefined;
    description?: string | undefined;
    example?: string | undefined;
    importable?: boolean | undefined;
    exportable?: boolean | undefined;
    required?: boolean | undefined;
    type?: CsvFieldType | undefined;
    enumValues?: string[] | undefined;
}

export interface TemplateOverride {
    description?: string | undefined;
    importEnabled?: boolean | undefined;
    exportEnabled?: boolean | undefined;
    defaultSort?: { column: string; ascending: boolean } | undefined;
    selectQuery?: string | undefined;
    fields?:
        | Record<string, FieldOverride>
        | undefined; /** Extra fields to append (not derived from Zod schema) */
    extraFields?: CsvFieldDef[] | undefined;
}

// ─── Core Generator ──────────────────────────────────────────

/**
 * Generate a CsvEntityTemplate dynamically from EntityConfig + Zod schema.
 *
 * @param config  The entity's config from ENTITY_CONFIGS
 * @param schema  The entity's Zod create schema (z.object)
 * @param override  Optional human-authored overrides for polish
 */
export function generateCsvTemplate(
    config: EntityConfig,
    schema: z.ZodSchema | undefined,
    override?: TemplateOverride
): CsvEntityTemplate {
    const fields: CsvFieldDef[] = [];

    // Extract fields from Zod schema if it's a z.object
    if (schema) {
        const shape = extractShape(schema);
        if (shape) {
            for (const [column, fieldSchema] of Object.entries(shape)) {
                if (SYSTEM_COLUMN_NAMES.has(column)) continue;

                const fieldType = inferCsvFieldType(fieldSchema);
                const enumVals = extractEnumValues(fieldSchema);
                const required = isRequired(fieldSchema);
                const fieldOverride = override?.fields?.[column];

                fields.push({
                    dbColumn: column,
                    csvHeader: fieldOverride?.csvHeader ?? columnToHeader(column),
                    required: fieldOverride?.required ?? required,
                    type: fieldOverride?.type ?? fieldType,
                    enumValues: fieldOverride?.enumValues ?? enumVals,
                    importable: fieldOverride?.importable ?? true,
                    exportable: fieldOverride?.exportable ?? true,
                    example:
                        fieldOverride?.example ??
                        generateExample(
                            column,
                            fieldOverride?.type ?? fieldType,
                            fieldOverride?.enumValues ?? enumVals
                        ),
                    description: fieldOverride?.description ?? columnToHeader(column),
                });
            }
        }
    }

    // Append extra fields from overrides (e.g. computed or joined columns)
    if (override?.extraFields) {
        fields.push(...override.extraFields);
    }

    // Always append system fields at end
    fields.push(...SYSTEM_FIELDS);

    return {
        entity: config.table,
        dbTable: config.table,
        displayName: config.displayNamePlural,
        description: override?.description ?? `${config.displayNamePlural} records`,
        rbacResource: config.resource,
        importEnabled: override?.importEnabled ?? true,
        exportEnabled: override?.exportEnabled ?? true,
        fields,
        selectQuery: override?.selectQuery ?? config.selectList,
        defaultSort: override?.defaultSort ?? { column: "created_at", ascending: false },
    };
}

/**
 * Extract the shape from a Zod schema.
 * Handles z.object, effects, lazy, intersections, and partials.
 * Supports both Zod v3 (def.typeName, def.shape()) and Zod v4 (def.type, def.shape).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractShape(schema: z.ZodSchema): Record<string, any> | null {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const def = (schema as any)?._def;
    if (!def) return null;

    const typeName = getTypeName(schema);

    switch (typeName) {
        case "ZodObject":
            // Zod v3: def.shape() is a function. Zod v4: def.shape is a plain object.
            if (typeof def.shape === "function") {
                return def.shape() as Record<string, unknown>;
            }
            return def.shape as Record<string, unknown>;
        case "ZodEffects":
            return extractShape(def.schema);
        case "ZodLazy":
            return extractShape(def.getter());
        case "ZodIntersection":
            // Merge left and right shapes
            return {
                ...(extractShape(def.left) ?? {}),
                ...(extractShape(def.right) ?? {}),
            };
        case "ZodPipeline":
            return extractShape(def.in);
        default:
            return null;
    }
}
