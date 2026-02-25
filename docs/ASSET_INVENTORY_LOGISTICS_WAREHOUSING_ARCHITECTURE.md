# Asset, Inventory, Logistics & Warehousing Lifecycle Architecture

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current-State Workflow Maps](#2-current-state-workflow-maps)
3. [Gap Analysis](#3-gap-analysis)
4. [Asset Classification & Master Data Taxonomy](#4-asset-classification--master-data-taxonomy)
5. [Future-State System Architecture](#5-future-state-system-architecture)
6. [3NF-Compliant Entity Relationship Model](#6-3nf-compliant-entity-relationship-model)
7. [Asset State Transition Model](#7-asset-state-transition-model)
8. [Warehouse Hierarchy & Bin Management Schema](#8-warehouse-hierarchy--bin-management-schema)
9. [Inventory Reservation & Allocation Logic](#9-inventory-reservation--allocation-logic)
10. [Logistics Event Tracking Model](#10-logistics-event-tracking-model)
11. [Maintenance & Depreciation Lifecycle Model](#11-maintenance--depreciation-lifecycle-model)
12. [Damage, Loss & Shrinkage Mitigation Framework](#12-damage-loss--shrinkage-mitigation-framework)
13. [Live Asset Deployment Model](#13-live-asset-deployment-model)
14. [Operational KPI Framework](#14-operational-kpi-framework)
15. [UI/UX Simplification Principles](#15-uiux-simplification-principles)
16. [Automation & AI Augmentation Roadmap](#16-automation--ai-augmentation-roadmap)
17. [Implementation Roadmap](#17-implementation-roadmap)

---

## 1. Executive Summary

### 1.1 Scope

This document defines the target-state architecture for unified physical asset, consumable inventory, rental equipment, logistics, and warehousing management across multi-project, multi-location, and multi-market experiential production environments.

### 1.2 Critical Findings

| # | Finding | Severity | Current Impact |
|---|---------|----------|----------------|
| F1 | **No warehouse hierarchy** — flat records with JSONB zones; no bins/racks | Critical | Cannot physically locate items within warehouse |
| F2 | **Asset master conflates serialized and non-serialized** — no shared taxonomy between `assets` and `consumables` | Critical | Duplicate classification; no unified view |
| F3 | **No reservation locking** — `asset_assignments` has no concurrency guard | High | Double-booking risk |
| F4 | **Shipment items stored as JSONB** — no FK linkage to assets/consumables | High | Cannot reconcile shipped vs arrived |
| F5 | **No maintenance scheduling engine** — history only, no preventive triggers | High | Reactive-only maintenance |
| F6 | **No depreciation model** — price fields exist but no schedule/method | High | Financial reporting gap |
| F7 | **No kit/bundle abstraction** — no logical grouping for deployment | Medium | Manual tracking; packing errors |
| F8 | **No barcode/RFID scan event log** — barcodes as text, no audit trail | Medium | No chain-of-custody proof |
| F9 | **No cycle count / audit workflow** | Medium | Inventory accuracy degrades |
| F10 | **No cross-dock / staging logic** | Medium | Load-in delays |
| F11 | **Vehicles disconnected from logistics** — no capacity planning | Medium | Fleet underutilized |
| F12 | **No customs/international logistics support** | Low | Blocks international expansion |

### 1.3 Recommendation Matrix

| Priority | Action | New Tables | Effort |
|----------|--------|-----------|--------|
| **P0** | Warehouse hierarchy (zones → locations) | `warehouse_zones`, `warehouse_locations` | 2d |
| **P0** | Reservation locking with conflict detection | `inventory_reservations` | 2d |
| **P0** | Structured shipment items with FK linkage | `shipment_items` | 1d |
| **P1** | Scan event log (barcode/RFID) | `scan_events` | 1d |
| **P1** | Kit/bundle management | `kits`, `kit_items` | 2d |
| **P1** | Maintenance scheduling engine | `maintenance_schedules` | 2d |
| **P1** | Depreciation schedules | `depreciation_schedules` | 1d |
| **P1** | Cycle count / audit workflow | `inventory_audits`, `audit_count_items` | 2d |
| **P2** | Load planning & manifest | `load_plans`, `load_plan_items` | 2d |
| **P2** | Logistics events (tracking milestones) | `logistics_events` | 1d |
| **P2** | Damage & incident cross-reference | `asset_damage_reports` | 1d |
| **P2** | Customs & international fields | Extend `shipments` | 1d |
| **P3** | Vehicle fleet enhancement | Extend `vehicles` | 1d |
| **P3** | AI-driven allocation & forecasting | Application layer | Ongoing |

---

## 2. Current-State Workflow Maps

### 2.1 Procurement → Receiving → Storage

```
Vendor Sourcing → RFQ → PO Issued → Shipment Arrives
                                          │
                                   ┌──────┴──────┐
                                   ▼              ▼
                            Quality Check    Goods Receipt
                            (NOT MODELED)    (Migration 015)
                                   │
                                   ▼
                            Asset Tagged (barcode text) → Stored at Location (TEXT field only)
```

**Gaps:** No structured receiving workflow. Storage assignment is free-text — not linked to warehouse bin.

### 2.2 Storage → Allocation → Deployment

```
Project → Asset Needs (manual) → asset_assignments (reserved)
  → Check-Out (checked_out) → Loaded on Shipment (JSONB)
  → Delivered → In Use → Strike → Return → Returned
```

**Gaps:** No reservation conflict detection. No on-site verification scan. No damage capture at strike. Shipment items unstructured.

### 2.3 Maintenance Lifecycle

```
Issue Reported → maintenance_records created → Work Performed → next_due_date (optional)
```

**Gaps:** No preventive scheduler. No warranty workflow. No disposal/retirement path.

### 2.4 Warehousing Operations

```
Warehouse (flat record) → zones: JSONB array → No further hierarchy
```

**Gaps:** No bin/rack/aisle structure. No capacity tracking. No staging workflow.

---

## 3. Gap Analysis

### 3.1 SSOT Violations (7)

| # | Violation | Impact |
|---|-----------|--------|
| V1 | Asset location as text AND FK (`assets.location` + `assets.current_location_id`) | Contradictory data |
| V2 | Warehouse zones in JSONB, not relational | Cannot query/index/FK zones |
| V3 | Shipment items in JSONB | Cannot reconcile against asset records |
| V4 | Asset classification split: `assets.category` vs `consumables.category` | No unified taxonomy |
| V5 | Vehicle driver as denormalized text | Out of sync with profiles |
| V6 | Condition tracked on assignment AND asset | Ambiguous authority |
| V7 | Budget category for equipment disconnected from asset registry | Cost attribution gap |

### 3.2 Inventory Risks (5)

| # | Risk |
|---|------|
| R1 | Phantom inventory — JSONB shipments don't update asset location |
| R2 | Overbooking — no overlap check on asset_assignments |
| R3 | Stale stock — consumables.quantity_on_hand requires manual decrement |
| R4 | Orphaned reservations — no expiry on status=reserved |
| R5 | Count drift — no cycle count mechanism |

### 3.3 Manual Bottlenecks (6)

Post-event reconciliation, rental return validation, cross-project availability, warehouse capacity planning, maintenance scheduling, depreciation calculation — all manual/spreadsheet.

### 3.4 Real-Time Visibility Gaps (5)

No live asset location, no availability forecast, no load capacity utilization, no warehouse utilization metrics, no shrinkage detection.

### 3.5 Logistics Gaps (4)

No load planning, no load-in/load-out sequencing, no cross-dock logic, no reverse logistics workflow.

---

## 4. Asset Classification & Master Data Taxonomy

### 4.1 Unified Classification

```
L1: Asset Class
├── capital_equipment    — Serialized, depreciable, owned
├── rental_equipment     — Serialized, vendor-owned, time-bound
├── consumable           — Non-serialized, bulk-tracked
├── tool                 — Serialized or non-serialized, reusable
├── safety_equipment     — Certification-required
├── scenic_element       — Project-fabricated, may be reusable
├── technology           — Fast-depreciation
├── vehicle              — Registered, insured
└── vendor_managed       — Consignment

L2: Category (existing asset_category enum)
L3: Subcategory (free text)
```

### 4.2 Serialized vs Non-Serialized

| Property | Serialized | Non-Serialized |
|----------|-----------|----------------|
| Tracking | Individual unit | Quantity on hand |
| Identity | Unique serial/barcode | SKU-level |
| Assignment | 1:1 to project | Quantity allocated |
| Depreciation | Per-unit schedule | Aggregate write-off |

### 4.3 SKU Structure

```
[CATEGORY]-[SUBCATEGORY]-[VARIANT]-[SEQUENCE]
Example: AUD-MXR-SQ7-001, CON-TPE-GAF-BLK
```

### 4.4 Barcode / RFID Strategy

| Method | Use Case |
|--------|----------|
| QR Code | All serialized assets — encodes asset URL |
| 1D Barcode | Legacy compatibility — SKU or serial |
| RFID (UHF) | High-value touring inventory |
| NFC | Safety equipment certification |

---

## 5. Future-State System Architecture

### 5.1 Three-Layer Architecture

- **Master Data:** assets, consumables, kits, warehouses, warehouse_zones, warehouse_locations, vehicles, maintenance_schedules, depreciation_schedules
- **Transactional:** inventory_reservations, asset_assignments, consumable_usage, shipment_items, load_plans, load_plan_items, maintenance_records
- **Audit/History:** scan_events, logistics_events, asset_damage_reports, inventory_audits, audit_count_items, activity_log

### 5.2 Existing Table Modifications

| Table | New Columns | Purpose |
|-------|------------|---------|
| `assets` | `sku`, `asset_class`, `is_serialized`, `rfid_tag`, `warehouse_location_id`, `depreciation_schedule_id`, `disposal_date`, `disposal_method`, `disposal_value`, `weight`, `weight_unit` | Classification, location, lifecycle |
| `consumables` | `asset_class`, `warehouse_location_id`, `lot_number`, `batch_number`, `expiry_date`, `is_hazardous` | Taxonomy, storage, lot tracking |
| `vehicles` | `vin`, `registration_expiry`, `insurance_expiry`, `mileage`, `fuel_type`, `max_payload_weight`, `max_payload_unit`, `cargo_length`, `cargo_width`, `cargo_height`, `dimension_unit`, `maintenance_schedule_id` | Fleet lifecycle, load capacity |
| `warehouses` | `coordinates`, `loading_docks`, `operating_hours`, `contact_phone`, `contact_email` | Operational fields |
| `shipments` | `customs_declaration_number`, `hs_codes`, `export_license`, `incoterms`, `declared_value`, `insurance_value` | International logistics |
| `maintenance_records` | `maintenance_schedule_id`, `warranty_claim`, `warranty_claim_number`, `parts_used`, `downtime_hours` | Schedule linkage, warranty |

---

## 6. 3NF-Compliant Entity Relationship Model

### 6.1 New Entities Summary

| Entity | Purpose | Key FKs |
|--------|---------|---------|
| `warehouse_zones` | Named areas within warehouse | warehouse_id |
| `warehouse_locations` | Addressable positions (aisle-rack-bin) | zone_id |
| `inventory_reservations` | Time-bound allocation locks | asset_id/consumable_id, project_id |
| `shipment_items` | Structured shipment contents | shipment_id, asset_id/consumable_id/kit_id |
| `kits` | Logical item groupings | org_id |
| `kit_items` | Kit contents | kit_id, asset_id/consumable_id |
| `scan_events` | Barcode/RFID audit trail (immutable) | asset_id/consumable_id/kit_id |
| `load_plans` | Capacity-planned vehicle loads | shipment_id, vehicle_id |
| `load_plan_items` | Ordered loading sequence | load_plan_id, shipment_item_id |
| `logistics_events` | Shipment tracking milestones | shipment_id |
| `asset_damage_reports` | Damage/loss records | asset_id, incident_id, project_id |
| `maintenance_schedules` | Recurring preventive maintenance | asset_category (nullable) |
| `depreciation_schedules` | Financial depreciation rules | asset_id, gl_account_id |
| `inventory_audits` | Cycle count / audit runs | warehouse_id, zone_id |
| `audit_count_items` | Individual count entries | audit_id, asset_id/consumable_id |

### 6.2 7W Coverage

All 15 new entities achieve 5/7 or better Who/What/When/Where/Why/How/If-Then coverage. `scan_events`, `asset_damage_reports`, `inventory_audits`, and `load_plans` achieve 7/7.

---

## 7. Asset State Transition Model

### 7.1 Serialized Asset States

```
ORDERED → RECEIVED → AVAILABLE ⇄ RESERVED → CHECKED_OUT → IN_TRANSIT
  → ON_SITE → IN_USE → RETURNING → RETURNED → AVAILABLE (cycle)
                                        │
                                        ▼
                            DAMAGED → MAINTENANCE → AVAILABLE
                                        │
                                        ▼
                                    RETIRED → DISPOSED/SOLD/SCRAPPED
```

### 7.2 Key Transition Rules

| Transition | Trigger | Validation |
|-----------|---------|-----------|
| AVAILABLE → RESERVED | Reservation created | No conflicting confirmed reservation |
| RESERVED → CHECKED_OUT | Check-out scan | Reservation exists for asset + project |
| CHECKED_OUT → IN_TRANSIT | Added to shipment_items | Shipment picked_up/in_transit |
| IN_TRANSIT → ON_SITE | Verify scan at destination | Shipment delivered |
| IN_USE → RETURNING | Strike scan | Project in strike/load_out phase |
| RETURNING → RETURNED | Warehouse receive scan | Condition assessed |
| RETURNED → AVAILABLE | Post-return QA passed | No pending maintenance |
| RETURNED → MAINTENANCE | Condition = needs_repair | Maintenance record created |
| ANY → RETIRED | End of useful life | Disposal method recorded |

### 7.3 Consumable States

```
ORDERED → RECEIVED → IN_STOCK → ALLOCATED → CONSUMED
                        ↓
                   LOW_STOCK → REORDER_TRIGGERED → ORDERED (cycle)
```

---

## 8. Warehouse Hierarchy & Bin Management

### 8.1 Physical Hierarchy

```
Organization → Warehouse → Zone → Location (Aisle-Rack-Bin) → Item
```

### 8.2 Zone Types

`receiving`, `storage`, `staging_outbound`, `staging_inbound`, `maintenance`, `quarantine`, `hazmat`, `outdoor`, `cold_storage`, `secure`

### 8.3 Location Addressing

Format: `[AISLE]-[RACK]-[BIN]` (e.g., `A-03-B`)

### 8.4 Capacity Model

- Location-level: `max_weight`, `max_dimensions` (JSONB), `is_occupied`
- Zone-level: `capacity_units` (total slots), `capacity_used` (trigger-maintained)

---

## 9. Inventory Reservation & Allocation Logic

### 9.1 Reservation Types

- **Hard Reserve** — specific asset by ID, exclusive lock
- **Soft Reserve** — category + quantity, advisory
- **Kit Reserve** — entire kit, exclusive on all items
- **Consumable Reserve** — SKU + quantity decrement

### 9.2 Conflict Detection

Trigger on `inventory_reservations` INSERT blocks overlapping confirmed reservations for same `asset_id` within overlapping date ranges.

### 9.3 Reservation Lifecycle

```
PENDING → CONFIRMED → CHECKED_OUT → RELEASED
  ↓           ↓
CANCELLED   EXPIRED (auto)
```

### 9.4 Allocation Priority

1. Active show dates > rehearsal/prep
2. Earlier reservation timestamp wins
3. Critical path tasks override non-critical
4. Client-facing > internal events
5. Manual override with audit trail

---

## 10. Logistics Event Tracking Model

### 10.1 Shipment Events

```
BOOKED → PICKED_UP → IN_TRANSIT → [CUSTOMS_HOLD → CUSTOMS_CLEARED]
  → OUT_FOR_DELIVERY → DELIVERED → [DAMAGE_REPORTED]
```

### 10.2 Load Planning

```
Shipment (what) → Load Plan (how, which truck) → Load Plan Items (order + position)
```

`load_plans.utilization_percent` = `total_weight / weight_capacity × 100`

### 10.3 Load-In/Load-Out Sequencing

`load_plan_items.load_sequence` — lower loads first (back of truck), higher loads last (first off). `position_notes` for physical placement.

---

## 11. Maintenance & Depreciation Lifecycle

### 11.1 Preventive Maintenance

| Frequency Type | Example |
|---------------|---------|
| `calendar` | Inspect every 90 days |
| `usage_hours` | Service after 500 hours |
| `usage_miles` | Oil change every 5,000 miles |
| `event_count` | Full service every 10 deployments |

### 11.2 Depreciation Methods

| Method | Best For |
|--------|----------|
| Straight Line | General equipment |
| Declining Balance | Technology |
| Units of Production | Vehicles |
| Sum of Years | Heavy equipment |

### 11.3 Retirement & Disposal

Methods: `sold`, `donated`, `scrapped`, `returned_to_vendor`, `transferred`, `insurance_claim`

---

## 12. Damage, Loss & Shrinkage Mitigation

### 12.1 Capture Points

Receiving, Check-Out, In Transit, On Site, Strike, Return — each generates scan_events and optional asset_damage_reports.

### 12.2 Shrinkage Detection

- Cycle counts via `inventory_audits`
- Shipment reconciliation (`received_quantity` vs `quantity`)
- Scan gap analysis (check-out without check-in)
- Value threshold alerts

---

## 13. Live Asset Deployment Model

### 13.1 Full Flow

```
Project Plan → Reserve → Availability Check → Confirm → Kit Assembly
  → Check-Out Scan → Load Plan → Ship → On-Site Verify → Deploy
  → Live Ops → Strike → Damage Assessment → Return Ship
  → Warehouse Receive → Reconcile → Available
```

### 13.2 On-Site Verification

Scan each item → compare against shipment_items → flag missing/damaged → update location.

### 13.3 Rental Return Validation

Track return dates → daily alerts → condition comparison → damage delta → vendor communication.

---

## 14. Operational KPI Framework

### 14.1 Asset Utilization

- **Utilization Rate**: Days deployed / Days available (target > 60%)
- **Idle Time**: Days in warehouse with no reservation (target < 30d)
- **Turn Rate**: Deployments per asset per quarter (target > 2)

### 14.2 Inventory Health

- **Accuracy**: |System - Physical| / System (target > 98%)
- **Shrinkage Rate**: Lost value / Total value (target < 1%)
- **Stockout Rate**: Incidents / Requests (target < 2%)

### 14.3 Warehouse Efficiency

- **Space Utilization**: Occupied / Total locations (target 70-85%)
- **Receiving Cycle Time**: Delivery to put-away (target < 4h)
- **Pick Accuracy**: Correct picks / Total (target > 99%)

### 14.4 Logistics Performance

- **On-Time Delivery**: target > 95%
- **Load Utilization**: target > 75%
- **Damage Rate**: target < 2%

### 14.5 Maintenance Health

- **PM Compliance**: On-time PMs / Scheduled (target > 90%)
- **Asset Availability**: (Total - Maintenance hours) / Total (target > 95%)

---

## 15. UI/UX Simplification Principles

### 15.1 Role-Based Views

| Role | Primary View | Key Actions |
|------|-------------|-------------|
| Warehouse Team | Bin map, check-in/out queue | Scan, receive, put-away, pick |
| Logistics Coordinator | Shipment board, load plans | Create shipment, plan loads |
| Producer / PM | Availability calendar, reservations | Reserve, build kits |
| Finance | Depreciation dashboard, valuations | Run depreciation, GL mapping |
| Ops Manager | KPI dashboard, exception alerts | Resolve conflicts, approve disposals |
| Field Crew | Mobile scan interface | Scan verify, report damage |

### 15.2 Progressive Disclosure

L1: Summary + alerts → L2: List/table with status → L3: Full detail + history → L4: Audit trail

### 15.3 Mobile-First Scanning

One-tap scan → asset identified → context menu (check-in, check-out, transfer, damage, verify, count). Offline-capable with queue sync.

### 15.4 Command Bar

`⌘K` → "reserve LED wall for Project Horizon" / "check asset status" / "show maintenance due this week"

---

## 16. Automation & AI Augmentation Roadmap

### 16.1 Phase 0 — Rule-Based (P0-P1)

| # | Automation | Trigger | Action |
|---|-----------|---------|--------|
| A1 | Reservation conflict alert | Overlap detected | Notify both PMs |
| A2 | Low stock reorder | qty ≤ reorder_point | Create purchase requisition |
| A3 | Rental return reminder | 7/3/1 days before due | Notify coordinator |
| A4 | Maintenance due alert | schedule due ≤ NOW()+7d | Create maintenance task |
| A5 | Reservation auto-expiry | past due + not checked out | Expire + notify |
| A6 | Shipment delivery confirm | logistics_event = delivered | Update asset locations |
| A7 | Consumable auto-decrement | consumable_usage INSERT | Decrease quantity_on_hand |
| A8 | Cycle count scheduling | Monthly trigger | Create inventory_audit |

### 16.2 Phase 1 — Smart Automations (P1-P2)

| # | Automation | Capability |
|---|-----------|-----------|
| S1 | Smart reorder quantities | Adjust reorder_quantity based on usage velocity |
| S2 | Predictive availability | Forecast asset availability based on project pipeline |
| S3 | Load optimization | Suggest optimal vehicle assignment based on weight/volume |
| S4 | Maintenance prediction | Predict failures based on usage patterns + condition history |
| S5 | Shrinkage anomaly detection | Flag unusual inventory decrements |
| S6 | Cross-project sharing suggestions | Recommend asset sharing between overlapping projects |

### 16.3 Phase 2 — AI-Augmented (P2-P3)

| # | Capability | Technology |
|---|-----------|-----------|
| AI1 | Image-based condition assessment | Vision AI on damage photos |
| AI2 | Natural language asset search | "Find all LED panels available next week in Brooklyn" |
| AI3 | Route optimization | Multi-stop delivery optimization |
| AI4 | Demand forecasting | Predict inventory needs from project pipeline |
| AI5 | Automated kit composition | Suggest kit contents based on activation type |
| AI6 | Geo-tracking integration | Real-time asset location via GPS/RFID |

---

## 17. Implementation Roadmap

### Phase 0 (Weeks 1-2) — Foundation

- [ ] Migration 016: warehouse_zones, warehouse_locations, inventory_reservations, shipment_items
- [ ] Extend assets, consumables, warehouses with new columns
- [ ] Reservation conflict trigger
- [ ] TypeScript types for all new entities

### Phase 1 (Weeks 3-4) — Core Operations

- [ ] scan_events, kits, kit_items
- [ ] maintenance_schedules, depreciation_schedules
- [ ] inventory_audits, audit_count_items
- [ ] Extend maintenance_records, vehicles

### Phase 2 (Weeks 5-6) — Logistics & Tracking

- [ ] load_plans, load_plan_items, logistics_events
- [ ] asset_damage_reports
- [ ] International logistics fields on shipments
- [ ] Rule-based automations (A1-A8)

### Phase 3 (Weeks 7-8) — Intelligence

- [ ] Smart automations (S1-S6)
- [ ] KPI dashboard views
- [ ] Mobile scanning interface
- [ ] AI capabilities (AI1-AI6) — ongoing

### Design Constraints Compliance

| Constraint | Solution |
|-----------|---------|
| Multi-warehouse | warehouse_zones + warehouse_locations hierarchy |
| National + international | customs fields, HS codes, incoterms on shipments |
| High-volume touring | reservation locking, kit abstraction, load planning |
| Finance integration | depreciation_schedules → gl_accounts, budget attribution |
| Low-connectivity field | Offline scan queue, batch sync |
| No double-booking | Reservation conflict trigger (BEFORE INSERT) |
| Complete auditability | scan_events (immutable), logistics_events, activity_log |
| SSOT discipline | Structured shipment_items, relational warehouse hierarchy |
| Cognitively lightweight | Role-based views, progressive disclosure, mobile-first scan |
| Mobile scanning | QR/barcode scan → context menu, offline capable |
