-- ============================================================================
-- Migration 047: Master Catalog (Hybrid: Platform-Standardized + Org Overrides)
--
-- Architecture: Two-layer catalog with platform-standardized taxonomy and
-- per-org pricing/vendor overrides. Enables industry-wide naming standards,
-- platform-wide trend analytics, and vendor benchmarking across orgs.
--
-- New tables:
--   catalog_categories, catalog_items, catalog_item_modifiers,
--   catalog_modifier_options, catalog_org_overrides
--
-- Dependencies: 001 (organizations, vendors), 018 (org_memberships),
--   041 (get_user_org_ids, get_user_admin_org_ids)
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: ENUMS
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
    CREATE TYPE catalog_category_type AS ENUM (
        'access', 'production', 'technical', 'hospitality', 'travel', 'custom'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE catalog_item_status AS ENUM (
        'active', 'discontinued', 'out_of_stock', 'seasonal', 'draft'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE modifier_type AS ENUM (
        'single_select', 'multi_select', 'quantity', 'text', 'boolean'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE price_adjustment_type AS ENUM (
        'flat', 'percentage', 'per_unit'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: catalog_categories
-- 3-level hierarchy (type → category → subcategory) via parent_id self-FK.
-- Platform categories: organization_id IS NULL.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS catalog_categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    parent_id       UUID REFERENCES catalog_categories(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    slug            TEXT NOT NULL,
    category_type   catalog_category_type NOT NULL DEFAULT 'custom',
    description     TEXT,
    icon            TEXT,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    depth           INTEGER NOT NULL DEFAULT 0,
    item_count      INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT catalog_categories_depth_check CHECK (depth >= 0 AND depth <= 2),
    CONSTRAINT catalog_categories_slug_org_unique UNIQUE (organization_id, slug, parent_id)
);

CREATE INDEX IF NOT EXISTS idx_catalog_categories_org
    ON catalog_categories(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_catalog_categories_parent
    ON catalog_categories(parent_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_catalog_categories_type
    ON catalog_categories(category_type) WHERE deleted_at IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: catalog_items
-- Platform items: organization_id IS NULL (canonical taxonomy).
-- Org custom items: organization_id IS NOT NULL, is_custom = true.
-- Full-text search via TSVECTOR with weighted columns.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS catalog_items (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id   UUID REFERENCES organizations(id) ON DELETE CASCADE,
    category_id       UUID NOT NULL REFERENCES catalog_categories(id) ON DELETE RESTRICT,
    name              TEXT NOT NULL,
    description       TEXT,
    sku               TEXT,
    make              TEXT,
    model             TEXT,
    specifications    JSONB DEFAULT '{}'::jsonb,
    tags              TEXT[] DEFAULT '{}',
    default_unit_cost NUMERIC(12,2) DEFAULT 0,
    currency          TEXT NOT NULL DEFAULT 'USD',
    unit_of_measure   TEXT NOT NULL DEFAULT 'each',
    status            catalog_item_status NOT NULL DEFAULT 'active',
    is_custom         BOOLEAN NOT NULL DEFAULT false,
    is_critical_path  BOOLEAN NOT NULL DEFAULT false,
    client_visible    BOOLEAN NOT NULL DEFAULT true,
    image_url         TEXT,
    thumbnail_url     TEXT,
    available_quantity INTEGER DEFAULT 0,
    min_lead_time_days INTEGER DEFAULT 0,
    sort_order        INTEGER NOT NULL DEFAULT 0,
    search_vector     TSVECTOR,
    deleted_at        TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT catalog_items_custom_requires_org CHECK (
        (is_custom = false) OR (is_custom = true AND organization_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_catalog_items_org
    ON catalog_items(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_catalog_items_category
    ON catalog_items(category_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_catalog_items_status
    ON catalog_items(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_catalog_items_search
    ON catalog_items USING GIN(search_vector) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_catalog_items_tags
    ON catalog_items USING GIN(tags) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_catalog_items_sku
    ON catalog_items(sku) WHERE deleted_at IS NULL AND sku IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: catalog_item_modifiers
-- Typed modifier groups (single_select, multi_select, quantity, text, boolean).
-- Platform-level modifiers: organization_id IS NULL.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS catalog_item_modifiers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    catalog_item_id UUID NOT NULL REFERENCES catalog_items(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    description     TEXT,
    modifier_type   modifier_type NOT NULL DEFAULT 'single_select',
    is_required     BOOLEAN NOT NULL DEFAULT false,
    min_selections  INTEGER DEFAULT 0,
    max_selections  INTEGER,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT catalog_modifiers_min_max CHECK (
        max_selections IS NULL OR max_selections >= min_selections
    )
);

CREATE INDEX IF NOT EXISTS idx_catalog_item_modifiers_item
    ON catalog_item_modifiers(catalog_item_id) WHERE deleted_at IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: catalog_modifier_options
-- Per-option price adjustments (flat, percentage, per_unit).
-- Platform-level options define standard choices.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS catalog_modifier_options (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modifier_id          UUID NOT NULL REFERENCES catalog_item_modifiers(id) ON DELETE CASCADE,
    label                TEXT NOT NULL,
    value                TEXT NOT NULL,
    price_adjustment     NUMERIC(12,2) DEFAULT 0,
    adjustment_type      price_adjustment_type NOT NULL DEFAULT 'flat',
    is_default           BOOLEAN NOT NULL DEFAULT false,
    sort_order           INTEGER NOT NULL DEFAULT 0,
    deleted_at           TIMESTAMPTZ,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_catalog_modifier_options_modifier
    ON catalog_modifier_options(modifier_id) WHERE deleted_at IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6: catalog_org_overrides
-- Per-org pricing, vendor preferences, and availability overrides.
-- Junction table: (organization_id, catalog_item_id) UNIQUE.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS catalog_org_overrides (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    catalog_item_id       UUID NOT NULL REFERENCES catalog_items(id) ON DELETE CASCADE,
    unit_cost             NUMERIC(12,2),
    currency              TEXT DEFAULT 'USD',
    preferred_vendor_id   UUID REFERENCES vendors(id) ON DELETE SET NULL,
    available_quantity    INTEGER DEFAULT 0,
    reserved_quantity     INTEGER DEFAULT 0,
    is_active             BOOLEAN NOT NULL DEFAULT true,
    pricing_notes         TEXT,
    lead_time_days        INTEGER DEFAULT 0,
    minimum_order_quantity INTEGER DEFAULT 1,
    deleted_at            TIMESTAMPTZ,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT catalog_org_overrides_unique UNIQUE (organization_id, catalog_item_id),
    CONSTRAINT catalog_org_overrides_qty_check CHECK (
        reserved_quantity >= 0 AND available_quantity >= 0
    ),
    CONSTRAINT catalog_org_overrides_min_order CHECK (minimum_order_quantity >= 1)
);

CREATE INDEX IF NOT EXISTS idx_catalog_org_overrides_org
    ON catalog_org_overrides(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_catalog_org_overrides_item
    ON catalog_org_overrides(catalog_item_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_catalog_org_overrides_vendor
    ON catalog_org_overrides(preferred_vendor_id) WHERE deleted_at IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 7: TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

-- 7a: Auto-update updated_at on all catalog tables
CREATE OR REPLACE FUNCTION update_catalog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
    CREATE TRIGGER trg_catalog_categories_updated_at
        BEFORE UPDATE ON catalog_categories
        FOR EACH ROW EXECUTE FUNCTION update_catalog_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_catalog_items_updated_at
        BEFORE UPDATE ON catalog_items
        FOR EACH ROW EXECUTE FUNCTION update_catalog_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_catalog_item_modifiers_updated_at
        BEFORE UPDATE ON catalog_item_modifiers
        FOR EACH ROW EXECUTE FUNCTION update_catalog_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_catalog_modifier_options_updated_at
        BEFORE UPDATE ON catalog_modifier_options
        FOR EACH ROW EXECUTE FUNCTION update_catalog_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_catalog_org_overrides_updated_at
        BEFORE UPDATE ON catalog_org_overrides
        FOR EACH ROW EXECUTE FUNCTION update_catalog_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 7b: Maintain search_vector on catalog_items
CREATE OR REPLACE FUNCTION catalog_items_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.make, '') || ' ' || coalesce(NEW.model, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
    CREATE TRIGGER trg_catalog_items_search_vector
        BEFORE INSERT OR UPDATE ON catalog_items
        FOR EACH ROW EXECUTE FUNCTION catalog_items_search_vector_update();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 7c: Sync item_count on catalog_categories when items change
CREATE OR REPLACE FUNCTION sync_category_item_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE catalog_categories
        SET item_count = (
            SELECT count(*) FROM catalog_items
            WHERE category_id = NEW.category_id AND deleted_at IS NULL
        )
        WHERE id = NEW.category_id;
    END IF;

    IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.category_id <> NEW.category_id) THEN
        UPDATE catalog_categories
        SET item_count = (
            SELECT count(*) FROM catalog_items
            WHERE category_id = OLD.category_id AND deleted_at IS NULL
        )
        WHERE id = OLD.category_id;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DO $$ BEGIN
    CREATE TRIGGER trg_sync_category_item_count
        AFTER INSERT OR UPDATE OR DELETE ON catalog_items
        FOR EACH ROW EXECUTE FUNCTION sync_category_item_count();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 8: ROW-LEVEL SECURITY
-- Platform catalog: all authenticated users can read; write restricted.
-- Org-scoped tables: read via get_user_org_ids(); write via get_user_admin_org_ids().
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE catalog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_item_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_modifier_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_org_overrides ENABLE ROW LEVEL SECURITY;

-- catalog_categories: read platform (org_id IS NULL) + own org categories
CREATE POLICY catalog_categories_select ON catalog_categories
    FOR SELECT TO authenticated
    USING (
        deleted_at IS NULL
        AND (
            organization_id IS NULL
            OR organization_id = ANY(get_user_org_ids())
        )
    );

-- catalog_categories: write only own org categories (platform managed by superadmin)
CREATE POLICY catalog_categories_insert ON catalog_categories
    FOR INSERT TO authenticated
    WITH CHECK (
        organization_id IS NOT NULL
        AND organization_id = ANY(get_user_admin_org_ids())
    );

CREATE POLICY catalog_categories_update ON catalog_categories
    FOR UPDATE TO authenticated
    USING (
        organization_id IS NOT NULL
        AND organization_id = ANY(get_user_admin_org_ids())
    )
    WITH CHECK (
        organization_id IS NOT NULL
        AND organization_id = ANY(get_user_admin_org_ids())
    );

CREATE POLICY catalog_categories_delete ON catalog_categories
    FOR DELETE TO authenticated
    USING (
        organization_id IS NOT NULL
        AND organization_id = ANY(get_user_admin_org_ids())
    );

-- catalog_items: read platform items + own org items
CREATE POLICY catalog_items_select ON catalog_items
    FOR SELECT TO authenticated
    USING (
        deleted_at IS NULL
        AND (
            organization_id IS NULL
            OR organization_id = ANY(get_user_org_ids())
        )
    );

-- catalog_items: insert only org custom items
CREATE POLICY catalog_items_insert ON catalog_items
    FOR INSERT TO authenticated
    WITH CHECK (
        organization_id IS NOT NULL
        AND organization_id = ANY(get_user_admin_org_ids())
    );

CREATE POLICY catalog_items_update ON catalog_items
    FOR UPDATE TO authenticated
    USING (
        organization_id IS NOT NULL
        AND organization_id = ANY(get_user_admin_org_ids())
    )
    WITH CHECK (
        organization_id IS NOT NULL
        AND organization_id = ANY(get_user_admin_org_ids())
    );

CREATE POLICY catalog_items_delete ON catalog_items
    FOR DELETE TO authenticated
    USING (
        organization_id IS NOT NULL
        AND organization_id = ANY(get_user_admin_org_ids())
    );

-- catalog_item_modifiers: read via parent item visibility
CREATE POLICY catalog_item_modifiers_select ON catalog_item_modifiers
    FOR SELECT TO authenticated
    USING (
        deleted_at IS NULL
        AND (
            organization_id IS NULL
            OR organization_id = ANY(get_user_org_ids())
        )
    );

CREATE POLICY catalog_item_modifiers_insert ON catalog_item_modifiers
    FOR INSERT TO authenticated
    WITH CHECK (
        organization_id IS NOT NULL
        AND organization_id = ANY(get_user_admin_org_ids())
    );

CREATE POLICY catalog_item_modifiers_update ON catalog_item_modifiers
    FOR UPDATE TO authenticated
    USING (
        organization_id IS NOT NULL
        AND organization_id = ANY(get_user_admin_org_ids())
    )
    WITH CHECK (
        organization_id IS NOT NULL
        AND organization_id = ANY(get_user_admin_org_ids())
    );

CREATE POLICY catalog_item_modifiers_delete ON catalog_item_modifiers
    FOR DELETE TO authenticated
    USING (
        organization_id IS NOT NULL
        AND organization_id = ANY(get_user_admin_org_ids())
    );

-- catalog_modifier_options: read via parent modifier visibility
CREATE POLICY catalog_modifier_options_select ON catalog_modifier_options
    FOR SELECT TO authenticated
    USING (
        deleted_at IS NULL
        AND modifier_id IN (
            SELECT id FROM catalog_item_modifiers
            WHERE deleted_at IS NULL
            AND (organization_id IS NULL OR organization_id = ANY(get_user_org_ids()))
        )
    );

CREATE POLICY catalog_modifier_options_insert ON catalog_modifier_options
    FOR INSERT TO authenticated
    WITH CHECK (
        modifier_id IN (
            SELECT id FROM catalog_item_modifiers
            WHERE organization_id IS NOT NULL
            AND organization_id = ANY(get_user_admin_org_ids())
        )
    );

CREATE POLICY catalog_modifier_options_update ON catalog_modifier_options
    FOR UPDATE TO authenticated
    USING (
        modifier_id IN (
            SELECT id FROM catalog_item_modifiers
            WHERE organization_id IS NOT NULL
            AND organization_id = ANY(get_user_admin_org_ids())
        )
    )
    WITH CHECK (
        modifier_id IN (
            SELECT id FROM catalog_item_modifiers
            WHERE organization_id IS NOT NULL
            AND organization_id = ANY(get_user_admin_org_ids())
        )
    );

CREATE POLICY catalog_modifier_options_delete ON catalog_modifier_options
    FOR DELETE TO authenticated
    USING (
        modifier_id IN (
            SELECT id FROM catalog_item_modifiers
            WHERE organization_id IS NOT NULL
            AND organization_id = ANY(get_user_admin_org_ids())
        )
    );

-- catalog_org_overrides: org members read own; admin write own
CREATE POLICY catalog_org_overrides_select ON catalog_org_overrides
    FOR SELECT TO authenticated
    USING (
        deleted_at IS NULL
        AND organization_id = ANY(get_user_org_ids())
    );

CREATE POLICY catalog_org_overrides_insert ON catalog_org_overrides
    FOR INSERT TO authenticated
    WITH CHECK (
        organization_id = ANY(get_user_admin_org_ids())
    );

CREATE POLICY catalog_org_overrides_update ON catalog_org_overrides
    FOR UPDATE TO authenticated
    USING (organization_id = ANY(get_user_admin_org_ids()))
    WITH CHECK (organization_id = ANY(get_user_admin_org_ids()));

CREATE POLICY catalog_org_overrides_delete ON catalog_org_overrides
    FOR DELETE TO authenticated
    USING (organization_id = ANY(get_user_admin_org_ids()));

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 9: SEED PLATFORM CATEGORIES
-- Maps 1:1 to existing budget_category enum from migration 003.
-- Platform categories have organization_id IS NULL.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO catalog_categories (organization_id, name, slug, category_type, description, sort_order, depth)
VALUES
    -- Access
    (NULL, 'Access & Credentials', 'access-credentials', 'access', 'Passes, wristbands, laminates, parking permits', 10, 0),
    (NULL, 'Security & Crowd Management', 'security-crowd', 'access', 'Security personnel, barriers, screening equipment', 20, 0),
    (NULL, 'Ticketing & Entry', 'ticketing-entry', 'access', 'Ticket scanners, turnstiles, box office supplies', 30, 0),

    -- Production
    (NULL, 'Staging & Scenic', 'staging-scenic', 'production', 'Stages, risers, scenic elements, backdrops', 100, 0),
    (NULL, 'Rigging & Structures', 'rigging-structures', 'production', 'Truss, motors, rigging hardware, temporary structures', 110, 0),
    (NULL, 'Power & Distribution', 'power-distribution', 'production', 'Generators, distro boards, cabling, transformers', 120, 0),
    (NULL, 'Fabrication & Signage', 'fabrication-signage', 'production', 'Custom builds, signage, vinyl, print materials', 130, 0),

    -- Technical
    (NULL, 'Audio', 'audio', 'technical', 'PA systems, microphones, monitors, processing', 200, 0),
    (NULL, 'Lighting', 'lighting', 'technical', 'Fixtures, control desks, cable, accessories', 210, 0),
    (NULL, 'Video & LED', 'video-led', 'technical', 'LED walls, projectors, cameras, switching', 220, 0),
    (NULL, 'Communications', 'communications', 'technical', 'Radios, intercom systems, networking', 230, 0),
    (NULL, 'IT & Connectivity', 'it-connectivity', 'technical', 'WiFi, internet, servers, POS systems', 240, 0),
    (NULL, 'Special Effects', 'special-effects', 'technical', 'Pyro, confetti, haze, CO2, lasers', 250, 0),

    -- Hospitality
    (NULL, 'Catering & F&B', 'catering-fb', 'hospitality', 'Food service, bars, equipment, supplies', 300, 0),
    (NULL, 'Furniture & Decor', 'furniture-decor', 'hospitality', 'Tables, chairs, lounge, greenery, draping', 310, 0),
    (NULL, 'VIP & Hospitality', 'vip-hospitality', 'hospitality', 'VIP areas, artist riders, green rooms', 320, 0),
    (NULL, 'Sanitation & Facilities', 'sanitation-facilities', 'hospitality', 'Restrooms, waste management, cleaning', 330, 0),
    (NULL, 'Climate & Comfort', 'climate-comfort', 'hospitality', 'HVAC, fans, heaters, tenting', 340, 0),

    -- Travel
    (NULL, 'Ground Transport', 'ground-transport', 'travel', 'Vehicles, buses, golf carts, forklifts', 400, 0),
    (NULL, 'Accommodation', 'accommodation', 'travel', 'Hotels, housing, green room amenities', 410, 0),
    (NULL, 'Freight & Shipping', 'freight-shipping', 'travel', 'Trucking, air freight, customs, drayage', 420, 0),
    (NULL, 'Crew Services', 'crew-services', 'travel', 'Meals, per diems, parking, uniforms', 430, 0),

    -- Custom (placeholder for org-specific)
    (NULL, 'Miscellaneous', 'miscellaneous', 'custom', 'Uncategorized items and services', 900, 0),
    (NULL, 'Contingency', 'contingency', 'custom', 'Emergency reserves and backup equipment', 910, 0)
ON CONFLICT DO NOTHING;
