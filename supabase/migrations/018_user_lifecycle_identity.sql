-- ═══════════════════════════════════════════════════════════════
-- MIGRATION 015 — User Lifecycle & Identity Management
-- ═══════════════════════════════════════════════════════════════
-- Implements:
--   • Separated identity → profile → org membership layers
--   • Multi-org memberships with per-org roles
--   • Invitation system with token-based onboarding
--   • User onboarding state machine
--   • User preferences persistence
--   • Session & device tracking
--   • Login audit log
--   • API token lifecycle
--   • Temporary access grants
--   • Role change audit log
--   • Compliance acknowledgments
--   • Data retention policies
--   • Soft delete with anonymization support
--   • Backward-compatible profiles view
-- ═══════════════════════════════════════════════════════════════

-- ─── ENUMS ───────────────────────────────────────────────────

CREATE TYPE user_lifecycle_status AS ENUM (
    'pending_verification',
    'onboarding',
    'active',
    'suspended',
    'deactivated',
    'pending_deletion',
    'anonymized'
);

CREATE TYPE org_membership_status AS ENUM (
    'invited',
    'active',
    'suspended',
    'expired',
    'revoked'
);

CREATE TYPE invitation_status AS ENUM (
    'pending',
    'accepted',
    'expired',
    'revoked'
);

CREATE TYPE onboarding_step_status AS ENUM (
    'not_started',
    'in_progress',
    'completed',
    'skipped'
);

CREATE TYPE login_event_type AS ENUM (
    'login_success',
    'login_failure',
    'logout',
    'token_refresh',
    'password_reset_request',
    'password_reset_complete',
    'mfa_challenge',
    'mfa_success',
    'mfa_failure',
    'api_token_auth',
    'session_revoked',
    'account_locked'
);

CREATE TYPE auth_method AS ENUM (
    'password',
    'magic_link',
    'oauth_google',
    'oauth_github',
    'oauth_azure',
    'saml',
    'api_token',
    'session_refresh'
);

CREATE TYPE api_token_status AS ENUM (
    'active',
    'expired',
    'revoked'
);

CREATE TYPE access_grant_status AS ENUM (
    'active',
    'expired',
    'revoked'
);

CREATE TYPE compliance_policy_type AS ENUM (
    'terms_of_service',
    'privacy_policy',
    'acceptable_use',
    'nda',
    'data_processing',
    'cookie_policy',
    'sop',
    'custom'
);

CREATE TYPE retention_action AS ENUM (
    'anonymize',
    'purge',
    'archive',
    'retain'
);

CREATE TYPE preference_category AS ENUM (
    'display',
    'notifications',
    'accessibility',
    'privacy',
    'integrations'
);

-- ═══════════════════════════════════════════════════════════════
-- USER PROFILES — Canonical user identity (replaces profiles)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    job_title TEXT,
    bio TEXT,
    timezone TEXT NOT NULL DEFAULT 'America/New_York',
    locale TEXT NOT NULL DEFAULT 'en-US',
    date_format TEXT NOT NULL DEFAULT 'MM/DD/YYYY',
    lifecycle_status user_lifecycle_status NOT NULL DEFAULT 'pending_verification',
    onboarding_completed_at TIMESTAMPTZ,
    last_active_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    anonymized_at TIMESTAMPTZ,
    deletion_requested_at TIMESTAMPTZ,
    deletion_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- ORG MEMBERSHIPS — User ↔ Organization with scoped role
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE org_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'pm' CHECK (role IN ('exec', 'pm', 'client', 'vendor')),
    status org_membership_status NOT NULL DEFAULT 'active',
    is_default_org BOOLEAN NOT NULL DEFAULT false,
    invited_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    invited_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    suspended_at TIMESTAMPTZ,
    suspended_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);

-- ═══════════════════════════════════════════════════════════════
-- INVITATIONS — Pre-registration access grants
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'pm' CHECK (role IN ('exec', 'pm', 'client', 'vendor')),
    token TEXT NOT NULL UNIQUE,
    status invitation_status NOT NULL DEFAULT 'pending',
    invited_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    personal_message TEXT,
    project_ids UUID[] DEFAULT '{}',
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMPTZ,
    accepted_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- ONBOARDING STEP DEFINITIONS — Template steps per role
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE onboarding_step_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL CHECK (role IN ('exec', 'pm', 'client', 'vendor', 'all')),
    step_key TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_required BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    gate_access BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role, step_key)
);

-- ═══════════════════════════════════════════════════════════════
-- USER ONBOARDING PROGRESS — Per-user step tracking
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE user_onboarding_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    step_definition_id UUID NOT NULL REFERENCES onboarding_step_definitions(id) ON DELETE CASCADE,
    status onboarding_step_status NOT NULL DEFAULT 'not_started',
    completed_at TIMESTAMPTZ,
    skipped_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, step_definition_id)
);

-- ═══════════════════════════════════════════════════════════════
-- USER PREFERENCES — Key-value preference storage
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    category preference_category NOT NULL,
    key TEXT NOT NULL,
    value JSONB NOT NULL DEFAULT 'null',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, category, key)
);

-- ═══════════════════════════════════════════════════════════════
-- LOGIN AUDIT LOG — Immutable authentication event log
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE login_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    email TEXT,
    event_type login_event_type NOT NULL,
    auth_method auth_method,
    ip_address INET,
    user_agent TEXT,
    device_fingerprint TEXT,
    country_code TEXT,
    city TEXT,
    success BOOLEAN NOT NULL DEFAULT true,
    failure_reason TEXT,
    session_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- USER SESSIONS — Active session tracking
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    session_token_hash TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    device_name TEXT,
    device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'api', 'unknown')),
    browser TEXT,
    os TEXT,
    country_code TEXT,
    city TEXT,
    is_current BOOLEAN NOT NULL DEFAULT false,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- API TOKENS — Personal access tokens
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE api_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    token_prefix TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    scopes TEXT[] NOT NULL DEFAULT '{"read"}',
    permission_level TEXT NOT NULL DEFAULT 'pm' CHECK (permission_level IN ('exec', 'pm', 'client', 'vendor')),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    status api_token_status NOT NULL DEFAULT 'active',
    last_used_at TIMESTAMPTZ,
    last_used_ip INET,
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- TEMPORARY ACCESS GRANTS — Time-bound resource access
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE temporary_access_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    permission_level TEXT NOT NULL CHECK (permission_level IN ('exec', 'pm', 'client', 'vendor')),
    actions TEXT[] NOT NULL DEFAULT '{"read"}',
    reason TEXT NOT NULL,
    granted_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    status access_grant_status NOT NULL DEFAULT 'active',
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- ROLE CHANGE LOG — Immutable permission audit trail
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE role_change_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    membership_id UUID REFERENCES org_memberships(id) ON DELETE SET NULL,
    change_type TEXT NOT NULL CHECK (change_type IN (
        'role_granted', 'role_changed', 'role_revoked',
        'membership_created', 'membership_suspended', 'membership_expired', 'membership_revoked',
        'project_access_granted', 'project_access_revoked',
        'temp_grant_created', 'temp_grant_revoked',
        'account_suspended', 'account_deactivated', 'account_reactivated',
        'account_deletion_requested', 'account_anonymized'
    )),
    old_value TEXT,
    new_value TEXT,
    reason TEXT,
    changed_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- USER COMPLIANCE ACKNOWLEDGMENTS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE user_compliance_acks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    policy_type compliance_policy_type NOT NULL,
    policy_version TEXT NOT NULL,
    policy_title TEXT NOT NULL,
    document_url TEXT,
    acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, policy_type, policy_version)
);

-- ═══════════════════════════════════════════════════════════════
-- DATA RETENTION POLICIES
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE data_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL UNIQUE,
    retention_days INTEGER NOT NULL,
    action_on_expiry retention_action NOT NULL DEFAULT 'anonymize',
    legal_basis TEXT,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- EXTEND ORGANIZATIONS — SSO, security policies
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE organizations
    ADD COLUMN IF NOT EXISTS sso_domain TEXT,
    ADD COLUMN IF NOT EXISTS require_mfa BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS default_role TEXT DEFAULT 'pm' CHECK (default_role IN ('exec', 'pm', 'client', 'vendor')),
    ADD COLUMN IF NOT EXISTS max_sessions_per_user INTEGER DEFAULT 5,
    ADD COLUMN IF NOT EXISTS session_timeout_hours INTEGER DEFAULT 720,
    ADD COLUMN IF NOT EXISTS invitation_expiry_days INTEGER DEFAULT 7,
    ADD COLUMN IF NOT EXISTS enforce_sso BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS allowed_email_domains TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- ═══════════════════════════════════════════════════════════════
-- EXTEND PROJECT MEMBERS — Temporal access + audit
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE project_members
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'expired', 'revoked')),
    ADD COLUMN IF NOT EXISTS granted_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS granted_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;

-- ═══════════════════════════════════════════════════════════════
-- ENABLE RLS
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_step_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE temporary_access_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_change_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_compliance_acks ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

-- User profiles: users can view own profile + org members can view each other
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Org members can view each other" ON user_profiles
    FOR SELECT USING (
        id IN (
            SELECT om2.user_id FROM org_memberships om1
            JOIN org_memberships om2 ON om1.organization_id = om2.organization_id
            WHERE om1.user_id = auth.uid() AND om1.status = 'active' AND om2.status = 'active'
        )
    );

-- Org memberships: users can view own memberships + exec can manage
CREATE POLICY "Users can view own memberships" ON org_memberships
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Org exec can manage memberships" ON org_memberships
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM org_memberships
            WHERE user_id = auth.uid() AND role = 'exec' AND status = 'active'
        )
    );

-- Invitations: org exec/pm can manage
CREATE POLICY "Org admins can manage invitations" ON invitations
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM org_memberships
            WHERE user_id = auth.uid() AND role IN ('exec', 'pm') AND status = 'active'
        )
    );
CREATE POLICY "Invited users can view own invitation" ON invitations
    FOR SELECT USING (email = (SELECT email FROM user_profiles WHERE id = auth.uid()));

-- Onboarding definitions: all authenticated users can read
CREATE POLICY "All users can read onboarding steps" ON onboarding_step_definitions
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Onboarding progress: users can view/update own
CREATE POLICY "Users can manage own onboarding" ON user_onboarding_progress
    FOR ALL USING (user_id = auth.uid());

-- Preferences: users can manage own
CREATE POLICY "Users can manage own preferences" ON user_preferences
    FOR ALL USING (user_id = auth.uid());

-- Login audit log: users can view own + exec can view all in org
CREATE POLICY "Users can view own login history" ON login_audit_log
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Exec can view org login history" ON login_audit_log
    FOR SELECT USING (
        user_id IN (
            SELECT om2.user_id FROM org_memberships om1
            JOIN org_memberships om2 ON om1.organization_id = om2.organization_id
            WHERE om1.user_id = auth.uid() AND om1.role = 'exec' AND om1.status = 'active'
        )
    );

-- Sessions: users can manage own
CREATE POLICY "Users can manage own sessions" ON user_sessions
    FOR ALL USING (user_id = auth.uid());

-- API tokens: users can manage own
CREATE POLICY "Users can manage own tokens" ON api_tokens
    FOR ALL USING (user_id = auth.uid());

-- Temporary access grants: users can view own + exec can manage
CREATE POLICY "Users can view own grants" ON temporary_access_grants
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Exec can manage grants" ON temporary_access_grants
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM org_memberships
            WHERE user_id = auth.uid() AND role = 'exec' AND status = 'active'
        )
    );

-- Role change log: exec can view org history
CREATE POLICY "Exec can view role changes" ON role_change_log
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM org_memberships
            WHERE user_id = auth.uid() AND role = 'exec' AND status = 'active'
        )
    );
CREATE POLICY "Users can view own role changes" ON role_change_log
    FOR SELECT USING (user_id = auth.uid());

-- Compliance acks: users can manage own
CREATE POLICY "Users can manage own compliance" ON user_compliance_acks
    FOR ALL USING (user_id = auth.uid());

-- Retention policies: exec only
CREATE POLICY "Exec can manage retention policies" ON data_retention_policies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM org_memberships
            WHERE user_id = auth.uid() AND role = 'exec' AND status = 'active'
        )
    );

-- ═══════════════════════════════════════════════════════════════
-- UPDATED_AT TRIGGERS
-- ═══════════════════════════════════════════════════════════════
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_org_memberships_updated_at
    BEFORE UPDATE ON org_memberships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invitations_updated_at
    BEFORE UPDATE ON invitations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_onboarding_step_definitions_updated_at
    BEFORE UPDATE ON onboarding_step_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_onboarding_progress_updated_at
    BEFORE UPDATE ON user_onboarding_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_tokens_updated_at
    BEFORE UPDATE ON api_tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_temporary_access_grants_updated_at
    BEFORE UPDATE ON temporary_access_grants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_retention_policies_updated_at
    BEFORE UPDATE ON data_retention_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════
-- ACTIVITY LOG TRIGGERS
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION log_role_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO role_change_log (user_id, organization_id, membership_id, change_type, new_value, changed_by)
        VALUES (NEW.user_id, NEW.organization_id, NEW.id, 'membership_created', NEW.role, NEW.invited_by);
    ELSIF TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role THEN
        INSERT INTO role_change_log (user_id, organization_id, membership_id, change_type, old_value, new_value)
        VALUES (NEW.user_id, NEW.organization_id, NEW.id, 'role_changed', OLD.role, NEW.role);
    ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO role_change_log (user_id, organization_id, membership_id, change_type, old_value, new_value)
        VALUES (NEW.user_id, NEW.organization_id, NEW.id,
            CASE NEW.status
                WHEN 'suspended' THEN 'membership_suspended'
                WHEN 'expired' THEN 'membership_expired'
                WHEN 'revoked' THEN 'membership_revoked'
                ELSE 'role_changed'
            END,
            OLD.status::TEXT, NEW.status::TEXT);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_log_role_change
    AFTER INSERT OR UPDATE ON org_memberships
    FOR EACH ROW EXECUTE FUNCTION log_role_change();

-- Log lifecycle status changes on user_profiles
CREATE OR REPLACE FUNCTION log_lifecycle_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.lifecycle_status IS DISTINCT FROM NEW.lifecycle_status THEN
        INSERT INTO role_change_log (user_id, change_type, old_value, new_value)
        VALUES (NEW.id,
            CASE NEW.lifecycle_status
                WHEN 'suspended' THEN 'account_suspended'
                WHEN 'deactivated' THEN 'account_deactivated'
                WHEN 'active' THEN 'account_reactivated'
                WHEN 'pending_deletion' THEN 'account_deletion_requested'
                WHEN 'anonymized' THEN 'account_anonymized'
                ELSE 'role_changed'
            END,
            OLD.lifecycle_status::TEXT, NEW.lifecycle_status::TEXT);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_log_lifecycle_change
    AFTER UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION log_lifecycle_change();

-- ═══════════════════════════════════════════════════════════════
-- DATA MIGRATION — profiles → user_profiles + org_memberships
-- ═══════════════════════════════════════════════════════════════

-- Migrate existing profiles into user_profiles
INSERT INTO user_profiles (id, email, display_name, avatar_url, lifecycle_status, created_at, updated_at)
SELECT
    p.id,
    p.email,
    p.name,
    p.avatar_url,
    'active'::user_lifecycle_status,
    p.created_at,
    p.updated_at
FROM profiles p
ON CONFLICT (id) DO NOTHING;

-- Create org_memberships from existing profile org associations
INSERT INTO org_memberships (user_id, organization_id, role, status, is_default_org, joined_at, created_at)
SELECT
    p.id,
    p.organization_id,
    p.role,
    'active'::org_membership_status,
    true,
    p.created_at,
    p.created_at
FROM profiles p
WHERE p.organization_id IS NOT NULL
ON CONFLICT (user_id, organization_id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- MULTI-ORG RLS HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- Returns all active org IDs for the current user
CREATE OR REPLACE FUNCTION get_user_org_ids()
RETURNS UUID[] AS $$
    SELECT COALESCE(
        ARRAY(
            SELECT organization_id
            FROM org_memberships
            WHERE user_id = auth.uid()
              AND status = 'active'
              AND (expires_at IS NULL OR expires_at > NOW())
        ),
        '{}'::UUID[]
    )
$$ LANGUAGE SQL SECURITY DEFINER;

-- Returns the user's role in a specific org
CREATE OR REPLACE FUNCTION get_user_role_in_org(org_id UUID)
RETURNS TEXT AS $$
    SELECT role
    FROM org_memberships
    WHERE user_id = auth.uid()
      AND organization_id = org_id
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > NOW())
    LIMIT 1
$$ LANGUAGE SQL SECURITY DEFINER;

-- BACKWARD COMPAT: Update existing get_user_org_id to use new schema
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
    SELECT organization_id
    FROM org_memberships
    WHERE user_id = auth.uid()
      AND status = 'active'
      AND is_default_org = true
      AND (expires_at IS NULL OR expires_at > NOW())
    LIMIT 1
$$ LANGUAGE SQL SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- UPDATE HANDLE_NEW_USER TRIGGER — New user signup
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_org_id UUID;
    matching_org RECORD;
    user_display_name TEXT;
    user_domain TEXT;
    org_found BOOLEAN := false;
BEGIN
    user_display_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
    user_domain := split_part(NEW.email, '@', 2);

    -- Create user_profile
    INSERT INTO user_profiles (id, email, display_name, lifecycle_status)
    VALUES (
        NEW.id,
        NEW.email,
        user_display_name,
        CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN 'onboarding' ELSE 'pending_verification' END
    );

    -- Also create legacy profiles row for backward compatibility
    -- Get or create default organization
    SELECT id INTO default_org_id FROM organizations WHERE slug = 'default' LIMIT 1;
    IF default_org_id IS NULL THEN
        INSERT INTO organizations (name, slug) VALUES ('Default Organization', 'default')
        RETURNING id INTO default_org_id;
    END IF;

    INSERT INTO profiles (id, email, name, organization_id)
    VALUES (NEW.id, NEW.email, user_display_name, default_org_id)
    ON CONFLICT (id) DO NOTHING;

    -- Check for domain-based auto-assignment
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

    -- If no domain match, assign to default org
    IF NOT org_found THEN
        INSERT INTO org_memberships (user_id, organization_id, role, status, is_default_org, joined_at)
        VALUES (NEW.id, default_org_id, 'pm', 'active', true, NOW())
        ON CONFLICT (user_id, organization_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- BACKWARD-COMPATIBLE PROFILES VIEW
-- ═══════════════════════════════════════════════════════════════
-- NOTE: The existing profiles TABLE is preserved for FK integrity.
-- This view provides a read path that merges user_profiles + org_memberships.
-- New code should query user_profiles + org_memberships directly.

CREATE OR REPLACE VIEW user_profiles_with_org AS
SELECT
    up.id,
    up.email,
    up.display_name AS name,
    up.avatar_url,
    COALESCE(om.role, 'pm') AS role,
    om.organization_id,
    up.timezone,
    up.locale,
    up.lifecycle_status,
    up.onboarding_completed_at,
    up.last_active_at,
    up.created_at,
    up.updated_at
FROM user_profiles up
LEFT JOIN org_memberships om
    ON om.user_id = up.id
    AND om.is_default_org = true
    AND om.status = 'active';

-- ═══════════════════════════════════════════════════════════════
-- SEED ONBOARDING STEP DEFINITIONS
-- ═══════════════════════════════════════════════════════════════
INSERT INTO onboarding_step_definitions (role, step_key, title, description, sort_order, is_required, gate_access) VALUES
    ('all', 'email_verification', 'Verify Email Address', 'Confirm your email address to activate your account', 1, true, true),
    ('all', 'terms_acceptance', 'Accept Terms of Service', 'Review and accept the platform terms of service and privacy policy', 2, true, true),
    ('all', 'profile_completion', 'Complete Your Profile', 'Add your display name, timezone, and avatar', 3, true, false),
    ('all', 'notification_setup', 'Configure Notifications', 'Set your notification preferences for email and push', 4, false, false),
    ('exec', 'org_setup', 'Set Up Organization', 'Configure organization name, logo, and settings', 5, true, false),
    ('exec', 'team_invite', 'Invite Team Members', 'Invite your first team members to the platform', 6, false, false),
    ('exec', 'mfa_setup', 'Enable Two-Factor Authentication', 'Secure your account with multi-factor authentication', 7, true, false),
    ('pm', 'project_tour', 'Project Management Tour', 'Learn how to create and manage projects', 5, false, false),
    ('pm', 'team_familiarization', 'Meet Your Team', 'Review team members and their roles', 6, false, false),
    ('client', 'portal_orientation', 'Client Portal Tour', 'Learn how to review deliverables and approve milestones', 5, false, false),
    ('vendor', 'compliance_upload', 'Upload Compliance Documents', 'Upload required COI, W-9, and NDA documents', 5, true, true),
    ('vendor', 'portal_orientation', 'Vendor Portal Tour', 'Learn how to view assignments and submit work', 6, false, false);

-- ═══════════════════════════════════════════════════════════════
-- SEED DEFAULT RETENTION POLICIES
-- ═══════════════════════════════════════════════════════════════
INSERT INTO data_retention_policies (entity_type, retention_days, action_on_expiry, legal_basis, description) VALUES
    ('login_audit_log', 730, 'purge', 'Legitimate interest', 'Authentication event logs retained for 2 years'),
    ('user_sessions', 90, 'purge', 'Legitimate interest', 'Expired sessions purged after 90 days'),
    ('api_tokens', 730, 'purge', 'Security', 'Revoked/expired token metadata retained for 2 years'),
    ('user_pii', 30, 'anonymize', 'GDPR Art. 17', 'PII anonymized 30 days after deletion request'),
    ('role_change_log', -1, 'retain', 'Compliance/audit', 'Permission changes retained indefinitely'),
    ('user_compliance_acks', -1, 'retain', 'Legal obligation', 'Compliance acknowledgments retained indefinitely');

-- ═══════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════
CREATE INDEX idx_user_profiles_lifecycle ON user_profiles(lifecycle_status);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_last_active ON user_profiles(last_active_at);
CREATE INDEX idx_org_memberships_user ON org_memberships(user_id);
CREATE INDEX idx_org_memberships_org ON org_memberships(organization_id);
CREATE INDEX idx_org_memberships_status ON org_memberships(status);
CREATE INDEX idx_org_memberships_default ON org_memberships(user_id, is_default_org) WHERE is_default_org = true;
CREATE INDEX idx_invitations_org ON invitations(organization_id);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_status ON invitations(status);
CREATE INDEX idx_user_onboarding_user ON user_onboarding_progress(user_id);
CREATE INDEX idx_user_preferences_user ON user_preferences(user_id);
CREATE INDEX idx_login_audit_user ON login_audit_log(user_id);
CREATE INDEX idx_login_audit_created ON login_audit_log(created_at);
CREATE INDEX idx_login_audit_event ON login_audit_log(event_type);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_api_tokens_user ON api_tokens(user_id);
CREATE INDEX idx_api_tokens_hash ON api_tokens(token_hash);
CREATE INDEX idx_temp_grants_user ON temporary_access_grants(user_id);
CREATE INDEX idx_temp_grants_expires ON temporary_access_grants(expires_at);
CREATE INDEX idx_role_change_user ON role_change_log(user_id);
CREATE INDEX idx_role_change_org ON role_change_log(organization_id);
CREATE INDEX idx_role_change_created ON role_change_log(created_at);
CREATE INDEX idx_compliance_acks_user ON user_compliance_acks(user_id);
CREATE INDEX idx_orgs_sso_domain ON organizations(sso_domain) WHERE sso_domain IS NOT NULL;
