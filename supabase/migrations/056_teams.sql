-- ═══════════════════════════════════════════════════════════════
-- Migration 056: Teams, Team Members, Project Company FKs
-- ═══════════════════════════════════════════════════════════════
-- Adds lightweight teams within organizations, replaces free-text
-- client column on projects with two company FKs (client + organizer).
-- ═══════════════════════════════════════════════════════════════

BEGIN;

-- ─── Teams table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teams (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    slug            TEXT NOT NULL,
    description     TEXT,
    avatar_url      TEXT,
    is_default      BOOLEAN NOT NULL DEFAULT false,
    created_by      UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_teams_org ON teams(organization_id);

-- ─── Team members junction ───────────────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id   UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id   UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    role      TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('lead', 'member')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);

-- ─── Link projects to teams (nullable = org-wide) ───────────
ALTER TABLE projects ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_projects_team ON projects(team_id);

-- ─── Replace free-text client with two company FKs ──────────
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS organizer_company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_projects_client_company ON projects(client_company_id);
CREATE INDEX IF NOT EXISTS idx_projects_organizer_company ON projects(organizer_company_id);

-- Drop dependent views before column removal, then recreate
DROP VIEW IF EXISTS v_budget_profitability;
DROP VIEW IF EXISTS v_project_profitability;
ALTER TABLE projects DROP COLUMN IF EXISTS client;

-- Recreate view (identical to 033_competitive_feature_gaps.sql)
CREATE OR REPLACE VIEW v_budget_profitability AS
SELECT
    b.id AS budget_id,
    b.project_id,
    b.version,
    b.status,
    b.total_budget,
    b.total_actual,
    b.contingency_percent,
    b.markup_percent,
    b.effective_date,
    b.organization_id,
    b.total_budget * (1 + COALESCE(b.markup_percent, 0) / 100) AS revenue,
    COALESCE(te.total_labor_cost, 0) AS labor_cost,
    COALESCE(ex.total_expense_cost, 0) AS expense_cost,
    COALESCE(bl.total_committed, 0) AS committed_cost,
    COALESCE(te.total_labor_cost, 0) + COALESCE(ex.total_expense_cost, 0) AS total_cost,
    (b.total_budget * (1 + COALESCE(b.markup_percent, 0) / 100))
        - (COALESCE(te.total_labor_cost, 0) + COALESCE(ex.total_expense_cost, 0)) AS profit,
    CASE
        WHEN b.total_budget * (1 + COALESCE(b.markup_percent, 0) / 100) > 0
        THEN (
            (b.total_budget * (1 + COALESCE(b.markup_percent, 0) / 100))
            - (COALESCE(te.total_labor_cost, 0) + COALESCE(ex.total_expense_cost, 0))
        ) / (b.total_budget * (1 + COALESCE(b.markup_percent, 0) / 100)) * 100
        ELSE 0
    END AS margin_percent,
    CASE
        WHEN (CURRENT_DATE - b.effective_date) > 0
        THEN (COALESCE(te.total_labor_cost, 0) + COALESCE(ex.total_expense_cost, 0))
             / (CURRENT_DATE - b.effective_date)
        ELSE 0
    END AS daily_burn_rate,
    CASE
        WHEN b.total_budget > 0
        THEN (COALESCE(te.total_labor_cost, 0) + COALESCE(ex.total_expense_cost, 0)) / b.total_budget * 100
        ELSE 0
    END AS burn_percent,
    COALESCE(te.total_hours, 0) AS total_hours_tracked,
    COALESCE(te.billable_hours, 0) AS billable_hours,
    GREATEST(0, CURRENT_DATE - b.effective_date) AS days_elapsed,
    b.created_at,
    b.updated_at
FROM budgets b
LEFT JOIN LATERAL (
    SELECT
        SUM(pte.total_pay) AS total_labor_cost,
        SUM(pte.regular_hours + pte.overtime_hours + pte.double_time_hours) AS total_hours,
        SUM(CASE WHEN pte.status = 'approved' THEN pte.regular_hours + pte.overtime_hours + pte.double_time_hours ELSE 0 END) AS billable_hours
    FROM production_time_entries pte
    WHERE pte.project_id = b.project_id
) te ON true
LEFT JOIN LATERAL (
    SELECT SUM(pe.amount) AS total_expense_cost
    FROM production_expenses pe
    WHERE pe.project_id = b.project_id
      AND pe.status::text IN ('approved', 'reimbursed')
) ex ON true
LEFT JOIN LATERAL (
    SELECT SUM(pbl.committed_amount) AS total_committed
    FROM production_budget_lines pbl
    WHERE pbl.budget_id = b.id
) bl ON true;

-- Recreate v_project_profitability (was in 005, replaced p.client with p.client_company_id)
CREATE OR REPLACE VIEW v_project_profitability AS
SELECT
    p.id AS project_id,
    p.name,
    p.client_company_id,
    p.company_id,
    p.organization_id,
    p.budget_planned,
    p.budget_actual,
    (p.budget_planned - p.budget_actual) AS budget_variance,
    CASE
        WHEN p.budget_planned > 0
        THEN ROUND(((p.budget_planned - p.budget_actual) / p.budget_planned) * 100, 2)
        ELSE 0
    END AS margin_percent,
    COALESCE(te.total_hours, 0) AS total_hours_logged,
    COALESCE(te.total_cost, 0) AS total_labor_cost,
    COALESCE(ex.total_expenses, 0) AS total_expenses
FROM projects p
LEFT JOIN (
    SELECT
        project_id,
        SUM(hours_worked) AS total_hours,
        SUM(total_cost) AS total_cost
    FROM time_entries
    GROUP BY project_id
) te ON te.project_id = p.id
LEFT JOIN (
    SELECT
        project_id,
        SUM(amount) AS total_expenses
    FROM expenses
    WHERE status = 'approved'
    GROUP BY project_id
) ex ON ex.project_id = p.id;

-- ─── Link companies to teams (nullable = org-wide) ──────────
ALTER TABLE companies ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_companies_team ON companies(team_id);

-- ─── RLS ─────────────────────────────────────────────────────
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY teams_org_read ON teams FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM org_memberships
        WHERE user_id = auth.uid() AND status = 'active'
    ));

CREATE POLICY teams_org_insert ON teams FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM org_memberships
        WHERE user_id = auth.uid() AND status = 'active'
          AND role IN ('exec', 'director', 'pm')
    ));

CREATE POLICY teams_org_update ON teams FOR UPDATE
    USING (organization_id IN (
        SELECT organization_id FROM org_memberships
        WHERE user_id = auth.uid() AND status = 'active'
          AND role IN ('exec', 'director', 'pm')
    ));

CREATE POLICY teams_org_delete ON teams FOR DELETE
    USING (organization_id IN (
        SELECT organization_id FROM org_memberships
        WHERE user_id = auth.uid() AND status = 'active'
          AND role IN ('exec', 'director')
    ));

CREATE POLICY team_members_read ON team_members FOR SELECT
    USING (team_id IN (
        SELECT t.id FROM teams t
        JOIN org_memberships om ON om.organization_id = t.organization_id
        WHERE om.user_id = auth.uid() AND om.status = 'active'
    ));

CREATE POLICY team_members_write ON team_members FOR INSERT
    WITH CHECK (team_id IN (
        SELECT t.id FROM teams t
        JOIN org_memberships om ON om.organization_id = t.organization_id
        WHERE om.user_id = auth.uid() AND om.status = 'active'
          AND om.role IN ('exec', 'director', 'pm')
    ));

CREATE POLICY team_members_update ON team_members FOR UPDATE
    USING (team_id IN (
        SELECT t.id FROM teams t
        JOIN org_memberships om ON om.organization_id = t.organization_id
        WHERE om.user_id = auth.uid() AND om.status = 'active'
          AND om.role IN ('exec', 'director', 'pm')
    ));

CREATE POLICY team_members_delete ON team_members FOR DELETE
    USING (team_id IN (
        SELECT t.id FROM teams t
        JOIN org_memberships om ON om.organization_id = t.organization_id
        WHERE om.user_id = auth.uid() AND om.status = 'active'
          AND om.role IN ('exec', 'director', 'pm')
    ));

-- ─── updated_at trigger ──────────────────────────────────────
CREATE TRIGGER set_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ─── Seed default "General" team on org creation ─────────────
CREATE OR REPLACE FUNCTION seed_default_team()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO teams (organization_id, name, slug, is_default, created_by)
    VALUES (NEW.id, 'General', 'general', true, NULL)
    ON CONFLICT (organization_id, slug) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_seed_default_team
    AFTER INSERT ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION seed_default_team();

-- ─── Seed default teams for existing organizations ───────────
INSERT INTO teams (organization_id, name, slug, is_default)
SELECT id, 'General', 'general', true
FROM organizations
WHERE id NOT IN (SELECT organization_id FROM teams WHERE slug = 'general')
ON CONFLICT (organization_id, slug) DO NOTHING;

COMMIT;
