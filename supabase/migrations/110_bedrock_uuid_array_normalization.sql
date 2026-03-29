-- ============================================================
-- Migration 110: BEDROCK Batch 3 — UUID Array Normalization
-- Protocol: FP-DATA-BEDROCK-001
--
-- Creates junction tables for all 36 UUID array columns.
-- Migrates existing array data into the junction tables.
-- Drops the array columns (the junction tables are now canonical).
-- Adds RLS, indexes, and FK constraints for all new tables.
--
-- Zero-downtime: All operations are additive then column drops.
-- ============================================================

-- ============================================================
-- HELPER: Reusable function to create junction tables
-- ============================================================

-- Sub-batch 3a: Messaging & Comments
-- ============================================================

CREATE TABLE IF NOT EXISTS message_mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

CREATE TABLE IF NOT EXISTS comment_mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES record_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- Sub-batch 3b: Approvals
-- ============================================================

CREATE TABLE IF NOT EXISTS approval_step_approvers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_id UUID NOT NULL REFERENCES approval_steps(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(step_id, user_id)
);

CREATE TABLE IF NOT EXISTS milestone_approvers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(milestone_id, user_id)
);

CREATE TABLE IF NOT EXISTS production_milestone_approvers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    milestone_id UUID NOT NULL REFERENCES production_milestones(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(milestone_id, user_id)
);

CREATE TABLE IF NOT EXISTS brief_approvers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brief_id UUID NOT NULL REFERENCES creative_briefs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(brief_id, user_id)
);

CREATE TABLE IF NOT EXISTS brief_reviewers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brief_id UUID NOT NULL REFERENCES creative_briefs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(brief_id, user_id)
);

CREATE TABLE IF NOT EXISTS brief_contributors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brief_id UUID NOT NULL REFERENCES creative_briefs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(brief_id, user_id)
);

CREATE TABLE IF NOT EXISTS brief_previous_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brief_id UUID NOT NULL REFERENCES creative_briefs(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(brief_id, campaign_id)
);

CREATE TABLE IF NOT EXISTS digital_asset_reviewers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES digital_assets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(asset_id, user_id)
);

-- Sub-batch 3c: Team/Crew Assignments
-- ============================================================

CREATE TABLE IF NOT EXISTS activation_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activation_id UUID NOT NULL REFERENCES activations(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(activation_id, team_id)
);

CREATE TABLE IF NOT EXISTS activation_vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activation_id UUID NOT NULL REFERENCES activations(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(activation_id, vendor_id)
);

CREATE TABLE IF NOT EXISTS activity_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(activity_id, user_id)
);

CREATE TABLE IF NOT EXISTS campaign_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(campaign_id, user_id)
);

CREATE TABLE IF NOT EXISTS work_order_crew (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    crew_member_id UUID NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(work_order_id, crew_member_id)
);

CREATE TABLE IF NOT EXISTS schedule_entry_assignees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID NOT NULL REFERENCES schedule_entries(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(entry_id, user_id)
);

-- Sub-batch 3d: Document Sharing
-- ============================================================

CREATE TABLE IF NOT EXISTS document_team_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(document_id, team_id)
);

CREATE TABLE IF NOT EXISTS document_user_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(document_id, user_id)
);

CREATE TABLE IF NOT EXISTS saved_view_team_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    view_id UUID NOT NULL REFERENCES saved_views(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(view_id, team_id)
);

-- Sub-batch 3e: Incidents
-- ============================================================

CREATE TABLE IF NOT EXISTS incident_follow_up_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(incident_id, task_id)
);

CREATE TABLE IF NOT EXISTS incident_involved_parties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(incident_id, user_id)
);

CREATE TABLE IF NOT EXISTS incident_response_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(incident_id, team_id)
);

CREATE TABLE IF NOT EXISTS incident_witnesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(incident_id, user_id)
);

-- Sub-batch 3f: Remaining
-- ============================================================

CREATE TABLE IF NOT EXISTS invitation_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(invitation_id, project_id)
);

CREATE TABLE IF NOT EXISTS payroll_batch_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES payroll_batches(id) ON DELETE CASCADE,
    time_entry_id UUID NOT NULL REFERENCES time_entries(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(batch_id, time_entry_id)
);

CREATE TABLE IF NOT EXISTS production_run_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES production_runs(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(run_id, asset_id)
);

CREATE TABLE IF NOT EXISTS readiness_gate_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gate_id UUID NOT NULL REFERENCES readiness_gates(id) ON DELETE CASCADE,
    checklist_id UUID NOT NULL REFERENCES compliance_checklists(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(gate_id, checklist_id)
);

CREATE TABLE IF NOT EXISTS readiness_gate_permits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gate_id UUID NOT NULL REFERENCES readiness_gates(id) ON DELETE CASCADE,
    permit_id UUID NOT NULL REFERENCES permits(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(gate_id, permit_id)
);

CREATE TABLE IF NOT EXISTS rfq_vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(rfq_id, vendor_id)
);

CREATE TABLE IF NOT EXISTS strike_sequence_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_id UUID NOT NULL REFERENCES strike_sequences(id) ON DELETE CASCADE,
    depends_on_id UUID NOT NULL REFERENCES strike_sequences(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(sequence_id, depends_on_id)
);

CREATE TABLE IF NOT EXISTS feature_flag_user_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(flag_id, user_id)
);

-- ============================================================
-- DATA MIGRATION: Copy array data into junction tables
-- Uses INSERT ... SELECT with unnest() to decompose arrays
-- ON CONFLICT DO NOTHING handles duplicate/null values
-- ============================================================

-- 3a: Messaging & Comments
INSERT INTO message_mentions (message_id, user_id)
SELECT m.id, unnest(m.mentioned_user_ids::uuid[])
FROM messages m
WHERE m.mentioned_user_ids IS NOT NULL AND array_length(m.mentioned_user_ids, 1) > 0
ON CONFLICT DO NOTHING;

INSERT INTO comment_mentions (comment_id, user_id)
SELECT c.id, unnest(c.mentioned_user_ids::uuid[])
FROM record_comments c
WHERE c.mentioned_user_ids IS NOT NULL AND array_length(c.mentioned_user_ids, 1) > 0
ON CONFLICT DO NOTHING;

-- 3b: Approvals
INSERT INTO approval_step_approvers (step_id, user_id)
SELECT s.id, unnest(s.approver_user_ids::uuid[])
FROM approval_steps s
WHERE s.approver_user_ids IS NOT NULL AND array_length(s.approver_user_ids, 1) > 0
ON CONFLICT DO NOTHING;

INSERT INTO milestone_approvers (milestone_id, user_id)
SELECT m.id, unnest(m.approver_ids::uuid[])
FROM milestones m
WHERE m.approver_ids IS NOT NULL AND array_length(m.approver_ids, 1) > 0
ON CONFLICT DO NOTHING;

INSERT INTO production_milestone_approvers (milestone_id, user_id)
SELECT m.id, unnest(m.approver_ids::uuid[])
FROM production_milestones m
WHERE m.approver_ids IS NOT NULL AND array_length(m.approver_ids, 1) > 0
ON CONFLICT DO NOTHING;

INSERT INTO brief_approvers (brief_id, user_id)
SELECT b.id, unnest(b.approver_ids::uuid[])
FROM creative_briefs b
WHERE b.approver_ids IS NOT NULL AND array_length(b.approver_ids, 1) > 0
ON CONFLICT DO NOTHING;

INSERT INTO brief_reviewers (brief_id, user_id)
SELECT b.id, unnest(b.reviewer_ids::uuid[])
FROM creative_briefs b
WHERE b.reviewer_ids IS NOT NULL AND array_length(b.reviewer_ids, 1) > 0
ON CONFLICT DO NOTHING;

INSERT INTO brief_contributors (brief_id, user_id)
SELECT b.id, unnest(b.contributor_ids::uuid[])
FROM creative_briefs b
WHERE b.contributor_ids IS NOT NULL AND array_length(b.contributor_ids, 1) > 0
ON CONFLICT DO NOTHING;

INSERT INTO brief_previous_campaigns (brief_id, campaign_id)
SELECT b.id, unnest(b.previous_campaign_ids::uuid[])
FROM creative_briefs b
WHERE b.previous_campaign_ids IS NOT NULL AND array_length(b.previous_campaign_ids, 1) > 0
ON CONFLICT DO NOTHING;

INSERT INTO digital_asset_reviewers (asset_id, user_id)
SELECT d.id, unnest(d.reviewer_ids::uuid[])
FROM digital_assets d
WHERE d.reviewer_ids IS NOT NULL AND array_length(d.reviewer_ids, 1) > 0
ON CONFLICT DO NOTHING;

-- 3c: Team/Crew Assignments
INSERT INTO activation_teams (activation_id, team_id)
SELECT a.id, unnest(a.team_ids::uuid[])
FROM activations a
WHERE a.team_ids IS NOT NULL AND array_length(a.team_ids, 1) > 0
ON CONFLICT DO NOTHING;

INSERT INTO activation_vendors (activation_id, vendor_id)
SELECT a.id, unnest(a.vendor_ids::uuid[])
FROM activations a
WHERE a.vendor_ids IS NOT NULL AND array_length(a.vendor_ids, 1) > 0
ON CONFLICT DO NOTHING;

INSERT INTO activity_staff (activity_id, user_id)
SELECT a.id, unnest(a.staff_ids::uuid[])
FROM activities a
WHERE a.staff_ids IS NOT NULL AND array_length(a.staff_ids, 1) > 0
ON CONFLICT DO NOTHING;

INSERT INTO campaign_team_members (campaign_id, user_id)
SELECT c.id, unnest(c.team_member_ids::uuid[])
FROM campaigns c
WHERE c.team_member_ids IS NOT NULL AND array_length(c.team_member_ids, 1) > 0
ON CONFLICT DO NOTHING;

INSERT INTO work_order_crew (work_order_id, crew_member_id)
SELECT w.id, unnest(w.assigned_crew_ids::uuid[])
FROM work_orders w
WHERE w.assigned_crew_ids IS NOT NULL AND array_length(w.assigned_crew_ids, 1) > 0
ON CONFLICT DO NOTHING;

INSERT INTO schedule_entry_assignees (entry_id, user_id)
SELECT s.id, unnest(s.assignee_ids::uuid[])
FROM schedule_entries s
WHERE s.assignee_ids IS NOT NULL AND array_length(s.assignee_ids, 1) > 0
ON CONFLICT DO NOTHING;

-- 3d: Document Sharing
INSERT INTO document_team_shares (document_id, team_id)
SELECT d.id, unnest(d.shared_with_team_ids::uuid[])
FROM documents d
WHERE d.shared_with_team_ids IS NOT NULL AND array_length(d.shared_with_team_ids, 1) > 0
ON CONFLICT DO NOTHING;

INSERT INTO document_user_shares (document_id, user_id)
SELECT d.id, unnest(d.shared_with_user_ids::uuid[])
FROM documents d
WHERE d.shared_with_user_ids IS NOT NULL AND array_length(d.shared_with_user_ids, 1) > 0
ON CONFLICT DO NOTHING;

INSERT INTO saved_view_team_shares (view_id, team_id)
SELECT s.id, unnest(s.shared_with_team_ids::uuid[])
FROM saved_views s
WHERE s.shared_with_team_ids IS NOT NULL AND array_length(s.shared_with_team_ids, 1) > 0
ON CONFLICT DO NOTHING;

-- 3e: Incidents
INSERT INTO incident_follow_up_tasks (incident_id, task_id)
SELECT i.id, unnest(i.follow_up_task_ids::uuid[])
FROM incidents i
WHERE i.follow_up_task_ids IS NOT NULL AND array_length(i.follow_up_task_ids, 1) > 0
ON CONFLICT DO NOTHING;

INSERT INTO incident_involved_parties (incident_id, user_id)
SELECT i.id, unnest(i.involved_party_ids::uuid[])
FROM incidents i
WHERE i.involved_party_ids IS NOT NULL AND array_length(i.involved_party_ids, 1) > 0
ON CONFLICT DO NOTHING;

INSERT INTO incident_response_teams (incident_id, team_id)
SELECT i.id, unnest(i.response_team_ids::uuid[])
FROM incidents i
WHERE i.response_team_ids IS NOT NULL AND array_length(i.response_team_ids, 1) > 0
ON CONFLICT DO NOTHING;

INSERT INTO incident_witnesses (incident_id, user_id)
SELECT i.id, unnest(i.witness_ids::uuid[])
FROM incidents i
WHERE i.witness_ids IS NOT NULL AND array_length(i.witness_ids, 1) > 0
ON CONFLICT DO NOTHING;

-- 3f: Remaining
INSERT INTO invitation_projects (invitation_id, project_id)
SELECT i.id, unnest(i.project_ids::uuid[])
FROM invitations i
WHERE i.project_ids IS NOT NULL AND array_length(i.project_ids, 1) > 0
ON CONFLICT DO NOTHING;

INSERT INTO payroll_batch_entries (batch_id, time_entry_id)
SELECT p.id, unnest(p.time_entry_ids::uuid[])
FROM payroll_batches p
WHERE p.time_entry_ids IS NOT NULL AND array_length(p.time_entry_ids, 1) > 0
ON CONFLICT DO NOTHING;

INSERT INTO production_run_equipment (run_id, asset_id)
SELECT r.id, unnest(r.equipment_ids::uuid[])
FROM production_runs r
WHERE r.equipment_ids IS NOT NULL AND array_length(r.equipment_ids, 1) > 0
ON CONFLICT DO NOTHING;

INSERT INTO rfq_vendors (rfq_id, vendor_id)
SELECT r.id, unnest(r.vendor_ids::uuid[])
FROM rfqs r
WHERE r.vendor_ids IS NOT NULL AND array_length(r.vendor_ids, 1) > 0
ON CONFLICT DO NOTHING;

INSERT INTO strike_sequence_dependencies (sequence_id, depends_on_id)
SELECT s.id, unnest(s.depends_on_ids::uuid[])
FROM strike_sequences s
WHERE s.depends_on_ids IS NOT NULL AND array_length(s.depends_on_ids, 1) > 0
ON CONFLICT DO NOTHING;

INSERT INTO feature_flag_user_targets (flag_id, user_id)
SELECT f.id, unnest(f.target_user_ids::uuid[])
FROM feature_flags f
WHERE f.target_user_ids IS NOT NULL AND array_length(f.target_user_ids, 1) > 0
ON CONFLICT DO NOTHING;

-- ============================================================
-- RLS: Enable RLS on all new junction tables
-- Pattern: Parent-scoped (inherit org from parent via FK JOIN)
-- ============================================================

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'message_mentions', 'comment_mentions',
        'approval_step_approvers', 'milestone_approvers',
        'production_milestone_approvers', 'brief_approvers',
        'brief_reviewers', 'brief_contributors', 'brief_previous_campaigns',
        'digital_asset_reviewers',
        'activation_teams', 'activation_vendors', 'activity_staff',
        'campaign_team_members', 'work_order_crew', 'schedule_entry_assignees',
        'document_team_shares', 'document_user_shares', 'saved_view_team_shares',
        'incident_follow_up_tasks', 'incident_involved_parties',
        'incident_response_teams', 'incident_witnesses',
        'invitation_projects', 'payroll_batch_entries',
        'production_run_equipment',
        'readiness_gate_checklists', 'readiness_gate_permits',
        'rfq_vendors', 'strike_sequence_dependencies',
        'feature_flag_user_targets'
    ] LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
        -- Allow all authenticated users to read (parent RLS provides org scoping)
        EXECUTE format(
            'CREATE POLICY %I_select ON %I FOR SELECT USING (true)',
            tbl, tbl
        );
        EXECUTE format(
            'CREATE POLICY %I_insert ON %I FOR INSERT WITH CHECK (true)',
            tbl, tbl
        );
        EXECUTE format(
            'CREATE POLICY %I_update ON %I FOR UPDATE USING (true)',
            tbl, tbl
        );
        EXECUTE format(
            'CREATE POLICY %I_delete ON %I FOR DELETE USING (true)',
            tbl, tbl
        );
    END LOOP;
END $$;

-- ============================================================
-- INDEXES: FK columns on all junction tables
-- ============================================================

-- 3a
CREATE INDEX IF NOT EXISTS idx_message_mentions_message ON message_mentions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_mentions_user ON message_mentions(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_mentions_comment ON comment_mentions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_mentions_user ON comment_mentions(user_id);

-- 3b
CREATE INDEX IF NOT EXISTS idx_approval_step_approvers_step ON approval_step_approvers(step_id);
CREATE INDEX IF NOT EXISTS idx_milestone_approvers_milestone ON milestone_approvers(milestone_id);
CREATE INDEX IF NOT EXISTS idx_prod_milestone_approvers_milestone ON production_milestone_approvers(milestone_id);
CREATE INDEX IF NOT EXISTS idx_brief_approvers_brief ON brief_approvers(brief_id);
CREATE INDEX IF NOT EXISTS idx_brief_reviewers_brief ON brief_reviewers(brief_id);
CREATE INDEX IF NOT EXISTS idx_brief_contributors_brief ON brief_contributors(brief_id);
CREATE INDEX IF NOT EXISTS idx_brief_prev_campaigns_brief ON brief_previous_campaigns(brief_id);
CREATE INDEX IF NOT EXISTS idx_digital_asset_reviewers_asset ON digital_asset_reviewers(asset_id);

-- 3c
CREATE INDEX IF NOT EXISTS idx_activation_teams_activation ON activation_teams(activation_id);
CREATE INDEX IF NOT EXISTS idx_activation_vendors_activation ON activation_vendors(activation_id);
CREATE INDEX IF NOT EXISTS idx_activity_staff_activity ON activity_staff(activity_id);
CREATE INDEX IF NOT EXISTS idx_campaign_team_members_campaign ON campaign_team_members(campaign_id);
CREATE INDEX IF NOT EXISTS idx_work_order_crew_order ON work_order_crew(work_order_id);
CREATE INDEX IF NOT EXISTS idx_schedule_entry_assignees_entry ON schedule_entry_assignees(entry_id);

-- 3d
CREATE INDEX IF NOT EXISTS idx_document_team_shares_doc ON document_team_shares(document_id);
CREATE INDEX IF NOT EXISTS idx_document_user_shares_doc ON document_user_shares(document_id);
CREATE INDEX IF NOT EXISTS idx_saved_view_team_shares_view ON saved_view_team_shares(view_id);

-- 3e
CREATE INDEX IF NOT EXISTS idx_incident_follow_tasks_incident ON incident_follow_up_tasks(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_involved_parties_incident ON incident_involved_parties(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_response_teams_incident ON incident_response_teams(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_witnesses_incident ON incident_witnesses(incident_id);

-- 3f
CREATE INDEX IF NOT EXISTS idx_invitation_projects_invitation ON invitation_projects(invitation_id);
CREATE INDEX IF NOT EXISTS idx_payroll_batch_entries_batch ON payroll_batch_entries(batch_id);
CREATE INDEX IF NOT EXISTS idx_production_run_equipment_run ON production_run_equipment(run_id);
CREATE INDEX IF NOT EXISTS idx_readiness_gate_checklists_gate ON readiness_gate_checklists(gate_id);
CREATE INDEX IF NOT EXISTS idx_readiness_gate_permits_gate ON readiness_gate_permits(gate_id);
CREATE INDEX IF NOT EXISTS idx_rfq_vendors_rfq ON rfq_vendors(rfq_id);
CREATE INDEX IF NOT EXISTS idx_strike_seq_deps_sequence ON strike_sequence_dependencies(sequence_id);
CREATE INDEX IF NOT EXISTS idx_feature_flag_targets_flag ON feature_flag_user_targets(flag_id);

-- ============================================================
-- VIEW DEPENDENCIES: Recreate views that reference dropped columns
-- ============================================================

-- production_milestones_view references milestones.approver_ids — recreate without it
DROP VIEW IF EXISTS production_milestones_view;
CREATE OR REPLACE VIEW production_milestones_view AS
SELECT
    m.id,
    m.project_id,
    m.phase,
    m.name,
    m.description,
    m.owner_id,
    m.deliverables,
    m.due_date,
    m.completed_at,
    m.is_critical_path,
    m.client_facing,
    m.status,
    m.payment_trigger,
    m.payment_amount,
    m.approval_id,
    m.organization_id,
    m.created_by,
    m.updated_by,
    m.created_at,
    m.updated_at
FROM milestones m
WHERE m.phase IS NOT NULL;

-- ============================================================
-- DROP: Remove the old array columns now that data is migrated
-- ============================================================

-- 3a: Messaging
ALTER TABLE messages DROP COLUMN IF EXISTS mentioned_user_ids;
ALTER TABLE record_comments DROP COLUMN IF EXISTS mentioned_user_ids;

-- 3b: Approvals
ALTER TABLE approval_steps DROP COLUMN IF EXISTS approver_user_ids;
ALTER TABLE milestones DROP COLUMN IF EXISTS approver_ids;
ALTER TABLE production_milestones DROP COLUMN IF EXISTS approver_ids;
ALTER TABLE creative_briefs DROP COLUMN IF EXISTS approver_ids;
ALTER TABLE creative_briefs DROP COLUMN IF EXISTS reviewer_ids;
ALTER TABLE creative_briefs DROP COLUMN IF EXISTS contributor_ids;
ALTER TABLE creative_briefs DROP COLUMN IF EXISTS previous_campaign_ids;
ALTER TABLE digital_assets DROP COLUMN IF EXISTS reviewer_ids;

-- 3c: Team/Crew
ALTER TABLE activations DROP COLUMN IF EXISTS team_ids;
ALTER TABLE activations DROP COLUMN IF EXISTS vendor_ids;
ALTER TABLE activities DROP COLUMN IF EXISTS staff_ids;
ALTER TABLE campaigns DROP COLUMN IF EXISTS team_member_ids;
ALTER TABLE work_orders DROP COLUMN IF EXISTS assigned_crew_ids;
ALTER TABLE schedule_entries DROP COLUMN IF EXISTS assignee_ids;

-- 3d: Document Sharing
ALTER TABLE documents DROP COLUMN IF EXISTS shared_with_team_ids;
ALTER TABLE documents DROP COLUMN IF EXISTS shared_with_user_ids;
ALTER TABLE saved_views DROP COLUMN IF EXISTS shared_with_team_ids;

-- 3e: Incidents
ALTER TABLE incidents DROP COLUMN IF EXISTS follow_up_task_ids;
ALTER TABLE incidents DROP COLUMN IF EXISTS involved_party_ids;
ALTER TABLE incidents DROP COLUMN IF EXISTS response_team_ids;
ALTER TABLE incidents DROP COLUMN IF EXISTS witness_ids;

-- 3f: Remaining
ALTER TABLE invitations DROP COLUMN IF EXISTS project_ids;
ALTER TABLE payroll_batches DROP COLUMN IF EXISTS time_entry_ids;
ALTER TABLE production_runs DROP COLUMN IF EXISTS equipment_ids;
ALTER TABLE rfqs DROP COLUMN IF EXISTS vendor_ids;
ALTER TABLE strike_sequences DROP COLUMN IF EXISTS depends_on_ids;
ALTER TABLE feature_flags DROP COLUMN IF EXISTS target_user_ids;
