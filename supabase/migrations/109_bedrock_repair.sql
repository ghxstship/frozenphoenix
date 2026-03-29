-- ============================================================
-- Migration 109: BEDROCK Repair — Remaining Batch 1 Fixes
-- Applies statements that failed in 108 due to column name mismatch
-- ============================================================

-- Fix: schedule_entries uses start_datetime/end_datetime, not start_time/end_time
CREATE INDEX IF NOT EXISTS idx_schedule_entries_time_range
    ON schedule_entries(start_datetime, end_datetime);

-- ============================================================
-- Cached Name Sync Triggers (3NF compliance)
-- ============================================================

-- When a location name changes, update schedule_entries.location_name
CREATE OR REPLACE FUNCTION sync_schedule_location_name()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.name IS DISTINCT FROM NEW.name THEN
        UPDATE schedule_entries
        SET location_name = NEW.name
        WHERE location_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sync_schedule_location_name_trigger ON locations;
CREATE TRIGGER sync_schedule_location_name_trigger
    AFTER UPDATE ON locations
    FOR EACH ROW
    EXECUTE FUNCTION sync_schedule_location_name();

-- When a vendor name changes, update shipments.carrier_name
CREATE OR REPLACE FUNCTION sync_shipment_carrier_name()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.name IS DISTINCT FROM NEW.name THEN
        UPDATE shipments
        SET carrier_name = NEW.name
        WHERE carrier_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sync_shipment_carrier_name_trigger ON vendors;
CREATE TRIGGER sync_shipment_carrier_name_trigger
    AFTER UPDATE ON vendors
    FOR EACH ROW
    EXECUTE FUNCTION sync_shipment_carrier_name();

-- ============================================================
-- Remove redundant contracts.amendment_ids array
-- Already tracked via contract_amendments.contract_id FK
-- ============================================================
ALTER TABLE contracts DROP COLUMN IF EXISTS amendment_ids;
