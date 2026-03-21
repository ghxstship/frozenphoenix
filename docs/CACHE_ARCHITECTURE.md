# CACHE_ARCHITECTURE.md — Multi-Layer Caching Strategy

**Generated:** 2026-03-21 | **Protocol:** ANTIGRAVITY FP-INFRA-001

---

## Current State

| Layer | Implementation | Status |
|-------|---------------|:------:|
| Browser Cache | Next.js automatic (`_next/static` immutable) | ✅ |
| Image Cache | `next/image` with 24h minimum TTL, AVIF/WebP | ✅ |
| Client Data Cache | TanStack Query (default stale times) | ✅ |
| Service Worker | Registered in root layout | ✅ |
| Route Cache | Not explicitly configured per-route | ⚠️ |
| Server Data Cache | Not using `fetch()` data cache (Supabase client SDK) | ⚠️ |
| Supabase RLS | Active on all queries | ✅ |

---

## Multi-Layer Cache Strategy

### Layer 1 — Browser Cache (Client)

| Asset Type | Cache Policy | Status |
|-----------|-------------|:------:|
| JS/CSS chunks (`_next/static/*`) | `immutable, max-age=31536000` (Next.js automatic) | ✅ |
| Images (`_next/image/*`) | `max-age=86400` (via `minimumCacheTTL`) | ✅ |
| API responses | `private, no-cache` (auth-gated data) | ✅ |
| Manifest/SW | `no-cache, must-revalidate` | ✅ |
| Font files | `immutable` (via `next/font` — inlined or cached automatically) | ✅ |

**No changes needed.** Next.js handles static asset hashing and cache headers automatically.

### Layer 2 — TanStack Query Cache (Client)

Current TanStack Query setup provides:
- **Stale time:** Default (0ms — data refetched on mount)
- **Cache time:** Default (5 minutes — data retained for 5 min after unmount)
- **Window focus refetch:** On (data refreshed when user returns to tab)
- **Deduplication:** Automatic (same key = same request)

**Recommendations:**

| Query Type | Recommended `staleTime` | Rationale |
|-----------|:-----------------------:|-----------|
| Entity lists (events, projects) | `30s` | Lists change infrequently within a session |
| Entity detail (event/[id]) | `60s` | Detail data is stable once loaded |
| User profile / org config | `5min` | Rarely changes |
| Activity log / comments | `10s` | Should feel near-real-time |
| Search results | `0s` | Must be fresh per search |

### Layer 3 — Route Cache (Server)

**Current:** No explicit rendering strategy declarations on any route.

**Recommended route-level caching:**

| Route Category | Strategy | Configuration |
|---------------|----------|---------------|
| Public landing page | SSG | `export const dynamic = 'force-static'` |
| Legal pages (privacy, terms) | SSG | `export const dynamic = 'force-static'` |
| Public profile pages | ISR | `export const revalidate = 300` (5 min) |
| Auth pages (login, signup) | SSG | `export const dynamic = 'force-static'` |
| Dashboard pages | SSR (dynamic) | Default (no explicit config needed — `cookies()` in middleware forces dynamic) |
| API routes | Dynamic | Default (all use auth) |

### Layer 4 — Supabase / Database Cache

| Strategy | Status | Notes |
|----------|:------:|-------|
| Connection pooling (client-side) | ✅ | Singleton pattern |
| Connection pooling (server-side) | ✅ | Per-request with cookie forwarding |
| RLS-aware queries | ✅ | All queries go through RLS |
| Materialized views | N/A | Not needed at current scale |

---

## Prefetching Strategy

### Link Prefetching

| Context | Recommendation | Current |
|---------|---------------|:-------:|
| Main navigation links (sidebar) | `prefetch={true}` (default) | ✅ |
| Dropdown/modal links | `prefetch={false}` | Check needed |
| Pagination links | `prefetch={false}` | Check needed |
| Entity list → detail links | `prefetch={true}` (default) | ✅ |

### Realtime Subscriptions

| Feature | Implementation | Status |
|---------|---------------|:------:|
| Messaging | Supabase Realtime channels | ✅ |
| Advancing | Realtime subscription for order updates | ✅ |
| Notifications | Realtime bell counter | ✅ |
| Cleanup on unmount | Via `useEffect` cleanup | ✅ |

---

## Cache Invalidation Protocol

### Mutations → Revalidation

| Mutation Type | Invalidation Strategy | Status |
|--------------|----------------------|:------:|
| TanStack mutations | `queryClient.invalidateQueries()` via hook factories | ✅ |
| Optimistic updates | Via `useMutation` `onMutate` callbacks | ✅ |
| Cross-tab sync | Not implemented | ⚠️ |

**Recommendation:** Add `BroadcastChannel` or Supabase Realtime for cross-tab cache invalidation if multi-tab usage is common.

---

## Recommendations Summary

| Priority | Action | Impact |
|:--------:|--------|:------:|
| P1 | Add `dynamic = 'force-static'` to public/legal/auth pages | Instant loads for static pages |
| P2 | Configure TanStack Query `staleTime` per query category | Reduced redundant requests |
| P3 | Add cross-tab cache invalidation | Data consistency |
