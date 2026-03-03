-- ============================================================================
-- Migration 034: V2 Competitive Feature Gap Implementation
-- Addresses all 14 gaps from COMPETITIVE_FEATURE_GAP_ANALYSIS_V2.md
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- THEME E: CLOSED-LOOP FINANCIAL AUTOMATION
-- ─────────────────────────────────────────────────────────────────────────────

-- E1: Revenue Recognition
ALTER TABLE projects ADD COLUMN IF NOT EXISTS billing_policy TEXT DEFAULT 'time_and_materials'
    CHECK (billing_policy IN ('fixed_price', 'time_and_materials', 'milestone', 'retainer'));

CREATE TABLE IF NOT EXISTS revenue_recognition_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    recognized_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    deferred_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    invoiced_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    method TEXT NOT NULL DEFAULT 'time_and_materials'
        CHECK (method IN ('percentage_of_completion', 'milestone', 'time_and_materials', 'completed_contract', 'retainer')),
    notes TEXT,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rev_rec_project ON revenue_recognition_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_rev_rec_period ON revenue_recognition_entries(period_start, period_end);

-- E2: Invoice source tracking (extends migration 033)
-- Already added source to invoices in 033, ensure invoice_items linkage
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS generated_from_time_entries BOOLEAN DEFAULT false;

-- E3: Time Tracking Policies
CREATE TABLE IF NOT EXISTS time_tracking_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    max_daily_hours NUMERIC(4,2) DEFAULT 12,
    required_fields TEXT[] DEFAULT ARRAY['project_id'],
    logging_deadline_hour INTEGER DEFAULT 20 CHECK (logging_deadline_hour BETWEEN 0 AND 23),
    non_working_days INTEGER[] DEFAULT ARRAY[0, 6],
    overtime_threshold_daily NUMERIC(4,2) DEFAULT 8,
    overtime_threshold_weekly NUMERIC(5,2) DEFAULT 40,
    require_task BOOLEAN DEFAULT false,
    require_description BOOLEAN DEFAULT false,
    reminder_enabled BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ttp_org ON time_tracking_policies(organization_id) WHERE is_active = true;

-- ─────────────────────────────────────────────────────────────────────────────
-- THEME F: AI-NATIVE WORKFLOWS
-- ─────────────────────────────────────────────────────────────────────────────

-- F1: Automation execution engine
ALTER TABLE automations ADD COLUMN IF NOT EXISTS last_triggered_at TIMESTAMPTZ;
ALTER TABLE automations ADD COLUMN IF NOT EXISTS trigger_count INTEGER DEFAULT 0;
ALTER TABLE automations ADD COLUMN IF NOT EXISTS error_count INTEGER DEFAULT 0;
ALTER TABLE automations ADD COLUMN IF NOT EXISTS conditions JSONB DEFAULT '[]';

CREATE TABLE IF NOT EXISTS automation_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
    trigger_record_type TEXT NOT NULL,
    trigger_record_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'running'
        CHECK (status IN ('running', 'success', 'failed', 'skipped')),
    actions_executed JSONB DEFAULT '[]',
    error TEXT,
    duration_ms INTEGER,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_auto_exec_automation ON automation_executions(automation_id);
CREATE INDEX IF NOT EXISTS idx_auto_exec_status ON automation_executions(status);
CREATE INDEX IF NOT EXISTS idx_auto_exec_started ON automation_executions(started_at DESC);

-- F2: AI Report queries (saved)
CREATE TABLE IF NOT EXISTS ai_report_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_text TEXT NOT NULL,
    generated_sql TEXT,
    result_type TEXT DEFAULT 'table' CHECK (result_type IN ('table', 'bar', 'line', 'pie', 'metric')),
    result_data JSONB,
    is_saved BOOLEAN DEFAULT false,
    saved_view_id UUID,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_reports_org ON ai_report_queries(organization_id);

-- F3: Project Templates
CREATE TABLE IF NOT EXISTS project_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    structure JSONB NOT NULL DEFAULT '{}',
    version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proj_templates_org ON project_templates(organization_id);

ALTER TABLE projects ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES project_templates(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS template_version INTEGER;

-- ─────────────────────────────────────────────────────────────────────────────
-- THEME G: REAL-TIME COLLABORATION & COMMUNICATION
-- ─────────────────────────────────────────────────────────────────────────────

-- G1: Email integration
CREATE TABLE IF NOT EXISTS email_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    from_address TEXT NOT NULL,
    from_name TEXT,
    to_addresses TEXT[] DEFAULT '{}',
    cc_addresses TEXT[] DEFAULT '{}',
    subject TEXT NOT NULL,
    body_text TEXT,
    body_html TEXT,
    message_id TEXT UNIQUE,
    in_reply_to TEXT,
    thread_id TEXT,
    direction TEXT NOT NULL DEFAULT 'inbound' CHECK (direction IN ('inbound', 'outbound')),
    attachments JSONB DEFAULT '[]',
    linked_by UUID REFERENCES profiles(id),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_entity ON email_messages(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_email_thread ON email_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_email_message_id ON email_messages(message_id);

-- G2: Notifications system — extend existing table with missing columns
-- The notifications table already exists from an earlier migration; add new columns.
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS entity_type TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS entity_id UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'in_app';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- G3: Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    in_app BOOLEAN DEFAULT true,
    email BOOLEAN DEFAULT true,
    push BOOLEAN DEFAULT false,
    muted_entity_types TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, notification_type)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- THEME H: SELF-SERVICE PORTALS & EXTERNAL ACCESS
-- ─────────────────────────────────────────────────────────────────────────────

-- H1/H2: Portal access tokens (for client & vendor portals)
CREATE TABLE IF NOT EXISTS portal_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    portal_type TEXT NOT NULL CHECK (portal_type IN ('client', 'vendor')),
    scoped_entity_type TEXT,
    scoped_entity_id UUID,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portal_sessions_user ON portal_sessions(user_id, portal_type);

-- H3: Customer Satisfaction Surveys
CREATE TABLE IF NOT EXISTS survey_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    survey_type TEXT NOT NULL DEFAULT 'csat'
        CHECK (survey_type IN ('csat', 'nps', 'post_event', 'post_project', 'custom')),
    questions JSONB NOT NULL DEFAULT '[]',
    trigger_on TEXT DEFAULT 'manual'
        CHECK (trigger_on IN ('manual', 'project_completed', 'event_completed', 'ticket_resolved')),
    is_active BOOLEAN DEFAULT true,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_survey_templates_org ON survey_templates(organization_id);

CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES survey_templates(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    respondent_id UUID REFERENCES profiles(id),
    respondent_email TEXT,
    respondent_name TEXT,
    answers JSONB NOT NULL DEFAULT '{}',
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
    nps_score INTEGER CHECK (nps_score BETWEEN 0 AND 10),
    comments TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_survey_responses_template ON survey_responses(template_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_entity ON survey_responses(entity_type, entity_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- THEME I: OPERATIONAL DEPTH
-- ─────────────────────────────────────────────────────────────────────────────

-- I1: Helpdesk SLA rules
CREATE TABLE IF NOT EXISTS sla_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    response_time_hours NUMERIC(6,2) NOT NULL,
    resolution_time_hours NUMERIC(6,2) NOT NULL,
    escalation_after_hours NUMERIC(6,2),
    escalation_to UUID REFERENCES profiles(id),
    applies_to_types TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sla_policies_org ON sla_policies(organization_id);

-- Extend service_requests with SLA tracking
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS sla_policy_id UUID REFERENCES sla_policies(id) ON DELETE SET NULL;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS sla_response_due_at TIMESTAMPTZ;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS sla_resolution_due_at TIMESTAMPTZ;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS sla_responded_at TIMESTAMPTZ;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS sla_resolved_at TIMESTAMPTZ;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS sla_breached BOOLEAN DEFAULT false;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id);
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS csat_rating INTEGER CHECK (csat_rating BETWEEN 1 AND 5);

-- I2: Custom Property Fields
CREATE TABLE IF NOT EXISTS custom_field_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    field_key TEXT NOT NULL,
    field_type TEXT NOT NULL
        CHECK (field_type IN ('text', 'number', 'date', 'select', 'multi_select', 'boolean', 'currency', 'person', 'url', 'email', 'phone')),
    entity_types TEXT[] NOT NULL DEFAULT '{}',
    options JSONB DEFAULT '[]',
    default_value TEXT,
    is_required BOOLEAN DEFAULT false,
    is_filterable BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    section TEXT DEFAULT 'custom',
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, field_key)
);

CREATE INDEX IF NOT EXISTS idx_cfd_org ON custom_field_definitions(organization_id);
CREATE INDEX IF NOT EXISTS idx_cfd_entity_types ON custom_field_definitions USING GIN (entity_types);

-- custom_field_values was first created in 005 with (custom_field_id, entity_id).
-- This migration extends it with new columns for the v2 custom-fields system.
-- We use ALTER TABLE ... ADD COLUMN IF NOT EXISTS so this is safe to re-run.
ALTER TABLE custom_field_values
    ADD COLUMN IF NOT EXISTS field_definition_id UUID REFERENCES custom_field_definitions(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS entity_type TEXT,
    ADD COLUMN IF NOT EXISTS value_text TEXT,
    ADD COLUMN IF NOT EXISTS value_number NUMERIC(14,4),
    ADD COLUMN IF NOT EXISTS value_date DATE,
    ADD COLUMN IF NOT EXISTS value_boolean BOOLEAN,
    ADD COLUMN IF NOT EXISTS value_json JSONB,
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_cfv_entity ON custom_field_values(entity_id);
CREATE INDEX IF NOT EXISTS idx_cfv_definition ON custom_field_values(field_definition_id) WHERE field_definition_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- VIEWS
-- ─────────────────────────────────────────────────────────────────────────────

-- Revenue Recognition Summary View
CREATE OR REPLACE VIEW v_revenue_recognition_summary AS
SELECT
    p.id AS project_id,
    p.name AS project_name,
    p.billing_policy,
    p.organization_id,
    COALESCE(SUM(rre.recognized_amount), 0) AS total_recognized,
    COALESCE(SUM(rre.deferred_amount), 0) AS total_deferred,
    COALESCE(SUM(rre.invoiced_amount), 0) AS total_invoiced,
    COUNT(rre.id) AS period_count,
    MAX(rre.period_end) AS last_recognition_date
FROM projects p
LEFT JOIN revenue_recognition_entries rre ON rre.project_id = p.id
GROUP BY p.id, p.name, p.billing_policy, p.organization_id;

-- Time Tracking Compliance View
CREATE OR REPLACE VIEW v_time_tracking_compliance AS
SELECT
    cm.id AS crew_member_id,
    cm.name,
    cm.organization_id,
    CURRENT_DATE AS check_date,
    COALESCE(te.hours_today, 0) AS hours_logged_today,
    COALESCE(te.hours_this_week, 0) AS hours_logged_this_week,
    COALESCE(te.entries_today, 0) AS entries_today,
    COALESCE(te.entries_this_week, 0) AS entries_this_week,
    CASE WHEN COALESCE(te.entries_today, 0) = 0 THEN true ELSE false END AS missing_today,
    CASE WHEN COALESCE(te.entries_this_week, 0) < EXTRACT(DOW FROM CURRENT_DATE) THEN true ELSE false END AS missing_days_this_week
FROM crew_members cm
LEFT JOIN LATERAL (
    SELECT
        SUM(CASE WHEN pte.date = CURRENT_DATE
            THEN pte.regular_hours + pte.overtime_hours + pte.double_time_hours ELSE 0 END) AS hours_today,
        SUM(pte.regular_hours + pte.overtime_hours + pte.double_time_hours) AS hours_this_week,
        COUNT(*) FILTER (WHERE pte.date = CURRENT_DATE) AS entries_today,
        COUNT(DISTINCT pte.date) AS entries_this_week
    FROM production_time_entries pte
    WHERE pte.crew_member_id = cm.id
      AND pte.date >= date_trunc('week', CURRENT_DATE)::date
      AND pte.date <= CURRENT_DATE
) te ON true
WHERE cm.status = 'active';

-- SLA Status View
CREATE OR REPLACE VIEW v_sla_status AS
SELECT
    sr.id AS request_id,
    sr.title,
    sr.status,
    sr.priority,
    sr.assigned_to,
    sr.sla_policy_id,
    sp.name AS sla_policy_name,
    sr.sla_response_due_at,
    sr.sla_resolution_due_at,
    sr.sla_responded_at,
    sr.sla_resolved_at,
    sr.sla_breached,
    CASE
        WHEN sr.sla_response_due_at IS NOT NULL AND sr.sla_responded_at IS NULL AND NOW() > sr.sla_response_due_at THEN 'response_breached'
        WHEN sr.sla_resolution_due_at IS NOT NULL AND sr.sla_resolved_at IS NULL AND NOW() > sr.sla_resolution_due_at THEN 'resolution_breached'
        WHEN sr.sla_response_due_at IS NOT NULL AND sr.sla_responded_at IS NULL THEN 'awaiting_response'
        WHEN sr.sla_resolution_due_at IS NOT NULL AND sr.sla_resolved_at IS NULL THEN 'in_progress'
        WHEN sr.sla_resolved_at IS NOT NULL THEN 'resolved'
        ELSE 'no_sla'
    END AS sla_status,
    CASE
        WHEN sr.sla_response_due_at IS NOT NULL AND sr.sla_responded_at IS NULL
        THEN EXTRACT(EPOCH FROM (sr.sla_response_due_at - NOW())) / 3600
        ELSE NULL
    END AS response_hours_remaining,
    CASE
        WHEN sr.sla_resolution_due_at IS NOT NULL AND sr.sla_resolved_at IS NULL
        THEN EXTRACT(EPOCH FROM (sr.sla_resolution_due_at - NOW())) / 3600
        ELSE NULL
    END AS resolution_hours_remaining,
    sr.organization_id
FROM service_requests sr
LEFT JOIN sla_policies sp ON sp.id = sr.sla_policy_id;
