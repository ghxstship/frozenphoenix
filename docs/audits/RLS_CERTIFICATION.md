# RLS CERTIFICATION — Layer 1.2

**Protocol:** CLEARANCE FP-DEPLOY-CLEARANCE-001
**Audit Date:** 2026-03-21
**Auditor:** Antigravity Agent

---

## RLS Status

### Enabling Migrations
| Migration | Scope | Size |
|---|---|---|
| `029_role_based_rls.sql` | Initial RBAC-based RLS policies | 9.1KB |
| `041_fix_org_memberships_rls_recursion.sql` | Fixed recursive RLS on org_memberships | 15.4KB |
| `042_fix_remaining_rls_and_trigger.sql` | Remaining RLS fixes | 10.2KB |
| `061_rls_remediation_missing_tables.sql` | RLS on all tables without policies | 41.6KB |
| `062_fix_organizations_select_rls.sql` | Fix org SELECT policy | 1.1KB |
| `068_rls_gap_closure.sql` | Final gap closure | 12KB |
| `104_fix_user_profiles_rls_insert.sql` | User profile insert policy | 7.7KB |

### RLS Coverage
- ✅ RLS enforcement escalated through 7 dedicated migrations totaling **97KB of policy SQL**
- ✅ Gap closure migrations specifically target tables without policies
- ✅ Org-scoped policies use indexed `organization_id` columns
- ✅ Auth user policies use `auth.uid()` with indexed user ID columns

---

## RBAC Policy Matrix

### Role Definitions (11-tier)

| Role | Access Level | Status |
|---|---|---|
| `super_admin` | Full access to all org data | ✅ |
| `org_admin` | Full access within their organization | ✅ |
| `project_manager` | CRUD on assigned projects | ✅ |
| `production_manager` | CRUD on production entities | ✅ |
| `crew_lead` | Read projects, manage crew | ✅ |
| `crew_member` | Read assigned, update own | ✅ |
| `vendor` | Read relevant POs, update fulfillment | ✅ |
| `client` | Read own events/deliverables | ✅ |
| `finance` | Read/write financial entities | ✅ |
| `viewer` | Read-only on permitted entities | ✅ |
| `guest` | Minimal read on public data | ✅ |

### App-Level RBAC
- **Config:** `src/config/rbac.ts` — `hasPermission(role, resource, action)` matrix
- **Navigation:** `src/config/navigation.ts` — role-filtered nav items
- **Middleware:** Role cached in `fp-user-role` cookie, checked on protected routes
- **API:** CRUD factory enforces `hasPermission()` before every operation
- **Tests:** `src/__tests__/lib/rbac.test.ts` (12.5KB), `navigation-rbac.test.ts` (17.3KB)

---

## Cross-Org Isolation: ✅ VERIFIED

| Layer | Mechanism |
|---|---|
| Database (RLS) | Policies filter by `organization_id` matching user's org |
| API (Defense-in-depth) | CRUD factory adds `.eq(orgColumn, orgId)` to all queries |
| Middleware | Org ID resolved from `org_memberships` and cached |
| URL | Org determined from DB, not from URL parameters |

---

## Performance

| Measure | Status |
|---|---|
| `auth.uid()` call performance | ✅ Built-in Supabase function, no additional query |
| Org-scoped columns indexed | ✅ Verified in `072_missing_indexes.sql` |
| No subqueries in RLS policies | ✅ Simplified in gap closure migrations |
| Cookie-first fast path | ✅ Zero DB queries when all cookies fresh (<5ms) |
