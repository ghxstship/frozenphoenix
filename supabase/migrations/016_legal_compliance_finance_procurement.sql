-- ═══════════════════════════════════════════════════════════════════════════
-- FROZEN PHOENIX — Legal, Compliance, Finance & Procurement Governance
-- Migration 015
--
-- Creates: gl_accounts, insurance_policies, insurance_requirements,
--          contract_clauses, contract_amendments, contract_obligations,
--          ip_rights, permits, engineering_approvals, compliance_checklists,
--          asset_certifications, budget_approvals, payment_approvals,
--          goods_receipts, purchase_requisitions, vendor_risk_scores,
--          entity_dependencies, governance_audit_log
--
-- Modifies: contracts, budget_line_items, purchase_orders, invoices, assets
--
-- Maintains 3NF compliance, SSOT governance, referential integrity.
-- All new columns on existing tables are NULLABLE for backward compatibility.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TYPE gl_account_type AS ENUM (
    'asset', 'liability', 'equity', 'revenue', 'expense'
);

CREATE TYPE capex_opex AS ENUM ('capex', 'opex');

CREATE TYPE insurance_policy_type AS ENUM (
    'general_liability', 'professional_liability', 'workers_compensation',
    'auto_liability', 'equipment_floater', 'event_liability',
    'umbrella', 'property', 'cyber', 'directors_officers',
    'event_cancellation', 'riggers_liability', 'pollution', 'other'
);

CREATE TYPE insurance_policy_status AS ENUM (
    'draft', 'pending_verification', 'active', 'expiring_soon',
    'expired', 'cancelled', 'suspended'
);

CREATE TYPE insurance_holder_type AS ENUM (
    'organization', 'vendor', 'location', 'subcontractor'
);

CREATE TYPE contract_category AS ENUM (
    'msa', 'sow', 'nda', 'venue_agreement', 'sponsorship',
    'talent_agreement', 'vendor_agreement', 'subcontractor_agreement',
    'equipment_rental', 'license_agreement', 'insurance_addendum',
    'employment', 'independent_contractor', 'partnership', 'other'
);

CREATE TYPE contract_confidentiality AS ENUM (
    'public', 'internal', 'confidential', 'highly_confidential'
);

CREATE TYPE contract_amendment_status AS ENUM (
    'draft', 'pending_review', 'pending_signature', 'executed', 'rejected', 'void'
);

CREATE TYPE clause_type AS ENUM (
    'indemnification', 'limitation_of_liability', 'insurance_requirements',
    'ip_ownership', 'ip_usage_rights', 'confidentiality', 'non_compete',
    'force_majeure', 'termination', 'payment_terms', 'dispute_resolution',
    'data_privacy', 'cancellation', 'weather_contingency', 'warranty',
    'representations', 'governing_law', 'assignment', 'severability',
    'entire_agreement', 'amendments', 'notices', 'other'
);

CREATE TYPE clause_risk_level AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TYPE obligation_party AS ENUM ('us', 'counterparty', 'mutual', 'third_party');

CREATE TYPE obligation_status AS ENUM (
    'pending', 'in_progress', 'fulfilled', 'breached', 'waived', 'expired'
);

CREATE TYPE ip_asset_type AS ENUM (
    'logo', 'trademark', 'design', 'photograph', 'video', 'music',
    'software', 'content', 'invention', 'trade_secret', 'other'
);

CREATE TYPE ip_license_type AS ENUM (
    'exclusive', 'non_exclusive', 'sole', 'sublicensable',
    'work_for_hire', 'assignment', 'creative_commons', 'other'
);

CREATE TYPE permit_type AS ENUM (
    'business_license', 'reseller_permit', 'employer_registration',
    'temporary_event', 'street_closure', 'environmental_impact',
    'fire', 'building', 'electrical', 'noise', 'health',
    'liquor', 'signage', 'ada_variance', 'structural_approval',
    'plumbing', 'amusement', 'crowd_gathering', 'pyrotechnics',
    'drone', 'broadcast', 'food_service', 'other'
);

CREATE TYPE permit_status AS ENUM (
    'required', 'application_draft', 'submitted', 'under_review',
    'conditions_issued', 'approved', 'active', 'expired',
    'revoked', 'renewed', 'not_required'
);

CREATE TYPE permit_entity_type AS ENUM (
    'organization', 'project', 'location', 'activation', 'event'
);

CREATE TYPE engineering_approval_type AS ENUM (
    'structural', 'electrical', 'mechanical', 'fire_safety', 'rigging'
);

CREATE TYPE engineering_approval_status AS ENUM (
    'pending', 'submitted', 'under_review', 'conditions_issued',
    'approved', 'rejected', 'expired', 'inspection_required',
    'inspection_passed', 'inspection_failed'
);

CREATE TYPE compliance_checklist_type AS ENUM (
    'ada', 'osha', 'fire_safety', 'health_safety', 'noise',
    'environmental', 'electrical_safety', 'crowd_management',
    'food_safety', 'alcohol_service', 'general'
);

CREATE TYPE compliance_checklist_status AS ENUM (
    'not_started', 'in_progress', 'completed', 'failed',
    'requires_remediation', 'waived'
);

CREATE TYPE asset_certification_type AS ENUM (
    'structural_integrity', 'electrical_safety', 'fire_resistance',
    'rigging_inspection', 'pressure_vessel', 'load_test',
    'calibration', 'safety_inspection', 'dot_inspection', 'other'
);

CREATE TYPE asset_certification_status AS ENUM (
    'current', 'expiring_soon', 'expired', 'pending_inspection', 'failed'
);

CREATE TYPE approval_status AS ENUM (
    'pending', 'approved', 'rejected', 'revision_requested',
    'escalated', 'expired', 'delegated'
);

CREATE TYPE approval_entity_type AS ENUM (
    'budget', 'budget_line_item', 'change_order', 'purchase_order',
    'expense', 'payment', 'contract', 'permit_waiver'
);

CREATE TYPE payment_approval_type AS ENUM (
    'vendor_invoice', 'expense_reimbursement', 'payroll', 'advance', 'refund'
);

CREATE TYPE requisition_status AS ENUM (
    'draft', 'pending_approval', 'approved', 'rejected',
    'converted_to_po', 'cancelled'
);

CREATE TYPE requisition_urgency AS ENUM ('low', 'normal', 'high', 'critical');

CREATE TYPE goods_receipt_status AS ENUM (
    'pending', 'partial', 'complete', 'rejected', 'discrepancy'
);

CREATE TYPE three_way_match_status AS ENUM (
    'not_applicable', 'pending_receipt', 'pending_invoice',
    'matched', 'variance_flagged', 'override_approved'
);

CREATE TYPE vendor_risk_level AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TYPE dependency_type AS ENUM ('hard_block', 'soft_warning');

CREATE TYPE dependency_status AS ENUM (
    'pending', 'satisfied', 'waived', 'expired', 'not_applicable'
);

CREATE TYPE governance_domain AS ENUM (
    'legal', 'compliance', 'finance', 'procurement'
);

CREATE TYPE governance_action AS ENUM (
    'created', 'updated', 'approved', 'rejected', 'expired',
    'renewed', 'waived', 'suspended', 'verified', 'submitted',
    'matched', 'released', 'escalated', 'delegated', 'revoked'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: GL ACCOUNTS (Chart of Accounts)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE gl_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    account_type gl_account_type NOT NULL,
    parent_id UUID REFERENCES gl_accounts(id) ON DELETE SET NULL,
    capex_opex capex_opex,
    department department,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, code)
);

CREATE INDEX idx_gl_accounts_org ON gl_accounts(organization_id);
CREATE INDEX idx_gl_accounts_type ON gl_accounts(account_type);
CREATE INDEX idx_gl_accounts_parent ON gl_accounts(parent_id);
CREATE INDEX idx_gl_accounts_active ON gl_accounts(is_active);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: INSURANCE POLICIES
-- Unified insurance registry. SSOT for all insurance tracking.
-- Replaces fragmented tracking across vendors, locations, incidents.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE insurance_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,

    -- What requires it
    entity_type insurance_holder_type NOT NULL,
    contract_category contract_category,

    -- Coverage
    coverage_type insurance_policy_type NOT NULL,
    minimum_amount NUMERIC(14,2) NOT NULL,
    currency TEXT DEFAULT 'USD',

    -- Rules
    required_before TEXT NOT NULL DEFAULT 'activation',
    auto_suspend_on_expiry BOOLEAN DEFAULT false,
    expiry_warning_days INTEGER DEFAULT 30,

    is_active BOOLEAN DEFAULT true,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_insurance_reqs_org ON insurance_requirements(organization_id);
CREATE INDEX idx_insurance_reqs_entity ON insurance_requirements(entity_type);
CREATE INDEX idx_insurance_reqs_coverage ON insurance_requirements(coverage_type);

CREATE TABLE insurance_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Holder (polymorphic)
    holder_type insurance_holder_type NOT NULL,
    holder_id UUID NOT NULL,

    -- Policy details
    policy_type insurance_policy_type NOT NULL,
    carrier TEXT NOT NULL,
    policy_number TEXT NOT NULL,
    coverage_amount NUMERIC(14,2) NOT NULL,
    deductible NUMERIC(14,2),
    premium NUMERIC(14,2),
    currency TEXT DEFAULT 'USD',

    -- Dates
    effective_date DATE NOT NULL,
    expiry_date DATE NOT NULL,

    -- Additional insured
    additional_insured TEXT[],
    additional_insured_required BOOLEAN DEFAULT false,

    -- Status
    status insurance_policy_status NOT NULL DEFAULT 'pending_verification',

    -- Verification
    verified_by UUID REFERENCES profiles(id),
    verified_at TIMESTAMPTZ,
    verification_notes TEXT,

    -- Document
    document_url TEXT,
    certificate_url TEXT,

    -- Requirement link
    requirement_id UUID REFERENCES insurance_requirements(id) ON DELETE SET NULL,

    -- Metadata
    notes TEXT,
    tags TEXT[] DEFAULT '{}',

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_insurance_policies_holder ON insurance_policies(holder_type, holder_id);
CREATE INDEX idx_insurance_policies_type ON insurance_policies(policy_type);
CREATE INDEX idx_insurance_policies_status ON insurance_policies(status);
CREATE INDEX idx_insurance_policies_expiry ON insurance_policies(expiry_date);
CREATE INDEX idx_insurance_policies_org ON insurance_policies(organization_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: CONTRACT ENHANCEMENTS
-- Enhance existing contracts table with legal governance fields.
-- Normalize amendment_ids into proper table.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE contracts
    ADD COLUMN IF NOT EXISTS parent_contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS contract_category contract_category,
    ADD COLUMN IF NOT EXISTS insurance_requirement_id UUID REFERENCES insurance_requirements(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS governing_law TEXT,
    ADD COLUMN IF NOT EXISTS dispute_resolution TEXT,
    ADD COLUMN IF NOT EXISTS confidentiality_level contract_confidentiality DEFAULT 'confidential',
    ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS renewal_notice_days INTEGER DEFAULT 90,
    ADD COLUMN IF NOT EXISTS termination_notice_days INTEGER DEFAULT 30,
    ADD COLUMN IF NOT EXISTS executed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS executed_by UUID REFERENCES profiles(id);

CREATE INDEX IF NOT EXISTS idx_contracts_parent ON contracts(parent_contract_id);
CREATE INDEX IF NOT EXISTS idx_contracts_category ON contracts(contract_category);
CREATE INDEX IF NOT EXISTS idx_contracts_confidentiality ON contracts(confidentiality_level);
CREATE INDEX IF NOT EXISTS idx_contracts_auto_renew ON contracts(auto_renew) WHERE auto_renew = true;

-- Contract Amendments (normalized from contracts.amendment_ids UUID[])
CREATE TABLE contract_amendments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,

    -- Identification
    amendment_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,

    -- Impact
    value_impact NUMERIC(14,2) DEFAULT 0,
    schedule_impact_days INTEGER DEFAULT 0,
    scope_changes TEXT,

    -- Dates
    effective_date DATE NOT NULL,
    expiration_date DATE,

    -- Approval
    status contract_amendment_status NOT NULL DEFAULT 'draft',
    prepared_by UUID REFERENCES profiles(id),
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    signed_at TIMESTAMPTZ,
    signed_by TEXT,
    counterparty_signed_by TEXT,
    counterparty_signed_at TIMESTAMPTZ,

    -- Document
    document_url TEXT,

    -- Metadata
    notes TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(contract_id, amendment_number)
);

CREATE INDEX idx_contract_amendments_contract ON contract_amendments(contract_id);
CREATE INDEX idx_contract_amendments_status ON contract_amendments(status);
CREATE INDEX idx_contract_amendments_org ON contract_amendments(organization_id);

-- Contract Clauses
CREATE TABLE contract_clauses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,

    -- Clause details
    clause_type clause_type NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    clause_number TEXT,

    -- Classification
    is_standard BOOLEAN DEFAULT true,
    risk_level clause_risk_level NOT NULL DEFAULT 'low',
    negotiable BOOLEAN DEFAULT true,

    -- Template (NULL contract_id = template clause)
    is_template BOOLEAN DEFAULT false,

    -- Display
    display_order INTEGER DEFAULT 0,

    -- Metadata
    notes TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contract_clauses_contract ON contract_clauses(contract_id);
CREATE INDEX idx_contract_clauses_type ON contract_clauses(clause_type);
CREATE INDEX idx_contract_clauses_risk ON contract_clauses(risk_level);
CREATE INDEX idx_contract_clauses_template ON contract_clauses(is_template) WHERE is_template = true;
CREATE INDEX idx_contract_clauses_org ON contract_clauses(organization_id);

-- Contract Obligations
CREATE TABLE contract_obligations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,

    -- Obligation details
    party obligation_party NOT NULL,
    description TEXT NOT NULL,
    clause_reference TEXT,

    -- Dates
    due_date DATE,
    completed_at TIMESTAMPTZ,

    -- Recurrence
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern TEXT,
    next_due_date DATE,

    -- Status
    status obligation_status NOT NULL DEFAULT 'pending',

    -- Evidence
    evidence_url TEXT,
    verified_by UUID REFERENCES profiles(id),
    verified_at TIMESTAMPTZ,

    -- Priority
    is_critical BOOLEAN DEFAULT false,

    -- Metadata
    notes TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contract_obligations_contract ON contract_obligations(contract_id);
CREATE INDEX idx_contract_obligations_party ON contract_obligations(party);
CREATE INDEX idx_contract_obligations_status ON contract_obligations(status);
CREATE INDEX idx_contract_obligations_due ON contract_obligations(due_date);
CREATE INDEX idx_contract_obligations_critical ON contract_obligations(is_critical) WHERE is_critical = true;
CREATE INDEX idx_contract_obligations_org ON contract_obligations(organization_id);

-- IP Rights
CREATE TABLE ip_rights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,

    -- IP details
    asset_type ip_asset_type NOT NULL,
    asset_description TEXT NOT NULL,

    -- Ownership
    owner obligation_party NOT NULL,
    license_type ip_license_type NOT NULL,

    -- Scope
    territory TEXT DEFAULT 'worldwide',
    duration TEXT,
    exclusivity BOOLEAN DEFAULT false,
    sublicensable BOOLEAN DEFAULT false,

    -- Restrictions
    restrictions TEXT,
    permitted_uses TEXT,
    prohibited_uses TEXT,

    -- Financial
    royalty_terms TEXT,
    royalty_rate NUMERIC(5,2),
    buyout_amount NUMERIC(14,2),

    -- Dates
    effective_date DATE,
    expiry_date DATE,

    -- Metadata
    notes TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ip_rights_contract ON ip_rights(contract_id);
CREATE INDEX idx_ip_rights_type ON ip_rights(asset_type);
CREATE INDEX idx_ip_rights_owner ON ip_rights(owner);
CREATE INDEX idx_ip_rights_license ON ip_rights(license_type);
CREATE INDEX idx_ip_rights_org ON ip_rights(organization_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: PERMITS & LICENSING
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE permits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Type & Jurisdiction
    permit_type permit_type NOT NULL,
    jurisdiction TEXT NOT NULL,
    jurisdiction_level TEXT DEFAULT 'local' CHECK (jurisdiction_level IN ('local', 'county', 'state', 'federal', 'international')),
    issuing_authority TEXT,

    -- Entity (polymorphic)
    entity_type permit_entity_type NOT NULL,
    entity_id UUID NOT NULL,

    -- Identification
    permit_number TEXT,
    title TEXT NOT NULL,
    description TEXT,

    -- Dates
    applied_date DATE,
    submitted_date DATE,
    approved_date DATE,
    effective_date DATE,
    expiry_date DATE,
    renewal_date DATE,

    -- Cost
    application_fee NUMERIC(10,2),
    permit_fee NUMERIC(10,2),
    total_cost NUMERIC(10,2),

    -- Status
    status permit_status NOT NULL DEFAULT 'required',

    -- Conditions
    conditions TEXT,
    conditions_met BOOLEAN DEFAULT false,

    -- Inspection
    requires_inspection BOOLEAN DEFAULT false,
    inspection_date DATE,
    inspection_passed BOOLEAN,
    inspector_name TEXT,

    -- Blocking
    blocks_entity BOOLEAN DEFAULT true,

    -- Document
    document_url TEXT,
    application_url TEXT,

    -- Metadata
    notes TEXT,
    tags TEXT[] DEFAULT '{}',

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_permits_type ON permits(permit_type);
CREATE INDEX idx_permits_entity ON permits(entity_type, entity_id);
CREATE INDEX idx_permits_status ON permits(status);
CREATE INDEX idx_permits_expiry ON permits(expiry_date);
CREATE INDEX idx_permits_jurisdiction ON permits(jurisdiction);
CREATE INDEX idx_permits_org ON permits(organization_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: ENGINEERING APPROVALS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE engineering_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Type
    approval_type engineering_approval_type NOT NULL,

    -- Entity (polymorphic: activation, location, asset)
    entity_type TEXT NOT NULL CHECK (entity_type IN ('activation', 'location', 'asset', 'event')),
    entity_id UUID NOT NULL,

    -- Engineer details
    engineer_name TEXT NOT NULL,
    engineer_license_number TEXT,
    engineering_firm TEXT,

    -- Approval
    status engineering_approval_status NOT NULL DEFAULT 'pending',
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    valid_until DATE,

    -- Documents
    calculations_url TEXT,
    drawings_url TEXT,
    approval_document_url TEXT,

    -- Conditions
    conditions TEXT,
    conditions_met BOOLEAN DEFAULT false,

    -- Inspection
    load_chart_url TEXT,
    inspection_schedule JSONB DEFAULT '[]',
    last_inspection_date DATE,
    last_inspection_result TEXT,

    -- Metadata
    notes TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_engineering_approvals_type ON engineering_approvals(approval_type);
CREATE INDEX idx_engineering_approvals_entity ON engineering_approvals(entity_type, entity_id);
CREATE INDEX idx_engineering_approvals_status ON engineering_approvals(status);
CREATE INDEX idx_engineering_approvals_valid ON engineering_approvals(valid_until);
CREATE INDEX idx_engineering_approvals_org ON engineering_approvals(organization_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6: COMPLIANCE CHECKLISTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE compliance_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Type
    checklist_type compliance_checklist_type NOT NULL,

    -- Entity (polymorphic)
    entity_type TEXT NOT NULL CHECK (entity_type IN ('location', 'activation', 'event', 'project', 'asset')),
    entity_id UUID NOT NULL,

    -- Content
    title TEXT NOT NULL,
    description TEXT,
    items JSONB NOT NULL DEFAULT '[]',

    -- Progress
    total_items INTEGER DEFAULT 0,
    completed_items INTEGER DEFAULT 0,
    completion_percent INTEGER DEFAULT 0 CHECK (completion_percent >= 0 AND completion_percent <= 100),

    -- Status
    status compliance_checklist_status NOT NULL DEFAULT 'not_started',

    -- Inspector
    inspector_id UUID REFERENCES profiles(id),
    inspected_at TIMESTAMPTZ,
    findings TEXT,
    remediation_required TEXT,
    remediation_deadline DATE,

    -- Next inspection
    next_due DATE,
    recurrence_days INTEGER,

    -- Metadata
    notes TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_compliance_checklists_type ON compliance_checklists(checklist_type);
CREATE INDEX idx_compliance_checklists_entity ON compliance_checklists(entity_type, entity_id);
CREATE INDEX idx_compliance_checklists_status ON compliance_checklists(status);
CREATE INDEX idx_compliance_checklists_next ON compliance_checklists(next_due);
CREATE INDEX idx_compliance_checklists_org ON compliance_checklists(organization_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 7: ASSET CERTIFICATIONS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE asset_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,

    -- Certification
    cert_type asset_certification_type NOT NULL,
    title TEXT NOT NULL,
    cert_number TEXT,

    -- Issuer
    issued_by TEXT NOT NULL,
    issuer_license TEXT,

    -- Dates
    issued_date DATE NOT NULL,
    expiry_date DATE,
    next_inspection_date DATE,

    -- Status
    status asset_certification_status NOT NULL DEFAULT 'current',

    -- Blocking
    blocks_usage BOOLEAN DEFAULT true,

    -- Document
    document_url TEXT,

    -- Metadata
    notes TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_asset_certs_asset ON asset_certifications(asset_id);
CREATE INDEX idx_asset_certs_type ON asset_certifications(cert_type);
CREATE INDEX idx_asset_certs_status ON asset_certifications(status);
CREATE INDEX idx_asset_certs_expiry ON asset_certifications(expiry_date);
CREATE INDEX idx_asset_certs_org ON asset_certifications(organization_id);

-- Enhance assets table with certification tracking
ALTER TABLE assets
    ADD COLUMN IF NOT EXISTS last_certification_date DATE,
    ADD COLUMN IF NOT EXISTS next_certification_date DATE,
    ADD COLUMN IF NOT EXISTS certification_status asset_certification_status;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 8: BUDGET APPROVALS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE budget_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- What is being approved
    entity_type approval_entity_type NOT NULL,
    entity_id UUID NOT NULL,

    -- Amount
    amount NUMERIC(14,2) NOT NULL,
    currency TEXT DEFAULT 'USD',

    -- Threshold
    threshold_rule TEXT,
    threshold_amount NUMERIC(14,2),

    -- Request
    requested_by UUID NOT NULL REFERENCES profiles(id),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    justification TEXT,

    -- Approval
    approver_id UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    status approval_status NOT NULL DEFAULT 'pending',

    -- Delegation
    delegated_from UUID REFERENCES profiles(id),
    delegated_reason TEXT,

    -- Expiry
    expires_at TIMESTAMPTZ,

    -- Chain (for multi-level approval)
    parent_approval_id UUID REFERENCES budget_approvals(id) ON DELETE SET NULL,
    approval_level INTEGER DEFAULT 1,

    -- Metadata
    notes TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_budget_approvals_entity ON budget_approvals(entity_type, entity_id);
CREATE INDEX idx_budget_approvals_status ON budget_approvals(status);
CREATE INDEX idx_budget_approvals_approver ON budget_approvals(approver_id);
CREATE INDEX idx_budget_approvals_requested ON budget_approvals(requested_by);
CREATE INDEX idx_budget_approvals_org ON budget_approvals(organization_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 9: PAYMENT APPROVALS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE payment_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- What payment
    payment_type payment_approval_type NOT NULL,
    entity_id UUID NOT NULL,

    -- Amount
    amount NUMERIC(14,2) NOT NULL,
    currency TEXT DEFAULT 'USD',

    -- Vendor/Payee
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    payee_name TEXT,

    -- Threshold
    threshold_rule TEXT,
    threshold_amount NUMERIC(14,2),

    -- Request
    requested_by UUID NOT NULL REFERENCES profiles(id),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Approval
    approver_id UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    status approval_status NOT NULL DEFAULT 'pending',

    -- Delegation
    delegated_from UUID REFERENCES profiles(id),

    -- Prerequisites
    three_way_match_verified BOOLEAN DEFAULT false,
    vendor_compliance_verified BOOLEAN DEFAULT false,
    budget_within_limit BOOLEAN DEFAULT false,

    -- Expiry
    expires_at TIMESTAMPTZ,

    -- Metadata
    notes TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_approvals_type ON payment_approvals(payment_type);
CREATE INDEX idx_payment_approvals_status ON payment_approvals(status);
CREATE INDEX idx_payment_approvals_vendor ON payment_approvals(vendor_id);
CREATE INDEX idx_payment_approvals_approver ON payment_approvals(approver_id);
CREATE INDEX idx_payment_approvals_org ON payment_approvals(organization_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 10: PURCHASE REQUISITIONS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE purchase_requisitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- Identification
    number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,

    -- Requester
    requester_id UUID NOT NULL REFERENCES profiles(id),

    -- Line items
    line_items JSONB NOT NULL DEFAULT '[]',

    -- Budget
    estimated_cost NUMERIC(14,2) NOT NULL DEFAULT 0,
    budget_code TEXT,
    gl_account_id UUID REFERENCES gl_accounts(id) ON DELETE SET NULL,
    department department,

    -- Urgency
    urgency requisition_urgency NOT NULL DEFAULT 'normal',
    needed_by DATE,

    -- Justification
    justification TEXT,

    -- Vendor suggestion
    suggested_vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,

    -- Status
    status requisition_status NOT NULL DEFAULT 'draft',

    -- Approval
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,

    -- Conversion
    converted_po_id UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,

    -- Metadata
    notes TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, number)
);

CREATE INDEX idx_purchase_reqs_project ON purchase_requisitions(project_id);
CREATE INDEX idx_purchase_reqs_status ON purchase_requisitions(status);
CREATE INDEX idx_purchase_reqs_requester ON purchase_requisitions(requester_id);
CREATE INDEX idx_purchase_reqs_urgency ON purchase_requisitions(urgency);
CREATE INDEX idx_purchase_reqs_org ON purchase_requisitions(organization_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 11: GOODS RECEIPTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE goods_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,

    -- Identification
    receipt_number TEXT NOT NULL,

    -- Receiver
    received_by UUID NOT NULL REFERENCES profiles(id),
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Line items (qty received per PO line)
    line_items JSONB NOT NULL DEFAULT '[]',

    -- Status
    status goods_receipt_status NOT NULL DEFAULT 'pending',

    -- Quality
    condition_notes TEXT,
    discrepancies TEXT,
    photos TEXT[] DEFAULT '{}',

    -- Signoff
    signed_by UUID REFERENCES profiles(id),
    signed_at TIMESTAMPTZ,

    -- Document
    document_url TEXT,

    -- Location
    delivery_location TEXT,
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,

    -- Metadata
    notes TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, receipt_number)
);

CREATE INDEX idx_goods_receipts_po ON goods_receipts(purchase_order_id);
CREATE INDEX idx_goods_receipts_status ON goods_receipts(status);
CREATE INDEX idx_goods_receipts_received ON goods_receipts(received_at);
CREATE INDEX idx_goods_receipts_org ON goods_receipts(organization_id);

-- Enhance purchase_orders for procurement governance
ALTER TABLE purchase_orders
    ADD COLUMN IF NOT EXISTS contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS requisition_id UUID REFERENCES purchase_requisitions(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS goods_receipt_required BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS budget_approval_id UUID REFERENCES budget_approvals(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_purchase_orders_contract ON purchase_orders(contract_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_requisition ON purchase_orders(requisition_id);

-- Enhance invoices for 3-way matching
ALTER TABLE invoices
    ADD COLUMN IF NOT EXISTS goods_receipt_id UUID REFERENCES goods_receipts(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS three_way_match_status three_way_match_status DEFAULT 'not_applicable',
    ADD COLUMN IF NOT EXISTS payment_approval_id UUID REFERENCES payment_approvals(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_invoices_goods_receipt ON invoices(goods_receipt_id);
CREATE INDEX IF NOT EXISTS idx_invoices_match_status ON invoices(three_way_match_status);

-- Enhance budget_line_items with GL mapping
ALTER TABLE budget_line_items
    ADD COLUMN IF NOT EXISTS gl_account_id UUID REFERENCES gl_accounts(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS capex_opex capex_opex;

CREATE INDEX IF NOT EXISTS idx_budget_line_items_gl ON budget_line_items(gl_account_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 12: VENDOR RISK SCORES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE vendor_risk_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

    -- Snapshot date
    score_date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Composite score (0-100)
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),

    -- Component scores (0-100)
    financial_score INTEGER DEFAULT 0 CHECK (financial_score >= 0 AND financial_score <= 100),
    compliance_score INTEGER DEFAULT 0 CHECK (compliance_score >= 0 AND compliance_score <= 100),
    performance_score INTEGER DEFAULT 0 CHECK (performance_score >= 0 AND performance_score <= 100),
    operational_score INTEGER DEFAULT 0 CHECK (operational_score >= 0 AND operational_score <= 100),

    -- Risk level
    risk_level vendor_risk_level NOT NULL DEFAULT 'medium',

    -- Details
    risk_factors JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',

    -- Context
    total_spend NUMERIC(14,2) DEFAULT 0,
    active_po_count INTEGER DEFAULT 0,
    overdue_invoice_count INTEGER DEFAULT 0,
    incident_count INTEGER DEFAULT 0,

    -- Metadata
    notes TEXT,
    scored_by UUID REFERENCES profiles(id),

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(vendor_id, score_date)
);

CREATE INDEX idx_vendor_risk_scores_vendor ON vendor_risk_scores(vendor_id);
CREATE INDEX idx_vendor_risk_scores_date ON vendor_risk_scores(score_date DESC);
CREATE INDEX idx_vendor_risk_scores_risk ON vendor_risk_scores(risk_level);
CREATE INDEX idx_vendor_risk_scores_org ON vendor_risk_scores(organization_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 13: ENTITY DEPENDENCIES (Cross-Domain Enforcement)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE entity_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- What is blocked
    dependent_entity_type TEXT NOT NULL,
    dependent_entity_id UUID NOT NULL,

    -- What is required
    required_entity_type TEXT NOT NULL,
    required_entity_id UUID,

    -- Type
    dependency_type dependency_type NOT NULL DEFAULT 'hard_block',

    -- Description
    description TEXT,

    -- Status
    status dependency_status NOT NULL DEFAULT 'pending',
    satisfied_at TIMESTAMPTZ,
    satisfied_by UUID REFERENCES profiles(id),

    -- Waiver
    waived_by UUID REFERENCES profiles(id),
    waived_at TIMESTAMPTZ,
    waived_reason TEXT,

    -- Auto-check
    auto_check BOOLEAN DEFAULT true,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_entity_deps_dependent ON entity_dependencies(dependent_entity_type, dependent_entity_id);
CREATE INDEX idx_entity_deps_required ON entity_dependencies(required_entity_type, required_entity_id);
CREATE INDEX idx_entity_deps_status ON entity_dependencies(status);
CREATE INDEX idx_entity_deps_type ON entity_dependencies(dependency_type);
CREATE INDEX idx_entity_deps_org ON entity_dependencies(organization_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 14: GOVERNANCE AUDIT LOG (Immutable)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE governance_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Domain
    domain governance_domain NOT NULL,

    -- Entity
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,

    -- Action
    action governance_action NOT NULL,

    -- Actor
    actor_id UUID REFERENCES profiles(id),
    actor_role TEXT,

    -- Change details
    field_name TEXT,
    old_value TEXT,
    new_value TEXT,
    change_summary TEXT,

    -- Snapshot
    metadata JSONB DEFAULT '{}',

    -- Security
    ip_address TEXT,

    -- Immutable timestamp
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX idx_gov_audit_domain ON governance_audit_log(domain);
CREATE INDEX idx_gov_audit_entity ON governance_audit_log(entity_type, entity_id);
CREATE INDEX idx_gov_audit_action ON governance_audit_log(action);
CREATE INDEX idx_gov_audit_actor ON governance_audit_log(actor_id);
CREATE INDEX idx_gov_audit_date ON governance_audit_log(logged_at DESC);
CREATE INDEX idx_gov_audit_org ON governance_audit_log(organization_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 15: ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE gl_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_amendments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_rights ENABLE ROW LEVEL SECURITY;
ALTER TABLE permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goods_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_audit_log ENABLE ROW LEVEL SECURITY;

-- Org-based CRUD policies for standard tables
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'gl_accounts', 'insurance_requirements', 'insurance_policies',
        'contract_amendments', 'contract_clauses', 'contract_obligations',
        'ip_rights', 'permits', 'engineering_approvals', 'compliance_checklists',
        'asset_certifications', 'budget_approvals', 'payment_approvals',
        'purchase_requisitions', 'goods_receipts', 'vendor_risk_scores',
        'entity_dependencies'
    ])
    LOOP
        EXECUTE format('
            CREATE POLICY "Users can view %I in their org" ON %I
                FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
            CREATE POLICY "Users can insert %I in their org" ON %I
                FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
            CREATE POLICY "Users can update %I in their org" ON %I
                FOR UPDATE USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
            CREATE POLICY "Users can delete %I in their org" ON %I
                FOR DELETE USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
        ', tbl, tbl, tbl, tbl, tbl, tbl, tbl, tbl);
    END LOOP;
END $$;

-- Governance audit log: INSERT and SELECT only (immutable)
CREATE POLICY "Users can view governance_audit_log in their org" ON governance_audit_log
    FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert governance_audit_log in their org" ON governance_audit_log
    FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
-- No UPDATE or DELETE policies — immutable by design

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 16: TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

-- updated_at triggers
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'gl_accounts', 'insurance_requirements', 'insurance_policies',
        'contract_amendments', 'contract_clauses', 'contract_obligations',
        'ip_rights', 'permits', 'engineering_approvals', 'compliance_checklists',
        'asset_certifications', 'budget_approvals', 'payment_approvals',
        'purchase_requisitions', 'goods_receipts', 'entity_dependencies'
    ])
    LOOP
        EXECUTE format('
            CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ', tbl, tbl);
    END LOOP;
END $$;

-- Activity log triggers for key lifecycle tables
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'insurance_policies', 'contract_amendments', 'permits',
        'engineering_approvals', 'budget_approvals', 'payment_approvals',
        'purchase_requisitions', 'goods_receipts', 'entity_dependencies'
    ])
    LOOP
        EXECUTE format('
            CREATE TRIGGER log_%I_activity AFTER INSERT OR UPDATE OR DELETE ON %I
                FOR EACH ROW EXECUTE FUNCTION log_activity();
        ', tbl, tbl);
    END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 17: GOVERNANCE AUDIT TRIGGERS
-- Auto-log governance events to governance_audit_log.
-- ─────────────────────────────────────────────────────────────────────────────

-- Permit status changes
CREATE OR REPLACE FUNCTION log_permit_governance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO governance_audit_log (domain, entity_type, entity_id, action, actor_id, change_summary, metadata, organization_id)
        VALUES ('compliance', 'permit', NEW.id, 'created', auth.uid(),
            'Permit created: ' || NEW.title || ' (' || NEW.permit_type || ')',
            to_jsonb(NEW), NEW.organization_id);
    ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO governance_audit_log (domain, entity_type, entity_id, action, actor_id, field_name, old_value, new_value, change_summary, metadata, organization_id)
        VALUES ('compliance', 'permit', NEW.id,
            CASE NEW.status::text
                WHEN 'approved' THEN 'approved'
                WHEN 'expired' THEN 'expired'
                WHEN 'revoked' THEN 'revoked'
                WHEN 'renewed' THEN 'renewed'
                WHEN 'submitted' THEN 'submitted'
                ELSE 'updated'
            END,
            auth.uid(), 'status', OLD.status::text, NEW.status::text,
            'Permit status: ' || OLD.status || ' → ' || NEW.status,
            jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)), NEW.organization_id);
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_permit_governance_trigger
    AFTER INSERT OR UPDATE ON permits
    FOR EACH ROW EXECUTE FUNCTION log_permit_governance();

-- Insurance policy status changes
CREATE OR REPLACE FUNCTION log_insurance_governance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO governance_audit_log (domain, entity_type, entity_id, action, actor_id, change_summary, metadata, organization_id)
        VALUES ('legal', 'insurance_policy', NEW.id, 'created', auth.uid(),
            'Insurance policy created: ' || NEW.carrier || ' ' || NEW.policy_number,
            to_jsonb(NEW), NEW.organization_id);
    ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO governance_audit_log (domain, entity_type, entity_id, action, actor_id, field_name, old_value, new_value, change_summary, metadata, organization_id)
        VALUES ('legal', 'insurance_policy', NEW.id,
            CASE NEW.status::text
                WHEN 'active' THEN 'verified'
                WHEN 'expired' THEN 'expired'
                WHEN 'suspended' THEN 'suspended'
                ELSE 'updated'
            END,
            auth.uid(), 'status', OLD.status::text, NEW.status::text,
            'Insurance status: ' || OLD.status || ' → ' || NEW.status,
            jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)), NEW.organization_id);
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_insurance_governance_trigger
    AFTER INSERT OR UPDATE ON insurance_policies
    FOR EACH ROW EXECUTE FUNCTION log_insurance_governance();

-- Budget/Payment approval governance logging
CREATE OR REPLACE FUNCTION log_approval_governance()
RETURNS TRIGGER AS $$
DECLARE
    v_domain governance_domain;
    v_entity_type TEXT;
BEGIN
    IF TG_TABLE_NAME = 'budget_approvals' THEN
        v_domain := 'finance';
        v_entity_type := 'budget_approval';
    ELSE
        v_domain := 'finance';
        v_entity_type := 'payment_approval';
    END IF;

    IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO governance_audit_log (domain, entity_type, entity_id, action, actor_id, field_name, old_value, new_value, change_summary, metadata, organization_id)
        VALUES (v_domain, v_entity_type, NEW.id,
            CASE NEW.status::text
                WHEN 'approved' THEN 'approved'
                WHEN 'rejected' THEN 'rejected'
                WHEN 'escalated' THEN 'escalated'
                WHEN 'delegated' THEN 'delegated'
                ELSE 'updated'
            END,
            auth.uid(), 'status', OLD.status::text, NEW.status::text,
            v_entity_type || ' status: ' || OLD.status || ' → ' || NEW.status,
            jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)), NEW.organization_id);
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_budget_approval_governance_trigger
    AFTER UPDATE ON budget_approvals
    FOR EACH ROW EXECUTE FUNCTION log_approval_governance();

CREATE TRIGGER log_payment_approval_governance_trigger
    AFTER UPDATE ON payment_approvals
    FOR EACH ROW EXECUTE FUNCTION log_approval_governance();

-- Dependency waiver governance logging
CREATE OR REPLACE FUNCTION log_dependency_governance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO governance_audit_log (domain, entity_type, entity_id, action, actor_id, field_name, old_value, new_value, change_summary, metadata, organization_id)
        VALUES (
            'compliance', 'entity_dependency', NEW.id,
            CASE NEW.status::text
                WHEN 'satisfied' THEN 'verified'
                WHEN 'waived' THEN 'waived'
                WHEN 'expired' THEN 'expired'
                ELSE 'updated'
            END,
            auth.uid(), 'status', OLD.status::text, NEW.status::text,
            'Dependency ' || NEW.required_entity_type || ' for ' || NEW.dependent_entity_type || ': ' || OLD.status || ' → ' || NEW.status,
            jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)), NEW.organization_id);
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_dependency_governance_trigger
    AFTER UPDATE ON entity_dependencies
    FOR EACH ROW EXECUTE FUNCTION log_dependency_governance();

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 18: DEPENDENCY AUTO-SATISFACTION
-- When a permit is approved, auto-satisfy matching entity_dependencies.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION auto_satisfy_permit_dependencies()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('approved', 'active') AND (OLD.status IS NULL OR OLD.status NOT IN ('approved', 'active')) THEN
        UPDATE entity_dependencies
        SET status = 'satisfied',
            satisfied_at = NOW(),
            satisfied_by = auth.uid()
        WHERE required_entity_type = 'permit'
          AND (required_entity_id = NEW.id OR required_entity_id IS NULL)
          AND dependent_entity_type = NEW.entity_type::text
          AND dependent_entity_id = NEW.entity_id
          AND status = 'pending'
          AND auto_check = true;
    END IF;

    IF NEW.status IN ('expired', 'revoked') AND OLD.status IN ('approved', 'active') THEN
        UPDATE entity_dependencies
        SET status = 'expired',
            updated_at = NOW()
        WHERE required_entity_type = 'permit'
          AND required_entity_id = NEW.id
          AND status = 'satisfied';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER auto_satisfy_permit_deps_trigger
    AFTER UPDATE ON permits
    FOR EACH ROW EXECUTE FUNCTION auto_satisfy_permit_dependencies();

-- Auto-satisfy insurance dependencies
CREATE OR REPLACE FUNCTION auto_satisfy_insurance_dependencies()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
        UPDATE entity_dependencies
        SET status = 'satisfied',
            satisfied_at = NOW(),
            satisfied_by = auth.uid()
        WHERE required_entity_type = 'insurance_policy'
          AND (required_entity_id = NEW.id OR required_entity_id IS NULL)
          AND dependent_entity_type = NEW.holder_type::text
          AND dependent_entity_id = NEW.holder_id
          AND status = 'pending'
          AND auto_check = true;
    END IF;

    IF NEW.status IN ('expired', 'suspended', 'cancelled') AND OLD.status = 'active' THEN
        UPDATE entity_dependencies
        SET status = 'expired',
            updated_at = NOW()
        WHERE required_entity_type = 'insurance_policy'
          AND required_entity_id = NEW.id
          AND status = 'satisfied';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER auto_satisfy_insurance_deps_trigger
    AFTER UPDATE ON insurance_policies
    FOR EACH ROW EXECUTE FUNCTION auto_satisfy_insurance_dependencies();

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 19: 3-WAY MATCH FUNCTION
-- Compares PO, goods receipt, and invoice amounts.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION check_three_way_match(
    p_invoice_id UUID,
    p_tolerance_percent NUMERIC DEFAULT 5.0
)
RETURNS three_way_match_status AS $$
DECLARE
    v_po_total NUMERIC;
    v_gr_total NUMERIC;
    v_inv_total NUMERIC;
    v_po_id UUID;
    v_gr_id UUID;
    v_tolerance NUMERIC;
BEGIN
    -- Get invoice details
    SELECT purchase_order_id, goods_receipt_id, amount
    INTO v_po_id, v_gr_id, v_inv_total
    FROM invoices
    WHERE id = p_invoice_id;

    -- No PO = not applicable
    IF v_po_id IS NULL THEN
        RETURN 'not_applicable';
    END IF;

    -- Get PO total
    SELECT total_amount INTO v_po_total
    FROM purchase_orders
    WHERE id = v_po_id;

    -- Check if goods receipt exists
    IF v_gr_id IS NULL THEN
        RETURN 'pending_receipt';
    END IF;

    -- Get GR total from line items
    SELECT COALESCE(
        (SELECT SUM((item->>'quantity')::numeric * (item->>'unit_price')::numeric)
         FROM goods_receipts gr, jsonb_array_elements(gr.line_items) AS item
         WHERE gr.id = v_gr_id), 0
    ) INTO v_gr_total;

    -- Calculate tolerance
    v_tolerance := v_po_total * (p_tolerance_percent / 100.0);

    -- Check all three match within tolerance
    IF ABS(v_po_total - v_inv_total) <= v_tolerance
       AND ABS(v_po_total - v_gr_total) <= v_tolerance
       AND ABS(v_inv_total - v_gr_total) <= v_tolerance THEN
        RETURN 'matched';
    ELSE
        RETURN 'variance_flagged';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 20: ASSET CERTIFICATION RECALCULATION
-- Updates assets.certification_status and next_certification_date.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION recalculate_asset_certification()
RETURNS TRIGGER AS $$
DECLARE
    v_asset_id UUID;
    v_next_date DATE;
    v_has_expired BOOLEAN;
    v_has_expiring BOOLEAN;
BEGIN
    v_asset_id := COALESCE(NEW.asset_id, OLD.asset_id);

    SELECT
        MIN(COALESCE(expiry_date, next_inspection_date)),
        BOOL_OR(status = 'expired'),
        BOOL_OR(status = 'expiring_soon')
    INTO v_next_date, v_has_expired, v_has_expiring
    FROM asset_certifications
    WHERE asset_id = v_asset_id
      AND status NOT IN ('expired');

    UPDATE assets
    SET next_certification_date = v_next_date,
        last_certification_date = (
            SELECT MAX(issued_date) FROM asset_certifications WHERE asset_id = v_asset_id
        ),
        certification_status = CASE
            WHEN v_has_expired THEN 'expired'::asset_certification_status
            WHEN v_has_expiring THEN 'expiring_soon'::asset_certification_status
            ELSE 'current'::asset_certification_status
        END
    WHERE id = v_asset_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER recalculate_asset_cert_trigger
    AFTER INSERT OR UPDATE OR DELETE ON asset_certifications
    FOR EACH ROW EXECUTE FUNCTION recalculate_asset_certification();
