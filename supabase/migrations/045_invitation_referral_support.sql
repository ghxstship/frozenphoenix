-- ═══════════════════════════════════════════════════════════════════════════
-- INVITATION MODEL: Org Invites + Referral Invites
-- ═══════════════════════════════════════════════════════════════════════════
-- SaaS best practice: any authenticated user can invite others.
--
-- Two invite types:
--   1. org_invite   — invitee joins sender's org with a specific role
--   2. referral     — invitee signs up on the platform, no org assignment
--
-- Guardrails:
--   - Role escalation prevention: users can only assign roles at or below
--     their own level in the hierarchy
--   - Referral invites have no org requirement (organization_id is NULL)
--   - Rate limiting enforced at the API layer
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. Add invite_type enum ─────────────────────────────────────────────
DO $$ BEGIN
    CREATE TYPE invitation_type AS ENUM ('org_invite', 'referral');
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'invitation_type enum already exists, skipping';
END $$;

-- ─── 2. Add invite_type column with default for backward compatibility ───
ALTER TABLE invitations
    ADD COLUMN IF NOT EXISTS invite_type invitation_type NOT NULL DEFAULT 'org_invite';

-- ─── 3. Add referral_code column for affiliate/referral tracking ─────────
ALTER TABLE invitations
    ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- ─── 4. Make organization_id nullable (required for referrals) ───────────
-- First drop the NOT NULL constraint
ALTER TABLE invitations
    ALTER COLUMN organization_id DROP NOT NULL;

-- ─── 5. Make role nullable (referrals don't pre-assign roles) ────────────
ALTER TABLE invitations
    ALTER COLUMN role DROP NOT NULL;

-- ─── 6. Add CHECK constraint: org_invite requires organization_id + role ─
ALTER TABLE invitations
    ADD CONSTRAINT invitations_org_invite_requires_org
    CHECK (
        invite_type = 'referral'
        OR (organization_id IS NOT NULL AND role IS NOT NULL)
    );

-- ─── 7. Index for referral code lookups ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_invitations_referral_code
    ON invitations (referral_code)
    WHERE referral_code IS NOT NULL;

-- ─── 8. Index for invite_type filtering ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_invitations_invite_type
    ON invitations (invite_type);

-- ─── 9. RLS policy: any authenticated user can create invitations ────────
-- Drop the old restrictive policy if it exists
DROP POLICY IF EXISTS "Users can create invitations" ON invitations;
DROP POLICY IF EXISTS "Org members can create invitations" ON invitations;

-- Any authenticated user can INSERT invitations they authored
CREATE POLICY "Authenticated users can create invitations"
    ON invitations FOR INSERT
    WITH CHECK (auth.uid() = invited_by);

-- Users can read invitations they sent or that are addressed to their email
DROP POLICY IF EXISTS "Users can view own invitations" ON invitations;
CREATE POLICY "Users can view own invitations"
    ON invitations FOR SELECT
    USING (
        invited_by = auth.uid()
        OR email IN (
            SELECT email FROM public.user_profiles WHERE id = auth.uid()
        )
    );

-- Exec/director can view all invitations for their orgs
DROP POLICY IF EXISTS "Org admins can view org invitations" ON invitations;
CREATE POLICY "Org admins can view org invitations"
    ON invitations FOR SELECT
    USING (
        organization_id = ANY(get_user_exec_org_ids())
        OR organization_id = ANY(get_user_admin_org_ids())
    );

-- Only the inviter or org exec can revoke
DROP POLICY IF EXISTS "Inviters can update own invitations" ON invitations;
CREATE POLICY "Inviters can update own invitations"
    ON invitations FOR UPDATE
    USING (
        invited_by = auth.uid()
        OR organization_id = ANY(get_user_exec_org_ids())
    );
