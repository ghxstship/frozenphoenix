-- ═══════════════════════════════════════════════════════════════
-- Migration 057: Four-Tier Pricing Model
--
-- Adds 'starter' and 'team' to pricing_tier enum.
-- Adds min_tier column to feature_flags for tier-gated features.
-- Adds legacy_tier_override to org_subscriptions for grandfather clause.
-- Adds tier_usage_counters for soft-limit enforcement.
-- Updates is_field_accessible() for 4-tier ordering.
-- Updates get_org_pricing_tier() default to 'starter'.
-- Seeds tier-scoped feature flags.
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. (moved to 057_extend_pricing_tier_enum.sql) ─────────

-- ─── 2. Add min_tier to feature_flags ────────────────────────
-- Allows tier-gating feature flags declaratively.
-- NULL means no tier restriction (flag evaluated normally).

ALTER TABLE feature_flags
  ADD COLUMN IF NOT EXISTS min_tier pricing_tier;

COMMENT ON COLUMN feature_flags.min_tier IS
  'Minimum pricing tier required to access this flag. NULL = no tier restriction.';

-- ─── 3. Add legacy_tier_override to org_subscriptions ────────
-- Grandfather clause: legacy orgs keep elevated entitlements
-- until they explicitly change plans.

ALTER TABLE org_subscriptions
  ADD COLUMN IF NOT EXISTS legacy_tier_override pricing_tier;

COMMENT ON COLUMN org_subscriptions.legacy_tier_override IS
  'If set, org receives entitlements of this tier instead of pricing_tier. Used for grandfathering legacy plans.';

-- ─── 4. Tier usage counters ──────────────────────────────────
-- Tracks per-org usage of soft-limited resources (automation rules,
-- AI reports, provider connections, custom fields).

CREATE TABLE IF NOT EXISTS tier_usage_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  counter_key TEXT NOT NULL,
  current_count INTEGER NOT NULL DEFAULT 0,
  period_start DATE NOT NULL DEFAULT CURRENT_DATE,
  period_end DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 month'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, counter_key, period_start)
);

COMMENT ON TABLE tier_usage_counters IS
  'Per-org usage counters for tier-limited resources. Reset monthly by pg_cron.';

CREATE INDEX idx_tier_usage_counters_org ON tier_usage_counters(organization_id);
CREATE INDEX idx_tier_usage_counters_key ON tier_usage_counters(counter_key, period_start);

ALTER TABLE tier_usage_counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tier_usage_counters_read" ON tier_usage_counters
  FOR SELECT TO authenticated
  USING (organization_id = (SELECT get_user_org_id()));

CREATE POLICY "tier_usage_counters_write" ON tier_usage_counters
  FOR ALL TO authenticated
  USING (organization_id = (SELECT get_user_org_id()))
  WITH CHECK (organization_id = (SELECT get_user_org_id()));

CREATE TRIGGER trg_tier_usage_counters_updated
  BEFORE UPDATE ON tier_usage_counters
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

-- ─── 5. Helper: Tier rank for comparisons ────────────────────

CREATE OR REPLACE FUNCTION tier_rank(t pricing_tier)
RETURNS INTEGER AS $$
  SELECT CASE t
    WHEN 'starter'    THEN 0
    WHEN 'core'       THEN 1
    WHEN 'team'       THEN 2
    WHEN 'pro'        THEN 3
    WHEN 'enterprise' THEN 4
    ELSE 0
  END;
$$ LANGUAGE sql IMMUTABLE;

COMMENT ON FUNCTION tier_rank IS
  'Returns numeric rank for pricing_tier comparison. starter=0, core=1, team=2, pro=3, enterprise=4.';

-- ─── 6. Update get_org_pricing_tier default to starter ───────

CREATE OR REPLACE FUNCTION get_org_pricing_tier(p_org_id UUID)
RETURNS pricing_tier AS $$
  SELECT COALESCE(
    (SELECT COALESCE(legacy_tier_override, pricing_tier)
     FROM org_subscriptions
     WHERE organization_id = p_org_id AND status IN ('active', 'trialing')
     LIMIT 1),
    'starter'::pricing_tier
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ─── 7. Update is_field_accessible for 5-tier ordering ───────

CREATE OR REPLACE FUNCTION is_field_accessible(
  p_org_id UUID,
  p_field_type_id TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_field_tier pricing_tier;
  v_org_tier pricing_tier;
  v_safety BOOLEAN;
BEGIN
  SELECT pricing_tier, safety_critical
    INTO v_field_tier, v_safety
    FROM field_tier_assignments
    WHERE field_type_id = p_field_type_id;

  IF NOT FOUND THEN RETURN TRUE; END IF;
  IF v_safety THEN RETURN TRUE; END IF;

  v_org_tier := get_org_pricing_tier(p_org_id);

  -- Use numeric ranking for clean comparison
  IF tier_rank(v_org_tier) >= tier_rank(v_field_tier) THEN
    RETURN TRUE;
  END IF;

  -- Check add-on bundles as fallback
  RETURN EXISTS (
    SELECT 1 FROM org_bundle_subscriptions obs
    JOIN field_bundle_items fbi ON fbi.bundle_id = obs.bundle_id
    WHERE obs.organization_id = p_org_id
      AND obs.status = 'active'
      AND fbi.field_type_id = p_field_type_id
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ─── 8. Feature flag tier check ──────────────────────────────

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

        IF p_user_id = ANY(flag_record.target_user_ids) THEN
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

-- ─── 9. Update existing feature flags with min_tier ──────────

UPDATE feature_flags SET min_tier = 'starter' WHERE key IN (
  'dark_mode', 'animations', 'glass_effects'
);

UPDATE feature_flags SET min_tier = 'core' WHERE key IN (
  'module_crm'
);

UPDATE feature_flags SET min_tier = 'team' WHERE key IN (
  'module_finance'
);

UPDATE feature_flags SET min_tier = 'pro' WHERE key IN (
  'module_production', 'module_live_ops', 'module_legal', 'module_creative'
);

UPDATE feature_flags SET min_tier = 'enterprise' WHERE key IN (
  'beta_ai_copilot'
);

-- ─── 10. Seed new tier-gated feature flags ───────────────────

INSERT INTO feature_flags (key, label, description, flag_type, default_value, min_tier) VALUES
  -- Module gates
  ('module_invoicing',       'Invoicing Module',          'Enable invoicing and payments',                'boolean', 'true', 'team'),
  ('module_resource_planner','Resource Planner',          'Enable resource scheduling and planner',       'boolean', 'true', 'team'),
  ('module_vendor_lifecycle','Vendor Lifecycle',          'Enable vendor management workflows',           'boolean', 'true', 'pro'),
  ('module_spatial',         'Spatial Hierarchy',         'Enable spatial hierarchy and warehousing',     'boolean', 'true', 'enterprise'),
  ('module_revenue_engine',  'Revenue Recognition',       'Enable revenue recognition engine',            'boolean', 'true', 'enterprise'),

  -- RBAC depth
  ('rbac_all_roles',         'All 6 RBAC Roles',         'Enable director, client, collaborator roles',  'boolean', 'true', 'team'),
  ('rbac_field_masking',     'Field-Level Masking',       'Enable field visibility masks',                'boolean', 'true', 'pro'),
  ('rbac_custom_roles',      'Custom Role Definitions',   'Enable DB-backed custom roles',                'boolean', 'true', 'enterprise'),
  ('rbac_abac',              'Attribute-Based Access',    'Enable conditional permission grants',         'boolean', 'true', 'enterprise'),

  -- Integrations
  ('integration_api_read',   'API Access (Read)',         'Enable read-only API access',                  'boolean', 'true', 'team'),
  ('integration_api_full',   'API Access (Full)',         'Enable full API access',                       'boolean', 'true', 'pro'),
  ('integration_webhooks',   'Inbound Webhooks',          'Enable inbound webhook events',                'boolean', 'true', 'pro'),
  ('integration_sync',       'Bi-directional Sync',       'Enable outbound sync to providers',            'boolean', 'true', 'enterprise'),
  ('integration_sso',        'SSO (SAML/OIDC)',           'Enable single sign-on',                        'boolean', 'true', 'enterprise'),
  ('integration_email',      'Email Integration',         'Enable bi-directional email threading',        'boolean', 'true', 'enterprise'),

  -- Automations
  ('automation_create',      'Create Automations',        'Enable creating automation rules',              'boolean', 'true', 'team'),
  ('automation_scheduled',   'Scheduled Automations',     'Enable cron-based automation runs',             'boolean', 'true', 'pro'),
  ('automation_multi_step',  'Multi-Step Workflows',      'Enable chained workflow automations',           'boolean', 'true', 'enterprise'),
  ('automation_escalation',  'Escalation Engine',         'Enable escalation rules',                       'boolean', 'true', 'pro'),

  -- AI
  ('ai_reports',             'AI Report Generation',      'Enable AI-powered report generation',           'boolean', 'true', 'pro'),
  ('ai_copilot',             'AI Copilot',                'Enable AI copilot in command bar',              'boolean', 'true', 'pro'),
  ('ai_summaries',           'AI Message Summaries',      'Enable AI meeting/message summaries',           'boolean', 'true', 'enterprise'),
  ('ai_nl_query',            'NL Query → Dashboard',      'Enable natural language dashboard queries',     'boolean', 'true', 'enterprise'),
  ('ai_predictive',          'Predictive Scoring',        'Enable AI deal/risk scoring',                   'boolean', 'true', 'enterprise'),

  -- Customization & White-Label
  ('custom_logo',            'Custom Logo & Accent',      'Enable logo and accent color customization',    'boolean', 'true', 'team'),
  ('custom_brand_kit',       'Full Brand Kit',            'Enable full brand customization',               'boolean', 'true', 'pro'),
  ('custom_client_portal',   'Client Portal Branding',    'Enable branded client portal',                  'boolean', 'true', 'pro'),
  ('custom_vendor_portal',   'Vendor Portal Branding',    'Enable branded vendor portal',                  'boolean', 'true', 'enterprise'),
  ('custom_multi_brand',     'Multi-Brand Tenants',       'Enable multi-brand / tenant isolation',         'boolean', 'true', 'enterprise'),
  ('custom_fields',          'Custom Property Fields',    'Enable user-defined fields on entities',        'boolean', 'true', 'pro'),
  ('custom_pdf_templates',   'Custom PDF Templates',      'Enable custom PDF export templates',            'boolean', 'true', 'pro'),
  ('custom_whitelabel',      'White-Label Domain',        'Enable CNAME / white-label domain',             'boolean', 'true', 'enterprise')

ON CONFLICT (key) DO NOTHING;

-- ─── 11. Seed add-on bundles ─────────────────────────────────
-- Three add-on bundles available one tier below their natural gate.

INSERT INTO field_bundles (bundle_id, name, description, base_tier_required, monthly_price_cents) VALUES
  ('addon_live_ops',    'Live Operations Add-on',  'Unlock Live Ops module on Team tier',             'team',  7900),
  ('addon_ai_pack',     'AI Pack Add-on',          'Unlock AI copilot, reports, and summaries on Pro', 'pro',   9900),
  ('addon_whitelabel',  'White-Label Kit Add-on',  'Unlock multi-brand, CNAME, vendor portal on Pro',  'pro',  14900)
ON CONFLICT (bundle_id) DO NOTHING;
