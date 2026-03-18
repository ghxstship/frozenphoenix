-- ============================================================================
-- Migration 101: Fix pricing_tier enum + Seed 3-Tier Pricing
--
-- The pricing_tier enum was created in migration 031 with values:
--   core, pro, enterprise (extended with starter, team in 057)
-- Migration 098 attempted to CREATE TYPE pricing_tier with basic/standard/premium
-- but silently skipped because the type already existed.
--
-- This migration adds the missing enum values and seeds pricing data.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: Add missing pricing_tier enum values
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TYPE pricing_tier ADD VALUE IF NOT EXISTS 'basic';
ALTER TYPE pricing_tier ADD VALUE IF NOT EXISTS 'standard';
ALTER TYPE pricing_tier ADD VALUE IF NOT EXISTS 'premium';
