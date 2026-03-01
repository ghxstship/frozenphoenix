-- Migration 030: Data Retention Policy — FIND-025 Remediation
--
-- Defines retention periods for each data category and provides
-- a purge function callable from a cron job or admin API.
--
-- GDPR Article 5(1)(e): Data shall be kept only as long as necessary.
-- CCPA: Right to deletion must be technically enforceable.

-- ─── Retention policy table ──────────────────────────────────
CREATE TABLE IF NOT EXISTS data_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL UNIQUE,
    retention_days INTEGER NOT NULL DEFAULT 365,
    description TEXT,
    purge_strategy TEXT NOT NULL DEFAULT 'soft_delete'
        CHECK (purge_strategy IN ('soft_delete', 'hard_delete', 'anonymize', 'archive')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Seed default retention policies ─────────────────────────
INSERT INTO data_retention_policies (table_name, retention_days, description, purge_strategy) VALUES
    ('login_audit_log', 90, 'Authentication audit events', 'hard_delete'),
    ('activities', 365, 'User activity feed entries', 'hard_delete'),
    ('automation_logs', 180, 'Workflow automation logs', 'hard_delete'),
    ('notifications', 90, 'User notifications', 'hard_delete'),
    ('field_usage_events', 180, 'Field access telemetry', 'hard_delete'),
    ('user_onboarding_progress', 365, 'Onboarding step progress', 'anonymize'),
    ('settings_change_log', 730, 'Settings audit trail (SOC2)', 'archive'),
    ('access_audit_log', 730, 'Permission check audit trail (SOC2)', 'archive')
ON CONFLICT (table_name) DO NOTHING;

-- ─── Purge function ──────────────────────────────────────────
-- Deletes rows older than the retention period for each active policy.
-- Call via: SELECT purge_expired_data();
CREATE OR REPLACE FUNCTION purge_expired_data()
RETURNS TABLE(table_name TEXT, rows_purged BIGINT) AS $$
DECLARE
    policy RECORD;
    purged BIGINT;
BEGIN
    FOR policy IN
        SELECT p.table_name AS tbl, p.retention_days, p.purge_strategy
        FROM data_retention_policies p
        WHERE p.is_active = true
    LOOP
        purged := 0;
        
        IF policy.purge_strategy = 'hard_delete' THEN
            EXECUTE format(
                'DELETE FROM %I WHERE created_at < now() - interval ''%s days'' RETURNING 1',
                policy.tbl, policy.retention_days
            );
            GET DIAGNOSTICS purged = ROW_COUNT;
        END IF;
        
        -- soft_delete, anonymize, archive strategies can be implemented
        -- per-table as needed. This provides the framework.
        
        table_name := policy.tbl;
        rows_purged := purged;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Right to erasure (GDPR Article 17) ─────────────────────
-- Removes all PII for a specific user across key tables.
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
        metadata = '{}'::jsonb
    WHERE user_id = target_user_id;

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
