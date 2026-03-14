-- ═══════════════════════════════════════════════════════════════
-- 084 — Scanning Enhancements
-- Adds scan_method tracking, NFC serial columns, and indexes
-- for multi-identifier credential/asset lookup.
-- ═══════════════════════════════════════════════════════════════

BEGIN;

-- ─── 1. Scan Method Enum ──────────────────────────────────────
DO $$ BEGIN
    CREATE TYPE scan_method AS ENUM (
        'keyboard', 'camera', 'rfid', 'nfc', 'file', 'api'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 2. Credential Assignments — NFC serial column ────────────
ALTER TABLE credential_assignments
    ADD COLUMN IF NOT EXISTS nfc_serial TEXT;

-- Partial unique index on nfc_serial (only non-null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_credential_assignments_nfc_serial
    ON credential_assignments (organization_id, nfc_serial)
    WHERE nfc_serial IS NOT NULL;

COMMENT ON COLUMN credential_assignments.nfc_serial
    IS 'NFC tag serial number associated with this credential';

-- ─── 3. Credential Scan Log — scan method + identifier columns ─
ALTER TABLE credential_scan_log
    ADD COLUMN IF NOT EXISTS scan_method scan_method DEFAULT 'keyboard',
    ADD COLUMN IF NOT EXISTS scanned_identifier TEXT;

COMMENT ON COLUMN credential_scan_log.scan_method
    IS 'Input method used for this scan (keyboard, camera, rfid, nfc, file, api)';
COMMENT ON COLUMN credential_scan_log.scanned_identifier
    IS 'Raw identifier value that was scanned (barcode, RFID tag, NFC serial)';

-- ─── 4. Scan Events (assets) — scan method column ─────────────
ALTER TABLE scan_events
    ADD COLUMN IF NOT EXISTS scan_method scan_method DEFAULT 'keyboard';

COMMENT ON COLUMN scan_events.scan_method
    IS 'Input method used for this asset scan event';

-- ─── 5. Assets — NFC tag column ───────────────────────────────
ALTER TABLE assets
    ADD COLUMN IF NOT EXISTS nfc_tag TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_assets_nfc_tag
    ON assets (organization_id, nfc_tag)
    WHERE nfc_tag IS NOT NULL;

COMMENT ON COLUMN assets.nfc_tag
    IS 'NFC tag serial number associated with this asset';

-- ─── 6. Lookup indexes for multi-identifier credential scan ───
-- barcode_value already has a unique index from 051
-- rfid_tag already has a partial unique index from 051
-- Add a composite index for fast org-scoped lookups
CREATE INDEX IF NOT EXISTS idx_credential_assignments_org_barcode
    ON credential_assignments (organization_id, barcode_value);

CREATE INDEX IF NOT EXISTS idx_credential_assignments_org_rfid
    ON credential_assignments (organization_id, rfid_tag)
    WHERE rfid_tag IS NOT NULL;

-- ─── 7. Lookup indexes for multi-identifier asset scan ────────
CREATE INDEX IF NOT EXISTS idx_assets_org_barcode
    ON assets (organization_id, barcode)
    WHERE barcode IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_assets_org_rfid
    ON assets (organization_id, rfid_tag)
    WHERE rfid_tag IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_assets_org_nfc
    ON assets (organization_id, nfc_tag)
    WHERE nfc_tag IS NOT NULL;

-- ─── 8. Scan events — index for asset history queries ─────────
CREATE INDEX IF NOT EXISTS idx_scan_events_asset_scanned_at
    ON scan_events (asset_id, scanned_at DESC);

COMMIT;
