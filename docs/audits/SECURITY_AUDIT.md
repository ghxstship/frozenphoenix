# SECURITY AUDIT — Layer 6

**Protocol:** CLEARANCE FP-DEPLOY-CLEARANCE-001
**Audit Date:** 2026-03-21
**Auditor:** Antigravity Agent

---

## 6.1 — HTTP Security Headers: ✅ PASS (Grade A)

All headers defined in `src/lib/supabase/middleware.ts` and applied to **every response**.

| Header | Value | Status |
|---|---|---|
| `Content-Security-Policy` | Full directive set (see below) | ✅ |
| `X-Content-Type-Options` | `nosniff` | ✅ |
| `X-Frame-Options` | `DENY` | ✅ |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | ✅ |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | ✅ |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | ✅ |
| `X-DNS-Prefetch-Control` | `on` | ✅ |
| `X-Robots-Tag` | `noindex, nofollow` (API + auth routes) | ✅ |

### CSP Directives
```
default-src 'self';
script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://cdn.jsdelivr.net;
  (+ 'unsafe-eval' in dev only)
style-src 'self' 'unsafe-inline';
connect-src 'self' [supabase-url] wss://[supabase-domain] https://challenges.cloudflare.com https://accounts.google.com https://plc.directory https://bsky.social;
img-src 'self' data: blob: https://*.googleusercontent.com https://cdn.bsky.app;
font-src 'self';
frame-src https://challenges.cloudflare.com https://accounts.google.com;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
```

### Remediation Note
- `payment=()` should be added to `Permissions-Policy` for completeness.

---

## 6.2 — Input Validation & Sanitization: ✅ PASS

### Server-Side Validation
- **Zod v4** used consistently across all API routes via `parseAndValidate()` in `src/lib/api-utils.ts`
- **10 validation schema files** in `src/lib/validation/`:
  - `primitives.ts`, `entity-schemas.ts`, `extended-entity-schemas.ts`, `governance-entity-schemas.ts`, `extended-domain-schemas.ts`, `api-schemas.ts`, `advancing-schemas.ts`, `schema-registry.ts`, `schemas.ts`, `index.ts`
- Schema registry at `schema-registry.ts` (41KB) maps entities to their Zod schemas
- `parseAndValidate()` strips unexpected fields and returns structured errors

### Client-Side Validation
- `react-hook-form` + `@hookform/resolvers` for form management
- Zod schemas shared between client and server where applicable

### Sanitization
- No `dangerouslySetInnerHTML` except on static string literals (`layout.tsx`)
- No raw user input rendered as HTML
- Supabase parameterized queries used exclusively

---

## 6.3 — Rate Limiting: ✅ PASS

Implementation: `src/lib/security/rate-limit.ts`

| Feature | Status |
|---|---|
| Sliding window algorithm | ✅ |
| Per-client tracking (IP-based) | ✅ `getClientId()` via X-Forwarded-For / X-Real-IP |
| `Retry-After` header | ✅ Included in 429 responses |
| `X-RateLimit-Reset` header | ✅ ISO 8601 timestamp |
| Memory leak prevention | ✅ Periodic cleanup of expired entries |
| CRUD mutation limiter | ✅ 30 req/min shared across all CRUD endpoints |

---

## 6.4 — CSRF Protection: ✅ PASS

Implementation: Double-submit cookie pattern in `src/lib/supabase/middleware.ts`

| Feature | Status |
|---|---|
| CSRF cookie set for authenticated users | ✅ |
| Cookie is `SameSite: lax` | ✅ |
| Cookie is `Secure` in production | ✅ |
| 24-hour TTL with auto-refresh | ✅ |

---

## 6.5 — Dependency Security

| Check | Result |
|---|---|
| `npm audit` — high/critical | 1 high (`xlsx` — no fix), 1 moderate (`next` — fixable) |
| Lock file committed | ✅ `package-lock.json` (580KB) |
| Supabase client version | `@supabase/supabase-js` ^2.97.0 ✅ Latest |
| Next.js version | 16.1.6 (upgrade to 16.2.1 recommended) |
| No `@ts-ignore` | ✅ 0 instances |
| ESLint config | ✅ Strict: no-console, no-TODO, no-mock-imports |

### Action Items
- **P1:** Upgrade `next` to 16.2.1 to resolve 5 moderate advisories
- **P2:** Evaluate replacing `xlsx` with `exceljs` (prototype pollution + ReDoS vulnerability with no fix)

---

## 6.6 — Secret Management: ✅ PASS

| Check | Result |
|---|---|
| `.env*` in `.gitignore` | ✅ |
| No secrets in client-side code | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` server-only | ✅ Not `NEXT_PUBLIC_` prefixed |
| Env validation at boot | ✅ `src/lib/env.ts` with Zod |
