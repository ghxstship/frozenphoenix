# Full-Stack Integrity Audit & Remediation Plan

**Generated:** 2026-03-13
**Scope:** API routes, hooks, entity configs, database schema, TypeScript types
**Method:** Automated cross-referencing of all layers

---

## Executive Summary

| Metric                                              | Count                |
| --------------------------------------------------- | -------------------- |
| Total API collection routes                         | 148                  |
| Total entity configs                                | 145                  |
| Total database tables/views/functions               | 401                  |
| Total hooks files                                   | 18                   |
| TypeScript errors (tsc --noEmit)                    | 333                  |
| Files with TS errors                                | 28 detail/list pages |
| Hooks files NOT in barrel export                    | 6                    |
| Hooks files still using direct Supabase             | 10 (218 calls)       |
| Tables in hooks with no entity config or API route  | 66                   |
| Database views queried in hooks with no API route   | 4                    |
| Entity configs with no API route                    | 2                    |
| Duplicate API routes (same entity, different slugs) | 2                    |

**Overall Integrity Score: 6/10** — API route and entity config coverage is strong for primary entities, but hooks-layer migration is incomplete, barrel exports are fragmented, 333 TS errors exist in detail pages (camelCase vs snake_case), and ~66 sub-entity/junction tables lack full-stack wiring.

---

## Finding 1: TypeScript Errors — camelCase vs snake_case Property Access (P0-Critical)

**333 errors across 28 files.** The root cause is detail pages accessing Supabase row data using camelCase property names (e.g., `totalBudget`) when the database schema uses snake_case (e.g., `total_budget`).

### Error Breakdown by Type

| TS Code | Description                                  | Count |
| ------- | -------------------------------------------- | ----- |
| TS2551  | Property name typo (camelCase vs snake_case) | 195   |
| TS2339  | Property does not exist on type              | 78    |
| TS18047 | Possibly null access                         | 33    |
| TS2345  | Argument type mismatch (null assignability)  | 13    |
| TS2352  | Type conversion error                        | 10    |
| TS2322  | Type assignment error                        | 3     |
| TS2305  | Module export missing                        | 1     |

### Affected Files (by error count)

| File                               | Errors | Primary Issue                           |
| ---------------------------------- | ------ | --------------------------------------- |
| `service-requests/[id]/page.tsx`   | 46     | camelCase property access               |
| `change-orders/[id]/page.tsx`      | 44     | camelCase property access               |
| `briefs/[id]/page.tsx`             | 39     | camelCase + null access on Json fields  |
| `certifications/[id]/page.tsx`     | 30     | Missing `asset_id` property + camelCase |
| `shipments/[id]/page.tsx`          | 26     | camelCase property access               |
| `events/[id]/page.tsx`             | 22     | camelCase property access               |
| `vendors/[id]/page.tsx`            | 18     | camelCase property access               |
| `incidents/[id]/page.tsx`          | 18     | camelCase property access               |
| `activations/[id]/page.tsx`        | 18     | camelCase property access               |
| `opportunities/[id]/page.tsx`      | 17     | camelCase property access               |
| `tasks/[id]/page.tsx`              | 14     | camelCase property access               |
| `budgets/[id]/page.tsx`            | 11     | camelCase property access               |
| `campaigns/[id]/page.tsx`          | 9      | camelCase + null access                 |
| `insurance-policies/[id]/page.tsx` | 6      | camelCase property access               |
| `permits/[id]/page.tsx`            | 2      | camelCase property access               |
| 13 list pages                      | 1 each | Misc type issues                        |

### Remediation

**Approach A (Recommended):** Fix each detail page to use snake_case property names matching the database schema. This is a mechanical find-and-replace per file.

**Approach B (Alternative):** Add a `toCamelCase` transform in the API response layer. NOT recommended — it would break all existing consumers that already use snake_case correctly.

**Estimated effort:** ~2 hours mechanical work across 15 detail pages.

---

## Finding 2: Hooks Files Not in Barrel Export (P1-High)

6 of 18 hooks files are NOT re-exported from `src/lib/supabase/index.ts`. Consumers import directly from individual files, which:

- Breaks the single-import-point pattern
- Makes refactoring harder
- Creates implicit coupling to file structure

### Missing from barrel

| File                    | Exported Hooks | Direct Consumer Imports      |
| ----------------------- | -------------- | ---------------------------- |
| `hooks-productive.ts`   | 65             | 5 pages                      |
| `hooks-crm.ts`          | 12             | 3 pages                      |
| `hooks-sow.ts`          | 22             | 0 (imported via other hooks) |
| `hooks-workflows.ts`    | 23             | 0 (imported via other hooks) |
| `hooks-feature-gaps.ts` | 23             | 13 pages                     |
| `hooks-extended.ts`     | 52             | 3 pages                      |

### Remediation

Add re-exports from `src/lib/supabase/index.ts` for all 6 files (~197 hooks total). Update consumer imports to use the barrel path.

---

## Finding 3: Hooks Still Using Direct Supabase Calls (P1-High)

10 hooks files (218 `getSupabase()` calls) bypass the API route layer. Only `hooks-extended.ts`, `hooks-pages.ts`, and `hooks.ts` have been migrated to the API client pattern.

### Migration Status

| File                          | Lines | Pattern       | Direct Calls | Status                      |
| ----------------------------- | ----- | ------------- | ------------ | --------------------------- |
| `hooks-extended.ts`           | 552   | API client    | 0            | **Migrated**                |
| `hooks-pages.ts`              | 1,348 | API client    | 0            | **Migrated**                |
| `hooks.ts`                    | 1,167 | API client    | 2            | **Migrated** (2 residual)   |
| `hooks-v2-features.ts`        | 741   | `fromTable`   | 0            | Typed client (intermediate) |
| `hooks-feature-gaps.ts`       | 595   | `fromTable`   | 0            | Typed client (intermediate) |
| `hooks-productive.ts`         | 1,300 | `getSupabase` | 67           | **Not migrated**            |
| `hooks-advancing.ts`          | 648   | `getSupabase` | 30           | **Not migrated**            |
| `hooks-credentialing.ts`      | 534   | `getSupabase` | 22           | **Not migrated**            |
| `hooks-workflows.ts`          | 456   | `getSupabase` | 24           | **Not migrated**            |
| `hooks-sow.ts`                | 469   | `getSupabase` | 23           | **Not migrated**            |
| `hooks-live-ops.ts`           | 271   | `getSupabase` | 18           | **Not migrated**            |
| `hooks-crm.ts`                | 242   | `getSupabase` | 14           | **Not migrated**            |
| `hooks-external-sync.ts`      | 344   | `getSupabase` | 14           | **Not migrated**            |
| `hooks-messaging.ts`          | 607   | `getSupabase` | 10           | **Not migrated**            |
| `hooks-switcher.ts`           | 141   | `getSupabase` | 6            | **Not migrated**            |
| `hooks-messaging-realtime.ts` | 238   | `getSupabase` | 7            | Realtime (keep direct)      |
| `hooks-approval-engine.ts`    | 156   | fetch         | 0            | Custom API calls            |

### Remediation

Migrate in priority order (by consumer count):

1. `hooks-productive.ts` (67 calls, 5 page consumers) — largest file
2. `hooks-crm.ts` (14 calls, 3 page consumers)
3. `hooks-live-ops.ts` (18 calls, 15 page consumers)
4. `hooks-sow.ts` (23 calls)
5. `hooks-workflows.ts` (24 calls)
6. `hooks-advancing.ts` (30 calls, 13 page consumers)
7. `hooks-credentialing.ts` (22 calls, 5 page consumers)
8. `hooks-external-sync.ts` (14 calls, 3 page consumers)
9. `hooks-messaging.ts` (10 calls, 8 page consumers)
10. `hooks-switcher.ts` (6 calls, 4 page consumers)

**Note:** `hooks-messaging-realtime.ts` uses `getSupabase()` for Supabase Realtime subscriptions — this is correct and should NOT be migrated.

**Note:** `hooks-v2-features.ts` and `hooks-feature-gaps.ts` use `fromTable` (typed Supabase client helper) — this is an intermediate pattern. Migrating to API client is optional but recommended for consistency.

---

## Finding 4: Tables Referenced in Hooks with No Entity Config or API Route (P2-Medium)

66 tables are queried directly in hooks but have no entity config and no API route. These are primarily:

- Junction/join tables (e.g., `call_sheet_crew`, `invoice_line_items`)
- Sub-entity tables (e.g., `sow_deliverables`, `proposal_items`)
- Materialized views (e.g., `v_crew_utilization`, `v_pipeline_summary`)
- System tables (e.g., `notification_preferences`, `workflow_instances`)

### Full List

**Sub-entities / Junction tables (28):**

- `active_timers`, `call_sheet_crew`, `catalog_categories`, `catalog_item_modifiers`, `catalog_items`, `catalog_org_overrides`, `contacts`, `credential_assignments`, `credential_inventory_pools`, `credential_scan_log`, `credential_types`, `custom_field_values`, `custom_fields`, `deliverable_progress_snapshots`, `document_versions`, `export_templates`, `invoice_line_items`, `invoice_time_entries`, `lead_activities`, `notification_preferences`, `pipelines`, `production_advance_items`, `production_advances`, `proposal_items`, `rate_card_items`, `sow_change_log`, `sow_deliverables`, `workflow_step_approvals`

**Live-ops domain tables (11):**

- `comm_channels`, `department_statuses`, `environmental_readings`, `equipment_check_ins`, `foh_zone_readings`, `foh_zones`, `guest_incidents`, `live_event_instances`, `live_financial_snapshots`, `post_event_reports`, `strike_sequences`, `vip_guests`

**System/workflow tables (7):**

- `advance_status_history`, `advance_templates`, `approval_workflows`, `automation_rules`, `bulk_import_jobs`, `dashboards`, `workflow_instances`

**External sync tables (7):**

- `conversations`, `conversation_members`, `mandatory_read_acknowledgments`, `messages`, `pos_transactions`, `provider_connections`, `provider_ticket_map`, `sync_conflict_policies`, `sync_events`, `webhook_events`

**Views without API routes (4):**

- `v_crew_utilization`, `v_invoice_aging`, `v_pipeline_summary`, `v_project_profitability`

**Other (5):**

- `lead_pipeline_stats`, `review_stats`, `reviews`, `scenarios`, `testimonials`, `time_off_requests`

### Remediation

**Phase 1 — Create API routes for views (4 routes):**
These are read-only GET endpoints that wrap view queries, similar to `v-sow-deliverable-summary` and `v-client-invoice-aging`.

**Phase 2 — Create entity configs + API routes for frequently-queried sub-entities:**
Prioritize tables with 3+ hook references. Many sub-entities (e.g., `sow_deliverables`, `proposal_items`, `invoice_line_items`) are accessed in detail pages and need proper CRUD routes.

**Phase 3 — Leave junction/system tables as direct queries:**
Some tables (e.g., `call_sheet_crew`, `workflow_step_approvals`) are legitimately sub-resources that should be accessed via parent entity API routes rather than having standalone CRUD routes.

---

## Finding 5: Duplicate API Routes (P2-Medium)

Two entity configs map to multiple API route slugs:

| Entity                   | Routes                                                | Issue                                                                                      |
| ------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `document_template`      | `/api/document-templates`, `/api/templates`           | Both use `getEntityCrudConfig("document_template")`. Identical behavior, two entry points. |
| `knowledge_base_article` | `/api/knowledge-base`, `/api/knowledge-base-articles` | Both use `getEntityCrudConfig("knowledge_base_article")`.                                  |

### Remediation

Pick one canonical slug per entity and redirect or remove the duplicate:

- `document_template` → keep `/api/templates` (matches existing page at `/templates`), deprecate `/api/document-templates`
- `knowledge_base_article` → keep `/api/knowledge-base-articles` (explicit), deprecate `/api/knowledge-base`

Update all hook references to use the canonical slug.

---

## Finding 6: Entity Configs Without API Routes (P2-Medium)

2 entity configs are defined but have no corresponding API route:

| Entity Config | Slug           | Issue                                                                                       |
| ------------- | -------------- | ------------------------------------------------------------------------------------------- |
| `automation`  | `automations`  | Config exists, no route at `/api/automations`                                               |
| `team_member` | `team-members` | Config exists, no route at `/api/team-members` (teams use nested `/api/teams/[id]/members`) |

### Remediation

- `automation`: Create `/api/automations/route.ts` and `/api/automations/[id]/route.ts` using CRUD factory.
- `team_member`: This is intentionally a sub-resource of teams. Remove entity config or keep for reference only. No standalone route needed.

---

## Finding 7: Data Access Pattern Inconsistency (P3-Low)

Three distinct patterns coexist for data fetching in hooks:

| Pattern                                  | Files    | Description                                           |
| ---------------------------------------- | -------- | ----------------------------------------------------- |
| **API client** (`apiList`/`apiGet`/etc.) | 3 files  | Best: routes through server-side RLS, typed responses |
| **Typed client** (`fromTable`)           | 2 files  | OK: typed Supabase queries, but client-side           |
| **Raw client** (`getSupabase()`)         | 10 files | Legacy: untyped, bypasses API layer                   |

### Remediation

Converge all hooks to API client pattern. The `fromTable` files (`hooks-v2-features.ts`, `hooks-feature-gaps.ts`) are lower priority since they're already type-safe, but should eventually migrate for consistency.

---

## Prioritized Remediation Roadmap

### Phase 1 — TypeScript Errors (Week 1) — P0

**Goal:** Zero TypeScript errors on `tsc --noEmit`

| Task                                        | Files                 | Effort    |
| ------------------------------------------- | --------------------- | --------- |
| Fix camelCase→snake_case in 15 detail pages | 15 files, ~333 errors | 2-3 hours |

### Phase 2 — Barrel Exports + Missing Routes (Week 1) — P1

**Goal:** Single import point, complete API route coverage

| Task                                     | Files      | Effort |
| ---------------------------------------- | ---------- | ------ |
| Add 6 hooks files to barrel export       | `index.ts` | 30 min |
| Create `/api/automations` CRUD route     | 2 files    | 15 min |
| Create 4 view API routes                 | 4 files    | 30 min |
| Remove duplicate routes or add redirects | 2-4 files  | 30 min |

### Phase 3 — Hooks Migration: Batch 1 (Week 2) — P1

**Goal:** Migrate highest-traffic hooks files to API client

| Task                                            | Lines       | Effort    |
| ----------------------------------------------- | ----------- | --------- |
| Migrate `hooks-productive.ts` (67 direct calls) | 1,300 lines | 3-4 hours |
| Migrate `hooks-crm.ts` (14 direct calls)        | 242 lines   | 1 hour    |
| Migrate `hooks-live-ops.ts` (18 direct calls)   | 271 lines   | 1 hour    |

### Phase 4 — Hooks Migration: Batch 2 (Week 3) — P1

**Goal:** Migrate remaining hooks files

| Task                                               | Lines     | Effort    |
| -------------------------------------------------- | --------- | --------- |
| Migrate `hooks-sow.ts` (23 direct calls)           | 469 lines | 1.5 hours |
| Migrate `hooks-workflows.ts` (24 direct calls)     | 456 lines | 1.5 hours |
| Migrate `hooks-advancing.ts` (30 direct calls)     | 648 lines | 2 hours   |
| Migrate `hooks-credentialing.ts` (22 direct calls) | 534 lines | 1.5 hours |

### Phase 5 — Hooks Migration: Batch 3 (Week 4) — P2

**Goal:** Complete migration, unified pattern

| Task                                               | Lines     | Effort    |
| -------------------------------------------------- | --------- | --------- |
| Migrate `hooks-external-sync.ts` (14 direct calls) | 344 lines | 1 hour    |
| Migrate `hooks-messaging.ts` (10 direct calls)     | 607 lines | 1.5 hours |
| Migrate `hooks-switcher.ts` (6 direct calls)       | 141 lines | 30 min    |
| Migrate `hooks-v2-features.ts` (fromTable)         | 741 lines | 2 hours   |
| Migrate `hooks-feature-gaps.ts` (fromTable)        | 595 lines | 1.5 hours |

### Phase 6 — Sub-Entity API Routes (Week 5-6) — P2

**Goal:** API routes for frequently-queried sub-entities

Create entity configs + CRUD routes for the ~28 sub-entity tables that are directly queried in hooks. Prioritize by hook reference count.

---

## Appendix A: Database Tables With No Frontend Wiring

Of 401 database objects (tables + views + functions), ~145 have entity configs. The remaining ~256 fall into categories:

- **Database functions/RPCs** (~50): Not applicable for entity configs
- **Views** (~20): Some need read-only API routes (4 identified above)
- **System/internal tables** (~40): Auth, settings, audit logs — accessed via custom routes
- **Sub-entity/junction tables** (~80): Accessed via parent entity routes
- **Unused/future tables** (~66): Schema exists but no hooks or pages reference them yet

This is expected for a large schema. Not all tables need standalone CRUD routes.

---

## Appendix B: Complete Hooks File Inventory

| File                          | Lines | Pattern     | Barrel? | Consumers |
| ----------------------------- | ----- | ----------- | ------- | --------- |
| `hooks.ts`                    | 1,167 | API client  | Yes     | 59        |
| `hooks-pages.ts`              | 1,348 | API client  | Yes     | 143       |
| `hooks-extended.ts`           | 552   | API client  | No      | 3         |
| `hooks-productive.ts`         | 1,300 | getSupabase | No      | 5         |
| `hooks-v2-features.ts`        | 741   | fromTable   | Yes     | 11        |
| `hooks-advancing.ts`          | 648   | getSupabase | Yes     | 13        |
| `hooks-messaging.ts`          | 607   | getSupabase | Yes     | 8         |
| `hooks-feature-gaps.ts`       | 595   | fromTable   | No      | 13        |
| `hooks-credentialing.ts`      | 534   | getSupabase | Yes     | 5         |
| `hooks-sow.ts`                | 469   | getSupabase | No      | 0         |
| `hooks-workflows.ts`          | 456   | getSupabase | No      | 0         |
| `hooks-external-sync.ts`      | 344   | getSupabase | Yes     | 3         |
| `hooks-live-ops.ts`           | 271   | getSupabase | Yes     | 15        |
| `hooks-crm.ts`                | 242   | getSupabase | No      | 3         |
| `hooks-messaging-realtime.ts` | 238   | getSupabase | Yes     | 0         |
| `hooks-approval-engine.ts`    | 156   | fetch       | Yes     | 0         |
| `hooks-switcher.ts`           | 141   | getSupabase | Yes     | 4         |

**Total:** ~9,829 lines across 17 hooks files, serving ~285 page consumer imports.
