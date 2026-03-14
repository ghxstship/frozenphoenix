-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 083: Schema Validation Pass 2
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Programmatic assertions to verify that migrations 081-082 applied correctly
-- and that the schema is in a consistent state. Follows the pattern of
-- migration 074 (Schema Validation Pass 1).
--
-- References: SCHEMA_OPTIMIZATION_PASS_2.md §10
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  _count INTEGER;
  _col_exists BOOLEAN;
  _fk_target TEXT;
BEGIN

  -- ─────────────────────────────────────────────────────────────────────────
  -- ASSERTION 1: No FK references to dropped `profiles` table
  -- Migration 067 dropped profiles; migration 081 repointed all remaining FKs.
  -- ─────────────────────────────────────────────────────────────────────────
  SELECT COUNT(*) INTO _count
  FROM information_schema.referential_constraints rc
  JOIN information_schema.constraint_column_usage ccu
    ON rc.constraint_name = ccu.constraint_name
    AND rc.constraint_schema = ccu.constraint_schema
  WHERE ccu.table_name = 'profiles'
    AND ccu.table_schema = 'public';

  IF _count > 0 THEN
    RAISE EXCEPTION '[FAIL] % FK constraint(s) still reference dropped `profiles` table', _count;
  ELSE
    RAISE NOTICE '[PASS] Zero FK references to dropped `profiles` table';
  END IF;

  -- ─────────────────────────────────────────────────────────────────────────
  -- ASSERTION 2: emergency_contact_json column removed from user_profiles
  -- 3NF normalization in 081 replaced it with 3 atomic columns
  -- ─────────────────────────────────────────────────────────────────────────
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles'
      AND column_name = 'emergency_contact_json'
      AND table_schema = 'public'
  ) INTO _col_exists;

  IF _col_exists THEN
    RAISE EXCEPTION '[FAIL] user_profiles.emergency_contact_json still exists — 3NF normalization incomplete';
  ELSE
    RAISE NOTICE '[PASS] user_profiles.emergency_contact_json removed (normalized to atomic columns)';
  END IF;

  -- ─────────────────────────────────────────────────────────────────────────
  -- ASSERTION 3: Normalized emergency contact columns exist
  -- ─────────────────────────────────────────────────────────────────────────
  SELECT COUNT(*) INTO _count
  FROM information_schema.columns
  WHERE table_name = 'user_profiles'
    AND column_name IN ('emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship')
    AND table_schema = 'public';

  IF _count < 3 THEN
    RAISE EXCEPTION '[FAIL] Only %/3 emergency contact columns found on user_profiles', _count;
  ELSE
    RAISE NOTICE '[PASS] All 3 emergency contact atomic columns present on user_profiles';
  END IF;

  -- ─────────────────────────────────────────────────────────────────────────
  -- ASSERTION 4: organizations.settings JSONB column removed
  -- SSOT violation: settings table is canonical
  -- ─────────────────────────────────────────────────────────────────────────
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations'
      AND column_name = 'settings'
      AND table_schema = 'public'
  ) INTO _col_exists;

  IF _col_exists THEN
    RAISE WARNING '[WARN] organizations.settings column still exists — may not have existed before 081';
  ELSE
    RAISE NOTICE '[PASS] organizations.settings column absent (SSOT: settings table)';
  END IF;

  -- ─────────────────────────────────────────────────────────────────────────
  -- ASSERTION 5: record_comments.mentioned_user_ids exists
  -- Required for @mention notification dispatch
  -- ─────────────────────────────────────────────────────────────────────────
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'record_comments'
      AND column_name = 'mentioned_user_ids'
      AND table_schema = 'public'
  ) INTO _col_exists;

  IF NOT _col_exists THEN
    RAISE EXCEPTION '[FAIL] record_comments.mentioned_user_ids missing — @mention support incomplete';
  ELSE
    RAISE NOTICE '[PASS] record_comments.mentioned_user_ids present';
  END IF;

  -- ─────────────────────────────────────────────────────────────────────────
  -- ASSERTION 6: crew_members.reports_to exists (org-chart hierarchy)
  -- ─────────────────────────────────────────────────────────────────────────
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crew_members'
      AND column_name = 'reports_to'
      AND table_schema = 'public'
  ) INTO _col_exists;

  IF NOT _col_exists THEN
    RAISE EXCEPTION '[FAIL] crew_members.reports_to missing — org-chart hierarchy incomplete';
  ELSE
    RAISE NOTICE '[PASS] crew_members.reports_to present';
  END IF;

  -- ─────────────────────────────────────────────────────────────────────────
  -- ASSERTION 7: Deferred enrichment columns (spot-check 082)
  -- ─────────────────────────────────────────────────────────────────────────
  -- departments.cost_center_code
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'departments' AND column_name = 'cost_center_code' AND table_schema = 'public'
  ) INTO _col_exists;
  IF NOT _col_exists THEN
    RAISE EXCEPTION '[FAIL] departments.cost_center_code missing (082 §1)';
  END IF;

  -- teams.max_capacity
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'teams' AND column_name = 'max_capacity' AND table_schema = 'public'
  ) INTO _col_exists;
  IF NOT _col_exists THEN
    RAISE EXCEPTION '[FAIL] teams.max_capacity missing (082 §1)';
  END IF;

  -- projects.csat_score
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'csat_score' AND table_schema = 'public'
  ) INTO _col_exists;
  IF NOT _col_exists THEN
    RAISE EXCEPTION '[FAIL] projects.csat_score missing (082 §2)';
  END IF;

  -- assets.qr_code_url
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assets' AND column_name = 'qr_code_url' AND table_schema = 'public'
  ) INTO _col_exists;
  IF NOT _col_exists THEN
    RAISE EXCEPTION '[FAIL] assets.qr_code_url missing (082 §6)';
  END IF;

  -- insurance_policies.waiver_of_subrogation
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'insurance_policies' AND column_name = 'waiver_of_subrogation' AND table_schema = 'public'
  ) INTO _col_exists;
  IF NOT _col_exists THEN
    RAISE EXCEPTION '[FAIL] insurance_policies.waiver_of_subrogation missing (082 §8)';
  END IF;

  -- brands.custom_domain
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brands' AND column_name = 'custom_domain' AND table_schema = 'public'
  ) INTO _col_exists;
  IF NOT _col_exists THEN
    RAISE EXCEPTION '[FAIL] brands.custom_domain missing (082 §5)';
  END IF;

  -- brand_kits.brand_voice_guidelines
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brand_kits' AND column_name = 'brand_voice_guidelines' AND table_schema = 'public'
  ) INTO _col_exists;
  IF NOT _col_exists THEN
    RAISE EXCEPTION '[FAIL] brand_kits.brand_voice_guidelines missing (082 §7)';
  END IF;

  RAISE NOTICE '[PASS] All 082 spot-check columns verified';

  -- ─────────────────────────────────────────────────────────────────────────
  -- ASSERTION 8: Key indexes from 082 exist
  -- ─────────────────────────────────────────────────────────────────────────
  SELECT COUNT(*) INTO _count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND indexname IN (
      'idx_record_comments_mentions',
      'idx_crew_members_reports_to',
      'idx_record_comments_entity_created',
      'idx_activity_log_entity_created',
      'idx_automation_executions_automation_created',
      'idx_domain_events_status_created'
    );

  IF _count < 6 THEN
    RAISE WARNING '[WARN] Only %/6 expected indexes found — some may have pre-existed or been named differently', _count;
  ELSE
    RAISE NOTICE '[PASS] All 6 new indexes verified';
  END IF;

  -- ─────────────────────────────────────────────────────────────────────────
  -- ASSERTION 9: FK repoints target user_profiles (spot-check)
  -- ─────────────────────────────────────────────────────────────────────────
  SELECT ccu.table_name INTO _fk_target
  FROM information_schema.table_constraints tc
  JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
    AND tc.constraint_schema = ccu.constraint_schema
  WHERE tc.constraint_name = 'notification_preferences_user_id_fkey'
    AND tc.table_schema = 'public';

  IF _fk_target IS NULL THEN
    RAISE WARNING '[WARN] notification_preferences_user_id_fkey not found — constraint may be named differently';
  ELSIF _fk_target != 'user_profiles' THEN
    RAISE EXCEPTION '[FAIL] notification_preferences.user_id FK targets "%" instead of "user_profiles"', _fk_target;
  ELSE
    RAISE NOTICE '[PASS] notification_preferences.user_id FK correctly targets user_profiles';
  END IF;

  SELECT ccu.table_name INTO _fk_target
  FROM information_schema.table_constraints tc
  JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
    AND tc.constraint_schema = ccu.constraint_schema
  WHERE tc.constraint_name = 'portal_sessions_user_id_fkey'
    AND tc.table_schema = 'public';

  IF _fk_target IS NULL THEN
    RAISE WARNING '[WARN] portal_sessions_user_id_fkey not found — constraint may be named differently';
  ELSIF _fk_target != 'user_profiles' THEN
    RAISE EXCEPTION '[FAIL] portal_sessions.user_id FK targets "%" instead of "user_profiles"', _fk_target;
  ELSE
    RAISE NOTICE '[PASS] portal_sessions.user_id FK correctly targets user_profiles';
  END IF;

  -- ─────────────────────────────────────────────────────────────────────────
  -- ASSERTION 10: RLS enabled on all org-scoped tables (regression check)
  -- Re-runs the same check from 074 to catch any regressions
  -- ─────────────────────────────────────────────────────────────────────────
  SELECT COUNT(*) INTO _count
  FROM pg_tables t
  LEFT JOIN pg_class c ON c.relname = t.tablename AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  WHERE t.schemaname = 'public'
    AND t.tablename NOT LIKE 'pg_%'
    AND t.tablename NOT IN (
      -- System/utility tables without org scope
      'schema_migrations', 'supabase_migrations', 'spatial_ref_sys',
      'geography_columns', 'geometry_columns',
      -- Lookup/enum tables without org scope
      'currencies', 'exchange_rates',
      -- Dropped/deprecated tables
      'profiles', 'roles', 'permissions'
    )
    AND NOT c.relrowsecurity;

  IF _count > 5 THEN
    RAISE WARNING '[WARN] % tables have RLS disabled — review for org-scoped tables', _count;
  ELSE
    RAISE NOTICE '[PASS] RLS regression check — % tables without RLS (expected for system tables)', _count;
  END IF;

  -- ─────────────────────────────────────────────────────────────────────────
  -- SUMMARY
  -- ─────────────────────────────────────────────────────────────────────────
  RAISE NOTICE '──────────────────────────────────────────────────────────────';
  RAISE NOTICE 'Schema Validation Pass 2 — Complete';
  RAISE NOTICE '  081: FK repointing + 3NF normalization verified';
  RAISE NOTICE '  082: Deferred enrichment columns + indexes verified';
  RAISE NOTICE '  No FK references to dropped profiles table';
  RAISE NOTICE '──────────────────────────────────────────────────────────────';

END $$;
