"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { filterValue, getSupabase } from "./client";
import type { Tables, TablesInsert, TablesUpdate } from "./database.types";

// ─── Join-aware return types ───
type WithJoin<T, J extends Record<string, unknown>> = T & J;

type ProfileName = { user_profiles: { display_name: string } | null };
type ProjectName = { projects: { name: string } | null };
type CompanyName = { companies: { name: string } | null };
type ContactName = { contacts: { full_name: string } | null };

export type SOWWithJoins = WithJoin<
    Tables<"scopes_of_work">,
    ProjectName & { proposals: { title: string } | null; contracts: { title: string } | null }
>;
export type SOWDeliverableWithJoins = WithJoin<
    Tables<"sow_deliverables">,
    { production_milestones: { title: string } | null }
>;
export type ClientInvoiceWithJoins = WithJoin<
    Tables<"client_invoices">,
    ProjectName &
        CompanyName &
        ContactName & { scopes_of_work: { title: string; number: string } | null }
>;
export type InvoiceLineItemWithDeliverable = WithJoin<
    Tables<"invoice_line_items">,
    { sow_deliverables: { name: string; deliverable_type: string } | null }
>;
export type InvoiceTimeEntryRow = Tables<"invoice_time_entries">;
export type SOWChangeLogWithProfile = WithJoin<Tables<"sow_change_log">, ProfileName>;
export type DeliverableProgressSnapshotRow = Tables<"deliverable_progress_snapshots">;

// ═══════════════════════════════════════════════════════════════════════════
// SCOPES OF WORK
// ═══════════════════════════════════════════════════════════════════════════

export function useScopesOfWork(projectId?: string) {
    return useQuery({
        queryKey: ["scopes_of_work", projectId],
        queryFn: async () => {
            let query = getSupabase()
                .from("scopes_of_work")
                .select("*, projects(name), proposals(title), contracts(title)")
                .order("created_at", { ascending: false });
            if (projectId) query = query.eq("project_id", projectId);
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as SOWWithJoins[];
        },
    });
}

export function useScopeOfWork(id: string) {
    return useQuery({
        queryKey: ["scopes_of_work", id],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("scopes_of_work")
                .select("*, projects(name), proposals(title), contracts(title)")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data as unknown as SOWWithJoins;
        },
        enabled: !!id,
    });
}

export function useCreateScopeOfWork() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (sow: TablesInsert<"scopes_of_work">) => {
            const { data, error } = await getSupabase()
                .from("scopes_of_work")
                .insert(sow)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"scopes_of_work">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["scopes_of_work"] }),
    });
}

export function useUpdateScopeOfWork() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"scopes_of_work"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("scopes_of_work")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"scopes_of_work">;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["scopes_of_work"] });
            queryClient.invalidateQueries({ queryKey: ["scopes_of_work", variables.id] });
        },
    });
}

export function useDeleteScopeOfWork() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await getSupabase().from("scopes_of_work").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["scopes_of_work"] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// SOW DELIVERABLES
// ═══════════════════════════════════════════════════════════════════════════

export function useSOWDeliverables(sowId: string) {
    return useQuery({
        queryKey: ["sow_deliverables", sowId],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("sow_deliverables")
                .select("*, production_milestones(title)")
                .eq("sow_id", sowId)
                .order("line_number");
            if (error) throw error;
            return data as unknown as SOWDeliverableWithJoins[];
        },
        enabled: !!sowId,
    });
}

export function useSOWDeliverable(id: string) {
    return useQuery({
        queryKey: ["sow_deliverables", "detail", id],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("sow_deliverables")
                .select("*, production_milestones(title)")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data as unknown as SOWDeliverableWithJoins;
        },
        enabled: !!id,
    });
}

export function useCreateSOWDeliverable() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (deliverable: TablesInsert<"sow_deliverables">) => {
            const { data, error } = await getSupabase()
                .from("sow_deliverables")
                .insert(deliverable)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"sow_deliverables">;
        },
        onSuccess: (data) => {
            const row = data as Tables<"sow_deliverables">;
            queryClient.invalidateQueries({ queryKey: ["sow_deliverables", row.sow_id] });
            queryClient.invalidateQueries({ queryKey: ["scopes_of_work"] });
        },
    });
}

export function useUpdateSOWDeliverable() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            ...updates
        }: TablesUpdate<"sow_deliverables"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("sow_deliverables")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"sow_deliverables">;
        },
        onSuccess: (data) => {
            const row = data as Tables<"sow_deliverables">;
            queryClient.invalidateQueries({ queryKey: ["sow_deliverables", row.sow_id] });
            queryClient.invalidateQueries({ queryKey: ["sow_deliverables", "detail", row.id] });
            queryClient.invalidateQueries({ queryKey: ["scopes_of_work"] });
        },
    });
}

export function useDeleteSOWDeliverable() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, sowId }: { id: string; sowId: string }) => {
            const { error } = await getSupabase().from("sow_deliverables").delete().eq("id", id);
            if (error) throw error;
            return { id, sowId };
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["sow_deliverables", variables.sowId] });
            queryClient.invalidateQueries({ queryKey: ["scopes_of_work"] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// CLIENT INVOICES
// ═══════════════════════════════════════════════════════════════════════════

export function useClientInvoices(projectId?: string, status?: string) {
    return useQuery({
        queryKey: ["client_invoices", projectId, status],
        queryFn: async () => {
            let query = getSupabase()
                .from("client_invoices")
                .select(
                    "*, projects(name), companies(name), contacts(full_name), scopes_of_work(title, number)"
                )
                .order("created_at", { ascending: false });
            if (projectId) query = query.eq("project_id", projectId);
            if (status && status !== "all") query = query.eq("status", filterValue(status));
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as ClientInvoiceWithJoins[];
        },
    });
}

export function useClientInvoice(id: string) {
    return useQuery({
        queryKey: ["client_invoices", id],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("client_invoices")
                .select(
                    "*, projects(name), companies(name), contacts(full_name), scopes_of_work(title, number)"
                )
                .eq("id", id)
                .single();
            if (error) throw error;
            return data as unknown as ClientInvoiceWithJoins;
        },
        enabled: !!id,
    });
}

export function useCreateClientInvoice() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (invoice: TablesInsert<"client_invoices">) => {
            const { data, error } = await getSupabase()
                .from("client_invoices")
                .insert(invoice)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"client_invoices">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["client_invoices"] }),
    });
}

export function useUpdateClientInvoice() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            ...updates
        }: TablesUpdate<"client_invoices"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("client_invoices")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"client_invoices">;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["client_invoices"] });
            queryClient.invalidateQueries({ queryKey: ["client_invoices", variables.id] });
        },
    });
}

export function useDeleteClientInvoice() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await getSupabase()
                .from("client_invoices")
                .update({ deleted_at: new Date().toISOString() })
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["client_invoices"] }),
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// INVOICE LINE ITEMS
// ═══════════════════════════════════════════════════════════════════════════

export function useInvoiceLineItems(invoiceId: string) {
    return useQuery({
        queryKey: ["invoice_line_items", invoiceId],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("invoice_line_items")
                .select("*, sow_deliverables(name, deliverable_type)")
                .eq("client_invoice_id", invoiceId)
                .order("line_number");
            if (error) throw error;
            return data as unknown as InvoiceLineItemWithDeliverable[];
        },
        enabled: !!invoiceId,
    });
}

export function useCreateInvoiceLineItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (item: TablesInsert<"invoice_line_items">) => {
            const { data, error } = await getSupabase()
                .from("invoice_line_items")
                .insert(item)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"invoice_line_items">;
        },
        onSuccess: (data) => {
            const row = data as Tables<"invoice_line_items">;
            queryClient.invalidateQueries({
                queryKey: ["invoice_line_items", row.client_invoice_id],
            });
            queryClient.invalidateQueries({ queryKey: ["client_invoices"] });
        },
    });
}

export function useUpdateInvoiceLineItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            ...updates
        }: TablesUpdate<"invoice_line_items"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("invoice_line_items")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"invoice_line_items">;
        },
        onSuccess: (data) => {
            const row = data as Tables<"invoice_line_items">;
            queryClient.invalidateQueries({
                queryKey: ["invoice_line_items", row.client_invoice_id],
            });
            queryClient.invalidateQueries({ queryKey: ["client_invoices"] });
        },
    });
}

export function useDeleteInvoiceLineItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, invoiceId }: { id: string; invoiceId: string }) => {
            const { error } = await getSupabase().from("invoice_line_items").delete().eq("id", id);
            if (error) throw error;
            return { id, invoiceId };
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["invoice_line_items", variables.invoiceId],
            });
            queryClient.invalidateQueries({ queryKey: ["client_invoices"] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// INVOICE TIME ENTRIES (T&M billing junction)
// ═══════════════════════════════════════════════════════════════════════════

export function useInvoiceTimeEntries(lineItemId: string) {
    return useQuery({
        queryKey: ["invoice_time_entries", lineItemId],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("invoice_time_entries")
                .select("*")
                .eq("invoice_line_item_id", lineItemId);
            if (error) throw error;
            return data as unknown as InvoiceTimeEntryRow[];
        },
        enabled: !!lineItemId,
    });
}

export function useCreateInvoiceTimeEntry() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (entry: TablesInsert<"invoice_time_entries">) => {
            const { data, error } = await getSupabase()
                .from("invoice_time_entries")
                .insert(entry)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as InvoiceTimeEntryRow;
        },
        onSuccess: (data) => {
            const row = data as InvoiceTimeEntryRow;
            queryClient.invalidateQueries({
                queryKey: ["invoice_time_entries", row.invoice_line_item_id],
            });
        },
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// SOW CHANGE LOG (read-only audit trail)
// ═══════════════════════════════════════════════════════════════════════════

export function useSOWChangeLog(sowId: string) {
    return useQuery({
        queryKey: ["sow_change_log", sowId],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("sow_change_log")
                .select("*, user_profiles:changed_by(display_name)")
                .eq("sow_id", sowId)
                .order("changed_at", { ascending: false });
            if (error) throw error;
            return data as unknown as SOWChangeLogWithProfile[];
        },
        enabled: !!sowId,
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// DELIVERABLE PROGRESS SNAPSHOTS
// ═══════════════════════════════════════════════════════════════════════════

export function useDeliverableProgressSnapshots(deliverableId: string) {
    return useQuery({
        queryKey: ["deliverable_progress_snapshots", deliverableId],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("deliverable_progress_snapshots")
                .select("*")
                .eq("sow_deliverable_id", deliverableId)
                .order("snapshot_date", { ascending: false });
            if (error) throw error;
            return data as unknown as DeliverableProgressSnapshotRow[];
        },
        enabled: !!deliverableId,
    });
}

export function useCreateDeliverableProgressSnapshot() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (snapshot: TablesInsert<"deliverable_progress_snapshots">) => {
            const { data, error } = await getSupabase()
                .from("deliverable_progress_snapshots")
                .insert(snapshot)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as DeliverableProgressSnapshotRow;
        },
        onSuccess: (data) => {
            const row = data as DeliverableProgressSnapshotRow;
            queryClient.invalidateQueries({
                queryKey: ["deliverable_progress_snapshots", row.sow_deliverable_id],
            });
        },
    });
}
