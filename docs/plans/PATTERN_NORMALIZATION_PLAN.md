# Pattern Normalization Plan

> **Version:** 1.0.0 — 2026-03-16
> **Scope:** Exhaustive cross-layer pattern audit of the entire FrozenPhoenix codebase
> **Goal:** Zero pattern outliers — every entity follows a single canonical implementation path through every layer

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Canonical Pattern (The Gold Standard)](#2-canonical-pattern-the-gold-standard)
3. [Layer 1 — Hook Pattern Inconsistencies](#3-layer-1--hook-pattern-inconsistencies)
4. [Layer 2 — API Route Pattern Inconsistencies](#4-layer-2--api-route-pattern-inconsistencies)
5. [Layer 3 — Entity Config Inconsistencies](#5-layer-3--entity-config-inconsistencies)
6. [Layer 4 — Query Key Inconsistencies](#6-layer-4--query-key-inconsistencies)
7. [Layer 5 — Hook CRUD Completeness Gaps](#7-layer-5--hook-crud-completeness-gaps)
8. [Layer 6 — Duplicate / Shadowed Hook Definitions](#8-layer-6--duplicate--shadowed-hook-definitions)
9. [Layer 7 — Barrel Export Inconsistencies](#9-layer-7--barrel-export-inconsistencies)
10. [Layer 8 — Join Type Fragmentation](#10-layer-8--join-type-fragmentation)
11. [Layer 9 — Mutation Invalidation Inconsistencies](#11-layer-9--mutation-invalidation-inconsistencies)
12. [Layer 10 — Hook File Organization](#12-layer-10--hook-file-organization)
13. [Remediation Plan](#13-remediation-plan)
14. [Verification Matrix](#14-verification-matrix)

---

## 1. Executive Summary

The codebase has a **strong canonical pattern** established by three infrastructure files:

| File                                 | Role                                                                                                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `src/lib/api/crud-factory.ts`        | Server-side CRUD route factory (auth, RBAC, validation, state machines, pagination)                                            |
| `src/lib/api/entity-config.ts`       | Declarative entity registry (200+ entities with `defineEntity()`)                                                              |
| `src/lib/supabase/hook-factories.ts` | Client-side hook factory (5 functions: `makeListHook`, `makeDetailHook`, `makeCreateHook`, `makeUpdateHook`, `makeDeleteHook`) |

**The problem:** ~10 hook files accumulated organically across 30+ development sessions. The canonical factory pattern coexists with **3 legacy patterns**, creating inconsistencies in query keys, invalidation strategies, type safety, CRUD completeness, and file organization.

### Pattern Distribution

| Pattern              | Description                                                                                          | Count      | %   |
| -------------------- | ---------------------------------------------------------------------------------------------------- | ---------- | --- |
| **A — Factory**      | `makeListHook` / `makeDetailHook` / `makeCreateHook` / `makeUpdateHook` / `makeDeleteHook`           | ~280 hooks | 62% |
| **B — Inline API**   | Hand-written `useQuery`/`useMutation` calling `apiList`/`apiGet`/`apiCreate`/`apiUpdate`/`apiDelete` | ~140 hooks | 31% |
| **C — Inline Typed** | Hand-written with `TablesInsert<>` / `TablesUpdate<>` generics on mutation payloads                  | ~25 hooks  | 6%  |
| **D — Custom Fetch** | `apiFetch` with custom URL construction (non-CRUD patterns)                                          | ~5 hooks   | 1%  |

**Target state:** Pattern A for all standard CRUD; Pattern D only for genuinely non-CRUD operations (billing, bulk actions, aggregate views).

### Inconsistency Count by Category

| Category                                                           | Count   | Severity |
| ------------------------------------------------------------------ | ------- | -------- |
| I-1: Hooks using inline pattern instead of factory                 | ~140    | HIGH     |
| I-2: Duplicate hook definitions across files                       | ~28     | CRITICAL |
| I-3: Query key format mismatch (factory vs inline)                 | ~140    | HIGH     |
| I-4: Missing CRUD operations per entity                            | ~95     | MEDIUM   |
| I-5: Inconsistent mutation invalidation (list-only vs list+detail) | ~50     | MEDIUM   |
| I-6: Join types duplicated across files                            | 3 files | LOW      |
| I-7: Barrel export gaps / non-canonical re-exports                 | ~20     | LOW      |
| I-8: Hook file placement (wrong file for domain)                   | ~30     | LOW      |

---

## 2. Canonical Pattern (The Gold Standard)

Every entity in the system MUST follow this exact implementation path:

### 2.1 Entity Config (`entity-config.ts`)

```typescript
entity_name: defineEntity({
  entityName: "entity_name", // snake_case, matches DB table concept
  displayName: "Entity Name", // Title Case
  displayNamePlural: "Entity Names",
  table: "db_table_name", // actual Supabase table
  resource: "rbac_resource", // key in PERMISSION_MATRIX
  slug: "url-slug", // kebab-case, used in API path
  stateMachine: ENTITY_MACHINE, // optional
  selectList: "*, foreign_table(col)",
  selectDetail: "*, foreign_table(col1, col2)",
  searchColumns: ["name", "description"],
  icon: "LucideIcon",
  softDelete: true,
  trackAuthor: true,
});
```

### 2.2 API Routes (`src/app/api/{slug}/route.ts` + `src/app/api/{slug}/[id]/route.ts`)

```typescript
// Collection route
import { createCollectionRoute } from "@/lib/api/crud-factory";
import { getEntityCrudConfig } from "@/lib/api/entity-config";
export const { GET, POST } = createCollectionRoute(getEntityCrudConfig("entity_name"));

// Item route
import { createItemRoute } from "@/lib/api/crud-factory";
import { getEntityCrudConfig } from "@/lib/api/entity-config";
export const { GET, PATCH, DELETE } = createItemRoute(getEntityCrudConfig("entity_name"));
```

### 2.3 Client Hooks (factory pattern)

```typescript
// ALL hooks for an entity use the SAME query key and base path
const KEY = "entity_name"; // matches entityConfig.entityName
const PATH = "/api/url-slug"; // matches entityConfig.basePath

export const useEntityNames = makeListHook<Tables<"db_table">>(KEY, PATH, {
  sort_by: "col",
  sort_order: "asc",
});
export const useEntityName = makeDetailHook<Tables<"db_table">>(KEY, PATH);
export const useCreateEntityName = makeCreateHook<Tables<"db_table">>(KEY, PATH);
export const useUpdateEntityName = makeUpdateHook<Tables<"db_table">>(KEY, PATH);
export const useDeleteEntityName = makeDeleteHook(KEY, PATH);
```

### 2.4 Query Key Convention

| Operation          | Key Pattern                     | Example                             |
| ------------------ | ------------------------------- | ----------------------------------- |
| List               | `[key, mergedFilters]`          | `["project", { sort_by: "name" }]`  |
| Detail             | `[key, "detail", id]`           | `["project", "detail", "uuid-123"]` |
| Create invalidates | `[key]`                         | `["project"]`                       |
| Update invalidates | `[key]` + `[key, "detail", id]` | both                                |
| Delete invalidates | `[key]`                         | `["project"]`                       |

---

## 3. Layer 1 — Hook Pattern Inconsistencies

### I-1: Inline Pattern Hooks That Should Use Factory

**Problem:** ~140 hooks in `hooks.ts`, `hooks-pages.ts`, `hooks-extended.ts`, `hooks-productive.ts`, `hooks-crm.ts`, and `hooks-v2-features.ts` use hand-written `useQuery`/`useMutation` blocks instead of the 5 factory functions.

**Why this matters:**

- Factory hooks have **consistent query key format** (`[key, mergedFilters]` for list, `[key, "detail", id]` for detail)
- Inline hooks have **ad-hoc query keys** (e.g., `["deal"]`, `["project", id]`, `["lead", status]`, `["contact", { companyId }]`)
- Factory `makeUpdateHook` automatically invalidates **both** list and detail caches; inline mutations often miss the detail cache
- Factory hooks are 1-2 lines; inline hooks are 8-15 lines of boilerplate

**Affected files and hook counts:**

| File                          | Inline Hooks | Factory Hooks | Ratio           |
| ----------------------------- | ------------ | ------------- | --------------- |
| `hooks.ts`                    | 60           | 0             | 100% inline     |
| `hooks-pages.ts`              | 35           | 140           | 20% inline      |
| `hooks-extended.ts`           | 20           | 25            | 44% inline      |
| `hooks-productive.ts`         | 28           | 18            | 61% inline      |
| `hooks-crm.ts`                | 12           | 4             | 75% inline      |
| `hooks-v2-features.ts`        | 22           | 8             | 73% inline      |
| `hooks-remaining-entities.ts` | 0            | 55            | 0% inline ✓     |
| `hooks-messaging.ts`          | ~16          | 0             | N/A (non-CRUD)  |
| `hooks-live-ops.ts`           | ~15          | 0             | N/A (read-only) |
| `hooks-credentialing.ts`      | 0            | ~18           | 0% inline ✓     |

**Root cause:** `hooks.ts` was the original hook file (Migration 001-003 era). Factory functions were created later. Newer files (`hooks-remaining-entities.ts`, `hooks-credentialing.ts`) are 100% factory.

### I-1 Entity-by-Entity Breakdown (`hooks.ts` — 60 inline hooks)

Every hook in `hooks.ts` is Pattern B or C:

- **deals:** `useDeals`, `useCreateDeal`, `useUpdateDeal` — Pattern C (TablesInsert/TablesUpdate generics)
- **projects:** `useProjects`, `useProject`, `useCreateProject`, `useUpdateProject`, `useDeleteProject` — Pattern C
- **tasks:** `useTasks`, `useCreateTask`, `useUpdateTask`, `useMyTasks`, `useMyTaskCounts` — Pattern C + D
- **crew_members:** `useCrewMembers`, `useCreateCrewMember`, `useUpdateCrewMember` — Pattern C
- **assets:** `useAssets`, `useCreateAsset`, `useUpdateAsset` — Pattern C
- **vendors:** `useVendors`, `useCreateVendor`, `useUpdateVendor` — Pattern C
- **purchase_orders:** `usePurchaseOrders`, `useCreatePurchaseOrder` — Pattern C
- **invoices:** `useInvoices` — Pattern B
- **approvals:** `useApprovals`, `useUpdateApproval` — Pattern B/C
- **locations:** `useLocations`, `useLocation`, `useCreateLocation`, `useUpdateLocation` — Pattern C
- **activations:** `useActivations`, `useCreateActivation` — Pattern C
- **events:** `useEvents`, `useCreateEvent` — Pattern C
- **time_entries:** `useTimeEntries`, `useCreateTimeEntry` — Pattern C
- **expenses:** `useExpenses`, `useCreateExpense` — Pattern C
- **budget_line_items:** `useBudgetLineItems`, `useCreateBudgetLineItem` — Pattern C
- **milestones:** `useMilestones`, `useCreateMilestone` — Pattern C
- **comments:** `useComments`, `useCreateComment` — Pattern C (deprecated)
- **activity_log:** `useActivityLog` — Pattern B
- **project_templates:** `useProjectTemplates`, `useCreateProjectTemplate` — Pattern C
- **integrations:** `useIntegrations` — Pattern B
- **shipments:** `useShipments`, `useCreateShipment` — Pattern C
- **crew_shifts:** `useCrewShifts`, `useCreateCrewShift` — Pattern C
- **incidents:** `useIncidents`, `useCreateIncident` — Pattern C
- **budgets:** `useBudgets`, `useCreateBudget` — Pattern C
- **contracts:** `useContracts`, `useCreateContract` — Pattern C
- **And 15+ more entities...**

**Every one of these** can be replaced by factory equivalents. The Pattern C hooks gain nothing from `TablesInsert<>` typing since the factory accepts `Record<string, unknown>` and the API route validates via Zod.

---

## 4. Layer 2 — API Route Pattern Inconsistencies

### Canonical Pattern (99% of routes)

All 350+ API route files use the `createCollectionRoute` / `createItemRoute` factory with `getEntityCrudConfig`. This is **already normalized**. Zero outliers in standard CRUD routes.

### Non-CRUD Routes (legitimate exceptions)

These routes are custom by nature and do not need normalization:

| Route                              | Reason                                                     |
| ---------------------------------- | ---------------------------------------------------------- |
| `/api/auth/*`                      | Auth flows (Supabase, Bluesky OAuth, MFA)                  |
| `/api/billing/*`                   | Subscription management                                    |
| `/api/approval-engine/*`           | Multi-step approval workflow                               |
| `/api/advancing/*`                 | Complex nested CRUD (advance → items → status transitions) |
| `/api/teams/[id]/members/*`        | Nested sub-resource                                        |
| `/api/invoices/generate-from-time` | Cross-entity action                                        |
| `/api/notifications/mark-all-read` | Bulk action                                                |
| `/api/time-entries/submit`         | Bulk status transition                                     |
| `/api/conversations/*/messages/*`  | Messaging (separate domain)                                |
| `/api/assets/lookup`               | Scan/lookup (not CRUD)                                     |
| `/api/settings/*`                  | Hierarchical settings                                      |

**Verdict:** API route layer is clean. No remediation needed.

---

## 5. Layer 3 — Entity Config Inconsistencies

### I-3a: Missing `getEntityCrudConfig` Helper

The `entity-config.ts` file defines `ENTITY_CONFIGS` and `defineEntity()` but the grep for `getEntityCrudConfig` usage in API routes shows all routes call it. However, the file exports it as:

```typescript
export function getEntityCrudConfig(entityName: string): CrudConfig { ... }
```

This works. No inconsistency here.

### I-3b: `entityName` vs Hook Query Key Mismatch

The `entityConfig.entityName` is the canonical query key source. But many inline hooks use **different** keys:

| Entity Config `entityName` |                                                       Hook Query Key Used | Mismatch?                                                                      |
| -------------------------- | ------------------------------------------------------------------------: | ------------------------------------------------------------------------------ |
| `"deal"`                   |                                                                  `"deal"` | ✓ Match                                                                        |
| `"project"`                |                                                               `"project"` | ✓ Match                                                                        |
| `"lead"`                   |                                        `"lead"` (crm) / `"leads"` (pages) | ✗ **MISMATCH**                                                                 |
| `"stakeholder"`            |                                                           `"stakeholder"` | ✓ Match                                                                        |
| `"document"`               |                                           `"document"` (pages+productive) | ✓ Match but **two separate entities** (vault_documents vs documents) share key |
| `"template"`               |               `"template"` (pages) / `"project_template"` (hooks.ts + v2) | ✗ **MISMATCH**                                                                 |
| `"credit_note"`            |                      `"credit_note"` (pages) / `"credit_note"` (extended) | ✓ Match but **duplicate list hooks**                                           |
| `"automation"`             |                      `"automation"` (pages) / `"automation"` (productive) | ✓ Match but **duplicate list hooks**                                           |
| `"notification"`           | `"notification"` (hooks.ts) / `"notification"` (v2) with different shapes | ✗ **Semantic collision**                                                       |
| `"document_template"`      |                   `"document_template"` (extended) / `"template"` (pages) | ✗ **MISMATCH**                                                                 |

### I-3c: Key Mismatches Detail

1. **`"leads"` vs `"lead"`**: `hooks-pages.ts` line 347 uses `makeDeleteHook("leads", ...)` while `hooks-crm.ts` and entity config use `"lead"`. Delete invalidation won't clear CRM list cache.

2. **`"template"` vs `"project_template"` vs `"document_template"`**: Three different keys for overlapping concepts. `hooks-pages.ts` uses `"template"` for `project_templates` table. `hooks.ts` uses `"project_template"`. `hooks-extended.ts` uses `"document_template"` for `document_templates` table. Different tables — but the naming is confusing and `hooks-pages.ts` line 1060-1077 creates `useDocumentTemplates`/`useDocumentTemplate` with key `"template"` pointing at `project_templates` table, while `hooks-extended.ts` line 324-348 creates the same-named hooks with key `"document_template"` pointing at `document_templates` table.

3. **Notification collision**: `hooks.ts` `useNotifications` and `hooks-v2-features.ts` `useNotifications` both export a function named `useNotifications` — the barrel export only re-exports from v2. The hooks.ts version is shadowed.

---

## 6. Layer 4 — Query Key Inconsistencies

### Factory Pattern Keys (Consistent)

```
List:   [key, mergedFilters]          e.g. ["company", { sort_by: "name", sort_order: "asc" }]
Detail: [key, "detail", id]           e.g. ["company", "detail", "uuid"]
```

### Inline Pattern Keys (Inconsistent)

| File                   | Entity        | List Key                           | Detail Key                           | Issues                                                                            |
| ---------------------- | ------------- | ---------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------- |
| `hooks.ts`             | projects      | `["project"]`                      | `["project", id]`                    | Detail key clashes with list when `id` looks like a filter; no `"detail"` segment |
| `hooks.ts`             | locations     | `["location", projectId]`          | `["location", id]`                   | List and detail keys are ambiguous — both use `[key, string]`                     |
| `hooks.ts`             | tasks         | `["task", projectId]`              | N/A                                  | Inconsistent with factory `["task", mergedFilters]`                               |
| `hooks-pages.ts`       | campaigns     | `["campaign", projectId]`          | factory `["campaign", "detail", id]` | List key is positional not object                                                 |
| `hooks-productive.ts`  | contacts      | `["contact", { companyId }]`       | factory `["contact", "detail", id]`  | List key uses named object (close to factory but not identical)                   |
| `hooks-productive.ts`  | proposals     | `["proposal", { status }]`         | N/A                                  | Named object filter                                                               |
| `hooks-crm.ts`         | leads         | `["lead", status]`                 | factory `["lead", "detail", id]`     | Positional status filter                                                          |
| `hooks-v2-features.ts` | notifications | `["notification", { unreadOnly }]` | N/A                                  | Named object                                                                      |

**The problem:** When factory `makeCreateHook` invalidates `{ queryKey: ["campaign"] }`, it invalidates **all** queries starting with `"campaign"`. But inline hooks with key `["campaign", projectId]` will only be caught if React Query's prefix matching covers it. This works by accident, but the mismatch means:

- Detail caches created by `makeDetailHook` (`["campaign", "detail", id]`) won't be invalidated by inline create mutations that only call `invalidateQueries({ queryKey: ["campaign"] })`
- Filter-specific list refetches behave differently between factory and inline hooks

---

## 7. Layer 5 — Hook CRUD Completeness Gaps

### Canonical: Every entity should have 5 hooks (List, Detail, Create, Update, Delete)

**Entities with incomplete CRUD sets:**

| Entity            | List           | Detail    | Create         | Update       | Delete    | Missing                        |
| ----------------- | -------------- | --------- | -------------- | ------------ | --------- | ------------------------------ |
| deals             | ✓ (hooks.ts)   | ✗         | ✓              | ✓            | ✓ (pages) | Detail                         |
| vehicles          | ✓ (hooks.ts)   | ✗         | ✓ (pages)      | ✗            | ✗         | Detail, Update, Delete         |
| invoices          | ✓ (hooks.ts)   | ✓ (pages) | ✗              | ✓ (pages)    | ✓ (pages) | Create                         |
| approvals         | ✓ (hooks.ts)   | ✓ (pages) | ✓ (pages)      | ✓ (hooks.ts) | ✓ (pages) | — (complete but split)         |
| brand_kits        | ✓ (hooks.ts)   | ✓ (pages) | ✓ (pages)      | ✓ (pages)    | ✓ (pages) | — (complete but split)         |
| decks             | ✓ (hooks.ts)   | ✓ (pages) | ✓ (pages)      | ✓ (pages)    | ✓ (pages) | — (complete but split)         |
| sops              | ✓ (hooks.ts)   | ✗         | ✗              | ✗            | ✗         | Detail, Create, Update, Delete |
| case_studies      | ✓ (hooks.ts)   | ✗         | ✗              | ✗            | ✗         | Detail, Create, Update, Delete |
| stakeholders      | ✓ (hooks.ts)   | ✗         | ✓ (pages)      | ✓ (pages)    | ✓ (pages) | Detail                         |
| rfqs              | ✓ (hooks.ts)   | ✗         | ✗              | ✗            | ✗         | Detail, Create, Update, Delete |
| asset_assignments | ✓ (hooks.ts)   | ✗         | ✓              | ✗            | ✗         | Detail, Update, Delete         |
| crew_availability | ✓ (hooks.ts)   | ✗         | ✗              | ✗            | ✗         | Detail, Create, Update, Delete |
| payroll_batches   | ✓ (pages+ext)  | ✗         | ✓ (pages+ext)  | ✓ (ext)      | ✗         | Detail, Delete                 |
| credit_notes      | ✓ (pages+ext)  | ✗         | ✓ (pages+ext)  | ✓ (ext)      | ✗         | Detail, Delete                 |
| automations       | ✓ (pages+prod) | ✗         | ✓ (pages+prod) | ✗            | ✗         | Detail, Update, Delete         |
| checklists        | ✓ (pages)      | ✗         | ✓ (pages)      | ✗            | ✗         | Detail, Update, Delete         |
| expense_reports   | ✓ (pages)      | ✗         | ✓ (pages)      | ✗            | ✗         | Detail, Update, Delete         |
| timesheets        | ✓ (pages)      | ✗         | ✓ (pages)      | ✗            | ✗         | Detail, Update, Delete         |
| workflows         | ✓ (pages)      | ✗         | ✓ (pages)      | ✗            | ✗         | Detail, Update, Delete         |
| risk_assessments  | ✓ (pages)      | ✗         | ✓ (pages)      | ✗            | ✗         | Detail, Update, Delete         |
| ip_rights         | ✓ (pages)      | ✗         | ✓ (pages)      | ✗            | ✗         | Detail, Update, Delete         |
| goals             | ✓ (pages)      | ✗         | ✗              | ✗            | ✗         | Detail, Create, Update, Delete |

**~95 missing CRUD hooks across ~25 entities.**

---

## 8. Layer 6 — Duplicate / Shadowed Hook Definitions

### CRITICAL: Same Hook Name Exported from Multiple Files

| Hook Name                   | File 1                               | File 2                                   | Winner (barrel) | Problem                       |
| --------------------------- | ------------------------------------ | ---------------------------------------- | --------------- | ----------------------------- |
| `useCompanies`              | `hooks-pages.ts`                     | `hooks-productive.ts`                    | productive      | Pages version unused/shadowed |
| `useCompany`                | `hooks-pages.ts`                     | `hooks-productive.ts`                    | productive      | Pages version unused/shadowed |
| `useUpdateCompany`          | `hooks-pages.ts`                     | `hooks-productive.ts`                    | productive      | Pages version unused/shadowed |
| `useDeleteCompany`          | `hooks-pages.ts`                     | `hooks-productive.ts`                    | productive      | Pages version unused/shadowed |
| `useProposals`              | `hooks-pages.ts`                     | `hooks-productive.ts`                    | productive      | Different query key shape     |
| `useCreateProposal`         | `hooks-pages.ts`                     | `hooks-productive.ts`                    | productive      | Pages version unused          |
| `useUpdateProposal`         | `hooks-pages.ts`                     | `hooks-productive.ts`                    | productive      | Pages version unused          |
| `useNotifications`          | `hooks.ts`                           | `hooks-v2-features.ts`                   | v2              | hooks.ts version shadowed     |
| `useMarkNotificationRead`   | `hooks.ts`                           | `hooks-v2-features.ts`                   | v2              | hooks.ts version shadowed     |
| `useDocuments`              | `hooks-pages.ts` (vault_documents)   | `hooks-productive.ts` (documents)        | productive      | **Different tables!**         |
| `useDocument`               | `hooks-pages.ts` (vault_documents)   | `hooks-productive.ts` (documents)        | productive      | **Different tables!**         |
| `useCreateDocument`         | `hooks-pages.ts` (vault_documents)   | `hooks-productive.ts` (documents)        | productive      | **Different tables!**         |
| `useUpdateDocument`         | `hooks-pages.ts` (vault_documents)   | `hooks-productive.ts` (documents)        | productive      | **Different tables!**         |
| `useCreditNotes`            | `hooks-pages.ts`                     | `hooks-extended.ts`                      | extended        | Different return types        |
| `useCreateCreditNote`       | `hooks-pages.ts`                     | `hooks-extended.ts`                      | extended        | Pages version unused          |
| `usePayrollBatches`         | `hooks-pages.ts`                     | `hooks-extended.ts`                      | extended        | Different return types        |
| `useCreatePayrollBatch`     | `hooks-pages.ts`                     | `hooks-extended.ts`                      | extended        | Pages version unused          |
| `useRecurringInvoices`      | `hooks-pages.ts`                     | `hooks-productive.ts`                    | productive      | Different sort columns        |
| `usePayments`               | `hooks-pages.ts`                     | `hooks-productive.ts`                    | productive      | Different query key shapes    |
| `useCreatePayment`          | `hooks-pages.ts`                     | `hooks-productive.ts`                    | productive      | Pages version unused          |
| `useRateCards`              | `hooks-pages.ts`                     | `hooks-productive.ts`                    | productive      | Exact duplicates              |
| `useCreateRateCard`         | `hooks-pages.ts`                     | `hooks-productive.ts`                    | productive      | Exact duplicates              |
| `useAutomations`            | `hooks-pages.ts`                     | `hooks-productive.ts`                    | productive      | Different query key shapes    |
| `useCreateAutomation`       | `hooks-pages.ts`                     | `hooks-productive.ts`                    | productive      | Pages version unused          |
| `useDocumentTemplate`       | `hooks-pages.ts` (project_templates) | `hooks-extended.ts` (document_templates) | extended        | **Different tables!**         |
| `useDocumentTemplates`      | `hooks-pages.ts` (project_templates) | `hooks-extended.ts` (document_templates) | extended        | **Different tables!**         |
| `useCreateDocumentTemplate` | `hooks-pages.ts` (project_templates) | `hooks-extended.ts` (document_templates) | extended        | **Different tables!**         |
| `useResourceBookings`       | `hooks-pages.ts`                     | `hooks-productive.ts`                    | productive      | Different signatures          |

**28 duplicate definitions.** 3 are semantic collisions (different tables with same name).

---

## 9. Layer 7 — Barrel Export Inconsistencies

### `src/lib/supabase/index.ts` Issues

1. **`hooks.ts` is barely exported.** Only `useMyTasks` and `useMyTaskCounts` are re-exported from `hooks.ts`. The other ~58 hooks in that file (deals, projects, tasks, crew, assets, etc.) are consumed by pages via direct `import from "@/lib/supabase/hooks"` — **bypassing the barrel**.

2. **`hooks-pages.ts` is selectively exported.** Only `useTeams`/`useTeamDetail`/`useCreateTeam`/`useUpdateTeam`/`useDeleteTeam`/`useTeamMembersPage`/`useAddTeamMember`/`useRemoveTeamMember` are re-exported. All other ~150+ hooks from `hooks-pages.ts` are imported directly.

3. **`hooks-productive.ts` is not exported at all** through the barrel. Consumers import directly.

4. **`hooks-extended.ts` is partially exported** (only user certifications).

5. **`hooks-crm.ts` is not exported** through the barrel.

**Impact:** The barrel file is not the SSOT for hook imports. ~200+ hooks are imported via direct file paths, defeating the purpose of having a barrel.

---

## 10. Layer 8 — Join Type Fragmentation

### Duplicate `WithJoin` Type Definitions

The `WithJoin<T, J>` pattern and join name types are **independently defined** in 3 files:

| File                  | Types Defined                                                                                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hooks.ts`            | `WithJoin`, `ProfileName`, `ProfileNameAvatar`, `ProjectName`, `VendorName`, `LocationName`, `EventName`, `ActivationName`, `CompanyName` + 30 composite types |
| `hooks-extended.ts`   | `WithJoin`, `ProfileName`, `ProjectName`, `VendorName`, `LocationName`, `AssetName` + 12 composite types                                                       |
| `hooks-productive.ts` | `WithJoin`, `ProfileName`, `CompanyName`, `ContactName`, `ProjectName`, `PipelineName` + 12 composite types                                                    |

**`WithJoin`, `ProfileName`, `ProjectName`, `VendorName`, `LocationName`** are all independently defined 3 times.

---

## 11. Layer 9 — Mutation Invalidation Inconsistencies

### Factory Pattern (Correct)

- `makeCreateHook`: invalidates `[key]` (all lists)
- `makeUpdateHook`: invalidates `[key]` (all lists) + `[key, "detail", id]` (detail cache)
- `makeDeleteHook`: invalidates `[key]` (all lists)

### Inline Pattern (Inconsistent)

| Hook                       | Invalidation                                          | Missing                                                            |
| -------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------ |
| `useCreateDeal`            | `["deal"]`                                            | ✓ OK — no detail to invalidate                                     |
| `useUpdateDeal`            | `["deal"]` only                                       | ✗ Missing `["deal", "detail", id]` (but detail hook doesn't exist) |
| `useUpdateProject`         | `["project"]` + `["project", variables.id]`           | ✗ Key should be `["project", "detail", id]` to match factory       |
| `useUpdateLocation`        | `["location"]` + `["location", variables.id]`         | ✗ Same — no `"detail"` segment                                     |
| `useUpdateOrganization`    | `["organization"]` + `["organization", variables.id]` | ✗ Same                                                             |
| `useCreateBudgetLineItem`  | `["budget_line_item", variables.project_id]`          | ✗ Only invalidates filtered list, not all lists                    |
| `useCreateMilestone`       | `["milestone", variables.project_id]`                 | ✗ Same — only filtered list                                        |
| `useCreateAssetAssignment` | `["asset_assignment"]` + `["asset"]`                  | ✓ Cross-entity invalidation (good)                                 |

---

## 12. Layer 10 — Hook File Organization

### Current File → Domain Mapping

| File                          | Original Intent               | Actual Contents                                                      |
| ----------------------------- | ----------------------------- | -------------------------------------------------------------------- |
| `hooks.ts`                    | Core Migration 001-003 tables | 60 hooks for core entities (deals, projects, tasks, crew, assets...) |
| `hooks-pages.ts`              | Dashboard page hooks          | 175+ hooks — a catch-all accumulator                                 |
| `hooks-extended.ts`           | Migration 002+ tables         | 45 hooks for extended entities                                       |
| `hooks-productive.ts`         | CRM/Analytics                 | 65 hooks but overlaps heavily with hooks-pages                       |
| `hooks-crm.ts`                | CRM & Public site             | 12 hooks (leads, testimonials, reviews)                              |
| `hooks-v2-features.ts`        | V2 competitive gaps           | 40 hooks (automation, revenue, notifications...)                     |
| `hooks-remaining-entities.ts` | Entity config gap filler      | 55 hooks — 100% factory, cleanest file                               |
| `hooks-messaging.ts`          | Messaging domain              | 16 hooks — separate domain, justified                                |
| `hooks-live-ops.ts`           | Live operations               | 15 hooks — separate domain, justified                                |
| `hooks-credentialing.ts`      | Credentialing/ticketing       | 18 hooks — 100% factory, clean                                       |

**Problem:** Hooks for the same entity are split across 2-3 files. Example: `useApprovals` in `hooks.ts`, `useApproval` (detail) in `hooks-pages.ts`, `useCreateApproval` in `hooks-pages.ts`, `useUpdateApproval` in `hooks.ts`, `useDeleteApproval` in `hooks-pages.ts`.

---

## 13. Remediation Plan

> **POLICY: ZERO BACKWARDS COMPATIBILITY.**
> No re-export shims. No legacy file stubs. Old files are DELETED.
> Every consumer import is rewritten to the canonical barrel `@/lib/supabase` or directly to the new domain file.
> Every hook uses the factory pattern. Every query key matches `entityConfig.entityName`.

### Phase 1 — Create `hook-types.ts` (SSOT for all join types)

**Action:** Create `src/lib/supabase/hook-types.ts` containing:

- `WithJoin<T,J>` generic helper
- All 10 reusable join fragments (`ProfileName`, `ProjectName`, `VendorName`, `LocationName`, `EventName`, `ActivationName`, `CompanyName`, `ContactName`, `PipelineName`, `AssetName`)
- All ~54 composite types (e.g., `ProjectWithMembers`, `InvoiceWithJoins`, `CreditNoteWithJoins`)
- All row aliases (`DocumentTemplateRow`, `OrganizationRow`, etc.)
- All interfaces (`ScenarioWithProject`, `CustomFieldDefinitionRow`)

**No file keeps its own type definitions.** All hook files import from `hook-types.ts`.

### Phase 2 — Create 12 New Domain Hook Files

Each file follows this exact template:

1. `"use client"` directive
2. Import `Tables` from `./database.types`
3. Import all 5 factory functions from `./hook-factories`
4. Import needed types from `./hook-types`
5. Import `useQuery`, `useMutation`, `useQueryClient` + API helpers ONLY for justified non-CRUD exceptions
6. Every standard entity gets full 5-hook CRUD set (List, Detail, Create, Update, Delete)
7. Query key = `entityConfig.entityName` (snake_case singular)
8. API path = `entityConfig.basePath` (kebab-case `/api/{slug}`)

**Target file structure:**

| New File                    | Entities                                                                                                                                                                                                                                                                                                                                                                  | Replaces                                                                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hooks-core.ts`             | projects, tasks, deals, locations, events, activations, approvals, milestones, calendar_events, shifts, comments, activity_log, notifications, integrations, project_templates                                                                                                                                                                                            | `hooks.ts`                                                                                                                                               |
| `hooks-crm.ts`              | leads, opportunities, companies, contacts, pipelines, proposals, estimates, testimonials, reviews, case_studies, stakeholders, lead_activities                                                                                                                                                                                                                            | Old `hooks-crm.ts` + CRM parts of `hooks-productive.ts` + `hooks-pages.ts`                                                                               |
| `hooks-finance.ts`          | invoices, client_invoices, recurring_invoices, payments, credit_notes, payroll_batches, budget_approvals, budget_line_items, production_budget_lines, gl_accounts, rate_cards, rate_card_items, job_cost_entries, revenue_schedules, revenue_recognition_entries, depreciation_schedules, expense_reports, timesheets, billing                                            | `hooks-pages.ts` finance + `hooks-extended.ts` finance + `hooks-v2-features.ts` revenue + `hooks-remaining-entities.ts` finance                          |
| `hooks-workforce.ts`        | crew_members, crew_shifts, crew_availability, time_entries, time_off_requests, resource_bookings, worker_profiles, worker_classifications, worker_compliance_docs, worker_onboarding_runs, worker_offboarding_runs, worker_reviews, active_timers, certifications, hr_certifications, user_certifications                                                                 | `hooks.ts` crew + `hooks-pages.ts` workforce + `hooks-productive.ts` workforce + `hooks-extended.ts` workforce + `hooks-remaining-entities.ts` workforce |
| `hooks-production.ts`       | production_tasks, production_milestones, production_checklists, production_sops, production_expenses, production_time_entries, production_runs, production_verticals, technical_specs, work_packages, boms, qc_gates, scenarios, schedule_entries, project_assignments                                                                                                    | `hooks-productive.ts` production + `hooks-extended.ts` production + `hooks-remaining-entities.ts` production                                             |
| `hooks-assets-inventory.ts` | assets, asset_assignments, asset_versions, asset_tags, vehicles, kits, load_plans, inventory_audits, inventory_items (catalog), warehouses, rental_agreements, space_bookings, shipments, consumables, consumable_usage, maintenance_records, storage_objects                                                                                                             | `hooks.ts` assets + `hooks-pages.ts` assets + `hooks-extended.ts` assets + `hooks-remaining-entities.ts` assets                                          |
| `hooks-documents.ts`        | documents, document_versions, document_templates, vault_documents, brand_guidelines, brand_guideline_sections, brand_kits, creative_briefs, brief_templates, creative_reviews, decks, call_sheets, tech_sheets, sops, knowledge_articles, digital_assets, creative_assets                                                                                                 | `hooks.ts` docs + `hooks-pages.ts` docs + `hooks-productive.ts` docs + `hooks-extended.ts` docs                                                          |
| `hooks-legal.ts`            | contracts, change_orders, permits, insurance_policies, insurance_requirements, ip_rights, rights_licenses, contract_amendments, contract_obligations, clause_library, legal_holds, compliance_checklists, compliance_requirements, e_signatures, rfqs                                                                                                                     | `hooks.ts` legal + `hooks-pages.ts` legal + `hooks-remaining-entities.ts` legal                                                                          |
| `hooks-automation.ts`       | automations, automation_rules, automation_executions, workflows, notifications, notification_preferences, email_messages, saved_views, custom_fields, custom_field_definitions, custom_field_values, dashboards, dashboard_widgets, report_definitions, ai_report_queries, sla_policies, survey_templates, survey_responses, time_tracking_policies, data_export_requests | `hooks-v2-features.ts` + `hooks-productive.ts` automation + `hooks-pages.ts` automation + `hooks-extended.ts` automation                                 |
| `hooks-admin.ts`            | organizations, teams, team_members, invitations, user_profiles (people), user_directory, billing, settings, audit logs (login_audit_log, role_change_log, access_audit_log), temporary_access_grants, approval_steps, feature_flags, goals, vendor_communications, brands                                                                                                 | `hooks-pages.ts` admin + `hooks-extended.ts` admin + `hooks-remaining-entities.ts` admin                                                                 |
| `hooks-live-ops.ts`         | live_event_instances, live_crew_assignments, strike_sequences, environmental_readings, foh_zones, foh_zone_readings, comm_channels, department_statuses, guest_incidents, readiness_gates, ros_cues, vip_guests, equipment_check_ins, live_financial_snapshots, post_event_reports, vip_service_requests, scan_events                                                     | **REWRITTEN from direct Supabase to API route factory pattern**                                                                                          |
| `hooks-views-aggregates.ts` | useMyTasks, useMyTaskCounts, useCrewUtilization, useProjectProfitability, usePipelineSummary, useInvoiceAging, useSOWDeliverableSummary, useClientInvoiceAging, useLeadPipelineStats, useReviewStats, useComplianceDrift, useOrgSecuritySettings, useConvertLeadToDeal, useGenerateInvoiceFromTime, useSubmitTimeEntries                                                  | Non-CRUD views, aggregates, cross-entity actions — justified inline                                                                                      |

**Unchanged files (already clean):**

- `hooks-messaging.ts` — separate domain, non-CRUD patterns
- `hooks-messaging-realtime.ts` — realtime subscriptions
- `hooks-credentialing.ts` — 100% factory, clean
- `hooks-advancing.ts` — complex nested CRUD, justified inline
- `hooks-external-sync.ts` — complex filter patterns, justified inline
- `hooks-scanning.ts` — non-CRUD scanning actions
- `hooks-approval-engine.ts` — workflow actions
- `hooks-switcher.ts` — context switcher queries

### Phase 3 — DELETE All Old Hook Files

**Files to delete (no shims, no re-exports):**

| File                                           | Line Count       | Reason                                                         |
| ---------------------------------------------- | ---------------- | -------------------------------------------------------------- |
| `src/lib/supabase/hooks.ts`                    | 1,253            | Replaced by `hooks-core.ts` + domain files                     |
| `src/lib/supabase/hooks-pages.ts`              | 1,780            | Distributed to all domain files                                |
| `src/lib/supabase/hooks-extended.ts`           | 579              | Distributed to domain files                                    |
| `src/lib/supabase/hooks-productive.ts`         | 571              | Split to `hooks-crm.ts` + `hooks-production.ts` + domain files |
| `src/lib/supabase/hooks-crm.ts`                | 144              | Replaced by new `hooks-crm.ts`                                 |
| `src/lib/supabase/hooks-v2-features.ts`        | 522              | Distributed to `hooks-automation.ts` + domain files            |
| `src/lib/supabase/hooks-remaining-entities.ts` | 550              | Distributed to domain files                                    |
| **Total deleted**                              | **~5,399 lines** |                                                                |

### Phase 4 — Rewrite Barrel Export (`index.ts`)

Rewrite `src/lib/supabase/index.ts` to re-export **every hook and type** from the new domain files.

**Import policy:**

- `@/lib/supabase` is the ONLY valid import path for hooks in consumer files
- No consumer may import from `@/lib/supabase/hooks-core` or any domain file directly
- The barrel is the single entry point

### Phase 5 — Update ALL Consumer Imports (~200 files)

**Every file** in `src/app/` and `src/components/` that imports from any old hook file MUST be updated:

| Old Import                                       | New Import              |
| ------------------------------------------------ | ----------------------- |
| `from "@/lib/supabase/hooks"`                    | `from "@/lib/supabase"` |
| `from "@/lib/supabase/hooks-pages"`              | `from "@/lib/supabase"` |
| `from "@/lib/supabase/hooks-extended"`           | `from "@/lib/supabase"` |
| `from "@/lib/supabase/hooks-productive"`         | `from "@/lib/supabase"` |
| `from "@/lib/supabase/hooks-crm"`                | `from "@/lib/supabase"` |
| `from "@/lib/supabase/hooks-v2-features"`        | `from "@/lib/supabase"` |
| `from "@/lib/supabase/hooks-remaining-entities"` | `from "@/lib/supabase"` |
| `from "@/lib/supabase/hooks-live-ops"`           | `from "@/lib/supabase"` |

**Hook renames that require consumer updates:**

- `useDocuments` (vault_documents) → `useVaultDocuments` — update all vault page consumers
- `useDocument` (vault_documents) → `useVaultDocument`
- `useCreateDocument` (vault_documents) → `useCreateVaultDocument`
- `useUpdateDocument` (vault_documents) → `useUpdateVaultDocument`
- `useDeleteDocument` (vault_documents) → `useDeleteVaultDocument`
- `useDocumentTemplates` (project_templates alias) → deleted, use `useProjectTemplates`
- `useDocumentTemplate` (project_templates alias) → deleted, use `useProjectTemplate`
- `useUpdateDocumentTemplate` (project_templates alias) → deleted, use `useUpdateProjectTemplate`
- `useContractDetail` → deleted, use `useContract` (detail hook)
- `useInvoiceDetail` → deleted, use `useInvoice` (detail hook)
- `useUpdateAssetHook` alias → deleted, use `useUpdateAsset`

**Consumers with multiple old-file imports on same page** must be consolidated into a single `from "@/lib/supabase"` import.

### Phase 6 — Verification

| Check                              | Command                                                              | Expected                                                                                                                                                                        |
| ---------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zero TS errors                     | `npx tsc --noEmit`                                                   | Exit 0                                                                                                                                                                          |
| Zero ESLint errors                 | `npx eslint src/lib/supabase/ src/app/ src/components/`              | Exit 0                                                                                                                                                                          |
| Zero duplicate exports             | `grep -rh "^export " src/lib/supabase/hooks-*.ts \| sort \| uniq -d` | Empty                                                                                                                                                                           |
| All hooks use factory              | `grep -c "useQuery\|useMutation" src/lib/supabase/hooks-*.ts`        | Only in `hooks-views-aggregates.ts`, `hooks-messaging.ts`, `hooks-advancing.ts`, `hooks-external-sync.ts`, `hooks-scanning.ts`, `hooks-approval-engine.ts`, `hooks-live-ops.ts` |
| All query keys match entity config | Automated script                                                     | Keys match `entityConfig.entityName`                                                                                                                                            |
| All entities have 5 CRUD hooks     | Script against entity config registry                                | 100% coverage for all entities with API routes                                                                                                                                  |
| Barrel exports all hooks           | Count exports in `index.ts` vs total hook count                      | Match                                                                                                                                                                           |
| Zero old-file imports              | `grep -r "from.*supabase/hooks\"" src/app/ src/components/`          | 0 results                                                                                                                                                                       |
| Zero hooks-pages imports           | `grep -r "hooks-pages" src/app/ src/components/`                     | 0 results                                                                                                                                                                       |
| Zero hooks-productive imports      | `grep -r "hooks-productive" src/app/ src/components/`                | 0 results                                                                                                                                                                       |
| Zero hooks-extended imports        | `grep -r "hooks-extended" src/app/ src/components/`                  | 0 results                                                                                                                                                                       |
| Zero hooks-crm imports             | `grep -r "hooks-crm" src/app/ src/components/`                       | 0 results (new hooks-crm.ts is only accessed via barrel)                                                                                                                        |
| Zero hooks-v2-features imports     | `grep -r "hooks-v2-features" src/app/ src/components/`               | 0 results                                                                                                                                                                       |
| Zero hooks-remaining imports       | `grep -r "hooks-remaining" src/app/ src/components/`                 | 0 results                                                                                                                                                                       |

---

## Appendix A — Estimated Effort

| Phase                                 | Scope                                       | Estimated Time |
| ------------------------------------- | ------------------------------------------- | -------------- |
| Phase 1: Create `hook-types.ts`       | ~54 types                                   | 30 min         |
| Phase 2: Create 12 domain hook files  | ~450 hooks (all factory + CRUD gaps filled) | 6 hours        |
| Phase 3: Delete 7 old hook files      | 5,399 lines deleted                         | 5 min          |
| Phase 4: Rewrite barrel `index.ts`    | ~500 re-exports                             | 1 hour         |
| Phase 5: Update ~200 consumer imports | ~200 files                                  | 3 hours        |
| Phase 6: Verification                 | tsc + eslint + grep checks                  | 30 min         |
| **Total**                             |                                             | **~11 hours**  |

## Appendix B — Files Deleted (No Shims)

| File                                           | Line Count | Replaced By                                                                                                                                  |
| ---------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/supabase/hooks.ts`                    | 1,253      | `hooks-core.ts` + `hooks-workforce.ts` + `hooks-assets-inventory.ts` + `hooks-documents.ts` + `hooks-legal.ts` + `hooks-views-aggregates.ts` |
| `src/lib/supabase/hooks-pages.ts`              | 1,780      | All 12 domain files                                                                                                                          |
| `src/lib/supabase/hooks-extended.ts`           | 579        | `hooks-finance.ts` + `hooks-production.ts` + `hooks-assets-inventory.ts` + `hooks-automation.ts` + `hooks-admin.ts`                          |
| `src/lib/supabase/hooks-productive.ts`         | 571        | `hooks-crm.ts` + `hooks-production.ts` + `hooks-workforce.ts` + `hooks-automation.ts` + `hooks-views-aggregates.ts`                          |
| `src/lib/supabase/hooks-crm.ts` (old)          | 144        | New `hooks-crm.ts`                                                                                                                           |
| `src/lib/supabase/hooks-v2-features.ts`        | 522        | `hooks-automation.ts` + `hooks-views-aggregates.ts`                                                                                          |
| `src/lib/supabase/hooks-remaining-entities.ts` | 550        | Distributed to domain files                                                                                                                  |
| **Total**                                      | **5,399**  | **12 new files + 1 type file**                                                                                                               |

## Appendix C — New Files Created

| File                                         | Purpose                                          |
| -------------------------------------------- | ------------------------------------------------ |
| `src/lib/supabase/hook-types.ts`             | SSOT for all WithJoin composite types            |
| `src/lib/supabase/hooks-core.ts`             | Core entities (projects, tasks, deals, etc.)     |
| `src/lib/supabase/hooks-crm.ts`              | CRM entities (leads, companies, contacts, etc.)  |
| `src/lib/supabase/hooks-finance.ts`          | Financial entities                               |
| `src/lib/supabase/hooks-workforce.ts`        | Workforce entities                               |
| `src/lib/supabase/hooks-production.ts`       | Production entities                              |
| `src/lib/supabase/hooks-assets-inventory.ts` | Assets & inventory entities                      |
| `src/lib/supabase/hooks-documents.ts`        | Documents & creative entities                    |
| `src/lib/supabase/hooks-legal.ts`            | Legal & compliance entities                      |
| `src/lib/supabase/hooks-automation.ts`       | Automation, notifications, custom fields         |
| `src/lib/supabase/hooks-admin.ts`            | Admin, orgs, teams, audit logs                   |
| `src/lib/supabase/hooks-live-ops.ts`         | Live ops (REWRITTEN to factory)                  |
| `src/lib/supabase/hooks-views-aggregates.ts` | Non-CRUD views, aggregates, cross-entity actions |
| `src/lib/supabase/index.ts`                  | Barrel (REWRITTEN for 100% coverage)             |
