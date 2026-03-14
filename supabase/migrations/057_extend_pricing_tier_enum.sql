-- ═══════════════════════════════════════════════════════════════
-- Migration 057: Extend pricing_tier enum
-- Must be its own migration so Postgres commits the new values
-- before they are referenced in functions (migration 059).
-- ═══════════════════════════════════════════════════════════════

ALTER TYPE pricing_tier ADD VALUE IF NOT EXISTS 'starter' BEFORE 'core';
ALTER TYPE pricing_tier ADD VALUE IF NOT EXISTS 'team' AFTER 'core';
