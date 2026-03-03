-- ═══════════════════════════════════════════════════════════════════════════
-- FROZEN PHOENIX — 6-Tier RBAC Expansion
-- Expands from 4 roles (exec, pm, client, vendor) to 6 roles:
--   exec, director, pm, member, client, collaborator
-- Renames vendor → collaborator (ZERO backward compatibility)
-- Adds director + member system roles and permission grants
-- Updates all CHECK constraints, RLS helpers, triggers, and seed data
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: UPDATE CHECK CONSTRAINTS
-- Drop old 4-value constraints, recreate with 6 values
-- ─────────────────────────────────────────────────────────────────────────────

-- Step 1a: DROP all old CHECK constraints
ALTER TABLE org_memberships DROP CONSTRAINT IF EXISTS org_memberships_role_check;
ALTER TABLE invitations DROP CONSTRAINT IF EXISTS invitations_role_check;
ALTER TABLE onboarding_step_definitions DROP CONSTRAINT IF EXISTS onboarding_step_definitions_role_check;
ALTER TABLE api_tokens DROP CONSTRAINT IF EXISTS api_tokens_permission_level_check;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_default_role_check;
DO $$ BEGIN
    ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_default_role_check1;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Step 1b: RENAME vendor → collaborator in all existing rows (before new constraints)
UPDATE org_memberships SET role = 'collaborator' WHERE role = 'vendor';
UPDATE invitations SET role = 'collaborator' WHERE role = 'vendor';
UPDATE onboarding_step_definitions SET role = 'collaborator' WHERE role = 'vendor';
UPDATE api_tokens SET permission_level = 'collaborator' WHERE permission_level = 'vendor';
UPDATE profiles SET role = 'collaborator' WHERE role = 'vendor';
UPDATE organizations SET default_role = 'collaborator' WHERE default_role = 'vendor';

-- Step 1c: ADD new 6-role CHECK constraints
ALTER TABLE org_memberships ADD CONSTRAINT org_memberships_role_check
    CHECK (role IN ('exec', 'director', 'pm', 'member', 'client', 'collaborator'));
ALTER TABLE invitations ADD CONSTRAINT invitations_role_check
    CHECK (role IN ('exec', 'director', 'pm', 'member', 'client', 'collaborator'));
ALTER TABLE onboarding_step_definitions ADD CONSTRAINT onboarding_step_definitions_role_check
    CHECK (role IN ('exec', 'director', 'pm', 'member', 'client', 'collaborator', 'all'));
ALTER TABLE api_tokens ADD CONSTRAINT api_tokens_permission_level_check
    CHECK (permission_level IN ('exec', 'director', 'pm', 'member', 'client', 'collaborator'));
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('exec', 'director', 'pm', 'member', 'client', 'collaborator'));
ALTER TABLE organizations ADD CONSTRAINT organizations_default_role_check
    CHECK (default_role IN ('exec', 'director', 'pm', 'member', 'client', 'collaborator'));

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: UPDATE DEFAULT ROLE FOR NEW SIGNUPS
-- Change from 'pm' to 'member' per business decision
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE org_memberships ALTER COLUMN role SET DEFAULT 'member';
ALTER TABLE invitations ALTER COLUMN role SET DEFAULT 'member';
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'member';
ALTER TABLE api_tokens ALTER COLUMN permission_level SET DEFAULT 'member';

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: SEED NEW SYSTEM ROLES (director + member)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO role_definitions (organization_id, key, label, description, is_system, priority) VALUES
(NULL, 'director', 'Director', 'Cross-project oversight with budget approval and crew management. Cannot change org settings or billing.', true, 5),
(NULL, 'member', 'Team Member', 'Internal team member with task execution, time tracking, and checklist access. Cannot create projects or view financials.', true, 15)
ON CONFLICT DO NOTHING;

-- Rename vendor → collaborator in role_definitions
UPDATE role_definitions
SET key = 'collaborator',
    label = 'Collaborator',
    description = 'External partner with task-specific access to assigned work, compliance, and documents.'
WHERE key = 'vendor' AND is_system = true AND organization_id IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: SEED DIRECTOR PERMISSION GRANTS
-- Director: cross-project oversight, budget approval, crew management
-- Cannot: org settings, billing, custom roles, payroll, user management (write)
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    director_role_id UUID;
BEGIN
    SELECT id INTO director_role_id FROM role_definitions WHERE key = 'director' AND is_system = true;

    INSERT INTO permission_grants (role_definition_id, resource, action) VALUES
    -- Command Center
    (director_role_id, 'dashboard', 'read'),
    (director_role_id, 'dashboards', 'read'), (director_role_id, 'dashboards', 'write'),
    (director_role_id, 'calendar', 'read'), (director_role_id, 'calendar', 'write'),
    (director_role_id, 'reports', 'read'),
    (director_role_id, 'forecasting', 'read'),
    (director_role_id, 'scenarios', 'read'), (director_role_id, 'scenarios', 'write'),
    (director_role_id, 'saved_views', 'read'), (director_role_id, 'saved_views', 'write'),
    -- Commercial
    (director_role_id, 'leads', 'read'), (director_role_id, 'leads', 'write'),
    (director_role_id, 'pipeline', 'read'), (director_role_id, 'pipeline', 'write'),
    (director_role_id, 'deals', 'read'), (director_role_id, 'deals', 'write'),
    (director_role_id, 'opportunities', 'read'), (director_role_id, 'opportunities', 'write'),
    (director_role_id, 'accounts', 'read'), (director_role_id, 'accounts', 'write'),
    (director_role_id, 'revenue', 'read'),
    (director_role_id, 'change_orders', 'read'), (director_role_id, 'change_orders', 'write'),
    (director_role_id, 'people', 'read'),
    (director_role_id, 'case_studies', 'read'), (director_role_id, 'case_studies', 'write'),
    (director_role_id, 'service_requests', 'read'), (director_role_id, 'service_requests', 'write'),
    -- Production
    (director_role_id, 'projects', 'read'), (director_role_id, 'projects', 'write'),
    (director_role_id, 'locations', 'read'), (director_role_id, 'locations', 'write'),
    (director_role_id, 'activations', 'read'), (director_role_id, 'activations', 'write'),
    (director_role_id, 'events', 'read'), (director_role_id, 'events', 'write'),
    (director_role_id, 'tasks', 'read'), (director_role_id, 'tasks', 'write'), (director_role_id, 'tasks', 'delete'),
    (director_role_id, 'sow', 'read'), (director_role_id, 'sow', 'write'),
    (director_role_id, 'schedule', 'read'), (director_role_id, 'schedule', 'write'),
    -- Resources (full write — crew management is a director capability)
    (director_role_id, 'crew', 'read'), (director_role_id, 'crew', 'write'),
    (director_role_id, 'time_tracking', 'read'), (director_role_id, 'time_tracking', 'write'),
    (director_role_id, 'time_off', 'read'), (director_role_id, 'time_off', 'write'),
    (director_role_id, 'assets', 'read'), (director_role_id, 'assets', 'write'),
    (director_role_id, 'inventory', 'read'), (director_role_id, 'inventory', 'write'),
    (director_role_id, 'fleet', 'read'),
    (director_role_id, 'resource_planner', 'read'), (director_role_id, 'resource_planner', 'write'),
    -- Logistics
    (director_role_id, 'shipments', 'read'), (director_role_id, 'shipments', 'write'),
    (director_role_id, 'warehouses', 'read'), (director_role_id, 'warehouses', 'write'),
    -- Creative
    (director_role_id, 'brand', 'read'),
    (director_role_id, 'decks', 'read'), (director_role_id, 'decks', 'write'),
    (director_role_id, 'templates', 'read'), (director_role_id, 'templates', 'write'),
    -- Documents
    (director_role_id, 'documents', 'read'), (director_role_id, 'documents', 'write'),
    (director_role_id, 'contracts', 'read'), (director_role_id, 'contracts', 'write'),
    (director_role_id, 'call_sheets', 'read'), (director_role_id, 'call_sheets', 'write'),
    (director_role_id, 'tech_sheets', 'read'), (director_role_id, 'tech_sheets', 'write'),
    (director_role_id, 'proposals', 'read'), (director_role_id, 'proposals', 'write'),
    -- Finance (read + budget approval write — no payroll, no manage)
    (director_role_id, 'finance', 'read'),
    (director_role_id, 'budgets', 'read'), (director_role_id, 'budgets', 'write'),
    (director_role_id, 'rate_cards', 'read'),
    (director_role_id, 'client_invoices', 'read'),
    (director_role_id, 'invoices', 'read'),
    (director_role_id, 'payments', 'read'),
    (director_role_id, 'credit_notes', 'read'),
    (director_role_id, 'recurring_invoices', 'read'),
    (director_role_id, 'expenses', 'read'), (director_role_id, 'expenses', 'write'),
    (director_role_id, 'estimates', 'read'), (director_role_id, 'estimates', 'write'),
    (director_role_id, 'job_costing', 'read'),
    (director_role_id, 'vendors', 'read'), (director_role_id, 'vendors', 'write'),
    (director_role_id, 'procurement', 'read'), (director_role_id, 'procurement', 'write'),
    -- Vendor Management
    (director_role_id, 'vendor_onboarding', 'read'), (director_role_id, 'vendor_onboarding', 'write'),
    (director_role_id, 'vendor_compliance', 'read'), (director_role_id, 'vendor_compliance', 'write'),
    (director_role_id, 'vendor_reviews', 'read'), (director_role_id, 'vendor_reviews', 'write'),
    (director_role_id, 'work_orders', 'read'), (director_role_id, 'work_orders', 'write'),
    (director_role_id, 'dispatch', 'read'), (director_role_id, 'dispatch', 'write'),
    (director_role_id, 'checklists', 'read'), (director_role_id, 'checklists', 'write'),
    -- Safety & Compliance
    (director_role_id, 'incidents', 'read'), (director_role_id, 'incidents', 'write'),
    (director_role_id, 'approvals', 'read'), (director_role_id, 'approvals', 'write'),
    (director_role_id, 'automations', 'read'),
    -- Portals (read only)
    (director_role_id, 'client_portal', 'read'),
    (director_role_id, 'vendor_portal', 'read'),
    -- Organization (read — no settings write, no user management write)
    (director_role_id, 'org_chart', 'read'),
    (director_role_id, 'sops', 'read'),
    (director_role_id, 'vault', 'read'),
    (director_role_id, 'kb', 'read'),
    (director_role_id, 'roles', 'read'),
    (director_role_id, 'user_management', 'read'),
    (director_role_id, 'invitations', 'read'), (director_role_id, 'invitations', 'write'),
    (director_role_id, 'access_reviews', 'read'),
    (director_role_id, 'audit_log', 'read'),
    -- Workforce
    (director_role_id, 'workforce', 'read'), (director_role_id, 'workforce', 'write'),
    (director_role_id, 'workforce_onboarding', 'read'), (director_role_id, 'workforce_onboarding', 'write'),
    (director_role_id, 'workforce_reviews', 'read'), (director_role_id, 'workforce_reviews', 'write'),
    -- Digital Assets
    (director_role_id, 'digital_assets', 'read'), (director_role_id, 'digital_assets', 'write'),
    -- Creative & Brand
    (director_role_id, 'creative_briefs', 'read'), (director_role_id, 'creative_briefs', 'write'),
    (director_role_id, 'brand_guidelines', 'read'), (director_role_id, 'brand_guidelines', 'write'),
    (director_role_id, 'campaigns', 'read'), (director_role_id, 'campaigns', 'write'),
    (director_role_id, 'creative_reviews', 'read'), (director_role_id, 'creative_reviews', 'write'),
    -- Legal & Governance
    (director_role_id, 'insurance_policies', 'read'), (director_role_id, 'insurance_policies', 'write'),
    (director_role_id, 'ip_rights', 'read'), (director_role_id, 'ip_rights', 'write'),
    (director_role_id, 'clause_library', 'read'), (director_role_id, 'clause_library', 'write'),
    (director_role_id, 'obligations', 'read'), (director_role_id, 'obligations', 'write'),
    (director_role_id, 'permits', 'read'), (director_role_id, 'permits', 'write'),
    (director_role_id, 'engineering_approvals', 'read'), (director_role_id, 'engineering_approvals', 'write'),
    (director_role_id, 'compliance_checklists', 'read'), (director_role_id, 'compliance_checklists', 'write'),
    (director_role_id, 'certifications', 'read'), (director_role_id, 'certifications', 'write'),
    -- Finance Governance (budget approvals — key director capability)
    (director_role_id, 'gl_accounts', 'read'),
    (director_role_id, 'budget_approvals', 'read'), (director_role_id, 'budget_approvals', 'write'),
    (director_role_id, 'payment_approvals', 'read'), (director_role_id, 'payment_approvals', 'write'),
    (director_role_id, 'purchase_requisitions', 'read'), (director_role_id, 'purchase_requisitions', 'write'),
    (director_role_id, 'goods_receipts', 'read'), (director_role_id, 'goods_receipts', 'write'),
    (director_role_id, 'vendor_risk', 'read'),
    -- Live Operations
    (director_role_id, 'live_events', 'read'), (director_role_id, 'live_events', 'write'),
    (director_role_id, 'command_positions', 'read'), (director_role_id, 'command_positions', 'write'),
    (director_role_id, 'readiness_gates', 'read'), (director_role_id, 'readiness_gates', 'write'),
    (director_role_id, 'department_statuses', 'read'), (director_role_id, 'department_statuses', 'write'),
    (director_role_id, 'ros_cues', 'read'), (director_role_id, 'ros_cues', 'write'),
    (director_role_id, 'comm_channels', 'read'), (director_role_id, 'comm_channels', 'write'),
    (director_role_id, 'comm_log', 'read'), (director_role_id, 'comm_log', 'write'),
    (director_role_id, 'live_crew', 'read'), (director_role_id, 'live_crew', 'write'),
    (director_role_id, 'equipment_check_ins', 'read'), (director_role_id, 'equipment_check_ins', 'write'),
    (director_role_id, 'environmental_readings', 'read'), (director_role_id, 'environmental_readings', 'write'),
    (director_role_id, 'live_financial', 'read'), (director_role_id, 'live_financial', 'write'),
    (director_role_id, 'foh_zones', 'read'), (director_role_id, 'foh_zones', 'write'),
    (director_role_id, 'vip_guests', 'read'), (director_role_id, 'vip_guests', 'write'),
    (director_role_id, 'guest_incidents', 'read'), (director_role_id, 'guest_incidents', 'write'),
    (director_role_id, 'strike_sequences', 'read'), (director_role_id, 'strike_sequences', 'write'),
    (director_role_id, 'asset_reconciliation', 'read'), (director_role_id, 'asset_reconciliation', 'write'),
    (director_role_id, 'post_event_reports', 'read'), (director_role_id, 'post_event_reports', 'write'),
    -- Spatial Hierarchy
    (director_role_id, 'spatial_locations', 'read'), (director_role_id, 'spatial_locations', 'write'),
    (director_role_id, 'space_bookings', 'read'), (director_role_id, 'space_bookings', 'write'),
    (director_role_id, 'location_documents', 'read'), (director_role_id, 'location_documents', 'write'),
    (director_role_id, 'location_inspections', 'read'), (director_role_id, 'location_inspections', 'write'),
    (director_role_id, 'location_costs', 'read'), (director_role_id, 'location_costs', 'write'),
    -- Asset Logistics
    (director_role_id, 'warehouse_zones', 'read'), (director_role_id, 'warehouse_zones', 'write'),
    (director_role_id, 'warehouse_locations', 'read'), (director_role_id, 'warehouse_locations', 'write'),
    (director_role_id, 'reservations', 'read'), (director_role_id, 'reservations', 'write'),
    (director_role_id, 'kits', 'read'), (director_role_id, 'kits', 'write'),
    (director_role_id, 'scan_log', 'read'), (director_role_id, 'scan_log', 'write'),
    (director_role_id, 'load_plans', 'read'), (director_role_id, 'load_plans', 'write'),
    (director_role_id, 'logistics_events', 'read'),
    (director_role_id, 'asset_damage', 'read'), (director_role_id, 'asset_damage', 'write'),
    (director_role_id, 'maintenance_schedules', 'read'), (director_role_id, 'maintenance_schedules', 'write'),
    (director_role_id, 'depreciation_schedules', 'read'),
    (director_role_id, 'inventory_audits', 'read'), (director_role_id, 'inventory_audits', 'write'),
    -- System
    (director_role_id, 'system_health', 'read'),
    (director_role_id, 'data_export', 'read'), (director_role_id, 'data_export', 'write'),
    (director_role_id, 'sla_definitions', 'read'), (director_role_id, 'sla_definitions', 'write'),
    (director_role_id, 'financial_periods', 'read'),
    (director_role_id, 'exchange_rates', 'read'),
    (director_role_id, 'domain_events', 'read'),
    -- Production Lifecycle
    (director_role_id, 'production_verticals', 'read'), (director_role_id, 'production_verticals', 'write'),
    (director_role_id, 'work_packages', 'read'), (director_role_id, 'work_packages', 'write'),
    (director_role_id, 'work_package_dependencies', 'read'), (director_role_id, 'work_package_dependencies', 'write'),
    (director_role_id, 'boms', 'read'), (director_role_id, 'boms', 'write'),
    (director_role_id, 'production_runs', 'read'), (director_role_id, 'production_runs', 'write'),
    (director_role_id, 'qc_gates', 'read'), (director_role_id, 'qc_gates', 'write'),
    (director_role_id, 'technical_specs', 'read'), (director_role_id, 'technical_specs', 'write'),
    (director_role_id, 'rights_licenses', 'read'), (director_role_id, 'rights_licenses', 'write'),
    (director_role_id, 'rental_agreements', 'read'), (director_role_id, 'rental_agreements', 'write');
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6: SEED MEMBER (TEAM MEMBER) PERMISSION GRANTS
-- Member: task execution, time tracking, assigned schedules, checklists
-- Cannot: create projects, view financials, manage vendors, approve anything
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    member_role_id UUID;
BEGIN
    SELECT id INTO member_role_id FROM role_definitions WHERE key = 'member' AND is_system = true;

    INSERT INTO permission_grants (role_definition_id, resource, action) VALUES
    -- Command Center (read-only dashboard)
    (member_role_id, 'dashboard', 'read'),
    (member_role_id, 'calendar', 'read'),
    -- Production (read projects, write tasks)
    (member_role_id, 'projects', 'read'),
    (member_role_id, 'events', 'read'),
    (member_role_id, 'activations', 'read'),
    (member_role_id, 'tasks', 'read'), (member_role_id, 'tasks', 'write'),
    (member_role_id, 'schedule', 'read'),
    (member_role_id, 'sow', 'read'),
    -- Resources (time tracking is a key member capability)
    (member_role_id, 'crew', 'read'),
    (member_role_id, 'time_tracking', 'read'), (member_role_id, 'time_tracking', 'write'),
    (member_role_id, 'time_off', 'read'), (member_role_id, 'time_off', 'write'),
    (member_role_id, 'assets', 'read'),
    -- Documents (read-only)
    (member_role_id, 'documents', 'read'),
    (member_role_id, 'contracts', 'read'),
    (member_role_id, 'call_sheets', 'read'),
    (member_role_id, 'tech_sheets', 'read'),
    (member_role_id, 'proposals', 'read'),
    -- Checklists (write — team members complete checklists)
    (member_role_id, 'checklists', 'read'), (member_role_id, 'checklists', 'write'),
    (member_role_id, 'compliance_checklists', 'read'),
    -- Work execution
    (member_role_id, 'work_orders', 'read'),
    (member_role_id, 'dispatch', 'read'),
    -- Organization (read-only basics)
    (member_role_id, 'org_chart', 'read'),
    (member_role_id, 'sops', 'read'),
    (member_role_id, 'kb', 'read'),
    -- Digital Assets (read-only)
    (member_role_id, 'digital_assets', 'read'),
    -- Creative (read-only)
    (member_role_id, 'brand', 'read'),
    (member_role_id, 'decks', 'read'),
    (member_role_id, 'creative_briefs', 'read'),
    (member_role_id, 'brand_guidelines', 'read'),
    -- Live Operations (read + equipment check-ins)
    (member_role_id, 'live_events', 'read'),
    (member_role_id, 'ros_cues', 'read'),
    (member_role_id, 'live_crew', 'read'),
    (member_role_id, 'equipment_check_ins', 'read'), (member_role_id, 'equipment_check_ins', 'write'),
    (member_role_id, 'strike_sequences', 'read'),
    -- Spatial Hierarchy (read-only)
    (member_role_id, 'spatial_locations', 'read'),
    (member_role_id, 'space_bookings', 'read'),
    -- Asset Logistics (read + scan log for warehouse tasks)
    (member_role_id, 'scan_log', 'read'), (member_role_id, 'scan_log', 'write'),
    (member_role_id, 'asset_damage', 'read'), (member_role_id, 'asset_damage', 'write'),
    -- Production Lifecycle (read + QC)
    (member_role_id, 'work_packages', 'read'),
    (member_role_id, 'qc_gates', 'read'), (member_role_id, 'qc_gates', 'write'),
    (member_role_id, 'technical_specs', 'read'),
    (member_role_id, 'production_runs', 'read'),
    -- Safety
    (member_role_id, 'incidents', 'read'), (member_role_id, 'incidents', 'write');
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 7: SEED ONBOARDING STEPS FOR NEW ROLES
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'onboarding_step_definitions'
    ) THEN
        -- Director steps (lighter flow — no org setup, keep invite team)
        INSERT INTO onboarding_step_definitions (role, step_key, title, description, sort_order, is_required, gate_access) VALUES
            ('director', 'review_teams',       'Review your teams',        'Overview of teams and projects under your oversight.',  3, false, false),
            ('director', 'invite_team',        'Invite team members',      'Send invitations to your team members.',               4, false, false),
            ('director', 'set_approval_prefs', 'Set approval preferences', 'Configure budget and crew approval workflows.',        5, false, false)
        ON CONFLICT DO NOTHING;

        -- Member steps
        INSERT INTO onboarding_step_definitions (role, step_key, title, description, sort_order, is_required, gate_access) VALUES
            ('member', 'review_tasks',    'Review your assignments',  'View tasks and schedules assigned to you.',  3, false, false),
            ('member', 'log_first_time',  'Log your first time entry','Submit a time entry to get started.',        4, false, false)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 8: UPDATE RLS HELPER FUNCTIONS
-- Expand is_exec_or_pm to include director (financial read access)
-- Update vendor references to collaborator
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION is_exec_or_pm()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM org_memberships
        WHERE user_id = auth.uid()
          AND status = 'active'
          AND is_default_org = true
          AND role IN ('exec', 'director', 'pm')
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Recreate invoices RLS with collaborator instead of vendor
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices') THEN
        DROP POLICY IF EXISTS "invoices_role_read" ON invoices;

        CREATE POLICY "invoices_role_read" ON invoices
            FOR SELECT USING (
                auth.uid() IS NOT NULL
                AND (
                    is_exec_or_pm()
                    OR (get_user_role() = 'client' AND invoices.organization_id IN (
                        SELECT organization_id FROM org_memberships
                        WHERE user_id = auth.uid() AND status = 'active'
                    ))
                    OR (get_user_role() = 'collaborator' AND invoices.vendor_id IN (
                        SELECT id FROM vendors
                        WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
                    ))
                )
            );
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 9: UPDATE handle_new_user() TRIGGER
-- Default role: 'member' instead of 'pm'
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_org_id UUID;
    matching_org RECORD;
    user_display_name TEXT;
    user_domain TEXT;
    org_found BOOLEAN := false;
BEGIN
    user_display_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
    user_domain := split_part(NEW.email, '@', 2);

    -- Create user_profile
    INSERT INTO user_profiles (id, email, display_name, lifecycle_status)
    VALUES (
        NEW.id,
        NEW.email,
        user_display_name,
        CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN 'onboarding' ELSE 'pending_verification' END
    );

    -- Also create legacy profiles row for backward compatibility
    -- Get or create default organization
    SELECT id INTO default_org_id FROM organizations WHERE slug = 'default' LIMIT 1;
    IF default_org_id IS NULL THEN
        INSERT INTO organizations (name, slug) VALUES ('Default Organization', 'default')
        RETURNING id INTO default_org_id;
    END IF;

    INSERT INTO profiles (id, email, name, organization_id)
    VALUES (NEW.id, NEW.email, user_display_name, default_org_id)
    ON CONFLICT (id) DO NOTHING;

    -- Check for domain-based auto-assignment
    FOR matching_org IN
        SELECT id, default_role
        FROM organizations
        WHERE sso_domain = user_domain
          AND sso_domain IS NOT NULL
    LOOP
        INSERT INTO org_memberships (user_id, organization_id, role, status, is_default_org, joined_at)
        VALUES (NEW.id, matching_org.id, COALESCE(matching_org.default_role, 'member'), 'active', true, NOW())
        ON CONFLICT (user_id, organization_id) DO NOTHING;
        org_found := true;
    END LOOP;

    -- If no domain match, assign to default org as member
    IF NOT org_found THEN
        INSERT INTO org_memberships (user_id, organization_id, role, status, is_default_org, joined_at)
        VALUES (NEW.id, default_org_id, 'member', 'active', true, NOW())
        ON CONFLICT (user_id, organization_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 10: UPDATE user_has_permission() FUNCTION
-- Fix is_default → is_default_org typo from migration 028
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION user_has_permission(
    p_resource TEXT,
    p_action permission_action,
    p_scope_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    has_perm BOOLEAN;
BEGIN
    SELECT role INTO user_role
    FROM org_memberships
    WHERE user_id = auth.uid()
      AND status = 'active'
      AND is_default_org = true
    LIMIT 1;

    IF user_role IS NULL THEN
        RETURN false;
    END IF;

    SELECT EXISTS (
        SELECT 1
        FROM permission_grants pg
        JOIN role_definitions rd ON rd.id = pg.role_definition_id
        WHERE rd.key = user_role
          AND rd.is_active = true
          AND pg.is_active = true
          AND (pg.resource = '*' OR pg.resource = p_resource)
          AND pg.action = p_action
          AND (pg.scope_id IS NULL OR pg.scope_id = p_scope_id)
    ) INTO has_perm;

    RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
