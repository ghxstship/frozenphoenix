# Schema Enrichment Report — Location & Spatial Hierarchy Tables

> **Migration Sources:** 017
> **Tables:** locations (extended), project_locations, space_bookings, event_space_overlays, location_compliance_docs, location_inspections, location_costs, location_contacts

---

## locations (Extended in Migration 017)

| Attribute | Value |
|---|---|
| **Migration** | 003 (created), 017 (major extension) |
| **Route(s)** | projects/, events/, scheduling/ |
| **Current Columns** | ~35 (after extension) |
| **Recommended Columns** | +3 |
| **Compliance Score** | Before: 82% → After: 92% |

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `ada_compliant` | FT-BOOL-001 | BOOLEAN | ADA/Title III compliance flag; venue accessibility | core |
| `ada_notes` | FT-TEXT-002 | TEXT | Specific accessibility features/limitations | core |
| `noise_ordinance_curfew` | FT-TEXT-001 | TEXT | Local noise ordinance cutoff time (e.g., "10:00 PM") | core |

### Assessment

Migration 017 significantly extends locations with hierarchy support (`parent_location_id`, `hierarchy_path`, `depth`), spatial data (`latitude`, `longitude`, `geojson_boundary`), regulatory fields (`fire_marshal_capacity`, `noise_restrictions`), lifecycle fields (`operational_status`, `condition_rating`), and financial fields (`daily_rate`, `currency`). Enterprise-grade venue/location management.

### RLS Assessment

- Current: Org-scoped via `get_user_org_id()` — adequate
- Hierarchy function `fn_maintain_location_hierarchy()` maintains materialized path

### Supabase Realtime Candidates

- `operational_status` — venue status changes during events

---

## project_locations (Migration 017)

| Attribute | Value |
|---|---|
| **Migration** | 017 |
| **Route(s)** | projects/ |
| **Compliance Score** | 92% |

### Assessment

Many-to-many junction between projects and locations with `role` field (primary_venue, rehearsal_space, warehouse, load_in_point, etc.), date ranges, and notes. Well-designed. No enrichment needed.

---

## space_bookings (Migration 017)

| Attribute | Value |
|---|---|
| **Migration** | 017 |
| **Route(s)** | scheduling/, events/ |
| **Current Columns** | ~15 |
| **Compliance Score** | 90% |

### Assessment

Venue/space reservation with conflict detection trigger (`fn_check_booking_conflict`), capacity validation (`fn_validate_booking_capacity`), and approval workflow. Links to locations, projects, and events. Well-designed.

### Gap

Missing `setup_time_minutes` and `teardown_time_minutes` for buffer scheduling between bookings — critical for production turnarounds.

---

## event_space_overlays (Migration 017)

| Attribute | Value |
|---|---|
| **Migration** | 017 |
| **Route(s)** | events/ |
| **Compliance Score** | 88% |

### Assessment

Spatial overlay configurations for event layouts (seating plans, staging areas, vendor footprints). Uses JSONB for flexible layout data. Links to locations and events. Adequate for CAD-lite space planning.

---

## location_compliance_docs (Migration 017)

| Attribute | Value |
|---|---|
| **Migration** | 017 |
| **Route(s)** | projects/ (compliance) |
| **Compliance Score** | 90% |

### Assessment

Location-specific compliance documents (occupancy permits, fire safety plans, insurance certs, environmental assessments). Expiry tracking and document URL storage. No enrichment needed.

---

## location_inspections (Migration 017)

| Attribute | Value |
|---|---|
| **Migration** | 017 |
| **Route(s)** | projects/ |
| **Compliance Score** | 90% |

### Assessment

Pre-event site inspections with `inspection_type` enum, pass/fail status, inspector assignment, findings, and follow-up tracking. Aligns with venue advance/site survey workflow. No enrichment needed.

---

## location_costs (Migration 017)

| Attribute | Value |
|---|---|
| **Migration** | 017 |
| **Route(s)** | finance/, projects/ |
| **Compliance Score** | 88% |

### Assessment

Venue cost tracking with `cost_type` enum (rental, utilities, insurance, maintenance, security, staffing), amount, date range, and project linkage. Supports location profitability analysis view (`v_location_profitability`). No enrichment needed.

---

## location_contacts (Migration 017)

| Attribute | Value |
|---|---|
| **Migration** | 017 |
| **Route(s)** | projects/ |
| **Compliance Score** | 85% |

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `available_hours` | FT-TEXT-001 | TEXT | Contact availability window (e.g., "M-F 9-5 ET") | core |
| `emergency_contact` | FT-BOOL-001 | BOOLEAN | Flag for emergency/after-hours contacts | core |

### PII Classification

- `name`, `email`, `phone` — **direct PII**; visible to pm+ roles
- `emergency_contact` flag makes certain contacts **safety-critical** (never paywalled)
