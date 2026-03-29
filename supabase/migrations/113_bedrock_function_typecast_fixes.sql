-- ============================================================
-- Migration 113: BEDROCK Re-Audit Pass 3 — Function Type-Cast Fixes
-- Protocol: FP-DATA-BEDROCK-001 (Re-execution)
--
-- Fixes implicit text→JSONB and text→enum casts that cause
-- plpgsql_check warnings in evaluate_feature_flag and
-- check_three_way_match.
--
-- Zero-downtime: Function replacements only.
-- ============================================================

-- ============================================================
-- FIX 1: evaluate_feature_flag
-- Warning: "cast text value to jsonb type" on RETURN statements
-- Fix: Use explicit jsonb casts: 'false'::jsonb, 'true'::jsonb
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
        RETURN 'false'::jsonb;
    END IF;

    -- Check min_tier gate FIRST (before any overrides)
    IF flag_record.min_tier IS NOT NULL AND p_org_id IS NOT NULL THEN
        v_org_tier := get_org_pricing_tier(p_org_id);
        IF tier_rank(v_org_tier) < tier_rank(flag_record.min_tier) THEN
            RETURN 'false'::jsonb;
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
            RETURN 'true'::jsonb;
        END IF;
    END IF;

    -- Check role override
    IF p_role IS NOT NULL THEN
        IF p_role = ANY(flag_record.target_roles) THEN
            RETURN 'true'::jsonb;
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
            RETURN 'true'::jsonb;
        END IF;
    END IF;

    -- Percentage rollout (deterministic by user_id hash)
    IF flag_record.flag_type = 'percentage' AND p_user_id IS NOT NULL THEN
        IF (abs(hashtext(p_user_id::TEXT || p_flag_key)) % 100) < flag_record.rollout_percentage THEN
            RETURN 'true'::jsonb;
        END IF;
        RETURN 'false'::jsonb;
    END IF;

    RETURN flag_record.default_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FIX 2: check_three_way_match
-- Warning: "cast text value to three_way_match_status type"
-- Fix: Use explicit enum casts on all RETURN statements
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
        RETURN 'not_applicable'::three_way_match_status;
    END IF;

    -- Get PO total
    SELECT total_amount INTO v_po_total
    FROM purchase_orders
    WHERE id = v_po_id;

    -- Check if goods receipt exists
    IF v_gr_id IS NULL THEN
        RETURN 'pending_receipt'::three_way_match_status;
    END IF;

    -- Get GR total from goods_receipt_lines table (normalized in Migration 108)
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
        RETURN 'matched'::three_way_match_status;
    ELSE
        RETURN 'variance_flagged'::three_way_match_status;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
