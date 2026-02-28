-- ═══════════════════════════════════════════════════════════════════════════
-- FROZEN PHOENIX — Feature Flag System
-- Adds: feature_flags, feature_flag_overrides
-- Supports boolean, percentage rollout, and variant-based flags
-- Cross-cutting targeting by org, role, environment, region, user
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: ENUMS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TYPE feature_flag_type AS ENUM ('boolean', 'percentage', 'variant');
CREATE TYPE feature_flag_override_scope AS ENUM ('organization', 'project', 'user', 'role');

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: FEATURE FLAGS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    description TEXT,
    flag_type feature_flag_type NOT NULL DEFAULT 'boolean',
    default_value JSONB NOT NULL DEFAULT 'false',
    is_active BOOLEAN DEFAULT true,

    -- Targeting rules
    target_orgs UUID[] DEFAULT '{}',
    target_roles TEXT[] DEFAULT '{}',
    target_environments TEXT[] DEFAULT '{}',
    target_regions TEXT[] DEFAULT '{}',
    target_user_ids UUID[] DEFAULT '{}',
    rollout_percentage INTEGER DEFAULT 0
        CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),

    -- Variant definitions (for variant type)
    variants JSONB DEFAULT '[]',

    -- Lifecycle
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: FEATURE FLAG OVERRIDES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE feature_flag_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
    scope_type feature_flag_override_scope NOT NULL,
    scope_id UUID NOT NULL,
    value JSONB NOT NULL,
    reason TEXT,
    created_by UUID,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(flag_id, scope_type, scope_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: INDEXES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX idx_feature_flags_key ON feature_flags(key);
CREATE INDEX idx_feature_flags_active ON feature_flags(is_active) WHERE is_active = true;
CREATE INDEX idx_feature_flag_overrides_flag ON feature_flag_overrides(flag_id);
CREATE INDEX idx_feature_flag_overrides_scope ON feature_flag_overrides(scope_type, scope_id);
CREATE INDEX idx_feature_flag_overrides_expires ON feature_flag_overrides(expires_at)
    WHERE expires_at IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TRIGGER set_updated_at_feature_flags
    BEFORE UPDATE ON feature_flags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_feature_flag_overrides
    BEFORE UPDATE ON feature_flag_overrides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6: RLS
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flag_overrides ENABLE ROW LEVEL SECURITY;

-- Feature flags are readable by all authenticated users
CREATE POLICY "feature_flags_read" ON feature_flags
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only exec roles can manage feature flags
CREATE POLICY "feature_flags_manage" ON feature_flags
    FOR ALL USING (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM org_memberships
            WHERE user_id = auth.uid() AND status = 'active' AND role = 'exec'
        )
    );

-- Feature flag overrides readable by all authenticated users
CREATE POLICY "feature_flag_overrides_read" ON feature_flag_overrides
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only exec roles can manage overrides
CREATE POLICY "feature_flag_overrides_manage" ON feature_flag_overrides
    FOR ALL USING (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM org_memberships
            WHERE user_id = auth.uid() AND status = 'active' AND role = 'exec'
        )
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 7: EVALUATION FUNCTION
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION evaluate_feature_flag(
    p_flag_key TEXT,
    p_user_id UUID DEFAULT NULL,
    p_org_id UUID DEFAULT NULL,
    p_role TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    flag_record RECORD;
    override_val JSONB;
BEGIN
    -- Get the flag
    SELECT * INTO flag_record
    FROM feature_flags
    WHERE key = p_flag_key AND is_active = true;

    IF NOT FOUND THEN
        RETURN 'false';
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

        -- Check if user is directly targeted
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

        -- Check if org is targeted
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

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 8: SEED DEFAULT FLAGS
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO feature_flags (key, label, description, flag_type, default_value) VALUES
('module_crm', 'CRM Module', 'Enable CRM and pipeline features', 'boolean', 'true'),
('module_production', 'Production Module', 'Enable production management features', 'boolean', 'true'),
('module_finance', 'Finance Module', 'Enable finance and billing features', 'boolean', 'true'),
('module_live_ops', 'Live Operations Module', 'Enable live event operations features', 'boolean', 'true'),
('module_legal', 'Legal & Compliance Module', 'Enable legal and compliance features', 'boolean', 'true'),
('module_creative', 'Creative Module', 'Enable creative and brand management features', 'boolean', 'true'),
('beta_ai_copilot', 'AI Copilot (Beta)', 'Enable AI copilot features', 'boolean', 'false'),
('experimental_gantt', 'Gantt Chart (Experimental)', 'Enable experimental Gantt chart view', 'boolean', 'false'),
('dark_mode', 'Dark Mode', 'Enable dark mode toggle', 'boolean', 'true'),
('animations', 'Animations', 'Enable UI animations and transitions', 'boolean', 'true'),
('glass_effects', 'Glass Effects', 'Enable glassmorphism UI effects', 'boolean', 'true');
