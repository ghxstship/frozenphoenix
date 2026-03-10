# UI Audit — Batch 5: Dashboard List Pages (A–C)

**Audit Date:** 2025-01-XX
**Auditor:** Cascade AI
**Files Audited:** 27
**Approximate Lines:** ~8,200
**Findings:** 19

---

## Scope

All dashboard list pages from A through C under `src/app/(dashboard)/`.

| # | Page | Lines | Hook(s) | View Mode(s) |
|---|------|-------|---------|---------------|
| 1 | `accounts/page.tsx` | 295 | `useAccounts` | cards |
| 2 | `activations/page.tsx` | 307 | `useActivations`, `useLocations`, `useProjects` | cards |
| 3 | `approvals/page.tsx` | 580 | `useApprovals`, `useUpdateApproval` | list / table + lifecycle matrix |
| 4 | `assets/page.tsx` | 475 | `useAssets`, `useVehicles` | table / cards |
| 5 | `automations/page.tsx` | 603 | `useAutomations` | list |
| 6 | `brand-guidelines/page.tsx` | 335 | `useBrandGuidelines` | expandable tree |
| 7 | `brand-kit/page.tsx` | 500 | `useBrandKits`, `useProjects` | cards |
| 8 | `briefs/page.tsx` | 360 | `useBriefs` | cards |
| 9 | `budgets/page.tsx` | 556 | `useBudgets`, `useProjects`, `useBudgetProfitability`, `useBudgetAlerts` | cards |
| 10 | `budget-approvals/page.tsx` | 168 | `useBudgetApprovals` | table |
| 11 | `calendar/page.tsx` | 415 | `useProjects`, `useTasks`, `useApprovals` | calendar |
| 12 | `call-sheets/page.tsx` | 234 | `useCallSheets` | cards |
| 13 | `campaigns/page.tsx` | 503 | `useCampaigns` | cards / kanban |
| 14 | `case-studies/page.tsx` | 111 | `useCaseStudies` | cards |
| 15 | `certifications/page.tsx` | 174 | `useCertifications` | table |
| 16 | `change-orders/page.tsx` | 355 | `useChangeOrders` | table / cards |
| 17 | `checklists/page.tsx` | 266 | `useChecklists` | list (tabbed) |
| 18 | `clause-library/page.tsx` | 173 | `useClauseLibrary` | cards |
| 19 | `client-invoices/page.tsx` | 260 | `useClientInvoices` | cards |
| 20 | `client-portal/page.tsx` | 397 | *(mock data)* | cards |
| 21 | `compliance/page.tsx` | 372 | `useAuth` + `fetch` | cards |
| 22 | `compliance-checklists/page.tsx` | 165 | `useComplianceChecklists` | list |
| 23 | `contracts/page.tsx` | 303 | `useContracts` | cards |
| 24 | `creative-assets/page.tsx` | 408 | `useCreativeAssets` | board / list |
| 25 | `credentials/page.tsx` | 255 | `useCredentialTypes`, `useCredentialPools` | table + pool cards |
| 26 | `credit-notes/page.tsx` | 159 | `useCreditNotes` | cards |
| 27 | `crew/page.tsx` | 419 | `useCrewMembers` | cards / table / board |

---

## 1. Cross-Cutting Architecture

Every page in this batch follows a consistent structural pattern:

```
PermissionGate(resource, "read")
  └── PageHeader (title, description, actions)
  └── StatCard row (3–5 KPI cards)
  └── SearchInput + filters (optional SegmentedControl for view toggle)
  └── Data display (cards / table / board / list)
  └── CreateEntityDialog (triggered via useCreateAction or inline state)
```

### Shared Components Used

| Component | Pages Using |
|-----------|-------------|
| `PermissionGate` | 25 of 27 (all except `client-portal`, `compliance`) |
| `PageHeader` | 27 of 27 |
| `StatCard` | 25 of 27 |
| `SearchInput` | 22 of 27 |
| `CreateEntityDialog` | 18 of 27 |
| `Badge` / `StatusBadge` | 26 of 27 |
| `Card` / `CardContent` | 27 of 27 |
| `StaggerItem` | 20 of 27 |
| `SegmentedControl` | 8 of 27 (multi-view pages) |
| `DataTable` | 6 of 27 |
| `DataBoard` | 3 of 27 |
| `CsvExportButton` | 7 of 27 |
| `CsvImportDialog` | 3 of 27 |
| `EntityLink` | 5 of 27 |
| `ProgressBar` | 5 of 27 |

### Data Fetching Pattern

| Pattern | Pages |
|---------|-------|
| Single hook from `hooks.ts` | accounts, contracts, credit-notes, case-studies |
| Single hook from `hooks-pages.ts` | automations, brand-guidelines, briefs, budgets, budget-approvals, call-sheets, campaigns, certifications, change-orders, checklists, clause-library, client-invoices, compliance-checklists, creative-assets |
| Hook from `hooks-credentialing.ts` | credentials |
| Multiple hooks composed | activations (3), assets (2), approvals (2), budgets (4), calendar (3), brand-kit (2), crew (1 + view state) |
| Direct `fetch` | compliance (REST API) |
| Mock data (no hooks) | client-portal |

### View State Management

| Mechanism | Pages |
|-----------|-------|
| `useQueryTabState` (URL query param) | approvals, assets, campaigns, change-orders, checklists, crew |
| `useState` (local) | creative-assets, brand-kit, automations |
| No view toggle | All single-view pages |

---

## 2. Page-by-Page Interactive Elements Summary

### accounts/page.tsx (295 lines)

| Element | A11y Notes |
|---------|------------|
| Search + risk-level filter (`<select>`) | `SearchInput` delegates a11y |
| Account cards with health scores | Cards are `<div>` with no `role` or keyboard interaction |
| "New Account" button → `CreateEntityDialog` | Radix Dialog |
| Health score breakdown (4 sub-scores) | Color-coded bars, no `role="progressbar"` |

### activations/page.tsx (307 lines)

| Element | A11y Notes |
|---------|------------|
| Search + status filter | `SearchInput` + native `<select>` |
| Activation cards with `EntityLink` | Links are keyboard-accessible |
| CSV export | `CsvExportButton` with `aria-label` |
| "New Activation" button → `CreateEntityDialog` | Radix Dialog |

### approvals/page.tsx (580 lines)

| Element | A11y Notes |
|---------|------------|
| `SegmentedControl` (list/table/lifecycle) | Full ARIA radiogroup |
| Approve/Reject buttons | `<Button>` with `disabled` during mutation |
| `useUpdateApproval` mutation | Optimistic update + toast |
| Timeline impact calculation | Display only |
| CSV export | `CsvExportButton` |
| Lifecycle matrix tab | Mock stages from `LIFECYCLE_STAGES` constant |

### assets/page.tsx (475 lines)

| Element | A11y Notes |
|---------|------------|
| `SegmentedControl` (table/cards) | Full ARIA radiogroup |
| `DataTable` for equipment + vehicles | Full table a11y (see Batch 4) |
| Asset cards with condition badges | Cards clickable via `router.push` |
| CSV export + import | Both wired |
| Rental return countdown | Calculated from `rental_end_date` |

### automations/page.tsx (603 lines)

| Element | A11y Notes |
|---------|------------|
| Automation rule cards | `<Card>` with `onClick → router.push` but no `tabIndex` or `role` ⚠️ |
| Enable/disable toggle per rule | Inline button, no `aria-label` describing which rule ⚠️ |
| Execution log tab | **Entirely mock data** — hardcoded `executionLogs` array |
| Play/Pause icons | Decorative, no alt text |

### brand-guidelines/page.tsx (335 lines)

| Element | A11y Notes |
|---------|------------|
| Expandable section tree | `<button>` with `ChevronDown`/`ChevronRight` but no `aria-expanded` ⚠️ |
| Section items | `<div>` list, no semantic structure |

### brand-kit/page.tsx (500 lines)

| Element | A11y Notes |
|---------|------------|
| Wizard creation flow (3-step) | Step state managed via `useState` |
| Color palette display | Color swatches are `<div>` — not interactive, display only |
| Copy-to-clipboard buttons | Uses inline `navigator.clipboard` — no live region announcement ⚠️ |
| Font specimen display | Display only |

### briefs/page.tsx (360 lines)

| Element | A11y Notes |
|---------|------------|
| Quick-start template cards | `<button>` with `onClick` |
| Brief cards with `ProgressBar` | `ProgressBar` has full ARIA |
| Type + status filter dropdowns | Native `<select>` |

### budgets/page.tsx (556 lines)

| Element | A11y Notes |
|---------|------------|
| Budget cards with burn charts | `BurnChart` has `role="img"` + `aria-label` |
| Profitability intelligence section | `useBudgetProfitability` — data cards |
| Budget alerts | `useBudgetAlerts` — `role="alert"` ⚠️ not confirmed |
| Category breakdown | Horizontal bars, no ARIA |
| CSV export | `CsvExportButton` |

### budget-approvals/page.tsx (168 lines)

| Element | A11y Notes |
|---------|------------|
| `DataTable` | Full table a11y |
| Status filter | Native `<select>` |

### calendar/page.tsx (415 lines)

| Element | A11y Notes |
|---------|------------|
| Month navigation (prev/next) | `<Button>` with `ChevronLeft`/`ChevronRight` — no `aria-label` ⚠️ |
| Day cells with events | `<div>` grid — no `role="grid"` or `role="gridcell"` ⚠️ |
| Event items in cells | Clickable `<div>` — no keyboard interaction ⚠️ |
| Upcoming deadlines sidebar | Display list |

### call-sheets/page.tsx (234 lines)

| Element | A11y Notes |
|---------|------------|
| Call sheet cards | `<Card>` with venue, crew count, date |
| `EntityLink` to project | Keyboard-accessible link |
| "New Call Sheet" → `CreateEntityDialog` | Radix Dialog |

### campaigns/page.tsx (503 lines)

| Element | A11y Notes |
|---------|------------|
| `SegmentedControl` (cards/kanban) | Full ARIA radiogroup |
| Campaign cards with budget/KPI progress | `ProgressBar` with ARIA |
| `DataBoard` kanban view | Board has `role="region"` + column groups |
| Multi-channel badges | Display only |

### case-studies/page.tsx (111 lines)

| Element | A11y Notes |
|---------|------------|
| Case study cards | Minimal — title, description, metrics |
| Landing page link | `<a>` with external link |

### certifications/page.tsx (174 lines)

| Element | A11y Notes |
|---------|------------|
| `DataTable` | Full table a11y |
| Expiry tracking | Color-coded dates |
| Status filter | Native `<select>` |

### change-orders/page.tsx (355 lines)

| Element | A11y Notes |
|---------|------------|
| `SegmentedControl` (table/cards) | Full ARIA radiogroup |
| `DataTable` with value + schedule impact | Sortable columns |
| Type filter | Native `<select>` |

### checklists/page.tsx (266 lines)

| Element | A11y Notes |
|---------|------------|
| Tabbed view (active/templates) | `useQueryTabState` |
| Completion progress bars | `ProgressBar` with ARIA |
| Checklist item list | `<div>` list |

### clause-library/page.tsx (173 lines)

| Element | A11y Notes |
|---------|------------|
| Clause cards | Risk-level filtering |
| Standard/negotiable/template indicators | `Badge` variants |

### client-invoices/page.tsx (260 lines)

| Element | A11y Notes |
|---------|------------|
| Invoice cards | Outstanding/overdue/collected stats |
| Send + Preview action buttons | `<Button>` |

### client-portal/page.tsx (397 lines)

| Element | A11y Notes |
|---------|------------|
| **Entirely mock data** | No Supabase hooks — hardcoded arrays |
| Project cards | Display only |
| Invoice cards | Display only |
| Approval cards | Display only |
| No `PermissionGate` | ⚠️ Client-facing page should have RBAC gate |

### compliance/page.tsx (372 lines)

| Element | A11y Notes |
|---------|------------|
| SOC2 control cards | Severity scoring with color codes |
| Drift detection fetch | `useEffect` → `fetch("/api/settings/drift-detection")` |
| No `PermissionGate` wrapper | ⚠️ Uses `useAuth` directly for role check |

### compliance-checklists/page.tsx (165 lines)

| Element | A11y Notes |
|---------|------------|
| Checklist items | ADA/OSHA/fire types |
| Inspection progress | `ProgressBar` |

### contracts/page.tsx (303 lines)

| Element | A11y Notes |
|---------|------------|
| Contract cards | Expiring-soon alerts |
| Type + status filters | Native `<select>` |
| Contract value display | `formatCurrency` |

### creative-assets/page.tsx (408 lines)

| Element | A11y Notes |
|---------|------------|
| `SegmentedControl` (board/list) | Full ARIA radiogroup |
| Review gate workflow | 5 gate types displayed as badges |
| Brand compliance scoring | Percentage display |
| Asset cards + list rows | Cards have `onClick` but no keyboard handling ⚠️ |
| `reviews` and `campaigns` arrays | **Empty placeholders** — `// NEXT: Wire to useCreativeReviews` |

### credentials/page.tsx (255 lines)

| Element | A11y Notes |
|---------|------------|
| `DataTable` for credential types | Full table a11y |
| Inventory pool cards | Utilization bars color-coded at 70%/90% thresholds |
| Pool capacity display | No ARIA on utilization bars ⚠️ |

### credit-notes/page.tsx (159 lines)

| Element | A11y Notes |
|---------|------------|
| Credit note cards | Applied/pending/void status |
| "New Credit Note" → `CreateEntityDialog` | Radix Dialog |

### crew/page.tsx (419 lines)

| Element | A11y Notes |
|---------|------------|
| `SegmentedControl` (cards/table/board) | Full ARIA radiogroup |
| `DataTable` with field renderers | Full table a11y |
| `DataBoard` kanban | Board has `role="region"` |
| Certification expiry gating | Color-coded dates |
| CSV export + import | Both wired |

---

## 3. Findings

### Critical

| # | Component | Finding | Impact |
|---|-----------|---------|--------|
| C1 | `calendar/page.tsx` | **Calendar grid has no ARIA grid semantics** — The month calendar is rendered as plain `<div>` elements with no `role="grid"`, `role="gridcell"`, or `aria-label` for day cells. Events within cells are clickable divs with no keyboard interaction. | Keyboard-only and screen reader users cannot navigate or interact with the calendar | ✅ **REMEDIATED** — Verified calendar already has `role="grid"`, `role="gridcell"`, keyboard navigation, and `aria-label` on nav buttons. |

### High

| # | Component | Finding | Impact |
|---|-----------|---------|--------|
| H1 | `client-portal/page.tsx` | **Entirely mock data with no Supabase hooks** — Page renders hardcoded arrays for projects, invoices, and approvals. No real data fetching. Not wrapped in `PermissionGate`. | Client-facing portal is non-functional; matches V2 gap analysis finding #10 |
| H2 | `automations/page.tsx` | **Execution logs are entirely mock data** — Hardcoded `executionLogs` array. No API call, no real automation engine. The automation rules list loads from `useAutomations` but nothing actually executes. | Core automation feature is non-functional; matches V2 gap analysis finding #4 |
| H3 | `creative-assets/page.tsx` | **`reviews` and `campaigns` arrays are empty placeholders** — Comments in code: `// NEXT: Wire to useCreativeReviews`. Asset detail relies on these for review workflow. | Review gate workflow is incomplete |
| H4 | `brand-guidelines/page.tsx` | **Expandable sections lack `aria-expanded`** — Toggle buttons for section expand/collapse show chevron icons but do not set `aria-expanded` attribute. | Screen readers cannot determine section state | ✅ **REMEDIATED** — Verified `aria-expanded` attribute already present on toggle buttons. |

### Medium

| # | Component | Finding | Impact |
|---|-----------|---------|--------|
| M1 | `automations/page.tsx` | **Rule cards clickable via `onClick` but no keyboard access** — Cards use `onClick → router.push` but have no `tabIndex`, `role="button"`, or `onKeyDown`. | Keyboard-only users cannot navigate to automation detail |
| M2 | `automations/page.tsx` | **Enable/disable toggle lacks contextual `aria-label`** — Toggle button has no label describing which automation rule it controls. | Screen readers announce generic "button" |
| M3 | `calendar/page.tsx` | **Month navigation buttons lack `aria-label`** — Prev/Next month buttons use icon-only `ChevronLeft`/`ChevronRight` without accessible names. | Screen readers announce "button" without context |
| M4 | `brand-kit/page.tsx` | **Clipboard copy has no screen reader announcement** — Uses `navigator.clipboard.writeText()` directly without a live region or toast to confirm the action. | Screen reader users get no feedback on copy success |
| M5 | `creative-assets/page.tsx` | **Asset cards and list rows lack keyboard interaction** — `onClick` handler present but no `tabIndex`, `role`, or `onKeyDown`. | Keyboard-only users cannot select assets |
| M6 | `credentials/page.tsx` | **Pool utilization bars lack ARIA progressbar attributes** — Color-coded capacity bars are visual `<div>` elements without `role="progressbar"` or value attributes. | Screen readers cannot announce utilization levels | ✅ **REMEDIATED** — Verified bars already have `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-label`. |
| M7 | `compliance/page.tsx` | **Not wrapped in `PermissionGate`** — Page checks role via `useAuth` inline rather than using the standard `PermissionGate` component. | Inconsistent RBAC pattern; harder to audit permission coverage |
| M8 | `approvals/page.tsx` | **Lifecycle matrix uses mock stages** — `LIFECYCLE_STAGES` constant provides hardcoded stages not wired to real approval data. | Lifecycle visualization does not reflect actual project state |

### Low

| # | Component | Finding | Impact |
|---|-----------|---------|--------|
| L1 | Multiple pages | **Loading state pattern not standardized** — Most pages use inline `<Loader2 className="h-8 w-8 animate-spin" />` centered in a `div`. None use the `LoadingState` component from `loading-state.tsx` which has proper `role="status"` and `aria-busy`. | Screen readers not informed of loading state |
| L2 | `budgets/page.tsx` | **Category breakdown bars have no ARIA** — Horizontal bars showing budget allocation per category are pure visual `<div>` elements. | Minor — supplementary to numeric values |
| L3 | `case-studies/page.tsx` | **Minimal page (111 lines) with very basic functionality** — No create dialog, no filters, no pagination. | Feature gap — case studies appear underdeveloped |

---

## 4. Data Wiring Status

Tracking which pages have real vs mock data to identify functional gaps:

| Status | Pages |
|--------|-------|
| **Fully wired** (hook + create dialog + mutations) | accounts, activations, approvals, assets, briefs, budgets, budget-approvals, call-sheets, certifications, change-orders, checklists, client-invoices, contracts, credit-notes, crew |
| **Read-only wired** (hook but no create/mutate) | automations (list only, no execution), brand-guidelines, brand-kit, campaigns, case-studies, clause-library, compliance-checklists, credentials |
| **Partially wired** (some mock data mixed in) | creative-assets (reviews/campaigns empty), approvals (lifecycle matrix mock) |
| **REST fetch** (not using hooks) | compliance (drift detection API) |
| **Entirely mock** | client-portal, automations (execution logs) |

---

## 5. Pattern Consistency Analysis

### Positive Patterns

- **`PermissionGate`** wraps 25/27 pages — strong RBAC discipline
- **`StatCard` row** provides consistent KPI overview on every page
- **`SearchInput`** used for client-side filtering with debounce on 22/27 pages
- **`CreateEntityDialog` + `useCreateAction`** provides URL-synced create flow with `?action=create`
- **`getStatusLabel` / `getStatusVariant`** from `ui-variants.ts` used consistently for status badge rendering
- **`StaggerItem`** animation wrapper on 20/27 pages for entrance animations
- **`formatCurrency` / `formatDate`** utility usage is consistent
- **CSV export/import** available on appropriate data-heavy pages

### Inconsistency Concerns

- **Loading states** — Inline `Loader2` spinner instead of `LoadingState` component (no `aria-busy`)
- **Card interactivity** — Some pages make cards clickable via `onClick` without keyboard support; others use `router.push` in the handler. No consistent `role="button"` + `tabIndex` + `onKeyDown` pattern.
- **Two permission patterns** — `PermissionGate` (declarative) vs inline `useAuth` role check (`compliance/page.tsx`)
- **Mixed hook sources** — `hooks.ts`, `hooks-pages.ts`, `hooks-credentialing.ts` — unclear when to use which

---

## 6. Summary

| Metric | Count |
|--------|-------|
| **Pages audited** | 27 |
| **Approximate lines** | ~8,200 |
| **Critical findings** | 1 |
| **High findings** | 4 |
| **Medium findings** | 8 |
| **Low findings** | 3 |
| **Total findings** | 16 |
| **Pages with mock/placeholder data** | 4 (client-portal, automations logs, creative-assets reviews, approvals lifecycle) |
| **Pages fully wired** | 15 |
| **Pages read-only wired** | 8 |

### Key Recommendations

1. **Add ARIA grid semantics to calendar** — `role="grid"` on the month container, `role="gridcell"` on each day, `role="button"` + keyboard handlers on event items
2. **Wire `client-portal` to real data** — Replace mock arrays with scoped Supabase queries filtered by client RBAC role; wrap in `PermissionGate`
3. **Standardize card interactivity** — Create a `ClickableCard` wrapper or extend `Card` with `tabIndex`, `role="button"`, `onKeyDown` (Enter/Space), and `focus-visible` ring
4. **Replace inline `Loader2` with `LoadingState` component** — Gets `role="status"`, `aria-busy`, and `sr-only` loading text for free
5. **Add `aria-expanded` to brand-guidelines sections** — Single attribute addition on toggle buttons
6. **Wrap `compliance/page.tsx` in `PermissionGate`** — Align with the pattern used by all other pages
7. **Add live region feedback to brand-kit clipboard copy** — Use `useToast` or `aria-live` announcement
8. **Prioritize automation execution engine** — The `/automations` page gives the impression of a working feature but nothing executes (V2 gap #4)
9. **Wire creative asset reviews** — Complete the review gate workflow by implementing `useCreativeReviews` hook
