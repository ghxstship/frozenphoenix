-- ═══════════════════════════════════════════════════════════════
-- FROZEN PHOENIX — Extended Schema Migration
-- Time Tracking, Expenses, Budgets, Milestones, Comments, Activity
-- ═══════════════════════════════════════════════════════════════

-- ─── Time Entries ───
CREATE TABLE IF NOT EXISTS time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    crew_member_id UUID REFERENCES crew_members(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    hours_worked NUMERIC(5,2) NOT NULL CHECK (hours_worked > 0),
    hourly_rate NUMERIC(10,2) NOT NULL CHECK (hourly_rate >= 0),
    total_cost NUMERIC(12,2) GENERATED ALWAYS AS (hours_worked * hourly_rate) STORED,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_time_entries_project ON time_entries(project_id);
CREATE INDEX idx_time_entries_crew ON time_entries(crew_member_id);
CREATE INDEX idx_time_entries_date ON time_entries(date);

-- ─── Expenses ───
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('materials', 'labor', 'travel', 'equipment_rental', 'shipping', 'permits', 'catering', 'misc')),
    description TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    receipt_url TEXT,
    submitted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'reimbursed')),
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_expenses_project ON expenses(project_id);
CREATE INDEX idx_expenses_status ON expenses(status);

-- ─── Budget Line Items ───
CREATE TABLE IF NOT EXISTS budget_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('labor', 'materials', 'equipment', 'rentals', 'travel', 'shipping', 'permits', 'contingency', 'overhead')),
    description TEXT NOT NULL,
    estimated_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    actual_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    variance NUMERIC(12,2) GENERATED ALWAYS AS (actual_amount - estimated_amount) STORED,
    notes TEXT,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_budget_items_project ON budget_line_items(project_id);

-- ─── Milestones ───
CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
    deliverables TEXT[] DEFAULT '{}',
    approval_required BOOLEAN DEFAULT false,
    approval_id UUID REFERENCES approvals(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_milestones_project ON milestones(project_id);
CREATE INDEX idx_milestones_due_date ON milestones(due_date);

-- ─── Comments ───
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'task', 'approval', 'deal')),
    entity_id UUID NOT NULL,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    mentions UUID[] DEFAULT '{}',
    attachments TEXT[] DEFAULT '{}',
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX idx_comments_author ON comments(author_id);

-- ─── Activity Log ───
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'status_changed', 'assigned', 'commented', 'approved', 'rejected')),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_actor ON activity_log(actor_id);
CREATE INDEX idx_activity_created ON activity_log(created_at DESC);

-- ─── Project Templates ───
CREATE TABLE IF NOT EXISTS project_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    phases JSONB NOT NULL DEFAULT '[]',
    default_budget_categories TEXT[] DEFAULT '{}',
    default_roles TEXT[] DEFAULT '{}',
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Report Definitions ───
CREATE TABLE IF NOT EXISTS report_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('project_summary', 'budget_variance', 'crew_utilization', 'vendor_spend', 'approval_timeline', 'pipeline_forecast')),
    filters JSONB DEFAULT '[]',
    columns JSONB DEFAULT '[]',
    group_by TEXT,
    sort_by TEXT,
    is_template BOOLEAN DEFAULT false,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Integrations ───
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('quickbooks', 'xero', 'slack', 'google_calendar', 'dropbox', 'google_drive', 'zapier')),
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error')),
    config JSONB DEFAULT '{}',
    last_sync_at TIMESTAMPTZ,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- Row Level Security Policies
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Time Entries policies
CREATE POLICY "Users can view time entries in their org" ON time_entries
    FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create time entries in their org" ON time_entries
    FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their own time entries" ON time_entries
    FOR UPDATE USING (crew_member_id IN (SELECT id FROM crew_members WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())));

-- Expenses policies
CREATE POLICY "Users can view expenses in their org" ON expenses
    FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create expenses in their org" ON expenses
    FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Budget Line Items policies
CREATE POLICY "Users can view budget items in their org" ON budget_line_items
    FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage budget items in their org" ON budget_line_items
    FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Milestones policies
CREATE POLICY "Users can view milestones in their org" ON milestones
    FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage milestones in their org" ON milestones
    FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Comments policies
CREATE POLICY "Users can view comments in their org" ON comments
    FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create comments in their org" ON comments
    FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their own comments" ON comments
    FOR UPDATE USING (author_id = auth.uid());

-- Activity Log policies
CREATE POLICY "Users can view activity in their org" ON activity_log
    FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "System can insert activity" ON activity_log
    FOR INSERT WITH CHECK (true);

-- Project Templates policies
CREATE POLICY "Users can view templates in their org" ON project_templates
    FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage templates in their org" ON project_templates
    FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Report Definitions policies
CREATE POLICY "Users can view reports in their org" ON report_definitions
    FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage reports in their org" ON report_definitions
    FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Integrations policies
CREATE POLICY "Users can view integrations in their org" ON integrations
    FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage integrations" ON integrations
    FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'exec'));

-- ═══════════════════════════════════════════════════════════════
-- Triggers for updated_at
-- ═══════════════════════════════════════════════════════════════

CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_line_items_updated_at BEFORE UPDATE ON budget_line_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_templates_updated_at BEFORE UPDATE ON project_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_definitions_updated_at BEFORE UPDATE ON report_definitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════
-- Activity Log Trigger Function
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO activity_log (entity_type, entity_id, action, actor_id, metadata, organization_id)
    VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE TG_OP
            WHEN 'INSERT' THEN 'created'
            WHEN 'UPDATE' THEN 'updated'
            WHEN 'DELETE' THEN 'deleted'
        END,
        auth.uid(),
        CASE TG_OP
            WHEN 'INSERT' THEN to_jsonb(NEW)
            WHEN 'UPDATE' THEN jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
            WHEN 'DELETE' THEN to_jsonb(OLD)
        END,
        COALESCE(NEW.organization_id, OLD.organization_id)
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply activity logging to key tables
CREATE TRIGGER log_projects_activity AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_tasks_activity AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_deals_activity AFTER INSERT OR UPDATE OR DELETE ON deals
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_approvals_activity AFTER INSERT OR UPDATE OR DELETE ON approvals
    FOR EACH ROW EXECUTE FUNCTION log_activity();
