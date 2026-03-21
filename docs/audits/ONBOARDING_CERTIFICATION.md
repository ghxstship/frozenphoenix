# ONBOARDING CERTIFICATION — Layer 3

**Protocol:** CLEARANCE FP-DEPLOY-CLEARANCE-001
**Audit Date:** 2026-03-21
**Auditor:** Antigravity Agent

---

## 3.1 — First-Run Experience

### Step-by-Step Flow

| Step | Route | Enforcement | Status |
|---|---|---|---|
| 1. Discovery → Signup | `/signup` | Public route, branded auth layout | ✅ |
| 2. Email Confirmation | Supabase Auth Magic Link / `/auth/callback` | Auto via Supabase | ✅ |
| 3. Profile Setup | Via user profile settings | Post-auth | ✅ |
| 4. Org Setup | `/onboarding/org-setup` | Middleware-enforced gate | ✅ |
| 5. Claim Username | `/onboarding/claim-username` | Onboarding flow step | ✅ |
| 6. Invite Team | `/onboarding/invite-team` | Onboarding flow step | ✅ |
| 7. Billing | `/onboarding/billing` | Plan selection step | ✅ |
| 8. Complete | `/onboarding/complete` | Welcome + orientation | ✅ |

### Middleware Enforcement

The middleware in `src/lib/supabase/middleware.ts` enforces onboarding gates:
- ✅ No org membership → redirect to `/onboarding/org-setup`
- ✅ Only "default" org → redirect to `/onboarding/org-setup`
- ✅ Gated steps from `onboarding_step_definitions` table checked
- ✅ Email verification gate → redirect to `/settings/security?gate=verify_email`
- ✅ Onboarding status cached in cookie (24h TTL) to avoid repeated DB checks
- ✅ Onboarding pages excluded from gate checks (prevents redirect loops)

---

## 3.2 — Invitation Flow

### API Routes
- `/api/invitations` — invitation CRUD
- `/invite/[token]` — invitation acceptance page

### Features
| Feature | Status |
|---|---|
| Invite by email | ✅ via API |
| Role selection at invite time | ✅ from RBAC role set |
| Branded invitation email | ✅ via `src/lib/email/send.ts` + Resend API |
| Invitation token-based accept | ✅ `/invite/[token]` route |
| Existing user acceptance | ✅ Joins org with invited role |
| Loading state | ✅ `src/app/invite/[token]/loading.tsx` exists |

---

## 3.3 — Seed Data

| Item | Status |
|---|---|
| Onboarding step definitions seeded | ✅ `025_seed_defaults_and_onboarding.sql` |
| Demo/sandbox data | ✅ Catalog seed data (883KB total across 3 migrations) |
| Idempotent seeding | ✅ Uses `ON CONFLICT` patterns |
