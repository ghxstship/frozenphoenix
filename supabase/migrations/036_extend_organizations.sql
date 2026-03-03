-- ═══════════════════════════════════════════════════════════════
-- EXTEND ORGANIZATIONS — Add columns used by onboarding + security
-- ═══════════════════════════════════════════════════════════════
-- The POST /api/organizations route and PATCH /api/organizations/[id]/security
-- reference columns that were never added to the organizations table.
-- This migration adds them.

ALTER TABLE organizations
    ADD COLUMN IF NOT EXISTS industry TEXT,
    ADD COLUMN IF NOT EXISTS default_timezone TEXT NOT NULL DEFAULT 'America/New_York',
    ADD COLUMN IF NOT EXISTS default_currency TEXT NOT NULL DEFAULT 'USD',
    ADD COLUMN IF NOT EXISTS require_mfa BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS enforce_sso BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS sso_domain TEXT,
    ADD COLUMN IF NOT EXISTS allowed_email_domains TEXT[],
    ADD COLUMN IF NOT EXISTS session_timeout_hours INTEGER NOT NULL DEFAULT 24,
    ADD COLUMN IF NOT EXISTS max_sessions_per_user INTEGER NOT NULL DEFAULT 5,
    ADD COLUMN IF NOT EXISTS invitation_expiry_days INTEGER NOT NULL DEFAULT 7,
    ADD COLUMN IF NOT EXISTS default_role TEXT NOT NULL DEFAULT 'pm'
        CHECK (default_role IN ('exec', 'pm', 'client', 'vendor'));

-- ═══════════════════════════════════════════════════════════════
-- RLS — Allow authenticated users to create organizations
-- ═══════════════════════════════════════════════════════════════
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'organizations' AND policyname = 'Authenticated users can create organizations'
    ) THEN
        CREATE POLICY "Authenticated users can create organizations"
            ON organizations FOR INSERT
            TO authenticated
            WITH CHECK (true);
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- RLS — Allow authenticated users to bootstrap their own membership
-- (insert only where user_id = auth.uid())
-- ═══════════════════════════════════════════════════════════════
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'org_memberships' AND policyname = 'Users can create own membership'
    ) THEN
        CREATE POLICY "Users can create own membership"
            ON org_memberships FOR INSERT
            TO authenticated
            WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- RLS — Allow execs to update their own organization
-- ═══════════════════════════════════════════════════════════════
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'organizations' AND policyname = 'Exec members can update organization'
    ) THEN
        CREATE POLICY "Exec members can update organization"
            ON organizations FOR UPDATE
            TO authenticated
            USING (id IN (
                SELECT organization_id FROM org_memberships
                WHERE user_id = auth.uid() AND role = 'exec' AND status = 'active'
            ))
            WITH CHECK (id IN (
                SELECT organization_id FROM org_memberships
                WHERE user_id = auth.uid() AND role = 'exec' AND status = 'active'
            ));
    END IF;
END $$;
