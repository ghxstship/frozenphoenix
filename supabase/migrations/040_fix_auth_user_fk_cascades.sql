-- ═══════════════════════════════════════════════════════════════
-- 040: Fix foreign key cascades to auth.users
-- ═══════════════════════════════════════════════════════════════
-- Several tables reference auth.users(id) without ON DELETE CASCADE
-- or with ON DELETE SET NULL on a PRIMARY KEY (which is impossible).
-- This blocks user deletion from the Supabase dashboard.
--
-- Strategy:
--   user_profiles.id        → ON DELETE CASCADE  (profile dies with user)
--   audit/log user columns  → ON DELETE SET NULL  (preserve record, null ref)
-- ═══════════════════════════════════════════════════════════════

-- 1. user_profiles.id — was ON DELETE SET NULL on a PK (contradictory)
ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_id_fkey,
  ADD CONSTRAINT user_profiles_id_fkey
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. field_access_overrides.granted_by — was bare REFERENCES
ALTER TABLE field_access_overrides
  DROP CONSTRAINT IF EXISTS field_access_overrides_granted_by_fkey,
  ADD CONSTRAINT field_access_overrides_granted_by_fkey
    FOREIGN KEY (granted_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. field_usage_events.user_id — was bare REFERENCES
ALTER TABLE field_usage_events
  DROP CONSTRAINT IF EXISTS field_usage_events_user_id_fkey,
  ADD CONSTRAINT field_usage_events_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- field_usage_events.user_id was NOT NULL — need to allow NULL for SET NULL
ALTER TABLE field_usage_events
  ALTER COLUMN user_id DROP NOT NULL;

-- 4. upsell_events.user_id — was bare REFERENCES
ALTER TABLE upsell_events
  DROP CONSTRAINT IF EXISTS upsell_events_user_id_fkey,
  ADD CONSTRAINT upsell_events_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 5. settings_change_requests.requested_by — was bare REFERENCES
ALTER TABLE settings_change_requests
  DROP CONSTRAINT IF EXISTS settings_change_requests_requested_by_fkey,
  ADD CONSTRAINT settings_change_requests_requested_by_fkey
    FOREIGN KEY (requested_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- settings_change_requests.requested_by was NOT NULL — allow NULL for SET NULL
ALTER TABLE settings_change_requests
  ALTER COLUMN requested_by DROP NOT NULL;

-- 6. settings_change_requests.reviewed_by — was bare REFERENCES
ALTER TABLE settings_change_requests
  DROP CONSTRAINT IF EXISTS settings_change_requests_reviewed_by_fkey,
  ADD CONSTRAINT settings_change_requests_reviewed_by_fkey
    FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;
