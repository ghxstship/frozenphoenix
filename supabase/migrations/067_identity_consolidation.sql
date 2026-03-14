-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 067: Identity Consolidation — HARD CUT
-- Resolves SCHEMA_OPTIMIZATION_PLAN §3.1 — Identity Fragmentation
--
-- No backward compatibility. No real users exist.
--
-- 1. Links worker_profiles → user_profiles via FK
-- 2. Dynamically repoints ALL FKs from profiles(id) → user_profiles(id)
-- 3. Migrates any profiles rows into user_profiles + org_memberships
-- 4. Rewrites handle_new_user() to write ONLY to user_profiles + org_memberships
-- 5. Rewrites get_user_org_id() to read ONLY from org_memberships
-- 6. Drops profiles table, trigger, RLS policies
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Add user_profile_id FK to worker_profiles
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE worker_profiles
    ADD COLUMN IF NOT EXISTS user_profile_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_worker_profiles_user_profile
    ON worker_profiles(user_profile_id) WHERE user_profile_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Migrate profiles → user_profiles + org_memberships
--    Copy any rows that exist in profiles but not yet in user_profiles.
--    Since both PKs are auth.users(id), UUIDs are identical.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO user_profiles (id, email, display_name, lifecycle_status)
SELECT p.id, p.email, p.name, 'active'
FROM profiles p
WHERE NOT EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = p.id)
ON CONFLICT (id) DO NOTHING;

INSERT INTO org_memberships (user_id, organization_id, role, status, is_default_org)
SELECT p.id, p.organization_id, p.role, 'active', true
FROM profiles p
WHERE p.organization_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM org_memberships om
      WHERE om.user_id = p.id AND om.organization_id = p.organization_id
  )
ON CONFLICT (user_id, organization_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Dynamically repoint ALL foreign keys from profiles(id) → user_profiles(id)
--    Discovers every FK constraint at runtime and swaps the target.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    r RECORD;
    fk_columns TEXT;
    on_delete_action TEXT;
BEGIN
    FOR r IN
        SELECT
            tc.constraint_name,
            tc.table_schema,
            tc.table_name,
            kcu.column_name,
            rc.delete_rule
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        JOIN information_schema.referential_constraints rc
            ON tc.constraint_name = rc.constraint_name
            AND tc.table_schema = rc.constraint_schema
        JOIN information_schema.constraint_column_usage ccu
            ON rc.unique_constraint_name = ccu.constraint_name
            AND rc.unique_constraint_schema = ccu.constraint_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
          AND ccu.table_name = 'profiles'
          AND ccu.column_name = 'id'
        ORDER BY tc.table_name, kcu.column_name
    LOOP
        -- Map delete_rule to SQL syntax
        on_delete_action := CASE r.delete_rule
            WHEN 'CASCADE' THEN 'ON DELETE CASCADE'
            WHEN 'SET NULL' THEN 'ON DELETE SET NULL'
            WHEN 'SET DEFAULT' THEN 'ON DELETE SET DEFAULT'
            WHEN 'RESTRICT' THEN 'ON DELETE RESTRICT'
            ELSE ''
        END;

        -- Drop old FK
        EXECUTE format(
            'ALTER TABLE %I.%I DROP CONSTRAINT %I',
            r.table_schema, r.table_name, r.constraint_name
        );

        -- Add new FK pointing to user_profiles
        EXECUTE format(
            'ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES user_profiles(id) %s',
            r.table_schema, r.table_name, r.constraint_name, r.column_name, on_delete_action
        );

        RAISE NOTICE 'Repointed FK: %.% (%) → user_profiles(id)',
            r.table_name, r.column_name, r.constraint_name;
    END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Rewrite handle_new_user() — user_profiles + org_memberships ONLY
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_org_id UUID;
    display TEXT;
BEGIN
    display := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));

    SELECT id INTO default_org_id FROM organizations WHERE slug = 'default' LIMIT 1;

    IF default_org_id IS NULL THEN
        INSERT INTO organizations (name, slug) VALUES ('Default Organization', 'default')
        RETURNING id INTO default_org_id;
    END IF;

    INSERT INTO user_profiles (id, email, display_name, lifecycle_status)
    VALUES (NEW.id, NEW.email, display, 'onboarding')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO org_memberships (user_id, organization_id, role, status, is_default_org)
    VALUES (NEW.id, default_org_id, 'pm', 'active', true)
    ON CONFLICT (user_id, organization_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Rewrite get_user_org_id() — org_memberships ONLY, no fallback
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
    SELECT organization_id FROM org_memberships
    WHERE user_id = auth.uid() AND is_default_org = true AND status = 'active'
    LIMIT 1
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Drop profiles table (CASCADE removes trigger, RLS policies, indexes)
-- ─────────────────────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP TABLE profiles CASCADE;

COMMIT;
