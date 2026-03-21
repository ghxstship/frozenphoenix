# Competitive Feature Gap Analysis V2: Productive.io & Odoo vs. FrozenPhoenix

**Date:** 2026-03-01 (Re-audit)
**Previous audit:** 2026-03-01 (V1 — `COMPETITIVE_FEATURE_GAP_ANALYSIS.md`)
**Scope:** Features from Productive.io (PSA) and Odoo (modular ERP) applicable to creative/experiential production management
**Method:** Feature-by-feature comparison against FrozenPhoenix's current 149-page codebase, 33 migrations, 75+ components, 351+ React Query hooks

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [What Changed Since V1](#2-what-changed-since-v1)
3. [Updated Coverage Map](#3-updated-coverage-map)
4. [New Gap Analysis: Productive.io](#4-new-gap-analysis-productiveio)
5. [New Gap Analysis: Odoo](#5-new-gap-analysis-odoo)
6. [Consolidated Gap Inventory V2](#6-consolidated-gap-inventory-v2)
7. [Implementation Recommendations](#7-implementation-recommendations)
8. [Information Architecture Strategy](#8-information-architecture-strategy)
9. [Phased Rollout V2](#9-phased-rollout-v2)
10. [Updated Feature-by-Feature Matrix](#10-updated-feature-by-feature-matrix)

---

## 1. Executive Summary

### V1 → V2 Progress

The V1 audit identified **12 feature gaps** across 4 themes. Since then, **all 12 have been partially or fully addressed at the UI layer**:

| Theme                             | V1 Gaps | Closed | Partial | Remaining |
| --------------------------------- | ------- | ------ | ------- | --------- |
| A. Real-Time Profitability Engine | 3       | 3      | 0       | 0         |
| B. Intelligent Resource Planning  | 3       | 3      | 0       | 0         |
| C. Unified Time→Invoice Pipeline  | 3       | 3      | 0       | 0         |
| D. Operational Intelligence       | 3       | 3      | 0       | 0         |

**What shipped (Phases 1–4):**

- Profitability panel on Budgets page with BurnChart + MetricCards
- Budget alert thresholds + notification delivery UI
- Utilization heatmap + Gantt on Scheduling page
- Proposal builder multi-step form + rate card import
- Proposal preview + share link + e-sign flow
- Deal → Project conversion dialog on deal detail page
- Time → Invoice pipeline (InvoicingPipeline component on time-tracking page)
- Scenario modeling UI enhancements (sliders, comparison, outcome bars)
- RecordChatter component (ActivityFeed + CommentsSection) on project detail page
- Knowledge Base article editor + record linking (detail page with view/edit/linked/chatter tabs)
- Quality Checks page with inspection checklists, photo tracking, approval flow
- Goals & OKRs page with key results, progress bars, linked projects
- 6 shared primitives: `<GanttChart>`, `<ActivityFeed>`, `<MetricCard>`, `<HeatmapGrid>`, `<BurnChart>`, `<ApprovalFlow>`

### V2 Findings

Fresh comparison against Productive.io's 2025-2026 product updates and Odoo's module suite reveals **14 new or deepened gaps** that the V1 closure didn't address. These cluster into **5 themes**:

| Theme                                                                 | Gap Count | Revenue Impact | UX Impact |
| --------------------------------------------------------------------- | --------- | -------------- | --------- |
| **E. Closed-Loop Financial Automation**                               | 3         | Critical       | High      |
| **F. AI-Native Workflows**                                            | 3         | High           | Critical  |
| **G. Real-Time Collaboration & Communication**                        | 3         | Medium         | Critical  |
| **H. Self-Service Portals & External Access**                         | 3         | High           | High      |
| **I. Operational Depth (Field Service, Helpdesk, Recurring Revenue)** | 2         | Medium         | Medium    |

**Key insight:** The V1 gaps were primarily _missing UI on top of existing schema_. The V2 gaps are about **workflow depth, automation intelligence, and cross-entity connectivity** — the features that make a platform sticky rather than just comprehensive.

---

## 2. What Changed Since V1

### Current FrozenPhoenix Surface

| Metric                   | V1 (Before) | V2 (Now)                                                                      | Delta |
| ------------------------ | ----------- | ----------------------------------------------------------------------------- | ----- |
| Dashboard pages          | 48+         | **149**                                                                       | +101  |
| UI components            | ~50         | **75+**                                                                       | +25   |
| React Query hooks        | ~60         | **351+**                                                                      | +291  |
| DB migrations            | 33          | 33                                                                            | —     |
| Navigation sections      | 11          | 11                                                                            | —     |
| Navigation items         | 95+         | 95+                                                                           | —     |
| Detail pages (with [id]) | ~10         | **18**                                                                        | +8    |
| Shared primitives        | 0           | **6** (Gantt, ActivityFeed, MetricCard, HeatmapGrid, BurnChart, ApprovalFlow) | +6    |

### V1 Gaps: Closure Status

| #   | V1 Gap                            | V2 Status      | Implementation                                                                 |
| --- | --------------------------------- | -------------- | ------------------------------------------------------------------------------ |
| 1   | Real-Time Profitability Dashboard | ✅ **Shipped** | Profitability panel on Budgets page with BurnChart, MetricCards, margin gauges |
| 2   | Utilization & Capacity Heatmap    | ✅ **Shipped** | HeatmapGrid on Scheduling page with crew utilization data                      |
| 3   | Time → Invoice Pipeline           | ✅ **Shipped** | InvoicingPipeline component on Time Tracking page with approval workflow       |
| 4   | Deal → Project Conversion         | ✅ **Shipped** | Confirmation dialog on Deal detail with editable name/budget fields            |
| 5   | Budget Burn Forecasting + Alerts  | ✅ **Shipped** | Budget alerts with threshold configuration + notification delivery             |
| 6   | Gantt Scheduling View             | ✅ **Shipped** | `<GanttChart>` primitive on Scheduling page                                    |
| 7   | Proposal Builder + E-Sign         | ✅ **Shipped** | Multi-step form at `/proposals/new`, share link + e-sign on `/proposals/[id]`  |
| 8   | Scenario Financial Modeling       | ✅ **Shipped** | Interactive sliders, side-by-side comparison, visual outcome bars              |
| 9   | Record-Level Activity Feed        | ✅ **Shipped** | `<RecordChatter>` component combining ActivityFeed + CommentsSection           |
| 10  | 360° Reviews + Goal Tracking      | ✅ **Shipped** | Goals & OKRs page with key results; Performance Reviews page enhanced          |
| 11  | Quality Check Points              | ✅ **Shipped** | Quality Checks page with inspection checklists, approval flow, photo tracking  |
| 12  | Knowledge Base + Record Linking   | ✅ **Shipped** | KB article detail page with view/edit/linked records/chatter tabs              |

**All 12 V1 gaps have been addressed at the UI layer.** However, most implementations use mock data and lack Supabase integration. The new V2 gaps focus on **workflow depth** beyond the initial UI surface.

---

## 3. Updated Coverage Map

### Legend

- ✅ **Full** — Schema + UI + functional interactions
- 🟢 **UI Shipped** — Page/component exists with mock data; Supabase wiring pending
- 🟡 **Schema Only** — DB table exists; UI is basic list/placeholder
- 🔴 **Missing** — Neither schema nor meaningful UI

| Feature Area                          | V1 Status | V2 Status | Notes                                                                 |
| ------------------------------------- | --------- | --------- | --------------------------------------------------------------------- |
| CRM Pipeline                          | ✅        | ✅        | Pipeline, Deals, Leads, Contacts, Companies, Opportunities            |
| Proposals                             | 🟡        | 🟢        | Builder + e-sign shipped; PDF generation pending                      |
| Projects / Tasks                      | ✅        | ✅        | Detail pages, RecordChatter on project detail                         |
| Events / Activations                  | ✅        | ✅        | Full schema + pages                                                   |
| Calendar                              | ✅        | ✅        | Page exists                                                           |
| Budgets                               | 🟡        | 🟢        | Profitability panel + burn chart + alerts shipped                     |
| Rate Cards                            | 🟡        | 🟡        | List page; proposal import works                                      |
| Time Tracking                         | 🟡        | 🟢        | InvoicingPipeline shipped; timer/timesheet UI enhanced                |
| Resource Planning                     | 🟡        | 🟢        | Heatmap shipped on Scheduling                                         |
| Scheduling (Gantt)                    | 🟡        | 🟢        | GanttChart primitive + page shipped                                   |
| Invoicing                             | 🟡        | 🟢        | Invoice pipeline + detail pages                                       |
| Expenses                              | 🟡        | 🟡        | Page exists; no receipt capture or auto-categorization                |
| Scenarios                             | 🟡        | 🟢        | Sliders + comparison + outcome bars shipped                           |
| Forecasting                           | 🟡        | 🟡        | Page exists with tabs; no predictive engine                           |
| Crew / Workforce                      | ✅        | ✅        | Detail pages, goals, reviews                                          |
| Assets / Inventory                    | ✅        | ✅        | Full schema + pages + detail                                          |
| Contracts                             | ✅        | ✅        | Schema + detail page                                                  |
| Approvals                             | ✅        | ✅        | Schema + page with ApprovalFlow                                       |
| Automations                           | 🟡        | 🟡        | Schema + rule builder UI; no execution engine                         |
| Knowledge Base                        | 🟡        | 🟢        | Article editor + record linking shipped                               |
| Performance Reviews                   | 🟡        | 🟢        | Reviews page + Goals/OKRs page shipped                                |
| Quality Checks                        | 🔴        | 🟢        | Full QC page shipped with checklists + approval flow                  |
| Record Chatter                        | 🔴        | 🟢        | RecordChatter on project detail; needs deployment to all detail pages |
| Live Operations                       | ✅        | ✅        | 15 pages                                                              |
| **Revenue Recognition**               | 🔴        | 🔴        | No revenue recognition logic                                          |
| **Recurring Revenue / Subscriptions** | 🟡        | 🟡        | `recurring_invoices` page exists; no auto-generation engine           |
| **Email Integration**                 | 🔴        | 🔴        | No email threading to records                                         |
| **AI-Powered Reports**                | 🔴        | 🔴        | No natural-language report generation                                 |
| **Helpdesk / Ticketing**              | 🔴        | 🔴        | Service Requests page exists but no SLA or ticket workflow            |
| **Customer Satisfaction (CSAT)**      | 🔴        | 🔴        | No post-event or post-project feedback collection                     |
| **Custom Property Fields**            | 🔴        | 🔴        | No user-defined fields on entities                                    |
| **Automation Execution Engine**       | 🔴        | 🔴        | Rule builder UI exists; no runtime trigger engine                     |

---

## 4. New Gap Analysis: Productive.io

### Gap E1: Revenue Recognition Engine

**What Productive does:** Revenue is recognized automatically based on billing policy — time & materials recognizes as hours are logged, fixed-price recognizes on milestone completion, retainer recognizes monthly. Finance dashboards show recognized vs. deferred revenue in real time.

**Why it matters for us:** We have `budgets`, `invoices`, and `production_time_entries` but no concept of recognized vs. deferred revenue. For production companies managing multi-month projects with milestone billing, revenue timing directly impacts cash flow planning and financial reporting. Without this, finance teams export to QuickBooks/Xero for recognition — breaking the single-pane-of-glass promise.

**What to build:**

- **Revenue recognition policy** — Per-project setting: Percentage of Completion, Milestone, Time & Materials, or Completed Contract
- **Recognition computation** — Supabase function that computes recognized revenue per period based on policy + actuals
- **Finance Overview enhancement** — Recognized vs. Deferred vs. Invoiced chart on Finance Overview page

**Where it surfaces:** Finance Overview page (new panel) + Project detail Financial tab + Budget detail sidebar

---

### Gap E2: Automated Invoice Draft Generation from Approved Time

**What Productive does:** When a PM approves timesheets, the system auto-generates invoice drafts grouped by rate card service line. The PM reviews the draft, adjusts if needed, and sends. Zero manual line-item creation.

**Why it matters for us:** The InvoicingPipeline component we shipped shows the _concept_ of time-to-invoice flow, but it's a read-only display with mock data. There's no actual mutation path: `approved time entry → invoice draft with line items`. The "Generate Invoice" action needs to actually create an invoice record with computed line items.

**What to build:**

- **Invoice draft generator action** — Server action / Edge Function: groups approved billable hours by rate card service, creates draft `invoice` + `invoice_items` with computed amounts
- **Billing policy enforcement** — Respect per-project `billing_policy` (time & materials, fixed price, milestone)
- **Invoice source tracking** — Badge on invoice list showing "From Timesheets" vs "Manual" vs "Recurring"

**Where it surfaces:** "Generate Invoice" button on Time Tracking invoicing tab → creates draft → navigates to Invoices page

---

### Gap E3: Time Tracking Policies & Compliance

**What Productive does:** Organization-wide time tracking policies: maximum daily hours, required fields, non-working day restrictions, mandatory time logging by EOD. Managers get compliance dashboards showing who hasn't logged time.

**Why it matters for us:** We have timer/timesheet UI but no policy enforcement. For production companies with union labor, overtime rules, and client-billable minimums, policy compliance is non-negotiable. Currently there's no way to know who hasn't logged time or who's exceeding daily limits.

**What to build:**

- **Time tracking policy config** — Organization settings: max daily hours, required fields (project, task), logging deadline, non-working days
- **Compliance dashboard** — Widget showing: missing timesheets this week (by person), overtime alerts, policy violations
- **Nudge notifications** — Automated reminders for people who haven't logged time by configured deadline

**Where it surfaces:** Time Tracking page (new "Compliance" tab) + Dashboard home widget

---

### Gap F1: AI-Powered Report Generation

**What Productive does:** Users describe what they want in natural language ("Show me profitability by project for Q1, grouped by client, excluding internal projects") and the AI generates the report with appropriate charts, filters, and grouping. Reports are saveable and shareable.

**Why it matters for us:** We have a Reports page and Saved Views, but report creation is manual. For executives who need quick answers ("Which projects are over budget this month?"), natural language query eliminates the filter/group/sort dance. This is a significant competitive differentiator for Productive.io.

**What to build:**

- **Natural language query interface** — Input field on Reports page that accepts plain-English queries
- **Query → SQL/filter translation** — Edge Function that maps NL to Supabase query parameters (leveraging existing hook layer)
- **Dynamic chart rendering** — Auto-select appropriate visualization (bar, line, pie, table) based on data shape
- **Save & share** — Generated reports are saveable as Saved Views with the original query as documentation

**Where it surfaces:** Reports page (command input at top) + ⌘K command bar shortcut ("Ask a question about your data")

---

### Gap F2: Workflow Automation Execution Engine

**What Productive does:** Automations run in real time: "When deal status changes to Won → create project → assign PM → send Slack notification → create onboarding tasks." Users can test automations with "Run Now" before activating. Trigger types include: status change, field update, schedule, form submission.

**Why it matters for us:** We have a full automation rule builder UI (`/automations` page with trigger types, action types, conditions) but **zero execution runtime**. The rules are display-only. This is the single largest "looks done but isn't" gap in the platform. Without execution, the Automations page is misleading.

**What to build:**

- **Trigger listener** — Supabase Realtime subscription that evaluates automation rules against record changes
- **Action executor** — Server-side function that executes action chains (send_notification, update_field, create_task, assign_user, send_email)
- **Execution log** — The log UI already exists; wire it to actual execution records
- **Test mode** — "Run Now" button that simulates trigger with a real record to validate rule before activation

**Where it surfaces:** Automations page (existing UI — wire execution) + execution log tab

---

### Gap F3: Project Templates with Pre-configured Structure

**What Productive does:** Project templates include pre-set tasks, milestones, budget structure, team roles, docs, and automations. Creating a new project from a template clones the entire structure. Templates are versioned and shared across the organization.

**Why it matters for us:** We have a Templates page and a "New Project" flow, but project creation doesn't clone from a template with pre-configured tasks, budget lines, and team assignments. For production companies running the same event types (festival, product launch, experiential pop-up), template-based creation saves hours of setup.

**What to build:**

- **Template structure definition** — Template includes: task list with dependencies, budget line structure, team role assignments, linked doc templates, default automations
- **"Create from Template" flow** — On Projects > New: select template → review/customize → create project with all structure cloned
- **Template versioning** — Templates are versioned; projects link back to template version for audit

**Where it surfaces:** `/projects/new` (template selection step) + Templates page (enhanced to show project templates)

---

### Gap G1: Email Integration (Bi-directional)

**What Productive does:** Gmail/Outlook integration lets users preview emails, link messages to contacts, deals, budgets, or invoices directly from the email client. Emails appear in the record's activity feed. Reply from within Productive.

**Why it matters for us:** All record communication currently requires manual input in the RecordChatter component. Real production coordination happens in email — client approvals, vendor confirmations, change requests. Without email integration, the activity feed is incomplete, and users must duplicate communication context.

**What to build:**

- **Inbound email parsing** — Webhook endpoint that receives forwarded emails, extracts sender/subject/body, and attaches to matching record via entity lookup
- **Activity feed email entries** — Email type in RecordChatter with sender, subject, preview, and "View Full" expansion
- **Link-from-email action** — Browser extension or email forwarding address (e.g., `deal-123@inbound.app.com`) that auto-links to the correct record

**Where it surfaces:** RecordChatter on all detail pages (new "email" activity type) + Settings > Integrations

---

### Gap G2: Real-Time Collaborative Document Editing

**What Productive does:** Docs module allows multiple users to edit the same document simultaneously with cursor presence, comments, and change tracking. Docs are linkable to projects, budgets, and deals.

**Why it matters for us:** Our Knowledge Base article editor is single-user (useState-based editing). For production documents like call sheets, tech riders, and run-of-show timelines that multiple people need to update simultaneously, single-user editing creates merge conflicts and version confusion.

**What to build:**

- **Collaborative editing engine** — Integrate Supabase Realtime for operational transforms or use a library like Yjs/Hocuspocus for CRDT-based collaboration
- **Cursor presence** — Show who else is editing with colored cursors and name labels
- **Inline commenting** — Select text → add comment thread (distinct from RecordChatter page-level comments)

**Where it surfaces:** Knowledge Base article editor + Call Sheet editor + any rich text editor in the platform

---

### Gap G3: @Mention Notifications Across All Records

**What Productive does:** @mention in any comment triggers in-app notification + email to the mentioned user with a deep link back to the exact comment. Users can configure notification preferences per channel.

**Why it matters for us:** The CommentsSection component accepts comment text but has no @mention parsing, user lookup, or notification dispatch. For a production team of 50+ people across multiple concurrent events, @mention is the primary mechanism for directed attention.

**What to build:**

- **@mention autocomplete** — Trigger on `@` character in comment input; show user/role picker with avatar + name
- **Mention extraction** — Parse `@[user_id]` from comment body on submission
- **Notification dispatch** — Create in-app notification + optional email for each mentioned user with deep link to comment
- **Notification preferences** — Per-user settings: in-app only, in-app + email, muted per record

**Where it surfaces:** CommentsSection component (universal — all detail pages) + Settings > Notifications

---

### Gap H1: Client Portal with Project Visibility

**What Productive does:** Client users get a scoped view: their projects, budgets (optional), tasks assigned to them, proposals awaiting approval, invoices, and a messaging channel to the agency. Clients cannot see internal data, other clients, or financial data unless explicitly shared.

**Why it matters for us:** We have a `/client-portal` page but it's a placeholder. For production companies, the client portal is the primary interface for client stakeholders to: approve creative, review budgets, sign proposals, track deliverables, and communicate. Without it, clients call/email PMs for status updates — a massive time sink.

**What to build:**

- **Client role scoping** — RBAC already supports `client` role; need to enforce data scoping: only their projects, their proposals, their invoices
- **Client dashboard** — Simplified home: active projects with status, pending approvals, recent invoices, unread messages
- **Approval actions** — Client can approve/reject proposals, budgets, creative deliverables directly from portal
- **Messaging** — RecordChatter scoped to client-visible records

**Where it surfaces:** `/client-portal` (enhanced from placeholder) — uses existing page route

---

### Gap H2: Vendor Self-Service Portal

**What Productive does:** N/A (Productive doesn't have vendor portals)

**What Odoo does:** Vendor portal for submitting invoices, viewing purchase orders, confirming delivery schedules, updating compliance documents, and claiming open shifts.

**Why it matters for us:** We have `/vendor-portal` as a placeholder. For production companies managing 50+ vendors/freelancers, vendor self-service for: shift confirmation, availability updates, invoice submission, compliance document uploads, and quality check sign-off would eliminate massive admin overhead.

**What to build:**

- **Vendor role scoping** — Enforce data scoping to vendor's own records: their work orders, shifts, payments, compliance docs
- **Shift claiming** — Open/unassigned shifts visible to qualified vendors for self-assignment
- **Document upload** — Vendor can upload insurance certs, licenses, W-9/W-8 directly
- **Invoice submission** — Vendor submits invoice for their completed work; PM approves

**Where it surfaces:** `/vendor-portal` (enhanced from placeholder) — uses existing page route

---

### Gap H3: Customer Satisfaction / Post-Event Surveys

**What Odoo does:** Configurable satisfaction surveys triggered after ticket resolution, project completion, or event. Rating data aggregated per project, team, and customer for trend analysis.

**Why it matters for us:** For experiential production, post-event feedback from clients, attendees, and stakeholders is critical for: rebooking decisions, case study content, and continuous improvement. We have no survey or feedback collection mechanism.

**What to build:**

- **Survey template builder** — Simple form: rating (1-5), open text fields, configurable questions per event type
- **Trigger mechanism** — Auto-send survey link when project status changes to "completed" or event enters "post-event" phase
- **Response dashboard** — Aggregate CSAT scores per project, client, team, and time period
- **Link to case studies** — High-scoring projects auto-suggested for case study creation

**Where it surfaces:** Projects detail (new "Feedback" tab when status = completed) + Reports page (CSAT analytics)

---

### Gap I1: Helpdesk / Internal Ticketing with SLAs

**What Odoo does:** Multi-channel ticket creation (email, form, chat), configurable SLA rules per priority/type, automated assignment based on team workload, customer satisfaction ratings per ticket, knowledge base integration for self-service resolution.

**Why it matters for us:** We have a Service Requests page but it's a basic list with no SLA tracking, priority escalation, or resolution workflow. For production companies, internal tickets ("projector is broken on Stage B", "need additional crew for Saturday load-in") and client tickets ("can we change the logo placement?") need structured handling with time-based SLAs.

**What to build:**

- **SLA rules engine** — Configure response time and resolution time targets per priority level and ticket type
- **SLA timer display** — Countdown/overdue badge on each ticket showing time remaining
- **Auto-assignment** — Round-robin or workload-based assignment to team members
- **Knowledge base deflection** — Before creating a ticket, surface relevant KB articles; track deflection rate
- **CSAT per ticket** — One-click satisfaction rating after resolution

**Where it surfaces:** Service Requests page (enhanced with SLA, assignment, and resolution workflow) — uses existing page route

---

### Gap I2: Custom Property Fields (User-Defined Fields)

**What Odoo does:** Studio module lets admins add custom fields to any entity without code changes. Fields appear in forms, lists, filters, and exports.

**What Productive does:** Custom fields on tasks, projects, and budgets with various types (text, number, date, dropdown, person, checkbox).

**Why it matters for us:** Every production company has unique data needs: "venue capacity", "union jurisdiction", "technical director", "load-in duration". Currently these require code changes to add. User-defined fields would let admins customize without developer involvement — critical for white-label deployability.

**What to build:**

- **Custom field definition** — Admin UI to define fields: name, type (text, number, date, select, person, boolean, currency), entity types it applies to, required/optional, default value
- **Dynamic field rendering** — Render custom fields on entity detail pages using a `<DynamicFieldRenderer>` component
- **Filter/sort/export support** — Custom fields available in search, filter bars, and data export

**Where it surfaces:** Settings > Custom Fields (admin config) + all entity detail pages (dynamic rendering)

---

## 5. New Gap Analysis: Odoo

_(Odoo-specific gaps are integrated into the consolidated list above where Odoo is the primary source. Additional Odoo-only gaps below.)_

### Odoo Features Already Covered by FrozenPhoenix

| Odoo Module          | FP Equivalent                                          | Status              |
| -------------------- | ------------------------------------------------------ | ------------------- |
| CRM                  | Pipeline, Deals, Leads, Contacts                       | ✅ Parity           |
| Sales / Sales Orders | Proposals + Estimates                                  | 🟢 Good             |
| Project              | Projects + Tasks + Dependencies                        | ✅ Parity           |
| Timesheets           | Time Tracking + InvoicingPipeline                      | 🟢 Good             |
| Planning (Gantt)     | Scheduling + GanttChart                                | 🟢 Good             |
| Inventory            | Assets + Inventory + Warehouses                        | ✅ Parity           |
| Purchase             | Procurement + Purchase Requisitions + Goods Receipts   | ✅ Parity           |
| Expenses             | Expenses page                                          | 🟡 Basic            |
| Approvals            | Approvals page + ApprovalFlow                          | ✅ Parity           |
| Documents            | Documents + Knowledge Base + Call Sheets + Tech Sheets | ✅ Better           |
| Fleet                | Fleet page                                             | 🟡 Basic            |
| Time Off             | Time Off page                                          | 🟡 Basic            |
| Events               | Events + Live Operations (15 pages)                    | ✅ **Far superior** |
| Quality              | Quality Checks page                                    | 🟢 Good             |
| Appraisals           | Performance Reviews + Goals/OKRs                       | 🟢 Good             |

### Odoo Features NOT Applicable to Our Use Case

| Odoo Module          | Why Not Applicable                                                           |
| -------------------- | ---------------------------------------------------------------------------- |
| Manufacturing / MRP  | Production companies don't manufacture; fabrication is outsourced to vendors |
| Point of Sale        | Not a retail business                                                        |
| Website / eCommerce  | Not a storefront; client portal covers external access                       |
| eLearning            | Training is vendor-managed; certifications page covers compliance            |
| Recruitment          | Small teams hire via networks, not ATS workflows                             |
| Marketing Automation | Creative agencies use specialized tools (HubSpot, Mailchimp)                 |
| Subscriptions        | Not a subscription business model (project-based billing)                    |
| Rental               | Handled by asset/inventory lifecycle, not rental-specific workflow           |

---

## 6. Consolidated Gap Inventory V2

### Priority Matrix

| #   | Feature                                  | Source     | Theme | DB Ready?        | Complexity | Business Impact | Effort  |
| --- | ---------------------------------------- | ---------- | ----- | ---------------- | ---------- | --------------- | ------- |
| 1   | Automation Execution Engine              | Productive | F     | 🟡 Schema exists | **High**   | **Critical**    | 3 weeks |
| 2   | Invoice Draft Generation (real mutation) | Productive | E     | 🟡 Partial       | Medium     | **Critical**    | 1 week  |
| 3   | Client Portal (functional)               | Both       | H     | ✅ RBAC exists   | Medium     | **Critical**    | 2 weeks |
| 4   | Revenue Recognition Engine               | Productive | E     | 🔴 No            | Medium     | **High**        | 2 weeks |
| 5   | @Mention Notifications                   | Both       | G     | 🔴 No            | Medium     | **High**        | 1 week  |
| 6   | Time Tracking Policies & Compliance      | Productive | E     | 🔴 No            | Medium     | **High**        | 1 week  |
| 7   | Project Templates (structural)           | Productive | F     | 🟡 Partial       | Medium     | **High**        | 2 weeks |
| 8   | AI-Powered Report Generation             | Productive | F     | 🔴 No            | **High**   | **High**        | 3 weeks |
| 9   | Vendor Self-Service Portal               | Odoo       | H     | ✅ RBAC exists   | Medium     | **High**        | 2 weeks |
| 10  | Helpdesk / SLA Ticketing                 | Odoo       | I     | 🟡 Partial       | Medium     | **Medium**      | 2 weeks |
| 11  | Customer Satisfaction Surveys            | Odoo       | H     | 🔴 No            | Low        | **Medium**      | 1 week  |
| 12  | Email Integration                        | Productive | G     | 🔴 No            | **High**   | **Medium**      | 3 weeks |
| 13  | Collaborative Document Editing           | Both       | G     | 🔴 No            | **High**   | **Medium**      | 3 weeks |
| 14  | Custom Property Fields                   | Both       | I     | 🔴 No            | **High**   | **Medium**      | 3 weeks |

**Key insight:** Unlike V1 where 8/12 gaps had DB schema ready, only 4/14 V2 gaps have partial or full schema. These are _deeper_ platform capabilities that require new infrastructure.

---

## 7. Implementation Recommendations

### Design Philosophy: Depth Over Breadth

V1 was about **surface coverage** — making sure every competitor feature had a corresponding page. V2 is about **workflow depth** — making features that already exist actually _work end-to-end_.

**Core principles:**

1. **Wire before expand** — Connect existing mock-data pages to Supabase before adding new features. A functional budgets page with real data beats a new AI report builder on mock data.
2. **Automate the seams** — The highest-value features are at entity boundaries: time→invoice, deal→project, event→survey, shift→notification. These connection points are where manual work currently lives.
3. **External user value** — Client portal and vendor portal are the primary competitive moat features. They convert FrozenPhoenix from an internal tool to a platform that _replaces client emails and vendor spreadsheets_.
4. **Progressive capability** — Ship @mentions before email integration. Ship time policies before AI reports. Each feature builds on the previous.

### Shared Infrastructure to Build First

| Infrastructure                    | Enables                                                                      | Complexity        |
| --------------------------------- | ---------------------------------------------------------------------------- | ----------------- |
| **Notification dispatch service** | @mentions, time policy nudges, SLA alerts, budget alerts, automation actions | Medium            |
| **Entity-polymorphic linking**    | @mentions, custom fields, record comments, activity log                      | Medium            |
| **Template cloning engine**       | Project templates, checklist templates, survey templates                     | Medium            |
| **External user session scoping** | Client portal, vendor portal, proposal viewing                               | Low (RBAC exists) |

### Per-Feature Implementation Notes

#### Feature 1: Automation Execution Engine

**Current state:** Full automation rule builder UI at `/automations` with trigger types (created, updated, status_changed, due_date_approaching, overdue, scheduled) and action types (send_notification, send_email, update_field, create_task, assign_user, move_stage). Execution logs UI exists. **Nothing actually executes.**

**What to build:**

- Supabase Realtime listener that evaluates rules against `postgres_changes` events
- Action executor (Edge Function) that runs the action chain for matching rules
- Wire execution log to real run records
- Add "Test Run" button that simulates trigger with a specific record

**UX pattern:** Zero new UI needed — existing `/automations` page already has everything. Just wire the backend.

**DB changes:**

- Add `last_triggered_at`, `trigger_count`, `error_count` to `automations` table
- Add `automation_executions` table: `id`, `automation_id`, `trigger_record_type`, `trigger_record_id`, `status`, `actions_executed`, `error`, `started_at`, `completed_at`

---

#### Feature 2: Invoice Draft Generation

**Current state:** InvoicingPipeline component on Time Tracking page shows grouped billable time entries with mock approval flow. "Generate Invoice" button exists but performs no mutation.

**What to build:**

- Server action: query approved billable time entries → group by rate card service → compute amounts → insert `invoice` + `invoice_items` → mark time entries as invoiced
- Wire the "Generate Invoice" button to this action
- Navigate to the created invoice for review/send

**DB changes:**

- Add `invoice_id` column to `production_time_entries` (FK to `invoices`)
- Add `source` column to `invoices` enum: `manual`, `timesheet`, `recurring`

---

#### Feature 3: Client Portal (Functional)

**Current state:** `/client-portal` page exists as placeholder. RBAC has `client` permission level with scoping rules.

**What to build:**

- Client-scoped data queries: `projects WHERE client_id = auth.user.company_id`, similar for proposals, invoices
- Client dashboard layout: active projects, pending approvals, invoices, messages
- Approval actions: proposal accept/reject, creative approve/reject, budget sign-off
- RecordChatter integration scoped to client-visible comments only

**DB changes:** None — RBAC and data model support this. Implementation is query scoping + UI.

---

#### Feature 4: Revenue Recognition

**Where it lives:** Finance Overview (new "Revenue Recognition" panel) + Project detail Financial tab

**What to build:**

- `billing_policy` enum on projects: `time_and_materials`, `fixed_price`, `milestone`, `retainer`
- Recognition computation function: based on policy, compute recognized revenue per period
- Recognized vs. Deferred vs. Invoiced chart widget

**DB changes:**

- Add `billing_policy` to `projects`
- New `revenue_recognition_entries` table: `project_id`, `period`, `recognized_amount`, `deferred_amount`, `method`

---

#### Feature 5: @Mention Notifications

**Where it lives:** CommentsSection component (universal)

**What to build:**

- @mention autocomplete in comment Textarea (trigger on `@`)
- Mention extraction on submit: parse `@[uuid]` patterns
- Notification insert: `notifications` table with `mentioned_in_comment` type, deep link, read status
- Toast/bell integration with existing notification UI

**DB changes:**

- New `notifications` table (if not exists): `id`, `user_id`, `type`, `title`, `body`, `entity_type`, `entity_id`, `read_at`, `created_at`
- Add `mentioned_user_ids` JSONB to `record_comments` (or wherever comments are stored)

---

#### Feature 6: Time Tracking Policies

**Where it lives:** Settings > Time Tracking Policies (admin config) + Time Tracking page "Compliance" tab

**What to build:**

- Policy config: max hours/day, required fields, logging deadline (hour), non-working days
- Compliance widget: who hasn't logged today/this week, overtime alerts
- Scheduled Edge Function: check at deadline hour → create notification for missing timesheets

**DB changes:**

- New `time_tracking_policies` table: `org_id`, `max_daily_hours`, `required_fields`, `logging_deadline_hour`, `non_working_days`

---

#### Feature 7: Project Templates

**Where it lives:** `/projects/new` (template selection step) + `/templates` page (enhanced)

**What to build:**

- Template definition: save project + tasks + budget structure + team roles as template
- "Save as Template" action on any project
- "Create from Template" in new project flow: select → customize → create with cloned structure
- Template versioning: `version` field, projects link back to `template_id` + `template_version`

**DB changes:**

- Add `template_id`, `template_version` to `projects`
- New `project_templates` table: `id`, `name`, `description`, `structure` (JSONB with tasks, budget lines, roles), `version`, `created_by`

---

#### Features 8–14: Deferred to Phase 3+

AI reports, email integration, collaborative editing, custom fields, helpdesk SLAs, surveys, and vendor portal are **infrastructure-heavy** features that should be tackled after the core workflow depth is established. Each requires significant backend work beyond UI.

---

## 8. Information Architecture Strategy

### Principle: Zero New Top-Level Nav Items (Maintained)

All 14 features integrate into existing navigation. No new cognitive load.

| Feature               | Where It Surfaces                             | IA Treatment                |
| --------------------- | --------------------------------------------- | --------------------------- |
| Automation Engine     | Automations page (wire existing UI)           | **Backend only**            |
| Invoice Generation    | Time Tracking invoicing tab (existing button) | **Wire existing action**    |
| Client Portal         | `/client-portal` (existing route)             | **Page enhancement**        |
| Revenue Recognition   | Finance Overview + Project detail             | **Embedded panel**          |
| @Mentions             | CommentsSection component (universal)         | **Component enhancement**   |
| Time Policies         | Settings + Time Tracking compliance tab       | **New tab + settings**      |
| Project Templates     | `/projects/new` + Templates page              | **Flow enhancement**        |
| AI Reports            | Reports page (input field)                    | **Component addition**      |
| Vendor Portal         | `/vendor-portal` (existing route)             | **Page enhancement**        |
| Helpdesk SLAs         | Service Requests page                         | **Page enhancement**        |
| CSAT Surveys          | Project detail (completed state)              | **Conditional tab**         |
| Email Integration     | RecordChatter + Settings                      | **Component enhancement**   |
| Collaborative Editing | KB editor, Call Sheets, Tech Sheets           | **Editor upgrade**          |
| Custom Fields         | Settings + all detail pages                   | **Platform infrastructure** |

### Cognitive Load Management (V2 Additions)

1. **No visible change until needed** — Automation engine runs silently. Revenue recognition computes in background. @mention only appears when `@` is typed.
2. **Portals are separate entry points** — Client and vendor portals use the same codebase but different layouts. No nav pollution for internal users.
3. **Settings absorb config** — Time policies, custom fields, and notification preferences live in Settings. PMs never see admin config unless they need it.
4. **Progressive capability loading** — Features like AI reports show only after org enables them via feature flag (existing `feature_flags` infrastructure).

### Role-Based Relevance (V2)

| Feature               | Exec            | PM                 | Client                   | Vendor                   |
| --------------------- | --------------- | ------------------ | ------------------------ | ------------------------ |
| Automation Engine     | ✅ Configure    | ✅ Configure       | ❌                       | ❌                       |
| Invoice Generation    | ✅ Approve      | ✅ Generate        | ✅ View invoice          | ❌                       |
| Client Portal         | ❌ N/A          | ❌ N/A             | ✅ **Primary interface** | ❌                       |
| Revenue Recognition   | ✅ Full         | ✅ Project-scoped  | ❌                       | ❌                       |
| @Mentions             | ✅              | ✅                 | ✅ Scoped                | ✅ Scoped                |
| Time Policies         | ✅ Configure    | ✅ Compliance view | ❌                       | ✅ Own compliance        |
| Project Templates     | ✅ Manage       | ✅ Use             | ❌                       | ❌                       |
| AI Reports            | ✅ Full         | ✅ Full            | ❌                       | ❌                       |
| Vendor Portal         | ❌ N/A          | ❌ N/A             | ❌                       | ✅ **Primary interface** |
| Helpdesk SLAs         | ✅ Configure    | ✅ Resolve         | ✅ Submit                | ✅ Submit                |
| CSAT Surveys          | ✅ View results | ✅ View results    | ✅ Submit                | ❌                       |
| Email Integration     | ✅              | ✅                 | ✅ Via email             | ✅ Via email             |
| Collaborative Editing | ✅              | ✅                 | ✅ Shared docs           | ❌                       |
| Custom Fields         | ✅ Configure    | ✅ Use             | ✅ Visible fields        | ✅ Visible fields        |

---

## 9. Phased Rollout V2

### Phase 5: Workflow Depth (Weeks 17–20)

_Make existing features actually work end-to-end_

| Week | Deliverable                                                                            | Theme |
| ---- | -------------------------------------------------------------------------------------- | ----- |
| 17   | Automation execution engine: Realtime listener + action executor + wire to existing UI | F     |
| 18   | Invoice draft generation from approved time: server action + mutation wiring           | E     |
| 18   | @Mention autocomplete + notification dispatch in CommentsSection                       | G     |
| 19   | Time tracking policies: config UI + compliance dashboard widget                        | E     |
| 20   | Revenue recognition engine: billing policy + computation + Finance panel               | E     |

**Outcome:** Automations actually fire. Time entries become invoices with one click. PMs get @mentioned and notified. Time compliance is enforced. Revenue is recognized correctly.

### Phase 6: External Access (Weeks 21–24)

_Turn FrozenPhoenix from internal tool to platform_

| Week | Deliverable                                                                         | Theme |
| ---- | ----------------------------------------------------------------------------------- | ----- |
| 21   | Client portal: scoped queries + client dashboard + approval actions                 | H     |
| 22   | Client portal: RecordChatter integration + proposal/invoice views                   | H     |
| 23   | Vendor portal: scoped queries + shift claiming + document upload                    | H     |
| 24   | Customer satisfaction surveys: template builder + auto-trigger + response dashboard | H     |

**Outcome:** Clients see their projects and approve deliverables without emailing PMs. Vendors claim shifts and submit compliance docs without admin coordination.

### Phase 7: Intelligence & Templates (Weeks 25–28)

_Make the platform smart_

| Week | Deliverable                                                                                                                        | Theme |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------- | ----- |
| 25   | Project templates: save-as-template + create-from-template flow                                                                    | F     |
| 26   | Helpdesk SLA engine: rules, timers, auto-assignment on Service Requests                                                            | I     |
| 27   | AI report generation: NL input → query → chart (requires LLM API key)                                                              | F     |
| 28   | RecordChatter deployed to all remaining detail pages (deals, tasks, assets, contracts, invoices, crew, vendors, locations, events) | G     |

**Outcome:** New projects spin up from templates in seconds. Service requests have SLA accountability. Executives ask questions in English and get charts.

### Phase 8: Platform Infrastructure (Weeks 29–32)

_Enterprise readiness_

| Week | Deliverable                                                                      | Theme |
| ---- | -------------------------------------------------------------------------------- | ----- |
| 29   | Email integration: inbound webhook + activity feed email type + record linking   | G     |
| 30   | Custom property fields: definition UI + dynamic renderer + filter/export support | I     |
| 31   | Collaborative document editing: CRDT engine + cursor presence                    | G     |
| 32   | Full Supabase wiring pass: connect all remaining mock-data pages to real DB      | —     |

**Outcome:** Email flows into records automatically. Admins customize entity fields without developers. Teams co-edit documents in real time. All pages use real data.

---

## 10. Updated Feature-by-Feature Matrix

| Feature                 | Productive.io |      Odoo      | FP (V1) |   FP (V2 Current)   |    FP (V2 Proposed)    |
| ----------------------- | :-----------: | :------------: | :-----: | :-----------------: | :--------------------: |
| CRM Pipeline            |      ✅       |       ✅       |   ✅    |         ✅          |           ✅           |
| Proposal Builder        |      ✅       |       ❌       |   🟡    |     🟢 Shipped      |   ✅ Phase 5 (wire)    |
| E-Signatures            |      ✅       |       ✅       |   🟡    |     🟢 Shipped      |   ✅ Phase 5 (wire)    |
| Deal → Project          |      ✅       |       ✅       |   ❌    |     🟢 Shipped      |   ✅ Phase 5 (wire)    |
| Project Management      |      ✅       |       ✅       |   ✅    |         ✅          |           ✅           |
| Project Templates       |      ✅       |       ✅       |   ❌    |         ❌          |       ✅ Phase 7       |
| Task Dependencies       |      ✅       |       ✅       |   ✅    |         ✅          |           ✅           |
| Gantt Scheduling        |      ❌       |       ✅       |   🟡    |     🟢 Shipped      |   ✅ Phase 5 (wire)    |
| Resource Heatmap        |      ✅       |       ❌       |   🟡    |     🟢 Shipped      |   ✅ Phase 5 (wire)    |
| Utilization Tracking    |      ✅       |       ✅       |   ❌    |     🟢 Shipped      |   ✅ Phase 5 (wire)    |
| Time Tracking           |      ✅       |       ✅       |   🟡    |     🟢 Enhanced     |           ✅           |
| Time Policies           |      ✅       |       ✅       |   ❌    |         ❌          |       ✅ Phase 5       |
| Timesheet Approval      |      ✅       |       ✅       |   ❌    |     🟢 Shipped      |   ✅ Phase 5 (wire)    |
| Time → Invoice          |      ✅       |       ✅       |   ❌    |    🟢 UI shipped    |   ✅ Phase 5 (wire)    |
| Budgeting               |      ✅       |       ✅       |   🟡    |     🟢 Enhanced     |           ✅           |
| Real-Time Profitability |      ✅       |       🟡       |   ❌    |     🟢 Shipped      |   ✅ Phase 5 (wire)    |
| Budget Burn Forecast    |      ✅       |       ❌       |   ❌    |     🟢 Shipped      |   ✅ Phase 5 (wire)    |
| Revenue Recognition     |      ✅       |       ✅       |   ❌    |         ❌          |       ✅ Phase 5       |
| Rate Cards              |      ✅       |       ❌       |   🟡    |         🟡          |           ✅           |
| Invoicing               |      ✅       |       ✅       |   🟡    |     🟢 Enhanced     |           ✅           |
| Recurring Invoices      |      ✅       |       ✅       |   🟡    |         🟡          |       ✅ Phase 8       |
| Expenses                |      ✅       |       ✅       |   🟡    |         🟡          |           ✅           |
| Scenario Builder        |      ✅       |       ❌       |   🟡    |     🟢 Shipped      |   ✅ Phase 5 (wire)    |
| Forecasting             |      ✅       |       ❌       |   🟡    |         🟡          |       ✅ Phase 7       |
| Custom Dashboards       |      ✅       |       ✅       |   🟡    |         🟡          |           ✅           |
| AI Reports              |      ✅       |       ❌       |   ❌    |         ❌          |       ✅ Phase 7       |
| Automations (Builder)   |      ✅       |       ✅       |   🟡    |   🟡 UI complete    |           ✅           |
| Automations (Execution) |      ✅       |       ✅       |   ❌    |         ❌          |       ✅ Phase 5       |
| Shift Planning          |      ❌       |       ✅       |   🟡    |     🟢 Shipped      |           ✅           |
| Time Off Management     |      ✅       |       ✅       |   🟡    |         🟡          |           ✅           |
| 360° Reviews            |      ❌       |       ✅       |   🟡    |     🟢 Shipped      |           ✅           |
| Goal / OKR Tracking     |      ❌       |       ✅       |   ❌    |     🟢 Shipped      |           ✅           |
| Quality Checks          |      ❌       |       ✅       |   ❌    |     🟢 Shipped      |           ✅           |
| Knowledge Base          |      ❌       |       ✅       |   🟡    |     🟢 Shipped      |           ✅           |
| Record Messaging        |      ❌       |       ✅       |   ❌    | 🟢 Shipped (1 page) | ✅ Phase 7 (all pages) |
| @Mention Notifications  |      ✅       |       ✅       |   ❌    |         ❌          |       ✅ Phase 5       |
| Email Integration       |      ✅       |       ✅       |   ❌    |         ❌          |       ✅ Phase 8       |
| Collaborative Editing   |   ✅ (Docs)   | ✅ (Knowledge) |   ❌    |         ❌          |       ✅ Phase 8       |
| Client Portal           |      ✅       |       ✅       |   🟡    |   🟡 Placeholder    |       ✅ Phase 6       |
| Vendor Portal           |      ❌       |       ✅       |   🟡    |   🟡 Placeholder    |       ✅ Phase 6       |
| Helpdesk / SLA          |      ❌       |       ✅       |   🟡    |      🟡 Basic       |       ✅ Phase 7       |
| CSAT Surveys            |      ❌       |       ✅       |   ❌    |         ❌          |       ✅ Phase 6       |
| Custom Fields           |      ✅       |  ✅ (Studio)   |   ❌    |         ❌          |       ✅ Phase 8       |
| Approvals Workflow      |      ✅       |       ✅       |   ✅    |         ✅          |           ✅           |
| Fleet Management        |      ❌       |       ✅       |   ✅    |         ✅          |           ✅           |
| Asset / Inventory       |      ❌       |       ✅       |   ✅    |         ✅          |           ✅           |
| Contracts / Legal       |      ❌       |       ✅       |   ✅    |         ✅          |           ✅           |
| Compliance              |      ❌       |       ❌       |   ✅    |         ✅          |           ✅           |
| Live Event Ops          |      ❌       |       ❌       |   ✅    |         ✅          |  ✅ (Differentiator)   |
| Creative / Brand        |      ❌       |       ❌       |   ✅    |         ✅          |  ✅ (Differentiator)   |

---

## FrozenPhoenix Differentiators (Neither Competitor Has)

1. **Live Event Operations** — 15-page real-time command center (run-of-show, readiness gates, department status, crew, equipment, environment, FOH, VIP, guest incidents, strike, reconciliation, reports)
2. **Creative & Brand Management** — Briefs, brand guidelines, brand kit, campaigns, creative assets, decks, case studies
3. **Experiential Production Lifecycle** — Activations, call sheets, tech sheets, SOPs with production-specific workflows
4. **Spatial Hierarchy** — Venue → Zone → Position → Equipment mapping with location detail pages
5. **Vendor Compliance Lifecycle** — Onboarding, compliance docs, classification assessments, reviews, risk scoring
6. **Legal & Safety** — Clause library, IP rights, permits, incidents, obligations, engineering approvals, certifications, compliance checklists
7. **Quality Gate System** — Automated deployment blocking with 360+ criteria, waivers, attestations, and CI pipeline

---

## Summary: V1 → V2 Trajectory

```
V1 State:  Wide surface, shallow depth. 48 pages, 12 gaps (mostly UI-on-schema).
V2 State:  Wide surface, moderate depth. 149 pages, 14 NEW gaps (workflow depth + automation + external access).
V2 Target: Wide surface, deep workflows. Automations execute. Time becomes invoices. Clients self-serve. AI answers questions.
```

**The competitive moat is shifting from "do we have a page for X?" to "does X actually work end-to-end without manual intervention?"** Productive.io wins on closed-loop financial automation. Odoo wins on cross-module connectivity. FrozenPhoenix wins on domain specificity (live events, creative, experiential). The V2 roadmap closes the automation and connectivity gap while preserving the domain advantage.

---

_End of V2 analysis. This document should be reviewed by product and engineering leads before Phase 5 implementation begins._
