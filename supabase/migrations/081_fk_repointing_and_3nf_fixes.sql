-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 081: FK Repointing (profiles → user_profiles) + 3NF Fixes
-- ═══════════════════════════════════════════════════════════════════════════
--
-- CONTEXT: Migration 067 dropped the `profiles` table and designated
-- `user_profiles` as the SSOT for user identity. However, several tables
-- created in migration 034 (V2 Feature Gaps) still reference the now-dropped
-- `profiles` table. PostgreSQL keeps orphaned FK constraints pointing at a
-- dropped table — they silently fail on INSERT. This migration:
--
--   1. Repoints all profiles(id) FKs in 034-era tables → user_profiles(id)
--   2. Normalizes user_profiles.emergency_contact_json (3NF violation)
--   3. Drops organizations.settings JSONB (SSOT violation — settings table is canonical)
--
-- References: SCHEMA_OPTIMIZATION_PASS_2.md §2, §3
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: Repoint profiles(id) FKs → user_profiles(id)
-- These tables were created in 034_v2_feature_gaps.sql with REFERENCES profiles(id)
-- but profiles was dropped in 067_identity_consolidation.sql.
-- ─────────────────────────────────────────────────────────────────────────────

-- revenue_recognition_entries.created_by
ALTER TABLE revenue_recognition_entries
  DROP CONSTRAINT IF EXISTS revenue_recognition_entries_created_by_fkey;
ALTER TABLE revenue_recognition_entries
  ADD CONSTRAINT revenue_recognition_entries_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- ai_report_queries.created_by
ALTER TABLE ai_report_queries
  DROP CONSTRAINT IF EXISTS ai_report_queries_created_by_fkey;
ALTER TABLE ai_report_queries
  ADD CONSTRAINT ai_report_queries_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- project_templates.created_by
ALTER TABLE project_templates
  DROP CONSTRAINT IF EXISTS project_templates_created_by_fkey;
ALTER TABLE project_templates
  ADD CONSTRAINT project_templates_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- email_messages.linked_by
ALTER TABLE email_messages
  DROP CONSTRAINT IF EXISTS email_messages_linked_by_fkey;
ALTER TABLE email_messages
  ADD CONSTRAINT email_messages_linked_by_fkey
  FOREIGN KEY (linked_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- notification_preferences.user_id
ALTER TABLE notification_preferences
  DROP CONSTRAINT IF EXISTS notification_preferences_user_id_fkey;
ALTER TABLE notification_preferences
  ADD CONSTRAINT notification_preferences_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- portal_sessions.user_id
ALTER TABLE portal_sessions
  DROP CONSTRAINT IF EXISTS portal_sessions_user_id_fkey;
ALTER TABLE portal_sessions
  ADD CONSTRAINT portal_sessions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- survey_templates.created_by
ALTER TABLE survey_templates
  DROP CONSTRAINT IF EXISTS survey_templates_created_by_fkey;
ALTER TABLE survey_templates
  ADD CONSTRAINT survey_templates_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- survey_responses.respondent_id
ALTER TABLE survey_responses
  DROP CONSTRAINT IF EXISTS survey_responses_respondent_id_fkey;
ALTER TABLE survey_responses
  ADD CONSTRAINT survey_responses_respondent_id_fkey
  FOREIGN KEY (respondent_id) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- sla_policies.escalation_to
ALTER TABLE sla_policies
  DROP CONSTRAINT IF EXISTS sla_policies_escalation_to_fkey;
ALTER TABLE sla_policies
  ADD CONSTRAINT sla_policies_escalation_to_fkey
  FOREIGN KEY (escalation_to) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- custom_field_definitions.created_by
ALTER TABLE custom_field_definitions
  DROP CONSTRAINT IF EXISTS custom_field_definitions_created_by_fkey;
ALTER TABLE custom_field_definitions
  ADD CONSTRAINT custom_field_definitions_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- service_requests.assessed_by (from 010, references profiles)
ALTER TABLE service_requests
  DROP CONSTRAINT IF EXISTS service_requests_assessed_by_fkey;
ALTER TABLE service_requests
  ADD CONSTRAINT service_requests_assessed_by_fkey
  FOREIGN KEY (assessed_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- service_requests.converted_by (from 010, references profiles)
ALTER TABLE service_requests
  DROP CONSTRAINT IF EXISTS service_requests_converted_by_fkey;
ALTER TABLE service_requests
  ADD CONSTRAINT service_requests_converted_by_fkey
  FOREIGN KEY (converted_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- service_requests.assigned_to (original from 010 + extended in 034)
ALTER TABLE service_requests
  DROP CONSTRAINT IF EXISTS service_requests_assigned_to_fkey;
ALTER TABLE service_requests
  ADD CONSTRAINT service_requests_assigned_to_fkey
  FOREIGN KEY (assigned_to) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- service_requests.created_by (from 010, references profiles)
ALTER TABLE service_requests
  DROP CONSTRAINT IF EXISTS service_requests_created_by_fkey;
ALTER TABLE service_requests
  ADD CONSTRAINT service_requests_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: Normalize user_profiles.emergency_contact_json → columns
-- 3NF violation: JSONB with consistent shape {name, phone, relationship}
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT;

COMMENT ON COLUMN user_profiles.emergency_contact_name IS
  'OSHA 1910.38 — emergency contact full name. Normalized from emergency_contact_json.';
COMMENT ON COLUMN user_profiles.emergency_contact_phone IS
  'OSHA 1910.38 — emergency contact phone number.';
COMMENT ON COLUMN user_profiles.emergency_contact_relationship IS
  'Relationship to user (e.g., "spouse", "parent", "partner").';

-- Backfill from JSONB column
UPDATE user_profiles
SET
  emergency_contact_name = emergency_contact_json->>'name',
  emergency_contact_phone = emergency_contact_json->>'phone',
  emergency_contact_relationship = emergency_contact_json->>'relationship'
WHERE emergency_contact_json IS NOT NULL
  AND emergency_contact_name IS NULL;

-- Drop the JSONB column now that data is migrated
ALTER TABLE user_profiles DROP COLUMN IF EXISTS emergency_contact_json;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: Drop organizations.settings JSONB
-- SSOT violation: the `settings` table (migration 026) is the canonical
-- source for org settings. This column is a legacy bag.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE organizations DROP COLUMN IF EXISTS settings;

COMMENT ON TABLE organizations IS
  'Organization records. Settings are stored in the `settings` table (migration 026), '
  'not as a JSONB column on this table.';

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: Add @mention support to record_comments
-- Required for V2 Competitive Gap #5 (@Mention Notifications)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE record_comments
  ADD COLUMN IF NOT EXISTS mentioned_user_ids UUID[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_record_comments_mentions
  ON record_comments USING GIN (mentioned_user_ids);

COMMENT ON COLUMN record_comments.mentioned_user_ids IS
  'Array of user_profiles.id values mentioned via @mention in comment body. '
  'Used for notification dispatch.';

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: crew_members.reports_to self-FK
-- Required for org-chart drag-to-reorganize feature (P3-17)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE crew_members
  ADD COLUMN IF NOT EXISTS reports_to UUID REFERENCES crew_members(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_crew_members_reports_to
  ON crew_members(reports_to);

COMMENT ON COLUMN crew_members.reports_to IS
  'Self-referencing FK for org-chart hierarchy. NULL = top-level / no manager.';

COMMIT;
