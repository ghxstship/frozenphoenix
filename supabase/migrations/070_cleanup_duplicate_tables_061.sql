-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 070: Cleanup Duplicate Table Definitions from 061
-- Resolves SCHEMA_OPTIMIZATION_PLAN §4.2 — Duplicate CREATE TABLE IF NOT EXISTS
--
-- Migration 061 re-created 10 tables from 034 using IF NOT EXISTS due to a
-- partial-apply failure on the remote database. Those tables now exist in
-- both 034 and 061, creating inventory confusion.
--
-- This migration adds clarifying comments to the 061-defined copies and
-- ensures the canonical table owner is documented. No DDL changes needed
-- since IF NOT EXISTS means only one physical table exists.
--
-- Affected tables (defined in BOTH 034 AND 061):
--   revenue_recognition_entries, time_tracking_policies,
--   automation_executions, ai_report_queries, email_messages,
--   portal_sessions, survey_templates, survey_responses,
--   sla_policies, custom_field_definitions
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- Document canonical ownership for each duplicated table.
-- The authoritative definition is whichever migration created the table first
-- (034 if it applied, otherwise 061 filled the gap).
-- ─────────────────────────────────────────────────────────────────────────────

COMMENT ON TABLE revenue_recognition_entries IS
    'Revenue recognition periods per project. '
    'Canonical definition: 034_v2_feature_gaps.sql (backfilled: 061). '
    'RLS: org-isolation via get_user_org_ids().';

COMMENT ON TABLE time_tracking_policies IS
    'Per-org time tracking configuration and overtime rules. '
    'Canonical definition: 034_v2_feature_gaps.sql (backfilled: 061). '
    'RLS: org-isolation via get_user_org_ids().';

COMMENT ON TABLE automation_executions IS
    'Detailed automation execution log with status, duration, actions. '
    'Canonical definition: 034_v2_feature_gaps.sql (backfilled: 061). '
    'Supersedes deprecated automation_logs table (005). '
    'RLS: org-isolation via get_user_org_ids().';

COMMENT ON TABLE ai_report_queries IS
    'AI-generated report queries with saved SQL and result data. '
    'Canonical definition: 034_v2_feature_gaps.sql (backfilled: 061). '
    'RLS: org-isolation via get_user_org_ids().';

COMMENT ON TABLE email_messages IS
    'Inbound/outbound email messages linked to entities. '
    'Canonical definition: 034_v2_feature_gaps.sql (backfilled: 061). '
    'RLS: org-isolation via get_user_org_ids().';

COMMENT ON TABLE portal_sessions IS
    'Client/vendor portal sessions with scoped access. '
    'Canonical definition: 034_v2_feature_gaps.sql (backfilled: 061). '
    'RLS: user-scoped via auth.uid().';

COMMENT ON TABLE survey_templates IS
    'Configurable survey templates (CSAT, NPS, post-event, etc). '
    'Canonical definition: 034_v2_feature_gaps.sql (backfilled: 061). '
    'RLS: org-isolation via get_user_org_ids().';

COMMENT ON TABLE survey_responses IS
    'Survey response data linked to entities and templates. '
    'Canonical definition: 034_v2_feature_gaps.sql (backfilled: 061). '
    'RLS: org-isolation via get_user_org_ids().';

COMMENT ON TABLE sla_policies IS
    'SLA policy definitions with response/resolution time targets. '
    'Canonical definition: 034_v2_feature_gaps.sql (backfilled: 061). '
    'RLS: org-isolation via get_user_org_ids().';

COMMENT ON TABLE custom_field_definitions IS
    'V2 custom field definitions with enhanced field types and entity scoping. '
    'Canonical definition: 034_v2_feature_gaps.sql (backfilled: 061). '
    'Supersedes deprecated custom_fields table (005). '
    'RLS: org-isolation via get_user_org_ids().';

COMMIT;
