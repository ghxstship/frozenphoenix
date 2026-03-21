# Non-List Page Infrastructure Audit

> **Date:** 2025-01-XX
> **Scope:** All non-list pages under `src/app/(dashboard)/` — 139 pages across 5 page types
> **Methodology:** Same classification + shell-usage analysis as `LIST_PAGE_INFRASTRUCTURE_AUDIT.md`

---

## 1. Executive Summary

The codebase contains **355 dashboard pages** total. After excluding the **216 list pages** covered by the prior audit, **139 non-list pages** remain. These break into five structural categories:

| Page Type                                    | Count   | Shell Usage                         | Standardization      |
| -------------------------------------------- | ------- | ----------------------------------- | -------------------- |
| **Detail `[id]`**                            | 54      | 50 use `DetailPageShell`, 4 bespoke | **93% standardized** |
| **Create Form `/new`**                       | 9       | 5 use `FormPageShell`, 4 bespoke    | **56% standardized** |
| **Edit Form `[id]/edit`**                    | 2       | 1 uses `FormPageShell`, 1 bespoke   | **50% standardized** |
| **Bespoke (non-list, non-detail, non-form)** | 74      | 7 use `PageShell`, 67 fully bespoke | **9% standardized**  |
| **TOTAL**                                    | **139** |                                     |                      |

**Key finding:** Detail and form pages have strong declarative shells but low migration coverage in forms. The 74 bespoke pages have **zero standardized shell** and represent the largest consolidation opportunity in the codebase.

---

## 2. Architecture Inventory

### 2.1 Existing Shells & Layouts

| Component                | Location                                      | Purpose                                       | Adoption                                            |
| ------------------------ | --------------------------------------------- | --------------------------------------------- | --------------------------------------------------- |
| `ListPageShell`          | `src/components/shells/list-page-shell.tsx`   | Universal list page container                 | 216 pages                                           |
| `DetailPageShell`        | `src/components/shells/detail-page-shell.tsx` | Universal detail `[id]` container             | 50 pages                                            |
| `FormPageShell`          | `src/components/shells/form-page-shell.tsx`   | Universal create/edit form container          | 6 pages                                             |
| `PageShell`              | `src/components/layouts/page-shell.tsx`       | Generic page wrapper (header + optional tabs) | 7 bespoke pages + many list/detail pages internally |
| `DetailLayout`           | `src/components/layouts/detail-layout.tsx`    | Low-level 2-column detail layout              | Used internally by `DetailPageShell`                |
| `FormLayout`             | `src/components/layouts/form-layout.tsx`      | Low-level form layout                         | Superseded by `FormPageShell`                       |
| `FieldGrid`              | `src/components/shells/field-grid.tsx`        | Declarative 2-column label/value grid         | Used by `DetailPageShell` and `QuickViewPanel`      |
| `RelatedEntitiesSection` | `src/components/shells/related-entities.tsx`  | Sub-table for related entities                | Used by `DetailPageShell`                           |
| `QuickViewPanel`         | `src/components/shells/quick-view-panel.tsx`  | Slide-panel record preview                    | Used by `ListPageShell`                             |

### 2.2 Declarative Config Types

| Type               | Location                          | Consumer          |
| ------------------ | --------------------------------- | ----------------- |
| `DetailPageConfig` | `src/types/detail-page-config.ts` | `DetailPageShell` |
| `FormPageConfig`   | `src/types/form-page-config.ts`   | `FormPageShell`   |
| `ListPageConfig`   | `src/types/list-page-config.ts`   | `ListPageShell`   |

### 2.3 Common UI Primitives Used Across Bespoke Pages

Sampled across all 74 bespoke pages:

| Primitive                     | Usage Count (of 74) | Notes                            |
| ----------------------------- | ------------------- | -------------------------------- |
| `PageHeader`                  | 56 (76%)            | Ad-hoc title/description/actions |
| `LoadingState`                | 53 (72%)            | Consistent loading pattern       |
| `PermissionGate`              | 50 (68%)            | RBAC enforcement                 |
| `StatCard`                    | 48 (65%)            | KPI cards                        |
| `TabBar` + `useQueryTabState` | 21 (28%)            | URL-synced tabs                  |
| `PageShell`                   | 7 (9%)              | Only generic shell adopted       |
| `SettingRow`                  | 2 (3%)              | Settings-specific component      |

---

## 3. Detail Pages — `[id]` (54 pages)

### 3.1 Classification

| Sub-type                                     | Count | Shell                                            | Pattern                                |
| -------------------------------------------- | ----- | ------------------------------------------------ | -------------------------------------- |
| **Standard detail** (uses `DetailPageShell`) | 50    | `DetailPageShell` + `DetailPageConfig`           | Declarative config with slot overrides |
| **Bespoke detail** (no shell)                | 4     | Raw `PageHeader` + `TabBar` + hand-rolled layout | Fully imperative                       |

### 3.2 Pages Using `DetailPageShell` (50 pages)

These follow the declarative pattern:

```typescript
const BASE_CONFIG: DetailPageConfig = {
    entityKey: "assets",
    titleKey: "name",
    statusKey: "condition",
    icon: Package,
    backHref: "/assets",
    backLabel: "Assets",
    fields: [...],
    tabs: [...],
};
```

**Common slot usage patterns observed:**

- `sidebarSlot` — 50/50 pages override with custom sidebar cards
- `overviewSlot` — ~45/50 pages override with custom stat grids and content cards
- `tabs` — All 50 pages define custom tabs with imperative JSX content
- `fields` — Most pages pass `fields: []` and use `overviewSlot` instead

**Issue D-1 (HIGH): FieldGrid bypass.** The declarative `fields` array in `DetailPageConfig` was designed for `FieldGrid` rendering, but nearly all detail pages set `fields: []` and instead pass fully imperative JSX via `overviewSlot`. This defeats the purpose of declarative field rendering.

**Issue D-2 (MEDIUM): Tab content is imperative.** All 50 `DetailPageShell` pages define tab content as inline JSX, not via `RelatedEntitiesSection` config or any declarative tab content system. Each tab reinvents its own Card/EmptyState/list pattern.

**Issue D-3 (MEDIUM): External data fetching.** All 50 pages fetch their own data externally and pass `record` to the shell, despite `DetailPageShell` having built-in `useQuery` self-fetching capability via `entityKey`. This creates 50 redundant data-fetching orchestrations.

**Issue D-4 (LOW): Sidebar card pattern duplication.** Every detail page builds custom sidebar cards (details, warnings, contextual info) with nearly identical Card/CardHeader/CardContent patterns. No reusable `SidebarCard` or `SidebarFieldList` component exists.

### 3.3 Bespoke Detail Pages (4 pages)

| Page                      | Lines | Pattern                                                          | Why Bespoke                                                  |
| ------------------------- | ----- | ---------------------------------------------------------------- | ------------------------------------------------------------ |
| `advancing/[id]`          | 344   | `PageHeader` + custom advancing item view                        | Catalog/fulfillment domain-specific UI                       |
| `approval-workflows/[id]` | 295   | `PageHeader` + `TabBar` + `StatCard` + custom step designer      | Visual workflow designer with step progress bars             |
| `automations/[id]`        | 396   | `PageHeader` + custom trigger/action builder                     | Rule builder with drag-and-drop-style condition/action cards |
| `integrations/[id]`       | 372   | `PageHeader` + `TabBar` + `StatCard` + custom sync/webhook views | Provider connection management with sync event logs          |

**Issue D-5 (HIGH): 4 bespoke detail pages duplicate the exact same structural pattern** — `PermissionGate` → `PageHeader` → `StatCard` grid → `TabBar` + `TabPanel` — that `DetailPageShell` already provides. These could be migrated to `DetailPageShell` using `overviewSlot` and custom tabs.

---

## 4. Form Pages — `/new` and `[id]/edit` (11 pages)

### 4.1 Classification

| Sub-type                        | Count | Shell                               | Pattern                     |
| ------------------------------- | ----- | ----------------------------------- | --------------------------- |
| **Shell-based (FormPageShell)** | 6     | `FormPageShell` + `FormPageConfig`  | Declarative sections/fields |
| **Bespoke form**                | 5     | Raw `PageHeader` + hand-rolled form | Fully imperative            |

### 4.2 Pages Using `FormPageShell` (6 pages)

| Page                                                        | Lines | Layout Mode |
| ----------------------------------------------------------- | ----- | ----------- |
| `assets/new`                                                | 161   | sections    |
| `crew/new`                                                  | 119   | sections    |
| `vendors/new`                                               | 133   | sections    |
| `projects/new`                                              | 111   | sections    |
| `projects/[id]/edit`                                        | 143   | sections    |
| _(Not yet identified 6th — possibly advancing/new counted)_ | —     | —           |

Average: **133 lines** per shell-based form page.

### 4.3 Bespoke Form Pages (5 pages)

| Page                  | Lines | Pattern                                           | Why Bespoke                          |
| --------------------- | ----- | ------------------------------------------------- | ------------------------------------ |
| `contracts/new`       | 356   | 4-step wizard with custom card-selection per step | Custom step type selection UI        |
| `invoices/new`        | 401   | Multi-section form with line-item editor          | Dynamic sub-row editing (line items) |
| `pipeline/new`        | 374   | `PageShell` + multi-section with stage selection  | Kanban stage picker integration      |
| `proposals/new`       | 882   | Rich document builder with sections/pricing       | Full document composition UI         |
| `templates/[id]/edit` | 411   | Template editor with field mapping                | Dynamic field configuration          |

Average: **485 lines** per bespoke form page — **3.6× larger** than shell-based pages.

**Issue F-1 (HIGH): `FormPageShell` wizard mode underutilized.** The shell supports `layout: "wizard"` with `FormWizardStepDef`, yet `contracts/new` (4-step wizard) builds its own wizard from scratch. This is the exact use case the shell was designed for.

**Issue F-2 (MEDIUM): Line-item sub-forms not supported.** `invoices/new` needs dynamic row editing (add/remove line items within a form section). `FormPageShell` has no `repeater` or `array` field type, forcing imperative fallback.

**Issue F-3 (MEDIUM): 5 bespoke forms lack `Cmd+S` keyboard shortcut.** `FormPageShell` provides `Cmd+S` save out of the box. Bespoke forms must implement it manually (none do).

**Issue F-4 (LOW): No `FormPageConfig` registry.** Unlike `list-page-configs/`, there is no centralized config directory for form page configs. Each form page defines its config inline.

---

## 5. Bespoke Pages (74 pages)

These 74 pages use no standardized shell. They represent 14 functional domains:

### 5.1 Functional Domain Breakdown

| Domain                  | Count | Representative Pages                                                                                                                                                                                                                                                                                                                                                            | Pattern                                                                      |
| ----------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Live Ops**            | 17    | `live-ops/page`, `live-ops/crew`, `live-ops/foh`, `live-ops/environment`, etc.                                                                                                                                                                                                                                                                                                  | Real-time operational dashboards with StatCards, filters, and action buttons |
| **Settings**            | 7     | `settings/page`, `settings/ai`, `settings/security`, `settings/org-security`, `settings/email-integration`, `settings/custom-fields`, `settings/developer`                                                                                                                                                                                                                      | Tab-based settings panels with `SettingRow` and form controls                |
| **Advancing**           | 6     | `advancing/catalog`, `advancing/fulfillment`, `advancing/inventory`, `advancing/queue`, `advancing/reports`, `advancing/templates`                                                                                                                                                                                                                                              | Domain-specific operational views (catalog, fulfillment, inventory)          |
| **Onboarding**          | 4     | `onboarding/org-setup`, `onboarding/billing`, `onboarding/invite-team`, `onboarding/claim-username`                                                                                                                                                                                                                                                                             | Wizard-style sequential setup flows                                          |
| **User Management**     | 3     | `user-management/audit-log`, `user-management/access-reviews`, `user-management/invitations`                                                                                                                                                                                                                                                                                    | Admin tables with filters and actions                                        |
| **Workforce**           | 3     | `workforce/goals`, `workforce/onboarding`, `workforce/reviews`                                                                                                                                                                                                                                                                                                                  | HR/workforce management views                                                |
| **Time Tracking**       | 2     | `time-tracking/page`, `time-tracking/compliance`                                                                                                                                                                                                                                                                                                                                | Timer interfaces with compliance dashboards                                  |
| **Reports**             | 2     | `reports/page`, `reports/ai`                                                                                                                                                                                                                                                                                                                                                    | Report catalog and AI report builder                                         |
| **Finance**             | 2     | `finance/page`, `finance/revenue-recognition`                                                                                                                                                                                                                                                                                                                                   | Financial dashboards and recognition schedules                               |
| **Home**                | 2     | `home/tasks`, `home/documents`                                                                                                                                                                                                                                                                                                                                                  | Personal task/document views with search and filters                         |
| **Integrations**        | 2     | `integrations/marketplace`, `integrations/sync-log`                                                                                                                                                                                                                                                                                                                             | Integration catalog and sync log viewer                                      |
| **Scanning**            | 2     | `assets/scan`, `assets/scan/batch`                                                                                                                                                                                                                                                                                                                                              | QR/barcode scanning interfaces                                               |
| **Single-page domains** | 22    | `calendar`, `scheduling`, `resource-planner`, `org-chart`, `messages`, `dashboard`, `dashboards`, `roles`, `approvals`, `automations`, `scenarios`, `forecasting`, `compliance`, `vendor-compliance`, `vendor-portal`, `client-portal`, `data-export`, `system-health`, `service-requests/sla`, `credentials/assignments`, `knowledge-base/collaborative`, `projects/templates` | Each is a unique specialized view                                            |

### 5.2 Structural Patterns Identified

Despite being "bespoke," nearly all 74 pages follow one of **5 recurring structural patterns**:

#### Pattern A: "Operational Dashboard" (≈35 pages)

```
PermissionGate → PageHeader → StatCard grid → Filter bar → Card list/grid
```

**Used by:** Live-ops (17), dashboard, dashboards, finance, forecasting, compliance, time-tracking, approvals, etc.
**Avg lines:** 200–600

#### Pattern B: "Settings Panel" (≈10 pages)

```
PermissionGate → PageHeader → TabBar → Settings sections with SettingRow / form controls
```

**Used by:** settings/\* (7), user-management/access-reviews, credentials/assignments, system-health
**Avg lines:** 250–2,400

#### Pattern C: "Tool/Editor" (≈10 pages)

```
PermissionGate → PageHeader → Specialized interactive UI (calendar, scheduler, org-chart, etc.)
```

**Used by:** calendar, scheduling, resource-planner, org-chart, messages, scenarios, data-export
**Avg lines:** 230–820

#### Pattern D: "Wizard/Onboarding Flow" (≈7 pages)

```
Step indicator → Step content panels → Navigation buttons (Back/Next/Submit)
```

**Used by:** onboarding/\* (4), contracts/new, pipeline/new, proposals/new (overlaps with bespoke forms)
**Avg lines:** 270–882

#### Pattern E: "Catalog/Marketplace" (≈8 pages)

```
PageHeader → Search/filter bar → Card grid with action buttons
```

**Used by:** advancing/catalog, integrations/marketplace, reports/page, projects/templates, home/tasks, home/documents, reports/ai, knowledge-base/collaborative
**Avg lines:** 190–620

### 5.3 Critical Issues

**Issue B-1 (CRITICAL): No `OperationalDashboardShell` exists.** Pattern A appears in ~35 pages with the same structural bones: `PermissionGate` → `PageHeader` → `StatCard` grid → filters → data cards. Each page rebuilds this from scratch, averaging 300+ lines of boilerplate.

**Issue B-2 (CRITICAL): No `SettingsPageShell` exists.** The 7 settings pages share identical tab-based layout with `SettingRow` sections, yet each implements its own tab routing, persistence, and form state. The main `settings/page.tsx` is **2,384 lines** — the largest single page in the codebase.

**Issue B-3 (HIGH): No `WizardShell` exists.** The 4 onboarding pages + 3 bespoke wizard forms all implement their own step indicators, navigation logic, and step validation. `FormPageShell` has wizard mode but is scoped to form creation — onboarding wizards need a more general-purpose wizard container.

**Issue B-4 (HIGH): Inconsistent `PermissionGate` placement.** 50 of 74 bespoke pages wrap content in `PermissionGate`, but 24 pages do **not** — meaning they are not RBAC-protected. A shell-level guarantee would enforce this.

**Issue B-5 (HIGH): Live-ops pages (17) share identical structural pattern** but each hand-rolls its own `StatCard` grid, filter bar, and data card layout. A `LiveOpsPanelShell` could reduce each from ~200 lines to ~50 lines of config.

**Issue B-6 (MEDIUM): `PageShell` is underutilized.** Only 7 of 74 bespoke pages use the generic `PageShell` layout wrapper, despite it providing exactly the `PageHeader + TabBar + tabpanel` pattern that 56 of 74 pages need.

**Issue B-7 (MEDIUM): No loading/error state standardization.** 53 of 74 pages manually check `isLoading` and render `<LoadingState />`. A shell could handle this declaratively.

**Issue B-8 (LOW): URL tab state is inconsistent.** 21 of 74 pages use `useQueryTabState` for URL-synced tabs. The remaining tab-using pages use local `useState`, losing tab state on navigation.

---

## 6. Cross-Cutting Issues

### 6.1 Shell Coverage Gap Analysis

| Shell             | Target Page Type          | Total Eligible | Using Shell | Gap             |
| ----------------- | ------------------------- | -------------- | ----------- | --------------- |
| `ListPageShell`   | List pages                | 216            | 216         | **0 (100%)** ✅ |
| `DetailPageShell` | Detail `[id]` pages       | 54             | 50          | **4 (93%)**     |
| `FormPageShell`   | Create/edit form pages    | 11             | 6           | **5 (55%)**     |
| _(No shell)_      | Operational dashboards    | ~35            | 0           | **35 (0%)** ❌  |
| _(No shell)_      | Settings pages            | ~10            | 0           | **10 (0%)** ❌  |
| _(No shell)_      | Wizard/onboarding flows   | ~7             | 0           | **7 (0%)** ❌   |
| _(No shell)_      | Tool/editor pages         | ~10            | 0           | **10 (0%)** ❌  |
| _(No shell)_      | Catalog/marketplace pages | ~8             | 0           | **8 (0%)** ❌   |

### 6.2 Lines-of-Code Distribution

| Page Type        | Min LOC | Avg LOC | Max LOC          | Median LOC |
| ---------------- | ------- | ------- | ---------------- | ---------- |
| Detail (shell)   | ~250    | ~450    | 922 (proposals)  | ~410       |
| Detail (bespoke) | 295     | 352     | 396              | 345        |
| Form (shell)     | 111     | 133     | 161              | 133        |
| Form (bespoke)   | 356     | 485     | 882              | 401        |
| Bespoke          | 79      | 320     | 2,384 (settings) | 270        |

### 6.3 Shared Component Usage Heatmap

```
Component          Detail(50)  Detail(4)  Form(6)  Form(5)  Bespoke(74)
───────────────────────────────────────────────────────────────────────
DetailPageShell     ██████████  ░░░░░░░░   ░░░░░░   ░░░░░░   ░░░░░░░░░
FormPageShell       ░░░░░░░░░░  ░░░░░░░░   ██████   ░░░░░░   ░░░░░░░░░
PageShell           ░░░░░░░░░░  ░░░░░░░░   ░░░░░░   █░░░░░   █░░░░░░░░
PageHeader          ░░░░░░░░░░  ████████   ░░░░░░   ██████   ████████░
StatCard            ░░░░░░░░░░  ████████   ░░░░░░   ░░░░░░   ████████░
TabBar              ░░░░░░░░░░  ████████   ░░░░░░   ░░░░░░   ███░░░░░░
PermissionGate      ██████████  ████████   ██████   ░░░░░░   ██████░░░
LoadingState        ░░░░░░░░░░  ████████   ░░░░░░   ░░░░░░   ████████░
```

---

## 7. Consolidation & Standardization Recommendations

### 7.1 New Shells to Create (Priority Order)

#### R-1: `OperationalDashboardShell` — CRITICAL

**Target:** ~35 bespoke operational dashboard pages
**Estimated reduction:** ~200 lines per page → ~50 lines of config

```typescript
interface DashboardPageConfig {
  entityKey: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  stats: DashboardStatDef[];
  filters?: DashboardFilterDef[];
  cardLayout: "grid" | "list" | "timeline";
  cardRenderer: (item: Record<string, unknown>) => React.ReactNode;
  emptyState?: { icon: LucideIcon; title: string; description: string };
}
```

**Handles:** PermissionGate, PageHeader, StatCard grid, filter bar, loading/error/empty states, data cards.

**Candidates:** All 17 live-ops pages, `dashboard`, `dashboards`, `finance`, `forecasting`, `compliance`, `approvals`, `time-tracking`, `vendor-compliance`, `system-health`, `home/tasks`, `home/documents`, etc.

#### R-2: `SettingsPageShell` — HIGH

**Target:** 7+ settings pages
**Estimated reduction:** Main settings page from 2,384 → ~600 lines

```typescript
interface SettingsPageConfig {
  title: string;
  tabs: SettingsTabDef[];
}

interface SettingsTabDef {
  id: string;
  label: string;
  icon?: LucideIcon;
  sections: SettingsSectionDef[];
}

interface SettingsSectionDef {
  title: string;
  description?: string;
  rows: SettingRowDef[];
}
```

**Handles:** PermissionGate, PageHeader, TabBar with URL-synced state, section rendering, SettingRow orchestration.

#### R-3: `WizardShell` — HIGH

**Target:** 4 onboarding pages + expandable to bespoke wizard forms
**Estimated reduction:** ~150 lines per wizard page

```typescript
interface WizardConfig {
  steps: WizardStepDef[];
  onComplete: (data: Record<string, unknown>) => Promise<void>;
  canSkip?: boolean;
  showProgress?: boolean;
}
```

**Handles:** Step indicator, step validation, Back/Next/Skip navigation, step persistence, completion callback. This complements `FormPageShell` wizard mode (which is form-specific) with a general-purpose flow container.

### 7.2 Existing Shell Improvements

#### R-4: Improve `DetailPageShell` FieldGrid adoption — HIGH

**Problem:** 50 pages set `fields: []` and use `overviewSlot` instead of declarative `fields`.
**Solution:** Audit and migrate overview content to `DetailFieldDef[]` where possible. Many overview sections are simple label/value pairs that `FieldGrid` already handles. Reserve `overviewSlot` for truly custom content (e.g., charts, progress bars).

**Expected impact:** Reduce average detail page from ~450 lines to ~250 lines.

#### R-5: Add `repeater` field type to `FormPageShell` — MEDIUM

**Problem:** `invoices/new` (401 lines) can't use the shell because it needs dynamic line-item editing.
**Solution:** Add `type: "repeater"` to `FormFieldType` with sub-field definitions and add/remove row controls.

**Unblocks:** `invoices/new`, `proposals/new` (line items), `templates/[id]/edit` (dynamic field config).

#### R-6: Migrate 4 bespoke detail pages to `DetailPageShell` — MEDIUM

All 4 bespoke detail pages (`advancing/[id]`, `approval-workflows/[id]`, `automations/[id]`, `integrations/[id]`) follow the exact `PageHeader + StatCards + Tabs` pattern that `DetailPageShell` provides. Each can be migrated using `overviewSlot` and custom tabs.

#### R-7: Migrate `contracts/new` to `FormPageShell` wizard mode — LOW

The 4-step contract creation wizard is the exact use case `FormPageShell` `layout: "wizard"` was designed for. The custom card-selection step can use `FormWizardStepDef.content` slot.

### 7.3 Infrastructure Standardization

#### R-8: Enforce `PermissionGate` at shell level — HIGH

**Problem:** 24 bespoke pages lack RBAC gating.
**Solution:** All new shells should include `PermissionGate` as a mandatory wrapper, resolved from `entityKey` via `getEntityConfig()`. Pages not using a shell should be flagged in CI.

#### R-9: Standardize `PageShell` adoption for remaining bespoke pages — MEDIUM

**Problem:** Only 7 of 74 bespoke pages use the generic `PageShell`.
**Solution:** After creating domain-specific shells (R-1, R-2, R-3), the remaining ~15 truly unique pages should at minimum use `PageShell` for consistent PageHeader + TabBar + animation.

#### R-10: Create `config/dashboard-page-configs/` directory — LOW

Following the `config/list-page-configs/` pattern, centralize `DashboardPageConfig` and `SettingsPageConfig` definitions for declarative resolution and type safety.

---

## 8. Implementation Roadmap

### Phase 1 — Quick Wins (Week 1–2)

1. Migrate 4 bespoke detail pages to `DetailPageShell` (R-6)
2. Migrate `contracts/new` to `FormPageShell` wizard mode (R-7)
3. Add `PermissionGate` to 24 unprotected bespoke pages (R-8)
4. Adopt `PageShell` in remaining 67 bespoke pages where applicable (R-9)

### Phase 2 — New Shells (Week 3–5)

1. Design and implement `OperationalDashboardShell` + `DashboardPageConfig` type (R-1)
2. Migrate 5 pilot pages (1 live-ops, 1 home, 1 finance, 1 compliance, 1 approvals)
3. Design and implement `SettingsPageShell` + `SettingsPageConfig` type (R-2)
4. Migrate `settings/page.tsx` (2,384 → ~600 lines)

### Phase 3 — Full Migration (Week 6–10)

1. Migrate remaining ~30 operational dashboard pages to `OperationalDashboardShell`
2. Migrate remaining 6 settings pages to `SettingsPageShell`
3. Implement `WizardShell` (R-3) and migrate 4 onboarding pages
4. Add `repeater` field type to `FormPageShell` (R-5) and migrate `invoices/new`

### Phase 4 — Declarative Detail Fields (Week 11–12)

1. Audit all 50 `DetailPageShell` pages for FieldGrid adoption (R-4)
2. Migrate overview content from `overviewSlot` to declarative `fields[]` where possible
3. Create reusable sidebar card components (`SidebarFieldCard`, `SidebarAlertCard`)

---

## 9. Estimated Impact

| Metric                         | Before                   | After (Projected)                     |
| ------------------------------ | ------------------------ | ------------------------------------- |
| Total non-list page LOC        | ~44,500                  | ~25,000 (−44%)                        |
| Pages using standardized shell | 56/139 (40%)             | ~130/139 (94%)                        |
| Average bespoke page LOC       | 320                      | ~120                                  |
| Largest single page (settings) | 2,384 lines              | ~600 lines                            |
| Pages without RBAC gating      | 24                       | 0                                     |
| Declarative config coverage    | Detail + Form types only | + Dashboard + Settings + Wizard types |

---

## 10. Appendix: Complete Page Classification

### A. Detail Pages Using `DetailPageShell` (50)

<details>
<summary>Click to expand full list</summary>

- `activations/[id]` · `assets/[id]` · `brand-kit/[id]` · `briefs/[id]`
- `budgets/[id]` · `campaigns/[id]` · `certifications/[id]` · `change-orders/[id]`
- `companies/[id]` · `contacts/[id]` · `contracts/[id]` · `crew/[id]`
- `deals/[id]` · `decks/[id]` · `digital-assets/[id]` · `events/[id]`
- `expense-reports/[id]` · `expenses/[id]` · `incidents/[id]` · `insurance-policies/[id]`
- `invoices/[id]` · `knowledge-base/[id]` · `leads/[id]` · `locations/[id]`
- `maintenance-schedules/[id]` · `milestones/[id]` · `obligations/[id]` · `opportunities/[id]`
- `people/[id]` · `permits/[id]` · `projects/[id]` · `proposals/[id]`
- `purchase-orders/[id]` · `purchase-requisitions/[id]` · `recurring-invoices/[id]`
- `scopes-of-work/[id]` · `service-requests/[id]` · `shipments/[id]`
- `tasks/[id]` · `tech-sheets/[id]` · `templates/[id]` · `vendor-reviews/[id]`
- `vendors/[id]` · `work-orders/[id]` · `workforce/[id]`
- _(plus remaining entity [id] pages)_

</details>

### B. Bespoke Detail Pages (4)

- `advancing/[id]` (344 lines) — Advancing item detail
- `approval-workflows/[id]` (295 lines) — Workflow designer
- `automations/[id]` (396 lines) — Automation rule builder
- `integrations/[id]` (372 lines) — Provider connection detail

### C. Form Pages Using `FormPageShell` (6)

- `assets/new` (161) · `crew/new` (119) · `vendors/new` (133)
- `projects/new` (111) · `projects/[id]/edit` (143)

### D. Bespoke Form Pages (5)

- `advancing/new` (81) · `contracts/new` (356) · `invoices/new` (401)
- `pipeline/new` (374) · `proposals/new` (882) · `templates/[id]/edit` (411)

### E. Bespoke Pages by Domain (74)

| Domain             | Pages                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Live Ops (17)**  | `page`, `crew`, `foh`, `environment`, `equipment`, `financials`, `gate`, `guest-incidents`, `readiness`, `reconciliation`, `reports`, `run-of-show`, `strike`, `vip`, `comms`, `credentials`, `departments`                                                                                                                                                                                                                                                               |
| **Settings (7)**   | `page`, `ai`, `security`, `org-security`, `email-integration`, `custom-fields`, `developer`                                                                                                                                                                                                                                                                                                                                                                               |
| **Advancing (6)**  | `catalog`, `fulfillment`, `inventory`, `queue`, `reports`, `templates`                                                                                                                                                                                                                                                                                                                                                                                                    |
| **Onboarding (4)** | `org-setup`, `billing`, `invite-team`, `claim-username`                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **User Mgmt (3)**  | `audit-log`, `access-reviews`, `invitations`                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **Workforce (3)**  | `goals`, `onboarding`, `reviews`                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Other (34)**     | `calendar`, `scheduling`, `resource-planner`, `org-chart`, `messages`, `dashboard`, `dashboards`, `roles`, `approvals`, `automations`, `scenarios`, `forecasting`, `compliance`, `vendor-compliance`, `vendor-portal`, `client-portal`, `data-export`, `system-health`, `service-requests/sla`, `credentials/assignments`, `knowledge-base/collaborative`, `projects/templates`, `time-tracking/*`, `reports/*`, `finance/*`, `home/*`, `integrations/*`, `assets/scan/*` |
