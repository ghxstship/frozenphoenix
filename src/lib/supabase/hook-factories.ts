"use client";

/**
 * Shared hook factory functions for generating CRUD hooks.
 * All hooks go through API routes for RBAC, validation & audit logging.
 *
 * SSOT: This is the single definition of all factory functions.
 * Do NOT redefine these in any other file.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiCreate, apiDelete, apiGet, apiList, apiUpdate } from "@/lib/api/client";

export type FilterParams = Record<string, string | number | boolean | undefined>;

/**
 * Creates a list query hook for an entity.
 * Query key pattern: [key, mergedFilters]
 */
export function makeListHook<T>(key: string, basePath: string, defaultParams?: FilterParams) {
    return function useEntityList(filters?: FilterParams) {
        const merged = { ...defaultParams, ...filters };
        return useQuery({
            queryKey: [key, merged],
            queryFn: () => apiList<T>(basePath, merged).then((r) => r.data),
        });
    };
}

/**
 * Creates a single-record detail query hook for an entity.
 * Query key pattern: [key, "detail", id]
 */
export function makeDetailHook<T>(key: string, basePath: string) {
    return function useEntityDetail(id?: string) {
        return useQuery({
            queryKey: [key, "detail", id],
            queryFn: () => apiGet<T>(basePath, id!),
            enabled: !!id,
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
 * Invalidates: [key], [key, "detail", id], plus any extraKeys.
 */
export function makeUpdateHook<T>(key: string, basePath: string, extraKeys?: string[]) {
    return function useEntityUpdate() {
        const qc = useQueryClient();
        return useMutation({
            mutationFn: ({ id, ...payload }: { id: string } & Record<string, unknown>) =>
                apiUpdate<T>(basePath, id, payload),
            onSuccess: (_data, variables) => {
                qc.invalidateQueries({ queryKey: [key] });
                qc.invalidateQueries({ queryKey: [key, "detail", variables.id] });
                extraKeys?.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
            },
        });
    };
}

/**
 * Creates a mutation hook for deleting an entity.
 * Invalidates: [key], plus any extraKeys.
 */
export function makeDeleteHook(key: string, basePath: string, extraKeys?: string[]) {
    return function useEntityDelete() {
        const qc = useQueryClient();
        return useMutation({
            mutationFn: (id: string) => apiDelete(basePath, id),
            onSuccess: () => {
                qc.invalidateQueries({ queryKey: [key] });
                extraKeys?.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
            },
        });
    };
}
