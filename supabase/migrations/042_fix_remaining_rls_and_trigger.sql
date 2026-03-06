-- ═══════════════════════════════════════════════════════════════════════════
-- FIX: Remaining RLS recursion + harden handle_new_user trigger
-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 041 used wrong policy names for settings (dropped settings_read
-- instead of settings_read_own_scope). This migration fixes the actual
-- policy names from migration 026 and also fixes feature_flags, feature_flag
-- overrides, and settings_change_log policies that still had direct
-- SELECT ... FROM org_memberships subqueries.
--
-- Also restores exception handling in handle_new_user trigger that was
-- removed in migration 038 (originally added in migration 024).
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: FIX settings policies (correct names from migration 026)
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'settings') THEN
        DROP POLICY IF EXISTS "settings_read_own_scope" ON settings;
        DROP POLICY IF EXISTS "settings_write_admin" ON settings;

        CREATE POLICY "settings_read_own_scope" ON settings
            FOR SELECT USING (
                auth.uid() IS NOT NULL
                AND (
                    scope_type IN ('platform', 'environment')
                    OR (scope_type = 'organization' AND scope_id = ANY(get_user_org_ids()))
                    OR (scope_type = 'user' AND scope_id = auth.uid())
                    OR (scope_type = 'project' AND scope_id IN (
                        SELECT project_id FROM project_members
                        WHERE profile_id = auth.uid() AND status = 'active'
                    ))
                )
            );

        CREATE POLICY "settings_write_admin" ON settings
            FOR ALL USING (
                auth.uid() IS NOT NULL
                AND (
                    (scope_type = 'user' AND scope_id = auth.uid())
                    OR (scope_type = 'organization' AND scope_id = ANY(get_user_exec_org_ids()))
                )
            );
    END IF;
END $$;

-- Also drop the incorrectly-created policies from migration 041
-- (they were created with new names since the old names didn't exist)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'settings') THEN
        DROP POLICY IF EXISTS "settings_read" ON settings;
        DROP POLICY IF EXISTS "settings_write" ON settings;
        DROP POLICY IF EXISTS "settings_delete" ON settings;
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: FIX settings_change_log policy (migration 026)
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'settings_change_log') THEN
        DROP POLICY IF EXISTS "settings_change_log_read" ON settings_change_log;

        CREATE POLICY "settings_change_log_read" ON settings_change_log
            FOR SELECT USING (
                auth.uid() IS NOT NULL
                AND (
                    scope_type IN ('platform', 'environment')
                    OR (scope_type = 'organization' AND scope_id = ANY(get_user_exec_org_ids()))
                    OR (scope_type = 'user' AND scope_id = auth.uid())
                )
            );
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: FIX feature_flags manage policies (migration 027)
-- The _read policies are safe (auth.uid() IS NOT NULL only).
-- The _manage policies use EXISTS(SELECT FROM org_memberships) → recursion.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feature_flags') THEN
        DROP POLICY IF EXISTS "feature_flags_manage" ON feature_flags;

        CREATE POLICY "feature_flags_manage" ON feature_flags
            FOR ALL USING (
                auth.uid() IS NOT NULL
                AND is_exec()
            );
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feature_flag_overrides') THEN
        DROP POLICY IF EXISTS "feature_flag_overrides_manage" ON feature_flag_overrides;

        CREATE POLICY "feature_flag_overrides_manage" ON feature_flag_overrides
            FOR ALL USING (
                auth.uid() IS NOT NULL
                AND is_exec()
            );
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: HARDEN handle_new_user trigger
-- Restore exception handling from migration 024 that was removed in 038.
-- Each INSERT is wrapped in BEGIN...EXCEPTION so that failures in downstream
-- tables do NOT abort the auth.users INSERT transaction.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_org_id UUID;
    matching_org RECORD;
    user_display_name TEXT;
    user_domain TEXT;
    org_found BOOLEAN := false;
BEGIN
    user_display_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
    user_domain := split_part(NEW.email, '@', 2);

    -- ── 1. Create user_profile ──
    BEGIN
        INSERT INTO user_profiles (id, email, display_name, lifecycle_status)
        VALUES (
            NEW.id,
            NEW.email,
            user_display_name,
            CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN 'onboarding' ELSE 'pending_verification' END
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            display_name = EXCLUDED.display_name;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'handle_new_user: failed to upsert user_profiles: % %', SQLERRM, SQLSTATE;
    END;

    -- ── 2. Get or create default organization ──
    BEGIN
        SELECT id INTO default_org_id FROM organizations WHERE slug = 'default' LIMIT 1;
        IF default_org_id IS NULL THEN
            INSERT INTO organizations (name, slug) VALUES ('Default Organization', 'default')
            RETURNING id INTO default_org_id;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'handle_new_user: failed to get/create default org: % %', SQLERRM, SQLSTATE;
        RETURN NEW;
    END;

    -- ── 3. Legacy profiles row (backward compatibility) ──
    BEGIN
        INSERT INTO profiles (id, email, name, organization_id)
        VALUES (NEW.id, NEW.email, user_display_name, default_org_id)
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            name = EXCLUDED.name,
            organization_id = COALESCE(profiles.organization_id, EXCLUDED.organization_id);
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'handle_new_user: failed to upsert profiles: % %', SQLERRM, SQLSTATE;
    END;

    -- ── 4. Domain-based org auto-assignment ──
    BEGIN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'organizations'
              AND column_name = 'sso_domain'
        ) THEN
            FOR matching_org IN
                SELECT id, default_role
                FROM organizations
                WHERE sso_domain = user_domain
                  AND sso_domain IS NOT NULL
            LOOP
                INSERT INTO org_memberships (user_id, organization_id, role, status, is_default_org, joined_at)
                VALUES (NEW.id, matching_org.id, COALESCE(matching_org.default_role, 'member'), 'active', true, NOW())
                ON CONFLICT (user_id, organization_id) DO NOTHING;
                org_found := true;
            END LOOP;
        END IF;

        -- Fallback: assign to default org as member
        IF NOT org_found THEN
            INSERT INTO org_memberships (user_id, organization_id, role, status, is_default_org, joined_at)
            VALUES (NEW.id, default_org_id, 'member', 'active', true, NOW())
            ON CONFLICT (user_id, organization_id) DO NOTHING;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'handle_new_user: failed org_memberships: % %', SQLERRM, SQLSTATE;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
