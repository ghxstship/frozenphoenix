# Motion Normalization & Enrichment Plan

> **SSOT companion to:** `docs/MOTION_STRATEGY.md`
> **Status:** Draft — ready for review
> **Scope:** Full codebase animation coverage audit + phased implementation roadmap

---

## 1. Current-State Audit

### 1.1 Infrastructure Inventory

| Asset                                                                                                                   | File                                          | Status                  |
| ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------- |
| CSS custom properties (durations, easings)                                                                              | `globals.css :root`                           | ✅ Complete             |
| `@keyframes` — 18 defined (entrance, exit, utility)                                                                     | `globals.css`                                 | ✅ Complete             |
| CSS animation classes (`animate-*`)                                                                                     | `globals.css`                                 | ✅ Complete             |
| Reduced-motion kill switch (CSS)                                                                                        | `globals.css @media (prefers-reduced-motion)` | ✅ Complete             |
| Reduced-motion kill switch (JS class)                                                                                   | `globals.css .reduce-motion`                  | ✅ Complete             |
| `data-animation` speed presets (off/reduced/playful)                                                                    | `globals.css`                                 | ✅ Complete             |
| View Transition API crossfade (theme toggle)                                                                            | `globals.css ::view-transition-*`             | ✅ Complete             |
| Design tokens — `TRANSITIONS`, `MOTION_SCALE`, `SPRING_PRESETS`, `STAGGER_SCALE`, `INTERACTION_TIMING`, `SCROLL_REVEAL` | `design-tokens.ts`                            | ✅ Complete             |
| `motion` library barrel export                                                                                          | `lib/motion.ts`                               | ✅ Complete (7 exports) |
| `useMotion()` hook                                                                                                      | `hooks/use-motion.ts`                         | ✅ Complete             |
| `useReducedMotion()` hook                                                                                               | `hooks/use-media-query.ts`                    | ✅ Complete             |
| Micro-transition baseline (buttons, links, inputs)                                                                      | `globals.css`                                 | ✅ Complete             |

### 1.2 Primitive Component Inventory

| Primitive                          | File                        | Consumers                                          | Gap                                                                          |
| ---------------------------------- | --------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------- |
| `PageTransition`                   | `ui/page-transition.tsx`    | 1 (`(dashboard)/layout.tsx`)                       | ✅ Wired at shell level                                                      |
| `SlidePanel`                       | `ui/slide-panel.tsx`        | 1 (`messaging-panel.tsx`)                          | ⚠️ Only 1 consumer — all other slide-outs use custom implementations or none |
| `SlidingIndicator`                 | `ui/sliding-indicator.tsx`  | 2 (`segmented-control`, `tab-bar`)                 | ✅ Good coverage                                                             |
| `StaggerContainer` / `StaggerItem` | `ui/stagger-container.tsx`  | 33 files (31 dashboard pages + 2 components)       | ⚠️ Only 31/369 dashboard pages = **8.4% coverage**                           |
| `ScrollReveal`                     | `ui/scroll-reveal.tsx`      | 1 (`(public)/page.tsx`)                            | ❌ Zero dashboard consumers                                                  |
| `SkeletonCrossfade`                | `ui/skeleton-crossfade.tsx` | 0                                                  | ❌ Built but zero consumers anywhere                                         |
| `NumberTicker`                     | `ui/number-ticker.tsx`      | 2 (`metric-card`, `stat-card`)                     | ✅ Wired where needed                                                        |
| `AnimatedCheckbox`                 | `ui/animated-checkbox.tsx`  | 0                                                  | ❌ Built but zero consumers — standard `Checkbox` used instead               |
| `TabBar` + `TabPanel`              | `ui/tab-bar.tsx`            | Uses `AnimatePresence` + `SlidingIndicator`        | ✅ Well-animated                                                             |
| `Toast` / `ToastContainer`         | `ui/toast.tsx`              | Uses `AnimatePresence` + `motion` enter/exit       | ✅ Well-animated                                                             |
| `ConfirmDialog`                    | `ui/confirm-dialog.tsx`     | Uses `AnimatePresence` + `motion` scale spring     | ✅ Well-animated                                                             |
| `CommandBar`                       | `command-bar.tsx`           | Uses `AnimatePresence` + `motion` backdrop + scale | ✅ Well-animated                                                             |
| `NetworkStatus`                    | `network-status.tsx`        | Uses `AnimatePresence` + `motion` banner slide     | ✅ Well-animated                                                             |

### 1.3 Layer-3 (`motion` Library) Usage

**7 files** import from `@/lib/motion`:

1. `command-bar.tsx` — overlay + panel enter/exit
2. `network-status.tsx` — banner slide enter/exit
3. `confirm-dialog.tsx` — overlay + dialog scale enter/exit
4. `page-transition.tsx` — route crossfade
5. `slide-panel.tsx` — panel slide + overlay fade
6. `tab-bar.tsx` — tab panel content crossfade
7. `toast.tsx` — toast stack enter/exit

**Assessment:** Layer 3 is confined to overlays and shell. Zero usage in page content, list views, detail views, data visualization, or forms.

### 1.4 Coverage Gaps

#### A. Page-Level Entrance Animations

| Metric                                               | Count   | %         |
| ---------------------------------------------------- | ------- | --------- |
| Total dashboard pages                                | 369     | —         |
| Pages with `StaggerContainer` or `animate-*` classes | 68      | 18.4%     |
| Pages with `StaggerContainer` specifically           | 31      | 8.4%      |
| Pages with zero animation                            | **301** | **81.6%** |

#### B. Exit Animations

- **CSS exit keyframes defined:** 5 (`fadeOut`, `scaleOut`, `slideOutDown`, `slideOutLeft`, `slideOutRight`)
- **CSS exit classes wired:** 0 — no `animate-fade-out` etc. utility classes exist
- **Components with exit animations:** Only Layer-3 components (overlay/dialog/toast/panel) via `AnimatePresence`
- **List item removal animation:** None
- **Route exit animation:** `PageTransition` has `exit` prop ✅, but it's the only exit surface

#### C. Layout Animations

- **FLIP technique usage:** 0
- **`LayoutGroup` consumers:** 0 (exported from `lib/motion.ts` but unused)
- **Reorder animations:** 0 (Kanban columns, table sort, drag-and-drop — all snap)
- **Sidebar collapse/expand:** CSS `transition-all duration-200` on width + `max-h` children accordion — adequate but not spring-driven

#### D. Data & Loading Animations

- **`SkeletonCrossfade` consumers:** 0 — loading states use raw conditional rendering
- **Chart line-draw animations:** CSS `chartLineDraw` keyframe exists but no consumer found
- **Progress bar animations:** CSS `progressFill` keyframe exists, `progress-bar.tsx` uses Tailwind `transition-all`
- **Empty-state transitions:** None

#### E. Scroll-Driven Animations

- **`ScrollReveal` dashboard consumers:** 0 (only public marketing page)
- **`useScroll` / `useInView` consumers:** 0 (exported from barrel but unused)
- **Parallax / scroll-linked effects:** None

#### F. Micro-Interaction Gaps

- **Button press:** `active:scale-[0.98]` ✅ on all variants
- **Hover lift on cards:** `spatial-card` class exists with `hover:translate-y` ✅
- **Toggle/switch animation:** Not audited — no custom toggle component found
- **Dropdown open/close:** No animation (Radix `dropdown-menu.tsx` — instant show/hide)
- **Accordion open/close:** CSS `accordionDown`/`accordionUp` keyframes exist ✅
- **Filter bar expand/collapse:** Not animated
- **Badge count change:** Not animated
- **Tooltip entrance:** Not animated (instant)

---

## 2. Normalization Actions (Fix Inconsistencies)

These are **defect-level** fixes — things that should already work per the existing strategy but don't.

### N-1: Wire `SkeletonCrossfade` Into Loading States

**Problem:** Built but unused. Loading states render raw `{isLoading ? <Skeleton/> : <Content/>}` with no crossfade.

**Action:** Replace conditional loading patterns in key pages:

- Dashboard page (4 data sections)
- All detail `[id]` pages (~40 pages with `isLoading` checks)
- List pages with grid/card views

**Effort:** Medium — mechanical replacement

### N-2: Wire `AnimatedCheckbox` or Remove It

**Problem:** Built but zero consumers. Standard `Checkbox` from `ui/checkbox.tsx` is used everywhere.

**Action:** Either:

- (a) Replace `Checkbox` with `AnimatedCheckbox` in high-visibility surfaces (task lists, checklists, approvals)
- (b) Delete `AnimatedCheckbox` and add checkmark draw animation to the standard `Checkbox`

**Recommendation:** Option (b) — single component, no consumer migration needed.

### N-3: Add Missing CSS Exit Animation Classes

**Problem:** Exit keyframes exist (`fadeOut`, `scaleOut`, etc.) but no corresponding utility classes.

**Action:** Add to `globals.css`:

```css
.animate-fade-out {
  animation: fadeOut var(--duration-exit-fast) var(--ease-out) forwards;
}
.animate-scale-out {
  animation: scaleOut var(--duration-exit-fast) var(--ease-out) forwards;
}
.animate-slide-out-down {
  animation: slideOutDown var(--duration-exit-normal) var(--ease-out) forwards;
}
.animate-slide-out-left {
  animation: slideOutLeft var(--duration-exit-fast) var(--ease-out) forwards;
}
.animate-slide-out-right {
  animation: slideOutRight var(--duration-exit-fast) var(--ease-out) forwards;
}
```

### N-4: Guard All `animate-*` Classes With `motion-safe:`

**Problem:** Some consumers apply `animate-fade-in` etc. directly without the `motion-safe:` prefix, bypassing the CSS reduced-motion kill switch.

**Action:** Audit all `animate-*` class usage and prefix with `motion-safe:` where missing. The `StaggerContainer` component already does this correctly — align all other consumers.

### N-5: Animate Dropdown Menus

**Problem:** `dropdown-menu.tsx` (Radix-based) shows/hides instantly.

**Action:** Add Radix animation data attributes:

```css
[data-state="open"] {
  animation: fadeIn var(--duration-fast) var(--ease-out-expo);
}
[data-state="closed"] {
  animation: fadeOut var(--duration-exit-fast) var(--ease-out);
}
```

### N-6: Animate Tooltips

**Problem:** Tooltips appear/disappear instantly.

**Action:** Add scale + fade entrance via Radix `data-state` CSS, matching the existing micro-transition timing.

---

## 3. Enrichment Actions (New Capabilities)

### E-1: `AnimatedList` Primitive — List Item Enter/Exit

**Purpose:** Animate list item additions, removals, and reorders in DataTable card views, Kanban columns, and activity feeds.

**Approach:** Wrapper component using `AnimatePresence` + `motion.div` with `layout` prop.

**File:** `src/components/ui/animated-list.tsx`

**Consumers:** DataTable card/grid views, Kanban boards, activity feeds, notification lists, search results.

### E-2: `AnimatedCounter` / Badge Pulse

**Purpose:** Animate badge count changes (nav unread counts, notification badges).

**Approach:** CSS `scale` bump + brief color flash on value change.

**File:** Enhance existing `Badge` component with optional `animate` prop.

### E-3: `LayoutTransition` Wrapper

**Purpose:** FLIP-based layout animations for filter changes, sort reorders, view mode switches (table ↔ grid ↔ kanban).

**Approach:** `LayoutGroup` from `motion` library + `layout` prop on list items.

**File:** `src/components/ui/layout-transition.tsx`

### E-4: Scroll-Driven Dashboard Sections

**Purpose:** Staggered reveal of dashboard cards/sections as user scrolls.

**Action:** Wire `ScrollReveal` into:

- Dashboard page section wrappers
- Detail page tab content
- Long-form settings pages

### E-5: Empty State Transitions

**Purpose:** Animated empty states (icon + text fade-in with slight scale) when data loads to zero results.

**Approach:** Enhance existing empty-state patterns with `animate-fade-in` + `animate-scale-in`.

### E-6: Form Field Focus Animations

**Purpose:** Subtle label float / border glow on input focus beyond the current `transition-colors`.

**Approach:** CSS-only — enhanced `focus-within` states on `FormField` wrapper.

### E-7: Kanban Column Drag Animations

**Purpose:** Smooth card movement during drag-and-drop in Pipeline and project Kanban views.

**Approach:** `@dnd-kit` already installed. Add `motion.div` wrappers with `layout` + `layoutId` to Kanban cards.

**Dependency:** `LayoutGroup` from `lib/motion.ts`.

### E-8: Chart Entrance Animations

**Purpose:** Staggered draw-in for chart elements (bars, lines, segments).

**Approach:** Wire existing `chartLineDraw` keyframe into chart components. Add `animate-progress-fill` for bar charts.

---

## 4. Phased Implementation Roadmap

### Phase 1: Foundation Normalization (Week 1–2)

| ID  | Task                                                   | Type | Effort | Files                                          |
| --- | ------------------------------------------------------ | ---- | ------ | ---------------------------------------------- |
| N-3 | Add CSS exit animation utility classes                 | Fix  | S      | `globals.css`                                  |
| N-4 | Audit & prefix all `animate-*` with `motion-safe:`     | Fix  | M      | ~40 files                                      |
| N-5 | Animate dropdown menus (Radix data-state CSS)          | Fix  | S      | `globals.css`, `dropdown-menu.tsx`             |
| N-6 | Animate tooltips (Radix data-state CSS)                | Fix  | S      | `globals.css`, `tooltip.tsx`                   |
| N-2 | Merge `AnimatedCheckbox` draw into standard `Checkbox` | Fix  | S      | `checkbox.tsx`, delete `animated-checkbox.tsx` |

**Deliverable:** All existing primitives consistent. Zero animation without reduced-motion guard. Exit classes available.

### Phase 2: Loading & Data Transitions (Week 3–4)

| ID  | Task                                                   | Type   | Effort | Files                          |
| --- | ------------------------------------------------------ | ------ | ------ | ------------------------------ |
| N-1 | Wire `SkeletonCrossfade` into dashboard + detail pages | Fix    | L      | ~50 pages                      |
| E-5 | Animated empty states                                  | Enrich | S      | Empty state components         |
| E-8 | Chart entrance animations                              | Enrich | M      | Chart components               |
| E-6 | Form field focus enhancements                          | Enrich | S      | `globals.css`, form components |

**Deliverable:** Loading → content transitions are smooth everywhere. Charts draw in. Empty states are graceful.

### Phase 3: List & Layout Animations (Week 5–6)

| ID  | Task                                          | Type   | Effort | Files                           |
| --- | --------------------------------------------- | ------ | ------ | ------------------------------- |
| E-1 | Build `AnimatedList` primitive                | Enrich | M      | New component                   |
| E-3 | Build `LayoutTransition` wrapper              | Enrich | M      | New component                   |
| E-2 | Badge count animation                         | Enrich | S      | `badge.tsx`                     |
| —   | Wire `AnimatedList` into DataTable card views | Enrich | M      | `data-table.tsx` + page configs |

**Deliverable:** List operations (add/remove/reorder) are animated. View mode switches use FLIP. Badge counts pulse.

### Phase 4: Page Coverage Expansion (Week 7–9)

| ID  | Task                                                     | Type   | Effort | Files                            |
| --- | -------------------------------------------------------- | ------ | ------ | -------------------------------- |
| —   | Add `StaggerContainer` to remaining ~300 dashboard pages | Enrich | XL     | ~300 pages                       |
| E-4 | Wire `ScrollReveal` into dashboard sections              | Enrich | M      | Dashboard + detail pages         |
| —   | Wire `SlidePanel` into all detail-page side-drawers      | Fix    | M      | Detail pages with custom drawers |

**Strategy for 300-page coverage:**

1. **Pattern A — Card/Grid pages:** Wrap card grids in `StaggerContainer`, each card as `StaggerItem`
2. **Pattern B — Table pages:** Fade-in the table container (not individual rows — performance)
3. **Pattern C — Detail pages:** Stagger the header → tabs → content sections
4. **Pattern D — Settings/Form pages:** Simple `animate-fade-in` on the form container

**Execution approach:** AST-based codemod script (extend existing `scripts/migrate-ast.ts`) to:

- Detect page components with card grids → wrap in `StaggerContainer`
- Detect table-only pages → add container `animate-fade-in`
- Add import statement for `StaggerContainer` or animation class

### Phase 5: Advanced & Polish (Week 10–12)

| ID  | Task                                         | Type   | Effort | Files                                 |
| --- | -------------------------------------------- | ------ | ------ | ------------------------------------- |
| E-7 | Kanban drag animations                       | Enrich | M      | Pipeline, Kanban components           |
| —   | Sidebar collapse spring animation upgrade    | Polish | S      | `sidebar.tsx`                         |
| —   | Topbar scroll-shrink spring upgrade          | Polish | S      | `topbar.tsx`                          |
| —   | Filter bar expand/collapse animation         | Polish | S      | `filter-bar.tsx`                      |
| —   | `ScrollReveal` on public marketing sections  | Polish | S      | `(public)/page.tsx` (already partial) |
| —   | Performance audit: ensure ≤16ms frame budget | QA     | M      | All animated surfaces                 |

---

## 5. Coverage Targets

| Metric                         | Current          | Phase 1         | Phase 2         | Phase 3  | Phase 4        | Phase 5    |
| ------------------------------ | ---------------- | --------------- | --------------- | -------- | -------------- | ---------- |
| Pages with entrance animation  | 68 (18%)         | 68 (18%)        | 68 (18%)        | 68 (18%) | **369 (100%)** | 369 (100%) |
| Primitives with exit animation | 5 (overlay-only) | 5 + CSS classes | 5 + CSS classes | **10+**  | 10+            | 10+        |
| Loading crossfade surfaces     | 0                | 0               | **~50**         | ~50      | ~50            | ~50        |
| Layout (FLIP) animations       | 0                | 0               | 0               | **3+**   | 3+             | 5+         |
| Scroll-driven animations       | 1 page           | 1 page          | 1 page          | 1 page   | **10+ pages**  | 15+        |
| `motion` library consumers     | 7                | 7               | 7               | **12+**  | 12+            | 15+        |
| Reduced-motion compliance      | ~90%             | **100%**        | 100%            | 100%     | 100%           | 100%       |

---

## 6. Quality Gate Criteria

Every PR touching animation MUST satisfy:

1. **Reduced-motion safe:** `motion-safe:` prefix on CSS classes OR `shouldAnimate` / `useReducedMotion` guard in JS
2. **Token-driven:** No hardcoded durations or easings — use `--duration-*`, `--ease-*`, `SPRING_PRESETS`, `MOTION_SCALE`
3. **Composited-only:** Animations use only `opacity`, `transform`, `filter` — never `width`, `height`, `top`, `left`, `margin`, `padding`
4. **Performance budget:** ≤600ms max duration, ≤20 simultaneous animated elements, ≤16ms frame budget
5. **No layout thrashing:** `will-change` used sparingly, removed after animation completes
6. **Accessible announcements:** State changes that animate have corresponding `aria-live` regions where content meaning changes
7. **Idempotent:** Animations work correctly on repeat triggers (re-mount, re-navigate, re-filter)

---

## 7. Anti-Patterns to Enforce

| Anti-Pattern                              | Why                                       | Alternative                                                                     |
| ----------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------- |
| `transition: all`                         | Animates layout properties, causes reflow | Explicit property list: `transition: opacity, transform`                        |
| `animate-*` without `motion-safe:`        | Ignores user preference                   | Always prefix: `motion-safe:animate-fade-in`                                    |
| `setTimeout` for animation sequencing     | Fragile, doesn't respect reduced motion   | `animationDelay` CSS or `StaggerContainer`                                      |
| Spring `bounce > 0.3`                     | Feels toy-like in enterprise context      | `SPRING_PRESETS.snappy` or `.gentle`                                            |
| Animating `height: auto`                  | Cannot composite, causes layout thrash    | `max-height` transition or `motion` `layout` prop                               |
| `useEffect` + manual DOM animation        | Bypasses React lifecycle, memory leaks    | `motion` components or CSS classes                                              |
| Decorative-only animation with no purpose | Fails the "why is this moving?" test      | Every animation must serve Orientation, Feedback, Continuity, Focus, or Delight |

---

## 8. Codemod Strategy for Phase 4

The 300-page gap is too large for manual migration. Extend `scripts/migrate-ast.ts`:

### 8.1 Detection Rules

```
Rule 1 — Card Grid Page:
  IF page has JSX containing a grid wrapper (className includes "grid")
    AND children are mapped components
  THEN wrap grid in <StaggerContainer>, wrap each child in <StaggerItem>
  AND add import { StaggerContainer, StaggerItem } from "@/components/ui/stagger-container"

Rule 2 — Table-Only Page:
  IF page renders <DataTable> or equivalent table component
    AND no StaggerContainer/animate-* class exists
  THEN wrap the page content div in className="motion-safe:animate-fade-in"

Rule 3 — Detail Page:
  IF page path matches /[id]/page.tsx
    AND no StaggerContainer exists
  THEN wrap the top-level content in <StaggerContainer> with header/tabs/content as <StaggerItem>

Rule 4 — Form/Settings Page:
  IF page is a settings or form page
  THEN add "motion-safe:animate-fade-in" to the form container
```

### 8.2 Safety

- Codemod runs in dry-run mode first, outputs diff
- Manual review of all changes before commit
- TypeScript check after application
- Visual regression test on 10 representative pages

---

## 9. Dependency Summary

| Dependency                            | Status                      | Action                                                         |
| ------------------------------------- | --------------------------- | -------------------------------------------------------------- |
| `motion` (npm)                        | ✅ Installed                | None                                                           |
| `@dnd-kit/core` + `@dnd-kit/sortable` | ✅ Installed                | Wire for E-7                                                   |
| CSS `@keyframes`                      | ✅ 18 defined               | Add exit utility classes (N-3)                                 |
| `SPRING_PRESETS`                      | ✅ In `design-tokens.ts`    | None                                                           |
| `SCROLL_REVEAL`                       | ✅ In `design-tokens.ts`    | None                                                           |
| `useMotion()`                         | ✅ In `hooks/use-motion.ts` | None                                                           |
| `lib/motion.ts` barrel                | ✅ 7 exports                | None — already exports `LayoutGroup`, `useScroll`, `useInView` |

**No new npm packages required.**

---

## 10. Risk Assessment

| Risk                                  | Likelihood | Impact | Mitigation                                                 |
| ------------------------------------- | ---------- | ------ | ---------------------------------------------------------- |
| Phase 4 codemod introduces bugs       | Medium     | Medium | Dry-run + TS check + visual regression                     |
| `motion` library bundle bloat         | Low        | Medium | Tree-shaking via barrel + bundle analysis                  |
| Animation jank on low-end devices     | Medium     | High   | Performance budget enforcement, `content-visibility: auto` |
| Reduced-motion regressions            | Low        | High   | Quality gate #1, automated CSS audit                       |
| Scope creep into decorative animation | Medium     | Low    | Anti-pattern #7 enforcement in code review                 |

---

## 11. Success Metrics

| Metric                            | Target                        | Measurement                        |
| --------------------------------- | ----------------------------- | ---------------------------------- |
| Page entrance animation coverage  | 100% of dashboard pages       | `grep -r` audit                    |
| Exit animation on overlays/modals | 100%                          | Manual audit of overlay components |
| Loading crossfade coverage        | 100% of pages with async data | `SkeletonCrossfade` consumer count |
| Reduced-motion compliance         | 100%                          | Automated CSS + hook audit         |
| Frame budget compliance           | ≤16ms on 95th percentile      | Chrome DevTools Performance panel  |
| Bundle impact                     | ≤20KB gzipped for `motion`    | `next build` + bundle analyzer     |
| User satisfaction                 | No "janky" or "slow" feedback | Qualitative testing                |
