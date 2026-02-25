-- ─────────────────────────────────────────────────────────────────────────────
-- MIGRATION 016: Live Event / Show / Activation Operations
-- ─────────────────────────────────────────────────────────────────────────────
-- Scope: Live-phase operational lifecycle — load-in through strike
-- Dependencies: 003 (production_lifecycle), 011 (unified_workforce), 012 (consolidation)
-- Architecture: docs/LIVE_EVENT_OPERATIONS_ARCHITECTURE.md
-- ─────────────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TYPE live_event_phase AS ENUM (
    'advance', 'load_in', 'setup', 'rehearsal', 'ready', 'live', 'hold', 'strike', 'wrapped'
);

CREATE TYPE command_layer AS ENUM ('command', 'tactical', 'operations');

CREATE TYPE command_position_type AS ENUM (
    -- L1 Command
    'event_commander', 'safety_officer', 'financial_officer', 'client_liaison',
    -- L2 Tactical
    'stage_manager', 'technical_director', 'logistics_lead', 'foh_manager', 'production_coordinator',
    -- L3 Operations
    'audio_lead', 'lighting_lead', 'video_lead', 'rigging_lead', 'stage_lead',
    'crew_lead', 'security_lead', 'medical_lead', 'catering_lead', 'custom'
);

CREATE TYPE department_live_status AS ENUM (
    'not_checked_in', 'setting_up', 'ready', 'active', 'issue', 'blocked', 'striking', 'wrapped'
);

CREATE TYPE readiness_gate_status AS ENUM (
    'not_started', 'in_progress', 'passed', 'failed', 'waived'
);

CREATE TYPE ros_cue_status AS ENUM (
    'pending', 'standby', 'called', 'in_progress', 'completed', 'skipped', 'held'
);

CREATE TYPE comm_channel_priority AS ENUM ('emergency', 'critical', 'high', 'medium', 'low');

CREATE TYPE equipment_live_status AS ENUM (
    'checked_in', 'deployed', 'standby', 'issue_reported', 'failed',
    'being_repaired', 'struck', 'loaded_out'
);

CREATE TYPE foh_zone_type AS ENUM (
    'entry', 'general', 'vip', 'stage', 'fb', 'merch',
    'amenity', 'medical', 'parking', 'accessibility'
);

CREATE TYPE vip_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');

CREATE TYPE vip_status AS ENUM ('expected', 'arrived', 'in_venue', 'departed');

CREATE TYPE guest_incident_type AS ENUM (
    'complaint', 'injury', 'lost_item', 'accessibility', 'disturbance', 'ejection'
);

CREATE TYPE guest_incident_severity AS ENUM ('minor', 'moderate', 'major');

CREATE TYPE strike_direction AS ENUM ('load_in', 'strike');

CREATE TYPE strike_step_status AS ENUM (
    'pending', 'in_progress', 'completed', 'blocked', 'skipped'
);

CREATE TYPE asset_return_condition AS ENUM (
    'excellent', 'good', 'fair', 'damaged', 'missing'
);

CREATE TYPE reconciliation_status AS ENUM (
    'pending', 'reconciled', 'discrepancy', 'write_off'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- CORE: Live Event Instances
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE live_event_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL UNIQUE REFERENCES events(id) ON DELETE CASCADE,
    activation_id UUID REFERENCES activations(id) ON DELETE SET NULL,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- State Machine
    phase live_event_phase NOT NULL DEFAULT 'advance',
    phase_changed_at TIMESTAMPTZ DEFAULT NOW(),
    phase_changed_by UUID REFERENCES profiles(id),

    -- Operational Window
    scheduled_load_in TIMESTAMPTZ,
    actual_load_in TIMESTAMPTZ,
    scheduled_doors TIMESTAMPTZ,
    actual_doors TIMESTAMPTZ,
    scheduled_show_start TIMESTAMPTZ,
    actual_show_start TIMESTAMPTZ,
    scheduled_show_end TIMESTAMPTZ,
    actual_show_end TIMESTAMPTZ,
    scheduled_strike_complete TIMESTAMPTZ,
    actual_strike_complete TIMESTAMPTZ,

    -- Capacity
    venue_capacity INTEGER,
    permitted_capacity INTEGER,
    current_attendance INTEGER DEFAULT 0,

    -- Risk
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level TEXT GENERATED ALWAYS AS (
        CASE
            WHEN risk_score <= 25 THEN 'low'
            WHEN risk_score <= 50 THEN 'moderate'
            WHEN risk_score <= 75 THEN 'high'
            ELSE 'critical'
        END
    ) STORED,

    -- Weather
    weather_status TEXT DEFAULT 'clear',
    weather_alert_level TEXT DEFAULT 'none',

    -- Notes
    notes TEXT,

    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_live_events_event ON live_event_instances(event_id);
CREATE INDEX idx_live_events_project ON live_event_instances(project_id);
CREATE INDEX idx_live_events_phase ON live_event_instances(phase);
CREATE INDEX idx_live_events_risk ON live_event_instances(risk_score);
CREATE INDEX idx_live_events_org ON live_event_instances(organization_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- COMMAND & CONTROL
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE command_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_event_id UUID NOT NULL REFERENCES live_event_instances(id) ON DELETE CASCADE,
    position_type command_position_type NOT NULL,
    layer command_layer NOT NULL,
    profile_id UUID NOT NULL REFERENCES profiles(id),

    -- Radio
    radio_callsign TEXT,
    primary_channel_id UUID,

    -- Contact
    mobile_number TEXT,

    -- Status
    is_active BOOLEAN DEFAULT true,
    checked_in_at TIMESTAMPTZ,
    checked_out_at TIMESTAMPTZ,

    -- Custom position label (for 'custom' type)
    custom_label TEXT,

    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(live_event_id, position_type, profile_id)
);

CREATE INDEX idx_command_positions_event ON command_positions(live_event_id);
CREATE INDEX idx_command_positions_profile ON command_positions(profile_id);
CREATE INDEX idx_command_positions_layer ON command_positions(layer);

-- ─────────────────────────────────────────────────────────────────────────────
-- READINESS GATES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE readiness_gates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_event_id UUID NOT NULL REFERENCES live_event_instances(id) ON DELETE CASCADE,
    gate_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,

    -- Verification
    verifier_role command_position_type NOT NULL,
    verified_by_id UUID REFERENCES profiles(id),
    verified_at TIMESTAMPTZ,

    -- Status
    status readiness_gate_status NOT NULL DEFAULT 'not_started',
    is_blocking BOOLEAN DEFAULT true,

    -- Evidence
    evidence_notes TEXT,
    evidence_urls TEXT[] DEFAULT '{}',

    -- Linked compliance
    permit_ids UUID[] DEFAULT '{}',
    checklist_ids UUID[] DEFAULT '{}',

    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(live_event_id, gate_number)
);

CREATE INDEX idx_readiness_gates_event ON readiness_gates(live_event_id);
CREATE INDEX idx_readiness_gates_status ON readiness_gates(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- DEPARTMENT STATUS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE department_statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_event_id UUID NOT NULL REFERENCES live_event_instances(id) ON DELETE CASCADE,
    department department NOT NULL,
    department_lead_id UUID REFERENCES profiles(id),

    -- Status
    status department_live_status NOT NULL DEFAULT 'not_checked_in',
    status_changed_at TIMESTAMPTZ DEFAULT NOW(),

    -- Details
    crew_count INTEGER DEFAULT 0,
    crew_checked_in INTEGER DEFAULT 0,
    notes TEXT,
    issues TEXT,

    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(live_event_id, department)
);

CREATE INDEX idx_dept_statuses_event ON department_statuses(live_event_id);
CREATE INDEX idx_dept_statuses_status ON department_statuses(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- RUN OF SHOW (Normalized cues)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE ros_cues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_event_id UUID NOT NULL REFERENCES live_event_instances(id) ON DELETE CASCADE,
    sequence INTEGER NOT NULL,
    cue_number TEXT NOT NULL,

    -- Timing
    scheduled_time TIMESTAMPTZ,
    actual_time TIMESTAMPTZ,
    duration_seconds INTEGER,
    actual_duration_seconds INTEGER,

    -- Content
    title TEXT NOT NULL,
    description TEXT,
    department department,
    responsible_id UUID REFERENCES profiles(id),

    -- Execution
    status ros_cue_status NOT NULL DEFAULT 'pending',
    called_by_id UUID REFERENCES profiles(id),
    called_at TIMESTAMPTZ,

    -- Flags
    is_critical BOOLEAN DEFAULT false,
    dependencies UUID[] DEFAULT '{}',
    notes TEXT,

    -- Computed variance
    variance_seconds INTEGER GENERATED ALWAYS AS (
        CASE
            WHEN actual_time IS NOT NULL AND scheduled_time IS NOT NULL
            THEN EXTRACT(EPOCH FROM (actual_time - scheduled_time))::INTEGER
            ELSE NULL
        END
    ) STORED,

    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(live_event_id, sequence)
);

CREATE INDEX idx_ros_cues_event ON ros_cues(live_event_id);
CREATE INDEX idx_ros_cues_status ON ros_cues(status);
CREATE INDEX idx_ros_cues_sequence ON ros_cues(live_event_id, sequence);

-- ─────────────────────────────────────────────────────────────────────────────
-- COMMUNICATION CHANNELS & LOG
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE comm_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_event_id UUID NOT NULL REFERENCES live_event_instances(id) ON DELETE CASCADE,
    channel_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    priority comm_channel_priority NOT NULL DEFAULT 'medium',
    assignment TEXT NOT NULL,
    discipline TEXT,
    is_restricted BOOLEAN DEFAULT false,

    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(live_event_id, channel_number)
);

CREATE INDEX idx_comm_channels_event ON comm_channels(live_event_id);

CREATE TABLE comm_log_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_event_id UUID NOT NULL REFERENCES live_event_instances(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES comm_channels(id) ON DELETE SET NULL,
    sender_id UUID REFERENCES profiles(id),

    -- Content
    message TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'general',

    -- Timing
    logged_at TIMESTAMPTZ DEFAULT NOW(),

    -- Linking
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    cue_id UUID REFERENCES ros_cues(id) ON DELETE SET NULL,

    -- Priority
    is_decision BOOLEAN DEFAULT false,
    is_escalation BOOLEAN DEFAULT false,

    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comm_log_event ON comm_log_entries(live_event_id);
CREATE INDEX idx_comm_log_channel ON comm_log_entries(channel_id);
CREATE INDEX idx_comm_log_time ON comm_log_entries(logged_at);
CREATE INDEX idx_comm_log_incident ON comm_log_entries(incident_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- LIVE CREW ASSIGNMENTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE live_crew_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_event_id UUID NOT NULL REFERENCES live_event_instances(id) ON DELETE CASCADE,
    crew_member_id UUID NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
    shift_id UUID REFERENCES crew_shifts(id) ON DELETE SET NULL,

    -- Assignment
    department department,
    zone TEXT,
    role_description TEXT,

    -- Status
    checked_in_at TIMESTAMPTZ,
    checked_out_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT false,

    -- Credentials verified
    credentials_verified BOOLEAN DEFAULT false,
    credentials_verified_by UUID REFERENCES profiles(id),

    -- Radio
    radio_channel_id UUID REFERENCES comm_channels(id) ON DELETE SET NULL,
    radio_callsign TEXT,

    -- Hours tracking
    break_start TIMESTAMPTZ,
    break_end TIMESTAMPTZ,
    total_break_minutes INTEGER DEFAULT 0,
    hours_worked NUMERIC(5,2) DEFAULT 0,
    overtime_flagged BOOLEAN DEFAULT false,

    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(live_event_id, crew_member_id)
);

CREATE INDEX idx_live_crew_event ON live_crew_assignments(live_event_id);
CREATE INDEX idx_live_crew_member ON live_crew_assignments(crew_member_id);
CREATE INDEX idx_live_crew_dept ON live_crew_assignments(department);
CREATE INDEX idx_live_crew_active ON live_crew_assignments(is_active);

-- ─────────────────────────────────────────────────────────────────────────────
-- EQUIPMENT CHECK-INS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE equipment_check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_event_id UUID NOT NULL REFERENCES live_event_instances(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    asset_assignment_id UUID REFERENCES asset_assignments(id) ON DELETE SET NULL,

    -- Check-in
    checked_in_at TIMESTAMPTZ DEFAULT NOW(),
    checked_in_by UUID REFERENCES profiles(id),
    condition_on_arrival asset_return_condition NOT NULL DEFAULT 'good',
    condition_notes TEXT,
    condition_photos TEXT[] DEFAULT '{}',

    -- Deployment
    status equipment_live_status NOT NULL DEFAULT 'checked_in',
    deployed_location TEXT,
    department department,

    -- Check-out
    checked_out_at TIMESTAMPTZ,
    checked_out_by UUID REFERENCES profiles(id),
    condition_on_departure asset_return_condition,
    departure_notes TEXT,
    departure_photos TEXT[] DEFAULT '{}',

    -- Quantity (for bulk items)
    expected_quantity INTEGER DEFAULT 1,
    received_quantity INTEGER DEFAULT 1,
    returned_quantity INTEGER,

    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_equip_checkin_event ON equipment_check_ins(live_event_id);
CREATE INDEX idx_equip_checkin_asset ON equipment_check_ins(asset_id);
CREATE INDEX idx_equip_checkin_status ON equipment_check_ins(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- ENVIRONMENTAL READINGS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE environmental_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_event_id UUID NOT NULL REFERENCES live_event_instances(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    recorded_by UUID REFERENCES profiles(id),

    -- Weather
    temperature_f NUMERIC(5,1),
    humidity_percent INTEGER,
    wind_speed_mph NUMERIC(5,1),
    wind_gusts_mph NUMERIC(5,1),
    precipitation TEXT,
    visibility TEXT,
    weather_alert TEXT,
    weather_alert_source TEXT,

    -- Noise
    noise_level_db NUMERIC(5,1),
    noise_location TEXT,

    -- Power
    total_power_load_amps NUMERIC(8,1),
    power_capacity_amps NUMERIC(8,1),
    generator_fuel_percent INTEGER,

    -- Notes
    notes TEXT,

    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_env_readings_event ON environmental_readings(live_event_id);
CREATE INDEX idx_env_readings_time ON environmental_readings(recorded_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- LIVE FINANCIAL SNAPSHOTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE live_financial_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_event_id UUID NOT NULL REFERENCES live_event_instances(id) ON DELETE CASCADE,
    snapshot_time TIMESTAMPTZ DEFAULT NOW(),
    captured_by UUID REFERENCES profiles(id),

    -- Budget
    budget_total NUMERIC(14,2) NOT NULL DEFAULT 0,
    spent_to_date NUMERIC(14,2) NOT NULL DEFAULT 0,
    committed_not_spent NUMERIC(14,2) NOT NULL DEFAULT 0,

    -- Labor breakdown
    labor_regular NUMERIC(12,2) DEFAULT 0,
    labor_overtime NUMERIC(12,2) DEFAULT 0,
    labor_double_time NUMERIC(12,2) DEFAULT 0,

    -- Cost categories
    equipment_cost NUMERIC(12,2) DEFAULT 0,
    vendor_cost NUMERIC(12,2) DEFAULT 0,
    onsite_procurement NUMERIC(12,2) DEFAULT 0,

    -- Revenue (if applicable)
    revenue_tickets NUMERIC(12,2) DEFAULT 0,
    revenue_fb NUMERIC(12,2) DEFAULT 0,
    revenue_merch NUMERIC(12,2) DEFAULT 0,
    revenue_other NUMERIC(12,2) DEFAULT 0,

    -- Computed
    margin_percent NUMERIC(5,2),
    burn_rate_per_hour NUMERIC(12,2),
    projected_total NUMERIC(14,2),

    -- Alerts
    ot_alert_level TEXT DEFAULT 'none',

    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fin_snapshots_event ON live_financial_snapshots(live_event_id);
CREATE INDEX idx_fin_snapshots_time ON live_financial_snapshots(snapshot_time);

-- ─────────────────────────────────────────────────────────────────────────────
-- FRONT-OF-HOUSE: Zones & Readings
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE foh_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_event_id UUID NOT NULL REFERENCES live_event_instances(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    zone_type foh_zone_type NOT NULL,
    capacity INTEGER,
    location_description TEXT,

    -- Assignment
    zone_lead_id UUID REFERENCES profiles(id),

    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(live_event_id, name)
);

CREATE INDEX idx_foh_zones_event ON foh_zones(live_event_id);
CREATE INDEX idx_foh_zones_type ON foh_zones(zone_type);

CREATE TABLE foh_zone_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id UUID NOT NULL REFERENCES foh_zones(id) ON DELETE CASCADE,
    live_event_id UUID NOT NULL REFERENCES live_event_instances(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    recorded_by UUID REFERENCES profiles(id),

    -- Crowd
    occupancy_count INTEGER DEFAULT 0,
    entry_rate INTEGER DEFAULT 0,
    exit_rate INTEGER DEFAULT 0,
    queue_length INTEGER DEFAULT 0,
    avg_wait_minutes NUMERIC(5,1) DEFAULT 0,

    -- Revenue (F&B/merch zones)
    sales_amount NUMERIC(12,2) DEFAULT 0,
    transactions_count INTEGER DEFAULT 0,

    -- Issues
    incidents_count INTEGER DEFAULT 0,
    notes TEXT,

    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_foh_readings_zone ON foh_zone_readings(zone_id);
CREATE INDEX idx_foh_readings_event ON foh_zone_readings(live_event_id);
CREATE INDEX idx_foh_readings_time ON foh_zone_readings(recorded_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- VIP MANAGEMENT
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE vip_guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_event_id UUID NOT NULL REFERENCES live_event_instances(id) ON DELETE CASCADE,

    -- Guest info
    name TEXT NOT NULL,
    affiliation TEXT,
    tier vip_tier NOT NULL DEFAULT 'bronze',
    contact_email TEXT,
    contact_phone TEXT,

    -- Arrival
    expected_arrival TIMESTAMPTZ,
    actual_arrival TIMESTAMPTZ,

    -- Service
    escort_id UUID REFERENCES profiles(id),
    zone_access TEXT[] DEFAULT '{}',
    dietary_restrictions TEXT,
    special_requests TEXT,

    -- Status
    status vip_status NOT NULL DEFAULT 'expected',
    notes TEXT,

    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vip_guests_event ON vip_guests(live_event_id);
CREATE INDEX idx_vip_guests_status ON vip_guests(status);
CREATE INDEX idx_vip_guests_tier ON vip_guests(tier);

CREATE TABLE vip_service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vip_guest_id UUID NOT NULL REFERENCES vip_guests(id) ON DELETE CASCADE,
    live_event_id UUID NOT NULL REFERENCES live_event_instances(id) ON DELETE CASCADE,

    -- Request
    request_type TEXT NOT NULL,
    description TEXT NOT NULL,
    requested_at TIMESTAMPTZ DEFAULT NOW(),

    -- Assignment
    assigned_to_id UUID REFERENCES profiles(id),

    -- Resolution
    status TEXT NOT NULL DEFAULT 'pending',
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,

    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vip_requests_guest ON vip_service_requests(vip_guest_id);
CREATE INDEX idx_vip_requests_event ON vip_service_requests(live_event_id);
CREATE INDEX idx_vip_requests_status ON vip_service_requests(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- GUEST INCIDENTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE guest_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_event_id UUID NOT NULL REFERENCES live_event_instances(id) ON DELETE CASCADE,
    foh_zone_id UUID REFERENCES foh_zones(id) ON DELETE SET NULL,

    -- Details
    type guest_incident_type NOT NULL,
    severity guest_incident_severity NOT NULL DEFAULT 'minor',
    description TEXT NOT NULL,
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    reported_by UUID REFERENCES profiles(id),

    -- Resolution
    status TEXT NOT NULL DEFAULT 'reported',
    assigned_to_id UUID REFERENCES profiles(id),
    resolution TEXT,
    resolved_at TIMESTAMPTZ,

    -- Escalation
    escalated_to_incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,

    -- Guest info (optional)
    guest_name TEXT,
    guest_contact TEXT,
    compensation_offered TEXT,

    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guest_incidents_event ON guest_incidents(live_event_id);
CREATE INDEX idx_guest_incidents_zone ON guest_incidents(foh_zone_id);
CREATE INDEX idx_guest_incidents_type ON guest_incidents(type);
CREATE INDEX idx_guest_incidents_severity ON guest_incidents(severity);

-- ─────────────────────────────────────────────────────────────────────────────
-- STRIKE SEQUENCES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE strike_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_event_id UUID NOT NULL REFERENCES live_event_instances(id) ON DELETE CASCADE,
    direction strike_direction NOT NULL,
    sequence INTEGER NOT NULL,

    -- Task
    name TEXT NOT NULL,
    description TEXT,
    department department,
    responsible_id UUID REFERENCES profiles(id),

    -- Timing
    estimated_start TIMESTAMPTZ,
    actual_start TIMESTAMPTZ,
    estimated_end TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    estimated_duration_minutes INTEGER,
    actual_duration_minutes INTEGER,

    -- Dependencies
    depends_on_ids UUID[] DEFAULT '{}',

    -- Status
    status strike_step_status NOT NULL DEFAULT 'pending',
    notes TEXT,

    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(live_event_id, direction, sequence)
);

CREATE INDEX idx_strike_seq_event ON strike_sequences(live_event_id);
CREATE INDEX idx_strike_seq_direction ON strike_sequences(direction);
CREATE INDEX idx_strike_seq_status ON strike_sequences(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- ASSET RECONCILIATION
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE asset_reconciliation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_event_id UUID NOT NULL REFERENCES live_event_instances(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    equipment_check_in_id UUID REFERENCES equipment_check_ins(id) ON DELETE SET NULL,

    -- Reconciliation
    condition_on_return asset_return_condition NOT NULL,
    condition_on_arrival asset_return_condition,
    reconciled_by UUID REFERENCES profiles(id),
    reconciled_at TIMESTAMPTZ,

    -- Discrepancy
    status reconciliation_status NOT NULL DEFAULT 'pending',
    quantity_expected INTEGER DEFAULT 1,
    quantity_returned INTEGER,
    quantity_missing INTEGER DEFAULT 0,
    quantity_damaged INTEGER DEFAULT 0,

    -- Damage details
    damage_description TEXT,
    damage_photos TEXT[] DEFAULT '{}',
    estimated_repair_cost NUMERIC(12,2),
    estimated_replacement_cost NUMERIC(12,2),

    -- Links
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    insurance_claim_recommended BOOLEAN DEFAULT false,

    -- Notes
    notes TEXT,

    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_asset_recon_event ON asset_reconciliation_items(live_event_id);
CREATE INDEX idx_asset_recon_asset ON asset_reconciliation_items(asset_id);
CREATE INDEX idx_asset_recon_status ON asset_reconciliation_items(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- POST-EVENT REPORTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE post_event_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_event_id UUID NOT NULL UNIQUE REFERENCES live_event_instances(id) ON DELETE CASCADE,
    compiled_by UUID REFERENCES profiles(id),
    compiled_at TIMESTAMPTZ,

    -- Attendance
    total_attendance INTEGER,
    peak_attendance INTEGER,
    vip_count INTEGER,

    -- Financial
    total_budget NUMERIC(14,2),
    total_spent NUMERIC(14,2),
    total_revenue NUMERIC(14,2),
    final_margin_percent NUMERIC(5,2),

    -- Incidents
    total_incidents INTEGER DEFAULT 0,
    incidents_by_severity JSONB DEFAULT '{}',

    -- Assets
    total_assets_deployed INTEGER DEFAULT 0,
    assets_damaged INTEGER DEFAULT 0,
    assets_missing INTEGER DEFAULT 0,
    total_damage_cost NUMERIC(12,2) DEFAULT 0,

    -- Timeline
    load_in_variance_minutes INTEGER,
    show_start_variance_minutes INTEGER,
    show_end_variance_minutes INTEGER,
    strike_variance_minutes INTEGER,

    -- Vendor performance
    vendor_scores JSONB DEFAULT '{}',

    -- Lessons
    lessons_learned TEXT,
    recommendations TEXT,
    highlights TEXT,
    challenges TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'draft',

    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_post_event_event ON post_event_reports(live_event_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- EXTEND INCIDENTS TABLE FOR LIVE PHASE
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE incidents ADD COLUMN IF NOT EXISTS live_event_id UUID REFERENCES live_event_instances(id) ON DELETE SET NULL;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS event_phase TEXT;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS response_team_ids UUID[] DEFAULT '{}';
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS first_responder_id UUID REFERENCES profiles(id);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS response_time_seconds INTEGER;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS escalation_level INTEGER DEFAULT 1 CHECK (escalation_level >= 1 AND escalation_level <= 4);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS auto_escalated BOOLEAN DEFAULT false;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS environmental_conditions JSONB;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS medical_transport BOOLEAN DEFAULT false;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS transport_destination TEXT;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS osha_reportable BOOLEAN DEFAULT false;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS witness_statements JSONB;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS evidence_urls TEXT[] DEFAULT '{}';
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS insurance_notified BOOLEAN DEFAULT false;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS insurance_notified_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_incidents_live_event ON incidents(live_event_id);
CREATE INDEX IF NOT EXISTS idx_incidents_escalation ON incidents(escalation_level);

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'live_event_instances', 'command_positions', 'readiness_gates',
        'department_statuses', 'ros_cues', 'comm_channels', 'comm_log_entries',
        'live_crew_assignments', 'equipment_check_ins', 'environmental_readings',
        'live_financial_snapshots', 'foh_zones', 'foh_zone_readings',
        'vip_guests', 'vip_service_requests', 'guest_incidents',
        'strike_sequences', 'asset_reconciliation_items', 'post_event_reports'
    ])
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
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

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'live_event_instances', 'command_positions', 'readiness_gates',
        'department_statuses', 'ros_cues', 'comm_channels',
        'live_crew_assignments', 'equipment_check_ins',
        'foh_zones', 'vip_guests', 'vip_service_requests',
        'guest_incidents', 'strike_sequences', 'asset_reconciliation_items',
        'post_event_reports'
    ])
    LOOP
        EXECUTE format('
            CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ', tbl, tbl);
    END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- ACTIVITY LOG TRIGGERS (for audit trail)
-- ─────────────────────────────────────────────────────────────────────────────

-- Phase transition logging
CREATE OR REPLACE FUNCTION log_live_event_phase_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.phase IS DISTINCT FROM NEW.phase THEN
        NEW.phase_changed_at = NOW();
        INSERT INTO activity_log (
            entity_type, entity_id, action, details, performed_by, organization_id
        ) VALUES (
            'live_event_instance', NEW.id, 'phase_changed',
            jsonb_build_object(
                'from', OLD.phase,
                'to', NEW.phase,
                'event_id', NEW.event_id
            ),
            NEW.updated_by,
            NEW.organization_id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_live_event_phase_change
    BEFORE UPDATE ON live_event_instances
    FOR EACH ROW
    EXECUTE FUNCTION log_live_event_phase_change();

-- Incident escalation logging
CREATE OR REPLACE FUNCTION log_incident_escalation()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.escalation_level IS DISTINCT FROM NEW.escalation_level AND NEW.escalation_level IS NOT NULL THEN
        INSERT INTO activity_log (
            entity_type, entity_id, action, details, performed_by, organization_id
        ) VALUES (
            'incident', NEW.id, 'escalation_changed',
            jsonb_build_object(
                'from_level', OLD.escalation_level,
                'to_level', NEW.escalation_level,
                'auto_escalated', NEW.auto_escalated,
                'live_event_id', NEW.live_event_id
            ),
            NEW.updated_by,
            NEW.organization_id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_incident_escalation
    BEFORE UPDATE ON incidents
    FOR EACH ROW
    EXECUTE FUNCTION log_incident_escalation();
