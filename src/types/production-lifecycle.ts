/* ═══════════════════════════════════════════════════════════════
   PRODUCTION LIFECYCLE — Integrated Multi-Vertical Types
   Migration 021: Integrated Production Lifecycle
   ═══════════════════════════════════════════════════════════════
   
   Covers:
   - Production Verticals (registry)
   - Work Packages (core production work unit)
   - Work Package Dependencies (cross-vertical)
   - Bills of Materials (BOMs) + BOM Lines
   - Production Runs + Run Inputs
   - QC Gates (quality control checkpoints)
   - Technical Specifications (structured, queryable)
   - Rights & Licensing (IP/usage tracking)
   - Rental Agreements + Lines
   - Vendor-Vertical Capabilities (junction)
   ═══════════════════════════════════════════════════════════════ */

// ─── Enums ─────────────────────────────────────────────────────

export type WorkPackageStatus =
    | "draft"
    | "planning"
    | "approved"
    | "in_progress"
    | "qc_review"
    | "done"
    | "rework"
    | "on_hold"
    | "cancelled";

export type ProductionRunStatus =
    | "setup"
    | "in_progress"
    | "qc_pending"
    | "passed"
    | "rework"
    | "rejected"
    | "completed"
    | "waste_logged";

export type BomType =
    | "assembly"
    | "recipe"
    | "print_spec"
    | "media_package"
    | "kit"
    | "bundle";

export type BomItemType =
    | "asset"
    | "consumable"
    | "sub_bom"
    | "labor"
    | "service"
    | "rental";

export type BomStatus =
    | "draft"
    | "active"
    | "superseded"
    | "archived";

export type QcGateType =
    | "design_review"
    | "engineering_stamp"
    | "client_approval"
    | "brand_compliance"
    | "safety_inspection"
    | "health_inspection"
    | "color_proof"
    | "sound_check"
    | "broadcast_standards"
    | "structural_inspection"
    | "fire_marshal"
    | "rights_clearance"
    | "general_qc";

export type QcGateStatus =
    | "pending"
    | "in_review"
    | "passed"
    | "conditional_pass"
    | "rework"
    | "failed"
    | "waived";

export type RightsType =
    | "music_sync"
    | "music_master"
    | "music_performance"
    | "image_rights"
    | "talent_likeness"
    | "content_distribution"
    | "software_license"
    | "font_license"
    | "stock_media"
    | "patent"
    | "trademark";

export type RightsLicenseStatus =
    | "pending_clearance"
    | "cleared"
    | "denied"
    | "expired"
    | "renewal_needed";

export type RentalAgreementType =
    | "rental"
    | "sale"
    | "rental_to_own"
    | "consignment";

export type RentalAgreementStatus =
    | "draft"
    | "quoted"
    | "confirmed"
    | "active"
    | "returned"
    | "closed"
    | "disputed";

export type WorkPackageDependencyType =
    | "finish_to_start"
    | "start_to_start"
    | "finish_to_finish"
    | "start_to_finish";

export type ProductionVerticalCode =
    | "site_dev"
    | "fabrication"
    | "technical"
    | "media"
    | "music"
    | "tv_film"
    | "touring"
    | "conference"
    | "community"
    | "print"
    | "experiential"
    | "decor_props"
    | "merchandise"
    | "food_beverage";

export type SpecCategory =
    | "electrical"
    | "structural"
    | "audio"
    | "video"
    | "lighting"
    | "rigging"
    | "rf"
    | "network"
    | "environmental"
    | "dimensional"
    | "print"
    | "culinary";

export type TechnicalSpecEntityType =
    | "asset"
    | "location"
    | "work_package"
    | "bom"
    | "bom_line";

// ─── Interfaces ────────────────────────────────────────────────

export interface VerticalPhaseDefinition {
    code: string;
    label: string;
    order: number;
}

export interface ProductionVertical {
    id: string;
    code: ProductionVerticalCode;
    name: string;
    description?: string;
    phase_definitions: VerticalPhaseDefinition[];
    default_qc_gates: QcGateType[];
    applicable_budget_categories: string[];
    icon?: string;
    color?: string;
    is_active: boolean;
    organization_id: string;
    created_at: string;
    updated_at: string;
}

export interface WorkPackage {
    id: string;
    project_id: string;
    vertical_id?: string;
    parent_work_package_id?: string;
    code?: string;
    title: string;
    description?: string;
    work_package_type?: string;
    phase?: string;
    status: WorkPackageStatus;
    priority: "low" | "medium" | "high" | "urgent" | "critical";
    estimated_hours?: number;
    actual_hours: number;
    estimated_cost?: number;
    actual_cost: number;
    start_date?: string;
    due_date?: string;
    completed_at?: string;
    lead_id?: string;
    reviewer_id?: string;
    vendor_id?: string;
    location_id?: string;
    activation_id?: string;
    event_id?: string;
    budget_line_id?: string;
    bom_id?: string;
    campaign_id?: string;
    tags: string[];
    metadata: Record<string, unknown>;
    organization_id: string;
    created_by?: string;
    updated_by?: string;
    created_at: string;
    updated_at: string;
}

export interface WorkPackageDependency {
    id: string;
    work_package_id: string;
    depends_on_id: string;
    dependency_type: WorkPackageDependencyType;
    lag_hours: number;
    is_hard: boolean;
    organization_id: string;
    created_at: string;
}

export interface Bom {
    id: string;
    code: string;
    name: string;
    description?: string;
    bom_type: BomType;
    vertical_id?: string;
    version: number;
    status: BomStatus;
    yield_factor: number;
    unit_of_measure?: string;
    output_quantity?: number;
    estimated_cost: number;
    is_template: boolean;
    parent_bom_id?: string;
    digital_asset_id?: string;
    notes?: string;
    organization_id: string;
    created_by?: string;
    updated_by?: string;
    created_at: string;
    updated_at: string;
}

export interface BomLine {
    id: string;
    bom_id: string;
    line_number: number;
    item_type: BomItemType;
    asset_id?: string;
    consumable_id?: string;
    sub_bom_id?: string;
    description?: string;
    quantity: number;
    unit_of_measure?: string;
    unit_cost: number;
    waste_factor: number;
    is_critical: boolean;
    approved_alternates: string[];
    notes?: string;
    organization_id: string;
    created_at: string;
    updated_at: string;
}

export interface ProductionRun {
    id: string;
    work_package_id: string;
    bom_id: string;
    run_number: string;
    status: ProductionRunStatus;
    planned_quantity: number;
    actual_output: number;
    waste_quantity: number;
    yield_percent: number;
    batch_number?: string;
    started_at?: string;
    completed_at?: string;
    operator_id?: string;
    location_id?: string;
    equipment_ids: string[];
    notes?: string;
    organization_id: string;
    created_by?: string;
    updated_by?: string;
    created_at: string;
    updated_at: string;
}

export interface ProductionRunInput {
    id: string;
    production_run_id: string;
    bom_line_id?: string;
    item_type: BomItemType;
    asset_id?: string;
    consumable_id?: string;
    planned_quantity: number;
    actual_quantity: number;
    waste_quantity: number;
    unit_cost: number;
    substitution_reason?: string;
    organization_id: string;
    created_at: string;
}

export interface QcGate {
    id: string;
    work_package_id?: string;
    production_run_id?: string;
    gate_type: QcGateType;
    sequence: number;
    title: string;
    description?: string;
    status: QcGateStatus;
    required: boolean;
    reviewer_id?: string;
    reviewed_at?: string;
    conditions?: string;
    attachments: string[];
    compliance_doc_id?: string;
    permit_id?: string;
    next_gate_id?: string;
    organization_id: string;
    created_by?: string;
    updated_by?: string;
    created_at: string;
    updated_at: string;
}

export interface TechnicalSpec {
    id: string;
    entity_type: TechnicalSpecEntityType;
    entity_id: string;
    spec_category: SpecCategory;
    spec_key: string;
    spec_value?: string;
    unit?: string;
    min_value?: number;
    max_value?: number;
    tolerance?: number;
    is_required: boolean;
    organization_id: string;
    created_at: string;
    updated_at: string;
}

export interface RightsLicense {
    id: string;
    project_id?: string;
    title: string;
    rights_type: RightsType;
    status: RightsLicenseStatus;
    licensor?: string;
    licensee_org_id?: string;
    territory: string[];
    medium: string[];
    start_date?: string;
    end_date?: string;
    fee_type?: string;
    fee_amount: number;
    royalty_rate?: number;
    usage_limit?: number;
    usage_count: number;
    contract_id?: string;
    digital_asset_id?: string;
    clearance_notes?: string;
    auto_renew: boolean;
    organization_id: string;
    created_by?: string;
    updated_by?: string;
    created_at: string;
    updated_at: string;
}

export interface RentalAgreement {
    id: string;
    project_id?: string;
    agreement_number: string;
    agreement_type: RentalAgreementType;
    status: RentalAgreementStatus;
    client_id?: string;
    contact_id?: string;
    event_date?: string;
    pickup_date?: string;
    return_date?: string;
    actual_return_date?: string;
    subtotal: number;
    tax_amount: number;
    damage_charges: number;
    total_amount: number;
    deposit_amount: number;
    deposit_paid: boolean;
    notes?: string;
    stylist_id?: string;
    location_id?: string;
    organization_id: string;
    created_by?: string;
    updated_by?: string;
    created_at: string;
    updated_at: string;
}

export interface RentalAgreementLine {
    id: string;
    rental_agreement_id: string;
    asset_id?: string;
    description?: string;
    quantity: number;
    unit_price: number;
    rental_days?: number;
    line_total: number;
    condition_out?: string;
    condition_in?: string;
    damage_notes?: string;
    damage_charge: number;
    organization_id: string;
    created_at: string;
    updated_at: string;
}

export interface VendorVerticalCapability {
    id: string;
    vendor_id: string;
    vertical_id: string;
    notes?: string;
    organization_id: string;
    created_at: string;
}

// ─── View Types ────────────────────────────────────────────────

export interface WorkPackageCostSummary {
    work_package_id: string;
    project_id: string;
    vertical_id?: string;
    title: string;
    status: WorkPackageStatus;
    budgeted: number;
    actual: number;
    remaining: number;
    variance: number;
    estimated_hours?: number;
    actual_hours?: number;
    hours_efficiency_pct?: number;
    organization_id: string;
}

export interface VerticalBudgetSummary {
    project_id: string;
    vertical_id?: string;
    vertical_code?: string;
    vertical_name?: string;
    work_package_count: number;
    completed_count: number;
    total_budgeted: number;
    total_actual: number;
    total_variance: number;
    total_estimated_hours: number;
    total_actual_hours: number;
    organization_id: string;
}

export interface ProjectProductionSummary {
    project_id: string;
    project_name: string;
    active_verticals: number;
    total_work_packages: number;
    completed_packages: number;
    active_packages: number;
    blocking_gates: number;
    total_budgeted: number;
    total_actual: number;
    organization_id: string;
}

// ─── Composite Types ───────────────────────────────────────────

export interface WorkPackageWithRelations extends WorkPackage {
    vertical?: ProductionVertical;
    bom?: Bom;
    qc_gates?: QcGate[];
    dependencies?: WorkPackageDependency[];
    dependents?: WorkPackageDependency[];
    production_runs?: ProductionRun[];
    children?: WorkPackage[];
}

export interface BomWithLines extends Bom {
    lines: BomLine[];
    vertical?: ProductionVertical;
}

export interface ProductionRunWithInputs extends ProductionRun {
    inputs: ProductionRunInput[];
    bom?: Bom;
    work_package?: WorkPackage;
}

export interface RentalAgreementWithLines extends RentalAgreement {
    lines: RentalAgreementLine[];
}

export interface QcGateWithContext extends QcGate {
    work_package?: WorkPackage;
    production_run?: ProductionRun;
}
