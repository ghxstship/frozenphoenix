/* ═══════════════════════════════════════════════════════════════
   CRUD PATH GENERATOR — Auto-generates OpenAPI paths from
   ENTITY_CONFIGS registry
   
   For each entity in the registry, generates:
   - GET    /api/{slug}        → List (paginated, filterable)
   - POST   /api/{slug}        → Create
   - GET    /api/{slug}/{id}   → Get by ID
   - PATCH  /api/{slug}/{id}   → Update
   - DELETE /api/{slug}/{id}   → Delete (soft by default)
   
   Schemas are derived from Zod create/update schemas when
   available, falling back to generic object schemas.
   ═══════════════════════════════════════════════════════════════ */

import { ENTITY_CONFIGS, type EntityConfig } from "@/lib/api/entity-config";
import { PERMISSION_MATRIX } from "@/config/rbac";
import { type JsonSchema, zodToJsonSchema } from "./zod-to-schema";
import {
    errorResponses,
    ID_PATH_PARAM,
    itemEnvelope,
    LIST_QUERY_PARAMS,
    listEnvelope,
} from "./shared-schemas";

// ─── Types ───────────────────────────────────────────────────

interface PathItem {
    [method: string]: OperationObject;
}

interface OperationObject {
    operationId: string;
    summary: string;
    description?: string;
    tags: string[];
    parameters?: Record<string, unknown>[];
    requestBody?: Record<string, unknown>;
    responses: Record<string, Record<string, unknown>>;
    security: Record<string, unknown>[];
    "x-rbac-resource"?: string;
    "x-rbac-action"?: string;
    "x-rbac-roles"?: string[];
}

// ─── Tag Derivation ──────────────────────────────────────────

const WORKSTREAM_TAGS: Record<string, string> = {
    projects: "Production",
    tasks: "Production",
    milestones: "Production",
    events: "Live Operations",
    activations: "Production",
    locations: "Production",
    shipments: "Logistics",
    warehouses: "Logistics",
    deals: "Commercial",
    leads: "Commercial",
    opportunities: "Commercial",
    proposals: "Commercial",
    pipeline: "Commercial",
    accounts: "Commercial",
    crew: "Workforce",
    time_tracking: "Workforce",
    schedule: "Workforce",
    assets: "Resources",
    inventory: "Resources",
    fleet: "Resources",
    budgets: "Finance",
    invoices: "Finance",
    payments: "Finance",
    expenses: "Finance",
    estimates: "Finance",
    contracts: "Legal & Governance",
    documents: "Documents",
    templates: "Documents",
    brand: "Creative & Brand",
    campaigns: "Creative & Brand",
    decks: "Creative & Brand",
    approvals: "Governance",
    incidents: "Safety & Compliance",
    permits: "Safety & Compliance",
    certifications: "Safety & Compliance",
    vendors: "Vendor Management",
    settings: "System",
    dashboard: "System",
    system: "System",
    security: "System",
    audit_log: "System",
};

function getWorkstreamTag(resource: string): string {
    return WORKSTREAM_TAGS[resource] ?? "General";
}

// ─── RBAC Role Resolution ────────────────────────────────────

function getRolesWithAccess(resource: string, action: "read" | "write" | "delete"): string[] {
    const roles: string[] = [];
    for (const [level, perms] of Object.entries(PERMISSION_MATRIX)) {
        const hasAccess = perms.some(
            (p) => (p.resource === "*" || p.resource === resource) && p.actions.includes(action)
        );
        if (hasAccess) roles.push(level);
    }
    return roles;
}

// ─── Schema Name Helpers ─────────────────────────────────────

function pascalCase(s: string): string {
    return s
        .split(/[-_]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join("");
}

function schemaName(entityName: string, suffix: string): string {
    return `${pascalCase(entityName)}${suffix}`;
}

// ─── Path Generation ─────────────────────────────────────────

export interface CrudPathsResult {
    paths: Record<string, PathItem>;
    schemas: Record<string, JsonSchema>;
}

export function generateCrudPaths(): CrudPathsResult {
    const paths: Record<string, PathItem> = {};
    const schemas: Record<string, JsonSchema> = {};

    for (const entity of Object.values(ENTITY_CONFIGS)) {
        const collectionPath = `/api/${entity.slug}`;
        const itemPath = `/api/${entity.slug}/{id}`;
        const tag = entity.displayNamePlural;
        const workstream = getWorkstreamTag(entity.resource);

        // Generate component schemas from Zod
        const createSchemaName = schemaName(entity.entityName, "Create");
        const updateSchemaName = schemaName(entity.entityName, "Update");

        if (entity.createSchema) {
            schemas[createSchemaName] = zodToJsonSchema(entity.createSchema);
        }
        if (entity.updateSchema) {
            schemas[updateSchemaName] = zodToJsonSchema(entity.updateSchema);
        }

        // ─── Collection Route (GET + POST) ───────────────────
        paths[collectionPath] = {
            get: buildListOperation(entity, tag, workstream),
            post: buildCreateOperation(entity, tag, workstream, createSchemaName),
        };

        // ─── Item Route (GET + PATCH + DELETE) ───────────────
        paths[itemPath] = {
            get: buildGetByIdOperation(entity, tag, workstream),
            patch: buildUpdateOperation(entity, tag, workstream, updateSchemaName),
            delete: buildDeleteOperation(entity, tag, workstream),
        };
    }

    return { paths, schemas };
}

// ─── Operation Builders ──────────────────────────────────────

function buildListOperation(
    entity: EntityConfig,
    tag: string,
    workstream: string
): OperationObject {
    const resource = entity.resource;
    const roles = getRolesWithAccess(resource, "read");

    const searchDesc =
        entity.searchColumns.length > 0
            ? `Searchable columns: ${entity.searchColumns.join(", ")}`
            : undefined;

    return {
        operationId: `list${pascalCase(entity.entityName)}`,
        summary: `List ${entity.displayNamePlural}`,
        description: [
            `Paginated list of ${entity.displayNamePlural.toLowerCase()}.`,
            entity.softDelete ? "Soft-deleted records are excluded." : null,
            searchDesc,
        ]
            .filter(Boolean)
            .join(" "),
        tags: [tag, workstream],
        parameters: [...LIST_QUERY_PARAMS],
        responses: {
            "200": {
                description: `Paginated list of ${entity.displayNamePlural.toLowerCase()}`,
                content: {
                    "application/json": {
                        schema: listEnvelope(),
                    },
                },
            },
            ...errorResponses("401", "403", "500"),
        },
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        "x-rbac-resource": resource,
        "x-rbac-action": "read",
        "x-rbac-roles": roles,
    };
}

function buildCreateOperation(
    entity: EntityConfig,
    tag: string,
    workstream: string,
    createSchemaName: string
): OperationObject {
    const resource = entity.resource;
    const roles = getRolesWithAccess(resource, "write");
    const hasSchema = !!entity.createSchema;

    return {
        operationId: `create${pascalCase(entity.entityName)}`,
        summary: `Create ${entity.displayName}`,
        description: [
            `Create a new ${entity.displayName.toLowerCase()}.`,
            entity.stateMachine ? `Initial status: "${entity.stateMachine.initialState}".` : null,
            entity.trackAuthor ? "Automatically sets created_by to current user." : null,
        ]
            .filter(Boolean)
            .join(" "),
        tags: [tag, workstream],
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: hasSchema
                        ? { $ref: `#/components/schemas/${createSchemaName}` }
                        : { type: "object", additionalProperties: true },
                },
            },
        },
        responses: {
            "201": {
                description: `${entity.displayName} created successfully`,
                content: {
                    "application/json": {
                        schema: itemEnvelope(),
                    },
                },
            },
            ...errorResponses("401", "403", "422", "500"),
        },
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        "x-rbac-resource": resource,
        "x-rbac-action": "write",
        "x-rbac-roles": roles,
    };
}

function buildGetByIdOperation(
    entity: EntityConfig,
    tag: string,
    workstream: string
): OperationObject {
    const resource = entity.resource;
    const roles = getRolesWithAccess(resource, "read");

    return {
        operationId: `get${pascalCase(entity.entityName)}ById`,
        summary: `Get ${entity.displayName} by ID`,
        tags: [tag, workstream],
        parameters: [ID_PATH_PARAM],
        responses: {
            "200": {
                description: `${entity.displayName} details`,
                content: {
                    "application/json": {
                        schema: itemEnvelope(),
                    },
                },
            },
            ...errorResponses("401", "403", "404", "500"),
        },
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        "x-rbac-resource": resource,
        "x-rbac-action": "read",
        "x-rbac-roles": roles,
    };
}

function buildUpdateOperation(
    entity: EntityConfig,
    tag: string,
    workstream: string,
    updateSchemaName: string
): OperationObject {
    const resource = entity.resource;
    const roles = getRolesWithAccess(resource, "write");
    const hasSchema = !!entity.updateSchema;

    return {
        operationId: `update${pascalCase(entity.entityName)}`,
        summary: `Update ${entity.displayName}`,
        description: [
            `Partially update a ${entity.displayName.toLowerCase()}.`,
            entity.stateMachine ? "Status changes are validated against the state machine." : null,
            entity.trackAuthor ? "Automatically sets updated_by and updated_at." : null,
        ]
            .filter(Boolean)
            .join(" "),
        tags: [tag, workstream],
        parameters: [ID_PATH_PARAM],
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: hasSchema
                        ? { $ref: `#/components/schemas/${updateSchemaName}` }
                        : { type: "object", additionalProperties: true },
                },
            },
        },
        responses: {
            "200": {
                description: `${entity.displayName} updated successfully`,
                content: {
                    "application/json": {
                        schema: itemEnvelope(),
                    },
                },
            },
            ...errorResponses("401", "403", "404", "422", "500"),
        },
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        "x-rbac-resource": resource,
        "x-rbac-action": "write",
        "x-rbac-roles": roles,
    };
}

function buildDeleteOperation(
    entity: EntityConfig,
    tag: string,
    workstream: string
): OperationObject {
    const resource = entity.resource;
    const roles = getRolesWithAccess(resource, "delete");

    return {
        operationId: `delete${pascalCase(entity.entityName)}`,
        summary: `Delete ${entity.displayName}`,
        description: entity.softDelete
            ? `Soft-deletes the ${entity.displayName.toLowerCase()} (sets deleted_at).`
            : `Permanently deletes the ${entity.displayName.toLowerCase()}.`,
        tags: [tag, workstream],
        parameters: [ID_PATH_PARAM],
        responses: {
            "200": {
                description: `${entity.displayName} deleted`,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/SuccessEnvelope" },
                    },
                },
            },
            ...errorResponses("401", "403", "404", "500"),
        },
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        "x-rbac-resource": resource,
        "x-rbac-action": "delete",
        "x-rbac-roles": roles,
    };
}
