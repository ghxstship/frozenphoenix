-- ═══════════════════════════════════════════════════════════════════════════
-- FIX: handle_new_user trigger silently fails due to missing search_path
-- ═══════════════════════════════════════════════════════════════════════════
-- The SECURITY DEFINER function executes with the owner's privileges but
-- inherits a restricted search_path from the auth schema trigger context.
-- Without `SET search_path = public`, unqualified table references
-- (user_profiles, profiles, organizations, org_memberships) fail to resolve.
--
-- Also adds search_path to all other SECURITY DEFINER helper functions
-- for consistency and safety.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: Fix handle_new_user with search_path
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: Add search_path to all SECURITY DEFINER RLS helpers
-- ─────────────────────────────────────────────────────────────────────────────

-- get_user_org_ids (from migration 018)
CREATE OR REPLACE FUNCTION get_user_org_ids()
RETURNS UUID[] AS $$
    SELECT COALESCE(
        ARRAY(
            SELECT organization_id
            FROM public.org_memberships
            WHERE user_id = auth.uid()
              AND status = 'active'
              AND (expires_at IS NULL OR expires_at > NOW())
        ),
        '{}'::UUID[]
    )
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- get_user_role_in_org (from migration 018)
CREATE OR REPLACE FUNCTION get_user_role_in_org(org_id UUID)
RETURNS TEXT AS $$
    SELECT role
    FROM public.org_memberships
    WHERE user_id = auth.uid()
      AND organization_id = org_id
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > NOW())
    LIMIT 1
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- get_user_exec_org_ids (from migration 041)
CREATE OR REPLACE FUNCTION get_user_exec_org_ids()
RETURNS UUID[] AS $$
    SELECT COALESCE(
        ARRAY(
            SELECT organization_id
            FROM public.org_memberships
            WHERE user_id = auth.uid()
              AND status = 'active'
              AND role = 'exec'
              AND (expires_at IS NULL OR expires_at > NOW())
        ),
        '{}'::UUID[]
    )
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- get_user_admin_org_ids (from migration 041)
CREATE OR REPLACE FUNCTION get_user_admin_org_ids()
RETURNS UUID[] AS $$
    SELECT COALESCE(
        ARRAY(
            SELECT organization_id
            FROM public.org_memberships
            WHERE user_id = auth.uid()
              AND status = 'active'
              AND role IN ('exec', 'director', 'pm')
              AND (expires_at IS NULL OR expires_at > NOW())
        ),
        '{}'::UUID[]
    )
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- get_user_role (from migration 029)
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
    SELECT role
    FROM public.org_memberships
    WHERE user_id = auth.uid()
      AND status = 'active'
      AND is_default_org = true
    LIMIT 1
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- is_exec_or_pm (from migration 029, updated in 038)
CREATE OR REPLACE FUNCTION is_exec_or_pm()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.org_memberships
        WHERE user_id = auth.uid()
          AND status = 'active'
          AND role IN ('exec', 'director', 'pm')
    )
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- is_exec (from migration 029)
CREATE OR REPLACE FUNCTION is_exec()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.org_memberships
        WHERE user_id = auth.uid()
          AND status = 'active'
          AND role = 'exec'
    )
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: Backfill missing rows for users created before this fix
-- ─────────────────────────────────────────────────────────────────────────────

-- Create user_profiles for any auth.users that are missing them
INSERT INTO user_profiles (id, email, display_name, lifecycle_status)
SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
    CASE WHEN u.email_confirmed_at IS NOT NULL THEN 'onboarding'::user_lifecycle_status ELSE 'pending_verification'::user_lifecycle_status END
FROM auth.users u
LEFT JOIN user_profiles up ON up.id = u.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Create profiles for any auth.users that are missing them
INSERT INTO profiles (id, email, name, organization_id)
SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
    (SELECT id FROM organizations WHERE slug = 'default' LIMIT 1)
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Create org_memberships for any users that are missing them
INSERT INTO org_memberships (user_id, organization_id, role, status, is_default_org, joined_at)
SELECT
    u.id,
    (SELECT id FROM organizations WHERE slug = 'default' LIMIT 1),
    'member',
    'active',
    true,
    NOW()
FROM auth.users u
LEFT JOIN org_memberships om ON om.user_id = u.id
WHERE om.id IS NULL
ON CONFLICT (user_id, organization_id) DO NOTHING;
