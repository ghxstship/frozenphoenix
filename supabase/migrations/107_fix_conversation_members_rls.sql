-- ═══════════════════════════════════════════════════════════════
-- 107: FIX CONVERSATION_MEMBERS RLS INFINITE RECURSION
--
-- The original policies on conversation_members queried
-- conversation_members inside their own USING/CHECK clauses,
-- causing PostgreSQL to re-evaluate the same RLS policy
-- recursively → stack overflow.
--
-- Fix: replace self-referential subqueries with direct checks
-- against auth.uid() or the parent conversations table.
-- ═══════════════════════════════════════════════════════════════

-- ─── Drop the recursive policies ────────────────────────────

DROP POLICY IF EXISTS conv_members_select ON conversation_members;
DROP POLICY IF EXISTS conv_members_insert ON conversation_members;
DROP POLICY IF EXISTS conv_members_update ON conversation_members;
DROP POLICY IF EXISTS conv_members_delete ON conversation_members;

-- ─── Recreate with non-recursive logic ─────────────────────

-- SELECT: Users can see their own membership rows.
-- Cross-member visibility (listing all members of a conversation)
-- is handled by the get_conversation_members() RPC below.
CREATE POLICY conv_members_select ON conversation_members
    FOR SELECT USING (
        user_id = auth.uid()
    );

-- INSERT: A user can add themselves to any conversation, OR
-- the conversation creator can add other users.
-- (Avoids querying conversation_members for admin/owner check.)
CREATE POLICY conv_members_insert ON conversation_members
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = conversation_id
              AND c.created_by = auth.uid()
        )
    );

-- UPDATE: Users can only update their own membership (mute, pin, etc.)
-- (This was already non-recursive, but recreated for completeness.)
CREATE POLICY conv_members_update ON conversation_members
    FOR UPDATE USING (
        user_id = auth.uid()
    );

-- DELETE: Users can remove themselves, OR the conversation creator
-- can remove other members.
CREATE POLICY conv_members_delete ON conversation_members
    FOR DELETE USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = conversation_id
              AND c.created_by = auth.uid()
        )
    );

-- ─── RPC: Get all members of a conversation (bypasses RLS) ──
-- This SECURITY DEFINER function lets users see who else is in
-- their conversations without the SELECT policy needing to
-- expose other users' rows directly.

CREATE OR REPLACE FUNCTION get_conversation_members(p_conversation_id UUID)
RETURNS TABLE (
    id UUID,
    conversation_id UUID,
    user_id UUID,
    role conversation_member_role,
    last_read_at TIMESTAMPTZ,
    last_read_message_id UUID,
    notification_preference notification_preference_level,
    is_muted BOOLEAN,
    is_pinned BOOLEAN,
    joined_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Verify the caller is a member of this conversation
    IF NOT EXISTS (
        SELECT 1 FROM conversation_members cm
        WHERE cm.conversation_id = p_conversation_id
          AND cm.user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Not a member of this conversation';
    END IF;

    -- Return all members (bypasses RLS since SECURITY DEFINER)
    RETURN QUERY
    SELECT
        cm.id,
        cm.conversation_id,
        cm.user_id,
        cm.role,
        cm.last_read_at,
        cm.last_read_message_id,
        cm.notification_preference,
        cm.is_muted,
        cm.is_pinned,
        cm.joined_at
    FROM conversation_members cm
    WHERE cm.conversation_id = p_conversation_id
    ORDER BY cm.joined_at ASC;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_conversation_members(UUID) TO authenticated;
