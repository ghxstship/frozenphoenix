-- Migration 096: Auth Hardening
-- Adds unique constraint on user_sessions for upsert support,
-- and INSERT policy on login_audit_log for authenticated users.

-- ═══════════════════════════════════════════════════════════════
-- 1. user_sessions: unique constraint for session upsert
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE user_sessions
    ADD CONSTRAINT uq_user_sessions_user_token
    UNIQUE (user_id, session_token_hash);

-- ═══════════════════════════════════════════════════════════════
-- 2. login_audit_log: allow authenticated users to INSERT own rows
--    (existing policies only cover SELECT; the log-event API route
--     uses the user's own supabase client, so INSERT is needed)
-- ═══════════════════════════════════════════════════════════════
CREATE POLICY "Users can insert own audit entries" ON login_audit_log
    FOR INSERT WITH CHECK (user_id = auth.uid());
