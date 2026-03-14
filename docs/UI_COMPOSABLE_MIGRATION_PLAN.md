# Normalized 3-Tier Composable UI System — Migration Plan

> **Status:** Active — Breaking migration (no backward compatibility) of FrozenPhoenix's dashboard UI
> from mixed imperative pages to a normalized, declarative, composable 3-tier system.
>
> **Date:** 2026-03-13 (updated 2026-03-13)
> **Scope:** 261 list pages, 51 detail pages, ~50 UI primitives
> **Strategy:** Direct cutover — no adapter layer, no backward compatibility. Delete legacy shells.

---

## 1. Problem Statement

The current dashboard has **three divergent page authoring patterns**:

| Pattern                                                    | Count | Lines/page | Characteristics                                                                                                                                                                                      |
| ---------------------------------------------------------- | ----- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Config-driven thin shells** (`EntityPageShell`)          | 155   | 6–8        | Declarative, zero imperative code. Uses `EntityPageConfig` objects.                                                                                                                                  |
| **Hand-built list pages** (`PageShell` + bespoke JSX)      | ~106  | 100–885    | Imperative fetch, inline `<table>`, inline stats, inline search, inline DEMO\_ constants. Each page re-implements the same structural contract (header → stats → toolbar → content → create dialog). |
| **Hand-built detail pages** (`DetailLayout` + bespoke JSX) | 51    | 200–955    | Imperative fetch, inline tab rendering, inline field display, inline sidebar composition.                                                                                                            |

### Consequences

- **~35,000 lines of duplicated structural logic** across hand-built pages
- **Inconsistent UX**: search behavior, stat cards, pagination, empty states, loading states all vary per page
- **Two parallel table systems**: `EntityPageShell`'s inline `<table>` vs `data-view/DataTable` (used by only 14 pages)
- **No composability**: adding a feature (bulk actions, column resize, export) requires touching 100+ files
- **White-label risk**: hardcoded styling scattered across pages instead of flowing through tokens
- **WCAG gaps**: only `EntityPageShell` and `DetailLayout` have consistent ARIA; hand-built pages vary
- **No detail-page shell**: every `[id]/page.tsx` re-implements the same header/tabs/sidebar/chatter pattern

---

## 2. Target Architecture — 3-Tier Composable System

### Tier 1: Primitives (Atoms + Molecules)

Already mostly exists in `src/components/ui/` and `src/components/data-view/`. Needs consolidation.

| Component                             | Status     | Notes                                                          |
| ------------------------------------- | ---------- | -------------------------------------------------------------- |
| `Button`, `Input`, `Badge`, `Avatar`  | ✅ Exists  | Tokenized                                                      |
| `StatCard`                            | ✅ Exists  | Tokenized                                                      |
| `StatusBadge`                         | ✅ Exists  | Tokenized                                                      |
| `SearchInput`                         | ✅ Exists  | Tokenized                                                      |
| `PageHeader`                          | ✅ Exists  | Tokenized                                                      |
| `TabBar`                              | ✅ Exists  | Tokenized, ARIA-complete                                       |
| `DataTable`                           | ✅ Exists  | Full-featured: sort, filter, paginate, select, field renderers |
| `DataBoard`                           | ✅ Exists  | Kanban view                                                    |
| `DataCards`                           | ✅ Exists  | Grid card view                                                 |
| `FieldRenderer`                       | ✅ Exists  | 16 field types (status, currency, date, progress, etc.)        |
| `FilterBar`                           | ✅ Exists  | Multi-filter composition                                       |
| `LoadingState`                        | ✅ Exists  | page/card/list/table variants                                  |
| `EmptyState`                          | ✅ Exists  | Action-aware                                                   |
| `PermissionGate`                      | ✅ Exists  | RBAC wrapper                                                   |
| `CreateEntityDialog`                  | ✅ Exists  | Config-driven form dialog                                      |
| `RecordChatter`                       | ✅ Exists  | Activity feed + comments                                       |
| `SlidePanel`                          | ✅ Exists  | Side drawer                                                    |
| `ConfirmDialog`                       | ✅ Exists  | Destructive action confirmation                                |
| `CsvExportButton` / `CsvImportDialog` | ✅ Exists  | Bulk I/O                                                       |
| `BulkActionBar`                       | ❌ Missing | Selected-row action toolbar                                    |
| `ColumnCustomizer`                    | ❌ Missing | Show/hide/reorder columns                                      |
| `InlineEditCell`                      | ❌ Missing | Edit-in-place for table cells                                  |

### Tier 2: Page Shells (Composable Organisms)

The structural containers that compose Tier 1 primitives. **Two shells** cover 100% of page types.

#### 2a. `ListPageShell` — Replaces both `EntityPageShell` and hand-built list pages

```
┌──────────────────────────────────────────────────────┐
│ PermissionGate                                       │
│ ┌──────────────────────────────────────────────────┐ │
│ │ PageHeader (title, description, actions slot)    │ │
│ ├──────────────────────────────────────────────────┤ │
│ │ StatCards (declarative or slot)                  │ │
│ ├──────────────────────────────────────────────────┤ │
│ │ AlertBanners (conditional)                       │ │
│ ├──────────────────────────────────────────────────┤ │
│ │ Tabs (optional — multi-view or sub-entity)       │ │
│ ├──────────────────────────────────────────────────┤ │
│ │ Toolbar (search + filters + view toggle + bulk)  │ │
│ ├──────────────────────────────────────────────────┤ │
│ │ Content (DataTable | DataBoard | DataCards)       │ │
│ ├──────────────────────────────────────────────────┤ │
│ │ BulkActionBar (when rows selected)               │ │
│ ├──────────────────────────────────────────────────┤ │
│ │ CreateEntityDialog (optional)                    │ │
│ └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

**Key design decisions:**

- Accepts a `ListPageConfig` (evolution of `EntityPageConfig`) for fully declarative pages
- Also accepts **slot overrides** for any section (`headerSlot`, `statsSlot`, `toolbarSlot`, `contentSlot`)
- Uses `DataTable` (not inline `<table>`) with `FieldRenderer` for all column rendering
- Supports `display` switching: `table` | `board` | `cards` (runtime toggle)
- Built-in pagination, search, multi-column sort, bulk selection
- RBAC-gated by default via `PermissionGate`

#### 2b. `DetailPageShell` — New, replaces hand-built `[id]/page.tsx` patterns

```
┌──────────────────────────────────────────────────────┐
│ PermissionGate                                       │
│ ┌──────────────────────────────────────────────────┐ │
│ │ BackLink                                         │ │
│ │ DetailHeader (title, status, avatar, actions)    │ │
│ ├──────────────────────────────────────────────────┤ │
│ │ StatCards (optional — key metrics)               │ │
│ ├──────────────────────────────────────────────────┤ │
│ │ TabBar                                           │ │
│ ├──────────────────────────────────────────────┬───┤ │
│ │ TabPanel (main content)                      │ S │ │
│ │ ┌─ Overview: FieldGrid (declarative)         │ i │ │
│ │ ├─ Related: Sub-entity DataTable             │ d │ │
│ │ ├─ Activity: RecordChatter                   │ e │ │
│ │ └─ Custom: slot override                     │ b │ │
│ │                                              │ a │ │
│ │                                              │ r │ │
│ ├──────────────────────────────────────────────┴───┤ │
│ │ ConfirmDialog (delete/archive)                   │ │
│ └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

**Key design decisions:**

- Accepts a `DetailPageConfig` for fully declarative detail pages
- `FieldGrid`: declarative field layout (2-col grid of label/value pairs using `FieldRenderer`)
- `RelatedEntities`: declarative sub-entity tables (e.g., "Tasks on this Project")
- Built-in CRUD actions (edit, archive, delete) via `useDetailCrud`
- Built-in `RecordChatter` tab
- Sidebar composition via declarative config or slot override
- RBAC-gated by default

### Tier 3: Page Configs (Pure Data)

Thin config objects — no JSX, no hooks, no side effects. One per page.

#### `ListPageConfig` (evolution of `EntityPageConfig`)

```typescript
interface ListPageConfig {
  entityKey: string; // Resolves EntityConfig for RBAC, title, API path
  description?: string;
  icon?: LucideIcon;

  // Stats
  stats?: StatConfig[]; // Declarative stat cards

  // Columns
  columns: ColumnDef[]; // DataTable column definitions (uses FieldRenderer)
  defaultSort?: SortState;
  searchKeys?: string[];

  // Views
  views?: ("table" | "board" | "cards")[]; // Allowed display modes
  defaultView?: "table" | "board" | "cards";
  boardConfig?: { groupByKey: string; columnLabels?: Record<string, string> };
  cardConfig?: CardFieldDef[];

  // Filters
  filters?: FilterDef[]; // Declarative filter definitions

  // Alerts
  alerts?: AlertConfig[];

  // Actions
  createConfig?: CreateEntityConfig;
  bulkActions?: BulkActionDef[];
  rowActions?: RowActionDef[];

  // CSV
  exportable?: boolean;
  importable?: boolean;
}
```

#### `DetailPageConfig` (new)

```typescript
interface DetailPageConfig {
  entityKey: string;
  titleKey: string; // Field to use as page title
  subtitleKey?: string;
  statusKey?: string;
  icon?: LucideIcon;

  // Overview tab — declarative field grid
  fields: DetailFieldDef[]; // Rendered via FieldGrid + FieldRenderer
  sidebarFields?: DetailFieldDef[]; // Fields for sidebar

  // Related entities — sub-tables
  relatedEntities?: RelatedEntityDef[];

  // Tabs
  tabs?: DetailTabDef[]; // Custom tabs beyond overview/activity

  // Actions
  editConfig?: CreateEntityConfig; // Re-use create form for editing
  archivable?: boolean;
  deletable?: boolean;

  // Chatter
  chatter?: boolean; // Enable RecordChatter tab (default: true)
}
```

---

## 3. Current Inventory & Migration Categories

### 3.1 List Pages (261 total)

| Category                                                                                           | Count | Migration Strategy                                                                                                     |
| -------------------------------------------------------------------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------- |
| **A — Already config-driven** (`EntityPageShell` thin shells, 6–8 lines)                           | 155   | **Repoint** to `ListPageShell` + upgrade `EntityPageConfig` → `ListPageConfig`. Mechanical find-replace.               |
| **B — Hand-built with standard pattern** (PageShell + stats + search + table/cards, 100–350 lines) | ~70   | **Extract** config from imperative code, replace body with `ListPageShell`. ~80% reduction per page.                   |
| **C — Complex/specialized** (multi-tab, Kanban, Gantt, Kanban+Table hybrid, 350–885 lines)         | ~36   | **Partial migration**: use `ListPageShell` with slot overrides for specialized content. Custom tabs stay as JSX slots. |

### 3.2 Detail Pages (51 total)

| Category                                                                        | Count | Migration Strategy                                                                                                                    |
| ------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **D — Standard detail** (DetailLayout + overview + activity + sidebar)          | ~35   | **Extract** `DetailPageConfig`, replace body with `DetailPageShell`. ~70% reduction per page.                                         |
| **E — Complex detail** (inline editing, complex tabs, multi-entity composition) | ~16   | **Partial migration**: use `DetailPageShell` with slot overrides. Specialized tabs (e.g., proposal builder, deck editor) stay as JSX. |

---

## 4. New & Modified Components

### 4.1 New Components to Build

| Component                | Location                                      | Purpose                                              | Est. Lines |
| ------------------------ | --------------------------------------------- | ---------------------------------------------------- | ---------- |
| `ListPageShell`          | `src/components/shells/list-page-shell.tsx`   | Universal list page container                        | ~300       |
| `DetailPageShell`        | `src/components/shells/detail-page-shell.tsx` | Universal detail page container                      | ~350       |
| `FieldGrid`              | `src/components/shells/field-grid.tsx`        | Declarative 2-col field layout using `FieldRenderer` | ~80        |
| `RelatedEntities`        | `src/components/shells/related-entities.tsx`  | Sub-entity `DataTable` with header + link            | ~100       |
| `BulkActionBar`          | `src/components/ui/bulk-action-bar.tsx`       | Floating bar for bulk operations on selected rows    | ~80        |
| `ViewSwitcher`           | `src/components/ui/view-switcher.tsx`         | Toggle between table/board/cards views               | ~40        |
| `ListPageConfig` types   | `src/types/list-page-config.ts`               | Config type definitions                              | ~100       |
| `DetailPageConfig` types | `src/types/detail-page-config.ts`             | Config type definitions                              | ~80        |

### 4.2 Components to Extend

| Component         | Change                                                                               |
| ----------------- | ------------------------------------------------------------------------------------ |
| `DataTable`       | Add `selectable` row checkbox support (partially exists), expose `onSelectionChange` |
| `FieldRenderer`   | Add `render` escape-hatch for custom cell content                                    |
| `FilterBar`       | Accept declarative `FilterDef[]` config                                              |
| `DetailLayout`    | **Delete** — replaced by `DetailPageShell`                                           |
| `PageShell`       | **Delete** — replaced by `ListPageShell`                                             |
| `EntityPageShell` | **Delete** — replaced by `ListPageShell`                                             |

### 4.3 Components Unchanged

All Tier 1 primitives (`Button`, `Card`, `StatCard`, `StatusBadge`, `Badge`, `SearchInput`, `TabBar`, `LoadingState`, `EmptyState`, `CreateEntityDialog`, `RecordChatter`, `CsvExportButton`, etc.) remain as-is. They are already well-factored atoms/molecules.

---

## 5. Phased Migration Plan

### Phase 1 — Foundation (Week 1–2)

**Goal:** Build the new shells and type system. Zero page changes yet.

| Step | Task                                                                              | Dependency      |
| ---- | --------------------------------------------------------------------------------- | --------------- |
| 1.1  | Define `ListPageConfig` and `DetailPageConfig` types in `src/types/`              | None            |
| 1.2  | Build `FieldGrid` component                                                       | `FieldRenderer` |
| 1.3  | Build `RelatedEntities` component                                                 | `DataTable`     |
| 1.4  | Build `ViewSwitcher` component                                                    | None            |
| 1.5  | Build `BulkActionBar` component                                                   | None            |
| 1.6  | Extend `DataTable` with row-selection checkboxes                                  | `DataTable`     |
| 1.7  | Extend `FilterBar` to accept declarative `FilterDef[]`                            | `FilterBar`     |
| 1.8  | Build `ListPageShell` consuming all above                                         | 1.1–1.7         |
| 1.9  | Build `DetailPageShell` consuming `FieldGrid`, `RelatedEntities`, `RecordChatter` | 1.1–1.3         |
| 1.10 | Unit tests for `ListPageShell` and `DetailPageShell` with mock configs            | 1.8, 1.9        |

**Deliverable:** Both shells render correctly with test configs. Zero production pages changed.

### Phase 2 — Delete Legacy Shells & Rewrite 155 EntityPageShell Pages (Weeks 3–5)

**Goal:** Delete `EntityPageShell`, `entity-page-configs.ts`, and rewrite all 155 thin config-driven pages to use `ListPageShell` + `ListPageConfig` directly.

| Step | Task                                                                                                                                                                                                                         | Risk                            |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| 2.1  | Convert all `EntityPageConfig` objects in `entity-page-configs.ts` to `ListPageConfig` objects in domain-organized files under `src/config/list-page-configs/` (proper `ColumnDef[]`, `FieldRenderer` types, stats, filters) | Medium — 155 configs to rewrite |
| 2.2  | Rewrite all 155 page files: replace `<EntityPageShell config={...} />` with `<ListPageShell config={...} />`                                                                                                                 | Low — mechanical                |
| 2.3  | **Delete** `src/components/entity-page-shell.tsx`                                                                                                                                                                            | None                            |
| 2.4  | **Delete** `src/config/entity-page-configs.ts`                                                                                                                                                                               | None                            |
| 2.5  | **Delete** `src/components/shells/entity-config-adapter.ts`                                                                                                                                                                  | None                            |
| 2.6  | Verify all 155 pages render correctly — `tsc --noEmit` + visual check                                                                                                                                                        | Medium                          |

**Batching strategy:**

- ~30 pages per batch, 5 batches over 3 weeks
- Each batch: write `ListPageConfig` objects → rewrite page files → verify
- Batch by domain (CRM, Finance, Operations, Vendor/Legal, People/System)

**Deliverable:** 155 pages on `ListPageShell` directly. Legacy `EntityPageShell` and `entity-page-configs.ts` deleted.

### Phase 3 — Rewrite Hand-Built List Pages (Weeks 6–9)

**Goal:** Rewrite all ~106 hand-built list pages to `ListPageShell` + `ListPageConfig`.

**Process per page:**

1. Read the page, identify: columns, search keys, stats, filters, create config, RBAC resource
2. Write a `ListPageConfig` object in `src/config/list-page-configs/[domain].ts`
3. Replace the `page.tsx` body with `<ListPageShell config={...} />`
4. For pages with custom rendering (Kanban, cards, inline mutations, multi-tab), use slot overrides
5. Verify rendering

**Sub-categories:**

| Sub-category                                     | Count | Approach                                  |
| ------------------------------------------------ | ----- | ----------------------------------------- |
| **Standard** (PageHeader + Stats + DataTable)    | ~70   | Direct `ListPageConfig` — 6–15 line pages |
| **Complex** (multi-tab, Kanban, specialized viz) | ~36   | `ListPageShell` with slot overrides       |

**Batching strategy:**

- Batch by domain, ~15 pages per batch
- Standard pages first, complex pages second within each domain
- Each batch ends with `tsc --noEmit` + visual check

**Target batches:**

- `leads`, `deals`, `opportunities`, `accounts`, `companies` (CRM)
- `invoices`, `expenses`, `payments`, `budgets`, `revenue`, `finance` (Finance)
- `assets`, `inventory`, `fleet`, `warehouses`, `shipments` (Operations)
- `vendors`, `contracts`, `proposals`, `estimates` (Vendor/Legal)
- `tasks`, `projects`, `events`, `activations`, `incidents` (Project/Event)
- `crew`, `teams`, `certifications`, `credentials`, `workforce` (People)
- `time-tracking`, `scheduling`, `reports`, `forecasting`, `calendar` (Complex)
- `pipeline`, `approvals`, `live-ops`, `system-health`, `compliance` (Complex)

**Deliverable:** ~106 pages rewritten. **Delete** `src/components/layouts/page-shell.tsx` once all consumers removed. ~20,000 lines removed.

### Phase 4 — Rewrite Detail Pages (Weeks 10–12)

**Goal:** Rewrite all 51 detail pages to `DetailPageShell` + `DetailPageConfig`.

**Sub-categories:**

| Sub-category                                   | Count | Approach                                     |
| ---------------------------------------------- | ----- | -------------------------------------------- |
| **Standard** (overview + activity + sidebar)   | ~35   | Direct `DetailPageConfig` — 10–30 line pages |
| **Complex** (inline editing, specialized tabs) | ~16   | `DetailPageShell` with slot overrides        |

**Process per page:**

1. Read `[id]/page.tsx`, identify: title field, status field, overview fields, sidebar fields, related entities, tabs
2. Write a `DetailPageConfig` object in `src/config/detail-page-configs/[domain].ts`
3. Replace the page body with `<DetailPageShell config={...} />`
4. For complex pages, use slot overrides for specialized tabs
5. Verify rendering

**Deliverable:** 51 detail pages rewritten. **Delete** `src/components/layouts/detail-layout.tsx` once all consumers removed. ~15,000 lines removed.

### Phase 5 — Final Cleanup (Week 13)

| Step | Task                                                                                                                        |
| ---- | --------------------------------------------------------------------------------------------------------------------------- |
| 5.1  | Verify `EntityPageShell`, `PageShell`, `DetailLayout`, `entity-page-configs.ts`, `entity-config-adapter.ts` are all deleted |
| 5.2  | Remove any remaining inline `<table>` implementations                                                                       |
| 5.3  | Remove dead DEMO* / MOCK* constants from any remaining pages                                                                |
| 5.4  | Remove stale imports and barrel export entries                                                                              |
| 5.5  | Final `tsc --noEmit` + `eslint` — must be 0 errors                                                                          |
| 5.6  | Update `FULLSTACK_AUDIT_REPORT.md` with new architecture metrics                                                            |

---

## 6. Migration Rules & Constraints

### Must

- **No functional regressions** — every page must render the same data before and after migration
- **No breaking URL changes** — all routes stay identical
- **No new dependencies** — everything builds on existing primitives
- **No backward compatibility** — direct cutover; legacy shells are deleted, not deprecated
- **WCAG 2.2 AA** on all new components (keyboard nav, ARIA, focus management, `prefers-reduced-motion`)
- **Token-only styling** — no hardcoded colors/spacing in new components
- **TypeScript strict** — all new types are strict, no `any`

### Must Not

- Must NOT create custom one-off components for individual pages
- Must NOT duplicate `DataTable` functionality in shells (compose, don't copy)
- Must NOT leave dead legacy code — `EntityPageShell`, `PageShell`, `DetailLayout`, `entity-page-configs.ts` must be deleted once their consumers are migrated
- Must NOT hardcode entity-specific logic in shell components

### Should

- Should preserve existing page-specific behavior through slot overrides, not shell modifications
- Should use `FieldRenderer` for all field display (no raw string formatting in page files)
- Should co-locate `ListPageConfig` objects by domain in `src/config/list-page-configs/`
- Should co-locate `DetailPageConfig` objects by domain in `src/config/detail-page-configs/`

---

## 7. Estimated Impact

| Metric                              | Before                                                      | After                  | Delta     |
| ----------------------------------- | ----------------------------------------------------------- | ---------------------- | --------- |
| Total dashboard page lines          | ~37,500                                                     | ~12,000                | **-68%**  |
| Average list page size              | ~180 lines                                                  | ~12 lines              | **-93%**  |
| Average detail page size            | ~400 lines                                                  | ~25 lines              | **-94%**  |
| Unique table implementations        | 3 (EntityPageShell inline, hand-built `<table>`, DataTable) | 1 (`DataTable`)        | **-67%**  |
| Pages with WCAG-complete ARIA       | ~155                                                        | ~261                   | **+68%**  |
| Pages with built-in bulk actions    | 0                                                           | ~225                   | **+225**  |
| Pages with view-mode switching      | 0                                                           | ~225                   | **+225**  |
| Pages with PermissionGate           | 105                                                         | 261                    | **+148%** |
| Time to add a new entity page       | ~30 min (copy/paste/modify)                                 | ~2 min (write config)  | **-93%**  |
| Time to add a cross-cutting feature | ~2 days (touch 100+ files)                                  | ~1 hour (modify shell) | **-95%**  |

---

## 8. File Structure After Migration

```
src/
├── components/
│   ├── ui/                          # Tier 1: Atoms & Molecules (unchanged)
│   │   ├── button.tsx
│   │   ├── stat-card.tsx
│   │   ├── bulk-action-bar.tsx      # NEW
│   │   ├── view-switcher.tsx        # NEW
│   │   └── ...
│   ├── data-view/                   # Tier 1: Data display organisms (extended)
│   │   ├── data-table.tsx           # Extended: row selection
│   │   ├── data-board.tsx
│   │   ├── data-cards.tsx
│   │   ├── field-renderers.tsx      # Extended: render escape-hatch
│   │   └── index.ts
│   ├── shells/                      # Tier 2: Page shells (NEW)
│   │   ├── list-page-shell.tsx
│   │   ├── detail-page-shell.tsx
│   │   ├── field-grid.tsx
│   │   ├── related-entities.tsx
│   │   └── index.ts
│   ├── layouts/                     # Structural layouts (sidebar, topbar, etc.)
│   │   ├── loading-state.tsx
│   │   ├── empty-state.tsx
│   │   ├── detail-layout.tsx        # DELETED
│   │   ├── page-shell.tsx           # DELETED
│   │   └── ...
│   └── entity-page-shell.tsx        # DELETED
├── config/
│   ├── list-page-configs/           # Tier 3: List page configs (NEW)
│   │   ├── crm.ts                   # leads, deals, opportunities, accounts, companies
│   │   ├── finance.ts               # invoices, expenses, payments, budgets, revenue
│   │   ├── operations.ts            # assets, inventory, fleet, warehouses, shipments
│   │   ├── vendor.ts                # vendors, contracts, proposals, estimates
│   │   ├── project.ts               # tasks, projects, events, activations
│   │   ├── people.ts                # crew, teams, certifications, workforce
│   │   ├── system.ts                # audit logs, notifications, integrations
│   │   └── index.ts                 # Barrel export
│   ├── detail-page-configs/         # Tier 3: Detail page configs (NEW)
│   │   ├── crm.ts
│   │   ├── finance.ts
│   │   ├── operations.ts
│   │   └── ...
│   └── entity-page-configs.ts       # DELETED
├── types/
│   ├── list-page-config.ts          # ListPageConfig type definitions (NEW)
│   └── detail-page-config.ts        # DetailPageConfig type definitions (NEW)
└── app/(dashboard)/
    ├── leads/
    │   ├── page.tsx                  # 6–15 lines: <ListPageShell config={LEADS_PAGE} />
    │   └── [id]/
    │       └── page.tsx             # 10–30 lines: <DetailPageShell config={LEAD_DETAIL} />
    └── ...
```

---

## 9. Success Criteria

| Criterion                                                                 | Measurement                                                              |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| All 261 list pages use `ListPageShell` directly                           | `grep -rl "ListPageShell" src/app/(dashboard)/*/page.tsx \| wc -l` = 261 |
| All 51 detail pages use `DetailPageShell` (directly or via slot override) | `grep -rl "DetailPageShell" \| wc -l` >= 51                              |
| Zero inline `<table>` in page files                                       | `grep -rl "<table" src/app/(dashboard)/*/page.tsx \| wc -l` = 0          |
| `DataTable` is the single table implementation                            | Only `data-view/data-table.tsx` contains `<table>`                       |
| TypeScript clean                                                          | `tsc --noEmit` exit 0 (ignoring pre-existing errors)                     |
| ESLint clean                                                              | `eslint` exit 0 on new/modified files                                    |
| No DEMO* or MOCK* constants in page files                                 | `grep -rl "DEMO_\|MOCK_" src/app/(dashboard)/ \| wc -l` = 0              |
| WCAG 2.2 AA on all shells                                                 | Manual audit + `axe-core` on representative pages                        |

---

## 10. Risks & Mitigations

| Risk                                             | Likelihood | Impact | Mitigation                                                                                                                                              |
| ------------------------------------------------ | ---------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Visual regressions during migration              | Medium     | Medium | Batch-and-verify approach with `tsc` + visual checks per batch.                                                                                         |
| Broken pages during cutover                      | Medium     | High   | Migrate in domain batches — each batch is a complete unit. Never leave a batch half-done.                                                               |
| Slot override abuse (pages become complex again) | Low        | Medium | Lint rule: page files must be < 50 lines. Complex custom content must live in dedicated components, not inline.                                         |
| Performance regression from over-abstraction     | Low        | High   | `ListPageShell` and `DetailPageShell` use `useMemo` and `useCallback` throughout. DataTable already handles virtualization for large datasets.          |
| Incomplete `FieldRenderer` coverage              | Medium     | Low    | Add `render` escape-hatch (Step 1.6) so any field can fall back to custom JSX without modifying the renderer.                                           |
| Team resistance to config-driven authoring       | Low        | Medium | The 155 existing EntityPageConfig pages already prove config-driven authoring works. Direct cutover is faster and cleaner than maintaining two systems. |

---

## 11. Out of Scope

- **Supabase type generation** — Tracked separately. Migration uses existing `Record<string, unknown>` patterns.
- **Real-time / WebSocket features** — Orthogonal to UI shell architecture.
- **New entity creation** — This plan migrates existing pages, not creating new entities.
- **Backend API changes** — Shells consume existing `apiList` / `apiGet` patterns.
- **Mobile app** — Web dashboard only.
