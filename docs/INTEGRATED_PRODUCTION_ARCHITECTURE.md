# Integrated Production, Build & Creative Execution Lifecycle Architecture

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current-State Multi-Vertical Workflow Maps](#2-current-state-multi-vertical-workflow-maps)
3. [Gap Analysis & Structural Findings](#3-gap-analysis--structural-findings)
4. [Future-State Integrated Production Architecture](#4-future-state-integrated-production-architecture)
5. [Cross-Vertical Dependency Matrix](#5-cross-vertical-dependency-matrix)
6. [3NF-Compliant Enterprise Entity Relationship Diagram](#6-3nf-compliant-enterprise-entity-relationship-diagram)
7. [Production Object Taxonomy](#7-production-object-taxonomy)
8. [Budget Roll-Up Schema](#8-budget-roll-up-schema)
9. [Vendor & Procurement Integration Model](#9-vendor--procurement-integration-model)
10. [Compliance Gating Framework](#10-compliance-gating-framework)
11. [Schedule Critical-Path Modeling Logic](#11-schedule-critical-path-modeling-logic)
12. [Margin Visibility Architecture](#12-margin-visibility-architecture)
13. [Live Deployment Integration Model](#13-live-deployment-integration-model)
14. [UI/UX Cognitive Load Minimization Principles](#14-uiux-cognitive-load-minimization-principles)
15. [Automation & AI Augmentation Roadmap](#15-automation--ai-augmentation-roadmap)
16. [Implementation Roadmap](#16-implementation-roadmap)

---

## 1. Executive Summary

### 1.1 Scope

This document defines the unified architecture for **14 production verticals** spanning physical build, technical production, creative media, entertainment execution, retail/merchandise, and food & beverage operations. The architecture introduces a **vertical-agnostic production kernel** that normalizes all production work under a single transactional model while preserving domain-specific specialization through a composable extension layer.

### 1.2 Critical Findings

| # | Finding | Severity | Verticals Affected |
|---|---------|----------|-------------------|
| F1 | No unified production vertical taxonomy — `department` enum (15 values) doesn't cover media, music, TV/film, F&B, merchandise, or community | P0 | 9/14 |
| F2 | Production phases are linear — `production_phase` doesn't model iterative creative cycles or parallel broadcast workflows | P0 | 12/14 |
| F3 | No production line / work order concept — fab, print, merchandise, F&B need BOM, production runs, yield tracking, QC holds | P0 | 6/14 |
| F4 | No rights/licensing model — music, media, broadcast require licensing, residuals, clearance workflows | P0 | 3/14 |
| F5 | No recipe/formula/BOM abstraction — F&B menus, merchandise products, scenic builds, print jobs all need multi-level BOMs | P0 | 5/14 |
| F6 | Rental vs. sale differentiation missing — decor/props needs rental agreements, return tracking, damage assessment | P1 | 2/14 |
| F7 | No venue/space technical specifications — technical production requires rigging maps, power schemas, RF coordination | P1 | 4/14 |
| F8 | No production run / batch tracking — print, merchandise, scenic, F&B need run tracking with yield/waste/QC | P1 | 4/14 |
| F9 | No script/cue/blocking model — TV/film, theatrical, broadcast need script breakdowns, cue sheets, camera plots | P1 | 3/14 |
| F10 | No touring/multi-date lifecycle — concert/festival needs advancing, settlement, rider compliance, per-date P&L | P1 | 2/14 |
| F11 | Health permit and food safety compliance gap — F&B requires temp logs, allergen tracking, HACCP plans | P1 | 1/14 |
| F12 | No interactive/immersive tech layer — experiential needs sensor integration, trigger/response modeling | P2 | 1/14 |
| F13 | Cross-vertical asset reuse invisible — no mechanism to surface reusable assets across projects/verticals | P1 | All |
| F14 | Budget category enum too narrow — 24 categories don't cover talent buyout, licensing, health permits, ingredients, POS | P1 | 8/14 |

### 1.3 Design Principles

1. **Vertical-Agnostic Kernel** — Core production objects (work packages, production runs, BOMs, QC gates) are domain-neutral; vertical-specific behavior injected via typed config
2. **Composable Extensions** — Each vertical registers domain metadata, phase definitions, and compliance requirements through declarative config — no per-vertical tables
3. **Existing Entity Reuse** — Maximum leverage of existing tables: tasks, assets, budgets, locations, contracts, shipments, incidents, digital_assets
4. **Master Data Separation** — Catalog items (BOMs, recipes, templates, specs) are master data; production instances (runs, batches) are transactional
5. **Cross-Vertical Interoperability** — A festival project simultaneously uses site construction, technical, F&B, merchandise, and experiential — all linked through project hierarchy
6. **Mobile-First Field Workflows** — QC inspections, receiving, time capture, incident reporting must function offline
7. **Financial Transparency** — Every production action that creates cost is traceable to a budget line item, cost code, vendor commitment, and GL account

### 1.4 Recommendation Matrix

| Priority | Scope | Tables | Enums |
|----------|-------|--------|-------|
| **P0** | Vertical taxonomy, work packages, BOMs, production runs, QC gates, rights/licensing | 12 new, 4 extended | 18 new |
| **P1** | Technical specs, rental lifecycle, touring/settlement, F&B compliance, batch tracking | 8 new, 3 extended | 9 new |
| **P2** | Interactive tech layer, advanced scheduling, AI integrations | 4 new | 4 new |
| **P3** | Predictive analytics, digital twin, autonomous scheduling | Views/functions | — |

---

## 2. Current-State Multi-Vertical Workflow Maps

### 2.1 Entity Inventory

The current schema models production through a **project-centric hierarchy**:

```
Organization
  └─ Project (type: tour|festival|activation|installation|broadcast|corporate|retail|experiential)
       ├─ Location(s) → Activation(s) → Event(s) → Activity(ies)
       ├─ Task(s) [consolidated from production_tasks in mig 012]
       ├─ Milestone(s) [consolidated from production_milestones in mig 012]
       ├─ Budget → Budget Line Items (hierarchical via mig 012)
       ├─ Purchase Orders → Shipments
       ├─ Crew Shifts / Project Assignments
       ├─ Asset Assignments (junction tables in mig 012)
       ├─ Contracts (mig 016)
       ├─ Incidents
       └─ Schedule Entries
```

### 2.2 Current Vertical Coverage Matrix

| # | Production Vertical | Coverage | Key Gaps |
|---|-------------------|----------|----------|
| 1 | **Site Development & Construction** | ◑ Partial | No build sequencing, no inspection punch lists, no GC coordination |
| 2 | **Fabrication & Scenic** | ◑ Partial | No BOM, no shop drawing workflow, no CNC job tracking, no QC hold/release |
| 3 | **Technical Production** | ◔ Minimal | No rigging plots, no power distro schema, no RF coordination, no show control |
| 4 | **Media Production** | ◔ Minimal | No shoot scheduling, no edit workflow, no render pipeline |
| 5 | **Music Production** | ○ None | No composition, recording, mixing, rights management |
| 6 | **TV/Film/Broadcast** | ○ None | No script breakdown, no camera blocking, no distribution |
| 7 | **Theatrical/Concert/Festival/Touring** | ◑ Partial | No advancing, no settlement, no rider compliance, no multi-date P&L |
| 8 | **Conference/Trade Show/Corporate** | ◑ Partial | No registration, no speaker logistics, no sponsor deliverables |
| 9 | **Community/Cultural/Educational** | ◔ Minimal | No grant compliance, no educational programming |
| 10 | **Print Production** | ○ None | No print specs, no press proofs, no substrate tracking |
| 11 | **Experiential Production** | ◑ Partial | No sensor/trigger model, no visitor flow analytics |
| 12 | **Decor/Props/Furniture (Sales & Rentals)** | ◔ Minimal | No rental agreements, no damage assessment workflow |
| 13 | **Retail/Merchandise/Swag** | ○ None | No product design, no sampling, no manufacturing, no POS |
| 14 | **Food & Beverage/Catering** | ○ None | No menu model, no health permits, no recipe/BOM, no waste tracking |

### 2.3 Universal Production Lifecycle (Current State)

All 14 verticals share a common lifecycle pattern, currently modeled only for construction/experiential:

```
Concept → Design → Engineering → Budgeting → Procurement → Fabrication/Production
    → QC → Logistics → Deployment → Live Operation → Strike/Wrap → Archival/Reuse
```

**Current `production_phase` enum covers:** discovery, design, pre_production, procurement, fabrication, logistics, load_in, rehearsal, show, strike, load_out, wrap

**Missing phases for other verticals:**
- Media: principal_photography, post_production, color_grade, sound_mix, delivery
- Music: composition, arrangement, recording, mixing, mastering, distribution
- F&B: menu_dev, sourcing, prep, service, cleanup
- Print: prepress, proofing, press_run, finishing
- Merchandise: sampling, manufacturing, fulfillment

---

## 3. Gap Analysis & Structural Findings

### 3.1 SSOT Violations

| # | Violation | Current Location | Impact |
|---|-----------|-----------------|--------|
| V1 | Vertical identity encoded in `project_type` enum (8 values) AND `department` enum (15 values) — overlapping, incomplete | mig 003, 001 | Can't classify F&B, media, music, or merchandise projects |
| V2 | Phase lifecycle hardcoded in `production_phase` — one lifecycle for all verticals | mig 003 | Iterative media workflows forced into linear construction phases |
| V3 | Asset categorization split across `asset_category` (13 values), `asset_class` (mig 018), freeform `category` | mig 001, 003, 018 | No unified taxonomy for cross-vertical asset search |
| V4 | Budget categories (24 values) in `budget_category` enum don't cover 8+ verticals | mig 003 | F&B ingredients, talent buyouts, licensing fees un-categorizable |
| V5 | Technical specs embedded as freeform `specifications JSONB` — not queryable | mig 003 | Can't search "all 400A 3-phase power distros" |
| V6 | BOM/recipe absent — components stored as JSONB arrays, not normalized | mig 003 | Can't track material costs, substitutions, or yield |
| V7 | Rental lifecycle piggybacks on `asset_ownership` enum and `asset_assignments` — no pricing, no damage tracking | mig 003 | Rental business can't invoice or assess damage systematically |

### 3.2 Scope Creep Triggers

| # | Trigger | Verticals | Root Cause |
|---|---------|-----------|------------|
| S1 | No formal change order linkage between production work and budget | All | Budget line items not linked to work packages |
| S2 | Design revisions have no version-controlled impact tracking | 1,2,3,10,11 | Digital asset versions not linked to production tasks |
| S3 | Client-requested additions bypass QC gates | 1,2,8 | No gate/hold mechanism on production runs |
| S4 | Vendor substitutions not tracked against original spec | 2,3,10,13 | No BOM with approved alternates |
| S5 | F&B menu changes after procurement creates waste | 14 | No recipe-to-PO traceability |
| S6 | Merchandise quantity changes after manufacturing starts | 13 | No production run with committed quantities |
| S7 | Show additions during rehearsal bypass technical review | 3,7 | No technical review gate on ROS changes |
| S8 | Touring rider changes per-market not tracked against master | 7 | No rider compliance model |

### 3.3 Interdepartmental Friction Points

| # | Friction | Between | Resolution |
|---|---------|---------|------------|
| IF1 | Scenic design changes not reflected in structural engineering | Creative ↔ Construction | BOM links design asset version to engineering task |
| IF2 | Technical rider changes not communicated to logistics | Technical ↔ Logistics | Work package dependency chain with notifications |
| IF3 | F&B staffing needs not integrated with crew scheduling | F&B ↔ Staffing | Unified crew model with F&B department classification |
| IF4 | Print specs disconnected from brand guidelines | Print ↔ Creative | Brand guideline sections linked to print spec templates |
| IF5 | Merchandise design approval blocks manufacturing | Creative ↔ Merchandise | QC gate with parallel approval tracks |
| IF6 | Audio/video content delivery misaligned with LED wall specs | Media ↔ Technical | Technical spec profiles linked to media delivery specs |
| IF7 | Rental returns not reconciled with warehouse receiving | Decor/Props ↔ Warehouse | Rental return → receiving → damage assessment workflow |
| IF8 | Budget burn from multiple verticals not visible in real-time | Finance ↔ All | Cross-vertical budget roll-up with cost-code hierarchy |
| IF9 | Permitting delays block construction but not communicated | Compliance ↔ All | Compliance gate dependencies on work packages |
| IF10 | Touring settlement data disconnected from project financials | Touring ↔ Finance | Settlement model with automatic budget reconciliation |

### 3.4 Approval Bottlenecks

| # | Bottleneck | Resolution |
|---|-----------|------------|
| A1 | Single approval chain for all production types | Vertical-specific approval templates with parallel tracks |
| A2 | QC approval is binary (pass/fail) — no conditional release | Multi-outcome QC: pass, conditional, rework, reject, hold |
| A3 | Client approval blocks entire production, not just their scope | Scoped approval gates on client-facing deliverables only |
| A4 | Engineering stamp required before fabrication but no tracking | Engineering approval linked to work package dependency |
| A5 | Health department approval for F&B is external — no integration point | Compliance doc type with external approval tracking |
| A6 | Broadcast standards approval not modeled | QC gate type for broadcast compliance |

### 3.5 Budget Leakage Points

| # | Leakage | Vertical | Resolution |
|---|---------|----------|------------|
| B1 | Overtime not tracked against production run budget | All | Time entry → work package → budget line linkage |
| B2 | Material waste in fabrication/print not captured | 2, 10 | Production run yield tracking (input vs output) |
| B3 | F&B portion waste and spoilage untracked | 14 | Recipe-based consumption tracking with waste categories |
| B4 | Rental damage costs not attributed to project | 12 | Damage assessment → budget line item auto-creation |
| B5 | Touring per-market costs not isolated | 7 | Market-level budget segmentation via location hierarchy |
| B6 | Merchandise returns/defects erode margin invisibly | 13 | Return tracking with defect categorization and vendor chargeback |
| B7 | Power/fuel costs for generators not tracked per-event | 3 | Consumable usage tracking for utilities |
| B8 | RF coordination fees and licensing costs buried in misc | 3, 5 | Expanded budget categories with production-specific codes |

### 3.6 Cognitive Overload Risks

| # | Risk | Resolution |
|---|------|------------|
| CO1 | Single task list for all departments | Vertical-scoped task views with department filtering |
| CO2 | Budget view shows all 24+ categories regardless of vertical | Vertical-relevant budget category subsets |
| CO3 | Asset search returns all 13+ categories | Context-aware asset search scoped to active vertical |
| CO4 | Schedule shows all vertical activities in one timeline | Layered schedule with vertical toggles |
| CO5 | Approval queue mixes QC holds with client approvals | Typed approval queues with role-based filtering |
| CO6 | Incident form is generic across all verticals | Vertical-specific incident templates with progressive disclosure |

---

## 4. Future-State Integrated Production Architecture

### 4.1 Architectural Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    EXPERIENCE LAYER (UI/UX)                     │
│  Role-based views · Vertical-scoped dashboards · Mobile-first   │
│  ⌘K command bar · Progressive disclosure · Offline-capable      │
├─────────────────────────────────────────────────────────────────┤
│                   ORCHESTRATION LAYER                            │
│  Work Package Engine · Schedule Solver · Budget Aggregator       │
│  Compliance Gate Evaluator · Cross-Vertical Dependency Resolver  │
├─────────────────────────────────────────────────────────────────┤
│                  DOMAIN EXTENSION LAYER                          │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│  │Site  │ │Fab   │ │Tech  │ │Media │ │Music │ │TV/   │       │
│  │Dev   │ │Scenic│ │Prod  │ │Prod  │ │Prod  │ │Film  │       │
│  ├──────┤ ├──────┤ ├──────┤ ├──────┤ ├──────┤ ├──────┤       │
│  │Tour  │ │Conf  │ │Comm  │ │Print │ │Exper │ │Decor │       │
│  │Fest  │ │Trade │ │Civic │ │Prod  │ │Prod  │ │Props │       │
│  ├──────┤ ├──────┤ └──────┘ └──────┘ └──────┘ ├──────┤       │
│  │Merch │ │F&B   │                              │Rental│       │
│  │Retail│ │Cater │                              │Sales │       │
│  └──────┘ └──────┘                              └──────┘       │
├─────────────────────────────────────────────────────────────────┤
│                PRODUCTION KERNEL (Vertical-Agnostic)            │
│  Work Packages · Production Runs · BOMs · QC Gates              │
│  Technical Specs · Rights/Licensing · Rental Lifecycle           │
│  Batch Tracking · Yield/Waste · Cost Attribution                │
├─────────────────────────────────────────────────────────────────┤
│              EXISTING PLATFORM FOUNDATION                        │
│  Projects · Tasks · Assets · Budgets · Locations · Contracts    │
│  Crew · Vendors · Shipments · Incidents · Digital Assets        │
│  Campaigns · Compliance · Governance · Live Events              │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Production Kernel — Core Concepts

The kernel introduces **7 new core concepts** serving all 14 verticals:

**4.2.1 Production Vertical Registry** — Declarative configuration defining each vertical's phase lifecycle, required compliance gates, applicable BOM types, and UI presentation. Stored as a table for tenant-scoped customization.

**4.2.2 Work Packages** — Scoped unit of production work replacing the implicit "task = production work" assumption. Typed by vertical, linked to BOM, QC-gated, cost-attributed to budget line items, with cross-vertical dependency support.

**4.2.3 Bills of Materials (BOMs)** — Hierarchical recipe/formula/material list supporting multi-level assembly, approved alternates, yield/waste factors, unit conversion, and cost roll-up. Applies to scenic builds, print specs, F&B recipes, merchandise production, and technical system kits.

**4.2.4 Production Runs** — Execution instance of a BOM tracking input quantities, output quantities, yield, waste, batch/lot traceability, and QC results per run.

**4.2.5 QC Gates** — Checkpoints with multi-outcome results (pass, conditional_pass, rework, fail, hold) that block work package or production run advancement. Linked to compliance permits and engineering approvals.

**4.2.6 Technical Specifications** — Structured, queryable spec entries replacing freeform JSONB. Supports any key-value pair with unit, tolerance, and validation. Enables parametric search across assets, locations, and work packages.

**4.2.7 Rights & Licensing** — IP usage tracking for music, image, talent, content, and software. Territory/medium/duration scoping with fee structures, clearance workflows, and expiry monitoring.

### 4.3 Domain Extension Pattern

Each vertical extends the kernel through:

1. **Vertical-specific `work_package_type` values** — e.g., `scenic_build`, `press_run`, `menu_item`, `camera_setup`
2. **Phase definitions** — vertical's lifecycle phases mapped to work package status transitions
3. **BOM templates** — pre-defined material lists for common production items
4. **QC gate templates** — required checkpoints per vertical
5. **Technical spec profiles** — structured spec schemas per asset/location type
6. **Compliance requirements** — vertical-specific documents auto-required
7. **Budget category mappings** — which budget categories apply to which vertical

### 4.4 Work Package State Machine

```
                    ┌──────────┐
                    │  DRAFT   │
                    └────┬─────┘
                         │ submit
                    ┌────▼─────┐
               ┌────│ PLANNING │────┐
               │    └────┬─────┘    │
               │         │ approve  │ cancel
               │    ┌────▼─────┐    │
               │    │ APPROVED │    │
               │    └────┬─────┘    │
               │         │ start    │
          hold │    ┌────▼─────┐    │
          ┌────┼────│IN_PROGRESS│───┤
          │    │    └────┬─────┘    │
          │    │         │          │
     ┌────▼──┐│    ┌────▼─────┐    │
     │ON_HOLD│├───►│QC_REVIEW │    │
     └───────┘│    └──┬──┬──┬─┘    │
              │  pass │  │  │fail  │
              │  ┌────▼┐ │ ┌▼────┐ │
              │  │DONE │ │ │REWORK│ │
              │  └─────┘ │ └──┬──┘ │
              │          │    │    │
              │   ┌──────▼┐   │    │
              │   │COND'L │───┘    │
              │   │PASS   │        │
              │   └───────┘        │
              │              ┌─────▼───┐
              └──────────────│CANCELLED│
                             └─────────┘
```

### 4.5 Production Run State Machine

```
SETUP → IN_PROGRESS → QC_PENDING → [PASSED | REWORK | REJECTED] → COMPLETED → WASTE_LOGGED
```

---

## 5. Cross-Vertical Dependency Matrix

### 5.1 Vertical Interaction Map

Each cell: **→** = row depends on column, **←** = column depends on row, **↔** = mutual

| | Site | Fab | Tech | Media | Music | TV/Film | Tour | Conf | Comm | Print | Exper | Decor | Merch | F&B |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Site** | — | → | → | | | | | | → | | → | | | |
| **Fab** | ← | — | → | | | | | → | | → | → | → | | |
| **Tech** | ← | ← | — | → | → | → | → | → | | | → | | | |
| **Media** | | | ← | — | → | → | | → | → | | → | | | |
| **Music** | | | ← | ← | — | → | → | | → | | → | | | |
| **TV/Film** | | | ← | ← | ← | — | | | | | | | | |
| **Tour** | | | ← | | ← | | — | | | | | | → | → |
| **Conf** | | ← | ← | ← | | | | — | | → | → | → | → | → |
| **Comm** | ← | | | ← | ← | | | | — | → | | | | |
| **Print** | | ← | | | | | | ← | ← | — | → | | → | |
| **Exper** | ← | ← | ← | ← | ← | | | ← | | ← | — | ← | | |
| **Decor** | | ← | | | | | | ← | | | → | — | | |
| **Merch** | | | | | | | ← | ← | | ← | | | — | |
| **F&B** | | | | | | | ← | ← | | | | | | — |

### 5.2 Critical Cross-Vertical Dependencies

| # | Dependency Chain | Impact If Broken | Mitigation |
|---|-----------------|-----------------|------------|
| D1 | Site Dev → Engineering Approval → Fabrication Start | Fab team idle, materials carrying cost | Auto-notify fab lead on engineering approval |
| D2 | Creative Brief → Brand Guidelines → Print Specs → Print Run | Print rework, schedule slip | QC gate: brand compliance before press |
| D3 | Tech Rider → Power Distro Plan → Site Electrical Permit | Show delay, safety risk | Compliance gate: electrical permit before power-up |
| D4 | Music Rights Clearance → Media Post-Production → Broadcast Delivery | Legal exposure, missed air date | Rights clearance gate before final mix |
| D5 | F&B Health Permit → Kitchen Setup → Menu Service | Service delayed, revenue loss | Compliance gate: health permit before F&B ops |
| D6 | Merchandise Design Approval → Manufacturing Run → Fulfillment | Inventory shortage, missed sales | QC gate: design approval before production order |
| D7 | Scenic Fab Complete → Tech Install → Rehearsal | Rehearsal delayed, OT costs | Work package dependency: fab → tech install |
| D8 | Rental Pull → Damage Inspect → Styling → Deploy → Return → Reconcile | Missing inventory, unbilled damage | Rental lifecycle with mandatory checkpoints |

### 5.3 Dependency Resolution Rules

1. **Hard dependencies** block downstream work package start — enforced by the orchestration layer
2. **Soft dependencies** generate warnings but allow override with approval
3. **Cross-vertical dependencies** require explicit acknowledgment from both vertical leads
4. **Time-buffered dependencies** include configurable lag (e.g., 48h cure time between pour and load)
5. **Dependency cycles** are detected and rejected at creation time

---

## 6. 3NF-Compliant Enterprise Entity Relationship Diagram

### 6.1 New Entities (P0 — Migration 020)

#### `production_verticals` — Vertical Registry

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| code | TEXT UNIQUE | `site_dev`, `fabrication`, `technical`, `media`, `music`, `tv_film`, `touring`, `conference`, `community`, `print`, `experiential`, `decor_props`, `merchandise`, `food_beverage` |
| name | TEXT | Display name |
| description | TEXT | |
| phase_definitions | JSONB | Ordered array: `[{code, label, order}]` |
| default_qc_gates | JSONB | Array of default QC gate types |
| applicable_budget_categories | TEXT[] | Relevant budget categories |
| icon | TEXT | Lucide icon name |
| color | TEXT | Semantic token reference |
| is_active | BOOLEAN | Feature flag |
| organization_id | UUID FK → organizations | Tenant-scoped |
| created_at / updated_at | TIMESTAMPTZ | |

#### `work_packages` — Core Production Work Unit

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| project_id | UUID FK → projects | Required |
| vertical_id | UUID FK → production_verticals | |
| parent_work_package_id | UUID FK → work_packages | Hierarchical decomposition |
| code | TEXT | Auto: `{project}-{vertical}-{seq}` |
| title | TEXT | |
| description | TEXT | |
| work_package_type | TEXT | Vertical-specific (e.g., `scenic_build`) |
| phase | TEXT | Current phase within vertical's lifecycle |
| status | work_package_status | See §4.4 state machine |
| priority | task_priority | Reuse existing enum |
| estimated_hours / actual_hours | NUMERIC(8,2) | |
| estimated_cost / actual_cost | NUMERIC(12,2) | |
| start_date / due_date | DATE | |
| completed_at | TIMESTAMPTZ | |
| lead_id | UUID FK → profiles | |
| reviewer_id | UUID FK → profiles | |
| vendor_id | UUID FK → vendors | |
| location_id | UUID FK → locations | |
| activation_id | UUID FK → activations | |
| event_id | UUID FK → events | |
| budget_line_id | UUID FK → budget_line_items | Direct cost attribution |
| bom_id | UUID FK → boms | |
| campaign_id | UUID FK → campaigns | |
| tags | TEXT[] | |
| metadata | JSONB | Vertical-specific extensions |
| organization_id | UUID FK → organizations | |
| created_by / updated_by | UUID FK → profiles | |
| created_at / updated_at | TIMESTAMPTZ | |

#### `work_package_dependencies` — Cross-Vertical Dependency

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| work_package_id | UUID FK → work_packages | The dependent |
| depends_on_id | UUID FK → work_packages | The prerequisite |
| dependency_type | TEXT | `finish_to_start`, `start_to_start`, `finish_to_finish`, `start_to_finish` |
| lag_hours | NUMERIC(8,2) | Offset |
| is_hard | BOOLEAN | Hard = blocking; soft = advisory |
| organization_id | UUID FK → organizations | |
| created_at | TIMESTAMPTZ | |

#### `boms` — Bill of Materials (Master Data)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| code | TEXT UNIQUE | |
| name | TEXT | |
| description | TEXT | |
| bom_type | bom_type | `assembly`, `recipe`, `print_spec`, `media_package`, `kit`, `bundle` |
| vertical_id | UUID FK → production_verticals | |
| version | INTEGER DEFAULT 1 | |
| status | TEXT | `draft`, `active`, `superseded`, `archived` |
| yield_factor | NUMERIC(5,4) DEFAULT 1.0 | Expected output ratio |
| unit_of_measure | TEXT | Output UOM |
| output_quantity | NUMERIC(10,2) | Standard batch output |
| estimated_cost | NUMERIC(12,2) | Rolled-up cost |
| is_template | BOOLEAN DEFAULT false | |
| parent_bom_id | UUID FK → boms | Sub-assemblies |
| digital_asset_id | UUID FK → digital_assets | Design file |
| organization_id | UUID FK → organizations | |
| created_by / updated_by | UUID FK → profiles | |
| created_at / updated_at | TIMESTAMPTZ | |

#### `bom_lines` — BOM Components

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| bom_id | UUID FK → boms | |
| line_number | INTEGER | Sort order |
| item_type | bom_item_type | `asset`, `consumable`, `sub_bom`, `labor`, `service`, `rental` |
| asset_id | UUID FK → assets | If applicable |
| consumable_id | UUID FK → consumables | If applicable |
| sub_bom_id | UUID FK → boms | If applicable |
| description | TEXT | |
| quantity | NUMERIC(10,4) | Per output unit |
| unit_of_measure | TEXT | |
| unit_cost | NUMERIC(12,4) | |
| waste_factor | NUMERIC(5,4) DEFAULT 0 | % expected waste |
| is_critical | BOOLEAN DEFAULT false | Missing blocks production |
| approved_alternates | UUID[] | Alternate asset/consumable IDs |
| organization_id | UUID FK → organizations | |
| created_at / updated_at | TIMESTAMPTZ | |

#### `production_runs` — Execution Instance

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| work_package_id | UUID FK → work_packages | |
| bom_id | UUID FK → boms | |
| run_number | TEXT | Auto-generated |
| status | production_run_status | See §4.5 state machine |
| planned_quantity / actual_output / waste_quantity | NUMERIC(10,2) | |
| yield_percent | NUMERIC(5,2) | (actual/planned) × 100 |
| batch_number | TEXT | Lot traceability |
| started_at / completed_at | TIMESTAMPTZ | |
| operator_id | UUID FK → profiles | |
| location_id | UUID FK → locations | |
| equipment_ids | UUID[] | |
| organization_id | UUID FK → organizations | |
| created_by / updated_by | UUID FK → profiles | |
| created_at / updated_at | TIMESTAMPTZ | |

#### `production_run_inputs` — Actual Consumption

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| production_run_id | UUID FK → production_runs | |
| bom_line_id | UUID FK → bom_lines | Which BOM line fulfilled |
| item_type | bom_item_type | |
| asset_id / consumable_id | UUID FK | |
| planned_quantity / actual_quantity / waste_quantity | NUMERIC(10,4) | |
| unit_cost | NUMERIC(12,4) | Actual at time of use |
| substitution_reason | TEXT | If alternate used |
| organization_id | UUID FK → organizations | |
| created_at | TIMESTAMPTZ | |

#### `qc_gates` — Quality Control Checkpoints

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| work_package_id | UUID FK → work_packages | Nullable |
| production_run_id | UUID FK → production_runs | Nullable |
| gate_type | qc_gate_type | `design_review`, `engineering_stamp`, `client_approval`, `brand_compliance`, `safety_inspection`, `health_inspection`, `color_proof`, `sound_check`, `broadcast_standards`, `structural_inspection`, `fire_marshal`, `rights_clearance`, `general_qc` |
| sequence | INTEGER | Order within work package |
| title | TEXT | |
| description | TEXT | |
| status | qc_gate_status | `pending`, `in_review`, `passed`, `conditional_pass`, `rework`, `failed`, `waived` |
| required | BOOLEAN DEFAULT true | |
| reviewer_id | UUID FK → profiles | |
| reviewed_at | TIMESTAMPTZ | |
| conditions | TEXT | For conditional_pass |
| attachments | UUID[] | Evidence docs |
| compliance_doc_id | UUID FK → location_compliance_docs | |
| permit_id | UUID FK → permits | |
| next_gate_id | UUID FK → qc_gates | Chain |
| organization_id | UUID FK → organizations | |
| created_by / updated_by | UUID FK → profiles | |
| created_at / updated_at | TIMESTAMPTZ | |

#### `technical_specs` — Structured Specifications

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| entity_type | TEXT | `asset`, `location`, `work_package`, `bom`, `bom_line` |
| entity_id | UUID | Polymorphic FK |
| spec_category | TEXT | `electrical`, `structural`, `audio`, `video`, `lighting`, `rigging`, `rf`, `network`, `environmental`, `dimensional`, `print`, `culinary` |
| spec_key | TEXT | e.g., `amperage`, `voltage`, `weight_capacity` |
| spec_value | TEXT | |
| unit | TEXT | e.g., `A`, `V`, `lbs`, `ft` |
| min_value / max_value | NUMERIC | For range specs |
| tolerance | NUMERIC | |
| is_required | BOOLEAN DEFAULT false | |
| organization_id | UUID FK → organizations | |
| created_at / updated_at | TIMESTAMPTZ | |

**Unique constraint:** (entity_type, entity_id, spec_category, spec_key, organization_id)

#### `rights_licenses` — IP & Usage Rights

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| project_id | UUID FK → projects | |
| title | TEXT | |
| rights_type | rights_type | `music_sync`, `music_master`, `music_performance`, `image_rights`, `talent_likeness`, `content_distribution`, `software_license`, `font_license`, `stock_media`, `patent`, `trademark` |
| status | rights_status | `pending_clearance`, `cleared`, `denied`, `expired`, `renewal_needed` |
| licensor | TEXT | Rights holder |
| licensee_org_id | UUID FK → organizations | |
| territory | TEXT[] | Geographic scope |
| medium | TEXT[] | `live_event`, `broadcast`, `digital`, `print`, `social_media` |
| start_date / end_date | DATE | |
| fee_type | TEXT | `flat`, `per_use`, `royalty`, `included`, `gratis` |
| fee_amount | NUMERIC(12,2) | |
| royalty_rate | NUMERIC(5,4) | |
| usage_limit | INTEGER | Max uses if per-use |
| usage_count | INTEGER DEFAULT 0 | |
| contract_id | UUID FK → contracts | |
| digital_asset_id | UUID FK → digital_assets | Licensed content |
| auto_renew | BOOLEAN DEFAULT false | |
| organization_id | UUID FK → organizations | |
| created_by / updated_by | UUID FK → profiles | |
| created_at / updated_at | TIMESTAMPTZ | |

#### `rental_agreements` — Rental/Sales Lifecycle

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| project_id | UUID FK → projects | |
| agreement_number | TEXT UNIQUE | |
| agreement_type | rental_agreement_type | `rental`, `sale`, `rental_to_own`, `consignment` |
| status | rental_status | `draft`, `quoted`, `confirmed`, `active`, `returned`, `closed`, `disputed` |
| client_id | UUID FK → companies | |
| contact_id | UUID FK → contacts | |
| event_date / pickup_date / return_date / actual_return_date | DATE | |
| subtotal / tax_amount / damage_charges / total_amount | NUMERIC(12,2) | |
| deposit_amount | NUMERIC(12,2) | |
| deposit_paid | BOOLEAN DEFAULT false | |
| stylist_id | UUID FK → profiles | |
| location_id | UUID FK → locations | |
| organization_id | UUID FK → organizations | |
| created_by / updated_by | UUID FK → profiles | |
| created_at / updated_at | TIMESTAMPTZ | |

#### `rental_agreement_lines` — Line Items

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| rental_agreement_id | UUID FK → rental_agreements | |
| asset_id | UUID FK → assets | |
| description | TEXT | |
| quantity | INTEGER DEFAULT 1 | |
| unit_price | NUMERIC(12,2) | Per-day (rental) or sale price |
| rental_days | INTEGER | |
| line_total | NUMERIC(12,2) | |
| condition_out | asset_condition | At checkout |
| condition_in | asset_condition | At return |
| damage_notes | TEXT | |
| damage_charge | NUMERIC(12,2) DEFAULT 0 | |
| organization_id | UUID FK → organizations | |
| created_at / updated_at | TIMESTAMPTZ | |

### 6.2 Extended Existing Enums

**`department`** — add: `media`, `music`, `tv_film`, `touring`, `conference`, `community`, `experiential`, `decor_props`, `merchandise`, `food_beverage`, `broadcast`, `post_production`, `engineering`, `electrical`, `plumbing`, `carpentry`, `welding`, `painting`

**`budget_category`** — add: `talent_buyout`, `licensing_fees`, `music_rights`, `raw_ingredients`, `packaging`, `pos_fees`, `health_permits`, `rf_coordination`, `generator_fuel`, `waste_disposal`, `styling`, `photography`, `videography`, `editing`, `color_grade`, `sound_design`, `manufacturing`, `fulfillment`, `sampling`

**`project_type`** — add: `concert`, `theater`, `conference`, `trade_show`, `community_event`, `film`, `tv_series`, `music_album`, `music_single`, `print_campaign`, `product_launch`, `pop_up`, `immersive`, `catering`, `wedding`, `gala`

### 6.3 Entity Relationship Map

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   projects   │────►│work_packages │────►│    boms      │
│              │     │              │     │              │
│              │     │  vertical_id─┼──►┌─┴──────────────┤
└──────┬───────┘     │  bom_id─────►│  │  bom_lines     │
       │             │  budget_line ─┤  │                │
       │             └──────┬───────┘  └────────────────┘
       │                    │
       │     ┌──────────────┼──────────────┐
       │     │              │              │
       │     ▼              ▼              ▼
       │ ┌──────────┐ ┌──────────┐ ┌──────────────┐
       │ │qc_gates  │ │prod_runs │ │work_pkg_deps │
       │ └──────────┘ │          │ └──────────────┘
       │              │  inputs──┤
       │              └──────────┘
       │
       ├──►┌──────────────┐     ┌──────────────────┐
       │   │rights_licenses│     │  technical_specs  │
       │   └──────────────┘     │  (polymorphic)    │
       │                        └──────────────────┘
       │
       └──►┌──────────────────┐
           │rental_agreements  │
           │  └─ lines         │
           └──────────────────┘
```

---

## 7. Production Object Taxonomy

### 7.1 Vertical Registry (14 Verticals)

| Code | Name | Phase Lifecycle | Key BOM Types | Key QC Gates |
|------|------|----------------|---------------|-------------|
| `site_dev` | Site Development & Construction | feasibility → engineering → permitting → site_prep → foundation → structure → systems → finishing → inspection → handoff | assembly | engineering_stamp, structural_inspection, fire_marshal |
| `fabrication` | Fabrication & Scenic | shop_drawing → material_prep → cutting → assembly → finishing → painting → qc → crating | assembly | design_review, structural_inspection, general_qc |
| `technical` | Technical Production | system_design → equipment_pull → load_in → hang_focus → programming → rehearsal → show → strike | kit | safety_inspection, sound_check |
| `media` | Media Production | pre_production → shoot → ingest → edit → color_grade → sound_mix → review → delivery | media_package | client_approval, brand_compliance |
| `music` | Music Production | composition → arrangement → recording → mixing → mastering → delivery | media_package | client_approval |
| `tv_film` | TV/Film/Broadcast | development → pre_production → principal → post → color → sound → vfx → online → delivery | media_package | broadcast_standards, client_approval |
| `touring` | Theatrical/Concert/Festival/Touring | design → advancing → rehearsal → load_in → show → strike → settlement | kit | safety_inspection, sound_check |
| `conference` | Conference/Trade Show/Corporate | planning → design → build → install → registration → sessions → strike → reporting | assembly | brand_compliance, client_approval |
| `community` | Community/Cultural/Educational | planning → permitting → programming → setup → event → cleanup → reporting | — | fire_marshal, health_inspection |
| `print` | Print Production | prepress → proofing → plate → press_run → finishing → mounting → delivery | print_spec | color_proof, brand_compliance |
| `experiential` | Experiential Production | concept → design → prototype → build → install → calibrate → activate → strike | assembly | design_review, safety_inspection |
| `decor_props` | Decor, Props, Furniture | styling → pull → prep → deliver → install → event → strike → return → reconcile | bundle | general_qc |
| `merchandise` | Retail/Merchandise/Swag | design → sampling → approval → manufacturing → receiving → fulfillment → pos → reporting | assembly | client_approval, general_qc |
| `food_beverage` | Food & Beverage/Catering | menu_dev → sourcing → prep → service → cleanup → waste_log → revenue_reconcile | recipe | health_inspection |

### 7.2 Work Package Type Hierarchy

```
Work Package
├── Build Types
│   ├── scenic_build           (fabrication)
│   ├── structural_build       (site_dev)
│   ├── booth_build           (conference)
│   ├── custom_fabrication    (fabrication)
│   └── installation          (experiential, conference)
├── Technical Types
│   ├── audio_system           (technical)
│   ├── lighting_system        (technical)
│   ├── video_system           (technical)
│   ├── rigging_system         (technical)
│   ├── power_distribution     (technical, site_dev)
│   ├── show_control           (technical, experiential)
│   ├── rf_coordination        (technical)
│   └── sfx_system            (technical)
├── Media Types
│   ├── photo_shoot            (media)
│   ├── video_shoot            (media)
│   ├── live_stream            (media)
│   ├── motion_graphics        (media)
│   ├── ar_vr_xr              (media, experiential)
│   ├── post_edit              (media, tv_film)
│   ├── color_grade            (media, tv_film)
│   ├── sound_design           (media, music)
│   └── render_pipeline        (media)
├── Music Types
│   ├── composition            (music)
│   ├── recording_session      (music)
│   ├── mix_master             (music)
│   └── cue_production         (music)
├── Production Run Types
│   ├── press_run              (print)
│   ├── manufacturing_run      (merchandise)
│   ├── menu_prep              (food_beverage)
│   └── batch_fabrication      (fabrication)
├── Touring Types
│   ├── show_advance           (touring)
│   ├── load_in_sequence       (touring, technical)
│   ├── settlement             (touring)
│   └── rider_compliance       (touring)
├── Event Types
│   ├── registration_setup     (conference)
│   ├── speaker_logistics      (conference)
│   ├── sponsor_deliverable    (conference)
│   └── programming_session    (community)
├── Rental/Sales Types
│   ├── rental_pull            (decor_props)
│   ├── styling_coordination   (decor_props)
│   └── return_reconciliation  (decor_props)
└── Service Types
    ├── catering_service        (food_beverage)
    ├── bar_service             (food_beverage)
    └── fulfillment             (merchandise)
```

### 7.3 BOM Type Definitions

| Type | Description | Verticals | Supports Yield | Multi-Level |
|------|-------------|-----------|---------------|-------------|
| `assembly` | Physical construction from components | site_dev, fabrication, conference, experiential | Yes | Yes |
| `recipe` | Ingredient-based formula with portions | food_beverage | Yes | Yes |
| `print_spec` | Substrate + ink + finishing | print | Yes | No |
| `media_package` | Source files + processing steps | media, music, tv_film | No | Yes |
| `kit` | Pre-defined equipment package | technical, touring | No | Yes |
| `bundle` | Curated collection for rental/sale | decor_props, merchandise | No | No |

### 7.4 QC Gate Type Registry

| Gate Type | Outcome Model | Typical Reviewer | Auto-Assignable |
|-----------|--------------|-----------------|----------------|
| `design_review` | pass / rework / fail | Creative Director | Yes — by vertical lead |
| `engineering_stamp` | pass / fail | Licensed PE/SE | No — external authority |
| `client_approval` | pass / revision / reject | Client Contact | No — external |
| `brand_compliance` | pass / rework | Brand Manager | Yes |
| `safety_inspection` | pass / conditional / fail | Safety Officer | Yes — by cert |
| `health_inspection` | pass / fail | Health Dept Inspector | No — external |
| `color_proof` | pass / rework | Client + Print Lead | No |
| `sound_check` | pass / conditional | FOH Engineer | Yes |
| `broadcast_standards` | pass / fail | S&P Review | No — external |
| `structural_inspection` | pass / fail | Building Inspector | No — external |
| `fire_marshal` | pass / conditional / fail | Fire Marshal | No — external |
| `rights_clearance` | cleared / denied | Legal Counsel | Yes |
| `general_qc` | pass / conditional / rework / fail | QC Lead | Yes |

---

## 8. Budget Roll-Up Schema

### 8.1 Cost Attribution Hierarchy

```
Organization
  └─ Project
       ├─ Vertical (production_verticals)
       │    └─ Work Package
       │         ├─ Budget Line Item (direct FK)
       │         ├─ Labor (time_entries → crew_shifts)
       │         ├─ Materials (production_run_inputs → BOM costs)
       │         ├─ Vendor (purchase_orders → PO line items)
       │         └─ Rental (rental_agreement_lines)
       ├─ Activation
       │    └─ Work Packages (activation_id)
       ├─ Event / Date
       │    └─ Work Packages (event_id)
       └─ Location / Market
            └─ Work Packages (location_id)
```

### 8.2 Cost Code Structure

Budget line items gain a **cost code** encoding vertical + category:

```
{vertical_code}.{budget_category}.{sequence}
Examples:
  fabrication.materials.001
  technical.equipment_rental.003
  food_beverage.raw_ingredients.012
```

### 8.3 Roll-Up Views

**`v_work_package_cost_summary`** — Per work package:
- Budgeted (from budget_line_item)
- Committed (POs + contracts in `approved`/`active` status)
- Actual (expenses + time entries + production_run_inputs)
- Remaining = budgeted − committed
- Variance = actual − budgeted

**`v_vertical_budget_summary`** — Per project × vertical:
- Sum of all work package costs grouped by vertical
- % of total project budget
- Burn rate (actual ÷ elapsed time fraction)

**`v_project_margin_summary`** — Per project:
- Revenue (from revenue_schedules + client_invoices)
- Total cost (all verticals)
- Gross margin & margin %
- Trend (rolling 7-day burn vs. plan)

### 8.4 Budget Alert Thresholds

| Alert | Condition | Severity |
|-------|-----------|----------|
| Commitment Exceeds Budget | committed > budgeted × 0.9 | Warning |
| Actual Exceeds Budget | actual > budgeted | Critical |
| Burn Rate Acceleration | weekly_burn > projected_weekly × 1.2 | Warning |
| Vertical Over-Index | vertical_actual > vertical_budget × 1.1 | Warning |
| Unattributed Cost | expense without work_package linkage | Info |
| Margin Erosion | project margin % drops >5pp in 7 days | Critical |

### 8.5 Multi-Currency Support

All financial fields store amounts in the **project's base currency**. Original currency and exchange rate are captured on source documents (POs, invoices, expenses). Roll-up views aggregate in base currency only. Exchange rate snapshots are immutable once a transaction is committed.

---

## 9. Vendor & Procurement Integration Model

### 9.1 Vendor-to-Vertical Mapping

Vendors gain a many-to-many relationship with production verticals via a junction table:

```
Vendor
  ├─ specialty (primary — existing field)
  ├─ vendor_vertical_capabilities[] → production_verticals (M:N junction)
  ├─ purchase_orders → work_packages (via budget_line → work_package)
  ├─ contracts → projects / work_packages
  └─ vendor_risk_scores (from migration 016)
```

### 9.2 Procurement Workflow per Vertical

| Vertical | Typical Procurement | PO Type | Lead Time Criticality |
|----------|-------------------|---------|---------------------|
| Site Dev | GC subs, materials | Subcontract, Material | High — sequential dependencies |
| Fabrication | Raw materials, hardware | Material, Tool | High — blocks production |
| Technical | Equipment rental, cable | Rental, Material | Medium — alternatives available |
| Media | Equipment rental, talent | Rental, Service | Medium |
| Music | Studio time, session players | Service | Low |
| TV/Film | Equipment, locations, talent | Rental, Service, Location | High |
| Touring | Venue costs, backline | Service, Rental | High — date-locked |
| Conference | AV rental, booth materials | Rental, Material | Medium |
| Print | Substrate, ink, finishing | Material | High — minimum lead times |
| Experiential | Tech components, custom build | Material, Fabrication | High |
| Decor/Props | Purchase, sub-rental | Purchase, Sub-Rental | Medium |
| Merchandise | Blank goods, manufacturing | Material, Manufacturing | High — MOQs |
| F&B | Ingredients, equipment | Perishable, Equipment | Critical — freshness |

### 9.3 Three-Way Match Extension

Existing three-way match (PO → Goods Receipt → Invoice from mig 016) extended:

```
Purchase Order → Goods Receipt → Invoice → Work Package Cost Attribution
                                            └→ Budget Line Item Variance Update
```

### 9.4 Vendor Performance Scoring

Vendor performance is tracked per-vertical with metrics:
- **On-time delivery rate** — receipts vs. PO delivery dates
- **Quality score** — QC gate pass rate on vendor-supplied materials
- **Cost variance** — invoice total vs. PO total
- **Responsiveness** — RFQ response time
- **Compliance** — COI/W9/NDA currency

Aggregated into `vendor_risk_scores` (existing table from mig 016) with vertical-specific breakdowns.

---

## 10. Compliance Gating Framework

### 10.1 Compliance Gate Registry

Each vertical declares required compliance gates. Gates block work package progression until satisfied.

| Gate Type | Verticals | Blocking Phase | External Authority |
|-----------|-----------|---------------|-------------------|
| `engineering_stamp` | site_dev, fabrication | Before construction start | PE/SE |
| `structural_inspection` | site_dev, fabrication | Before occupancy | Building dept |
| `fire_marshal` | site_dev, touring, conference, community | Before public access | Fire dept |
| `health_inspection` | food_beverage | Before food service | Health dept |
| `electrical_permit` | site_dev, technical | Before power-up | Electrical inspector |
| `broadcast_standards` | tv_film, media | Before air/delivery | Standards & Practices |
| `color_proof` | print | Before press run | Client/brand team |
| `brand_compliance` | print, conference, merchandise, media | Before production | Brand manager |
| `safety_inspection` | technical, touring, experiential | Before public access | Safety officer |
| `client_approval` | All | Phase-dependent | Client |
| `design_review` | fabrication, experiential | Before fab start | Creative director |
| `sound_check` | technical, touring | Before show | FOH engineer |
| `rights_clearance` | music, media, tv_film | Before distribution | Legal |
| `ada_compliance` | community, conference | Before public access | ADA coordinator |
| `osha_compliance` | site_dev, fabrication, technical | Continuous | Safety officer |

### 10.2 Gate Evaluation Logic

```
CAN_ADVANCE(work_package_id, target_status) =
  ∀ gate ∈ required_gates(work_package_id)
    WHERE gate.blocking_before ≤ target_status:
      gate.status ∈ {passed, conditional_pass, waived}
```

A work package status transition is rejected if any required gate blocking the target status has not been satisfied. The UI surfaces blocking gates with clear call-to-action for the responsible reviewer.

### 10.3 Integration with Existing Compliance Systems

| Existing System | Table | Integration Point |
|-----------------|-------|------------------|
| Permits | `permits` (mig 016) | `qc_gates.permit_id` FK |
| Engineering Approvals | `engineering_approvals` (mig 016) | `qc_gates.gate_type = 'engineering_stamp'` |
| Location Compliance Docs | `location_compliance_docs` (mig 017) | `qc_gates.compliance_doc_id` FK |
| Insurance Certificates | `insurance_certificates` (mig 016) | Vendor compliance check before PO approval |
| Contract Compliance | `contract_milestones` (mig 016) | Contract milestone gates linked to work packages |

### 10.4 Compliance Audit Trail

Every gate status change produces an immutable audit record:
- Who changed status (reviewer profile)
- When (timestamp)
- From/to status
- Evidence attachments (photo, document, certificate)
- Conditions (for conditional_pass)
- Override justification (for waived gates — requires exec-level approval)

---

## 11. Schedule Critical-Path Modeling Logic

### 11.1 Scheduling Model

The schedule engine operates on **work packages** and their **dependencies** to compute critical paths across verticals. This replaces the current single-vertical task dependency model with a cross-vertical work package dependency graph.

```
Input:
  - Work packages with estimated_hours, start_date, due_date
  - Work package dependencies (type, lag, is_hard)
  - QC gates with expected review durations
  - Resource availability (crew, equipment, locations)

Output:
  - Critical path (longest dependency chain)
  - Float per work package (total float, free float)
  - Resource-leveled schedule
  - Conflict alerts (resource over-allocation, dependency violations)
```

### 11.2 Dependency Types

| Type | Semantics | Example |
|------|-----------|---------|
| `finish_to_start` (FS) | B cannot start until A finishes | Scenic fab → tech install |
| `start_to_start` (SS) | B cannot start until A starts | Electrical rough-in ↔ plumbing rough-in |
| `finish_to_finish` (FF) | B cannot finish until A finishes | Painting → touch-up |
| `start_to_finish` (SF) | B cannot finish until A starts | Rare — used for just-in-time |

Lag values (positive or negative) allow buffer or overlap:
- Positive lag: 48h cure time between concrete pour and load-in
- Negative lag (lead): start rigging 4h before scenic install complete

### 11.3 Cross-Vertical Critical Path

A festival project's critical path might traverse:

```
Site Permit Approval (site_dev) [5d]
  → Foundation Pour (site_dev) [3d] + 48h lag
  → Structural Build (site_dev) [10d]
  → Scenic Install (fabrication) [5d]
  → Technical Load-In (technical) [3d]
  → Programming (technical) [2d]
  → Sound Check (technical) [QC gate, 4h]
  → Rehearsal (touring) [1d]
  → Doors Open

Total: 29d + QC gates
Float: F&B prep (parallel, 3d float), Merch setup (parallel, 5d float)
```

### 11.4 Schedule View Modes

| Mode | Audience | Shows |
|------|----------|-------|
| **Gantt** | Project managers | All work packages with dependencies, critical path highlighted |
| **Vertical Timeline** | Vertical leads | Only their vertical's packages with cross-vertical milestones |
| **Resource Calendar** | Crew schedulers | Who is where, when — across all verticals |
| **Milestone Board** | Executives, clients | Key milestones with RAG status |
| **Day-Of Timeline** | Show callers, stage managers | Minute-by-minute ROS integrated with work packages |

### 11.5 Schedule Conflict Detection

| Conflict Type | Detection | Resolution |
|--------------|-----------|------------|
| Resource over-allocation | Crew member assigned to overlapping work packages | Auto-suggest reallocation or overtime |
| Dependency violation | Hard dependency not satisfied at planned start | Block start, notify dependency owner |
| QC gate bottleneck | Multiple work packages waiting on same reviewer | Suggest parallel reviewers or batch review |
| Location conflict | Multiple work packages need same space simultaneously | Stagger scheduling or split zones |
| Equipment conflict | Same asset assigned to overlapping packages | Suggest alternate equipment or rental |

---

## 12. Margin Visibility Architecture

### 12.1 Margin Calculation Layers

```
Revenue Layer
  ├─ Client contract value (from deals/contracts)
  ├─ Revenue schedule (milestone-based recognition)
  ├─ Rental revenue (from rental_agreements)
  ├─ Merchandise sales (POS integration)
  ├─ F&B revenue (POS integration)
  └─ Sponsorship revenue (from sponsor contracts)

Cost Layer
  ├─ Labor (time_entries × rates, grouped by work package)
  ├─ Materials (production_run_inputs actual costs)
  ├─ Vendor services (PO + invoice actual)
  ├─ Equipment (rental costs + owned depreciation)
  ├─ Overhead (allocated % per project)
  ├─ Waste/spoilage (production run waste × unit cost)
  └─ Damage/loss (rental damage charges + insurance claims)

Margin = Revenue − Cost
Margin % = Margin ÷ Revenue × 100
```

### 12.2 Margin Views

**Project-Level Margin Dashboard:**
- Contracted revenue vs. recognized revenue vs. invoiced vs. collected
- Budgeted cost vs. committed vs. actual
- Projected final margin (actual + estimated to complete)
- Margin trend (weekly snapshot)

**Vertical-Level Margin:**
- Per-vertical cost contribution to total project cost
- Vertical-specific revenue allocation (if applicable: F&B, merch, rentals)
- Vertical profitability ranking

**Work Package-Level Margin:**
- Estimated cost (from BOM + labor estimate)
- Actual cost (materials + labor + vendor)
- Cost variance (actual − estimated)
- Efficiency ratio (estimated hours ÷ actual hours)

**Portfolio-Level Margin:**
- Active projects ranked by margin %
- Client profitability analysis
- Vertical profitability across all projects
- Seasonal margin trends

### 12.3 Margin Alert Rules

| Alert | Condition | Action |
|-------|-----------|--------|
| Margin Below Target | project_margin_% < target_margin_% | Notify PM + finance |
| Cost Overrun | work_package actual > 110% of estimate | Notify vertical lead |
| Revenue Shortfall | recognized < scheduled by >10% | Notify account manager |
| F&B Waste Exceeding | waste_% > 15% of input | Notify F&B manager |
| Rental Damage Spike | damage_charges > 5% of rental_revenue | Notify ops manager |
| Overtime Budget Impact | OT_cost > 20% of labor_budget | Notify PM + HR |

### 12.4 Earned Value Metrics

| Metric | Formula | Purpose |
|--------|---------|---------|
| **Planned Value (PV)** | Budget × planned % complete | Baseline schedule value |
| **Earned Value (EV)** | Budget × actual % complete | Value of work performed |
| **Actual Cost (AC)** | Sum of all actual costs | What was spent |
| **Cost Performance Index (CPI)** | EV ÷ AC | Cost efficiency (>1 = under budget) |
| **Schedule Performance Index (SPI)** | EV ÷ PV | Schedule efficiency (>1 = ahead) |
| **Estimate at Completion (EAC)** | Budget ÷ CPI | Projected final cost |
| **Variance at Completion (VAC)** | Budget − EAC | Projected over/under |

---

## 13. Live Deployment Integration Model

### 13.1 Integration with Existing Live Operations (Migration 019)

The production kernel connects to live operations through work packages that transition to live execution:

```
Work Package (status: done)
  ↓ Deployment
Live Event Instance (from mig 019)
  ├─ ROS Cues (sequenced execution)
  ├─ Department Status (per-vertical readiness)
  ├─ Equipment Status (per-asset operational state)
  ├─ FOH Operations (audience management)
  └─ Real-Time Metrics
```

### 13.2 Pre-Show Readiness Matrix

Before a live event can proceed, each active vertical must confirm readiness through its QC gates:

| Vertical | Readiness Criteria | Gate Type |
|----------|-------------------|-----------|
| Site Dev | All punch list items resolved, occupancy permit obtained | structural_inspection, fire_marshal |
| Fabrication | All scenic elements installed, structural QC passed | general_qc |
| Technical | All systems tested, show control verified | safety_inspection, sound_check |
| Media | All content loaded, tested on target displays | general_qc |
| F&B | Health inspection passed, all stations prepped, staff briefed | health_inspection |
| Decor/Props | All items placed per floor plan, damage-free | general_qc |
| Merchandise | POS operational, inventory counted, staff trained | general_qc |

### 13.3 Live-to-Wrap Transition

After live execution, work packages transition to wrap/reconciliation:

```
Live Event Complete
  ├─ Strike work packages auto-created (reverse of load-in)
  ├─ Rental return work packages auto-created
  ├─ F&B waste logging work packages auto-created
  ├─ Merchandise inventory reconciliation triggered
  ├─ Touring settlement work package created (if touring vertical)
  ├─ Time entries finalized and submitted for approval
  └─ Post-mortem/wrap report work package created
```

### 13.4 Settlement Model (Touring Vertical)

For touring/festival productions, each date produces a settlement:

```
Settlement
  ├─ Gross Revenue (ticket sales, merch, F&B, sponsorship)
  ├─ Deductions (venue fees, promoter share, taxes, ASCAP/BMI)
  ├─ Artist Guarantee vs. Backend Split
  ├─ Production Costs (from work packages for that date/location)
  ├─ Net Settlement
  └─ Variance vs. Budget (auto-calculated)
```

This links to `work_packages` filtered by `event_id` and `location_id` for the specific tour date.

---

## 14. UI/UX Cognitive Load Minimization Principles

### 14.1 Core Problem

A festival project manager oversees 14 verticals simultaneously. Without cognitive load management, they face 50+ work package types, 40+ budget categories, 15+ compliance gate types, and hundreds of concurrent tasks. The UI must **collapse complexity to the user's current context** while preserving the ability to expand into any vertical's detail.

### 14.2 Vertical-Scoped Views

Every production UI defaults to the user's **active vertical context**:

| User Role | Default Vertical Scope | Can Expand To |
|-----------|----------------------|---------------|
| Technical Director | technical | All (cross-vertical deps visible) |
| Scenic Shop Lead | fabrication | site_dev (structural deps) |
| F&B Manager | food_beverage | Only F&B |
| Print Producer | print | media (content deps) |
| Merch Manager | merchandise | print (packaging deps) |
| Stylist | decor_props | Only decor/props |
| Project Manager | All verticals (filterable) | N/A — full access |
| Executive | All verticals (summary) | Drill-down on demand |

### 14.3 Progressive Disclosure Layers

**Layer 1 — Dashboard (Glanceable):**
- Per-vertical RAG status (red/amber/green)
- Budget burn % per vertical
- Blocking QC gates count
- Critical path items due today/this week

**Layer 2 — Work Package Board (Actionable):**
- Kanban by status within active vertical
- Inline QC gate status indicators
- Budget variance badges on each card
- Dependency arrows (cross-vertical highlighted)

**Layer 3 — Work Package Detail (Deep Dive):**
- Full BOM with costed lines
- Production run history with yield/waste
- QC gate timeline with evidence
- Time entries and labor cost
- Linked POs, invoices, contracts
- Technical spec compliance

### 14.4 Context-Aware Filtering

The system automatically filters options based on active vertical:

| UI Element | Without Context | With Vertical Context |
|-----------|----------------|----------------------|
| Budget categories | 43 options | 8-12 relevant to vertical |
| Work package types | 40+ options | 3-8 for active vertical |
| QC gate types | 15 options | 2-4 required by vertical |
| Asset categories | 20+ options | 5-8 relevant to vertical |
| Incident templates | Generic form | Vertical-specific fields |

### 14.5 Cross-Vertical Awareness

While scoped, the UI surfaces cross-vertical information when relevant:

- **Blocking Dependencies:** Red indicator on work packages blocked by another vertical's incomplete work
- **Shared Resources:** Warning when crew/equipment is allocated to packages in other verticals
- **Budget Impact:** Side panel showing how this vertical's spend affects overall project margin
- **Compliance Cascade:** Notification when a compliance gate in one vertical blocks downstream verticals

### 14.6 Command Bar (⌘K)

The universal command bar supports production-specific commands:

```
> Create work package [vertical] [type]
> Search BOMs containing [material]
> Show blocking QC gates for [project]
> Find assets with [spec_key] > [value]
> Show budget variance for [vertical]
> Advance [work_package] to [status]
> Log production run for [work_package]
```

### 14.7 Mobile-First Field Workflows

| Workflow | Offline Capable | Primary Input |
|----------|----------------|---------------|
| QC inspection | Yes — syncs on reconnect | Camera (evidence photos) + checklist |
| Time entry | Yes | Start/stop timer + notes |
| Receiving | Yes | Barcode scan + quantity + condition |
| Incident report | Yes | Camera + voice-to-text + location |
| Production run logging | Yes | Quantity fields + waste |
| Rental check-in/out | Yes | Barcode scan + condition photo |
| F&B waste logging | Yes | Category + quantity + reason |

### 14.8 Performance Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| Initial dashboard render | <200ms | Glanceable status must be instant |
| Work package board render | <300ms | Kanban must feel responsive |
| Cross-vertical search | <500ms | Full-text + spec search across all verticals |
| BOM cost roll-up | <100ms | Real-time cost visibility |
| Offline action queue | Unlimited | Field workers can't wait for connectivity |
| Sync reconciliation | <5s | Post-reconnect sync should be fast |

---

## 15. Automation & AI Augmentation Roadmap

### 15.1 Phase 0 — Rule-Based Automation (Sprint 1-2)

| # | Automation | Trigger | Action |
|---|-----------|---------|--------|
| R1 | **Auto-create QC gates** | Work package created | Insert required gates from vertical's `default_qc_gates` |
| R2 | **Budget line auto-link** | Work package created with cost estimate | Create/link budget line item with cost code |
| R3 | **Dependency notification** | Upstream work package completes | Notify downstream work package lead |
| R4 | **QC gate reminder** | Gate pending >24h | Notify assigned reviewer |
| R5 | **Budget threshold alert** | Committed exceeds 90% of budgeted | Notify PM + finance |
| R6 | **Rights expiry warning** | License end_date within 30 days | Notify legal + PM |
| R7 | **Rental return reminder** | Return date approaching (48h) | Notify ops + client |
| R8 | **Production run yield alert** | yield_percent < 85% | Notify QC lead + vertical lead |
| R9 | **Strike sequence generation** | Live event moves to strike phase | Auto-create reverse load-in work packages |
| R10 | **Settlement calculation** | All tour date work packages closed | Auto-compute settlement vs. budget |

### 15.2 Phase 1 — Smart Automation (Sprint 3-4)

| # | Automation | Input | Output |
|---|-----------|-------|--------|
| S1 | **BOM cost optimizer** | BOM with priced lines | Suggest cheaper approved alternates |
| S2 | **Resource leveling** | Work packages + crew availability | Suggest schedule adjustments to eliminate over-allocation |
| S3 | **Vendor recommendation** | Work package type + location + budget | Rank vendors by performance score + proximity + price |
| S4 | **Cross-vertical conflict detector** | All active work packages | Surface location/resource/timeline conflicts |
| S5 | **Compliance gap detector** | Vertical's required gates vs. actual | Flag missing compliance documents |
| S6 | **Budget forecast** | Historical burn rate + remaining work | Project estimated final cost + completion date |

### 15.3 Phase 2 — AI-Assisted (Sprint 5-8)

| # | Capability | Model Input | Model Output |
|---|-----------|-------------|-------------|
| A1 | **BOM generation from design** | CAD/design file + material library | Draft BOM with quantities and costs |
| A2 | **Schedule optimization** | Work packages + dependencies + constraints | Optimized schedule minimizing total duration |
| A3 | **Waste prediction** | Historical production run data | Predicted yield per BOM, flagging likely waste spikes |
| A4 | **Scope creep detection** | Change request patterns + budget trajectory | Early warning when scope is expanding beyond tolerance |
| A5 | **Natural language QC reports** | QC gate evidence (photos, notes) | Structured QC report with pass/fail recommendation |
| A6 | **Intelligent crew matching** | Work package requirements + crew skills/certs | Optimal crew assignment across verticals |

### 15.4 Phase 3 — Advanced AI (Future)

| # | Capability | Description |
|---|-----------|-------------|
| X1 | **Digital twin simulation** | Virtual model of entire production — simulate schedule changes before committing |
| X2 | **Autonomous scheduling** | AI proposes and executes schedule adjustments within approved parameters |
| X3 | **Predictive maintenance** | Asset sensor data → predict equipment failure before it impacts production |
| X4 | **Dynamic pricing (rentals)** | Demand + availability + seasonality → optimal rental pricing |
| X5 | **Real-time margin optimization** | Continuously suggest cost reduction opportunities during live production |

---

## 16. Implementation Roadmap

### Phase 1 — Production Kernel (Sprints 1-2)

**Migration:** `021_integrated_production_lifecycle.sql`

**Deliverables:**
- New enums: `work_package_status`, `production_run_status`, `bom_type`, `bom_item_type`, `qc_gate_type`, `qc_gate_status`, `rights_type`, `rights_status`, `rental_agreement_type`, `rental_status`
- New tables: `production_verticals`, `work_packages`, `work_package_dependencies`, `boms`, `bom_lines`, `production_runs`, `production_run_inputs`, `qc_gates`, `technical_specs`, `rights_licenses`, `rental_agreements`, `rental_agreement_lines`
- Extended enums: `department`, `budget_category`, `project_type`
- Junction table: `vendor_vertical_capabilities`
- Roll-up views: `v_work_package_cost_summary`, `v_vertical_budget_summary`, `v_project_margin_summary`
- RLS policies on all new tables
- TypeScript types: `src/types/production-lifecycle.ts`
- Domain config entries for all new enums
- Status variant/label entries
- RBAC entries for new resources

**Verification:**
- `tsc --noEmit --skipLibCheck` = 0 errors
- Migration applies cleanly
- All FK references resolve
- No type export collisions

### Phase 2 — UI Surfaces (Sprints 3-4)

**New Pages:**
- `/work-packages` — Kanban board with vertical filtering
- `/work-packages/[id]` — Detail view with BOM, QC gates, production runs, costs
- `/boms` — BOM library with search, versioning, cost roll-up
- `/production-runs` — Run tracking with yield/waste metrics
- `/qc-gates` — Gate queue with reviewer assignment
- `/rights-licensing` — IP rights tracker with expiry alerts
- `/rental-agreements` — Rental lifecycle management
- `/technical-specs` — Parametric spec search across assets/locations

**Navigation:** New "Production" section with sub-items for each page

### Phase 3 — Cross-Vertical Intelligence (Sprints 5-6)

- Cross-vertical dependency visualization (Gantt with multi-vertical lanes)
- Budget roll-up dashboards with vertical breakdown
- Margin visibility dashboards (project, vertical, work package levels)
- Compliance gate dashboard (all verticals, all projects)
- Schedule conflict detection and resolution UI

### Phase 4 — Automation & AI (Sprints 7-10)

- Phase 0 rule-based automations (R1-R10)
- Phase 1 smart automations (S1-S6)
- Phase 2 AI capabilities (A1-A6) — requires ML infrastructure
- Mobile-first field workflows (offline QC, receiving, time, incidents)

---

## Appendix A — Migration Dependency Map

```
Existing:
  001_initial_schema
  003_production_lifecycle
  012_production_consolidation
  016_legal_compliance_finance_procurement
  017_user_lifecycle_identity
  018_asset_inventory_logistics
  019_live_event_operations
  020_location_spatial_hierarchy

New:
  021_integrated_production_lifecycle
    ├─ depends on: 003 (production enums, projects, tasks, assets, budgets)
    ├─ depends on: 012 (consolidated tasks, milestones, junction tables)
    ├─ depends on: 016 (contracts, permits, compliance docs)
    ├─ depends on: 018 (asset classes, warehouse zones, consumables)
    ├─ depends on: 019 (live_event_instances for deployment link)
    └─ depends on: 020 (locations, spatial hierarchy)
```

## Appendix B — Glossary

| Term | Definition |
|------|-----------|
| **Work Package** | Scoped unit of production work within a vertical, linked to BOM, QC gates, and budget |
| **BOM** | Bill of Materials — hierarchical recipe/formula/material list for producing an output |
| **Production Run** | Single execution instance of a BOM, tracking inputs, outputs, yield, and waste |
| **QC Gate** | Quality control checkpoint that must be cleared before a work package can advance |
| **Vertical** | Production discipline (e.g., fabrication, technical, F&B) with its own lifecycle phases |
| **Technical Spec** | Structured, queryable specification entry with key, value, unit, and tolerance |
| **Rights License** | IP usage record tracking clearance, territory, medium, fees, and expiry |
| **Rental Agreement** | Contract for asset rental/sale with line items, damage tracking, and reconciliation |
| **Cost Code** | Structured identifier encoding vertical + budget category for financial attribution |
| **Critical Path** | Longest dependency chain through work packages, determining minimum project duration |
| **Earned Value** | Project management metric comparing planned work, completed work, and actual cost |
| **Settlement** | Post-event financial reconciliation for touring productions |
