/* ═══════════════════════════════════════════════════════════════
   CSV TEMPLATES — Entity field mapping definitions (SSOT)

   Dynamically generated from ENTITY_CONFIGS (metadata) +
   SCHEMA_REGISTRY (Zod create schemas) + human-authored overrides.

   This module preserves the same public API surface consumed by
   the import route, export route, template route, and dialogs.
   ═══════════════════════════════════════════════════════════════ */

import { ENTITY_CONFIGS } from "@/lib/api/entity-config";
import { generateCsvTemplate } from "./csv-template-generator";
import { CSV_TEMPLATE_OVERRIDES } from "./csv-template-overrides";

// ─── Field Definition Types (unchanged public API) ───

export type CsvFieldType =
    | "string"
    | "number"
    | "boolean"
    | "date"
    | "enum"
    | "email"
    | "url"
    | "uuid"
    | "json";

export interface CsvFieldDef {
    dbColumn: string;
    csvHeader: string;
    required: boolean;
    type: CsvFieldType;
    enumValues?: string[];
    importable: boolean;
    exportable: boolean;
    example: string;
    description: string;
}

export interface CsvEntityTemplate {
    entity: string;
    dbTable: string;
    displayName: string;
    description: string;
    rbacResource: string;
    importEnabled: boolean;
    exportEnabled: boolean;
    fields: CsvFieldDef[];
    /** Optional select string for Supabase (joins) */
    selectQuery?: string;
    /** Default sort for export */
    defaultSort?: { column: string; ascending: boolean };
}

// ═══════════════════════════════════════════════════════════════
// DYNAMIC REGISTRY — Generated from ENTITY_CONFIGS + Zod schemas
// ═══════════════════════════════════════════════════════════════

function buildRegistry(): Record<string, CsvEntityTemplate> {
    const registry: Record<string, CsvEntityTemplate> = {};

    for (const [entityKey, config] of Object.entries(ENTITY_CONFIGS)) {
        const override = CSV_TEMPLATE_OVERRIDES[entityKey];
        const template = generateCsvTemplate(config, config.createSchema, override);
        // Key by table name (plural) for backward compatibility
        registry[config.table] = template;
    }

    return registry;
}

/**
 * Lazily-initialized registry. Built once on first access so that
 * circular-import timing between entity-config ↔ schema-registry
 * is never a problem.
 */
let _cachedRegistry: Record<string, CsvEntityTemplate> | null = null;

export const CSV_ENTITY_TEMPLATES: Record<string, CsvEntityTemplate> = new Proxy(
    {} as Record<string, CsvEntityTemplate>,
    {
        get(_target, prop, _receiver) {
            if (!_cachedRegistry) _cachedRegistry = buildRegistry();
            if (typeof prop === "string") return _cachedRegistry[prop];
            return undefined;
        },
        ownKeys() {
            if (!_cachedRegistry) _cachedRegistry = buildRegistry();
            return Object.keys(_cachedRegistry);
        },
        getOwnPropertyDescriptor(_target, prop) {
            if (!_cachedRegistry) _cachedRegistry = buildRegistry();
            if (typeof prop === "string" && prop in _cachedRegistry) {
                return {
                    value: _cachedRegistry[prop],
                    enumerable: true,
                    configurable: true,
                    writable: false,
                };
            }
            return undefined;
        },
        has(_target, prop) {
            if (!_cachedRegistry) _cachedRegistry = buildRegistry();
            return typeof prop === "string" && prop in _cachedRegistry;
        },
    }
);

// ═══════════════════════════════════════════════════════════════
// PUBLIC API — Unchanged function signatures
// ═══════════════════════════════════════════════════════════════

/**
 * Get a template by entity name (case-insensitive, accepts hyphens or underscores).
 */
export function getEntityTemplate(entity: string): CsvEntityTemplate | undefined {
    const normalized = entity.toLowerCase().replace(/-/g, "_");
    return CSV_ENTITY_TEMPLATES[normalized];
}

/**
 * Get all importable entity templates.
 */
export function getImportableEntities(): CsvEntityTemplate[] {
    if (!_cachedRegistry) _cachedRegistry = buildRegistry();
    return Object.values(_cachedRegistry).filter((t) => t.importEnabled);
}

/**
 * Get all exportable entity templates.
 */
export function getExportableEntities(): CsvEntityTemplate[] {
    if (!_cachedRegistry) _cachedRegistry = buildRegistry();
    return Object.values(_cachedRegistry).filter((t) => t.exportEnabled);
}

/**
 * Get importable fields for a template (excludes system-generated fields).
 */
export function getImportableFields(template: CsvEntityTemplate): CsvFieldDef[] {
    return template.fields.filter((f) => f.importable);
}

/**
 * Get exportable fields for a template.
 */
export function getExportableFields(template: CsvEntityTemplate): CsvFieldDef[] {
    return template.fields.filter((f) => f.exportable);
}
