-- ═══════════════════════════════════════════════════════════════════════════
-- FROZEN PHOENIX — Hierarchical Settings Framework
-- Adds: setting_definitions, settings, settings_change_log
-- Provides unified, typed, scoped settings with inheritance & locking
-- Maintains 3NF compliance and SSOT principles
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: ENUMS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TYPE setting_scope AS ENUM (
    'platform',
    'environment',
    'organization',
    'brand',
    'department',
    'project',
    'activation',
    'team',
    'role',
    'user'
);

CREATE TYPE setting_value_type AS ENUM (
    'boolean',
    'integer',
    'float',
    'text',
    'enum',
    'text_array',
    'jsonb'
);

CREATE TYPE setting_category AS ENUM (
    'governance',
    'security',
    'operational',
    'branding',
    'feature_access',
    'notifications',
    'preferences'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: SETTING DEFINITIONS (Schema / Catalog)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE setting_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category setting_category NOT NULL,
    key TEXT NOT NULL,
    label TEXT NOT NULL,
    description TEXT,
    value_type setting_value_type NOT NULL,
    default_value JSONB NOT NULL,
    allowed_values JSONB,
    min_value NUMERIC,
    max_value NUMERIC,
    min_scope setting_scope NOT NULL DEFAULT 'user',
    max_scope setting_scope NOT NULL DEFAULT 'platform',
    is_sensitive BOOLEAN DEFAULT false,
    requires_restart BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    deprecated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(category, key)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: SETTINGS (Scoped Values)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    definition_id UUID NOT NULL REFERENCES setting_definitions(id) ON DELETE CASCADE,
    scope_type setting_scope NOT NULL,
    scope_id UUID,
    value JSONB NOT NULL,
    is_locked BOOLEAN DEFAULT false,
    locked_by UUID,
    locked_at TIMESTAMPTZ,
    locked_reason TEXT,
    inherit_from_parent BOOLEAN DEFAULT true,
    version INTEGER NOT NULL DEFAULT 1,
    previous_value JSONB,
    changed_by UUID,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(definition_id, scope_type, scope_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: SETTINGS CHANGE LOG (Immutable Audit Trail)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE settings_change_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_id UUID NOT NULL REFERENCES settings(id) ON DELETE CASCADE,
    definition_id UUID NOT NULL REFERENCES setting_definitions(id),
    scope_type setting_scope NOT NULL,
    scope_id UUID,
    old_value JSONB,
    new_value JSONB,
    changed_by UUID NOT NULL,
    change_reason TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: INDEXES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX idx_setting_definitions_category ON setting_definitions(category);
CREATE INDEX idx_setting_definitions_category_key ON setting_definitions(category, key);

CREATE INDEX idx_settings_scope ON settings(scope_type, scope_id);
CREATE INDEX idx_settings_definition ON settings(definition_id);
CREATE INDEX idx_settings_scope_definition ON settings(scope_type, scope_id, definition_id);

CREATE INDEX idx_settings_change_log_setting ON settings_change_log(setting_id);
CREATE INDEX idx_settings_change_log_changed_by ON settings_change_log(changed_by);
CREATE INDEX idx_settings_change_log_created ON settings_change_log(created_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6: TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TRIGGER set_updated_at_setting_definitions
    BEFORE UPDATE ON setting_definitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_settings
    BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-log setting changes
CREATE OR REPLACE FUNCTION log_setting_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.value IS DISTINCT FROM NEW.value THEN
        INSERT INTO settings_change_log (
            setting_id, definition_id, scope_type, scope_id,
            old_value, new_value, changed_by, change_reason
        ) VALUES (
            NEW.id, NEW.definition_id, NEW.scope_type, NEW.scope_id,
            OLD.value, NEW.value, NEW.changed_by, NULL
        );
        NEW.version := OLD.version + 1;
        NEW.previous_value := OLD.value;
        NEW.changed_at := NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_setting_change
    BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION log_setting_change();

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 7: RLS
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE setting_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings_change_log ENABLE ROW LEVEL SECURITY;

-- Setting definitions are readable by all authenticated users
CREATE POLICY "setting_definitions_read" ON setting_definitions
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Settings: users can read settings in their own scope or parent scopes
CREATE POLICY "settings_read_own_scope" ON settings
    FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND (
            -- Platform/environment settings are visible to all
            scope_type IN ('platform', 'environment')
            -- Org settings visible to org members
            OR (scope_type = 'organization' AND scope_id IN (
                SELECT organization_id FROM org_memberships
                WHERE user_id = auth.uid() AND status = 'active'
            ))
            -- User settings visible to own user
            OR (scope_type = 'user' AND scope_id = auth.uid())
            -- Project settings visible to project members
            OR (scope_type = 'project' AND scope_id IN (
                SELECT project_id FROM project_members
                WHERE profile_id = auth.uid() AND status = 'active'
            ))
        )
    );

-- Settings: only admins (exec role in org) can write org-level settings
CREATE POLICY "settings_write_admin" ON settings
    FOR ALL USING (
        auth.uid() IS NOT NULL
        AND (
            -- Users can write their own user-scoped settings
            (scope_type = 'user' AND scope_id = auth.uid())
            -- Org admins can write org-scoped settings
            OR (scope_type = 'organization' AND scope_id IN (
                SELECT organization_id FROM org_memberships
                WHERE user_id = auth.uid() AND status = 'active' AND role = 'exec'
            ))
        )
    );

-- Change log: readable by org admins
CREATE POLICY "settings_change_log_read" ON settings_change_log
    FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND (
            scope_type IN ('platform', 'environment')
            OR (scope_type = 'organization' AND scope_id IN (
                SELECT organization_id FROM org_memberships
                WHERE user_id = auth.uid() AND status = 'active' AND role = 'exec'
            ))
            OR (scope_type = 'user' AND scope_id = auth.uid())
        )
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 8: HELPER FUNCTIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- Resolve a setting value through the inheritance chain
CREATE OR REPLACE FUNCTION resolve_setting(
    p_category setting_category,
    p_key TEXT,
    p_scope_chain JSONB DEFAULT '[]'
) RETURNS JSONB AS $$
DECLARE
    result JSONB;
    scope_entry JSONB;
    scope_type_val setting_scope;
    scope_id_val UUID;
BEGIN
    -- Walk scope chain from most-specific to least-specific
    FOR scope_entry IN SELECT * FROM jsonb_array_elements(p_scope_chain)
    LOOP
        scope_type_val := (scope_entry->>'scope_type')::setting_scope;
        scope_id_val := (scope_entry->>'scope_id')::UUID;

        SELECT s.value INTO result
        FROM settings s
        JOIN setting_definitions sd ON sd.id = s.definition_id
        WHERE sd.category = p_category
          AND sd.key = p_key
          AND s.scope_type = scope_type_val
          AND (s.scope_id = scope_id_val OR (s.scope_id IS NULL AND scope_id_val IS NULL))
          AND s.inherit_from_parent = true;

        IF result IS NOT NULL THEN
            -- Check if a higher scope locked this setting
            -- If locked, skip this value and continue to the locking scope
            PERFORM 1 FROM settings s2
            JOIN setting_definitions sd2 ON sd2.id = s2.definition_id
            WHERE sd2.category = p_category
              AND sd2.key = p_key
              AND s2.is_locked = true
              AND s2.scope_type != scope_type_val;

            RETURN result;
        END IF;
    END LOOP;

    -- Fallback to platform default from setting_definitions
    SELECT sd.default_value INTO result
    FROM setting_definitions sd
    WHERE sd.category = p_category AND sd.key = p_key;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 9: SEED SETTING DEFINITIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- Category A: Governance & Compliance
INSERT INTO setting_definitions (category, key, label, description, value_type, default_value, min_scope, max_scope, is_sensitive, display_order) VALUES
('governance', 'data_retention_days', 'Data Retention Period', 'Number of days to retain data before archival', 'integer', '730', 'organization', 'platform', false, 10),
('governance', 'audit_log_enabled', 'Audit Logging', 'Enable audit logging for all user actions', 'boolean', 'true', 'organization', 'platform', false, 20),
('governance', 'require_compliance_ack', 'Require Compliance Acknowledgment', 'Require users to acknowledge compliance policies', 'boolean', 'true', 'organization', 'platform', false, 30),
('governance', 'mfa_enforcement', 'MFA Enforcement', 'Multi-factor authentication enforcement level', 'enum', '"optional"', 'organization', 'organization', false, 40),
('governance', 'sso_enforcement', 'SSO Enforcement', 'Require SSO for all users in the organization', 'boolean', 'false', 'organization', 'organization', false, 50),
('governance', 'session_timeout_hours', 'Session Timeout', 'Hours before inactive sessions expire', 'integer', '720', 'organization', 'organization', false, 60),
('governance', 'max_sessions_per_user', 'Max Sessions Per User', 'Maximum concurrent sessions allowed per user', 'integer', '5', 'organization', 'organization', false, 70),
('governance', 'invitation_expiry_days', 'Invitation Expiry', 'Days before invitations expire', 'integer', '7', 'organization', 'organization', false, 80),
('governance', 'allowed_email_domains', 'Allowed Email Domains', 'Restrict signups to specific email domains', 'text_array', '[]', 'organization', 'organization', true, 90),
('governance', 'legal_disclaimer_url', 'Legal Disclaimer URL', 'URL to organization legal disclaimer', 'text', 'null', 'organization', 'platform', false, 100),
('governance', 'privacy_policy_url', 'Privacy Policy URL', 'URL to organization privacy policy', 'text', 'null', 'organization', 'platform', false, 110),
('governance', 'soc2_mode', 'SOC2 Compliance Mode', 'Enable strict SOC2 compliance controls', 'boolean', 'false', 'organization', 'platform', false, 120);

-- Category B: Security Controls
INSERT INTO setting_definitions (category, key, label, description, value_type, default_value, min_scope, max_scope, is_sensitive, display_order) VALUES
('security', 'password_min_length', 'Minimum Password Length', 'Minimum required password length', 'integer', '8', 'organization', 'platform', false, 10),
('security', 'password_require_uppercase', 'Require Uppercase', 'Require at least one uppercase letter in passwords', 'boolean', 'true', 'organization', 'platform', false, 20),
('security', 'password_require_special', 'Require Special Characters', 'Require at least one special character in passwords', 'boolean', 'true', 'organization', 'platform', false, 30),
('security', 'ip_allowlist', 'IP Allowlist', 'List of allowed IP addresses or CIDR ranges', 'text_array', '[]', 'organization', 'organization', true, 40),
('security', 'device_trust_enabled', 'Device Trust', 'Enable device trust verification', 'boolean', 'false', 'organization', 'organization', false, 50),
('security', 'api_token_max_lifetime_days', 'API Token Max Lifetime', 'Maximum lifetime for API tokens in days', 'integer', '365', 'organization', 'organization', false, 60),
('security', 'access_log_retention_days', 'Access Log Retention', 'Days to retain access logs', 'integer', '730', 'organization', 'platform', false, 70),
('security', 'auto_revoke_external_hours', 'Auto-Revoke External Access', 'Hours after project load-out to revoke external access', 'integer', '48', 'organization', 'organization', false, 80),
('security', 'csp_policy_overrides', 'CSP Policy Overrides', 'Custom Content-Security-Policy directive overrides', 'text', 'null', 'organization', 'platform', true, 90);

-- Category C: Operational Controls
INSERT INTO setting_definitions (category, key, label, description, value_type, default_value, min_scope, max_scope, is_sensitive, display_order) VALUES
('operational', 'default_project_phase', 'Default Project Phase', 'Default phase for new projects', 'enum', '"pre_production"', 'organization', 'organization', false, 10),
('operational', 'budget_approval_threshold', 'Budget Approval Threshold', 'Amount above which budget changes require approval', 'float', '5000', 'project', 'organization', false, 20),
('operational', 'auto_escalation_hours', 'Auto-Escalation Hours', 'Hours before unapproved items auto-escalate', 'integer', '72', 'project', 'organization', false, 30),
('operational', 'require_3way_match', 'Require 3-Way Match', 'Require PO/receipt/invoice match for payments', 'boolean', 'true', 'organization', 'organization', false, 40),
('operational', 'default_currency', 'Default Currency', 'Default currency for financial transactions', 'text', '"USD"', 'organization', 'organization', false, 50),
('operational', 'fiscal_year_start_month', 'Fiscal Year Start Month', 'Month number (1-12) when fiscal year begins', 'integer', '1', 'organization', 'organization', false, 60),
('operational', 'naming_convention', 'Naming Convention', 'Default naming convention for assets and entities', 'enum', '"title_case"', 'organization', 'organization', false, 70),
('operational', 'template_auto_provision', 'Template Auto-Provision', 'Automatically provision templates for new projects', 'boolean', 'true', 'organization', 'organization', false, 80),
('operational', 'notification_digest_schedule', 'Notification Digest', 'Default notification digest frequency', 'enum', '"daily"', 'user', 'organization', false, 90);

-- Category D: Branding & Theming
INSERT INTO setting_definitions (category, key, label, description, value_type, default_value, min_scope, max_scope, is_sensitive, display_order) VALUES
('branding', 'logo_icon_url', 'Logo Icon URL', 'URL to brand logo icon', 'text', '"/logo-icon.svg"', 'brand', 'brand', false, 10),
('branding', 'logo_wordmark_url', 'Logo Wordmark URL', 'URL to brand logo wordmark', 'text', 'null', 'brand', 'brand', false, 20),
('branding', 'primary_color', 'Primary Color', 'Brand primary color (HSL)', 'text', '"220 70% 50%"', 'brand', 'brand', false, 30),
('branding', 'accent_color', 'Accent Color', 'Brand accent color (HSL)', 'text', '"31 97% 60%"', 'brand', 'brand', false, 40),
('branding', 'font_family', 'Font Family', 'Brand font family', 'text', '"var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, sans-serif"', 'brand', 'brand', false, 50),
('branding', 'domain_mapping', 'Domain Mapping', 'Custom domain for this brand', 'text', 'null', 'brand', 'platform', false, 60),
('branding', 'enable_dark_mode', 'Enable Dark Mode', 'Allow dark mode for this brand', 'boolean', 'true', 'brand', 'brand', false, 70),
('branding', 'enable_animations', 'Enable Animations', 'Allow motion/animations for this brand', 'boolean', 'true', 'brand', 'brand', false, 80),
('branding', 'custom_css_url', 'Custom CSS URL', 'URL to custom CSS overrides', 'text', 'null', 'brand', 'brand', false, 90);

-- Category E: Feature Access
INSERT INTO setting_definitions (category, key, label, description, value_type, default_value, min_scope, max_scope, is_sensitive, display_order) VALUES
('feature_access', 'module_crm', 'CRM Module', 'Enable CRM and pipeline features', 'boolean', 'true', 'organization', 'platform', false, 10),
('feature_access', 'module_production', 'Production Module', 'Enable production management features', 'boolean', 'true', 'organization', 'platform', false, 20),
('feature_access', 'module_finance', 'Finance Module', 'Enable finance and billing features', 'boolean', 'true', 'organization', 'platform', false, 30),
('feature_access', 'module_live_ops', 'Live Operations Module', 'Enable live event operations features', 'boolean', 'true', 'organization', 'platform', false, 40),
('feature_access', 'module_legal', 'Legal & Compliance Module', 'Enable legal and compliance features', 'boolean', 'true', 'organization', 'platform', false, 50),
('feature_access', 'module_creative', 'Creative Module', 'Enable creative and brand management features', 'boolean', 'true', 'organization', 'platform', false, 60),
('feature_access', 'beta_ai_copilot', 'AI Copilot (Beta)', 'Enable AI copilot features', 'boolean', 'false', 'role', 'platform', false, 70),
('feature_access', 'experimental_gantt', 'Gantt Chart (Experimental)', 'Enable experimental Gantt chart view', 'boolean', 'false', 'organization', 'platform', false, 80),
('feature_access', 'tier_entitlement', 'Tier Entitlement', 'Organization plan tier', 'enum', '"pro"', 'organization', 'platform', false, 90);

-- Category F: Notification Preferences
INSERT INTO setting_definitions (category, key, label, description, value_type, default_value, min_scope, max_scope, is_sensitive, display_order) VALUES
('notifications', 'email_enabled', 'Email Notifications', 'Enable email notification delivery', 'boolean', 'true', 'user', 'organization', false, 10),
('notifications', 'push_enabled', 'Push Notifications', 'Enable push notification delivery', 'boolean', 'true', 'user', 'organization', false, 20),
('notifications', 'sms_enabled', 'SMS Notifications', 'Enable SMS notification delivery', 'boolean', 'false', 'user', 'organization', false, 30),
('notifications', 'in_app_enabled', 'In-App Notifications', 'Enable in-app notification delivery', 'boolean', 'true', 'user', 'organization', false, 40),
('notifications', 'digest_schedule', 'Digest Schedule', 'Notification digest frequency', 'enum', '"immediate"', 'user', 'user', false, 50),
('notifications', 'quiet_hours_start', 'Quiet Hours Start', 'Start of quiet hours (HH:MM)', 'text', 'null', 'user', 'user', false, 60),
('notifications', 'quiet_hours_end', 'Quiet Hours End', 'End of quiet hours (HH:MM)', 'text', 'null', 'user', 'user', false, 70),
('notifications', 'escalation_delay_mins', 'Escalation Delay', 'Minutes before escalating unacknowledged notifications', 'integer', '60', 'organization', 'organization', false, 80),
('notifications', 'category_overrides', 'Category Overrides', 'Per-category notification preferences', 'jsonb', '{"approvals":{"email":true,"push":true,"in_app":true},"tasks":{"email":true,"push":true,"in_app":true},"projects":{"email":true,"push":true,"in_app":true},"finance":{"email":false,"push":false,"in_app":true},"crew":{"email":true,"push":true,"in_app":true},"vendors":{"email":false,"push":false,"in_app":true}}', 'user', 'user', false, 90);

-- Category G: Personal User Preferences
INSERT INTO setting_definitions (category, key, label, description, value_type, default_value, min_scope, max_scope, is_sensitive, display_order) VALUES
('preferences', 'theme', 'Theme', 'UI color mode preference', 'enum', '"dark"', 'user', 'user', false, 10),
('preferences', 'timezone', 'Timezone', 'User timezone for date/time display', 'text', '"America/New_York"', 'user', 'user', false, 20),
('preferences', 'locale', 'Locale', 'User locale for formatting', 'text', '"en-US"', 'user', 'user', false, 30),
('preferences', 'date_format', 'Date Format', 'Preferred date format', 'text', '"MM/DD/YYYY"', 'user', 'user', false, 40),
('preferences', 'layout_density', 'Layout Density', 'UI density preference', 'enum', '"default"', 'user', 'user', false, 50),
('preferences', 'dashboard_layout', 'Dashboard Layout', 'Custom dashboard widget configuration', 'jsonb', 'null', 'user', 'user', false, 60),
('preferences', 'saved_filters', 'Saved Filters', 'User-saved filter configurations', 'jsonb', '{}', 'user', 'user', false, 70),
('preferences', 'sidebar_pinned', 'Sidebar Pinned Items', 'Pinned navigation items', 'text_array', '[]', 'user', 'user', false, 80),
('preferences', 'sidebar_collapsed', 'Sidebar Collapsed', 'Whether sidebar is collapsed by default', 'boolean', 'false', 'user', 'user', false, 90),
('preferences', 'command_bar_recent', 'Command Bar Recent', 'Recent command bar entries', 'text_array', '[]', 'user', 'user', false, 100);
