# 📋 SCHEMA_CATALOG.md — FrozenPhoenix Database Inventory

> **Protocol**: FP-DATA-BEDROCK-001 · Phase 1.1
> **Generated**: 2026-03-29
> **Source of Truth**: `supabase/migrations/` (106 files) × `database.types.ts`

## Summary

| Metric                               | Count                              |
| ------------------------------------ | ---------------------------------- |
| **Live Tables**                      | 352                                |
| **Views (materialized + standard)**  | 30                                 |
| **Functions (RPC)**                  | 38                                 |
| **ENUM Types**                       | 280                                |
| **FK Constraints**                   | 1,325                              |
| **Migration Files**                  | 106                                |
| **Tables with `organization_id`**    | 289                                |
| **Tables without `organization_id`** | 63 (90 incl. user-scoped + system) |
| **Tables with `updated_at`**         | 270                                |
| **Tables without `updated_at`**      | 82                                 |
| **JSONB Columns**                    | 187 across 126 tables              |
| **Array Columns**                    | 141 across 83 tables               |
| **Status columns using TEXT CHECK**  | 43                                 |
| **Status columns using ENUM**        | 106                                |

---

## Table Classification

Each table classified as:

- **ENTITY** — Core business object
- **RELATIONSHIP** — Junction/association table
- **LOOKUP** — Reference data / configuration
- **AUDIT** — Logging / tracking
- **CONFIG** — System configuration
- **CUSTOM** — Custom fields / extensibility

---

## Domain 1: Identity & Organization (8 tables)

| Table               | Classification | org_id          | updated_at | RLS | Origin  |
| ------------------- | -------------- | --------------- | ---------- | --- | ------- |
| `organizations`     | ENTITY         | ✗ (IS org)      | ✓          | ✓   | 001     |
| `user_profiles`     | ENTITY         | ✗ (user-scoped) | ✓          | ✓   | 018→067 |
| `org_memberships`   | RELATIONSHIP   | ✓               | ✓          | ✓   | 001     |
| `roles`             | LOOKUP         | ✗               | ✗          | ✓   | 085     |
| `role_definitions`  | LOOKUP         | ✓               | ✓          | ✓   | 011     |
| `permission_grants` | CONFIG         | ✓               | ✗          | ✓   | 031     |
| `teams`             | ENTITY         | ✓               | ✓          | ✓   | 001     |
| `team_members`      | RELATIONSHIP   | ✗               | ✗          | ✓   | 001     |

---

## Domain 2: Authentication & Security (14 tables)

| Table                     | Classification | org_id | updated_at | RLS | Origin |
| ------------------------- | -------------- | ------ | ---------- | --- | ------ |
| `access_audit_log`        | AUDIT          | ✗      | ✗          | ✓   | 031    |
| `api_keys`                | CONFIG         | ✓      | ✗          | ✓   | 001    |
| `api_tokens`              | CONFIG         | ✓      | ✓          | ✓   | 085    |
| `auth_rate_limits`        | AUDIT          | ✗      | ✗          | ✓   | 085    |
| `bluesky_oauth_sessions`  | CONFIG         | ✗      | ✓          | ✓   | 085    |
| `bluesky_oauth_states`    | CONFIG         | ✗      | ✗          | ✓   | 085    |
| `login_audit_log`         | AUDIT          | ✓      | ✗          | ✓   | 018    |
| `mfa_recovery_codes`      | CONFIG         | ✗      | ✗          | ✓   | 018    |
| `portal_access_tokens`    | CONFIG         | ✓      | ✗          | ✓   | 016    |
| `portal_sessions`         | CONFIG         | ✗      | ✗          | ✓   | 061    |
| `temporary_access_grants` | CONFIG         | ✓      | ✓          | ✓   | 085    |
| `user_sessions`           | AUDIT          | ✗      | ✗          | ✓   | 018    |
| `username_change_log`     | AUDIT          | ✗      | ✗          | ✗   | 018    |
| `released_usernames`      | LOOKUP         | ✗      | ✗          | ✗   | 018    |
| `reserved_usernames`      | LOOKUP         | ✗      | ✗          | ✗   | 018    |

---

## Domain 3: Projects & Production (29 tables)

| Table                            | Classification | org_id | updated_at | RLS | Origin |
| -------------------------------- | -------------- | ------ | ---------- | --- | ------ |
| `projects`                       | ENTITY         | ✓      | ✓          | ✓   | 001    |
| `project_assignments`            | RELATIONSHIP   | ✓      | ✓          | ✓   | 001    |
| `project_collaborators`          | RELATIONSHIP   | ✓      | ✓          | ✓   | 015    |
| `project_comm_templates`         | LOOKUP         | ✓      | ✓          | ✓   | 020    |
| `project_crew_submissions`       | ENTITY         | ✓      | ✓          | ✓   | 020    |
| `project_locations`              | RELATIONSHIP   | ✓      | ✓          | ✓   | 003    |
| `project_members`                | RELATIONSHIP   | ✗      | ✗          | ✓   | 001    |
| `project_templates`              | LOOKUP         | ✓      | ✓          | ✓   | 005    |
| `production_tasks`               | ENTITY         | ✓      | ✓          | ✓   | 003    |
| `production_milestones`          | ENTITY         | ✓      | ✓          | ✓   | 003    |
| `production_verticals`           | ENTITY         | ✓      | ✓          | ✓   | 003    |
| `production_budget_lines`        | ENTITY         | ✓      | ✓          | ✓   | 003    |
| `production_time_entries`        | ENTITY         | ✓      | ✓          | ✓   | 003    |
| `production_expenses`            | ENTITY         | ✓      | ✓          | ✓   | 003    |
| `production_checklists`          | ENTITY         | ✓      | ✓          | ✓   | 003    |
| `production_sops`                | ENTITY         | ✓      | ✓          | ✓   | 003    |
| `production_runs`                | ENTITY         | ✓      | ✓          | ✓   | 021    |
| `production_run_inputs`          | ENTITY         | ✓      | ✗          | ✓   | 021    |
| `production_advances`            | ENTITY         | ✓      | ✓          | ✓   | 085    |
| `production_advance_items`       | ENTITY         | ✓      | ✓          | ✓   | 085    |
| `advance_status_history`         | AUDIT          | ✓      | ✗          | ✓   | 085    |
| `advance_templates`              | LOOKUP         | ✓      | ✓          | ✓   | 085    |
| `tasks`                          | ENTITY         | ✓      | ✓          | ✓   | 001    |
| `task_dependencies`              | RELATIONSHIP   | ✗      | ✗          | ✓   | 001    |
| `milestones`                     | ENTITY         | ✓      | ✓          | ✓   | 002    |
| `work_packages`                  | ENTITY         | ✓      | ✓          | ✓   | 021    |
| `work_package_dependencies`      | RELATIONSHIP   | ✓      | ✗          | ✓   | 021    |
| `collaborator_requirements`      | ENTITY         | ✓      | ✓          | ✓   | 015    |
| `deliverable_progress_snapshots` | AUDIT          | ✓      | ✗          | ✓   | 015    |

---

## Domain 4: Events & Live Operations (21 tables)

| Table                      | Classification | org_id | updated_at | RLS | Origin |
| -------------------------- | -------------- | ------ | ---------- | --- | ------ |
| `events`                   | ENTITY         | ✓      | ✓          | ✓   | 003    |
| `event_assets`             | RELATIONSHIP   | ✓      | ✓          | ✓   | 003    |
| `event_space_overlays`     | ENTITY         | ✓      | ✓          | ✓   | 020    |
| `live_event_instances`     | ENTITY         | ✓      | ✓          | ✓   | 020    |
| `live_crew_assignments`    | RELATIONSHIP   | ✓      | ✓          | ✓   | 020    |
| `live_financial_snapshots` | AUDIT          | ✓      | ✗          | ✓   | 020    |
| `activations`              | ENTITY         | ✓      | ✓          | ✓   | 003    |
| `activation_assets`        | RELATIONSHIP   | ✓      | ✓          | ✓   | 003    |
| `activities`               | ENTITY         | ✓      | ✓          | ✓   | 003    |
| `activity_assets`          | RELATIONSHIP   | ✓      | ✓          | ✓   | 003    |
| `activity_consumables`     | RELATIONSHIP   | ✓      | ✓          | ✓   | 003    |
| `call_sheets`              | ENTITY         | ✓      | ✓          | ✓   | 003    |
| `call_sheet_crew`          | RELATIONSHIP   | ✗      | ✗          | ✓   | 003    |
| `tech_sheets`              | ENTITY         | ✓      | ✓          | ✓   | 003    |
| `ros_cues`                 | ENTITY         | ✓      | ✓          | ✓   | 020    |
| `command_positions`        | ENTITY         | ✓      | ✓          | ✓   | 020    |
| `post_event_reports`       | ENTITY         | ✓      | ✓          | ✓   | 020    |
| `foh_zones`                | ENTITY         | ✓      | ✓          | ✓   | 020    |
| `foh_zone_readings`        | AUDIT          | ✓      | ✗          | ✓   | 020    |
| `strike_sequences`         | ENTITY         | ✓      | ✓          | ✓   | 020    |
| `department_statuses`      | ENTITY         | ✓      | ✓          | ✓   | 020    |

---

## Domain 5: CRM & Sales (20 tables)

| Table                    | Classification | org_id | updated_at | RLS | Origin |
| ------------------------ | -------------- | ------ | ---------- | --- | ------ |
| `companies`              | ENTITY         | ✓      | ✓          | ✓   | 005    |
| `contacts`               | ENTITY         | ✓      | ✓          | ✓   | 005    |
| `deals`                  | ENTITY         | ✓      | ✓          | ✓   | 005    |
| `leads`                  | ENTITY         | ✓      | ✓          | ✓   | 005    |
| `lead_activities`        | AUDIT          | ✗      | ✗          | ✓   | 005    |
| `lead_sources`           | LOOKUP         | ✓      | ✓          | ✓   | 005    |
| `lost_reasons`           | LOOKUP         | ✓      | ✗          | ✓   | 005    |
| `opportunities`          | ENTITY         | ✓      | ✓          | ✓   | 005    |
| `opportunity_activities` | AUDIT          | ✓      | ✗          | ✓   | 005    |
| `pipelines`              | ENTITY         | ✓      | ✓          | ✓   | 005    |
| `proposals`              | ENTITY         | ✓      | ✓          | ✓   | 005    |
| `proposal_items`         | ENTITY         | ✗      | ✓          | ✓   | 005    |
| `estimates`              | ENTITY         | ✓      | ✓          | ✓   | 016    |
| `stakeholders`           | ENTITY         | ✓      | ✓          | ✓   | 016    |
| `stakeholder_projects`   | RELATIONSHIP   | ✗      | ✗          | ✓   | 016    |
| `account_health_scores`  | ENTITY         | ✓      | ✗          | ✓   | 022    |
| `case_studies`           | ENTITY         | ✓      | ✓          | ✓   | 022    |
| `case_study_metrics`     | ENTITY         | ✗      | ✗          | ✓   | 022    |
| `testimonials`           | ENTITY         | ✗      | ✗          | ✓   | 022    |
| `upsell_triggers`        | ENTITY         | ✓      | ✓          | ✓   | 022    |
| `upsell_events`          | AUDIT          | ✓      | ✗          | ✓   | 022    |

---

## Domain 6: Finance & Billing (26 tables)

| Table                         | Classification | org_id | updated_at | RLS | Origin |
| ----------------------------- | -------------- | ------ | ---------- | --- | ------ |
| `budgets`                     | ENTITY         | ✓      | ✓          | ✓   | 002    |
| `budget_line_items`           | ENTITY         | ✓      | ✓          | ✓   | 002    |
| `budget_approvals`            | ENTITY         | ✓      | ✓          | ✓   | 016    |
| `budget_alerts`               | ENTITY         | ✓      | ✓          | ✓   | 016    |
| `invoices`                    | ENTITY         | ✓      | ✓          | ✓   | 002    |
| `invoice_line_items`          | ENTITY         | ✗      | ✗          | ✓   | 016    |
| `invoice_time_entries`        | RELATIONSHIP   | ✗      | ✗          | ✓   | 034    |
| `invoice_templates`           | LOOKUP         | ✓      | ✓          | ✓   | 005    |
| `client_invoices`             | ENTITY         | ✓      | ✓          | ✓   | 016    |
| `recurring_invoices`          | ENTITY         | ✓      | ✓          | ✓   | 005    |
| `payments`                    | ENTITY         | ✓      | ✗          | ✓   | 005    |
| `payment_approvals`           | ENTITY         | ✓      | ✓          | ✓   | 016    |
| `credit_notes`                | ENTITY         | ✓      | ✓          | ✓   | 005    |
| `expenses`                    | ENTITY         | ✓      | ✓          | ✓   | 002    |
| `expense_reports`             | ENTITY         | ✓      | ✓          | ✓   | 002    |
| `rate_cards`                  | ENTITY         | ✓      | ✓          | ✓   | 005    |
| `rate_card_items`             | ENTITY         | ✗      | ✓          | ✓   | 005    |
| `gl_accounts`                 | LOOKUP         | ✓      | ✓          | ✓   | 016    |
| `revenue_recognition_entries` | ENTITY         | ✓      | ✓          | ✓   | 061    |
| `revenue_schedules`           | ENTITY         | ✓      | ✓          | ✓   | 016    |
| `financial_periods`           | LOOKUP         | ✓      | ✓          | ✓   | 085    |
| `exchange_rates`              | LOOKUP         | ✓      | ✗          | ✓   | 085    |
| `depreciation_schedules`      | ENTITY         | ✓      | ✓          | ✓   | 019    |
| `job_cost_entries`            | ENTITY         | ✓      | ✓          | ✓   | 021    |
| `payroll_batches`             | ENTITY         | ✓      | ✓          | ✓   | 016    |
| `pos_transactions`            | ENTITY         | ✓      | ✗          | ✓   | 020    |
| `pos_transaction_items`       | ENTITY         | ✗      | ✗          | ✓   | 020    |

---

## Domain 7: Workforce & HR (23 tables)

| Table                        | Classification | org_id | updated_at | RLS | Origin |
| ---------------------------- | -------------- | ------ | ---------- | --- | ------ |
| `worker_profiles`            | ENTITY         | ✓      | ✓          | ✓   | 011    |
| `worker_classifications`     | ENTITY         | ✓      | ✓          | ✓   | 011    |
| `worker_compliance_docs`     | ENTITY         | ✓      | ✓          | ✓   | 011    |
| `worker_reviews`             | ENTITY         | ✓      | ✓          | ✓   | 011    |
| `worker_onboarding_runs`     | ENTITY         | ✓      | ✓          | ✓   | 011    |
| `worker_offboarding_runs`    | ENTITY         | ✓      | ✓          | ✓   | 011    |
| `crew_members`               | ENTITY         | ✓      | ✓          | ✓   | 001    |
| `crew_availability`          | ENTITY         | ✓      | ✓          | ✓   | 005    |
| `crew_shifts`                | ENTITY         | ✓      | ✓          | ✓   | 003    |
| `shifts`                     | ENTITY         | ✗      | ✗          | ✓   | 011    |
| `certifications`             | ENTITY         | ✗      | ✗          | ✓   | 001    |
| `user_certifications`        | ENTITY         | ✓      | ✓          | ✓   | 011    |
| `classification_assessments` | ENTITY         | ✓      | ✓          | ✓   | 011    |
| `engagement_terms`           | ENTITY         | ✓      | ✓          | ✓   | 011    |
| `departments`                | LOOKUP         | ✓      | ✓          | ✓   | 071    |
| `time_entries`               | ENTITY         | ✓      | ✓          | ✓   | 002    |
| `time_off_requests`          | ENTITY         | ✓      | ✓          | ✓   | 005    |
| `time_tracking_policies`     | CONFIG         | ✓      | ✓          | ✓   | 061    |
| `timesheets`                 | ENTITY         | ✓      | ✓          | ✓   | 016    |
| `active_timers`              | ENTITY         | ✓      | ✗          | ✓   | 005    |
| `resource_bookings`          | ENTITY         | ✓      | ✓          | ✓   | 005    |
| `reviews`                    | ENTITY         | ✗      | ✗          | ✓   | 022    |
| `review_cycles`              | ENTITY         | ✓      | ✓          | ✓   | 022    |
| `review_feedback_requests`   | ENTITY         | ✓      | ✓          | ✓   | 022    |

---

## Domain 8: Vendors & Procurement (17 tables)

| Table                          | Classification | org_id | updated_at | RLS | Origin |
| ------------------------------ | -------------- | ------ | ---------- | --- | ------ |
| `vendors`                      | ENTITY         | ✓      | ✓          | ✓   | 008    |
| `vendor_communications`        | ENTITY         | ✓      | ✗          | ✓   | 008    |
| `vendor_portal_tokens`         | CONFIG         | ✓      | ✗          | ✓   | 008    |
| `vendor_risk_scores`           | ENTITY         | ✓      | ✗          | ✓   | 008    |
| `vendor_vertical_capabilities` | RELATIONSHIP   | ✓      | ✓          | ✓   | 008    |
| `contracts`                    | ENTITY         | ✓      | ✓          | ✓   | 016    |
| `contract_amendments`          | ENTITY         | ✓      | ✓          | ✓   | 016    |
| `contract_clauses`             | ENTITY         | ✓      | ✓          | ✓   | 016    |
| `contract_obligations`         | ENTITY         | ✓      | ✓          | ✓   | 016    |
| `purchase_orders`              | ENTITY         | ✓      | ✓          | ✓   | 016    |
| `purchase_order_items`         | ENTITY         | ✗      | ✗          | ✓   | 016    |
| `purchase_requisitions`        | ENTITY         | ✓      | ✓          | ✓   | 016    |
| `rfqs`                         | ENTITY         | ✓      | ✓          | ✓   | 016    |
| `work_orders`                  | ENTITY         | ✓      | ✓          | ✓   | 008    |
| `work_order_bids`              | ENTITY         | ✓      | ✓          | ✓   | 008    |
| `goods_receipts`               | ENTITY         | ✓      | ✓          | ✓   | 085    |
| `goods_receipt_lines`          | ENTITY         | ✓      | ✓          | ✓   | 085    |

---

## Domain 9: Assets & Inventory (25 tables)

| Table                        | Classification | org_id | updated_at | RLS | Origin |
| ---------------------------- | -------------- | ------ | ---------- | --- | ------ |
| `assets`                     | ENTITY         | ✓      | ✓          | ✓   | 001    |
| `asset_access_controls`      | CONFIG         | ✓      | ✗          | ✓   | 019    |
| `asset_access_log`           | AUDIT          | ✓      | ✗          | ✓   | 019    |
| `asset_assignments`          | ENTITY         | ✓      | ✓          | ✓   | 001    |
| `asset_certifications`       | ENTITY         | ✓      | ✓          | ✓   | 019    |
| `asset_channel_deployments`  | RELATIONSHIP   | ✓      | ✓          | ✓   | 015    |
| `asset_damage_reports`       | ENTITY         | ✓      | ✓          | ✓   | 019    |
| `asset_dependencies`         | RELATIONSHIP   | ✓      | ✗          | ✓   | 019    |
| `asset_links`                | RELATIONSHIP   | ✓      | ✗          | ✓   | 019    |
| `asset_reconciliation_items` | ENTITY         | ✓      | ✓          | ✓   | 019    |
| `asset_retention_policies`   | CONFIG         | ✓      | ✓          | ✓   | 019    |
| `asset_tag_assignments`      | RELATIONSHIP   | ✗      | ✗          | ✓   | 019    |
| `asset_tags`                 | LOOKUP         | ✓      | ✗          | ✓   | 019    |
| `asset_versions`             | ENTITY         | ✓      | ✗          | ✓   | 019    |
| `consumables`                | ENTITY         | ✓      | ✓          | ✓   | 019    |
| `consumable_usage`           | AUDIT          | ✓      | ✗          | ✓   | 019    |
| `digital_assets`             | ENTITY         | ✓      | ✓          | ✓   | 015    |
| `inventory_audits`           | ENTITY         | ✓      | ✓          | ✓   | 019    |
| `inventory_reservations`     | ENTITY         | ✓      | ✓          | ✓   | 019    |
| `kits`                       | ENTITY         | ✓      | ✓          | ✓   | 019    |
| `kit_items`                  | RELATIONSHIP   | ✗      | ✗          | ✓   | 019    |
| `boms`                       | ENTITY         | ✓      | ✓          | ✓   | 021    |
| `bom_lines`                  | ENTITY         | ✓      | ✓          | ✓   | 021    |
| `audit_count_items`          | ENTITY         | ✗      | ✗          | ✓   | 019    |
| `storage_objects`            | ENTITY         | ✓      | ✗          | ✓   | 085    |

---

## Domain 10: Logistics & Warehousing (13 tables)

| Table                      | Classification | org_id | updated_at | RLS | Origin |
| -------------------------- | -------------- | ------ | ---------- | --- | ------ |
| `locations`                | ENTITY         | ✓      | ✓          | ✓   | 003    |
| `location_compliance_docs` | ENTITY         | ✓      | ✓          | ✓   | 003    |
| `location_contacts`        | ENTITY         | ✗      | ✗          | ✓   | 003    |
| `location_costs`           | ENTITY         | ✓      | ✓          | ✓   | 003    |
| `location_inspections`     | ENTITY         | ✓      | ✓          | ✓   | 003    |
| `warehouses`               | ENTITY         | ✓      | ✓          | ✓   | 019    |
| `warehouse_zones`          | ENTITY         | ✓      | ✓          | ✓   | 019    |
| `warehouse_locations`      | ENTITY         | ✓      | ✓          | ✓   | 019    |
| `shipments`                | ENTITY         | ✓      | ✓          | ✓   | 019    |
| `shipment_items`           | ENTITY         | ✓      | ✓          | ✓   | 019    |
| `load_plans`               | ENTITY         | ✓      | ✓          | ✓   | 019    |
| `load_plan_items`          | RELATIONSHIP   | ✗      | ✗          | ✓   | 019    |
| `logistics_events`         | AUDIT          | ✓      | ✗          | ✓   | 019    |
| `vehicles`                 | ENTITY         | ✓      | ✓          | ✓   | 019    |
| `dispatch_entries`         | ENTITY         | ✓      | ✓          | ✓   | 019    |
| `transfer_orders`          | ENTITY         | ✓      | ✓          | ✓   | 085    |

---

## Domain 11: Legal & Compliance (14 tables)

| Table                      | Classification | org_id | updated_at | RLS | Origin |
| -------------------------- | -------------- | ------ | ---------- | --- | ------ |
| `compliance_checklists`    | ENTITY         | ✓      | ✓          | ✓   | 003    |
| `compliance_templates`     | LOOKUP         | ✓      | ✓          | ✓   | 011    |
| `permits`                  | ENTITY         | ✓      | ✓          | ✓   | 016    |
| `insurance_policies`       | ENTITY         | ✓      | ✓          | ✓   | 016    |
| `insurance_requirements`   | ENTITY         | ✓      | ✓          | ✓   | 016    |
| `incident_insurance_links` | RELATIONSHIP   | ✓      | ✓          | ✓   | 085    |
| `legal_holds`              | ENTITY         | ✓      | ✗          | ✓   | 016    |
| `ip_rights`                | ENTITY         | ✓      | ✓          | ✓   | 016    |
| `rights_licenses`          | ENTITY         | ✓      | ✓          | ✓   | 016    |
| `e_signatures`             | ENTITY         | ✓      | ✓          | ✓   | 016    |
| `user_compliance_acks`     | ENTITY         | ✗      | ✗          | ✓   | 085    |
| `data_retention_policies`  | CONFIG         | ✗      | ✓          | ✓   | 085    |
| `anonymization_queue`      | ENTITY         | ✓      | ✓          | ✓   | 085    |
| `data_export_requests`     | ENTITY         | ✓      | ✗          | ✓   | 085    |

---

## Domain 12: Communication & Messaging (11 tables)

| Table                        | Classification | org_id | updated_at | RLS | Origin |
| ---------------------------- | -------------- | ------ | ---------- | --- | ------ |
| `conversations`              | ENTITY         | ✓      | ✓          | ✓   | 085    |
| `conversation_members`       | RELATIONSHIP   | ✗      | ✗          | ✓   | 085    |
| `messages`                   | ENTITY         | ✓      | ✓          | ✓   | 085    |
| `message_reactions`          | ENTITY         | ✗      | ✗          | ✓   | 085    |
| `message_read_receipts`      | AUDIT          | ✗      | ✗          | ✓   | 085    |
| `messaging_escalation_rules` | CONFIG         | ✓      | ✓          | ✓   | 085    |
| `comm_channels`              | ENTITY         | ✓      | ✓          | ✓   | 020    |
| `comm_log_entries`           | AUDIT          | ✓      | ✗          | ✓   | 020    |
| `comments`                   | ENTITY         | ✓      | ✓          | ✓   | 002    |
| `notifications`              | ENTITY         | ✓      | ✓          | ✓   | 001    |
| `notification_preferences`   | CONFIG         | ✗      | ✗          | ✓   | 085    |
| `email_messages`             | ENTITY         | ✓      | ✗          | ✓   | 061    |

---

## Domain 13: Documents & Knowledge (10 tables)

| Table                     | Classification | org_id | updated_at | RLS | Origin |
| ------------------------- | -------------- | ------ | ---------- | --- | ------ |
| `documents`               | ENTITY         | ✓      | ✓          | ✓   | 005    |
| `document_versions`       | ENTITY         | ✗      | ✗          | ✓   | 005    |
| `document_templates`      | LOOKUP         | ✓      | ✓          | ✓   | 005    |
| `knowledge_articles`      | ENTITY         | ✓      | ✓          | ✓   | 034    |
| `knowledge_article_links` | RELATIONSHIP   | ✗      | ✗          | ✓   | 034    |
| `sops`                    | ENTITY         | ✓      | ✓          | ✓   | 003    |
| `sop_acknowledgments`     | AUDIT          | ✗      | ✗          | ✓   | 003    |
| `vault_documents`         | ENTITY         | ✓      | ✓          | ✓   | 016    |
| `decks`                   | ENTITY         | ✓      | ✓          | ✓   | 022    |
| `deck_slides`             | ENTITY         | ✗      | ✗          | ✓   | 022    |
| `deck_shares`             | ENTITY         | ✓      | ✓          | ✓   | 022    |

---

## Domain 14: Creative & Brand (12 tables)

| Table                      | Classification | org_id | updated_at | RLS | Origin |
| -------------------------- | -------------- | ------ | ---------- | --- | ------ |
| `brands`                   | ENTITY         | ✓      | ✓          | ✓   | 015    |
| `brand_kits`               | ENTITY         | ✓      | ✓          | ✓   | 015    |
| `brand_guidelines`         | ENTITY         | ✓      | ✓          | ✓   | 015    |
| `brand_guideline_sections` | ENTITY         | ✓      | ✓          | ✓   | 015    |
| `brand_guideline_versions` | ENTITY         | ✓      | ✗          | ✓   | 015    |
| `campaigns`                | ENTITY         | ✓      | ✓          | ✓   | 015    |
| `campaign_channels`        | ENTITY         | ✓      | ✓          | ✓   | 015    |
| `campaign_assets`          | ENTITY         | ✓      | ✓          | ✓   | 015    |
| `campaign_kpis`            | ENTITY         | ✓      | ✓          | ✓   | 015    |
| `campaign_metrics`         | AUDIT          | ✓      | ✗          | ✓   | 015    |
| `creative_briefs`          | ENTITY         | ✓      | ✓          | ✓   | 015    |
| `creative_reviews`         | ENTITY         | ✓      | ✗          | ✓   | 015    |
| `brief_deliverables`       | ENTITY         | ✓      | ✓          | ✓   | 071    |
| `brief_templates`          | LOOKUP         | ✓      | ✓          | ✓   | 015    |

---

## Domain 15: Automation & Workflows (9 tables)

| Table                     | Classification | org_id | updated_at | RLS | Origin |
| ------------------------- | -------------- | ------ | ---------- | --- | ------ |
| `automations`             | ENTITY         | ✓      | ✓          | ✓   | 005    |
| `automation_rules`        | ENTITY         | ✗      | ✓          | ✓   | 005    |
| `automation_executions`   | AUDIT          | ✓      | ✗          | ✓   | 061    |
| `automation_dead_letters` | AUDIT          | ✓      | ✗          | ✓   | 085    |
| `approval_workflows`      | ENTITY         | ✓      | ✓          | ✓   | 016    |
| `approval_steps`          | ENTITY         | ✗      | ✓          | ✓   | 016    |
| `approvals`               | ENTITY         | ✓      | ✓          | ✓   | 016    |
| `workflow_instances`      | ENTITY         | ✓      | ✓          | ✓   | 085    |
| `workflow_step_approvals` | ENTITY         | ✗      | ✗          | ✓   | 085    |

---

## Domain 16: AI & Intelligence (12 tables)

| Table                | Classification | org_id | updated_at | RLS | Origin |
| -------------------- | -------------- | ------ | ---------- | --- | ------ |
| `ai_providers`       | LOOKUP         | ✓      | ✓          | ✓   | 085    |
| `ai_models`          | LOOKUP         | ✓      | ✗          | ✓   | 085    |
| `ai_api_keys`        | CONFIG         | ✓      | ✗          | ✓   | 085    |
| `ai_system_prompts`  | CONFIG         | ✓      | ✓          | ✓   | 085    |
| `ai_conversations`   | ENTITY         | ✓      | ✓          | ✓   | 085    |
| `ai_messages`        | ENTITY         | ✓      | ✗          | ✓   | 085    |
| `ai_documents`       | ENTITY         | ✓      | ✗          | ✓   | 085    |
| `ai_document_chunks` | ENTITY         | ✓      | ✗          | ✓   | 085    |
| `ai_report_queries`  | ENTITY         | ✓      | ✗          | ✓   | 061    |
| `ai_usage_limits`    | CONFIG         | ✓      | ✗          | ✓   | 085    |
| `ai_usage_logs`      | AUDIT          | ✓      | ✗          | ✓   | 085    |
| `report_definitions` | ENTITY         | ✓      | ✓          | ✓   | 005    |

---

## Domain 17: Custom Fields & Extensibility (2 tables)

| Table                      | Classification | org_id | updated_at | RLS | Origin  |
| -------------------------- | -------------- | ------ | ---------- | --- | ------- |
| `custom_field_definitions` | CUSTOM         | ✓      | ✓          | ✓   | 034→061 |
| `custom_field_values`      | CUSTOM         | ✓      | ✓          | ✓   | 005→061 |

---

## Domain 18: Settings & Configuration (11 tables)

| Table                      | Classification | org_id | updated_at | RLS | Origin |
| -------------------------- | -------------- | ------ | ---------- | --- | ------ |
| `setting_definitions`      | CONFIG         | ✗      | ✗          | ✓   | 085    |
| `settings`                 | CONFIG         | ✗      | ✗          | ✓   | 085    |
| `settings_change_log`      | AUDIT          | ✗      | ✗          | ✓   | 085    |
| `settings_change_requests` | ENTITY         | ✓      | ✓          | ✓   | 085    |
| `saved_views`              | ENTITY         | ✓      | ✓          | ✓   | 005    |
| `dashboards`               | ENTITY         | ✓      | ✓          | ✓   | 005    |
| `dashboard_widgets`        | ENTITY         | ✗      | ✓          | ✓   | 005    |
| `export_templates`         | LOOKUP         | ✓      | ✓          | ✓   | 019    |
| `feature_flags`            | CONFIG         | ✗      | ✓          | ✓   | 085    |
| `feature_flag_overrides`   | CONFIG         | ✗      | ✗          | ✓   | 085    |
| `user_preferences`         | CONFIG         | ✗      | ✓          | ✓   | 085    |

---

## Domain 19: Integrations & Webhooks (10 tables)

| Table                    | Classification | org_id | updated_at | RLS | Origin |
| ------------------------ | -------------- | ------ | ---------- | --- | ------ |
| `integrations`           | ENTITY         | ✓      | ✓          | ✓   | 034    |
| `integration_catalog`    | LOOKUP         | ✗      | ✗          | ✓   | 085    |
| `provider_connections`   | ENTITY         | ✓      | ✓          | ✓   | 085    |
| `provider_ticket_map`    | RELATIONSHIP   | ✓      | ✓          | ✓   | 085    |
| `webhook_subscriptions`  | ENTITY         | ✓      | ✓          | ✓   | 085    |
| `webhook_events`         | AUDIT          | ✓      | ✗          | ✓   | 085    |
| `webhook_deliveries`     | AUDIT          | ✗      | ✗          | ✓   | 085    |
| `sync_events`            | AUDIT          | ✓      | ✗          | ✓   | 085    |
| `sync_conflict_policies` | CONFIG         | ✓      | ✓          | ✓   | 085    |
| `domain_events`          | AUDIT          | ✓      | ✗          | ✓   | 085    |
| `idempotency_keys`       | CONFIG         | ✓      | ✗          | ✓   | 085    |
| `service_health_checks`  | AUDIT          | ✓      | ✓          | ✓   | 085    |
| `resilience_targets`     | CONFIG         | ✓      | ✓          | ✓   | 085    |

---

## Domain 20: Access & Credentials (8 tables)

| Table                        | Classification | org_id | updated_at | RLS | Origin |
| ---------------------------- | -------------- | ------ | ---------- | --- | ------ |
| `credential_types`           | LOOKUP         | ✓      | ✓          | ✓   | 020    |
| `credential_assignments`     | ENTITY         | ✓      | ✓          | ✓   | 020    |
| `credential_inventory_pools` | ENTITY         | ✓      | ✓          | ✓   | 020    |
| `credential_scan_log`        | AUDIT          | ✓      | ✗          | ✓   | 020    |
| `scan_events`                | AUDIT          | ✓      | ✗          | ✓   | 020    |
| `space_bookings`             | ENTITY         | ✓      | ✓          | ✓   | 020    |
| `vip_guests`                 | ENTITY         | ✓      | ✓          | ✓   | 020    |
| `vip_service_requests`       | ENTITY         | ✓      | ✓          | ✓   | 020    |

---

## Domain 21: Misc & Remaining (22 tables)

| Table                     | Classification | org_id | updated_at | RLS | Origin |
| ------------------------- | -------------- | ------ | ---------- | --- | ------ |
| `activity_log`            | AUDIT          | ✓      | ✗          | ✓   | 002    |
| `record_activity_log`     | AUDIT          | ✓      | ✗          | ✓   | 034    |
| `record_comments`         | ENTITY         | ✓      | ✓          | ✓   | 034    |
| `record_links`            | ENTITY         | ✓      | ✗          | ✓   | 034    |
| `entity_dependencies`     | RELATIONSHIP   | ✓      | ✓          | ✓   | 021    |
| `entity_tag_assignments`  | RELATIONSHIP   | ✗      | ✗          | ✓   | 085    |
| `tags`                    | LOOKUP         | ✓      | ✓          | ✓   | 085    |
| `calendar_events`         | ENTITY         | ✓      | ✓          | ✓   | 001    |
| `schedule_entries`        | ENTITY         | ✓      | ✓          | ✓   | 003    |
| `change_orders`           | ENTITY         | ✓      | ✓          | ✓   | 016    |
| `change_order_log`        | AUDIT          | ✓      | ✗          | ✓   | 016    |
| `scopes_of_work`          | ENTITY         | ✓      | ✓          | ✓   | 021    |
| `sow_deliverables`        | ENTITY         | ✓      | ✓          | ✓   | 021    |
| `sow_change_log`          | AUDIT          | ✓      | ✗          | ✓   | 021    |
| `checklist_templates`     | LOOKUP         | ✓      | ✓          | ✓   | 003    |
| `quality_check_templates` | LOOKUP         | ✓      | ✓          | ✓   | 021    |
| `quality_checks`          | ENTITY         | ✓      | ✓          | ✓   | 021    |
| `qc_gates`                | ENTITY         | ✓      | ✓          | ✓   | 021    |
| `readiness_gates`         | ENTITY         | ✓      | ✓          | ✓   | 020    |
| `environmental_readings`  | AUDIT          | ✓      | ✗          | ✓   | 020    |
| `equipment_check_ins`     | ENTITY         | ✓      | ✓          | ✓   | 020    |
| `incidents`               | ENTITY         | ✓      | ✓          | ✓   | 003    |
| `guest_incidents`         | ENTITY         | ✓      | ✓          | ✓   | 020    |
| `maintenance_records`     | ENTITY         | ✓      | ✓          | ✓   | 019    |
| `maintenance_schedules`   | ENTITY         | ✓      | ✓          | ✓   | 019    |

---

## Domain 22: Onboarding & Lifecycle (8 tables)

| Table                         | Classification | org_id | updated_at | RLS | Origin |
| ----------------------------- | -------------- | ------ | ---------- | --- | ------ |
| `onboarding_step_definitions` | LOOKUP         | ✗      | ✓          | ✓   | 085    |
| `onboarding_step_templates`   | LOOKUP         | ✓      | ✓          | ✓   | 011    |
| `onboarding_step_progress`    | ENTITY         | ✓      | ✓          | ✓   | 011    |
| `offboarding_step_templates`  | LOOKUP         | ✓      | ✓          | ✓   | 011    |
| `offboarding_step_progress`   | ENTITY         | ✗      | ✗          | ✓   | 011    |
| `user_onboarding_progress`    | ENTITY         | ✗      | ✗          | ✓   | 085    |
| `invitations`                 | ENTITY         | ✓      | ✓          | ✓   | 001    |
| `bulk_import_jobs`            | ENTITY         | ✓      | ✓          | ✓   | 019    |

---

## Domain 23: Subscriptions & Tiers (7 tables)

| Table                      | Classification | org_id | updated_at | RLS | Origin |
| -------------------------- | -------------- | ------ | ---------- | --- | ------ |
| `org_subscriptions`        | ENTITY         | ✓      | ✓          | ✓   | 031    |
| `org_bundle_subscriptions` | ENTITY         | ✓      | ✓          | ✓   | 031    |
| `tier_usage_counters`      | ENTITY         | ✓      | ✓          | ✓   | 031    |
| `field_bundles`            | LOOKUP         | ✗      | ✗          | ✓   | 031    |
| `field_bundle_items`       | RELATIONSHIP   | ✗      | ✗          | ✓   | 031    |
| `field_access_overrides`   | CONFIG         | ✓      | ✓          | ✓   | 031    |
| `field_role_access`        | CONFIG         | ✗      | ✗          | ✓   | 031    |
| `field_tier_assignments`   | CONFIG         | ✗      | ✗          | ✓   | 031    |
| `field_usage_daily`        | AUDIT          | ✓      | ✗          | ✓   | 031    |
| `field_usage_events`       | AUDIT          | ✗      | ✗          | ✓   | 031    |

---

## Domain 24: Catalog & POS (5 tables)

| Table                      | Classification | org_id | updated_at | RLS | Origin |
| -------------------------- | -------------- | ------ | ---------- | --- | ------ |
| `catalog_categories`       | LOOKUP         | ✓      | ✓          | ✓   | 085    |
| `catalog_items`            | ENTITY         | ✓      | ✓          | ✓   | 085    |
| `catalog_item_modifiers`   | ENTITY         | ✓      | ✓          | ✓   | 085    |
| `catalog_modifier_options` | ENTITY         | ✗      | ✗          | ✓   | 085    |
| `catalog_org_overrides`    | CONFIG         | ✓      | ✓          | ✓   | 085    |
| `catalog_pricing_tiers`    | CONFIG         | ✗      | ✓          | ✓   | 085    |

---

## Domain 25: Service & Support (4 tables)

| Table              | Classification | org_id | updated_at | RLS | Origin |
| ------------------ | -------------- | ------ | ---------- | --- | ------ |
| `service_requests` | ENTITY         | ✓      | ✓          | ✓   | 002    |
| `sla_policies`     | CONFIG         | ✓      | ✓          | ✓   | 061    |
| `sla_definitions`  | CONFIG         | ✓      | ✓          | ✓   | 085    |
| `sla_tracking`     | AUDIT          | ✓      | ✗          | ✓   | 085    |
| `survey_templates` | ENTITY         | ✓      | ✓          | ✓   | 061    |
| `survey_responses` | ENTITY         | ✓      | ✗          | ✓   | 061    |

---

## Domain 26: Governance & Audit (4 tables)

| Table                     | Classification | org_id | updated_at | RLS | Origin |
| ------------------------- | -------------- | ------ | ---------- | --- | ------ |
| `governance_audit_log`    | AUDIT          | ✓      | ✗          | ✓   | 085    |
| `role_change_log`         | AUDIT          | ✓      | ✗          | ✓   | 085    |
| `org_comm_templates`      | LOOKUP         | ✓      | ✓          | ✓   | 020    |
| `scenarios`               | ENTITY         | ✓      | ✓          | ✓   | 085    |
| `scenario_variables`      | ENTITY         | ✗      | ✗          | ✓   | 085    |
| `scenario_outcomes`       | ENTITY         | ✗      | ✗          | ✓   | 085    |
| `scenario_resource_plans` | ENTITY         | ✗      | ✗          | ✓   | 085    |

---

## Domain 27: Rental & Equipment (3 tables)

| Table                    | Classification | org_id | updated_at | RLS | Origin |
| ------------------------ | -------------- | ------ | ---------- | --- | ------ |
| `rental_agreements`      | ENTITY         | ✓      | ✓          | ✓   | 019    |
| `rental_agreement_lines` | ENTITY         | ✓      | ✓          | ✓   | 019    |
| `technical_specs`        | ENTITY         | ✓      | ✓          | ✓   | 003    |

---

## Views Inventory (30)

| View                            | Type         | Domain     |
| ------------------------------- | ------------ | ---------- |
| `account_revenue_summary`       | Standard     | CRM        |
| `auth_failed_login_alerts`      | Standard     | Security   |
| `brief_pipeline`                | Standard     | Creative   |
| `campaign_overview`             | Standard     | Creative   |
| `lead_pipeline_stats`           | Standard     | CRM        |
| `mv_dashboard_kpis`             | Materialized | Analytics  |
| `pipeline_forecast`             | Standard     | CRM        |
| `production_milestones_view`    | Standard     | Production |
| `production_tasks_view`         | Standard     | Production |
| `revenue_recognition_summary`   | Standard     | Finance    |
| `review_stats`                  | Standard     | HR         |
| `user_profiles_with_org`        | Standard     | Identity   |
| `v_budget_profitability`        | Standard     | Finance    |
| `v_client_invoice_aging`        | Standard     | Finance    |
| `v_crew_utilization`            | Standard     | HR         |
| `v_invoice_aging`               | Standard     | Finance    |
| `v_location_compliance_summary` | Standard     | Logistics  |
| `v_location_hierarchy`          | Standard     | Logistics  |
| `v_location_profitability`      | Standard     | Logistics  |
| `v_pipeline_summary`            | Standard     | CRM        |
| `v_project_production_summary`  | Standard     | Production |
| `v_project_profitability`       | Standard     | Finance    |
| `v_revenue_recognition_summary` | Standard     | Finance    |
| `v_sla_status`                  | Standard     | Support    |
| `v_sow_deliverable_summary`     | Standard     | Projects   |
| `v_sow_summary`                 | Standard     | Projects   |
| `v_time_tracking_compliance`    | Standard     | HR         |
| `v_user_task_summary`           | Standard     | Projects   |
| `v_vertical_budget_summary`     | Standard     | Production |
| `v_work_package_cost_summary`   | Standard     | Production |
