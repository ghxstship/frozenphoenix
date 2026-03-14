"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiCreate, apiDelete, apiFetch, apiGet, apiList, apiUpdate } from "@/lib/api/client";
import type { Tables } from "./database.types";

// ─── Join-aware return types (preserved for consumers) ───
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

// ─── Generic helpers ───
type FilterParams = Record<string, string | number | boolean | undefined>;

function makeListHook<T>(key: string, basePath: string, defaultParams?: FilterParams) {
    return function useEntityList(filters?: FilterParams) {
        const merged = { ...defaultParams, ...filters };
        return useQuery({
            queryKey: [key, merged],
            queryFn: () => apiList<T>(basePath, merged).then((r) => r.data),
        });
    };
}

function makeDetailHook<T>(key: string, basePath: string) {
    return function useEntityDetail(id?: string) {
        return useQuery({
            queryKey: [key, "detail", id],
            queryFn: () => apiGet<T>(basePath, id!),
            enabled: !!id,
        });
    };
}

function makeCreateHook<T>(key: string, basePath: string, extraKeys?: string[]) {
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

function makeUpdateHook<T>(key: string, basePath: string, extraKeys?: string[]) {
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

function makeDeleteHook(key: string, basePath: string, extraKeys?: string[]) {
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

// ═══════════════════════════════════════════════════════════════
// CREDIT NOTES
// ═══════════════════════════════════════════════════════════════

export function useCreditNotes(invoiceId?: string) {
    return useQuery({
        queryKey: ["credit_note", invoiceId],
        queryFn: () =>
            apiList<CreditNoteWithJoins>("/api/credit-notes", {
                client_invoice_id: invoiceId,
                sort_by: "created_at",
                sort_order: "desc",
            }).then((r) => r.data),
    });
}

export const useCreateCreditNote = makeCreateHook<Tables<"credit_notes">>(
    "credit_note",
    "/api/credit-notes",
    ["client_invoices"]
);
export const useUpdateCreditNote = makeUpdateHook<Tables<"credit_notes">>(
    "credit_note",
    "/api/credit-notes"
);

// ═══════════════════════════════════════════════════════════════
// CONSUMABLES
// ═══════════════════════════════════════════════════════════════

export function useConsumables(projectId?: string) {
    return useQuery({
        queryKey: ["consumable", projectId],
        queryFn: () =>
            apiList<ConsumableWithJoins>("/api/consumables", {
                project_id: projectId,
                sort_by: "name",
                sort_order: "asc",
            }).then((r) => r.data),
    });
}

export const useCreateConsumable = makeCreateHook<Tables<"consumables">>(
    "consumable",
    "/api/consumables"
);
export const useUpdateConsumable = makeUpdateHook<Tables<"consumables">>(
    "consumable",
    "/api/consumables"
);

// ─── Consumable Usage ───

export function useConsumableUsage(consumableId: string) {
    return useQuery({
        queryKey: ["consumable_usage", consumableId],
        queryFn: () =>
            apiList<ConsumableUsageWithJoins>("/api/consumable-usage", {
                consumable_id: consumableId,
            }).then((r) => r.data),
        enabled: !!consumableId,
    });
}

export function useCreateConsumableUsage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: Record<string, unknown>) =>
            apiCreate<Tables<"consumable_usage">>("/api/consumable-usage", payload),
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({
                queryKey: ["consumable_usage", variables.consumable_id as string],
            });
            qc.invalidateQueries({ queryKey: ["consumable"] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// MAINTENANCE RECORDS
// ═══════════════════════════════════════════════════════════════

export function useMaintenanceRecords(assetId?: string) {
    return useQuery({
        queryKey: ["maintenance_record", assetId],
        queryFn: () =>
            apiList<MaintenanceRecordWithAsset>("/api/maintenance-records", {
                asset_id: assetId,
                sort_by: "scheduled_date",
                sort_order: "desc",
            }).then((r) => r.data),
    });
}

export const useCreateMaintenanceRecord = makeCreateHook<Tables<"maintenance_records">>(
    "maintenance_record",
    "/api/maintenance-records",
    ["assets"]
);
export const useUpdateMaintenanceRecord = makeUpdateHook<Tables<"maintenance_records">>(
    "maintenance_record",
    "/api/maintenance-records"
);

// ═══════════════════════════════════════════════════════════════
// PAYROLL BATCHES
// ═══════════════════════════════════════════════════════════════

export function usePayrollBatches(status?: string) {
    return useQuery({
        queryKey: ["payroll_batch", status],
        queryFn: () =>
            apiList<PayrollBatchWithProfile>("/api/payroll-batches", {
                status,
                sort_by: "pay_period_start",
                sort_order: "desc",
            }).then((r) => r.data),
    });
}

export const useCreatePayrollBatch = makeCreateHook<Tables<"payroll_batches">>(
    "payroll_batch",
    "/api/payroll-batches"
);
export const useUpdatePayrollBatch = makeUpdateHook<Tables<"payroll_batches">>(
    "payroll_batch",
    "/api/payroll-batches"
);

// ═══════════════════════════════════════════════════════════════
// PRODUCTION EXPENSES
// ═══════════════════════════════════════════════════════════════

export function useProductionExpenses(projectId?: string, department?: string) {
    return useQuery({
        queryKey: ["production_expense", projectId, department],
        queryFn: () =>
            apiList<ProductionExpenseWithJoins>("/api/production-expenses", {
                project_id: projectId,
                department,
                sort_by: "expense_date",
                sort_order: "desc",
            }).then((r) => r.data),
    });
}

export const useCreateProductionExpense = makeCreateHook<Tables<"production_expenses">>(
    "production_expense",
    "/api/production-expenses"
);
export const useUpdateProductionExpense = makeUpdateHook<Tables<"production_expenses">>(
    "production_expense",
    "/api/production-expenses"
);

// ═══════════════════════════════════════════════════════════════
// PRODUCTION TIME ENTRIES
// ═══════════════════════════════════════════════════════════════

export function useProductionTimeEntries(projectId?: string, userId?: string) {
    return useQuery({
        queryKey: ["production_time_entry", projectId, userId],
        queryFn: () =>
            apiList<ProductionTimeEntryWithJoins>("/api/production-time-entries", {
                project_id: projectId,
                user_id: userId,
                sort_by: "date",
                sort_order: "desc",
            }).then((r) => r.data),
    });
}

export const useCreateProductionTimeEntry = makeCreateHook<Tables<"production_time_entries">>(
    "production_time_entry",
    "/api/production-time-entries"
);
export const useUpdateProductionTimeEntry = makeUpdateHook<Tables<"production_time_entries">>(
    "production_time_entry",
    "/api/production-time-entries"
);

// ═══════════════════════════════════════════════════════════════
// PROJECT ASSIGNMENTS
// ═══════════════════════════════════════════════════════════════

export function useProjectAssignments(projectId?: string, crewMemberId?: string) {
    return useQuery({
        queryKey: ["project_assignment", projectId, crewMemberId],
        queryFn: () =>
            apiList<ProjectAssignmentWithJoins>("/api/project-assignments", {
                project_id: projectId,
                crew_member_id: crewMemberId,
                sort_by: "start_date",
                sort_order: "desc",
            }).then((r) => r.data),
    });
}

export const useCreateProjectAssignment = makeCreateHook<Tables<"project_assignments">>(
    "project_assignment",
    "/api/project-assignments",
    ["crew_members"]
);
export const useUpdateProjectAssignment = makeUpdateHook<Tables<"project_assignments">>(
    "project_assignment",
    "/api/project-assignments"
);
export const useDeleteProjectAssignment = makeDeleteHook(
    "project_assignment",
    "/api/project-assignments"
);

// ═══════════════════════════════════════════════════════════════
// SCHEDULE ENTRIES
// ═══════════════════════════════════════════════════════════════

export function useScheduleEntries(projectId?: string, startDate?: string, endDate?: string) {
    return useQuery({
        queryKey: ["schedule_entry", projectId, startDate, endDate],
        queryFn: () =>
            apiList<ScheduleEntryWithJoins>("/api/schedule-entries", {
                project_id: projectId,
                start_datetime: startDate,
                end_datetime: endDate,
                sort_by: "start_datetime",
                sort_order: "asc",
            }).then((r) => r.data),
    });
}

export const useCreateScheduleEntry = makeCreateHook<Tables<"schedule_entries">>(
    "schedule_entry",
    "/api/schedule-entries"
);
export const useUpdateScheduleEntry = makeUpdateHook<Tables<"schedule_entries">>(
    "schedule_entry",
    "/api/schedule-entries"
);
export const useDeleteScheduleEntry = makeDeleteHook("schedule_entry", "/api/schedule-entries");

// ═══════════════════════════════════════════════════════════════
// REPORT DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export const useReportDefinitions = makeListHook<ReportDefinitionWithProfile>(
    "report_definition",
    "/api/report-definitions",
    { sort_by: "name", sort_order: "asc" }
);
export const useCreateReportDefinition = makeCreateHook<Tables<"report_definitions">>(
    "report_definition",
    "/api/report-definitions"
);
export const useUpdateReportDefinition = makeUpdateHook<Tables<"report_definitions">>(
    "report_definition",
    "/api/report-definitions"
);

// ═══════════════════════════════════════════════════════════════
// DOCUMENT TEMPLATES
// ═══════════════════════════════════════════════════════════════

export const useDocumentTemplate = makeDetailHook<DocumentTemplateRow>(
    "document_template",
    "/api/templates"
);

export function useDocumentTemplates(category?: string) {
    return useQuery({
        queryKey: ["document_template", category],
        queryFn: () =>
            apiList<DocumentTemplateRow>("/api/templates", {
                category,
                sort_by: "name",
                sort_order: "asc",
            }).then((r) => r.data),
    });
}

export const useCreateDocumentTemplate = makeCreateHook<DocumentTemplateRow>(
    "document_template",
    "/api/templates"
);
export const useUpdateDocumentTemplate = makeUpdateHook<DocumentTemplateRow>(
    "document_template",
    "/api/templates"
);

// ═══════════════════════════════════════════════════════════════
// INVOICE TEMPLATES
// ═══════════════════════════════════════════════════════════════

export const useInvoiceTemplates = makeListHook<InvoiceTemplateRow>(
    "invoice_template",
    "/api/invoice-templates",
    { sort_by: "name", sort_order: "asc" }
);
export const useCreateInvoiceTemplate = makeCreateHook<InvoiceTemplateRow>(
    "invoice_template",
    "/api/invoice-templates"
);
export const useUpdateInvoiceTemplate = makeUpdateHook<InvoiceTemplateRow>(
    "invoice_template",
    "/api/invoice-templates"
);

// ═══════════════════════════════════════════════════════════════
// LOST REASONS
// ═══════════════════════════════════════════════════════════════

export const useLostReasons = makeListHook<LostReasonRow>("lost_reason", "/api/lost-reasons", {
    sort_by: "name",
    sort_order: "asc",
});
export const useCreateLostReason = makeCreateHook<LostReasonRow>(
    "lost_reason",
    "/api/lost-reasons"
);

// ═══════════════════════════════════════════════════════════════
// ORGANIZATIONS
// ═══════════════════════════════════════════════════════════════

export function useOrganizations() {
    return useQuery({
        queryKey: ["organization"],
        queryFn: () =>
            apiList<OrganizationRow>("/api/organizations", {
                sort_by: "name",
                sort_order: "asc",
            }).then((r) => r.data),
    });
}

export function useOrganization(id: string) {
    return useQuery({
        queryKey: ["organization", id],
        queryFn: () => apiGet<OrganizationRow>("/api/organizations", id),
        enabled: !!id,
    });
}

export function useUpdateOrganization() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...payload }: { id: string } & Record<string, unknown>) =>
            apiUpdate<OrganizationRow>("/api/organizations", id, payload),
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: ["organization"] });
            qc.invalidateQueries({ queryKey: ["organization", variables.id] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// ACTIVITIES (event-based activities)
// ═══════════════════════════════════════════════════════════════

export function useActivities(eventId?: string, projectId?: string) {
    return useQuery({
        queryKey: ["activity", eventId, projectId],
        queryFn: () =>
            apiList<ActivityRow>("/api/activity-log", {
                event_id: eventId,
                project_id: projectId,
                sort_by: "start_time",
                sort_order: "asc",
            }).then((r) => r.data),
    });
}

export function useCreateActivity() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: Record<string, unknown>) =>
            apiCreate<ActivityRow>("/api/activity-log", payload),
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: ["activity", variables.event_id as string] });
            qc.invalidateQueries({
                queryKey: ["activity", undefined, variables.project_id as string],
            });
        },
    });
}

export function useUpdateActivity() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...payload }: { id: string } & Record<string, unknown>) =>
            apiUpdate<ActivityRow>("/api/activity-log", id, payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["activity"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// AUTOMATION LOGS (read-only audit trail)
// ═══════════════════════════════════════════════════════════════

export function useAutomationLogs(automationId?: string) {
    return useQuery({
        queryKey: ["automation_log", automationId],
        queryFn: () =>
            apiList<AutomationLogRow>("/api/automation-logs", {
                automation_id: automationId,
                sort_by: "executed_at",
                sort_order: "desc",
            }).then((r) => r.data),
    });
}

// ═══════════════════════════════════════════════════════════════
// STAKEHOLDER PROJECTS (junction table management)
// ═══════════════════════════════════════════════════════════════

export function useStakeholderProjects(stakeholderId?: string, projectId?: string) {
    return useQuery({
        queryKey: ["stakeholder_project", stakeholderId, projectId],
        queryFn: () =>
            apiList<StakeholderProjectRow>("/api/stakeholder-projects", {
                stakeholder_id: stakeholderId,
                project_id: projectId,
            }).then((r) => r.data),
    });
}

export const useCreateStakeholderProject = makeCreateHook<StakeholderProjectRow>(
    "stakeholder_project",
    "/api/stakeholder-projects",
    ["stakeholders"]
);
export const useDeleteStakeholderProject = makeDeleteHook(
    "stakeholder_project",
    "/api/stakeholder-projects",
    ["stakeholders"]
);

// ═══════════════════════════════════════════════════════════════
// SOW DELIVERABLE SUMMARY VIEW
// ═══════════════════════════════════════════════════════════════

export function useSOWDeliverableSummary(sowId?: string) {
    const params = sowId ? `?sow_id=${sowId}` : "";
    return useQuery({
        queryKey: ["v_sow_deliverable_summary", sowId],
        queryFn: () =>
            apiFetch<{ data: Record<string, unknown>[] }>(
                `/api/v-sow-deliverable-summary${params}`
            ).then((r) => r.data),
    });
}

// ═══════════════════════════════════════════════════════════════
// CLIENT INVOICE AGING VIEW
// ═══════════════════════════════════════════════════════════════

export function useClientInvoiceAging() {
    return useQuery({
        queryKey: ["v_client_invoice_aging"],
        queryFn: () =>
            apiFetch<{ data: Record<string, unknown>[] }>("/api/v-client-invoice-aging").then(
                (r) => r.data
            ),
    });
}
