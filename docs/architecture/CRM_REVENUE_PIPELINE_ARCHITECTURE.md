# CRM & Revenue Pipeline Lifecycle Architecture

## Executive Summary

This document defines the unified CRM-to-Revenue pipeline architecture for Frozen Phoenix, bridging the gap between pre-sale lead/deal management and post-sale project delivery, billing, and account health. The architecture eliminates data fragmentation, enforces 3NF normalization, maintains SSOT governance, and provides full lifecycle visibility from first contact through revenue recognition and client retention.

### Critical Findings

| # | Finding | Severity | Current State | Future State |
|---|---------|----------|---------------|--------------|
| 1 | **No canonical Account entity linking deals → projects** | Critical | `deals.company` is a text field; `projects.client` is a separate text field; `companies` table exists but is not FK'd from deals/projects | `companies` becomes the SSOT Account entity; `deals`, `projects`, `leads` all FK to `companies.id` |
| 2 | **Deal-to-Project handoff is manual** | High | No `deal_id` on `projects` table; won deals don't auto-scaffold projects | `projects.deal_id` FK; automated conversion workflow with phase-gate approval |
| 3 | **No Opportunity concept separate from Deal** | Medium | `deals` table conflates pipeline opportunity with closed contract; stages include "lead" through "won" | Introduce `opportunities` table with granular pipeline stages; `deals` reserved for closed/contracted revenue |
| 4 | **Lead scoring disconnected from pipeline** | Medium | `leads` table has scoring but conversion to deal loses context | Lead → Opportunity conversion preserves source attribution, scoring history, and contact linkage |
| 5 | **No revenue recognition framework** | Critical | No scheduled revenue entries; no invoiced vs. recognized split | `revenue_schedules` table with ASC 606-compliant recognition events |
| 6 | **No change order management** | High | Scope changes are informal; no financial tracking of additions | `change_orders` table linked to projects + SOW with approval workflow |
| 7 | **No account health scoring** | Medium | No aggregated view of client relationship health | `account_health_scores` computed from project delivery, payment history, NPS, engagement |
| 8 | **No expansion/upsell pipeline** | Medium | Repeat business is treated as new leads | `opportunities.type` = 'expansion'/'renewal' with parent account context |
| 9 | **No portfolio-level forecasting** | High | Deal pipeline forecast is isolated from project revenue actuals | Unified forecast model: pipeline weighted + contracted + recognized |

---

## 1. Current-State Workflow Map

### 1.1 Existing Entity Relationships

```
┌──────────────┐     text field      ┌──────────────┐     text field     ┌──────────────┐
│    leads      │ ──converted_to──→  │    deals      │ ──company (text)──→│  (no FK)      │
│ (migration 4) │    deal_id FK      │ (migration 1) │                    │               │
└──────────────┘                     └──────────────┘                    └──────────────┘
                                           │
                                           │ deal_id FK (proposals only)
                                           ▼
                                     ┌──────────────┐
                                     │  proposals    │──company_id FK──→ companies
                                     │ (migration 5) │──contact_id FK──→ contacts
                                     └──────────────┘
                                           │
                                           │ proposal_id FK
                                           ▼
                                     ┌──────────────┐
                                     │ scopes_of_work│──project_id FK──→ projects
                                     │ (migration 7) │──contract_id FK──→ contracts
                                     └──────────────┘
                                           │
                                           │ sow_id FK
                                           ▼
                                     ┌──────────────┐
                                     │client_invoices│──company_id FK──→ companies
                                     │ (migration 7) │──project_id FK──→ projects
                                     └──────────────┘

Disconnected:
  projects.client = TEXT (no FK to companies)
  deals.company = TEXT (no FK to companies)
  leads.company = TEXT (no FK to companies)
```

### 1.2 Current Pain Points

| Pain Point | Category | Impact |
|-----------|----------|--------|
| `deals.company` is a text field, not a FK | Data Duplication | "Nike" vs "NIKE" vs "Nike Inc" are different strings |
| `projects.client` is a text field, not a FK | Data Duplication | Cannot aggregate revenue by account |
| `leads.company` is a text field, not a FK | Attribution | Cannot trace lead source to account revenue |
| No deal → project linkage | Handoff Friction | Manual project creation after deal close; context lost |
| No opportunity pipeline stages between qualified lead and closed deal | Forecast Inaccuracy | Binary qualified/won model misses negotiation nuances |
| No change order tracking | Revenue Leakage | Scope creep absorbs margin without financial adjustment |
| No revenue schedule | Financial Blind Spot | Cannot distinguish invoiced vs recognized vs forecasted revenue |
| No account health model | Retention Risk | No early warning for at-risk accounts |

### 1.3 Current Table Inventory (CRM-relevant)

| Table | Migration | FK to Companies? | FK to Contacts? | FK to Deals? | FK to Projects? |
|-------|-----------|-------------------|-----------------|--------------|-----------------|
| `leads` | 004 | No (text) | No (text fields) | Yes (converted_to_deal_id) | No |
| `deals` | 001 | No (text) | No (text fields) | — | No |
| `projects` | 001 | No (text) | No | No | — |
| `proposals` | 005 | Yes | Yes | Yes | Yes |
| `contracts` | 005 | Yes | Yes | Yes | Yes |
| `scopes_of_work` | 007 | No | No | No | Yes |
| `client_invoices` | 007 | Yes | Yes | No | Yes |
| `companies` | 005 | — | — | No | No |
| `contacts` | 005 | Yes (company_id) | — | No | No |

---

## 2. Future-State Lifecycle Design

### 2.1 Unified Revenue Lifecycle Phases

```
Phase 1: ATTRACT          Phase 2: QUALIFY           Phase 3: PROPOSE
┌─────────────────┐      ┌─────────────────┐       ┌─────────────────┐
│   Lead Intake    │ ──→  │  Qualification   │ ──→   │  Opportunity     │
│  • Web form      │      │  • Budget fit    │       │  • Discovery     │
│  • Referral      │      │  • Timeline fit  │       │  • Proposal      │
│  • Outbound      │      │  • Decision-maker│       │  • Negotiation   │
│  • Event         │      │  • Scoring ≥ 40  │       │  • Contract      │
└─────────────────┘      └─────────────────┘       └─────────────────┘
                                                          │
                                                          ▼ CLOSE
Phase 4: DELIVER          Phase 5: INVOICE           Phase 6: GROW
┌─────────────────┐      ┌─────────────────┐       ┌─────────────────┐
│   Project        │      │  Revenue Recog.  │       │  Account Health  │
│  • Pre-production│      │  • SOW → Invoice │       │  • NPS tracking  │
│  • Fabrication   │      │  • Payment       │       │  • Expansion opp │
│  • Logistics     │      │  • Recognition   │       │  • Renewal opp   │
│  • Show          │      │  • Reconciliation│       │  • Re-engagement │
│  • Strike        │      │  • Change orders │       │  • Portfolio view │
└─────────────────┘      └─────────────────┘       └─────────────────┘
```

### 2.2 Entity Relationship Model (Future State)

```
                          ┌──────────────┐
                          │  companies   │ ← SSOT Account Entity
                          │ (existing)   │
                          └──────┬───────┘
                    ┌────────────┼────────────────┐
                    │            │                 │
                    ▼            ▼                 ▼
             ┌──────────┐ ┌──────────┐     ┌──────────────┐
             │ contacts  │ │  leads   │     │ opportunities │ NEW
             │(existing) │ │(existing)│     │               │
             └──────────┘ └────┬─────┘     └──────┬───────┘
                               │                   │
                               │ converts to       │ closes as
                               ▼                   ▼
                         ┌──────────┐        ┌──────────┐
                         │opportuni-│        │  deals   │ ← Contracted Revenue
                         │  ties    │        │(existing)│
                         └──────────┘        └────┬─────┘
                                                  │
                                        ┌─────────┼──────────┐
                                        ▼         ▼          ▼
                                  ┌──────────┐ ┌────────┐ ┌──────────────┐
                                  │ projects  │ │ SOWs   │ │change_orders │ NEW
                                  │(existing) │ │(exist) │ │              │
                                  └──────────┘ └────────┘ └──────────────┘
                                        │
                                        ▼
                                  ┌──────────────────┐
                                  │ revenue_schedules │ NEW
                                  │                  │
                                  └──────────────────┘
                                        │
                                        ▼
                                  ┌──────────────────┐
                                  │account_health_   │ NEW
                                  │scores            │
                                  └──────────────────┘
```

### 2.3 Structural Relationship Rules

| Rule | Description | Enforcement |
|------|-------------|-------------|
| **R1: Account Primacy** | Every lead, opportunity, deal, project, SOW, invoice MUST reference a `companies.id` | FK constraints; NOT NULL on new entities |
| **R2: Contact Ownership** | Contacts belong to exactly one company; deals/opportunities reference a primary contact | `contacts.company_id` FK; `opportunities.primary_contact_id` FK |
| **R3: Opportunity Funnel** | Leads convert to Opportunities (not directly to Deals); Deals are created only when an opportunity is "won" | State machine: lead → opportunity → deal |
| **R4: Deal = Contracted Revenue** | A Deal represents a signed contract with a defined value; it is immutable after close except via change orders | `deals.closed_at` locks core fields; amendments via `change_orders` |
| **R5: Project Linkage** | Every project MUST link to a deal and a company; one deal can produce multiple projects | `projects.deal_id` FK, `projects.company_id` FK |
| **R6: SOW Chain** | SOW → Deliverable → Invoice Line Item → Payment → Recognition | FK chain enforced at schema level |
| **R7: Change Order Integrity** | Change orders reference a project + optional SOW; they adjust contracted value and create audit trail | `change_orders.project_id` + `change_orders.sow_id` FKs |
| **R8: Revenue Recognition** | Revenue is recognized per ASC 606 milestones, not on invoice send | `revenue_schedules` with `recognized_at` distinct from `invoiced_at` |
| **R9: Account Health** | Account health is a computed projection, not a stored denormalization; snapshot periodically for trend | `account_health_scores` as periodic snapshots |
| **R10: Portfolio Aggregation** | Portfolio metrics are always computed from canonical tables; never stored separately | Views/functions, not materialized duplicates |

---

## 3. New Entity Definitions

### 3.1 Opportunities

The `opportunities` table represents active sales pipeline items between lead qualification and deal close. This replaces the current overloaded `deals` table stages (lead → qualified → proposal → negotiation → won → lost) with a proper funnel.

**Stages:**
1. `discovery` — Initial needs assessment
2. `qualification` — Budget, authority, need, timeline confirmed
3. `proposal_sent` — Formal proposal delivered
4. `proposal_review` — Client reviewing proposal
5. `negotiation` — Terms being finalized
6. `contract_sent` — Contract delivered for signature
7. `won` — Contract signed → creates Deal
8. `lost` — Opportunity lost
9. `on_hold` — Temporarily paused

**Fields:**
- `company_id` → FK to companies (REQUIRED)
- `primary_contact_id` → FK to contacts
- `lead_id` → FK to leads (source attribution)
- `pipeline_id` → FK to pipelines
- `type` → new_business | expansion | renewal | upsell
- `value` → estimated deal value
- `weighted_value` → value × probability (computed)
- `expected_close_date`
- `stage` → opportunity_stage enum
- `probability` → 0–100
- `assigned_to` → FK to profiles
- `lost_reason_id` → FK to lost_reasons
- `competitor` → text
- `next_step` → text
- `last_activity_at` → timestamp

### 3.2 Change Orders

Track post-contract scope modifications with full audit trail.

**Fields:**
- `project_id` → FK to projects (REQUIRED)
- `sow_id` → FK to scopes_of_work (optional)
- `company_id` → FK to companies (REQUIRED)
- `number` → sequential per project (CO-001, CO-002)
- `title`, `description`
- `change_type` → scope_addition | scope_reduction | timeline_change | budget_adjustment | combined
- `value_impact` → positive or negative dollar amount
- `schedule_impact_days` → positive or negative days
- `status` → draft | pending_review | pending_client | approved | rejected | void
- `requested_by`, `approved_by`, `approved_at`
- Immutable once approved (audit via `change_order_log`)

### 3.3 Revenue Schedules

ASC 606-compliant revenue recognition entries.

**Fields:**
- `project_id` → FK to projects (REQUIRED)
- `deal_id` → FK to deals
- `sow_deliverable_id` → FK to sow_deliverables (optional)
- `change_order_id` → FK to change_orders (optional)
- `type` → milestone | percentage_of_completion | time_based | event_based
- `description`
- `contracted_amount` → from SOW/deal
- `invoiced_amount` → from client_invoices
- `recognized_amount` → actual recognized revenue
- `scheduled_date` → when recognition is expected
- `recognized_at` → when actually recognized
- `status` → scheduled | invoiced | recognized | deferred | reversed

### 3.4 Account Health Scores

Periodic snapshots of client relationship health.

**Fields:**
- `company_id` → FK to companies (REQUIRED)
- `score_date` → date of snapshot
- `overall_score` → 0–100
- `delivery_score` → on-time, on-budget project completion
- `payment_score` → payment timeliness
- `engagement_score` → communication frequency, responsiveness
- `satisfaction_score` → NPS / CSAT data
- `expansion_score` → repeat business, upsell signals
- `risk_level` → low | medium | high | critical
- `risk_factors` → JSONB array of contributing factors
- `recommendations` → JSONB array of suggested actions

### 3.5 Opportunity Activities

Track all interactions on opportunities (calls, emails, meetings, notes).

**Fields:**
- `opportunity_id` → FK to opportunities (REQUIRED)
- `type` → call | email | meeting | note | task | proposal_sent | contract_sent
- `subject`, `description`
- `contact_id` → FK to contacts (optional)
- `performed_by` → FK to profiles
- `performed_at` → timestamp
- `duration_minutes` → for calls/meetings
- `outcome` → text

---

## 4. Schema Modifications to Existing Tables

### 4.1 `deals` Table Enhancements

```sql
-- Add company/contact FKs (replacing text fields)
ALTER TABLE deals ADD COLUMN company_id UUID REFERENCES companies(id);
ALTER TABLE deals ADD COLUMN contact_id UUID REFERENCES contacts(id);
ALTER TABLE deals ADD COLUMN opportunity_id UUID REFERENCES opportunities(id);

-- Contract-specific fields
ALTER TABLE deals ADD COLUMN contracted_value NUMERIC(14,2);
ALTER TABLE deals ADD COLUMN contract_id UUID REFERENCES contracts(id);
ALTER TABLE deals ADD COLUMN closed_at TIMESTAMPTZ;
ALTER TABLE deals ADD COLUMN closed_by UUID REFERENCES profiles(id);

-- Revenue tracking
ALTER TABLE deals ADD COLUMN total_invoiced NUMERIC(14,2) DEFAULT 0;
ALTER TABLE deals ADD COLUMN total_recognized NUMERIC(14,2) DEFAULT 0;
ALTER TABLE deals ADD COLUMN total_collected NUMERIC(14,2) DEFAULT 0;
```

### 4.2 `projects` Table Enhancements

```sql
-- Add company/deal FKs (replacing text fields)
ALTER TABLE projects ADD COLUMN company_id UUID REFERENCES companies(id);
ALTER TABLE projects ADD COLUMN deal_id UUID REFERENCES deals(id);
ALTER TABLE projects ADD COLUMN primary_contact_id UUID REFERENCES contacts(id);

-- Margin tracking
ALTER TABLE projects ADD COLUMN contracted_value NUMERIC(14,2);
ALTER TABLE projects ADD COLUMN change_order_value NUMERIC(14,2) DEFAULT 0;
ALTER TABLE projects ADD COLUMN total_contracted NUMERIC(14,2) 
    GENERATED ALWAYS AS (COALESCE(contracted_value, 0) + COALESCE(change_order_value, 0)) STORED;
ALTER TABLE projects ADD COLUMN gross_margin_percent NUMERIC(5,2);
```

### 4.3 `leads` Table Enhancements

```sql
-- Add company FK (replacing text field)
ALTER TABLE leads ADD COLUMN company_id UUID REFERENCES companies(id);

-- Opportunity conversion
ALTER TABLE leads ADD COLUMN converted_to_opportunity_id UUID REFERENCES opportunities(id);
```

---

## 5. Revenue Recognition Framework

### 5.1 ASC 606 Five-Step Model Mapping

| ASC 606 Step | Frozen Phoenix Implementation |
|-------------|------------------------------|
| 1. Identify contract | `deals` + `contracts` table (contract_id FK) |
| 2. Identify performance obligations | `sow_deliverables` — each deliverable is a distinct obligation |
| 3. Determine transaction price | `deals.contracted_value` + `change_orders.value_impact` |
| 4. Allocate price to obligations | `sow_deliverables.total_price` — allocated per deliverable |
| 5. Recognize revenue on satisfaction | `revenue_schedules.recognized_at` — milestone completion or % |

### 5.2 Revenue States

```
Contracted ──→ Scheduled ──→ Invoiced ──→ Collected ──→ Recognized
    │              │             │             │             │
    ▼              ▼             ▼             ▼             ▼
deals.         revenue_     client_       payments.     revenue_
contracted_    schedules.   invoices.     amount        schedules.
value          scheduled_   total                       recognized_at
               date
```

### 5.3 Margin Visibility Architecture

```
Revenue Side:                          Cost Side:
┌─────────────────────┐               ┌─────────────────────┐
│ Contracted Value    │               │ Budget (Planned)    │
│ + Change Orders     │               │ + Actual Costs      │
│ = Total Contracted  │               │   - Time entries    │
├─────────────────────┤               │   - Expenses        │
│ - Cost of Delivery  │               │   - PO commitments  │
│ = Gross Margin      │               │ = Actual Spend      │
├─────────────────────┤               ├─────────────────────┤
│ Gross Margin %      │               │ Budget Variance     │
│ = Margin / Revenue  │               │ = Planned - Actual  │
└─────────────────────┘               └─────────────────────┘

Roll-up:
  Project → Account → Portfolio
  Each level aggregates from canonical child records
```

---

## 6. Forecasting Model

### 6.1 Three-Tier Forecast

| Tier | Source | Confidence | Calculation |
|------|--------|------------|-------------|
| **Pipeline** | `opportunities` where stage ≠ won/lost | Low–Medium | `SUM(value × probability / 100)` |
| **Contracted** | `deals` where closed_at IS NOT NULL | High | `SUM(contracted_value + change_order_value)` |
| **Recognized** | `revenue_schedules` where recognized_at IS NOT NULL | Confirmed | `SUM(recognized_amount)` |

### 6.2 Forecast Dimensions

- **By Period**: Monthly, quarterly, annual
- **By Account**: Company-level rollup
- **By Type**: New business, expansion, renewal
- **By Owner**: Sales rep attribution
- **By Service Line**: Project type / industry vertical

### 6.3 Portfolio Dashboard Metrics

| Metric | Computation |
|--------|-------------|
| **Pipeline Value** | SUM(opportunities.value) WHERE stage NOT IN (won, lost) |
| **Weighted Pipeline** | SUM(opportunities.value × probability / 100) |
| **Contracted Revenue** | SUM(deals.contracted_value) WHERE closed_at IS NOT NULL AND fiscal period matches |
| **Recognized Revenue** | SUM(revenue_schedules.recognized_amount) WHERE recognized_at IS NOT NULL |
| **Revenue Backlog** | Contracted - Recognized |
| **Average Deal Size** | AVG(deals.contracted_value) |
| **Win Rate** | COUNT(won opportunities) / COUNT(won + lost) |
| **Sales Cycle (days)** | AVG(opportunities.closed_at - opportunities.created_at) |
| **Account Expansion Rate** | Revenue from expansion opps / Total revenue |
| **Gross Margin %** | (Revenue - COGS) / Revenue across portfolio |
| **DSO (Days Sales Outstanding)** | AVG(payment_date - invoice_date) |
| **At-Risk Revenue** | SUM(contracted_value) WHERE account_health.risk_level IN (high, critical) |

---

## 7. Handoff Blueprints

### 7.1 Lead → Opportunity Conversion

```
Trigger: Lead score ≥ 40 AND status = "qualified"
                          │
                          ▼
┌──────────────────────────────────────────────┐
│ 1. Auto-create or link Company record        │
│    - Match by email domain / company name    │
│    - Create if no match found                │
│ 2. Auto-create or link Contact record        │
│    - Match by email                          │
│    - Create if no match found                │
│ 3. Create Opportunity                        │
│    - company_id = matched/created company    │
│    - primary_contact_id = matched/created    │
│    - lead_id = source lead                   │
│    - type = 'new_business'                   │
│    - stage = 'discovery'                     │
│    - value = lead.estimated_budget           │
│ 4. Update Lead                               │
│    - status = 'converted'                    │
│    - converted_to_opportunity_id = new opp   │
│ 5. Assign sales owner                        │
│    - Based on territory / round-robin        │
│ 6. Create first activity                     │
│    - type = 'note'                           │
│    - subject = 'Lead converted to opportunity'│
└──────────────────────────────────────────────┘
```

### 7.2 Opportunity → Deal Conversion (Close)

```
Trigger: Opportunity.stage = "won" (requires approval gate)
                          │
                          ▼
┌──────────────────────────────────────────────┐
│ 1. Validate prerequisites                    │
│    - Contract signed (contract_id NOT NULL)   │
│    - SOW approved (if required)              │
│    - Finance approval received               │
│ 2. Create Deal record                        │
│    - company_id = opportunity.company_id     │
│    - contact_id = opportunity.primary_contact │
│    - opportunity_id = source opportunity     │
│    - contracted_value = opportunity.value    │
│    - contract_id = linked contract           │
│    - stage = 'won'                           │
│    - closed_at = NOW()                       │
│ 3. Update Opportunity                        │
│    - stage = 'won'                           │
│    - converted_to_deal_id = new deal         │
│ 4. Scaffold Project(s)                       │
│    - company_id = deal.company_id            │
│    - deal_id = new deal                      │
│    - contracted_value = deal.contracted_value│
│    - status = 'draft'                        │
│ 5. Create Revenue Schedule                   │
│    - Based on SOW deliverables               │
│    - One entry per performance obligation    │
│ 6. Notify operations team                    │
│    - PM assignment required                  │
│    - Kickoff meeting scheduled               │
└──────────────────────────────────────────────┘
```

### 7.3 Change Order Flow

```
Trigger: PM or client requests scope change
                          │
                          ▼
┌──────────────────────────────────────────────┐
│ 1. Create Change Order (draft)               │
│    - project_id, sow_id, company_id          │
│    - value_impact, schedule_impact_days       │
│ 2. Internal Review                           │
│    - PM reviews feasibility                  │
│    - Finance reviews margin impact           │
│ 3. Client Approval                           │
│    - CO sent to client for signature         │
│ 4. On Approval:                              │
│    - Update project.change_order_value       │
│    - Create/update SOW deliverables          │
│    - Update revenue_schedules                │
│    - Adjust budget_line_items                │
│    - Log to change_order_log (immutable)     │
│ 5. On Rejection:                             │
│    - Status = 'rejected'                     │
│    - No financial impact                     │
└──────────────────────────────────────────────┘
```

---

## 8. Risk Mitigation Framework

### 8.1 Risk Categories

| Category | Signals | Automated Detection |
|----------|---------|---------------------|
| **Revenue Leakage** | Unbilled deliverables, expired SOWs, missing change orders | Scheduled scan: deliverables at 100% complete but amount_invoiced = 0 |
| **Margin Erosion** | Budget variance > 10%, actual hours > estimated | Real-time: budget_actual / budget_planned > threshold |
| **Payment Risk** | DSO > 45 days, disputed invoices, aging receivables | Trigger: invoice overdue > 30 days |
| **Scope Creep** | Tasks without SOW deliverable link, hours on non-billable | Scan: tasks where sow_deliverable_id IS NULL on billable projects |
| **Account Churn** | No new opportunities in 6 months, declining health score | Scheduled: accounts with last opportunity > 180 days ago |
| **Pipeline Stall** | Opportunities without activity in 14+ days | Scheduled: opportunities where last_activity_at < NOW() - 14 days |
| **Forecast Drift** | Weighted pipeline consistently over/under actual close | Monthly: compare forecast vs. actuals for trailing 3 months |

### 8.2 Phase Gates

| Gate | Trigger | Required Approvals | Automated Checks |
|------|---------|-------------------|-------------------|
| G1: Lead → Opportunity | Score ≥ 40 | Sales Manager | Budget fit, decision-maker identified |
| G2: Proposal Send | Opportunity at proposal_sent | Account Executive | Margin ≥ target, all sections complete |
| G3: Contract Send | Opportunity at contract_sent | Legal + Finance | Terms reviewed, payment schedule defined |
| G4: Deal Close | Contract signed | Sales Director | All signatures, deposit received |
| G5: Project Kickoff | Project created | PM + Finance | Budget loaded, team assigned, SOW active |
| G6: Change Order | CO requested | PM + Client + Finance | Margin impact assessed, schedule impact assessed |
| G7: Invoice Send | Deliverable complete | PM + Finance | Deliverable approved, hours reconciled |
| G8: Revenue Recognition | Payment received or milestone met | Finance | ASC 606 criteria satisfied |

---

## 9. UI/UX Simplification Principles

### 9.1 Role-Based Pipeline Views

| Role | Primary View | Key Metrics |
|------|-------------|-------------|
| **Sales Rep** | Opportunity Kanban + Activity Feed | My pipeline value, next steps, aging deals |
| **Sales Manager** | Portfolio Pipeline + Team Performance | Team quota attainment, win rate, forecast accuracy |
| **Account Executive** | Account 360° Dashboard | Account health, expansion signals, at-risk accounts |
| **Project Manager** | Project Delivery + Margin Tracker | On-time/on-budget, change orders, deliverable status |
| **Finance** | Revenue Recognition + Cash Flow | Recognized vs. invoiced, DSO, aging receivables |
| **Executive** | Portfolio Dashboard | Total revenue, pipeline coverage, margin trends |

### 9.2 Progressive Disclosure

1. **Pipeline Board** — Drag-and-drop Kanban with opportunity cards showing company, value, stage, days in stage
2. **Opportunity Detail** — Full context: contact info, activity timeline, proposals, competitor intelligence
3. **Account 360°** — Unified view: all opportunities, deals, projects, invoices, health score, contacts
4. **Revenue Waterfall** — Drill from portfolio → account → deal → project → deliverable → invoice

### 9.3 Navigation Restructure

**Current "Commercial" section:**
- Leads, Pipeline, Deals, Contacts, Case Studies, Service Requests

**Future "CRM & Revenue" section:**

```
CRM & Revenue
├── Pipeline          (Opportunity Kanban + table)
├── Leads             (Lead management + conversion)
├── Accounts          (Company 360° with health scores)
├── Contacts          (Contact directory)
├── Opportunities     (Detailed opportunity list + analytics)
├── Deals             (Closed/contracted deals)
├── Revenue           (Recognition dashboard + schedules)
├── Change Orders     (CO management + approval workflow)
└── Case Studies      (Client success stories)
```

---

## 10. Automation & AI Augmentation Roadmap

### 10.1 Rule-Based Automations (Phase 0–1)

| # | Automation | Trigger | Action |
|---|-----------|---------|--------|
| A1 | Lead routing | New lead created | Assign to sales rep based on territory + availability |
| A2 | Stale opportunity alert | No activity in 14 days | Notify assigned rep + manager |
| A3 | Deal close checklist | Opportunity → won | Validate contract, SOW, deposit; create deal + project |
| A4 | Change order notification | CO status → pending_client | Email client with CO details |
| A5 | Invoice overdue escalation | Invoice overdue > 30 days | Notify finance + account manager |
| A6 | Account health recalculation | Project completed or invoice paid | Recalculate and snapshot account health |
| A7 | Revenue recognition trigger | Deliverable approved + milestone met | Create revenue_schedule entry |
| A8 | Budget alert | Budget variance > 15% | Notify PM + finance |

### 10.2 AI-Augmented Capabilities (Phase 2–3)

| # | Capability | Input | Output |
|---|-----------|-------|--------|
| AI1 | **Lead Scoring** | Lead attributes + historical conversion data | Predicted conversion probability |
| AI2 | **Deal Risk Scoring** | Opportunity attributes + activity patterns | Risk of stall/loss |
| AI3 | **Proposal Generation** | Opportunity details + SOW templates + past proposals | Draft proposal document |
| AI4 | **Margin Prediction** | Project type + scope + historical cost data | Predicted margin range |
| AI5 | **Dynamic Forecasting** | Pipeline + conversion rates + seasonality | Monthly revenue forecast with confidence intervals |
| AI6 | **Expansion Signals** | Account activity + project completion + industry trends | Recommended upsell opportunities |
| AI7 | **Re-engagement Triggers** | Account dormancy + market signals | Personalized outreach recommendations |
| AI8 | **Change Order Impact** | CO details + project state + historical data | Predicted schedule/budget impact |
| AI9 | **Client Health Prediction** | Activity patterns + payment behavior + satisfaction scores | 30/60/90 day health forecast |
| AI10 | **Competitive Intelligence** | Lost deal reasons + competitor mentions | Win/loss pattern analysis |

---

## 11. Implementation Roadmap

### Phase 0: Foundation (Migration 013)
- [ ] Create `opportunities` table with full stage enum
- [ ] Create `opportunity_activities` table
- [ ] Create `change_orders` table with approval workflow
- [ ] Create `change_order_log` (immutable audit)
- [ ] Create `revenue_schedules` table
- [ ] Create `account_health_scores` table
- [ ] Add `company_id`, `contact_id`, `opportunity_id` FKs to `deals`
- [ ] Add `company_id`, `deal_id`, `primary_contact_id` FKs to `projects`
- [ ] Add `company_id` FK to `leads`
- [ ] Add `converted_to_opportunity_id` FK to `leads`
- [ ] Add margin tracking columns to `projects`
- [ ] Add revenue tracking columns to `deals`
- [ ] Create TypeScript types for all new entities
- [ ] Create domain-config entries for new enums
- [ ] Create mock data

### Phase 1: UI Implementation
- [ ] Opportunity Kanban + List page
- [ ] Account 360° page
- [ ] Account Health dashboard
- [ ] Revenue Recognition dashboard
- [ ] Change Order management page
- [ ] Enhanced pipeline with opportunity stages
- [ ] Navigation restructure

### Phase 2: Automation
- [ ] Lead → Opportunity conversion workflow
- [ ] Opportunity → Deal close workflow
- [ ] Change order approval workflow
- [ ] Invoice overdue escalation
- [ ] Account health recalculation

### Phase 3: AI Augmentation
- [ ] Lead scoring model
- [ ] Deal risk scoring
- [ ] Dynamic forecasting
- [ ] Expansion signal detection

---

## 12. Dataset Audit — 7W Coverage

### New Entities

| Entity | Who | What | When | Where | Why | How | If-Then | Score |
|--------|-----|------|------|-------|-----|-----|---------|-------|
| opportunities | assigned_to, primary_contact_id, created_by | value, stage, type, probability | created_at, expected_close_date, last_activity_at | company_id (account context) | lead_id (source), type (purpose) | stage progression, activities | won→deal, lost→reason | 7/7 |
| opportunity_activities | performed_by, contact_id | subject, description, type | performed_at, duration | opportunity_id (context) | outcome | type (call/email/meeting) | — | 6/7 |
| change_orders | requested_by, approved_by | value_impact, schedule_impact, description | created_at, approved_at | project_id, sow_id | change_type, title | status workflow | approved→update project | 7/7 |
| revenue_schedules | — | contracted/invoiced/recognized amounts | scheduled_date, recognized_at | project_id, deal_id | type (milestone/pct/time) | status progression | recognized→financial close | 7/7 |
| account_health_scores | — | scores (delivery/payment/engagement/satisfaction/expansion) | score_date | company_id | risk_factors | risk_level computation | risk_level→alerts | 7/7 |

### Modified Entities

| Entity | Added Coverage | New Score |
|--------|---------------|-----------|
| deals | company_id (Where), opportunity_id (Why), closed_at (When), contracted_value (What) | 7/7 (was 5/7) |
| projects | company_id (Where), deal_id (Why), contracted_value + margin (What) | 7/7 (was 5/7) |
| leads | company_id (Where), converted_to_opportunity_id (If-Then) | 7/7 (was 6/7) |

---

## 13. Migration Impact Assessment

### Backward Compatibility

| Change | Risk | Mitigation |
|--------|------|------------|
| New FKs on deals/projects/leads are NULLABLE | None | Existing data continues to work; text fields preserved |
| New `opportunities` table | None | Additive; existing deals unaffected |
| New `change_orders` table | None | Additive; existing project workflow unaffected |
| New `revenue_schedules` table | None | Additive; existing invoicing unaffected |
| New `account_health_scores` table | None | Additive; computed snapshots only |

### Data Migration Strategy

1. **Phase 1 (automated)**: For existing deals where `company` text matches a `companies.name`, auto-populate `company_id`
2. **Phase 2 (automated)**: For existing projects where `client` text matches a `companies.name`, auto-populate `company_id`  
3. **Phase 3 (manual review)**: Unmatched text values flagged for manual resolution
4. **Phase 4**: Existing "won" deals can be retroactively linked to projects via company name matching

### Rollback Plan

All changes are additive (new tables + nullable columns). Rollback = drop new tables + drop new columns. No data loss on existing tables.
