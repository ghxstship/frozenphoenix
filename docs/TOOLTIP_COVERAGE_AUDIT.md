# Tooltip Coverage Audit

> **Audited:** All `.tsx` files under `src/`
> **Date:** 2025-01-XX
> **Status:** Audit complete — gaps identified, no code changes made

---

## Executive Summary

The codebase has a well-designed `Tooltip` primitive (`src/components/ui/tooltip.tsx`) wrapping `@radix-ui/react-tooltip`, but it is **critically underutilized**. Only **3 files** import and use the `Tooltip` component, while **86 files** contain `aria-label` attributes on interactive elements — meaning the vast majority of icon-only buttons and compact UI elements rely solely on screen-reader-only labels with **no visual tooltip for sighted users**.

| Metric                                                  | Count |
| ------------------------------------------------------- | ----- |
| Files importing `Tooltip`                               | 3     |
| Files using `aria-label` (potential tooltip candidates) | 86    |
| Total `aria-label` instances                            | 209   |
| Files using `title=` (native browser tooltip)           | 120   |
| Files with `truncate` / `line-clamp` / `text-ellipsis`  | 82    |
| Files using `Badge` (status indicators)                 | 146   |

---

## A. Tooltip Primitive — Current State

**File:** `src/components/ui/tooltip.tsx`

- Wraps `@radix-ui/react-tooltip` with `TooltipProvider`, `TooltipRoot`, `TooltipTrigger`, `TooltipContent`
- Props: `content`, `side`, `align`, `delayDuration`, `children`, `className`
- Default delay: 400ms
- Trigger uses `asChild` — expects a single child element
- **Well-designed, production-ready.** The primitive is solid; the problem is adoption.

### Files Currently Using `Tooltip`

| File                                               | Usage                                                                    |
| -------------------------------------------------- | ------------------------------------------------------------------------ |
| `src/components/layouts/topbar.tsx`                | `TopbarIconButton` — wraps all icon buttons with keyboard shortcut hints |
| `src/components/layouts/sidebar.tsx`               | `SidebarNavItem` — shows item title when sidebar is collapsed            |
| `src/components/context-switcher/org-switcher.tsx` | Shows org name when switcher is non-interactive                          |

**These 3 files represent the gold standard pattern.** All other components fall short.

---

## B. Gap Category 1: Icon-Only Buttons (CRITICAL — ~150+ instances)

Icon-only buttons are the single largest gap. These elements show only an icon with no visible text — sighted users must guess their purpose. Most have `aria-label` for screen readers but no visual tooltip.

### B.1 Shared Components (High Impact — used across many pages)

| Component             | Element                                   | `aria-label` | `Tooltip` | Gap         |
| --------------------- | ----------------------------------------- | ------------ | --------- | ----------- |
| `data-table.tsx`      | Pagination: First page (`ChevronsLeft`)   | ✅           | ❌        | **MISSING** |
| `data-table.tsx`      | Pagination: Previous page (`ChevronLeft`) | ✅           | ❌        | **MISSING** |
| `data-table.tsx`      | Pagination: Next page (`ChevronRight`)    | ✅           | ❌        | **MISSING** |
| `data-table.tsx`      | Pagination: Last page (`ChevronsRight`)   | ✅           | ❌        | **MISSING** |
| `data-table.tsx`      | Search clear (`X`)                        | ✅           | ❌        | **MISSING** |
| `data-table.tsx`      | Sort indicators (`ArrowUp/Down/UpDown`)   | ❌           | ❌        | **MISSING** |
| `search-input.tsx`    | Clear search (`X`)                        | ✅           | ❌        | **MISSING** |
| `filter-bar.tsx`      | Clear all filters (`X`)                   | ✅           | ❌        | **MISSING** |
| `bulk-action-bar.tsx` | Clear selection (`X`)                     | ✅           | ❌        | **MISSING** |
| `slide-panel.tsx`     | Close panel (`X`)                         | ✅           | ❌        | **MISSING** |
| `view-switcher.tsx`   | Table/Board/Card toggle icons             | ✅           | ❌        | **MISSING** |

### B.2 Notification System

| Component               | Element                                    | `aria-label` | `Tooltip` | Gap                |
| ----------------------- | ------------------------------------------ | ------------ | --------- | ------------------ |
| `notification-bell.tsx` | Bell button                                | ✅           | ❌        | **MISSING**        |
| `notification-bell.tsx` | Close panel (`X`) — no `aria-label` either | ❌           | ❌        | **MISSING** (both) |
| `notification-bell.tsx` | Mark individual read (`Check`)             | ✅           | ❌        | **MISSING**        |

### B.3 Messaging System (~25 instances)

| Component               | Element                             | `aria-label` | `Tooltip` | Gap         |
| ----------------------- | ----------------------------------- | ------------ | --------- | ----------- |
| `message-composer.tsx`  | Attach file (`Paperclip`)           | ✅           | ❌        | **MISSING** |
| `message-composer.tsx`  | Mention someone (`AtSign`)          | ✅           | ❌        | **MISSING** |
| `message-composer.tsx`  | Send message (`Send`)               | ✅           | ❌        | **MISSING** |
| `message-composer.tsx`  | Cancel reply (`X`)                  | ✅           | ❌        | **MISSING** |
| `message-bubble.tsx`    | Quick reactions (emoji buttons)     | ✅           | ❌        | **MISSING** |
| `message-bubble.tsx`    | Reply in thread (`MessageSquare`)   | ✅           | ❌        | **MISSING** |
| `message-bubble.tsx`    | More actions (`MoreHorizontal`)     | ✅           | ❌        | **MISSING** |
| `chat-view.tsx`         | Back to conversations (`ArrowLeft`) | ✅           | ❌        | **MISSING** |
| `chat-view.tsx`         | View members (`Users`)              | ✅           | ❌        | **MISSING** |
| `chat-view.tsx`         | Conversation settings (`Settings`)  | ✅           | ❌        | **MISSING** |
| `conversation-list.tsx` | New conversation (`Plus`)           | ✅           | ❌        | **MISSING** |
| `thread-panel.tsx`      | Back to conversation (`ArrowLeft`)  | ✅           | ❌        | **MISSING** |
| `reaction-picker.tsx`   | Each emoji reaction button          | ✅           | ❌        | **MISSING** |

### B.4 Comments System

| Component              | Element                                 | `aria-label` | `Tooltip` | Gap         |
| ---------------------- | --------------------------------------- | ------------ | --------- | ----------- |
| `comments-section.tsx` | Comment actions menu (`MoreHorizontal`) | ✅           | ❌        | **MISSING** |

### B.5 Advancing / Cart System

| Component          | Element                     | `aria-label` | `Tooltip` | Gap         |
| ------------------ | --------------------------- | ------------ | --------- | ----------- |
| `advance-cart.tsx` | Close cart (`X`)            | ✅           | ❌        | **MISSING** |
| `advance-cart.tsx` | Remove item (`Trash2`)      | ✅           | ❌        | **MISSING** |
| `advance-cart.tsx` | Decrease quantity (`Minus`) | ✅           | ❌        | **MISSING** |
| `advance-cart.tsx` | Increase quantity (`Plus`)  | ✅           | ❌        | **MISSING** |

### B.6 Detail Layout

| Component           | Element                         | `aria-label` | `Tooltip` | Gap         |
| ------------------- | ------------------------------- | ------------ | --------- | ----------- |
| `detail-layout.tsx` | More actions (`MoreHorizontal`) | ✅           | ❌        | **MISSING** |

### B.7 Page-Level Icon Buttons (~50+ across dashboard pages)

Many individual page files contain ad-hoc icon-only buttons with `aria-label` but no `Tooltip`. High-frequency offenders include:

- `calendar/page.tsx` — navigation arrows, view toggles
- `resource-planner/page.tsx` — navigation arrows, view toggles
- `scheduling/page.tsx` — navigation arrows
- `companies/page.tsx` — icon-only action buttons
- `compliance/page.tsx` — various icon buttons
- `automations/page.tsx` — various icon buttons
- `settings/page.tsx` — section icon buttons
- `settings/org-security/page.tsx` — toggle/action buttons

---

## C. Gap Category 2: Truncated Text (HIGH — ~82 files)

Text that uses `truncate`, `line-clamp-*`, or `text-ellipsis` is clipped visually. Users cannot see the full content without a tooltip or expandable UI.

### C.1 Shared Components

| Component               | Truncated Element                                                      | Has Tooltip/Title   | Gap         |
| ----------------------- | ---------------------------------------------------------------------- | ------------------- | ----------- |
| `data-board.tsx`        | Card title (`line-clamp-2`), subtitle (`line-clamp-1`)                 | ❌                  | **MISSING** |
| `data-cards.tsx`        | Card title/subtitle (truncated)                                        | ❌                  | **MISSING** |
| `notification-bell.tsx` | Notification title (`truncate`), body (`line-clamp-2`)                 | ❌                  | **MISSING** |
| `conversation-list.tsx` | Conversation name (`truncate`), last message (`truncate`)              | ❌                  | **MISSING** |
| `chat-view.tsx`         | Display name (`truncate`), channel description (`truncate`)            | ❌                  | **MISSING** |
| `detail-layout.tsx`     | Page title (`truncate`), subtitle (`truncate`)                         | ❌                  | **MISSING** |
| `heatmap-grid.tsx`      | Row label (`truncate`), sublabel (`truncate`)                          | ❌                  | **MISSING** |
| `gantt-chart.tsx`       | Task label (`truncate`), sublabel (`truncate`), bar label (`truncate`) | ❌                  | **MISSING** |
| `advance-cart.tsx`      | Item name (`truncate`)                                                 | ❌                  | **MISSING** |
| `sidebar.tsx`           | Nav item labels (truncated in narrow widths)                           | ✅ (when collapsed) | Partial     |
| `topbar.tsx`            | Search results, labels (various truncations)                           | Partial             | Partial     |

### C.2 Page-Level Truncated Text

Virtually every list page and detail page has truncated columns, card titles, or inline text. These are rendered through:

- `DataTable` column cells — no built-in tooltip for overflow
- `DataBoard` card titles/subtitles — no tooltip
- `DataCards` card content — no tooltip
- Detail page sidebar fields — no tooltip on overflow

**Estimated scope:** 60+ pages with at least one truncated data display lacking a tooltip.

---

## D. Gap Category 3: Status Badges & Indicators (MEDIUM — ~146 files)

Status badges (via the `Badge` component) show short status labels like "active", "pending", "overdue". These are generally self-explanatory but some scenarios benefit from tooltips:

### D.1 Identified Gaps

| Pattern                                 | Example                                                         | Gap                                                           |
| --------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------- |
| Abbreviated status codes                | `Badge` showing "IP" or "DR" for "In Progress" / "Draft"        | **MISSING** — no tooltip showing full label                   |
| Color-only indicators                   | Unread dots in `notification-bell.tsx`, `conversation-list.tsx` | **MISSING** — color alone is not sufficient (WCAG)            |
| Priority badges in `message-bubble.tsx` | "urgent", "critical", "high"                                    | **MISSING** — no tooltip explaining what priority means       |
| Heatmap cells in `heatmap-grid.tsx`     | Color-coded utilization cells                                   | ✅ Has `title` attribute — **OK**                             |
| Gantt bars in `gantt-chart.tsx`         | Progress bars with color coding                                 | ✅ Has `aria-label` — but no visual tooltip for sighted users |
| `advance-status-badge.tsx`              | Advancing workflow status                                       | Needs review                                                  |

### D.2 `title` Attribute Usage (Native Browser Tooltips)

120 files use the `title=` attribute for native browser tooltips. While functional, these have UX issues:

- Inconsistent delay (browser-dependent, typically 1-2 seconds)
- No animation or styling control
- Cannot contain rich content (icons, formatted text)
- Not keyboard-accessible in all browsers

**Recommendation:** Migrate `title=` usage to the `Tooltip` component for consistency, especially on:

- `heatmap-grid.tsx` cells (line 139)
- `message-bubble.tsx` timestamp (line 89)

---

## E. Gap Category 4: Data Visualizations (MEDIUM)

### E.1 Charts & Graphs

| Component           | Interactive Elements      | Has Tooltip       | Gap                                                 |
| ------------------- | ------------------------- | ----------------- | --------------------------------------------------- |
| `burn-chart.tsx`    | SVG data points (circles) | ❌                | **MISSING** — no hover tooltip on data points       |
| `gantt-chart.tsx`   | Task bars                 | `aria-label` only | **MISSING** — no visual hover tooltip               |
| `heatmap-grid.tsx`  | Grid cells                | `title` attribute | Partial — should use `Tooltip` component            |
| `progress-bar.tsx`  | Progress fill             | `aria-label` only | **MISSING** — no visual hover tooltip showing value |
| `approval-flow.tsx` | Flow steps                | Needs review      | Likely missing                                      |
| `metric-card.tsx`   | Metric display            | Needs review      | Likely missing                                      |

### E.2 Sparklines & Inline Visualizations

The `field-renderers.tsx` renders inline progress bars and status badges in table cells — none have tooltips showing the underlying numeric value on hover.

---

## F. Gap Category 5: Form Fields (LOW-MEDIUM)

### F.1 Current State

- `FormPageShell` renders fields from declarative config — no help tooltip mechanism exists in the `FormFieldDef` type
- Auth form fields (`AuthFormField`) have proper error linking and ARIA but no help/info tooltips
- Most form pages use standard HTML labels — no info icon + tooltip pattern exists

### F.2 Recommendation

Add an optional `helpText` or `tooltip` field to `FormFieldDef` in `src/types/form-page-config.ts`, rendered as an info icon (`CircleHelp`) with a `Tooltip` next to the label. This would be a systemic fix for all `FormPageShell`-based pages.

---

## G. Gap Category 6: Navigation Elements (LOW — mostly covered)

### G.1 Current Coverage (Good)

| Element                        | Has Tooltip | Notes                                         |
| ------------------------------ | ----------- | --------------------------------------------- |
| Sidebar nav items (collapsed)  | ✅          | Shows item title via `Tooltip`                |
| Topbar icon buttons            | ✅          | Shows label + keyboard shortcut via `Tooltip` |
| Org switcher (non-interactive) | ✅          | Shows org name via `Tooltip`                  |

### G.2 Gaps

| Element                      | Has Tooltip | Gap                                              |
| ---------------------------- | ----------- | ------------------------------------------------ |
| Sidebar nav items (expanded) | ❌          | OK — text is visible, no tooltip needed          |
| Breadcrumbs                  | ❌          | Could benefit from tooltip on truncated segments |
| Command bar results          | ❌          | OK — text descriptions are shown inline          |

---

## H. Prioritized Remediation Plan

### Phase 1: Shared Primitives (HIGH — maximum coverage, minimum effort)

These changes affect every page that uses these components:

| #   | Component                                                        | Instances Fixed              | Effort |
| --- | ---------------------------------------------------------------- | ---------------------------- | ------ |
| H1  | `data-table.tsx` — Wrap pagination + clear buttons in `Tooltip`  | ~5 buttons × every list page | S      |
| H2  | `search-input.tsx` — Wrap clear button in `Tooltip`              | Every search field           | XS     |
| H3  | `filter-bar.tsx` — Wrap clear-all button in `Tooltip`            | Every filtered page          | XS     |
| H4  | `bulk-action-bar.tsx` — Wrap clear-selection button in `Tooltip` | Every selectable table       | XS     |
| H5  | `slide-panel.tsx` — Wrap close button in `Tooltip`               | Every slide panel            | XS     |
| H6  | `view-switcher.tsx` — Wrap view toggle buttons in `Tooltip`      | Every multi-view page        | XS     |
| H7  | `detail-layout.tsx` — Wrap more-actions button in `Tooltip`      | Every detail page            | XS     |
| H8  | `notification-bell.tsx` — Wrap bell, close, mark-read buttons    | Global (topbar)              | S      |

**Estimated impact:** ~60% of all gaps fixed with 8 component edits.

### Phase 2: Messaging System (HIGH — dense icon-only UI)

| #   | Component                                                         | Instances Fixed    | Effort |
| --- | ----------------------------------------------------------------- | ------------------ | ------ |
| H9  | `message-composer.tsx` — Wrap attach, mention, send, cancel-reply | Every chat view    | S      |
| H10 | `message-bubble.tsx` — Wrap reaction, reply, more-actions         | Every message      | S      |
| H11 | `chat-view.tsx` — Wrap back, members, settings buttons            | Every conversation | S      |
| H12 | `conversation-list.tsx` — Wrap compose button                     | Messaging sidebar  | XS     |
| H13 | `thread-panel.tsx` — Wrap back button                             | Thread view        | XS     |
| H14 | `reaction-picker.tsx` — Wrap each reaction button                 | Reaction popover   | XS     |

### Phase 3: Truncated Text (MEDIUM — requires conditional tooltip)

**Approach:** Create a `TruncatedText` wrapper component that measures overflow and conditionally renders a `Tooltip` only when text is actually clipped. Apply to:

| #   | Component                                     | Effort |
| --- | --------------------------------------------- | ------ |
| H15 | Create `TruncatedText` component              | M      |
| H16 | `data-board.tsx` — card titles/subtitles      | S      |
| H17 | `data-cards.tsx` — card titles/subtitles      | S      |
| H18 | `notification-bell.tsx` — notification titles | S      |
| H19 | `conversation-list.tsx` — conversation names  | S      |
| H20 | `detail-layout.tsx` — page title/subtitle     | S      |
| H21 | `heatmap-grid.tsx` — row labels               | S      |
| H22 | `gantt-chart.tsx` — task labels               | S      |

### Phase 4: Data Visualizations (MEDIUM)

| #   | Component                                                    | Effort |
| --- | ------------------------------------------------------------ | ------ |
| H23 | `burn-chart.tsx` — Add SVG-based tooltip on data point hover | M      |
| H24 | `gantt-chart.tsx` — Add `Tooltip` on bar hover               | S      |
| H25 | `heatmap-grid.tsx` — Migrate `title` → `Tooltip`             | S      |
| H26 | `progress-bar.tsx` — Add optional hover tooltip              | S      |

### Phase 5: Form Fields (LOW)

| #   | Component                                                      | Effort |
| --- | -------------------------------------------------------------- | ------ |
| H27 | Add `helpText` to `FormFieldDef` type                          | XS     |
| H28 | Render info icon + `Tooltip` in `FormPageShell` field renderer | S      |

### Phase 6: Advancing / Cart (LOW)

| #   | Component                                                 | Effort |
| --- | --------------------------------------------------------- | ------ |
| H29 | `advance-cart.tsx` — Wrap close, remove, quantity buttons | S      |
| H30 | `comments-section.tsx` — Wrap actions menu button         | XS     |

### Phase 7: Page-Level Ad-Hoc Buttons (LOW — long tail)

Sweep all ~50 page files with ad-hoc icon-only buttons and wrap in `Tooltip`. These are lower priority since they affect individual pages rather than shared components.

---

## I. Architectural Recommendations

### I.1 `Tooltip`-by-Default for `size="icon"` Buttons

Consider creating a `TooltipButton` or extending the `Button` component to accept a `tooltip` prop. When `size="icon"`, the component would automatically wrap itself in a `Tooltip` using the `aria-label` value as content. This would prevent future regressions.

```tsx
// Proposed API
<Button size="icon" tooltip="Close panel" aria-label="Close panel">
  <X className="h-4 w-4" />
</Button>
```

### I.2 Lint Rule

Add an ESLint rule (or custom lint check in the quality gate) that flags:

- `size="icon"` buttons without a `Tooltip` ancestor
- `aria-label` on `<button>` elements sized ≤ 32×32px without a `Tooltip` ancestor

### I.3 `TruncatedText` Primitive

Create a reusable `TruncatedText` component that:

1. Uses `ResizeObserver` to detect overflow
2. Conditionally wraps content in `Tooltip` only when clipped
3. Accepts the same `side`/`align`/`delayDuration` props as `Tooltip`

### I.4 Migrate `title` → `Tooltip`

Replace all native `title=` attributes with the `Tooltip` component for:

- Consistent delay and animation
- Keyboard accessibility
- Rich content support
- Design token compliance

---

## J. Summary

| Category                      | Severity     | Gaps                                            | Phase   |
| ----------------------------- | ------------ | ----------------------------------------------- | ------- |
| Icon-only buttons (shared)    | **CRITICAL** | ~11 components, ~30 buttons                     | Phase 1 |
| Icon-only buttons (messaging) | **HIGH**     | ~6 components, ~15 buttons                      | Phase 2 |
| Truncated text                | **HIGH**     | ~82 files, needs `TruncatedText` primitive      | Phase 3 |
| Data visualizations           | **MEDIUM**   | ~4 components                                   | Phase 4 |
| Form help tooltips            | **MEDIUM**   | Systemic — needs `FormFieldDef` extension       | Phase 5 |
| Advancing/comments            | **LOW**      | ~2 components                                   | Phase 6 |
| Page-level ad-hoc buttons     | **LOW**      | ~50 pages                                       | Phase 7 |
| Navigation                    | **OK**       | Mostly covered (3/3 key patterns have tooltips) | —       |

**Total estimated effort:** ~2-3 days for Phases 1-4 (covers ~90% of gaps).
Phases 5-7 are incremental and can be addressed as part of feature work.
