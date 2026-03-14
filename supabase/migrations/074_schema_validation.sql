-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 074: Schema Validation — Hard-Cut Assertions
-- Resolves SCHEMA_OPTIMIZATION_PLAN §Phase 5 — Validation
--
-- Validates the hardened schema post-remediation (067-073).
-- Uses RAISE EXCEPTION for critical failures (blocks deployment).
-- Uses RAISE WARNING for non-blocking advisories.
--
-- Checks:
--   1. Dropped tables must NOT exist
--   2. No FK references to dropped tables survive
--   3. All org-scoped tables have RLS enabled
--   4. New tables/indexes from 067-073 exist
--   5. sheet_status enum exists, old enums are gone
--   6. Departments seeded
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- CHECK 1: Dropped tables MUST NOT exist
--   profiles (067), knowledge_base_articles, custom_fields,
--   compliance_requirements, vendor_compliance_docs, vendor_reviews,
--   automation_logs (all 069)
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    dropped_tables TEXT[] := ARRAY[
        'profiles',
        'knowledge_base_articles',
        'custom_fields',
        'compliance_requirements',
        'vendor_compliance_docs',
        'vendor_reviews',
        'automation_logs'
    ];
    tbl TEXT;
    survivors TEXT := '';
BEGIN
    FOREACH tbl IN ARRAY dropped_tables LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = tbl
        ) THEN
            survivors := survivors || tbl || ', ';
        END IF;
    END LOOP;

    IF survivors != '' THEN
        RAISE EXCEPTION '[074 VALIDATION FAIL] Tables that should have been dropped still exist: %', rtrim(survivors, ', ');
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- CHECK 2: No FK constraints reference the dropped tables
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    zombie_fks TEXT;
BEGIN
    SELECT string_agg(
        tc.constraint_name || ' (' || tc.table_name || ' → ' || ccu.table_name || ')',
        ', '
    )
    INTO zombie_fks
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
        AND tc.table_schema = ccu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND ccu.table_name IN (
          'profiles', 'knowledge_base_articles', 'custom_fields',
          'compliance_requirements', 'vendor_compliance_docs',
          'vendor_reviews', 'automation_logs'
      );

    IF zombie_fks IS NOT NULL AND zombie_fks != '' THEN
        RAISE EXCEPTION '[074 VALIDATION FAIL] Zombie FK constraints still reference dropped tables: %', zombie_fks;
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- CHECK 3: All FKs that formerly pointed to profiles now point to user_profiles
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    up_fk_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO up_fk_count
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
        AND tc.table_schema = ccu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND ccu.table_name = 'user_profiles'
      AND ccu.column_name = 'id';

    IF up_fk_count < 10 THEN
        RAISE WARNING '[074 VALIDATION] Only % FK constraints point to user_profiles(id). Expected many more after repointing.', up_fk_count;
    ELSE
        RAISE NOTICE '[074 OK] % FK constraints now reference user_profiles(id)', up_fk_count;
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- CHECK 4: RLS enabled on all tables with organization_id column
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    missing_rls TEXT;
BEGIN
    SELECT string_agg(c.relname::TEXT, ', ')
    INTO missing_rls
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_attribute a ON a.attrelid = c.oid
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND a.attname = 'organization_id'
      AND a.attnum > 0
      AND NOT a.attisdropped
      AND NOT c.relrowsecurity;

    IF missing_rls IS NOT NULL AND missing_rls != '' THEN
        RAISE WARNING '[074 VALIDATION] Tables with organization_id but NO RLS: %', missing_rls;
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- CHECK 5: New tables from 067-073 exist
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    expected_tables TEXT[] := ARRAY[
        'brief_deliverables',
        'departments'
    ];
    missing TEXT := '';
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY expected_tables LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = tbl
        ) THEN
            missing := missing || tbl || ', ';
        END IF;
    END LOOP;

    IF missing != '' THEN
        RAISE EXCEPTION '[074 VALIDATION FAIL] Missing expected tables: %', rtrim(missing, ', ');
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- CHECK 6: worker_profiles.user_profile_id column exists (from 067)
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'worker_profiles'
          AND column_name = 'user_profile_id'
    ) THEN
        RAISE EXCEPTION '[074 VALIDATION FAIL] worker_profiles.user_profile_id column missing (067)';
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- CHECK 7: Critical indexes from 072 exist
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    expected_indexes TEXT[] := ARRAY[
        'idx_org_memberships_user_status',
        'idx_org_memberships_user_role_status',
        'idx_tasks_project_status_assignee',
        'idx_deals_org_stage',
        'idx_projects_org_status',
        'idx_worker_profiles_org_lifecycle',
        'idx_notifications_user_unread_recent'
    ];
    missing TEXT := '';
    idx TEXT;
BEGIN
    FOREACH idx IN ARRAY expected_indexes LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE schemaname = 'public' AND indexname = idx
        ) THEN
            missing := missing || idx || ', ';
        END IF;
    END LOOP;

    IF missing != '' THEN
        RAISE WARNING '[074 VALIDATION] Missing expected indexes: %', rtrim(missing, ', ');
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- CHECK 8: sheet_status enum exists, old enums dropped (073)
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public' AND t.typname = 'sheet_status'
    ) THEN
        RAISE EXCEPTION '[074 VALIDATION FAIL] sheet_status enum missing (073)';
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public' AND t.typname IN ('call_sheet_status', 'tech_sheet_status')
    ) THEN
        RAISE EXCEPTION '[074 VALIDATION FAIL] Stale enums call_sheet_status/tech_sheet_status still exist (073 should have dropped them)';
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- CHECK 9: Departments seeded for all organizations
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    orgs_without_depts INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO orgs_without_depts
    FROM organizations o
    WHERE NOT EXISTS (
        SELECT 1 FROM departments d WHERE d.organization_id = o.id
    );

    IF orgs_without_depts > 0 THEN
        RAISE WARNING '[074 VALIDATION] % organization(s) have no departments seeded', orgs_without_depts;
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- VALIDATION COMPLETE
-- ─────────────────────────────────────────────────────────────────────────────

COMMENT ON SCHEMA public IS
    'Schema validated through migration 074 (hard-cut remediation). '
    'Identity: user_profiles is SOLE canonical identity (profiles DROPPED). '
    'Dropped: profiles, knowledge_base_articles, custom_fields, '
    'compliance_requirements, vendor_compliance_docs, vendor_reviews, automation_logs. '
    'Canonical tables: user_profiles, org_memberships, knowledge_articles, '
    'custom_field_definitions, compliance_templates, worker_compliance_docs, '
    'worker_reviews, automation_executions.';

COMMIT;
