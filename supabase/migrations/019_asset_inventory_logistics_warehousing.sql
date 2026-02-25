-- ═══════════════════════════════════════════════════════════════════════════
-- FROZEN PHOENIX — Asset, Inventory, Logistics & Warehousing Lifecycle
-- Migration 016
--
-- Creates: warehouse_zones, warehouse_locations, inventory_reservations,
--          shipment_items, kits, kit_items, scan_events, load_plans,
--          load_plan_items, logistics_events, asset_damage_reports,
--          maintenance_schedules, depreciation_schedules, inventory_audits,
--          audit_count_items
--
-- Modifies: assets, consumables, vehicles, warehouses, shipments,
--           maintenance_records
--
-- Maintains 3NF compliance, SSOT governance, referential integrity.
-- All new columns on existing tables are NULLABLE for backward compatibility.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TYPE asset_class AS ENUM (
    'capital_equipment', 'rental_equipment', 'consumable', 'tool',
    'safety_equipment', 'scenic_element', 'technology', 'vehicle',
    'vendor_managed'
);

CREATE TYPE warehouse_zone_type AS ENUM (
    'receiving', 'storage', 'staging_outbound', 'staging_inbound',
    'maintenance', 'quarantine', 'hazmat', 'outdoor',
    'cold_storage', 'secure'
);

CREATE TYPE warehouse_location_type AS ENUM (
    'shelf', 'floor', 'pallet', 'cage', 'outdoor', 'rack', 'bin'
);

CREATE TYPE reservation_status AS ENUM (
    'pending', 'confirmed', 'checked_out', 'released', 'expired', 'cancelled'
);

CREATE TYPE shipment_item_condition AS ENUM (
    'new', 'excellent', 'good', 'fair', 'needs_repair', 'damaged', 'missing'
);

CREATE TYPE kit_status AS ENUM (
    'draft', 'active', 'deployed', 'retired'
);

CREATE TYPE scan_type AS ENUM (
    'check_in', 'check_out', 'transfer', 'count', 'receive',
    'ship', 'verify', 'damage'
);

CREATE TYPE load_plan_status AS ENUM (
    'draft', 'confirmed', 'loading', 'loaded', 'departed'
);

CREATE TYPE logistics_event_type AS ENUM (
    'booked', 'picked_up', 'in_transit', 'customs_hold', 'customs_cleared',
    'cross_dock', 'out_for_delivery', 'delivered', 'exception',
    'damage_reported', 'returned'
);

CREATE TYPE damage_type AS ENUM (
    'cosmetic', 'functional', 'structural', 'total_loss', 'missing'
);

CREATE TYPE damage_severity AS ENUM (
    'minor', 'moderate', 'major', 'write_off'
);

CREATE TYPE damage_resolution AS ENUM (
    'pending', 'repaired', 'replaced', 'written_off', 'insurance_claim'
);

CREATE TYPE maintenance_frequency_type AS ENUM (
    'calendar', 'usage_hours', 'usage_miles', 'event_count'
);

CREATE TYPE maintenance_frequency_unit AS ENUM (
    'days', 'weeks', 'months', 'years', 'hours', 'miles', 'events'
);

CREATE TYPE depreciation_method AS ENUM (
    'straight_line', 'declining_balance', 'units_of_production', 'sum_of_years'
);

CREATE TYPE inventory_audit_type AS ENUM (
    'full', 'cycle', 'spot', 'annual'
);

CREATE TYPE inventory_audit_status AS ENUM (
    'planned', 'in_progress', 'completed', 'cancelled'
);

CREATE TYPE disposal_method AS ENUM (
    'sold', 'donated', 'scrapped', 'returned_to_vendor', 'transferred', 'insurance_claim'
);

CREATE TYPE fuel_type AS ENUM (
    'gasoline', 'diesel', 'electric', 'hybrid', 'propane', 'cng', 'other'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: WAREHOUSE HIERARCHY
-- Replaces JSONB zones with relational structure
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE warehouse_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    zone_type warehouse_zone_type NOT NULL DEFAULT 'storage',
    description TEXT,

    -- Capacity
    square_footage INTEGER,
    capacity_units INTEGER DEFAULT 0,
    capacity_used INTEGER DEFAULT 0,

    -- Features
    climate_controlled BOOLEAN DEFAULT false,
    security_level TEXT DEFAULT 'standard' CHECK (security_level IN ('standard', 'high', 'restricted')),

    -- Display
    display_order INTEGER DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT true,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(warehouse_id, name)
);

CREATE INDEX idx_warehouse_zones_warehouse ON warehouse_zones(warehouse_id);
CREATE INDEX idx_warehouse_zones_type ON warehouse_zones(zone_type);
CREATE INDEX idx_warehouse_zones_active ON warehouse_zones(is_active);

CREATE TABLE warehouse_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id UUID NOT NULL REFERENCES warehouse_zones(id) ON DELETE CASCADE,

    -- Address
    label TEXT NOT NULL,
    aisle TEXT,
    rack TEXT,
    bin TEXT,

    -- Type
    location_type warehouse_location_type NOT NULL DEFAULT 'shelf',

    -- Capacity
    max_weight NUMERIC(10,2),
    max_weight_unit TEXT DEFAULT 'lbs',
    max_dimensions JSONB,

    -- Status
    is_occupied BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,

    -- Barcode
    barcode TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(zone_id, label)
);

CREATE INDEX idx_warehouse_locations_zone ON warehouse_locations(zone_id);
CREATE INDEX idx_warehouse_locations_type ON warehouse_locations(location_type);
CREATE INDEX idx_warehouse_locations_occupied ON warehouse_locations(is_occupied);
CREATE INDEX idx_warehouse_locations_barcode ON warehouse_locations(barcode);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: EXTEND EXISTING TABLES
-- ─────────────────────────────────────────────────────────────────────────────

-- Assets
ALTER TABLE assets ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS asset_class asset_class;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS is_serialized BOOLEAN DEFAULT true;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS rfid_tag TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS warehouse_location_id UUID REFERENCES warehouse_locations(id) ON DELETE SET NULL;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS weight NUMERIC(10,2);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS weight_unit TEXT DEFAULT 'lbs';
ALTER TABLE assets ADD COLUMN IF NOT EXISTS disposal_date DATE;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS disposal_method disposal_method;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS disposal_value NUMERIC(12,2);

CREATE INDEX IF NOT EXISTS idx_assets_sku ON assets(sku);
CREATE INDEX IF NOT EXISTS idx_assets_asset_class ON assets(asset_class);
CREATE INDEX IF NOT EXISTS idx_assets_rfid ON assets(rfid_tag);
CREATE INDEX IF NOT EXISTS idx_assets_warehouse_location ON assets(warehouse_location_id);

-- Consumables
ALTER TABLE consumables ADD COLUMN IF NOT EXISTS asset_class asset_class DEFAULT 'consumable';
ALTER TABLE consumables ADD COLUMN IF NOT EXISTS warehouse_location_id UUID REFERENCES warehouse_locations(id) ON DELETE SET NULL;
ALTER TABLE consumables ADD COLUMN IF NOT EXISTS lot_number TEXT;
ALTER TABLE consumables ADD COLUMN IF NOT EXISTS batch_number TEXT;
ALTER TABLE consumables ADD COLUMN IF NOT EXISTS expiry_date DATE;
ALTER TABLE consumables ADD COLUMN IF NOT EXISTS is_hazardous BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_consumables_warehouse_location ON consumables(warehouse_location_id);
CREATE INDEX IF NOT EXISTS idx_consumables_lot ON consumables(lot_number);
CREATE INDEX IF NOT EXISTS idx_consumables_expiry ON consumables(expiry_date);

-- Vehicles
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS vin TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS registration_expiry DATE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS insurance_expiry DATE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS mileage INTEGER;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS fuel_type fuel_type;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS max_payload_weight NUMERIC(10,2);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS max_payload_unit TEXT DEFAULT 'lbs';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS cargo_length NUMERIC(8,2);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS cargo_width NUMERIC(8,2);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS cargo_height NUMERIC(8,2);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS dimension_unit TEXT DEFAULT 'ft';

CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON vehicles(vin);

-- Warehouses
ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS coordinates JSONB;
ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS loading_docks INTEGER DEFAULT 0;
ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS operating_hours JSONB;
ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Shipments (international logistics)
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS customs_declaration_number TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS hs_codes TEXT[] DEFAULT '{}';
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS export_license TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS incoterms TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS declared_value NUMERIC(12,2);
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS insurance_value NUMERIC(12,2);

-- Maintenance Records
ALTER TABLE maintenance_records ADD COLUMN IF NOT EXISTS maintenance_schedule_id UUID;
ALTER TABLE maintenance_records ADD COLUMN IF NOT EXISTS warranty_claim BOOLEAN DEFAULT false;
ALTER TABLE maintenance_records ADD COLUMN IF NOT EXISTS warranty_claim_number TEXT;
ALTER TABLE maintenance_records ADD COLUMN IF NOT EXISTS parts_used JSONB DEFAULT '[]';
ALTER TABLE maintenance_records ADD COLUMN IF NOT EXISTS downtime_hours NUMERIC(8,2);
ALTER TABLE maintenance_records ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: INVENTORY RESERVATIONS
-- Time-bound allocation locks preventing double-booking
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE inventory_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- What is reserved (one of these must be set)
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    consumable_id UUID REFERENCES consumables(id) ON DELETE CASCADE,
    quantity NUMERIC(10,2) DEFAULT 1,

    -- For what
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    activation_id UUID REFERENCES activations(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,

    -- By whom
    reserved_by UUID NOT NULL REFERENCES profiles(id),

    -- Status
    status reservation_status NOT NULL DEFAULT 'pending',

    -- When
    reserved_from DATE NOT NULL,
    reserved_until DATE NOT NULL,

    -- Notes
    notes TEXT,
    priority INTEGER DEFAULT 0,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT reservation_date_range CHECK (reserved_until >= reserved_from),
    CONSTRAINT reservation_has_item CHECK (asset_id IS NOT NULL OR consumable_id IS NOT NULL)
);

CREATE INDEX idx_reservations_asset ON inventory_reservations(asset_id);
CREATE INDEX idx_reservations_consumable ON inventory_reservations(consumable_id);
CREATE INDEX idx_reservations_project ON inventory_reservations(project_id);
CREATE INDEX idx_reservations_status ON inventory_reservations(status);
CREATE INDEX idx_reservations_dates ON inventory_reservations(reserved_from, reserved_until);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: SHIPMENT ITEMS (structured, replaces JSONB)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE shipment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,

    -- What (one of these should be set; description for ad-hoc items)
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    consumable_id UUID REFERENCES consumables(id) ON DELETE SET NULL,
    kit_id UUID,
    description TEXT,

    -- Quantities
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
    received_quantity NUMERIC(10,2),

    -- Weight / Value
    weight NUMERIC(10,2),
    weight_unit TEXT DEFAULT 'lbs',
    declared_value NUMERIC(12,2),

    -- Handling
    handling_instructions TEXT,
    hs_code TEXT,

    -- Condition tracking
    condition_at_ship shipment_item_condition,
    condition_at_receive shipment_item_condition,
    discrepancy_notes TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shipment_items_shipment ON shipment_items(shipment_id);
CREATE INDEX idx_shipment_items_asset ON shipment_items(asset_id);
CREATE INDEX idx_shipment_items_consumable ON shipment_items(consumable_id);
CREATE INDEX idx_shipment_items_kit ON shipment_items(kit_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: KITS & BUNDLES
-- Logical groupings of assets/consumables for deployment
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE kits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,

    -- Template or instance
    is_template BOOLEAN DEFAULT false,
    template_id UUID REFERENCES kits(id) ON DELETE SET NULL,

    -- Status
    status kit_status NOT NULL DEFAULT 'draft',

    -- Totals
    total_weight NUMERIC(10,2),
    total_value NUMERIC(12,2),

    -- Barcode
    barcode TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kits_status ON kits(status);
CREATE INDEX idx_kits_template ON kits(is_template);
CREATE INDEX idx_kits_barcode ON kits(barcode);

CREATE TABLE kit_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kit_id UUID NOT NULL REFERENCES kits(id) ON DELETE CASCADE,

    -- What (one of these must be set)
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    consumable_id UUID REFERENCES consumables(id) ON DELETE CASCADE,

    -- Quantity (for consumables)
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1,

    -- Required flag
    is_required BOOLEAN DEFAULT true,
    substitute_notes TEXT,

    -- Display
    display_order INTEGER DEFAULT 0,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT kit_item_has_item CHECK (asset_id IS NOT NULL OR consumable_id IS NOT NULL)
);

CREATE INDEX idx_kit_items_kit ON kit_items(kit_id);
CREATE INDEX idx_kit_items_asset ON kit_items(asset_id);
CREATE INDEX idx_kit_items_consumable ON kit_items(consumable_id);

-- Add FK from shipment_items.kit_id now that kits table exists
ALTER TABLE shipment_items
    ADD CONSTRAINT fk_shipment_items_kit
    FOREIGN KEY (kit_id) REFERENCES kits(id) ON DELETE SET NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6: SCAN EVENTS (immutable audit trail)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE scan_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- What was scanned (at least one should be set)
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    consumable_id UUID REFERENCES consumables(id) ON DELETE SET NULL,
    kit_id UUID REFERENCES kits(id) ON DELETE SET NULL,
    warehouse_location_id UUID REFERENCES warehouse_locations(id) ON DELETE SET NULL,

    -- Scan context
    scan_type scan_type NOT NULL,
    scanned_by UUID NOT NULL REFERENCES profiles(id),
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Location
    location_context TEXT,
    device_id TEXT,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),

    -- Notes
    notes TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scan_events_asset ON scan_events(asset_id);
CREATE INDEX idx_scan_events_consumable ON scan_events(consumable_id);
CREATE INDEX idx_scan_events_kit ON scan_events(kit_id);
CREATE INDEX idx_scan_events_type ON scan_events(scan_type);
CREATE INDEX idx_scan_events_scanned_at ON scan_events(scanned_at);
CREATE INDEX idx_scan_events_scanned_by ON scan_events(scanned_by);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 7: LOAD PLANS & LOGISTICS EVENTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE load_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,

    -- Planning
    planned_by UUID REFERENCES profiles(id),
    status load_plan_status NOT NULL DEFAULT 'draft',

    -- Weight
    total_weight NUMERIC(10,2) DEFAULT 0,
    weight_capacity NUMERIC(10,2) NOT NULL,
    utilization_percent NUMERIC(5,2) GENERATED ALWAYS AS (
        CASE WHEN weight_capacity > 0
             THEN ROUND((total_weight / weight_capacity) * 100, 2)
             ELSE 0
        END
    ) STORED,

    -- Schedule
    departure_datetime TIMESTAMPTZ,

    -- Instructions
    load_sequence_notes TEXT,
    special_instructions TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_load_plans_shipment ON load_plans(shipment_id);
CREATE INDEX idx_load_plans_vehicle ON load_plans(vehicle_id);
CREATE INDEX idx_load_plans_status ON load_plans(status);
CREATE INDEX idx_load_plans_departure ON load_plans(departure_datetime);

CREATE TABLE load_plan_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    load_plan_id UUID NOT NULL REFERENCES load_plans(id) ON DELETE CASCADE,
    shipment_item_id UUID NOT NULL REFERENCES shipment_items(id) ON DELETE CASCADE,

    -- Sequence (lower = loaded first = back of truck)
    load_sequence INTEGER NOT NULL DEFAULT 0,
    position_notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_load_plan_items_plan ON load_plan_items(load_plan_id);
CREATE INDEX idx_load_plan_items_shipment_item ON load_plan_items(shipment_item_id);

CREATE TABLE logistics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,

    -- Event
    event_type logistics_event_type NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Location
    location_text TEXT,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),

    -- Details
    notes TEXT,
    reported_by UUID REFERENCES profiles(id),

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logistics_events_shipment ON logistics_events(shipment_id);
CREATE INDEX idx_logistics_events_type ON logistics_events(event_type);
CREATE INDEX idx_logistics_events_occurred ON logistics_events(occurred_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 8: ASSET DAMAGE REPORTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE asset_damage_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,

    -- Context
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    shipment_id UUID REFERENCES shipments(id) ON DELETE SET NULL,

    -- Reporter
    reported_by UUID NOT NULL REFERENCES profiles(id),
    reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Damage details
    damage_type damage_type NOT NULL,
    severity damage_severity NOT NULL,
    description TEXT NOT NULL,
    photo_urls TEXT[] DEFAULT '{}',

    -- Cost
    repair_estimate NUMERIC(12,2),
    actual_repair_cost NUMERIC(12,2),

    -- Resolution
    resolution damage_resolution NOT NULL DEFAULT 'pending',
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,

    -- Insurance
    insurance_claim_id UUID,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_damage_reports_asset ON asset_damage_reports(asset_id);
CREATE INDEX idx_damage_reports_incident ON asset_damage_reports(incident_id);
CREATE INDEX idx_damage_reports_project ON asset_damage_reports(project_id);
CREATE INDEX idx_damage_reports_shipment ON asset_damage_reports(shipment_id);
CREATE INDEX idx_damage_reports_resolution ON asset_damage_reports(resolution);
CREATE INDEX idx_damage_reports_severity ON asset_damage_reports(severity);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 9: MAINTENANCE SCHEDULES
-- Recurring preventive maintenance definitions
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE maintenance_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,

    -- Scope (nullable = applies by category match)
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    asset_category TEXT,

    -- Frequency
    frequency_type maintenance_frequency_type NOT NULL DEFAULT 'calendar',
    frequency_value INTEGER NOT NULL DEFAULT 90,
    frequency_unit maintenance_frequency_unit NOT NULL DEFAULT 'days',

    -- Estimates
    estimated_duration_hours NUMERIC(6,2),
    estimated_cost NUMERIC(10,2),

    -- Certification
    requires_certification BOOLEAN DEFAULT false,
    certification_type TEXT,

    -- Checklist template
    checklist_template JSONB DEFAULT '[]',

    -- Status
    is_active BOOLEAN DEFAULT true,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_maintenance_schedules_asset ON maintenance_schedules(asset_id);
CREATE INDEX idx_maintenance_schedules_category ON maintenance_schedules(asset_category);
CREATE INDEX idx_maintenance_schedules_active ON maintenance_schedules(is_active);

-- Add FK from maintenance_records to maintenance_schedules
ALTER TABLE maintenance_records
    ADD CONSTRAINT fk_maintenance_records_schedule
    FOREIGN KEY (maintenance_schedule_id) REFERENCES maintenance_schedules(id) ON DELETE SET NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 10: DEPRECIATION SCHEDULES
-- Financial depreciation rules per asset
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE depreciation_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,

    -- Method
    method depreciation_method NOT NULL DEFAULT 'straight_line',
    useful_life_months INTEGER NOT NULL,
    residual_value NUMERIC(12,2) NOT NULL DEFAULT 0,

    -- Basis
    start_date DATE NOT NULL,
    cost_basis NUMERIC(12,2) NOT NULL,

    -- Current state
    accumulated_depreciation NUMERIC(12,2) NOT NULL DEFAULT 0,
    current_book_value NUMERIC(12,2) NOT NULL,
    last_calculated_at TIMESTAMPTZ,

    -- GL linkage
    gl_account_id UUID REFERENCES gl_accounts(id) ON DELETE SET NULL,

    -- Notes
    notes TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(asset_id)
);

CREATE INDEX idx_depreciation_schedules_asset ON depreciation_schedules(asset_id);
CREATE INDEX idx_depreciation_schedules_method ON depreciation_schedules(method);
CREATE INDEX idx_depreciation_schedules_gl ON depreciation_schedules(gl_account_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 11: INVENTORY AUDITS & CYCLE COUNTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE inventory_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    zone_id UUID REFERENCES warehouse_zones(id) ON DELETE SET NULL,

    -- Type
    audit_type inventory_audit_type NOT NULL DEFAULT 'cycle',
    status inventory_audit_status NOT NULL DEFAULT 'planned',

    -- Schedule
    planned_date DATE NOT NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Personnel
    conducted_by UUID REFERENCES profiles(id),
    approved_by UUID REFERENCES profiles(id),

    -- Results
    total_items_counted INTEGER DEFAULT 0,
    discrepancy_count INTEGER DEFAULT 0,
    discrepancy_value NUMERIC(12,2) DEFAULT 0,

    -- Notes
    notes TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_audits_warehouse ON inventory_audits(warehouse_id);
CREATE INDEX idx_inventory_audits_zone ON inventory_audits(zone_id);
CREATE INDEX idx_inventory_audits_status ON inventory_audits(status);
CREATE INDEX idx_inventory_audits_planned ON inventory_audits(planned_date);

CREATE TABLE audit_count_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID NOT NULL REFERENCES inventory_audits(id) ON DELETE CASCADE,

    -- What was counted (one of these must be set)
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    consumable_id UUID REFERENCES consumables(id) ON DELETE SET NULL,

    -- Where
    warehouse_location_id UUID REFERENCES warehouse_locations(id) ON DELETE SET NULL,

    -- Counts
    expected_quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
    counted_quantity NUMERIC(10,2) NOT NULL,
    discrepancy NUMERIC(10,2) GENERATED ALWAYS AS (counted_quantity - expected_quantity) STORED,

    -- Condition
    condition_observed TEXT,

    -- Personnel
    counted_by UUID REFERENCES profiles(id),
    counted_at TIMESTAMPTZ DEFAULT NOW(),

    -- Notes
    notes TEXT,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT audit_item_has_item CHECK (asset_id IS NOT NULL OR consumable_id IS NOT NULL)
);

CREATE INDEX idx_audit_count_items_audit ON audit_count_items(audit_id);
CREATE INDEX idx_audit_count_items_asset ON audit_count_items(asset_id);
CREATE INDEX idx_audit_count_items_consumable ON audit_count_items(consumable_id);
CREATE INDEX idx_audit_count_items_location ON audit_count_items(warehouse_location_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE warehouse_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE kit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_damage_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE depreciation_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_count_items ENABLE ROW LEVEL SECURITY;

-- Standard org-based policies for all tables with organization_id
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'warehouse_zones', 'warehouse_locations', 'inventory_reservations',
        'shipment_items', 'kits', 'kit_items', 'scan_events',
        'load_plans', 'logistics_events', 'asset_damage_reports',
        'maintenance_schedules', 'depreciation_schedules',
        'inventory_audits', 'audit_count_items'
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

-- scan_events is immutable (INSERT + SELECT only, no UPDATE policy needed, but we keep it for consistency)
-- Separately handle load_plan_items which inherits org through load_plans
ALTER TABLE load_plan_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view load_plan_items via load_plans" ON load_plan_items
    FOR SELECT USING (
        load_plan_id IN (
            SELECT id FROM load_plans
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );
CREATE POLICY "Users can insert load_plan_items via load_plans" ON load_plan_items
    FOR INSERT WITH CHECK (
        load_plan_id IN (
            SELECT id FROM load_plans
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );
CREATE POLICY "Users can update load_plan_items via load_plans" ON load_plan_items
    FOR UPDATE USING (
        load_plan_id IN (
            SELECT id FROM load_plans
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

-- updated_at triggers for tables with updated_at columns
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'warehouse_zones', 'warehouse_locations', 'inventory_reservations',
        'shipment_items', 'kits', 'load_plans',
        'asset_damage_reports', 'maintenance_schedules',
        'depreciation_schedules', 'inventory_audits'
    ])
    LOOP
        EXECUTE format('
            CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ', tbl, tbl);
    END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- RESERVATION CONFLICT DETECTION TRIGGER
-- Prevents overlapping confirmed reservations for the same serialized asset
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION check_reservation_conflict()
RETURNS TRIGGER AS $$
BEGIN
    -- Only check for serialized assets (asset_id is set)
    IF NEW.asset_id IS NOT NULL AND NEW.status IN ('confirmed', 'checked_out') THEN
        IF EXISTS (
            SELECT 1 FROM inventory_reservations
            WHERE asset_id = NEW.asset_id
              AND id != NEW.id
              AND status IN ('confirmed', 'checked_out')
              AND NEW.reserved_from < reserved_until
              AND NEW.reserved_until > reserved_from
        ) THEN
            RAISE EXCEPTION 'Asset % is already reserved for the period % to %',
                NEW.asset_id, NEW.reserved_from, NEW.reserved_until;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_reservation_conflict_trigger
    BEFORE INSERT OR UPDATE ON inventory_reservations
    FOR EACH ROW EXECUTE FUNCTION check_reservation_conflict();

-- ─────────────────────────────────────────────────────────────────────────────
-- ACTIVITY LOG TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'inventory_reservations', 'kits', 'asset_damage_reports',
        'maintenance_schedules', 'depreciation_schedules', 'inventory_audits'
    ])
    LOOP
        EXECUTE format('
            CREATE TRIGGER %I_activity_log AFTER INSERT OR UPDATE OR DELETE ON %I
                FOR EACH ROW EXECUTE FUNCTION log_activity();
        ', tbl || '_log', tbl);
    END LOOP;
END $$;
