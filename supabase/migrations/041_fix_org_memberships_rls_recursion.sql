-- ═══════════════════════════════════════════════════════════════════════════
-- FIX: Infinite recursion in org_memberships RLS policies
-- ═══════════════════════════════════════════════════════════════════════════
-- ROOT CAUSE: The "Org exec can manage memberships" policy on org_memberships
-- does SELECT ... FROM org_memberships in its USING clause. When any other
-- table's RLS policy also queries org_memberships (settings, brands,
-- organizations, etc.), it triggers org_memberships RLS evaluation, which
-- hits this self-referencing policy → infinite recursion (PostgreSQL 42P17).
--
-- FIX: Replace all inline `SELECT ... FROM org_memberships` subqueries in
-- RLS policies with calls to SECURITY DEFINER helper functions that bypass
-- RLS. Migration 018 already defines get_user_org_ids() (returns UUID[])
-- and get_user_role_in_org() as SECURITY DEFINER. We add two more helpers
-- for exec-only and admin (exec+director+pm) org lookups.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: ADDITIONAL SECURITY DEFINER HELPER FUNCTIONS
-- get_user_org_ids() already exists from migration 018 (returns UUID[]).
-- We add exec-only and admin variants.
-- ─────────────────────────────────────────────────────────────────────────────

-- Returns org IDs where the current user is exec
CREATE OR REPLACE FUNCTION get_user_exec_org_ids()
RETURNS UUID[] AS $$
    SELECT COALESCE(
        ARRAY(
            SELECT organization_id
            FROM org_memberships
            WHERE user_id = auth.uid()
              AND status = 'active'
              AND role = 'exec'
              AND (expires_at IS NULL OR expires_at > NOW())
        ),
        '{}'::UUID[]
    )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Returns org IDs where the current user is exec, director, or pm
CREATE OR REPLACE FUNCTION get_user_admin_org_ids()
RETURNS UUID[] AS $$
    SELECT COALESCE(
        ARRAY(
            SELECT organization_id
            FROM org_memberships
            WHERE user_id = auth.uid()
              AND status = 'active'
              AND role IN ('exec', 'director', 'pm')
              AND (expires_at IS NULL OR expires_at > NOW())
        ),
        '{}'::UUID[]
    )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: FIX org_memberships OWN POLICIES (migration 018)
-- Replace self-referencing "Org exec can manage memberships"
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Org exec can manage memberships" ON org_memberships;

CREATE POLICY "Org exec can manage memberships" ON org_memberships
    FOR ALL USING (
        organization_id = ANY(get_user_exec_org_ids())
    );

-- "Users can view own memberships" — already safe (user_id = auth.uid()), no change.
-- "Users can create own membership" (036) — INSERT WITH CHECK, already safe.

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: FIX invitations policies (migration 018)
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Org admins can manage invitations" ON invitations;

CREATE POLICY "Org admins can manage invitations" ON invitations
    FOR ALL USING (
        organization_id = ANY(get_user_admin_org_ids())
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: FIX temporary_access_grants policy (migration 018)
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'temporary_access_grants') THEN
        DROP POLICY IF EXISTS "Exec can manage grants" ON temporary_access_grants;

        CREATE POLICY "Exec can manage grants" ON temporary_access_grants
            FOR ALL USING (
                organization_id = ANY(get_user_exec_org_ids())
            );
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: FIX role_change_log policy (migration 018)
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'role_change_log') THEN
        DROP POLICY IF EXISTS "Exec can view role changes" ON role_change_log;

        CREATE POLICY "Exec can view role changes" ON role_change_log
            FOR SELECT USING (
                organization_id = ANY(get_user_exec_org_ids())
            );
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6: FIX settings policies (migration 026)
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'settings') THEN
        DROP POLICY IF EXISTS "settings_read" ON settings;
        DROP POLICY IF EXISTS "settings_write" ON settings;
        DROP POLICY IF EXISTS "settings_delete" ON settings;

        CREATE POLICY "settings_read" ON settings
            FOR SELECT USING (
                auth.uid() IS NOT NULL
                AND (
                    scope_type IN ('platform', 'environment')
                    OR (scope_type = 'organization' AND scope_id = ANY(get_user_org_ids()))
                    OR (scope_type = 'user' AND scope_id = auth.uid())
                )
            );

        CREATE POLICY "settings_write" ON settings
            FOR INSERT WITH CHECK (
                auth.uid() IS NOT NULL
                AND (
                    (scope_type = 'user' AND scope_id = auth.uid())
                    OR (scope_type = 'organization' AND scope_id = ANY(get_user_exec_org_ids()))
                )
            );

        CREATE POLICY "settings_delete" ON settings
            FOR DELETE USING (
                auth.uid() IS NOT NULL
                AND (
                    scope_type IN ('platform', 'environment')
                    OR (scope_type = 'organization' AND scope_id = ANY(get_user_exec_org_ids()))
                    OR (scope_type = 'user' AND scope_id = auth.uid())
                )
            );
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 7: FIX role_definitions + permission_grants policies (migration 028)
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'role_definitions') THEN
        DROP POLICY IF EXISTS "role_definitions_read" ON role_definitions;
        DROP POLICY IF EXISTS "role_definitions_manage" ON role_definitions;

        CREATE POLICY "role_definitions_read" ON role_definitions
            FOR SELECT USING (
                auth.uid() IS NOT NULL
                AND (
                    is_system = true
                    OR organization_id = ANY(get_user_org_ids())
                )
            );

        CREATE POLICY "role_definitions_manage" ON role_definitions
            FOR ALL USING (
                auth.uid() IS NOT NULL
                AND is_system = false
                AND organization_id = ANY(get_user_exec_org_ids())
            );
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'permission_grants') THEN
        DROP POLICY IF EXISTS "permission_grants_read" ON permission_grants;
        DROP POLICY IF EXISTS "permission_grants_manage" ON permission_grants;

        CREATE POLICY "permission_grants_read" ON permission_grants
            FOR SELECT USING (
                auth.uid() IS NOT NULL
                AND role_definition_id IN (
                    SELECT id FROM role_definitions
                    WHERE is_system = true
                       OR organization_id = ANY(get_user_org_ids())
                )
            );

        CREATE POLICY "permission_grants_manage" ON permission_grants
            FOR ALL USING (
                auth.uid() IS NOT NULL
                AND role_definition_id IN (
                    SELECT id FROM role_definitions
                    WHERE organization_id = ANY(get_user_exec_org_ids())
                )
            );
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 8: FIX brands policies (migration 029)
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'brands') THEN
        DROP POLICY IF EXISTS "brands_read" ON brands;
        DROP POLICY IF EXISTS "brands_manage" ON brands;

        CREATE POLICY "brands_read" ON brands
            FOR SELECT USING (
                auth.uid() IS NOT NULL
                AND (
                    organization_id IS NULL
                    OR organization_id = ANY(get_user_org_ids())
                )
            );

        CREATE POLICY "brands_manage" ON brands
            FOR ALL USING (
                auth.uid() IS NOT NULL
                AND organization_id = ANY(get_user_exec_org_ids())
            );
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 9: FIX organizations update policy (migration 036)
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Exec members can update organization" ON organizations;

CREATE POLICY "Exec members can update organization" ON organizations
    FOR UPDATE
    TO authenticated
    USING (id = ANY(get_user_exec_org_ids()))
    WITH CHECK (id = ANY(get_user_exec_org_ids()));

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 10: FIX invoices policy (migration 038 overwrote 029)
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices') THEN
        DROP POLICY IF EXISTS "invoices_role_read" ON invoices;

        CREATE POLICY "invoices_role_read" ON invoices
            FOR SELECT USING (
                auth.uid() IS NOT NULL
                AND (
                    is_exec_or_pm()
                    OR (get_user_role() = 'client' AND invoices.organization_id = ANY(get_user_org_ids()))
                    OR (get_user_role() = 'collaborator' AND invoices.vendor_id IN (
                        SELECT id FROM vendors
                        WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
                    ))
                )
            );
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 11: FIX usernames/handles policy (migration 039)
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'handles') THEN
        DROP POLICY IF EXISTS "handles_manage" ON handles;

        CREATE POLICY "handles_manage" ON handles
            FOR ALL
            USING (
                (entity_type = 'user' AND entity_id = auth.uid())
                OR (entity_type = 'organization' AND entity_id = ANY(get_user_exec_org_ids()))
            );
    END IF;
END $$;
