/* ═══════════════════════════════════════════════════════════════
   LIST PAGE CONFIGS — Primary Entity Pages

   Declarative ListPageConfig objects for the major entity list
   pages that serve as primary navigation destinations.
   Consumed by ListPageShell — no imperative page code needed.
   ═══════════════════════════════════════════════════════════════ */

import type { ListPageConfig } from "@/types/list-page-config";
import {
    CREATE_ACCOUNT_CONFIG,
    CREATE_ACTIVATION_CONFIG,
    CREATE_ASSET_CONFIG,
    CREATE_BRIEF_CONFIG,
    CREATE_BUDGET_CONFIG,
    CREATE_CALL_SHEET_CONFIG,
    CREATE_CAMPAIGN_CONFIG,
    CREATE_CASE_STUDY_CONFIG,
    CREATE_CHANGE_ORDER_CONFIG,
    CREATE_CHECKLIST_CONFIG,
    CREATE_CLAUSE_CONFIG,
    CREATE_CLIENT_INVOICE_CONFIG,
    CREATE_COMPANY_CONFIG,
    CREATE_COMPLIANCE_CHECKLIST_CONFIG,
    CREATE_CONTRACT_CONFIG,
    CREATE_CREDENTIAL_CONFIG,
    CREATE_CREDIT_NOTE_CONFIG,
    CREATE_DEAL_CONFIG,
    CREATE_DECK_CONFIG,
    CREATE_DIGITAL_ASSET_CONFIG,
    CREATE_DISPATCH_CONFIG,
    CREATE_DOCUMENT_CONFIG,
    CREATE_ENGINEERING_APPROVAL_CONFIG,
    CREATE_ESTIMATE_CONFIG,
    CREATE_EVENT_CONFIG,
    CREATE_EXPENSE_CONFIG,
    CREATE_GL_ACCOUNT_CONFIG,
    CREATE_GOODS_RECEIPT_CONFIG,
    CREATE_INCIDENT_CONFIG,
    CREATE_INSURANCE_POLICY_CONFIG,
    CREATE_INTEGRATION_CONFIG,
    CREATE_INVENTORY_ITEM_CONFIG,
    CREATE_INVOICE_CONFIG,
    CREATE_IP_RIGHT_CONFIG,
    CREATE_KB_ARTICLE_CONFIG,
    CREATE_LEAD_CONFIG,
    CREATE_LOCATION_CONFIG,
    CREATE_OPPORTUNITY_CONFIG,
    CREATE_PAYMENT_CONFIG,
    CREATE_PERMIT_CONFIG,
    CREATE_PERSON_CONFIG,
    CREATE_PROJECT_CONFIG,
    CREATE_PROPOSAL_CONFIG,
    CREATE_PURCHASE_ORDER_CONFIG,
    CREATE_PURCHASE_REQUISITION_CONFIG,
    CREATE_QUALITY_CHECK_CONFIG,
    CREATE_RATE_CARD_CONFIG,
    CREATE_RECURRING_INVOICE_CONFIG,
    CREATE_SAVED_VIEW_CONFIG,
    CREATE_SERVICE_REQUEST_CONFIG,
    CREATE_SHIPMENT_CONFIG,
    CREATE_SOP_CONFIG,
    CREATE_SOW_CONFIG,
    CREATE_SURVEY_CONFIG,
    CREATE_TASK_CONFIG,
    CREATE_TEAM_CONFIG,
    CREATE_TECH_SHEET_CONFIG,
    CREATE_TEMPLATE_CONFIG,
    CREATE_VEHICLE_CONFIG,
    CREATE_VENDOR_CONFIG,
    CREATE_VENDOR_ONBOARDING_CONFIG,
    CREATE_VENDOR_REVIEW_CONFIG,
    CREATE_WAREHOUSE_CONFIG,
    CREATE_WORK_ORDER_CONFIG,
    CREATE_WORKFORCE_CONFIG,
} from "@/config/create-entity-configs";
import {
    AlertTriangle,
    Banknote,
    BookLock,
    BookOpen,
    Box,
    Briefcase,
    Building2,
    Calendar,
    CalendarDays,
    Car,
    CheckCircle2,
    ClipboardCheck,
    CreditCard,
    DollarSign,
    FileCheck,
    FileSignature,
    FileText,
    Flag,
    FolderKanban,
    FolderOpen,
    Gift,
    Globe,
    HardHat,
    Layers,
    Megaphone,
    Package,
    PenTool,
    Receipt,
    Repeat,
    ScrollText,
    Send,
    Settings,
    Shield,
    ShieldAlert,
    ShoppingCart,
    Sparkles,
    Star,
    Ticket,
    Truck,
    Users,
    Warehouse,
    Wrench,
    Zap,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// CRM / SALES
// ═══════════════════════════════════════════════════════════════

// ─── deal (pipeline) ───

export const DEALS_PAGE: ListPageConfig = {
    entityKey: "deal",
    description: "Sales pipeline — track deals from discovery to close",
    icon: Briefcase,
    createConfig: CREATE_DEAL_CONFIG,
    searchKeys: ["name", "company_name"],
    columns: [
        { id: "name", header: "Deal", accessorKey: "name" },
        { id: "stage", header: "Stage", accessorKey: "stage", fieldType: "status" },
        { id: "value", header: "Value", accessorKey: "value", fieldType: "currency" },
        { id: "probability", header: "Probability", accessorKey: "probability" },
        {
            id: "expected_close_date",
            header: "Close Date",
            accessorKey: "expected_close_date",
            fieldType: "date",
        },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "board"],
    defaultView: "board",
    boardConfig: {
        groupByKey: "stage",
        cardTitleKey: "name",
        cardSubtitleKey: "company_name",
    },
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Deal", accessorKey: "name" },
            { id: "stage", label: "Stage", accessorKey: "stage", fieldType: "status" },
            { id: "value", label: "Value", accessorKey: "value", fieldType: "currency" },
            { id: "probability", label: "Probability", accessorKey: "probability" },
            {
                id: "expected_close_date",
                label: "Close Date",
                accessorKey: "expected_close_date",
                fieldType: "date",
            },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── opportunity ───

export const OPPORTUNITIES_PAGE: ListPageConfig = {
    entityKey: "opportunity",
    description: "Sales pipeline — track opportunities from discovery to close",
    icon: Building2,
    createConfig: CREATE_OPPORTUNITY_CONFIG,
    searchKeys: ["name", "company_name"],
    columns: [
        { id: "name", header: "Opportunity", accessorKey: "name" },
        { id: "stage", header: "Stage", accessorKey: "stage", fieldType: "status" },
        { id: "value", header: "Value", accessorKey: "value", fieldType: "currency" },
        { id: "probability", header: "Probability", accessorKey: "probability" },
        {
            id: "expected_close_date",
            header: "Close Date",
            accessorKey: "expected_close_date",
            fieldType: "date",
        },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "board"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "stage",
        cardTitleKey: "name",
        cardSubtitleKey: "company_name",
    },
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Opportunity", accessorKey: "name" },
            { id: "stage", label: "Stage", accessorKey: "stage", fieldType: "status" },
            { id: "value", label: "Value", accessorKey: "value", fieldType: "currency" },
            { id: "probability", label: "Probability", accessorKey: "probability" },
            {
                id: "expected_close_date",
                label: "Close Date",
                accessorKey: "expected_close_date",
                fieldType: "date",
            },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── company ───

export const COMPANIES_PAGE: ListPageConfig = {
    entityKey: "company",
    description: "Client and partner organizations",
    icon: Building2,
    createConfig: CREATE_COMPANY_CONFIG,
    searchKeys: ["name", "industry", "website"],
    columns: [
        { id: "name", header: "Company", accessorKey: "name" },
        { id: "industry", header: "Industry", accessorKey: "industry" },
        { id: "website", header: "Website", accessorKey: "website" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "cards"],
    defaultView: "table",
    cardConfig: {
        titleKey: "name",
        subtitleKey: "industry",
        statusKey: "status",
    },
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Company", accessorKey: "name" },
            { id: "industry", label: "Industry", accessorKey: "industry" },
            { id: "website", label: "Website", accessorKey: "website" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ═══════════════════════════════════════════════════════════════
// FINANCE
// ═══════════════════════════════════════════════════════════════

// ─── invoice ───

export const INVOICES_PAGE: ListPageConfig = {
    entityKey: "invoice",
    description: "Internal invoices and billing records",
    icon: Receipt,
    createConfig: CREATE_INVOICE_CONFIG,
    searchKeys: ["invoice_number", "client_name"],
    columns: [
        { id: "invoice_number", header: "Invoice #", accessorKey: "invoice_number" },
        { id: "client_name", header: "Client", accessorKey: "client_name" },
        {
            id: "total_amount",
            header: "Amount",
            accessorKey: "total_amount",
            fieldType: "currency",
        },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "due_date", header: "Due", accessorKey: "due_date", fieldType: "date" },
        { id: "issued_date", header: "Issued", accessorKey: "issued_date", fieldType: "date" },
    ],
    views: ["table", "board"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "invoice_number",
        cardSubtitleKey: "client_name",
    },
    quickViewConfig: {
        previewFields: [
            { id: "invoice_number", label: "Invoice #", accessorKey: "invoice_number" },
            { id: "client_name", label: "Client", accessorKey: "client_name" },
            {
                id: "total_amount",
                label: "Amount",
                accessorKey: "total_amount",
                fieldType: "currency",
            },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "due_date", label: "Due", accessorKey: "due_date", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── client_invoice ───

export const CLIENT_INVOICES_PAGE: ListPageConfig = {
    entityKey: "client_invoice",
    description: "Create, send, and track client-facing invoices",
    icon: FileText,
    createConfig: CREATE_CLIENT_INVOICE_CONFIG,
    searchKeys: ["invoice_number", "client_name"],
    columns: [
        { id: "invoice_number", header: "Invoice #", accessorKey: "invoice_number" },
        { id: "client_name", header: "Client", accessorKey: "client_name" },
        {
            id: "total_amount",
            header: "Amount",
            accessorKey: "total_amount",
            fieldType: "currency",
        },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "due_date", header: "Due", accessorKey: "due_date", fieldType: "date" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "board"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "invoice_number",
        cardSubtitleKey: "client_name",
    },
    quickViewConfig: {
        previewFields: [
            { id: "invoice_number", label: "Invoice #", accessorKey: "invoice_number" },
            { id: "client_name", label: "Client", accessorKey: "client_name" },
            {
                id: "total_amount",
                label: "Amount",
                accessorKey: "total_amount",
                fieldType: "currency",
            },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "due_date", label: "Due", accessorKey: "due_date", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── recurring_invoice ───

export const RECURRING_INVOICES_PAGE: ListPageConfig = {
    entityKey: "recurring_invoice",
    description: "Automated recurring invoice schedules",
    icon: Repeat,
    createConfig: CREATE_RECURRING_INVOICE_CONFIG,
    searchKeys: ["name", "client_name"],
    columns: [
        { id: "name", header: "Schedule", accessorKey: "name" },
        { id: "client_name", header: "Client", accessorKey: "client_name" },
        { id: "amount", header: "Amount", accessorKey: "amount", fieldType: "currency" },
        { id: "frequency", header: "Frequency", accessorKey: "frequency", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        {
            id: "next_invoice_date",
            header: "Next Date",
            accessorKey: "next_invoice_date",
            fieldType: "date",
        },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Schedule", accessorKey: "name" },
            { id: "client_name", label: "Client", accessorKey: "client_name" },
            { id: "amount", label: "Amount", accessorKey: "amount", fieldType: "currency" },
            { id: "frequency", label: "Frequency", accessorKey: "frequency", fieldType: "status" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── expense ───

export const EXPENSES_PAGE: ListPageConfig = {
    entityKey: "expense",
    description: "Track and categorize business expenses",
    icon: CreditCard,
    createConfig: CREATE_EXPENSE_CONFIG,
    searchKeys: ["description", "vendor_name", "category"],
    columns: [
        { id: "description", header: "Description", accessorKey: "description" },
        { id: "category", header: "Category", accessorKey: "category", fieldType: "status" },
        { id: "amount", header: "Amount", accessorKey: "amount", fieldType: "currency" },
        { id: "vendor_name", header: "Vendor", accessorKey: "vendor_name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "expense_date", header: "Date", accessorKey: "expense_date", fieldType: "date" },
    ],
    views: ["table", "chart"],
    defaultView: "table",
    chartConfig: {
        type: "bar",
        categoryKey: "category",
        valueKey: "amount",
        aggregation: "sum",
    },
    quickViewConfig: {
        previewFields: [
            { id: "description", label: "Description", accessorKey: "description" },
            { id: "category", label: "Category", accessorKey: "category", fieldType: "status" },
            { id: "amount", label: "Amount", accessorKey: "amount", fieldType: "currency" },
            { id: "vendor_name", label: "Vendor", accessorKey: "vendor_name" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── payment ───

export const PAYMENTS_PAGE: ListPageConfig = {
    entityKey: "payment",
    description: "Track incoming and outgoing payments",
    icon: Banknote,
    createConfig: CREATE_PAYMENT_CONFIG,
    searchKeys: ["reference", "payer_name"],
    columns: [
        { id: "reference", header: "Reference", accessorKey: "reference" },
        { id: "payer_name", header: "Payer", accessorKey: "payer_name" },
        { id: "amount", header: "Amount", accessorKey: "amount", fieldType: "currency" },
        {
            id: "payment_method",
            header: "Method",
            accessorKey: "payment_method",
            fieldType: "status",
        },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "payment_date", header: "Date", accessorKey: "payment_date", fieldType: "date" },
    ],
    views: ["table", "chart"],
    defaultView: "table",
    chartConfig: {
        type: "bar",
        categoryKey: "payment_method",
        valueKey: "amount",
        aggregation: "sum",
    },
    quickViewConfig: {
        previewFields: [
            { id: "reference", label: "Reference", accessorKey: "reference" },
            { id: "payer_name", label: "Payer", accessorKey: "payer_name" },
            { id: "amount", label: "Amount", accessorKey: "amount", fieldType: "currency" },
            {
                id: "payment_method",
                label: "Method",
                accessorKey: "payment_method",
                fieldType: "status",
            },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── credit_note ───

export const CREDIT_NOTES_PAGE: ListPageConfig = {
    entityKey: "credit_note",
    description: "Issue and track credit notes against invoices",
    icon: FileSignature,
    createConfig: CREATE_CREDIT_NOTE_CONFIG,
    searchKeys: ["credit_note_number", "client_name"],
    columns: [
        { id: "credit_note_number", header: "Credit Note #", accessorKey: "credit_note_number" },
        { id: "client_name", header: "Client", accessorKey: "client_name" },
        { id: "amount", header: "Amount", accessorKey: "amount", fieldType: "currency" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "credit_note_number", label: "Credit Note #", accessorKey: "credit_note_number" },
            { id: "client_name", label: "Client", accessorKey: "client_name" },
            { id: "amount", label: "Amount", accessorKey: "amount", fieldType: "currency" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── gl_account ───

export const GL_ACCOUNTS_PAGE: ListPageConfig = {
    entityKey: "gl_account",
    description: "General ledger chart of accounts",
    icon: DollarSign,
    createConfig: CREATE_GL_ACCOUNT_CONFIG,
    searchKeys: ["account_code", "name"],
    columns: [
        { id: "account_code", header: "Code", accessorKey: "account_code" },
        { id: "name", header: "Account", accessorKey: "name" },
        { id: "account_type", header: "Type", accessorKey: "account_type", fieldType: "status" },
        { id: "balance", header: "Balance", accessorKey: "balance", fieldType: "currency" },
        { id: "is_active", header: "Active", accessorKey: "is_active", fieldType: "status" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "account_code", label: "Code", accessorKey: "account_code" },
            { id: "name", label: "Account", accessorKey: "name" },
            { id: "account_type", label: "Type", accessorKey: "account_type", fieldType: "status" },
            { id: "balance", label: "Balance", accessorKey: "balance", fieldType: "currency" },
            { id: "is_active", label: "Active", accessorKey: "is_active", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── budget ───

export const BUDGETS_PAGE: ListPageConfig = {
    entityKey: "budget",
    description: "Project and production budgets with real-time tracking",
    icon: DollarSign,
    createConfig: CREATE_BUDGET_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Budget", accessorKey: "name" },
        { id: "total_amount", header: "Total", accessorKey: "total_amount", fieldType: "currency" },
        { id: "spent_amount", header: "Spent", accessorKey: "spent_amount", fieldType: "currency" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "chart"],
    defaultView: "table",
    chartConfig: {
        type: "bar",
        categoryKey: "name",
        valueKey: "total_amount",
        aggregation: "sum",
    },
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Budget", accessorKey: "name" },
            {
                id: "total_amount",
                label: "Total",
                accessorKey: "total_amount",
                fieldType: "currency",
            },
            {
                id: "spent_amount",
                label: "Spent",
                accessorKey: "spent_amount",
                fieldType: "currency",
            },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── budget_approval ───

export const BUDGET_APPROVALS_PAGE: ListPageConfig = {
    entityKey: "budget_approval",
    description: "Budget approval requests and decisions",
    icon: CheckCircle2,
    searchKeys: ["title", "requester_name"],
    columns: [
        { id: "title", header: "Request", accessorKey: "title" },
        { id: "amount", header: "Amount", accessorKey: "amount", fieldType: "currency" },
        { id: "requester_name", header: "Requester", accessorKey: "requester_name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "board"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "title",
        cardSubtitleKey: "requester_name",
    },
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Request", accessorKey: "title" },
            { id: "amount", label: "Amount", accessorKey: "amount", fieldType: "currency" },
            { id: "requester_name", label: "Requester", accessorKey: "requester_name" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── payment_approval ───

export const PAYMENT_APPROVALS_PAGE: ListPageConfig = {
    entityKey: "payment_approval",
    description: "Payment approval requests and authorizations",
    icon: CheckCircle2,
    searchKeys: ["title", "requester_name"],
    columns: [
        { id: "title", header: "Request", accessorKey: "title" },
        { id: "amount", header: "Amount", accessorKey: "amount", fieldType: "currency" },
        { id: "requester_name", header: "Requester", accessorKey: "requester_name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "board"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "title",
        cardSubtitleKey: "requester_name",
    },
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Request", accessorKey: "title" },
            { id: "amount", label: "Amount", accessorKey: "amount", fieldType: "currency" },
            { id: "requester_name", label: "Requester", accessorKey: "requester_name" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── goods_receipt ───

export const GOODS_RECEIPTS_PAGE: ListPageConfig = {
    entityKey: "goods_receipt",
    description: "Track receipt of goods against purchase orders",
    icon: Package,
    createConfig: CREATE_GOODS_RECEIPT_CONFIG,
    searchKeys: ["receipt_number", "supplier_name"],
    columns: [
        { id: "receipt_number", header: "Receipt #", accessorKey: "receipt_number" },
        { id: "supplier_name", header: "Supplier", accessorKey: "supplier_name" },
        { id: "po_number", header: "PO #", accessorKey: "po_number" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "received_at", header: "Received", accessorKey: "received_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "receipt_number", label: "Receipt #", accessorKey: "receipt_number" },
            { id: "supplier_name", label: "Supplier", accessorKey: "supplier_name" },
            { id: "po_number", label: "PO #", accessorKey: "po_number" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "received_at", label: "Received", accessorKey: "received_at", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ═══════════════════════════════════════════════════════════════
// MARKETING / CREATIVE
// ═══════════════════════════════════════════════════════════════

// ─── campaign ───

export const CAMPAIGNS_PAGE: ListPageConfig = {
    entityKey: "campaign",
    description: "Plan, execute, and measure marketing campaigns",
    icon: Megaphone,
    createConfig: CREATE_CAMPAIGN_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Campaign", accessorKey: "name" },
        { id: "campaign_type", header: "Type", accessorKey: "campaign_type", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "budget", header: "Budget", accessorKey: "budget", fieldType: "currency" },
        { id: "start_date", header: "Start", accessorKey: "start_date", fieldType: "date" },
        { id: "end_date", header: "End", accessorKey: "end_date", fieldType: "date" },
    ],
    views: ["table", "board", "calendar"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "name",
        cardSubtitleKey: "campaign_type",
    },
    calendarConfig: {
        titleKey: "name",
        dateKey: "start_date",
        colorKey: "status",
    },
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Campaign", accessorKey: "name" },
            {
                id: "campaign_type",
                label: "Type",
                accessorKey: "campaign_type",
                fieldType: "status",
            },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "budget", label: "Budget", accessorKey: "budget", fieldType: "currency" },
            { id: "start_date", label: "Start", accessorKey: "start_date", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── creative_brief ───

export const BRIEFS_PAGE: ListPageConfig = {
    entityKey: "creative_brief",
    description: "Strategic briefs connecting creative intent to measurable outcomes",
    icon: CalendarDays,
    createConfig: CREATE_BRIEF_CONFIG,
    searchKeys: ["title", "description"],
    columns: [
        { id: "title", header: "Brief", accessorKey: "title" },
        { id: "brief_type", header: "Type", accessorKey: "brief_type", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "due_date", header: "Due", accessorKey: "due_date", fieldType: "date" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "board"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "title",
        cardSubtitleKey: "brief_type",
    },
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Brief", accessorKey: "title" },
            { id: "brief_type", label: "Type", accessorKey: "brief_type", fieldType: "status" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "due_date", label: "Due", accessorKey: "due_date", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── case_study ───

export const CASE_STUDIES_PAGE: ListPageConfig = {
    entityKey: "case_study",
    description: "Client success stories and project showcases",
    icon: Gift,
    createConfig: CREATE_CASE_STUDY_CONFIG,
    searchKeys: ["title", "client_name"],
    columns: [
        { id: "title", header: "Case Study", accessorKey: "title" },
        { id: "client_name", header: "Client", accessorKey: "client_name" },
        { id: "industry", header: "Industry", accessorKey: "industry" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "published_at", header: "Published", accessorKey: "published_at", fieldType: "date" },
    ],
    views: ["table", "cards"],
    defaultView: "table",
    cardConfig: {
        titleKey: "title",
        subtitleKey: "client_name",
        statusKey: "status",
    },
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Case Study", accessorKey: "title" },
            { id: "client_name", label: "Client", accessorKey: "client_name" },
            { id: "industry", label: "Industry", accessorKey: "industry" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            {
                id: "published_at",
                label: "Published",
                accessorKey: "published_at",
                fieldType: "date",
            },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── digital_asset ───

export const DIGITAL_ASSETS_PAGE: ListPageConfig = {
    entityKey: "digital_asset",
    description: "Manage digital media files and creative assets",
    icon: Layers,
    createConfig: CREATE_DIGITAL_ASSET_CONFIG,
    searchKeys: ["name", "description", "tags"],
    columns: [
        { id: "name", header: "Asset", accessorKey: "name" },
        { id: "asset_type", header: "Type", accessorKey: "asset_type", fieldType: "status" },
        { id: "file_size", header: "Size", accessorKey: "file_size" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "cards"],
    defaultView: "table",
    cardConfig: {
        titleKey: "name",
        subtitleKey: "asset_type",
        statusKey: "status",
    },
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Asset", accessorKey: "name" },
            { id: "asset_type", label: "Type", accessorKey: "asset_type", fieldType: "status" },
            { id: "file_size", label: "Size", accessorKey: "file_size" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── creative_asset (same table as digital_asset but different page context) ───

export const CREATIVE_ASSETS_PAGE: ListPageConfig = {
    entityKey: "digital_asset",
    description: "Creative assets for campaigns, briefs, and productions",
    icon: Layers,
    createConfig: CREATE_ASSET_CONFIG,
    searchKeys: ["name", "description", "tags"],
    columns: [
        { id: "name", header: "Asset", accessorKey: "name" },
        { id: "asset_type", header: "Type", accessorKey: "asset_type", fieldType: "status" },
        { id: "file_size", header: "Size", accessorKey: "file_size" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "cards"],
    defaultView: "cards",
    cardConfig: {
        titleKey: "name",
        subtitleKey: "asset_type",
        statusKey: "status",
    },
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Asset", accessorKey: "name" },
            { id: "asset_type", label: "Type", accessorKey: "asset_type", fieldType: "status" },
            { id: "file_size", label: "Size", accessorKey: "file_size" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── deck ───

export const DECKS_PAGE: ListPageConfig = {
    entityKey: "deck",
    description: "Presentation decks and pitch materials",
    icon: ScrollText,
    createConfig: CREATE_DECK_CONFIG,
    searchKeys: ["title", "description"],
    columns: [
        { id: "title", header: "Deck", accessorKey: "title" },
        { id: "deck_type", header: "Type", accessorKey: "deck_type", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "slide_count", header: "Slides", accessorKey: "slide_count" },
        { id: "updated_at", header: "Updated", accessorKey: "updated_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Deck", accessorKey: "title" },
            { id: "deck_type", label: "Type", accessorKey: "deck_type", fieldType: "status" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "slide_count", label: "Slides", accessorKey: "slide_count" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ═══════════════════════════════════════════════════════════════
// CONTRACTS / LEGAL
// ═══════════════════════════════════════════════════════════════

// ─── contract ───

export const CONTRACTS_PAGE: ListPageConfig = {
    entityKey: "contract",
    description: "Track contracts, NDAs, SOWs, and amendments across all projects",
    icon: FileSignature,
    createConfig: CREATE_CONTRACT_CONFIG,
    searchKeys: ["title", "contract_number", "counterparty"],
    columns: [
        { id: "title", header: "Contract", accessorKey: "title" },
        { id: "contract_type", header: "Type", accessorKey: "contract_type", fieldType: "status" },
        { id: "counterparty", header: "Counterparty", accessorKey: "counterparty" },
        { id: "value", header: "Value", accessorKey: "value", fieldType: "currency" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "end_date", header: "Expires", accessorKey: "end_date", fieldType: "date" },
    ],
    views: ["table", "board", "calendar"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "title",
        cardSubtitleKey: "counterparty",
    },
    calendarConfig: {
        titleKey: "title",
        dateKey: "end_date",
        colorKey: "status",
    },
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Contract", accessorKey: "title" },
            {
                id: "contract_type",
                label: "Type",
                accessorKey: "contract_type",
                fieldType: "status",
            },
            { id: "counterparty", label: "Counterparty", accessorKey: "counterparty" },
            { id: "value", label: "Value", accessorKey: "value", fieldType: "currency" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── clause_library ───

export const CLAUSE_LIBRARY_PAGE: ListPageConfig = {
    entityKey: "clause_library_entry",
    description: "Standard contract clauses with risk classification — reuse across contracts",
    icon: BookLock,
    createConfig: CREATE_CLAUSE_CONFIG,
    searchKeys: ["title", "body", "category"],
    columns: [
        { id: "title", header: "Clause", accessorKey: "title" },
        { id: "category", header: "Category", accessorKey: "category", fieldType: "status" },
        { id: "risk_level", header: "Risk", accessorKey: "risk_level", fieldType: "status" },
        { id: "is_active", header: "Active", accessorKey: "is_active", fieldType: "status" },
        { id: "updated_at", header: "Updated", accessorKey: "updated_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Clause", accessorKey: "title" },
            { id: "category", label: "Category", accessorKey: "category", fieldType: "status" },
            { id: "risk_level", label: "Risk", accessorKey: "risk_level", fieldType: "status" },
            { id: "is_active", label: "Active", accessorKey: "is_active", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── scope_of_work ───

export const SCOPES_OF_WORK_PAGE: ListPageConfig = {
    entityKey: "sow",
    description: "Define project scope, deliverables, and acceptance criteria",
    icon: FileCheck,
    createConfig: CREATE_SOW_CONFIG,
    searchKeys: ["title", "description"],
    columns: [
        { id: "title", header: "SOW", accessorKey: "title" },
        { id: "client_name", header: "Client", accessorKey: "client_name" },
        { id: "total_value", header: "Value", accessorKey: "total_value", fieldType: "currency" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "board"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "title",
        cardSubtitleKey: "client_name",
    },
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "SOW", accessorKey: "title" },
            { id: "client_name", label: "Client", accessorKey: "client_name" },
            {
                id: "total_value",
                label: "Value",
                accessorKey: "total_value",
                fieldType: "currency",
            },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── change_order ───

export const CHANGE_ORDERS_PAGE: ListPageConfig = {
    entityKey: "change_order",
    description: "Track and manage post-contract scope modifications",
    icon: AlertTriangle,
    createConfig: CREATE_CHANGE_ORDER_CONFIG,
    searchKeys: ["title", "description"],
    columns: [
        { id: "title", header: "Change Order", accessorKey: "title" },
        { id: "change_type", header: "Type", accessorKey: "change_type", fieldType: "status" },
        {
            id: "cost_impact",
            header: "Cost Impact",
            accessorKey: "cost_impact",
            fieldType: "currency",
        },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "board"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "title",
        cardSubtitleKey: "change_type",
    },
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Change Order", accessorKey: "title" },
            { id: "change_type", label: "Type", accessorKey: "change_type", fieldType: "status" },
            {
                id: "cost_impact",
                label: "Cost Impact",
                accessorKey: "cost_impact",
                fieldType: "currency",
            },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── proposal ───

export const PROPOSALS_PAGE: ListPageConfig = {
    entityKey: "proposal",
    description: "Client proposals with pricing, scope, and approval tracking",
    icon: Send,
    createConfig: CREATE_PROPOSAL_CONFIG,
    searchKeys: ["title", "client_name"],
    columns: [
        { id: "title", header: "Proposal", accessorKey: "title" },
        { id: "client_name", header: "Client", accessorKey: "client_name" },
        { id: "total_value", header: "Value", accessorKey: "total_value", fieldType: "currency" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "submitted_at", header: "Submitted", accessorKey: "submitted_at", fieldType: "date" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "board"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "title",
        cardSubtitleKey: "client_name",
    },
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Proposal", accessorKey: "title" },
            { id: "client_name", label: "Client", accessorKey: "client_name" },
            {
                id: "total_value",
                label: "Value",
                accessorKey: "total_value",
                fieldType: "currency",
            },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            {
                id: "submitted_at",
                label: "Submitted",
                accessorKey: "submitted_at",
                fieldType: "date",
            },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── estimate ───

export const ESTIMATES_PAGE: ListPageConfig = {
    entityKey: "estimate",
    description: "Project cost estimates and quotations",
    icon: FileText,
    createConfig: CREATE_ESTIMATE_CONFIG,
    searchKeys: ["title", "client_name"],
    columns: [
        { id: "title", header: "Estimate", accessorKey: "title" },
        { id: "client_name", header: "Client", accessorKey: "client_name" },
        {
            id: "total_amount",
            header: "Amount",
            accessorKey: "total_amount",
            fieldType: "currency",
        },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "valid_until", header: "Valid Until", accessorKey: "valid_until", fieldType: "date" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Estimate", accessorKey: "title" },
            { id: "client_name", label: "Client", accessorKey: "client_name" },
            {
                id: "total_amount",
                label: "Amount",
                accessorKey: "total_amount",
                fieldType: "currency",
            },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            {
                id: "valid_until",
                label: "Valid Until",
                accessorKey: "valid_until",
                fieldType: "date",
            },
        ],
        navigable: true,
    },
    exportable: true,
};

// ═══════════════════════════════════════════════════════════════
// OPERATIONS / LOGISTICS
// ═══════════════════════════════════════════════════════════════

// ─── call_sheet ───

export const CALL_SHEETS_PAGE: ListPageConfig = {
    entityKey: "call_sheet",
    description: "Generate and distribute daily call sheets for crew and production teams",
    icon: Calendar,
    createConfig: CREATE_CALL_SHEET_CONFIG,
    searchKeys: ["title", "event_name"],
    columns: [
        { id: "title", header: "Call Sheet", accessorKey: "title" },
        { id: "event_name", header: "Event", accessorKey: "event_name" },
        { id: "call_date", header: "Date", accessorKey: "call_date", fieldType: "date" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "calendar"],
    defaultView: "table",
    calendarConfig: {
        titleKey: "title",
        dateKey: "call_date",
        colorKey: "status",
    },
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Call Sheet", accessorKey: "title" },
            { id: "event_name", label: "Event", accessorKey: "event_name" },
            { id: "call_date", label: "Date", accessorKey: "call_date", fieldType: "date" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── checklist ───

export const CHECKLISTS_PAGE: ListPageConfig = {
    entityKey: "checklist",
    description:
        "Template-based checklists for work orders, quality assurance, and safety compliance",
    icon: CheckCircle2,
    createConfig: CREATE_CHECKLIST_CONFIG,
    searchKeys: ["title", "description"],
    columns: [
        { id: "title", header: "Checklist", accessorKey: "title" },
        {
            id: "checklist_type",
            header: "Type",
            accessorKey: "checklist_type",
            fieldType: "status",
        },
        { id: "completion_pct", header: "Progress", accessorKey: "completion_pct" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "board"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "title",
        cardSubtitleKey: "checklist_type",
    },
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Checklist", accessorKey: "title" },
            {
                id: "checklist_type",
                label: "Type",
                accessorKey: "checklist_type",
                fieldType: "status",
            },
            { id: "completion_pct", label: "Progress", accessorKey: "completion_pct" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── compliance_checklist ───

export const COMPLIANCE_CHECKLISTS_PAGE: ListPageConfig = {
    entityKey: "compliance_checklist",
    description: "ADA, OSHA, fire safety, and other compliance inspections",
    icon: ShieldAlert,
    createConfig: CREATE_COMPLIANCE_CHECKLIST_CONFIG,
    searchKeys: ["title", "checklist_type"],
    columns: [
        { id: "title", header: "Checklist", accessorKey: "title" },
        {
            id: "checklist_type",
            header: "Type",
            accessorKey: "checklist_type",
            fieldType: "status",
        },
        { id: "completion_pct", header: "Progress", accessorKey: "completion_pct" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "due_date", header: "Due", accessorKey: "due_date", fieldType: "date" },
    ],
    views: ["table", "board"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "title",
        cardSubtitleKey: "checklist_type",
    },
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Checklist", accessorKey: "title" },
            {
                id: "checklist_type",
                label: "Type",
                accessorKey: "checklist_type",
                fieldType: "status",
            },
            { id: "completion_pct", label: "Progress", accessorKey: "completion_pct" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "due_date", label: "Due", accessorKey: "due_date", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── dispatch ───

export const DISPATCH_PAGE: ListPageConfig = {
    entityKey: "dispatch_entry",
    description: "Dispatch records for logistics and fleet management",
    icon: Truck,
    createConfig: CREATE_DISPATCH_CONFIG,
    searchKeys: ["reference", "driver_name", "destination"],
    columns: [
        { id: "reference", header: "Dispatch #", accessorKey: "reference" },
        { id: "driver_name", header: "Driver", accessorKey: "driver_name" },
        { id: "destination", header: "Destination", accessorKey: "destination" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "dispatch_date", header: "Date", accessorKey: "dispatch_date", fieldType: "date" },
    ],
    views: ["table", "board"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "reference",
        cardSubtitleKey: "driver_name",
    },
    quickViewConfig: {
        previewFields: [
            { id: "reference", label: "Dispatch #", accessorKey: "reference" },
            { id: "driver_name", label: "Driver", accessorKey: "driver_name" },
            { id: "destination", label: "Destination", accessorKey: "destination" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "dispatch_date", label: "Date", accessorKey: "dispatch_date", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── vehicle (fleet) ───

export const FLEET_PAGE: ListPageConfig = {
    entityKey: "vehicle",
    description: "Fleet vehicles, maintenance schedules, and utilization tracking",
    icon: Car,
    createConfig: CREATE_VEHICLE_CONFIG,
    searchKeys: ["name", "license_plate", "vin"],
    columns: [
        { id: "name", header: "Vehicle", accessorKey: "name" },
        { id: "vehicle_type", header: "Type", accessorKey: "vehicle_type", fieldType: "status" },
        { id: "license_plate", header: "Plate", accessorKey: "license_plate" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        {
            id: "next_service_date",
            header: "Next Service",
            accessorKey: "next_service_date",
            fieldType: "date",
        },
    ],
    views: ["table", "cards"],
    defaultView: "table",
    cardConfig: {
        titleKey: "name",
        subtitleKey: "license_plate",
        statusKey: "status",
    },
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Vehicle", accessorKey: "name" },
            { id: "vehicle_type", label: "Type", accessorKey: "vehicle_type", fieldType: "status" },
            { id: "license_plate", label: "Plate", accessorKey: "license_plate" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            {
                id: "next_service_date",
                label: "Next Service",
                accessorKey: "next_service_date",
                fieldType: "date",
            },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── warehouse ───

export const WAREHOUSES_PAGE: ListPageConfig = {
    entityKey: "warehouse",
    description: "Warehouses, storage locations, and capacity tracking",
    icon: Warehouse,
    createConfig: CREATE_WAREHOUSE_CONFIG,
    searchKeys: ["name", "location"],
    columns: [
        { id: "name", header: "Warehouse", accessorKey: "name" },
        { id: "location", header: "Location", accessorKey: "location" },
        { id: "capacity", header: "Capacity", accessorKey: "capacity" },
        { id: "utilization_pct", header: "Utilization", accessorKey: "utilization_pct" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
    ],
    views: ["table", "cards"],
    defaultView: "table",
    cardConfig: {
        titleKey: "name",
        subtitleKey: "location",
        statusKey: "status",
    },
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Warehouse", accessorKey: "name" },
            { id: "location", label: "Location", accessorKey: "location" },
            { id: "capacity", label: "Capacity", accessorKey: "capacity" },
            { id: "utilization_pct", label: "Utilization", accessorKey: "utilization_pct" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── inventory ───

export const INVENTORY_PAGE: ListPageConfig = {
    entityKey: "catalog_item",
    description: "Inventory items, stock levels, and reorder management",
    icon: Box,
    createConfig: CREATE_INVENTORY_ITEM_CONFIG,
    searchKeys: ["name", "sku", "category"],
    columns: [
        { id: "name", header: "Item", accessorKey: "name" },
        { id: "sku", header: "SKU", accessorKey: "sku" },
        { id: "category", header: "Category", accessorKey: "category", fieldType: "status" },
        { id: "quantity_on_hand", header: "On Hand", accessorKey: "quantity_on_hand" },
        { id: "reorder_point", header: "Reorder At", accessorKey: "reorder_point" },
        { id: "unit_cost", header: "Unit Cost", accessorKey: "unit_cost", fieldType: "currency" },
    ],
    views: ["table", "chart"],
    defaultView: "table",
    chartConfig: {
        type: "bar",
        categoryKey: "category",
        valueKey: "quantity_on_hand",
        aggregation: "sum",
    },
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Item", accessorKey: "name" },
            { id: "sku", label: "SKU", accessorKey: "sku" },
            { id: "category", label: "Category", accessorKey: "category", fieldType: "status" },
            { id: "quantity_on_hand", label: "On Hand", accessorKey: "quantity_on_hand" },
            { id: "reorder_point", label: "Reorder At", accessorKey: "reorder_point" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── location ───

export const LOCATIONS_PAGE: ListPageConfig = {
    entityKey: "location",
    description: "Offices, venues, warehouses, and site locations",
    icon: Globe,
    createConfig: CREATE_LOCATION_CONFIG,
    searchKeys: ["name", "address", "city"],
    columns: [
        { id: "name", header: "Location", accessorKey: "name" },
        { id: "location_type", header: "Type", accessorKey: "location_type", fieldType: "status" },
        { id: "city", header: "City", accessorKey: "city" },
        { id: "state", header: "State", accessorKey: "state" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
    ],
    views: ["table", "cards"],
    defaultView: "table",
    cardConfig: {
        titleKey: "name",
        subtitleKey: "location_type",
        statusKey: "status",
    },
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Location", accessorKey: "name" },
            {
                id: "location_type",
                label: "Type",
                accessorKey: "location_type",
                fieldType: "status",
            },
            { id: "city", label: "City", accessorKey: "city" },
            { id: "state", label: "State", accessorKey: "state" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── service_request ───

export const SERVICE_REQUESTS_PAGE: ListPageConfig = {
    entityKey: "service_request",
    description: "Internal and external service requests with SLA tracking",
    icon: Wrench,
    createConfig: CREATE_SERVICE_REQUEST_CONFIG,
    searchKeys: ["title", "description"],
    columns: [
        { id: "title", header: "Request", accessorKey: "title" },
        { id: "request_type", header: "Type", accessorKey: "request_type", fieldType: "status" },
        { id: "priority", header: "Priority", accessorKey: "priority", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "board"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "title",
        cardSubtitleKey: "priority",
    },
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Request", accessorKey: "title" },
            { id: "request_type", label: "Type", accessorKey: "request_type", fieldType: "status" },
            { id: "priority", label: "Priority", accessorKey: "priority", fieldType: "status" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── work_order ───

export const WORK_ORDERS_PAGE: ListPageConfig = {
    entityKey: "work_order",
    description: "Maintenance and service work orders",
    icon: HardHat,
    createConfig: CREATE_WORK_ORDER_CONFIG,
    searchKeys: ["title", "description"],
    columns: [
        { id: "title", header: "Work Order", accessorKey: "title" },
        {
            id: "work_order_type",
            header: "Type",
            accessorKey: "work_order_type",
            fieldType: "status",
        },
        { id: "priority", header: "Priority", accessorKey: "priority", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "due_date", header: "Due", accessorKey: "due_date", fieldType: "date" },
    ],
    views: ["table", "board"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "title",
        cardSubtitleKey: "priority",
    },
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Work Order", accessorKey: "title" },
            {
                id: "work_order_type",
                label: "Type",
                accessorKey: "work_order_type",
                fieldType: "status",
            },
            { id: "priority", label: "Priority", accessorKey: "priority", fieldType: "status" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "due_date", label: "Due", accessorKey: "due_date", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── incident ───

export const INCIDENTS_PAGE: ListPageConfig = {
    entityKey: "incident",
    description: "Track and resolve safety, operational, and guest incidents",
    icon: ShieldAlert,
    createConfig: CREATE_INCIDENT_CONFIG,
    searchKeys: ["title", "description"],
    columns: [
        { id: "title", header: "Incident", accessorKey: "title" },
        { id: "incident_type", header: "Type", accessorKey: "incident_type", fieldType: "status" },
        { id: "severity", header: "Severity", accessorKey: "severity", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "reported_at", header: "Reported", accessorKey: "reported_at", fieldType: "date" },
    ],
    views: ["table", "board"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "title",
        cardSubtitleKey: "severity",
    },
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Incident", accessorKey: "title" },
            {
                id: "incident_type",
                label: "Type",
                accessorKey: "incident_type",
                fieldType: "status",
            },
            { id: "severity", label: "Severity", accessorKey: "severity", fieldType: "status" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "reported_at", label: "Reported", accessorKey: "reported_at", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── insurance_policy ───

export const INSURANCE_POLICIES_PAGE: ListPageConfig = {
    entityKey: "insurance_policy",
    description: "Active insurance policies and coverage tracking",
    icon: Shield,
    createConfig: CREATE_INSURANCE_POLICY_CONFIG,
    searchKeys: ["policy_number", "provider", "coverage_type"],
    columns: [
        { id: "policy_number", header: "Policy #", accessorKey: "policy_number" },
        { id: "provider", header: "Provider", accessorKey: "provider" },
        {
            id: "coverage_type",
            header: "Coverage",
            accessorKey: "coverage_type",
            fieldType: "status",
        },
        { id: "premium", header: "Premium", accessorKey: "premium", fieldType: "currency" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "expiry_date", header: "Expires", accessorKey: "expiry_date", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "policy_number", label: "Policy #", accessorKey: "policy_number" },
            { id: "provider", label: "Provider", accessorKey: "provider" },
            {
                id: "coverage_type",
                label: "Coverage",
                accessorKey: "coverage_type",
                fieldType: "status",
            },
            { id: "premium", label: "Premium", accessorKey: "premium", fieldType: "currency" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── permit ───

export const PERMITS_PAGE: ListPageConfig = {
    entityKey: "permit",
    description: "Permits, licenses, and regulatory approvals",
    icon: ClipboardCheck,
    createConfig: CREATE_PERMIT_CONFIG,
    searchKeys: ["title", "permit_type", "issuing_authority"],
    columns: [
        { id: "title", header: "Permit", accessorKey: "title" },
        { id: "permit_type", header: "Type", accessorKey: "permit_type", fieldType: "status" },
        { id: "issuing_authority", header: "Authority", accessorKey: "issuing_authority" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "expiry_date", header: "Expires", accessorKey: "expiry_date", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Permit", accessorKey: "title" },
            { id: "permit_type", label: "Type", accessorKey: "permit_type", fieldType: "status" },
            { id: "issuing_authority", label: "Authority", accessorKey: "issuing_authority" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "expiry_date", label: "Expires", accessorKey: "expiry_date", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ═══════════════════════════════════════════════════════════════
// PROCUREMENT
// ═══════════════════════════════════════════════════════════════

// ─── purchase_order ───

export const PURCHASE_ORDERS_PAGE: ListPageConfig = {
    entityKey: "purchase_order",
    description: "Track purchase orders from creation to fulfillment",
    icon: FileText,
    createConfig: CREATE_PURCHASE_ORDER_CONFIG,
    searchKeys: ["po_number", "vendor_name"],
    columns: [
        { id: "po_number", header: "PO #", accessorKey: "po_number" },
        { id: "vendor_name", header: "Vendor", accessorKey: "vendor_name" },
        {
            id: "total_amount",
            header: "Amount",
            accessorKey: "total_amount",
            fieldType: "currency",
        },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        {
            id: "delivery_date",
            header: "Delivery",
            accessorKey: "delivery_date",
            fieldType: "date",
        },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "board"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "po_number",
        cardSubtitleKey: "vendor_name",
    },
    quickViewConfig: {
        previewFields: [
            { id: "po_number", label: "PO #", accessorKey: "po_number" },
            { id: "vendor_name", label: "Vendor", accessorKey: "vendor_name" },
            {
                id: "total_amount",
                label: "Amount",
                accessorKey: "total_amount",
                fieldType: "currency",
            },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            {
                id: "delivery_date",
                label: "Delivery",
                accessorKey: "delivery_date",
                fieldType: "date",
            },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── purchase_requisition ───

export const PURCHASE_REQUISITIONS_PAGE: ListPageConfig = {
    entityKey: "purchase_requisition",
    description: "Internal purchase requests pending approval",
    icon: FileText,
    createConfig: CREATE_PURCHASE_REQUISITION_CONFIG,
    searchKeys: ["title", "requester_name"],
    columns: [
        { id: "title", header: "Requisition", accessorKey: "title" },
        { id: "requester_name", header: "Requester", accessorKey: "requester_name" },
        {
            id: "total_amount",
            header: "Amount",
            accessorKey: "total_amount",
            fieldType: "currency",
        },
        { id: "priority", header: "Priority", accessorKey: "priority", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "board"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "title",
        cardSubtitleKey: "requester_name",
    },
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Requisition", accessorKey: "title" },
            { id: "requester_name", label: "Requester", accessorKey: "requester_name" },
            {
                id: "total_amount",
                label: "Amount",
                accessorKey: "total_amount",
                fieldType: "currency",
            },
            { id: "priority", label: "Priority", accessorKey: "priority", fieldType: "status" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ═══════════════════════════════════════════════════════════════
// PEOPLE / HR
// ═══════════════════════════════════════════════════════════════

// ─── people (user_profiles) ───

export const PEOPLE_PAGE: ListPageConfig = {
    entityKey: "profile",
    description: "Team members, contractors, and collaborators",
    icon: Users,
    createConfig: CREATE_PERSON_CONFIG,
    searchKeys: ["display_name", "email", "department"],
    columns: [
        { id: "display_name", header: "Name", accessorKey: "display_name" },
        { id: "email", header: "Email", accessorKey: "email" },
        { id: "department", header: "Department", accessorKey: "department" },
        { id: "role", header: "Role", accessorKey: "role", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
    ],
    views: ["table", "cards"],
    defaultView: "table",
    cardConfig: {
        titleKey: "display_name",
        subtitleKey: "department",
        statusKey: "status",
    },
    quickViewConfig: {
        previewFields: [
            { id: "display_name", label: "Name", accessorKey: "display_name" },
            { id: "email", label: "Email", accessorKey: "email" },
            { id: "department", label: "Department", accessorKey: "department" },
            { id: "role", label: "Role", accessorKey: "role", fieldType: "status" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── teams ───

export const TEAMS_PAGE: ListPageConfig = {
    entityKey: "team",
    description: "Organizational teams and their members",
    icon: Users,
    createConfig: CREATE_TEAM_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Team", accessorKey: "name" },
        { id: "department", header: "Department", accessorKey: "department" },
        { id: "member_count", header: "Members", accessorKey: "member_count" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "cards"],
    defaultView: "table",
    cardConfig: {
        titleKey: "name",
        subtitleKey: "department",
        statusKey: "status",
    },
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Team", accessorKey: "name" },
            { id: "department", label: "Department", accessorKey: "department" },
            { id: "member_count", label: "Members", accessorKey: "member_count" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── workforce (worker_profiles) ───

export const WORKFORCE_PAGE: ListPageConfig = {
    entityKey: "worker_profile",
    description: "Manage workers, contractors, and freelance profiles",
    icon: HardHat,
    createConfig: CREATE_WORKFORCE_CONFIG,
    searchKeys: ["display_name", "email", "skills"],
    columns: [
        { id: "display_name", header: "Name", accessorKey: "display_name" },
        { id: "worker_type", header: "Type", accessorKey: "worker_type", fieldType: "status" },
        { id: "department", header: "Department", accessorKey: "department" },
        { id: "hourly_rate", header: "Rate", accessorKey: "hourly_rate", fieldType: "currency" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
    ],
    views: ["table", "cards"],
    defaultView: "table",
    cardConfig: {
        titleKey: "display_name",
        subtitleKey: "worker_type",
        statusKey: "status",
    },
    quickViewConfig: {
        previewFields: [
            { id: "display_name", label: "Name", accessorKey: "display_name" },
            { id: "worker_type", label: "Type", accessorKey: "worker_type", fieldType: "status" },
            { id: "department", label: "Department", accessorKey: "department" },
            { id: "hourly_rate", label: "Rate", accessorKey: "hourly_rate", fieldType: "currency" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ═══════════════════════════════════════════════════════════════
// DOCUMENTS / KNOWLEDGE
// ═══════════════════════════════════════════════════════════════

// ─── document ───

export const DOCUMENTS_PAGE: ListPageConfig = {
    entityKey: "document",
    description: "Documents, files, and attachments across all entities",
    icon: FileText,
    createConfig: CREATE_DOCUMENT_CONFIG,
    searchKeys: ["title", "description", "document_type"],
    columns: [
        { id: "title", header: "Document", accessorKey: "title" },
        { id: "document_type", header: "Type", accessorKey: "document_type", fieldType: "status" },
        { id: "file_size", header: "Size", accessorKey: "file_size" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "updated_at", header: "Updated", accessorKey: "updated_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Document", accessorKey: "title" },
            {
                id: "document_type",
                label: "Type",
                accessorKey: "document_type",
                fieldType: "status",
            },
            { id: "file_size", label: "Size", accessorKey: "file_size" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── knowledge_base ───

export const KNOWLEDGE_BASE_PAGE: ListPageConfig = {
    entityKey: "knowledge_base_article",
    description: "Internal knowledge base articles and documentation",
    icon: BookOpen,
    createConfig: CREATE_KB_ARTICLE_CONFIG,
    searchKeys: ["title", "content", "tags"],
    columns: [
        { id: "title", header: "Article", accessorKey: "title" },
        { id: "category", header: "Category", accessorKey: "category", fieldType: "status" },
        { id: "author_name", header: "Author", accessorKey: "author_name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "updated_at", header: "Updated", accessorKey: "updated_at", fieldType: "date" },
    ],
    views: ["table", "cards"],
    defaultView: "table",
    cardConfig: {
        titleKey: "title",
        subtitleKey: "category",
        statusKey: "status",
    },
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Article", accessorKey: "title" },
            { id: "category", label: "Category", accessorKey: "category", fieldType: "status" },
            { id: "author_name", label: "Author", accessorKey: "author_name" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── sop ───

export const SOPS_PAGE: ListPageConfig = {
    entityKey: "sop",
    description: "Standard operating procedures and process documentation",
    icon: BookOpen,
    createConfig: CREATE_SOP_CONFIG,
    searchKeys: ["title", "description", "category"],
    columns: [
        { id: "title", header: "SOP", accessorKey: "title" },
        { id: "category", header: "Category", accessorKey: "category", fieldType: "status" },
        { id: "version", header: "Version", accessorKey: "version" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "updated_at", header: "Updated", accessorKey: "updated_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "SOP", accessorKey: "title" },
            { id: "category", label: "Category", accessorKey: "category", fieldType: "status" },
            { id: "version", label: "Version", accessorKey: "version" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── template ───

export const TEMPLATES_PAGE: ListPageConfig = {
    entityKey: "document_template",
    description: "Reusable document templates and forms",
    icon: FileText,
    createConfig: CREATE_TEMPLATE_CONFIG,
    searchKeys: ["name", "description", "template_type"],
    columns: [
        { id: "name", header: "Template", accessorKey: "name" },
        { id: "template_type", header: "Type", accessorKey: "template_type", fieldType: "status" },
        { id: "usage_count", header: "Used", accessorKey: "usage_count" },
        { id: "is_active", header: "Active", accessorKey: "is_active", fieldType: "status" },
        { id: "updated_at", header: "Updated", accessorKey: "updated_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Template", accessorKey: "name" },
            {
                id: "template_type",
                label: "Type",
                accessorKey: "template_type",
                fieldType: "status",
            },
            { id: "usage_count", label: "Used", accessorKey: "usage_count" },
            { id: "is_active", label: "Active", accessorKey: "is_active", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── tech_sheet ───

export const TECH_SHEETS_PAGE: ListPageConfig = {
    entityKey: "tech_sheet",
    description: "Technical specification sheets for equipment and production",
    icon: Settings,
    createConfig: CREATE_TECH_SHEET_CONFIG,
    searchKeys: ["title", "equipment_type"],
    columns: [
        { id: "title", header: "Tech Sheet", accessorKey: "title" },
        {
            id: "equipment_type",
            header: "Equipment",
            accessorKey: "equipment_type",
            fieldType: "status",
        },
        { id: "version", header: "Version", accessorKey: "version" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "updated_at", header: "Updated", accessorKey: "updated_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Tech Sheet", accessorKey: "title" },
            {
                id: "equipment_type",
                label: "Equipment",
                accessorKey: "equipment_type",
                fieldType: "status",
            },
            { id: "version", label: "Version", accessorKey: "version" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── rate_card ───

export const RATE_CARDS_PAGE: ListPageConfig = {
    entityKey: "rate_card",
    description: "Pricing rate cards for services, equipment, and labor",
    icon: DollarSign,
    createConfig: CREATE_RATE_CARD_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Rate Card", accessorKey: "name" },
        { id: "rate_type", header: "Type", accessorKey: "rate_type", fieldType: "status" },
        { id: "base_rate", header: "Base Rate", accessorKey: "base_rate", fieldType: "currency" },
        { id: "is_active", header: "Active", accessorKey: "is_active", fieldType: "status" },
        {
            id: "effective_date",
            header: "Effective",
            accessorKey: "effective_date",
            fieldType: "date",
        },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Rate Card", accessorKey: "name" },
            { id: "rate_type", label: "Type", accessorKey: "rate_type", fieldType: "status" },
            {
                id: "base_rate",
                label: "Base Rate",
                accessorKey: "base_rate",
                fieldType: "currency",
            },
            { id: "is_active", label: "Active", accessorKey: "is_active", fieldType: "status" },
            {
                id: "effective_date",
                label: "Effective",
                accessorKey: "effective_date",
                fieldType: "date",
            },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── saved_view ───

export const SAVED_VIEWS_PAGE: ListPageConfig = {
    entityKey: "saved_view",
    description: "Custom saved views and filters",
    icon: FolderKanban,
    createConfig: CREATE_SAVED_VIEW_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "View", accessorKey: "name" },
        { id: "entity_type", header: "Entity", accessorKey: "entity_type", fieldType: "status" },
        { id: "view_type", header: "Type", accessorKey: "view_type", fieldType: "status" },
        { id: "is_shared", header: "Shared", accessorKey: "is_shared", fieldType: "status" },
        { id: "updated_at", header: "Updated", accessorKey: "updated_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "View", accessorKey: "name" },
            { id: "entity_type", label: "Entity", accessorKey: "entity_type", fieldType: "status" },
            { id: "view_type", label: "Type", accessorKey: "view_type", fieldType: "status" },
            { id: "is_shared", label: "Shared", accessorKey: "is_shared", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ═══════════════════════════════════════════════════════════════
// EVENTS / PRODUCTION
// ═══════════════════════════════════════════════════════════════

// ─── event ───

export const EVENTS_PAGE: ListPageConfig = {
    entityKey: "live_event",
    description: "Plan, manage, and execute live events and productions",
    icon: CalendarDays,
    createConfig: CREATE_EVENT_CONFIG,
    searchKeys: ["name", "venue", "description"],
    columns: [
        { id: "name", header: "Event", accessorKey: "name" },
        { id: "event_type", header: "Type", accessorKey: "event_type", fieldType: "status" },
        { id: "venue", header: "Venue", accessorKey: "venue" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "start_time", header: "Start", accessorKey: "start_time", fieldType: "date" },
        { id: "end_time", header: "End", accessorKey: "end_time", fieldType: "date" },
    ],
    views: ["table", "calendar", "board"],
    defaultView: "table",
    calendarConfig: {
        titleKey: "name",
        dateKey: "start_time",
        colorKey: "status",
    },
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "name",
        cardSubtitleKey: "venue",
    },
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Event", accessorKey: "name" },
            { id: "event_type", label: "Type", accessorKey: "event_type", fieldType: "status" },
            { id: "venue", label: "Venue", accessorKey: "venue" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "start_time", label: "Start", accessorKey: "start_time", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── ip_right ───

export const IP_RIGHTS_PAGE: ListPageConfig = {
    entityKey: "ip_right",
    description: "Intellectual property rights and licensing agreements",
    icon: PenTool,
    createConfig: CREATE_IP_RIGHT_CONFIG,
    searchKeys: ["title", "description"],
    columns: [
        { id: "title", header: "IP Right", accessorKey: "title" },
        { id: "right_type", header: "Type", accessorKey: "right_type", fieldType: "status" },
        { id: "owner", header: "Owner", accessorKey: "owner" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "expiry_date", header: "Expires", accessorKey: "expiry_date", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "IP Right", accessorKey: "title" },
            { id: "right_type", label: "Type", accessorKey: "right_type", fieldType: "status" },
            { id: "owner", label: "Owner", accessorKey: "owner" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "expiry_date", label: "Expires", accessorKey: "expiry_date", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ═══════════════════════════════════════════════════════════════
// SYSTEM / ADMIN
// ═══════════════════════════════════════════════════════════════

// ─── integration ───

export const INTEGRATIONS_PAGE: ListPageConfig = {
    entityKey: "integration",
    description: "Third-party service integrations and API connections",
    icon: Zap,
    createConfig: CREATE_INTEGRATION_CONFIG,
    searchKeys: ["name", "provider"],
    columns: [
        { id: "name", header: "Integration", accessorKey: "name" },
        { id: "provider", header: "Provider", accessorKey: "provider" },
        {
            id: "integration_type",
            header: "Type",
            accessorKey: "integration_type",
            fieldType: "status",
        },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "last_sync_at", header: "Last Sync", accessorKey: "last_sync_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Integration", accessorKey: "name" },
            { id: "provider", label: "Provider", accessorKey: "provider" },
            {
                id: "integration_type",
                label: "Type",
                accessorKey: "integration_type",
                fieldType: "status",
            },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            {
                id: "last_sync_at",
                label: "Last Sync",
                accessorKey: "last_sync_at",
                fieldType: "date",
            },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── engineering_approval ───

export const ENGINEERING_APPROVALS_PAGE: ListPageConfig = {
    entityKey: "engineering_approval",
    description: "Engineering review and approval workflow",
    icon: CheckCircle2,
    createConfig: CREATE_ENGINEERING_APPROVAL_CONFIG,
    searchKeys: ["title", "reviewer_name"],
    columns: [
        { id: "title", header: "Approval", accessorKey: "title" },
        { id: "reviewer_name", header: "Reviewer", accessorKey: "reviewer_name" },
        { id: "approval_type", header: "Type", accessorKey: "approval_type", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "board"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "title",
        cardSubtitleKey: "reviewer_name",
    },
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Approval", accessorKey: "title" },
            { id: "reviewer_name", label: "Reviewer", accessorKey: "reviewer_name" },
            {
                id: "approval_type",
                label: "Type",
                accessorKey: "approval_type",
                fieldType: "status",
            },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── quality_check ───

export const QUALITY_CHECKS_PAGE: ListPageConfig = {
    entityKey: "quality_check",
    description: "Quality assurance inspections and checks",
    icon: ClipboardCheck,
    createConfig: CREATE_QUALITY_CHECK_CONFIG,
    searchKeys: ["title", "inspector_name"],
    columns: [
        { id: "title", header: "Check", accessorKey: "title" },
        { id: "check_type", header: "Type", accessorKey: "check_type", fieldType: "status" },
        { id: "inspector_name", header: "Inspector", accessorKey: "inspector_name" },
        { id: "result", header: "Result", accessorKey: "result", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "checked_at", header: "Checked", accessorKey: "checked_at", fieldType: "date" },
    ],
    views: ["table", "board"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "result",
        cardTitleKey: "title",
        cardSubtitleKey: "inspector_name",
    },
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Check", accessorKey: "title" },
            { id: "check_type", label: "Type", accessorKey: "check_type", fieldType: "status" },
            { id: "inspector_name", label: "Inspector", accessorKey: "inspector_name" },
            { id: "result", label: "Result", accessorKey: "result", fieldType: "status" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── vendor_review ───

export const VENDOR_REVIEWS_PAGE: ListPageConfig = {
    entityKey: "worker_review",
    description: "Vendor performance reviews and ratings",
    icon: Star,
    createConfig: CREATE_VENDOR_REVIEW_CONFIG,
    searchKeys: ["vendor_name", "reviewer_name"],
    columns: [
        { id: "vendor_name", header: "Vendor", accessorKey: "vendor_name" },
        { id: "reviewer_name", header: "Reviewer", accessorKey: "reviewer_name" },
        { id: "rating", header: "Rating", accessorKey: "rating" },
        { id: "review_type", header: "Type", accessorKey: "review_type", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "vendor_name", label: "Vendor", accessorKey: "vendor_name" },
            { id: "reviewer_name", label: "Reviewer", accessorKey: "reviewer_name" },
            { id: "rating", label: "Rating", accessorKey: "rating" },
            { id: "review_type", label: "Type", accessorKey: "review_type", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── accounts (stakeholder CRM) ───

export const ACCOUNTS_PAGE: ListPageConfig = {
    entityKey: "stakeholder",
    description: "Client and stakeholder relationship management",
    icon: Users,
    createConfig: CREATE_ACCOUNT_CONFIG,
    searchKeys: ["name", "email", "company"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "email", header: "Email", accessorKey: "email" },
        { id: "company", header: "Company", accessorKey: "company" },
        { id: "role", header: "Role", accessorKey: "role" },
        { id: "type", header: "Type", accessorKey: "type", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "cards"],
    defaultView: "table",
    cardConfig: {
        titleKey: "name",
        subtitleKey: "company",
        statusKey: "type",
    },
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Name", accessorKey: "name" },
            { id: "email", label: "Email", accessorKey: "email" },
            { id: "company", label: "Company", accessorKey: "company" },
            { id: "role", label: "Role", accessorKey: "role" },
            { id: "type", label: "Type", accessorKey: "type", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── pipeline (deals alternate view) ───

export const PIPELINE_PAGE: ListPageConfig = {
    entityKey: "deal",
    description: "Manage your sales pipeline and deal flow",
    icon: Calendar,
    createConfig: CREATE_DEAL_CONFIG,
    searchKeys: ["name", "company_name"],
    columns: [
        { id: "name", header: "Deal", accessorKey: "name" },
        { id: "stage", header: "Stage", accessorKey: "stage", fieldType: "status" },
        { id: "value", header: "Value", accessorKey: "value", fieldType: "currency" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Deal", accessorKey: "name" },
            { id: "stage", label: "Stage", accessorKey: "stage", fieldType: "status" },
            { id: "value", label: "Value", accessorKey: "value", fieldType: "currency" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── feature_flags ───

export const FEATURE_FLAGS_PAGE: ListPageConfig = {
    entityKey: "feature_flag",
    description: "Control feature rollout across organizations, roles, and users",
    icon: Flag,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Name", accessorKey: "name" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── vendor_risk ───

export const VENDOR_RISK_PAGE: ListPageConfig = {
    entityKey: "risk_assessment",
    description:
        "Composite risk scoring across financial, compliance, performance, and operational dimensions",
    icon: AlertTriangle,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Name", accessorKey: "name" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── vendor_onboarding ───

export const VENDOR_ONBOARDING_PAGE: ListPageConfig = {
    entityKey: "vendor_onboarding",
    description:
        "Pipeline view of vendor/subcontractor onboarding with compliance document tracking",
    icon: CheckCircle2,
    createConfig: CREATE_VENDOR_ONBOARDING_CONFIG,
    searchKeys: ["vendor", "contact", "type"],
    columns: [
        { id: "vendor", header: "Vendor", accessorKey: "vendor" },
        { id: "type", header: "Type", accessorKey: "type", fieldType: "status" },
        { id: "contact", header: "Contact", accessorKey: "contact" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "documents", header: "Documents", accessorKey: "documents" },
        { id: "invited", header: "Invited", accessorKey: "invited", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "vendor", label: "Vendor", accessorKey: "vendor" },
            { id: "type", label: "Type", accessorKey: "type", fieldType: "status" },
            { id: "contact", label: "Contact", accessorKey: "contact" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "documents", label: "Documents", accessorKey: "documents" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ═══════════════════════════════════════════════════════════════
// BESPOKE ENTITY CONFIGS (centralized base for pages with custom UI)
// ═══════════════════════════════════════════════════════════════

// ─── activation ───

export const ACTIVATIONS_PAGE: ListPageConfig = {
    entityKey: "activation",
    description: "Manage brand activations, installations, and experiences",
    icon: Sparkles,
    createConfig: CREATE_ACTIVATION_CONFIG,
    searchKeys: ["name", "type", "zone"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "type", header: "Type", accessorKey: "type" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "zone", header: "Zone", accessorKey: "zone" },
        { id: "expected_footfall", header: "Footfall", accessorKey: "expected_footfall" },
        { id: "budget", header: "Budget", accessorKey: "budget", fieldType: "currency" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Name", accessorKey: "name" },
            { id: "type", label: "Type", accessorKey: "type" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "zone", label: "Zone", accessorKey: "zone" },
            { id: "expected_footfall", label: "Footfall", accessorKey: "expected_footfall" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── asset ───

export const ASSETS_PAGE: ListPageConfig = {
    entityKey: "asset",
    description: "Physical and digital asset inventory with tracking and maintenance",
    icon: Package,
    createConfig: CREATE_ASSET_CONFIG,
    searchKeys: ["name", "barcode", "category", "serial_number"],
    columns: [
        { id: "name", header: "Asset", accessorKey: "name" },
        { id: "barcode", header: "Barcode", accessorKey: "barcode" },
        { id: "category", header: "Category", accessorKey: "category" },
        { id: "condition", header: "Condition", accessorKey: "condition", fieldType: "status" },
        { id: "location", header: "Location", accessorKey: "location" },
        {
            id: "purchase_cost",
            header: "Cost",
            accessorKey: "purchase_cost",
            fieldType: "currency",
        },
        {
            id: "current_value",
            header: "Value",
            accessorKey: "current_value",
            fieldType: "currency",
        },
        { id: "is_checked_out", header: "Checked Out", accessorKey: "is_checked_out" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Asset", accessorKey: "name" },
            { id: "barcode", label: "Barcode", accessorKey: "barcode" },
            { id: "category", label: "Category", accessorKey: "category" },
            { id: "condition", label: "Condition", accessorKey: "condition", fieldType: "status" },
            { id: "location", label: "Location", accessorKey: "location" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── credential ───

export const CREDENTIALS_PAGE: ListPageConfig = {
    entityKey: "credential",
    description: "Credential types, inventory pools, and assignment tracking",
    icon: Ticket,
    createConfig: CREATE_CREDENTIAL_CONFIG,
    searchKeys: ["name", "category", "format"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "category", header: "Category", accessorKey: "category" },
        { id: "format", header: "Format", accessorKey: "format" },
        { id: "tier_level", header: "Tier", accessorKey: "tier_level" },
        { id: "is_active", header: "Active", accessorKey: "is_active" },
        { id: "default_zone_access", header: "Zone Access", accessorKey: "default_zone_access" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Name", accessorKey: "name" },
            { id: "category", label: "Category", accessorKey: "category" },
            { id: "format", label: "Format", accessorKey: "format" },
            { id: "tier_level", label: "Tier", accessorKey: "tier_level" },
            { id: "is_active", label: "Active", accessorKey: "is_active" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── crew_member ───

export const CREW_PAGE: ListPageConfig = {
    entityKey: "crew_member",
    description: "Crew roster with roles, certifications, and availability",
    icon: HardHat,
    searchKeys: ["name", "role", "department", "email"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "role", header: "Role", accessorKey: "role" },
        { id: "department", header: "Department", accessorKey: "department" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "phone", header: "Phone", accessorKey: "phone" },
        { id: "email", header: "Email", accessorKey: "email" },
        { id: "certifications_valid", header: "Certs Valid", accessorKey: "certifications_valid" },
        { id: "daily_rate", header: "Day Rate", accessorKey: "daily_rate", fieldType: "currency" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Name", accessorKey: "name" },
            { id: "role", label: "Role", accessorKey: "role" },
            { id: "department", label: "Department", accessorKey: "department" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "phone", label: "Phone", accessorKey: "phone" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── lead ───

export const LEADS_PAGE: ListPageConfig = {
    entityKey: "lead",
    description: "Manage incoming leads and opportunities",
    icon: Users,
    createConfig: CREATE_LEAD_CONFIG,
    searchKeys: ["first_name", "last_name", "email", "company"],
    columns: [
        { id: "first_name", header: "First Name", accessorKey: "first_name" },
        { id: "last_name", header: "Last Name", accessorKey: "last_name" },
        { id: "company", header: "Company", accessorKey: "company" },
        { id: "email", header: "Email", accessorKey: "email" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "score", header: "Score", accessorKey: "score" },
        { id: "source", header: "Source", accessorKey: "source" },
        { id: "budget_range", header: "Budget", accessorKey: "budget_range" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "first_name", label: "First Name", accessorKey: "first_name" },
            { id: "last_name", label: "Last Name", accessorKey: "last_name" },
            { id: "company", label: "Company", accessorKey: "company" },
            { id: "email", label: "Email", accessorKey: "email" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── project ───

export const PROJECTS_PAGE: ListPageConfig = {
    entityKey: "project",
    description: "All projects with phase tracking, budgets, and team assignments",
    icon: FolderOpen,
    createConfig: CREATE_PROJECT_CONFIG,
    searchKeys: ["name", "client_name", "manager_name"],
    columns: [
        { id: "name", header: "Project", accessorKey: "name" },
        { id: "client_name", header: "Client", accessorKey: "client_name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "phase", header: "Phase", accessorKey: "phase", fieldType: "status" },
        { id: "manager_name", header: "Manager", accessorKey: "manager_name" },
        { id: "budget", header: "Budget", accessorKey: "budget", fieldType: "currency" },
        { id: "spent", header: "Spent", accessorKey: "spent", fieldType: "currency" },
        { id: "start_date", header: "Start", accessorKey: "start_date", fieldType: "date" },
        { id: "end_date", header: "End", accessorKey: "end_date", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Project", accessorKey: "name" },
            { id: "client_name", label: "Client", accessorKey: "client_name" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "phase", label: "Phase", accessorKey: "phase", fieldType: "status" },
            { id: "manager_name", label: "Manager", accessorKey: "manager_name" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── procurement (purchase_requisition view) ───

export const PROCUREMENT_PAGE: ListPageConfig = {
    entityKey: "purchase_requisition",
    description: "Procurement pipeline from requisitions through purchase orders to goods receipt",
    icon: ShoppingCart,
    createConfig: CREATE_PURCHASE_REQUISITION_CONFIG,
    searchKeys: ["title", "requester", "vendor_name"],
    columns: [
        { id: "title", header: "Title", accessorKey: "title" },
        { id: "requester", header: "Requester", accessorKey: "requester" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "priority", header: "Priority", accessorKey: "priority", fieldType: "priority" },
        { id: "vendor_name", header: "Vendor", accessorKey: "vendor_name" },
        {
            id: "total_amount",
            header: "Amount",
            accessorKey: "total_amount",
            fieldType: "currency",
        },
        { id: "needed_by", header: "Needed By", accessorKey: "needed_by", fieldType: "date" },
        { id: "created_at", header: "Submitted", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Title", accessorKey: "title" },
            { id: "requester", label: "Requester", accessorKey: "requester" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "priority", label: "Priority", accessorKey: "priority", fieldType: "priority" },
            { id: "vendor_name", label: "Vendor", accessorKey: "vendor_name" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── shipment ───

export const SHIPMENTS_PAGE: ListPageConfig = {
    entityKey: "shipment",
    description: "Track and manage logistics and freight",
    icon: Truck,
    createConfig: CREATE_SHIPMENT_CONFIG,
    searchKeys: ["number", "description", "carrier_name"],
    columns: [
        { id: "number", header: "Number", accessorKey: "number" },
        { id: "description", header: "Description", accessorKey: "description" },
        { id: "type", header: "Type", accessorKey: "type" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "priority", header: "Priority", accessorKey: "priority", fieldType: "priority" },
        { id: "carrier_name", header: "Carrier", accessorKey: "carrier_name" },
        { id: "pickup_date", header: "Pickup", accessorKey: "pickup_date", fieldType: "date" },
        { id: "total_pieces", header: "Pieces", accessorKey: "total_pieces" },
        { id: "cost", header: "Cost", accessorKey: "cost", fieldType: "currency" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "number", label: "Number", accessorKey: "number" },
            { id: "description", label: "Description", accessorKey: "description" },
            { id: "type", label: "Type", accessorKey: "type" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "priority", label: "Priority", accessorKey: "priority", fieldType: "priority" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── survey ───

export const SURVEYS_PAGE: ListPageConfig = {
    entityKey: "survey",
    description: "Create and manage surveys with response tracking and analytics",
    icon: ClipboardCheck,
    createConfig: CREATE_SURVEY_CONFIG,
    searchKeys: ["title", "description", "type"],
    columns: [
        { id: "title", header: "Title", accessorKey: "title" },
        { id: "type", header: "Type", accessorKey: "type" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "response_count", header: "Responses", accessorKey: "response_count" },
        { id: "target_audience", header: "Audience", accessorKey: "target_audience" },
        { id: "start_date", header: "Start", accessorKey: "start_date", fieldType: "date" },
        { id: "end_date", header: "End", accessorKey: "end_date", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Title", accessorKey: "title" },
            { id: "type", label: "Type", accessorKey: "type" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "response_count", label: "Responses", accessorKey: "response_count" },
            { id: "target_audience", label: "Audience", accessorKey: "target_audience" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── task ───

export const TASKS_PAGE: ListPageConfig = {
    entityKey: "task",
    description: "Task management with priority, status, and project assignments",
    icon: CheckCircle2,
    createConfig: CREATE_TASK_CONFIG,
    searchKeys: ["title", "assignee_name", "project_name"],
    columns: [
        { id: "title", header: "Task", accessorKey: "title" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "priority", header: "Priority", accessorKey: "priority", fieldType: "priority" },
        { id: "assignee_name", header: "Assignee", accessorKey: "assignee_name" },
        { id: "project_name", header: "Project", accessorKey: "project_name" },
        { id: "due_date", header: "Due", accessorKey: "due_date", fieldType: "date" },
        {
            id: "material_cost",
            header: "Material Cost",
            accessorKey: "material_cost",
            fieldType: "currency",
        },
        {
            id: "labor_cost",
            header: "Labor Cost",
            accessorKey: "labor_cost",
            fieldType: "currency",
        },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Task", accessorKey: "title" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "priority", label: "Priority", accessorKey: "priority", fieldType: "priority" },
            { id: "assignee_name", label: "Assignee", accessorKey: "assignee_name" },
            { id: "project_name", label: "Project", accessorKey: "project_name" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── vendor ───

export const VENDORS_PAGE: ListPageConfig = {
    entityKey: "vendor",
    description: "Vendor and subcontractor management with compliance and rating tracking",
    icon: Building2,
    createConfig: CREATE_VENDOR_CONFIG,
    searchKeys: ["name", "contact_name", "email", "specialty"],
    columns: [
        { id: "name", header: "Vendor", accessorKey: "name" },
        { id: "contact_name", header: "Contact", accessorKey: "contact_name" },
        { id: "email", header: "Email", accessorKey: "email" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "rating", header: "Rating", accessorKey: "rating" },
        { id: "specialty", header: "Specialty", accessorKey: "specialty" },
        { id: "coi_expiry", header: "COI Expiry", accessorKey: "coi_expiry", fieldType: "date" },
        {
            id: "total_spent",
            header: "Total Spent",
            accessorKey: "total_spent",
            fieldType: "currency",
        },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Vendor", accessorKey: "name" },
            { id: "contact_name", label: "Contact", accessorKey: "contact_name" },
            { id: "email", label: "Email", accessorKey: "email" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "rating", label: "Rating", accessorKey: "rating" },
        ],
        navigable: true,
    },
    exportable: true,
};
