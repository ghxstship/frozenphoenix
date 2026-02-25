-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration 021: Integrated Production Lifecycle
-- ═══════════════════════════════════════════════════════════════════════════════
-- Introduces the vertical-agnostic production kernel:
--   • Production Verticals (registry)
--   • Work Packages (core production work unit)
--   • Work Package Dependencies (cross-vertical)
--   • Bills of Materials (BOMs) + BOM Lines
--   • Production Runs + Run Inputs
--   • QC Gates (quality control checkpoints)
--   • Technical Specifications (structured, queryable)
--   • Rights & Licensing (IP/usage tracking)
--   • Rental Agreements + Lines
--   • Vendor-Vertical Capabilities (junction)
--   • Roll-up views for budget/margin visibility
--
-- Depends on: 003, 012, 016, 018, 019, 020
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- NEW ENUMS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TYPE work_package_status AS ENUM (
    'draft', 'planning', 'approved', 'in_progress', 'qc_review',
    'done', 'rework', 'on_hold', 'cancelled'
);

CREATE TYPE production_run_status AS ENUM (
    'setup', 'in_progress', 'qc_pending', 'passed', 'rework',
    'rejected', 'completed', 'waste_logged'
);

CREATE TYPE bom_type AS ENUM (
    'assembly', 'recipe', 'print_spec', 'media_package', 'kit', 'bundle'
);

CREATE TYPE bom_item_type AS ENUM (
    'asset', 'consumable', 'sub_bom', 'labor', 'service', 'rental'
);

CREATE TYPE bom_status AS ENUM (
    'draft', 'active', 'superseded', 'archived'
);

CREATE TYPE qc_gate_type AS ENUM (
    'design_review', 'engineering_stamp', 'client_approval',
    'brand_compliance', 'safety_inspection', 'health_inspection',
    'color_proof', 'sound_check', 'broadcast_standards',
    'structural_inspection', 'fire_marshal', 'rights_clearance',
    'general_qc'
);

CREATE TYPE qc_gate_status AS ENUM (
    'pending', 'in_review', 'passed', 'conditional_pass',
    'rework', 'failed', 'waived'
);

CREATE TYPE rights_type AS ENUM (
    'music_sync', 'music_master', 'music_performance',
    'image_rights', 'talent_likeness', 'content_distribution',
    'software_license', 'font_license', 'stock_media',
    'patent', 'trademark'
);

CREATE TYPE rights_status AS ENUM (
    'pending_clearance', 'cleared', 'denied', 'expired', 'renewal_needed'
);

CREATE TYPE rental_agreement_type AS ENUM (
    'rental', 'sale', 'rental_to_own', 'consignment'
);

CREATE TYPE rental_agreement_status AS ENUM (
    'draft', 'quoted', 'confirmed', 'active', 'returned', 'closed', 'disputed'
);

CREATE TYPE wp_dependency_type AS ENUM (
    'finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- EXTEND EXISTING ENUMS
-- ─────────────────────────────────────────────────────────────────────────────

-- department: add verticals not yet covered
ALTER TYPE department ADD VALUE IF NOT EXISTS 'media';
ALTER TYPE department ADD VALUE IF NOT EXISTS 'music';
ALTER TYPE department ADD VALUE IF NOT EXISTS 'tv_film';
ALTER TYPE department ADD VALUE IF NOT EXISTS 'touring';
ALTER TYPE department ADD VALUE IF NOT EXISTS 'conference';
ALTER TYPE department ADD VALUE IF NOT EXISTS 'community';
ALTER TYPE department ADD VALUE IF NOT EXISTS 'experiential';
ALTER TYPE department ADD VALUE IF NOT EXISTS 'decor_props';
ALTER TYPE department ADD VALUE IF NOT EXISTS 'merchandise';
ALTER TYPE department ADD VALUE IF NOT EXISTS 'broadcast';
ALTER TYPE department ADD VALUE IF NOT EXISTS 'post_production';
ALTER TYPE department ADD VALUE IF NOT EXISTS 'engineering';
ALTER TYPE department ADD VALUE IF NOT EXISTS 'electrical';
ALTER TYPE department ADD VALUE IF NOT EXISTS 'plumbing';
ALTER TYPE department ADD VALUE IF NOT EXISTS 'carpentry';
ALTER TYPE department ADD VALUE IF NOT EXISTS 'welding';
ALTER TYPE department ADD VALUE IF NOT EXISTS 'painting';

-- budget_category: add production-specific categories
ALTER TYPE budget_category ADD VALUE IF NOT EXISTS 'talent_buyout';
ALTER TYPE budget_category ADD VALUE IF NOT EXISTS 'licensing_fees';
ALTER TYPE budget_category ADD VALUE IF NOT EXISTS 'music_rights';
ALTER TYPE budget_category ADD VALUE IF NOT EXISTS 'raw_ingredients';
ALTER TYPE budget_category ADD VALUE IF NOT EXISTS 'packaging';
ALTER TYPE budget_category ADD VALUE IF NOT EXISTS 'pos_fees';
ALTER TYPE budget_category ADD VALUE IF NOT EXISTS 'health_permits';
ALTER TYPE budget_category ADD VALUE IF NOT EXISTS 'rf_coordination';
ALTER TYPE budget_category ADD VALUE IF NOT EXISTS 'generator_fuel';
ALTER TYPE budget_category ADD VALUE IF NOT EXISTS 'waste_disposal';
ALTER TYPE budget_category ADD VALUE IF NOT EXISTS 'styling';
ALTER TYPE budget_category ADD VALUE IF NOT EXISTS 'photography';
ALTER TYPE budget_category ADD VALUE IF NOT EXISTS 'videography';
ALTER TYPE budget_category ADD VALUE IF NOT EXISTS 'editing';
ALTER TYPE budget_category ADD VALUE IF NOT EXISTS 'color_grade';
ALTER TYPE budget_category ADD VALUE IF NOT EXISTS 'sound_design';
ALTER TYPE budget_category ADD VALUE IF NOT EXISTS 'manufacturing';
ALTER TYPE budget_category ADD VALUE IF NOT EXISTS 'fulfillment';
ALTER TYPE budget_category ADD VALUE IF NOT EXISTS 'sampling';

-- project_type: add new project types
ALTER TYPE project_type ADD VALUE IF NOT EXISTS 'concert';
ALTER TYPE project_type ADD VALUE IF NOT EXISTS 'theater';
ALTER TYPE project_type ADD VALUE IF NOT EXISTS 'conference';
ALTER TYPE project_type ADD VALUE IF NOT EXISTS 'trade_show';
ALTER TYPE project_type ADD VALUE IF NOT EXISTS 'community_event';
ALTER TYPE project_type ADD VALUE IF NOT EXISTS 'film';
ALTER TYPE project_type ADD VALUE IF NOT EXISTS 'tv_series';
ALTER TYPE project_type ADD VALUE IF NOT EXISTS 'music_album';
ALTER TYPE project_type ADD VALUE IF NOT EXISTS 'music_single';
ALTER TYPE project_type ADD VALUE IF NOT EXISTS 'print_campaign';
ALTER TYPE project_type ADD VALUE IF NOT EXISTS 'product_launch';
ALTER TYPE project_type ADD VALUE IF NOT EXISTS 'pop_up';
ALTER TYPE project_type ADD VALUE IF NOT EXISTS 'immersive';
ALTER TYPE project_type ADD VALUE IF NOT EXISTS 'catering';
ALTER TYPE project_type ADD VALUE IF NOT EXISTS 'wedding';
ALTER TYPE project_type ADD VALUE IF NOT EXISTS 'gala';

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: production_verticals
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE production_verticals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            TEXT NOT NULL,
    name            TEXT NOT NULL,
    description     TEXT,
    phase_definitions JSONB NOT NULL DEFAULT '[]'::jsonb,
    default_qc_gates  JSONB NOT NULL DEFAULT '[]'::jsonb,
    applicable_budget_categories TEXT[] NOT NULL DEFAULT '{}',
    icon            TEXT,
    color           TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (organization_id, code)
);

CREATE INDEX idx_production_verticals_org ON production_verticals(organization_id);
CREATE INDEX idx_production_verticals_code ON production_verticals(code);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: boms (Bill of Materials — master data)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE boms (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            TEXT NOT NULL,
    name            TEXT NOT NULL,
    description     TEXT,
    bom_type        bom_type NOT NULL,
    vertical_id     UUID REFERENCES production_verticals(id) ON DELETE SET NULL,
    version         INTEGER NOT NULL DEFAULT 1,
    status          bom_status NOT NULL DEFAULT 'draft',
    yield_factor    NUMERIC(5,4) NOT NULL DEFAULT 1.0,
    unit_of_measure TEXT,
    output_quantity NUMERIC(10,2),
    estimated_cost  NUMERIC(12,2) DEFAULT 0,
    is_template     BOOLEAN NOT NULL DEFAULT false,
    parent_bom_id   UUID REFERENCES boms(id) ON DELETE SET NULL,
    digital_asset_id UUID,
    notes           TEXT,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
    updated_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (organization_id, code)
);

CREATE INDEX idx_boms_org ON boms(organization_id);
CREATE INDEX idx_boms_vertical ON boms(vertical_id);
CREATE INDEX idx_boms_type ON boms(bom_type);
CREATE INDEX idx_boms_status ON boms(status);
CREATE INDEX idx_boms_template ON boms(is_template) WHERE is_template = true;
CREATE INDEX idx_boms_parent ON boms(parent_bom_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: bom_lines
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE bom_lines (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bom_id          UUID NOT NULL REFERENCES boms(id) ON DELETE CASCADE,
    line_number     INTEGER NOT NULL,
    item_type       bom_item_type NOT NULL,
    asset_id        UUID,
    consumable_id   UUID,
    sub_bom_id      UUID REFERENCES boms(id) ON DELETE SET NULL,
    description     TEXT,
    quantity        NUMERIC(10,4) NOT NULL DEFAULT 1,
    unit_of_measure TEXT,
    unit_cost       NUMERIC(12,4) DEFAULT 0,
    waste_factor    NUMERIC(5,4) NOT NULL DEFAULT 0,
    is_critical     BOOLEAN NOT NULL DEFAULT false,
    approved_alternates UUID[] DEFAULT '{}',
    notes           TEXT,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (bom_id, line_number)
);

CREATE INDEX idx_bom_lines_bom ON bom_lines(bom_id);
CREATE INDEX idx_bom_lines_item_type ON bom_lines(item_type);
CREATE INDEX idx_bom_lines_asset ON bom_lines(asset_id);
CREATE INDEX idx_bom_lines_consumable ON bom_lines(consumable_id);
CREATE INDEX idx_bom_lines_sub_bom ON bom_lines(sub_bom_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: work_packages
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE work_packages (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id              UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    vertical_id             UUID REFERENCES production_verticals(id) ON DELETE SET NULL,
    parent_work_package_id  UUID REFERENCES work_packages(id) ON DELETE SET NULL,
    code                    TEXT,
    title                   TEXT NOT NULL,
    description             TEXT,
    work_package_type       TEXT,
    phase                   TEXT,
    status                  work_package_status NOT NULL DEFAULT 'draft',
    priority                task_priority NOT NULL DEFAULT 'medium',
    estimated_hours         NUMERIC(8,2),
    actual_hours            NUMERIC(8,2) DEFAULT 0,
    estimated_cost          NUMERIC(12,2),
    actual_cost             NUMERIC(12,2) DEFAULT 0,
    start_date              DATE,
    due_date                DATE,
    completed_at            TIMESTAMPTZ,
    lead_id                 UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewer_id             UUID REFERENCES profiles(id) ON DELETE SET NULL,
    vendor_id               UUID,
    location_id             UUID,
    activation_id           UUID,
    event_id                UUID,
    budget_line_id          UUID,
    bom_id                  UUID REFERENCES boms(id) ON DELETE SET NULL,
    campaign_id             UUID,
    tags                    TEXT[] DEFAULT '{}',
    metadata                JSONB DEFAULT '{}'::jsonb,
    organization_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by              UUID REFERENCES profiles(id) ON DELETE SET NULL,
    updated_by              UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_work_packages_project ON work_packages(project_id);
CREATE INDEX idx_work_packages_vertical ON work_packages(vertical_id);
CREATE INDEX idx_work_packages_parent ON work_packages(parent_work_package_id);
CREATE INDEX idx_work_packages_status ON work_packages(status);
CREATE INDEX idx_work_packages_priority ON work_packages(priority);
CREATE INDEX idx_work_packages_lead ON work_packages(lead_id);
CREATE INDEX idx_work_packages_reviewer ON work_packages(reviewer_id);
CREATE INDEX idx_work_packages_bom ON work_packages(bom_id);
CREATE INDEX idx_work_packages_org ON work_packages(organization_id);
CREATE INDEX idx_work_packages_type ON work_packages(work_package_type);
CREATE INDEX idx_work_packages_phase ON work_packages(phase);
CREATE INDEX idx_work_packages_dates ON work_packages(start_date, due_date);
CREATE INDEX idx_work_packages_location ON work_packages(location_id);
CREATE INDEX idx_work_packages_event ON work_packages(event_id);
CREATE INDEX idx_work_packages_activation ON work_packages(activation_id);
CREATE INDEX idx_work_packages_budget_line ON work_packages(budget_line_id);
CREATE INDEX idx_work_packages_tags ON work_packages USING gin(tags);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: work_package_dependencies
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE work_package_dependencies (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_package_id     UUID NOT NULL REFERENCES work_packages(id) ON DELETE CASCADE,
    depends_on_id       UUID NOT NULL REFERENCES work_packages(id) ON DELETE CASCADE,
    dependency_type     wp_dependency_type NOT NULL DEFAULT 'finish_to_start',
    lag_hours           NUMERIC(8,2) DEFAULT 0,
    is_hard             BOOLEAN NOT NULL DEFAULT true,
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (work_package_id, depends_on_id),
    CHECK (work_package_id != depends_on_id)
);

CREATE INDEX idx_wp_deps_wp ON work_package_dependencies(work_package_id);
CREATE INDEX idx_wp_deps_depends ON work_package_dependencies(depends_on_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: production_runs
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE production_runs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_package_id     UUID NOT NULL REFERENCES work_packages(id) ON DELETE CASCADE,
    bom_id              UUID NOT NULL REFERENCES boms(id) ON DELETE RESTRICT,
    run_number          TEXT NOT NULL,
    status              production_run_status NOT NULL DEFAULT 'setup',
    planned_quantity    NUMERIC(10,2) NOT NULL,
    actual_output       NUMERIC(10,2) DEFAULT 0,
    waste_quantity      NUMERIC(10,2) DEFAULT 0,
    yield_percent       NUMERIC(5,2) GENERATED ALWAYS AS (
        CASE WHEN planned_quantity > 0
            THEN ROUND((actual_output / planned_quantity) * 100, 2)
            ELSE 0
        END
    ) STORED,
    batch_number        TEXT,
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    operator_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
    location_id         UUID,
    equipment_ids       UUID[] DEFAULT '{}',
    notes               TEXT,
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by          UUID REFERENCES profiles(id) ON DELETE SET NULL,
    updated_by          UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_prod_runs_wp ON production_runs(work_package_id);
CREATE INDEX idx_prod_runs_bom ON production_runs(bom_id);
CREATE INDEX idx_prod_runs_status ON production_runs(status);
CREATE INDEX idx_prod_runs_operator ON production_runs(operator_id);
CREATE INDEX idx_prod_runs_org ON production_runs(organization_id);
CREATE INDEX idx_prod_runs_batch ON production_runs(batch_number);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: production_run_inputs
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE production_run_inputs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_run_id   UUID NOT NULL REFERENCES production_runs(id) ON DELETE CASCADE,
    bom_line_id         UUID REFERENCES bom_lines(id) ON DELETE SET NULL,
    item_type           bom_item_type NOT NULL,
    asset_id            UUID,
    consumable_id       UUID,
    planned_quantity    NUMERIC(10,4) NOT NULL DEFAULT 0,
    actual_quantity     NUMERIC(10,4) NOT NULL DEFAULT 0,
    waste_quantity      NUMERIC(10,4) DEFAULT 0,
    unit_cost           NUMERIC(12,4) DEFAULT 0,
    substitution_reason TEXT,
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pri_run ON production_run_inputs(production_run_id);
CREATE INDEX idx_pri_bom_line ON production_run_inputs(bom_line_id);
CREATE INDEX idx_pri_asset ON production_run_inputs(asset_id);
CREATE INDEX idx_pri_consumable ON production_run_inputs(consumable_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: qc_gates
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE qc_gates (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_package_id     UUID REFERENCES work_packages(id) ON DELETE CASCADE,
    production_run_id   UUID REFERENCES production_runs(id) ON DELETE CASCADE,
    gate_type           qc_gate_type NOT NULL,
    sequence            INTEGER NOT NULL DEFAULT 1,
    title               TEXT NOT NULL,
    description         TEXT,
    status              qc_gate_status NOT NULL DEFAULT 'pending',
    required            BOOLEAN NOT NULL DEFAULT true,
    reviewer_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at         TIMESTAMPTZ,
    conditions          TEXT,
    attachments         UUID[] DEFAULT '{}',
    compliance_doc_id   UUID,
    permit_id           UUID,
    next_gate_id        UUID REFERENCES qc_gates(id) ON DELETE SET NULL,
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by          UUID REFERENCES profiles(id) ON DELETE SET NULL,
    updated_by          UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (work_package_id IS NOT NULL OR production_run_id IS NOT NULL)
);

CREATE INDEX idx_qc_gates_wp ON qc_gates(work_package_id);
CREATE INDEX idx_qc_gates_run ON qc_gates(production_run_id);
CREATE INDEX idx_qc_gates_type ON qc_gates(gate_type);
CREATE INDEX idx_qc_gates_status ON qc_gates(status);
CREATE INDEX idx_qc_gates_reviewer ON qc_gates(reviewer_id);
CREATE INDEX idx_qc_gates_org ON qc_gates(organization_id);
CREATE INDEX idx_qc_gates_required_pending ON qc_gates(work_package_id, status) WHERE required = true AND status NOT IN ('passed', 'conditional_pass', 'waived');

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: technical_specs
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE technical_specs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type     TEXT NOT NULL,
    entity_id       UUID NOT NULL,
    spec_category   TEXT NOT NULL,
    spec_key        TEXT NOT NULL,
    spec_value      TEXT,
    unit            TEXT,
    min_value       NUMERIC,
    max_value       NUMERIC,
    tolerance       NUMERIC,
    is_required     BOOLEAN NOT NULL DEFAULT false,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (entity_type, entity_id, spec_category, spec_key, organization_id)
);

CREATE INDEX idx_tech_specs_entity ON technical_specs(entity_type, entity_id);
CREATE INDEX idx_tech_specs_category ON technical_specs(spec_category);
CREATE INDEX idx_tech_specs_key ON technical_specs(spec_key);
CREATE INDEX idx_tech_specs_org ON technical_specs(organization_id);
CREATE INDEX idx_tech_specs_value ON technical_specs(spec_key, spec_value);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: rights_licenses
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE rights_licenses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID REFERENCES projects(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    rights_type     rights_type NOT NULL,
    status          rights_status NOT NULL DEFAULT 'pending_clearance',
    licensor        TEXT,
    licensee_org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    territory       TEXT[] DEFAULT '{}',
    medium          TEXT[] DEFAULT '{}',
    start_date      DATE,
    end_date        DATE,
    fee_type        TEXT,
    fee_amount      NUMERIC(12,2) DEFAULT 0,
    royalty_rate    NUMERIC(5,4),
    usage_limit     INTEGER,
    usage_count     INTEGER NOT NULL DEFAULT 0,
    contract_id     UUID,
    digital_asset_id UUID,
    clearance_notes TEXT,
    auto_renew      BOOLEAN NOT NULL DEFAULT false,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
    updated_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rights_project ON rights_licenses(project_id);
CREATE INDEX idx_rights_type ON rights_licenses(rights_type);
CREATE INDEX idx_rights_status ON rights_licenses(status);
CREATE INDEX idx_rights_org ON rights_licenses(organization_id);
CREATE INDEX idx_rights_end_date ON rights_licenses(end_date);
CREATE INDEX idx_rights_expiring ON rights_licenses(end_date, status) WHERE status = 'cleared' AND end_date IS NOT NULL;
CREATE INDEX idx_rights_territory ON rights_licenses USING gin(territory);
CREATE INDEX idx_rights_medium ON rights_licenses USING gin(medium);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: rental_agreements
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE rental_agreements (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id          UUID REFERENCES projects(id) ON DELETE SET NULL,
    agreement_number    TEXT NOT NULL,
    agreement_type      rental_agreement_type NOT NULL DEFAULT 'rental',
    status              rental_agreement_status NOT NULL DEFAULT 'draft',
    client_id           UUID,
    contact_id          UUID,
    event_date          DATE,
    pickup_date         DATE,
    return_date         DATE,
    actual_return_date  DATE,
    subtotal            NUMERIC(12,2) DEFAULT 0,
    tax_amount          NUMERIC(12,2) DEFAULT 0,
    damage_charges      NUMERIC(12,2) DEFAULT 0,
    total_amount        NUMERIC(12,2) DEFAULT 0,
    deposit_amount      NUMERIC(12,2) DEFAULT 0,
    deposit_paid        BOOLEAN NOT NULL DEFAULT false,
    notes               TEXT,
    stylist_id          UUID REFERENCES profiles(id) ON DELETE SET NULL,
    location_id         UUID,
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by          UUID REFERENCES profiles(id) ON DELETE SET NULL,
    updated_by          UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (organization_id, agreement_number)
);

CREATE INDEX idx_rental_agreements_project ON rental_agreements(project_id);
CREATE INDEX idx_rental_agreements_status ON rental_agreements(status);
CREATE INDEX idx_rental_agreements_type ON rental_agreements(agreement_type);
CREATE INDEX idx_rental_agreements_org ON rental_agreements(organization_id);
CREATE INDEX idx_rental_agreements_client ON rental_agreements(client_id);
CREATE INDEX idx_rental_agreements_dates ON rental_agreements(pickup_date, return_date);
CREATE INDEX idx_rental_agreements_stylist ON rental_agreements(stylist_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: rental_agreement_lines
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE rental_agreement_lines (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_agreement_id     UUID NOT NULL REFERENCES rental_agreements(id) ON DELETE CASCADE,
    asset_id                UUID,
    description             TEXT,
    quantity                INTEGER NOT NULL DEFAULT 1,
    unit_price              NUMERIC(12,2) NOT NULL DEFAULT 0,
    rental_days             INTEGER,
    line_total              NUMERIC(12,2) GENERATED ALWAYS AS (
        quantity * unit_price * COALESCE(rental_days, 1)
    ) STORED,
    condition_out           asset_condition,
    condition_in            asset_condition,
    damage_notes            TEXT,
    damage_charge           NUMERIC(12,2) NOT NULL DEFAULT 0,
    organization_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ral_agreement ON rental_agreement_lines(rental_agreement_id);
CREATE INDEX idx_ral_asset ON rental_agreement_lines(asset_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: vendor_vertical_capabilities (junction)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE vendor_vertical_capabilities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id       UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    vertical_id     UUID NOT NULL REFERENCES production_verticals(id) ON DELETE CASCADE,
    notes           TEXT,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (vendor_id, vertical_id)
);

CREATE INDEX idx_vvc_vendor ON vendor_vertical_capabilities(vendor_id);
CREATE INDEX idx_vvc_vertical ON vendor_vertical_capabilities(vertical_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- BUDGET ROLL-UP: add cost_code to budget_line_items
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE budget_line_items ADD COLUMN IF NOT EXISTS cost_code TEXT;
ALTER TABLE budget_line_items ADD COLUMN IF NOT EXISTS work_package_id UUID REFERENCES work_packages(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bli_cost_code ON budget_line_items(cost_code);
CREATE INDEX IF NOT EXISTS idx_bli_work_package ON budget_line_items(work_package_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- ROLL-UP VIEWS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW v_work_package_cost_summary AS
SELECT
    wp.id AS work_package_id,
    wp.project_id,
    wp.vertical_id,
    wp.title,
    wp.status,
    wp.estimated_cost AS budgeted,
    wp.actual_cost AS actual,
    COALESCE(wp.estimated_cost, 0) - COALESCE(wp.actual_cost, 0) AS remaining,
    COALESCE(wp.actual_cost, 0) - COALESCE(wp.estimated_cost, 0) AS variance,
    wp.estimated_hours,
    wp.actual_hours,
    CASE WHEN wp.estimated_hours > 0
        THEN ROUND((wp.actual_hours / wp.estimated_hours) * 100, 1)
        ELSE NULL
    END AS hours_efficiency_pct,
    wp.organization_id
FROM work_packages wp;

CREATE OR REPLACE VIEW v_vertical_budget_summary AS
SELECT
    wp.project_id,
    wp.vertical_id,
    pv.code AS vertical_code,
    pv.name AS vertical_name,
    COUNT(wp.id) AS work_package_count,
    COUNT(wp.id) FILTER (WHERE wp.status = 'done') AS completed_count,
    SUM(COALESCE(wp.estimated_cost, 0)) AS total_budgeted,
    SUM(COALESCE(wp.actual_cost, 0)) AS total_actual,
    SUM(COALESCE(wp.estimated_cost, 0)) - SUM(COALESCE(wp.actual_cost, 0)) AS total_variance,
    SUM(COALESCE(wp.estimated_hours, 0)) AS total_estimated_hours,
    SUM(COALESCE(wp.actual_hours, 0)) AS total_actual_hours,
    wp.organization_id
FROM work_packages wp
LEFT JOIN production_verticals pv ON pv.id = wp.vertical_id
GROUP BY wp.project_id, wp.vertical_id, pv.code, pv.name, wp.organization_id;

CREATE OR REPLACE VIEW v_project_production_summary AS
SELECT
    p.id AS project_id,
    p.name AS project_name,
    COUNT(DISTINCT wp.vertical_id) AS active_verticals,
    COUNT(wp.id) AS total_work_packages,
    COUNT(wp.id) FILTER (WHERE wp.status = 'done') AS completed_packages,
    COUNT(wp.id) FILTER (WHERE wp.status IN ('in_progress', 'qc_review', 'rework')) AS active_packages,
    COUNT(qg.id) FILTER (WHERE qg.required = true AND qg.status NOT IN ('passed', 'conditional_pass', 'waived')) AS blocking_gates,
    SUM(COALESCE(wp.estimated_cost, 0)) AS total_budgeted,
    SUM(COALESCE(wp.actual_cost, 0)) AS total_actual,
    p.organization_id
FROM projects p
LEFT JOIN work_packages wp ON wp.project_id = p.id
LEFT JOIN qc_gates qg ON qg.work_package_id = wp.id
GROUP BY p.id, p.name, p.organization_id;

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS POLICIES
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE production_verticals ENABLE ROW LEVEL SECURITY;
ALTER TABLE boms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bom_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_package_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_run_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE qc_gates ENABLE ROW LEVEL SECURITY;
ALTER TABLE technical_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rights_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_agreement_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_vertical_capabilities ENABLE ROW LEVEL SECURITY;

-- org_isolation policies
CREATE POLICY org_isolation ON production_verticals
    USING (organization_id = (SELECT get_user_org_id()));
CREATE POLICY org_isolation ON boms
    USING (organization_id = (SELECT get_user_org_id()));
CREATE POLICY org_isolation ON bom_lines
    USING (organization_id = (SELECT get_user_org_id()));
CREATE POLICY org_isolation ON work_packages
    USING (organization_id = (SELECT get_user_org_id()));
CREATE POLICY org_isolation ON work_package_dependencies
    USING (organization_id = (SELECT get_user_org_id()));
CREATE POLICY org_isolation ON production_runs
    USING (organization_id = (SELECT get_user_org_id()));
CREATE POLICY org_isolation ON production_run_inputs
    USING (organization_id = (SELECT get_user_org_id()));
CREATE POLICY org_isolation ON qc_gates
    USING (organization_id = (SELECT get_user_org_id()));
CREATE POLICY org_isolation ON technical_specs
    USING (organization_id = (SELECT get_user_org_id()));
CREATE POLICY org_isolation ON rights_licenses
    USING (organization_id = (SELECT get_user_org_id()));
CREATE POLICY org_isolation ON rental_agreements
    USING (organization_id = (SELECT get_user_org_id()));
CREATE POLICY org_isolation ON rental_agreement_lines
    USING (organization_id = (SELECT get_user_org_id()));
CREATE POLICY org_isolation ON vendor_vertical_capabilities
    USING (organization_id = (SELECT get_user_org_id()));

-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATED_AT TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TRIGGER set_updated_at BEFORE UPDATE ON production_verticals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON boms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON bom_lines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON work_packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON production_runs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON qc_gates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON technical_specs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON rights_licenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON rental_agreements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON rental_agreement_lines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: Default production verticals (for reference — org-specific)
-- These would be seeded per-organization; this provides the canonical codes.
-- ─────────────────────────────────────────────────────────────────────────────

COMMENT ON TABLE production_verticals IS 'Registry of production verticals (disciplines) with per-vertical phase lifecycles and compliance requirements';
COMMENT ON TABLE work_packages IS 'Core production work unit — scoped by vertical, linked to BOM, QC-gated, cost-attributed';
COMMENT ON TABLE work_package_dependencies IS 'Cross-vertical dependency graph for work packages (FS, SS, FF, SF with lag)';
COMMENT ON TABLE boms IS 'Bill of Materials master data — recipes, assemblies, kits, bundles with versioning';
COMMENT ON TABLE bom_lines IS 'BOM component lines with quantity, cost, waste factor, and approved alternates';
COMMENT ON TABLE production_runs IS 'Execution instance of a BOM tracking yield, waste, and batch traceability';
COMMENT ON TABLE production_run_inputs IS 'Actual material consumption per production run with variance tracking';
COMMENT ON TABLE qc_gates IS 'Quality control checkpoints with multi-outcome results blocking work package advancement';
COMMENT ON TABLE technical_specs IS 'Structured, queryable specification entries for assets, locations, and work packages';
COMMENT ON TABLE rights_licenses IS 'IP and usage rights tracking with territory, medium, fees, and clearance workflow';
COMMENT ON TABLE rental_agreements IS 'Rental/sale agreement lifecycle with pricing, deposits, and damage tracking';
COMMENT ON TABLE rental_agreement_lines IS 'Individual asset lines within a rental agreement with condition tracking';
COMMENT ON TABLE vendor_vertical_capabilities IS 'Junction: vendors to production verticals they can service';
