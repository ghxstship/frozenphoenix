# Advancing Module — Architecture & Lifecycle Guide

## Module Integration Map

The Advancing module is a full-stack vertical slice spanning 7 architectural layers. Every catalog item, advance order, and line item resolves to a single source of truth regardless of where it appears in the application.

### Layer 1: Database (Supabase PostgreSQL)

| Table                       | Migration    | Purpose                                                                                                  |
| --------------------------- | ------------ | -------------------------------------------------------------------------------------------------------- |
| `catalog_categories`        | 047          | 3-level taxonomy (collection → category → subcategory) with UNSPSC/NIGP/NAICS codes                      |
| `catalog_items`             | 047, 098     | 351 platform items with 5-layer normalization (SKU, display name, search aliases, specs, ops attributes) |
| `catalog_item_modifiers`    | 047          | Typed modifier groups per item (single_select, multi_select, quantity, text, boolean)                    |
| `catalog_modifier_options`  | 047          | Per-option price adjustments (flat, percentage, per_unit)                                                |
| `catalog_org_overrides`     | 047          | Per-org pricing, vendor preferences, and availability overrides                                          |
| `catalog_pricing_tiers`     | 098, 101-102 | Multi-tier (Basic/Standard/Premium) × multi-market pricing ranges                                        |
| `production_advances`       | 048          | Core advance orders with 8-stage lifecycle, auto-numbered (PA-YYYY-NNNN)                                 |
| `production_advance_items`  | 048, 065     | Line items with 9-stage lifecycle, vendor assignment, delivery tracking                                  |
| `advance_status_history`    | 048          | Immutable audit trail for advance and item status changes                                                |
| `advance_templates`         | 048          | Reusable advance templates with JSONB item arrays                                                        |
| `project_collaborators`     | 093          | External collaborator invitations with onboarding lifecycle                                              |
| `collaborator_requirements` | 093          | Polymorphic per-requirement tracking (COI, contract, crew roster, etc.)                                  |
| `portal_access_tokens`      | 093          | Scoped, time-limited tokens for external collaborator portal access                                      |

**Key relationships:**

- `production_advance_items.catalog_item_id` → `catalog_items.id` (RESTRICT — items cannot be deleted while referenced)
- `production_advance_items.advance_id` → `production_advances.id` (CASCADE)
- `production_advances.event_id` → `events.id` (RESTRICT — advance is bound to an event)
- `production_advances.project_id` → `projects.id` (SET NULL — optional project link)
- `catalog_items.category_id` → `catalog_categories.id` (RESTRICT)
- `catalog_categories.parent_id` → `catalog_categories.id` (CASCADE — self-referential hierarchy)

### Layer 2: TypeScript Types (`src/types/advancing.ts`)

All database enums are mirrored as TypeScript union types. All table rows have corresponding interfaces. Key types:

- **Enums:** `CatalogCategoryType` (11 values), `CatalogItemStatus`, `WeatherRating`, `PricingTier`, `AdvanceType`, `AdvanceStatus`, `AdvancePriority`, `AdvanceItemStatus`
- **Entities:** `CatalogCategory`, `CatalogItem`, `CatalogPricingTier`, `ProductionAdvance`, `ProductionAdvanceItem`, `AdvanceTemplate`
- **Join types:** `ProductionAdvanceWithJoins`, `ProductionAdvanceItemWithJoins`, `CatalogItemWithOverride`
- **Cart types:** `AdvanceCartItem`, `AdvanceCartState`, `CartItem`, `CartState`
- **API types:** `CreateAdvanceRequest`, `CreateAdvanceItemRequest`, `UpdateAdvanceRequest`
- **Filter types:** `AdvanceListFilters`, `CatalogSearchFilters`

### Layer 3: SSOT Config (`src/config/advancing-config.ts`)

All enums have declarative config arrays with labels, icons, badge variants, and descriptions:

- `ADVANCE_STATUSES` / `ADVANCE_STATUS_MAP` — 8 statuses
- `ADVANCE_STATUS_TRANSITIONS` — declarative state machine (which transitions are legal)
- `ADVANCE_ITEM_STATUSES` / `ADVANCE_ITEM_STATUS_MAP` — 9 statuses
- `ADVANCE_ITEM_STATUS_TRANSITIONS` — declarative item state machine
- `ADVANCE_TYPES` / `ADVANCE_TYPE_MAP` — 5 types (pre_event, load_in, show_day, strike, post_event)
- `ADVANCE_PRIORITIES` / `ADVANCE_PRIORITY_MAP` — 5 priorities
- `CATALOG_CATEGORY_TYPES` / `CATALOG_CATEGORY_TYPE_MAP` — 11 collection types
- `CATALOG_ITEM_STATUSES` / `CATALOG_ITEM_STATUS_MAP` — 5 statuses
- `WEATHER_RATINGS` / `WEATHER_RATING_MAP` — 5 ratings
- `PRICING_TIERS` / `PRICING_TIER_MAP` — 3 tiers (Basic/Standard/Premium)
- `CURRENCY_MULTIPLIERS` — 8 markets (USD, GBP, EUR, AED, AUD, CAD, MXN, BRL)

### Layer 4: Validation (`src/lib/validation/advancing-schemas.ts`)

All API inputs are validated with Zod schemas:

- `createAdvanceSchema` — event_id (required UUID), title, advance_type, priority, dates, items array
- `createAdvanceItemSchema` — catalog_item_id (required UUID), quantity (≥1), unit_cost (≥0), modifiers, delivery info
- `updateAdvanceSchema` / `updateAdvanceItemSchema` — partial updates
- `advanceStatusTransitionSchema` / `advanceItemStatusTransitionSchema` — status + optional reason
- `createAdvanceTemplateSchema` — name, items (≥1), type, tags
- `catalogSearchSchema` — query (≥2 chars), limit (1-100)

### Layer 5: API Routes (`src/app/api/advancing/`)

| Route                                       | Method           | Purpose                                      |
| ------------------------------------------- | ---------------- | -------------------------------------------- |
| `/api/advancing`                            | GET              | List advances (filtered, paginated, sorted)  |
| `/api/advancing`                            | POST             | Create new advance with items                |
| `/api/advancing/[id]`                       | GET/PATCH/DELETE | Single advance CRUD                          |
| `/api/advancing/[id]/submit`                | POST             | draft → submitted transition                 |
| `/api/advancing/[id]/approve`               | POST             | submitted/in_review → approved               |
| `/api/advancing/[id]/reject`                | POST             | in_review → submitted (with required reason) |
| `/api/advancing/[id]/cancel`                | POST             | any non-terminal → cancelled                 |
| `/api/advancing/[id]/items`                 | GET/POST         | List/add items to advance                    |
| `/api/advancing/[id]/items/[itemId]`        | PATCH/DELETE     | Update/remove individual item                |
| `/api/advancing/[id]/items/[itemId]/status` | POST             | Item status transition                       |
| `/api/advancing/catalog/search`             | GET              | Full-text catalog search                     |
| `/api/advancing/templates`                  | GET/POST         | List/create advance templates                |

All routes use `withApiHandler` / `withApiHandlerParams` with RBAC enforcement (`resource: "advancing"`).

### Layer 6: React Hooks (`src/lib/supabase/hooks-advancing.ts`)

**Catalog:** `useCatalogCategories`, `useCatalogCategory`, `useCatalogItems`, `useCatalogItemSearch`, `useCatalogItem`, `useCatalogItemModifiers`, `useCatalogOrgOverrides`, `useCatalogOrgOverride`, `useCatalogPricingTiers`, `useCatalogPricingTiersBatch`

**Advances:** `useAdvances`, `useAdvance`, `useCreateAdvance`, `useUpdateAdvance`, `useDeleteAdvance`, `useAdvanceStatusTransition`

**Items:** `useAdvanceItems`, `useCreateAdvanceItem`, `useUpdateAdvanceItem`, `useDeleteAdvanceItem`, `useAdvanceItemStatusTransition`

**History:** `useAdvanceStatusHistory`

**Templates:** `useAdvanceTemplates`, `useAdvanceTemplate`, `useCreateAdvanceTemplate`, `useUpdateAdvanceTemplate`, `useDeleteAdvanceTemplate`

**Cart (Zustand):** `useAdvanceCart` — persisted client-side store with add/remove/update/computeTotals

**Realtime:** `useAdvancesRealtime`, `useAdvanceStatusHistoryRealtime`, `useCatalogRealtime`

### Layer 7: UI Pages & Components

**Pages:**

- `/advancing` — List page (ListPageShell) showing all advances
- `/advancing/new` — Create flow: CatalogBrowser → Cart → Checkout → Submit
- `/advancing/[id]` — Detail page (DetailPageShell) with items, timeline, actions, sidebar
- `/advancing/catalog` — Catalog admin: browse categories, search, add items
- `/advancing/templates` — Template management

**Components (`src/components/advancing/`):**

- `AdvanceStatusBadge`, `AdvanceItemStatusBadge`, `AdvancePriorityBadge`, `AdvanceTypeBadge`, `CategoryTypeBadge`
- `AdvanceApprovalPanel` — Approval workflow UI
- `AdvanceCart`, `CartToggle` — Shopping cart drawer
- `AdvanceCheckout` — Review + submit flow
- `AdvanceItemRow` — Line item display
- `AdvanceTemplatePicker` — Template selection
- `AdvanceTimeline` — Activity timeline
- `CatalogBrowser` — Hierarchical category browser with search + filters
- `CatalogItemCard` — Item card with add-to-cart
- `CatalogItemDetail` — Full item detail modal

---

## Complete User Journey

### Phase 1: Project Creation

1. PM navigates to `/projects/new`
2. Creates project with event association, dates, budget
3. System auto-generates communication templates for the project (migration 093 `project_comm_templates`)

### Phase 2: Collaborator Invitation

1. PM opens project detail → Collaborators tab
2. Invites external vendors/subcontractors via `/api/projects/[id]/collaborators`
3. System creates `project_collaborators` row + `portal_access_token` + requirement rows
4. Collaborator receives email with portal link (`/portal/[token]`)
5. Requirements tracked: COI upload, contract signing, crew roster submission, advance manifest

### Phase 3: Advance Creation (Production Advance)

1. PM or designated user navigates to `/advancing/new`
2. **Browse Catalog:** 3-level hierarchy (Site → Site Assets & Infrastructure → Fencing & Barriers)
   - Full-text search across 351 items (name, common_name, search_aliases, SKU)
   - Filter by category type, status, tags, cost range
3. **Add to Cart:** Click "Add" on catalog items → Zustand `useAdvanceCart` store
   - Set quantity, notes, delivery zone, operational purpose
   - Select modifiers (color, size, configuration)
   - Mark critical path items
4. **Checkout:** Review cart → set advance metadata
   - Title, description, advance type (pre_event/load_in/show_day/strike/post_event)
   - Priority (low → critical), service dates, internal/client notes
   - Link to event (required) and project (optional)
5. **Submit:** POST `/api/advancing` creates `production_advances` + `production_advance_items`
   - Advance auto-numbered (PA-2026-0001)
   - Status starts as `draft`
   - Trigger `sync_advance_totals()` computes total_estimated_cost and total_items

### Phase 4: Advance Creation (Crew Roster)

Same flow as production advance but selecting from Labor collection:

- Leadership → Production Management, Department Heads
- Heavy Equipment Operators → Certified Operators
- Skilled Labor → Technical Crew, Creative & Specialty
- General Labor → Stagehands, Event Staff, Specialty Staff

Each labor item has per-shift/per-day pricing and operational purpose (e.g., "Main stage FOH mix").

### Phase 5: Submission & Review

1. PM clicks "Submit" on advance detail page → POST `/api/advancing/[id]/submit`
   - Validates: status must be `draft`, must have ≥1 item
   - Transitions: `draft` → `submitted`
   - Trigger logs status change to `advance_status_history`
2. Director/Exec sees advance in list filtered by `status=submitted`
3. Reviews items, costs, critical path items, delivery schedule
4. **Approve:** POST `/api/advancing/[id]/approve`
   - Transitions: `submitted`/`in_review` → `approved`
   - Sets `approved_by` and `approved_at`
5. **Reject:** POST `/api/advancing/[id]/reject`
   - Requires reason (Zod validation)
   - Transitions: `in_review` → `submitted` (returns for revision, does NOT cancel)
   - Logs rejection reason in `advance_status_history`

### Phase 6: Fulfillment & Asset/Crew Assignment

1. After approval: advance transitions `approved` → `in_progress`
2. Each line item follows its own 9-stage lifecycle:
   - `pending` → Awaiting vendor confirmation
   - `confirmed` → Vendor confirmed, quantity_confirmed set
   - `in_transit` → Equipment shipped / crew travel booked
   - `delivered` → On-site, not yet installed
   - `installed` → Set up at designated location
   - `operational` → Active and in use during show
   - `struck` → Torn down post-show
   - `returned` → Back to vendor/warehouse
   - `complete` → Line item closed out
3. Items can be assigned to specific crew members (`assigned_to` → user_profiles)
4. Items can be assigned to vendors (`vendor_id` → vendors)
5. Items track delivery zone, location, scheduled/actual delivery times
6. Critical path items flagged with `is_critical_path`
7. Realtime subscriptions (`useAdvancesRealtime`) push status changes to all connected clients

### Phase 7: Reconciliation & Completion

1. When all items reach `complete` or `returned` status:
   - Advance transitions `in_progress` → `fulfilled`
2. Financial reconciliation:
   - `total_estimated_cost` vs `total_actual_cost` (computed by `sync_advance_totals()` trigger)
   - `quantity_requested` vs `quantity_confirmed` per item
3. Final sign-off: advance transitions `fulfilled` → `completed`
   - Sets `completed_at` timestamp
   - Terminal state — no further transitions allowed
4. Full audit trail in `advance_status_history` for every status change on both advances and items

---

## State Machine Reference

### Advance Lifecycle (8 states)

```
draft → submitted → in_review → approved → in_progress → fulfilled → completed
  ↓        ↓           ↓↑           ↓            ↓
cancelled cancelled  cancelled   cancelled    cancelled
                    (rejected→submitted)
```

### Advance Item Lifecycle (9 states)

```
pending → confirmed → in_transit → delivered → installed → operational → struck → returned → complete
  ↓          ↓↓                        ↓↓
complete   complete                  complete
         (skip transit)           (skip install)
```

---

## SSOT Integration Points

Every entity in the advancing module routes to a single canonical source:

| Data                 | SSOT Location                                                     | Consumers                                              |
| -------------------- | ----------------------------------------------------------------- | ------------------------------------------------------ |
| Category hierarchy   | `catalog_categories` table (depth 0/1/2)                          | CatalogBrowser, catalog admin, advance creation        |
| Item specifications  | `catalog_items` table (17 operational fields)                     | CatalogItemCard, CatalogItemDetail, advance items      |
| Pricing              | `catalog_pricing_tiers` table (3 tiers × N currencies)            | Cart totals, advance cost estimation, org overrides    |
| Status labels/icons  | `advancing-config.ts` SSOT maps                                   | All badge components, detail pages, list pages         |
| Transition rules     | `advancing-config.ts` ADVANCE_STATUS_TRANSITIONS                  | Detail page actions, API route validation, DB triggers |
| Validation           | `advancing-schemas.ts` Zod schemas                                | API routes (server), form validation (client)          |
| Weather/compliance   | `catalog_items.weather`, `compliance_tags`, `sustainability_tags` | Item cards, detail views, operational planning         |
| Classification codes | `catalog_categories.unspsc_code/nigp_code/naics_code`             | Procurement, reporting, compliance                     |

---

## Test Coverage

**119 tests across 13 phases** in `src/__tests__/lib/advancing-lifecycle.test.ts`:

1. Create Advance Validation (12 tests)
2. Advance Item Validation (9 tests)
3. Update Advance Validation (4 tests)
4. Update Advance Item Validation (3 tests)
5. Status Transition Validation (5 tests)
6. Advance Template Validation (4 tests)
7. Catalog Search Validation (4 tests)
8. Advance State Machine (15 tests)
9. Advance Item State Machine (12 tests)
10. SSOT Config Integrity (17 tests)
11. Formatting Helpers (4 tests)
12. End-to-End Lifecycle Scenarios (29 tests)
13. Exhaustive Transition Matrix (3 tests)
