-- ============================================================================
-- Migration 033: Competitive Feature Gap Implementation
-- Addresses all 12 gaps from COMPETITIVE_FEATURE_GAP_ANALYSIS.md
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- THEME A: REAL-TIME PROFITABILITY ENGINE
-- ─────────────────────────────────────────────────────────────────────────────

-- A1: Budget profitability view
-- Joins budgets + budget lines + time entries + expenses to compute live margin
DROP VIEW IF EXISTS v_budget_profitability;
CREATE OR REPLACE VIEW v_budget_profitability AS
SELECT
    b.id AS budget_id,
    b.project_id,
    b.version,
    b.status,
    b.total_budget,
    b.total_actual,
    b.contingency_percent,
    b.markup_percent,
    b.effective_date,
    b.organization_id,
    -- Revenue = budget total + markup
    b.total_budget * (1 + COALESCE(b.markup_percent, 0) / 100) AS revenue,
    -- Internal labor cost from time entries
    COALESCE(te.total_labor_cost, 0) AS labor_cost,
    -- External costs from expenses
    COALESCE(ex.total_expense_cost, 0) AS expense_cost,
    -- Committed (from budget lines)
    COALESCE(bl.total_committed, 0) AS committed_cost,
    -- Total cost
    COALESCE(te.total_labor_cost, 0) + COALESCE(ex.total_expense_cost, 0) AS total_cost,
    -- Profit
    (b.total_budget * (1 + COALESCE(b.markup_percent, 0) / 100))
        - (COALESCE(te.total_labor_cost, 0) + COALESCE(ex.total_expense_cost, 0)) AS profit,
    -- Margin %
    CASE
        WHEN b.total_budget * (1 + COALESCE(b.markup_percent, 0) / 100) > 0
        THEN (
            (b.total_budget * (1 + COALESCE(b.markup_percent, 0) / 100))
            - (COALESCE(te.total_labor_cost, 0) + COALESCE(ex.total_expense_cost, 0))
        ) / (b.total_budget * (1 + COALESCE(b.markup_percent, 0) / 100)) * 100
        ELSE 0
    END AS margin_percent,
    -- Burn rate (total cost / days elapsed)
    CASE
        WHEN (CURRENT_DATE - b.effective_date) > 0
        THEN (COALESCE(te.total_labor_cost, 0) + COALESCE(ex.total_expense_cost, 0))
             / (CURRENT_DATE - b.effective_date)
        ELSE 0
    END AS daily_burn_rate,
    -- Burn %
    CASE
        WHEN b.total_budget > 0
        THEN (COALESCE(te.total_labor_cost, 0) + COALESCE(ex.total_expense_cost, 0)) / b.total_budget * 100
        ELSE 0
    END AS burn_percent,
    -- Hours tracked
    COALESCE(te.total_hours, 0) AS total_hours_tracked,
    COALESCE(te.billable_hours, 0) AS billable_hours,
    -- Days since start
    GREATEST(0, CURRENT_DATE - b.effective_date) AS days_elapsed,
    b.created_at,
    b.updated_at
FROM budgets b
LEFT JOIN LATERAL (
    SELECT
        SUM(pte.total_pay) AS total_labor_cost,
        SUM(pte.regular_hours + pte.overtime_hours + pte.double_time_hours) AS total_hours,
        SUM(CASE WHEN pte.status = 'approved' THEN pte.regular_hours + pte.overtime_hours + pte.double_time_hours ELSE 0 END) AS billable_hours
    FROM production_time_entries pte
    WHERE pte.project_id = b.project_id
) te ON true
LEFT JOIN LATERAL (
    SELECT SUM(pe.amount) AS total_expense_cost
    FROM production_expenses pe
    WHERE pe.project_id = b.project_id
      AND pe.status::text IN ('approved', 'reimbursed')
) ex ON true
LEFT JOIN LATERAL (
    SELECT SUM(pbl.committed_amount) AS total_committed
    FROM production_budget_lines pbl
    WHERE pbl.budget_id = b.id
) bl ON true;

-- Add capacity_hours_per_day to crew_members (needed by v_crew_utilization below)
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS capacity_hours_per_day NUMERIC(4,2) DEFAULT 8;

-- A2: Crew utilization view
-- Joins resource_bookings + crew_availability + time_off to compute utilization
DROP VIEW IF EXISTS v_crew_utilization;
CREATE OR REPLACE VIEW v_crew_utilization AS
SELECT
    cm.id AS crew_member_id,
    cm.name,
    cm.role,
    cm.department,
    cm.hourly_rate,
    cm.status AS crew_status,
    cm.organization_id,
    -- Capacity (default 8h/day × 5 days = 40h/week)
    COALESCE(cm.capacity_hours_per_day, 8) AS capacity_hours_per_day,
    -- Booked hours (current week)
    COALESCE(rb.booked_hours_week, 0) AS booked_hours_week,
    -- Booked hours (current month)
    COALESCE(rb.booked_hours_month, 0) AS booked_hours_month,
    -- Time off hours (current week)
    COALESCE(toff.time_off_hours_week, 0) AS time_off_hours_week,
    -- Utilization % (week) = booked / (capacity - time_off)
    CASE
        WHEN (COALESCE(cm.capacity_hours_per_day, 8) * 5 - COALESCE(toff.time_off_hours_week, 0)) > 0
        THEN COALESCE(rb.booked_hours_week, 0) /
             (COALESCE(cm.capacity_hours_per_day, 8) * 5 - COALESCE(toff.time_off_hours_week, 0)) * 100
        ELSE 0
    END AS utilization_percent_week,
    -- Utilization % (month)
    CASE
        WHEN (COALESCE(cm.capacity_hours_per_day, 8) * 22 - COALESCE(toff.time_off_hours_month, 0)) > 0
        THEN COALESCE(rb.booked_hours_month, 0) /
             (COALESCE(cm.capacity_hours_per_day, 8) * 22 - COALESCE(toff.time_off_hours_month, 0)) * 100
        ELSE 0
    END AS utilization_percent_month,
    -- Active bookings count
    COALESCE(rb.active_bookings, 0) AS active_bookings,
    -- Conflict count
    COALESCE(rb.conflict_count, 0) AS conflict_count
FROM crew_members cm
LEFT JOIN LATERAL (
    SELECT
        SUM(CASE
            WHEN rb2.start_date <= (date_trunc('week', CURRENT_DATE) + interval '4 days')::date
             AND rb2.end_date >= date_trunc('week', CURRENT_DATE)::date
            THEN rb2.hours_per_day * LEAST(
                (rb2.end_date - GREATEST(rb2.start_date, date_trunc('week', CURRENT_DATE)::date) + 1),
                5
            )
            ELSE 0
        END) AS booked_hours_week,
        SUM(CASE
            WHEN rb2.start_date <= (date_trunc('month', CURRENT_DATE) + interval '1 month' - interval '1 day')::date
             AND rb2.end_date >= date_trunc('month', CURRENT_DATE)::date
            THEN rb2.hours_per_day * LEAST(
                (rb2.end_date - GREATEST(rb2.start_date, date_trunc('month', CURRENT_DATE)::date) + 1),
                22
            )
            ELSE 0
        END) AS booked_hours_month,
        COUNT(*) FILTER (WHERE rb2.status IN ('tentative', 'confirmed')) AS active_bookings,
        COUNT(*) FILTER (WHERE rb2.has_conflict = true) AS conflict_count
    FROM resource_bookings rb2
    WHERE rb2.crew_member_id = cm.id
      AND rb2.status != 'cancelled'
      AND rb2.end_date >= date_trunc('month', CURRENT_DATE)::date
) rb ON true
LEFT JOIN LATERAL (
    SELECT
        SUM(CASE
            WHEN tor.start_date <= (date_trunc('week', CURRENT_DATE) + interval '4 days')::date
             AND tor.end_date >= date_trunc('week', CURRENT_DATE)::date
             AND tor.status = 'approved'
            THEN tor.hours_per_day * LEAST(
                (tor.end_date - GREATEST(tor.start_date, date_trunc('week', CURRENT_DATE)::date) + 1),
                5
            )
            ELSE 0
        END) AS time_off_hours_week,
        SUM(CASE
            WHEN tor.start_date <= (date_trunc('month', CURRENT_DATE) + interval '1 month' - interval '1 day')::date
             AND tor.end_date >= date_trunc('month', CURRENT_DATE)::date
             AND tor.status = 'approved'
            THEN tor.hours_per_day * LEAST(
                (tor.end_date - GREATEST(tor.start_date, date_trunc('month', CURRENT_DATE)::date) + 1),
                22
            )
            ELSE 0
        END) AS time_off_hours_month
    FROM time_off_requests tor
    WHERE tor.crew_member_id = cm.id
) toff ON true;

-- A3: Budget alerts
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS alert_thresholds JSONB DEFAULT '[50, 70, 90]';

CREATE TABLE IF NOT EXISTS budget_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    threshold_percent INTEGER NOT NULL,
    actual_percent NUMERIC(6,2) NOT NULL,
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES profiles(id),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_budget_alerts_budget ON budget_alerts(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_alerts_project ON budget_alerts(project_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- THEME C: UNIFIED TIME → INVOICE PIPELINE
-- ─────────────────────────────────────────────────────────────────────────────

-- C1: Add approval + invoice linkage columns to production_time_entries
ALTER TABLE production_time_entries ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE production_time_entries ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL;
ALTER TABLE production_time_entries ADD COLUMN IF NOT EXISTS billable BOOLEAN DEFAULT true;

-- C2: Add billing_policy to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS billing_policy TEXT DEFAULT 'time_and_materials'
    CHECK (billing_policy IN ('fixed_price', 'time_and_materials', 'milestone'));

-- C3: Add source to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual'
    CHECK (source IN ('manual', 'timesheet', 'recurring', 'milestone'));

-- C4: Add public_token to proposals for share links
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS public_token TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_proposals_public_token ON proposals(public_token) WHERE public_token IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- THEME D: OPERATIONAL INTELLIGENCE
-- ─────────────────────────────────────────────────────────────────────────────

-- D1: Record-level activity feed (chatter)
CREATE TABLE IF NOT EXISTS record_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES record_comments(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    mentioned_user_ids UUID[] DEFAULT '{}',
    is_internal BOOLEAN DEFAULT false,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_record_comments_entity ON record_comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_record_comments_author ON record_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_record_comments_parent ON record_comments(parent_comment_id);

CREATE TABLE IF NOT EXISTS record_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    changes JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_record_activity_log_entity ON record_activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_record_activity_log_actor ON record_activity_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_record_activity_log_created ON record_activity_log(created_at DESC);

-- D2: Quality check system
CREATE TABLE IF NOT EXISTS quality_check_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    entity_type TEXT NOT NULL,
    check_items JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qc_templates_entity ON quality_check_templates(entity_type);
CREATE INDEX IF NOT EXISTS idx_qc_templates_org ON quality_check_templates(organization_id);

CREATE TABLE IF NOT EXISTS quality_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES quality_check_templates(id) ON DELETE SET NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    inspector_id UUID NOT NULL REFERENCES profiles(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'passed', 'failed', 'waived')),
    results JSONB DEFAULT '[]',
    notes TEXT,
    photos JSONB DEFAULT '[]',
    completed_at TIMESTAMPTZ,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quality_checks_entity ON quality_checks(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_quality_checks_status ON quality_checks(status);
CREATE INDEX IF NOT EXISTS idx_quality_checks_inspector ON quality_checks(inspector_id);

-- D3: 360° Reviews + Goal Tracking
CREATE TABLE IF NOT EXISTS review_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    cycle_type TEXT NOT NULL DEFAULT 'annual' CHECK (cycle_type IN ('annual', 'semi_annual', 'quarterly', 'project_end', 'ad_hoc')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'cancelled')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_cycles_org ON review_cycles(organization_id);
CREATE INDEX IF NOT EXISTS idx_review_cycles_status ON review_cycles(status);

CREATE TABLE IF NOT EXISTS review_feedback_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_cycle_id UUID NOT NULL REFERENCES review_cycles(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    relationship TEXT NOT NULL DEFAULT 'peer' CHECK (relationship IN ('self', 'manager', 'peer', 'direct_report', 'client', 'vendor')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'submitted', 'declined')),
    responses JSONB DEFAULT '{}',
    overall_rating NUMERIC(3,1),
    comments TEXT,
    submitted_at TIMESTAMPTZ,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_feedback_reviewee ON review_feedback_requests(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_review_feedback_reviewer ON review_feedback_requests(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_review_feedback_cycle ON review_feedback_requests(review_cycle_id);

CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    goal_type TEXT NOT NULL DEFAULT 'individual' CHECK (goal_type IN ('individual', 'team', 'company', 'project')),
    target_value NUMERIC(12,2),
    current_value NUMERIC(12,2) DEFAULT 0,
    unit TEXT DEFAULT 'count',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled', 'deferred')),
    due_date DATE,
    completed_at TIMESTAMPTZ,
    parent_goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_goals_owner ON goals(owner_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_project ON goals(project_id);

-- D4: Knowledge articles + record linking
CREATE TABLE IF NOT EXISTS knowledge_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'guide',
    tags TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    version INTEGER NOT NULL DEFAULT 1,
    author_id UUID NOT NULL REFERENCES profiles(id),
    published_at TIMESTAMPTZ,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_articles_org ON knowledge_articles(organization_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_status ON knowledge_articles(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_category ON knowledge_articles(category);

CREATE TABLE IF NOT EXISTS knowledge_article_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    linked_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(article_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_ka_links_article ON knowledge_article_links(article_id);
CREATE INDEX IF NOT EXISTS idx_ka_links_entity ON knowledge_article_links(entity_type, entity_id);
