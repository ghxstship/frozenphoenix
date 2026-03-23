/* ═══════════════════════════════════════════════════════════════
   OPENAPI 3.1 SPEC BUILDER — Main entry point
   
   Assembles the complete OpenAPI 3.1 specification by combining:
   - Auto-generated CRUD paths from ENTITY_CONFIGS
   - Custom route definitions
   - Shared component schemas (pagination, errors)
   - Zod-derived request/response schemas
   - RBAC security scheme documentation
   
   The spec is built at runtime from code — never hand-maintained.
   ═══════════════════════════════════════════════════════════════ */

import { PERMISSION_MATRIX } from "@/config/rbac";
import { generateCrudPaths } from "./crud-paths";
import { getCustomRoutes } from "./custom-routes";
import { getSharedComponentSchemas } from "./shared-schemas";

// ─── Types ───────────────────────────────────────────────────

export interface OpenApiSpec {
    openapi: string;
    info: {
        title: string;
        version: string;
        description: string;
        contact?: { name: string; url?: string; email?: string } | undefined;
        license?: { name: string; url?: string } | undefined;
    };
    servers: Array<{ url: string; description: string }>;
    paths: Record<string, unknown>;
    components: {
        schemas: Record<string, unknown>;
        securitySchemes: Record<string, unknown>;
    };
    security: Array<Record<string, unknown>>;
    tags: Array<{ name: string; description?: string | undefined }>;
    "x-rbac-matrix"?: Record<string, unknown>;
}

// ─── Spec Cache ──────────────────────────────────────────────

let cachedSpec: OpenApiSpec | null = null;

/**
 * Build the complete OpenAPI 3.1 specification.
 * Results are cached after first call for performance.
 * Call `invalidateSpecCache()` to force rebuild.
 */
export function buildOpenApiSpec(): OpenApiSpec {
    if (cachedSpec) return cachedSpec;

    // 1. Generate CRUD paths + schemas from ENTITY_CONFIGS
    const { paths: crudPaths, schemas: crudSchemas } = generateCrudPaths();

    // 2. Get custom (non-CRUD) routes
    const customPaths = getCustomRoutes();

    // 3. Merge all paths (custom routes take precedence for overlaps)
    const allPaths: Record<string, unknown> = {};

    for (const [path, methods] of Object.entries(crudPaths)) {
        allPaths[path] = { ...(allPaths[path] as Record<string, unknown> | undefined), ...methods };
    }
    for (const [path, methods] of Object.entries(customPaths)) {
        allPaths[path] = { ...(allPaths[path] as Record<string, unknown> | undefined), ...methods };
    }

    // 4. Sort paths alphabetically for readability
    const sortedPaths: Record<string, unknown> = {};
    for (const key of Object.keys(allPaths).sort()) {
        sortedPaths[key] = allPaths[key];
    }

    // 5. Assemble component schemas
    const componentSchemas: Record<string, unknown> = {
        ...getSharedComponentSchemas(),
        ...crudSchemas,
    };

    // 6. Derive unique tags from all operations
    const tagSet = new Set<string>();
    for (const pathItem of Object.values(sortedPaths)) {
        for (const op of Object.values(pathItem as Record<string, unknown>)) {
            const operation = op as Record<string, unknown>;
            if (Array.isArray(operation.tags)) {
                for (const t of operation.tags as string[]) {
                    tagSet.add(t);
                }
            }
        }
    }

    const tags = Array.from(tagSet)
        .sort()
        .map((name) => ({ name, description: TAG_DESCRIPTIONS[name] }));

    // 7. Build RBAC permission matrix for documentation
    const rbacMatrix = buildRbacMatrix();

    // 8. Assemble final spec
    cachedSpec = {
        openapi: "3.1.0",
        info: {
            title: "FrozenPhoenix API",
            version: "1.0.0",
            description: [
                "REST API for the FrozenPhoenix production management platform.",
                "",
                "## Authentication",
                "All endpoints (except `/api/health` and `/api/docs`) require authentication via:",
                "- **Bearer token**: Supabase JWT in the `Authorization` header",
                "- **Session cookie**: Supabase auth cookie (browser sessions)",
                "",
                "## Authorization",
                "Endpoints are gated by a 6-tier RBAC system (exec, director, pm, member, client, collaborator).",
                "Each operation documents its required resource and action in `x-rbac-*` extensions.",
                "",
                "## Pagination",
                "List endpoints return paginated results with `page`, `per_page`, `total`, and `total_pages`.",
                "Default: 25 items per page, max 100.",
                "",
                "## Error Responses",
                "All errors follow a consistent envelope: `{ error: string, code?: string, details?: [...] }`.",
            ].join("\n"),
        },
        servers: [{ url: "/", description: "Current environment" }],
        paths: sortedPaths,
        components: {
            schemas: componentSchemas,
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Supabase JWT token from auth.getSession()",
                },
                cookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "sb-access-token",
                    description: "Supabase session cookie (browser auth)",
                },
            },
        },
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        tags,
        "x-rbac-matrix": rbacMatrix,
    };

    return cachedSpec!;
}

/**
 * Invalidate the cached spec, forcing a rebuild on next call.
 */
export function invalidateSpecCache(): void {
    cachedSpec = null;
}

// ─── RBAC Matrix Builder ─────────────────────────────────────

function buildRbacMatrix(): Record<string, unknown> {
    const matrix: Record<string, Record<string, string[]>> = {};

    for (const [role, permissions] of Object.entries(PERMISSION_MATRIX)) {
        matrix[role] = {};
        for (const perm of permissions) {
            matrix[role]![perm.resource] = perm.actions;
        }
    }

    return matrix;
}

// ─── Tag Descriptions ────────────────────────────────────────

const TAG_DESCRIPTIONS: Record<string, string> = {
    // Workstream tags
    Production: "Project management, tasks, milestones, and production workflows",
    Commercial: "CRM, deals, leads, opportunities, and revenue pipeline",
    Workforce: "Crew management, time tracking, and scheduling",
    Resources: "Assets, inventory, and fleet management",
    Finance: "Budgets, invoices, payments, and financial operations",
    "Legal & Governance": "Contracts, insurance, IP rights, and compliance",
    Documents: "Document management and templates",
    "Creative & Brand": "Brand guidelines, campaigns, and creative assets",
    Governance: "Approval workflows and compliance checks",
    "Safety & Compliance": "Incidents, permits, and certifications",
    "Vendor Management": "Vendor onboarding, reviews, and work orders",
    "Live Operations": "Live events, ROS cues, readiness gates, and credentialing",
    Logistics: "Shipments, warehouses, and logistics operations",
    System: "Health checks, settings, and system administration",
    General: "General-purpose endpoints",
    // Entity / Feature tags
    Auth: "Authentication and session management",
    Organizations: "Organization management and ownership",
    Invitations: "Team invitation workflows",
    Onboarding: "User onboarding progress tracking",
    Billing: "Subscription and billing management",
    Settings: "Application and organization settings",
    Automations: "Automation rule execution",
    Advancing: "Advance requests and catalog management",
    "Approval Engine": "Multi-step approval workflow engine",
    Messaging: "Real-time messaging, conversations, and channels",
    Credentialing: "Credential scanning and gate operations",
    Users: "User profile and username management",
    Reports: "Reporting views and data exports",
};
