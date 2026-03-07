/**
 * Contracts & Legal — i18n string definitions
 * Covers: contracts, scopes-of-work, compliance, compliance-checklists,
 *         insurance-policies, permits, certifications, clause-library
 */

export const CONTRACTS_STRINGS = {
    // ─── Contracts ─────────────────────────────────────────────
    contracts_title: "Contracts",
    contracts_empty: "No contracts",
    contracts_search: "Search contracts...",
    contracts_create: "New Contract",
    contract_title_field: "Contract Title",
    contract_type: "Type",
    contract_party: "Counterparty",
    contract_status: "Status",
    contract_start_date: "Start Date",
    contract_end_date: "End Date",
    contract_value: "Contract Value",
    contract_auto_renew: "Auto-Renew",
    contract_notes: "Notes",

    // ─── Scopes of Work ───────────────────────────────────────
    sow_title: "Scopes of Work",
    sow_empty: "No scopes of work",
    sow_create: "New Scope of Work",
    sow_name: "SOW Name",
    sow_project: "Project",
    sow_deliverables: "Deliverables",
    sow_timeline: "Timeline",
    sow_budget: "Budget",

    // ─── Compliance ────────────────────────────────────────────
    compliance_title: "Compliance",
    compliance_empty: "No compliance records",
    compliance_status: "Compliance Status",
    compliance_due_date: "Due Date",
    compliance_assigned_to: "Assigned To",

    // ─── Compliance Checklists ─────────────────────────────────
    checklists_title: "Compliance Checklists",
    checklists_empty: "No checklists",
    checklists_create: "New Checklist",
    checklist_name: "Checklist Name",
    checklist_items: "Items",
    checklist_progress: "Progress",
    checklist_completed: "{count} of {total} completed",

    // ─── Insurance Policies ────────────────────────────────────
    insurance_title: "Insurance Policies",
    insurance_empty: "No insurance policies",
    insurance_create: "New Policy",
    insurance_provider: "Provider",
    insurance_type: "Policy Type",
    insurance_coverage: "Coverage Amount",
    insurance_premium: "Premium",
    insurance_expiry: "Expiry Date",

    // ─── Permits ───────────────────────────────────────────────
    permits_title: "Permits",
    permits_empty: "No permits",
    permits_create: "New Permit",
    permit_type: "Permit Type",
    permit_jurisdiction: "Jurisdiction",
    permit_status: "Status",
    permit_expiry: "Expiry Date",
    permit_cost: "Cost",

    // ─── Certifications ───────────────────────────────────────
    certifications_title: "Certifications",
    certifications_empty: "No certifications",
    certifications_create: "New Certification",
    certification_name: "Certification Name",
    certification_issuer: "Issuer",
    certification_expiry: "Expiry Date",
    certification_holder: "Holder",

    // ─── Clause Library ────────────────────────────────────────
    clause_library_title: "Clause Library",
    clause_library_empty: "No clauses",
    clause_library_search: "Search clauses...",
    clause_name: "Clause Name",
    clause_category: "Category",
    clause_text: "Clause Text",

    // ─── Contract Statuses ─────────────────────────────────────
    status_draft: "Draft",
    status_pending_review: "Pending Review",
    status_pending_signature: "Pending Signature",
    status_active: "Active",
    status_expired: "Expired",
    status_terminated: "Terminated",

    // ─── Accessibility ─────────────────────────────────────────
    a11y_contract_list: "Contract list",
    a11y_compliance_status: "{status} compliance status",
    a11y_checklist_progress: "{count} of {total} items completed",
} as const;

export type ContractsStringKey = keyof typeof CONTRACTS_STRINGS;
