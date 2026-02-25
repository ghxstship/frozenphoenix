-- ═══════════════════════════════════════════════════════════════════════════
-- FROZEN PHOENIX — Location Spatial Hierarchy & Lifecycle
-- Migration 017
--
-- Creates: project_locations, space_bookings, event_space_overlays,
--          location_compliance_docs, location_inspections, location_costs,
--          location_contacts
--
-- Modifies: locations (hierarchy, spatial, regulatory, lifecycle columns),
--           warehouses (bridge FK to locations)
--
-- Dependencies: 003 (production_lifecycle — locations, warehouses),
--               004 (crm_public — contacts),
--               008 (vendor_contractor — compliance_doc_status already exists)
--
-- Architecture: docs/LOCATION_SPATIAL_HIERARCHY_ARCHITECTURE.md
-- Maintains 3NF compliance, SSOT governance, referential integrity.
-- All new columns on existing tables are NULLABLE for backward compatibility.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────────────────────

-- Extend location_type with additional spatial classifications
-- We add new values to the existing enum rather than replacing it
ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'site';
ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'campus';
ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'complex';
ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'festival_grounds';
ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'theater';
ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'arena';
ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'convention_center';
ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'club';
ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'park';
ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'stadium';
ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'floor';
ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'space';
ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'room';
ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'exhibit_hall';
ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'stage';
ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'loading_dock';
ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'green_room';
ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'control_room';
ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'storage_room';
ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'breakout_room';
ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'outdoor_zone';
ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'parking_lot';
ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'perimeter';

-- Location lifecycle status
CREATE TYPE location_status AS ENUM (
    'prospecting', 'onboarding', 'active', 'seasonal',
    'maintenance', 'reconfiguring', 'archived'
);

-- Location ownership model
CREATE TYPE location_ownership AS ENUM (
    'owned', 'leased', 'temporary', 'partner', 'client_provided'
);

-- Project-location junction role
CREATE TYPE project_location_role AS ENUM (
    'primary', 'secondary', 'staging', 'storage',
    'fabrication', 'backup', 'load_in', 'load_out'
);

-- Space booking types
CREATE TYPE space_booking_type AS ENUM (
    'event', 'rehearsal', 'setup', 'strike', 'load_in',
    'load_out', 'maintenance', 'hold', 'site_visit', 'inspection'
);

CREATE TYPE space_booking_status AS ENUM (
    'tentative', 'confirmed', 'cancelled'
);

-- Location compliance document types
-- NOTE: compliance_doc_status already exists in 008_vendor_contractor_lifecycle.sql
-- We use loc_compliance_doc_status to avoid conflict
CREATE TYPE location_doc_type AS ENUM (
    'fire_cert', 'occupancy_permit', 'ada_cert', 'health_dept',
    'env_assessment', 'insurance_cert', 'engineering_cert',
    'noise_permit', 'alcohol_license', 'building_permit',
    'zoning_approval', 'safety_plan', 'structural_report',
    'electrical_cert', 'plumbing_cert'
);

CREATE TYPE loc_compliance_doc_status AS ENUM (
    'valid', 'expiring_soon', 'expired', 'pending', 'rejected'
);

-- Location inspection types
CREATE TYPE location_inspection_type AS ENUM (
    'fire', 'safety', 'structural', 'electrical', 'plumbing',
    'ada', 'health', 'environmental', 'security', 'general'
);

CREATE TYPE location_inspection_result AS ENUM (
    'passed', 'failed', 'conditional', 'pending'
);

-- Location cost types
CREATE TYPE location_cost_type AS ENUM (
    'lease', 'rent', 'utilities', 'maintenance', 'insurance',
    'security', 'cleaning', 'taxes', 'renovation', 'equipment', 'other'
);

CREATE TYPE location_cost_frequency AS ENUM (
    'one_time', 'monthly', 'quarterly', 'annual', 'per_event'
);

-- Location contact roles
CREATE TYPE location_contact_role AS ENUM (
    'venue_manager', 'building_ops', 'security', 'fire_marshal',
    'loading_dock', 'catering', 'av_tech', 'facilities', 'emergency'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: EXTEND LOCATIONS TABLE
-- Add hierarchy, spatial, regulatory, and lifecycle columns
-- ─────────────────────────────────────────────────────────────────────────────

-- Hierarchy
ALTER TABLE locations ADD COLUMN IF NOT EXISTS parent_location_id UUID REFERENCES locations(id) ON DELETE SET NULL;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS hierarchy_depth INTEGER DEFAULT 0;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS hierarchy_path TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS code TEXT;

-- Lifecycle
ALTER TABLE locations ADD COLUMN IF NOT EXISTS status location_status DEFAULT 'active';
ALTER TABLE locations ADD COLUMN IF NOT EXISTS ownership location_ownership;

-- Capacity (structured — replaces generic capacity)
ALTER TABLE locations ADD COLUMN IF NOT EXISTS capacity_seated INTEGER;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS capacity_standing INTEGER;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS capacity_fire_code INTEGER;

-- Spatial
ALTER TABLE locations ADD COLUMN IF NOT EXISTS floor_number INTEGER;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS timezone TEXT;

-- Regulatory
ALTER TABLE locations ADD COLUMN IF NOT EXISTS zoning_classification TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS regulatory_jurisdiction TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS is_ada_accessible BOOLEAN;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS ada_notes TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS noise_curfew_time TIME;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS noise_max_db INTEGER;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS alcohol_license BOOLEAN DEFAULT false;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS outdoor BOOLEAN DEFAULT false;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS climate_controlled BOOLEAN;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS security_level TEXT;

-- Linked assets/contacts
ALTER TABLE locations ADD COLUMN IF NOT EXISTS floorplan_asset_id UUID;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS primary_contact_id UUID;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES profiles(id);

-- Indexes for new columns
CREATE INDEX IF NOT EXISTS idx_locations_parent ON locations(parent_location_id);
CREATE INDEX IF NOT EXISTS idx_locations_hierarchy_depth ON locations(hierarchy_depth);
CREATE INDEX IF NOT EXISTS idx_locations_status ON locations(status);
CREATE INDEX IF NOT EXISTS idx_locations_code ON locations(code);
CREATE INDEX IF NOT EXISTS idx_locations_ownership ON locations(ownership);
CREATE UNIQUE INDEX IF NOT EXISTS idx_locations_code_unique ON locations(code) WHERE code IS NOT NULL;

-- Migrate existing capacity → capacity_seated (preserve data)
UPDATE locations SET capacity_seated = capacity WHERE capacity IS NOT NULL AND capacity_seated IS NULL;

-- Set hierarchy_path for existing root locations
UPDATE locations SET hierarchy_path = id::TEXT WHERE parent_location_id IS NULL AND hierarchy_path IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: PROJECT_LOCATIONS (M:M junction)
-- Replaces locations.project_id 1:M FK with proper M:M
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE project_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,

    -- Role
    role project_location_role NOT NULL DEFAULT 'primary',

    -- Access windows (per-project, not per-location globally)
    access_start_date DATE,
    access_end_date DATE,
    load_in_windows JSONB DEFAULT '[]',
    load_out_windows JSONB DEFAULT '[]',

    -- Costs (per-project negotiated)
    daily_rate NUMERIC(12,2),
    total_cost NUMERIC(12,2),

    -- Notes
    notes TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(project_id, location_id, role)
);

CREATE INDEX idx_project_locations_project ON project_locations(project_id);
CREATE INDEX idx_project_locations_location ON project_locations(location_id);
CREATE INDEX idx_project_locations_role ON project_locations(role);
CREATE INDEX idx_project_locations_dates ON project_locations(access_start_date, access_end_date);

-- Migrate existing locations.project_id data into project_locations
INSERT INTO project_locations (project_id, location_id, role, access_start_date, access_end_date,
    load_in_windows, load_out_windows, daily_rate, total_cost, organization_id)
SELECT
    l.project_id,
    l.id,
    'primary',
    l.access_start_date,
    l.access_end_date,
    l.load_in_windows,
    l.load_out_windows,
    l.daily_rate,
    l.total_cost,
    l.organization_id
FROM locations l
WHERE l.project_id IS NOT NULL
  AND l.organization_id IS NOT NULL;

-- NOTE: We do NOT drop project_id FK from locations for backward compatibility.
-- Existing hooks/pages that use locations.project_id will continue to work.
-- New code should use project_locations junction instead.

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: SPACE BOOKINGS
-- Physical space scheduling with conflict detection
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE space_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,

    -- Context (all optional — booking can be independent)
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    activation_id UUID REFERENCES activations(id) ON DELETE SET NULL,

    -- Who
    booked_by UUID NOT NULL REFERENCES profiles(id),

    -- What
    booking_type space_booking_type NOT NULL DEFAULT 'event',
    status space_booking_status NOT NULL DEFAULT 'tentative',

    -- When
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,

    -- Capacity
    expected_attendance INTEGER,

    -- Buffers
    setup_minutes_before INTEGER DEFAULT 0,
    teardown_minutes_after INTEGER DEFAULT 0,

    -- Notes
    notes TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT space_booking_date_range CHECK (end_datetime > start_datetime)
);

CREATE INDEX idx_space_bookings_location ON space_bookings(location_id);
CREATE INDEX idx_space_bookings_project ON space_bookings(project_id);
CREATE INDEX idx_space_bookings_event ON space_bookings(event_id);
CREATE INDEX idx_space_bookings_activation ON space_bookings(activation_id);
CREATE INDEX idx_space_bookings_status ON space_bookings(status);
CREATE INDEX idx_space_bookings_dates ON space_bookings(start_datetime, end_datetime);
CREATE INDEX idx_space_bookings_booked_by ON space_bookings(booked_by);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: EVENT SPACE OVERLAYS
-- Temporary spatial reconfigurations layered on permanent spaces
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE event_space_overlays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,

    -- Identity
    overlay_name TEXT NOT NULL,
    overlay_type TEXT NOT NULL DEFAULT 'space',

    -- Context
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,

    -- Overrides
    capacity_override INTEGER,
    square_footage_override INTEGER,
    restrictions_override TEXT[] DEFAULT '{}',

    -- Layout
    layout_asset_id UUID,

    -- When
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    -- Notes
    notes TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT overlay_date_range CHECK (end_date >= start_date)
);

CREATE INDEX idx_event_space_overlays_base ON event_space_overlays(base_location_id);
CREATE INDEX idx_event_space_overlays_project ON event_space_overlays(project_id);
CREATE INDEX idx_event_space_overlays_event ON event_space_overlays(event_id);
CREATE INDEX idx_event_space_overlays_dates ON event_space_overlays(start_date, end_date);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: LOCATION COMPLIANCE DOCUMENTS
-- Permits, certifications, and regulatory documents attached to locations
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE location_compliance_docs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,

    -- Document classification
    doc_type location_doc_type NOT NULL,
    document_number TEXT,
    issuing_authority TEXT,

    -- Dates
    issued_date DATE,
    expiry_date DATE,

    -- Status
    status loc_compliance_doc_status NOT NULL DEFAULT 'pending',

    -- Linked file
    digital_asset_id UUID,

    -- Notes
    notes TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_loc_compliance_docs_location ON location_compliance_docs(location_id);
CREATE INDEX idx_loc_compliance_docs_type ON location_compliance_docs(doc_type);
CREATE INDEX idx_loc_compliance_docs_status ON location_compliance_docs(status);
CREATE INDEX idx_loc_compliance_docs_expiry ON location_compliance_docs(expiry_date);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6: LOCATION INSPECTIONS
-- Safety audit and inspection logging
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE location_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,

    -- Inspection details
    inspection_type location_inspection_type NOT NULL,
    inspector_name TEXT,
    inspector_org TEXT,
    inspection_date DATE NOT NULL,
    next_inspection_date DATE,

    -- Result
    result location_inspection_result NOT NULL DEFAULT 'pending',
    findings TEXT,

    -- Corrective actions
    corrective_actions TEXT,
    corrective_deadline DATE,

    -- Linked report
    digital_asset_id UUID,

    -- Notes
    notes TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_loc_inspections_location ON location_inspections(location_id);
CREATE INDEX idx_loc_inspections_type ON location_inspections(inspection_type);
CREATE INDEX idx_loc_inspections_result ON location_inspections(result);
CREATE INDEX idx_loc_inspections_date ON location_inspections(inspection_date);
CREATE INDEX idx_loc_inspections_next ON location_inspections(next_inspection_date);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 7: LOCATION COSTS
-- Lease, utility, maintenance, and other recurring/one-time costs
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE location_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,

    -- Cost details
    cost_type location_cost_type NOT NULL,
    description TEXT,
    amount NUMERIC(12,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    frequency location_cost_frequency NOT NULL DEFAULT 'one_time',

    -- Effective period
    effective_date DATE,
    end_date DATE,

    -- Linked entities
    vendor_id UUID,
    contract_id UUID,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

    -- Notes
    notes TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_loc_costs_location ON location_costs(location_id);
CREATE INDEX idx_loc_costs_type ON location_costs(cost_type);
CREATE INDEX idx_loc_costs_frequency ON location_costs(frequency);
CREATE INDEX idx_loc_costs_dates ON location_costs(effective_date, end_date);
CREATE INDEX idx_loc_costs_project ON location_costs(project_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 8: LOCATION CONTACTS (M:M)
-- Maps contacts to locations with role classification
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE location_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,

    -- Role
    role location_contact_role NOT NULL DEFAULT 'venue_manager',
    is_primary BOOLEAN DEFAULT false,

    -- Notes
    notes TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(location_id, contact_id, role)
);

CREATE INDEX idx_loc_contacts_location ON location_contacts(location_id);
CREATE INDEX idx_loc_contacts_contact ON location_contacts(contact_id);
CREATE INDEX idx_loc_contacts_role ON location_contacts(role);
CREATE INDEX idx_loc_contacts_primary ON location_contacts(is_primary) WHERE is_primary = true;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 9: BRIDGE WAREHOUSES TO LOCATIONS
-- Adds location_id FK to warehouses for unified spatial hierarchy
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_warehouses_location ON warehouses(location_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE project_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_space_overlays ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_compliance_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_contacts ENABLE ROW LEVEL SECURITY;

-- Standard org-based policies
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'project_locations', 'space_bookings', 'event_space_overlays',
        'location_compliance_docs', 'location_inspections',
        'location_costs', 'location_contacts'
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
-- TRIGGERS: updated_at
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'project_locations', 'space_bookings', 'event_space_overlays',
        'location_compliance_docs', 'location_inspections', 'location_costs'
    ])
    LOOP
        EXECUTE format('
            CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ', tbl, tbl);
    END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- TRIGGERS: Activity log
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'project_locations', 'space_bookings', 'event_space_overlays',
        'location_compliance_docs', 'location_inspections', 'location_costs'
    ])
    LOOP
        EXECUTE format('
            CREATE TRIGGER %I_activity_log AFTER INSERT OR UPDATE OR DELETE ON %I
                FOR EACH ROW EXECUTE FUNCTION log_activity();
        ', tbl || '_log', tbl);
    END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- FUNCTION: Hierarchy path maintenance
-- Automatically sets hierarchy_depth and hierarchy_path on insert/update
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION maintain_location_hierarchy()
RETURNS TRIGGER AS $$
DECLARE
    parent_depth INTEGER;
    parent_path TEXT;
BEGIN
    IF NEW.parent_location_id IS NULL THEN
        NEW.hierarchy_depth := 0;
        NEW.hierarchy_path := NEW.id::TEXT;
    ELSE
        SELECT hierarchy_depth, hierarchy_path
        INTO parent_depth, parent_path
        FROM locations WHERE id = NEW.parent_location_id;

        IF parent_depth IS NULL THEN
            parent_depth := 0;
            parent_path := NEW.parent_location_id::TEXT;
        END IF;

        NEW.hierarchy_depth := parent_depth + 1;
        NEW.hierarchy_path := parent_path || '.' || NEW.id::TEXT;

        -- Enforce max depth of 6
        IF NEW.hierarchy_depth > 6 THEN
            RAISE EXCEPTION 'Location hierarchy depth exceeds maximum of 6 (current: %)', NEW.hierarchy_depth;
        END IF;

        -- Prevent circular references
        IF parent_path LIKE '%' || NEW.id::TEXT || '%' THEN
            RAISE EXCEPTION 'Circular reference detected in location hierarchy';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER maintain_location_hierarchy_trigger
    BEFORE INSERT OR UPDATE OF parent_location_id ON locations
    FOR EACH ROW EXECUTE FUNCTION maintain_location_hierarchy();

-- ─────────────────────────────────────────────────────────────────────────────
-- FUNCTION: Space booking conflict detection
-- Prevents overlapping confirmed bookings for the same location
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION check_space_booking_conflicts()
RETURNS TRIGGER AS $$
DECLARE
    effective_start TIMESTAMPTZ;
    effective_end TIMESTAMPTZ;
    conflict_count INTEGER;
BEGIN
    -- Only enforce for confirmed bookings
    IF NEW.status != 'confirmed' THEN
        RETURN NEW;
    END IF;

    -- Calculate effective time range including setup/teardown buffers
    effective_start := NEW.start_datetime - (COALESCE(NEW.setup_minutes_before, 0) || ' minutes')::INTERVAL;
    effective_end := NEW.end_datetime + (COALESCE(NEW.teardown_minutes_after, 0) || ' minutes')::INTERVAL;

    -- Check for overlapping confirmed bookings at the same location
    SELECT COUNT(*) INTO conflict_count
    FROM space_bookings
    WHERE location_id = NEW.location_id
      AND id != NEW.id
      AND status = 'confirmed'
      AND (start_datetime - (COALESCE(setup_minutes_before, 0) || ' minutes')::INTERVAL) < effective_end
      AND (end_datetime + (COALESCE(teardown_minutes_after, 0) || ' minutes')::INTERVAL) > effective_start;

    IF conflict_count > 0 THEN
        RAISE EXCEPTION 'Space booking conflict: location % has % overlapping confirmed booking(s) in the requested time range',
            NEW.location_id, conflict_count;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_space_booking_conflicts_trigger
    BEFORE INSERT OR UPDATE ON space_bookings
    FOR EACH ROW EXECUTE FUNCTION check_space_booking_conflicts();

-- ─────────────────────────────────────────────────────────────────────────────
-- FUNCTION: Space booking capacity validation
-- Ensures expected_attendance does not exceed location capacity
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION validate_space_booking_capacity()
RETURNS TRIGGER AS $$
DECLARE
    loc_fire_code INTEGER;
    loc_seated INTEGER;
    loc_standing INTEGER;
    effective_capacity INTEGER;
BEGIN
    -- Skip if no attendance specified
    IF NEW.expected_attendance IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT capacity_fire_code, capacity_seated, capacity_standing
    INTO loc_fire_code, loc_seated, loc_standing
    FROM locations WHERE id = NEW.location_id;

    -- Use fire code as hard limit, then seated, then standing
    effective_capacity := COALESCE(loc_fire_code, loc_seated, loc_standing);

    IF effective_capacity IS NOT NULL AND NEW.expected_attendance > effective_capacity THEN
        RAISE EXCEPTION 'Expected attendance (%) exceeds location capacity (%) for location %',
            NEW.expected_attendance, effective_capacity, NEW.location_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_space_booking_capacity_trigger
    BEFORE INSERT OR UPDATE ON space_bookings
    FOR EACH ROW EXECUTE FUNCTION validate_space_booking_capacity();

-- ─────────────────────────────────────────────────────────────────────────────
-- VIEW: Location profitability
-- Aggregates revenue, costs, and utilization per location
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW v_location_profitability AS
SELECT
    l.id AS location_id,
    l.name,
    l.type,
    l.status,
    l.organization_id,
    COUNT(DISTINCT pl.project_id) AS projects_served,
    COALESCE(SUM(pl.total_cost), 0) AS total_project_revenue,
    COALESCE(recurring_costs.total, 0) AS total_recurring_costs,
    COALESCE(onetime_costs.total, 0) AS total_onetime_costs,
    COALESCE(SUM(pl.total_cost), 0)
        - COALESCE(recurring_costs.total, 0)
        - COALESCE(onetime_costs.total, 0) AS net_margin,
    COALESCE(booking_stats.total_booked_hours, 0) AS booked_hours,
    COALESCE(booking_stats.booking_count, 0) AS booking_count
FROM locations l
LEFT JOIN project_locations pl ON l.id = pl.location_id
LEFT JOIN LATERAL (
    SELECT SUM(amount) AS total
    FROM location_costs
    WHERE location_id = l.id AND frequency != 'one_time'
) recurring_costs ON true
LEFT JOIN LATERAL (
    SELECT SUM(amount) AS total
    FROM location_costs
    WHERE location_id = l.id AND frequency = 'one_time'
) onetime_costs ON true
LEFT JOIN LATERAL (
    SELECT
        SUM(EXTRACT(EPOCH FROM (end_datetime - start_datetime)) / 3600) AS total_booked_hours,
        COUNT(*) AS booking_count
    FROM space_bookings
    WHERE location_id = l.id AND status = 'confirmed'
) booking_stats ON true
GROUP BY l.id, l.name, l.type, l.status, l.organization_id,
         recurring_costs.total, onetime_costs.total,
         booking_stats.total_booked_hours, booking_stats.booking_count;

-- ─────────────────────────────────────────────────────────────────────────────
-- VIEW: Location hierarchy tree
-- Flattened hierarchy with breadcrumb path names
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW v_location_hierarchy AS
WITH RECURSIVE loc_tree AS (
    -- Root locations
    SELECT
        id, name, type, status, parent_location_id,
        hierarchy_depth, hierarchy_path,
        name AS breadcrumb,
        organization_id
    FROM locations
    WHERE parent_location_id IS NULL

    UNION ALL

    -- Children
    SELECT
        l.id, l.name, l.type, l.status, l.parent_location_id,
        l.hierarchy_depth, l.hierarchy_path,
        lt.breadcrumb || ' > ' || l.name AS breadcrumb,
        l.organization_id
    FROM locations l
    INNER JOIN loc_tree lt ON l.parent_location_id = lt.id
)
SELECT * FROM loc_tree;

-- ─────────────────────────────────────────────────────────────────────────────
-- VIEW: Location compliance summary
-- Aggregates compliance document status per location
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW v_location_compliance_summary AS
SELECT
    l.id AS location_id,
    l.name,
    l.type,
    l.organization_id,
    COUNT(lcd.id) AS total_docs,
    COUNT(lcd.id) FILTER (WHERE lcd.status = 'valid') AS valid_docs,
    COUNT(lcd.id) FILTER (WHERE lcd.status = 'expiring_soon') AS expiring_docs,
    COUNT(lcd.id) FILTER (WHERE lcd.status = 'expired') AS expired_docs,
    COUNT(lcd.id) FILTER (WHERE lcd.status = 'pending') AS pending_docs,
    COUNT(lcd.id) FILTER (WHERE lcd.status = 'rejected') AS rejected_docs,
    MIN(lcd.expiry_date) FILTER (WHERE lcd.status IN ('valid', 'expiring_soon')) AS nearest_expiry,
    COUNT(li.id) AS total_inspections,
    COUNT(li.id) FILTER (WHERE li.result = 'passed') AS passed_inspections,
    COUNT(li.id) FILTER (WHERE li.result = 'failed') AS failed_inspections,
    MAX(li.inspection_date) AS last_inspection_date
FROM locations l
LEFT JOIN location_compliance_docs lcd ON l.id = lcd.location_id
LEFT JOIN location_inspections li ON l.id = li.location_id
GROUP BY l.id, l.name, l.type, l.organization_id;
