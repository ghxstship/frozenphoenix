/* ═══════════════════════════════════════════════════════════════
   CRUD API FACTORY — P0.2 Foundation Infrastructure
   
   Generic factory that generates type-safe Next.js API route handlers
   for any Supabase table. Provides:
   
   - LIST (GET collection) with pagination, filtering, sorting, search
   - GET (single record by ID)
   - CREATE (POST) with Zod validation, idempotency, state machine init
   - UPDATE (PATCH) with Zod validation, state machine transition checks
   - SOFT DELETE (DELETE) via deleted_at timestamp
   - RBAC enforcement via permission matrix
   - Structured logging
   - Standard error envelope
   
   Usage:
     const handlers = createCrudHandlers({
       table: "projects",
       resource: "projects",
       selectList: "*, user_profiles:manager_id(display_name)",
       selectDetail: "*, user_profiles:manager_id(display_name, avatar_url)",
       createSchema: createProjectSchema,
       updateSchema: updateProjectSchema,
       stateMachine: PROJECT_MACHINE,
       statusColumn: "status",
       softDelete: true,
       defaultSort: { column: "created_at", ascending: false },
     });
     
     export const GET = handlers.list;     // or handlers.getById
     export const POST = handlers.create;
     export const PATCH = handlers.update;
     export const DELETE = handlers.remove;
   ═══════════════════════════════════════════════════════════════ */

import { NextRequest, NextResponse } from "next/server";
import type { ZodSchema } from "zod";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { hasPermission } from "@/config/rbac";
import type { PermissionLevel } from "@/types";
import { logger } from "@/lib/logger";
import { getClientId, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import type { StateMachineDefinition } from "@/lib/state-machine";
import { validateTransition } from "@/lib/state-machine";

// ─── Shared Mutation Rate Limiter ────────────────────────────
// 30 mutations per minute per client across all CRUD endpoints
const mutationLimiter = rateLimit({ windowMs: 60_000, max: 30 });

function generateRequestId(): string {
    return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Types ───────────────────────────────────────────────────

export type FilterOperator =
    | "eq"
    | "neq"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "like"
    | "ilike"
    | "in"
    | "is";

export interface FilterConfig {
    column: string;
    param?: string;
    operator?: FilterOperator;
}

export interface SortConfig {
    column: string;
    ascending: boolean;
}

export interface CrudConfig {
    /** Supabase table name */
    table: string;
    /** RBAC resource name (from PERMISSION_MATRIX) */
    resource: string;
    /** Display name for error messages */
    displayName?: string;
    /** Select clause for list queries */
    selectList?: string;
    /** Select clause for detail queries */
    selectDetail?: string;
    /** Zod schema for create validation */
    createSchema?: ZodSchema;
    /** Zod schema for update validation */
    updateSchema?: ZodSchema;
    /** Allowed filters (query params → column filters) */
    filters?: FilterConfig[];
    /** Search column(s) for ?search= query param */
    searchColumns?: string[];
    /** Default sort */
    defaultSort?: SortConfig;
    /** State machine definition for lifecycle transitions */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stateMachine?: StateMachineDefinition<any>;
    /** Column name that holds the status (default: "status") */
    statusColumn?: string;
    /** Use soft delete via deleted_at column (default: true) */
    softDelete?: boolean;
    /** Column used for organization scoping (default: "organization_id") */
    orgColumn?: string;
    /** Automatically inject created_by / updated_by user ID */
    trackAuthor?: boolean;
    /** Max results per page (default: 100) */
    maxPerPage?: number;
    /** Default results per page (default: 25) */
    defaultPerPage?: number;
    /** Custom select for count queries (avoids joins in count) */
    selectCount?: string;
    /** Columns that should only be set on create, never on update */
    immutableColumns?: string[];
    /** Hook: transform data before insert */
    beforeCreate?: (
        data: Record<string, unknown>,
        userId: string
    ) => Record<string, unknown> | Promise<Record<string, unknown>>;
    /** Hook: transform data before update */
    beforeUpdate?: (
        data: Record<string, unknown>,
        userId: string
    ) => Record<string, unknown> | Promise<Record<string, unknown>>;
}

export interface CrudHandlers {
    list: (request: NextRequest) => Promise<NextResponse>;
    getById: (
        request: NextRequest,
        context: { params: Promise<{ id: string }> }
    ) => Promise<NextResponse>;
    create: (request: NextRequest) => Promise<NextResponse>;
    update: (
        request: NextRequest,
        context: { params: Promise<{ id: string }> }
    ) => Promise<NextResponse>;
    remove: (
        request: NextRequest,
        context: { params: Promise<{ id: string }> }
    ) => Promise<NextResponse>;
}

// ─── Valid roles for cookie validation ───────────────────────
const VALID_ROLES = new Set<string>(["exec", "director", "pm", "member", "client", "collaborator"]);

// ─── Role Resolver ───────────────────────────────────────────
// Reads the cached role from the middleware cookie first.
// Falls back to a DB query only when the cookie is missing or stale.

async function resolveUserRole(
    supabase: Awaited<ReturnType<typeof createClient>>,
    userId: string,
    cachedRole?: string | null
): Promise<PermissionLevel> {
    // Use the middleware-cached role if it's a valid known role
    if (cachedRole && VALID_ROLES.has(cachedRole)) {
        return cachedRole as PermissionLevel;
    }

    if (!supabase) return "member";

    const { data } = await supabase
        .from("org_memberships")
        .select("role")
        .eq("user_id", userId)
        .eq("is_default_org", true)
        .single();

    return (data?.role as PermissionLevel) ?? "member";
}

// ─── Apply Filters ───────────────────────────────────────────

function applyFilters(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: any,
    url: URL,
    filters: FilterConfig[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
    for (const filter of filters) {
        const paramName = filter.param ?? filter.column;
        const value = url.searchParams.get(paramName);
        if (value === null) continue;

        const op = filter.operator ?? "eq";
        switch (op) {
            case "eq":
                query = query.eq(filter.column, value);
                break;
            case "neq":
                query = query.neq(filter.column, value);
                break;
            case "gt":
                query = query.gt(filter.column, value);
                break;
            case "gte":
                query = query.gte(filter.column, value);
                break;
            case "lt":
                query = query.lt(filter.column, value);
                break;
            case "lte":
                query = query.lte(filter.column, value);
                break;
            case "like":
                query = query.like(filter.column, `%${value}%`);
                break;
            case "ilike":
                query = query.ilike(filter.column, `%${value}%`);
                break;
            case "in": {
                const values = value.split(",");
                query =
                    values.length > 1
                        ? query.in(filter.column, values)
                        : query.eq(filter.column, value);
                break;
            }
            case "is":
                query = query.is(filter.column, value === "null" ? null : value);
                break;
        }
    }
    return query;
}

// ─── Factory ─────────────────────────────────────────────────

export function createCrudHandlers(config: CrudConfig): CrudHandlers {
    const {
        table,
        resource,
        displayName = resource,
        selectList = "*",
        selectDetail = "*",
        createSchema,
        updateSchema,
        filters = [],
        searchColumns = [],
        defaultSort = { column: "created_at", ascending: false },
        stateMachine,
        statusColumn = "status",
        softDelete = true,
        trackAuthor = true,
        maxPerPage = 100,
        defaultPerPage = 25,
        immutableColumns = [],
        beforeCreate,
        beforeUpdate,
    } = config;

    const logPrefix = `[CRUD /${resource}]`;

    // ─── LIST ────────────────────────────────────────────────
    async function list(request: NextRequest): Promise<NextResponse> {
        const supabase = await createClient();
        if (!supabase) return ApiErrors.serviceUnavailable();

        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return ApiErrors.unauthorized();

        const cachedRole = request.cookies.get("fp-user-role")?.value;
        const userRole = await resolveUserRole(supabase, user.id, cachedRole);
        if (!hasPermission(userRole, resource, "read")) {
            return ApiErrors.forbidden(`Role "${userRole}" cannot read ${displayName}`);
        }

        const url = new URL(request.url);
        const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
        const perPage = Math.min(
            Math.max(1, parseInt(url.searchParams.get("per_page") ?? String(defaultPerPage), 10)),
            maxPerPage
        );
        const sortBy = url.searchParams.get("sort_by") ?? defaultSort.column;
        const sortOrder =
            url.searchParams.get("sort_order") ?? (defaultSort.ascending ? "asc" : "desc");
        const search = url.searchParams.get("search");

        let query = serverFromTable(supabase, table).select(selectList, { count: "exact" });

        if (softDelete) {
            query = query.is("deleted_at", null);
        }

        query = applyFilters(query, url, filters);

        if (search && searchColumns.length > 0) {
            const orClauses = searchColumns.map((col) => `${col}.ilike.%${search}%`).join(",");
            query = query.or(orClauses);
        }

        const from = (page - 1) * perPage;
        const to = from + perPage - 1;
        query = query.order(sortBy, { ascending: sortOrder === "asc" }).range(from, to);

        const { data, error, count } = await query;

        if (error) {
            logger.error(`${logPrefix} LIST failed`, { error: error.message, code: error.code });
            return ApiErrors.internalError(`Failed to fetch ${displayName}`);
        }

        return NextResponse.json({
            data,
            pagination: {
                page,
                per_page: perPage,
                total: count ?? 0,
                total_pages: count ? Math.ceil(count / perPage) : 0,
            },
        });
    }

    // ─── GET BY ID ───────────────────────────────────────────
    async function getById(
        _request: NextRequest,
        { params }: { params: Promise<{ id: string }> }
    ): Promise<NextResponse> {
        const supabase = await createClient();
        if (!supabase) return ApiErrors.serviceUnavailable();

        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return ApiErrors.unauthorized();

        const cachedRole = _request.cookies.get("fp-user-role")?.value;
        const userRole = await resolveUserRole(supabase, user.id, cachedRole);
        if (!hasPermission(userRole, resource, "read")) {
            return ApiErrors.forbidden(`Role "${userRole}" cannot read ${displayName}`);
        }

        const { id } = await params;

        let query = serverFromTable(supabase, table).select(selectDetail).eq("id", id);

        if (softDelete) {
            query = query.is("deleted_at", null);
        }

        const { data, error } = await query.single();

        if (error) {
            if (error.code === "PGRST116") return ApiErrors.notFound(displayName);
            logger.error(`${logPrefix} GET failed`, { id, error: error.message });
            return ApiErrors.internalError(`Failed to fetch ${displayName}`);
        }

        return NextResponse.json({ data });
    }

    // ─── CREATE ──────────────────────────────────────────────
    async function create(request: NextRequest): Promise<NextResponse> {
        const requestId = generateRequestId();
        const log = logger.child({ requestId, method: "POST", route: `/${resource}` });

        // Rate limit mutations
        const rlCheck = mutationLimiter.check(getClientId(request));
        if (!rlCheck.allowed) {
            log.warn("Rate limit exceeded");
            return rateLimitResponse(rlCheck.retryAfterSeconds);
        }

        try {
        const supabase = await createClient();
        if (!supabase) return ApiErrors.serviceUnavailable();

        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return ApiErrors.unauthorized();

        const cachedRole = request.cookies.get("fp-user-role")?.value;
        const userRole = await resolveUserRole(supabase, user.id, cachedRole);
        if (!hasPermission(userRole, resource, "write")) {
            return ApiErrors.forbidden(`Role "${userRole}" cannot create ${displayName}`);
        }

        let payload: Record<string, unknown>;

        if (createSchema) {
            const parsed = await parseAndValidate(request, createSchema);
            if (!parsed.success) return parsed.response;
            payload = parsed.data as Record<string, unknown>;
        } else {
            try {
                payload = await request.json();
            } catch {
                return ApiErrors.badRequest("Request body must be valid JSON");
            }
        }

        if (trackAuthor) {
            payload.created_by = user.id;
        }

        if (stateMachine && !payload[statusColumn]) {
            payload[statusColumn] = stateMachine.initialState;
        }

        if (beforeCreate) {
            payload = await beforeCreate(payload, user.id);
        }

        // Check idempotency key
        const idempotencyKey = request.headers.get("x-idempotency-key");
        if (idempotencyKey) {
            payload._idempotency_key = idempotencyKey;
        }

        const { data, error } = await serverFromTable(supabase, table)
            .insert(payload as Record<string, unknown>)
            .select(selectDetail)
            .single();

        if (error) {
            if (error.code === "23505") {
                return ApiErrors.conflict(`${displayName} already exists (duplicate key)`);
            }
            log.error(`${logPrefix} CREATE failed`, { error: error.message, code: error.code });
            return ApiErrors.internalError(`Failed to create ${displayName}`);
        }

        log.info(`${logPrefix} created`, {
            id: (data as Record<string, unknown>).id,
            userId: user.id,
        });
        const response = NextResponse.json({ data }, { status: 201 });
        response.headers.set("X-Request-Id", requestId);
        return response;
        } catch (err) {
            log.error("Unhandled error in CREATE", {
                error: err instanceof Error ? err.message : String(err),
            });
            return ApiErrors.internalError();
        }
    }

    // ─── UPDATE ──────────────────────────────────────────────
    async function update(
        request: NextRequest,
        { params }: { params: Promise<{ id: string }> }
    ): Promise<NextResponse> {
        const requestId = generateRequestId();
        const log = logger.child({ requestId, method: "PATCH", route: `/${resource}` });

        const rlCheck = mutationLimiter.check(getClientId(request));
        if (!rlCheck.allowed) {
            log.warn("Rate limit exceeded");
            return rateLimitResponse(rlCheck.retryAfterSeconds);
        }

        try {
        const supabase = await createClient();
        if (!supabase) return ApiErrors.serviceUnavailable();

        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return ApiErrors.unauthorized();

        const cachedRole = request.cookies.get("fp-user-role")?.value;
        const userRole = await resolveUserRole(supabase, user.id, cachedRole);
        if (!hasPermission(userRole, resource, "write")) {
            return ApiErrors.forbidden(`Role "${userRole}" cannot update ${displayName}`);
        }

        const { id } = await params;

        let payload: Record<string, unknown>;

        if (updateSchema) {
            const parsed = await parseAndValidate(request, updateSchema);
            if (!parsed.success) return parsed.response;
            payload = parsed.data as Record<string, unknown>;
        } else {
            try {
                payload = await request.json();
            } catch {
                return ApiErrors.badRequest("Request body must be valid JSON");
            }
        }

        // Strip immutable columns from update payload
        for (const col of immutableColumns) {
            delete payload[col];
        }

        if (trackAuthor) {
            payload.updated_by = user.id;
            payload.updated_at = new Date().toISOString();
        }

        // State machine transition validation
        if (stateMachine && payload[statusColumn]) {
            const targetStatus = payload[statusColumn] as string;

            // Fetch current record to get current status
            const { data: current, error: fetchError } = await serverFromTable(supabase, table)
                .select(statusColumn)
                .eq("id", id)
                .single();

            if (fetchError) {
                if (fetchError.code === "PGRST116") return ApiErrors.notFound(displayName);
                log.error(`${logPrefix} UPDATE fetch-current failed`, {
                    id,
                    error: fetchError.message,
                });
                return ApiErrors.internalError(`Failed to update ${displayName}`);
            }

            const currentStatus = (current as Record<string, unknown>)[statusColumn] as string;

            if (currentStatus !== targetStatus) {
                const result = validateTransition(stateMachine, currentStatus, targetStatus, {
                    userRole,
                    entity: current as Record<string, unknown>,
                });

                if (!result.allowed) {
                    return ApiErrors.forbidden(result.reason ?? "Transition not allowed");
                }
            }
        }

        if (beforeUpdate) {
            payload = await beforeUpdate(payload, user.id);
        }

        const { data, error } = await serverFromTable(supabase, table)
            .update(payload as Record<string, unknown>)
            .eq("id", id)
            .select(selectDetail)
            .single();

        if (error) {
            if (error.code === "PGRST116") return ApiErrors.notFound(displayName);
            log.error(`${logPrefix} UPDATE failed`, { id, error: error.message });
            return ApiErrors.internalError(`Failed to update ${displayName}`);
        }

        log.info(`${logPrefix} updated`, { id, userId: user.id });
        const response = NextResponse.json({ data });
        response.headers.set("X-Request-Id", requestId);
        return response;
        } catch (err) {
            log.error("Unhandled error in UPDATE", {
                error: err instanceof Error ? err.message : String(err),
            });
            return ApiErrors.internalError();
        }
    }

    // ─── DELETE ──────────────────────────────────────────────
    async function remove(
        _request: NextRequest,
        { params }: { params: Promise<{ id: string }> }
    ): Promise<NextResponse> {
        const requestId = generateRequestId();
        const log = logger.child({ requestId, method: "DELETE", route: `/${resource}` });

        const rlCheck = mutationLimiter.check(getClientId(_request));
        if (!rlCheck.allowed) {
            log.warn("Rate limit exceeded");
            return rateLimitResponse(rlCheck.retryAfterSeconds);
        }

        try {
        const supabase = await createClient();
        if (!supabase) return ApiErrors.serviceUnavailable();

        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return ApiErrors.unauthorized();

        const cachedRole = _request.cookies.get("fp-user-role")?.value;
        const userRole = await resolveUserRole(supabase, user.id, cachedRole);
        if (!hasPermission(userRole, resource, "delete")) {
            return ApiErrors.forbidden(`Role "${userRole}" cannot delete ${displayName}`);
        }

        const { id } = await params;

        if (softDelete) {
            const updatePayload: Record<string, unknown> = {
                deleted_at: new Date().toISOString(),
            };
            if (trackAuthor) {
                updatePayload.deleted_by = user.id;
            }

            const { error } = await serverFromTable(supabase, table)
                .update(updatePayload as Record<string, unknown>)
                .eq("id", id);

            if (error) {
                log.error(`${logPrefix} SOFT DELETE failed`, { id, error: error.message });
                return ApiErrors.internalError(`Failed to delete ${displayName}`);
            }
        } else {
            const { error } = await serverFromTable(supabase, table).delete().eq("id", id);

            if (error) {
                log.error(`${logPrefix} HARD DELETE failed`, { id, error: error.message });
                return ApiErrors.internalError(`Failed to delete ${displayName}`);
            }
        }

        log.info(`${logPrefix} deleted`, { id, userId: user.id, soft: softDelete });
        const response = NextResponse.json({ success: true });
        response.headers.set("X-Request-Id", requestId);
        return response;
        } catch (err) {
            log.error("Unhandled error in DELETE", {
                error: err instanceof Error ? err.message : String(err),
            });
            return ApiErrors.internalError();
        }
    }

    return { list, getById, create, update, remove };
}

// ─── Convenience: Generate both collection + [id] route handlers ─

export interface CollectionRouteHandlers {
    GET: (request: NextRequest) => Promise<NextResponse>;
    POST: (request: NextRequest) => Promise<NextResponse>;
}

export interface ItemRouteHandlers {
    GET: (
        request: NextRequest,
        context: { params: Promise<{ id: string }> }
    ) => Promise<NextResponse>;
    PATCH: (
        request: NextRequest,
        context: { params: Promise<{ id: string }> }
    ) => Promise<NextResponse>;
    DELETE: (
        request: NextRequest,
        context: { params: Promise<{ id: string }> }
    ) => Promise<NextResponse>;
}

export function createCollectionRoute(config: CrudConfig): CollectionRouteHandlers {
    const handlers = createCrudHandlers(config);
    return {
        GET: handlers.list,
        POST: handlers.create,
    };
}

export function createItemRoute(config: CrudConfig): ItemRouteHandlers {
    const handlers = createCrudHandlers(config);
    return {
        GET: handlers.getById,
        PATCH: handlers.update,
        DELETE: handlers.remove,
    };
}
