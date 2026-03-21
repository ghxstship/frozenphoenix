# IRON CURTAIN — Remediation Log

All fixes applied during the Iron Curtain audit, with before/after descriptions.

---

## Phase 1 — CRUD Operations

### R1: Detail Page Delete Without Confirmation Dialog
- **Severity:** 🔴 BROKEN
- **File:** `src/hooks/use-detail-crud.ts`
- **Scope:** 30+ detail pages using `useDetailCrud`
- **Before:** `handleDelete()` immediately called `deleteMutation.mutateAsync(entityId)` with no user confirmation
- **After:** Added `useConfirm()` integration — delete now shows a destructive confirmation dialog asking "Are you sure you want to delete this {entity}? This action cannot be undone." with a "Delete" confirm button
- **Verification:** TypeScript type-check pass

---

## Phase 1 — CRUD Operations (continued)

### R2: No Optimistic UI Updates + No Toast Feedback
- **Severity:** 🟡 MINOR → ✅ FIXED
- **File:** `src/hooks/use-detail-crud.ts`
- **Scope:** 30+ detail pages using `useDetailCrud`
- **Before:** `handleUpdate` awaited mutation with no cache update; errors logged silently to console
- **After:** Optimistic cache update via `queryClient.setQueryData` with automatic rollback on failure. Success/error toasts on both update and delete operations. Added optional `entityKey` param for cache targeting.

### R3: Create Dialog Errors Not Displayed
- **Severity:** 🟡 MINOR → ✅ FIXED
- **File:** `src/components/app/create-entity-dialog.tsx`
- **Before:** `catch` block was empty — `onSubmit` errors were silently swallowed
- **After:** Error message extracted from thrown error and displayed as an inline alert banner (red border, `AlertCircle` icon, `role="alert"`) above the dialog footer. Cleared when any field value changes.

### R4: No Dirty-State Tracking in Create Dialog
- **Severity:** 🟡 MINOR → ✅ FIXED
- **File:** `src/components/app/create-entity-dialog.tsx`
- **Before:** Dialog closed immediately on Cancel/backdrop click with no warning, even with unsaved changes
- **After:** Tracks `isDirty` by comparing current values to `initialValuesRef`. When dirty, closing triggers a destructive confirmation dialog ("Discard changes?") via `useConfirm()`. Clean forms close immediately.

---

## Phase 2 — Search, Filter & Sort

### R5: Filter State Not Persisted to URL
- **Severity:** 🟡 MINOR → ✅ FIXED
- **File:** `src/components/shells/list-page-shell.tsx`
- **Before:** Filter values stored in `useState({})` — lost on refresh/navigation
- **After:** Filters hydrated from URL search params on mount (`?filter.status=active`). Filter changes synced to URL via `router.replace` with `filter.*` prefix. "Clear all" removes all filter params from URL. Enables shareable filtered views and survives refresh.
