# Schema Enrichment Report — Settings, RBAC, Notifications & Audit Tables

> **Migration Sources:** 006, 018, 026, 027, 028, 029, 030
> **Tables:** notification_preferences, user_preferences, settings, setting_definitions, settings_change_log, feature_flags, feature_flag_overrides, role_definitions, permission_grants, brands, access_audit_log, onboarding_step_definitions, user_onboarding_progress, invitations, org_memberships, user_profiles

---

## role_definitions (Migration 028)

| Attribute | Value |
|---|---|
| **Migration** | 028 |
| **Route(s)** | settings/ (role management) |
| **Current Columns** | ~15 |
| **Compliance Score** | 92% |

### Assessment

Enterprise-grade custom role definitions with `key`, `display_name`, `description`, `permissions` JSONB, `is_system_role`, `is_active`, `hierarchy_level`, `max_scope` (global/org/department/project), `allowed_actions`, and `created_by`. Replaces the hardcoded 4-tier RBAC model. Well-designed.

### Gap

Missing `inherits_from` UUID FK for role inheritance chains (e.g., pm inherits from client permissions).

---

## permission_grants (Migration 028)

| Attribute | Value |
|---|---|
| **Migration** | 028 |
| **Route(s)** | All (authorization layer) |
| **Current Columns** | ~12 |
| **Compliance Score** | 90% |

### Assessment

Per-role, per-scope, per-resource permission rules with `resource`, `action`, `scope_type` (global/org/project/department), `scope_id`, `effect` (allow/deny), `conditions` JSONB, and `is_active`. Already consumed by `src/app/api/middleware/permissions.ts`.

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `expires_at` | FT-TEMP-002 | TIMESTAMPTZ | Temporal permission grants; contractor access windows | pro |
| `granted_by` | FT-ID-004 | UUID FK | Audit trail for permission delegation; SOC2 CC6.1 | core |

---

## access_audit_log (Migration 028)

| Attribute | Value |
|---|---|
| **Migration** | 028 |
| **Route(s)** | settings/ (audit dashboard) |
| **Current Columns** | ~12 |
| **Compliance Score** | 95% |

### Assessment

Immutable permission check log with `user_id`, `resource`, `action`, `scope_type`, `scope_id`, `granted` (boolean), `role_key`, `metadata` JSONB, and `created_at`. Append-only with no UPDATE/DELETE policies. SOC2 CC7.1 compliant. No enrichment needed.

---

## settings / setting_definitions / settings_change_log (Migration 026)

| Attribute | Value |
|---|---|
| **Migration** | 026 |
| **Route(s)** | settings/ |
| **Compliance Score** | 92% |

### Assessment

Hierarchical settings store with scope-based resolution (platform → org → department → project → user), locking semantics, version control, and immutable change log. `setting_definitions` provides schema validation rules and default values. Already consumed by `src/lib/settings/`. Enterprise-grade. No enrichment needed.

---

## feature_flags / feature_flag_overrides (Migration 027)

| Attribute | Value |
|---|---|
| **Migration** | 027 |
| **Route(s)** | settings/ (feature management) |
| **Compliance Score** | 90% |

### Assessment

Feature flag definitions with targeting rules (org, role, env, region, percentage), lifecycle status, and per-scope overrides. Already consumed by `src/lib/settings/feature-flags.ts`. Well-designed.

### Gap

Missing `rollout_percentage_step` for gradual rollout automation.

---

## brands (Migration 029)

| Attribute | Value |
|---|---|
| **Migration** | 029 |
| **Route(s)** | settings/ (branding) |
| **Current Columns** | ~20 |
| **Compliance Score** | 88% |

### Assessment

DB-backed brand configurations replacing file-based `brands/*.ts`. Includes logo URLs, color tokens, typography, and custom CSS. Links to organizations for tenant-specific branding. Adequate for white-label deployment.

### Gap

Missing `custom_domain` TEXT field for white-label vanity URLs (e.g., `app.clientname.com`).

---

## notification_preferences (Migration 006)

| Attribute | Value |
|---|---|
| **Migration** | 006 |
| **Route(s)** | settings/ |
| **Current Columns** | ~8 |
| **Compliance Score** | 78% |

### Assessment

Per-user notification channel preferences (email, push, in_app) per notification type. Currently rendered as hardcoded toggles in the UI — needs wiring to actual DB reads/writes.

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `quiet_hours_start` | FT-TEXT-001 | TEXT | Do-not-disturb window start (HH:MM) | core |
| `quiet_hours_end` | FT-TEXT-001 | TEXT | Do-not-disturb window end (HH:MM) | core |
| `digest_frequency` | FT-TEXT-001 | TEXT | Email digest cadence (realtime/daily/weekly) | core |

---

## onboarding_step_definitions / user_onboarding_progress (Migration 025)

| Attribute | Value |
|---|---|
| **Migration** | 025 |
| **Route(s)** | onboarding/ |
| **Compliance Score** | 90% |

### Assessment

Template-driven onboarding with step definitions (order, category, target roles, completion criteria) and per-user progress tracking. Already consumed by `src/app/api/onboarding/progress/route.ts` and `src/components/onboarding/onboarding-checklist.tsx`. No enrichment needed.

---

## invitations (Migration 018)

| Attribute | Value |
|---|---|
| **Migration** | 018 |
| **Route(s)** | settings/, onboarding/ |
| **Current Columns** | 12 |
| **Compliance Score** | 85% |

### Assessment

Bulk invitation system with token-based acceptance, role assignment, expiry, and status tracking. Already consumed by API routes. Enrichment recommendations covered in core-tables.md.
