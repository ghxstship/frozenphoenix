# Schema Optimization Plan

> **Generated:** 2026-03-15
> **Scope:** 66 Supabase migrations (`001_initial_schema.sql` → `066_extended_user_profile_fields.sql`)
> **Total tables:** ~250+
> **Total enums:** ~80+

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Full Table Inventory by Workstream](#2-full-table-inventory-by-workstream)
3. [3NF Violations & Redundancy Findings](#3-3nf-violations--redundancy-findings)
4. [Duplicate / Overlapping Tables](#4-duplicate--overlapping-tables)
5. [Missing Indexes & FK Gaps](#5-missing-indexes--fk-gaps)
6. [RLS Coverage Audit](#6-rls-coverage-audit)
7. [Trigger & Function Inventory](#7-trigger--function-inventory)
8. [Enum Consolidation Opportunities](#8-enum-consolidation-opportunities)
9. [JSONB → Relational Normalization Candidates](#9-jsonb--relational-normalization-candidates)
10. [Recommended Migration Plan](#10-recommended-migration-plan)

---

## 1. Executive Summary

The FrozenPhoenix schema has grown organically across 66 migrations spanning 11 domain workstreams. While the schema is comprehensive and covers an impressive breadth of functionality (CRM, production lifecycle, live events, credentialing, financials, compliance, digital assets, messaging, and more), the organic growth has introduced:

- **~12 duplicate/overlapping table pairs** where the same concept was defined in an early migration and re-defined in a later "v2" migration without dropping the original
- **~8 JSONB columns** that violate 3NF and should be normalized to junction tables
- **~15 tables missing RLS policies** (identified in migration 061 but some gaps remain)
- **3 identity tables** (`profiles`, `user_profiles`, `worker_profiles`) that need a clear canonical ownership chain
- **~6 enum types** that overlap or could be consolidated
- **Several tables created twice** in both `034_v2_feature_gaps.sql` AND `061_rls_remediation_missing_tables.sql` with `IF NOT EXISTS` guards

### Risk Assessment

| Category                    | Severity     | Count    | Impact                                                 |
| --------------------------- | ------------ | -------- | ------------------------------------------------------ |
| Duplicate table definitions | **Critical** | 12       | Data written to wrong table; queries return stale data |
| 3NF violations (JSONB bags) | **High**     | 8        | Cannot enforce FKs; no referential integrity           |
| Missing RLS                 | **High**     | ~15      | Data leakage across organizations                      |
| Identity fragmentation      | **High**     | 3 tables | Broken joins; profile data in wrong table              |
| Stale enums                 | **Medium**   | 6        | CHECK constraint failures on valid data                |
| Missing indexes             | **Low**      | ~20      | Performance degradation at scale                       |

---

## 2. Full Table Inventory by Workstream

### Workstream A: Identity & Organization (~25 tables)

| Table                         | Migration | Purpose                                            |
| ----------------------------- | --------- | -------------------------------------------------- |
| `profiles`                    | 001       | Original user profile (auth.users FK)              |
| `user_profiles`               | 018       | **V2 canonical user identity** (replaces profiles) |
| `organizations`               | 001       | Tenant container                                   |
| `org_memberships`             | 018       | User ↔ Org with scoped role                        |
| `invitations`                 | 018       | Pre-registration access grants                     |
| `onboarding_step_definitions` | 018       | Template steps per role                            |
| `user_onboarding_progress`    | 018       | Per-user step tracking                             |
| `user_preferences`            | 018       | Key-value preference storage                       |
| `login_audit_log`             | 018       | Immutable auth event log                           |
| `user_sessions`               | 018       | Active session tracking                            |
| `api_tokens`                  | 018       | Personal access tokens                             |
| `temporary_access_grants`     | 018       | Time-bound resource access                         |
| `role_change_log`             | 018       | Immutable permission audit trail                   |
| `user_compliance_acks`        | 018       | Policy acknowledgments                             |
| `reserved_usernames`          | 039       | System route protection                            |
| `username_change_log`         | 039       | Username audit trail                               |
| `released_usernames`          | 039       | 30-day cooldown holds                              |
| `teams`                       | 056       | Organizational teams                               |
| `team_members`                | 056       | Team ↔ User junction                               |
| `user_certifications`         | 064       | User credential records                            |
| `worker_profiles`             | 011       | Unified workforce identity                         |
| `worker_classifications`      | 011       | Employment type per worker                         |
| `engagement_terms`            | 011       | Rate history per classification                    |
| `classification_assessments`  | 011       | IC compliance assessments                          |
| `notification_preferences`    | 006       | Per-user notification settings                     |

### Workstream B: Projects, Budgets & Financial (~40 tables)

| Table                            | Migration              | Purpose                       |
| -------------------------------- | ---------------------- | ----------------------------- |
| `projects`                       | 001                    | Core project entity           |
| `tasks`                          | 001                    | Project tasks                 |
| `budgets`                        | 003                    | Project budgets               |
| `production_budget_lines`        | 003                    | Budget line items             |
| `production_expenses`            | 003                    | Expense tracking              |
| `time_entries`                   | 001 (altered 005, 007) | Time tracking                 |
| `production_time_entries`        | 003                    | Production-specific time      |
| `active_timers`                  | 005                    | Running timers                |
| `payroll_batches`                | 003                    | Payroll processing            |
| `rate_cards`                     | 005                    | Billing rate definitions      |
| `rate_card_items`                | 005                    | Rate card line items          |
| `proposals`                      | 005                    | Client proposals              |
| `proposal_items`                 | 005                    | Proposal line items           |
| `invoices`                       | 001 (altered 005)      | Client invoices (v1)          |
| `invoice_templates`              | 005                    | Reusable invoice formats      |
| `recurring_invoices`             | 005                    | Auto-generated invoices       |
| `payments`                       | 005                    | Payment records               |
| `credit_notes`                   | 005                    | Credit adjustments            |
| `scopes_of_work`                 | 007                    | SOW lifecycle                 |
| `sow_deliverables`               | 007                    | SOW line items                |
| `client_invoices`                | 007                    | SOW-linked invoices           |
| `invoice_line_items`             | 007                    | Detailed line items           |
| `invoice_time_entries`           | 007                    | Time → invoice junction       |
| `sow_change_log`                 | 007                    | SOW change history            |
| `deliverable_progress_snapshots` | 007                    | Progress tracking             |
| `estimates`                      | 008                    | Client-facing estimates       |
| `job_cost_entries`               | 008                    | Per-project cost tracking     |
| `change_orders`                  | 013                    | Project change orders         |
| `change_order_log`               | 013                    | Change order audit trail      |
| `revenue_schedules`              | 013                    | Revenue recognition timelines |
| `revenue_recognition_entries`    | 034/061                | Period-based rev rec          |
| `gl_accounts`                    | 016                    | Chart of accounts             |
| `budget_approvals`               | 016                    | Budget approval workflow      |
| `payment_approvals`              | 016                    | Payment approval workflow     |
| `budget_alerts`                  | 033                    | Threshold-based alerts        |
| `exchange_rates`                 | 022                    | Multi-currency support        |
| `financial_periods`              | 022                    | Period open/close             |
| `time_tracking_policies`         | 034/061                | Org-level time rules          |
| `expense_reports`                | 060                    | Expense report submissions    |
| `timesheets`                     | 060                    | Weekly timesheet approvals    |
| `org_subscriptions`              | 031                    | Billing tier tracking         |

### Workstream C: CRM & Pipeline (~20 tables)

| Table                      | Migration              | Purpose                        |
| -------------------------- | ---------------------- | ------------------------------ |
| `companies`                | 005                    | Account/company records        |
| `contacts`                 | 005                    | Contact records                |
| `deals`                    | 001 (altered 004, 005) | Sales deals                    |
| `pipelines`                | 005                    | Sales pipeline definitions     |
| `lost_reasons`             | 005                    | Deal loss tracking             |
| `leads`                    | 004                    | Inbound leads                  |
| `lead_activities`          | 004                    | Lead interaction log           |
| `opportunities`            | 013                    | Proper sales funnel (v2 deals) |
| `opportunity_activities`   | 013                    | Opportunity interaction log    |
| `account_health_scores`    | 013                    | Client health tracking         |
| `custom_fields`            | 005                    | Entity custom fields (v1)      |
| `custom_field_values`      | 005                    | Custom field data (v1)         |
| `custom_field_definitions` | 034/061                | Custom fields (v2)             |
| `saved_views`              | 005                    | Saved list filters             |
| `automations`              | 005                    | Rule definitions               |
| `automation_rules`         | 005                    | Rule conditions                |
| `automation_logs`          | 005                    | Execution history (v1)         |
| `automation_executions`    | 034/061                | Execution history (v2)         |
| `record_comments`          | 033                    | Entity-level activity feed     |
| `record_activity_log`      | 033                    | Field change tracking          |

### Workstream D: Production & Live Events (~35 tables)

| Table                          | Migration | Purpose                        |
| ------------------------------ | --------- | ------------------------------ |
| `events`                       | 001       | Core event entity              |
| `activations`                  | 001       | Brand activations              |
| `crew_members`                 | 001       | Crew roster                    |
| `shifts`                       | 001       | Shift scheduling               |
| `live_event_instances`         | 020       | Live event operations layer    |
| `command_positions`            | 020       | Event command structure        |
| `readiness_gates`              | 020       | Go/no-go gates                 |
| `department_statuses`          | 020       | Per-department readiness       |
| `ros_cues`                     | 020       | Run of Show cues               |
| `comm_channels`                | 020       | Radio/comms channels           |
| `comm_log_entries`             | 020       | Communication log              |
| `live_crew_assignments`        | 020       | Event-day crew positions       |
| `equipment_check_ins`          | 020       | Asset check-in/out             |
| `environmental_readings`       | 020       | Weather/environment data       |
| `live_financial_snapshots`     | 020       | Real-time budget tracking      |
| `foh_zones`                    | 020       | Front-of-house zones           |
| `foh_zone_readings`            | 020       | Zone capacity/metrics          |
| `vip_guests`                   | 020       | VIP management                 |
| `vip_service_requests`         | 020       | VIP service tracking           |
| `guest_incidents`              | 020       | Incident reporting             |
| `strike_sequences`             | 020       | Post-event teardown            |
| `production_verticals`         | 021       | Industry vertical definitions  |
| `boms`                         | 021       | Bill of Materials              |
| `bom_lines`                    | 021       | BOM line items                 |
| `work_packages`                | 021       | WBS-style packages             |
| `work_package_dependencies`    | 021       | Package dependency graph       |
| `production_runs`              | 021       | Manufacturing-style runs       |
| `production_run_inputs`        | 021       | Run material inputs            |
| `qc_gates`                     | 021       | Quality control gates          |
| `technical_specs`              | 021       | Polymorphic tech specs         |
| `rights_licenses`              | 021       | IP/media licensing             |
| `rental_agreements`            | 021       | Equipment rentals              |
| `rental_agreement_lines`       | 021       | Rental line items              |
| `vendor_vertical_capabilities` | 021       | Vendor ↔ vertical junction     |
| `call_sheets`                  | 006       | Production call sheets         |
| `call_sheet_crew`              | 006       | Call sheet crew assignments    |
| `tech_sheets`                  | 006       | Technical specification sheets |

### Workstream E: Catalog & Advancing (~10 tables)

| Table                      | Migration | Purpose                    |
| -------------------------- | --------- | -------------------------- |
| `catalog_categories`       | 047       | Hierarchical category tree |
| `catalog_items`            | 047       | Master catalog items       |
| `catalog_item_modifiers`   | 047       | Item modifier definitions  |
| `catalog_modifier_options` | 047       | Modifier option values     |
| `catalog_org_overrides`    | 047       | Per-org pricing/visibility |
| `advance_templates`        | 048       | Reusable order templates   |
| `production_advances`      | 048       | Event advance orders       |
| `production_advance_items` | 048       | Advance line items         |
| `advance_status_history`   | 048       | Polymorphic audit trail    |

### Workstream F: Messaging & Communications (~10 tables)

| Table                            | Migration | Purpose                   |
| -------------------------------- | --------- | ------------------------- |
| `conversations`                  | 046       | Conversation containers   |
| `conversation_members`           | 046       | Membership junction       |
| `messages`                       | 046       | Message content           |
| `message_reactions`              | 046       | Emoji reactions           |
| `message_read_receipts`          | 046       | Read tracking             |
| `mandatory_read_acknowledgments` | 046       | Required-read tracking    |
| `channel_templates`              | 050       | Event channel templates   |
| `messaging_escalation_rules`     | 050       | Auto-escalation rules     |
| `vendor_communications`          | 008       | Vendor-specific comms     |
| `email_messages`                 | 034/061   | Email integration records |

### Workstream G: Credentialing & Ticketing (~10 tables)

| Table                        | Migration | Purpose                    |
| ---------------------------- | --------- | -------------------------- |
| `credential_types`           | 051       | Credential/pass categories |
| `credential_inventory_pools` | 051       | Per-event inventory        |
| `credential_assignments`     | 051       | Credential ↔ contact       |
| `credential_scan_log`        | 051       | Immutable scan events      |
| `provider_connections`       | 055       | External provider config   |
| `provider_ticket_map`        | 055       | Provider ↔ credential map  |
| `pos_transactions`           | 055       | POS transaction records    |
| `pos_transaction_items`      | 055       | POS line items             |
| `webhook_events`             | 055       | Inbound webhook log        |
| `sync_events`                | 055       | Bidirectional sync audit   |
| `sync_conflict_policies`     | 055       | Per-field conflict rules   |

### Workstream H: RBAC, Settings & Feature Flags (~20 tables)

| Table                      | Migration | Purpose                      |
| -------------------------- | --------- | ---------------------------- |
| `role_definitions`         | 028       | Custom role definitions      |
| `permission_grants`        | 028       | Role ↔ resource permissions  |
| `access_audit_log`         | 028       | Permission check audit trail |
| `setting_definitions`      | 026       | Setting schema/catalog       |
| `settings`                 | 026       | Scoped setting values        |
| `settings_change_log`      | 026       | Setting change audit trail   |
| `settings_change_requests` | 035       | Setting change approvals     |
| `feature_flags`            | 027       | Feature flag definitions     |
| `feature_flag_overrides`   | 027       | Per-scope flag overrides     |
| `field_tier_assignments`   | 031       | Field ↔ pricing tier map     |
| `field_role_access`        | 031       | Field ↔ role access rules    |
| `field_bundles`            | 031       | Field bundle definitions     |
| `field_bundle_items`       | 031       | Bundle ↔ field junction      |
| `org_bundle_subscriptions` | 031       | Org ↔ bundle subscriptions   |
| `field_access_overrides`   | 031       | Per-org field overrides      |
| `field_usage_events`       | 031       | Usage metering events        |
| `field_usage_daily`        | 031       | Aggregated daily usage       |
| `upsell_triggers`          | 031       | Upsell rule definitions      |
| `upsell_events`            | 031       | Upsell event log             |
| `tier_usage_counters`      | 059       | Soft-limit usage counters    |

### Workstream I: Assets, Inventory & Logistics (~25 tables)

| Table                    | Migration      | Purpose                          |
| ------------------------ | -------------- | -------------------------------- |
| `assets`                 | 001            | Core asset records               |
| `consumables`            | 003            | Consumable inventory             |
| `shipments`              | 003            | Shipment tracking                |
| `warehouses`             | 003            | Warehouse definitions            |
| `warehouse_zones`        | 019            | Zone structure within warehouses |
| `warehouse_locations`    | 019            | Bin/shelf locations              |
| `inventory_reservations` | 019            | Allocation locks                 |
| `shipment_items`         | 019            | Structured shipment contents     |
| `kits`                   | 019            | Asset/consumable groupings       |
| `kit_items`              | 019            | Kit ↔ item junction              |
| `scan_events`            | 019            | Barcode/RFID scan log            |
| `load_plans`             | 019            | Vehicle load planning            |
| `load_plan_items`        | 019            | Load ↔ shipment item             |
| `logistics_events`       | 019            | Shipment event timeline          |
| `asset_damage_reports`   | 019            | Damage documentation             |
| `maintenance_schedules`  | 019            | Preventive maintenance           |
| `depreciation_schedules` | 019            | Financial depreciation           |
| `inventory_audits`       | 019            | Cycle count headers              |
| `audit_count_items`      | 019            | Cycle count line items           |
| `activation_assets`      | 012            | Activation ↔ asset junction      |
| `event_assets`           | 012            | Event ↔ asset junction           |
| `activity_assets`        | 012            | Activity ↔ asset junction        |
| `activity_consumables`   | 012            | Activity ↔ consumable junction   |
| `vehicles`               | (ref'd by 019) | Vehicle records                  |
| `bulk_import_jobs`       | 054            | CSV/XLSX import tracking         |
| `export_templates`       | 054            | Export format config             |

### Workstream J: Documents, Knowledge & Digital Assets (~25 tables)

| Table                       | Migration | Purpose                            |
| --------------------------- | --------- | ---------------------------------- |
| `documents`                 | 005       | Document records                   |
| `document_versions`         | 005       | Version history                    |
| `document_templates`        | 005       | Template definitions               |
| `knowledge_base_articles`   | 003       | KB articles (v1)                   |
| `knowledge_articles`        | 033       | KB articles (v2)                   |
| `knowledge_article_links`   | 033       | Article ↔ entity junction          |
| `storage_objects`           | 014       | Multi-provider storage abstraction |
| `digital_assets`            | 014       | DAM metadata                       |
| `asset_versions`            | 014       | DAM version history                |
| `asset_links`               | 014       | Polymorphic entity ↔ asset         |
| `asset_tags`                | 014       | Tag taxonomy                       |
| `asset_tag_assignments`     | 014       | Asset ↔ tag junction               |
| `asset_access_controls`     | 014       | Asset-level ACL                    |
| `asset_access_log`          | 014       | Asset access audit trail           |
| `asset_retention_policies`  | 014       | Retention rules                    |
| `legal_holds`               | 014       | Legal hold definitions             |
| `asset_dependencies`        | 014       | Asset dependency graph             |
| `brief_templates`           | 015       | Creative brief templates           |
| `brand_guidelines`          | 015       | Multi-brand hierarchy              |
| `brand_guideline_sections`  | 015       | Guideline content sections         |
| `brand_guideline_versions`  | 015       | Immutable snapshots                |
| `creative_briefs`           | 015       | Creative brief instances           |
| `campaigns`                 | 015       | Campaign management                |
| `campaign_channels`         | 015       | Distribution channels              |
| `campaign_assets`           | 015       | Campaign ↔ asset junction          |
| `campaign_kpis`             | 015       | KPI definitions                    |
| `campaign_metrics`          | 015       | Time-series metrics                |
| `creative_reviews`          | 015       | Multi-gate approval                |
| `asset_channel_deployments` | 015       | Asset ↔ channel deployment         |
| `survey_templates`          | 034/061   | Survey definitions                 |
| `survey_responses`          | 034/061   | Survey answer records              |

### Workstream K: Compliance, Audit & Operational Health (~30 tables)

| Table                      | Migration     | Purpose                          |
| -------------------------- | ------------- | -------------------------------- |
| `approvals`                | 001           | Generic approval records         |
| `approval_workflows`       | 006           | Multi-step approval definitions  |
| `approval_steps`           | 006           | Workflow step definitions        |
| `workflow_instances`       | 006           | Running workflow instances       |
| `workflow_step_approvals`  | 006           | Per-step approval records        |
| `e_signatures`             | 006           | Electronic signatures            |
| `incidents`                | 003           | Incident reports                 |
| `compliance_requirements`  | 008           | Vendor compliance templates (v1) |
| `vendor_compliance_docs`   | 008           | Vendor compliance docs (v1)      |
| `compliance_templates`     | 011           | Compliance templates (v2)        |
| `worker_compliance_docs`   | 011           | Worker compliance docs (v2)      |
| `insurance_requirements`   | 016           | Insurance rule definitions       |
| `insurance_policies`       | 016           | Policy records                   |
| `contracts`                | 016 (altered) | Legal contracts                  |
| `contract_amendments`      | 016           | Contract change records          |
| `contract_clauses`         | 016           | Clause library                   |
| `contract_obligations`     | 016           | Obligation tracking              |
| `ip_rights`                | 016           | IP rights records                |
| `permits`                  | 016           | Permit/license tracking          |
| `engineering_approvals`    | 016           | Engineering sign-offs            |
| `compliance_checklists`    | 016           | Regulatory checklists            |
| `asset_certifications`     | 016           | Asset compliance records         |
| `purchase_requisitions`    | 016           | Procurement requests             |
| `goods_receipts`           | 016           | Delivery confirmations           |
| `goods_receipt_lines`      | 022           | Normalized receipt items         |
| `vendor_risk_scores`       | 016           | Vendor risk assessment           |
| `entity_dependencies`      | 016           | Cross-domain blockers            |
| `governance_audit_log`     | 016           | Immutable governance trail       |
| `sla_definitions`          | 022           | SLA rule definitions             |
| `sla_tracking`             | 022           | SLA status tracking              |
| `sla_policies`             | 034/061       | Helpdesk SLA rules               |
| `resilience_targets`       | 022           | RTO/RPO config                   |
| `idempotency_keys`         | 022           | Dedup infrastructure             |
| `domain_events`            | 022           | Cross-domain event bus           |
| `data_export_requests`     | 022           | GDPR data export                 |
| `anonymization_queue`      | 022           | GDPR anonymization               |
| `service_health_checks`    | 058           | Service monitoring               |
| `quality_check_templates`  | 033           | QC template definitions          |
| `quality_checks`           | 033           | QC execution records             |
| `review_cycles`            | 033           | 360° review definitions          |
| `review_feedback_requests` | 033           | Review assignments               |
| `goals`                    | 033           | Goal tracking                    |

### Workstream L: Vendor & Workforce (~15 tables)

| Table                        | Migration | Purpose                        |
| ---------------------------- | --------- | ------------------------------ |
| `vendors`                    | 001       | Vendor/contractor records      |
| `vendor_reviews`             | 008       | Post-project reviews           |
| `vendor_portal_tokens`       | 008       | Portal access tokens           |
| `work_orders`                | 008       | Project ↔ vendor assignments   |
| `work_order_bids`            | 008       | Marketplace bidding            |
| `dispatch_entries`           | 008       | Crew/vendor dispatch           |
| `checklist_templates`        | 008       | Job checklist templates        |
| `job_checklists`             | 008       | Checklist instances            |
| `worker_reviews`             | 011       | All-worker reviews (v2)        |
| `onboarding_step_templates`  | 011       | Workforce onboarding templates |
| `worker_onboarding_runs`     | 011       | Onboarding instances           |
| `onboarding_step_progress`   | 011       | Step completion tracking       |
| `offboarding_step_templates` | 011       | Offboarding templates          |
| `worker_offboarding_runs`    | 011       | Offboarding instances          |
| `offboarding_step_progress`  | 011       | Step completion tracking       |

### Workstream M: Location & Spatial (~10 tables)

| Table                      | Migration         | Purpose                     |
| -------------------------- | ----------------- | --------------------------- |
| `locations`                | 001 (altered 017) | Hierarchical location tree  |
| `project_locations`        | 017               | Project ↔ location M:M      |
| `space_bookings`           | 017               | Physical space scheduling   |
| `event_space_overlays`     | 017               | Temporary reconfigurations  |
| `location_compliance_docs` | 017               | Location compliance docs    |
| `location_inspections`     | 017               | Safety audit logging        |
| `location_costs`           | 017               | Location financial tracking |
| `location_contacts`        | 017               | Location ↔ contact junction |

---

## 3. 3NF Violations & Redundancy Findings

### 3.1 Critical: Identity Fragmentation

**Problem:** Three tables serve as "user identity":

| Table             | Migration | FK Target         | Used By                                    |
| ----------------- | --------- | ----------------- | ------------------------------------------ |
| `profiles`        | 001       | `auth.users(id)`  | Legacy — deals, approvals, notifications   |
| `user_profiles`   | 018       | `auth.users(id)`  | Modern — org_memberships, sessions, tokens |
| `worker_profiles` | 011       | None (standalone) | Workforce — classifications, compliance    |

**Violation:** Same user can have rows in all three tables with no guaranteed sync. `profiles.organization_id` is a single FK while `org_memberships` supports multi-org.

**Fix:** Designate `user_profiles` as SSOT. Create a view `v_profiles` for backward compatibility. Add `user_profiles.id` FK to `worker_profiles`. Drop `profiles` table in a future migration after repointing all FKs.

### 3.2 High: Duplicate Table Definitions

The following table pairs were defined in BOTH an early migration AND a later migration with `IF NOT EXISTS`:

| Table                         | First Definition | Second Definition | Issue                                    |
| ----------------------------- | ---------------- | ----------------- | ---------------------------------------- |
| `revenue_recognition_entries` | 034              | 061               | Identical schema; harmless but confusing |
| `time_tracking_policies`      | 034              | 061               | Identical; second is no-op               |
| `automation_executions`       | 034              | 061               | Identical; second is no-op               |
| `ai_report_queries`           | 034              | 061               | Identical; second is no-op               |
| `email_messages`              | 034              | 061               | Identical; second is no-op               |
| `portal_sessions`             | 034              | 061               | Identical; second is no-op               |
| `survey_templates`            | 034              | 061               | Identical; second is no-op               |
| `survey_responses`            | 034              | 061               | Identical; second is no-op               |
| `sla_policies`                | 034              | 061               | Identical; second is no-op               |
| `custom_field_definitions`    | 034              | 061               | Identical; second is no-op               |

**Fix:** Remove the duplicate `CREATE TABLE IF NOT EXISTS` statements from `061` since they are no-ops. Add a comment in `061` referencing the canonical definitions in `034`.

### 3.3 High: Semantic Overlaps

| Concept               | Table A                                                    | Table B                                                 | Resolution                                                                                                          |
| --------------------- | ---------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Sales pipeline entity | `deals` (001)                                              | `opportunities` (013)                                   | Keep both — `deals` is lightweight, `opportunities` is full-funnel. Add `opportunity_id` FK to `deals` for linking. |
| Knowledge base        | `knowledge_base_articles` (003)                            | `knowledge_articles` (033)                              | **Drop `knowledge_base_articles`**. Migrate data to `knowledge_articles`.                                           |
| Custom fields         | `custom_fields` + `custom_field_values` (005)              | `custom_field_definitions` (034)                        | **Consolidate to `custom_field_definitions`**. The 005 version is less capable.                                     |
| Vendor compliance     | `compliance_requirements` + `vendor_compliance_docs` (008) | `compliance_templates` + `worker_compliance_docs` (011) | **Keep 011 versions** (broader scope). Migrate 008 data.                                                            |
| Vendor reviews        | `vendor_reviews` (008)                                     | `worker_reviews` (011)                                  | **Keep `worker_reviews`** (covers all worker types). Migrate data.                                                  |
| Automation logs       | `automation_logs` (005)                                    | `automation_executions` (034)                           | **Keep `automation_executions`** (richer schema). Drop `automation_logs`.                                           |
| Notification prefs    | `notification_preferences` (006)                           | `notification_preferences` (034)                        | Verify if same table or redefinition.                                                                               |

### 3.4 Medium: JSONB Bags Violating 3NF

| Table.Column                      | Migration | What's Inside           | Recommended Fix                                  |
| --------------------------------- | --------- | ----------------------- | ------------------------------------------------ |
| `goods_receipts.line_items`       | 016       | Array of received items | **Already fixed** → `goods_receipt_lines` (022)  |
| `shipments.items`                 | 003       | Shipped item list       | **Already fixed** → `shipment_items` (019)       |
| `catalogs_items.specifications`   | 047       | Product specs           | Normalize if >5 spec types used consistently     |
| `production_advances.metadata`    | 048       | Advance context data    | OK — truly schemaless metadata                   |
| `scenarios.metadata`              | 009       | Scenario config         | OK — flexible by design                          |
| `creative_briefs.deliverables`    | 015       | JSONB array             | Normalize to `brief_deliverables` junction table |
| `creative_briefs.target_audience` | 015       | JSONB object            | OK — semi-structured demographic data            |
| `campaigns.targeting_criteria`    | 015       | JSONB object            | OK — flexible targeting config                   |

---

## 4. Duplicate / Overlapping Tables

### Tables to Deprecate (with migration path)

```
DEPRECATE: profiles                    → REPLACE WITH: user_profiles
DEPRECATE: knowledge_base_articles     → REPLACE WITH: knowledge_articles
DEPRECATE: custom_fields               → REPLACE WITH: custom_field_definitions
DEPRECATE: custom_field_values         → MERGE INTO:   custom_field_definitions + JSONB values
DEPRECATE: compliance_requirements     → REPLACE WITH: compliance_templates
DEPRECATE: vendor_compliance_docs      → REPLACE WITH: worker_compliance_docs
DEPRECATE: vendor_reviews              → REPLACE WITH: worker_reviews
DEPRECATE: automation_logs             → REPLACE WITH: automation_executions
```

### Migration Strategy

Each deprecation requires a 3-step migration:

1. **Data Migration:** `INSERT INTO new_table SELECT ... FROM old_table WHERE NOT EXISTS ...`
2. **FK Repointing:** `ALTER TABLE ... DROP CONSTRAINT ... ADD CONSTRAINT ... REFERENCES new_table`
3. **Soft Deprecation:** `COMMENT ON TABLE old_table IS 'DEPRECATED: Use new_table instead. Drop after 2026-06-01.'`

---

## 5. Missing Indexes & FK Gaps

### 5.1 Missing Composite Indexes (High-Traffic Queries)

| Table                      | Recommended Index                      | Rationale                |
| -------------------------- | -------------------------------------- | ------------------------ |
| `messages`                 | `(conversation_id, created_at DESC)`   | Chat pagination          |
| `time_entries`             | `(project_id, user_id, date)`          | Timesheet queries        |
| `credential_assignments`   | `(pool_id, status)`                    | Pool availability counts |
| `production_advance_items` | `(advance_id, lifecycle_stage)`        | Advance dashboard        |
| `ros_cues`                 | `(live_event_id, sequence)`            | Run of show ordering     |
| `campaign_metrics`         | `(campaign_id, recorded_at DESC)`      | Dashboard time-series    |
| `domain_events`            | `(status, created_at)`                 | Event bus processing     |
| `webhook_events`           | `(connection_id, status, received_at)` | Webhook retry queue      |

### 5.2 Missing Foreign Keys

| Table                 | Column       | Should Reference          | Migration |
| --------------------- | ------------ | ------------------------- | --------- |
| `worker_profiles`     | (no user FK) | `user_profiles(id)`       | 011       |
| `technical_specs`     | `entity_id`  | Polymorphic — needs CHECK | 021       |
| `record_comments`     | `entity_id`  | Polymorphic — needs CHECK | 033       |
| `record_activity_log` | `entity_id`  | Polymorphic — needs CHECK | 033       |
| `asset_links`         | `entity_id`  | Polymorphic — needs CHECK | 014       |

> **Note on polymorphic FKs:** These use `(entity_type, entity_id)` pattern. PostgreSQL cannot enforce polymorphic FKs. Consider adding a CHECK constraint validating `entity_type` against an enum and a trigger to validate existence.

---

## 6. RLS Coverage Audit

Migration `061_rls_remediation_missing_tables.sql` addressed the bulk of missing RLS. However, the following patterns need verification:

### Tables Confirmed With RLS

All tables in migrations 001-021 have `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` and at least one policy.

### Tables Requiring RLS Verification

| Table                      | Migration | Risk                                                     |
| -------------------------- | --------- | -------------------------------------------------------- |
| `goods_receipt_lines`      | 022       | Inherits from `goods_receipts` via FK — needs own policy |
| `exchange_rates`           | 022       | Org-scoped — needs policy                                |
| `incident_insurance_links` | 022       | Junction — needs policy                                  |
| `tier_usage_counters`      | 059       | Org-scoped — needs policy                                |
| `user_certifications`      | 064       | User-scoped — needs policy                               |
| `advance_status_history`   | 048       | Org-scoped via advance — needs policy                    |

### RLS Policy Pattern Recommendation

All tables should follow one of these standard patterns:

```sql
-- Pattern A: Org isolation (most tables)
CREATE POLICY "org_isolation" ON table_name
  USING (organization_id = public.get_user_org_id());

-- Pattern B: User-scoped (preferences, sessions)
CREATE POLICY "own_data" ON table_name
  USING (user_id = auth.uid());

-- Pattern C: Junction via parent (line items, child records)
CREATE POLICY "via_parent" ON child_table
  USING (parent_id IN (SELECT id FROM parent_table));
```

---

## 7. Trigger & Function Inventory

### Standard Triggers (Applied Uniformly)

| Trigger                | Function                     | Applied To   |
| ---------------------- | ---------------------------- | ------------ |
| `set_updated_at`       | `update_updated_at_column()` | ~200+ tables |
| `on_auth_user_created` | `handle_new_user()`          | `auth.users` |
| `auto_score_lead`      | `auto_score_lead()`          | `leads`      |

### Domain-Specific Triggers

| Trigger                 | Function                           | Table                | Purpose                |
| ----------------------- | ---------------------------------- | -------------------- | ---------------------- |
| `sow_change_trigger`    | `track_sow_changes()`              | `scopes_of_work`     | SOW change logging     |
| `recalc_sow_totals`     | `recalculate_sow_totals()`         | `sow_deliverables`   | Auto-sum deliverables  |
| `recalc_invoice_totals` | `recalculate_invoice_totals()`     | `invoice_line_items` | Auto-sum line items    |
| `validate_deal_stage`   | `validate_deal_stage_transition()` | `deals`              | Stage transition rules |

### Utility Functions

| Function                                        | Purpose                               | Migration |
| ----------------------------------------------- | ------------------------------------- | --------- |
| `get_user_org_id()`                             | Returns current user's org_id for RLS | 018       |
| `user_has_permission(resource, action)`         | RBAC permission check                 | 028       |
| `calculate_utilization(profile_id, start, end)` | Crew utilization calc                 | 005       |
| `check_booking_conflicts(...)`                  | Resource double-booking check         | 005       |
| `generate_proposal_number(org_id)`              | Sequential proposal numbering         | 005       |
| `convert_deal_to_project(deal_id)`              | Deal → project conversion             | 005       |
| `calculate_lead_score(lead_id)`                 | Lead scoring algorithm                | 004       |

---

## 8. Enum Consolidation Opportunities

### Enums That Should Be Merged

| Enum A                    | Enum B                           | Resolution                            |
| ------------------------- | -------------------------------- | ------------------------------------- |
| `lead_status` (004)       | Opportunity status CHECK (013)   | Keep both — different entities        |
| `call_sheet_status` (006) | `tech_sheet_status` (006)        | **Merge** → `production_sheet_status` |
| `workflow_status` (006)   | `workflow_instance_status` (006) | Keep both — definition vs instance    |

### Enums That Should Be Extended

| Enum               | Current Values                                      | Missing Values                                              |
| ------------------ | --------------------------------------------------- | ----------------------------------------------------------- |
| `sow_status`       | draft, sent, approved, active, completed, cancelled | `on_hold`, `expired`                                        |
| `booking_status`   | tentative, confirmed, cancelled                     | `completed`, `no_show`                                      |
| `department` (020) | (fixed list)                                        | Should be a **table** not an enum — departments vary by org |

### Enum → Table Candidates

These enums would be better as lookup tables for tenant customization:

| Current Enum            | Recommended Table          | Reason                  |
| ----------------------- | -------------------------- | ----------------------- |
| `department`            | `departments`              | Varies per organization |
| `compliance_doc_type`   | Keep as enum               | Standard across orgs    |
| `campaign_channel_type` | `channel_type_definitions` | Extensible per org      |
| `custom_field_type`     | Keep as enum               | Platform-defined types  |

---

## 9. JSONB → Relational Normalization Candidates

### Already Normalized (Good)

- `goods_receipts.line_items` → `goods_receipt_lines` (022)
- `shipments.items` → `shipment_items` (019)
- `warehouses.zones` → `warehouse_zones` + `warehouse_locations` (019)

### Should Normalize

| Table.Column                                           | Type    | Recommendation                             | Priority |
| ------------------------------------------------------ | ------- | ------------------------------------------ | -------- |
| `creative_briefs.deliverables`                         | JSONB[] | → `brief_deliverables` table               | Medium   |
| `automation_rules.conditions`                          | JSONB   | OK for flexible rule trees                 | Keep     |
| `saved_views.filters`                                  | JSONB   | OK for dynamic filter config               | Keep     |
| `dashboards.layout`                                    | JSONB   | OK for flexible grid layout                | Keep     |
| `catalog_items.specifications`                         | JSONB   | → `catalog_item_specs` if >5 standard keys | Low      |
| `onboarding_step_templates.applies_to_classifications` | JSONB[] | → junction table                           | Low      |
| `notification_preferences.channels`                    | JSONB   | OK for flexible channel config             | Keep     |

---

## 10. Recommended Migration Plan

### Phase 1: Critical Fixes (Week 1-2)

**Migration 067: Identity Consolidation**

```
1. Add user_profiles.id FK to worker_profiles
2. Create v_profiles view for backward compat
3. Repoint all profiles FKs to user_profiles
4. Soft-deprecate profiles table
```

**Migration 068: RLS Gap Closure**

```
1. Add RLS policies to goods_receipt_lines, exchange_rates,
   incident_insurance_links, tier_usage_counters,
   user_certifications, advance_status_history
2. Audit all 061 tables for complete policy coverage
```

### Phase 2: Deduplication (Week 3-4)

**Migration 069: Table Consolidation**

```
1. Migrate knowledge_base_articles → knowledge_articles
2. Migrate custom_fields + custom_field_values → custom_field_definitions
3. Migrate compliance_requirements → compliance_templates
4. Migrate vendor_compliance_docs → worker_compliance_docs
5. Migrate vendor_reviews → worker_reviews
6. Migrate automation_logs → automation_executions
7. Soft-deprecate old tables with COMMENT markers
```

**Migration 070: Cleanup Duplicate Definitions**

```
1. Remove duplicate CREATE TABLE IF NOT EXISTS from 061
   (revenue_recognition_entries, time_tracking_policies, etc.)
2. Add canonical source comments
```

### Phase 3: Normalization (Week 5-6)

**Migration 071: JSONB Normalization**

```
1. Create brief_deliverables junction table
2. Migrate creative_briefs.deliverables JSONB data
3. Add department lookup table (replace department enum)
```

**Migration 072: Missing Indexes**

```
1. Add composite indexes for high-traffic query patterns
2. Add partial indexes for status-filtered queries
3. Add GIN indexes for JSONB search columns
```

### Phase 4: Enum Hygiene (Week 7-8)

**Migration 073: Enum Updates**

```
1. Merge call_sheet_status + tech_sheet_status
2. Extend sow_status with on_hold, expired
3. Extend booking_status with completed, no_show
4. Create departments table, migrate department enum usage
```

### Phase 5: Validation (Ongoing)

```
1. Run full RLS audit script against all tables
2. Verify all FK chains are intact after consolidation
3. Run query EXPLAIN plans on high-traffic paths
4. Validate no orphaned rows after data migrations
```

---

## Appendix A: Migration File Index

| #   | File                                        | Domain        | Tables Created                                                                                                                                                                                                                                                                                                                                                                                             |
| --- | ------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 001 | `initial_schema.sql`                        | Core          | profiles, organizations, projects, tasks, events, activations, crew_members, shifts, deals, assets, vendors, approvals, notifications, calendar_events, locations, case_studies, expenses, purchase_orders, invoices, contracts                                                                                                                                                                            |
| 002 | `extended_schema.sql`                       | Core          | (ALTER TABLE extensions)                                                                                                                                                                                                                                                                                                                                                                                   |
| 003 | `production_lifecycle.sql`                  | Production    | consumables, shipments, warehouses, budgets, production_budget_lines, production_expenses, production_time_entries, payroll_batches, incidents, knowledge_base_articles, production_sops, production_checklists                                                                                                                                                                                            |
| 004 | `crm_public.sql`                            | CRM           | leads, lead_activities, testimonials, reviews                                                                                                                                                                                                                                                                                                                                                              |
| 005 | `productive_features.sql`                   | Productive    | companies, contacts, pipelines, lost_reasons, custom_fields, custom_field_values, saved_views, automations, automation_rules, automation_logs, rate_cards, rate_card_items, resource_bookings, time_off_requests, active_timers, proposals, proposal_items, invoice_templates, recurring_invoices, payments, credit_notes, dashboards, dashboard_widgets, documents, document_versions, document_templates |
| 006 | `workflow_documents.sql`                    | Workflow      | call_sheets, call_sheet_crew, tech_sheets, approval_workflows, approval_steps, workflow_instances, workflow_step_approvals, e_signatures, notification_preferences                                                                                                                                                                                                                                         |
| 007 | `sow_lifecycle.sql`                         | Financial     | scopes_of_work, sow_deliverables, client_invoices, invoice_line_items, invoice_time_entries, sow_change_log, deliverable_progress_snapshots                                                                                                                                                                                                                                                                |
| 008 | `vendor_contractor_lifecycle.sql`           | Vendor        | compliance_requirements, vendor_compliance_docs, work_orders, work_order_bids, dispatch_entries, vendor_reviews, checklist_templates, job_checklists, estimates, job_cost_entries, vendor_portal_tokens, vendor_communications                                                                                                                                                                             |
| 009 | `scenario_builder.sql`                      | Planning      | scenarios, scenario_variables, scenario_outcomes, scenario_resource_plans                                                                                                                                                                                                                                                                                                                                  |
| 010 | `service_requests.sql`                      | Support       | service_requests                                                                                                                                                                                                                                                                                                                                                                                           |
| 011 | `unified_workforce.sql`                     | Workforce     | worker_profiles, worker_classifications, engagement_terms, compliance_templates, worker_compliance_docs, onboarding_step_templates, worker_onboarding_runs, onboarding_step_progress, offboarding_step_templates, worker_offboarding_runs, offboarding_step_progress, worker_reviews, classification_assessments                                                                                           |
| 012 | `production_consolidation.sql`              | Assets        | activation_assets, event_assets, activity_assets, activity_consumables                                                                                                                                                                                                                                                                                                                                     |
| 013 | `crm_revenue_pipeline.sql`                  | CRM           | opportunities, opportunity_activities, change_orders, change_order_log, revenue_schedules, account_health_scores                                                                                                                                                                                                                                                                                           |
| 014 | `digital_asset_lifecycle.sql`               | DAM           | storage_objects, digital_assets, asset_versions, asset_links, asset_tags, asset_tag_assignments, asset_access_controls, asset_access_log, asset_retention_policies, legal_holds, asset_dependencies                                                                                                                                                                                                        |
| 015 | `creative_brand_campaign.sql`               | Creative      | brief_templates, brand_guidelines, brand_guideline_sections, brand_guideline_versions, creative_briefs, campaigns, campaign_channels, campaign_assets, campaign_kpis, campaign_metrics, creative_reviews, asset_channel_deployments                                                                                                                                                                        |
| 016 | `legal_compliance_finance_procurement.sql`  | Compliance    | gl_accounts, insurance_requirements, insurance_policies, contract_amendments, contract_clauses, contract_obligations, ip_rights, permits, engineering_approvals, compliance_checklists, asset_certifications, budget_approvals, payment_approvals, purchase_requisitions, goods_receipts, vendor_risk_scores, entity_dependencies, governance_audit_log                                                    |
| 017 | `location_spatial_hierarchy.sql`            | Location      | project_locations, space_bookings, event_space_overlays, location_compliance_docs, location_inspections, location_costs, location_contacts                                                                                                                                                                                                                                                                 |
| 018 | `user_lifecycle_identity.sql`               | Identity      | user_profiles, org_memberships, invitations, onboarding_step_definitions, user_onboarding_progress, user_preferences, login_audit_log, user_sessions, api_tokens, temporary_access_grants, role_change_log, user_compliance_acks                                                                                                                                                                           |
| 019 | `asset_inventory_logistics_warehousing.sql` | Logistics     | warehouse_zones, warehouse_locations, inventory_reservations, shipment_items, kits, kit_items, scan_events, load_plans, load_plan_items, logistics_events, asset_damage_reports, maintenance_schedules, depreciation_schedules, inventory_audits, audit_count_items                                                                                                                                        |
| 020 | `live_event_operations.sql`                 | Live Ops      | live_event_instances, command_positions, readiness_gates, department_statuses, ros_cues, comm_channels, comm_log_entries, live_crew_assignments, equipment_check_ins, environmental_readings, live_financial_snapshots, foh_zones, foh_zone_readings, vip_guests, vip_service_requests, guest_incidents, strike_sequences                                                                                  |
| 021 | `integrated_production_lifecycle.sql`       | Production    | production_verticals, boms, bom_lines, work_packages, work_package_dependencies, production_runs, production_run_inputs, qc_gates, technical_specs, rights_licenses, rental_agreements, rental_agreement_lines, vendor_vertical_capabilities                                                                                                                                                               |
| 022 | `audit_remediation.sql`                     | Audit         | goods_receipt_lines, exchange_rates, financial_periods, incident_insurance_links, sla_definitions, sla_tracking, resilience_targets, idempotency_keys, domain_events, data_export_requests, anonymization_queue                                                                                                                                                                                            |
| 026 | `settings_framework.sql`                    | Settings      | setting_definitions, settings, settings_change_log                                                                                                                                                                                                                                                                                                                                                         |
| 027 | `feature_flags.sql`                         | Feature Flags | feature_flags, feature_flag_overrides                                                                                                                                                                                                                                                                                                                                                                      |
| 028 | `rbac_custom_roles.sql`                     | RBAC          | role_definitions, permission_grants, access_audit_log                                                                                                                                                                                                                                                                                                                                                      |
| 031 | `field_level_rbac_pricing.sql`              | Pricing       | field_tier_assignments, field_role_access, org_subscriptions, field_bundles, field_bundle_items, org_bundle_subscriptions, field_access_overrides, field_usage_events, field_usage_daily, upsell_triggers, upsell_events                                                                                                                                                                                   |
| 033 | `competitive_feature_gaps.sql`              | Features      | budget_alerts, record_comments, record_activity_log, quality_check_templates, quality_checks, review_cycles, review_feedback_requests, goals, knowledge_articles, knowledge_article_links                                                                                                                                                                                                                  |
| 034 | `v2_feature_gaps.sql`                       | Features      | revenue_recognition_entries, time_tracking_policies, automation_executions, ai_report_queries, project_templates, email_messages, notification_preferences (v2), portal_sessions, survey_templates, survey_responses, sla_policies, custom_field_definitions                                                                                                                                               |
| 035 | `settings_approval_workflow.sql`            | Settings      | settings_change_requests                                                                                                                                                                                                                                                                                                                                                                                   |
| 039 | `usernames_handles.sql`                     | Identity      | reserved_usernames, username_change_log, released_usernames                                                                                                                                                                                                                                                                                                                                                |
| 046 | `messaging_foundation.sql`                  | Messaging     | conversations, conversation_members, messages, message_reactions, message_read_receipts, mandatory_read_acknowledgments, channel_templates                                                                                                                                                                                                                                                                 |
| 047 | `master_catalog.sql`                        | Catalog       | catalog_categories, catalog_items, catalog_item_modifiers, catalog_modifier_options, catalog_org_overrides                                                                                                                                                                                                                                                                                                 |
| 048 | `production_advances_core.sql`              | Advancing     | advance_templates, production_advances, production_advance_items, advance_status_history                                                                                                                                                                                                                                                                                                                   |
| 050 | `messaging_production.sql`                  | Messaging     | channel_templates (ext), messaging_escalation_rules                                                                                                                                                                                                                                                                                                                                                        |
| 051 | `credentialing_ticketing.sql`               | Credentialing | credential_types, credential_inventory_pools, credential_assignments, credential_scan_log                                                                                                                                                                                                                                                                                                                  |
| 054 | `bulk_export_infrastructure.sql`            | Import/Export | bulk_import_jobs, export_templates                                                                                                                                                                                                                                                                                                                                                                         |
| 055 | `external_sync_infrastructure.sql`          | Sync          | provider_connections, provider_ticket_map, pos_transactions, pos_transaction_items, webhook_events, sync_events, sync_conflict_policies                                                                                                                                                                                                                                                                    |
| 056 | `teams.sql`                                 | Identity      | teams, team_members                                                                                                                                                                                                                                                                                                                                                                                        |
| 058 | `service_health_checks.sql`                 | Health        | service_health_checks                                                                                                                                                                                                                                                                                                                                                                                      |
| 059 | `four_tier_pricing.sql`                     | Pricing       | tier_usage_counters                                                                                                                                                                                                                                                                                                                                                                                        |
| 060 | `expense_reports_and_timesheets.sql`        | Financial     | expense_reports, timesheets                                                                                                                                                                                                                                                                                                                                                                                |
| 061 | `rls_remediation_missing_tables.sql`        | Remediation   | (duplicates of 034 tables + RLS policies)                                                                                                                                                                                                                                                                                                                                                                  |
| 064 | `extended_user_profile.sql`                 | Identity      | user_certifications                                                                                                                                                                                                                                                                                                                                                                                        |

---

## Appendix B: Total Counts

| Metric           | Count                           |
| ---------------- | ------------------------------- |
| **Tables**       | ~260                            |
| **Enums**        | ~80                             |
| **Triggers**     | ~250+ (mostly `set_updated_at`) |
| **Functions**    | ~30                             |
| **RLS Policies** | ~300+                           |
| **Indexes**      | ~400+                           |
| **Views**        | ~10                             |
| **Migrations**   | 66                              |
| **Workstreams**  | 13                              |

---

## Appendix C: Cross-Reference Matrix (FK Dependencies)

The most connected tables (highest FK in-degree):

| Table                        | Inbound FK Count | Key Dependents                                      |
| ---------------------------- | ---------------- | --------------------------------------------------- |
| `organizations`              | ~50+             | Nearly every domain table                           |
| `projects`                   | ~30+             | tasks, budgets, work_packages, SOWs, change_orders  |
| `profiles` / `user_profiles` | ~25+             | assignments, reviews, comments, sessions            |
| `events`                     | ~15+             | live_event_instances, credentials, advances         |
| `vendors`                    | ~15+             | work_orders, reviews, compliance, risk_scores       |
| `assets`                     | ~10+             | certifications, damage_reports, equipment_check_ins |
| `companies`                  | ~10+             | contacts, opportunities, health_scores              |

---

_This document should be reviewed by the engineering team before executing any migration. All deprecations should follow the 3-step migration strategy outlined in Section 4._
