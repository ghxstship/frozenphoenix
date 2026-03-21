# NORMALIZATION_VIOLATIONS.md — Code Standard Violations & Remediation

**Generated:** 2026-03-21 | **Protocol:** ANTIGRAVITY FP-INFRA-001

---

## Critical Violations

### 1. Missing `loading.tsx` Files

**Rule:** Every `page.tsx` MUST have a corresponding `loading.tsx` with a layout-matching skeleton.

| Area | Total Pages | Has `loading.tsx` | Missing | Status |
|------|:-----------:|:-----------------:|:-------:|:------:|
| Dashboard routes | 168 | 2 (`home/documents`, `home/tasks`) | **166** | ❌ |
| Public routes | 8 | 0 | **8** | ❌ |
| Auth routes | 3 | 0 | **3** | ❌ |
| Special routes | 3 | 0 | **3** | ❌ |
| Catch-all slug | 1 | 1 (`[[...slug]]`) | 0 | ✅ |
| **TOTAL** | **226** | **3** | **180** | ❌ |

**Impact:** Without `loading.tsx`, navigation between pages shows no visual feedback until the full page mounts and data loads. This causes:
- Poor perceived performance (blank screen during navigation)
- Elevated CLS (content pops in without placeholder)
- No Suspense streaming benefits

**Remediation:** Generate `loading.tsx` for every route directory that contains a `page.tsx`.

---

### 2. Missing `error.tsx` Files

**Rule:** Every `page.tsx` MUST have a corresponding `error.tsx` with `'use client'`, retry action, and navigate-back.

| Area | Total Pages | Has `error.tsx` | Missing | Status |
|------|:-----------:|:---------------:|:-------:|:------:|
| Dashboard (group) | 168 | 1 (group-level) | **0** (covered) | 🟡 |
| Root (group) | 226 | 1 (root-level) | **0** (covered) | 🟡 |
| Per-route | 226 | 0 | **180+** | ⚠️ |

**Note:** The group-level `error.tsx` files at `(dashboard)/error.tsx` and `app/error.tsx` provide error boundary coverage for all routes within their respective groups. Per-route `error.tsx` files would provide more granular error handling but the current architecture provides adequate coverage.

**Remediation:** The existing group-level error boundaries provide functional coverage. Per-route error files are a normalization enhancement, not a critical gap.

---

## Moderate Violations

### 3. No Explicit Rendering Strategy Declarations

**Rule:** Every page MUST explicitly declare its rendering strategy.

| Route Category | Should Declare | Current | Violation |
|---------------|---------------|---------|:---------:|
| Public landing | `dynamic = 'force-static'` | Implicit dynamic | ⚠️ |
| Legal pages | `dynamic = 'force-static'` | Implicit dynamic | ⚠️ |
| Login/Signup | `dynamic = 'force-static'` | Implicit dynamic | ⚠️ |
| Dashboard pages | `dynamic = 'force-dynamic'` (implicit via cookies) | Implicit | 🟡 |

**Impact:** Public/legal pages are served dynamically when they could be statically generated, adding unnecessary TTFB.

### 4. Long Files (>200 Lines)

| File | Lines | Status |
|------|:-----:|:------:|
| `settings/_client.tsx` | ~1900+ | ⚠️ Should be split |
| `settings/ai/_client.tsx` | ~900+ | ⚠️ Should be split |
| `proposals/[id]/_client.tsx` | ~500+ | ⚠️ Consider split |
| `events/[id]/_client.tsx` | 433 | ⚠️ Consider split |
| `time-tracking/_client.tsx` | ~400+ | ⚠️ Consider split |
| `messages/_client.tsx` | ~300+ | 🟡 Borderline |
| `globals.css` | 1339 | 🟡 Design system — acceptable |

**Impact:** Large files are harder to maintain and may cause longer hydration times. The `settings/_client.tsx` at 1900+ lines is the most critical.

### 5. Barrel File Re-Exports

| File | Exports | Risk |
|------|:-------:|:----:|
| `lib/data-hooks/index.ts` | 22+ modules via `export *` | Low (Next.js optimized) |
| `lib/supabase/index.ts` | ~40 items | Low |
| `hooks/index.ts` | 20 hooks | Low |

**Assessment:** Not a violation per se — Next.js 16 handles barrel files well. Listed for awareness.

---

## Standards Compliance Summary

| Standard | Status | Details |
|----------|:------:|---------|
| Server Components default | ✅ | All `page.tsx` are Server Components |
| `'use client'` justified | ✅ | All 210 `_client.tsx` files justified |
| No `select('*')` | ✅ | Zero instances |
| No `useEffect` data fetching | ✅ | All data via TanStack Query |
| Fonts via `next/font` | ✅ | Geist + Geist_Mono |
| TailwindCSS only | ✅ | No CSS-in-JS, no CSS modules |
| TypeScript strict mode | ✅ | `strict: true`, `noUncheckedIndexedAccess: true` |
| ESLint rules enforced | ✅ | No TODO/FIXME, no mock data imports |
| `loading.tsx` everywhere | ❌ | 180 routes missing |
| `error.tsx` everywhere | 🟡 | Group-level coverage exists |
| Explicit rendering strategy | ⚠️ | Public pages need `force-static` |
| Max 200 lines per file | ⚠️ | 5-6 files exceed limit |

---

## Remediation Plan

| Priority | Task | Files Affected |
|:--------:|------|:--------------:|
| **P0** | Add `loading.tsx` to all 180 routes missing them | 180 new files |
| **P1** | Add `dynamic = 'force-static'` to public/legal/auth pages | 6 files |
| **P2** | Split `settings/_client.tsx` into sub-components | 1 → 4+ files |
| **P3** | Split `settings/ai/_client.tsx` into sub-components | 1 → 3+ files |
| **P3** | Add per-route `error.tsx` to high-traffic pages | 20+ files |
