-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 012: Production Consolidation
-- ═══════════════════════════════════════════════════════════════════════════════
-- Purpose: Eliminate SSOT violations by consolidating duplicate table pairs
--   1. Extend `tasks` with production_tasks columns → merge data → deprecate
--   2. Extend `milestones` with production_milestones columns → merge data → deprecate
--   3. Create junction tables for activation↔asset, event↔asset, activity↔asset, activity↔consumable
--   4. Add hierarchical budget attribution (activation_id, event_id) to budget_line_items
--   5. Create backward-compatible views for production_tasks / production_milestones
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. EXTEND TASKS TABLE
-- Add columns from production_tasks that don't exist on tasks
-- ─────────────────────────────────────────────────────────────────────────────

-- Department enum already exists from 003
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS department department;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES profiles(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES vendors(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deliverables TEXT[] DEFAULT '{}';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS acceptance_criteria TEXT[] DEFAULT '{}';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC(8,2);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS actual_hours NUMERIC(8,2);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS activation_id UUID REFERENCES activations(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS impact_if_delayed TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS percent_complete INTEGER DEFAULT 0 CHECK (percent_complete >= 0 AND percent_complete <= 100);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS blockers TEXT[] DEFAULT '{}';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS milestone_id UUID REFERENCES milestones(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sow_deliverable_id UUID;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Widen the phase check constraint to include full production_phase values
-- First drop the old constraint, then re-add with expanded values
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_phase_check;
ALTER TABLE tasks ALTER COLUMN phase TYPE TEXT;
ALTER TABLE tasks ADD CONSTRAINT tasks_phase_check CHECK (
    phase IN (
        'pre_production', 'fabrication', 'logistics', 'load_in', 'show', 'strike', 'load_out',
        'discovery', 'design', 'procurement', 'rehearsal', 'wrap'
    )
);

-- Widen status check to match task_status enum values
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check CHECK (
    status IN ('backlog', 'todo', 'in_progress', 'review', 'done', 'blocked', 'completed', 'cancelled')
);

-- Widen priority check to match task_priority enum values
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_priority_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_priority_check CHECK (
    priority IN ('critical', 'high', 'medium', 'low', 'urgent')
);

-- New indexes on tasks for production queries
CREATE INDEX IF NOT EXISTS idx_tasks_department ON tasks(department);
CREATE INDEX IF NOT EXISTS idx_tasks_location ON tasks(location_id);
CREATE INDEX IF NOT EXISTS idx_tasks_activation ON tasks(activation_id);
CREATE INDEX IF NOT EXISTS idx_tasks_event ON tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_tasks_milestone ON tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_tasks_reviewer ON tasks(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_tasks_vendor ON tasks(vendor_id);
CREATE INDEX IF NOT EXISTS idx_tasks_percent ON tasks(percent_complete);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. MIGRATE production_tasks DATA INTO tasks
-- ─────────────────────────────────────────────────────────────────────────────

-- Insert production_tasks rows that don't already exist in tasks (by id)
INSERT INTO tasks (
    id, project_id, parent_id, title, description, status, priority,
    assignee_id, phase, start_date, due_date, completed_at,
    department, reviewer_id, vendor_id, deliverables, acceptance_criteria,
    estimated_hours, actual_hours, location_id, activation_id,
    impact_if_delayed, percent_complete, blockers, milestone_id,
    created_by, updated_by, created_at, updated_at,
    organization_id
)
SELECT
    pt.id,
    pt.project_id,
    pt.parent_task_id,
    pt.title,
    pt.description,
    pt.status::TEXT,
    pt.priority::TEXT,
    pt.assignee_id,
    pt.phase::TEXT,
    pt.start_date,
    pt.due_date,
    pt.completed_at,
    pt.department,
    pt.reviewer_id,
    pt.vendor_id,
    pt.deliverables,
    pt.acceptance_criteria,
    pt.estimated_hours,
    pt.actual_hours,
    pt.location_id,
    pt.activation_id,
    pt.impact_if_delayed,
    pt.percent_complete,
    pt.blockers,
    pt.milestone_id,
    pt.created_by,
    pt.updated_by,
    pt.created_at,
    pt.updated_at,
    pt.organization_id
FROM production_tasks pt
WHERE NOT EXISTS (SELECT 1 FROM tasks t WHERE t.id = pt.id)
ON CONFLICT (id) DO NOTHING;

-- Create backward-compatible view
CREATE OR REPLACE VIEW production_tasks_view AS
SELECT
    t.id,
    t.project_id,
    t.parent_id AS parent_task_id,
    t.department,
    t.phase::TEXT AS phase,
    t.assignee_id,
    t.reviewer_id,
    t.vendor_id,
    t.title,
    t.description,
    t.deliverables,
    t.acceptance_criteria,
    t.start_date,
    t.due_date,
    t.completed_at,
    t.estimated_hours,
    t.actual_hours,
    t.location_id,
    t.activation_id,
    t.priority::TEXT AS priority,
    t.impact_if_delayed,
    t.status::TEXT AS status,
    t.percent_complete,
    t.blockers,
    t.milestone_id,
    t.organization_id,
    t.created_by,
    t.updated_by,
    t.created_at,
    t.updated_at
FROM tasks t
WHERE t.department IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. EXTEND MILESTONES TABLE
-- Add columns from production_milestones that don't exist on milestones
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE milestones ADD COLUMN IF NOT EXISTS phase TEXT;
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES profiles(id);
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS approver_ids UUID[] DEFAULT '{}';
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS is_critical_path BOOLEAN DEFAULT false;
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS client_facing BOOLEAN DEFAULT false;
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS payment_trigger BOOLEAN DEFAULT false;
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS payment_amount NUMERIC(12,2);
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id);

-- Widen milestones status constraint to include production milestone statuses
ALTER TABLE milestones DROP CONSTRAINT IF EXISTS milestones_status_check;
ALTER TABLE milestones ADD CONSTRAINT milestones_status_check CHECK (
    status IN ('pending', 'in_progress', 'completed', 'overdue', 'pending_approval', 'approved', 'rejected')
);

-- Add phase constraint to match production_phase values
ALTER TABLE milestones ADD CONSTRAINT milestones_phase_check CHECK (
    phase IS NULL OR phase IN (
        'discovery', 'design', 'pre_production', 'procurement',
        'fabrication', 'logistics', 'load_in', 'rehearsal',
        'show', 'strike', 'load_out', 'wrap'
    )
);

-- New indexes
CREATE INDEX IF NOT EXISTS idx_milestones_phase ON milestones(phase);
CREATE INDEX IF NOT EXISTS idx_milestones_owner ON milestones(owner_id);
CREATE INDEX IF NOT EXISTS idx_milestones_critical ON milestones(is_critical_path) WHERE is_critical_path = true;
CREATE INDEX IF NOT EXISTS idx_milestones_payment ON milestones(payment_trigger) WHERE payment_trigger = true;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. MIGRATE production_milestones DATA INTO milestones
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO milestones (
    id, project_id, name, description, due_date, completed_at,
    status, deliverables, approval_id, organization_id,
    phase, owner_id, approver_ids, is_critical_path, client_facing,
    payment_trigger, payment_amount, created_by, updated_by,
    created_at, updated_at
)
SELECT
    pm.id,
    pm.project_id,
    pm.name,
    pm.description,
    pm.due_date,
    pm.completed_at,
    pm.status::TEXT,
    CASE 
        WHEN pm.deliverables IS NOT NULL AND pm.deliverables::TEXT != '[]' 
        THEN ARRAY(SELECT jsonb_array_elements_text(
            CASE jsonb_typeof(pm.deliverables)
                WHEN 'array' THEN (
                    SELECT jsonb_agg(
                        CASE jsonb_typeof(elem)
                            WHEN 'string' THEN elem
                            ELSE to_jsonb(elem::TEXT)
                        END
                    )
                    FROM jsonb_array_elements(pm.deliverables) AS elem
                )
                ELSE '[]'::JSONB
            END
        ))
        ELSE '{}'
    END,
    pm.approval_id,
    pm.organization_id,
    pm.phase::TEXT,
    pm.owner_id,
    pm.approver_ids,
    pm.is_critical_path,
    pm.client_facing,
    pm.payment_trigger,
    pm.payment_amount,
    pm.created_by,
    pm.updated_by,
    pm.created_at,
    pm.updated_at
FROM production_milestones pm
WHERE NOT EXISTS (SELECT 1 FROM milestones m WHERE m.id = pm.id)
ON CONFLICT (id) DO NOTHING;

-- Create backward-compatible view
CREATE OR REPLACE VIEW production_milestones_view AS
SELECT
    m.id,
    m.project_id,
    m.phase,
    m.name,
    m.description,
    m.owner_id,
    m.approver_ids,
    m.deliverables,
    m.due_date,
    m.completed_at,
    m.is_critical_path,
    m.client_facing,
    m.status,
    m.payment_trigger,
    m.payment_amount,
    m.approval_id,
    m.organization_id,
    m.created_by,
    m.updated_by,
    m.created_at,
    m.updated_at
FROM milestones m
WHERE m.phase IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. JUNCTION TABLES — Activation ↔ Asset, Event ↔ Asset, etc.
-- ─────────────────────────────────────────────────────────────────────────────

-- Activation ↔ Asset
CREATE TABLE IF NOT EXISTS activation_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activation_id UUID NOT NULL REFERENCES activations(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    role TEXT,
    quantity INTEGER DEFAULT 1,
    notes TEXT,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    returned_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_use', 'returned', 'damaged')),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(activation_id, asset_id)
);

CREATE INDEX idx_activation_assets_activation ON activation_assets(activation_id);
CREATE INDEX idx_activation_assets_asset ON activation_assets(asset_id);

-- Event ↔ Asset
CREATE TABLE IF NOT EXISTS event_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    role TEXT,
    quantity INTEGER DEFAULT 1,
    notes TEXT,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    returned_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_use', 'returned', 'damaged')),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, asset_id)
);

CREATE INDEX idx_event_assets_event ON event_assets(event_id);
CREATE INDEX idx_event_assets_asset ON event_assets(asset_id);

-- Activity ↔ Asset
CREATE TABLE IF NOT EXISTS activity_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    role TEXT,
    quantity INTEGER DEFAULT 1,
    notes TEXT,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(activity_id, asset_id)
);

CREATE INDEX idx_activity_assets_activity ON activity_assets(activity_id);
CREATE INDEX idx_activity_assets_asset ON activity_assets(asset_id);

-- Activity ↔ Consumable
CREATE TABLE IF NOT EXISTS activity_consumables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    consumable_id UUID NOT NULL REFERENCES consumables(id) ON DELETE CASCADE,
    estimated_quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
    actual_quantity NUMERIC(10,2),
    notes TEXT,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(activity_id, consumable_id)
);

CREATE INDEX idx_activity_consumables_activity ON activity_consumables(activity_id);
CREATE INDEX idx_activity_consumables_consumable ON activity_consumables(consumable_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. BUDGET HIERARCHICAL ATTRIBUTION
-- Add activation_id and event_id to budget_line_items for drill-down budgeting
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE budget_line_items ADD COLUMN IF NOT EXISTS activation_id UUID REFERENCES activations(id);
ALTER TABLE budget_line_items ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id);
ALTER TABLE budget_line_items ADD COLUMN IF NOT EXISTS department department;
ALTER TABLE budget_line_items ADD COLUMN IF NOT EXISTS phase TEXT;
ALTER TABLE budget_line_items ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES vendors(id);
ALTER TABLE budget_line_items ADD COLUMN IF NOT EXISTS committed_amount NUMERIC DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_budget_items_activation ON budget_line_items(activation_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_event ON budget_line_items(event_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_department ON budget_line_items(department);
CREATE INDEX IF NOT EXISTS idx_budget_items_vendor ON budget_line_items(vendor_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. RLS POLICIES — Junction tables
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE activation_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_consumables ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'activation_assets',
        'event_assets',
        'activity_assets',
        'activity_consumables'
    ])
    LOOP
        EXECUTE format(
            'CREATE POLICY "Users can view own org %1$s" ON %1$s FOR SELECT USING (
                organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
            )',
            tbl
        );
        EXECUTE format(
            'CREATE POLICY "Users can insert own org %1$s" ON %1$s FOR INSERT WITH CHECK (
                organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
            )',
            tbl
        );
        EXECUTE format(
            'CREATE POLICY "Users can update own org %1$s" ON %1$s FOR UPDATE USING (
                organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
            )',
            tbl
        );
        EXECUTE format(
            'CREATE POLICY "Users can delete own org %1$s" ON %1$s FOR DELETE USING (
                organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
            )',
            tbl
        );
    END LOOP;
END
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. UPDATED_AT TRIGGERS — Junction tables
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'activation_assets',
        'event_assets',
        'activity_assets',
        'activity_consumables'
    ])
    LOOP
        EXECUTE format(
            'CREATE TRIGGER set_updated_at_%1$s
             BEFORE UPDATE ON %1$s
             FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
            tbl
        );
    END LOOP;
END
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. COMMENTS — Document migration rationale
-- ─────────────────────────────────────────────────────────────────────────────

COMMENT ON VIEW production_tasks_view IS 'Backward-compatible view over consolidated tasks table. Filters to rows with department set (production-originated tasks). Original production_tasks table is deprecated.';
COMMENT ON VIEW production_milestones_view IS 'Backward-compatible view over consolidated milestones table. Filters to rows with phase set (production-originated milestones). Original production_milestones table is deprecated.';
COMMENT ON TABLE activation_assets IS 'Junction table: Activation ↔ Asset. Tracks which physical assets are assigned to each activation with status tracking.';
COMMENT ON TABLE event_assets IS 'Junction table: Event ↔ Asset. Tracks which physical assets are deployed at specific events.';
COMMENT ON TABLE activity_assets IS 'Junction table: Activity ↔ Asset. Tracks which assets are used by specific programmed activities.';
COMMENT ON TABLE activity_consumables IS 'Junction table: Activity ↔ Consumable. Tracks estimated vs actual consumable usage per activity.';
