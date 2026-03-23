/* ═══════════════════════════════════════════════════════════════
   ATLVS — Legal, Compliance, Finance & Procurement Types
   Migration 015: governance entities
   ═══════════════════════════════════════════════════════════════ */

// ─── GL Accounts ───

export type GLAccountType = "asset" | "liability" | "equity" | "revenue" | "expense";
export type CapexOpex = "capex" | "opex";

export interface GLAccount {
    id: string;
    code: string;
    name: string;
    description?: string | undefined;
    account_type: GLAccountType;
    parent_id?: string | undefined;
    capex_opex?: CapexOpex | undefined;
    department?: string | undefined;
    is_active: boolean;
    display_order: number;
    organization_id: string;
    created_by?: string | undefined;
    created_at: string;
    updated_at: string;
}

// ─── Insurance ───

export type InsurancePolicyType =
    | "general_liability"
    | "professional_liability"
    | "workers_compensation"
    | "auto_liability"
    | "equipment_floater"
    | "event_liability"
    | "umbrella"
    | "property"
    | "cyber"
    | "directors_officers"
    | "event_cancellation"
    | "riggers_liability"
    | "pollution"
    | "other";

export type InsurancePolicyStatus =
    | "draft"
    | "pending_verification"
    | "active"
    | "expiring_soon"
    | "expired"
    | "cancelled"
    | "suspended";

export type InsuranceHolderType = "organization" | "vendor" | "location" | "subcontractor";

export interface InsuranceRequirement {
    id: string;
    name: string;
    description?: string | undefined;
    entity_type: InsuranceHolderType;
    contract_category?: ContractCategory | undefined;
    coverage_type: InsurancePolicyType;
    minimum_amount: number;
    currency: string;
    required_before: string;
    auto_suspend_on_expiry: boolean;
    expiry_warning_days: number;
    is_active: boolean;
    organization_id: string;
    created_by?: string | undefined;
    created_at: string;
    updated_at: string;
}

export interface InsurancePolicy {
    id: string;
    holder_type: InsuranceHolderType;
    holder_id: string;
    policy_type: InsurancePolicyType;
    carrier: string;
    policy_number: string;
    coverage_amount: number;
    deductible?: number | undefined;
    premium?: number | undefined;
    currency: string;
    effective_date: string;
    expiry_date: string;
    additional_insured?: string[] | undefined;
    additional_insured_required: boolean;
    status: InsurancePolicyStatus;
    verified_by?: string | undefined;
    verified_at?: string | undefined;
    verification_notes?: string | undefined;
    document_url?: string | undefined;
    certificate_url?: string | undefined;
    requirement_id?: string | undefined;
    notes?: string | undefined;
    tags: string[];
    organization_id: string;
    created_by?: string | undefined;
    updated_by?: string | undefined;
    created_at: string;
    updated_at: string;
}

// ─── Contracts (Enhanced) ───

export type ContractCategory =
    | "msa"
    | "sow"
    | "nda"
    | "venue_agreement"
    | "sponsorship"
    | "talent_agreement"
    | "vendor_agreement"
    | "subcontractor_agreement"
    | "equipment_rental"
    | "license_agreement"
    | "insurance_addendum"
    | "employment"
    | "independent_contractor"
    | "partnership"
    | "other";

export type ContractConfidentiality =
    | "public"
    | "internal"
    | "confidential"
    | "highly_confidential";

export type ContractAmendmentStatus =
    | "draft"
    | "pending_review"
    | "pending_signature"
    | "executed"
    | "rejected"
    | "void";

export interface ContractAmendment {
    id: string;
    contract_id: string;
    amendment_number: number;
    title: string;
    description?: string | undefined;
    value_impact: number;
    schedule_impact_days: number;
    scope_changes?: string | undefined;
    effective_date: string;
    expiration_date?: string | undefined;
    status: ContractAmendmentStatus;
    prepared_by?: string | undefined;
    reviewed_by?: string | undefined;
    reviewed_at?: string | undefined;
    signed_at?: string | undefined;
    signed_by?: string | undefined;
    counterparty_signed_by?: string | undefined;
    counterparty_signed_at?: string | undefined;
    document_url?: string | undefined;
    notes?: string | undefined;
    organization_id: string;
    created_by?: string | undefined;
    updated_by?: string | undefined;
    created_at: string;
    updated_at: string;
}

// ─── Contract Clauses ───

export type ClauseType =
    | "indemnification"
    | "limitation_of_liability"
    | "insurance_requirements"
    | "ip_ownership"
    | "ip_usage_rights"
    | "confidentiality"
    | "non_compete"
    | "force_majeure"
    | "termination"
    | "payment_terms"
    | "dispute_resolution"
    | "data_privacy"
    | "cancellation"
    | "weather_contingency"
    | "warranty"
    | "representations"
    | "governing_law"
    | "assignment"
    | "severability"
    | "entire_agreement"
    | "amendments"
    | "notices"
    | "other";

export type ClauseRiskLevel = "low" | "medium" | "high" | "critical";

export interface ContractClause {
    id: string;
    contract_id?: string | undefined;
    clause_type: ClauseType;
    title: string;
    body: string;
    clause_number?: string | undefined;
    is_standard: boolean;
    risk_level: ClauseRiskLevel;
    negotiable: boolean;
    is_template: boolean;
    display_order: number;
    notes?: string | undefined;
    organization_id: string;
    created_by?: string | undefined;
    updated_by?: string | undefined;
    created_at: string;
    updated_at: string;
}

// ─── Contract Obligations ───

export type ObligationParty = "us" | "counterparty" | "mutual" | "third_party";
export type ObligationStatus =
    | "pending"
    | "in_progress"
    | "fulfilled"
    | "breached"
    | "waived"
    | "expired";

export interface ContractObligation {
    id: string;
    contract_id: string;
    party: ObligationParty;
    description: string;
    clause_reference?: string | undefined;
    due_date?: string | undefined;
    completed_at?: string | undefined;
    is_recurring: boolean;
    recurrence_pattern?: string | undefined;
    next_due_date?: string | undefined;
    status: ObligationStatus;
    evidence_url?: string | undefined;
    verified_by?: string | undefined;
    verified_at?: string | undefined;
    is_critical: boolean;
    notes?: string | undefined;
    organization_id: string;
    created_by?: string | undefined;
    updated_by?: string | undefined;
    created_at: string;
    updated_at: string;
}

// ─── IP Rights ───

export type IPAssetType =
    | "logo"
    | "trademark"
    | "design"
    | "photograph"
    | "video"
    | "music"
    | "software"
    | "content"
    | "invention"
    | "trade_secret"
    | "other";

export type IPLicenseType =
    | "exclusive"
    | "non_exclusive"
    | "sole"
    | "sublicensable"
    | "work_for_hire"
    | "assignment"
    | "creative_commons"
    | "other";

export interface IPRight {
    id: string;
    contract_id: string;
    asset_type: IPAssetType;
    asset_description: string;
    owner: ObligationParty;
    license_type: IPLicenseType;
    territory: string;
    duration?: string | undefined;
    exclusivity: boolean;
    sublicensable: boolean;
    restrictions?: string | undefined;
    permitted_uses?: string | undefined;
    prohibited_uses?: string | undefined;
    royalty_terms?: string | undefined;
    royalty_rate?: number | undefined;
    buyout_amount?: number | undefined;
    effective_date?: string | undefined;
    expiry_date?: string | undefined;
    notes?: string | undefined;
    organization_id: string;
    created_by?: string | undefined;
    created_at: string;
    updated_at: string;
}

// ─── Permits ───

export type PermitType =
    | "business_license"
    | "reseller_permit"
    | "employer_registration"
    | "temporary_event"
    | "street_closure"
    | "environmental_impact"
    | "fire"
    | "building"
    | "electrical"
    | "noise"
    | "health"
    | "liquor"
    | "signage"
    | "ada_variance"
    | "structural_approval"
    | "plumbing"
    | "amusement"
    | "crowd_gathering"
    | "pyrotechnics"
    | "drone"
    | "broadcast"
    | "food_service"
    | "other";

export type PermitStatus =
    | "required"
    | "application_draft"
    | "submitted"
    | "under_review"
    | "conditions_issued"
    | "approved"
    | "active"
    | "expired"
    | "revoked"
    | "renewed"
    | "not_required";

export type PermitEntityType = "organization" | "project" | "location" | "activation" | "event";

export interface Permit {
    id: string;
    permit_type: PermitType;
    jurisdiction: string;
    jurisdiction_level: "local" | "county" | "state" | "federal" | "international";
    issuing_authority?: string | undefined;
    entity_type: PermitEntityType;
    entity_id: string;
    permit_number?: string | undefined;
    title: string;
    description?: string | undefined;
    applied_date?: string | undefined;
    submitted_date?: string | undefined;
    approved_date?: string | undefined;
    effective_date?: string | undefined;
    expiry_date?: string | undefined;
    renewal_date?: string | undefined;
    application_fee?: number | undefined;
    permit_fee?: number | undefined;
    total_cost?: number | undefined;
    status: PermitStatus;
    conditions?: string | undefined;
    conditions_met: boolean;
    requires_inspection: boolean;
    inspection_date?: string | undefined;
    inspection_passed?: boolean | undefined;
    inspector_name?: string | undefined;
    blocks_entity: boolean;
    document_url?: string | undefined;
    application_url?: string | undefined;
    notes?: string | undefined;
    tags: string[];
    organization_id: string;
    created_by?: string | undefined;
    updated_by?: string | undefined;
    created_at: string;
    updated_at: string;
}

// ─── Engineering Approvals ───

export type EngineeringApprovalType =
    | "structural"
    | "electrical"
    | "mechanical"
    | "fire_safety"
    | "rigging";

export type EngineeringApprovalStatus =
    | "pending"
    | "submitted"
    | "under_review"
    | "conditions_issued"
    | "approved"
    | "rejected"
    | "expired"
    | "inspection_required"
    | "inspection_passed"
    | "inspection_failed";

export interface EngineeringApproval {
    id: string;
    approval_type: EngineeringApprovalType;
    entity_type: "activation" | "location" | "asset" | "event";
    entity_id: string;
    engineer_name: string;
    engineer_license_number?: string | undefined;
    engineering_firm?: string | undefined;
    status: EngineeringApprovalStatus;
    submitted_at?: string | undefined;
    approved_at?: string | undefined;
    valid_until?: string | undefined;
    calculations_url?: string | undefined;
    drawings_url?: string | undefined;
    approval_document_url?: string | undefined;
    conditions?: string | undefined;
    conditions_met: boolean;
    load_chart_url?: string | undefined;
    inspection_schedule: unknown[];
    last_inspection_date?: string | undefined;
    last_inspection_result?: string | undefined;
    notes?: string | undefined;
    organization_id: string;
    created_by?: string | undefined;
    updated_by?: string | undefined;
    created_at: string;
    updated_at: string;
}

// ─── Compliance Checklists ───

export type ComplianceChecklistType =
    | "ada"
    | "osha"
    | "fire_safety"
    | "health_safety"
    | "noise"
    | "environmental"
    | "electrical_safety"
    | "crowd_management"
    | "food_safety"
    | "alcohol_service"
    | "general";

export type ComplianceChecklistStatus =
    | "not_started"
    | "in_progress"
    | "completed"
    | "failed"
    | "requires_remediation"
    | "waived";

export interface ComplianceChecklist {
    id: string;
    checklist_type: ComplianceChecklistType;
    entity_type: "location" | "activation" | "event" | "project" | "asset";
    entity_id: string;
    title: string;
    description?: string | undefined;
    items: unknown[];
    total_items: number;
    completed_items: number;
    completion_percent: number;
    status: ComplianceChecklistStatus;
    inspector_id?: string | undefined;
    inspected_at?: string | undefined;
    findings?: string | undefined;
    remediation_required?: string | undefined;
    remediation_deadline?: string | undefined;
    next_due?: string | undefined;
    recurrence_days?: number | undefined;
    notes?: string | undefined;
    organization_id: string;
    created_by?: string | undefined;
    updated_by?: string | undefined;
    created_at: string;
    updated_at: string;
}

// ─── Asset Certifications ───

export type AssetCertificationType =
    | "structural_integrity"
    | "electrical_safety"
    | "fire_resistance"
    | "rigging_inspection"
    | "pressure_vessel"
    | "load_test"
    | "calibration"
    | "safety_inspection"
    | "dot_inspection"
    | "other";

export type AssetCertificationStatus =
    | "current"
    | "expiring_soon"
    | "expired"
    | "pending_inspection"
    | "failed";

export interface AssetCertification {
    id: string;
    asset_id: string;
    cert_type: AssetCertificationType;
    title: string;
    cert_number?: string | undefined;
    issued_by: string;
    issuer_license?: string | undefined;
    issued_date: string;
    expiry_date?: string | undefined;
    next_inspection_date?: string | undefined;
    status: AssetCertificationStatus;
    blocks_usage: boolean;
    document_url?: string | undefined;
    notes?: string | undefined;
    organization_id: string;
    created_by?: string | undefined;
    created_at: string;
    updated_at: string;
}

// ─── Budget Approvals ───

export type ApprovalStatus =
    | "pending"
    | "approved"
    | "rejected"
    | "revision_requested"
    | "escalated"
    | "expired"
    | "delegated";

export type ApprovalEntityType =
    | "budget"
    | "budget_line_item"
    | "change_order"
    | "purchase_order"
    | "expense"
    | "payment"
    | "contract"
    | "permit_waiver";

export interface BudgetApproval {
    id: string;
    entity_type: ApprovalEntityType;
    entity_id: string;
    amount: number;
    currency: string;
    threshold_rule?: string | undefined;
    threshold_amount?: number | undefined;
    requested_by: string;
    requested_at: string;
    justification?: string | undefined;
    approver_id?: string | undefined;
    approved_at?: string | undefined;
    status: ApprovalStatus;
    delegated_from?: string | undefined;
    delegated_reason?: string | undefined;
    expires_at?: string | undefined;
    parent_approval_id?: string | undefined;
    approval_level: number;
    notes?: string | undefined;
    organization_id: string;
    created_at: string;
    updated_at: string;
}

// ─── Payment Approvals ───

export type PaymentApprovalType =
    | "vendor_invoice"
    | "expense_reimbursement"
    | "payroll"
    | "advance"
    | "refund";

export interface PaymentApproval {
    id: string;
    payment_type: PaymentApprovalType;
    entity_id: string;
    amount: number;
    currency: string;
    vendor_id?: string | undefined;
    payee_name?: string | undefined;
    threshold_rule?: string | undefined;
    threshold_amount?: number | undefined;
    requested_by: string;
    requested_at: string;
    approver_id?: string | undefined;
    approved_at?: string | undefined;
    status: ApprovalStatus;
    delegated_from?: string | undefined;
    three_way_match_verified: boolean;
    vendor_compliance_verified: boolean;
    budget_within_limit: boolean;
    expires_at?: string | undefined;
    notes?: string | undefined;
    organization_id: string;
    created_at: string;
    updated_at: string;
}

// ─── Purchase Requisitions ───

export type RequisitionStatus =
    | "draft"
    | "pending_approval"
    | "approved"
    | "rejected"
    | "converted_to_po"
    | "cancelled";

export type RequisitionUrgency = "low" | "normal" | "high" | "critical";

export interface PurchaseRequisition {
    id: string;
    project_id: string;
    number: string;
    title: string;
    description?: string | undefined;
    requester_id: string;
    line_items: unknown[];
    estimated_cost: number;
    budget_code?: string | undefined;
    gl_account_id?: string | undefined;
    department?: string | undefined;
    urgency: RequisitionUrgency;
    needed_by?: string | undefined;
    justification?: string | undefined;
    suggested_vendor_id?: string | undefined;
    status: RequisitionStatus;
    approved_by?: string | undefined;
    approved_at?: string | undefined;
    converted_po_id?: string | undefined;
    notes?: string | undefined;
    organization_id: string;
    created_by?: string | undefined;
    updated_by?: string | undefined;
    created_at: string;
    updated_at: string;
}

// ─── Goods Receipts ───

export type GoodsReceiptStatus = "pending" | "partial" | "complete" | "rejected" | "discrepancy";

export interface GoodsReceipt {
    id: string;
    purchase_order_id: string;
    receipt_number: string;
    received_by: string;
    received_at: string;
    line_items: unknown[];
    status: GoodsReceiptStatus;
    condition_notes?: string | undefined;
    discrepancies?: string | undefined;
    photos: string[];
    signed_by?: string | undefined;
    signed_at?: string | undefined;
    document_url?: string | undefined;
    delivery_location?: string | undefined;
    warehouse_id?: string | undefined;
    notes?: string | undefined;
    organization_id: string;
    created_by?: string | undefined;
    created_at: string;
    updated_at: string;
}

// ─── 3-Way Match ───

export type ThreeWayMatchStatus =
    | "not_applicable"
    | "pending_receipt"
    | "pending_invoice"
    | "matched"
    | "variance_flagged"
    | "override_approved";

// ─── Vendor Risk Scores ───

export type VendorRiskLevel = "low" | "medium" | "high" | "critical";

export interface VendorRiskScore {
    id: string;
    vendor_id: string;
    score_date: string;
    overall_score: number;
    financial_score: number;
    compliance_score: number;
    performance_score: number;
    operational_score: number;
    risk_level: VendorRiskLevel;
    risk_factors: unknown[];
    recommendations: unknown[];
    total_spend: number;
    active_po_count: number;
    overdue_invoice_count: number;
    incident_count: number;
    notes?: string | undefined;
    scored_by?: string | undefined;
    organization_id: string;
    created_at: string;
}

// ─── Entity Dependencies ───

export type GovernanceDependencyType = "hard_block" | "soft_warning";
export type GovernanceDependencyStatus =
    | "pending"
    | "satisfied"
    | "waived"
    | "expired"
    | "not_applicable";

export interface EntityDependency {
    id: string;
    dependent_entity_type: string;
    dependent_entity_id: string;
    required_entity_type: string;
    required_entity_id?: string | undefined;
    dependency_type: GovernanceDependencyType;
    description?: string | undefined;
    status: GovernanceDependencyStatus;
    satisfied_at?: string | undefined;
    satisfied_by?: string | undefined;
    waived_by?: string | undefined;
    waived_at?: string | undefined;
    waived_reason?: string | undefined;
    auto_check: boolean;
    organization_id: string;
    created_by?: string | undefined;
    created_at: string;
    updated_at: string;
}

// ─── Governance Audit Log ───

export type GovernanceDomain = "legal" | "compliance" | "finance" | "procurement";

export type GovernanceAction =
    | "created"
    | "updated"
    | "approved"
    | "rejected"
    | "expired"
    | "renewed"
    | "waived"
    | "suspended"
    | "verified"
    | "submitted"
    | "matched"
    | "released"
    | "escalated"
    | "delegated"
    | "revoked";

export interface GovernanceAuditLogEntry {
    id: string;
    domain: GovernanceDomain;
    entity_type: string;
    entity_id: string;
    action: GovernanceAction;
    actor_id?: string | undefined;
    actor_role?: string | undefined;
    field_name?: string | undefined;
    old_value?: string | undefined;
    new_value?: string | undefined;
    change_summary?: string | undefined;
    metadata: Record<string, unknown>;
    ip_address?: string | undefined;
    logged_at: string;
    organization_id: string;
}

// ─── Composite / Convenience Types ───

export interface InsurancePolicyWithRequirement extends InsurancePolicy {
    requirement?: InsuranceRequirement | undefined;
}

export interface ContractWithClauses {
    contract_id: string;
    clauses: ContractClause[];
    amendments: ContractAmendment[];
    obligations: ContractObligation[];
    ip_rights: IPRight[];
}

export interface PermitWithDependencies extends Permit {
    dependencies: EntityDependency[];
}

export interface VendorGovernanceProfile {
    vendor_id: string;
    insurance_policies: InsurancePolicy[];
    risk_scores: VendorRiskScore[];
    active_contracts: number;
    open_po_count: number;
    compliance_doc_count: number;
    latest_risk_level: VendorRiskLevel;
}

export interface ProjectGovernanceSummary {
    project_id: string;
    permits: Permit[];
    engineering_approvals: EngineeringApproval[];
    compliance_checklists: ComplianceChecklist[];
    unsatisfied_dependencies: EntityDependency[];
    budget_approvals: BudgetApproval[];
    pending_payment_approvals: PaymentApproval[];
}
