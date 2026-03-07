-- ============================================================================
-- Migration 052: External Sync Infrastructure
--
-- New tables: provider_connections, provider_ticket_map, pos_transactions,
--   pos_transaction_items, webhook_events, sync_events, sync_conflict_policies
--
-- Dependencies: 001 (events, vendors, organizations), 020 (foh_zones,
--   live_event_instances), 050 (credential_assignments), 041 (get_user_org_ids)
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: provider_connections
-- Provider credentials + config per org/event.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS provider_connections (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Provider identity
    provider_type     TEXT NOT NULL CHECK (provider_type IN (
        'eventbrite', 'square', 'front_gate', 'intellitix', 'custom'
    )),
    display_name      TEXT NOT NULL,

    -- Scope
    event_id          UUID REFERENCES events(id) ON DELETE SET NULL,

    -- Credentials (encrypted at rest by Supabase)
    api_key           TEXT,
    api_secret        TEXT,
    webhook_secret    TEXT,
    webhook_url       TEXT,

    -- Sync config
    sync_direction    TEXT NOT NULL DEFAULT 'inbound'
                      CHECK (sync_direction IN ('inbound', 'outbound', 'bidirectional')),
    is_active         BOOLEAN NOT NULL DEFAULT true,
    rate_limit_config JSONB DEFAULT '{"requests_per_second": 10}'::jsonb,

    -- Status
    last_sync_at      TIMESTAMPTZ,
    last_error        TEXT,
    error_count       INTEGER NOT NULL DEFAULT 0,

    -- Audit
    created_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_provider_conn_org
    ON provider_connections(organization_id);
CREATE INDEX IF NOT EXISTS idx_provider_conn_event
    ON provider_connections(event_id);
CREATE INDEX IF NOT EXISTS idx_provider_conn_type
    ON provider_connections(provider_type);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: provider_ticket_map
-- Maps provider ticket IDs to COMPVSS credential assignments.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS provider_ticket_map (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    connection_id     UUID NOT NULL REFERENCES provider_connections(id) ON DELETE CASCADE,

    -- External reference
    provider_ticket_id TEXT NOT NULL,
    provider_order_id  TEXT,
    provider_event_id  TEXT,

    -- Internal reference
    assignment_id     UUID REFERENCES credential_assignments(id) ON DELETE SET NULL,

    -- Attendee info from provider
    attendee_name     TEXT,
    attendee_email    TEXT,
    ticket_type       TEXT,

    -- Sync metadata
    raw_payload       JSONB DEFAULT '{}'::jsonb,
    last_synced_at    TIMESTAMPTZ DEFAULT now(),

    -- Audit
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE(connection_id, provider_ticket_id)
);

CREATE INDEX IF NOT EXISTS idx_ticket_map_org
    ON provider_ticket_map(organization_id);
CREATE INDEX IF NOT EXISTS idx_ticket_map_connection
    ON provider_ticket_map(connection_id);
CREATE INDEX IF NOT EXISTS idx_ticket_map_assignment
    ON provider_ticket_map(assignment_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: pos_transactions
-- Normalized POS transaction records from any provider.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pos_transactions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    connection_id           UUID NOT NULL REFERENCES provider_connections(id) ON DELETE CASCADE,

    -- Event context
    event_id                UUID REFERENCES events(id) ON DELETE SET NULL,
    live_event_id           UUID REFERENCES live_event_instances(id) ON DELETE SET NULL,
    foh_zone_id             UUID REFERENCES foh_zones(id) ON DELETE SET NULL,

    -- Transaction identity
    provider_transaction_id TEXT NOT NULL,

    -- Financial
    subtotal                NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_amount              NUMERIC(12,2) NOT NULL DEFAULT 0,
    tip_amount              NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount         NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount            NUMERIC(12,2) NOT NULL DEFAULT 0,
    currency                TEXT NOT NULL DEFAULT 'USD',

    -- Payment
    payment_method          TEXT CHECK (payment_method IN (
        'cash', 'credit_card', 'debit_card', 'mobile', 'rfid', 'comp', 'other'
    )),

    -- Category
    category                TEXT CHECK (category IN (
        'ticket', 'food_beverage', 'merchandise', 'parking', 'vip_upgrade', 'other'
    )),

    -- Vendor / location
    vendor_id               UUID REFERENCES vendors(id) ON DELETE SET NULL,
    terminal_id             TEXT,
    operator_name           TEXT,

    -- Timing
    transaction_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Refund tracking
    is_refund               BOOLEAN NOT NULL DEFAULT false,
    original_transaction_id UUID REFERENCES pos_transactions(id) ON DELETE SET NULL,
    refund_reason           TEXT,

    -- Raw data
    raw_payload             JSONB DEFAULT '{}'::jsonb,

    -- Audit
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE(connection_id, provider_transaction_id)
);

CREATE INDEX IF NOT EXISTS idx_pos_txn_org_event
    ON pos_transactions(organization_id, event_id);
CREATE INDEX IF NOT EXISTS idx_pos_txn_connection
    ON pos_transactions(connection_id);
CREATE INDEX IF NOT EXISTS idx_pos_txn_zone
    ON pos_transactions(foh_zone_id);
CREATE INDEX IF NOT EXISTS idx_pos_txn_category
    ON pos_transactions(category);
CREATE INDEX IF NOT EXISTS idx_pos_txn_time
    ON pos_transactions(transaction_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: pos_transaction_items
-- Line items within POS transactions.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pos_transaction_items (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id    UUID NOT NULL REFERENCES pos_transactions(id) ON DELETE CASCADE,

    -- Item details
    item_name         TEXT NOT NULL,
    item_sku          TEXT,
    category          TEXT,
    quantity          NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit_price        NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_price       NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount   NUMERIC(12,2) NOT NULL DEFAULT 0,

    -- Modifiers
    modifiers         JSONB DEFAULT '[]'::jsonb,

    -- Audit
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pos_items_txn
    ON pos_transaction_items(transaction_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: webhook_events
-- Inbound webhook receipt log with idempotency + retry tracking.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS webhook_events (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    connection_id     UUID NOT NULL REFERENCES provider_connections(id) ON DELETE CASCADE,

    -- Event identity
    provider_event_type TEXT NOT NULL,
    payload_hash      TEXT NOT NULL,
    raw_payload       JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Processing
    status            TEXT NOT NULL DEFAULT 'received'
                      CHECK (status IN ('received', 'processing', 'processed', 'failed', 'skipped')),
    processing_error  TEXT,

    -- Retry
    retry_count       INTEGER NOT NULL DEFAULT 0,
    max_retries       INTEGER NOT NULL DEFAULT 5,
    next_retry_at     TIMESTAMPTZ,

    -- Timing
    received_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at      TIMESTAMPTZ,

    -- Audit (append-only for received_at, status/retry fields mutable by Edge Functions)
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_webhook_events_hash
    ON webhook_events(payload_hash);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status_retry
    ON webhook_events(status, next_retry_at) WHERE status = 'failed';
CREATE INDEX IF NOT EXISTS idx_webhook_events_connection
    ON webhook_events(connection_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6: sync_events
-- Bidirectional sync audit log.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sync_events (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    connection_id     UUID NOT NULL REFERENCES provider_connections(id) ON DELETE CASCADE,

    -- Sync details
    direction         TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    entity_type       TEXT NOT NULL,
    entity_id         UUID,
    provider_entity_id TEXT,

    -- Status
    status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'conflict')),
    error_message     TEXT,

    -- Stats
    records_processed INTEGER DEFAULT 0,
    records_failed    INTEGER DEFAULT 0,
    duration_ms       INTEGER,

    -- Conflict resolution
    conflict_field    TEXT,
    conflict_local    TEXT,
    conflict_remote   TEXT,
    resolution        TEXT,

    -- Audit (immutable)
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sync_events_connection_time
    ON sync_events(connection_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_events_status
    ON sync_events(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 7: sync_conflict_policies
-- Declarative per-field conflict resolution rules.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sync_conflict_policies (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    connection_id     UUID NOT NULL REFERENCES provider_connections(id) ON DELETE CASCADE,

    -- Policy definition
    entity_type       TEXT NOT NULL,
    field_name        TEXT NOT NULL,
    strategy          TEXT NOT NULL CHECK (strategy IN (
        'provider_wins', 'compvss_wins', 'last_write_wins', 'manual'
    )),

    -- Audit
    created_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE(connection_id, entity_type, field_name)
);

CREATE INDEX IF NOT EXISTS idx_sync_policies_connection
    ON sync_conflict_policies(connection_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 8: TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
    CREATE TRIGGER trg_provider_conn_updated_at
        BEFORE UPDATE ON provider_connections
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_ticket_map_updated_at
        BEFORE UPDATE ON provider_ticket_map
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_sync_policies_updated_at
        BEFORE UPDATE ON sync_conflict_policies
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 9: ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE provider_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_ticket_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_conflict_policies ENABLE ROW LEVEL SECURITY;

-- provider_connections
CREATE POLICY "provider_conn_select" ON provider_connections
    FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );
CREATE POLICY "provider_conn_insert" ON provider_connections
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );
CREATE POLICY "provider_conn_update" ON provider_connections
    FOR UPDATE USING (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );

-- provider_ticket_map
CREATE POLICY "ticket_map_select" ON provider_ticket_map
    FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );
CREATE POLICY "ticket_map_insert" ON provider_ticket_map
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );
CREATE POLICY "ticket_map_update" ON provider_ticket_map
    FOR UPDATE USING (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );

-- pos_transactions (immutable from app perspective — inserts from Edge Functions)
CREATE POLICY "pos_txn_select" ON pos_transactions
    FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );
CREATE POLICY "pos_txn_insert" ON pos_transactions
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );

-- pos_transaction_items (read via join from pos_transactions)
CREATE POLICY "pos_items_select" ON pos_transaction_items
    FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM pos_transactions pt
            WHERE pt.id = pos_transaction_items.transaction_id
            AND pt.organization_id = ANY(get_user_org_ids())
        )
    );
CREATE POLICY "pos_items_insert" ON pos_transaction_items
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM pos_transactions pt
            WHERE pt.id = pos_transaction_items.transaction_id
            AND pt.organization_id = ANY(get_user_org_ids())
        )
    );

-- webhook_events (SELECT + INSERT; status updates via service role)
CREATE POLICY "webhook_events_select" ON webhook_events
    FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );
CREATE POLICY "webhook_events_insert" ON webhook_events
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );

-- sync_events (immutable audit log: SELECT + INSERT)
CREATE POLICY "sync_events_select" ON sync_events
    FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );
CREATE POLICY "sync_events_insert" ON sync_events
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );

-- sync_conflict_policies
CREATE POLICY "sync_policies_select" ON sync_conflict_policies
    FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );
CREATE POLICY "sync_policies_insert" ON sync_conflict_policies
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );
CREATE POLICY "sync_policies_update" ON sync_conflict_policies
    FOR UPDATE USING (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );
