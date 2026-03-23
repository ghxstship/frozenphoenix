/* ═══════════════════════════════════════════════════════════════
   API CLIENT — Typed fetch helpers for consuming CRUD API routes
   
   All hooks should use these helpers instead of direct Supabase
   client calls. This ensures every request flows through the API
   layer which enforces RBAC, validation, state machines, and
   audit logging.
   
   Response shapes (from crud-factory.ts):
   - LIST:   { data: T[], pagination: { page, per_page, total, total_pages } }
   - GET:    { data: T }
   - CREATE: { data: T } (status 201)
   - UPDATE: { data: T }
   - DELETE: { success: true }
   - ERROR:  { error: { message, code?, details? } }
   ═══════════════════════════════════════════════════════════════ */

import { CSRF_HEADER_NAME, getCsrfToken } from "@/lib/security/csrf";

// ─── Response Types ─────────────────────────────────────────

export interface ApiPagination {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
}

export interface ApiListResponse<T> {
    data: T[];
    pagination: ApiPagination;
}

export interface ApiItemResponse<T> {
    data: T;
}

export interface ApiDeleteResponse {
    success: boolean;
}

export interface ApiErrorResponse {
    error: {
        message: string;
        code?: string | undefined;
        details?: unknown | undefined;
    };
}

// ─── Query Parameter Helpers ────────────────────────────────

export interface ListParams {
    page?: number | undefined;
    per_page?: number | undefined;
    sort_by?: string | undefined;
    sort_order?: "asc" | "desc" | undefined;
    search?: string | undefined;
    [key: string]: string | number | boolean | undefined;
}

function buildQueryString(params?: ListParams): string {
    if (!params) return "";
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.set(key, String(value));
        }
    }
    const qs = searchParams.toString();
    return qs ? `?${qs}` : "";
}

// ─── Core Fetch Helper ──────────────────────────────────────

class ApiError extends Error {
    status: number;
    code?: string | undefined;
    constructor(message: string, status: number, code?: string) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
    }
}

export { ApiError };

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
    // Auto-inject CSRF header on state-mutating requests
    const method = (options?.method ?? "GET").toUpperCase();
    const isMutating = method !== "GET" && method !== "HEAD" && method !== "OPTIONS";
    const csrfToken = isMutating ? getCsrfToken() : null;

    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(csrfToken ? { [CSRF_HEADER_NAME]: csrfToken } : {}),
            ...options?.headers,
        },
    });

    if (!res.ok) {
        let errorMessage = `API error: ${res.status}`;
        let code: string | undefined;
        try {
            const body = (await res.json()) as ApiErrorResponse;
            if (body.error?.message) errorMessage = body.error.message;
            code = body.error?.code;
        } catch {
            // non-JSON error body
        }
        throw new ApiError(errorMessage, res.status, code);
    }

    // DELETE returns { success: true } — some callers don't need a parsed body
    if (res.status === 204) return undefined as T;

    return res.json() as Promise<T>;
}

// ─── CRUD Operations ────────────────────────────────────────

/**
 * Fetch a paginated list from a collection endpoint.
 * @param basePath - API path, e.g. "/api/deals"
 * @param params - Query params (filters, pagination, sort, search)
 */
export async function apiList<T>(
    basePath: string,
    params?: ListParams
): Promise<ApiListResponse<T>> {
    return apiFetch<ApiListResponse<T>>(`${basePath}${buildQueryString(params)}`);
}

/**
 * Fetch a single record by ID.
 * @param basePath - API path, e.g. "/api/deals"
 * @param id - Record UUID
 */
export async function apiGet<T>(basePath: string, id: string): Promise<T> {
    const res = await apiFetch<ApiItemResponse<T>>(`${basePath}/${id}`);
    return res.data;
}

/**
 * Create a new record.
 * @param basePath - API path, e.g. "/api/deals"
 * @param payload - Record data
 */
export async function apiCreate<T>(basePath: string, payload: Record<string, unknown>): Promise<T> {
    const res = await apiFetch<ApiItemResponse<T>>(basePath, {
        method: "POST",
        body: JSON.stringify(payload),
    });
    return res.data;
}

/**
 * Update an existing record by ID.
 * @param basePath - API path, e.g. "/api/deals"
 * @param id - Record UUID
 * @param payload - Partial update data
 */
export async function apiUpdate<T>(
    basePath: string,
    id: string,
    payload: Record<string, unknown>
): Promise<T> {
    const res = await apiFetch<ApiItemResponse<T>>(`${basePath}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
    return res.data;
}

/**
 * Soft-delete a record by ID.
 * @param basePath - API path, e.g. "/api/deals"
 * @param id - Record UUID
 */
export async function apiDelete(basePath: string, id: string): Promise<void> {
    await apiFetch<ApiDeleteResponse>(`${basePath}/${id}`, {
        method: "DELETE",
    });
}
