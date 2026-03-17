/* ═══════════════════════════════════════════════════════════════
   LIST PAGE CONFIGS — Finance Domain
   
   Declarative ListPageConfig objects for the finance domain.
   Consumed by ListPageShell — no imperative page code needed.
   ═══════════════════════════════════════════════════════════════ */

import type { ListPageConfig } from "@/types/list-page-config";
import { CREATE_BUDGET_LINE_ITEM_CONFIG } from "@/config/create-entity-configs";
import {
    CREATE_DEPRECIATION_SCHEDULE_CONFIG,
    CREATE_EXPENSE_REPORT_CONFIG,
    CREATE_INVOICE_TEMPLATE_CONFIG,
    CREATE_JOB_COST_ENTRY_CONFIG,
    CREATE_PAYROLL_BATCH_CONFIG,
    CREATE_REVENUE_SCHEDULE_CONFIG,
} from "@/config/phase-h-create-entity-configs";
import { Banknote, Calculator, CreditCard, DollarSign, FileText, Receipt } from "lucide-react";

// ─── depreciation_schedule ───

export const DEPRECIATION_SCHEDULES_PAGE: ListPageConfig = {
    entityKey: "depreciation_schedule",
    description: "Asset depreciation schedules for financial planning and reporting",
    icon: Calculator,
    createConfig: CREATE_DEPRECIATION_SCHEDULE_CONFIG,
    searchKeys: ["name", "asset_name"],
    columns: [
        { id: "name", header: "Schedule", accessorKey: "name" },
        { id: "method", header: "Method", accessorKey: "method", fieldType: "status" },
        { id: "useful_life_months", header: "Life (mo)", accessorKey: "useful_life_months" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── expense_report ───

export const EXPENSE_REPORTS_PAGE: ListPageConfig = {
    entityKey: "expense_report",
    description: "Consolidated expense reports for review and reimbursement",
    icon: Receipt,
    createConfig: CREATE_EXPENSE_REPORT_CONFIG,
    searchKeys: ["title", "description"],
    columns: [
        { id: "title", header: "Report", accessorKey: "title" },
        { id: "total_amount", header: "Total", accessorKey: "total_amount", fieldType: "currency" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "submitted_at", header: "Submitted", accessorKey: "submitted_at", fieldType: "date" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "board", "chart"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "title",
    },
    chartConfig: {
        type: "bar",
        categoryKey: "status",
        valueKey: "total_amount",
        aggregation: "sum",
    },
    exportable: true,
};

// ─── invoice_template ───

export const INVOICE_TEMPLATES_PAGE: ListPageConfig = {
    entityKey: "invoice_template",
    description: "Reusable invoice templates for consistent billing",
    icon: FileText,
    createConfig: CREATE_INVOICE_TEMPLATE_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Template", accessorKey: "name" },
        { id: "template_type", header: "Type", accessorKey: "template_type", fieldType: "status" },
        { id: "is_default", header: "Default", accessorKey: "is_default", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── payroll_batch ───

export const PAYROLL_BATCHES_PAGE: ListPageConfig = {
    entityKey: "payroll_batch",
    description: "Payroll processing batches and payment runs",
    icon: Banknote,
    createConfig: CREATE_PAYROLL_BATCH_CONFIG,
    searchKeys: ["name", "period"],
    columns: [
        { id: "name", header: "Batch", accessorKey: "name" },
        { id: "period", header: "Period", accessorKey: "period" },
        { id: "total_amount", header: "Total", accessorKey: "total_amount", fieldType: "currency" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "board"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "name",
        cardSubtitleKey: "period",
    },
    exportable: true,
};

// ─── revenue_schedule ───

export const REVENUE_SCHEDULES_PAGE: ListPageConfig = {
    entityKey: "revenue_schedule",
    description: "Revenue recognition schedules for financial planning",
    icon: DollarSign,
    createConfig: CREATE_REVENUE_SCHEDULE_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Schedule", accessorKey: "name" },
        { id: "total_amount", header: "Total", accessorKey: "total_amount", fieldType: "currency" },
        {
            id: "recognized_amount",
            header: "Recognized",
            accessorKey: "recognized_amount",
            fieldType: "currency",
        },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "period_start", header: "Start", accessorKey: "period_start", fieldType: "date" },
    ],
    exportable: true,
};

// ─── job_cost_entry ───

export const JOB_COST_ENTRIES_PAGE: ListPageConfig = {
    entityKey: "job_cost_entry",
    description: "Job costing entries for tracking labor, material, and overhead costs",
    icon: CreditCard,
    createConfig: CREATE_JOB_COST_ENTRY_CONFIG,
    searchKeys: ["description", "cost_type"],
    columns: [
        { id: "description", header: "Entry", accessorKey: "description" },
        { id: "cost_type", header: "Type", accessorKey: "cost_type", fieldType: "status" },
        { id: "amount", header: "Amount", accessorKey: "amount", fieldType: "currency" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "entry_date", header: "Date", accessorKey: "entry_date", fieldType: "date" },
    ],
    views: ["table", "chart"],
    defaultView: "table",
    chartConfig: {
        type: "bar",
        categoryKey: "cost_type",
        valueKey: "amount",
        aggregation: "sum",
    },
    exportable: true,
};

// ─── budget_line_item ───

export const BUDGET_LINE_ITEMS_PAGE: ListPageConfig = {
    entityKey: "budget_line_item",
    description: "Individual line items within project and production budgets",
    icon: Calculator,
    createConfig: CREATE_BUDGET_LINE_ITEM_CONFIG,
    searchKeys: ["description", "category"],
    columns: [
        { id: "description", header: "Line Item", accessorKey: "description" },
        { id: "category", header: "Category", accessorKey: "category", fieldType: "status" },
        {
            id: "budgeted_amount",
            header: "Budgeted",
            accessorKey: "budgeted_amount",
            fieldType: "currency",
        },
        {
            id: "actual_amount",
            header: "Actual",
            accessorKey: "actual_amount",
            fieldType: "currency",
        },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "chart"],
    defaultView: "table",
    chartConfig: {
        type: "bar",
        categoryKey: "category",
        valueKey: "budgeted_amount",
        aggregation: "sum",
    },
    exportable: true,
};

// ─── pos_transaction ───

export const POS_TRANSACTIONS_PAGE: ListPageConfig = {
    entityKey: "pos_transaction",
    description: "Point-of-sale transactions from integrated systems",
    icon: Receipt,
    searchKeys: ["transaction_id", "location_name"],
    columns: [
        { id: "transaction_id", header: "Transaction", accessorKey: "transaction_id" },
        { id: "location_name", header: "Location", accessorKey: "location_name" },
        { id: "amount", header: "Amount", accessorKey: "amount", fieldType: "currency" },
        {
            id: "payment_method",
            header: "Payment",
            accessorKey: "payment_method",
            fieldType: "status",
        },
        {
            id: "transaction_date",
            header: "Date",
            accessorKey: "transaction_date",
            fieldType: "date",
        },
    ],
    views: ["table", "chart"],
    defaultView: "table",
    chartConfig: {
        type: "bar",
        categoryKey: "payment_method",
        valueKey: "amount",
        aggregation: "sum",
    },
    exportable: true,
};

// ─── revenue_recognition_entry ───

export const REVENUE_RECOGNITION_ENTRIES_PAGE: ListPageConfig = {
    entityKey: "revenue_recognition_entry",
    description: "Revenue recognition entries and schedules",
    icon: DollarSign,
    searchKeys: ["description", "revenue_type"],
    columns: [
        { id: "description", header: "Entry", accessorKey: "description" },
        { id: "revenue_type", header: "Type", accessorKey: "revenue_type", fieldType: "status" },
        { id: "amount", header: "Amount", accessorKey: "amount", fieldType: "currency" },
        {
            id: "recognition_date",
            header: "Recognized",
            accessorKey: "recognition_date",
            fieldType: "date",
        },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
    ],
    exportable: true,
};
