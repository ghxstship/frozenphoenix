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
ALTER TABLE projects DROP COLUMN IF EXISTS client;

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
    EXECUTE FUNCTION update_updated_at();

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
