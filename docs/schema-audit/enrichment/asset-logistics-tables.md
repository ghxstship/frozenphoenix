# Schema Enrichment Report — Asset, Inventory, Logistics & Warehousing Tables

> **Migration Sources:** 001, 019
> **Tables:** assets, vehicles, warehouse_zones, warehouse_locations, inventory_reservations, shipments, shipment_items, kits, kit_items, scan_events, load_plans, load_plan_items, logistics_events, asset_damage_reports, maintenance_schedules, depreciation_schedules, inventory_audits, audit_count_items, warehouses, consumables, consumable_usage, maintenance_records

---

## assets

| Attribute | Value |
|---|---|
| **Migration** | 001 (created), 019 (extended) |
| **Route(s)** | assets/, projects/, fleet/ |
| **Current Columns** | 13 + extensions |
| **Recommended Columns** | +3 |
| **Compliance Score** | Before: 70% → After: 85% |

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `qr_code_url` | FT-URL-001 | TEXT | QR/barcode label generation for field scanning | core |
| `insurance_value` | FT-FIN-001 | NUMERIC(12,2) | Replacement value for insurance claims | pro |
| `last_calibration_date` | FT-TEMP-001 | DATE | NIST calibration tracking for precision equipment (lasers, audio analyzers) | pro |

### Supabase Realtime Candidates

- `condition`, `location`, `status` — real-time asset tracking board updates

---

## vehicles

| Attribute | Value |
|---|---|
| **Migration** | 001 (created), 019 (extended) |
| **Route(s)** | fleet/ |
| **Current Columns** | 11 + extensions |
| **Recommended Columns** | +5 |
| **Compliance Score** | Before: 58% → After: 80% |

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `vin` | FT-TEXT-004 | TEXT | DOT vehicle identification; registration/insurance | pro |
| `last_inspection_date` | FT-TEMP-001 | DATE | DOT annual inspection compliance | core |
| `next_inspection_due` | FT-TEMP-001 | DATE | Proactive compliance flagging | core |
| `odometer_reading` | FT-NUM-001 | INTEGER | Mileage tracking for maintenance schedules | core |
| `insurance_policy_number` | FT-TEXT-004 | TEXT | Commercial auto insurance reference | pro |

### Gap Analysis

**DOT Compliance (49 CFR):** Commercial vehicles (>10,001 lbs GVWR) require annual inspection, driver qualification files, hours of service tracking, and drug/alcohol testing. The current schema covers basic fleet management but is missing DOT-specific compliance fields. These are critical for touring productions using CDL-required vehicles.

---

## warehouse_zones / warehouse_locations (Migration 019)

| Attribute | Value |
|---|---|
| **Migration** | 019 |
| **Route(s)** | assets/ (warehouse management) |
| **Compliance Score** | 92% |

### Assessment

Hierarchical warehouse layout with zone → location mapping, `zone_type` and `location_type` enums, capacity tracking, environmental controls (temperature, humidity), and hazmat flags. Well-designed for production warehouse operations. No enrichment needed.

---

## inventory_reservations (Migration 019)

| Attribute | Value |
|---|---|
| **Migration** | 019 |
| **Route(s)** | assets/, projects/ |
| **Compliance Score** | 90% |

### Assessment

Asset reservation system with `reservation_status` enum, project linkage, date range, and priority. Supports concurrent project asset allocation. No enrichment needed.

---

## shipments / shipment_items (Migration 005/019)

| Attribute | Value |
|---|---|
| **Migration** | 005 (created), 019 (extended) |
| **Route(s)** | assets/ (logistics view) |
| **Compliance Score** | 85% |

### Columns to Add (shipments)

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `customs_clearance_status` | FT-TEXT-001 | TEXT | International shipping; customs/duty tracking | enterprise |
| `hazmat_class` | FT-TEXT-001 | TEXT | DOT HAZMAT shipping classification (pyrotechnics, compressed gases) | core |
| `bill_of_lading_number` | FT-TEXT-004 | TEXT | Carrier BOL reference for freight tracking | pro |

---

## kits / kit_items (Migration 019)

| Attribute | Value |
|---|---|
| **Migration** | 019 |
| **Route(s)** | assets/ |
| **Compliance Score** | 92% |

### Assessment

Kit assembly/disassembly with `kit_status` enum, BOM-like composition, and project linkage. Essential for production equipment packages (e.g., "Stage A Lighting Kit"). No enrichment needed.

---

## scan_events (Migration 019)

| Attribute | Value |
|---|---|
| **Migration** | 019 |
| **Route(s)** | assets/ |
| **Compliance Score** | 90% |

### Assessment

Barcode/QR/RFID scan audit trail with `scan_type` enum, GPS coordinates, and user attribution. Good for chain-of-custody tracking. No enrichment needed.

---

## load_plans / load_plan_items (Migration 019)

| Attribute | Value |
|---|---|
| **Migration** | 019 |
| **Route(s)** | assets/ (logistics) |
| **Compliance Score** | 88% |

### Assessment

Vehicle loading plans with weight/volume calculations, priority ordering, and completion tracking. Links vehicles to shipments. Well-designed for load-in/load-out sequencing. Gap: missing `axle_weight_distribution` for DOT weight compliance on long-haul trucks.

---

## maintenance_schedules / depreciation_schedules (Migration 019)

| Attribute | Value |
|---|---|
| **Migration** | 019 |
| **Route(s)** | assets/ |
| **Compliance Score** | 90% |

### Assessment

Preventive maintenance with `frequency_type` enum and cost tracking. Depreciation with `depreciation_method` enum (straight_line, declining_balance, sum_of_years, units_of_production) — GAAP-compliant. Well-designed. No enrichment needed.

---

## inventory_audits / audit_count_items (Migration 019)

| Attribute | Value |
|---|---|
| **Migration** | 019 |
| **Route(s)** | assets/ |
| **Compliance Score** | 92% |

### Assessment

Full cycle count and wall-to-wall audit with `audit_type` and `audit_status` enums, expected vs actual counts, variance tracking, and auditor assignment. SOC2 CC8.1 compliant. No enrichment needed.
