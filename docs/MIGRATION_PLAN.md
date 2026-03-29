# 🚀 MIGRATION_PLAN.md — BEDROCK Remediation Runbook

> **Protocol**: FP-DATA-BEDROCK-001 · Phase 9
> **Generated**: 2026-03-29
> **Last Updated**: 2026-03-29 (Re-Audit Pass)

## Remediation Priority Matrix

| Priority  | Category                              | Count    | Risk               | Effort |
| --------- | ------------------------------------- | -------- | ------------------ | ------ |
| 🔴 **P1** | Custom Field values UNIQUE constraint | 1        | Data corruption    | LOW    |
| 🔴 **P1** | DUAL STORAGE (JSONB + table)          | 2        | SSOT violation     | LOW    |
| 🔴 **P1** | Missing polymorphic indexes           | 5        | Query performance  | LOW    |
| 🟡 **P2** | UUID arrays → junction tables         | 36 cols  | FK enforcement gap | HIGH   |
| 🟡 **P2** | 3NF cached name triggers              | 3        | Stale data         | MEDIUM |
| 🟢 **P3** | JSONB → normalized tables             | 10       | Architectural debt | HIGH   |
| 🟢 **P3** | TEXT CHECK → ENUM conversion          | 43       | Cosmetic           | MEDIUM |
| ⚪ **P4** | Money column precision                | ~55 cols | Cosmetic           | LOW    |
| ⚪ **P4** | Boolean prefix standardization        | 3 cols   | Cosmetic           | LOW    |

---

## ✅ Batch 1: Critical Quick Wins — COMPLETED

### Migration 108: `bedrock_critical_fixes.sql` — Applied

```sql
-- ============================================================
-- BEDROCK: Critical Schema Fixes
-- ============================================================

-- 1. Custom field values UNIQUE constraint
-- Prevents duplicate values for same field+entity
ALTER TABLE custom_field_values
    ADD CONSTRAINT uq_cfv_definition_entity
    UNIQUE (field_definition_id, entity_id);

-- 2. Drop DUAL STORAGE JSONB columns
-- goods_receipts.line_items is redundant with goods_receipt_lines table
ALTER TABLE goods_receipts DROP COLUMN IF EXISTS line_items;
-- shipments.items is redundant with shipment_items table
ALTER TABLE shipments DROP COLUMN IF EXISTS items;

-- 3. Missing polymorphic indexes for detail page performance
CREATE INDEX IF NOT EXISTS idx_custom_field_values_entity
    ON custom_field_values(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_record_comments_entity
    ON record_comments(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_record_activity_log_entity
    ON record_activity_log(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_entity_tag_assignments_entity
    ON entity_tag_assignments(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_schedule_entries_time_range
    ON schedule_entries(start_time, end_time);
```

**Risk**: LOW — additive constraint + column drops on redundant data + index additions.
**Downtime**: ZERO — all operations are non-blocking.

---

## ✅ Batch 2: 3NF Cached Name Triggers — COMPLETED

### Migration 109: `bedrock_cached_name_triggers.sql` — Applied

```sql
-- ============================================================
-- BEDROCK: Sync triggers for cached names (3NF compliance)
-- ============================================================

-- Trigger: When a location name changes, update schedule_entries.location_name
CREATE OR REPLACE FUNCTION sync_schedule_location_name()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.name IS DISTINCT FROM NEW.name THEN
        UPDATE schedule_entries
        SET location_name = NEW.name
        WHERE location_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER sync_schedule_location_name_trigger
    AFTER UPDATE ON locations
    FOR EACH ROW
    EXECUTE FUNCTION sync_schedule_location_name();

-- Trigger: When a vendor name changes, update shipments.carrier_name
CREATE OR REPLACE FUNCTION sync_shipment_carrier_name()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.name IS DISTINCT FROM NEW.name THEN
        UPDATE shipments
        SET carrier_name = NEW.name
        WHERE carrier_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER sync_shipment_carrier_name_trigger
    AFTER UPDATE ON vendors
    FOR EACH ROW
    EXECUTE FUNCTION sync_shipment_carrier_name();
```

**Risk**: LOW — AFTER UPDATE triggers are non-blocking. SECURITY DEFINER needed to bypass RLS.
**Note**: `schedule_entries.reference_name` sync is more complex (polymorphic) and should be handled in Batch 3.

---

## ✅ Batch 3: UUID Array Normalization — COMPLETED

> [!CAUTION]
> UUID array → junction table migrations require:
>
> 1. Creating the new junction table
> 2. Migrating data from arrays to the junction table
> 3. Updating application code (queries, mutations)
> 4. Dropping the old array column
>
> Each batch below should be validated against application code before executing.

### Sub-batch 3a: Messaging & Comments (High Write Frequency)

| Source            | Array Column         | New Junction Table                      |
| ----------------- | -------------------- | --------------------------------------- |
| `messages`        | `mentioned_user_ids` | `message_mentions(message_id, user_id)` |
| `record_comments` | `mentioned_user_ids` | `comment_mentions(comment_id, user_id)` |

### Sub-batch 3b: Approvals (Business Critical)

| Source                  | Array Column        | New Junction Table                                      |
| ----------------------- | ------------------- | ------------------------------------------------------- |
| `approval_steps`        | `approver_user_ids` | `approval_step_approvers(step_id, user_id)`             |
| `milestones`            | `approver_ids`      | `milestone_approvers(milestone_id, user_id)`            |
| `production_milestones` | `approver_ids`      | `production_milestone_approvers(milestone_id, user_id)` |
| `creative_briefs`       | `approver_ids`      | `brief_approvers(brief_id, user_id)`                    |
| `creative_briefs`       | `reviewer_ids`      | `brief_reviewers(brief_id, user_id)`                    |
| `creative_briefs`       | `contributor_ids`   | `brief_contributors(brief_id, user_id)`                 |
| `digital_assets`        | `reviewer_ids`      | `digital_asset_reviewers(asset_id, user_id)`            |

### Sub-batch 3c: Team/Crew Assignments

| Source             | Array Column        | New Junction Table                               |
| ------------------ | ------------------- | ------------------------------------------------ |
| `activations`      | `team_ids`          | `activation_teams(activation_id, team_id)`       |
| `activations`      | `vendor_ids`        | `activation_vendors(activation_id, vendor_id)`   |
| `activities`       | `staff_ids`         | `activity_staff(activity_id, user_id)`           |
| `campaigns`        | `team_member_ids`   | `campaign_team_members(campaign_id, user_id)`    |
| `work_orders`      | `assigned_crew_ids` | `work_order_crew(work_order_id, crew_member_id)` |
| `schedule_entries` | `assignee_ids`      | `schedule_entry_assignees(entry_id, user_id)`    |

### Sub-batch 3d: Document Sharing

| Source        | Array Column           | New Junction Table                           |
| ------------- | ---------------------- | -------------------------------------------- |
| `documents`   | `shared_with_team_ids` | `document_team_shares(document_id, team_id)` |
| `documents`   | `shared_with_user_ids` | `document_user_shares(document_id, user_id)` |
| `saved_views` | `shared_with_team_ids` | `saved_view_team_shares(view_id, team_id)`   |

### Sub-batch 3e: Incidents (Many arrays)

| Source      | Array Column         | New Junction Table                                |
| ----------- | -------------------- | ------------------------------------------------- |
| `incidents` | `follow_up_task_ids` | `incident_follow_up_tasks(incident_id, task_id)`  |
| `incidents` | `involved_party_ids` | `incident_involved_parties(incident_id, user_id)` |
| `incidents` | `response_team_ids`  | `incident_response_teams(incident_id, team_id)`   |
| `incidents` | `witness_ids`        | `incident_witnesses(incident_id, user_id)`        |

### Sub-batch 3f: Remaining

| Source             | Array Column      | New Junction Table                                                   |
| ------------------ | ----------------- | -------------------------------------------------------------------- |
| `contracts`        | `amendment_ids`   | REDUNDANT — already tracked via `contract_amendments.contract_id` FK |
| `invitations`      | `project_ids`     | `invitation_projects(invitation_id, project_id)`                     |
| `payroll_batches`  | `time_entry_ids`  | `payroll_batch_entries(batch_id, time_entry_id)`                     |
| `production_runs`  | `equipment_ids`   | `production_run_equipment(run_id, asset_id)`                         |
| `readiness_gates`  | `checklist_ids`   | `readiness_gate_checklists(gate_id, checklist_id)`                   |
| `readiness_gates`  | `permit_ids`      | `readiness_gate_permits(gate_id, permit_id)`                         |
| `rfqs`             | `vendor_ids`      | `rfq_vendors(rfq_id, vendor_id)`                                     |
| `strike_sequences` | `depends_on_ids`  | `strike_sequence_dependencies(sequence_id, depends_on_id)`           |
| `feature_flags`    | `target_user_ids` | `feature_flag_user_targets(flag_id, user_id)`                        |

---

## ✅ Batch 3.1: Function Repair & Column Drops — COMPLETED

### Migration 111: `bedrock_function_repair_and_column_drops.sql` — Applied

- Fixed `evaluate_feature_flag` — queries `feature_flag_user_targets` junction table
- Fixed `convert_deal_to_project` — removed stale `client` column, uses `client_company_id`
- Fixed `check_three_way_match` — queries `goods_receipt_lines` table instead of dropped JSONB
- Fixed `create_org_and_membership` — removed stale `profiles` table reference
- Fixed `erase_user_data` — removed stale `profiles` table reference
- Dropped 5 remaining array columns: `readiness_gates.{checklist_ids, permit_ids}`, `production_sops.{related_sop_ids, form_ids, training_material_ids}`

### Migration 112: `bedrock_function_repair_pass2.sql` — Applied

- Fixed `create_org_and_membership` — removed invalid `UPDATE user_profiles SET organization_id` (column doesn't exist)
- Fixed `erase_user_data` — changed invalid `'removed'` to valid enum value `'revoked'`

---

## ✅ Batch 3.2: Function Type-Cast Fixes — COMPLETED

### Migration 113: `bedrock_function_typecast_fixes.sql` — Applied

- Fixed `evaluate_feature_flag` — explicit `::jsonb` casts on all `RETURN 'true'`/`RETURN 'false'` statements
- Fixed `check_three_way_match` — explicit `::three_way_match_status` casts on all RETURN statements

### Application Code Fix (no migration needed)

- Fixed `conversations/[id]/messages/route.ts` — removed dropped `mentioned_user_ids` column from INSERT, added `message_mentions` junction table inserts

---

## Batch 4: JSONB Normalization (Deferred)

> [!NOTE]
> JSONB normalization is lower priority than UUID arrays because JSONB columns don't create orphan data risk. These should be normalized when the respective feature area is actively under development.

| JSONB Column                         | New Table                         | Priority                                |
| ------------------------------------ | --------------------------------- | --------------------------------------- |
| `estimates.line_items`               | `estimate_items`                  | When estimates feature is developed     |
| `rfqs.line_items`                    | `rfq_line_items`                  | When RFQ workflow is developed          |
| `rfqs.responses`                     | `rfq_responses`                   | Same                                    |
| `recurring_invoices.line_items`      | `recurring_invoice_items`         | When recurring billing is active        |
| `purchase_requisitions.line_items`   | `purchase_requisition_items`      | When procurement is active              |
| `production_checklists.items`        | `production_checklist_items`      | When checklists are enhanced            |
| `job_checklists.items`               | `job_checklist_items`             | Same                                    |
| `production_sops.steps`              | `sop_steps`                       | When SOP management is enhanced         |
| `production_milestones.deliverables` | Use existing `brief_deliverables` | When production features mature         |
| `pipelines.stages`                   | `pipeline_stages`                 | When pipeline customization is enhanced |

---

## Pre-Migration Checklist

Before executing any batch:

1. ✅ **Backup**: Take full database backup
2. ✅ **Types**: Run `supabase gen types typescript` after migration
3. ✅ **App Code**: Search `src/` for any references to dropped columns/renamed columns
4. ✅ **Tests**: Run full test suite
5. ✅ **RLS**: Verify new junction tables have RLS policies
6. ✅ **Indexes**: Add FK indexes on new junction tables
7. ✅ **Validation**: Run `074_schema_validation.sql` assertions (update as needed)
