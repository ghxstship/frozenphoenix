-- ═══════════════════════════════════════════════════════════════════════════
-- FIX: handle_new_user trigger — explicit enum casts + grant on enum type
-- ═══════════════════════════════════════════════════════════════════════════
-- The user_profiles.lifecycle_status column uses the user_lifecycle_status
-- enum type. In a SECURITY DEFINER trigger fired from auth schema, implicit
-- text→enum casting may fail. This migration adds explicit casts and also
-- ensures the postgres role (function owner) has USAGE on the enum type.
-- ═══════════════════════════════════════════════════════════════════════════

-- Ensure the enum type is usable by the function owner
DO $$ BEGIN
    GRANT USAGE ON TYPE user_lifecycle_status TO postgres;
EXCEPTION WHEN OTHERS THEN
    -- Type grant may not be needed on all Supabase versions
    RAISE NOTICE 'Could not grant usage on enum: %', SQLERRM;
END $$;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_org_id UUID;
    matching_org RECORD;
    user_display_name TEXT;
    user_domain TEXT;
    org_found BOOLEAN := false;
    v_lifecycle user_lifecycle_status;
BEGIN
    user_display_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
    user_domain := split_part(NEW.email, '@', 2);

    -- Compute lifecycle status with explicit enum type
    IF NEW.email_confirmed_at IS NOT NULL THEN
        v_lifecycle := 'onboarding'::user_lifecycle_status;
    ELSE
        v_lifecycle := 'pending_verification'::user_lifecycle_status;
    END IF;

    -- ── 1. Create user_profile ──
    BEGIN
        INSERT INTO public.user_profiles (id, email, display_name, lifecycle_status)
        VALUES (NEW.id, NEW.email, user_display_name, v_lifecycle)
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            display_name = EXCLUDED.display_name;
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
        INSERT INTO public.profiles (id, email, name, organization_id)
        VALUES (NEW.id, NEW.email, user_display_name, default_org_id)
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            name = EXCLUDED.name,
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
-- Backfill the user created between migration 043 push and this fix
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.user_profiles (id, email, display_name, lifecycle_status)
SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
    CASE WHEN u.email_confirmed_at IS NOT NULL
        THEN 'onboarding'::user_lifecycle_status
        ELSE 'pending_verification'::user_lifecycle_status
    END
FROM auth.users u
LEFT JOIN public.user_profiles up ON up.id = u.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, name, organization_id)
SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
    (SELECT id FROM public.organizations WHERE slug = 'default' LIMIT 1)
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.org_memberships (user_id, organization_id, role, status, is_default_org, joined_at)
SELECT
    u.id,
    (SELECT id FROM public.organizations WHERE slug = 'default' LIMIT 1),
    'member',
    'active'::org_membership_status,
    true,
    NOW()
FROM auth.users u
LEFT JOIN public.org_memberships om ON om.user_id = u.id
WHERE om.id IS NULL
ON CONFLICT (user_id, organization_id) DO NOTHING;
