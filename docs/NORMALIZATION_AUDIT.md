# 🔬 NORMALIZATION_AUDIT.md — FrozenPhoenix 3NF Compliance Audit

> **Protocol**: FP-DATA-BEDROCK-001 · Phase 3
> **Generated**: 2026-03-29
> **Last Updated**: 2026-03-29 (Re-Audit)
> **Scope**: 352 tables, 187 JSONB columns, 141 array columns

## Executive Summary

| Normal Form                  | Violations Found                         | Severity           |
| ---------------------------- | ---------------------------------------- | ------------------ |
| **1NF** (Atomicity)          | ~~28 CRITICAL~~ 0 CRITICAL + 83 ADVISORY | ✅ RESOLVED        |
| **2NF** (Full Dependency)    | 0                                        | ✅ CLEAN           |
| **3NF** (No Transitive Deps) | 8                                        | MEDIUM             |
| **SSOT** (No Duplication)    | ~~3~~ 1                                  | ✅ MOSTLY RESOLVED |

---

## 1NF Violations — Atomicity

### ✅ RESOLVED: UUID Array Columns (36 columns → junction tables)

All 36 UUID array columns have been migrated to proper junction tables (Migrations 110-112).
Array columns have been **dropped** from the schema. Junction tables are the canonical SSOT.

- FK constraint enforcement (orphan IDs possible)
- Efficient JOIN queries
- Index-backed lookups
- Cascade delete behavior

| #   | Table                   | Column                  | Expected Junction Table                        | Severity     |
| --- | ----------------------- | ----------------------- | ---------------------------------------------- | ------------ |
| 1   | `activations`           | `team_ids`              | `activation_teams`                             | 🔴 HIGH      |
| 2   | `activations`           | `vendor_ids`            | `activation_vendors`                           | 🔴 HIGH      |
| 3   | `activities`            | `staff_ids`             | `activity_staff`                               | 🔴 HIGH      |
| 4   | `approval_steps`        | `approver_user_ids`     | `approval_step_approvers`                      | 🔴 HIGH      |
| 5   | `campaigns`             | `team_member_ids`       | `campaign_team_members`                        | 🔴 HIGH      |
| 6   | `contracts`             | `amendment_ids`         | Already exists as FKs on `contract_amendments` | 🔴 REDUNDANT |
| 7   | `creative_briefs`       | `approver_ids`          | `brief_approvers`                              | 🔴 HIGH      |
| 8   | `creative_briefs`       | `contributor_ids`       | `brief_contributors`                           | 🔴 HIGH      |
| 9   | `creative_briefs`       | `reviewer_ids`          | `brief_reviewers`                              | 🔴 HIGH      |
| 10  | `creative_briefs`       | `previous_campaign_ids` | `brief_previous_campaigns`                     | 🟡 MEDIUM    |
| 11  | `digital_assets`        | `reviewer_ids`          | `digital_asset_reviewers`                      | 🔴 HIGH      |
| 12  | `documents`             | `shared_with_team_ids`  | `document_team_shares`                         | 🔴 HIGH      |
| 13  | `documents`             | `shared_with_user_ids`  | `document_user_shares`                         | 🔴 HIGH      |
| 14  | `feature_flags`         | `target_user_ids`       | `feature_flag_targets`                         | 🟡 MEDIUM    |
| 15  | `incidents`             | `attachment_ids`        | Already has `incident_insurance_links`         | 🟡 MEDIUM    |
| 16  | `incidents`             | `follow_up_task_ids`    | `incident_follow_up_tasks`                     | 🔴 HIGH      |
| 17  | `incidents`             | `involved_party_ids`    | `incident_involved_parties`                    | 🔴 HIGH      |
| 18  | `incidents`             | `response_team_ids`     | `incident_response_teams`                      | 🔴 HIGH      |
| 19  | `incidents`             | `witness_ids`           | `incident_witnesses`                           | 🔴 HIGH      |
| 20  | `invitations`           | `project_ids`           | `invitation_projects`                          | 🔴 HIGH      |
| 21  | `messages`              | `mentioned_user_ids`    | `message_mentions`                             | 🔴 HIGH      |
| 22  | `milestones`            | `approver_ids`          | `milestone_approvers`                          | 🔴 HIGH      |
| 23  | `payroll_batches`       | `time_entry_ids`        | `payroll_batch_entries`                        | 🔴 HIGH      |
| 24  | `production_milestones` | `approver_ids`          | `production_milestone_approvers`               | 🔴 HIGH      |
| 25  | `production_runs`       | `equipment_ids`         | `production_run_equipment`                     | 🔴 HIGH      |
| 26  | `production_sops`       | `related_sop_ids`       | `sop_relationships`                            | 🟡 MEDIUM    |
| 27  | `production_sops`       | `form_ids`              | `sop_forms`                                    | 🟡 MEDIUM    |
| 28  | `production_sops`       | `training_material_ids` | `sop_training_materials`                       | 🟡 MEDIUM    |
| 29  | `readiness_gates`       | `checklist_ids`         | `readiness_gate_checklists`                    | 🔴 HIGH      |
| 30  | `readiness_gates`       | `permit_ids`            | `readiness_gate_permits`                       | 🔴 HIGH      |
| 31  | `record_comments`       | `mentioned_user_ids`    | `comment_mentions`                             | 🔴 HIGH      |
| 32  | `rfqs`                  | `vendor_ids`            | `rfq_vendors`                                  | 🔴 HIGH      |
| 33  | `saved_views`           | `shared_with_team_ids`  | `saved_view_team_shares`                       | 🔴 HIGH      |
| 34  | `schedule_entries`      | `assignee_ids`          | `schedule_entry_assignees`                     | 🔴 HIGH      |
| 35  | `strike_sequences`      | `depends_on_ids`        | `strike_sequence_dependencies`                 | 🔴 HIGH      |
| 36  | `work_orders`           | `assigned_crew_ids`     | `work_order_crew`                              | 🔴 HIGH      |

> [!NOTE]
> **All 36 UUID array columns have been migrated and dropped.** Junction tables with proper FK constraints, cascade deletes, and RLS policies are now the SSOT. (Migrations 108, 110, 111)

### 🟡 ADVISORY: Non-UUID Array Columns (83 columns)

These array columns store non-referential data (tags, skills, permissions, etc.) and are **acceptable** in most cases:

| Pattern                      | Count | Tables                                                           | Verdict                                       |
| ---------------------------- | ----- | ---------------------------------------------------------------- | --------------------------------------------- |
| `tags TEXT[]`                | 15    | companies, contacts, campaigns, etc.                             | ✅ Acceptable (tags are values, not entities) |
| `skills TEXT[]`              | 2     | crew_members, worker_profiles                                    | ✅ Acceptable                                 |
| `scopes TEXT[]`              | 4     | api_keys, api_tokens, portal_access_tokens, vendor_portal_tokens | ✅ Acceptable                                 |
| `requirements TEXT[]`        | 1     | activities                                                       | ✅ Acceptable                                 |
| `certification_types TEXT[]` | 1     | assets                                                           | 🟡 Could reference `certifications` table     |
| `zone_access TEXT[]`         | 2     | credential_assignments, credential_types                         | ✅ Acceptable                                 |
| `channels TEXT[]`            | 1     | creative_briefs                                                  | ✅ Acceptable                                 |
| `markets TEXT[]`             | 2     | brand_guidelines, creative_briefs                                | ✅ Acceptable                                 |
| `secondary_roles TEXT[]`     | 2     | crew_members, worker_profiles                                    | ✅ Acceptable                                 |
| Other misc arrays            | ~53   | Various                                                          | ✅ Acceptable                                 |

### 🟡 ADVISORY: JSONB Columns (187 across 126 tables)

**Justified JSONB** (configuration/metadata — NOT structured queryable data):

| Pattern                 | Count | Verdict                          |
| ----------------------- | ----- | -------------------------------- |
| `metadata JSONB`        | ~20   | ✅ Generic key-value metadata    |
| `config JSONB`          | ~10   | ✅ Integration/widget config     |
| `content JSONB`         | ~8    | ✅ Rich text content (documents) |
| `filters/sort_by JSONB` | ~5    | ✅ View configuration            |
| `attachments JSONB`     | ~6    | ✅ File attachment metadata      |
| `raw_payload JSONB`     | ~3    | ✅ External system data          |

**Potentially Violating JSONB** (stores structured, queryable data):

| #   | Table                     | Column          | Problem                                                      | Recommendation                                                                    |
| --- | ------------------------- | --------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| 1   | `pipelines`               | `stages`        | Stages are queryable entities with order, probability, color | Already partially addressed — stages should be a junction table `pipeline_stages` |
| 2   | `estimates`               | `line_items`    | Line items are queryable financial data                      | Normalize to `estimate_items` table                                               |
| 3   | `rfqs`                    | `line_items`    | Same as above                                                | Normalize to `rfq_line_items`                                                     |
| 4   | `rfqs`                    | `responses`     | Vendor responses stored as JSONB                             | Normalize to `rfq_responses`                                                      |
| 5   | `goods_receipts`          | `line_items`    | Receipt line items                                           | Already have `goods_receipt_lines` table — ⚠️ DUAL STORAGE                        |
| 6   | `recurring_invoices`      | `line_items`    | Recurring invoice templates                                  | Normalize to `recurring_invoice_items`                                            |
| 7   | `purchase_requisitions`   | `line_items`    | Requisition items                                            | Normalize to `purchase_requisition_items`                                         |
| 8   | `tech_sheets`             | 8 JSONB columns | Equipment lists, requirements                                | Already complex — partial normalization recommended for most-queried fields       |
| 9   | `production_milestones`   | `deliverables`  | Milestone deliverables                                       | Already have `brief_deliverables` — normalize                                     |
| 10  | `production_checklists`   | `items`         | Checklist items                                              | Already have `job_checklists` — potential consolidation                           |
| 11  | `production_sops`         | `steps`         | SOP steps                                                    | Normalize to `sop_steps` table                                                    |
| 12  | `job_checklists`          | `items`         | Checklist items                                              | Normalize to `job_checklist_items`                                                |
| 13  | `quality_check_templates` | `check_items`   | QC template items                                            | Normalize to `quality_check_template_items`                                       |
| 14  | `shipments`               | `items`         | Shipment items                                               | Already have `shipment_items` table — ⚠️ DUAL STORAGE                             |

> [!NOTE]
> **DUAL STORAGE RESOLVED**: Both `goods_receipts.line_items` and `shipments.items` JSONB columns were **dropped** in Migration 108. The normalized tables (`goods_receipt_lines`, `shipment_items`) are now the exclusive SSOT.

---

## 2NF Violations — Full Functional Dependency

**No violations found.** ✅

All junction tables (`team_members`, `project_assignments`, `activation_assets`, etc.) have proper composite keys or surrogate UUID PKs with unique constraints on the relationship columns. No partial dependencies exist on composite keys.

---

## 3NF Violations — Transitive Dependencies

| #   | Table                      | Cached Column         | Derived From                             | Maintenance Mechanism               | Risk                     |
| --- | -------------------------- | --------------------- | ---------------------------------------- | ----------------------------------- | ------------------------ | --- | ---------- | -------------------------------- | ------- |
| 1   | `schedule_entries`         | `reference_name TEXT` | Polymorphic entity name                  | Manual (no trigger)                 | 🔴 STALE DATA            |
| 2   | `schedule_entries`         | `location_name TEXT`  | `locations.name` via `location_id`       | Manual (no trigger)                 | 🔴 STALE DATA            |
| 3   | `contacts`                 | `full_name TEXT`      | `first_name                              |                                     | ' '                      |     | last_name` | `GENERATED ALWAYS AS ... STORED` | ✅ SAFE |
| 4   | `resource_bookings`        | `total_hours NUMERIC` | Computed from dates × hours/day          | `GENERATED ALWAYS AS ... STORED`    | ✅ SAFE                  |
| 5   | `proposal_items`           | `total NUMERIC`       | `quantity * unit_price`                  | `GENERATED ALWAYS AS ... STORED`    | ✅ SAFE                  |
| 6   | `companies`                | `billing_*` columns   | Duplicate of `address_*`                 | `billing_address_same BOOLEAN` flag | ✅ JUSTIFIED             |
| 7   | `shipments`                | `carrier_name TEXT`   | Derived from `carrier_id → vendors.name` | Manual (no trigger)                 | 🟡 STALE DATA (low risk) |
| 8   | `production_advance_items` | Various cached names  | Multiple parent entities                 | Manual                              | 🟡 STALE DATA            |

> [!IMPORTANT]
> Items 1, 2, 7 are **true 3NF violations** with stale data risk. The `GENERATED ALWAYS AS` columns (3, 4, 5) are PostgreSQL-managed and therefore safe.

---

## SSOT Violations — Duplicate Data

| #   | Entities                                                        | Problem                       | Status                                      |
| --- | --------------------------------------------------------------- | ----------------------------- | ------------------------------------------- |
| 1   | `goods_receipts.line_items` JSONB + `goods_receipt_lines` table | Same data in two formats      | ✅ RESOLVED — JSONB dropped (Migration 108) |
| 2   | `shipments.items` JSONB + `shipment_items` table                | Same data in two formats      | ✅ RESOLVED — JSONB dropped (Migration 108) |
| 3   | `activity_log` (002) + `record_activity_log` (034)              | Overlapping activity tracking | 🟡 OPEN — Audit for consolidation           |

---

## Justified Denormalization (organization_id on Child Tables)

The most widespread "denormalization" is `organization_id` on child tables that could theoretically derive it from their parent:

**Example**: `tasks.organization_id` could be derived from `tasks.project_id → projects.organization_id`

**Justification**: ✅ **This is required for RLS performance.** Supabase RLS policies use `organization_id = ANY(get_user_org_ids())` which requires the column to be directly on the table being queried. Without it, every RLS check would require a JOIN to the parent table, creating catastrophic performance degradation on every query.

**Scope**: All 289 org-scoped tables correctly duplicate `organization_id` for RLS.

---

## Summary of Required Remediation

| Priority | Category                           | Count | Status                         |
| -------- | ---------------------------------- | ----- | ------------------------------ |
| ✅ DONE  | UUID array → junction tables       | 36    | COMPLETED (Migrations 110-112) |
| ✅ DONE  | DUAL STORAGE (JSONB + table)       | 2     | COMPLETED (Migration 108)      |
| 🟡 P2    | JSONB → normalized tables          | 10    | DEFERRED (Batch 4)             |
| ✅ DONE  | 3NF cached names → triggers        | 3     | COMPLETED (Migration 109)      |
| ✅ OK    | Justified denormalization          | 289   | NO ACTION                      |
| ✅ OK    | Acceptable JSONB (config/metadata) | ~150  | NO ACTION                      |
| ✅ OK    | Acceptable arrays (tags, skills)   | ~83   | NO ACTION                      |
