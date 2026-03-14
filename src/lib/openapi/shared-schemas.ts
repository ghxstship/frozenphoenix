/* ═══════════════════════════════════════════════════════════════
   SHARED OPENAPI COMPONENT SCHEMAS
   
   Reusable JSON Schema definitions for pagination envelopes,
   error responses, and common field patterns used across all
   CRUD endpoints.
   ═══════════════════════════════════════════════════════════════ */

import type { JsonSchema } from "./zod-to-schema";

// ─── Pagination ──────────────────────────────────────────────

export const PaginationMeta: JsonSchema = {
    type: "object",
    properties: {
        page: { type: "integer", minimum: 1, description: "Current page number" },
        per_page: { type: "integer", minimum: 1, maximum: 100, description: "Items per page" },
        total: { type: "integer", minimum: 0, description: "Total matching records" },
        total_pages: { type: "integer", minimum: 0, description: "Total pages available" },
    },
    required: ["page", "per_page", "total", "total_pages"],
};

// ─── List Envelope ───────────────────────────────────────────

export function listEnvelope(): JsonSchema {
    return {
        type: "object",
        properties: {
            data: {
                type: "array",
                items: { type: "object", additionalProperties: true },
            },
            pagination: { $ref: "#/components/schemas/PaginationMeta" },
        },
        required: ["data", "pagination"],
    };
}

// ─── Item Envelope ───────────────────────────────────────────

export function itemEnvelope(): JsonSchema {
    return {
        type: "object",
        properties: {
            data: { type: "object", additionalProperties: true },
        },
        required: ["data"],
    };
}

// ─── Success Envelope (DELETE) ───────────────────────────────

export const SuccessEnvelope: JsonSchema = {
    type: "object",
    properties: {
        success: { type: "boolean", const: true },
    },
    required: ["success"],
};

// ─── Error Schemas ───────────────────────────────────────────

export const ApiError: JsonSchema = {
    type: "object",
    properties: {
        error: { type: "string", description: "Error message" },
        code: { type: "string", description: "Machine-readable error code" },
        details: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    field: { type: "string" },
                    message: { type: "string" },
                },
            },
            description: "Field-level validation errors (422 only)",
        },
    },
    required: ["error"],
};

export const ValidationError: JsonSchema = {
    type: "object",
    properties: {
        error: { type: "string", description: "Validation error summary" },
        code: { type: "string", const: "VALIDATION_ERROR" },
        details: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    field: { type: "string" },
                    message: { type: "string" },
                },
                required: ["field", "message"],
            },
        },
    },
    required: ["error", "details"],
};

// ─── Standard Response Map ───────────────────────────────────

export const STANDARD_ERROR_RESPONSES: Record<string, { description: string; ref?: string }> = {
    "401": { description: "Unauthorized — missing or invalid session", ref: "ApiError" },
    "403": { description: "Forbidden — insufficient RBAC permissions", ref: "ApiError" },
    "404": { description: "Resource not found", ref: "ApiError" },
    "422": { description: "Validation error — malformed request body", ref: "ValidationError" },
    "500": { description: "Internal server error", ref: "ApiError" },
};

export function errorResponses(...codes: string[]): Record<string, Record<string, unknown>> {
    const result: Record<string, Record<string, unknown>> = {};
    for (const code of codes) {
        const entry = STANDARD_ERROR_RESPONSES[code];
        if (!entry) continue;
        result[code] = {
            description: entry.description,
            ...(entry.ref
                ? {
                      content: {
                          "application/json": {
                              schema: { $ref: `#/components/schemas/${entry.ref}` },
                          },
                      },
                  }
                : {}),
        };
    }
    return result;
}

// ─── Common Query Parameters ─────────────────────────────────

export const LIST_QUERY_PARAMS = [
    {
        name: "page",
        in: "query",
        schema: { type: "integer", minimum: 1, default: 1 },
        description: "Page number for pagination",
    },
    {
        name: "per_page",
        in: "query",
        schema: { type: "integer", minimum: 1, maximum: 100, default: 25 },
        description: "Results per page",
    },
    {
        name: "sort_by",
        in: "query",
        schema: { type: "string" },
        description: "Column to sort by (default: created_at)",
    },
    {
        name: "sort_order",
        in: "query",
        schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
        description: "Sort direction",
    },
    {
        name: "search",
        in: "query",
        schema: { type: "string" },
        description: "Full-text search across searchable columns",
    },
];

export const ID_PATH_PARAM = {
    name: "id",
    in: "path",
    required: true,
    schema: { type: "string", format: "uuid" },
    description: "Resource UUID",
};

// ─── All Shared Component Schemas ────────────────────────────

export function getSharedComponentSchemas(): Record<string, JsonSchema> {
    return {
        PaginationMeta,
        SuccessEnvelope,
        ApiError,
        ValidationError,
    };
}
