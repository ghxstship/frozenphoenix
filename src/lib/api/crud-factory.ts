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
   - Org-scoped queries (defense-in-depth on top of RLS)
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
import type { ServerClient } from "@/lib/supabase/server";
import { ApiErrors, generateRequestId, parseAndValidate } from "@/lib/api-utils";
import { hasPermission } from "@/config/rbac";
import type { PermissionLevel } from "@/types";
import { logger } from "@/lib/logger";
import { getClientId, rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import type { StateMachineDefinition } from "@/lib/state-machine";
import { validateTransition } from "@/lib/state-machine";
import { resolveRoleAndOrg } from "./auth-resolver";

// ─── Shared Mutation Rate Limiter ────────────────────────────
// 30 mutations per minute per client across all CRUD endpoints
const mutationLimiter = rateLimit({ windowMs: 60_000, max: 30 });

// ─── Shared Auth Resolution ─────────────────────────────────
// Consolidates auth boilerplate: createClient → getUser → resolveRole+Org
// Called once per request instead of being duplicated in every handler.

interface AuthResult {
    supabase: ServerClient;
    userId: string;
    role: PermissionLevel;
    orgId: string;
}

async function resolveAuth(
    request: NextRequest
): Promise<{ ok: true; auth: AuthResult } | { ok: false; response: NextResponse }> {
    const supabase = await createClient();
    if (!supabase) return { ok: false, response: ApiErrors.serviceUnavailable() };

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, response: ApiErrors.unauthorized() };

    const cachedRole = request.cookies.get("fp-user-role")?.value;
    const cachedOrgId = request.cookies.get("fp-org-id")?.value;
    const { role, orgId } = await resolveRoleAndOrg(supabase, user.id, cachedRole, cachedOrgId);

    return { ok: true, auth: { supabase, userId: user.id, role, orgId } };
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
    param?: string | undefined;
    operator?: FilterOperator | undefined;
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
    displayName?: string | undefined; /** Select clause for list queries */
    selectList?: string | undefined; /** Select clause for detail queries */
    selectDetail?:
        | string
        | undefined; /** Lean select clause for lookup/dropdown queries (no FK joins) */
    selectLookup?: string | undefined; /** Zod schema for create validation */
    createSchema?: ZodSchema | undefined; /** Zod schema for update validation */
    updateSchema?: ZodSchema | undefined; /** Allowed filters (query params → column filters) */
    filters?: FilterConfig[] | undefined; /** Search column(s) for ?search= query param */
    searchColumns?: string[] | undefined; /** Default sort */
    defaultSort?: SortConfig | undefined; /** State machine definition for lifecycle transitions */
    stateMachine?:
        | StateMachineDefinition<string>
        | undefined; /** Column name that holds the status (default: "status") */
    statusColumn?: string | undefined; /** Use soft delete via deleted_at column (default: true) */
    softDelete?:
        | boolean
        | undefined; /** Column used for organization scoping (default: "organization_id") */
    orgColumn?: string | undefined; /** Automatically inject created_by / updated_by user ID */
    trackAuthor?: boolean | undefined; /** Max results per page (default: 100) */
    maxPerPage?: number | undefined; /** Default results per page (default: 25) */
    defaultPerPage?:
        | number
        | undefined; /** Custom select for count queries (avoids joins in count) */
    selectCount?:
        | string
        | undefined; /** Columns that should only be set on create, never on update */
    immutableColumns?: string[] | undefined; /** Hook: transform data before insert */
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

/**
 * Minimal interface for Supabase PostgREST query builders.
 * Used in `applyFilters` to type the chainable query without importing
 * Supabase's internal generic types (which require knowledge of the table
 * schema at compile time — unavailable with runtime table names).
 */
interface SupabaseQueryLike {
    eq(column: string, value: string): SupabaseQueryLike;
    neq(column: string, value: string): SupabaseQueryLike;
    gt(column: string, value: string): SupabaseQueryLike;
    gte(column: string, value: string): SupabaseQueryLike;
    lt(column: string, value: string): SupabaseQueryLike;
    lte(column: string, value: string): SupabaseQueryLike;
    like(column: string, value: string): SupabaseQueryLike;
    ilike(column: string, value: string): SupabaseQueryLike;
    in(column: string, values: string[]): SupabaseQueryLike;
    is(column: string, value: null | string): SupabaseQueryLike;
}

function applyFilters(
    query: SupabaseQueryLike,
    url: URL,
    filters: FilterConfig[]
): SupabaseQueryLike {
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
    const c = resolveConfig(config);
    return {
        list: buildList(c),
        getById: buildGetById(c),
        create: buildCreate(c),
        update: buildUpdate(c),
        remove: buildRemove(c),
    };
}

// ─── Resolved Config (normalizes defaults once) ──────────────

interface ResolvedConfig {
    table: string;
    resource: string;
    displayName: string;
    selectList: string;
    selectDetail: string;
    selectLookup: string;
    createSchema?: ZodSchema | undefined;
    updateSchema?: ZodSchema | undefined;
    filters: FilterConfig[];
    searchColumns: string[];
    defaultSort: SortConfig;
    stateMachine?: StateMachineDefinition<string> | undefined;
    statusColumn: string;
    softDelete: boolean;
    orgColumn: string;
    trackAuthor: boolean;
    maxPerPage: number;
    defaultPerPage: number;
    immutableColumns: string[];
    beforeCreate?: CrudConfig["beforeCreate"] | undefined;
    beforeUpdate?: CrudConfig["beforeUpdate"] | undefined;
    logPrefix: string;
}

function resolveConfig(config: CrudConfig): ResolvedConfig {
    const resource = config.resource;
    return {
        table: config.table,
        resource,
        displayName: config.displayName ?? resource,
        selectList: config.selectList ?? "*",
        selectDetail: config.selectDetail ?? "*",
        selectLookup: config.selectLookup ?? "id, name",
        createSchema: config.createSchema,
        updateSchema: config.updateSchema,
        filters: config.filters ?? [],
        searchColumns: config.searchColumns ?? [],
        defaultSort: config.defaultSort ?? { column: "created_at", ascending: false },
        stateMachine: config.stateMachine,
        statusColumn: config.statusColumn ?? "status",
        softDelete: config.softDelete ?? true,
        orgColumn: config.orgColumn ?? "organization_id",
        trackAuthor: config.trackAuthor ?? true,
        maxPerPage: config.maxPerPage ?? 100,
        defaultPerPage: config.defaultPerPage ?? 25,
        immutableColumns: config.immutableColumns ?? [],
        beforeCreate: config.beforeCreate,
        beforeUpdate: config.beforeUpdate,
        logPrefix: `[CRUD /${resource}]`,
    };
}

// ─── LIST handler builder ───────────────────────────────────

function buildList(c: ResolvedConfig) {
    return async function list(request: NextRequest): Promise<NextResponse> {
        const requestId = generateRequestId();
        const log = logger.child({ requestId, method: "GET", route: `/${c.resource}` });

        try {
            const authResult = await resolveAuth(request);
            if (!authResult.ok) return authResult.response;
            const { supabase, role: userRole, orgId } = authResult.auth;

            if (!hasPermission(userRole, c.resource, "read")) {
                return ApiErrors.forbidden(`Role "${userRole}" cannot read ${c.displayName}`);
            }

            const url = new URL(request.url);
            const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
            const perPage = Math.min(
                Math.max(
                    1,
                    parseInt(url.searchParams.get("per_page") ?? String(c.defaultPerPage), 10)
                ),
                c.maxPerPage
            );
            const sortBy = url.searchParams.get("sort_by") ?? c.defaultSort.column;
            const sortOrder =
                url.searchParams.get("sort_order") ?? (c.defaultSort.ascending ? "asc" : "desc");
            const search = url.searchParams.get("search");

            // Data query — uses selectList with joins for rich payloads
            let query = serverFromTable(supabase, c.table).select(c.selectList);

            // Org-scoping: defense-in-depth on top of RLS
            if (orgId) {
                query = query.eq(c.orgColumn, orgId);
            }

            if (c.softDelete) {
                query = query.is("deleted_at", null);
            }

            query = applyFilters(query, url, c.filters);

            if (search && c.searchColumns.length > 0) {
                const orClauses = c.searchColumns
                    .map((col) => `${col}.ilike.%${search}%`)
                    .join(",");
                query = query.or(orClauses);
            }

            const from = (page - 1) * perPage;
            const to = from + perPage - 1;
            query = query.order(sortBy, { ascending: sortOrder === "asc" }).range(from, to);

            // Count query — lightweight, no joins, just counts matching rows
            let countQuery = serverFromTable(supabase, c.table).select("id", {
                count: "exact",
                head: true,
            });

            if (orgId) {
                countQuery = countQuery.eq(c.orgColumn, orgId);
            }

            if (c.softDelete) {
                countQuery = countQuery.is("deleted_at", null);
            }

            countQuery = applyFilters(countQuery, url, c.filters);

            if (search && c.searchColumns.length > 0) {
                const orClauses = c.searchColumns
                    .map((col) => `${col}.ilike.%${search}%`)
                    .join(",");
                countQuery = countQuery.or(orClauses);
            }

            // Execute both in parallel for max throughput
            const [dataResult, countResult] = await Promise.all([query, countQuery]);

            if (dataResult.error) {
                // If org column doesn't exist, retry without org scoping
                if (dataResult.error.message?.includes(c.orgColumn)) {
                    return await listWithoutOrgScope(request, c, log, requestId);
                }
                log.error(`${c.logPrefix} LIST failed`, {
                    error: dataResult.error.message,
                    code: dataResult.error.code,
                });
                return ApiErrors.internalError(`Failed to fetch ${c.displayName}`);
            }

            const total = countResult.count ?? 0;

            const response = NextResponse.json({
                data: dataResult.data,
                pagination: {
                    page,
                    per_page: perPage,
                    total,
                    total_pages: total ? Math.ceil(total / perPage) : 0,
                },
            });
            response.headers.set("X-Request-Id", requestId);
            response.headers.set("Cache-Control", "private, max-age=0, stale-while-revalidate=60");
            return response;
        } catch (err) {
            log.error("Unhandled error in LIST", {
                error: err instanceof Error ? err.message : String(err),
            });
            return ApiErrors.internalError();
        }
    };
}

// Fallback LIST without org scoping (for tables without organization_id)
async function listWithoutOrgScope(
    request: NextRequest,
    c: ResolvedConfig,
    log: ReturnType<typeof logger.child>,
    requestId: string
): Promise<NextResponse> {
    const authResult = await resolveAuth(request);
    if (!authResult.ok) return authResult.response;
    const { supabase } = authResult.auth;

    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
    const perPage = Math.min(
        Math.max(1, parseInt(url.searchParams.get("per_page") ?? String(c.defaultPerPage), 10)),
        c.maxPerPage
    );
    const sortBy = url.searchParams.get("sort_by") ?? c.defaultSort.column;
    const sortOrder =
        url.searchParams.get("sort_order") ?? (c.defaultSort.ascending ? "asc" : "desc");
    const search = url.searchParams.get("search");

    let query = serverFromTable(supabase, c.table).select(c.selectList);
    if (c.softDelete) query = query.is("deleted_at", null);
    query = applyFilters(query, url, c.filters);
    if (search && c.searchColumns.length > 0) {
        query = query.or(c.searchColumns.map((col) => `${col}.ilike.%${search}%`).join(","));
    }
    const from = (page - 1) * perPage;
    query = query.order(sortBy, { ascending: sortOrder === "asc" }).range(from, from + perPage - 1);

    let countQuery = serverFromTable(supabase, c.table).select("id", {
        count: "exact",
        head: true,
    });
    if (c.softDelete) countQuery = countQuery.is("deleted_at", null);
    countQuery = applyFilters(countQuery, url, c.filters);
    if (search && c.searchColumns.length > 0) {
        countQuery = countQuery.or(
            c.searchColumns.map((col) => `${col}.ilike.%${search}%`).join(",")
        );
    }

    const [dataResult, countResult] = await Promise.all([query, countQuery]);

    if (dataResult.error) {
        log.error(`${c.logPrefix} LIST failed (no-org)`, { error: dataResult.error.message });
        return ApiErrors.internalError(`Failed to fetch ${c.displayName}`);
    }

    const total = countResult.count ?? 0;
    const response = NextResponse.json({
        data: dataResult.data,
        pagination: {
            page,
            per_page: perPage,
            total,
            total_pages: total ? Math.ceil(total / perPage) : 0,
        },
    });
    response.headers.set("X-Request-Id", requestId);
    response.headers.set("Cache-Control", "private, max-age=0, stale-while-revalidate=60");
    return response;
}

// ─── GET BY ID handler builder ──────────────────────────────

function buildGetById(c: ResolvedConfig) {
    return async function getById(
        request: NextRequest,
        { params }: { params: Promise<{ id: string }> }
    ): Promise<NextResponse> {
        const requestId = generateRequestId();
        const log = logger.child({ requestId, method: "GET", route: `/${c.resource}/:id` });

        try {
            const authResult = await resolveAuth(request);
            if (!authResult.ok) return authResult.response;
            const { supabase, role: userRole } = authResult.auth;

            if (!hasPermission(userRole, c.resource, "read")) {
                return ApiErrors.forbidden(`Role "${userRole}" cannot read ${c.displayName}`);
            }

            const { id } = await params;

            let query = serverFromTable(supabase, c.table).select(c.selectDetail).eq("id", id);

            if (c.softDelete) {
                query = query.is("deleted_at", null);
            }

            const { data, error } = await query.single();

            if (error) {
                if (error.code === "PGRST116") return ApiErrors.notFound(c.displayName);
                log.error(`${c.logPrefix} GET failed`, { id, error: error.message });
                return ApiErrors.internalError(`Failed to fetch ${c.displayName}`);
            }

            const response = NextResponse.json({ data });
            response.headers.set("X-Request-Id", requestId);
            response.headers.set("Cache-Control", "private, max-age=0, stale-while-revalidate=30");
            return response;
        } catch (err) {
            log.error("Unhandled error in GET", {
                error: err instanceof Error ? err.message : String(err),
            });
            return ApiErrors.internalError();
        }
    };
}

// ─── CREATE handler builder ─────────────────────────────────

function buildCreate(c: ResolvedConfig) {
    return async function create(request: NextRequest): Promise<NextResponse> {
        const requestId = generateRequestId();
        const log = logger.child({ requestId, method: "POST", route: `/${c.resource}` });

        const rlCheck = mutationLimiter.check(getClientId(request));
        if (!rlCheck.allowed) {
            log.warn("Rate limit exceeded");
            return rateLimitResponse(rlCheck.retryAfterSeconds);
        }

        try {
            const authResult = await resolveAuth(request);
            if (!authResult.ok) return authResult.response;
            const { supabase, userId, role: userRole } = authResult.auth;

            if (!hasPermission(userRole, c.resource, "write")) {
                return ApiErrors.forbidden(`Role "${userRole}" cannot create ${c.displayName}`);
            }

            let payload: Record<string, unknown>;

            if (c.createSchema) {
                const parsed = await parseAndValidate(request, c.createSchema);
                if (!parsed.success) return parsed.response;
                payload = parsed.data as Record<string, unknown>;
            } else {
                try {
                    payload = await request.json();
                } catch {
                    return ApiErrors.badRequest("Request body must be valid JSON");
                }
            }

            if (c.trackAuthor) {
                payload.created_by = userId;
            }

            if (c.stateMachine && !payload[c.statusColumn]) {
                payload[c.statusColumn] = c.stateMachine.initialState;
            }

            if (c.beforeCreate) {
                payload = await c.beforeCreate(payload, userId);
            }

            const idempotencyKey = request.headers.get("x-idempotency-key");
            if (idempotencyKey) {
                payload._idempotency_key = idempotencyKey;
            }

            const { data, error } = await serverFromTable(supabase, c.table)
                .insert(payload as Record<string, unknown>)
                .select(c.selectDetail)
                .single();

            if (error) {
                if (error.code === "23505") {
                    return ApiErrors.conflict(`${c.displayName} already exists (duplicate key)`);
                }
                log.error(`${c.logPrefix} CREATE failed`, {
                    error: error.message,
                    code: error.code,
                });
                return ApiErrors.internalError(`Failed to create ${c.displayName}`);
            }

            log.info(`${c.logPrefix} created`, {
                id: (data as Record<string, unknown>).id,
                userId,
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
    };
}

// ─── UPDATE handler builder ─────────────────────────────────

function buildUpdate(c: ResolvedConfig) {
    return async function update(
        request: NextRequest,
        { params }: { params: Promise<{ id: string }> }
    ): Promise<NextResponse> {
        const requestId = generateRequestId();
        const log = logger.child({ requestId, method: "PATCH", route: `/${c.resource}` });

        const rlCheck = mutationLimiter.check(getClientId(request));
        if (!rlCheck.allowed) {
            log.warn("Rate limit exceeded");
            return rateLimitResponse(rlCheck.retryAfterSeconds);
        }

        try {
            const authResult = await resolveAuth(request);
            if (!authResult.ok) return authResult.response;
            const { supabase, userId, role: userRole } = authResult.auth;

            if (!hasPermission(userRole, c.resource, "write")) {
                return ApiErrors.forbidden(`Role "${userRole}" cannot update ${c.displayName}`);
            }

            const { id } = await params;

            let payload: Record<string, unknown>;

            if (c.updateSchema) {
                const parsed = await parseAndValidate(request, c.updateSchema);
                if (!parsed.success) return parsed.response;
                payload = parsed.data as Record<string, unknown>;
            } else {
                try {
                    payload = await request.json();
                } catch {
                    return ApiErrors.badRequest("Request body must be valid JSON");
                }
            }

            for (const col of c.immutableColumns) {
                delete payload[col];
            }

            if (c.trackAuthor) {
                payload.updated_by = userId;
                payload.updated_at = new Date().toISOString();
            }

            if (c.stateMachine && payload[c.statusColumn]) {
                const targetStatus = payload[c.statusColumn] as string;

                const { data: current, error: fetchError } = await serverFromTable(
                    supabase,
                    c.table
                )
                    .select(c.statusColumn)
                    .eq("id", id)
                    .single();

                if (fetchError) {
                    if (fetchError.code === "PGRST116") return ApiErrors.notFound(c.displayName);
                    log.error(`${c.logPrefix} UPDATE fetch-current failed`, {
                        id,
                        error: fetchError.message,
                    });
                    return ApiErrors.internalError(`Failed to update ${c.displayName}`);
                }

                const currentStatus = (current as Record<string, unknown>)[
                    c.statusColumn
                ] as string;

                if (currentStatus !== targetStatus) {
                    const result = validateTransition(c.stateMachine, currentStatus, targetStatus, {
                        userRole,
                        entity: current as Record<string, unknown>,
                    });

                    if (!result.allowed) {
                        return ApiErrors.forbidden(result.reason ?? "Transition not allowed");
                    }
                }
            }

            if (c.beforeUpdate) {
                payload = await c.beforeUpdate(payload, userId);
            }

            const { data, error } = await serverFromTable(supabase, c.table)
                .update(payload as Record<string, unknown>)
                .eq("id", id)
                .select(c.selectDetail)
                .single();

            if (error) {
                if (error.code === "PGRST116") return ApiErrors.notFound(c.displayName);
                log.error(`${c.logPrefix} UPDATE failed`, { id, error: error.message });
                return ApiErrors.internalError(`Failed to update ${c.displayName}`);
            }

            log.info(`${c.logPrefix} updated`, { id, userId });
            const response = NextResponse.json({ data });
            response.headers.set("X-Request-Id", requestId);
            return response;
        } catch (err) {
            log.error("Unhandled error in UPDATE", {
                error: err instanceof Error ? err.message : String(err),
            });
            return ApiErrors.internalError();
        }
    };
}

// ─── DELETE handler builder ─────────────────────────────────

function buildRemove(c: ResolvedConfig) {
    return async function remove(
        request: NextRequest,
        { params }: { params: Promise<{ id: string }> }
    ): Promise<NextResponse> {
        const requestId = generateRequestId();
        const log = logger.child({ requestId, method: "DELETE", route: `/${c.resource}` });

        const rlCheck = mutationLimiter.check(getClientId(request));
        if (!rlCheck.allowed) {
            log.warn("Rate limit exceeded");
            return rateLimitResponse(rlCheck.retryAfterSeconds);
        }

        try {
            const authResult = await resolveAuth(request);
            if (!authResult.ok) return authResult.response;
            const { supabase, userId, role: userRole } = authResult.auth;

            if (!hasPermission(userRole, c.resource, "delete")) {
                return ApiErrors.forbidden(`Role "${userRole}" cannot delete ${c.displayName}`);
            }

            const { id } = await params;

            if (c.softDelete) {
                const updatePayload: Record<string, unknown> = {
                    deleted_at: new Date().toISOString(),
                };
                if (c.trackAuthor) {
                    updatePayload.deleted_by = userId;
                }

                const { error } = await serverFromTable(supabase, c.table)
                    .update(updatePayload as Record<string, unknown>)
                    .eq("id", id);

                if (error) {
                    log.error(`${c.logPrefix} SOFT DELETE failed`, { id, error: error.message });
                    return ApiErrors.internalError(`Failed to delete ${c.displayName}`);
                }
            } else {
                const { error } = await serverFromTable(supabase, c.table).delete().eq("id", id);

                if (error) {
                    log.error(`${c.logPrefix} HARD DELETE failed`, { id, error: error.message });
                    return ApiErrors.internalError(`Failed to delete ${c.displayName}`);
                }
            }

            log.info(`${c.logPrefix} deleted`, { id, userId, soft: c.softDelete });
            const response = NextResponse.json({ success: true });
            response.headers.set("X-Request-Id", requestId);
            return response;
        } catch (err) {
            log.error("Unhandled error in DELETE", {
                error: err instanceof Error ? err.message : String(err),
            });
            return ApiErrors.internalError();
        }
    };
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
    const c = resolveConfig(config);
    return {
        GET: buildList(c),
        POST: buildCreate(c),
    };
}

export function createItemRoute(config: CrudConfig): ItemRouteHandlers {
    const c = resolveConfig(config);
    return {
        GET: buildGetById(c),
        PATCH: buildUpdate(c),
        DELETE: buildRemove(c),
    };
}
