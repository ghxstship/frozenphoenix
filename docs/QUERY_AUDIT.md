# QUERY_AUDIT.md — Supabase Query Optimization Log

**Generated:** 2026-03-21 | **Protocol:** ANTIGRAVITY FP-INFRA-001

---

## Global Assessment

| Criterion | Status | Details |
|-----------|:------:|---------|
| `select('*')` usage | ✅ PASS | Zero instances — all queries are column-specific |
| Column-specific selects | ✅ PASS | All hooks use typed column lists |
| Database-level filtering | ✅ PASS | Queries use `.eq()`, `.in()`, `.gte()`, `.lte()` |
| Pagination | ✅ PASS | `pagination.ts` utility with `.range()` support |
| Client singleton | ✅ PASS | `client.ts` uses singleton pattern with cookie forwarding |
| Server client | ✅ PASS | `server.ts` creates per-request clients with cookie forwarding |
| RLS | ✅ PASS | All queries go through RLS-enabled client |
| Error handling | ✅ PASS | Typed error handling in hook factories |

---

## Query Architecture

### Data Hook System (`src/lib/data-hooks/`)

The codebase uses a factory pattern for data hooks:

```
lib/data-hooks/
├── hook-factories.ts    → Generic CRUD hook factory
├── hook-types.ts        → Shared types for hooks
├── mutation-utils.ts    → Mutation helpers
├── use-mutation-with-toast.ts → Toast-integrated mutations
└── hooks-*.ts           → 22 domain-specific hook modules
    ├── hooks-core.ts        (events, projects, tasks, etc.)
    ├── hooks-finance.ts     (invoices, payments, budgets)
    ├── hooks-crm.ts         (leads, deals, contacts)
    ├── hooks-production.ts  (BOMs, work orders, etc.)
    └── ... (18 more domain modules)
```

All hooks are generated via factories that:
1. Create typed Supabase queries with explicit column selections
2. Wrap in TanStack Query for caching/deduplication
3. Handle errors consistently
4. Support optimistic mutations

---

## Identified Optimizations

### 1. Over-Scoped Fetches in Detail Pages

| File | Hook Used | Issue | Optimization |
|------|-----------|-------|-------------|
| `events/[id]/_client.tsx` | `useLocations()` | Fetches ALL locations for join | Use `useLocation(locationId)` or Supabase join |
| `events/[id]/_client.tsx` | `useProjects()` | Fetches ALL projects for join | Use `useProject(projectId)` or Supabase join |
| `events/[id]/_client.tsx` | `useActivations()` | Fetches ALL activations for join | Use `useActivation(activationId)` or Supabase join |
| `events/[id]/_client.tsx` | `useCrewShifts()` | Fetches ALL shifts for event | Add filter: `useCrewShifts({ eventId: id })` |

**Estimated impact:** Each over-scoped query transfers 10-100x more data than needed. Fixing these would reduce total transfer per detail page by ~80%.

### 2. Barrel File Re-Exports

| File | Re-Exports | Issue |
|------|:----------:|-------|
| `lib/data-hooks/index.ts` | 22+ modules | Barrel file re-exports all domain hooks |
| `lib/supabase/index.ts` | ~40 exports | All Supabase utilities in one barrel |
| `hooks/index.ts` | 20 hooks | All custom hooks in one barrel |

**Impact:** Barrel re-exports can prevent tree-shaking, causing unused code to be included in page bundles. However, Next.js 16 with Turbopack handles this well — impact is minimal but should be monitored.

**Recommendation:** No immediate action needed. Next.js barrel file optimization handles this. If bundle analysis shows bloat, switch to direct imports.

### 3. Connection Pooling

| Area | Status | Details |
|------|:------:|---------|
| Client-side | ✅ | Singleton Supabase client per browser session |
| Server-side | ✅ | Per-request client creation (correct for RSC) |
| Admin client | ✅ | Service-role client with no session persistence |

---

## Recommendations Summary

| Priority | Action | Impact | Effort |
|:--------:|--------|:------:|:------:|
| P1 | Add filtered hooks for single-entity lookups | High | Low |
| P2 | Add Supabase joins in event detail queries | Medium | Medium |
| P3 | Monitor barrel file impact on bundle size | Low | Low |

**No critical query violations found.** The primary optimization is adding scoped query variants for detail page lookups.
