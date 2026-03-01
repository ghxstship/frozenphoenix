# Audit Findings — GitHub Issues

**Generated:** 2026-03-01
**Source:** `docs/AUDIT_FINDINGS_REPORT.md`
**Protocol:** prompt-audit.md §1–§14

> Import these issues using `gh issue create` or the GitHub UI.
> Labels: `audit`, severity (`medium` / `low`), category.

---

## MEDIUM Findings (12 issues)

### FIND-003 · Seed migration contains runtime logic

**Labels:** `audit`, `medium`, `database`

**Description:**
`supabase/migrations/025_seed_defaults_and_onboarding.sql` seeds a default organization and 12 onboarding step definitions. This is appropriate for dev/staging but should be gated or have a separate production seed strategy.

**Impact:**
- Seed data may conflict with production org creation flow
- No idempotency guard if migration reruns
- Mixing DDL and DML in migrations creates deployment risk

**Acceptance Criteria:**
- [ ] Separate seed data into a dedicated `supabase/seed.sql` or conditional seed migration
- [ ] Gate seed execution behind environment check (e.g., `IF NOT EXISTS` guards)
- [ ] Document production seeding strategy in README or ops runbook

**References:** `supabase/migrations/025_seed_defaults_and_onboarding.sql`

---

### FIND-008 · Brand config is file-only — no DB-backed tenants

**Labels:** `audit`, `medium`, `white-label`

**Description:**
Adding a new tenant brand requires a code deploy (new file in `config/brands/`). No DB-backed brand configuration exists. The `organizations.settings` JSONB column (migration 018) is never read by the application.

**Impact:**
- Adding tenants requires code changes and redeployment
- `organizations.settings` JSONB is dead schema
- Violates white-label readiness guardrail (§5 of constitution)

**Acceptance Criteria:**
- [ ] Wire `organizations.settings` to runtime brand resolution, OR create a `brands` table
- [ ] Support runtime brand switching without code deploy
- [ ] Fallback to file-based config when DB brand not configured
- [ ] Document brand configuration workflow

**References:** `src/config/brands/`, `src/config/brand.ts`, migration 018

---

### FIND-009 · Hardcoded English strings in 48+ pages

**Labels:** `audit`, `medium`, `i18n`

**Description:**
All UI strings across 48+ dashboard pages are hardcoded English. `src/lib/i18n/` has locale formatters for 10 locales and auth strings are extracted to `auth-strings.ts`, but no page-level i18n extraction has been done.

**Impact:**
- Blocks localization for non-English markets
- Violates i18n-first guardrail (§4.4 of constitution)

**Acceptance Criteria:**
- [ ] Choose i18n framework (next-intl, react-i18next, or custom)
- [ ] Extract strings from at least the 10 most-used pages
- [ ] Create string catalogs for en-US baseline
- [ ] Add locale switching capability to settings

**References:** `src/app/(dashboard)/` (48+ pages), `src/lib/i18n/auth-strings.ts`

---

### FIND-010 · formatCurrency/formatDate hardcoded to en-US

**Labels:** `audit`, `medium`, `i18n`

**Description:**
`src/lib/utils.ts` functions `formatCurrency` and `formatDate` use hardcoded `"en-US"` locale. `formatRelativeTime` uses English strings ("just now", "ago", etc.).

**Impact:**
- Currency and date formatting incorrect for non-US locales
- Breaks i18n compliance

**Acceptance Criteria:**
- [ ] Accept locale parameter in `formatCurrency`, `formatDate`, `formatRelativeTime`
- [ ] Default locale from user preference or browser `navigator.language`
- [ ] Add unit tests for at least 3 locales (en-US, de-DE, ja-JP)

**References:** `src/lib/utils.ts`, `src/lib/locale.ts` (existing 10-locale formatters)

---

### FIND-014 · No automated accessibility testing

**Labels:** `audit`, `medium`, `a11y`

**Description:**
No axe-core, jest-axe, or Playwright a11y assertions exist. The quality gate defines a11y criteria but they are manual-only. Accessibility infrastructure (AccessibilityProvider, focus traps, ARIA) is enterprise-grade but untested.

**Impact:**
- WCAG 2.2 AA compliance is unverifiable in CI
- Regressions can ship undetected

**Acceptance Criteria:**
- [ ] Add `@axe-core/react` for dev-time a11y violations overlay
- [ ] Add `jest-axe` or `vitest-axe` assertions for key page components
- [ ] Add at least 5 a11y tests covering: login, dashboard, data-table, command-bar, modal
- [ ] Wire a11y checks into quality gate CI

**References:** `src/hooks/use-accessibility.ts`, `quality-gate.config.ts`

---

### FIND-020 · 11 eslint-disable comments need review

**Labels:** `audit`, `medium`, `code-quality`

**Description:**
10 files contain 11 `eslint-disable` directives. Most are scoped `@typescript-eslint/no-explicit-any` for dynamic table access in the settings framework. Each suppression should be reviewed and either resolved or documented with justification.

**Impact:**
- Type safety gaps in settings framework
- Potential for runtime errors from untyped data

**Acceptance Criteria:**
- [ ] Audit each `eslint-disable` comment and categorize as: resolvable, justified, or deferred
- [ ] Replace resolvable suppressions with proper types or generics
- [ ] Add inline justification comments for each remaining suppression
- [ ] Target: reduce from 11 to ≤ 3 justified suppressions

**References:** Run `grep -rn "eslint-disable" src/` to locate all instances

---

### FIND-022 · Inconsistent Zod validation on API routes

**Labels:** `audit`, `medium`, `security`, `api`

**Description:**
Some API routes use Zod validation (e.g., `organizations/route.ts` uses `parseAndValidate` with `organizationCreateSchema`), but others parse `request.json()` without schema validation (e.g., `onboarding/progress/route.ts`, `auth/log-event/route.ts`, `organizations/[id]/security/route.ts`).

**Impact:**
- Malformed input accepted on unvalidated routes
- Inconsistent error response shapes for validation failures
- Potential for injection or unexpected data types

**Acceptance Criteria:**
- [ ] Audit all POST/PUT/PATCH handlers — identify routes without Zod schemas
- [ ] Create Zod schemas for: onboarding progress, log-event, org security PATCH, send-email
- [ ] Use `parseAndValidate()` from `api-utils.ts` consistently
- [ ] Add tests for validation rejection on each route

**References:** `src/lib/api-utils.ts` (`parseAndValidate`), `src/lib/validation/schemas.ts`

---

### FIND-023 · CSP defined in two places

**Labels:** `audit`, `medium`, `security`

**Description:**
Content-Security-Policy is defined in both `next.config.ts` (headers) and `src/lib/supabase/middleware.ts` (response headers). The middleware version overrides the config version at runtime. This creates confusion about which CSP is actually active.

**Impact:**
- Developer confusion about authoritative CSP source
- Risk of stale/conflicting policies
- Debugging CSP violations requires checking both locations

**Acceptance Criteria:**
- [ ] Consolidate CSP to one location (middleware recommended — more dynamic)
- [ ] Remove CSP from `next.config.ts` headers OR remove from middleware
- [ ] Add comment documenting where CSP is authoritatively defined
- [ ] Test CSP with `report-uri` or `report-to` in staging

**References:** `next.config.ts` (headers array), `src/lib/supabase/middleware.ts`

---

### FIND-024 · No cookie consent / privacy banner

**Labels:** `audit`, `medium`, `compliance`

**Description:**
No cookie consent mechanism exists. GDPR/CCPA require consent for non-essential cookies. Supabase auth cookies are essential (exempt), but any analytics or marketing cookies added in the future would need consent.

**Impact:**
- Non-compliant in EU/California markets if analytics added
- No infrastructure for consent management

**Acceptance Criteria:**
- [ ] Implement a cookie consent banner component
- [ ] Classify cookies: essential (auth), functional (preferences), analytics
- [ ] Gate non-essential cookies behind consent
- [ ] Persist consent preference (localStorage or cookie)
- [ ] Add privacy policy link

**References:** GDPR Art. 6, CCPA §1798.100, `quality-gate.config.ts` (compliance standards)

---

### FIND-025 · No data retention policy enforcement

**Labels:** `audit`, `medium`, `compliance`

**Description:**
Migration schemas define `deleted_at` soft-delete columns but no automated retention/purge policy exists. GDPR right-to-erasure requires a documented process for data deletion/anonymization.

**Impact:**
- Soft-deleted data accumulates indefinitely
- No GDPR right-to-erasure compliance path
- No scheduled cleanup of expired data (invitations, sessions, audit logs)

**Acceptance Criteria:**
- [ ] Document data retention policy per table (e.g., audit logs: 2 years, invitations: 90 days)
- [ ] Create a scheduled function or cron to purge expired soft-deleted records
- [ ] Implement user data export and anonymization endpoint
- [ ] Add retention policy to privacy documentation

**References:** Supabase migrations (soft-delete columns), GDPR Art. 17

---

### FIND-028 · No bundle size budget enforcement in CI

**Labels:** `audit`, `medium`, `performance`, `ci`

**Description:**
Quality gate config defines a 200KB budget, but `next build` output is not programmatically checked against it in CI. The quality gate script has the infrastructure but the automated check for bundle size is a TODO.

**Impact:**
- Bundle bloat can ship undetected
- Performance regression risk

**Acceptance Criteria:**
- [ ] Add bundle size extraction from `next build` output (`.next/analyze` or custom parser)
- [ ] Compare against 200KB threshold defined in `quality-gate.config.ts`
- [ ] Fail CI if any route bundle exceeds budget
- [ ] Add `@next/bundle-analyzer` for visual inspection

**References:** `quality-gate.config.ts`, `.github/workflows/quality-gate.yml`

---

### FIND-035 · CI quality gate has no active test stage

**Labels:** `audit`, `medium`, `ci`, `testing`

**Description:**
`.github/workflows/quality-gate.yml` includes a test stage but it's conditional (`if: hashFiles('vitest.config.*') != ''`). Since vitest config now exists and tests are passing (5 files, 88 tests), this condition should evaluate to true. Verify the test stage actually runs in CI.

**Impact:**
- Tests may not run in CI despite passing locally
- Test regressions could ship

**Acceptance Criteria:**
- [ ] Verify the `hashFiles` condition detects `vitest.config.ts`
- [ ] Trigger a CI run and confirm test stage executes
- [ ] Add coverage threshold enforcement (≥80% target from quality gate)
- [ ] Add test result badge to README

**References:** `.github/workflows/quality-gate.yml`, `vitest.config.ts`

---

### FIND-037 · No structured logging

**Labels:** `audit`, `medium`, `observability`

**Description:**
`console.*` calls are used throughout (42 instances across 24 files). No structured logging library (pino, winston) is configured. Production observability requires structured JSON logs with correlation IDs.

**Impact:**
- Logs are unstructured, unparseable by log aggregators
- No request correlation across distributed calls
- No log level filtering in production

**Acceptance Criteria:**
- [ ] Install and configure `pino` (recommended for Next.js) or equivalent
- [ ] Replace `console.*` calls with structured logger
- [ ] Add request ID correlation (from `ApiErrorPayload.requestId`)
- [ ] Configure log levels per environment (debug in dev, warn in prod)
- [ ] Add log drain configuration documentation

**References:** `src/lib/api-utils.ts` (requestId generation), `console.*` across 24 files

---

## LOW Findings (10 issues — Tech Debt)

### FIND-002 · Dual-table problem: profiles vs user_profiles

**Labels:** `audit`, `low`, `database`, `tech-debt`

**Description:**
`profiles` (legacy) and `user_profiles` (canonical, migration 018) coexist. The application exclusively reads `profiles`. RLS policies reference `profiles`. The canonical table `user_profiles` is unused at runtime.

**Acceptance Criteria:**
- [ ] Create deprecation plan for `profiles` table
- [ ] Migrate views/RLS to reference `user_profiles`
- [ ] Add `profiles` as a compatibility view over `user_profiles`
- [ ] Sunset `profiles` table over 2 releases

**References:** Migration 018, `src/lib/supabase/hooks.ts`, RLS policies

---

### FIND-005 · 49 TODO/FIXME comments across 33 files

**Labels:** `audit`, `low`, `code-quality`, `tech-debt`

**Description:**
33 files contain 49 `TODO`/`FIXME`/`HACK` markers. These should be triaged and converted to tracked issues.

**Acceptance Criteria:**
- [ ] Run `grep -rn "TODO\|FIXME\|HACK" src/` to enumerate all markers
- [ ] Triage each into: actionable issue, won't-fix (remove), or deferred
- [ ] Create GitHub issues for actionable items
- [ ] Remove stale/resolved markers

---

### FIND-006 · 42 console.log/warn/error statements

**Labels:** `audit`, `low`, `code-quality`, `tech-debt`

**Description:**
24 files contain 42 `console.*` calls. Production builds should strip these or route through a structured logging service.

**Acceptance Criteria:**
- [ ] Replace with structured logger (blocked by FIND-037)
- [ ] Or add ESLint `no-console` rule with `warn` level
- [ ] Allowlist `console.error` for genuine error paths

---

### FIND-015 · Physical property naming in CSS utilities

**Labels:** `audit`, `low`, `css`, `tech-debt`

**Description:**
`globals.css` lines 547–550 use physical `margin-left`/`margin-right`/`padding-left`/`padding-right` in custom utility definitions. The utility class names (`.ps-4`, `.pe-4`) are correctly logical, but the underlying properties should use logical equivalents for full RTL support.

**Acceptance Criteria:**
- [ ] Replace `margin-left` → `margin-inline-start`, `margin-right` → `margin-inline-end`
- [ ] Replace `padding-left` → `padding-inline-start`, `padding-right` → `padding-inline-end`
- [ ] Verify RTL rendering after change

**References:** `src/app/globals.css:547-550`

---

### FIND-027 · No OpenAPI / Swagger documentation

**Labels:** `audit`, `low`, `api`, `tech-debt`

**Description:**
17 API route files exist with no machine-readable documentation. Public API parity guardrail (§8.1 of constitution) requires documented endpoints.

**Acceptance Criteria:**
- [ ] Choose documentation approach (next-swagger-doc, manual OpenAPI spec, or Zod-to-OpenAPI)
- [ ] Document at least the 5 most critical endpoints
- [ ] Add Swagger UI route (e.g., `/api/docs`)
- [ ] Keep spec in sync via automation or CI check

**References:** 17 route files in `src/app/api/`

---

### FIND-029 · QueryClient staleTime may cause stale data

**Labels:** `audit`, `low`, `performance`, `tech-debt`

**Description:**
`providers.tsx` sets `staleTime: 60 * 1000` (60s) and `refetchOnWindowFocus: false`. This is reasonable for dashboard data but may cause stale state for collaborative editing scenarios.

**Acceptance Criteria:**
- [ ] Document the staleTime trade-off in code comment
- [ ] Consider per-query staleTime overrides for real-time-critical data
- [ ] Leverage existing Supabase realtime subscriptions for cache invalidation

**References:** `src/components/providers.tsx`

---

### FIND-033 · No Prettier configuration

**Labels:** `audit`, `low`, `dx`, `tech-debt`

**Description:**
No `.prettierrc` or `prettier.config.mjs` exists. Code formatting consistency relies solely on ESLint. Inconsistent formatting increases review noise.

**Acceptance Criteria:**
- [ ] Add `.prettierrc` with project conventions (tab width, semicolons, quotes, trailing commas)
- [ ] Add `prettier` to devDependencies
- [ ] Add `format` script to `package.json`
- [ ] Run initial format pass and commit

---

### FIND-034 · .env.local.example completeness

**Labels:** `audit`, `low`, `dx`, `tech-debt`

**Description:**
`.env.local.example` exists (190 bytes) but its contents should be verified to document all required and optional environment variables, including Resend, Turnstile, and analytics keys.

**Acceptance Criteria:**
- [ ] Audit all `process.env.*` references across codebase
- [ ] Update `.env.local.example` with every variable, grouped by service
- [ ] Add `required` vs `optional` annotations
- [ ] Document in README which variables are needed for minimal local dev

---

### FIND-036 · No Dockerfile / container configuration

**Labels:** `audit`, `low`, `devops`, `tech-debt`

**Description:**
No `Dockerfile` or container configuration exists. The app targets Vercel/Netlify deployment. This is acceptable but limits deployment flexibility for self-hosted or enterprise customers.

**Acceptance Criteria:**
- [ ] Add multi-stage `Dockerfile` for Next.js standalone output
- [ ] Add `docker-compose.yml` for local dev with Supabase
- [ ] Document container deployment option in README

---

### FIND-038 · No analytics integration

**Labels:** `audit`, `low`, `observability`, `tech-debt`

**Description:**
`src/lib/auth-analytics.ts` has an `emitAuthEvent()` stub for analytics, but no actual analytics provider (PostHog, Mixpanel, etc.) is integrated. Product decisions lack data.

**Acceptance Criteria:**
- [ ] Choose analytics provider (PostHog recommended — open source, self-hostable)
- [ ] Wire `emitAuthEvent()` stub to actual provider
- [ ] Add page view tracking on route changes
- [ ] Gate analytics behind cookie consent (see FIND-024)

**References:** `src/lib/auth-analytics.ts`
