# Live Event / Show / Activation Operations Lifecycle Architecture

**Date:** 2026-02-25  
**Version:** 1.0  
**Scope:** Full live-phase operational lifecycle — Load-in through strike, encompassing command & control, safety compliance, workforce coordination, asset tracking, financial visibility, guest experience, and incident response  
**Methodology:** Schema audit (15 migrations, 180+ tables), type mapping (9 type files), UI surface inventory (100+ routes), gap analysis against enterprise-grade live event operations requirements  
**Design Constraint:** 3NF-compliant, SSOT-enforced, offline-first resilient, mobile-first field interfaces, cognitive-load optimized for high-pressure live conditions

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current-State Live Operations Map](#2-current-state-live-operations-map)
3. [Gap Analysis](#3-gap-analysis)
4. [Future-State Command Architecture](#4-future-state-command-architecture)
5. [Live-Phase System State Diagram](#5-live-phase-system-state-diagram)
6. [3NF-Compliant Entity Relationship Model](#6-3nf-compliant-entity-relationship-model)
7. [Command & Control Hierarchy Schema](#7-command--control-hierarchy-schema)
8. [Incident Escalation Matrix](#8-incident-escalation-matrix)
9. [Real-Time Dashboard Data Schema](#9-real-time-dashboard-data-schema)
10. [Role-Based Interface Model](#10-role-based-interface-model)
11. [Pre-Live Activation (Onsite Readiness)](#11-pre-live-activation-onsite-readiness)
12. [Live Show Operations Model](#12-live-show-operations-model)
13. [Guest Experience & Front-of-House](#13-guest-experience--front-of-house)
14. [Asset & Infrastructure Monitoring](#14-asset--infrastructure-monitoring)
15. [Risk & Incident Management](#15-risk--incident-management)
16. [Financial Live-Burn Tracking Model](#16-financial-live-burn-tracking-model)
17. [Strike & Demobilization Workflow](#17-strike--demobilization-workflow)
18. [Operational KPI Model](#18-operational-kpi-model)
19. [Offline-First & Low-Connectivity Architecture](#19-offline-first--low-connectivity-architecture)
20. [UI/UX Simplification for High-Pressure Environments](#20-uiux-simplification-for-high-pressure-environments)
21. [Automation & AI Augmentation Roadmap](#21-automation--ai-augmentation-roadmap)
22. [Implementation Roadmap](#22-implementation-roadmap)

---

## 1. Executive Summary

### 1.1 Scope

This document governs the **live-phase operational lifecycle** of events, shows, and activations. The scope is exclusively the **execution window** — from crew arrival onsite (load-in) through live operations and complete demobilization (strike). This is the highest-stakes phase: decisions are time-critical, consequences immediate, and cognitive overload the primary risk.

The system unifies **7 operational domains** under a single normalized architecture:

| Domain | Current Coverage | Live-Phase Gap |
|--------|-----------------|----------------|
| **Command & Control** | No hierarchy model | **Critical** — No ICS, no escalation, no radio mapping |
| **Safety & Compliance** | `incidents` (003), basic checklists | **Critical** — No readiness gates, no briefings, no inspections |
| **Workforce Coordination** | `crew_shifts` (003), `worker_profiles` (011) | **High** — No live reassignment, no credential gate, no sign-in/out |
| **Asset Tracking** | `assets`, `asset_assignments` (003) | **High** — No real-time location, no equipment check-in, no power monitoring |
| **Financial Visibility** | `budgets`, `production_expenses` (003) | **High** — No live-burn tracking, no OT alerts, no onsite procurement |
| **Guest Experience** | None | **Critical** — No FOH model, no ticket validation, no VIP, no F&B |
| **Incident Response** | `incidents` (003) | **Medium** — Exists but no live triage, no auto-escalation |

### 1.2 Critical Findings

| # | Finding | Severity |
|---|---------|----------|
| 1 | No Incident Command System (ICS) hierarchy model | Critical |
| 2 | No readiness gate system for pre-live verification | Critical |
| 3 | No run-of-show execution engine (ROS is JSONB blob) | Critical |
| 4 | No live crew assignment/reassignment model | High |
| 5 | No real-time asset location tracking | High |
| 6 | No guest experience/FOH data model | Critical |
| 7 | No live financial burn rate visibility | High |
| 8 | No communication log / radio channel mapping | Critical |
| 9 | No environmental monitoring model | High |
| 10 | No strike reconciliation workflow | High |
| 11 | No offline-first data sync architecture | Critical |
| 12 | Incidents table lacks live-phase triage fields | Medium |

### 1.3 Design Principles

1. **Cognitive Load Minimization** — Interfaces default to minimum info for current role/phase. Progressive disclosure enforced.
2. **Temporal Separation** — Live operational state strictly separated from planning data via dedicated `live_event_instances`.
3. **Offline-First Resilience** — All field interfaces function without connectivity. Last-write-wins with manual review for critical fields.
4. **Role-Based Everything** — Dashboards, alerts, escalations, permissions all role-scoped.
5. **Auditability** — Every state transition, communication, decision logged with timestamp + actor.
6. **Mobile-First** — Crew-facing interfaces designed for single-hand operation in outdoor/dark/loud environments.

### 1.4 Recommendation Summary

| Action | Impact | Effort | Priority |
|--------|--------|--------|----------|
| ICS command hierarchy + escalation matrix | Eliminates role confusion | Medium | **P0** |
| Readiness gate system | Prevents unsafe show starts | Medium | **P0** |
| Run-of-show execution engine | Enables live cue tracking | Large | **P0** |
| Live crew assignment model | Enables real-time redeployment | Medium | **P0** |
| Communication log + radio mapping | Creates audit trail | Small | **P0** |
| Guest experience / FOH data model | Enables FOH visibility | Large | **P1** |
| Live financial burn tracking | Enables margin visibility | Medium | **P1** |
| Real-time asset location tracking | Enables equipment monitoring | Medium | **P1** |
| Environmental monitoring model | Enables weather/crowd alerts | Medium | **P1** |
| Strike reconciliation workflow | Enables structured demob | Medium | **P1** |
| Offline-first sync architecture | Enables field resilience | Large | **P2** |
| AI crowd density & incident classification | Enables predictive ops | Large | **P3** |

---

## 2. Current-State Live Operations Map

### 2.1 Entity Hierarchy Relevant to Live Phase

```
Organization → Project → Location → Activation → Event (LIVE PHASE ANCHOR)
                                                    ├── Activity
                                                    ├── Crew Shifts
                                                    └── Run of Show (JSONB — NOT normalized)
```

### 2.2 Current Coverage

| Segment | Schema | Types | UI | Status |
|---------|--------|-------|-----|--------|
| Load-In Sequencing | `crew_shifts.call_time` | ✅ | `/scheduling` | Partial |
| Credential Verification | `certifications` on crew | ✅ | `/crew` | Partial |
| Equipment Check-In | `asset_assignments.status` | ✅ | `/assets` | Partial |
| Run-of-Show Execution | `events.run_of_show` JSONB | ✅ | `/events` | **SSOT violation** |
| Incident Management | `incidents` (003) | ✅ | `/incidents` | No live triage |
| Engineering Inspections | None | ❌ | ❌ | **Missing** |
| Safety Briefings | None | ❌ | ❌ | **Missing** |
| Command Hierarchy | None | ❌ | ❌ | **Missing** |
| Communication Log | None | ❌ | ❌ | **Missing** |
| Guest Experience | None | ❌ | ❌ | **Missing** |
| Live Financial Tracking | `production_expenses` | ✅ | `/expenses` | Not real-time |
| Environmental Monitoring | None | ❌ | ❌ | **Missing** |
| Strike Sequencing | None | ❌ | ❌ | **Missing** |

---

## 3. Gap Analysis

### 3.1 Communication Breakdowns

- No digital radio channel registry → crew guesses channels
- No communication log → decisions on radio disappear (liability)
- No escalation path visibility → role confusion under stress
- No cross-departmental status board → departments operate in silos
- No automated alerts → all notifications human-initiated

### 3.2 Role Confusion During Escalation

| Scenario | Current Handling | Correct ICS Routing |
|----------|-----------------|-------------------|
| Medical emergency | "Call the producer" | Safety Officer → EMS |
| Equipment failure | "Call the PM" | Technical Director → Vendor |
| Weather threat | No protocol | Safety Officer → Event Commander |
| Security incident | "Call security" | Security Lead → Safety Officer |
| Budget overage | Post-event discovery | Financial Officer (live) |

### 3.3 Data Duplication (Ops vs Finance)

- Crew hours duplicated: `crew_shifts` times vs `production_time_entries`
- Equipment costs duplicated: `asset_assignments` vs `production_expenses`
- OT calculated independently in shifts vs payroll
- Onsite purchases not tracked until post-event

### 3.4 Asset Tracking Blind Spots

- No real-time asset location (last known only)
- No power/electrical load monitoring
- No equipment uptime tracking
- No consumable depletion during live
- No digital signage status tracking

### 3.5 Cognitive Overload Risks

| Risk | Mitigation |
|------|-----------|
| Information density | Role-filtered dashboards |
| Alert fatigue | Priority-based, role-filtered alerts |
| Decision paralysis | Clear ICS with authority matrix |
| Context switching | Single-pane live operations view |
| Memory load | Digital task queues per role |

---

## 4. Future-State Command Architecture

### 4.1 Three-Layer Operational Model

```
LAYER 1 — COMMAND (Strategic):
  Event Commander | Safety Officer | Financial Officer | Client Liaison

LAYER 2 — TACTICAL (Coordination):
  Stage Manager | Technical Director | Logistics Lead | FOH Manager | Prod Coordinator

LAYER 3 — OPERATIONS (Execution):
  Audio Lead | Lighting Lead | Video Lead | Rigging Lead | Stage Lead
  Crew Lead | Security Lead | Medical Lead | Catering Lead | Custom Lead
```

### 4.2 State Machine — Live Event Lifecycle

```
ADVANCE → LOAD_IN → SETUP → REHEARSAL → READY → LIVE ⇄ HOLD → STRIKE → WRAPPED
```

| Transition | Required Conditions |
|-----------|-------------------|
| ADVANCE → LOAD_IN | Site access confirmed, permits verified, insurance on file |
| LOAD_IN → SETUP | All dept heads checked in, critical equipment received |
| SETUP → REHEARSAL | All installations complete, engineering inspections passed |
| REHEARSAL → READY | Tech rehearsal signed off, safety briefing done, all gates green |
| READY → LIVE | Doors opened, command confirmed, medical on standby |
| LIVE → HOLD | Emergency declared by Commander or Safety Officer |
| HOLD → LIVE | Emergency resolved, safety clearance, commander authorization |
| LIVE → STRIKE | Show complete, final walkthrough, Safety Officer all-clear |
| STRIKE → WRAPPED | All assets reconciled, crew signed out, incidents finalized |

### 4.3 Decision Authority Matrix

| Decision | Authority | Max Response |
|----------|-----------|-------------|
| Show Go/No-Go | Event Commander | — |
| Emergency Stop | Commander OR Safety Officer | Immediate |
| Evacuation | Safety Officer | Immediate |
| Medical Response | Medical Lead → Safety Officer | 2 min |
| Schedule Change | Stage Manager | 5 min |
| Crew Redeployment | Crew Lead → Prod Coordinator | 10 min |
| Purchase < $500 | Any L2 | 15 min |
| Purchase $500-$5K | Financial Officer | 30 min |
| Purchase > $5K | Event Commander | 1 hr |

### 4.4 Radio Channel Map

| CH | Assignment | Priority |
|----|-----------|----------|
| 1 | Command (L1 only) | Critical |
| 2 | Stage / Show Call | High |
| 3 | Technical / AV | High |
| 4 | Logistics / Staging | Medium |
| 5 | Security | High |
| 6 | Medical / Safety | Critical |
| 7 | FOH / Guest Services | Medium |
| 8 | Catering / F&B | Low |
| 9 | All-Call (emergency) | Emergency |

---

## 5. Live-Phase System State Diagram

### 5.1 Parallel State Tracks

During live phase, multiple state machines run simultaneously:

- **Event State** (master): advance → load_in → setup → rehearsal → ready → live → strike → wrapped
- **Readiness Gates**: Sequential checklist (10 gates, each independently verified)
- **Department Status**: Per-department RAG status (not_checked_in → setting_up → ready → active → issue → blocked → striking → wrapped)
- **Run of Show**: Sequential cue list (pending → standby → called → in_progress → completed → skipped)
- **Incident State**: Event-driven (active count, severity distribution, risk score)
- **Financial State**: Continuous (budget, spent, OT, margin, burn rate)
- **Crowd State**: Continuous (capacity, current, flow rate, peak)

### 5.2 State Ownership

| Track | Write Owner | Refresh |
|-------|-----------|---------|
| Event State | Event Commander | On transition |
| Readiness Gates | Assigned verifier per gate | On completion |
| Department Status | Department lead | 15 min or on change |
| ROS Cues | Stage Manager | Per cue |
| Incidents | Safety Officer + reporter | On event |
| Financial | Financial Officer | 15 min |
| Crowd | FOH Manager | 5 min |

---

## 6. 3NF-Compliant Entity Relationship Model

### 6.1 New Tables

```
live_event_instances ──┬── readiness_gates
(1:1 with events)     ├── department_statuses
                       ├── command_positions
                       ├── ros_cues
                       ├── comm_channels
                       ├── comm_log_entries
                       ├── live_crew_assignments
                       ├── equipment_check_ins
                       ├── environmental_readings
                       ├── live_financial_snapshots
                       ├── foh_zones ── foh_zone_readings
                       ├── vip_guests ── vip_service_requests
                       ├── guest_incidents
                       ├── strike_sequences
                       ├── asset_reconciliation_items
                       └── post_event_reports (1:1)
```

### 6.2 Integration with Existing Tables

| New Table | References |
|-----------|-----------|
| `live_event_instances` | `events`, `activations`, `locations`, `projects` |
| `command_positions` | `profiles` |
| `readiness_gates` | `profiles` (verifier), `permit_registry` (015) |
| `live_crew_assignments` | `crew_members`, `crew_shifts` |
| `equipment_check_ins` | `assets`, `asset_assignments` |
| `live_financial_snapshots` | `budgets` |
| `guest_incidents` | `incidents` (escalation link) |
| `asset_reconciliation_items` | `assets`, `asset_assignments` |

### 6.3 3NF Compliance

- **1NF**: No JSONB blobs for structural data. ROS cues normalized. Department statuses are rows.
- **2NF**: All non-key attrs depend on full PK. Composite keys used where appropriate.
- **3NF**: Names resolved via FK (not stored). Financial totals computed from snapshots, not persisted.
- **SSOT**: `events.run_of_show` JSONB deprecated → normalized `ros_cues`.

---

## 7. Command & Control Hierarchy Schema

### 7.1 Command Position Types

**L1 (Command):** event_commander, safety_officer, financial_officer, client_liaison  
**L2 (Tactical):** stage_manager, technical_director, logistics_lead, foh_manager, production_coordinator  
**L3 (Operations):** audio_lead, lighting_lead, video_lead, rigging_lead, stage_lead, crew_lead, security_lead, medical_lead, catering_lead, custom

### 7.2 Escalation Logic

```
Severity 1 (Minor):     Log → Dept Lead reviews → Resolve within shift
Severity 2 (Moderate):  Dept Lead → Prod Coordinator → Resolve within 1hr
Severity 3 (Major):     Event Commander → Response Team → Resolve within 15min
Severity 4 (Critical):  EMERGENCY PROTOCOL → Show Hold/Evacuation/External Services
```

Auto-escalation rules:
- S2 unresolved > 60 min → auto-escalate to S3
- S3 unresolved > 15 min → auto-escalate to S4
- Medical incident → auto-notify Safety Officer + Medical Lead
- Crowd > 90% capacity → auto-notify FOH + Safety
- Crowd > 95% capacity → auto-notify Commander
- 2+ incidents in 30 min → auto-notify Commander
- Critical equipment failed → auto-notify Technical Director

---

## 8. Incident Escalation Matrix

### 8.1 Severity Definitions

| Severity | Impact | Response Time | Responders |
|----------|--------|-------------|------------|
| 1 — Minor | Informational | Within shift | Dept lead |
| 2 — Moderate | Operational impact | < 1 hour | Dept lead + prod coordinator |
| 3 — Major | Show-impacting | < 15 min | Commander + relevant L2s |
| 4 — Critical | Life-safety/show-stopping | < 2 min | All L1, show hold authority |

### 8.2 Extended Incident Fields for Live Phase

Added to existing `incidents` table via ALTER:
- `live_event_id` FK → live_event_instances
- `event_phase` (load_in, setup, rehearsal, live, strike)
- `response_team_ids` UUID[]
- `first_responder_id` FK profiles
- `response_time_seconds` INTEGER
- `escalation_level` INTEGER (1-4)
- `auto_escalated` BOOLEAN
- `environmental_conditions` JSONB
- `medical_transport` BOOLEAN
- `transport_destination` TEXT
- `osha_reportable` BOOLEAN
- `witness_statements` JSONB
- `evidence_urls` TEXT[]
- `insurance_notified` BOOLEAN
- `insurance_notified_at` TIMESTAMPTZ

---

## 9. Real-Time Dashboard Data Schema

### 9.1 Role-Based Dashboards

**Event Commander:** Health score, phase, dept grid, incidents, crowd, finance, next 3 cues, weather, escalation queue  
**Stage Manager:** Full cue list, current+next cue (hero), dept readiness, crew positions, hold/resume  
**Safety Officer:** Incidents (safety/medical/security), crowd density, weather, gates, medical team, emergency buttons  
**FOH Manager:** Zone crowd flow, entry throughput, VIP board, guest incidents, F&B/merch, accessibility queue  
**Financial Officer:** Budget vs spend, OT alerts, approvals, COs, revenue, margin, vendor spend  
**Crew Lead (mobile):** Team status, assignment queue, task tracker, clock in/out, incident report, radio ref

### 9.2 Data Refresh Strategy

| Data | Refresh | Offline |
|------|---------|---------|
| Event state | On transition | Queue; sync on reconnect |
| Dept status | 5 min / on change | Show last known |
| ROS cues | On cue call | Pre-cached list; sync calls |
| Incidents | On event | Create offline; sync |
| Crowd | 5 min | Buffer; bulk sync |
| Financial | 15 min | Show last snapshot |
| Environmental | 5 min | Buffer; bulk sync |
| Comms | On entry | Queue; sync |

---

## 10. Role-Based Interface Model

### 10.1 Interface Principles

| Principle | Implementation |
|-----------|---------------|
| Glanceable | Critical status visible < 2 sec, no scrolling |
| One-tap actions | Emergency = single tap + confirm |
| Fat-finger safe | Min 48px touch targets; destructive = drag-to-confirm |
| Dark mode default | All live ops interfaces dark theme |
| High contrast | RAG uses colorblind-safe palette + icon differentiation |
| Audio-aware | Critical alerts include haptic for loud environments |
| Lockable | Dashboards pinnable to prevent accidental nav |

---

## 11. Pre-Live Activation (Onsite Readiness)

### 11.1 Readiness Gates

| Gate | Name | Verifier | Blocking? |
|------|------|----------|-----------|
| G1 | Site Access Confirmed | Logistics Lead | Yes |
| G2 | Permits Verified | Prod Coordinator | Yes |
| G3 | Insurance on File | Financial Officer | Yes |
| G4 | Load-In Complete | Logistics Lead | Yes |
| G5 | Engineering Inspection | Safety Officer | Yes |
| G6 | Safety Briefing Complete | Safety Officer | Yes |
| G7 | Medical Team On Site | Safety Officer | Yes |
| G8 | Technical Rehearsal | Stage Manager | Configurable |
| G9 | Department Readiness | All L2 Leads | Yes |
| G10 | Final Walkthrough | Event Commander | Yes |

### 11.2 Load-In Sequence (dependency-ordered)

T-24h: Advance team → T-12h: Power → T-10h: Rigging → T-8h: Staging → T-6h: AV/Lighting → T-4h: Video → T-3h: Sound → T-2h: Props → T-1h: FOH → T-0: Rehearsal

Modeled as `strike_sequences` rows with `direction = 'load_in' | 'strike'`, sequence order, dependencies, estimated/actual times.

### 11.3 Credential Verification

Scan badge → match crew_member → verify certs + background + drug test → all clear → check in → assign radio + zone. Flag failures to Safety Officer.

---

## 12. Live Show Operations Model

### 12.1 Normalized ROS Schema

`ros_cues` replaces `events.run_of_show` JSONB:
- `sequence` INTEGER, `cue_number` TEXT, `scheduled_time` TIMESTAMPTZ
- `actual_time`, `duration_seconds`, `actual_duration_seconds`
- `title`, `department`, `responsible_id`, `called_by_id`
- `status`: pending | standby | called | in_progress | completed | skipped | held
- `dependencies` UUID[], `is_critical` BOOLEAN, `variance_seconds` (computed)

### 12.2 Department Status Values

not_checked_in (gray) → setting_up (blue) → ready (green) → active (green pulse) → issue (yellow) → blocked (red) → striking (orange) → wrapped (gray)

### 12.3 Vendor Live Tracking

- On-time arrival: check-ins vs scheduled (alert > 30 min late)
- Equipment condition: check-in assessment
- Staff count vs contracted (alert < 90%)
- SLA adherence: per-contract thresholds
- Response time: comm log request → response (alert > 15 min)

---

## 13. Guest Experience & Front-of-House

### 13.1 FOH Zone Types

entry | general | vip | stage | fb | merch | amenity | medical | parking | accessibility

### 13.2 Zone Readings (periodic snapshots)

occupancy_count, entry_rate, exit_rate, queue_length, avg_wait_minutes, sales_amount, incidents_count, notes — per zone per timestamp.

### 13.3 VIP Management

name, affiliation, tier (bronze/silver/gold/platinum), arrival times, escort_id, zone_access, dietary, special_requests, status (expected/arrived/in_venue/departed).

### 13.4 Guest Incidents

Separate from ops incidents: type (complaint/injury/lost_item/accessibility/disturbance/ejection), zone_id, severity, resolution, escalated_to_incident FK, compensation_offered.

---

## 14. Asset & Infrastructure Monitoring

### 14.1 Equipment Check-In Flow

Scan barcode → match asset → condition assessment + quantity check + cert check → pass → check in → assign zone/dept. Fail → flag + photo → damage record.

### 14.2 Live Equipment Status

checked_in → deployed → standby → issue_reported → failed → being_repaired → struck → loaded_out

### 14.3 Power Monitoring

Total load (amps), phase balance, generator fuel, gen run hours, UPS battery, ground faults, panel temperature — alerts at configurable thresholds.

### 14.4 Infrastructure Checks

Structural connections (4hr), stage deck (between shows), barriers (2hr), emergency exits (1hr), fire extinguishers (pre-show), ADA compliance (pre-doors).

---

## 15. Risk & Incident Management

### 15.1 Real-Time Risk Score (0-100)

| Factor | Weight | Source |
|--------|--------|--------|
| Active incidents | 25% | Severity-weighted count |
| Weather severity | 20% | Environmental readings |
| Crowd density | 20% | Max zone % of capacity |
| Equipment failures | 15% | Failed/total ratio |
| Crew fatigue | 10% | Hours worked vs threshold |
| Financial stress | 10% | Burn rate vs plan |

0-25 Low (green), 26-50 Moderate (yellow), 51-75 High (orange), 76-100 Critical (red).

### 15.2 Weather Contingency

Advisory → log + notify Safety. Watch → notify Command + prepare contingency. Warning → Commander briefed, evaluate hold. Imminent → auto SHOW HOLD + evacuation protocol.

---

## 16. Financial Live-Burn Tracking Model

### 16.1 Snapshot Fields (every 15 min)

budget_total, spent_to_date, committed_not_spent, labor_regular, labor_overtime, labor_double_time, equipment_cost, vendor_cost, onsite_procurement, revenue_tickets, revenue_fb, revenue_merch, revenue_other, margin_percent, burn_rate_per_hour, projected_total.

### 16.2 OT Alerts

Advisory: any crew > 8 hrs. Warning: any crew > 10 hrs OR OT > 10% labor budget. Alert: > 12 hrs OR > 20%. Critical: > 30%.

### 16.3 Onsite Procurement

< $100: Dept Lead. $100-500: Any L2. $500-5K: Financial Officer + PO. > $5K: Commander + PO.

### 16.4 Margin Erosion Alerts

Budget > 85% with > 20% show remaining. Labor > 110% budget. Vendor > contracted. Change order pending without CO. Revenue < 80% projected.

---

## 17. Strike & Demobilization Workflow

### 17.1 Strike Sequence (reverse of load-in)

S+0h: Wrap + walkthrough → S+0.5h: FOH → S+1h: Props → S+1.5h: Sound → S+2h: Video → S+3h: AV → S+4h: Staging → S+6h: Rigging → S+8h: Power → S+10h: Final sweep + site handback.

### 17.2 Asset Reconciliation

For each assigned asset: locate → assess condition → compare to check-in → if damaged: photo + description + cost estimate + vendor/incident link → if missing: last known location + search status + replacement cost + insurance recommendation.

### 17.3 Vendor Checkout

Equipment count reconciliation, condition comparison, overage/shortage documentation, COI return confirmation, performance score capture, sign-off by Logistics Lead.

### 17.4 Post-Event Report (auto-generated)

Attendance metrics, financial summary, incident summary, equipment utilization, vendor performance, timeline adherence, risk events, lessons learned, recommendations.

---

## 18. Operational KPI Model

### 18.1 Real-Time KPIs (during live)

| KPI | Target | Source |
|-----|--------|--------|
| Readiness gate completion | 100% before LIVE | readiness_gates |
| ROS timing variance | ±5 min per cue | ros_cues |
| Dept readiness | All green before doors | department_statuses |
| Incident response time | S4 < 2 min, S3 < 15 min | incidents |
| Crew utilization | > 85% | live_crew_assignments |
| Equipment uptime | > 98% | equipment_check_ins |
| Crowd throughput | Per-venue target | foh_zone_readings |
| Budget adherence | ±10% of plan | live_financial_snapshots |

### 18.2 Post-Event KPIs

| KPI | Source |
|-----|--------|
| Asset return rate | asset_reconciliation_items |
| Damage rate | asset_reconciliation_items |
| Final margin | live_financial_snapshots (final) |
| Incident rate per 1000 guests | incidents + attendance |
| Vendor performance score | Composite from check-ins, SLA, condition |
| Strike completion time vs plan | strike_sequences |
| Guest satisfaction (if captured) | guest_incidents inverse + feedback |

---

## 19. Offline-First & Low-Connectivity Architecture

### 19.1 Design Principles

- **Local-first storage**: All field devices maintain local SQLite/IndexedDB cache
- **Optimistic writes**: Actions succeed locally immediately, sync when connected
- **Conflict resolution**: Last-write-wins for non-critical fields; manual review queue for critical (incident severity, financial approvals, event state transitions)
- **Pre-caching**: Full ROS cue list, crew roster, asset inventory, and command hierarchy cached before going onsite
- **Delta sync**: Only changed records transmitted; compressed payloads
- **Connectivity indicator**: Always-visible connection status with last-sync timestamp

### 19.2 Sync Priority

| Priority | Data Type | Max Stale |
|----------|-----------|-----------|
| P0 | Event state transitions | 0 (block until synced) |
| P1 | Incidents (S3+) | 30 sec |
| P2 | Incidents (S1-S2), crew check-in/out | 2 min |
| P3 | ROS cue calls, dept status | 5 min |
| P4 | Financial, environmental, crowd | 15 min |
| P5 | Comm log, notes | 30 min |

---

## 20. UI/UX Simplification for High-Pressure Environments

### 20.1 Cognitive Load Reduction

| Strategy | Implementation |
|----------|---------------|
| **Progressive disclosure** | Default: summary → tap for detail → tap for action |
| **Role filtering** | Each role sees only their domain's data |
| **Status-first layout** | RAG indicators before text; numbers before charts |
| **Reduced choices** | Max 3-4 actions visible at any time |
| **Consistent patterns** | Same interaction model across all live ops screens |
| **Pre-computed summaries** | "3 of 10 gates complete" not raw data |

### 20.2 Emergency UI Mode

When risk score > 75 OR Severity 4 incident active:
- Non-essential UI elements hidden
- Emergency actions promoted to top
- Background dims; critical info highlighted
- Audio/haptic alert triggered
- Auto-switch to relevant dashboard (Safety Officer → incident, Commander → decision)

### 20.3 Performance Targets

| Metric | Target |
|--------|--------|
| Initial load (cached) | < 500ms |
| State transition render | < 100ms |
| Action to confirmation | < 200ms |
| Offline action feedback | < 50ms |
| Sync indicator update | < 1 sec |

---

## 21. Automation & AI Augmentation Roadmap

### Phase 0 — Rule-Based (Migration 016)

1. Auto-escalation on unresolved incidents
2. OT threshold alerts
3. Readiness gate blocking enforcement
4. Crowd capacity alerts
5. Weather alert integration
6. Equipment failure notifications
7. Budget threshold alerts
8. Crew fatigue warnings
9. Auto-populate strike sequence from load-in (reverse)
10. Auto-generate post-event report skeleton

### Phase 1 — Smart Automations

1. Predictive OT calculations based on current pace
2. Vendor performance scoring from live data
3. Intelligent crew redeployment suggestions
4. Smart alert batching (reduce noise)
5. Automated financial reconciliation (PO → expense → budget)
6. Pattern-based incident risk prediction

### Phase 2 — AI-Powered

1. AI crowd density estimation from camera feeds
2. Intelligent incident categorization from free-text reports
3. Natural language comm log search
4. Automated root cause analysis from incident patterns
5. Predictive equipment failure from sensor data
6. AI-generated post-event insights

### Phase 3 — Advanced AI

1. Real-time margin erosion forecasting
2. Dynamic crew scheduling optimization
3. Predictive guest experience scoring
4. Automated compliance documentation generation
5. Multi-event resource optimization across simultaneous activations

---

## 22. Implementation Roadmap

### Phase 0 — Foundation (Sprint 1-2)

- Migration 016: Core live operations tables
- TypeScript types for all new entities
- Domain config + ui-variants + RBAC updates
- Extend incidents table with live-phase fields

### Phase 1 — Command & Show (Sprint 3-4)

- Live Operations Center page (Commander dashboard)
- Run-of-Show execution page (Stage Manager view)
- Readiness gate management
- Communication log + radio mapping
- Department status board

### Phase 2 — Field Operations (Sprint 5-6)

- Mobile crew check-in/out
- Equipment check-in with condition capture
- Live crew assignment/reassignment
- Incident reporting (mobile)
- Offline-first data layer

### Phase 3 — FOH & Finance (Sprint 7-8)

- FOH zone management + crowd tracking
- VIP management
- Guest incident logging
- Live financial dashboard
- OT alerts and onsite procurement

### Phase 4 — Strike & Analytics (Sprint 9-10)

- Strike sequence management
- Asset reconciliation workflow
- Post-event report generation
- Operational KPI dashboards
- Vendor performance scorecards

### Phase 5 — AI & Optimization (Sprint 11-12)

- Predictive risk scoring
- Crowd density AI
- Intelligent incident classification
- Dynamic crew optimization
- Multi-event command center
