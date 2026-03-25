-- ═══════════════════════════════════════════════════════════════
-- Migration 105: Database-Backed Roles Table
--
-- Creates the `roles` table for SaaS-standard role management.
-- Seeds the six canonical RBAC roles from the permission matrix.
-- Roles with is_system = true cannot be deleted by admins.
-- ═══════════════════════════════════════════════════════════════

-- ─── Table ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    is_system BOOLEAN DEFAULT false,
    member_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMPTZ,
    UNIQUE(organization_id, slug)
);

-- ─── Indexes ──────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_roles_organization_id ON public.roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_roles_slug ON public.roles(slug);
CREATE INDEX IF NOT EXISTS idx_roles_status ON public.roles(status);

-- ─── RLS ──────────────────────────────────────────────────────

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Read: any authenticated user in the org can see roles
CREATE POLICY "roles_select_org" ON public.roles
    FOR SELECT
    USING (
        organization_id IN (
            SELECT om.organization_id
            FROM public.org_memberships om
            WHERE om.user_id = auth.uid()
              AND om.status = 'active'
        )
    );

-- Insert: only exec/director roles can create new roles
CREATE POLICY "roles_insert_admin" ON public.roles
    FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT om.organization_id
            FROM public.org_memberships om
            WHERE om.user_id = auth.uid()
              AND om.status = 'active'
              AND om.role IN ('exec', 'director')
        )
    );

-- Update: only exec/director roles can update roles
CREATE POLICY "roles_update_admin" ON public.roles
    FOR UPDATE
    USING (
        organization_id IN (
            SELECT om.organization_id
            FROM public.org_memberships om
            WHERE om.user_id = auth.uid()
              AND om.status = 'active'
              AND om.role IN ('exec', 'director')
        )
    );

-- Delete: only exec role, and only non-system roles
CREATE POLICY "roles_delete_exec" ON public.roles
    FOR DELETE
    USING (
        is_system = false
        AND organization_id IN (
            SELECT om.organization_id
            FROM public.org_memberships om
            WHERE om.user_id = auth.uid()
              AND om.status = 'active'
              AND om.role = 'exec'
        )
    );

-- ─── Updated-at trigger ──────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER roles_updated_at
    BEFORE UPDATE ON public.roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_roles_updated_at();

-- ─── Seed system roles for all existing orgs ─────────────────

INSERT INTO public.roles (organization_id, name, slug, description, permissions, is_system, status)
SELECT
    o.id,
    r.name,
    r.slug,
    r.description,
    r.permissions,
    true,
    'active'
FROM public.organizations o
CROSS JOIN (
    VALUES
        ('Executive',    'exec',         'Global access — margins, payroll, cross-project data, full admin',          '[{"resource":"*","actions":["read","write","delete","manage"]}]'::jsonb),
        ('Director',     'director',     'Cross-project oversight — broad read, scoped write, no destructive admin',  '[]'::jsonb),
        ('Project Manager', 'pm',        'Project-scoped budgets, crew schedules, tasks',                             '[]'::jsonb),
        ('Team Member',  'member',       'Task execution — assigned work, time, limited resource access',             '[]'::jsonb),
        ('Client',       'client',       'Approved deliverables, branded progress decks, public budgets',             '[]'::jsonb),
        ('Collaborator', 'collaborator', 'External partner — task-specific WOs, site maps only',                      '[]'::jsonb)
) AS r(name, slug, description, permissions)
ON CONFLICT (organization_id, slug) DO NOTHING;

-- ─── Auto-seed for new orgs (trigger) ────────────────────────

CREATE OR REPLACE FUNCTION public.seed_roles_for_new_org()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.roles (organization_id, name, slug, description, permissions, is_system, status)
    VALUES
        (NEW.id, 'Executive',       'exec',         'Global access — margins, payroll, cross-project data, full admin',          '[{"resource":"*","actions":["read","write","delete","manage"]}]'::jsonb, true, 'active'),
        (NEW.id, 'Director',        'director',     'Cross-project oversight — broad read, scoped write, no destructive admin',  '[]'::jsonb, true, 'active'),
        (NEW.id, 'Project Manager', 'pm',           'Project-scoped budgets, crew schedules, tasks',                             '[]'::jsonb, true, 'active'),
        (NEW.id, 'Team Member',     'member',       'Task execution — assigned work, time, limited resource access',             '[]'::jsonb, true, 'active'),
        (NEW.id, 'Client',          'client',       'Approved deliverables, branded progress decks, public budgets',             '[]'::jsonb, true, 'active'),
        (NEW.id, 'Collaborator',    'collaborator', 'External partner — task-specific WOs, site maps only',                      '[]'::jsonb, true, 'active')
    ON CONFLICT (organization_id, slug) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER seed_org_roles
    AFTER INSERT ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.seed_roles_for_new_org();
