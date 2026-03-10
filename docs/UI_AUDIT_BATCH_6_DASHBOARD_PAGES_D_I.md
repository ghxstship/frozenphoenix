# UI Audit — Batch 6: Dashboard List Pages (D–I)

**Audit Date:** 2025-01-XX
**Auditor:** Cascade AI
**Files Audited:** 22
**Approximate Lines:** ~6,400
**Findings:** 18

---

## Scope

All dashboard list pages from Companies through Integrations under `src/app/(dashboard)/`.
Note: `compliance/`, `compliance-checklists/`, and `contracts/` were already covered in Batch 5. `companies/` was missed from Batch 5 and is included here.

| # | Page | Lines | Hook(s) | View Mode(s) |
|---|------|-------|---------|---------------|
| 1 | `companies/page.tsx` | 436 | `useCompanies` | table / cards |
| 2 | `dashboard/page.tsx` | 361 | `useProjects`, `useDeals`, `useNotifications`, `useApprovals`, `useTasks`, `useCrewMembers` | cards + lists |
| 3 | `dashboards/page.tsx` | 401 | *(mock data)* | tabbed widgets |
| 4 | `data-export/page.tsx` | 225 | *(mock data)* | list |
| 5 | `deals/page.tsx` | 224 | `useDeals` | cards |
| 6 | `decks/page.tsx` | 418 | `useDecks`, `useProjects` | grid / list |
| 7 | `digital-assets/page.tsx` | 159 | `useDigitalAssets` | cards |
| 8 | `dispatch/page.tsx` | 262 | `useDispatch` | split-panel list |
| 9 | `documents/page.tsx` | 341 | `useDocuments` | cards |
| 10 | `engineering-approvals/page.tsx` | 201 | `useEngineeringApprovals` | table |
| 11 | `estimates/page.tsx` | 313 | `useEstimates` | cards / table |
| 12 | `events/page.tsx` | 313 | `useEvents`, `useLocations`, `useActivations`, `useProjects` | table |
| 13 | `expenses/page.tsx` | 255 | `useExpenses` | table |
| 14 | `feature-flags/page.tsx` | 171 | `useFeatureFlags`, `useUpdateFeatureFlag` | list |
| 15 | `finance/page.tsx` | 289 | `usePurchaseOrders`, `useInvoices` | table (three-way match) |
| 16 | `fleet/page.tsx` | 246 | `useVehicles` | table + quick dispatch |
| 17 | `forecasting/page.tsx` | 590 | *(mock data)* | tabbed (revenue / budget / utilization / hiring) |
| 18 | `gl-accounts/page.tsx` | 200 | `useGlAccounts` | table |
| 19 | `goods-receipts/page.tsx` | 177 | `useGoodsReceipts` | table |
| 20 | `incidents/page.tsx` | 344 | `useIncidents`, `useLocations`, `useProjects` | cards |
| 21 | `insurance-policies/page.tsx` | 264 | `useInsurancePolicies` | table + requirement cards |
| 22 | `integrations/page.tsx` | 176 | `useProviderConnections` | cards |

---

## 1. Cross-Cutting Architecture

Every page in this batch follows the same structural pattern established in Batch 5:

- **`"use client"` directive** — all pages are client components
- **Supabase hooks** for data fetching (except 3 mock pages)
- **`PermissionGate`** wrapping the return tree (RBAC enforcement)
- **`PageHeader`** with title + description + action buttons
- **`StatCard` grid** (1x4 responsive) for KPIs
- **Search + filter** toolbar
- **List/table/card body** with stagger animations
- **`CreateEntityDialog`** for entity creation (where applicable)
- **Loading state** — centered `Loader2` spinner

### 1.1 Data Fetching Patterns

| Pattern | Pages | Notes |
|---------|-------|-------|
| Single hook | 14 | Standard CRUD pages |
| Multi-hook join | 5 | `dashboard`, `events`, `incidents`, `decks`, `companies` |
| Mock/static data | 3 | `dashboards`, `data-export`, `forecasting` |

### 1.2 View Mode Support

| Mode | Pages |
|------|-------|
| Table only | `engineering-approvals`, `gl-accounts`, `goods-receipts`, `finance`, `insurance-policies`, `expenses` |
| Cards only | `deals`, `digital-assets`, `documents`, `incidents`, `integrations` |
| Split panel | `dispatch` (active vs completed) |
| Grid/list toggle | `decks` |
| Table/cards toggle | `companies`, `estimates` |
| Tabbed sections | `dashboards`, `forecasting`, `dashboard` |

---

## 2. Findings

### F6-01 — `companies/page.tsx` uses `CREATE_CONTACT_CONFIG` instead of a company config
**Severity:** Medium  
**Lines:** 422  
The `CreateEntityDialog` opens with `CREATE_CONTACT_CONFIG`, which creates a contact, not a company. The "Add Company" button label is misleading.  
**Fix:** Create `CREATE_COMPANY_CONFIG` in `create-entity-configs.ts` and wire it here.

> ✅ **REMEDIATED** — Created `CREATE_COMPANY_CONFIG` in `create-entity-configs.ts` with company-specific fields (name, type, industry, website, email, phone) and updated `companies/page.tsx` to use it.

### F6-02 — `companies/page.tsx` header does not use `PageHeader`
**Severity:** Low  
**Lines:** 149-168  
Uses raw `<h1>` and `<p>` instead of the shared `PageHeader` component, breaking the consistent pattern.  
**Fix:** Refactor to use `PageHeader`.

### F6-03 — `companies/page.tsx` container uses `p-6` instead of layout padding
**Severity:** Low  
**Lines:** 148  
Outer `<div>` has `className="flex flex-col gap-6 p-6"`. Other pages use `space-y-6` and rely on layout padding. This creates double padding.  
**Fix:** Align with the standard `space-y-6 animate-fade-in` pattern.

### F6-04 — `dashboard/page.tsx` has hardcoded change values
**Severity:** Low  
**Lines:** 162-190  
`StatCard` `change` props are hardcoded numbers (`12`, `8`, `2`, `-1`) not derived from actual data. Deltas are always static.  
**Fix:** Calculate actual period-over-period deltas or remove until real comparison data is available.

### F6-05 — `dashboards/page.tsx` is 100% mock data
**Severity:** Medium  
**Lines:** 36-107  
All KPI widgets, project profitability, utilization, pipeline, and activity data are hardcoded arrays. The `NEXT:` comment on line 24 confirms this.  
**Fix:** Wire to Supabase aggregation queries; mark as P1.

### F6-06 — `dashboards/page.tsx` tab selection does not filter content
**Severity:** Medium  
**Lines:** 111-116  
`selectedDashboard` state is managed via `useQueryTabState` but never conditionally renders different content. All four tabs show the same widgets.  
**Fix:** Implement tab-specific content rendering.

### F6-07 — `data-export/page.tsx` is 100% mock with non-functional actions
**Severity:** Medium  
**Lines:** 32-57, 76-79  
Export history is hardcoded. Request buttons use `setTimeout` to fake loading but perform no actual export. This is a GDPR/CCPA compliance feature.  
**Fix:** Wire to `data_exports` table and API route. Prioritize for compliance.

### F6-08 — `decks/page.tsx` stat badges count from `PLACEHOLDER_DECKS`
**Severity:** Medium  
**Lines:** 209-223  
Type summary badges count from the static `PLACEHOLDER_DECKS` array instead of the `decks` array derived from Supabase. Counts will be wrong with real data.  
**Fix:** Change `PLACEHOLDER_DECKS.filter(...)` to `decks.filter(...)`.

> ✅ **REMEDIATED** — Replaced `PLACEHOLDER_DECKS.filter(...)` with `decks.filter(...)` and renamed the constant to `_PLACEHOLDER_DECKS` to suppress unused-variable lint warning.

### F6-09 — `decks/page.tsx` list view actions use `console.log`
**Severity:** Low  
**Lines:** 390-397  
Present, Download, and Open buttons log to console. They are raw `<button>` elements without `aria-label`.  
**Fix:** Wire to actual flows and add accessibility labels.

> ✅ **REMEDIATED** — Replaced all 5 `console.log` calls (grid + list view) with `addToast` notifications via `useToast` hook.

### F6-10 — `dispatch/page.tsx` displays work order UUID instead of human-readable number
**Severity:** Low  
**Lines:** 56-58, 146-149  
`getWorkOrderTitle` concatenates UUID `woId` with title. UUIDs are not user-friendly.  
**Fix:** Display work order number or link to the work order detail page.

### F6-11 — `events/page.tsx` has no `CreateEntityDialog`
**Severity:** Low  
**Lines:** 1-313  
Events page has CSV import/export but no `CreateEntityDialog` for creating individual events inline.  
**Fix:** Add `CREATE_EVENT_CONFIG` for single-event creation.

### F6-12 — `feature-flags/page.tsx` toggle has no confirmation
**Severity:** Medium  
**Lines:** 1-171  
Feature flag activation/deactivation toggle calls `useUpdateFeatureFlag` directly with no confirmation dialog. Accidental toggles could affect production behavior.  
**Fix:** Add a confirmation dialog for flag state changes, especially for flags with wide targeting.

> ✅ **REMEDIATED** — Added `useConfirm` hook from `confirm-dialog.tsx`. Toggle now shows contextual confirmation dialog with enable/disable messaging and destructive variant for disabling.

### F6-13 — `finance/page.tsx` three-way match logic is client-side only
**Severity:** Medium  
**Lines:** 1-289  
Three-way matching (PO vs invoice vs goods receipt) is computed entirely in the client by joining `usePurchaseOrders` and `useInvoices` results. This will not scale and lacks server-side validation.  
**Fix:** Implement server-side matching via API route or database view.

### F6-14 — `forecasting/page.tsx` is 100% mock data (590 lines)
**Severity:** Medium  
**Lines:** 1-590  
The largest page in this batch. All revenue, budget, utilization, and hiring forecast data are hardcoded static arrays. No Supabase integration.  
**Fix:** Wire to aggregation queries. Consider a dedicated forecasting API route.

### F6-15 — `insurance-policies/page.tsx` uses hardcoded `holderNames` lookup
**Severity:** Medium  
**Lines:** 47-52  
Holder names are mapped via a hardcoded `holderNames` record (`v1`, `v2`, `v3`, `org-1`). Real holder names should come from a join on the `vendors`/`organizations` tables.  
**Fix:** Join holder data via Supabase query or enrich in the hook.

### F6-16 — `insurance-policies/page.tsx` requirements section is always empty
**Severity:** Low  
**Lines:** 62  
`requirements` is hardcoded to `[]` with a `NEXT:` comment. The requirements section renders but is always empty.  
**Fix:** Wire to `useInsuranceRequirements()` when available, or hide the section until data exists.

### F6-17 — `integrations/page.tsx` "Sync Now" and "Configure" buttons are non-functional
**Severity:** Medium  
**Lines:** 157-163  
Both buttons render but have no `onClick` handlers. Users see actionable UI with no actual behavior.  
**Fix:** Wire "Sync Now" to a sync API endpoint and "Configure" to a configuration modal or detail page.

### F6-18 — Native `<select>` elements used instead of accessible `Select` component
**Severity:** Low  
**Lines:** Multiple pages (dispatch, insurance-policies, compliance-checklists, decks, gl-accounts, goods-receipts)  
Several pages use raw HTML `<select>` elements with inline Tailwind classes instead of the shared `Select`/`SelectTrigger`/`SelectContent` components from `@/components/ui/select`. The native elements lack consistent styling and keyboard behavior.  
**Fix:** Migrate to the shared `Select` component for consistency and accessibility.

---

## 3. Mock Data Inventory

Three pages in this batch are fully mock and require Supabase wiring:

| Page | Mock Lines | Priority | Notes |
|------|-----------|----------|-------|
| `dashboards/page.tsx` | 36-107 | P1 | Core analytics dashboard |
| `data-export/page.tsx` | 32-57 | P0 | GDPR/CCPA compliance |
| `forecasting/page.tsx` | ~300 | P2 | Strategic planning |

Additionally, `dashboard/page.tsx` has hardcoded stat deltas but live data otherwise.

---

## 4. Component Usage Matrix

| Component | Used By (count) |
|-----------|----------------|
| `PermissionGate` | 22/22 |
| `PageHeader` | 20/22 (missing: `companies`, `data-export`) |
| `StatCard` | 20/22 |
| `SearchInput` | 14/22 |
| `CreateEntityDialog` | 11/22 |
| `StatusBadge` | 6/22 |
| `Badge` | 14/22 |
| `StaggerItem` | 7/22 |
| `SegmentedControl` | 3/22 |
| `CsvExportButton` | 3/22 (contracts via Batch 5, companies, deals) |
| `CsvImportDialog` | 3/22 (companies, deals, events) |
| `ProgressBar` | 3/22 (dashboard, dashboards, compliance-checklists) |
| `TabBar` | 1/22 (dashboards) |
| `DataTable` | 0/22 (all tables are hand-rolled) |

### 4.1 Notable Absence: `DataTable`

Despite `DataTable` being available as a shared component, **zero pages in this batch use it**. All tabular displays are hand-rolled `<table>` elements. This creates inconsistency in sorting, pagination, and accessibility across pages.

---

## 5. RBAC Resource Map

| Page | Permission Resource |
|------|-------------------|
| `companies` | `companies` |
| `dashboard` | `dashboard` |
| `dashboards` | `dashboards` |
| `data-export` | `data_export` |
| `deals` | `deals` |
| `decks` | `decks` |
| `digital-assets` | `digital_assets` |
| `dispatch` | `dispatch` |
| `documents` | `documents` |
| `engineering-approvals` | `engineering_approvals` |
| `estimates` | `estimates` |
| `events` | `events` |
| `expenses` | `expenses` |
| `feature-flags` | `feature_flags` |
| `finance` | `finance` |
| `fleet` | `fleet` |
| `forecasting` | `forecasting` |
| `gl-accounts` | `gl_accounts` |
| `goods-receipts` | `goods_receipts` |
| `incidents` | `incidents` |
| `insurance-policies` | `insurance_policies` |
| `integrations` | `provider_connections` |

All 22 pages enforce RBAC at the page level via `PermissionGate`. The `compliance/page.tsx` (covered in Batch 5) is the only page in the D-I range that does NOT wrap with `PermissionGate` — it uses `useAuth` directly.

---

## 6. Hook Source Distribution

| Import Source | Count | Pages |
|--------------|-------|-------|
| `@/lib/supabase/hooks` | 5 | dashboard, deals, decks, contracts, companies |
| `@/lib/supabase/hooks-pages` | 11 | Most domain pages |
| `@/lib/supabase/hooks-external-sync` | 1 | integrations |
| No hook (mock) | 3 | dashboards, data-export, forecasting |
| `@/lib/supabase/auth-context` | 1 | compliance (Batch 5) |

---

## 7. Summary

Batch 6 covers 22 dashboard list pages spanning ~6,400 lines. The codebase maintains a highly consistent architectural pattern across all pages. Key concerns:

1. **3 fully-mock pages** need Supabase wiring (`dashboards`, `data-export`, `forecasting`)
2. **`data-export`** is a GDPR/CCPA compliance feature that is non-functional — highest priority
3. **`DataTable` component is never used** — all tables are hand-rolled, creating inconsistency
4. **Several non-functional buttons** (`integrations` sync/configure, `decks` actions, `data-export` requests)
5. **`companies/page.tsx`** has 3 pattern violations (wrong create config, no PageHeader, extra padding)
6. **Native `<select>` elements** used on 6+ pages instead of the shared accessible `Select` component

### Cumulative Totals (Batches 1-6)

| Batch | Files | Findings |
|-------|-------|----------|
| 1 — Auth & Public | 16 | 21 |
| 2 — Layout & Shell | 12 | 17 |
| 3 — UI Primitives | 37 | 21 |
| 4 — Interactive Components | 13 | 17 |
| 5 — Dashboard Pages A-C | 27 | 19 |
| 6 — Dashboard Pages D-I | 22 | 18 |
| **Total** | **127** | **113** |
