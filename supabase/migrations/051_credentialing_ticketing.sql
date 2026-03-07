-- ============================================================================
-- Migration 050: Credentialing & Ticketing Core
--
-- New tables: credential_types, credential_inventory_pools,
--   credential_assignments, credential_scan_log
--
-- New enums: credential_category, credential_assignment_status
--
-- Dependencies: 020 (foh_zones, vip_guests, live_event_instances),
--   001 (events, crew_members, vendors, organizations, profiles),
--   041 (get_user_org_ids)
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: ENUMS
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
    CREATE TYPE credential_category AS ENUM (
        'artist', 'vip', 'crew', 'media', 'vendor',
        'general_admission', 'production', 'security',
        'medical', 'hospitality', 'sponsor'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE credential_assignment_status AS ENUM (
        'requested', 'approved', 'issued',
        'checked_in', 'checked_out',
        'revoked', 'expired'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: credential_types
-- Defines credential/pass categories per organization.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS credential_types (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Definition
    name              TEXT NOT NULL,
    category          credential_category NOT NULL,
    description       TEXT,
    tier_level        INTEGER NOT NULL DEFAULT 0,
    color_hex         TEXT,

    -- Access defaults
    default_zone_access TEXT[] DEFAULT '{}',
    format            TEXT NOT NULL DEFAULT 'badge'
                      CHECK (format IN ('wristband', 'badge', 'lanyard', 'digital', 'rfid', 'ticket')),

    -- State
    is_active         BOOLEAN NOT NULL DEFAULT true,

    -- Audit
    created_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE(organization_id, name)
);

CREATE INDEX IF NOT EXISTS idx_credential_types_org
    ON credential_types(organization_id);
CREATE INDEX IF NOT EXISTS idx_credential_types_category
    ON credential_types(category);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: credential_inventory_pools
-- Finite inventory per credential type per event.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS credential_inventory_pools (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    credential_type_id  UUID NOT NULL REFERENCES credential_types(id) ON DELETE CASCADE,
    event_id            UUID REFERENCES events(id) ON DELETE SET NULL,
    live_event_id       UUID REFERENCES live_event_instances(id) ON DELETE SET NULL,

    -- Capacity
    total_quantity      INTEGER NOT NULL DEFAULT 0
                        CHECK (total_quantity >= 0),
    allocated_count     INTEGER NOT NULL DEFAULT 0
                        CHECK (allocated_count >= 0),

    -- Validity window
    valid_from          TIMESTAMPTZ,
    valid_until         TIMESTAMPTZ,

    -- Notes
    notes               TEXT,

    -- Audit
    created_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT pool_allocated_within_total CHECK (allocated_count <= total_quantity),
    CONSTRAINT pool_validity_range CHECK (valid_until IS NULL OR valid_from IS NULL OR valid_until >= valid_from)
);

CREATE INDEX IF NOT EXISTS idx_cred_pools_org_event
    ON credential_inventory_pools(organization_id, event_id);
CREATE INDEX IF NOT EXISTS idx_cred_pools_type
    ON credential_inventory_pools(credential_type_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: credential_assignments
-- Assigns credentials to contacts with full lifecycle tracking.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS credential_assignments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    pool_id             UUID NOT NULL REFERENCES credential_inventory_pools(id) ON DELETE CASCADE,
    credential_type_id  UUID NOT NULL REFERENCES credential_types(id) ON DELETE CASCADE,

    -- Polymorphic assignee (one of these should be set)
    profile_id          UUID REFERENCES profiles(id) ON DELETE SET NULL,
    crew_member_id      UUID REFERENCES crew_members(id) ON DELETE SET NULL,
    vip_guest_id        UUID REFERENCES vip_guests(id) ON DELETE SET NULL,
    vendor_id           UUID REFERENCES vendors(id) ON DELETE SET NULL,

    -- Assignee display name (denormalized for fast gate lookup)
    assignee_name       TEXT NOT NULL,
    assignee_email      TEXT,

    -- Credential identifiers
    barcode_value       TEXT NOT NULL,
    rfid_tag            TEXT,

    -- Status
    status              credential_assignment_status NOT NULL DEFAULT 'requested',

    -- Access
    zone_access         TEXT[] DEFAULT '{}',
    valid_from          TIMESTAMPTZ,
    valid_until         TIMESTAMPTZ,

    -- Lifecycle timestamps
    approved_at         TIMESTAMPTZ,
    approved_by         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    issued_at           TIMESTAMPTZ,
    issued_by           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    checked_in_at       TIMESTAMPTZ,
    checked_out_at      TIMESTAMPTZ,
    revoked_at          TIMESTAMPTZ,
    revoked_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    revocation_reason   TEXT,

    -- Sync
    last_synced_at      TIMESTAMPTZ,
    external_id         TEXT,

    -- Notes
    notes               TEXT,

    -- Audit
    created_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT assignment_validity_range CHECK (valid_until IS NULL OR valid_from IS NULL OR valid_until >= valid_from)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cred_assign_barcode
    ON credential_assignments(barcode_value);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cred_assign_rfid
    ON credential_assignments(rfid_tag) WHERE rfid_tag IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cred_assign_org_pool
    ON credential_assignments(organization_id, pool_id);
CREATE INDEX IF NOT EXISTS idx_cred_assign_status
    ON credential_assignments(status);
CREATE INDEX IF NOT EXISTS idx_cred_assign_type
    ON credential_assignments(credential_type_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: credential_scan_log
-- Immutable scan event log (check-in, check-out, verify).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS credential_scan_log (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    assignment_id       UUID NOT NULL REFERENCES credential_assignments(id) ON DELETE CASCADE,

    -- Scan details
    scan_type           TEXT NOT NULL CHECK (scan_type IN ('check_in', 'check_out', 'verify', 'deny')),
    scan_result         TEXT NOT NULL CHECK (scan_result IN ('valid', 'denied', 'expired', 'revoked', 'zone_denied', 'flagged')),

    -- Location
    zone_id             UUID REFERENCES foh_zones(id) ON DELETE SET NULL,
    device_id           TEXT,
    latitude            NUMERIC(10,7),
    longitude           NUMERIC(10,7),

    -- Operator
    scanned_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    scanned_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Notes
    notes               TEXT,

    -- Audit (immutable — created_at only)
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cred_scan_assignment_time
    ON credential_scan_log(assignment_id, scanned_at);
CREATE INDEX IF NOT EXISTS idx_cred_scan_zone
    ON credential_scan_log(zone_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6: TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

-- Auto-update updated_at on mutable tables
CREATE OR REPLACE FUNCTION set_updated_at_credentialing()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DO $$ BEGIN
    CREATE TRIGGER trg_credential_types_updated_at
        BEFORE UPDATE ON credential_types
        FOR EACH ROW EXECUTE FUNCTION set_updated_at_credentialing();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_cred_pools_updated_at
        BEFORE UPDATE ON credential_inventory_pools
        FOR EACH ROW EXECUTE FUNCTION set_updated_at_credentialing();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_cred_assign_updated_at
        BEFORE UPDATE ON credential_assignments
        FOR EACH ROW EXECUTE FUNCTION set_updated_at_credentialing();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Pool allocation tracking: adjust allocated_count on assignment INSERT/UPDATE/DELETE
CREATE OR REPLACE FUNCTION update_pool_allocated_count()
RETURNS TRIGGER AS $$
DECLARE
    active_statuses TEXT[] := ARRAY['requested', 'approved', 'issued', 'checked_in', 'checked_out'];
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.status = ANY(active_statuses) THEN
            UPDATE credential_inventory_pools
            SET allocated_count = allocated_count + 1, updated_at = now()
            WHERE id = NEW.pool_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Status changed: adjust counts
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            -- Was active, now inactive → decrement
            IF (OLD.status = ANY(active_statuses)) AND NOT (NEW.status = ANY(active_statuses)) THEN
                UPDATE credential_inventory_pools
                SET allocated_count = GREATEST(allocated_count - 1, 0), updated_at = now()
                WHERE id = OLD.pool_id;
            -- Was inactive, now active → increment
            ELSIF NOT (OLD.status = ANY(active_statuses)) AND (NEW.status = ANY(active_statuses)) THEN
                UPDATE credential_inventory_pools
                SET allocated_count = allocated_count + 1, updated_at = now()
                WHERE id = NEW.pool_id;
            END IF;
        END IF;
        -- Pool changed (rare but handle it)
        IF OLD.pool_id IS DISTINCT FROM NEW.pool_id THEN
            IF OLD.status = ANY(active_statuses) THEN
                UPDATE credential_inventory_pools
                SET allocated_count = GREATEST(allocated_count - 1, 0), updated_at = now()
                WHERE id = OLD.pool_id;
            END IF;
            IF NEW.status = ANY(active_statuses) THEN
                UPDATE credential_inventory_pools
                SET allocated_count = allocated_count + 1, updated_at = now()
                WHERE id = NEW.pool_id;
            END IF;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.status = ANY(active_statuses) THEN
            UPDATE credential_inventory_pools
            SET allocated_count = GREATEST(allocated_count - 1, 0), updated_at = now()
            WHERE id = OLD.pool_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DO $$ BEGIN
    CREATE TRIGGER trg_cred_assign_pool_count
        AFTER INSERT OR UPDATE OR DELETE ON credential_assignments
        FOR EACH ROW EXECUTE FUNCTION update_pool_allocated_count();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 7: ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE credential_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_inventory_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_scan_log ENABLE ROW LEVEL SECURITY;

-- credential_types
CREATE POLICY "credential_types_select" ON credential_types
    FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );
CREATE POLICY "credential_types_insert" ON credential_types
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );
CREATE POLICY "credential_types_update" ON credential_types
    FOR UPDATE USING (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );

-- credential_inventory_pools
CREATE POLICY "cred_pools_select" ON credential_inventory_pools
    FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );
CREATE POLICY "cred_pools_insert" ON credential_inventory_pools
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );
CREATE POLICY "cred_pools_update" ON credential_inventory_pools
    FOR UPDATE USING (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );

-- credential_assignments
CREATE POLICY "cred_assign_select" ON credential_assignments
    FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );
CREATE POLICY "cred_assign_insert" ON credential_assignments
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );
CREATE POLICY "cred_assign_update" ON credential_assignments
    FOR UPDATE USING (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );

-- credential_scan_log (immutable: SELECT + INSERT only)
CREATE POLICY "cred_scan_select" ON credential_scan_log
    FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );
CREATE POLICY "cred_scan_insert" ON credential_scan_log
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );
