# 🗺️ RELATIONSHIP_MAP.md — FrozenPhoenix FK Graph & Dependency Analysis

> **Protocol**: FP-DATA-BEDROCK-001 · Phase 1.2
> **Generated**: 2026-03-29
> **Total FK Constraints**: 1,325

## Most-Referenced Tables (Hub Analysis)

Tables with the highest inbound FK reference count function as "hubs" in the schema graph.

| Rank | Table                  | Inbound FK Refs | Classification |
| ---- | ---------------------- | --------------- | -------------- |
| 1    | `user_profiles`        | 439             | IDENTITY HUB   |
| 2    | `organizations`        | 296             | TENANT HUB     |
| 3    | `projects`             | 81              | DOMAIN HUB     |
| 4    | `vendors`              | 31              | DOMAIN HUB     |
| 5    | `locations`            | 29              | DOMAIN HUB     |
| 6    | `live_event_instances` | 22              | DOMAIN HUB     |
| 7    | `companies`            | 21              | DOMAIN HUB     |
| 8    | `crew_members`         | 17              | DOMAIN HUB     |
| 9    | `assets`               | 16              | DOMAIN HUB     |
| 10   | `events`               | 16              | DOMAIN HUB     |

> [!NOTE]
> `mv_dashboard_kpis` shows 296 refs but is an artifact of Supabase type generation resolving `organization_id` FKs to both `organizations` and any view that exposes `organization_id`.

---

## Orphan Table Analysis

Tables with NO inbound FK references (no other table references them):

### Potential True Orphans (require investigation)

- `access_audit_log` — write-only audit table ✅ Expected
- `active_timers` — user's currently-running timer ✅ Expected (1:1 via UNIQUE)
- `advance_status_history` — audit log ✅ Expected
- `anonymization_queue` — GDPR batch table ✅ Expected
- `auth_rate_limits` — rate limiting table ✅ Expected
- `bluesky_oauth_sessions` / `bluesky_oauth_states` — ephemeral OAuth ✅ Expected
- `calendar_events` — standalone entity ⚠️ Could benefit from FK to projects
- `data_export_requests` — batch export jobs ✅ Expected
- `domain_events` — event sourcing ✅ Expected
- `login_audit_log` — write-only audit ✅ Expected
- `reserved_usernames` / `released_usernames` — system config ✅ Expected

### Tables That SHOULD Reference Others But Don't

- `case_study_metrics` — has `case_study_id` FK, not fully orphaned
- `testimonials` — has `case_study_id`, `project_id` FKs
- `record_links` — polymorphic entity linking (by design)
- `entity_tag_assignments` — polymorphic tag assignment (by design)

> [!IMPORTANT]
> **No true orphans detected.** All tables without inbound FKs are either audit/log tables (write-only by design), ephemeral session tables, or system lookup tables.

---

## Circular Dependency Detection

No circular FK dependencies detected in the schema. The following self-referential patterns exist (expected):

| Table           | Column                   | References          |
| --------------- | ------------------------ | ------------------- |
| `companies`     | `parent_company_id`      | `companies(id)`     |
| `departments`   | `parent_department_id`   | `departments(id)`   |
| `locations`     | `parent_location_id`     | `locations(id)`     |
| `work_packages` | `parent_work_package_id` | `work_packages(id)` |
| `work_orders`   | `parent_work_order_id`   | `work_orders(id)`   |
| `proposals`     | `parent_proposal_id`     | `proposals(id)`     |
| `tasks`         | `parent_id`              | `tasks(id)`         |

All use `ON DELETE SET NULL` or `ON DELETE CASCADE` — no risk of unresolvable circular locks.

---

## Implicit Relationships (Missing FK Constraints)

These columns follow `_id` naming convention but have NO FK constraint defined:

### ⚠️ High-Risk Missing FKs

| Table                 | Column                                 | Expected Target | Risk            |
| --------------------- | -------------------------------------- | --------------- | --------------- |
| `record_activity_log` | `entity_id`                            | polymorphic     | LOW (by design) |
| `record_comments`     | `entity_id`                            | polymorphic     | LOW (by design) |
| `record_links`        | `source_entity_id`, `target_entity_id` | polymorphic     | LOW (by design) |
| `email_messages`      | `entity_id`                            | polymorphic     | LOW (by design) |
| `comments`            | `entity_id`                            | polymorphic     | LOW (by design) |
| `custom_field_values` | `entity_id`                            | polymorphic     | LOW (by design) |
| `notifications`       | `entity_id`                            | polymorphic     | LOW (by design) |

> [!NOTE]
> All missing FK constraints on `entity_id` columns are **intentionally polymorphic** — they reference different tables based on an accompanying `entity_type` TEXT column. This is a standard EAV/polymorphic pattern and NOT a violation.

---

## ON DELETE Behavior Summary

| Behavior            | Count | Usage                                             |
| ------------------- | ----- | ------------------------------------------------- |
| `CASCADE`           | ~890  | Child records (line items, assignments, etc.)     |
| `SET NULL`          | ~310  | Optional references (assigned_to, reviewer, etc.) |
| `RESTRICT`          | ~5    | Critical relationships                            |
| No action specified | ~120  | Default PostgreSQL behavior (RESTRICT)            |

---

## Key Relationship Patterns

### 1. Organization Scoping (289 tables)

All org-scoped tables reference `organizations(id)` with `ON DELETE CASCADE`.

### 2. User References (439 FKs to user_profiles)

Standard columns: `created_by`, `updated_by`, `assigned_to`, `approved_by`, `reviewer_id`  
All reference `user_profiles(id)` (post-migration 067/081 repointing).

### 3. Polymorphic References (entity_type + entity_id pattern)

Used in: `record_activity_log`, `record_comments`, `record_links`, `email_messages`, `comments`, `notifications`, `custom_field_values`, `entity_tag_assignments`, `entity_dependencies`, `schedule_entries`
