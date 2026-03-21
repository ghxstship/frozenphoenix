# AUTH CERTIFICATION — Layer 2

**Protocol:** CLEARANCE FP-DEPLOY-CLEARANCE-001
**Audit Date:** 2026-03-21
**Auditor:** Antigravity Agent

---

## 2.1 — Auth Flow Inventory

### Routes Present

| Flow | Route | Status |
|---|---|---|
| Signup | `/signup` (public) | ✅ |
| Login | `/login` (public) | ✅ |
| Forgot Password | `/forgot-password` (public) | ✅ |
| Reset Password | `/auth/reset-password` | ✅ |
| MFA Setup | `/auth/mfa-setup` | ✅ |
| MFA Verify | `/auth/mfa-verify` | ✅ |
| OAuth Callback | `/auth/callback` | ✅ |
| Invitation Accept | `/invite/[token]` | ✅ |

### Auth Components (`src/features/auth/`)

| Component | Purpose | Status |
|---|---|---|
| `AuthLayout` | Branded auth page wrapper | ✅ |
| `AuthFormField` | Consistent form fields | ✅ |
| `PasswordInput` | Password with visibility toggle | ✅ |
| `OAuthButtons` | Google + social login | ✅ |
| `BotProtection` | Cloudflare Turnstile integration | ✅ |
| `EmailCollectionBanner` | Email verification prompt | ✅ |

---

## 2.2 — Middleware Enforcement: ✅ PASS

**File:** `src/lib/supabase/middleware.ts` (413 lines)

### Route Classification
| Category | Paths | Enforcement |
|---|---|---|
| **Public exact** | `/`, `/login`, `/signup`, `/forgot-password` | No auth required |
| **Public prefix** | `/auth/`, `/api/`, `/_next/`, `/invite/`, `/u/`, `/org/`, `/legal/`, `/portal/`, `/sign/` | No auth required |
| **Auth redirect** | `/login`, `/signup`, `/forgot-password` | Redirect to `/dashboard` if logged in |
| **Protected** | Everything else | Redirect to `/login` with return URL |

### Authentication Checks
1. ✅ `supabase.auth.getUser()` called on every protected request
2. ✅ Session refresh handled automatically via Supabase SSR
3. ✅ Auth cookies are `HttpOnly`, `Secure` (prod), `SameSite: lax`
4. ✅ Redirect preserves return URL via `?redirect=` parameter
5. ✅ Cookie propagation on redirect responses (`redirectWithCookies()`)

### MFA Enforcement
- ✅ AAL2 check via `supabase.auth.mfa.getAuthenticatorAssuranceLevel()`
- ✅ Users needing AAL2 redirected to `/auth/mfa-verify`
- ✅ MFA status cached in `fp-mfa-level` cookie (5 min TTL)

### Account Lifecycle Enforcement
- ✅ Blocked statuses: `suspended`, `banned`, `deactivated`, `offboarded`
- ✅ Blocked users auto-signed-out and redirected to `/login?reason=account_suspended`
- ✅ Lifecycle status cached in `fp-lifecycle-status` cookie (5 min TTL)

---

## 2.3 — RBAC Enforcement: ✅ PASS

### Middleware-Level (Cookie-First)
- ✅ Role resolved from `org_memberships` table → cached in `fp-user-role` cookie
- ✅ Org ID resolved and cached in `fp-org-id` cookie
- ✅ **Fast path**: when all cookies fresh, zero DB queries per request (<5ms)
- ✅ **Slow path**: parallel batch of MFA + lifecycle + role/org + onboarding checks

### API-Level
- ✅ RBAC enforced via `hasPermission(role, resource, action)` in CRUD factory
- ✅ Auth resolution via `resolveAuth(request)` checks user, role, and org
- ✅ Org-scoped queries (`WHERE organization_id = ?`) applied on top of RLS
- ✅ Immutable columns enforced (stripped from PATCH payloads)

### Component-Level
- ✅ `PermissionGate` component for UI-level gating
- ✅ Shell components (`ListPageShell`, etc.) enforce RBAC internally via `config.resource`
- ✅ ESLint rule Q-004 bans direct `PageHeader` imports in `_client.tsx` (enforces shell usage)

---

## 2.4 — Onboarding Flow Enforcement: ✅ PASS

### Middleware Checks
1. ✅ No org membership → redirect to `/onboarding/org-setup`
2. ✅ Only "default" org → redirect to `/onboarding/org-setup`
3. ✅ Gated steps checked against `onboarding_step_definitions` table
4. ✅ Completed steps tracked in `user_onboarding_progress` table
5. ✅ Email verification gate → redirect to `/settings/security?gate=verify_email`
6. ✅ Onboarding completion cached in `fp-onboarding-complete` cookie (24h TTL)
7. ✅ Onboarding skip tracked via `fp-onboarding-skipped` cookie

### Onboarding Steps
| Step | Route | Purpose |
|---|---|---|
| Org Setup | `/onboarding/org-setup` | Create or join organization |
| Claim Username | `/onboarding/claim-username` | Set unique handle |
| Invite Team | `/onboarding/invite-team` | Send team invitations |
| Billing | `/onboarding/billing` | Plan selection |
| Complete | `/onboarding/complete` | Welcome + orientation |

---

## 2.5 — Cross-Org Isolation

| Layer | Enforcement | Status |
|---|---|---|
| **Middleware** | Org ID resolved from `org_memberships` and cached | ✅ |
| **API** | All CRUD queries scoped by `organization_id` | ✅ |
| **Database** | RLS policies enforce org-scoping | ✅ |
| **URL manipulation** | Org from DB, not URL params | ✅ |
