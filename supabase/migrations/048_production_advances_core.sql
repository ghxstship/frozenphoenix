-- ============================================================================
-- Migration 048: Production Advances Core
--
-- New tables: production_advances, production_advance_items,
--   advance_status_history, advance_templates
--
-- Dependencies: 047 (catalog tables), 001 (events, vendors, organizations),
--   003 (budgets), 006 (workflow_instances), 019 (inventory_reservations),
--   041 (get_user_org_ids, get_user_admin_org_ids)
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: ENUMS
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
    CREATE TYPE advance_type AS ENUM (
        'pre_event', 'load_in', 'show_day', 'strike', 'post_event'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE advance_status AS ENUM (
        'draft', 'submitted', 'in_review', 'approved',
        'in_progress', 'fulfilled', 'completed', 'cancelled'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE advance_priority AS ENUM (
        'low', 'medium', 'high', 'urgent', 'critical'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE advance_item_status AS ENUM (
        'pending', 'confirmed', 'in_transit', 'delivered',
        'installed', 'operational', 'struck', 'returned', 'complete'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: SEQUENCES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE SEQUENCE IF NOT EXISTS advance_number_seq START 1;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: advance_templates
-- Reusable order templates with JSONB template_items array.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS advance_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name            TEXT NOT NULL,
    description     TEXT,
    advance_type    advance_type NOT NULL DEFAULT 'pre_event',
    template_items  JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_public       BOOLEAN NOT NULL DEFAULT false,
    use_count       INTEGER NOT NULL DEFAULT 0,
    tags            TEXT[] DEFAULT '{}',
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_advance_templates_org
    ON advance_templates(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_advance_templates_created_by
    ON advance_templates(created_by) WHERE deleted_at IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: production_advances
-- Core advance (order) table with lifecycle tracking.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS production_advances (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id              UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
    project_id            UUID REFERENCES projects(id) ON DELETE SET NULL,
    submitted_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    point_of_contact      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_by           UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    advance_number        TEXT NOT NULL,
    title                 TEXT NOT NULL,
    description           TEXT,
    advance_type          advance_type NOT NULL DEFAULT 'pre_event',
    status                advance_status NOT NULL DEFAULT 'draft',
    priority              advance_priority NOT NULL DEFAULT 'medium',

    service_start_date    DATE,
    service_end_date      DATE,
    service_duration_days INTEGER GENERATED ALWAYS AS (
        CASE WHEN service_start_date IS NOT NULL AND service_end_date IS NOT NULL
             THEN (service_end_date - service_start_date) + 1
             ELSE NULL
        END
    ) STORED,

    total_estimated_cost  NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_actual_cost     NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_items           INTEGER NOT NULL DEFAULT 0,
    currency              TEXT NOT NULL DEFAULT 'USD',

    workflow_instance_id  UUID REFERENCES workflow_instances(id) ON DELETE SET NULL,
    source_template_id    UUID REFERENCES advance_templates(id) ON DELETE SET NULL,

    client_originated     BOOLEAN NOT NULL DEFAULT false,
    internal_notes        TEXT,
    client_notes          TEXT,
    metadata              JSONB DEFAULT '{}'::jsonb,

    submitted_at          TIMESTAMPTZ,
    approved_at           TIMESTAMPTZ,
    fulfilled_at          TIMESTAMPTZ,
    completed_at          TIMESTAMPTZ,
    cancelled_at          TIMESTAMPTZ,

    deleted_at            TIMESTAMPTZ,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT advances_dates_check CHECK (
        service_end_date IS NULL OR service_start_date IS NULL
        OR service_end_date >= service_start_date
    ),
    CONSTRAINT advances_costs_check CHECK (
        total_estimated_cost >= 0 AND total_actual_cost >= 0
    ),
    CONSTRAINT advances_number_unique UNIQUE (advance_number)
);

CREATE INDEX IF NOT EXISTS idx_production_advances_org
    ON production_advances(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_production_advances_event
    ON production_advances(event_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_production_advances_project
    ON production_advances(project_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_production_advances_status
    ON production_advances(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_production_advances_submitted_by
    ON production_advances(submitted_by) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_production_advances_type
    ON production_advances(advance_type) WHERE deleted_at IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: production_advance_items
-- Line items within an advance with 9-stage lifecycle.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS production_advance_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advance_id          UUID NOT NULL REFERENCES production_advances(id) ON DELETE CASCADE,
    catalog_item_id     UUID NOT NULL REFERENCES catalog_items(id) ON DELETE RESTRICT,
    vendor_id           UUID REFERENCES vendors(id) ON DELETE SET NULL,
    assigned_to         UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    quantity_requested  INTEGER NOT NULL DEFAULT 1,
    quantity_confirmed  INTEGER DEFAULT 0,
    selected_modifiers  JSONB DEFAULT '[]'::jsonb,

    status              advance_item_status NOT NULL DEFAULT 'pending',
    unit_cost           NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_cost          NUMERIC(14,2) GENERATED ALWAYS AS (
        unit_cost * quantity_requested
    ) STORED,

    scheduled_delivery  TIMESTAMPTZ,
    actual_delivery     TIMESTAMPTZ,
    load_in_time        TIMESTAMPTZ,
    strike_time         TIMESTAMPTZ,

    delivery_zone       TEXT,
    delivery_location   TEXT,
    is_critical_path    BOOLEAN NOT NULL DEFAULT false,
    dependencies        UUID[] DEFAULT '{}',
    notes               TEXT,

    budget_line_id      UUID REFERENCES production_budget_lines(id) ON DELETE SET NULL,
    reservation_id      UUID REFERENCES inventory_reservations(id) ON DELETE SET NULL,

    confirmed_at        TIMESTAMPTZ,
    delivered_at        TIMESTAMPTZ,
    installed_at        TIMESTAMPTZ,
    struck_at           TIMESTAMPTZ,
    returned_at         TIMESTAMPTZ,

    deleted_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT advance_items_qty_check CHECK (
        quantity_requested > 0 AND (quantity_confirmed IS NULL OR quantity_confirmed >= 0)
    ),
    CONSTRAINT advance_items_cost_check CHECK (unit_cost >= 0)
);

CREATE INDEX IF NOT EXISTS idx_advance_items_advance
    ON production_advance_items(advance_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_advance_items_catalog
    ON production_advance_items(catalog_item_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_advance_items_vendor
    ON production_advance_items(vendor_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_advance_items_status
    ON production_advance_items(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_advance_items_critical
    ON production_advance_items(advance_id) WHERE is_critical_path = true AND deleted_at IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6: advance_status_history
-- Polymorphic immutable audit trail for advances and advance items.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS advance_status_history (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type   TEXT NOT NULL,
    entity_id     UUID NOT NULL,
    from_status   TEXT,
    to_status     TEXT NOT NULL,
    changed_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reason        TEXT,
    metadata      JSONB DEFAULT '{}'::jsonb,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT advance_history_entity_type CHECK (
        entity_type IN ('advance', 'advance_item')
    )
);

CREATE INDEX IF NOT EXISTS idx_advance_status_history_entity
    ON advance_status_history(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_advance_status_history_created
    ON advance_status_history(created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 7: FUNCTIONS — Auto-generate advance_number
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION generate_advance_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.advance_number IS NULL OR NEW.advance_number = '' THEN
        NEW.advance_number := 'PA-' || extract(year from now())::text || '-' ||
            lpad(nextval('advance_number_seq')::text, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DO $$ BEGIN
    CREATE TRIGGER trg_generate_advance_number
        BEFORE INSERT ON production_advances
        FOR EACH ROW EXECUTE FUNCTION generate_advance_number();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 8: FUNCTIONS — Sync advance totals from items
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION sync_advance_totals()
RETURNS TRIGGER AS $$
DECLARE
    v_advance_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_advance_id := OLD.advance_id;
    ELSE
        v_advance_id := NEW.advance_id;
    END IF;

    UPDATE production_advances
    SET
        total_estimated_cost = COALESCE((
            SELECT SUM(unit_cost * quantity_requested)
            FROM production_advance_items
            WHERE advance_id = v_advance_id AND deleted_at IS NULL
        ), 0),
        total_actual_cost = COALESCE((
            SELECT SUM(unit_cost * COALESCE(quantity_confirmed, quantity_requested))
            FROM production_advance_items
            WHERE advance_id = v_advance_id AND deleted_at IS NULL
              AND status NOT IN ('pending')
        ), 0),
        total_items = COALESCE((
            SELECT count(*)
            FROM production_advance_items
            WHERE advance_id = v_advance_id AND deleted_at IS NULL
        ), 0),
        updated_at = now()
    WHERE id = v_advance_id;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DO $$ BEGIN
    CREATE TRIGGER trg_sync_advance_totals
        AFTER INSERT OR UPDATE OR DELETE ON production_advance_items
        FOR EACH ROW EXECUTE FUNCTION sync_advance_totals();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 9: FUNCTIONS — Log advance status changes
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION log_advance_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO advance_status_history (entity_type, entity_id, from_status, to_status, changed_by, metadata)
        VALUES (
            'advance',
            NEW.id,
            OLD.status::text,
            NEW.status::text,
            auth.uid(),
            jsonb_build_object(
                'advance_number', NEW.advance_number,
                'title', NEW.title,
                'total_estimated_cost', NEW.total_estimated_cost,
                'total_items', NEW.total_items
            )
        );

        -- Set lifecycle timestamps
        CASE NEW.status::text
            WHEN 'submitted' THEN NEW.submitted_at = COALESCE(NEW.submitted_at, now());
            WHEN 'approved' THEN NEW.approved_at = COALESCE(NEW.approved_at, now());
            WHEN 'fulfilled' THEN NEW.fulfilled_at = COALESCE(NEW.fulfilled_at, now());
            WHEN 'completed' THEN NEW.completed_at = COALESCE(NEW.completed_at, now());
            WHEN 'cancelled' THEN NEW.cancelled_at = COALESCE(NEW.cancelled_at, now());
            ELSE NULL;
        END CASE;
    END IF;

    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DO $$ BEGIN
    CREATE TRIGGER trg_log_advance_status_change
        BEFORE UPDATE ON production_advances
        FOR EACH ROW EXECUTE FUNCTION log_advance_status_change();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Log advance item status changes
CREATE OR REPLACE FUNCTION log_advance_item_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO advance_status_history (entity_type, entity_id, from_status, to_status, changed_by, metadata)
        VALUES (
            'advance_item',
            NEW.id,
            OLD.status::text,
            NEW.status::text,
            auth.uid(),
            jsonb_build_object(
                'advance_id', NEW.advance_id,
                'catalog_item_id', NEW.catalog_item_id,
                'quantity_requested', NEW.quantity_requested,
                'unit_cost', NEW.unit_cost
            )
        );

        -- Set lifecycle timestamps on item
        CASE NEW.status::text
            WHEN 'confirmed' THEN NEW.confirmed_at = COALESCE(NEW.confirmed_at, now());
            WHEN 'delivered' THEN NEW.delivered_at = COALESCE(NEW.delivered_at, now());
            WHEN 'installed' THEN NEW.installed_at = COALESCE(NEW.installed_at, now());
            WHEN 'struck' THEN NEW.struck_at = COALESCE(NEW.struck_at, now());
            WHEN 'returned' THEN NEW.returned_at = COALESCE(NEW.returned_at, now());
            ELSE NULL;
        END CASE;
    END IF;

    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DO $$ BEGIN
    CREATE TRIGGER trg_log_advance_item_status_change
        BEFORE UPDATE ON production_advance_items
        FOR EACH ROW EXECUTE FUNCTION log_advance_item_status_change();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 10: FUNCTIONS — Status transition validation (IMMUTABLE)
-- Called by API routes before updating status.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION validate_advance_status_transition(
    p_current advance_status,
    p_new advance_status
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN CASE p_current
        WHEN 'draft'       THEN p_new IN ('submitted', 'cancelled')
        WHEN 'submitted'   THEN p_new IN ('in_review', 'cancelled')
        WHEN 'in_review'   THEN p_new IN ('approved', 'submitted', 'cancelled')
        WHEN 'approved'    THEN p_new IN ('in_progress', 'cancelled')
        WHEN 'in_progress' THEN p_new IN ('fulfilled', 'cancelled')
        WHEN 'fulfilled'   THEN p_new IN ('completed')
        WHEN 'completed'   THEN false
        WHEN 'cancelled'   THEN false
        ELSE false
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION validate_advance_item_status_transition(
    p_current advance_item_status,
    p_new advance_item_status
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN CASE p_current
        WHEN 'pending'     THEN p_new IN ('confirmed', 'complete')
        WHEN 'confirmed'   THEN p_new IN ('in_transit', 'delivered', 'complete')
        WHEN 'in_transit'  THEN p_new IN ('delivered')
        WHEN 'delivered'   THEN p_new IN ('installed', 'operational', 'complete')
        WHEN 'installed'   THEN p_new IN ('operational', 'struck')
        WHEN 'operational' THEN p_new IN ('struck')
        WHEN 'struck'      THEN p_new IN ('returned', 'complete')
        WHEN 'returned'    THEN p_new IN ('complete')
        WHEN 'complete'    THEN false
        ELSE false
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 11: FUNCTIONS — updated_at triggers
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
    CREATE TRIGGER trg_advance_templates_updated_at
        BEFORE UPDATE ON advance_templates
        FOR EACH ROW EXECUTE FUNCTION update_catalog_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 12: ROW-LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE production_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_advance_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE advance_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE advance_templates ENABLE ROW LEVEL SECURITY;

-- production_advances: org members can read
CREATE POLICY production_advances_select ON production_advances
    FOR SELECT TO authenticated
    USING (
        deleted_at IS NULL
        AND organization_id = ANY(get_user_org_ids())
    );

-- production_advances: org members can create drafts
CREATE POLICY production_advances_insert ON production_advances
    FOR INSERT TO authenticated
    WITH CHECK (
        organization_id = ANY(get_user_org_ids())
    );

-- production_advances: submitter or admin can update
CREATE POLICY production_advances_update ON production_advances
    FOR UPDATE TO authenticated
    USING (
        organization_id = ANY(get_user_org_ids())
        AND (
            submitted_by = auth.uid()
            OR organization_id = ANY(get_user_admin_org_ids())
        )
    )
    WITH CHECK (
        organization_id = ANY(get_user_org_ids())
    );

-- production_advances: admin only can delete (soft)
CREATE POLICY production_advances_delete ON production_advances
    FOR DELETE TO authenticated
    USING (
        organization_id = ANY(get_user_admin_org_ids())
    );

-- production_advance_items: inherit from parent advance visibility
CREATE POLICY advance_items_select ON production_advance_items
    FOR SELECT TO authenticated
    USING (
        deleted_at IS NULL
        AND advance_id IN (
            SELECT id FROM production_advances
            WHERE deleted_at IS NULL
            AND organization_id = ANY(get_user_org_ids())
        )
    );

CREATE POLICY advance_items_insert ON production_advance_items
    FOR INSERT TO authenticated
    WITH CHECK (
        advance_id IN (
            SELECT id FROM production_advances
            WHERE organization_id = ANY(get_user_org_ids())
            AND (submitted_by = auth.uid() OR organization_id = ANY(get_user_admin_org_ids()))
        )
    );

CREATE POLICY advance_items_update ON production_advance_items
    FOR UPDATE TO authenticated
    USING (
        advance_id IN (
            SELECT id FROM production_advances
            WHERE organization_id = ANY(get_user_org_ids())
            AND (submitted_by = auth.uid() OR organization_id = ANY(get_user_admin_org_ids()))
        )
    )
    WITH CHECK (
        advance_id IN (
            SELECT id FROM production_advances
            WHERE organization_id = ANY(get_user_org_ids())
        )
    );

CREATE POLICY advance_items_delete ON production_advance_items
    FOR DELETE TO authenticated
    USING (
        advance_id IN (
            SELECT id FROM production_advances
            WHERE organization_id = ANY(get_user_admin_org_ids())
        )
    );

-- advance_status_history: read via org membership (join through advances)
CREATE POLICY advance_history_select ON advance_status_history
    FOR SELECT TO authenticated
    USING (
        (entity_type = 'advance' AND entity_id IN (
            SELECT id FROM production_advances
            WHERE deleted_at IS NULL AND organization_id = ANY(get_user_org_ids())
        ))
        OR
        (entity_type = 'advance_item' AND entity_id IN (
            SELECT pai.id FROM production_advance_items pai
            JOIN production_advances pa ON pa.id = pai.advance_id
            WHERE pa.deleted_at IS NULL AND pa.organization_id = ANY(get_user_org_ids())
        ))
    );

-- advance_status_history: insert only via triggers (system-level)
CREATE POLICY advance_history_insert ON advance_status_history
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- advance_templates: org members read; admin + creator write
CREATE POLICY advance_templates_select ON advance_templates
    FOR SELECT TO authenticated
    USING (
        deleted_at IS NULL
        AND organization_id = ANY(get_user_org_ids())
        AND (is_public = true OR created_by = auth.uid() OR organization_id = ANY(get_user_admin_org_ids()))
    );

CREATE POLICY advance_templates_insert ON advance_templates
    FOR INSERT TO authenticated
    WITH CHECK (
        organization_id = ANY(get_user_org_ids())
    );

CREATE POLICY advance_templates_update ON advance_templates
    FOR UPDATE TO authenticated
    USING (
        organization_id = ANY(get_user_org_ids())
        AND (created_by = auth.uid() OR organization_id = ANY(get_user_admin_org_ids()))
    )
    WITH CHECK (
        organization_id = ANY(get_user_org_ids())
    );

CREATE POLICY advance_templates_delete ON advance_templates
    FOR DELETE TO authenticated
    USING (
        organization_id = ANY(get_user_admin_org_ids())
    );
