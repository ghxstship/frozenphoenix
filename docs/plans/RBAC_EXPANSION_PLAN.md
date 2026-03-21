# RBAC Expansion Plan: 4-Tier → 6-Tier Role System

## Executive Summary

This document provides a comprehensive impact audit and migration plan for expanding the current 4-tier RBAC system (`exec`, `pm`, `client`, `vendor`) to a 6-tier system:

| Priority | Old Key  | New Key        | Label           | Description                                                    |
| -------- | -------- | -------------- | --------------- | -------------------------------------------------------------- |
| 0        | `exec`   | `exec`         | Executive       | Full platform access. Org settings, billing, user management.  |
| 1        | _(new)_  | `director`     | Director        | Cross-project oversight. Budget approval, crew management.     |
| 2        | `pm`     | `pm`           | Project Manager | Day-to-day project execution. Read/write production resources. |
| 3        | _(new)_  | `member`       | Team Member     | Assigned task/schedule access. Time tracking, checklists.      |
| 4        | `client` | `client`       | Client          | Read-only project visibility. Approvals, deliverables.         |
| 5        | `vendor` | `collaborator` | Collaborator    | Task-specific external access. Work orders, compliance.        |

### Key Design Principles

1. **Distinct permission sets** — each role has a unique, auditable permission surface
2. **Override by context** — permissions can be elevated/restricted per project, department, industry, project phase, and/or scope of work via `permission_grants`
3. **Backward compatible** — existing `exec`, `pm`, `client` data migrates in-place; `vendor` → `collaborator` is a rename
4. **DB-first** — all role definitions and grants live in `role_definitions` + `permission_grants` (migration 028); the static `PERMISSION_MATRIX` remains as a compile-time fallback

---

## 1. Impact Audit

### 1.1 Database — CHECK Constraints (7 locations)

Every `CHECK (role IN ('exec','pm','client','vendor'))` must be updated to include `director`, `member`, and rename `vendor` → `collaborator`.

| Migration File                    | Table                         | Column             | Line |
| --------------------------------- | ----------------------------- | ------------------ | ---- |
| `001_initial_schema.sql`          | `profiles`                    | `role`             | 27   |
| `001_initial_schema.sql`          | `documents`                   | `access_level`     | 358  |
| `018_user_lifecycle_identity.sql` | `org_memberships`             | `role`             | 151  |
| `018_user_lifecycle_identity.sql` | `invitations`                 | `role`             | 172  |
| `018_user_lifecycle_identity.sql` | `onboarding_step_definitions` | `role`             | 192  |
| `018_user_lifecycle_identity.sql` | `api_tokens`                  | `permission_level` | 288  |
| `018_user_lifecycle_identity.sql` | `permission_grants_legacy`    | `permission_level` | 309  |

### 1.2 Database — organizations.default_role (2 locations)

| Migration File                    | Column                       | Line  |
| --------------------------------- | ---------------------------- | ----- |
| `018_user_lifecycle_identity.sql` | `organizations.default_role` | 385   |
| `036_extend_organizations.sql`    | `organizations.default_role` | 19–20 |

### 1.3 Database — Seeded Role Data

| Migration File                         | What                             | Impact                                                            |
| -------------------------------------- | -------------------------------- | ----------------------------------------------------------------- |
| `025_seed_defaults_and_onboarding.sql` | 12 onboarding step definitions   | Add `director` + `member` steps; rename `vendor` → `collaborator` |
| `028_rbac_custom_roles.sql`            | 4 system `role_definitions` rows | Add `director` + `member`; rename `vendor` → `collaborator`       |
| `028_rbac_custom_roles.sql`            | ~200 `permission_grants` rows    | Add grants for `director` + `member`; rename vendor role grants   |

### 1.4 Database — RLS Policies Referencing Roles (6 policies)

| Migration                      | Policy / Function                      | Hard-coded Role Refs                                       |
| ------------------------------ | -------------------------------------- | ---------------------------------------------------------- |
| `028_rbac_custom_roles.sql`    | `role_definitions_manage`              | `role = 'exec'`                                            |
| `028_rbac_custom_roles.sql`    | `permission_grants_manage`             | `role = 'exec'`                                            |
| `028_rbac_custom_roles.sql`    | `access_audit_log_read`                | `role = 'exec'`                                            |
| `029_role_based_rls.sql`       | `is_exec_or_pm()`                      | `role IN ('exec','pm')`                                    |
| `029_role_based_rls.sql`       | `is_exec()`                            | `role = 'exec'`                                            |
| `029_role_based_rls.sql`       | `invoices_role_read`                   | `get_user_role() = 'client'`, `get_user_role() = 'vendor'` |
| `036_extend_organizations.sql` | `Exec members can update organization` | `role = 'exec'`                                            |
| `029_role_based_rls.sql`       | `brands_manage`                        | `role = 'exec'`                                            |

### 1.5 Database — Trigger Functions

| Migration                         | Function                      | Impact                                                               |
| --------------------------------- | ----------------------------- | -------------------------------------------------------------------- |
| `018_user_lifecycle_identity.sql` | `handle_new_user()`           | Default role `'pm'` for domain-match orgs and default org assignment |
| `028_rbac_custom_roles.sql`       | `user_has_permission()`       | References `is_default` (typo for `is_default_org`); role column     |
| `037_create_org_bootstrap_fn.sql` | `create_org_and_membership()` | Hard-codes `'exec'` for org creator                                  |

### 1.6 Application Code — TypeScript Type Definition

| File                    | What                         | Impact                                                             |
| ----------------------- | ---------------------------- | ------------------------------------------------------------------ |
| `src/types/index.ts:48` | `PermissionLevel` union type | Add `"director"`, `"member"`; rename `"vendor"` → `"collaborator"` |

This is the **single source of truth** for the TS type. Every import chain flows from here.

### 1.7 Application Code — RBAC Config (src/config/rbac.ts)

| Export                           | Impact                                                                |
| -------------------------------- | --------------------------------------------------------------------- |
| `PERMISSION_MATRIX`              | Add `director` + `member` entries; rename `vendor` → `collaborator`   |
| `FIELD_VISIBILITY_MASKS`         | Add `director` + `member` to visibility arrays where appropriate      |
| `shouldRevokeAccess()`           | Update to handle `director` and `member` (internal roles → no revoke) |
| `hasPermission()`                | No structural change (reads from PERMISSION_MATRIX keys)              |
| `resolvePermissionsFromGrants()` | No structural change                                                  |

### 1.8 Application Code — Field Resolver (src/lib/permissions/field-resolver.ts)

| Item                         | Impact                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------ |
| `ROLE_HIERARCHY`             | Add `director: 4`, `member: 1`; shift values; rename `vendor` → `collaborator` |
| `FieldAccessRule.roleAccess` | Type widens automatically via `PermissionLevel`                                |

### 1.9 Application Code — Permission Guard (src/components/permission-guard.tsx)

| Item                       | Impact                                                        |
| -------------------------- | ------------------------------------------------------------- |
| `DEFAULT_LEVEL`            | Change from `"vendor"` to `"collaborator"`                    |
| `resolvePermissionLevel()` | Add `"director"`, `"member"`, `"collaborator"` to valid check |

### 1.10 Application Code — API Middleware (src/app/api/middleware/permissions.ts)

| Item                          | Impact                                                             |
| ----------------------------- | ------------------------------------------------------------------ |
| `validRoles` array (line 138) | Add `"director"`, `"member"`; rename `"vendor"` → `"collaborator"` |

### 1.11 Application Code — Domain Config (src/config/domain-config.ts)

| Item                      | Impact                                                              |
| ------------------------- | ------------------------------------------------------------------- |
| `PERMISSION_LEVELS` array | Add `director` + `member` entries; rename `vendor` → `collaborator` |
| `PERMISSION_LEVEL_MAP`    | Auto-derived from array                                             |

### 1.12 Application Code — Navigation (src/config/navigation.ts)

| Item                             | Impact                                                             |
| -------------------------------- | ------------------------------------------------------------------ |
| `getNavigationSectionsForRole()` | Uses `hasPermission()` — no direct role string refs, auto-resolves |

### 1.13 Application Code — Sidebar + Topbar

| File                                 | Impact                                                               |
| ------------------------------------ | -------------------------------------------------------------------- |
| `src/components/layouts/sidebar.tsx` | Uses `usePermissionLevel()` → auto-resolves via PermissionLevel type |
| `src/components/layouts/topbar.tsx`  | Same — derives from navigation config                                |

### 1.14 Application Code — Auth Context (src/lib/supabase/auth-context.tsx)

| Item                                    | Impact                                                  |
| --------------------------------------- | ------------------------------------------------------- |
| Default fallback role `"pm"` (line 105) | Consider whether new users should default to `"member"` |

### 1.15 Application Code — Onboarding UI

| File                                                  | Item                 | Impact                                                   |
| ----------------------------------------------------- | -------------------- | -------------------------------------------------------- |
| `src/app/(dashboard)/onboarding/invite-team/page.tsx` | `ROLE_OPTIONS` array | Add Director + Team Member; rename Vendor → Collaborator |

### 1.16 Application Code — Demo/Mock Data

| File                                  | Impact                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------------- |
| `src/lib/demo-data-user-lifecycle.ts` | ~30 role string literals (`"vendor"`, `"exec"`, `"pm"`, `"client"`) in mock user data |

### 1.17 Application Code — Tests

| File                             | Impact                                                                                                                |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `src/__tests__/lib/rbac.test.ts` | 265 lines of tests referencing all 4 roles; must add `director` + `member` tests and rename `vendor` → `collaborator` |

### 1.18 Application Code — User Management Pages

| File                                                          | Impact                                               |
| ------------------------------------------------------------- | ---------------------------------------------------- |
| `src/app/(dashboard)/user-management/page.tsx`                | References `PermissionLevel` for role badges/filters |
| `src/app/(dashboard)/user-management/access-reviews/page.tsx` | Same                                                 |
| `src/app/(dashboard)/user-management/invitations/page.tsx`    | Same                                                 |

### 1.19 Application Code — Field Access API

| File                                 | Impact                                                   |
| ------------------------------------ | -------------------------------------------------------- |
| `src/app/api/fields/access/route.ts` | References `PermissionLevel` for field access resolution |

---

## 2. New Role Permission Design

### 2.1 Role Hierarchy

```
exec (5) → director (4) → pm (3) → member (2) → client (1) → collaborator (0)
         ↑ internal roles                       ↑ external roles
```

**Internal roles** (`exec`, `director`, `pm`, `member`) are never subject to the 48-hour post-loadout revocation.  
**External roles** (`client`, `collaborator`) are subject to auto-revocation.

### 2.2 Permission Sets — High-Level Matrix

| Capability Domain          | exec | director | pm  | member | client | collaborator |
| -------------------------- | ---- | -------- | --- | ------ | ------ | ------------ |
| Org settings / billing     | M    | —        | —   | —      | —      | —            |
| User management            | M    | R        | R   | —      | —      | —            |
| Custom roles               | M    | —        | —   | —      | —      | —            |
| Budget approval            | M    | W        | R   | —      | —      | —            |
| Crew / workforce mgmt      | M    | W        | W   | R      | —      | —            |
| Project CRUD               | M    | W        | W   | R      | R      | —            |
| Task CRUD                  | M    | W        | W   | W      | R      | R            |
| Schedule / calendar        | M    | W        | W   | R      | R      | R            |
| Time tracking              | M    | W        | W   | W      | —      | —            |
| Financial data (invoices)  | M    | R        | R   | —      | R\*    | —            |
| Rate cards / payroll       | M    | R        | —   | —      | —      | —            |
| Contracts / proposals      | M    | W        | W   | R      | R      | R            |
| Approvals                  | M    | W        | W   | —      | W      | —            |
| Reports / analytics        | M    | R        | R   | —      | —      | —            |
| Vendor management          | M    | W        | W   | —      | —      | —            |
| Work orders / dispatch     | M    | W        | W   | R      | —      | W            |
| Checklists / compliance    | M    | W        | W   | W      | —      | W            |
| Live operations            | M    | W        | W   | R      | R      | R            |
| Documents / KB             | M    | W        | W   | R      | R      | R            |
| Digital assets             | M    | W        | W   | R      | R      | R            |
| Client portal              | M    | R        | R   | —      | R      | —            |
| Vendor/Collaborator portal | M    | R        | R   | —      | —      | R            |

_Legend: M = manage, W = write, R = read, — = no access, R_ = scoped read\*

### 2.3 Director — Distinct Permissions (Not Just "PM+")

The **Director** role fills the gap between Executive and PM:

- **Can:** Approve budgets, manage crew assignments cross-project, view financial reports and rate cards, manage vendor relationships, write to approvals
- **Cannot:** Change org settings, billing, custom role definitions, payroll records, or manage user accounts
- **Override target:** A PM can be elevated to Director-level on a specific project via `permission_grants` with `scope_type = 'project'`

### 2.4 Team Member — Distinct Permissions (Not Just "PM−")

The **Team Member** role is for internal staff who execute tasks but don't manage projects:

- **Can:** Read assigned projects/tasks, write time entries, update task status, view schedules, complete checklists, read documents
- **Cannot:** Create projects, manage crew, view budgets/financials, manage vendors, approve anything
- **Override target:** A Team Member can be granted write access to specific project tasks via `permission_grants`

### 2.5 Collaborator (formerly Vendor)

Renamed for clarity — "Collaborator" better represents the external contractor/partner relationship and avoids confusion with the "Vendor Management" module.

Permission set is functionally identical to the current `vendor` role, with the key semantic change in the system.

---

## 3. Contextual Override Architecture

The existing `permission_grants` table (migration 028) already supports contextual overrides. No schema changes needed — only additional seed data and UI.

### 3.1 Override Dimensions

| Dimension         | Implementation                                        | Grant Field                   |
| ----------------- | ----------------------------------------------------- | ----------------------------- |
| **Project**       | `scope_type = 'project'`, `scope_id = <project_uuid>` | Already supported             |
| **Department**    | `conditions->>'department' = '<dept_key>'`            | Via JSONB `conditions` column |
| **Industry**      | `conditions->>'industry' = '<industry_key>'`          | Via JSONB `conditions` column |
| **Project Phase** | `conditions->>'project_phase' = '<phase_key>'`        | Via JSONB `conditions` column |
| **Scope of Work** | `conditions->>'sow_id' = '<sow_uuid>'`                | Via JSONB `conditions` column |

### 3.2 Resolution Order

```
1. Check for deny grants (always wins)
2. Check scope-specific grants (project > org > global)
3. Check condition-matched grants (department, industry, phase, SOW)
4. Fall back to role_definitions → permission_grants (system defaults)
5. Fall back to static PERMISSION_MATRIX (compile-time safety net)
```

### 3.3 Example Override Scenarios

**Scenario A:** A Team Member needs write access to budgets on Project X.

```sql
INSERT INTO permission_grants (role_definition_id, resource, action, scope_type, scope_id)
SELECT rd.id, 'budgets', 'write', 'project', '<project-x-uuid>'
FROM role_definitions rd WHERE rd.key = 'member' AND rd.is_system = true;
```

**Scenario B:** Directors in the "Events" department get live operations manage access.

```sql
INSERT INTO permission_grants (role_definition_id, resource, action, conditions)
SELECT rd.id, 'live_events', 'manage', '{"department": "events"}'::jsonb
FROM role_definitions rd WHERE rd.key = 'director' AND rd.is_system = true;
```

**Scenario C:** Collaborators on projects in "Pre-Production" phase can write to creative briefs.

```sql
INSERT INTO permission_grants (role_definition_id, resource, action, conditions)
SELECT rd.id, 'creative_briefs', 'write', '{"project_phase": "pre_production"}'::jsonb
FROM role_definitions rd WHERE rd.key = 'collaborator' AND rd.is_system = true;
```

---

## 4. Migration Plan

### Phase 1: Database Schema (New Migration File)

**File:** `supabase/migrations/038_rbac_6tier_expansion.sql`

**Steps (in order):**

1. **ALTER CHECK constraints** — Drop and recreate all 7 CHECK constraints to accept 6 roles:

   ```sql
   ALTER TABLE org_memberships DROP CONSTRAINT IF EXISTS org_memberships_role_check;
   ALTER TABLE org_memberships ADD CONSTRAINT org_memberships_role_check
       CHECK (role IN ('exec', 'director', 'pm', 'member', 'client', 'collaborator'));
   ```

   Repeat for: `invitations.role`, `onboarding_step_definitions.role` (add `'all'`), `api_tokens.permission_level`, legacy `permission_grants.permission_level`, `profiles.role`, `documents.access_level`.

2. **ALTER organizations.default_role** — Drop and recreate CHECK:

   ```sql
   ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_default_role_check;
   ALTER TABLE organizations ADD CONSTRAINT organizations_default_role_check
       CHECK (default_role IN ('exec', 'director', 'pm', 'member', 'client', 'collaborator'));
   ```

3. **Data migration** — Rename existing `vendor` → `collaborator`:

   ```sql
   UPDATE org_memberships SET role = 'collaborator' WHERE role = 'vendor';
   UPDATE invitations SET role = 'collaborator' WHERE role = 'vendor';
   UPDATE profiles SET role = 'collaborator' WHERE role = 'vendor';
   UPDATE documents SET access_level = 'collaborator' WHERE access_level = 'vendor';
   UPDATE api_tokens SET permission_level = 'collaborator' WHERE permission_level = 'vendor';
   UPDATE organizations SET default_role = 'collaborator' WHERE default_role = 'vendor';
   ```

4. **Seed new role_definitions** — Insert `director` and `member` system roles:

   ```sql
   INSERT INTO role_definitions (organization_id, key, label, description, is_system, priority) VALUES
   (NULL, 'director', 'Director', 'Cross-project oversight with budget approval and crew management', true, 5),
   (NULL, 'member', 'Team Member', 'Internal team member with task execution and time tracking access', true, 15);
   ```

5. **Rename vendor role_definition** — Update existing system vendor role:

   ```sql
   UPDATE role_definitions SET key = 'collaborator', label = 'Collaborator',
       description = 'External partner with task-specific access to assigned work and compliance'
   WHERE key = 'vendor' AND is_system = true AND organization_id IS NULL;
   ```

6. **Seed permission_grants for director + member** — Full grant set per Section 2.2.

7. **Seed onboarding_step_definitions** — Add director + member steps:

   ```sql
   INSERT INTO onboarding_step_definitions (role, step_key, title, description, sort_order, is_required, gate_access) VALUES
   ('director', 'review_teams',       'Review your teams',        'Overview of teams and projects under your oversight.',  3, false, false),
   ('director', 'set_approval_prefs', 'Set approval preferences', 'Configure budget and crew approval workflows.',        4, false, false),
   ('member',   'review_tasks',       'Review your assignments',  'View tasks and schedules assigned to you.',            3, false, false),
   ('member',   'log_first_time',     'Log your first time entry','Submit a time entry to get started.',                  4, false, false);
   ```

   Update existing vendor onboarding steps:

   ```sql
   UPDATE onboarding_step_definitions SET role = 'collaborator' WHERE role = 'vendor';
   ```

8. **Update RLS helper functions:**

   ```sql
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
   ```

   Note: `is_exec_or_pm()` is expanded to include `director` since directors need financial read access. Consider renaming to `is_internal_management()` for clarity.

9. **Update RLS policies referencing `'vendor'`:**
   ```sql
   -- invoices_role_read: change vendor check to collaborator
   DROP POLICY IF EXISTS "invoices_role_read" ON invoices;
   CREATE POLICY "invoices_role_read" ON invoices ... get_user_role() = 'collaborator' ...
   ```

### Phase 2: TypeScript Type + Config

**Order matters** — update the type first, then TypeScript will flag every downstream breakage.

1. **`src/types/index.ts`** — Update `PermissionLevel`:

   ```typescript
   export type PermissionLevel = "exec" | "director" | "pm" | "member" | "client" | "collaborator";
   ```

2. **`src/config/rbac.ts`** — Update:
   - `PERMISSION_MATRIX` — add `director`, `member` entries; rename `vendor` → `collaborator`
   - `FIELD_VISIBILITY_MASKS` — add `director` to financial fields (alongside `exec`, `pm`); add `member` where appropriate
   - `shouldRevokeAccess()` — add `director` and `member` to the no-revoke list

3. **`src/config/domain-config.ts`** — Update `PERMISSION_LEVELS` array:

   ```typescript
   export const PERMISSION_LEVELS: EnumConfig<PermissionLevel>[] = [
     { value: "exec", label: "Executive", variant: "default", description: "Full access" },
     {
       value: "director",
       label: "Director",
       variant: "info",
       description: "Cross-project oversight",
     },
     {
       value: "pm",
       label: "Project Manager",
       variant: "info",
       description: "Project-scoped access",
     },
     {
       value: "member",
       label: "Team Member",
       variant: "secondary",
       description: "Task execution access",
     },
     {
       value: "client",
       label: "Client",
       variant: "warning",
       description: "Approved deliverables only",
     },
     {
       value: "collaborator",
       label: "Collaborator",
       variant: "secondary",
       description: "External partner access",
     },
   ];
   ```

4. **`src/lib/permissions/field-resolver.ts`** — Update `ROLE_HIERARCHY`:
   ```typescript
   const ROLE_HIERARCHY: Record<PermissionLevel, number> = {
     exec: 5,
     director: 4,
     pm: 3,
     member: 2,
     client: 1,
     collaborator: 0,
   };
   ```

### Phase 3: Application Code

1. **`src/components/permission-guard.tsx`** — Update:
   - `DEFAULT_LEVEL` → `"collaborator"`
   - `resolvePermissionLevel()` — add `"director"`, `"member"`, `"collaborator"` to valid set

2. **`src/app/api/middleware/permissions.ts`** — Update `validRoles`:

   ```typescript
   const validRoles: PermissionLevel[] = [
     "exec",
     "director",
     "pm",
     "member",
     "client",
     "collaborator",
   ];
   ```

3. **`src/app/(dashboard)/onboarding/invite-team/page.tsx`** — Update `ROLE_OPTIONS`:

   ```typescript
   const ROLE_OPTIONS = [
     { value: "exec", label: "Executive" },
     { value: "director", label: "Director" },
     { value: "pm", label: "Project Manager" },
     { value: "member", label: "Team Member" },
     { value: "client", label: "Client" },
     { value: "collaborator", label: "Collaborator" },
   ];
   ```

4. **`src/lib/supabase/auth-context.tsx`** — Update default role fallback from `"pm"` to `"member"` (or keep `"pm"` — depends on business decision for new signups).

5. **`src/lib/demo-data-user-lifecycle.ts`** — Update mock data:
   - Rename all `role: "vendor"` → `role: "collaborator"`
   - Add sample users with `role: "director"` and `role: "member"`

### Phase 4: Tests

1. **`src/__tests__/lib/rbac.test.ts`** — Update:
   - Rename all `"vendor"` → `"collaborator"` in test assertions
   - Add `director` test cases (financial read, budget write, no org settings)
   - Add `member` test cases (task write, no financial, no project create)
   - Update `PERMISSION_MATRIX` structure test to expect 6 levels
   - Update `shouldRevokeAccess` tests for new roles
   - Update `isFieldVisible` tests for new roles

### Phase 5: Documentation + Cleanup

1. Update `docs/ARCHITECTURE_RECOMMENDATIONS.md` with new role definitions
2. Update any API reference docs mentioning role values
3. Run `npm run type-check` — expect 0 errors after all changes
4. Run `npm run lint` — expect 0 errors
5. Run `npm run test` — all tests pass with updated assertions

---

## 5. Risk Assessment

| Risk                                          | Severity | Mitigation                                                                                           |
| --------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| Existing `vendor` data in production DB       | High     | Migration 038 renames all `vendor` → `collaborator` atomically in a transaction                      |
| RLS policies blocking access for new roles    | High     | `is_exec_or_pm()` expanded to include `director`; new roles fall through to `permission_grants`      |
| Invite links with `role=vendor` in transit    | Medium   | Accept both `vendor` and `collaborator` in invitation acceptance API for 30 days; add compat mapping |
| Third-party integrations referencing `vendor` | Low      | API responses should use new role names; document breaking change                                    |
| `handle_new_user()` trigger default role      | Medium   | Keep `'pm'` default or change to `'member'` — requires business decision                             |
| Test suite breakage                           | Low      | All test updates are mechanical renames + additions                                                  |

---

## 6. Estimated Effort

| Phase                        | Files Changed           | Effort        |
| ---------------------------- | ----------------------- | ------------- |
| Phase 1: DB Migration        | 1 new SQL file          | 2–3 hours     |
| Phase 2: TS Types + Config   | 4 files                 | 3–4 hours     |
| Phase 3: Application Code    | 5–6 files               | 2–3 hours     |
| Phase 4: Tests               | 1 file + new test cases | 2–3 hours     |
| Phase 5: Docs + Verification | 2–3 files               | 1 hour        |
| **Total**                    | **~15 files**           | **~12 hours** |

---

## 7. File Change Manifest

### New Files

- `supabase/migrations/038_rbac_6tier_expansion.sql`

### Modified Files (by phase)

**Phase 2 — Types + Config:**

- `src/types/index.ts` — `PermissionLevel` type
- `src/config/rbac.ts` — `PERMISSION_MATRIX`, `FIELD_VISIBILITY_MASKS`, `shouldRevokeAccess()`
- `src/config/domain-config.ts` — `PERMISSION_LEVELS`
- `src/lib/permissions/field-resolver.ts` — `ROLE_HIERARCHY`

**Phase 3 — Application Code:**

- `src/components/permission-guard.tsx` — `DEFAULT_LEVEL`, `resolvePermissionLevel()`
- `src/app/api/middleware/permissions.ts` — `validRoles`
- `src/app/(dashboard)/onboarding/invite-team/page.tsx` — `ROLE_OPTIONS`
- `src/lib/supabase/auth-context.tsx` — default role fallback
- `src/lib/demo-data-user-lifecycle.ts` — mock data role strings

**Phase 4 — Tests:**

- `src/__tests__/lib/rbac.test.ts` — all role assertions

**Phase 5 — Docs:**

- `docs/ARCHITECTURE_RECOMMENDATIONS.md`
- `docs/API_REFERENCE.md`

---

## 8. Business Decisions (Finalized)

1. **Default role for new signups:** `'member'` — `handle_new_user()` assigns Team Member by default. More restrictive, appropriate for self-service signups.

2. **Director onboarding:** Lighter flow — no org setup step. Keep "invite team member" step. Directors see: verify email → complete profile → invite team → explore dashboard.

3. **Backward compatibility:** **ZERO** backward compatibility. `vendor` is fully removed in one atomic migration. No deprecation window, no compat mapping.

4. **Client portal scope:** Clients can only see **PMs and Directors** on their projects. Team Member names are hidden from client-facing views.

5. **Collaborator self-registration:** Collaborators **can** self-register for platform access, but project access is **invite-only**. Self-registered users who are not invited to a team default to a **sandbox mode** (read-only platform exploration, no project data) until invited to a team/project.
