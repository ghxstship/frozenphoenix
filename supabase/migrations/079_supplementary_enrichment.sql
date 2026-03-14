-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION 079: SUPPLEMENTARY ENRICHMENT (P3)
-- ═══════════════════════════════════════════════════════════════════════════
-- Priority: LOW — Nice-to-have, ESG, marketing, fleet, spatial
-- Source: SCHEMA_OPTIMIZATION_AND_ENRICHMENT_PLAN.md §19 Migration 079
-- Tables modified: projects, campaigns, creative_reviews, vehicles,
--   space_bookings, comm_log_entries, post_event_reports, decks
-- New table: deck_shares (sharing controls for presentation decks)
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. projects: sustainability / ESG reporting
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS sustainability_score NUMERIC(5,2) CHECK (sustainability_score >= 0 AND sustainability_score <= 100),
  ADD COLUMN IF NOT EXISTS carbon_offset_tons NUMERIC(10,2) CHECK (carbon_offset_tons >= 0);

COMMENT ON COLUMN projects.sustainability_score IS
  'ESG sustainability score (0-100). Enterprise ESG reporting.';
COMMENT ON COLUMN projects.carbon_offset_tons IS
  'Carbon offset metric tons — ESG compliance reporting.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. campaigns: ROI, sentiment, UTM
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS roi_percent NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS sentiment_score NUMERIC(5,2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

COMMENT ON COLUMN campaigns.roi_percent IS
  'Return on investment percentage for campaign analytics.';
COMMENT ON COLUMN campaigns.sentiment_score IS
  'AI/NLP sentiment score (-1.0 to 1.0) for brand monitoring.';
COMMENT ON COLUMN campaigns.utm_source IS
  'Google Analytics UTM source parameter.';
COMMENT ON COLUMN campaigns.utm_medium IS
  'Google Analytics UTM medium parameter.';
COMMENT ON COLUMN campaigns.utm_campaign IS
  'Google Analytics UTM campaign parameter.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. creative_reviews: SLA deadline
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE creative_reviews
  ADD COLUMN IF NOT EXISTS review_deadline TIMESTAMPTZ;

COMMENT ON COLUMN creative_reviews.review_deadline IS
  'SLA deadline for review completion — workflow escalation trigger.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. vehicles: fleet mileage + fuel type
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS current_mileage INTEGER CHECK (current_mileage >= 0),
  ADD COLUMN IF NOT EXISTS fuel_type TEXT DEFAULT 'diesel'
    CHECK (fuel_type IN ('diesel', 'gasoline', 'electric', 'hybrid', 'cng', 'propane'));

COMMENT ON COLUMN vehicles.current_mileage IS
  'Fleet management — mileage-based maintenance scheduling.';
COMMENT ON COLUMN vehicles.fuel_type IS
  'Fleet fuel type — ESG reporting and fueling logistics.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. space_bookings: buffer scheduling
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE space_bookings
  ADD COLUMN IF NOT EXISTS setup_minutes INTEGER DEFAULT 0 CHECK (setup_minutes >= 0),
  ADD COLUMN IF NOT EXISTS teardown_minutes INTEGER DEFAULT 0 CHECK (teardown_minutes >= 0);

COMMENT ON COLUMN space_bookings.setup_minutes IS
  'Buffer time before booking — prevents schedule conflicts.';
COMMENT ON COLUMN space_bookings.teardown_minutes IS
  'Buffer time after booking — prevents schedule conflicts.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. comm_log_entries: priority level
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE comm_log_entries
  ADD COLUMN IF NOT EXISTS priority_level TEXT DEFAULT 'normal'
    CHECK (priority_level IN ('low', 'normal', 'high', 'urgent', 'emergency'));

COMMENT ON COLUMN comm_log_entries.priority_level IS
  'Communication priority for live event triage. Emergency = all-call.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. post_event_reports: financial + sustainability summary
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE post_event_reports
  ADD COLUMN IF NOT EXISTS total_revenue NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS total_expenses NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS sustainability_notes TEXT;

COMMENT ON COLUMN post_event_reports.total_revenue IS
  'Event P&L — revenue summary.';
COMMENT ON COLUMN post_event_reports.total_expenses IS
  'Event P&L — expense summary.';
COMMENT ON COLUMN post_event_reports.sustainability_notes IS
  'ESG post-event sustainability report notes.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. deck_shares: sharing controls for decks (new table)
--    Fills gap identified in creative-brand-tables.md enrichment report
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE deck_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,

    -- Sharing mechanism
    share_type TEXT NOT NULL CHECK (share_type IN ('link', 'email', 'embed')),
    share_token TEXT NOT NULL UNIQUE,

    -- Access control
    password_hash TEXT,
    expires_at TIMESTAMPTZ,
    max_views INTEGER CHECK (max_views > 0),
    current_views INTEGER NOT NULL DEFAULT 0 CHECK (current_views >= 0),

    -- Permissions
    allow_download BOOLEAN NOT NULL DEFAULT false,

    -- Recipient (optional — for email shares)
    recipient_email TEXT,
    recipient_name TEXT,

    -- Audit
    created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    last_viewed_at TIMESTAMPTZ,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deck_shares_deck ON deck_shares(deck_id);
CREATE INDEX idx_deck_shares_token ON deck_shares(share_token);
CREATE INDEX idx_deck_shares_org ON deck_shares(organization_id);

ALTER TABLE deck_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deck_shares_org_read" ON deck_shares
    FOR SELECT USING (
        organization_id IN (SELECT get_user_org_ids())
    );

CREATE POLICY "deck_shares_org_write" ON deck_shares
    FOR ALL USING (
        organization_id IN (SELECT get_user_org_ids())
    );

COMMIT;
