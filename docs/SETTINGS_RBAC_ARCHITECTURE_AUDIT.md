# Settings, RBAC & Configuration Architecture Audit

**Platform:** FrozenPhoenix / Playbook
**Date:** 2026-02-27
**Scope:** Schema, permissions, inheritance, control plane, feature flags, multi-tenant governance
**Deployment Readiness Score: 3/10**

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Hierarchical Architecture Map](#2-hierarchical-architecture-map)
3. [Settings Taxonomy](#3-settings-taxonomy)
4. [RBAC Model Specification](#4-rbac-model-specification)
5. [Inheritance & Override Framework](#5-inheritance--override-framework)
6. [Schema & Data Model Improvements](#6-schema--data-model-improvements)
7. [Security Risk Assessment](#7-security-risk-assessment)
8. [UI & Control Panel Architecture](#8-ui--control-panel-architecture)
9. [Automation & Governance](#9-automation--governance)
10. [P0 / P1 / P2 Implementation Roadmap](#10-p0--p1--p2-implementation-roadmap)

---

## 1. Executive Summary

### Current State

The platform has **strong schema foundations** (migration 018 delivers enterprise-grade user lifecycle, org memberships, session tracking, audit logging, compliance acknowledgments, data retention) but **critical implementation gaps** prevent production use as a governed multi-tenant SaaS.

### Key Findings

| Area | Status | Score |
|------|--------|-------|
| **Hierarchical Settings** | 3 of 11 layers exist in DB | 🔴 2/10 |
| **RBAC** | 4-tier static matrix; no DB-backed custom roles | 🟡 4/10 |
| **Inheritance & Override** | Zero implementation | 🔴 0/10 |
| **Feature Flags** | Zero implementation | 🔴 0/10 |
| **Settings Schema** | org.settings JSONB blob; no typed tables | 🔴 1/10 |
| **Notification Preferences** | Schema exists (migration 006); UI is hardcoded mock | 🟡 3/10 |
| **User Preferences** | Schema exists (migration 018); UI disconnected | 🟡 3/10 |
| **Tenant Isolation** | RLS uses legacy `profiles` table; dual-table problem | 🟡 4/10 |
| **Permission Enforcement** | Client-side only; no server-side route guards | 🔴 2/10 |
| **Audit Trail** | Schema exists; no write path from application | 🟡 3/10 |
| **Brand/White-Label** | Config-file-only; no DB-backed tenant branding | 🟡 4/10 |

### Critical Violations

1. **No server-side permission enforcement** — RBAC is evaluated entirely in browser via `permission-guard.tsx`. Any authenticated user can call Supabase RPCs/queries directly. RLS provides org-level isolation but not role-level resource restriction.

2. **Settings page is 100% mock** — `settings/page.tsx` renders hardcoded data ("Alex Rivera", static team members). No Supabase reads/writes. Notification toggles are non-functional.

3. **Zero inheritance chain** — No mechanism for Platform → Org → Brand → Project → User setting cascading. The `organizations.settings` JSONB column (added in migration 018) is never read or written by the application.

4. **No feature flag system** — No DB table, no config, no runtime evaluation. The `brands/types.ts` `features` object (`enableDarkMode`, `enableAnimations`, `enableGlassEffects`) is the closest equivalent but is compile-time-only and brand-scoped.

5. **Dual-table identity crisis** — `profiles` (migration 001) vs `user_profiles` (migration 018). Auth context reads `profiles`. RLS policies on 20+ tables use `get_user_org_id()` which queries `profiles`. The canonical `user_profiles` + `org_memberships` schema is orphaned from the running application.

6. **No custom roles** — Only 4 hardcoded tiers (`exec`, `pm`, `client`, `vendor`). No DB-backed role definitions, no custom permissions, no permission inheritance between roles.

---

## 2. Hierarchical Architecture Map

### 2.1 Required Layers (11)

```
┌─────────────────────────────────────────────────────────────────┐
│ L0  PLATFORM (Global / Super Admin)                             │
│     System defaults, compliance policies, feature catalog       │
├─────────────────────────────────────────────────────────────────┤
│ L1  ENVIRONMENT (Dev / Staging / Prod)                          │
│     API keys, endpoints, debug flags, rate limits               │
├─────────────────────────────────────────────────────────────────┤
│ L2  ORGANIZATION (Tenant)                                       │
│     Org-level security, branding, defaults, billing plan        │
├─────────────────────────────────────────────────────────────────┤
│ L3  BRAND (White-Label Variant)                                 │
│     Visual identity, domain mapping, copy tone                  │
├─────────────────────────────────────────────────────────────────┤
│ L4  DEPARTMENT                                                  │
│     Department-specific workflows, approval chains, budgets     │
├─────────────────────────────────────────────────────────────────┤
│ L5  PROJECT                                                     │
│     Project-scoped settings, budgets, phase gates               │
├─────────────────────────────────────────────────────────────────┤
│ L6  ACTIVATION / EVENT INSTANCE                                 │
│     Event-specific overrides, live-ops config, crew rules       │
├─────────────────────────────────────────────────────────────────┤
│ L7  TEAM                                                        │
│     Team-specific visibility, notification routing              │
├─────────────────────────────────────────────────────────────────┤
│ L8  ROLE                                                        │
│     Permission templates, field visibility, UI restrictions     │
├─────────────────────────────────────────────────────────────────┤
│ L9  USER                                                        │
│     Personal preferences, notification settings, theme          │
├─────────────────────────────────────────────────────────────────┤
│ L10 FEATURE FLAGS                                               │
│     Cross-cutting: per-tenant, per-role, per-region, per-env    │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Current Coverage

| Layer | DB Schema | Application Code | UI | Status |
|-------|-----------|------------------|----|--------|
| L0 Platform | ❌ None | ❌ None | ❌ None | **MISSING** |
| L1 Environment | ❌ None (env vars only) | ⚠️ `process.env` | ❌ None | **MISSING** |
| L2 Organization | ⚠️ `organizations.settings` JSONB | ❌ Never read | ⚠️ Mock UI | **BROKEN** |
| L3 Brand | ❌ File-only (`brands/*.ts`) | ✅ `getActiveBrand()` | ❌ No admin UI | **PARTIAL** |
| L4 Department | ❌ None | ❌ None | ❌ None | **MISSING** |
| L5 Project | ❌ No project_settings table | ❌ None | ❌ None | **MISSING** |
| L6 Activation/Event | ❌ None | ❌ None | ❌ None | **MISSING** |
| L7 Team | ❌ None | ❌ None | ❌ None | **MISSING** |
| L8 Role | ⚠️ Hardcoded `CHECK` constraint | ⚠️ Static `rbac.ts` | ⚠️ Read-only viewer | **PARTIAL** |
| L9 User | ✅ `user_preferences` table | ❌ Never read | ⚠️ Mock settings | **BROKEN** |
| L10 Feature Flags | ❌ None | ❌ None | ❌ None | **MISSING** |

### 2.3 Scope Boundary Definitions

| Layer | Scope Key | Isolates | Inherits From |
|-------|-----------|----------|---------------|
| Platform | `platform:*` | Nothing (global) | — |
| Environment | `env:{dev\|staging\|prod}` | Secrets, endpoints | Platform |
| Organization | `org:{uuid}` | All tenant data | Platform + Environment |
| Brand | `brand:{id}` | Visual identity | Organization |
| Department | `dept:{uuid}` | Approval chains, budgets | Organization |
| Project | `project:{uuid}` | Tasks, crew, assets | Organization + Department |
| Activation | `activation:{uuid}` | Live-ops config | Project |
| Team | `team:{uuid}` | Visibility, routing | Project or Department |
| Role | `role:{id}` | Permissions | Organization |
| User | `user:{uuid}` | Personal prefs | Role + Organization |
| Feature Flag | `flag:{key}` | Cross-cutting | Multiple (OR evaluation) |

### 2.4 Conflict Resolution Logic (Proposed)

**Precedence rule:** More-specific scope wins, evaluated bottom-up.

```
User > Team > Activation > Project > Department > Brand > Organization > Environment > Platform
```

**Lock semantics:**
- `locked_at: "org"` — Organization admin locked this setting; project/user cannot override
- `locked_at: "platform"` — Super admin locked; no tenant override
- `locked_at: null` — Freely overridable at any lower scope

**Resolution algorithm:**
```
function resolveSettingValue(key, scopes[]):
  for scope in scopes (most-specific first):
    value = lookupSetting(key, scope)
    if value exists:
      if value.locked_at and value.locked_at != scope:
        continue  // respect lock from higher scope
      return value
  return platformDefault(key)
```

---

## 3. Settings Taxonomy

### 3.1 Category A: Governance & Compliance

| Setting Key | Type | Default | Scope | Lock Level | DB Status |
|-------------|------|---------|-------|------------|-----------|
| `governance.data_retention_days` | integer | 730 | Org | Platform | ✅ `data_retention_policies` table |
| `governance.audit_log_enabled` | boolean | true | Org | Platform | ⚠️ Schema exists, no write path |
| `governance.require_compliance_ack` | boolean | true | Org | Platform | ✅ `user_compliance_acks` table |
| `governance.mfa_enforcement` | enum(off/optional/required) | optional | Org | Org | ⚠️ `organizations.require_mfa` exists |
| `governance.sso_enforcement` | boolean | false | Org | Org | ⚠️ `organizations.enforce_sso` exists |
| `governance.session_timeout_hours` | integer | 720 | Org | Org | ⚠️ `organizations.session_timeout_hours` exists |
| `governance.max_sessions_per_user` | integer | 5 | Org | Org | ⚠️ `organizations.max_sessions_per_user` exists |
| `governance.invitation_expiry_days` | integer | 7 | Org | Org | ⚠️ `organizations.invitation_expiry_days` exists |
| `governance.allowed_email_domains` | text[] | [] | Org | Org | ⚠️ `organizations.allowed_email_domains` exists |
| `governance.legal_disclaimer_url` | text | null | Org | Platform | ❌ **MISSING** |
| `governance.privacy_policy_url` | text | null | Org | Platform | ❌ **MISSING** |
| `governance.soc2_mode` | boolean | false | Org | Platform | ❌ **MISSING** |

**Finding:** Migration 018 added org-level security columns but the application never reads or writes them. The settings page does not expose MFA enforcement, SSO, session limits, or email domain restrictions.

### 3.2 Category B: Security Controls

| Setting Key | Type | Default | Scope | Lock Level | DB Status |
|-------------|------|---------|-------|------------|-----------|
| `security.password_min_length` | integer | 8 | Org | Platform | ❌ **MISSING** — delegated to Supabase auth config |
| `security.password_require_uppercase` | boolean | true | Org | Platform | ❌ **MISSING** |
| `security.password_require_special` | boolean | true | Org | Platform | ❌ **MISSING** |
| `security.ip_allowlist` | text[] | [] | Org | Org | ❌ **MISSING** |
| `security.device_trust_enabled` | boolean | false | Org | Org | ❌ **MISSING** |
| `security.api_token_max_lifetime_days` | integer | 365 | Org | Org | ❌ **MISSING** (schema has `expires_at` but no policy) |
| `security.access_log_retention_days` | integer | 730 | Org | Platform | ⚠️ In `data_retention_policies` seed |
| `security.auto_revoke_external_hours` | integer | 48 | Org | Org | ⚠️ Hardcoded in `rbac.ts:shouldRevokeAccess()` |
| `security.csp_policy` | text | null | Org | Platform | ❌ **MISSING** — noted in prior audit |

**Finding:** Password policy is entirely Supabase-side with no platform control. The 48-hour kill switch is hardcoded in `rbac.ts` line 359, not configurable per-org.

### 3.3 Category C: Operational Controls

| Setting Key | Type | Default | Scope | Lock Level | DB Status |
|-------------|------|---------|-------|------------|-----------|
| `ops.default_project_phase` | enum | pre_production | Org | Org | ❌ **MISSING** |
| `ops.budget_approval_threshold` | numeric | 5000 | Org+Project | Org | ❌ **MISSING** (schema has `threshold_amount` per approval) |
| `ops.auto_escalation_hours` | integer | 72 | Org | Org | ⚠️ `approval_workflows.auto_escalation_hours` exists per workflow |
| `ops.require_3way_match` | boolean | true | Org | Org | ❌ **MISSING** |
| `ops.default_currency` | text | USD | Org | Org | ❌ **MISSING** |
| `ops.fiscal_year_start_month` | integer | 1 | Org | Org | ❌ **MISSING** |
| `ops.naming_convention` | enum | snake_case | Org | Org | ❌ **MISSING** |
| `ops.template_auto_provision` | boolean | true | Org | Org | ❌ **MISSING** |
| `ops.notification_digest_schedule` | enum | daily | Org+User | User | ❌ **MISSING** |

### 3.4 Category D: Branding & Theming

| Setting Key | Type | Default | Scope | Lock Level | DB Status |
|-------------|------|---------|-------|------------|-----------|
| `brand.logo_icon_url` | text | /logo-icon.svg | Brand | Brand | ❌ File-only (`brands/*.ts`) |
| `brand.logo_wordmark_url` | text | null | Brand | Brand | ❌ File-only |
| `brand.primary_color` | hsl | 220 70% 50% | Brand | Brand | ❌ File-only |
| `brand.accent_color` | hsl | 31 97% 60% | Brand | Brand | ❌ File-only |
| `brand.font_family` | text | Geist Sans | Brand | Brand | ❌ File-only |
| `brand.domain_mapping` | text | null | Brand | Platform | ❌ **MISSING** |
| `brand.enable_dark_mode` | boolean | true | Brand | Brand | ❌ File-only |
| `brand.enable_animations` | boolean | true | Brand | Brand | ❌ File-only |
| `brand.custom_css_url` | text | null | Brand | Brand | ❌ **MISSING** |

**Finding:** Brand configuration lives entirely in `src/config/brands/*.ts`. Adding a new tenant brand requires a code deployment. No DB-backed brand table exists.

### 3.5 Category E: Feature Access

| Setting Key | Type | Default | Scope | Lock Level | DB Status |
|-------------|------|---------|-------|------------|-----------|
| `feature.module_crm` | boolean | true | Org | Platform | ❌ **MISSING** |
| `feature.module_production` | boolean | true | Org | Platform | ❌ **MISSING** |
| `feature.module_finance` | boolean | true | Org | Platform | ❌ **MISSING** |
| `feature.module_live_ops` | boolean | true | Org | Platform | ❌ **MISSING** |
| `feature.module_legal` | boolean | true | Org | Platform | ❌ **MISSING** |
| `feature.module_creative` | boolean | true | Org | Platform | ❌ **MISSING** |
| `feature.beta_ai_copilot` | boolean | false | Org+Role | Platform | ❌ **MISSING** |
| `feature.experimental_gantt` | boolean | false | Org | Platform | ❌ **MISSING** |
| `feature.tier_entitlement` | enum(starter/pro/enterprise) | pro | Org | Platform | ❌ **MISSING** |

**Finding:** Zero feature flag infrastructure exists. All modules are always visible to all tenants. No tier-based entitlement system.

### 3.6 Category F: Notification Preferences

| Setting Key | Type | Default | Scope | Lock Level | DB Status |
|-------------|------|---------|-------|------------|-----------|
| `notifications.email_enabled` | boolean | true | User | User | ⚠️ `notification_preferences.email_enabled` exists |
| `notifications.push_enabled` | boolean | true | User | User | ⚠️ `notification_preferences.push_enabled` exists |
| `notifications.sms_enabled` | boolean | false | User | User | ⚠️ `notification_preferences.sms_enabled` exists |
| `notifications.in_app_enabled` | boolean | true | User | User | ⚠️ `notification_preferences.in_app_enabled` exists |
| `notifications.categories` | jsonb | {...} | User | User | ⚠️ `notification_preferences.categories` exists |
| `notifications.digest_schedule` | enum | immediate | User | Org | ⚠️ `notification_preferences.digest_schedule` exists |
| `notifications.quiet_hours_start` | time | null | User | User | ⚠️ `notification_preferences.quiet_hours_start` exists |
| `notifications.quiet_hours_end` | time | null | User | User | ⚠️ `notification_preferences.quiet_hours_end` exists |
| `notifications.escalation_delay_mins` | integer | 60 | Org | Org | ❌ **MISSING** |

**Finding:** Migration 006 created a comprehensive `notification_preferences` table. The settings UI in `settings/page.tsx` renders hardcoded toggles that never read or write this table. No Supabase hook exists for `notification_preferences`.

### 3.7 Category G: Personal User Preferences

| Setting Key | Type | Default | Scope | Lock Level | DB Status |
|-------------|------|---------|-------|------------|-----------|
| `prefs.theme` | enum(light/dark/system) | dark | User | User | ⚠️ `user_preferences` table exists but disconnected |
| `prefs.timezone` | text | America/New_York | User | User | ⚠️ `user_profiles.timezone` exists |
| `prefs.locale` | text | en-US | User | User | ⚠️ `user_profiles.locale` exists |
| `prefs.date_format` | text | MM/DD/YYYY | User | User | ⚠️ `user_profiles.date_format` exists |
| `prefs.layout_density` | enum(compact/default/comfortable) | default | User | User | ❌ **MISSING** |
| `prefs.dashboard_layout` | jsonb | null | User | User | ❌ **MISSING** |
| `prefs.saved_filters` | jsonb | {} | User | User | ❌ **MISSING** |
| `prefs.sidebar_pinned` | text[] | [] | User | User | ⚠️ Zustand `localStorage` — not DB-persisted |
| `prefs.sidebar_collapsed` | boolean | false | User | User | ⚠️ Zustand `localStorage` — not DB-persisted |
| `prefs.command_bar_recent` | text[] | [] | User | User | ❌ **MISSING** |

**Finding:** The `user_preferences` key-value table (migration 018) is architecturally sound but the application never queries it. User prefs like sidebar state are in browser `localStorage` via Zustand, meaning they don't sync across devices or survive cache clears. Theme preference in `settings/page.tsx` is local React state that does nothing.

### 3.8 Tokenization Strategy

**Current anti-patterns:**
1. `rbac.ts` line 359: `hoursElapsed >= 48` — hardcoded kill-switch threshold
2. `middleware.ts` lines 61, 77: Hardcoded path arrays (`publicPaths`, `authPaths`)
3. `settings/page.tsx` lines 92-105: Hardcoded "Alex Rivera" profile data
4. `brands/types.ts` line 76: `BrandId` type = compile-time union instead of DB-resolved

**Required tokenization:**
- All policy values → `platform_settings` or `org_settings` table
- All thresholds → configurable per-org
- All path lists → `navigation` config or DB
- All brand definitions → DB-backed with API

---

## 4. RBAC Model Specification

### 4.1 Current Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    CURRENT RBAC                          │
│                                                          │
│  ┌─────────────────┐     ┌──────────────────────────┐   │
│  │ auth-context.tsx │────▶│ profiles table (legacy)   │   │
│  │ reads .role      │     │ role: exec|pm|client|vnd  │   │
│  └────────┬────────┘     └──────────────────────────┘   │
│           │                                              │
│           ▼                                              │
│  ┌─────────────────────┐                                 │
│  │ permission-guard.tsx │  CLIENT-SIDE ONLY              │
│  │ usePermissionLevel() │──▶ reads profile.role          │
│  │ useHasPermission()   │──▶ checks PERMISSION_MATRIX    │
│  └─────────┬───────────┘                                 │
│            │                                             │
│            ▼                                             │
│  ┌──────────────────────┐                                │
│  │ rbac.ts (static)      │                               │
│  │ PERMISSION_MATRIX     │  4 tiers × ~180 resources     │
│  │ FIELD_VISIBILITY_MASKS│  ~20 sensitive fields          │
│  │ shouldRevokeAccess()  │  48hr kill switch              │
│  └──────────────────────┘                                │
│                                                          │
│  ┌──────────────────────┐                                │
│  │ sidebar.tsx           │                               │
│  │ filterSectionsByPerm()│  Nav filtering (client-side)  │
│  └──────────────────────┘                                │
│                                                          │
│  ┌──────────────────────┐                                │
│  │ Supabase RLS          │  SERVER-SIDE                  │
│  │ get_user_org_id()     │──▶ org isolation only          │
│  │ No role-based RLS     │  All org members see same data │
│  └──────────────────────┘                                │
└──────────────────────────────────────────────────────────┘
```

### 4.2 Critical Gaps

| Gap | Severity | Description |
|-----|----------|-------------|
| **No server-side RBAC** | 🔴 P0 | Any authenticated user can query any Supabase table their org owns. A `vendor` user can SELECT `crew_members.hourly_rate` directly via Supabase client. Field masking is client-only. |
| **No scoped permissions** | 🔴 P0 | Permissions are tier-wide, not project-scoped. A `pm` has identical access to ALL projects in their org, even ones they're not a member of. |
| **No custom roles** | 🟡 P1 | Cannot create "Junior PM" with write access to tasks but not budgets. Only 4 fixed tiers. |
| **No conditional permissions** | 🟡 P1 | No time-based, status-based, or context-based permission rules (e.g., "can edit only during pre-production phase"). |
| **No delegation** | 🟡 P1 | No mechanism for temporary permission elevation or delegation. `temporary_access_grants` table exists but has no application integration. |
| **Default level = exec** | 🔴 P0 | `permission-guard.tsx` line 11: `const DEFAULT_LEVEL: PermissionLevel = "exec"`. If profile fetch fails, user gets FULL admin access. |
| **No permission caching** | 🟡 P1 | `hasPermission()` does a linear scan of the matrix on every render. |

### 4.3 Proposed Permission Matrix Model

```sql
-- Role Definitions (DB-backed, per-org)
CREATE TABLE role_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    key TEXT NOT NULL,                    -- e.g., 'exec', 'pm', 'junior_pm'
    label TEXT NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,      -- true for built-in roles
    is_active BOOLEAN DEFAULT true,
    parent_role_id UUID REFERENCES role_definitions(id),  -- inheritance
    priority INTEGER NOT NULL DEFAULT 0,  -- conflict resolution
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, key)
);

-- Permission Grants (per role, per scope)
CREATE TABLE permission_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_definition_id UUID NOT NULL REFERENCES role_definitions(id) ON DELETE CASCADE,
    resource TEXT NOT NULL,               -- e.g., 'projects', 'budgets'
    action TEXT NOT NULL CHECK (action IN ('read', 'write', 'delete', 'manage')),
    scope_type TEXT CHECK (scope_type IN ('global', 'org', 'project', 'activation', 'team')),
    scope_id UUID,                        -- NULL = all within scope_type
    conditions JSONB DEFAULT '{}',        -- e.g., {"phase": "pre_production"}
    field_restrictions TEXT[],            -- fields user CAN see (whitelist)
    field_exclusions TEXT[],              -- fields user CANNOT see (blacklist)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_definition_id, resource, action, scope_type, scope_id)
);

-- Seed system roles
INSERT INTO role_definitions (organization_id, key, label, is_system, priority) VALUES
    (NULL, 'super_admin', 'Super Admin', true, 0),    -- Platform level
    (NULL, 'exec', 'Executive', true, 10),
    (NULL, 'pm', 'Project Manager', true, 20),
    (NULL, 'client', 'Client', true, 30),
    (NULL, 'vendor', 'Vendor', true, 40);
```

### 4.4 RLS Enhancement Plan

```sql
-- Add role-aware RLS helper
CREATE OR REPLACE FUNCTION user_has_permission(
    p_resource TEXT,
    p_action TEXT,
    p_scope_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    has_perm BOOLEAN;
BEGIN
    -- Get user's role in their default org
    SELECT role INTO user_role
    FROM org_memberships
    WHERE user_id = auth.uid()
      AND status = 'active'
      AND is_default_org = true
    LIMIT 1;

    -- Check permission_grants
    SELECT EXISTS (
        SELECT 1 FROM permission_grants pg
        JOIN role_definitions rd ON rd.id = pg.role_definition_id
        WHERE rd.key = user_role
          AND pg.resource = p_resource
          AND pg.action = p_action
          AND pg.is_active = true
          AND (pg.scope_id IS NULL OR pg.scope_id = p_scope_id)
    ) INTO has_perm;

    RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example: Role-aware RLS on crew_members
CREATE POLICY "role_based_crew_access" ON crew_members
    FOR SELECT USING (
        organization_id = get_user_org_id()
        AND user_has_permission('crew', 'read')
    );
```

### 4.5 Privilege Escalation Prevention

| Vector | Current Risk | Mitigation |
|--------|-------------|------------|
| Default exec fallback | 🔴 Critical | Change `DEFAULT_LEVEL` to `"vendor"` (least privilege) |
| Client-side role storage | 🔴 Critical | Server-side role resolution via RLS helper |
| Profile.role mutation | 🟡 High | RLS: only exec can UPDATE `org_memberships.role` |
| Direct Supabase queries | 🔴 Critical | Role-based RLS on ALL tables |
| API token scope bypass | 🟡 High | Token `permission_level` enforcement in RLS |
| Temp grant abuse | 🟡 Medium | Max duration policy, auto-expire cron |

### 4.6 Audit Log Integration

The `role_change_log` table (migration 018) and `governance_audit_log` (migration 016) exist but have no application write paths. Required integration:

1. **All permission checks** → log to `access_audit_log` (new table)
2. **All setting changes** → log to `settings_change_log` (new table)
3. **All role mutations** → already handled by `trg_log_role_change` trigger
4. **Failed access attempts** → log to `access_audit_log` with `success = false`

---

## 5. Inheritance & Override Framework

### 5.1 Current State: Zero Implementation

No inheritance chain exists. Settings are either:
- Hardcoded in TypeScript files (brand colors, RBAC matrix, kill-switch threshold)
- Stored in unread DB columns (`organizations.settings`, `organizations.require_mfa`)
- In browser localStorage (sidebar state, theme)

### 5.2 Proposed Inheritance Model

```
┌─────────────────────────────────────────────────────┐
│              SETTINGS RESOLUTION CHAIN               │
│                                                      │
│  Request: resolve("security.session_timeout_hours",  │
│           scopes: [user:abc, project:xyz, org:123])  │
│                                                      │
│  1. Check user:abc → not set                         │
│  2. Check project:xyz → not set                      │
│  3. Check org:123 → value: 168, locked: true         │
│  4. Check platform → value: 720 (default)            │
│                                                      │
│  Result: 168 (org locked it, user cannot override)   │
└─────────────────────────────────────────────────────┘
```

### 5.3 Proposed Schema

```sql
-- Unified Settings Table (replaces organizations.settings JSONB)
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope_type TEXT NOT NULL CHECK (scope_type IN (
        'platform', 'environment', 'organization', 'brand',
        'department', 'project', 'activation', 'team', 'role', 'user'
    )),
    scope_id UUID,                          -- NULL for platform scope
    category TEXT NOT NULL,                 -- e.g., 'security', 'governance'
    key TEXT NOT NULL,                      -- e.g., 'session_timeout_hours'
    value JSONB NOT NULL,                   -- typed via application layer
    value_type TEXT NOT NULL CHECK (value_type IN (
        'boolean', 'integer', 'float', 'text', 'enum', 'text_array', 'jsonb'
    )),
    is_locked BOOLEAN DEFAULT false,        -- prevents lower scopes from overriding
    locked_by UUID REFERENCES user_profiles(id),
    locked_at TIMESTAMPTZ,
    locked_reason TEXT,
    inherit_from_parent BOOLEAN DEFAULT true,
    version INTEGER NOT NULL DEFAULT 1,
    previous_value JSONB,                   -- for rollback
    changed_by UUID REFERENCES user_profiles(id),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(scope_type, scope_id, category, key)
);

-- Setting Definitions (schema for validation)
CREATE TABLE setting_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    key TEXT NOT NULL,
    label TEXT NOT NULL,
    description TEXT,
    value_type TEXT NOT NULL,
    default_value JSONB NOT NULL,
    allowed_values JSONB,                   -- for enum types
    min_value NUMERIC,                      -- for integer/float
    max_value NUMERIC,
    min_scope TEXT NOT NULL DEFAULT 'user', -- lowest scope that can set this
    max_scope TEXT NOT NULL DEFAULT 'platform', -- highest scope
    is_sensitive BOOLEAN DEFAULT false,     -- requires elevated permissions
    requires_restart BOOLEAN DEFAULT false,
    deprecated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(category, key)
);

-- Settings Change Log (immutable audit trail)
CREATE TABLE settings_change_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_id UUID NOT NULL REFERENCES settings(id),
    scope_type TEXT NOT NULL,
    scope_id UUID,
    category TEXT NOT NULL,
    key TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    changed_by UUID NOT NULL REFERENCES user_profiles(id),
    change_reason TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature Flags
CREATE TABLE feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    description TEXT,
    flag_type TEXT NOT NULL CHECK (flag_type IN ('boolean', 'percentage', 'variant')),
    default_value JSONB NOT NULL DEFAULT 'false',
    is_active BOOLEAN DEFAULT true,
    
    -- Targeting rules
    target_orgs UUID[] DEFAULT '{}',
    target_roles TEXT[] DEFAULT '{}',
    target_environments TEXT[] DEFAULT '{}',
    target_regions TEXT[] DEFAULT '{}',
    target_user_ids UUID[] DEFAULT '{}',
    rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    
    -- Lifecycle
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE feature_flag_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
    scope_type TEXT NOT NULL CHECK (scope_type IN ('organization', 'project', 'user', 'role')),
    scope_id UUID NOT NULL,
    value JSONB NOT NULL,
    reason TEXT,
    created_by UUID REFERENCES user_profiles(id),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(flag_id, scope_type, scope_id)
);
```

### 5.4 Precedence Matrix

| Setting Type | Platform | Env | Org | Brand | Dept | Project | Activation | Team | Role | User |
|-------------|----------|-----|-----|-------|------|---------|------------|------|------|------|
| Security policies | ✅ Set | — | ✅ Override | — | — | — | — | — | — | — |
| Branding | — | — | ✅ Set | ✅ Override | — | — | — | — | — | — |
| Operational defaults | ✅ Default | — | ✅ Override | — | ✅ Override | ✅ Override | ✅ Override | — | — | — |
| Notification prefs | ✅ Default | — | ✅ Default | — | — | — | — | — | — | ✅ Override |
| Feature flags | ✅ Default | ✅ Override | ✅ Override | — | — | ✅ Override | — | — | ✅ Override | ✅ Override |
| UI preferences | — | — | — | — | — | — | — | — | — | ✅ Set |

### 5.5 Edge Case Handling

| Scenario | Behavior |
|----------|----------|
| **Deleted parent org** | All settings in child scopes become orphaned → cascade soft-delete |
| **Reassigned project** | Project settings stay; org-inherited values re-resolve to new org |
| **Archived brand** | Brand-scoped settings frozen; fallback to org defaults for active users |
| **Expired feature flag** | Flag evaluates to `default_value`; override records preserved for audit |
| **Conflicting role + user** | User-level wins (more specific) unless role has `is_locked = true` |
| **Migration drift** | Nightly cron compares `setting_definitions` vs `settings` → alerts on orphaned keys |

---

## 6. Schema & Data Model Improvements

### 6.1 Missing Tables

| Table | Purpose | Priority |
|-------|---------|----------|
| `settings` | Unified hierarchical settings store | 🔴 P0 |
| `setting_definitions` | Setting schema + validation rules | 🔴 P0 |
| `settings_change_log` | Immutable audit trail for setting mutations | 🔴 P0 |
| `feature_flags` | Feature flag definitions | 🔴 P0 |
| `feature_flag_overrides` | Per-scope flag overrides | 🔴 P0 |
| `role_definitions` | DB-backed custom roles | 🟡 P1 |
| `permission_grants` | Per-role, per-scope permission rules | 🟡 P1 |
| `brands` | DB-backed brand configurations (replaces file-only) | 🟡 P1 |
| `department_settings` | Department-scoped config | 🟡 P1 |
| `project_settings` | Project-scoped config | 🟡 P1 |
| `access_audit_log` | Permission check log (denied attempts) | 🟡 P1 |

### 6.2 Anti-Pattern Report

| ID | Anti-Pattern | Location | Fix |
|----|-------------|----------|-----|
| AP-1 | **JSONB blob for structured data** | `organizations.settings JSONB DEFAULT '{}'` | Replace with typed `settings` table rows |
| AP-2 | **Dual identity tables** | `profiles` + `user_profiles` | Deprecate `profiles`; migrate all FKs and RLS to `user_profiles` |
| AP-3 | **Duplicate notification prefs** | `notification_preferences` (migration 006) + `user_preferences` (migration 018) | Consolidate into `user_preferences` with `category = 'notifications'` |
| AP-4 | **CHECK constraint as enum** | `org_memberships.role CHECK (role IN ('exec','pm','client','vendor'))` | Reference `role_definitions.key` via FK |
| AP-5 | **Untyped JSONB categories** | `notification_preferences.categories JSONB` | Move to `user_preferences` with typed keys |
| AP-6 | **Hardcoded role strings** | 20+ SQL migration files hardcode `'exec'`, `'pm'`, `'client'`, `'vendor'` | Migrate to `role_definitions` FK references |
| AP-7 | **No versioning on settings** | `organizations.settings` has no version tracking | New `settings` table has `version` column + `previous_value` |
| AP-8 | **RLS uses deprecated table** | 22+ RLS policies use `get_user_org_id()` → `profiles` | Migrate to `user_profiles` + `org_memberships` |

### 6.3 3NF Compliance Assessment

| Concern | Status | Detail |
|---------|--------|--------|
| Atomic fields | ✅ Pass | No multi-value atomic violations in settings tables |
| Redundancy | 🔴 Fail | `profiles.role` duplicates `org_memberships.role`; `notification_preferences` duplicates `user_preferences` |
| PK dependency | ✅ Pass | All settings columns depend fully on their PKs |
| Derived data | ✅ Pass | No computed columns stored in settings |
| Referential integrity | 🟡 Warn | `organizations.settings` JSONB has no FK enforcement |

### 6.4 Indexing Strategy for New Tables

```sql
-- Settings
CREATE INDEX idx_settings_scope ON settings(scope_type, scope_id);
CREATE INDEX idx_settings_category_key ON settings(category, key);
CREATE INDEX idx_settings_scope_category ON settings(scope_type, scope_id, category);

-- Feature Flags
CREATE INDEX idx_feature_flags_key ON feature_flags(key);
CREATE INDEX idx_feature_flags_active ON feature_flags(is_active) WHERE is_active = true;
CREATE INDEX idx_feature_flag_overrides_flag ON feature_flag_overrides(flag_id);
CREATE INDEX idx_feature_flag_overrides_scope ON feature_flag_overrides(scope_type, scope_id);

-- Role Definitions
CREATE INDEX idx_role_definitions_org ON role_definitions(organization_id);
CREATE INDEX idx_role_definitions_key ON role_definitions(organization_id, key);

-- Permission Grants
CREATE INDEX idx_permission_grants_role ON permission_grants(role_definition_id);
CREATE INDEX idx_permission_grants_resource ON permission_grants(resource, action);
```

### 6.5 Data Migration Strategy

1. **Phase 1:** Create new tables alongside existing ones (zero downtime)
2. **Phase 2:** Seed `role_definitions` with 4 system roles + migrate `PERMISSION_MATRIX` to `permission_grants`
3. **Phase 3:** Seed `setting_definitions` with all settings from taxonomy
4. **Phase 4:** Migrate `organizations.settings` JSONB values to typed `settings` rows
5. **Phase 5:** Migrate `notification_preferences` to `user_preferences`
6. **Phase 6:** Update `get_user_org_id()` to use `org_memberships` (already done in migration 018 but verify)
7. **Phase 7:** Deprecate `profiles` table; update all RLS policies
8. **Phase 8:** Drop deprecated columns/tables

---

## 7. Security Risk Assessment

### 7.1 Critical Risks (P0)

| ID | Risk | Impact | Likelihood | Mitigation |
|----|------|--------|------------|------------|
| SEC-1 | **Default exec fallback** | Any user with broken profile gets full admin | High | Change to `vendor` (least privilege) |
| SEC-2 | **Client-side-only RBAC** | Vendor can query any org data via Supabase client | Critical | Add role-based RLS policies |
| SEC-3 | **No CSP header** | XSS vector | High | Add CSP in middleware |
| SEC-4 | **Field masking client-only** | Sensitive financial data accessible via direct queries | Critical | Column-level RLS or view-based access |
| SEC-5 | **No rate limiting** | Brute-force auth, resource exhaustion | High | Rate limit middleware + Supabase config |
| SEC-6 | **No CAPTCHA** | Bot registration/login | Medium | Add Turnstile/hCaptcha |

### 7.2 High Risks (P1)

| ID | Risk | Impact | Likelihood | Mitigation |
|----|------|--------|------------|------------|
| SEC-7 | **No session management UI** | Users can't revoke compromised sessions | High | Wire `user_sessions` table to UI |
| SEC-8 | **No MFA enforcement path** | `organizations.require_mfa` is never checked | High | Add MFA gate in middleware |
| SEC-9 | **No IP allowlisting** | No network-level access control | Medium | Add to org settings + middleware |
| SEC-10 | **Open OAuth redirect** | `redirectTo` not validated | High | Allowlist redirect URLs |
| SEC-11 | **No API token enforcement** | `api_tokens` table exists but unused | Medium | Implement token auth middleware |

### 7.3 Cross-Tenant Leakage Assessment

| Vector | Risk Level | Detail |
|--------|-----------|--------|
| RLS misconfiguration | 🟡 Medium | 20+ tables use `get_user_org_id()` → legacy `profiles` table. If profile lacks org, function returns NULL → no rows (safe fail-closed). |
| Supabase Realtime | 🟡 Medium | Realtime subscriptions in `realtime.ts` don't apply additional filters. User receives all org events including restricted data. |
| Storage buckets | 🟡 Medium | Storage policies not audited in this review. |
| API routes | 🔴 High | `/api/auth/session` and `/api/health` exist but no other API routes enforce RBAC. |
| Shared mutable state | ✅ Low | No shared state between tenants at application level. |

---

## 8. UI & Control Panel Architecture

### 8.1 Current Settings UI

The `settings/page.tsx` is a **100% static mock**:
- 5 tabs: Profile, Organization, Notifications, Security, Appearance
- Zero Supabase integration
- Hardcoded user data ("Alex Rivera")
- Non-functional toggles, buttons, and forms
- No RBAC gating (any user can see Organization tab)
- No audit trail visibility
- No change history

### 8.2 Proposed Settings Architecture

```
/settings
├── /profile            ← User scope (L9)
│   ├── Personal info   ← Wired to user_profiles
│   ├── Preferences     ← Wired to user_preferences
│   └── Sessions        ← Wired to user_sessions
│
├── /notifications      ← User scope (L9) with org defaults
│   ├── Channel prefs   ← Wired to notification_preferences
│   ├── Category prefs  ← Wired to user_preferences
│   └── Digest schedule ← Wired to user_preferences
│
├── /security           ← User + Org scope (L9 + L2)
│   ├── Password        ← Supabase auth
│   ├── MFA             ← Supabase auth + user_profiles
│   ├── API tokens      ← Wired to api_tokens
│   └── Active sessions ← Wired to user_sessions
│
├── /organization       ← Org scope (L2) — exec only
│   ├── General         ← Wired to organizations
│   ├── Security policy ← Wired to settings (org scope)
│   ├── Branding        ← Wired to brands table
│   ├── Team members    ← Wired to org_memberships
│   ├── Roles           ← Wired to role_definitions
│   ├── Invitations     ← Wired to invitations
│   └── Billing         ← Wired to settings (org scope)
│
├── /features           ← Org scope (L2) — exec only
│   ├── Module toggles  ← Wired to feature_flags
│   ├── Beta features   ← Wired to feature_flag_overrides
│   └── Entitlement     ← Wired to settings (org scope)
│
├── /compliance         ← Org scope (L2) — exec only
│   ├── Data retention  ← Wired to data_retention_policies
│   ├── Audit log       ← Wired to login_audit_log + settings_change_log
│   ├── Compliance acks ← Wired to user_compliance_acks
│   └── SOC2 dashboard  ← Composite view
│
└── /platform           ← Platform scope (L0) — super_admin only
    ├── Global defaults ← Wired to settings (platform scope)
    ├── Feature catalog ← Wired to feature_flags
    ├── Tenant overview ← Wired to organizations
    └── System health   ← Wired to health endpoints
```

### 8.3 State Management Model

```
Settings State Architecture:
┌─────────────────────────────────────────────┐
│ Server (Supabase)                           │
│  settings table → React Query cache         │
│  feature_flags → React Query cache          │
│  role_definitions → React Query cache       │
└────────────────┬────────────────────────────┘
                 │
    ┌────────────▼────────────────────────┐
    │ SettingsProvider (React Context)     │
    │  resolvedSettings: Map<key, value>  │
    │  featureFlags: Map<key, boolean>    │
    │  userPermissions: Permission[]       │
    │  currentScope: Scope                 │
    │                                      │
    │  useSetting(key): value              │
    │  useFeatureFlag(key): boolean        │
    │  useCanEditSetting(key): boolean     │
    │  updateSetting(key, value): void     │
    └─────────────────────────────────────┘
```

### 8.4 Component Hierarchy

| Component | Purpose | Guards |
|-----------|---------|--------|
| `SettingsLayout` | Tab navigation, breadcrumbs, scope indicator | Auth |
| `SettingsScopeIndicator` | Shows current scope (org name, project name) | — |
| `SettingRow` | Individual setting with inherited-value badge | `useCanEditSetting()` |
| `SettingLockBadge` | Shows "Locked by Org Admin" when inherited + locked | — |
| `SettingChangeHistory` | Timeline of changes for a single setting | exec/pm |
| `SettingDiffViewer` | Before/after comparison for pending changes | exec/pm |
| `BulkSettingEditor` | Multi-select + bulk update for settings | exec |
| `SettingRollbackButton` | Revert to `previous_value` | exec |
| `HighRiskChangeWarning` | Confirmation modal for sensitive settings | — |
| `FeatureFlagToggle` | Toggle with rollout percentage slider | exec |

---

## 9. Automation & Governance

### 9.1 Event Triggers on Settings Changes

| Trigger | Event | Action |
|---------|-------|--------|
| Setting mutation | INSERT/UPDATE on `settings` | Log to `settings_change_log` |
| Security setting change | `category = 'security'` change | Notify all org execs + log |
| MFA enforcement enabled | `governance.mfa_enforcement = 'required'` | Queue MFA setup nudge for all users |
| Feature flag toggle | INSERT/UPDATE on `feature_flags` | Notify affected users |
| Role change | UPDATE on `org_memberships.role` | Already logged via `trg_log_role_change` |
| Session limit exceeded | New session when at max | Revoke oldest session |

### 9.2 Compliance Reporting

| Report | Data Source | Schedule |
|--------|------------|----------|
| Access review | `org_memberships` + `login_audit_log` | Monthly |
| Stale sessions | `user_sessions` | Weekly |
| Expired certs | `certifications` + `asset_certifications` | Daily |
| Compliance ack gaps | `user_compliance_acks` | Weekly |
| Data retention execution | `data_retention_policies` | Nightly cron |
| Settings drift | `settings` vs `setting_definitions` | Nightly |
| Permission audit | `permission_grants` × `org_memberships` | Monthly |

### 9.3 SOC2 Readiness Gaps

| Control | Status | Gap |
|---------|--------|-----|
| CC6.1: Logical access | 🔴 Fail | No server-side RBAC enforcement |
| CC6.2: Access provisioning | 🟡 Partial | Invitation system exists but no access review workflow |
| CC6.3: Access modification | 🟡 Partial | `role_change_log` exists but no approval workflow for role changes |
| CC6.6: Access removal | 🟡 Partial | Kill switch exists but no automated deprovisioning |
| CC7.1: Configuration management | 🔴 Fail | No settings audit trail, no change approval workflow |
| CC7.2: Change management | 🟡 Partial | Quality gate exists but no settings change review |
| CC8.1: Monitoring | 🔴 Fail | No runtime monitoring of access patterns |

### 9.4 Drift Detection

```
Drift Detection Strategy:

1. Setting Definition Drift:
   - Nightly: Compare setting_definitions catalog vs actual settings rows
   - Alert if: key exists in settings but not in definitions (orphaned)
   - Alert if: key in definitions has no platform default set

2. Permission Drift:
   - Weekly: Compare permission_grants vs actual RLS policy expectations
   - Alert if: RLS policy allows access that permission_grants denies

3. Role Drift:
   - On role_change: Verify new role exists in role_definitions
   - Alert if: org_memberships.role not in role_definitions for that org

4. Feature Flag Drift:
   - On deploy: Verify all code-referenced flags exist in feature_flags table
   - Alert if: code checks flag that doesn't exist (fails closed to default)
```

---

## 10. P0 / P1 / P2 Implementation Roadmap

### P0 — Critical Security & Foundation (Weeks 1-3)

| ID | Task | Files | Effort |
|----|------|-------|--------|
| P0-1 | **Fix default permission level** — Change `DEFAULT_LEVEL` from `"exec"` to `"vendor"` in `permission-guard.tsx` | 1 file, 1 line | 5 min |
| P0-2 | **Create migration 025** — `settings`, `setting_definitions`, `settings_change_log` tables | 1 migration | 4 hrs |
| P0-3 | **Create migration 026** — `feature_flags`, `feature_flag_overrides` tables | 1 migration | 2 hrs |
| P0-4 | **Create migration 027** — `role_definitions`, `permission_grants` tables + seed system roles | 1 migration | 4 hrs |
| P0-5 | **Add role-based RLS** — Update top-10 most sensitive tables (crew_members, budgets, invoices, etc.) with `user_has_permission()` | 1 migration | 8 hrs |
| P0-6 | **Wire settings page to Supabase** — Replace hardcoded data with `useQuery` hooks for `user_profiles`, `user_preferences`, `notification_preferences` | 3 files | 8 hrs |
| P0-7 | **Add CSP header** in middleware.ts | 1 file | 1 hr |
| P0-8 | **Add server-side permission check** — API route middleware that validates `user_has_permission()` | 2 files | 4 hrs |
| P0-9 | **Migrate PERMISSION_MATRIX** — Seed `permission_grants` from static `rbac.ts` | 1 migration + 1 seeder | 4 hrs |

### P1 — Settings Infrastructure & Governance (Weeks 4-6)

| ID | Task | Files | Effort |
|----|------|-------|--------|
| P1-1 | **Seed setting_definitions** — All ~50 settings from taxonomy above | 1 migration | 4 hrs |
| P1-2 | **SettingsProvider** — React context with `useSetting()`, `useFeatureFlag()`, resolution chain | 2 files | 8 hrs |
| P1-3 | **Feature flag evaluation engine** — `evaluateFlag(key, context)` with targeting rules | 1 file | 4 hrs |
| P1-4 | **Settings admin UI** — Org-scoped settings editor with lock/inheritance badges | 5 components | 16 hrs |
| P1-5 | **Feature flag admin UI** — Catalog, toggle, rollout percentage, targeting | 3 components | 12 hrs |
| P1-6 | **Custom role editor** — CRUD for `role_definitions` + `permission_grants` | 4 components | 16 hrs |
| P1-7 | **DB-backed brand table** — Migrate `brands/*.ts` to `brands` table + admin UI | 1 migration + 3 files | 8 hrs |
| P1-8 | **Deprecate profiles table** — Update all RLS policies to use `org_memberships` | 1 migration | 8 hrs |
| P1-9 | **Notification preferences wiring** — Connect settings UI to `notification_preferences` | 2 files | 4 hrs |
| P1-10 | **Session management UI** — List active sessions, revoke | 2 files | 4 hrs |

### P2 — Enterprise Polish & Automation (Weeks 7-10)

| ID | Task | Files | Effort |
|----|------|-------|--------|
| P2-1 | **Settings change approval workflow** — High-risk settings require exec approval | 3 files | 12 hrs |
| P2-2 | **Settings diff viewer** — Before/after comparison + rollback | 2 components | 8 hrs |
| P2-3 | **Drift detection cron** — Nightly job comparing definitions vs actual | 1 edge function | 8 hrs |
| P2-4 | **SOC2 compliance dashboard** — Aggregate view of all compliance controls | 3 components | 12 hrs |
| P2-5 | **Bulk settings editor** — Multi-select + apply to multiple projects/orgs | 2 components | 8 hrs |
| P2-6 | **Department-scoped settings** — Department entity + settings inheritance | 1 migration + 3 files | 8 hrs |
| P2-7 | **Project-scoped settings** — Project settings table + UI | 1 migration + 3 files | 8 hrs |
| P2-8 | **Conditional permissions** — Phase-based, time-based, status-based rules | 2 files | 8 hrs |
| P2-9 | **Access review workflow** — Periodic access certification campaigns | 3 files | 12 hrs |
| P2-10 | **Permission caching** — Memoize resolved permissions per session | 2 files | 4 hrs |

---

## Appendix A: File Inventory

### Files Requiring Modification

| File | Changes Needed |
|------|---------------|
| `src/components/permission-guard.tsx` | P0: Fix `DEFAULT_LEVEL`; P1: Use DB-backed permissions |
| `src/config/rbac.ts` | P1: Migrate to DB-backed `role_definitions` + `permission_grants` |
| `src/lib/supabase/auth-context.tsx` | P1: Read from `user_profiles` + `org_memberships` instead of `profiles` |
| `src/lib/supabase/middleware.ts` | P0: Add CSP; P1: Add server-side permission checks |
| `src/app/(dashboard)/settings/page.tsx` | P0: Wire to Supabase; P1: Full rewrite |
| `src/app/(dashboard)/roles/page.tsx` | P1: Wire to `role_definitions` + custom role CRUD |
| `src/config/brands/index.ts` | P1: Add DB fallback; P2: Full DB migration |
| `src/lib/supabase/hooks.ts` | P0: Add hooks for `settings`, `user_preferences`, `notification_preferences` |

### New Files Required

| File | Purpose |
|------|---------|
| `supabase/migrations/025_settings_framework.sql` | Settings + definitions + change log |
| `supabase/migrations/026_feature_flags.sql` | Feature flags + overrides |
| `supabase/migrations/027_rbac_custom_roles.sql` | Role definitions + permission grants + seed |
| `supabase/migrations/028_role_based_rls.sql` | Role-aware RLS on all tables |
| `src/lib/settings/provider.tsx` | SettingsProvider with resolution chain |
| `src/lib/settings/feature-flags.ts` | Feature flag evaluation engine |
| `src/lib/settings/hooks.ts` | `useSetting()`, `useFeatureFlag()`, `useCanEditSetting()` |
| `src/app/(dashboard)/settings/organization/page.tsx` | Org settings admin |
| `src/app/(dashboard)/settings/features/page.tsx` | Feature flag admin |
| `src/app/(dashboard)/settings/compliance/page.tsx` | Compliance dashboard |
| `src/components/settings/setting-row.tsx` | Reusable setting row with inheritance |
| `src/components/settings/setting-lock-badge.tsx` | Lock/inherit indicator |
| `src/components/settings/feature-flag-toggle.tsx` | Flag toggle with rollout |

---

## Appendix B: Deployment Readiness Scoring

| Criterion | Weight | Score | Weighted |
|-----------|--------|-------|----------|
| Server-side RBAC enforcement | 20% | 1/10 | 0.20 |
| Settings schema completeness | 15% | 2/10 | 0.30 |
| Feature flag system | 10% | 0/10 | 0.00 |
| Inheritance chain | 10% | 0/10 | 0.00 |
| Tenant isolation | 15% | 5/10 | 0.75 |
| Audit trail completeness | 10% | 3/10 | 0.30 |
| UI settings functionality | 10% | 1/10 | 0.10 |
| Custom role support | 5% | 0/10 | 0.00 |
| Compliance readiness | 5% | 2/10 | 0.10 |
| **Total** | **100%** | — | **1.75 → 2/10** |

**Revised Deployment Readiness Score: 2/10**

> The platform has enterprise-grade *schema aspirations* but the application layer connects to almost none of it. The single most critical action is P0-1 (fix default permission level from `exec` to `vendor`) — a 1-line change that closes the highest-severity privilege escalation vector.
