/* ═══════════════════════════════════════════════════════════════
   ATLVS — Asset, Inventory, Logistics & Warehousing Types
   Migration 018: asset lifecycle, warehouse hierarchy, logistics
   ═══════════════════════════════════════════════════════════════ */

// ─── Enums ───

export type AssetClass =
    | "capital_equipment"
    | "rental_equipment"
    | "consumable"
    | "tool"
    | "safety_equipment"
    | "scenic_element"
    | "technology"
    | "vehicle"
    | "vendor_managed";

export type WarehouseZoneType =
    | "receiving"
    | "storage"
    | "staging_outbound"
    | "staging_inbound"
    | "maintenance"
    | "quarantine"
    | "hazmat"
    | "outdoor"
    | "cold_storage"
    | "secure";

export type WarehouseLocationType =
    | "shelf"
    | "floor"
    | "pallet"
    | "cage"
    | "outdoor"
    | "rack"
    | "bin";

export type ReservationStatus =
    | "pending"
    | "confirmed"
    | "checked_out"
    | "released"
    | "expired"
    | "cancelled";

export type ShipmentItemCondition =
    | "new"
    | "excellent"
    | "good"
    | "fair"
    | "needs_repair"
    | "damaged"
    | "missing";

export type KitStatus = "draft" | "active" | "deployed" | "retired";

export type ScanType =
    | "check_in"
    | "check_out"
    | "transfer"
    | "count"
    | "receive"
    | "ship"
    | "verify"
    | "damage";

export type LoadPlanStatus = "draft" | "confirmed" | "loading" | "loaded" | "departed";

export type LogisticsEventType =
    | "booked"
    | "picked_up"
    | "in_transit"
    | "customs_hold"
    | "customs_cleared"
    | "cross_dock"
    | "out_for_delivery"
    | "delivered"
    | "exception"
    | "damage_reported"
    | "returned";

export type AssetDamageType = "cosmetic" | "functional" | "structural" | "total_loss" | "missing";

export type DamageSeverity = "minor" | "moderate" | "major" | "write_off";

export type DamageResolution =
    | "pending"
    | "repaired"
    | "replaced"
    | "written_off"
    | "insurance_claim";

export type MaintenanceFrequencyType = "calendar" | "usage_hours" | "usage_miles" | "event_count";

export type MaintenanceFrequencyUnit =
    | "days"
    | "weeks"
    | "months"
    | "years"
    | "hours"
    | "miles"
    | "events";

export type DepreciationMethod =
    | "straight_line"
    | "declining_balance"
    | "units_of_production"
    | "sum_of_years";

export type InventoryAuditType = "full" | "cycle" | "spot" | "annual";

export type InventoryAuditStatus = "planned" | "in_progress" | "completed" | "cancelled";

export type DisposalMethod =
    | "sold"
    | "donated"
    | "scrapped"
    | "returned_to_vendor"
    | "transferred"
    | "insurance_claim";

export type FuelType = "gasoline" | "diesel" | "electric" | "hybrid" | "propane" | "cng" | "other";

// ─── Warehouse Hierarchy ───

export interface WarehouseZone {
    id: string;
    warehouse_id: string;
    name: string;
    zone_type: WarehouseZoneType;
    description?: string | undefined;
    square_footage?: number | undefined;
    capacity_units: number;
    capacity_used: number;
    climate_controlled: boolean;
    security_level: string;
    display_order: number;
    is_active: boolean;
    organization_id: string;
    created_by?: string | undefined;
    updated_by?: string | undefined;
    created_at: string;
    updated_at: string;
}

export interface WarehouseLocation {
    id: string;
    zone_id: string;
    label: string;
    aisle?: string | undefined;
    rack?: string | undefined;
    bin?: string | undefined;
    location_type: WarehouseLocationType;
    max_weight?: number | undefined;
    max_weight_unit: string;
    max_dimensions?:
        | { length?: number; width?: number; height?: number; unit?: string }
        | undefined;
    is_occupied: boolean;
    is_active: boolean;
    barcode?: string | undefined;
    organization_id: string;
    created_at: string;
    updated_at: string;
}

// ─── Inventory Reservations ───

export interface InventoryReservation {
    id: string;
    asset_id?: string | undefined;
    consumable_id?: string | undefined;
    quantity: number;
    project_id: string;
    activation_id?: string | undefined;
    event_id?: string | undefined;
    reserved_by: string;
    status: ReservationStatus;
    reserved_from: string;
    reserved_until: string;
    notes?: string | undefined;
    priority: number;
    organization_id: string;
    created_at: string;
    updated_at: string;
}

// ─── Shipment Items ───

export interface ShipmentItem {
    id: string;
    shipment_id: string;
    asset_id?: string | undefined;
    consumable_id?: string | undefined;
    kit_id?: string | undefined;
    description?: string | undefined;
    quantity: number;
    received_quantity?: number | undefined;
    weight?: number | undefined;
    weight_unit: string;
    declared_value?: number | undefined;
    handling_instructions?: string | undefined;
    hs_code?: string | undefined;
    condition_at_ship?: ShipmentItemCondition | undefined;
    condition_at_receive?: ShipmentItemCondition | undefined;
    discrepancy_notes?: string | undefined;
    organization_id: string;
    created_at: string;
    updated_at: string;
}

// ─── Kits & Bundles ───

export interface Kit {
    id: string;
    name: string;
    description?: string | undefined;
    category?: string | undefined;
    is_template: boolean;
    template_id?: string | undefined;
    status: KitStatus;
    total_weight?: number | undefined;
    total_value?: number | undefined;
    barcode?: string | undefined;
    organization_id: string;
    created_by?: string | undefined;
    updated_by?: string | undefined;
    created_at: string;
    updated_at: string;
}

export interface KitItem {
    id: string;
    kit_id: string;
    asset_id?: string | undefined;
    consumable_id?: string | undefined;
    quantity: number;
    is_required: boolean;
    substitute_notes?: string | undefined;
    display_order: number;
    organization_id: string;
    created_at: string;
}

// ─── Scan Events ───

export interface ScanEvent {
    id: string;
    asset_id?: string | undefined;
    consumable_id?: string | undefined;
    kit_id?: string | undefined;
    warehouse_location_id?: string | undefined;
    scan_type: ScanType;
    scanned_by: string;
    scanned_at: string;
    location_context?: string | undefined;
    device_id?: string | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    notes?: string | undefined;
    organization_id: string;
    created_at: string;
}

// ─── Load Plans ───

export interface LoadPlan {
    id: string;
    shipment_id: string;
    vehicle_id: string;
    planned_by?: string | undefined;
    status: LoadPlanStatus;
    total_weight: number;
    weight_capacity: number;
    utilization_percent: number;
    departure_datetime?: string | undefined;
    load_sequence_notes?: string | undefined;
    special_instructions?: string | undefined;
    organization_id: string;
    created_by?: string | undefined;
    updated_by?: string | undefined;
    created_at: string;
    updated_at: string;
}

export interface LoadPlanItem {
    id: string;
    load_plan_id: string;
    shipment_item_id: string;
    load_sequence: number;
    position_notes?: string | undefined;
    created_at: string;
}

// ─── Logistics Events ───

export interface LogisticsEvent {
    id: string;
    shipment_id: string;
    event_type: LogisticsEventType;
    occurred_at: string;
    location_text?: string | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    notes?: string | undefined;
    reported_by?: string | undefined;
    organization_id: string;
    created_at: string;
}

// ─── Asset Damage Reports ───

export interface AssetDamageReport {
    id: string;
    asset_id: string;
    incident_id?: string | undefined;
    project_id?: string | undefined;
    shipment_id?: string | undefined;
    reported_by: string;
    reported_at: string;
    damage_type: AssetDamageType;
    severity: DamageSeverity;
    description: string;
    photo_urls: string[];
    repair_estimate?: number | undefined;
    actual_repair_cost?: number | undefined;
    resolution: DamageResolution;
    resolved_at?: string | undefined;
    resolution_notes?: string | undefined;
    insurance_claim_id?: string | undefined;
    organization_id: string;
    created_by?: string | undefined;
    updated_by?: string | undefined;
    created_at: string;
    updated_at: string;
}

// ─── Maintenance Schedules ───

export interface MaintenanceSchedule {
    id: string;
    name: string;
    description?: string | undefined;
    asset_id?: string | undefined;
    asset_category?: string | undefined;
    frequency_type: MaintenanceFrequencyType;
    frequency_value: number;
    frequency_unit: MaintenanceFrequencyUnit;
    estimated_duration_hours?: number | undefined;
    estimated_cost?: number | undefined;
    requires_certification: boolean;
    certification_type?: string | undefined;
    checklist_template: unknown[];
    is_active: boolean;
    organization_id: string;
    created_by?: string | undefined;
    updated_by?: string | undefined;
    created_at: string;
    updated_at: string;
}

// ─── Depreciation Schedules ───

export interface DepreciationSchedule {
    id: string;
    asset_id: string;
    method: DepreciationMethod;
    useful_life_months: number;
    residual_value: number;
    start_date: string;
    cost_basis: number;
    accumulated_depreciation: number;
    current_book_value: number;
    last_calculated_at?: string | undefined;
    gl_account_id?: string | undefined;
    notes?: string | undefined;
    organization_id: string;
    created_by?: string | undefined;
    updated_by?: string | undefined;
    created_at: string;
    updated_at: string;
}

// ─── Inventory Audits ───

export interface InventoryAudit {
    id: string;
    warehouse_id: string;
    zone_id?: string | undefined;
    audit_type: InventoryAuditType;
    status: InventoryAuditStatus;
    planned_date: string;
    started_at?: string | undefined;
    completed_at?: string | undefined;
    conducted_by?: string | undefined;
    approved_by?: string | undefined;
    total_items_counted: number;
    discrepancy_count: number;
    discrepancy_value: number;
    notes?: string | undefined;
    organization_id: string;
    created_by?: string | undefined;
    updated_by?: string | undefined;
    created_at: string;
    updated_at: string;
}

export interface AuditCountItem {
    id: string;
    audit_id: string;
    asset_id?: string | undefined;
    consumable_id?: string | undefined;
    warehouse_location_id?: string | undefined;
    expected_quantity: number;
    counted_quantity: number;
    discrepancy: number;
    condition_observed?: string | undefined;
    counted_by?: string | undefined;
    counted_at: string;
    notes?: string | undefined;
    organization_id: string;
    created_at: string;
}

// ─── Composite / Join-Aware Types ───

export interface WarehouseZoneWithLocations extends WarehouseZone {
    warehouse_locations: WarehouseLocation[];
}

export interface WarehouseWithZones {
    id: string;
    name: string;
    type: string;
    status: string;
    warehouse_zones: WarehouseZone[];
}

export interface KitWithItems extends Kit {
    kit_items: (KitItem & {
        assets?:
            | { id: string; name: string; barcode: string; condition: string }
            | null
            | undefined;
        consumables?: { id: string; name: string; sku: string } | null | undefined;
    })[];
}

export interface ShipmentItemWithRefs extends ShipmentItem {
    assets?: { id: string; name: string; barcode: string } | null | undefined;
    consumables?: { id: string; name: string; sku: string } | null | undefined;
    kits?: { id: string; name: string } | null | undefined;
}

export interface LoadPlanWithItems extends LoadPlan {
    vehicles: { id: string; name: string; type: string; license_plate: string } | null;
    load_plan_items: (LoadPlanItem & {
        shipment_items: ShipmentItem | null;
    })[];
}

export interface InventoryAuditWithItems extends InventoryAudit {
    warehouses: { id: string; name: string } | null;
    warehouse_zones: { id: string; name: string } | null;
    audit_count_items: AuditCountItem[];
}

export interface AssetDamageReportWithRefs extends AssetDamageReport {
    assets: { id: string; name: string; barcode: string } | null;
    incidents: { id: string; title: string; number: string } | null;
    projects: { id: string; name: string } | null;
    shipments: { id: string; number: string } | null;
}

export interface MaintenanceScheduleWithAsset extends MaintenanceSchedule {
    assets: { id: string; name: string; category: string } | null;
}

export interface DepreciationScheduleWithRefs extends DepreciationSchedule {
    assets: { id: string; name: string; purchase_price: number; category: string } | null;
    gl_accounts: { id: string; code: string; name: string } | null;
}

export interface InventoryReservationWithRefs extends InventoryReservation {
    assets: { id: string; name: string; barcode: string } | null;
    consumables: { id: string; name: string; sku: string } | null;
    projects: { id: string; name: string } | null;
    user_profiles: { id: string; display_name: string } | null;
}
