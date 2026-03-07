-- ============================================================================
-- Migration 049: RBAC Permission Grants + Approval Workflow Seed
--
-- Seeds permission_grants for new advancing resources:
--   catalog, production_advances, advance_templates, advance_admin
--
-- Seeds default approval_workflows for production_advance entity type.
--
-- Dependencies: 028 (role_definitions, permission_grants),
--   006 (approval_workflows, approval_steps), 038 (6-tier RBAC)
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: PERMISSION GRANTS FOR ADVANCING RESOURCES
-- Uses existing role_definitions seeded in migration 028/038.
-- ─────────────────────────────────────────────────────────────────────────────

-- Helper: Insert permission grants by role name
-- catalog: exec=manage, director=read+write, pm=read+write, member=read, client=read, collaborator=read
INSERT INTO permission_grants (role_definition_id, resource, action)
SELECT rd.id, pg.resource, pg.action::permission_action
FROM role_definitions rd
CROSS JOIN (VALUES
    -- catalog permissions
    ('exec',         'catalog', 'read'),
    ('exec',         'catalog', 'write'),
    ('exec',         'catalog', 'delete'),
    ('exec',         'catalog', 'manage'),
    ('director',     'catalog', 'read'),
    ('director',     'catalog', 'write'),
    ('pm',           'catalog', 'read'),
    ('pm',           'catalog', 'write'),
    ('member',       'catalog', 'read'),
    ('client',       'catalog', 'read'),
    ('collaborator', 'catalog', 'read'),

    -- production_advances permissions
    ('exec',         'production_advances', 'read'),
    ('exec',         'production_advances', 'write'),
    ('exec',         'production_advances', 'delete'),
    ('exec',         'production_advances', 'manage'),
    ('director',     'production_advances', 'read'),
    ('director',     'production_advances', 'write'),
    ('pm',           'production_advances', 'read'),
    ('pm',           'production_advances', 'write'),
    ('member',       'production_advances', 'read'),
    ('member',       'production_advances', 'write'),
    ('client',       'production_advances', 'read'),
    ('collaborator', 'production_advances', 'read'),

    -- advance_templates permissions
    ('exec',         'advance_templates', 'read'),
    ('exec',         'advance_templates', 'write'),
    ('exec',         'advance_templates', 'delete'),
    ('exec',         'advance_templates', 'manage'),
    ('director',     'advance_templates', 'read'),
    ('director',     'advance_templates', 'write'),
    ('pm',           'advance_templates', 'read'),
    ('pm',           'advance_templates', 'write'),
    ('member',       'advance_templates', 'read'),

    -- advance_admin permissions
    ('exec',         'advance_admin', 'read'),
    ('exec',         'advance_admin', 'write'),
    ('exec',         'advance_admin', 'delete'),
    ('exec',         'advance_admin', 'manage'),
    ('director',     'advance_admin', 'read'),
    ('director',     'advance_admin', 'write'),
    ('pm',           'advance_admin', 'read')
) AS pg(role_name, resource, action)
WHERE rd.key = pg.role_name
AND rd.is_system = true
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: DEFAULT APPROVAL WORKFLOW FOR PRODUCTION ADVANCES
-- Seeds a 3-tier progressive approval workflow:
--   ≤$1K auto-approve (PM), $1K–$10K director, >$10K exec
-- Configurable per-org via approval_steps.conditions JSONB.
-- ─────────────────────────────────────────────────────────────────────────────

-- Insert the workflow definition + steps for the default org (if it exists)
DO $$
DECLARE
    v_org_id UUID;
    v_workflow_id UUID;
BEGIN
    -- Use the default org seeded in migration 025
    SELECT id INTO v_org_id FROM organizations LIMIT 1;
    IF v_org_id IS NULL THEN
        RAISE NOTICE 'No organization found — skipping approval workflow seed';
        RETURN;
    END IF;

    -- Create workflow
    INSERT INTO approval_workflows (
        id, name, entity_type, description, status, organization_id, created_at, updated_at
    )
    VALUES (
        gen_random_uuid(),
        'Production Advance Approval',
        'production_advance',
        'Default 3-tier approval: auto-approve PM, director review, exec review. 48h/72h auto-escalation.',
        'active',
        v_org_id,
        now(),
        now()
    )
    ON CONFLICT DO NOTHING;

    SELECT id INTO v_workflow_id
    FROM approval_workflows
    WHERE entity_type = 'production_advance' AND organization_id = v_org_id
    LIMIT 1;

    IF v_workflow_id IS NOT NULL THEN
        -- Step 1: Auto-approve for ≤$1,000 (PM level)
        INSERT INTO approval_steps (
            workflow_id, step_order, name, description,
            approver_role, conditions
        )
        VALUES (
            v_workflow_id, 1, 'PM Auto-Approve',
            'Advances up to $1,000 are auto-approved at PM level',
            'pm',
            '{"max_amount": 1000, "auto_approve": true}'::jsonb
        )
        ON CONFLICT DO NOTHING;

        -- Step 2: Director review for $1,001–$10,000
        INSERT INTO approval_steps (
            workflow_id, step_order, name, description,
            approver_role, conditions, escalation_hours
        )
        VALUES (
            v_workflow_id, 2, 'Director Review',
            'Advances $1,001 to $10,000 require director approval',
            'director',
            '{"min_amount": 1001, "max_amount": 10000, "auto_approve": false}'::jsonb,
            48
        )
        ON CONFLICT DO NOTHING;

        -- Step 3: Exec review for >$10,000
        INSERT INTO approval_steps (
            workflow_id, step_order, name, description,
            approver_role, conditions, escalation_hours
        )
        VALUES (
            v_workflow_id, 3, 'Executive Review',
            'Advances over $10,000 require executive approval',
            'exec',
            '{"min_amount": 10001, "auto_approve": false}'::jsonb,
            72
        )
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
