# Data Classification Reference

> **L-006**: Maps every database table to its data sensitivity classification per ISO 27001 / GDPR / CCPA categories.

## Classification Levels

| Level  | Label        | Description                                             | Retention             | Encryption                         |
| ------ | ------------ | ------------------------------------------------------- | --------------------- | ---------------------------------- |
| **C1** | Public       | Non-sensitive, can be exposed to any authenticated user | Standard              | At-rest                            |
| **C2** | Internal     | Business-sensitive, org-scoped access only              | Standard              | At-rest                            |
| **C3** | Confidential | Contains PII, financial, or contractual data            | Policy-driven         | At-rest + field-level              |
| **C4** | Restricted   | Auth credentials, secrets, audit trails                 | Immutable/append-only | At-rest + in-transit + field-level |

## Table Classifications

### Migration 001 — Initial Schema

| Table           | Classification    | PII Fields                      | Notes                        |
| --------------- | ----------------- | ------------------------------- | ---------------------------- |
| `organizations` | C2 — Internal     | —                               | Tenant root entity           |
| `profiles`      | C3 — Confidential | `email`, `name`, `avatar_url`   | Legacy; see `user_profiles`  |
| `deals`         | C3 — Confidential | `contact_name`, `contact_email` | CRM PII                      |
| `projects`      | C2 — Internal     | —                               |                              |
| `tasks`         | C2 — Internal     | —                               |                              |
| `time_entries`  | C2 — Internal     | —                               | Linked to user via `user_id` |
| `invoices`      | C3 — Confidential | —                               | Financial data               |
| `vendors`       | C3 — Confidential | `email`, `contact_person`       | Vendor PII                   |
| `assets`        | C2 — Internal     | —                               |                              |
| `contracts`     | C3 — Confidential | —                               | Legal/financial              |
| `crew_members`  | C3 — Confidential | `email`, `phone`                | Workforce PII                |

### Migration 002 — Extended Schema

| Table                  | Classification    | PII Fields | Notes                            |
| ---------------------- | ----------------- | ---------- | -------------------------------- |
| `expenses`             | C3 — Confidential | —          | Financial data                   |
| `comments`             | C2 — Internal     | —          |                                  |
| `notifications`        | C2 — Internal     | —          |                                  |
| `tags`                 | C1 — Public       | —          |                                  |
| `document_attachments` | C2 — Internal     | —          | May contain confidential uploads |

### Migration 003 — Production Lifecycle

| Table                   | Classification | PII Fields | Notes |
| ----------------------- | -------------- | ---------- | ----- |
| `production_phases`     | C2 — Internal  | —          |       |
| `production_milestones` | C2 — Internal  | —          |       |
| `quality_checks`        | C2 — Internal  | —          |       |

### Migration 004 — CRM Public

| Table           | Classification    | PII Fields                                  | Notes                |
| --------------- | ----------------- | ------------------------------------------- | -------------------- |
| `companies`     | C3 — Confidential | `website`, `phone`, `email`                 | Business contact PII |
| `contacts`      | C3 — Confidential | `first_name`, `last_name`, `email`, `phone` | Individual PII       |
| `opportunities` | C3 — Confidential | —                                           | Financial data       |
| `activities`    | C2 — Internal     | —                                           |                      |
| `lost_reasons`  | C1 — Public       | —                                           | Reference data       |

### Migration 005 — Productive Features

| Table               | Classification    | PII Fields | Notes             |
| ------------------- | ----------------- | ---------- | ----------------- |
| `rate_cards`        | C3 — Confidential | —          | Financial/pricing |
| `resource_bookings` | C2 — Internal     | —          |                   |
| `budgets`           | C3 — Confidential | —          | Financial data    |
| `budget_line_items` | C3 — Confidential | —          | Financial data    |

### Migration 006 — Workflow Documents

| Table                | Classification    | PII Fields                    | Notes     |
| -------------------- | ----------------- | ----------------------------- | --------- |
| `approval_workflows` | C2 — Internal     | —                             |           |
| `approval_steps`     | C2 — Internal     | —                             |           |
| `document_templates` | C2 — Internal     | —                             |           |
| `e_signatures`       | C3 — Confidential | `signer_email`, `signer_name` | Legal PII |

### Migration 007 — SOW Lifecycle

| Table              | Classification    | PII Fields | Notes                 |
| ------------------ | ----------------- | ---------- | --------------------- |
| `scopes_of_work`   | C3 — Confidential | —          | Contractual/financial |
| `sow_deliverables` | C2 — Internal     | —          |                       |
| `sow_milestones`   | C2 — Internal     | —          |                       |

### Migration 008 — Vendor Contractor Lifecycle

| Table               | Classification    | PII Fields | Notes           |
| ------------------- | ----------------- | ---------- | --------------- |
| `vendor_documents`  | C3 — Confidential | —          | Compliance docs |
| `vendor_compliance` | C3 — Confidential | —          |                 |
| `vendor_ratings`    | C2 — Internal     | —          |                 |

### Migration 009 — Scenario Builder

| Table            | Classification | PII Fields | Notes |
| ---------------- | -------------- | ---------- | ----- |
| `scenarios`      | C2 — Internal  | —          |       |
| `scenario_items` | C2 — Internal  | —          |       |

### Migration 010 — Service Requests

| Table              | Classification | PII Fields | Notes |
| ------------------ | -------------- | ---------- | ----- |
| `service_requests` | C2 — Internal  | —          |       |

### Migration 011 — Unified Workforce

| Table                   | Classification    | PII Fields                             | Notes            |
| ----------------------- | ----------------- | -------------------------------------- | ---------------- |
| `worker_profiles`       | C3 — Confidential | `emergency_contact_*`, `ssn_last_four` | Sensitive PII    |
| `worker_certifications` | C3 — Confidential | —                                      |                  |
| `worker_availability`   | C2 — Internal     | —                                      |                  |
| `worker_reviews`        | C3 — Confidential | —                                      | Performance data |

### Migration 013 — CRM Revenue Pipeline

| Table                 | Classification    | PII Fields | Notes                 |
| --------------------- | ----------------- | ---------- | --------------------- |
| `proposals`           | C3 — Confidential | —          | Financial/contractual |
| `proposal_line_items` | C3 — Confidential | —          | Financial data        |
| `invoicing_rules`     | C3 — Confidential | —          | Financial config      |
| `credit_notes`        | C3 — Confidential | —          | Financial data        |

### Migration 014 — Digital Asset Lifecycle

| Table            | Classification    | PII Fields | Notes    |
| ---------------- | ----------------- | ---------- | -------- |
| `digital_assets` | C2 — Internal     | —          |          |
| `asset_versions` | C2 — Internal     | —          |          |
| `usage_rights`   | C3 — Confidential | —          | Legal/IP |

### Migration 015 — Creative Brand Campaign

| Table                   | Classification | PII Fields | Notes |
| ----------------------- | -------------- | ---------- | ----- |
| `brand_guidelines`      | C2 — Internal  | —          |       |
| `campaigns`             | C2 — Internal  | —          |       |
| `campaign_deliverables` | C2 — Internal  | —          |       |

### Migration 016 — Legal Compliance Finance Procurement

| Table                     | Classification    | PII Fields      | Notes           |
| ------------------------- | ----------------- | --------------- | --------------- |
| `legal_matters`           | C3 — Confidential | —               | Legal data      |
| `compliance_requirements` | C2 — Internal     | —               |                 |
| `insurance_policies`      | C3 — Confidential | `policy_number` | Financial/legal |
| `purchase_orders`         | C3 — Confidential | —               | Financial data  |
| `gl_accounts`             | C3 — Confidential | —               | Financial data  |

### Migration 017 — Location Spatial Hierarchy

| Table            | Classification    | PII Fields               | Notes       |
| ---------------- | ----------------- | ------------------------ | ----------- |
| `locations`      | C2 — Internal     | —                        |             |
| `zones`          | C2 — Internal     | —                        |             |
| `venue_contacts` | C3 — Confidential | `name`, `email`, `phone` | Contact PII |

### Migration 018 — User Lifecycle Identity

| Table                         | Classification    | PII Fields                                     | Notes                |
| ----------------------------- | ----------------- | ---------------------------------------------- | -------------------- |
| `user_profiles`               | C3 — Confidential | `display_name`, `email`, `phone`, `avatar_url` | Canonical user PII   |
| `org_memberships`             | C2 — Internal     | —                                              |                      |
| `invitations`                 | C3 — Confidential | `email`                                        | PII                  |
| `user_preferences`            | C2 — Internal     | —                                              |                      |
| `onboarding_step_definitions` | C1 — Public       | —                                              | Reference data       |
| `user_onboarding_progress`    | C2 — Internal     | —                                              |                      |
| `login_events`                | C4 — Restricted   | `ip_address`, `user_agent`                     | Security audit trail |
| `api_keys`                    | C4 — Restricted   | `key_hash`                                     | Secrets              |

### Migration 019 — Asset Inventory Logistics

| Table                 | Classification | PII Fields | Notes |
| --------------------- | -------------- | ---------- | ----- |
| `warehouses`          | C2 — Internal  | —          |       |
| `inventory_items`     | C2 — Internal  | —          |       |
| `shipments`           | C2 — Internal  | —          |       |
| `maintenance_records` | C2 — Internal  | —          |       |

### Migration 020 — Live Event Operations

| Table            | Classification | PII Fields | Notes                   |
| ---------------- | -------------- | ---------- | ----------------------- |
| `live_events`    | C2 — Internal  | —          |                         |
| `event_phases`   | C2 — Internal  | —          |                         |
| `incidents`      | C2 — Internal  | —          | May contain safety data |
| `crew_shifts`    | C2 — Internal  | —          |                         |
| `crew_check_ins` | C2 — Internal  | —          |                         |

### Migration 026 — Settings Framework

| Table                 | Classification  | PII Fields | Notes                               |
| --------------------- | --------------- | ---------- | ----------------------------------- |
| `setting_definitions` | C1 — Public     | —          | Reference/config                    |
| `settings`            | C2 — Internal   | —          | May contain sensitive config values |
| `settings_change_log` | C4 — Restricted | —          | Audit trail, immutable              |

### Migration 027 — Feature Flags

| Table                    | Classification | PII Fields | Notes |
| ------------------------ | -------------- | ---------- | ----- |
| `feature_flags`          | C2 — Internal  | —          |       |
| `feature_flag_overrides` | C2 — Internal  | —          |       |

### Migration 028 — RBAC Custom Roles

| Table              | Classification | PII Fields | Notes |
| ------------------ | -------------- | ---------- | ----- |
| `custom_roles`     | C2 — Internal  | —          |       |
| `role_permissions` | C2 — Internal  | —          |       |

### Migration 030 — Data Retention Policy

| Table                     | Classification  | PII Fields | Notes             |
| ------------------------- | --------------- | ---------- | ----------------- |
| `data_retention_policies` | C2 — Internal   | —          | Governance config |
| `data_retention_log`      | C4 — Restricted | —          | Audit trail       |

### Migration 031 — Field-Level RBAC

| Table                    | Classification | PII Fields | Notes |
| ------------------------ | -------------- | ---------- | ----- |
| `field_visibility_rules` | C2 — Internal  | —          |       |

### Migration 033 — Competitive Feature Gaps

| Table                 | Classification  | PII Fields | Notes       |
| --------------------- | --------------- | ---------- | ----------- |
| `record_comments`     | C2 — Internal   | —          |             |
| `record_activity_log` | C2 — Internal   | —          |             |
| `automation_rules`    | C2 — Internal   | —          |             |
| `automation_actions`  | C2 — Internal   | —          |             |
| `automation_logs`     | C4 — Restricted | —          | Audit trail |

### Migration 034 — V2 Feature Gaps

| Table             | Classification    | PII Fields | Notes             |
| ----------------- | ----------------- | ---------- | ----------------- |
| `payroll_batches` | C3 — Confidential | —          | Financial/HR data |
| `payroll_items`   | C3 — Confidential | —          | Financial/HR data |

### Migration 035 — Settings Approval Workflow

| Table                      | Classification | PII Fields | Notes |
| -------------------------- | -------------- | ---------- | ----- |
| `settings_change_requests` | C2 — Internal  | —          |       |

## Summary by Classification

| Level                 | Count | Examples                                                                                   |
| --------------------- | ----- | ------------------------------------------------------------------------------------------ |
| **C1 — Public**       | ~4    | `tags`, `lost_reasons`, `onboarding_step_definitions`, `setting_definitions`               |
| **C2 — Internal**     | ~50   | `projects`, `tasks`, `campaigns`, `feature_flags`, `comments`                              |
| **C3 — Confidential** | ~30   | `profiles`, `deals`, `invoices`, `contracts`, `worker_profiles`                            |
| **C4 — Restricted**   | ~5    | `login_events`, `api_keys`, `settings_change_log`, `automation_logs`, `data_retention_log` |

## Compliance Notes

- **GDPR Art. 17 (Right to Erasure)**: C3/C4 tables with PII must support soft-delete or anonymization. See migration 030 (`data_retention_policies`).
- **GDPR Art. 30 (Records of Processing)**: This document serves as the processing register for database tables.
- **Immutability**: C4 tables must never have destructive `UPDATE` or `DELETE` operations. Use append-only patterns.
- **Field-Level Masking**: C3 PII fields should respect `field_visibility_rules` (migration 031) for role-based masking.
