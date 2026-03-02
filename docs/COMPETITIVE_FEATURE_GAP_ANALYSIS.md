# Competitive Feature Gap Analysis: Productive.io & Odoo vs. FrozenPhoenix

**Date:** 2026-03-01
**Scope:** Features from Productive.io and Odoo applicable to creative/experiential production management
**Method:** Feature-by-feature comparison against FrozenPhoenix navigation config, DB schema (33 migrations), and UI surface

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Methodology](#2-methodology)
3. [Current FrozenPhoenix Coverage Map](#3-current-frozenphoenix-coverage-map)
4. [Gap Analysis: Productive.io](#4-gap-analysis-productiveio)
5. [Gap Analysis: Odoo](#5-gap-analysis-odoo)
6. [Consolidated Gap Inventory](#6-consolidated-gap-inventory)
7. [Implementation Recommendations](#7-implementation-recommendations)
8. [Information Architecture Strategy](#8-information-architecture-strategy)
9. [Phased Rollout](#9-phased-rollout)
10. [Appendix: Feature-by-Feature Matrix](#appendix-feature-by-feature-matrix)

---

## 1. Executive Summary

FrozenPhoenix already covers an exceptionally wide domain surface — 95+ nav items across 11 sections, 48+ dashboard pages, and 33 DB migrations with enterprise-grade schema. However, comparison with Productive.io (agency PSA leader) and Odoo (modular ERP) reveals **12 high-value feature gaps** that directly impact the core use case of creative/experiential production management.

The gaps cluster into **4 themes**:

| Theme                                 | Gap Count | Revenue Impact | UX Impact |
| ------------------------------------- | --------- | -------------- | --------- |
| **A. Real-Time Profitability Engine** | 3         | Critical       | High      |
| **B. Intelligent Resource Planning**  | 3         | Critical       | High      |
| **C. Unified Time→Invoice Pipeline**  | 3         | High           | Critical  |
| **D. Operational Intelligence**       | 3         | Medium         | High      |

**Key insight:** FrozenPhoenix has the _schema_ for most of these features (rate cards, resource bookings, time entries, budgets, scenarios). The gap is almost entirely at the **UI/UX and computation layer** — the data model is ready, the experience is not.

---

## 2. Methodology

### Productive.io — What They Do Well

Productive.io is a Professional Services Automation (PSA) platform built specifically for creative agencies. Their core differentiator is the **closed-loop financial feedback system**: every tracked hour automatically flows into budget burn, profitability, utilization, and invoice drafts. Their feature surface:

- **Budgeting & Profitability** — Real-time margin tracking, budget burn forecasting, overhead allocation, revenue recognition
- **Resource Planning** — Heatmap-based capacity planning, utilization tracking, tentative bookings, AI-powered resource matching
- **Forecasting** — Revenue projection, hiring needs forecasting, scenario simulation, pipeline-weighted forecasts
- **Sales** — Deal-to-project conversion, proposal builder with e-signatures, scenario-based pricing, loss reason analytics
- **Time Tracking** — Timer/timesheet/suggestion modes, auto-invoice linkage, billable/non-billable split
- **Reporting** — AI-generated reports, custom dashboards, profitability charts per budget

### Odoo — What They Do Well

Odoo is a modular ERP with 40+ integrated apps. Relevant modules for our use case:

- **Planning** — Gantt-based shift scheduling, open shifts, role-based allocation, conflict detection, employee self-service portal
- **Timesheets** — Integrated with planning, invoicing, and project; attendance comparison; periodic reminders
- **Appraisals** — 360° feedback, goal tracking, skill progression, scheduled review cycles
- **Manufacturing (MRP)** — Bill of Materials, work orders, quality checks, OEE tracking, workcenter capacity
- **Quality** — Quality check points at receive/manufacture/ship, control plans, statistical process control
- **Knowledge** — Wiki-style knowledge base with article versioning, sharing, and embedding in tasks
- **Approvals** — Configurable multi-level approval workflows for any entity
- **Discuss** — Threaded messaging on any record (chatter), real-time collaboration
- **Sign** — Integrated e-signature for contracts, proposals, and any document

### FrozenPhoenix — What We Already Have

- 95+ navigation items across 11 sections (Home, Sales & CRM, Production, People & Resources, Assets & Logistics, Finance, Creative & Docs, Vendor Management, Legal & Compliance, Admin, Live Operations)
- 48+ dashboard pages with detail views for key entities
- Enterprise DB schema: `resource_bookings`, `rate_cards`/`rate_card_items`, `production_time_entries`, `active_timers`, `budgets`/`production_budget_lines`, `scenarios`/`scenario_variables`/`scenario_outcomes`/`scenario_resource_plans`, `crew_shifts`, `crew_availability`, `proposals`/`proposal_items`, `worker_reviews`, `schedule_entries`, `production_expenses`
- React Query hooks for 60+ tables
- Realtime subscriptions for 22+ tables

---

## 3. Current FrozenPhoenix Coverage Map

### Legend

- ✅ **Schema + UI** — Table exists and page renders data
- 🟡 **Schema only** — Table exists, UI is mock/placeholder
- 🔴 **Missing** — No schema, no UI

| Feature Area                   | Status | Notes                                                                  |
| ------------------------------ | ------ | ---------------------------------------------------------------------- |
| CRM Pipeline                   | ✅     | Pipeline, Deals, Leads, Contacts, Companies                            |
| Proposals                      | 🟡     | `proposals` table exists; UI is placeholder page                       |
| Projects / Tasks               | ✅     | `projects`, `production_tasks`, detail pages                           |
| Events / Activations           | ✅     | Full schema + pages                                                    |
| Calendar                       | ✅     | Page exists                                                            |
| Budgets                        | 🟡     | `budgets` + `production_budget_lines` exist; page is list-only         |
| Rate Cards                     | 🟡     | `rate_cards` + `rate_card_items` exist; UI is list page                |
| Time Tracking                  | 🟡     | `production_time_entries` + `active_timers` exist; page is placeholder |
| Resource Planning              | 🟡     | `resource_bookings` + `crew_availability` exist; page is placeholder   |
| Scheduling (Gantt)             | 🟡     | `schedule_entries` + `crew_shifts` exist; page placeholder             |
| Time Off                       | 🟡     | `time_off_requests` exists; page placeholder                           |
| Invoicing                      | 🟡     | `invoices` + `recurring_invoices` exist; page is list                  |
| Expenses                       | 🟡     | `production_expenses` exists; page placeholder                         |
| Scenarios                      | 🟡     | Full scenario schema exists; page placeholder                          |
| Forecasting                    | 🟡     | `scenario_outcomes` exists; page placeholder                           |
| Crew / Workforce               | ✅     | Detail pages, onboarding/offboarding schema                            |
| Assets / Inventory             | ✅     | Full schema + pages                                                    |
| Contracts                      | ✅     | Schema + detail page                                                   |
| Approvals                      | ✅     | Schema + page with tab views                                           |
| Automations                    | 🟡     | `automations` + `automation_rules` exist; UI placeholder               |
| Custom Dashboards              | 🟡     | `dashboards` + `dashboard_widgets` exist; page placeholder             |
| Documents / Knowledge          | 🟡     | `documents` table exists; page placeholder                             |
| Live Operations                | ✅     | Full schema (migration 020) + 15 pages                                 |
| Performance Reviews            | 🟡     | `worker_reviews` exists; page placeholder                              |
| **Real-time Profitability**    | 🔴     | No computation layer or UI                                             |
| **Utilization Heatmap**        | 🔴     | No computation or visualization                                        |
| **Budget Burn Forecasting**    | 🔴     | No forecasting engine                                                  |
| **Time → Invoice Pipeline**    | 🔴     | No auto-invoice-draft from time entries                                |
| **Overhead Allocation**        | 🔴     | No overhead spreading logic                                            |
| **Billable Utilization %**     | 🔴     | No utilization calculation                                             |
| **In-app Messaging (Chatter)** | 🔴     | No record-level messaging                                              |
| **Quality Checks**             | 🔴     | No QC schema or UI                                                     |
| **360° Feedback / Goals**      | 🔴     | `worker_reviews` exists but no 360/goals                               |

---

## 4. Gap Analysis: Productive.io

### Gap P1: Real-Time Profitability Dashboard

**What Productive does:** Every budget shows a live profitability chart. As hours are tracked, the system computes: `Revenue − (Internal Cost + External Cost + Overhead)` = Profit. Margin % updates in real time. Budget burn rate is forecasted forward to predict overrun dates.

**Why it matters for us:** This is the #1 feature agencies pay for. Production managers currently export to spreadsheets to understand margin. FrozenPhoenix has `budgets`, `production_budget_lines`, `production_time_entries`, `production_expenses`, and `rate_cards` — all the raw data — but no computation or visualization layer.

**What to build:**

- **Profitability computation engine** — Server-side Supabase function or Edge Function that computes profit metrics per budget/project in real time
- **Budget Overview panel** — Embedded in project and budget detail pages: burn chart, margin gauge, forecasted overrun date
- **Overhead allocation setting** — Organization-level config to spread non-billable costs across active budgets

### Gap P2: Utilization & Capacity Heatmap

**What Productive does:** Resource planner shows a person × week grid with color-coded capacity (green = available, yellow = partial, red = overbooked). Filters by skill, team, department. Shows time off overlaid. Billable utilization % per person/team/department over any time range.

**Why it matters for us:** `resource_bookings` and `crew_availability` tables exist but have no visualization. Resource planners currently use whiteboards or Excel. This is the single highest-impact planning tool for production companies.

**What to build:**

- **Capacity heatmap view** — Embedded in Resource Planner page: person × week grid with booking density
- **Utilization metrics bar** — Shows billable %, target %, and variance per person and aggregate
- **Skill/role filtering** — Use existing `crew_members.skills`/`crew_members.role` for faceted filtering

### Gap P3: Scenario-Based Financial Modeling

**What Productive does:** Scenario Builder lets users create side-by-side financial projections: "What if we staff 3 seniors instead of 5 juniors?" with live P&L impact. Scenarios can be attached to deals (pre-sale) or projects (in-flight).

**Why it matters for us:** We have `scenarios`, `scenario_variables`, `scenario_outcomes`, `scenario_resource_plans` — a complete schema. But the Scenarios page is a placeholder. This is a differentiator for experiential production where staffing trade-offs directly impact margin.

**What to build:**

- **Scenario editor** — Side-by-side comparison UI with variable sliders and live outcome charts
- **Deal-attached scenarios** — Link scenario to deal for pre-sale pricing simulation
- **Template scenarios** — Pre-built templates for common production types (festival, pop-up, tour)

### Gap P4: Deal → Project Conversion Pipeline

**What Productive does:** When a deal is marked "Won", the system auto-creates a project with the proposal's budget, rate card, and team assignments pre-populated. No manual re-entry.

**Why it matters for us:** We have `deals`, `proposals`, `projects`, `budgets`, and `rate_cards` as separate entities. But there's no automated conversion flow. PMs currently recreate project budgets from scratch after a deal closes.

**What to build:**

- **Convert Deal action** — One-click (or automated) flow: Deal Won → Create Project → Import Proposal as Budget → Pre-assign bookings from proposal team
- **Surfaced as:** Button on Deal detail page + optional automation rule

### Gap P5: Proposal Builder with E-Signatures

**What Productive does:** WYSIWYG proposal editor with rate card import, branded PDF generation, email/link sharing, and built-in e-signature acceptance. Status tracking (sent, viewed, accepted, rejected).

**Why it matters for us:** `proposals` and `proposal_items` tables exist with full schema (pricing, terms, validity, signature fields). But the UI is a placeholder list page. Proposals are a direct revenue driver — the faster and more polished the proposal, the higher the close rate.

**What to build:**

- **Proposal editor page** — Multi-step form: header/client → line items (import from rate card) → terms → preview
- **PDF generation** — Server-side PDF from template (using existing brand tokens)
- **Share + e-sign** — Public share link with acceptance flow (leverages `proposals.signed_at`, `proposals.signed_by`)

### Gap P6: Automated Budget Overrun Alerts

**What Productive does:** Configurable threshold alerts (e.g., "Notify PM when budget is 70% consumed"). Alerts surface in-app and via email.

**Why it matters for us:** `budgets` has `total_amount` and `production_budget_lines` tracks spend. But there's no threshold monitoring or alert system.

**What to build:**

- **Budget alert thresholds** — Organization-level setting (50%, 70%, 90% default)
- **Alert delivery** — In-app notification + optional email via Supabase Edge Function
- **Surfaced as:** Badge on budget card + toast notification + optional push to Realtime channel

---

## 5. Gap Analysis: Odoo

### Gap O1: Integrated Time → Invoice Pipeline

**What Odoo does:** Time tracked on tasks automatically becomes invoiceable. Three policies: never (internal), at creation, or at validation. PMs approve timesheets, then billing generates invoice drafts with approved hours × rate. No manual data transfer.

**Why it matters for us:** We have `production_time_entries` (with `billable` flag, `hourly_rate`, `total_cost`) and `invoices`. But there's zero connection between them. The time-to-cash cycle requires manual export/re-entry.

**What to build:**

- **Timesheet approval workflow** — PM reviews and approves time entries (add `approved_at`/`approved_by` to `production_time_entries`)
- **Invoice draft generator** — "Generate Invoice from Approved Time" action: groups approved billable hours by rate card service, creates draft invoice with line items
- **Billing policy setting** — Per-project setting: Fixed Price, Time & Materials, or Milestone-based

### Gap O2: Gantt-Based Shift & Resource Planning

**What Odoo does:** Full Gantt chart for planning shifts by person, role, or project. Drag-and-drop rescheduling. Conflict detection (double-booking warning). Open shifts that employees can self-assign via portal. Copy-previous-week.

**Why it matters for us:** `crew_shifts` and `schedule_entries` tables exist with full schema. The Scheduling page is a placeholder. For experiential production, visual timeline planning is essential — crews work across multiple events in a week.

**What to build:**

- **Gantt view component** — Reusable `<GanttChart>` primitive for schedule_entries/crew_shifts
- **Drag-and-drop rescheduling** — Optimistic mutation on drop
- **Conflict detection** — Real-time overlap check on person × time range
- **Open shift board** — Unassigned shifts that crew can claim (vendor portal integration)

### Gap O3: 360° Performance Reviews & Goal Tracking

**What Odoo does:** Scheduled appraisal cycles with self-assessment, manager review, and 360° peer feedback. Skill progression tracking over time. Goal/OKR setting with progress bars.

**Why it matters for us:** `worker_reviews` exists with basic rating/feedback. But there's no 360° feedback collection, no goal tracking, no skill progression visualization. For production companies managing 50–200 freelancers, performance data drives rebooking decisions.

**What to build:**

- **360° feedback surveys** — Configurable survey templates sent to peers, managers, clients
- **Goal/OKR tracker** — Lightweight goal setting with measurable targets and progress
- **Skill matrix view** — Visual grid of crew × skills with proficiency levels, linked to `worker_reviews`

### Gap O4: Quality Check Points

**What Odoo does:** Quality checks at configurable points (receive, in-process, ship). Control plans per product. Pass/fail/measure check types. Statistical process control charts.

**Why it matters for us:** For experiential production, quality checks apply to: asset inspection before deployment, venue readiness checks, fabrication sign-off, post-event condition reports. We have `maintenance_records` for assets but no general-purpose QC framework.

**What to build:**

- **Quality check templates** — Configurable checklists per entity type (asset, venue, fabrication)
- **Check execution UI** — Mobile-friendly pass/fail/measure form with photo capture
- **Surfaced as:** Sub-tab on Asset detail, Location detail, and Live Ops equipment pages

### Gap O5: Knowledge Base with Record Embedding

**What Odoo does:** Wiki-style knowledge articles that can be embedded in tasks, projects, or any record. Version history, sharing controls, search.

**Why it matters for us:** We have a Knowledge Base nav item and `documents` table, but no structured wiki/article system. Production SOPs, venue guides, and setup instructions need to live alongside projects, not in a separate silo.

**What to build:**

- **Article editor** — Rich text editor with media embedding
- **Record linking** — "Attach Knowledge Article" action on project, event, location, and task detail pages
- **Search integration** — Knowledge articles surface in ⌘K command bar

### Gap O6: Record-Level Messaging (Chatter)

**What Odoo does:** Every record (task, project, invoice, etc.) has a built-in activity feed with threaded comments, email integration, @mentions, and file attachments. This eliminates context-switching to Slack/email.

**Why it matters for us:** There is an `activities` table (migration 003) but it's structured for event activities, not record-level communication. Production coordination requires context-attached messaging — "this task," "this shipment," "this invoice."

**What to build:**

- **Activity feed component** — Reusable `<ActivityFeed>` attached to any entity via polymorphic `entity_type` + `entity_id`
- **Comment threading** — Nested replies with @mention support
- **Surfaced as:** Tab or panel on all detail pages (projects, tasks, deals, invoices, assets, crew)

---

## 6. Consolidated Gap Inventory

### Priority Matrix

| #   | Feature                           | Source     | Theme | DB Ready?  | Complexity | Business Impact |
| --- | --------------------------------- | ---------- | ----- | ---------- | ---------- | --------------- |
| 1   | Real-Time Profitability Dashboard | Productive | A     | ✅ Yes     | Medium     | **Critical**    |
| 2   | Utilization & Capacity Heatmap    | Productive | B     | ✅ Yes     | Medium     | **Critical**    |
| 3   | Time → Invoice Pipeline           | Odoo       | C     | 🟡 Partial | Medium     | **Critical**    |
| 4   | Deal → Project Conversion         | Productive | C     | ✅ Yes     | Low        | **High**        |
| 5   | Budget Burn Forecasting + Alerts  | Productive | A     | ✅ Yes     | Medium     | **High**        |
| 6   | Gantt Scheduling View             | Odoo       | B     | ✅ Yes     | High       | **High**        |
| 7   | Proposal Builder + E-Sign         | Productive | C     | ✅ Yes     | High       | **High**        |
| 8   | Scenario Financial Modeling       | Productive | A     | ✅ Yes     | Medium     | **High**        |
| 9   | Record-Level Activity Feed        | Odoo       | D     | 🟡 Partial | Medium     | **Medium**      |
| 10  | 360° Reviews + Goal Tracking      | Odoo       | D     | 🟡 Partial | Medium     | **Medium**      |
| 11  | Quality Check Points              | Odoo       | D     | 🔴 No      | Medium     | **Medium**      |
| 12  | Knowledge Base + Record Linking   | Odoo       | D     | 🟡 Partial | Medium     | **Medium**      |

**Key takeaway:** 8 of 12 gaps have complete or partial DB schema. The primary investment is UI/UX and computation logic.

---

## 7. Implementation Recommendations

### Design Philosophy: Organic Integration, Not Module Bolting

Each feature should feel like a natural extension of existing workflows, not a new "module" to learn. The strategy:

1. **Surface insights where decisions happen** — Profitability shows on the budget tab, not a separate "Profitability" page. Utilization shows in the resource planner, not a standalone analytics page.
2. **Progressive disclosure** — Start with a summary number, expand to detail on click. A PM seeing a budget card sees "62% consumed, 18% margin" — they click only if they need the burn chart.
3. **Automate the seams** — Deal→Project conversion, Time→Invoice drafts, and Budget alerts should be zero-click when possible, one-click when not.
4. **Reuse primitives** — One `<GanttChart>` component serves scheduling, resource planning, and project timeline. One `<ActivityFeed>` serves all detail pages.

### Shared Primitives to Build First

These components serve multiple features and should be built before any individual gap:

| Primitive        | Used By                                        | Complexity |
| ---------------- | ---------------------------------------------- | ---------- |
| `<GanttChart>`   | Scheduling, Resource Planner, Project Timeline | High       |
| `<ActivityFeed>` | All detail pages (chatter)                     | Medium     |
| `<MetricCard>`   | Profitability, Utilization, Budget burn        | Low        |
| `<HeatmapGrid>`  | Resource capacity, Utilization                 | Medium     |
| `<BurnChart>`    | Budget detail, Project overview, Profitability | Medium     |
| `<ApprovalFlow>` | Timesheet approval, Budget approval, Time off  | Low        |

### Per-Feature Implementation Notes

#### Feature 1: Real-Time Profitability Dashboard

**Where it lives:** Embedded panel on Budget detail page + Project detail "Financial" tab + Finance Overview page.

**UX pattern:** Summary strip at top of budget → expandable profitability chart below. No separate page.

```
┌──────────────────────────────────────────────────┐
│ Budget: SXSW 2026 Main Stage                     │
├────────┬────────┬────────┬────────┬──────────────┤
│Revenue │  Cost  │ Profit │ Margin │ Burn Rate    │
│$120,000│$87,400 │$32,600 │ 27.2%  │ $2,180/day   │
├────────┴────────┴────────┴────────┴──────────────┤
│ [▼ Show Profitability Chart]                     │
│                                                   │
│  ████████████████████░░░░░░░  73% consumed       │
│  Forecasted overrun: Mar 18 (6 days early)       │
└──────────────────────────────────────────────────┘
```

**Data flow:**

1. Supabase view `v_budget_profitability` joins `budgets` + `production_budget_lines` + `production_time_entries` + `production_expenses` + `rate_card_items`
2. Edge Function computes burn rate extrapolation
3. React Query hook `useBudgetProfitability(budgetId)` fetches and caches

**DB changes:** One new Supabase view, zero new tables.

#### Feature 2: Utilization & Capacity Heatmap

**Where it lives:** Replaces placeholder on Resource Planner page. Secondary summary on Dashboard home.

**UX pattern:** Person rows × Week columns. Each cell shows booked hours / capacity hours as a fill bar. Color gradient from green (under 70%) → yellow (70-90%) → red (>90%). Time off shows as a distinct pattern (hatched). Click cell to see booking details.

```
┌─────────────────────────────────────────────────┐
│ Resource Planner          [Week ◄ Mar 3-9 ►]    │
│ Filter: [All Roles ▼] [All Skills ▼] [Dept ▼]  │
├──────────┬──────┬──────┬──────┬──────┬──────────┤
│          │ Mon  │ Tue  │ Wed  │ Thu  │ Fri      │
├──────────┼──────┼──────┼──────┼──────┼──────────┤
│ J. Smith │ ████ │ ████ │ ░░░░ │ ████ │ ▓▓▓▓     │
│          │  8h  │  8h  │ PTO  │  8h  │  6h      │
├──────────┼──────┼──────┼──────┼──────┼──────────┤
│ A. Chen  │ ██   │ ████ │ ████ │ ██   │ ████     │
│          │  4h  │  8h  │  8h  │  4h  │  8h      │
└──────────┴──────┴──────┴──────┴──────┴──────────┘
│ Team Utilization: 78% billable │ Target: 75%    │
└─────────────────────────────────────────────────┘
```

**Data flow:**

1. Supabase view `v_crew_utilization` joins `resource_bookings` + `crew_availability` + `time_off_requests` + `production_time_entries`
2. `useCrewUtilization({ dateRange, filters })` hook
3. `<HeatmapGrid>` component renders person×time matrix

**DB changes:** One new Supabase view. Add `capacity_hours_per_day` column to `crew_members` (default 8).

#### Feature 3: Time → Invoice Pipeline

**Where it lives:** Action button on Time Tracking page ("Generate Invoice Draft") + Invoices page shows "From Timesheets" source badge.

**UX pattern:**

1. PM reviews time entries on Time Tracking page → approves billable entries
2. PM clicks "Generate Invoice Draft" → system groups approved hours by service/rate → creates draft invoice
3. PM reviews draft on Invoices page → sends to client

**DB changes:**

- Add `approved_at`, `approved_by`, `invoice_id` columns to `production_time_entries`
- Add `billing_policy` enum to `projects` (fixed_price | time_and_materials | milestone)
- Add `source` column to `invoices` (manual | timesheet | recurring)

#### Feature 4: Deal → Project Conversion

**Where it lives:** Action button on Deal detail page (when status = "Won"). Alternatively, an automation rule.

**UX pattern:** One-click "Convert to Project" opens a pre-filled modal:

- Project name (from deal name)
- Client (from deal company)
- Budget (from proposal total, if proposal exists)
- Team (from proposal/booking suggestions)
- User confirms or adjusts → system creates project + budget + assignments

**DB changes:** None — all tables exist. Server action only.

#### Feature 5: Budget Burn Forecasting + Alerts

**Where it lives:** Inline on Budget detail (burn chart) + notification bell + optional email.

**UX pattern:** Burn chart shows actual spend line + projected spend line (linear extrapolation from current burn rate). Red zone shows where projected line exceeds budget. Alert thresholds shown as horizontal dashed lines.

**DB changes:**

- Add `alert_thresholds` JSONB to `budgets` (default: [50, 70, 90])
- Add `budget_alerts` table for sent alert history (prevents duplicate alerts)

#### Feature 6: Gantt Scheduling View

**Where it lives:** Replaces placeholder on Scheduling page. Also available as a tab on Project detail.

**UX pattern:** Standard Gantt with:

- Rows = crew members or tasks (toggle)
- Bars = schedule entries / crew shifts
- Drag to reschedule, resize to change duration
- Red conflict indicators for overlapping assignments
- "Copy Previous Week" action

**Implementation:** Use a headless Gantt library (e.g., `@neodrag/svelte` adapted, or custom Canvas/SVG). This is the highest-complexity item.

**DB changes:** None — `schedule_entries` and `crew_shifts` schemas are complete.

#### Feature 7: Proposal Builder + E-Sign

**Where it lives:** New multi-step page at `/proposals/new` and `/proposals/[id]/edit`. Detail page at `/proposals/[id]`.

**UX pattern:**

1. **Step 1:** Client & deal info (auto-filled from deal if created from pipeline)
2. **Step 2:** Line items (import from rate card or manual entry)
3. **Step 3:** Terms, validity, notes
4. **Step 4:** Preview (branded PDF layout using brand tokens)
5. **Step 5:** Send (email or public link) → client views → accepts/signs

**DB changes:** None — `proposals` schema already has `signed_at`, `signed_by`, `valid_until`, `terms`, `items[]`. Add `public_token` for share links.

#### Feature 8: Scenario Financial Modeling

**Where it lives:** Replaces placeholder on Scenarios page. Also accessible from Deal detail ("Model Scenarios").

**UX pattern:** Side-by-side comparison cards. Each scenario has adjustable variables (headcount, rates, duration, expenses). Outcome metrics update live: Revenue, Cost, Profit, Margin, Utilization impact.

**DB changes:** None — full schema exists in migration 009.

#### Feature 9: Record-Level Activity Feed

**Where it lives:** Tab or right-panel on all detail pages.

**UX pattern:** Chronological feed with: comments, status changes, file attachments, @mentions. Threaded replies expand inline. "Add Comment" input fixed at bottom.

**DB changes:**

- New `record_comments` table: `id`, `entity_type`, `entity_id`, `author_id`, `parent_comment_id`, `body`, `attachments`, `mentioned_user_ids`, `created_at`, `updated_at`
- New `record_activity_log` table: `id`, `entity_type`, `entity_id`, `actor_id`, `action`, `changes` (JSONB diff), `created_at`

#### Feature 10: 360° Reviews + Goal Tracking

**Where it lives:** Enhances existing Performance Reviews page under Workforce.

**UX pattern:**

- **Review cycle:** Admin configures cycle → system sends self-assessment + peer survey requests → manager reviews all feedback → final rating
- **Goals:** Simple OKR-style: Objective → Key Results with progress bars. Visible on crew member detail.

**DB changes:**

- New `review_cycles` table: schedule, template, participants
- New `review_feedback_requests` table: reviewer, reviewee, survey template, status
- New `goals` table: `crew_member_id`, `title`, `target_value`, `current_value`, `due_date`, `status`

#### Feature 11: Quality Check Points

**Where it lives:** Sub-tab on Asset detail, Location detail, and Live Ops equipment pages. Also available standalone.

**UX pattern:** Checklist-style: each check has type (pass/fail, measure, photo), expected value, actual value, result. Mobile-optimized for field use.

**DB changes:**

- New `quality_check_templates` table: name, entity_type, check_items (JSONB)
- New `quality_checks` table: template_id, entity_type, entity_id, inspector_id, status, results (JSONB), completed_at

#### Feature 12: Knowledge Base + Record Linking

**Where it lives:** Enhances existing Knowledge Base page + adds "Linked Articles" section to project, event, and location detail pages.

**UX pattern:** Wiki-style with categories, search, and version history. "Link Article" action on detail pages opens a picker.

**DB changes:**

- New `knowledge_articles` table: title, body (rich text), category, tags, author_id, version, published_at
- New `knowledge_article_links` table: article_id, entity_type, entity_id

---

## 8. Information Architecture Strategy

### Principle: Zero New Top-Level Nav Items

All 12 features integrate into existing navigation sections. No new sections, no new cognitive load.

| Feature             | Where It Surfaces                                       | IA Treatment                    |
| ------------------- | ------------------------------------------------------- | ------------------------------- |
| Profitability       | Budget detail tab, Project detail tab, Finance Overview | **Embedded panel** — not a page |
| Utilization Heatmap | Resource Planner page (replaces placeholder)            | **Page enhancement**            |
| Time → Invoice      | Time Tracking page action → Invoices page               | **Workflow action**             |
| Deal → Project      | Deal detail action button                               | **One-click action**            |
| Budget Alerts       | Notification system + Budget detail                     | **Ambient notification**        |
| Gantt Scheduling    | Scheduling page (replaces placeholder)                  | **Page enhancement**            |
| Proposal Builder    | Proposals detail/edit pages                             | **Page enhancement**            |
| Scenario Modeling   | Scenarios page (replaces placeholder)                   | **Page enhancement**            |
| Activity Feed       | All detail pages (new tab/panel)                        | **Universal panel**             |
| 360° Reviews        | Workforce > Performance Reviews                         | **Page enhancement**            |
| Quality Checks      | Asset/Location/Equipment detail sub-tab                 | **Sub-tab**                     |
| Knowledge Base      | Knowledge Base page + detail page linking               | **Page enhancement + linking**  |

### Cognitive Load Management

1. **No new learning** — Every feature surfaces in a place the user already visits
2. **Progressive disclosure** — Summary metrics → expand for detail → drill into full view
3. **Consistent patterns** — `<MetricCard>` looks the same on budget, project, and finance pages. `<ActivityFeed>` works identically everywhere.
4. **Command bar discovery** — All new features are searchable via ⌘K (already wired via `flattenNavItems`)

### Role-Based Relevance

| Feature           | Exec        | PM                   | Client            | Vendor            |
| ----------------- | ----------- | -------------------- | ----------------- | ----------------- |
| Profitability     | ✅ Full     | ✅ Project-scoped    | ❌ Hidden         | ❌ Hidden         |
| Utilization       | ✅ Org-wide | ✅ Team-scoped       | ❌ Hidden         | ❌ Hidden         |
| Time → Invoice    | ✅ Approve  | ✅ Generate          | ✅ View invoices  | ❌ Hidden         |
| Deal → Project    | ✅ Full     | ✅ Full              | ❌ Hidden         | ❌ Hidden         |
| Budget Alerts     | ✅ All      | ✅ Owned budgets     | ❌ Hidden         | ❌ Hidden         |
| Gantt Scheduling  | ✅ View all | ✅ Edit own projects | ❌ Hidden         | ✅ Own shifts     |
| Proposal Builder  | ✅ Full     | ✅ Full              | ✅ View/sign      | ❌ Hidden         |
| Scenario Modeling | ✅ Full     | ✅ Full              | ❌ Hidden         | ❌ Hidden         |
| Activity Feed     | ✅ Full     | ✅ Full              | ✅ Scoped         | ✅ Scoped         |
| 360° Reviews      | ✅ Full     | ✅ Team              | ❌ Hidden         | ✅ Self only      |
| Quality Checks    | ✅ View     | ✅ Full              | ❌ Hidden         | ✅ Execute        |
| Knowledge Base    | ✅ Full     | ✅ Full              | ✅ Published only | ✅ Published only |

---

## 9. Phased Rollout

### Phase 1: Financial Intelligence (Weeks 1–4)

_Theme A: Make money visible_

| Week | Deliverable                                                                                                        |
| ---- | ------------------------------------------------------------------------------------------------------------------ |
| 1    | `v_budget_profitability` Supabase view + `useBudgetProfitability` hook + `<MetricCard>` + `<BurnChart>` primitives |
| 2    | Profitability panel on Budget detail + Project detail Financial tab                                                |
| 2    | Budget alert thresholds + `budget_alerts` table + notification delivery                                            |
| 3    | `v_crew_utilization` view + `useCrewUtilization` hook + `<HeatmapGrid>` primitive                                  |
| 4    | Utilization heatmap on Resource Planner page + Dashboard summary widget                                            |

**Outcome:** PMs can see real-time margin on every project. Execs get org-wide utilization visibility.

### Phase 2: Revenue Pipeline (Weeks 5–8)

_Theme C: Close the deal-to-cash loop_

| Week | Deliverable                                                                    |
| ---- | ------------------------------------------------------------------------------ |
| 5    | Proposal builder multi-step form (Steps 1–3) + rate card import                |
| 6    | Proposal preview + PDF generation + share link + e-sign flow                   |
| 7    | Deal → Project conversion action + budget auto-creation                        |
| 8    | Time → Invoice pipeline: approval workflow + draft generation + billing policy |

**Outcome:** Full deal → proposal → project → time → invoice pipeline with zero manual re-entry.

### Phase 3: Planning & Scheduling (Weeks 9–12)

_Theme B: Staff the right people at the right time_

| Week | Deliverable                                                      |
| ---- | ---------------------------------------------------------------- |
| 9    | `<GanttChart>` shared primitive (headless, accessible)           |
| 10   | Gantt view on Scheduling page (crew shifts + schedule entries)   |
| 11   | Drag-and-drop rescheduling + conflict detection                  |
| 12   | Scenario modeling UI on Scenarios page (side-by-side comparison) |

**Outcome:** Visual timeline planning replaces placeholder pages. Scenarios enable informed staffing decisions.

### Phase 4: Collaboration & Quality (Weeks 13–16)

_Theme D: Operational intelligence_

| Week | Deliverable                                                                       |
| ---- | --------------------------------------------------------------------------------- |
| 13   | `record_comments` + `record_activity_log` tables + `<ActivityFeed>` component     |
| 14   | Activity feed deployed to all detail pages                                        |
| 15   | Knowledge Base article editor + record linking + ⌘K integration                   |
| 16   | Quality check templates + execution UI + 360° review enhancements + goal tracking |

**Outcome:** Context-attached communication eliminates Slack silos. Quality and performance tracking mature.

---

## Appendix: Feature-by-Feature Matrix

| Feature                 | Productive.io |        Odoo        | FrozenPhoenix (Current) | FrozenPhoenix (Proposed) |
| ----------------------- | :-----------: | :----------------: | :---------------------: | :----------------------: |
| CRM Pipeline            |      ✅       |         ✅         |           ✅            |            ✅            |
| Proposal Builder        |      ✅       |         ❌         |        🟡 Schema        |        ✅ Phase 2        |
| E-Signatures            |      ✅       |  ✅ (Sign module)  |        🟡 Schema        |        ✅ Phase 2        |
| Deal → Project          |      ✅       | ✅ (SO → Project)  |           ❌            |        ✅ Phase 2        |
| Project Management      |      ✅       |         ✅         |           ✅            |            ✅            |
| Task Dependencies       |      ✅       |         ✅         |        ✅ Schema        |            ✅            |
| Gantt Scheduling        |      ❌       |         ✅         |        🟡 Schema        |        ✅ Phase 3        |
| Resource Heatmap        |      ✅       |         ❌         |        🟡 Schema        |        ✅ Phase 1        |
| Utilization Tracking    |      ✅       |   ✅ (Planning)    |           ❌            |        ✅ Phase 1        |
| Time Tracking           |      ✅       |         ✅         |        🟡 Schema        |            ✅            |
| Timesheet Approval      |      ✅       |         ✅         |           ❌            |        ✅ Phase 2        |
| Time → Invoice          |      ✅       |         ✅         |           ❌            |        ✅ Phase 2        |
| Budgeting               |      ✅       |         ✅         |        🟡 Schema        |        ✅ Phase 1        |
| Real-Time Profitability |      ✅       |  🟡 (Budget mgmt)  |           ❌            |        ✅ Phase 1        |
| Budget Burn Forecast    |      ✅       |         ❌         |           ❌            |        ✅ Phase 1        |
| Overhead Allocation     |      ✅       |         ❌         |           ❌            |        ✅ Phase 1        |
| Rate Cards              |      ✅       |         ❌         |        🟡 Schema        |            ✅            |
| Invoicing               |      ✅       |         ✅         |        🟡 Schema        |            ✅            |
| Recurring Invoices      |      ✅       | ✅ (Subscriptions) |        🟡 Schema        |            ✅            |
| Expenses                |      ✅       |         ✅         |        🟡 Schema        |            ✅            |
| Scenario Builder        |      ✅       |         ❌         |        🟡 Schema        |        ✅ Phase 3        |
| Forecasting             |      ✅       |         ❌         |        🟡 Schema        |        ✅ Phase 1        |
| Custom Dashboards       |      ✅       |         ✅         |        🟡 Schema        |            ✅            |
| AI Reports              |      ✅       |         ❌         |           ❌            |          Future          |
| Shift Planning          |      ❌       |         ✅         |        🟡 Schema        |        ✅ Phase 3        |
| Time Off Management     |      ✅       |         ✅         |        🟡 Schema        |            ✅            |
| 360° Reviews            |      ❌       |         ✅         |       🟡 Partial        |        ✅ Phase 4        |
| Goal / OKR Tracking     |      ❌       |         ✅         |           ❌            |        ✅ Phase 4        |
| Quality Checks          |      ❌       |         ✅         |           ❌            |        ✅ Phase 4        |
| Knowledge Base          |      ❌       |         ✅         |     🟡 Placeholder      |        ✅ Phase 4        |
| Record Messaging        |      ❌       |    ✅ (Chatter)    |           ❌            |        ✅ Phase 4        |
| Automations             |      ✅       |         ✅         |        🟡 Schema        |            ✅            |
| Approvals Workflow      |      ✅       |         ✅         |           ✅            |            ✅            |
| Client Portal           | ✅ (limited)  |         ✅         |         ✅ Page         |            ✅            |
| Vendor Portal           |      ❌       |    ✅ (limited)    |         ✅ Page         |            ✅            |
| Live Event Ops          |      ❌       |         ❌         |         ✅ Full         |   ✅ (Differentiator)    |
| Fleet Management        |      ❌       |         ✅         |         ✅ Page         |            ✅            |
| Asset / Inventory       |      ❌       |         ✅         |         ✅ Full         |            ✅            |
| Contracts / Legal       |      ❌       |     ✅ (Sign)      |         ✅ Full         |            ✅            |
| Compliance              |      ❌       |         ❌         |         ✅ Full         |            ✅            |
| Creative / Brand        |      ❌       |         ❌         |         ✅ Full         |   ✅ (Differentiator)    |

### FrozenPhoenix Differentiators (Neither Competitor Has)

1. **Live Event Operations** — 15-page real-time command center for live events
2. **Creative & Brand Management** — Briefs, brand guidelines, campaigns, creative assets, brand kit
3. **Experiential Production Lifecycle** — Activations, run-of-show, readiness gates, department status
4. **Spatial Hierarchy** — Venue → Zone → Position → Equipment mapping
5. **Vendor Compliance Lifecycle** — Onboarding, compliance docs, classification assessments, reviews
6. **Legal & Safety** — Clause library, IP rights, permits, incidents, obligations

---

_End of analysis. This document should be reviewed by product and engineering leads before implementation begins._
