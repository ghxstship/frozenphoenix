/* ═══════════════════════════════════════════════════════════════
   API DOCUMENTATION — M-009 OpenAPI Scaffold
   ═══════════════════════════════════════════════════════════════
   
   Lightweight OpenAPI 3.1 spec builder for documenting API routes.
   Generates a JSON spec consumable by Swagger UI or Redoc.
   
   Usage:
     import { apiSpec } from "@/lib/api-docs";
     // Access spec at GET /api/docs
   ═══════════════════════════════════════════════════════════════ */

export interface ApiEndpoint {
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    path: string;
    summary: string;
    description?: string;
    tags: string[];
    auth?: boolean;
    requestBody?: {
        contentType?: string;
        schema: Record<string, unknown>;
    };
    responses: Record<string, { description: string; schema?: Record<string, unknown> }>;
}

const endpoints: ApiEndpoint[] = [
    {
        method: "GET",
        path: "/api/health",
        summary: "Health check",
        tags: ["System"],
        auth: false,
        responses: {
            "200": {
                description: "Service is healthy",
                schema: {
                    type: "object",
                    properties: { status: { type: "string" }, timestamp: { type: "string" } },
                },
            },
        },
    },
    {
        method: "POST",
        path: "/api/auth/log-event",
        summary: "Log authentication event",
        tags: ["Auth"],
        auth: true,
        requestBody: {
            schema: {
                type: "object",
                properties: { event_type: { type: "string" }, metadata: { type: "object" } },
            },
        },
        responses: {
            "200": { description: "Event logged" },
            "401": { description: "Unauthorized" },
        },
    },
    {
        method: "POST",
        path: "/api/automations/execute",
        summary: "Execute automation rules",
        tags: ["Automations"],
        auth: true,
        requestBody: {
            schema: {
                type: "object",
                required: ["trigger_type", "entity_type", "record"],
                properties: {
                    trigger_type: { type: "string" },
                    entity_type: { type: "string" },
                    record: { type: "object" },
                },
            },
        },
        responses: {
            "200": {
                description: "Automation results",
                schema: {
                    type: "object",
                    properties: {
                        executed: { type: "number" },
                        total_duration_ms: { type: "number" },
                    },
                },
            },
            "400": { description: "Bad request" },
            "403": { description: "Forbidden" },
            "500": { description: "Internal error" },
        },
    },
    {
        method: "POST",
        path: "/api/organizations",
        summary: "Create organization",
        tags: ["Organizations"],
        auth: true,
        requestBody: {
            schema: {
                type: "object",
                required: ["name"],
                properties: {
                    name: { type: "string" },
                    industry: { type: "string" },
                    timezone: { type: "string" },
                },
            },
        },
        responses: {
            "201": { description: "Organization created" },
            "401": { description: "Unauthorized" },
        },
    },
    {
        method: "POST",
        path: "/api/invitations",
        summary: "Send team invitations",
        tags: ["Invitations"],
        auth: true,
        requestBody: {
            schema: {
                type: "object",
                required: ["invitations"],
                properties: {
                    invitations: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: { email: { type: "string" }, role: { type: "string" } },
                        },
                    },
                },
            },
        },
        responses: {
            "200": { description: "Invitations sent" },
            "401": { description: "Unauthorized" },
            "403": { description: "Forbidden" },
        },
    },
    {
        method: "GET",
        path: "/api/onboarding/progress",
        summary: "Get onboarding progress",
        tags: ["Onboarding"],
        auth: true,
        responses: {
            "200": { description: "Onboarding steps and progress" },
            "401": { description: "Unauthorized" },
        },
    },
    {
        method: "GET",
        path: "/api/settings",
        summary: "Get settings for current scope",
        tags: ["Settings"],
        auth: true,
        responses: {
            "200": { description: "Settings object" },
            "401": { description: "Unauthorized" },
        },
    },
];

export function buildOpenApiSpec() {
    const paths: Record<string, Record<string, unknown>> = {};

    for (const ep of endpoints) {
        const method = ep.method.toLowerCase();
        if (!paths[ep.path]) paths[ep.path] = {};

        const operation: Record<string, unknown> = {
            summary: ep.summary,
            tags: ep.tags,
            responses: Object.fromEntries(
                Object.entries(ep.responses).map(([code, r]) => [
                    code,
                    {
                        description: r.description,
                        ...(r.schema
                            ? { content: { "application/json": { schema: r.schema } } }
                            : {}),
                    },
                ])
            ),
        };

        if (ep.description) operation.description = ep.description;
        if (ep.auth) operation.security = [{ bearerAuth: [] }];
        if (ep.requestBody) {
            operation.requestBody = {
                required: true,
                content: {
                    [ep.requestBody.contentType ?? "application/json"]: {
                        schema: ep.requestBody.schema,
                    },
                },
            };
        }

        paths[ep.path]![method] = operation;
    }

    return {
        openapi: "3.1.0",
        info: {
            title: "FrozenPhoenix API",
            version: "0.1.0",
            description: "API documentation for the FrozenPhoenix production management platform.",
        },
        servers: [{ url: "/", description: "Current environment" }],
        paths,
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    };
}

/** Register a new endpoint at runtime (for plugin/extension APIs). */
export function registerEndpoint(endpoint: ApiEndpoint): void {
    endpoints.push(endpoint);
}
