-- ═══════════════════════════════════════════════════════════════════════════
-- FROZEN PHOENIX — Workflow, Document & Portal Schema Extension
-- Adds: call_sheets, tech_sheets, approval_workflows, approval_steps,
--        workflow_instances, e_signatures, notification_preferences
-- Maintains 3NF compliance and SSOT principles
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TYPE call_sheet_status AS ENUM ('draft', 'published', 'distributed', 'acknowledged', 'archived');
CREATE TYPE tech_sheet_status AS ENUM ('draft', 'reviewed', 'approved', 'distributed', 'archived');
CREATE TYPE workflow_status AS ENUM ('draft', 'active', 'paused', 'archived');
CREATE TYPE workflow_instance_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled', 'escalated');
CREATE TYPE approval_step_type AS ENUM ('single', 'all', 'any', 'sequential');
CREATE TYPE signature_status AS ENUM ('pending', 'signed', 'declined', 'expired');
-- contract_status already defined in 003_production_lifecycle.sql
-- Adding 'renewed' value if not exists
DO $$ BEGIN
    ALTER TYPE contract_status ADD VALUE IF NOT EXISTS 'renewed';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: CALL SHEETS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE call_sheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,

    -- Identification
    title TEXT NOT NULL,
    call_sheet_number TEXT,
    date DATE NOT NULL,

    -- Schedule
    general_call_time TIME,
    first_shot_time TIME,
    wrap_time TIME,

    -- Location Details
    venue_name TEXT,
    venue_address TEXT,
    parking_instructions TEXT,
    load_in_instructions TEXT,

    -- Weather
    weather_forecast TEXT,
    weather_temp_high INTEGER,
    weather_temp_low INTEGER,

    -- Emergency
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    nearest_hospital TEXT,
    nearest_hospital_address TEXT,

    -- Content (JSONB for flexible crew/schedule sections)
    crew_schedule JSONB DEFAULT '[]',
    department_notes JSONB DEFAULT '{}',
    special_instructions TEXT,

    -- Catering
    breakfast_time TIME,
    lunch_time TIME,
    craft_services_notes TEXT,

    -- Status
    status call_sheet_status NOT NULL DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    distributed_at TIMESTAMPTZ,

    -- Metadata
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_call_sheets_project ON call_sheets(project_id);
CREATE INDEX idx_call_sheets_date ON call_sheets(date);
CREATE INDEX idx_call_sheets_status ON call_sheets(status);

-- Call sheet crew entries (normalized from JSONB for queryability)
CREATE TABLE call_sheet_crew (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_sheet_id UUID NOT NULL REFERENCES call_sheets(id) ON DELETE CASCADE,
    crew_member_id UUID REFERENCES crew_members(id) ON DELETE SET NULL,

    -- Details
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT,
    call_time TIME NOT NULL,
    wrap_time TIME,
    phone TEXT,
    email TEXT,
    notes TEXT,

    -- Status
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_at TIMESTAMPTZ,

    -- Display order
    display_order INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_call_sheet_crew_sheet ON call_sheet_crew(call_sheet_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: TECH SHEETS / TECHNICAL RIDERS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE tech_sheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    activation_id UUID REFERENCES activations(id) ON DELETE SET NULL,

    -- Identification
    title TEXT NOT NULL,
    tech_sheet_number TEXT,
    version INTEGER DEFAULT 1,

    -- Venue/Location Requirements
    venue_name TEXT,
    venue_dimensions TEXT,
    floor_type TEXT,
    ceiling_height TEXT,
    load_in_access TEXT,

    -- Power Requirements
    power_requirements JSONB DEFAULT '[]',
    total_amperage INTEGER,
    power_source TEXT,
    generator_required BOOLEAN DEFAULT false,
    generator_specs TEXT,

    -- Rigging
    rigging_points JSONB DEFAULT '[]',
    rigging_weight_limit TEXT,
    rigging_notes TEXT,

    -- Audio/Visual
    audio_requirements JSONB DEFAULT '[]',
    video_requirements JSONB DEFAULT '[]',
    lighting_requirements JSONB DEFAULT '[]',

    -- Network/IT
    internet_required BOOLEAN DEFAULT false,
    bandwidth_requirements TEXT,
    network_equipment JSONB DEFAULT '[]',

    -- Equipment List
    equipment_list JSONB DEFAULT '[]',

    -- Safety
    fire_safety_notes TEXT,
    max_occupancy INTEGER,
    emergency_exits TEXT,
    safety_equipment JSONB DEFAULT '[]',

    -- Diagrams (URLs to uploaded files)
    floor_plan_url TEXT,
    rigging_plot_url TEXT,
    electrical_diagram_url TEXT,

    -- Notes
    special_requirements TEXT,
    vendor_notes TEXT,

    -- Status
    status tech_sheet_status NOT NULL DEFAULT 'draft',
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,

    -- Metadata
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tech_sheets_project ON tech_sheets(project_id);
CREATE INDEX idx_tech_sheets_status ON tech_sheets(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: APPROVAL WORKFLOW ENGINE
-- ─────────────────────────────────────────────────────────────────────────────

-- Workflow definitions (templates)
CREATE TABLE approval_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,

    -- Scope
    entity_type TEXT NOT NULL,
    lifecycle_stage TEXT,

    -- Configuration
    auto_escalation_hours INTEGER DEFAULT 72,
    allow_delegation BOOLEAN DEFAULT true,
    require_comments BOOLEAN DEFAULT false,

    -- Status
    status workflow_status NOT NULL DEFAULT 'draft',
    version INTEGER DEFAULT 1,

    -- Metadata
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_approval_workflows_org ON approval_workflows(organization_id);
CREATE INDEX idx_approval_workflows_entity ON approval_workflows(entity_type);

-- Steps within a workflow
CREATE TABLE approval_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE,

    -- Step Definition
    name TEXT NOT NULL,
    description TEXT,
    step_order INTEGER NOT NULL,

    -- Approval Type
    step_type approval_step_type NOT NULL DEFAULT 'single',

    -- Approvers (role-based or specific users)
    approver_role TEXT,
    approver_user_ids UUID[] DEFAULT '{}',

    -- Conditions
    conditions JSONB DEFAULT '{}',

    -- Escalation
    escalation_hours INTEGER,
    escalation_to_role TEXT,
    escalation_to_user_id UUID REFERENCES profiles(id),

    -- Auto-actions
    on_approve_action JSONB DEFAULT '{}',
    on_reject_action JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_approval_steps_workflow ON approval_steps(workflow_id);

-- Active workflow instances
CREATE TABLE workflow_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE,

    -- Entity being approved
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    entity_name TEXT,

    -- Current State
    current_step_id UUID REFERENCES approval_steps(id),
    status workflow_instance_status NOT NULL DEFAULT 'pending',

    -- Initiator
    initiated_by UUID REFERENCES profiles(id),
    initiated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Completion
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancelled_reason TEXT,

    -- Metadata
    context JSONB DEFAULT '{}',

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workflow_instances_workflow ON workflow_instances(workflow_id);
CREATE INDEX idx_workflow_instances_entity ON workflow_instances(entity_type, entity_id);
CREATE INDEX idx_workflow_instances_status ON workflow_instances(status);

-- Individual step approvals within an instance
CREATE TABLE workflow_step_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
    step_id UUID NOT NULL REFERENCES approval_steps(id) ON DELETE CASCADE,

    -- Approver
    approver_id UUID REFERENCES profiles(id),
    delegated_from UUID REFERENCES profiles(id),

    -- Decision
    decision TEXT CHECK (decision IN ('approved', 'rejected', 'delegated', 'escalated')),
    comments TEXT,

    -- Timing
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    decided_at TIMESTAMPTZ,
    deadline TIMESTAMPTZ,

    -- Escalation
    escalated BOOLEAN DEFAULT false,
    escalated_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workflow_step_approvals_instance ON workflow_step_approvals(instance_id);
CREATE INDEX idx_workflow_step_approvals_approver ON workflow_step_approvals(approver_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: E-SIGNATURES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE e_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Document reference
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,

    -- Signer
    signer_name TEXT NOT NULL,
    signer_email TEXT NOT NULL,
    signer_role TEXT,
    signer_user_id UUID REFERENCES profiles(id),

    -- Signature
    status signature_status NOT NULL DEFAULT 'pending',
    signature_data TEXT,
    signed_at TIMESTAMPTZ,
    ip_address TEXT,
    user_agent TEXT,

    -- Expiry
    expires_at TIMESTAMPTZ,
    reminder_sent_at TIMESTAMPTZ,

    -- Access
    access_token TEXT UNIQUE,

    -- Metadata
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_e_signatures_entity ON e_signatures(entity_type, entity_id);
CREATE INDEX idx_e_signatures_signer ON e_signatures(signer_email);
CREATE INDEX idx_e_signatures_status ON e_signatures(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: NOTIFICATION PREFERENCES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Channel preferences
    email_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    in_app_enabled BOOLEAN DEFAULT true,

    -- Category preferences (JSONB for flexibility)
    categories JSONB DEFAULT '{
        "approvals": {"email": true, "push": true, "in_app": true},
        "tasks": {"email": true, "push": true, "in_app": true},
        "mentions": {"email": true, "push": true, "in_app": true},
        "deadlines": {"email": true, "push": true, "in_app": true},
        "status_changes": {"email": false, "push": true, "in_app": true},
        "comments": {"email": false, "push": false, "in_app": true},
        "system": {"email": true, "push": false, "in_app": true}
    }',

    -- Quiet hours
    quiet_hours_enabled BOOLEAN DEFAULT false,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    quiet_hours_timezone TEXT DEFAULT 'America/New_York',

    -- Digest
    daily_digest_enabled BOOLEAN DEFAULT false,
    weekly_digest_enabled BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id)
);

CREATE INDEX idx_notification_preferences_user ON notification_preferences(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6: TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TRIGGER set_updated_at_call_sheets BEFORE UPDATE ON call_sheets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_tech_sheets BEFORE UPDATE ON tech_sheets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_approval_workflows BEFORE UPDATE ON approval_workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_approval_steps BEFORE UPDATE ON approval_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_workflow_instances BEFORE UPDATE ON workflow_instances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_e_signatures BEFORE UPDATE ON e_signatures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_notification_preferences BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 7: RLS POLICIES
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE call_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_sheet_crew ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_step_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE e_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation_call_sheets" ON call_sheets USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_isolation_call_sheet_crew" ON call_sheet_crew USING (call_sheet_id IN (SELECT id FROM call_sheets WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())));
CREATE POLICY "org_isolation_tech_sheets" ON tech_sheets USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_isolation_approval_workflows" ON approval_workflows USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_isolation_approval_steps" ON approval_steps USING (workflow_id IN (SELECT id FROM approval_workflows WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())));
CREATE POLICY "org_isolation_workflow_instances" ON workflow_instances USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_isolation_workflow_step_approvals" ON workflow_step_approvals USING (instance_id IN (SELECT id FROM workflow_instances WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())));
CREATE POLICY "org_isolation_e_signatures" ON e_signatures USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "own_notification_preferences" ON notification_preferences USING (user_id = auth.uid());
