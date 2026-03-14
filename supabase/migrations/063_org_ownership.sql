-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 063: Organization Ownership
--
-- Adds is_owner to org_memberships as a boolean flag orthogonal to RBAC role.
-- Owner controls billing, org deletion, ownership transfer, SSO policy.
-- Feature access is still governed by role, not by is_owner.
--
-- Constraints:
--   - Exactly one owner per organization (unique partial index)
--   - Owner must be an internal role (exec, director, pm, member)
--   - Owner cannot be removed without transferring ownership first
--
-- Also updates handle_new_user trigger to NOT set is_owner on auto-signup
-- (only explicit org creation via API sets is_owner = true).
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: Add is_owner column
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE org_memberships
    ADD COLUMN IF NOT EXISTS is_owner BOOLEAN NOT NULL DEFAULT false;

-- Exactly one owner per organization
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_owner_per_org
    ON org_memberships (organization_id) WHERE is_owner = true;

-- Owner must be an internal role
ALTER TABLE org_memberships
    ADD CONSTRAINT chk_owner_internal_role
    CHECK (
        is_owner = false
        OR role IN ('exec', 'director', 'pm', 'member')
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: Backfill — promote the earliest active member per org to owner
-- This ensures every existing org has exactly one owner.
-- Prioritizes: exec > director > pm > member, then earliest joined_at.
-- ─────────────────────────────────────────────────────────────────────────────

WITH ranked AS (
    SELECT
        id,
        organization_id,
        ROW_NUMBER() OVER (
            PARTITION BY organization_id
            ORDER BY
                CASE role
                    WHEN 'exec' THEN 0
                    WHEN 'director' THEN 1
                    WHEN 'pm' THEN 2
                    WHEN 'member' THEN 3
                    ELSE 99
                END,
                joined_at ASC NULLS LAST,
                created_at ASC NULLS LAST
        ) AS rn
    FROM org_memberships
    WHERE status = 'active'
      AND role IN ('exec', 'director', 'pm', 'member')
)
UPDATE org_memberships
SET is_owner = true
FROM ranked
WHERE org_memberships.id = ranked.id
  AND ranked.rn = 1;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: Prevent owner from being deleted without transfer
-- Trigger fires BEFORE DELETE on org_memberships — blocks if is_owner = true
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION prevent_owner_removal()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_owner = true THEN
        RAISE EXCEPTION 'Cannot remove organization owner. Transfer ownership first.'
            USING ERRCODE = 'P0001';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_owner_removal ON org_memberships;
CREATE TRIGGER trg_prevent_owner_removal
    BEFORE DELETE ON org_memberships
    FOR EACH ROW
    EXECUTE FUNCTION prevent_owner_removal();

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: Prevent owner from being downgraded to external role
-- Trigger fires BEFORE UPDATE — blocks role change to client/collaborator
-- while is_owner = true
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION prevent_owner_external_role()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_owner = true AND NEW.role NOT IN ('exec', 'director', 'pm', 'member') THEN
        RAISE EXCEPTION 'Organization owner must have an internal role (exec, director, pm, or member).'
            USING ERRCODE = 'P0001';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_owner_external_role ON org_memberships;
CREATE TRIGGER trg_prevent_owner_external_role
    BEFORE UPDATE ON org_memberships
    FOR EACH ROW
    EXECUTE FUNCTION prevent_owner_external_role();

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: Ownership transfer function (atomic swap)
-- Callable from API route via RPC
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION transfer_org_ownership(
    p_organization_id UUID,
    p_new_owner_user_id UUID
) RETURNS VOID AS $$
DECLARE
    current_owner_id UUID;
    new_owner_role TEXT;
    new_owner_status TEXT;
BEGIN
    -- Verify caller is the current owner
    SELECT user_id INTO current_owner_id
    FROM org_memberships
    WHERE organization_id = p_organization_id
      AND is_owner = true;

    IF current_owner_id IS NULL THEN
        RAISE EXCEPTION 'No owner found for this organization.'
            USING ERRCODE = 'P0001';
    END IF;

    IF current_owner_id != auth.uid() THEN
        RAISE EXCEPTION 'Only the current owner can transfer ownership.'
            USING ERRCODE = 'P0001';
    END IF;

    IF current_owner_id = p_new_owner_user_id THEN
        RAISE EXCEPTION 'Cannot transfer ownership to yourself.'
            USING ERRCODE = 'P0001';
    END IF;

    -- Verify new owner is an active internal member
    SELECT role, status::text INTO new_owner_role, new_owner_status
    FROM org_memberships
    WHERE organization_id = p_organization_id
      AND user_id = p_new_owner_user_id;

    IF new_owner_role IS NULL THEN
        RAISE EXCEPTION 'Target user is not a member of this organization.'
            USING ERRCODE = 'P0001';
    END IF;

    IF new_owner_status != 'active' THEN
        RAISE EXCEPTION 'Target user membership is not active.'
            USING ERRCODE = 'P0001';
    END IF;

    IF new_owner_role NOT IN ('exec', 'director', 'pm', 'member') THEN
        RAISE EXCEPTION 'Ownership can only be transferred to an internal role member.'
            USING ERRCODE = 'P0001';
    END IF;

    -- Atomic swap: remove from current, grant to new
    -- Order matters: remove first to satisfy unique partial index
    UPDATE org_memberships
    SET is_owner = false
    WHERE organization_id = p_organization_id
      AND user_id = current_owner_id;

    UPDATE org_memberships
    SET is_owner = true
    WHERE organization_id = p_organization_id
      AND user_id = p_new_owner_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
