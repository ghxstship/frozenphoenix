# Tab System Audit v2 — Post-Migration Findings

**Date:** 2026-03-01
**Scope:** Every tab-like control, view-mode toggle, and content-section switcher across the entire dashboard.

---

## Executive Summary

The first migration pass (v1) standardized **~20 pages** onto canonical `TabBar`, `TabPanel`, `SegmentedControl`, and `useQueryTabState`. This v2 audit found **27 additional opportunities** across 5 categories:

| Category                          | Count    | Severity           |
| --------------------------------- | -------- | ------------------ |
| A. Unmigrated ad-hoc view toggles | 10 pages | P1 — Consistency   |
| B. Component-level quality gaps   | 6 issues | P0–P2 — A11y / UX  |
| C. Architectural redundancy       | 3 issues | P1 — SSOT          |
| D. IA / placement / coverage gaps | 4 issues | P2 — IA            |
| E. Route-sync & state gaps        | 4 issues | P1 — Functionality |

---

## A. Unmigrated Ad-Hoc View Toggles (10 pages)

These pages still use inline `<button>` groups with manual styling instead of `SegmentedControl`. They lack ARIA `radiogroup`/`radio` roles, keyboard navigation, and consistent styling.

| #   | Page                 | File                            | Pattern                             | View Modes                              |
| --- | -------------------- | ------------------------------- | ----------------------------------- | --------------------------------------- |
| A1  | Projects             | `projects/page.tsx`             | `<div p-0.5><button>` × 3           | cards / table / board                   |
| A2  | Pipeline             | `pipeline/page.tsx`             | `<div p-0.5><button>` × 2           | board / table                           |
| A3  | Opportunities        | `opportunities/page.tsx`        | `<Button variant>` × 2              | board / table                           |
| A4  | Tasks                | `tasks/page.tsx`                | `<div overflow-hidden><button>` × 3 | list / table / board                    |
| A5  | Campaigns            | `campaigns/page.tsx`            | `<div overflow-hidden><button>` × 2 | cards / kanban                          |
| A6  | Creative Assets      | `creative-assets/page.tsx`      | `<div overflow-hidden><button>` × 2 | board / list                            |
| A7  | Decks                | `decks/page.tsx`                | `<div overflow-hidden><button>` × 2 | grid / list                             |
| A8  | Calendar             | `calendar/page.tsx`             | `<div overflow-hidden><button>` × 2 | month / week                            |
| A9  | Workforce Onboarding | `workforce/onboarding/page.tsx` | `<div p-0.5><button>` × 2           | onboarding / offboarding                |
| A10 | Forecasting          | `forecasting/page.tsx`          | `<Button variant>` × 4              | revenue / budget / utilization / hiring |

**A9 note:** Workforce onboarding is a **content section switch** (not a view-mode toggle) — semantically closer to `TabBar`/`TabPanel` than `SegmentedControl`.

**A10 note:** Forecasting uses `<Button variant="default|ghost">` as pseudo-tabs with icons in a `border-b` container — also semantically a `TabBar`/`TabPanel` pattern.

### Fix

- A1–A8: Replace with `SegmentedControl` (view-mode toggles)
- A9: Replace with `TabBar`/`TabPanel` + `useQueryTabState` (content tabs)
- A10: Replace with `TabBar`/`TabPanel` + `useQueryTabState` (content tabs)

---

## B. Component-Level Quality Gaps (6 issues)

### B1. `DetailLayout` duplicates `TabBar` logic internally (P1 — SSOT)

`detail-layout.tsx` lines 82–227 contain a **full hand-rolled tablist** with keyboard navigation, button rendering, and ARIA attributes. This is the exact same logic `TabBar` provides. The layout should consume `TabBar` as a child rather than re-implementing it.

**Impact:** Any future TabBar enhancement (animation, overflow scroll indicators, badge improvements) must be duplicated in DetailLayout.

**Fix:** Refactor `DetailLayout` to render `<TabBar>` internally (passing its `tabs` prop through), eliminating ~80 lines of duplicate code.

### B2. `DetailLayout` tab panel wrapper lacks `tabIndex={0}` (P1 — A11y)

`TabBar`'s `TabPanel` includes `tabIndex={0}` for keyboard focus per WAI-ARIA Tabs Pattern. `DetailLayout`'s manual `<div role="tabpanel">` at lines 233–250 omits it.

**Fix:** Add `tabIndex={0}` and matching `focus-visible` ring styles to DetailLayout's tabpanel divs.

### B3. `PageShell` tab panel wrapper lacks `tabIndex={0}` (P1 — A11y)

Same issue as B2 — `page-shell.tsx` line 63 renders `<div role="tabpanel">` without `tabIndex={0}`.

**Fix:** Add `tabIndex={0}` and focus-visible ring styles.

### B4. `TabPanel` unconditional `tabIndex={0}` may trap focus (P2 — A11y)

When `TabPanel` content contains interactive elements, a `tabIndex={0}` on the wrapping div creates an extra tab stop. Per WAI-ARIA APG, `tabIndex={0}` is recommended only when the panel has no focusable descendants.

**Fix (future):** Conditionally set `tabIndex` based on whether the panel contains focusable children, or use `tabIndex={-1}` with programmatic focus on tab switch (the APG's alternative recommendation).

### B5. No animated transition between tab panels (P2 — UX)

Tab content switches instantly with no transition. A subtle cross-fade or slide would provide directional context.

**Fix:** Add a `motion-safe:animate-fade-in` class to `TabPanel` and `DetailLayout`'s panel wrapper, respecting `prefers-reduced-motion`.

### B6. Zero-count badges not hidden (P2 — UX)

`TabBar` and `DetailLayout` render `count` badges even when the value is `0`. Zero-count badges add visual noise without information value.

**Fix:** Guard badge rendering: `{item.count !== undefined && item.count > 0 && (...)}` — or render a muted "0" for contextual clarity where absence is meaningful (configurable via a `showZeroBadge` prop).

---

## C. Architectural Redundancy (3 issues)

### C1. Three tab primitives exist — `tabs.tsx`, `tab-bar.tsx`, `DetailLayout` inline (P1 — SSOT)

| Primitive                                                  | Used by                    |
| ---------------------------------------------------------- | -------------------------- |
| `tabs.tsx` (`Tabs`/`TabsList`/`TabsTrigger`/`TabsContent`) | `companies/page.tsx` only  |
| `tab-bar.tsx` (`TabBar`/`TabPanel`)                        | 6 pages + `page-shell.tsx` |
| `detail-layout.tsx` inline tabs                            | 7 detail pages             |

Three independent implementations of the same pattern violates SSOT. The `tabs.tsx` compound-component API and `tab-bar.tsx` flat-prop API are functionally identical.

**Fix:**

1. Migrate `companies/page.tsx` from `Tabs`/`TabsList`/`TabsTrigger` to `SegmentedControl` (it's a view-mode toggle, not content tabs).
2. Refactor `DetailLayout` to use `TabBar` internally (see B1).
3. Deprecate `tabs.tsx` — mark as `@deprecated` with a pointer to `TabBar`/`SegmentedControl`.

### C2. `PageShell` and `DetailLayout` both define their own `TabConfig` interfaces (P2 — SSOT)

- `page-shell.tsx` → `TabConfig { id, label, href?, count? }`
- `detail-layout.tsx` → `DetailTabConfig { id, label, count? }`
- `tab-bar.tsx` → `TabBarItem { id, label, count?, icon?, disabled? }`

Three definitions of the same concept.

**Fix:** `PageShell` and `DetailLayout` should import and use `TabBarItem` directly from `tab-bar.tsx`. Add the `href` field to `TabBarItem` if needed (or drop it — `PageShell.TabConfig.href` is declared but never consumed).

### C3. `useQueryTabState` forces `?tab=` into the URL even on default tab (P2 — UX)

The hook's `useEffect` (lines 38–47) immediately writes `?tab=overview` into the URL on mount, even if no tab param exists. This pollutes the URL bar and browser history for the default state.

**Fix:** Only write the query param when the user explicitly switches away from the default. Remove the mount-time sync effect; let the default be implicit.

---

## D. Information Architecture / Placement / Coverage Gaps (4 issues)

### D1. Approvals page uses `SegmentedControl` for content-section switching (P2 — Semantics)

The approvals page toggles between "Approvals" and "Lifecycle" sections using `SegmentedControl`. This is a **content section switch**, not a view-mode toggle — it changes _what_ is shown, not _how_. Should use `TabBar`/`TabPanel` for correct tab semantics (`role="tablist"` / `role="tabpanel"`).

The _second_ `SegmentedControl` on the same page (list/table toggle) is correctly a view-mode toggle.

**Fix:** Replace the first `SegmentedControl` with `TabBar`/`TabPanel`.

### D2. Checklists page uses `SegmentedControl` for active/templates content switch (P2 — Semantics)

Same issue as D1 — "Active" vs "Templates" is a content section toggle, not a view-mode toggle.

**Fix:** Replace with `TabBar`/`TabPanel`.

### D3. Vendor-onboarding page uses `SegmentedControl` for pipeline/list content switch (P2 — Semantics)

Same pattern — "Pipeline" vs "List" changes the content section rendered.

**Fix:** Replace with `TabBar`/`TabPanel`.

### D4. No PageShell consumers use tabs via the layout prop (P2 — Coverage)

`PageShell` supports `tabs`/`activeTab`/`onTabChange` props and internally renders `TabBar`, but **zero pages** in the codebase pass tab props to it. All PageShell-using pages handle tabs independently.

**Fix:** Either remove the unused tab props from `PageShell` to reduce API surface, or actively adopt them in pages that currently do standalone `TabBar` rendering alongside `PageHeader` (e.g., automations, procurement, audit-log).

---

## E. Route-Sync & State Gaps (4 issues)

### E1. 10 unmigrated pages lack route-synced view state (P1 — Functionality)

All pages in Section A use `useState` — view-mode is lost on refresh/share. Deep-linking a board view is impossible.

**Fix:** Replace `useState<ViewMode>` with `useQueryTabState` (using `key: "view"` to avoid collision with content-tab `key: "tab"`).

### E2. `companies/page.tsx` uses `Tabs` primitive with `useState` (P1 — Consistency)

The companies page is the only consumer of the `tabs.tsx` compound component and uses `useState` for its view toggle.

**Fix:** Migrate to `SegmentedControl` + `useQueryTabState`.

### E3. `checklists/page.tsx` and `vendor-onboarding/page.tsx` use `SegmentedControl` with `useState` (P1)

Both pages were migrated to `SegmentedControl` but still use `useState` for the toggle state — not route-synced.

**Fix:** Replace `useState` with `useQueryTabState`.

### E4. `approvals/page.tsx` `approvalView` toggle uses `useState` (P1)

The list/table view toggle is not route-synced. Only the main section tab is.

**Fix:** Replace `useState<"list" | "table">` with `useQueryTabState` using `key: "view"`.

---

## Implementation Roadmap

### Phase 1 — SSOT & Accessibility (P0–P1)

1. **B1 + C1:** Refactor `DetailLayout` to consume `TabBar` internally
2. **B2 + B3:** Add `tabIndex={0}` + focus ring to `DetailLayout` and `PageShell` tabpanel wrappers
3. **C2:** Unify tab config types → `TabBarItem`
4. **C1:** Migrate `companies/page.tsx` off `tabs.tsx` → `SegmentedControl`; deprecate `tabs.tsx`
5. **B6:** Add zero-count badge guard to `TabBar`

### Phase 2 — Migrate Remaining Ad-Hoc Toggles (P1)

6. **A1–A8:** Replace ad-hoc view toggles with `SegmentedControl` on: projects, pipeline, opportunities, tasks, campaigns, creative-assets, decks, calendar
7. **A9:** Workforce onboarding → `TabBar`/`TabPanel` + `useQueryTabState`
8. **A10:** Forecasting → `TabBar`/`TabPanel` + `useQueryTabState`

### Phase 3 — Route-Sync & Semantics (P1)

9. **E1:** Add `useQueryTabState(key: "view")` to all 10 newly-migrated pages
10. **E2:** Route-sync `companies` page
11. **E3:** Route-sync `checklists` and `vendor-onboarding`
12. **E4:** Route-sync `approvals` view toggle
13. **D1–D3:** Swap `SegmentedControl` → `TabBar`/`TabPanel` for content-section switches on approvals, checklists, vendor-onboarding

### Phase 4 — Polish (P2)

14. **C3:** Stop writing default tab value to URL on mount
15. **B5:** Add `motion-safe:animate-fade-in` to tab panel transitions
16. **B4:** Investigate conditional `tabIndex` for panels with focusable content
17. **D4:** Decide on `PageShell` tab prop — adopt or remove

---

## Metrics

| Metric                              | Before v1 | After v1 | After v2 (projected)                      |
| ----------------------------------- | --------- | -------- | ----------------------------------------- |
| Pages with canonical tab components | 0         | ~20      | ~38                                       |
| Pages with ad-hoc tab-like toggles  | ~30       | 10       | 0                                         |
| Tab primitives in codebase          | 3         | 3        | 1 (`tab-bar.tsx`) + deprecated `tabs.tsx` |
| Route-synced tab/view state         | 0         | 15       | ~30                                       |
| WCAG tablist compliance             | ~30%      | ~80%     | ~100%                                     |
