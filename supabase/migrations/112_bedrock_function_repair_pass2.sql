-- ============================================================
-- Migration 112: BEDROCK — Fix remaining function errors
-- Fixes create_org_and_membership (user_profiles has no organization_id)
-- Fixes erase_user_data ('removed' is not a valid org_membership_status)
-- ============================================================

-- FIX 1: create_org_and_membership
-- user_profiles does NOT have organization_id column;
-- org assignment is via org_memberships (already handled in step 2)
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
    v_user := COALESCE(p_user_id, auth.uid());
    IF v_user IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 1. Insert organization
    INSERT INTO organizations (name, slug, industry, default_timezone, default_currency)
    VALUES (p_name, p_slug, p_industry, p_timezone, p_currency)
    RETURNING id INTO v_org_id;

    -- 2. Create exec membership (this IS the org assignment)
    INSERT INTO org_memberships (user_id, organization_id, role, status, is_default_org)
    VALUES (v_user, v_org_id, 'exec', 'active', true)
    ON CONFLICT (user_id, organization_id)
    DO UPDATE SET role = 'exec', status = 'active', is_default_org = true;

    RETURN json_build_object('id', v_org_id);
END;
$$;

-- FIX 2: erase_user_data
-- 'removed' is not a valid org_membership_status enum value.
-- Valid values: invited, active, suspended, expired, revoked
-- Use 'revoked' for account erasure.
CREATE OR REPLACE FUNCTION erase_user_data(target_user_id UUID)
RETURNS void AS $$
BEGIN
    -- Anonymize profile data
    UPDATE user_profiles SET
        display_name = 'Deleted User',
        avatar_url = NULL,
        phone = NULL,
        bio = NULL,
        updated_at = now()
    WHERE id = target_user_id;

    -- Remove audit trail PII (keep structure for compliance)
    UPDATE login_audit_log SET
        ip_address = '0.0.0.0',
        user_agent = 'erased',
        device_fingerprint = NULL,
        country_code = NULL,
        city = NULL,
        metadata = '{}'::jsonb
    WHERE user_id = target_user_id;

    -- Revoke all active sessions
    UPDATE user_sessions SET
        revoked_at = now()
    WHERE user_id = target_user_id AND revoked_at IS NULL;

    -- Delete MFA recovery codes
    DELETE FROM mfa_recovery_codes WHERE user_id = target_user_id;

    -- Revoke org memberships
    UPDATE org_memberships SET
        status = 'revoked',
        updated_at = now()
    WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
