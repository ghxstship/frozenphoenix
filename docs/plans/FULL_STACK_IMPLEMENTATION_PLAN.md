# FrozenPhoenix — Full-Stack Implementation Plan

> Comprehensive, dependency-ordered plan to implement all 164 workflows across 16 workstreams.
>
> **Principle:** Organic growth — each phase builds on the previous, no forward references, no rework.
>
> **Reference:** `docs/WORKSTREAM_WORKFLOW_INVENTORY.md` for workflow catalog.

---

## Table of Contents

1. [Architecture & Conventions](#1-architecture--conventions)
2. [Dependency Graph](#2-dependency-graph)
3. [Current State Baseline](#3-current-state-baseline)
4. [Phase 0 — Foundation Hardening](#phase-0--foundation-hardening-weeks-12)
5. [Phase 1 — Core Platform Backbone](#phase-1--core-platform-backbone-weeks-36)
6. [Phase 2 — Production & Operations](#phase-2--production--operations-weeks-710)
7. [Phase 3 — Financial Engine](#phase-3--financial-engine-weeks-1113)
8. [Phase 4 — People, Vendors & Assets](#phase-4--people-vendors--assets-weeks-1417)
9. [Phase 5 — Communications & Collaboration](#phase-5--communications--collaboration-weeks-1820)
10. [Phase 6 — Live Operations](#phase-6--live-operations-weeks-2124)
11. [Phase 7 — Creative, Legal & Compliance](#phase-7--creative-legal--compliance-weeks-2527)
12. [Phase 8 — Integrations & Automation](#phase-8--integrations--automation-weeks-2830)
13. [Phase 9 — Intelligence & Polish](#phase-9--intelligence--polish-weeks-3134)
14. [Verification Matrix](#verification-matrix)
15. [Risk Register](#risk-register)

---

## 1. Architecture & Conventions

### Full-Stack Column Per Workflow

Every workflow implementation follows the same vertical slice pattern:

```
┌─────────────────────────────────────────────────┐
│ 1. DB Migration (if schema gaps exist)          │
│ 2. TypeScript Types (src/types/*.ts)            │
│ 3. Supabase Hooks (src/lib/supabase/hooks-*.ts) │
│ 4. API Routes (src/app/api/**/route.ts)         │
│ 5. UI Components (src/components/**)            │
│ 6. Page Wiring (src/app/(dashboard)/**/page.tsx) │
│ 7. i18n Strings (src/lib/i18n/*-strings.ts)    │
│ 8. RBAC Grants (src/config/rbac.ts)             │
│ 9. Navigation Registration (navigation.ts)      │
│ 10. Tests (src/__tests__/**)                    │
└─────────────────────────────────────────────────┘
```

### Conventions

| Convention         | Rule                                                                                                                                                                   |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **State machines** | All lifecycle status transitions enforced via DB CHECK constraints + API-side validation. No direct client-side status writes.                                         |
| **Mutations**      | All writes go through API routes (not direct Supabase client mutations from pages). API routes validate RBAC, business rules, then write.                              |
| **Hooks**          | Read-only hooks per domain in `hooks-{domain}.ts`. Use `useQuery` with stale-while-revalidate. Mutations via `useMutation` + `use-mutation-with-toast.ts`.             |
| **Types**          | One type file per domain in `src/types/`. Re-export through `src/types/index.ts`. Match DB column names (snake_case), map to camelCase only at the component boundary. |
| **Components**     | Shared components in `src/components/{domain}/`. Page-specific UI stays in the page file. Atomic design: primitives → components → patterns.                           |
| **i18n**           | All user-facing strings in `src/lib/i18n/{domain}-strings.ts`. No hardcoded strings in components.                                                                     |
| **RBAC**           | Every API route checks permissions via `hasPermission(role, resource, action)`. New resources added to `PERMISSION_MATRIX` in `src/config/rbac.ts`.                    |
| **Tests**          | Unit tests for API route handlers + hook integration tests. E2E for critical workflow paths. Minimum: 1 test per state transition.                                     |
| **Quality gate**   | Every phase ends with `npm run type-check && npm run lint && npm run test && npm run build` passing.                                                                   |

### Shared Infrastructure (Already Exists)

| Layer                                | Status | Files                                             |
| ------------------------------------ | ------ | ------------------------------------------------- |
| Supabase client (browser + server)   | ✅     | `client.ts`, `server.ts`, `middleware.ts`         |
| Auth context + multi-org             | ✅     | `auth-context.tsx`, `use-org.ts`                  |
| Mutation utilities                   | ✅     | `mutation-utils.ts`, `use-mutation-with-toast.ts` |
| Pagination                           | ✅     | `pagination.ts`                                   |
| Realtime subscriptions               | ✅     | `realtime.ts`, `realtime-advancing.ts`            |
| RBAC matrix (6-tier)                 | ✅     | `src/config/rbac.ts`                              |
| Navigation + command bar             | ✅     | `navigation.ts`, `command-bar.tsx`                |
| Design tokens + UI primitives        | ✅     | `design-tokens.ts`, `src/components/ui/`          |
| DataTable + PageShell + DetailLayout | ✅     | `data-view/`, `layouts/`                          |
| Feature flags                        | ✅     | DB `027`, `src/config/feature-flags.ts`           |
| Quality gate CI                      | ✅     | `.github/workflows/quality-gate.yml`              |

---

## 2. Dependency Graph

```
Phase 0: Foundation Hardening
    ├── Supabase type generation (database.types.ts)
    ├── Generic CRUD API factory
    ├── State machine transition engine
    └── Form builder infrastructure
         │
Phase 1: Core Platform Backbone (WS-13, WS-14, WS-03, WS-16)
    ├── Auth, Identity & Onboarding ──────────────────────┐
    ├── Settings, RBAC & Admin                             │
    ├── Approval & Governance Engine                       │ Everything
    └── Quality & Deployment                               │ depends on
         │                                                 │ these
Phase 2: Production & Operations (WS-02)                   │
    ├── Project lifecycle ◄────────────────────────────────┘
    ├── Task lifecycle
    ├── SOW lifecycle
    ├── Scheduling & resource booking
    ├── Work packages, BOMs, QC gates
    └── Production runs
         │
Phase 3: Financial Engine (WS-01, WS-04)
    ├── Sales & CRM ◄──── needs Projects, Contacts
    ├── Invoicing ◄──── needs Projects, Vendors
    ├── Budgets & expense tracking ◄──── needs Projects
    ├── Revenue recognition ◄──── needs SOWs, Invoices
    └── Profitability views
         │
Phase 4: People, Vendors & Assets (WS-05, WS-06, WS-07)
    ├── Crew & workforce ◄──── needs Projects, Scheduling
    ├── Vendor lifecycle ◄──── needs Projects, Contracts
    ├── Asset management ◄──── needs Projects, Locations
    └── Logistics & shipments ◄──── needs Locations, Assets
         │
Phase 5: Communications (WS-08)
    ├── Messaging channels ◄──── needs Users, Projects, Events
    ├── Escalation engine ◄──── needs Messaging, RBAC
    └── Entity notifications ◄──── needs all entity types
         │
Phase 6: Live Operations (WS-09)
    ├── Live event instances ◄──── needs Events, Locations, Crew
    ├── Command hierarchy ◄──── needs Crew, RBAC
    ├── Run of Show ◄──── needs Events, Messaging (cue-to-channel)
    ├── Readiness gates ◄──── needs Departments, QC gates
    ├── FOH & credentials ◄──── needs Credentialing, Locations
    └── Strike & reconciliation ◄──── needs Assets, Shipments
         │
Phase 7: Creative, Legal & Compliance (WS-11, WS-12)
    ├── Document lifecycle ◄──── needs Projects, Approvals
    ├── Creative briefs & campaigns ◄──── needs Projects, Assets
    ├── Contract lifecycle ◄──── needs Vendors, Projects
    └── Compliance & incidents ◄──── needs Vendors, Crew, Events
         │
Phase 8: Integrations & Automation (WS-10, WS-15)
    ├── Integration framework ◄──── needs all entity types
    ├── Webhook handlers ◄──── needs Credentialing, POS
    ├── Automation engine ◄──── needs all entity types + Events
    └── Sync outbound ◄──── needs Integration framework
         │
Phase 9: Intelligence & Polish
    ├── AI summaries & scoring ◄──── needs Messaging, CRM
    ├── Analytics dashboards ◄──── needs all data
    ├── Reporting engine ◄──── needs all data
    └── Performance optimization ◄──── needs everything
```

---

## 3. Current State Baseline

### What Already Works (70 EXISTING workflows)

| Domain                                       | Hooks File                    | Hook Count | API Routes | UI Pages        | Notes                                                         |
| -------------------------------------------- | ----------------------------- | ---------- | ---------- | --------------- | ------------------------------------------------------------- |
| Core (orgs, profiles, projects, tasks, etc.) | `hooks.ts`                    | 84         | —          | ~40 list+detail | Most wired via hooks, some still use `as typeof MOCK_X` casts |
| Pages (single-record)                        | `hooks-pages.ts`              | 147        | —          | 18 detail pages | Cross-entity lookups migrated                                 |
| Production                                   | `hooks-productive.ts`         | 63         | —          | ~20             | Time entries, expenses, budgets                               |
| Extended (assets, shipments, locations)      | `hooks-extended.ts`           | 51         | —          | ~15             | Asset assignment, shipment tracking                           |
| V2 features (live ops, workforce)            | `hooks-v2-features.ts`        | 36         | —          | ~12             | Partial live-ops tables                                       |
| Advancing                                    | `hooks-advancing.ts`          | 25         | 11 routes  | 8 pages         | Most complete workstream                                      |
| Workflows (approvals)                        | `hooks-workflows.ts`          | 23         | —          | 2               | Engine exists, no per-entity wiring                           |
| SOW                                          | `hooks-sow.ts`                | 22         | —          | 2               | CRUD only                                                     |
| Feature gaps                                 | `hooks-feature-gaps.ts`       | 21         | —          | —               | Profitability/utilization views                               |
| Credentialing                                | `hooks-credentialing.ts`      | 20         | 4 routes   | 2               | Scan, assign, bulk-import                                     |
| Messaging                                    | `hooks-messaging.ts`          | 19         | 12 routes  | 14 components   | Full messaging stack                                          |
| External sync                                | `hooks-external-sync.ts`      | 13         | 2 routes   | —               | Provider connections                                          |
| CRM                                          | `hooks-crm.ts`                | 12         | —          | ~8              | Pipeline, opportunities                                       |
| Messaging realtime                           | `hooks-messaging-realtime.ts` | 4          | —          | —               | Presence, typing                                              |

**Total: ~540 hooks, 48 API routes, ~120 page files, 23 type files**

### What's Missing (94 IMPLIED + RECOMMENDED workflows)

1. **No generic CRUD API** — Each entity needs hand-written API routes for create/update/delete
2. **No state machine enforcement** — Status transitions are CHECK constraints only, no server-side transition validation
3. **~33 files still import demo-data** — Mock type casts remain on 13 list pages
4. **~5 mock-only pages** — surveys, quality-checks, procurement, org-chart, decks
5. **No mutation hooks** — Read hooks exist, no `useCreate*`/`useUpdate*`/`useDelete*` patterns standardized
6. **No form schemas** — No Zod validation schemas for entity creation/editing
7. **No server-side business rules** — Approval engine exists in DB but no API routes to drive it
8. **Edge Functions not orchestrated** — 10 EFs exist but no UI to configure/monitor them

---

## Phase 0 — Foundation Hardening (Weeks 1–2)

> **Goal:** Eliminate technical debt and build shared infrastructure that all subsequent phases depend on.

### P0.1 — Regenerate Supabase Types

| Deliverable      | Details                                                                                                                    |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Action**       | Run `npx supabase gen types typescript --local > src/lib/supabase/database.types.ts` after all 53 migrations apply cleanly |
| **Outcome**      | Accurate TypeScript types for all 100+ tables, 60+ enums                                                                   |
| **Unblocks**     | Remove all `as typeof MOCK_X` casts, enable type-safe hooks                                                                |
| **Verification** | `npm run type-check` passes with 0 errors after type replacement                                                           |

### P0.2 — Generic CRUD API Factory

| Deliverable | Details                                                                                                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **File**    | `src/lib/api/crud-factory.ts`                                                                                                                                                              |
| **Spec**    | Factory function that generates type-safe API route handlers for any Supabase table: `createCrudRoutes<T>({ table, orgScoped, rbacResource, selectColumns, allowedFilters, defaultSort })` |
| **Returns** | `{ GET, POST, PUT, PATCH, DELETE }` handlers with built-in: auth check, org scoping, RBAC permission check, pagination, filtering, sorting, field-level RBAC masking                       |
| **Pattern** | ```typescript                                                                                                                                                                              |

// src/app/api/contracts/route.ts
import { createCrudRoutes } from "@/lib/api/crud-factory";
export const { GET, POST } = createCrudRoutes({
table: "contracts",
rbacResource: "contracts",
orgScoped: true,
selectColumns: "\*",
defaultSort: { column: "created_at", ascending: false },
});

````|
| **Verification** | Unit tests for factory with mock Supabase client. 5 entity routes converted as proof. |

### P0.3 — State Machine Transition Engine

| Deliverable | Details |
|------------|---------|
| **File** | `src/lib/state-machine.ts` |
| **Spec** | Declarative state machine definitions per entity type: allowed transitions, guard conditions, side effects (e.g., "notify on status change"), required fields per state. |
| **Shape** | ```typescript
const CONTRACT_MACHINE = defineStateMachine({
  states: ["draft", "pending_review", "pending_signature", "active", "expired", "terminated"],
  transitions: [
    { from: "draft", to: "pending_review", guard: "hasRequiredFields", roles: ["pm", "director", "exec"] },
    { from: "pending_review", to: "pending_signature", guard: "hasApproval", roles: ["director", "exec"] },
    // ...
  ],
  sideEffects: {
    "active": ["notifyStakeholders", "updateProjectPhase"],
  }
});
``` |
| **Integration** | CRUD factory calls `validateTransition(machine, currentState, nextState, userRole)` on any status field update |
| **Verification** | Unit tests for every defined machine covering valid/invalid transitions |

### P0.4 — Mutation Hook Factory

| Deliverable | Details |
|------------|---------|
| **File** | `src/lib/supabase/mutation-factory.ts` |
| **Spec** | Factory that generates `useCreate*`, `useUpdate*`, `useDelete*` hooks for any entity. Uses `useMutation` + `use-mutation-with-toast.ts`. Auto-invalidates related queries. |
| **Pattern** | ```typescript
export const { useCreateContract, useUpdateContract, useDeleteContract } =
  createMutationHooks({ table: "contracts", apiPath: "/api/contracts", queryKey: "contracts" });
``` |
| **Verification** | Integration test with mock API |

### P0.5 — Form Schema Infrastructure

| Deliverable | Details |
|------------|---------|
| **File** | `src/lib/schemas/{domain}.ts` per domain |
| **Spec** | Zod schemas for create/update forms per entity. Shared field validators (email, phone, currency, date range). Schema derives from DB types. |
| **Integration** | `react-hook-form` + `@hookform/resolvers` (both already installed) |
| **Pattern** | ```typescript
export const contractCreateSchema = z.object({
  title: z.string().min(1).max(255),
  contract_type: z.enum(["vendor", "client", "venue", ...]),
  status: z.literal("draft"), // Always starts as draft
  start_date: z.coerce.date(),
  // ...
});
``` |
| **Verification** | Schema unit tests per domain |

### P0.6 — CreateEntityDialog Generalization

| Deliverable | Details |
|------------|---------|
| **File** | Enhance existing `src/components/create-entity-dialog.tsx` |
| **Spec** | Generic dialog driven by config: schema, fields, defaults, mutation hook. Support for multi-step forms, conditional fields, file uploads. Already has basic structure — needs Zod + mutation wiring. |
| **Verification** | Manual test: create a contract via the dialog, verify DB insert |

### P0.7 — Remove Demo-Data Dependencies

| Deliverable | Details |
|------------|---------|
| **Action** | With regenerated types, replace all `as typeof MOCK_X` casts with proper Supabase return types. Remove demo-data imports from all 33 files. |
| **Outcome** | `src/lib/demo-data.ts` is only used for seed scripts, never imported by pages |
| **Verification** | `grep -r "demo-data" src/app src/components` returns 0 matches |

### Phase 0 Acceptance Criteria

- [ ] `database.types.ts` regenerated from all 53 migrations
- [ ] CRUD factory tested with 5 entity routes
- [ ] State machine definitions for top-10 entities
- [ ] Mutation hooks factory generates correct hooks
- [ ] Zod schemas for top-10 entities
- [ ] CreateEntityDialog wired to real mutations
- [ ] 0 demo-data imports in `src/app/` or `src/components/`
- [ ] `npm run type-check && npm run lint && npm run test && npm run build` passes

---

## Phase 1 — Core Platform Backbone (Weeks 3–6)

> **Workstreams:** WS-13 (Auth), WS-14 (Settings/RBAC/Admin), WS-03 (Approvals), WS-16 (Quality)
>
> **Goal:** Solidify the foundation that every other workstream depends on: authentication, authorization, settings, approvals, and deployment quality.

### P1.1 — Auth, Identity & Onboarding (WS-13)

Already ~70% implemented. Remaining work:

| Workflow | Work Required | Effort |
|---------|--------------|--------|
| 13.08 **API Token Management** | API route for CRUD of `api_tokens` table. UI in settings/security: list tokens, create (show once), revoke. Expiration monitoring. | M |
| 13.09 **Access Grant Lifecycle** | API route for `access_grants`. UI for temporary access sharing: select entity → set duration → generate link/grant. Auto-expire via DB function. | M |
| 13.10 **Session Management & Audit** | UI: list active sessions with device/IP/location. Revoke button. Login event history table. Link to existing `auth/log-event` API. | S |

**New files:**
- `src/app/api/auth/tokens/route.ts` — CRUD for API tokens
- `src/app/api/auth/tokens/[id]/revoke/route.ts` — Revoke endpoint
- `src/app/api/auth/access-grants/route.ts` — CRUD for access grants
- `src/app/api/auth/sessions/route.ts` — List/revoke sessions
- `src/lib/schemas/auth.ts` — Zod schemas for token/grant creation
- `src/lib/i18n/auth-strings.ts` — Extend existing

### P1.2 — Settings, RBAC & Admin (WS-14)

| Workflow | Work Required | Effort |
|---------|--------------|--------|
| 14.06 **Settings Inheritance Chain** | API route that resolves effective setting value by walking scope hierarchy: user → team → activation → project → dept → brand → org → env → platform. Cache with `stale-while-revalidate`. | L |
| 14.07 **Custom Role Creation** | API route for `role_definitions` + `permission_grants` CRUD. UI: role builder with permission checkboxes per resource × action matrix. Validate no privilege escalation. | L |
| 14.08 **Access Review Campaigns** | API: create campaign → generate review tasks per user → reviewer marks retain/revoke → bulk apply. UI: campaign dashboard + review form. | M |
| 14.09 **Data Export Workflow** | API: accept entity type + filters + format (CSV/JSON/XLSX) → stream response with field-level RBAC masking. UI: export wizard dialog. | M |
| 14.10 **System Health Monitoring** | API: aggregate health from DB connection, Edge Function invocation logs, API latency. UI: dashboard with status indicators + sparklines. | M |

**New files:**
- `src/app/api/settings/resolve/route.ts` — Hierarchical resolution
- `src/app/api/roles/route.ts` — Custom role CRUD
- `src/app/api/roles/[id]/permissions/route.ts` — Permission grants
- `src/app/api/access-reviews/route.ts` — Campaign CRUD
- `src/app/api/access-reviews/[id]/tasks/route.ts` — Review task management
- `src/app/api/export/route.ts` — Generic entity export
- `src/app/api/health/detailed/route.ts` — Detailed health check
- `src/lib/schemas/admin.ts` — Zod schemas
- `src/types/admin.ts` — Admin-specific types
- `src/lib/supabase/hooks-admin.ts` — Admin hooks

### P1.3 — Approval & Governance Engine (WS-03)

The approval workflow engine (DB `006`) exists but has no runtime driver. This is **critical infrastructure** — half the other workstreams need it.

| Workflow | Work Required | Effort |
|---------|--------------|--------|
| 03.01 **Generic Approval Engine API** | Full API surface: create instance → advance step → approve/reject/delegate/escalate → complete. Supports any entity type. Cron job for auto-escalation (48h/72h). | XL |
| 03.05 **Expense Approval** | Wire expense form submit → create workflow instance → approve/reject via engine | M |
| 03.06 **Payroll Approval** | Wire payroll batch submit → workflow instance → multi-step approval | M |
| 03.07 **E-Signature Workflow** | `signature_status` enum exists. Add `document_signatures` table, embed signing UI (or integrate DocuSign/HelloSign API stub). | L |
| 03.08 **Multi-Entity Approval Orchestration** | Chain approval engine: SOW approval triggers budget approval triggers contract approval. Orchestration config per entity. | L |

**New files:**
- `src/app/api/approvals/route.ts` — List pending approvals for current user
- `src/app/api/approvals/[id]/route.ts` — Get instance details
- `src/app/api/approvals/[id]/decide/route.ts` — Approve/reject/delegate/escalate
- `src/app/api/approvals/[id]/cancel/route.ts` — Cancel workflow instance
- `src/app/api/approvals/engine/route.ts` — Create workflow instance for entity
- `src/lib/approval-engine.ts` — Server-side orchestration logic
- `src/lib/schemas/approvals.ts` — Zod schemas
- `src/components/approvals/approval-action-bar.tsx` — Reusable approve/reject UI
- `src/components/approvals/approval-timeline.tsx` — Step visualization
- `src/components/approvals/approval-badge.tsx` — Status badge
- `src/lib/i18n/approval-strings.ts` — i18n

### P1.4 — Quality & Deployment (WS-16)

| Workflow | Work Required | Effort |
|---------|--------------|--------|
| 16.03 **Human Attestation UI** | Dashboard page for QA leads to view criteria requiring attestation, submit attestation with evidence. | S |
| 16.04 **Criteria Registry Expansion** | Add validation criteria for each phase's deliverables as they're built. Ongoing — add criteria during each phase. | Ongoing |

### Phase 1 Acceptance Criteria

- [ ] Approval engine API: create instance, advance, decide — tested end-to-end with advancing workflow
- [ ] Settings hierarchical resolution returns correct effective value
- [ ] Custom role creation prevents privilege escalation
- [ ] API token create/revoke works from settings/security UI
- [ ] Data export streams CSV for projects, tasks, contracts
- [ ] All new API routes have RBAC checks
- [ ] `npm run type-check && npm run lint && npm run test && npm run build` passes

---

## Phase 2 — Production & Operations (Weeks 7–10)

> **Workstream:** WS-02 (Production Lifecycle)
>
> **Goal:** Full lifecycle management for the core production domain — projects, tasks, SOWs, scheduling, work packages, BOMs, QC gates.

### P2.1 — Project Lifecycle (02.01, 02.02)

| Deliverable | Details |
|------------|---------|
| **State machine** | Define `PROJECT_MACHINE` with all 12 phase transitions + 8 status transitions. Guards: `hasApprovedBudget`, `hasAssignedPM`, `hasSOW`. |
| **API routes** | `/api/projects/route.ts` (CRUD factory), `/api/projects/[id]/transition/route.ts` (phase/status change with machine validation) |
| **UI** | Wire existing projects list + detail pages to real mutations. Add phase stepper component. Add project creation form with Zod schema. |
| **Side effects** | Phase change → notification to project members, update linked tasks' phase |

### P2.2 — Task Lifecycle (02.03)

| Deliverable | Details |
|------------|---------|
| **State machine** | `TASK_MACHINE`: backlog→todo→in_progress→review→completed, with blocked/cancelled branches. Guards: `hasAssignee` for in_progress. |
| **API routes** | CRUD factory + `/api/tasks/[id]/transition/route.ts` + `/api/tasks/[id]/assign/route.ts` |
| **UI** | Wire existing task pages. Add drag-drop Kanban board (dnd-kit already installed). Bulk status updates. Task creation inline and dialog. |
| **Sub-tasks** | Support `parent_id` self-referencing hierarchy. Tree view in detail page. |

### P2.3 — SOW Lifecycle (02.06, 02.07)

| Deliverable | Details |
|------------|---------|
| **State machine** | `SOW_MACHINE`: draft→pending_review→pending_approval→approved→active→completed, with hold/cancel/amend branches. Approval transition triggers approval engine (P1.3). |
| **API routes** | CRUD + transition + `/api/sow/[id]/deliverables/route.ts` (deliverable CRUD) + `/api/sow/[id]/amend/route.ts` (create amendment version) |
| **UI** | SOW list + detail + create form. Deliverable tracking table within SOW detail. Amendment workflow. |
| **Proposal→SOW link** | UI button on proposal detail: "Generate SOW" → pre-fills from proposal data |

### P2.4 — Milestone & Deliverable Tracking (02.08)

| Deliverable | Details |
|------------|---------|
| **State machine** | `MILESTONE_MACHINE`: pending→in_progress→pending_approval→approved→rejected→overdue. Approval triggers approval engine. |
| **API** | CRUD + transition. Auto-overdue via cron (compare `due_date` with NOW). |
| **UI** | Milestones table in project detail. Gantt-style timeline view (Recharts-based). |

### P2.5 — Scheduling & Resource Booking (02.15)

| Deliverable | Details |
|------------|---------|
| **API** | `/api/bookings/route.ts` — CRUD with conflict detection (overlapping date ranges for same resource). `/api/bookings/conflicts/route.ts` — Check conflicts before commit. |
| **UI** | Calendar view (enhance existing calendar page). Resource planner grid: rows = crew/assets, columns = dates, cells = bookings with drag-resize. |
| **Conflict resolution** | On conflict detected: show dialog with options (bump, split, force). |

### P2.6 — Work Packages, BOMs & QC Gates (02.09–02.12)

| Deliverable | Details |
|------------|---------|
| **State machines** | `WORK_PACKAGE_MACHINE`, `PRODUCTION_RUN_MACHINE`, `QC_GATE_MACHINE`, `BOM_MACHINE` |
| **API routes** | CRUD factory for each. `/api/work-packages/[id]/dependencies/route.ts`. `/api/qc-gates/[id]/inspect/route.ts` (pass/fail with evidence). |
| **UI** | Work package list with dependency graph. BOM builder (add/remove items, nested sub-BOMs). QC gate checklist with photo upload. Production run tracker with yield/waste metrics. |

### P2.7 — Production Advance Integration

Already largely complete (P0.2 from previous work). Enhance:
- Wire advance approval to generic approval engine (instead of custom)
- Add realtime status updates via existing `realtime-advancing.ts`

### Phase 2 Acceptance Criteria

- [ ] Project can be created, moved through all 12 phases via UI
- [ ] Tasks drag-drop on Kanban board, status transitions validated
- [ ] SOW created from proposal, deliverables tracked, amendments versioned
- [ ] Resource booking with conflict detection works on calendar
- [ ] Work package with BOM + QC gate passes full lifecycle
- [ ] All state transitions unit-tested
- [ ] Approval engine integration tested for SOW + milestone approvals

---

## Phase 3 — Financial Engine (Weeks 11–13)

> **Workstreams:** WS-01 (Sales & CRM), WS-04 (Finance & Billing)
>
> **Dependencies:** Projects, SOWs, Contacts (from Phase 2)

### P3.1 — Sales & CRM (WS-01)

| Workflow | Work Required | Effort |
|---------|--------------|--------|
| 01.01 **Deal Pipeline** | Wire existing Kanban UI to mutations. Drag-drop stage change. Deal creation form with Zod schema. | M |
| 01.02 **Opportunity Stages** | CRUD API + state machine. Activity logging API (01.08). Conversion to project trigger. | M |
| 01.04 **Account Risk Assessment** | API: compute risk score from payment history, project success rate, complaint frequency. Display on account detail. | S |
| 01.06–01.07 **Revenue Recognition** | API: schedule recognition events based on method (milestone/percentage/time/event). Dashboard view of recognized vs deferred revenue. | L |
| 01.09–01.10 **Service Requests** | CRUD API + state machine. Source tracking. Conversion to deal/project. | M |
| 01.11 **Proposal→SOW→Contract Chain** | UI flow: proposal approve → generate SOW (P2.3) → generate contract (P7.1). | M |
| 01.12 **Client Relationship Scoring** | Computed view: activity frequency × deal velocity × NPS → score per account | S |
| 01.13 **Win/Loss Analysis** | Form + API for post-close analysis. Report template. | S |
| 01.14 **Surveys** | DB migration for `surveys`, `survey_questions`, `survey_responses`. CRUD API. UI: builder + distribution + results. | L |

### P3.2 — Finance & Billing (WS-04)

| Workflow | Work Required | Effort |
|---------|--------------|--------|
| 04.01 **Vendor Invoice** | State machine + CRUD API. Line items. Payment tracking. | M |
| 04.02 **Client Invoice** | State machine + CRUD API. Invoice line items from SOW deliverables. PDF generation (server-side). | L |
| 04.03 **Procurement PO** | State machine (11 states) + CRUD API. PO → vendor invoice link. | M |
| 04.04 **Estimate Conversion** | State machine + convert-to-invoice action. | S |
| 04.05 **Budget Profitability** | Wire existing `v_budget_profitability` view to hooks + dashboard widgets. Real-time margin tracking. | M |
| 04.06 **Expense Reimbursement** | CRUD + state machine + approval engine integration. Receipt photo upload. | M |
| 04.07 **Revenue Recognition** | Shared with 01.06–01.07. Schedule table + recognition events. | — |
| 04.08 **Subscription Management** | API for subscription CRUD. Tier upgrade/downgrade flow. Billing portal link. | M |
| 04.09 **Credit Notes** | Create credit note → link to invoice → adjust balance. | S |
| 04.10 **Recurring Invoices** | Template CRUD + cron-based generation. | M |
| 04.11 **Job Costing Roll-up** | Aggregate view: project → all costs (labor + materials + expenses + vendor invoices) → margin. | M |
| 04.12 **GL Reconciliation** | Match transactions to GL accounts. Variance report. | M |

### Phase 3 Acceptance Criteria

- [ ] Deal can be dragged through pipeline stages, converted to project
- [ ] Opportunity lifecycle with activity logging
- [ ] Client invoice generated from SOW deliverables
- [ ] Vendor invoice lifecycle with PO linking
- [ ] Budget profitability dashboard shows real-time margins
- [ ] Expense submission → approval → reimbursement flow
- [ ] Revenue recognition scheduled by method
- [ ] Recurring invoices auto-generate on schedule

---

## Phase 4 — People, Vendors & Assets (Weeks 14–17)

> **Workstreams:** WS-05 (People), WS-06 (Vendors), WS-07 (Assets)
>
> **Dependencies:** Projects, Scheduling, Contracts (from Phases 2–3)

### P4.1 — People & Workforce (WS-05)

| Workflow | Work Required | Effort |
|---------|--------------|--------|
| 05.01 **Crew Lifecycle** | State machine + CRUD. Employment type tracking. Termination workflow with offboarding checklist. | M |
| 05.02 **Shift Management** | State machine (7 states). Check-in/out with geolocation. Break tracking. | M |
| 05.03 **Time Entry Approval** | CRUD + approval engine integration. Weekly timesheet view. Overtime calculation. | M |
| 05.04 **Crew Utilization** | Wire `v_crew_utilization` view. Dashboard: utilization heatmap, conflict alerts. | M |
| 05.05 **Resource Availability** | CRUD for `crew_availability` + calendar integration. Available/unavailable/tentative states. | S |
| 05.06 **Assignment Lifecycle** | State machine: pending→confirmed→active→completed→cancelled. Wire to scheduling. | S |
| 05.07 **Onboarding/Offboarding** | Checklist builder: define steps → assign → track progress → complete. Wire to existing onboarding steps table. | M |
| 05.08 **Time Off Requests** | CRUD + manager approval. Balance tracking. Calendar integration. | M |
| 05.09 **Performance Reviews** | Review cycle CRUD. Self-assessment + manager assessment. Rating scales. | M |
| 05.10 **Goals/OKR** | Objective CRUD. Key result tracking with progress %. Cascade goals (company→team→individual). | M |
| 05.11 **Shift Handoff** | Edge Function: outgoing shift → generate handoff summary → incoming shift acknowledges. | M |

### P4.2 — Vendor & Contractor Management (WS-06)

| Workflow | Work Required | Effort |
|---------|--------------|--------|
| 06.01 **Vendor Onboarding** | State machine (9 states). Document requirement engine: vendor type → required docs. Portal invite. | L |
| 06.02 **Work Orders** | State machine (13 states). Work order builder. Assignment + scheduling. | L |
| 06.03 **Dispatch** | State machine (10 states). Map view with real-time positions. Assignment optimization. | L |
| 06.04 **Compliance Documents** | CRUD for requirements + submissions. Expiry monitoring cron. Dashboard: compliance scorecard per vendor. | M |
| 06.05 **Vendor Bids** | Bid submission portal. Comparison matrix. Accept/reject workflow. | M |
| 06.06 **Vendor Reviews** | Review form + rating system. Aggregate scoring. Period review scheduling. | M |
| 06.07 **Job Checklists** | Checklist template builder. Assignment to work orders. Completion tracking with photo evidence. | M |
| 06.08 **Vendor Portal** | Separate layout/auth path for vendor users. Show: assigned work orders, invoices, compliance status. | L |
| 06.09 **Vendor Risk Scoring** | Computed: compliance % × review avg × incident count × payment reliability → risk score | S |
| 06.10 **Preferred Vendor Management** | Promote/demote based on scoring. Preferred vendor badge in selection UIs. | S |

### P4.3 — Assets & Logistics (WS-07)

| Workflow | Work Required | Effort |
|---------|--------------|--------|
| 07.01 **Asset Assignment** | State machine (6 states). Check-out/in with barcode scan. Assign to project/event. | M |
| 07.02 **Asset Condition Tracking** | Update condition on return. Maintenance alerts on `needs_repair`. | S |
| 07.03 **Shipment Tracking** | State machine (8 states). Carrier integration stubs. Map tracking view. | M |
| 07.04 **Fleet Management** | Vehicle CRUD + status tracking. Assignment to shipments. Maintenance log. | M |
| 07.05 **Rental Agreements** | State machine (7 states). Rate calculation. Return date tracking. | M |
| 07.06 **Rights & Licensing** | State machine (5 states). Expiry monitoring. 11 rights types. | M |
| 07.07 **Inventory Reservation** | Reserve → allocate → consume → release. Stock level tracking. Low-stock alerts. | M |
| 07.08 **Warehouse Transfer** | Transfer workflow: initiate → pick → pack → ship → receive → confirm. | M |
| 07.09 **Maintenance Scheduling** | Recurring maintenance schedules. Work order generation. | M |

### Phase 4 Acceptance Criteria

- [ ] Crew member full lifecycle with shift check-in/out
- [ ] Time entry submitted and approved through approval engine
- [ ] Crew utilization dashboard shows heatmap
- [ ] Vendor onboarded through 9-state process with compliance docs
- [ ] Work order created, assigned, dispatched, completed, verified
- [ ] Asset checked out, tracked, returned with condition assessment
- [ ] Shipment tracked through 8 states on map
- [ ] Inventory reserved, allocated, consumed with stock alerts

---

## Phase 5 — Communications & Collaboration (Weeks 18–20)

> **Workstream:** WS-08 (Messaging & Communications)
>
> **Dependencies:** All entity types (for entity-linked messaging)
>
> **Note:** Core messaging already ~80% implemented. Focus on gaps and polish.

### P5.1 — Messaging Gaps

| Workflow | Work Required | Effort |
|---------|--------------|--------|
| 08.11 **Push-to-Talk / Voice** | Integrate LiveKit or WebRTC for voice channels. Record + playback voice messages. PTT button in channel UI. | XL |
| 08.12 **AI Message Summaries** | API route: fetch channel messages → summarize via LLM API → display "catch up" card. Configurable trigger: manual / on-login / daily digest. | L |

### P5.2 — Communication Enhancements

| Deliverable | Details |
|------------|---------|
| **Offline message queue** | Service worker: queue messages when offline → sync on reconnect | L |
| **Push notifications** | Web Push API integration. Notification preferences per channel type. | M |
| **Message threading improvements** | Thread summary, unread count per thread, thread list view | M |
| **File sharing in channels** | Supabase Storage integration. Image preview, file download. | M |
| **Typing indicators** | Wire existing `hooks-messaging-realtime.ts` typing indicators to all channel UIs | S |

### Phase 5 Acceptance Criteria

- [ ] Voice message record + playback works in channels
- [ ] AI summary generates accurate channel recap
- [ ] Push notifications delivered for mentions and DMs
- [ ] File upload/download works in channel messages
- [ ] Typing indicators visible in real-time

---

## Phase 6 — Live Operations (Weeks 21–24)

> **Workstream:** WS-09 (Live Event Operations)
>
> **Dependencies:** Events, Locations, Crew, Assets, Messaging, Credentialing (from Phases 2–5)
>
> **Note:** This is the platform's vertical differentiator. Most complex workstream.

### P6.1 — Live Event Instance Management (09.01)

| Deliverable | Details |
|------------|---------|
| **State machine** | `LIVE_EVENT_MACHINE`: advance→load_in→setup→rehearsal→ready→live→hold→strike→wrapped. Phase change requires command-layer authorization. |
| **API** | `/api/live-events/[id]/transition/route.ts` — Phase change with validation. `/api/live-events/[id]/status/route.ts` — Real-time status. |
| **UI** | Live event command dashboard: big phase indicator, phase stepper, one-click advance. Realtime updates via Supabase Realtime. |
| **Side effects** | Phase change → post to ops channel (via `entity-status-to-channel` EF), update department statuses, notify command hierarchy |

### P6.2 — Command Hierarchy (09.12)

| Deliverable | Details |
|------------|---------|
| **API** | CRUD for `command_positions`. Assign crew to positions. Authority chain validation. |
| **UI** | Org chart view for event. Position assignment drag-drop. Authority indicator per action. |

### P6.3 — Department Status Board (09.02)

| Deliverable | Details |
|------------|---------|
| **API** | `/api/live-events/[id]/departments/route.ts` — Status per department. Bulk status update. |
| **UI** | Grid of department cards with status colors. One-click status update for department leads. Aggregate readiness indicator. |

### P6.4 — Readiness Gates (09.03)

| Deliverable | Details |
|------------|---------|
| **State machine** | `READINESS_GATE_MACHINE`: not_started→in_progress→passed→failed→waived |
| **API** | CRUD + pass/fail/waive actions with evidence upload |
| **UI** | Checklist view per event. Must pass all gates before phase transition to "ready". |

### P6.5 — Run of Show (09.04)

| Deliverable | Details |
|------------|---------|
| **State machine** | `ROS_CUE_MACHINE`: pending→standby→called→in_progress→completed→skipped→held |
| **API** | CRUD for ROS cues. Call/complete/skip/hold actions. |
| **UI** | Timeline view. Cue caller interface. Auto-scroll to current cue. |
| **Integration** | Cue call → `cue-to-channel` Edge Function → post to channel |

### P6.6 — Equipment Status (09.05), VIP Management (09.06), Guest Incidents (09.07)

| Deliverable | Details |
|------------|---------|
| **Equipment** | Check-in/deploy/strike actions. Issue reporting → incident creation. Dashboard view. |
| **VIP** | Guest list management. Check-in tracking. Tier-based service routing. |
| **Guest incidents** | Report form. Severity-based routing. Resolution tracking. |

### P6.7 — Strike & Reconciliation (09.08, 09.09, 09.10)

| Deliverable | Details |
|------------|---------|
| **Strike sequence** | Ordered step list per department. Dependency management. Progress tracking. |
| **Asset reconciliation** | Compare checked-out vs returned assets. Flag discrepancies. Write-off approval. |
| **Post-event reporting** | Aggregate: financial summary, attendance, incidents, equipment issues, crew hours. PDF export. |

### P6.8 — Live Financial Dashboard (09.11, 09.13, 09.14)

Already partially implemented via `sync-pos-aggregate` EF. Wire to UI:
- Real-time revenue dashboard (F&B, merch, tickets)
- FOH zone monitoring (capacity, wait times)
- Gate scanner integration (existing credentialing API)

### Phase 6 Acceptance Criteria

- [ ] Live event progresses through all 9 phases via command dashboard
- [ ] Department status board reflects real-time state
- [ ] All readiness gates must pass before "ready" phase
- [ ] ROS cues auto-post to channels
- [ ] Asset reconciliation catches discrepancies
- [ ] Live financial dashboard updates in real-time
- [ ] Post-event report generates comprehensive PDF

---

## Phase 7 — Creative, Legal & Compliance (Weeks 25–27)

> **Workstreams:** WS-11 (Creative & Documents), WS-12 (Legal & Compliance)
>
> **Dependencies:** Projects, Approvals, Vendors, Crew, Events

### P7.1 — Creative & Documents (WS-11)

| Workflow | Work Required | Effort |
|---------|--------------|--------|
| 11.01 **Document Lifecycle** | CRUD + state machine (draft→pending_review→published→archived). Version control. | M |
| 11.02 **Call Sheet / Tech Sheet** | Enhanced CRUD with distribution list. PDF generation. Approval integration. | M |
| 11.03 **Digital Asset Versioning** | File upload to Supabase Storage. Version history. Tag system. Thumbnail generation. | L |
| 11.04 **Creative Brief** | Template-driven brief creation. Assignment to creatives. Review cycle. | M |
| 11.05 **Campaign Execution** | Campaign CRUD with channel/asset/KPI sub-entities. Progress tracking. ROI dashboard. | L |
| 11.06 **Brand Guidelines** | Structured guideline editor. Color/font/logo asset management. Compliance check stub. | M |
| 11.07 **Template Management** | Template CRUD with category/version. Usage tracking. | S |
| 11.08 **Deck Builder** | Slide CRUD. Markdown/rich text content. Export to PDF. | L |

### P7.2 — Legal & Compliance (WS-12)

| Workflow | Work Required | Effort |
|---------|--------------|--------|
| 12.01 **Contract Lifecycle** | State machine (6 states) + CRUD + approval engine + e-signature (from P1.3). | M |
| 12.02 **Incident Management** | State machine (5 states) + CRUD. Severity-based routing. Investigation workflow. Action items. | M |
| 12.03 **Insurance Policies** | CRUD + expiry monitoring. Coverage gap alerts. | S |
| 12.04 **IP & Rights Clearance** | State machine (5 states). 11 rights types. Expiry tracking. | M |
| 12.05 **Compliance Doc Enforcement** | Wire vendor compliance requirements → submission → review → approve/reject → expiry alerts. | M |
| 12.06 **Data Retention Execution** | API: run retention policy → anonymize/archive per rules. Audit trail. | M |
| 12.07 **Certification Tracking** | CRUD + expiry alerting. Recertification workflow. | S |
| 12.08 **Policy Acceptance** | Present policy → user accepts → record timestamp + version. Re-acceptance on policy update. | M |
| 12.09 **Legal Obligation Monitoring** | Extract obligations from contracts. Track deadlines. Alert on approaching due dates. | M |

### Phase 7 Acceptance Criteria

- [ ] Documents move through draft→review→publish lifecycle
- [ ] Call sheets generated and distributed with approval
- [ ] Digital assets uploaded with version control
- [ ] Contracts signed via e-signature workflow
- [ ] Incidents reported, investigated, resolved with action items
- [ ] Compliance docs enforced per vendor type with expiry alerts
- [ ] Policy acceptance tracked per user per policy version

---

## Phase 8 — Integrations & Automation (Weeks 28–30)

> **Workstreams:** WS-10 (Integrations), WS-15 (Automation Engine)
>
> **Dependencies:** All entity types

### P8.1 — Integration Framework (WS-10)

| Workflow | Work Required | Effort |
|---------|--------------|--------|
| 10.06 **Provider Connection Management** | Enhance existing: connection test, OAuth flow, credential storage, status monitoring. | M |
| 10.07 **Sync Conflict Resolution** | UI for reviewing conflicts. Per-field resolution policies. Manual override option. | M |
| 10.08 **Additional Provider Adapters** | Template adapter pattern. Add: Stripe, QuickBooks, Google Calendar stubs. | L |

### P8.2 — Automation Engine (WS-15)

| Workflow | Work Required | Effort |
|---------|--------------|--------|
| 15.01 **Rule Definition UI** | Visual rule builder: select trigger → define conditions → choose action. Drag-drop condition groups. | L |
| 15.02 **Execution Dashboard** | Automation log viewer. Success/failure rates. Execution timeline. | M |
| 15.03 **Trigger Configuration** | Wire triggers to Supabase Realtime: table insert/update events → evaluate rules → execute actions. | L |
| 15.04 **Action Configuration** | Standard action library: send notification, change status, assign user, create task, send webhook, post to channel. | M |
| 15.05 **Analytics** | Trigger frequency, success rate, average execution time. Optimization suggestions. | S |

### Phase 8 Acceptance Criteria

- [ ] New integration connected via OAuth flow
- [ ] Sync conflict detected and resolved via UI
- [ ] Automation rule created via visual builder
- [ ] Automation fires on entity status change and executes action
- [ ] Automation logs show complete execution history

---

## Phase 9 — Intelligence & Polish (Weeks 31–34)

> **Goal:** Cross-cutting intelligence, analytics, and UX polish.

### P9.1 — Analytics & Reporting

| Deliverable | Details |
|------------|---------|
| **Executive dashboard** | KPIs: revenue, margin, utilization, pipeline value, active projects, incidents. Configurable per role. |
| **Report builder** | Select entity → choose fields → apply filters → grouping → chart type → save/export |
| **Forecasting** | Revenue forecast from pipeline probability. Budget forecast from burn rate. Crew demand forecast from scheduled events. |
| **Saved views / Custom dashboards** | User-defined widget layouts. Share with team. |

### P9.2 — AI-Powered Features

| Deliverable | Details |
|------------|---------|
| **Client relationship scoring** | ML model: activity patterns → churn risk + upsell probability |
| **Smart scheduling** | Optimize crew assignment based on skills, availability, location, cost |
| **Anomaly detection** | Budget overspend, time entry outliers, unusual patterns → alerts |
| **Natural language search** | ⌘K command bar enhanced with semantic search across all entities |

### P9.3 — UX Polish

| Deliverable | Details |
|------------|---------|
| **Motion system** | Implement `docs/MOTION_STRATEGY.md` Phase 1–4 |
| **Keyboard shortcuts** | Global shortcuts for common actions (n: new, e: edit, d: delete, /: search) |
| **Mobile PWA** | Service worker, offline support, app manifest, responsive layouts |
| **Accessibility audit** | WCAG 2.2 AA pass for all pages |
| **Performance** | Lighthouse ≥90 for all core pages. Lazy loading. Virtual scrolling for large lists. |

### Phase 9 Acceptance Criteria

- [ ] Executive dashboard renders real data for all KPIs
- [ ] Report builder exports PDF/CSV with correct data
- [ ] Forecasting model produces reasonable 90-day projections
- [ ] AI scoring returns values for all accounts
- [ ] Lighthouse ≥90 for dashboard, project detail, live-ops pages
- [ ] WCAG 2.2 AA compliance verified

---

## Verification Matrix

Every phase must pass this gate before proceeding:

| Check | Command | Pass Criteria |
|-------|---------|---------------|
| TypeScript | `npm run type-check` | 0 errors |
| ESLint | `npm run lint` | 0 errors, 0 warnings |
| Unit tests | `npm run test` | 100% pass, coverage ≥80% for new code |
| Build | `npm run build` | Successful, <200KB first-load JS |
| Quality gate | `npm run quality-gate:automated` | All automated criteria pass |
| Accessibility | vitest-axe checks | 0 violations on new pages |
| Migration | `npx supabase db reset` | All migrations apply cleanly |
| Security | `npm audit` | 0 critical/high vulnerabilities |

### Per-Workflow Verification

Each workflow must demonstrate:

1. **Happy path** — Create → transition through all states → complete
2. **RBAC enforcement** — Unauthorized role gets 403
3. **Validation** — Invalid input returns structured error
4. **State machine** — Invalid transition returns error
5. **Side effects** — Notifications/channel posts/approvals fire correctly
6. **Field-level RBAC** — Masked/hidden fields not returned for restricted roles

---

## Risk Register

| # | Risk | Impact | Mitigation |
|---|------|--------|-----------|
| R1 | Database types drift from migrations | All hooks break | Regenerate types in Phase 0, add CI check to verify types match migrations |
| R2 | CRUD factory doesn't cover edge cases | Hand-write routes, losing consistency | Design factory with escape hatches: custom middleware, pre/post hooks, override handlers |
| R3 | State machine complexity explosion | Hard to maintain 60+ machines | Use declarative config (JSON/TS objects), not imperative code. Shared guards. |
| R4 | Approval engine performance at scale | Slow queries on large orgs | Index `workflow_instances(entity_type, entity_id, status)`. Pagination. Cache active instances. |
| R5 | Live operations real-time latency | UI feels sluggish during events | Supabase Realtime channels per event. Optimistic UI. Debounce status updates. |
| R6 | Edge Function cold starts | Delayed webhooks/cron | Use Deno Deploy warm-up. Retry logic. Dead-letter queue for failures. |
| R7 | Scope creep per phase | Schedule slips | Strict phase scope. RECOMMENDED workflows are Phase 9 only. IMPLIED workflows are core scope. |
| R8 | 33 mock-data files still in codebase | Type errors after regeneration | Phase 0 explicitly removes all mock dependencies before anything else |
| R9 | Form schema divergence from DB | Validation mismatches | Generate Zod schemas from `database.types.ts` where possible |
| R10 | Multi-tenancy data leak | Security breach | RLS on every table (already exists). API routes always scope by `organization_id`. Integration tests verify isolation. |

---

## Effort Estimation Summary

| Phase | Weeks | Workflows Addressed | New API Routes | New/Modified Pages | Key Risk |
|-------|-------|--------------------|----|-----|------|
| **P0** | 1–2 | 0 (infrastructure) | ~5 factory proofs | 0 | R1, R8 |
| **P1** | 3–6 | 18 | ~15 | ~8 | R3, R4 |
| **P2** | 7–10 | 18 | ~20 | ~15 | R3 |
| **P3** | 11–13 | 26 | ~25 | ~20 | R7 |
| **P4** | 14–17 | 30 | ~30 | ~25 | R7 |
| **P5** | 18–20 | 7 | ~5 | ~5 | R5 |
| **P6** | 21–24 | 16 | ~20 | ~18 | R5, R6 |
| **P7** | 25–27 | 17 | ~15 | ~12 | R7 |
| **P8** | 28–30 | 13 | ~10 | ~8 | R6 |
| **P9** | 31–34 | 19 | ~10 | ~15 | R7 |
| **TOTAL** | **34 weeks** | **164** | **~155** | **~126** | — |

---

## Implementation Order Within Each Phase

Within each phase, follow this order for each workflow:

1. **State machine definition** — `src/lib/state-machines/{entity}.ts`
2. **Zod schema** — `src/lib/schemas/{domain}.ts`
3. **Types** — `src/types/{domain}.ts` (if not already generated from DB)
4. **API routes** — `src/app/api/{entity}/route.ts` + transition endpoints
5. **Hooks** — `src/lib/supabase/hooks-{domain}.ts` (read) + mutation factory hooks
6. **i18n strings** — `src/lib/i18n/{domain}-strings.ts`
7. **Components** — `src/components/{domain}/` (shared UI elements)
8. **Page wiring** — `src/app/(dashboard)/{entity}/page.tsx` — replace mock data with hooks + mutations
9. **RBAC registration** — Add resource to `PERMISSION_MATRIX` if new
10. **Navigation update** — Ensure NAV item exists and permissions match
11. **Tests** — State machine tests + API integration tests + component tests

---

*This plan is a living document. Update it as implementation reveals new dependencies or constraints.*
````
