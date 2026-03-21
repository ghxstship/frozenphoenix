# ENVIRONMENT AUDIT — Layer 0

**Protocol:** CLEARANCE FP-DEPLOY-CLEARANCE-001
**Audit Date:** 2026-03-21
**Auditor:** Antigravity Agent

---

## 0.1 — Environment Variable Inventory

| Variable | Sensitivity | `NEXT_PUBLIC_` Safe | Required | Documented in `.env.local.example` |
|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Low | ✅ Yes | Optional | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Low | ✅ Yes | Optional | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | **HIGH** | ✅ Server-only | Optional | ✅ |
| `NEXT_PUBLIC_BRAND_ID` | Low | ✅ Yes | Optional | ✅ |
| `NEXT_PUBLIC_BRAND_NAME` | Low | ✅ Yes | Optional | ✅ |
| `NEXT_PUBLIC_BRAND_TAGLINE` | Low | ✅ Yes | Optional | ✅ |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Low | ✅ Yes | Optional | ✅ |
| `NEXT_PUBLIC_POSTHOG_KEY` | Low | ✅ Yes | Optional | ✅ |
| `NEXT_PUBLIC_POSTHOG_HOST` | Low | ✅ Yes | Optional | ✅ |
| `RESEND_API_KEY` | **HIGH** | ✅ Server-only | Optional | ✅ |
| `RESEND_FROM_EMAIL` | Medium | ✅ Server-only | Optional | ✅ |
| `LOG_LEVEL` | Low | ✅ Server-only | Optional | ✅ |
| `NODE_ENV` | Low | N/A | Auto-set | N/A |

### Naming Convention Compliance: ✅ PASS
- All client-safe variables prefixed with `NEXT_PUBLIC_*`
- `SUPABASE_SERVICE_ROLE_KEY` correctly NOT prefixed — server-only
- No ambiguous naming (single convention per variable)
- Zod validation via `src/lib/env.ts` enforces schema at import time

### Secret Leak Scan: ✅ PASS
- `.gitignore` excludes all `.env*` files
- No hardcoded secrets found in codebase scan
- No `@ts-ignore` or `@ts-expect-error` suppressions
- `dangerouslySetInnerHTML` used only on static string literals in `layout.tsx`

---

## 0.2 — Domain, DNS & SSL

> [!NOTE]
> DNS, SSL, and domain configuration require hosting platform access. These are documented as **manual action items**.

| Item | Status | Action Required |
|---|---|---|
| Primary domain configured | ⬜ Manual | Configure in Vercel/hosting platform |
| www redirect (canonical) | ⬜ Manual | Set up redirect rule |
| SSL/TLS valid + auto-renewing | ⬜ Manual | Verify via hosting platform |
| HSTS header | ✅ Set in middleware | `max-age=63072000; includeSubDomains; preload` |
| Email DNS (SPF/DKIM/DMARC) | ⬜ Manual | Configure for transactional email domain |

---

## 0.3 — Build Verification

| Check | Result |
|---|---|
| `next build` completes | ✅ PASS — 0 errors, 0 TypeScript errors (after 5 fixes) |
| No `@ts-ignore` | ✅ PASS — 0 instances |
| No `@ts-expect-error` | ✅ PASS — 0 instances |
| No inline ESLint disables | ✅ PASS — only in generated/infrastructure files |
| Compile time | 10.0s (Turbopack) |
| Output mode | `standalone` (Docker-ready) |

### Build Fixes Applied
1. `src/app/api/entities/[entity]/[id]/route.ts` — `Request` → `NextRequest`
2. `src/app/api/entities/[entity]/route.ts` — `Request` → `NextRequest`
3. `src/lib/api/route-registry.ts` — `operator: string` → `operator: FilterOperator`
4. `tsconfig.json` — Added `**/_archive` to exclude list
5. `src/features/auth/index.ts` — Fixed barrel export for bluesky-client

### npm Audit Results
| Package | Severity | Fix Available |
|---|---|---|
| `next` 16.1.6 | Moderate (5 advisories) | Yes — upgrade to 16.2.1 |
| `xlsx` | High (prototype pollution + ReDoS) | **No fix** — consider replacement |

---

## 0.4 — Hosting & Edge Configuration

> [!NOTE]
> Hosting configuration requires deployment platform access.

| Item | Status | Notes |
|---|---|---|
| Docker support | ✅ | `Dockerfile` + `docker-compose.yml` present |
| Standalone output | ✅ | `next.config.ts` → `output: "standalone"` |
| Image optimization | ✅ | AVIF + WebP, 86400s cache TTL |
| Server external packages | ✅ | AI SDKs, tiktoken, doc parsers excluded from client bundle |
| React Compiler | ✅ | Enabled via `reactCompiler: true` |
| Compression | ✅ | Enabled via `compress: true` |
