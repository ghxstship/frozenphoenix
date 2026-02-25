-- ═══════════════════════════════════════════════════════════════════════════
-- FROZEN PHOENIX — Vendor/Contractor/Subcontractor Lifecycle Management
-- HeyPros + Jobber feature parity for creative/experiential production
-- Maintains 3NF compliance, SSOT, referential integrity
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TYPE vendor_type AS ENUM (
    'vendor', 'subcontractor', 'independent_contractor', 'freelancer', 'agency', 'supplier'
);

CREATE TYPE onboarding_status AS ENUM (
    'invited', 'application_submitted', 'under_review', 'documents_pending',
    'documents_received', 'background_check', 'approved', 'rejected', 'archived'
);

CREATE TYPE compliance_doc_type AS ENUM (
    'coi', 'w9', 'w8ben', 'nda', 'msa', 'business_license', 'workers_comp',
    'auto_insurance', 'professional_license', 'union_card', 'background_check',
    'drug_test', 'safety_cert', 'equipment_cert', 'diversity_cert', 'tax_exempt',
    'bank_info', 'other'
);

CREATE TYPE compliance_doc_status AS ENUM (
    'not_submitted', 'pending_review', 'approved', 'rejected', 'expired', 'expiring_soon'
);

CREATE TYPE work_order_status AS ENUM (
    'draft', 'posted', 'bidding', 'assigned', 'accepted', 'scheduled',
    'in_progress', 'on_hold', 'completed', 'verified', 'invoiced', 'cancelled', 'disputed'
);

CREATE TYPE work_order_priority AS ENUM ('low', 'normal', 'high', 'urgent', 'emergency');

CREATE TYPE dispatch_status AS ENUM (
    'unassigned', 'offered', 'accepted', 'declined', 'en_route',
    'on_site', 'in_progress', 'completed', 'no_show'
);

CREATE TYPE bid_status AS ENUM ('submitted', 'under_review', 'accepted', 'rejected', 'withdrawn');

CREATE TYPE vendor_review_type AS ENUM ('project_completion', 'periodic', 'incident', 'self_assessment');

CREATE TYPE estimate_status AS ENUM (
    'draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'converted'
);

CREATE TYPE job_checklist_status AS ENUM ('not_started', 'in_progress', 'completed', 'skipped', 'blocked');

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: VENDOR PROFILE EXTENSIONS
-- Extends existing vendors table with subcontractor/IC-specific fields.
-- SSOT: vendors table remains canonical for all external parties.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE vendors ADD COLUMN IF NOT EXISTS vendor_type vendor_type DEFAULT 'vendor';
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS tax_id TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS payment_terms_days INTEGER DEFAULT 30;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS default_hourly_rate NUMERIC(10,2);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS default_day_rate NUMERIC(10,2);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}';
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS service_areas TEXT[] DEFAULT '{}';
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS onboarding_status onboarding_status DEFAULT 'invited';
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS preferred BOOLEAN DEFAULT false;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS do_not_hire BOOLEAN DEFAULT false;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS insurance_minimum NUMERIC(12,2);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS last_project_date DATE;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS total_projects INTEGER DEFAULT 0;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS total_spend NUMERIC(14,2) DEFAULT 0;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS portal_access_enabled BOOLEAN DEFAULT false;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS portal_last_login TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_vendors_type ON vendors(vendor_type);
CREATE INDEX IF NOT EXISTS idx_vendors_onboarding ON vendors(onboarding_status);
CREATE INDEX IF NOT EXISTS idx_vendors_preferred ON vendors(preferred);
CREATE INDEX IF NOT EXISTS idx_vendors_categories ON vendors USING GIN(categories);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: COMPLIANCE DOCUMENT REQUIREMENTS & SUBMISSIONS
-- Normalized: requirement definitions are separate from actual submissions.
-- ─────────────────────────────────────────────────────────────────────────────

-- Compliance requirement templates (what docs are required per vendor type/category)
CREATE TABLE compliance_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    doc_type compliance_doc_type NOT NULL,
    description TEXT,

    -- Applicability
    applies_to_vendor_types vendor_type[] DEFAULT '{}',
    applies_to_categories TEXT[] DEFAULT '{}',

    -- Rules
    is_required BOOLEAN DEFAULT true,
    has_expiry BOOLEAN DEFAULT true,
    expiry_warning_days INTEGER DEFAULT 30,
    auto_suspend_on_expiry BOOLEAN DEFAULT false,

    -- Display
    display_order INTEGER DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT true,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_compliance_requirements_org ON compliance_requirements(organization_id);
CREATE INDEX idx_compliance_requirements_type ON compliance_requirements(doc_type);

-- Actual compliance documents submitted by vendors
CREATE TABLE vendor_compliance_docs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    requirement_id UUID REFERENCES compliance_requirements(id) ON DELETE SET NULL,

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

    -- Review
    status compliance_doc_status NOT NULL DEFAULT 'pending_review',
    reviewed_by UUID REFERENCES profiles(id),
    rejection_reason TEXT,

    -- Coverage
    coverage_amount NUMERIC(14,2),
    policy_number TEXT,
    carrier_name TEXT,

    -- Metadata
    notes TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_compliance_docs_vendor ON vendor_compliance_docs(vendor_id);
CREATE INDEX idx_vendor_compliance_docs_type ON vendor_compliance_docs(doc_type);
CREATE INDEX idx_vendor_compliance_docs_status ON vendor_compliance_docs(status);
CREATE INDEX idx_vendor_compliance_docs_expiry ON vendor_compliance_docs(expiry_date);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: WORK ORDERS
-- Core dispatch/assignment unit. Replaces ad-hoc work assignment.
-- Links to projects, vendors, locations. Supports bidding/marketplace.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,

    -- Identification
    number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,

    -- Assignment
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    assigned_crew_ids UUID[] DEFAULT '{}',
    supervisor_id UUID REFERENCES profiles(id),

    -- Category
    category TEXT,
    department department,
    phase production_phase,

    -- Schedule
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    estimated_hours NUMERIC(8,2),
    actual_hours NUMERIC(8,2),

    -- Budget
    estimated_cost NUMERIC(12,2),
    actual_cost NUMERIC(12,2),
    not_to_exceed NUMERIC(12,2),
    billing_type billing_type DEFAULT 'fixed_price',

    -- Priority & Status
    priority work_order_priority NOT NULL DEFAULT 'normal',
    status work_order_status NOT NULL DEFAULT 'draft',

    -- Bidding (marketplace-style)
    is_open_for_bids BOOLEAN DEFAULT false,
    bid_deadline TIMESTAMPTZ,
    max_bidders INTEGER,

    -- Checklist
    checklist_template_id UUID,
    requires_checklist_completion BOOLEAN DEFAULT false,

    -- Completion
    completed_at TIMESTAMPTZ,
    verified_by UUID REFERENCES profiles(id),
    verified_at TIMESTAMPTZ,
    completion_notes TEXT,
    completion_photos TEXT[] DEFAULT '{}',

    -- Relationships
    purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
    parent_work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, number)
);

CREATE INDEX idx_work_orders_project ON work_orders(project_id);
CREATE INDEX idx_work_orders_vendor ON work_orders(vendor_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_priority ON work_orders(priority);
CREATE INDEX idx_work_orders_scheduled ON work_orders(scheduled_start);
CREATE INDEX idx_work_orders_location ON work_orders(location_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: WORK ORDER BIDS
-- Marketplace-style bidding for open work orders (HeyPros feature).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE work_order_bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

    -- Bid Details
    bid_amount NUMERIC(12,2) NOT NULL,
    estimated_hours NUMERIC(8,2),
    proposed_start TIMESTAMPTZ,
    proposed_end TIMESTAMPTZ,
    notes TEXT,

    -- Status
    status bid_status NOT NULL DEFAULT 'submitted',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES profiles(id),

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(work_order_id, vendor_id)
);

CREATE INDEX idx_work_order_bids_wo ON work_order_bids(work_order_id);
CREATE INDEX idx_work_order_bids_vendor ON work_order_bids(vendor_id);
CREATE INDEX idx_work_order_bids_status ON work_order_bids(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: DISPATCH LOG
-- Real-time tracking of crew/vendor dispatch for each work order.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE dispatch_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,

    -- Who is dispatched (one of these)
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    crew_member_id UUID REFERENCES crew_members(id) ON DELETE SET NULL,

    -- Dispatch Details
    role TEXT,
    status dispatch_status NOT NULL DEFAULT 'unassigned',

    -- Schedule
    dispatched_at TIMESTAMPTZ,
    arrived_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Location
    dispatch_notes TEXT,

    -- Confirmation
    confirmed_at TIMESTAMPTZ,
    declined_reason TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CHECK (vendor_id IS NOT NULL OR crew_member_id IS NOT NULL)
);

CREATE INDEX idx_dispatch_entries_wo ON dispatch_entries(work_order_id);
CREATE INDEX idx_dispatch_entries_vendor ON dispatch_entries(vendor_id);
CREATE INDEX idx_dispatch_entries_crew ON dispatch_entries(crew_member_id);
CREATE INDEX idx_dispatch_entries_status ON dispatch_entries(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6: VENDOR REVIEWS & RATINGS
-- Post-project/periodic vendor performance reviews.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE vendor_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,

    -- Reviewer
    reviewer_id UUID NOT NULL REFERENCES profiles(id),
    review_type vendor_review_type NOT NULL DEFAULT 'project_completion',

    -- Ratings (1-5 scale)
    overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    safety_rating INTEGER CHECK (safety_rating >= 1 AND safety_rating <= 5),

    -- Feedback
    strengths TEXT,
    improvements TEXT,
    comments TEXT,
    would_rehire BOOLEAN,

    -- Review date
    review_date DATE NOT NULL DEFAULT CURRENT_DATE,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_reviews_vendor ON vendor_reviews(vendor_id);
CREATE INDEX idx_vendor_reviews_project ON vendor_reviews(project_id);
CREATE INDEX idx_vendor_reviews_rating ON vendor_reviews(overall_rating);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 7: JOB CHECKLISTS
-- Template-based checklists for work orders (HeyPros + Jobber feature).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE checklist_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,

    -- Category
    category TEXT,
    department department,

    -- Items (ordered)
    items JSONB NOT NULL DEFAULT '[]',
    -- Format: [{"id": "uuid", "title": "...", "description": "...", "required": true, "order": 1}]

    -- Usage
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_checklist_templates_org ON checklist_templates(organization_id);
CREATE INDEX idx_checklist_templates_category ON checklist_templates(category);

CREATE TABLE job_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES checklist_templates(id) ON DELETE SET NULL,
    work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

    -- Assignment
    assigned_to_id UUID REFERENCES profiles(id),
    vendor_id UUID REFERENCES vendors(id),

    -- Content
    title TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]',
    -- Format: [{"id": "uuid", "title": "...", "completed": false, "completed_at": null, "completed_by": null, "notes": "", "photo_url": null, "required": true}]

    -- Status
    status job_checklist_status NOT NULL DEFAULT 'not_started',
    total_items INTEGER DEFAULT 0,
    completed_items INTEGER DEFAULT 0,
    completion_percent INTEGER DEFAULT 0 CHECK (completion_percent >= 0 AND completion_percent <= 100),

    -- Dates
    due_date DATE,
    completed_at TIMESTAMPTZ,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_checklists_wo ON job_checklists(work_order_id);
CREATE INDEX idx_job_checklists_project ON job_checklists(project_id);
CREATE INDEX idx_job_checklists_vendor ON job_checklists(vendor_id);
CREATE INDEX idx_job_checklists_status ON job_checklists(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 8: ESTIMATES / QUOTES (Jobber feature)
-- Client-facing estimates that can be approved and converted to projects/SOWs.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,

    -- Identification
    number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,

    -- Line Items
    line_items JSONB NOT NULL DEFAULT '[]',
    -- Format: [{"id": "uuid", "name": "...", "description": "...", "qty": 1, "unit": "ea", "unit_price": 100, "total": 100, "optional": false}]

    -- Totals
    subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,
    discount_percent NUMERIC(5,2) DEFAULT 0,
    discount_amount NUMERIC(14,2) DEFAULT 0,
    tax_percent NUMERIC(5,2) DEFAULT 0,
    tax_amount NUMERIC(14,2) DEFAULT 0,
    total NUMERIC(14,2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'USD',

    -- Schedule
    valid_until DATE,
    proposed_start_date DATE,
    proposed_end_date DATE,

    -- Status
    status estimate_status NOT NULL DEFAULT 'draft',
    sent_at TIMESTAMPTZ,
    viewed_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,

    -- Signature
    signature_required BOOLEAN DEFAULT true,
    signed_by TEXT,
    signed_at TIMESTAMPTZ,

    -- Conversion
    converted_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    converted_sow_id UUID REFERENCES scopes_of_work(id) ON DELETE SET NULL,

    -- Notes
    internal_notes TEXT,
    client_notes TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, number)
);

CREATE INDEX idx_estimates_org ON estimates(organization_id);
CREATE INDEX idx_estimates_company ON estimates(company_id);
CREATE INDEX idx_estimates_status ON estimates(status);
CREATE INDEX idx_estimates_deal ON estimates(deal_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 9: JOB COSTING (Jobber feature)
-- Per-project profitability tracking with labor, materials, expenses breakdown.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE job_cost_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,

    -- Type
    cost_type TEXT NOT NULL CHECK (cost_type IN ('labor', 'material', 'equipment', 'subcontractor', 'expense', 'overhead')),

    -- Details
    description TEXT NOT NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    crew_member_id UUID REFERENCES crew_members(id) ON DELETE SET NULL,

    -- Amounts
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit TEXT DEFAULT 'ea',
    unit_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_cost NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,

    -- Budget comparison
    budgeted_amount NUMERIC(14,2),

    -- Time reference
    time_entry_id UUID,
    expense_id UUID,

    -- Date
    cost_date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Billing
    billable BOOLEAN DEFAULT true,
    billed BOOLEAN DEFAULT false,
    invoice_id UUID,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_cost_entries_project ON job_cost_entries(project_id);
CREATE INDEX idx_job_cost_entries_type ON job_cost_entries(cost_type);
CREATE INDEX idx_job_cost_entries_vendor ON job_cost_entries(vendor_id);
CREATE INDEX idx_job_cost_entries_wo ON job_cost_entries(work_order_id);
CREATE INDEX idx_job_cost_entries_date ON job_cost_entries(cost_date);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 10: VENDOR PORTAL TOKENS
-- Secure access tokens for vendor self-service portal.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE vendor_portal_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

    -- Token
    token TEXT NOT NULL UNIQUE,
    token_type TEXT NOT NULL DEFAULT 'access' CHECK (token_type IN ('access', 'invite', 'reset')),

    -- Status
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,

    -- Scope
    scopes TEXT[] DEFAULT '{read_work_orders, submit_invoices, upload_docs}',

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_portal_tokens_vendor ON vendor_portal_tokens(vendor_id);
CREATE INDEX idx_vendor_portal_tokens_token ON vendor_portal_tokens(token);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 11: VENDOR COMMUNICATION LOG
-- Centralized communication history (HeyPros feature).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE vendor_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

    -- Message
    channel TEXT NOT NULL DEFAULT 'in_app' CHECK (channel IN ('in_app', 'email', 'sms', 'phone', 'portal')),
    direction TEXT NOT NULL DEFAULT 'outbound' CHECK (direction IN ('inbound', 'outbound')),
    subject TEXT,
    body TEXT NOT NULL,

    -- Sender/Receiver
    sender_id UUID REFERENCES profiles(id),
    sender_name TEXT,

    -- Status
    read_at TIMESTAMPTZ,

    -- Attachments
    attachment_urls TEXT[] DEFAULT '{}',

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_communications_vendor ON vendor_communications(vendor_id);
CREATE INDEX idx_vendor_communications_wo ON vendor_communications(work_order_id);
CREATE INDEX idx_vendor_communications_created ON vendor_communications(created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 12: ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE compliance_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_compliance_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatch_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_cost_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_portal_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_communications ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'compliance_requirements', 'vendor_compliance_docs', 'work_orders',
        'work_order_bids', 'dispatch_entries', 'vendor_reviews',
        'checklist_templates', 'job_checklists', 'estimates',
        'job_cost_entries', 'vendor_portal_tokens', 'vendor_communications'
    ])
    LOOP
        EXECUTE format('
            CREATE POLICY "Users can view %I in their org" ON %I
                FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
            CREATE POLICY "Users can insert %I in their org" ON %I
                FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
            CREATE POLICY "Users can update %I in their org" ON %I
                FOR UPDATE USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
        ', tbl, tbl, tbl, tbl, tbl, tbl);
    END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 13: TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'compliance_requirements', 'vendor_compliance_docs', 'work_orders',
        'work_order_bids', 'dispatch_entries', 'vendor_reviews',
        'checklist_templates', 'job_checklists', 'estimates',
        'job_cost_entries'
    ])
    LOOP
        EXECUTE format('
            CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ', tbl, tbl);
    END LOOP;
END $$;

-- Activity logging for key lifecycle tables
CREATE TRIGGER log_work_orders_activity AFTER INSERT OR UPDATE OR DELETE ON work_orders
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_estimates_activity AFTER INSERT OR UPDATE OR DELETE ON estimates
    FOR EACH ROW EXECUTE FUNCTION log_activity();

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 14: VENDOR RATING RECALCULATION
-- Auto-update vendor.average_rating when reviews change.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION recalculate_vendor_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE vendors
    SET average_rating = COALESCE((
        SELECT ROUND(AVG(overall_rating)::numeric, 2)
        FROM vendor_reviews
        WHERE vendor_id = COALESCE(NEW.vendor_id, OLD.vendor_id)
    ), 0),
    rating = COALESCE((
        SELECT ROUND(AVG(overall_rating)::numeric, 1)
        FROM vendor_reviews
        WHERE vendor_id = COALESCE(NEW.vendor_id, OLD.vendor_id)
    ), 0)
    WHERE id = COALESCE(NEW.vendor_id, OLD.vendor_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER recalculate_vendor_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON vendor_reviews
    FOR EACH ROW EXECUTE FUNCTION recalculate_vendor_rating();
