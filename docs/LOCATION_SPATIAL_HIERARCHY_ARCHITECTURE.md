# Location-Based Data Lifecycle & Spatial Hierarchy Architecture

> **Version:** 1.0 | **Date:** 2026-02-25 | **Status:** Architecture Complete — Migration Ready

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current-State Spatial Hierarchy Map](#2-current-state-spatial-hierarchy-map)
3. [Gap Analysis](#3-gap-analysis)
4. [Future-State Location Architecture](#4-future-state-location-architecture)
5. [3NF-Compliant Entity Relationship Model](#5-3nf-compliant-entity-relationship-model)
6. [Spatial Hierarchy & Inheritance Model](#6-spatial-hierarchy--inheritance-model)
7. [Location Master Data Taxonomy](#7-location-master-data-taxonomy)
8. [Location Operational Lifecycle](#8-location-operational-lifecycle)
9. [Location Usage During Projects & Events](#9-location-usage-during-projects--events)
10. [Scheduling & Conflict Detection](#10-scheduling--conflict-detection)
11. [Compliance & Risk Framework](#11-compliance--risk-framework)
12. [Financial & Contractual Dimensions](#12-financial--contractual-dimensions)
13. [Warehousing & Logistics Integration](#13-warehousing--logistics-integration)
14. [Geospatial Integration Model](#14-geospatial-integration-model)
15. [Risk Scoring Framework](#15-risk-scoring-framework)
16. [UI/UX Simplification Principles](#16-uiux-simplification-principles)
17. [Automation & AI Augmentation Roadmap](#17-automation--ai-augmentation-roadmap)
18. [Implementation Roadmap](#18-implementation-roadmap)

---

## 1. Executive Summary

### 1.1 Critical Findings

| # | Finding | Severity |
|---|---------|----------|
| F1 | **Locations are project-scoped** — same venue reused across projects creates duplicates | Critical |
| F2 | **No spatial hierarchy** — flat `locations` table, no parent-child modeling | Critical |
| F3 | **Warehouses are a separate entity** — no shared location master | High |
| F4 | **Warehouse zones stored as JSONB blob** — no referential integrity | High |
| F5 | **No space/room booking system** — `resource_bookings` covers crew only | High |
| F6 | **No compliance attachment to locations** — permits/inspections not linked | High |
| F7 | **No capacity constraint enforcement** — capacity is informational only | Medium |
| F8 | **No event overlay model** — temporary reconfigurations not supported | Medium |
| F9 | **No lease/cost modeling** — `daily_rate` is simplistic | Medium |
| F10 | **No geospatial boundary support** — `coordinates` is a single POINT | Low |
| F11 | **Location type enum too narrow** — missing site, campus, room, zone | Medium |
| F12 | **No accessibility, noise, or curfew attributes** | Medium |

### 1.2 Recommendation Matrix

| Priority | Action | Effort |
|----------|--------|--------|
| **P0** | Decouple locations from projects; create org-level master | Medium |
| **P0** | Add spatial hierarchy (parent_id, depth, path) | Medium |
| **P0** | Extend location taxonomy (20+ types) | Low |
| **P0** | Merge warehouse addresses into location master | Medium |
| **P0** | Create normalized warehouse zones/bins | Medium |
| **P1** | Create `space_bookings` for conflict detection | High |
| **P1** | Create `location_compliance_docs` | Medium |
| **P1** | Create `location_costs` for financial tracking | Medium |
| **P2** | Create `event_space_overlays` for temporary zones | Medium |
| **P2** | Add geospatial boundary support | Medium |
| **P2** | Create `location_inspections` | Low |
| **P3** | GIS integration, interactive floorplans, AI crowd flow | High |

---

## 2. Current-State Spatial Hierarchy Map

### 2.1 Existing Entity Inventory

- **`locations`** (migration 003): Flat, project-scoped via `project_id` FK. 8-value type enum. Inline contact fields. Single POINT coordinates. `daily_rate`/`total_cost` for simple costing. `insurance_required` + `permits_required[]` for basic compliance.
- **`warehouses`** (migration 003): Separate entity. `zones` as JSONB blob. Own address fields. `climate_controlled`, `security_level`. No FK to locations.
- **No** `spaces`, `rooms`, `sites`, `floors`, `zones` tables exist.
- **No** spatial hierarchy (parent_id / depth / path).
- **No** space booking or scheduling conflict detection for physical spaces.

### 2.2 Current FK References to Locations

| Table | Column | Relationship |
|-------|--------|-------------|
| activations | location_id | FK → locations |
| events | location_id | FK → locations |
| tasks | location_id | FK → locations |
| rfqs | delivery_location_id | FK → locations |
| schedule_entries | location_id | FK → locations |
| crew_shifts | location_id | FK → locations |
| consumables | location_id | FK → locations |
| shipments | origin_location_id | FK → locations |
| shipments | destination_location_id | FK → locations |
| incidents | location_id | FK → locations |
| assets | home_location_id | UUID (no FK) |
| assets | current_location_id | UUID (no FK) |

### 2.3 Current Location Type Enum

```sql
CREATE TYPE location_type AS ENUM (
  'venue', 'warehouse', 'office', 'fabrication_shop',
  'staging_area', 'hotel', 'airport', 'other'
);
```

Missing: site, campus, arena, convention_center, park, theater, club, room, space, zone, outdoor_zone, loading_dock, green_room, control_room, exhibit_hall, stage.

---

## 3. Gap Analysis

### 3.1 SSOT Violations (5)

| # | Violation | Location |
|---|-----------|----------|
| V1 | Locations project-scoped — same venue duplicated per project | `locations.project_id` |
| V2 | Warehouses have separate address system | `warehouses` vs `locations` |
| V3 | Warehouse zones denormalized JSONB | `warehouses.zones` |
| V4 | Asset location columns lack FK enforcement | `assets.home_location_id` |
| V5 | `events.specific_location` duplicates spatial data as free-text | `events` |

### 3.2 Missing Spatial Modeling (7)

- G1: No parent-child hierarchy
- G2: No normalized space/room entities
- G3: No floor/level modeling
- G4: No event overlay / temporary zone support
- G5: No M:M between locations and projects
- G6: No capacity inheritance or aggregation
- G7: No geospatial boundary definitions

### 3.3 Missing Compliance Integration (6)

- C1: No permit linkage to locations
- C2: No safety inspection logging
- C3: No fire code capacity enforcement
- C4: No ADA compliance markers
- C5: No noise/curfew restriction modeling
- C6: No environmental classification

### 3.4 Missing Financial Modeling (5)

- F1: No lease agreement tracking
- F2: No utility cost tracking
- F3: No maintenance cost history
- F4: No revenue attribution per space
- F5: No shared cost allocation logic

### 3.5 Missing Operational Capabilities (5)

- O1: No space booking / scheduling system
- O2: No location lifecycle state machine
- O3: No location data versioning
- O4: No dock access / delivery routing
- O5: No crowd flow or staffing zone logic

---

## 4. Future-State Location Architecture

### 4.1 Design Principles

1. **Organization-scoped location master** — locations belong to org, not projects
2. **Recursive spatial hierarchy** — `parent_location_id` enables Site → Venue → Floor → Space → Room
3. **Project-location junction** — M:M replaces current 1:M FK
4. **Unified address model** — warehouses are a location type, not separate entity
5. **Normalized sub-spaces** — zones, bins, rooms are first-class entities
6. **Space booking system** — scheduling conflict detection
7. **Compliance attachment** — permits, inspections, certifications linked
8. **Event overlays** — temporary reconfigurations layered on permanent spaces
9. **Financial attribution** — cost tracking and profitability per location
10. **Geospatial support** — coordinates, boundaries, proximity queries

### 4.2 Entity Architecture

```
LAYER 1: LOCATION MASTER (org-scoped, hierarchical)
  locations (enhanced) — self-referential parent_location_id, extended enum, lifecycle status

LAYER 2: JUNCTION & SCHEDULING
  project_locations (M:M) — role, dates, costs per project
  space_bookings — temporal scheduling + conflict detection
  event_space_overlays — temporary reconfigurations

LAYER 3: COMPLIANCE & FINANCIAL
  location_compliance_docs — permits, certs linked to locations
  location_inspections — safety audit logging
  location_costs — lease, utility, maintenance tracking
  location_contacts — M:M contact model

LAYER 4: WAREHOUSE EXTENSIONS
  warehouse_zones — normalized from JSONB
  warehouse_bins — storage bin positions
```

### 4.3 Hierarchy Examples

```
Campus (site)
├── Building A (venue)
│   ├── Floor 1
│   │   ├── Lobby (space)
│   │   ├── Conference Room A (room)
│   │   └── Conference Room B (room)
│   └── Loading Dock (outdoor_zone)
├── Building B (warehouse)
│   ├── Zone A - Staging (warehouse_zone via warehouse_zones table)
│   └── Zone B - Climate Controlled
└── Parking Lot (outdoor_zone)

Festival Grounds (site)
├── Main Stage Area (venue)
│   ├── Stage (space)
│   └── VIP Section (space)
├── Activation Village (venue)
│   ├── Booth 1 (space) ← event overlay
│   └── Booth 2 (space) ← event overlay
└── Back of House (venue)
    ├── Production Office (room)
    └── Artist Lounge (room)
```

### 4.4 Location Lifecycle State Machine

States: `prospecting → onboarding → active → seasonal | maintenance | reconfiguring → active → archived`

| From | To | Trigger |
|------|----|---------|
| prospecting | onboarding | Initial data captured |
| onboarding | active | Compliance validated |
| active | seasonal | Seasonal closure |
| active | maintenance | Scheduled/emergency maintenance |
| active | reconfiguring | Layout change |
| active | archived | Permanently decommissioned |
| seasonal | active | Season reopening |
| maintenance | active | Maintenance complete |
| reconfiguring | active | Reconfiguration complete |

---

## 5. 3NF-Compliant Entity Relationship Model

### 5.1 Enhanced `locations` Table

New/modified columns on existing table:

| Column | Type | Notes |
|--------|------|-------|
| parent_location_id | UUID FK → locations | **NEW** — self-referential hierarchy |
| hierarchy_depth | INTEGER | **NEW** — 0 for root |
| hierarchy_path | TEXT | **NEW** — materialized path |
| code | TEXT UNIQUE | **NEW** — short code (e.g., "JVT-1A") |
| status | location_status enum | **NEW** — lifecycle state |
| ownership | location_ownership enum | **NEW** — owned/leased/temporary/partner |
| capacity_seated | INTEGER | **NEW** — replaces generic `capacity` |
| capacity_standing | INTEGER | **NEW** |
| capacity_fire_code | INTEGER | **NEW** — legal maximum |
| floor_number | INTEGER | **NEW** — floor within parent |
| boundary | GEOMETRY(POLYGON,4326) | **NEW** — PostGIS boundary (P2) |
| timezone | TEXT | **NEW** — IANA timezone |
| zoning_classification | TEXT | **NEW** — municipal zoning |
| regulatory_jurisdiction | TEXT | **NEW** |
| is_ada_accessible | BOOLEAN | **NEW** |
| ada_notes | TEXT | **NEW** |
| noise_curfew_time | TIME | **NEW** |
| noise_max_db | INTEGER | **NEW** |
| alcohol_license | BOOLEAN | **NEW** |
| outdoor | BOOLEAN | **NEW** |
| climate_controlled | BOOLEAN | **NEW** |
| security_level | TEXT | **NEW** |
| floorplan_asset_id | UUID FK → digital_assets | **NEW** |
| primary_contact_id | UUID FK → contacts | **NEW** |
| manager_id | UUID FK → profiles | **NEW** |

### 5.2 New Tables

**`project_locations`** — M:M junction replacing project_id FK

| Column | Type |
|--------|------|
| id | UUID PK |
| project_id | UUID FK → projects |
| location_id | UUID FK → locations |
| role | project_location_role enum |
| access_start_date, access_end_date | DATE |
| load_in_windows, load_out_windows | JSONB |
| daily_rate, total_cost | NUMERIC(12,2) |
| notes | TEXT |
| organization_id, created_at, updated_at | Standard |

**`space_bookings`** — Space scheduling with conflict detection

| Column | Type |
|--------|------|
| id | UUID PK |
| location_id | UUID FK → locations |
| project_id | UUID FK → projects (optional) |
| event_id | UUID FK → events (optional) |
| activation_id | UUID FK → activations (optional) |
| booked_by | UUID FK → profiles |
| booking_type | space_booking_type enum |
| status | space_booking_status enum |
| start_datetime, end_datetime | TIMESTAMPTZ |
| expected_attendance | INTEGER |
| setup_minutes_before, teardown_minutes_after | INTEGER |
| notes, organization_id, created_by, updated_by, created_at, updated_at | Standard |

**`event_space_overlays`** — Temporary reconfigurations

| Column | Type |
|--------|------|
| id | UUID PK |
| base_location_id | UUID FK → locations |
| overlay_name | TEXT |
| overlay_type | location_type |
| project_id, event_id | UUID FKs |
| capacity_override, square_footage_override | INTEGER |
| layout_asset_id | UUID FK → digital_assets |
| start_date, end_date | DATE |
| restrictions_override | TEXT[] |
| notes, organization_id, created_at, updated_at | Standard |

**`location_compliance_docs`** — Compliance attachments

| Column | Type |
|--------|------|
| id | UUID PK |
| location_id | UUID FK → locations |
| doc_type | location_doc_type enum |
| document_number, issuing_authority | TEXT |
| issued_date, expiry_date | DATE |
| status | compliance_doc_status enum |
| digital_asset_id | UUID FK → digital_assets |
| notes, organization_id, created_by, created_at, updated_at | Standard |

**`location_inspections`** — Safety audit logging

| Column | Type |
|--------|------|
| id | UUID PK |
| location_id | UUID FK → locations |
| inspection_type | location_inspection_type enum |
| inspector_name, inspector_org | TEXT |
| inspection_date, next_inspection_date | DATE |
| result | inspection_result enum |
| findings, corrective_actions | TEXT |
| corrective_deadline | DATE |
| digital_asset_id | UUID FK → digital_assets |
| organization_id, created_by, created_at, updated_at | Standard |

**`location_costs`** — Financial tracking

| Column | Type |
|--------|------|
| id | UUID PK |
| location_id | UUID FK → locations |
| cost_type | location_cost_type enum |
| description | TEXT |
| amount | NUMERIC(12,2) |
| currency | TEXT DEFAULT 'USD' |
| frequency | cost_frequency enum |
| effective_date, end_date | DATE |
| vendor_id | UUID FK → vendors |
| contract_id | UUID FK → contracts |
| project_id | UUID FK → projects (optional) |
| notes, organization_id, created_by, created_at, updated_at | Standard |

**`location_contacts`** — M:M contact model

| Column | Type |
|--------|------|
| id | UUID PK |
| location_id | UUID FK → locations |
| contact_id | UUID FK → contacts |
| role | location_contact_role enum |
| is_primary | BOOLEAN |
| notes, organization_id, created_at | Standard |

**`warehouse_zones`** — Normalized from JSONB

| Column | Type |
|--------|------|
| id | UUID PK |
| location_id | UUID FK → locations |
| name | TEXT |
| zone_type | warehouse_zone_type enum |
| square_footage, capacity_pallets, capacity_weight_lbs | INTEGER |
| temperature_min_f, temperature_max_f | NUMERIC(5,1) |
| security_clearance | TEXT |
| is_active | BOOLEAN |
| sort_order | INTEGER |
| organization_id, created_at, updated_at | Standard |

**`warehouse_bins`** — Storage bin positions

| Column | Type |
|--------|------|
| id | UUID PK |
| zone_id | UUID FK → warehouse_zones |
| bin_code | TEXT (e.g., "A1-R3-S2") |
| bin_type | warehouse_bin_type enum |
| width_inches, height_inches, depth_inches | NUMERIC(8,2) |
| max_weight_lbs | NUMERIC(10,2) |
| is_occupied | BOOLEAN |
| current_asset_id | UUID FK → assets |
| barcode | TEXT |
| is_active | BOOLEAN |
| organization_id, created_at, updated_at | Standard |

### 5.3 New Enums Summary

- `location_type` — extended to 30 values (sites, venues, operational, sub-spaces, outdoor)
- `location_status` — prospecting, onboarding, active, seasonal, maintenance, reconfiguring, archived
- `location_ownership` — owned, leased, temporary, partner, client_provided
- `project_location_role` — primary, secondary, staging, storage, fabrication, backup, load_in, load_out
- `space_booking_type` — event, rehearsal, setup, strike, load_in, load_out, maintenance, hold, site_visit, inspection
- `space_booking_status` — tentative, confirmed, cancelled
- `location_doc_type` — 15 compliance document types
- `compliance_doc_status` — valid, expiring_soon, expired, pending, rejected
- `location_inspection_type` — 10 inspection types
- `inspection_result` — passed, failed, conditional, pending
- `location_cost_type` — 11 cost types
- `cost_frequency` — one_time, monthly, quarterly, annual, per_event
- `location_contact_role` — 9 contact roles
- `warehouse_zone_type` — 10 zone types
- `warehouse_bin_type` — 7 bin types

### 5.4 7W Coverage — All 9 New Entities: 7/7

All entities cover Who, What, When, Where, Why, How, If/Then.

---

## 6. Spatial Hierarchy & Inheritance Model

### 6.1 Hierarchy Rules

- H1: Every location has at most one parent (`parent_location_id`)
- H2: Root locations (depth 0) have `parent_location_id = NULL`
- H3: `hierarchy_depth` = parent's depth + 1 (trigger-enforced)
- H4: `hierarchy_path` = parent's path || '.' || own id
- H5: Maximum depth = 6
- H6: Deleting a parent requires children archived/reassigned first
- H7: Type must be compatible with depth

### 6.2 Inheritance Rules

**Inherited downward** (strictest wins): `address`, `coordinates`, `timezone`, `regulatory_jurisdiction`, `noise_curfew_time` (earliest), `noise_max_db` (lowest), `security_level` (highest), `restrictions[]` (union), `alcohol_license` (parent must have), `insurance_required` (if parent requires).

**NOT inherited** (per-space): `is_ada_accessible`, `capacity_*`, `amenities`.

### 6.3 Capacity Rules

- `capacity_fire_code` is legal max — never exceeded
- `capacity_seated` ≤ `capacity_fire_code`
- `capacity_standing` ≤ `capacity_fire_code`
- `space_bookings.expected_attendance` ≤ applicable capacity
- Event overlays `capacity_override` ≤ `capacity_fire_code`

---

## 7. Location Master Data Taxonomy

| L1 Category | L2 Types | Typical Depth | Ownership |
|-------------|----------|---------------|-----------|
| Sites | site, campus, complex, festival_grounds | 0 | owned, leased |
| Venues | venue, theater, arena, convention_center, club, park, stadium | 0-1 | leased, partner |
| Operational | office, warehouse, fabrication_shop, staging_area | 0-1 | owned, leased |
| Hospitality | hotel, airport | 0 | partner |
| Sub-spaces | floor, space, room, exhibit_hall, stage, loading_dock, green_room, control_room, storage_room, breakout_room | 2-5 | inherited |
| Outdoor | outdoor_zone, parking_lot, perimeter | 1-3 | leased, temporary |

---

## 8. Location Operational Lifecycle

**Onboarding:** prospecting (site visit, initial capture) → onboarding (full data entry, compliance docs, safety inspection, capacity validation, floorplan upload, contact assignment, approval) → active.

**Maintenance:** Scheduled window via space_bookings → work performed → post-maintenance inspection → back to active.

**Seasonal:** Close (flag bookings, status→seasonal, winterization) → Reopen (pre-season inspection, re-validate compliance, status→active).

**Decommission:** Cancel bookings → remove assets → final inspection → financial close-out → status→archived (no hard delete).

---

## 9. Location Usage During Projects & Events

- **Space allocation:** Projects assign locations via `project_locations` M:M junction with role, dates, costs
- **Scheduling:** `space_bookings` enforces temporal non-overlap with setup/teardown buffers
- **Capacity planning:** Trigger validates `expected_attendance` ≤ fire code capacity
- **Asset placement:** `assets.current_location_id` → broad; `warehouse_bins.current_asset_id` → specific
- **Load-in/out routing:** Per-project windows stored on `project_locations`, not on location globally

---

## 10. Scheduling & Conflict Detection

Trigger `check_space_booking_conflicts()` on `space_bookings`:
- Calculates effective time range including setup/teardown buffers
- Checks overlapping confirmed bookings for same `location_id`
- Raises exception if conflict found when status = 'confirmed'
- Hierarchical check: booking parent blocks children, booking child warns parent

Trigger `validate_space_booking_capacity()`:
- Resolves effective capacity (fire_code > seated > standing)
- Raises exception if `expected_attendance` exceeds capacity

---

## 11. Compliance & Risk Framework

### 11.1 Document Types

fire_cert, occupancy_permit, ada_cert, health_dept, env_assessment, insurance_cert, engineering_cert, noise_permit, alcohol_license, building_permit, zoning_approval, safety_plan, structural_report, electrical_cert, plumbing_cert

### 11.2 Compliance Inheritance

Parent-level documents cover all children unless child has its own more-specific document.

### 11.3 Expiry Alerts

- **Warning:** 60 days → notify location manager
- **Urgent:** 30 days → notify ops + compliance
- **Critical:** Expired → block new bookings
- **Blocking:** Missing fire_cert or occupancy_permit → block all bookings

### 11.4 Integration

Complements existing `permits` table (migration 015) via `permits.entity_type = 'location'`.

---

## 12. Financial & Contractual Dimensions

**Recurring costs:** lease, utilities, insurance, security, cleaning, taxes, equipment maintenance.
**One-time costs:** renovation, equipment installation, permit fees, deposits.
**Per-event costs:** venue rental (daily_rate × days), additional services, damage deposits.

**Revenue attribution:** Revenue per location = Σ(project revenue where project has project_locations entry).
**Margin:** Revenue - (project_locations.total_cost + Σ location_costs).
**Shared cost allocation:** equal split, time-proportional, area-proportional, or revenue-proportional.

Profitability view: `v_location_profitability` aggregates revenue, costs, margin, utilization.

---

## 13. Warehousing & Logistics Integration

**Warehouse-as-Location:** Warehouses unified into location hierarchy. Existing `warehouses` table preserved with new `location_id` FK bridge.

**Dock access:** Loading docks modeled as sub-locations (type: loading_dock) with capacity and restrictions. Dock time slots via `space_bookings`.

**Storage capacity:** `warehouse_zones` → `warehouse_bins` with pallet/weight/temperature limits.

**Asset mapping:** `assets.current_location_id` → warehouse location; `warehouse_bins.current_asset_id` → exact bin.

**Cross-dock:** Zone type `cross_dock` + `space_bookings` for time windows; no bins needed.

---

## 14. Geospatial Integration Model

| Feature | Implementation | Priority |
|---------|---------------|----------|
| Point coordinates | `coordinates POINT` (existing) | P0 |
| Polygon boundaries | `boundary GEOMETRY(POLYGON,4326)` | P2 |
| Proximity queries | `ST_DWithin()` | P2 |
| Geo-fencing | `ST_Contains()` | P3 |
| Route optimization | External API (Google Maps, Mapbox) | P3 |
| Interactive maps | Mapbox GL JS / Leaflet | P3 |

---

## 15. Risk Scoring Framework

| Dimension | Weight | Signals |
|-----------|--------|---------|
| Compliance | 30% | Expired docs, failed inspections, missing permits |
| Capacity | 20% | Near-capacity bookings, fire code proximity |
| Safety | 20% | Incident history, inspection failures |
| Financial | 15% | Cost overruns, late payments |
| Operational | 15% | Booking conflicts, maintenance frequency |

Score 0-100: Low (0-25), Medium (26-50), High (51-75), Critical (76-100 → block bookings).

---

## 16. UI/UX Simplification Principles

### Navigation Restructure

**Current:** Production → Locations (flat) + Logistics → Warehouses (separate)

**Future: "Spaces & Locations" section:**
- Location Directory (hierarchical tree view)
- Space Booking Calendar (Gantt-style)
- Warehouse Management (zone/bin management)
- Compliance Dashboard (expiry tracking, inspections)
- Location Map (P3 — visual geospatial view)

### Role-Based Views

| Role | Primary View | Key Actions |
|------|-------------|-------------|
| Operations | Directory + Booking Calendar | Book spaces, manage access |
| Production | Project Locations | Assign locations, plan load-in |
| Compliance | Compliance Dashboard | Track expiry, log inspections |
| Logistics | Warehouse Management | Manage zones/bins, dock schedules |
| Finance | Location Profitability | Cost tracking, utilization |
| Field Crew | Mobile Location Lookup | Directions, access info, schedules |

### Progressive Disclosure

L1: Card (name, type, city, status, risk) → L2: Detail (attributes, hierarchy breadcrumb, compliance summary) → L3: Sub-space explorer (tree, zone map, bin grid) → L4: Booking calendar (Gantt with conflicts) → L5: Compliance deep-dive

### Contextual Panels

Location info surfaced in: Project detail (Locations tab), Event detail (location sidebar), Activation detail (location context), Asset detail (location breadcrumb), Incident detail (compliance status).

---

## 17. Automation & AI Augmentation Roadmap

### Phase 0-1: Rule-Based (8 automations)

1. Compliance expiry alerts (60/30/0 days)
2. Booking conflict prevention
3. Capacity validation on booking
4. Hierarchy depth enforcement
5. Inspection overdue alerts
6. Cost budget threshold alerts
7. Seasonal auto-close/reopen
8. Duplicate location detection (name + address similarity)

### Phase 2: Smart Automations (6)

1. Optimal space suggestion (capacity, availability, proximity)
2. Predictive maintenance scheduling (based on usage patterns)
3. Utilization anomaly detection
4. Compliance risk forecasting
5. Cost trend analysis and budgeting
6. Automated dock scheduling optimization

### Phase 3: AI-Powered (6)

1. AI crowd flow modeling (based on capacity + event type)
2. Dynamic capacity recommendations
3. Floorplan auto-generation from photos
4. NLP-based location search ("find me a 500-person venue near downtown")
5. Predictive booking demand
6. Autonomous space optimization

---

## 18. Implementation Roadmap

### Phase 0 — Foundation (Migration 016)

- Extend `location_type` enum
- Add new enums (status, ownership, roles, booking types, etc.)
- Add hierarchy columns to `locations` (parent_id, depth, path)
- Add regulatory/compliance/accessibility columns to `locations`
- Create `project_locations` junction
- Migrate existing `locations.project_id` data into `project_locations`
- Add `location_id` FK to `warehouses` for bridge
- Create `warehouse_zones` and `warehouse_bins`
- Create `location_contacts`
- Full RLS, triggers, indexes

### Phase 1 — Scheduling & Compliance

- Create `space_bookings` with conflict detection trigger
- Create `location_compliance_docs`
- Create `location_inspections`
- Create `location_costs`
- Capacity validation triggers
- Expiry alert system

### Phase 2 — Event Overlays & Geospatial

- Create `event_space_overlays`
- Add PostGIS boundary support
- Profitability views
- Hierarchical conflict checks

### Phase 3 — Intelligence Layer

- GIS integration
- Interactive floorplan mapping
- AI-powered features
- Mobile-optimized location lookup
