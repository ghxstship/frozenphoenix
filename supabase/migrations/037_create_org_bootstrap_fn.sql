-- ═══════════════════════════════════════════════════════════════
-- BOOTSTRAP FUNCTION: create_org_and_membership
-- ═══════════════════════════════════════════════════════════════
-- Called from POST /api/organizations to atomically:
--   1. Insert the organization
--   2. Create an exec membership for the creator
--   3. Update the creator's profile.organization_id
--
-- Runs as SECURITY DEFINER so it bypasses RLS (the user can't
-- SELECT the org they just inserted because the SELECT policy
-- requires an existing membership).
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.create_org_and_membership(
    p_name TEXT,
    p_slug TEXT,
    p_industry TEXT DEFAULT NULL,
    p_timezone TEXT DEFAULT 'America/New_York',
    p_currency TEXT DEFAULT 'USD',
    p_user_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_org_id UUID;
    v_user UUID;
BEGIN
    -- Resolve caller
    v_user := COALESCE(p_user_id, auth.uid());
    IF v_user IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 1. Insert organization
    INSERT INTO organizations (name, slug, industry, default_timezone, default_currency)
    VALUES (p_name, p_slug, p_industry, p_timezone, p_currency)
    RETURNING id INTO v_org_id;

    -- 2. Create exec membership
    INSERT INTO org_memberships (user_id, organization_id, role, status, is_default_org)
    VALUES (v_user, v_org_id, 'exec', 'active', true)
    ON CONFLICT (user_id, organization_id)
    DO UPDATE SET role = 'exec', status = 'active', is_default_org = true;

    -- 3. Update profile
    UPDATE profiles
    SET organization_id = v_org_id
    WHERE id = v_user;

    RETURN json_build_object('id', v_org_id);
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.create_org_and_membership TO authenticated;
