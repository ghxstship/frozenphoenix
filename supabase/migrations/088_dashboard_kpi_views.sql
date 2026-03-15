-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 088: Dashboard KPI Materialized Views
-- Resolves FULLSTACK_AUDIT_REPORT_V6 H-012
--
-- Creates materialized views for dashboard KPIs so the frontend can query
-- a single lightweight view instead of pulling entire tables client-side.
-- Includes a refresh function callable via cron or on-demand.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Organization-scoped dashboard KPIs
--    Uses subqueries per entity to avoid FULL OUTER JOIN complexity.
--    Column references verified against actual schema:
--      deals: no deleted_at
--      projects: no deleted_at
--      crew_members: no deleted_at, status uses available/assigned/unavailable
--      tasks: assignee_id (not assigned_to), no deleted_at, has organization_id
--      notifications: has organization_id (added in 034/061)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_dashboard_kpis AS
SELECT
    o.id AS organization_id,

    -- Pipeline: sum of deal values not yet won/lost
    COALESCE((
        SELECT SUM(d.value)
        FROM deals d
        WHERE d.organization_id = o.id
          AND d.stage NOT IN ('won', 'lost')
    ), 0) AS pipeline_value,

    -- Revenue won this quarter
    COALESCE((
        SELECT SUM(d.value)
        FROM deals d
        WHERE d.organization_id = o.id
          AND d.stage = 'won'
          AND d.updated_at >= date_trunc('quarter', CURRENT_DATE)
    ), 0) AS revenue_won_qtd,

    -- Revenue won last quarter (for comparison)
    COALESCE((
        SELECT SUM(d.value)
        FROM deals d
        WHERE d.organization_id = o.id
          AND d.stage = 'won'
          AND d.updated_at >= date_trunc('quarter', CURRENT_DATE) - INTERVAL '3 months'
          AND d.updated_at < date_trunc('quarter', CURRENT_DATE)
    ), 0) AS revenue_won_prev_qtd,

    -- Active projects count
    (
        SELECT COUNT(*)
        FROM projects p
        WHERE p.organization_id = o.id
          AND p.status = 'active'
    ) AS active_projects_count,

    -- Projects started this month
    (
        SELECT COUNT(*)
        FROM projects p
        WHERE p.organization_id = o.id
          AND p.status = 'active'
          AND p.created_at >= date_trunc('month', CURRENT_DATE)
    ) AS new_projects_this_month,

    -- Active crew count (available or assigned = active in practice)
    (
        SELECT COUNT(*)
        FROM crew_members cm
        WHERE cm.organization_id = o.id
          AND cm.status IN ('available', 'assigned')
    ) AS active_crew_count,

    -- Overdue approvals
    (
        SELECT COUNT(*)
        FROM approvals a
        WHERE a.organization_id = o.id
          AND a.status = 'overdue'
    ) AS overdue_approvals_count,

    -- Unread notifications (org-wide, for admin dashboards)
    (
        SELECT COUNT(*)
        FROM notifications n
        WHERE n.organization_id = o.id
          AND n.read = false
    ) AS unread_notifications_count,

    -- Timestamp for staleness detection
    NOW() AS refreshed_at

FROM organizations o;

-- Unique index required for CONCURRENTLY refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_dashboard_kpis_org
    ON mv_dashboard_kpis(organization_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Refresh function — callable via pg_cron or Supabase scheduled function
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION refresh_dashboard_kpis()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_kpis;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Per-user task summary view (lightweight, not materialized)
--    tasks uses assignee_id (not assigned_to), no deleted_at column
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW v_user_task_summary AS
SELECT
    t.assignee_id AS user_id,
    t.organization_id,
    COUNT(*) FILTER (WHERE t.status = 'todo') AS todo_count,
    COUNT(*) FILTER (WHERE t.status = 'in_progress') AS in_progress_count,
    COUNT(*) FILTER (WHERE t.status = 'done') AS done_count,
    COUNT(*) FILTER (
        WHERE t.status NOT IN ('done', 'cancelled')
        AND t.due_date < CURRENT_DATE
    ) AS overdue_count,
    COUNT(*) FILTER (
        WHERE t.status NOT IN ('done', 'cancelled')
        AND t.priority = 'high'
    ) AS high_priority_count
FROM tasks t
WHERE t.assignee_id IS NOT NULL
GROUP BY t.assignee_id, t.organization_id;
