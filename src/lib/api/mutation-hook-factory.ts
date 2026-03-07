"use client";

/* ═══════════════════════════════════════════════════════════════
   MUTATION HOOK FACTORY — P0.4 Foundation Infrastructure
   
   Generates standardized React Query mutation hooks for any entity.
   All mutations route through API endpoints (never direct Supabase).
   
   Provides:
   - useCreate<Entity>  — POST to collection route
   - useUpdate<Entity>  — PATCH to item route
   - useDelete<Entity>  — DELETE to item route
   - useTransition<Entity> — PATCH with status change (state machine)
   - Toast notifications on success/error
   - Optimistic cache invalidation
   - Idempotency key generation
   
   Usage:
     const { useCreate, useUpdate, useDelete, useTransition } = createMutationHooks({
       resource: "projects",
       basePath: "/api/projects",
       queryKey: ["projects"],
     });
     
     // In component:
     const createProject = useCreate();
     createProject.mutate({ name: "New Project" });
   ═══════════════════════════════════════════════════════════════ */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

// ─── Types ───────────────────────────────────────────────────

export interface MutationHookConfig {
    /** Resource name for display (e.g., "Project") */
    resource: string;
    /** Base API path (e.g., "/api/projects") */
    basePath: string;
    /** React Query cache key to invalidate on success */
    queryKey: string[];
    /** Additional query keys to invalidate on success */
    relatedKeys?: string[][];
    /** Toast function — if provided, shows success/error messages */
    toast?: (opts: {
        title: string;
        description?: string;
        variant?: "default" | "destructive";
    }) => void;
}

export interface CreateOptions<TInput = Record<string, unknown>> {
    onSuccess?: (data: unknown) => void;
    onError?: (error: Error) => void;
    /** Override the default toast messages */
    successMessage?: string;
    errorMessage?: string;
    /** Additional headers */
    headers?: Record<string, string>;
    /** Transform payload before sending */
    transform?: (input: TInput) => Record<string, unknown>;
}

export interface UpdateOptions<TInput = Record<string, unknown>> {
    onSuccess?: (data: unknown) => void;
    onError?: (error: Error) => void;
    successMessage?: string;
    errorMessage?: string;
    transform?: (input: TInput) => Record<string, unknown>;
}

export interface DeleteOptions {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    successMessage?: string;
    errorMessage?: string;
}

export interface TransitionOptions {
    onSuccess?: (data: unknown) => void;
    onError?: (error: Error) => void;
}

// ─── Idempotency ─────────────────────────────────────────────

function generateIdempotencyKey(): string {
    return `idem_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

// ─── API Fetch Helper ────────────────────────────────────────

async function apiFetch<T = unknown>(url: string, options: RequestInit): Promise<T> {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    const body = await response.json();

    if (!response.ok) {
        const message =
            body?.error?.message ?? body?.message ?? `Request failed (${response.status})`;
        throw new Error(message);
    }

    return body.data ?? body;
}

// ─── Factory ─────────────────────────────────────────────────

export function createMutationHooks(config: MutationHookConfig) {
    const { resource, basePath, queryKey, relatedKeys = [] } = config;

    /**
     * useCreate — POST to collection endpoint
     */
    function useCreate<TInput = Record<string, unknown>>(options?: CreateOptions<TInput>) {
        const queryClient = useQueryClient();
        const idempotencyKeyRef = useRef<string>("");

        const mutation = useMutation({
            mutationFn: async (input: TInput) => {
                const payload = options?.transform
                    ? options.transform(input)
                    : (input as Record<string, unknown>);

                if (!idempotencyKeyRef.current) {
                    idempotencyKeyRef.current = generateIdempotencyKey();
                }

                return apiFetch(basePath, {
                    method: "POST",
                    body: JSON.stringify(payload),
                    headers: {
                        "X-Idempotency-Key": idempotencyKeyRef.current,
                        ...options?.headers,
                    },
                });
            },
            onSuccess: (data) => {
                idempotencyKeyRef.current = "";
                queryClient.invalidateQueries({ queryKey });
                for (const key of relatedKeys) {
                    queryClient.invalidateQueries({ queryKey: key });
                }
                if (config.toast) {
                    config.toast({
                        title: options?.successMessage ?? `${resource} created`,
                    });
                }
                options?.onSuccess?.(data);
            },
            onError: (error: Error) => {
                if (config.toast) {
                    config.toast({
                        title:
                            options?.errorMessage ?? `Failed to create ${resource.toLowerCase()}`,
                        description: error.message,
                        variant: "destructive",
                    });
                }
                options?.onError?.(error);
            },
        });

        return mutation;
    }

    /**
     * useUpdate — PATCH to item endpoint
     */
    function useUpdate<TInput = Record<string, unknown>>(options?: UpdateOptions<TInput>) {
        const queryClient = useQueryClient();

        const mutation = useMutation({
            mutationFn: async ({ id, data }: { id: string; data: TInput }) => {
                const payload = options?.transform
                    ? options.transform(data)
                    : (data as Record<string, unknown>);

                return apiFetch(`${basePath}/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                });
            },
            onSuccess: (data, { id }) => {
                queryClient.invalidateQueries({ queryKey });
                queryClient.invalidateQueries({ queryKey: [...queryKey, id] });
                for (const key of relatedKeys) {
                    queryClient.invalidateQueries({ queryKey: key });
                }
                if (config.toast) {
                    config.toast({
                        title: options?.successMessage ?? `${resource} updated`,
                    });
                }
                options?.onSuccess?.(data);
            },
            onError: (error: Error) => {
                if (config.toast) {
                    config.toast({
                        title:
                            options?.errorMessage ?? `Failed to update ${resource.toLowerCase()}`,
                        description: error.message,
                        variant: "destructive",
                    });
                }
                options?.onError?.(error);
            },
        });

        return mutation;
    }

    /**
     * useDelete — DELETE to item endpoint
     */
    function useDelete(options?: DeleteOptions) {
        const queryClient = useQueryClient();

        const mutation = useMutation({
            mutationFn: async (id: string) => {
                return apiFetch(`${basePath}/${id}`, {
                    method: "DELETE",
                });
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey });
                for (const key of relatedKeys) {
                    queryClient.invalidateQueries({ queryKey: key });
                }
                if (config.toast) {
                    config.toast({
                        title: options?.successMessage ?? `${resource} deleted`,
                    });
                }
                options?.onSuccess?.();
            },
            onError: (error: Error) => {
                if (config.toast) {
                    config.toast({
                        title:
                            options?.errorMessage ?? `Failed to delete ${resource.toLowerCase()}`,
                        description: error.message,
                        variant: "destructive",
                    });
                }
                options?.onError?.(error);
            },
        });

        return mutation;
    }

    /**
     * useTransition — PATCH with status field (state machine transition)
     */
    function useTransition(options?: TransitionOptions) {
        const queryClient = useQueryClient();

        const mutation = useMutation({
            mutationFn: async ({
                id,
                status,
                ...rest
            }: {
                id: string;
                status: string;
                [key: string]: unknown;
            }) => {
                return apiFetch(`${basePath}/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify({ status, ...rest }),
                });
            },
            onSuccess: (data, { id }) => {
                queryClient.invalidateQueries({ queryKey });
                queryClient.invalidateQueries({ queryKey: [...queryKey, id] });
                for (const key of relatedKeys) {
                    queryClient.invalidateQueries({ queryKey: key });
                }
                if (config.toast) {
                    config.toast({
                        title: `${resource} status updated`,
                    });
                }
                options?.onSuccess?.(data);
            },
            onError: (error: Error) => {
                if (config.toast) {
                    config.toast({
                        title: `Failed to update ${resource.toLowerCase()} status`,
                        description: error.message,
                        variant: "destructive",
                    });
                }
                options?.onError?.(error);
            },
        });

        return mutation;
    }

    /**
     * useList — GET from collection endpoint (query hook, not mutation)
     */
    function useListQueryKey(params?: Record<string, string | number | undefined>) {
        const searchParams = new URLSearchParams();
        if (params) {
            for (const [key, value] of Object.entries(params)) {
                if (value !== undefined) searchParams.set(key, String(value));
            }
        }
        return [...queryKey, searchParams.toString()];
    }

    return {
        useCreate,
        useUpdate,
        useDelete,
        useTransition,
        useListQueryKey,
        /** The base query key for cache operations */
        queryKey,
        /** The base API path */
        basePath,
    };
}

// ─── Convenience: Entity-specific hook set generator ─────────

export interface EntityHookSet<
    TCreate = Record<string, unknown>,
    TUpdate = Record<string, unknown>,
> {
    useCreate: (
        options?: CreateOptions<TCreate>
    ) => ReturnType<ReturnType<typeof createMutationHooks>["useCreate"]>;
    useUpdate: (
        options?: UpdateOptions<TUpdate>
    ) => ReturnType<ReturnType<typeof createMutationHooks>["useUpdate"]>;
    useDelete: (
        options?: DeleteOptions
    ) => ReturnType<ReturnType<typeof createMutationHooks>["useDelete"]>;
    useTransition: (
        options?: TransitionOptions
    ) => ReturnType<ReturnType<typeof createMutationHooks>["useTransition"]>;
    queryKey: string[];
    basePath: string;
}

/**
 * Creates a complete hook set for a named entity.
 * Designed to be called once per entity module, then imported by components.
 *
 * Example:
 *   // src/hooks/use-project-mutations.ts
 *   export const projectMutations = createEntityMutations({
 *     resource: "Project",
 *     basePath: "/api/projects",
 *     queryKey: ["projects"],
 *   });
 *
 *   // In component:
 *   const create = projectMutations.useCreate();
 *   create.mutate({ name: "New" });
 */
export function createEntityMutations(config: MutationHookConfig) {
    return createMutationHooks(config);
}
