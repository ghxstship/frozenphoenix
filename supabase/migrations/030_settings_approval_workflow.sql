-- Migration 030: Settings Change Approval Workflow
-- High-risk settings changes require exec approval before taking effect.
-- Implements a pending → approved/rejected lifecycle for sensitive settings.

-- ─── Approval status enum ────────────────────────────────────────
DO $$ BEGIN
    CREATE TYPE settings_approval_status AS ENUM (
        'pending', 'approved', 'rejected', 'expired', 'cancelled'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Settings change requests table ─────────────────────────────
CREATE TABLE IF NOT EXISTS settings_change_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    setting_key     TEXT NOT NULL,
    scope_type      TEXT NOT NULL DEFAULT 'organization',
    scope_id        UUID,
    current_value   JSONB,
    proposed_value  JSONB NOT NULL,
    reason          TEXT,
    status          settings_approval_status NOT NULL DEFAULT 'pending',
    requested_by    UUID NOT NULL REFERENCES auth.users(id),
    reviewed_by     UUID REFERENCES auth.users(id),
    review_comment  TEXT,
    requested_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at     TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Indexes ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_scr_org ON settings_change_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_scr_status ON settings_change_requests(status);
CREATE INDEX IF NOT EXISTS idx_scr_requested_by ON settings_change_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_scr_expires ON settings_change_requests(expires_at) WHERE status = 'pending';

-- ─── Auto-update updated_at ──────────────────────────────────────
CREATE OR REPLACE FUNCTION update_scr_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_scr_updated_at ON settings_change_requests;
CREATE TRIGGER trg_scr_updated_at
    BEFORE UPDATE ON settings_change_requests
    FOR EACH ROW EXECUTE FUNCTION update_scr_updated_at();

-- ─── Auto-expire pending requests ────────────────────────────────
CREATE OR REPLACE FUNCTION expire_stale_change_requests()
RETURNS void AS $$
BEGIN
    UPDATE settings_change_requests
    SET status = 'expired', updated_at = now()
    WHERE status = 'pending' AND expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── High-risk settings definition ──────────────────────────────
-- Mark setting_definitions that require approval before changes take effect.
-- Only add column if the table exists (created in migration 026).
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'setting_definitions'
    ) THEN
        -- Add requires_approval column if not present
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'setting_definitions'
              AND column_name = 'requires_approval'
        ) THEN
            ALTER TABLE setting_definitions
                ADD COLUMN requires_approval BOOLEAN NOT NULL DEFAULT false;
        END IF;

        -- Mark high-risk settings as requiring approval
        UPDATE setting_definitions
        SET requires_approval = true
        WHERE key IN (
            'mfa_required',
            'sso_enforced',
            'data_retention_days',
            'session_timeout_minutes',
            'max_sessions_per_user',
            'audit_log_retention_days',
            'ip_allowlist_enabled',
            'password_min_length',
            'allowed_email_domains'
        );
    END IF;
END $$;

-- ─── RLS ─────────────────────────────────────────────────────────
ALTER TABLE settings_change_requests ENABLE ROW LEVEL SECURITY;

-- Members of the org can view change requests
CREATE POLICY scr_select ON settings_change_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM org_memberships
            WHERE org_memberships.user_id = auth.uid()
              AND org_memberships.organization_id = settings_change_requests.organization_id
              AND org_memberships.status = 'active'
        )
    );

-- Any authenticated org member can create a request
CREATE POLICY scr_insert ON settings_change_requests
    FOR INSERT WITH CHECK (
        requested_by = auth.uid()
        AND EXISTS (
            SELECT 1 FROM org_memberships
            WHERE org_memberships.user_id = auth.uid()
              AND org_memberships.organization_id = settings_change_requests.organization_id
              AND org_memberships.status = 'active'
        )
    );

-- Only exec can approve/reject (update)
CREATE POLICY scr_update ON settings_change_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM org_memberships
            WHERE org_memberships.user_id = auth.uid()
              AND org_memberships.organization_id = settings_change_requests.organization_id
              AND org_memberships.role = 'exec'
              AND org_memberships.status = 'active'
        )
    );

-- Requester can cancel their own pending request
CREATE POLICY scr_delete ON settings_change_requests
    FOR DELETE USING (
        requested_by = auth.uid()
        AND status = 'pending'
    );
