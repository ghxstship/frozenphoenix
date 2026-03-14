-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 072: Missing Composite Indexes for High-Traffic Queries
-- Resolves SCHEMA_OPTIMIZATION_PLAN §7 — Index Coverage Gaps
--
-- Adds composite indexes for common query patterns identified during
-- schema audit. All indexes use IF NOT EXISTS for idempotency.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. org_memberships — Hot path for RLS functions
--    get_user_org_ids() and get_user_exec_org_ids() query by
--    (user_id, status) and (user_id, role, status) on every RLS check.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_org_memberships_user_status
    ON org_memberships(user_id, status);

CREATE INDEX IF NOT EXISTS idx_org_memberships_user_role_status
    ON org_memberships(user_id, role, status)
    WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_org_memberships_org_status
    ON org_memberships(organization_id, status);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. tasks — Common dashboard queries filter by project + status + assignee
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_tasks_project_status_assignee
    ON tasks(project_id, status, assignee_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. time_entries / production_time_entries — Timesheet queries
--    Commonly queried by (project_id, date) and (crew_member_id, date)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_time_entries_project_date
    ON time_entries(project_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_production_time_entries_crew_date
    ON production_time_entries(crew_member_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_production_time_entries_project_date
    ON production_time_entries(project_id, date DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. deals — Pipeline views filter by (organization_id, stage)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_deals_org_stage
    ON deals(organization_id, stage);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. invoices — Aging reports filter by (organization_id, status, due_date)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_invoices_org_status_due
    ON invoices(organization_id, status, due_date);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. client_invoices — SOW billing queries
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_client_invoices_sow_status
    ON client_invoices(sow_id, status);

CREATE INDEX IF NOT EXISTS idx_client_invoices_org_status
    ON client_invoices(organization_id, status);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. projects — Common filter by (organization_id, status)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_projects_org_status
    ON projects(organization_id, status);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. worker_profiles — Workforce queries by (organization_id, lifecycle_status)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_worker_profiles_org_lifecycle
    ON worker_profiles(organization_id, lifecycle_status);

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. notifications — User notification feed (user_id, read, created_at)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread_recent
    ON notifications(user_id, created_at DESC)
    WHERE read = false;

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. resource_bookings — Calendar/Gantt views by date range
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_resource_bookings_org_dates
    ON resource_bookings(organization_id, start_date, end_date);

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. shifts — Scheduling views by (project_id, date)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_shifts_project_date
    ON shifts(project_id, date);

CREATE INDEX IF NOT EXISTS idx_shifts_crew_date
    ON shifts(crew_member_id, date);

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. expenses / production_expenses — Budget tracking queries
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_expenses_project_category
    ON expenses(project_id, category);

CREATE INDEX IF NOT EXISTS idx_production_expenses_project_category
    ON production_expenses(project_id, category);

COMMIT;
