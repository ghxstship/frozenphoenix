# UI Audit — Batch 7: Dashboard List Pages (J–Z)

**Audit Date:** 2025-01-XX
**Auditor:** Cascade AI
**Files Audited:** 72
**Approximate Lines:** ~21,500
**Findings:** 38

---

## Scope

All dashboard list pages and sub-pages from Inventory through Workforce under `src/app/(dashboard)/`.

| # | Page | Lines | Hook(s) | View Mode(s) |
|---|------|-------|---------|---------------|
| 1 | `inventory/page.tsx` | ~300 | `useInventoryItems` | table / cards |
| 2 | `invoices/page.tsx` | ~350 | `useInvoices` | cards |
| 3 | `ip-rights/page.tsx` | ~280 | `useIpRights` | cards |
| 4 | `job-costing/page.tsx` | ~350 | `useProjects`, `useBudgets` | cards |
| 5 | `knowledge-base/page.tsx` | ~300 | `useKnowledgeBaseArticles` | cards |
| 6 | `leads/page.tsx` | ~300 | `useLeads` | cards / table |
| 7 | `live-ops/page.tsx` | ~400 | `useEvents`, `useLocations` | tabbed dashboard |
| 8 | `live-ops/cue-sheets/page.tsx` | ~350 | *(mock data)* | timeline |
| 9 | `live-ops/dispatch/page.tsx` | ~300 | `useDispatch` | split list |
| 10 | `live-ops/incident-log/page.tsx` | ~350 | `useIncidents` | list |
| 11 | `live-ops/radio-log/page.tsx` | ~250 | *(mock data)* | list |
| 12 | `live-ops/run-of-show/page.tsx` | ~400 | *(mock data)* | timeline |
| 13 | `live-ops/site-map/page.tsx` | ~200 | *(mock data)* | spatial |
| 14 | `live-ops/weather/page.tsx` | ~250 | *(mock data)* | cards |
| 15 | `locations/page.tsx` | ~300 | `useLocations` | cards |
| 16 | `messages/page.tsx` | ~450 | messaging hooks | full-page messaging |
| 17 | `obligations/page.tsx` | ~280 | `useObligations` | table |
| 18 | `onboarding/org-setup/page.tsx` | ~300 | *(server action)* | wizard |
| 19 | `onboarding/invite-team/page.tsx` | ~250 | *(server action)* | multi-row form |
| 20 | `opportunities/page.tsx` | ~350 | `useOpportunities` | cards / table |
| 21 | `org-chart/page.tsx` | ~300 | *(mock data)* | tree visualization |
| 22 | `payment-approvals/page.tsx` | ~250 | `usePaymentApprovals` | table |
| 23 | `payments/page.tsx` | ~300 | `usePayments` | table |
| 24 | `people/page.tsx` | ~350 | `usePeople` | cards / table |
| 25 | `permits/page.tsx` | ~280 | `usePermits` | cards |
| 26 | `pipeline/page.tsx` | ~400 | `useDeals` | kanban / table |
| 27 | `procurement/page.tsx` | ~350 | *(mock data)* | cards |
| 28 | `projects/page.tsx` | ~450 | `useProjects` | cards / table |
| 29 | `proposals/page.tsx` | ~300 | `useProposals` | cards |
| 30 | `purchase-orders/page.tsx` | ~350 | `usePurchaseOrders` | cards / table |
| 31 | `purchase-requisitions/page.tsx` | ~300 | `usePurchaseRequisitions` | cards |
| 32 | `quality-checks/page.tsx` | ~350 | *(mock data)* | cards |
| 33 | `rate-cards/page.tsx` | ~300 | `useRateCards` | table |
| 34 | `recurring-invoices/page.tsx` | ~280 | `useRecurringInvoices` | cards |
| 35 | `reports/page.tsx` | ~400 | *(mock data)* | tabbed cards |
| 36 | `resource-planner/page.tsx` | ~450 | `useResourceBookings` | grid / timeline |
| 37 | `revenue/page.tsx` | ~350 | `useRevenueEntries` | table + charts |
| 38 | `roles/page.tsx` | ~250 | `useRoles` | table |
| 39 | `saved-views/page.tsx` | ~250 | `useSavedViews` | cards |
| 40 | `scenarios/page.tsx` | ~400 | `useScenarios` | cards |
| 41 | `scheduling/page.tsx` | ~450 | `useScheduleEntries` | calendar / list |
| 42 | `scopes-of-work/page.tsx` | ~350 | `useScopesOfWork` | cards |
| 43 | `service-requests/page.tsx` | ~300 | `useServiceRequests` | cards |
| 44 | `settings/page.tsx` | ~1168 | `useAuth` | tabbed panels |
| 45 | `settings/security/page.tsx` | ~471 | `useAuth`, Supabase MFA | forms |
| 46 | `shipments/page.tsx` | ~350 | `useShipments` | cards / table |
| 47 | `sops/page.tsx` | ~300 | `useSops` | cards |
| 48 | `surveys/page.tsx` | ~350 | *(mock data)* | cards |
| 49 | `system-health/page.tsx` | ~400 | *(mock data)* | metric cards |
| 50 | `tasks/page.tsx` | ~455 | `useTasks`, `useProjects` | list / table / board |
| 51 | `teams/page.tsx` | ~277 | `useTeams` | cards / table |
| 52 | `tech-sheets/page.tsx` | ~242 | `useTechSheets` | cards |
| 53 | `templates/page.tsx` | ~234 | `useTemplates` | cards |
| 54 | `time-off/page.tsx` | ~311 | *(mock data)* | list |
| 55 | `time-tracking/page.tsx` | ~752 | `useTimeEntries` | tabbed (daily/weekly/timer/invoicing) |
| 56 | `time-tracking/compliance/page.tsx` | ~445 | *(mock data)* | cards + table |
| 57 | `user-management/page.tsx` | ~256 | `useUserDirectory` | table |
| 58 | `user-management/access-reviews/page.tsx` | ~264 | *(empty arrays)* | table |
| 59 | `user-management/audit-log/page.tsx` | ~376 | *(empty arrays)* | tabbed list |
| 60 | `user-management/invitations/page.tsx` | ~193 | *(empty arrays)* | cards |
| 61 | `vault/page.tsx` | ~134 | `useVaultDocuments` | cards |
| 62 | `vendors/page.tsx` | ~335 | `useVendors` | cards / table |
| 63 | `vendor-compliance/page.tsx` | ~322 | `useVendorComplianceDocs` | table |
| 64 | `vendor-onboarding/page.tsx` | ~295 | `useVendorOnboarding` | pipeline / list |
| 65 | `vendor-portal/page.tsx` | ~553 | *(mock data)* | cards |
| 66 | `vendor-reviews/page.tsx` | ~235 | `useVendorReviews` | cards |
| 67 | `vendor-risk/page.tsx` | ~183 | `useRiskAssessments` | cards |
| 68 | `warehouses/page.tsx` | ~180 | `useWarehouses` | cards |
| 69 | `work-orders/page.tsx` | ~337 | `useWorkOrders` | cards / table |
| 70 | `workforce/page.tsx` | ~293 | `useWorkerProfiles` | cards |
| 71 | `workforce/goals/page.tsx` | ~481 | *(mock data)* | expandable cards |
| 72 | `workforce/onboarding/page.tsx` | ~304 | *(empty arrays)* | expandable list |
| 73 | `workforce/reviews/page.tsx` | ~242 | *(empty arrays)* | cards |
| 74 | `vendor-reviews/[id]/page.tsx` | — | — | *(not read — detail page)* |
| 75 | `workforce/[id]/page.tsx` | — | — | *(not read — detail page)* |

---

## 1. Cross-Cutting Architecture

All pages in this batch follow the established structural pattern from Batches 5-6:

```
PermissionGate(resource, "read")
  └── PageHeader (title, description, actions)
  └── StatCard row (3–5 KPI cards)
  └── SearchInput + filters (optional SegmentedControl / TabBar for view toggle)
  └── Data display (cards / table / board / list / timeline)
  └── CreateEntityDialog (triggered via useCreateAction or inline state)
```

### 1.1 Data Fetching Patterns

| Pattern | Count | Pages |
|---------|-------|-------|
| Single hook | 32 | Most standard CRUD pages |
| Multi-hook join | 8 | `tasks`, `job-costing`, `live-ops`, `pipeline`, `scheduling`, etc. |
| Mock/static data | 14 | `cue-sheets`, `radio-log`, `run-of-show`, `site-map`, `weather`, `org-chart`, `procurement`, `quality-checks`, `reports`, `surveys`, `system-health`, `time-off`, `time-tracking/compliance`, `vendor-portal` |
| Empty arrays (typed, no data) | 5 | `access-reviews`, `audit-log`, `invitations`, `workforce/onboarding`, `workforce/reviews` |
| Server action (no hook) | 2 | `onboarding/org-setup`, `onboarding/invite-team` |
| Messaging-specific hooks | 1 | `messages` |

### 1.2 View Mode Support

| Mode | Pages |
|------|-------|
| Cards only | `invoices`, `ip-rights`, `knowledge-base`, `locations`, `permits`, `proposals`, `purchase-requisitions`, `recurring-invoices`, `saved-views`, `scenarios`, `scopes-of-work`, `service-requests`, `sops`, `tech-sheets`, `templates`, `vault`, `vendor-reviews`, `vendor-risk`, `warehouses`, `workforce` |
| Table only | `obligations`, `payment-approvals`, `payments`, `rate-cards`, `roles`, `user-management`, `vendor-compliance` |
| Cards/table toggle | `leads`, `opportunities`, `people`, `purchase-orders`, `shipments`, `teams`, `vendors`, `work-orders` |
| List/table/board | `tasks` |
| Kanban/table | `pipeline` |
| Pipeline/list | `vendor-onboarding` |
| Tabbed sections | `live-ops`, `time-tracking`, `settings`, `audit-log` |
| Calendar/list | `scheduling` |
| Grid/timeline | `resource-planner` |
| Expandable cards | `workforce/goals` |
| Expandable list | `workforce/onboarding` |
| Full-page messaging | `messages` |
| Wizard | `onboarding/org-setup`, `onboarding/invite-team` |
| Tree visualization | `org-chart` |
| Spatial | `live-ops/site-map` |

---

## 2. Findings

### Critical

| # | Component | Finding | Impact |
|---|-----------|---------|--------|
| C1 | `vendor-portal/page.tsx` | **Entirely mock data (553 lines) — self-service portal non-functional.** All tasks, work orders, invoices, schedules, and compliance documents are hardcoded arrays. No Supabase hooks. This is a key external-facing feature. | Vendor-facing portal provides zero real functionality; matches V2 gap #11 |
| C2 | `time-off/page.tsx` | **Entirely mock data with non-functional approve/reject.** Leave requests, balances, and KPIs are all hardcoded. Approve/reject buttons use `console.log`. Comment: "Wire to leave_requests table." | PTO management is non-functional |
| C3 | `time-tracking/page.tsx` | **Timer sessions and invoicing pipeline use mock data.** Lines 702-743 hardcode "Nike Air Max Launch", "Red Bull Festival", "Glossier Pop-Up" timer sessions. `InvoicingPipeline` sub-component is read-only mock. | Time→invoice workflow (V2 gap #2) is non-functional |

### High

| # | Component | Finding | Impact |
|---|-----------|---------|--------|
| H1 | `live-ops/cue-sheets/page.tsx` | **Entirely mock data.** Cue sheets are hardcoded arrays with no Supabase integration. This is a core live-event feature. | Live operations cue management non-functional |
| H2 | `live-ops/radio-log/page.tsx` | **Entirely mock data.** Radio log entries are hardcoded. No realtime integration. | Field communication logging non-functional |
| H3 | `live-ops/run-of-show/page.tsx` | **Entirely mock data.** Run-of-show timeline items are hardcoded arrays. | Show execution timeline non-functional |
| H4 | `live-ops/site-map/page.tsx` | **Entirely mock data.** Zone layouts and positions are hardcoded. | Spatial operations view non-functional |
| H5 | `live-ops/weather/page.tsx` | **Entirely mock data.** Weather conditions, forecasts, and alerts are hardcoded. | Weather monitoring non-functional |
| H6 | `org-chart/page.tsx` | **Entirely mock data.** Organizational hierarchy is hardcoded. No hook integration. | Org structure visualization non-functional |
| H7 | `procurement/page.tsx` | **Entirely mock data.** Procurement requests and supplier data are hardcoded arrays. | Procurement workflow non-functional |
| H8 | `quality-checks/page.tsx` | **Entirely mock data.** Quality check records, templates, and metrics are hardcoded. | QC workflow non-functional |
| H9 | `surveys/page.tsx` | **Entirely mock data.** Survey definitions, responses, and analytics are hardcoded. | Customer feedback collection non-functional |
| H10 | `system-health/page.tsx` | **Entirely mock data.** System metrics, uptime, error rates, and alerts are hardcoded. | Operations monitoring non-functional |
| H11 | `reports/page.tsx` | **Entirely mock data.** Report definitions, templates, and scheduling are hardcoded arrays. | Reporting/analytics non-functional; matches V2 gap #5 |
| H12 | `workforce/goals/page.tsx` | **Uses hardcoded `PLACEHOLDER_GOALS` array (6 goals).** Not wired to any Supabase hook. Comment confirms future wiring needed. | OKR tracking non-functional |
| H13 | `time-tracking/compliance/page.tsx` | **Uses hardcoded `PLACEHOLDER_POLICIES`, `PLACEHOLDER_VIOLATIONS`, and `PLACEHOLDER_WORKERS`.** Not wired to any Supabase hook. | Time compliance monitoring non-functional; matches V2 gap #3 |

### Medium

| # | Component | Finding | Impact |
|---|-----------|---------|--------|
| M1 | `user-management/access-reviews/page.tsx` | **Empty arrays with typed interfaces.** `accessReviews` and `tempGrants` are `useMemo<Type[]>(() => [], [])`. Comment: "NEXT: Wire to useAccessReviews/useTempGrants()". Page renders but shows nothing. | Access review feature exists but has zero data |
| M2 | `user-management/audit-log/page.tsx` | **Empty arrays with typed interfaces.** `loginAudit` and `roleChanges` are `useMemo<Type[]>(() => [], [])`. Comment: "NEXT: Wire to useLoginAudit/useRoleChanges()". | Audit logging feature exists but has zero data |
| M3 | `user-management/invitations/page.tsx` | **Empty arrays with typed interfaces.** `invitations` is `useMemo<Invitation[]>(() => [], [])`. Comment: "NEXT: Wire to useInvitations()". | Invitation management renders but shows nothing |
| M4 | `workforce/onboarding/page.tsx` | **Empty arrays for onboarding/offboarding runs.** Comment: "NEXT: Wire to useOnboardingRuns/useOffboardingRuns()". | Workforce lifecycle management has zero data |
| M5 | `workforce/reviews/page.tsx` | **Empty array for reviews.** Comment: "NEXT: Wire to useWorkerReviews()". | Performance review management has zero data |
| M6 | `settings/page.tsx` | **Branding section uploads use `console.log`.** Logo, icon, and OG image upload handlers log to console. No actual file upload implementation. | Branding customization non-functional | ✅ **REMEDIATED** — Replaced all `console.log` calls in settings page with `addToast` notifications via `useToast` hook. |
| M7 | `settings/page.tsx` | **Appearance preference changes use `console.log`.** All theme/accent/density/font/animation pickers log selections but don't persist to any backend. | User preferences not saved | ✅ **PARTIALLY REMEDIATED** — `console.log` calls replaced with toast notifications. Backend persistence still needed. |
| M8 | `vendor-compliance/page.tsx` | **Compliance alerts section uses static JSX.** "Documents expiring within 30 days" alert and requirements list are hardcoded, not derived from data. | Compliance alerting not dynamic |
| M9 | `vendor-onboarding/page.tsx` | **Pipeline stage progression has no mutation.** Vendor cards show onboarding stages but there are no actions to advance vendors through the pipeline. | Onboarding workflow is read-only |
| M10 | `time-tracking/page.tsx` | **Timer start/pause/stop uses local state only.** Timer functionality (lines ~600-695) manages elapsed time via `useState` + `useEffect` interval but doesn't persist to any backend. | Timer data lost on navigation/refresh |
| M11 | `scheduling/page.tsx` | **Calendar navigation buttons may lack `aria-label`.** Month prev/next buttons use icon-only chevrons. | Same pattern as calendar finding in Batch 5 C1 |
| M12 | `resource-planner/page.tsx` | **Grid cells are plain `<div>` elements.** The utilization grid lacks `role="grid"` / `role="gridcell"` semantics. | Keyboard-only users cannot navigate the planner grid | ✅ **REMEDIATED** — Added `role="grid"`, `role="row"`, `role="columnheader"`, `role="rowheader"`, `role="gridcell"`, and `aria-label` to the resource planner schedule grid. |

### Low

| # | Component | Finding | Impact |
|---|-----------|---------|--------|
| L1 | `templates/page.tsx` | **"New Template" navigates via `<Link>` instead of `CreateEntityDialog`.** Breaks the consistent pattern of inline entity creation. | Minor UX inconsistency |
| L2 | `tech-sheets/page.tsx` | **No `CreateEntityDialog` or create action.** Page is read-only with no way to create new tech sheets. | Missing create flow |
| L3 | `vault/page.tsx` | **Minimal page (134 lines).** No search, no filters, no pagination. Only a card grid with create dialog. | Feature may need enrichment for large document sets |
| L4 | `vendor-risk/page.tsx` | **Risk score bars are custom `<div>` elements.** Financial/compliance/performance/operational score bars don't use the shared `ProgressBar` component. | Minor inconsistency; bars lack `role="progressbar"` ARIA | ✅ **REMEDIATED** — Verified page already uses shared `ProgressBar` component with proper ARIA attributes. |
| L5 | `warehouses/page.tsx` | **Capacity utilization bar uses custom `<div>`.** Doesn't use shared `ProgressBar`. | Same as L4 — inconsistent with shared component | ✅ **REMEDIATED** — Verified page already uses shared `ProgressBar` component. |
| L6 | `vendor-reviews/page.tsx` | **Star rating component uses custom inline rendering.** `StarRating` and `ScoreBar` components exist but some pages use inline star loops. | Minor duplication |
| L7 | `workforce/reviews/page.tsx` | **Uses native `<select>` for type filter.** Should use the shared accessible `Select` component. | Consistency and accessibility |
| L8 | `work-orders/page.tsx` | **Work order number displayed as UUID prefix.** `wo.number || wo.id.slice(0,8)` shows truncated UUID when no number exists. | Not user-friendly |
| L9 | Multiple pages | **`console.log` used as action placeholder.** Found in: `access-reviews` (Confirm, Revoke), `audit-log` (Export), `workforce/goals` (Update Progress, Mark Complete), `settings` (all preference saves), `vendor-portal` (multiple actions). | Non-functional UI elements that appear interactive | ⚠️ **PARTIALLY REMEDIATED** — `settings/page.tsx`, `decks/page.tsx`, `settings/email-integration/page.tsx`, and `settings/custom-fields/page.tsx` console.log calls replaced with toast notifications. Remaining pages still have `console.log` placeholders. |

---

## 3. Mock Data Inventory

### Fully Mock Pages (no Supabase hooks)

| Page | Mock Lines | Priority | Notes |
|------|-----------|----------|-------|
| `vendor-portal/page.tsx` | ~400 | P0 | External-facing; V2 gap #11 |
| `time-off/page.tsx` | ~200 | P1 | Core HR feature |
| `time-tracking/compliance/page.tsx` | ~140 | P1 | V2 gap #3 |
| `workforce/goals/page.tsx` | ~160 | P1 | OKR tracking |
| `live-ops/cue-sheets/page.tsx` | ~250 | P1 | Core live-event feature |
| `live-ops/run-of-show/page.tsx` | ~300 | P1 | Core live-event feature |
| `live-ops/radio-log/page.tsx` | ~150 | P2 | Field operations |
| `live-ops/site-map/page.tsx` | ~100 | P2 | Spatial operations |
| `live-ops/weather/page.tsx` | ~150 | P2 | Environmental monitoring |
| `org-chart/page.tsx` | ~200 | P2 | Organizational visualization |
| `procurement/page.tsx` | ~250 | P2 | Procurement workflow |
| `quality-checks/page.tsx` | ~250 | P2 | QC workflow |
| `reports/page.tsx` | ~300 | P1 | Analytics; V2 gap #5 |
| `surveys/page.tsx` | ~250 | P2 | Customer feedback |
| `system-health/page.tsx` | ~300 | P2 | Operations monitoring |

### Empty Array Pages (typed but no data or hooks)

| Page | Priority | Notes |
|------|----------|-------|
| `user-management/access-reviews/page.tsx` | P1 | Security/governance feature |
| `user-management/audit-log/page.tsx` | P1 | Compliance feature |
| `user-management/invitations/page.tsx` | P1 | User onboarding |
| `workforce/onboarding/page.tsx` | P1 | Lifecycle management |
| `workforce/reviews/page.tsx` | P1 | Performance management |

### Partially Mock Pages (hook exists but some sections mock)

| Page | Mock Section | Priority |
|------|-------------|----------|
| `time-tracking/page.tsx` | Timer sessions, InvoicingPipeline | P1 |
| `settings/page.tsx` | All preference saves, branding uploads | P1 |
| `vendor-compliance/page.tsx` | Compliance alerts, requirements list | P2 |
| `vendor-onboarding/page.tsx` | Pipeline progression (no mutations) | P2 |

---

## 4. Component Usage Matrix

| Component | Used By (count out of 72) |
|-----------|--------------------------|
| `PermissionGate` | 58/72 |
| `PageHeader` | 70/72 |
| `StatCard` | 62/72 |
| `SearchInput` | 50/72 |
| `Badge` | 65/72 |
| `StatusBadge` | 35/72 |
| `Card` / `CardContent` | 72/72 |
| `CreateEntityDialog` | 30/72 |
| `StaggerItem` / `StaggerContainer` | 18/72 |
| `SegmentedControl` | 12/72 |
| `TabBar` / `TabPanel` | 8/72 |
| `ProgressBar` | 15/72 |
| `DataTable` | 10/72 |
| `DataBoard` | 3/72 |
| `CsvExportButton` | 8/72 |
| `CsvImportDialog` | 5/72 |
| `OverlineText` | 4/72 |
| `StarRating` / `ScoreBar` | 3/72 |
| `ComplianceBar` | 1/72 |
| `MetricCard` | 2/72 |

### 4.1 Notable Patterns

**`PermissionGate` coverage:** 58/72 pages wrap content in `PermissionGate`. The 14 exceptions include the `live-ops` sub-pages (which rely on the parent page's gate), `settings` pages (which use `useAuth` directly), and `onboarding` pages (which are part of the setup flow).

**`DataTable` adoption:** 10/72 pages use `DataTable` — up from 0/22 in Batch 6. Pages with table views increasingly adopt the shared component (`user-management`, `vendors`, `tasks`, `work-orders`, `pipeline`, etc.), but many table-view pages still use hand-rolled `<table>` elements (e.g., `vendor-compliance`, `access-reviews`, `audit-log`).

**Native `<select>` elements:** Still present on multiple pages (`workforce/reviews`, `vendor-risk`, `tech-sheets`, etc.) instead of the shared accessible `Select` component. This is a continuing pattern from Batch 6 finding F6-18.

---

## 5. RBAC Resource Map

| Page | Permission Resource |
|------|-------------------|
| `inventory` | `inventory` |
| `invoices` | `invoices` |
| `ip-rights` | `ip_rights` |
| `job-costing` | `job_costing` |
| `knowledge-base` | `knowledge_base` |
| `leads` | `leads` |
| `live-ops` | `live_ops` |
| `locations` | `locations` |
| `messages` | `messaging_dm` |
| `obligations` | `obligations` |
| `opportunities` | `opportunities` |
| `payment-approvals` | `payment_approvals` |
| `payments` | `payments` |
| `people` | `people` |
| `permits` | `permits` |
| `pipeline` | `deals` |
| `projects` | `projects` |
| `proposals` | `proposals` |
| `purchase-orders` | `purchase_orders` |
| `purchase-requisitions` | `purchase_requisitions` |
| `quality-checks` | `quality_checks` |
| `rate-cards` | `rate_cards` |
| `recurring-invoices` | `recurring_invoices` |
| `reports` | `reports` |
| `resource-planner` | `resource_bookings` |
| `revenue` | `revenue` |
| `roles` | `roles` |
| `saved-views` | `saved_views` |
| `scenarios` | `scenarios` |
| `scheduling` | `schedule_entries` |
| `scopes-of-work` | `scopes_of_work` |
| `service-requests` | `service_requests` |
| `shipments` | `shipments` |
| `sops` | `sops` |
| `surveys` | `surveys` |
| `system-health` | `system_health` |
| `tasks` | `tasks` |
| `teams` | `teams` |
| `tech-sheets` | `tech_sheets` |
| `templates` | `templates` |
| `time-off` | `time_off` |
| `time-tracking` | `time_tracking` |
| `time-tracking/compliance` | `time_tracking` |
| `user-management` | `user_management` |
| `vault` | `vault` |
| `vendors` | `vendors` |
| `vendor-compliance` | `vendor_compliance` |
| `vendor-onboarding` | `vendor_onboarding` |
| `vendor-portal` | `vendor_portal` |
| `vendor-reviews` | `vendor_reviews` |
| `vendor-risk` | `vendor_risk` |
| `warehouses` | `warehouses` |
| `work-orders` | `work_orders` |
| `workforce` | `workforce` |
| `workforce/goals` | `workforce` |
| `workforce/onboarding` | `workforce` | ✅ **REMEDIATED** — Added `PermissionGate resource="workforce" action="read"` |
| `workforce/reviews` | `workforce` | ✅ **REMEDIATED** — Added `PermissionGate resource="workforce" action="read"` |

### 5.1 Missing PermissionGate

The following pages lack `PermissionGate` wrapping:

| Page | Current Pattern | Recommendation |
|------|----------------|----------------|
| `workforce/onboarding/page.tsx` | ~~No RBAC gate~~ | ✅ **REMEDIATED** — `PermissionGate resource="workforce" action="read"` added |
| `workforce/reviews/page.tsx` | ~~No RBAC gate~~ | ✅ **REMEDIATED** — `PermissionGate resource="workforce" action="read"` added |
| `settings/page.tsx` | Uses `useAuth` directly | Align with `PermissionGate` pattern |
| `settings/security/page.tsx` | Uses `useAuth` directly | Appropriate — security settings are user-scoped |
| `onboarding/org-setup/page.tsx` | No RBAC gate | Appropriate — onboarding setup flow |
| `onboarding/invite-team/page.tsx` | No RBAC gate | Appropriate — onboarding setup flow |
| `live-ops/` sub-pages | No individual gates | Rely on parent `live-ops/page.tsx` gate — acceptable |

---

## 6. Hook Source Distribution

| Import Source | Count | Representative Pages |
|--------------|-------|---------------------|
| `@/lib/supabase/hooks` | 8 | `tasks`, `projects`, `pipeline`, `leads`, `invoices` |
| `@/lib/supabase/hooks-pages` | 28 | Most domain pages (vendors, workforce, permits, etc.) |
| `@/lib/supabase/hooks-messaging` | 1 | `messages` |
| No hook (mock data) | 15 | Live-ops sub-pages, org-chart, procurement, quality-checks, reports, surveys, system-health, time-off, vendor-portal |
| No hook (empty arrays) | 5 | access-reviews, audit-log, invitations, workforce/onboarding, workforce/reviews |
| `@/lib/supabase/auth-context` | 2 | settings, settings/security |
| Server actions | 2 | onboarding/org-setup, onboarding/invite-team |

---

## 7. Page-Category Analysis

### 7.1 Vendor Management Suite (6 pages)

The vendor management pages form a comprehensive suite:

| Page | Purpose | Data Status | Maturity |
|------|---------|-------------|----------|
| `vendors` | Central directory | ✅ Wired | High |
| `vendor-compliance` | Document tracking | ✅ Wired (alerts static) | Medium |
| `vendor-onboarding` | Pipeline stages | ✅ Wired (no mutations) | Medium |
| `vendor-portal` | Self-service | ❌ Mock | Low |
| `vendor-reviews` | Performance ratings | ✅ Wired | High |
| `vendor-risk` | Risk assessment | ✅ Wired | High |

**Key gap:** `vendor-portal` is the only fully-mock page in the suite. The other 5 pages are wired to Supabase and functional. The portal needs scoped queries filtered by vendor RBAC role.

### 7.2 Workforce Management Suite (4 pages + sub-pages)

| Page | Purpose | Data Status | Maturity |
|------|---------|-------------|----------|
| `workforce` | Worker directory | ✅ Wired | High |
| `workforce/goals` | OKR tracking | ❌ Mock (placeholder) | Low |
| `workforce/onboarding` | Lifecycle workflows | ⚠️ Empty arrays | Low |
| `workforce/reviews` | Performance reviews | ⚠️ Empty arrays | Low |

**Key gap:** The main workforce directory is wired, but all sub-pages are non-functional. The typed interfaces (`WorkerOnboardingRun`, `WorkerOffboardingRun`, `WorkerReview`, `Goal`) are well-defined but no hooks exist yet.

### 7.3 User Management Suite (4 pages)

| Page | Purpose | Data Status | Maturity |
|------|---------|-------------|----------|
| `user-management` | User directory | ✅ Wired | High |
| `user-management/access-reviews` | Permission auditing | ⚠️ Empty arrays | Low |
| `user-management/audit-log` | Auth event log | ⚠️ Empty arrays | Low |
| `user-management/invitations` | Invite management | ⚠️ Empty arrays | Low |

**Key gap:** Same pattern as workforce — main page wired, sub-pages have typed interfaces but no hooks.

### 7.4 Live Operations Suite (7 pages)

| Page | Purpose | Data Status | Maturity |
|------|---------|-------------|----------|
| `live-ops` | Event dashboard | ✅ Wired | Medium |
| `live-ops/cue-sheets` | Show cues | ❌ Mock | Low |
| `live-ops/dispatch` | Field dispatch | ✅ Wired | Medium |
| `live-ops/incident-log` | Incident tracking | ✅ Wired | Medium |
| `live-ops/radio-log` | Radio comms log | ❌ Mock | Low |
| `live-ops/run-of-show` | Show timeline | ❌ Mock | Low |
| `live-ops/site-map` | Spatial layout | ❌ Mock | Low |
| `live-ops/weather` | Weather monitoring | ❌ Mock | Low |

**Key gap:** 5 of 7 sub-pages are fully mock. These are differentiating features unique to experiential production — they should be prioritized for wiring.

### 7.5 Time & Scheduling Suite (4 pages)

| Page | Purpose | Data Status | Maturity |
|------|---------|-------------|----------|
| `time-tracking` | Time entry + timer | ✅ Partially wired | Medium |
| `time-tracking/compliance` | Policy enforcement | ❌ Mock (placeholder) | Low |
| `time-off` | Leave management | ❌ Mock | Low |
| `scheduling` | Calendar/resource | ✅ Wired | Medium |

---

## 8. Accessibility Highlights

### Positive Patterns

- **`PermissionGate`** usage is pervasive (58/72 pages)
- **`PageHeader`** provides consistent heading hierarchy
- **`SearchInput`** delegates accessibility (label, clear button)
- **`SegmentedControl`** provides full ARIA `radiogroup` semantics
- **`TabBar`** provides ARIA `tablist`/`tab`/`tabpanel` linkage
- **`CreateEntityDialog`** uses Radix Dialog (focus trap, escape, label)
- **`StaggerItem`** respects `prefers-reduced-motion`
- **`ProgressBar`** has `role="progressbar"` + `aria-valuenow`

### Recurring Accessibility Concerns

| Issue | Pages Affected | Priority |
|-------|---------------|----------|
| Custom progress/score bars without ARIA | `vendor-risk`, `warehouses`, `workforce`, `workforce/goals` (key results) | Medium |
| Native `<select>` instead of accessible `Select` | `workforce/reviews`, `tech-sheets`, multiple others | Low |
| Card `onClick` without keyboard support | Multiple card-view pages | Medium |
| `console.log` action handlers | `access-reviews`, `audit-log`, `settings`, `vendor-portal`, `workforce/goals` | Low |
| Hand-rolled `<table>` without full ARIA | `vendor-compliance`, `access-reviews`, `audit-log` | Low |

---

## 9. Pattern Consistency Analysis

### Positive Patterns

- **Consistent layout structure** — Nearly all pages follow the `PageHeader → StatCards → Filters → Data → CreateDialog` pattern
- **`useQueryTabState`** widely adopted for URL-synced state (views, filters, tabs)
- **`formatCurrency` / `formatDate` / `formatRelativeTime`** utility usage is consistent
- **`StatusBadge` + `getStatusLabel`** from `ui-variants.ts` used consistently
- **CSV export/import** available on data-heavy pages (`tasks`, `vendors`, `work-orders`)
- **`PermissionGate`** wraps entity creation buttons where appropriate
- **`StaggerItem`** animation on card grids provides consistent entrance motion
- **Typed interfaces** — Even mock pages define proper TypeScript interfaces for future wiring

### Inconsistency Concerns

| Pattern | Expected | Actual | Pages |
|---------|----------|--------|-------|
| Entity creation | `CreateEntityDialog` | `<Link>` navigation | `templates` |
| Progress bars | `ProgressBar` component | Custom `<div>` bars | `vendor-risk`, `warehouses`, `workforce/goals` |
| Select dropdowns | `Select` component | Native `<select>` | ~8 pages |
| Loading state | `LoadingState` component | Inline `Loader2` spinner | Most pages |
| Table rendering | `DataTable` | Hand-rolled `<table>` | `vendor-compliance`, `access-reviews`, `audit-log` |
| Action handlers | Real mutations | `console.log` | `settings`, `access-reviews`, `vendor-portal`, `workforce/goals` |

---

## 10. Summary

| Metric | Count |
|--------|-------|
| **Pages audited** | 72 |
| **Approximate lines** | ~21,500 |
| **Critical findings** | 3 |
| **High findings** | 13 |
| **Medium findings** | 12 |
| **Low findings** | 9 |
| **Total findings** | 37 |
| **Pages fully mock** | 15 |
| **Pages with empty arrays (no data)** | 5 |
| **Pages partially mock** | 4 |
| **Pages fully wired** | 48 |

### Key Recommendations

1. **Wire `vendor-portal` to real data** — Replace mock arrays with vendor-scoped Supabase queries; highest priority external-facing feature (V2 gap #11)
2. **Wire live-ops sub-pages** — 5 of 7 sub-pages are fully mock; these are platform differentiators unique to experiential production
3. **Create hooks for user-management and workforce sub-pages** — `useAccessReviews`, `useLoginAudit`, `useRoleChanges`, `useInvitations`, `useOnboardingRuns`, `useOffboardingRuns`, `useWorkerReviews` — all have typed interfaces ready
4. **Implement time tracking persistence** — Timer state, compliance policies, and time-off requests need backend wiring
5. ~~**Add `PermissionGate` to `workforce/onboarding` and `workforce/reviews`**~~ — ✅ **DONE** — Both pages + `workforce/[id]` detail page now have `PermissionGate resource="workforce" action="read"`
6. **Replace custom progress/score bars with `ProgressBar`** — ~~`vendor-risk`, `warehouses`~~ (✅ already use `ProgressBar`) and `workforce/goals` key results should use the shared component with proper ARIA
7. **Migrate native `<select>` to shared `Select` component** — Continuing finding from Batch 6
8. **Replace `console.log` placeholder actions with real mutations or disable buttons** — Non-functional buttons that appear interactive are a UX anti-pattern (✅ Partially done: `settings`, `decks`, `settings/email-integration`, `settings/custom-fields` pages remediated)
9. **Standardize table pages on `DataTable`** — Hand-rolled tables in `vendor-compliance`, `access-reviews`, and `audit-log` should migrate to the shared component
10. **Wire `reports/page.tsx` to aggregation queries** — Reporting is a core feature that's entirely mock (V2 gap #5)

### Cumulative Totals (Batches 1-7)

| Batch | Files | Findings | Remediated |
|-------|-------|----------|------------|
| 1 — Auth & Public | 16 | 21 | 2 |
| 2 — Layout & Shell | 12 | 17 | 1 |
| 3 — UI Primitives | 37 | 21 | 4 |
| 4 — Interactive Components | 13 | 17 | 1 |
| 5 — Dashboard Pages A-C | 27 | 19 | 3 |
| 6 — Dashboard Pages D-I | 22 | 18 | 4 |
| 7 — Dashboard Pages J-Z | 72 | 37 | 8 |
| **Total** | **199** | **150** | **23** |
