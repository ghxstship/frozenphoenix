# UI Responsiveness Audit

**Date:** 2026-03-15
**Scope:** Exhaustive audit of all responsive design patterns across the entire FrozenPhoenix codebase
**Files examined:** ~250+ component/page files, CSS globals, design tokens, hooks, shell components

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Responsive Foundation — What Works](#2-current-responsive-foundation--what-works)
3. [Findings — Issues & Opportunities](#3-findings--issues--opportunities)
4. [Detailed Finding Catalog](#4-detailed-finding-catalog)
5. [Implementation Plan](#5-implementation-plan)
6. [File Change Map](#6-file-change-map)

---

## 1. Executive Summary

**Responsiveness Score: 6.5/10**

The platform has a **strong foundational layer** — SSOT breakpoints, density tokens, responsive shell (sidebar/topbar), mobile drawer, `useBreakpoint` hook, responsive `GRID` tokens, `ResponsiveGrid`/`ResponsiveStack`/`HideOn`/`ShowOn` primitives, safe-area insets, touch-target sizing, `overflow-x-auto` on tables, and the `FilterBar`/`PageHeader` components stack responsively.

However, these primitives are **underutilized across the 150+ dashboard pages**. The majority of pages were built desktop-first with hardcoded multi-column grids, fixed-width containers, and no tablet/mobile breakpoint adaptations. The shells (ListPageShell, DetailLayout, FormPageShell) provide a reasonable default, but the ~60 bespoke pages bypass shells entirely and have zero responsive considerations.

**Top 5 priorities:**

1. **FormPageShell grid-cols-2 collapses to nothing on mobile** (P0 — form fields overflow/stack incorrectly)
2. **~40 bespoke pages use hardcoded grid-cols-N without breakpoint stacking** (P1 — content overflows on mobile)
3. **Data-heavy components (Gantt, Heatmap, Workload, Timeline) lack mobile alternatives** (P1 — unusable below md)
4. **Detail page header actions overflow on small screens** (P1 — buttons wrap or clip)
5. **Typography scale is fixed — no responsive font sizing** (P2 — headings too large on mobile)

---

## 2. Current Responsive Foundation — What Works

### 2.1 Infrastructure (Excellent)

| Layer                     | Status        | Notes                                                                                                                   |
| ------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Breakpoints**           | ✅ SSOT       | `BREAKPOINTS` in design-tokens.ts: sm=640, md=768, lg=1024, xl=1280, 2xl=1536                                           |
| **Media hooks**           | ✅ Complete   | `useMediaQuery`, `useBreakpoint` (isMobile/isTablet/isDesktop), `useOrientation`, `useViewportSize`, `useIsTouchDevice` |
| **Density system**        | ✅ 3-tier     | compact/default/comfortable via CSS vars — spacing, padding, font-size all adapt                                        |
| **GRID tokens**           | ✅ Responsive | `GRID.columns` and `GRID.gap` include breakpoint-aware classes                                                          |
| **Responsive primitives** | ✅ Available  | `ResponsiveGrid`, `ResponsiveStack`, `HideOn`, `ShowOn`, `ResponsiveContainer`                                          |
| **Touch targets**         | ✅ CSS global | `@media (pointer: coarse)` enforces 44px min-height on all interactives                                                 |
| **Safe-area insets**      | ✅ Partial    | `.safe-bottom` utility exists; shell wrapper has `env(safe-area-inset-top)`                                             |
| **Print styles**          | ✅ Basic      | `.no-print`, color-adjust, link href display                                                                            |
| **RTL**                   | ✅ Foundation | `dir="rtl"` support, logical properties, flip utilities                                                                 |

### 2.2 Shell Components (Good)

| Component            | Responsive Behavior                                                                                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Dashboard layout** | `p-4 lg:p-6` main padding; sidebar offset via CSS var; safe-area-inset-top                                                                                                                                   |
| **Sidebar**          | Fixed desktop (260/68px) → mobile drawer (280px) with overlay, focus trap, body scroll lock, inert on main content                                                                                           |
| **Topbar**           | Breadcrumbs: `hidden sm:flex` (mobile shows only current page title). Command bar: `hidden md:flex`. Icons progressively hidden at sm/md/lg. Overflow menu for collapsed items. Scroll-driven height shrink. |
| **PageShell**        | Density-aware gap via `--density-page-gap`                                                                                                                                                                   |
| **ListPageShell**    | Stats grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`. FilterBar stacks on mobile. DataTable wraps in `overflow-x-auto`.                                                                    |
| **DetailLayout**     | Sidebar: `flex-col lg:flex-row` (stacks on mobile). Tabs: `overflow-x-auto scrollbar-hide`.                                                                                                                  |
| **PageHeader**       | `flex-col gap-1 sm:flex-row sm:items-center sm:justify-between` — stacks on mobile                                                                                                                           |
| **FilterBar**        | `flex-col gap-3 sm:flex-row sm:items-center sm:justify-between` — stacks on mobile                                                                                                                           |

### 2.3 Data Views (Adequate)

| View             | Responsive | Notes                                                                             |
| ---------------- | ---------- | --------------------------------------------------------------------------------- |
| **DataTable**    | ✅         | `overflow-x-auto` wrapper; density-aware padding                                  |
| **DataCards**    | ✅         | Breakpoint-aware grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` |
| **DataBoard**    | ⚠️ Partial | `overflow-x-auto` horizontal scroll; columns don't stack vertically on mobile     |
| **DataGallery**  | ✅         | Uses `ResponsiveGrid` pattern                                                     |
| **DataCalendar** | ⚠️ Partial | `min-w-[700px]` forces horizontal scroll on mobile — no week/day view fallback    |
| **DataTimeline** | ⚠️ Partial | `overflow-x-auto` — timeline is not usable below ~800px                           |
| **DataMap**      | ⚠️ Partial | `min-w-[400px]` — reasonable but no mobile gesture optimization                   |
| **DataWorkload** | ❌ Poor    | `overflow-x-auto` with `min-w-[800px]` — unusable on mobile                       |
| **DataChart**    | ✅         | SVG-based, inherently responsive                                                  |
| **GanttChart**   | ❌ Poor    | `overflow-x-auto` only — no mobile alternative                                    |
| **HeatmapGrid**  | ❌ Poor    | `overflow-x-auto` with `min-w-[600px]` — no responsive adaptation                 |

---

## 3. Findings — Issues & Opportunities

### Category A: Critical Layout Breakage (P0)

**A1. FormPageShell `grid-cols-2` has no mobile breakpoint**

- `SectionFieldsGrid` renders `<div className="grid grid-cols-2">` unconditionally
- On mobile (<640px), two columns are forced side-by-side — fields are ~160px wide, labels truncate, inputs overflow
- **Fix:** Change to `grid-cols-1 sm:grid-cols-2`
- **Impact:** All 5 migrated form pages + any future FormPageShell consumers

**A2. Linked records `field-display.tsx` uses static `grid-cols-N`**

- `gridCols` map has no responsive breakpoints: `{ 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" }`
- **Fix:** Map to responsive equivalents from `GRID.columns` token

### Category B: Hardcoded Multi-Column Grids Without Stacking (P1)

~40 bespoke dashboard pages use `grid-cols-2`, `grid-cols-3`, or `grid-cols-4` without responsive breakpoints. These force multi-column layouts on mobile where content overflows or compresses.

**Affected pages (exhaustive list):**

| Pattern                               | Files                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `grid-cols-2"` (no breakpoint prefix) | `dashboards/page.tsx`, `settings/ai/page.tsx` (×4), `proposals/new/page.tsx`, `roles/page.tsx`, `resource-planner/page.tsx`, `scheduling/page.tsx`, `vendor-compliance/page.tsx`, `time-tracking/compliance/page.tsx`, `time-tracking/page.tsx`, `workforce/reviews/page.tsx`, `scenarios/page.tsx`, `forecasting/page.tsx`, `reports/page.tsx`, `home/documents/page.tsx`, `live-ops/comms/page.tsx`, `live-ops/departments/page.tsx`, `live-ops/reports/page.tsx`, `client-portal/page.tsx`, `brand-kit/[id]/page.tsx`, `vendor-portal/page.tsx` |
| `grid-cols-3"` (no breakpoint prefix) | `advancing/fulfillment/page.tsx`, `advancing/queue/page.tsx`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `grid-cols-4"` (no breakpoint prefix) | `settings/ai/page.tsx`, `advancing/reports/page.tsx`, `advancing/inventory/page.tsx`                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

**Fix pattern:** Replace `grid-cols-N` with `grid-cols-1 sm:grid-cols-2 lg:grid-cols-N` (use `GRID.columns` tokens where possible).

### Category C: Data Visualization Mobile UX (P1)

**C1. DataWorkload — unusable below 800px**

- `min-w-[800px]` with `overflow-x-auto` — user must horizontally scroll a table-like view
- **Opportunity:** Collapse to stacked card view on mobile showing resource + utilization bar

**C2. GanttChart — unusable on mobile**

- No breakpoint adaptation; tiny horizontal bars become unreadable
- **Opportunity:** Switch to a vertical timeline/list view below `md`

**C3. HeatmapGrid — unusable below 600px**

- Grid cells become too small to read
- **Opportunity:** Transpose to vertical list or summary view on mobile

**C4. DataCalendar — forced horizontal scroll on mobile**

- `min-w-[700px]` — full month grid doesn't fit
- **Opportunity:** Switch to agenda/list view on mobile (show events as stacked cards)

**C5. DataTimeline — degraded below 800px**

- Gantt-style bars compress; labels overlap
- **Opportunity:** Stack items vertically as cards with date range badges on mobile

**C6. DataBoard (Kanban) — columns compress**

- Horizontal scroll works but columns are narrow on tablet
- **Opportunity:** Show one column at a time with swipe navigation on mobile

### Category D: Component-Level Responsive Gaps (P1-P2)

**D1. DetailLayout header actions overflow on small screens**

- `<div className="flex items-center gap-2 shrink-0">` — buttons sit in a row with no wrapping
- On mobile with 3+ action buttons + messaging button + overflow menu, the row exceeds viewport width
- **Fix:** Wrap actions into an overflow dropdown on mobile, or `flex-wrap` with priority ordering

**D2. Detail page `h1` title sizing**

- `text-2xl` (24px) on all viewports — takes 2+ lines on mobile for long entity names
- **Fix:** `text-xl sm:text-2xl` or truncate with expand-on-tap

**D3. StatCard layout doesn't adapt**

- Icon circle (40×40) + text sit side by side — fine on desktop, but on a 1-col mobile grid the card looks sparse
- **Opportunity:** Consider compact variant for mobile

**D4. Settings page — 2-column grids throughout**

- 11 instances of `grid-cols-2` without breakpoint — appearance swatch grids, notification toggles, session cards
- All crush on mobile
- **Fix:** `grid-cols-1 sm:grid-cols-2` for all

**D5. Messaging panel width**

- `max-w-md` (448px) — works on desktop but on iPhone SE (375px) loses edge padding
- **Fix:** `w-full sm:max-w-md` or use `min(100vw, 28rem)`

**D6. SlidePanel / QuickViewPanel — no full-screen mobile mode**

- Slide panels render at fixed width from the right — on mobile they should become full-screen sheets
- **Fix:** Add `isMobile` prop or CSS `@media` to go full-width below `sm`

**D7. Command bar search trigger hidden on mobile**

- Already handled: `md:hidden` search icon button exists in topbar
- No issue

**D8. Wizard step indicator labels hidden on mobile**

- Already handled: `hidden sm:block` on step labels — only shows step numbers on mobile
- No issue, but step names could show in a compact format

### Category E: Typography & Spacing (P2)

**E1. No responsive typography scale**

- `TYPOGRAPHY` tokens use fixed sizes (`text-4xl`, `text-3xl`, etc.) with no breakpoint variants
- `display` at `text-4xl` (36px) is oversized on mobile phones
- **Fix:** Add responsive sizes: `text-2xl sm:text-3xl lg:text-4xl` for display/h1/h2

**E2. Main content padding could be more generous on large screens**

- Currently `p-4 lg:p-6` — adequate but could benefit from `xl:p-8` for ultrawide monitors
- Low priority

**E3. Form max-width is `max-w-3xl` (48rem) — good on desktop, but no mobile padding override**

- FormPageShell content fills 100% on mobile which is correct
- No issue

### Category F: Auth & Public Pages (P2)

**F1. AuthLayout responsive behavior**

- Split-layout with branding panel — need to verify it hides on mobile
- Auth forms themselves are single-column, well-structured

**F2. Public landing page**

- `src/app/(public)/page.tsx` — needs verification of responsive hero/CTA layout
- Low priority (not a core workflow page)

### Category G: Underutilized Responsive Primitives (P2)

**G1. ResponsiveGrid/ResponsiveStack/HideOn/ShowOn exist but are rarely used**

- Grep shows 0 imports of `ResponsiveGrid` in any dashboard page
- 0 imports of `ResponsiveStack` in any dashboard page
- 0 imports of `HideOn` or `ShowOn` in any dashboard page
- These primitives exist in `src/components/ui/responsive-container.tsx` but are orphaned

**G2. `GRID.columns` tokens are defined but rarely consumed**

- Most pages hardcode Tailwind grid classes instead of using the tokenized responsive grid from design-tokens.ts
- The token system (`GRID.columns[3]` = `"grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"`) eliminates the exact bug pattern found in Category B

**G3. `useBreakpoint` hook is rarely used in pages**

- Available but most pages don't conditionally render based on breakpoint
- Data visualization components could use this to switch between desktop/mobile views

### Category H: Missing Responsive Patterns (P2-P3)

**H1. No container queries**

- All responsiveness is viewport-based; component-level responsiveness (e.g., a card that adapts when placed in a narrow sidebar vs. main content) doesn't exist
- Modern CSS container queries (`@container`) would benefit the DetailLayout sidebar, messaging panel, and dashboard widgets
- **Requires:** Tailwind v4 `@container` support verification

**H2. No responsive images**

- Most images use Next.js `<Image>` with fixed `sizes` props — adequate
- No `<picture>` / `srcset` optimization for different viewport densities beyond what Next.js provides automatically

**H3. No landscape-specific optimizations**

- `useOrientation` hook exists but is unused
- Tablet landscape mode could show 2-panel layouts where portrait stacks
- Low priority

**H4. No bottom navigation for mobile**

- Mobile users must open the sidebar drawer for all navigation
- Opportunity: Fixed bottom tab bar on mobile with 4-5 key sections (Home, Projects, Messages, Search, More)
- Significant UX improvement but high implementation effort

---

## 4. Detailed Finding Catalog

### Summary Matrix

| ID  | Severity | Category   | Description                                  | Files Affected           | Effort |
| --- | -------- | ---------- | -------------------------------------------- | ------------------------ | ------ |
| A1  | P0       | Layout     | FormPageShell grid-cols-2 no mobile stacking | 1 component, 5+ pages    | S      |
| A2  | P0       | Layout     | field-display.tsx static grid-cols-N         | 1 component              | S      |
| B1  | P1       | Layout     | ~40 pages with hardcoded grid-cols-N         | ~40 pages                | M      |
| C1  | P1       | Data Viz   | DataWorkload unusable on mobile              | 1 component              | L      |
| C2  | P1       | Data Viz   | GanttChart no mobile alternative             | 1 component              | L      |
| C3  | P1       | Data Viz   | HeatmapGrid no mobile adaptation             | 1 component              | M      |
| C4  | P1       | Data Viz   | DataCalendar forced horizontal scroll        | 1 component              | M      |
| C5  | P1       | Data Viz   | DataTimeline degraded on mobile              | 1 component              | M      |
| C6  | P2       | Data Viz   | DataBoard columns compress on tablet         | 1 component              | M      |
| D1  | P1       | Component  | DetailLayout header actions overflow         | 1 component              | S      |
| D2  | P2       | Component  | Detail page title sizing fixed               | 1 component              | S      |
| D3  | P2       | Component  | StatCard no compact mobile variant           | 1 component              | S      |
| D4  | P1       | Component  | Settings page 11× grid-cols-2                | 1 page                   | S      |
| D5  | P2       | Component  | Messaging panel width on small phones        | 1 component              | S      |
| D6  | P2       | Component  | SlidePanel no full-screen mobile             | 1 component              | M      |
| E1  | P2       | Typography | No responsive font scale                     | 1 token file, 1 CSS file | S      |
| G1  | P2       | Patterns   | Responsive primitives unused                 | ~40 pages                | M      |
| G2  | P2       | Patterns   | GRID tokens not consumed by pages            | ~40 pages                | M      |
| G3  | P2       | Patterns   | useBreakpoint unused in data views           | ~6 components            | M      |
| H1  | P3       | Advanced   | No container queries                         | Architecture             | L      |
| H4  | P3       | Advanced   | No mobile bottom navigation                  | New component + layout   | XL     |

---

## 5. Implementation Plan

### Phase 1: Critical Fixes (Week 1) — P0 items

**Goal:** Fix all layout breakage on mobile

| Step | Task                                                           | Files                                             | Effort   |
| ---- | -------------------------------------------------------------- | ------------------------------------------------- | -------- |
| 1.1  | Fix FormPageShell `grid-cols-2` → `grid-cols-1 sm:grid-cols-2` | `src/components/shells/form-page-shell.tsx`       | 1 line   |
| 1.2  | Fix field-display.tsx grid → use `GRID.columns` tokens         | `src/components/linked-records/field-display.tsx` | 5 lines  |
| 1.3  | Fix Settings page 11× `grid-cols-2` → responsive variants      | `src/app/(dashboard)/settings/page.tsx`           | 11 lines |

**Verification:** Resize browser to 375px; all forms and settings grids must single-column stack.

### Phase 2: Grid Normalization (Week 1-2) — P1 Category B

**Goal:** Make all ~40 bespoke pages responsive

| Step | Task                                                                                     | Files                        | Effort        |
| ---- | ---------------------------------------------------------------------------------------- | ---------------------------- | ------------- |
| 2.1  | Create ESLint rule or grep script to detect `grid-cols-[2-6]"` without breakpoint prefix | `scripts/`                   | New script    |
| 2.2  | Batch fix ~20 pages using `grid-cols-2"` → `grid-cols-1 sm:grid-cols-2`                  | 20 page files                | Mechanical    |
| 2.3  | Batch fix ~5 pages using `grid-cols-3"` → `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`    | 5 page files                 | Mechanical    |
| 2.4  | Batch fix ~5 pages using `grid-cols-4"` → `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`    | 5 page files                 | Mechanical    |
| 2.5  | Migrate pages to use `GRID.columns` tokens where appropriate                             | Pages touching `grid-cols-*` | Opportunistic |

**Verification:** All dashboard pages visually audit at 375px, 768px, 1024px, 1440px.

### Phase 3: Component Responsive Fixes (Week 2) — P1 Category D

**Goal:** Fix component-level responsive issues

| Step | Task                                                                                                    | Files                                     | Effort |
| ---- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------ |
| 3.1  | DetailLayout header — wrap actions on mobile: `flex-wrap` + hide lower-priority buttons behind overflow | `detail-layout.tsx`                       | M      |
| 3.2  | Detail title responsive sizing: `text-xl sm:text-2xl`                                                   | `detail-layout.tsx`                       | S      |
| 3.3  | Messaging panel responsive width: `w-full sm:max-w-md`                                                  | `messaging-panel.tsx`, `slide-panel.tsx`  | S      |
| 3.4  | SlidePanel full-screen on mobile: `@media(max-width:640px) { width:100vw !important }` or via prop      | `slide-panel.tsx`, `quick-view-panel.tsx` | M      |

### Phase 4: Responsive Typography (Week 2) — P2 Category E

**Goal:** Fluid typography that adapts to viewport

| Step | Task                                                                                                                                       | Files              | Effort |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ | ------ |
| 4.1  | Add responsive variants to `TYPOGRAPHY` tokens: display → `text-2xl sm:text-3xl lg:text-4xl`, h1 → `text-xl sm:text-2xl lg:text-3xl`, etc. | `design-tokens.ts` | S      |
| 4.2  | Apply responsive heading classes in `PageHeader`, `DetailLayout`, `FormPageShell` title elements                                           | 3 files            | S      |
| 4.3  | Add responsive container padding: `xl:p-8` to dashboard layout main                                                                        | `layout.tsx`       | 1 line |

### Phase 5: Data Visualization Mobile Modes (Week 3-4) — P1 Category C

**Goal:** Make data-heavy views usable on mobile

| Step | Task                            | Component           | Approach                                                                             | Effort |
| ---- | ------------------------------- | ------------------- | ------------------------------------------------------------------------------------ | ------ |
| 5.1  | DataCalendar mobile agenda view | `data-calendar.tsx` | Below md: render as sorted list of event cards grouped by date instead of month grid | M      |
| 5.2  | DataWorkload mobile card view   | `data-workload.tsx` | Below md: render as vertical list of resource cards with utilization bars            | M      |
| 5.3  | DataTimeline mobile list view   | `data-timeline.tsx` | Below md: render as vertical card list with date range badges                        | M      |
| 5.4  | HeatmapGrid mobile summary      | `heatmap-grid.tsx`  | Below md: transpose to vertical bars or summary cards                                | M      |
| 5.5  | GanttChart mobile list fallback | `gantt-chart.tsx`   | Below md: render as sorted task list with progress bars                              | L      |
| 5.6  | DataBoard mobile single-column  | `data-board.tsx`    | Below sm: render one column at a time with tab/swipe navigation                      | L      |

**Pattern:** Each component uses `useBreakpoint().isMobile` to conditionally render a mobile-optimized variant. Mobile variants are separate sub-components for clean separation.

### Phase 6: Advanced (Week 5+) — P2-P3

| Step | Task                                                                                        | Effort |
| ---- | ------------------------------------------------------------------------------------------- | ------ |
| 6.1  | Promote `ResponsiveGrid` / `ResponsiveStack` usage — add ESLint prefer-responsive-grid rule | M      |
| 6.2  | Container queries for DetailLayout sidebar widgets                                          | L      |
| 6.3  | Mobile bottom navigation bar                                                                | XL     |
| 6.4  | Landscape tablet 2-panel layouts                                                            | L      |

---

## 6. File Change Map

### Phase 1 (3 files)

- `src/components/shells/form-page-shell.tsx`
- `src/components/linked-records/field-display.tsx`
- `src/app/(dashboard)/settings/page.tsx`

### Phase 2 (~40 files)

All pages listed in Category B above, plus:

- `src/app/(dashboard)/proposals/[id]/page.tsx`
- `src/app/(dashboard)/locations/[id]/page.tsx`
- `src/app/(dashboard)/campaigns/[id]/page.tsx`
- `src/app/(dashboard)/deals/[id]/page.tsx`
- `src/app/(dashboard)/projects/[id]/page.tsx`
- `src/app/(dashboard)/shipments/[id]/page.tsx`
- `src/app/(dashboard)/brand-kit/page.tsx`
- `src/app/(dashboard)/live-ops/environment/page.tsx`
- `src/app/(dashboard)/live-ops/financials/page.tsx`
- `src/app/(dashboard)/live-ops/foh/page.tsx`
- `src/app/(dashboard)/projects/templates/page.tsx`
- `src/app/(dashboard)/finance/revenue-recognition/page.tsx`
- `src/app/(dashboard)/service-requests/sla/page.tsx`
- `src/app/(dashboard)/system-health/page.tsx`
- `src/app/(dashboard)/surveys/page.tsx`
- `src/app/(dashboard)/pipeline/new/page.tsx`
- `src/app/(dashboard)/invoices/new/page.tsx`
- `src/app/(dashboard)/contracts/new/page.tsx`
- `src/app/(dashboard)/knowledge-base/collaborative/page.tsx`
- `src/app/(dashboard)/live-ops/credentials/page.tsx`

### Phase 3 (4 files)

- `src/components/layouts/detail-layout.tsx`
- `src/components/messaging/messaging-panel.tsx`
- `src/components/ui/slide-panel.tsx`
- `src/components/shells/quick-view-panel.tsx`

### Phase 4 (4 files)

- `src/config/design-tokens.ts`
- `src/components/ui/page-header.tsx`
- `src/components/layouts/detail-layout.tsx`
- `src/app/(dashboard)/layout.tsx`

### Phase 5 (6 files)

- `src/components/data-view/data-calendar.tsx`
- `src/components/data-view/data-workload.tsx`
- `src/components/data-view/data-timeline.tsx`
- `src/components/ui/heatmap-grid.tsx`
- `src/components/ui/gantt-chart.tsx`
- `src/components/data-view/data-board.tsx`

### Phase 6 (3+ files)

- `src/components/layouts/detail-layout.tsx`
- `src/app/(dashboard)/layout.tsx` (bottom nav)
- New: `src/components/layouts/mobile-nav.tsx`

---

## Appendix A: Responsive Testing Matrix

Test every fix at these viewport widths:

| Device    | Width  | Key Concerns                                                        |
| --------- | ------ | ------------------------------------------------------------------- |
| iPhone SE | 375px  | Minimum viable mobile — grid stacking, action overflow, form fields |
| iPhone 14 | 390px  | Most common mobile — panel widths, safe-area insets                 |
| iPad Mini | 768px  | md breakpoint boundary — sidebar transition, 2-col grids            |
| iPad Pro  | 1024px | lg breakpoint boundary — sidebar collapses, 3-col grids activate    |
| Desktop   | 1280px | xl breakpoint — full desktop experience                             |
| Ultrawide | 1920px | Max content width constraint, generous padding                      |

## Appendix B: Responsive QA Checklist

For each page/component fix, verify:

- [ ] Content is readable without horizontal scroll at 375px
- [ ] No text truncation hides critical information
- [ ] Touch targets are ≥44px on touch devices
- [ ] Action buttons don't overflow viewport
- [ ] Grids collapse to single column at appropriate breakpoint
- [ ] Data views have usable mobile alternative
- [ ] Dialogs/panels don't extend beyond viewport
- [ ] Typography is proportional to viewport width
- [ ] Density settings work correctly at all breakpoints
- [ ] Safe-area insets respected on notched devices

## Appendix C: Automation Opportunities

1. **ESLint rule:** Warn on `grid-cols-[2-6]` without a preceding `sm:|md:|lg:|xl:` breakpoint prefix
2. **Grep CI check:** `grep -rn 'grid-cols-[2-6]"' src/app/ --include="*.tsx"` — flag non-responsive grids
3. **Playwright visual regression:** Screenshot at 375px + 1280px; diff on PR
4. **Storybook viewport addon:** Test all shared components at mobile/tablet/desktop

---

**Estimated total effort:** ~8 person-days across 6 phases
**Priority path (Phases 1-3):** ~3 person-days for P0+P1 fixes covering ~50 files
