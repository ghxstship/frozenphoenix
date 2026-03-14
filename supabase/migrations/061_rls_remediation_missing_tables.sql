-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 061: RLS Remediation — Enable RLS on 38 Missing Tables
-- Audit finding R2: 38 tenant-scoped tables lacked RLS policies.
-- Uses get_user_org_ids() pattern (established in migrations 043/050).
--
-- ALSO: Re-creates 10 tables + columns + views from migration 034 that were
-- lost due to a partial-apply failure on the remote database.
-- All statements use IF NOT EXISTS / IF EXISTS guards for idempotency.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 0: BACKFILL — Re-create objects from 034 partial failure
-- ─────────────────────────────────────────────────────────────────────────────

-- 0a: Missing ALTER TABLE columns
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS generated_from_time_entries BOOLEAN DEFAULT false;

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS entity_type TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS entity_id UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'in_app';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

ALTER TABLE projects ADD COLUMN IF NOT EXISTS billing_policy TEXT DEFAULT 'time_and_materials';
-- Add retainer to the CHECK if missing (safe: drops IF EXISTS then re-adds)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'projects_billing_policy_check'
      AND check_clause LIKE '%retainer%'
  ) THEN
    ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_billing_policy_check;
    ALTER TABLE projects ADD CONSTRAINT projects_billing_policy_check
      CHECK (billing_policy IN ('fixed_price', 'time_and_materials', 'milestone', 'retainer'));
  END IF;
END $$;

ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS sla_policy_id UUID;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS sla_response_due_at TIMESTAMPTZ;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS sla_resolution_due_at TIMESTAMPTZ;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS sla_responded_at TIMESTAMPTZ;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS sla_resolved_at TIMESTAMPTZ;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS sla_breached BOOLEAN DEFAULT false;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS assigned_to UUID;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS csat_rating INTEGER;

-- 0b: 10 missing tables

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

-- Now add FK on service_requests → sla_policies (deferred since sla_policies may not have existed)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'service_requests_sla_policy_id_fkey'
      AND table_name = 'service_requests'
  ) THEN
    ALTER TABLE service_requests
      ADD CONSTRAINT service_requests_sla_policy_id_fkey
      FOREIGN KEY (sla_policy_id) REFERENCES sla_policies(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add FK for service_requests.assigned_to if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'service_requests_assigned_to_fkey'
      AND table_name = 'service_requests'
  ) THEN
    ALTER TABLE service_requests
      ADD CONSTRAINT service_requests_assigned_to_fkey
      FOREIGN KEY (assigned_to) REFERENCES profiles(id);
  END IF;
END $$;

-- Add CHECK for csat_rating if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'service_requests_csat_rating_check'
  ) THEN
    ALTER TABLE service_requests
      ADD CONSTRAINT service_requests_csat_rating_check
      CHECK (csat_rating BETWEEN 1 AND 5);
  END IF;
END $$;

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

-- Extend custom_field_values with v2 columns
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

-- 0c: Missing views

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

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: ENABLE ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE ai_report_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_reconciliation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comm_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE comm_log_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE command_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE environmental_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE foh_zone_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE foh_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_article_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_crew_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_event_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_financial_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_event_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_check_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE readiness_gates ENABLE ROW LEVEL SECURITY;
ALTER TABLE record_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE record_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_recognition_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_feedback_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ros_cues ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE strike_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_tracking_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_service_requests ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: ORG-ISOLATION POLICIES (organization_id tables)
-- Standard pattern: SELECT/INSERT/UPDATE use get_user_org_ids()
--                   DELETE restricted to exec org membership
-- ─────────────────────────────────────────────────────────────────────────────

-- ai_report_queries
CREATE POLICY ai_report_queries_select ON ai_report_queries
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY ai_report_queries_insert ON ai_report_queries
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY ai_report_queries_update ON ai_report_queries
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY ai_report_queries_delete ON ai_report_queries
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- asset_reconciliation_items
CREATE POLICY asset_reconciliation_items_select ON asset_reconciliation_items
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY asset_reconciliation_items_insert ON asset_reconciliation_items
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY asset_reconciliation_items_update ON asset_reconciliation_items
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY asset_reconciliation_items_delete ON asset_reconciliation_items
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- automation_executions
CREATE POLICY automation_executions_select ON automation_executions
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY automation_executions_insert ON automation_executions
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY automation_executions_update ON automation_executions
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY automation_executions_delete ON automation_executions
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- budget_alerts
CREATE POLICY budget_alerts_select ON budget_alerts
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY budget_alerts_insert ON budget_alerts
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY budget_alerts_update ON budget_alerts
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY budget_alerts_delete ON budget_alerts
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- comm_channels
CREATE POLICY comm_channels_select ON comm_channels
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY comm_channels_insert ON comm_channels
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY comm_channels_update ON comm_channels
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY comm_channels_delete ON comm_channels
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- comm_log_entries
CREATE POLICY comm_log_entries_select ON comm_log_entries
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY comm_log_entries_insert ON comm_log_entries
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY comm_log_entries_update ON comm_log_entries
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY comm_log_entries_delete ON comm_log_entries
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- command_positions
CREATE POLICY command_positions_select ON command_positions
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY command_positions_insert ON command_positions
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY command_positions_update ON command_positions
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY command_positions_delete ON command_positions
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- custom_field_definitions
CREATE POLICY custom_field_definitions_select ON custom_field_definitions
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY custom_field_definitions_insert ON custom_field_definitions
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY custom_field_definitions_update ON custom_field_definitions
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY custom_field_definitions_delete ON custom_field_definitions
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- department_statuses
CREATE POLICY department_statuses_select ON department_statuses
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY department_statuses_insert ON department_statuses
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY department_statuses_update ON department_statuses
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY department_statuses_delete ON department_statuses
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- email_messages
CREATE POLICY email_messages_select ON email_messages
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY email_messages_insert ON email_messages
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY email_messages_update ON email_messages
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY email_messages_delete ON email_messages
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- environmental_readings
CREATE POLICY environmental_readings_select ON environmental_readings
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY environmental_readings_insert ON environmental_readings
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY environmental_readings_update ON environmental_readings
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY environmental_readings_delete ON environmental_readings
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- equipment_check_ins
CREATE POLICY equipment_check_ins_select ON equipment_check_ins
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY equipment_check_ins_insert ON equipment_check_ins
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY equipment_check_ins_update ON equipment_check_ins
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY equipment_check_ins_delete ON equipment_check_ins
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- foh_zone_readings
CREATE POLICY foh_zone_readings_select ON foh_zone_readings
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY foh_zone_readings_insert ON foh_zone_readings
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY foh_zone_readings_update ON foh_zone_readings
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY foh_zone_readings_delete ON foh_zone_readings
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- foh_zones
CREATE POLICY foh_zones_select ON foh_zones
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY foh_zones_insert ON foh_zones
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY foh_zones_update ON foh_zones
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY foh_zones_delete ON foh_zones
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- goals
CREATE POLICY goals_select ON goals
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY goals_insert ON goals
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY goals_update ON goals
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY goals_delete ON goals
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- guest_incidents
CREATE POLICY guest_incidents_select ON guest_incidents
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY guest_incidents_insert ON guest_incidents
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY guest_incidents_update ON guest_incidents
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY guest_incidents_delete ON guest_incidents
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- knowledge_articles
CREATE POLICY knowledge_articles_select ON knowledge_articles
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY knowledge_articles_insert ON knowledge_articles
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY knowledge_articles_update ON knowledge_articles
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY knowledge_articles_delete ON knowledge_articles
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- knowledge_article_links (junction table — scoped via parent article)
CREATE POLICY knowledge_article_links_select ON knowledge_article_links
    FOR SELECT USING (
        article_id IN (
            SELECT id FROM knowledge_articles
            WHERE organization_id = ANY(get_user_org_ids())
        )
    );
CREATE POLICY knowledge_article_links_insert ON knowledge_article_links
    FOR INSERT WITH CHECK (
        article_id IN (
            SELECT id FROM knowledge_articles
            WHERE organization_id = ANY(get_user_org_ids())
        )
    );
CREATE POLICY knowledge_article_links_delete ON knowledge_article_links
    FOR DELETE USING (
        article_id IN (
            SELECT id FROM knowledge_articles
            WHERE organization_id = ANY(get_user_org_ids())
        )
    );

-- live_crew_assignments
CREATE POLICY live_crew_assignments_select ON live_crew_assignments
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY live_crew_assignments_insert ON live_crew_assignments
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY live_crew_assignments_update ON live_crew_assignments
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY live_crew_assignments_delete ON live_crew_assignments
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- live_event_instances
CREATE POLICY live_event_instances_select ON live_event_instances
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY live_event_instances_insert ON live_event_instances
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY live_event_instances_update ON live_event_instances
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY live_event_instances_delete ON live_event_instances
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- live_financial_snapshots
CREATE POLICY live_financial_snapshots_select ON live_financial_snapshots
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY live_financial_snapshots_insert ON live_financial_snapshots
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY live_financial_snapshots_update ON live_financial_snapshots
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY live_financial_snapshots_delete ON live_financial_snapshots
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- portal_sessions (user-scoped — no organization_id, scoped by user_id)
CREATE POLICY portal_sessions_select ON portal_sessions
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY portal_sessions_insert ON portal_sessions
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY portal_sessions_delete ON portal_sessions
    FOR DELETE USING (user_id = auth.uid());

-- post_event_reports
CREATE POLICY post_event_reports_select ON post_event_reports
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY post_event_reports_insert ON post_event_reports
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY post_event_reports_update ON post_event_reports
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY post_event_reports_delete ON post_event_reports
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- quality_check_templates
CREATE POLICY quality_check_templates_select ON quality_check_templates
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY quality_check_templates_insert ON quality_check_templates
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY quality_check_templates_update ON quality_check_templates
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY quality_check_templates_delete ON quality_check_templates
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- quality_checks
CREATE POLICY quality_checks_select ON quality_checks
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY quality_checks_insert ON quality_checks
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY quality_checks_update ON quality_checks
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY quality_checks_delete ON quality_checks
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- readiness_gates
CREATE POLICY readiness_gates_select ON readiness_gates
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY readiness_gates_insert ON readiness_gates
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY readiness_gates_update ON readiness_gates
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY readiness_gates_delete ON readiness_gates
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- record_activity_log
CREATE POLICY record_activity_log_select ON record_activity_log
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY record_activity_log_insert ON record_activity_log
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY record_activity_log_update ON record_activity_log
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY record_activity_log_delete ON record_activity_log
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- record_comments
CREATE POLICY record_comments_select ON record_comments
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY record_comments_insert ON record_comments
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY record_comments_update ON record_comments
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY record_comments_delete ON record_comments
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- revenue_recognition_entries
CREATE POLICY revenue_recognition_entries_select ON revenue_recognition_entries
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY revenue_recognition_entries_insert ON revenue_recognition_entries
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY revenue_recognition_entries_update ON revenue_recognition_entries
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY revenue_recognition_entries_delete ON revenue_recognition_entries
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- review_cycles
CREATE POLICY review_cycles_select ON review_cycles
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY review_cycles_insert ON review_cycles
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY review_cycles_update ON review_cycles
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY review_cycles_delete ON review_cycles
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- review_feedback_requests
CREATE POLICY review_feedback_requests_select ON review_feedback_requests
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY review_feedback_requests_insert ON review_feedback_requests
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY review_feedback_requests_update ON review_feedback_requests
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY review_feedback_requests_delete ON review_feedback_requests
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- ros_cues
CREATE POLICY ros_cues_select ON ros_cues
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY ros_cues_insert ON ros_cues
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY ros_cues_update ON ros_cues
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY ros_cues_delete ON ros_cues
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- sla_policies
CREATE POLICY sla_policies_select ON sla_policies
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY sla_policies_insert ON sla_policies
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY sla_policies_update ON sla_policies
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY sla_policies_delete ON sla_policies
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- strike_sequences
CREATE POLICY strike_sequences_select ON strike_sequences
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY strike_sequences_insert ON strike_sequences
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY strike_sequences_update ON strike_sequences
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY strike_sequences_delete ON strike_sequences
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- survey_responses
CREATE POLICY survey_responses_select ON survey_responses
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY survey_responses_insert ON survey_responses
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY survey_responses_update ON survey_responses
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY survey_responses_delete ON survey_responses
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- survey_templates
CREATE POLICY survey_templates_select ON survey_templates
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY survey_templates_insert ON survey_templates
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY survey_templates_update ON survey_templates
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY survey_templates_delete ON survey_templates
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- time_tracking_policies
CREATE POLICY time_tracking_policies_select ON time_tracking_policies
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY time_tracking_policies_insert ON time_tracking_policies
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY time_tracking_policies_update ON time_tracking_policies
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY time_tracking_policies_delete ON time_tracking_policies
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- vip_guests
CREATE POLICY vip_guests_select ON vip_guests
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY vip_guests_insert ON vip_guests
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY vip_guests_update ON vip_guests
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY vip_guests_delete ON vip_guests
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- vip_service_requests
CREATE POLICY vip_service_requests_select ON vip_service_requests
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY vip_service_requests_insert ON vip_service_requests
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY vip_service_requests_update ON vip_service_requests
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY vip_service_requests_delete ON vip_service_requests
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));
