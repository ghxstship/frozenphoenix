/**
 * Finance & Procurement — i18n string definitions
 * Covers: invoices, expenses, budgets, estimates, purchase-orders, purchase-requisitions,
 *         client-invoices, recurring-invoices, credit-notes, gl-accounts, forecasting
 */

export const FINANCE_STRINGS = {
    // ─── Invoices ──────────────────────────────────────────────
    invoices_title: "Invoices",
    invoices_empty: "No invoices",
    invoices_search: "Search invoices...",
    invoices_create: "New Invoice",
    invoice_number: "Invoice Number",
    invoice_vendor: "Vendor",
    invoice_project: "Project",
    invoice_amount: "Amount",
    invoice_currency: "Currency",
    invoice_status: "Status",
    invoice_issue_date: "Issue Date",
    invoice_due_date: "Due Date",
    invoice_paid_date: "Paid Date",
    invoice_notes: "Notes",

    // ─── Expenses ──────────────────────────────────────────────
    expenses_title: "Expenses",
    expenses_empty: "No expenses",
    expenses_create: "New Expense",
    expense_description: "Description",
    expense_amount: "Amount",
    expense_category: "Category",
    expense_receipt: "Receipt",
    expense_reimbursable: "Reimbursable",
    expense_approved: "Approved",

    // ─── Budgets ───────────────────────────────────────────────
    budgets_title: "Budgets",
    budgets_empty: "No budgets",
    budgets_create: "New Budget",
    budget_name: "Budget Name",
    budget_project: "Project",
    budget_total: "Total Amount",
    budget_spent: "Spent",
    budget_remaining: "Remaining",
    budget_status: "Status",
    budget_line_items: "Line Items",
    budget_approval: "Budget Approval",

    // ─── Estimates ─────────────────────────────────────────────
    estimates_title: "Estimates",
    estimates_empty: "No estimates",
    estimates_create: "New Estimate",
    estimate_title_field: "Title",
    estimate_client: "Client",
    estimate_total: "Total",
    estimate_status: "Status",
    estimate_valid_until: "Valid Until",

    // ─── Purchase Orders ──────────────────────────────────────
    purchase_orders_title: "Purchase Orders",
    purchase_orders_empty: "No purchase orders",
    purchase_orders_create: "New Purchase Order",
    po_number: "PO Number",
    po_vendor: "Vendor",
    po_amount: "Amount",
    po_status: "Status",
    po_delivery_date: "Delivery Date",

    // ─── Purchase Requisitions ─────────────────────────────────
    purchase_requisitions_title: "Purchase Requisitions",
    purchase_requisitions_empty: "No purchase requisitions",
    purchase_requisitions_create: "New Requisition",
    pr_title: "Title",
    pr_requestor: "Requestor",
    pr_amount: "Estimated Amount",
    pr_urgency: "Urgency",
    pr_justification: "Justification",

    // ─── Client Invoices ──────────────────────────────────────
    client_invoices_title: "Client Invoices",
    client_invoices_empty: "No client invoices",
    client_invoices_create: "New Client Invoice",
    client_invoice_client: "Client",
    client_invoice_project: "Project",
    client_invoice_amount: "Amount",

    // ─── Recurring Invoices ────────────────────────────────────
    recurring_invoices_title: "Recurring Invoices",
    recurring_invoices_empty: "No recurring invoices",
    recurring_invoices_create: "New Recurring Invoice",
    recurring_frequency: "Frequency",
    recurring_next_date: "Next Invoice Date",
    recurring_auto_send: "Auto-send",

    // ─── Credit Notes ──────────────────────────────────────────
    credit_notes_title: "Credit Notes",
    credit_notes_empty: "No credit notes",
    credit_notes_create: "New Credit Note",
    credit_note_reason: "Reason",
    credit_note_amount: "Amount",

    // ─── GL Accounts ───────────────────────────────────────────
    gl_accounts_title: "GL Accounts",
    gl_accounts_empty: "No GL accounts",
    gl_account_code: "Account Code",
    gl_account_name: "Account Name",
    gl_account_type: "Type",
    gl_account_balance: "Balance",

    // ─── Forecasting ───────────────────────────────────────────
    forecasting_title: "Forecasting",
    forecasting_empty: "No forecasts",
    forecast_period: "Period",
    forecast_revenue: "Revenue",
    forecast_expenses: "Expenses",
    forecast_margin: "Margin",
    forecast_confidence: "Confidence",

    // ─── Statuses ──────────────────────────────────────────────
    status_draft: "Draft",
    status_pending: "Pending",
    status_approved: "Approved",
    status_sent: "Sent",
    status_partially_paid: "Partially Paid",
    status_paid: "Paid",
    status_overdue: "Overdue",
    status_disputed: "Disputed",
    status_void: "Void",
    status_written_off: "Written Off",

    // ─── Accessibility ─────────────────────────────────────────
    a11y_invoice_list: "Invoice list",
    a11y_budget_chart: "Budget utilization chart",
    a11y_amount_field: "Amount in {currency}",
} as const;

export type FinanceStringKey = keyof typeof FINANCE_STRINGS;
