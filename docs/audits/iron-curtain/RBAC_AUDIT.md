# IRON CURTAIN — Phase 11: RBAC & Permissions Audit

> Audited: 2026-03-21 | Scope: Permission matrix, permission checks, UI guards, field masking

## Executive Summary

| Classification | Count |
|---|---|
| ✅ PASS | 16 |
| 🟡 MINOR | 0 |
| 🔴 BROKEN | 0 |
| ⚫ MISSING | 0 |

---

## Permission Matrix (`rbac.ts` — 794 lines)

| Test | Result | Notes |
|---|---|---|
| 6-tier hierarchy | ✅ PASS | exec → director → pm → member → client → collaborator |
| exec wildcard access | ✅ PASS | `{ resource: "*", actions: ["read","write","delete","manage"] }` |
| 200+ resource-action pairs | ✅ PASS | Comprehensive per-role permission definitions |
| 4 action types | ✅ PASS | `read`, `write`, `delete`, `manage` |
| `hasPermission()` check | ✅ PASS | DB grants first (with deny support), static matrix fallback |
| `resolvePermissionsFromGrants()` | ✅ PASS | Batch resolution with deny-rule subtraction |

## DB Grant Override System

| Test | Result | Notes |
|---|---|---|
| `DbPermissionGrant` interface | ✅ PASS | `role_definition_id`, `resource`, `action`, `scope_type`, `scope_id`, `effect`, `conditions` |
| Deny-before-allow semantics | ✅ PASS | Deny rules checked first; any deny match → false |
| Scope-aware grants | ✅ PASS | `scope_type` + `scope_id` for org/project-scoped permissions |
| Fallthrough to static | ✅ PASS | If DB grants exist but don't match, falls through to `PERMISSION_MATRIX` |

## Field-Level Security

| Test | Result | Notes |
|---|---|---|
| `FIELD_VISIBILITY_MASKS` | ✅ PASS | Financial fields (rate, margin, profit) restricted to exec/director/pm |
| PII fields | ✅ PASS | SSN, tax_id, bank_account restricted to exec only |
| `isFieldVisible()` | ✅ PASS | Returns true for unmasked fields; false for restricted fields at insufficient level |
| `maskSensitiveFields()` | ✅ PASS | Nullifies restricted fields in data objects |

## UI Permission Guards

| Test | Result | Notes |
|---|---|---|
| `PermissionGate` | ✅ PASS | Loading spinner during auth hydration (no Access Denied flash); styled denial card |
| `OwnerGate` | ✅ PASS | Separate gate for org-owner-only sections |
| `FieldGuard` | ✅ PASS | Inline `Lock` icon + placeholder for restricted fields |
| Integration points | ✅ PASS | Used in all shell components: list, detail, form, settings, wizard, operational-dashboard |

## Kill Switch

| Test | Result | Notes |
|---|---|---|
| `shouldRevokeAccess()` | ✅ PASS | Auto-revokes external (client/collaborator) access 48hrs post Load-Out date |
| Internal roles exempt | ✅ PASS | exec/director/pm/member retain access indefinitely |
