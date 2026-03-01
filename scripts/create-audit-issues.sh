#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Bulk-create GitHub issues for audit findings
# Run: bash scripts/create-audit-issues.sh
# Requires: gh CLI authenticated (brew install gh && gh auth login)
# ─────────────────────────────────────────────────────────────
set -euo pipefail

REPO="ghxstship/frozenphoenix"

echo "Creating MEDIUM finding issues..."

gh issue create -R "$REPO" \
  --title "[FIND-003] MEDIUM: Seed migration contains runtime logic" \
  --label "audit,medium,database" \
  --body "## §1 Database & Schema Integrity

\`025_seed_defaults_and_onboarding.sql\` seeds a default org and 12 onboarding steps. Should be gated for production.

**Acceptance Criteria:**
- [ ] Separate seed data into \`supabase/seed.sql\` or conditional migration
- [ ] Gate with \`IF NOT EXISTS\` guards
- [ ] Document production seeding strategy"

gh issue create -R "$REPO" \
  --title "[FIND-008] MEDIUM: Brand config is file-only — no DB-backed tenants" \
  --label "audit,medium,white-label" \
  --body "## §3 White-Label Readiness

Adding tenants requires code deploy. \`organizations.settings\` JSONB (migration 018) is never read.

**Acceptance Criteria:**
- [ ] Wire \`organizations.settings\` to runtime brand resolution, OR create \`brands\` table
- [ ] Support runtime brand switching without code deploy
- [ ] Fallback to file-based config when DB brand not configured"

gh issue create -R "$REPO" \
  --title "[FIND-009] MEDIUM: Hardcoded English strings in 48+ pages" \
  --label "audit,medium,i18n" \
  --body "## §4 Internationalization

All UI strings hardcoded English. Auth strings extracted but no page-level i18n.

**Acceptance Criteria:**
- [ ] Choose i18n framework (next-intl, react-i18next, or custom)
- [ ] Extract strings from 10 most-used pages
- [ ] Create en-US baseline catalogs
- [ ] Add locale switching to settings"

gh issue create -R "$REPO" \
  --title "[FIND-010] MEDIUM: formatCurrency/formatDate hardcoded to en-US" \
  --label "audit,medium,i18n" \
  --body "## §4 Internationalization

\`formatCurrency\`, \`formatDate\`, \`formatRelativeTime\` in \`utils.ts\` use hardcoded en-US.

**Acceptance Criteria:**
- [ ] Accept locale parameter, default from user preference
- [ ] Add tests for 3+ locales"

gh issue create -R "$REPO" \
  --title "[FIND-014] MEDIUM: No automated accessibility testing" \
  --label "audit,medium,a11y" \
  --body "## §5 Accessibility (WCAG 2.2 AA)

No axe-core or jest-axe assertions. A11y infrastructure exists but is untested in CI.

**Acceptance Criteria:**
- [ ] Add \`@axe-core/react\` for dev overlay
- [ ] Add jest-axe/vitest-axe assertions for 5+ key components
- [ ] Wire into quality gate CI"

gh issue create -R "$REPO" \
  --title "[FIND-020] MEDIUM: 11 eslint-disable comments need review" \
  --label "audit,medium,code-quality" \
  --body "## §7 Security Hardening

10 files have 11 eslint-disable directives, mostly \`@typescript-eslint/no-explicit-any\`.

**Acceptance Criteria:**
- [ ] Audit each suppression: resolvable, justified, or deferred
- [ ] Replace resolvable with proper types
- [ ] Add justification comments for remaining
- [ ] Target ≤3 justified suppressions"

gh issue create -R "$REPO" \
  --title "[FIND-022] MEDIUM: Inconsistent Zod validation on API routes" \
  --label "audit,medium,security,api" \
  --body "## §7 Security Hardening

Some routes use \`parseAndValidate()\` with Zod, others parse \`request.json()\` without validation.

**Acceptance Criteria:**
- [ ] Audit all POST/PUT/PATCH handlers
- [ ] Create Zod schemas for unvalidated routes
- [ ] Use \`parseAndValidate()\` consistently
- [ ] Add validation rejection tests"

gh issue create -R "$REPO" \
  --title "[FIND-023] MEDIUM: CSP defined in two places" \
  --label "audit,medium,security" \
  --body "## §7 Security Hardening

CSP in both \`next.config.ts\` and \`middleware.ts\`. Middleware overrides config at runtime.

**Acceptance Criteria:**
- [ ] Consolidate to one location (middleware recommended)
- [ ] Remove duplicate
- [ ] Document authoritative CSP location"

gh issue create -R "$REPO" \
  --title "[FIND-024] MEDIUM: No cookie consent / privacy banner" \
  --label "audit,medium,compliance" \
  --body "## §8 Compliance & Legal

No cookie consent mechanism. GDPR/CCPA require consent for non-essential cookies.

**Acceptance Criteria:**
- [ ] Implement cookie consent banner
- [ ] Classify cookies: essential, functional, analytics
- [ ] Gate non-essential cookies behind consent
- [ ] Add privacy policy link"

gh issue create -R "$REPO" \
  --title "[FIND-025] MEDIUM: No data retention policy enforcement" \
  --label "audit,medium,compliance" \
  --body "## §8 Compliance & Legal

\`deleted_at\` soft-delete columns exist but no automated retention/purge. GDPR right-to-erasure has no path.

**Acceptance Criteria:**
- [ ] Document retention policy per table
- [ ] Create scheduled purge for expired records
- [ ] Implement user data export/anonymization endpoint"

gh issue create -R "$REPO" \
  --title "[FIND-028] MEDIUM: No bundle size budget enforcement in CI" \
  --label "audit,medium,performance,ci" \
  --body "## §10 Performance

Quality gate defines 200KB budget but \`next build\` output isn't checked against it in CI.

**Acceptance Criteria:**
- [ ] Extract bundle sizes from \`next build\` output
- [ ] Compare against 200KB threshold
- [ ] Fail CI if exceeded
- [ ] Add \`@next/bundle-analyzer\`"

gh issue create -R "$REPO" \
  --title "[FIND-035] MEDIUM: CI quality gate test stage needs verification" \
  --label "audit,medium,ci,testing" \
  --body "## §13 CI/CD

Test stage is conditional on \`hashFiles('vitest.config.*')\`. Now that vitest config exists, verify it runs.

**Acceptance Criteria:**
- [ ] Verify hashFiles detects \`vitest.config.ts\`
- [ ] Confirm test stage executes in CI
- [ ] Add coverage threshold enforcement (≥80%)
- [ ] Add test badge to README"

gh issue create -R "$REPO" \
  --title "[FIND-037] MEDIUM: No structured logging" \
  --label "audit,medium,observability" \
  --body "## §14 Cross-Cutting Concerns

42 \`console.*\` calls across 24 files. No structured logging library configured.

**Acceptance Criteria:**
- [ ] Install pino or equivalent
- [ ] Replace console.* with structured logger
- [ ] Add request ID correlation
- [ ] Configure log levels per environment"

echo ""
echo "Creating LOW finding issues (tech debt)..."

gh issue create -R "$REPO" \
  --title "[FIND-002] LOW: Dual-table problem — profiles vs user_profiles" \
  --label "audit,low,database,tech-debt" \
  --body "Legacy \`profiles\` and canonical \`user_profiles\` coexist. App only reads \`profiles\`. Plan deprecation.

- [ ] Migrate views/RLS to \`user_profiles\`
- [ ] Add \`profiles\` as compatibility view
- [ ] Sunset over 2 releases"

gh issue create -R "$REPO" \
  --title "[FIND-005] LOW: 49 TODO/FIXME comments across 33 files" \
  --label "audit,low,code-quality,tech-debt" \
  --body "Triage all markers. Convert actionable ones to issues, remove stale ones.

- [ ] Enumerate with \`grep -rn 'TODO\|FIXME\|HACK' src/\`
- [ ] Create issues for actionable items
- [ ] Remove resolved markers"

gh issue create -R "$REPO" \
  --title "[FIND-006] LOW: 42 console.* statements in production code" \
  --label "audit,low,code-quality,tech-debt" \
  --body "Replace with structured logger (blocked by FIND-037) or add ESLint \`no-console\` rule.

- [ ] Replace with structured logger
- [ ] Or add \`no-console\` ESLint rule at warn level"

gh issue create -R "$REPO" \
  --title "[FIND-015] LOW: Physical CSS property naming in utilities" \
  --label "audit,low,css,tech-debt" \
  --body "\`globals.css\` utilities use physical \`margin-left\`/\`padding-right\` instead of logical properties.

- [ ] Replace with \`margin-inline-start\`, \`padding-inline-end\`, etc.
- [ ] Verify RTL rendering"

gh issue create -R "$REPO" \
  --title "[FIND-027] LOW: No OpenAPI / Swagger documentation" \
  --label "audit,low,api,tech-debt" \
  --body "17 API routes with no machine-readable docs. Add OpenAPI spec.

- [ ] Choose approach (next-swagger-doc or Zod-to-OpenAPI)
- [ ] Document 5 most critical endpoints
- [ ] Add \`/api/docs\` Swagger UI route"

gh issue create -R "$REPO" \
  --title "[FIND-029] LOW: QueryClient staleTime trade-off" \
  --label "audit,low,performance,tech-debt" \
  --body "\`staleTime: 60s\` + \`refetchOnWindowFocus: false\` may cause stale data in collaborative scenarios.

- [ ] Document trade-off
- [ ] Consider per-query overrides for real-time data
- [ ] Leverage Supabase realtime for cache invalidation"

gh issue create -R "$REPO" \
  --title "[FIND-033] LOW: No Prettier configuration" \
  --label "audit,low,dx,tech-debt" \
  --body "No \`.prettierrc\` exists. Formatting relies on ESLint only.

- [ ] Add \`.prettierrc\` with project conventions
- [ ] Add \`format\` script to \`package.json\`
- [ ] Run initial format pass"

gh issue create -R "$REPO" \
  --title "[FIND-034] LOW: .env.local.example completeness" \
  --label "audit,low,dx,tech-debt" \
  --body "Verify all \`process.env.*\` references are documented in \`.env.local.example\`.

- [ ] Audit all env var references
- [ ] Group by service, annotate required vs optional"

gh issue create -R "$REPO" \
  --title "[FIND-036] LOW: No Dockerfile / container config" \
  --label "audit,low,devops,tech-debt" \
  --body "App targets Vercel but lacks container deployment option.

- [ ] Add multi-stage Dockerfile for standalone output
- [ ] Add docker-compose.yml for local dev
- [ ] Document container deployment"

gh issue create -R "$REPO" \
  --title "[FIND-038] LOW: No analytics integration" \
  --label "audit,low,observability,tech-debt" \
  --body "\`emitAuthEvent()\` stub exists but no actual analytics provider integrated.

- [ ] Choose provider (PostHog recommended)
- [ ] Wire stub to actual provider
- [ ] Add page view tracking
- [ ] Gate behind cookie consent (FIND-024)"

echo ""
echo "✅ All 22 audit issues created successfully."
