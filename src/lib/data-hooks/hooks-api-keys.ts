"use client";

/* ═══════════════════════════════════════════════════════════════
   API KEYS HOOKS — Developer API Key Management

   CRUD hooks for API key lifecycle: create, list, revoke.
   ═══════════════════════════════════════════════════════════════ */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiCreate, apiList, apiUpdate } from "@/lib/api/client";

export interface ApiKey {
    id: string;
    name: string;
    prefix: string;
    scopes: string[];
    last_used_at: string | null;
    expires_at: string | null;
    created_at: string;
    revoked: boolean;
}

export function useApiKeys() {
    return useQuery({
        queryKey: ["api_key"],
        queryFn: async () => {
            const res = await apiList<ApiKey>("/api/settings/api-keys", {
                sort_by: "created_at",
                sort_order: "desc",
            });
            return res.data ?? [];
        },
    });
}

export function useCreateApiKey() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: {
            name: string;
            scopes: string[];
            expires_in_days?: number | undefined;
        }) => apiCreate<ApiKey & { secret: string }>("/api/settings/api-keys", payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["api_key"] }),
    });
}

export function useRevokeApiKey() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) =>
            apiUpdate<ApiKey>("/api/settings/api-keys", id, { revoked: true }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["api_key"] }),
    });
}

/** Available API scopes for key creation */
export const API_SCOPES = [
    "projects:read",
    "projects:write",
    "tasks:read",
    "tasks:write",
    "crew:read",
    "crew:write",
    "events:read",
    "events:write",
    "budgets:read",
    "invoices:read",
    "vendors:read",
    "assets:read",
    "assets:write",
    "reports:read",
] as const;
