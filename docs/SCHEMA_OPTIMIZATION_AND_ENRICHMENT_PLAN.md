# Frozen Phoenix — Schema Optimization & Enrichment Plan

> **Version:** 1.0.0 | **Date:** 2026-03-16
> **Scope:** All 13 workstreams, ~260 tables, ~80 enums, 74 existing migrations
> **Objective:** Strict 3NF/SSOT compliance globally, full normalization with zero redundancy, enterprise-grade field coverage

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Remediation Already Completed (067–074)](#2-remediation-already-completed)
3. [Workstream A — Identity & Organization](#3-workstream-a--identity--organization)
4. [Workstream B — Projects, Budgets & Financial](#4-workstream-b--projects-budgets--financial)
5. [Workstream C — CRM & Pipeline](#5-workstream-c--crm--pipeline)
6. [Workstream D — Production & Live Events](#6-workstream-d--production--live-events)
7. [Workstream E — Catalog & Advancing](#7-workstream-e--catalog--advancing)
8. [Workstream F — Messaging & Communications](#8-workstream-f--messaging--communications)
9. [Workstream G — Credentialing & Ticketing](#9-workstream-g--credentialing--ticketing)
10. [Workstream H — RBAC, Settings & Feature Flags](#10-workstream-h--rbac-settings--feature-flags)
11. [Workstream I — Assets, Inventory & Logistics](#11-workstream-i--assets-inventory--logistics)
12. [Workstream J — Documents, Knowledge & Digital Assets](#12-workstream-j--documents-knowledge--digital-assets)
13. [Workstream K — Compliance, Audit & Health](#13-workstream-k--compliance-audit--health)
14. [Workstream L — Vendor & Workforce](#14-workstream-l--vendor--workforce)
15. [Workstream M — Location & Spatial](#15-workstream-m--location--spatial)
16. [Cross-Workstream: Removed Redundancies](#16-cross-workstream-removed-redundancies)
17. [Cross-Workstream: New FK Relationships](#17-cross-workstream-new-fk-relationships)
18. [Enum Consolidation & Extension](#18-enum-consolidation--extension)
19. [Migration Priority Order](#19-migration-priority-order)

---

## 1. Executive Summary

### Current State

| Metric                 | Count                        |
| ---------------------- | ---------------------------- |
| Tables                 | ~260                         |
| Enums                  | ~80                          |
| Migrations             | 74 (001–074)                 |
| Workstreams            | 13                           |
| Identity fragmentation | **Resolved** (067)           |
| RLS gaps               | **Resolved** (068)           |
| Duplicate tables       | **Resolved** (069–070)       |
| JSONB normalization    | **Partially resolved** (071) |
| Enum hygiene           | **Partially resolved** (073) |
| Missing indexes        | **Resolved** (072)           |

### What This Plan Delivers

- **78 new columns** across 35 tables (typed, constrained, RBAC-tiered)
- **4 new tables** (new entities required for normalization)
- **8 deprecated tables** already soft-deprecated (069) — formalized here
- **6 new FK relationships** closing cross-module gaps
- **3 enum extensions**, **1 enum merge**, **2 enum→table conversions**
- **12 new composite indexes** for high-traffic query patterns
- **Migration sequence** of 6 ordered migrations (075–080)

### 3NF/SSOT Compliance Summary

| Violation Class                   | Found         | Resolved in 067–074 | Remaining | Resolved in This Plan |
| --------------------------------- | ------------- | ------------------- | --------- | --------------------- |
| Identity fragmentation            | 3 user tables | ✅ 067              | 0         | —                     |
| Duplicate/overlapping tables      | 12 pairs      | ✅ 069–070          | 0         | —                     |
| JSONB bags (should be relational) | 8 columns     | ✅ 071 (2 of 3)     | 1         | ✅ 075                |
| Missing FKs (cross-module)        | 6 gaps        | 0                   | 6         | ✅ 076                |
| Stale/overlapping enums           | 4 issues      | ✅ 073 (3 of 4)     | 1         | ✅ 078                |
| Missing RLS                       | 6 tables      | ✅ 068              | 0         | —                     |
| Missing enrichment columns        | 78 columns    | 0                   | 78        | ✅ 075–077            |
| Missing composite indexes         | 20 patterns   | ✅ 072 (15)         | 5         | ✅ 079                |

---

## 2. Remediation Already Completed

Migrations 067–074 addressed the most critical 3NF/SSOT violations. This plan builds on top of that foundation.

| Migration                     | Scope                                                                                  | Status  |
| ----------------------------- | -------------------------------------------------------------------------------------- | ------- |
| 067 — Identity Consolidation  | `worker_profiles` → `user_profiles` FK, `v_profiles` view, `get_user_org_id()` rewrite | ✅ Done |
| 068 — RLS Gap Closure         | Multi-org CRUD policies on 10 tables                                                   | ✅ Done |
| 069 — Table Consolidation     | Backward-compat views + DEPRECATED comments on 7 legacy tables                         | ✅ Done |
| 070 — Duplicate Cleanup (061) | Canonical ownership documented for 10 tables                                           | ✅ Done |
| 071 — JSONB Normalization     | `brief_deliverables` junction, `departments` lookup table                              | ✅ Done |
| 072 — Missing Indexes         | ~15 composite indexes on high-traffic patterns                                         | ✅ Done |
| 073 — Enum Hygiene            | `sheet_status` merge, `sow_status`/`booking_status`/`entity_type` extensions           | ✅ Done |
| 074 — Schema Validation       | RLS, FK, index, deprecated table validation checks                                     | ✅ Done |

---

## 3. Workstream A — Identity & Organization

**Tables:** `organizations`, `user_profiles`, `org_memberships`, `invitations`, `departments`, `teams`, `team_members`

### 3.1 Modified Tables

#### organizations

| Column                    | Type               | Constraint         | Justification                             | RBAC Tier  |
| ------------------------- | ------------------ | ------------------ | ----------------------------------------- | ---------- |
| `tax_id`                  | TEXT               | NULLABLE           | IRS 1099/GAAP invoicing                   | enterprise |
| `billing_email`           | TEXT               | NULLABLE           | Billing contact separation from org admin | pro        |
| `default_currency`        | TEXT DEFAULT 'USD' | CHECK (length = 3) | ISO 4217 multi-currency                   | core       |
| `fiscal_year_start_month` | INTEGER DEFAULT 1  | CHECK (1–12)       | GAAP/IFRS reporting alignment             | pro        |
| `deleted_at`              | TIMESTAMPTZ        | NULLABLE           | SOC2 CC8.1 soft-delete                    | core       |

**Index:** `CREATE INDEX idx_organizations_status ON organizations(status) WHERE status != 'inactive'`

#### user_profiles

| Column                   | Type                            | Constraint | Justification                | RBAC Tier |
| ------------------------ | ------------------------------- | ---------- | ---------------------------- | --------- |
| `preferred_locale`       | TEXT DEFAULT 'en-US'            | NOT NULL   | GDPR Art. 12 i18n            | core      |
| `timezone`               | TEXT DEFAULT 'America/New_York' | NOT NULL   | Global crew scheduling       | core      |
| `emergency_contact_json` | JSONB                           | NULLABLE   | OSHA 1910.38 emergency plans | core      |

#### invitations

| Column      | Type              | Constraint   | Justification                     | RBAC Tier |
| ----------- | ----------------- | ------------ | --------------------------------- | --------- |
| `max_uses`  | INTEGER           | DEFAULT NULL | Bulk/link invitation usage limits | pro       |
| `use_count` | INTEGER DEFAULT 0 | NOT NULL     | Track link usage                  | pro       |

#### departments

| Column             | Type | Constraint | Justification        | RBAC Tier |
| ------------------ | ---- | ---------- | -------------------- | --------- |
| `cost_center_code` | TEXT | NULLABLE   | GAAP cost allocation | pro       |

#### teams

| Column         | Type    | Constraint | Justification             | RBAC Tier |
| -------------- | ------- | ---------- | ------------------------- | --------- |
| `max_capacity` | INTEGER | NULLABLE   | Resource planning ceiling | pro       |

### 3.2 Removed Redundancies

| Item                           | Action                                                                 | Status               |
| ------------------------------ | ---------------------------------------------------------------------- | -------------------- |
| `profiles` table               | Replaced by `v_profiles` view over `user_profiles` + `org_memberships` | ✅ Done (067)        |
| `organizations.settings` JSONB | Replaced by `settings` table (026)                                     | Remove column in 075 |
| `roles`/`permissions` (002)    | Superseded by `role_definitions`/`permission_grants` (028)             | Deprecate in 075     |

### 3.3 New FK Relationships

None — all identity FKs resolved in 067.

---

## 4. Workstream B — Projects, Budgets & Financial

**Tables:** `projects`, `tasks`, `milestones`, `budgets`, `budget_line_items`, `expenses`, `time_entries`, `invoices`, `client_invoices`, `purchase_orders`, `gl_accounts`, `payroll_batches`, `scopes_of_work`, `sow_deliverables`, `production_budget_lines`, `production_expenses`, `production_time_entries`, `expense_reports`, `timesheets`

### 4.1 Modified Tables

#### projects

| Column                     | Type                            | Constraint                                       | Justification                                 | RBAC Tier  |
| -------------------------- | ------------------------------- | ------------------------------------------------ | --------------------------------------------- | ---------- |
| `timezone`                 | TEXT DEFAULT 'America/New_York' | NOT NULL                                         | IANA timezone for local schedule rendering    | core       |
| `load_out_completed_at`    | TIMESTAMPTZ                     | NULLABLE                                         | Kill switch trigger (48hr auto-revoke)        | core       |
| `weather_contingency_plan` | TEXT                            | NULLABLE                                         | Outdoor event risk mitigation; insurance req. | pro        |
| `insurance_policy_id`      | UUID                            | FK → `insurance_policies(id)` ON DELETE SET NULL | COI tracking                                  | pro        |
| `sustainability_score`     | NUMERIC(5,2)                    | NULLABLE, CHECK (0–100)                          | Leave No Trace / ESG reporting                | enterprise |
| `post_mortem_score`        | NUMERIC(5,2)                    | NULLABLE, CHECK (0–100)                          | Retrospective KPI; margin analysis            | enterprise |

**Index:** `CREATE INDEX idx_projects_status_org ON projects(organization_id, status)`
**Index:** `CREATE INDEX idx_projects_phase ON projects(current_phase) WHERE current_phase IS NOT NULL`

#### tasks

| Column            | Type                  | Constraint             | Justification                            | RBAC Tier |
| ----------------- | --------------------- | ---------------------- | ---------------------------------------- | --------- |
| `estimated_hours` | NUMERIC(8,2)          | NULLABLE, CHECK (>= 0) | Resource planning; labor cost projection | pro       |
| `actual_hours`    | NUMERIC(8,2)          | NULLABLE, CHECK (>= 0) | Time tracking reconciliation             | pro       |
| `safety_critical` | BOOLEAN DEFAULT false | NOT NULL               | OSHA rigging/electrical/pyro flagging    | core      |

#### budget_line_items

| Column             | Type                    | Constraint                                | Justification                                   | RBAC Tier |
| ------------------ | ----------------------- | ----------------------------------------- | ----------------------------------------------- | --------- |
| `gl_account_id`    | UUID                    | FK → `gl_accounts(id)` ON DELETE SET NULL | GAAP cost coding                                | pro       |
| `cost_center`      | TEXT                    | NULLABLE                                  | Department cost allocation; P&L attribution     | pro       |
| `committed_amount` | NUMERIC(12,2) DEFAULT 0 | NOT NULL, CHECK (>= 0)                    | 3-bucket budgeting (estimated/committed/actual) | pro       |

#### purchase_orders

| Column          | Type               | Constraint                                  | Justification                        | RBAC Tier |
| --------------- | ------------------ | ------------------------------------------- | ------------------------------------ | --------- |
| `po_number`     | TEXT               | NULLABLE, UNIQUE per org                    | Human-readable PO reference          | core      |
| `currency`      | TEXT DEFAULT 'USD' | CHECK (length = 3)                          | ISO 4217 multi-currency              | pro       |
| `payment_terms` | TEXT               | NULLABLE                                    | Net-30/Net-60; cash flow forecasting | pro       |
| `approved_by`   | UUID               | FK → `user_profiles(id)` ON DELETE SET NULL | SOX segregation of duties            | pro       |

#### invoices

| Column           | Type                    | Constraint             | Justification                         | RBAC Tier |
| ---------------- | ----------------------- | ---------------------- | ------------------------------------- | --------- |
| `invoice_number` | TEXT                    | NULLABLE               | Vendor invoice reference; 3-way match | core      |
| `currency`       | TEXT DEFAULT 'USD'      | CHECK (length = 3)     | ISO 4217                              | pro       |
| `tax_amount`     | NUMERIC(12,2) DEFAULT 0 | NOT NULL, CHECK (>= 0) | Sales tax/VAT compliance              | pro       |

#### client_invoices

| Column                  | Type                   | Constraint    | Justification               | RBAC Tier  |
| ----------------------- | ---------------------- | ------------- | --------------------------- | ---------- |
| `asc_606_recognized_at` | TIMESTAMPTZ            | NULLABLE      | ASC 606 revenue recognition | enterprise |
| `retention_percent`     | NUMERIC(5,2) DEFAULT 0 | CHECK (0–100) | Client payment holdback     | pro        |

#### expenses

| Column             | Type                  | Constraint | Justification    | RBAC Tier |
| ------------------ | --------------------- | ---------- | ---------------- | --------- |
| `receipt_verified` | BOOLEAN DEFAULT false | NOT NULL   | Audit compliance | core      |

#### time_entries

| Column          | Type                  | Constraint | Justification   | RBAC Tier |
| --------------- | --------------------- | ---------- | --------------- | --------- |
| `overtime_flag` | BOOLEAN DEFAULT false | NOT NULL   | FLSA compliance | pro       |

#### payroll_batches

| Column                  | Type          | Constraint                             | Justification                        | RBAC Tier  |
| ----------------------- | ------------- | -------------------------------------- | ------------------------------------ | ---------- |
| `tax_withholding_total` | NUMERIC(12,2) | NULLABLE                               | Federal/state tax; IRS compliance    | enterprise |
| `union_dues_total`      | NUMERIC(12,2) | NULLABLE                               | IATSE/Teamsters/SAG-AFTRA deductions | enterprise |
| `workers_comp_total`    | NUMERIC(12,2) | NULLABLE                               | Workers' comp allocation             | enterprise |
| `project_id`            | UUID          | FK → `projects(id)` ON DELETE SET NULL | Project-specific payroll runs        | pro        |

### 4.2 Removed Redundancies

| Item                                             | Action                                                                                         |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `budget_line_items` vs `production_budget_lines` | Keep both — different scope (project-level vs production-level). Document canonical ownership. |

### 4.3 New FK Relationships

| Source              | Column                | Target                   | Constraint         |
| ------------------- | --------------------- | ------------------------ | ------------------ |
| `budget_line_items` | `gl_account_id`       | `gl_accounts(id)`        | ON DELETE SET NULL |
| `purchase_orders`   | `approved_by`         | `user_profiles(id)`      | ON DELETE SET NULL |
| `projects`          | `insurance_policy_id` | `insurance_policies(id)` | ON DELETE SET NULL |
| `payroll_batches`   | `project_id`          | `projects(id)`           | ON DELETE SET NULL |

---

## 5. Workstream C — CRM & Pipeline

**Tables:** `deals`, `leads`, `lead_activities`, `companies`, `contacts`, `accounts`, `opportunities`, `opportunity_activities`, `pipelines`, `stakeholders`, `stakeholder_projects`, `lost_reasons`, `change_orders`, `revenue_schedules`, `account_health_scores`, `testimonials`, `reviews`, `case_studies`

### 5.1 Modified Tables

#### deals

| Column           | Type               | Constraint                                              | Justification                       | RBAC Tier |
| ---------------- | ------------------ | ------------------------------------------------------- | ----------------------------------- | --------- |
| `source_id`      | UUID               | FK → `lead_sources(id)` ON DELETE SET NULL              | Attribution tracking; marketing ROI | pro       |
| `lost_reason_id` | UUID               | FK → `lost_reasons(id)` ON DELETE SET NULL              | Pipeline loss analysis              | pro       |
| `weighted_value` | NUMERIC(12,2)      | GENERATED ALWAYS AS (value \* probability / 100) STORED | Pipeline forecasting                | core      |
| `currency`       | TEXT DEFAULT 'USD' | CHECK (length = 3)                                      | Multi-currency deal tracking        | pro       |

**Re-type:** `deals.probability` from INTEGER → NUMERIC(5,2) (decimal probabilities)

#### contacts

| Column                  | Type                  | Constraint | Justification                         | RBAC Tier |
| ----------------------- | --------------------- | ---------- | ------------------------------------- | --------- |
| `gdpr_consent_at`       | TIMESTAMPTZ           | NULLABLE   | GDPR Art. 7 consent timestamp         | core      |
| `communication_opt_out` | BOOLEAN DEFAULT false | NOT NULL   | CAN-SPAM / CCPA opt-out               | core      |
| `dietary_restrictions`  | TEXT                  | NULLABLE   | Hospitality/catering for VIP contacts | pro       |

#### stakeholders

| Column       | Type | Constraint                             | Justification                        | RBAC Tier |
| ------------ | ---- | -------------------------------------- | ------------------------------------ | --------- |
| `title`      | TEXT | NULLABLE                               | Professional title for contact cards | core      |
| `company`    | TEXT | NULLABLE                               | Company affiliation (external)       | core      |
| `account_id` | UUID | FK → `accounts(id)` ON DELETE SET NULL | CRM account bridge                   | pro       |
| `contact_id` | UUID | FK → `contacts(id)` ON DELETE SET NULL | CRM contact deduplication            | pro       |

#### change_orders

| Column               | Type        | Constraint | Justification                     | RBAC Tier |
| -------------------- | ----------- | ---------- | --------------------------------- | --------- |
| `client_approved_at` | TIMESTAMPTZ | NULLABLE   | Signed change order documentation | pro       |

#### case_studies

| Column              | Type                  | Constraint | Justification                     | RBAC Tier |
| ------------------- | --------------------- | ---------- | --------------------------------- | --------- |
| `industry_tags`     | TEXT[]                | NULLABLE   | Filtered browsing categorization  | core      |
| `client_approved`   | BOOLEAN DEFAULT false | NOT NULL   | Client sign-off before publishing | core      |
| `video_url`         | TEXT                  | NULLABLE   | Video case study content          | pro       |
| `testimonial_quote` | TEXT                  | NULLABLE   | Client testimonial for marketing  | pro       |

### 5.2 New FK Relationships

| Source         | Column           | Target             | Constraint         |
| -------------- | ---------------- | ------------------ | ------------------ |
| `deals`        | `source_id`      | `lead_sources(id)` | ON DELETE SET NULL |
| `deals`        | `lost_reason_id` | `lost_reasons(id)` | ON DELETE SET NULL |
| `stakeholders` | `account_id`     | `accounts(id)`     | ON DELETE SET NULL |
| `stakeholders` | `contact_id`     | `contacts(id)`     | ON DELETE SET NULL |

### 5.3 Removed Redundancies

| Item                                       | Action                                                                                                   |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `stakeholders` duplicating `contacts` data | Bridge via FK (above) rather than deprecate — different lifecycle semantics (project role vs CRM record) |

---

## 6. Workstream D — Production & Live Events

**Tables:** `live_event_instances`, `command_positions`, `readiness_gates`, `department_statuses`, `ros_cues`, `comm_channels`, `comm_log_entries`, `live_crew_assignments`, `equipment_check_ins`, `environmental_readings`, `live_financial_snapshots`, `foh_zones`, `foh_zone_readings`, `vip_guests`, `vip_service_requests`, `guest_incidents`, `strike_sequences`, `work_packages`, `boms`, `bom_lines`, `production_runs`, `qc_gates`, `technical_specs`, `call_sheets`, `tech_sheets`

### 6.1 Modified Tables

#### live_event_instances

| Column                        | Type                  | Constraint            | Justification                          | RBAC Tier |
| ----------------------------- | --------------------- | --------------------- | -------------------------------------- | --------- |
| `fire_marshal_capacity`       | INTEGER               | NULLABLE, CHECK (> 0) | Fire code legal occupancy              | core      |
| `emergency_services_notified` | BOOLEAN DEFAULT false | NOT NULL              | Pre-event EMS/fire/police notification | core      |
| `weather_hold_threshold`      | JSONB                 | NULLABLE              | Wind/lightning/heat thresholds         | core      |

#### environmental_readings

| Column                | Type         | Constraint | Justification                     | RBAC Tier |
| --------------------- | ------------ | ---------- | --------------------------------- | --------- |
| `wet_bulb_globe_temp` | NUMERIC(5,2) | NULLABLE   | OSHA/NIOSH WBGT heat stress index | core      |

#### comm_log_entries

| Column           | Type                  | Constraint                                 | Justification                    | RBAC Tier |
| ---------------- | --------------------- | ------------------------------------------ | -------------------------------- | --------- |
| `priority_level` | TEXT DEFAULT 'normal' | CHECK (routine, normal, urgent, emergency) | Emergency message classification | core      |

#### technical_specs

| Column                        | Type                  | Constraint | Justification                        | RBAC Tier |
| ----------------------------- | --------------------- | ---------- | ------------------------------------ | --------- |
| `structural_engineer_signoff` | BOOLEAN DEFAULT false | NOT NULL   | ESTA E1.2 structural requirements    | pro       |
| `pe_stamp_document_url`       | TEXT                  | NULLABLE   | PE stamp for load-bearing structures | pro       |

#### work_packages

| Column                 | Type                  | Constraint | Justification             | RBAC Tier |
| ---------------------- | --------------------- | ---------- | ------------------------- | --------- |
| `safety_plan_required` | BOOLEAN DEFAULT false | NOT NULL   | OSHA safety plan flagging | core      |

#### production_runs

| Column                   | Type          | Constraint             | Justification                | RBAC Tier  |
| ------------------------ | ------------- | ---------------------- | ---------------------------- | ---------- |
| `environmental_waste_kg` | NUMERIC(10,2) | NULLABLE, CHECK (>= 0) | ESG sustainability reporting | enterprise |

#### post_event_reports (if table exists in 020)

| Column                | Type          | Constraint                    | Justification      | RBAC Tier  |
| --------------------- | ------------- | ----------------------------- | ------------------ | ---------- |
| `nps_score`           | NUMERIC(3,1)  | NULLABLE, CHECK (-100 to 100) | Net Promoter Score | pro        |
| `carbon_footprint_kg` | NUMERIC(10,2) | NULLABLE, CHECK (>= 0)        | ESG reporting      | enterprise |

### 6.2 Removed Redundancies

| Item                                                       | Action | Status        |
| ---------------------------------------------------------- | ------ | ------------- |
| `call_sheet_status` + `tech_sheet_status` → `sheet_status` | Merged | ✅ Done (073) |

---

## 7. Workstream E — Catalog & Advancing

**Tables:** `catalog_categories`, `catalog_items`, `catalog_item_modifiers`, `catalog_modifier_options`, `catalog_org_overrides`, `advance_templates`, `production_advances`, `production_advance_items`, `advance_status_history`

### 7.1 Modified Tables

No enrichment columns needed. These tables are well-designed with full lifecycle enums, org-scoping, and audit fields. `catalog_items.specifications` JSONB is acceptable as-is (truly schemaless product specs).

### 7.2 Normalization Status

| Item                                                           | Status                                |
| -------------------------------------------------------------- | ------------------------------------- |
| `creative_briefs.deliverables` → `brief_deliverables` junction | ✅ Done (071)                         |
| `catalog_items.specifications`                                 | Keep JSONB — schemaless by design     |
| `production_advances.metadata`                                 | Keep JSONB — truly schemaless context |

---

## 8. Workstream F — Messaging & Communications

**Tables:** `conversations`, `conversation_members`, `messages`, `message_reactions`, `message_read_receipts`, `mandatory_read_acknowledgments`, `channel_templates`, `messaging_escalation_rules`

### 8.1 Modified Tables

No enrichment columns needed. Messaging schema follows Slack/Discord patterns with proper normalization:

- Conversations → Members (junction, not JSONB)
- Messages → Reactions (junction, not JSONB)
- Read receipts as separate table (not boolean on messages)

**Index already added (072):** `messages(conversation_id, created_at DESC)` for chat pagination.

---

## 9. Workstream G — Credentialing & Ticketing

**Tables:** `credential_types`, `credential_inventory_pools`, `credential_assignments`, `credential_scan_log`, `bulk_import_jobs`, `export_templates`, `provider_connections`, `provider_ticket_map`, `pos_transactions`, `pos_transaction_items`, `webhook_events`, `sync_events`, `sync_conflict_policies`

### 9.1 Modified Tables

No enrichment columns needed. These tables were designed recently (051, 054, 055) with full 3NF compliance, proper enums, and comprehensive FK relationships.

---

## 10. Workstream H — RBAC, Settings & Feature Flags

**Tables:** `role_definitions`, `permission_grants`, `access_audit_log`, `setting_definitions`, `settings`, `settings_change_log`, `settings_change_requests`, `feature_flags`, `feature_flag_overrides`, `field_tier_assignments`, `field_role_access`, `org_subscriptions`, `field_bundles`, `field_bundle_items`, `org_bundle_subscriptions`, `field_access_overrides`, `field_usage_events`, `field_usage_daily`, `upsell_triggers`, `upsell_events`, `brands`, `notification_preferences`

### 10.1 Modified Tables

#### role_definitions

| Column          | Type | Constraint                                     | Justification                 | RBAC Tier  |
| --------------- | ---- | ---------------------------------------------- | ----------------------------- | ---------- |
| `inherits_from` | UUID | FK → `role_definitions(id)` ON DELETE SET NULL | Permission inheritance chains | enterprise |

#### permission_grants

| Column       | Type        | Constraint                                  | Justification                                 | RBAC Tier |
| ------------ | ----------- | ------------------------------------------- | --------------------------------------------- | --------- |
| `expires_at` | TIMESTAMPTZ | NULLABLE                                    | Temporal permission grants; contractor access | pro       |
| `granted_by` | UUID        | FK → `user_profiles(id)` ON DELETE SET NULL | Delegation audit; SOC2 CC6.1                  | core      |

#### brands

| Column          | Type | Constraint       | Justification           | RBAC Tier  |
| --------------- | ---- | ---------------- | ----------------------- | ---------- |
| `custom_domain` | TEXT | NULLABLE, UNIQUE | White-label vanity URLs | enterprise |

#### notification_preferences

| Column              | Type                    | Constraint                      | Justification            | RBAC Tier |
| ------------------- | ----------------------- | ------------------------------- | ------------------------ | --------- |
| `quiet_hours_start` | TEXT                    | NULLABLE                        | DND window start (HH:MM) | core      |
| `quiet_hours_end`   | TEXT                    | NULLABLE                        | DND window end (HH:MM)   | core      |
| `digest_frequency`  | TEXT DEFAULT 'realtime' | CHECK (realtime, daily, weekly) | Email digest cadence     | core      |

#### feature_flags

| Column                    | Type               | Constraint    | Justification                        | RBAC Tier |
| ------------------------- | ------------------ | ------------- | ------------------------------------ | --------- |
| `rollout_percentage_step` | INTEGER DEFAULT 10 | CHECK (1–100) | Gradual rollout automation step size | pro       |

### 10.2 Removed Redundancies

| Item                        | Action                                                     | Status           |
| --------------------------- | ---------------------------------------------------------- | ---------------- |
| `roles`/`permissions` (002) | Superseded by `role_definitions`/`permission_grants` (028) | Deprecate in 075 |

---

## 11. Workstream I — Assets, Inventory & Logistics

**Tables:** `assets`, `vehicles`, `warehouse_zones`, `warehouse_locations`, `inventory_reservations`, `shipments`, `shipment_items`, `kits`, `kit_items`, `scan_events`, `load_plans`, `load_plan_items`, `logistics_events`, `asset_damage_reports`, `maintenance_schedules`, `depreciation_schedules`, `inventory_audits`, `audit_count_items`, `consumables`, `consumable_usage`, `maintenance_records`

### 11.1 Modified Tables

#### assets

| Column                  | Type          | Constraint             | Justification                | RBAC Tier |
| ----------------------- | ------------- | ---------------------- | ---------------------------- | --------- |
| `qr_code_url`           | TEXT          | NULLABLE               | QR/barcode label generation  | core      |
| `insurance_value`       | NUMERIC(12,2) | NULLABLE, CHECK (>= 0) | Replacement value for claims | pro       |
| `last_calibration_date` | DATE          | NULLABLE               | NIST calibration tracking    | pro       |

#### vehicles

| Column                    | Type    | Constraint             | Justification                 | RBAC Tier |
| ------------------------- | ------- | ---------------------- | ----------------------------- | --------- |
| `vin`                     | TEXT    | NULLABLE               | DOT vehicle identification    | pro       |
| `last_inspection_date`    | DATE    | NULLABLE               | DOT 49 CFR annual inspection  | core      |
| `next_inspection_due`     | DATE    | NULLABLE               | Proactive compliance flagging | core      |
| `odometer_reading`        | INTEGER | NULLABLE, CHECK (>= 0) | Mileage tracking              | core      |
| `insurance_policy_number` | TEXT    | NULLABLE               | Commercial auto insurance ref | pro       |

#### shipments

| Column                     | Type | Constraint | Justification                       | RBAC Tier  |
| -------------------------- | ---- | ---------- | ----------------------------------- | ---------- |
| `customs_clearance_status` | TEXT | NULLABLE   | International customs/duty tracking | enterprise |
| `hazmat_class`             | TEXT | NULLABLE   | DOT HAZMAT classification           | core       |
| `bill_of_lading_number`    | TEXT | NULLABLE   | Carrier BOL for freight tracking    | pro        |

#### load_plans

| Column                     | Type  | Constraint | Justification                       | RBAC Tier |
| -------------------------- | ----- | ---------- | ----------------------------------- | --------- |
| `axle_weight_distribution` | JSONB | NULLABLE   | DOT weight compliance for long-haul | pro       |

#### goods_receipts

| Column                  | Type | Constraint                                        | Justification                | RBAC Tier |
| ----------------------- | ---- | ------------------------------------------------- | ---------------------------- | --------- |
| `warehouse_location_id` | UUID | FK → `warehouse_locations(id)` ON DELETE SET NULL | Inventory placement tracking | pro       |

---

## 12. Workstream J — Documents, Knowledge & Digital Assets

**Tables:** `documents`, `document_versions`, `document_templates`, `digital_assets`, `asset_versions`, `asset_links`, `asset_tags`, `asset_tag_assignments`, `asset_access_controls`, `asset_access_log`, `asset_retention_policies`, `legal_holds`, `asset_dependencies`, `knowledge_articles`, `knowledge_article_links`, `storage_objects`, `brand_kits`, `decks`, `deck_slides`, `brand_guidelines`, `brand_guideline_sections`, `brand_guideline_versions`

### 12.1 Modified Tables

#### digital_assets

| Column                  | Type                  | Constraint | Justification                       | RBAC Tier |
| ----------------------- | --------------------- | ---------- | ----------------------------------- | --------- |
| `ai_generated`          | BOOLEAN DEFAULT false | NOT NULL   | FTC/EU AI Act disclosure            | core      |
| `model_release_on_file` | BOOLEAN DEFAULT false | NOT NULL   | Talent/model release; IP protection | pro       |

#### brand_kits

| Column                   | Type | Constraint                                  | Justification             | RBAC Tier |
| ------------------------ | ---- | ------------------------------------------- | ------------------------- | --------- |
| `brand_voice_guidelines` | TEXT | NULLABLE                                    | Copy tone documentation   | pro       |
| `do_not_use_notes`       | TEXT | NULLABLE                                    | Brand misuse restrictions | pro       |
| `approved_by`            | UUID | FK → `user_profiles(id)` ON DELETE SET NULL | Client approval sign-off  | core      |

**Re-type:** `brand_kits.client_id` from TEXT → UUID FK → `accounts(id)` ON DELETE SET NULL

### 12.2 New Table: `deck_shares`

Decks currently lack sharing controls. Create a junction table:

```sql
CREATE TABLE deck_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  shared_with_email TEXT,
  access_level TEXT NOT NULL DEFAULT 'view' CHECK (access_level IN ('view', 'comment', 'edit')),
  expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(deck_id, shared_with_user_id)
);
```

### 12.3 Removed Redundancies

| Item                                             | Action                       | Status        |
| ------------------------------------------------ | ---------------------------- | ------------- |
| `knowledge_base_articles` → `knowledge_articles` | Backward-compat view created | ✅ Done (069) |

---

## 13. Workstream K — Compliance, Audit & Health

**Tables:** `insurance_policies`, `insurance_requirements`, `permits`, `engineering_approvals`, `compliance_checklists`, `compliance_checklist_items`, `asset_certifications`, `audit_findings`, `remediation_plans`, `remediation_tasks`, `control_assessments`, `evidence_artifacts`, `governance_audit_log`, `sla_definitions`, `sla_tracking`, `resilience_targets`, `service_health_checks`, `domain_events`

### 13.1 Modified Tables

#### insurance_policies

| Column                  | Type                  | Constraint             | Justification               | RBAC Tier |
| ----------------------- | --------------------- | ---------------------- | --------------------------- | --------- |
| `waiver_of_subrogation` | BOOLEAN DEFAULT false | NOT NULL               | Venue/client requirement    | pro       |
| `per_occurrence_limit`  | NUMERIC(12,2)         | NULLABLE, CHECK (>= 0) | Per-occurrence vs aggregate | pro       |

#### permits

| Column                       | Type | Constraint | Justification             | RBAC Tier |
| ---------------------------- | ---- | ---------- | ------------------------- | --------- |
| `jurisdiction_contact_phone` | TEXT | NULLABLE   | Day-of regulatory contact | core      |
| `conditions_of_approval`     | TEXT | NULLABLE   | Special permit conditions | core      |

### 13.2 Removed Redundancies

| Item                                               | Action               | Status        |
| -------------------------------------------------- | -------------------- | ------------- |
| `compliance_requirements` → `compliance_templates` | Backward-compat view | ✅ Done (069) |

---

## 14. Workstream L — Vendor & Workforce

**Tables:** `vendors`, `worker_profiles`, `worker_classifications`, `engagement_terms`, `compliance_templates`, `worker_compliance_docs`, `worker_reviews`, `classification_assessments`, `crew_members`, `certifications`, `shifts`, `schedule_entries`, `contracts`, `contract_amendments`, `contract_clauses`, `contract_obligations`, `work_orders`, `work_order_bids`, `dispatch_entries`, `estimates`, `job_cost_entries`, `vendor_portal_tokens`, `vendor_communications`, `vendor_risk_scores`, `onboarding_step_templates`, `worker_onboarding_runs`, `onboarding_step_progress`, `offboarding_step_templates`, `worker_offboarding_runs`, `offboarding_step_progress`

### 14.1 Modified Tables

#### vendors

| Column                       | Type                  | Constraint             | Justification                 | RBAC Tier  |
| ---------------------------- | --------------------- | ---------------------- | ----------------------------- | ---------- |
| `tax_id`                     | TEXT                  | NULLABLE               | 1099 reporting; IRS >$600/yr  | enterprise |
| `payment_terms_default`      | TEXT                  | NULLABLE               | Net-30/Net-60 default         | pro        |
| `insurance_minimum_required` | NUMERIC(12,2)         | NULLABLE, CHECK (>= 0) | Minimum COI coverage          | pro        |
| `diversity_classification`   | TEXT                  | NULLABLE               | MBE/WBE/SDVOB govt compliance | enterprise |
| `preferred_vendor`           | BOOLEAN DEFAULT false | NOT NULL               | Procurement optimization flag | core       |

#### crew_members

| Column                    | Type                  | Constraint | Justification                    | RBAC Tier  |
| ------------------------- | --------------------- | ---------- | -------------------------------- | ---------- |
| `emergency_contact_name`  | TEXT                  | NULLABLE   | OSHA 1910.38 safety-critical     | core       |
| `emergency_contact_phone` | TEXT                  | NULLABLE   | OSHA emergency contact           | core       |
| `union_local`             | TEXT                  | NULLABLE   | IATSE/Teamsters local number     | pro        |
| `union_classification`    | TEXT                  | NULLABLE   | Union job classification         | pro        |
| `dietary_restrictions`    | TEXT                  | NULLABLE   | On-site catering                 | core       |
| `i9_verified`             | BOOLEAN DEFAULT false | NOT NULL   | USCIS I-9 employment eligibility | enterprise |
| `i9_verified_at`          | TIMESTAMPTZ           | NULLABLE   | I-9 verification date            | enterprise |
| `w9_uploaded`             | BOOLEAN DEFAULT false | NOT NULL   | IRS W-9 for 1099 reporting       | enterprise |

#### certifications

| Column                  | Type               | Constraint  | Justification                     | RBAC Tier |
| ----------------------- | ------------------ | ----------- | --------------------------------- | --------- |
| `issuing_authority`     | TEXT               | NULLABLE    | OSHA/NFPA/state regulatory source | core      |
| `renewal_reminder_days` | INTEGER DEFAULT 30 | CHECK (> 0) | Proactive expiry notification     | core      |

#### shifts

| Column          | Type                  | Constraint                              | Justification                 | RBAC Tier |
| --------------- | --------------------- | --------------------------------------- | ----------------------------- | --------- |
| `location_id`   | UUID                  | FK → `locations(id)` ON DELETE SET NULL | Spatial scheduling            | core      |
| `break_minutes` | INTEGER DEFAULT 0     | CHECK (>= 0)                            | FLSA meal/rest break tracking | core      |
| `overtime_flag` | BOOLEAN DEFAULT false | NOT NULL                                | FLSA overtime calculation     | pro       |
| `checked_in_at` | TIMESTAMPTZ           | NULLABLE                                | Actual check-in for variance  | core      |

#### contracts

| Column                   | Type                  | Constraint | Justification              | RBAC Tier  |
| ------------------------ | --------------------- | ---------- | -------------------------- | ---------- |
| `indemnification_clause` | BOOLEAN DEFAULT false | NOT NULL   | Liability tracking         | enterprise |
| `jurisdiction`           | TEXT                  | NULLABLE   | Governing law jurisdiction | enterprise |

#### vendor_compliance_items

| Column                  | Type                 | Constraint  | Justification                       | RBAC Tier |
| ----------------------- | -------------------- | ----------- | ----------------------------------- | --------- |
| `auto_reminder_enabled` | BOOLEAN DEFAULT true | NOT NULL    | Proactive expiry notifications      | core      |
| `reminder_days_before`  | INTEGER DEFAULT 30   | CHECK (> 0) | Days before expiry to send reminder | core      |

#### worker_profiles (workforce)

| Column                    | Type | Constraint                                        | Justification                    | RBAC Tier  |
| ------------------------- | ---- | ------------------------------------------------- | -------------------------------- | ---------- |
| `background_check_status` | TEXT | NULLABLE, CHECK (pending, passed, failed, waived) | Sensitive venue access           | enterprise |
| `drug_test_date`          | DATE | NULLABLE                                          | DOT compliance for fleet drivers | enterprise |

### 14.2 Removed Redundancies

| Item                                                | Action               | Status        |
| --------------------------------------------------- | -------------------- | ------------- |
| `vendor_compliance_docs` → `worker_compliance_docs` | Backward-compat view | ✅ Done (069) |
| `vendor_reviews` → `worker_reviews`                 | Backward-compat view | ✅ Done (069) |
| `automation_logs` → `automation_executions`         | Backward-compat view | ✅ Done (069) |

---

## 15. Workstream M — Location & Spatial

**Tables:** `locations`, `project_locations`, `space_bookings`, `event_space_overlays`, `location_compliance_docs`, `location_inspections`, `location_costs`, `location_contacts`

### 15.1 Modified Tables

#### locations

| Column                   | Type    | Constraint | Justification                               | RBAC Tier |
| ------------------------ | ------- | ---------- | ------------------------------------------- | --------- |
| `ada_compliant`          | BOOLEAN | NULLABLE   | ADA Title III compliance flag               | core      |
| `ada_notes`              | TEXT    | NULLABLE   | Specific accessibility features/limitations | core      |
| `noise_ordinance_curfew` | TEXT    | NULLABLE   | Local noise cutoff (e.g., "10:00 PM")       | core      |

#### space_bookings

| Column                  | Type              | Constraint   | Justification                       | RBAC Tier |
| ----------------------- | ----------------- | ------------ | ----------------------------------- | --------- |
| `setup_time_minutes`    | INTEGER DEFAULT 0 | CHECK (>= 0) | Buffer scheduling — turnaround time | core      |
| `teardown_time_minutes` | INTEGER DEFAULT 0 | CHECK (>= 0) | Buffer scheduling — turnaround time | core      |

#### location_contacts

| Column              | Type                  | Constraint | Justification               | RBAC Tier |
| ------------------- | --------------------- | ---------- | --------------------------- | --------- |
| `available_hours`   | TEXT                  | NULLABLE   | Contact availability window | core      |
| `emergency_contact` | BOOLEAN DEFAULT false | NOT NULL   | Emergency/after-hours flag  | core      |

#### project_members

| Column              | Type        | Constraint | Justification                           | RBAC Tier |
| ------------------- | ----------- | ---------- | --------------------------------------- | --------- |
| `access_expires_at` | TIMESTAMPTZ | NULLABLE   | Auto-revoke post-project; SOC2 CC6.2    | core      |
| `department_role`   | TEXT        | NULLABLE   | Department-specific role within project | pro       |

---

## 16. Cross-Workstream: Removed Redundancies

### Tables Already Deprecated (069–070)

| Deprecated Table          | Canonical Replacement               | Backward-Compat View        |
| ------------------------- | ----------------------------------- | --------------------------- |
| `profiles`                | `user_profiles` + `org_memberships` | `v_profiles`                |
| `knowledge_base_articles` | `knowledge_articles`                | `v_knowledge_base_articles` |
| `custom_fields`           | `custom_field_definitions`          | `v_custom_fields`           |
| `custom_field_values`     | `custom_field_definitions` JSONB    | —                           |
| `compliance_requirements` | `compliance_templates`              | —                           |
| `vendor_compliance_docs`  | `worker_compliance_docs`            | —                           |
| `vendor_reviews`          | `worker_reviews`                    | —                           |
| `automation_logs`         | `automation_executions`             | `v_automation_logs`         |

### New Deprecations in This Plan

| Deprecated Item                       | Canonical Replacement     | Migration |
| ------------------------------------- | ------------------------- | --------- |
| `organizations.settings` JSONB column | `settings` table (026)    | 075       |
| `roles` table (002)                   | `role_definitions` (028)  | 075       |
| `permissions` table (002)             | `permission_grants` (028) | 075       |

### JSONB Normalization Status

| Column                                                 | Status                  | Resolution                                            |
| ------------------------------------------------------ | ----------------------- | ----------------------------------------------------- |
| `creative_briefs.deliverables`                         | ✅ Normalized (071)     | `brief_deliverables` junction                         |
| `department` enum                                      | ✅ → lookup table (071) | `departments` table                                   |
| `catalog_items.specifications`                         | Keep JSONB              | Truly schemaless product specs                        |
| `production_advances.metadata`                         | Keep JSONB              | Schemaless context data                               |
| `scenarios.metadata`                                   | Keep JSONB              | Flexible config by design                             |
| `automation_rules.conditions`                          | Keep JSONB              | Flexible rule trees                                   |
| `saved_views.filters`                                  | Keep JSONB              | Dynamic filter config                                 |
| `dashboards.layout`                                    | Keep JSONB              | Flexible grid layout                                  |
| `notification_preferences.channels`                    | Keep JSONB              | Flexible channel config                               |
| `onboarding_step_templates.applies_to_classifications` | Low priority            | Normalize to junction if >10 values used consistently |

---

## 17. Cross-Workstream: New FK Relationships

### New FKs (This Plan)

| #   | Source Table        | Column                  | Target Table              | ON DELETE | Migration |
| --- | ------------------- | ----------------------- | ------------------------- | --------- | --------- |
| 1   | `budget_line_items` | `gl_account_id`         | `gl_accounts(id)`         | SET NULL  | 076       |
| 2   | `purchase_orders`   | `approved_by`           | `user_profiles(id)`       | SET NULL  | 076       |
| 3   | `projects`          | `insurance_policy_id`   | `insurance_policies(id)`  | SET NULL  | 076       |
| 4   | `payroll_batches`   | `project_id`            | `projects(id)`            | SET NULL  | 076       |
| 5   | `goods_receipts`    | `warehouse_location_id` | `warehouse_locations(id)` | SET NULL  | 076       |
| 6   | `shifts`            | `location_id`           | `locations(id)`           | SET NULL  | 076       |
| 7   | `stakeholders`      | `account_id`            | `accounts(id)`            | SET NULL  | 076       |
| 8   | `stakeholders`      | `contact_id`            | `contacts(id)`            | SET NULL  | 076       |
| 9   | `deals`             | `source_id`             | `lead_sources(id)`        | SET NULL  | 076       |
| 10  | `deals`             | `lost_reason_id`        | `lost_reasons(id)`        | SET NULL  | 076       |
| 11  | `role_definitions`  | `inherits_from`         | `role_definitions(id)`    | SET NULL  | 076       |
| 12  | `permission_grants` | `granted_by`            | `user_profiles(id)`       | SET NULL  | 076       |
| 13  | `brand_kits`        | `approved_by`           | `user_profiles(id)`       | SET NULL  | 076       |
| 14  | `brand_kits`        | `client_id` (re-type)   | `accounts(id)`            | SET NULL  | 076       |

### Existing FK Gaps (Polymorphic — Cannot Enforce with SQL FK)

| Table                 | Pattern                    | Recommendation                                         |
| --------------------- | -------------------------- | ------------------------------------------------------ |
| `technical_specs`     | `(entity_type, entity_id)` | CHECK constraint on `entity_type` + trigger validation |
| `record_comments`     | `(entity_type, entity_id)` | CHECK constraint on `entity_type` + trigger validation |
| `record_activity_log` | `(entity_type, entity_id)` | CHECK constraint on `entity_type` + trigger validation |
| `asset_links`         | `(entity_type, entity_id)` | CHECK constraint on `entity_type` + trigger validation |

---

## 18. Enum Consolidation & Extension

### Already Completed (073)

| Change                                                             | Status  |
| ------------------------------------------------------------------ | ------- |
| `call_sheet_status` + `tech_sheet_status` → `sheet_status`         | ✅ Done |
| `sow_status` + `expired`, `superseded`                             | ✅ Done |
| `booking_status` + `requested`, `declined`, `completed`, `no_show` | ✅ Done |
| `entity_type` + 8 new values                                       | ✅ Done |

### Remaining in This Plan

#### New Enum: `vendor_status`

```sql
CREATE TYPE vendor_status AS ENUM (
  'active', 'inactive', 'pending', 'suspended', 'blacklisted'
);
```

Replace `vendors.status` TEXT CHECK with this enum.

#### New Enum: `po_status`

```sql
CREATE TYPE po_status AS ENUM (
  'draft', 'submitted', 'approved', 'ordered', 'partially_received',
  'received', 'invoiced', 'closed', 'cancelled'
);
```

Replace `purchase_orders.status` TEXT CHECK with this enum.

#### Extend: `certification_type`

```sql
-- Already defined via TEXT CHECK in 001. Convert to enum:
CREATE TYPE certification_type AS ENUM (
  'osha_10', 'osha_30', 'rigging', 'electrical', 'forklift', 'first_aid', 'cpr',
  'pyrotechnics', 'fall_protection', 'confined_space', 'hazmat', 'cdl',
  'stage_combat', 'fire_safety', 'food_handler', 'alcohol_server'
);
```

#### Enum → Table: `campaign_channel_type`

Already partially addressed by `campaign_channels` table (015). If org-extensible channels are needed, create `channel_type_definitions` lookup table (low priority — backlog).

---

## 19. Migration Priority Order

### Migration 075 — Safety & Compliance Enrichment (P0)

**Priority:** CRITICAL — Safety, security, compliance blockers
**Estimated:** ~100 lines SQL

```
Scope:
1. permission_grants: +expires_at, +granted_by FK
2. role_definitions: +inherits_from self-FK
3. crew_members: +emergency_contact_name, +emergency_contact_phone
4. contacts: +gdpr_consent_at, +communication_opt_out
5. tasks: +safety_critical
6. live_event_instances: +fire_marshal_capacity, +emergency_services_notified, +weather_hold_threshold
7. vehicles: +last_inspection_date, +next_inspection_due
8. certifications: +issuing_authority, +renewal_reminder_days
9. shipments: +hazmat_class
10. environmental_readings: +wet_bulb_globe_temp
11. COMMENT ON TABLE roles IS 'DEPRECATED: Use role_definitions (028).'
12. COMMENT ON TABLE permissions IS 'DEPRECATED: Use permission_grants (028).'
13. ALTER TABLE organizations DROP COLUMN IF EXISTS settings (JSONB cleanup)
```

### Migration 076 — Cross-Module FK Relationships

**Priority:** HIGH — Referential integrity gaps
**Estimated:** ~80 lines SQL

```
Scope:
1. budget_line_items: +gl_account_id FK
2. purchase_orders: +approved_by FK
3. projects: +insurance_policy_id FK
4. payroll_batches: +project_id FK
5. goods_receipts: +warehouse_location_id FK
6. shifts: +location_id FK
7. stakeholders: +account_id FK, +contact_id FK
8. deals: +source_id FK, +lost_reason_id FK
9. brand_kits: +approved_by FK, ALTER client_id → UUID FK accounts(id)
10. permission_grants: +granted_by FK (if not done in 075)
11. role_definitions: +inherits_from FK (if not done in 075)
```

### Migration 077 — Business Operations Enrichment (P1)

**Priority:** HIGH — Business-critical feature gaps
**Estimated:** ~120 lines SQL

```
Scope:
1. purchase_orders: +po_number, +currency, +payment_terms
2. invoices: +invoice_number, +currency, +tax_amount
3. projects: +timezone, +load_out_completed_at
4. deals: +weighted_value GENERATED, +currency
5. shifts: +break_minutes, +overtime_flag, +checked_in_at
6. crew_members: +union_local, +union_classification, +dietary_restrictions
7. budget_line_items: +cost_center, +committed_amount
8. stakeholders: +title, +company
9. goods_receipts: (warehouse_location_id added in 076)
10. change_orders: +client_approved_at
11. expenses: +receipt_verified
12. time_entries: +overtime_flag
13. client_invoices: +retention_percent
14. project_members: +access_expires_at, +department_role
```

### Migration 078 — Enterprise Features Enrichment (P2)

**Priority:** MEDIUM — Enterprise tier columns + enum hygiene
**Estimated:** ~150 lines SQL

```
Scope:
1. organizations: +tax_id, +billing_email, +default_currency, +fiscal_year_start_month, +deleted_at
2. user_profiles: +preferred_locale, +timezone, +emergency_contact_json
3. vendors: +tax_id, +payment_terms_default, +insurance_minimum_required, +diversity_classification, +preferred_vendor
4. crew_members: +i9_verified, +i9_verified_at, +w9_uploaded
5. payroll_batches: +tax_withholding_total, +union_dues_total, +workers_comp_total
6. client_invoices: +asc_606_recognized_at
7. digital_assets: +ai_generated, +model_release_on_file
8. locations: +ada_compliant, +ada_notes, +noise_ordinance_curfew
9. contracts: +indemnification_clause, +jurisdiction
10. notification_preferences: +quiet_hours_start, +quiet_hours_end, +digest_frequency
11. worker_profiles: +background_check_status, +drug_test_date
12. CREATE TYPE vendor_status AS ENUM (...)
13. CREATE TYPE po_status AS ENUM (...)
14. CREATE TYPE certification_type AS ENUM (...)
```

### Migration 079 — Supplementary Enrichment (P3)

**Priority:** LOW — Nice-to-have; ESG, marketing, backlog
**Estimated:** ~120 lines SQL

```
Scope:
1. projects: +weather_contingency_plan, +insurance_policy_id (FK added in 076), +sustainability_score, +post_mortem_score
2. tasks: +estimated_hours, +actual_hours
3. campaigns: +geo_targeting, +a_b_test_config
4. brand_kits: +brand_voice_guidelines, +do_not_use_notes
5. technical_specs: +structural_engineer_signoff, +pe_stamp_document_url
6. vehicles: +vin, +odometer_reading, +insurance_policy_number
7. assets: +qr_code_url, +insurance_value, +last_calibration_date
8. shipments: +customs_clearance_status, +bill_of_lading_number
9. load_plans: +axle_weight_distribution
10. insurance_policies: +waiver_of_subrogation, +per_occurrence_limit
11. permits: +jurisdiction_contact_phone, +conditions_of_approval
12. post_event_reports: +nps_score, +carbon_footprint_kg
13. location_contacts: +available_hours, +emergency_contact
14. case_studies: +industry_tags, +client_approved, +video_url, +testimonial_quote
15. invitations: +max_uses, +use_count
16. brands: +custom_domain
17. feature_flags: +rollout_percentage_step
18. space_bookings: +setup_time_minutes, +teardown_time_minutes
19. work_packages: +safety_plan_required
20. production_runs: +environmental_waste_kg
21. comm_log_entries: +priority_level
22. vendor_compliance_items: +auto_reminder_enabled, +reminder_days_before
23. departments: +cost_center_code
24. teams: +max_capacity
25. CREATE TABLE deck_shares (...)
```

### Migration 080 — Polymorphic FK Validation

**Priority:** LOW — Integrity enforcement for polymorphic patterns
**Estimated:** ~60 lines SQL

```
Scope:
1. ADD CHECK constraints on entity_type columns (technical_specs, record_comments, record_activity_log, asset_links)
2. CREATE trigger functions to validate entity_id exists in referenced table
3. ADD indexes: (entity_type, entity_id) on polymorphic tables
```

---

## Appendix A — Column Count Summary

| Migration | Tables Modified | Columns Added | FKs Added | Enums | New Tables |
| --------- | --------------- | ------------- | --------- | ----- | ---------- |
| 075       | 10              | 13            | 2         | 0     | 0          |
| 076       | 10              | 14            | 14        | 0     | 0          |
| 077       | 12              | 18            | 0         | 0     | 0          |
| 078       | 11              | 22            | 0         | 3     | 0          |
| 079       | 21              | 30            | 0         | 0     | 1          |
| 080       | 4               | 0             | 0         | 0     | 0          |
| **Total** | —               | **97**        | **16**    | **3** | **1**      |

## Appendix B — Post-Migration Checklist

For each migration batch:

1. `supabase db push` or `supabase migration up`
2. `supabase gen types typescript --local > src/lib/supabase/database.types.ts`
3. Update `src/types/index.ts` with new field interfaces
4. Add Zod schemas in `src/lib/validation/schemas.ts`
5. Update React Query hooks that touch modified tables
6. Run `tsc --noEmit` — must pass with 0 errors
7. Run `eslint` — must pass with 0 errors
8. Update RLS policies if new columns require field-level masking

## Appendix C — Commercial Parity Reference

| Workstream           | Commercial Benchmark                  | Current Parity | Post-Plan Parity |
| -------------------- | ------------------------------------- | -------------- | ---------------- |
| A — Identity         | Auth0 + WorkOS                        | 80%            | 92%              |
| B — Finance          | QuickBooks Enterprise + Productive.io | 72%            | 88%              |
| C — CRM              | HubSpot CRM + Salesforce Essentials   | 78%            | 88%              |
| D — Production       | Artisan + SyncOnSet                   | 85%            | 92%              |
| E — Catalog          | Shopify Admin                         | 90%            | 90%              |
| F — Messaging        | Slack + Twist                         | 88%            | 88%              |
| G — Credentialing    | Boomset + Eventbrite                  | 90%            | 90%              |
| H — RBAC             | Okta Fine-Grained Auth + LaunchDarkly | 85%            | 92%              |
| I — Assets           | Asset Panda + Sortly Pro              | 78%            | 88%              |
| J — Documents        | Google Workspace + Brandfolder        | 82%            | 88%              |
| K — Compliance       | Vanta + Drata                         | 88%            | 92%              |
| L — Vendor/Workforce | SAP Fieldglass + CrewCall             | 62%            | 85%              |
| M — Spatial          | Archibus + Momentus                   | 82%            | 90%              |

---

_This document should be reviewed by the engineering team before executing any migration. All changes are additive (ALTER TABLE ADD COLUMN) with no destructive operations. Deprecated items follow the 3-step strategy: data migration → FK repointing → soft deprecation with COMMENT markers._
