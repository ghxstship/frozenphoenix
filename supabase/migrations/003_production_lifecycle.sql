-- ═══════════════════════════════════════════════════════════════════════════
-- FROZEN PHOENIX — Production Lifecycle Schema
-- Complete database schema for creative/experiential production management
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TYPE project_type AS ENUM ('tour', 'festival', 'activation', 'installation', 'broadcast', 'corporate', 'retail', 'experiential');
CREATE TYPE project_status AS ENUM ('draft', 'planning', 'pre_production', 'in_production', 'wrap', 'completed', 'cancelled', 'on_hold');
CREATE TYPE production_phase AS ENUM ('discovery', 'design', 'pre_production', 'procurement', 'fabrication', 'logistics', 'load_in', 'rehearsal', 'show', 'strike', 'load_out', 'wrap');
CREATE TYPE location_type AS ENUM ('venue', 'warehouse', 'office', 'fabrication_shop', 'staging_area', 'hotel', 'airport', 'other');
CREATE TYPE activation_type AS ENUM ('booth', 'stage', 'installation', 'pop_up', 'mobile', 'digital', 'hybrid');
CREATE TYPE activation_status AS ENUM ('planning', 'design', 'build', 'installed', 'active', 'struck', 'stored');
CREATE TYPE event_type AS ENUM ('show', 'rehearsal', 'setup', 'strike', 'meeting', 'walkthrough', 'training', 'press', 'vip');
CREATE TYPE event_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'postponed');
CREATE TYPE activity_type AS ENUM ('performance', 'presentation', 'demo', 'sampling', 'photo_op', 'game', 'workshop', 'meet_greet', 'other');
CREATE TYPE activity_status AS ENUM ('planned', 'ready', 'active', 'paused', 'completed', 'cancelled');
CREATE TYPE department AS ENUM ('production', 'construction', 'technical', 'fabrication', 'print', 'scenic', 'props', 'av', 'lighting', 'rigging', 'food_beverage', 'staffing', 'logistics', 'finance', 'creative');
CREATE TYPE task_status AS ENUM ('backlog', 'todo', 'in_progress', 'review', 'blocked', 'completed', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent', 'critical');
CREATE TYPE procurement_status AS ENUM ('draft', 'pending_approval', 'approved', 'sent', 'acknowledged', 'in_progress', 'shipped', 'received', 'completed', 'cancelled', 'disputed');
CREATE TYPE contract_type AS ENUM ('vendor', 'client', 'venue', 'talent', 'sponsor', 'nda', 'other');
CREATE TYPE contract_status AS ENUM ('draft', 'pending_review', 'pending_signature', 'active', 'expired', 'terminated');
CREATE TYPE employment_type AS ENUM ('employee', 'contractor', 'freelance', 'temp', 'intern', 'volunteer');
CREATE TYPE crew_status AS ENUM ('active', 'inactive', 'on_leave', 'terminated', 'do_not_rehire');
CREATE TYPE shift_status AS ENUM ('scheduled', 'confirmed', 'checked_in', 'on_break', 'checked_out', 'no_show', 'cancelled');
CREATE TYPE asset_category AS ENUM ('staging', 'lighting', 'audio', 'video', 'rigging', 'scenic', 'props', 'furniture', 'tools', 'vehicles', 'technology', 'safety', 'other');
CREATE TYPE asset_condition AS ENUM ('new', 'excellent', 'good', 'fair', 'needs_repair', 'decommissioned');
CREATE TYPE asset_ownership AS ENUM ('owned', 'rental', 'client_provided', 'vendor_provided');
CREATE TYPE asset_assignment_status AS ENUM ('reserved', 'checked_out', 'in_use', 'returned', 'damaged', 'lost');
CREATE TYPE shipment_type AS ENUM ('outbound', 'inbound', 'transfer', 'return');
CREATE TYPE shipment_status AS ENUM ('planning', 'booked', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'exception', 'cancelled');
CREATE TYPE shipment_priority AS ENUM ('standard', 'expedited', 'rush', 'hot');
CREATE TYPE vehicle_type AS ENUM ('box_truck', 'semi', 'sprinter', 'pickup', 'trailer', 'forklift', 'other');
CREATE TYPE vehicle_status AS ENUM ('available', 'in_use', 'maintenance', 'out_of_service');
CREATE TYPE vehicle_ownership AS ENUM ('owned', 'leased', 'rental');
CREATE TYPE budget_category AS ENUM ('labor', 'materials', 'equipment_rental', 'equipment_purchase', 'fabrication', 'print', 'av', 'lighting', 'scenic', 'travel', 'lodging', 'per_diem', 'shipping', 'trucking', 'venue', 'permits', 'insurance', 'talent', 'catering', 'staffing', 'security', 'contingency', 'overhead', 'markup');
CREATE TYPE budget_status AS ENUM ('draft', 'pending_approval', 'approved', 'locked');
CREATE TYPE expense_status AS ENUM ('draft', 'submitted', 'pending_approval', 'approved', 'rejected', 'reimbursed');
CREATE TYPE payment_method AS ENUM ('corporate_card', 'personal_card', 'cash', 'check', 'wire', 'ach');
CREATE TYPE invoice_type AS ENUM ('vendor', 'client');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'disputed', 'void');
CREATE TYPE time_entry_status AS ENUM ('draft', 'submitted', 'approved', 'rejected', 'processed');
CREATE TYPE payroll_status AS ENUM ('draft', 'pending_approval', 'approved', 'processing', 'completed');
CREATE TYPE incident_type AS ENUM ('safety', 'injury', 'property_damage', 'theft', 'security', 'weather', 'equipment_failure', 'vendor_issue', 'client_complaint', 'other');
CREATE TYPE incident_severity AS ENUM ('minor', 'moderate', 'major', 'critical');
CREATE TYPE incident_status AS ENUM ('reported', 'investigating', 'pending_action', 'resolved', 'closed');
CREATE TYPE document_category AS ENUM ('sop', 'template', 'checklist', 'guide', 'policy', 'form', 'reference', 'training');
CREATE TYPE document_status AS ENUM ('draft', 'pending_review', 'published', 'archived');
CREATE TYPE sop_status AS ENUM ('draft', 'active', 'under_review', 'superseded', 'archived');
CREATE TYPE checklist_type AS ENUM ('pre_event', 'post_event', 'safety', 'quality', 'maintenance', 'custom');
CREATE TYPE checklist_status AS ENUM ('pending', 'in_progress', 'completed', 'overdue');
CREATE TYPE milestone_status AS ENUM ('pending', 'in_progress', 'pending_approval', 'approved', 'rejected', 'overdue');
CREATE TYPE deliverable_status AS ENUM ('pending', 'submitted', 'approved', 'rejected');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE availability_status AS ENUM ('available', 'unavailable', 'tentative', 'booked');
CREATE TYPE assignment_status AS ENUM ('pending', 'confirmed', 'active', 'completed', 'cancelled');
CREATE TYPE rate_type AS ENUM ('hourly', 'daily', 'weekly', 'flat');

-- ─────────────────────────────────────────────────────────────────────────────
-- PROJECT HIERARCHY
-- ─────────────────────────────────────────────────────────────────────────────

-- Locations
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type location_type NOT NULL DEFAULT 'venue',
    description TEXT,
    
    -- Contact
    contact_name TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    venue_rep_id UUID REFERENCES profiles(id),
    
    -- Details
    capacity INTEGER,
    square_footage INTEGER,
    amenities TEXT[] DEFAULT '{}',
    restrictions TEXT[] DEFAULT '{}',
    
    -- Access
    access_start_date DATE,
    access_end_date DATE,
    load_in_windows JSONB DEFAULT '[]',
    load_out_windows JSONB DEFAULT '[]',
    
    -- Address
    address_street1 TEXT,
    address_street2 TEXT,
    address_city TEXT,
    address_state TEXT,
    address_postal_code TEXT,
    address_country TEXT DEFAULT 'USA',
    coordinates POINT,
    parking_info TEXT,
    dock_info TEXT,
    
    -- Purpose
    purpose TEXT,
    
    -- Costs
    daily_rate NUMERIC(12,2),
    total_cost NUMERIC(12,2),
    power_available TEXT,
    internet_available BOOLEAN DEFAULT false,
    
    -- Requirements
    insurance_required BOOLEAN DEFAULT false,
    permits_required TEXT[] DEFAULT '{}',
    
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_locations_project ON locations(project_id);
CREATE INDEX idx_locations_type ON locations(type);

-- Activations
CREATE TABLE activations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    type activation_type NOT NULL DEFAULT 'booth',
    status activation_status NOT NULL DEFAULT 'planning',
    
    -- Team
    lead_id UUID REFERENCES profiles(id),
    team_ids UUID[] DEFAULT '{}',
    vendor_ids UUID[] DEFAULT '{}',
    
    -- Details
    description TEXT,
    width NUMERIC(10,2),
    depth NUMERIC(10,2),
    height NUMERIC(10,2),
    dimension_unit TEXT DEFAULT 'ft',
    components JSONB DEFAULT '[]',
    
    -- Schedule
    install_date DATE,
    strike_date DATE,
    operating_hours JSONB DEFAULT '[]',
    
    -- Position
    floor_plan_position JSONB,
    zone TEXT,
    
    -- Goals
    experience_goals TEXT[] DEFAULT '{}',
    target_audience TEXT,
    expected_footfall INTEGER,
    
    -- Resources
    budget NUMERIC(12,2),
    power_requirements TEXT,
    staffing_requirements JSONB DEFAULT '[]',
    
    -- Contingency
    weather_contingency TEXT,
    backup_plan TEXT,
    
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activations_project ON activations(project_id);
CREATE INDEX idx_activations_location ON activations(location_id);
CREATE INDEX idx_activations_status ON activations(status);

-- Events
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    activation_id UUID REFERENCES activations(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    type event_type NOT NULL DEFAULT 'show',
    status event_status NOT NULL DEFAULT 'scheduled',
    
    -- Team
    producer_id UUID REFERENCES profiles(id),
    stage_manager_id UUID REFERENCES profiles(id),
    attendee_count INTEGER,
    vip_count INTEGER,
    
    -- Details
    description TEXT,
    run_of_show JSONB DEFAULT '[]',
    
    -- Schedule
    date DATE NOT NULL,
    doors_time TIME,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    -- Location
    specific_location TEXT,
    
    -- Purpose
    purpose TEXT,
    
    -- Budget
    budget NUMERIC(12,2),
    
    -- Contingency
    rain_plan TEXT,
    cancellation_policy TEXT,
    
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_project ON events(project_id);
CREATE INDEX idx_events_location ON events(location_id);
CREATE INDEX idx_events_activation ON events(activation_id);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_status ON events(status);

-- Activities
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    activation_id UUID REFERENCES activations(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    type activity_type NOT NULL DEFAULT 'other',
    status activity_status NOT NULL DEFAULT 'planned',
    
    -- Team
    lead_id UUID REFERENCES profiles(id),
    staff_ids UUID[] DEFAULT '{}',
    participant_count INTEGER,
    
    -- Details
    description TEXT,
    requirements TEXT[] DEFAULT '{}',
    
    -- Schedule
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    frequency TEXT DEFAULT 'once',
    
    -- Location
    specific_location TEXT,
    
    -- Purpose
    objective TEXT,
    
    -- Instructions
    instructions TEXT,
    equipment_needed TEXT[] DEFAULT '{}',
    
    -- Contingency
    contingency_plan TEXT,
    
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activities_project ON activities(project_id);
CREATE INDEX idx_activities_event ON activities(event_id);
CREATE INDEX idx_activities_activation ON activities(activation_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- PROJECT MANAGEMENT
-- ─────────────────────────────────────────────────────────────────────────────

-- Production Tasks (extends existing tasks table concept)
CREATE TABLE production_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    parent_task_id UUID REFERENCES production_tasks(id) ON DELETE SET NULL,
    department department NOT NULL DEFAULT 'production',
    phase production_phase NOT NULL DEFAULT 'pre_production',
    
    -- Assignment
    assignee_id UUID REFERENCES profiles(id),
    reviewer_id UUID REFERENCES profiles(id),
    vendor_id UUID REFERENCES vendors(id),
    
    -- Details
    title TEXT NOT NULL,
    description TEXT,
    deliverables TEXT[] DEFAULT '{}',
    acceptance_criteria TEXT[] DEFAULT '{}',
    
    -- Schedule
    start_date DATE,
    due_date DATE,
    completed_at TIMESTAMPTZ,
    estimated_hours NUMERIC(8,2),
    actual_hours NUMERIC(8,2),
    
    -- Location
    location_id UUID REFERENCES locations(id),
    activation_id UUID REFERENCES activations(id),
    
    -- Priority
    priority task_priority NOT NULL DEFAULT 'medium',
    impact_if_delayed TEXT,
    
    -- Status
    status task_status NOT NULL DEFAULT 'backlog',
    percent_complete INTEGER DEFAULT 0 CHECK (percent_complete >= 0 AND percent_complete <= 100),
    blockers TEXT[] DEFAULT '{}',
    
    -- Dependencies
    dependencies UUID[] DEFAULT '{}',
    dependents UUID[] DEFAULT '{}',
    
    -- Relationships
    milestone_id UUID,
    
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_production_tasks_project ON production_tasks(project_id);
CREATE INDEX idx_production_tasks_assignee ON production_tasks(assignee_id);
CREATE INDEX idx_production_tasks_status ON production_tasks(status);
CREATE INDEX idx_production_tasks_department ON production_tasks(department);
CREATE INDEX idx_production_tasks_phase ON production_tasks(phase);
CREATE INDEX idx_production_tasks_due_date ON production_tasks(due_date);

-- Production Milestones
CREATE TABLE production_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    phase production_phase NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Ownership
    owner_id UUID REFERENCES profiles(id),
    approver_ids UUID[] DEFAULT '{}',
    
    -- Deliverables
    deliverables JSONB DEFAULT '[]',
    
    -- Schedule
    due_date DATE NOT NULL,
    completed_at TIMESTAMPTZ,
    
    -- Flags
    is_critical_path BOOLEAN DEFAULT false,
    client_facing BOOLEAN DEFAULT false,
    
    -- Status
    status milestone_status NOT NULL DEFAULT 'pending',
    
    -- Payment
    payment_trigger BOOLEAN DEFAULT false,
    payment_amount NUMERIC(12,2),
    
    -- Relationships
    approval_id UUID REFERENCES approvals(id),
    
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_production_milestones_project ON production_milestones(project_id);
CREATE INDEX idx_production_milestones_due_date ON production_milestones(due_date);
CREATE INDEX idx_production_milestones_status ON production_milestones(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- PROCUREMENT
-- ─────────────────────────────────────────────────────────────────────────────

-- RFQs
CREATE TABLE rfqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    number TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    
    -- Requester
    requested_by_id UUID REFERENCES profiles(id),
    vendor_ids UUID[] DEFAULT '{}',
    
    -- Details
    description TEXT,
    line_items JSONB DEFAULT '[]',
    
    -- Schedule
    issue_date DATE NOT NULL,
    response_deadline DATE NOT NULL,
    required_by_date DATE NOT NULL,
    
    -- Delivery
    delivery_location_id UUID REFERENCES locations(id),
    
    -- Justification
    justification TEXT,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'responses_received', 'awarded', 'cancelled')),
    
    -- Budget
    budget_code TEXT,
    
    -- Responses
    responses JSONB DEFAULT '[]',
    awarded_po_id UUID,
    
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rfqs_project ON rfqs(project_id);
CREATE INDEX idx_rfqs_status ON rfqs(status);

-- Contracts
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    number TEXT NOT NULL,
    title TEXT NOT NULL,
    type contract_type NOT NULL DEFAULT 'vendor',
    
    -- Counterparty
    counterparty_name TEXT NOT NULL,
    signatory_id UUID REFERENCES profiles(id),
    
    -- Details
    description TEXT,
    scope TEXT,
    
    -- Schedule
    effective_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    signed_at TIMESTAMPTZ,
    
    -- Value
    value NUMERIC(12,2),
    
    -- Status
    status contract_status NOT NULL DEFAULT 'draft',
    
    -- Terms
    auto_renew BOOLEAN DEFAULT false,
    termination_clause TEXT,
    
    -- Document
    document_url TEXT,
    amendment_ids UUID[] DEFAULT '{}',
    
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contracts_project ON contracts(project_id);
CREATE INDEX idx_contracts_vendor ON contracts(vendor_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_expiration ON contracts(expiration_date);

-- ─────────────────────────────────────────────────────────────────────────────
-- SCHEDULE
-- ─────────────────────────────────────────────────────────────────────────────

-- Schedule Entries
CREATE TABLE schedule_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('task', 'event', 'shift', 'milestone', 'travel', 'meeting', 'deadline')),
    reference_id UUID NOT NULL,
    reference_name TEXT NOT NULL,
    
    -- Assignment
    assignee_ids UUID[] DEFAULT '{}',
    
    -- Details
    title TEXT NOT NULL,
    description TEXT,
    
    -- Schedule
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    all_day BOOLEAN DEFAULT false,
    timezone TEXT DEFAULT 'America/New_York',
    
    -- Location
    location_id UUID REFERENCES locations(id),
    location_name TEXT,
    
    -- Priority
    priority task_priority DEFAULT 'medium',
    
    -- Status
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    color TEXT,
    
    -- Recurrence
    recurrence JSONB,
    reminder_minutes INTEGER[] DEFAULT '{}',
    
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_schedule_entries_project ON schedule_entries(project_id);
CREATE INDEX idx_schedule_entries_start ON schedule_entries(start_datetime);
CREATE INDEX idx_schedule_entries_type ON schedule_entries(type);

-- Crew Shifts
CREATE TABLE crew_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    location_id UUID NOT NULL REFERENCES locations(id),
    
    -- Crew
    crew_member_id UUID NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
    supervisor_id UUID REFERENCES profiles(id),
    
    -- Role
    role TEXT NOT NULL,
    department department NOT NULL DEFAULT 'production',
    duties TEXT[] DEFAULT '{}',
    
    -- Schedule
    date DATE NOT NULL,
    call_time TIME NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    wrap_time TIME,
    break_minutes INTEGER DEFAULT 30,
    
    -- Location
    reporting_location TEXT,
    
    -- Notes
    notes TEXT,
    
    -- Status
    status shift_status NOT NULL DEFAULT 'scheduled',
    
    -- Rates
    hourly_rate NUMERIC(10,2) NOT NULL,
    overtime_rate NUMERIC(10,2),
    
    -- Benefits
    meal_provided BOOLEAN DEFAULT false,
    travel_reimbursement BOOLEAN DEFAULT false,
    
    -- Time Entry
    time_entry_id UUID,
    
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_crew_shifts_project ON crew_shifts(project_id);
CREATE INDEX idx_crew_shifts_crew_member ON crew_shifts(crew_member_id);
CREATE INDEX idx_crew_shifts_date ON crew_shifts(date);
CREATE INDEX idx_crew_shifts_status ON crew_shifts(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- PERSONNEL
-- ─────────────────────────────────────────────────────────────────────────────

-- Extend crew_members table with additional fields
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS employee_id TEXT;
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS preferred_name TEXT;
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS emergency_contact JSONB;
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS primary_role TEXT;
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS secondary_roles TEXT[] DEFAULT '{}';
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS department department;
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS hire_date DATE;
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS termination_date DATE;
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS home_base TEXT;
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS willing_to_travel BOOLEAN DEFAULT true;
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS travel_radius INTEGER;
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS employment_type employment_type DEFAULT 'contractor';
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS overtime_rate NUMERIC(10,2);
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS day_rate NUMERIC(10,2);
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS union_member BOOLEAN DEFAULT false;
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS union_local TEXT;
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS background_check_date DATE;
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS drug_test_date DATE;
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS supervisor_id UUID REFERENCES profiles(id);

-- Project Assignments
CREATE TABLE project_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    crew_member_id UUID NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    department department NOT NULL DEFAULT 'production',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status assignment_status NOT NULL DEFAULT 'pending',
    rate NUMERIC(10,2) NOT NULL,
    rate_type rate_type NOT NULL DEFAULT 'hourly',
    estimated_hours NUMERIC(8,2),
    actual_hours NUMERIC(8,2) DEFAULT 0,
    
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(project_id, crew_member_id, role)
);

CREATE INDEX idx_project_assignments_project ON project_assignments(project_id);
CREATE INDEX idx_project_assignments_crew ON project_assignments(crew_member_id);
CREATE INDEX idx_project_assignments_status ON project_assignments(status);

-- Availability
CREATE TABLE crew_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crew_member_id UUID NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status availability_status NOT NULL DEFAULT 'available',
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    notes TEXT,
    
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(crew_member_id, date)
);

CREATE INDEX idx_crew_availability_crew ON crew_availability(crew_member_id);
CREATE INDEX idx_crew_availability_date ON crew_availability(date);
CREATE INDEX idx_crew_availability_status ON crew_availability(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- INVENTORY
-- ─────────────────────────────────────────────────────────────────────────────

-- Extend assets table
ALTER TABLE assets ADD COLUMN IF NOT EXISTS serial_number TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES profiles(id);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS current_custodian_id UUID REFERENCES profiles(id);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES vendors(id);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS manufacturer TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}';
ALTER TABLE assets ADD COLUMN IF NOT EXISTS warranty_expiry DATE;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS last_maintenance_date DATE;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS next_maintenance_date DATE;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS home_location_id UUID;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS current_location_id UUID;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS current_value NUMERIC(12,2);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS insurance_value NUMERIC(12,2);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS requires_certification BOOLEAN DEFAULT false;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS certification_types TEXT[] DEFAULT '{}';
ALTER TABLE assets ADD COLUMN IF NOT EXISTS maintenance_schedule TEXT;

-- Asset Assignments
CREATE TABLE asset_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    activation_id UUID REFERENCES activations(id) ON DELETE SET NULL,
    status asset_assignment_status NOT NULL DEFAULT 'reserved',
    check_out_date DATE NOT NULL,
    expected_return_date DATE NOT NULL,
    actual_return_date DATE,
    checked_out_by_id UUID REFERENCES profiles(id),
    returned_by_id UUID REFERENCES profiles(id),
    condition_on_checkout asset_condition NOT NULL,
    condition_on_return asset_condition,
    notes TEXT,
    
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_asset_assignments_asset ON asset_assignments(asset_id);
CREATE INDEX idx_asset_assignments_project ON asset_assignments(project_id);
CREATE INDEX idx_asset_assignments_status ON asset_assignments(status);

-- Maintenance Records
CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('inspection', 'repair', 'calibration', 'cleaning', 'upgrade')),
    description TEXT NOT NULL,
    performed_by_id UUID REFERENCES profiles(id),
    vendor_id UUID REFERENCES vendors(id),
    cost NUMERIC(10,2),
    date DATE NOT NULL,
    next_due_date DATE,
    notes TEXT,
    
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_maintenance_records_asset ON maintenance_records(asset_id);
CREATE INDEX idx_maintenance_records_date ON maintenance_records(date);

-- Consumables
CREATE TABLE consumables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    unit TEXT NOT NULL,
    quantity_on_hand NUMERIC(10,2) NOT NULL DEFAULT 0,
    reorder_point NUMERIC(10,2) NOT NULL DEFAULT 0,
    reorder_quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
    unit_cost NUMERIC(10,2) NOT NULL,
    preferred_vendor_id UUID REFERENCES vendors(id),
    location_id UUID REFERENCES locations(id),
    
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_consumables_category ON consumables(category);
CREATE INDEX idx_consumables_sku ON consumables(sku);

-- Consumable Usage
CREATE TABLE consumable_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consumable_id UUID NOT NULL REFERENCES consumables(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    quantity NUMERIC(10,2) NOT NULL,
    used_by_id UUID REFERENCES profiles(id),
    date DATE NOT NULL,
    notes TEXT,
    
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_consumable_usage_consumable ON consumable_usage(consumable_id);
CREATE INDEX idx_consumable_usage_project ON consumable_usage(project_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- LOGISTICS
-- ─────────────────────────────────────────────────────────────────────────────

-- Shipments
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    number TEXT NOT NULL UNIQUE,
    type shipment_type NOT NULL DEFAULT 'outbound',
    
    -- Carrier
    carrier_id UUID REFERENCES vendors(id),
    carrier_name TEXT NOT NULL,
    driver_id UUID REFERENCES crew_members(id),
    coordinator_id UUID REFERENCES profiles(id),
    
    -- Details
    description TEXT,
    items JSONB DEFAULT '[]',
    total_weight NUMERIC(10,2),
    weight_unit TEXT DEFAULT 'lbs',
    total_pieces INTEGER,
    
    -- Schedule
    pickup_date DATE NOT NULL,
    pickup_time TIME,
    estimated_delivery_date DATE NOT NULL,
    actual_delivery_date DATE,
    
    -- Origin
    origin_location_id UUID REFERENCES locations(id),
    origin_address JSONB,
    
    -- Destination
    destination_location_id UUID REFERENCES locations(id),
    destination_address JSONB,
    
    -- Priority
    priority shipment_priority NOT NULL DEFAULT 'standard',
    
    -- Status
    status shipment_status NOT NULL DEFAULT 'planning',
    tracking_number TEXT,
    cost NUMERIC(10,2),
    
    -- Instructions
    special_instructions TEXT,
    liftgate_required BOOLEAN DEFAULT false,
    inside_delivery BOOLEAN DEFAULT false,
    appointment_required BOOLEAN DEFAULT false,
    
    -- Relationships
    purchase_order_id UUID REFERENCES purchase_orders(id),
    vehicle_id UUID REFERENCES vehicles(id),
    
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shipments_project ON shipments(project_id);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_pickup_date ON shipments(pickup_date);

-- Warehouses
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'primary' CHECK (type IN ('primary', 'satellite', 'staging', 'vendor')),
    
    -- Manager
    manager_id UUID REFERENCES profiles(id),
    
    -- Size
    total_square_footage INTEGER,
    usable_square_footage INTEGER,
    zones JSONB DEFAULT '[]',
    
    -- Address
    address_street1 TEXT,
    address_street2 TEXT,
    address_city TEXT,
    address_state TEXT,
    address_postal_code TEXT,
    address_country TEXT DEFAULT 'USA',
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    
    -- Features
    climate_controlled BOOLEAN DEFAULT false,
    security_level TEXT DEFAULT 'standard' CHECK (security_level IN ('standard', 'high', 'restricted')),
    
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_warehouses_status ON warehouses(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- FINANCE
-- ─────────────────────────────────────────────────────────────────────────────

-- Budgets
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    status budget_status NOT NULL DEFAULT 'draft',
    
    -- Prepared
    prepared_by_id UUID REFERENCES profiles(id),
    approved_by_id UUID REFERENCES profiles(id),
    
    -- Schedule
    effective_date DATE NOT NULL,
    
    -- Notes
    notes TEXT,
    
    -- Totals
    total_budget NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_actual NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_variance NUMERIC(14,2) GENERATED ALWAYS AS (total_actual - total_budget) STORED,
    currency TEXT DEFAULT 'USD',
    
    -- Rates
    contingency_percent NUMERIC(5,2) DEFAULT 10,
    markup_percent NUMERIC(5,2) DEFAULT 0,
    
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(project_id, version)
);

CREATE INDEX idx_budgets_project ON budgets(project_id);
CREATE INDEX idx_budgets_status ON budgets(status);

-- Budget Line Items (production version)
CREATE TABLE production_budget_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    category budget_category NOT NULL,
    subcategory TEXT,
    description TEXT NOT NULL,
    phase production_phase NOT NULL DEFAULT 'pre_production',
    
    -- Vendor
    vendor_id UUID REFERENCES vendors(id),
    
    -- Quantities
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit TEXT DEFAULT 'ea',
    unit_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    
    -- Amounts
    budgeted_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    actual_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    committed_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    variance NUMERIC(12,2) GENERATED ALWAYS AS (actual_amount - budgeted_amount) STORED,
    
    -- Notes
    notes TEXT,
    
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_production_budget_lines_budget ON production_budget_lines(budget_id);
CREATE INDEX idx_production_budget_lines_category ON production_budget_lines(category);

-- Production Expenses
CREATE TABLE production_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    budget_line_id UUID REFERENCES production_budget_lines(id),
    
    -- Submitter
    submitted_by_id UUID REFERENCES profiles(id),
    approved_by_id UUID REFERENCES profiles(id),
    vendor_id UUID REFERENCES vendors(id),
    
    -- Details
    description TEXT NOT NULL,
    category budget_category NOT NULL,
    
    -- Dates
    expense_date DATE NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    
    -- Justification
    justification TEXT,
    
    -- Amount
    amount NUMERIC(12,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status expense_status NOT NULL DEFAULT 'draft',
    payment_method payment_method,
    
    -- Receipt
    receipt_url TEXT,
    reimbursable BOOLEAN DEFAULT false,
    
    -- Relationships
    purchase_order_id UUID REFERENCES purchase_orders(id),
    invoice_id UUID REFERENCES invoices(id),
    
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_production_expenses_project ON production_expenses(project_id);
CREATE INDEX idx_production_expenses_status ON production_expenses(status);
CREATE INDEX idx_production_expenses_date ON production_expenses(expense_date);

-- Production Time Entries
CREATE TABLE production_time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    crew_member_id UUID NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
    shift_id UUID REFERENCES crew_shifts(id),
    
    -- Approver
    approved_by_id UUID REFERENCES profiles(id),
    
    -- Description
    description TEXT,
    
    -- Time
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_minutes INTEGER DEFAULT 0,
    regular_hours NUMERIC(5,2) NOT NULL DEFAULT 0,
    overtime_hours NUMERIC(5,2) NOT NULL DEFAULT 0,
    double_time_hours NUMERIC(5,2) NOT NULL DEFAULT 0,
    
    -- Task
    task_id UUID REFERENCES production_tasks(id),
    
    -- Status
    status time_entry_status NOT NULL DEFAULT 'draft',
    
    -- Rates
    regular_rate NUMERIC(10,2) NOT NULL,
    overtime_rate NUMERIC(10,2),
    double_time_rate NUMERIC(10,2),
    total_pay NUMERIC(12,2) GENERATED ALWAYS AS (
        (regular_hours * regular_rate) + 
        (overtime_hours * COALESCE(overtime_rate, regular_rate * 1.5)) + 
        (double_time_hours * COALESCE(double_time_rate, regular_rate * 2))
    ) STORED,
    
    -- Notes
    notes TEXT,
    
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_production_time_entries_project ON production_time_entries(project_id);
CREATE INDEX idx_production_time_entries_crew ON production_time_entries(crew_member_id);
CREATE INDEX idx_production_time_entries_date ON production_time_entries(date);
CREATE INDEX idx_production_time_entries_status ON production_time_entries(status);

-- Payroll Batches
CREATE TABLE payroll_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status payroll_status NOT NULL DEFAULT 'draft',
    total_gross NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_deductions NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_net NUMERIC(14,2) NOT NULL DEFAULT 0,
    time_entry_ids UUID[] DEFAULT '{}',
    processed_at TIMESTAMPTZ,
    
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payroll_batches_status ON payroll_batches(status);
CREATE INDEX idx_payroll_batches_period ON payroll_batches(period_start, period_end);

-- ─────────────────────────────────────────────────────────────────────────────
-- INCIDENTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    number TEXT NOT NULL UNIQUE,
    type incident_type NOT NULL,
    
    -- Reporter
    reported_by_id UUID REFERENCES profiles(id),
    involved_party_ids UUID[] DEFAULT '{}',
    witness_ids UUID[] DEFAULT '{}',
    assigned_to_id UUID REFERENCES profiles(id),
    
    -- Details
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    immediate_actions TEXT,
    
    -- Timing
    occurred_at TIMESTAMPTZ NOT NULL,
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    
    -- Location
    location_id UUID REFERENCES locations(id),
    specific_location TEXT,
    
    -- Severity
    severity incident_severity NOT NULL DEFAULT 'minor',
    root_cause TEXT,
    
    -- Status
    status incident_status NOT NULL DEFAULT 'reported',
    resolution TEXT,
    preventive_measures TEXT,
    
    -- Insurance
    insurance_claim BOOLEAN DEFAULT false,
    claim_number TEXT,
    estimated_cost NUMERIC(12,2),
    actual_cost NUMERIC(12,2),
    
    -- Attachments
    attachment_ids UUID[] DEFAULT '{}',
    follow_up_task_ids UUID[] DEFAULT '{}',
    
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_incidents_project ON incidents(project_id);
CREATE INDEX idx_incidents_type ON incidents(type);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_occurred ON incidents(occurred_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- KNOWLEDGE BASE
-- ─────────────────────────────────────────────────────────────────────────────

-- Knowledge Base Articles
CREATE TABLE knowledge_base_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category document_category NOT NULL,
    department department,
    
    -- Author
    author_id UUID REFERENCES profiles(id),
    reviewer_ids UUID[] DEFAULT '{}',
    
    -- Content
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    
    -- Dates
    published_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    next_review_date DATE,
    
    -- Purpose
    purpose TEXT,
    
    -- Status
    status document_status NOT NULL DEFAULT 'draft',
    version INTEGER NOT NULL DEFAULT 1,
    
    -- Acknowledgment
    requires_acknowledgment BOOLEAN DEFAULT false,
    acknowledgment_ids UUID[] DEFAULT '{}',
    
    -- Relationships
    related_article_ids UUID[] DEFAULT '{}',
    attachment_ids UUID[] DEFAULT '{}',
    
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kb_articles_category ON knowledge_base_articles(category);
CREATE INDEX idx_kb_articles_department ON knowledge_base_articles(department);
CREATE INDEX idx_kb_articles_status ON knowledge_base_articles(status);

-- SOPs
CREATE TABLE production_sops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number TEXT NOT NULL UNIQUE,
    department department NOT NULL,
    
    -- Owner
    owner_id UUID REFERENCES profiles(id),
    applicable_roles TEXT[] DEFAULT '{}',
    
    -- Content
    title TEXT NOT NULL,
    purpose TEXT,
    scope TEXT,
    steps JSONB DEFAULT '[]',
    
    -- Dates
    effective_date DATE NOT NULL,
    review_date DATE NOT NULL,
    
    -- Flags
    safety_related BOOLEAN DEFAULT false,
    
    -- Status
    status sop_status NOT NULL DEFAULT 'draft',
    version INTEGER NOT NULL DEFAULT 1,
    
    -- Training
    requires_training BOOLEAN DEFAULT false,
    training_material_ids UUID[] DEFAULT '{}',
    
    -- Relationships
    related_sop_ids UUID[] DEFAULT '{}',
    form_ids UUID[] DEFAULT '{}',
    
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_production_sops_department ON production_sops(department);
CREATE INDEX idx_production_sops_status ON production_sops(status);

-- Checklists
CREATE TABLE production_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    
    -- Assignment
    assigned_to_id UUID REFERENCES profiles(id),
    completed_by_id UUID REFERENCES profiles(id),
    
    -- Content
    title TEXT NOT NULL,
    items JSONB DEFAULT '[]',
    
    -- Dates
    due_date DATE,
    completed_at TIMESTAMPTZ,
    
    -- Type
    type checklist_type NOT NULL DEFAULT 'custom',
    
    -- Status
    status checklist_status NOT NULL DEFAULT 'pending',
    completion_percent INTEGER DEFAULT 0 CHECK (completion_percent >= 0 AND completion_percent <= 100),
    
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_production_checklists_project ON production_checklists(project_id);
CREATE INDEX idx_production_checklists_status ON production_checklists(status);
CREATE INDEX idx_production_checklists_type ON production_checklists(type);

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumables ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumable_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_budget_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_sops ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_checklists ENABLE ROW LEVEL SECURITY;

-- Standard org-based policies for all tables
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'locations', 'activations', 'events', 'activities',
        'production_tasks', 'production_milestones', 'rfqs', 'contracts',
        'schedule_entries', 'crew_shifts', 'project_assignments', 'crew_availability',
        'asset_assignments', 'maintenance_records', 'consumables', 'consumable_usage',
        'shipments', 'warehouses', 'budgets', 'production_budget_lines',
        'production_expenses', 'production_time_entries', 'payroll_batches',
        'incidents', 'knowledge_base_articles', 'production_sops', 'production_checklists'
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
-- TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

-- Add updated_at triggers to all new tables
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'locations', 'activations', 'events', 'activities',
        'production_tasks', 'production_milestones', 'rfqs', 'contracts',
        'schedule_entries', 'crew_shifts', 'project_assignments', 'crew_availability',
        'asset_assignments', 'consumables', 'shipments', 'warehouses',
        'budgets', 'production_budget_lines', 'production_expenses',
        'production_time_entries', 'payroll_batches', 'incidents',
        'knowledge_base_articles', 'production_sops', 'production_checklists'
    ])
    LOOP
        EXECUTE format('
            CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ', tbl, tbl);
    END LOOP;
END $$;
