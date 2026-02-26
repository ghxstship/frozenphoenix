-- ═══════════════════════════════════════════════════════════════
-- HARDEN: handle_new_user trigger with full exception handling
-- ═══════════════════════════════════════════════════════════════
-- Wraps every INSERT in an exception handler so that any single
-- failure (constraint violation, missing table, type mismatch)
-- is logged but does NOT abort the transaction — allowing
-- auth.users INSERT to succeed even if downstream tables fail.
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

    -- ── 2. Legacy profiles row (always required) ──
    BEGIN
        INSERT INTO profiles (id, email, name, organization_id)
        VALUES (NEW.id, NEW.email, user_display_name, default_org_id)
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            name = EXCLUDED.name,
            organization_id = COALESCE(profiles.organization_id, EXCLUDED.organization_id);
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'handle_new_user: failed to upsert profiles row: % %', SQLERRM, SQLSTATE;
    END;

    -- ── 3. Extended tables (only when migration 018 has been applied) ──
    BEGIN
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'user_profiles'
        ) INTO has_user_profiles;

        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'org_memberships'
        ) INTO has_org_memberships;
    EXCEPTION WHEN OTHERS THEN
        has_user_profiles := false;
        has_org_memberships := false;
    END;

    IF has_user_profiles THEN
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
            RAISE WARNING 'handle_new_user: failed to upsert user_profiles row: % %', SQLERRM, SQLSTATE;
        END;
    END IF;

    IF has_org_memberships THEN
        BEGIN
            -- Domain-based auto-assignment
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
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'handle_new_user: failed org_memberships: % %', SQLERRM, SQLSTATE;
        END;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
