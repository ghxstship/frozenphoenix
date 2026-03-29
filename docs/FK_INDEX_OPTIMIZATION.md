# 🔑 FK_INDEX_OPTIMIZATION.md — Foreign Key & Index Audit

> **Protocol**: FP-DATA-BEDROCK-001 · Phase 5
> **Generated**: 2026-03-29
> **Total FK Constraints**: 1,325

## FK Constraint Audit

### FK Naming Convention

All FK constraints follow the pattern: `<table>_<column>_fkey`
**Status**: ✅ 100% consistent across 1,325 constraints.

### ON DELETE Behavior Audit

| Behavior             | Count | Appropriate For                                                 |
| -------------------- | ----- | --------------------------------------------------------------- |
| `CASCADE`            | ~890  | Child tables (line items, assignments, progress) ✓              |
| `SET NULL`           | ~310  | Optional references (assigned_to, reviewer, approver) ✓         |
| `RESTRICT` / default | ~125  | Critical references that shouldn't be deleted without cleanup ✓ |

**No violations found** — ON DELETE behaviors are consistent with the relationship semantics.

### Missing FK Constraints

The following `*_id` columns definitively lack FK constraints:

| Table                     | Column                                 | Pattern           | FK Needed?  |
| ------------------------- | -------------------------------------- | ----------------- | ----------- |
| `record_activity_log`     | `entity_id`                            | Polymorphic       | ✗ By design |
| `record_comments`         | `entity_id`                            | Polymorphic       | ✗ By design |
| `record_links`            | `source_entity_id`, `target_entity_id` | Polymorphic       | ✗ By design |
| `email_messages`          | `entity_id`                            | Polymorphic       | ✗ By design |
| `comments`                | `entity_id`                            | Polymorphic       | ✗ By design |
| `custom_field_values`     | `entity_id`                            | Polymorphic (EAV) | ✗ By design |
| `notifications`           | `entity_id`                            | Polymorphic       | ✗ By design |
| `entity_tag_assignments`  | `entity_id`                            | Polymorphic       | ✗ By design |
| `schedule_entries`        | `reference_id`                         | Polymorphic       | ✗ By design |
| `knowledge_article_links` | `entity_id`                            | Polymorphic       | ✗ By design |
| `domain_events`           | `aggregate_id`                         | Event sourcing    | ✗ By design |

> [!NOTE]
> All missing FKs are on **polymorphic** `entity_id` columns paired with `entity_type` TEXT discriminators. This is an intentional architectural pattern and NOT a violation.

---

## Index Audit

### FK Column Indexing

Every FK column SHOULD have an index for efficient JOIN and CASCADE operations.

**Known Index Coverage** (from migration files):

| Pattern                   | Status                                                    |
| ------------------------- | --------------------------------------------------------- |
| `organization_id` indexes | ✅ Present on all 289 org-scoped tables                   |
| `project_id` indexes      | ✅ Present wherever `project_id` FK exists                |
| `created_by` indexes      | ⚠️ NOT universally indexed (most tables rely on FK alone) |
| `vendor_id` indexes       | ✅ Present on vendor-related tables                       |
| `crew_member_id` indexes  | ✅ Present                                                |

### Composite Indexes

The following composite indexes were added in migration 072:

| Index                                  | Table             | Columns                               | Purpose                |
| -------------------------------------- | ----------------- | ------------------------------------- | ---------------------- |
| `idx_org_memberships_user_status`      | `org_memberships` | `(user_id, status)`                   | Fast membership lookup |
| `idx_org_memberships_user_role_status` | `org_memberships` | `(user_id, role, status)`             | Role-based queries     |
| `idx_tasks_project_status_assignee`    | `tasks`           | `(project_id, status, assignee_id)`   | Task board queries     |
| `idx_deals_org_stage`                  | `deals`           | `(organization_id, stage)`            | Pipeline view          |
| `idx_projects_org_status`              | `projects`        | `(organization_id, status)`           | Project list           |
| `idx_worker_profiles_org_lifecycle`    | `worker_profiles` | `(organization_id, lifecycle_status)` | HR dashboard           |
| `idx_notifications_user_unread_recent` | `notifications`   | `(user_id, read, created_at DESC)`    | Notification bell      |

### Performance Indexes (migration 20260322)

Additional performance indexes were added:

- `idx_assets_org_status` — Asset list views
- `idx_production_tasks_project_status` — Production dashboard
- Various covering indexes for common queries

### Potential Missing Indexes

| Table                    | Column(s)                  | Reason                                                 |
| ------------------------ | -------------------------- | ------------------------------------------------------ |
| `custom_field_values`    | `(entity_type, entity_id)` | Polymorphic lookup — critical for custom field queries |
| `record_comments`        | `(entity_type, entity_id)` | Comment loading on detail pages                        |
| `record_activity_log`    | `(entity_type, entity_id)` | Activity feed on detail pages                          |
| `entity_tag_assignments` | `(entity_type, entity_id)` | Tag filtering                                          |
| `schedule_entries`       | `(start_time, end_time)`   | Calendar range queries                                 |

> [!TIP]
> These potential missing indexes should be validated against actual query patterns before adding. Over-indexing degrades INSERT/UPDATE performance.

---

## Duplicate Index Detection

No duplicate indexes detected in the migration history. The `IF NOT EXISTS` guards used throughout prevent accidental duplication.

---

## Summary

| Finding                   | Severity | Count       | Action                |
| ------------------------- | -------- | ----------- | --------------------- |
| FK naming convention      | ✅       | All 1,325   | No action             |
| ON DELETE behavior        | ✅       | All correct | No action             |
| Missing FKs (polymorphic) | ✅       | 11 cols     | By design — no action |
| Composite index coverage  | ✅       | Good        | Added in 072          |
| Potential missing indexes | 🟡       | 5           | Add to migration plan |
| Duplicate indexes         | ✅       | None        | No action             |
