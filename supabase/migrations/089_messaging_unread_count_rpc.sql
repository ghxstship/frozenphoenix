-- ═══════════════════════════════════════════════════════════════
-- Migration 089: Messaging unread count RPC
-- Replaces N+1 client-side queries with a single server-side function.
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_messaging_unread_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(SUM(
        CASE
            WHEN cm.last_read_at IS NULL THEN
                (SELECT COUNT(*)::int FROM messages m
                 WHERE m.conversation_id = cm.conversation_id
                   AND m.deleted_at IS NULL
                   AND m.sender_id IS DISTINCT FROM p_user_id)
            ELSE
                (SELECT COUNT(*)::int FROM messages m
                 WHERE m.conversation_id = cm.conversation_id
                   AND m.created_at > cm.last_read_at
                   AND m.deleted_at IS NULL
                   AND m.sender_id IS DISTINCT FROM p_user_id)
        END
    ), 0)::integer
    FROM conversation_members cm
    WHERE cm.user_id = p_user_id;
$$;

COMMENT ON FUNCTION get_messaging_unread_count(UUID) IS
    'Returns total unread message count across all conversations for a user. '
    'Replaces N+1 client-side queries with a single server call.';

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_messaging_unread_count(UUID) TO authenticated;
