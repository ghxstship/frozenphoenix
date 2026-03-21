# CSV Import & Export — Comprehensive Plan

> **Date:** 2026-03-09
> **Scope:** All entity list pages + detail pages with sub-entity tables
> **Status:** In Progress

---

## 1. Current State Audit

### 1.1 Existing CSV/Export Code

| File | Type | Status | Notes |
|------|------|--------|-------|
| `src/app/api/credentials/export/route.ts` | Export API | **FUNCTIONAL** | Supports credential_assignments, credential_scan_log, pos_transactions. Has column mapping via export_templates. CSV + JSON output. |
| `src/app/api/credentials/bulk-import/route.ts` | Import API | **FUNCTIONAL** | Processes credential_assignments only. Creates bulk_import_jobs records. Row-by-row validation. |
| `src/app/api/conversations/[id]/export/route.ts` | Export API | **FUNCTIONAL** | Conversation messages export. CSV + JSON. |
| `src/app/(dashboard)/data-export/page.tsx` | GDPR Export UI | **MOCK ONLY** | Personal data export page — no wiring to any API. |
| `src/app/(dashboard)/reports/page.tsx` | Export button | **NO-OP** | "Export All" button renders but has no handler. |
| `src/app/(dashboard)/contracts/[id]/page.tsx` | PDF export | **TOAST ONLY** | Shows toast, no actual PDF generation. |

### 1.2 Existing Dependencies

- **No CSV library installed** — no papaparse, csv-parse, or similar in package.json
- Existing export routes use manual CSV serialization (join + escape)
- No shared CSV utility exists

### 1.3 Existing DB Infrastructure

| Table | Migration | Purpose |
|-------|-----------|---------|
| `bulk_import_jobs` | 036 | Import job tracking (status, row counts, error details) |
| `export_templates` | 036 | Column mapping templates for exports |

---

## 2. Entity Classification

### 2.1 Tier 1 — Core Business Entities (Export + Import)

These are primary entities that users commonly need to bulk import from external systems (CRM migration, spreadsheet handoff) and export for reporting/compliance.

| Entity | DB Table | List Page | Import | Export | Template |
|--------|----------|-----------|--------|--------|----------|
| **Contacts/Companies** | `companies` | `/companies` | ✅ | ✅ | ✅ |
| **Deals** | `deals` | `/deals` | ✅ | ✅ | ✅ |
| **Leads** | `leads` | `/leads` | ✅ | ✅ | ✅ |
| **Projects** | `projects` | `/projects` | ✅ | ✅ | ✅ |
| **Tasks** | `tasks` | `/tasks` | ✅ | ✅ | ✅ |
| **Crew Members** | `crew_members` | `/crew` | ✅ | ✅ | ✅ |
| **Vendors** | `vendors` | `/vendors` | ✅ | ✅ | ✅ |
| **Assets** | `assets` | `/assets` | ✅ | ✅ | ✅ |
| **Invoices** | `invoices` | `/client-invoices` | ✅ | ✅ | ✅ |
| **Expenses** | `expenses` | `/expenses` | ✅ | ✅ | ✅ |
| **Contracts** | `contracts` | `/contracts` | ✅ | ✅ | ✅ |
| **Locations** | `locations` | `/locations` | ✅ | ✅ | ✅ |

### 2.2 Tier 2 — Operational Entities (Export + Import)

Less commonly bulk-imported but still needed for migration and operational reporting.

| Entity | DB Table | List Page | Import | Export | Template |
|--------|----------|-----------|--------|--------|----------|
| **Events** | `events` | `/events` | ✅ | ✅ | ✅ |
| **Activations** | `activations` | `/activations` | ✅ | ✅ | ✅ |
| **Budgets** | `budgets` | `/budgets` | ✅ | ✅ | ✅ |
| **Campaigns** | `campaigns` | `/campaigns` | ✅ | ✅ | ✅ |
| **Estimates** | `estimates` | `/estimates` | ✅ | ✅ | ✅ |
| **Opportunities** | `opportunities` | `/opportunities` | ✅ | ✅ | ✅ |
| **Change Orders** | `change_orders` | `/change-orders` | ✅ | ✅ | ✅ |
| **Purchase Orders** | `purchase_orders` | `/purchase-orders` | ✅ | ✅ | ✅ |
| **Certifications** | `certifications` | `/certifications` | ✅ | ✅ | ✅ |
| **Shipments** | `shipments` | `/shipments` | ✅ | ✅ | ✅ |

### 2.3 Tier 3 — Export Only

Entities that are system-generated or have complex creation workflows unsuitable for CSV import.

| Entity | DB Table | List Page | Export |
|--------|----------|-----------|--------|
| **Approvals** | `approvals` | `/approvals` | ✅ |
| **Time Entries** | `time_entries` | `/time-tracking` | ✅ |
| **Shifts** | `shifts` | `/schedule` | ✅ |
| **Audit Log** | `activity_log` | `/audit-log` | ✅ |
| **Credit Notes** | `credit_notes` | `/credit-notes` | ✅ |
| **Payments** | `payments` | `/payments` | ✅ |
| **GL Accounts** | `gl_accounts` | `/gl-accounts` | ✅ |
| **Compliance Checklists** | `compliance_checklists` | `/compliance-checklists` | ✅ |
| **Incidents** | `incidents` | `/incidents` | ✅ |
| **Work Orders** | `work_orders` | `/work-orders` | ✅ |
| **Goods Receipts** | `goods_receipts` | `/goods-receipts` | ✅ |
| **Fleet Vehicles** | `fleet_vehicles` | `/fleet` | ✅ |
| **Insurance Policies** | `insurance_policies` | `/insurance` | ✅ |
| **Permits** | `permits` | `/permits` | ✅ |
| **Credential Assignments** | `credential_assignments` | `/credentials/assignments` | ✅ (existing) |
| **Messages** | `messages` | `/messages` | ✅ (existing) |

### 2.4 Tier 4 — No CSV (Config/Creative/Visual)

These entities have no meaningful CSV representation or are config-level.

| Entity | Reason |
|--------|--------|
| Brand Guidelines | Rich media/visual content |
| Brand Kit | Media assets |
| Decks/Presentations | Structured documents |
| Creative Assets | Binary files |
| Digital Assets | Binary files |
| Dashboards | Layout/widget config |
| Automations | Rule definitions |
| Feature Flags | System config |
| Calendar | Calendar events (use iCal) |
| Case Studies | Long-form content |
| Documents | Rich text/attachments |
| Knowledge Base | Wiki content |

---

## 3. Architecture

### 3.1 Shared Infrastructure

```
src/lib/csv/
├── csv-utils.ts          # Core CSV parse/serialize/escape utilities
├── csv-templates.ts      # Entity template definitions (field mappings)
├── csv-validator.ts      # Row validation engine (required fields, types, enums)
└── index.ts              # Barrel export

src/components/csv/
├── csv-export-button.tsx  # Reusable export button with format picker
├── csv-import-dialog.tsx  # Full import wizard (upload → preview → map → validate → import)
└── index.ts               # Barrel export

src/app/api/csv/
├── export/route.ts        # Generic entity export API
├── import/route.ts        # Generic entity import API
└── template/[entity]/route.ts  # Download blank CSV template for entity
```

### 3.2 Export Flow

1. User clicks **Export CSV** on list page
2. Client sends POST to `/api/csv/export` with `{ entity, filters, columns? }`
3. Server fetches data from Supabase with current user's org scope
4. Server applies column mapping (default or custom)
5. Server generates CSV with proper escaping (RFC 4180)
6. Returns `text/csv` response with `Content-Disposition: attachment`

### 3.3 Import Flow

1. User clicks **Import CSV** on list page
2. `CsvImportDialog` opens — upload step
3. Client-side CSV parse (papaparse) → preview first 5 rows
4. Auto-map columns to entity fields (fuzzy match headers → DB columns)
5. User reviews/adjusts mapping
6. Client-side validation pass (required fields, types, enum values)
7. Submit to `/api/csv/import` with `{ entity, rows[], mapping }`
8. Server validates again (defense in depth) + inserts
9. Returns job result with success/error counts
10. Dialog shows result summary with downloadable error report

### 3.4 Template Download Flow

1. User clicks **Download Template** in import dialog
2. GET `/api/csv/template/[entity]`
3. Returns CSV with headers + 2 example rows + comments row explaining each field
4. Includes enum values in header comments (e.g., `status (draft|active|closed)`)

---

## 4. Field Mapping Definitions

Each entity template defines:
- **`dbColumn`** — snake_case column in Supabase
- **`csvHeader`** — Human-friendly Title Case header for CSV
- **`required`** — Whether field is required for import
- **`type`** — `string | number | boolean | date | enum | email | url | uuid`
- **`enumValues`** — Allowed values for enum fields
- **`importable`** — Whether this field can be set via import (false for `id`, `created_at`, etc.)
- **`exportable`** — Whether this field is included in export (false for internal fields)
- **`example`** — Example value for template
- **`description`** — Field description for template comments

### 4.1 Tier 1 Entity Templates

#### Companies
| DB Column | CSV Header | Required | Type | Import | Export |
|-----------|-----------|----------|------|--------|--------|
| name | Company Name | ✅ | string | ✅ | ✅ |
| industry | Industry | | string | ✅ | ✅ |
| website | Website | | url | ✅ | ✅ |
| phone | Phone | | string | ✅ | ✅ |
| email | Email | | email | ✅ | ✅ |
| address_street | Street Address | | string | ✅ | ✅ |
| address_city | City | | string | ✅ | ✅ |
| address_state | State | | string | ✅ | ✅ |
| address_postal_code | Postal Code | | string | ✅ | ✅ |
| address_country | Country | | string | ✅ | ✅ |
| type | Company Type | | enum | ✅ | ✅ |
| status | Status | | enum | ✅ | ✅ |
| notes | Notes | | string | ✅ | ✅ |
| id | ID | | uuid | ❌ | ✅ |
| created_at | Created At | | date | ❌ | ✅ |
| updated_at | Updated At | | date | ❌ | ✅ |

#### Deals
| DB Column | CSV Header | Required | Type | Import | Export |
|-----------|-----------|----------|------|--------|--------|
| name | Deal Name | ✅ | string | ✅ | ✅ |
| value | Deal Value | | number | ✅ | ✅ |
| stage | Stage | | enum | ✅ | ✅ |
| probability | Probability (%) | | number | ✅ | ✅ |
| expected_close_date | Expected Close Date | | date | ✅ | ✅ |
| source | Source | | string | ✅ | ✅ |
| priority | Priority | | enum | ✅ | ✅ |
| contact_name | Contact Name | | string | ✅ | ✅ |
| contact_email | Contact Email | | email | ✅ | ✅ |
| notes | Notes | | string | ✅ | ✅ |
| id | ID | | uuid | ❌ | ✅ |
| created_at | Created At | | date | ❌ | ✅ |

#### Crew Members
| DB Column | CSV Header | Required | Type | Import | Export |
|-----------|-----------|----------|------|--------|--------|
| name | Full Name | ✅ | string | ✅ | ✅ |
| email | Email | ✅ | email | ✅ | ✅ |
| phone | Phone | | string | ✅ | ✅ |
| role | Role | | string | ✅ | ✅ |
| department | Department | | enum | ✅ | ✅ |
| hourly_rate | Hourly Rate | | number | ✅ | ✅ |
| status | Status | | enum | ✅ | ✅ |
| emergency_contact_name | Emergency Contact Name | | string | ✅ | ✅ |
| emergency_contact_phone | Emergency Contact Phone | | string | ✅ | ✅ |
| start_date | Start Date | | date | ✅ | ✅ |
| skills | Skills | | string | ✅ | ✅ |
| id | ID | | uuid | ❌ | ✅ |
| created_at | Created At | | date | ❌ | ✅ |

#### Vendors
| DB Column | CSV Header | Required | Type | Import | Export |
|-----------|-----------|----------|------|--------|--------|
| name | Vendor Name | ✅ | string | ✅ | ✅ |
| email | Email | ✅ | email | ✅ | ✅ |
| phone | Phone | | string | ✅ | ✅ |
| category | Category | | enum | ✅ | ✅ |
| status | Status | | enum | ✅ | ✅ |
| rating | Rating | | number | ✅ | ✅ |
| website | Website | | url | ✅ | ✅ |
| address | Address | | string | ✅ | ✅ |
| tax_id | Tax ID | | string | ✅ | ✅ |
| payment_terms | Payment Terms | | string | ✅ | ✅ |
| notes | Notes | | string | ✅ | ✅ |
| id | ID | | uuid | ❌ | ✅ |
| created_at | Created At | | date | ❌ | ✅ |

#### Assets
| DB Column | CSV Header | Required | Type | Import | Export |
|-----------|-----------|----------|------|--------|--------|
| name | Asset Name | ✅ | string | ✅ | ✅ |
| category | Category | | enum | ✅ | ✅ |
| condition | Condition | | enum | ✅ | ✅ |
| status | Status | | enum | ✅ | ✅ |
| serial_number | Serial Number | | string | ✅ | ✅ |
| purchase_date | Purchase Date | | date | ✅ | ✅ |
| purchase_price | Purchase Price | | number | ✅ | ✅ |
| current_value | Current Value | | number | ✅ | ✅ |
| location | Location | | string | ✅ | ✅ |
| assigned_to | Assigned To | | string | ✅ | ✅ |
| notes | Notes | | string | ✅ | ✅ |
| id | ID | | uuid | ❌ | ✅ |
| created_at | Created At | | date | ❌ | ✅ |

#### Tasks
| DB Column | CSV Header | Required | Type | Import | Export |
|-----------|-----------|----------|------|--------|--------|
| title | Task Title | ✅ | string | ✅ | ✅ |
| description | Description | | string | ✅ | ✅ |
| status | Status | | enum | ✅ | ✅ |
| priority | Priority | | enum | ✅ | ✅ |
| due_date | Due Date | | date | ✅ | ✅ |
| assignee_name | Assignee | | string | ✅ | ✅ |
| project_id | Project ID | | uuid | ✅ | ✅ |
| estimated_hours | Estimated Hours | | number | ✅ | ✅ |
| tags | Tags | | string | ✅ | ✅ |
| id | ID | | uuid | ❌ | ✅ |
| created_at | Created At | | date | ❌ | ✅ |

_(Remaining entity templates follow the same pattern — see `src/lib/csv/csv-templates.ts` for full definitions)_

---

## 5. RBAC Integration

CSV import/export respects the existing RBAC permission matrix:

| Role | Export | Import | Template Download |
|------|--------|--------|-------------------|
| exec | All entities | All entities | ✅ |
| director | All entities | All entities | ✅ |
| pm | All entities (financial fields masked) | All importable entities | ✅ |
| member | Read-accessible entities only | ❌ | ✅ |
| client | Deals, projects, invoices, deliverables | ❌ | ❌ |
| collaborator | Assigned work orders only | ❌ | ❌ |

- **Field masking on export:** Uses `FIELD_VISIBILITY_MASKS` from rbac.ts to strip sensitive fields
- **Import permission:** Requires `write` permission on the entity resource
- **Export permission:** Requires `read` permission on the entity resource

---

## 6. Implementation Phases

### Phase 1 — Core Infrastructure (This Session)
- [ ] Install papaparse dependency
- [ ] Create `src/lib/csv/csv-utils.ts` — RFC 4180 CSV serialization/parsing
- [ ] Create `src/lib/csv/csv-templates.ts` — All entity field mapping definitions
- [ ] Create `src/lib/csv/csv-validator.ts` — Import validation engine
- [ ] Create `src/lib/csv/index.ts` — Barrel export
- [ ] Create `src/app/api/csv/export/route.ts` — Generic export API
- [ ] Create `src/app/api/csv/import/route.ts` — Generic import API
- [ ] Create `src/app/api/csv/template/[entity]/route.ts` — Template download API
- [ ] Create `src/components/csv/csv-export-button.tsx` — Reusable export button
- [ ] Create `src/components/csv/csv-import-dialog.tsx` — Import wizard dialog
- [ ] Create `src/components/csv/index.ts` — Barrel export

### Phase 2 — Page Wiring (Next Session)
- [ ] Wire CsvExportButton + CsvImportDialog into all Tier 1 list pages (12 pages)
- [ ] Wire CsvExportButton into all Tier 2 list pages (10 pages)
- [ ] Wire CsvExportButton into all Tier 3 list pages (16 pages)
- [ ] Update reports page "Export All" to use CsvExportButton

### Phase 3 — Polish & Compliance
- [ ] GDPR data export page wiring (personal data export)
- [ ] Audit log entries for all imports/exports
- [ ] Import error report CSV download
- [ ] Duplicate detection on import (optional matching by email/name)
- [ ] Batch size limits + progress indication for large imports

---

## 7. Quality Gate Criteria

- [ ] TypeScript compiles with zero errors
- [ ] ESLint passes clean
- [ ] All CSV output follows RFC 4180 (quoted fields, escaped quotes, CRLF line endings)
- [ ] Export respects RBAC field masking
- [ ] Import validates all required fields server-side
- [ ] Template CSV includes example rows and field descriptions
- [ ] Import dialog shows clear error messages with row numbers
- [ ] WCAG 2.2 AA: file input accessible, progress announced, error table navigable
- [ ] i18n: all user-facing strings in string catalog

---

## 8. Open Decisions

1. **Max import batch size** — Recommend 5,000 rows per import. Larger files should be chunked client-side.
2. **Duplicate handling** — Skip, overwrite, or create duplicate? Recommend: skip + report.
3. **Date format flexibility** — Accept ISO 8601, US (MM/DD/YYYY), EU (DD/MM/YYYY). Detect from first valid row.
4. **Encoding** — Accept UTF-8 and Latin-1. Detect via BOM or heuristic.
