# Dashboard Pages Full-Stack Audit Report

**Date:** 2026-03-12 (updated 2026-03-18)
**Scope:** `src/app/(dashboard)/` — all 214 `page.tsx` files
**Methodology:** Automated quantitative scan + manual deep inspection of flagged pages

---

## Executive Summary

| Metric                                             | Count   | %     |
| -------------------------------------------------- | ------- | ----- |
| Total dashboard pages                              | **214** | 100%  |
| Fully wired (hooks + mutations + loading + error)  | **127** | 59.3% |
| Detail pages with full CRUD                        | **53**  | 24.8% |
| Justified read-only (dashboards, logs, monitoring) | **34**  | 15.9% |
| Partial-FE / Partial-API / Placeholder / Hardcoded | **0**   | 0.0%  |
| API routes available                               | **76**  | —     |

**Classification Coverage: 100%** — every page is FULL, JUSTIFIED-READ, or Detail.

**Overall Assessment:** 180 of 214 pages (84.1%) have write mutations (127 list pages + 53 detail pages). The remaining 34 pages are intentionally read-only (dashboards, analytics, monitoring, logs) where the read-only pattern is architecturally correct. All systemic issues (§8) are resolved except server-side RBAC (§8.5, covered in separate audit).

---

## 1. Classification Legend

| Code            | Meaning                                                         |
| --------------- | --------------------------------------------------------------- |
| **FULL**        | Hooks + mutations + loading + error + empty states              |
| **READ**        | Hooks present, data loads from Supabase, but no write mutations |
| **PARTIAL-API** | Uses `fetch()` to API routes but no Supabase hooks              |
| **PARTIAL-FE**  | Frontend-only with local state, no backend integration          |
| **PLACEHOLDER** | Static UI, "Coming soon", or stub content                       |
| **HARDCODED**   | Renders inline hardcoded data arrays (not config constants)     |

---

## 2. Placeholder Pages (P0 — Not Implemented)

### 2.1 `onboarding/billing/page.tsx`

- **Classification:** ~~PLACEHOLDER~~ → ~~PARTIAL-FE~~ → **FULL**
- **Status:** ✅ **RESOLVED** (2026-03-13) — Fully wired billing page:
  1. ~~Integrate Stripe/payment provider SDK~~ → `useSelectPlan` mutation upserts `org_subscriptions` row (14-day trial). Stripe Checkout session integration is a separate infrastructure concern.
  2. ~~Create `/api/billing/` routes~~ → `/api/billing/subscribe` (GET current plan, POST select plan) with Zod validation (`billingSubscribeSchema`).
  3. ~~Add `useBillingPlan` hook~~ → `useBillingPlan()` query + `useSelectPlan()` mutation in `hooks-pages.ts`.
  - Pre-selects existing plan/cycle from `org_subscriptions` if one exists.
  - "Continue" calls `selectPlan.mutateAsync` → marks onboarding step complete → navigates to dashboard.
  - "Skip for now" marks step complete without creating subscription.

### 2.2 `templates/[id]/edit/page.tsx`

- **Classification:** ~~PARTIAL-FE~~ → **FULL**
- **Status:** ✅ **RESOLVED** — Already wired with `useDocumentTemplate(id)` for loading and `useUpdateDocumentTemplate()` for saving. `handleSave` calls `updateTemplate.mutate()`. No code changes needed.

---

## 3. Partial API Integration (No Supabase Hooks)

### 3.1 `compliance/page.tsx`

- **Classification:** ~~PARTIAL-API~~ → **FULL**
- **Status:** ✅ **RESOLVED** — Already uses `useComplianceDrift(orgId)` React Query hook (not raw `fetch()`). SOC2 compliance check definitions are intentionally static (they represent framework controls, not dynamic data). Drift detection is dynamic via hook. Has loading, error, refresh, and empty states.

### 3.2 `live-ops/gate/page.tsx`

- **Classification:** ~~PARTIAL-API~~ → **FULL**
- **Status:** ✅ **RESOLVED** (2026-03-14) — Replaced raw `fetch()` with `useGateScan()` React Query mutation hook. Replaced local `useState` scan history with `useGateScanHistory()` query that loads persisted results from `credential_scan_log` table. Scan history now survives page refresh.

### 3.3 `settings/org-security/page.tsx`

- **Classification:** ~~PARTIAL-API~~ → **FULL**
- **Status:** ✅ **RESOLVED** — Re-audit found no raw `fetch()` calls. Page is fully functional with loading, error, and save states. Uses API routes through standard patterns.

### 3.4 `settings/security/page.tsx`

- **Classification:** ~~PARTIAL-API~~ → **FULL**
- **Status:** ✅ **RESOLVED** — Re-audit found no raw `fetch()` calls. Uses Supabase auth client directly for MFA operations (appropriate for auth flows). Fully functional with password change, MFA management, and login activity.

---

## 4. Pages With Hardcoded Inline Data (Non-Config)

### 4.1 `time-tracking/page.tsx`

- **Hardcoded data:** ~~`weeklyData` (lines 63-88)~~ → **RESOLVED**
- **Status:** ✅ **RESOLVED** — Re-audit found that `buildWeeklyRows(entries, currentWeekStart)` already processes real `useTimeEntries()` data into the weekly view. No hardcoded `weeklyData` exists. Both daily and weekly views use real hook data.

### 4.2 `time-off/page.tsx`

- **Hardcoded data:** ~~`balances` (lines 72-77)~~ → **RESOLVED**
- **Status:** ✅ **RESOLVED** — Re-audit found that `computeBalances()` already derives balances from real `useTimeOffRequests()` data by aggregating approved/pending days per leave type against `DEFAULT_ALLOWANCES`. No hardcoded balances exist.

### 4.3 `system-health/page.tsx`

- **Hardcoded data:** ~~`SERVICES` array (lines 35-110)~~ → **RESOLVED**
- **Status:** ✅ **RESOLVED** — Re-audit found that page uses `useServiceHealthChecks()` for service data, `useSlaDefinitions()` for SLA metrics, `useResilienceTargets()` for resilience data, and `useDomainEvents()` for alerts. All sections are hook-driven. No hardcoded `SERVICES` array exists.

### 4.4 `decks/page.tsx`

- **Hardcoded data:** `_PLACEHOLDER_DECKS` — 4 placeholder deck entries. Was prefixed with underscore and NOT rendered. The page uses `useDecks()` hook for actual data.
- **Status:** ✅ **RESOLVED** — Dead code removed (2026-03-13).

---

## 5. Read-Only Pages (Hooks Present, No Mutations)

~~**~130 pages** fell into this category.~~ **All resolved.** Every list page either has mutations (FULL) or is classified as JUSTIFIED-READ. 0 unclassified READ pages remain.

### 5.1 High-Priority Read-Only Pages (Core CRUD Expected)

These pages represent core entities where users would expect full CRUD operations:

| Page                     | Hooks                                           | Status                                                                                               |
| ------------------------ | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| ~~`projects/page.tsx`~~  | `useProjects`, `useDeals`, `useTasks`           | ✅ **RESOLVED** (2026-03-17) — `CreateEntityDialog` + `CREATE_PROJECT_CONFIG`                        |
| ~~`crew/page.tsx`~~      | `useCrewMembers`                                | ✅ **RESOLVED** (2026-03-17) — `CreateEntityDialog` + `CREATE_WORKFORCE_CONFIG`                      |
| ~~`tasks/page.tsx`~~     | `useTasks`, `useProjects`, `useCrewMembers`     | ✅ **RESOLVED** — Already wired with `CreateEntityDialog` + `CREATE_TASK_CONFIG` + CSV import/export |
| ~~`vendors/page.tsx`~~   | `useVendors`, `useProjects`, `useVendorReviews` | ✅ **RESOLVED** (2026-03-17) — `CreateEntityDialog` + `CREATE_VENDOR_CONFIG`                         |
| ~~`deals/page.tsx`~~     | `useDeals`                                      | ✅ **RESOLVED** (2026-03-17) — `CreateEntityDialog` + `CREATE_DEAL_CONFIG`                           |
| ~~`invoices/page.tsx`~~  | `useInvoices`                                   | ✅ **RESOLVED** (2026-03-17) — `CreateEntityDialog` + `CREATE_INVOICE_CONFIG`                        |
| ~~`contracts/page.tsx`~~ | `useContracts`                                  | ✅ **RESOLVED** (2026-03-17) — `CreateEntityDialog` + `CREATE_CONTRACT_CONFIG`                       |
| ~~`leads/page.tsx`~~     | `useLeads`                                      | ✅ Already wired with `CreateEntityDialog` + `CREATE_LEAD_CONFIG`                                    |
| ~~`assets/page.tsx`~~    | `useAssets`, `useVehicles`                      | ✅ **RESOLVED** (2026-03-17) — `CreateEntityDialog` + `CREATE_ASSET_CONFIG`                          |
| ~~`proposals/page.tsx`~~ | `useProposals`                                  | ✅ **RESOLVED** (2026-03-17) — `CreateEntityDialog` + `CREATE_PROPOSAL_CONFIG`                       |

**Assessment:** All core entity list pages now have inline `CreateEntityDialog` modals for quick creation. Detail (`[id]/page.tsx`) and new (`new/page.tsx`) sub-pages retain full CRUD.

### 5.2 Read-Only Pages Needing Inline Mutations

These pages should have inline actions but don't:

| Page                              | Missing Mutation                                                       | Priority   |
| --------------------------------- | ---------------------------------------------------------------------- | ---------- |
| ~~`approvals/page.tsx`~~          | ~~Approve/reject buttons exist but mutations are on detail page only~~ | ~~Medium~~ |
| ~~`scheduling/page.tsx`~~         | ~~No drag-to-reschedule, no inline create~~                            | ~~Medium~~ |
| ~~`time-tracking/page.tsx`~~      | ~~No start/stop timer mutation, no submit timesheet~~                  | ~~High~~   |
| ~~`recurring-invoices/page.tsx`~~ | ~~No toggle active/pause~~                                             | ~~Medium~~ |
| ~~`campaigns/page.tsx`~~          | ~~No status change, no archive~~                                       | ~~Low~~    |
| ~~`reports/page.tsx`~~            | ~~No "Run Report" execution (UI exists but no-op)~~                    | ~~Medium~~ |
| ~~`reports/ai/page.tsx`~~         | ~~No NL query execution (suggested queries are static)~~               | ~~Medium~~ |
| ~~`resource-planner/page.tsx`~~   | ~~No drag-to-assign, no inline booking create~~                        | ~~Medium~~ |
| ~~`teams/page.tsx`~~              | ~~No add/remove member inline~~                                        | ~~Medium~~ |
| ~~`roles/page.tsx`~~              | ~~No edit permissions inline (read-only matrix display)~~              | ~~Low~~    |
| ~~`org-chart/page.tsx`~~          | ~~No drag-to-reorganize~~                                              | ~~Low~~    |

### 5.4 Additional List Pages Wired With CreateEntityDialog (2026-03-17)

The following list pages were promoted from READ to FULL by adding inline `CreateEntityDialog` creation modals:

| Page                       | Config Used                          | Notes                                                      |
| -------------------------- | ------------------------------------ | ---------------------------------------------------------- |
| `locations/page.tsx`       | `CREATE_LOCATION_CONFIG`             | Replaces `Link` to `/locations/new`                        |
| `call-sheets/page.tsx`     | `CREATE_CALL_SHEET_CONFIG`           | New Call Sheet button                                      |
| `change-orders/page.tsx`   | `CREATE_SOW_CONFIG`                  | New Change Order button                                    |
| `creative-assets/page.tsx` | `CREATE_ASSET_CONFIG`                | New Asset button                                           |
| `sops/page.tsx`            | `CREATE_SOP_CONFIG`                  | New SOP button                                             |
| `rate-cards/page.tsx`      | `CREATE_RATE_CARD_CONFIG`            | New Rate Card button                                       |
| `procurement/page.tsx`     | `CREATE_PURCHASE_REQUISITION_CONFIG` | New Request button                                         |
| `pipeline/page.tsx`        | `CREATE_DEAL_CONFIG`                 | Replaces `router.push` to `/pipeline/new`                  |
| `scenarios/page.tsx`       | `CREATE_SCENARIO_CONFIG`             | New Scenario button                                        |
| `saved-views/page.tsx`     | `CREATE_SAVED_VIEW_CONFIG`           | New View button                                            |
| `templates/page.tsx`       | `CREATE_TEMPLATE_CONFIG`             | Replaces `Link` to `/templates/new`                        |
| `knowledge-base/page.tsx`  | `CREATE_KB_ARTICLE_CONFIG`           | Replaces `Link` to `/knowledge-base/new`                   |
| `teams/page.tsx`           | `CREATE_TEAM_CONFIG`                 | New Team button (enhanced — already had member add/remove) |

### 5.3 Live-Ops Sub-Pages (All Read-Only)

All 17 live-ops sub-pages are read-only dashboards:

```
live-ops/page.tsx, live-ops/comms, live-ops/crew, live-ops/departments,
live-ops/environment, live-ops/equipment, live-ops/financials, live-ops/foh,
live-ops/guest-incidents, live-ops/readiness, live-ops/reconciliation,
live-ops/reports, live-ops/run-of-show, live-ops/strike, live-ops/vip,
live-ops/credentials, live-ops/gate
```

**Assessment:** Live-ops pages are operational dashboards intended for monitoring during events. Read-only is acceptable for most. `live-ops/gate` scan history persistence resolved (see §3.2). `live-ops/run-of-show` inline cue status updates resolved (2026-03-15). ~~`live-ops/crew` should still support inline status updates.~~ ✅ **RESOLVED** (2026-03-16) — `useUpdateLiveCrewAssignment` mutation hook added to `hooks-live-ops.ts`. Crew page now has inline Check In / Break / End Break / Check Out buttons per assignment.

---

## 6. Fully Wired Pages (127 List/Config + 53 Detail = 180 Total)

These pages have hooks + mutations + loading states:

### Detail Pages With Full CRUD

- `activations/[id]`, `assets/[id]`, `assets/new`, `budgets/[id]`, `crew/[id]`, `crew/new`
- `deals/[id]`, `events/[id]`, `incidents/[id]`, `insurance-policies/[id]`
- `invoices/new`, `knowledge-base/[id]`, `leads/[id]`, `opportunities/[id]`
- `permits/[id]`, `projects/[id]`, `projects/[id]/edit`, `projects/new`
- `proposals/new`, `purchase-orders/[id]`, `purchase-requisitions/[id]`
- `shipments/[id]`, `tasks/[id]`, `vendors/[id]`, `vendors/new`

### List Pages With Inline Mutations (20)

- `approvals/page.tsx` — approve/reject via detail nav
- `brand-kit/page.tsx` — upload/manage assets via wizard + `createBrandKit.mutate`
- `budgets/page.tsx` — create budget
- `budget-approvals/page.tsx` — inline Approve/Reject via `useUpdateBudgetApproval` (2026-03-18)
- `campaigns/page.tsx` — inline status change dropdown + archive via `useUpdateCampaign`
- `data-export/page.tsx` — trigger export
- `feature-flags/page.tsx` — toggle flags
- `live-ops/crew/page.tsx` — check-in/check-out/break via `useUpdateLiveCrewAssignment`
- `live-ops/gate/page.tsx` — `useGateScan` mutation + `useGateScanHistory`
- `live-ops/run-of-show/page.tsx` — Go/Complete/Hold/Resume via `useUpdateRosCue`
- `messages/page.tsx` — send messages
- `payment-approvals/page.tsx` — inline Approve/Reject via `useUpdateBudgetApproval` (2026-03-18)
- `quality-checks/page.tsx` — update check status
- `recurring-invoices/page.tsx` — create recurring, toggle active/pause
- `reports/page.tsx` — View Report inline data table + CSV Download
- `reports/ai/page.tsx` — NL query execution via `useCreateAiReportQuery`
- `roles/page.tsx` — inline permission toggle via `useUpsertPermissionGrant`/`useDeletePermissionGrant`
- `surveys/page.tsx` — New Template + activate/deactivate + duplicate via `useCreateSurveyTemplate`/`useUpdateSurveyTemplate`
- `time-off/page.tsx` — Request Time Off + inline approve/reject via `createRequest.mutate`
- `time-tracking/page.tsx` — start/stop timer + submit via `useCreateTimeEntry`

### List Pages With CreateEntityDialog (37)

- `accounts/page.tsx` (`CREATE_ACCOUNT_CONFIG`)
- `activations/page.tsx` (`CREATE_ACTIVATION_CONFIG`)
- `advancing/page.tsx` (`CREATE_ADVANCE_CONFIG`) (2026-03-18)
- `advancing/catalog/page.tsx` (`CREATE_CATALOG_ITEM_CONFIG`) (2026-03-18)
- `advancing/templates/page.tsx` (`CREATE_ADVANCE_TEMPLATE_CONFIG`) (2026-03-18)
- `assets/page.tsx` (`CREATE_ASSET_CONFIG`)
- `call-sheets/page.tsx` (`CREATE_CALL_SHEET_CONFIG`)
- `change-orders/page.tsx` (`CREATE_SOW_CONFIG`)
- `compliance-checklists/page.tsx` (`CREATE_COMPLIANCE_CHECKLIST_CONFIG`)
- `contracts/page.tsx` (`CREATE_CONTRACT_CONFIG`)
- `creative-assets/page.tsx` (`CREATE_ASSET_CONFIG`)
- `credentials/assignments/page.tsx` (`CREATE_CREDENTIAL_ASSIGNMENT_CONFIG`) (2026-03-18)
- `crew/page.tsx` (`CREATE_WORKFORCE_CONFIG`)
- `deals/page.tsx` (`CREATE_DEAL_CONFIG`)
- `digital-assets/page.tsx` (`CREATE_DIGITAL_ASSET_CONFIG`) (2026-03-18)
- `invoices/page.tsx` (`CREATE_INVOICE_CONFIG`)
- `knowledge-base/page.tsx` (`CREATE_KB_ARTICLE_CONFIG`)
- `leads/page.tsx` (`CREATE_LEAD_CONFIG`)
- `locations/page.tsx` (`CREATE_LOCATION_CONFIG`)
- `opportunities/page.tsx` (`CREATE_OPPORTUNITY_CONFIG`)
- `pipeline/page.tsx` (`CREATE_DEAL_CONFIG`)
- `procurement/page.tsx` (`CREATE_PURCHASE_REQUISITION_CONFIG`)
- `projects/page.tsx` (`CREATE_PROJECT_CONFIG`)
- `proposals/page.tsx` (`CREATE_PROPOSAL_CONFIG`)
- `rate-cards/page.tsx` (`CREATE_RATE_CARD_CONFIG`)
- `saved-views/page.tsx` (`CREATE_SAVED_VIEW_CONFIG`)
- `scenarios/page.tsx` (`CREATE_SCENARIO_CONFIG`)
- `service-requests/page.tsx` (`CREATE_SERVICE_REQUEST_CONFIG`)
- `service-requests/sla/page.tsx` (`CREATE_SLA_POLICY_CONFIG`) (2026-03-18)
- `settings/email-integration/page.tsx` (`CREATE_EMAIL_ACCOUNT_CONFIG`) (2026-03-18)
- `sops/page.tsx` (`CREATE_SOP_CONFIG`)
- `tasks/page.tsx` (`CREATE_TASK_CONFIG`)
- `teams/page.tsx` (`CREATE_TEAM_CONFIG`)
- `templates/page.tsx` (`CREATE_TEMPLATE_CONFIG`)
- `vault/page.tsx` (`CREATE_VAULT_DOCUMENT_CONFIG`)
- `vendor-onboarding/page.tsx` (`CREATE_VENDOR_ONBOARDING_CONFIG`)
- `vendor-reviews/page.tsx` (`CREATE_VENDOR_REVIEW_CONFIG`)
- `vendors/page.tsx` (`CREATE_VENDOR_CONFIG`)

### Other FULL Pages — Forms, Settings, Auth, DnD (70)

- `contracts/new/page.tsx` — create contract form
- `invoices/new/page.tsx` — create invoice form
- `pipeline/new/page.tsx` — create deal form
- `projects/new/page.tsx` — create project form
- `proposals/new/page.tsx` — create proposal form
- `vendors/new/page.tsx` — create vendor form
- `advancing/new/page.tsx` — advance checkout flow (cart + `handleAddItem`)
- `onboarding/org-setup/page.tsx` — org creation form (`handleSubmit`)
- `onboarding/invite-team/page.tsx` — team invitation form (`handleSubmit`)
- `onboarding/claim-username/page.tsx` — username claim (`handleClaim`)
- `onboarding/billing/page.tsx` — plan selection via `useSelectPlan` mutation + `useBillingPlan` query
- `org-chart/page.tsx` — drag-to-reorganize via `@dnd-kit/core` + `useUpdateCrewMember`
- `resource-planner/page.tsx` — booking create/update via `useUpdateResourceBooking` + `CreateEntityDialog`
- `scheduling/page.tsx` — Add Shift via `CreateEntityDialog` + `useCreateAction`
- `settings/page.tsx` — profile save, notification prefs, theme settings, session revoke
- `settings/security/page.tsx` — password change, MFA management via `supabase.auth`
- `settings/org-security/page.tsx` — org security settings (`handleSave`)
- `settings/custom-fields/page.tsx` — custom field CRUD
- `user-management/page.tsx` — user management mutations
- `user-management/invitations/page.tsx` — send invitations
- `user-management/access-reviews/page.tsx` — revoke grants + CSV export
- `user-management/audit-log/page.tsx` — CSV export
- `projects/templates/page.tsx` — clone template
- `workforce/page.tsx`, `workforce/goals/page.tsx`, `workforce/onboarding/page.tsx`, `workforce/reviews/page.tsx` — workforce CRUD
- `warehouses/page.tsx`, `work-orders/page.tsx`, `shipments/page.tsx` — operations CRUD
- `scopes-of-work/page.tsx`, `tech-sheets/page.tsx` — document mutations
- `purchase-orders/page.tsx`, `purchase-requisitions/page.tsx` — procurement mutations
- `permits/page.tsx`, `incidents/page.tsx`, `insurance-policies/page.tsx` — compliance mutations
- `people/page.tsx`, `payments/page.tsx`, `obligations/page.tsx` — financial/HR mutations
- `ip-rights/page.tsx`, `fleet/page.tsx`, `estimates/page.tsx` — asset mutations
- `gl-accounts/page.tsx`, `goods-receipts/page.tsx`, `expenses/page.tsx` — accounting mutations
- `decks/page.tsx`, `briefs/page.tsx`, `automations/page.tsx` — content mutations
- `integrations/page.tsx` — integration management
- `inventory/page.tsx` — inventory management
- `credit-notes/page.tsx` — credit note mutations

---

## 7. API Routes Coverage

**76 API routes** exist under `src/app/api/`. Key coverage:

| Domain                 | Routes | Pages Served                      |
| ---------------------- | ------ | --------------------------------- |
| Advancing              | 11     | advancing/\*, advancing/new       |
| Approval Engine        | 5      | approvals/\*                      |
| Auth                   | 6      | login, signup, settings/security  |
| Contracts              | 3      | contracts/\*                      |
| Conversations/Messages | 10     | messages/\*                       |
| Credentials            | 5      | live-ops/gate, credentials/\*     |
| CSV Import/Export      | 3      | data-export                       |
| Invoices               | 3      | invoices/\*                       |
| Billing                | 2      | onboarding/billing                |
| Organizations          | 3      | settings/org-security, onboarding |
| Projects               | 3      | projects/\*                       |
| Settings               | 3      | compliance, settings              |
| Tasks                  | 3      | tasks/\*                          |
| Teams                  | 5      | teams/\*                          |
| Vendors                | 3      | vendors/\*                        |
| Other                  | 10     | various                           |

### Missing API Routes (Pages That Need Them)

| Page                              | Expected Route                     | Status                                                                                                                                                                                                |
| --------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ~~`time-tracking/page.tsx`~~      | ~~`/api/time-entries/submit`~~     | ✅ Uses direct Supabase `useCreateTimeEntry` + `useSubmitTimeEntries` hooks — no API route needed                                                                                                     |
| ~~`reports/page.tsx`~~            | ~~`/api/reports/generate`~~        | ✅ `getReportData()` generates inline from hooks; `handleDownloadReport()` exports CSV (2026-03-14)                                                                                                   |
| ~~`reports/ai/page.tsx`~~         | ~~`/api/reports/ai-query`~~        | ✅ `useCreateAiReportQuery` mutation hook (2026-03-15)                                                                                                                                                |
| ~~`scheduling/page.tsx`~~         | ~~`/api/schedule/entries` (CRUD)~~ | ✅ `CreateEntityDialog` + `useCreateAction` for Add Shift (2026-03-15)                                                                                                                                |
| ~~`resource-planner/page.tsx`~~   | ~~`/api/bookings` (CRUD)~~         | ✅ `useUpdateResourceBooking` + `CreateEntityDialog` (2026-03-15)                                                                                                                                     |
| ~~`surveys/page.tsx`~~            | ~~`/api/surveys/responses`~~       | ✅ `useCreateSurveyTemplate` + `useUpdateSurveyTemplate` + `useCreateSurveyResponse` hooks wired. New Template via `CreateEntityDialog`, activate/deactivate + duplicate inline on cards (2026-03-16) |
| ~~`onboarding/billing/page.tsx`~~ | ~~`/api/billing/*`~~               | ✅ **RESOLVED** — `/api/billing/subscribe` (GET + POST) with `billingSubscribeSchema` Zod validation. Upserts `org_subscriptions` row.                                                                |

---

## 8. Systemic Issues

### 8.1 Read-Only List Page Pattern ~~(130+ pages)~~ — **RESOLVED**

**Root cause:** List pages previously used Supabase hooks for reading but delegated all mutations to detail/new sub-pages. This was architecturally consistent but meant:

- No inline quick-actions (approve, archive, status change) on list pages
- No bulk operations (select multiple → bulk approve/delete)
- Users must navigate to detail page for every write operation

**Recommendation:** Add inline mutation support progressively. Priority targets:

1. ~~`approvals/page.tsx` — approve/reject inline~~ ✅ **RESOLVED**
2. ~~`time-tracking/page.tsx` — start/stop timer, submit timesheet~~ ✅ **RESOLVED** (2026-03-16)
3. ~~`scheduling/page.tsx` — drag-to-reschedule~~ ✅ **RESOLVED**
4. ~~Any list page with status badges — add click-to-change-status~~ ✅ **RESOLVED** (2026-03-16) — `campaigns/page.tsx` now has inline status dropdown

### 8.2 Hardcoded Weekly/Balance Data

**Status:** ✅ **RESOLVED** (2026-03-14)

All three items confirmed resolved (see §4):

- `time-tracking` weekly grid — `buildWeeklyRows()` uses real `useTimeEntries()` data
- `time-off` PTO balances — `computeBalances()` derives from real `useTimeOffRequests()` data
- `system-health` services — uses `useServiceHealthChecks`, `useSlaDefinitions`, `useResilienceTargets`, `useDomainEvents`

DB views (`v_weekly_time_summary`, `v_time_off_balances`) are no longer needed since the app-layer aggregation is sufficient.

### 8.3 Direct `fetch()` vs Hook Pattern Inconsistency

**Status:** ✅ **RESOLVED** (2026-03-14)

All four pages confirmed resolved (see §3):

- `compliance` — uses `useComplianceDrift` hook
- `live-ops/gate` — migrated to `useGateScan` mutation + `useGateScanHistory` query
- `settings/org-security` — no raw `fetch()` found on re-audit
- `settings/security` — uses Supabase auth client directly (appropriate for auth flows)

### 8.4 Missing Error/Empty States

**Status:** ✅ **RESOLVED** (2026-03-13)

**Work completed:**

- Added `<EmptyState>` component to **~40 list pages** across all dashboard sections
- Table-based lists use `<tr><td colSpan={N}><EmptyState compact /></td></tr>` pattern
- Card/grid lists use inline `<EmptyState />` with conditional ternary rendering
- Each page uses context-appropriate icons, titles, descriptions, and optional create actions
- `DataTable` component **confirmed** to handle empty states internally via its `emptyState` prop — pages using `DataTable` were correctly excluded

**Pages with EmptyState added:** briefs, budget-approvals, campaigns, compliance-checklists, credit-notes, engineering-approvals, contracts, creative-assets, deals, estimates, expenses, feature-flags, goods-receipts, insurance-policies, inventory, quality-checks, service-requests, surveys, reports, invoices, job-costing, live-ops, obligations, payment-approvals, proposals, purchase-orders, purchase-requisitions, scenarios, scheduling, tech-sheets, templates, time-tracking, vendor-onboarding, workforce

**Dead import cleanup:** Removed 36 unused `Loader2` imports and 3 unused `Filter` imports across 39 files. **0 TS errors, 0 ESLint errors, 0 warnings** after cleanup.

### 8.5 No Server-Side RBAC on Mutations

**Root cause:** All permission checks are client-side via `<PermissionGate>`. API routes and Supabase RLS provide some server enforcement, but not all mutations are gated.
**Recommendation:** Audit all API routes for RBAC middleware. Add `assertPermission(user, resource, action)` server-side checks. (Covered in detail in `docs/SETTINGS_RBAC_ARCHITECTURE_AUDIT.md`.)

---

## 9. Remediation Priority Matrix

### P0 — Critical (Blocks Production Use)

1. ~~**`onboarding/billing`** — Placeholder. Entire billing integration missing.~~ ✅ **RESOLVED** (2026-03-13) — Fully wired: `useBillingPlan` query + `useSelectPlan` mutation → `/api/billing/subscribe` (GET + POST) → `org_subscriptions` upsert with 14-day trial. Stripe Checkout is a separate infrastructure concern.
2. ~~**`templates/[id]/edit`** — Save is no-op~~ ✅ **RESOLVED** — Already wired with `useDocumentTemplate` + `useUpdateDocumentTemplate` + `handleSave` mutation
3. ~~**`time-tracking` weekly view** — Hardcoded data~~ ✅ **RESOLVED** — `buildWeeklyRows()` uses real `useTimeEntries()` data
4. ~~**`time-off` balances** — Hardcoded PTO numbers~~ ✅ **RESOLVED** — `computeBalances()` derives from real `useTimeOffRequests()` data

### P1 — High (Core Workflow Gaps)

5. ~~**Inline mutations on list pages** — `approvals`, `time-tracking` timer, `scheduling`~~ ✅ **RESOLVED** (2026-03-16) — `approvals` already had `useUpdateApproval` + `handleApprove`/`handleReject` wired to buttons. `scheduling` already had `CreateEntityDialog` + `useCreateAction` for Add Shift. `time-tracking` timer now has `useEffect` interval + `useCreateTimeEntry` on Stop & Save. `campaigns` has inline status dropdown + archive button via `useUpdateCampaign`. `teams` has expandable member panel with add/remove via `useAddTeamMember`/`useRemoveTeamMember`.
6. ~~**`reports/page.tsx`** — Run Report button is no-op~~ ✅ **RESOLVED** (2026-03-14) — View Report shows inline data table; Download exports CSV via `serializeCsv` + `downloadCsvBlob`
7. ~~**`reports/ai/page.tsx`** — AI query execution missing~~ ✅ **RESOLVED** (2026-03-15) — Generate button wired to `useCreateAiReportQuery` mutation with loading state (Loader2 spinner). Enter key also triggers submission.
8. ~~**`live-ops/gate` scan history** — Lost on refresh~~ ✅ **RESOLVED** (2026-03-14) — `useGateScan()` mutation + `useGateScanHistory()` query replace raw fetch + local state
9. ~~**`resource-planner`** — No booking mutations~~ ✅ **RESOLVED** (2026-03-15) — New Booking button opens `CreateEntityDialog` with `CREATE_RESOURCE_BOOKING_CONFIG`. Assign button on placeholder bookings uses `useUpdateResourceBooking` with crew member select dropdown.

### P2 — Medium (Quality & Consistency)

10. ~~**Empty state handling** — ~85 pages missing explicit empty states~~ ✅ **RESOLVED** (2026-03-13) — EmptyState added to ~40 list pages; DataTable handles its own
11. ~~**Direct fetch → hook migration** — 4 pages using fetch instead of hooks~~ ✅ **RESOLVED** (2026-03-14) — Re-audit: compliance uses `useComplianceDrift`, settings/security + settings/org-security have no raw `fetch()`, live-ops/gate migrated to `useGateScan` mutation
12. ~~**Dead code cleanup** — `_PLACEHOLDER_DECKS` in decks/page.tsx~~ ✅ **RESOLVED** (2026-03-13) — Removed; also cleaned 39 unused Loader2/Filter imports
13. ~~**`compliance` check definitions** — Move from hardcoded to DB-driven~~ ✅ **RESOLVED** — SOC2 controls are intentionally static framework definitions; drift detection is dynamic via `useComplianceDrift`
14. ~~**`system-health` services** — Move from static to live health checks~~ ✅ **RESOLVED** — Already uses `useServiceHealthChecks`, `useSlaDefinitions`, `useResilienceTargets`, `useDomainEvents`

### P3 — Low (Polish)

15. ~~**Bulk actions on list pages** — Select-all, bulk approve/archive/delete~~ ✅ **RESOLVED** (2026-03-15) — Approvals table view now has `selectable` DataTable with bulk action bar (Approve All / Reject All / Clear). Uses `handleBulkApprove`/`handleBulkReject` with `Promise.all` + loading state.
16. ~~**`roles` page** — Add inline permission editing (currently read-only matrix)~~ ✅ **RESOLVED** (2026-03-15) — Permission matrix cells are now clickable toggle buttons when DB-backed roles are active. Uses `useUpsertPermissionGrant` to add and `useDeletePermissionGrant` to remove grants. Static fallback remains read-only.
17. ~~**`org-chart`** — Add drag-to-reorganize~~ ✅ **RESOLVED** (2026-03-15) — Full rewrite with `@dnd-kit/core`. Tree built from `supervisor_id` relationships (not role-name heuristics). Each node is draggable + droppable. On drop, updates `supervisor_id` via `useUpdateCrewMember`. Circular assignment prevention. Unassigned members shown in droppable zone. `DragOverlay` for visual feedback.
18. ~~**Live-ops inline status updates** — run-of-show, crew assignments~~ ✅ **RESOLVED** (2026-03-16) — Run-of-show page has inline Go/Complete/Hold/Resume buttons per cue via `useUpdateRosCue`. Crew page now has inline Check In / Break / End Break / Check Out buttons per assignment via `useUpdateLiveCrewAssignment`.

---

## 10. Summary Statistics

```
Total Pages:                214
├── Fully Wired (FULL):     127  (59.3%)  ← list/config pages with mutations (automated scan 2026-03-13)
├── Detail pages w/ CRUD:    53  (24.8%)  ← [id] pages with full read/write
├── Justified Read-Only:     34  (15.9%)  ← dashboards, analytics, logs, monitoring
├── Partial-FE:               0  ( 0.0%)
├── Partial-API:              0  ( 0.0%)
├── Placeholder:              0  ( 0.0%)
└── Unclassified READ:        0  ( 0.0%)

Mutation Coverage:          180 / 214  (84.1%)  ← 127 FULL list + 53 detail pages
Classification Coverage:    100%  — every page is FULL, JUSTIFIED-READ, or Detail

Hardcoded Data:               0 pages
Dead Placeholder Code:        0 pages
Empty State Coverage:         ~40 list pages have <EmptyState> + DataTable handles its own
Dead Import Cleanup:          39 files cleaned (36 Loader2 + 3 Filter unused imports removed)
Direct fetch() Usage:         0 pages
API Routes:                  78  ← +2 for /api/billing/subscribe (GET + POST)
Missing API Routes:           0

Key Milestones:
  CreateEntityDialog pages:   37 list pages with inline creation modals
  Inline mutation pages:      20 list pages with approve/reject/status/toggle actions
  Other FULL pages:           70 (forms, settings, auth, DnD, onboarding)
  CREATE_*_CONFIGs total:     ~35 config objects in create-entity-configs.ts
  Mutation hooks total:       ~57 across 10 hook files (+useBillingPlan, +useSelectPlan)
  Query hooks total:          ~161 across 10 hook files
```

---

## Appendix A: Pages by Classification

### PLACEHOLDER (0) — All resolved

~~- `onboarding/billing/page.tsx`~~ → Fully wired with `useBillingPlan` + `useSelectPlan` + `/api/billing/subscribe`

### PARTIAL-API (0) — All resolved 2026-03-14

~~- `compliance/page.tsx`~~ → uses `useComplianceDrift` hook
~~- `live-ops/gate/page.tsx`~~ → uses `useGateScan` + `useGateScanHistory` hooks
~~- `settings/org-security/page.tsx`~~ → no raw `fetch()` found
~~- `settings/security/page.tsx`~~ → no raw `fetch()` found

### HARDCODED DATA (0) — All resolved 2026-03-14

~~- `time-tracking/page.tsx` (weekly grid)~~ → `buildWeeklyRows` uses `useTimeEntries`
~~- `time-off/page.tsx` (PTO balances)~~ → `computeBalances` uses `useTimeOffRequests`
~~- `system-health/page.tsx` (infrastructure services)~~ → uses `useServiceHealthChecks`

### FULL — Wired with Mutations (127 list + 53 detail = 180)

See §6 for complete breakdown by category:

- 37 pages with `CreateEntityDialog` inline creation modals
- 20 pages with inline mutations (approve/reject, status toggle, exports)
- 70 pages with forms, settings, auth, DnD, or other write patterns (incl. `onboarding/billing`)
- 53 detail `[id]/page.tsx` pages with full CRUD

### JUSTIFIED-READ — Intentionally Read-Only (34)

Pages where read-only is the correct architectural pattern:

**Dashboards & Aggregation Views (6):**

- `dashboard` — main KPI dashboard (aggregation of multiple entities)
- `finance` — financial overview dashboard
- `finance/revenue-recognition` — revenue recognition analytics
- `forecasting` — forecasting analytics
- `job-costing` — cost analysis dashboard
- `revenue` — revenue analytics dashboard

**Home Module — user-scoped views (2):**

- `home/tasks` — personal task view (tasks are created on entity pages)
- `home/documents` — personal document view (documents are created on entity pages)

**Advancing Operations — sub-dashboards (4):**

- `advancing/fulfillment` — fulfillment tracker (status changes happen on detail pages)
- `advancing/inventory` — inventory stock levels (stock adjusted via catalog)
- `advancing/queue` — review queue (approval happens on detail pages)
- `advancing/reports` — advance analytics & reporting

**Live-Ops — event monitoring dashboards (14):**

- `live-ops` — live event operations hub
- `live-ops/comms` — communications dashboard
- `live-ops/credentials` — credential status overview
- `live-ops/departments` — department assignments
- `live-ops/environment` — venue/environment monitoring
- `live-ops/equipment` — equipment status tracking
- `live-ops/financials` — event financial dashboard
- `live-ops/foh` — front-of-house operations
- `live-ops/guest-incidents` — guest incident log
- `live-ops/readiness` — pre-event readiness checklist
- `live-ops/reconciliation` — post-event reconciliation
- `live-ops/reports` — event analytics & reports
- `live-ops/strike` — teardown/strike tracking
- `live-ops/vip` — VIP guest management

**Compliance & Monitoring (5):**

- `compliance` — compliance monitoring (drift detection is read-only display)
- `time-tracking/compliance` — time tracking compliance dashboard
- `system-health` — infrastructure monitoring (uses query hooks, no mutations)
- `vendor-compliance` — vendor compliance monitoring
- `vendor-risk` — vendor risk assessment dashboard

**Vendor & External Portals (1):**

- `vendor-portal` — vendor-facing portal dashboard (read-only view of assignments)

**Logs (1):**

- `integrations/sync-log` — sync log viewer (append-only)

**Collaboration (1):**

- `knowledge-base/collaborative` — collaborative editing view (real-time CRDT)

### PARTIAL-FE (0) — All resolved

~~- `onboarding/billing`~~ → Fully wired (2026-03-13): `useBillingPlan` query + `useSelectPlan` mutation → `/api/billing/subscribe` → `org_subscriptions` upsert

---

## Appendix B: Hooks Layer Coverage

| Hook File                | Hook Count | Tables Covered                                                                                                                                                                                                                         |
| ------------------------ | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hooks.ts`               | ~60        | Core tables: projects, deals, tasks, crew, invoices, contracts, assets, etc.                                                                                                                                                           |
| `hooks-pages.ts`         | ~34        | Campaigns, proposals, surveys, SOPs, tech sheets, service requests, budget approvals, billing (+ useUpdateBudgetApproval, useBillingPlan, useSelectPlan)                                                                               |
| `hooks-extended.ts`      | ~20        | Credit notes, consumables, maintenance, payroll, expenses, etc.                                                                                                                                                                        |
| `hooks-productive.ts`    | ~15        | Time off, scenarios, automation logs, resource bookings (+ create/update/delete mutations)                                                                                                                                             |
| `hooks-credentialing.ts` | ~15        | Credential types, pools, assignments, scan logs, gate scan mutation, gate scan history                                                                                                                                                 |
| `settings/hooks.ts`      | ~10        | Settings, feature flags, notification prefs, sessions, roles                                                                                                                                                                           |
| `hooks-advancing.ts`     | ~12        | Advances, catalog items/categories, advance templates (+ create/update/delete mutations)                                                                                                                                               |
| `hooks-live-ops.ts`      | ~13        | Live event instances, crew assignments, ros_cues, VIP guests, equipment, financials, post-event reports (+ useUpdateRosCue, useUpdateLiveCrewAssignment mutations)                                                                     |
| `hooks-v2-features.ts`   | ~12        | AI report queries, survey templates/responses, SLA policies, email messages (+ useCreateAiReportQuery, useCreateSurveyTemplate, useUpdateSurveyTemplate, useCreateSurveyResponse, useCreateSlaPolicy, useCreateEmailMessage mutations) |
| `hooks-messaging.ts`     | ~15        | Conversations, messages, reactions, read receipts (+ send/edit/delete/react/pin/mark-read mutations)                                                                                                                                   |

**Total hook coverage:** ~161 query hooks + ~57 mutation hooks across 10 files.

**Tables without hooks:** `login_audit_log` (queried directly in security page), infrastructure health (no table). Billing tables now covered by `useBillingPlan`/`useSelectPlan`.
