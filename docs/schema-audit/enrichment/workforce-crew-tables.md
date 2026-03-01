# Schema Enrichment Report — Workforce & Crew Tables

> **Migration Sources:** 001, 005, 011
> **Tables:** crew_members, certifications, shifts, schedule_entries, workforce_members, workforce_certifications, workforce_availability, workforce_assignments, workforce_evaluations, workforce_pay_rates, workforce_documents

---

## crew_members

| Attribute | Value |
|---|---|
| **Migration** | 001 (created), 011 (extended) |
| **Route(s)** | crew/, scheduling/, org-chart/ |
| **Current Columns** | 11 |
| **Recommended Columns** | +8 |
| **Compliance Score** | Before: 55% → After: 82% |

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `i9_verified` | FT-BOOL-001 | BOOLEAN | USCIS I-9 employment eligibility verification | enterprise |
| `i9_verified_at` | FT-TEMP-002 | TIMESTAMPTZ | I-9 verification date for audit trail | enterprise |
| `w9_uploaded` | FT-BOOL-001 | BOOLEAN | IRS W-9 for 1099 contractor reporting | enterprise |
| `union_local` | FT-TEXT-001 | TEXT | IATSE/Teamsters/SAG-AFTRA local number | pro |
| `union_classification` | FT-TEXT-001 | TEXT | Union job classification (e.g., "Electric Dept Head") | pro |
| `dietary_restrictions` | FT-TEXT-002 | TEXT | Catering/hospitality for on-site crew | core |
| `emergency_contact_name` | FT-PII-003 | TEXT | OSHA 1910.38 emergency action plan | core |
| `emergency_contact_phone` | FT-PII-004 | TEXT | OSHA emergency contact requirement | core |

### PII Classification

- `email`, `phone` — **direct PII**; visible to pm+ roles
- `hourly_rate` — **sensitive PII**; visible to exec/pm only (already in FIELD_VISIBILITY_MASKS)
- `emergency_contact_*` — **direct PII** but **safety-critical** (never paywalled, CORE tier)
- `i9_verified`, `w9_uploaded` — **regulated PII**; enterprise tier, audit logged

### Gap Analysis

**Critical:** The `crew_members` table is the most regulation-heavy entity in the platform:
- FLSA: Missing overtime tracking fields → handled via `time_entries`
- OSHA: Emergency contact present after enrichment
- Union: Classification and local needed for rate card compliance
- Tax: W-9/1099 tracking for independent contractors

### RLS Assessment

- Current: Org-scoped — adequate for row-level
- Gap: Crew members acting as "crew" project_role should only see their own record + project-assigned peers, not all org crew

---

## certifications

| Attribute | Value |
|---|---|
| **Migration** | 001 |
| **Route(s)** | crew/ |
| **Current Columns** | 7 |
| **Recommended Columns** | +2 |
| **Compliance Score** | Before: 78% → After: 90% |

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `issuing_authority` | FT-TEXT-001 | TEXT | OSHA, NFPA, state agency — regulatory source tracking | core |
| `renewal_reminder_days` | FT-NUM-001 | INTEGER | Proactive expiry notification; compliance gate | core |

### Columns to Re-type

| Column | Current | Recommended | Reason |
|---|---|---|---|
| `type` | TEXT CHECK (7 values) | ENUM `certification_type` | Extensibility; migration 011 defines expanded enum |

---

## shifts

| Attribute | Value |
|---|---|
| **Migration** | 001 |
| **Route(s)** | scheduling/, crew/ |
| **Current Columns** | 10 |
| **Recommended Columns** | +4 |
| **Compliance Score** | Before: 65% → After: 82% |

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `location_id` | FT-ID-002 | UUID FK | Links to locations table; spatial scheduling | core |
| `break_minutes` | FT-NUM-001 | INTEGER | FLSA meal/rest break tracking (30-min/8-hr rule) | core |
| `overtime_flag` | FT-BOOL-001 | BOOLEAN | FLSA overtime calculation (>40hr/week, >8hr/day in CA) | pro |
| `checked_in_at` | FT-TEMP-002 | TIMESTAMPTZ | Actual check-in time vs scheduled (variance tracking) | core |

---

## workforce_members (Migration 011)

| Attribute | Value |
|---|---|
| **Migration** | 011 |
| **Route(s)** | crew/ (unified workforce view) |
| **Current Columns** | ~25 |
| **Compliance Score** | 88% |

### Assessment

The unified workforce table (011) is the canonical representation of all labor resources. It includes `employment_type` enum (full_time, part_time, contractor, freelance, volunteer, intern), pay rates, availability, and department linkage. This supersedes the simpler `crew_members` table for enterprise use.

### Gap Analysis

- Missing `background_check_status` — required for venues with sensitive access (government, schools)
- Missing `drug_test_date` — DOT compliance for fleet drivers
- These are low-priority additions (enterprise tier only)

---

## schedule_entries (Migration 005)

| Attribute | Value |
|---|---|
| **Migration** | 005 |
| **Route(s)** | scheduling/, calendar/ |
| **Current Columns** | ~15 |
| **Compliance Score** | 88% |

### Assessment

Extended scheduling model with `schedule_type` enum, conflict detection, recurrence patterns, and location linkage. Well-designed for multi-project crew scheduling. No enrichment needed.

---

## workforce_pay_rates (Migration 011)

| Attribute | Value |
|---|---|
| **Migration** | 011 |
| **Route(s)** | crew/, finance/ |
| **Current Columns** | ~10 |
| **Compliance Score** | 85% |

### PII Classification

All pay rate data is **sensitive PII**:
- `standard_rate`, `overtime_rate`, `double_time_rate` — exec-only visibility
- Must be encrypted at rest for SOC2 compliance
- Audit trail required on every read/write
