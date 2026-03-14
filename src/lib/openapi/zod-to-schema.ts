/* ═══════════════════════════════════════════════════════════════
   ZOD → JSON SCHEMA BRIDGE — OpenAPI 3.1 Compatible
   
   Converts Zod v4 schemas to JSON Schema objects suitable for
   embedding in an OpenAPI 3.1 specification. Uses Zod v4's
   built-in toJSONSchema() and strips $schema for inline use.
   ═══════════════════════════════════════════════════════════════ */

import { toJSONSchema, type ZodSchema } from "zod";

export type JsonSchema = Record<string, unknown>;

/**
 * Convert a Zod schema to a JSON Schema object for OpenAPI 3.1.
 * Strips the $schema key since OpenAPI embeds schemas inline.
 * Returns a generic object schema on failure (never throws).
 */
export function zodToJsonSchema(schema: ZodSchema): JsonSchema {
    try {
        const raw = toJSONSchema(schema) as JsonSchema;
        // Strip $schema — OpenAPI 3.1 uses JSON Schema inline
        const { $schema: _, ...rest } = raw;
        void _;
        return rest;
    } catch {
        // Fallback for schemas that can't be converted (e.g., complex refinements)
        return { type: "object", additionalProperties: true };
    }
}

/**
 * Create a $ref pointer for a component schema.
 */
export function schemaRef(name: string): JsonSchema {
    return { $ref: `#/components/schemas/${name}` };
}
