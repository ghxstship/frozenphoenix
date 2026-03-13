"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "./client";
import type {
    AssignCredentialRequest,
    CreateCredentialPoolRequest,
    CreateCredentialTypeRequest,
    CredentialAssignmentFilters,
    CredentialPoolFilters,
} from "@/types";

// ═══════════════════════════════════════════════════════════════
// CREDENTIAL TYPES
// ═══════════════════════════════════════════════════════════════

export function useCredentialTypes(activeOnly = true) {
    return useQuery({
        queryKey: ["credential_types", { activeOnly }],
        queryFn: async () => {
            let query = getSupabase()
                .from("credential_types")
                .select("*")
                .order("tier_level", { ascending: true });

            if (activeOnly) {
                query = query.eq("is_active", true);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });
}

export function useCredentialType(id: string) {
    return useQuery({
        queryKey: ["credential_types", id],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("credential_types")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useCreateCredentialType() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: CreateCredentialTypeRequest) => {
            const { data, error } = await getSupabase()
                .from("credential_types")
                .insert(payload)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["credential_types"] });
        },
    });
}

export function useUpdateCredentialType() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            ...payload
        }: Partial<CreateCredentialTypeRequest> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("credential_types")
                .update(payload)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: ["credential_types"] });
            qc.invalidateQueries({ queryKey: ["credential_types", vars.id] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// CREDENTIAL INVENTORY POOLS
// ═══════════════════════════════════════════════════════════════

export function useCredentialPools(filters?: CredentialPoolFilters) {
    return useQuery({
        queryKey: ["credential_pools", filters],
        queryFn: async () => {
            let query = getSupabase()
                .from("credential_inventory_pools")
                .select(
                    "*, credential_types:credential_type_id(id, name, category, color_hex, format)"
                )
                .order("created_at", { ascending: false });

            if (filters?.event_id) {
                query = query.eq("event_id", filters.event_id);
            }
            if (filters?.credential_type_id) {
                query = query.eq("credential_type_id", filters.credential_type_id);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });
}

export function useCredentialPool(id: string) {
    return useQuery({
        queryKey: ["credential_pools", id],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("credential_inventory_pools")
                .select(
                    "*, credential_types:credential_type_id(id, name, category, color_hex, format)"
                )
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useCreateCredentialPool() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: CreateCredentialPoolRequest) => {
            const { data, error } = await getSupabase()
                .from("credential_inventory_pools")
                .insert(payload)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["credential_pools"] });
        },
    });
}

export function useUpdateCredentialPool() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            ...payload
        }: Partial<CreateCredentialPoolRequest> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("credential_inventory_pools")
                .update(payload)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: ["credential_pools"] });
            qc.invalidateQueries({ queryKey: ["credential_pools", vars.id] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// CREDENTIAL ASSIGNMENTS
// ═══════════════════════════════════════════════════════════════

export function useCredentialAssignments(filters?: CredentialAssignmentFilters) {
    return useQuery({
        queryKey: ["credential_assignments", filters],
        queryFn: async () => {
            let query = getSupabase()
                .from("credential_assignments")
                .select(
                    "*, credential_types:credential_type_id(id, name, category, color_hex, format)"
                )
                .order(filters?.sort_by ?? "created_at", {
                    ascending: filters?.sort_order === "asc",
                });

            if (filters?.pool_id) {
                query = query.eq("pool_id", filters.pool_id);
            }
            if (filters?.credential_type_id) {
                query = query.eq("credential_type_id", filters.credential_type_id);
            }
            if (filters?.status) {
                if (Array.isArray(filters.status)) {
                    query = query.in("status", filters.status);
                } else {
                    query = query.eq("status", filters.status);
                }
            }
            if (filters?.assignee_name) {
                query = query.ilike("assignee_name", `%${filters.assignee_name}%`);
            }
            if (filters?.zone_access) {
                query = query.contains("zone_access", [filters.zone_access]);
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
    });
}

export function useCredentialAssignment(id: string) {
    return useQuery({
        queryKey: ["credential_assignments", id],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("credential_assignments")
                .select(
                    "*, credential_types:credential_type_id(id, name, category, color_hex, format)"
                )
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useCreateCredentialAssignment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: AssignCredentialRequest) => {
            const { data, error } = await getSupabase()
                .from("credential_assignments")
                .insert({
                    ...payload,
                    barcode_value: crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase(),
                    status: "requested",
                })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["credential_assignments"] });
            qc.invalidateQueries({ queryKey: ["credential_pools"] });
        },
    });
}

export function useUpdateCredentialAssignment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...payload }: Record<string, unknown> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("credential_assignments")
                .update(payload)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: ["credential_assignments"] });
            qc.invalidateQueries({ queryKey: ["credential_assignments", vars.id] });
            qc.invalidateQueries({ queryKey: ["credential_pools"] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// CREDENTIAL SCAN LOG
// ═══════════════════════════════════════════════════════════════

export function useCredentialScanLogs(assignmentId?: string) {
    return useQuery({
        queryKey: ["credential_scan_log", assignmentId],
        queryFn: async () => {
            let query = getSupabase()
                .from("credential_scan_log")
                .select("*")
                .order("scanned_at", { ascending: false });

            if (assignmentId) {
                query = query.eq("assignment_id", assignmentId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateScanEntry() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: {
            assignment_id: string;
            scan_type: string;
            scan_result: string;
            zone_id?: string;
            device_id?: string;
            latitude?: number;
            longitude?: number;
            notes?: string;
        }) => {
            const { data, error } = await getSupabase()
                .from("credential_scan_log")
                .insert({ ...payload, scanned_at: new Date().toISOString() })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: ["credential_scan_log"] });
            qc.invalidateQueries({ queryKey: ["credential_scan_log", vars.assignment_id] });
            qc.invalidateQueries({ queryKey: ["credential_assignments"] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// GATE SCANNER — API-backed scan + recent history
// ═══════════════════════════════════════════════════════════════

export interface GateScanResult {
    result: string;
    assignment: Record<string, unknown> | null;
    credential_type: Record<string, unknown> | null;
    message: string;
    timestamp: string;
}

export function useGateScan() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: {
            barcode_value: string;
            scan_type: string;
            zone_id?: string;
            device_id?: string;
            notes?: string;
        }): Promise<GateScanResult> => {
            const res = await fetch("/api/credentials/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({ message: "Scan failed" }));
                throw new Error((err as Record<string, string>).message ?? "Scan failed");
            }
            const data = await res.json();
            return {
                ...(data as Omit<GateScanResult, "timestamp">),
                timestamp: new Date().toISOString(),
            };
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["credential_scan_log"] });
            qc.invalidateQueries({ queryKey: ["gate_scan_history"] });
            qc.invalidateQueries({ queryKey: ["credential_assignments"] });
        },
    });
}

export function useGateScanHistory(limit = 50) {
    return useQuery({
        queryKey: ["gate_scan_history", limit],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("credential_scan_log")
                .select("*, credential_assignments:assignment_id(barcode_value, assignee_name)")
                .order("scanned_at", { ascending: false })
                .limit(limit);
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// BULK IMPORT JOBS
// ═══════════════════════════════════════════════════════════════

export function useBulkImportJobs(entityType?: string) {
    return useQuery({
        queryKey: ["bulk_import_jobs", entityType],
        queryFn: async () => {
            let query = getSupabase()
                .from("bulk_import_jobs")
                .select("*")
                .order("created_at", { ascending: false });

            if (entityType) {
                query = query.eq("entity_type", entityType);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });
}

export function useBulkImportJob(id: string) {
    return useQuery({
        queryKey: ["bulk_import_jobs", id],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("bulk_import_jobs")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
        refetchInterval: (query) => {
            const status = (query.state.data as Record<string, unknown>)?.status;
            if (status === "processing" || status === "validating") return 3000;
            return false;
        },
    });
}

export function useCreateBulkImportJob() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: {
            entity_type: string;
            target_pool_id?: string;
            file_name: string;
            file_size_bytes?: number;
        }) => {
            const { data, error } = await getSupabase()
                .from("bulk_import_jobs")
                .insert(payload)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["bulk_import_jobs"] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// EXPORT TEMPLATES
// ═══════════════════════════════════════════════════════════════

export function useExportTemplates(entityType?: string) {
    return useQuery({
        queryKey: ["export_templates", entityType],
        queryFn: async () => {
            let query = getSupabase()
                .from("export_templates")
                .select("*")
                .order("name", { ascending: true });

            if (entityType) {
                query = query.eq("entity_type", entityType);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateExportTemplate() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: Record<string, unknown>) => {
            const { data, error } = await getSupabase()
                .from("export_templates")
                .insert(payload)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["export_templates"] });
        },
    });
}

export function useUpdateExportTemplate() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...payload }: Record<string, unknown> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("export_templates")
                .update(payload)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["export_templates"] });
        },
    });
}
