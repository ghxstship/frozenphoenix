-- ============================================================
-- RECONCILIATION_QUERIES.sql
-- FP-DATA-BEDROCK-001 · Phase 9 Companion (Updated)
-- Run these queries periodically to detect data integrity issues
-- ============================================================

-- ============================================================
-- 1. Organization ID Consistency Check
-- Verify child tables have matching organization_id with parent
-- ============================================================

-- Tasks vs Projects
SELECT t.id AS task_id, t.organization_id AS task_org, p.organization_id AS project_org
FROM tasks t
JOIN projects p ON t.project_id = p.id
WHERE t.organization_id != p.organization_id;

-- Budget Line Items vs Budgets
SELECT bli.id, bli.organization_id AS item_org, b.organization_id AS budget_org
FROM budget_line_items bli
JOIN budgets b ON bli.budget_id = b.id
WHERE bli.organization_id != b.organization_id;

-- Time Entries vs Projects
SELECT te.id, te.organization_id AS te_org, p.organization_id AS project_org
FROM time_entries te
JOIN projects p ON te.project_id = p.id
WHERE te.project_id IS NOT NULL AND te.organization_id != p.organization_id;

-- ============================================================
-- 2. Stale Cached Name Detection
-- ============================================================

-- Schedule entries with stale location names
SELECT se.id, se.location_name, l.name AS current_name
FROM schedule_entries se
JOIN locations l ON se.location_id = l.id
WHERE se.location_name IS NOT NULL AND se.location_name != l.name;

-- Shipments with stale carrier names
SELECT s.id, s.carrier_name, v.name AS current_name
FROM shipments s
JOIN vendors v ON s.carrier_id = v.id
WHERE s.carrier_name IS NOT NULL AND s.carrier_name != v.name;

-- ============================================================
-- 3. Junction Table Orphan Detection
-- Verify junction table entries reference valid parent records
-- ============================================================

-- Message mentions with orphaned user_ids
SELECT mm.id, mm.message_id, mm.user_id
FROM message_mentions mm
WHERE NOT EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = mm.user_id);

-- Approval step approvers with orphaned user_ids
SELECT asa.id, asa.step_id, asa.user_id
FROM approval_step_approvers asa
WHERE NOT EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = asa.user_id);

-- Feature flag user targets with orphaned user_ids
SELECT fft.id, fft.flag_id, fft.user_id
FROM feature_flag_user_targets fft
WHERE NOT EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = fft.user_id);

-- Work order crew with orphaned crew_member_ids
SELECT woc.id, woc.work_order_id, woc.crew_member_id
FROM work_order_crew woc
WHERE NOT EXISTS (SELECT 1 FROM crew_members cm WHERE cm.id = woc.crew_member_id);

-- ============================================================
-- 4. Custom Field Duplicate Value Detection
-- Find entities with multiple values for the same field definition
-- (Should return 0 rows — UNIQUE constraint enforced)
-- ============================================================

SELECT field_definition_id, entity_id, entity_type, COUNT(*) as dupes
FROM custom_field_values
GROUP BY field_definition_id, entity_id, entity_type
HAVING COUNT(*) > 1;

-- ============================================================
-- 5. Missing FK Reference Detection (Polymorphic)
-- Spot-check that entity_id values actually exist in their target table
-- ============================================================

-- Record comments referencing non-existent projects
SELECT rc.id, rc.entity_id, rc.entity_type
FROM record_comments rc
WHERE rc.entity_type = 'project'
    AND NOT EXISTS (SELECT 1 FROM projects p WHERE p.id = rc.entity_id::uuid);

-- ============================================================
-- 6. RLS Coverage Validation
-- Verify all tables with organization_id have RLS enabled
-- ============================================================

SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN (
        SELECT table_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND column_name = 'organization_id'
    )
    AND tablename NOT IN (
        SELECT tablename
        FROM pg_tables t
        JOIN pg_class c ON c.relname = t.tablename
        WHERE c.relrowsecurity = true
    );

-- ============================================================
-- 7. Junction Table Data Integrity
-- Verify junction tables have no duplicate entries
-- ============================================================

-- Check for duplicate message mentions
SELECT message_id, user_id, COUNT(*) as dupes
FROM message_mentions
GROUP BY message_id, user_id
HAVING COUNT(*) > 1;

-- Check for duplicate approval step approvers
SELECT step_id, user_id, COUNT(*) as dupes
FROM approval_step_approvers
GROUP BY step_id, user_id
HAVING COUNT(*) > 1;
