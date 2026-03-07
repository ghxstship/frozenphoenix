# Ticketing, Credentialing & POS Integration Audit

**Date:** 2025-01-27
**Scope:** Codebase + schema audit for (A) internal ticketing/credentialing inventory management and (B) two-way sync with external ticketing providers and POS systems.
**Platform:** COMPVSS (FrozenPhoenix) — Next.js 15 + Supabase

---

## Executive Summary

The platform has **strong partial foundations** for credentialing and POS but **no dedicated ticketing/credential domain tables**. Existing live-ops infrastructure (`vip_guests`, `foh_zones`, `foh_zone_readings`, `live_crew_assignments`, `scan_events`, `inventory_reservations`) provides patterns and some direct reuse, but the core credential lifecycle — type definitions, inventory pools, assignment engine, and barcode/QR references — is entirely absent. External integration infrastructure is minimal: a single `integrations` table scoped to accounting/productivity tools with no webhook receiver, sync log, or provider-specific mapping layer.

**Estimated new tables:** 12 (Workstream A: 5, Workstream B: 7)
**Estimated new columns on existing tables:** 0 (no breaking changes)
**Estimated new Edge Functions:** 4
**Estimated new API routes:** 8
**Estimated new UI pages:** 6

---

## WORKSTREAM A — Internal Ticketing & Credentialing Inventory

### A.1 Gap Analysis Table

| # | Feature | Status | Current Location | Recommendation |
|---|---------|--------|-----------------|----------------|
| A1 | **Credential/Pass Types** — Define credential categories (Artist, VIP, Crew, Media, Vendor, GA) with tier levels, access zones, validity windows | `PARTIAL` | `vip_tier` enum (bronze/silver/gold/platinum) in `020_live_event_operations.sql`; `foh_zone_type` enum (entry/general/vip/stage/fb/merch/amenity/medical/parking/accessibility); `vip_guests.tier` + `vip_guests.zone_access` | VIP-only. No unified credential type taxonomy. No validity windows on types. **→ New `credential_types` table + `credential_category` enum** |
| A2 | **Inventory Pools** — Finite inventories per credential type per event with allocation tracking | `PARTIAL` | `inventory_reservations` table in `019_asset_inventory_logistics_warehousing.sql` provides the pattern (status lifecycle, time-bound, quantity). `live_event_instances.venue_capacity` / `permitted_capacity` for event-level caps | Pattern exists but is asset-scoped, not credential-scoped. No per-type-per-event pool. **→ New `credential_inventory_pools` table** |
| A3 | **Assignment Engine** — Assign credentials to contacts with status lifecycle (requested → approved → issued → checked_in → revoked) | `PARTIAL` | `vip_guests.status` (expected/arrived/in_venue/departed) — 4 states, VIP-only. `live_crew_assignments.credentials_verified` — boolean only. `scan_events.scan_type` (check_in/check_out/verify) — immutable audit log | No unified assignment table across all contact types. Status lifecycle is incomplete and siloed. **→ New `credential_assignments` table + `credential_assignment_status` enum** |
| A4 | **Bulk Operations** — CSV/XLSX import + bulk assignment | `MISSING` | `data-export/page.tsx` supports JSON/CSV export (mock only). No import infrastructure. No CSV/XLSX parsing library in `package.json` | **→ New bulk import API route + client-side parser (papaparse + xlsx). New `bulk_import_jobs` table for tracking** |
| A5 | **Export Pipeline** — Configurable manifests per provider (Eventbrite, RFID, Intellitix, Front Gate) | `PARTIAL` | `data-export/page.tsx` — generic export page (JSON/CSV, mock). No provider-specific templates. No PDF generation | Export page exists as shell. No credential-specific export, no provider templates, no XLSX/PDF. **→ New `export_templates` table + export API route with configurable formatters** |
| A6 | **On-Site Views** — Real-time dashboard for gate staff with credential validation, check-in counts by zone, flagged entries | `PARTIAL` | `live-ops/foh/page.tsx` — shows zone occupancy, entry rates, queue lengths, sales. `live-ops/vip/page.tsx` — VIP guest list with status, zone access. `foh_zone_readings` table — has `occupancy_count`, `entry_rate`. `scan_events` — immutable check-in log | FOH dashboard shows zone metrics but has no credential validation view. VIP page is VIP-only. No gate-staff-specific view, no revocation flagging, no barcode/QR scan interface. **→ New `/live-ops/credentials` page + `/live-ops/gate` page** |

### A.2 Proposed Schema Additions

#### New Enums

```sql
-- Broad credential categories beyond VIP
CREATE TYPE credential_category AS ENUM (
    'artist', 'vip', 'crew', 'media', 'vendor', 'general_admission',
    'production', 'security', 'medical', 'hospitality', 'sponsor'
);

-- Full lifecycle status for credential assignments
CREATE TYPE credential_assignment_status AS ENUM (
    'requested', 'approved', 'issued', 'checked_in', 'checked_out', 'revoked', 'expired'
);

-- Bulk import job status
CREATE TYPE bulk_job_status AS ENUM (
    'pending', 'validating', 'processing', 'completed', 'failed', 'cancelled'
);
```

#### Table: `credential_types`

Defines the taxonomy of credential/pass categories available per organization. Decoupled from events so types are reusable across events.

```sql
CREATE TABLE credential_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Definition
    name TEXT NOT NULL,                          -- e.g. "Artist All-Access", "VIP Gold"
    category credential_category NOT NULL,
    tier_level INTEGER NOT NULL DEFAULT 0,       -- 0 = base, higher = more access
    description TEXT,
    color_hex TEXT,                               -- For wristband/badge color coding
    icon_key TEXT,                                -- Lucide icon identifier

    -- Access
    default_zone_access TEXT[] DEFAULT '{}',      -- Default foh_zone names granted
    backstage_access BOOLEAN DEFAULT false,
    requires_escort BOOLEAN DEFAULT false,

    -- Validity
    default_valid_from_offset INTERVAL,           -- e.g. '-2 hours' before event start
    default_valid_until_offset INTERVAL,          -- e.g. '+1 hour' after event end

    -- Physical credential
    credential_format TEXT DEFAULT 'wristband'
        CHECK (credential_format IN ('wristband', 'badge', 'lanyard', 'digital', 'rfid', 'ticket')),

    -- Org scoping
    is_active BOOLEAN DEFAULT true,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Audit
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, name)
);

CREATE INDEX idx_cred_types_org ON credential_types(organization_id);
CREATE INDEX idx_cred_types_category ON credential_types(category);
```

#### Table: `credential_inventory_pools`

Per-event finite inventory for each credential type.

```sql
CREATE TABLE credential_inventory_pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- What
    credential_type_id UUID NOT NULL REFERENCES credential_types(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    live_event_id UUID REFERENCES live_event_instances(id) ON DELETE SET NULL,

    -- Inventory
    total_quantity INTEGER NOT NULL CHECK (total_quantity >= 0),
    assigned_count INTEGER NOT NULL DEFAULT 0 CHECK (assigned_count >= 0),
    reserved_count INTEGER NOT NULL DEFAULT 0 CHECK (reserved_count >= 0),
    revoked_count INTEGER NOT NULL DEFAULT 0 CHECK (revoked_count >= 0),
    -- Derived: available = total_quantity - assigned_count - reserved_count

    -- Validity override (overrides credential_type defaults if set)
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,

    -- Zone override (extends credential_type.default_zone_access)
    additional_zone_access TEXT[] DEFAULT '{}',

    -- Org scoping
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Audit
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(credential_type_id, event_id),
    CONSTRAINT pool_counts_valid CHECK (assigned_count + reserved_count <= total_quantity)
);

CREATE INDEX idx_cred_pool_event ON credential_inventory_pools(event_id);
CREATE INDEX idx_cred_pool_type ON credential_inventory_pools(credential_type_id);
```

#### Table: `credential_assignments`

Assigns a credential from an inventory pool to a person (polymorphic contact reference).

```sql
CREATE TABLE credential_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Pool reference
    pool_id UUID NOT NULL REFERENCES credential_inventory_pools(id) ON DELETE CASCADE,

    -- Assignee (polymorphic — exactly one must be set)
    crew_member_id UUID REFERENCES crew_members(id) ON DELETE SET NULL,
    vip_guest_id UUID REFERENCES vip_guests(id) ON DELETE SET NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,       -- internal staff
    external_name TEXT,                                                -- walk-up / manual entry
    external_email TEXT,
    external_phone TEXT,

    -- Credential details
    status credential_assignment_status NOT NULL DEFAULT 'requested',
    barcode_reference TEXT,                   -- Generated barcode/QR value
    rfid_tag TEXT,                            -- Physical RFID tag ID
    badge_number TEXT,                        -- Printed badge/wristband number
    credential_format TEXT,                   -- Override from credential_type

    -- Validity (inherited from pool, can be overridden)
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    zone_access TEXT[] DEFAULT '{}',          -- Computed: pool + type defaults + overrides

    -- Lifecycle timestamps
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES profiles(id),
    issued_at TIMESTAMPTZ,
    issued_by UUID REFERENCES profiles(id),
    checked_in_at TIMESTAMPTZ,
    checked_in_by UUID REFERENCES profiles(id),
    checked_in_zone TEXT,                     -- Which gate/zone scanned at
    checked_out_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES profiles(id),
    revocation_reason TEXT,

    -- Notes
    notes TEXT,

    -- Org scoping
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Audit
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT assignment_has_assignee CHECK (
        crew_member_id IS NOT NULL OR
        vip_guest_id IS NOT NULL OR
        vendor_id IS NOT NULL OR
        profile_id IS NOT NULL OR
        external_name IS NOT NULL
    )
);

CREATE INDEX idx_cred_assign_pool ON credential_assignments(pool_id);
CREATE INDEX idx_cred_assign_status ON credential_assignments(status);
CREATE INDEX idx_cred_assign_barcode ON credential_assignments(barcode_reference);
CREATE INDEX idx_cred_assign_rfid ON credential_assignments(rfid_tag);
CREATE INDEX idx_cred_assign_crew ON credential_assignments(crew_member_id);
CREATE INDEX idx_cred_assign_vip ON credential_assignments(vip_guest_id);
CREATE INDEX idx_cred_assign_vendor ON credential_assignments(vendor_id);
CREATE INDEX idx_cred_assign_profile ON credential_assignments(profile_id);
```

#### Table: `credential_scan_log`

Immutable audit trail for all credential scan events (extends the existing `scan_events` pattern but specialized for credentials).

```sql
CREATE TABLE credential_scan_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assignment_id UUID NOT NULL REFERENCES credential_assignments(id) ON DELETE CASCADE,
    scan_type TEXT NOT NULL CHECK (scan_type IN ('check_in', 'check_out', 'verify', 'deny', 'flag')),

    -- Context
    zone_id UUID REFERENCES foh_zones(id) ON DELETE SET NULL,
    gate_name TEXT,
    device_id TEXT,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),

    -- Result
    scan_result TEXT NOT NULL DEFAULT 'success'
        CHECK (scan_result IN ('success', 'denied_revoked', 'denied_expired', 'denied_wrong_zone', 'denied_already_in', 'flagged')),
    denial_reason TEXT,

    -- Who
    scanned_by UUID NOT NULL REFERENCES profiles(id),
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Org
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cred_scan_assignment ON credential_scan_log(assignment_id);
CREATE INDEX idx_cred_scan_time ON credential_scan_log(scanned_at DESC);
CREATE INDEX idx_cred_scan_zone ON credential_scan_log(zone_id);
CREATE INDEX idx_cred_scan_result ON credential_scan_log(scan_result);
```

#### Table: `bulk_import_jobs`

Tracks bulk import operations for credentials and other entities.

```sql
CREATE TABLE bulk_import_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Job definition
    entity_type TEXT NOT NULL CHECK (entity_type IN ('credential_assignment', 'vip_guest', 'crew_member', 'vendor')),
    source_filename TEXT NOT NULL,
    source_format TEXT NOT NULL CHECK (source_format IN ('csv', 'xlsx', 'json')),
    source_storage_path TEXT,           -- Supabase Storage path to uploaded file

    -- Processing
    status bulk_job_status NOT NULL DEFAULT 'pending',
    total_rows INTEGER DEFAULT 0,
    processed_rows INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    error_details JSONB DEFAULT '[]',   -- Array of { row, field, message }
    validation_warnings JSONB DEFAULT '[]',

    -- Target context
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    pool_id UUID REFERENCES credential_inventory_pools(id) ON DELETE SET NULL,

    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Org
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bulk_import_org ON bulk_import_jobs(organization_id);
CREATE INDEX idx_bulk_import_status ON bulk_import_jobs(status);
```

#### Table: `export_templates`

Configurable export format definitions per ticketing provider.

```sql
CREATE TABLE export_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Template definition
    name TEXT NOT NULL,                  -- e.g. "Eventbrite Standard", "Intellitix RFID"
    provider_slug TEXT,                  -- e.g. 'eventbrite', 'intellitix', 'front_gate', 'custom'
    format TEXT NOT NULL CHECK (format IN ('csv', 'xlsx', 'pdf', 'json')),

    -- Column mapping: ordered array of { source_field, output_header, transform? }
    column_mapping JSONB NOT NULL DEFAULT '[]',

    -- Options
    include_header BOOLEAN DEFAULT true,
    date_format TEXT DEFAULT 'YYYY-MM-DD',
    time_format TEXT DEFAULT 'HH:mm',
    delimiter TEXT DEFAULT ',',
    encoding TEXT DEFAULT 'utf-8',

    -- PDF-specific
    pdf_template_storage_path TEXT,      -- Supabase Storage path to PDF template

    -- Org
    is_system_template BOOLEAN DEFAULT false,  -- Platform-provided templates
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, name)
);

CREATE INDEX idx_export_tpl_org ON export_templates(organization_id);
CREATE INDEX idx_export_tpl_provider ON export_templates(provider_slug);
```

### A.3 RLS Policies (Workstream A)

All new tables follow the existing org-scoped pattern from `020_live_event_operations.sql`:

```sql
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'credential_types', 'credential_inventory_pools', 'credential_assignments',
        'credential_scan_log', 'bulk_import_jobs', 'export_templates'
    ])
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
        EXECUTE format('
            CREATE POLICY "Users can view %I in their org" ON %I
                FOR SELECT USING (organization_id IN (
                    SELECT organization_id FROM org_memberships WHERE user_id = auth.uid()
                ));
            CREATE POLICY "Users can insert %I in their org" ON %I
                FOR INSERT WITH CHECK (organization_id IN (
                    SELECT organization_id FROM org_memberships WHERE user_id = auth.uid()
                ));
            CREATE POLICY "Users can update %I in their org" ON %I
                FOR UPDATE USING (organization_id IN (
                    SELECT organization_id FROM org_memberships WHERE user_id = auth.uid()
                ));
        ', tbl, tbl, tbl, tbl, tbl, tbl);
    END LOOP;
END $$;
```

**RBAC resource additions** for `src/config/rbac.ts`:

| Resource | exec | director | pm | member | client | collaborator |
|----------|------|----------|----|--------|--------|--------------|
| `credential_types` | read, write, manage | read, write, manage | read, write | read | — | — |
| `credential_pools` | read, write, manage | read, write, manage | read, write | read | — | — |
| `credential_assignments` | read, write, manage | read, write | read, write | read, write | read (own) | read (own) |
| `credential_scans` | read, write | read, write | read, write | read, write | — | read, write |
| `bulk_imports` | read, write, manage | read, write | read, write | read | — | — |
| `export_templates` | read, write, manage | read, write | read, write | read | — | — |

---

## WORKSTREAM B — External Two-Way Sync (Ticketing Providers & POS)

### B.1 Gap Analysis Table

| # | Feature | Status | Current Location | Recommendation |
|---|---------|--------|-----------------|----------------|
| B1 | **Ticketing Provider Sync — Inbound** (orders, attendees, ticket types, refunds, promo codes) | `MISSING` | No inbound sync infrastructure. No webhook receivers. No provider mapping tables | **→ New `provider_connections` table (extends `integrations`), `provider_ticket_map` table, webhook Edge Functions** |
| B2 | **Ticketing Provider Sync — Outbound** (credential assignments, access overrides, guest list additions) | `MISSING` | No outbound sync mechanism. No push queue | **→ New `sync_outbox` table for reliable outbound delivery** |
| B3 | **Provider Ticket Map** — Normalization layer translating provider schemas to COMPVSS credentials | `MISSING` | No mapping infrastructure | **→ New `provider_ticket_map` table + `provider_field_mappings` config** |
| B4 | **POS System Sync — Inbound** (transactions, revenue by location/vendor/time, tender types, refunds) | `PARTIAL` | `foh_zone_readings.sales_amount` / `transactions_count` — aggregate only, no itemized data. `live_financial_snapshots.revenue_fb` / `revenue_merch` — snapshot aggregates | Aggregate revenue exists but no itemized transaction records, no tender type breakdown, no vendor-level revenue. **→ New `pos_transactions` table + `pos_transaction_items` table** |
| B5 | **POS System Sync — Outbound** (vendor booth assignments, menu/catalog, tax config) | `PARTIAL` | `vendors` table exists. `foh_zones` with zone_type='fb'/'merch' provides booth context. No menu/catalog or tax config tables | Vendor + zone data exists but no POS-oriented export. **→ New `pos_vendor_configs` table** |
| B6 | **POS Transaction Map** — Normalization layer feeding into financial module | `MISSING` | `live_financial_snapshots` receives aggregate data but has no itemized source | **→ New `pos_transaction_map` normalization in the `pos_transactions` table + views for P&L** |
| B7 | **Webhook Receiver Architecture** (ingestion, validation, idempotency, retry) | `MISSING` | No Edge Functions directory (`supabase/functions/` does not exist). No webhook endpoints. No idempotency tracking | **→ New `supabase/functions/` directory with Edge Functions per provider. New `webhook_events` table for idempotency** |
| B8 | **Sync Log / Audit Trail** (`sync_events` table) | `MISSING` | `activity_log` table exists for entity-level audit but is not sync-oriented. No `sync_events` table | **→ New `sync_events` table** |
| B9 | **Conflict Resolution** (last-write-wins vs source-of-truth priority) | `MISSING` | No conflict resolution strategy. No field-level source-of-truth config | **→ New `sync_conflict_policies` config table + resolution logic in sync workers** |
| B10 | **Rate Limiting & Error Handling** per provider API | `MISSING` | No rate limiter. No per-provider error tracking | **→ Rate limit config in `provider_connections.config` JSONB + circuit breaker state in `sync_events`** |

### B.2 Proposed Schema Additions

#### Table: `provider_connections`

Extends the existing `integrations` table pattern for ticketing and POS providers. Does **not** modify `integrations` — new table avoids breaking changes.

```sql
CREATE TABLE provider_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Provider identity
    provider_type TEXT NOT NULL CHECK (provider_type IN (
        -- Ticketing
        'eventbrite', 'universe', 'front_gate', 'tixr', 'ticket_fairy',
        'ticketmaster', 'dice', 'shotgun', 'see_tickets',
        -- POS
        'square', 'toast', 'clover', 'spoton', 'lightspeed',
        -- Generic
        'custom_webhook', 'custom_api'
    )),
    provider_category TEXT NOT NULL CHECK (provider_category IN ('ticketing', 'pos', 'rfid', 'access_control')),
    display_name TEXT NOT NULL,

    -- Auth
    auth_type TEXT NOT NULL DEFAULT 'oauth2'
        CHECK (auth_type IN ('oauth2', 'api_key', 'webhook_secret', 'basic')),
    credentials_encrypted JSONB DEFAULT '{}',    -- Encrypted at rest via Supabase Vault
    oauth_token_encrypted TEXT,
    oauth_refresh_token_encrypted TEXT,
    oauth_expires_at TIMESTAMPTZ,

    -- Webhook
    webhook_url TEXT,                             -- Our receiving URL
    webhook_secret TEXT,                          -- For HMAC validation
    webhook_events TEXT[] DEFAULT '{}',           -- Subscribed event types

    -- Sync config
    sync_direction TEXT NOT NULL DEFAULT 'inbound'
        CHECK (sync_direction IN ('inbound', 'outbound', 'bidirectional')),
    sync_frequency_seconds INTEGER DEFAULT 300,   -- Polling interval (if not webhook)
    rate_limit_requests_per_minute INTEGER DEFAULT 60,
    retry_max_attempts INTEGER DEFAULT 5,
    retry_backoff_base_seconds INTEGER DEFAULT 30,

    -- Status
    status TEXT NOT NULL DEFAULT 'inactive'
        CHECK (status IN ('active', 'inactive', 'error', 'rate_limited', 'auth_expired')),
    last_sync_at TIMESTAMPTZ,
    last_error TEXT,
    error_count INTEGER DEFAULT 0,
    consecutive_failures INTEGER DEFAULT 0,

    -- Event scoping (optional — can be org-wide or per-event)
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,

    -- Org
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, provider_type, event_id)
);

CREATE INDEX idx_provider_conn_org ON provider_connections(organization_id);
CREATE INDEX idx_provider_conn_type ON provider_connections(provider_type);
CREATE INDEX idx_provider_conn_status ON provider_connections(status);
```

#### Table: `provider_ticket_map`

Normalization layer: maps provider-specific ticket/order records to COMPVSS credential assignments.

```sql
CREATE TABLE provider_ticket_map (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Provider reference
    connection_id UUID NOT NULL REFERENCES provider_connections(id) ON DELETE CASCADE,
    provider_order_id TEXT NOT NULL,          -- Provider's order/booking ID
    provider_ticket_id TEXT,                  -- Provider's ticket/attendee ID
    provider_ticket_type TEXT,                -- Provider's ticket type name
    provider_tier TEXT,                       -- Provider's tier/level

    -- Mapped COMPVSS entities
    credential_type_id UUID REFERENCES credential_types(id) ON DELETE SET NULL,
    credential_assignment_id UUID REFERENCES credential_assignments(id) ON DELETE SET NULL,
    pool_id UUID REFERENCES credential_inventory_pools(id) ON DELETE SET NULL,

    -- Attendee data (normalized from provider)
    attendee_first_name TEXT,
    attendee_last_name TEXT,
    attendee_email TEXT,
    attendee_phone TEXT,

    -- Order data
    purchase_timestamp TIMESTAMPTZ,
    order_total NUMERIC(12,2),
    currency TEXT DEFAULT 'USD',
    promo_code TEXT,
    refund_status TEXT CHECK (refund_status IS NULL OR refund_status IN (
        'none', 'partial', 'full', 'pending'
    )),
    refund_amount NUMERIC(12,2),
    refund_timestamp TIMESTAMPTZ,

    -- Raw payload (for debugging / re-processing)
    raw_payload JSONB,
    payload_hash TEXT,                        -- SHA-256 for idempotency

    -- Sync state
    sync_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (sync_status IN ('pending', 'mapped', 'assigned', 'error', 'ignored')),
    sync_error TEXT,
    last_synced_at TIMESTAMPTZ,

    -- Org
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(connection_id, provider_order_id, provider_ticket_id)
);

CREATE INDEX idx_ticket_map_conn ON provider_ticket_map(connection_id);
CREATE INDEX idx_ticket_map_order ON provider_ticket_map(provider_order_id);
CREATE INDEX idx_ticket_map_assignment ON provider_ticket_map(credential_assignment_id);
CREATE INDEX idx_ticket_map_status ON provider_ticket_map(sync_status);
CREATE INDEX idx_ticket_map_hash ON provider_ticket_map(payload_hash);
```

#### Table: `pos_transactions`

Itemized POS transaction records from external systems.

```sql
CREATE TABLE pos_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Provider reference
    connection_id UUID NOT NULL REFERENCES provider_connections(id) ON DELETE CASCADE,
    provider_transaction_id TEXT NOT NULL,
    provider_location_id TEXT,

    -- Event context
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    live_event_id UUID REFERENCES live_event_instances(id) ON DELETE SET NULL,
    foh_zone_id UUID REFERENCES foh_zones(id) ON DELETE SET NULL,

    -- Vendor
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,

    -- Transaction
    transaction_type TEXT NOT NULL DEFAULT 'sale'
        CHECK (transaction_type IN ('sale', 'refund', 'void', 'adjustment')),
    transaction_timestamp TIMESTAMPTZ NOT NULL,

    -- Amounts
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    tip_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,

    -- Tender
    tender_type TEXT CHECK (tender_type IN (
        'cash', 'credit', 'debit', 'mobile_pay', 'gift_card', 'comp', 'split'
    )),
    tender_details JSONB DEFAULT '{}',        -- Split tender breakdown

    -- Metadata
    employee_name TEXT,
    register_id TEXT,
    receipt_number TEXT,

    -- Raw payload
    raw_payload JSONB,
    payload_hash TEXT,

    -- Sync
    sync_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (sync_status IN ('pending', 'processed', 'error', 'ignored')),
    sync_error TEXT,

    -- Org
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(connection_id, provider_transaction_id)
);

CREATE INDEX idx_pos_txn_conn ON pos_transactions(connection_id);
CREATE INDEX idx_pos_txn_event ON pos_transactions(event_id);
CREATE INDEX idx_pos_txn_vendor ON pos_transactions(vendor_id);
CREATE INDEX idx_pos_txn_zone ON pos_transactions(foh_zone_id);
CREATE INDEX idx_pos_txn_time ON pos_transactions(transaction_timestamp DESC);
CREATE INDEX idx_pos_txn_type ON pos_transactions(transaction_type);
CREATE INDEX idx_pos_txn_hash ON pos_transactions(payload_hash);
```

#### Table: `pos_transaction_items`

Line items within a POS transaction.

```sql
CREATE TABLE pos_transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    transaction_id UUID NOT NULL REFERENCES pos_transactions(id) ON DELETE CASCADE,

    -- Item
    item_name TEXT NOT NULL,
    item_sku TEXT,
    item_category TEXT,                       -- e.g. 'food', 'beverage', 'merch', 'service'
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_rate NUMERIC(5,4),
    discount_amount NUMERIC(12,2) DEFAULT 0,

    -- Org
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pos_items_txn ON pos_transaction_items(transaction_id);
CREATE INDEX idx_pos_items_category ON pos_transaction_items(item_category);
```

#### Table: `webhook_events`

Idempotent webhook event ingestion log.

```sql
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Source
    connection_id UUID NOT NULL REFERENCES provider_connections(id) ON DELETE CASCADE,
    provider_event_type TEXT NOT NULL,         -- Provider's event name
    provider_event_id TEXT,                    -- Provider's event ID (for dedup)

    -- Payload
    payload JSONB NOT NULL,
    payload_hash TEXT NOT NULL,                -- SHA-256 for idempotency
    headers JSONB DEFAULT '{}',               -- Relevant headers (signature, timestamp)

    -- Processing
    status TEXT NOT NULL DEFAULT 'received'
        CHECK (status IN ('received', 'processing', 'processed', 'failed', 'duplicate', 'ignored')),
    processing_error TEXT,
    retry_count INTEGER DEFAULT 0,
    next_retry_at TIMESTAMPTZ,

    -- Timing
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,

    -- Org
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhook_conn ON webhook_events(connection_id);
CREATE INDEX idx_webhook_hash ON webhook_events(payload_hash);
CREATE INDEX idx_webhook_status ON webhook_events(status);
CREATE INDEX idx_webhook_retry ON webhook_events(next_retry_at) WHERE status = 'failed';
CREATE UNIQUE INDEX idx_webhook_dedup ON webhook_events(connection_id, provider_event_id)
    WHERE provider_event_id IS NOT NULL;
```

#### Table: `sync_events`

Audit trail for all sync operations (both directions).

```sql
CREATE TABLE sync_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Context
    connection_id UUID NOT NULL REFERENCES provider_connections(id) ON DELETE CASCADE,
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    entity_type TEXT NOT NULL,                -- e.g. 'ticket_order', 'credential_assignment', 'pos_transaction'
    entity_id UUID,                           -- COMPVSS entity ID
    provider_entity_id TEXT,                  -- Provider's entity ID

    -- Operation
    operation TEXT NOT NULL CHECK (operation IN ('create', 'update', 'delete', 'sync', 'conflict_resolve')),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'success', 'failed', 'conflict', 'skipped')),

    -- Payload
    payload_hash TEXT,
    changes JSONB DEFAULT '{}',               -- Field-level diff
    conflict_details JSONB,                   -- If status = 'conflict'
    resolution TEXT,                          -- How conflict was resolved

    -- Error
    error TEXT,
    retry_count INTEGER DEFAULT 0,

    -- Timing
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,

    -- Org
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sync_events_conn ON sync_events(connection_id);
CREATE INDEX idx_sync_events_entity ON sync_events(entity_type, entity_id);
CREATE INDEX idx_sync_events_status ON sync_events(status);
CREATE INDEX idx_sync_events_time ON sync_events(started_at DESC);
```

#### Table: `sync_conflict_policies`

Declarative field-level source-of-truth configuration.

```sql
CREATE TABLE sync_conflict_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Scope
    connection_id UUID REFERENCES provider_connections(id) ON DELETE CASCADE,  -- NULL = org default
    entity_type TEXT NOT NULL,
    field_name TEXT NOT NULL,

    -- Policy
    resolution_strategy TEXT NOT NULL DEFAULT 'source_of_truth'
        CHECK (resolution_strategy IN ('source_of_truth', 'last_write_wins', 'provider_wins', 'compvss_wins', 'manual')),
    source_of_truth TEXT DEFAULT 'compvss'
        CHECK (source_of_truth IN ('compvss', 'provider')),

    -- Org
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, connection_id, entity_type, field_name)
);
```

### B.3 Sync Architecture

#### Webhook Flow (Inbound)

```
Provider → HTTPS POST → Supabase Edge Function (per provider)
  ├─ 1. Validate signature (HMAC / provider-specific)
  ├─ 2. Check idempotency (payload_hash in webhook_events)
  ├─ 3. Insert into webhook_events (status: 'received')
  ├─ 4. Normalize payload → provider_ticket_map OR pos_transactions
  ├─ 5. Apply conflict resolution policy
  ├─ 6. Create/update credential_assignments OR financial records
  ├─ 7. Log to sync_events
  └─ 8. Return 200 OK (within 5s to avoid provider timeout)
```

#### Outbound Sync Flow

```
COMPVSS mutation (credential_assignment INSERT/UPDATE)
  ├─ 1. Database trigger → insert into sync_outbox (not a table — use pg_notify)
  ├─ 2. Supabase Edge Function (cron or realtime listener)
  │   ├─ 3. Check provider_connections for active outbound connections
  │   ├─ 4. Transform COMPVSS data → provider-specific format
  │   ├─ 5. Call provider API (with rate limiting)
  │   ├─ 6. Log to sync_events
  │   └─ 7. Update credential_assignment.last_synced_at
  └─ 8. On failure: increment retry, schedule next attempt
```

#### Conflict Resolution Matrix

| Entity | Field | Default Strategy | Source of Truth |
|--------|-------|-----------------|-----------------|
| Ticket Order | attendee_name | provider_wins | Provider |
| Ticket Order | attendee_email | provider_wins | Provider |
| Ticket Order | refund_status | provider_wins | Provider |
| Credential Assignment | status | compvss_wins | COMPVSS |
| Credential Assignment | zone_access | compvss_wins | COMPVSS |
| Credential Assignment | checked_in_at | last_write_wins | — |
| POS Transaction | total_amount | provider_wins | Provider |
| POS Transaction | vendor_id | compvss_wins | COMPVSS |

### B.4 RLS Policies (Workstream B)

Same org-scoped pattern. Additional restriction: `provider_connections` credentials columns require `exec` or `director` role for write access (managed via RBAC matrix, not RLS).

```sql
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'provider_connections', 'provider_ticket_map', 'pos_transactions',
        'pos_transaction_items', 'webhook_events', 'sync_events', 'sync_conflict_policies'
    ])
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
        EXECUTE format('
            CREATE POLICY "Users can view %I in their org" ON %I
                FOR SELECT USING (organization_id IN (
                    SELECT organization_id FROM org_memberships WHERE user_id = auth.uid()
                ));
            CREATE POLICY "Users can insert %I in their org" ON %I
                FOR INSERT WITH CHECK (organization_id IN (
                    SELECT organization_id FROM org_memberships WHERE user_id = auth.uid()
                ));
            CREATE POLICY "Users can update %I in their org" ON %I
                FOR UPDATE USING (organization_id IN (
                    SELECT organization_id FROM org_memberships WHERE user_id = auth.uid()
                ));
        ', tbl, tbl, tbl, tbl, tbl, tbl);
    END LOOP;
END $$;
```

---

## IMPLEMENTATION ROADMAP

### Phase 1: Schema Foundation (Week 1–2) — Complexity: M

| # | Task | Depends On | Est |
|---|------|-----------|-----|
| 1.1 | Create migration `041_credentialing_ticketing.sql` — enums, `credential_types`, `credential_inventory_pools`, `credential_assignments`, `credential_scan_log` | — | M |
| 1.2 | Create migration `042_bulk_export_infrastructure.sql` — `bulk_import_jobs`, `export_templates` | — | S |
| 1.3 | Create migration `043_external_sync_infrastructure.sql` — `provider_connections`, `provider_ticket_map`, `pos_transactions`, `pos_transaction_items`, `webhook_events`, `sync_events`, `sync_conflict_policies` | — | M |
| 1.4 | Add RLS policies + triggers for all new tables | 1.1–1.3 | S |
| 1.5 | Regenerate `database.types.ts` | 1.4 | S |
| 1.6 | Create TypeScript types: `src/types/credentialing.ts`, `src/types/external-sync.ts` | 1.5 | S |
| 1.7 | Add RBAC resources to `src/config/rbac.ts` | 1.6 | S |

### Phase 2: Core Hooks & API Routes (Week 3–4) — Complexity: M

| # | Task | Depends On | Est |
|---|------|-----------|-----|
| 2.1 | Create Supabase hooks: `src/lib/supabase/hooks-credentialing.ts` — CRUD for credential_types, pools, assignments, scan_log | 1.5 | M |
| 2.2 | Create Supabase hooks: `src/lib/supabase/hooks-external-sync.ts` — CRUD for provider_connections, ticket_map, pos_transactions, sync_events | 1.5 | M |
| 2.3 | Create API route: `POST /api/credentials/assign` — single + bulk assignment with pool count updates | 2.1 | M |
| 2.4 | Create API route: `POST /api/credentials/scan` — scan-in endpoint for gate devices | 2.1 | S |
| 2.5 | Create API route: `POST /api/credentials/bulk-import` — file upload + parse + validate + create assignments | 2.1 | L |
| 2.6 | Create API route: `POST /api/credentials/export` — generate manifest using export_templates | 2.1 | M |
| 2.7 | Create API route: `GET/POST /api/integrations/connections` — provider connection CRUD | 2.2 | S |
| 2.8 | Create API route: `GET /api/integrations/sync-log` — sync events query | 2.2 | S |
| 2.9 | Add realtime subscriptions: `src/lib/supabase/realtime.ts` — credential_assignments, credential_scan_log, pos_transactions | 2.1, 2.2 | S |
| 2.10 | Install dependencies: `papaparse`, `xlsx`, `@react-pdf/renderer` | — | S |

### Phase 3: UI Views (Week 5–7) — Complexity: L

| # | Task | Depends On | Est |
|---|------|-----------|-----|
| 3.1 | Create page: `src/app/(dashboard)/credentials/page.tsx` — credential type management + inventory pools | 2.1 | M |
| 3.2 | Create page: `src/app/(dashboard)/credentials/assignments/page.tsx` — assignment list + status management | 2.3 | M |
| 3.3 | Create page: `src/app/(dashboard)/live-ops/credentials/page.tsx` — on-site credential dashboard (realtime) | 2.9 | L |
| 3.4 | Create page: `src/app/(dashboard)/live-ops/gate/page.tsx` — gate-staff scan interface (minimal, touch-friendly) | 2.4 | M |
| 3.5 | Create page: `src/app/(dashboard)/integrations/page.tsx` — provider connections + sync status | 2.7 | M |
| 3.6 | Create page: `src/app/(dashboard)/integrations/sync-log/page.tsx` — sync event audit trail | 2.8 | S |
| 3.7 | Update page: `src/app/(dashboard)/live-ops/foh/page.tsx` — add credential check-in counts per zone | 2.9 | S |
| 3.8 | Update page: `src/app/(dashboard)/live-ops/financials/page.tsx` — add POS transaction breakdown | 2.2 | S |
| 3.9 | Add bulk import dialog component: `src/components/credentials/bulk-import-dialog.tsx` | 2.5 | M |
| 3.10 | Add export dialog component: `src/components/credentials/export-dialog.tsx` | 2.6 | S |
| 3.11 | Update navigation config: add Credentials section + Integrations section | 3.1, 3.5 | S |

### Phase 4: Edge Functions & Sync Workers (Week 8–10) — Complexity: L

| # | Task | Depends On | Est |
|---|------|-----------|-----|
| 4.1 | Create Edge Function: `supabase/functions/webhook-eventbrite/index.ts` — Eventbrite webhook receiver | 1.3 | M |
| 4.2 | Create Edge Function: `supabase/functions/webhook-square/index.ts` — Square webhook receiver | 1.3 | M |
| 4.3 | Create Edge Function: `supabase/functions/sync-outbound/index.ts` — outbound credential sync worker | 1.3, 2.3 | L |
| 4.4 | Create Edge Function: `supabase/functions/sync-pos-aggregate/index.ts` — aggregate POS data into `foh_zone_readings` + `live_financial_snapshots` | 1.3 | M |
| 4.5 | Create shared library: `supabase/functions/_shared/webhook-utils.ts` — HMAC validation, idempotency check, rate limit guard | — | S |
| 4.6 | Create shared library: `supabase/functions/_shared/sync-utils.ts` — conflict resolution engine, retry logic | — | S |
| 4.7 | Create shared library: `supabase/functions/_shared/provider-adapters/` — per-provider normalization adapters | — | M |
| 4.8 | Add cron job config for polling-based sync (providers without webhooks) | 4.3 | S |

---

## FILE PLACEMENT MAP

```
supabase/
├── migrations/
│   ├── 041_credentialing_ticketing.sql          ← Phase 1.1
│   ├── 042_bulk_export_infrastructure.sql       ← Phase 1.2
│   └── 043_external_sync_infrastructure.sql     ← Phase 1.3
├── functions/
│   ├── _shared/
│   │   ├── webhook-utils.ts                     ← Phase 4.5
│   │   ├── sync-utils.ts                        ← Phase 4.6
│   │   └── provider-adapters/
│   │       ├── eventbrite.ts                    ← Phase 4.7
│   │       ├── square.ts                        ← Phase 4.7
│   │       ├── front-gate.ts                    ← Phase 4.7
│   │       └── types.ts                         ← Phase 4.7
│   ├── webhook-eventbrite/
│   │   └── index.ts                             ← Phase 4.1
│   ├── webhook-square/
│   │   └── index.ts                             ← Phase 4.2
│   ├── sync-outbound/
│   │   └── index.ts                             ← Phase 4.3
│   └── sync-pos-aggregate/
│       └── index.ts                             ← Phase 4.4

src/
├── types/
│   ├── credentialing.ts                         ← Phase 1.6
│   └── external-sync.ts                         ← Phase 1.6
├── lib/
│   └── supabase/
│       ├── hooks-credentialing.ts               ← Phase 2.1
│       └── hooks-external-sync.ts               ← Phase 2.2
├── config/
│   ├── rbac.ts                                  ← Phase 1.7 (modify)
│   └── navigation.ts                            ← Phase 3.11 (modify)
├── components/
│   └── credentials/
│       ├── bulk-import-dialog.tsx                ← Phase 3.9
│       ├── export-dialog.tsx                     ← Phase 3.10
│       ├── credential-type-card.tsx              ← Phase 3.1
│       ├── assignment-status-badge.tsx           ← Phase 3.2
│       ├── pool-capacity-bar.tsx                 ← Phase 3.1
│       └── scan-result-indicator.tsx             ← Phase 3.4
├── app/
│   ├── (dashboard)/
│   │   ├── credentials/
│   │   │   ├── page.tsx                         ← Phase 3.1
│   │   │   └── assignments/
│   │   │       └── page.tsx                     ← Phase 3.2
│   │   ├── integrations/
│   │   │   ├── page.tsx                         ← Phase 3.5
│   │   │   └── sync-log/
│   │   │       └── page.tsx                     ← Phase 3.6
│   │   └── live-ops/
│   │       ├── credentials/
│   │       │   └── page.tsx                     ← Phase 3.3
│   │       ├── gate/
│   │       │   └── page.tsx                     ← Phase 3.4
│   │       ├── foh/
│   │       │   └── page.tsx                     ← Phase 3.7 (modify)
│   │       └── financials/
│   │           └── page.tsx                     ← Phase 3.8 (modify)
│   └── api/
│       ├── credentials/
│       │   ├── assign/
│       │   │   └── route.ts                     ← Phase 2.3
│       │   ├── scan/
│       │   │   └── route.ts                     ← Phase 2.4
│       │   ├── bulk-import/
│       │   │   └── route.ts                     ← Phase 2.5
│       │   └── export/
│       │       └── route.ts                     ← Phase 2.6
│       └── integrations/
│           ├── connections/
│           │   └── route.ts                     ← Phase 2.7
│           └── sync-log/
│               └── route.ts                     ← Phase 2.8
```

---

## EXISTING TABLE IMPACT ASSESSMENT

**No existing tables are modified.** All new functionality uses new tables with foreign key references to existing tables:

| Existing Table | Referenced By | Reference Type |
|---------------|--------------|----------------|
| `events` | `credential_inventory_pools.event_id`, `pos_transactions.event_id`, `provider_connections.event_id` | FK (SET NULL) |
| `live_event_instances` | `credential_inventory_pools.live_event_id`, `pos_transactions.live_event_id` | FK (SET NULL) |
| `crew_members` | `credential_assignments.crew_member_id` | FK (SET NULL) |
| `vip_guests` | `credential_assignments.vip_guest_id` | FK (SET NULL) |
| `vendors` | `credential_assignments.vendor_id`, `pos_transactions.vendor_id` | FK (SET NULL) |
| `profiles` | `credential_assignments.profile_id`, various `created_by`/`approved_by` | FK (SET NULL) |
| `foh_zones` | `credential_scan_log.zone_id`, `pos_transactions.foh_zone_id` | FK (SET NULL) |
| `organizations` | All new tables (org scoping) | FK (CASCADE) |

**Zero breaking changes. Zero ALTER TABLE on existing tables.**

---

## DEPENDENCY SUMMARY

| Package | Purpose | Phase |
|---------|---------|-------|
| `papaparse` | CSV parsing for bulk import | 2.10 |
| `xlsx` (SheetJS) | XLSX parsing/generation for bulk import/export | 2.10 |
| `@react-pdf/renderer` | PDF manifest generation | 2.10 |

---

## CONSTRAINTS COMPLIANCE CHECKLIST

| Constraint | Status |
|-----------|--------|
| All schemas 3NF + SSOT compliant | ✅ No redundant data. Credential types → pools → assignments → scans is fully normalized. Provider maps reference canonical records |
| All new tables have RLS policies | ✅ Org-scoped SELECT/INSERT/UPDATE via `org_memberships` |
| All new tables mapped to RBAC hierarchy | ✅ 6-tier matrix defined for all 6 Workstream A + 7 Workstream B resources |
| Export formats configurable per provider | ✅ `export_templates` table with JSONB `column_mapping`, not hardcoded |
| Sync workers idempotent + resumable | ✅ `webhook_events.payload_hash` dedup index; `sync_events` retry tracking; `webhook_events.next_retry_at` for resumability |
| Supabase Edge Functions for webhook receivers | ✅ Edge Functions in `supabase/functions/webhook-*/` |
| No modification to existing table structures | ✅ Zero ALTER TABLE on existing tables. All new FKs are on new tables |

---

## INFORMATION ARCHITECTURE INTEGRATION

### Design Constraint

The existing IA (`src/config/navigation.ts`) uses **10 sections + 1 contextual** with strict design principles:

- **Miller's Law:** Max 7 top-level items per section
- **Two-level nesting** via `children[]` for large sections (e.g., Finance)
- **RBAC filtering** removes inaccessible items per role
- **Contextual sections** (Live Operations) appear only when an event is in-progress
- **No new top-level sections** — all new features must integrate into existing groups

### Integration Strategy

New credentialing and POS features are distributed across **4 existing sections** based on user mental model alignment:

| Domain | IA Section | Rationale |
|--------|-----------|-----------|
| Credential type definitions, inventory pools | **Production** | Back-office setup before events — same section as Events, Activations, Scopes of Work |
| On-site credential dashboard, gate scan view | **Live Operations** (contextual) | Real-time event views alongside Command Dashboard, FOH, VIP |
| Provider connections, sync config, sync log | **Admin** | System-level integration config alongside Settings, System Health, Data Export |
| POS revenue data | **Finance** (enrichment) + **Live Operations** (enrichment) | Enriches existing Financials page and Finance Overview — no new pages needed |

### Precedent: Advancing Module Pattern

The Advancing module (`src/config/advancing-config.ts`) follows an identical integration pattern:

- **Production** houses the back-office advancing configuration
- **Live Operations** houses the on-site advancing dashboard
- **No dedicated top-level section** was introduced

The credentialing/POS integration follows this same established pattern.

### Proposed Navigation Changes

#### Production Section (add 1 item with 1 child)

```typescript
// Add after "Locations" in Production section
{
    title: "Credentials",
    path: "/credentials",
    icon: BadgeCheck,           // Already imported
    permission: "credential_types.read",
    children: [
        {
            title: "Assignments",
            path: "/credentials/assignments",
            icon: FileBadge,    // Already imported
            permission: "credential_assignments.read",
        },
    ],
},
```

**Item count after:** 8 (was 7) — at the Miller's Law boundary but acceptable given `children[]` collapses the sub-item.

#### Live Operations Section (add 2 items)

```typescript
// Add after "VIP Management" in Live Operations section
{
    title: "Credentials",
    path: "/live-ops/credentials",
    icon: Fingerprint,          // Already imported
    permission: "credential_assignments.read",
},
{
    title: "Gate Scan",
    path: "/live-ops/gate",
    icon: ScanBarcode,          // Already imported — reuse OK since different section
    permission: "credential_scan_log.read",
},
```

**Item count after:** 17 (was 15) — Live Operations is the largest section by design (contextual, event-scoped). This is acceptable because the section is only visible during active events.

#### Admin Section (add 1 item with 1 child)

```typescript
// Add after "Data Export" in Admin section
{
    title: "Integrations",
    path: "/integrations",
    icon: ArrowRightLeft,       // Already imported
    permission: "provider_connections.read",
    children: [
        {
            title: "Sync Log",
            path: "/integrations/sync-log",
            icon: Repeat,       // Already imported
            permission: "sync_events.read",
        },
    ],
},
```

**Item count after:** 17 (was 16) — Admin is already a large governance section. The `children[]` pattern keeps the visual footprint manageable.

#### Finance Section (no new items — enrichment only)

Existing pages are enriched with POS data:

- **Finance → Overview** (`/finance`): Add POS revenue breakdown card (ticket revenue, F&B revenue, merch revenue sourced from `pos_transactions` aggregates)
- **Live Operations → Financials** (`/live-ops/financials`): Add real-time POS transaction feed and per-zone revenue breakdown (already has `revenue_tickets` + `revenue_fb` fields in `live_financial_snapshots`)

No navigation changes required — data enrichment only.

### Updated File Placement Map (IA-Aligned)

The original roadmap's file placement is updated to reflect IA integration:

```
Original (audit roadmap)                    → IA-Aligned Path
─────────────────────────────────────────────────────────────────────
src/app/(dashboard)/credentials/            → SAME (Production section)
src/app/(dashboard)/credentials/assignments/→ SAME (Production > Credentials > Assignments)
src/app/(dashboard)/live-ops/credentials/   → SAME (Live Operations section)
src/app/(dashboard)/live-ops/gate/          → SAME (Live Operations section)
src/app/(dashboard)/integrations/           → SAME (Admin section)
src/app/(dashboard)/integrations/sync-log/  → SAME (Admin > Integrations > Sync Log)
```

All file paths in the original roadmap are **already IA-compliant**. No path changes needed.

### RBAC Visibility Matrix (New Resources)

| Resource | exec | director | pm | member | client | collaborator |
|----------|------|----------|-----|--------|--------|--------------|
| `credential_types` | RWDM | RW | RW | R | — | — |
| `credential_inventory_pools` | RWDM | RW | RW | R | — | — |
| `credential_assignments` | RWDM | RW | RW | RW | R | R |
| `credential_scan_log` | RWDM | RW | RW | RW | — | RW |
| `bulk_import_jobs` | RWDM | RW | RW | — | — | — |
| `export_templates` | RWDM | RW | RW | R | — | — |
| `provider_connections` | RWDM | RW | — | — | — | — |
| `provider_ticket_map` | RWDM | RW | R | — | — | — |
| `pos_transactions` | RWDM | RW | R | R | — | — |
| `pos_transaction_items` | RWDM | RW | R | R | — | — |
| `webhook_events` | RWDM | R | — | — | — | — |
| `sync_events` | RWDM | R | R | — | — | — |
| `sync_conflict_policies` | RWDM | RW | — | — | — | — |

**Legend:** R = read, W = write, D = delete, M = manage, — = no access

**Key decisions:**
- **`credential_assignments`**: `member` gets RW (assigns own crew). `client` gets R (view their event's credential list). `collaborator` gets R (view assigned credentials).
- **`credential_scan_log`**: `member` and `collaborator` get RW (gate staff scan credentials on-site).
- **`provider_connections`**: Restricted to `exec` + `director` (contains API keys and secrets).
- **`webhook_events`**: `director` gets R only (audit visibility). No lower tiers.
- **`sync_conflict_policies`**: `exec` + `director` only (governance-level configuration).

### Navigation Icon Audit

All proposed icons are **already imported** in `navigation.ts` (lines 1–103). No new icon imports required:

| Icon | Current Usage | New Usage |
|------|--------------|-----------|
| `BadgeCheck` | Certifications (Legal & Compliance) | Credentials (Production) — different section, no collision |
| `FileBadge` | Permits & Licenses (Legal & Compliance) | Credential Assignments (Production > Credentials) — nested child, no collision |
| `Fingerprint` | IP & Usage Rights (Legal & Compliance) | Live Credentials (Live Operations) — different section, no collision |
| `ScanBarcode` | Vendor Portal (Admin) | Gate Scan (Live Operations) — different section, acceptable |
| `ArrowRightLeft` | Change Orders (Sales & CRM) | Integrations (Admin) — different section, acceptable |
| `Repeat` | Recurring Invoices (Finance > Billing) | Sync Log (Admin > Integrations) — nested child, no collision |

Per IA design principle #6 ("Every item has a unique icon — no duplicates in collapsed view"), all reuses occur in **different sections** or **nested children**, so no collapsed-view duplicates exist.
