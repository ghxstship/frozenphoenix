/* ═══════════════════════════════════════════════════════════════
   FROZEN PHOENIX — Asset, Inventory, Logistics & Warehousing Types
   Migration 018: asset lifecycle, warehouse hierarchy, logistics
   ═══════════════════════════════════════════════════════════════ */

// ─── Enums ───

export type AssetClass =
    | 'capital_equipment' | 'rental_equipment' | 'consumable' | 'tool'
    | 'safety_equipment' | 'scenic_element' | 'technology' | 'vehicle'
    | 'vendor_managed';

export type WarehouseZoneType =
    | 'receiving' | 'storage' | 'staging_outbound' | 'staging_inbound'
    | 'maintenance' | 'quarantine' | 'hazmat' | 'outdoor'
    | 'cold_storage' | 'secure';

export type WarehouseLocationType =
    | 'shelf' | 'floor' | 'pallet' | 'cage' | 'outdoor' | 'rack' | 'bin';

export type ReservationStatus =
    | 'pending' | 'confirmed' | 'checked_out' | 'released' | 'expired' | 'cancelled';

export type ShipmentItemCondition =
    | 'new' | 'excellent' | 'good' | 'fair' | 'needs_repair' | 'damaged' | 'missing';

export type KitStatus = 'draft' | 'active' | 'deployed' | 'retired';

export type ScanType =
    | 'check_in' | 'check_out' | 'transfer' | 'count' | 'receive'
    | 'ship' | 'verify' | 'damage';

export type LoadPlanStatus = 'draft' | 'confirmed' | 'loading' | 'loaded' | 'departed';

export type LogisticsEventType =
    | 'booked' | 'picked_up' | 'in_transit' | 'customs_hold' | 'customs_cleared'
    | 'cross_dock' | 'out_for_delivery' | 'delivered' | 'exception'
    | 'damage_reported' | 'returned';

export type AssetDamageType = 'cosmetic' | 'functional' | 'structural' | 'total_loss' | 'missing';

export type DamageSeverity = 'minor' | 'moderate' | 'major' | 'write_off';

export type DamageResolution = 'pending' | 'repaired' | 'replaced' | 'written_off' | 'insurance_claim';

export type MaintenanceFrequencyType = 'calendar' | 'usage_hours' | 'usage_miles' | 'event_count';

export type MaintenanceFrequencyUnit = 'days' | 'weeks' | 'months' | 'years' | 'hours' | 'miles' | 'events';

export type DepreciationMethod = 'straight_line' | 'declining_balance' | 'units_of_production' | 'sum_of_years';

export type InventoryAuditType = 'full' | 'cycle' | 'spot' | 'annual';

export type InventoryAuditStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

export type DisposalMethod = 'sold' | 'donated' | 'scrapped' | 'returned_to_vendor' | 'transferred' | 'insurance_claim';

export type FuelType = 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'propane' | 'cng' | 'other';

// ─── Warehouse Hierarchy ───

export interface WarehouseZone {
    id: string;
    warehouse_id: string;
    name: string;
    zone_type: WarehouseZoneType;
    description?: string;
    square_footage?: number;
    capacity_units: number;
    capacity_used: number;
    climate_controlled: boolean;
    security_level: string;
    display_order: number;
    is_active: boolean;
    organization_id: string;
    created_by?: string;
    updated_by?: string;
    created_at: string;
    updated_at: string;
}

export interface WarehouseLocation {
    id: string;
    zone_id: string;
    label: string;
    aisle?: string;
    rack?: string;
    bin?: string;
    location_type: WarehouseLocationType;
    max_weight?: number;
    max_weight_unit: string;
    max_dimensions?: { length?: number; width?: number; height?: number; unit?: string };
    is_occupied: boolean;
    is_active: boolean;
    barcode?: string;
    organization_id: string;
    created_at: string;
    updated_at: string;
}

// ─── Inventory Reservations ───

export interface InventoryReservation {
    id: string;
    asset_id?: string;
    consumable_id?: string;
    quantity: number;
    project_id: string;
    activation_id?: string;
    event_id?: string;
    reserved_by: string;
    status: ReservationStatus;
    reserved_from: string;
    reserved_until: string;
    notes?: string;
    priority: number;
    organization_id: string;
    created_at: string;
    updated_at: string;
}

// ─── Shipment Items ───

export interface ShipmentItem {
    id: string;
    shipment_id: string;
    asset_id?: string;
    consumable_id?: string;
    kit_id?: string;
    description?: string;
    quantity: number;
    received_quantity?: number;
    weight?: number;
    weight_unit: string;
    declared_value?: number;
    handling_instructions?: string;
    hs_code?: string;
    condition_at_ship?: ShipmentItemCondition;
    condition_at_receive?: ShipmentItemCondition;
    discrepancy_notes?: string;
    organization_id: string;
    created_at: string;
    updated_at: string;
}

// ─── Kits & Bundles ───

export interface Kit {
    id: string;
    name: string;
    description?: string;
    category?: string;
    is_template: boolean;
    template_id?: string;
    status: KitStatus;
    total_weight?: number;
    total_value?: number;
    barcode?: string;
    organization_id: string;
    created_by?: string;
    updated_by?: string;
    created_at: string;
    updated_at: string;
}

export interface KitItem {
    id: string;
    kit_id: string;
    asset_id?: string;
    consumable_id?: string;
    quantity: number;
    is_required: boolean;
    substitute_notes?: string;
    display_order: number;
    organization_id: string;
    created_at: string;
}

// ─── Scan Events ───

export interface ScanEvent {
    id: string;
    asset_id?: string;
    consumable_id?: string;
    kit_id?: string;
    warehouse_location_id?: string;
    scan_type: ScanType;
    scanned_by: string;
    scanned_at: string;
    location_context?: string;
    device_id?: string;
    latitude?: number;
    longitude?: number;
    notes?: string;
    organization_id: string;
    created_at: string;
}

// ─── Load Plans ───

export interface LoadPlan {
    id: string;
    shipment_id: string;
    vehicle_id: string;
    planned_by?: string;
    status: LoadPlanStatus;
    total_weight: number;
    weight_capacity: number;
    utilization_percent: number;
    departure_datetime?: string;
    load_sequence_notes?: string;
    special_instructions?: string;
    organization_id: string;
    created_by?: string;
    updated_by?: string;
    created_at: string;
    updated_at: string;
}

export interface LoadPlanItem {
    id: string;
    load_plan_id: string;
    shipment_item_id: string;
    load_sequence: number;
    position_notes?: string;
    created_at: string;
}

// ─── Logistics Events ───

export interface LogisticsEvent {
    id: string;
    shipment_id: string;
    event_type: LogisticsEventType;
    occurred_at: string;
    location_text?: string;
    latitude?: number;
    longitude?: number;
    notes?: string;
    reported_by?: string;
    organization_id: string;
    created_at: string;
}

// ─── Asset Damage Reports ───

export interface AssetDamageReport {
    id: string;
    asset_id: string;
    incident_id?: string;
    project_id?: string;
    shipment_id?: string;
    reported_by: string;
    reported_at: string;
    damage_type: AssetDamageType;
    severity: DamageSeverity;
    description: string;
    photo_urls: string[];
    repair_estimate?: number;
    actual_repair_cost?: number;
    resolution: DamageResolution;
    resolved_at?: string;
    resolution_notes?: string;
    insurance_claim_id?: string;
    organization_id: string;
    created_by?: string;
    updated_by?: string;
    created_at: string;
    updated_at: string;
}

// ─── Maintenance Schedules ───

export interface MaintenanceSchedule {
    id: string;
    name: string;
    description?: string;
    asset_id?: string;
    asset_category?: string;
    frequency_type: MaintenanceFrequencyType;
    frequency_value: number;
    frequency_unit: MaintenanceFrequencyUnit;
    estimated_duration_hours?: number;
    estimated_cost?: number;
    requires_certification: boolean;
    certification_type?: string;
    checklist_template: unknown[];
    is_active: boolean;
    organization_id: string;
    created_by?: string;
    updated_by?: string;
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
    last_calculated_at?: string;
    gl_account_id?: string;
    notes?: string;
    organization_id: string;
    created_by?: string;
    updated_by?: string;
    created_at: string;
    updated_at: string;
}

// ─── Inventory Audits ───

export interface InventoryAudit {
    id: string;
    warehouse_id: string;
    zone_id?: string;
    audit_type: InventoryAuditType;
    status: InventoryAuditStatus;
    planned_date: string;
    started_at?: string;
    completed_at?: string;
    conducted_by?: string;
    approved_by?: string;
    total_items_counted: number;
    discrepancy_count: number;
    discrepancy_value: number;
    notes?: string;
    organization_id: string;
    created_by?: string;
    updated_by?: string;
    created_at: string;
    updated_at: string;
}

export interface AuditCountItem {
    id: string;
    audit_id: string;
    asset_id?: string;
    consumable_id?: string;
    warehouse_location_id?: string;
    expected_quantity: number;
    counted_quantity: number;
    discrepancy: number;
    condition_observed?: string;
    counted_by?: string;
    counted_at: string;
    notes?: string;
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
        assets?: { id: string; name: string; barcode: string; condition: string } | null;
        consumables?: { id: string; name: string; sku: string } | null;
    })[];
}

export interface ShipmentItemWithRefs extends ShipmentItem {
    assets?: { id: string; name: string; barcode: string } | null;
    consumables?: { id: string; name: string; sku: string } | null;
    kits?: { id: string; name: string } | null;
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
    profiles: { id: string; name: string } | null;
}
