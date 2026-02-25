# User Lifecycle & Identity Management Architecture

## Frozen Phoenix — Comprehensive Systems Analysis

**Version:** 1.0
**Date:** 2026-02-25
**Scope:** Pre-access → Active engagement → Offboarding → Deletion
**Compliance:** GDPR, CCPA, LGPD, PIPEDA | WCAG 2.2 AA | Zero Trust

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current-State Lifecycle Map](#2-current-state-lifecycle-map)
3. [Structural Findings & Gap Analysis](#3-structural-findings--gap-analysis)
4. [Future-State Identity Architecture](#4-future-state-identity-architecture)
5. [3NF-Compliant Entity Relationship Model](#5-3nf-compliant-entity-relationship-model)
6. [User-Role-Permission Schema Model](#6-user-role-permission-schema-model)
7. [Access Inheritance Framework](#7-access-inheritance-framework)
8. [Identity Provider Abstraction Model](#8-identity-provider-abstraction-model)
9. [Onboarding Lifecycle Design](#9-onboarding-lifecycle-design)
10. [Active User Lifecycle & Preferences](#10-active-user-lifecycle--preferences)
11. [Audit & Compliance Retention Framework](#11-audit--compliance-retention-framework)
12. [Soft Delete & Data Retention Model](#12-soft-delete--data-retention-model)
13. [Security Risk Mitigation Matrix](#13-security-risk-mitigation-matrix)
14. [UI/UX Cognitive Load Reduction](#14-uiux-cognitive-load-reduction)
15. [Automation & AI Augmentation Roadmap](#15-automation--ai-augmentation-roadmap)
16. [Dataset Audit — 7W Coverage](#16-dataset-audit--7w-coverage)
17. [Implementation Roadmap](#17-implementation-roadmap)

---

## 1. Executive Summary

### 1.1 Scope of Analysis

This document provides a comprehensive systems analysis of the complete user lifecycle in Frozen Phoenix, spanning from user invitation through active participation, role evolution, and eventual offboarding or account deletion. The system must support multi-role, multi-organization, and multi-project environments.

### 1.2 Critical Findings

| # | Finding | Severity | Impact |
|---|---------|----------|--------|
| F1 | **Identity–Profile coupling**: `profiles.id` is `auth.users.id` — conflates Supabase identity with application profile. No separation of identity, profile, and org membership layers. | 🔴 Critical | Cannot support multi-org users; deletion cascades destroy audit trails |
| F2 | **Single-role limitation**: `profiles.role` is a single `TEXT` column with 4 values (`exec`, `pm`, `client`, `vendor`). Users cannot hold different roles in different organizations or projects. | 🔴 Critical | Permission model cannot express real-world access patterns |
| F3 | **No invitation system**: No `invitations` table, no invite token workflow, no domain-based auto-assignment. User creation is self-service only via Supabase Auth signup. | 🟠 High | No controlled onboarding; no way to pre-assign roles before first login |
| F4 | **No org membership table**: `profiles.organization_id` is a single FK — users belong to exactly one organization. | 🟠 High | Multi-tenant scenarios impossible; org transfers require profile mutation |
| F5 | **No session/device tracking**: Middleware refreshes sessions but no login audit trail, device fingerprinting, or concurrent session management. | 🟠 High | Cannot detect compromised accounts or enforce session policies |
| F6 | **No MFA state tracking**: Settings page shows "2FA Status: Not Enabled" but no schema supports MFA enrollment, recovery codes, or factor management. | 🟠 High | Security compliance gap |
| F7 | **No user preferences schema**: Display preferences, notification settings, accessibility options, timezone, and locale are not persisted in any table. | 🟡 Medium | Settings page is cosmetic — changes are lost on refresh |
| F8 | **No onboarding tracking**: No `user_onboarding` table to track first-time experience, guided tours, compliance acknowledgments, or profile completion. | 🟡 Medium | Cannot personalize first-run experience or enforce required steps |
| F9 | **No access expiration**: `shouldRevokeAccess()` in RBAC is a runtime check based on project load-out date, but no schema enforces time-bound access grants. | 🟡 Medium | Temporary access relies on application logic, not data constraints |
| F10 | **No soft delete**: `profiles` CASCADE from `auth.users` — user deletion is destructive and irreversible. Audit logs lose actor identity. | 🔴 Critical | GDPR right-to-erasure conflicts with audit retention requirements |
| F11 | **No API token management**: No `api_tokens` table for personal access tokens, OAuth client credentials, or service accounts. | 🟡 Medium | API-first architecture unsupported |
| F12 | **No account merge capability**: Duplicate users from different identity providers cannot be consolidated. | 🟡 Medium | Data fragmentation risk as SSO providers are added |

### 1.3 Recommendation Matrix

| Priority | Action | Effort | Dependencies |
|----------|--------|--------|--------------|
| P0 | Separate identity → profile → org membership layers | High | Migration 015 |
| P0 | Multi-org membership with per-org roles | High | Migration 015 |
| P0 | Soft delete with anonymization for GDPR | Medium | Migration 015 |
| P1 | Invitation system with token-based onboarding | Medium | Migration 015 |
| P1 | Session & device tracking with login audit | Medium | Migration 015 |
| P1 | User preferences persistence | Low | Migration 015 |
| P1 | User onboarding state machine | Medium | Migration 015 |
| P2 | MFA factor management schema | Low | Migration 015 |
| P2 | API token lifecycle | Low | Migration 015 |
| P2 | Temporary access grants with expiration | Low | Migration 015 |
| P3 | Account merge workflow | Medium | Post-migration |
| P3 | Risk-based authentication triggers | High | AI/ML pipeline |

---

## 2. Current-State Lifecycle Map

### 2.1 Entity Inventory

| Entity | Table | Owner | 3NF Status |
|--------|-------|-------|------------|
| Identity | `auth.users` (Supabase) | Supabase Auth | ✅ Atomic |
| Profile | `profiles` | Application | ⚠️ Coupled to identity + single-org |
| Organization | `organizations` | Application | ✅ Atomic |
| Project Membership | `project_members` | Application | ✅ Junction |
| Notifications | `notifications` | Application | ✅ Atomic |
| RBAC | `rbac.ts` (config) | Application code | ⚠️ Not in database |

### 2.2 Current Lifecycle Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  CURRENT USER LIFECYCLE (Simplified)                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. SIGNUP                                                   │
│     └─ POST /signup → supabase.auth.signUp()                │
│        └─ Trigger: handle_new_user()                         │
│           └─ Creates profiles row with default org           │
│              └─ role = 'pm' (hardcoded default)              │
│                                                              │
│  2. EMAIL VERIFICATION                                       │
│     └─ User clicks email link                                │
│        └─ GET /auth/callback → exchangeCodeForSession()      │
│           └─ Redirect to /dashboard                          │
│                                                              │
│  3. LOGIN                                                    │
│     └─ POST /login → supabase.auth.signInWithPassword()     │
│        └─ Middleware refreshes session cookie                 │
│           └─ AuthContext loads profile via profiles.select()  │
│                                                              │
│  4. ACTIVE USE                                               │
│     └─ Middleware: publicPaths whitelist check                │
│        └─ RLS: get_user_org_id() scopes all queries          │
│           └─ RBAC: hasPermission() checked in UI only        │
│                                                              │
│  5. ROLE CHANGE                                              │
│     └─ Manual UPDATE profiles SET role = ?                   │
│        └─ No audit trail                                     │
│           └─ No approval workflow                            │
│                                                              │
│  6. DELETION                                                 │
│     └─ DELETE auth.users → CASCADE profiles                  │
│        └─ All FKs to profiles cascade or nullify             │
│           └─ Audit logs lose actor identity permanently      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Authentication Flow

```
Browser                     Next.js Middleware          Supabase Auth
  │                              │                          │
  ├─── POST /login ─────────────►│                          │
  │                              ├── signInWithPassword() ──►│
  │                              │◄── session + JWT ────────┤
  │◄── Set-Cookie: sb-token ─────┤                          │
  │                              │                          │
  ├─── GET /dashboard ──────────►│                          │
  │                              ├── getUser() ─────────────►│
  │                              │◄── user object ──────────┤
  │                              ├── Check publicPaths       │
  │                              ├── Forward if authed       │
  │◄── Page + AuthContext ───────┤                          │
  │    └─ profile = profiles     │                          │
  │       .select(*)             │                          │
  │       .eq('id', user.id)     │                          │
```

### 2.4 RLS Architecture

```sql
-- Current pattern: Single-org scoping via helper function
CREATE FUNCTION get_user_org_id() RETURNS UUID AS $$
    SELECT organization_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- All org-scoped tables use:
--   USING (organization_id = get_user_org_id())
```

**Limitation:** This function returns exactly one `organization_id`. Multi-org users are structurally impossible.

---

## 3. Structural Findings & Gap Analysis

### 3.1 SSOT Violations

| # | Violation | Current Location | Impact |
|---|-----------|-----------------|--------|
| V1 | User role defined in `profiles.role` (single TEXT) AND `rbac.ts` PERMISSION_MATRIX (4 static tiers) | Database + Config | Role is a property of the user, not of the user-org-project relationship |
| V2 | Organization membership implicit via `profiles.organization_id` (1:1) | `profiles` table | No explicit membership entity; cannot model multi-org |
| V3 | Notification preferences in UI only (settings page JSX) | `settings/page.tsx` | Preferences lost on refresh; no persistence layer |
| V4 | Team members hardcoded in settings page JSX | `settings/page.tsx` | Not driven by database |
| V5 | Session data not tracked | Supabase cookie only | No application-level session history |

### 3.2 Permission Sprawl Risks

| Risk | Description | Likelihood |
|------|-------------|-----------|
| R1 | **Flat role escalation**: Only 4 roles with no scoping — a `pm` in Org A has `pm` everywhere | High |
| R2 | **No project-level roles**: `project_members.role` exists but is TEXT with no RBAC integration | High |
| R3 | **Client/vendor over-access**: Roles are global — a `client` user sees all client-visible resources across all projects | Medium |
| R4 | **No temporal bounds**: Access never expires automatically | Medium |
| R5 | **Kill switch is runtime-only**: `shouldRevokeAccess()` depends on project load-out date but is not enforced at RLS level | Medium |

### 3.3 Security Vulnerabilities

| # | Vulnerability | CVSS-like | Mitigation |
|---|--------------|-----------|------------|
| S1 | No MFA — password-only authentication | High | Add MFA enrollment + enforcement schema |
| S2 | No brute-force protection at app level (delegated to Supabase) | Medium | Add login attempt tracking |
| S3 | No session invalidation on role change | Medium | Add session revocation on permission change |
| S4 | RBAC enforced in UI only (`hasPermission()`) — RLS does not check role, only org | High | Add role-aware RLS policies |
| S5 | No API token rotation or expiration | Medium | Add token lifecycle management |
| S6 | Hard delete destroys identity — impersonation risk if UUID recycled | Low | Soft delete with tombstone records |

### 3.4 Orphaned Data Risks

| Scenario | Affected Tables | Data Loss |
|----------|----------------|-----------|
| User hard-deleted | `profiles` CASCADE → nullifies `assigned_to`, `manager_id`, `approver_id`, `created_by`, `uploaded_by` across 20+ tables | Actor identity in audit logs becomes NULL |
| Org deleted | `organizations` CASCADE → all profiles, deals, projects, tasks, etc. | Entire tenant data destroyed |
| No transfer mechanism | When user leaves, their assignments become orphaned | Tasks, approvals, documents lose ownership |

### 3.5 Cognitive Overload in Settings

The current settings page presents 5 tabs (Profile, Organization, Notifications, Security, Appearance) but:
- **No persistence** — all inputs are controlled components with no save-to-DB logic
- **No progressive disclosure** — all options visible regardless of role
- **No guided setup** — new users see the same settings as admins
- **No org-level vs personal separation** — org settings mixed with personal preferences

---

## 4. Future-State Identity Architecture

### 4.1 Layered Identity Model

```
┌─────────────────────────────────────────────────────────────┐
│                    IDENTITY LAYER                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  auth.users (Supabase-managed)                       │   │
│  │  • id, email, encrypted_password, phone              │   │
│  │  • email_confirmed_at, phone_confirmed_at            │   │
│  │  • last_sign_in_at, raw_user_meta_data               │   │
│  │  • aal (authenticator assurance level)                │   │
│  └───────────────┬──────────────────────────────────────┘   │
│                  │ 1:1                                       │
├──────────────────┼──────────────────────────────────────────┤
│                  │     PROFILE LAYER                         │
│  ┌───────────────▼──────────────────────────────────────┐   │
│  │  user_profiles (application-managed)                  │   │
│  │  • id (PK, refs auth.users)                          │   │
│  │  • display_name, avatar_url, phone                   │   │
│  │  • timezone, locale, date_format                     │   │
│  │  • lifecycle_status (active/suspended/deactivated/   │   │
│  │    deleted/pending_verification)                      │   │
│  │  • onboarding_completed_at                           │   │
│  │  • deleted_at, anonymized_at (soft delete)           │   │
│  └───────────────┬──────────────────────────────────────┘   │
│                  │ 1:N                                       │
├──────────────────┼──────────────────────────────────────────┤
│                  │     MEMBERSHIP LAYER                      │
│  ┌───────────────▼──────────────────────────────────────┐   │
│  │  org_memberships (junction)                          │   │
│  │  • user_id + organization_id (composite unique)      │   │
│  │  • role (exec/pm/client/vendor + extensible)         │   │
│  │  • status (active/suspended/expired/invited)         │   │
│  │  • invited_by, invited_at, joined_at                 │   │
│  │  • expires_at (temporal access)                      │   │
│  │  • is_default_org                                    │   │
│  └───────────────┬──────────────────────────────────────┘   │
│                  │ 1:N                                       │
├──────────────────┼──────────────────────────────────────────┤
│                  │     PROJECT ACCESS LAYER                  │
│  ┌───────────────▼──────────────────────────────────────┐   │
│  │  project_members (existing, enhanced)                │   │
│  │  • project_id + profile_id (composite unique)        │   │
│  │  • role (project-level override)                     │   │
│  │  • granted_by, granted_at, expires_at                │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                    SUPPORTING ENTITIES                        │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐     │
│  │ invita-  │  │ user_        │  │ login_audit_      │     │
│  │ tions    │  │ preferences  │  │ log               │     │
│  ├──────────┤  ├──────────────┤  ├───────────────────┤     │
│  │ user_    │  │ user_        │  │ api_tokens        │     │
│  │ onboard- │  │ sessions     │  │                   │     │
│  │ ing      │  │              │  │                   │     │
│  └──────────┘  └──────────────┘  └───────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Design Principles

1. **Identity ≠ Profile ≠ Membership**: Supabase `auth.users` owns authentication credentials. `user_profiles` owns display/preference data. `org_memberships` owns role/access relationships.

2. **Roles are scoped**: A user's role is a property of their org membership, not of their identity. A user can be `exec` in Org A and `vendor` in Org B.

3. **Temporal access**: Every membership and project grant has optional `expires_at`. Expired memberships are automatically downgraded by a scheduled function.

4. **Soft delete with anonymization**: User profiles are never hard-deleted. On "deletion," PII is anonymized (`display_name` → "Deleted User", `avatar_url` → null) and `deleted_at` is set. The UUID remains valid for audit trail integrity.

5. **Invitation-first**: Users are invited into an org with a pre-assigned role. Self-registration creates a personal workspace but does not grant access to any existing org.

6. **Progressive onboarding**: First-time experience is role-aware and tracks completion state. Required compliance acknowledgments block access until completed.

7. **Audit everything**: Role changes, login events, permission grants, and data access are logged immutably.

### 4.3 State Machine — User Lifecycle

```
                    ┌─────────┐
              invite│         │self-register
           ┌───────►INVITED  │◄──────────┐
           │        └────┬────┘           │
           │             │ accept         │
           │             ▼                │
           │     ┌───────────────┐        │
           │     │ PENDING_      │        │
           │     │ VERIFICATION  │────────┘
           │     └───────┬───────┘  (email confirm)
           │             │ verify
           │             ▼
           │     ┌───────────────┐
           │     │ ONBOARDING    │
           │     └───────┬───────┘
           │             │ complete
           │             ▼
      ┌────┴─────────────────────────┐
      │         ACTIVE               │◄──── reactivate
      └──┬────────┬─────────┬────────┘
         │        │         │
    suspend   deactivate  delete-request
         │        │         │
         ▼        ▼         ▼
   ┌──────────┐ ┌─────────────┐ ┌──────────────┐
   │SUSPENDED │ │DEACTIVATED  │ │PENDING_      │
   └──────────┘ └─────────────┘ │DELETION      │
                                 └──────┬───────┘
                                        │ retention
                                        │ period expires
                                        ▼
                                 ┌──────────────┐
                                 │ ANONYMIZED   │
                                 │ (tombstone)  │
                                 └──────────────┘
```

---

## 5. 3NF-Compliant Entity Relationship Model

### 5.1 New Entities

| Entity | Table | Purpose | 3NF Check |
|--------|-------|---------|-----------|
| User Profile | `user_profiles` | Display name, avatar, timezone, locale, lifecycle status | ✅ No derived data |
| Org Membership | `org_memberships` | User ↔ Org relationship with scoped role | ✅ Composite key |
| Invitation | `invitations` | Pre-registration access grants with token | ✅ Atomic |
| User Onboarding | `user_onboarding_progress` | Step-by-step first-time experience tracking | ✅ Depends on user + step |
| Onboarding Steps | `onboarding_step_definitions` | Template steps for role-based onboarding | ✅ Reusable definitions |
| User Preferences | `user_preferences` | Key-value preferences (notifications, display, accessibility) | ✅ No redundancy |
| Login Audit Log | `login_audit_log` | Every authentication event with device/IP/result | ✅ Immutable append-only |
| User Sessions | `user_sessions` | Active session tracking with device info | ✅ Atomic |
| API Tokens | `api_tokens` | Personal access tokens with scoped permissions | ✅ Atomic |
| Access Grants | `temporary_access_grants` | Time-bound access to resources outside normal role | ✅ Atomic |
| Role Change Log | `role_change_log` | Immutable log of every role/permission change | ✅ Append-only |
| Data Retention Policies | `data_retention_policies` | Per-entity-type retention rules | ✅ Config table |
| Compliance Acknowledgments | `user_compliance_acks` | User acceptance of terms, policies, SOPs | ✅ Junction |

### 5.2 Modified Entities

| Entity | Table | Change | Reason |
|--------|-------|--------|--------|
| Profiles | `profiles` | **Preserved as backward-compatible view** | Existing 20+ FK references continue working |
| Project Members | `project_members` | Add `granted_by`, `granted_at`, `expires_at`, `status` | Temporal access + audit |
| Organizations | `organizations` | Add `settings JSONB`, `sso_domain`, `require_mfa`, `default_role` | Org-level security policies |

### 5.3 Entity Relationship Diagram

```
auth.users ────1:1──── user_profiles ────1:N──── org_memberships ────N:1──── organizations
                            │                         │
                            │ 1:N                     │ 1:N (via user_id)
                            │                         │
                       user_preferences          project_members
                       user_sessions                  │
                       api_tokens              ┌──────┘
                       login_audit_log         │
                       user_compliance_acks    │
                       user_onboarding_progress│
                       role_change_log         │
                       temporary_access_grants─┘

invitations ──────N:1──── organizations
     │
     └── invited_by ──── user_profiles

onboarding_step_definitions (standalone template)
data_retention_policies (standalone config)
```

### 5.4 7W Coverage — New Entities

| Entity | Who | What | When | Where | Why | How | If-Then | Score |
|--------|-----|------|------|-------|-----|-----|---------|-------|
| user_profiles | ✅ id=auth.users | ✅ display_name, avatar | ✅ created_at, updated_at, deleted_at | ✅ timezone, locale | ✅ lifecycle_status | ✅ onboarding_completed_at | ✅ deleted_at→anonymize | 7/7 |
| org_memberships | ✅ user_id | ✅ organization_id, role | ✅ joined_at, expires_at | ✅ org-scoped | ✅ status | ✅ invited_by | ✅ expires_at→suspend | 7/7 |
| invitations | ✅ invited_by, email | ✅ role, org_id | ✅ created_at, expires_at | ✅ org-scoped | ✅ status | ✅ token, accepted_at | ✅ expires_at→void | 7/7 |
| user_onboarding_progress | ✅ user_id | ✅ step_definition_id | ✅ completed_at | ✅ org-scoped | ✅ status | ✅ completed_by | ✅ all_complete→active | 7/7 |
| user_preferences | ✅ user_id | ✅ key, value | ✅ updated_at | ✅ category-scoped | ✅ preference type | ✅ JSON value | ✅ cascades on delete | 7/7 |
| login_audit_log | ✅ user_id | ✅ event_type | ✅ created_at | ✅ ip, user_agent, device | ✅ result | ✅ method, provider | ✅ failure→lockout | 7/7 |
| user_sessions | ✅ user_id | ✅ session_token_hash | ✅ created_at, last_active, expires_at | ✅ ip, device_info | ✅ is_current | ✅ provider | ✅ expires→revoke | 7/7 |
| api_tokens | ✅ user_id | ✅ name, token_hash | ✅ created_at, last_used, expires_at | ✅ scopes | ✅ description | ✅ prefix | ✅ expires→revoke | 7/7 |
| temporary_access_grants | ✅ user_id, granted_by | ✅ resource_type, resource_id | ✅ starts_at, expires_at | ✅ org-scoped | ✅ reason | ✅ permission_level | ✅ expires→revoke | 7/7 |
| role_change_log | ✅ user_id, changed_by | ✅ old_role, new_role | ✅ changed_at | ✅ org-scoped | ✅ reason | ✅ membership_id | ✅ immutable | 7/7 |
| user_compliance_acks | ✅ user_id | ✅ policy_type, policy_version | ✅ acknowledged_at | ✅ ip_address | ✅ required | ✅ document_url | ✅ required→block | 7/7 |
| data_retention_policies | ✅ created_by | ✅ entity_type, retention_days | ✅ created_at | ✅ org-scoped | ✅ legal_basis | ✅ action_on_expiry | ✅ expired→purge | 7/7 |

**All 12 new entities: 7/7 coverage.**

---

## 6. User-Role-Permission Schema Model

### 6.1 Role Hierarchy (Unchanged External API)

The existing 4-tier model (`exec` > `pm` > `client` > `vendor`) is preserved as the canonical set of roles. The change is structural: **roles are now scoped to org memberships**, not embedded in the profile.

```
┌────────────────────────────────────────────────────┐
│  PERMISSION RESOLUTION ORDER                        │
│                                                     │
│  1. Check org_memberships.role for the user's       │
│     membership in the current org context           │
│                                                     │
│  2. Check project_members.role for project-level    │
│     override (if more permissive than org role)     │
│                                                     │
│  3. Check temporary_access_grants for time-bound    │
│     elevation (if within validity window)           │
│                                                     │
│  4. Apply PERMISSION_MATRIX[resolved_role]          │
│                                                     │
│  Resolution: highest_permission_level wins          │
└────────────────────────────────────────────────────┘
```

### 6.2 Permission Inheritance Rules

| Rule | Description |
|------|-------------|
| **R1** | `exec` in an org implies full access to all projects in that org |
| **R2** | `pm` in an org grants access only to projects where user is a `project_member` |
| **R3** | `client` access is scoped to projects where the user is explicitly added |
| **R4** | `vendor` access is scoped to specific tasks/work orders within assigned projects |
| **R5** | Project-level role can **elevate** but not **restrict** org-level role |
| **R6** | Temporary access grants can add specific resource access beyond role-based defaults |
| **R7** | All access checks must pass through RLS — UI-only checks are supplementary |

### 6.3 RLS Migration Strategy

The existing `get_user_org_id()` function must be replaced with a multi-org-aware function:

```sql
-- NEW: Returns all org IDs the user is a member of
CREATE FUNCTION get_user_org_ids() RETURNS UUID[] AS $$
    SELECT ARRAY(
        SELECT organization_id
        FROM org_memberships
        WHERE user_id = auth.uid()
          AND status = 'active'
          AND (expires_at IS NULL OR expires_at > NOW())
    )
$$ LANGUAGE SQL SECURITY DEFINER;

-- NEW: Returns the user's role in a specific org
CREATE FUNCTION get_user_role_in_org(org_id UUID) RETURNS TEXT AS $$
    SELECT role
    FROM org_memberships
    WHERE user_id = auth.uid()
      AND organization_id = org_id
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > NOW())
    LIMIT 1
$$ LANGUAGE SQL SECURITY DEFINER;

-- BACKWARD COMPAT: Existing function returns first active org
-- (to be deprecated after all RLS policies are migrated)
CREATE OR REPLACE FUNCTION get_user_org_id() RETURNS UUID AS $$
    SELECT organization_id
    FROM org_memberships
    WHERE user_id = auth.uid()
      AND status = 'active'
      AND is_default_org = true
    LIMIT 1
$$ LANGUAGE SQL SECURITY DEFINER;
```

---

## 7. Access Inheritance Framework

### 7.1 Scope Hierarchy

```
Organization (top-level scope)
  └── Org Membership (role binding)
       └── Project Access (project_members)
            └── Task/Resource Access (derived from project + role)
                 └── Temporary Grant (time-bound elevation)
```

### 7.2 Access Resolution Algorithm

```
function resolveAccess(userId, orgId, resource, action):
    // 1. Get org membership
    membership = org_memberships.find(userId, orgId, status='active')
    if !membership: DENY

    // 2. Check lifecycle status
    profile = user_profiles.find(userId)
    if profile.lifecycle_status != 'active': DENY

    // 3. Check compliance
    if hasUnacknowledgedRequiredPolicies(userId): DENY (redirect to compliance)

    // 4. Resolve effective role
    orgRole = membership.role
    projectRole = project_members.find(userId, resource.projectId)?.role
    tempGrant = temporary_access_grants.find(userId, resource, active=true)

    effectiveRole = highestOf(orgRole, projectRole, tempGrant?.permissionLevel)

    // 5. Check PERMISSION_MATRIX
    return hasPermission(effectiveRole, resource.type, action)
```

### 7.3 Cross-Organization Behavior

| Scenario | Behavior |
|----------|----------|
| User belongs to Org A (exec) and Org B (client) | When viewing Org A context, full access. When viewing Org B context, client-level access. |
| User invited to project in Org C as vendor | Org C membership auto-created with `vendor` role. Access scoped to that project only. |
| Org membership expires | User loses all access to that org's resources. Existing audit logs preserved. |
| User switches default org | `is_default_org` flag updated. RLS `get_user_org_id()` returns new default. |

---

## 8. Identity Provider Abstraction Model

### 8.1 Current State

- **Single provider**: Supabase Auth with email+password
- **OAuth callback**: `/auth/callback` exchanges code for session
- **No SSO**: No SAML, no enterprise IdP integration

### 8.2 Future-State Provider Abstraction

```
┌─────────────────────────────────────────────┐
│  IDENTITY PROVIDER LAYER                     │
│                                              │
│  ┌───────────┐  ┌───────────┐  ┌─────────┐ │
│  │ Email+    │  │ Google    │  │ SAML    │ │
│  │ Password  │  │ OAuth     │  │ SSO     │ │
│  └─────┬─────┘  └─────┬─────┘  └────┬────┘ │
│        │              │              │       │
│        └──────────────┼──────────────┘       │
│                       │                      │
│              Supabase Auth                   │
│              (unified identity)              │
│                       │                      │
│              ┌────────▼────────┐             │
│              │  user_profiles  │             │
│              │  (application)  │             │
│              └─────────────────┘             │
└─────────────────────────────────────────────┘
```

Supabase natively supports multiple OAuth providers. The application layer only needs to:

1. **Track linked providers** via `auth.identities` (Supabase-managed)
2. **Store domain auto-assignment rules** in `organizations.sso_domain`
3. **Enforce MFA policies** via `organizations.require_mfa`

### 8.3 Domain-Based Auto-Assignment

```sql
-- When a user signs up with email @acme.com and organizations.sso_domain = 'acme.com':
-- Automatically create org_membership with the org's default_role
CREATE FUNCTION auto_assign_org_by_domain()
RETURNS TRIGGER AS $$
DECLARE
    matching_org RECORD;
BEGIN
    -- Extract domain from email
    FOR matching_org IN
        SELECT id, default_role
        FROM organizations
        WHERE sso_domain = split_part(NEW.email, '@', 2)
          AND sso_domain IS NOT NULL
    LOOP
        INSERT INTO org_memberships (user_id, organization_id, role, status, joined_at, is_default_org)
        VALUES (NEW.id, matching_org.id, COALESCE(matching_org.default_role, 'pm'), 'active', NOW(), true)
        ON CONFLICT (user_id, organization_id) DO NOTHING;
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 9. Onboarding Lifecycle Design

### 9.1 Role-Based Onboarding Flows

| Role | Required Steps | Optional Steps |
|------|---------------|----------------|
| **exec** | Email verify → MFA setup → Terms acceptance → Org setup → Team invite | Feature tour, API keys |
| **pm** | Email verify → Terms acceptance → Profile completion → Project assignment | Notification prefs, Integrations |
| **client** | Email verify → Terms acceptance → Portal orientation | Notification prefs |
| **vendor** | Email verify → Terms acceptance → Compliance docs upload → Portal orientation | Notification prefs |

### 9.2 Onboarding State Machine

```
┌────────────┐     ┌──────────────┐     ┌────────────────┐
│ STEP:      │     │ STEP:        │     │ STEP:          │
│ not_started├────►│ in_progress  ├────►│ completed      │
└────────────┘     └──────┬───────┘     └────────────────┘
                          │
                          │ skip (if allowed)
                          ▼
                   ┌──────────────┐
                   │ STEP:        │
                   │ skipped      │
                   └──────────────┘
```

### 9.3 Progressive Onboarding Logic

1. **Gate 1 — Email Verification**: User cannot proceed until email is confirmed
2. **Gate 2 — Compliance**: Required policy acknowledgments (ToS, Privacy, NDA) must be accepted
3. **Gate 3 — Profile Completion**: Display name, timezone, and notification preferences
4. **Gate 4 — Role-Specific**: Org setup for exec, project familiarization for pm, portal tour for client/vendor
5. **Completion**: `user_profiles.onboarding_completed_at` is set; user gains full access

---

## 10. Active User Lifecycle & Preferences

### 10.1 Preference Categories

| Category | Key Examples | Storage |
|----------|-------------|---------|
| **display** | `theme` (light/dark/system), `density` (compact/default/comfortable), `accent_color` | `user_preferences` |
| **notifications** | `email_approvals`, `email_tasks`, `push_enabled`, `digest_frequency` | `user_preferences` |
| **accessibility** | `reduced_motion`, `high_contrast`, `font_size`, `screen_reader_hints` | `user_preferences` |
| **locale** | `timezone`, `date_format`, `number_format`, `currency` | `user_profiles` (core fields) |
| **privacy** | `analytics_opt_in`, `marketing_opt_in`, `data_sharing` | `user_preferences` |
| **integrations** | `slack_webhook_url`, `google_calendar_sync` | `user_preferences` |

### 10.2 API Token Lifecycle

```
CREATE ──► ACTIVE ──► EXPIRED
              │
              └──► REVOKED
```

Tokens are:
- Prefixed with `fp_` for identification (e.g., `fp_live_abc123...`)
- Stored as SHA-256 hash (plaintext shown once at creation)
- Scoped to specific permission levels and optionally to specific orgs
- Subject to expiration and manual revocation
- Logged on every use in `login_audit_log`

### 10.3 Feature Adoption Tracking

User activity is already captured in `activity_log` entries. The future state adds:
- `user_profiles.last_active_at` — updated on every authenticated request
- Inactivity detection: users inactive for configurable threshold trigger re-engagement notification
- Feature adoption metrics derived from activity log aggregation (no new tables needed)

---

## 11. Audit & Compliance Retention Framework

### 11.1 Immutable Audit Events

| Event Type | Logged In | Retention |
|------------|-----------|-----------|
| Login success/failure | `login_audit_log` | 2 years |
| Role granted/changed/revoked | `role_change_log` | Permanent |
| Org membership created/modified | `role_change_log` | Permanent |
| Permission elevation (temp grant) | `temporary_access_grants` | 2 years after expiry |
| Compliance acknowledgment | `user_compliance_acks` | Permanent |
| API token created/revoked | `login_audit_log` (token events) | 2 years |
| User deactivation/deletion | `role_change_log` | Permanent |
| Data export request | `login_audit_log` | 2 years |

### 11.2 Retention Policies

| Data Category | Default Retention | Legal Basis | Action on Expiry |
|--------------|-------------------|-------------|-----------------|
| PII (name, email, phone) | Until deletion request + 30 days | Consent / Contract | Anonymize |
| Authentication logs | 2 years | Legitimate interest | Purge |
| Role/permission changes | Indefinite | Compliance/audit | Retain |
| Session data | 90 days after expiry | Legitimate interest | Purge |
| API token metadata | 2 years after revocation | Security | Purge |
| Compliance acknowledgments | Indefinite | Legal obligation | Retain |

### 11.3 GDPR/CCPA Compliance Workflow

```
User requests deletion
        │
        ▼
┌───────────────────┐     ┌──────────────────────┐
│ Set lifecycle_    │     │ Start retention      │
│ status =          │────►│ countdown (30 days)  │
│ 'pending_deletion'│     │                      │
└───────────────────┘     └──────────┬───────────┘
                                     │
                          ┌──────────▼───────────┐
                          │ Revoke all sessions  │
                          │ Revoke all API tokens│
                          │ Remove from all orgs │
                          │ Reassign owned items │
                          └──────────┬───────────┘
                                     │
                          ┌──────────▼───────────┐
                          │ After 30 days:       │
                          │ • Anonymize PII       │
                          │ • Set display_name =  │
                          │   'Deleted User'      │
                          │ • Null avatar, phone  │
                          │ • Set anonymized_at   │
                          │ • Preserve UUID for   │
                          │   audit FK integrity  │
                          └──────────────────────┘
```

---

## 12. Soft Delete & Data Retention Model

### 12.1 Deletion States

| State | `lifecycle_status` | `deleted_at` | `anonymized_at` | PII Visible | Can Login |
|-------|--------------------|-------------|-----------------|-------------|-----------|
| Active | `active` | NULL | NULL | ✅ | ✅ |
| Suspended | `suspended` | NULL | NULL | ✅ | ❌ |
| Deactivated | `deactivated` | NULL | NULL | ✅ | ❌ |
| Pending Deletion | `pending_deletion` | SET | NULL | ✅ (grace period) | ❌ |
| Anonymized | `anonymized` | SET | SET | ❌ | ❌ |

### 12.2 Data Ownership Transfer

When a user is deactivated or deleted, owned resources must be transferred:

| Resource | Transfer Rule |
|----------|--------------|
| Projects (manager_id) | Reassign to org admin or specified successor |
| Tasks (assignee_id) | Unassign (back to backlog) or reassign |
| Approvals (approver_id) | Reassign to role-based successor |
| Documents (uploaded_by) | Preserve attribution (display as "Deleted User") |
| Deals (assigned_to) | Reassign to pipeline owner |
| API tokens | Revoke immediately |
| Sessions | Terminate immediately |

### 12.3 Backward Compatibility — Profiles View

To maintain FK integrity for the 20+ existing tables that reference `profiles(id)`:

```sql
-- Create a backward-compatible view
CREATE OR REPLACE VIEW profiles AS
SELECT
    up.id,
    up.email,
    up.display_name AS name,
    up.avatar_url,
    COALESCE(om.role, 'pm') AS role,
    om.organization_id,
    up.created_at,
    up.updated_at
FROM user_profiles up
LEFT JOIN org_memberships om
    ON om.user_id = up.id
    AND om.is_default_org = true
    AND om.status = 'active';
```

**Note:** The migration will rename `profiles` to `profiles_legacy`, create `user_profiles` as the new canonical table, migrate data, and create the `profiles` view for backward compatibility.

---

## 13. Security Risk Mitigation Matrix

| Risk | Severity | Mitigation | Implementation |
|------|----------|------------|----------------|
| **Credential stuffing** | High | Login attempt tracking + rate limiting in `login_audit_log`; Supabase built-in rate limiting | Migration 015 |
| **Session hijacking** | High | Session binding to device fingerprint; concurrent session limits | `user_sessions` table |
| **Privilege escalation** | Critical | Role changes require `exec` approval; all changes logged in `role_change_log` | Trigger + log |
| **Stale access** | Medium | `expires_at` on memberships and grants; scheduled cleanup function | Cron function |
| **Account takeover** | High | MFA enforcement via `organizations.require_mfa`; login anomaly detection | Org-level policy |
| **Data exfiltration** | High | RLS enforced at database level; role-aware policies | Enhanced RLS |
| **Orphaned access** | Medium | Offboarding workflow revokes all sessions, tokens, memberships | Deletion workflow |
| **Insider threat** | Medium | Immutable audit log; separation of duties in role assignment | Append-only tables |
| **Token leakage** | Medium | Tokens stored as SHA-256 hash; shown once; prefixed for detection | `api_tokens` design |
| **Compliance violation** | High | Required acknowledgments gate access; retention policies automated | `user_compliance_acks` |

---

## 14. UI/UX Cognitive Load Reduction

### 14.1 Onboarding Simplification

| Current | Future |
|---------|--------|
| User lands on dashboard immediately | Role-aware welcome flow with progressive steps |
| All nav items visible regardless of role | Nav filtered by effective permissions |
| Settings page shows all options | Progressive disclosure — show settings relevant to role |
| No profile completion prompts | Smart prompts for incomplete profile fields |

### 14.2 User Management Pages

| Page | Path | Purpose |
|------|------|---------|
| **User Directory** | `/user-management` | Browse all users across org with status/role filters |
| **Invitations** | `/user-management/invitations` | Send, resend, revoke invitations; track acceptance |
| **Access Reviews** | `/user-management/access-reviews` | Periodic review of active permissions; flag stale access |
| **Audit Log** | `/user-management/audit-log` | Searchable log of all auth events, role changes, access grants |

### 14.3 Progressive Disclosure Principles

1. **First-run**: Only show essential onboarding steps; hide advanced settings
2. **Role-aware**: Exec sees user management; PM sees team management; Client/Vendor see minimal settings
3. **Context-sensitive**: Show relevant actions based on current page context
4. **Non-blocking**: Optional steps can be deferred; required steps are clearly marked
5. **Undo-friendly**: All actions (except deletion after retention period) are reversible

---

## 15. Automation & AI Augmentation Roadmap

### 15.1 Rule-Based Automations (Phase 0–1)

| # | Automation | Trigger | Action |
|---|-----------|---------|--------|
| A1 | **Access expiration** | `org_memberships.expires_at` or `temporary_access_grants.expires_at` reached | Set status to `expired`; revoke sessions |
| A2 | **Inactivity detection** | `user_profiles.last_active_at` > 90 days | Send re-engagement email; flag for review |
| A3 | **Compliance reminder** | New required policy version published | Notify all users; gate access until acknowledged |
| A4 | **Invitation expiry** | `invitations.expires_at` reached | Set status to `expired` |
| A5 | **Session cleanup** | `user_sessions.expires_at` reached | Delete expired sessions |
| A6 | **Retention enforcement** | `data_retention_policies.retention_days` elapsed on `pending_deletion` users | Execute anonymization |
| A7 | **Domain auto-assignment** | New user signup with matching `organizations.sso_domain` | Create `org_membership` with `default_role` |
| A8 | **Kill switch** | Project `load_out` date + 48hrs | Expire vendor/client memberships for that project |

### 15.2 AI-Augmented Capabilities (Phase 2–3)

| # | Capability | Description |
|---|-----------|-------------|
| AI1 | **Smart onboarding personalization** | Analyze role + org + similar users to suggest optimal onboarding path |
| AI2 | **Adaptive UI** | Reorder nav items based on user's actual usage patterns |
| AI3 | **Permission anomaly detection** | Flag users with unusual access patterns (e.g., vendor accessing finance data) |
| AI4 | **Risk-based authentication** | Trigger additional verification for unusual login patterns (new device, location, time) |
| AI5 | **Intelligent preference suggestions** | Suggest notification preferences based on role and engagement patterns |
| AI6 | **Automated access reviews** | Generate periodic reports recommending permission right-sizing |
| AI7 | **Duplicate user detection** | Flag potential duplicate accounts across identity providers |
| AI8 | **Churn prediction** | Identify users likely to become inactive and suggest interventions |
| AI9 | **Smart delegation** | When user is unavailable, suggest delegation targets based on role + skills |
| AI10 | **Compliance automation** | Auto-generate compliance reports from audit log data |

---

## 16. Dataset Audit — 7W Coverage

### 16.1 Summary

| Entity Count | 7/7 Score | 6/7 Score | 5/7 Score |
|-------------|-----------|-----------|-----------|
| 12 new entities | 12 | 0 | 0 |
| 3 modified entities | 3 | 0 | 0 |

**All 15 entities achieve 7/7 coverage.**

### 16.2 Modified Entity Coverage

| Entity | Who | What | When | Where | Why | How | If-Then | Score |
|--------|-----|------|------|-------|-----|-----|---------|-------|
| organizations (enhanced) | ✅ | ✅ settings, sso_domain | ✅ | ✅ | ✅ require_mfa | ✅ default_role | ✅ sso_domain→auto-assign | 7/7 |
| project_members (enhanced) | ✅ granted_by | ✅ role, status | ✅ granted_at, expires_at | ✅ project-scoped | ✅ status | ✅ | ✅ expires→revoke | 7/7 |
| profiles (view) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ backward compat | ✅ | 7/7 |

---

## 17. Implementation Roadmap

### Phase 0 — Migration 015 (Immediate)

- [ ] Create all 12 new tables with enums, constraints, RLS, and triggers
- [ ] Migrate data from `profiles` → `user_profiles` + `org_memberships`
- [ ] Create backward-compatible `profiles` view
- [ ] Update `handle_new_user()` trigger for new schema
- [ ] Add `get_user_org_ids()` and `get_user_role_in_org()` functions
- [ ] Preserve `get_user_org_id()` for backward compatibility

### Phase 1 — Application Layer (This Session)

- [ ] TypeScript types for all new entities (`src/types/user-lifecycle.ts`)
- [ ] Mock data for user management pages
- [ ] Domain config enums (lifecycle status, invitation status, etc.)
- [ ] Navigation: "User Management" section with 4 routes
- [ ] RBAC: Add `user_management`, `invitations`, `access_reviews`, `audit_log` resources
- [ ] UI variants: Add new status keys
- [ ] Build 4 new pages: User Directory, Invitations, Access Reviews, Audit Log

### Phase 2 — Enhanced Security (Future)

- [ ] MFA enrollment UI + factor management
- [ ] API token management UI
- [ ] Session management UI (view/revoke active sessions)
- [ ] Risk-based auth triggers
- [ ] Enhanced RLS policies with role-awareness

### Phase 3 — Automation & AI (Future)

- [ ] Scheduled functions for access expiration, cleanup
- [ ] Domain auto-assignment trigger
- [ ] Inactivity detection and re-engagement
- [ ] AI-powered permission anomaly detection
- [ ] Smart onboarding personalization

---

*Document generated as part of the Frozen Phoenix User Lifecycle & Identity Management architecture initiative.*
