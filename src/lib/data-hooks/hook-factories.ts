"use client";

/**
 * Shared hook factory functions for generating CRUD hooks.
 * All hooks go through API routes for RBAC, validation & audit logging.
 *
 * SSOT: This is the single definition of all factory functions.
 * Do NOT redefine these in any other file.
 *
 * staleTime categories (override at factory level):
 *   - Reference data (locations, roles, brands): 5 * 60_000 (5 min)
 *   - User/entity lists (projects, crew, events):  defaults to global 60_000
 *   - Real-time feeds (activity, notifications):   5_000 (5s)
 */

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiCreate, apiDelete, apiGet, apiList, apiUpdate } from "@/lib/api/client";

export type FilterParams = Record<string, string | number | boolean | undefined>;

interface HookFactoryOptions {
    /** Per-domain staleTime override (ms). Undefined = use global default (60s). */
    staleTime?: number | undefined;
    /** Per-domain gcTime override (ms). Controls how long inactive data stays in cache.
     *  Defaults: reference data = 10min, entity lists = 5min (TanStack default). */
    gcTime?: number | undefined;
}

/**
 * Creates a list query hook for an entity.
 * Query key pattern: [key, mergedFilters]
 *
 * Pass `_enabled: false` in filters to skip the fetch entirely.
 * This is used to disable queries for invalid IDs without breaking hooks rules.
 */
export function makeListHook<T>(
    key: string,
    basePath: string,
    defaultParams?: FilterParams,
    options?: HookFactoryOptions
) {
    return function useEntityList(filters?: FilterParams) {
        // Extract _enabled control flag — remove from API params.
        const { _enabled, ...restFilters } = { ...defaultParams, ...filters };
        const isEnabled = _enabled !== false && _enabled !== "false";
        return useQuery({
            queryKey: [key, restFilters],
            queryFn: () => apiList<T>(basePath, restFilters).then((r) => r.data),
            enabled: isEnabled,
            // Performance: Keep previous data visible during refetch/filter changes
            // instead of flashing a skeleton. Industry-standard SaaS pattern.
            placeholderData: keepPreviousData,
            ...(options?.staleTime !== undefined && { staleTime: options.staleTime }),
            ...(options?.gcTime !== undefined && { gcTime: options.gcTime }),
        });
    };
}

/**
 * UUID v4 format — used to skip queries for invalid IDs
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Creates a single-record detail query hook for an entity.
 * Query key pattern: [key, "detail", id]
 *
 * Performance: If `id` is not a valid UUID, the query is disabled entirely.
 * This prevents slow API/Supabase round-trips for invalid/test links.
 */
export function makeDetailHook<T>(key: string, basePath: string, options?: HookFactoryOptions) {
    return function useEntityDetail(id?: string) {
        const isValid = !!id && UUID_RE.test(id);
        return useQuery({
            queryKey: [key, "detail", id],
            queryFn: () => apiGet<T>(basePath, id!),
            enabled: isValid,
            // Performance: Keep previous record visible while loading new one
            placeholderData: keepPreviousData,
            ...(options?.staleTime !== undefined && { staleTime: options.staleTime }),
            ...(options?.gcTime !== undefined && { gcTime: options.gcTime }),
        });
    };
}

/**
 * Creates a mutation hook for creating an entity.
 * Invalidates: [key], plus any extraKeys.
 */
export function makeCreateHook<T>(key: string, basePath: string, extraKeys?: string[]) {
    return function useEntityCreate() {
        const qc = useQueryClient();
        return useMutation({
            mutationFn: (payload: Record<string, unknown>) => apiCreate<T>(basePath, payload),
            onSuccess: () => {
                qc.invalidateQueries({ queryKey: [key] });
                extraKeys?.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
            },
        });
    };
}

/**
 * Creates a mutation hook for updating an entity.
 * Performance: Optimistic update — patches list + detail caches instantly,
 * rolls back on error, then revalidates from server on settle.
 */
export function makeUpdateHook<T>(key: string, basePath: string, extraKeys?: string[]) {
    return function useEntityUpdate() {
        const qc = useQueryClient();
        return useMutation({
            mutationFn: ({ id, ...payload }: { id: string } & Record<string, unknown>) =>
                apiUpdate<T>(basePath, id, payload),
            onMutate: async (variables) => {
                const { id, ...patch } = variables;
                await qc.cancelQueries({ queryKey: [key] });
                await qc.cancelQueries({ queryKey: [key, "detail", id] });

                const previousDetail = qc.getQueryData([key, "detail", id]);
                const previousLists = qc.getQueriesData({ queryKey: [key] });

                // Optimistically update detail cache
                if (previousDetail) {
                    qc.setQueryData([key, "detail", id], (old: unknown) =>
                        old && typeof old === "object" ? { ...old, ...patch } : old
                    );
                }

                // Optimistically update list caches
                qc.setQueriesData({ queryKey: [key] }, (old: unknown) => {
                    if (!Array.isArray(old)) return old;
                    return old.map((item: Record<string, unknown>) =>
                        item.id === id ? { ...item, ...patch } : item
                    );
                });

                return { previousDetail, previousLists };
            },
            onError: (_err, variables, context) => {
                // Rollback on error
                if (context?.previousDetail) {
                    qc.setQueryData([key, "detail", variables.id], context.previousDetail);
                }
                if (context?.previousLists) {
                    for (const [queryKey, data] of context.previousLists) {
                        qc.setQueryData(queryKey, data);
                    }
                }
            },
            onSettled: (_data, _err, variables) => {
                qc.invalidateQueries({ queryKey: [key] });
                qc.invalidateQueries({ queryKey: [key, "detail", variables.id] });
                extraKeys?.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
            },
        });
    };
}

/**
 * Creates a mutation hook for deleting an entity.
 * Performance: Optimistic delete — removes from list cache instantly,
 * rolls back on error, then revalidates from server on settle.
 */
export function makeDeleteHook(key: string, basePath: string, extraKeys?: string[]) {
    return function useEntityDelete() {
        const qc = useQueryClient();
        return useMutation({
            mutationFn: (id: string) => apiDelete(basePath, id),
            onMutate: async (id) => {
                await qc.cancelQueries({ queryKey: [key] });
                const previousLists = qc.getQueriesData({ queryKey: [key] });

                // Optimistically remove from list caches
                qc.setQueriesData({ queryKey: [key] }, (old: unknown) => {
                    if (!Array.isArray(old)) return old;
                    return old.filter((item: Record<string, unknown>) => item.id !== id);
                });

                return { previousLists };
            },
            onError: (_err, _id, context) => {
                if (context?.previousLists) {
                    for (const [queryKey, data] of context.previousLists) {
                        qc.setQueryData(queryKey, data);
                    }
                }
            },
            onSettled: () => {
                qc.invalidateQueries({ queryKey: [key] });
                extraKeys?.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
            },
        });
    };
}
