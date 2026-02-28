# Full-Stack Codebase Audit — Findings Report

**Project:** FrozenPhoenix (Playbook)
**Date:** 2025-01-XX
**Auditor:** Cascade AI
**Protocol:** prompt-audit.md §1–§14

---

## Executive Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 2 | Remediate immediately |
| HIGH | 8 | Remediate with tests |
| MEDIUM | 12 | Track as issues with acceptance criteria |
| LOW | 10 | Document as tech debt |
| INFO | 6 | Observations / positive signals |

**Current Baseline:**
- TypeScript: **0 errors** (`tsc --noEmit` clean)
- ESLint: **0 errors, 1 warning** (`<img>` in MFA QR page)
- npm audit: **0 vulnerabilities**
- Test coverage: **0%** (no test files exist)

---

## §1 — Database & Schema Integrity

### FIND-001 · INFO · Migration Integrity
30 migration files follow sequential naming convention (`001_` through `030_`). Schema uses `GENERATED ALWAYS AS` for derived columns. Foreign keys enforce referential integrity. 3NF compliance is strong.

### FIND-002 · LOW · Dual-Table Problem (profiles vs user_profiles)
`profiles` (legacy) and `user_profiles` (canonical, migration 018) coexist. The application exclusively reads `profiles`. RLS policies reference `profiles`. The canonical table is unused at runtime.
- **Impact:** Schema drift, confusion for future developers.
- **Recommendation:** Deprecation plan — migrate views/RLS to `user_profiles`, add `profiles` as a view, sunset over 2 releases.

### FIND-003 · MEDIUM · Seed Migration Contains Runtime Logic
`025_seed_defaults_and_onboarding.sql` seeds a default organization and onboarding step definitions. This is appropriate for dev/staging but should be gated or have a separate production seed strategy.

---

## §2 — Component-Driven UI Architecture

### FIND-004 · INFO · Atomic Design Compliance
Provider stack is well-layered: `ErrorBoundary → QueryClient → Auth → Settings → Theme → Accessibility → Network → Toast → ConfirmDialog → CommandBar`. Components use typed props, stateless-by-default pattern, and tokenized styling via CSS custom properties.

### FIND-005 · LOW · 44 TODO/FIXME Comments
29 files contain 44 `TODO`/`FIXME`/`HACK` markers. These should be triaged and converted to tracked issues.

### FIND-006 · LOW · 36 console.log/warn/error Statements
22 files contain 36 `console.*` calls. Production builds should strip these or route through a structured logging service.

---

## §3 — White-Label Readiness

### FIND-007 · INFO · Tokenized Design System
`globals.css` defines a comprehensive CSS custom property system with light/dark themes. `design-tokens.ts` serves as SSOT for UI primitives. Brand config supports multi-tenant via `config/brands/`.

### FIND-008 · MEDIUM · Brand Config File-Only
Adding a new tenant brand requires a code deploy (new file in `config/brands/`). No DB-backed brand configuration exists. The `organizations.settings` JSONB column (migration 018) is never read.
- **Recommendation:** Wire `organizations.settings` to runtime brand resolution, or create a `brands` table.

---

## §4 — Internationalization & Localization

### FIND-009 · MEDIUM · Hardcoded Strings in 48+ Pages
All UI strings are hardcoded English. `src/lib/i18n/` has locale formatters for 10 locales and auth strings are extracted, but no page-level i18n extraction has been done.
- **Impact:** Blocks localization. Known tech debt per casing normalization plan.

### FIND-010 · MEDIUM · formatCurrency/formatDate Hardcoded to en-US
`src/lib/utils.ts` functions `formatCurrency` and `formatDate` use `"en-US"` locale. `formatRelativeTime` uses English strings.
- **Recommendation:** Accept locale parameter, defaulting from user preference or browser locale.

### FIND-011 · INFO · RTL Support Present
`globals.css` includes `[dir="rtl"]` rules and logical property utilities. This is a positive foundation.

---

## §5 — Accessibility (WCAG 2.2 AA)

### FIND-012 · HIGH · ESLint img Warning — MFA QR Code
`src/app/auth/mfa-setup/page.tsx:170` uses `<img>` instead of `next/image`. This is a legitimate use case (data URI from Supabase TOTP enrollment), but the ESLint warning causes the quality gate to fail with `--max-warnings=0`.
- **Fix:** Add `// eslint-disable-next-line @next/next/no-img-element` or convert to `next/image` with `unoptimized` prop.

### FIND-013 · INFO · Accessibility Infrastructure
`AccessibilityProvider` with focus trap, keyboard detection, screen reader announcer. `globals.css` has `prefers-reduced-motion`, `prefers-contrast`, `forced-colors`, keyboard focus rings, touch target sizing (44px). This is enterprise-grade a11y.

### FIND-014 · MEDIUM · No Automated a11y Testing
No axe-core, jest-axe, or Playwright a11y assertions exist. The quality gate defines a11y criteria but they are manual-only.
- **Recommendation:** Add `@axe-core/react` in dev and/or `jest-axe` in test suite.

---

## §6 — Mobile Responsiveness

### FIND-015 · LOW · Physical Property Usage in CSS
`globals.css` lines 547–550 use physical `margin-left`/`margin-right`/`padding-left`/`padding-right` utilities (`.ps-4`, `.pe-4`, `.ms-4`, `.me-4` are correctly logical, but the custom properties they reference use physical names). Tailwind classes throughout the codebase generally use logical properties correctly.

### FIND-016 · INFO · Safe Area & Touch Target Support
`globals.css` includes `env(safe-area-inset-bottom)`, touch target enforcement at `pointer: coarse`, and responsive breakpoints. Mobile-first approach is evident.

---

## §7 — Security Hardening

### FIND-017 · CRITICAL · No Server-Side RBAC Enforcement
RBAC is **100% client-side** via `permission-guard.tsx`. The `DEFAULT_LEVEL` fallback is `"vendor"` (fixed from prior `"exec"` finding). However, API routes have no middleware-level permission checks. A vendor user could call any Supabase table directly via the browser client if RLS policies are insufficient.
- **Impact:** Data exposure, privilege escalation.
- **Fix:** Add server-side permission middleware to all API routes. Verify RLS policies cover all tables. See `src/app/api/middleware/permissions.ts` (exists but not wired to all routes).

### FIND-018 · CRITICAL · 17 `as any` Type Casts Bypass Type Safety
15 files use `as any` to work around Supabase client typing gaps (e.g., `auth-context.tsx`, `hooks-pages.ts`, all API routes). This suppresses TypeScript's ability to catch incorrect queries at compile time.
- **Impact:** Runtime errors, silent data corruption, missed schema mismatches.
- **Fix:** Generate proper `database.types.ts` from Supabase CLI (`supabase gen types typescript`), remove all `as any` casts.

### FIND-019 · HIGH · dangerouslySetInnerHTML in Layout
`src/app/layout.tsx:32` uses `dangerouslySetInnerHTML` for theme initialization. The content is a static string (no user input), so XSS risk is minimal, but it's a code smell that should be documented.
- **Recommendation:** Add inline comment explaining safety rationale, or move to a separate static script file.

### FIND-020 · HIGH · 35 eslint-disable Comments
20 files contain 35 `eslint-disable` directives, primarily `@typescript-eslint/no-explicit-any`. Each suppression should be reviewed and either resolved or documented with justification.

### FIND-021 · HIGH · Invitation Token in Response Body
`src/app/api/invitations/route.ts:59` returns invitation tokens in the API response. If this endpoint is accessible to the inviter, they could share tokens out-of-band.
- **Recommendation:** Only return token via email delivery. Return invitation ID + status to the caller, not the raw token.

### FIND-022 · HIGH · No Input Validation with Zod on API Routes
API routes (`invitations`, `organizations`, `onboarding`, `settings`) parse `request.json()` without Zod schema validation. `zod` is installed as a dependency and `src/lib/validation/schemas.ts` exists, but validation is not applied at the API boundary.
- **Impact:** Malformed input, injection vectors.
- **Fix:** Add Zod `.parse()` or `.safeParse()` at the top of every POST/PUT/PATCH handler.

### FIND-023 · MEDIUM · CSP Defined in Two Places
Content-Security-Policy is defined in both `next.config.ts` (headers) and `src/lib/supabase/middleware.ts` (response headers). The middleware version overrides the config version. This creates confusion about which CSP is active.
- **Recommendation:** Consolidate to one location (middleware, since it's more dynamic).

---

## §8 — Compliance & Legal

### FIND-024 · MEDIUM · No Cookie Consent / Privacy Banner
No cookie consent mechanism exists. GDPR/CCPA require consent for non-essential cookies. Supabase auth cookies are essential, but analytics cookies (if added) would need consent.

### FIND-025 · MEDIUM · No Data Retention Policy Enforcement
Migration schemas define `deleted_at` soft-delete columns but no automated retention/purge policy exists. GDPR right-to-erasure requires a documented process.

---

## §9 — API Design & Architecture

### FIND-026 · HIGH · API Routes Lack Consistent Error Schema
API routes return ad-hoc error objects (`{ error: "string" }`). No standard error envelope (error code, message, details, request ID) exists.
- **Recommendation:** Create a shared `apiError()` helper returning `{ error: { code, message, details?, requestId? } }`.

### FIND-027 · LOW · No OpenAPI / Swagger Documentation
13 API routes exist with no machine-readable documentation. Public API parity (guardrail §8.1) requires documented endpoints.

---

## §10 — Performance & Optimization

### FIND-028 · MEDIUM · No Bundle Size Budget Enforcement
Quality gate config defines a 200KB budget, but `next build` output is not programmatically checked against it in CI. The quality gate script has the infrastructure but the automated check for bundle size is a TODO.

### FIND-029 · LOW · QueryClient staleTime = 60s
`providers.tsx` sets `staleTime: 60 * 1000` and `refetchOnWindowFocus: false`. This is reasonable for dashboard data but may cause stale state for collaborative editing scenarios.

---

## §11 — Testing & Quality Assurance

### FIND-030 · HIGH · Zero Test Files
No test files exist in `src/`. No test runner (Jest, Vitest, Playwright) is configured. The quality gate requires ≥80% coverage on business logic. This is the largest gap in the codebase.
- **Impact:** No regression protection, no CI test gate, no confidence in refactoring.
- **Fix:** Install Vitest + React Testing Library. Create tests for: RBAC logic, auth utilities, API routes, critical UI components.

### FIND-031 · HIGH · No Test Runner Configured
`package.json` has no `test` script. No `vitest.config.ts`, `jest.config.ts`, or `playwright.config.ts` exists.

---

## §12 — Code Quality & Developer Experience

### FIND-032 · HIGH · tsconfig Missing noUncheckedIndexedAccess
`tsconfig.json` has `strict: true` but does not enable `noUncheckedIndexedAccess`. Array/object index access returns `T` instead of `T | undefined`, masking potential runtime errors.
- **Fix:** Add `"noUncheckedIndexedAccess": true` to `compilerOptions`.

### FIND-033 · LOW · No Prettier Configuration
No `.prettierrc` or `prettier.config.mjs` exists. Code formatting consistency relies solely on ESLint.

### FIND-034 · LOW · No .env.local.example Documentation
`.env.local.example` exists (190 bytes) but its contents should be verified to document all required environment variables.

---

## §13 — CI/CD & Deployment

### FIND-035 · MEDIUM · CI Quality Gate Has No Test Stage
`.github/workflows/quality-gate.yml` includes a test stage but it's conditional (`if: hashFiles('vitest.config.*') != ''`). Since no test config exists, tests never run in CI. Once tests are added, this will auto-activate.

### FIND-036 · LOW · No Dockerfile / Container Config
No `Dockerfile` or container configuration exists. The app appears to target Vercel/Netlify deployment. This is acceptable but limits deployment flexibility.

---

## §14 — Cross-Cutting Concerns

### FIND-037 · MEDIUM · No Structured Logging
`console.*` calls are used throughout. No structured logging library (pino, winston) is configured. Observability in production requires structured JSON logs.

### FIND-038 · LOW · No Analytics Integration
`src/lib/auth-analytics.ts` has an `emitAuthEvent()` stub for analytics, but no actual analytics provider (PostHog, Mixpanel, etc.) is integrated.

---

## Findings Summary Matrix

| ID | Severity | Section | Title | Actionable |
|----|----------|---------|-------|------------|
| FIND-017 | CRITICAL | §7 | No server-side RBAC | Phase 3 fix |
| FIND-018 | CRITICAL | §7 | 17 `as any` casts bypass type safety | Phase 3 fix |
| FIND-012 | HIGH | §5 | ESLint img warning blocks quality gate | Phase 3 fix |
| FIND-019 | HIGH | §7 | dangerouslySetInnerHTML in layout | Phase 3 fix |
| FIND-020 | HIGH | §7 | 35 eslint-disable comments | Phase 3 fix |
| FIND-021 | HIGH | §7 | Invitation token exposed in response | Phase 3 fix |
| FIND-022 | HIGH | §7 | No Zod validation on API routes | Phase 3 fix |
| FIND-026 | HIGH | §9 | No standard API error schema | Phase 3 fix |
| FIND-030 | HIGH | §11 | Zero test files | Phase 3 fix |
| FIND-031 | HIGH | §11 | No test runner configured | Phase 3 fix |
| FIND-032 | HIGH | §12 | Missing noUncheckedIndexedAccess | Phase 3 fix |
| FIND-003 | MEDIUM | §1 | Seed migration runtime logic | Track |
| FIND-008 | MEDIUM | §3 | Brand config file-only | Track |
| FIND-009 | MEDIUM | §4 | Hardcoded strings (48+ pages) | Track |
| FIND-010 | MEDIUM | §4 | formatCurrency/Date hardcoded en-US | Track |
| FIND-014 | MEDIUM | §5 | No automated a11y testing | Track |
| FIND-023 | MEDIUM | §7 | Dual CSP definition | Track |
| FIND-024 | MEDIUM | §8 | No cookie consent | Track |
| FIND-025 | MEDIUM | §8 | No data retention enforcement | Track |
| FIND-028 | MEDIUM | §10 | No bundle size budget enforcement | Track |
| FIND-035 | MEDIUM | §13 | CI has no active test stage | Track |
| FIND-037 | MEDIUM | §14 | No structured logging | Track |
| FIND-002 | LOW | §1 | Dual-table profiles/user_profiles | Debt |
| FIND-005 | LOW | §2 | 44 TODO/FIXME comments | Debt |
| FIND-006 | LOW | §2 | 36 console.* statements | Debt |
| FIND-015 | LOW | §6 | Physical property naming in CSS | Debt |
| FIND-027 | LOW | §9 | No OpenAPI documentation | Debt |
| FIND-029 | LOW | §10 | QueryClient staleTime trade-off | Debt |
| FIND-033 | LOW | §12 | No Prettier config | Debt |
| FIND-034 | LOW | §12 | env.local.example completeness | Debt |
| FIND-036 | LOW | §13 | No Dockerfile | Debt |
| FIND-038 | LOW | §14 | No analytics integration | Debt |
| FIND-001 | INFO | §1 | Migration integrity strong | — |
| FIND-004 | INFO | §2 | Atomic design compliance | — |
| FIND-007 | INFO | §3 | Tokenized design system | — |
| FIND-011 | INFO | §4 | RTL support present | — |
| FIND-013 | INFO | §5 | Accessibility infrastructure | — |
| FIND-016 | INFO | §6 | Safe area & touch support | — |
