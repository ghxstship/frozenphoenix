"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
import { createClient, isSupabaseConfigured } from "./client";

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

export interface PaginationState {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export interface PaginatedResult<T> {
    data: T[];
    pagination: PaginationState;
}

export interface UsePaginatedQueryOptions<T> {
    queryKey: string[];
    table: string;
    select?: string;
    filters?: Record<string, unknown>;
    orderBy?: { column: string; ascending?: boolean };
    pageSize?: number;
    enabled?: boolean;
    transform?: (row: unknown) => T;
}

function getSupabase() {
    const client = createClient();
    if (!client) {
        throw new Error("Supabase client not configured");
    }
    return client;
}

export function usePaginatedQuery<T>({
    queryKey,
    table,
    select = "*",
    filters = {},
    orderBy = { column: "created_at", ascending: false },
    pageSize = DEFAULT_PAGE_SIZE,
    enabled = true,
    transform,
}: UsePaginatedQueryOptions<T>) {
    const [page, setPage] = useState(1);
    const queryClient = useQueryClient();

    const effectivePageSize = Math.min(pageSize, MAX_PAGE_SIZE);
    const from = (page - 1) * effectivePageSize;
    const to = from + effectivePageSize - 1;

    const result = useQuery({
        queryKey: [...queryKey, "paginated", page, effectivePageSize, JSON.stringify(filters)],
        queryFn: async () => {
            const supabase = getSupabase();
            let query = supabase.from(table as never)
                .select(select, { count: "exact" })
                .order(orderBy.column, { ascending: orderBy.ascending ?? false })
                .range(from, to);

            for (const [key, value] of Object.entries(filters)) {
                if (value !== undefined && value !== null && value !== "" && value !== "all") {
                    query = query.eq(key, value);
                }
            }

            const { data, error, count } = await query;
            if (error) throw error;

            const totalCount = count ?? 0;
            const rows = transform ? (data ?? []).map(transform) : (data ?? []) as T[];

            return {
                data: rows,
                pagination: {
                    page,
                    pageSize: effectivePageSize,
                    totalCount,
                    totalPages: Math.max(1, Math.ceil(totalCount / effectivePageSize)),
                },
            } as PaginatedResult<T>;
        },
        enabled: enabled && isSupabaseConfigured,
        placeholderData: (prev) => prev,
    });

    const goToPage = useCallback((newPage: number) => {
        const maxPage = result.data?.pagination.totalPages ?? 1;
        setPage(Math.max(1, Math.min(newPage, maxPage)));
    }, [result.data?.pagination.totalPages]);

    const nextPage = useCallback(() => goToPage(page + 1), [goToPage, page]);
    const prevPage = useCallback(() => goToPage(page - 1), [goToPage, page]);

    const prefetchNextPage = useCallback(() => {
        const totalPages = result.data?.pagination.totalPages ?? 1;
        if (page < totalPages) {
            const nextFrom = page * effectivePageSize;
            const nextTo = nextFrom + effectivePageSize - 1;
            queryClient.prefetchQuery({
                queryKey: [...queryKey, "paginated", page + 1, effectivePageSize, JSON.stringify(filters)],
                queryFn: async () => {
                    const supabase = getSupabase();
                    let query = supabase.from(table as never)
                        .select(select, { count: "exact" })
                        .order(orderBy.column, { ascending: orderBy.ascending ?? false })
                        .range(nextFrom, nextTo);

                    for (const [key, value] of Object.entries(filters)) {
                        if (value !== undefined && value !== null && value !== "" && value !== "all") {
                            query = query.eq(key, value);
                        }
                    }

                    const { data, error, count } = await query;
                    if (error) throw error;

                    const totalCount = count ?? 0;
                    const rows = transform ? (data ?? []).map(transform) : (data ?? []) as T[];
                    return {
                        data: rows,
                        pagination: {
                            page: page + 1,
                            pageSize: effectivePageSize,
                            totalCount,
                            totalPages: Math.max(1, Math.ceil(totalCount / effectivePageSize)),
                        },
                    } as PaginatedResult<T>;
                },
            });
        }
    }, [page, effectivePageSize, queryKey, table, select, orderBy, filters, queryClient, result.data?.pagination.totalPages, transform]);

    const paginationControls = useMemo(() => ({
        page,
        pageSize: effectivePageSize,
        totalCount: result.data?.pagination.totalCount ?? 0,
        totalPages: result.data?.pagination.totalPages ?? 1,
        hasNext: page < (result.data?.pagination.totalPages ?? 1),
        hasPrev: page > 1,
        goToPage,
        nextPage,
        prevPage,
        prefetchNextPage,
    }), [page, effectivePageSize, result.data?.pagination, goToPage, nextPage, prevPage, prefetchNextPage]);

    return {
        ...result,
        data: result.data?.data ?? [],
        pagination: paginationControls,
    };
}

export { isSupabaseConfigured };
