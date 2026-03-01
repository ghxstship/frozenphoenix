-- ═══════════════════════════════════════════════════════════════
-- Migration 031: Field-Level RBAC & Usage-Based Pricing
-- 
-- Creates the infrastructure for:
-- 1. Field tier assignments (SSOT: field_type_id → pricing_tier)
-- 2. Organization subscriptions and bundle management
-- 3. Field-level usage metering
-- 4. Upsell trigger configuration
-- ═══════════════════════════════════════════════════════════════

-- ─── Enums ───────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE pricing_tier AS ENUM ('core', 'pro', 'enterprise');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('active', 'trialing', 'past_due', 'cancelled', 'paused');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE billing_cycle AS ENUM ('monthly', 'annual');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE field_visibility AS ENUM ('VISIBLE', 'MASKED', 'REDACTED', 'HIDDEN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE field_write_access AS ENUM ('none', 'write', 'manage');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Field Tier Assignments ──────────────────────────────────

CREATE TABLE IF NOT EXISTS field_tier_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_type_id TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  pricing_tier pricing_tier NOT NULL DEFAULT 'core',
  safety_critical BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE field_tier_assignments IS 'SSOT mapping of field_type_id to pricing tier. Safety-critical fields bypass all tier restrictions.';

CREATE INDEX idx_field_tier_assignments_tier ON field_tier_assignments(pricing_tier);
CREATE INDEX idx_field_tier_assignments_safety ON field_tier_assignments(safety_critical) WHERE safety_critical = TRUE;

-- ─── Field Role Access Rules ─────────────────────────────────

CREATE TABLE IF NOT EXISTS field_role_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_type_id TEXT NOT NULL,
  role_key TEXT NOT NULL,
  visibility field_visibility NOT NULL DEFAULT 'VISIBLE',
  write_access field_write_access NOT NULL DEFAULT 'none',
  exportable BOOLEAN NOT NULL DEFAULT FALSE,
  api_accessible BOOLEAN NOT NULL DEFAULT TRUE,
  audit_logged BOOLEAN NOT NULL DEFAULT FALSE,
  override_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(field_type_id, role_key),
  CONSTRAINT fk_field_role_access_field FOREIGN KEY (field_type_id)
    REFERENCES field_tier_assignments(field_type_id) ON DELETE CASCADE
);

COMMENT ON TABLE field_role_access IS 'Per-role access rules for each field type. Consumed by field-resolver.ts at runtime.';

CREATE INDEX idx_field_role_access_field ON field_role_access(field_type_id);
CREATE INDEX idx_field_role_access_role ON field_role_access(role_key);

-- ─── Organization Subscriptions ──────────────────────────────

CREATE TABLE IF NOT EXISTS org_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  pricing_tier pricing_tier NOT NULL DEFAULT 'core',
  status subscription_status NOT NULL DEFAULT 'active',
  billing_cycle billing_cycle NOT NULL DEFAULT 'monthly',
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id)
);

COMMENT ON TABLE org_subscriptions IS 'Active subscription per organization. One subscription per org enforced by unique constraint.';

CREATE INDEX idx_org_subscriptions_org ON org_subscriptions(organization_id);
CREATE INDEX idx_org_subscriptions_status ON org_subscriptions(status);

-- ─── Field Bundles ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS field_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  base_tier_required pricing_tier NOT NULL DEFAULT 'core',
  monthly_price_cents INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE field_bundles IS 'Add-on bundle definitions. Each bundle unlocks a group of field types.';

-- ─── Field Bundle Items (Junction) ──────────────────────────

CREATE TABLE IF NOT EXISTS field_bundle_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id TEXT NOT NULL REFERENCES field_bundles(bundle_id) ON DELETE CASCADE,
  field_type_id TEXT NOT NULL REFERENCES field_tier_assignments(field_type_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(bundle_id, field_type_id)
);

COMMENT ON TABLE field_bundle_items IS 'Junction table: bundle → field_type_id mapping.';

-- ─── Organization Bundle Subscriptions ───────────────────────

CREATE TABLE IF NOT EXISTS org_bundle_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  bundle_id TEXT NOT NULL REFERENCES field_bundles(bundle_id) ON DELETE CASCADE,
  status subscription_status NOT NULL DEFAULT 'active',
  activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  stripe_subscription_item_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, bundle_id)
);

COMMENT ON TABLE org_bundle_subscriptions IS 'Active add-on bundles per organization.';

CREATE INDEX idx_org_bundle_subs_org ON org_bundle_subscriptions(organization_id);
CREATE INDEX idx_org_bundle_subs_status ON org_bundle_subscriptions(status);

-- ─── Field-Level Overrides ───────────────────────────────────

CREATE TABLE IF NOT EXISTS field_access_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  field_type_id TEXT NOT NULL REFERENCES field_tier_assignments(field_type_id) ON DELETE CASCADE,
  role_key TEXT NOT NULL,
  granted_visibility field_visibility NOT NULL,
  granted_write field_write_access NOT NULL DEFAULT 'none',
  scope_type TEXT NOT NULL DEFAULT 'org' CHECK (scope_type IN ('global', 'org', 'project')),
  scope_id UUID,
  granted_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  reason TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE field_access_overrides IS 'Per-org, per-field, per-role overrides. Used for project-specific grants (e.g., vendor sees contact email on their assigned project).';

CREATE INDEX idx_field_overrides_org ON field_access_overrides(organization_id);
CREATE INDEX idx_field_overrides_field ON field_access_overrides(field_type_id);
CREATE INDEX idx_field_overrides_active ON field_access_overrides(is_active) WHERE is_active = TRUE;

-- ─── Usage Metering ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS field_usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  field_type_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('read', 'write', 'export')),
  resource TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE field_usage_events IS 'Append-only field access events for usage metering. Aggregated daily by pg_cron.';

CREATE INDEX idx_field_usage_org_date ON field_usage_events(organization_id, event_date);
CREATE INDEX idx_field_usage_field ON field_usage_events(field_type_id, event_date);

-- Partition-friendly: daily partition key
-- In production, convert to partitioned table by event_date

CREATE TABLE IF NOT EXISTS field_usage_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  field_type_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('read', 'write', 'export')),
  total_count INTEGER NOT NULL DEFAULT 0,
  unique_users INTEGER NOT NULL DEFAULT 0,
  event_date DATE NOT NULL,
  pricing_tier pricing_tier NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, field_type_id, action, event_date)
);

COMMENT ON TABLE field_usage_daily IS 'Aggregated daily usage summaries. Populated by pg_cron job.';

CREATE INDEX idx_field_usage_daily_org ON field_usage_daily(organization_id, event_date);

-- ─── Upsell Configuration ────────────────────────────────────

CREATE TABLE IF NOT EXISTS upsell_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('field_access_attempt', 'export_attempt', 'api_tier_insufficient', 'user_growth')),
  threshold_count INTEGER NOT NULL DEFAULT 10,
  threshold_window_days INTEGER NOT NULL DEFAULT 3,
  target_tier pricing_tier NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('in_app', 'email', 'slack_webhook')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS upsell_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  trigger_id UUID NOT NULL REFERENCES upsell_triggers(id),
  user_id UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  converted BOOLEAN NOT NULL DEFAULT FALSE,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_upsell_events_org ON upsell_events(organization_id);
CREATE INDEX idx_upsell_events_converted ON upsell_events(converted) WHERE converted = FALSE;

-- ─── RLS Policies ────────────────────────────────────────────

ALTER TABLE field_tier_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_role_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_bundle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_bundle_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_access_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_usage_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE upsell_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE upsell_events ENABLE ROW LEVEL SECURITY;

-- Field tier assignments and role access: readable by all authenticated
CREATE POLICY "field_tier_assignments_read" ON field_tier_assignments
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "field_role_access_read" ON field_role_access
  FOR SELECT TO authenticated USING (TRUE);

-- Field bundles: readable by all authenticated
CREATE POLICY "field_bundles_read" ON field_bundles
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "field_bundle_items_read" ON field_bundle_items
  FOR SELECT TO authenticated USING (TRUE);

-- Org subscriptions: org-scoped read
CREATE POLICY "org_subscriptions_read" ON org_subscriptions
  FOR SELECT TO authenticated
  USING (organization_id = (SELECT get_user_org_id()));

-- Org bundle subscriptions: org-scoped read
CREATE POLICY "org_bundle_subs_read" ON org_bundle_subscriptions
  FOR SELECT TO authenticated
  USING (organization_id = (SELECT get_user_org_id()));

-- Field access overrides: org-scoped read
CREATE POLICY "field_overrides_read" ON field_access_overrides
  FOR SELECT TO authenticated
  USING (organization_id = (SELECT get_user_org_id()));

-- Usage events: org-scoped, append-only
CREATE POLICY "field_usage_insert" ON field_usage_events
  FOR INSERT TO authenticated
  WITH CHECK (organization_id = (SELECT get_user_org_id()) AND user_id = auth.uid());

CREATE POLICY "field_usage_read" ON field_usage_events
  FOR SELECT TO authenticated
  USING (organization_id = (SELECT get_user_org_id()));

-- Usage daily: org-scoped read
CREATE POLICY "field_usage_daily_read" ON field_usage_daily
  FOR SELECT TO authenticated
  USING (organization_id = (SELECT get_user_org_id()));

-- Upsell triggers: readable by all authenticated
CREATE POLICY "upsell_triggers_read" ON upsell_triggers
  FOR SELECT TO authenticated USING (TRUE);

-- Upsell events: org-scoped
CREATE POLICY "upsell_events_read" ON upsell_events
  FOR SELECT TO authenticated
  USING (organization_id = (SELECT get_user_org_id()));

-- ─── updated_at Triggers ─────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_field_tier_assignments_updated
  BEFORE UPDATE ON field_tier_assignments
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trg_org_subscriptions_updated
  BEFORE UPDATE ON org_subscriptions
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trg_field_bundles_updated
  BEFORE UPDATE ON field_bundles
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trg_org_bundle_subs_updated
  BEFORE UPDATE ON org_bundle_subscriptions
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trg_field_overrides_updated
  BEFORE UPDATE ON field_access_overrides
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

-- ─── Helper: Resolve org pricing tier ────────────────────────

CREATE OR REPLACE FUNCTION get_org_pricing_tier(p_org_id UUID)
RETURNS pricing_tier AS $$
  SELECT COALESCE(
    (SELECT pricing_tier FROM org_subscriptions
     WHERE organization_id = p_org_id AND status = 'active'
     LIMIT 1),
    'core'::pricing_tier
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ─── Helper: Check if field accessible for org ───────────────

CREATE OR REPLACE FUNCTION is_field_accessible(
  p_org_id UUID,
  p_field_type_id TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_field_tier pricing_tier;
  v_org_tier pricing_tier;
  v_safety BOOLEAN;
  v_tier_rank RECORD;
BEGIN
  SELECT pricing_tier, safety_critical
    INTO v_field_tier, v_safety
    FROM field_tier_assignments
    WHERE field_type_id = p_field_type_id;

  IF NOT FOUND THEN RETURN TRUE; END IF;
  IF v_safety THEN RETURN TRUE; END IF;

  v_org_tier := get_org_pricing_tier(p_org_id);

  RETURN CASE
    WHEN v_org_tier = 'enterprise' THEN TRUE
    WHEN v_org_tier = 'pro' AND v_field_tier IN ('core', 'pro') THEN TRUE
    WHEN v_org_tier = 'core' AND v_field_tier = 'core' THEN TRUE
    ELSE EXISTS (
      SELECT 1 FROM org_bundle_subscriptions obs
      JOIN field_bundle_items fbi ON fbi.bundle_id = obs.bundle_id
      WHERE obs.organization_id = p_org_id
        AND obs.status = 'active'
        AND fbi.field_type_id = p_field_type_id
    )
  END;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
