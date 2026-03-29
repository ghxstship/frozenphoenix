-- ============================================================
-- Migration 111: BEDROCK Re-Audit — Function Repair & Column Drops
-- Protocol: FP-DATA-BEDROCK-001 (Re-execution)
--
-- Fixes 5 broken database functions referencing dropped
-- columns/tables from previous BEDROCK batches.
-- Drops 5 remaining UUID array columns that were missed
-- in Migration 110.
--
-- Zero-downtime: All ops are function replacements + column drops.
-- ============================================================

-- ============================================================
-- FIX 1: create_org_and_membership
-- Error: relation "profiles" does not exist
-- Fix: Replace "profiles" with "user_profiles"
-- ============================================================

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

    -- 2. Create exec membership
    INSERT INTO org_memberships (user_id, organization_id, role, status, is_default_org)
    VALUES (v_user, v_org_id, 'exec', 'active', true)
    ON CONFLICT (user_id, organization_id)
    DO UPDATE SET role = 'exec', status = 'active', is_default_org = true;

    -- Org assignment is established through org_memberships (step 2 above).
    -- user_profiles does not have an organization_id column.

    RETURN json_build_object('id', v_org_id);
END;
$$;

-- ============================================================
-- FIX 2: erase_user_data
-- Error: relation "profiles" does not exist
-- Fix: Remove stale "UPDATE profiles" block (user_profiles
--      is already updated at the top of the function)
-- ============================================================

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

    -- (Removed stale "UPDATE profiles" block — table was renamed to user_profiles)

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

-- ============================================================
-- FIX 3: evaluate_feature_flag
-- Error: record "flag_record" has no field "target_user_ids"
-- Fix: Query feature_flag_user_targets junction table instead
--      of the dropped target_user_ids array column
-- ============================================================

CREATE OR REPLACE FUNCTION evaluate_feature_flag(
    p_flag_key TEXT,
    p_user_id UUID DEFAULT NULL,
    p_org_id UUID DEFAULT NULL,
    p_role TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    flag_record RECORD;
    override_val JSONB;
    v_org_tier pricing_tier;
BEGIN
    SELECT * INTO flag_record
    FROM feature_flags
    WHERE key = p_flag_key AND is_active = true;

    IF NOT FOUND THEN
        RETURN 'false';
    END IF;

    -- Check min_tier gate FIRST (before any overrides)
    IF flag_record.min_tier IS NOT NULL AND p_org_id IS NOT NULL THEN
        v_org_tier := get_org_pricing_tier(p_org_id);
        IF tier_rank(v_org_tier) < tier_rank(flag_record.min_tier) THEN
            RETURN 'false';
        END IF;
    END IF;

    -- Check lifecycle dates
    IF flag_record.starts_at IS NOT NULL AND NOW() < flag_record.starts_at THEN
        RETURN flag_record.default_value;
    END IF;
    IF flag_record.expires_at IS NOT NULL AND NOW() > flag_record.expires_at THEN
        RETURN flag_record.default_value;
    END IF;

    -- Check user-specific override first (most specific)
    IF p_user_id IS NOT NULL THEN
        SELECT value INTO override_val
        FROM feature_flag_overrides
        WHERE flag_id = flag_record.id
          AND scope_type = 'user'
          AND scope_id = p_user_id
          AND (expires_at IS NULL OR expires_at > NOW());
        IF FOUND THEN RETURN override_val; END IF;

        -- Check junction table instead of dropped target_user_ids array
        IF EXISTS (
            SELECT 1 FROM feature_flag_user_targets
            WHERE flag_id = flag_record.id AND user_id = p_user_id
        ) THEN
            RETURN 'true';
        END IF;
    END IF;

    -- Check role override
    IF p_role IS NOT NULL THEN
        IF p_role = ANY(flag_record.target_roles) THEN
            RETURN 'true';
        END IF;
    END IF;

    -- Check org override
    IF p_org_id IS NOT NULL THEN
        SELECT value INTO override_val
        FROM feature_flag_overrides
        WHERE flag_id = flag_record.id
          AND scope_type = 'organization'
          AND scope_id = p_org_id
          AND (expires_at IS NULL OR expires_at > NOW());
        IF FOUND THEN RETURN override_val; END IF;

        IF p_org_id = ANY(flag_record.target_orgs) THEN
            RETURN 'true';
        END IF;
    END IF;

    -- Percentage rollout (deterministic by user_id hash)
    IF flag_record.flag_type = 'percentage' AND p_user_id IS NOT NULL THEN
        IF (abs(hashtext(p_user_id::TEXT || p_flag_key)) % 100) < flag_record.rollout_percentage THEN
            RETURN 'true';
        END IF;
        RETURN 'false';
    END IF;

    RETURN flag_record.default_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FIX 4: convert_deal_to_project
-- Error: column "client" of relation "projects" does not exist
-- Fix: Remove "client" column, use client_company_id instead
-- ============================================================

CREATE OR REPLACE FUNCTION convert_deal_to_project(p_deal_id UUID)
RETURNS UUID AS $$
DECLARE
    v_deal deals%ROWTYPE;
    v_project_id UUID;
BEGIN
    SELECT * INTO v_deal FROM deals WHERE id = p_deal_id;

    IF v_deal.stage != 'won' THEN
        RAISE EXCEPTION 'Deal must be in won stage to convert';
    END IF;

    IF v_deal.converted_project_id IS NOT NULL THEN
        RAISE EXCEPTION 'Deal has already been converted';
    END IF;

    INSERT INTO projects (
        name,
        company_id,
        client_company_id,
        status,
        start_date,
        end_date,
        budget_planned,
        manager_id,
        organization_id
    ) VALUES (
        v_deal.title,
        v_deal.company_id,
        v_deal.company_id,
        'draft',
        COALESCE(v_deal.expected_close_date, CURRENT_DATE),
        COALESCE(v_deal.expected_close_date + INTERVAL '30 days', CURRENT_DATE + INTERVAL '30 days'),
        v_deal.value,
        v_deal.assigned_to,
        v_deal.organization_id
    ) RETURNING id INTO v_project_id;

    UPDATE deals
    SET converted_project_id = v_project_id,
        converted_at = NOW()
    WHERE id = p_deal_id;

    RETURN v_project_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FIX 5: check_three_way_match
-- Error: column gr.line_items does not exist
-- Fix: Query goods_receipt_lines table instead of dropped
--      line_items JSONB column
-- ============================================================

CREATE OR REPLACE FUNCTION check_three_way_match(
    p_invoice_id UUID,
    p_tolerance_percent NUMERIC DEFAULT 5.0
)
RETURNS three_way_match_status AS $$
DECLARE
    v_po_total NUMERIC;
    v_gr_total NUMERIC;
    v_inv_total NUMERIC;
    v_po_id UUID;
    v_gr_id UUID;
    v_tolerance NUMERIC;
BEGIN
    -- Get invoice details
    SELECT purchase_order_id, goods_receipt_id, amount
    INTO v_po_id, v_gr_id, v_inv_total
    FROM invoices
    WHERE id = p_invoice_id;

    -- No PO = not applicable
    IF v_po_id IS NULL THEN
        RETURN 'not_applicable';
    END IF;

    -- Get PO total
    SELECT total_amount INTO v_po_total
    FROM purchase_orders
    WHERE id = v_po_id;

    -- Check if goods receipt exists
    IF v_gr_id IS NULL THEN
        RETURN 'pending_receipt';
    END IF;

    -- Get GR total from goods_receipt_lines table (was JSONB column, now normalized)
    SELECT COALESCE(SUM(grl.quantity_received * grl.unit_price), 0)
    INTO v_gr_total
    FROM goods_receipt_lines grl
    WHERE grl.goods_receipt_id = v_gr_id;

    -- Calculate tolerance
    v_tolerance := v_po_total * (p_tolerance_percent / 100.0);

    -- Check all three match within tolerance
    IF ABS(v_po_total - v_inv_total) <= v_tolerance
       AND ABS(v_po_total - v_gr_total) <= v_tolerance
       AND ABS(v_inv_total - v_gr_total) <= v_tolerance THEN
        RETURN 'matched';
    ELSE
        RETURN 'variance_flagged';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- DROP 5 remaining UUID array columns missed in Migration 110
-- Junction tables already exist and contain migrated data
-- ============================================================

-- readiness_gates: junction tables readiness_gate_checklists, readiness_gate_permits
ALTER TABLE readiness_gates DROP COLUMN IF EXISTS checklist_ids;
ALTER TABLE readiness_gates DROP COLUMN IF EXISTS permit_ids;

-- production_sops: junction tables sop_relationships, sop_forms, sop_training_materials
ALTER TABLE production_sops DROP COLUMN IF EXISTS related_sop_ids;
ALTER TABLE production_sops DROP COLUMN IF EXISTS form_ids;
ALTER TABLE production_sops DROP COLUMN IF EXISTS training_material_ids;
