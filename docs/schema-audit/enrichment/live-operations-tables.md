# Schema Enrichment Report — Live Event Operations Tables

> **Migration Sources:** 020
> **Tables:** live_events, command_positions, readiness_gates, department_statuses, ros_cues, ros_cue_items, comm_channels, comm_log_entries, live_crew_assignments, equipment_check_ins, environmental_readings, live_financial_transactions, foh_zones, vip_guests, guest_incidents, strike_sequences, strike_tasks, asset_reconciliation_items, post_event_reports

---

## live_events (Migration 020)

| Attribute | Value |
|---|---|
| **Migration** | 020 |
| **Route(s)** | events/ (live operations) |
| **Current Columns** | ~20 |
| **Compliance Score** | 90% |

### Assessment

Live event runtime with `event_status` enum (pre_show, doors_open, in_progress, intermission, post_show, emergency, cancelled), venue linkage, capacity tracking, weather status, and command structure. Designed for real-time event management.

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `fire_marshal_capacity` | FT-NUM-001 | INTEGER | Legal occupancy limit; fire code compliance | core |
| `emergency_services_notified` | FT-BOOL-001 | BOOLEAN | Pre-event notification to local EMS/fire/police | core |
| `weather_hold_threshold` | FT-JSON-001 | JSONB | Wind speed/lightning/heat index thresholds for weather holds | core |

### Supabase Realtime Candidates

- `event_status` — **critical** real-time updates for all connected clients
- `weather_status` — safety-critical environmental monitoring
- `current_attendance` — capacity management

---

## command_positions (Migration 020)

| Attribute | Value |
|---|---|
| **Migration** | 020 |
| **Route(s)** | events/ |
| **Compliance Score** | 92% |

### Assessment

ICS-inspired command structure with position hierarchy, radio channel assignment, and activation status. Aligns with NIMS/ICS event management standards. No enrichment needed.

---

## readiness_gates (Migration 020)

| Attribute | Value |
|---|---|
| **Migration** | 020 |
| **Route(s)** | events/ |
| **Compliance Score** | 95% |

### Assessment

Go/no-go decision gates with `gate_status` enum, department sign-offs, and blocker tracking. Critical for "doors open" decisions. Best-in-class design. No enrichment needed.

---

## ros_cues / ros_cue_items (Migration 020)

| Attribute | Value |
|---|---|
| **Migration** | 020 |
| **Route(s)** | events/ (run of show) |
| **Compliance Score** | 90% |

### Assessment

Run-of-show timeline with cue-level sequencing, department assignments, and duration tracking. Links to live events. Well-designed for technical show calling.

### Supabase Realtime Candidates

- `cue_status`, `actual_start_time` — real-time show calling updates

---

## comm_channels / comm_log_entries (Migration 020)

| Attribute | Value |
|---|---|
| **Migration** | 020 |
| **Route(s)** | events/ |
| **Compliance Score** | 88% |

### Assessment

Multi-channel communications (radio, phone, text, app) with log entries for audit trail. Essential for incident documentation and post-event review.

### Gap

Missing `priority_level` on comm_log_entries for emergency message classification.

---

## environmental_readings (Migration 020)

| Attribute | Value |
|---|---|
| **Migration** | 020 |
| **Route(s)** | events/ |
| **Compliance Score** | 90% |

### Assessment

IoT-style environmental monitoring with temperature, humidity, wind speed, noise level, and air quality readings. Location-tagged with timestamps. Essential for outdoor events and OSHA heat illness prevention.

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `wet_bulb_globe_temp` | FT-NUM-002 | NUMERIC(5,2) | OSHA/NIOSH WBGT heat stress index; worker safety standard | core |

---

## foh_zones / vip_guests / guest_incidents (Migration 020)

| Attribute | Value |
|---|---|
| **Migration** | 020 |
| **Route(s)** | events/ |
| **Compliance Score** | 85% |

### Assessment

Front-of-house zone management with capacity, credential levels, and VIP guest tracking. Guest incident logging with severity classification and resolution. Adequate for event operations.

### PII Classification (vip_guests)

- `name`, `email`, `phone` — **direct PII**; requires GDPR consent and data retention policy
- `dietary_restrictions`, `medical_notes` — **sensitive PII**; enterprise tier, audit logged

---

## strike_sequences / strike_tasks (Migration 020)

| Attribute | Value |
|---|---|
| **Migration** | 020 |
| **Route(s)** | events/ (post-event) |
| **Compliance Score** | 90% |

### Assessment

Load-out sequencing with priority ordering, department assignment, and completion tracking. Links to live events and projects. Well-designed for reverse-logistics coordination. No enrichment needed.

---

## asset_reconciliation_items (Migration 020)

| Attribute | Value |
|---|---|
| **Migration** | 020 |
| **Route(s)** | events/, assets/ |
| **Compliance Score** | 90% |

### Assessment

Post-event asset reconciliation with expected vs returned counts, condition assessment, and damage notes. Links to assets and live events. Essential for rental return and loss tracking. No enrichment needed.

---

## post_event_reports (Migration 020)

| Attribute | Value |
|---|---|
| **Migration** | 020 |
| **Route(s)** | events/ |
| **Compliance Score** | 88% |

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `nps_score` | FT-NUM-002 | NUMERIC(3,1) | Net Promoter Score; client satisfaction tracking | pro |
| `carbon_footprint_kg` | FT-NUM-002 | NUMERIC(10,2) | ESG/sustainability reporting; Leave No Trace compliance | enterprise |
