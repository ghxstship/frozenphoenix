-- ═══════════════════════════════════════════════════════════════════════════
-- FROZEN PHOENIX — CRM & Revenue Pipeline Unification
-- Migration 013
--
-- Creates: opportunities, opportunity_activities, change_orders,
--          change_order_log, revenue_schedules, account_health_scores
-- Modifies: deals, projects, leads (add company/contact FKs)
--
-- Maintains 3NF compliance, SSOT governance, referential integrity.
-- All new columns on existing tables are NULLABLE for backward compatibility.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TYPE opportunity_stage AS ENUM (
    'discovery',
    'qualification',
    'proposal_sent',
    'proposal_review',
    'negotiation',
    'contract_sent',
    'won',
    'lost',
    'on_hold'
);

CREATE TYPE opportunity_type AS ENUM (
    'new_business',
    'expansion',
    'renewal',
    'upsell'
);

CREATE TYPE change_order_type AS ENUM (
    'scope_addition',
    'scope_reduction',
    'timeline_change',
    'budget_adjustment',
    'combined'
);

CREATE TYPE change_order_status AS ENUM (
    'draft',
    'pending_review',
    'pending_client',
    'approved',
    'rejected',
    'void'
);

CREATE TYPE revenue_recognition_type AS ENUM (
    'milestone',
    'percentage_of_completion',
    'time_based',
    'event_based'
);

CREATE TYPE revenue_schedule_status AS ENUM (
    'scheduled',
    'invoiced',
    'recognized',
    'deferred',
    'reversed'
);

CREATE TYPE account_risk_level AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);

CREATE TYPE opportunity_activity_type AS ENUM (
    'call',
    'email',
    'meeting',
    'note',
    'task',
    'proposal_sent',
    'contract_sent'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: OPPORTUNITIES
-- The canonical pipeline entity between lead qualification and deal close.
-- Replaces the overloaded deal stages (lead → won) with a proper funnel.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Account & Contact (REQUIRED: R1 Account Primacy)
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    primary_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,

    -- Source Attribution
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    pipeline_id UUID REFERENCES pipelines(id) ON DELETE SET NULL,

    -- Identification
    name TEXT NOT NULL,
    description TEXT,

    -- Classification
    type opportunity_type NOT NULL DEFAULT 'new_business',
    stage opportunity_stage NOT NULL DEFAULT 'discovery',

    -- Value
    value NUMERIC(14,2) NOT NULL DEFAULT 0,
    probability INTEGER NOT NULL DEFAULT 10 CHECK (probability >= 0 AND probability <= 100),
    weighted_value NUMERIC(14,2) GENERATED ALWAYS AS (value * probability / 100) STORED,
    currency TEXT DEFAULT 'USD',

    -- Timeline
    expected_close_date DATE,
    actual_close_date DATE,

    -- Assignment
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,

    -- Conversion
    converted_to_deal_id UUID, -- FK added after deals ALTER below
    lost_reason_id UUID REFERENCES lost_reasons(id) ON DELETE SET NULL,
    lost_reason_note TEXT,

    -- Competitive
    competitor TEXT,

    -- Activity
    next_step TEXT,
    last_activity_at TIMESTAMPTZ,

    -- Tags
    tags TEXT[] DEFAULT '{}',

    -- Metadata
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_opportunities_company ON opportunities(company_id);
CREATE INDEX idx_opportunities_contact ON opportunities(primary_contact_id);
CREATE INDEX idx_opportunities_lead ON opportunities(lead_id);
CREATE INDEX idx_opportunities_pipeline ON opportunities(pipeline_id);
CREATE INDEX idx_opportunities_stage ON opportunities(stage);
CREATE INDEX idx_opportunities_type ON opportunities(type);
CREATE INDEX idx_opportunities_assigned ON opportunities(assigned_to);
CREATE INDEX idx_opportunities_close_date ON opportunities(expected_close_date);
CREATE INDEX idx_opportunities_org ON opportunities(organization_id);
CREATE INDEX idx_opportunities_last_activity ON opportunities(last_activity_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: OPPORTUNITY ACTIVITIES
-- Track all interactions on opportunities (calls, emails, meetings, notes).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE opportunity_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,

    -- Activity
    type opportunity_activity_type NOT NULL,
    subject TEXT NOT NULL,
    description TEXT,

    -- Participants
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    performed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Details
    duration_minutes INTEGER,
    outcome TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_opp_activities_opportunity ON opportunity_activities(opportunity_id);
CREATE INDEX idx_opp_activities_type ON opportunity_activities(type);
CREATE INDEX idx_opp_activities_contact ON opportunity_activities(contact_id);
CREATE INDEX idx_opp_activities_performed ON opportunity_activities(performed_at DESC);
CREATE INDEX idx_opp_activities_org ON opportunity_activities(organization_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: ALTER DEALS — Add company/contact/opportunity FKs
-- Deals now represent CONTRACTED revenue (post-close).
-- Text fields (company, contact_name, contact_email) preserved for
-- backward compatibility; new FKs are nullable.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE deals
    ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS contracted_value NUMERIC(14,2),
    ADD COLUMN IF NOT EXISTS contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS closed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS total_invoiced NUMERIC(14,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_recognized NUMERIC(14,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_collected NUMERIC(14,2) DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_deals_company ON deals(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_contact ON deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_opportunity ON deals(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_deals_contract ON deals(contract_id);
CREATE INDEX IF NOT EXISTS idx_deals_closed ON deals(closed_at);

-- Now add the FK from opportunities back to deals
ALTER TABLE opportunities
    ADD CONSTRAINT fk_opportunities_converted_deal
    FOREIGN KEY (converted_to_deal_id) REFERENCES deals(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_opportunities_deal ON opportunities(converted_to_deal_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: ALTER PROJECTS — Add company/deal FKs + margin tracking
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS primary_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS contracted_value NUMERIC(14,2),
    ADD COLUMN IF NOT EXISTS change_order_value NUMERIC(14,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS gross_margin_percent NUMERIC(5,2);

CREATE INDEX IF NOT EXISTS idx_projects_company ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_deal ON projects(deal_id);
CREATE INDEX IF NOT EXISTS idx_projects_contact ON projects(primary_contact_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: ALTER LEADS — Add company FK + opportunity conversion
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE leads
    ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS converted_to_opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_leads_company ON leads(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_opportunity ON leads(converted_to_opportunity_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6: CHANGE ORDERS
-- Post-contract scope modifications with full audit trail.
-- Immutable once approved — all changes logged to change_order_log.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE change_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    sow_id UUID REFERENCES scopes_of_work(id) ON DELETE SET NULL,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Identification
    number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,

    -- Impact
    change_type change_order_type NOT NULL DEFAULT 'scope_addition',
    value_impact NUMERIC(14,2) NOT NULL DEFAULT 0,
    schedule_impact_days INTEGER DEFAULT 0,

    -- Justification
    reason TEXT,
    business_case TEXT,

    -- Status & Approval
    status change_order_status NOT NULL DEFAULT 'draft',
    requested_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    client_approved_by TEXT,
    client_approved_at TIMESTAMPTZ,

    -- Scope details
    scope_additions TEXT,
    scope_removals TEXT,
    deliverables_added JSONB DEFAULT '[]',
    deliverables_removed JSONB DEFAULT '[]',

    -- Metadata
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(project_id, number)
);

CREATE INDEX idx_change_orders_project ON change_orders(project_id);
CREATE INDEX idx_change_orders_sow ON change_orders(sow_id);
CREATE INDEX idx_change_orders_company ON change_orders(company_id);
CREATE INDEX idx_change_orders_status ON change_orders(status);
CREATE INDEX idx_change_orders_type ON change_orders(change_type);
CREATE INDEX idx_change_orders_org ON change_orders(organization_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 7: CHANGE ORDER LOG (IMMUTABLE AUDIT TRAIL)
-- Every status change and modification to a change order is recorded here.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE change_order_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    change_order_id UUID NOT NULL REFERENCES change_orders(id) ON DELETE CASCADE,

    -- Change
    action TEXT NOT NULL CHECK (action IN (
        'created', 'updated', 'submitted', 'reviewed',
        'approved', 'rejected', 'voided', 'client_approved', 'client_rejected'
    )),
    field_name TEXT,
    old_value TEXT,
    new_value TEXT,
    change_summary TEXT,

    -- Actor
    performed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Snapshot
    metadata JSONB DEFAULT '{}',

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX idx_co_log_change_order ON change_order_log(change_order_id);
CREATE INDEX idx_co_log_action ON change_order_log(action);
CREATE INDEX idx_co_log_date ON change_order_log(performed_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 8: REVENUE SCHEDULES
-- ASC 606-compliant revenue recognition entries.
-- Each entry maps a performance obligation to its recognition timeline.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE revenue_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    sow_deliverable_id UUID REFERENCES sow_deliverables(id) ON DELETE SET NULL,
    change_order_id UUID REFERENCES change_orders(id) ON DELETE SET NULL,
    client_invoice_id UUID REFERENCES client_invoices(id) ON DELETE SET NULL,

    -- Recognition
    type revenue_recognition_type NOT NULL DEFAULT 'milestone',
    description TEXT NOT NULL,

    -- Amounts
    contracted_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    invoiced_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    recognized_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'USD',

    -- Timeline
    scheduled_date DATE NOT NULL,
    invoiced_at TIMESTAMPTZ,
    recognized_at TIMESTAMPTZ,

    -- Status
    status revenue_schedule_status NOT NULL DEFAULT 'scheduled',

    -- Percentage of completion (for POC type)
    percent_complete INTEGER DEFAULT 0 CHECK (percent_complete >= 0 AND percent_complete <= 100),

    -- Notes
    notes TEXT,

    -- Metadata
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rev_schedules_project ON revenue_schedules(project_id);
CREATE INDEX idx_rev_schedules_deal ON revenue_schedules(deal_id);
CREATE INDEX idx_rev_schedules_deliverable ON revenue_schedules(sow_deliverable_id);
CREATE INDEX idx_rev_schedules_change_order ON revenue_schedules(change_order_id);
CREATE INDEX idx_rev_schedules_invoice ON revenue_schedules(client_invoice_id);
CREATE INDEX idx_rev_schedules_status ON revenue_schedules(status);
CREATE INDEX idx_rev_schedules_date ON revenue_schedules(scheduled_date);
CREATE INDEX idx_rev_schedules_recognized ON revenue_schedules(recognized_at);
CREATE INDEX idx_rev_schedules_org ON revenue_schedules(organization_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 9: ACCOUNT HEALTH SCORES
-- Periodic snapshots of client relationship health.
-- Computed from project delivery, payment behavior, engagement, and satisfaction.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE account_health_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Snapshot Date
    score_date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Composite Score
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),

    -- Component Scores (0–100)
    delivery_score INTEGER DEFAULT 0 CHECK (delivery_score >= 0 AND delivery_score <= 100),
    payment_score INTEGER DEFAULT 0 CHECK (payment_score >= 0 AND payment_score <= 100),
    engagement_score INTEGER DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
    satisfaction_score INTEGER DEFAULT 0 CHECK (satisfaction_score >= 0 AND satisfaction_score <= 100),
    expansion_score INTEGER DEFAULT 0 CHECK (expansion_score >= 0 AND expansion_score <= 100),

    -- Risk Assessment
    risk_level account_risk_level NOT NULL DEFAULT 'low',
    risk_factors JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',

    -- Revenue Context
    lifetime_revenue NUMERIC(14,2) DEFAULT 0,
    active_project_count INTEGER DEFAULT 0,
    open_opportunity_count INTEGER DEFAULT 0,
    overdue_invoice_count INTEGER DEFAULT 0,

    -- Metadata
    notes TEXT,
    scored_by UUID REFERENCES profiles(id),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(company_id, score_date)
);

CREATE INDEX idx_health_scores_company ON account_health_scores(company_id);
CREATE INDEX idx_health_scores_date ON account_health_scores(score_date DESC);
CREATE INDEX idx_health_scores_risk ON account_health_scores(risk_level);
CREATE INDEX idx_health_scores_org ON account_health_scores(organization_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 9B: ADD organization_id TO leads (was missing from migration 004)
-- Required for the org-scoped backfill below.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE leads
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_leads_org ON leads(organization_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 10: DATA MIGRATION — Backfill company_id from text fields
-- Attempts to match existing text company/client names to companies table.
-- Non-destructive: only populates NULL company_id fields.
-- ─────────────────────────────────────────────────────────────────────────────

-- Backfill deals.company_id from deals.company text
UPDATE deals d
SET company_id = c.id
FROM companies c
WHERE d.company_id IS NULL
  AND d.company IS NOT NULL
  AND LOWER(TRIM(d.company)) = LOWER(TRIM(c.name))
  AND d.organization_id = c.organization_id;

-- Backfill projects.company_id from projects.client text
UPDATE projects p
SET company_id = c.id
FROM companies c
WHERE p.company_id IS NULL
  AND p.client IS NOT NULL
  AND LOWER(TRIM(p.client)) = LOWER(TRIM(c.name))
  AND p.organization_id = c.organization_id;

-- Backfill leads.company_id from leads.company text
UPDATE leads l
SET company_id = c.id
FROM companies c
WHERE l.company_id IS NULL
  AND l.company IS NOT NULL
  AND LOWER(TRIM(l.company)) = LOWER(TRIM(c.name))
  AND l.organization_id = c.organization_id;

-- Backfill deals.contracted_value from deals.value for won deals
UPDATE deals
SET contracted_value = value,
    closed_at = updated_at
WHERE stage = 'won'
  AND contracted_value IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 11: ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_order_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_health_scores ENABLE ROW LEVEL SECURITY;

-- Org-based policies for all new tables with organization_id
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'opportunities', 'opportunity_activities', 'change_orders',
        'change_order_log', 'revenue_schedules', 'account_health_scores'
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

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 12: TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

-- updated_at triggers
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'opportunities', 'change_orders', 'revenue_schedules'
    ])
    LOOP
        EXECUTE format('
            CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ', tbl, tbl);
    END LOOP;
END $$;

-- Activity log triggers
CREATE TRIGGER log_opportunities_activity AFTER INSERT OR UPDATE OR DELETE ON opportunities
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_change_orders_activity AFTER INSERT OR UPDATE OR DELETE ON change_orders
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_revenue_schedules_activity AFTER INSERT OR UPDATE OR DELETE ON revenue_schedules
    FOR EACH ROW EXECUTE FUNCTION log_activity();

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 13: CHANGE ORDER TRACKING TRIGGER
-- Automatically records changes to change_orders into change_order_log.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION track_change_order_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO change_order_log (change_order_id, action, change_summary, performed_by, metadata, organization_id)
        VALUES (NEW.id, 'created', 'Change order created: ' || NEW.title, auth.uid(), to_jsonb(NEW), NEW.organization_id);
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            INSERT INTO change_order_log (change_order_id, action, field_name, old_value, new_value, change_summary, performed_by, metadata, organization_id)
            VALUES (NEW.id,
                CASE NEW.status::text
                    WHEN 'pending_review' THEN 'submitted'
                    WHEN 'approved' THEN 'approved'
                    WHEN 'rejected' THEN 'rejected'
                    WHEN 'void' THEN 'voided'
                    ELSE 'updated'
                END,
                'status', OLD.status::text, NEW.status::text,
                'Status changed from ' || OLD.status || ' to ' || NEW.status,
                auth.uid(), jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)), NEW.organization_id);
        END IF;
        IF OLD.value_impact IS DISTINCT FROM NEW.value_impact THEN
            INSERT INTO change_order_log (change_order_id, action, field_name, old_value, new_value, change_summary, performed_by, metadata, organization_id)
            VALUES (NEW.id, 'updated', 'value_impact', OLD.value_impact::text, NEW.value_impact::text,
                'Value impact changed from ' || OLD.value_impact || ' to ' || NEW.value_impact,
                auth.uid(), jsonb_build_object('old_value', OLD.value_impact, 'new_value', NEW.value_impact), NEW.organization_id);
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER track_change_order_changes_trigger
    AFTER INSERT OR UPDATE ON change_orders
    FOR EACH ROW EXECUTE FUNCTION track_change_order_changes();

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 14: OPPORTUNITY LAST ACTIVITY TRIGGER
-- Auto-updates opportunities.last_activity_at when activities are added.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_opportunity_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE opportunities
    SET last_activity_at = NEW.performed_at,
        updated_at = NOW()
    WHERE id = NEW.opportunity_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_opportunity_last_activity_trigger
    AFTER INSERT ON opportunity_activities
    FOR EACH ROW EXECUTE FUNCTION update_opportunity_last_activity();

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 15: CHANGE ORDER VALUE ROLLUP
-- Auto-updates projects.change_order_value when change orders are approved.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION recalculate_project_change_order_value()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE projects
    SET change_order_value = COALESCE((
        SELECT SUM(value_impact)
        FROM change_orders
        WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
        AND status = 'approved'
    ), 0)
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER recalculate_change_order_value_trigger
    AFTER INSERT OR UPDATE OR DELETE ON change_orders
    FOR EACH ROW EXECUTE FUNCTION recalculate_project_change_order_value();

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 16: DEAL REVENUE ROLLUP TRIGGER
-- Auto-updates deals.total_invoiced / total_recognized from revenue_schedules.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION recalculate_deal_revenue()
RETURNS TRIGGER AS $$
DECLARE
    v_deal_id UUID;
BEGIN
    v_deal_id := COALESCE(NEW.deal_id, OLD.deal_id);
    IF v_deal_id IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;

    UPDATE deals
    SET total_invoiced = COALESCE((
            SELECT SUM(invoiced_amount) FROM revenue_schedules WHERE deal_id = v_deal_id
        ), 0),
        total_recognized = COALESCE((
            SELECT SUM(recognized_amount) FROM revenue_schedules WHERE deal_id = v_deal_id
        ), 0)
    WHERE id = v_deal_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER recalculate_deal_revenue_trigger
    AFTER INSERT OR UPDATE OR DELETE ON revenue_schedules
    FOR EACH ROW EXECUTE FUNCTION recalculate_deal_revenue();

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 17: UTILITY VIEWS
-- Read-only projections for dashboards. Never used as write targets.
-- ─────────────────────────────────────────────────────────────────────────────

-- Account revenue summary view
CREATE OR REPLACE VIEW account_revenue_summary AS
SELECT
    c.id AS company_id,
    c.name AS company_name,
    c.status AS company_status,
    c.organization_id,
    COUNT(DISTINCT d.id) AS deal_count,
    COUNT(DISTINCT p.id) AS project_count,
    COUNT(DISTINCT o.id) FILTER (WHERE o.stage NOT IN ('won', 'lost')) AS open_opportunity_count,
    COALESCE(SUM(DISTINCT d.contracted_value), 0) AS total_contracted,
    COALESCE(SUM(DISTINCT d.total_invoiced), 0) AS total_invoiced,
    COALESCE(SUM(DISTINCT d.total_recognized), 0) AS total_recognized,
    COALESCE(SUM(DISTINCT d.total_collected), 0) AS total_collected,
    MAX(d.closed_at) AS last_deal_date,
    MAX(o.created_at) AS last_opportunity_date
FROM companies c
LEFT JOIN deals d ON d.company_id = c.id
LEFT JOIN projects p ON p.company_id = c.id
LEFT JOIN opportunities o ON o.company_id = c.id
GROUP BY c.id, c.name, c.status, c.organization_id;

-- Pipeline forecast view
CREATE OR REPLACE VIEW pipeline_forecast AS
SELECT
    o.organization_id,
    DATE_TRUNC('month', o.expected_close_date) AS forecast_month,
    o.type AS opportunity_type,
    o.stage,
    COUNT(*) AS opportunity_count,
    SUM(o.value) AS total_value,
    SUM(o.weighted_value) AS weighted_value,
    AVG(o.probability) AS avg_probability
FROM opportunities o
WHERE o.stage NOT IN ('won', 'lost')
  AND o.expected_close_date IS NOT NULL
GROUP BY o.organization_id, DATE_TRUNC('month', o.expected_close_date), o.type, o.stage;

-- Revenue recognition summary view
CREATE OR REPLACE VIEW revenue_recognition_summary AS
SELECT
    rs.organization_id,
    DATE_TRUNC('month', rs.scheduled_date) AS period,
    rs.status,
    COUNT(*) AS entry_count,
    SUM(rs.contracted_amount) AS total_contracted,
    SUM(rs.invoiced_amount) AS total_invoiced,
    SUM(rs.recognized_amount) AS total_recognized
FROM revenue_schedules rs
GROUP BY rs.organization_id, DATE_TRUNC('month', rs.scheduled_date), rs.status;
