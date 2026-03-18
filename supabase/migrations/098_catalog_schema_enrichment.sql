-- ============================================================================
-- Migration 098: Catalog Schema Enrichment for Universal Advance Seed Catalog
--
-- Extends catalog_items with 5-layer normalized fields:
--   L1: UNSPSC classification (on categories)
--   L2: Hierarchical SKU
--   L3: Display name + common name
--   L4: Search aliases (TEXT[])
--   L5: Operational attributes (weather, crew, power, footprint, etc.)
--
-- Extends catalog_categories with classification codes (UNSPSC, NIGP, NAICS).
-- Adds weather_rating enum and pricing_tier enum.
-- Creates catalog_pricing_tiers table for multi-tier, multi-market pricing.
-- Updates search_vector trigger to include new searchable fields.
--
-- Dependencies: 047 (master catalog)
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: NEW ENUMS
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
    CREATE TYPE weather_rating AS ENUM (
        'indoor_only', 'sheltered', 'outdoor_rated', 'all_weather', 'not_applicable'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE pricing_tier AS ENUM (
        'basic', 'standard', 'premium'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: EXTEND catalog_category_type ENUM
-- Add: site, food_beverage, retail, workplace, labor
-- Existing: access, production, technical, hospitality, travel, custom
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TYPE catalog_category_type ADD VALUE IF NOT EXISTS 'site';
ALTER TYPE catalog_category_type ADD VALUE IF NOT EXISTS 'food_beverage';
ALTER TYPE catalog_category_type ADD VALUE IF NOT EXISTS 'retail';
ALTER TYPE catalog_category_type ADD VALUE IF NOT EXISTS 'workplace';
ALTER TYPE catalog_category_type ADD VALUE IF NOT EXISTS 'labor';

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: ENRICH catalog_categories with classification codes
-- UNSPSC, NIGP, NAICS are per-subcategory (depth=2) in the seed taxonomy.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE catalog_categories
ADD COLUMN IF NOT EXISTS unspsc_code   CHAR(8),
ADD COLUMN IF NOT EXISTS nigp_code     VARCHAR(10),
ADD COLUMN IF NOT EXISTS naics_code    VARCHAR(10),
ADD COLUMN IF NOT EXISTS category_code VARCHAR(4),
ADD COLUMN IF NOT EXISTS subcategory_code VARCHAR(4);

COMMENT ON COLUMN catalog_categories.unspsc_code IS 'UNSPSC 8-digit hierarchical classification code';
COMMENT ON COLUMN catalog_categories.nigp_code IS 'NIGP commodity code';
COMMENT ON COLUMN catalog_categories.naics_code IS 'NAICS industry classification code';
COMMENT ON COLUMN catalog_categories.category_code IS '4-char category code for hierarchical SKU (e.g. INFR, AUDI)';
COMMENT ON COLUMN catalog_categories.subcategory_code IS '4-char subcategory code for hierarchical SKU (e.g. FENC, PASY)';

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: ENRICH catalog_items with seed catalog fields
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE catalog_items
ADD COLUMN IF NOT EXISTS hierarchical_sku   VARCHAR(30),
ADD COLUMN IF NOT EXISTS common_name        TEXT,
ADD COLUMN IF NOT EXISTS search_aliases     TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS options            TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS modifiers_summary  TEXT,
ADD COLUMN IF NOT EXISTS prerequisites      TEXT,
ADD COLUMN IF NOT EXISTS pricing_unit       VARCHAR(50),
ADD COLUMN IF NOT EXISTS lead_time_hours    INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS setup_time         TEXT,
ADD COLUMN IF NOT EXISTS strike_time        TEXT,
ADD COLUMN IF NOT EXISTS crew_required      TEXT,
ADD COLUMN IF NOT EXISTS power_requirements TEXT,
ADD COLUMN IF NOT EXISTS footprint          TEXT,
ADD COLUMN IF NOT EXISTS truck_space        TEXT,
ADD COLUMN IF NOT EXISTS weather            weather_rating DEFAULT 'not_applicable',
ADD COLUMN IF NOT EXISTS compliance_tags    TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS sustainability_tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS unspsc_code        CHAR(8);

-- Unique constraint on hierarchical_sku for platform items
CREATE UNIQUE INDEX IF NOT EXISTS idx_catalog_items_hierarchical_sku
    ON catalog_items(hierarchical_sku)
    WHERE hierarchical_sku IS NOT NULL AND deleted_at IS NULL;

-- GIN indexes for array search fields
CREATE INDEX IF NOT EXISTS idx_catalog_items_search_aliases
    ON catalog_items USING GIN(search_aliases) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_catalog_items_compliance_tags
    ON catalog_items USING GIN(compliance_tags) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_catalog_items_sustainability_tags
    ON catalog_items USING GIN(sustainability_tags) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_catalog_items_options
    ON catalog_items USING GIN(options) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_catalog_items_weather
    ON catalog_items(weather) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_catalog_items_unspsc
    ON catalog_items(unspsc_code) WHERE deleted_at IS NULL AND unspsc_code IS NOT NULL;

COMMENT ON COLUMN catalog_items.hierarchical_sku IS 'Taxonomy-encoded SKU: COLL-CATG-SUBC-SEQ (e.g. SITE-INFR-FENC-001)';
COMMENT ON COLUMN catalog_items.common_name IS 'Most recognized industry name for the item';
COMMENT ON COLUMN catalog_items.search_aliases IS 'Alternative names for search index discovery';
COMMENT ON COLUMN catalog_items.options IS 'Available variants and configurations';
COMMENT ON COLUMN catalog_items.modifiers_summary IS 'Free-text summary of add-on configurations (supplements structured catalog_item_modifiers)';
COMMENT ON COLUMN catalog_items.prerequisites IS 'Required dependencies for deployment';
COMMENT ON COLUMN catalog_items.pricing_unit IS 'Unit of measure for pricing (e.g. per section/day, per unit/day)';
COMMENT ON COLUMN catalog_items.lead_time_hours IS 'Minimum booking window in hours';
COMMENT ON COLUMN catalog_items.setup_time IS 'Estimated install duration per unit';
COMMENT ON COLUMN catalog_items.strike_time IS 'Estimated teardown duration per unit';
COMMENT ON COLUMN catalog_items.crew_required IS 'Minimum personnel and certifications needed';
COMMENT ON COLUMN catalog_items.power_requirements IS 'Electrical needs: amps, voltage, phase';
COMMENT ON COLUMN catalog_items.footprint IS 'Physical dimensions per unit';
COMMENT ON COLUMN catalog_items.truck_space IS 'Freight capacity consumed';
COMMENT ON COLUMN catalog_items.weather IS 'Environmental suitability rating';
COMMENT ON COLUMN catalog_items.compliance_tags IS 'Regulatory and certification requirements (OSHA, ADA, etc.)';
COMMENT ON COLUMN catalog_items.sustainability_tags IS 'Environmental profile tags (REUSABLE, COMPOSTABLE, etc.)';
COMMENT ON COLUMN catalog_items.unspsc_code IS 'UNSPSC classification code (denormalized from category for query convenience)';

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: catalog_pricing_tiers
-- Multi-tier, multi-market pricing for catalog items.
-- Each row = one item × one tier × one market.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS catalog_pricing_tiers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    catalog_item_id UUID NOT NULL REFERENCES catalog_items(id) ON DELETE CASCADE,
    tier            pricing_tier NOT NULL,
    currency        TEXT NOT NULL DEFAULT 'USD',
    price_low       NUMERIC(12,2) NOT NULL,
    price_high      NUMERIC(12,2) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT catalog_pricing_tiers_range CHECK (price_high >= price_low),
    CONSTRAINT catalog_pricing_tiers_positive CHECK (price_low >= 0),
    CONSTRAINT catalog_pricing_tiers_unique UNIQUE (catalog_item_id, tier, currency)
);

CREATE INDEX IF NOT EXISTS idx_catalog_pricing_tiers_item
    ON catalog_pricing_tiers(catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_catalog_pricing_tiers_tier
    ON catalog_pricing_tiers(tier, currency);

-- RLS
ALTER TABLE catalog_pricing_tiers ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read pricing (platform data)
CREATE POLICY catalog_pricing_tiers_select ON catalog_pricing_tiers
    FOR SELECT TO authenticated
    USING (true);

-- Only service_role / superadmin can write pricing (platform-managed)
CREATE POLICY catalog_pricing_tiers_insert ON catalog_pricing_tiers
    FOR INSERT TO authenticated
    WITH CHECK (false);

CREATE POLICY catalog_pricing_tiers_update ON catalog_pricing_tiers
    FOR UPDATE TO authenticated
    USING (false)
    WITH CHECK (false);

CREATE POLICY catalog_pricing_tiers_delete ON catalog_pricing_tiers
    FOR DELETE TO authenticated
    USING (false);

-- updated_at trigger
DO $$ BEGIN
    CREATE TRIGGER trg_catalog_pricing_tiers_updated_at
        BEFORE UPDATE ON catalog_pricing_tiers
        FOR EACH ROW EXECUTE FUNCTION update_catalog_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TABLE catalog_pricing_tiers IS 'Multi-tier (Basic/Standard/Premium) × multi-market pricing ranges for catalog items';

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6: UPDATE search_vector TRIGGER
-- Include common_name (weight A) and search_aliases (weight B) in FTS.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION catalog_items_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.common_name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.make, '') || ' ' || coalesce(NEW.model, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(array_to_string(NEW.search_aliases, ' '), '')), 'B') ||
        setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'C') ||
        setweight(to_tsvector('english', coalesce(array_to_string(NEW.compliance_tags, ' '), '')), 'C') ||
        setweight(to_tsvector('english', coalesce(NEW.hierarchical_sku, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 7: Realtime publication for pricing
-- ─────────────────────────────────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE catalog_pricing_tiers;
