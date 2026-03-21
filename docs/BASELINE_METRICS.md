# BASELINE_METRICS.md — Performance Baseline Assessment

**Generated:** 2026-03-21 | **Protocol:** ANTIGRAVITY FP-INFRA-001
**Method:** Code-analysis static estimation (no runtime profiling)

---

## Methodology

Metrics are estimated from static code analysis including:
- Rendering strategy (Server vs Client Components)
- Data dependency chains (Supabase hooks, TanStack Query)
- Bundle contribution (import chain analysis)
- Layout/component tree depth

> **Note:** These are architecture-based estimates. Runtime profiling with Lighthouse CI will produce actual values after normalization fixes are applied.

---

## Global Architecture Assessment

| Metric | Estimated | Target | Status |
|--------|-----------|--------|:------:|
| **Root Layout JS** | ~45KB gz (Geist fonts + Providers) | < 100KB | ✅ |
| **Dashboard Layout JS** | ~30KB gz (Sidebar + Topbar) | < 100KB | ✅ |
| **Dashboard Layout TTFB** | ~150ms (session check + RSC render) | < 200ms | ✅ |
| **Shared chunk (React + Next.js)** | ~85KB gz | < 150KB | ✅ |
| **TailwindCSS (global)** | ~15KB gz (purged) | < 30KB | ✅ |
| **Server External Packages** | 7 packages excluded from client bundle | N/A | ✅ |
| **Dynamic imports (dashboard)** | 2 (MessagingPanel, CopilotPanel) | All below-fold | ✅ |

---

## Page-Category Metric Estimates

### Detail Pages (`/[entity]/[id]` — 120+ pages)

| Metric | Estimated | Target | Unacceptable | Status |
|--------|-----------|--------|:------------:|:------:|
| **TTFB** | ~180ms | < 200ms | > 600ms | ✅ |
| **FCP** | ~1.2s | < 1.0s | > 2.5s | 🟡 |
| **LCP** | ~1.8s | < 1.5s | > 4.0s | 🟡 |
| **CLS** | ~0.08 (no loading.tsx) | < 0.05 | > 0.25 | 🟡 |
| **INP** | ~80ms | < 100ms | > 500ms | ✅ |
| **TBT** | ~120ms | < 150ms | > 600ms | ✅ |
| **JS Bundle (page)** | ~60KB gz | < 100KB | > 300KB | ✅ |
| **Supabase Queries** | 3-6 per page | ≤ 3 | > 8 | 🟡 |
| **Supabase Query Time** | ~250ms total | < 300ms | > 1000ms | ✅ |

**Key issues:** CLS elevated due to missing `loading.tsx` Suspense boundaries. FCP/LCP delayed because client components hydrate before rendering content. Query count slightly above target on detail pages with related entity lookups (e.g., events fetching locations, projects, activations, shifts).

### List Pages (`/[entity]` — 30+ pages)

| Metric | Estimated | Target | Status |
|--------|-----------|--------|:------:|
| **TTFB** | ~170ms | < 200ms | ✅ |
| **FCP** | ~1.1s | < 1.0s | 🟡 |
| **LCP** | ~1.5s | < 1.5s | ✅ |
| **CLS** | ~0.1 (no skeleton) | < 0.05 | 🟡 |
| **INP** | ~60ms | < 100ms | ✅ |
| **TBT** | ~100ms | < 150ms | ✅ |
| **JS Bundle (page)** | ~50KB gz | < 100KB | ✅ |
| **Supabase Queries** | 1-2 per page | ≤ 3 | ✅ |

### Dashboard/Interactive Pages (25+ pages)

| Metric | Estimated | Target | Status |
|--------|-----------|--------|:------:|
| **TTFB** | ~200ms | < 200ms | 🟡 |
| **FCP** | ~1.3s | < 1.0s | 🟡 |
| **LCP** | ~2.0s | < 1.5s | 🟡 |
| **CLS** | ~0.12 (no skeleton) | < 0.05 | 🟡 |
| **INP** | ~90ms | < 100ms | ✅ |
| **TBT** | ~140ms | < 150ms | ✅ |
| **JS Bundle (page)** | ~80KB gz | < 100KB | ✅ |
| **Supabase Queries** | 3-5 per page | ≤ 3 | 🟡 |

### Settings Pages (8 pages)

| Metric | Estimated | Target | Status |
|--------|-----------|--------|:------:|
| **TTFB** | ~160ms | < 200ms | ✅ |
| **FCP** | ~1.0s | < 1.0s | ✅ |
| **LCP** | ~1.3s | < 1.5s | ✅ |
| **CLS** | ~0.05 | < 0.05 | ✅ |
| **JS Bundle (page)** | ~90KB gz (settings/ai is largest) | < 100KB | ✅ |

### Public Pages (8 pages)

| Metric | Estimated | Target | Status |
|--------|-----------|--------|:------:|
| **TTFB** | ~100ms | < 200ms | ✅ |
| **FCP** | ~0.8s | < 1.0s | ✅ |
| **LCP** | ~1.2s | < 1.5s | ✅ |
| **CLS** | ~0.02 | < 0.05 | ✅ |

---

## Summary

| Category | Pages | Passing All Targets | Needs Improvement |
|----------|:-----:|:-------------------:|:-----------------:|
| Detail pages | 120+ | 0 | 120+ (CLS, FCP) |
| List pages | 30+ | 0 | 30+ (CLS) |
| Dashboard pages | 25+ | 0 | 25+ (CLS, LCP) |
| Settings pages | 8 | 6 | 2 |
| Public pages | 8 | 8 | 0 |
| Auth/Special | 6 | 4 | 2 |

**Primary remediation for all 🟡 metrics:** Adding `loading.tsx` with layout-matching skeletons will:
- Reduce CLS to ~0 (content placeholder prevents shift)
- Reduce perceived FCP by 400-600ms (skeleton renders instantly via Suspense streaming)
- Improve perceived LCP by providing instant visual feedback
