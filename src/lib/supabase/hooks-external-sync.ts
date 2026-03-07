"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase, isSupabaseConfigured } from "./client";
import type {
    CreateProviderConnectionRequest,
    CreateSyncConflictPolicyRequest,
    PosTransactionFilters,
    ProviderConnectionFilters,
    SyncLogFilters,
    UpdateProviderConnectionRequest,
} from "@/types";

// ═══════════════════════════════════════════════════════════════
// PROVIDER CONNECTIONS
// ═══════════════════════════════════════════════════════════════

export function useProviderConnections(filters?: ProviderConnectionFilters) {
    return useQuery({
        queryKey: ["provider_connections", filters],
        queryFn: async () => {
            let query = getSupabase()
                .from("provider_connections")
                .select("*")
                .order("created_at", { ascending: false });

            if (filters?.provider_type) {
                query = query.eq("provider_type", filters.provider_type);
            }
            if (filters?.event_id) {
                query = query.eq("event_id", filters.event_id);
            }
            if (filters?.is_active !== undefined) {
                query = query.eq("is_active", filters.is_active);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
        enabled: isSupabaseConfigured,
    });
}

export function useProviderConnection(id: string) {
    return useQuery({
        queryKey: ["provider_connections", id],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("provider_connections")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: isSupabaseConfigured && !!id,
    });
}

export function useCreateProviderConnection() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: CreateProviderConnectionRequest) => {
            const { data, error } = await getSupabase()
                .from("provider_connections")
                .insert(payload)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["provider_connections"] });
        },
    });
}

export function useUpdateProviderConnection() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            ...payload
        }: UpdateProviderConnectionRequest & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("provider_connections")
                .update(payload)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: ["provider_connections"] });
            qc.invalidateQueries({ queryKey: ["provider_connections", vars.id] });
        },
    });
}

export function useDeleteProviderConnection() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await getSupabase()
                .from("provider_connections")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["provider_connections"] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// PROVIDER TICKET MAP
// ═══════════════════════════════════════════════════════════════

export function useProviderTicketMap(connectionId?: string) {
    return useQuery({
        queryKey: ["provider_ticket_map", connectionId],
        queryFn: async () => {
            let query = getSupabase()
                .from("provider_ticket_map")
                .select("*, credential_assignments:assignment_id(id, assignee_name, status, barcode_value)")
                .order("last_synced_at", { ascending: false });

            if (connectionId) {
                query = query.eq("connection_id", connectionId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
        enabled: isSupabaseConfigured,
    });
}

// ═══════════════════════════════════════════════════════════════
// POS TRANSACTIONS
// ═══════════════════════════════════════════════════════════════

export function usePosTransactions(filters?: PosTransactionFilters) {
    return useQuery({
        queryKey: ["pos_transactions", filters],
        queryFn: async () => {
            let query = getSupabase()
                .from("pos_transactions")
                .select("*")
                .order(filters?.sort_by ?? "transaction_at", {
                    ascending: filters?.sort_order === "asc",
                });

            if (filters?.connection_id) {
                query = query.eq("connection_id", filters.connection_id);
            }
            if (filters?.event_id) {
                query = query.eq("event_id", filters.event_id);
            }
            if (filters?.foh_zone_id) {
                query = query.eq("foh_zone_id", filters.foh_zone_id);
            }
            if (filters?.category) {
                query = query.eq("category", filters.category);
            }
            if (filters?.payment_method) {
                query = query.eq("payment_method", filters.payment_method);
            }
            if (filters?.date_from) {
                query = query.gte("transaction_at", filters.date_from);
            }
            if (filters?.date_to) {
                query = query.lte("transaction_at", filters.date_to);
            }
            if (filters?.is_refund !== undefined) {
                query = query.eq("is_refund", filters.is_refund);
            }

            if (filters?.page && filters?.per_page) {
                const from = (filters.page - 1) * filters.per_page;
                const to = from + filters.per_page - 1;
                query = query.range(from, to);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
        enabled: isSupabaseConfigured,
    });
}

export function usePosTransaction(id: string) {
    return useQuery({
        queryKey: ["pos_transactions", id],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("pos_transactions")
                .select("*, pos_transaction_items(*)")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: isSupabaseConfigured && !!id,
    });
}

// ═══════════════════════════════════════════════════════════════
// WEBHOOK EVENTS
// ═══════════════════════════════════════════════════════════════

export function useWebhookEvents(connectionId?: string) {
    return useQuery({
        queryKey: ["webhook_events", connectionId],
        queryFn: async () => {
            let query = getSupabase()
                .from("webhook_events")
                .select("*")
                .order("received_at", { ascending: false })
                .limit(100);

            if (connectionId) {
                query = query.eq("connection_id", connectionId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
        enabled: isSupabaseConfigured,
    });
}

// ═══════════════════════════════════════════════════════════════
// SYNC EVENTS (LOG)
// ═══════════════════════════════════════════════════════════════

export function useSyncEvents(filters?: SyncLogFilters) {
    return useQuery({
        queryKey: ["sync_events", filters],
        queryFn: async () => {
            let query = getSupabase()
                .from("sync_events")
                .select("*, provider_connections:connection_id(id, display_name, provider_type)")
                .order(filters?.sort_by ?? "created_at", {
                    ascending: filters?.sort_order === "asc",
                });

            if (filters?.connection_id) {
                query = query.eq("connection_id", filters.connection_id);
            }
            if (filters?.direction) {
                query = query.eq("direction", filters.direction);
            }
            if (filters?.status) {
                query = query.eq("status", filters.status);
            }
            if (filters?.entity_type) {
                query = query.eq("entity_type", filters.entity_type);
            }
            if (filters?.date_from) {
                query = query.gte("created_at", filters.date_from);
            }
            if (filters?.date_to) {
                query = query.lte("created_at", filters.date_to);
            }

            if (filters?.page && filters?.per_page) {
                const from = (filters.page - 1) * filters.per_page;
                const to = from + filters.per_page - 1;
                query = query.range(from, to);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
        enabled: isSupabaseConfigured,
    });
}

// ═══════════════════════════════════════════════════════════════
// SYNC CONFLICT POLICIES
// ═══════════════════════════════════════════════════════════════

export function useSyncConflictPolicies(connectionId?: string) {
    return useQuery({
        queryKey: ["sync_conflict_policies", connectionId],
        queryFn: async () => {
            let query = getSupabase()
                .from("sync_conflict_policies")
                .select("*")
                .order("entity_type", { ascending: true });

            if (connectionId) {
                query = query.eq("connection_id", connectionId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
        enabled: isSupabaseConfigured,
    });
}

export function useCreateSyncConflictPolicy() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: CreateSyncConflictPolicyRequest) => {
            const { data, error } = await getSupabase()
                .from("sync_conflict_policies")
                .insert(payload)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["sync_conflict_policies"] });
        },
    });
}

export function useUpdateSyncConflictPolicy() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            ...payload
        }: Partial<CreateSyncConflictPolicyRequest> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("sync_conflict_policies")
                .update(payload)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["sync_conflict_policies"] });
        },
    });
}
