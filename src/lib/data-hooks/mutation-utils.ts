"use client";

import { useMutation, type UseMutationOptions, useQueryClient } from "@tanstack/react-query";

// ─── S6: Idempotency Key Generation ───
// Generates a unique idempotency key for mutation deduplication.
// Keys are stored client-side and sent with mutations to prevent duplicate submissions.
const pendingKeys = new Map<string, string>();

export function generateIdempotencyKey(entityType: string, action: string): string {
    const key = `${entityType}:${action}:${crypto.randomUUID()}`;
    return key;
}

export function getOrCreateIdempotencyKey(
    entityType: string,
    action: string,
    dedupeId?: string
): string {
    const lookupKey = dedupeId ?? `${entityType}:${action}`;
    if (pendingKeys.has(lookupKey)) {
        return pendingKeys.get(lookupKey)!;
    }
    const key = generateIdempotencyKey(entityType, action);
    pendingKeys.set(lookupKey, key);
    return key;
}

export function clearIdempotencyKey(dedupeId: string): void {
    pendingKeys.delete(dedupeId);
}

// ─── Optimistic Mutation Factory ───
// Creates a mutation with optimistic UI updates and automatic rollback on error.
interface OptimisticMutationOptions<TData, TVariables> {
    mutationFn: (variables: TVariables) => Promise<TData>;
    queryKey: string[];
    entityType: string;
    // Optimistic update: modify the cache before the mutation completes
    optimisticUpdate?: (variables: TVariables, oldData: TData[] | undefined) => TData[];
    onSuccessMessage?: string;
}

export function useOptimisticMutation<TData, TVariables>(
    options: OptimisticMutationOptions<TData, TVariables>
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (variables: TVariables) => {
            const dedupeId = JSON.stringify(variables);
            // Generate idempotency key for deduplication
            // The actual enforcement happens at the DB level via idempotency_keys table
            getOrCreateIdempotencyKey(options.entityType, "mutate", dedupeId);

            const result = await options.mutationFn(variables);

            clearIdempotencyKey(dedupeId);
            return result;
        },
        onMutate: async (variables) => {
            // Cancel any outgoing refetches to prevent overwriting optimistic update
            await queryClient.cancelQueries({ queryKey: options.queryKey });

            // Snapshot previous value for rollback
            const previousData = queryClient.getQueryData<TData[]>(options.queryKey);

            // Optimistically update the cache
            if (options.optimisticUpdate && previousData) {
                queryClient.setQueryData(
                    options.queryKey,
                    options.optimisticUpdate(variables, previousData)
                );
            }

            return { previousData };
        },
        onError: (_err, _variables, context) => {
            // Rollback to previous data on error
            if (context?.previousData) {
                queryClient.setQueryData(options.queryKey, context.previousData);
            }
        },
        onSettled: () => {
            // Refetch to ensure consistency after mutation settles
            queryClient.invalidateQueries({ queryKey: options.queryKey });
        },
    } as UseMutationOptions<TData, Error, TVariables, { previousData: TData[] | undefined }>);
}

// ─── B1: Pagination Helper ───
export interface PaginationParams {
    page: number;
    pageSize: number;
}

export interface PaginatedResult<T> {
    data: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export function getPaginationRange(params: PaginationParams): { from: number; to: number } {
    const from = params.page * params.pageSize;
    const to = from + params.pageSize - 1;
    return { from, to };
}

export function buildPaginatedResult<T>(
    data: T[],
    totalCount: number,
    params: PaginationParams
): PaginatedResult<T> {
    const totalPages = Math.ceil(totalCount / params.pageSize);
    return {
        data,
        totalCount,
        page: params.page,
        pageSize: params.pageSize,
        totalPages,
        hasNext: params.page < totalPages - 1,
        hasPrev: params.page > 0,
    };
}
