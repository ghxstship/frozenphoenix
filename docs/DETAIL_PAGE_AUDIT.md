# Detail Page Audit & Implementation Plan

> **Produced:** 2026-03-01
> **Scope:** All `[id]` detail routes under `/(dashboard)/`, cross-referenced against DB schema (34 migrations, ~250 tables), navigation config (95+ items across 11 sections), and list pages with clickable entity rows.
> **Deployment Readiness Score: 4/10** (detail layer)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Existing Detail Pages — Inventory & Quality Audit](#2-existing-detail-pages)
3. [Broken Links — List Pages Linking to Non-Existent Detail Pages](#3-broken-links)
4. [Missing Detail Pages — Prioritized Gap Analysis](#4-missing-detail-pages)
5. [Existing Detail Page Quality Issues](#5-quality-issues)
6. [Shared Infrastructure Requirements](#6-shared-infrastructure)
7. [Implementation Plan](#7-implementation-plan)
8. [Entity–Detail Page Matrix](#8-entity-matrix)
9. [Appendix A: DB Table → Detail Page Mapping](#appendix-a)
10. [Appendix B: Tab Architecture per Detail Page](#appendix-b)

---

## 1. Executive Summary

### Current State

| Metric                                                          | Count  |
| --------------------------------------------------------------- | ------ |
| Dashboard list pages                                            | 95+    |
| Existing `[id]` detail pages                                    | 15     |
| List pages with clickable rows to **non-existent** detail pages | 7      |
| DB entity tables that warrant a detail page                     | 38     |
| **Missing detail pages (total)**                                | **23** |
| Missing detail pages — **P0 (broken links)**                    | **7**  |
| Missing detail pages — **P1 (core entities)**                   | **8**  |
| Missing detail pages — **P2 (secondary entities)**              | **5**  |
| Missing detail pages — **P3 (specialized)**                     | **3**  |

### Key Findings

1. **7 broken links exist today** — List pages render `<Link href={`/entity/${id}`}>` to detail routes that don't exist. Users clicking these rows hit 404. This is the highest-priority fix.
2. **Architectural inconsistency** — 8 of 15 existing detail pages use the canonical `DetailLayout` + `useQueryTabState` + `RecordChatter` pattern. The remaining 7 (`invoices/[id]`, `contracts/[id]`, `proposals/[id]`, `decks/[id]`, `brand-kit/[id]`, `call-sheets/[id]`, `tech-sheets/[id]`) use older ad-hoc layouts with `PageHeader` or raw markup.
3. **No cross-entity navigation** — Detail pages don't link to related entity detail pages (e.g., a project detail doesn't link to its budget detail, a deal detail doesn't link to its contact/company detail).
4. **RecordChatter coverage is good** — All 8 `DetailLayout`-based pages include the activity/comment chatter tab, but the 7 legacy-pattern pages do not.

---

## 2. Existing Detail Pages — Inventory & Quality Audit

### 15 Existing Detail Pages

| #   | Route                 | Lines | Layout              | Tabs                                                  | Sidebar | Chatter | Query State | Supabase Hooks                                 | Quality |
| --- | --------------------- | ----- | ------------------- | ----------------------------------------------------- | ------- | ------- | ----------- | ---------------------------------------------- | ------- |
| 1   | `projects/[id]`       | 469   | DetailLayout        | 6 (overview, tasks, team, budget, approvals, chatter) | ✅      | ✅      | ✅          | ✅ update, delete, createTask                  | ★★★★    |
| 2   | `deals/[id]`          | 401   | DetailLayout        | 3 (overview, activity, notes)                         | ✅      | ❌      | ✅          | ✅ update, deals, createProject, createComment | ★★★★    |
| 3   | `vendors/[id]`        | 420   | DetailLayout        | 4 (overview, orders, invoices, compliance)            | ✅      | ❌      | ✅          | ✅ update, createPO                            | ★★★★    |
| 4   | `assets/[id]`         | 395   | DetailLayout        | tabs                                                  | ✅      | ✅      | ✅          | ✅                                             | ★★★★    |
| 5   | `crew/[id]`           | 412   | DetailLayout        | tabs                                                  | ✅      | ✅      | ✅          | ✅                                             | ★★★★    |
| 6   | `tasks/[id]`          | 311   | DetailLayout        | 3 (overview, subtasks, comments)                      | ✅      | ❌      | ✅          | ✅ update, delete                              | ★★★☆    |
| 7   | `locations/[id]`      | 542   | DetailLayout        | tabs                                                  | ✅      | ✅      | ✅          | ✅                                             | ★★★★    |
| 8   | `knowledge-base/[id]` | 478   | DetailLayout        | tabs                                                  | ✅      | ✅      | ✅          | ✅                                             | ★★★★    |
| 9   | `proposals/[id]`      | 666   | PageHeader (legacy) | ❌ sections                                           | ❌      | ❌      | ❌          | ❌                                             | ★★☆☆    |
| 10  | `invoices/[id]`       | 244   | PageHeader (legacy) | ❌                                                    | ❌      | ❌      | ❌          | ❌                                             | ★★☆☆    |
| 11  | `contracts/[id]`      | 254   | PageHeader (legacy) | ❌                                                    | ❌      | ❌      | ❌          | ❌                                             | ★★☆☆    |
| 12  | `decks/[id]`          | 265   | Ad-hoc              | ❌                                                    | ❌      | ❌      | ❌          | ❌                                             | ★★☆☆    |
| 13  | `brand-kit/[id]`      | 369   | Ad-hoc              | ❌                                                    | ❌      | ❌      | ❌          | ❌                                             | ★★☆☆    |
| 14  | `call-sheets/[id]`    | 206   | Ad-hoc              | ❌                                                    | ❌      | ❌      | ❌          | ❌                                             | ★☆☆☆    |
| 15  | `tech-sheets/[id]`    | 226   | Ad-hoc              | ❌                                                    | ❌      | ❌      | ❌          | ❌                                             | ★☆☆☆    |

### Quality Legend

- ★★★★ — Canonical pattern (DetailLayout + tabs + sidebar + chatter + query state + mutations)
- ★★★☆ — Good but missing chatter or cross-links
- ★★☆☆ — Legacy layout, no tabs, no sidebar, no chatter, hardcoded mock
- ★☆☆☆ — Minimal detail view, effectively a read-only card

---

## 3. Broken Links — List Pages Linking to Non-Existent Detail Pages

These are **P0 bugs** — users see clickable rows that 404.

| #   | List Page              | Link Target             | DB Table            | Priority |
| --- | ---------------------- | ----------------------- | ------------------- | -------- |
| 1   | `activations/page.tsx` | `/activations/${id}`    | `activations`       | **P0**   |
| 2   | `budgets/page.tsx`     | `/budgets/${id}`        | `budgets`           | **P0**   |
| 3   | `events/page.tsx`      | `/events/${id}`         | `events`            | **P0**   |
| 4   | `incidents/page.tsx`   | `/incidents/${id}`      | `incidents`         | **P0**   |
| 5   | `leads/page.tsx`       | `/leads/${id}`          | `leads`             | **P0**   |
| 6   | `shipments/page.tsx`   | `/shipments/${id}`      | `shipments`         | **P0**   |
| 7   | `templates/page.tsx`   | `/templates/${id}/edit` | `project_templates` | **P0**   |

---

## 4. Missing Detail Pages — Prioritized Gap Analysis

### Tier 1: P0 — Broken-Link Fixes (7 pages)

These MUST be built first because live UI routes already point to them.

#### 4.1 `/activations/[id]`

- **DB tables:** `activations`, `activation_assets`, `activity_assets`, `activity_consumables`
- **Parent entity:** Project (FK `project_id`)
- **Tabs:** Overview, Assets, Activities, Timeline, Chatter
- **Sidebar:** Location, dates, type, status, project link, budget summary
- **Actions:** Edit, Clone, Archive, Delete
- **Cross-links:** → Project detail, → Location detail, → Asset detail

#### 4.2 `/budgets/[id]`

- **DB tables:** `budgets`, `budget_line_items`, `budget_alerts`, `budget_approvals`
- **Parent entity:** Project (FK `project_id`)
- **Tabs:** Overview (burn chart), Line Items, Alerts, Approvals, Chatter
- **Sidebar:** Project link, total/spent/remaining, status, approval state
- **Actions:** Edit, Add Line Item, Submit for Approval, Export
- **Cross-links:** → Project detail, → Invoice detail, → Approval detail

#### 4.3 `/events/[id]`

- **DB tables:** `events`, `event_assets`, `activations` (FK `event_id`), `live_event_instances`
- **Parent entity:** Project (FK `project_id`)
- **Tabs:** Overview, Activations, Assets, Logistics, Live Ops, Chatter
- **Sidebar:** Venue/location, dates, status, headcount, project link
- **Actions:** Edit, Launch Live Ops, Clone, Archive
- **Cross-links:** → Project detail, → Location detail, → Activation detail, → Live Ops dashboard

#### 4.4 `/incidents/[id]`

- **DB tables:** `incidents`, `incident_insurance_links`, `guest_incidents`
- **Tabs:** Overview, Response Timeline, Insurance, Documents, Chatter
- **Sidebar:** Severity, status, location, assigned to, reported by, date
- **Actions:** Escalate, Resolve, Link Insurance Claim
- **Cross-links:** → Event detail, → Location detail, → Insurance Policy detail

#### 4.5 `/leads/[id]`

- **DB tables:** `leads`, `lead_activities`, `contacts`, `companies`
- **Tabs:** Overview, Activity Log, Contact Info, Chatter
- **Sidebar:** Score, source, status, assigned to, company link
- **Actions:** Edit, Convert to Opportunity, Convert to Deal, Disqualify
- **Cross-links:** → Company detail, → Deal detail (post-conversion)

#### 4.6 `/shipments/[id]`

- **DB tables:** `shipments`, `shipment_items`, `logistics_events`
- **Parent entity:** Project or Event (FK)
- **Tabs:** Overview, Items, Tracking Log, Documents, Chatter
- **Sidebar:** Carrier, tracking number, origin/destination, status, ETA
- **Actions:** Update Status, Add Tracking Event, Print Manifest
- **Cross-links:** → Project detail, → Event detail, → Warehouse detail

#### 4.7 `/templates/[id]`

- **DB tables:** `project_templates`
- **Tabs:** Overview, Structure (phases/tasks/milestones), Settings, Chatter
- **Sidebar:** Template type, created by, usage count, last used
- **Actions:** Edit, Clone as Project, Delete
- **Cross-links:** → Projects created from this template

---

### Tier 2: P1 — Core Business Entities (8 pages)

Entities with dedicated list pages, dedicated DB tables, and >1 FK relationship. Missing detail pages create workflow dead-ends.

#### 4.8 `/opportunities/[id]`

- **DB tables:** `opportunities`, `opportunity_activities`, `contacts`, `proposals`
- **Tabs:** Overview, Activities, Proposals, Contacts, Chatter
- **Sidebar:** Stage pipeline visualization, value, probability, close date, assigned to
- **Actions:** Edit, Advance Stage, Convert to Deal, Create Proposal
- **Cross-links:** → Deal detail, → Proposal detail, → Company detail

#### 4.9 `/companies/[id]`

- **DB tables:** `companies`, `contacts`, `deals`, `projects`, `invoices`
- **Tabs:** Overview, Contacts, Deals, Projects, Invoices, Chatter
- **Sidebar:** Industry, size, website, primary contact, account health score
- **Actions:** Edit, Create Deal, Create Contact, Archive
- **Cross-links:** → Contact detail, → Deal detail, → Project detail, → Invoice detail

#### 4.10 `/campaigns/[id]`

- **DB tables:** `campaigns`, `campaign_assets`, `campaign_channels`, `campaign_kpis`, `campaign_metrics`
- **Tabs:** Overview, Assets, Channels, KPIs & Metrics, Chatter
- **Sidebar:** Status, budget, date range, target audience, brand link
- **Actions:** Edit, Duplicate, Launch, Pause, End
- **Cross-links:** → Brand Kit detail, → Creative Asset detail, → Brief detail

#### 4.11 `/estimates/[id]`

- **DB tables:** `estimates`, `budget_line_items` (estimated)
- **Tabs:** Overview, Line Items, Comparison (vs actual), Chatter
- **Sidebar:** Project link, total, status, approved by, version
- **Actions:** Edit, Approve, Convert to Budget, Export PDF
- **Cross-links:** → Project detail, → Budget detail

#### 4.12 `/work-orders/[id]`

- **DB tables:** `work_orders`, `work_order_bids`
- **Parent entity:** Project or Event
- **Tabs:** Overview, Bids, Assignments, Documents, Chatter
- **Sidebar:** Vendor, status, priority, due date, estimated cost
- **Actions:** Edit, Assign Vendor, Accept Bid, Complete
- **Cross-links:** → Vendor detail, → Project detail

#### 4.13 `/expenses/[id]`

- **DB tables:** `expenses`, `production_expenses`
- **Tabs:** Overview, Receipts/Attachments, Approval History, Chatter
- **Sidebar:** Category, amount, project, submitted by, status, reimbursement
- **Actions:** Edit, Approve, Reject, Request Receipt
- **Cross-links:** → Project detail, → Budget detail

#### 4.14 `/scopes-of-work/[id]`

- **DB tables:** `scopes_of_work`, `sow_deliverables`, `sow_change_log`
- **Tabs:** Overview, Deliverables, Change Log, Approvals, Chatter
- **Sidebar:** Project link, status, version, total value, client
- **Actions:** Edit, Add Deliverable, Submit for Approval, Export
- **Cross-links:** → Project detail, → Deliverable progress, → Proposal detail

#### 4.15 `/briefs/[id]`

- **DB tables:** `creative_briefs`, `brief_templates`
- **Tabs:** Overview, Requirements, Assets, Feedback, Chatter
- **Sidebar:** Type, status, brand, due date, assigned to, project link
- **Actions:** Edit, Assign, Submit for Review, Approve
- **Cross-links:** → Campaign detail, → Brand Kit detail, → Project detail

---

### Tier 3: P2 — Secondary Entities (5 pages)

Entities with list pages and DB tables but currently no clickable row links. Adding detail pages completes the entity lifecycle.

#### 4.16 `/digital-assets/[id]`

- **DB tables:** `digital_assets`, `asset_versions`, `asset_tag_assignments`, `asset_channel_deployments`
- **Tabs:** Overview, Versions, Deployments, Usage & Analytics, Chatter
- **Sidebar:** File preview, format, dimensions, size, tags, rights status
- **Actions:** Download, New Version, Deploy, Archive, Set Rights
- **Cross-links:** → Campaign detail, → Brand Kit detail

#### 4.17 `/creative-assets/[id]`

- **DB tables:** `creative_reviews`, `digital_assets` (related)
- **Tabs:** Overview, Review Rounds, Comments, Version History, Chatter
- **Sidebar:** Status, reviewer, round number, due date, brand compliance
- **Actions:** Start Review, Approve, Request Changes, Reject
- **Cross-links:** → Brief detail, → Campaign detail, → Digital Asset detail

#### 4.18 `/permits/[id]`

- **DB tables:** `permits`, `location_compliance_docs`
- **Tabs:** Overview, Requirements, Documents, Timeline, Chatter
- **Sidebar:** Type, jurisdiction, status, expiry, location, project
- **Actions:** Edit, Renew, Upload Document, Mark Expired
- **Cross-links:** → Location detail, → Event detail

#### 4.19 `/insurance-policies/[id]`

- **DB tables:** `insurance_policies`, `insurance_requirements`, `incident_insurance_links`
- **Tabs:** Overview, Coverage Details, Claims, Documents, Chatter
- **Sidebar:** Provider, policy number, coverage amount, expiry, status
- **Actions:** Edit, Renew, File Claim, Upload Certificate
- **Cross-links:** → Vendor detail, → Incident detail, → Project detail

#### 4.20 `/recurring-invoices/[id]`

- **DB tables:** `recurring_invoices`, `client_invoices` (generated)
- **Tabs:** Overview, Schedule, Generated Invoices, Chatter
- **Sidebar:** Client, frequency, next date, amount, status
- **Actions:** Edit, Pause, Resume, Generate Now
- **Cross-links:** → Company detail, → Invoice detail (generated)

---

### Tier 4: P3 — Specialized Entities (3 pages)

Lower-traffic entities that complete domain-specific workflows.

#### 4.21 `/change-orders/[id]`

- **DB tables:** `change_orders`, `change_order_log`
- **Tabs:** Overview, Impact Analysis, Approval Chain, Chatter
- **Sidebar:** SOW link, status, requested by, cost impact, date
- **Actions:** Approve, Reject, Request Revision
- **Cross-links:** → SOW detail, → Project detail, → Budget detail

#### 4.22 `/service-requests/[id]`

- **DB tables:** `service_requests`, `sla_tracking`, `sla_definitions`
- **Tabs:** Overview, SLA Tracking, Communications, Resolution, Chatter
- **Sidebar:** Priority, status, SLA countdown, assigned to, requester
- **Actions:** Assign, Escalate, Resolve, Close
- **Cross-links:** → Company detail, → Project detail

#### 4.23 `/certifications/[id]`

- **DB tables:** `certifications`, `asset_certifications`
- **Tabs:** Overview, Requirements, Compliance History, Chatter
- **Sidebar:** Issuing body, type, status, expiry, crew member/asset
- **Actions:** Renew, Upload Proof, Expire
- **Cross-links:** → Crew detail, → Asset detail

---

## 5. Existing Detail Page Quality Issues

### 5.1 Layout Inconsistency (7 pages need migration)

The following pages use legacy `PageHeader` or ad-hoc layouts instead of the canonical `DetailLayout` + `useQueryTabState` pattern:

| Page               | Current Pattern           | Required Migration               |
| ------------------ | ------------------------- | -------------------------------- |
| `proposals/[id]`   | PageHeader, section-based | Migrate to DetailLayout + 5 tabs |
| `invoices/[id]`    | PageHeader, single view   | Migrate to DetailLayout + 4 tabs |
| `contracts/[id]`   | PageHeader, section-based | Migrate to DetailLayout + 5 tabs |
| `decks/[id]`       | Ad-hoc layout             | Migrate to DetailLayout + 3 tabs |
| `brand-kit/[id]`   | Ad-hoc layout             | Migrate to DetailLayout + 3 tabs |
| `call-sheets/[id]` | Ad-hoc layout             | Migrate to DetailLayout + 3 tabs |
| `tech-sheets/[id]` | Ad-hoc layout             | Migrate to DetailLayout + 3 tabs |

### 5.2 Missing RecordChatter (2 canonical pages)

| Page           | Has Chatter Tab?              | Fix                                             |
| -------------- | ----------------------------- | ----------------------------------------------- |
| `deals/[id]`   | ❌ (has basic "Activity" tab) | Replace Activity tab content with RecordChatter |
| `vendors/[id]` | ❌                            | Add Chatter tab                                 |

### 5.3 Missing Cross-Entity Navigation

No existing detail page links to related entity detail pages. Examples of missing links:

- **Project detail** → Budget detail, Event detail, SOW detail, related Deals
- **Deal detail** → Company detail, Opportunity detail, converted Project
- **Vendor detail** → Contract detail, related Incidents
- **Asset detail** → Location detail, Project detail
- **Invoice detail** → Project detail, Contract detail, Company detail
- **Task detail** → assignee Crew detail

### 5.4 Missing Supabase Integration

7 legacy-pattern pages use only hardcoded mock data with zero Supabase hooks:
`proposals/[id]`, `invoices/[id]`, `contracts/[id]`, `decks/[id]`, `brand-kit/[id]`, `call-sheets/[id]`, `tech-sheets/[id]`

---

## 6. Shared Infrastructure Requirements

### 6.1 Cross-Entity Link Component

A reusable `<EntityLink>` component already exists in `src/components/linked-records.tsx`. It needs to be deployed consistently across all detail page sidebars and overview tabs.

**Pattern:**

```tsx
<EntityLink type="project" id={projectId} label={projectName} />
```

### 6.2 Detail Page Factory Pattern

To ensure consistency across 23 new pages + 7 migrated pages, establish a generation pattern:

```
DetailLayout
├── backHref + backLabel (parent list)
├── title + subtitle + status badge
├── avatar (entity initial or icon)
├── actions (Edit button + context-specific)
├── menuItems (overflow: archive, delete, etc.)
├── tabs (TabBar via useQueryTabState)
│   ├── Overview (stats grid + recent related entities)
│   ├── [Domain-specific tabs] (line items, assignments, etc.)
│   └── Chatter (RecordChatter — always last tab)
├── sidebar
│   ├── Entity Details card (key fields)
│   ├── Related Entities card (EntityLinks)
│   └── Alert cards (expiring, overdue, etc.)
└── Dialogs (inline create: add line item, assign, etc.)
```

### 6.3 Required New Hooks

Some new detail pages require Supabase hooks not yet in `hooks.ts` or `hooks-extended.ts`:

| Hook                       | Table                    | Needed By               |
| -------------------------- | ------------------------ | ----------------------- |
| `useActivation`            | `activations`            | activations/[id]        |
| `useBudgetLineItems`       | `budget_line_items`      | budgets/[id]            |
| `useBudgetAlerts`          | `budget_alerts`          | budgets/[id]            |
| `useEvent`                 | `events`                 | events/[id]             |
| `useEventAssets`           | `event_assets`           | events/[id]             |
| `useIncident`              | `incidents`              | incidents/[id]          |
| `useLead`                  | `leads`                  | leads/[id]              |
| `useLeadActivities`        | `lead_activities`        | leads/[id]              |
| `useShipment`              | `shipments`              | shipments/[id]          |
| `useShipmentItems`         | `shipment_items`         | shipments/[id]          |
| `useOpportunity`           | `opportunities`          | opportunities/[id]      |
| `useOpportunityActivities` | `opportunity_activities` | opportunities/[id]      |
| `useCompany`               | `companies`              | companies/[id]          |
| `useCampaign`              | `campaigns`              | campaigns/[id]          |
| `useCampaignAssets`        | `campaign_assets`        | campaigns/[id]          |
| `useCampaignMetrics`       | `campaign_metrics`       | campaigns/[id]          |
| `useEstimate`              | `estimates`              | estimates/[id]          |
| `useWorkOrder`             | `work_orders`            | work-orders/[id]        |
| `useWorkOrderBids`         | `work_order_bids`        | work-orders/[id]        |
| `useExpense`               | `expenses`               | expenses/[id]           |
| `useScopeOfWork`           | `scopes_of_work`         | scopes-of-work/[id]     |
| `useSowDeliverables`       | `sow_deliverables`       | scopes-of-work/[id]     |
| `useCreativeBrief`         | `creative_briefs`        | briefs/[id]             |
| `useDigitalAsset`          | `digital_assets`         | digital-assets/[id]     |
| `useCreativeReview`        | `creative_reviews`       | creative-assets/[id]    |
| `usePermit`                | `permits`                | permits/[id]            |
| `useInsurancePolicy`       | `insurance_policies`     | insurance-policies/[id] |
| `useRecurringInvoice`      | `recurring_invoices`     | recurring-invoices/[id] |
| `useChangeOrder`           | `change_orders`          | change-orders/[id]      |
| `useServiceRequest`        | `service_requests`       | service-requests/[id]   |
| `useCertification`         | `certifications`         | certifications/[id]     |

---

## 7. Implementation Plan

### Phase 1: P0 — Fix Broken Links (Week 1–2)

**Goal:** Eliminate all 404s from clickable list page rows.
**Pages:** 7 new detail pages
**Effort:** ~2–3 days per page (avg 350–450 lines each)

| Day | Deliverable                                                                                |
| --- | ------------------------------------------------------------------------------------------ |
| 1–2 | `activations/[id]` — 5 tabs, Supabase hooks, cross-links to project/location               |
| 3–4 | `events/[id]` — 6 tabs, live ops launch action, cross-links to project/location/activation |
| 5–6 | `budgets/[id]` — 5 tabs with BurnChart, line items, alerts, approval flow                  |
| 7–8 | `leads/[id]` — 4 tabs, convert-to-opportunity action, activity log                         |
| 9   | `incidents/[id]` — 5 tabs, severity-aware UI, insurance linking                            |
| 10  | `shipments/[id]` — 5 tabs, tracking timeline, logistics events                             |
| 11  | `templates/[id]` — 4 tabs, clone-as-project action, structure editor                       |

**Verification:** Zero broken `<Link>` targets. All 7 pages pass TypeScript + ESLint. Each uses DetailLayout + useQueryTabState + RecordChatter.

---

### Phase 2: Migrate Legacy Detail Pages (Week 2–3)

**Goal:** Bring 7 existing detail pages to canonical pattern.
**Effort:** ~1 day per page (refactor, not rewrite)

| Day | Deliverable                                                                                              |
| --- | -------------------------------------------------------------------------------------------------------- |
| 1   | `invoices/[id]` — Migrate to DetailLayout + 4 tabs (Details, Line Items, Payments, Chatter)              |
| 2   | `contracts/[id]` — Migrate to DetailLayout + 5 tabs (Overview, Clauses, Signatures, Amendments, Chatter) |
| 3   | `proposals/[id]` — Migrate to DetailLayout + 5 tabs (Overview, Items, Preview, E-Sign, Chatter)          |
| 4   | `decks/[id]` — Migrate to DetailLayout + 3 tabs (Slides, Settings, Chatter)                              |
| 5   | `brand-kit/[id]` — Migrate to DetailLayout + 3 tabs (Assets, Guidelines, Chatter)                        |
| 6   | `call-sheets/[id]` — Migrate to DetailLayout + 3 tabs (Schedule, Crew, Chatter)                          |
| 6   | `tech-sheets/[id]` — Migrate to DetailLayout + 3 tabs (Specs, Equipment, Chatter)                        |

**Also in Phase 2:**

- Add RecordChatter tab to `deals/[id]` and `vendors/[id]`
- Add cross-entity `EntityLink` to all 15 existing detail page sidebars

**Verification:** All 15 existing detail pages use DetailLayout + useQueryTabState + RecordChatter. EntityLink deployed in every sidebar.

---

### Phase 3: P1 — Core Entity Detail Pages (Week 3–5)

**Goal:** Complete detail pages for all primary business entities.
**Pages:** 8 new detail pages

| Day   | Deliverable                                                               |
| ----- | ------------------------------------------------------------------------- |
| 1–2   | `opportunities/[id]` — 5 tabs, stage pipeline viz, convert-to-deal action |
| 3–4   | `companies/[id]` — 6 tabs, CRM hub with all related entities              |
| 5–6   | `campaigns/[id]` — 5 tabs, KPI dashboard, asset gallery                   |
| 7     | `estimates/[id]` — 4 tabs, comparison view vs actual budget               |
| 8–9   | `work-orders/[id]` — 5 tabs, bid management, vendor assignment            |
| 10    | `expenses/[id]` — 4 tabs, receipt upload, approval workflow               |
| 11–12 | `scopes-of-work/[id]` — 5 tabs, deliverable tracker, change log           |
| 13    | `briefs/[id]` — 5 tabs, requirements checklist, feedback rounds           |

**Verification:** All 23 core entity list pages have corresponding detail pages. TypeScript + ESLint clean.

---

### Phase 4: P2+P3 — Secondary & Specialized (Week 5–7)

**Goal:** Complete the long tail of detail pages.
**Pages:** 8 new detail pages

| Day | Deliverable                                                             |
| --- | ----------------------------------------------------------------------- |
| 1–2 | `digital-assets/[id]` — 5 tabs, version management, deployment tracking |
| 3   | `creative-assets/[id]` — 5 tabs, review rounds, approval flow           |
| 4   | `permits/[id]` — 5 tabs, renewal tracking, jurisdiction info            |
| 5   | `insurance-policies/[id]` — 5 tabs, coverage details, claims            |
| 6   | `recurring-invoices/[id]` — 4 tabs, schedule, generated invoices        |
| 7   | `change-orders/[id]` — 4 tabs, impact analysis, approval chain          |
| 8   | `service-requests/[id]` — 5 tabs, SLA tracking, communications          |
| 9   | `certifications/[id]` — 4 tabs, requirements, compliance history        |

---

### Phase 5: Cross-Entity Navigation & Polish (Week 7–8)

**Goal:** Wire all detail pages into a connected navigation graph.

| Task                                                         | Effort |
| ------------------------------------------------------------ | ------ |
| Deploy EntityLink in all 30 detail page sidebars             | 2 days |
| Add "Related Records" card to all Overview tabs              | 2 days |
| Update list pages to show entity preview on hover (optional) | 2 days |
| Add breadcrumb context for detail pages in topbar            | 1 day  |
| Regression testing + accessibility audit of all detail pages | 2 days |

---

## 8. Entity–Detail Page Matrix

| Entity            | List Page  | Detail Page   | DB Table                | Nav Section                 | Status         |
| ----------------- | ---------- | ------------- | ----------------------- | --------------------------- | -------------- |
| Project           | ✅         | ✅            | `projects`              | Production                  | Complete       |
| Deal              | ✅         | ✅            | `deals`                 | Sales & CRM                 | Complete       |
| Task              | ✅         | ✅            | `tasks`                 | Production                  | Complete       |
| Asset             | ✅         | ✅            | `assets`                | Assets & Logistics          | Complete       |
| Crew Member       | ✅         | ✅            | `crew_members`          | People & Resources          | Complete       |
| Vendor            | ✅         | ✅            | `vendors`               | Finance > Procurement       | Complete       |
| Location          | ✅         | ✅            | `locations`             | Production                  | Complete       |
| Invoice           | ✅         | ✅            | `invoices`              | Finance > Billing           | Legacy pattern |
| Contract          | ✅         | ✅            | `contracts`             | Legal & Compliance          | Legacy pattern |
| Proposal          | ✅         | ✅            | `proposals`             | Creative & Docs > Documents | Legacy pattern |
| Deck              | ✅         | ✅            | `decks`                 | Creative & Docs             | Legacy pattern |
| Brand Kit         | ✅         | ✅            | `brand_kits`            | Creative & Docs             | Legacy pattern |
| Call Sheet        | ✅         | ✅            | `call_sheets`           | Creative & Docs > Documents | Legacy pattern |
| Tech Sheet        | ✅         | ✅            | `tech_sheets`           | Creative & Docs > Documents | Legacy pattern |
| KB Article        | ✅         | ✅            | `knowledge_articles`    | Admin                       | Complete       |
| Activation        | ✅         | ❌ **BROKEN** | `activations`           | Production                  | **P0**         |
| Budget            | ✅         | ❌ **BROKEN** | `budgets`               | Finance > Budgeting         | **P0**         |
| Event             | ✅         | ❌ **BROKEN** | `events`                | Production                  | **P0**         |
| Incident          | ✅         | ❌ **BROKEN** | `incidents`             | Legal & Compliance          | **P0**         |
| Lead              | ✅         | ❌ **BROKEN** | `leads`                 | Sales & CRM                 | **P0**         |
| Shipment          | ✅         | ❌ **BROKEN** | `shipments`             | Assets & Logistics          | **P0**         |
| Template          | ✅         | ❌ **BROKEN** | `project_templates`     | Creative & Docs             | **P0**         |
| Opportunity       | ✅         | ❌            | `opportunities`         | Sales & CRM                 | **P1**         |
| Company           | ✅         | ❌            | `companies`             | Sales & CRM                 | **P1**         |
| Campaign          | ✅         | ❌            | `campaigns`             | Creative & Docs             | **P1**         |
| Estimate          | ✅         | ❌            | `estimates`             | Finance > Budgeting         | **P1**         |
| Work Order        | ✅         | ❌            | `work_orders`           | Vendor Management           | **P1**         |
| Expense           | ✅         | ❌            | `expenses`              | Finance                     | **P1**         |
| Scope of Work     | ✅         | ❌            | `scopes_of_work`        | Production                  | **P1**         |
| Brief             | ✅         | ❌            | `creative_briefs`       | Creative & Docs             | **P1**         |
| Digital Asset     | ✅         | ❌            | `digital_assets`        | Creative & Docs             | **P2**         |
| Creative Asset    | ✅         | ❌            | `creative_reviews`      | Creative & Docs             | **P2**         |
| Permit            | ✅         | ❌            | `permits`               | Legal & Compliance          | **P2**         |
| Insurance Policy  | ✅         | ❌            | `insurance_policies`    | Legal & Compliance          | **P2**         |
| Recurring Invoice | ✅         | ❌            | `recurring_invoices`    | Finance > Billing           | **P2**         |
| Change Order      | ✅         | ❌            | `change_orders`         | Sales & CRM                 | **P3**         |
| Service Request   | ✅         | ❌            | `service_requests`      | Sales & CRM                 | **P3**         |
| Certification     | ✅         | ❌            | `certifications`        | Legal & Compliance          | **P3**         |
| Purchase Req.     | ✅         | ✅ **NEW**    | `purchase_requisitions` | Finance > Procurement       | Phase 6 ✅     |
| Purchase Order    | ✅ **NEW** | ✅ **NEW**    | `purchase_orders`       | Finance > Procurement       | Phase 6 ✅     |
| Approval          | ✅         | ✅ **NEW**    | `approvals`             | Vendor & Operations         | Phase 6 ✅     |
| Document          | ✅         | ✅ **NEW**    | `vault_documents`       | Creative & Docs             | Phase 6 ✅     |

---

## Appendix A: DB Table → Detail Page Mapping

Tables that store first-class entities (have their own list page) but lack a detail page:

```
activations          → /activations/[id]     (P0)
budgets              → /budgets/[id]         (P0)
events               → /events/[id]          (P0)
incidents            → /incidents/[id]       (P0)
leads                → /leads/[id]           (P0)
shipments            → /shipments/[id]       (P0)
project_templates    → /templates/[id]       (P0)
opportunities        → /opportunities/[id]   (P1)
companies            → /companies/[id]       (P1)
campaigns            → /campaigns/[id]       (P1)
estimates            → /estimates/[id]       (P1)
work_orders          → /work-orders/[id]     (P1)
expenses             → /expenses/[id]        (P1)
scopes_of_work       → /scopes-of-work/[id]  (P1)
creative_briefs      → /briefs/[id]          (P1)
digital_assets       → /digital-assets/[id]  (P2)
creative_reviews     → /creative-assets/[id] (P2)
permits              → /permits/[id]         (P2)
insurance_policies   → /insurance-policies/[id] (P2)
recurring_invoices   → /recurring-invoices/[id] (P2)
change_orders        → /change-orders/[id]   (P3)
service_requests     → /service-requests/[id] (P3)
certifications       → /certifications/[id]  (P3)
```

---

## Appendix B: Tab Architecture per Detail Page

### Canonical Tab Set (minimum for all detail pages)

Every detail page MUST have at minimum:

1. **Overview** — Key stats, summary, recent related records
2. **[1–3 domain-specific tabs]** — Entity-specific content
3. **Chatter** — RecordChatter (activity feed + comments) — always last

### Standard Tab Patterns by Domain

| Domain                                               | Standard Tabs                                      |
| ---------------------------------------------------- | -------------------------------------------------- |
| **CRM** (deals, leads, opportunities, companies)     | Overview, Activity, Contacts, Notes/Chatter        |
| **Production** (projects, events, activations)       | Overview, Tasks/Activities, Team, Budget, Chatter  |
| **Finance** (invoices, budgets, estimates, expenses) | Overview, Line Items, Approvals, Chatter           |
| **Legal** (contracts, permits, insurance, incidents) | Overview, Documents, Timeline, Compliance, Chatter |
| **Creative** (campaigns, briefs, digital-assets)     | Overview, Assets, Reviews/Feedback, Chatter        |
| **Logistics** (shipments, work-orders)               | Overview, Items, Tracking, Chatter                 |
| **Vendor** (vendors, work-orders)                    | Overview, Orders, Compliance, Chatter              |

---

## Summary of Effort

| Phase     | Scope            | Pages                                             | Estimated Effort |
| --------- | ---------------- | ------------------------------------------------- | ---------------- |
| Phase 1   | P0 Broken Links  | 7 new                                             | 11 days          |
| Phase 2   | Legacy Migration | 7 refactored + 2 chatter additions                | 7 days           |
| Phase 3   | P1 Core Entities | 8 new                                             | 13 days          |
| Phase 4   | P2+P3 Secondary  | 8 new                                             | 9 days           |
| Phase 5   | Cross-Entity Nav | All 30                                            | 7 days           |
| Phase 6   | Procurement+Gov  | 1 new list + 4 new detail (PR, PO, Approval, Doc) | 1 day (done)     |
| **Total** |                  | **34 detail pages** (27 new + 7 migrated)         | **~48 days**     |

### Success Criteria

1. Zero broken `<Link>` targets across all list pages
2. All 38 first-class entities have a detail page
3. Every detail page uses `DetailLayout` + `useQueryTabState` + `RecordChatter`
4. Every detail page sidebar contains `EntityLink` cross-references to related entities
5. TypeScript compiles with zero errors
6. ESLint passes clean on all new/modified files
7. All detail pages are keyboard-navigable and screen-reader compatible (WCAG 2.2 AA)
