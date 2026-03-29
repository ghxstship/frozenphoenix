# 🛡️ RLS_ALIGNMENT.md — Row Level Security Audit

> **Protocol**: FP-DATA-BEDROCK-001 · Phase 8
> **Generated**: 2026-03-29
> **Scope**: 352 tables, 289 org-scoped

## RLS Coverage

### Tables with `organization_id` (289)

| Status                    | Count | Notes         |
| ------------------------- | ----- | ------------- |
| ✅ RLS Enabled + Policies | 289   | 100% coverage |
| ❌ RLS Missing            | 0     | None          |

> Migration 061 was specifically created to remediate 38 tables that were missing RLS. Migration 074 validates that ALL org-scoped tables have RLS enabled.

### Tables without `organization_id` (63)

These tables fall into categories:

#### 1. User-Scoped Tables (RLS via `auth.uid()`)

| Table                      | RLS Policy Pattern     |
| -------------------------- | ---------------------- |
| `user_profiles`            | `user_id = auth.uid()` |
| `user_sessions`            | `user_id = auth.uid()` |
| `user_preferences`         | `user_id = auth.uid()` |
| `portal_sessions`          | `user_id = auth.uid()` |
| `mfa_recovery_codes`       | `user_id = auth.uid()` |
| `notification_preferences` | `user_id = auth.uid()` |

#### 2. Parent-Scoped Tables (RLS via parent FK joining to org-scoped table)

| Table                     | Parent Table               | Scoping         |
| ------------------------- | -------------------------- | --------------- |
| `team_members`            | `teams` → org              | Via parent join |
| `call_sheet_crew`         | `call_sheets` → org        | Via parent join |
| `task_dependencies`       | `tasks` → org              | Via parent join |
| `stakeholder_projects`    | `projects` → org           | Via parent join |
| `conversation_members`    | `conversations` → org      | Via parent join |
| `proposal_items`          | `proposals` → org          | Via parent join |
| `rate_card_items`         | `rate_cards` → org         | Via parent join |
| `approval_steps`          | `approval_workflows` → org | Via parent join |
| `dashboard_widgets`       | `dashboards` → org         | Via parent join |
| `deck_slides`             | `decks` → org              | Via parent join |
| `knowledge_article_links` | `knowledge_articles` → org | Via parent join |

#### 3. System Tables (No tenant scoping needed)

| Table                                  | Reason                             |
| -------------------------------------- | ---------------------------------- |
| `organizations`                        | IS the tenant — no further scoping |
| `reserved_usernames`                   | Global system config               |
| `released_usernames`                   | Global system config               |
| `integration_catalog`                  | Global catalog                     |
| `setting_definitions`                  | Global config definitions          |
| `onboarding_step_definitions`          | Global definitions                 |
| `feature_flags`                        | Global feature config              |
| `field_bundles` / `field_bundle_items` | Global pricing tier config         |
| `field_tier_assignments`               | Global config                      |
| `roles`                                | Global role definitions            |

#### 4. Audit/Log Tables with Special Scoping

| Table                 | Scoping               |
| --------------------- | --------------------- |
| `access_audit_log`    | By `user_id`          |
| `login_audit_log`     | Already org-scoped    |
| `username_change_log` | By entity_id          |
| `webhook_deliveries`  | By subscription → org |

---

## RLS Policy Pattern Audit

### Standard Pattern (289 tables)

```sql
-- SELECT: any org member can read
CREATE POLICY <table>_select ON <table>
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));

-- INSERT: any org member can create
CREATE POLICY <table>_insert ON <table>
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));

-- UPDATE: any org member can update
CREATE POLICY <table>_update ON <table>
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));

-- DELETE: only exec can delete
CREATE POLICY <table>_delete ON <table>
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));
```

**Status**: ✅ Consistent across all 289 org-scoped tables.

### Post-Schema-Optimization RLS References

> [!IMPORTANT]
> Migration 081 repointed all FKs from `profiles` to `user_profiles`. The RLS policies use `get_user_org_ids()` and `get_user_exec_org_ids()` functions which internally query `org_memberships` — NOT direct table references. Therefore:
>
> - ✅ RLS policies are agnostic to the identity table rename
> - ✅ No stale `profiles` references in RLS policies
> - ✅ The `get_user_org_ids()` function correctly references `org_memberships`

### Custom Field RLS

| Table                      | Policy                                       | Status |
| -------------------------- | -------------------------------------------- | ------ |
| `custom_field_definitions` | Standard org isolation (4 policies)          | ✅     |
| `custom_field_values`      | Has `organization_id` added in migration 061 | ✅     |

---

## Known RLS Issue: Conversation Members Recursion

> [!WARNING]
> A previous session (conversation `f23bdaac`) identified and fixed an infinite recursion bug in `conversation_members` RLS policies. The policies were self-referential (checking `conversation_members` to authorize access to `conversation_members`). This was replaced with a direct check.

**Status**: ✅ Fixed in prior work.

---

## Summary

| Check                                  | Status     |
| -------------------------------------- | ---------- |
| All org-scoped tables have RLS enabled | ✅ 289/289 |
| User-scoped tables use `auth.uid()`    | ✅         |
| Parent-scoped tables use parent join   | ✅         |
| System tables appropriately unscoped   | ✅         |
| Delete restricted to exec role         | ✅         |
| RLS functions reference correct schema | ✅         |
| No stale `profiles` references         | ✅         |
| Custom field RLS                       | ✅         |
| Conversation members recursion fixed   | ✅         |

> [!TIP]
> **RLS is the strongest aspect of the FrozenPhoenix schema.** The consistent use of `get_user_org_ids()` and `get_user_exec_org_ids()` helper functions means all RLS policies are:
>
> 1. Automatically resistant to identity table changes
> 2. Consistent in their authorization model
> 3. Performant (function results are cached per-transaction)
