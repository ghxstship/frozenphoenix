# ADR-004: Six-Tier RBAC Permission Model

**Date:** 2025-02-10
**Status:** Accepted

## Context

The platform serves multiple user types with vastly different access needs: executives need full financial visibility, clients need curated read-only access, and external collaborators need task-scoped access only.

## Decision

Implement a **six-tier hierarchical RBAC model** as the canonical permission system:

| Tier | Role           | Scope                                              |
| ---- | -------------- | -------------------------------------------------- |
| 1    | `exec`         | Global access — full admin, financial data, PII    |
| 2    | `director`     | Cross-project oversight — broad read, scoped write |
| 3    | `pm`           | Project-scoped — budgets, schedules, tasks         |
| 4    | `member`       | Task execution — assigned work, time tracking      |
| 5    | `client`       | Read-only — approved deliverables, branded views   |
| 6    | `collaborator` | External — task-specific work orders, site maps    |

Architecture:

- **SSOT:** `src/config/rbac.ts` — 812-line permission matrix mapping every role to resource-action pairs
- **Role Hierarchy:** `src/lib/permissions/field-resolver.ts` — numeric rank ordering for role comparison
- **DB-backed Grants:** `permission_grants` table allows dynamic overrides with deny rules
- **Field-Level RBAC:** Visibility masking (VISIBLE/MASKED/REDACTED/HIDDEN) per field per role per pricing tier
- **Permission Cache:** LRU cache with 5-minute TTL to avoid repeated DB lookups
- **Audit Logging:** Denied access attempts logged to `access_audit_log` table

Enforcement points:

- `withApiHandler({ rbac: { resource, action } })` — route-level
- `withPermission(resource, action, handler)` — HOF wrapper
- `checkPermission(resource, action)` — imperative check
- RLS policies — database-level tenant isolation

## Consequences

**Positive:**

- Single permission matrix governs all access — no ad-hoc checks scattered across codebase
- DB-backed grants enable dynamic role customization without code deployment
- Field-level RBAC prevents data leaks for sensitive financial/PII fields
- Audit trail provides compliance-ready access logging

**Negative:**

- Permission matrix is large (812 lines) — requires careful maintenance when adding resources
- DB grant resolution adds latency (mitigated by 5-min LRU cache)
- Six tiers may be more granular than needed for smaller organizations
