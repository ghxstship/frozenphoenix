# Workforce Lifecycle Analysis — Frozen Phoenix

**Date:** 2026-02-25
**Scope:** All employment classifications across the full lifecycle
**Methodology:** Schema audit, type mapping, UI surface inventory, gap analysis

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current-State Process Maps](#2-current-state-process-maps)
3. [Lifecycle Comparison Matrix](#3-lifecycle-comparison-matrix)
4. [Gap Analysis & Findings](#4-gap-analysis--findings)
5. [Future-State Architecture Model](#5-future-state-architecture-model)
6. [Recommended Data Model (3NF)](#6-recommended-data-model-3nf)
7. [UI/UX Simplification Principles](#7-uiux-simplification-principles)
8. [Automation Opportunities](#8-automation-opportunities)
9. [Risk Mitigation](#9-risk-mitigation)
10. [Implementation Roadmap](#10-implementation-roadmap)

---

## 1. Executive Summary

Frozen Phoenix currently manages workforce through **two separate, loosely coupled subsystems**:

| Subsystem | Tables | UI Pages | Covers |
|---|---|---|---|
| **Internal Crew** | `crew_members`, `certifications`, `crew_shifts`, `crew_availability`, `project_assignments`, `production_time_entries`, `payroll_batches`, `time_off_requests`, `resource_bookings`, `active_timers` | `/crew`, `/scheduling`, `/time-tracking`, `/time-off`, `/resource-planner` | Employees, Contractors, Freelancers, Temps, Interns, Volunteers |
| **External Vendors** | `vendors`, `compliance_requirements`, `vendor_compliance_docs`, `work_orders`, `work_order_bids`, `dispatch_entries`, `vendor_reviews`, `vendor_portal_tokens`, `vendor_communications` | `/vendors`, `/vendor-onboarding`, `/vendor-compliance`, `/vendor-reviews`, `/dispatch`, `/work-orders`, `/vendor-portal` | Vendors, Subcontractors, ICs, Freelancers, Agencies, Suppliers |

### Critical Finding: Overlapping Classification Gap

The `crew_members.employment_type` enum includes `contractor` and `freelance`, and the `vendors.vendor_type` enum includes `independent_contractor` and `freelancer`. **The same person can exist in both tables with no cross-reference**, violating SSOT. A freelance lighting designer could be a `crew_member` with `employment_type = 'freelance'` AND a `vendor` with `vendor_type = 'freelancer'` — with separate compliance tracking, separate rates, and separate performance history.

### Key Recommendations

1. **Unified Worker Identity** — Create a `worker_profiles` table as a single source of truth for all worker classifications
2. **Classification-Aware Lifecycle Engine** — Single onboarding/compliance pipeline that adapts requirements based on classification
3. **Shared Performance System** — Extend `vendor_reviews` pattern to all classifications
4. **Offboarding Gap** — No structured offboarding workflow exists for any classification

---

## 2. Current-State Process Maps

### 2.1 Full-Time / Part-Time Employees

```
RECRUIT → ONBOARD → ENGAGE → PERFORM → OFFBOARD
   │         │         │         │         │
   │    [Manual]   [Shifts]  [No formal  [No structured
   │    No pipeline  [Time     reviews]    process]
   │    No applicant  Entries]
   │    tracking     [Payroll]
   │                 [Time Off]
   │
   ▼
 crew_members (employment_type = 'employee')
 ├── certifications (linked, with expiry)
 ├── crew_shifts (scheduling)
 ├── crew_availability (date-based)
 ├── project_assignments (role + rate)
 ├── production_time_entries (hours + pay calc)
 ├── payroll_batches (gross/deductions/net)
 ├── time_off_requests (PTO approval)
 ├── resource_bookings (capacity planning)
 └── active_timers (real-time tracking)
```

**Current coverage:** Scheduling ✅ | Time tracking ✅ | Payroll ✅ | PTO ✅ | Certifications ✅
**Missing:** Recruitment pipeline | Formal onboarding | Performance reviews | Structured offboarding | Benefits tracking | I-9/W-4 compliance | Workers comp tracking

### 2.2 Seasonal Employees

```
Same as Full-Time EXCEPT:
 - No seasonal date range tracking (start_season / end_season)
 - No re-engagement workflow for returning seasonal workers
 - No seasonal availability patterns
 - employment_type enum has no 'seasonal' value
 - Termination date used as proxy but doesn't capture "will return"
```

**Current coverage:** Uses same `crew_members` table as FT/PT
**Missing:** `seasonal` employment_type value | Season tracking | Re-engagement automation | Seasonal availability patterns

### 2.3 Contract Employees (W-2 via Agency / Fixed-Term)

```
RECRUIT → ONBOARD → ENGAGE → PERFORM → OFFBOARD/RENEW
   │         │         │         │         │
   │    [Manual]   [Shifts]  [No reviews] [No renewal
   │    No contract  [Time]              workflow]
   │    term tracking
   │
   ▼
 crew_members (employment_type = 'contractor')
 ├── Same capabilities as employees
 └── BUT: No contract_end_date, no renewal tracking,
     no agency linkage, no distinct compliance requirements
```

**Current coverage:** Same as employees (via employment_type = 'contractor')
**Missing:** Contract term dates | Renewal workflow | Agency linkage | Contract-specific compliance (MSA, SOW per engagement)

### 2.4 Independent Contractors (1099)

```
RECRUIT → ONBOARD → ENGAGE → PERFORM → OFFBOARD
   │         │         │         │         │
   │    [Vendor       [Work     [Vendor    [No structured
   │     Onboarding    Orders]   Reviews]   process]
   │     Pipeline]    [Dispatch]
   │    [Compliance
   │     Docs]
   │
   ▼
 vendors (vendor_type = 'independent_contractor')
 ├── vendor_compliance_docs (COI, W9, NDA, etc.)
 ├── work_orders (assignment + billing)
 ├── work_order_bids (competitive bidding)
 ├── dispatch_entries (scheduling)
 ├── vendor_reviews (7-category ratings)
 ├── vendor_portal_tokens (self-serve access)
 └── vendor_communications (messaging)
```

**Current coverage:** Onboarding ✅ | Compliance ✅ | Bidding ✅ | Dispatch ✅ | Reviews ✅ | Portal ✅
**Missing:** No link to crew_members if same person works both sides | No 1099 generation tracking | No IC misclassification safeguards

### 2.5 Subcontractors

```
RECRUIT → ONBOARD → BID/AWARD → ENGAGE → PERFORM → OFFBOARD
   │         │         │           │         │         │
   │    [Vendor       [Work Order [Dispatch] [Vendor   [No structured
   │     Onboarding]   Bidding]   [Checklists] Reviews] process]
   │    [Compliance]
   │
   ▼
 vendors (vendor_type = 'subcontractor')
 ├── Same as Independent Contractors
 ├── PLUS: work_order_bids (competitive process)
 └── BUT: No crew-level scheduling, no per-person tracking within subcontractor org
```

**Current coverage:** Full vendor lifecycle ✅
**Missing:** Per-person tracking within sub orgs | Lien waiver tracking | Prevailing wage compliance | Sub-tier tracking

### 2.6 Freelancers (Hybrid Problem)

```
⚠️  DUAL IDENTITY PROBLEM

Path A (Crew System):
  crew_members (employment_type = 'freelance')
  → Scheduling, time tracking, payroll, PTO, resource planning
  → BUT: No compliance docs, no portal, no bidding

Path B (Vendor System):
  vendors (vendor_type = 'freelancer')
  → Compliance, bidding, dispatch, reviews, portal
  → BUT: No granular scheduling, no time entry/payroll, no PTO

Neither path alone covers the full freelancer lifecycle.
Most freelancers in creative production need BOTH:
  - Compliance docs (COI, W9)
  - Granular shift scheduling
  - Time entry with approval
  - Performance reviews
  - Portal access
```

**Current coverage:** Partially in both systems — **SSOT violation**
**Missing:** Unified identity | Cross-system compliance | Single rate card per person

---

## 3. Lifecycle Comparison Matrix

| Lifecycle Phase | FT Employee | PT Employee | Seasonal | Contract | IC (1099) | Subcontractor |
|---|---|---|---|---|---|---|
| **Recruitment** | ❌ No pipeline | ❌ No pipeline | ❌ No pipeline | ❌ No pipeline | ⚠️ Via service requests | ⚠️ Via service requests |
| **Applicant Tracking** | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None |
| **Onboarding** | ❌ Manual | ❌ Manual | ❌ Manual | ❌ Manual | ✅ Vendor pipeline | ✅ Vendor pipeline |
| **I-9 / W-4 / Tax** | ❌ No tracking | ❌ No tracking | ❌ No tracking | ❌ No tracking | ⚠️ W-9 only | ⚠️ W-9 only |
| **Background Check** | ⚠️ Date field only | ⚠️ Date field only | ⚠️ Date field only | ⚠️ Date field only | ✅ Compliance doc | ✅ Compliance doc |
| **Compliance Docs** | ❌ Certs only | ❌ Certs only | ❌ Certs only | ❌ Certs only | ✅ Full system | ✅ Full system |
| **Contract / SOW** | ❌ None | ❌ None | ❌ None | ❌ None | ⚠️ Via work orders | ⚠️ Via work orders |
| **Scheduling** | ✅ Shifts + availability | ✅ Shifts + availability | ✅ Shifts + availability | ✅ Shifts + availability | ⚠️ Dispatch only | ⚠️ Dispatch only |
| **Time Tracking** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ❌ None | ❌ None |
| **Payroll** | ✅ Batches | ✅ Batches | ✅ Batches | ✅ Batches | ❌ None (invoiced) | ❌ None (invoiced) |
| **PTO / Leave** | ✅ Time off requests | ✅ Time off requests | ⚠️ Not season-aware | ❌ Not applicable | ❌ N/A | ❌ N/A |
| **Performance Review** | ❌ None | ❌ None | ❌ None | ❌ None | ✅ Vendor reviews | ✅ Vendor reviews |
| **Bidding / Award** | ❌ N/A | ❌ N/A | ❌ N/A | ❌ N/A | ✅ Work order bids | ✅ Work order bids |
| **Portal Access** | ❌ None | ❌ None | ❌ None | ❌ None | ✅ Vendor portal | ✅ Vendor portal |
| **Rate Management** | ⚠️ Single hourly/OT/day | ⚠️ Single hourly/OT/day | ⚠️ Single hourly/OT/day | ⚠️ Single hourly/OT/day | ⚠️ Default rates only | ⚠️ Default rates only |
| **Offboarding** | ❌ No workflow | ❌ No workflow | ❌ No workflow | ❌ No workflow | ❌ No workflow | ❌ No workflow |
| **Re-engagement** | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None |
| **Audit Trail** | ✅ Activity log | ✅ Activity log | ✅ Activity log | ✅ Activity log | ✅ Activity log | ✅ Activity log |

**Legend:** ✅ Fully covered | ⚠️ Partial/limited | ❌ Missing

---

## 4. Gap Analysis & Findings

### 4.1 SSOT Violations

| # | Violation | Impact | Severity |
|---|---|---|---|
| V1 | Freelancers/ICs can exist in both `crew_members` AND `vendors` with no FK link | Duplicate profiles, conflicting rates, split compliance history | **Critical** |
| V2 | `crew_members.employment_type` and `vendors.vendor_type` overlap for contractor/freelancer | Ambiguous canonical classification | **Critical** |
| V3 | `certifications` (crew) and `vendor_compliance_docs` (vendors) track similar docs separately | Split compliance view | **High** |
| V4 | `crew_members.background_check_date` stores only a date, while vendors have full doc tracking | Inconsistent compliance depth | **Medium** |
| V5 | Rate stored on `crew_members`, `project_assignments`, `crew_shifts`, and `vendors` | No single rate authority | **High** |

### 4.2 Missing Lifecycle Phases

| # | Gap | Affected Classifications | Priority |
|---|---|---|---|
| G1 | No recruitment/applicant tracking | All | **High** |
| G2 | No structured onboarding for internal workers | FT, PT, Seasonal, Contract | **Critical** |
| G3 | No performance review system for internal workers | FT, PT, Seasonal, Contract | **High** |
| G4 | No structured offboarding workflow | All | **High** |
| G5 | No re-engagement workflow for seasonal/returning workers | Seasonal, Freelancers | **Medium** |
| G6 | No `seasonal` employment type | Seasonal | **Medium** |
| G7 | No contract term tracking (start/end/renewal) | Contract employees | **High** |
| G8 | No IC misclassification safeguards | ICs, Freelancers | **Critical** (legal) |
| G9 | No employee portal equivalent | FT, PT, Seasonal, Contract | **Medium** |
| G10 | No benefits/compensation tracking | FT, PT | **Medium** |

### 4.3 Compliance Risks

| # | Risk | Description | Severity |
|---|---|---|---|
| R1 | **IC Misclassification** | No behavioral test tracking (IRS 20-factor, ABC test). A person treated as a crew_member with shifts/time entries but classified as 'contractor' could trigger DOL audit. | **Critical** |
| R2 | **Expired Certifications — Crew** | `certifications` table has `expiry_date` but no auto-alert, no auto-suspend, no compliance gate blocking shift assignment. Vendors have this via `compliance_requirements.auto_suspend_on_expiry`. | **High** |
| R3 | **No I-9 Verification Tracking** | Required within 3 days of hire for all employees. No field exists. | **High** |
| R4 | **No W-4 / State Tax Withholding** | Required for all W-2 employees. No tracking. | **High** |
| R5 | **No Workers Comp Classification** | Workers comp rates vary by classification code. No NCCI code tracking for crew. | **Medium** |
| R6 | **No E-Verify Integration Point** | Federal contractors may require E-Verify. No schema support. | **Medium** |
| R7 | **No Prevailing Wage Tracking** | Government/public projects require Davis-Bacon compliance. No fields. | **Low** |

### 4.4 Efficiency Gaps

| # | Inefficiency | Impact |
|---|---|---|
| E1 | Admins must manage two separate systems for a freelancer who does both crew shifts and vendor work orders | 2x data entry, fragmented view |
| E2 | No unified "worker directory" — must check both `/crew` and `/vendors` to find someone | Search friction |
| E3 | No onboarding checklist for internal hires — vendor onboarding has a full pipeline | Inconsistent onboarding quality |
| E4 | No way to convert a vendor to crew or vice versa | Manual recreation required |
| E5 | Performance reviews only exist for vendors, not for any internal worker | No internal performance management |

---

## 5. Future-State Architecture Model

### 5.1 Unified Worker Identity (Hub-and-Spoke)

```
                    ┌─────────────────────┐
                    │   worker_profiles    │  ← SINGLE SOURCE OF TRUTH
                    │─────────────────────│
                    │ id (PK)             │
                    │ person_type (enum)  │  ← employee | contractor | freelancer | vendor_org | agency
                    │ first_name          │
                    │ last_name           │
                    │ email (unique)      │
                    │ phone               │
                    │ classifications[]   │  ← Can hold MULTIPLE active classifications
                    │ primary_class       │
                    │ lifecycle_status     │  ← prospect | onboarding | active | on_leave | offboarding | alumni | do_not_engage
                    │ organization_id     │
                    │ auth_user_id (FK)   │  ← Links to profiles for portal access
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
    ┌─────────▼─────────┐ ┌───▼────────┐ ┌────▼──────────────┐
    │ worker_employment  │ │ worker_    │ │ worker_compliance │
    │ (classification-   │ │ engage-    │ │ (unified docs)    │
    │  specific details) │ │ ments      │ │                   │
    │───────────────────│ │────────────│ │───────────────────│
    │ worker_id (FK)    │ │ worker_id  │ │ worker_id (FK)    │
    │ classification    │ │ project_id │ │ doc_type           │
    │ start_date        │ │ work_order │ │ status             │
    │ end_date          │ │ role       │ │ expiry_date        │
    │ is_seasonal       │ │ rate       │ │ auto_suspend       │
    │ season_pattern    │ │ rate_type  │ │ ...                │
    │ agency_vendor_id  │ │ ...        │ │ (replaces BOTH     │
    │ contract_terms    │ │            │ │  certifications AND │
    │ benefits_eligible │ │            │ │  vendor_compliance) │
    │ tax_class (W2/1099)│ │           │ │                    │
    └───────────────────┘ └────────────┘ └────────────────────┘
```

### 5.2 Classification-Aware Onboarding

```
worker_onboarding_steps (template-driven, per classification)
├── Each classification gets a different set of required steps
├── Steps are defined in onboarding_step_templates
├── Compliance requirements auto-populate based on classification
└── Progress tracked per worker with due dates and assignments

EMPLOYEE onboarding:     [Offer Letter → I-9 → W-4 → Background Check → Drug Test → Safety Training → Equipment → IT Setup]
SEASONAL onboarding:     [Returning? → Skip completed docs → Update availability → Safety Refresher → Assignment]
CONTRACT onboarding:     [MSA Review → SOW Sign → I-9 → W-4 → Background Check → Project Assignment]
IC onboarding:           [W-9 → COI → NDA → Background Check → Rate Agreement → Portal Setup]
SUBCONTRACTOR onboarding: [MSA → COI → Workers Comp → W-9 → NDA → Insurance Min → Safety Certs → Portal Setup]
```

### 5.3 Unified Lifecycle States

```
┌──────────┐     ┌────────────┐     ┌────────┐     ┌───────────┐     ┌────────────┐     ┌─────────┐
│ PROSPECT │────▶│ ONBOARDING │────▶│ ACTIVE │────▶│ ON_LEAVE  │────▶│ OFFBOARDING│────▶│ ALUMNI  │
└──────────┘     └────────────┘     └────────┘     └───────────┘     └────────────┘     └─────────┘
     │                                    │              │                                    │
     │                                    │              ▼                                    │
     │                                    │         ┌─────────┐                               │
     │                                    └────────▶│SUSPENDED│ (compliance expiry)           │
     │                                              └─────────┘                               │
     │                                                                                        │
     └────────────────────────────── RE-ENGAGE (seasonal, returning freelancers) ◀────────────┘
```

---

## 6. Recommended Data Model (3NF)

### 6.1 New Tables (Migration 011)

```sql
-- Core identity
CREATE TABLE worker_profiles (...)          -- SSOT for all worker identities
CREATE TABLE worker_classifications (...)   -- 1:N classifications per worker (FT, seasonal, IC, etc.)
CREATE TABLE worker_onboarding_runs (...)   -- Per-engagement onboarding instance

-- Unified compliance (replaces dual system)
CREATE TABLE worker_compliance_docs (...)   -- Unified doc tracking for ALL classifications
CREATE TABLE compliance_templates (...)     -- Which docs required per classification

-- Performance (extends vendor_reviews to all)
CREATE TABLE worker_reviews (...)           -- Universal review system

-- Onboarding automation
CREATE TABLE onboarding_step_templates (...)-- Step definitions per classification
CREATE TABLE onboarding_step_progress (...) -- Per-worker step completion

-- Offboarding
CREATE TABLE offboarding_runs (...)         -- Structured offboarding workflows
CREATE TABLE offboarding_step_progress (...)

-- Engagement terms
CREATE TABLE engagement_terms (...)         -- Contract dates, renewal, agency link, rate schedule

-- IC safeguards
CREATE TABLE classification_assessments (...)-- IRS 20-factor / ABC test records
```

### 6.2 Bridge Strategy (Backward Compatible)

Rather than replacing `crew_members` and `vendors`, we add `worker_profiles` as a **unifying hub**:

```sql
ALTER TABLE crew_members ADD COLUMN worker_profile_id UUID REFERENCES worker_profiles(id);
ALTER TABLE vendors ADD COLUMN worker_profile_id UUID REFERENCES worker_profiles(id);
```

This allows:
- Existing pages and hooks continue to work unchanged
- New unified pages can query through `worker_profiles`
- Gradual migration of logic from dual system to unified system
- A freelancer's `worker_profiles` row links to BOTH their `crew_members` and `vendors` rows

### 6.3 3NF Compliance Verification

| Principle | Current State | Future State |
|---|---|---|
| **1NF: Atomic fields** | ✅ All fields atomic | ✅ Maintained |
| **2NF: Full key dependency** | ✅ All non-key fields depend on full PK | ✅ Maintained |
| **3NF: No transitive deps** | ⚠️ `crew_members.background_check_date` is a derived summary | ✅ Moved to `worker_compliance_docs` |
| **SSOT: Single definition** | ❌ Dual identity for freelancers | ✅ `worker_profiles` is canonical |
| **Referential integrity** | ✅ FKs enforced | ✅ New FKs to `worker_profiles` |
| **No redundancy** | ❌ Rates duplicated across tables | ✅ `engagement_terms.rate_schedule` is authoritative |

---

## 7. UI/UX Simplification Principles

### 7.1 Single Worker Directory

**Current:** Admins must navigate to `/crew` OR `/vendors` to find a person.
**Future:** `/workforce` — Unified directory with classification filters.

```
/workforce
├── All workers in one searchable, filterable list
├── Filter by: classification, status, department, skills, availability
├── Click into unified worker profile
├── Profile shows: compliance status, assignments, reviews, time entries, documents
└── "Add Worker" flow asks for classification first, then adapts form
```

### 7.2 Adaptive Detail Views

The worker profile page adapts based on classification:

| Section | Employee | Seasonal | Contract | IC | Subcontractor |
|---|---|---|---|---|---|
| Personal Info | ✅ | ✅ | ✅ | ✅ | ✅ |
| Employment Terms | ✅ | ✅ + Season | ✅ + Contract Term | ✅ + Rate Agreement | ✅ + MSA |
| Compliance Docs | I-9, W-4, Certs | I-9, W-4, Certs | I-9, W-4, MSA | W-9, COI, NDA | W-9, COI, WC, NDA |
| Scheduling | Shifts | Shifts + Season | Shifts | Dispatch | Dispatch |
| Time & Pay | Timesheet + Payroll | Timesheet + Payroll | Timesheet + Payroll | Invoiced | Invoiced |
| Reviews | ✅ | ✅ | ✅ | ✅ | ✅ |
| Portal | Employee Portal | Employee Portal | Employee Portal | Vendor Portal | Vendor Portal |
| Bidding | — | — | — | ✅ | ✅ |

### 7.3 Progressive Disclosure

- Default view shows only the 3 most actionable items (next shift, expiring docs, pending reviews)
- "Show All" expands to full lifecycle detail
- Command bar supports `worker:search`, `worker:onboard`, `worker:offboard`

### 7.4 Cognitive Load Reduction

| Principle | Implementation |
|---|---|
| **One place for everything** | `/workforce` replaces `/crew` + `/vendors` for person lookup |
| **Classification drives UI** | Form fields, compliance checklists, and workflows adapt automatically |
| **Status-first design** | Dashboard surfaces only actionable items (expiring docs, pending onboarding, overdue reviews) |
| **Bulk operations** | Batch onboarding for seasonal re-engagement, batch compliance reminders |

---

## 8. Automation Opportunities

### 8.1 Onboarding Automation

| Trigger | Action | Classification |
|---|---|---|
| Worker profile created | Auto-generate onboarding steps from template | All |
| All required docs approved | Auto-advance to "active" status | All |
| Seasonal worker alumni detected | Pre-fill returning worker onboarding (skip completed steps) | Seasonal |
| Classification selected as IC | Auto-add W-9, COI, NDA requirements | IC |
| Compliance doc uploaded | Auto-notify reviewer, start SLA timer | All |

### 8.2 Compliance Automation

| Trigger | Action |
|---|---|
| Doc expiry in N days | Auto-email reminder (30, 14, 7 day cadence) |
| Doc expired | Auto-suspend worker, block new assignments |
| Cert expired for crew | Block shift scheduling (currently not enforced) |
| IC engagement >6 months continuous | Flag for misclassification review |
| Annual review date passed | Auto-create review task for supervisor |

### 8.3 Offboarding Automation

| Trigger | Action |
|---|---|
| Termination date set | Generate offboarding checklist |
| Contract end date reached | Auto-notify for renewal or offboard |
| Seasonal end date | Transition to "alumni" status, flag for re-engagement next season |
| Last project completed | Prompt for final review, trigger offboarding |

### 8.4 Re-Engagement Automation

| Trigger | Action |
|---|---|
| New season starts | Query alumni with matching skills, send re-engagement invites |
| Preferred vendor idle >90 days | Suggest for upcoming work orders matching their categories |
| Former freelancer applies | Auto-detect match, pre-fill profile from alumni record |

---

## 9. Risk Mitigation

### 9.1 IC Misclassification (Critical)

**Current Risk:** No safeguards. A person can be assigned shifts, have time entries approved, and be paid via payroll — all while classified as "contractor" in `employment_type`. This is a textbook misclassification scenario.

**Mitigation:**
1. `classification_assessments` table stores IRS 20-factor or ABC test results
2. Periodic re-assessment automation (every 6 months for active ICs)
3. UI warning when IC is assigned >X consecutive shifts or >Y hours/week
4. Compliance gate: IC cannot be added to payroll_batches (must be invoiced)
5. Dashboard alert for ICs approaching employee-like engagement patterns

### 9.2 Expired Compliance — Crew Side

**Current Risk:** Crew certifications can expire with no enforcement. A rigger with an expired OSHA cert can still be scheduled for a shift.

**Mitigation:**
1. Extend compliance gate from vendor system to crew system
2. Shift scheduling blocked if required cert is expired
3. Dashboard widget for crew cert expirations (mirrors vendor compliance dashboard)

### 9.3 Data Migration

**Risk:** Introducing `worker_profiles` requires data migration from existing `crew_members` and `vendors`.

**Mitigation:**
1. Bridge strategy (FK columns) allows gradual migration
2. Background job to auto-create `worker_profiles` for all existing crew + vendors
3. Deduplication check: match by email to link crew_member ↔ vendor records
4. New pages can coexist with old pages during transition

### 9.4 Role-Based Access

**Current Risk:** `profiles.role` has only 4 values: `exec`, `pm`, `client`, `vendor`. No HR role, no crew self-service role.

**Mitigation:**
1. Extend profile roles or use RBAC via `roles` page
2. Worker portal access should be classification-aware
3. Sensitive fields (SSN, tax ID, compensation) require elevated permissions

---

## 10. Implementation Roadmap

### Phase 1: Foundation (Migration 011) — Critical

1. Create `worker_profiles` table with bridge FKs
2. Create `worker_classifications` table
3. Create `classification_assessments` table (IC safeguard)
4. Add `worker_profile_id` FK to `crew_members` and `vendors`
5. Add `seasonal` to `employment_type` enum
6. Create `engagement_terms` table
7. Backfill `worker_profiles` from existing data

### Phase 2: Unified Compliance — High

1. Create `worker_compliance_docs` (unified, replaces dual tracking)
2. Create `compliance_templates` (per classification)
3. Extend compliance gates to crew scheduling
4. Crew cert expiry alerts + auto-suspend

### Phase 3: Onboarding & Offboarding — High

1. Create `onboarding_step_templates` + `onboarding_step_progress`
2. Create `offboarding_runs` + `offboarding_step_progress`
3. Build `/workforce/onboarding` page
4. Build `/workforce/offboarding` page

### Phase 4: Unified UI — Medium

1. Build `/workforce` directory page (unified search across all classifications)
2. Build `/workforce/[id]` profile page (adaptive by classification)
3. Build `/workforce/reviews` page (extends vendor reviews to all)
4. Add Employee Portal equivalent
5. Update navigation to add Workforce section

### Phase 5: Automation — Medium

1. Onboarding automation (template-driven step generation)
2. Compliance expiry automation (reminders + auto-suspend)
3. IC misclassification detection automation
4. Seasonal re-engagement automation
5. Offboarding trigger automation

---

## Appendix A: Existing Schema Inventory

| Table | Migration | Classification Coverage |
|---|---|---|
| `profiles` | 001 | Auth users (admins, PMs, clients, vendors) |
| `crew_members` | 001 + 003 | FT, PT, Seasonal*, Contract, Freelance |
| `certifications` | 001 | Crew only |
| `shifts` | 001 | Crew only (legacy) |
| `crew_shifts` | 003 | Crew only (extended) |
| `crew_availability` | 003 | Crew only |
| `project_assignments` | 003 | Crew only |
| `production_time_entries` | 003 | Crew only |
| `payroll_batches` | 003 | Crew only (W-2) |
| `time_off_requests` | 005 | Crew only |
| `resource_bookings` | 005 | Crew + placeholder |
| `active_timers` | 005 | Auth users |
| `vendors` | 001 + 008 | Vendors, Subs, ICs, Freelancers, Agencies, Suppliers |
| `compliance_requirements` | 008 | Vendors only |
| `vendor_compliance_docs` | 008 | Vendors only |
| `work_orders` | 008 | Vendor assignments |
| `work_order_bids` | 008 | Vendor bidding |
| `dispatch_entries` | 008 | Vendors + Crew |
| `vendor_reviews` | 008 | Vendors only |
| `vendor_portal_tokens` | 008 | Vendors only |
| `vendor_communications` | 008 | Vendors only |

\* Seasonal not explicitly supported — no enum value, no season tracking fields.

## Appendix B: Existing Page Inventory

| Page | Route | Worker Types Served |
|---|---|---|
| Crew List | `/crew` | FT, PT, Seasonal, Contract, Freelance |
| Crew Detail | `/crew/[id]` | Same |
| New Crew | `/crew/new` | Same |
| Scheduling | `/scheduling` | Crew only |
| Time Tracking | `/time-tracking` | Crew + Auth users |
| Time Off | `/time-off` | Crew only |
| Resource Planner | `/resource-planner` | Crew + placeholder |
| Vendors List | `/vendors` | Vendors, Subs, ICs, Freelancers, Agencies |
| Vendor Detail | `/vendors/[id]` | Same |
| New Vendor | `/vendors/new` | Same |
| Vendor Onboarding | `/vendor-onboarding` | Vendors only |
| Vendor Compliance | `/vendor-compliance` | Vendors only |
| Vendor Reviews | `/vendor-reviews` | Vendors only |
| Dispatch | `/dispatch` | Vendors + Crew |
| Work Orders | `/work-orders` | Vendors + Crew |
| Vendor Portal | `/vendor-portal` | Vendors only |
| Client Portal | `/client-portal` | Clients |

---

*End of Workforce Lifecycle Analysis*
