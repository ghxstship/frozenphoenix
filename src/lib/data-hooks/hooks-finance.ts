"use client";

/**
 * Finance entity hooks: invoices, client_invoices, recurring_invoices, payments,
 * credit_notes, payroll_batches, budget_approvals, budget_line_items, production_budget_lines,
 * gl_accounts, rate_cards, job_cost_entries, revenue_schedules, revenue_recognition,
 * depreciation_schedules, expense_reports, timesheets, purchase_orders.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiGet, apiList } from "@/lib/api/client";
import type { Tables } from "@/types/generated/database.types";
import {
    makeCreateHook,
    makeDeleteHook,
    makeDetailHook,
    makeListHook,
    makeUpdateHook,
} from "./hook-factories";

// ═══════════════════════════════════════════════════════════════
// INVOICES
// ═══════════════════════════════════════════════════════════════

export const useInvoices = makeListHook<Tables<"invoices">>("invoice", "/api/invoices", {
    sort_by: "created_at",
    sort_order: "desc",
});
export const useInvoice = makeDetailHook<Tables<"invoices">>("invoice", "/api/invoices");
export const useCreateInvoice = makeCreateHook<Tables<"invoices">>("invoice", "/api/invoices");
export const useUpdateInvoice = makeUpdateHook<Tables<"invoices">>("invoice", "/api/invoices");
export const useDeleteInvoice = makeDeleteHook("invoice", "/api/invoices");

// CLIENT INVOICES → canonical in hooks-sow.ts (join-aware)

// ═══════════════════════════════════════════════════════════════
// RECURRING INVOICES
// ═══════════════════════════════════════════════════════════════

export const useRecurringInvoices = makeListHook<Tables<"recurring_invoices">>(
    "recurring_invoice",
    "/api/recurring-invoices",
    { sort_by: "next_date", sort_order: "asc" }
);
export const useRecurringInvoice = makeDetailHook<Tables<"recurring_invoices">>(
    "recurring_invoice",
    "/api/recurring-invoices"
);
export const useCreateRecurringInvoice = makeCreateHook<Tables<"recurring_invoices">>(
    "recurring_invoice",
    "/api/recurring-invoices"
);
export const useUpdateRecurringInvoice = makeUpdateHook<Tables<"recurring_invoices">>(
    "recurring_invoice",
    "/api/recurring-invoices"
);
export const useDeleteRecurringInvoice = makeDeleteHook(
    "recurring_invoice",
    "/api/recurring-invoices"
);

// ═══════════════════════════════════════════════════════════════
// PAYMENTS
// ═══════════════════════════════════════════════════════════════

export const usePayments = makeListHook<Tables<"payments">>("payment", "/api/payments", {
    sort_by: "payment_date",
    sort_order: "desc",
});
export const usePayment = makeDetailHook<Tables<"payments">>("payment", "/api/payments");
export const useCreatePayment = makeCreateHook<Tables<"payments">>("payment", "/api/payments", [
    "invoice",
]);
export const useUpdatePayment = makeUpdateHook<Tables<"payments">>("payment", "/api/payments");
export const useDeletePayment = makeDeleteHook("payment", "/api/payments");

// ═══════════════════════════════════════════════════════════════
// CREDIT NOTES
// ═══════════════════════════════════════════════════════════════

export const useCreditNotes = makeListHook<Tables<"credit_notes">>(
    "credit_note",
    "/api/credit-notes",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useCreditNote = makeDetailHook<Tables<"credit_notes">>(
    "credit_note",
    "/api/credit-notes"
);
export const useCreateCreditNote = makeCreateHook<Tables<"credit_notes">>(
    "credit_note",
    "/api/credit-notes",
    ["client_invoice"]
);
export const useUpdateCreditNote = makeUpdateHook<Tables<"credit_notes">>(
    "credit_note",
    "/api/credit-notes"
);
export const useDeleteCreditNote = makeDeleteHook("credit_note", "/api/credit-notes");

// ═══════════════════════════════════════════════════════════════
// PURCHASE ORDERS
// ═══════════════════════════════════════════════════════════════

export const usePurchaseOrders = makeListHook<Tables<"purchase_orders">>(
    "purchase_order",
    "/api/purchase-orders",
    { sort_by: "created_at", sort_order: "desc" }
);
export const usePurchaseOrder = makeDetailHook<Tables<"purchase_orders">>(
    "purchase_order",
    "/api/purchase-orders"
);
export const useCreatePurchaseOrder = makeCreateHook<Tables<"purchase_orders">>(
    "purchase_order",
    "/api/purchase-orders"
);
export const useUpdatePurchaseOrder = makeUpdateHook<Tables<"purchase_orders">>(
    "purchase_order",
    "/api/purchase-orders"
);
export const useDeletePurchaseOrder = makeDeleteHook("purchase_order", "/api/purchase-orders");

// ═══════════════════════════════════════════════════════════════
// PAYROLL BATCHES
// ═══════════════════════════════════════════════════════════════

export const usePayrollBatches = makeListHook<Tables<"payroll_batches">>(
    "payroll_batch",
    "/api/payroll-batches",
    { sort_by: "pay_period_start", sort_order: "desc" }
);
export const usePayrollBatch = makeDetailHook<Tables<"payroll_batches">>(
    "payroll_batch",
    "/api/payroll-batches"
);
export const useCreatePayrollBatch = makeCreateHook<Tables<"payroll_batches">>(
    "payroll_batch",
    "/api/payroll-batches"
);
export const useUpdatePayrollBatch = makeUpdateHook<Tables<"payroll_batches">>(
    "payroll_batch",
    "/api/payroll-batches"
);
export const useDeletePayrollBatch = makeDeleteHook("payroll_batch", "/api/payroll-batches");

// ═══════════════════════════════════════════════════════════════
// BUDGET APPROVALS
// ═══════════════════════════════════════════════════════════════

export const useBudgetApprovals = makeListHook<Tables<"budget_approvals">>(
    "budget_approval",
    "/api/budget-approvals",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useBudgetApproval = makeDetailHook<Tables<"budget_approvals">>(
    "budget_approval",
    "/api/budget-approvals"
);
export const useCreateBudgetApproval = makeCreateHook<Tables<"budget_approvals">>(
    "budget_approval",
    "/api/budget-approvals"
);
export const useUpdateBudgetApproval = makeUpdateHook<Tables<"budget_approvals">>(
    "budget_approval",
    "/api/budget-approvals"
);

// ═══════════════════════════════════════════════════════════════
// BUDGET LINE ITEMS
// ═══════════════════════════════════════════════════════════════

export const useBudgetLineItems = makeListHook<Tables<"budget_line_items">>(
    "budget_line_item",
    "/api/budget-line-items",
    { sort_by: "category", sort_order: "asc" }
);
export const useBudgetLineItem = makeDetailHook<Tables<"budget_line_items">>(
    "budget_line_item",
    "/api/budget-line-items"
);
export const useCreateBudgetLineItem = makeCreateHook<Tables<"budget_line_items">>(
    "budget_line_item",
    "/api/budget-line-items",
    ["budget"]
);
export const useUpdateBudgetLineItem = makeUpdateHook<Tables<"budget_line_items">>(
    "budget_line_item",
    "/api/budget-line-items"
);
export const useDeleteBudgetLineItem = makeDeleteHook("budget_line_item", "/api/budget-line-items");

// ─── Budget Lines (production_budget_lines alias for detail pages) ───
export const useBudgetLines = makeListHook<Tables<"production_budget_lines">>(
    "production_budget_line",
    "/api/production-budget-lines",
    { sort_by: "sort_order", sort_order: "asc" }
);

// ═══════════════════════════════════════════════════════════════
// PRODUCTION BUDGET LINES
// ═══════════════════════════════════════════════════════════════

export const useProductionBudgetLines = makeListHook<Tables<"production_budget_lines">>(
    "production_budget_line",
    "/api/production-budget-lines",
    { sort_by: "sort_order", sort_order: "asc" }
);
export const useProductionBudgetLine = makeDetailHook<Tables<"production_budget_lines">>(
    "production_budget_line",
    "/api/production-budget-lines"
);
export const useCreateProductionBudgetLine = makeCreateHook<Tables<"production_budget_lines">>(
    "production_budget_line",
    "/api/production-budget-lines",
    ["budget"]
);
export const useUpdateProductionBudgetLine = makeUpdateHook<Tables<"production_budget_lines">>(
    "production_budget_line",
    "/api/production-budget-lines"
);
export const useDeleteProductionBudgetLine = makeDeleteHook(
    "production_budget_line",
    "/api/production-budget-lines"
);

// ═══════════════════════════════════════════════════════════════
// GL ACCOUNTS
// ═══════════════════════════════════════════════════════════════

export const useGlAccounts = makeListHook<Tables<"gl_accounts">>("gl_account", "/api/gl-accounts", {
    sort_by: "account_code",
    sort_order: "asc",
});
export const useGlAccount = makeDetailHook<Tables<"gl_accounts">>("gl_account", "/api/gl-accounts");
export const useCreateGlAccount = makeCreateHook<Tables<"gl_accounts">>(
    "gl_account",
    "/api/gl-accounts"
);
export const useUpdateGlAccount = makeUpdateHook<Tables<"gl_accounts">>(
    "gl_account",
    "/api/gl-accounts"
);

// ═══════════════════════════════════════════════════════════════
// RATE CARDS
// ═══════════════════════════════════════════════════════════════

export const useRateCards = makeListHook<Tables<"rate_cards">>("rate_card", "/api/rate-cards", {
    sort_by: "name",
    sort_order: "asc",
});
export const useRateCard = makeDetailHook<Tables<"rate_cards">>("rate_card", "/api/rate-cards");
export const useCreateRateCard = makeCreateHook<Tables<"rate_cards">>(
    "rate_card",
    "/api/rate-cards"
);
export const useUpdateRateCard = makeUpdateHook<Tables<"rate_cards">>(
    "rate_card",
    "/api/rate-cards"
);
export const useDeleteRateCard = makeDeleteHook("rate_card", "/api/rate-cards");

export const useCreateRateCardItem = makeCreateHook<Tables<"rate_card_items">>(
    "rate_card_item",
    "/api/rate-card-items",
    ["rate_card"]
);

export function useAllRateCardItems() {
    return useQuery({
        queryKey: ["rate_card_item"],
        queryFn: async () => {
            const res = await apiList<Tables<"rate_card_items">>("/api/rate-card-items", {
                sort_by: "service_name",
                sort_order: "asc",
            });
            return res.data;
        },
        // Performance: Rate card items are reference data — cache for 5 min
        staleTime: 5 * 60_000,
        gcTime: 10 * 60_000,
    });
}

export function useRateCardWithItems(id: string) {
    return useQuery({
        queryKey: ["rate_card", "detail", id, "items"],
        queryFn: () => apiGet<Tables<"rate_cards">>("/api/rate-cards", id),
        enabled: !!id,
    });
}

// ═══════════════════════════════════════════════════════════════
// JOB COST ENTRIES
// ═══════════════════════════════════════════════════════════════

export const useJobCostEntries = makeListHook<Tables<"job_cost_entries">>(
    "job_cost_entry",
    "/api/job-cost-entries",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useCreateJobCostEntry = makeCreateHook<Tables<"job_cost_entries">>(
    "job_cost_entry",
    "/api/job-cost-entries"
);

// ═══════════════════════════════════════════════════════════════
// REVENUE SCHEDULES
// ═══════════════════════════════════════════════════════════════

export const useRevenueSchedules = makeListHook<Tables<"revenue_schedules">>(
    "revenue_schedule",
    "/api/revenue-schedules",
    { sort_by: "period_start", sort_order: "desc" }
);

// ═══════════════════════════════════════════════════════════════
// REVENUE RECOGNITION ENTRIES
// ═══════════════════════════════════════════════════════════════

export const useRevenueRecognitionEntries = makeListHook<Tables<"revenue_recognition_entries">>(
    "revenue_recognition_entry",
    "/api/revenue-recognition-entries",
    { sort_by: "period_start", sort_order: "desc" }
);
export const useCreateRevenueRecognition = makeCreateHook<Tables<"revenue_recognition_entries">>(
    "revenue_recognition_entry",
    "/api/revenue-recognition-entries",
    ["revenue_recognition_summary"]
);

export function useRevenueRecognitionSummary() {
    return useQuery({
        queryKey: ["revenue_recognition_summary"],
        queryFn: async () => {
            const res = await apiList<Record<string, unknown>>("/api/revenue-recognition-summary", {
                sort_by: "project_name",
                sort_order: "asc",
            });
            return res.data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// DEPRECIATION SCHEDULES
// ═══════════════════════════════════════════════════════════════

export const useDepreciationSchedules = makeListHook<Tables<"depreciation_schedules">>(
    "depreciation_schedule",
    "/api/depreciation-schedules",
    { sort_by: "start_date", sort_order: "desc" }
);
export const useDepreciationSchedule = makeDetailHook<Tables<"depreciation_schedules">>(
    "depreciation_schedule",
    "/api/depreciation-schedules"
);
export const useCreateDepreciationSchedule = makeCreateHook<Tables<"depreciation_schedules">>(
    "depreciation_schedule",
    "/api/depreciation-schedules",
    ["asset"]
);
export const useUpdateDepreciationSchedule = makeUpdateHook<Tables<"depreciation_schedules">>(
    "depreciation_schedule",
    "/api/depreciation-schedules"
);

// ═══════════════════════════════════════════════════════════════
// EXPENSE REPORTS
// ═══════════════════════════════════════════════════════════════

export const useExpenseReports = makeListHook<Tables<"expenses">>(
    "expense_report",
    "/api/expense-reports",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useCreateExpenseReport = makeCreateHook<Tables<"expenses">>(
    "expense_report",
    "/api/expense-reports"
);

// ═══════════════════════════════════════════════════════════════
// TIMESHEETS
// ═══════════════════════════════════════════════════════════════

export const useTimesheets = makeListHook<Tables<"time_entries">>("timesheet", "/api/timesheets", {
    sort_by: "period_start",
    sort_order: "desc",
});
export const useCreateTimesheet = makeCreateHook<Tables<"time_entries">>(
    "timesheet",
    "/api/timesheets"
);

// ═══════════════════════════════════════════════════════════════
// INVOICE TEMPLATES
// ═══════════════════════════════════════════════════════════════

export const useInvoiceTemplates = makeListHook<Tables<"invoice_templates">>(
    "invoice_template",
    "/api/invoice-templates",
    { sort_by: "name", sort_order: "asc" }
);
export const useCreateInvoiceTemplate = makeCreateHook<Tables<"invoice_templates">>(
    "invoice_template",
    "/api/invoice-templates"
);
export const useUpdateInvoiceTemplate = makeUpdateHook<Tables<"invoice_templates">>(
    "invoice_template",
    "/api/invoice-templates"
);

// ═══════════════════════════════════════════════════════════════
// PAYMENT APPROVALS
// ═══════════════════════════════════════════════════════════════

export const usePaymentApprovals = makeListHook<Tables<"payment_approvals">>(
    "payment_approval",
    "/api/payment-approvals",
    { sort_by: "created_at", sort_order: "desc" }
);
export const usePaymentApproval = makeDetailHook<Tables<"payment_approvals">>(
    "payment_approval",
    "/api/payment-approvals"
);
export const useCreatePaymentApproval = makeCreateHook<Tables<"payment_approvals">>(
    "payment_approval",
    "/api/payment-approvals"
);
export const useUpdatePaymentApproval = makeUpdateHook<Tables<"payment_approvals">>(
    "payment_approval",
    "/api/payment-approvals"
);

// ═══════════════════════════════════════════════════════════════
// ENGINEERING APPROVALS
// ═══════════════════════════════════════════════════════════════

export const useEngineeringApprovals = makeListHook<Tables<"engineering_approvals">>(
    "engineering_approval",
    "/api/engineering-approvals",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useCreateEngineeringApproval = makeCreateHook<Tables<"engineering_approvals">>(
    "engineering_approval",
    "/api/engineering-approvals"
);

// ═══════════════════════════════════════════════════════════════
// FINANCIAL PERIODS
// ═══════════════════════════════════════════════════════════════

export const useFinancialPeriods = makeListHook<Tables<"financial_periods">>(
    "financial_period",
    "/api/financial-periods",
    { sort_by: "start_date", sort_order: "desc" }
);
export const useFinancialPeriod = makeDetailHook<Tables<"financial_periods">>(
    "financial_period",
    "/api/financial-periods"
);
export const useCreateFinancialPeriod = makeCreateHook<Tables<"financial_periods">>(
    "financial_period",
    "/api/financial-periods"
);
export const useUpdateFinancialPeriod = makeUpdateHook<Tables<"financial_periods">>(
    "financial_period",
    "/api/financial-periods"
);
export const useDeleteFinancialPeriod = makeDeleteHook(
    "financial_period",
    "/api/financial-periods"
);

// ═══════════════════════════════════════════════════════════════
// BILLING
// ═══════════════════════════════════════════════════════════════

export function useBillingPlan() {
    return useQuery({
        queryKey: ["billing_plan"],
        queryFn: async () => {
            const res = await apiFetch<{ subscription: Record<string, unknown> | null }>(
                "/api/billing/subscribe"
            );
            return res.subscription;
        },
    });
}

export function useSelectPlan() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (params: {
            pricing_tier: "starter" | "core" | "team" | "pro" | "enterprise";
            billing_cycle: "monthly" | "annual";
        }) => {
            const res = await apiFetch<{ subscription: unknown }>("/api/billing/subscribe", {
                method: "POST",
                body: JSON.stringify(params),
            });
            return res.subscription;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["billing_plan"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// INVOICE GENERATION FROM TIME (cross-entity action)
// ═══════════════════════════════════════════════════════════════

export function useGenerateInvoiceFromTime() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({
            projectId,
            timeEntryIds,
        }: {
            projectId: string;
            timeEntryIds: string[];
        }) => {
            const res = await apiFetch<{ data: unknown }>("/api/invoices/generate-from-time", {
                method: "POST",
                body: JSON.stringify({ project_id: projectId, time_entry_ids: timeEntryIds }),
            });
            return res.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["production_time_entry"] });
            qc.invalidateQueries({ queryKey: ["client_invoice"] });
        },
    });
}
