-- ═══════════════════════════════════════════════════════════════════════════
-- HARBOR MASTER — Invitation, Join & Access Gate Validation Protocol
-- Migration 116: Full membership lifecycle schema
--
-- Implements:
--   • RBAC hierarchy_level + permission flags on roles
--   • Organization & project access-gate columns
--   • org_memberships: joined_via, approved_by, pending_approval status
--   • invitations: project_id scope + invited_email alias
--   • invite_codes table (new)
--   • invite_code_redemptions table (new)
--   • join_requests table (new)
--   • RLS policies per HARBOR-MASTER spec §5
--   • Notification triggers for all state transitions (§8)
--   • Domain-match auto-join upgrade to handle_new_user() (Flow C)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── SECTION 1: EXTEND roles TABLE ───────────────────────────────────────

ALTER TABLE public.roles
    ADD COLUMN IF NOT EXISTS hierarchy_level INTEGER,
    ADD COLUMN IF NOT EXISTS scope TEXT CHECK (scope IN ('organization', 'project', 'both')),
    ADD COLUMN IF NOT EXISTS can_invite BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS can_approve_requests BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS can_generate_invite_codes BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS can_bulk_invite BOOLEAN NOT NULL DEFAULT false;

-- Seed hierarchy levels and permission flags for all existing system roles
-- (org-scoped roles seeded in mig 106 for every org — update by slug)
UPDATE public.roles SET
    hierarchy_level            = 1,
    scope                      = 'both',
    can_invite                 = true,
    can_approve_requests       = true,
    can_generate_invite_codes  = true,
    can_bulk_invite            = true
WHERE slug = 'exec';

UPDATE public.roles SET
    hierarchy_level            = 2,
    scope                      = 'both',
    can_invite                 = true,
    can_approve_requests       = true,
    can_generate_invite_codes  = true,
    can_bulk_invite            = true
WHERE slug = 'director';

UPDATE public.roles SET
    hierarchy_level            = 3,
    scope                      = 'both',
    can_invite                 = true,
    can_approve_requests       = true,
    can_generate_invite_codes  = true,
    can_bulk_invite            = false
WHERE slug = 'pm';

UPDATE public.roles SET
    hierarchy_level            = 4,
    scope                      = 'both',
    can_invite                 = false,
    can_approve_requests       = false,
    can_generate_invite_codes  = false,
    can_bulk_invite            = false
WHERE slug = 'member';

UPDATE public.roles SET
    hierarchy_level            = 5,
    scope                      = 'both',
    can_invite                 = false,
    can_approve_requests       = false,
    can_generate_invite_codes  = false,
    can_bulk_invite            = false
WHERE slug = 'client';

UPDATE public.roles SET
    hierarchy_level            = 6,
    scope                      = 'both',
    can_invite                 = false,
    can_approve_requests       = false,
    can_generate_invite_codes  = false,
    can_bulk_invite            = false
WHERE slug = 'collaborator';

-- Default hierarchy for any unknown slugs
UPDATE public.roles SET
    hierarchy_level = 7,
    scope           = 'both'
WHERE hierarchy_level IS NULL;

-- ─── SECTION 2: EXTEND organizations TABLE ───────────────────────────────

ALTER TABLE public.organizations
    ADD COLUMN IF NOT EXISTS require_domain_match    BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS require_admin_approval  BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS invite_code_enabled     BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS default_member_role_id  UUID REFERENCES public.roles(id) ON DELETE SET NULL;

-- ─── SECTION 3: EXTEND projects TABLE ────────────────────────────────────

ALTER TABLE public.projects
    ADD COLUMN IF NOT EXISTS require_admin_approval BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS invite_code_enabled    BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS default_member_role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL;

-- ─── SECTION 4: EXTEND org_memberships TABLE ─────────────────────────────

-- Add joined_via audit column, approved_by, project_id, role_id FK
ALTER TABLE public.org_memberships
    ADD COLUMN IF NOT EXISTS role_id     UUID REFERENCES public.roles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS joined_via TEXT CHECK (
        joined_via IN ('direct_invite', 'invite_code', 'domain_match', 'manual_add', 'join_request')
    ),
    ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS joined_at   TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS project_id  UUID REFERENCES public.projects(id) ON DELETE CASCADE;

-- Extend status check to include pending_approval
-- Drop old CHECK, recreate with new values
ALTER TABLE public.org_memberships
    DROP CONSTRAINT IF EXISTS org_memberships_status_check;

ALTER TABLE public.org_memberships
    ADD CONSTRAINT org_memberships_status_check
    CHECK (status::TEXT IN ('invited', 'active', 'suspended', 'expired', 'revoked', 'pending_approval'));

-- Partial unique indexes for HARBOR-MASTER uniqueness constraints
-- One org membership per user (where no project scope)
CREATE UNIQUE INDEX IF NOT EXISTS uq_org_memberships_user_org
    ON public.org_memberships (user_id, organization_id)
    WHERE project_id IS NULL;

-- One project membership per user per project
CREATE UNIQUE INDEX IF NOT EXISTS uq_org_memberships_user_project
    ON public.org_memberships (user_id, project_id)
    WHERE project_id IS NOT NULL;

-- ─── SECTION 5: EXTEND invitations TABLE ─────────────────────────────────

-- Add project_id for project-scoped invitations
ALTER TABLE public.invitations
    ADD COLUMN IF NOT EXISTS project_id    UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS invited_email TEXT;  -- canonical alias; populated via trigger below

-- Backfill invited_email from email column for existing rows
UPDATE public.invitations
SET invited_email = email
WHERE invited_email IS NULL AND email IS NOT NULL;

-- Trigger to keep invited_email in sync with email on INSERT/UPDATE
CREATE OR REPLACE FUNCTION public.sync_invited_email()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invited_email IS NULL THEN
        NEW.invited_email := NEW.email;
    END IF;
    IF NEW.email IS NULL AND NEW.invited_email IS NOT NULL THEN
        NEW.email := NEW.invited_email;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_invited_email ON public.invitations;
CREATE TRIGGER trg_sync_invited_email
    BEFORE INSERT OR UPDATE ON public.invitations
    FOR EACH ROW EXECUTE FUNCTION public.sync_invited_email();

-- Partial unique index: no duplicate pending invites to same email+scope
CREATE UNIQUE INDEX IF NOT EXISTS uq_invitations_pending_email_org
    ON public.invitations (LOWER(email), organization_id)
    WHERE status = 'pending' AND project_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_invitations_pending_email_project
    ON public.invitations (LOWER(email), organization_id, project_id)
    WHERE status = 'pending' AND project_id IS NOT NULL;

-- ─── SECTION 6: CREATE invite_codes TABLE ────────────────────────────────

CREATE TABLE IF NOT EXISTS public.invite_codes (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    code            TEXT         UNIQUE NOT NULL,
    organization_id UUID         NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id      UUID         REFERENCES public.projects(id) ON DELETE CASCADE,
    role_id         UUID         NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
    created_by      UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    max_uses        INTEGER,                          -- NULL = unlimited
    current_uses    INTEGER      NOT NULL DEFAULT 0,
    is_active       BOOLEAN      NOT NULL DEFAULT true,
    requires_approval BOOLEAN    NOT NULL DEFAULT false,
    expires_at      TIMESTAMPTZ,                      -- NULL = no expiry
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invite_codes_org      ON public.invite_codes(organization_id);
CREATE INDEX IF NOT EXISTS idx_invite_codes_project  ON public.invite_codes(project_id);
CREATE INDEX IF NOT EXISTS idx_invite_codes_code     ON public.invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_active   ON public.invite_codes(is_active, expires_at);

ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- ─── SECTION 7: CREATE invite_code_redemptions TABLE ─────────────────────

CREATE TABLE IF NOT EXISTS public.invite_code_redemptions (
    id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    invite_code_id           UUID        NOT NULL REFERENCES public.invite_codes(id) ON DELETE CASCADE,
    user_id                  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    redeemed_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    resulted_in_membership_id UUID       REFERENCES public.org_memberships(id) ON DELETE SET NULL,
    UNIQUE(invite_code_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_invite_code_redemptions_code ON public.invite_code_redemptions(invite_code_id);
CREATE INDEX IF NOT EXISTS idx_invite_code_redemptions_user ON public.invite_code_redemptions(user_id);

ALTER TABLE public.invite_code_redemptions ENABLE ROW LEVEL SECURITY;

-- ─── SECTION 8: CREATE join_requests TABLE ───────────────────────────────

CREATE TABLE IF NOT EXISTS public.join_requests (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID         NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id      UUID         REFERENCES public.projects(id) ON DELETE CASCADE,
    status          TEXT         NOT NULL DEFAULT 'pending'
                                 CHECK (status IN ('pending', 'approved', 'denied')),
    requested_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    reviewed_by     UUID         REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at     TIMESTAMPTZ,
    deny_reason     TEXT
);

-- Unique partial index replaces UNIQUE NULLS NOT DISTINCT (requires PG 15)
CREATE UNIQUE INDEX IF NOT EXISTS uq_join_requests_pending_no_project
    ON public.join_requests (user_id, organization_id)
    WHERE project_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_join_requests_pending_with_project
    ON public.join_requests (user_id, organization_id, project_id)
    WHERE project_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_join_requests_org    ON public.join_requests(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_join_requests_user   ON public.join_requests(user_id, status);
CREATE INDEX IF NOT EXISTS idx_join_requests_project ON public.join_requests(project_id);

ALTER TABLE public.join_requests ENABLE ROW LEVEL SECURITY;

-- ─── SECTION 9: RLS POLICIES ─────────────────────────────────────────────

-- 9.1 invitations RLS ---------------------------------------------------------

DROP POLICY IF EXISTS "invitations_select_sent"       ON public.invitations;
DROP POLICY IF EXISTS "invitations_select_received"   ON public.invitations;
DROP POLICY IF EXISTS "invitations_insert"            ON public.invitations;
DROP POLICY IF EXISTS "invitations_update_recipient"  ON public.invitations;

-- Users can view invitations they sent
CREATE POLICY "invitations_select_sent"
    ON public.invitations FOR SELECT
    USING (invited_by = auth.uid());

-- Users can view invitations addressed to their email
CREATE POLICY "invitations_select_received"
    ON public.invitations FOR SELECT
    USING (
        LOWER(COALESCE(invited_email, email)) = LOWER(
            (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- Only members whose role has can_invite = true can insert
CREATE POLICY "invitations_insert"
    ON public.invitations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.org_memberships m
            JOIN public.roles r ON m.role_id = r.id
            WHERE m.user_id = auth.uid()
              AND m.organization_id = public.invitations.organization_id
              AND m.status = 'active'
              AND r.can_invite = true
        )
        -- Fallback: allow if user has exec/director/pm role (text-based, existing system)
        OR EXISTS (
            SELECT 1
            FROM public.org_memberships m
            WHERE m.user_id = auth.uid()
              AND m.organization_id = public.invitations.organization_id
              AND m.status = 'active'
              AND m.role IN ('exec', 'director', 'pm')
        )
    );

-- Invitees can update their own invitation (accept/decline)
CREATE POLICY "invitations_update_recipient"
    ON public.invitations FOR UPDATE
    USING (
        LOWER(COALESCE(invited_email, email)) = LOWER(
            (SELECT email FROM auth.users WHERE id = auth.uid())
        )
        AND status = 'pending'
    );

-- Inviters can revoke/update their sent invitations
CREATE POLICY "invitations_update_sender"
    ON public.invitations FOR UPDATE
    USING (invited_by = auth.uid());

-- 9.2 invite_codes RLS --------------------------------------------------------

-- Members with code generation permission can view codes in their org
CREATE POLICY "invite_codes_select"
    ON public.invite_codes FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.org_memberships m
            JOIN public.roles r ON m.role_id = r.id
            WHERE m.user_id = auth.uid()
              AND m.organization_id = invite_codes.organization_id
              AND m.status = 'active'
              AND r.can_generate_invite_codes = true
        )
        OR EXISTS (
            SELECT 1
            FROM public.org_memberships m
            WHERE m.user_id = auth.uid()
              AND m.organization_id = invite_codes.organization_id
              AND m.status = 'active'
              AND m.role IN ('exec', 'director', 'pm')
        )
    );

-- Authenticated users can view a specific code by its code string (for redemption lookup)
CREATE POLICY "invite_codes_select_by_code"
    ON public.invite_codes FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Members with code generation permission can insert
CREATE POLICY "invite_codes_insert"
    ON public.invite_codes FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.org_memberships m
            JOIN public.roles r ON m.role_id = r.id
            WHERE m.user_id = auth.uid()
              AND m.organization_id = invite_codes.organization_id
              AND m.status = 'active'
              AND r.can_generate_invite_codes = true
        )
        OR EXISTS (
            SELECT 1
            FROM public.org_memberships m
            WHERE m.user_id = auth.uid()
              AND m.organization_id = invite_codes.organization_id
              AND m.status = 'active'
              AND m.role IN ('exec', 'director', 'pm')
        )
    );

-- Code creator or approvers can deactivate
CREATE POLICY "invite_codes_update"
    ON public.invite_codes FOR UPDATE
    USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1
            FROM public.org_memberships m
            JOIN public.roles r ON m.role_id = r.id
            WHERE m.user_id = auth.uid()
              AND m.organization_id = invite_codes.organization_id
              AND m.status = 'active'
              AND r.can_approve_requests = true
        )
        OR EXISTS (
            SELECT 1
            FROM public.org_memberships m
            WHERE m.user_id = auth.uid()
              AND m.organization_id = invite_codes.organization_id
              AND m.status = 'active'
              AND m.role IN ('exec', 'director', 'pm')
        )
    );

-- 9.3 invite_code_redemptions RLS ---------------------------------------------

-- Users can see their own redemptions
CREATE POLICY "invite_code_redemptions_select_own"
    ON public.invite_code_redemptions FOR SELECT
    USING (user_id = auth.uid());

-- Code creators / org approvers can see redemptions for their codes
CREATE POLICY "invite_code_redemptions_select_admin"
    ON public.invite_code_redemptions FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.invite_codes ic
            JOIN public.org_memberships m ON m.organization_id = ic.organization_id
            WHERE ic.id = invite_code_redemptions.invite_code_id
              AND (ic.created_by = auth.uid() OR (m.user_id = auth.uid() AND m.role IN ('exec', 'director', 'pm')))
        )
    );

-- Authenticated users can insert their own redemption
CREATE POLICY "invite_code_redemptions_insert"
    ON public.invite_code_redemptions FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- 9.4 join_requests RLS -------------------------------------------------------

-- Users can view their own requests
CREATE POLICY "join_requests_select_own"
    ON public.join_requests FOR SELECT
    USING (user_id = auth.uid());

-- Approvers can view requests for their org/project
CREATE POLICY "join_requests_select_approver"
    ON public.join_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.org_memberships m
            JOIN public.roles r ON m.role_id = r.id
            WHERE m.user_id = auth.uid()
              AND m.organization_id = join_requests.organization_id
              AND m.status = 'active'
              AND r.can_approve_requests = true
        )
        OR EXISTS (
            SELECT 1
            FROM public.org_memberships m
            WHERE m.user_id = auth.uid()
              AND m.organization_id = join_requests.organization_id
              AND m.status = 'active'
              AND m.role IN ('exec', 'director', 'pm')
        )
    );

-- Any authenticated user can create a join request
CREATE POLICY "join_requests_insert"
    ON public.join_requests FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Approvers can update (approve/deny)
CREATE POLICY "join_requests_update_approver"
    ON public.join_requests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM public.org_memberships m
            JOIN public.roles r ON m.role_id = r.id
            WHERE m.user_id = auth.uid()
              AND m.organization_id = join_requests.organization_id
              AND m.status = 'active'
              AND r.can_approve_requests = true
        )
        OR EXISTS (
            SELECT 1
            FROM public.org_memberships m
            WHERE m.user_id = auth.uid()
              AND m.organization_id = join_requests.organization_id
              AND m.status = 'active'
              AND m.role IN ('exec', 'director', 'pm')
        )
    );

-- 9.5 org_memberships additional RLS ------------------------------------------

-- Members can view other active members in their org (peer visibility)
DROP POLICY IF EXISTS "memberships_select_peers" ON public.org_memberships;
CREATE POLICY "memberships_select_peers"
    ON public.org_memberships FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.org_memberships m
            WHERE m.user_id = auth.uid()
              AND m.organization_id = org_memberships.organization_id
              AND m.status = 'active'
        )
    );

-- ─── SECTION 10: HELPER FUNCTIONS ────────────────────────────────────────

-- Check if a user has can_invite permission in a given org
CREATE OR REPLACE FUNCTION public.user_can_invite_in_org(p_org_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.org_memberships m
        JOIN public.roles r ON m.role_id = r.id
        WHERE m.user_id = auth.uid()
          AND m.organization_id = p_org_id
          AND m.status = 'active'
          AND r.can_invite = true
    )
    OR EXISTS (
        SELECT 1
        FROM public.org_memberships m
        WHERE m.user_id = auth.uid()
          AND m.organization_id = p_org_id
          AND m.status = 'active'
          AND m.role IN ('exec', 'director', 'pm')
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if a user has can_approve_requests permission in a given org
CREATE OR REPLACE FUNCTION public.user_can_approve_in_org(p_org_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.org_memberships m
        JOIN public.roles r ON m.role_id = r.id
        WHERE m.user_id = auth.uid()
          AND m.organization_id = p_org_id
          AND m.status = 'active'
          AND r.can_approve_requests = true
    )
    OR EXISTS (
        SELECT 1
        FROM public.org_memberships m
        WHERE m.user_id = auth.uid()
          AND m.organization_id = p_org_id
          AND m.status = 'active'
          AND m.role IN ('exec', 'director', 'pm')
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get hierarchy_level for the caller's role in a given org
CREATE OR REPLACE FUNCTION public.get_user_hierarchy_level_in_org(p_org_id UUID)
RETURNS INTEGER AS $$
    SELECT COALESCE(
        -- Role-table hierarchy_level (canonical)
        (SELECT r.hierarchy_level
         FROM public.org_memberships m
         JOIN public.roles r ON m.role_id = r.id
         WHERE m.user_id = auth.uid()
           AND m.organization_id = p_org_id
           AND m.status = 'active'
         LIMIT 1),
        -- Fallback: text-role hierarchy (legacy org_memberships.role column)
        (SELECT CASE m.role
                    WHEN 'exec'         THEN 1
                    WHEN 'director'     THEN 2
                    WHEN 'pm'           THEN 3
                    WHEN 'member'       THEN 4
                    WHEN 'client'       THEN 5
                    WHEN 'collaborator' THEN 6
                    ELSE 7
                END
         FROM public.org_memberships m
         WHERE m.user_id = auth.uid()
           AND m.organization_id = p_org_id
           AND m.status = 'active'
         LIMIT 1),
        99  -- Unknown / not a member = lowest power
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── SECTION 11: NOTIFICATION TRIGGERS ───────────────────────────────────
-- Every state transition fires a notifications row for the relevant user.
-- Channel: in-app (type column) — email delivery handled at application layer.

-- notifications table exists from migration 001 but references profiles(id).
-- Alter the FK to also allow auth.users references via a compatibility shim.
-- We add a new column for auth user targeting to avoid breaking the existing column.

ALTER TABLE public.notifications
    ADD COLUMN IF NOT EXISTS target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 11.1 Invitation sent → notify invitee
CREATE OR REPLACE FUNCTION public.notify_invitation_sent()
RETURNS TRIGGER AS $$
DECLARE
    invitee_user_id UUID;
BEGIN
    -- Resolve invitee user_id from email if they already have an account
    SELECT id INTO invitee_user_id
    FROM auth.users
    WHERE LOWER(email) = LOWER(COALESCE(NEW.invited_email, NEW.email))
    LIMIT 1;

    IF invitee_user_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, target_user_id, title, message, type, action_url)
        VALUES (
            invitee_user_id,
            invitee_user_id,
            'You have been invited',
            'You have been invited to join an organization. Click to accept.',
            'info',
            '/invite/' || NEW.token
        )
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_invitation_sent ON public.invitations;
CREATE TRIGGER trg_notify_invitation_sent
    AFTER INSERT ON public.invitations
    FOR EACH ROW WHEN (NEW.status = 'pending')
    EXECUTE FUNCTION public.notify_invitation_sent();

-- 11.2 Invitation accepted → notify inviter
CREATE OR REPLACE FUNCTION public.notify_invitation_accepted()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'pending' AND NEW.status = 'accepted' THEN
        INSERT INTO public.notifications (user_id, target_user_id, title, message, type)
        VALUES (
            NEW.invited_by,
            NEW.invited_by,
            'Invitation accepted',
            'Your invitation has been accepted.',
            'success'
        )
        ON CONFLICT DO NOTHING;
    END IF;

    IF OLD.status = 'pending' AND NEW.status = 'expired' THEN
        INSERT INTO public.notifications (user_id, target_user_id, title, message, type)
        VALUES (
            NEW.invited_by,
            NEW.invited_by,
            'Invitation expired',
            'An invitation you sent has expired.',
            'warning'
        )
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_invitation_updated ON public.invitations;
CREATE TRIGGER trg_notify_invitation_updated
    AFTER UPDATE ON public.invitations
    FOR EACH ROW EXECUTE FUNCTION public.notify_invitation_accepted();

-- 11.3 Join request submitted → notify all approvers in the org
CREATE OR REPLACE FUNCTION public.notify_join_request_submitted()
RETURNS TRIGGER AS $$
DECLARE
    approver RECORD;
    org_name TEXT;
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
        SELECT name INTO org_name FROM public.organizations WHERE id = NEW.organization_id;

        -- Notify all active approvers (exec, director, pm) in the org
        FOR approver IN
            SELECT DISTINCT m.user_id
            FROM public.org_memberships m
            WHERE m.organization_id = NEW.organization_id
              AND m.status = 'active'
              AND m.role IN ('exec', 'director', 'pm')
        LOOP
            INSERT INTO public.notifications (user_id, target_user_id, title, message, type, action_url)
            VALUES (
                approver.user_id,
                approver.user_id,
                'New join request',
                'A user has requested to join ' || COALESCE(org_name, 'your organization') || '.',
                'info',
                '/settings/join-requests'
            )
            ON CONFLICT DO NOTHING;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_join_request_submitted ON public.join_requests;
CREATE TRIGGER trg_notify_join_request_submitted
    AFTER INSERT ON public.join_requests
    FOR EACH ROW EXECUTE FUNCTION public.notify_join_request_submitted();

-- 11.4 Join request reviewed → notify requester
CREATE OR REPLACE FUNCTION public.notify_join_request_reviewed()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'pending' AND NEW.status = 'approved' THEN
        INSERT INTO public.notifications (user_id, target_user_id, title, message, type)
        VALUES (
            NEW.user_id,
            NEW.user_id,
            'Join request approved',
            'Your request to join has been approved. Welcome!',
            'success'
        )
        ON CONFLICT DO NOTHING;
    END IF;

    IF OLD.status = 'pending' AND NEW.status = 'denied' THEN
        INSERT INTO public.notifications (user_id, target_user_id, title, message, type)
        VALUES (
            NEW.user_id,
            NEW.user_id,
            'Join request denied',
            COALESCE('Your request was denied: ' || NEW.deny_reason, 'Your join request has been denied.'),
            'error'
        )
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_join_request_reviewed ON public.join_requests;
CREATE TRIGGER trg_notify_join_request_reviewed
    AFTER UPDATE ON public.join_requests
    FOR EACH ROW EXECUTE FUNCTION public.notify_join_request_reviewed();

-- 11.5 Invite code redeemed → notify code creator
CREATE OR REPLACE FUNCTION public.notify_invite_code_redeemed()
RETURNS TRIGGER AS $$
DECLARE
    code_creator UUID;
    code_str TEXT;
    max_u INTEGER;
    current_u INTEGER;
BEGIN
    SELECT created_by, code, max_uses, current_uses
    INTO code_creator, code_str, max_u, current_u
    FROM public.invite_codes
    WHERE id = NEW.invite_code_id;

    IF code_creator IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, target_user_id, title, message, type)
        VALUES (
            code_creator,
            code_creator,
            'Invite code redeemed',
            'Your invite code ' || code_str || ' was redeemed.',
            'info'
        )
        ON CONFLICT DO NOTHING;

        -- Notify if depleted
        IF max_u IS NOT NULL AND (current_u + 1) >= max_u THEN
            INSERT INTO public.notifications (user_id, target_user_id, title, message, type)
            VALUES (
                code_creator,
                code_creator,
                'Invite code depleted',
                'Invite code ' || code_str || ' has reached its maximum uses.',
                'warning'
            )
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_invite_code_redeemed ON public.invite_code_redemptions;
CREATE TRIGGER trg_notify_invite_code_redeemed
    AFTER INSERT ON public.invite_code_redemptions
    FOR EACH ROW EXECUTE FUNCTION public.notify_invite_code_redeemed();

-- ─── SECTION 12: DOMAIN AUTO-JOIN (Flow C) ───────────────────────────────
-- Upgrade handle_new_user() to check require_domain_match + allowed_email_domains
-- Creates membership or join_request based on require_admin_approval

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_org_id   UUID;
    user_display_name TEXT;
    user_domain      TEXT;
    matching_org     RECORD;
    org_found        BOOLEAN := false;
    member_role_id   UUID;
BEGIN
    user_display_name := COALESCE(
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );
    user_domain := LOWER(split_part(NEW.email, '@', 2));

    -- Create user_profile
    INSERT INTO public.user_profiles (id, email, display_name, lifecycle_status)
    VALUES (
        NEW.id,
        NEW.email,
        user_display_name,
        CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN 'onboarding' ELSE 'pending_verification' END
    )
    ON CONFLICT (id) DO NOTHING;

    -- Legacy profiles row for backward compatibility
    SELECT id INTO default_org_id FROM public.organizations WHERE slug = 'default' LIMIT 1;
    IF default_org_id IS NULL THEN
        INSERT INTO public.organizations (name, slug) VALUES ('Default Organization', 'default')
        RETURNING id INTO default_org_id;
    END IF;

    INSERT INTO public.profiles (id, email, name, organization_id)
    VALUES (NEW.id, NEW.email, user_display_name, default_org_id)
    ON CONFLICT (id) DO NOTHING;

    -- ── Flow C: Domain-matched auto-join ──────────────────────────────────
    FOR matching_org IN
        SELECT o.id, o.default_role, o.require_admin_approval, o.require_domain_match,
               o.default_member_role_id
        FROM public.organizations o
        WHERE o.require_domain_match = true
          AND o.allowed_email_domains IS NOT NULL
          AND LOWER(user_domain) = ANY(o.allowed_email_domains)
    LOOP
        -- Resolve member role id for text-based role
        SELECT id INTO member_role_id
        FROM public.roles
        WHERE organization_id = matching_org.id
          AND slug = COALESCE(matching_org.default_role, 'member')
        LIMIT 1;

        IF matching_org.require_admin_approval = false THEN
            -- Auto-create membership immediately
            INSERT INTO public.org_memberships (
                user_id, organization_id, role, role_id, status,
                is_default_org, joined_at, joined_via
            )
            VALUES (
                NEW.id, matching_org.id,
                COALESCE(matching_org.default_role, 'member'),
                member_role_id,
                'active', true, NOW(), 'domain_match'
            )
            ON CONFLICT DO NOTHING;
        ELSE
            -- Create pending join request
            INSERT INTO public.join_requests (user_id, organization_id, status, requested_at)
            VALUES (NEW.id, matching_org.id, 'pending', NOW())
            ON CONFLICT DO NOTHING;
        END IF;

        org_found := true;
    END LOOP;

    -- ── Legacy: SSO domain matching (sso_domain column) ───────────────────
    IF NOT org_found THEN
        FOR matching_org IN
            SELECT id, default_role
            FROM public.organizations
            WHERE sso_domain = user_domain
              AND sso_domain IS NOT NULL
        LOOP
            INSERT INTO public.org_memberships (
                user_id, organization_id, role, status,
                is_default_org, joined_at, joined_via
            )
            VALUES (
                NEW.id, matching_org.id,
                COALESCE(matching_org.default_role, 'member'),
                'active', true, NOW(), 'domain_match'
            )
            ON CONFLICT (user_id, organization_id) DO NOTHING;
            org_found := true;
        END LOOP;
    END IF;

    -- Default org membership if no domain match
    IF NOT org_found THEN
        INSERT INTO public.org_memberships (
            user_id, organization_id, role, status, is_default_org, joined_at
        )
        VALUES (NEW.id, default_org_id, 'member', 'active', true, NOW())
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── SECTION 13: INDEXES ─────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_org_memberships_joined_via ON public.org_memberships(joined_via);
CREATE INDEX IF NOT EXISTS idx_org_memberships_project    ON public.org_memberships(project_id)
    WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invitations_project        ON public.invitations(project_id)
    WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invitations_email_lower    ON public.invitations(LOWER(COALESCE(invited_email, email)));
