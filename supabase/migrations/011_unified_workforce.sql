-- ═══════════════════════════════════════════════════════════════════════════
-- FROZEN PHOENIX — Unified Workforce Lifecycle (Phase 1 + 2 + 3)
-- Resolves SSOT violations between crew_members and vendors.
-- Creates unified worker identity, classification-aware onboarding,
-- universal compliance, performance reviews, and offboarding.
-- Maintains 3NF compliance and backward compatibility via bridge FKs.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────────────────────

-- Extend employment_type with seasonal
ALTER TYPE employment_type ADD VALUE IF NOT EXISTS 'seasonal';

-- Unified lifecycle status for all worker types
CREATE TYPE worker_lifecycle_status AS ENUM (
    'prospect', 'onboarding', 'active', 'on_leave',
    'suspended', 'offboarding', 'alumni', 'do_not_engage'
);

-- Worker classification (superset of employment_type + vendor_type)
CREATE TYPE worker_classification AS ENUM (
    'full_time_employee', 'part_time_employee', 'seasonal_employee',
    'contract_employee', 'independent_contractor', 'subcontractor',
    'freelancer', 'agency_worker', 'temp_worker', 'intern', 'volunteer'
);

-- Tax classification
CREATE TYPE tax_classification AS ENUM ('w2', 'w2_seasonal', '1099', 'corp_to_corp', 'foreign', 'exempt');

-- Onboarding/offboarding step status
CREATE TYPE lifecycle_step_status AS ENUM ('not_started', 'in_progress', 'completed', 'skipped', 'blocked', 'overdue');

-- Review target type (extends vendor reviews to all workers)
CREATE TYPE review_target_type AS ENUM ('employee', 'contractor', 'vendor', 'freelancer', 'intern');

-- Compliance doc scope (unified for crew + vendor)
CREATE TYPE compliance_scope AS ENUM ('employment', 'vendor', 'universal');

-- IC assessment method
CREATE TYPE ic_assessment_method AS ENUM ('irs_20_factor', 'abc_test', 'economic_reality', 'common_law', 'custom');

-- IC assessment result
CREATE TYPE ic_assessment_result AS ENUM ('properly_classified', 'at_risk', 'misclassified', 'needs_review');

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: WORKER PROFILES — Single Source of Truth
-- Every person who works with the organization has exactly one row here.
-- Bridge FKs on crew_members and vendors link back to this identity.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE worker_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identity
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    preferred_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,

    -- Emergency
    emergency_contact_name TEXT,
    emergency_contact_relationship TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_email TEXT,

    -- Primary classification (the "main" classification if multiple)
    primary_classification worker_classification NOT NULL,
    tax_classification tax_classification NOT NULL DEFAULT 'w2',

    -- Lifecycle
    lifecycle_status worker_lifecycle_status NOT NULL DEFAULT 'prospect',
    lifecycle_status_changed_at TIMESTAMPTZ DEFAULT NOW(),
    lifecycle_status_changed_by UUID REFERENCES profiles(id),

    -- Dates
    initial_engagement_date DATE,
    most_recent_engagement_date DATE,
    offboarding_date DATE,

    -- Portal access
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    portal_access_enabled BOOLEAN DEFAULT false,
    portal_last_login TIMESTAMPTZ,

    -- Skills & qualifications
    primary_role TEXT,
    secondary_roles TEXT[] DEFAULT '{}',
    skills TEXT[] DEFAULT '{}',
    department department,

    -- Location
    home_base TEXT,
    willing_to_travel BOOLEAN DEFAULT true,
    travel_radius INTEGER,

    -- Notes
    internal_notes TEXT,
    tags TEXT[] DEFAULT '{}',

    -- Flags
    preferred BOOLEAN DEFAULT false,
    do_not_engage BOOLEAN DEFAULT false,
    do_not_engage_reason TEXT,

    -- Org
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_worker_profiles_email_org ON worker_profiles(email, organization_id);
CREATE INDEX idx_worker_profiles_org ON worker_profiles(organization_id);
CREATE INDEX idx_worker_profiles_classification ON worker_profiles(primary_classification);
CREATE INDEX idx_worker_profiles_status ON worker_profiles(lifecycle_status);
CREATE INDEX idx_worker_profiles_skills ON worker_profiles USING GIN(skills);
CREATE INDEX idx_worker_profiles_tags ON worker_profiles USING GIN(tags);
CREATE INDEX idx_worker_profiles_department ON worker_profiles(department);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: WORKER CLASSIFICATIONS
-- A worker can hold multiple classifications simultaneously (e.g., a freelancer
-- who is also registered as a vendor). Each classification has its own terms.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE worker_classifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_profile_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,

    classification worker_classification NOT NULL,
    is_active BOOLEAN DEFAULT true,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,

    -- Tax
    tax_classification tax_classification NOT NULL DEFAULT 'w2',
    tax_id_on_file BOOLEAN DEFAULT false,

    -- Rates
    hourly_rate NUMERIC(10,2),
    overtime_rate NUMERIC(10,2),
    day_rate NUMERIC(10,2),
    rate_type rate_type DEFAULT 'hourly',
    rate_effective_date DATE,
    rate_notes TEXT,

    -- Employment-specific
    employee_id TEXT,
    benefits_eligible BOOLEAN DEFAULT false,
    pto_accrual_rate NUMERIC(6,2),
    supervisor_id UUID REFERENCES profiles(id),

    -- Seasonal-specific
    is_seasonal BOOLEAN DEFAULT false,
    season_start_month INTEGER CHECK (season_start_month >= 1 AND season_start_month <= 12),
    season_end_month INTEGER CHECK (season_end_month >= 1 AND season_end_month <= 12),
    seasons_completed INTEGER DEFAULT 0,
    returning_worker BOOLEAN DEFAULT false,

    -- Contract-specific
    contract_start_date DATE,
    contract_end_date DATE,
    contract_auto_renew BOOLEAN DEFAULT false,
    contract_renewal_notice_days INTEGER DEFAULT 30,
    agency_vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,

    -- Vendor/IC-specific
    company_name TEXT,
    payment_terms_days INTEGER DEFAULT 30,
    insurance_minimum NUMERIC(12,2),
    categories TEXT[] DEFAULT '{}',
    service_areas TEXT[] DEFAULT '{}',

    -- Union
    union_member BOOLEAN DEFAULT false,
    union_local TEXT,

    -- Notes
    notes TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(worker_profile_id, classification)
);

CREATE INDEX idx_worker_class_worker ON worker_classifications(worker_profile_id);
CREATE INDEX idx_worker_class_type ON worker_classifications(classification);
CREATE INDEX idx_worker_class_active ON worker_classifications(is_active);
CREATE INDEX idx_worker_class_seasonal ON worker_classifications(is_seasonal) WHERE is_seasonal = true;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: ENGAGEMENT TERMS
-- Tracks each discrete engagement (project assignment, contract period, etc.)
-- Preserves immutable history of all rate changes and assignments.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE engagement_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_profile_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
    classification_id UUID NOT NULL REFERENCES worker_classifications(id) ON DELETE CASCADE,

    -- What engagement
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
    contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,

    -- Role
    role TEXT NOT NULL,
    department department,

    -- Dates
    start_date DATE NOT NULL,
    end_date DATE,
    is_ongoing BOOLEAN DEFAULT false,

    -- Rates (snapshot at time of engagement)
    rate NUMERIC(10,2) NOT NULL,
    rate_type rate_type NOT NULL DEFAULT 'hourly',
    overtime_rate NUMERIC(10,2),
    not_to_exceed NUMERIC(12,2),
    estimated_hours NUMERIC(8,2),

    -- Status
    status assignment_status NOT NULL DEFAULT 'pending',

    -- Billing
    is_billable BOOLEAN DEFAULT true,
    billing_code TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_engagement_terms_worker ON engagement_terms(worker_profile_id);
CREATE INDEX idx_engagement_terms_project ON engagement_terms(project_id);
CREATE INDEX idx_engagement_terms_status ON engagement_terms(status);
CREATE INDEX idx_engagement_terms_dates ON engagement_terms(start_date, end_date);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: UNIFIED COMPLIANCE
-- Single compliance tracking system for ALL worker classifications.
-- Replaces dual tracking in certifications + vendor_compliance_docs.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE compliance_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    doc_type compliance_doc_type NOT NULL,
    description TEXT,

    -- Applicability
    applies_to_classifications worker_classification[] DEFAULT '{}',
    scope compliance_scope NOT NULL DEFAULT 'universal',

    -- Rules
    is_required BOOLEAN DEFAULT true,
    has_expiry BOOLEAN DEFAULT true,
    expiry_warning_days INTEGER DEFAULT 30,
    auto_suspend_on_expiry BOOLEAN DEFAULT false,
    blocks_scheduling BOOLEAN DEFAULT false,
    blocks_onboarding_completion BOOLEAN DEFAULT false,

    -- Display
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_compliance_templates_org ON compliance_templates(organization_id);
CREATE INDEX idx_compliance_templates_type ON compliance_templates(doc_type);
CREATE INDEX idx_compliance_templates_scope ON compliance_templates(scope);

CREATE TABLE worker_compliance_docs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_profile_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
    template_id UUID REFERENCES compliance_templates(id) ON DELETE SET NULL,

    -- Document
    doc_type compliance_doc_type NOT NULL,
    doc_name TEXT NOT NULL,
    doc_number TEXT,
    document_url TEXT,

    -- Dates
    issued_date DATE,
    expiry_date DATE,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,

    -- Status
    status compliance_doc_status NOT NULL DEFAULT 'not_submitted',
    reviewed_by UUID REFERENCES profiles(id),
    rejection_reason TEXT,

    -- Insurance-specific
    coverage_amount NUMERIC(12,2),
    policy_number TEXT,
    carrier_name TEXT,

    -- Notes
    notes TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_worker_compliance_worker ON worker_compliance_docs(worker_profile_id);
CREATE INDEX idx_worker_compliance_type ON worker_compliance_docs(doc_type);
CREATE INDEX idx_worker_compliance_status ON worker_compliance_docs(status);
CREATE INDEX idx_worker_compliance_expiry ON worker_compliance_docs(expiry_date);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: ONBOARDING & OFFBOARDING
-- Template-driven step system that adapts per classification.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE onboarding_step_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,

    -- Applicability
    applies_to_classifications worker_classification[] DEFAULT '{}',

    -- Step config
    step_order INTEGER NOT NULL DEFAULT 0,
    is_required BOOLEAN DEFAULT true,
    default_due_days INTEGER DEFAULT 7,
    assignee_role TEXT,

    -- Linked compliance doc (if this step = "upload doc X")
    linked_compliance_template_id UUID REFERENCES compliance_templates(id) ON DELETE SET NULL,

    -- Automation
    auto_complete_on_doc_approval BOOLEAN DEFAULT false,

    is_active BOOLEAN DEFAULT true,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_onboarding_templates_org ON onboarding_step_templates(organization_id);
CREATE INDEX idx_onboarding_templates_class ON onboarding_step_templates USING GIN(applies_to_classifications);

CREATE TABLE worker_onboarding_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_profile_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
    classification_id UUID REFERENCES worker_classifications(id) ON DELETE SET NULL,

    -- Run details
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    target_completion_date DATE,

    -- Status
    status lifecycle_step_status NOT NULL DEFAULT 'not_started',
    total_steps INTEGER DEFAULT 0,
    completed_steps INTEGER DEFAULT 0,

    -- Notes
    notes TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_onboarding_runs_worker ON worker_onboarding_runs(worker_profile_id);
CREATE INDEX idx_onboarding_runs_status ON worker_onboarding_runs(status);

CREATE TABLE onboarding_step_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES worker_onboarding_runs(id) ON DELETE CASCADE,
    template_step_id UUID NOT NULL REFERENCES onboarding_step_templates(id) ON DELETE CASCADE,

    -- Progress
    status lifecycle_step_status NOT NULL DEFAULT 'not_started',
    due_date DATE,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES profiles(id),
    assigned_to UUID REFERENCES profiles(id),

    -- Evidence
    evidence_url TEXT,
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_onboarding_progress_run ON onboarding_step_progress(run_id);
CREATE INDEX idx_onboarding_progress_status ON onboarding_step_progress(status);

-- Offboarding (mirrors onboarding structure)
CREATE TABLE offboarding_step_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    applies_to_classifications worker_classification[] DEFAULT '{}',
    step_order INTEGER NOT NULL DEFAULT 0,
    is_required BOOLEAN DEFAULT true,
    default_due_days INTEGER DEFAULT 3,
    assignee_role TEXT,
    is_active BOOLEAN DEFAULT true,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE worker_offboarding_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_profile_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
    reason TEXT,
    is_voluntary BOOLEAN,
    eligible_for_rehire BOOLEAN,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status lifecycle_step_status NOT NULL DEFAULT 'not_started',
    total_steps INTEGER DEFAULT 0,
    completed_steps INTEGER DEFAULT 0,
    exit_interview_completed BOOLEAN DEFAULT false,
    exit_interview_notes TEXT,
    final_review_id UUID,
    notes TEXT,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_offboarding_runs_worker ON worker_offboarding_runs(worker_profile_id);
CREATE INDEX idx_offboarding_runs_status ON worker_offboarding_runs(status);

CREATE TABLE offboarding_step_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES worker_offboarding_runs(id) ON DELETE CASCADE,
    template_step_id UUID NOT NULL REFERENCES offboarding_step_templates(id) ON DELETE CASCADE,
    status lifecycle_step_status NOT NULL DEFAULT 'not_started',
    due_date DATE,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES profiles(id),
    assigned_to UUID REFERENCES profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_offboarding_progress_run ON offboarding_step_progress(run_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6: UNIVERSAL PERFORMANCE REVIEWS
-- Extends vendor_reviews pattern to ALL worker classifications.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE worker_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_profile_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,

    -- Context
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
    engagement_term_id UUID REFERENCES engagement_terms(id) ON DELETE SET NULL,

    -- Reviewer
    reviewer_id UUID NOT NULL REFERENCES profiles(id),
    review_type vendor_review_type NOT NULL DEFAULT 'periodic',
    target_type review_target_type NOT NULL DEFAULT 'employee',

    -- Ratings (1-5 scale, universal)
    overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
    reliability_rating INTEGER CHECK (reliability_rating >= 1 AND reliability_rating <= 5),
    safety_rating INTEGER CHECK (safety_rating >= 1 AND safety_rating <= 5),

    -- Feedback
    strengths TEXT,
    areas_for_improvement TEXT,
    goals TEXT,
    comments TEXT,
    would_reengage BOOLEAN,

    -- Period
    review_period_start DATE,
    review_period_end DATE,
    review_date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Acknowledgment
    acknowledged_at TIMESTAMPTZ,
    acknowledgment_notes TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_worker_reviews_worker ON worker_reviews(worker_profile_id);
CREATE INDEX idx_worker_reviews_reviewer ON worker_reviews(reviewer_id);
CREATE INDEX idx_worker_reviews_project ON worker_reviews(project_id);
CREATE INDEX idx_worker_reviews_date ON worker_reviews(review_date);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 7: IC MISCLASSIFICATION SAFEGUARDS
-- Records classification assessments for ICs to demonstrate compliance.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE classification_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_profile_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,

    -- Assessment
    assessment_method ic_assessment_method NOT NULL,
    assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    next_assessment_date DATE,

    -- Result
    result ic_assessment_result NOT NULL DEFAULT 'needs_review',
    score NUMERIC(5,2),

    -- Factors (JSON for flexibility across different test types)
    factors JSONB DEFAULT '{}',

    -- Decision
    assessor_id UUID NOT NULL REFERENCES profiles(id),
    rationale TEXT,
    recommended_action TEXT,

    -- If reclassification needed
    reclassify_to worker_classification,
    reclassification_completed BOOLEAN DEFAULT false,
    reclassification_date DATE,

    -- Evidence
    supporting_doc_urls TEXT[] DEFAULT '{}',

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_class_assessments_worker ON classification_assessments(worker_profile_id);
CREATE INDEX idx_class_assessments_result ON classification_assessments(result);
CREATE INDEX idx_class_assessments_next ON classification_assessments(next_assessment_date);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 8: BRIDGE FKs — Backward Compatibility
-- Links existing crew_members and vendors to unified worker_profiles.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS worker_profile_id UUID REFERENCES worker_profiles(id) ON DELETE SET NULL;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS worker_profile_id UUID REFERENCES worker_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_crew_members_worker_profile ON crew_members(worker_profile_id);
CREATE INDEX IF NOT EXISTS idx_vendors_worker_profile ON vendors(worker_profile_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 9: ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_compliance_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_step_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_onboarding_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_step_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE offboarding_step_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_offboarding_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE offboarding_step_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE classification_assessments ENABLE ROW LEVEL SECURITY;

-- Org-scoped policies (standard pattern)
CREATE POLICY "org_read" ON worker_profiles FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_insert" ON worker_profiles FOR INSERT
    WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_update" ON worker_profiles FOR UPDATE
    USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "org_read" ON worker_classifications FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_insert" ON worker_classifications FOR INSERT
    WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_update" ON worker_classifications FOR UPDATE
    USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "org_read" ON engagement_terms FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_insert" ON engagement_terms FOR INSERT
    WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_update" ON engagement_terms FOR UPDATE
    USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "org_read" ON compliance_templates FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_insert" ON compliance_templates FOR INSERT
    WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_update" ON compliance_templates FOR UPDATE
    USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "org_read" ON worker_compliance_docs FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_insert" ON worker_compliance_docs FOR INSERT
    WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_update" ON worker_compliance_docs FOR UPDATE
    USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "org_read" ON onboarding_step_templates FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_insert" ON onboarding_step_templates FOR INSERT
    WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "org_read" ON worker_onboarding_runs FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_insert" ON worker_onboarding_runs FOR INSERT
    WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_update" ON worker_onboarding_runs FOR UPDATE
    USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "org_read" ON onboarding_step_progress FOR SELECT
    USING (run_id IN (SELECT id FROM worker_onboarding_runs WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())));
CREATE POLICY "org_insert" ON onboarding_step_progress FOR INSERT
    WITH CHECK (run_id IN (SELECT id FROM worker_onboarding_runs WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())));
CREATE POLICY "org_update" ON onboarding_step_progress FOR UPDATE
    USING (run_id IN (SELECT id FROM worker_onboarding_runs WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "org_read" ON offboarding_step_templates FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_insert" ON offboarding_step_templates FOR INSERT
    WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "org_read" ON worker_offboarding_runs FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_insert" ON worker_offboarding_runs FOR INSERT
    WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_update" ON worker_offboarding_runs FOR UPDATE
    USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "org_read" ON offboarding_step_progress FOR SELECT
    USING (run_id IN (SELECT id FROM worker_offboarding_runs WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())));
CREATE POLICY "org_insert" ON offboarding_step_progress FOR INSERT
    WITH CHECK (run_id IN (SELECT id FROM worker_offboarding_runs WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())));
CREATE POLICY "org_update" ON offboarding_step_progress FOR UPDATE
    USING (run_id IN (SELECT id FROM worker_offboarding_runs WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "org_read" ON worker_reviews FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_insert" ON worker_reviews FOR INSERT
    WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_update" ON worker_reviews FOR UPDATE
    USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "org_read" ON classification_assessments FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_insert" ON classification_assessments FOR INSERT
    WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_update" ON classification_assessments FOR UPDATE
    USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 10: TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TRIGGER update_worker_profiles_updated_at BEFORE UPDATE ON worker_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_classifications_updated_at BEFORE UPDATE ON worker_classifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_engagement_terms_updated_at BEFORE UPDATE ON engagement_terms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compliance_templates_updated_at BEFORE UPDATE ON compliance_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_compliance_docs_updated_at BEFORE UPDATE ON worker_compliance_docs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_onboarding_runs_updated_at BEFORE UPDATE ON worker_onboarding_runs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_onboarding_step_progress_updated_at BEFORE UPDATE ON onboarding_step_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_offboarding_runs_updated_at BEFORE UPDATE ON worker_offboarding_runs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offboarding_step_progress_updated_at BEFORE UPDATE ON offboarding_step_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_reviews_updated_at BEFORE UPDATE ON worker_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classification_assessments_updated_at BEFORE UPDATE ON classification_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Activity log triggers
CREATE TRIGGER log_worker_profiles_activity AFTER INSERT OR UPDATE OR DELETE ON worker_profiles
    FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER log_worker_classifications_activity AFTER INSERT OR UPDATE OR DELETE ON worker_classifications
    FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER log_engagement_terms_activity AFTER INSERT OR UPDATE OR DELETE ON engagement_terms
    FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER log_worker_compliance_docs_activity AFTER INSERT OR UPDATE OR DELETE ON worker_compliance_docs
    FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER log_worker_onboarding_runs_activity AFTER INSERT OR UPDATE OR DELETE ON worker_onboarding_runs
    FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER log_worker_offboarding_runs_activity AFTER INSERT OR UPDATE OR DELETE ON worker_offboarding_runs
    FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER log_worker_reviews_activity AFTER INSERT OR UPDATE OR DELETE ON worker_reviews
    FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER log_classification_assessments_activity AFTER INSERT OR UPDATE OR DELETE ON classification_assessments
    FOR EACH ROW EXECUTE FUNCTION log_activity();

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 11: HELPER FUNCTION — Recalculate worker average rating
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION recalc_worker_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- No-op placeholder: In production, this would update a materialized
    -- rating on worker_profiles based on worker_reviews aggregate.
    -- Pattern mirrors recalc_vendor_rating from migration 008.
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalc_worker_rating_on_review
    AFTER INSERT OR UPDATE ON worker_reviews
    FOR EACH ROW EXECUTE FUNCTION recalc_worker_rating();
