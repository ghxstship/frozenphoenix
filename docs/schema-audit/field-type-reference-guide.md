# Frozen Phoenix — Field Type Reference Guide

> **Version:** 1.0.0 | **Source of Truth:** `master-field-type-registry.json`
> **Scope:** All 30 Supabase migrations, 168 canonical field types across 18 categories

---

## Table of Contents

1. [Overview](#1-overview)
2. [How to Use This Guide](#2-how-to-use-this-guide)
3. [Category Index](#3-category-index)
4. [Identity Fields](#4-identity-fields)
5. [Text Fields](#5-text-fields)
6. [PII Fields](#6-pii-fields)
7. [Address Fields](#7-address-fields)
8. [Financial Fields](#8-financial-fields)
9. [Temporal Fields](#9-temporal-fields)
10. [Enumeration Fields](#10-enumeration-fields)
11. [Boolean Fields](#11-boolean-fields)
12. [Numeric Fields](#12-numeric-fields)
13. [URL Fields](#13-url-fields)
14. [JSON Fields](#14-json-fields)
15. [Array Fields](#15-array-fields)
16. [Audit Fields](#16-audit-fields)
17. [RBAC Fields](#17-rbac-fields)
18. [Settings & Feature Flag Fields](#18-settings--feature-flag-fields)
19. [Compliance Fields](#19-compliance-fields)
20. [Security Fields](#20-security-fields)
21. [Spatial, Media & IoT Fields](#21-spatial-media--iot-fields)
22. [Workflow Fields](#22-workflow-fields)
23. [Enum Catalog](#23-enum-catalog)
24. [RBAC Tier Mapping](#24-rbac-tier-mapping)
25. [Migration Coverage Matrix](#25-migration-coverage-matrix)

---

## 1. Overview

This guide documents every canonical field type used across the Frozen Phoenix database schema. Each field type is:

- **Classified** by data category (Identity, PII, Financial, etc.)
- **Annotated** with PII classification, encryption requirements, and audit trail flags
- **Mapped** to RBAC tiers (core, pro, enterprise) for field-level access control
- **Referenced** to industry standards (GDPR, SOC2, OSHA, ISO, NIST) where applicable

### Key Statistics

| Metric | Count |
|---|---|
| Total canonical field types | 168 |
| Categories | 18 |
| PII-classified fields | 28 |
| Fields requiring encryption at rest | 12 |
| Fields requiring audit trail | 45 |
| Indexable fields | 92 |
| PostgreSQL ENUM types defined | 65+ |
| Tables across all migrations | 170+ |

---

## 2. How to Use This Guide

### For Developers
- Look up the **FIELD_TYPE_ID** when adding a new column to any table
- Use the **zod validation** schema provided for each field type in your API route handlers
- Check **PII classification** before exposing any field in a client-facing API

### For Security/Compliance
- All fields marked `pii_classification: "direct_pii"` or `"sensitive_pii"` MUST have field-level masking in RLS policies
- All fields with `audit_trail_required: true` MUST log changes to the appropriate audit table
- All fields with `encryption_requirement: "at_rest_required"` MUST use Supabase Vault or column-level encryption

### For Product/RBAC
- Fields tagged `rbac_default_tier: "core"` are accessible to all authenticated roles
- Fields tagged `rbac_default_tier: "pro"` require PM or Exec role
- Fields tagged `rbac_default_tier: "enterprise"` require Exec role or explicit permission grant

---

## 3. Category Index

| # | Category | Field Count | FIELD_TYPE_ID Prefix | Description |
|---|---|---|---|---|
| 1 | Identity | 7 | `FT-ID-*` | PKs, FKs, org_id, slugs, barcodes |
| 2 | Text | 5 | `FT-TEXT-*` | Names, descriptions, titles, notes, rich content |
| 3 | PII | 10 | `FT-PII-*` | Email, phone, names, emergency contacts, tax IDs |
| 4 | Address | 6 | `FT-ADDR-*` | Street, city, state, postal, country, coordinates |
| 5 | Financial | 10 | `FT-FIN-*` | Money, rates, percentages, currency, GL codes |
| 6 | Temporal | 6 | `FT-DATE-*` | Dates, timestamps, created/updated_at, timezones |
| 7 | Enumeration | 6 | `FT-ENUM-*` | Status, category, priority, severity, role, department |
| 8 | Boolean | 2 | `FT-BOOL-*` | Flags, consent toggles |
| 9 | Numeric | 7 | `FT-NUM-*` | Counts, hours, percentages, ratings, dimensions |
| 10 | URL | 2 | `FT-URL-*` | Generic URLs, storage URLs |
| 11 | JSON | 5 | `FT-JSON-*` | Metadata, config, lists, filters, targeting |
| 12 | Array | 3 | `FT-ARR-*` | Text arrays, UUID arrays, integer arrays |
| 13 | Audit | 5 | `FT-AUDIT-*` | Created/updated by, actions, payloads, versions |
| 14 | RBAC | 3 | `FT-RBAC-*` | Permission actions, scopes, decisions |
| 15 | Settings | 2 | `FT-SETTINGS-*` | Setting scopes, values |
| 16 | Feature Flags | 2 | `FT-FF-*` | Flag keys, flag types |
| 17 | Branding | 2 | `FT-BRAND-*` | Colors, fonts |
| 18 | Workflow | 3 | `FT-WF-*` | Workflow status, approvals, automation triggers |
| 19 | Compliance | 5 | `FT-COMP-*` | Doc types, expiry, retention, legal holds, idempotency |
| 20 | Security | 2 | `FT-CRYPTO-*` | Token hashes, encrypted secrets |
| 21 | Spatial | 1 | `FT-SPATIAL-*` | Floor plan positions |
| 22 | Media | 3 | `FT-MEDIA-*` | MIME types, file sizes, checksums |
| 23 | SLA | 1 | `FT-SLA-*` | SLA target times |
| 24 | Domain Events | 2 | `FT-EVENT-*` | Event types, event payloads |
| 25 | IoT | 2 | `FT-IOT-*` | Sensor readings, crowd counts |

---

## 4. Identity Fields

### FT-ID-001 — `primary_key_uuid`
- **Type:** `UUID`
- **Default:** `gen_random_uuid()`
- **Nullable:** No
- **Usage:** Every table's `id` column
- **Standard:** RFC 4122

### FT-ID-002 — `foreign_key_uuid`
- **Type:** `UUID`
- **Default:** None
- **Nullable:** Yes (typically)
- **Usage:** All relationship columns (`project_id`, `vendor_id`, `crew_member_id`, etc.)
- **Note:** Always paired with FK constraint + ON DELETE behavior (CASCADE, SET NULL, or RESTRICT)

### FT-ID-003 — `organization_id`
- **Type:** `UUID NOT NULL`
- **RLS:** `org_isolation` — ALL RLS policies filter on this field
- **Audit:** Required
- **Usage:** Present on ~95% of tables for tenant isolation
- **Standard:** SOC2 CC6.1

### FT-ID-004 — `user_reference`
- **Type:** `UUID` → `auth.users(id)`
- **PII:** Indirect PII
- **Usage:** `owner_id`, `assigned_to`, `manager_id`, `reviewer_id`, `created_by`

### FT-ID-005 — `slug`
- **Type:** `TEXT`
- **Pattern:** `^[a-z0-9-]+$`
- **Usage:** `organizations.slug`, `case_studies.slug`, `asset_tags.slug`

### FT-ID-006 — `sequential_number`
- **Type:** `TEXT`
- **Pattern:** `PREFIX-YYYY-NNNN` (e.g., `PROP-2025-0001`)
- **Usage:** Proposals, invoices, contracts, RFQs, shipments, incidents, SOPs
- **Generated by:** Database functions (e.g., `generate_proposal_number()`)

### FT-ID-007 — `barcode_identifier`
- **Type:** `TEXT UNIQUE`
- **RBAC Tier:** Pro
- **Usage:** `assets.barcode`, `kits.barcode`, `consumables.barcode`
- **Standard:** GS1 barcode standards

---

## 5. Text Fields

### FT-TEXT-001 — `name_field`
- **Type:** `TEXT NOT NULL`
- **Validation:** 1-255 chars
- **Usage:** Entity display names across all modules

### FT-TEXT-002 — `description_field`
- **Type:** `TEXT`
- **Validation:** Max 10,000 chars
- **Full-text searchable:** Yes

### FT-TEXT-003 — `title_field`
- **Type:** `TEXT NOT NULL`
- **Validation:** 1-500 chars
- **Usage:** Projects, tasks, proposals, incidents, documents, SOPs

### FT-TEXT-004 — `notes_field`
- **Type:** `TEXT`
- **PII:** Potential (free-form text may contain PII)
- **Validation:** Max 50,000 chars

### FT-TEXT-005 — `rich_content_json`
- **Type:** `JSONB`
- **Format:** ProseMirror/TipTap structured JSON
- **RBAC Tier:** Pro
- **Usage:** Documents, proposals, SOPs
- **Audit:** Required (version-tracked)

---

## 6. PII Fields

> **All PII fields require field-level masking for vendor/client roles per GDPR Art.4(1)**

| ID | Type Name | Base Type | PII Level | Encrypt? | Modules |
|---|---|---|---|---|---|
| FT-PII-001 | `email_address` | TEXT | Direct | Recommended | auth, leads, contacts, crew, vendors |
| FT-PII-002 | `phone_number` | VARCHAR(50) | Direct | Recommended | leads, contacts, crew, locations |
| FT-PII-003 | `person_first_name` | VARCHAR(100) | Direct | No | leads, contacts, crew, user_profiles |
| FT-PII-004 | `person_last_name` | VARCHAR(100) | Direct | No | leads, contacts, crew, user_profiles |
| FT-PII-005 | `full_name_generated` | TEXT (GENERATED) | Direct | No | contacts (read-only) |
| FT-PII-006 | `display_name` | TEXT | Indirect | No | user_profiles, profiles |
| FT-PII-007 | `preferred_name` | TEXT | Indirect | No | contacts, crew_members |
| FT-PII-008 | `emergency_contact_json` | JSONB | Sensitive | **Required** | crew_members, worker_profiles |
| FT-PII-009 | `ip_address` | TEXT | Direct | Recommended | login_audit_log, proposals |
| FT-PII-010 | `tax_id` | TEXT | Sensitive | **Required** | companies, worker_profiles |

### Masking Rules
- **Direct PII** → Masked for `vendor` and `client` roles (show `j***@example.com`)
- **Sensitive PII** → Masked for ALL non-exec roles (show `***-**-1234`)
- **Indirect PII** → Visible to `pm` and above; masked for `vendor`/`client`

---

## 7. Address Fields

All address fields follow the USPS Publication 28 / ISO 3166 standard:

| ID | Field | Type | PII | Usage |
|---|---|---|---|---|
| FT-ADDR-001 | `address_street` | TEXT | Direct | locations, companies, warehouses |
| FT-ADDR-002 | `address_city` | TEXT | Indirect | locations, companies, warehouses |
| FT-ADDR-003 | `address_state` | TEXT | None | locations, companies, warehouses |
| FT-ADDR-004 | `address_postal_code` | TEXT | Indirect | locations, companies, warehouses |
| FT-ADDR-005 | `address_country` | TEXT (default: USA) | None | locations, companies, warehouses |
| FT-ADDR-006 | `coordinates_point` | POINT | Indirect | locations (WGS 84) |

---

## 8. Financial Fields

> **All financial fields require role-based RLS (exec/pm only). Vendor/client roles see aggregates only.**

| ID | Field | Type | Precision | Audit | Tier |
|---|---|---|---|---|---|
| FT-FIN-001 | `monetary_amount` | NUMERIC(12,2) | 2 decimal | Yes | Core |
| FT-FIN-002 | `monetary_amount_large` | NUMERIC(14,2) | 2 decimal | Yes | Pro |
| FT-FIN-003 | `hourly_rate` | NUMERIC(10,2) | 2 decimal | Yes | Pro |
| FT-FIN-004 | `percentage` | NUMERIC(5,2) | 2 decimal | No | Core |
| FT-FIN-005 | `currency_code` | TEXT (ISO 4217) | — | No | Core |
| FT-FIN-006 | `generated_variance` | NUMERIC(12,2) | Generated | No | Pro |
| FT-FIN-007 | `generated_total_cost` | NUMERIC(12,2) | Generated | No | Pro |
| FT-FIN-008 | `exchange_rate` | NUMERIC(12,6) | 6 decimal | Yes | Enterprise |
| FT-FIN-009 | `gl_account_code` | TEXT | — | Yes | Enterprise |
| FT-FIN-010 | `payment_terms_days` | INTEGER | — | No | Core |

### Generated Columns (Read-Only)
```sql
-- FT-FIN-006: Budget variance
variance NUMERIC(12,2) GENERATED ALWAYS AS (actual_amount - estimated_amount) STORED

-- FT-FIN-007: Time entry cost
total_cost NUMERIC(12,2) GENERATED ALWAYS AS (hours_worked * hourly_rate) STORED
```

---

## 9. Temporal Fields

| ID | Field | Type | Default | Auto-managed |
|---|---|---|---|---|
| FT-DATE-001 | `date_field` | DATE | None | No |
| FT-DATE-002 | `timestamp_field` | TIMESTAMPTZ | None | No |
| FT-DATE-003 | `created_at` | TIMESTAMPTZ | `NOW()` | Yes (immutable) |
| FT-DATE-004 | `updated_at` | TIMESTAMPTZ | `NOW()` | Yes (trigger) |
| FT-DATE-005 | `time_of_day` | TIME | None | No |
| FT-DATE-006 | `timezone_identifier` | TEXT | `America/New_York` | No |

### Auto-Update Trigger
Every table with `updated_at` has:
```sql
CREATE TRIGGER update_{table}_updated_at
  BEFORE UPDATE ON {table}
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 10. Enumeration Fields

### FT-ENUM-001 — `status_enum`
The most common field type. Every status field uses a PostgreSQL ENUM type specific to its domain.

### FT-ENUM-005 — `platform_role`
```
exec → Full access, all modules, all financial data
pm   → Project management access, team-scoped financial data
client → Read-only project data, masked financials
vendor → Assigned work only, no financial data
```

### FT-ENUM-006 — `department_enum`
```sql
CREATE TYPE department AS ENUM (
  'production', 'construction', 'technical', 'fabrication', 'print',
  'scenic', 'props', 'av', 'lighting', 'rigging', 'food_beverage',
  'staffing', 'logistics', 'finance', 'creative'
);
```

---

## 11. Boolean Fields

| ID | Field | Default | Audit | Usage |
|---|---|---|---|---|
| FT-BOOL-001 | `boolean_flag` | `false` | No | is_active, is_default, is_shared, approval_required, is_billable |
| FT-BOOL-002 | `consent_flag` | `false` | **Yes** | leads.privacy_consent (GDPR Art.7) |

---

## 12. Numeric Fields

| ID | Field | Type | Range | Audit | Usage |
|---|---|---|---|---|---|
| FT-NUM-001 | `integer_count` | INTEGER | ≥ 0 | No | quantities, capacities, versions |
| FT-NUM-002 | `decimal_hours` | NUMERIC(5,2) | 0-999.99 | Yes | time tracking, resource planning |
| FT-NUM-003 | `percent_complete` | INTEGER | 0-100 | No | task/checklist progress |
| FT-NUM-004 | `rating_score` | INTEGER/DECIMAL | 1-5 | No | testimonials, reviews |
| FT-NUM-005 | `dimension_measurement` | NUMERIC(10,2) | ≥ 0 | No | width, depth, height, weight |
| FT-NUM-006 | `inventory_quantity` | NUMERIC(10,2) | ≥ 0 | Yes | consumables, kit items, shipments |
| FT-NUM-007 | `lead_score` | INTEGER | 0-100 | No | auto-computed lead scoring |

---

## 13. URL Fields

| ID | Field | PII | Audit | Usage |
|---|---|---|---|---|
| FT-URL-001 | `url_field` | None | No | avatar_url, website, video_url, logo_url |
| FT-URL-002 | `storage_url` | Potential | Yes | document URLs, receipts, signed file references |

---

## 14. JSON Fields

| ID | Field | Schema Validated | Audit | Tier | Usage |
|---|---|---|---|---|---|
| FT-JSON-001 | `metadata_jsonb` | No | No | Core | activity_log, custom data |
| FT-JSON-002 | `config_jsonb` | Yes | Yes | Pro | feature flags, automations, settings |
| FT-JSON-003 | `structured_list_jsonb` | Partial | No | Core | pipeline stages, SOP steps |
| FT-JSON-004 | `filter_config_jsonb` | No | No | Pro | saved views, reports, widgets |
| FT-JSON-005 | `targeting_rules_jsonb` | Yes | Yes | Enterprise | feature flag targeting |

---

## 15. Array Fields

| ID | Field | Element Type | GIN Indexed | Usage |
|---|---|---|---|---|
| FT-ARR-001 | `text_array` | TEXT | Yes | tags, skills, deliverables, roles |
| FT-ARR-002 | `uuid_array` | UUID | Yes | mentions, team_ids, attachment_ids |
| FT-ARR-003 | `integer_array` | INTEGER | No | reminder_minutes |

---

## 16. Audit Fields

| ID | Field | Immutable | PII | Tier |
|---|---|---|---|---|
| FT-AUDIT-001 | `created_by` | Yes | Indirect | Core |
| FT-AUDIT-002 | `updated_by` | No | Indirect | Core |
| FT-AUDIT-003 | `audit_action` | Yes | None | Core |
| FT-AUDIT-004 | `audit_payload_jsonb` | Yes | Potential | Enterprise |
| FT-AUDIT-005 | `version_number` | No | None | Core |

---

## 17. RBAC Fields

| ID | Field | Type | Values | Usage |
|---|---|---|---|---|
| FT-RBAC-001 | `permission_action` | ENUM | create, read, update, delete, approve, export, manage, archive | permission_grants |
| FT-RBAC-002 | `permission_scope_type` | ENUM | global, organization, project, department | permission_grants |
| FT-RBAC-003 | `access_decision` | TEXT | allow, deny, conditional | access_audit_log |

---

## 18. Settings & Feature Flag Fields

### Settings
| ID | Field | Values | Audit |
|---|---|---|---|
| FT-SETTINGS-001 | `setting_scope` | platform, organization, role, user | Yes |
| FT-SETTINGS-002 | `setting_value_jsonb` | Validated against definition schema | Yes |

### Feature Flags
| ID | Field | Values | Audit |
|---|---|---|---|
| FT-FF-001 | `feature_flag_key` | snake_case unique identifier | Yes |
| FT-FF-002 | `feature_flag_type` | boolean, percentage, variant | Yes |

---

## 19. Compliance Fields

| ID | Field | Type | Standard | Tier |
|---|---|---|---|---|
| FT-COMP-001 | `compliance_doc_type` | ENUM | SOC2, OSHA | Core |
| FT-COMP-002 | `expiry_date` | DATE | Compliance lifecycle | Core |
| FT-COMP-003 | `retention_period_days` | INTEGER | GDPR Art.5(1)(e) | Enterprise |
| FT-COMP-004 | `legal_hold_flag` | BOOLEAN | FRCP Rule 37(e) | Enterprise |
| FT-COMP-005 | `idempotency_key` | TEXT UNIQUE | Stripe pattern | Enterprise |

---

## 20. Security Fields

| ID | Field | Storage | Access |
|---|---|---|---|
| FT-CRYPTO-001 | `token_hash` | SHA-256 hashed (never plaintext) | System only |
| FT-CRYPTO-002 | `secret_value` | Encrypted at rest (Supabase Vault) | Exec + System only |

---

## 21. Spatial, Media & IoT Fields

### Spatial
| ID | Field | Type | Tier |
|---|---|---|---|
| FT-SPATIAL-001 | `floor_plan_position` | JSONB {x, y, rotation} | Pro |

### Media
| ID | Field | Type | Tier |
|---|---|---|---|
| FT-MEDIA-001 | `mime_type` | TEXT (RFC 6838) | Core |
| FT-MEDIA-002 | `file_size_bytes` | BIGINT | Core |
| FT-MEDIA-003 | `checksum_hash` | TEXT (SHA-256) | Pro |

### IoT/Environmental
| ID | Field | Type | Tier |
|---|---|---|---|
| FT-IOT-001 | `sensor_reading` | NUMERIC(8,2) | Enterprise |
| FT-IOT-002 | `crowd_count` | INTEGER | Enterprise |

---

## 22. Workflow Fields

| ID | Field | Values | Audit | Usage |
|---|---|---|---|---|
| FT-WF-001 | `workflow_status` | pending, in_progress, completed, cancelled, failed | Yes | workflow_instances, onboarding/offboarding runs |
| FT-WF-002 | `approval_decision` | approved, rejected, pending | Yes | approvals, budget/payment approvals, settings changes |
| FT-WF-003 | `automation_trigger_type` | created, updated, status_changed, assigned, due_date_approaching, overdue, field_changed, time_logged, budget_threshold, scheduled | Yes | automation_rules |

---

## 23. Enum Catalog

Complete listing of all PostgreSQL ENUM types defined across migrations:

### Migration 001 — Initial Schema
| Enum | Values |
|---|---|
| `deal_stage` | lead, qualified, proposal, negotiation, won, lost |
| `task_priority` | low, medium, high, urgent, critical |
| `approval_status` | pending, approved, rejected, revision_requested |

### Migration 003 — Production Lifecycle
| Enum | Values |
|---|---|
| `project_type` | activation, event, campaign, content_production, tour, installation, other |
| `production_phase` | concept, pre_production, production, post_production, wrap, archived |
| `location_type` | venue, warehouse, office, studio, outdoor, virtual, other |
| `activation_type` | pop_up, installation, sampling, demonstration, experiential, digital, hybrid |
| `event_type` | conference, trade_show, concert, festival, corporate, social, virtual, hybrid, other |
| `department` | production, construction, technical, fabrication, print, scenic, props, av, lighting, rigging, food_beverage, staffing, logistics, finance, creative |
| `task_status` | backlog, todo, in_progress, review, blocked, done, cancelled |
| `procurement_status` | draft, submitted, under_review, approved, rejected, ordered, received, cancelled |
| `contract_type` | vendor_agreement, client_agreement, nda, msa, sow, lease, purchase_order, other |
| `employment_type` | full_time, part_time, contractor, freelancer, volunteer, intern |
| `crew_status` | available, on_project, unavailable, on_leave |
| `shift_status` | scheduled, confirmed, in_progress, completed, cancelled, no_show |
| `asset_category` | audio, video, lighting, staging, furniture, decor, signage, technology, vehicle, tools, safety, catering, other |
| `asset_condition` | new, good, fair, poor, damaged, decommissioned |
| `asset_ownership` | owned, rented, client_provided, sub_rented |
| `asset_assignment_status` | reserved, checked_out, in_transit, on_site, returned, lost, damaged |
| `shipment_type` | delivery, pickup, transfer, return |
| `shipment_status` | planning, booked, in_transit, delivered, returned, cancelled |
| `shipment_priority` | standard, express, rush, emergency |
| `vehicle_type` | box_truck, flatbed, sprinter_van, cargo_van, trailer, pickup, forklift, other |
| `vehicle_status` | available, in_use, maintenance, out_of_service |
| `vehicle_ownership` | owned, leased, rented |
| `budget_category` | labor, materials, equipment_rental, venue, catering, travel, accommodation, permits, insurance, marketing, contingency, overhead, subcontractor, technology, creative, production, logistics, other |
| `budget_status` | draft, pending_approval, approved, active, overspent, closed |
| `expense_status` | draft, submitted, approved, rejected, paid, void |
| `payment_method` | credit_card, bank_transfer, check, cash, wire, ach, other |
| `invoice_type` | client, vendor, internal |
| `invoice_status` | draft, sent, viewed, partial, paid, overdue, void, disputed |
| `time_entry_status` | draft, submitted, approved, rejected, billed |
| `payroll_status` | draft, processing, completed, failed |
| `incident_type` | safety, equipment_damage, weather, vendor_issue, client_complaint, security, medical, other |
| `incident_severity` | minor, moderate, major, critical |
| `incident_status` | reported, investigating, resolved, closed |
| `document_category` | contract, permit, insurance, safety, training, equipment, venue, creative, financial, legal, other |
| `document_status` | draft, under_review, approved, expired, archived |
| `sop_status` | draft, active, under_review, deprecated, archived |
| `checklist_type` | setup, safety, quality, teardown, inspection, custom |
| `checklist_status` | not_started, in_progress, completed |
| `milestone_status` | not_started, in_progress, completed, delayed, at_risk |
| `deliverable_status` | pending, in_progress, delivered, accepted, rejected |
| `risk_level` | low, medium, high, critical |
| `availability_status` | available, partially_available, unavailable, on_leave |
| `assignment_status` | proposed, confirmed, active, completed, cancelled |
| `rate_type` | hourly, daily, flat, overtime |

### Migration 004 — CRM
| Enum | Values |
|---|---|
| `lead_status` | new, contacted, qualified, unqualified, converted, lost |
| `lead_source` | website, referral, social_media, advertising, trade_show, cold_outreach, partner, other |
| `project_type_interest` | activation, event, campaign, content_production, tour, installation, other |
| `budget_range` | under_10k, 10k_25k, 25k_50k, 50k_100k, 100k_250k, 250k_500k, 500k_plus |
| `testimonial_status` | pending, approved, featured, archived |

### Migration 005 — Productive Features
| Enum | Values |
|---|---|
| `custom_field_type` | text, number, date, select, multi_select, checkbox, url, email, phone, currency, percentage, rating, user, file |
| `entity_type` | project, task, deal, contact, company, crew_member, asset, invoice, proposal, event, activation |
| `automation_trigger` | created, updated, status_changed, assigned, due_date_approaching, overdue, field_changed, time_logged, budget_threshold, scheduled |
| `automation_action` | update_field, create_task, send_notification, assign_user, change_status, send_email, create_invoice, update_budget, webhook |
| `booking_status` | tentative, confirmed, cancelled |
| `booking_type` | project, internal, training, leave, admin |
| `time_off_type` | vacation, sick, personal, bereavement, jury_duty, holiday, other |
| `time_off_status` | pending, approved, rejected, cancelled |
| `proposal_status` | draft, sent, viewed, accepted, rejected, expired, revised |
| `billing_type` | fixed_price, time_and_materials, retainer, milestone_based |
| `invoice_delivery_status` | draft, sent, viewed, reminded |
| `payment_status` | pending, processing, completed, failed, refunded |
| `widget_type` | number, chart, table, list, progress, activity, calendar, map |
| `document_type` | doc, spreadsheet, presentation, wiki, template, meeting_notes |

### Migrations 006-020 — Extended Domains
Additional ENUM types defined in later migrations:
- `compliance_doc_type` — insurance, license, certification, background_check, tax_form, etc.
- `work_order_status` — draft, open, assigned, in_progress, completed, invoiced, cancelled
- `dispatch_status` — en_route, on_site, completed, cancelled
- `estimate_status` — draft, sent, approved, rejected, expired, converted
- `opportunity_stage` — discovery, qualification, proposal, negotiation, closed_won, closed_lost
- `change_order_status` — draft, submitted, in_review, approved, rejected, implemented
- `sow_status` — draft, internal_review, client_review, approved, active, completed, cancelled, superseded
- `campaign_status` — draft, planning, active, paused, completed, cancelled
- `creative_review_status` — pending, in_progress, approved, rejected, revision_requested
- `live_event_phase` — pre_event, load_in, rehearsal, doors, live, intermission, post_show, load_out, strike
- `command_position_type` — show_caller, stage_manager, production_manager, technical_director, etc.
- `readiness_gate_status` — not_started, in_progress, blocked, passed, failed, waived

---

## 24. RBAC Tier Mapping

### Core (All Authenticated Users)
Fields accessible by all 4 roles (exec, pm, client, vendor):
- Primary keys, foreign keys, organization_id
- Names, titles, descriptions
- Status enums, category enums
- created_at, updated_at
- Basic boolean flags

### Pro (PM + Exec Only)
Fields requiring project management or executive access:
- Financial amounts (hourly_rate, monetary_amount_large)
- Generated financial columns (variance, total_cost)
- Rich content (ProseMirror documents)
- Barcode identifiers, lead scores
- Feature flag keys and types
- Configuration JSONB, filter configs
- Checksum hashes, floor plan positions

### Enterprise (Exec Only + Explicit Grant)
Fields requiring executive role or explicit permission grant:
- Exchange rates, GL account codes
- IP addresses, tax IDs
- Audit payloads (PII-sanitized)
- Permission scopes, access decisions
- Retention policies, legal holds
- Encrypted secrets, targeting rules
- SLA targets, sensor readings
- Domain event payloads
- Idempotency keys

---

## 25. Migration Coverage Matrix

| Migration | Tables Added | Key Domains |
|---|---|---|
| 001 | organizations, profiles, deals, projects, tasks, crew_members, shifts, assets, vendors, contracts, invoices, approvals, notifications, calendar_events, case_studies | Core platform |
| 002 | time_entries, expenses, budget_line_items, milestones, comments, activity_log, project_templates, report_definitions, integrations | Extended ops |
| 003 | locations, activations, events, activities, production_tasks, production_milestones, rfqs, contracts (ext), schedule_entries, crew_shifts, project_assignments, crew_availability, asset_assignments, maintenance_records, consumables, consumable_usage, shipments, warehouses, budgets, production_budget_lines, production_expenses, production_time_entries, payroll_batches, incidents, knowledge_base_articles, production_sops, production_checklists | Production lifecycle |
| 004 | leads, lead_activities, testimonials, reviews | CRM / Public |
| 005 | companies, contacts, pipelines, lost_reasons, custom_fields, custom_field_values, saved_views, automations, automation_rules, automation_logs, rate_cards, rate_card_items, resource_bookings, time_off_requests, active_timers, proposals, proposal_items, invoice_templates, recurring_invoices, payments, credit_notes, dashboards, dashboard_widgets, documents, document_versions, document_templates | Productive features |
| 006 | call_sheets, call_sheet_crew, tech_sheets, approval_workflows, approval_steps, workflow_instances, workflow_step_approvals, e_signatures, notification_preferences | Workflow / Documents |
| 007 | scopes_of_work, sow_deliverables, client_invoices, invoice_line_items, invoice_time_entries, sow_change_log, deliverable_progress_snapshots | SOW lifecycle |
| 008 | compliance_requirements, vendor_compliance_docs, work_orders, work_order_bids, dispatch_entries, vendor_reviews, checklist_templates, job_checklists, estimates, job_cost_entries, vendor_portal_tokens, vendor_communications | Vendor / Contractor |
| 009 | scenarios, scenario_variables, scenario_outcomes, scenario_resource_plans | Scenario builder |
| 010 | service_requests | Service requests |
| 011 | worker_profiles, worker_classifications, engagement_terms, compliance_templates, worker_compliance_docs, onboarding_step_templates, worker_onboarding_runs, onboarding_step_progress, offboarding_step_templates, worker_offboarding_runs, offboarding_step_progress, worker_reviews, classification_assessments | Unified workforce |
| 012 | activation_assets, event_assets, activity_assets, activity_consumables | Production consolidation |
| 013 | opportunities, opportunity_activities, change_orders, change_order_log, revenue_schedules, account_health_scores | CRM / Revenue |
| 014 | storage_objects, digital_assets, asset_versions, asset_links, asset_tags, asset_tag_assignments, asset_access_controls, asset_access_log, asset_retention_policies, legal_holds, asset_dependencies | Digital asset lifecycle |
| 015 | brief_templates, brand_guidelines, brand_guideline_sections, brand_guideline_versions, creative_briefs, campaigns, campaign_channels, campaign_assets, campaign_kpis, campaign_metrics, creative_reviews, asset_channel_deployments | Creative / Brand / Campaign |
| 016 | gl_accounts, insurance_requirements, insurance_policies, contract_amendments, contract_clauses, contract_obligations, ip_rights, permits, engineering_approvals, compliance_checklists, asset_certifications, budget_approvals, payment_approvals, purchase_requisitions, goods_receipts, vendor_risk_scores, entity_dependencies, governance_audit_log | Legal / Compliance / Finance |
| 017 | project_locations, space_bookings, event_space_overlays, location_compliance_docs, location_inspections, location_costs, location_contacts | Spatial hierarchy |
| 018 | user_profiles, org_memberships, invitations, onboarding_step_definitions, user_onboarding_progress, user_preferences, login_audit_log, user_sessions, api_tokens, temporary_access_grants, role_change_log, user_compliance_acks | User lifecycle / Identity |
| 019 | warehouse_zones, warehouse_locations, inventory_reservations, shipment_items, kits, kit_items, scan_events, load_plans, load_plan_items, logistics_events, asset_damage_reports, maintenance_schedules, depreciation_schedules, inventory_audits, audit_count_items | Asset / Inventory / Logistics |
| 020 | live_event_instances, command_positions, readiness_gates, department_statuses, ros_cues, comm_channels, comm_log_entries, live_crew_assignments, equipment_check_ins, environmental_readings, live_financial_snapshots, foh_zones, foh_zone_readings, vip_guests, vip_service_requests, guest_incidents, strike_sequences | Live event operations |
| 021-030 | Integrated production lifecycle, audit remediation, user trigger fixes, seed data, settings framework, feature flags, RBAC custom roles, role-based RLS, settings approval workflow | Platform infrastructure |

---

## Appendix A: Validation Quick Reference

```typescript
// Zod schemas for common field types
import { z } from 'zod';

export const FieldValidators = {
  primaryKey:     z.string().uuid(),
  organizationId: z.string().uuid(),
  name:           z.string().min(1).max(255),
  description:    z.string().max(10000).optional(),
  title:          z.string().min(1).max(500),
  email:          z.string().email(),
  phone:          z.string().regex(/^[+]?[0-9\s\-().]+$/).max(50).optional(),
  slug:           z.string().regex(/^[a-z0-9-]+$/).max(255),
  url:            z.string().url().optional(),
  money:          z.number().min(0),
  percentage:     z.number().min(0).max(100),
  hours:          z.number().min(0).max(999.99),
  rating:         z.number().int().min(1).max(5),
  percentComplete: z.number().int().min(0).max(100),
  hexColor:       z.string().regex(/^#[0-9a-fA-F]{6}$/),
  currencyCode:   z.string().regex(/^[A-Z]{3}$/),
  featureFlagKey: z.string().regex(/^[a-z][a-z0-9_]*$/),
} as const;
```

## Appendix B: PII Classification Legend

| Classification | Description | Masking | Encryption | RBAC |
|---|---|---|---|---|
| `none` | No personal data | None | None | Any role |
| `indirect_pii` | Linkable to person (e.g., user_id) | Vendor/Client masked | None | PM+ |
| `direct_pii` | Identifies person (name, email, phone) | Vendor/Client masked | Recommended | PM+ |
| `sensitive_pii` | High-risk data (emergency, tax ID) | All non-exec masked | **Required** | Exec only |
| `financial_pii` | Compensation, invoices, budgets | Vendor/Client masked | None | Exec/PM |
| `security` | Tokens, secrets, hashes | Never exposed in API | **Required** | System only |
| `compliance` | Consent records, acknowledgments | None | None | Audit access |
| `potential_pii` | Free-text that may contain PII | Review required | None | Context-dependent |
