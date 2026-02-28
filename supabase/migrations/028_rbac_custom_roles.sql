-- ═══════════════════════════════════════════════════════════════════════════
-- FROZEN PHOENIX — DB-Backed Custom Roles & Permission Grants
-- Adds: role_definitions, permission_grants, access_audit_log
-- Migrates from static PERMISSION_MATRIX to DB-backed roles
-- Seeds system roles and permissions from existing matrix
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: ENUMS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TYPE permission_action AS ENUM ('read', 'write', 'delete', 'manage');
CREATE TYPE permission_scope_type AS ENUM ('global', 'organization', 'project', 'activation', 'team');

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: ROLE DEFINITIONS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE role_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    label TEXT NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    parent_role_id UUID REFERENCES role_definitions(id) ON DELETE SET NULL,
    priority INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, key)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: PERMISSION GRANTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE permission_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_definition_id UUID NOT NULL REFERENCES role_definitions(id) ON DELETE CASCADE,
    resource TEXT NOT NULL,
    action permission_action NOT NULL,
    scope_type permission_scope_type DEFAULT 'global',
    scope_id UUID,
    conditions JSONB DEFAULT '{}',
    field_restrictions TEXT[] DEFAULT '{}',
    field_exclusions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(role_definition_id, resource, action, scope_type, scope_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: ACCESS AUDIT LOG
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE access_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    scope_type TEXT,
    scope_id UUID,
    granted BOOLEAN NOT NULL,
    role_key TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: INDEXES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX idx_role_definitions_org ON role_definitions(organization_id);
CREATE INDEX idx_role_definitions_key ON role_definitions(organization_id, key);
CREATE INDEX idx_role_definitions_system ON role_definitions(is_system) WHERE is_system = true;

CREATE INDEX idx_permission_grants_role ON permission_grants(role_definition_id);
CREATE INDEX idx_permission_grants_resource ON permission_grants(resource, action);
CREATE INDEX idx_permission_grants_scope ON permission_grants(scope_type, scope_id);

CREATE INDEX idx_access_audit_log_user ON access_audit_log(user_id);
CREATE INDEX idx_access_audit_log_resource ON access_audit_log(resource, action);
CREATE INDEX idx_access_audit_log_created ON access_audit_log(created_at);
CREATE INDEX idx_access_audit_log_denied ON access_audit_log(granted) WHERE granted = false;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6: TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TRIGGER set_updated_at_role_definitions
    BEFORE UPDATE ON role_definitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 7: RLS
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE role_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_audit_log ENABLE ROW LEVEL SECURITY;

-- Role definitions readable by org members
CREATE POLICY "role_definitions_read" ON role_definitions
    FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND (
            is_system = true
            OR organization_id IN (
                SELECT organization_id FROM org_memberships
                WHERE user_id = auth.uid() AND status = 'active'
            )
        )
    );

-- Only exec can manage custom roles
CREATE POLICY "role_definitions_manage" ON role_definitions
    FOR ALL USING (
        auth.uid() IS NOT NULL
        AND (
            is_system = false
            AND organization_id IN (
                SELECT organization_id FROM org_memberships
                WHERE user_id = auth.uid() AND status = 'active' AND role = 'exec'
            )
        )
    );

-- Permission grants readable by org members
CREATE POLICY "permission_grants_read" ON permission_grants
    FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND role_definition_id IN (
            SELECT id FROM role_definitions
            WHERE is_system = true
               OR organization_id IN (
                   SELECT organization_id FROM org_memberships
                   WHERE user_id = auth.uid() AND status = 'active'
               )
        )
    );

-- Only exec can manage permission grants
CREATE POLICY "permission_grants_manage" ON permission_grants
    FOR ALL USING (
        auth.uid() IS NOT NULL
        AND role_definition_id IN (
            SELECT id FROM role_definitions
            WHERE organization_id IN (
                SELECT organization_id FROM org_memberships
                WHERE user_id = auth.uid() AND status = 'active' AND role = 'exec'
            )
        )
    );

-- Access audit log: users see own entries, exec sees all in org
CREATE POLICY "access_audit_log_read" ON access_audit_log
    FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND (
            user_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM org_memberships
                WHERE user_id = auth.uid() AND status = 'active' AND role = 'exec'
            )
        )
    );

-- Insert-only for the system
CREATE POLICY "access_audit_log_insert" ON access_audit_log
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 8: PERMISSION CHECK FUNCTION
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
    -- Get user role from active org membership
    SELECT role INTO user_role
    FROM org_memberships
    WHERE user_id = auth.uid()
      AND status = 'active'
      AND is_default = true
    LIMIT 1;

    IF user_role IS NULL THEN
        RETURN false;
    END IF;

    -- Check permission_grants via role_definitions
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

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 9: SEED SYSTEM ROLES
-- ─────────────────────────────────────────────────────────────────────────────

-- System roles (organization_id = NULL means global)
INSERT INTO role_definitions (organization_id, key, label, description, is_system, priority) VALUES
(NULL, 'exec', 'Executive', 'Full platform access with manage-level permissions across all resources', true, 0),
(NULL, 'pm', 'Project Manager', 'Read/write access to projects, tasks, crew, scheduling, and production resources', true, 10),
(NULL, 'client', 'Client', 'Read-only access to assigned projects, proposals, contracts, and approvals', true, 20),
(NULL, 'vendor', 'Vendor', 'Task-specific access to assigned work, schedules, and relevant documents', true, 30);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 10: SEED PERMISSION GRANTS (from PERMISSION_MATRIX)
-- ─────────────────────────────────────────────────────────────────────────────

-- Exec: wildcard access
INSERT INTO permission_grants (role_definition_id, resource, action)
SELECT rd.id, '*', a.action::permission_action
FROM role_definitions rd
CROSS JOIN (VALUES ('read'), ('write'), ('delete'), ('manage')) AS a(action)
WHERE rd.key = 'exec' AND rd.is_system = true;

-- PM permissions (comprehensive list from PERMISSION_MATRIX)
DO $$
DECLARE
    pm_role_id UUID;
BEGIN
    SELECT id INTO pm_role_id FROM role_definitions WHERE key = 'pm' AND is_system = true;

    -- Command Center
    INSERT INTO permission_grants (role_definition_id, resource, action) VALUES
    (pm_role_id, 'dashboard', 'read'),
    (pm_role_id, 'dashboards', 'read'), (pm_role_id, 'dashboards', 'write'),
    (pm_role_id, 'calendar', 'read'), (pm_role_id, 'calendar', 'write'),
    (pm_role_id, 'reports', 'read'),
    (pm_role_id, 'forecasting', 'read'),
    (pm_role_id, 'scenarios', 'read'), (pm_role_id, 'scenarios', 'write'),
    (pm_role_id, 'saved_views', 'read'), (pm_role_id, 'saved_views', 'write'),
    -- Commercial
    (pm_role_id, 'leads', 'read'), (pm_role_id, 'leads', 'write'),
    (pm_role_id, 'pipeline', 'read'), (pm_role_id, 'pipeline', 'write'),
    (pm_role_id, 'deals', 'read'), (pm_role_id, 'deals', 'write'),
    (pm_role_id, 'opportunities', 'read'), (pm_role_id, 'opportunities', 'write'),
    (pm_role_id, 'accounts', 'read'), (pm_role_id, 'accounts', 'write'),
    (pm_role_id, 'revenue', 'read'),
    (pm_role_id, 'change_orders', 'read'), (pm_role_id, 'change_orders', 'write'),
    (pm_role_id, 'people', 'read'),
    (pm_role_id, 'case_studies', 'read'), (pm_role_id, 'case_studies', 'write'),
    (pm_role_id, 'service_requests', 'read'), (pm_role_id, 'service_requests', 'write'),
    -- Production
    (pm_role_id, 'projects', 'read'), (pm_role_id, 'projects', 'write'),
    (pm_role_id, 'locations', 'read'), (pm_role_id, 'locations', 'write'),
    (pm_role_id, 'activations', 'read'), (pm_role_id, 'activations', 'write'),
    (pm_role_id, 'events', 'read'), (pm_role_id, 'events', 'write'),
    (pm_role_id, 'tasks', 'read'), (pm_role_id, 'tasks', 'write'), (pm_role_id, 'tasks', 'delete'),
    (pm_role_id, 'sow', 'read'), (pm_role_id, 'sow', 'write'),
    (pm_role_id, 'schedule', 'read'), (pm_role_id, 'schedule', 'write'),
    -- Resources
    (pm_role_id, 'crew', 'read'), (pm_role_id, 'crew', 'write'),
    (pm_role_id, 'time_tracking', 'read'), (pm_role_id, 'time_tracking', 'write'),
    (pm_role_id, 'time_off', 'read'), (pm_role_id, 'time_off', 'write'),
    (pm_role_id, 'assets', 'read'), (pm_role_id, 'assets', 'write'),
    (pm_role_id, 'inventory', 'read'), (pm_role_id, 'inventory', 'write'),
    (pm_role_id, 'fleet', 'read'),
    (pm_role_id, 'resource_planner', 'read'), (pm_role_id, 'resource_planner', 'write'),
    -- Logistics
    (pm_role_id, 'shipments', 'read'), (pm_role_id, 'shipments', 'write'),
    (pm_role_id, 'warehouses', 'read'), (pm_role_id, 'warehouses', 'write'),
    -- Creative
    (pm_role_id, 'brand', 'read'),
    (pm_role_id, 'decks', 'read'), (pm_role_id, 'decks', 'write'),
    (pm_role_id, 'templates', 'read'), (pm_role_id, 'templates', 'write'),
    -- Documents
    (pm_role_id, 'documents', 'read'), (pm_role_id, 'documents', 'write'),
    (pm_role_id, 'contracts', 'read'), (pm_role_id, 'contracts', 'write'),
    (pm_role_id, 'call_sheets', 'read'), (pm_role_id, 'call_sheets', 'write'),
    (pm_role_id, 'tech_sheets', 'read'), (pm_role_id, 'tech_sheets', 'write'),
    (pm_role_id, 'proposals', 'read'), (pm_role_id, 'proposals', 'write'),
    -- Finance
    (pm_role_id, 'finance', 'read'),
    (pm_role_id, 'budgets', 'read'), (pm_role_id, 'budgets', 'write'),
    (pm_role_id, 'rate_cards', 'read'),
    (pm_role_id, 'client_invoices', 'read'), (pm_role_id, 'client_invoices', 'write'),
    (pm_role_id, 'invoices', 'read'), (pm_role_id, 'invoices', 'write'),
    (pm_role_id, 'payments', 'read'),
    (pm_role_id, 'credit_notes', 'read'),
    (pm_role_id, 'recurring_invoices', 'read'),
    (pm_role_id, 'expenses', 'read'), (pm_role_id, 'expenses', 'write'),
    (pm_role_id, 'estimates', 'read'), (pm_role_id, 'estimates', 'write'),
    (pm_role_id, 'job_costing', 'read'),
    (pm_role_id, 'vendors', 'read'), (pm_role_id, 'vendors', 'write'),
    (pm_role_id, 'procurement', 'read'), (pm_role_id, 'procurement', 'write'),
    -- Vendor Management
    (pm_role_id, 'vendor_onboarding', 'read'), (pm_role_id, 'vendor_onboarding', 'write'),
    (pm_role_id, 'vendor_compliance', 'read'), (pm_role_id, 'vendor_compliance', 'write'),
    (pm_role_id, 'vendor_reviews', 'read'), (pm_role_id, 'vendor_reviews', 'write'),
    (pm_role_id, 'work_orders', 'read'), (pm_role_id, 'work_orders', 'write'),
    (pm_role_id, 'dispatch', 'read'), (pm_role_id, 'dispatch', 'write'),
    (pm_role_id, 'checklists', 'read'), (pm_role_id, 'checklists', 'write'),
    -- Safety & Compliance
    (pm_role_id, 'incidents', 'read'), (pm_role_id, 'incidents', 'write'),
    (pm_role_id, 'approvals', 'read'), (pm_role_id, 'approvals', 'write'),
    (pm_role_id, 'automations', 'read'),
    -- Portals
    (pm_role_id, 'client_portal', 'read'),
    (pm_role_id, 'vendor_portal', 'read'),
    -- Organization
    (pm_role_id, 'org_chart', 'read'),
    (pm_role_id, 'sops', 'read'),
    (pm_role_id, 'vault', 'read'),
    (pm_role_id, 'kb', 'read'),
    (pm_role_id, 'roles', 'read'),
    (pm_role_id, 'settings', 'read'),
    -- Workforce
    (pm_role_id, 'workforce', 'read'), (pm_role_id, 'workforce', 'write'),
    (pm_role_id, 'workforce_onboarding', 'read'), (pm_role_id, 'workforce_onboarding', 'write'),
    (pm_role_id, 'workforce_reviews', 'read'), (pm_role_id, 'workforce_reviews', 'write'),
    -- Digital Assets
    (pm_role_id, 'digital_assets', 'read'), (pm_role_id, 'digital_assets', 'write'),
    -- User Management
    (pm_role_id, 'user_management', 'read'),
    (pm_role_id, 'invitations', 'read'), (pm_role_id, 'invitations', 'write'),
    (pm_role_id, 'access_reviews', 'read'),
    (pm_role_id, 'audit_log', 'read'),
    -- Creative & Brand
    (pm_role_id, 'creative_briefs', 'read'), (pm_role_id, 'creative_briefs', 'write'),
    (pm_role_id, 'brand_guidelines', 'read'), (pm_role_id, 'brand_guidelines', 'write'),
    (pm_role_id, 'campaigns', 'read'), (pm_role_id, 'campaigns', 'write'),
    (pm_role_id, 'creative_reviews', 'read'), (pm_role_id, 'creative_reviews', 'write'),
    -- Legal & Governance
    (pm_role_id, 'insurance_policies', 'read'), (pm_role_id, 'insurance_policies', 'write'),
    (pm_role_id, 'ip_rights', 'read'), (pm_role_id, 'ip_rights', 'write'),
    (pm_role_id, 'clause_library', 'read'), (pm_role_id, 'clause_library', 'write'),
    (pm_role_id, 'obligations', 'read'), (pm_role_id, 'obligations', 'write'),
    (pm_role_id, 'permits', 'read'), (pm_role_id, 'permits', 'write'),
    (pm_role_id, 'engineering_approvals', 'read'), (pm_role_id, 'engineering_approvals', 'write'),
    (pm_role_id, 'compliance_checklists', 'read'), (pm_role_id, 'compliance_checklists', 'write'),
    (pm_role_id, 'certifications', 'read'), (pm_role_id, 'certifications', 'write'),
    (pm_role_id, 'gl_accounts', 'read'),
    (pm_role_id, 'budget_approvals', 'read'), (pm_role_id, 'budget_approvals', 'write'),
    (pm_role_id, 'payment_approvals', 'read'),
    (pm_role_id, 'purchase_requisitions', 'read'), (pm_role_id, 'purchase_requisitions', 'write'),
    (pm_role_id, 'goods_receipts', 'read'), (pm_role_id, 'goods_receipts', 'write'),
    (pm_role_id, 'vendor_risk', 'read'),
    -- Live Operations
    (pm_role_id, 'live_events', 'read'), (pm_role_id, 'live_events', 'write'),
    (pm_role_id, 'command_positions', 'read'), (pm_role_id, 'command_positions', 'write'),
    (pm_role_id, 'readiness_gates', 'read'), (pm_role_id, 'readiness_gates', 'write'),
    (pm_role_id, 'department_statuses', 'read'), (pm_role_id, 'department_statuses', 'write'),
    (pm_role_id, 'ros_cues', 'read'), (pm_role_id, 'ros_cues', 'write'),
    (pm_role_id, 'comm_channels', 'read'), (pm_role_id, 'comm_channels', 'write'),
    (pm_role_id, 'comm_log', 'read'), (pm_role_id, 'comm_log', 'write'),
    (pm_role_id, 'live_crew', 'read'), (pm_role_id, 'live_crew', 'write'),
    (pm_role_id, 'equipment_check_ins', 'read'), (pm_role_id, 'equipment_check_ins', 'write'),
    (pm_role_id, 'environmental_readings', 'read'), (pm_role_id, 'environmental_readings', 'write'),
    (pm_role_id, 'live_financial', 'read'), (pm_role_id, 'live_financial', 'write'),
    (pm_role_id, 'foh_zones', 'read'), (pm_role_id, 'foh_zones', 'write'),
    (pm_role_id, 'vip_guests', 'read'), (pm_role_id, 'vip_guests', 'write'),
    (pm_role_id, 'guest_incidents', 'read'), (pm_role_id, 'guest_incidents', 'write'),
    (pm_role_id, 'strike_sequences', 'read'), (pm_role_id, 'strike_sequences', 'write'),
    (pm_role_id, 'asset_reconciliation', 'read'), (pm_role_id, 'asset_reconciliation', 'write'),
    (pm_role_id, 'post_event_reports', 'read'), (pm_role_id, 'post_event_reports', 'write'),
    -- Spatial Hierarchy
    (pm_role_id, 'spatial_locations', 'read'), (pm_role_id, 'spatial_locations', 'write'),
    (pm_role_id, 'space_bookings', 'read'), (pm_role_id, 'space_bookings', 'write'),
    (pm_role_id, 'location_documents', 'read'), (pm_role_id, 'location_documents', 'write'),
    (pm_role_id, 'location_inspections', 'read'), (pm_role_id, 'location_inspections', 'write'),
    (pm_role_id, 'location_costs', 'read'), (pm_role_id, 'location_costs', 'write'),
    -- Asset Logistics
    (pm_role_id, 'warehouse_zones', 'read'), (pm_role_id, 'warehouse_zones', 'write'),
    (pm_role_id, 'warehouse_locations', 'read'), (pm_role_id, 'warehouse_locations', 'write'),
    (pm_role_id, 'reservations', 'read'), (pm_role_id, 'reservations', 'write'),
    (pm_role_id, 'kits', 'read'), (pm_role_id, 'kits', 'write'),
    (pm_role_id, 'scan_log', 'read'), (pm_role_id, 'scan_log', 'write'),
    (pm_role_id, 'load_plans', 'read'), (pm_role_id, 'load_plans', 'write'),
    (pm_role_id, 'logistics_events', 'read'),
    (pm_role_id, 'asset_damage', 'read'), (pm_role_id, 'asset_damage', 'write'),
    (pm_role_id, 'maintenance_schedules', 'read'), (pm_role_id, 'maintenance_schedules', 'write'),
    (pm_role_id, 'depreciation_schedules', 'read'),
    (pm_role_id, 'inventory_audits', 'read'), (pm_role_id, 'inventory_audits', 'write'),
    -- System
    (pm_role_id, 'system_health', 'read'),
    (pm_role_id, 'data_export', 'read'), (pm_role_id, 'data_export', 'write'),
    (pm_role_id, 'sla_definitions', 'read'), (pm_role_id, 'sla_definitions', 'write'),
    (pm_role_id, 'financial_periods', 'read'), (pm_role_id, 'financial_periods', 'write'),
    (pm_role_id, 'exchange_rates', 'read'), (pm_role_id, 'exchange_rates', 'write'),
    (pm_role_id, 'domain_events', 'read'),
    -- Production Lifecycle
    (pm_role_id, 'production_verticals', 'read'), (pm_role_id, 'production_verticals', 'write'),
    (pm_role_id, 'work_packages', 'read'), (pm_role_id, 'work_packages', 'write'),
    (pm_role_id, 'work_package_dependencies', 'read'), (pm_role_id, 'work_package_dependencies', 'write'),
    (pm_role_id, 'boms', 'read'), (pm_role_id, 'boms', 'write'),
    (pm_role_id, 'production_runs', 'read'), (pm_role_id, 'production_runs', 'write'),
    (pm_role_id, 'qc_gates', 'read'), (pm_role_id, 'qc_gates', 'write'),
    (pm_role_id, 'technical_specs', 'read'), (pm_role_id, 'technical_specs', 'write'),
    (pm_role_id, 'rights_licenses', 'read'), (pm_role_id, 'rights_licenses', 'write'),
    (pm_role_id, 'rental_agreements', 'read'), (pm_role_id, 'rental_agreements', 'write');
END $$;

-- Client permissions
DO $$
DECLARE
    client_role_id UUID;
BEGIN
    SELECT id INTO client_role_id FROM role_definitions WHERE key = 'client' AND is_system = true;

    INSERT INTO permission_grants (role_definition_id, resource, action) VALUES
    (client_role_id, 'dashboard', 'read'),
    (client_role_id, 'projects', 'read'),
    (client_role_id, 'events', 'read'),
    (client_role_id, 'activations', 'read'),
    (client_role_id, 'decks', 'read'),
    (client_role_id, 'approvals', 'read'), (client_role_id, 'approvals', 'write'),
    (client_role_id, 'brand', 'read'),
    (client_role_id, 'case_studies', 'read'),
    (client_role_id, 'calendar', 'read'),
    (client_role_id, 'org_chart', 'read'),
    (client_role_id, 'contracts', 'read'),
    (client_role_id, 'invoices', 'read'),
    (client_role_id, 'client_invoices', 'read'),
    (client_role_id, 'proposals', 'read'),
    (client_role_id, 'call_sheets', 'read'),
    (client_role_id, 'documents', 'read'),
    (client_role_id, 'client_portal', 'read'),
    (client_role_id, 'opportunities', 'read'),
    (client_role_id, 'accounts', 'read'),
    (client_role_id, 'revenue', 'read'),
    (client_role_id, 'change_orders', 'read'),
    (client_role_id, 'digital_assets', 'read'),
    (client_role_id, 'user_management', 'read'),
    (client_role_id, 'creative_briefs', 'read'), (client_role_id, 'creative_briefs', 'write'),
    (client_role_id, 'brand_guidelines', 'read'), (client_role_id, 'brand_guidelines', 'write'),
    (client_role_id, 'campaigns', 'read'), (client_role_id, 'campaigns', 'write'),
    (client_role_id, 'creative_reviews', 'read'), (client_role_id, 'creative_reviews', 'write'),
    (client_role_id, 'insurance_policies', 'read'),
    (client_role_id, 'obligations', 'read'),
    (client_role_id, 'permits', 'read'),
    (client_role_id, 'live_events', 'read'),
    (client_role_id, 'ros_cues', 'read'),
    (client_role_id, 'vip_guests', 'read'),
    (client_role_id, 'post_event_reports', 'read'),
    (client_role_id, 'spatial_locations', 'read'),
    (client_role_id, 'space_bookings', 'read'),
    (client_role_id, 'data_export', 'read'), (client_role_id, 'data_export', 'write'),
    (client_role_id, 'work_packages', 'read'),
    (client_role_id, 'qc_gates', 'read'), (client_role_id, 'qc_gates', 'write'),
    (client_role_id, 'rental_agreements', 'read'),
    (client_role_id, 'rights_licenses', 'read');
END $$;

-- Vendor permissions
DO $$
DECLARE
    vendor_role_id UUID;
BEGIN
    SELECT id INTO vendor_role_id FROM role_definitions WHERE key = 'vendor' AND is_system = true;

    INSERT INTO permission_grants (role_definition_id, resource, action) VALUES
    (vendor_role_id, 'tasks', 'read'),
    (vendor_role_id, 'schedule', 'read'),
    (vendor_role_id, 'vault', 'read'),
    (vendor_role_id, 'contracts', 'read'),
    (vendor_role_id, 'call_sheets', 'read'),
    (vendor_role_id, 'tech_sheets', 'read'),
    (vendor_role_id, 'work_orders', 'read'), (vendor_role_id, 'work_orders', 'write'),
    (vendor_role_id, 'dispatch', 'read'),
    (vendor_role_id, 'checklists', 'read'), (vendor_role_id, 'checklists', 'write'),
    (vendor_role_id, 'vendor_compliance', 'read'), (vendor_role_id, 'vendor_compliance', 'write'),
    (vendor_role_id, 'vendor_portal', 'read'),
    (vendor_role_id, 'digital_assets', 'read'),
    (vendor_role_id, 'insurance_policies', 'read'), (vendor_role_id, 'insurance_policies', 'write'),
    (vendor_role_id, 'certifications', 'read'),
    (vendor_role_id, 'compliance_checklists', 'read'),
    (vendor_role_id, 'live_events', 'read'),
    (vendor_role_id, 'equipment_check_ins', 'read'), (vendor_role_id, 'equipment_check_ins', 'write'),
    (vendor_role_id, 'strike_sequences', 'read'),
    (vendor_role_id, 'asset_reconciliation', 'read'),
    (vendor_role_id, 'spatial_locations', 'read'),
    (vendor_role_id, 'scan_log', 'read'), (vendor_role_id, 'scan_log', 'write'),
    (vendor_role_id, 'asset_damage', 'read'), (vendor_role_id, 'asset_damage', 'write'),
    (vendor_role_id, 'work_packages', 'read'),
    (vendor_role_id, 'qc_gates', 'read'), (vendor_role_id, 'qc_gates', 'write'),
    (vendor_role_id, 'technical_specs', 'read'),
    (vendor_role_id, 'production_runs', 'read');
END $$;
