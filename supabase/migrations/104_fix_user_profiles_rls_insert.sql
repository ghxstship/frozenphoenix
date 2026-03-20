-- ═══════════════════════════════════════════════════════════════════════════
-- 104: Fix user_profiles + org_memberships RLS for auth fallback paths
--
-- ROOT CAUSE: After Google OAuth (or any provider) login, the client-side
-- auth-context.tsx fetches the user's profile and org memberships. If the
-- handle_new_user trigger failed silently (or the user was created before
-- the trigger was fixed), the fallback code tries to INSERT the missing
-- rows. However:
--
--   1. user_profiles has NO INSERT policy — only SELECT + UPDATE
--   2. The fallback upsert silently fails, leaving profile = null
--   3. Sidebar shows "Guest / Not signed in"
--
-- FIX: Add INSERT policy on user_profiles for authenticated users (own row).
-- Also add exception handling back to handle_new_user trigger so a failure
-- in any step doesn't prevent the auth.users row from being created.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. Add INSERT policy on user_profiles ─────────────────────────────────
-- Users can insert their own profile row (id must match auth.uid()).
-- This enables the client-side fallback when the DB trigger fails.

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'user_profiles'
          AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile"
            ON user_profiles FOR INSERT
            TO authenticated
            WITH CHECK (id = auth.uid());
    END IF;
END $$;

-- ─── 2. Restore exception handling in handle_new_user trigger ──────────────
-- Migration 095 removed the BEGIN/EXCEPTION blocks that 066 had.
-- Without them, any single failure (missing default org, constraint
-- violation) aborts the entire auth.users INSERT — the user can't sign up.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_org_id UUID;
    user_display_name TEXT;
    user_first_name TEXT;
    user_last_name TEXT;
    user_avatar_url TEXT;
    v_lifecycle user_lifecycle_status;
BEGIN
    -- ─── Extract structured name fields ──────────────────────────
    user_first_name := NULLIF(TRIM(NEW.raw_user_meta_data->>'first_name'), '');
    user_last_name  := NULLIF(TRIM(NEW.raw_user_meta_data->>'last_name'), '');

    IF user_first_name IS NOT NULL AND user_last_name IS NOT NULL THEN
        user_display_name := user_first_name || ' ' || user_last_name;
    ELSE
        user_display_name := COALESCE(
            NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
            NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
            split_part(NEW.email, '@', 1)
        );
        IF user_first_name IS NULL AND user_display_name IS NOT NULL THEN
            user_first_name := split_part(user_display_name, ' ', 1);
            IF position(' ' IN user_display_name) > 0 THEN
                user_last_name := substring(user_display_name FROM position(' ' IN user_display_name) + 1);
            END IF;
        END IF;
    END IF;

    -- ─── Extract avatar URL from OAuth providers ─────────────────
    user_avatar_url := NULLIF(TRIM(NEW.raw_user_meta_data->>'avatar_url'), '');
    IF user_avatar_url IS NULL THEN
        user_avatar_url := NULLIF(TRIM(NEW.raw_user_meta_data->>'picture'), '');
    END IF;

    -- ─── Conditional lifecycle status ────────────────────────────
    IF NEW.email_confirmed_at IS NOT NULL THEN
        v_lifecycle := 'onboarding'::user_lifecycle_status;
    ELSE
        v_lifecycle := 'pending_verification'::user_lifecycle_status;
    END IF;

    -- ─── 1. Get or create default organization ──────────────────
    BEGIN
        SELECT id INTO default_org_id FROM organizations WHERE slug = 'default' LIMIT 1;
        IF default_org_id IS NULL THEN
            INSERT INTO organizations (name, slug)
            VALUES ('Default Organization', 'default')
            RETURNING id INTO default_org_id;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'handle_new_user[1-default_org]: % (%) — id=%, email=%',
            SQLERRM, SQLSTATE, NEW.id, NEW.email;
        -- Cannot proceed without org — return early but let auth.users INSERT succeed
        RETURN NEW;
    END;

    -- ─── 2. Create user_profile ─────────────────────────────────
    BEGIN
        INSERT INTO user_profiles (
            id, email, display_name, legal_first_name, legal_last_name,
            avatar_url, lifecycle_status
        )
        VALUES (
            NEW.id, NEW.email, user_display_name, user_first_name, user_last_name,
            user_avatar_url, v_lifecycle
        )
        ON CONFLICT (id) DO UPDATE SET
            email        = EXCLUDED.email,
            display_name = COALESCE(NULLIF(EXCLUDED.display_name, ''), user_profiles.display_name),
            legal_first_name = COALESCE(EXCLUDED.legal_first_name, user_profiles.legal_first_name),
            legal_last_name  = COALESCE(EXCLUDED.legal_last_name,  user_profiles.legal_last_name),
            avatar_url   = COALESCE(EXCLUDED.avatar_url, user_profiles.avatar_url);
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'handle_new_user[2-user_profiles]: % (%) — id=%, email=%',
            SQLERRM, SQLSTATE, NEW.id, NEW.email;
    END;

    -- ─── 3. Default org membership ──────────────────────────────
    BEGIN
        INSERT INTO org_memberships (user_id, organization_id, role, status, is_default_org)
        VALUES (NEW.id, default_org_id, 'member', 'active', true)
        ON CONFLICT (user_id, organization_id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'handle_new_user[3-org_memberships]: % (%) — id=%, email=%',
            SQLERRM, SQLSTATE, NEW.id, NEW.email;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ─── 3. Backfill: Create missing user_profiles for existing auth users ─────
-- This catches users who signed up when the trigger was broken.
INSERT INTO user_profiles (id, email, display_name, lifecycle_status)
SELECT
    u.id,
    COALESCE(u.email, ''),
    COALESCE(
        NULLIF(TRIM(u.raw_user_meta_data->>'name'), ''),
        NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''),
        split_part(COALESCE(u.email, 'user'), '@', 1)
    ),
    CASE WHEN u.email_confirmed_at IS NOT NULL THEN 'onboarding'::user_lifecycle_status
         ELSE 'pending_verification'::user_lifecycle_status
    END
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = u.id);

-- ─── 4. Backfill: Create missing org_memberships for existing auth users ───
INSERT INTO org_memberships (user_id, organization_id, role, status, is_default_org)
SELECT
    u.id,
    (SELECT id FROM organizations WHERE slug = 'default' LIMIT 1),
    'member',
    'active',
    true
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM org_memberships om WHERE om.user_id = u.id)
  AND EXISTS (SELECT 1 FROM organizations WHERE slug = 'default');
