-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 073: Enum Hygiene
-- Resolves SCHEMA_OPTIMIZATION_PLAN §8 — Enum Consolidation
--
-- 1. Merge call_sheet_status and tech_sheet_status into unified sheet_status
-- 2. Extend sow_status with missing lifecycle values
-- 3. Extend booking_status with missing workflow values
-- 4. Add missing values to entity_type enum
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Unified sheet_status enum
--    call_sheet_status: draft, published, distributed, acknowledged, archived
--    tech_sheet_status: draft, reviewed, approved, distributed, archived
--    Merged superset: draft, reviewed, approved, published, distributed,
--                     acknowledged, archived
--
--    We create a new unified enum and migrate the columns. The old enums
--    are preserved (cannot DROP TYPE if columns still reference them).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TYPE sheet_status AS ENUM (
    'draft',
    'reviewed',
    'approved',
    'published',
    'distributed',
    'acknowledged',
    'archived'
);

-- Migrate call_sheets.status to the unified enum
ALTER TABLE call_sheets
    ALTER COLUMN status DROP DEFAULT;
ALTER TABLE call_sheets
    ALTER COLUMN status TYPE sheet_status
    USING status::TEXT::sheet_status;
ALTER TABLE call_sheets
    ALTER COLUMN status SET DEFAULT 'draft';

-- Migrate tech_sheets.status to the unified enum
ALTER TABLE tech_sheets
    ALTER COLUMN status DROP DEFAULT;
ALTER TABLE tech_sheets
    ALTER COLUMN status TYPE sheet_status
    USING status::TEXT::sheet_status;
ALTER TABLE tech_sheets
    ALTER COLUMN status SET DEFAULT 'draft';

-- Drop the old enums now that no columns reference them
DROP TYPE IF EXISTS call_sheet_status;
DROP TYPE IF EXISTS tech_sheet_status;

COMMENT ON TYPE sheet_status IS
    'Unified status enum for call sheets and tech sheets. '
    'Merged from call_sheet_status + tech_sheet_status in migration 073.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Extend sow_status with missing lifecycle values
--    Current: draft, pending_review, pending_approval, approved, active,
--             on_hold, completed, cancelled, amended
--    Adding: expired, superseded (common SOW lifecycle states)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TYPE sow_status ADD VALUE IF NOT EXISTS 'expired';
ALTER TYPE sow_status ADD VALUE IF NOT EXISTS 'superseded';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Extend booking_status with missing workflow values
--    Current: tentative, confirmed, cancelled
--    Adding: requested, declined, completed, no_show
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'requested';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'declined';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'completed';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'no_show';

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Extend entity_type with missing entity references
--    Current: project, task, deal, contact, company, crew_member, asset,
--             invoice, proposal, document
--    Adding types referenced in custom_field_definitions, record_comments,
--    record_activity_log, and email_messages.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TYPE entity_type ADD VALUE IF NOT EXISTS 'worker_profile';
ALTER TYPE entity_type ADD VALUE IF NOT EXISTS 'event';
ALTER TYPE entity_type ADD VALUE IF NOT EXISTS 'campaign';
ALTER TYPE entity_type ADD VALUE IF NOT EXISTS 'creative_brief';
ALTER TYPE entity_type ADD VALUE IF NOT EXISTS 'sow';
ALTER TYPE entity_type ADD VALUE IF NOT EXISTS 'purchase_order';
ALTER TYPE entity_type ADD VALUE IF NOT EXISTS 'service_request';
ALTER TYPE entity_type ADD VALUE IF NOT EXISTS 'opportunity';

COMMIT;
