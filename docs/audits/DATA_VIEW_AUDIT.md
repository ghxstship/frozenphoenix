# Data View Types — Audit & Competitive Gap Analysis

> Generated: 2026-03-14 | Scope: Exhaustive audit of all data view primitives, page-level usage, and competitive comparison against 8 SaaS PM platforms

---

## §1 — Implemented Data View Types

### 1.1 Core Data View Primitives (`src/components/data-view/`)

| #   | Component     | File                         | Description                                | Features                                                                                                                                                                                                                        |
| --- | ------------- | ---------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **DataTable** | `data-table.tsx` (560 lines) | Sortable, filterable table with pagination | Column sorting (asc/desc/none), global search, pagination with page-size selector, row selection (checkbox), row actions, sticky header, density-aware via CSS vars, ARIA table roles, field-type rendering via `FieldRenderer` |
| 2   | **DataCards** | `data-cards.tsx` (240 lines) | Responsive card grid                       | 1–4 column responsive grid, image header, badge, progress bar, field grid per card, density-aware gap, ARIA listitem roles                                                                                                      |
| 3   | **DataBoard** | `data-board.tsx` (273 lines) | Kanban board view                          | Column-based grouping with filter functions, badge-colored column headers, card fields with header/body/footer positions, snap-scroll horizontal, `onDragEnd` prop (interface only — no DnD wiring)                             |

### 1.2 Specialized Visualization Components (`src/components/ui/`)

| #   | Component        | File                           | Description                                    | Used On                                               |
| --- | ---------------- | ------------------------------ | ---------------------------------------------- | ----------------------------------------------------- |
| 4   | **GanttChart**   | `gantt-chart.tsx` (216 lines)  | Time-based task bars with progress             | `/scheduling` (gantt view)                            |
| 5   | **HeatmapGrid**  | `heatmap-grid.tsx` (186 lines) | Resource utilization heatmap                   | `/scheduling` (utilization view), `/resource-planner` |
| 6   | **BurnChart**    | `burn-chart.tsx` (195 lines)   | SVG line chart — planned vs actual vs forecast | `/budgets/[id]`, `/finance`                           |
| 7   | **MetricCard**   | `metric-card.tsx` (170 lines)  | KPI card with sparkline, trend, thresholds     | Dashboard, detail pages                               |
| 8   | **StatCard**     | `stat-card.tsx` (66 lines)     | Simple stat with trend indicator               | 30+ list pages via ListPageShell                      |
| 9   | **ProgressBar**  | `progress-bar.tsx`             | Horizontal progress bar                        | Multiple detail/list pages                            |
| 10  | **ApprovalFlow** | `approval-flow.tsx`            | Step-based approval pipeline visualization     | `/approvals`                                          |
| 11  | **NumberTicker** | `number-ticker.tsx`            | Animated number counter                        | MetricCard, StatCard                                  |

### 1.3 Specialized Page-Level Views (not reusable primitives)

| #   | View Type                       | Page                          | Implementation                                                                                                    |
| --- | ------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 12  | **Calendar (Month/Week)**       | `/calendar`                   | Custom grid rendering with day cells, week rows, event dots, navigation. Built inline — not a reusable component. |
| 13  | **Org Chart (Tree)**            | `/org-chart`                  | Drag-and-drop hierarchy tree using `@dnd-kit`. `TreeNode` recursive rendering with connectors. Built inline.      |
| 14  | **Resource Planner (Swimlane)** | `/resource-planner`           | Weekly swimlane grid — crew members as rows, days as columns, booking blocks color-coded by type. Built inline.   |
| 15  | **Scheduling Grid**             | `/scheduling` (schedule view) | Crew × day grid with shift chips. Built inline.                                                                   |

### 1.4 Field Renderers (`field-renderers.tsx`, 653 lines)

20 field types supported: `text`, `number`, `currency`, `percentage`, `date`, `datetime`, `relative_time`, `status`, `priority`, `progress`, `user`, `users`, `boolean`, `rating`, `tags`, `email`, `phone`, `url`, `location`, `file`, `custom`.

---

## §2 — View Mode Toggle Coverage

Pages that offer **switchable view modes** via `SegmentedControl` + `useQueryTabState`:

| Page                 | View Modes                     | Components Used                        |
| -------------------- | ------------------------------ | -------------------------------------- |
| `/projects`          | Cards · Table · Board          | DataCards, DataTable, DataBoard        |
| `/tasks`             | List · Table · Board           | DataTable (both list/table), DataBoard |
| `/crew`              | Cards · Table · Board          | DataCards, DataTable, DataBoard        |
| `/assets`            | Table · Cards                  | DataTable, DataCards                   |
| `/vendors`           | Cards · Table                  | DataCards, DataTable                   |
| `/companies`         | Table · Cards                  | DataTable, DataCards                   |
| `/campaigns`         | Cards · Kanban                 | DataCards, DataBoard                   |
| `/approvals`         | List · Table                   | DataTable (list variant), DataTable    |
| `/scheduling`        | Schedule · Utilization · Gantt | Custom grid, HeatmapGrid, GanttChart   |
| `/calendar`          | Month · Week                   | Custom calendar (inline)               |
| `/decks`             | Grid · List                    | Custom card grid, custom list          |
| `/advancing/catalog` | Grid · List                    | Custom card grid, custom list          |

**Pages with NO view toggle** (table-only via ListPageShell): ~238 pages. These all use `ListPageShell` which renders `DataTable` only.

---

## §3 — Competitive Comparison

### Competitor View Type Matrix

| View Type             | Monday | ClickUp | Asana         | Notion | Linear      | Productive.io | Smartsheet | Airtable | **FrozenPhoenix** |
| --------------------- | ------ | ------- | ------------- | ------ | ----------- | ------------- | ---------- | -------- | ----------------- |
| **Table**             | ✅     | ✅      | ✅            | ✅     | ✅          | ✅            | ✅         | ✅       | ✅                |
| **Cards/Grid**        | ✅     | ✅      | ✅            | ✅     | —           | ✅            | —          | ✅       | ✅                |
| **Kanban Board**      | ✅     | ✅      | ✅            | ✅     | ✅          | ✅            | ✅         | ✅       | ✅                |
| **Calendar**          | ✅     | ✅      | ✅            | ✅     | —           | ✅            | ✅         | ✅       | ⚠️ Partial        |
| **Gantt / Timeline**  | ✅     | ✅      | ✅ (Timeline) | —      | ✅ (Cycles) | ✅            | ✅         | ✅       | ⚠️ Partial        |
| **Map / Geo**         | —      | ✅      | —             | —      | —           | —             | —          | ✅       | ❌                |
| **Form View**         | ✅     | ✅      | ✅            | —      | —           | —             | ✅         | ✅       | ❌                |
| **Gallery**           | —      | —       | —             | ✅     | —           | —             | —          | ✅       | ❌                |
| **Chart / Dashboard** | ✅     | ✅      | ✅            | —      | —           | ✅            | ✅         | ✅       | ⚠️ Partial        |
| **Pivot / Grouping**  | ✅     | ✅      | —             | ✅     | —           | ✅            | ✅         | ✅       | ❌                |
| **Spreadsheet**       | ✅     | ✅      | —             | ✅     | —           | —             | ✅         | ✅       | ❌                |
| **Activity / Feed**   | ✅     | ✅      | ✅            | ✅     | ✅          | ✅            | ✅         | ✅       | ⚠️ Partial        |
| **Workload**          | ✅     | ✅      | ✅            | —      | —           | ✅            | ✅         | —        | ⚠️ Partial        |
| **Whiteboard**        | ✅     | ✅      | —             | —      | —           | —             | —          | —        | ❌                |
| **Mind Map**          | —      | ✅      | —             | —      | —           | —             | —          | —        | ❌                |
| **Embed / Iframe**    | ✅     | ✅      | —             | ✅     | —           | —             | —          | —        | ❌                |
| **Saved Views**       | ✅     | ✅      | ✅            | ✅     | ✅          | ✅            | ✅         | ✅       | ⚠️ UI exists      |

**Legend:** ✅ = Full implementation · ⚠️ = Partial/limited · ❌ = Missing

---

## §4 — Gap Analysis: What FrozenPhoenix Is Missing

### 4.1 Critical Gaps (Table Stakes — 6+ competitors have them)

#### G1: **Timeline View** (distinct from Gantt)

- **What it is:** Horizontal time-axis bar chart for any entity with start/end dates. Lighter than Gantt — no dependencies, no progress bars. Just visual date-range bars grouped by assignee/project/status.
- **Who has it:** Monday (Timeline), Asana (Timeline), ClickUp (Timeline), Airtable (Timeline), Smartsheet (Timeline)
- **Current state:** `GanttChart` exists but is only used on `/scheduling`. No generic timeline view available as a data view primitive that any entity list page can toggle to.
- **Impact:** High. Users expect to see when things overlap, especially for projects, events, activations, shipments, contracts.
- **Recommendation:** Create a reusable `DataTimeline` component in `data-view/`. Wire as view toggle option on projects, events, activations, contracts, shipments, campaigns.

#### G2: **Chart / Dashboard Builder View**

- **What it is:** Inline chart visualization of list data — bar, line, pie, donut, stacked. Users pick a field to chart by without leaving the list.
- **Who has it:** Monday (Chart View), ClickUp (Dashboard), Asana (Dashboard), Airtable (Chart), Smartsheet (Chart), Productive.io (Insights)
- **Current state:** `BurnChart` is a single specialized SVG chart. `MetricCard` has a tiny sparkline. No general-purpose charting. No chart library installed (no Recharts, no Chart.js, no Visx).
- **Impact:** Critical. Financial and utilization data cries for visual representation. `/dashboards`, `/reports`, `/finance` all render numbers in tables when they should be charts.
- **Recommendation:** Install a lightweight chart library (Recharts recommended — ~45KB gzipped, React-native). Create `DataChart` component supporting bar, line, pie, area, stacked. Wire into dashboards, reports, and as a view option on financial entities.

#### G3: **Grouped / Pivot Table View**

- **What it is:** Group rows by any column value (e.g., group tasks by assignee, group invoices by status). Collapsible sections with subtotals.
- **Who has it:** Monday (Group By), ClickUp (Group By), Notion (Group), Airtable (Group By + Pivot), Smartsheet (Group), Productive.io (Group By)
- **Current state:** `DataTable` has zero grouping capability. No `groupBy` prop, no collapsible sections, no subtotals.
- **Impact:** Critical for power users. Grouping is the #1 most-used table feature after sorting in every PM tool.
- **Recommendation:** Add `groupBy` prop to `DataTable` — renders grouped sections with collapsible headers + subtotal row. Also create standalone `DataGroupedTable` if the feature set diverges significantly.

#### G4: **Form View (Shareable)**

- **What it is:** A view that turns a list's create-entity form into a shareable link — external users can submit records without authentication. Used for intake, requests, surveys.
- **Who has it:** Monday (WorkForms), ClickUp (Form View), Asana (Forms), Airtable (Form View), Smartsheet (Forms)
- **Current state:** `FormPageShell` exists for authenticated internal create flows. Zero public/shareable form capability.
- **Impact:** High for client intake, vendor onboarding, event registration, incident reporting, feedback collection.
- **Recommendation:** Create a `PublicFormView` that generates a shareable link for any entity config. Renders `FormPageShell` fields in a public layout with CAPTCHA + rate limiting. Submissions go through existing CRUD API routes with a special `form_submission` auth mode.

#### G5: **Saved Views (Functional)**

- **What it is:** Users save a combination of: view type + sort + filter + grouping + column visibility + column order as a named view. Views are personal or shared.
- **Who has it:** All 8 competitors. This is table-stakes.
- **Current state:** `/saved-views` page exists but is a simple CRUD list of `saved_view` records. Views are NOT actually applied — the saved-views page doesn't restore view state to any data page. No "Save current view" button exists on any list page.
- **Impact:** Critical. Without functional saved views, users rebuild their preferred view every session.
- **Recommendation:** Extend `ListPageShell` to accept a `viewId` query param. When present, deserialize the saved view config (columns, sort, filters, groupBy, viewType) and apply it to the data view. Add "Save View" and "Load View" buttons to the toolbar.

### 4.2 High-Value Gaps (3–5 competitors have them)

#### G6: **Map / Geo View**

- **What it is:** Plot records with location data (lat/lng or address) on an interactive map. Cluster markers, popup cards.
- **Who has it:** ClickUp (Map View), Airtable (Map), Monday (Map integration)
- **Current state:** Zero map rendering. `LocationField` renders an address string. No map library installed.
- **Impact:** High for FrozenPhoenix specifically — locations, events, activations, warehouses, shipment routes are core to experiential production. This is a vertical differentiator.
- **Recommendation:** Create `DataMap` component using Mapbox GL JS or Leaflet. Wire as view toggle on locations, events, activations, shipments, warehouses.

#### G7: **Gallery View**

- **What it is:** Image-first card grid optimized for visual assets. Larger thumbnails, lightbox preview, metadata overlay.
- **Who has it:** Notion (Gallery), Airtable (Gallery), ClickUp (Gallery-like in Docs)
- **Current state:** `DataCards` supports an `image` prop but it's a small aspect-video header. No lightbox, no masonry layout, no full-screen preview.
- **Impact:** Medium-High. Critical for creative/brand management — brand-kit, creative-assets, digital-assets, decks, case-studies all have visual content.
- **Recommendation:** Create `DataGallery` component — masonry or uniform grid, large thumbnails, lightbox on click, metadata overlay on hover. Wire on creative-assets, brand-kit, digital-assets, decks.

#### G8: **Spreadsheet / Inline-Edit Table**

- **What it is:** Click any cell to edit in-place. Tab between cells. Paste from Excel. Keyboard-first bulk editing.
- **Who has it:** Monday (core UX), ClickUp (Spreadsheet), Notion (Database), Airtable (core UX), Smartsheet (core UX)
- **Current state:** `DataTable` is read-only. Zero inline editing. All editing goes through detail pages or create dialogs.
- **Impact:** High for power users, especially for bulk data entry (time entries, budget lines, shift scheduling, inventory counts).
- **Recommendation:** Create `DataSpreadsheet` component or add `editable` mode to `DataTable`. Cell-level editing with optimistic updates via mutation hooks. Priority pages: time-tracking, budget-lines, scheduling.

#### G9: **Workload View**

- **What it is:** Per-person capacity visualization showing assigned hours vs available hours over a time range. Bar segments per person per week.
- **Who has it:** Monday (Workload), Asana (Workload), ClickUp (Workload), Productive.io (Scheduling)
- **Current state:** `HeatmapGrid` provides a utilization heatmap on `/scheduling`. `/resource-planner` has a swimlane grid. Neither is a reusable workload primitive.
- **Impact:** High. Resource planning and crew utilization are core workflows.
- **Recommendation:** Create `DataWorkload` component — horizontal stacked bars per resource per time period, capacity line, overallocation warnings. Wire on resource-planner, scheduling, and as a tab on project detail pages.

### 4.3 Nice-to-Have Gaps (1–2 competitors have them)

| #   | Gap            | Who Has It              | Notes                                                                                                                                               |
| --- | -------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| G10 | **Whiteboard** | Monday, ClickUp         | Low priority. Would require canvas rendering or third-party embed (tldraw, Excalidraw).                                                             |
| G11 | **Mind Map**   | ClickUp                 | Very low priority. Niche use case.                                                                                                                  |
| G12 | **Embed View** | Monday, ClickUp, Notion | Medium priority. Useful for embedding external dashboards (Looker, Metabase, etc.) into entity contexts. Simple `<iframe>` wrapper with URL config. |

---

## §5 — Current Component Reusability Assessment

| Component        | Reusable Primitive? | Used as View Toggle Option? | Notes                                                                                                                     |
| ---------------- | ------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `DataTable`      | ✅ Yes              | ✅ ~250 pages               | Mature. Missing: grouping, inline editing, column reorder, column resize, column hide/show.                               |
| `DataCards`      | ✅ Yes              | ✅ ~8 pages                 | Solid. Missing: masonry layout option, infinite scroll.                                                                   |
| `DataBoard`      | ✅ Yes              | ✅ ~6 pages                 | Functional. Missing: actual drag-and-drop (has `onDragEnd` prop but no DnD library wiring). Needs `@dnd-kit` integration. |
| `GanttChart`     | ✅ Yes              | ⚠️ 1 page                   | Decent. Missing: dependency arrows, drag-to-resize bars, zoom levels. Only used on `/scheduling`.                         |
| `HeatmapGrid`    | ✅ Yes              | ⚠️ 1 page                   | Good. Only used on `/scheduling` utilization view.                                                                        |
| `BurnChart`      | ✅ Yes              | ⚠️ 2 pages                  | SVG-only. No interactivity (no hover tooltips on data points, no zoom).                                                   |
| Calendar         | ❌ Inline           | ⚠️ 1 page                   | Built inline in `/calendar/page.tsx`. Not reusable. Should be extracted to `DataCalendar`.                                |
| Resource Planner | ❌ Inline           | ⚠️ 1 page                   | Built inline. Swimlane pattern should be extracted.                                                                       |
| Org Chart        | ❌ Inline           | ⚠️ 1 page                   | Built inline. Tree pattern could be generalized but very specialized use case.                                            |

---

## §6 — Prioritized Implementation Roadmap

### Phase 1 — Table Stakes (Weeks 1–3)

| Priority | Gap | Component                       | Effort | Impact                                              |
| -------- | --- | ------------------------------- | ------ | --------------------------------------------------- |
| P0       | G3  | `DataTable` groupBy enhancement | M      | Unlocks power-user workflows on all 250 table pages |
| P0       | G5  | Functional Saved Views          | L      | Saves user state across sessions, table-stakes UX   |
| P0       | G2  | `DataChart` + Recharts install  | L      | Charts for dashboards, reports, finance pages       |

### Phase 2 — Competitive Parity (Weeks 4–6)

| Priority | Gap | Component                  | Effort | Impact                                              |
| -------- | --- | -------------------------- | ------ | --------------------------------------------------- |
| P1       | G1  | `DataTimeline`             | M      | Visual date-range view for 8+ entity types          |
| P1       | G4  | `PublicFormView`           | L      | External intake, vendor onboarding, feedback        |
| P1       | G6  | `DataMap`                  | M      | Vertical differentiator for experiential production |
| P1       | G8  | `DataTable` inline editing | XL     | Power-user bulk editing on time, budget, scheduling |

### Phase 3 — Differentiation (Weeks 7–9)

| Priority | Gap | Component                          | Effort | Impact                                               |
| -------- | --- | ---------------------------------- | ------ | ---------------------------------------------------- |
| P2       | G7  | `DataGallery`                      | S      | Visual asset management for creative workflow        |
| P2       | G9  | `DataWorkload`                     | M      | Resource capacity planning visualization             |
| P2       | —   | Extract Calendar to `DataCalendar` | M      | Reusable calendar on events, activations, scheduling |
| P2       | —   | `DataBoard` DnD wiring             | S      | Actual drag-and-drop on kanban boards                |

### Phase 4 — Polish (Weeks 10–12)

| Priority | Gap | Component                               | Effort | Impact                         |
| -------- | --- | --------------------------------------- | ------ | ------------------------------ |
| P3       | —   | `DataTable` column resize/reorder/hide  | M      | Power-user table customization |
| P3       | —   | `GanttChart` dependencies + drag resize | M      | Project scheduling depth       |
| P3       | G12 | Embed View component                    | S      | External dashboard integration |
| P3       | —   | `DataTable` export to Excel/PDF         | S      | Reporting parity               |

**Effort key:** S = 1–2 days · M = 3–5 days · L = 5–8 days · XL = 8–15 days

---

## §7 — Proposed Data View Component Architecture

After implementation, the `data-view/` module should export:

```
src/components/data-view/
├── index.ts                   # Barrel export
├── field-renderers.tsx        # 20 field types (existing)
├── data-table.tsx             # Table + groupBy + inline edit (enhanced)
├── data-cards.tsx             # Card grid (existing)
├── data-board.tsx             # Kanban board + DnD (enhanced)
├── data-timeline.tsx          # NEW — horizontal date-range bars
├── data-chart.tsx             # NEW — bar/line/pie/area via Recharts
├── data-calendar.tsx          # NEW — extracted from /calendar page
├── data-gallery.tsx           # NEW — image-first masonry grid
├── data-map.tsx               # NEW — geo-located record map
├── data-workload.tsx          # NEW — resource capacity bars
├── data-spreadsheet.tsx       # NEW — inline-editable table
└── data-view-switcher.tsx     # NEW — universal view toggle that works with ListPageShell
```

The `data-view-switcher.tsx` component would be a universal toolbar addition to `ListPageShell` that:

1. Reads available view types from page config
2. Renders the `SegmentedControl` with appropriate icons
3. Persists the user's preference via `useQueryTabState`
4. Could tie into Saved Views for full state persistence

---

## §8 — Summary

**Current state:** 3 core data view primitives (Table, Cards, Board) + 4 specialized charts (Gantt, Heatmap, Burn, Approval Flow) + 3 inline page-level views (Calendar, Resource Planner, Org Chart). Only 12 of ~250 list pages offer a view toggle.

**Competitive gap:** Missing 9 view types that competitors consider standard. The 3 most impactful gaps are: **grouped/pivot tables** (G3), **functional saved views** (G5), and **chart views** (G2) — all are table-stakes in 6+ competitor products.

**Vertical differentiator opportunity:** **Map view** (G6) would be uniquely powerful for FrozenPhoenix given the location-centric nature of experiential production (events, activations, warehouses, shipments). No direct competitor in the experiential production space offers this.

**Estimated total effort:** ~12 weeks for full competitive parity across all gaps, with P0 table-stakes achievable in 3 weeks.
