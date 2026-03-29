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

export type BomType = "assembly" | "recipe" | "print_spec" | "media_package" | "kit" | "bundle";

export type BomItemType = "asset" | "consumable" | "sub_bom" | "labor" | "service" | "rental";

export type BomStatus = "draft" | "active" | "superseded" | "archived";

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

export type RentalAgreementType = "rental" | "sale" | "rental_to_own" | "consignment";

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

export type TechnicalSpecEntityType = "asset" | "location" | "work_package" | "bom" | "bom_line";

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
    description?: string | undefined;
    phase_definitions: VerticalPhaseDefinition[];
    default_qc_gates: QcGateType[];
    applicable_budget_categories: string[];
    icon?: string | undefined;
    color?: string | undefined;
    is_active: boolean;
    organization_id: string;
    created_at: string;
    updated_at: string;
}

export interface WorkPackage {
    id: string;
    project_id: string;
    vertical_id?: string | undefined;
    parent_work_package_id?: string | undefined;
    code?: string | undefined;
    title: string;
    description?: string | undefined;
    work_package_type?: string | undefined;
    phase?: string | undefined;
    status: WorkPackageStatus;
    priority: "low" | "medium" | "high" | "urgent" | "critical";
    estimated_hours?: number | undefined;
    actual_hours: number;
    estimated_cost?: number | undefined;
    actual_cost: number;
    start_date?: string | undefined;
    due_date?: string | undefined;
    completed_at?: string | undefined;
    lead_id?: string | undefined;
    reviewer_id?: string | undefined;
    vendor_id?: string | undefined;
    location_id?: string | undefined;
    activation_id?: string | undefined;
    event_id?: string | undefined;
    budget_line_id?: string | undefined;
    bom_id?: string | undefined;
    campaign_id?: string | undefined;
    tags: string[];
    metadata: Record<string, unknown>;
    organization_id: string;
    created_by?: string | undefined;
    updated_by?: string | undefined;
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
    description?: string | undefined;
    bom_type: BomType;
    vertical_id?: string | undefined;
    version: number;
    status: BomStatus;
    yield_factor: number;
    unit_of_measure?: string | undefined;
    output_quantity?: number | undefined;
    estimated_cost: number;
    is_template: boolean;
    parent_bom_id?: string | undefined;
    digital_asset_id?: string | undefined;
    notes?: string | undefined;
    organization_id: string;
    created_by?: string | undefined;
    updated_by?: string | undefined;
    created_at: string;
    updated_at: string;
}

export interface BomLine {
    id: string;
    bom_id: string;
    line_number: number;
    item_type: BomItemType;
    asset_id?: string | undefined;
    consumable_id?: string | undefined;
    sub_bom_id?: string | undefined;
    description?: string | undefined;
    quantity: number;
    unit_of_measure?: string | undefined;
    unit_cost: number;
    waste_factor: number;
    is_critical: boolean;
    approved_alternates: string[];
    notes?: string | undefined;
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
    batch_number?: string | undefined;
    started_at?: string | undefined;
    completed_at?: string | undefined;
    operator_id?: string | undefined;
    location_id?: string | undefined;

    notes?: string | undefined;
    organization_id: string;
    created_by?: string | undefined;
    updated_by?: string | undefined;
    created_at: string;
    updated_at: string;
}

export interface ProductionRunInput {
    id: string;
    production_run_id: string;
    bom_line_id?: string | undefined;
    item_type: BomItemType;
    asset_id?: string | undefined;
    consumable_id?: string | undefined;
    planned_quantity: number;
    actual_quantity: number;
    waste_quantity: number;
    unit_cost: number;
    substitution_reason?: string | undefined;
    organization_id: string;
    created_at: string;
}

export interface QcGate {
    id: string;
    work_package_id?: string | undefined;
    production_run_id?: string | undefined;
    gate_type: QcGateType;
    sequence: number;
    title: string;
    description?: string | undefined;
    status: QcGateStatus;
    required: boolean;
    reviewer_id?: string | undefined;
    reviewed_at?: string | undefined;
    conditions?: string | undefined;
    attachments: string[];
    compliance_doc_id?: string | undefined;
    permit_id?: string | undefined;
    next_gate_id?: string | undefined;
    organization_id: string;
    created_by?: string | undefined;
    updated_by?: string | undefined;
    created_at: string;
    updated_at: string;
}

export interface TechnicalSpec {
    id: string;
    entity_type: TechnicalSpecEntityType;
    entity_id: string;
    spec_category: SpecCategory;
    spec_key: string;
    spec_value?: string | undefined;
    unit?: string | undefined;
    min_value?: number | undefined;
    max_value?: number | undefined;
    tolerance?: number | undefined;
    is_required: boolean;
    organization_id: string;
    created_at: string;
    updated_at: string;
}

export interface RightsLicense {
    id: string;
    project_id?: string | undefined;
    title: string;
    rights_type: RightsType;
    status: RightsLicenseStatus;
    licensor?: string | undefined;
    licensee_org_id?: string | undefined;
    territory: string[];
    medium: string[];
    start_date?: string | undefined;
    end_date?: string | undefined;
    fee_type?: string | undefined;
    fee_amount: number;
    royalty_rate?: number | undefined;
    usage_limit?: number | undefined;
    usage_count: number;
    contract_id?: string | undefined;
    digital_asset_id?: string | undefined;
    clearance_notes?: string | undefined;
    auto_renew: boolean;
    organization_id: string;
    created_by?: string | undefined;
    updated_by?: string | undefined;
    created_at: string;
    updated_at: string;
}

export interface RentalAgreement {
    id: string;
    project_id?: string | undefined;
    agreement_number: string;
    agreement_type: RentalAgreementType;
    status: RentalAgreementStatus;
    client_id?: string | undefined;
    contact_id?: string | undefined;
    event_date?: string | undefined;
    pickup_date?: string | undefined;
    return_date?: string | undefined;
    actual_return_date?: string | undefined;
    subtotal: number;
    tax_amount: number;
    damage_charges: number;
    total_amount: number;
    deposit_amount: number;
    deposit_paid: boolean;
    notes?: string | undefined;
    stylist_id?: string | undefined;
    location_id?: string | undefined;
    organization_id: string;
    created_by?: string | undefined;
    updated_by?: string | undefined;
    created_at: string;
    updated_at: string;
}

export interface RentalAgreementLine {
    id: string;
    rental_agreement_id: string;
    asset_id?: string | undefined;
    description?: string | undefined;
    quantity: number;
    unit_price: number;
    rental_days?: number | undefined;
    line_total: number;
    condition_out?: string | undefined;
    condition_in?: string | undefined;
    damage_notes?: string | undefined;
    damage_charge: number;
    organization_id: string;
    created_at: string;
    updated_at: string;
}

export interface VendorVerticalCapability {
    id: string;
    vendor_id: string;
    vertical_id: string;
    notes?: string | undefined;
    organization_id: string;
    created_at: string;
}

// ─── View Types ────────────────────────────────────────────────

export interface WorkPackageCostSummary {
    work_package_id: string;
    project_id: string;
    vertical_id?: string | undefined;
    title: string;
    status: WorkPackageStatus;
    budgeted: number;
    actual: number;
    remaining: number;
    variance: number;
    estimated_hours?: number | undefined;
    actual_hours?: number | undefined;
    hours_efficiency_pct?: number | undefined;
    organization_id: string;
}

export interface VerticalBudgetSummary {
    project_id: string;
    vertical_id?: string | undefined;
    vertical_code?: string | undefined;
    vertical_name?: string | undefined;
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
    vertical?: ProductionVertical | undefined;
    bom?: Bom | undefined;
    qc_gates?: QcGate[] | undefined;
    dependencies?: WorkPackageDependency[] | undefined;
    dependents?: WorkPackageDependency[] | undefined;
    production_runs?: ProductionRun[] | undefined;
    children?: WorkPackage[] | undefined;
}

export interface BomWithLines extends Bom {
    lines: BomLine[];
    vertical?: ProductionVertical | undefined;
}

export interface ProductionRunWithInputs extends ProductionRun {
    inputs: ProductionRunInput[];
    bom?: Bom | undefined;
    work_package?: WorkPackage | undefined;
}

export interface RentalAgreementWithLines extends RentalAgreement {
    lines: RentalAgreementLine[];
}

export interface QcGateWithContext extends QcGate {
    work_package?: WorkPackage | undefined;
    production_run?: ProductionRun | undefined;
}
