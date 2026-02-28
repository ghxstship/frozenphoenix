# Authentication & Onboarding System Audit

## Comprehensive UX, UI, Security, Performance, Accessibility & Conversion Optimization Report

**Platform:** FrozenPhoenix / Playbook  
**Stack:** Next.js 15 (App Router) + Supabase + TailwindCSS  
**Date:** 2026-02-27  
**Auditor:** Cascade  

---

## Executive Summary

The Playbook authentication system has a **functional foundation** — email/password login, OAuth (Google/GitHub), magic link, MFA TOTP, password reset — all backed by Supabase Auth with a comprehensive DB schema (migration 018) covering user lifecycle, org memberships, invitations, session tracking, and compliance acknowledgments.

However, the **gap between schema design and UI implementation is severe**. The DB schema is enterprise-grade (SOC2-ready audit log, RBAC, multi-org, invitation system, onboarding state machine), but the front-end surfaces only ~20% of this capability. There is no onboarding flow, no invitation acceptance UI, no org creation, no MFA setup page, no session management UI, and no role-based first-login experience.

### Deployment Readiness Score: 3/10

| Dimension | Score | Rationale |
|---|---|---|
| Auth UX | 4/10 | Functional login/signup, but missing password visibility, strength meter, real-time validation |
| Security | 3/10 | No CAPTCHA, no client-side rate limiting, no MFA enforcement UI, email enumeration possible on signup |
| Onboarding | 1/10 | Zero onboarding UI exists despite full DB schema |
| Accessibility | 3/10 | Missing `htmlFor`/`id` on all labels, no `aria-describedby` for errors, no live regions |
| Performance | 6/10 | Lightweight pages, but no prefetching, no skeleton states on auth pages |
| Conversion | 3/10 | No social proof, no progressive disclosure, no smart defaults, high friction signup |
| i18n | 2/10 | Locale infrastructure exists, but all auth strings are hardcoded English |
| Multi-tenant | 2/10 | Schema ready, but no org creation UI, no invite acceptance, no org switcher |

---

## §1 — Critical Risks (P0)

### 1.1 Profile Creation Silently Fails — Users Stuck as "Guest"

**Files:** `auth-context.tsx:29-67`, `024_harden_handle_new_user.sql`

The DB trigger `handle_new_user()` wraps every INSERT in a `BEGIN...EXCEPTION` block that swallows errors. When the `organizations` table lacks a `slug='default'` row, the entire trigger silently fails. The client-side fallback (added in the previous session) creates a `profiles` row without `organization_id`, leaving the user without an org membership.

**Impact:** User authenticates but has no role, no org, no RBAC permissions. Sidebar shows "Guest". All RBAC-filtered content is empty.

**Fix:**
- Migration 025: Seed `organizations` with a guaranteed default row using `INSERT...ON CONFLICT DO NOTHING`
- Client-side fallback must also create `org_memberships` row, not just `profiles`
- Add observability: log trigger failures to `login_audit_log` instead of `RAISE WARNING`

### 1.2 Email Enumeration on Signup

**File:** `signup/page.tsx:35-48`

`supabase.auth.signUp()` returns different errors for "email already registered" vs new signups. The raw error message is displayed directly to the user, enabling email enumeration attacks.

**Fix:** Normalize all signup error messages to a generic response. Never reveal whether an email is already registered.

### 1.3 No Bot Protection on Any Auth Form

**Files:** `login/page.tsx`, `signup/page.tsx`, `forgot-password/page.tsx`

Zero CAPTCHA, honeypot, or proof-of-work on any auth form. Credential stuffing and automated signup abuse are trivially possible.

**Fix:** Add Cloudflare Turnstile (privacy-preserving, free tier) or hCaptcha. Implement as a reusable `<BotProtection>` component.

### 1.4 No Client-Side Rate Limiting

No throttling on failed login attempts. An attacker can brute-force passwords at network speed until Supabase's server-side rate limits kick in (which are generous by default).

**Fix:** Implement exponential backoff after 3 failed attempts (1s → 2s → 4s → lockout with countdown). Store attempt counter in `sessionStorage`.

### 1.5 OAuth `redirectTo` Open Redirect

**File:** `login/page.tsx:68`

```ts
redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
```

The `redirectTo` is read from `searchParams.get("redirect")` with no validation. An attacker can craft `?redirect=https://evil.com` and the callback will redirect there after auth.

**Fix:** Validate `redirectTo` against an allowlist of internal paths. Reject any absolute URLs or protocol-relative URLs.

### 1.6 Missing CSP Header

**File:** `middleware.ts:86-90`

OWASP headers are set (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) but **no Content-Security-Policy header**. This leaves the app vulnerable to XSS via injected scripts.

**Fix:** Add a strict CSP with `script-src 'self'`, nonce-based inline scripts, and Supabase domains in `connect-src`.

---

## §2 — Security Improvements

### 2.1 Password Policy (P0)

| Current | Required |
|---|---|
| `minLength={8}` on HTML input | Server-enforced minimum 10 chars |
| No complexity requirements | Require: uppercase + lowercase + digit + special char |
| No strength meter | Real-time strength indicator with color + text |
| No breach check | Check against HaveIBeenPwned k-Anonymity API |
| No reuse prevention | Store password hashes, block last 5 reused passwords |

**Component:** `<PasswordInput>` — atomic, reusable across signup, reset, and settings pages.

### 2.2 MFA Enforcement (P1)

The schema supports `organizations.require_mfa` but there is **no UI** to:
- Enroll TOTP (the `auth-actions.ts` functions exist but are not consumed)
- Show QR code for authenticator setup
- Verify 6-digit code on login
- Manage enrolled factors
- Enforce MFA on org policy

**Required pages:**
- `/settings/security` — MFA enrollment, backup codes, factor management
- `/auth/mfa-verify` — Interstitial after password login when MFA is enrolled
- `/auth/mfa-setup` — First-time MFA enrollment (gated by org policy)

### 2.3 Session Management UI (P1)

The `user_sessions` table exists but has no UI. Users cannot:
- View active sessions
- See device/location info
- Revoke remote sessions
- See "last seen" timestamps

**Required page:** `/settings/sessions` — list of active sessions with revoke action.

### 2.4 Login Audit Logging (P1)

The `login_audit_log` table exists but is **never written to** from the application. No auth events are recorded.

**Fix:** Add server-side API route `/api/auth/log-event` called from middleware on session creation/refresh. Capture IP, user agent, geo (via Vercel headers).

### 2.5 Invitation Token Security (P2)

The `invitations` table uses a `token` column but the token generation and validation logic doesn't exist in the application code. Tokens must be:
- Cryptographically random (≥32 bytes, URL-safe base64)
- Single-use (mark as consumed on acceptance)
- Time-limited (schema already has `expires_at` with 7-day default)
- Rate-limited (max 3 acceptance attempts per token)

---

## §3 — UX Optimization Opportunities

### 3.1 Password Visibility Toggle (P0)

**All 4 password fields** across login, signup, and reset pages use `type="password"` with no toggle.

**Fix:** `<PasswordInput>` component with `Eye`/`EyeOff` toggle button, proper `aria-label="Show password"` / `aria-label="Hide password"`.

### 3.2 Real-Time Form Validation (P0)

**Current:** Validation only occurs on submit. Users discover errors after waiting for a network round-trip.

**Required:**
- Email: validate format on blur, check domain MX (optional)
- Password: real-time strength meter as user types
- Name: validate non-empty on blur
- Confirm password: match check on keystroke
- All fields: `aria-invalid="true"` + `aria-describedby` pointing to error message `id`

### 3.3 Error Handling Standardization (P0)

**Current:** Raw Supabase error messages displayed directly (e.g., "Invalid login credentials", "User already registered"). These are:
- Not user-friendly
- Potentially security-leaking
- Not internationalized

**Fix:** Error message mapping layer:
```
"Invalid login credentials" → "Email or password is incorrect. Please try again."
"User already registered" → "An account may already exist. Try signing in instead."
"Email rate limit exceeded" → "Too many attempts. Please wait a few minutes."
```

### 3.4 Login Page — Missing Social Proof & Trust Signals (P1)

**Current:** Generic card with email/password fields. No indication of:
- How many organizations use the platform
- Security certifications
- Data residency
- What the user is signing into

**Fix:** Add a split-layout on desktop:
- Left panel: auth form
- Right panel: branded value proposition, customer logos (tokenized), security badges

### 3.5 Signup Page — Missing Organization Context (P0)

**Current:** Signup collects name + email + password only. After signup, users land on a dashboard with zero data, zero context, and zero guidance.

**Missing:**
- Organization name (required for net-new tenants)
- Industry/vertical selector (for template provisioning)
- Team size (for plan selection)
- Invitation token field (for invited users joining an existing org)
- "Join an existing org" vs "Create a new org" fork

### 3.6 Forgot Password — Good, But Missing (P1)

The forgot-password flow is solid but needs:
- "Didn't receive it? Resend" button with cooldown timer
- "Check your spam folder" guidance
- Magic link alternative ("Can't reset? Sign in with a magic link instead")

### 3.7 Post-Login Empty State Crisis (P0)

After signup + login, the dashboard shows:
- Pipeline Value: $0
- Revenue Won: $0
- Active Projects: 0
- Active Crew: 0
- Empty "Active Productions" list
- Empty "In Progress" list

**This is the #1 conversion killer.** A new user sees an empty tool and has no idea what to do next.

**Fix:** Role-specific empty state with:
- Welcome message using their name
- Quick-start checklist (derived from `onboarding_step_definitions`)
- "Create your first project" CTA
- Sample/demo data toggle
- Guided tour overlay (non-blocking)

---

## §4 — Accessibility Compliance (WCAG 2.2 AA)

### 4.1 Critical Violations

| Issue | Files | WCAG SC | Severity |
|---|---|---|---|
| `<label>` missing `htmlFor`/`id` binding | All auth pages | 1.3.1, 4.1.2 | A |
| No `aria-describedby` linking errors to inputs | All auth pages | 1.3.1 | A |
| No `aria-invalid` on inputs with errors | All auth pages | 3.3.1 | A |
| No live region (`aria-live`) for error announcements | All auth pages | 4.1.3 | A |
| No `role="alert"` on error banners | All auth pages | 4.1.3 | A |
| No skip-to-content link on auth pages | All auth pages | 2.4.1 | A |
| No visible focus ring on OAuth buttons | `login/page.tsx` | 2.4.7 | AA |
| No `aria-label` on OAuth SVG icons | `login/page.tsx:179-184` | 1.1.1 | A |
| Submit buttons don't announce loading state | All auth pages | 4.1.3 | A |
| Success/confirmation screens not announced | signup, forgot-password | 4.1.3 | A |

### 4.2 Required Fixes

Every auth form must use an `<AuthFormField>` atomic component:
```tsx
<AuthFormField
  id="email"
  label="Email"
  type="email"
  error={errors.email}
  icon={Mail}
  // Automatically generates:
  // - htmlFor + id binding
  // - aria-invalid when error present
  // - aria-describedby pointing to error id
  // - aria-required
/>
```

Error banners must use `role="alert"` and `aria-live="assertive"`.

### 4.3 Motion Concerns

Auth pages use `animate-fade-in`. This must respect `prefers-reduced-motion`. The `use-motion.ts` hook exists but is not used on any auth page.

---

## §5 — Onboarding Redesign Strategy

### 5.1 Current State

The DB has a complete onboarding framework:
- `onboarding_step_definitions` — template steps per role
- `user_onboarding_progress` — per-user tracking
- `user_lifecycle_status` — state machine (pending_verification → onboarding → active)
- `invitations` — token-based invite system

**None of this is surfaced in the UI.** There are zero onboarding pages, zero invitation acceptance flows, and zero org creation flows.

### 5.2 Two-Track Onboarding Architecture

#### Track A: New Organization (Net-New Tenant)

```
Signup → Email Verify → Org Creation → Role Selection → 
Industry Template → Invite Team → First Value Moment
```

**Step 1: Account Creation** (existing, needs enhancement)
- Add: Organization name field, industry selector, team size
- Progressive: only name + email + password required initially

**Step 2: Email Verification** (existing for confirm-required mode)
- Add: Resend CTA, spam folder guidance, magic link fallback

**Step 3: Organization Setup** `/onboarding/org-setup`
- Org name (pre-filled from signup if collected)
- Logo upload (Supabase Storage — hooks exist)
- Industry vertical (maps to template provisioning)
- Timezone, currency defaults
- Write: `organizations` row + `org_memberships` row

**Step 4: Role & Permissions** `/onboarding/role-setup`
- For exec: full access confirmed
- For pm: scope explanation
- For all: RBAC overview visualization

**Step 5: Template Provisioning** `/onboarding/templates`
- Based on industry: pre-populate demo projects, task templates, SOW templates
- "Start blank" vs "Use templates" fork
- Write: seed data to relevant tables

**Step 6: Invite Team** `/onboarding/invite-team`
- Bulk email input
- Role assignment per invite
- Personal message
- Skip option ("I'll do this later")
- Write: `invitations` rows, send emails

**Step 7: First Value Moment** → Redirect to Dashboard
- Dashboard shows welcome banner with quick actions
- Onboarding checklist persists in sidebar until completed
- Write: `user_onboarding_progress` rows

#### Track B: Existing Organization (Invited User)

```
Invitation Email → Accept URL → Signup/Login → 
Org Context Loaded → Role-Specific Onboarding → Dashboard
```

**Step 1: Invitation Acceptance** `/invite/[token]`
- Validate token (not expired, not revoked, not already accepted)
- Show: org name, inviter name, assigned role, personal message
- Fork: "Create Account" (new user) vs "Sign In" (existing user)
- Write: `invitations.status = 'accepted'`, create `org_memberships` row

**Step 2: Role-Specific First Login**
- Client role: sees deliverable review focus, approval queue
- Vendor role: sees assigned work orders, compliance checklist
- PM role: sees project overview, team management
- Exec role: sees full dashboard, financial overview

**Step 3: Context Tour**
- Non-blocking tooltip tour highlighting key features for the role
- "What's new" banner for returning users with new features
- Dismissible, remembers completion in `user_preferences`

### 5.3 Required New Pages

| Route | Purpose | Priority |
|---|---|---|
| `/onboarding/org-setup` | Organization creation wizard | P0 |
| `/onboarding/invite-team` | Team invitation bulk sender | P1 |
| `/onboarding/templates` | Industry template selector | P1 |
| `/invite/[token]` | Invitation acceptance & signup | P0 |
| `/auth/mfa-verify` | MFA interstitial on login | P1 |
| `/auth/mfa-setup` | First-time MFA enrollment | P1 |
| `/settings/security` | MFA, password change, sessions | P1 |
| `/settings/sessions` | Active session management | P2 |

---

## §6 — Technical Architecture Implications

### 6.1 Dual-Table Profile Problem

The codebase has two user identity tables:
- `profiles` (migration 001) — legacy, used by `auth-context.tsx`, sidebar, RBAC
- `user_profiles` (migration 018) — canonical, has lifecycle status, timezone, locale

**The application exclusively queries `profiles`.** The `user_profiles` table is populated by the trigger but never read by the UI. This is a **3NF/SSOT violation**.

**Fix (P0):** Migrate `auth-context.tsx` to query `user_profiles` + `org_memberships` instead of `profiles`. The `profiles` table should become a backward-compatible view, not the primary source.

### 6.2 Auth Context Missing Multi-Org Support

`AuthContextType` exposes:
```ts
profile: Profile | null  // single profile, single org
```

It should expose:
```ts
userProfile: UserProfile | null
memberships: OrgMembership[]
activeOrg: OrgMembership | null
switchOrg: (orgId: string) => Promise<void>
```

This enables the org switcher and scoped RBAC.

### 6.3 Missing API Routes

| Route | Purpose | Priority |
|---|---|---|
| `POST /api/invitations` | Create invitation (exec/pm only) | P0 |
| `POST /api/invitations/[token]/accept` | Accept invitation | P0 |
| `POST /api/organizations` | Create organization | P0 |
| `GET /api/organizations/[id]/members` | List org members | P1 |
| `POST /api/auth/log-event` | Audit log writer | P1 |
| `POST /api/auth/mfa/verify` | Server-side MFA verification | P1 |
| `GET /api/onboarding/progress` | Get user onboarding state | P1 |
| `POST /api/onboarding/progress` | Update step completion | P1 |

### 6.4 Required Schema Changes (Migration 025)

```sql
-- Guarantee default org exists
INSERT INTO organizations (name, slug)
VALUES ('Default Organization', 'default')
ON CONFLICT (slug) DO NOTHING;

-- Seed onboarding step definitions
INSERT INTO onboarding_step_definitions (role, step_key, title, sort_order, is_required, gate_access) VALUES
  ('all', 'verify_email', 'Verify your email', 1, true, true),
  ('all', 'complete_profile', 'Complete your profile', 2, true, false),
  ('exec', 'setup_organization', 'Set up your organization', 3, true, false),
  ('exec', 'invite_team', 'Invite your team', 4, false, false),
  ('all', 'explore_dashboard', 'Explore the dashboard', 5, false, false),
  ('pm', 'create_first_project', 'Create your first project', 3, false, false),
  ('client', 'review_deliverables', 'Review pending deliverables', 3, false, false),
  ('vendor', 'complete_compliance', 'Complete compliance checklist', 3, true, true)
ON CONFLICT (role, step_key) DO NOTHING;
```

---

## §7 — Recommended UI Component Standards

All auth/onboarding UI should be built from these atomic components:

### Primitives

| Component | Purpose |
|---|---|
| `<PasswordInput>` | Password field with visibility toggle, strength meter, `aria-describedby` |
| `<AuthFormField>` | Label + input + error + icon with full ARIA binding |
| `<BotProtection>` | Turnstile/hCaptcha wrapper, renders invisible challenge |
| `<OAuthButton>` | Brand-compliant OAuth provider button (Google, GitHub, Microsoft) |
| `<StrengthMeter>` | Password strength bar with color + text requirements |

### Patterns

| Pattern | Purpose |
|---|---|
| `<AuthLayout>` | Split-layout: form + branded panel. Reused on all auth pages |
| `<StepWizard>` | Multi-step onboarding with progress indicator, back/next/skip |
| `<OnboardingChecklist>` | Persistent checklist shown in sidebar/dashboard |
| `<InviteAcceptCard>` | Shows org info, inviter, role, accept/decline actions |
| `<EmptyStateGuide>` | Role-specific empty state with CTAs |

### Templates

| Template | Purpose |
|---|---|
| `AuthPageTemplate` | Brand header + centered card + footer links |
| `OnboardingPageTemplate` | Progress bar + step content + navigation |
| `SettingsSecurityTemplate` | MFA, password, sessions, API tokens |

---

## §8 — Event Tracking & Analytics Plan

### Auth Funnel Events

| Event | Properties | Trigger |
|---|---|---|
| `auth.page_viewed` | `page: login|signup|forgot|reset` | Page load |
| `auth.signup_started` | `method: email|oauth|invite` | Form focus or OAuth click |
| `auth.signup_completed` | `method, has_org, has_invite` | Successful signup |
| `auth.signup_failed` | `method, error_code` | Signup error |
| `auth.login_started` | `method: email|oauth|magic_link` | Form submit or OAuth click |
| `auth.login_completed` | `method, has_mfa, org_count` | Successful login |
| `auth.login_failed` | `method, error_code, attempt_count` | Login error |
| `auth.password_reset_requested` | — | Reset email sent |
| `auth.password_reset_completed` | — | New password set |
| `auth.oauth_started` | `provider` | OAuth button click |
| `auth.oauth_completed` | `provider, is_new_user` | OAuth callback success |
| `auth.mfa_enrolled` | `factor_type` | MFA factor enrolled |
| `auth.mfa_verified` | `factor_type` | MFA challenge passed |
| `auth.session_revoked` | `device_type, is_remote` | Session revoked |

### Onboarding Funnel Events

| Event | Properties | Trigger |
|---|---|---|
| `onboarding.started` | `track: new_org|invited|returning` | First protected page load |
| `onboarding.step_completed` | `step_key, duration_seconds` | Step marked complete |
| `onboarding.step_skipped` | `step_key` | Step skipped |
| `onboarding.completed` | `total_duration, steps_completed, steps_skipped` | All required steps done |
| `onboarding.abandoned` | `last_step, total_duration` | 24h since last step |
| `onboarding.invite_sent` | `count, roles` | Team invites sent |
| `onboarding.template_selected` | `template_id, industry` | Template provisioned |
| `onboarding.first_project_created` | — | First project created |

### Key Metrics to Track

- **Signup → First Login:** conversion rate, time elapsed
- **First Login → First Value Moment:** drop-off per step
- **Invite Sent → Invite Accepted:** conversion rate by role
- **Onboarding Completion Rate:** by role, by industry
- **Time to First Project:** from signup to first project creation
- **Auth Error Rate:** by error type, by method

---

## §9 — Enterprise Compliance Considerations (SOC2)

### Already Compliant (Schema-Level)

- ✅ Immutable audit log (`login_audit_log`, `role_change_log`)
- ✅ RLS on all user lifecycle tables
- ✅ Session tracking with device fingerprinting (`user_sessions`)
- ✅ Data retention policies table
- ✅ Compliance acknowledgment tracking
- ✅ Temporal access grants with expiry
- ✅ Soft delete with anonymization support

### Not Yet Implemented (Application-Level)

- ❌ Audit log is never written to from the application
- ❌ Session tracking table is never written to
- ❌ No compliance consent collection UI
- ❌ No data export (GDPR Article 15) functionality
- ❌ No account deletion request UI (GDPR Article 17)
- ❌ No access review dashboard for admins
- ❌ No IP allowlisting for org-level security
- ❌ No forced password rotation policy
- ❌ No API for external SIEM integration

---

## §10 — Edge Case Matrix

| Scenario | Current Behavior | Required Behavior |
|---|---|---|
| Invite token expired | No UI exists | Show "This invitation has expired" + "Request a new invite" CTA |
| Invite token already used | No UI exists | Show "This invitation was already accepted" + login CTA |
| Invite for existing user | No UI exists | Show login form with org join confirmation |
| Org deleted while user active | User retains stale org_id | Middleware checks org existence, redirects to org selector |
| Role revoked mid-session | User retains stale role in React state | Realtime subscription on `org_memberships` invalidates role |
| Password reset link expired | Supabase shows generic error | Show "This link has expired" + "Request a new one" CTA |
| Email already registered (signup) | Shows Supabase error message | Generic "Check your email" (prevent enumeration) |
| OAuth account without profile | Trigger may fail silently | Client-side fallback creates profile (already fixed) |
| Multiple browser tabs, sign out in one | Other tabs retain stale session | Broadcast channel or Supabase realtime listener |
| Supabase down / unreachable | "Authentication service unavailable" | Graceful degradation: retry with backoff, status page link |
| User banned/suspended | User can still log in | Middleware checks `lifecycle_status`, blocks suspended users |
| MFA factor lost | No recovery flow | Backup codes on enrollment, admin-reset flow |
| Concurrent org membership (multi-org) | No org switcher | Org switcher in header, scoped data queries |
| Session timeout during form fill | Data lost on redirect | Preserve form state in sessionStorage, restore on re-auth |

---

## §11 — Performance Benchmarks to Target

| Metric | Target | Current (Estimated) | Notes |
|---|---|---|---|
| Login page LCP | < 1.2s | ~1.5s | Fonts + card render |
| Login TTI | < 100ms | ~200ms | Form interactive time |
| Input latency | < 16ms | OK | React controlled inputs |
| Auth API round-trip | < 500ms | ~800ms | Supabase network hop |
| OAuth redirect | < 1s | OK | Provider-dependent |
| Page transition (login → dashboard) | < 300ms | ~500ms | No prefetch on form |
| Bundle size (auth pages) | < 50KB gzip | ~45KB | Already good |
| Skeleton → content (dashboard) | < 200ms | No skeleton | Shows spinner, not skeleton |

**Optimizations:**
- `next/link` prefetch on "Sign in" / "Sign up" links
- Skeleton shimmer on dashboard instead of spinner
- `<Suspense>` boundary already on login/reset (good)
- DNS prefetch for Supabase and OAuth provider domains

---

## §12 — Suggested A/B Tests

| Test | Hypothesis | Variant A | Variant B |
|---|---|---|---|
| Social login prominence | More prominent OAuth increases signup rate | Current: below form | OAuth buttons above email form |
| Single-page vs split signup | Reducing fields increases conversion | Name + email + password (current) | Email-only → password on step 2 |
| Password strength meter | Visible meter reduces weak password resets | No meter (current) | Real-time strength bar |
| Onboarding length | Shorter onboarding increases completion | 5-step wizard | 3-step (org + invite + template) |
| Empty state CTAs | Guided empty states increase activation | Empty dashboard (current) | Role-specific empty state with CTA |
| Trust signals | Security badges increase enterprise signup | No trust signals (current) | SOC2, encryption, uptime badges |
| Magic link vs password | Magic link increases conversion for certain segments | Password default | Magic link default, password fallback |

---

## §13 — Implementation Roadmap

### Phase 1: Critical Security & Auth UX (P0) — Week 1–2

1. **`<PasswordInput>` component** — visibility toggle, strength meter, ARIA
2. **`<AuthFormField>` component** — label binding, error linking, live regions
3. **`<AuthLayout>` template** — split layout with branded panel
4. **Fix email enumeration** — normalize error messages
5. **Add Turnstile bot protection** — on signup and forgot-password
6. **Fix open redirect** — validate `redirectTo` param
7. **Add CSP header** — in middleware
8. **Migration 025** — seed default org, onboarding step definitions
9. **Fix auth-context** — fallback creates `org_memberships` + queries `user_profiles`
10. **WCAG remediation** — all auth forms pass axe-core clean

### Phase 2: Onboarding MVP (P0) — Week 3–4

1. **`/invite/[token]` page** — invitation acceptance flow
2. **`/onboarding/org-setup` page** — org creation wizard
3. **`/onboarding/invite-team` page** — bulk invite sender
4. **Dashboard empty state** — role-specific welcome + checklist
5. **Onboarding progress API** — read/write `user_onboarding_progress`
6. **Invitation API** — create, accept, revoke
7. **Org creation API** — with template provisioning
8. **Auth context v2** — multi-org, `activeOrg`, `switchOrg`

### Phase 3: Enterprise Security (P1) — Week 5–6

1. **MFA enrollment page** — QR code, backup codes
2. **MFA verification interstitial** — post-login gate
3. **Session management page** — list, revoke, device info
4. **Login audit logging** — middleware integration
5. **Lifecycle status enforcement** — middleware blocks suspended users
6. **Org security settings** — require MFA, SSO domain, session timeout
7. **Password policy enforcement** — server-side strength validation

### Phase 4: Conversion & Polish (P2) — Week 7–8

1. **Analytics integration** — auth + onboarding funnel events
2. **Social proof on auth pages** — customer logos, security badges
3. **Guided tour** — role-specific tooltip tour
4. **"What's changed" banner** — for returning users
5. **Magic link login option** — progressive disclosure below password
6. **Dark mode audit** — ensure all auth components work in both themes
7. **i18n extraction** — move all auth strings to locale files
8. **Performance optimization** — prefetch, skeleton, DNS prefetch

---

## §14 — Deployment Readiness Checklist

### Must-Have Before Production (P0)

- [ ] `<label>` elements properly linked to inputs via `htmlFor`/`id`
- [ ] `aria-invalid`, `aria-describedby`, `role="alert"` on all auth forms
- [ ] Password visibility toggle on all password fields
- [ ] Email enumeration fixed (normalized error messages)
- [ ] Bot protection on signup and forgot-password forms
- [ ] Open redirect vulnerability fixed (redirectTo validation)
- [ ] CSP header added to middleware
- [ ] Default organization seeded in DB
- [ ] Profile creation fallback also creates org_membership
- [ ] Auth context queries `user_profiles` (not just legacy `profiles`)
- [ ] Invitation acceptance page (`/invite/[token]`)
- [ ] Organization creation wizard (`/onboarding/org-setup`)
- [ ] Dashboard empty state with onboarding checklist
- [ ] Client-side rate limiting on login (exponential backoff)
- [ ] All auth strings extractable for i18n (no more hardcoded English in JSX)

### Should-Have Before Enterprise Sales (P1)

- [ ] MFA enrollment + verification flow
- [ ] Session management UI
- [ ] Login audit log populated
- [ ] Org security settings page (require MFA, SSO domain)
- [ ] Lifecycle status enforcement in middleware
- [ ] Compliance consent collection on first login
- [ ] Team invitation flow with role assignment
- [ ] Org switcher (multi-org support)
- [ ] Role-specific onboarding experiences
- [ ] Auth funnel analytics

### Nice-to-Have (P2)

- [ ] SAML SSO integration
- [ ] IP allowlisting per org
- [ ] Forced password rotation
- [ ] Account deletion request flow (GDPR Art. 17)
- [ ] Data export request flow (GDPR Art. 15)
- [ ] External SIEM webhook integration
- [ ] A/B test infrastructure for auth flows
- [ ] Guided product tour framework
