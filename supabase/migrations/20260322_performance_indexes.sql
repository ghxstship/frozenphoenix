-- ═══════════════════════════════════════════════════════════════
-- FROZEN PHOENIX — SUPABASE INDEX RECOMMENDATIONS
-- Generated from Page Performance Diagnosis & Normalization Audit
--
-- IMPORTANT: Run EXPLAIN ANALYZE on representative queries BEFORE
-- applying indexes. Only apply indexes for tables with >10K rows.
-- 
-- These indexes are designed for the query patterns in:
--   - CRUD factory list queries (org-scoped + soft-delete + sort)
--   - Dashboard BFF endpoint (8 aggregated queries)
--   - Middleware auth checks
-- ═══════════════════════════════════════════════════════════════

-- ─── High-Traffic CRUD List Queries ──────────────────────────
-- Pattern: WHERE organization_id = ? AND deleted_at IS NULL
--          ORDER BY [sort_column] DESC/ASC

CREATE INDEX IF NOT EXISTS idx_projects_org_deleted_created 
  ON projects(organization_id, deleted_at, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tasks_org_deleted_created 
  ON tasks(organization_id, deleted_at, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tasks_assignee_org_deleted_due 
  ON tasks(assigned_to, organization_id, deleted_at, due_date ASC);

CREATE INDEX IF NOT EXISTS idx_deals_org_deleted_created 
  ON deals(organization_id, deleted_at, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_events_org_deleted_date 
  ON events(organization_id, deleted_at, date ASC);

CREATE INDEX IF NOT EXISTS idx_approvals_org_deleted_deadline 
  ON approvals(organization_id, deleted_at, deadline ASC);

CREATE INDEX IF NOT EXISTS idx_crew_members_org_status 
  ON crew_members(organization_id, status);

CREATE INDEX IF NOT EXISTS idx_expenses_org_deleted_submitted 
  ON expenses(organization_id, deleted_at, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_org_deleted_updated 
  ON documents(organization_id, deleted_at, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_milestones_org_deleted_due 
  ON milestones(organization_id, deleted_at, due_date ASC);

CREATE INDEX IF NOT EXISTS idx_contracts_org_deleted_created 
  ON contracts(organization_id, deleted_at, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_invoices_org_deleted_created 
  ON invoices(organization_id, deleted_at, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_shipments_org_deleted_created 
  ON shipments(organization_id, deleted_at, created_at DESC);

-- ─── Dashboard / Notification Queries ────────────────────────

CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created 
  ON notifications(user_id, read, created_at DESC);

-- ─── Middleware Auth Queries ─────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_org_memberships_user_default 
  ON org_memberships(user_id, is_default_org) 
  WHERE is_default_org = true;

CREATE INDEX IF NOT EXISTS idx_user_profiles_lifecycle 
  ON user_profiles(id) 
  INCLUDE (lifecycle_status);
