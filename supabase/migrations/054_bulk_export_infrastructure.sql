-- ============================================================================
-- Migration 051: Bulk Import/Export Infrastructure
--
-- New tables: bulk_import_jobs, export_templates
-- New enums: bulk_job_status
--
-- Dependencies: 001 (organizations), 041 (get_user_org_ids)
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: ENUMS
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
    CREATE TYPE bulk_job_status AS ENUM (
        'pending', 'validating', 'processing',
        'completed', 'failed', 'cancelled'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: bulk_import_jobs
-- Tracks CSV/XLSX import jobs with row counts and error details.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bulk_import_jobs (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Job definition
    entity_type       TEXT NOT NULL,
    target_pool_id    UUID,
    file_name         TEXT NOT NULL,
    file_size_bytes   INTEGER,

    -- Status
    status            bulk_job_status NOT NULL DEFAULT 'pending',

    -- Progress
    total_rows        INTEGER DEFAULT 0,
    processed_rows    INTEGER DEFAULT 0,
    error_rows        INTEGER DEFAULT 0,
    skipped_rows      INTEGER DEFAULT 0,

    -- Results
    error_details     JSONB DEFAULT '[]'::jsonb,
    result_summary    JSONB DEFAULT '{}'::jsonb,

    -- Timing
    started_at        TIMESTAMPTZ,
    completed_at      TIMESTAMPTZ,

    -- Audit
    created_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bulk_import_jobs_org
    ON bulk_import_jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_bulk_import_jobs_status
    ON bulk_import_jobs(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: export_templates
-- Configurable export formats per provider (column mapping, format, branding).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS export_templates (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Template definition
    name              TEXT NOT NULL,
    entity_type       TEXT NOT NULL,
    format            TEXT NOT NULL CHECK (format IN ('csv', 'xlsx', 'pdf', 'json')),

    -- Mapping
    column_mapping    JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- Provider association
    provider_key      TEXT,

    -- Options
    include_branding  BOOLEAN NOT NULL DEFAULT false,
    is_default        BOOLEAN NOT NULL DEFAULT false,

    -- Audit
    created_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE(organization_id, name, entity_type)
);

CREATE INDEX IF NOT EXISTS idx_export_templates_org
    ON export_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_export_templates_entity
    ON export_templates(entity_type);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
    CREATE TRIGGER trg_bulk_import_jobs_updated_at
        BEFORE UPDATE ON bulk_import_jobs
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_export_templates_updated_at
        BEFORE UPDATE ON export_templates
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE bulk_import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_templates ENABLE ROW LEVEL SECURITY;

-- bulk_import_jobs
CREATE POLICY "bulk_import_jobs_select" ON bulk_import_jobs
    FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );
CREATE POLICY "bulk_import_jobs_insert" ON bulk_import_jobs
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );
CREATE POLICY "bulk_import_jobs_update" ON bulk_import_jobs
    FOR UPDATE USING (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );

-- export_templates
CREATE POLICY "export_templates_select" ON export_templates
    FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );
CREATE POLICY "export_templates_insert" ON export_templates
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );
CREATE POLICY "export_templates_update" ON export_templates
    FOR UPDATE USING (
        auth.uid() IS NOT NULL
        AND organization_id = ANY(get_user_org_ids())
    );
