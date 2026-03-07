/**
 * Approvals & Workflows — i18n string definitions
 * Covers: approvals, budget-approvals, engineering-approvals, change-orders,
 *         work-orders, service-requests
 */

export const APPROVALS_STRINGS = {
    // ─── Approvals ─────────────────────────────────────────────
    approvals_title: "Approvals",
    approvals_empty: "No pending approvals",
    approvals_search: "Search approvals...",
    approval_title_field: "Title",
    approval_type: "Type",
    approval_status: "Status",
    approval_requested_by: "Requested By",
    approval_assigned_to: "Assigned To",
    approval_priority: "Priority",
    approval_due_date: "Due Date",
    approval_description: "Description",
    approval_approve: "Approve",
    approval_reject: "Reject",
    approval_escalate: "Escalate",
    approval_cancel: "Cancel",
    approval_comments: "Comments",

    // ─── Budget Approvals ──────────────────────────────────────
    budget_approvals_title: "Budget Approvals",
    budget_approvals_empty: "No budget approvals",
    budget_approval_amount: "Amount",
    budget_approval_department: "Department",
    budget_approval_justification: "Justification",

    // ─── Engineering Approvals ─────────────────────────────────
    engineering_approvals_title: "Engineering Approvals",
    engineering_approvals_empty: "No engineering approvals",
    engineering_approval_spec: "Specification",
    engineering_approval_safety: "Safety Review",

    // ─── Change Orders ─────────────────────────────────────────
    change_orders_title: "Change Orders",
    change_orders_empty: "No change orders",
    change_orders_create: "New Change Order",
    change_order_project: "Project",
    change_order_description: "Description",
    change_order_impact: "Cost Impact",
    change_order_schedule_impact: "Schedule Impact",
    change_order_status: "Status",

    // ─── Work Orders ───────────────────────────────────────────
    work_orders_title: "Work Orders",
    work_orders_empty: "No work orders",
    work_orders_create: "New Work Order",
    work_order_title_field: "Title",
    work_order_type: "Type",
    work_order_priority: "Priority",
    work_order_assignee: "Assigned To",
    work_order_due_date: "Due Date",
    work_order_location: "Location",

    // ─── Service Requests ──────────────────────────────────────
    service_requests_title: "Service Requests",
    service_requests_empty: "No service requests",
    service_requests_create: "New Service Request",
    service_request_category: "Category",
    service_request_priority: "Priority",
    service_request_status: "Status",
    service_request_submitted_by: "Submitted By",
    service_request_description: "Description",

    // ─── Workflow Statuses ─────────────────────────────────────
    status_pending: "Pending",
    status_in_progress: "In Progress",
    status_completed: "Completed",
    status_cancelled: "Cancelled",
    status_escalated: "Escalated",
    status_approved: "Approved",
    status_rejected: "Rejected",

    // ─── Accessibility ─────────────────────────────────────────
    a11y_approval_list: "Approval list",
    a11y_approval_actions: "Approval actions for {title}",
    a11y_workflow_status: "Workflow status: {status}",
} as const;

export type ApprovalsStringKey = keyof typeof APPROVALS_STRINGS;
