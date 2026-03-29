-- ============================================================
-- Migration 108: BEDROCK Critical Schema Fixes
-- Protocol: FP-DATA-BEDROCK-001 · Batch 1
-- Description: Zero-downtime critical fixes identified by BEDROCK audit
-- ============================================================

-- ============================================================
-- 1. Custom Field Values UNIQUE Constraint
-- Prevents duplicate values for same field+entity combination
-- Without this, an entity could have MULTIPLE values for the same
-- custom field definition, violating SSOT.
-- ============================================================
ALTER TABLE custom_field_values
    ADD CONSTRAINT uq_cfv_definition_entity
    UNIQUE (field_definition_id, entity_id);

-- ============================================================
-- 2. Drop DUAL STORAGE JSONB Columns
-- These JSONB columns store the same data as normalized tables,
-- creating SSOT violations. The normalized tables are canonical.
-- ============================================================

-- goods_receipts.line_items is redundant with goods_receipt_lines table
ALTER TABLE goods_receipts DROP COLUMN IF EXISTS line_items;

-- shipments.items is redundant with shipment_items table
ALTER TABLE shipments DROP COLUMN IF EXISTS items;

-- ============================================================
-- 3. Missing Polymorphic Indexes
-- These entity_type+entity_id pairs are queried on every detail
-- page load but lack indexes for efficient lookup.
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_custom_field_values_entity
    ON custom_field_values(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_record_comments_entity
    ON record_comments(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_record_activity_log_entity
    ON record_activity_log(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_entity_tag_assignments_entity
    ON entity_tag_assignments(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_schedule_entries_time_range
    ON schedule_entries(start_datetime, end_datetime);

-- ============================================================
-- 4. Cached Name Sync Triggers (3NF compliance)
-- These triggers keep denormalized name columns in sync
-- when the source entity is renamed.
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
-- 5. Remove redundant contracts.amendment_ids array
-- Already tracked via contract_amendments.contract_id FK
-- ============================================================
ALTER TABLE contracts DROP COLUMN IF EXISTS amendment_ids;
