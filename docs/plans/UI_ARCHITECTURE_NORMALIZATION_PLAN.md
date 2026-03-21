# UI Architecture Normalization Plan

> **Version:** 1.0.0
> **Date:** 2026-03-18
> **Scope:** All 366 dashboard pages under `src/app/(dashboard)/`

---

## §1 — Executive Summary

The platform has **7 shell components** available but only **3 are broadly adopted**. 222 of 366 pages (60.7%) use `ListPageShell` — the strongest normalization success. However, **66 pages** (18%) remain either fully bespoke (17 pages with zero shell) or use the thin `PageShell` wrapper (49 pages) which provides almost no structural guarantees beyond a header and animation.

**Current shell coverage:**

| Shell                             | Pages  | %        | Status                                 |
| --------------------------------- | ------ | -------- | -------------------------------------- |
| `ListPageShell`                   | 222    | 60.7%    | ✅ Mature — config-driven, RBAC-gated  |
| `DetailPageShell`                 | 56     | 15.3%    | ✅ Mature — auto-fetch, tabs, chatter  |
| `OperationalDashboardShell`       | 16     | 4.4%     | ✅ Mature — stats, alerts, cards, tabs |
| `FormPageShell`                   | 6      | 1.6%     | ✅ Mature — underused                  |
| `PageShell` (legacy thin wrapper) | 49     | 13.4%    | ⚠️ Provides only header + animation    |
| `SettingsPageShell`               | 0      | 0%       | ⚠️ Built but zero consumers            |
| `WizardShell`                     | 0      | 0%       | ⚠️ Built but zero consumers            |
| **No shell at all**               | **17** | **4.6%** | 🔴 Fully bespoke                       |

**Target state:** 95%+ pages on a specialized shell. `PageShell` demoted to internal-only base primitive.

**Projected impact:**

- **~18,000 lines removed** (avg 275 lines/bespoke page × 66 pages)
- **Consistent RBAC gating** — 24 bespoke pages currently lack `PermissionGate`
- **Uniform density/responsiveness/a11y** — inherited from shells, not reimplemented per page
- **Config-driven pages** — business logic separated from layout concerns

---

## §2 — Complete Page Inventory

### 2.1 — Standardized Pages (300 pages, 82%)

#### ListPageShell — 222 pages

All entity list pages. Config-driven via `ListPageConfig` objects in `src/config/list-page-configs/`. Provides: RBAC gate, search, filters, multi-view (table/board/cards/calendar/timeline/gallery/map/workload/chart), export/import, create dialog, row actions, pagination, quick-view panel.

#### DetailPageShell — 56 pages

All `[id]` detail pages. Config-driven via `DetailPageConfig`. Provides: RBAC gate, auto-fetch by ID, tabs (overview + related entities + chatter), sidebar fields, stats, status badge, back navigation, messaging integration.

#### OperationalDashboardShell — 16 pages

All `live-ops/*` pages. Config-driven via `DashboardPageConfig`. Provides: RBAC gate, stats grid, alert banners, search, filters, tabs, card grid/list, empty state.

#### FormPageShell — 6 pages

`assets/new`, `contracts/new`, `crew/new`, `projects/new`, `projects/[id]/edit`, `vendors/new`. Config-driven via `FormPageConfig`. Provides: RBAC gate, section-based field grid, validation, Cmd+S, sticky action bar, wizard mode.

### 2.2 — Legacy PageShell Pages (49 pages, 13.4%)

These pages use `PageShell` from `@/components/layouts/page-shell` — a thin wrapper providing only `PageHeader` + `TabBar` + fade-in animation. All structural content (stats, cards, filters, tables, empty states) is reimplemented inline per page.

**Sorted by line count (descending):**

| Page                                      | Lines | Pattern                                                            | Target Shell                |
| ----------------------------------------- | ----- | ------------------------------------------------------------------ | --------------------------- |
| `settings/page.tsx`                       | 2,403 | Settings (5 tabs, profile/org/notifications/security/appearance)   | `SettingsPageShell`         |
| `settings/ai/page.tsx`                    | 1,082 | Settings (6 tabs, providers/models/prompts/usage/knowledge/limits) | `SettingsPageShell`         |
| `time-tracking/page.tsx`                  | 930   | Operational (4 tabs: daily/weekly/timer/invoicing + stats)         | `OperationalDashboardShell` |
| `scenarios/page.tsx`                      | 829   | Operational (card grid + comparison + filter)                      | `OperationalDashboardShell` |
| `approvals/page.tsx`                      | 708   | Operational (stats + lifecycle tabs + table + bulk actions)        | `OperationalDashboardShell` |
| `reports/page.tsx`                        | 618   | Operational (card grid + table + download)                         | `OperationalDashboardShell` |
| `calendar/page.tsx`                       | 584   | Tool/Scheduler (custom calendar grid)                              | Justified bespoke           |
| `forecasting/page.tsx`                    | 572   | Operational (4 tabs: revenue/util/budget/hiring + stats)           | `OperationalDashboardShell` |
| `scheduling/page.tsx`                     | 571   | Tool/Scheduler (timeline + drag)                                   | Justified bespoke           |
| `automations/page.tsx`                    | 553   | Operational (stats + card list + log table)                        | `OperationalDashboardShell` |
| `service-requests/sla/page.tsx`           | 498   | Operational (SLA timers + stats + card grid)                       | `OperationalDashboardShell` |
| `user-management/audit-log/page.tsx`      | 452   | List (filterable log table + stats)                                | `ListPageShell`             |
| `vendor-portal/page.tsx`                  | 445   | Portal (multi-tab dashboard)                                       | `OperationalDashboardShell` |
| `vendor-compliance/page.tsx`              | 356   | Operational (stats + card grid + filters)                          | `OperationalDashboardShell` |
| `templates/[id]/edit/page.tsx`            | 426   | Form (template editor)                                             | `FormPageShell`             |
| `settings/email-integration/page.tsx`     | 426   | Settings (3 tabs, config/rules/logs)                               | `SettingsPageShell`         |
| `messages/page.tsx`                       | 424   | Tool/Editor (messaging UI)                                         | Justified bespoke           |
| `dashboard/page.tsx`                      | 420   | Dashboard (widgets + activity)                                     | `OperationalDashboardShell` |
| `invoices/new/page.tsx`                   | 417   | Form (line items + totals)                                         | `FormPageShell`             |
| `client-portal/page.tsx`                  | 400   | Portal (multi-tab dashboard)                                       | `OperationalDashboardShell` |
| `pipeline/new/page.tsx`                   | 397   | Form (pipeline stage editor)                                       | `FormPageShell`             |
| `workforce/goals/page.tsx`                | 382   | Operational (card grid + stats)                                    | `OperationalDashboardShell` |
| `time-tracking/compliance/page.tsx`       | 382   | Operational (stats + card grid)                                    | `OperationalDashboardShell` |
| `roles/page.tsx`                          | 381   | Settings (permission matrix)                                       | `SettingsPageShell`         |
| `knowledge-base/collaborative/page.tsx`   | 376   | Tool/Editor (CRDT editor)                                          | Justified bespoke           |
| `settings/custom-fields/page.tsx`         | 359   | Settings (field editor)                                            | `SettingsPageShell`         |
| `finance/revenue-recognition/page.tsx`    | 353   | Operational (stats + table + timeline)                             | `OperationalDashboardShell` |
| `assets/scan/batch/page.tsx`              | 345   | Tool/Scanner (batch scan interface)                                | Justified bespoke           |
| `org-chart/page.tsx`                      | 334   | Tool/Visualizer (tree layout)                                      | Justified bespoke           |
| `live-ops/gate/page.tsx`                  | 329   | Tool/Scanner (gate scan interface)                                 | Justified bespoke           |
| `user-management/access-reviews/page.tsx` | 315   | Operational (card grid + stats)                                    | `OperationalDashboardShell` |
| `reports/ai/page.tsx`                     | 303   | Tool/Editor (NL query interface)                                   | Justified bespoke           |
| `finance/page.tsx`                        | 283   | Operational (stats + table)                                        | `OperationalDashboardShell` |
| `settings/notifications/page.tsx`         | 274   | Settings (toggle rows)                                             | `SettingsPageShell`         |
| `projects/templates/page.tsx`             | 274   | Operational (card grid)                                            | `OperationalDashboardShell` |
| `integrations/sync-log/page.tsx`          | 267   | List (filterable log table)                                        | `ListPageShell`             |
| `advancing/fulfillment/page.tsx`          | 266   | Operational (card list + scan actions)                             | `OperationalDashboardShell` |
| `assets/scan/page.tsx`                    | 256   | Tool/Scanner (scan interface)                                      | Justified bespoke           |
| `home/tasks/page.tsx`                     | 255   | Operational (time-horizon groups + stats)                          | `OperationalDashboardShell` |
| `integrations/marketplace/page.tsx`       | 233   | Operational (card grid + search + filters)                         | `OperationalDashboardShell` |
| `credentials/assignments/page.tsx`        | 229   | Operational (card grid + stats)                                    | `OperationalDashboardShell` |
| `user-management/invitations/page.tsx`    | 221   | Operational (card list + invite form)                              | `OperationalDashboardShell` |
| `advancing/catalog/page.tsx`              | 213   | Operational (catalog browser)                                      | `OperationalDashboardShell` |
| `advancing/reports/page.tsx`              | 207   | Operational (stats + card grid)                                    | `OperationalDashboardShell` |
| `home/documents/page.tsx`                 | 192   | Operational (card grid + stats)                                    | `OperationalDashboardShell` |
| `advancing/queue/page.tsx`                | 185   | Operational (card list + status filters)                           | `OperationalDashboardShell` |
| `advancing/inventory/page.tsx`            | 153   | Operational (card grid + stats)                                    | `OperationalDashboardShell` |
| `advancing/templates/page.tsx`            | 125   | Operational (card grid)                                            | `OperationalDashboardShell` |
| `advancing/new/page.tsx`                  | 81    | Form (catalog selection + cart)                                    | Justified bespoke           |

### 2.3 — Zero-Shell Pages (17 pages, 4.6%)

| Page                                 | Lines | Pattern                                     | Target Shell                |
| ------------------------------------ | ----- | ------------------------------------------- | --------------------------- |
| `proposals/new/page.tsx`             | 882   | Wizard (multi-step proposal builder)        | `WizardShell`               |
| `resource-planner/page.tsx`          | 541   | Tool/Scheduler (weekly grid)                | Justified bespoke           |
| `dashboards/page.tsx`                | 485   | Operational (4 tabs, widget grid)           | `OperationalDashboardShell` |
| `settings/org-security/page.tsx`     | 484   | Settings (security toggles + form)          | `SettingsPageShell`         |
| `settings/security/page.tsx`         | 477   | Settings (password + MFA + sessions)        | `SettingsPageShell`         |
| `onboarding/billing/page.tsx`        | 449   | Wizard (plan selection)                     | `WizardShell`               |
| `system-health/page.tsx`             | 431   | Operational (service status + alerts)       | `OperationalDashboardShell` |
| `settings/developer/page.tsx`        | 419   | Settings (3 tabs: API keys, webhooks, docs) | `SettingsPageShell`         |
| `onboarding/invite-team/page.tsx`    | 413   | Wizard (invite form)                        | `WizardShell`               |
| `onboarding/org-setup/page.tsx`      | 390   | Wizard (org creation form)                  | `WizardShell`               |
| `compliance/page.tsx`                | 372   | Operational (drift report + SOC2 checks)    | `OperationalDashboardShell` |
| `workforce/onboarding/page.tsx`      | 331   | Operational (run cards + stats + tabs)      | `OperationalDashboardShell` |
| `onboarding/claim-username/page.tsx` | 277   | Wizard (username claim)                     | `WizardShell`               |
| `workforce/reviews/page.tsx`         | 263   | Operational (review cards + stats)          | `OperationalDashboardShell` |
| `data-export/page.tsx`               | 228   | Operational (export requests + stats)       | `OperationalDashboardShell` |
| `onboarding/complete/page.tsx`       | 110   | Wizard (completion screen)                  | `WizardShell`               |
| `deals/page.tsx`                     | 10    | Redirect/wrapper                            | Investigate                 |

---

## §3 — Structural Pattern Analysis

Across all 66 non-standardized pages, **6 recurring patterns** emerge:

### Pattern A — Operational Dashboard (35 pages)

**Structure:** `PermissionGate` → `PageHeader` → `StatCard grid` → `Filter bar` → `TabBar` → `Card grid/list` or `DataTable` → `EmptyState`

**Already served by:** `OperationalDashboardShell`

**Pages matching:** approvals, automations, forecasting, finance, finance/revenue-recognition, reports, dashboard, dashboards, compliance, system-health, data-export, workforce/onboarding, workforce/reviews, workforce/goals, time-tracking, time-tracking/compliance, service-requests/sla, vendor-compliance, vendor-portal, client-portal, user-management/access-reviews, user-management/invitations, credentials/assignments, integrations/marketplace, projects/templates, home/tasks, home/documents, advancing/catalog, advancing/fulfillment, advancing/inventory, advancing/queue, advancing/reports, advancing/templates, scenarios

**Gap:** Most of these already match the `OperationalDashboardShell` API. Some need `contentSlot` for custom content sections (DataTable embed, comparison views).

### Pattern B — Settings Panel (8 pages)

**Structure:** `PermissionGate` → `PageHeader` → `TabBar` → `Card` per section → `SettingRow` toggles/selects/inputs

**Already served by:** `SettingsPageShell` (0 consumers!)

**Pages matching:** settings/page, settings/ai, settings/email-integration, settings/notifications, settings/custom-fields, settings/org-security, settings/security, settings/developer, roles

**Gap:** `SettingsPageShell` exists and is fully built but has zero adoption. The main settings page (2,403 lines) is the single largest page in the entire codebase. Every settings page manually implements the same tab + section + row pattern.

### Pattern C — Wizard/Onboarding (6 pages)

**Structure:** Step indicator → Single content area → Back/Next/Skip navigation → Validation

**Already served by:** `WizardShell` (0 consumers!)

**Pages matching:** onboarding/org-setup, onboarding/invite-team, onboarding/billing, onboarding/claim-username, onboarding/complete, proposals/new

**Gap:** `WizardShell` is fully built with step indicator, progress bar, validation, skip/back/cancel support. Zero pages use it. Every onboarding page manually implements its own step navigation.

### Pattern D — Form Page (3 additional pages)

**Structure:** `PermissionGate` → `PageHeader` → Field grid → Submit action

**Already served by:** `FormPageShell` (only 6 consumers)

**Pages matching:** invoices/new, pipeline/new, templates/[id]/edit

**Gap:** `FormPageShell` supports section-based layouts and wizard mode but only 6 pages use it. These 3 pages manually build forms that could be config-driven.

### Pattern E — Filterable Log/Table (2 pages)

**Structure:** `PageHeader` → Filters → `DataTable` → Stats

**Already served by:** `ListPageShell`

**Pages matching:** user-management/audit-log, integrations/sync-log

**Gap:** These are essentially list pages with custom columns. They could use `ListPageShell` with a `ListPageConfig`.

### Pattern F — Tool/Editor/Visualizer (12 pages, justified bespoke)

**Structure:** Highly custom interactive UIs that cannot be normalized into a config-driven shell.

**Pages:** calendar, scheduling, resource-planner, org-chart, messages, knowledge-base/collaborative, reports/ai, assets/scan, assets/scan/batch, live-ops/gate, advancing/new, deals (redirect)

**Verdict:** These pages are **legitimately bespoke**. Their UI requires custom interactivity (drag-and-drop, canvas rendering, real-time collaboration, camera/scanner access) that no shell can abstract.

---

## §4 — Gap Analysis: Shell Capabilities vs. Page Needs

### 4.1 — `SettingsPageShell` (0 consumers → 8-9 target)

**Current capabilities:**

- ✅ `PermissionGate` wrapper
- ✅ `PageHeader` with title/description/actions
- ✅ `TabBar` with URL-synced state
- ✅ Section renderer with `SettingRow` (toggle/select/input)
- ✅ Custom `content` slot per tab
- ✅ Density-aware spacing

**Missing for adoption:**

- ❌ No `SettingsPageConfig` type exists in `src/types/` (unlike `ListPageConfig`, `DetailPageConfig`, etc.)
- ❌ No config directory at `src/config/settings-page-configs/`
- ❌ Settings page needs `render()` override for complex sections (avatar upload, theme picker, password change, MFA management)
- ❌ No loading state handling

**Required work:**

1. Create `SettingsPageConfig` type in `src/types/settings-page-config.ts`
2. Create `src/config/settings-page-configs/` directory with per-page configs
3. Add `isLoading` prop to `SettingsPageShell`
4. Migrate 8 settings pages

### 4.2 — `WizardShell` (0 consumers → 6 target)

**Current capabilities:**

- ✅ Step indicator with icons
- ✅ Progress bar
- ✅ Step validation (sync + async)
- ✅ Skip/Back/Cancel navigation
- ✅ Controlled + uncontrolled modes
- ✅ `PermissionGate` optional wrapper

**Missing for adoption:**

- ❌ No `WizardConfig` directory/pattern (config defined inline per page)
- ❌ Onboarding pages use `useRouter` for step-to-step navigation (not step index)
- ❌ Some onboarding pages have side effects per step (API calls on "Continue")

**Required work:**

1. Create `src/config/wizard-configs/` directory
2. Onboarding pages need `onStepComplete` callback support (already present via `validate` + `onComplete`)
3. Migrate 6 wizard pages

### 4.3 — `OperationalDashboardShell` (16 consumers → 51 target)

**Current capabilities:**

- ✅ `PermissionGate` wrapper
- ✅ `PageHeader` with title/description/actions
- ✅ StatCard grid (auto-layout)
- ✅ Alert banners with severity + conditions
- ✅ Search + filter bar
- ✅ TabBar with URL-synced state
- ✅ Card grid/list with stagger animation
- ✅ Empty state
- ✅ `contentSlot` override
- ✅ `afterStatsSlot` / `afterCardsSlot`
- ✅ Children override

**Missing for adoption:**

- ❌ No support for embedded `DataTable` (some pages use both cards AND tables)
- ❌ No `DashboardPageConfig` configs exist yet (empty barrel at `src/config/dashboard-page-configs/`)
- ❌ Some pages need multiple card renderers per tab (currently only 1 `cardRenderer`)

**Required work:**

1. Create `DashboardPageConfig` objects in `src/config/dashboard-page-configs/`
2. Some complex pages (approvals, time-tracking) will use `contentSlot` or `tabs[].content` for custom sections
3. Migrate 35 pages

### 4.4 — `FormPageShell` (6 consumers → 9 target)

**Current capabilities:**

- ✅ Section-based field grid
- ✅ Wizard mode (step indicator built-in)
- ✅ 14 field types (text, email, tel, url, number, currency, date, datetime, textarea, select, checkbox, color, password, hidden)
- ✅ Transform helpers (camelCase↔snake_case)
- ✅ Cmd+S keyboard shortcut
- ✅ Sticky action bar
- ✅ Validation
- ✅ `contentSlot` / `footerSlot`

**Missing for adoption:**

- ❌ No repeater/line-item field type (needed for invoices/new, pipeline/new)
- ❌ No rich text field type (needed for templates/[id]/edit)

**Required work:**

1. Add `repeater` field type to `FormFieldDef` for line-item forms
2. Add `richtext` field type or use `contentSlot` for editor
3. Migrate 3 pages

### 4.5 — `ListPageShell` (222 consumers → 224 target)

Already mature. 2 additional pages could be migrated:

- `user-management/audit-log` — filterable log table
- `integrations/sync-log` — filterable log table

---

## §5 — Normalization Roadmap

### Phase 1 — Zero-effort wins: Adopt built shells (Weeks 1-2)

**Impact: 8 pages, ~3,500 lines removed**

Migrate settings pages to `SettingsPageShell` — the shell is already built and matches the pattern exactly.

| Page                                  | Lines | Complexity                                 |
| ------------------------------------- | ----- | ------------------------------------------ |
| `settings/notifications/page.tsx`     | 274   | Low — pure toggle rows                     |
| `settings/developer/page.tsx`         | 419   | Medium — API key management tabs           |
| `settings/org-security/page.tsx`      | 484   | Medium — form + toggles                    |
| `settings/security/page.tsx`          | 477   | Medium — password + MFA                    |
| `settings/email-integration/page.tsx` | 426   | Medium — 3 tabs                            |
| `settings/custom-fields/page.tsx`     | 359   | Medium — field editor                      |
| `settings/ai/page.tsx`                | 1,082 | High — 6 tabs, CRUD for providers/models   |
| `settings/page.tsx`                   | 2,403 | High — 5 tabs, theme picker, avatar upload |

**Prerequisites:**

1. Create `SettingsPageConfig` type with `isLoading` support
2. Create config files in `src/config/settings-page-configs/`
3. `SettingsPageShell` already handles `render()` override per row — complex sections (avatar, theme picker) use `tab.content` slot

### Phase 2 — Wizard adoption (Week 2-3)

**Impact: 6 pages, ~2,000 lines removed**

Migrate onboarding and proposal pages to `WizardShell`.

| Page                                 | Lines | Complexity                         |
| ------------------------------------ | ----- | ---------------------------------- |
| `onboarding/complete/page.tsx`       | 110   | Low — single step                  |
| `onboarding/claim-username/page.tsx` | 277   | Low — single form + validation     |
| `onboarding/org-setup/page.tsx`      | 390   | Medium — multi-field form          |
| `onboarding/invite-team/page.tsx`    | 413   | Medium — dynamic row form          |
| `onboarding/billing/page.tsx`        | 449   | Medium — plan selection cards      |
| `proposals/new/page.tsx`             | 882   | High — multi-step proposal builder |

### Phase 3 — OperationalDashboardShell expansion (Weeks 3-6)

**Impact: 35 pages, ~11,000 lines removed**

Create `DashboardPageConfig` objects and migrate pages. Organized by complexity:

**Tier 1 — Direct migration (stats + cards, no custom content): 18 pages**

- `data-export`, `workforce/reviews`, `workforce/onboarding`, `compliance`, `system-health`, `workforce/goals`, `user-management/access-reviews`, `user-management/invitations`, `vendor-compliance`, `credentials/assignments`, `home/tasks`, `home/documents`, `integrations/marketplace`, `projects/templates`, `advancing/catalog`, `advancing/inventory`, `advancing/queue`, `advancing/templates`

**Tier 2 — Tabs + contentSlot needed: 12 pages**

- `dashboards`, `forecasting`, `automations`, `time-tracking`, `time-tracking/compliance`, `service-requests/sla`, `approvals`, `scenarios`, `advancing/fulfillment`, `advancing/reports`, `vendor-portal`, `client-portal`

**Tier 3 — Complex (embedded DataTable + custom sections): 5 pages**

- `reports`, `finance`, `finance/revenue-recognition`, `dashboard`, `roles` (permission matrix → SettingsPageShell)

### Phase 4 — FormPageShell expansion (Week 6-7)

**Impact: 3 pages, ~1,240 lines removed**

| Page                           | Lines | Prerequisite                         |
| ------------------------------ | ----- | ------------------------------------ |
| `templates/[id]/edit/page.tsx` | 426   | `contentSlot` for rich editor        |
| `invoices/new/page.tsx`        | 417   | `repeater` field type for line items |
| `pipeline/new/page.tsx`        | 397   | `repeater` field type for stages     |

### Phase 5 — ListPageShell stragglers (Week 7)

**Impact: 2 pages, ~720 lines removed**

| Page                                 | Lines | Action                                    |
| ------------------------------------ | ----- | ----------------------------------------- |
| `user-management/audit-log/page.tsx` | 452   | Create `ListPageConfig` with log columns  |
| `integrations/sync-log/page.tsx`     | 267   | Create `ListPageConfig` with sync columns |

### Phase 6 — PageShell deprecation (Week 8)

After all migrations, `PageShell` should have zero direct consumers in page files. Mark it as `@internal` — it remains as a base primitive used inside specialized shells, but pages must never import it directly.

---

## §6 — Justified Bespoke Pages (12 pages — No migration)

These pages have UI requirements that cannot be normalized into a config-driven shell:

| Page                                    | Lines | Justification                                            |
| --------------------------------------- | ----- | -------------------------------------------------------- |
| `calendar/page.tsx`                     | 584   | Custom month/week/day calendar grid with date navigation |
| `scheduling/page.tsx`                   | 571   | Timeline/Gantt-style drag scheduler                      |
| `resource-planner/page.tsx`             | 541   | Weekly resource allocation grid with utilization heatmap |
| `messages/page.tsx`                     | 424   | Real-time messaging UI (sidebar + chat + thread panels)  |
| `org-chart/page.tsx`                    | 334   | Tree visualization with expandable nodes                 |
| `live-ops/gate/page.tsx`                | 329   | Real-time gate scanning interface                        |
| `assets/scan/batch/page.tsx`            | 345   | Batch barcode/QR scanning with camera                    |
| `assets/scan/page.tsx`                  | 256   | Single-asset scanning interface                          |
| `reports/ai/page.tsx`                   | 303   | NL query → report generation interface                   |
| `knowledge-base/collaborative/page.tsx` | 376   | Collaborative document editor                            |
| `advancing/new/page.tsx`                | 81    | Catalog browser + cart flow                              |
| `deals/page.tsx`                        | 10    | Thin wrapper (investigate if needed)                     |

**Recommendation:** These 12 pages should still use a minimal structural wrapper (`PageShell` or direct `PermissionGate` + `PageHeader`) for consistent header/animation/RBAC behavior. But their content areas are legitimately custom.

---

## §7 — Shell Enhancement Requirements

### 7.1 — SettingsPageShell Enhancements

| Enhancement                                       | Priority | Effort |
| ------------------------------------------------- | -------- | ------ |
| Add `isLoading` prop with `LoadingState` fallback | P0       | 0.5d   |
| Create `SettingsPageConfig` type definition       | P0       | 0.5d   |
| Add `headerActions` to config type                | P1       | 0.25d  |

### 7.2 — OperationalDashboardShell Enhancements

| Enhancement                                                                               | Priority | Effort |
| ----------------------------------------------------------------------------------------- | -------- | ------ |
| Create `DashboardPageConfig` definitions (barrel at `src/config/dashboard-page-configs/`) | P0       | 2d     |
| Support per-tab `cardRenderer` (different renderers per tab)                              | P1       | 0.5d   |
| Add `headerSlot` for custom header sections (timer, create button)                        | P1       | 0.25d  |

### 7.3 — FormPageShell Enhancements

| Enhancement                                                   | Priority | Effort |
| ------------------------------------------------------------- | -------- | ------ |
| Add `repeater` field type for line-item arrays                | P1       | 1.5d   |
| Add `richtext` field type (or document `contentSlot` pattern) | P2       | 1d     |

### 7.4 — WizardShell Enhancements

| Enhancement                                     | Priority | Effort |
| ----------------------------------------------- | -------- | ------ |
| Add `onStepComplete(stepIndex)` async callback  | P1       | 0.5d   |
| Create `WizardConfig` objects pattern/directory | P1       | 0.5d   |

---

## §8 — Migration Protocol

Every page migration MUST follow this checklist:

1. **Create config object** — Extract title, description, resource, stats, filters, tabs into a declarative config in the appropriate `src/config/*-configs/` directory
2. **Verify RBAC** — Ensure `resource` + `action` are set correctly (check against `rbac.ts`)
3. **Preserve custom content** — Use `contentSlot`, `afterStatsSlot`, `tabs[].content`, or `children` for sections that don't fit the shell's default rendering
4. **Preserve hooks** — Keep all data-fetching hooks; pass data via `data=` prop or inline in slots
5. **Preserve mutations** — Keep all mutation hooks and wire them through config `headerActions` or slot content
6. **Remove duplicate imports** — Shell provides `Card`, `Badge`, `StatCard`, `SearchInput`, `EmptyState` internally
7. **Verify density tokens** — Shell inherits `density-gap-page`, `density-gap-section`, etc. Remove any hardcoded spacing
8. **Verify responsive** — Shell handles responsive grid automatically. Remove manual breakpoint classes
9. **Run `tsc --noEmit`** — Zero new errors
10. **Run `eslint`** — Zero new errors

---

## §9 — Projected Outcomes

### Before (current state):

| Metric                                     | Value      |
| ------------------------------------------ | ---------- |
| Total pages                                | 366        |
| Standardized (specialized shell)           | 300 (82%)  |
| PageShell (thin wrapper)                   | 49 (13.4%) |
| Zero shell                                 | 17 (4.6%)  |
| Settings pages on SettingsPageShell        | 0          |
| Wizard pages on WizardShell                | 0          |
| Total bespoke LOC (PageShell + NONE pages) | ~22,400    |
| Pages without PermissionGate               | 24         |

### After (target state):

| Metric                                    | Value                     |
| ----------------------------------------- | ------------------------- |
| Total pages                               | 366                       |
| Standardized (specialized shell)          | 354 (96.7%)               |
| Justified bespoke                         | 12 (3.3%)                 |
| PageShell direct consumers                | 0 (deprecated from pages) |
| Zero shell                                | 0                         |
| Settings pages on SettingsPageShell       | 8-9                       |
| Wizard pages on WizardShell               | 6                         |
| OpDash pages on OperationalDashboardShell | 51                        |
| Total bespoke LOC removed                 | ~18,460                   |
| Pages without PermissionGate              | 0                         |

### Shell coverage matrix (target):

| Shell                       | Current | Target | Δ    |
| --------------------------- | ------- | ------ | ---- |
| `ListPageShell`             | 222     | 224    | +2   |
| `DetailPageShell`           | 56      | 56     | +0   |
| `OperationalDashboardShell` | 16      | 51     | +35  |
| `FormPageShell`             | 6       | 9      | +3   |
| `SettingsPageShell`         | 0       | 8-9    | +8-9 |
| `WizardShell`               | 0       | 6      | +6   |
| Justified bespoke           | 66      | 12     | −54  |

---

## §10 — Effort Estimate

| Phase                 | Pages  | Shell Enhancements                 | Migration LOC Saved | Effort (person-days) |
| --------------------- | ------ | ---------------------------------- | ------------------- | -------------------- |
| Phase 1 — Settings    | 8      | SettingsPageConfig type, isLoading | ~5,900              | 6d                   |
| Phase 2 — Wizards     | 6      | onStepComplete callback            | ~2,000              | 4d                   |
| Phase 3 — OpDash      | 35     | DashboardPageConfig configs        | ~11,000             | 12d                  |
| Phase 4 — Forms       | 3      | repeater field type                | ~1,240              | 3d                   |
| Phase 5 — Lists       | 2      | None                               | ~720                | 1d                   |
| Phase 6 — Deprecation | 0      | PageShell @internal                | 0                   | 0.5d                 |
| **Total**             | **54** |                                    | **~18,460**         | **~26.5d**           |

---

## §11 — Quality Gates

Each phase must pass before proceeding:

- [ ] `tsc --noEmit` — 0 new errors
- [ ] `eslint` — 0 new errors
- [ ] All migrated pages render identically (visual regression)
- [ ] All RBAC gates verified against `rbac.ts` matrix
- [ ] All density tokens inherited (no hardcoded spacing)
- [ ] All responsive behavior preserved
- [ ] Config objects in appropriate `src/config/*-configs/` directory
- [ ] No `PageShell` imports remain in migrated pages
- [ ] `CHANGELOG.md` updated per phase

---

## Appendix A — File Counts by Shell (Full Data)

```
ListPageShell:                222 pages
DetailPageShell:               56 pages
PageShell (legacy wrapper):    49 pages
NONE (zero shell):             17 pages
OperationalDashboardShell:     16 pages
FormPageShell:                  6 pages
SettingsPageShell:              0 pages
WizardShell:                    0 pages
─────────────────────────────────────
TOTAL:                        366 pages
```

## Appendix B — Largest Bespoke Pages (Top 20)

```
 2,403 lines  PageShell  settings/page.tsx
 1,082 lines  PageShell  settings/ai/page.tsx
   930 lines  PageShell  time-tracking/page.tsx
   882 lines  NONE       proposals/new/page.tsx
   829 lines  PageShell  scenarios/page.tsx
   708 lines  PageShell  approvals/page.tsx
   618 lines  PageShell  reports/page.tsx
   584 lines  PageShell  calendar/page.tsx
   572 lines  PageShell  forecasting/page.tsx
   571 lines  PageShell  scheduling/page.tsx
   553 lines  PageShell  automations/page.tsx
   541 lines  NONE       resource-planner/page.tsx
   498 lines  PageShell  service-requests/sla/page.tsx
   485 lines  NONE       dashboards/page.tsx
   484 lines  NONE       settings/org-security/page.tsx
   477 lines  NONE       settings/security/page.tsx
   452 lines  PageShell  user-management/audit-log/page.tsx
   449 lines  NONE       onboarding/billing/page.tsx
   445 lines  PageShell  vendor-portal/page.tsx
   431 lines  NONE       system-health/page.tsx
```

## Appendix C — Shell Component Source Files

| Shell                       | Source                                                  | Config Type           | Config Directory                             |
| --------------------------- | ------------------------------------------------------- | --------------------- | -------------------------------------------- |
| `ListPageShell`             | `src/components/shells/list-page-shell.tsx`             | `ListPageConfig`      | `src/config/list-page-configs/`              |
| `DetailPageShell`           | `src/components/shells/detail-page-shell.tsx`           | `DetailPageConfig`    | Inline per page                              |
| `OperationalDashboardShell` | `src/components/shells/operational-dashboard-shell.tsx` | `DashboardPageConfig` | `src/config/dashboard-page-configs/` (empty) |
| `FormPageShell`             | `src/components/shells/form-page-shell.tsx`             | `FormPageConfig`      | Inline per page                              |
| `SettingsPageShell`         | `src/components/shells/settings-page-shell.tsx`         | `SettingsPageConfig`  | None (to create)                             |
| `WizardShell`               | `src/components/shells/wizard-shell.tsx`                | `WizardConfig`        | None (to create)                             |
| `PageShell` (legacy)        | `src/components/layouts/page-shell.tsx`                 | None                  | N/A                                          |
