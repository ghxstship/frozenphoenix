# IA Refactoring Plan — Zero-Bespoke Architecture

**Date:** 2026-03-20 (v2)
**Scope:** Every page in the Information Architecture — 0 bespoke pages remaining
**Baseline:** 0 TypeScript errors, 0 ESLint errors, 100% API wiring, 100% RSC compliance
**Goal:** Every single page renders through one of 7 standardized shell components. No page contains raw `PageHeader` + ad-hoc JSX scaffolding. Every page is a config object + shell.

---

## Current Architectural Inventory

| Shell                                                   | Pages  | Status                              |
| ------------------------------------------------------- | ------ | ----------------------------------- |
| `ListPageShell` (pure RSC via `configKey`)              | ~216   | ✅ Config-driven                    |
| `DetailPageShell` (via `DetailPageConfig`)              | ~113   | ✅ Config-driven                    |
| `OperationalDashboardShell` (via `DashboardPageConfig`) | 53     | ✅ Config-driven                    |
| `FormPageShell` (via `FormPageConfig`)                  | 7      | ✅ Config-driven                    |
| `SettingsPageShell` (via `SettingsPageConfig`)          | 5      | ✅ Config-driven                    |
| `WizardShell` (via `WizardConfig`)                      | 2      | ✅ Config-driven                    |
| `ListPageShell` (client `_client.tsx`)                  | 7      | ✅ Config-driven (with extra hooks) |
| **BESPOKE (no shell)**                                  | **20** | ❌ Must migrate                     |

**Total pages: ~423. Pages on shells: 403. Pages without a shell: 20.**

---

## The 20 Bespoke Pages — Classification & Target Shell

Every bespoke page must be classified into one of the 7 existing shells, or into a new shell type if no existing shell can express the page's pattern declaratively.

### Group A — `OperationalDashboardShell` Candidates (7 pages)

These pages already follow the "PageHeader → StatCards → filter/search → card grid" pattern. They just hand-roll it instead of using the shell.

| Page                                                 | Current Pattern                                       | Migration Notes                                                              |
| ---------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------- |
| `data-export/_client.tsx` (228 LOC)                  | Stats → export request list → create                  | Config: stats compute from data, cardRenderer for request list               |
| `knowledge-base/collaborative/_client.tsx` (377 LOC) | Stats → document list → editor grid                   | Config: stats, cardRenderer for doc rows, afterCardsSlot for version history |
| `reports/ai/_client.tsx` (304 LOC)                   | Stats → NL query input → result cards                 | Config: afterStatsSlot for query input, cardRenderer for results             |
| `resource-planner/_client.tsx` (539 LOC)             | Stats → week navigator → booking grid                 | Config: tabs for week nav, contentSlot for booking grid                      |
| `scheduling/_client.tsx` (572 LOC)                   | Stats → SegmentedControl → schedule/utilization/gantt | Config: tabs for 3 views, contentSlot per tab                                |
| `calendar/_client.tsx` (803 LOC)                     | Stats → SegmentedControl → month/week/day views       | Config: tabs for view modes, contentSlot per tab                             |
| `org-chart/_client.tsx` (335 LOC)                    | PageHeader → DnD tree grid                            | Config: contentSlot for tree, no stats/filters needed                        |

### Group B — `SettingsPageShell` Candidates (2 pages)

These pages follow the "PageHeader → card sections with form controls" pattern.

| Page                                          | Current Pattern                                                | Migration Notes                                                                                              |
| --------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `settings/security/_client.tsx` (477 LOC)     | Cards for password change, MFA, sessions                       | Config: 3 sections with `content` slot for each card (password change needs custom JSX; use section.content) |
| `settings/org-security/_client.tsx` (483 LOC) | Cards for MFA policy, SSO, domain restrictions, session limits | Config: single tab with sections for each policy area, rows for toggles/inputs                               |

### Group C — `WizardShell` Candidates (5 pages)

These pages follow multi-step flows or complex form-like interactions.

| Page                                               | Current Pattern                               | Migration Notes                                                                  |
| -------------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------- |
| `onboarding/org-setup/_client.tsx` (374 LOC)       | Multi-section org creation form               | Config: steps for org name → industry → timezone → role, `onComplete` → API call |
| `onboarding/invite-team/_client.tsx` (~200 LOC)    | Email list → role assignment → send           | Config: steps for add emails → assign roles → review/send                        |
| `onboarding/billing/_client.tsx` (~250 LOC)        | Plan selection → payment → confirmation       | Config: steps for plan → payment → confirm                                       |
| `onboarding/claim-username/_client.tsx` (~150 LOC) | Username input → availability check → confirm | Config: single-step wizard or FormPageShell with validation                      |
| `onboarding/complete/_client.tsx` (~80 LOC)        | Completion confirmation → redirect            | Config: single-step wizard with onComplete redirect, or static content page      |

**Note:** Onboarding pages intentionally omit `PermissionGate`. `WizardConfig.resource` is optional, so these set `resource: undefined`.

### Group D — `FormPageShell` Candidates (1 page)

| Page                                 | Current Pattern                  | Migration Notes                                                                                                                                                                                                                       |
| ------------------------------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `advancing/new/_client.tsx` (77 LOC) | Browse catalog → cart → checkout | Currently uses custom `CatalogBrowser` + `AdvanceCart` + `AdvanceCheckout` components. **Migrate to `FormPageShell` with `layout: "wizard"` and 3 steps:** browse (content slot), review cart (content slot), checkout (content slot) |

### Group E — Specialized Pages Requiring Shell Extension (5 pages)

These pages have unique interaction models that don't fit cleanly into existing shells. Rather than keeping them bespoke, we extend the shell system.

| Page                                        | Current Pattern                                           | Proposed Solution                                                                                                                                                                                                                                                                      |
| ------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `messages/_client.tsx` (449 LOC)            | 3-pane messaging: conversation list + chat + thread panel | **New: `MessagingShell`** — config-driven 3-pane layout. This is the only messaging page, so the "shell" is really a dedicated layout component that all messaging sub-views compose through. Alternatively, use `OperationalDashboardShell` with `contentSlot` for the 3-pane layout. |
| `templates/[id]/edit/_client.tsx` (424 LOC) | Block editor with drag-and-drop, preview toggle           | **Use `FormPageShell` with `layout: "sections"`** — template name/metadata as fields, `afterSectionsSlot` for the block editor. Or use `OperationalDashboardShell` with `contentSlot`.                                                                                                 |
| `assets/scan/_client.tsx` (259 LOC)         | Scan input → result display → action                      | **Use `OperationalDashboardShell`** with `contentSlot` for scanner UI. Stats: total scans, success rate.                                                                                                                                                                               |
| `assets/scan/batch/_client.tsx` (351 LOC)   | Scan input → queue → batch submit                         | **Use `OperationalDashboardShell`** with `contentSlot` for batch scanner + queue table. Stats: queued, submitted, failed.                                                                                                                                                              |
| `live-ops/gate/_client.tsx` (334 LOC)       | Scan input → credential check → history                   | **Use `OperationalDashboardShell`** with `contentSlot` for gate scanner UI. Stats: scanned today, denied, flagged.                                                                                                                                                                     |

---

## Shell System Completeness After Migration

| Shell                       | Config Type                    | Current | After Migration | Total   |
| --------------------------- | ------------------------------ | ------- | --------------- | ------- |
| `ListPageShell`             | `ListPageConfig` / `configKey` | 223     | 223             | 223     |
| `DetailPageShell`           | `DetailPageConfig`             | 113     | 113             | 113     |
| `OperationalDashboardShell` | `DashboardPageConfig`          | 53      | **65** (+12)    | 65      |
| `FormPageShell`             | `FormPageConfig`               | 7       | **9** (+2)      | 9       |
| `SettingsPageShell`         | `SettingsPageConfig`           | 5       | **7** (+2)      | 7       |
| `WizardShell`               | `WizardConfig`                 | 2       | **6** (+4)      | 6       |
| **BESPOKE**                 | —                              | **20**  | **0**           | **0**   |
| **Total**                   |                                | **423** | **423**         | **423** |

---

## Execution Plan

### Phase 1 — Infrastructure Hardening (Day 1)

Fix correctness bugs that affect all pages regardless of shell.

#### 1.1 Client-Side ID Generation (2 files)

| File                        | Fix                                      |
| --------------------------- | ---------------------------------------- |
| `invoices/new/_client.tsx`  | Read `invoice_number` from POST response |
| `vendor-portal/_client.tsx` | Read `invoice_number` column from record |

#### 1.2 StatCard Hardcoded `change={}` Removal

Disambiguate StatCard `change` from form `onChange`. For actual StatCard `change` props with static numbers (~12 instances in ~5 files), either:

- Wire to `computePeriodChange()` utility with real data
- Remove the prop entirely

#### 1.3 `cursor-pointer` Dead Clicks (26 files, 32 instances)

Wire to `<Link>` or remove `cursor-pointer`. Pages migrating to `OperationalDashboardShell` in Phase 3 will get this for free via `cardRenderer` click handling.

#### 1.4 `.toUpperCase()` Enum Display → Label Maps (8 files)

Replace with domain-config label maps. Keep `.toUpperCase()` only for avatar initials.

#### 1.5 Unused Hook Assignments (~22 files)

Remove `const _varName = useHook()` where the result is unconsumed and has no side effects.

#### 1.6 `EmptyRow` Extraction (3 files → 1 shared component)

Create `src/components/ui/empty-row.tsx`, replace inline duplicates.

---

### Phase 2 — Design System Normalization (Days 2-3)

Eliminate all hardcoded spacing, padding, and font sizes so the density token system governs every page.

#### 2.1 Density Spacing Tokens (57+37+4 files)

| Pattern              | Target                      | Instances           |
| -------------------- | --------------------------- | ------------------- |
| `space-y-6`          | `density-gap-page`          | 100 across 57 files |
| `space-y-4`          | `density-gap-section`       | included above      |
| `gap-4` (stat grids) | `density-gap-stat-grid`     | 52 across 37 files  |
| `gap-4` (card grids) | `density-gap-card-grid`     | included above      |
| `gap-6` (page grids) | `density-gap-page`          | included above      |
| `p-6` / `p-4 lg:p-6` | `--density-container-px/py` | 4 files             |

#### 2.2 Density Typography Tokens (81 files, 345 instances)

Add to `globals.css`:

```css
.density-text-caption {
  font-size: var(--density-caption-size);
}
.density-text-micro {
  font-size: var(--density-micro-size);
}
```

Migrate: `text-[10px]` → `density-text-caption`, `text-[9px]`/`text-[8px]` → `density-text-micro`.

#### 2.3 Shell Internal Spacing Fix

`settings-page-shell.tsx` lines 167, 181: `space-y-6` → `density-gap-page`.

---

### Phase 3 — Zero-Bespoke Migration (Days 4-8)

**This is the core phase.** Every bespoke `_client.tsx` is rewritten as a config object + shell invocation.

#### 3.1 Group A → `OperationalDashboardShell` (7 pages)

Each page gets a `DashboardPageConfig` object. The shell's existing `contentSlot`, `tabs`, `cardRenderer`, and `afterStatsSlot` escape hatches accommodate all variations.

**Migration pattern for each page:**

```tsx
// BEFORE (bespoke)
export function CalendarPageClient() {
    // 800 lines of PageHeader, StatCard, SegmentedControl, custom JSX...
}

// AFTER (config-driven)
const CONFIG: DashboardPageConfig = {
    resource: "calendar",
    title: "Calendar",
    description: "...",
    stats: [...],
    tabs: [
        { id: "month", label: "Month", content: <MonthView /> },
        { id: "week", label: "Week", content: <WeekView /> },
        { id: "day", label: "Day", content: <DayView /> },
    ],
};

export function CalendarPageClient() {
    const { data, isLoading } = useCalendarEvents();
    return <OperationalDashboardShell config={CONFIG} data={data} isLoading={isLoading} />;
}
```

**File-by-file migration order:**

| #   | Page                                       | LOC | Config Strategy                                                 |
| --- | ------------------------------------------ | --- | --------------------------------------------------------------- |
| 1   | `org-chart/_client.tsx`                    | 335 | `contentSlot` for DnD tree. Simplest — no stats/filters.        |
| 2   | `data-export/_client.tsx`                  | 228 | `stats` + `cardRenderer` for export list                        |
| 3   | `reports/ai/_client.tsx`                   | 304 | `afterStatsSlot` for NL query, `cardRenderer` for results       |
| 4   | `resource-planner/_client.tsx`             | 539 | `tabs` for week nav views, `contentSlot` per tab                |
| 5   | `scheduling/_client.tsx`                   | 572 | `tabs` for schedule/utilization/gantt views                     |
| 6   | `calendar/_client.tsx`                     | 803 | `tabs` for month/week/day/agenda views                          |
| 7   | `knowledge-base/collaborative/_client.tsx` | 377 | `stats` + `cardRenderer` + `afterCardsSlot` for version history |

**Subtask:** Extract view-specific JSX (e.g., `MonthView`, `WeekView`, `GanttView`, `UtilizationView`) into dedicated components in `src/components/` so the config's `content` slots are clean single-component references.

#### 3.2 Group B → `SettingsPageShell` (2 pages)

| #   | Page                                | Config Strategy                                                                                                                              |
| --- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `settings/org-security/_client.tsx` | Single tab, sections for MFA/SSO/domains/sessions. Toggles and inputs map directly to `SettingsRowDef`.                                      |
| 2   | `settings/security/_client.tsx`     | Tabs: "Password", "MFA", "Sessions". Each tab uses `section.content` for the custom form UI (password fields, MFA enrollment, session list). |

#### 3.3 Group C → `WizardShell` (5 pages)

| #   | Page                                    | Config Strategy                                                                                    |
| --- | --------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 1   | `onboarding/claim-username/_client.tsx` | 2 steps: enter username → confirm. `resource: undefined` (no RBAC).                                |
| 2   | `onboarding/complete/_client.tsx`       | 1 step: completion message. `onComplete` redirects to dashboard.                                   |
| 3   | `onboarding/org-setup/_client.tsx`      | 4 steps: name/slug → industry/size → timezone → role. `onComplete` → POST to `/api/organizations`. |
| 4   | `onboarding/invite-team/_client.tsx`    | 3 steps: add emails → assign roles → send invitations.                                             |
| 5   | `onboarding/billing/_client.tsx`        | 3 steps: plan selection → payment method → confirmation.                                           |

#### 3.4 Group D → `FormPageShell` (1 page)

| #   | Page                        | Config Strategy                                                                                                                                                                 |
| --- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `advancing/new/_client.tsx` | `layout: "wizard"`, steps: browse (CatalogBrowser content), review cart (AdvanceCart content), checkout (AdvanceCheckout content). `transformSubmit` creates the advance order. |

#### 3.5 Group E → `OperationalDashboardShell` with `contentSlot` (5 pages)

These specialized pages use the dashboard shell's escape hatch for their unique UIs.

| #   | Page                              | Config Strategy                                                                       |
| --- | --------------------------------- | ------------------------------------------------------------------------------------- |
| 1   | `assets/scan/_client.tsx`         | `stats` (scans today, success rate), `contentSlot` for `<ScanInput>` + result display |
| 2   | `assets/scan/batch/_client.tsx`   | `stats` (queued, submitted, errors), `contentSlot` for batch scanner + queue table    |
| 3   | `live-ops/gate/_client.tsx`       | `stats` (scanned, denied, flagged), `contentSlot` for gate scanner + history          |
| 4   | `messages/_client.tsx`            | `contentSlot` for 3-pane messaging layout. No stats (messaging doesn't need KPIs).    |
| 5   | `templates/[id]/edit/_client.tsx` | `contentSlot` for block editor + preview. `headerActions` for Save/Preview toggle.    |

---

### Phase 4 — Config Registry & Lazy Loading (Day 9)

After all pages are on shells, centralize configs for discoverability and code-split.

#### 4.1 Dashboard Page Config Registry

Mirror the `ListPageConfig` registry pattern:

- Create `src/config/dashboard-page-configs/` directory
- One file per domain (production, operations, finance, etc.)
- Barrel export from `src/config/dashboard-page-configs/index.ts`
- `OperationalDashboardShell` accepts `configKey` in addition to `config`
- Lazy-load configs on navigation (same pattern as `resolveListPageConfig`)

#### 4.2 Settings Page Config Registry

- Create `src/config/settings-page-configs/` directory
- Consolidate all 7 `SettingsPageConfig` objects

#### 4.3 Wizard Config Registry

- Create `src/config/wizard-configs/` directory
- Consolidate all 6 `WizardConfig` objects

#### 4.4 Form Page Config Registry

- Create `src/config/form-page-configs/` directory
- Consolidate all 9 `FormPageConfig` objects

---

### Phase 5 — RBAC Hardening (Day 10)

#### 5.1 Shell-Level PermissionGate Audit

Verify every shell enforces `PermissionGate` internally:

- ✅ `OperationalDashboardShell` — has PermissionGate
- ✅ `SettingsPageShell` — has PermissionGate
- ✅ `ListPageShell` — has PermissionGate
- ✅ `DetailPageShell` — has PermissionGate
- ⬜ `FormPageShell` — verify and add if missing
- ⬜ `WizardShell` — verify and add if missing (skip for `resource: undefined`)

**After this phase, RBAC is structurally guaranteed** — no page can render without passing through a shell that enforces PermissionGate. This eliminates the need to audit individual pages for PermissionGate coverage.

---

### Phase 6 — i18n Migration (Weeks 2-5)

#### 6.1 Shell-Level i18n (1 day)

Because every page now renders through a shell, i18n for structural text (headings, buttons, empty states) is centralized:

| Shell                       | Hardcoded Strings                           | Fix                          |
| --------------------------- | ------------------------------------------- | ---------------------------- |
| `ListPageShell`             | "No results", "Search...", "Showing X of Y" | `useTranslation('common')`   |
| `DetailPageShell`           | "Overview", "Activity", "Back"              | `useTranslation('common')`   |
| `FormPageShell`             | "Submit", "Cancel", "Required"              | `useTranslation('common')`   |
| `SettingsPageShell`         | "On", "Off"                                 | `useTranslation('settings')` |
| `WizardShell`               | "Continue", "Back", "Complete", "Skip"      | `useTranslation('common')`   |
| `OperationalDashboardShell` | "Search...", "No data"                      | `useTranslation('common')`   |

**Impact:** Fixing 7 shell files covers structural strings for ALL 423 pages.

#### 6.2 Config-Level i18n (Weeks 2-4)

Each config object's `title`, `description`, stat `label`, filter `label`, column `header`, and field `label` strings need i18n keys.

**Strategy:** Add an optional `titleKey`/`descriptionKey` pattern to config types, where the shell resolves via `t(titleKey) ?? title`. This allows incremental migration — configs without keys fall back to the static English string.

#### 6.3 Navigation Config i18n (Week 5)

`src/config/navigation.ts` section/item titles → `translate("nav", key)`.

---

### Phase 7 — Enforcement & Prevention (Continuous)

#### 7.1 ESLint Rules

| Rule                                                                     | Target                  | Purpose                                                |
| ------------------------------------------------------------------------ | ----------------------- | ------------------------------------------------------ |
| Ban `space-y-4`, `space-y-6` in `_client.tsx`                            | Density compliance      | Prevent spacing regression                             |
| Ban `gap-4`, `gap-6` in `_client.tsx`                                    | Density compliance      | Prevent gap regression                                 |
| Ban `text-[10px]`, `text-[9px]`, `text-[8px]` in `_client.tsx`           | Typography compliance   | Prevent font size regression                           |
| Ban `cursor-pointer` without `onClick`/`href`                            | UX correctness          | Prevent dead clicks                                    |
| Ban `PageHeader` import in `_client.tsx`                                 | Architecture compliance | **Prevent bespoke pages** — all pages must use a shell |
| Ban direct `StatCard` import in `_client.tsx` (must come through config) | Architecture compliance | Force config-driven stats                              |

#### 7.2 Playwright Smoke Tests

- Navigate to all 11 nav sections
- Verify each page renders (no error boundary)
- Density toggle: compact → default → comfortable on 5 pages
- Mobile viewport (375px) on 5 pages

#### 7.3 Architecture Validation Script

A `scripts/validate-architecture.ts` that:

1. Scans all `_client.tsx` files
2. Asserts every file imports from `@/components/shells`
3. Asserts no file imports `PageHeader` directly
4. Reports any violations as CI-blocking errors

---

## Execution Order & Dependencies

```
Phase 1 (Day 1)        ─ Bug fixes: IDs, StatCard, cursor-pointer, enums, dead hooks
  │
Phase 2 (Days 2-3)     ─ Design system: density spacing + typography tokens
  │
Phase 3 (Days 4-8)     ─ CORE: Migrate all 20 bespoke pages to shells
  │  ├── 3.1: 7 pages → OperationalDashboardShell
  │  ├── 3.2: 2 pages → SettingsPageShell
  │  ├── 3.3: 5 pages → WizardShell
  │  ├── 3.4: 1 page  → FormPageShell
  │  └── 3.5: 5 pages → OperationalDashboardShell (contentSlot)
  │
Phase 4 (Day 9)        ─ Config registries + lazy loading
  │
Phase 5 (Day 10)       ─ RBAC: shell-level PermissionGate guarantee
  │
Phase 6 (Weeks 2-5)    ─ i18n: shell strings → config strings → nav strings
  │
Phase 7 (Continuous)    ─ ESLint rules + Playwright + architecture validator
```

**Phases 1 and 2 are independent** — parallelizable.
**Phase 3 is the critical path** — depends on Phase 2 (spacing tokens must exist).
**Phases 4 and 5 depend on Phase 3** (all pages must be on shells first).
**Phase 6 depends on Phase 5** (shells must have PermissionGate before i18n adds complexity).
**Phase 7 activates after Phase 3** (lint rules prevent regression).

---

## Summary

| Phase                 | Files Changed           | Key Metric                     | Effort       |
| --------------------- | ----------------------- | ------------------------------ | ------------ |
| 1 — Correctness       | ~35                     | 0 dead clicks, 0 fake data     | 1 day        |
| 2 — Design System     | ~95                     | 0 hardcoded spacing/fonts      | 2 days       |
| 3 — Zero-Bespoke      | **20 → 0**              | **0 bespoke pages**            | 5 days       |
| 4 — Config Registries | ~30 new config files    | All configs in registries      | 1 day        |
| 5 — RBAC              | ~2 shell files          | 100% shell-level RBAC          | 1 day        |
| 6 — i18n              | ~7 shells + ~60 configs | i18n-ready                     | 3 weeks      |
| 7 — Enforcement       | ~5 infra files          | CI-blocking architecture rules | Continuous   |
| **Total**             | **~160 unique**         | **423/423 pages on shells**    | **~6 weeks** |

### End State

- **0 bespoke pages** — every page renders through a shell
- **7 shell types** — `ListPageShell`, `DetailPageShell`, `OperationalDashboardShell`, `FormPageShell`, `SettingsPageShell`, `WizardShell`, `QuickViewPanel`
- **~450 config objects** — pure data, no imperative scaffolding
- **Structural guarantees** — RBAC, density, a11y, i18n are shell-level concerns, not per-page concerns
- **Architecture enforcement** — ESLint + CI script prevents regression to bespoke patterns
- **Single responsibility** — shells own layout/structure, configs own domain data, hooks own data fetching
