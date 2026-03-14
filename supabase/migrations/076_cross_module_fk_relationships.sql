-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION 076: CROSS-MODULE FK RELATIONSHIPS
-- ═══════════════════════════════════════════════════════════════════════════
-- Priority: HIGH — Referential integrity gaps
-- Source: SCHEMA_OPTIMIZATION_AND_ENRICHMENT_PLAN.md §17
-- New FKs: 11 relationships closing cross-module gaps
-- New table: lead_sources (required for deals.source_id FK)
-- Corrections from plan: CRM uses `companies` not `accounts`;
--   role_definitions already has parent_role_id; payroll_batches already has project_id
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 0. Create lead_sources table (required for deals.source_id FK)
--    CRM attribution tracking — how deals enter the pipeline
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE lead_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'other'
      CHECK (category IN ('referral', 'inbound', 'outbound', 'event', 'partner', 'organic', 'paid', 'other')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, name)
);

CREATE INDEX idx_lead_sources_org ON lead_sources(organization_id);

ALTER TABLE lead_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lead_sources_org_read" ON lead_sources
    FOR SELECT USING (
        organization_id = ANY(get_user_org_ids())
    );

CREATE POLICY "lead_sources_org_write" ON lead_sources
    FOR ALL USING (
        organization_id = ANY(get_user_org_ids())
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. budget_line_items → gl_accounts (GAAP cost coding)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE budget_line_items
  ADD COLUMN IF NOT EXISTS gl_account_id UUID REFERENCES gl_accounts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_budget_line_items_gl
  ON budget_line_items(gl_account_id)
  WHERE gl_account_id IS NOT NULL;

COMMENT ON COLUMN budget_line_items.gl_account_id IS
  'FK to gl_accounts — GAAP cost coding for line items.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. purchase_orders → user_profiles (SOX segregation of duties)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE purchase_orders
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN purchase_orders.approved_by IS
  'Approving user — SOX segregation of duties audit trail.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. projects → insurance_policies (COI tracking)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS insurance_policy_id UUID REFERENCES insurance_policies(id) ON DELETE SET NULL;

COMMENT ON COLUMN projects.insurance_policy_id IS
  'Primary insurance policy covering this project.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. goods_receipts → warehouse_locations (inventory placement)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE goods_receipts
  ADD COLUMN IF NOT EXISTS warehouse_location_id UUID REFERENCES warehouse_locations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_goods_receipts_warehouse_loc
  ON goods_receipts(warehouse_location_id)
  WHERE warehouse_location_id IS NOT NULL;

COMMENT ON COLUMN goods_receipts.warehouse_location_id IS
  'Inventory placement location within warehouse.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. shifts → locations (spatial scheduling)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE shifts
  ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_shifts_location
  ON shifts(location_id)
  WHERE location_id IS NOT NULL;

COMMENT ON COLUMN shifts.location_id IS
  'Work location for this shift — spatial scheduling.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. stakeholders → companies + contacts (CRM deduplication bridge)
--    Note: CRM uses `companies` not `accounts`
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE stakeholders
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL;

COMMENT ON COLUMN stakeholders.company_id IS
  'CRM company bridge — deduplication link to canonical company record.';
COMMENT ON COLUMN stakeholders.contact_id IS
  'CRM contact bridge — deduplication link to canonical contact record.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. deals → lead_sources + lost_reasons (pipeline attribution + analytics)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS source_id UUID REFERENCES lead_sources(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS lost_reason_id UUID REFERENCES lost_reasons(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_deals_source ON deals(source_id) WHERE source_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_deals_lost_reason ON deals(lost_reason_id) WHERE lost_reason_id IS NOT NULL;

COMMENT ON COLUMN deals.source_id IS
  'Lead source attribution — marketing ROI tracking.';
COMMENT ON COLUMN deals.lost_reason_id IS
  'Loss analysis — pipeline conversion optimization.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. brand_kits → user_profiles (approval sign-off)
--    + Re-type client_id from TEXT → UUID FK → companies(id)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE brand_kits
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN brand_kits.approved_by IS
  'Client brand approval sign-off.';

-- Re-type client_id: TEXT → UUID FK
-- Step 1: Add new UUID column
ALTER TABLE brand_kits
  ADD COLUMN IF NOT EXISTS client_company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

COMMENT ON COLUMN brand_kits.client_company_id IS
  'CRM company reference (replaces legacy TEXT client_id).';

-- Note: client_id (TEXT) is retained for backward compatibility.
-- Data migration from client_id → client_company_id should be done
-- in application code after this migration runs.

COMMIT;
