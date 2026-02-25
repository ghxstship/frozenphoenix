# Experiential & Creative Production Lifecycle Architecture

**Date:** 2026-02-25  
**Version:** 1.0  
**Scope:** Full hierarchical lifecycle analysis — Projects → Locations → Activations → Events → Activities → Assets → Tasks  
**Methodology:** Schema audit (10 migrations, 150+ tables), type mapping (5 type files, 1500+ lines), UI surface inventory (94+ routes), gap analysis

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current-State Hierarchy Map](#2-current-state-hierarchy-map)
3. [Lifecycle Swimlane Diagrams](#3-lifecycle-swimlane-diagrams)
4. [Structural Findings — Redundancies, Risks & Gaps](#4-structural-findings)
5. [Future-State System Architecture](#5-future-state-system-architecture)
6. [Entity Relationship Model (3NF Compliant)](#6-entity-relationship-model-3nf-compliant)
7. [Hierarchy Dependency Matrix](#7-hierarchy-dependency-matrix)
8. [Reusability & Modularity Framework](#8-reusability--modularity-framework)
9. [Budget Roll-Up Schema](#9-budget-roll-up-schema)
10. [Risk Mitigation Framework](#10-risk-mitigation-framework)
11. [UI/UX Simplification Principles](#11-uiux-simplification-principles)
12. [Automation & AI Augmentation Opportunities](#12-automation--ai-augmentation-opportunities)
13. [Who/What/When/Where/Why/How/If-Then Dataset Audit](#13-dataset-audit)
14. [Implementation Roadmap](#14-implementation-roadmap)

---

## 1. Executive Summary

### Current State

Frozen Phoenix manages experiential production through **10 SQL migrations** defining **150+ tables**, **5 TypeScript type files** with **1500+ lines** of typed interfaces, **94+ UI routes**, and a comprehensive navigation config with **12 sections / 58 nav items**.

The production hierarchy is partially implemented:

| Level | Schema | Types | UI Page | Detail Page | Status |
|-------|--------|-------|---------|-------------|--------|
| **Project** | `projects` (001) | ✅ `production.ts` | ✅ `/projects` | ⚠️ Partial | Core entity, well-covered |
| **Location** | `locations` (003) | ✅ `production.ts` | ✅ `/locations` | ✅ `/locations/[id]` | Good coverage |
| **Activation** | `activations` (003) | ✅ `production.ts` | ✅ `/activations` | ❌ Missing | Schema rich, UI thin |
| **Event** | `events` (003) | ✅ `production.ts` | ✅ `/events` | ❌ Missing | Schema rich, UI thin |
| **Activity** | `activities` (003) | ✅ `production.ts` | ❌ Missing | ❌ Missing | Schema only, no UI |
| **Asset** | `assets` (001) + extensions (003) | ✅ `production.ts` | ✅ `/assets` | ✅ `/assets/[id]` | Well-covered |
| **Task** | `tasks` (001) + `production_tasks` (003) | ✅ Both type files | ✅ `/tasks` | ❌ Missing | **Dual-table SSOT violation** |

### Critical Findings

1. **Task Table Duplication** — `tasks` (001) and `production_tasks` (003) represent the same concept with different schemas. Neither references the other. This is the single most significant SSOT violation.
2. **Milestone Duplication** — `milestones` (002) and `production_milestones` (003) overlap identically.
3. **Budget/Expense/Time Entry Triplication** — Generic tables (001/002) and production-prefixed tables (003) coexist without consolidation strategy.
4. **SOP/Checklist Duplication** — `sops` (001), `production_sops` (003), `production_checklists` (003), `checklist_templates` (008), `job_checklists` (008).
5. **Missing Activities UI** — The `activities` table exists in schema but has zero UI surface.
6. **No Asset Reuse Model** — Assets can be assigned to projects but there is no template/catalog for cross-project reuse.
7. **No DAM (Digital Asset Management)** — Physical assets tracked; digital creative assets (renders, designs, photos) have no dedicated pipeline.
8. **No Post-Event Data Capture** — No structured tables for attendance metrics, engagement data, ROI calculation, or post-mortem findings.
9. **No Change Order System** — SOW change log exists but no formal change order workflow with impact analysis.

### Recommendation Summary

| Action | Impact | Effort | Priority |
|--------|--------|--------|----------|
| Consolidate task tables → unified `tasks` | Eliminates SSOT violation | Medium | **P0** |
| Consolidate milestone tables → unified `milestones` | Eliminates SSOT violation | Small | **P0** |
| Consolidate budget/expense/time tables | Eliminates triplication | Large | **P1** |
| Add Activities UI page | Completes hierarchy | Small | **P1** |
| Add Activation/Event detail pages | Enables drill-down | Medium | **P1** |
| Add asset catalog/template system | Enables cross-project reuse | Medium | **P2** |
| Add digital asset management tables | Enables DAM | Medium | **P2** |
| Add post-event metrics tables | Enables ROI reporting | Medium | **P2** |
| Add change order workflow | Enables impact tracking | Medium | **P2** |

---

## 2. Current-State Hierarchy Map

### 2.1 Entity Hierarchy Tree

```
Organization (tenant root)
│
├── Project (portfolio-level initiative)
│   ├── Location (venue / market / destination)
│   │   ├── Activation (brand/campaign implementation at location)
│   │   │   ├── Event (date-specific execution)
│   │   │   │   ├── Activity (programmed segment — NO UI)
│   │   │   │   ├── Crew Shift (labor assignment)
│   │   │   │   └── Run of Show Items (embedded JSONB)
│   │   │   ├── Asset Assignment (physical elements)
│   │   │   └── Staffing Requirements (embedded JSONB)
│   │   ├── Event (can exist at location without activation)
│   │   └── Asset (located at this venue)
│   │
│   ├── Task / Production Task ← DUAL TABLE PROBLEM
│   │   ├── Task Dependencies
│   │   └── Subtasks (self-referential parent_id)
│   │
│   ├── Milestone / Production Milestone ← DUAL TABLE PROBLEM
│   │
│   ├── Budget / Production Budget Lines ← DUAL TABLE PROBLEM
│   │   ├── Expense / Production Expense
│   │   └── Time Entry / Production Time Entry
│   │
│   ├── Scope of Work
│   │   ├── SOW Deliverables
│   │   └── SOW Change Log
│   │
│   ├── Contract
│   ├── RFQ → Purchase Order → Invoice
│   ├── Shipment
│   ├── Schedule Entry
│   ├── Call Sheet → Call Sheet Crew
│   ├── Tech Sheet
│   ├── Incident
│   └── Crew Assignment (project_assignments)
│
├── Asset (global inventory)
│   ├── Asset Assignment (per-project checkout)
│   ├── Maintenance Record
│   └── Consumable → Consumable Usage
│
├── Crew Member → Worker Profile (011)
│   ├── Certifications
│   ├── Crew Shifts
│   ├── Crew Availability
│   ├── Time Entries
│   ├── Time Off Requests
│   └── Project Assignments
│
├── Vendor → Worker Profile (011)
│   ├── Compliance Docs
│   ├── Work Orders → Bids
│   ├── Dispatch Entries
│   ├── Reviews
│   └── Portal Tokens
│
├── Warehouse
│   └── Zones (embedded JSONB)
│
└── Vehicle
    └── Assignment tracking (via status field)
```

### 2.2 Relationship Cardinality Map

| Parent | Child | Cardinality | FK Column | Notes |
|--------|-------|-------------|-----------|-------|
| Organization | Project | 1:N | `projects.organization_id` | Tenant isolation |
| Project | Location | 1:N | `locations.project_id` | Venues per project |
| Project | Activation | 1:N | `activations.project_id` | Also has `location_id` |
| Location | Activation | 1:N | `activations.location_id` | Activation at specific venue |
| Activation | Event | 1:N | `events.activation_id` | Nullable — events can be standalone |
| Project | Event | 1:N | `events.project_id` | Direct project link |
| Location | Event | 1:N | `events.location_id` | Direct location link |
| Event | Activity | 1:N | `activities.event_id` | Segments within event |
| Project | Task | 1:N | `tasks.project_id` | Generic tasks |
| Project | Production Task | 1:N | `production_tasks.project_id` | **Duplicate path** |
| Task | Task | 1:N (self) | `tasks.parent_id` | Subtask hierarchy |
| Project | Milestone | 1:N | `milestones.project_id` | Generic milestones |
| Project | Production Milestone | 1:N | `production_milestones.project_id` | **Duplicate path** |
| Project | Budget | 1:N | `budgets.project_id` | Versioned budgets |
| Project | SOW | 1:N | `scopes_of_work.project_id` | Contractual scope |
| SOW | Deliverable | 1:N | `sow_deliverables.sow_id` | Line items |
| Asset | Asset Assignment | 1:N | `asset_assignments.asset_id` | Checkout tracking |
| Asset | Maintenance Record | 1:N | `maintenance_records.asset_id` | Service history |

### 2.3 Many-to-Many Relationships (Junction Tables)

| Relationship | Junction Table | Notes |
|-------------|---------------|-------|
| Project ↔ Member | `project_members` | Role-based membership |
| Stakeholder ↔ Project | `stakeholder_projects` | External stakeholders |
| Invoice Line Item ↔ Time Entry | `invoice_time_entries` | Billing linkage |
| Worker Profile ↔ Crew Member | `crew_members.worker_profile_id` | Bridge FK (011) |
| Worker Profile ↔ Vendor | `vendors.worker_profile_id` | Bridge FK (011) |

### 2.4 Missing Relationships (Gaps)

| Expected Relationship | Current State | Impact |
|-----------------------|---------------|--------|
| Activation ↔ Asset | `activations` has no `asset_ids` FK | Cannot track which assets are at which activation |
| Event ↔ Asset | No direct link | Assets at events tracked only via activation |
| Activity ↔ Asset | `activities` schema has `asset_ids` but no junction table | JSONB array, not relational |
| Activity ↔ Consumable | Same as above | Not queryable |
| Task ↔ SOW Deliverable | FK exists in 007 migration | ✅ Connected |
| Asset ↔ Digital Asset | No DAM table | Physical and digital assets conflated |

---

## 3. Lifecycle Swimlane Diagrams

### 3.1 Project Lifecycle

```
Phase         │ PM/Producer    │ Creative       │ Finance        │ Operations     │ Vendors
──────────────┼────────────────┼────────────────┼────────────────┼────────────────┼────────────────
DISCOVERY     │ Create project │                │                │                │
              │ Define scope   │                │                │                │
              │ Assign team    │                │                │                │
──────────────┼────────────────┼────────────────┼────────────────┼────────────────┼────────────────
DESIGN        │ Define activns │ Concepts       │                │ Site surveys   │
              │ Map locations  │ Renderings     │                │ Venue scouting │
              │ Build ROS      │ Brand app      │                │                │
──────────────┼────────────────┼────────────────┼────────────────┼────────────────┼────────────────
PRE-PROD      │ SOW creation   │ Design pkgs    │ Budget v1      │ Logistics plan │ RFQs issued
              │ Milestone plan │ Approval cycle │ Rate cards     │ Asset check    │ Bids received
              │ Task breakdown │                │ SOW approval   │ Crew booking   │ Contracts
──────────────┼────────────────┼────────────────┼────────────────┼────────────────┼────────────────
PROCUREMENT   │ PO approval    │                │ PO issuance    │ Vendor coord   │ PO acknowledge
              │ Change orders  │                │ Budget tracking│ Receiving      │ Fulfillment
──────────────┼────────────────┼────────────────┼────────────────┼────────────────┼────────────────
FABRICATION   │ Progress track │ QC reviews     │ Expense track  │ Shop mgmt      │ Build progress
              │ Milestone gate │ Revisions      │                │ Material track │ Delivery
──────────────┼────────────────┼────────────────┼────────────────┼────────────────┼────────────────
LOGISTICS     │ Ship tracking  │                │ Freight costs  │ Truck dispatch │ Carrier coord
              │ Customs/permits│                │                │ Route planning │
──────────────┼────────────────┼────────────────┼────────────────┼────────────────┼────────────────
LOAD-IN       │ Call sheets    │ Install QC     │ OT tracking    │ Crew dispatch  │ On-site labor
              │ Tech sheets    │                │                │ Asset check-in │ Equipment
              │ Daily reports  │                │                │ Safety brief   │
──────────────┼────────────────┼────────────────┼────────────────┼────────────────┼────────────────
REHEARSAL     │ Run-through    │ Final tweaks   │                │ Systems check  │ Tech support
──────────────┼────────────────┼────────────────┼────────────────┼────────────────┼────────────────
SHOW          │ Live ops       │ Content cap    │ Live expense   │ Shift mgmt     │ On-site vendor
              │ Incident mgmt │ Social media   │                │ Consumable use │ Support
              │ Client liaison │                │                │ Safety monitor │
──────────────┼────────────────┼────────────────┼────────────────┼────────────────┼────────────────
STRIKE        │ Strike plan    │ Asset photo    │ Final expenses │ Crew dispatch  │ Removal labor
              │ Checklist      │ Documentation  │                │ Asset checkout │ Equipment return
──────────────┼────────────────┼────────────────┼────────────────┼────────────────┼────────────────
LOAD-OUT      │ Ship tracking  │                │ Return freight │ Truck dispatch │ Carrier coord
              │ Damage report  │                │                │ Inventory rec  │
──────────────┼────────────────┼────────────────┼────────────────┼────────────────┼────────────────
WRAP          │ Post-mortem    │ Case study     │ Final invoice  │ Asset return   │ Final invoice
              │ Client debrief │ Portfolio      │ Budget close   │ Damage assess  │ Review
              │ ROI report     │ Photo edit     │ P&L report     │ Storage plan   │ Rating
```

### 3.2 Activation Sub-Lifecycle

```
PLANNING → DESIGN → BUILD → INSTALL → ACTIVE → STRIKE → STORE/DISPOSE
    │          │        │        │         │        │          │
 Define      Render   Fab     Load-in   Operate  Dismantle  Warehouse
 footprint   specs    QC      Test      Monitor  Pack       Catalog
 Budget      Approve  Ship    Approve   Incident Document   Reuse eval
 Staff req   Revise           Checklist Metrics  Checklist  Asset update
```

### 3.3 Event Sub-Lifecycle

```
SCHEDULE → CONFIRM → PREPARE → EXECUTE → CLOSE
    │          │         │         │         │
 Date/time   Venue     Call sht  Run show  Attendance
 Capacity    Permits   Tech sht  Activities Post-survey
 Budget      Insurance Crew asgn Incidents  Photo/video
 Activities  Catering  Rehearsal Consumable ROI calc
```

### 3.4 Asset Lifecycle

```
ACQUIRE → RECEIVE → STORE → ASSIGN → DEPLOY → OPERATE → RETURN → MAINTAIN → RETIRE/REUSE
    │         │        │        │         │         │         │         │           │
 PO/Rental  Inspect  Catalog  Reserve   Ship     Track     Inspect   Repair     Decommission
 Contract   Barcode  Location Checkout  Install  Condition Pack      Calibrate  Dispose
 Insurance  Photo    Zone     Project   Test     Usage     Ship      Upgrade    Re-catalog
                                                           Damage?              Repurpose
```

---

## 4. Structural Findings

### 4.1 SSOT Violations — Duplicate Table Pairs

| Generic Table (001/002) | Production Table (003) | Overlap | Recommendation |
|--------------------------|------------------------|---------|----------------|
| `tasks` | `production_tasks` | 85% field overlap | **Merge into `tasks`** with added `department`, `phase`, `acceptance_criteria` columns |
| `milestones` | `production_milestones` | 90% field overlap | **Merge into `milestones`** with added `phase`, `payment_trigger` columns |
| `budget_line_items` | `production_budget_lines` | 70% overlap | **Keep both** — `budget_line_items` is estimate-level, `production_budget_lines` is execution-level. Add clear naming: `budget_estimates` vs `budget_actuals` |
| `expenses` | `production_expenses` | 80% overlap | **Merge into `expenses`** with added `department`, `phase` columns |
| `time_entries` | `production_time_entries` | 75% overlap | **Merge into `time_entries`** with added `shift_id`, `overtime_hours`, `double_time_hours` columns |
| `sops` | `production_sops` | 60% overlap | **Keep both** — org-level SOPs vs project-scoped SOPs. Rename to `org_sops` and `project_sops` |
| `sop_acknowledgments` | (embedded in production_sops) | Partial | Consolidate acknowledgment tracking |

### 4.2 Scope Bleed Risks

| Risk | Location | Impact | Mitigation |
|------|----------|--------|------------|
| Tasks belong to both `tasks` and `production_tasks` | Schema 001 + 003 | Engineers don't know which table to write to | Consolidate tables |
| Budget tracked in 3 places | `budget_line_items`, `production_budget_lines`, `budgets` | Finance reconciliation impossible without manual mapping | Define clear ownership: estimates vs actuals vs versions |
| Crew scheduling in 2 models | `shifts` (001) vs `crew_shifts` (003) | Double-booking risk | Deprecate `shifts`, use `crew_shifts` |
| Vendor compliance tracked in 2 places | `vendor_compliance_docs` (008) vs `worker_compliance_docs` (011) | Stale data risk | Worker compliance is canonical; vendor compliance bridges to it |

### 4.3 Approval Bottlenecks

| Approval Point | Current Implementation | Bottleneck Risk |
|---------------|------------------------|-----------------|
| SOW approval | `sow_status` enum includes `pending_approval` | No escalation or timeout |
| Budget approval | `budgets.status` has `pending_approval` | No approval threshold routing |
| PO approval | `purchase_orders.status` | No auto-approve below threshold |
| Expense approval | `expenses.status` / `production_expenses.status` | **Two approval queues** for same concept |
| Time entry approval | `time_entries.status` / `production_time_entries.status` | **Two approval queues** |
| Milestone approval | `milestones.status` / `production_milestones.status` | **Two approval queues** |
| Contract approval | `contracts.status` has `pending_review` | No counter-signature tracking |
| Change order | No dedicated table | **No formal process** — changes tracked in `sow_change_log` but no approval |

### 4.4 Budget Leakage Points

| Leakage Point | Description | Current Mitigation |
|---------------|-------------|--------------------|
| Unlinked expenses | `expenses` and `production_expenses` don't always reference `budget_line_items` | FK is optional (`budget_line_id` nullable) |
| No committed amount tracking | POs committed but not yet invoiced have no intermediate state | POs track `total_amount` but budget doesn't reflect commitments |
| Change orders without budget impact | SOW changes don't auto-recalculate budget | `recalculate_sow_total` exists but doesn't cascade to budget |
| Overtime not budget-gated | No alerts when labor costs exceed budget category | No budget guardrails on time entries |
| Consumable usage uncosted | `consumable_usage` tracks quantity but cost attribution to budget is manual | No auto-cost-attribution |

### 4.5 Version Control Conflicts

| Entity | Versioning Support | Gap |
|--------|-------------------|-----|
| Budget | `budgets.version` integer | ✅ Versioned — but no diff tracking between versions |
| SOW | `sow_change_log` immutable trail | ✅ Good — audit trail exists |
| Contract | `amendmentIds` array | ⚠️ Amendments referenced but no amendment table |
| Creative assets | None | ❌ No version history for design files |
| SOPs | `sops.version` / `production_sops.version` | ⚠️ Version number but no prior version storage |
| Call Sheets | None | ❌ Published once, no revision trail |
| Tech Sheets | None | ❌ Same issue |

### 4.6 Asset Tracking Gaps

| Gap | Description |
|-----|-------------|
| No digital asset management | Photos, videos, renders, design files have no structured tracking |
| No asset catalog/template | Cannot define "standard booth kit" as reusable template |
| No cross-project asset visibility | Assets assigned per-project but no portfolio-level availability view |
| No depreciation tracking | `current_value` field exists but no depreciation schedule |
| No rental return reminders | `rental_return_date` exists but no automated alerting |
| Consumable reorder not automated | `reorder_point` exists but no trigger to generate PO |

### 4.7 Cross-Functional Communication Breakdowns

| Breakdown | Between | Impact |
|-----------|---------|--------|
| Task assignment unclear | PM vs Department leads | Which task table does each role use? |
| Budget vs actual reconciliation | Finance vs Operations | Three expense sources, no unified view |
| Vendor communication fragmented | PM vs Vendor | `vendor_communications` exists but not linked to specific POs/work orders contextually |
| Crew scheduling vs resource planning | Operations vs HR | `crew_shifts` vs `resource_bookings` serve overlapping purposes |
| Approval routing undefined | All departments | `approval_workflows` table exists but workflow instances don't auto-route by dollar amount or department |

---

## 5. Future-State System Architecture

### 5.1 Design Principles

1. **One Table Per Concept** — Eliminate all duplicate table pairs through consolidation
2. **Additive Columns Over Separate Tables** — Extend generic tables with domain-specific nullable columns rather than creating parallel production-specific tables
3. **Junction Tables Over JSONB Arrays** — All many-to-many relationships use proper junction tables for queryability
4. **Hierarchical Budget Roll-Up** — Budget at any level (project/activation/event) automatically aggregates from children
5. **Universal Approval Engine** — Single `approval_workflows` + `workflow_instances` pipeline for all approval types
6. **Asset Catalog Pattern** — Separate asset definitions (catalog) from asset instances (inventory) from asset assignments (usage)
7. **Event-Driven State Machine** — All status transitions emit events; no implicit state changes

### 5.2 Consolidated Entity Model

```
┌─────────────────────────────────────────────────────────────────┐
│                        ORGANIZATION                              │
│  (tenant isolation, brand config, feature flags)                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐      ┌─────▼─────┐     ┌─────▼──────┐
   │ PROJECT  │      │  ASSET    │     │  WORKER    │
   │ (hub)    │      │  CATALOG  │     │  PROFILE   │
   └────┬─────┘      └─────┬─────┘     └─────┬──────┘
        │                  │                  │
   ┌────▼────────────┐  ┌──▼──────┐    ┌─────▼──────┐
   │ LOCATION        │  │ ASSET   │    │ CREW       │
   │ (venue/market)  │  │ (inst.) │    │ MEMBER     │
   └────┬─────────┬──┘  └──┬──────┘    └────────────┘
        │         │         │           ┌────────────┐
   ┌────▼────┐  ┌─▼───────┐│           │ VENDOR     │
   │ACTIVATION│  │ EVENT   │├───────────└────────────┘
   │(campaign)│  │(date)   ││
   └────┬─────┘  └──┬──────┘│
        │           │       │
   ┌────▼────┐   ┌──▼──┐   │     ┌──────────┐
   │ACTIVITY │   │CREW │   │     │ DIGITAL  │
   │(segment)│   │SHIFT│   │     │ ASSET    │
   └─────────┘   └─────┘   │     │ (DAM)    │
                            │     └──────────┘
                     ┌──────▼────────┐
                     │ ASSET         │
                     │ ASSIGNMENT    │
                     └───────────────┘

CROSS-CUTTING SERVICES:
┌────────────┐ ┌──────────┐ ┌────────────┐ ┌──────────────┐
│ UNIFIED    │ │ UNIFIED  │ │ UNIVERSAL  │ │ CHANGE ORDER │
│ TASKS      │ │ BUDGET   │ │ APPROVAL   │ │ ENGINE       │
│ (merged)   │ │ (merged) │ │ ENGINE     │ │ (new)        │
└────────────┘ └──────────┘ └────────────┘ └──────────────┘

┌────────────┐ ┌──────────┐ ┌────────────┐ ┌──────────────┐
│ UNIFIED    │ │ UNIFIED  │ │ POST-EVENT │ │ ASSET        │
│ MILESTONES │ │ EXPENSES │ │ METRICS    │ │ CATALOG      │
│ (merged)   │ │ (merged) │ │ (new)      │ │ (new)        │
└────────────┘ └──────────┘ └────────────┘ └──────────────┘
```

### 5.3 Table Consolidation Plan

#### Phase 1: Merge Duplicate Tables (P0 — Migration 012)

| Current Tables | Consolidated Table | Strategy |
|---------------|-------------------|----------|
| `tasks` + `production_tasks` | `tasks` | Add `department`, `phase`, `acceptance_criteria`, `percent_complete`, `blockers`, `impact_if_delayed`, `reviewer_id`, `vendor_id` to `tasks`. Migrate `production_tasks` data. Drop `production_tasks`. |
| `milestones` + `production_milestones` | `milestones` | Add `phase`, `payment_trigger`, `payment_amount`, `is_critical_path`, `client_facing` to `milestones`. Migrate and drop. |
| `shifts` + `crew_shifts` | `crew_shifts` | `crew_shifts` is superset. Add missing fields from `shifts`. Migrate and deprecate `shifts`. |

#### Phase 2: Extend & Consolidate (P1 — Migration 013)

| Current Tables | Consolidated Table | Strategy |
|---------------|-------------------|----------|
| `expenses` + `production_expenses` | `expenses` | Add `department`, `phase`, `currency`, `payment_method`, `reimbursable`, `justification`. Migrate and drop. |
| `time_entries` + `production_time_entries` | `time_entries` | Add `shift_id`, `overtime_hours`, `double_time_hours`, `overtime_rate`, `double_time_rate`, `total_pay`. Migrate and drop. |
| `budget_line_items` + `production_budget_lines` | Rename to `budget_estimates` + `budget_actuals` | Clarify purpose. `budget_estimates` = planned. `budget_actuals` = committed/spent with PO linkage. |

#### Phase 3: New Tables (P2 — Migration 014)

| Table | Purpose |
|-------|---------|
| `asset_catalog_items` | Reusable asset definitions (templates for standard kits) |
| `asset_catalog_components` | Components within a catalog item |
| `digital_assets` | DAM — creative files, renders, photos, videos |
| `digital_asset_versions` | Version history for creative files |
| `change_orders` | Formal change requests with scope/budget/schedule impact |
| `change_order_impacts` | Line-item impacts per change order |
| `post_event_metrics` | Structured event outcome data |
| `post_event_surveys` | Attendee feedback |
| `activation_assets` | Junction: Activation ↔ Asset |
| `event_assets` | Junction: Event ↔ Asset |
| `activity_assets` | Junction: Activity ↔ Asset |
| `activity_consumables` | Junction: Activity ↔ Consumable |
| `contract_amendments` | Formal amendment records (currently just ID array) |
| `budget_commitments` | PO-based committed spend before invoice |

### 5.4 State Machine Definitions

Each hierarchy entity follows a defined state machine with explicit transitions:

#### Project States
```
draft → planning → pre_production → in_production → wrap → completed
  │         │            │               │            │
  └→ cancelled ←─────────┴───────────────┘            │
                                                       └→ archived
  Any state → on_hold → (return to previous state)
```

#### Activation States
```
planning → design → build → installed → active → struck → stored
  │          │        │         │          │        │
  └→ cancelled ←──────┴─────────┘          │        └→ disposed
                                           └→ damaged → repair → stored
```

#### Event States
```
scheduled → confirmed → in_progress → completed
  │            │                          │
  └→ cancelled └→ postponed → rescheduled  └→ reviewed
```

#### Task States
```
backlog → todo → in_progress → review → completed
  │        │         │           │
  │        └→ blocked ┘           └→ revision_requested → in_progress
  └→ cancelled
```

#### Asset Assignment States
```
reserved → checked_out → in_use → returned
  │            │            │         │
  └→ cancelled  └→ damaged   └→ lost   └→ damaged_on_return
```

---

## 6. Entity Relationship Model (3NF Compliant)

### 6.1 3NF Compliance Audit — Current State

| Table | 1NF | 2NF | 3NF | Violations |
|-------|-----|-----|-----|------------|
| `projects` | ✅ | ✅ | ⚠️ | `budget_planned`/`budget_actual` are derived from budget line items |
| `tasks` | ✅ | ✅ | ✅ | Clean |
| `production_tasks` | ✅ | ✅ | ✅ | Clean but **duplicates `tasks`** |
| `activations` | ✅ | ✅ | ⚠️ | `components` JSONB embeds what should be a separate table |
| `events` | ✅ | ✅ | ⚠️ | `run_of_show` JSONB embeds what should be `run_of_show_items` table |
| `activities` | ✅ | ✅ | ⚠️ | `asset_ids`, `consumable_ids` as arrays violate 1NF — need junction tables |
| `locations` | ✅ | ✅ | ⚠️ | `load_in_windows`/`load_out_windows` JSONB embeds temporal data |
| `assets` | ✅ | ✅ | ✅ | Clean |
| `budgets` | ✅ | ✅ | ⚠️ | `total_budget`/`total_actual`/`total_variance` are derived aggregates |
| `scopes_of_work` | ✅ | ✅ | ⚠️ | `total_value` is derived (trigger-maintained, acceptable) |
| `crew_members` | ✅ | ✅ | ⚠️ | `certifications` JSONB in types but separate table in schema — types out of sync |
| `vendors` | ✅ | ✅ | ⚠️ | `average_rating` is derived from `vendor_reviews` |
| `warehouses` | ✅ | ✅ | ⚠️ | `zones` as JSONB should be separate `warehouse_zones` table |
| `contracts` | ✅ | ✅ | ⚠️ | `amendment_ids` array — no `contract_amendments` table |

### 6.2 Future-State 3NF Entity Relationships

#### Core Hierarchy (Normalized)

```
organizations ─1:N─→ projects
projects ─1:N─→ locations
projects ─1:N─→ activations
locations ─1:N─→ activations
activations ─1:N─→ events
projects ─1:N─→ events (direct, for non-activation events)
locations ─1:N─→ events (direct, for venue-level events)
events ─1:N─→ activities
activations ─1:N─→ activities (via activation_id)
```

#### Task & Work Management (Consolidated)

```
projects ─1:N─→ tasks (unified)
tasks ─1:N─→ tasks (self-ref subtasks via parent_id)
tasks ─N:1─→ milestones (unified)
tasks ─N:1─→ sow_deliverables
tasks ─1:N─→ task_dependencies
milestones ─1:N─→ tasks
milestones ─N:1─→ projects
```

#### Financial (Consolidated)

```
projects ─1:N─→ budgets (versioned)
budgets ─1:N─→ budget_line_items (estimates)
projects ─1:N─→ budget_commitments (PO-based)
projects ─1:N─→ expenses (unified)
expenses ─N:1─→ budget_line_items
projects ─1:N─→ time_entries (unified)
time_entries ─N:1─→ tasks
time_entries ─N:1─→ crew_shifts
```

#### Asset & Inventory (Extended)

```
asset_catalog_items ─1:N─→ asset_catalog_components
asset_catalog_items ─1:N─→ assets (instances from catalog)
assets ─1:N─→ asset_assignments
assets ─1:N─→ maintenance_records
activation_assets (junction) ←─ activations + assets
event_assets (junction) ←─ events + assets
activity_assets (junction) ←─ activities + assets
digital_assets ─1:N─→ digital_asset_versions
digital_assets ─N:1─→ projects
```

#### Change Management (New)

```
projects ─1:N─→ change_orders
change_orders ─1:N─→ change_order_impacts
change_orders ─N:1─→ scopes_of_work
change_orders ─→ approval_workflows (via workflow_instances)
```

#### Post-Event (New)

```
events ─1:N─→ post_event_metrics
events ─1:N─→ post_event_surveys
projects ─1:1─→ post_event_metrics (aggregated)
```

### 6.3 Who/What/When/Where/Why/How/If-Then Coverage per Entity

| Entity | Who | What | When | Where | Why | How | If/Then |
|--------|-----|------|------|-------|-----|-----|---------|
| Project | ✅ client, PM, team | ✅ scope, deliverables | ✅ start/end, phases | ✅ locations[] | ✅ objectives | ✅ budget, phases | ✅ risk level, contingency |
| Location | ✅ contact, venue rep | ✅ capacity, amenities | ✅ access dates | ✅ address, coords | ✅ purpose | ✅ cost, power | ✅ insurance, permits |
| Activation | ✅ lead, team, vendors | ✅ dimensions, components | ✅ install/strike dates | ✅ floor position, zone | ✅ experience goals | ✅ budget, power, staffing | ✅ weather contingency |
| Event | ✅ producer, stage mgr | ✅ ROS, description | ✅ date, doors/start/end | ✅ specific location | ✅ purpose | ✅ budget | ✅ rain plan, cancel policy |
| Activity | ✅ lead, staff | ✅ description, requirements | ✅ start/end, frequency | ✅ specific location | ✅ objective | ✅ instructions, equipment | ✅ contingency plan |
| Asset | ✅ owner, custodian | ✅ name, specs, category | ✅ purchase, warranty, maint | ✅ home/current location | ✅ ownership, condition | ✅ cost, rental rate | ✅ cert required, maint schedule |
| Task | ✅ assignee, reviewer | ✅ title, deliverables, criteria | ✅ start/due/completed | ✅ location, activation | ✅ priority, impact | ✅ status, blockers | ✅ dependencies |
| Budget | ✅ preparer, approver | ✅ line items | ✅ effective date | — | ✅ notes | ✅ totals, currency | ✅ contingency%, markup% |
| Expense | ✅ submitter, approver | ✅ description, category | ✅ expense/submit/approve dates | — | ✅ justification | ✅ amount, payment method | ✅ receipt, reimbursable |
| Time Entry | ✅ crew member, approver | ✅ description | ✅ date, start/end, break | — | ✅ task linkage | ✅ rates, total pay | ✅ notes |
| Shipment | ✅ carrier, driver, coord | ✅ items, weight | ✅ pickup/delivery dates | ✅ origin/destination | ✅ priority | ✅ status, tracking | ✅ liftgate, appointment |
| Incident | ✅ reporter, witnesses | ✅ title, description, actions | ✅ occurred/reported/resolved | ✅ location | ✅ severity, root cause | ✅ status, resolution | ✅ insurance claim, cost |
| **Digital Asset (NEW)** | ✅ creator, approver | ✅ file, metadata, tags | ✅ created, approved | ✅ project, activation | ✅ purpose, usage rights | ✅ file type, dimensions | ✅ license expiry |
| **Change Order (NEW)** | ✅ requester, approver | ✅ description, scope delta | ✅ requested, decided | ✅ affected entities | ✅ justification | ✅ budget/schedule impact | ✅ approval threshold |
| **Post-Event Metrics (NEW)** | ✅ recorded by | ✅ metric type, value | ✅ event date, captured date | ✅ event/activation | ✅ KPI alignment | ✅ measurement method | ✅ target vs actual |

---

## 7. Hierarchy Dependency Matrix

### 7.1 Entity Dependency Direction (Must Create Parent Before Child)

```
Organization
  └→ Project (required)
       ├→ Location (optional — projects can have no location initially)
       │    └→ Activation (requires location)
       │         └→ Event (requires activation OR direct project+location)
       │              └→ Activity (requires event)
       ├→ Task (requires project; optional location/activation/event)
       ├→ Milestone (requires project)
       ├→ Budget (requires project)
       ├→ SOW (requires project)
       ├→ Contract (optional project — can be org-level)
       └→ Shipment (requires project)
```

### 7.2 Deletion Cascade Rules

| Parent | On Delete | Children Affected | Rule |
|--------|-----------|-------------------|------|
| Project | Soft delete | All children | Cascade soft delete to locations, activations, events, tasks, budgets |
| Location | Soft delete | Activations, events at location | Cascade soft delete |
| Activation | Soft delete | Events under activation, asset assignments | Cascade soft delete; return assets to pool |
| Event | Soft delete | Activities, crew shifts | Cascade soft delete |
| Activity | Soft delete | Activity-asset junctions | Remove junction rows |
| Asset | Soft delete | Asset assignments | Mark assignments as returned |
| Budget | Archive | Budget line items | Cascade archive; lock version |
| SOW | Archive | SOW deliverables | Cascade archive |

### 7.3 Cross-Entity Impact Matrix

| Action | Impacts → Project | Impacts → Budget | Impacts → Schedule | Impacts → Assets | Impacts → Crew |
|--------|-------------------|------------------|--------------------|--------------------|----------------|
| Add Location | progress recalc | budget roll-up | new timeline block | — | — |
| Add Activation | progress recalc | budget roll-up | new timeline block | asset reservation | staffing req |
| Add Event | progress recalc | budget roll-up | new timeline entry | asset assignment | crew shifts |
| Cancel Event | progress recalc | budget release | timeline remove | asset return | shift cancel |
| Change Order | scope update | budget adjust | schedule shift | possible realloc | possible reassign |
| Asset Damage | — | repair expense | possible delay | status change | — |
| Crew No-Show | — | — | possible delay | — | backfill needed |
| Budget Overrun | risk escalation | alert/freeze | — | — | — |
| Milestone Missed | status change | — | critical path shift | — | — |

### 7.4 Asset Inheritance Logic

| Scope | Definition | Behavior |
|-------|-----------|----------|
| **Global Asset** | `asset_assignments.project_id IS NULL` | Available to any project; checked out per-project |
| **Project Asset** | `asset_assignments.project_id = X` | Dedicated to project; visible to all activations within project |
| **Activation Asset** | `activation_assets.activation_id = X` | Assigned to specific activation; can move between events within activation |
| **Event Asset** | `event_assets.event_id = X` | Locked to specific event date; cannot be used elsewhere during event |

**Inheritance Rule:** An asset at a higher scope is implicitly available to lower scopes unless explicitly reserved elsewhere. Conflict detection runs on: `asset_id + date_range + status != 'returned'`.

---

## 8. Reusability & Modularity Framework

### 8.1 Asset Catalog Pattern (New)

Enable cross-project reuse of standard configurations:

```
asset_catalog_items
├── id, name, description, category
├── default_dimensions, default_specifications (JSONB)
├── estimated_cost, typical_lead_time
├── reuse_count (derived), last_used_project_id
└── status: active | deprecated | archived

asset_catalog_components
├── id, catalog_item_id (FK)
├── component_name, component_type
├── quantity, unit_cost
├── is_consumable (boolean)
└── substitute_catalog_component_id (optional)
```

**Use Case:** "Standard 10x10 Booth" catalog item contains 4 wall panels, 1 counter, 2 monitor mounts, LED strip lighting. Selecting this catalog item during activation planning auto-generates the component list, cost estimate, and procurement checklist.

### 8.2 Activity Template Pattern

Enable reuse of programmed segments across events:

```
activity_templates
├── id, name, type, description
├── default_duration_minutes
├── default_staffing_requirements (JSONB)
├── default_equipment_needed (JSONB)
├── default_consumables (JSONB)
├── instructions
├── category: engagement | demo | performance | workshop | photo_op
└── times_used (derived)
```

**Use Case:** "Product Sampling Station" activity template with standard staffing (2 brand ambassadors), equipment (sampling table, cooler, signage), and consumable estimates (500 samples/day). Drag into any event to auto-populate.

### 8.3 Project Template Enhancement

Existing `project_templates` table covers phases and tasks. Extend to include:

| Extension | Purpose |
|-----------|---------|
| `template_locations` | Standard venue types and requirements |
| `template_activations` | Standard activation configurations |
| `template_budgets` | Standard budget category allocations |
| `template_milestones` | Standard milestone gates |
| `template_checklists` | Standard checklists per phase |

### 8.4 Modular Reuse Rules

| Reusable Entity | Scope | Copy vs Reference | Version Handling |
|----------------|-------|-------------------|------------------|
| Asset Catalog Item | Organization-wide | Reference (instantiate) | Catalog versioned; instances independent |
| Activity Template | Organization-wide | Copy (fork) | Template versioned; instances independent |
| Project Template | Organization-wide | Copy (fork) | Template versioned |
| SOW Template | Organization-wide | Copy (fork) | Template versioned |
| Checklist Template | Organization-wide | Copy (fork) | Template versioned |
| Brand Kit | Organization-wide | Reference | Single source |
| Rate Card | Organization-wide | Reference | Effective-dated |
| Approval Workflow | Organization-wide | Reference | Workflow versioned |

---

## 9. Budget Roll-Up Schema

### 9.1 Budget Hierarchy

```
Organization (portfolio view)
  └→ Project Budget (master)
       ├→ Activation Budgets (by activation)
       │    └→ Event Budgets (by event)
       ├→ Department Budgets (by department enum)
       ├→ Phase Budgets (by production_phase enum)
       └→ Vendor Budgets (by vendor)
```

### 9.2 Budget Aggregation Model

```sql
-- Budget flows DOWN (allocation)
project.total_budget = SUM(budget_line_items.budgeted_amount)
activation.budget = SUM(budget_line_items WHERE activation_id = X)
event.budget = SUM(budget_line_items WHERE event_id = X)

-- Costs flow UP (actuals)
budget_line_items.actual_amount = SUM(expenses WHERE budget_line_id = X)
                                 + SUM(time_entries.total_pay WHERE budget_line_id = X)
                                 + SUM(consumable_usage.quantity * unit_cost WHERE budget_line_id = X)

-- Commitments sit BETWEEN (PO-based)
budget_line_items.committed_amount = SUM(purchase_order_items WHERE budget_category_id = X AND status NOT IN ('cancelled','received'))
```

### 9.3 Budget Status Calculations

| Metric | Formula | Alert Threshold |
|--------|---------|-----------------|
| **Variance** | budgeted - actual | > 10% negative |
| **Burn Rate** | actual / elapsed_time_ratio | > 1.2x expected |
| **Commitment Ratio** | committed / budgeted | > 0.9 (90% committed) |
| **Available** | budgeted - committed - actual | < 0 (over-committed) |
| **Forecast at Completion** | actual + (remaining_scope * avg_unit_cost) | > budgeted * 1.1 |

### 9.4 Cost Attribution Logic

| Cost Source | Attribution Path | Budget Line Resolution |
|-------------|-----------------|----------------------|
| Time Entry | `time_entry.task_id → task.budget_line_id` OR `time_entry.budget_line_id` direct | Task-based or direct |
| Expense | `expense.budget_line_id` direct | Direct |
| PO Item | `po_item.budget_category_id` | Category-based |
| Consumable Usage | `consumable_usage.consumable_id → consumable.unit_cost` × quantity | Auto-calculated |
| Rental | `asset.daily_rental_rate` × `asset_assignment.duration_days` | Auto-calculated |
| Overhead | `project.overhead_rate` × direct_costs | Percentage-based |
| Markup | `project.markup_rate` × (direct_costs + overhead) | Percentage-based |

### 9.5 Multi-Currency Support

```
All monetary fields store:
- amount (numeric)
- currency (ISO 4217 code, default from org settings)

Exchange rate resolution:
- budget_line_items: locked at budget approval date
- expenses: spot rate at expense date
- invoices: rate at invoice date
- reports: configurable (spot, budget, average)
```

---

## 10. Risk Mitigation Framework

### 10.1 Risk Categories

| Category | Source | Detection | Response |
|----------|--------|-----------|----------|
| **Budget** | Cost overrun, scope creep, FX fluctuation | Budget alerts at 80%/90%/100% thresholds | Freeze POs, escalate to PM, require change order |
| **Schedule** | Task delays, vendor late delivery, weather | Critical path monitoring, milestone gates | Auto-reschedule dependents, notify stakeholders |
| **Resource** | Crew no-show, asset damage, vendor default | Availability monitoring, backup roster | Auto-notify backup crew, trigger reorder |
| **Compliance** | Expired certifications, missing permits, insurance lapse | Expiry tracking with 30/14/7 day warnings | Block deployment, notify compliance officer |
| **Safety** | Incident occurrence, near-miss patterns | Incident reporting, trend analysis | Auto-create follow-up tasks, escalate if severity ≥ major |
| **Quality** | Failed inspections, client complaints | Checklist completion tracking, approval rejections | Block phase transition, require remediation |
| **Vendor** | Performance decline, compliance gap, communication breakdown | Review scores, compliance doc status | Restrict new POs, trigger vendor review meeting |

### 10.2 Automated Risk Signals

| Signal | Trigger | Data Source | Action |
|--------|---------|-------------|--------|
| Budget Yellow | actual ≥ 80% of budgeted for any category | `budget_line_items` | Notification to PM + Finance |
| Budget Red | actual ≥ 100% of budgeted | `budget_line_items` | PO freeze on category, escalation |
| Schedule Slip | task.due_date passed, status ≠ completed | `tasks` | Auto-flag, recalculate critical path |
| Certification Expiring | cert.expiry_date within 30 days | `certifications`, `worker_compliance_docs` | Notification to crew member + supervisor |
| Asset Overdue | assignment.expected_return_date passed | `asset_assignments` | Notification to custodian + ops |
| Vendor Rating Drop | avg rating < 3.0 over last 5 reviews | `vendor_reviews` | Flag for review, restrict new work orders |
| Approval Stale | workflow_instance pending > 48 hours | `workflow_instances` | Escalation notification |
| Change Order Backlog | > 3 pending change orders on project | `change_orders` | PM escalation notification |

### 10.3 Phase Gate Controls

Each production phase transition requires:

| Gate | From → To | Required Checks |
|------|-----------|-----------------|
| G1 | discovery → design | Project charter approved, budget v1 created, team assigned |
| G2 | design → pre_production | Creative approved, SOW signed, locations confirmed |
| G3 | pre_production → procurement | Budget approved, milestones defined, task breakdown complete |
| G4 | procurement → fabrication | POs issued for all long-lead items, vendor contracts signed |
| G5 | fabrication → logistics | All items QC-passed, packing lists complete, shipping booked |
| G6 | logistics → load_in | All shipments delivered, venue access confirmed, permits obtained |
| G7 | load_in → rehearsal | Installation checklist complete, safety inspection passed |
| G8 | rehearsal → show | Run-through completed, all systems tested, call sheets distributed |
| G9 | show → strike | Event completed, incident reports filed, client sign-off |
| G10 | strike → load_out | Strike checklist complete, asset inventory reconciled |
| G11 | load_out → wrap | All assets returned/accounted, damage reports filed |
| G12 | wrap → completed | Final invoice sent, P&L closed, case study drafted, post-mortem complete |

---

## 11. UI/UX Simplification Principles

### 11.1 Role-Based View Optimization

Each role sees a tailored interface that surfaces only relevant data:

| Role | Primary Views | Hidden/Secondary | Command Bar Actions |
|------|--------------|------------------|---------------------|
| **Executive/PM** | Dashboard, Portfolio, Reports, Scenarios | Asset details, Shift management | Create project, Approve budget, View P&L |
| **Producer** | Project detail, Schedule, Call sheets, Milestones | Rate cards, Vendor compliance | Create event, Generate call sheet, Approve milestone |
| **Creative** | Brand kit, Decks, Approvals, Digital assets | Budget details, Payroll | Upload creative, Submit for approval, Create version |
| **Operations** | Crew, Assets, Shipments, Dispatch, Checklists | Pipeline, Proposals | Assign crew, Check out asset, Create shipment |
| **Finance** | Budgets, Invoices, Expenses, Job costing, P&L | Creative assets, Run of show | Approve expense, Issue PO, Generate invoice |
| **Vendor** | Portal: Work orders, Invoices, Compliance | Internal data | Submit bid, Upload invoice, Update compliance |
| **Client** | Portal: Progress, Approvals, Documents | Internal operations | Approve deliverable, View progress, Download report |

### 11.2 Progressive Disclosure Pattern

```
Level 1 — Portfolio Dashboard (all projects, KPI cards)
  └→ Level 2 — Project Overview (phases, budget, team, timeline)
       └→ Level 3 — Entity Lists (tasks, events, activations filtered to project)
            └→ Level 4 — Entity Detail (full who/what/when/where/why/how)
                 └→ Level 5 — Edit/Action (inline edit, modal forms, wizards)
```

**Rule:** Each drill-down level adds detail but never forces the user to navigate more than 3 clicks from dashboard to any actionable item.

### 11.3 Navigation Consolidation

Current navigation has **12 sections / 58 items**. This creates cognitive overload. Recommended consolidation:

| Current Sections | Consolidated Section | Items |
|-----------------|---------------------|-------|
| Command Center (6) | **Home** (4) | Dashboard, Calendar, Reports, Search |
| Commercial (5) | **Pipeline** (4) | Leads, Deals, Contacts, Service Requests |
| Production (7) | **Production** (5) | Projects, Schedule, Tasks, SOW, Milestones |
| Resources (6) + Workforce (3) | **People** (5) | Workforce, Crew, Time Tracking, Time Off, Resource Planner |
| Logistics (2) + part of Resources | **Logistics** (4) | Assets, Inventory, Shipments, Fleet |
| Creative (3) | **Creative** (3) | Brand Kit, Decks, Digital Assets |
| Documents (5) | **Documents** (4) | Documents, Contracts, Call Sheets, Tech Sheets |
| Finance (12) | **Finance** (6) | Budgets, Invoices, Expenses, Payments, Job Costing, Procurement |
| Vendor Management (6) | **Vendors** (4) | Directory, Work Orders, Compliance, Reviews |
| Safety & Compliance (3) | **Compliance** (3) | Incidents, Approvals, Automations |
| Portals (2) + Organization (7) | **Settings** (4) | Organization, Roles, Integrations, Portals |

**Result:** 12 sections → 11 sections, 58 items → 46 items (21% reduction). Every item maps to a clear user role and workflow.

### 11.4 Contextual Panels Pattern

Instead of navigating away for related data, use slide-over panels:

| Context | Panel Content | Trigger |
|---------|--------------|---------|
| Task row click | Task detail + subtasks + time entries + comments | Row click in any task list |
| Budget line hover | Committed POs + actual expenses + variance chart | Hover/click on budget row |
| Crew member card | Availability calendar + certifications + active shifts | Card click in crew list |
| Asset card | Assignment history + maintenance + current location | Card click in asset list |
| Event row | Run of show + crew assignments + activity list | Row click in event list |

### 11.5 Unified Search & Command Bar

Single `⌘K` command bar supporting:

| Command Type | Examples |
|-------------|----------|
| **Navigate** | "Go to project Acme Tour", "Open budgets" |
| **Search** | "Find asset barcode A-12345", "Search crew John" |
| **Create** | "New task on Acme Tour", "New expense" |
| **Action** | "Approve PO-2024-001", "Check out asset A-12345" |
| **Report** | "Budget vs actual for Acme Tour", "Crew utilization this month" |

### 11.6 Performance UX Standards

| Interaction | Target | Implementation |
|------------|--------|----------------|
| Page load | < 200ms | Skeleton loaders, route prefetching |
| List rendering | < 100ms for 100 rows | Virtual scrolling, pagination |
| Form submission | Optimistic UI | Immediate local state update, background sync |
| Search results | < 300ms | Debounced input, indexed search |
| Dashboard refresh | < 500ms | Cached aggregations, incremental updates |
| File upload | Progress indicator | Chunked upload with progress bar |

---

## 12. Automation & AI Augmentation Opportunities

### 12.1 Workflow Automation (Rule-Based)

| Automation | Trigger | Action | Complexity |
|-----------|---------|--------|------------|
| **Auto-approve expenses** | `expense.amount < $500 AND submitter.role = 'pm'` | Set status to approved | Low |
| **Auto-approve POs** | `po.total < org.auto_approve_threshold` | Set status to approved, notify vendor | Low |
| **Milestone reminder** | `milestone.due_date - 7 days` | Notify owner + approvers | Low |
| **Certification expiry** | `cert.expiry_date - 30 days` | Notify crew member + HR | Low |
| **Consumable reorder** | `consumable.qty_on_hand <= reorder_point` | Generate draft PO to preferred vendor | Medium |
| **Rental return reminder** | `asset.rental_return_date - 3 days` | Notify ops + create return shipment task | Low |
| **Budget alert cascade** | Budget threshold crossed | Freeze category POs, notify PM + Finance + Exec | Medium |
| **Phase gate check** | Phase transition requested | Validate all gate requirements, block or approve | Medium |
| **Crew backfill** | `crew_shift.status = 'no_show'` | Notify backup roster, create urgent shift posting | Medium |
| **Invoice matching** | Invoice received for PO | Auto-match line items, flag variances > 5% | Medium |
| **SOW change tracking** | SOW field modified | Auto-log to `sow_change_log`, notify stakeholders | Low |
| **Post-event checklist** | `event.status = 'completed'` | Auto-generate post-event checklist from template | Low |

### 12.2 AI Augmentation (ML/LLM-Powered)

| Capability | Input | Output | Value |
|-----------|-------|--------|-------|
| **Budget Forecasting** | Historical project budgets, current spend rate | Predicted final cost, risk-adjusted range | Proactive budget management |
| **Schedule Optimization** | Task durations, dependencies, resource availability | Optimized schedule with critical path | Reduced idle time |
| **Crew Matching** | Project requirements (skills, certs, location) + crew profiles | Ranked crew recommendations | Faster staffing |
| **Vendor Selection** | RFQ requirements + vendor history + ratings | Ranked vendor shortlist with rationale | Better procurement |
| **Risk Prediction** | Project attributes, historical incident data | Risk score per category with mitigation suggestions | Proactive risk management |
| **Document Generation** | Project data + templates | Auto-drafted call sheets, tech sheets, reports | Time savings |
| **Photo/Asset Tagging** | Uploaded photos from events | Auto-tagged with project, location, activation, asset IDs | DAM efficiency |
| **Anomaly Detection** | Time entries, expenses | Flagged outliers (e.g., 20hr day, $5000 lunch expense) | Fraud/error detection |
| **Natural Language Reporting** | "How is Acme Tour tracking against budget?" | Conversational summary with data citations | Executive accessibility |
| **Change Impact Analysis** | Proposed change order | Estimated budget, schedule, and resource impact | Informed decision-making |

### 12.3 Automation Priority Matrix

| Automation | ROI | Effort | Priority |
|-----------|-----|--------|----------|
| Budget alerts | High | Low | **P0** |
| Certification expiry | High | Low | **P0** |
| Auto-approve small expenses | High | Low | **P0** |
| Milestone reminders | Medium | Low | **P0** |
| Phase gate validation | High | Medium | **P1** |
| Consumable reorder | Medium | Medium | **P1** |
| Invoice matching | High | Medium | **P1** |
| Crew matching AI | High | Large | **P2** |
| Budget forecasting AI | High | Large | **P2** |
| Document generation | Medium | Large | **P2** |
| NL reporting | Medium | Large | **P3** |

---

## 13. Who/What/When/Where/Why/How/If-Then Dataset Audit

### 13.1 Complete Dataset Coverage Matrix

Every table in the schema audited for 7W coverage:

| Dataset (Table) | Who | What | When | Where | Why | How | If/Then | Score |
|-----------------|-----|------|------|-------|-----|-----|---------|-------|
| `organizations` | ✅ owner | ✅ name, domain | ✅ created | — | ✅ industry | ✅ subscription | ✅ limits | 6/7 |
| `profiles` | ✅ user | ✅ name, role | ✅ created | — | ✅ role purpose | ✅ auth | ✅ permissions | 6/7 |
| `projects` | ✅ PM, client, team | ✅ scope, type | ✅ start/end | ✅ locations | ✅ objectives | ✅ budget, phases | ✅ risk, contingency | **7/7** |
| `locations` | ✅ contact | ✅ venue specs | ✅ access dates | ✅ address | ✅ purpose | ✅ cost, power | ✅ insurance, permits | **7/7** |
| `activations` | ✅ lead, team | ✅ type, dimensions | ✅ install/strike | ✅ zone, position | ✅ goals | ✅ budget, staff | ✅ contingency | **7/7** |
| `events` | ✅ producer | ✅ ROS, type | ✅ date/time | ✅ location | ✅ purpose | ✅ budget | ✅ rain plan | **7/7** |
| `activities` | ✅ lead, staff | ✅ type, desc | ✅ time range | ✅ location | ✅ objective | ✅ instructions | ✅ contingency | **7/7** |
| `tasks` | ✅ assignee | ✅ title, desc | ✅ dates | ⚠️ indirect | ✅ priority | ✅ status | ✅ dependencies | 6/7 |
| `production_tasks` | ✅ assignee, reviewer | ✅ deliverables | ✅ dates | ✅ location | ✅ priority, impact | ✅ status, blockers | ✅ dependencies | **7/7** |
| `milestones` | ✅ implicit (project) | ✅ name, desc | ✅ due date | — | ✅ approval req | ✅ status | — | 5/7 |
| `production_milestones` | ✅ owner, approvers | ✅ deliverables | ✅ due date | — | ✅ critical path | ✅ status | ✅ payment trigger | 6/7 |
| `assets` | ✅ owner, custodian | ✅ specs, category | ✅ purchase, maint | ✅ locations | ✅ ownership | ✅ cost, rates | ✅ cert required | **7/7** |
| `crew_members` | ✅ self | ✅ role, skills | ✅ hire date | ✅ home base | ✅ employment type | ✅ rates | ✅ union, background | **7/7** |
| `vendors` | ✅ contact | ✅ specialty, type | ✅ onboard date | ✅ service area | ✅ vendor type | ✅ rates, rating | ✅ compliance | **7/7** |
| `budgets` | ✅ preparer | ✅ line items | ✅ effective date | — | ✅ notes | ✅ totals | ✅ contingency% | 6/7 |
| `expenses` | ✅ submitter | ✅ desc, category | ✅ dates | — | ⚠️ implicit | ✅ amount | ✅ receipt | 5/7 |
| `production_expenses` | ✅ submitter, approver | ✅ desc, category | ✅ dates | — | ✅ justification | ✅ amount, method | ✅ reimbursable | 6/7 |
| `time_entries` | ✅ crew member | ✅ task linkage | ✅ date/time | — | ⚠️ implicit | ✅ hours, rate | — | 5/7 |
| `production_time_entries` | ✅ crew, approver | ✅ description | ✅ date/time | — | ✅ task linkage | ✅ rates, total | ✅ notes | 6/7 |
| `scopes_of_work` | ✅ preparer, client | ✅ scope, terms | ✅ dates | — | ✅ objectives | ✅ value, status | ✅ change control | 6/7 |
| `contracts` | ✅ signatory | ✅ scope, type | ✅ dates | — | ✅ value | ✅ status | ✅ auto-renew, termination | 6/7 |
| `rfqs` | ✅ requester, vendors | ✅ line items | ✅ dates | ✅ delivery loc | ✅ justification | ✅ status | ✅ budget code | **7/7** |
| `purchase_orders` | ✅ vendor, approver | ✅ line items | ✅ dates | ✅ delivery addr | ✅ justification | ✅ amount, terms | ✅ approval threshold | **7/7** |
| `shipments` | ✅ carrier, coord | ✅ items, weight | ✅ dates | ✅ origin/dest | ✅ priority | ✅ status, tracking | ✅ special handling | **7/7** |
| `incidents` | ✅ reporter, witnesses | ✅ description | ✅ occurred/reported | ✅ location | ✅ severity | ✅ status, resolution | ✅ insurance, cost | **7/7** |
| `work_orders` | ✅ vendor, creator | ✅ description | ✅ dates | ✅ location | ✅ priority | ✅ status, amount | ✅ billing type | **7/7** |
| `call_sheets` | ✅ crew list | ✅ schedule | ✅ date | ✅ venue | ✅ event purpose | ✅ logistics | ✅ weather, parking | **7/7** |
| `scenarios` | ✅ creator | ✅ variables, outcomes | ✅ dates | — | ✅ type | ✅ status | ✅ comparison basis | 6/7 |
| `worker_profiles` | ✅ self | ✅ classification | ✅ dates | ✅ location | ✅ lifecycle status | ✅ compliance score | ✅ assessment | **7/7** |
| `leads` | ✅ contact | ✅ company, type | ✅ created | — | ✅ source | ✅ score, status | ✅ budget range | 6/7 |
| `deals` | ✅ contact, owner | ✅ title, value | ✅ dates | — | ✅ stage | ✅ probability | ✅ next step | 6/7 |

### 13.2 Coverage Summary

- **7/7 (Full coverage):** 16 datasets — projects, locations, activations, events, activities, production_tasks, assets, crew_members, vendors, rfqs, purchase_orders, shipments, incidents, work_orders, call_sheets, worker_profiles
- **6/7:** 11 datasets — most missing WHERE (finance/admin tables that are org-wide, not location-bound)
- **5/7:** 3 datasets — generic `expenses`, `time_entries`, `milestones` (to be remediated by consolidation)

### 13.3 Remediation via Consolidation

After merging duplicate tables (Migration 012), all surviving tables will achieve **≥ 6/7** coverage. The missing WHERE dimension on financial tables is architecturally correct — expenses, time entries, and budgets are project-scoped, not location-scoped. Location attribution flows through task → activation → location linkage.

---

## 14. Implementation Roadmap

### Phase 1: Table Consolidation (Migration 012) — P0

**Scope:** Merge duplicate table pairs, add missing columns to surviving tables.

| Step | Action | Affected Tables |
|------|--------|----------------|
| 1 | Add `department`, `phase`, `acceptance_criteria`, `percent_complete`, `blockers`, `impact_if_delayed`, `reviewer_id`, `vendor_id` columns to `tasks` | `tasks` |
| 2 | Migrate data from `production_tasks` to `tasks` | `production_tasks` → `tasks` |
| 3 | Add `phase`, `payment_trigger`, `payment_amount`, `is_critical_path`, `client_facing`, `owner_id` columns to `milestones` | `milestones` |
| 4 | Migrate data from `production_milestones` to `milestones` | `production_milestones` → `milestones` |
| 5 | Create junction tables: `activation_assets`, `event_assets`, `activity_assets`, `activity_consumables` | New tables |
| 6 | Add `activation_id`, `event_id` nullable FKs to `budget_line_items` | `budget_line_items` |
| 7 | Update RLS policies and triggers | All affected |

**Estimated effort:** 2–3 days  
**Risk:** Low — additive columns and new junction tables; no destructive changes.

### Phase 2: Financial Consolidation (Migration 013) — P1

| Step | Action |
|------|--------|
| 1 | Add `department`, `phase`, `currency`, `payment_method`, `reimbursable`, `justification` to `expenses` |
| 2 | Add `shift_id`, `overtime_hours`, `double_time_hours`, `overtime_rate`, `double_time_rate`, `total_pay` to `time_entries` |
| 3 | Create `budget_commitments` table for PO-based committed spend |
| 4 | Create `contract_amendments` table |
| 5 | Create `warehouse_zones` table (normalize from JSONB) |
| 6 | Deprecate `production_expenses`, `production_time_entries` (keep views for backward compat) |

**Estimated effort:** 3–4 days  
**Risk:** Medium — requires updating hooks and pages that reference production-prefixed tables.

### Phase 3: New Capabilities (Migration 014) — P2

| Step | Action |
|------|--------|
| 1 | Create `digital_assets`, `digital_asset_versions` tables |
| 2 | Create `asset_catalog_items`, `asset_catalog_components` tables |
| 3 | Create `activity_templates` table |
| 4 | Create `change_orders`, `change_order_impacts` tables |
| 5 | Create `post_event_metrics`, `post_event_surveys` tables |
| 6 | Create `run_of_show_items` table (normalize from Event JSONB) |

**Estimated effort:** 3–4 days  
**Risk:** Low — all new tables, no existing data affected.

### Phase 4: UI Completion — P1/P2

| Page | Priority | Dependencies |
|------|----------|-------------|
| `/activities` — Activity list page | P1 | None (schema exists) |
| `/activations/[id]` — Activation detail | P1 | None |
| `/events/[id]` — Event detail | P1 | None |
| `/tasks/[id]` — Task detail | P1 | Migration 012 (consolidated tasks) |
| `/digital-assets` — DAM page | P2 | Migration 014 |
| `/change-orders` — Change order management | P2 | Migration 014 |
| `/post-event` — Post-event reporting | P2 | Migration 014 |
| `/asset-catalog` — Reusable asset templates | P2 | Migration 014 |

### Phase 5: Automation Implementation — P2/P3

| Automation | Implementation |
|-----------|---------------|
| Budget alerts | Supabase edge function on expense/PO insert |
| Certification expiry | Scheduled Supabase function (daily) |
| Phase gate validation | Approval workflow integration |
| Consumable reorder | Supabase trigger on consumable_usage insert |

---

## Appendix A: Glossary

| Term | Definition |
|------|-----------|
| **Activation** | A brand or campaign implementation at a specific location — the physical/digital build |
| **Activity** | A programmed segment within an event — a discrete audience-facing experience |
| **Asset** | Any physical, digital, scenic, technical, or branded element used in production |
| **Asset Catalog** | Reusable template defining a standard asset configuration |
| **Change Order** | Formal request to modify scope, budget, or schedule with impact analysis |
| **Critical Path** | The longest sequence of dependent tasks determining minimum project duration |
| **DAM** | Digital Asset Management — structured tracking of creative files |
| **Event** | A date-specific execution — a show, rehearsal, setup, or meeting |
| **Location** | A venue, market, or destination where production activities occur |
| **Milestone** | A significant checkpoint in the project timeline, often triggering approvals or payments |
| **Phase Gate** | A quality/completeness check required before advancing to the next production phase |
| **Post-Event Metrics** | Structured outcome data captured after an event (attendance, engagement, ROI) |
| **Production Phase** | A stage in the project lifecycle (discovery → design → pre_production → ... → wrap) |
| **Project** | A portfolio-level initiative encompassing all locations, activations, and events |
| **RFQ** | Request for Quotation — solicitation sent to vendors for competitive bidding |
| **Run of Show** | Minute-by-minute schedule of an event's segments |
| **SOW** | Scope of Work — contractual definition of deliverables, timeline, and compensation |
| **SSOT** | Single Source of Truth — each data concept exists in exactly one canonical location |
| **3NF** | Third Normal Form — database normalization eliminating transitive dependencies |

---

## Appendix B: Migration Dependency Graph

```
001_initial_schema
 └→ 002_extended_schema
     └→ 003_production_lifecycle
         ├→ 004_crm_public
         ├→ 005_productive_features
         ├→ 006_workflow_documents
         ├→ 007_sow_lifecycle
         ├→ 008_vendor_contractor_lifecycle
         │   └→ 010_service_requests
         └→ 009_scenario_builder
             └→ 011_unified_workforce
                 └→ 012_production_consolidation (PROPOSED)
                     └→ 013_financial_consolidation (PROPOSED)
                         └→ 014_new_capabilities (PROPOSED)
```

---

*Document generated as part of the Experiential & Creative Production Lifecycle Architecture analysis. All recommendations maintain backward compatibility with existing 94+ routes and 150+ database tables.*
