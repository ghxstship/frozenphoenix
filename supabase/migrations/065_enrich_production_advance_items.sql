-- ============================================================================
-- Migration 065: Enrich Production Advance Items
--
-- Adds new fields to production_advance_items table:
-- - category_id (FK to catalog_categories)
-- - item_specifications (JSONB) for item-specific specs beyond catalog defaults
-- - operational_purpose (TEXT)
-- - special_requests (TEXT)
-- - start_date (DATE) and end_date (DATE) for item-specific service dates
-- - duration_days (INTEGER, generated) for item-specific duration
-- - location_id (FK to locations) for workspace/activation location
--
-- Adds organization-level feature toggles for modifications and extensions.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: Add columns to production_advance_items
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE production_advance_items
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES catalog_categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS item_specifications JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS operational_purpose TEXT,
ADD COLUMN IF NOT EXISTS special_requests TEXT,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS duration_days INTEGER GENERATED ALWAYS AS (
    CASE WHEN start_date IS NOT NULL AND end_date IS NOT NULL
         THEN (end_date - start_date) + 1
         ELSE NULL
    END
) STORED,
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE SET NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: Indexes for new FK columns
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_pai_category
    ON production_advance_items(category_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pai_location
    ON production_advance_items(location_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pai_start_date
    ON production_advance_items(start_date) WHERE deleted_at IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: Date constraint
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE production_advance_items
ADD CONSTRAINT chk_advance_item_dates CHECK (
    end_date IS NULL OR start_date IS NULL
    OR end_date >= start_date
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: Organization-level feature toggles
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS enable_item_modifications BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS enable_item_extensions BOOLEAN NOT NULL DEFAULT TRUE;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: Comment documentation
-- ─────────────────────────────────────────────────────────────────────────────

COMMENT ON COLUMN production_advance_items.category_id IS 'FK to catalog_categories — overrides the category derived from catalog_item_id when set';
COMMENT ON COLUMN production_advance_items.item_specifications IS 'Item-specific specs (JSONB) beyond the catalog item defaults';
COMMENT ON COLUMN production_advance_items.operational_purpose IS 'How this item will be used operationally';
COMMENT ON COLUMN production_advance_items.special_requests IS 'Special handling or configuration requests';
COMMENT ON COLUMN production_advance_items.start_date IS 'Item-level service start date (may differ from advance-level)';
COMMENT ON COLUMN production_advance_items.end_date IS 'Item-level service end date (may differ from advance-level)';
COMMENT ON COLUMN production_advance_items.duration_days IS 'Computed: (end_date - start_date) + 1';
COMMENT ON COLUMN production_advance_items.location_id IS 'Workspace or activation location for this item';
COMMENT ON COLUMN organizations.enable_item_modifications IS 'Org-level toggle to enable catalog modifications (add-ons) on advance items';
COMMENT ON COLUMN organizations.enable_item_extensions IS 'Org-level toggle to enable catalog extensions on advance items';
