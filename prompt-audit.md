# FULL-STACK CODEBASE AUDIT, HARDENING & OPTIMIZATION PROMPT

## WINDSURF — DEPLOYMENT-GRADE ENGINEERING DIRECTIVE

**Version:** 2026.1
**Classification:** Enterprise Production Readiness
**Standard:** Senior Full-Stack Deployment Checkpoint Protocol

---

## PREAMBLE — ROLE & OPERATING CONTEXT

You are a principal-level full-stack systems engineer conducting an end-to-end codebase audit, hardening pass, and optimization cycle. You operate under zero-tolerance quality standards. Every file, function, schema, component, route, and dependency must be evaluated against the checkpoints defined in this prompt.

**Your mission is threefold:**

1. **AUDIT** — Identify every violation, inconsistency, vulnerability, anti-pattern, and deviation from the standards below. Produce a categorized findings report with severity ratings (CRITICAL / HIGH / MEDIUM / LOW / INFO).
2. **HARDEN** — Remediate all CRITICAL and HIGH findings. Propose remediations for MEDIUM. Document accepted risks for LOW. Implement security, resilience, and compliance controls.
3. **OPTIMIZE** — Eliminate dead code, reduce bundle sizes, optimize queries, improve render performance, compress assets, and ensure the codebase is lean, fast, and production-grade.

**Operating constraints:**

- Never introduce breaking changes without documenting them and providing a migration path.
- Never delete data or schema columns without explicit confirmation — prefer soft-delete and deprecation flags.
- Preserve all existing git history context. Use atomic, conventional commits.
- When in doubt, default to the stricter standard.

---

## §1 — DATABASE & SCHEMA INTEGRITY

### 1.1 Third Normal Form (3NF) Enforcement

Audit every table, relation, and field against strict 3NF:

- **1NF**: Confirm every column is atomic. No serialized arrays, comma-delimited strings, or JSON blobs used as a substitute for relational data. If JSON columns exist, they must be explicitly justified (e.g., flexible metadata, JSONB with indexed paths) and documented with a schema validator.
- **2NF**: Confirm every non-key attribute depends on the entire composite key, not a subset. If composite keys exist, verify no partial dependencies. Decompose where necessary.
- **3NF**: Confirm no transitive dependencies. No non-key field should depend on another non-key field. Derived/computed values must be computed at query time or materialized via views/triggers — never stored redundantly unless an explicit, documented caching/denormalization strategy exists with a sync mechanism.

**Checklist:**

```
[ ] No multi-value columns (arrays stored as strings, CSV in fields)
[ ] No repeating groups or field-name-indexed columns (e.g., phone1, phone2, phone3)
[ ] All composite key tables verified for partial dependency violations
[ ] All transitive dependencies identified and decomposed
[ ] Denormalized fields documented with justification + sync strategy
[ ] All JSONB columns have a schema validator (Zod, JSON Schema, or DB CHECK constraint)
[ ] All junction/join tables properly indexed on both FK columns
[ ] No orphaned foreign keys — all FKs have ON DELETE/ON UPDATE policies
[ ] Enum values stored as reference tables or DB-native enums, not magic strings
[ ] Audit columns present: created_at, updated_at, created_by, updated_by on all mutable tables
[ ] Soft-delete pattern (deleted_at / is_active) on all entity tables
```

### 1.2 Single Source of Truth (SSOT) — Data Layer

- Every business entity must have exactly ONE authoritative table. No shadow tables, no duplicate caches without explicit invalidation logic.
- Configuration values must live in ONE location (env, config table, or vault) — not scattered across .env files, hardcoded constants, and database rows simultaneously.
- Feature flags must be centralized (single table or service), never checked via multiple inconsistent mechanisms.
- User roles/permissions must resolve from ONE authority (RBAC table, policy engine) — never duplicated in JWT claims without revalidation.

```
[ ] Entity-to-table mapping documented (each domain entity → exactly one authoritative table)
[ ] No duplicate business logic across DB triggers, application code, and stored procedures
[ ] Config values audited for single-source compliance
[ ] Feature flag system centralized with consistent evaluation
[ ] Auth/RBAC resolves from one authority; cached claims revalidated on sensitive operations
[ ] API response shapes derived from DB schema types (no hand-written parallel type definitions)
```

### 1.3 Migration & Schema Management

```
[ ] All schema changes in versioned, sequential migration files
[ ] Migrations are idempotent and reversible (up + down)
[ ] No raw SQL schema changes outside migration system
[ ] Seed data separated from migrations
[ ] Migration CI gate: migrations run against empty DB and against production snapshot
[ ] Column additions are non-breaking (nullable or with defaults)
[ ] Index strategy documented: composite indexes justified, covering indexes for hot queries
[ ] No N+1 query patterns in ORM usage — eager loading configured for known relation traversals
```

---

## §2 — COMPONENT-DRIVEN UI ARCHITECTURE

### 2.1 Atomic Design Compliance

Enforce a strict component hierarchy:

```
atoms/       → Buttons, inputs, labels, icons, badges, tooltips
molecules/   → Form fields (label + input + error), search bars, card headers
organisms/   → Navigation bars, data tables, forms, modals, sidebars
templates/   → Page layouts, dashboard shells, auth wrappers
pages/       → Route-level compositions only — zero business logic
```

**Rules:**

```
[ ] No page-level component exceeds 150 lines — extract organisms
[ ] No organism exceeds 300 lines — extract molecules
[ ] Every atom is stateless and purely presentational (props in → JSX out)
[ ] Molecules compose atoms only — no direct API calls
[ ] Organisms may manage local UI state but delegate data-fetching to hooks/stores
[ ] Templates define layout slots only — no content awareness
[ ] Pages compose templates + organisms + route-specific data fetching
[ ] No inline styles — all styling via design system tokens (CSS vars, Tailwind config, or theme object)
[ ] No hardcoded colors, spacing, or typography outside the design token system
[ ] Every component has a displayName or named export (no anonymous default exports)
[ ] Component files are co-located with their tests and styles (ComponentName/index.tsx, ComponentName.test.tsx, ComponentName.module.css)
```

### 2.2 Component API Standards

```
[ ] All component props typed with TypeScript interfaces (not `any`, not `object`)
[ ] Required vs optional props explicitly defined — no implicit defaults via undefined checks
[ ] Complex prop shapes use discriminated unions where applicable
[ ] Callback props use consistent naming: onAction, onActionComplete, onActionError
[ ] Render props / children-as-function patterns documented when used
[ ] All components handle loading, error, and empty states explicitly
[ ] Ref forwarding implemented where DOM access may be needed downstream
[ ] No prop drilling beyond 2 levels — use context, composition, or state management
```

### 2.3 State Management

```
[ ] Global state tool is singular and justified (Zustand, Redux Toolkit, Jotai — pick one)
[ ] Server state managed via dedicated tool (TanStack Query, SWR, Apollo) — never in global store
[ ] Form state managed via dedicated tool (React Hook Form, Formik) — never in global store
[ ] URL state (pagination, filters, sort) lives in URL params — not component state
[ ] No state duplication: derived values are computed, not stored
[ ] Optimistic updates implemented for all user-facing mutations
[ ] Cache invalidation strategy documented per entity
```

---

## §3 — WHITE-LABEL READINESS

The codebase must support multi-tenant white-labeling without forking.

### 3.1 Theming Architecture

```
[ ] All visual properties driven by a theme configuration object
[ ] Theme tokens cover: colors (primary, secondary, accent, semantic), typography (font families,
    scale, weights), spacing scale, border radii, shadows, breakpoints
[ ] Theme is injectable at runtime — no build-time baking of brand assets
[ ] CSS custom properties (--brand-primary, etc.) used as the token transport layer
[ ] Dark mode supported as a theme variant, not a separate codebase
[ ] Component library is theme-agnostic: zero hardcoded brand references
[ ] Logo, favicon, and brand assets loaded from tenant config — not static imports
[ ] Email templates and PDFs use the same theme tokens
[ ] White-label config schema documented with all overridable properties
```

### 3.2 Tenant Isolation

```
[ ] Tenant identification via subdomain, path prefix, or header — configurable per deployment
[ ] Tenant config resolvable at SSR/edge layer before first paint
[ ] Tenant data isolation: row-level security (RLS), schema-per-tenant, or DB-per-tenant — documented
[ ] Shared infrastructure costs attributed per tenant (logging, storage, compute)
[ ] Tenant-specific feature flags supported
[ ] No cross-tenant data leakage in: logs, error reports, caches, search indexes
[ ] Admin super-tenant has cross-tenant visibility with audit logging
```

### 3.3 Content & Copy Management

```
[ ] All user-facing strings extracted to locale files — zero hardcoded copy in components
[ ] Tenant-specific copy overrides supported (tenant locale files merge over defaults)
[ ] Legal copy (ToS, Privacy Policy) is tenant-configurable
[ ] Transactional emails support tenant branding and copy
[ ] Notification copy is configurable per tenant
```

---

## §4 — INTERNATIONALIZATION (i18n) & LOCALIZATION (L10n)

### 4.1 Text & Translation

```
[ ] i18n framework in use (next-intl, react-intl, i18next) — consistently across entire app
[ ] All user-facing strings use translation keys — zero raw strings in JSX
[ ] Interpolation used for dynamic values — no string concatenation with translated fragments
[ ] Pluralization rules implemented per locale (not just English singular/plural)
[ ] Gender-aware translations supported where applicable
[ ] Context/namespace separation for translation keys (auth.login.title, dashboard.header.welcome)
[ ] Translation files are JSON/YAML with flat or structured keys — consistent format
[ ] Missing translation fallback chain: tenant locale → base locale → default locale → key ID
[ ] Translation files have CI lint: no missing keys across locales, no unused keys
[ ] ICU MessageFormat or equivalent used for complex messages
```

### 4.2 Formatting & Cultural Adaptation

```
[ ] Dates formatted via Intl.DateTimeFormat or equivalent — never manual formatting
[ ] Numbers formatted via Intl.NumberFormat — respects locale grouping/decimals
[ ] Currency formatting uses locale rules with explicit currency code (not symbol-only)
[ ] Percentage, unit, and measurement formatting is locale-aware
[ ] Phone number formatting uses libphonenumber or equivalent
[ ] Address formatting adapts to country conventions
[ ] Name display order configurable (given-family vs family-given)
[ ] Calendar system support where applicable (Gregorian, Hijri, etc.)
[ ] Time zone handling: all timestamps stored as UTC, displayed in user's local TZ
[ ] Relative time formatting (e.g., "3 hours ago") uses Intl.RelativeTimeFormat
```

### 4.3 RTL & Bidirectional Support

```
[ ] Layout direction driven by locale — no hardcoded LTR assumptions
[ ] CSS logical properties used throughout (margin-inline-start, not margin-left)
[ ] Flexbox/Grid direction flips automatically with dir="rtl"
[ ] Icons that imply direction (arrows, progress) flip in RTL
[ ] Text alignment uses start/end, not left/right
[ ] No absolute positioning that breaks in RTL
[ ] Bidirectional text (mixed LTR/RTL content) handled with proper Unicode markers
[ ] RTL tested in CI with visual regression screenshots
```

---

## §5 — ACCESSIBILITY (a11y) — WCAG 2.2 AA MINIMUM

### 5.1 Semantic Structure

```
[ ] All pages have exactly one <h1>, logical heading hierarchy (no skipped levels)
[ ] Landmark regions used: <main>, <nav>, <header>, <footer>, <aside>, <section>
[ ] All interactive elements are native HTML where possible (<button>, <a>, <input>)
[ ] Custom interactive elements have appropriate ARIA roles, states, and properties
[ ] ARIA is used as a supplement, never as a replacement for semantic HTML
[ ] Skip navigation link present and functional
[ ] Page title updates on route change (dynamic <title> per page)
[ ] Language attribute set on <html> and on any content in a different language
```

### 5.2 Keyboard & Focus

```
[ ] All interactive elements reachable and operable via keyboard only
[ ] Focus order follows visual/logical order — no tabindex > 0
[ ] Focus trapping implemented for modals, drawers, and dialogs
[ ] Focus restoration on modal/dialog close (return focus to trigger element)
[ ] Visible focus indicators on all interactive elements (never outline: none without replacement)
[ ] Custom keyboard shortcuts documented and non-conflicting with screen readers
[ ] Roving tabindex implemented for composite widgets (tabs, menus, listboxes)
[ ] Escape key closes modals/popups/dropdowns consistently
```

### 5.3 Visual & Sensory

```
[ ] Color contrast ratios meet WCAG AA: 4.5:1 normal text, 3:1 large text, 3:1 UI components
[ ] Information is never conveyed by color alone — always paired with text, icon, or pattern
[ ] All images have meaningful alt text or alt="" for decorative images
[ ] All form inputs have associated <label> elements (not just placeholder text)
[ ] Error messages are descriptive, associated with their field, and announced to screen readers
[ ] Loading states announced to screen readers (aria-live="polite" or role="status")
[ ] Animations respect prefers-reduced-motion — disable or reduce all non-essential motion
[ ] Text resizable to 200% without loss of content or functionality
[ ] Touch targets minimum 44x44px on mobile
```

### 5.4 Screen Reader & Assistive Technology

```
[ ] Dynamic content changes announced via aria-live regions
[ ] Form validation errors summarized and linked (error summary pattern)
[ ] Data tables have proper <th> scope, <caption>, and header associations
[ ] Complex widgets (date pickers, rich text editors, carousels) have screen reader instructions
[ ] SVG icons have role="img" and <title> or aria-label
[ ] Automated a11y testing in CI (axe-core, pa11y, or Lighthouse a11y audit ≥ 95)
[ ] Manual screen reader testing documented (VoiceOver, NVDA, JAWS)
```

---

## §6 — MOBILE RESPONSIVENESS — FULL SPECTRUM

### 6.1 Responsive Architecture

```
[ ] Mobile-first CSS: base styles are mobile, progressively enhanced via min-width breakpoints
[ ] Breakpoint system defined in design tokens (sm: 640, md: 768, lg: 1024, xl: 1280, 2xl: 1536)
[ ] No horizontal scroll on any viewport 320px–2560px
[ ] All content accessible without zooming on mobile devices
[ ] Touch interaction areas ≥ 44x44px with adequate spacing between targets
[ ] No hover-only interactions — all hover states have tap/click equivalents
[ ] No fixed-width containers that break on small viewports
[ ] Viewport meta tag present: <meta name="viewport" content="width=device-width, initial-scale=1">
[ ] Container queries used for component-level responsiveness where supported
```

### 6.2 Navigation & Layout

```
[ ] Primary navigation collapses to mobile pattern (hamburger, bottom nav, or drawer) below md
[ ] Bottom navigation for primary actions on mobile (thumb-zone optimization)
[ ] Sidebar navigation converts to overlay/drawer on mobile
[ ] Data tables convert to card layout or horizontal scroll with sticky first column on mobile
[ ] Multi-column layouts stack appropriately on mobile
[ ] Modal/dialog sizing adapts: full-screen or bottom-sheet on mobile
[ ] Form layouts are single-column on mobile
[ ] Sticky headers/footers don't consume excessive viewport on small screens
```

### 6.3 Performance on Mobile

```
[ ] Images use srcset/sizes or <picture> for responsive loading
[ ] Critical CSS inlined for above-the-fold content
[ ] Font display: swap used — no invisible text during font load
[ ] Lazy loading on below-fold images and heavy components
[ ] Touch event handling optimized (no 300ms delay, passive listeners)
[ ] Virtual scrolling for lists > 50 items
[ ] Service worker caching strategy for offline/poor-connectivity support
[ ] Lighthouse mobile score ≥ 90 on all four categories
```

### 6.4 Device-Specific Considerations

```
[ ] Safe area insets handled for notched devices (env(safe-area-inset-*))
[ ] PWA manifest configured (icons, theme-color, display: standalone)
[ ] iOS-specific meta tags present (apple-mobile-web-app-capable, status-bar-style)
[ ] Input types appropriate for content (type="tel", type="email", inputmode="numeric")
[ ] Autofill and autocomplete attributes configured correctly on form fields
[ ] No viewport manipulation that breaks pinch-to-zoom accessibility
[ ] Orientation changes handled gracefully (no content loss or layout break)
[ ] Keyboard appearance doesn't obscure active input fields
```

---

## §7 — SECURITY HARDENING

### 7.1 Authentication & Authorization

```
[ ] Auth flow uses industry-standard protocol (OAuth 2.0 + PKCE, OIDC) — no custom token schemes
[ ] Passwords hashed with bcrypt (cost ≥ 12), scrypt, or Argon2 — never MD5/SHA-1/SHA-256 alone
[ ] JWT tokens: short-lived access (≤ 15 min), httpOnly secure refresh tokens, rotate on use
[ ] Session management: server-side session store for sensitive apps, not JWT-only
[ ] RBAC enforced at API layer — not just UI hiding
[ ] Permissions checked on every API request, not just on navigation
[ ] Rate limiting on auth endpoints (login, register, password reset)
[ ] Account lockout after N failed attempts with progressive backoff
[ ] MFA support (TOTP, WebAuthn, SMS fallback) for all user roles
[ ] Logout invalidates server-side session and clears all client tokens
```

### 7.2 Input Validation & Output Encoding

```
[ ] All inputs validated server-side (client validation is UX only, never security)
[ ] Validation schema (Zod, Joi, Yup) shared or mirrored between client and server
[ ] SQL injection prevented: parameterized queries only, no string interpolation in queries
[ ] XSS prevented: output encoding on all dynamic content, CSP headers configured
[ ] CSRF protection: anti-CSRF tokens on all state-changing requests (or SameSite cookies)
[ ] Path traversal prevented: no user input in file paths without sanitization
[ ] SSRF prevented: outbound request URLs validated against allowlist
[ ] File upload validation: type checking (magic bytes, not just extension), size limits, virus scan
[ ] Deserialization: no untrusted data deserialized without schema validation
[ ] GraphQL: depth limiting, query complexity analysis, no introspection in production
```

### 7.3 Infrastructure Security

```
[ ] HTTPS enforced everywhere — HSTS header with includeSubDomains and preload
[ ] Security headers configured: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection,
    Referrer-Policy, Permissions-Policy, Content-Security-Policy
[ ] CORS policy restrictive: explicit origin allowlist, no wildcard in production
[ ] API keys and secrets in vault/env — never in source code, commits, or client bundles
[ ] Secrets rotated on schedule and on team member departure
[ ] Database connections encrypted (TLS), credentials rotated
[ ] Principle of least privilege on all service accounts and IAM roles
[ ] Container images scanned for vulnerabilities (Trivy, Snyk)
[ ] Dependencies audited: no known CVEs (npm audit, pip audit, cargo audit in CI)
[ ] Error messages in production are generic — no stack traces, SQL errors, or internal paths exposed
```

### 7.4 Data Protection & Privacy

```
[ ] PII encrypted at rest (AES-256 or equivalent)
[ ] PII masked in logs (email, phone, SSN, names redacted or tokenized)
[ ] Data retention policies implemented and enforced (auto-purge after retention period)
[ ] User data export (GDPR Article 20 — data portability) implemented
[ ] User data deletion (GDPR Article 17 — right to erasure) implemented and cascading
[ ] Cookie consent banner implemented with granular category controls
[ ] Privacy policy and terms of service linked and versioned
[ ] Third-party data sharing documented and consented
[ ] Audit log for all data access on sensitive records (who accessed what, when)
[ ] Data classification labels on all DB tables (public, internal, confidential, restricted)
```

---

## §8 — COMPLIANCE & LEGAL

### 8.1 Regulatory Frameworks

```
[ ] GDPR compliance verified if serving EU users (consent, access, erasure, portability, DPO)
[ ] CCPA/CPRA compliance verified if serving California users (opt-out, access, deletion)
[ ] ADA/Section 508 compliance verified for US government or public-sector clients
[ ] SOC 2 Type II controls mapped if handling enterprise data
[ ] PCI DSS compliance verified if handling payment card data (or use certified payment processor)
[ ] HIPAA compliance verified if handling health data (BAA, encryption, access controls)
[ ] Age verification / COPPA compliance if potentially serving minors
[ ] Export control compliance for international deployments (ITAR, EAR if applicable)
```

### 8.2 Legal Infrastructure

```
[ ] Terms of Service: versioned, timestamped acceptance logged per user
[ ] Privacy Policy: versioned, covers all data collection and processing
[ ] Cookie Policy: granular consent per category (essential, analytics, marketing)
[ ] DPA (Data Processing Agreement) template available for enterprise clients
[ ] Acceptable Use Policy for user-generated content platforms
[ ] Subprocessor list maintained and disclosed (all third-party data processors)
[ ] Breach notification procedure documented (72-hour GDPR window)
[ ] Data residency requirements documented (which data in which regions)
```

---

## §9 — API DESIGN & ARCHITECTURE

### 9.1 RESTful Standards (or GraphQL Equivalents)

```
[ ] Consistent resource naming: plural nouns, kebab-case (/api/v1/user-profiles)
[ ] HTTP methods used correctly: GET (read), POST (create), PUT (full replace),
    PATCH (partial update), DELETE (remove)
[ ] Status codes meaningful and consistent (201 Created, 204 No Content, 400/422 for validation,
    401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 429 Rate Limited, 500 Server Error)
[ ] Pagination implemented consistently (cursor-based preferred, offset-based acceptable)
[ ] Filtering, sorting, and field selection via query parameters with documented syntax
[ ] API versioning strategy in place (URL path /v1/, header, or content negotiation)
[ ] Bulk operations supported where entity volume warrants (batch create, batch update)
[ ] HATEOAS or resource linking for discoverability (optional but recommended)
```

### 9.2 API Documentation & Contract

```
[ ] OpenAPI 3.1 spec maintained and auto-generated from code annotations
[ ] Every endpoint documented: method, path, params, request body, response shapes, error codes
[ ] API changelog maintained with breaking change callouts
[ ] SDK or client library auto-generated from OpenAPI spec
[ ] Postman/Insomnia collection maintained and versioned
[ ] Rate limiting documented: limits per tier, retry-after headers
[ ] Webhook event catalog documented with payload schemas and retry policy
```

### 9.3 Error Handling

```
[ ] Consistent error response envelope: { error: { code, message, details, requestId } }
[ ] Machine-readable error codes (AUTH_TOKEN_EXPIRED, VALIDATION_FAILED, RESOURCE_NOT_FOUND)
[ ] Validation errors include field-level detail: { field, message, rule }
[ ] No sensitive data in error responses (no SQL queries, stack traces, internal IDs in production)
[ ] Correlation/request ID on every response for traceability
[ ] Retry guidance in error responses where applicable (Retry-After header, exponential backoff hint)
```

---

## §10 — PERFORMANCE & OPTIMIZATION

### 10.1 Frontend Performance

```
[ ] Lighthouse Performance score ≥ 90 on mobile and desktop
[ ] Largest Contentful Paint (LCP) < 2.5s
[ ] First Input Delay (FID) / Interaction to Next Paint (INP) < 200ms
[ ] Cumulative Layout Shift (CLS) < 0.1
[ ] Time to First Byte (TTFB) < 600ms
[ ] Bundle size budget enforced: main bundle < 200KB gzipped, route chunks < 50KB each
[ ] Tree-shaking verified: no unused exports in production bundle
[ ] Code splitting on route boundaries and heavy components
[ ] Image optimization: WebP/AVIF format, responsive sizes, lazy loading
[ ] Font optimization: subset, preload, font-display: swap
[ ] Critical CSS inlined, non-critical CSS deferred
[ ] No render-blocking resources in <head>
[ ] Preconnect/dns-prefetch for third-party origins
[ ] Asset CDN configured with cache headers (immutable for hashed assets)
```

### 10.2 Backend Performance

```
[ ] Database queries profiled: no query > 100ms under normal load
[ ] N+1 query detection in ORM — DataLoader or equivalent batch strategy
[ ] Database connection pooling configured and right-sized
[ ] Redis/Memcached for hot-path caching with TTL and invalidation strategy
[ ] Background jobs for any operation > 500ms (email, PDF generation, image processing)
[ ] API response time budget: p50 < 100ms, p95 < 500ms, p99 < 1s
[ ] Pagination enforced on all list endpoints — no unbounded queries
[ ] Streaming responses for large payloads
[ ] Query result pagination at DB level (LIMIT/OFFSET or cursor) — not application-level filtering
[ ] Proper indexes: explain plan reviewed for all hot-path queries
```

### 10.3 Observability

```
[ ] Structured logging (JSON) with consistent fields: timestamp, level, service, requestId, userId
[ ] Log levels used correctly: ERROR (action needed), WARN (investigate), INFO (events), DEBUG (detail)
[ ] No PII in logs — masked or tokenized
[ ] Distributed tracing: every request has a trace ID propagated across services
[ ] Metrics collected: request rate, error rate, latency (RED method), saturation
[ ] Alerting configured: error rate spike, latency degradation, resource exhaustion
[ ] Health check endpoints: /health (basic), /health/ready (dependencies), /health/live (process)
[ ] Uptime monitoring with SLA tracking
[ ] Error tracking service integrated (Sentry, Bugsnag, Datadog) with source maps
[ ] Performance monitoring: real user metrics (RUM) and synthetic monitoring
```

---

## §11 — TESTING & QUALITY ASSURANCE

### 11.1 Testing Pyramid

```
[ ] Unit test coverage ≥ 80% on business logic (services, utils, hooks, validators)
[ ] Integration test coverage on all API endpoints (happy path + error cases)
[ ] E2E tests on all critical user flows (auth, checkout, CRUD operations)
[ ] Component tests (Testing Library) on all organisms and complex molecules
[ ] Visual regression tests on all template-level layouts (Chromatic, Percy, Playwright screenshots)
[ ] Contract tests between frontend and backend (if separate deployments)
[ ] Load/stress tests on all user-facing endpoints with documented capacity baseline
[ ] Accessibility tests automated in CI (axe-core integration)
```

### 11.2 Testing Standards

```
[ ] Tests follow AAA pattern: Arrange, Act, Assert
[ ] No test interdependencies — each test runs in isolation
[ ] Test data factories/fixtures used — no hardcoded magic values
[ ] Mocking is minimal and intentional — prefer integration over mocking
[ ] Flaky test tolerance: zero — flaky tests are fixed or quarantined immediately
[ ] CI pipeline fails on: test failure, coverage regression, lint error, type error, a11y violation
[ ] Tests run on every PR and on main branch push
[ ] Snapshot tests used sparingly and reviewed on every change (not rubber-stamped)
```

---

## §12 — CODE QUALITY & DEVELOPER EXPERIENCE

### 12.1 Linting & Formatting

```
[ ] ESLint configured with strict ruleset (recommended + plugin:@typescript-eslint/strict)
[ ] Prettier configured with project-wide settings (.prettierrc committed)
[ ] Stylelint configured for CSS/SCSS
[ ] Import ordering enforced (external → internal → relative → styles → types)
[ ] No eslint-disable without an accompanying justification comment
[ ] Husky + lint-staged on pre-commit: lint, format, type-check changed files
[ ] Editor config (.editorconfig) committed for cross-IDE consistency
```

### 12.2 TypeScript Strictness

```
[ ] strict: true in tsconfig (enables all strict flags)
[ ] noUncheckedIndexedAccess: true
[ ] No `any` types — use `unknown` and narrow, or explicitly type
[ ] No type assertions (as) without a justification comment — prefer type guards
[ ] Utility types used correctly (Partial, Required, Pick, Omit, Record)
[ ] Discriminated unions for variant types (not type: string with conditionals)
[ ] Branded/opaque types for IDs (UserId, OrderId are distinct types, not both `string`)
[ ] API response types auto-generated from OpenAPI spec or Prisma schema
[ ] No implicit any in function parameters or return types
```

### 12.3 Architecture & Patterns

```
[ ] Clear separation: UI layer → Application/Service layer → Data layer
[ ] Dependency injection or module pattern — no hard-coupled service instantiation
[ ] Repository pattern for data access — business logic never writes raw queries
[ ] Use case / service pattern for business logic — controllers are thin routing layers
[ ] Error handling: custom error classes with codes, not thrown strings
[ ] No circular dependencies — verified by madge or equivalent tool in CI
[ ] Barrel exports (index.ts) used consistently but not excessively (no re-export everything)
[ ] Feature-based directory structure for large apps, not layer-based
```

### 12.4 Documentation

```
[ ] README: setup instructions, architecture overview, deployment guide, environment variables
[ ] CONTRIBUTING.md: branch strategy, PR process, coding standards, review checklist
[ ] CHANGELOG.md: maintained per semantic versioning with conventional commits
[ ] ADRs (Architecture Decision Records) for all significant technical decisions
[ ] API documentation auto-generated and deployed
[ ] Component documentation (Storybook) for all shared UI components
[ ] Runbook for incident response and common operational tasks
[ ] Environment variable documentation with types, defaults, and descriptions
```

---

## §13 — CI/CD & DEPLOYMENT

### 13.1 Pipeline Standards

```
[ ] Pipeline stages: lint → type-check → test → build → security-scan → deploy
[ ] Build is reproducible: same commit always produces same artifact
[ ] Environment parity: staging mirrors production (infra, config structure, data shape)
[ ] Blue/green or canary deployment strategy — no big-bang deployments
[ ] Rollback procedure documented and tested: < 5 minutes to previous version
[ ] Database migrations run as separate step before application deployment
[ ] Feature flags decouple deployment from release
[ ] Deployment requires approval for production (manual gate or automated quality gate)
[ ] Artifact versioning: every deployment tagged with git SHA and semantic version
[ ] Post-deployment smoke tests run automatically
```

### 13.2 Environment Management

```
[ ] Environment variables: typed, validated at startup, fail-fast on missing required values
[ ] No environment-specific code branches (if (env === 'production')) — use configuration
[ ] Secrets management: vault or managed secrets service, not .env files in production
[ ] Environment variable documentation: every var documented with type, default, and description
[ ] Infrastructure as code (Terraform, Pulumi, CDK) — no manual infra changes
[ ] Preview deployments for every PR (Vercel, Netlify, or custom)
```

---

## §14 — CROSS-CUTTING CONCERNS

### 14.1 SEO

```
[ ] Server-side rendering or static generation for all public pages
[ ] Meta tags: title, description, og:*, twitter:* on every page
[ ] Canonical URLs set, hreflang tags for multi-language
[ ] Structured data (JSON-LD) for relevant content types
[ ] Sitemap.xml generated and submitted
[ ] robots.txt configured correctly
[ ] Core Web Vitals pass in Google Search Console
[ ] No JavaScript-dependent content for search-indexed pages
```

### 14.2 Error Boundaries & Resilience

```
[ ] React error boundaries at route, feature, and widget levels
[ ] Graceful degradation: widget failure doesn't crash the page
[ ] Retry logic with exponential backoff on transient API failures
[ ] Circuit breaker pattern on external service integrations
[ ] Timeout configuration on all HTTP requests (no infinite hangs)
[ ] Fallback UI for every async boundary (loading → data | error | empty)
[ ] Offline detection and graceful offline mode where applicable
```

### 14.3 Analytics & Telemetry

```
[ ] Analytics events follow a naming convention (entity_action: page_viewed, form_submitted)
[ ] Event properties are typed and documented
[ ] Analytics consent respected — no tracking before consent
[ ] Analytics abstraction layer: swap providers without code changes
[ ] Server-side event tracking for critical business events (purchase, signup)
[ ] Funnel tracking configured for key conversion flows
[ ] A/B testing infrastructure integrated with feature flag system
```

---

## §15 — AUDIT EXECUTION PROTOCOL

When executing this audit, follow this procedure:

### Phase 1 — Discovery (Read-Only)

1. Map the full directory structure and document the architecture pattern in use.
2. Identify the tech stack: framework, ORM, DB, auth provider, state management, styling, testing.
3. Read all config files: package.json, tsconfig, eslint, prettier, CI workflows, Dockerfile, env examples.
4. Read the database schema in full: migrations, models, seed files.
5. Read all route definitions and middleware.
6. Inventory all third-party dependencies and their versions.

### Phase 2 — Findings Report

Produce a categorized findings report:

```
## FINDINGS REPORT

### CRITICAL (Deploy Blockers)
- [C-001] SQL injection vulnerability in /api/search — raw string interpolation in query
- [C-002] JWT secret hardcoded in source code (auth.config.ts:14)

### HIGH (Must Fix Pre-Launch)
- [H-001] No rate limiting on /api/auth/login
- [H-002] Missing CSRF protection on state-changing POST routes

### MEDIUM (Fix Within Sprint)
- [M-001] N+1 query pattern in /api/orders — missing eager loading for order_items
- [M-002] No aria-label on icon-only buttons in navigation

### LOW (Tech Debt)
- [L-001] Inconsistent error response format across /api/v1 and /api/v2
- [L-002] Three unused dependencies in package.json

### INFO (Observations)
- [I-001] Bundle size 287KB gzipped — within budget but approaching threshold
- [I-002] Test coverage at 72% — below 80% target
```

### Phase 3 — Remediation

1. Fix all CRITICAL findings immediately with tests.
2. Fix all HIGH findings with tests.
3. Create tracked issues for MEDIUM findings with clear acceptance criteria.
4. Document LOW findings as tech debt with prioritization guidance.
5. Commit all changes with conventional commit messages referencing finding IDs.

### Phase 4 — Verification

1. Run full test suite — zero failures.
2. Run full lint suite — zero errors, zero warnings.
3. Run security scan — zero critical/high vulnerabilities.
4. Run Lighthouse audit — all scores ≥ 90.
5. Run accessibility audit — zero violations.
6. Run bundle analyzer — within size budget.
7. Verify all migrations run cleanly on empty database.
8. Verify rollback procedure works.

---

## §16 — APPENDIX: QUICK REFERENCE DECISION MATRIX

| Decision Point | Standard | Rationale |
|---|---|---|
| Store computed value? | Compute at query time | 3NF compliance, SSOT |
| Hardcode a string? | Extract to locale file | i18n, white-label |
| Hardcode a color? | Use design token | White-label, theming |
| Use margin-left? | Use margin-inline-start | RTL support |
| Hide UI for unauthorized? | Enforce at API layer | Security, defense in depth |
| Catch errors silently? | Log + user feedback | Observability, UX |
| Add any type? | Use unknown + narrow | Type safety |
| Skip test for trivial code? | Write the test | Regression prevention |
| Store session in JWT only? | Add server-side session | Security, revocability |
| Use fixed-width container? | Use responsive max-width | Mobile responsiveness |
| Store PII in plain text? | Encrypt at rest | Data protection, GDPR |
| Log user email? | Mask to j***@example.com | Privacy compliance |

---

**END OF PROMPT — Execute sections §1–§15 sequentially against the target codebase. Report findings before remediating. Verify after remediating. Ship clean.**