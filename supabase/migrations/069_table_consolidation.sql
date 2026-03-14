-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 069: Table Consolidation — HARD DROP
-- Resolves SCHEMA_OPTIMIZATION_PLAN §4 — Duplicate/Overlapping Tables
--
-- No backward compatibility. No real users exist.
-- Drops deprecated tables outright after migrating any data to canonical targets.
--
-- Drops:
--   knowledge_base_articles (003) — canonical: knowledge_articles (033)
--   custom_fields (005)           — canonical: custom_field_definitions (034/061)
--   custom_field_values (005)     — canonical: custom_field_values with field_definition_id (061)
--   compliance_requirements (008) — canonical: compliance_templates (011)
--   vendor_compliance_docs (008)  — canonical: worker_compliance_docs (011)
--   vendor_reviews (008)          — canonical: worker_reviews (011)
--   automation_logs (005)         — canonical: automation_executions (034/061)
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. knowledge_base_articles → knowledge_articles
--    Migrate any rows, then drop.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO knowledge_articles (id, title, body, category, tags, status, version, author_id, published_at, organization_id, created_at, updated_at)
SELECT
    kba.id,
    kba.title,
    kba.content,
    COALESCE(kba.category::TEXT, 'guide'),
    kba.tags,
    COALESCE(kba.status::TEXT, 'draft'),
    kba.version,
    kba.author_id,
    kba.published_at,
    kba.organization_id,
    kba.created_at,
    kba.updated_at
FROM knowledge_base_articles kba
WHERE NOT EXISTS (SELECT 1 FROM knowledge_articles ka WHERE ka.id = kba.id)
ON CONFLICT (id) DO NOTHING;

DROP TABLE knowledge_base_articles CASCADE;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. custom_fields → custom_field_definitions
--    Migrate definitions, then drop custom_fields.
--    custom_field_values stays but drops its FK to custom_fields.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO custom_field_definitions (id, name, field_key, field_type, entity_types, options, default_value, is_required, is_filterable, display_order, organization_id, created_by, created_at, updated_at)
SELECT
    cf.id,
    cf.name,
    cf.field_key,
    cf.field_type::TEXT,
    ARRAY[cf.entity_type::TEXT],
    cf.options,
    cf.default_value,
    cf.is_required,
    cf.is_filterable,
    cf.display_order,
    cf.organization_id,
    cf.created_by,
    cf.created_at,
    cf.updated_at
FROM custom_fields cf
WHERE NOT EXISTS (SELECT 1 FROM custom_field_definitions cfd WHERE cfd.id = cf.id)
ON CONFLICT (id) DO NOTHING;

-- Backfill custom_field_values.field_definition_id from custom_field_id where possible
UPDATE custom_field_values cfv
SET field_definition_id = cfv.custom_field_id
WHERE cfv.field_definition_id IS NULL
  AND cfv.custom_field_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM custom_field_definitions cfd WHERE cfd.id = cfv.custom_field_id);

-- Drop the old FK column referencing custom_fields, then drop the table
ALTER TABLE custom_field_values DROP COLUMN IF EXISTS custom_field_id;
DROP TABLE custom_fields CASCADE;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. compliance_requirements (008) → compliance_templates (011)
-- ─────────────────────────────────────────────────────────────────────────────

DROP TABLE compliance_requirements CASCADE;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. vendor_compliance_docs (008) → worker_compliance_docs (011)
-- ─────────────────────────────────────────────────────────────────────────────

DROP TABLE vendor_compliance_docs CASCADE;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. vendor_reviews (008) → worker_reviews (011)
-- ─────────────────────────────────────────────────────────────────────────────

DROP TABLE vendor_reviews CASCADE;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. automation_logs (005) → automation_executions (034/061)
-- ─────────────────────────────────────────────────────────────────────────────

DROP TABLE automation_logs CASCADE;

COMMIT;
