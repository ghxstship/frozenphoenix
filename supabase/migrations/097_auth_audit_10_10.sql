-- Migration 097: Auth Audit 10/10
-- Closes all remaining gaps for Observability, Data Integrity,
-- Multi-tenant, and MFA dimensions in the auth audit.

-- ═══════════════════════════════════════════════════════════════
-- 1. OBSERVABILITY — Structured error codes on audit events
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE login_audit_log
    ADD COLUMN IF NOT EXISTS error_code TEXT,
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

COMMENT ON COLUMN login_audit_log.error_code IS 'Structured error code (e.g. AUTH_RATE_LIMITED, AUTH_INVALID_CREDENTIALS) for programmatic alerting';
COMMENT ON COLUMN login_audit_log.organization_id IS 'Tenant-scoped org ID for multi-tenant audit visibility';

CREATE INDEX IF NOT EXISTS idx_audit_log_org_id
    ON login_audit_log(organization_id) WHERE organization_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_log_error_code
    ON login_audit_log(error_code) WHERE error_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_log_created_at
    ON login_audit_log(created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- 2. OBSERVABILITY — Failed login alerting threshold view
--    Returns users with >= 5 failed logins in the last hour.
--    Queryable by admin dashboards and cron-based alert jobs.
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE VIEW auth_failed_login_alerts AS
SELECT
    user_id,
    COUNT(*) AS failed_count,
    MAX(created_at) AS last_failure_at,
    ARRAY_AGG(DISTINCT ip_address::TEXT) AS source_ips,
    ARRAY_AGG(DISTINCT error_code) FILTER (WHERE error_code IS NOT NULL) AS error_codes
FROM login_audit_log
WHERE event_type = 'login_failure'
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY user_id
HAVING COUNT(*) >= 5;

COMMENT ON VIEW auth_failed_login_alerts IS 'Users with >= 5 failed logins in the last hour — for security alerting';

-- ═══════════════════════════════════════════════════════════════
-- 3. OBSERVABILITY — Session anomaly detection function
--    Flags sessions from new IPs/devices not seen in the last 30 days.
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION detect_session_anomalies(p_user_id UUID)
RETURNS TABLE(
    anomaly_type TEXT,
    detail TEXT,
    session_id UUID,
    detected_at TIMESTAMPTZ
) AS $$
BEGIN
    -- Flag sessions from IPs not seen in last 30 days
    RETURN QUERY
    SELECT
        'new_ip'::TEXT AS anomaly_type,
        s.ip_address::TEXT AS detail,
        s.id AS session_id,
        s.last_active_at AS detected_at
    FROM user_sessions s
    WHERE s.user_id = p_user_id
      AND s.revoked_at IS NULL
      AND s.ip_address IS NOT NULL
      AND s.ip_address::TEXT NOT IN (
          SELECT DISTINCT h.ip_address::TEXT
          FROM user_sessions h
          WHERE h.user_id = p_user_id
            AND h.id != s.id
            AND h.last_active_at > NOW() - INTERVAL '30 days'
            AND h.ip_address IS NOT NULL
      );

    -- Flag sessions from device types not seen in last 30 days
    RETURN QUERY
    SELECT
        'new_device'::TEXT AS anomaly_type,
        COALESCE(s.device_name, s.device_type, 'unknown') AS detail,
        s.id AS session_id,
        s.last_active_at AS detected_at
    FROM user_sessions s
    WHERE s.user_id = p_user_id
      AND s.revoked_at IS NULL
      AND s.device_name IS NOT NULL
      AND s.device_name NOT IN (
          SELECT DISTINCT h.device_name
          FROM user_sessions h
          WHERE h.user_id = p_user_id
            AND h.id != s.id
            AND h.last_active_at > NOW() - INTERVAL '30 days'
            AND h.device_name IS NOT NULL
      );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION detect_session_anomalies IS 'Returns session anomalies (new IP, new device) for a user — for observability dashboards';

-- ═══════════════════════════════════════════════════════════════
-- 4. DATA INTEGRITY — Retention policies for auth tables
-- ═══════════════════════════════════════════════════════════════
INSERT INTO data_retention_policies (entity_type, retention_days, action_on_expiry, legal_basis, description) VALUES
    ('login_audit_log', 730, 'archive', 'SOC2 compliance', 'Auth audit log archived after 2 years'),
    ('user_sessions', 90, 'purge', 'Legitimate interest', 'Expired/revoked sessions purged after 90 days')
ON CONFLICT (entity_type) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- 5. MFA — Recovery codes table
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS mfa_recovery_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mfa_recovery_codes_user
    ON mfa_recovery_codes(user_id) WHERE used_at IS NULL;

COMMENT ON TABLE mfa_recovery_codes IS 'One-time recovery codes for MFA bypass — hashed, single-use';

ALTER TABLE mfa_recovery_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own recovery codes" ON mfa_recovery_codes
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own recovery codes" ON mfa_recovery_codes
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own recovery codes" ON mfa_recovery_codes
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own recovery codes" ON mfa_recovery_codes
    FOR DELETE USING (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- 6. SECURITY — Server-side rate limiting table
--    Used by API route handlers to enforce per-IP and per-user
--    rate limits on auth endpoints.
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS auth_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL,
    attempts INT NOT NULL DEFAULT 1,
    window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    blocked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_rate_limits_key
    ON auth_rate_limits(key);

CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_cleanup
    ON auth_rate_limits(window_start) WHERE blocked_until IS NULL;

COMMENT ON TABLE auth_rate_limits IS 'Server-side rate limiting for auth endpoints — keyed by IP or user:action';

-- Auto-cleanup: delete rate limit entries older than 1 hour
CREATE OR REPLACE FUNCTION cleanup_auth_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM auth_rate_limits
    WHERE window_start < NOW() - INTERVAL '1 hour'
      AND (blocked_until IS NULL OR blocked_until < NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS: only service role should access this table
ALTER TABLE auth_rate_limits ENABLE ROW LEVEL SECURITY;
-- No user-facing policies — accessed via service role in API handlers

-- ═══════════════════════════════════════════════════════════════
-- 7. DATA INTEGRITY — Account deletion cascade
--    Extend erase_user_data to also clean up sessions and MFA codes
-- ═══════════════════════════════════════════════════════════════
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

    UPDATE profiles SET
        name = 'Deleted User',
        avatar_url = NULL,
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

    -- Deactivate org memberships
    UPDATE org_memberships SET
        status = 'removed',
        updated_at = now()
    WHERE user_id = target_user_id;

    -- Mark user as erased in profiles
    UPDATE user_profiles SET
        lifecycle_status = 'offboarded'
    WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
