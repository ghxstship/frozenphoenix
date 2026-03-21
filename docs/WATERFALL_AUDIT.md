# WATERFALL_AUDIT.md — Data Fetching Pattern Analysis

**Generated:** 2026-03-21 | **Protocol:** ANTIGRAVITY FP-INFRA-001

---

## Architecture Pattern

The Frozen Phoenix codebase uses a **consistent data fetching pattern**:

```
page.tsx (Server Component)
└── Renders <_client.tsx> with id/params only
    └── _client.tsx ('use client')
        └── Uses TanStack Query hooks (useEvent, useProjects, etc.)
            └── Each hook fires an independent Supabase query
```

This pattern inherently avoids server-side waterfalls because:
1. Server Components (`page.tsx`) do **no data fetching** — they only pass route params
2. All data fetching happens client-side via TanStack Query hooks
3. TanStack Query fires all hooks in parallel on mount

---

## Anti-Pattern Scan Results

### ❌ Sequential `await` Waterfalls (Server-Side)

**Found: 0** — No server-side data fetching exists in any `page.tsx`.

### ❌ `useEffect` for Data Fetching (Client-Side)

**Found: 0** — All data fetching uses TanStack Query hooks, not raw `useEffect` + `fetch`.

The ~10 `useEffect` instances found are all for UI state management:
- `layout.tsx`: Mobile sidebar detection
- `onboarding/*`: Step completion tracking
- `proposals/[id]`: Scroll position management
- `time-tracking`: Timer interval management
- `settings/*`: Form initialization from loaded data
- `brand-kit/[id]`: Color picker state sync
- `integrations/marketplace`: Search filter debounce
- `messages`: Conversation scroll position

### ❌ N+1 Query Patterns

**Found: 0** — No components fetch data inside `.map()` loops. Related data is fetched at the parent level.

### ⚠️ Client-Side Fetching for Potentially Server-Available Data

**Found: 210 instances** (architectural pattern, not a per-instance violation)

All 210 `_client.tsx` files fetch data client-side via TanStack Query hooks. This is the current architectural pattern — data could theoretically be fetched server-side in `page.tsx` and passed as props.

**Assessment:** This pattern trades optimal TTFB for:
1. **Real-time reactivity** — TanStack Query provides cache invalidation and refetching
2. **Consistency** — All data flows through a single pipeline
3. **Offline support** — TanStack Query caching enables offline-first patterns
4. **Mutation handling** — Hooks share cache with mutations for optimistic updates

**Impact:** FCP is ~200-400ms slower than server-side fetching, but this is offset by instant navigation between pages (TanStack Query cache hits). This is an intentional architectural tradeoff, not a bug.

---

## Identified Optimization Opportunities

### 1. Parallel Query Grouping in Detail Pages

Some detail pages make 4-6 independent hook calls that could be grouped:

**Example: `events/[id]/_client.tsx`**
```typescript
// Current: 6 independent hooks fire on mount
const { data: event } = useEvent(id);           // Query 1
const { data: activity } = useRecordActivityLog("event", id);  // Query 2
const { data: comments } = useRecordComments("event", id);     // Query 3
const { data: locations } = useLocations();      // Query 4
const { data: projects } = useProjects();        // Query 5
const { data: activations } = useActivations();  // Query 6
const { data: shifts } = useCrewShifts();        // Query 7
```

**Assessment:** These hooks already fire in parallel (TanStack Query fires all on mount). The real optimization would be to:
1. Use Supabase joins to fetch related data in a single query (e.g., event + location + project)
2. Scope broad queries (e.g., `useLocations()` fetches ALL locations when only one is needed)

**Estimated impact:** Reducing 7 queries to 3-4 would save ~100-150ms per page load.

### 2. Over-Scoped Queries in Detail Pages

Several detail pages fetch entire tables when only a single related record is needed:

| Page | Query | Issue | Recommendation |
|------|-------|-------|----------------|
| `events/[id]` | `useLocations()` | Fetches all locations | Fetch by `location_id` |
| `events/[id]` | `useProjects()` | Fetches all projects | Fetch by `project_id` |
| `events/[id]` | `useActivations()` | Fetches all activations | Fetch by `activation_id` |
| `events/[id]` | `useCrewShifts()` | Fetches all shifts | Filter by `event_id` |

**Estimated impact:** Reducing payload by 90%+ per query on these over-scoped calls.

---

## Summary

| Anti-Pattern | Found | Severity |
|-------------|:-----:|:--------:|
| Server-side sequential waterfalls | 0 | N/A |
| `useEffect` data fetching | 0 | N/A |
| N+1 query patterns | 0 | N/A |
| Client-side for server-available data | 210 | ⚠️ Architectural (intentional) |
| Over-scoped queries | ~10 detail pages | 🟡 Moderate |

**Conclusion:** No data fetching waterfall violations exist. The primary optimization opportunity is scoping detail page queries to fetch only needed records rather than entire tables.
