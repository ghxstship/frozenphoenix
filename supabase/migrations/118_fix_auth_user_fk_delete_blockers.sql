-- ═══════════════════════════════════════════════════════════════
-- 118: Fix all remaining auth.users FK delete blockers
-- ═══════════════════════════════════════════════════════════════
-- Supabase dashboard user deletion fails with:
--   "Failed to delete user: Database error deleting user"
--
-- Root causes:
--   A) NOT NULL + ON DELETE SET NULL — contradictory; Postgres
--      cannot set a NOT NULL column to NULL, so the cascade aborts.
--   B) Bare REFERENCES auth.users(id) without ON DELETE clause —
--      defaults to RESTRICT, which blocks deletion outright.
--
-- Strategy:
--   • Identity columns (user_profiles.id)     → already CASCADE (040)
--   • Ownership of child rows (conversations)  → CASCADE (delete with user)
--   • Audit / log / metering columns           → SET NULL + DROP NOT NULL
-- ═══════════════════════════════════════════════════════════════

-- ─── A) Fix NOT NULL + ON DELETE SET NULL contradictions ──────

-- 1. ai_api_keys.created_by  (085/084: NOT NULL + SET NULL)
ALTER TABLE ai_api_keys
  ALTER COLUMN created_by DROP NOT NULL;

-- 2. ai_usage_logs.user_id  (085/084: NOT NULL + SET NULL)
ALTER TABLE ai_usage_logs
  ALTER COLUMN user_id DROP NOT NULL;

-- ─── B) Fix bare REFERENCES (no ON DELETE → defaults to RESTRICT) ──

-- The original CREATE TABLE statements in 031 and 035 used bare
-- REFERENCES. Migrations 040 and 103 fixed the ones known at that
-- time, but the constraint names used by 040 may not match the
-- auto-generated names if the tables were created with inline
-- REFERENCES syntax. We drop by convention name *and* by the
-- Postgres-generated name to be safe.

-- 3. field_access_overrides.granted_by — 040 already fixed this;
--    verify by re-applying (idempotent DROP IF EXISTS + ADD).
ALTER TABLE field_access_overrides
  DROP CONSTRAINT IF EXISTS field_access_overrides_granted_by_fkey;
ALTER TABLE field_access_overrides
  ADD CONSTRAINT field_access_overrides_granted_by_fkey
    FOREIGN KEY (granted_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 4. field_usage_events.user_id — 040 already fixed, re-verify.
ALTER TABLE field_usage_events
  DROP CONSTRAINT IF EXISTS field_usage_events_user_id_fkey;
ALTER TABLE field_usage_events
  ADD CONSTRAINT field_usage_events_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 5. upsell_events.user_id — 040 already fixed, re-verify.
ALTER TABLE upsell_events
  DROP CONSTRAINT IF EXISTS upsell_events_user_id_fkey;
ALTER TABLE upsell_events
  ADD CONSTRAINT upsell_events_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 6. settings_change_requests.requested_by — 040 already fixed.
ALTER TABLE settings_change_requests
  DROP CONSTRAINT IF EXISTS settings_change_requests_requested_by_fkey;
ALTER TABLE settings_change_requests
  ADD CONSTRAINT settings_change_requests_requested_by_fkey
    FOREIGN KEY (requested_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 7. settings_change_requests.reviewed_by — 040 already fixed.
ALTER TABLE settings_change_requests
  DROP CONSTRAINT IF EXISTS settings_change_requests_reviewed_by_fkey;
ALTER TABLE settings_change_requests
  ADD CONSTRAINT settings_change_requests_reviewed_by_fkey
    FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ─── C) Catch tables introduced after migration 103 ─────────

-- 8. ai_api_keys.created_by — fix the FK itself (085 set ON DELETE
--    SET NULL already, but re-apply to be safe)
ALTER TABLE ai_api_keys
  DROP CONSTRAINT IF EXISTS ai_api_keys_created_by_fkey;
ALTER TABLE ai_api_keys
  ADD CONSTRAINT ai_api_keys_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 9. ai_usage_logs.user_id — same treatment
ALTER TABLE ai_usage_logs
  DROP CONSTRAINT IF EXISTS ai_usage_logs_user_id_fkey;
ALTER TABLE ai_usage_logs
  ADD CONSTRAINT ai_usage_logs_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 10. ai_conversations.user_id — CASCADE (conversation dies with user)
ALTER TABLE ai_conversations
  DROP CONSTRAINT IF EXISTS ai_conversations_user_id_fkey;
ALTER TABLE ai_conversations
  ADD CONSTRAINT ai_conversations_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ═══════════════════════════════════════════════════════════════
-- VERIFICATION QUERY (run manually in SQL Editor to audit):
-- ═══════════════════════════════════════════════════════════════
-- SELECT
--     tc.table_name,
--     kcu.column_name,
--     rc.delete_rule
-- FROM information_schema.table_constraints tc
-- JOIN information_schema.key_column_usage kcu
--     ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.referential_constraints rc
--     ON tc.constraint_name = rc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY'
--   AND rc.delete_rule = 'NO ACTION'
--   AND kcu.column_name IN (
--       'user_id','created_by','updated_by','approved_by',
--       'requested_by','reviewed_by','granted_by','revoked_by',
--       'invited_by','submitted_by','point_of_contact',
--       'assigned_to','changed_by','id'
--   )
--   AND EXISTS (
--       SELECT 1 FROM information_schema.constraint_column_usage ccu
--       WHERE ccu.constraint_name = tc.constraint_name
--         AND ccu.table_schema = 'auth'
--         AND ccu.table_name = 'users'
--   );
-- If this returns 0 rows, all auth.users FKs are properly cascaded.
-- ═══════════════════════════════════════════════════════════════
