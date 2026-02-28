/* ═══════════════════════════════════════════════════════════════
   UI VARIANTS — Single Source of Truth for Component Variants
   ═══════════════════════════════════════════════════════════════
   
   3NF Compliance:
   - Variant definitions are atomic (no redundancy)
   - Status/priority mappings defined once, referenced everywhere
   - Components consume these configs, never redefine them
   ═══════════════════════════════════════════════════════════════ */

// ─── Badge Variant Type ───
export type BadgeVariant = "default" | "secondary" | "destructive" | "warning" | "success" | "info" | "outline" | "ghost";

// ─── Status Variant Mappings ───
// Maps domain status values to UI badge variants

export const STATUS_VARIANTS = {
    // Generic status
    active: "success",
    inactive: "ghost",
    pending: "warning",
    completed: "info",
    cancelled: "destructive",
    draft: "ghost",
    
    // Project status
    on_hold: "warning",
    
    // Task status
    backlog: "ghost",
    todo: "secondary",
    in_progress: "info",
    review: "warning",
    done: "success",
    blocked: "destructive",
    
    // Approval status
    approved: "success",
    revision_requested: "warning",
    overdue: "destructive",
    rejected: "destructive",
    
    // Vendor status
    suspended: "destructive",
    
    // Invoice/PO status
    issued: "info",
    received: "success",
    matched: "success",
    disputed: "destructive",
    paid: "success",
    partially_paid: "warning",
    void: "ghost",
    
    // Crew status
    available: "success",
    assigned: "info",
    unavailable: "ghost",
    
    // Vehicle status
    in_transit: "info",
    loading: "warning",
    maintenance: "destructive",
    
    // Shift status
    scheduled: "info",
    checked_in: "success",
    checked_out: "ghost",
    no_show: "destructive",
    
    // Deck status
    ready: "success",
    presented: "info",
    
    // Case study status
    published: "success",
    
    // Estimate/Proposal status
    sent: "info",
    viewed: "info",
    accepted: "success",
    expired: "destructive",
    converted: "success",
    
    // Document status
    pending_review: "warning",
    archived: "ghost",
    
    // Work order status
    posted: "info",
    bidding: "info",
    awarded: "success",
    verified: "success",
    invoiced: "success",
    
    // Dispatch status
    unassigned: "default",
    offered: "info",
    declined: "destructive",
    en_route: "warning",
    on_site: "warning",
    
    // Service request status
    acknowledged: "info",
    assessment_scheduled: "warning",
    quoted: "info",
    
    // Compliance status
    not_submitted: "default",
    expiring_soon: "warning",
    
    // Inventory status
    in_stock: "success",
    low_stock: "warning",
    out_of_stock: "destructive",
    on_order: "info",
    
    // Checklist status
    not_started: "default",
    failed: "destructive",
    skipped: "info",
    
    // Expense status
    reimbursed: "success",
    
    // Leave status
    taken: "info",
    
    // Time entry status
    submitted: "warning",
    
    // Recurring invoice status
    paused: "warning",
    
    // SOW status
    pending_approval: "warning",
    
    // Lead status
    new: "info",
    contacted: "secondary",
    qualified: "success",
    proposal_sent: "warning",
    negotiating: "warning",
    won: "success",
    lost: "destructive",
    nurturing: "secondary",
    
    // Warehouse status
    full: "destructive",
    decommissioned: "ghost",
    
    // Credit note status
    applied: "success",
    
    // Production phases / lifecycle
    booked: "info",
    build: "info",
    confirmed: "success",
    design: "info",
    fabricating: "warning",
    investigating: "warning",
    ordered: "info",
    planned: "secondary",
    planning: "secondary",
    under_review: "warning",
    
    // Opportunity stages
    discovery: "ghost",
    qualification: "info",
    proposal_review: "secondary",
    negotiation: "warning",
    contract_sent: "info",
    
    // Change order status
    pending_client: "info",
    
    // Revenue schedule status
    recognized: "success",
    deferred: "warning",
    reversed: "destructive",
    
    // Account risk levels
    low: "success",
    medium: "warning",
    high: "destructive",
    critical: "destructive",
    
    // Digital asset status
    in_review: "warning",
    uploading: "info",
    processing: "warning",
    error: "destructive",
    locked: "ghost",
    superseded: "secondary",
    
    // Permit status (migration 015)
    required: "destructive",
    application_draft: "ghost",
    conditions_issued: "warning",
    revoked: "destructive",
    renewed: "success",
    not_required: "ghost",
    
    // Insurance policy status
    pending_verification: "warning",
    
    // Engineering approval status
    inspection_required: "warning",
    inspection_passed: "success",
    inspection_failed: "destructive",
    
    // Asset certification status
    current: "success",
    pending_inspection: "warning",
    
    // Requisition status
    converted_to_po: "success",
    
    // Goods receipt status
    partial: "warning",
    complete: "success",
    discrepancy: "destructive",
    
    // Approval workflow status
    escalated: "warning",
    delegated: "info",
    
    // Obligation status
    fulfilled: "success",
    breached: "destructive",
    waived: "secondary",
    
    // Dependency status
    satisfied: "success",
    not_applicable: "ghost",
    
    // 3-way match status
    variance_flagged: "destructive",
    override_approved: "warning",
    pending_receipt: "info",
    pending_invoice: "info",
    
    // Contract amendment status
    pending_signature: "warning",
    executed: "success",
    
    // Creative brief status
    stakeholder_review: "warning",
    strategy_approved: "info",
    budget_approved: "info",
    final_approved: "success",
    
    // Campaign status
    brief_approved: "info",
    launching: "info",
    live: "success",
    optimizing: "info",
    
    // Campaign asset production status
    briefed: "ghost",
    deployed: "success",
    retired: "ghost",
    
    // Creative review gate types
    creative_director: "default",
    brand_compliance: "info",
    stakeholder: "warning",
    requested: "ghost",
    
    // User lifecycle status
    onboarding: "info",
    pending_deletion: "destructive",
    anonymized: "ghost",
    invited: "info",
    
    // Live event phases
    advance: "ghost",
    load_in: "info",
    setup: "info",
    rehearsal: "warning",
    hold: "destructive",
    strike: "warning",
    wrapped: "ghost",
    
    // Department live status
    not_checked_in: "ghost",
    setting_up: "info",
    issue: "warning",
    striking: "warning",
    
    // Readiness gate status
    passed: "success",
    
    // ROS cue status
    standby: "warning",
    called: "info",
    held: "destructive",
    
    // Equipment live status
    issue_reported: "warning",
    being_repaired: "warning",
    struck: "secondary",
    loaded_out: "ghost",
    
    // VIP status
    expected: "ghost",
    arrived: "success",
    in_venue: "info",
    departed: "ghost",
    
    // VIP tiers
    bronze: "ghost",
    silver: "secondary",
    gold: "warning",
    platinum: "info",
    
    // Guest incident types
    complaint: "warning",
    injury: "destructive",
    lost_item: "info",
    disturbance: "warning",
    ejection: "destructive",
    
    // Reconciliation status
    reconciled: "success",
    write_off: "ghost",
    
    // OT alert levels
    advisory: "info",
    alert: "destructive",
    
    // Post-event report status
    in_review_report: "warning",
    
    // Strike step status
    // (pending, in_progress, completed, blocked, skipped already exist)
    
    // Missing / damaged conditions
    missing: "destructive",
    damaged: "destructive",
    excellent: "success",
    good: "info",
    fair: "warning",
    
    // Location spatial hierarchy status
    prospecting: "ghost",
    reconfiguring: "info",
    tentative: "warning",
    conditional: "warning",
    valid: "success",
    
    // Asset logistics
    released: "ghost",
    loaded: "success",
    repaired: "success",
    replaced: "info",
    written_off: "ghost",
    insurance_claim: "secondary",
    sold: "success",
    donated: "ghost",
    scrapped: "ghost",
    returned_to_vendor: "info",
    transferred: "secondary",
    
    // Production lifecycle (migration 021)
    qc_review: "secondary",
    waste_logged: "info",
    conditional_pass: "warning",
    pending_clearance: "warning",
    cleared: "success",
    denied: "destructive",
    renewal_needed: "warning",
    returned: "info",
    closed: "ghost",
    rental: "info",
    sale: "success",
    rental_to_own: "warning",
    consignment: "secondary",

    // Audit remediation (migration 022)
    soft_close: "warning",
    hard_close: "destructive",
    filed: "info",
    settled: "success",
    on_track: "success",
    at_risk: "warning",
    delivered: "success",
    downloaded: "default",
} as const satisfies Record<string, BadgeVariant>;

export type StatusKey = keyof typeof STATUS_VARIANTS;

// ─── Priority Variant Mappings ───
export const PRIORITY_VARIANTS = {
    critical: "destructive",
    urgent: "destructive",
    emergency: "destructive",
    high: "warning",
    medium: "info",
    normal: "default",
    low: "success",
} as const satisfies Record<string, BadgeVariant>;

export type PriorityKey = keyof typeof PRIORITY_VARIANTS;

// ─── Condition Variant Mappings ───
export const CONDITION_VARIANTS = {
    excellent: "success",
    good: "info",
    fair: "warning",
    needs_repair: "destructive",
    decommissioned: "ghost",
} as const satisfies Record<string, BadgeVariant>;

export type ConditionKey = keyof typeof CONDITION_VARIANTS;

// ─── Type Variant Mappings ───
export const TYPE_VARIANTS = {
    // Stakeholder types
    internal: "default",
    client: "warning",
    freelance: "info",
    subcontractor: "secondary",
    
    // Deck types
    pitch: "default",
    progress: "info",
    wrap: "success",
    
    // Document categories
    site_map: "info",
    nda: "warning",
    contract: "default",
    blueprint: "secondary",
    permit: "success",
    other: "ghost",
    
    // Notification types
    info: "info",
    warning: "warning",
    error: "destructive",
    success: "success",
} as const satisfies Record<string, BadgeVariant>;

export type TypeKey = keyof typeof TYPE_VARIANTS;

// ─── Helper Functions ───

/**
 * Get badge variant for any status value
 * Falls back to "ghost" for unknown statuses
 */
export function getStatusVariant(status: string): BadgeVariant {
    return (STATUS_VARIANTS as Record<string, BadgeVariant>)[status] ?? "ghost";
}

/**
 * Get badge variant for priority value
 */
export function getPriorityVariant(priority: string): BadgeVariant {
    return (PRIORITY_VARIANTS as Record<string, BadgeVariant>)[priority] ?? "ghost";
}

/**
 * Get badge variant for condition value
 */
export function getConditionVariant(condition: string): BadgeVariant {
    return (CONDITION_VARIANTS as Record<string, BadgeVariant>)[condition] ?? "ghost";
}

/**
 * Get badge variant for type value
 */
export function getTypeVariant(type: string): BadgeVariant {
    return (TYPE_VARIANTS as Record<string, BadgeVariant>)[type] ?? "ghost";
}

// ─── Background Color Helpers ───
// Maps badge variants to background color classes for dots, indicators, etc.

const VARIANT_BG_MAP: Record<BadgeVariant, string> = {
    default: "bg-primary",
    secondary: "bg-secondary",
    destructive: "bg-destructive",
    warning: "bg-warning",
    success: "bg-success",
    info: "bg-info",
    outline: "bg-border",
    ghost: "bg-muted",
};

/**
 * Get background color class for any status value
 * Useful for status dots, progress indicators, etc.
 */
export function getStatusBgColor(status: string): string {
    const variant = getStatusVariant(status);
    return VARIANT_BG_MAP[variant];
}

/**
 * Get background color class for any priority value
 */
export function getPriorityBgColor(priority: string): string {
    const variant = getPriorityVariant(priority);
    return VARIANT_BG_MAP[variant];
}

// ─── Label Configurations ───
// Human-readable labels for enum values

export const STATUS_LABELS: Record<string, string> = {
    // Generic
    active: "Active",
    inactive: "Inactive",
    pending: "Pending",
    completed: "Completed",
    cancelled: "Cancelled",
    draft: "Draft",
    on_hold: "On Hold",
    
    // Task
    backlog: "Backlog",
    todo: "To Do",
    in_progress: "In Progress",
    review: "Review",
    done: "Done",
    blocked: "Blocked",
    
    // Approval
    approved: "Approved",
    revision_requested: "Revision Requested",
    overdue: "Overdue",
    rejected: "Rejected",
    
    // Vendor
    suspended: "Suspended",
    
    // Invoice/PO
    issued: "Issued",
    received: "Received",
    matched: "Matched",
    disputed: "Disputed",
    paid: "Paid",
    partially_paid: "Partially Paid",
    void: "Void",
    
    // Crew
    available: "Available",
    assigned: "Assigned",
    unavailable: "Unavailable",
    
    // Vehicle
    in_transit: "In Transit",
    loading: "Loading",
    maintenance: "Maintenance",
    
    // Shift
    scheduled: "Scheduled",
    checked_in: "Checked In",
    checked_out: "Checked Out",
    no_show: "No Show",
    
    // Deck
    ready: "Ready",
    presented: "Presented",
    
    // Case study
    published: "Published",
    
    // Estimate/Proposal
    sent: "Sent",
    viewed: "Viewed",
    accepted: "Accepted",
    expired: "Expired",
    converted: "Converted",
    
    // Document
    pending_review: "Pending Review",
    archived: "Archived",
    
    // Work order
    posted: "Posted",
    bidding: "Bidding",
    awarded: "Awarded",
    verified: "Verified",
    invoiced: "Invoiced",
    
    // Dispatch
    unassigned: "Unassigned",
    offered: "Offered",
    declined: "Declined",
    en_route: "En Route",
    on_site: "On Site",
    
    // Service request
    acknowledged: "Acknowledged",
    assessment_scheduled: "Assessment Scheduled",
    quoted: "Quoted",
    
    // Compliance
    not_submitted: "Not Submitted",
    expiring_soon: "Expiring Soon",
    
    // Inventory
    in_stock: "In Stock",
    low_stock: "Low Stock",
    out_of_stock: "Out of Stock",
    on_order: "On Order",
    
    // Checklist
    not_started: "Not Started",
    failed: "Failed",
    skipped: "Skipped",
    
    // Expense
    reimbursed: "Reimbursed",
    
    // Leave
    taken: "Taken",
    
    // Time entry
    submitted: "Submitted",
    
    // Recurring
    paused: "Paused",
    
    // SOW
    pending_approval: "Pending Approval",
    
    // Lead
    new: "New",
    contacted: "Contacted",
    qualified: "Qualified",
    proposal_sent: "Proposal Sent",
    negotiating: "Negotiating",
    won: "Won",
    lost: "Lost",
    nurturing: "Nurturing",
    
    // Warehouse
    full: "Full",
    decommissioned: "Decommissioned",
    
    // Credit note
    applied: "Applied",
    
    // Production phases / lifecycle
    booked: "Booked",
    build: "Build",
    confirmed: "Confirmed",
    design: "Design",
    fabricating: "Fabricating",
    investigating: "Investigating",
    ordered: "Ordered",
    planned: "Planned",
    planning: "Planning",
    under_review: "Under Review",
    
    // Opportunity stages
    discovery: "Discovery",
    qualification: "Qualification",
    proposal_review: "Proposal Review",
    negotiation: "Negotiation",
    contract_sent: "Contract Sent",
    
    // Change order status
    pending_client: "Pending Client",
    
    // Revenue schedule status
    recognized: "Recognized",
    deferred: "Deferred",
    reversed: "Reversed",
    
    // Account risk levels
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
    
    // Digital asset status
    in_review: "In Review",
    uploading: "Uploading",
    processing: "Processing",
    error: "Error",
    locked: "Locked",
    superseded: "Superseded",
    
    // Permit status (migration 015)
    required: "Required",
    application_draft: "Application Draft",
    conditions_issued: "Conditions Issued",
    revoked: "Revoked",
    renewed: "Renewed",
    not_required: "Not Required",
    
    // Insurance policy status
    pending_verification: "Pending Verification",
    
    // Engineering approval status
    inspection_required: "Inspection Required",
    inspection_passed: "Inspection Passed",
    inspection_failed: "Inspection Failed",
    
    // Asset certification status
    current: "Current",
    pending_inspection: "Pending Inspection",
    
    // Requisition status
    converted_to_po: "Converted to PO",
    
    // Goods receipt status
    partial: "Partial",
    complete: "Complete",
    discrepancy: "Discrepancy",
    
    // Approval workflow status
    escalated: "Escalated",
    delegated: "Delegated",
    
    // Obligation status
    fulfilled: "Fulfilled",
    breached: "Breached",
    waived: "Waived",
    
    // Dependency status
    satisfied: "Satisfied",
    not_applicable: "N/A",
    
    // 3-way match status
    variance_flagged: "Variance Flagged",
    override_approved: "Override Approved",
    pending_receipt: "Pending Receipt",
    pending_invoice: "Pending Invoice",
    
    // Contract amendment status
    pending_signature: "Pending Signature",
    executed: "Executed",
    
    // Creative brief status
    stakeholder_review: "Stakeholder Review",
    strategy_approved: "Strategy Approved",
    budget_approved: "Budget Approved",
    final_approved: "Final Approved",
    
    // Campaign status
    brief_approved: "Brief Approved",
    launching: "Launching",
    live: "Live",
    optimizing: "Optimizing",
    
    // Campaign asset production status
    briefed: "Briefed",
    deployed: "Deployed",
    retired: "Retired",
    
    // Creative review
    creative_director: "Creative Director",
    brand_compliance: "Brand Compliance",
    stakeholder: "Stakeholder",
    requested: "Requested",
    
    // User lifecycle status
    onboarding: "Onboarding",
    pending_deletion: "Pending Deletion",
    anonymized: "Anonymized",
    invited: "Invited",
    
    // Live event phases
    advance: "Advance",
    load_in: "Load-In",
    setup: "Setup",
    rehearsal: "Rehearsal",
    hold: "Hold",
    strike: "Strike",
    wrapped: "Wrapped",
    
    // Department live status
    not_checked_in: "Not Checked In",
    setting_up: "Setting Up",
    issue: "Issue",
    striking: "Striking",
    
    // Readiness gate status
    passed: "Passed",
    
    // ROS cue status
    standby: "Standby",
    called: "Called",
    held: "Held",
    
    // Equipment live status
    issue_reported: "Issue Reported",
    being_repaired: "Being Repaired",
    struck: "Struck",
    loaded_out: "Loaded Out",
    
    // VIP status
    expected: "Expected",
    arrived: "Arrived",
    in_venue: "In Venue",
    departed: "Departed",
    
    // VIP tiers
    bronze: "Bronze",
    silver: "Silver",
    gold: "Gold",
    platinum: "Platinum",
    
    // Guest incident types
    complaint: "Complaint",
    injury: "Injury",
    lost_item: "Lost Item",
    disturbance: "Disturbance",
    ejection: "Ejection",
    
    // Reconciliation status
    reconciled: "Reconciled",
    write_off: "Write Off",
    
    // OT alert levels
    advisory: "Advisory",
    alert: "Alert",
    
    // Post-event report status
    in_review_report: "In Review",
    
    // Asset conditions (for reconciliation)
    missing: "Missing",
    damaged: "Damaged",
    excellent: "Excellent",
    good: "Good",
    fair: "Fair",
    
    // Location spatial hierarchy status
    prospecting: "Prospecting",
    reconfiguring: "Reconfiguring",
    tentative: "Tentative",
    conditional: "Conditional",
    valid: "Valid",
    
    // Asset logistics
    released: "Released",
    loaded: "Loaded",
    repaired: "Repaired",
    replaced: "Replaced",
    written_off: "Written Off",
    insurance_claim: "Insurance Claim",
    sold: "Sold",
    donated: "Donated",
    scrapped: "Scrapped",
    returned_to_vendor: "Returned to Vendor",
    transferred: "Transferred",
    
    // Production lifecycle (migration 021)
    qc_review: "QC Review",
    waste_logged: "Waste Logged",
    conditional_pass: "Conditional Pass",
    pending_clearance: "Pending Clearance",
    cleared: "Cleared",
    denied: "Denied",
    renewal_needed: "Renewal Needed",
    returned: "Returned",
    closed: "Closed",
    rental: "Rental",
    sale: "Sale",
    rental_to_own: "Rental to Own",
    consignment: "Consignment",

    // Audit remediation (migration 022)
    soft_close: "Soft Close",
    hard_close: "Hard Close",
    filed: "Filed",
    settled: "Settled",
    on_track: "On Track",
    at_risk: "At Risk",
    delivered: "Delivered",
    downloaded: "Downloaded",
} as const satisfies Record<string, string>;

export const PRIORITY_LABELS: Record<string, string> = {
    critical: "Critical",
    urgent: "Urgent",
    emergency: "Emergency",
    high: "High",
    medium: "Medium",
    normal: "Normal",
    low: "Low",
};

export const CONDITION_LABELS: Record<string, string> = {
    excellent: "Excellent",
    good: "Good",
    fair: "Fair",
    needs_repair: "Needs Repair",
    decommissioned: "Decommissioned",
};

/**
 * Get human-readable label for any status
 */
export function getStatusLabel(status: string): string {
    const explicit = STATUS_LABELS[status];
    if (!explicit && process.env.NODE_ENV === "development") {
        console.warn(`[casing] Missing STATUS_LABELS entry for "${status}". Add an explicit label to ui-variants.ts.`);
    }
    return explicit ?? status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Get human-readable label for priority
 */
export function getPriorityLabel(priority: string): string {
    const explicit = PRIORITY_LABELS[priority];
    if (!explicit && process.env.NODE_ENV === "development") {
        console.warn(`[casing] Missing PRIORITY_LABELS entry for "${priority}". Add an explicit label to ui-variants.ts.`);
    }
    return explicit ?? priority.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Get human-readable label for condition
 */
export function getConditionLabel(condition: string): string {
    const explicit = CONDITION_LABELS[condition];
    if (!explicit && process.env.NODE_ENV === "development") {
        console.warn(`[casing] Missing CONDITION_LABELS entry for "${condition}". Add an explicit label to ui-variants.ts.`);
    }
    return explicit ?? condition.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
