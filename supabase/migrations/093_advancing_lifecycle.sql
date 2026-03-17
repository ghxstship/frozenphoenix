-- ============================================================================
-- Migration 093: Advancing Lifecycle — Project Collaborator Pipeline (v2)
--
-- Architecture corrections from SaaS best-practice review:
--   1. Portal isolation via portal_access_tokens (NOT org_memberships)
--   2. Scalable collaborator_requirements table (NOT flat status columns)
--   3. Org-level comm template inheritance (org defaults → project overrides)
--   4. pg_notify for event-driven email dispatch on status transitions
--   5. Proper data isolation — collaborators never get org_memberships
--
-- New tables:
--   org_comm_templates            — Org-level default communication templates
--   project_comm_templates        — Project-level overrides (inherits from org)
--   project_collaborators         — One row per vendor per project
--   collaborator_requirements     — Polymorphic requirement checklist per collaborator
--   portal_access_tokens          — Scoped, time-limited portal access (no org membership)
--   project_crew_submissions      — Crew roster entries submitted via portal
--
-- Dependencies: 001 (projects, vendors, organizations, crew_members, contracts),
--   006 (e_signatures), 018 (user_profiles),
--   041 (get_user_org_ids, get_user_admin_org_ids)
-- ============================================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: ENUMS
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
    CREATE TYPE collaborator_status AS ENUM (
        'invited', 'accepted', 'onboarding', 'active',
        'completed', 'suspended', 'terminated'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE requirement_type AS ENUM (
        'contract', 'coi', 'w9', 'nda', 'advance_manifest',
        'crew_roster', 'insurance_auto', 'insurance_gl',
        'workers_comp', 'background_check', 'custom'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE requirement_status AS ENUM (
        'not_requested', 'requested', 'submitted',
        'in_review', 'approved', 'rejected', 'expired', 'waived'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE crew_submission_status AS ENUM (
        'submitted', 'approved', 'rejected', 'credential_issued'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: org_comm_templates
-- Organization-level default communication templates.
-- Projects inherit these; only stores overrides at the project level.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS org_comm_templates (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    template_key        TEXT NOT NULL,
    name                TEXT NOT NULL,
    description         TEXT,

    subject             TEXT NOT NULL,
    body_html           TEXT NOT NULL,
    body_text           TEXT,

    available_variables JSONB DEFAULT '[]'::jsonb,
    is_active           BOOLEAN NOT NULL DEFAULT true,

    deleted_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT oct_unique_key UNIQUE (organization_id, template_key)
);

CREATE INDEX IF NOT EXISTS idx_oct_org
    ON org_comm_templates(organization_id) WHERE deleted_at IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: project_comm_templates
-- Project-level overrides. If a row exists here for a template_key, it takes
-- precedence over the org-level default. Only stores the delta.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS project_comm_templates (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id          UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    org_template_id     UUID REFERENCES org_comm_templates(id) ON DELETE SET NULL,

    template_key        TEXT NOT NULL,
    name                TEXT NOT NULL,
    description         TEXT,

    subject             TEXT NOT NULL,
    body_html           TEXT NOT NULL,
    body_text           TEXT,

    available_variables JSONB DEFAULT '[]'::jsonb,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    is_customized       BOOLEAN NOT NULL DEFAULT false,

    last_sent_at        TIMESTAMPTZ,
    send_count          INTEGER NOT NULL DEFAULT 0,

    deleted_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT pct_unique_key UNIQUE (project_id, template_key)
);

CREATE INDEX IF NOT EXISTS idx_pct_project
    ON project_comm_templates(project_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pct_org
    ON project_comm_templates(organization_id) WHERE deleted_at IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: portal_access_tokens
-- Scoped, time-limited portal access for external collaborators.
-- Collaborators authenticate via token — they do NOT get org_memberships.
-- Each token is scoped to exactly one project + one vendor.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS portal_access_tokens (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id          UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    vendor_id           UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    collaborator_id     UUID NOT NULL, -- FK added after project_collaborators created

    token               TEXT NOT NULL UNIQUE,
    token_hash          TEXT NOT NULL, -- bcrypt or sha256 for lookup

    -- Scoping
    permissions         TEXT[] NOT NULL DEFAULT '{read}',  -- read, submit, sign

    -- Lifecycle
    is_active           BOOLEAN NOT NULL DEFAULT true,
    expires_at          TIMESTAMPTZ NOT NULL,
    last_used_at        TIMESTAMPTZ,
    use_count           INTEGER NOT NULL DEFAULT 0,

    -- Audit
    created_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    revoked_at          TIMESTAMPTZ,
    revoked_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pat_token_hash
    ON portal_access_tokens(token_hash) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_pat_vendor
    ON portal_access_tokens(vendor_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_pat_project
    ON portal_access_tokens(project_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_pat_collaborator
    ON portal_access_tokens(collaborator_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_pat_expires
    ON portal_access_tokens(expires_at) WHERE is_active = true;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: project_collaborators
-- One row per vendor per project. Lifecycle status only — requirement
-- tracking lives in collaborator_requirements (section 6).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS project_collaborators (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id              UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    vendor_id               UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    organization_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Who invited
    invited_by              UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    invited_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Engagement metadata
    engagement_type         TEXT NOT NULL DEFAULT 'vendor',
    scope_summary           TEXT,

    -- Lifecycle (the ONLY status on this table)
    status                  collaborator_status NOT NULL DEFAULT 'invited',

    -- Portal
    portal_activated_at     TIMESTAMPTZ,
    portal_last_access_at   TIMESTAMPTZ,

    -- Metadata
    notes                   TEXT,
    metadata                JSONB DEFAULT '{}'::jsonb,

    deleted_at              TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT pc_unique UNIQUE (project_id, vendor_id)
);

CREATE INDEX IF NOT EXISTS idx_pc_project
    ON project_collaborators(project_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pc_vendor
    ON project_collaborators(vendor_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pc_org
    ON project_collaborators(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pc_status
    ON project_collaborators(status) WHERE deleted_at IS NULL;

-- Now add the FK from portal_access_tokens to project_collaborators
ALTER TABLE portal_access_tokens
    ADD CONSTRAINT pat_collaborator_fk
    FOREIGN KEY (collaborator_id) REFERENCES project_collaborators(id) ON DELETE CASCADE;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6: collaborator_requirements
-- Polymorphic requirement checklist. Each row = one required item for one
-- collaborator. Supports multiple COIs, multiple contracts, custom types.
-- Links to the actual entity (contract, compliance doc, etc.) via entity_id.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS collaborator_requirements (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_collaborator_id UUID NOT NULL REFERENCES project_collaborators(id) ON DELETE CASCADE,
    project_id              UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    organization_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- What is required
    requirement_type        requirement_type NOT NULL,
    label                   TEXT NOT NULL,           -- "General Liability COI", "Vendor Agreement", etc.
    description             TEXT,

    -- Status lifecycle
    status                  requirement_status NOT NULL DEFAULT 'not_requested',

    -- Deadline
    deadline                DATE,
    reminder_sent_at        TIMESTAMPTZ,
    escalation_sent_at      TIMESTAMPTZ,

    -- Polymorphic link to the actual submitted entity
    entity_type             TEXT,                    -- 'contract', 'worker_compliance_doc', 'production_advance', etc.
    entity_id               UUID,

    -- Approval
    submitted_at            TIMESTAMPTZ,
    reviewed_by             UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at             TIMESTAMPTZ,
    approved_at             TIMESTAMPTZ,
    rejection_reason        TEXT,

    -- For custom requirements
    custom_instructions     TEXT,
    upload_url              TEXT,                    -- Document uploaded by collaborator

    -- Sort / display
    sort_order              INTEGER NOT NULL DEFAULT 0,
    is_blocking             BOOLEAN NOT NULL DEFAULT true, -- Blocks onboarding completion

    deleted_at              TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cr_collaborator
    ON collaborator_requirements(project_collaborator_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_cr_project
    ON collaborator_requirements(project_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_cr_org
    ON collaborator_requirements(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_cr_status
    ON collaborator_requirements(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_cr_type
    ON collaborator_requirements(requirement_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_cr_deadline
    ON collaborator_requirements(deadline)
    WHERE deleted_at IS NULL AND status NOT IN ('approved', 'waived', 'expired');
CREATE INDEX IF NOT EXISTS idx_cr_entity
    ON collaborator_requirements(entity_type, entity_id)
    WHERE entity_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 7: project_crew_submissions
-- Crew roster entries submitted by collaborators via portal.
-- Approved entries are linked to crew_members records.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS project_crew_submissions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_collaborator_id UUID NOT NULL REFERENCES project_collaborators(id) ON DELETE CASCADE,
    project_id              UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    organization_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    first_name              TEXT NOT NULL,
    last_name               TEXT NOT NULL,
    email                   TEXT,
    phone                   TEXT,
    role_title              TEXT NOT NULL,
    department              TEXT,

    needs_credentials       BOOLEAN NOT NULL DEFAULT true,
    credential_type         TEXT,
    needs_parking           BOOLEAN NOT NULL DEFAULT false,
    parking_type            TEXT,
    needs_radio             BOOLEAN NOT NULL DEFAULT false,
    radio_channel           TEXT,
    needs_uniform           BOOLEAN NOT NULL DEFAULT false,
    uniform_size            TEXT,

    needs_travel            BOOLEAN NOT NULL DEFAULT false,
    travel_details          JSONB DEFAULT '{}'::jsonb,
    needs_lodging           BOOLEAN NOT NULL DEFAULT false,
    lodging_details         JSONB DEFAULT '{}'::jsonb,

    dietary_restrictions    TEXT,
    meal_preferences        TEXT,

    status                  crew_submission_status NOT NULL DEFAULT 'submitted',
    reviewed_by             UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at             TIMESTAMPTZ,
    rejection_reason        TEXT,

    crew_member_id          UUID REFERENCES crew_members(id) ON DELETE SET NULL,

    deleted_at              TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pcs_collaborator
    ON project_crew_submissions(project_collaborator_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pcs_project
    ON project_crew_submissions(project_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pcs_status
    ON project_crew_submissions(status) WHERE deleted_at IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 8: ROW-LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE org_comm_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_comm_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborator_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_crew_submissions ENABLE ROW LEVEL SECURITY;

-- org_comm_templates
CREATE POLICY oct_select ON org_comm_templates
    FOR SELECT TO authenticated
    USING (deleted_at IS NULL AND organization_id = ANY(get_user_org_ids()));
CREATE POLICY oct_insert ON org_comm_templates
    FOR INSERT TO authenticated
    WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY oct_update ON org_comm_templates
    FOR UPDATE TO authenticated
    USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY oct_delete ON org_comm_templates
    FOR DELETE TO authenticated
    USING (organization_id = ANY(get_user_admin_org_ids()));

-- project_comm_templates
CREATE POLICY pct_select ON project_comm_templates
    FOR SELECT TO authenticated
    USING (deleted_at IS NULL AND organization_id = ANY(get_user_org_ids()));
CREATE POLICY pct_insert ON project_comm_templates
    FOR INSERT TO authenticated
    WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY pct_update ON project_comm_templates
    FOR UPDATE TO authenticated
    USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY pct_delete ON project_comm_templates
    FOR DELETE TO authenticated
    USING (organization_id = ANY(get_user_admin_org_ids()));

-- portal_access_tokens: only admins can manage
CREATE POLICY pat_select ON portal_access_tokens
    FOR SELECT TO authenticated
    USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY pat_insert ON portal_access_tokens
    FOR INSERT TO authenticated
    WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY pat_update ON portal_access_tokens
    FOR UPDATE TO authenticated
    USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY pat_delete ON portal_access_tokens
    FOR DELETE TO authenticated
    USING (organization_id = ANY(get_user_admin_org_ids()));

-- project_collaborators
CREATE POLICY pc_select ON project_collaborators
    FOR SELECT TO authenticated
    USING (deleted_at IS NULL AND organization_id = ANY(get_user_org_ids()));
CREATE POLICY pc_insert ON project_collaborators
    FOR INSERT TO authenticated
    WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY pc_update ON project_collaborators
    FOR UPDATE TO authenticated
    USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY pc_delete ON project_collaborators
    FOR DELETE TO authenticated
    USING (organization_id = ANY(get_user_admin_org_ids()));

-- collaborator_requirements
CREATE POLICY cr_select ON collaborator_requirements
    FOR SELECT TO authenticated
    USING (deleted_at IS NULL AND organization_id = ANY(get_user_org_ids()));
CREATE POLICY cr_insert ON collaborator_requirements
    FOR INSERT TO authenticated
    WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY cr_update ON collaborator_requirements
    FOR UPDATE TO authenticated
    USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY cr_delete ON collaborator_requirements
    FOR DELETE TO authenticated
    USING (organization_id = ANY(get_user_admin_org_ids()));

-- project_crew_submissions
CREATE POLICY pcs_select ON project_crew_submissions
    FOR SELECT TO authenticated
    USING (deleted_at IS NULL AND organization_id = ANY(get_user_org_ids()));
CREATE POLICY pcs_insert ON project_crew_submissions
    FOR INSERT TO authenticated
    WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY pcs_update ON project_crew_submissions
    FOR UPDATE TO authenticated
    USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY pcs_delete ON project_crew_submissions
    FOR DELETE TO authenticated
    USING (organization_id = ANY(get_user_admin_org_ids()));

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 9: TRIGGERS — updated_at
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TRIGGER trg_oct_updated_at
    BEFORE UPDATE ON org_comm_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_pct_updated_at
    BEFORE UPDATE ON project_comm_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_pat_updated_at
    BEFORE UPDATE ON portal_access_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_pc_updated_at
    BEFORE UPDATE ON project_collaborators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_cr_updated_at
    BEFORE UPDATE ON collaborator_requirements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_pcs_updated_at
    BEFORE UPDATE ON project_crew_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 10: AUTO-COMPLETION TRIGGER
-- When all blocking requirements for a collaborator are approved/waived,
-- transition from 'onboarding' to 'active'.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION check_collaborator_completeness()
RETURNS TRIGGER AS $$
DECLARE
    v_collab_id UUID;
    v_collab_status collaborator_status;
    v_pending_count INTEGER;
BEGIN
    v_collab_id := NEW.project_collaborator_id;

    -- Get current collaborator status
    SELECT status INTO v_collab_status
    FROM project_collaborators
    WHERE id = v_collab_id AND deleted_at IS NULL;

    -- Only evaluate when collaborator is in 'onboarding' status
    IF v_collab_status != 'onboarding' THEN
        RETURN NEW;
    END IF;

    -- Count blocking requirements that are NOT in a terminal-good state
    SELECT count(*) INTO v_pending_count
    FROM collaborator_requirements
    WHERE project_collaborator_id = v_collab_id
      AND deleted_at IS NULL
      AND is_blocking = true
      AND status NOT IN ('approved', 'waived');

    -- If no pending blocking requirements, activate the collaborator
    IF v_pending_count = 0 THEN
        UPDATE project_collaborators
        SET status = 'active'
        WHERE id = v_collab_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_check_collaborator_completeness
    AFTER UPDATE ON collaborator_requirements
    FOR EACH ROW EXECUTE FUNCTION check_collaborator_completeness();

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 11: pg_notify FOR EVENT-DRIVEN EMAIL DISPATCH
-- Fires on collaborator_requirements status changes so an Edge Function
-- can render the appropriate comm template and send via email provider.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION notify_requirement_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        PERFORM pg_notify(
            'collaborator_requirement_change',
            json_build_object(
                'requirement_id', NEW.id,
                'collaborator_id', NEW.project_collaborator_id,
                'project_id', NEW.project_id,
                'organization_id', NEW.organization_id,
                'requirement_type', NEW.requirement_type,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'deadline', NEW.deadline,
                'label', NEW.label
            )::text
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_notify_requirement_change
    AFTER UPDATE ON collaborator_requirements
    FOR EACH ROW EXECUTE FUNCTION notify_requirement_status_change();

-- Also notify on collaborator status changes (invited → accepted → onboarding → active)
CREATE OR REPLACE FUNCTION notify_collaborator_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        PERFORM pg_notify(
            'collaborator_status_change',
            json_build_object(
                'collaborator_id', NEW.id,
                'project_id', NEW.project_id,
                'vendor_id', NEW.vendor_id,
                'organization_id', NEW.organization_id,
                'old_status', OLD.status,
                'new_status', NEW.status
            )::text
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_notify_collaborator_change
    AFTER UPDATE ON project_collaborators
    FOR EACH ROW EXECUTE FUNCTION notify_collaborator_status_change();

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 12: REALTIME PUBLICATION
-- ─────────────────────────────────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE project_collaborators;
ALTER PUBLICATION supabase_realtime ADD TABLE collaborator_requirements;
ALTER PUBLICATION supabase_realtime ADD TABLE project_crew_submissions;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 13: COMMENTS
-- ─────────────────────────────────────────────────────────────────────────────

COMMENT ON TABLE org_comm_templates IS 'Organization-level default communication templates. Projects inherit these; only stores overrides at project level.';
COMMENT ON TABLE project_comm_templates IS 'Project-level template overrides. Inherits from org_comm_templates. Only stores delta when customized.';
COMMENT ON TABLE portal_access_tokens IS 'Scoped, time-limited portal access for external collaborators. Token-based auth — collaborators do NOT get org_memberships.';
COMMENT ON TABLE project_collaborators IS 'One row per vendor per project. Tracks lifecycle status. Requirement details live in collaborator_requirements.';
COMMENT ON TABLE collaborator_requirements IS 'Polymorphic requirement checklist. Each row = one required item. Supports multiple COIs, contracts, custom types. Links to actual entity via entity_type/entity_id.';
COMMENT ON TABLE project_crew_submissions IS 'Crew roster entries submitted by collaborators via portal. Approved entries create crew_members records.';

COMMENT ON COLUMN portal_access_tokens.token_hash IS 'SHA-256 hash of the token for secure lookup without storing plaintext';
COMMENT ON COLUMN portal_access_tokens.permissions IS 'Scoped permissions: read (view project data), submit (upload docs/manifests), sign (execute e-signatures)';
COMMENT ON COLUMN collaborator_requirements.entity_type IS 'Polymorphic: contract, worker_compliance_doc, production_advance, e_signature, etc.';
COMMENT ON COLUMN collaborator_requirements.entity_id IS 'FK to the actual submitted/signed entity record';
COMMENT ON COLUMN collaborator_requirements.is_blocking IS 'If true, must be approved/waived before collaborator can transition to active';

COMMIT;
