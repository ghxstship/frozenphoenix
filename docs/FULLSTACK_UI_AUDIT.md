# Full-Stack UI Validation Audit

> **Generated:** 2025-01-XX  
> **Scope:** All interactive UI elements (buttons, forms, dialogs, drawers, modals) across the FrozenPhoenix codebase  
> **Method:** Systematic file-by-file review of page components, layout components, Supabase hooks, and data layer

---

## Executive Summary

| Category | Count | Status |
|---|---|---|
| **Fully wired (Supabase mutations)** | 3 | ✅ Production-ready |
| **Fully wired (Supabase auth)** | 3 | ✅ Production-ready |
| **Read-only wired (Supabase queries + mock fallback)** | 1 | ⚠️ Read-only, no write actions |
| **Stub forms (setTimeout + console.log)** | 5 | ❌ Not wired |
| **Stub buttons (onClick={() => {}})** | 40+ | ❌ No-op handlers |
| **Stub wizard (no submit handler)** | 1 | ❌ Not wired |
| **Presentational-only buttons (navigation/filter)** | Many | ✅ Correct — no backend needed |

**Bottom line:** Only **3 out of 9 create/edit forms** are wired to Supabase. Over **40 action buttons** across detail pages are no-ops. The Supabase hook layer is comprehensive (~50+ entity hooks exist in `hooks.ts`, `hooks-crm.ts`, `hooks-productive.ts`, `hooks-sow.ts`, `hooks-workflows.ts`) but the page-level wiring is largely incomplete.

---

## ✅ FULLY WIRED — Production-Ready

### 1. New Deal Form (`pipeline/new`)
- **File:** `src/app/(dashboard)/pipeline/new/page.tsx:61-83`
- **Hook:** `useCreateDeal` from `@/lib/supabase/hooks`
- **Behavior:** Calls `createDeal.mutateAsync()` when Supabase is configured; navigates to `/pipeline` on success; shows loading state via `createDeal.isPending`
- **Verdict:** ✅ Fully wired with proper error handling

### 2. Landing Page Lead Capture Form
- **File:** `src/app/(public)/page.tsx:38-57`
- **Hook:** `useCreateLead` from `@/lib/supabase/hooks-crm`
- **Reads:** `usePublicTestimonials`, `useReviewStats`
- **Behavior:** Calls `createLead.mutateAsync()` with structured lead data; shows loading/success states
- **Verdict:** ✅ Fully wired with proper error handling

### 3. Login Form
- **File:** `src/app/(public)/login/page.tsx:23-51`
- **Method:** Direct `supabase.auth.signInWithPassword()` call
- **Behavior:** Error display, loading state, redirect on success, `router.refresh()` to sync server state
- **Verdict:** ✅ Fully wired

### 4. Signup Form
- **File:** `src/app/(public)/signup/page.tsx:23-63`
- **Method:** Direct `supabase.auth.signUp()` call with email redirect
- **Behavior:** Handles both auto-confirm (immediate redirect) and email-confirm (success message) flows
- **Verdict:** ✅ Fully wired

### 5. Auth Callback Route
- **File:** `src/app/auth/callback/route.ts:4-20`
- **Method:** Server-side `supabase.auth.exchangeCodeForSession()`
- **Verdict:** ✅ Fully wired

### 6. Command Bar
- **File:** `src/components/command-bar.tsx:26-225`
- **Behavior:** Keyboard-driven navigation (`⌘K`), searches navigation config, uses `router.push()` for selection
- **Verdict:** ✅ Fully functional (navigation-only, no backend needed)

---

## ⚠️ READ-ONLY WIRED — No Write Actions

### 7. Approvals Page
- **File:** `src/app/(dashboard)/approvals/page.tsx:94-338`
- **Hook:** `useApprovals` from `@/lib/supabase/hooks`
- **Behavior:** Fetches approvals from Supabase when configured, falls back to `MOCK_APPROVALS`. Displays in list/table views.
- **Gap:** No approve/reject/escalate buttons exist. The page is **display-only** — there are no mutation handlers for changing approval status.
- **Verdict:** ⚠️ Read path works; write path completely missing

---

## ❌ STUB FORMS — `setTimeout` + `console.log` Instead of Supabase

These forms collect user input and have proper validation, loading states, and navigation — but the submit handler is a **fake delay** that logs to console and never persists data.

### 8. New Asset Form
- **File:** `src/app/(dashboard)/assets/new/page.tsx:49-57`
- **Stub code:**
  ```ts
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("Creating asset:", formData);
  ```
- **Available hook:** `useCreateAsset` exists in `hooks.ts`
- **Fix:** Replace with `useCreateAsset().mutateAsync()`

### 9. New Crew Member Form
- **File:** `src/app/(dashboard)/crew/new/page.tsx:41-49`
- **Stub code:**
  ```ts
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("Creating crew member:", formData);
  ```
- **Available hook:** `useCreateCrewMember` exists in `hooks.ts`
- **Fix:** Replace with `useCreateCrewMember().mutateAsync()`

### 10. New Project Form
- **File:** `src/app/(dashboard)/projects/new/page.tsx:26-35`
- **Stub code:**
  ```ts
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("Creating project:", formData);
  ```
- **Available hook:** `useCreateProject` exists in `hooks.ts`
- **Fix:** Replace with `useCreateProject().mutateAsync()`

### 11. Edit Project Form
- **File:** `src/app/(dashboard)/projects/[id]/edit/page.tsx:44-53`
- **Stub code:**
  ```ts
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("Updating project:", formData);
  ```
- **Available hook:** `useUpdateProject` exists in `hooks.ts`
- **Fix:** Replace with `useUpdateProject().mutateAsync()`

### 12. New Vendor Form
- **File:** `src/app/(dashboard)/vendors/new/page.tsx:42-50`
- **Stub code:**
  ```ts
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("Creating vendor:", formData);
  ```
- **Available hook:** `useCreateVendor` exists in `hooks.ts`
- **Fix:** Replace with `useCreateVendor().mutateAsync()`

---

## ❌ STUB WIZARD — No Submit Handler at All

### 13. New Contract Wizard
- **File:** `src/app/(dashboard)/contracts/new/page.tsx:196-210`
- **Issue:** The "Create Contract" button on the review step has **no `onClick` handler** — it is just `<Button disabled={!canNext}>Create Contract</Button>`. The button is effectively dead.
- **Available hook:** `useCreateContract` exists in `hooks.ts`
- **Fix:** Add `onClick` handler wired to `useCreateContract().mutateAsync()`

---

## ❌ NO-OP BUTTONS — `onClick={() => {}}`

These are action buttons/menu items across detail pages that render but do absolutely nothing when clicked.

### Deal Detail Page
- **File:** `src/app/(dashboard)/deals/[id]/page.tsx:129-131`
  - "Convert to Project" → `onClick: () => {}`
  - "Mark as Won" → `onClick: () => {}`
  - "Mark as Lost" → `onClick: () => {}`
- **File:** `src/app/(dashboard)/deals/[id]/page.tsx:203`
  - "Add Note" button → no handler at all

### Asset Detail Page
- **File:** `src/app/(dashboard)/assets/[id]/page.tsx:144-147`
  - "Check Out" → `onClick: () => {}`
  - "Schedule Maintenance" → `onClick: () => {}`
  - "Print Label" → `onClick: () => {}`
  - "Decommission" → `onClick: () => {}`
- **File:** `src/app/(dashboard)/assets/[id]/page.tsx:239`
  - "Log Maintenance" button → no handler
- **File:** `src/app/(dashboard)/assets/[id]/page.tsx:246`
  - "Log Maintenance" empty state action → `onClick: () => {}`

### Project Detail Page
- **File:** `src/app/(dashboard)/projects/[id]/page.tsx:131-133`
  - "Duplicate Project" → `onClick: () => {}`
  - "Archive Project" → `onClick: () => {}`
  - "Delete Project" → `onClick: () => {}`
- **File:** `src/app/(dashboard)/projects/[id]/page.tsx:229`
  - "Add Task" → `onClick: () => {}`
- **File:** `src/app/(dashboard)/projects/[id]/page.tsx:269`
  - "Add Member" → `onClick: () => {}`

### Crew Member Detail Page
- **File:** `src/app/(dashboard)/crew/[id]/page.tsx:135-137`
  - "Assign to Project" → `onClick: () => {}`
  - "View Time Entries" → `onClick: () => {}`
  - "Deactivate" → `onClick: () => {}`
- **File:** `src/app/(dashboard)/crew/[id]/page.tsx:228`
  - "Add Certification" → `onClick: () => {}`

### Vendor Detail Page
- **File:** `src/app/(dashboard)/vendors/[id]/page.tsx:132-134`
  - "Create Purchase Order" → `onClick: () => {}`
  - "Request Documents" → `onClick: () => {}`
  - "Suspend Vendor" → `onClick: () => {}`
- **File:** `src/app/(dashboard)/vendors/[id]/page.tsx:228`
  - "Create PO" → `onClick: () => {}`

### Task Detail Page
- **File:** `src/app/(dashboard)/tasks/[id]/page.tsx:135-137`
  - "Mark Complete" → `onClick: () => {}`
  - "Duplicate Task" → `onClick: () => {}`
  - "Delete Task" → `onClick: () => {}`
- **File:** `src/app/(dashboard)/tasks/[id]/page.tsx:243`
  - "Add Subtask" → `onClick: () => {}`

### Location Detail Page
- **File:** `src/app/(dashboard)/locations/[id]/page.tsx:186`
  - "View on Map" → `onClick: () => {}`

### List Page Empty State Actions
- **File:** `src/app/(dashboard)/events/page.tsx:153` — "Schedule Event" → `onClick: () => {}`
- **File:** `src/app/(dashboard)/budgets/page.tsx:140` — "New Budget" → `onClick: () => {}`
- **File:** `src/app/(dashboard)/locations/page.tsx:134` — "Add Location" → `onClick: () => {}`
- **File:** `src/app/(dashboard)/knowledge-base/page.tsx:216` — "New Article" → `onClick: () => {}`
- **File:** `src/app/(dashboard)/activations/page.tsx:145` — "New Activation" → `onClick: () => {}`
- **File:** `src/app/(dashboard)/shipments/page.tsx:142` — "New Shipment" → `onClick: () => {}`

### Contract Detail Page
- **File:** `src/app/(dashboard)/contracts/[id]/page.tsx:89`
  - "Export PDF" button → no handler (presentational)
- **File:** `src/app/(dashboard)/contracts/[id]/page.tsx:90`
  - "Send for Signature" button → no handler (presentational)
- **File:** `src/app/(dashboard)/contracts/[id]/page.tsx:225`
  - Download button on documents → no handler (presentational)

---

## ❌ MOCK-DATA-ONLY PAGES — No Supabase Integration at All

These pages render entirely from hardcoded mock data with no Supabase hooks:

| Page | File | Data Source |
|---|---|---|
| Deals list | `deals/page.tsx` | `mockDeals` inline array |
| Deal detail | `deals/[id]/page.tsx` | `MOCK_DEALS` from `mock-data` |
| Asset detail | `assets/[id]/page.tsx` | `MOCK_ASSETS` from `mock-data` |
| Contract detail | `contracts/[id]/page.tsx` | `mockContract` inline object |
| Crew board | `crew/page.tsx:239` | `onCardClick` logs to `console.log` |

---

## Data Layer Assessment

The Supabase hook layer (`src/lib/supabase/hooks*.ts`) is **comprehensive**. Hooks exist for:

- **hooks.ts:** ~50 entities including deals, projects, tasks, crew, assets, vendors, POs, invoices, approvals, calendar events, shifts, brand kits, SOPs, etc.
- **hooks-crm.ts:** leads, testimonials, reviews
- **hooks-productive.ts:** companies, contacts, pipelines, custom fields, saved views, automations, rate cards, resource bookings, time off, timers, proposals
- **hooks-sow.ts:** scopes of work, deliverables, client invoices, line items, change logs
- **hooks-workflows.ts:** call sheets, tech sheets, approval workflows, e-signatures, notification preferences

The **mutation utilities** (`mutation-utils.ts`) provide idempotency key management and optimistic UI update patterns.

**The gap is entirely at the page/component level** — the hooks exist but are not imported or called.

---

## Priority Remediation Plan

### P0 — Critical (Forms that accept user input but discard it)
1. Wire `assets/new/page.tsx` → `useCreateAsset`
2. Wire `crew/new/page.tsx` → `useCreateCrewMember`
3. Wire `projects/new/page.tsx` → `useCreateProject`
4. Wire `projects/[id]/edit/page.tsx` → `useUpdateProject`
5. Wire `vendors/new/page.tsx` → `useCreateVendor`
6. Wire `contracts/new/page.tsx` → `useCreateContract`

### P1 — High (Detail page actions that users will click expecting results)
7. Deal detail: "Mark as Won/Lost" → `useUpdateDeal`
8. Deal detail: "Convert to Project" → `useCreateProject` + `useUpdateDeal`
9. Task detail: "Mark Complete" → `useUpdateTask`
10. Project detail: "Add Task" → dialog + `useCreateTask`
11. Project detail: "Add Member" → dialog + assignment mutation
12. Asset detail: "Check Out" / "Log Maintenance" → appropriate mutations
13. Approvals page: Add approve/reject buttons → `useUpdateApproval`

### P2 — Medium (Empty state CTAs and secondary actions)
14. Wire empty state "New X" buttons on list pages to navigate to `/x/new` routes
15. Vendor detail: "Create PO" → navigate or dialog
16. Crew detail: "Add Certification" → dialog + mutation

### P3 — Low (Nice-to-have actions)
17. "Print Label", "View on Map", "Export PDF" — require external integrations
18. "Duplicate Project/Task" — convenience features
19. Replace all remaining inline mock data with Supabase query hooks

---

## Structural Observations

1. **Pattern inconsistency:** `pipeline/new` correctly uses `isSupabaseConfigured` guard + hook. Other forms use `setTimeout` stubs. The wired pattern should be replicated.
2. **No server actions:** The entire app uses client-side Supabase calls via React Query hooks. No Next.js server actions or API routes exist (except auth callback). This is a valid pattern but means all mutations run client-side.
3. **No drawers found:** The codebase uses dialogs (`@radix-ui/react-dialog`) but no drawer/sheet components were found in use.
4. **No delete confirmations:** Destructive actions like "Decommission", "Delete Project", "Suspend Vendor" have no confirmation dialog — they are currently no-ops, but when wired, confirmation dialogs must be added.
5. **Mock data leakage:** Several list pages (deals, assets, contracts) use inline or imported mock arrays rather than Supabase queries with mock fallback, unlike the approvals page which correctly implements the dual-path pattern.
