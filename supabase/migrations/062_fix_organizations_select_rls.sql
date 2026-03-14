-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 062: Fix organizations SELECT RLS policy
--
-- Root cause: The original policy (migration 001) uses the legacy
-- profiles.organization_id single-org field. Users with multiple org
-- memberships can only see the one org matching their profile row,
-- causing the org switcher to display UUIDs instead of names for
-- additional organizations.
--
-- Fix: Replace with get_user_org_ids() which reads from org_memberships
-- (the canonical multi-org source of truth, established in migration 041).
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Members can view organization" ON organizations;

CREATE POLICY "Members can view organization" ON organizations
    FOR SELECT
    TO authenticated
    USING (id = ANY(get_user_org_ids()));
