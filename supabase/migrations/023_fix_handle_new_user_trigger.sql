-- ═══════════════════════════════════════════════════════════════
-- FIX: handle_new_user trigger — resilient to missing tables
-- ═══════════════════════════════════════════════════════════════
-- The 018 migration rewrote handle_new_user() to depend on
-- user_profiles and org_memberships. If those tables (or required
-- columns like organizations.sso_domain) were never applied, the
-- trigger fails with "Database error saving new user".
--
-- This migration replaces the trigger function with a version that:
--   1. Always creates the legacy profiles row (required by FKs).
--   2. Optionally creates user_profiles + org_memberships rows
--      only when those tables exist.
--   3. Never fails on signup.
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_org_id UUID;
    user_display_name TEXT;
    user_domain TEXT;
    has_user_profiles BOOLEAN;
    has_org_memberships BOOLEAN;
    matching_org RECORD;
    org_found BOOLEAN := false;
BEGIN
    user_display_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
    user_domain := split_part(NEW.email, '@', 2);

    -- ── 1. Get or create default organization ──
    SELECT id INTO default_org_id FROM organizations WHERE slug = 'default' LIMIT 1;
    IF default_org_id IS NULL THEN
        INSERT INTO organizations (name, slug) VALUES ('Default Organization', 'default')
        RETURNING id INTO default_org_id;
    END IF;

    -- ── 2. Legacy profiles row (always required) ──
    INSERT INTO profiles (id, email, name, organization_id)
    VALUES (NEW.id, NEW.email, user_display_name, default_org_id)
    ON CONFLICT (id) DO NOTHING;

    -- ── 3. Extended tables (only when migration 018 has been applied) ──
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'user_profiles'
    ) INTO has_user_profiles;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'org_memberships'
    ) INTO has_org_memberships;

    IF has_user_profiles THEN
        INSERT INTO user_profiles (id, email, display_name, lifecycle_status)
        VALUES (
            NEW.id,
            NEW.email,
            user_display_name,
            CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN 'onboarding' ELSE 'pending_verification' END
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;

    IF has_org_memberships THEN
        -- Domain-based auto-assignment (only if organizations.sso_domain column exists)
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
                VALUES (NEW.id, matching_org.id, COALESCE(matching_org.default_role, 'pm'), 'active', true, NOW())
                ON CONFLICT (user_id, organization_id) DO NOTHING;
                org_found := true;
            END LOOP;
        END IF;

        -- Fallback: assign to default org
        IF NOT org_found THEN
            INSERT INTO org_memberships (user_id, organization_id, role, status, is_default_org, joined_at)
            VALUES (NEW.id, default_org_id, 'pm', 'active', true, NOW())
            ON CONFLICT (user_id, organization_id) DO NOTHING;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
