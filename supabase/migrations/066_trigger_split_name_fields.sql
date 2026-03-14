-- ═══════════════════════════════════════════════════════════════════════════
-- 066: Update handle_new_user trigger to populate structured name fields
-- ═══════════════════════════════════════════════════════════════════════════
-- The signup form now sends first_name and last_name as separate metadata
-- keys. This migration updates the trigger to:
--   1. Read first_name / last_name from raw_user_meta_data
--   2. Populate legal_first_name / legal_last_name on user_profiles
--   3. Populate legal_first_name / legal_last_name on profiles (legacy)
--   4. Compute display_name from the structured fields
--   5. Fall back to the legacy "name" key for backward compatibility
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_org_id UUID;
    matching_org RECORD;
    user_display_name TEXT;
    user_first_name TEXT;
    user_last_name TEXT;
    user_domain TEXT;
    org_found BOOLEAN := false;
    v_lifecycle user_lifecycle_status;
BEGIN
    -- Extract structured name fields (new signup form sends these)
    user_first_name := NULLIF(TRIM(NEW.raw_user_meta_data->>'first_name'), '');
    user_last_name  := NULLIF(TRIM(NEW.raw_user_meta_data->>'last_name'), '');

    -- Compute display_name: prefer structured fields, fall back to legacy "name"
    IF user_first_name IS NOT NULL AND user_last_name IS NOT NULL THEN
        user_display_name := user_first_name || ' ' || user_last_name;
    ELSE
        user_display_name := COALESCE(
            NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
            split_part(NEW.email, '@', 1)
        );
        -- Best-effort split of legacy "name" into first/last
        IF user_first_name IS NULL AND user_last_name IS NULL AND user_display_name IS NOT NULL THEN
            user_first_name := split_part(user_display_name, ' ', 1);
            IF position(' ' IN user_display_name) > 0 THEN
                user_last_name := substring(user_display_name FROM position(' ' IN user_display_name) + 1);
            END IF;
        END IF;
    END IF;

    user_domain := split_part(NEW.email, '@', 2);

    -- Compute lifecycle status with explicit enum type
    IF NEW.email_confirmed_at IS NOT NULL THEN
        v_lifecycle := 'onboarding'::user_lifecycle_status;
    ELSE
        v_lifecycle := 'pending_verification'::user_lifecycle_status;
    END IF;

    -- ── 1. Create user_profile ──
    BEGIN
        INSERT INTO public.user_profiles (id, email, display_name, legal_first_name, legal_last_name, lifecycle_status)
        VALUES (NEW.id, NEW.email, user_display_name, user_first_name, user_last_name, v_lifecycle)
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            display_name = EXCLUDED.display_name,
            legal_first_name = COALESCE(EXCLUDED.legal_first_name, public.user_profiles.legal_first_name),
            legal_last_name  = COALESCE(EXCLUDED.legal_last_name, public.user_profiles.legal_last_name);
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'handle_new_user[1-user_profiles]: % (%) — id=%, email=%',
            SQLERRM, SQLSTATE, NEW.id, NEW.email;
    END;

    -- ── 2. Get or create default organization ──
    BEGIN
        SELECT id INTO default_org_id FROM public.organizations WHERE slug = 'default' LIMIT 1;
        IF default_org_id IS NULL THEN
            INSERT INTO public.organizations (name, slug) VALUES ('Default Organization', 'default')
            RETURNING id INTO default_org_id;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'handle_new_user[2-default_org]: % (%) — id=%',
            SQLERRM, SQLSTATE, NEW.id;
        RETURN NEW;
    END;

    -- ── 3. Legacy profiles row (backward compatibility) ──
    BEGIN
        INSERT INTO public.profiles (id, email, name, legal_first_name, legal_last_name, organization_id)
        VALUES (NEW.id, NEW.email, user_display_name, user_first_name, user_last_name, default_org_id)
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            name = EXCLUDED.name,
            legal_first_name = COALESCE(EXCLUDED.legal_first_name, public.profiles.legal_first_name),
            legal_last_name  = COALESCE(EXCLUDED.legal_last_name, public.profiles.legal_last_name),
            organization_id = COALESCE(public.profiles.organization_id, EXCLUDED.organization_id);
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'handle_new_user[3-profiles]: % (%) — id=%',
            SQLERRM, SQLSTATE, NEW.id;
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
                FROM public.organizations
                WHERE sso_domain = user_domain
                  AND sso_domain IS NOT NULL
            LOOP
                INSERT INTO public.org_memberships (user_id, organization_id, role, status, is_default_org, joined_at)
                VALUES (NEW.id, matching_org.id, COALESCE(matching_org.default_role, 'member'), 'active', true, NOW())
                ON CONFLICT (user_id, organization_id) DO NOTHING;
                org_found := true;
            END LOOP;
        END IF;

        -- Fallback: assign to default org as member
        IF NOT org_found THEN
            INSERT INTO public.org_memberships (user_id, organization_id, role, status, is_default_org, joined_at)
            VALUES (NEW.id, default_org_id, 'member', 'active', true, NOW())
            ON CONFLICT (user_id, organization_id) DO NOTHING;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'handle_new_user[4-org_memberships]: % (%) — id=%',
            SQLERRM, SQLSTATE, NEW.id;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ─────────────────────────────────────────────────────────────────────────────
-- Backfill: populate legal_first_name / legal_last_name for existing users
-- who signed up with the legacy "name" metadata key.
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE public.user_profiles up
SET
    legal_first_name = COALESCE(
        up.legal_first_name,
        split_part(COALESCE(up.display_name, ''), ' ', 1)
    ),
    legal_last_name = COALESCE(
        up.legal_last_name,
        CASE
            WHEN position(' ' IN COALESCE(up.display_name, '')) > 0
            THEN substring(COALESCE(up.display_name, '') FROM position(' ' IN COALESCE(up.display_name, '')) + 1)
            ELSE NULL
        END
    )
WHERE up.legal_first_name IS NULL
   AND up.display_name IS NOT NULL
   AND up.display_name <> '';

UPDATE public.profiles p
SET
    legal_first_name = COALESCE(
        p.legal_first_name,
        split_part(COALESCE(p.name, ''), ' ', 1)
    ),
    legal_last_name = COALESCE(
        p.legal_last_name,
        CASE
            WHEN position(' ' IN COALESCE(p.name, '')) > 0
            THEN substring(COALESCE(p.name, '') FROM position(' ' IN COALESCE(p.name, '')) + 1)
            ELSE NULL
        END
    )
WHERE p.legal_first_name IS NULL
   AND p.name IS NOT NULL
   AND p.name <> '';
