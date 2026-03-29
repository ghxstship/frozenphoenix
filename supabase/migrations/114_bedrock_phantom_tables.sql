-- ============================================================
-- Migration 114: BEDROCK Batch 4a — Phantom Table Resolution
-- Protocol: FP-DATA-BEDROCK-001
--
-- Creates 3 missing tables/views referenced by existing API routes:
--   1. asset_scan_log   (POST /api/assets/scan)
--   2. scheduled_messages (POST /api/automations/email-sequence)
--   3. time_tracking_compliance (VIEW: GET /api/time-tracking-compliance)
--
-- Zero-downtime: CREATE TABLE + ENABLE RLS only.
-- ============================================================

-- ============================================================
-- 1. asset_scan_log
-- ============================================================

CREATE TABLE IF NOT EXISTS asset_scan_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    scan_action TEXT NOT NULL,
    scan_method TEXT,
    scanned_identifier TEXT,
    matched_by TEXT,
    location_id TEXT,
    scanned_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_asset_scan_log_asset ON asset_scan_log(asset_id);
CREATE INDEX idx_asset_scan_log_org ON asset_scan_log(organization_id);
CREATE INDEX idx_asset_scan_log_scanned_by ON asset_scan_log(scanned_by);
CREATE INDEX idx_asset_scan_log_scanned_at ON asset_scan_log(scanned_at DESC);

ALTER TABLE asset_scan_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY asset_scan_log_select ON asset_scan_log FOR SELECT USING (true);
CREATE POLICY asset_scan_log_insert ON asset_scan_log FOR INSERT WITH CHECK (true);

-- ============================================================
-- 2. scheduled_messages
-- ============================================================

CREATE TABLE IF NOT EXISTS scheduled_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    channel TEXT NOT NULL DEFAULT 'email',
    recipient TEXT NOT NULL,
    subject TEXT,
    body TEXT,
    scheduled_for TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    metadata JSONB DEFAULT '{}',
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scheduled_messages_org ON scheduled_messages(organization_id);
CREATE INDEX idx_scheduled_messages_status ON scheduled_messages(status) WHERE status = 'pending';
CREATE INDEX idx_scheduled_messages_scheduled_for ON scheduled_messages(scheduled_for) WHERE status = 'pending';

ALTER TABLE scheduled_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY scheduled_messages_select ON scheduled_messages FOR SELECT USING (true);
CREATE POLICY scheduled_messages_insert ON scheduled_messages FOR INSERT WITH CHECK (true);
CREATE POLICY scheduled_messages_update ON scheduled_messages FOR UPDATE USING (true);

-- ============================================================
-- 3. time_tracking_compliance (VIEW)
--    Derived from time_entries + crew_members — no standalone table needed.
-- ============================================================

CREATE OR REPLACE VIEW time_tracking_compliance AS
SELECT
    cm.id AS crew_member_id,
    cm.name,
    cm.organization_id,
    COUNT(te.id) AS total_entries,
    COUNT(te.id) FILTER (WHERE te.status = 'approved') AS approved_entries,
    COUNT(te.id) FILTER (WHERE te.status = 'pending') AS pending_entries,
    COUNT(te.id) FILTER (WHERE te.status = 'rejected') AS rejected_entries,
    COALESCE(SUM(te.hours_worked), 0) AS total_hours,
    COALESCE(SUM(te.hours_worked) FILTER (WHERE te.is_billable = true), 0) AS billable_hours,
    COUNT(te.id) FILTER (WHERE te.overtime_flag = true) AS overtime_entries,
    BOOL_AND(te.status IN ('approved', 'pending')) AS is_compliant,
    MAX(te.date) AS last_entry_date,
    cm.created_at
FROM crew_members cm
LEFT JOIN time_entries te ON te.crew_member_id = cm.id
GROUP BY cm.id, cm.name, cm.organization_id, cm.created_at;
