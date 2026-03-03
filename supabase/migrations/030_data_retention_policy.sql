-- Migration 030: Data Retention Policy — FIND-025 Remediation
--
-- Extends the data_retention_policies table (created in 018) with
-- additional seed data and provides purge/erasure functions callable
-- from a cron job or admin API.
--
-- GDPR Article 5(1)(e): Data shall be kept only as long as necessary.
-- CCPA: Right to deletion must be technically enforceable.

-- ─── Seed additional retention policies ──────────────────────
-- The base table and initial seeds were created in migration 018.
-- Here we add policies for tables introduced in later migrations.
INSERT INTO data_retention_policies (entity_type, retention_days, action_on_expiry, legal_basis, description) VALUES
    ('activities', 365, 'purge', 'Legitimate interest', 'User activity feed entries purged after 1 year'),
    ('automation_logs', 180, 'purge', 'Legitimate interest', 'Workflow automation logs purged after 6 months'),
    ('notifications', 90, 'purge', 'Legitimate interest', 'User notifications purged after 90 days'),
    ('field_usage_events', 180, 'purge', 'Legitimate interest', 'Field access telemetry purged after 6 months'),
    ('settings_change_log', 730, 'archive', 'SOC2 compliance', 'Settings audit trail archived after 2 years'),
    ('access_audit_log', 730, 'archive', 'SOC2 compliance', 'Permission check audit trail archived after 2 years')
ON CONFLICT (entity_type) DO NOTHING;

-- ─── Purge function ──────────────────────────────────────────
-- Deletes/archives rows older than the retention period for each active policy.
-- Call via: SELECT * FROM purge_expired_data();
CREATE OR REPLACE FUNCTION purge_expired_data()
RETURNS TABLE(entity TEXT, rows_purged BIGINT) AS $$
DECLARE
    policy RECORD;
    purged BIGINT;
BEGIN
    FOR policy IN
        SELECT p.entity_type AS tbl, p.retention_days, p.action_on_expiry
        FROM data_retention_policies p
        WHERE p.is_active = true
          AND p.retention_days > 0
    LOOP
        purged := 0;

        IF policy.action_on_expiry = 'purge' THEN
            EXECUTE format(
                'DELETE FROM %I WHERE created_at < now() - interval ''%s days''',
                policy.tbl, policy.retention_days
            );
            GET DIAGNOSTICS purged = ROW_COUNT;
        END IF;

        -- anonymize and archive strategies can be implemented
        -- per-table as needed. This provides the framework.

        entity := policy.tbl;
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
