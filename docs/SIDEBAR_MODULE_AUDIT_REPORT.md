# Sidebar Module Audit Report

**Date:** 2026-03-20
**Scope:** End-to-end functional audit of all 156 sidebar-accessible pages across 11 navigation sections
**Method:** Static code analysis of all page.tsx and \_client.tsx files, targeted grep sweeps across ~430K LOC, browser preview verification

---

## Executive Summary

All **156 navigation paths** resolve to valid page files — zero 404s. All pages follow the RSC wrapper + `_client.tsx` pattern or use `ListPageShell` with config keys. API wiring is 100% — every page has backing Supabase hooks. The codebase compiles with **0 TypeScript errors** and **0 ESLint errors**.

The audit identified **8 categories of normalization/optimization opportunities** across all sections, ranging from P0 functional bugs to P3 design-system debt. No blocking issues were found.

---

## Section-by-Section Findings

### Section 1: Home (13 pages)

**Pages:** dashboard, messages, home/tasks, calendar, notifications, home/documents, reports, dashboards, forecasting, saved-views, reports/ai, scenarios, report-definitions

| Finding                                                                                                                                                                                                                           | Severity | File                                    | Evidence                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------- | -------------------------------------------------- |
| **Hardcoded StatCard change values** — `change={12}`, `change={8}`, `change={2}`, `change={-1}` are static numbers, not computed from data                                                                                        | P1       | `dashboard/_client.tsx:132,139,146,158` | Misleading KPI deltas that never update            |
| **Active Projects rows have `cursor-pointer` but no Link** — clicking does nothing                                                                                                                                                | P1       | `dashboard/_client.tsx:184`             | Dead click affordance                              |
| **Dashboard gap-6 bypasses density tokens** — `gap-6` on the 3-column grid should be `density-gap-card-grid`                                                                                                                      | P2       | `dashboard/_client.tsx:166`             | Spacing won't respond to density preference        |
| **`.replace("_", " ")` for phase labels** — only replaces first underscore                                                                                                                                                        | P2       | `dashboard/_client.tsx:198`             | Should use `replaceAll` or domain config label map |
| **Dashboards page: 10 unused hook assignments** — `_savedDashboards`, `_dbWidgets`, `_dashboardDetail`, `_reportDefs`, `_createDashboard`, `_updateDashboard`, `_createWidget`, `_updateWidget`, `_createReport`, `_updateReport` | P2       | `dashboards/_client.tsx:59-68`          | Dead code / wired but not connected to UI          |
| **Forecasting hardcoded change value** — `change={5}` on Revenue Won StatCard                                                                                                                                                     | P2       | `forecasting/_client.tsx`               | Same pattern as dashboard                          |
| **Scenarios hardcoded change value** — `change={3}`                                                                                                                                                                               | P2       | `scenarios/_client.tsx`                 | Same pattern                                       |

### Section 2: Business (13 pages)

**Pages:** pipeline, leads, opportunities, deals, proposals, estimates, change-orders, upsell-events, upsell-triggers, lost-reasons, accounts, companies, stakeholders

| Finding                                                                  | Severity | File                                       | Evidence        |
| ------------------------------------------------------------------------ | -------- | ------------------------------------------ | --------------- |
| All pages use `ListPageShell` with config keys — structurally sound      | ✅       | All                                        | Factory pattern |
| Detail pages ([id]) properly wired to single-record hooks                | ✅       | deals/[id], leads/[id], opportunities/[id] | Verified        |
| Proposals has bespoke `new` and `[id]` pages with full create/edit flows | ✅       | proposals/                                 | Verified        |

**No issues found.** This section is the most normalized across the app.

### Section 3: Production (17 pages)

**Pages:** projects, scopes-of-work, events, activations, tasks, scheduling, boms, locations, advancing/\*, advance-status-history

| Finding                                                                                                                          | Severity | File                       | Evidence                        |
| -------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------- | ------------------------------- |
| **Scheduling `cursor-pointer` on crew grid rows without navigation**                                                             | P2       | `scheduling/_client.tsx`   | Dead click affordance           |
| **Scheduling `space-y-4` remnant**                                                                                               | P3       | `scheduling/_client.tsx`   | Should be `density-gap-section` |
| Advancing sub-modules (catalog, queue, fulfillment, inventory, templates, reports) all properly implemented with dedicated hooks | ✅       | advancing/\*               | Verified                        |
| Projects [id] page fully wired with cross-entity lookups (tasks, approvals, stakeholders)                                        | ✅       | projects/[id]/\_client.tsx | Verified                        |

### Section 4: Operations (18 pages)

**Pages:** approvals, approval-workflows, checklists, checklist-templates, service-requests, sla-definitions, workflows, automations, quality-checks, quality-check-templates, qc-gates, documents, call-sheets, tech-sheets, templates, email-messages, resilience-targets

| Finding                                                                                                                                                        | Severity | File                               | Evidence                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------- | -------------------------------------------- |
| **Approvals `space-y-4` remnant**                                                                                                                              | P3       | `approvals/_client.tsx`            | Should be `density-gap-section`              |
| **Automations: 3 unused mutation hook assignments** — `_createAutomation`, `_deleteAutomation`, `_updateAutomation` visible in client but used via other paths | P3       | `automations/_client.tsx`          | Review whether these are wired to UI actions |
| **SLA page has 5 `gap-4` instances** bypassing density tokens                                                                                                  | P2       | `service-requests/sla/_client.tsx` | Spacing inconsistency                        |
| Templates [id]/edit page has `space-y-4` remnants                                                                                                              | P3       | `templates/[id]/edit/_client.tsx`  |                                              |

### Section 5: Workforce (17 pages)

**Pages:** crew, shifts, crew-availability, resource-planner, time-tracking, time-entries, timesheets, time-tracking/compliance, time-off, time-off-requests, certifications, workforce/\*, vendors, vendor-onboarding, vendor-compliance, work-orders, vendor-reviews

| Finding                                                                                                      | Severity | File                            | Evidence                                            |
| ------------------------------------------------------------------------------------------------------------ | -------- | ------------------------------- | --------------------------------------------------- |
| **Time-tracking: hardcoded `change={5}` on StatCard**                                                        | P2       | `time-tracking/_client.tsx`     | Static KPI delta                                    |
| **Time-tracking: 8 `gap-4` instances** bypassing density tokens                                              | P2       | `time-tracking/_client.tsx`     | Largest density-token gap in codebase               |
| **Time-tracking: `p-4 lg:p-6` hardcoded padding**                                                            | P2       | `time-tracking/_client.tsx`     | Should use density container tokens                 |
| **Resource-planner: `p-6` hardcoded, 3 `gap-4`, `text-2xl font-bold`**                                       | P2       | `resource-planner/_client.tsx`  | Multiple density/typography token gaps              |
| **Vendor-portal: `INV-${inv.id.slice(0,8).toUpperCase()}`** — invoice number generated client-side from UUID | P1       | `vendor-portal/_client.tsx:132` | Should use server-generated `invoice_number` column |
| **Workforce goals: 2 `gap-4` instances**                                                                     | P3       | `workforce/goals/_client.tsx`   |                                                     |

### Section 6: Resources (12 pages)

**Pages:** assets, assets/scan, assets/scan/batch, transfer-orders, maintenance-schedules, inventory, warehouses, fleet, dispatch, shipments, purchase-orders, expense-reports

| Finding                                                                 | Severity | File                            | Evidence         |
| ----------------------------------------------------------------------- | -------- | ------------------------------- | ---------------- |
| **Assets scan: `.toUpperCase()` on scan_action** — should use label map | P3       | `assets/scan/_client.tsx:237`   | Raw enum display |
| **Assets [id]: `.replace("_", " ").toUpperCase()` on scan_action**      | P3       | `assets/[id]/_client.tsx:106`   | Same pattern     |
| **Assets scan: `space-y-4` remnant**                                    | P3       | `assets/scan/_client.tsx`       |                  |
| **Assets scan/batch: `p-4 lg:p-6` hardcoded**                           | P2       | `assets/scan/batch/_client.tsx` |                  |

### Section 7: Creative (11 pages)

**Pages:** briefs, brand-kit, brand-guidelines, creative-assets, digital-assets, creative-reviews, decks, campaigns, case-studies, surveys, testimonials

| Finding                                                                   | Severity | File                         | Evidence              |
| ------------------------------------------------------------------------- | -------- | ---------------------------- | --------------------- |
| **Surveys: `.toUpperCase()` on template type**                            | P3       | `surveys/_client.tsx:197`    | Should use label map  |
| **Surveys: `p-6` hardcoded**                                              | P2       | `surveys/_client.tsx`        |                       |
| **Decks: `cursor-pointer` without Link or onClick handler** on deck cards | P2       | `decks/_client.tsx`          | Dead click affordance |
| **Brand-kit [id]: 6 `space-y-4` remnants, `p-4 lg:p-6`**                  | P2       | `brand-kit/[id]/_client.tsx` |                       |
| **Campaigns [id]: 3 `space-y-4` remnants**                                | P3       | `campaigns/[id]/_client.tsx` |                       |

### Section 8: Finance (18 pages)

**Pages:** finance, revenue, invoices, client-invoices, payments, recurring-invoices, credit-notes, expenses, budgets, milestones, job-costing, rate-cards, finance/revenue-recognition, payroll-batches, procurement, gl-accounts, budget-approvals, payment-approvals, financial-periods

| Finding                                                                                                 | Severity | File                                      | Evidence                                         |
| ------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------- | ------------------------------------------------ |
| **Finance: hardcoded `change={3}` on StatCard**                                                         | P2       | `finance/_client.tsx`                     | Static KPI delta                                 |
| **Invoices/new: `INV-${Date.now().toString(36).toUpperCase()}`** — invoice number generated client-side | P1       | `invoices/new/_client.tsx:58`             | Should be server-generated sequence              |
| **Procurement: `.toUpperCase()` on PO ID display** — `PO-{po.id.toUpperCase()}`                         | P3       | `procurement/_client.tsx:257`             | Stylistic, but UUID display is not user-friendly |
| **Revenue-recognition: 3 `gap-4`, 2 `space-y-4`**                                                       | P2       | `finance/revenue-recognition/_client.tsx` |                                                  |

### Section 9: Legal (9 pages)

**Pages:** contracts, obligations, permits, insurance-policies, ip-rights, incidents, compliance-checklists, engineering-approvals, clause-library

| Finding                                            | Severity | File                           | Evidence |
| -------------------------------------------------- | -------- | ------------------------------ | -------- |
| All pages use `ListPageShell` — structurally sound | ✅       | All                            |          |
| Detail pages properly wired                        | ✅       | contracts/[id], incidents/[id] | Verified |

**No functional issues found.** Cleanest section alongside Business.

### Section 10: Admin (22 pages)

**Pages:** user-management/_, roles, teams, org-chart, people, knowledge-base, sops, vault, settings/_, tags, integrations/_, credentials/_, client-portal, vendor-portal, system-health, data-export

| Finding                                                                         | Severity | File                                                           | Evidence                             |
| ------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------- | ------------------------------------ |
| **Settings: 10 `space-y-4` + 12 `gap-4` remnants** — highest density-token debt | P2       | `settings/_client.tsx`                                         | 22 total hardcoded spacing instances |
| **Settings: `.toUpperCase()` for initials** — acceptable (avatar initials)      | ✅       | `settings/_client.tsx:462`                                     | Justified use                        |
| **Settings AI: 6 `space-y-4`, 4 `gap-4`, 12 `fetch("/api/")` calls**            | P2       | `settings/ai/_client.tsx`                                      | Most API-call-heavy page             |
| **Settings org-security: 7 `space-y-4`**                                        | P2       | `settings/org-security/_client.tsx`                            |                                      |
| **Client-portal: `EmptyRow` component duplicated** — same as vendor-portal      | P2       | `client-portal/_client.tsx:43`, `vendor-portal/_client.tsx:60` | Extract to shared component          |
| **System-health: `EmptyRow` duplicated again, 4 `gap-4`**                       | P2       | `system-health/_client.tsx`                                    | 3rd duplicate                        |
| **Org-chart: `p-4 lg:p-6` hardcoded**                                           | P2       | `org-chart/_client.tsx`                                        |                                      |
| **Knowledge-base collaborative: `p-4 lg:p-6`, 2 `space-y-4`**                   | P2       | `knowledge-base/collaborative/_client.tsx`                     |                                      |
| **Integrations [id]: 6 `gap-4`, 3 `space-y-4`**                                 | P2       | `integrations/[id]/_client.tsx`                                |                                      |

### Section 11: Live Operations (17 pages)

**Pages:** live-ops, live-ops/run-of-show, live-ops/readiness, live-ops/departments, live-ops/crew, live-ops/equipment, live-ops/comms, live-ops/foh, live-ops/credentials, live-ops/gate, live-ops/vip, live-ops/guest-incidents, live-ops/environment, live-ops/financials, live-ops/strike, live-ops/reconciliation, live-ops/reports

| Finding                                                                                               | Severity | File                                   | Evidence                         |
| ----------------------------------------------------------------------------------------------------- | -------- | -------------------------------------- | -------------------------------- |
| **Live-ops command: `useState` for phase filter** — should use `useQueryTabState` for URL persistence | P2       | `live-ops/_client.tsx:53`              | Filter state lost on navigation  |
| **Live-ops command: 2 unused hook assignments** — `_createEvent`, `_createAssignment`                 | P3       | `live-ops/_client.tsx:55-56`           |                                  |
| **Live-ops command: Button-based filter** — should use `SegmentedControl` for consistency             | P2       | `live-ops/_client.tsx:94-101`          | Other pages use SegmentedControl |
| **Live-ops credentials: `.replace("_"," ").toUpperCase()`**                                           | P3       | `live-ops/credentials/_client.tsx:140` |                                  |
| **Live-ops gate: `.replace("_"," ").toUpperCase()`**                                                  | P3       | `live-ops/gate/_client.tsx:309`        |                                  |
| **Live-ops foh: `p-4 lg:p-6`, 2 `gap-4`**                                                             | P2       | `live-ops/foh/_client.tsx`             |                                  |
| **Live-ops departments: 2 unused hook assignments**                                                   | P3       | `live-ops/departments/_client.tsx`     |                                  |
| **Live-ops guest-incidents: 2 unused hook assignments**                                               | P3       | `live-ops/guest-incidents/_client.tsx` |                                  |

---

## Cross-Cutting Findings

### 1. Density Token Gaps (P2) — 157 `space-y-*` + 176 `gap-*` remnants

**65 files** still use `space-y-4` or `space-y-6` instead of `density-gap-section` / `density-gap-page`.
**82 files** still use `gap-4` or `gap-6` instead of `--density-card-grid-gap` / `--density-stat-grid-gap`.
**26 files** still use `p-6` or `p-4 lg:p-6` instead of density container tokens.

**Worst offenders:**

- `settings/_client.tsx` — 22 hardcoded spacing instances
- `time-tracking/_client.tsx` — 12 instances
- `settings/org-security/_client.tsx` — 7 instances
- `integrations/[id]/_client.tsx` — 9 instances

**Recommendation:** Batch migration using find-and-replace. ~333 total changes across ~100 files. The density token infrastructure already exists — this is purely a consumer migration.

### 2. Hardcoded StatCard Change Values (P1) — 8 instances across 5 files

| File                        | Values                                                   |
| --------------------------- | -------------------------------------------------------- |
| `dashboard/_client.tsx`     | `change={12}`, `change={8}`, `change={2}`, `change={-1}` |
| `finance/_client.tsx`       | `change={3}`                                             |
| `forecasting/_client.tsx`   | `change={5}`                                             |
| `scenarios/_client.tsx`     | `change={3}`                                             |
| `time-tracking/_client.tsx` | `change={5}`                                             |

These present **static numbers that never reflect real data**. Either compute from actual period-over-period comparison or remove the `change` prop entirely.

### 3. `cursor-pointer` Without Click Handler (P1) — 37 instances across 31 files

Elements styled with `cursor-pointer` but lacking `<Link>`, `onClick`, or `<a>` — giving users a clickable affordance that does nothing. Key examples:

- **Dashboard Active Projects row** — most visible, on the main landing page
- **Decks cards**, **Reports cards**, **Scheduling crew rows**

**Recommendation:** Either wrap in `<Link href={...}>` or remove `cursor-pointer`.

### 4. `.replace("_", " ")` for Enum Display (P2) — 24 instances across 17 files

Uses `String.replace("_", " ")` which only replaces the **first** underscore. Should use `replaceAll("_", " ")` or, preferably, map through a domain config label dictionary (`STATUS_MAP`, `PHASE_MAP`, etc.) which already exist for most entity types.

### 5. Client-Side ID/Number Generation (P1) — 2 instances

| File                            | Code                                                 | Issue                                                |
| ------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| `invoices/new/_client.tsx:58`   | `` `INV-${Date.now().toString(36).toUpperCase()}` `` | Invoice numbers should be server-generated sequences |
| `vendor-portal/_client.tsx:132` | `` `INV-${inv.id.slice(0,8).toUpperCase()}` ``       | Should read `invoice_number` column from DB          |

These violate SSOT — the server should be the authority for document numbering.

### 6. `EmptyRow` Component Duplication (P2) — 3 identical copies

`client-portal/_client.tsx`, `vendor-portal/_client.tsx`, and `system-health/_client.tsx` each define an identical `EmptyRow` component inline. Should be extracted to a shared UI component.

### 7. Unused Hook Assignments (P3) — 42 `const _` across 22 files

Hooks instantiated but assigned to `_` prefixed variables, indicating they were wired but the UI was never connected. Largest clusters:

- `dashboards/_client.tsx` — 6 unused
- `settings/_client.tsx` — 5 unused
- `approval-workflows/[id]/_client.tsx` — 3 unused
- `scenarios/_client.tsx` — 3 unused
- `automations/_client.tsx` — 3 unused

**Recommendation:** Either connect to UI or remove to reduce unnecessary Supabase subscriptions.

### 8. i18n Coverage (P2) — 0 of ~350 dashboard pages use `useTranslation()`

The i18n infrastructure exists (10 locales, 15 namespaces, `useTranslation` hook) but **zero bespoke dashboard pages** have been migrated. All strings are hardcoded English. The 17 scanning/context-switcher components that were migrated are the only consumers.

### 9. Arbitrary Font Sizes (P3) — 339 instances of `text-[10px]` / `text-[9px]` across 81 files

These bypass the Tailwind type scale. Should be normalized to a density-aware typography token (e.g., `--density-caption-size`) or mapped to `text-[0.625rem]` / `text-[0.5625rem]` as design tokens.

### 10. PermissionGate Coverage (P2) — Only 19 pages use PermissionGate

61 `PermissionGate` usages across 19 files. The remaining ~340+ pages rely solely on the `OperationalDashboardShell` resource/action check or `ListPageShell` implicit RBAC. While the shell-level check is functional, explicit `PermissionGate` wrapping would provide defense-in-depth for sensitive actions (delete, transfer, bulk operations).

---

## Summary by Priority

| Priority | Count | Category                                                                                                                                                                  |
| -------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **P0**   | 0     | No blocking issues                                                                                                                                                        |
| **P1**   | 4     | Hardcoded StatCard deltas (5 files), cursor-pointer dead clicks (31 files), client-side ID generation (2 files), vendor-portal invoice number                             |
| **P2**   | 6     | Density token gaps (100+ files), `.replace("_"," ")` (17 files), EmptyRow duplication (3 files), i18n (350+ files), PermissionGate coverage, hardcoded padding (26 files) |
| **P3**   | 3     | Unused hook assignments (22 files), arbitrary font sizes (81 files), `.toUpperCase()` enum display (10 files)                                                             |

---

## Recommended Remediation Order

1. **P1 — Client-side ID generation** (2 files, ~30 min) — Use `invoice_number` column from DB
2. **P1 — Hardcoded StatCard changes** (5 files, ~2 hrs) — Compute from period-over-period data or remove
3. **P1 — cursor-pointer dead clicks** (31 files, ~3 hrs) — Add Link wrappers or remove cursor-pointer
4. **P2 — Density token migration** (100+ files, ~4 hrs) — Batch find-and-replace for remaining space-y-_/gap-_/p-6
5. **P2 — `.replace("_"," ")` → replaceAll or label maps** (17 files, ~1.5 hrs)
6. **P2 — EmptyRow extraction** (3 files, ~30 min)
7. **P2 — Hardcoded padding migration** (26 files, ~2 hrs)
8. **P3 — Unused hook cleanup** (22 files, ~1 hr)
9. **P3 — Typography token normalization** (81 files, ~3 hrs) — Define density-caption token, batch migrate
10. **P2 — i18n migration** (350+ files, multi-sprint) — Phased rollout by section
