"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { filterValue, getSupabase } from "./client";
import type { Tables, TablesInsert, TablesUpdate } from "./database.types";

// ─── Join-aware return types ───
type WithJoin<T, J extends Record<string, unknown>> = T & J;

type ProfileName = { profiles: { name: string } | null };
type ProjectName = { projects: { name: string } | null };
type VendorName = { vendors: { name: string } | null };
type LocationName = { locations: { name: string } | null };
type AssetName = { assets: { name: string } | null };

export type CreditNoteWithJoins = WithJoin<
    Tables<"credit_notes">,
    { client_invoices: { number: string } | null }
>;
export type ConsumableWithJoins = WithJoin<Tables<"consumables">, ProjectName>;
export type ConsumableUsageWithJoins = WithJoin<
    Tables<"consumable_usage">,
    { consumables: { name: string } | null } & ProfileName
>;
export type MaintenanceRecordWithAsset = WithJoin<
    Tables<"maintenance_records">,
    AssetName & ProfileName
>;
export type PayrollBatchWithProfile = WithJoin<Tables<"payroll_batches">, ProfileName>;
export type ProductionExpenseWithJoins = WithJoin<
    Tables<"production_expenses">,
    ProjectName & VendorName & ProfileName & LocationName
>;
export type ProductionTimeEntryWithJoins = WithJoin<
    Tables<"production_time_entries">,
    ProfileName & ProjectName & { production_tasks: { title: string } | null }
>;
export type ProjectAssignmentWithJoins = WithJoin<
    Tables<"project_assignments">,
    { crew_members: { name: string } | null } & ProjectName
>;
export type ScheduleEntryWithJoins = WithJoin<
    Tables<"schedule_entries">,
    ProjectName & LocationName & ProfileName
>;
export type ReportDefinitionWithProfile = WithJoin<Tables<"report_definitions">, ProfileName>;
export type DocumentTemplateRow = Tables<"document_templates">;
export type InvoiceTemplateRow = Tables<"invoice_templates">;
export type LostReasonRow = Tables<"lost_reasons">;
export type OrganizationRow = Tables<"organizations">;
export type ActivityRow = Tables<"activities">;
export type AutomationLogRow = Tables<"automation_logs">;
export type StakeholderProjectRow = Tables<"stakeholder_projects">;

// ═══════════════════════════════════════════════════════════════
// CREDIT NOTES
// ═══════════════════════════════════════════════════════════════

export function useCreditNotes(invoiceId?: string) {
    return useQuery({
        queryKey: ["credit_notes", invoiceId],
        queryFn: async () => {
            let query = getSupabase()
                .from("credit_notes")
                .select("*, client_invoices(number)")
                .order("created_at", { ascending: false });
            if (invoiceId) query = query.eq("client_invoice_id", invoiceId);
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as CreditNoteWithJoins[];
        },
    });
}

export function useCreateCreditNote() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (note: TablesInsert<"credit_notes">) => {
            const { data, error } = await getSupabase()
                .from("credit_notes")
                .insert(note)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"credit_notes">;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["credit_notes"] });
            queryClient.invalidateQueries({ queryKey: ["client_invoices"] });
        },
    });
}

export function useUpdateCreditNote() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"credit_notes"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("credit_notes")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"credit_notes">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["credit_notes"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// CONSUMABLES
// ═══════════════════════════════════════════════════════════════

export function useConsumables(projectId?: string) {
    return useQuery({
        queryKey: ["consumables", projectId],
        queryFn: async () => {
            let query = getSupabase().from("consumables").select("*, projects(name)").order("name");
            if (projectId) query = query.eq("project_id", projectId);
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as ConsumableWithJoins[];
        },
    });
}

export function useCreateConsumable() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (consumable: TablesInsert<"consumables">) => {
            const { data, error } = await getSupabase()
                .from("consumables")
                .insert(consumable)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"consumables">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["consumables"] }),
    });
}

export function useUpdateConsumable() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"consumables"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("consumables")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"consumables">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["consumables"] }),
    });
}

// ─── Consumable Usage ───

export function useConsumableUsage(consumableId: string) {
    return useQuery({
        queryKey: ["consumable_usage", consumableId],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("consumable_usage")
                .select("*, consumables(name), profiles(name)")
                .eq("consumable_id", consumableId)
                .order("used_at", { ascending: false });
            if (error) throw error;
            return data as unknown as ConsumableUsageWithJoins[];
        },
        enabled: !!consumableId,
    });
}

export function useCreateConsumableUsage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (usage: TablesInsert<"consumable_usage">) => {
            const { data, error } = await getSupabase()
                .from("consumable_usage")
                .insert(usage)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"consumable_usage">;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["consumable_usage", variables.consumable_id],
            });
            queryClient.invalidateQueries({ queryKey: ["consumables"] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// MAINTENANCE RECORDS
// ═══════════════════════════════════════════════════════════════

export function useMaintenanceRecords(assetId?: string) {
    return useQuery({
        queryKey: ["maintenance_records", assetId],
        queryFn: async () => {
            let query = getSupabase()
                .from("maintenance_records")
                .select("*, assets(name), profiles(name)")
                .order("scheduled_date", { ascending: false });
            if (assetId) query = query.eq("asset_id", assetId);
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as MaintenanceRecordWithAsset[];
        },
    });
}

export function useCreateMaintenanceRecord() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (record: TablesInsert<"maintenance_records">) => {
            const { data, error } = await getSupabase()
                .from("maintenance_records")
                .insert(record)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"maintenance_records">;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["maintenance_records"] });
            queryClient.invalidateQueries({ queryKey: ["assets"] });
        },
    });
}

export function useUpdateMaintenanceRecord() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            ...updates
        }: TablesUpdate<"maintenance_records"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("maintenance_records")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"maintenance_records">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["maintenance_records"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// PAYROLL BATCHES
// ═══════════════════════════════════════════════════════════════

export function usePayrollBatches(status?: string) {
    return useQuery({
        queryKey: ["payroll_batches", status],
        queryFn: async () => {
            let query = getSupabase()
                .from("payroll_batches")
                .select("*, profiles(name)")
                .order("pay_period_start", { ascending: false });
            if (status) query = query.eq("status", filterValue(status));
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as PayrollBatchWithProfile[];
        },
    });
}

export function useCreatePayrollBatch() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (batch: TablesInsert<"payroll_batches">) => {
            const { data, error } = await getSupabase()
                .from("payroll_batches")
                .insert(batch)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"payroll_batches">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payroll_batches"] }),
    });
}

export function useUpdatePayrollBatch() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            ...updates
        }: TablesUpdate<"payroll_batches"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("payroll_batches")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"payroll_batches">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payroll_batches"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// PRODUCTION EXPENSES
// ═══════════════════════════════════════════════════════════════

export function useProductionExpenses(projectId?: string, department?: string) {
    return useQuery({
        queryKey: ["production_expenses", projectId, department],
        queryFn: async () => {
            let query = getSupabase()
                .from("production_expenses")
                .select("*, projects(name), vendors(name), profiles(name), locations(name)")
                .order("expense_date", { ascending: false });
            if (projectId) query = query.eq("project_id", projectId);
            if (department) query = query.eq("department", filterValue(department));
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as ProductionExpenseWithJoins[];
        },
    });
}

export function useCreateProductionExpense() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (expense: TablesInsert<"production_expenses">) => {
            const { data, error } = await getSupabase()
                .from("production_expenses")
                .insert(expense)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"production_expenses">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["production_expenses"] }),
    });
}

export function useUpdateProductionExpense() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            ...updates
        }: TablesUpdate<"production_expenses"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("production_expenses")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"production_expenses">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["production_expenses"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// PRODUCTION TIME ENTRIES
// ═══════════════════════════════════════════════════════════════

export function useProductionTimeEntries(projectId?: string, userId?: string) {
    return useQuery({
        queryKey: ["production_time_entries", projectId, userId],
        queryFn: async () => {
            let query = getSupabase()
                .from("production_time_entries")
                .select("*, profiles(name), projects(name), production_tasks(title)")
                .order("date", { ascending: false });
            if (projectId) query = query.eq("project_id", projectId);
            if (userId) query = query.eq("user_id", userId);
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as ProductionTimeEntryWithJoins[];
        },
    });
}

export function useCreateProductionTimeEntry() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (entry: TablesInsert<"production_time_entries">) => {
            const { data, error } = await getSupabase()
                .from("production_time_entries")
                .insert(entry)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"production_time_entries">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["production_time_entries"] }),
    });
}

export function useUpdateProductionTimeEntry() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            ...updates
        }: TablesUpdate<"production_time_entries"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("production_time_entries")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"production_time_entries">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["production_time_entries"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// PROJECT ASSIGNMENTS
// ═══════════════════════════════════════════════════════════════

export function useProjectAssignments(projectId?: string, crewMemberId?: string) {
    return useQuery({
        queryKey: ["project_assignments", projectId, crewMemberId],
        queryFn: async () => {
            let query = getSupabase()
                .from("project_assignments")
                .select("*, crew_members(name), projects(name)")
                .order("start_date", { ascending: false });
            if (projectId) query = query.eq("project_id", projectId);
            if (crewMemberId) query = query.eq("crew_member_id", crewMemberId);
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as ProjectAssignmentWithJoins[];
        },
    });
}

export function useCreateProjectAssignment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (assignment: TablesInsert<"project_assignments">) => {
            const { data, error } = await getSupabase()
                .from("project_assignments")
                .insert(assignment)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"project_assignments">;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project_assignments"] });
            queryClient.invalidateQueries({ queryKey: ["crew_members"] });
        },
    });
}

export function useUpdateProjectAssignment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            ...updates
        }: TablesUpdate<"project_assignments"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("project_assignments")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"project_assignments">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project_assignments"] }),
    });
}

export function useDeleteProjectAssignment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await getSupabase().from("project_assignments").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project_assignments"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// SCHEDULE ENTRIES
// ═══════════════════════════════════════════════════════════════

export function useScheduleEntries(projectId?: string, startDate?: string, endDate?: string) {
    return useQuery({
        queryKey: ["schedule_entries", projectId, startDate, endDate],
        queryFn: async () => {
            let query = getSupabase()
                .from("schedule_entries")
                .select("*, projects(name), locations(name), profiles(name)")
                .order("start_datetime");
            if (projectId) query = query.eq("project_id", projectId);
            if (startDate) query = query.gte("start_datetime", startDate);
            if (endDate) query = query.lte("end_datetime", endDate);
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as ScheduleEntryWithJoins[];
        },
    });
}

export function useCreateScheduleEntry() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (entry: TablesInsert<"schedule_entries">) => {
            const { data, error } = await getSupabase()
                .from("schedule_entries")
                .insert(entry)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"schedule_entries">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedule_entries"] }),
    });
}

export function useUpdateScheduleEntry() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            ...updates
        }: TablesUpdate<"schedule_entries"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("schedule_entries")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"schedule_entries">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedule_entries"] }),
    });
}

export function useDeleteScheduleEntry() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await getSupabase().from("schedule_entries").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedule_entries"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// REPORT DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export function useReportDefinitions() {
    return useQuery({
        queryKey: ["report_definitions"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("report_definitions")
                .select("*, profiles(name)")
                .order("name");
            if (error) throw error;
            return data as unknown as ReportDefinitionWithProfile[];
        },
    });
}

export function useCreateReportDefinition() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (report: TablesInsert<"report_definitions">) => {
            const { data, error } = await getSupabase()
                .from("report_definitions")
                .insert(report)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"report_definitions">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["report_definitions"] }),
    });
}

export function useUpdateReportDefinition() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            ...updates
        }: TablesUpdate<"report_definitions"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("report_definitions")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"report_definitions">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["report_definitions"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// DOCUMENT TEMPLATES
// ═══════════════════════════════════════════════════════════════

export function useDocumentTemplate(id?: string) {
    return useQuery({
        queryKey: ["document_templates", "detail", id],
        queryFn: async () => {
            if (!id) return null;
            const { data, error } = await getSupabase()
                .from("document_templates")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data as unknown as DocumentTemplateRow;
        },
        enabled: !!id,
    });
}

export function useDocumentTemplates(category?: string) {
    return useQuery({
        queryKey: ["document_templates", category],
        queryFn: async () => {
            let query = getSupabase().from("document_templates").select("*").order("name");
            if (category) query = query.eq("category", filterValue(category));
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as DocumentTemplateRow[];
        },
    });
}

export function useCreateDocumentTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (template: TablesInsert<"document_templates">) => {
            const { data, error } = await getSupabase()
                .from("document_templates")
                .insert(template)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as DocumentTemplateRow;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["document_templates"] }),
    });
}

export function useUpdateDocumentTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            ...updates
        }: TablesUpdate<"document_templates"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("document_templates")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as DocumentTemplateRow;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["document_templates"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// INVOICE TEMPLATES
// ═══════════════════════════════════════════════════════════════

export function useInvoiceTemplates() {
    return useQuery({
        queryKey: ["invoice_templates"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("invoice_templates")
                .select("*")
                .order("name");
            if (error) throw error;
            return data as unknown as InvoiceTemplateRow[];
        },
    });
}

export function useCreateInvoiceTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (template: TablesInsert<"invoice_templates">) => {
            const { data, error } = await getSupabase()
                .from("invoice_templates")
                .insert(template)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as InvoiceTemplateRow;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoice_templates"] }),
    });
}

export function useUpdateInvoiceTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            ...updates
        }: TablesUpdate<"invoice_templates"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("invoice_templates")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as InvoiceTemplateRow;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoice_templates"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// LOST REASONS
// ═══════════════════════════════════════════════════════════════

export function useLostReasons() {
    return useQuery({
        queryKey: ["lost_reasons"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("lost_reasons")
                .select("*")
                .order("name");
            if (error) throw error;
            return data as unknown as LostReasonRow[];
        },
    });
}

export function useCreateLostReason() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (reason: TablesInsert<"lost_reasons">) => {
            const { data, error } = await getSupabase()
                .from("lost_reasons")
                .insert(reason)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as LostReasonRow;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lost_reasons"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// ORGANIZATIONS
// ═══════════════════════════════════════════════════════════════

export function useOrganizations() {
    return useQuery({
        queryKey: ["organizations"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("organizations")
                .select("*")
                .order("name");
            if (error) throw error;
            return data as unknown as OrganizationRow[];
        },
    });
}

export function useOrganization(id: string) {
    return useQuery({
        queryKey: ["organizations", id],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("organizations")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data as unknown as OrganizationRow;
        },
        enabled: !!id,
    });
}

export function useUpdateOrganization() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"organizations"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("organizations")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as OrganizationRow;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["organizations"] });
            queryClient.invalidateQueries({ queryKey: ["organizations", variables.id] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// ACTIVITIES (event-based activities)
// ═══════════════════════════════════════════════════════════════

export function useActivities(eventId?: string, projectId?: string) {
    return useQuery({
        queryKey: ["activities", eventId, projectId],
        queryFn: async () => {
            let query = getSupabase()
                .from("activities")
                .select("*")
                .order("start_time", { ascending: true });
            if (eventId) query = query.eq("event_id", eventId);
            if (projectId) query = query.eq("project_id", projectId);
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as ActivityRow[];
        },
    });
}

export function useCreateActivity() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (activity: TablesInsert<"activities">) => {
            const { data, error } = await getSupabase()
                .from("activities")
                .insert(activity)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as ActivityRow;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["activities", variables.event_id] });
            queryClient.invalidateQueries({
                queryKey: ["activities", undefined, variables.project_id],
            });
        },
    });
}

export function useUpdateActivity() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"activities"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("activities")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as ActivityRow;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["activities"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// AUTOMATION LOGS (read-only audit trail)
// ═══════════════════════════════════════════════════════════════

export function useAutomationLogs(automationId?: string) {
    return useQuery({
        queryKey: ["automation_logs", automationId],
        queryFn: async () => {
            let query = getSupabase()
                .from("automation_logs")
                .select("*")
                .order("executed_at", { ascending: false });
            if (automationId) query = query.eq("automation_id", automationId);
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as AutomationLogRow[];
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// STAKEHOLDER PROJECTS (junction table management)
// ═══════════════════════════════════════════════════════════════

export function useStakeholderProjects(stakeholderId?: string, projectId?: string) {
    return useQuery({
        queryKey: ["stakeholder_projects", stakeholderId, projectId],
        queryFn: async () => {
            let query = getSupabase().from("stakeholder_projects").select("*");
            if (stakeholderId) query = query.eq("stakeholder_id", stakeholderId);
            if (projectId) query = query.eq("project_id", projectId);
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as StakeholderProjectRow[];
        },
    });
}

export function useCreateStakeholderProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (sp: TablesInsert<"stakeholder_projects">) => {
            const { data, error } = await getSupabase()
                .from("stakeholder_projects")
                .insert(sp)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as StakeholderProjectRow;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stakeholder_projects"] });
            queryClient.invalidateQueries({ queryKey: ["stakeholders"] });
        },
    });
}

export function useDeleteStakeholderProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await getSupabase()
                .from("stakeholder_projects")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stakeholder_projects"] });
            queryClient.invalidateQueries({ queryKey: ["stakeholders"] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// SOW DELIVERABLE SUMMARY VIEW
// ═══════════════════════════════════════════════════════════════

export function useSOWDeliverableSummary(sowId?: string) {
    return useQuery({
        queryKey: ["v_sow_deliverable_summary", sowId],
        queryFn: async () => {
            let query = getSupabase().from("v_sow_deliverable_summary").select("*");
            if (sowId) query = query.eq("sow_id", sowId);
            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// CLIENT INVOICE AGING VIEW
// ═══════════════════════════════════════════════════════════════

export function useClientInvoiceAging() {
    return useQuery({
        queryKey: ["v_client_invoice_aging"],
        queryFn: async () => {
            const { data, error } = await getSupabase().from("v_client_invoice_aging").select("*");
            if (error) throw error;
            return data;
        },
    });
}
