-- ═══════════════════════════════════════════════════════════════════════════
-- 095: Restore handle_new_user() trigger enhancements lost in 067
--
-- Fixes:
--   BUG-001 (P0): Restores first_name/last_name extraction from user metadata
--   BUG-002 (P1): Conditional lifecycle_status based on email_confirmed_at
--   BUG-003 (P2): Default role changed from 'pm' to 'member'
--   BUG-005 (P2): Persists avatar_url from OAuth provider metadata
--
-- Migration 067 simplified the trigger, losing enhancements added in 066.
-- This migration restores those features while keeping 067's consolidated
-- approach (user_profiles + org_memberships only, no profiles table).
-- ═══════════════════════════════════════════════════════════════════════════

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
    -- Signup form sends first_name + last_name in raw_user_meta_data.
    -- OAuth providers send name (Google) or full_name (GitHub).
    user_first_name := NULLIF(TRIM(NEW.raw_user_meta_data->>'first_name'), '');
    user_last_name  := NULLIF(TRIM(NEW.raw_user_meta_data->>'last_name'), '');

    -- Compute display_name: prefer structured fields, fall back to "name"/"full_name"
    IF user_first_name IS NOT NULL AND user_last_name IS NOT NULL THEN
        user_display_name := user_first_name || ' ' || user_last_name;
    ELSE
        user_display_name := COALESCE(
            NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
            NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
            split_part(NEW.email, '@', 1)
        );
        -- Best-effort split of legacy "name" into first/last
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
    -- Users who confirmed email (auto-confirm or OAuth) go straight to onboarding.
    -- Users who haven't confirmed yet start as pending_verification.
    IF NEW.email_confirmed_at IS NOT NULL THEN
        v_lifecycle := 'onboarding'::user_lifecycle_status;
    ELSE
        v_lifecycle := 'pending_verification'::user_lifecycle_status;
    END IF;

    -- ─── Get or create default organization ──────────────────────
    SELECT id INTO default_org_id FROM organizations WHERE slug = 'default' LIMIT 1;

    IF default_org_id IS NULL THEN
        INSERT INTO organizations (name, slug)
        VALUES ('Default Organization', 'default')
        RETURNING id INTO default_org_id;
    END IF;

    -- ─── Create user_profile with structured name + avatar ───────
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

    -- ─── Default org membership (member, not pm) ─────────────────
    INSERT INTO org_memberships (user_id, organization_id, role, status, is_default_org)
    VALUES (NEW.id, default_org_id, 'member', 'active', true)
    ON CONFLICT (user_id, organization_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ─── Backfill: Populate missing first/last name + avatar for existing users ──
-- Only updates rows where legal_first_name is currently NULL and metadata has it.
UPDATE user_profiles up
SET
    legal_first_name = COALESCE(
        NULLIF(TRIM(au.raw_user_meta_data->>'first_name'), ''),
        CASE WHEN position(' ' IN COALESCE(NULLIF(TRIM(au.raw_user_meta_data->>'name'), ''), '')) > 0
             THEN split_part(au.raw_user_meta_data->>'name', ' ', 1)
             ELSE NULL
        END
    ),
    legal_last_name = COALESCE(
        NULLIF(TRIM(au.raw_user_meta_data->>'last_name'), ''),
        CASE WHEN position(' ' IN COALESCE(NULLIF(TRIM(au.raw_user_meta_data->>'name'), ''), '')) > 0
             THEN substring(au.raw_user_meta_data->>'name' FROM position(' ' IN au.raw_user_meta_data->>'name') + 1)
             ELSE NULL
        END
    ),
    avatar_url = COALESCE(
        up.avatar_url,
        NULLIF(TRIM(au.raw_user_meta_data->>'avatar_url'), ''),
        NULLIF(TRIM(au.raw_user_meta_data->>'picture'), '')
    )
FROM auth.users au
WHERE up.id = au.id
  AND up.legal_first_name IS NULL
  AND (
      au.raw_user_meta_data->>'first_name' IS NOT NULL
      OR au.raw_user_meta_data->>'name' IS NOT NULL
  );
