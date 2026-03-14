-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 071: JSONB Normalization
-- Resolves SCHEMA_OPTIMIZATION_PLAN §5 — 3NF Violations
--
-- 1. Normalizes creative_briefs.deliverable_manifest JSONB → junction table
-- 2. Creates departments lookup table to replace department ENUM
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Normalize creative_briefs.deliverable_manifest JSONB
--    The deliverable_manifest column stores structured deliverable data as
--    JSONB arrays. This violates 3NF — deliverables should be queryable,
--    indexable first-class rows with typed columns.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS brief_deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brief_id UUID NOT NULL REFERENCES creative_briefs(id) ON DELETE CASCADE,

    -- Deliverable definition
    title TEXT NOT NULL,
    deliverable_type TEXT NOT NULL DEFAULT 'asset'
        CHECK (deliverable_type IN (
            'asset', 'video', 'photo', 'copy', 'design', 'animation',
            'social_post', 'email', 'print', 'signage', 'packaging', 'other'
        )),
    description TEXT,
    specifications JSONB DEFAULT '{}',

    -- Dimensions / format
    format TEXT,
    dimensions TEXT,
    duration_seconds INTEGER,

    -- Workflow
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_progress', 'review', 'approved', 'delivered')),
    assigned_to UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    due_date DATE,
    delivered_at TIMESTAMPTZ,

    -- Quantity
    quantity INTEGER NOT NULL DEFAULT 1,

    -- Ordering
    sort_order INTEGER NOT NULL DEFAULT 0,

    -- Org scope
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brief_deliverables_brief ON brief_deliverables(brief_id);
CREATE INDEX IF NOT EXISTS idx_brief_deliverables_status ON brief_deliverables(status);
CREATE INDEX IF NOT EXISTS idx_brief_deliverables_org ON brief_deliverables(organization_id);

ALTER TABLE brief_deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY brief_deliverables_select ON brief_deliverables
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY brief_deliverables_insert ON brief_deliverables
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY brief_deliverables_update ON brief_deliverables
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY brief_deliverables_delete ON brief_deliverables
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

CREATE TRIGGER update_brief_deliverables_updated_at
    BEFORE UPDATE ON brief_deliverables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE brief_deliverables IS
    'Normalized deliverables for creative briefs. '
    'Replaces creative_briefs.deliverable_manifest JSONB column. '
    'The JSONB column is preserved for backward compat but should not be '
    'used for new writes.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Departments lookup table
--    The department ENUM (003) is inflexible — adding/removing departments
--    requires a migration. A lookup table lets orgs customize departments.
--    The ENUM is preserved; the lookup table is the canonical source.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    parent_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    head_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_departments_org ON departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_departments_parent ON departments(parent_department_id);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY departments_select ON departments
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY departments_insert ON departments
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY departments_update ON departments
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY departments_delete ON departments
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

CREATE TRIGGER update_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE departments IS
    'Org-specific department lookup table. '
    'Canonical source for department references — replaces the department ENUM '
    'from 003_production_lifecycle.sql for new features. '
    'The ENUM is preserved for backward compatibility.';

-- Seed default departments from the existing ENUM values
-- Each org can customize these; this just ensures the lookup table
-- is populated for existing orgs.
INSERT INTO departments (organization_id, name, slug, sort_order)
SELECT
    o.id,
    d.name,
    d.slug,
    d.sort_order
FROM organizations o
CROSS JOIN (
    VALUES
        ('Production', 'production', 1),
        ('Construction', 'construction', 2),
        ('Technical', 'technical', 3),
        ('Fabrication', 'fabrication', 4),
        ('Print', 'print', 5),
        ('Scenic', 'scenic', 6),
        ('Props', 'props', 7),
        ('AV', 'av', 8),
        ('Lighting', 'lighting', 9),
        ('Rigging', 'rigging', 10),
        ('Food & Beverage', 'food_beverage', 11),
        ('Staffing', 'staffing', 12),
        ('Logistics', 'logistics', 13),
        ('Finance', 'finance', 14),
        ('Creative', 'creative', 15)
) AS d(name, slug, sort_order)
ON CONFLICT (organization_id, slug) DO NOTHING;

COMMIT;
