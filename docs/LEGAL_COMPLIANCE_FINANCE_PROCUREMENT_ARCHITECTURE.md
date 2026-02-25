# Legal, Compliance, Finance & Procurement Lifecycle Architecture

**Date:** 2026-02-25  
**Version:** 1.0  
**Scope:** Full cross-domain lifecycle analysis — Legal governance, regulatory compliance, financial controls, and procurement workflows across the operational hierarchy  
**Methodology:** Schema audit (14 migrations, 170+ tables), type mapping (8 type files), UI surface inventory (100+ routes), gap analysis against enterprise-grade experiential operations requirements

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current-State Workflow Maps](#2-current-state-workflow-maps)
3. [Gap Analysis & Structural Findings](#3-gap-analysis--structural-findings)
4. [Future-State System Architecture](#4-future-state-system-architecture)
5. [3NF-Compliant Entity Relationship Model](#5-3nf-compliant-entity-relationship-model)
6. [Legal Governance Framework](#6-legal-governance-framework)
7. [Regulatory & Compliance Framework](#7-regulatory--compliance-framework)
8. [Financial Control Architecture](#8-financial-control-architecture)
9. [Procurement Lifecycle Model](#9-procurement-lifecycle-model)
10. [Cross-Domain Dependency Matrix](#10-cross-domain-dependency-matrix)
11. [Contract-to-Payment Lifecycle Model](#11-contract-to-payment-lifecycle-model)
12. [Permit & Certification Tracking Schema](#12-permit--certification-tracking-schema)
13. [Budget Roll-Up & Financial Control Architecture](#13-budget-roll-up--financial-control-architecture)
14. [Auditability Framework](#14-auditability-framework)
15. [Risk Mitigation Matrix](#15-risk-mitigation-matrix)
16. [UI/UX Simplification Framework](#16-uiux-simplification-framework)
17. [Automation & AI Augmentation Opportunities](#17-automation--ai-augmentation-opportunities)
18. [Implementation Roadmap](#18-implementation-roadmap)

---

## 1. Executive Summary

### 1.1 Scope

This document provides enterprise-grade architectural governance for legal, compliance, finance, and procurement workflows across Frozen Phoenix's full operational hierarchy: Portfolio → Project → Location → Activation → Event → Activity, plus Vendor, Asset, and Task-level dependencies.

### 1.2 Current State Assessment

| Domain | Current Coverage | Gap Severity |
|--------|-----------------|--------------|
| **Legal — Contracts** | Basic `contracts` table with type/status (003) | **High** — No clause library, no amendment chain, no insurance tracking |
| **Legal — Insurance** | `vendors.coi_expiry_date`, `vendor_compliance_docs` (008) | **Critical** — No unified insurance registry, no coverage verification |
| **Legal — IP Rights** | None | **Critical** — No IP ownership, no usage rights management |
| **Regulatory — Permits** | `locations.permits_required` TEXT[] (003) | **Critical** — No permit lifecycle, no jurisdiction, no dependency enforcement |
| **Regulatory — Engineering** | None | **Critical** — No structural/electrical/mechanical approval tracking |
| **Regulatory — Licensing** | None | **High** — No business/liquor/food service license tracking |
| **Regulatory — Safety** | `certifications` for crew (001), `incidents` (003) | **Medium** — No asset certs, no ADA/OSHA checklists |
| **Finance — Budget Controls** | `budgets` (003), `budget_line_items` (002) | **Medium** — No approval workflow, no GL mapping, no CapEx/OpEx |
| **Finance — Revenue** | `revenue_schedules` (013), `client_invoices` (007) | **Medium** — ASC 606 exists; needs GL integration |
| **Procurement — PO/Match** | `purchase_orders` → `invoices` (001) | **High** — No 3-way match, no goods receipt |
| **Procurement — Vendor Scoring** | `vendor_reviews` (008) | **Low** — Rating exists; needs risk scoring |

### 1.3 Critical Findings

| # | Finding | Severity | Domain |
|---|---------|----------|--------|
| 1 | No unified permit/license registry | Critical | Compliance |
| 2 | No insurance policy registry with coverage verification | Critical | Legal |
| 3 | No engineering approval workflow | Critical | Compliance |
| 4 | No contract clause library or amendment chain | High | Legal |
| 5 | No IP/usage rights management | Critical | Legal |
| 6 | No GL account mapping for financial reporting | High | Finance |
| 7 | No 3-way invoice matching (PO + receipt + invoice) | High | Procurement |
| 8 | No dependency enforcement (permit → event status) | Critical | Cross-domain |
| 9 | No budget approval workflow with delegation | High | Finance |
| 10 | No payment approval workflow with thresholds | High | Finance |

### 1.4 Recommendation Summary

| Action | Impact | Effort | Priority |
|--------|--------|--------|----------|
| Unified permit/license registry | Eliminates compliance blind spots | Medium | **P0** |
| Insurance policy registry | Enables coverage verification | Medium | **P0** |
| Contract clause library + amendment chain | Enables legal governance | Large | **P0** |
| Cross-domain dependency enforcement | Prevents compliance violations | Large | **P0** |
| GL account mapping | Enables financial reporting | Medium | **P1** |
| 3-way invoice matching | Prevents payment errors | Medium | **P1** |
| Budget approval workflow | Enables financial controls | Medium | **P1** |
| Engineering approval workflow | Enables safety compliance | Medium | **P1** |
| IP/usage rights management | Enables creative governance | Medium | **P1** |
| Payment approval with thresholds | Prevents unauthorized spend | Small | **P1** |
| Vendor risk scoring | Enables proactive risk management | Medium | **P2** |
| CapEx/OpEx classification | Enables accounting compliance | Small | **P2** |
| RFP lifecycle | Enables structured procurement | Medium | **P2** |

---

## 2. Current-State Workflow Maps

### 2.1 Legal — Contract Lifecycle (Current)

```
Create (contracts table, 003)  →  Manual Review  →  Status Tracking (enum)

Current fields: number, title, type, counterparty, value, dates, status, document_url
Missing: Clause library, amendment chain (amendment_ids is UUID[], not normalized),
         insurance requirements, approval workflow, obligation tracking, MSA→SOW hierarchy
```

### 2.2 Regulatory — Permit Lifecycle (Current)

```
locations.permits_required TEXT[]  +  vault_documents.category='permit'

Current: Free-text array of needed permits + document storage
Missing: Permit entity with lifecycle, jurisdiction tracking, approval dates,
         dependency enforcement, renewal workflow, engineering approvals
```

### 2.3 Finance — Budget-to-Payment (Current)

```
budgets (003) → purchase_orders (001) → invoices (001) → payments (005)
  + budget_line_items (002) + production_budget_lines (003)
  + revenue_schedules (013) + client_invoices (007)

Current: Budget versioning, PO-to-invoice link, ASC 606 framework
Missing: GL mapping, approval workflow, CapEx/OpEx, 3-way match, payment authorization
```

### 2.4 Procurement — Source-to-Pay (Current)

```
rfqs (003) → purchase_orders (001) → invoices (001) → payments (005)
  + work_order_bids (008) + vendor_compliance_docs (008)

Current: RFQ, PO with line items, vendor compliance docs
Missing: Formal RFP, goods receipt, 3-way match, purchase requisition, vendor risk scoring
```

---

## 3. Gap Analysis & Structural Findings

### 3.1 SSOT Violations

| # | Violation | Resolution |
|---|-----------|------------|
| V1 | Insurance tracking in 4 surfaces (vendors.coi_expiry_date, vendor_compliance_docs, locations.insurance_required, incidents.insurance_claim) | Unified `insurance_policies` table |
| V2 | Permits in 3 surfaces (locations.permits_required TEXT[], vault_documents, expenses.category='permits') | Unified `permits` table |
| V3 | Contract amendments as UUID[] not normalized | `contract_amendments` table |
| V4 | Budget approval not workflow-tracked | `budget_approvals` table |
| V5 | Financial categories inconsistent across 3 enum systems | Unified `gl_accounts` chart of accounts |

### 3.2 Compliance Risk Exposures

| Risk | Impact | Current Mitigation |
|------|--------|--------------------|
| Event without required permits | Critical — fines, shutdown | None (informational only) |
| Vendor without valid insurance | Critical — liability | Partial (COI expiry tracked, not enforced) |
| Expired crew certifications on active shifts | High — OSHA violations | Tracked but not enforced at assignment |
| Unapproved budget overruns | Medium — margin erosion | Variance calculated, no alerts |
| Payment without invoice verification | Medium — overpayment | PO link exists, no 3-way match |

---

## 4. Future-State System Architecture

### 4.1 New Entity Inventory (Migration 015)

| Entity | Domain | Purpose |
|--------|--------|---------|
| `gl_accounts` | Finance | Chart of accounts for GL mapping |
| `insurance_policies` | Legal | Unified insurance registry |
| `insurance_requirements` | Legal | Per-entity insurance minimums |
| `contract_clauses` | Legal | Clause library for contracts |
| `contract_amendments` | Legal | Normalized amendment chain |
| `contract_obligations` | Legal | Obligation tracking per party |
| `ip_rights` | Legal | IP ownership and usage rights |
| `permits` | Compliance | Unified permit/license registry |
| `engineering_approvals` | Compliance | Structural/electrical/mechanical approvals |
| `compliance_checklists` | Compliance | ADA/OSHA/safety checklists |
| `asset_certifications` | Compliance | Asset-level safety certs |
| `budget_approvals` | Finance | Budget approval workflow |
| `payment_approvals` | Finance | Payment authorization workflow |
| `goods_receipts` | Procurement | Delivery confirmation for 3-way match |
| `purchase_requisitions` | Procurement | Pre-PO approval workflow |
| `vendor_risk_scores` | Procurement | Composite vendor risk scoring |
| `entity_dependencies` | Cross-domain | Dependency enforcement engine |
| `governance_audit_log` | Cross-domain | Unified immutable audit trail |

### 4.2 Existing Entity Modifications

| Entity | Additions |
|--------|-----------|
| `contracts` | `parent_contract_id`, `contract_category`, `insurance_requirement_id`, `governing_law`, `dispute_resolution`, `confidentiality_level` |
| `budget_line_items` | `gl_account_id`, `capex_opex` |
| `purchase_orders` | `contract_id`, `requisition_id`, `goods_receipt_required`, `budget_approval_id` |
| `invoices` | `goods_receipt_id`, `three_way_match_status`, `payment_approval_id` |
| `assets` | `last_certification_date`, `next_certification_date`, `certification_status` |

---

## 5. 3NF-Compliant Entity Relationship Model

### 5.1 Legal Domain

```
contracts (enhanced)
  │ 1──M contract_amendments (NEW) — normalized amendment chain
  │ 1──M contract_clauses (NEW) — clause library per contract
  │ 1──M contract_obligations (NEW) — obligation tracking per party
  │ 1──M ip_rights (NEW) — IP ownership and usage rights
  │ M──1 insurance_requirements (NEW) — required coverage per contract type
  └ M──1 parent_contract (self-ref) — MSA → SOW hierarchy

insurance_policies (NEW)
  • holder_type + holder_id (polymorphic: vendor, organization, location)
  • policy_type, carrier, policy_number, coverage_amount
  • effective_date, expiry_date, status, document_url, verified_by
```

### 5.2 Compliance Domain

```
permits (NEW)
  • permit_type (enum: fire, building, electrical, noise, health, liquor, etc.)
  • jurisdiction (city/county/state/federal/international)
  • entity_type + entity_id (polymorphic: org, project, location, activation, event)
  • status lifecycle: required → draft → submitted → under_review → approved → active → expired
  • blocks_entity BOOLEAN — if true, creates hard dependency

engineering_approvals (NEW)
  • approval_type (structural, electrical, mechanical, fire_safety, rigging)
  • entity_type + entity_id (activation, location, asset)
  • engineer_name, license_number, approved_at, valid_until, conditions

compliance_checklists (NEW) — ADA, OSHA, fire, health, noise, environmental
asset_certifications (NEW) — per-asset safety certs with expiry
```

### 5.3 Finance Domain

```
gl_accounts (NEW)
  • code (e.g., "5100"), name, type (asset/liability/equity/revenue/expense)
  • parent_id (self-ref for hierarchy), capex_opex, department
  Referenced by: budget_line_items, expenses, invoices, payments, revenue_schedules

budget_approvals (NEW)
  • entity_type (budget, line_item, change_order) + entity_id
  • threshold_rule, approver chain, delegation support, status, audit trail

payment_approvals (NEW)
  • payment_type (vendor_invoice, expense, payroll) + entity_id
  • amount, threshold_rule, approver_id, status, expires_at
```

### 5.4 Procurement Domain

```
purchase_requisitions (NEW)
  • project_id, requester_id, line_items, estimated_cost
  • budget_code, urgency, justification, approval_status
  Converts to → purchase_orders

goods_receipts (NEW)
  • po_id FK, received_by, received_at, line_items (qty received)
  • condition_notes, discrepancies, signed_by, document_url
  Used for → 3-way match with PO + vendor invoice

vendor_risk_scores (NEW)
  • vendor_id, score_date, overall_score (0-100)
  • financial_score, compliance_score, performance_score
  • risk_level (low/medium/high/critical), risk_factors JSONB
```

### 5.5 Cross-Domain

```
entity_dependencies (NEW)
  • dependent_entity_type + id — what is blocked
  • required_entity_type + id — what is required
  • dependency_type: hard_block | soft_warning
  • status: pending | satisfied | waived | expired
  • Auto-satisfaction when required entity status changes
  • Waiver with mandatory reason + audit trail

governance_audit_log (NEW)
  • domain (legal/compliance/finance/procurement)
  • entity_type, entity_id, action, actor_id, actor_role
  • old_value, new_value, metadata JSONB, ip_address, timestamp
  • IMMUTABLE: INSERT-only, no UPDATE/DELETE policies
```

---

## 6. Legal Governance Framework

### 6.1 Contract Hierarchy

MSA (Master) → SOW (Scope) → Amendments → Change Orders. Each level inherits parent terms unless overridden. Enforced via `contracts.parent_contract_id` self-referential FK.

### 6.2 Contract Lifecycle (Future)

```
draft → pending_internal_review → pending_legal_review → pending_counterparty →
negotiating → pending_signature → active → expired | terminated | renewed

Gates: Internal Review (PM) → Legal Review → Counterparty → Signature → Activation
```

### 6.3 Clause Library Types

`indemnification`, `limitation_of_liability`, `insurance_requirements`, `ip_ownership`, `ip_usage_rights`, `confidentiality`, `non_compete`, `force_majeure`, `termination`, `payment_terms`, `dispute_resolution`, `data_privacy`, `cancellation`, `weather_contingency`

### 6.4 Insurance Requirements Matrix

| Entity Type | Required Coverage | Min Amount | Verification Point |
|-------------|-------------------|------------|-------------------|
| Vendor (general) | General Liability | $1M | Before PO |
| Vendor (construction) | GL + Workers Comp + Auto | $2M/statutory/$1M | Before work order |
| Venue | Event Liability | Per venue | Before access date |
| Subcontractor | GL + Prof. Liability | $1M/$1M | Before contract |

---

## 7. Regulatory & Compliance Framework

### 7.1 Permit Taxonomy

**Organization:** business_license, reseller_permit, employer_registration  
**Project:** temporary_event_permit, street_closure, environmental_impact  
**Location:** fire, building, electrical, noise, health, liquor, signage, ada_variance  
**Activation:** structural_approval, electrical_approval, plumbing, amusement  
**Event:** crowd_gathering, pyrotechnics, drone, broadcast_license

### 7.2 Permit Lifecycle

```
required → application_draft → submitted → under_review →
conditions_issued → approved → active → expired | revoked | renewed

Auto-Actions:
  • approved → satisfy entity_dependencies
  • expired → block dependent entities
  • expiry - 30 days → notification + calendar event
```

### 7.3 Engineering Approval Types

`structural` (load-bearing), `electrical` (temp power), `mechanical` (HVAC/hydraulics), `fire_safety` (suppression/egress), `rigging` (overhead loads). Each requires PE stamp, calculations, inspection schedule.

---

## 8. Financial Control Architecture

### 8.1 GL Chart of Accounts

1000-1999 Assets, 2000-2999 Liabilities, 3000-3999 Equity, 4000-4999 Revenue, 5000-5999 COGS, 6000-6999 OpEx, 7000-7999 Other. Mapped to `gl_accounts` table with hierarchical parent_id.

### 8.2 Budget Approval Thresholds

| Range | Required Approver(s) |
|-------|---------------------|
| $0–$5K | Project Manager |
| $5K–$25K | PM + Director |
| $25K–$100K | PM + Director + VP |
| $100K–$500K | PM + Director + VP + CFO |
| $500K+ | Full chain + CEO |

### 8.3 Payment Authorization

| Range | Required |
|-------|----------|
| $0–$2.5K | AP Specialist (auto if 3-way matched) |
| $2.5K–$10K | AP Manager |
| $10K–$50K | Finance Director |
| $50K–$250K | CFO |
| $250K+ | CFO + CEO |

Prerequisites: Valid invoice, PO matched, goods receipt confirmed, 3-way match within ±5% tolerance, vendor compliance current, contract active, budget not exceeded.

### 8.4 3-Way Match Logic

PO Amount ↔ Goods Receipt Amount ↔ Invoice Amount. All within tolerance → auto-approve. Variance > tolerance → flag. Any missing → block.

---

## 9. Procurement Lifecycle Model

### 9.1 Source-to-Pay (Future)

Identify (Requisition) → Source (Vendor Search) → Select (RFP/RFQ) → Contract → Order (PO) → Receive (Goods Receipt) → Match (3-Way) → Pay (Approval + Release) → Evaluate (Review + Risk Score)

### 9.2 Vendor Risk Scoring (0-100)

- **Financial Health (25%):** Payment history, invoice accuracy, stability
- **Compliance (25%):** Doc completeness, insurance currency, cert status
- **Performance (25%):** Quality rating, timeliness, communication, safety
- **Operational (25%):** Capacity, geographic coverage, dependency, diversification

Risk levels: 90-100 Low, 70-89 Medium, 50-69 High, 0-49 Critical (suspend)

---

## 10. Cross-Domain Dependency Matrix

### 10.1 Hard Dependencies (Block Progression)

| Action | Required Prerequisite | Domain |
|--------|----------------------|--------|
| Issue PO | Budget approval + active contract + vendor insurance | Finance + Legal |
| Release Payment | 3-way match + payment approval | Procurement + Finance |
| Start Event | All permits approved + venue insurance + engineering approvals | Compliance + Legal |
| Activate Vendor | Insurance valid + W9/W8-BEN on file | Legal + Compliance |
| Assign Crew Shift | Certifications current | Compliance |
| Use Asset | Asset certification current | Compliance |
| Load-In | Structural engineering approved | Compliance |
| Serve Alcohol/Food | Liquor/health license active | Compliance |

### 10.2 Soft Dependencies (Warning Only)

| Action | Advisory |
|--------|---------|
| PO > $10K without competitive bid | Suggest RFP |
| Budget variance > 10% | Alert PM + Finance |
| Contract expiring < 30 days | Renewal reminder |
| Vendor risk score < 70 | Enhanced monitoring |

### 10.3 Enforcement Architecture

Action request → query `entity_dependencies` for unsatisfied hard_blocks → block or proceed. Auto-satisfaction: when permit approved, system scans and marks matching dependencies as satisfied. Waivers require authorized role + mandatory reason + audit log entry.

---

## 11. Contract-to-Payment Lifecycle Model

### 11.1 Revenue Side

Contract → Deal → Project → SOW → Deliverables → Tasks/Time → Invoice Line Items → Client Invoices → Payments → Revenue Recognition (ASC 606)

### 11.2 Cost Side

Vendor Qualified → Contract → Insurance Verified → Purchase Requisition → Budget Approval → PO → Goods Receipt → Vendor Invoice → 3-Way Match → Payment Approval → Payment → GL Posted → Vendor Review → Risk Score

---

## 12. Permit & Certification Tracking Schema

### 12.1 Certification Inheritance

Global (org) → Project → Location → Activation → Event. Assets carry per-asset certs required by context. Vendors carry per-vendor certs required by contract/PO.

### 12.2 Auto-Actions

- Permit approved → satisfy entity_dependencies
- Permit expired → block dependent entities + notify
- Cert expiring in 30 days → notification + calendar event
- Cert expired → prevent asset checkout / crew assignment

---

## 13. Budget Roll-Up & Financial Control Architecture

### 13.1 Hierarchy

Portfolio → Project → Phase → Department → GL Account → Line Items. Allocation flows DOWN, actuals flow UP, commitments sit BETWEEN. Forecast = Budget - Committed - Actual + Contingency.

### 13.2 Real-Time Financial Exposure

- **Contracted Revenue:** deals.contracted_value + approved change_orders
- **Recognized:** revenue_schedules.recognized_amount
- **AR:** client_invoices.balance_due
- **Committed Costs:** POs issued + WOs assigned
- **Actual Costs:** invoices paid + expenses approved + time approved
- **Exposure:** Committed + Actual - Collected
- **Gross Margin:** (Revenue - Actual) / Revenue × 100

---

## 14. Auditability Framework

### 14.1 Three-Layer Audit System

1. **Operational (existing):** `activity_log` — generic CRUD. Retention: 2 years
2. **Domain (existing + enhanced):** `sow_change_log`, `change_order_log` + new `governance_audit_log`. Retention: 7 years
3. **Financial (new):** `governance_audit_log` filtered by domain='finance'. Retention: 10 years. Immutable (INSERT only)

### 14.2 Required Audit Points

| Event | Log Target | Retention |
|-------|-----------|-----------|
| Contract signed/amended | governance_audit_log | 10 years |
| Budget approved/modified | governance_audit_log | 7 years |
| Payment authorized/released | governance_audit_log | 7 years |
| Permit approved/expired/waived | governance_audit_log | 7 years |
| Insurance verified/expired | governance_audit_log | 7 years |
| Dependency waived | governance_audit_log | 10 years |
| Engineering approval | governance_audit_log | Permanent |
| 3-way match result | governance_audit_log | 7 years |

---

## 15. Risk Mitigation Matrix

| Category | Signal | Detection | Response |
|----------|--------|-----------|----------|
| Revenue Leakage | Unbilled deliverables, expired SOWs | Scheduled scan | Alert PM + Finance |
| Margin Erosion | Budget variance > 10% | Real-time threshold | Alert + budget hold |
| Payment Risk | DSO > 45 days, disputed invoices | Invoice aging scan | Escalation workflow |
| Scope Creep | Tasks without SOW link on billable projects | Periodic scan | Alert PM |
| Insurance Gap | Vendor COI expiring < 30 days | Daily expiry check | Suspend + notify |
| Permit Lapse | Permit expiring < 14 days | Daily expiry check | Block events + notify |
| Vendor Risk | Risk score < 50 | Score recalculation | Suspend + find alt |
| Cert Expiry | Crew/asset certs expired | Assignment check | Block assignment |

---

## 16. UI/UX Simplification Framework

### 16.1 Role-Based Views

| Role | Primary View | Key Metrics |
|------|-------------|-------------|
| Legal Counsel | Contract Dashboard + Clause Library | Expiring contracts, pending signatures, insurance gaps |
| Compliance Officer | Permit Board + Cert Tracker | Expiring permits, pending approvals, inspection schedule |
| Finance Controller | Budget Dashboard + Payment Queue | Budget variance, pending approvals, cash flow forecast |
| Procurement Manager | Vendor Dashboard + PO Pipeline | Open POs, match status, vendor risk scores |
| Project Manager | Unified Project View | Dependencies, budget health, permit status, timeline |
| Executive | Portfolio Dashboard | Total exposure, margin trends, compliance status |

### 16.2 Progressive Disclosure

1. **Dashboard cards** — Status counts, amounts, alerts
2. **List/table view** — Filterable/sortable records
3. **Detail panel** — Full entity with timeline, dependencies, audit trail
4. **Command bar (⌘K)** — Quick search across all governance entities

### 16.3 Navigation Additions

```
Safety & Compliance (enhanced)
├── Incidents (existing)
├── Approvals (existing)
├── Permits & Licenses (NEW)
├── Engineering Approvals (NEW)
├── Compliance Checklists (NEW)
├── Certifications (NEW — unified crew + asset)
└── Automations (existing)

Finance (enhanced)
├── ... (existing items)
├── GL Accounts (NEW)
├── Budget Approvals (NEW)
├── Payment Approvals (NEW)
└── Financial Reports (NEW)

Legal (NEW section)
├── Contracts (moved from Documents)
├── Insurance Policies (NEW)
├── IP & Usage Rights (NEW)
├── Clause Library (NEW)
└── Obligations Tracker (NEW)
```

---

## 17. Automation & AI Augmentation Opportunities

### 17.1 Rule-Based Automations (P0-P1)

| # | Automation | Trigger | Action |
|---|-----------|---------|--------|
| A1 | Insurance expiry alert | 30 days before expiry | Notify vendor + procurement |
| A2 | Permit expiry alert | 14 days before expiry | Notify PM + compliance |
| A3 | Cert expiry block | Cert expired | Block crew/asset assignment |
| A4 | Budget threshold alert | Variance > configurable % | Notify PM + finance |
| A5 | Auto 3-way match | GR + invoice received | Compare amounts, auto-approve if within tolerance |
| A6 | Contract renewal reminder | 60 days before expiry | Notify legal + PM |
| A7 | Dependency auto-satisfy | Permit/insurance approved | Mark entity_dependency satisfied |
| A8 | Payment auto-route | Invoice submitted | Route to correct approver by threshold |
| A9 | Vendor risk recalculation | Review submitted or doc expired | Recalculate composite score |
| A10 | PO block on expired insurance | PO creation attempted | Check vendor insurance, block if expired |

### 17.2 AI-Augmented (P2-P3)

| # | Capability | Input | Output |
|---|-----------|-------|--------|
| AI1 | Contract risk scoring | Contract text + clause library | Risk score + flagged clauses |
| AI2 | Permit requirement prediction | Location + event type + jurisdiction | Predicted permit requirements |
| AI3 | Budget forecasting | Historical costs + project scope | Predicted budget with confidence |
| AI4 | Vendor risk prediction | Vendor history + market data | Predicted risk trajectory |
| AI5 | Invoice anomaly detection | Invoice + PO + historical patterns | Flagged anomalies |
| AI6 | Compliance gap detection | Entity state + requirement templates | Missing compliance items |

---

## 18. Implementation Roadmap

### Phase 0 (P0) — Foundation (Weeks 1-3)

- [ ] Migration 015: Core tables (`permits`, `insurance_policies`, `insurance_requirements`, `contract_amendments`, `contract_clauses`, `contract_obligations`, `entity_dependencies`, `governance_audit_log`)
- [ ] TypeScript types for all new entities
- [ ] Enhance `contracts` table with parent_contract_id, governing_law, etc.
- [ ] Dependency enforcement engine (entity_dependencies + auto-satisfy triggers)

### Phase 1 (P1) — Financial Controls (Weeks 4-6)

- [ ] Migration 015 continued: `gl_accounts`, `budget_approvals`, `payment_approvals`, `goods_receipts`, `purchase_requisitions`
- [ ] Enhance `budget_line_items` with gl_account_id, capex_opex
- [ ] Enhance `purchase_orders` with contract_id, requisition_id
- [ ] Enhance `invoices` with goods_receipt_id, three_way_match_status
- [ ] 3-way match trigger function
- [ ] Budget/payment approval threshold configuration

### Phase 2 (P2) — Compliance & Scoring (Weeks 7-9)

- [ ] `engineering_approvals`, `compliance_checklists`, `asset_certifications`, `ip_rights`
- [ ] `vendor_risk_scores` with composite scoring function
- [ ] Permit lifecycle UI pages
- [ ] Engineering approval UI pages
- [ ] Insurance policy management UI

### Phase 3 (P3) — Automation & Polish (Weeks 10-12)

- [ ] Rule-based automations (A1-A10)
- [ ] Expiry monitoring scheduled functions
- [ ] Dashboard widgets for all governance domains
- [ ] ⌘K command bar integration for governance entities
- [ ] Role-based navigation enforcement
- [ ] Financial reporting views

### Build Verification

Each phase: `tsc --noEmit --skipLibCheck` must pass with 0 errors. All new tables include RLS policies, updated_at triggers, and activity log triggers.
