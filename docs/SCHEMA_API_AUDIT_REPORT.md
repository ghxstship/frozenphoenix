# Schema-to-API Column Audit Report

> Generated: 2026-03-03T04:00:33.419Z

## Summary

| Metric                        | Count   |
| ----------------------------- | ------- |
| Total DB Tables (incl. views) | 338     |
| Total Tables (non-view)       | 311     |
| Total Columns                 | 5334    |
| Total Supabase Query Usages   | 484     |
| Unique Tables Queried         | 191     |
| **Errors**                    | **397** |
| Warnings                      | 0       |
| Info                          | 0       |

## Schema Tables Never Queried in App Code

These tables exist in migrations but no `.from()` call references them.
This may be expected (e.g., junction tables managed by triggers) or may indicate dead schema.

| Table                          | Migration                                     | Columns |
| ------------------------------ | --------------------------------------------- | ------- |
| `account_health_scores`        | 013_crm_revenue_pipeline.sql                  | 20      |
| `activation_assets`            | 012_production_consolidation.sql              | 12      |
| `activity_assets`              | 012_production_consolidation.sql              | 9       |
| `activity_consumables`         | 012_production_consolidation.sql              | 9       |
| `anonymization_queue`          | 022_audit_remediation.sql                     | 8       |
| `api_tokens`                   | 018_user_lifecycle_identity.sql               | 17      |
| `asset_access_controls`        | 014_digital_asset_lifecycle.sql               | 15      |
| `asset_access_log`             | 014_digital_asset_lifecycle.sql               | 10      |
| `asset_certifications`         | 016_legal_compliance_finance_procurement.sql  | 18      |
| `asset_channel_deployments`    | 015_creative_brand_campaign.sql               | 10      |
| `asset_damage_reports`         | 019_asset_inventory_logistics_warehousing.sql | 22      |
| `asset_dependencies`           | 014_digital_asset_lifecycle.sql               | 11      |
| `asset_links`                  | 014_digital_asset_lifecycle.sql               | 15      |
| `asset_reconciliation_items`   | 020_live_event_operations.sql                 | 26      |
| `asset_retention_policies`     | 014_digital_asset_lifecycle.sql               | 17      |
| `asset_tag_assignments`        | 014_digital_asset_lifecycle.sql               | 2       |
| `asset_tags`                   | 014_digital_asset_lifecycle.sql               | 7       |
| `asset_versions`               | 014_digital_asset_lifecycle.sql               | 15      |
| `audit_count_items`            | 019_asset_inventory_logistics_warehousing.sql | 14      |
| `bom_lines`                    | 021_integrated_production_lifecycle.sql       | 18      |
| `boms`                         | 021_integrated_production_lifecycle.sql       | 21      |
| `brand_guideline_sections`     | 015_creative_brand_campaign.sql               | 11      |
| `brand_guideline_versions`     | 015_creative_brand_campaign.sql               | 7       |
| `brief_templates`              | 015_creative_brand_campaign.sql               | 13      |
| `campaign_channels`            | 015_creative_brand_campaign.sql               | 12      |
| `campaign_kpis`                | 015_creative_brand_campaign.sql               | 13      |
| `campaign_metrics`             | 015_creative_brand_campaign.sql               | 9       |
| `case_study_metrics`           | 001_initial_schema.sql                        | 5       |
| `change_order_log`             | 013_crm_revenue_pipeline.sql                  | 11      |
| `checklist_templates`          | 008_vendor_contractor_lifecycle.sql           | 12      |
| `classification_assessments`   | 011_unified_workforce.sql                     | 18      |
| `comm_channels`                | 020_live_event_operations.sql                 | 13      |
| `comm_log_entries`             | 020_live_event_operations.sql                 | 14      |
| `command_positions`            | 020_live_event_operations.sql                 | 15      |
| `compliance_requirements`      | 008_vendor_contractor_lifecycle.sql           | 16      |
| `compliance_templates`         | 011_unified_workforce.sql                     | 17      |
| `contract_amendments`          | 016_legal_compliance_finance_procurement.sql  | 25      |
| `contract_clauses`             | 016_legal_compliance_finance_procurement.sql  | 17      |
| `creative_briefs`              | 015_creative_brand_campaign.sql               | 42      |
| `creative_reviews`             | 015_creative_brand_campaign.sql               | 12      |
| `data_export_requests`         | 022_audit_remediation.sql                     | 11      |
| `data_retention_policies`      | 018_user_lifecycle_identity.sql               | 12      |
| `deck_slides`                  | 001_initial_schema.sql                        | 8       |
| `department_statuses`          | 020_live_event_operations.sql                 | 15      |
| `depreciation_schedules`       | 019_asset_inventory_logistics_warehousing.sql | 17      |
| `dispatch_entries`             | 008_vendor_contractor_lifecycle.sql           | 17      |
| `domain_events`                | 022_audit_remediation.sql                     | 12      |
| `engagement_terms`             | 011_unified_workforce.sql                     | 23      |
| `entity_dependencies`          | 016_legal_compliance_finance_procurement.sql  | 18      |
| `environmental_readings`       | 020_live_event_operations.sql                 | 20      |
| `equipment_check_ins`          | 020_live_event_operations.sql                 | 21      |
| `event_assets`                 | 012_production_consolidation.sql              | 12      |
| `event_space_overlays`         | 017_location_spatial_hierarchy.sql            | 16      |
| `exchange_rates`               | 022_audit_remediation.sql                     | 8       |
| `field_bundle_items`           | 031_field_level_rbac_pricing.sql              | 4       |
| `financial_periods`            | 022_audit_remediation.sql                     | 11      |
| `foh_zone_readings`            | 020_live_event_operations.sql                 | 16      |
| `foh_zones`                    | 020_live_event_operations.sql                 | 12      |
| `goods_receipt_lines`          | 022_audit_remediation.sql                     | 14      |
| `governance_audit_log`         | 016_legal_compliance_finance_procurement.sql  | 15      |
| `guest_incidents`              | 020_live_event_operations.sql                 | 21      |
| `idempotency_keys`             | 022_audit_remediation.sql                     | 7       |
| `incident_insurance_links`     | 022_audit_remediation.sql                     | 11      |
| `insurance_requirements`       | 016_legal_compliance_finance_procurement.sql  | 16      |
| `inventory_audits`             | 019_asset_inventory_logistics_warehousing.sql | 19      |
| `inventory_reservations`       | 019_asset_inventory_logistics_warehousing.sql | 16      |
| `job_checklists`               | 008_vendor_contractor_lifecycle.sql           | 18      |
| `kit_items`                    | 019_asset_inventory_logistics_warehousing.sql | 10      |
| `kits`                         | 019_asset_inventory_logistics_warehousing.sql | 15      |
| `legal_holds`                  | 014_digital_asset_lifecycle.sql               | 15      |
| `live_crew_assignments`        | 020_live_event_operations.sql                 | 22      |
| `live_event_instances`         | 020_live_event_operations.sql                 | 32      |
| `live_financial_snapshots`     | 020_live_event_operations.sql                 | 23      |
| `load_plan_items`              | 019_asset_inventory_logistics_warehousing.sql | 6       |
| `load_plans`                   | 019_asset_inventory_logistics_warehousing.sql | 17      |
| `location_compliance_docs`     | 017_location_spatial_hierarchy.sql            | 14      |
| `location_contacts`            | 017_location_spatial_hierarchy.sql            | 8       |
| `location_costs`               | 017_location_spatial_hierarchy.sql            | 17      |
| `location_inspections`         | 017_location_spatial_hierarchy.sql            | 17      |
| `logistics_events`             | 019_asset_inventory_logistics_warehousing.sql | 11      |
| `maintenance_schedules`        | 019_asset_inventory_logistics_warehousing.sql | 18      |
| `offboarding_step_progress`    | 011_unified_workforce.sql                     | 11      |
| `offboarding_step_templates`   | 011_unified_workforce.sql                     | 12      |
| `onboarding_step_progress`     | 011_unified_workforce.sql                     | 12      |
| `onboarding_step_templates`    | 011_unified_workforce.sql                     | 14      |
| `opportunity_activities`       | 013_crm_revenue_pipeline.sql                  | 13      |
| `payment_approvals`            | 016_legal_compliance_finance_procurement.sql  | 23      |
| `portal_sessions`              | 034_v2_feature_gaps.sql                       | 7       |
| `post_event_reports`           | 020_live_event_operations.sql                 | 32      |
| `production_budget_lines`      | 003_production_lifecycle.sql                  | 20      |
| `production_run_inputs`        | 021_integrated_production_lifecycle.sql       | 13      |
| `production_runs`              | 021_integrated_production_lifecycle.sql       | 22      |
| `production_verticals`         | 021_integrated_production_lifecycle.sql       | 13      |
| `project_locations`            | 017_location_spatial_hierarchy.sql            | 14      |
| `project_members`              | 001_initial_schema.sql                        | 5       |
| `purchase_order_items`         | 001_initial_schema.sql                        | 7       |
| `qc_gates`                     | 021_integrated_production_lifecycle.sql       | 21      |
| `readiness_gates`              | 020_live_event_operations.sql                 | 18      |
| `rental_agreement_lines`       | 021_integrated_production_lifecycle.sql       | 15      |
| `rental_agreements`            | 021_integrated_production_lifecycle.sql       | 25      |
| `resilience_targets`           | 022_audit_remediation.sql                     | 11      |
| `rights_licenses`              | 021_integrated_production_lifecycle.sql       | 25      |
| `role_change_log`              | 018_user_lifecycle_identity.sql               | 11      |
| `ros_cues`                     | 020_live_event_operations.sql                 | 25      |
| `scan_events`                  | 019_asset_inventory_logistics_warehousing.sql | 15      |
| `scenario_outcomes`            | 009_scenario_builder.sql                      | 12      |
| `scenario_resource_plans`      | 009_scenario_builder.sql                      | 12      |
| `scenario_variables`           | 009_scenario_builder.sql                      | 12      |
| `scenarios`                    | 009_scenario_builder.sql                      | 14      |
| `shipment_items`               | 019_asset_inventory_logistics_warehousing.sql | 19      |
| `sla_definitions`              | 022_audit_remediation.sql                     | 10      |
| `sla_tracking`                 | 022_audit_remediation.sql                     | 11      |
| `sop_acknowledgments`          | 001_initial_schema.sql                        | 4       |
| `space_bookings`               | 017_location_spatial_hierarchy.sql            | 19      |
| `storage_objects`              | 014_digital_asset_lifecycle.sql               | 18      |
| `strike_sequences`             | 020_live_event_operations.sql                 | 22      |
| `task_dependencies`            | 001_initial_schema.sql                        | 4       |
| `technical_specs`              | 021_integrated_production_lifecycle.sql       | 14      |
| `temporary_access_grants`      | 018_user_lifecycle_identity.sql               | 16      |
| `upsell_events`                | 031_field_level_rbac_pricing.sql              | 8       |
| `upsell_triggers`              | 031_field_level_rbac_pricing.sql              | 11      |
| `user_compliance_acks`         | 018_user_lifecycle_identity.sql               | 10      |
| `user_preferences`             | 018_user_lifecycle_identity.sql               | 6       |
| `vendor_communications`        | 008_vendor_contractor_lifecycle.sql           | 14      |
| `vendor_compliance_docs`       | 008_vendor_contractor_lifecycle.sql           | 22      |
| `vendor_portal_tokens`         | 008_vendor_contractor_lifecycle.sql           | 10      |
| `vendor_risk_scores`           | 016_legal_compliance_finance_procurement.sql  | 19      |
| `vendor_vertical_capabilities` | 021_integrated_production_lifecycle.sql       | 6       |
| `vip_guests`                   | 020_live_event_operations.sql                 | 20      |
| `vip_service_requests`         | 020_live_event_operations.sql                 | 15      |
| `warehouse_locations`          | 019_asset_inventory_logistics_warehousing.sql | 16      |
| `warehouse_zones`              | 019_asset_inventory_logistics_warehousing.sql | 17      |
| `work_order_bids`              | 008_vendor_contractor_lifecycle.sql           | 15      |
| `work_package_dependencies`    | 021_integrated_production_lifecycle.sql       | 8       |
| `work_packages`                | 021_integrated_production_lifecycle.sql       | 34      |
| `worker_classifications`       | 011_unified_workforce.sql                     | 39      |
| `worker_compliance_docs`       | 011_unified_workforce.sql                     | 22      |
| `worker_offboarding_runs`      | 011_unified_workforce.sql                     | 18      |
| `worker_onboarding_runs`       | 011_unified_workforce.sql                     | 14      |
| `worker_reviews`               | 011_unified_workforce.sql                     | 28      |

## ERRORS: Tables Queried but Not in Schema

These `.from()` calls reference tables that do not exist in any migration file.

| Table                         | File                              | Line |
| ----------------------------- | --------------------------------- | ---- |
| `briefs`                      | `src/lib/supabase/hooks-pages.ts` | 99   |
| `briefs`                      | `src/lib/supabase/hooks-pages.ts` | 114  |
| `expense_reports`             | `src/lib/supabase/hooks-pages.ts` | 637  |
| `timesheets`                  | `src/lib/supabase/hooks-pages.ts` | 654  |
| `workflows`                   | `src/lib/supabase/hooks-pages.ts` | 671  |
| `risk_assessments`            | `src/lib/supabase/hooks-pages.ts` | 722  |
| `checklists`                  | `src/lib/supabase/hooks-pages.ts` | 874  |
| `vendor_compliance_documents` | `src/lib/supabase/hooks-pages.ts` | 926  |
| `clause_library`              | `src/lib/supabase/hooks-pages.ts` | 1245 |

## ERRORS: Column Mismatches

Columns referenced in queries that do not exist in the target table's schema.

| Severity | Category              | Table                         | Column                        | File                                                        | Line | Message                                                                                              |
| -------- | --------------------- | ----------------------------- | ----------------------------- | ----------------------------------------------------------- | ---- | ---------------------------------------------------------------------------------------------------- |
| ERROR    | MISSING_FILTER_COLUMN | `org_memberships`             | `role_key`                    | `src/app/api/fields/access/route.ts`                        | 45   | Filter column "role_key" used on "org_memberships" but not found in schema                           |
| ERROR    | MISSING_FILTER_COLUMN | `org_memberships`             | `role_key`                    | `src/app/api/fields/access/route.ts`                        | 45   | Filter column "role_key" used on "org_memberships" but not found in schema                           |
| ERROR    | MISSING_FILTER_COLUMN | `org_memberships`             | `is_active`                   | `src/app/api/fields/access/route.ts`                        | 45   | Filter column "is_active" used on "org_memberships" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `org_subscriptions`           | `role_key`                    | `src/app/api/fields/access/route.ts`                        | 60   | Filter column "role_key" used on "org_subscriptions" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `org_subscriptions`           | `role_key`                    | `src/app/api/fields/access/route.ts`                        | 60   | Filter column "role_key" used on "org_subscriptions" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `org_subscriptions`           | `is_active`                   | `src/app/api/fields/access/route.ts`                        | 60   | Filter column "is_active" used on "org_subscriptions" but not found in schema                        |
| ERROR    | MISSING_FILTER_COLUMN | `field_tier_assignments`      | `role_key`                    | `src/app/api/fields/access/route.ts`                        | 71   | Filter column "role_key" used on "field_tier_assignments" but not found in schema                    |
| ERROR    | MISSING_FILTER_COLUMN | `field_tier_assignments`      | `organization_id`             | `src/app/api/fields/access/route.ts`                        | 71   | Filter column "organization_id" used on "field_tier_assignments" but not found in schema             |
| ERROR    | MISSING_FILTER_COLUMN | `field_tier_assignments`      | `role_key`                    | `src/app/api/fields/access/route.ts`                        | 71   | Filter column "role_key" used on "field_tier_assignments" but not found in schema                    |
| ERROR    | MISSING_FILTER_COLUMN | `field_tier_assignments`      | `is_active`                   | `src/app/api/fields/access/route.ts`                        | 71   | Filter column "is_active" used on "field_tier_assignments" but not found in schema                   |
| ERROR    | MISSING_FILTER_COLUMN | `field_role_access`           | `organization_id`             | `src/app/api/fields/access/route.ts`                        | 80   | Filter column "organization_id" used on "field_role_access" but not found in schema                  |
| ERROR    | MISSING_FILTER_COLUMN | `field_role_access`           | `is_active`                   | `src/app/api/fields/access/route.ts`                        | 80   | Filter column "is_active" used on "field_role_access" but not found in schema                        |
| ERROR    | MISSING_FILTER_COLUMN | `org_memberships`             | `is_active`                   | `src/app/api/fields/bundles/route.ts`                       | 24   | Filter column "is_active" used on "org_memberships" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `field_bundles`               | `organization_id`             | `src/app/api/fields/bundles/route.ts`                       | 38   | Filter column "organization_id" used on "field_bundles" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `field_bundles`               | `status`                      | `src/app/api/fields/bundles/route.ts`                       | 38   | Filter column "status" used on "field_bundles" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `field_bundles`               | `organization_id`             | `src/app/api/fields/bundles/route.ts`                       | 38   | Filter column "organization_id" used on "field_bundles" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `field_bundles`               | `status`                      | `src/app/api/fields/bundles/route.ts`                       | 38   | Filter column "status" used on "field_bundles" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `org_memberships`             | `event_date`                  | `src/app/api/fields/usage/route.ts`                         | 95   | Filter column "event_date" used on "org_memberships" but not found in schema                         |
| ERROR    | MISSING_SELECT_COLUMN | `field_usage_daily`           | `unique_users`                | `src/app/api/fields/usage/route.ts`                         | 111  | Column "unique_users" selected from "field_usage_daily" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `org_memberships`             | `token`                       | `src/app/api/invitations/[token]/accept/route.ts`           | 50   | Filter column "token" used on "org_memberships" but not found in schema                              |
| ERROR    | MISSING_FILTER_COLUMN | `profiles`                    | `token`                       | `src/app/api/invitations/[token]/accept/route.ts`           | 77   | Filter column "token" used on "profiles" but not found in schema                                     |
| ERROR    | MISSING_SELECT_COLUMN | `profiles`                    | `status`                      | `src/app/api/invitations/[token]/accept/route.ts`           | 84   | Column "status" selected from "profiles" but not found in schema                                     |
| ERROR    | MISSING_SELECT_COLUMN | `profiles`                    | `expires_at`                  | `src/app/api/invitations/[token]/accept/route.ts`           | 84   | Column "expires_at" selected from "profiles" but not found in schema                                 |
| ERROR    | MISSING_SELECT_COLUMN | `profiles`                    | `personal_message`            | `src/app/api/invitations/[token]/accept/route.ts`           | 84   | Column "personal_message" selected from "profiles" but not found in schema                           |
| ERROR    | MISSING_FILTER_COLUMN | `profiles`                    | `token`                       | `src/app/api/invitations/[token]/accept/route.ts`           | 84   | Filter column "token" used on "profiles" but not found in schema                                     |
| ERROR    | MISSING_FILTER_COLUMN | `org_memberships`             | `is_active`                   | `src/app/api/middleware/permissions.ts`                     | 81   | Filter column "is_active" used on "org_memberships" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `profiles`                    | `user_id`                     | `src/app/api/onboarding/progress/route.ts`                  | 22   | Filter column "user_id" used on "profiles" but not found in schema                                   |
| ERROR    | MISSING_FILTER_COLUMN | `onboarding_step_definitions` | `user_id`                     | `src/app/api/onboarding/progress/route.ts`                  | 33   | Filter column "user_id" used on "onboarding_step_definitions" but not found in schema                |
| ERROR    | MISSING_WRITE_COLUMN  | `onboarding_step_definitions` | `user_id`                     | `src/app/api/onboarding/progress/route.ts`                  | 33   | Write column "user_id" used on "onboarding_step_definitions" but not found in schema                 |
| ERROR    | MISSING_WRITE_COLUMN  | `onboarding_step_definitions` | `step_definition_id`          | `src/app/api/onboarding/progress/route.ts`                  | 33   | Write column "step_definition_id" used on "onboarding_step_definitions" but not found in schema      |
| ERROR    | MISSING_WRITE_COLUMN  | `onboarding_step_definitions` | `status`                      | `src/app/api/onboarding/progress/route.ts`                  | 33   | Write column "status" used on "onboarding_step_definitions" but not found in schema                  |
| ERROR    | MISSING_WRITE_COLUMN  | `onboarding_step_definitions` | `completed_at`                | `src/app/api/onboarding/progress/route.ts`                  | 33   | Write column "completed_at" used on "onboarding_step_definitions" but not found in schema            |
| ERROR    | MISSING_SELECT_COLUMN | `organizations`               | `require_mfa`                 | `src/app/api/organizations/[id]/security/route.ts`          | 33   | Column "require_mfa" selected from "organizations" but not found in schema                           |
| ERROR    | MISSING_SELECT_COLUMN | `organizations`               | `enforce_sso`                 | `src/app/api/organizations/[id]/security/route.ts`          | 33   | Column "enforce_sso" selected from "organizations" but not found in schema                           |
| ERROR    | MISSING_SELECT_COLUMN | `organizations`               | `sso_domain`                  | `src/app/api/organizations/[id]/security/route.ts`          | 33   | Column "sso_domain" selected from "organizations" but not found in schema                            |
| ERROR    | MISSING_SELECT_COLUMN | `organizations`               | `allowed_email_domains`       | `src/app/api/organizations/[id]/security/route.ts`          | 33   | Column "allowed_email_domains" selected from "organizations" but not found in schema                 |
| ERROR    | MISSING_SELECT_COLUMN | `organizations`               | `session_timeout_hours`       | `src/app/api/organizations/[id]/security/route.ts`          | 33   | Column "session_timeout_hours" selected from "organizations" but not found in schema                 |
| ERROR    | MISSING_SELECT_COLUMN | `organizations`               | `max_sessions_per_user`       | `src/app/api/organizations/[id]/security/route.ts`          | 33   | Column "max_sessions_per_user" selected from "organizations" but not found in schema                 |
| ERROR    | MISSING_SELECT_COLUMN | `organizations`               | `invitation_expiry_days`      | `src/app/api/organizations/[id]/security/route.ts`          | 33   | Column "invitation_expiry_days" selected from "organizations" but not found in schema                |
| ERROR    | MISSING_SELECT_COLUMN | `organizations`               | `default_role`                | `src/app/api/organizations/[id]/security/route.ts`          | 33   | Column "default_role" selected from "organizations" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `organizations`               | `user_id`                     | `src/app/api/organizations/[id]/security/route.ts`          | 33   | Filter column "user_id" used on "organizations" but not found in schema                              |
| ERROR    | MISSING_FILTER_COLUMN | `organizations`               | `organization_id`             | `src/app/api/organizations/[id]/security/route.ts`          | 33   | Filter column "organization_id" used on "organizations" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `organizations`               | `status`                      | `src/app/api/organizations/[id]/security/route.ts`          | 33   | Filter column "status" used on "organizations" but not found in schema                               |
| ERROR    | MISSING_SELECT_COLUMN | `organizations`               | `require_mfa`                 | `src/app/api/organizations/[id]/security/route.ts`          | 99   | Column "require_mfa" selected from "organizations" but not found in schema                           |
| ERROR    | MISSING_SELECT_COLUMN | `organizations`               | `enforce_sso`                 | `src/app/api/organizations/[id]/security/route.ts`          | 99   | Column "enforce_sso" selected from "organizations" but not found in schema                           |
| ERROR    | MISSING_SELECT_COLUMN | `organizations`               | `sso_domain`                  | `src/app/api/organizations/[id]/security/route.ts`          | 99   | Column "sso_domain" selected from "organizations" but not found in schema                            |
| ERROR    | MISSING_SELECT_COLUMN | `organizations`               | `allowed_email_domains`       | `src/app/api/organizations/[id]/security/route.ts`          | 99   | Column "allowed_email_domains" selected from "organizations" but not found in schema                 |
| ERROR    | MISSING_SELECT_COLUMN | `organizations`               | `session_timeout_hours`       | `src/app/api/organizations/[id]/security/route.ts`          | 99   | Column "session_timeout_hours" selected from "organizations" but not found in schema                 |
| ERROR    | MISSING_SELECT_COLUMN | `organizations`               | `max_sessions_per_user`       | `src/app/api/organizations/[id]/security/route.ts`          | 99   | Column "max_sessions_per_user" selected from "organizations" but not found in schema                 |
| ERROR    | MISSING_SELECT_COLUMN | `organizations`               | `invitation_expiry_days`      | `src/app/api/organizations/[id]/security/route.ts`          | 99   | Column "invitation_expiry_days" selected from "organizations" but not found in schema                |
| ERROR    | MISSING_SELECT_COLUMN | `organizations`               | `default_role`                | `src/app/api/organizations/[id]/security/route.ts`          | 99   | Column "default_role" selected from "organizations" but not found in schema                          |
| ERROR    | MISSING_WRITE_COLUMN  | `organizations`               | `user_id`                     | `src/app/api/organizations/[id]/security/route.ts`          | 99   | Write column "user_id" used on "organizations" but not found in schema                               |
| ERROR    | MISSING_WRITE_COLUMN  | `organizations`               | `event_type`                  | `src/app/api/organizations/[id]/security/route.ts`          | 99   | Write column "event_type" used on "organizations" but not found in schema                            |
| ERROR    | MISSING_WRITE_COLUMN  | `organizations`               | `metadata`                    | `src/app/api/organizations/[id]/security/route.ts`          | 99   | Write column "metadata" used on "organizations" but not found in schema                              |
| ERROR    | MISSING_WRITE_COLUMN  | `organizations`               | `organization_id`             | `src/app/api/organizations/[id]/security/route.ts`          | 99   | Write column "organization_id" used on "organizations" but not found in schema                       |
| ERROR    | MISSING_WRITE_COLUMN  | `organizations`               | `changes`                     | `src/app/api/organizations/[id]/security/route.ts`          | 99   | Write column "changes" used on "organizations" but not found in schema                               |
| ERROR    | MISSING_WRITE_COLUMN  | `login_audit_log`             | `organization_id`             | `src/app/api/organizations/[id]/security/route.ts`          | 113  | Write column "organization_id" used on "login_audit_log" but not found in schema                     |
| ERROR    | MISSING_WRITE_COLUMN  | `login_audit_log`             | `changes`                     | `src/app/api/organizations/[id]/security/route.ts`          | 113  | Write column "changes" used on "login_audit_log" but not found in schema                             |
| ERROR    | MISSING_FILTER_COLUMN | `settings_change_requests`    | `user_id`                     | `src/app/api/settings/change-requests/[id]/review/route.ts` | 29   | Filter column "user_id" used on "settings_change_requests" but not found in schema                   |
| ERROR    | MISSING_WRITE_COLUMN  | `org_memberships`             | `reviewed_by`                 | `src/app/api/settings/change-requests/[id]/review/route.ts` | 43   | Write column "reviewed_by" used on "org_memberships" but not found in schema                         |
| ERROR    | MISSING_WRITE_COLUMN  | `org_memberships`             | `review_comment`              | `src/app/api/settings/change-requests/[id]/review/route.ts` | 43   | Write column "review_comment" used on "org_memberships" but not found in schema                      |
| ERROR    | MISSING_WRITE_COLUMN  | `org_memberships`             | `reviewed_at`                 | `src/app/api/settings/change-requests/[id]/review/route.ts` | 43   | Write column "reviewed_at" used on "org_memberships" but not found in schema                         |
| ERROR    | MISSING_WRITE_COLUMN  | `settings_change_log`         | `proposed_value`              | `src/app/api/settings/change-requests/[id]/review/route.ts` | 99   | Write column "proposed_value" used on "settings_change_log" but not found in schema                  |
| ERROR    | MISSING_FILTER_COLUMN | `settings_change_requests`    | `user_id`                     | `src/app/api/settings/change-requests/route.ts`             | 36   | Filter column "user_id" used on "settings_change_requests" but not found in schema                   |
| ERROR    | MISSING_WRITE_COLUMN  | `org_memberships`             | `scope_type`                  | `src/app/api/settings/change-requests/route.ts`             | 76   | Write column "scope_type" used on "org_memberships" but not found in schema                          |
| ERROR    | MISSING_WRITE_COLUMN  | `org_memberships`             | `scope_id`                    | `src/app/api/settings/change-requests/route.ts`             | 76   | Write column "scope_id" used on "org_memberships" but not found in schema                            |
| ERROR    | MISSING_WRITE_COLUMN  | `org_memberships`             | `current_value`               | `src/app/api/settings/change-requests/route.ts`             | 76   | Write column "current_value" used on "org_memberships" but not found in schema                       |
| ERROR    | MISSING_WRITE_COLUMN  | `org_memberships`             | `proposed_value`              | `src/app/api/settings/change-requests/route.ts`             | 76   | Write column "proposed_value" used on "org_memberships" but not found in schema                      |
| ERROR    | MISSING_WRITE_COLUMN  | `org_memberships`             | `reason`                      | `src/app/api/settings/change-requests/route.ts`             | 76   | Write column "reason" used on "org_memberships" but not found in schema                              |
| ERROR    | MISSING_WRITE_COLUMN  | `org_memberships`             | `requested_by`                | `src/app/api/settings/change-requests/route.ts`             | 76   | Write column "requested_by" used on "org_memberships" but not found in schema                        |
| ERROR    | MISSING_FILTER_COLUMN | `org_memberships`             | `is_active`                   | `src/app/api/settings/drift-detection/route.ts`             | 32   | Filter column "is_active" used on "org_memberships" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `setting_definitions`         | `is_active`                   | `src/app/api/settings/drift-detection/route.ts`             | 46   | Filter column "is_active" used on "setting_definitions" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `setting_definitions`         | `organization_id`             | `src/app/api/settings/drift-detection/route.ts`             | 46   | Filter column "organization_id" used on "setting_definitions" but not found in schema                |
| ERROR    | MISSING_FILTER_COLUMN | `settings`                    | `organization_id`             | `src/app/api/settings/drift-detection/route.ts`             | 51   | Filter column "organization_id" used on "settings" but not found in schema                           |
| ERROR    | MISSING_SELECT_COLUMN | `organizations`               | `settings`                    | `src/config/brands/index.ts`                                | 60   | Column "settings" selected from "organizations" but not found in schema                              |
| ERROR    | MISSING_FILTER_COLUMN | `setting_definitions`         | `scope_type`                  | `src/lib/settings/hooks.ts`                                 | 27   | Filter column "scope_type" used on "setting_definitions" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `setting_definitions`         | `scope_id`                    | `src/lib/settings/hooks.ts`                                 | 27   | Filter column "scope_id" used on "setting_definitions" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `setting_definitions`         | `scope_id`                    | `src/lib/settings/hooks.ts`                                 | 27   | Filter column "scope_id" used on "setting_definitions" but not found in schema                       |
| ERROR    | MISSING_WRITE_COLUMN  | `setting_definitions`         | `definition_id`               | `src/lib/settings/hooks.ts`                                 | 27   | Write column "definition_id" used on "setting_definitions" but not found in schema                   |
| ERROR    | MISSING_WRITE_COLUMN  | `setting_definitions`         | `scope_type`                  | `src/lib/settings/hooks.ts`                                 | 27   | Write column "scope_type" used on "setting_definitions" but not found in schema                      |
| ERROR    | MISSING_WRITE_COLUMN  | `setting_definitions`         | `scope_id`                    | `src/lib/settings/hooks.ts`                                 | 27   | Write column "scope_id" used on "setting_definitions" but not found in schema                        |
| ERROR    | MISSING_WRITE_COLUMN  | `setting_definitions`         | `value`                       | `src/lib/settings/hooks.ts`                                 | 27   | Write column "value" used on "setting_definitions" but not found in schema                           |
| ERROR    | MISSING_WRITE_COLUMN  | `setting_definitions`         | `changed_by`                  | `src/lib/settings/hooks.ts`                                 | 27   | Write column "changed_by" used on "setting_definitions" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `settings`                    | `setting_id`                  | `src/lib/settings/hooks.ts`                                 | 106  | Filter column "setting_id" used on "settings" but not found in schema                                |
| ERROR    | MISSING_WRITE_COLUMN  | `settings`                    | `lockedBy`                    | `src/lib/settings/hooks.ts`                                 | 106  | Write column "lockedBy" used on "settings" but not found in schema                                   |
| ERROR    | MISSING_FILTER_COLUMN | `settings_change_log`         | `flag_id`                     | `src/lib/settings/hooks.ts`                                 | 131  | Filter column "flag_id" used on "settings_change_log" but not found in schema                        |
| ERROR    | MISSING_FILTER_COLUMN | `feature_flags`               | `flag_id`                     | `src/lib/settings/hooks.ts`                                 | 152  | Filter column "flag_id" used on "feature_flags" but not found in schema                              |
| ERROR    | MISSING_WRITE_COLUMN  | `feature_flags`               | `flag_id`                     | `src/lib/settings/hooks.ts`                                 | 182  | Write column "flag_id" used on "feature_flags" but not found in schema                               |
| ERROR    | MISSING_WRITE_COLUMN  | `feature_flags`               | `scope_type`                  | `src/lib/settings/hooks.ts`                                 | 182  | Write column "scope_type" used on "feature_flags" but not found in schema                            |
| ERROR    | MISSING_WRITE_COLUMN  | `feature_flags`               | `scope_id`                    | `src/lib/settings/hooks.ts`                                 | 182  | Write column "scope_id" used on "feature_flags" but not found in schema                              |
| ERROR    | MISSING_WRITE_COLUMN  | `feature_flags`               | `value`                       | `src/lib/settings/hooks.ts`                                 | 182  | Write column "value" used on "feature_flags" but not found in schema                                 |
| ERROR    | MISSING_WRITE_COLUMN  | `feature_flags`               | `reason`                      | `src/lib/settings/hooks.ts`                                 | 182  | Write column "reason" used on "feature_flags" but not found in schema                                |
| ERROR    | MISSING_WRITE_COLUMN  | `feature_flags`               | `flag_id`                     | `src/lib/settings/hooks.ts`                                 | 200  | Write column "flag_id" used on "feature_flags" but not found in schema                               |
| ERROR    | MISSING_WRITE_COLUMN  | `feature_flags`               | `scope_type`                  | `src/lib/settings/hooks.ts`                                 | 200  | Write column "scope_type" used on "feature_flags" but not found in schema                            |
| ERROR    | MISSING_WRITE_COLUMN  | `feature_flags`               | `scope_id`                    | `src/lib/settings/hooks.ts`                                 | 200  | Write column "scope_id" used on "feature_flags" but not found in schema                              |
| ERROR    | MISSING_WRITE_COLUMN  | `feature_flags`               | `value`                       | `src/lib/settings/hooks.ts`                                 | 200  | Write column "value" used on "feature_flags" but not found in schema                                 |
| ERROR    | MISSING_WRITE_COLUMN  | `feature_flags`               | `reason`                      | `src/lib/settings/hooks.ts`                                 | 200  | Write column "reason" used on "feature_flags" but not found in schema                                |
| ERROR    | MISSING_FILTER_COLUMN | `feature_flag_overrides`      | `is_active`                   | `src/lib/settings/hooks.ts`                                 | 226  | Filter column "is_active" used on "feature_flag_overrides" but not found in schema                   |
| ERROR    | MISSING_WRITE_COLUMN  | `role_definitions`            | `role_definition_id`          | `src/lib/settings/hooks.ts`                                 | 304  | Write column "role_definition_id" used on "role_definitions" but not found in schema                 |
| ERROR    | MISSING_WRITE_COLUMN  | `role_definitions`            | `resource`                    | `src/lib/settings/hooks.ts`                                 | 304  | Write column "resource" used on "role_definitions" but not found in schema                           |
| ERROR    | MISSING_WRITE_COLUMN  | `role_definitions`            | `action`                      | `src/lib/settings/hooks.ts`                                 | 304  | Write column "action" used on "role_definitions" but not found in schema                             |
| ERROR    | MISSING_WRITE_COLUMN  | `role_definitions`            | `scope_type`                  | `src/lib/settings/hooks.ts`                                 | 304  | Write column "scope_type" used on "role_definitions" but not found in schema                         |
| ERROR    | MISSING_WRITE_COLUMN  | `role_definitions`            | `scope_id`                    | `src/lib/settings/hooks.ts`                                 | 304  | Write column "scope_id" used on "role_definitions" but not found in schema                           |
| ERROR    | MISSING_FILTER_COLUMN | `permission_grants`           | `user_id`                     | `src/lib/settings/hooks.ts`                                 | 355  | Filter column "user_id" used on "permission_grants" but not found in schema                          |
| ERROR    | MISSING_WRITE_COLUMN  | `notification_preferences`    | `is_active`                   | `src/lib/settings/hooks.ts`                                 | 410  | Write column "is_active" used on "notification_preferences" but not found in schema                  |
| ERROR    | MISSING_WRITE_COLUMN  | `notification_preferences`    | `ended_at`                    | `src/lib/settings/hooks.ts`                                 | 410  | Write column "ended_at" used on "notification_preferences" but not found in schema                   |
| ERROR    | MISSING_FILTER_COLUMN | `brands`                      | `user_id`                     | `src/lib/settings/hooks.ts`                                 | 429  | Filter column "user_id" used on "brands" but not found in schema                                     |
| ERROR    | MISSING_WRITE_COLUMN  | `brands`                      | `ended_at`                    | `src/lib/settings/hooks.ts`                                 | 429  | Write column "ended_at" used on "brands" but not found in schema                                     |
| ERROR    | MISSING_WRITE_COLUMN  | `user_sessions`               | `is_active`                   | `src/lib/settings/hooks.ts`                                 | 444  | Write column "is_active" used on "user_sessions" but not found in schema                             |
| ERROR    | MISSING_WRITE_COLUMN  | `user_sessions`               | `ended_at`                    | `src/lib/settings/hooks.ts`                                 | 444  | Write column "ended_at" used on "user_sessions" but not found in schema                              |
| ERROR    | MISSING_WRITE_COLUMN  | `user_sessions`               | `is_active`                   | `src/lib/settings/hooks.ts`                                 | 459  | Write column "is_active" used on "user_sessions" but not found in schema                             |
| ERROR    | MISSING_WRITE_COLUMN  | `user_sessions`               | `ended_at`                    | `src/lib/settings/hooks.ts`                                 | 459  | Write column "ended_at" used on "user_sessions" but not found in schema                              |
| ERROR    | MISSING_FILTER_COLUMN | `setting_definitions`         | `is_active`                   | `src/lib/settings/settings-provider.tsx`                    | 146  | Filter column "is_active" used on "setting_definitions" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `settings`                    | `is_active`                   | `src/lib/settings/settings-provider.tsx`                    | 160  | Filter column "is_active" used on "settings" but not found in schema                                 |
| ERROR    | MISSING_FILTER_COLUMN | `org_memberships`             | `slug`                        | `src/lib/supabase/auth-context.tsx`                         | 79   | Filter column "slug" used on "org_memberships" but not found in schema                               |
| ERROR    | MISSING_WRITE_COLUMN  | `organizations`               | `user_id`                     | `src/lib/supabase/auth-context.tsx`                         | 93   | Write column "user_id" used on "organizations" but not found in schema                               |
| ERROR    | MISSING_WRITE_COLUMN  | `organizations`               | `organization_id`             | `src/lib/supabase/auth-context.tsx`                         | 93   | Write column "organization_id" used on "organizations" but not found in schema                       |
| ERROR    | MISSING_WRITE_COLUMN  | `organizations`               | `role`                        | `src/lib/supabase/auth-context.tsx`                         | 93   | Write column "role" used on "organizations" but not found in schema                                  |
| ERROR    | MISSING_WRITE_COLUMN  | `organizations`               | `status`                      | `src/lib/supabase/auth-context.tsx`                         | 93   | Write column "status" used on "organizations" but not found in schema                                |
| ERROR    | MISSING_WRITE_COLUMN  | `organizations`               | `is_default_org`              | `src/lib/supabase/auth-context.tsx`                         | 93   | Write column "is_default_org" used on "organizations" but not found in schema                        |
| ERROR    | MISSING_WRITE_COLUMN  | `deals`                       | `status`                      | `src/lib/supabase/hooks-crm.ts`                             | 114  | Write column "status" used on "deals" but not found in schema                                        |
| ERROR    | MISSING_WRITE_COLUMN  | `deals`                       | `converted_to_deal_id`        | `src/lib/supabase/hooks-crm.ts`                             | 114  | Write column "converted_to_deal_id" used on "deals" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `leads`                       | `featured`                    | `src/lib/supabase/hooks-crm.ts`                             | 123  | Filter column "featured" used on "leads" but not found in schema                                     |
| ERROR    | MISSING_FILTER_COLUMN | `lead_activities`             | `featured`                    | `src/lib/supabase/hooks-crm.ts`                             | 149  | Filter column "featured" used on "lead_activities" but not found in schema                           |
| ERROR    | MISSING_FILTER_COLUMN | `lead_activities`             | `status`                      | `src/lib/supabase/hooks-crm.ts`                             | 149  | Filter column "status" used on "lead_activities" but not found in schema                             |
| ERROR    | MISSING_FILTER_COLUMN | `lead_activities`             | `status`                      | `src/lib/supabase/hooks-crm.ts`                             | 149  | Filter column "status" used on "lead_activities" but not found in schema                             |
| ERROR    | MISSING_FILTER_COLUMN | `testimonials`                | `visible`                     | `src/lib/supabase/hooks-crm.ts`                             | 194  | Filter column "visible" used on "testimonials" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `testimonials`                | `visible`                     | `src/lib/supabase/hooks-crm.ts`                             | 212  | Filter column "visible" used on "testimonials" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `credit_notes`                | `client_invoice_id`           | `src/lib/supabase/hooks-extended.ts`                        | 66   | Filter column "client_invoice_id" used on "credit_notes" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `credit_notes`                | `project_id`                  | `src/lib/supabase/hooks-extended.ts`                        | 82   | Filter column "project_id" used on "credit_notes" but not found in schema                            |
| ERROR    | MISSING_FILTER_COLUMN | `credit_notes`                | `project_id`                  | `src/lib/supabase/hooks-extended.ts`                        | 101  | Filter column "project_id" used on "credit_notes" but not found in schema                            |
| ERROR    | MISSING_FILTER_COLUMN | `consumables`                 | `project_id`                  | `src/lib/supabase/hooks-extended.ts`                        | 121  | Filter column "project_id" used on "consumables" but not found in schema                             |
| ERROR    | MISSING_FILTER_COLUMN | `consumables`                 | `consumable_id`               | `src/lib/supabase/hooks-extended.ts`                        | 121  | Filter column "consumable_id" used on "consumables" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `consumables`                 | `consumable_id`               | `src/lib/supabase/hooks-extended.ts`                        | 135  | Filter column "consumable_id" used on "consumables" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `consumables`                 | `consumable_id`               | `src/lib/supabase/hooks-extended.ts`                        | 151  | Filter column "consumable_id" used on "consumables" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `consumable_usage`            | `asset_id`                    | `src/lib/supabase/hooks-extended.ts`                        | 170  | Filter column "asset_id" used on "consumable_usage" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `consumable_usage`            | `asset_id`                    | `src/lib/supabase/hooks-extended.ts`                        | 186  | Filter column "asset_id" used on "consumable_usage" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `maintenance_records`         | `status`                      | `src/lib/supabase/hooks-extended.ts`                        | 227  | Filter column "status" used on "maintenance_records" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `maintenance_records`         | `status`                      | `src/lib/supabase/hooks-extended.ts`                        | 249  | Filter column "status" used on "maintenance_records" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `payroll_batches`             | `department`                  | `src/lib/supabase/hooks-extended.ts`                        | 286  | Filter column "department" used on "payroll_batches" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `payroll_batches`             | `department`                  | `src/lib/supabase/hooks-extended.ts`                        | 305  | Filter column "department" used on "payroll_batches" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `production_expenses`         | `department`                  | `src/lib/supabase/hooks-extended.ts`                        | 326  | Filter column "department" used on "production_expenses" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `production_expenses`         | `user_id`                     | `src/lib/supabase/hooks-extended.ts`                        | 343  | Filter column "user_id" used on "production_expenses" but not found in schema                        |
| ERROR    | MISSING_FILTER_COLUMN | `production_expenses`         | `user_id`                     | `src/lib/supabase/hooks-extended.ts`                        | 362  | Filter column "user_id" used on "production_expenses" but not found in schema                        |
| ERROR    | MISSING_FILTER_COLUMN | `production_time_entries`     | `user_id`                     | `src/lib/supabase/hooks-extended.ts`                        | 383  | Filter column "user_id" used on "production_time_entries" but not found in schema                    |
| ERROR    | MISSING_FILTER_COLUMN | `project_assignments`         | `start_datetime`              | `src/lib/supabase/hooks-extended.ts`                        | 479  | Filter column "start_datetime" used on "project_assignments" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `project_assignments`         | `end_datetime`                | `src/lib/supabase/hooks-extended.ts`                        | 479  | Filter column "end_datetime" used on "project_assignments" but not found in schema                   |
| ERROR    | MISSING_FILTER_COLUMN | `project_assignments`         | `start_datetime`              | `src/lib/supabase/hooks-extended.ts`                        | 495  | Filter column "start_datetime" used on "project_assignments" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `project_assignments`         | `end_datetime`                | `src/lib/supabase/hooks-extended.ts`                        | 495  | Filter column "end_datetime" used on "project_assignments" but not found in schema                   |
| ERROR    | MISSING_FILTER_COLUMN | `report_definitions`          | `category`                    | `src/lib/supabase/hooks-extended.ts`                        | 580  | Filter column "category" used on "report_definitions" but not found in schema                        |
| ERROR    | MISSING_FILTER_COLUMN | `report_definitions`          | `category`                    | `src/lib/supabase/hooks-extended.ts`                        | 594  | Filter column "category" used on "report_definitions" but not found in schema                        |
| ERROR    | MISSING_FILTER_COLUMN | `report_definitions`          | `category`                    | `src/lib/supabase/hooks-extended.ts`                        | 613  | Filter column "category" used on "report_definitions" but not found in schema                        |
| ERROR    | MISSING_FILTER_COLUMN | `organizations`               | `event_id`                    | `src/lib/supabase/hooks-extended.ts`                        | 775  | Filter column "event_id" used on "organizations" but not found in schema                             |
| ERROR    | MISSING_FILTER_COLUMN | `organizations`               | `event_id`                    | `src/lib/supabase/hooks-extended.ts`                        | 789  | Filter column "event_id" used on "organizations" but not found in schema                             |
| ERROR    | MISSING_FILTER_COLUMN | `organizations`               | `project_id`                  | `src/lib/supabase/hooks-extended.ts`                        | 789  | Filter column "project_id" used on "organizations" but not found in schema                           |
| ERROR    | MISSING_FILTER_COLUMN | `organizations`               | `event_id`                    | `src/lib/supabase/hooks-extended.ts`                        | 805  | Filter column "event_id" used on "organizations" but not found in schema                             |
| ERROR    | MISSING_FILTER_COLUMN | `organizations`               | `project_id`                  | `src/lib/supabase/hooks-extended.ts`                        | 805  | Filter column "project_id" used on "organizations" but not found in schema                           |
| ERROR    | MISSING_FILTER_COLUMN | `activities`                  | `automation_id`               | `src/lib/supabase/hooks-extended.ts`                        | 846  | Filter column "automation_id" used on "activities" but not found in schema                           |
| ERROR    | MISSING_FILTER_COLUMN | `activities`                  | `automation_id`               | `src/lib/supabase/hooks-extended.ts`                        | 867  | Filter column "automation_id" used on "activities" but not found in schema                           |
| ERROR    | MISSING_FILTER_COLUMN | `activities`                  | `stakeholder_id`              | `src/lib/supabase/hooks-extended.ts`                        | 867  | Filter column "stakeholder_id" used on "activities" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `automation_logs`             | `stakeholder_id`              | `src/lib/supabase/hooks-extended.ts`                        | 888  | Filter column "stakeholder_id" used on "automation_logs" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `automation_logs`             | `project_id`                  | `src/lib/supabase/hooks-extended.ts`                        | 888  | Filter column "project_id" used on "automation_logs" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `stakeholder_projects`        | `sow_id`                      | `src/lib/supabase/hooks-extended.ts`                        | 922  | Filter column "sow_id" used on "stakeholder_projects" but not found in schema                        |
| ERROR    | MISSING_FILTER_COLUMN | `stakeholder_projects`        | `sow_id`                      | `src/lib/supabase/hooks-extended.ts`                        | 941  | Filter column "sow_id" used on "stakeholder_projects" but not found in schema                        |
| ERROR    | MISSING_FILTER_COLUMN | `budget_alerts`               | `entity_type`                 | `src/lib/supabase/hooks-feature-gaps.ts`                    | 109  | Filter column "entity_type" used on "budget_alerts" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `budget_alerts`               | `entity_id`                   | `src/lib/supabase/hooks-feature-gaps.ts`                    | 109  | Filter column "entity_id" used on "budget_alerts" but not found in schema                            |
| ERROR    | MISSING_FILTER_COLUMN | `budget_alerts`               | `entity_type`                 | `src/lib/supabase/hooks-feature-gaps.ts`                    | 125  | Filter column "entity_type" used on "budget_alerts" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `budget_alerts`               | `entity_id`                   | `src/lib/supabase/hooks-feature-gaps.ts`                    | 125  | Filter column "entity_id" used on "budget_alerts" but not found in schema                            |
| ERROR    | MISSING_FILTER_COLUMN | `record_activity_log`         | `is_active`                   | `src/lib/supabase/hooks-feature-gaps.ts`                    | 215  | Filter column "is_active" used on "record_activity_log" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `quality_check_templates`     | `entity_id`                   | `src/lib/supabase/hooks-feature-gaps.ts`                    | 246  | Filter column "entity_id" used on "quality_check_templates" but not found in schema                  |
| ERROR    | MISSING_FILTER_COLUMN | `quality_checks`              | `review_cycle_id`             | `src/lib/supabase/hooks-feature-gaps.ts`                    | 294  | Filter column "review_cycle_id" used on "quality_checks" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `quality_checks`              | `reviewee_id`                 | `src/lib/supabase/hooks-feature-gaps.ts`                    | 294  | Filter column "reviewee_id" used on "quality_checks" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `review_cycles`               | `review_cycle_id`             | `src/lib/supabase/hooks-feature-gaps.ts`                    | 324  | Filter column "review_cycle_id" used on "review_cycles" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `review_cycles`               | `reviewee_id`                 | `src/lib/supabase/hooks-feature-gaps.ts`                    | 324  | Filter column "reviewee_id" used on "review_cycles" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `review_feedback_requests`    | `owner_id`                    | `src/lib/supabase/hooks-feature-gaps.ts`                    | 352  | Filter column "owner_id" used on "review_feedback_requests" but not found in schema                  |
| ERROR    | MISSING_FILTER_COLUMN | `goals`                       | `category`                    | `src/lib/supabase/hooks-feature-gaps.ts`                    | 404  | Filter column "category" used on "goals" but not found in schema                                     |
| ERROR    | MISSING_FILTER_COLUMN | `goals`                       | `category`                    | `src/lib/supabase/hooks-feature-gaps.ts`                    | 416  | Filter column "category" used on "goals" but not found in schema                                     |
| ERROR    | MISSING_FILTER_COLUMN | `knowledge_articles`          | `entity_type`                 | `src/lib/supabase/hooks-feature-gaps.ts`                    | 482  | Filter column "entity_type" used on "knowledge_articles" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `knowledge_articles`          | `entity_id`                   | `src/lib/supabase/hooks-feature-gaps.ts`                    | 482  | Filter column "entity_id" used on "knowledge_articles" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `knowledge_articles`          | `entity_type`                 | `src/lib/supabase/hooks-feature-gaps.ts`                    | 497  | Filter column "entity_type" used on "knowledge_articles" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `knowledge_articles`          | `entity_id`                   | `src/lib/supabase/hooks-feature-gaps.ts`                    | 497  | Filter column "entity_id" used on "knowledge_articles" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `proposals`                   | `project_id`                  | `src/lib/supabase/hooks-pages.ts`                           | 52   | Filter column "project_id" used on "proposals" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `proposals`                   | `project_id`                  | `src/lib/supabase/hooks-pages.ts`                           | 67   | Filter column "project_id" used on "proposals" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `proposals`                   | `project_id`                  | `src/lib/supabase/hooks-pages.ts`                           | 79   | Filter column "project_id" used on "proposals" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `stakeholders`                | `project_id`                  | `src/lib/supabase/hooks-pages.ts`                           | 164  | Filter column "project_id" used on "stakeholders" but not found in schema                            |
| ERROR    | MISSING_FILTER_COLUMN | `estimates`                   | `project_id`                  | `src/lib/supabase/hooks-pages.ts`                           | 179  | Filter column "project_id" used on "estimates" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `estimates`                   | `project_id`                  | `src/lib/supabase/hooks-pages.ts`                           | 192  | Filter column "project_id" used on "estimates" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `estimates`                   | `crew_member_id`              | `src/lib/supabase/hooks-pages.ts`                           | 192  | Filter column "crew_member_id" used on "estimates" but not found in schema                           |
| ERROR    | MISSING_FILTER_COLUMN | `digital_assets`              | `project_id`                  | `src/lib/supabase/hooks-pages.ts`                           | 208  | Filter column "project_id" used on "digital_assets" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `digital_assets`              | `crew_member_id`              | `src/lib/supabase/hooks-pages.ts`                           | 208  | Filter column "crew_member_id" used on "digital_assets" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `digital_assets`              | `project_id`                  | `src/lib/supabase/hooks-pages.ts`                           | 208  | Filter column "project_id" used on "digital_assets" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `digital_assets`              | `crew_member_id`              | `src/lib/supabase/hooks-pages.ts`                           | 223  | Filter column "crew_member_id" used on "digital_assets" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `digital_assets`              | `project_id`                  | `src/lib/supabase/hooks-pages.ts`                           | 223  | Filter column "project_id" used on "digital_assets" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `certifications`              | `project_id`                  | `src/lib/supabase/hooks-pages.ts`                           | 239  | Filter column "project_id" used on "certifications" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `compliance_checklists`       | `project_id`                  | `src/lib/supabase/hooks-pages.ts`                           | 289  | Filter column "project_id" used on "compliance_checklists" but not found in schema                   |
| ERROR    | MISSING_FILTER_COLUMN | `automations`                 | `status`                      | `src/lib/supabase/hooks-pages.ts`                           | 350  | Filter column "status" used on "automations" but not found in schema                                 |
| ERROR    | MISSING_FILTER_COLUMN | `scopes_of_work`              | `vendor_id`                   | `src/lib/supabase/hooks-pages.ts`                           | 381  | Filter column "vendor_id" used on "scopes_of_work" but not found in schema                           |
| ERROR    | MISSING_FILTER_COLUMN | `leads`                       | `vendor_id`                   | `src/lib/supabase/hooks-pages.ts`                           | 397  | Filter column "vendor_id" used on "leads" but not found in schema                                    |
| ERROR    | MISSING_FILTER_COLUMN | `leads`                       | `contract_id`                 | `src/lib/supabase/hooks-pages.ts`                           | 397  | Filter column "contract_id" used on "leads" but not found in schema                                  |
| ERROR    | MISSING_FILTER_COLUMN | `leads`                       | `vendor_id`                   | `src/lib/supabase/hooks-pages.ts`                           | 412  | Filter column "vendor_id" used on "leads" but not found in schema                                    |
| ERROR    | MISSING_FILTER_COLUMN | `leads`                       | `contract_id`                 | `src/lib/supabase/hooks-pages.ts`                           | 412  | Filter column "contract_id" used on "leads" but not found in schema                                  |
| ERROR    | MISSING_FILTER_COLUMN | `vendor_reviews`              | `contract_id`                 | `src/lib/supabase/hooks-pages.ts`                           | 428  | Filter column "contract_id" used on "vendor_reviews" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `e_signatures`                | `contract_id`                 | `src/lib/supabase/hooks-pages.ts`                           | 447  | Filter column "contract_id" used on "e_signatures" but not found in schema                           |
| ERROR    | MISSING_FILTER_COLUMN | `e_signatures`                | `project_id`                  | `src/lib/supabase/hooks-pages.ts`                           | 447  | Filter column "project_id" used on "e_signatures" but not found in schema                            |
| ERROR    | MISSING_FILTER_COLUMN | `e_signatures`                | `type`                        | `src/lib/supabase/hooks-pages.ts`                           | 447  | Filter column "type" used on "e_signatures" but not found in schema                                  |
| ERROR    | MISSING_FILTER_COLUMN | `vault_documents`             | `type`                        | `src/lib/supabase/hooks-pages.ts`                           | 466  | Filter column "type" used on "vault_documents" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `vehicles`                    | `campaign_id`                 | `src/lib/supabase/hooks-pages.ts`                           | 485  | Filter column "campaign_id" used on "vehicles" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `stakeholders`                | `campaign_id`                 | `src/lib/supabase/hooks-pages.ts`                           | 500  | Filter column "campaign_id" used on "stakeholders" but not found in schema                           |
| ERROR    | MISSING_FILTER_COLUMN | `stakeholders`                | `stage`                       | `src/lib/supabase/hooks-pages.ts`                           | 500  | Filter column "stage" used on "stakeholders" but not found in schema                                 |
| ERROR    | MISSING_FILTER_COLUMN | `profiles`                    | `campaign_id`                 | `src/lib/supabase/hooks-pages.ts`                           | 514  | Filter column "campaign_id" used on "profiles" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `profiles`                    | `stage`                       | `src/lib/supabase/hooks-pages.ts`                           | 514  | Filter column "stage" used on "profiles" but not found in schema                                     |
| ERROR    | MISSING_FILTER_COLUMN | `campaign_assets`             | `stage`                       | `src/lib/supabase/hooks-pages.ts`                           | 529  | Filter column "stage" used on "campaign_assets" but not found in schema                              |
| ERROR    | MISSING_FILTER_COLUMN | `opportunities`               | `status`                      | `src/lib/supabase/hooks-pages.ts`                           | 548  | Filter column "status" used on "opportunities" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `companies`                   | `company_id`                  | `src/lib/supabase/hooks-productive.ts`                      | 87   | Filter column "company_id" used on "companies" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `companies`                   | `company_id`                  | `src/lib/supabase/hooks-productive.ts`                      | 103  | Filter column "company_id" used on "companies" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `companies`                   | `company_id`                  | `src/lib/supabase/hooks-productive.ts`                      | 122  | Filter column "company_id" used on "companies" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `pipelines`                   | `entity_type`                 | `src/lib/supabase/hooks-productive.ts`                      | 214  | Filter column "entity_type" used on "pipelines" but not found in schema                              |
| ERROR    | MISSING_FILTER_COLUMN | `pipelines`                   | `entity_type`                 | `src/lib/supabase/hooks-productive.ts`                      | 228  | Filter column "entity_type" used on "pipelines" but not found in schema                              |
| ERROR    | MISSING_FILTER_COLUMN | `pipelines`                   | `entity_type`                 | `src/lib/supabase/hooks-productive.ts`                      | 244  | Filter column "entity_type" used on "pipelines" but not found in schema                              |
| ERROR    | MISSING_FILTER_COLUMN | `pipelines`                   | `entity_id`                   | `src/lib/supabase/hooks-productive.ts`                      | 244  | Filter column "entity_id" used on "pipelines" but not found in schema                                |
| ERROR    | MISSING_FILTER_COLUMN | `custom_fields`               | `entity_id`                   | `src/lib/supabase/hooks-productive.ts`                      | 265  | Filter column "entity_id" used on "custom_fields" but not found in schema                            |
| ERROR    | MISSING_FILTER_COLUMN | `custom_fields`               | `project_id`                  | `src/lib/supabase/hooks-productive.ts`                      | 302  | Filter column "project_id" used on "custom_fields" but not found in schema                           |
| ERROR    | MISSING_FILTER_COLUMN | `custom_field_values`         | `project_id`                  | `src/lib/supabase/hooks-productive.ts`                      | 318  | Filter column "project_id" used on "custom_field_values" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `rate_cards`                  | `project_id`                  | `src/lib/supabase/hooks-productive.ts`                      | 519  | Filter column "project_id" used on "rate_cards" but not found in schema                              |
| ERROR    | MISSING_FILTER_COLUMN | `rate_cards`                  | `crew_member_id`              | `src/lib/supabase/hooks-productive.ts`                      | 519  | Filter column "crew_member_id" used on "rate_cards" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `rate_cards`                  | `end_date`                    | `src/lib/supabase/hooks-productive.ts`                      | 519  | Filter column "end_date" used on "rate_cards" but not found in schema                                |
| ERROR    | MISSING_FILTER_COLUMN | `rate_card_items`             | `project_id`                  | `src/lib/supabase/hooks-productive.ts`                      | 535  | Filter column "project_id" used on "rate_card_items" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `rate_card_items`             | `crew_member_id`              | `src/lib/supabase/hooks-productive.ts`                      | 535  | Filter column "crew_member_id" used on "rate_card_items" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `rate_card_items`             | `end_date`                    | `src/lib/supabase/hooks-productive.ts`                      | 535  | Filter column "end_date" used on "rate_card_items" but not found in schema                           |
| ERROR    | MISSING_FILTER_COLUMN | `rate_card_items`             | `start_date`                  | `src/lib/supabase/hooks-productive.ts`                      | 535  | Filter column "start_date" used on "rate_card_items" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `time_off_requests`           | `user_id`                     | `src/lib/supabase/hooks-productive.ts`                      | 678  | Filter column "user_id" used on "time_off_requests" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `time_off_requests`           | `user_id`                     | `src/lib/supabase/hooks-productive.ts`                      | 707  | Filter column "user_id" used on "time_off_requests" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `active_timers`               | `status`                      | `src/lib/supabase/hooks-productive.ts`                      | 749  | Filter column "status" used on "active_timers" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `active_timers`               | `status`                      | `src/lib/supabase/hooks-productive.ts`                      | 766  | Filter column "status" used on "active_timers" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `active_timers`               | `status`                      | `src/lib/supabase/hooks-productive.ts`                      | 773  | Filter column "status" used on "active_timers" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `dashboard_widgets`           | `project_id`                  | `src/lib/supabase/hooks-productive.ts`                      | 941  | Filter column "project_id" used on "dashboard_widgets" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `dashboard_widgets`           | `project_id`                  | `src/lib/supabase/hooks-productive.ts`                      | 962  | Filter column "project_id" used on "dashboard_widgets" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `documents`                   | `document_id`                 | `src/lib/supabase/hooks-productive.ts`                      | 985  | Filter column "document_id" used on "documents" but not found in schema                              |
| ERROR    | MISSING_FILTER_COLUMN | `documents`                   | `document_id`                 | `src/lib/supabase/hooks-productive.ts`                      | 1005 | Filter column "document_id" used on "documents" but not found in schema                              |
| ERROR    | MISSING_FILTER_COLUMN | `recurring_invoices`          | `invoice_id`                  | `src/lib/supabase/hooks-productive.ts`                      | 1095 | Filter column "invoice_id" used on "recurring_invoices" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `recurring_invoices`          | `invoice_id`                  | `src/lib/supabase/hooks-productive.ts`                      | 1109 | Filter column "invoice_id" used on "recurring_invoices" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `scopes_of_work`              | `sow_id`                      | `src/lib/supabase/hooks-sow.ts`                             | 80   | Filter column "sow_id" used on "scopes_of_work" but not found in schema                              |
| ERROR    | MISSING_FILTER_COLUMN | `scopes_of_work`              | `sow_id`                      | `src/lib/supabase/hooks-sow.ts`                             | 96   | Filter column "sow_id" used on "scopes_of_work" but not found in schema                              |
| ERROR    | MISSING_FILTER_COLUMN | `sow_deliverables`            | `project_id`                  | `src/lib/supabase/hooks-sow.ts`                             | 175  | Filter column "project_id" used on "sow_deliverables" but not found in schema                        |
| ERROR    | MISSING_FILTER_COLUMN | `sow_deliverables`            | `project_id`                  | `src/lib/supabase/hooks-sow.ts`                             | 196  | Filter column "project_id" used on "sow_deliverables" but not found in schema                        |
| ERROR    | MISSING_FILTER_COLUMN | `client_invoices`             | `client_invoice_id`           | `src/lib/supabase/hooks-sow.ts`                             | 253  | Filter column "client_invoice_id" used on "client_invoices" but not found in schema                  |
| ERROR    | MISSING_FILTER_COLUMN | `client_invoices`             | `client_invoice_id`           | `src/lib/supabase/hooks-sow.ts`                             | 272  | Filter column "client_invoice_id" used on "client_invoices" but not found in schema                  |
| ERROR    | MISSING_FILTER_COLUMN | `invoice_line_items`          | `invoice_line_item_id`        | `src/lib/supabase/hooks-sow.ts`                             | 337  | Filter column "invoice_line_item_id" used on "invoice_line_items" but not found in schema            |
| ERROR    | MISSING_FILTER_COLUMN | `invoice_line_items`          | `invoice_line_item_id`        | `src/lib/supabase/hooks-sow.ts`                             | 359  | Filter column "invoice_line_item_id" used on "invoice_line_items" but not found in schema            |
| ERROR    | MISSING_FILTER_COLUMN | `invoice_time_entries`        | `sow_id`                      | `src/lib/supabase/hooks-sow.ts`                             | 381  | Filter column "sow_id" used on "invoice_time_entries" but not found in schema                        |
| ERROR    | MISSING_FILTER_COLUMN | `invoice_time_entries`        | `sow_id`                      | `src/lib/supabase/hooks-sow.ts`                             | 396  | Filter column "sow_id" used on "invoice_time_entries" but not found in schema                        |
| ERROR    | MISSING_FILTER_COLUMN | `invoice_time_entries`        | `sow_deliverable_id`          | `src/lib/supabase/hooks-sow.ts`                             | 396  | Filter column "sow_deliverable_id" used on "invoice_time_entries" but not found in schema            |
| ERROR    | MISSING_FILTER_COLUMN | `automation_executions`       | `project_id`                  | `src/lib/supabase/hooks-v2-features.ts`                     | 23   | Filter column "project_id" used on "automation_executions" but not found in schema                   |
| ERROR    | MISSING_FILTER_COLUMN | `automation_executions`       | `project_id`                  | `src/lib/supabase/hooks-v2-features.ts`                     | 39   | Filter column "project_id" used on "automation_executions" but not found in schema                   |
| ERROR    | MISSING_FILTER_COLUMN | `automation_executions`       | `project_id`                  | `src/lib/supabase/hooks-v2-features.ts`                     | 54   | Filter column "project_id" used on "automation_executions" but not found in schema                   |
| ERROR    | MISSING_FILTER_COLUMN | `revenue_recognition_entries` | `is_active`                   | `src/lib/supabase/hooks-v2-features.ts`                     | 74   | Filter column "is_active" used on "revenue_recognition_entries" but not found in schema              |
| ERROR    | MISSING_FILTER_COLUMN | `revenue_recognition_entries` | `is_active`                   | `src/lib/supabase/hooks-v2-features.ts`                     | 102  | Filter column "is_active" used on "revenue_recognition_entries" but not found in schema              |
| ERROR    | MISSING_FILTER_COLUMN | `time_tracking_policies`      | `is_read`                     | `src/lib/supabase/hooks-v2-features.ts`                     | 124  | Filter column "is_read" used on "time_tracking_policies" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `time_tracking_policies`      | `is_read`                     | `src/lib/supabase/hooks-v2-features.ts`                     | 138  | Filter column "is_read" used on "time_tracking_policies" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `time_tracking_policies`      | `is_read`                     | `src/lib/supabase/hooks-v2-features.ts`                     | 138  | Filter column "is_read" used on "time_tracking_policies" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `notification_preferences`    | `entity_type`                 | `src/lib/supabase/hooks-v2-features.ts`                     | 249  | Filter column "entity_type" used on "notification_preferences" but not found in schema               |
| ERROR    | MISSING_FILTER_COLUMN | `notification_preferences`    | `entity_id`                   | `src/lib/supabase/hooks-v2-features.ts`                     | 249  | Filter column "entity_id" used on "notification_preferences" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `notification_preferences`    | `entity_type`                 | `src/lib/supabase/hooks-v2-features.ts`                     | 262  | Filter column "entity_type" used on "notification_preferences" but not found in schema               |
| ERROR    | MISSING_FILTER_COLUMN | `notification_preferences`    | `entity_id`                   | `src/lib/supabase/hooks-v2-features.ts`                     | 262  | Filter column "entity_id" used on "notification_preferences" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `email_messages`              | `survey_type`                 | `src/lib/supabase/hooks-v2-features.ts`                     | 281  | Filter column "survey_type" used on "email_messages" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `email_messages`              | `survey_type`                 | `src/lib/supabase/hooks-v2-features.ts`                     | 298  | Filter column "survey_type" used on "email_messages" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `email_messages`              | `template_id`                 | `src/lib/supabase/hooks-v2-features.ts`                     | 298  | Filter column "template_id" used on "email_messages" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `survey_templates`            | `template_id`                 | `src/lib/supabase/hooks-v2-features.ts`                     | 317  | Filter column "template_id" used on "survey_templates" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `survey_templates`            | `entity_type`                 | `src/lib/supabase/hooks-v2-features.ts`                     | 317  | Filter column "entity_type" used on "survey_templates" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `survey_templates`            | `entity_id`                   | `src/lib/supabase/hooks-v2-features.ts`                     | 317  | Filter column "entity_id" used on "survey_templates" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `survey_templates`            | `template_id`                 | `src/lib/supabase/hooks-v2-features.ts`                     | 332  | Filter column "template_id" used on "survey_templates" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `survey_templates`            | `entity_type`                 | `src/lib/supabase/hooks-v2-features.ts`                     | 332  | Filter column "entity_type" used on "survey_templates" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `survey_templates`            | `entity_id`                   | `src/lib/supabase/hooks-v2-features.ts`                     | 332  | Filter column "entity_id" used on "survey_templates" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `survey_responses`            | `entity_types`                | `src/lib/supabase/hooks-v2-features.ts`                     | 361  | Filter column "entity_types" used on "survey_responses" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `sla_policies`                | `entity_types`                | `src/lib/supabase/hooks-v2-features.ts`                     | 377  | Filter column "entity_types" used on "sla_policies" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `sla_policies`                | `entity_types`                | `src/lib/supabase/hooks-v2-features.ts`                     | 388  | Filter column "entity_types" used on "sla_policies" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `custom_field_definitions`    | `entity_type`                 | `src/lib/supabase/hooks-v2-features.ts`                     | 417  | Filter column "entity_type" used on "custom_field_definitions" but not found in schema               |
| ERROR    | MISSING_FILTER_COLUMN | `custom_field_definitions`    | `entity_id`                   | `src/lib/supabase/hooks-v2-features.ts`                     | 417  | Filter column "entity_id" used on "custom_field_definitions" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `custom_field_definitions`    | `entity_type`                 | `src/lib/supabase/hooks-v2-features.ts`                     | 430  | Filter column "entity_type" used on "custom_field_definitions" but not found in schema               |
| ERROR    | MISSING_FILTER_COLUMN | `custom_field_definitions`    | `entity_id`                   | `src/lib/supabase/hooks-v2-features.ts`                     | 430  | Filter column "entity_id" used on "custom_field_definitions" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `custom_field_definitions`    | `entity_type`                 | `src/lib/supabase/hooks-v2-features.ts`                     | 445  | Filter column "entity_type" used on "custom_field_definitions" but not found in schema               |
| ERROR    | MISSING_FILTER_COLUMN | `custom_field_definitions`    | `entity_id`                   | `src/lib/supabase/hooks-v2-features.ts`                     | 445  | Filter column "entity_id" used on "custom_field_definitions" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `custom_field_definitions`    | `is_active`                   | `src/lib/supabase/hooks-v2-features.ts`                     | 445  | Filter column "is_active" used on "custom_field_definitions" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `custom_field_values`         | `is_active`                   | `src/lib/supabase/hooks-v2-features.ts`                     | 461  | Filter column "is_active" used on "custom_field_values" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `custom_field_values`         | `is_active`                   | `src/lib/supabase/hooks-v2-features.ts`                     | 476  | Filter column "is_active" used on "custom_field_values" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `ai_report_queries`           | `billable`                    | `src/lib/supabase/hooks-v2-features.ts`                     | 544  | Filter column "billable" used on "ai_report_queries" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `ai_report_queries`           | `invoice_id`                  | `src/lib/supabase/hooks-v2-features.ts`                     | 544  | Filter column "invoice_id" used on "ai_report_queries" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `ai_report_queries`           | `billable`                    | `src/lib/supabase/hooks-v2-features.ts`                     | 558  | Filter column "billable" used on "ai_report_queries" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `ai_report_queries`           | `invoice_id`                  | `src/lib/supabase/hooks-v2-features.ts`                     | 558  | Filter column "invoice_id" used on "ai_report_queries" but not found in schema                       |
| ERROR    | MISSING_WRITE_COLUMN  | `production_time_entries`     | `amount`                      | `src/lib/supabase/hooks-v2-features.ts`                     | 586  | Write column "amount" used on "production_time_entries" but not found in schema                      |
| ERROR    | MISSING_WRITE_COLUMN  | `production_time_entries`     | `source`                      | `src/lib/supabase/hooks-v2-features.ts`                     | 586  | Write column "source" used on "production_time_entries" but not found in schema                      |
| ERROR    | MISSING_WRITE_COLUMN  | `production_time_entries`     | `generated_from_time_entries` | `src/lib/supabase/hooks-v2-features.ts`                     | 586  | Write column "generated_from_time_entries" used on "production_time_entries" but not found in schema |
| ERROR    | MISSING_WRITE_COLUMN  | `invoices`                    | `project_id`                  | `src/lib/supabase/hooks-v2-features.ts`                     | 613  | Write column "project_id" used on "invoices" but not found in schema                                 |
| ERROR    | MISSING_WRITE_COLUMN  | `invoices`                    | `notes`                       | `src/lib/supabase/hooks-v2-features.ts`                     | 613  | Write column "notes" used on "invoices" but not found in schema                                      |
| ERROR    | MISSING_FILTER_COLUMN | `call_sheets`                 | `call_sheet_id`               | `src/lib/supabase/hooks-workflows.ts`                       | 68   | Filter column "call_sheet_id" used on "call_sheets" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `call_sheets`                 | `call_sheet_id`               | `src/lib/supabase/hooks-workflows.ts`                       | 84   | Filter column "call_sheet_id" used on "call_sheets" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `call_sheets`                 | `call_sheet_id`               | `src/lib/supabase/hooks-workflows.ts`                       | 100  | Filter column "call_sheet_id" used on "call_sheets" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `call_sheet_crew`             | `project_id`                  | `src/lib/supabase/hooks-workflows.ts`                       | 120  | Filter column "project_id" used on "call_sheet_crew" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `approval_workflows`          | `workflow_id`                 | `src/lib/supabase/hooks-workflows.ts`                       | 226  | Filter column "workflow_id" used on "approval_workflows" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `approval_workflows`          | `workflow_id`                 | `src/lib/supabase/hooks-workflows.ts`                       | 242  | Filter column "workflow_id" used on "approval_workflows" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `approval_workflows`          | `workflow_id`                 | `src/lib/supabase/hooks-workflows.ts`                       | 261  | Filter column "workflow_id" used on "approval_workflows" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `approval_steps`              | `entity_type`                 | `src/lib/supabase/hooks-workflows.ts`                       | 282  | Filter column "entity_type" used on "approval_steps" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `approval_steps`              | `entity_id`                   | `src/lib/supabase/hooks-workflows.ts`                       | 282  | Filter column "entity_id" used on "approval_steps" but not found in schema                           |
| ERROR    | MISSING_FILTER_COLUMN | `approval_steps`              | `entity_type`                 | `src/lib/supabase/hooks-workflows.ts`                       | 298  | Filter column "entity_type" used on "approval_steps" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `approval_steps`              | `entity_id`                   | `src/lib/supabase/hooks-workflows.ts`                       | 298  | Filter column "entity_id" used on "approval_steps" but not found in schema                           |
| ERROR    | MISSING_FILTER_COLUMN | `workflow_instances`          | `instance_id`                 | `src/lib/supabase/hooks-workflows.ts`                       | 336  | Filter column "instance_id" used on "workflow_instances" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `workflow_instances`          | `instance_id`                 | `src/lib/supabase/hooks-workflows.ts`                       | 355  | Filter column "instance_id" used on "workflow_instances" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `workflow_step_approvals`     | `entity_type`                 | `src/lib/supabase/hooks-workflows.ts`                       | 373  | Filter column "entity_type" used on "workflow_step_approvals" but not found in schema                |
| ERROR    | MISSING_FILTER_COLUMN | `workflow_step_approvals`     | `entity_id`                   | `src/lib/supabase/hooks-workflows.ts`                       | 373  | Filter column "entity_id" used on "workflow_step_approvals" but not found in schema                  |
| ERROR    | MISSING_FILTER_COLUMN | `e_signatures`                | `user_id`                     | `src/lib/supabase/hooks-workflows.ts`                       | 393  | Filter column "user_id" used on "e_signatures" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `e_signatures`                | `user_id`                     | `src/lib/supabase/hooks-workflows.ts`                       | 410  | Filter column "user_id" used on "e_signatures" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `projects`                    | `project_id`                  | `src/lib/supabase/hooks.ts`                                 | 211  | Filter column "project_id" used on "projects" but not found in schema                                |
| ERROR    | MISSING_FILTER_COLUMN | `projects`                    | `project_id`                  | `src/lib/supabase/hooks.ts`                                 | 227  | Filter column "project_id" used on "projects" but not found in schema                                |
| ERROR    | MISSING_FILTER_COLUMN | `projects`                    | `project_id`                  | `src/lib/supabase/hooks.ts`                                 | 246  | Filter column "project_id" used on "projects" but not found in schema                                |
| ERROR    | MISSING_WRITE_COLUMN  | `stakeholders`                | `read`                        | `src/lib/supabase/hooks.ts`                                 | 548  | Write column "read" used on "stakeholders" but not found in schema                                   |
| ERROR    | MISSING_FILTER_COLUMN | `case_studies`                | `start_date`                  | `src/lib/supabase/hooks.ts`                                 | 563  | Filter column "start_date" used on "case_studies" but not found in schema                            |
| ERROR    | MISSING_FILTER_COLUMN | `case_studies`                | `end_date`                    | `src/lib/supabase/hooks.ts`                                 | 563  | Filter column "end_date" used on "case_studies" but not found in schema                              |
| ERROR    | MISSING_WRITE_COLUMN  | `case_studies`                | `read`                        | `src/lib/supabase/hooks.ts`                                 | 563  | Write column "read" used on "case_studies" but not found in schema                                   |
| ERROR    | MISSING_FILTER_COLUMN | `notifications`               | `start_date`                  | `src/lib/supabase/hooks.ts`                                 | 578  | Filter column "start_date" used on "notifications" but not found in schema                           |
| ERROR    | MISSING_FILTER_COLUMN | `notifications`               | `end_date`                    | `src/lib/supabase/hooks.ts`                                 | 578  | Filter column "end_date" used on "notifications" but not found in schema                             |
| ERROR    | MISSING_FILTER_COLUMN | `notifications`               | `start_date`                  | `src/lib/supabase/hooks.ts`                                 | 593  | Filter column "start_date" used on "notifications" but not found in schema                           |
| ERROR    | MISSING_FILTER_COLUMN | `notifications`               | `end_date`                    | `src/lib/supabase/hooks.ts`                                 | 593  | Filter column "end_date" used on "notifications" but not found in schema                             |
| ERROR    | MISSING_FILTER_COLUMN | `notifications`               | `project_id`                  | `src/lib/supabase/hooks.ts`                                 | 593  | Filter column "project_id" used on "notifications" but not found in schema                           |
| ERROR    | MISSING_FILTER_COLUMN | `notifications`               | `date`                        | `src/lib/supabase/hooks.ts`                                 | 593  | Filter column "date" used on "notifications" but not found in schema                                 |
| ERROR    | MISSING_FILTER_COLUMN | `calendar_events`             | `date`                        | `src/lib/supabase/hooks.ts`                                 | 607  | Filter column "date" used on "calendar_events" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `calendar_events`             | `date`                        | `src/lib/supabase/hooks.ts`                                 | 622  | Filter column "date" used on "calendar_events" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `brand_kits`                  | `project_id`                  | `src/lib/supabase/hooks.ts`                                 | 672  | Filter column "project_id" used on "brand_kits" but not found in schema                              |
| ERROR    | MISSING_FILTER_COLUMN | `sops`                        | `project_id`                  | `src/lib/supabase/hooks.ts`                                 | 701  | Filter column "project_id" used on "sops" but not found in schema                                    |
| ERROR    | MISSING_FILTER_COLUMN | `budget_line_items`           | `entity_type`                 | `src/lib/supabase/hooks.ts`                                 | 819  | Filter column "entity_type" used on "budget_line_items" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `milestones`                  | `entity_type`                 | `src/lib/supabase/hooks.ts`                                 | 839  | Filter column "entity_type" used on "milestones" but not found in schema                             |
| ERROR    | MISSING_FILTER_COLUMN | `milestones`                  | `entity_id`                   | `src/lib/supabase/hooks.ts`                                 | 839  | Filter column "entity_id" used on "milestones" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `milestones`                  | `entity_type`                 | `src/lib/supabase/hooks.ts`                                 | 855  | Filter column "entity_type" used on "milestones" but not found in schema                             |
| ERROR    | MISSING_FILTER_COLUMN | `milestones`                  | `entity_id`                   | `src/lib/supabase/hooks.ts`                                 | 855  | Filter column "entity_id" used on "milestones" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `project_templates`           | `project_id`                  | `src/lib/supabase/hooks.ts`                                 | 932  | Filter column "project_id" used on "project_templates" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `project_templates`           | `project_id`                  | `src/lib/supabase/hooks.ts`                                 | 946  | Filter column "project_id" used on "project_templates" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `integrations`                | `project_id`                  | `src/lib/supabase/hooks.ts`                                 | 963  | Filter column "project_id" used on "integrations" but not found in schema                            |
| ERROR    | MISSING_FILTER_COLUMN | `activations`                 | `department`                  | `src/lib/supabase/hooks.ts`                                 | 1064 | Filter column "department" used on "activations" but not found in schema                             |
| ERROR    | MISSING_FILTER_COLUMN | `events`                      | `department`                  | `src/lib/supabase/hooks.ts`                                 | 1081 | Filter column "department" used on "events" but not found in schema                                  |
| ERROR    | MISSING_FILTER_COLUMN | `events`                      | `department`                  | `src/lib/supabase/hooks.ts`                                 | 1097 | Filter column "department" used on "events" but not found in schema                                  |
| ERROR    | MISSING_FILTER_COLUMN | `shipments`                   | `date`                        | `src/lib/supabase/hooks.ts`                                 | 1185 | Filter column "date" used on "shipments" but not found in schema                                     |
| ERROR    | MISSING_FILTER_COLUMN | `shipments`                   | `date`                        | `src/lib/supabase/hooks.ts`                                 | 1201 | Filter column "date" used on "shipments" but not found in schema                                     |
| ERROR    | MISSING_FILTER_COLUMN | `contracts`                   | `asset_id`                    | `src/lib/supabase/hooks.ts`                                 | 1335 | Filter column "asset_id" used on "contracts" but not found in schema                                 |
| ERROR    | MISSING_FILTER_COLUMN | `rfqs`                        | `asset_id`                    | `src/lib/supabase/hooks.ts`                                 | 1352 | Filter column "asset_id" used on "rfqs" but not found in schema                                      |
| ERROR    | MISSING_FILTER_COLUMN | `warehouses`                  | `project_id`                  | `src/lib/supabase/hooks.ts`                                 | 1369 | Filter column "project_id" used on "warehouses" but not found in schema                              |
| ERROR    | MISSING_FILTER_COLUMN | `warehouses`                  | `asset_id`                    | `src/lib/supabase/hooks.ts`                                 | 1369 | Filter column "asset_id" used on "warehouses" but not found in schema                                |
| ERROR    | MISSING_FILTER_COLUMN | `asset_assignments`           | `crew_member_id`              | `src/lib/supabase/hooks.ts`                                 | 1384 | Filter column "crew_member_id" used on "asset_assignments" but not found in schema                   |
| ERROR    | MISSING_FILTER_COLUMN | `asset_assignments`           | `date`                        | `src/lib/supabase/hooks.ts`                                 | 1384 | Filter column "date" used on "asset_assignments" but not found in schema                             |
| ERROR    | MISSING_FILTER_COLUMN | `asset_assignments`           | `date`                        | `src/lib/supabase/hooks.ts`                                 | 1384 | Filter column "date" used on "asset_assignments" but not found in schema                             |
| ERROR    | MISSING_FILTER_COLUMN | `asset_assignments`           | `crew_member_id`              | `src/lib/supabase/hooks.ts`                                 | 1401 | Filter column "crew_member_id" used on "asset_assignments" but not found in schema                   |
| ERROR    | MISSING_FILTER_COLUMN | `asset_assignments`           | `date`                        | `src/lib/supabase/hooks.ts`                                 | 1401 | Filter column "date" used on "asset_assignments" but not found in schema                             |
| ERROR    | MISSING_FILTER_COLUMN | `asset_assignments`           | `date`                        | `src/lib/supabase/hooks.ts`                                 | 1401 | Filter column "date" used on "asset_assignments" but not found in schema                             |
| ERROR    | MISSING_FILTER_COLUMN | `asset_assignments`           | `category`                    | `src/lib/supabase/hooks.ts`                                 | 1401 | Filter column "category" used on "asset_assignments" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `asset_assignments`           | `department`                  | `src/lib/supabase/hooks.ts`                                 | 1401 | Filter column "department" used on "asset_assignments" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `crew_availability`           | `category`                    | `src/lib/supabase/hooks.ts`                                 | 1421 | Filter column "category" used on "crew_availability" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `crew_availability`           | `department`                  | `src/lib/supabase/hooks.ts`                                 | 1421 | Filter column "department" used on "crew_availability" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `knowledge_base_articles`     | `project_id`                  | `src/lib/supabase/hooks.ts`                                 | 1458 | Filter column "project_id" used on "knowledge_base_articles" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `knowledge_base_articles`     | `event_id`                    | `src/lib/supabase/hooks.ts`                                 | 1458 | Filter column "event_id" used on "knowledge_base_articles" but not found in schema                   |
| ERROR    | MISSING_FILTER_COLUMN | `production_sops`             | `project_id`                  | `src/lib/supabase/hooks.ts`                                 | 1475 | Filter column "project_id" used on "production_sops" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `production_sops`             | `event_id`                    | `src/lib/supabase/hooks.ts`                                 | 1475 | Filter column "event_id" used on "production_sops" but not found in schema                           |
| ERROR    | MISSING_FILTER_COLUMN | `user_profiles`               | `user_id`                     | `src/lib/supabase/middleware.ts`                            | 105  | Filter column "user_id" used on "user_profiles" but not found in schema                              |
| ERROR    | MISSING_FILTER_COLUMN | `user_profiles`               | `status`                      | `src/lib/supabase/middleware.ts`                            | 105  | Filter column "status" used on "user_profiles" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `org_memberships`             | `gate_access`                 | `src/lib/supabase/middleware.ts`                            | 142  | Filter column "gate_access" used on "org_memberships" but not found in schema                        |
| ERROR    | MISSING_FILTER_COLUMN | `org_memberships`             | `gate_access`                 | `src/lib/supabase/middleware.ts`                            | 154  | Filter column "gate_access" used on "org_memberships" but not found in schema                        |
| ERROR    | MISSING_FILTER_COLUMN | `org_memberships`             | `step_definition_id`          | `src/lib/supabase/middleware.ts`                            | 154  | Filter column "step_definition_id" used on "org_memberships" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `onboarding_step_definitions` | `user_id`                     | `src/lib/supabase/middleware.ts`                            | 183  | Filter column "user_id" used on "onboarding_step_definitions" but not found in schema                |
| ERROR    | MISSING_FILTER_COLUMN | `onboarding_step_definitions` | `status`                      | `src/lib/supabase/middleware.ts`                            | 183  | Filter column "status" used on "onboarding_step_definitions" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `onboarding_step_definitions` | `step_definition_id`          | `src/lib/supabase/middleware.ts`                            | 183  | Filter column "step_definition_id" used on "onboarding_step_definitions" but not found in schema     |

## ERRORS: Missing Join Tables

Foreign table references in `.select()` that don't exist in the schema.

| Parent Table               | Join Table                                  | File                                     | Line |
| -------------------------- | ------------------------------------------- | ---------------------------------------- | ---- |
| `permission_grants`        | `inner`                                     | `src/app/api/middleware/permissions.ts`  | 103  |
| `review_feedback_requests` | `review_feedback_requests_reviewer_id_fkey` | `src/lib/supabase/hooks-feature-gaps.ts` | 352  |
| `companies`                | `account_manager_id`                        | `src/lib/supabase/hooks-productive.ts`   | 57   |
| `custom_fields`            | `owner_id`                                  | `src/lib/supabase/hooks-productive.ts`   | 302  |
| `custom_field_values`      | `owner_id`                                  | `src/lib/supabase/hooks-productive.ts`   | 318  |
| `saved_views`              | `owner_id`                                  | `src/lib/supabase/hooks-productive.ts`   | 340  |
| `resource_bookings`        | `approver_id`                               | `src/lib/supabase/hooks-productive.ts`   | 591  |
| `time_off_requests`        | `approver_id`                               | `src/lib/supabase/hooks-productive.ts`   | 642  |
| `proposals`                | `owner_id`                                  | `src/lib/supabase/hooks-productive.ts`   | 851  |
| `proposal_items`           | `owner_id`                                  | `src/lib/supabase/hooks-productive.ts`   | 871  |
| `dashboards`               | `owner_id`                                  | `src/lib/supabase/hooks-productive.ts`   | 893  |
| `dashboard_widgets`        | `owner_id`                                  | `src/lib/supabase/hooks-productive.ts`   | 941  |
| `documents`                | `owner_id`                                  | `src/lib/supabase/hooks-productive.ts`   | 985  |
| `invoice_time_entries`     | `changed_by`                                | `src/lib/supabase/hooks-sow.ts`          | 396  |
| `sow_change_log`           | `changed_by`                                | `src/lib/supabase/hooks-sow.ts`          | 421  |
| `org_memberships`          | `inner`                                     | `src/lib/supabase/middleware.ts`         | 154  |

## Appendix A: Complete Table Inventory

| #   | Table                            | Columns | Migration                                     | Queried? | View? |
| --- | -------------------------------- | ------- | --------------------------------------------- | -------- | ----- |
| 1   | `access_audit_log`               | 12      | 028_rbac_custom_roles.sql                     | Yes      | No    |
| 2   | `account_health_scores`          | 20      | 013_crm_revenue_pipeline.sql                  | No       | No    |
| 3   | `account_revenue_summary`        | 0       | 013_crm_revenue_pipeline.sql                  | No       | Yes   |
| 4   | `activation_assets`              | 12      | 012_production_consolidation.sql              | No       | No    |
| 5   | `activations`                    | 33      | 003_production_lifecycle.sql                  | Yes      | No    |
| 6   | `active_timers`                  | 8       | 005_productive_features.sql                   | Yes      | No    |
| 7   | `activities`                     | 25      | 003_production_lifecycle.sql                  | Yes      | No    |
| 8   | `activity_assets`                | 9       | 012_production_consolidation.sql              | No       | No    |
| 9   | `activity_consumables`           | 9       | 012_production_consolidation.sql              | No       | No    |
| 10  | `activity_log`                   | 8       | 002_extended_schema.sql                       | Yes      | No    |
| 11  | `ai_report_queries`              | 10      | 034_v2_feature_gaps.sql                       | Yes      | No    |
| 12  | `anonymization_queue`            | 8       | 022_audit_remediation.sql                     | No       | No    |
| 13  | `api_tokens`                     | 17      | 018_user_lifecycle_identity.sql               | No       | No    |
| 14  | `approval_steps`                 | 16      | 006_workflow_documents.sql                    | Yes      | No    |
| 15  | `approval_workflows`             | 15      | 006_workflow_documents.sql                    | Yes      | No    |
| 16  | `approvals`                      | 14      | 001_initial_schema.sql                        | Yes      | No    |
| 17  | `asset_access_controls`          | 15      | 014_digital_asset_lifecycle.sql               | No       | No    |
| 18  | `asset_access_log`               | 10      | 014_digital_asset_lifecycle.sql               | No       | No    |
| 19  | `asset_assignments`              | 16      | 003_production_lifecycle.sql                  | Yes      | No    |
| 20  | `asset_certifications`           | 18      | 016_legal_compliance_finance_procurement.sql  | No       | No    |
| 21  | `asset_channel_deployments`      | 10      | 015_creative_brand_campaign.sql               | No       | No    |
| 22  | `asset_damage_reports`           | 22      | 019_asset_inventory_logistics_warehousing.sql | No       | No    |
| 23  | `asset_dependencies`             | 11      | 014_digital_asset_lifecycle.sql               | No       | No    |
| 24  | `asset_links`                    | 15      | 014_digital_asset_lifecycle.sql               | No       | No    |
| 25  | `asset_reconciliation_items`     | 26      | 020_live_event_operations.sql                 | No       | No    |
| 26  | `asset_retention_policies`       | 17      | 014_digital_asset_lifecycle.sql               | No       | No    |
| 27  | `asset_tag_assignments`          | 2       | 014_digital_asset_lifecycle.sql               | No       | No    |
| 28  | `asset_tags`                     | 7       | 014_digital_asset_lifecycle.sql               | No       | No    |
| 29  | `asset_versions`                 | 15      | 014_digital_asset_lifecycle.sql               | No       | No    |
| 30  | `assets`                         | 43      | 001_initial_schema.sql                        | Yes      | No    |
| 31  | `audit_count_items`              | 14      | 019_asset_inventory_logistics_warehousing.sql | No       | No    |
| 32  | `automation_executions`          | 11      | 034_v2_feature_gaps.sql                       | Yes      | No    |
| 33  | `automation_logs`                | 9       | 005_productive_features.sql                   | Yes      | No    |
| 34  | `automation_rules`               | 11      | 005_productive_features.sql                   | Yes      | No    |
| 35  | `automations`                    | 15      | 005_productive_features.sql                   | Yes      | No    |
| 36  | `bom_lines`                      | 18      | 021_integrated_production_lifecycle.sql       | No       | No    |
| 37  | `boms`                           | 21      | 021_integrated_production_lifecycle.sql       | No       | No    |
| 38  | `brand_guideline_sections`       | 11      | 015_creative_brand_campaign.sql               | No       | No    |
| 39  | `brand_guideline_versions`       | 7       | 015_creative_brand_campaign.sql               | No       | No    |
| 40  | `brand_guidelines`               | 13      | 015_creative_brand_campaign.sql               | Yes      | No    |
| 41  | `brand_kits`                     | 12      | 001_initial_schema.sql                        | Yes      | No    |
| 42  | `brands`                         | 26      | 029_role_based_rls.sql                        | Yes      | No    |
| 43  | `brief_pipeline`                 | 0       | 015_creative_brand_campaign.sql               | No       | Yes   |
| 44  | `brief_templates`                | 13      | 015_creative_brand_campaign.sql               | No       | No    |
| 45  | `budget_alerts`                  | 9       | 033_competitive_feature_gaps.sql              | Yes      | No    |
| 46  | `budget_approvals`               | 22      | 016_legal_compliance_finance_procurement.sql  | Yes      | No    |
| 47  | `budget_line_items`              | 20      | 002_extended_schema.sql                       | Yes      | No    |
| 48  | `budgets`                        | 20      | 003_production_lifecycle.sql                  | Yes      | No    |
| 49  | `calendar_events`                | 13      | 001_initial_schema.sql                        | Yes      | No    |
| 50  | `call_sheet_crew`                | 15      | 006_workflow_documents.sql                    | Yes      | No    |
| 51  | `call_sheets`                    | 35      | 006_workflow_documents.sql                    | Yes      | No    |
| 52  | `campaign_assets`                | 21      | 015_creative_brand_campaign.sql               | Yes      | No    |
| 53  | `campaign_channels`              | 12      | 015_creative_brand_campaign.sql               | No       | No    |
| 54  | `campaign_kpis`                  | 13      | 015_creative_brand_campaign.sql               | No       | No    |
| 55  | `campaign_metrics`               | 9       | 015_creative_brand_campaign.sql               | No       | No    |
| 56  | `campaign_overview`              | 0       | 015_creative_brand_campaign.sql               | No       | Yes   |
| 57  | `campaigns`                      | 29      | 015_creative_brand_campaign.sql               | Yes      | No    |
| 58  | `case_studies`                   | 20      | 001_initial_schema.sql                        | Yes      | No    |
| 59  | `case_study_metrics`             | 5       | 001_initial_schema.sql                        | No       | No    |
| 60  | `certifications`                 | 8       | 001_initial_schema.sql                        | Yes      | No    |
| 61  | `change_order_log`               | 11      | 013_crm_revenue_pipeline.sql                  | No       | No    |
| 62  | `change_orders`                  | 32      | 013_crm_revenue_pipeline.sql                  | Yes      | No    |
| 63  | `checklist_templates`            | 12      | 008_vendor_contractor_lifecycle.sql           | No       | No    |
| 64  | `classification_assessments`     | 18      | 011_unified_workforce.sql                     | No       | No    |
| 65  | `client_invoices`                | 38      | 007_sow_lifecycle.sql                         | Yes      | No    |
| 66  | `comm_channels`                  | 13      | 020_live_event_operations.sql                 | No       | No    |
| 67  | `comm_log_entries`               | 14      | 020_live_event_operations.sql                 | No       | No    |
| 68  | `command_positions`              | 15      | 020_live_event_operations.sql                 | No       | No    |
| 69  | `comments`                       | 10      | 002_extended_schema.sql                       | Yes      | No    |
| 70  | `companies`                      | 36      | 005_productive_features.sql                   | Yes      | No    |
| 71  | `compliance_checklists`          | 23      | 016_legal_compliance_finance_procurement.sql  | Yes      | No    |
| 72  | `compliance_requirements`        | 16      | 008_vendor_contractor_lifecycle.sql           | No       | No    |
| 73  | `compliance_templates`           | 17      | 011_unified_workforce.sql                     | No       | No    |
| 74  | `consumable_usage`               | 9       | 003_production_lifecycle.sql                  | Yes      | No    |
| 75  | `consumables`                    | 23      | 003_production_lifecycle.sql                  | Yes      | No    |
| 76  | `contacts`                       | 25      | 005_productive_features.sql                   | Yes      | No    |
| 77  | `contract_amendments`            | 25      | 016_legal_compliance_finance_procurement.sql  | No       | No    |
| 78  | `contract_clauses`               | 17      | 016_legal_compliance_finance_procurement.sql  | No       | No    |
| 79  | `contract_obligations`           | 21      | 016_legal_compliance_finance_procurement.sql  | Yes      | No    |
| 80  | `contracts`                      | 24      | 003_production_lifecycle.sql                  | Yes      | No    |
| 81  | `creative_briefs`                | 42      | 015_creative_brand_campaign.sql               | No       | No    |
| 82  | `creative_reviews`               | 12      | 015_creative_brand_campaign.sql               | No       | No    |
| 83  | `credit_notes`                   | 13      | 005_productive_features.sql                   | Yes      | No    |
| 84  | `crew_availability`              | 9       | 003_production_lifecycle.sql                  | Yes      | No    |
| 85  | `crew_members`                   | 35      | 001_initial_schema.sql                        | Yes      | No    |
| 86  | `crew_shifts`                    | 28      | 003_production_lifecycle.sql                  | Yes      | No    |
| 87  | `custom_field_definitions`       | 15      | 034_v2_feature_gaps.sql                       | Yes      | No    |
| 88  | `custom_field_values`            | 14      | 005_productive_features.sql                   | Yes      | No    |
| 89  | `custom_fields`                  | 18      | 005_productive_features.sql                   | Yes      | No    |
| 90  | `dashboard_widgets`              | 15      | 005_productive_features.sql                   | Yes      | No    |
| 91  | `dashboards`                     | 11      | 005_productive_features.sql                   | Yes      | No    |
| 92  | `data_export_requests`           | 11      | 022_audit_remediation.sql                     | No       | No    |
| 93  | `data_retention_policies`        | 12      | 018_user_lifecycle_identity.sql               | No       | No    |
| 94  | `deals`                          | 26      | 001_initial_schema.sql                        | Yes      | No    |
| 95  | `deck_slides`                    | 8       | 001_initial_schema.sql                        | No       | No    |
| 96  | `decks`                          | 8       | 001_initial_schema.sql                        | Yes      | No    |
| 97  | `deliverable_progress_snapshots` | 13      | 007_sow_lifecycle.sql                         | Yes      | No    |
| 98  | `department_statuses`            | 15      | 020_live_event_operations.sql                 | No       | No    |
| 99  | `depreciation_schedules`         | 17      | 019_asset_inventory_logistics_warehousing.sql | No       | No    |
| 100 | `digital_assets`                 | 31      | 014_digital_asset_lifecycle.sql               | Yes      | No    |
| 101 | `dispatch_entries`               | 17      | 008_vendor_contractor_lifecycle.sql           | No       | No    |
| 102 | `document_templates`             | 12      | 005_productive_features.sql                   | Yes      | No    |
| 103 | `document_versions`              | 8       | 005_productive_features.sql                   | Yes      | No    |
| 104 | `documents`                      | 21      | 005_productive_features.sql                   | Yes      | No    |
| 105 | `domain_events`                  | 12      | 022_audit_remediation.sql                     | No       | No    |
| 106 | `e_signatures`                   | 18      | 006_workflow_documents.sql                    | Yes      | No    |
| 107 | `email_messages`                 | 19      | 034_v2_feature_gaps.sql                       | Yes      | No    |
| 108 | `engagement_terms`               | 23      | 011_unified_workforce.sql                     | No       | No    |
| 109 | `engineering_approvals`          | 26      | 016_legal_compliance_finance_procurement.sql  | Yes      | No    |
| 110 | `entity_dependencies`            | 18      | 016_legal_compliance_finance_procurement.sql  | No       | No    |
| 111 | `environmental_readings`         | 20      | 020_live_event_operations.sql                 | No       | No    |
| 112 | `equipment_check_ins`            | 21      | 020_live_event_operations.sql                 | No       | No    |
| 113 | `estimates`                      | 35      | 008_vendor_contractor_lifecycle.sql           | Yes      | No    |
| 114 | `event_assets`                   | 12      | 012_production_consolidation.sql              | No       | No    |
| 115 | `event_space_overlays`           | 16      | 017_location_spatial_hierarchy.sql            | No       | No    |
| 116 | `events`                         | 27      | 003_production_lifecycle.sql                  | Yes      | No    |
| 117 | `exchange_rates`                 | 8       | 022_audit_remediation.sql                     | No       | No    |
| 118 | `expenses`                       | 13      | 002_extended_schema.sql                       | Yes      | No    |
| 119 | `feature_flag_overrides`         | 10      | 027_feature_flags.sql                         | Yes      | No    |
| 120 | `feature_flags`                  | 19      | 027_feature_flags.sql                         | Yes      | No    |
| 121 | `field_access_overrides`         | 14      | 031_field_level_rbac_pricing.sql              | Yes      | No    |
| 122 | `field_bundle_items`             | 4       | 031_field_level_rbac_pricing.sql              | No       | No    |
| 123 | `field_bundles`                  | 9       | 031_field_level_rbac_pricing.sql              | Yes      | No    |
| 124 | `field_role_access`              | 11      | 031_field_level_rbac_pricing.sql              | Yes      | No    |
| 125 | `field_tier_assignments`         | 8       | 031_field_level_rbac_pricing.sql              | Yes      | No    |
| 126 | `field_usage_daily`              | 8       | 031_field_level_rbac_pricing.sql              | Yes      | No    |
| 127 | `field_usage_events`             | 9       | 031_field_level_rbac_pricing.sql              | Yes      | No    |
| 128 | `financial_periods`              | 11      | 022_audit_remediation.sql                     | No       | No    |
| 129 | `foh_zone_readings`              | 16      | 020_live_event_operations.sql                 | No       | No    |
| 130 | `foh_zones`                      | 12      | 020_live_event_operations.sql                 | No       | No    |
| 131 | `gl_accounts`                    | 14      | 016_legal_compliance_finance_procurement.sql  | Yes      | No    |
| 132 | `goals`                          | 16      | 033_competitive_feature_gaps.sql              | Yes      | No    |
| 133 | `goods_receipt_lines`            | 14      | 022_audit_remediation.sql                     | No       | No    |
| 134 | `goods_receipts`                 | 20      | 016_legal_compliance_finance_procurement.sql  | Yes      | No    |
| 135 | `governance_audit_log`           | 15      | 016_legal_compliance_finance_procurement.sql  | No       | No    |
| 136 | `guest_incidents`                | 21      | 020_live_event_operations.sql                 | No       | No    |
| 137 | `idempotency_keys`               | 7       | 022_audit_remediation.sql                     | No       | No    |
| 138 | `incident_insurance_links`       | 11      | 022_audit_remediation.sql                     | No       | No    |
| 139 | `incidents`                      | 47      | 003_production_lifecycle.sql                  | Yes      | No    |
| 140 | `insurance_policies`             | 28      | 016_legal_compliance_finance_procurement.sql  | Yes      | No    |
| 141 | `insurance_requirements`         | 16      | 016_legal_compliance_finance_procurement.sql  | No       | No    |
| 142 | `integrations`                   | 9       | 002_extended_schema.sql                       | Yes      | No    |
| 143 | `inventory_audits`               | 19      | 019_asset_inventory_logistics_warehousing.sql | No       | No    |
| 144 | `inventory_reservations`         | 16      | 019_asset_inventory_logistics_warehousing.sql | No       | No    |
| 145 | `invitations`                    | 16      | 018_user_lifecycle_identity.sql               | Yes      | No    |
| 146 | `invoice_line_items`             | 20      | 007_sow_lifecycle.sql                         | Yes      | No    |
| 147 | `invoice_templates`              | 19      | 005_productive_features.sql                   | Yes      | No    |
| 148 | `invoice_time_entries`           | 8       | 007_sow_lifecycle.sql                         | Yes      | No    |
| 149 | `invoices`                       | 20      | 001_initial_schema.sql                        | Yes      | No    |
| 150 | `ip_rights`                      | 23      | 016_legal_compliance_finance_procurement.sql  | Yes      | No    |
| 151 | `job_checklists`                 | 18      | 008_vendor_contractor_lifecycle.sql           | No       | No    |
| 152 | `job_cost_entries`               | 22      | 008_vendor_contractor_lifecycle.sql           | Yes      | No    |
| 153 | `kit_items`                      | 10      | 019_asset_inventory_logistics_warehousing.sql | No       | No    |
| 154 | `kits`                           | 15      | 019_asset_inventory_logistics_warehousing.sql | No       | No    |
| 155 | `knowledge_article_links`        | 6       | 033_competitive_feature_gaps.sql              | Yes      | No    |
| 156 | `knowledge_articles`             | 12      | 033_competitive_feature_gaps.sql              | Yes      | No    |
| 157 | `knowledge_base_articles`        | 24      | 003_production_lifecycle.sql                  | Yes      | No    |
| 158 | `lead_activities`                | 7       | 004_crm_public.sql                            | Yes      | No    |
| 159 | `lead_pipeline_stats`            | 0       | 004_crm_public.sql                            | Yes      | Yes   |
| 160 | `leads`                          | 28      | 004_crm_public.sql                            | Yes      | No    |
| 161 | `legal_holds`                    | 15      | 014_digital_asset_lifecycle.sql               | No       | No    |
| 162 | `live_crew_assignments`          | 22      | 020_live_event_operations.sql                 | No       | No    |
| 163 | `live_event_instances`           | 32      | 020_live_event_operations.sql                 | No       | No    |
| 164 | `live_financial_snapshots`       | 23      | 020_live_event_operations.sql                 | No       | No    |
| 165 | `load_plan_items`                | 6       | 019_asset_inventory_logistics_warehousing.sql | No       | No    |
| 166 | `load_plans`                     | 17      | 019_asset_inventory_logistics_warehousing.sql | No       | No    |
| 167 | `location_compliance_docs`       | 14      | 017_location_spatial_hierarchy.sql            | No       | No    |
| 168 | `location_contacts`              | 8       | 017_location_spatial_hierarchy.sql            | No       | No    |
| 169 | `location_costs`                 | 17      | 017_location_spatial_hierarchy.sql            | No       | No    |
| 170 | `location_inspections`           | 17      | 017_location_spatial_hierarchy.sql            | No       | No    |
| 171 | `locations`                      | 62      | 003_production_lifecycle.sql                  | Yes      | No    |
| 172 | `login_audit_log`                | 15      | 018_user_lifecycle_identity.sql               | Yes      | No    |
| 173 | `logistics_events`               | 11      | 019_asset_inventory_logistics_warehousing.sql | No       | No    |
| 174 | `lost_reasons`                   | 6       | 005_productive_features.sql                   | Yes      | No    |
| 175 | `maintenance_records`            | 19      | 003_production_lifecycle.sql                  | Yes      | No    |
| 176 | `maintenance_schedules`          | 18      | 019_asset_inventory_logistics_warehousing.sql | No       | No    |
| 177 | `milestones`                     | 23      | 002_extended_schema.sql                       | Yes      | No    |
| 178 | `notification_preferences`       | 20      | 006_workflow_documents.sql                    | Yes      | No    |
| 179 | `notifications`                  | 15      | 001_initial_schema.sql                        | Yes      | No    |
| 180 | `offboarding_step_progress`      | 11      | 011_unified_workforce.sql                     | No       | No    |
| 181 | `offboarding_step_templates`     | 12      | 011_unified_workforce.sql                     | No       | No    |
| 182 | `onboarding_step_definitions`    | 11      | 018_user_lifecycle_identity.sql               | Yes      | No    |
| 183 | `onboarding_step_progress`       | 12      | 011_unified_workforce.sql                     | No       | No    |
| 184 | `onboarding_step_templates`      | 14      | 011_unified_workforce.sql                     | No       | No    |
| 185 | `opportunities`                  | 28      | 013_crm_revenue_pipeline.sql                  | Yes      | No    |
| 186 | `opportunity_activities`         | 13      | 013_crm_revenue_pipeline.sql                  | No       | No    |
| 187 | `org_bundle_subscriptions`       | 9       | 031_field_level_rbac_pricing.sql              | Yes      | No    |
| 188 | `org_memberships`                | 14      | 018_user_lifecycle_identity.sql               | Yes      | No    |
| 189 | `org_subscriptions`              | 13      | 031_field_level_rbac_pricing.sql              | Yes      | No    |
| 190 | `organizations`                  | 6       | 001_initial_schema.sql                        | Yes      | No    |
| 191 | `payment_approvals`              | 23      | 016_legal_compliance_finance_procurement.sql  | No       | No    |
| 192 | `payments`                       | 12      | 005_productive_features.sql                   | Yes      | No    |
| 193 | `payroll_batches`                | 15      | 003_production_lifecycle.sql                  | Yes      | No    |
| 194 | `permission_grants`              | 11      | 028_rbac_custom_roles.sql                     | Yes      | No    |
| 195 | `permits`                        | 36      | 016_legal_compliance_finance_procurement.sql  | Yes      | No    |
| 196 | `pipeline_forecast`              | 0       | 013_crm_revenue_pipeline.sql                  | No       | Yes   |
| 197 | `pipelines`                      | 14      | 005_productive_features.sql                   | Yes      | No    |
| 198 | `portal_sessions`                | 7       | 034_v2_feature_gaps.sql                       | No       | No    |
| 199 | `post_event_reports`             | 32      | 020_live_event_operations.sql                 | No       | No    |
| 200 | `production_budget_lines`        | 20      | 003_production_lifecycle.sql                  | No       | No    |
| 201 | `production_checklists`          | 18      | 003_production_lifecycle.sql                  | Yes      | No    |
| 202 | `production_expenses`            | 25      | 003_production_lifecycle.sql                  | Yes      | No    |
| 203 | `production_milestones`          | 21      | 003_production_lifecycle.sql                  | Yes      | No    |
| 204 | `production_milestones_view`     | 0       | 012_production_consolidation.sql              | No       | Yes   |
| 205 | `production_run_inputs`          | 13      | 021_integrated_production_lifecycle.sql       | No       | No    |
| 206 | `production_runs`                | 22      | 021_integrated_production_lifecycle.sql       | No       | No    |
| 207 | `production_sops`                | 23      | 003_production_lifecycle.sql                  | Yes      | No    |
| 208 | `production_tasks`               | 33      | 003_production_lifecycle.sql                  | Yes      | No    |
| 209 | `production_tasks_view`          | 0       | 012_production_consolidation.sql              | No       | Yes   |
| 210 | `production_time_entries`        | 29      | 003_production_lifecycle.sql                  | Yes      | No    |
| 211 | `production_verticals`           | 13      | 021_integrated_production_lifecycle.sql       | No       | No    |
| 212 | `profiles`                       | 8       | 001_initial_schema.sql                        | Yes      | No    |
| 213 | `project_assignments`            | 17      | 003_production_lifecycle.sql                  | Yes      | No    |
| 214 | `project_locations`              | 14      | 017_location_spatial_hierarchy.sql            | No       | No    |
| 215 | `project_members`                | 5       | 001_initial_schema.sql                        | No       | No    |
| 216 | `project_templates`              | 14      | 002_extended_schema.sql                       | Yes      | No    |
| 217 | `projects`                       | 21      | 001_initial_schema.sql                        | Yes      | No    |
| 218 | `proposal_items`                 | 15      | 005_productive_features.sql                   | Yes      | No    |
| 219 | `proposals`                      | 39      | 005_productive_features.sql                   | Yes      | No    |
| 220 | `purchase_order_items`           | 7       | 001_initial_schema.sql                        | No       | No    |
| 221 | `purchase_orders`                | 9       | 001_initial_schema.sql                        | Yes      | No    |
| 222 | `purchase_requisitions`          | 25      | 016_legal_compliance_finance_procurement.sql  | Yes      | No    |
| 223 | `qc_gates`                       | 21      | 021_integrated_production_lifecycle.sql       | No       | No    |
| 224 | `quality_check_templates`        | 9       | 033_competitive_feature_gaps.sql              | Yes      | No    |
| 225 | `quality_checks`                 | 13      | 033_competitive_feature_gaps.sql              | Yes      | No    |
| 226 | `rate_card_items`                | 15      | 005_productive_features.sql                   | Yes      | No    |
| 227 | `rate_cards`                     | 14      | 005_productive_features.sql                   | Yes      | No    |
| 228 | `readiness_gates`                | 18      | 020_live_event_operations.sql                 | No       | No    |
| 229 | `record_activity_log`            | 9       | 033_competitive_feature_gaps.sql              | Yes      | No    |
| 230 | `record_comments`                | 12      | 033_competitive_feature_gaps.sql              | Yes      | No    |
| 231 | `recurring_invoices`             | 21      | 005_productive_features.sql                   | Yes      | No    |
| 232 | `rental_agreement_lines`         | 15      | 021_integrated_production_lifecycle.sql       | No       | No    |
| 233 | `rental_agreements`              | 25      | 021_integrated_production_lifecycle.sql       | No       | No    |
| 234 | `report_definitions`             | 12      | 002_extended_schema.sql                       | Yes      | No    |
| 235 | `resilience_targets`             | 11      | 022_audit_remediation.sql                     | No       | No    |
| 236 | `resource_bookings`              | 22      | 005_productive_features.sql                   | Yes      | No    |
| 237 | `revenue_recognition_entries`    | 13      | 034_v2_feature_gaps.sql                       | Yes      | No    |
| 238 | `revenue_recognition_summary`    | 0       | 013_crm_revenue_pipeline.sql                  | No       | Yes   |
| 239 | `revenue_schedules`              | 23      | 013_crm_revenue_pipeline.sql                  | Yes      | No    |
| 240 | `review_cycles`                  | 11      | 033_competitive_feature_gaps.sql              | Yes      | No    |
| 241 | `review_feedback_requests`       | 13      | 033_competitive_feature_gaps.sql              | Yes      | No    |
| 242 | `review_stats`                   | 0       | 004_crm_public.sql                            | Yes      | Yes   |
| 243 | `reviews`                        | 17      | 004_crm_public.sql                            | Yes      | No    |
| 244 | `rfqs`                           | 22      | 003_production_lifecycle.sql                  | Yes      | No    |
| 245 | `rights_licenses`                | 25      | 021_integrated_production_lifecycle.sql       | No       | No    |
| 246 | `role_change_log`                | 11      | 018_user_lifecycle_identity.sql               | No       | No    |
| 247 | `role_definitions`               | 11      | 028_rbac_custom_roles.sql                     | Yes      | No    |
| 248 | `ros_cues`                       | 25      | 020_live_event_operations.sql                 | No       | No    |
| 249 | `saved_views`                    | 19      | 005_productive_features.sql                   | Yes      | No    |
| 250 | `scan_events`                    | 15      | 019_asset_inventory_logistics_warehousing.sql | No       | No    |
| 251 | `scenario_outcomes`              | 12      | 009_scenario_builder.sql                      | No       | No    |
| 252 | `scenario_resource_plans`        | 12      | 009_scenario_builder.sql                      | No       | No    |
| 253 | `scenario_variables`             | 12      | 009_scenario_builder.sql                      | No       | No    |
| 254 | `scenarios`                      | 14      | 009_scenario_builder.sql                      | No       | No    |
| 255 | `schedule_entries`               | 24      | 003_production_lifecycle.sql                  | Yes      | No    |
| 256 | `scopes_of_work`                 | 36      | 007_sow_lifecycle.sql                         | Yes      | No    |
| 257 | `service_requests`               | 41      | 010_service_requests.sql                      | Yes      | No    |
| 258 | `setting_definitions`            | 18      | 026_settings_framework.sql                    | Yes      | No    |
| 259 | `settings`                       | 16      | 026_settings_framework.sql                    | Yes      | No    |
| 260 | `settings_change_log`            | 11      | 026_settings_framework.sql                    | Yes      | No    |
| 261 | `settings_change_requests`       | 17      | 035_settings_approval_workflow.sql            | Yes      | No    |
| 262 | `shifts`                         | 10      | 001_initial_schema.sql                        | Yes      | No    |
| 263 | `shipment_items`                 | 19      | 019_asset_inventory_logistics_warehousing.sql | No       | No    |
| 264 | `shipments`                      | 42      | 003_production_lifecycle.sql                  | Yes      | No    |
| 265 | `sla_definitions`                | 10      | 022_audit_remediation.sql                     | No       | No    |
| 266 | `sla_policies`                   | 13      | 034_v2_feature_gaps.sql                       | Yes      | No    |
| 267 | `sla_tracking`                   | 11      | 022_audit_remediation.sql                     | No       | No    |
| 268 | `sop_acknowledgments`            | 4       | 001_initial_schema.sql                        | No       | No    |
| 269 | `sops`                           | 8       | 001_initial_schema.sql                        | Yes      | No    |
| 270 | `sow_change_log`                 | 12      | 007_sow_lifecycle.sql                         | Yes      | No    |
| 271 | `sow_deliverables`               | 33      | 007_sow_lifecycle.sql                         | Yes      | No    |
| 272 | `space_bookings`                 | 19      | 017_location_spatial_hierarchy.sql            | No       | No    |
| 273 | `stakeholder_projects`           | 4       | 001_initial_schema.sql                        | Yes      | No    |
| 274 | `stakeholders`                   | 10      | 001_initial_schema.sql                        | Yes      | No    |
| 275 | `storage_objects`                | 18      | 014_digital_asset_lifecycle.sql               | No       | No    |
| 276 | `strike_sequences`               | 22      | 020_live_event_operations.sql                 | No       | No    |
| 277 | `survey_responses`               | 14      | 034_v2_feature_gaps.sql                       | Yes      | No    |
| 278 | `survey_templates`               | 11      | 034_v2_feature_gaps.sql                       | Yes      | No    |
| 279 | `task_dependencies`              | 4       | 001_initial_schema.sql                        | No       | No    |
| 280 | `tasks`                          | 37      | 001_initial_schema.sql                        | Yes      | No    |
| 281 | `tech_sheets`                    | 47      | 006_workflow_documents.sql                    | Yes      | No    |
| 282 | `technical_specs`                | 14      | 021_integrated_production_lifecycle.sql       | No       | No    |
| 283 | `temporary_access_grants`        | 16      | 018_user_lifecycle_identity.sql               | No       | No    |
| 284 | `testimonials`                   | 21      | 004_crm_public.sql                            | Yes      | No    |
| 285 | `time_entries`                   | 15      | 002_extended_schema.sql                       | Yes      | No    |
| 286 | `time_off_requests`              | 17      | 005_productive_features.sql                   | Yes      | No    |
| 287 | `time_tracking_policies`         | 14      | 034_v2_feature_gaps.sql                       | Yes      | No    |
| 288 | `upsell_events`                  | 8       | 031_field_level_rbac_pricing.sql              | No       | No    |
| 289 | `upsell_triggers`                | 11      | 031_field_level_rbac_pricing.sql              | No       | No    |
| 290 | `user_compliance_acks`           | 10      | 018_user_lifecycle_identity.sql               | No       | No    |
| 291 | `user_onboarding_progress`       | 9       | 018_user_lifecycle_identity.sql               | Yes      | No    |
| 292 | `user_preferences`               | 6       | 018_user_lifecycle_identity.sql               | No       | No    |
| 293 | `user_profiles`                  | 19      | 018_user_lifecycle_identity.sql               | Yes      | No    |
| 294 | `user_profiles_with_org`         | 0       | 018_user_lifecycle_identity.sql               | No       | Yes   |
| 295 | `user_sessions`                  | 16      | 018_user_lifecycle_identity.sql               | Yes      | No    |
| 296 | `v_budget_profitability`         | 0       | 033_competitive_feature_gaps.sql              | Yes      | Yes   |
| 297 | `v_client_invoice_aging`         | 0       | 007_sow_lifecycle.sql                         | Yes      | Yes   |
| 298 | `v_crew_utilization`             | 0       | 005_productive_features.sql                   | Yes      | Yes   |
| 299 | `v_invoice_aging`                | 0       | 005_productive_features.sql                   | Yes      | Yes   |
| 300 | `v_location_compliance_summary`  | 0       | 017_location_spatial_hierarchy.sql            | No       | Yes   |
| 301 | `v_location_hierarchy`           | 0       | 017_location_spatial_hierarchy.sql            | No       | Yes   |
| 302 | `v_location_profitability`       | 0       | 017_location_spatial_hierarchy.sql            | No       | Yes   |
| 303 | `v_pipeline_summary`             | 0       | 005_productive_features.sql                   | Yes      | Yes   |
| 304 | `v_project_production_summary`   | 0       | 021_integrated_production_lifecycle.sql       | No       | Yes   |
| 305 | `v_project_profitability`        | 0       | 005_productive_features.sql                   | Yes      | Yes   |
| 306 | `v_revenue_recognition_summary`  | 0       | 034_v2_feature_gaps.sql                       | Yes      | Yes   |
| 307 | `v_sla_status`                   | 0       | 034_v2_feature_gaps.sql                       | Yes      | Yes   |
| 308 | `v_sow_deliverable_summary`      | 0       | 007_sow_lifecycle.sql                         | Yes      | Yes   |
| 309 | `v_sow_summary`                  | 0       | 007_sow_lifecycle.sql                         | No       | Yes   |
| 310 | `v_time_tracking_compliance`     | 0       | 034_v2_feature_gaps.sql                       | Yes      | Yes   |
| 311 | `v_vertical_budget_summary`      | 0       | 021_integrated_production_lifecycle.sql       | No       | Yes   |
| 312 | `v_work_package_cost_summary`    | 0       | 021_integrated_production_lifecycle.sql       | No       | Yes   |
| 313 | `vault_documents`                | 14      | 001_initial_schema.sql                        | Yes      | No    |
| 314 | `vehicles`                       | 23      | 001_initial_schema.sql                        | Yes      | No    |
| 315 | `vendor_communications`          | 14      | 008_vendor_contractor_lifecycle.sql           | No       | No    |
| 316 | `vendor_compliance_docs`         | 22      | 008_vendor_contractor_lifecycle.sql           | No       | No    |
| 317 | `vendor_portal_tokens`           | 10      | 008_vendor_contractor_lifecycle.sql           | No       | No    |
| 318 | `vendor_reviews`                 | 21      | 008_vendor_contractor_lifecycle.sql           | Yes      | No    |
| 319 | `vendor_risk_scores`             | 19      | 016_legal_compliance_finance_procurement.sql  | No       | No    |
| 320 | `vendor_vertical_capabilities`   | 6       | 021_integrated_production_lifecycle.sql       | No       | No    |
| 321 | `vendors`                        | 36      | 001_initial_schema.sql                        | Yes      | No    |
| 322 | `vip_guests`                     | 20      | 020_live_event_operations.sql                 | No       | No    |
| 323 | `vip_service_requests`           | 15      | 020_live_event_operations.sql                 | No       | No    |
| 324 | `warehouse_locations`            | 16      | 019_asset_inventory_logistics_warehousing.sql | No       | No    |
| 325 | `warehouse_zones`                | 17      | 019_asset_inventory_logistics_warehousing.sql | No       | No    |
| 326 | `warehouses`                     | 27      | 003_production_lifecycle.sql                  | Yes      | No    |
| 327 | `work_order_bids`                | 15      | 008_vendor_contractor_lifecycle.sql           | No       | No    |
| 328 | `work_orders`                    | 40      | 008_vendor_contractor_lifecycle.sql           | Yes      | No    |
| 329 | `work_package_dependencies`      | 8       | 021_integrated_production_lifecycle.sql       | No       | No    |
| 330 | `work_packages`                  | 34      | 021_integrated_production_lifecycle.sql       | No       | No    |
| 331 | `worker_classifications`         | 39      | 011_unified_workforce.sql                     | No       | No    |
| 332 | `worker_compliance_docs`         | 22      | 011_unified_workforce.sql                     | No       | No    |
| 333 | `worker_offboarding_runs`        | 18      | 011_unified_workforce.sql                     | No       | No    |
| 334 | `worker_onboarding_runs`         | 14      | 011_unified_workforce.sql                     | No       | No    |
| 335 | `worker_profiles`                | 39      | 011_unified_workforce.sql                     | Yes      | No    |
| 336 | `worker_reviews`                 | 28      | 011_unified_workforce.sql                     | No       | No    |
| 337 | `workflow_instances`             | 16      | 006_workflow_documents.sql                    | Yes      | No    |
| 338 | `workflow_step_approvals`        | 13      | 006_workflow_documents.sql                    | Yes      | No    |

## Appendix B: Query Coverage by Table

| Table                            | select | insert | update | upsert | delete | Total |
| -------------------------------- | ------ | ------ | ------ | ------ | ------ | ----- |
| `access_audit_log`               | 0      | 1      | 0      | 1      | 0      | 2     |
| `activations`                    | 0      | 2      | 0      | 0      | 0      | 2     |
| `active_timers`                  | 0      | 2      | 0      | 0      | 2      | 4     |
| `activities`                     | 0      | 2      | 1      | 0      | 0      | 3     |
| `activity_log`                   | 1      | 1      | 0      | 0      | 0      | 2     |
| `ai_report_queries`              | 0      | 2      | 0      | 0      | 0      | 2     |
| `approval_steps`                 | 0      | 2      | 0      | 0      | 0      | 2     |
| `approval_workflows`             | 0      | 4      | 0      | 0      | 0      | 4     |
| `approvals`                      | 0      | 0      | 2      | 0      | 0      | 2     |
| `asset_assignments`              | 0      | 2      | 0      | 0      | 0      | 2     |
| `assets`                         | 0      | 3      | 0      | 0      | 0      | 3     |
| `automation_executions`          | 0      | 3      | 0      | 0      | 0      | 3     |
| `automation_logs`                | 0      | 1      | 0      | 0      | 0      | 1     |
| `automation_rules`               | 0      | 1      | 0      | 0      | 0      | 1     |
| `automations`                    | 0      | 5      | 0      | 0      | 0      | 5     |
| `brand_guidelines`               | 1      | 0      | 0      | 0      | 0      | 1     |
| `brand_kits`                     | 1      | 0      | 0      | 0      | 0      | 1     |
| `brands`                         | 0      | 0      | 1      | 0      | 0      | 1     |
| `briefs`                         | 0      | 2      | 0      | 0      | 0      | 2     |
| `budget_alerts`                  | 0      | 1      | 1      | 0      | 0      | 2     |
| `budget_approvals`               | 1      | 0      | 0      | 0      | 0      | 1     |
| `budget_line_items`              | 0      | 2      | 0      | 0      | 0      | 2     |
| `budgets`                        | 0      | 2      | 0      | 0      | 0      | 2     |
| `calendar_events`                | 0      | 2      | 0      | 0      | 0      | 2     |
| `call_sheet_crew`                | 0      | 1      | 0      | 0      | 0      | 1     |
| `call_sheets`                    | 0      | 5      | 1      | 0      | 0      | 6     |
| `campaign_assets`                | 1      | 0      | 0      | 0      | 0      | 1     |
| `campaigns`                      | 0      | 2      | 0      | 0      | 0      | 2     |
| `case_studies`                   | 0      | 0      | 1      | 0      | 0      | 1     |
| `certifications`                 | 0      | 1      | 0      | 0      | 0      | 1     |
| `change_orders`                  | 0      | 2      | 0      | 0      | 0      | 2     |
| `checklists`                     | 1      | 0      | 0      | 0      | 0      | 1     |
| `clause_library`                 | 1      | 0      | 0      | 0      | 0      | 1     |
| `client_invoices`                | 0      | 6      | 0      | 0      | 0      | 6     |
| `comments`                       | 0      | 2      | 0      | 0      | 0      | 2     |
| `companies`                      | 0      | 4      | 1      | 0      | 0      | 5     |
| `compliance_checklists`          | 0      | 1      | 0      | 0      | 0      | 1     |
| `consumable_usage`               | 0      | 2      | 0      | 0      | 0      | 2     |
| `consumables`                    | 1      | 3      | 0      | 0      | 0      | 4     |
| `contacts`                       | 0      | 4      | 0      | 0      | 0      | 4     |
| `contract_obligations`           | 1      | 0      | 0      | 0      | 0      | 1     |
| `contracts`                      | 1      | 1      | 0      | 0      | 0      | 2     |
| `credit_notes`                   | 1      | 3      | 0      | 0      | 0      | 4     |
| `crew_availability`              | 0      | 1      | 0      | 0      | 0      | 1     |
| `crew_members`                   | 0      | 3      | 0      | 0      | 0      | 3     |
| `crew_shifts`                    | 0      | 2      | 0      | 0      | 0      | 2     |
| `custom_field_definitions`       | 0      | 1      | 0      | 2      | 0      | 3     |
| `custom_field_values`            | 0      | 0      | 0      | 4      | 0      | 4     |
| `custom_fields`                  | 0      | 0      | 0      | 2      | 0      | 2     |
| `dashboard_widgets`              | 0      | 1      | 1      | 0      | 0      | 2     |
| `dashboards`                     | 0      | 3      | 0      | 0      | 0      | 3     |
| `deals`                          | 0      | 4      | 0      | 0      | 0      | 4     |
| `decks`                          | 1      | 0      | 0      | 0      | 0      | 1     |
| `deliverable_progress_snapshots` | 0      | 2      | 0      | 0      | 0      | 2     |
| `digital_assets`                 | 0      | 2      | 0      | 0      | 0      | 2     |
| `document_templates`             | 1      | 3      | 0      | 0      | 0      | 4     |
| `document_versions`              | 0      | 2      | 0      | 0      | 0      | 2     |
| `documents`                      | 0      | 4      | 0      | 0      | 0      | 4     |
| `e_signatures`                   | 1      | 0      | 0      | 2      | 0      | 3     |
| `email_messages`                 | 0      | 2      | 0      | 0      | 0      | 2     |
| `engineering_approvals`          | 1      | 0      | 0      | 0      | 0      | 1     |
| `estimates`                      | 0      | 2      | 0      | 0      | 0      | 2     |
| `events`                         | 0      | 2      | 0      | 0      | 0      | 2     |
| `expense_reports`                | 1      | 0      | 0      | 0      | 0      | 1     |
| `expenses`                       | 0      | 2      | 0      | 0      | 0      | 2     |
| `feature_flag_overrides`         | 1      | 1      | 0      | 1      | 0      | 3     |
| `feature_flags`                  | 1      | 1      | 0      | 2      | 0      | 4     |
| `field_access_overrides`         | 1      | 0      | 0      | 0      | 0      | 1     |
| `field_bundles`                  | 1      | 0      | 0      | 0      | 0      | 1     |
| `field_role_access`              | 1      | 0      | 0      | 0      | 0      | 1     |
| `field_tier_assignments`         | 1      | 0      | 0      | 0      | 0      | 1     |
| `field_usage_daily`              | 1      | 0      | 0      | 0      | 0      | 1     |
| `field_usage_events`             | 0      | 1      | 0      | 0      | 0      | 1     |
| `gl_accounts`                    | 1      | 0      | 0      | 0      | 0      | 1     |
| `goals`                          | 0      | 2      | 1      | 0      | 0      | 3     |
| `goods_receipts`                 | 1      | 0      | 0      | 0      | 0      | 1     |
| `incidents`                      | 1      | 2      | 0      | 0      | 0      | 3     |
| `insurance_policies`             | 1      | 0      | 0      | 0      | 0      | 1     |
| `integrations`                   | 0      | 1      | 0      | 0      | 0      | 1     |
| `invitations`                    | 1      | 1      | 1      | 2      | 0      | 5     |
| `invoice_line_items`             | 0      | 3      | 1      | 0      | 0      | 4     |
| `invoice_templates`              | 0      | 3      | 0      | 0      | 0      | 3     |
| `invoice_time_entries`           | 0      | 2      | 0      | 0      | 0      | 2     |
| `invoices`                       | 0      | 1      | 1      | 0      | 0      | 2     |
| `ip_rights`                      | 1      | 0      | 0      | 0      | 0      | 1     |
| `job_cost_entries`               | 1      | 0      | 0      | 0      | 0      | 1     |
| `knowledge_article_links`        | 0      | 2      | 0      | 0      | 0      | 2     |
| `knowledge_articles`             | 0      | 4      | 0      | 0      | 0      | 4     |
| `knowledge_base_articles`        | 1      | 2      | 0      | 0      | 0      | 3     |
| `lead_activities`                | 0      | 1      | 0      | 0      | 0      | 1     |
| `lead_pipeline_stats`            | 1      | 0      | 0      | 0      | 0      | 1     |
| `leads`                          | 0      | 7      | 0      | 0      | 0      | 7     |
| `locations`                      | 0      | 4      | 0      | 0      | 0      | 4     |
| `login_audit_log`                | 1      | 2      | 0      | 0      | 0      | 3     |
| `lost_reasons`                   | 0      | 2      | 0      | 0      | 0      | 2     |
| `maintenance_records`            | 0      | 3      | 0      | 0      | 0      | 3     |
| `milestones`                     | 0      | 2      | 0      | 0      | 0      | 2     |
| `notification_preferences`       | 0      | 0      | 0      | 6      | 0      | 6     |
| `notifications`                  | 0      | 5      | 0      | 2      | 0      | 7     |
| `onboarding_step_definitions`    | 1      | 0      | 0      | 1      | 0      | 2     |
| `opportunities`                  | 1      | 0      | 0      | 0      | 0      | 1     |
| `org_bundle_subscriptions`       | 1      | 0      | 0      | 0      | 0      | 1     |
| `org_memberships`                | 8      | 4      | 1      | 5      | 0      | 18    |
| `org_subscriptions`              | 2      | 0      | 0      | 0      | 0      | 2     |
| `organizations`                  | 2      | 3      | 2      | 2      | 0      | 9     |
| `payments`                       | 1      | 2      | 0      | 0      | 0      | 3     |
| `payroll_batches`                | 1      | 3      | 0      | 0      | 0      | 4     |
| `permission_grants`              | 1      | 0      | 0      | 2      | 0      | 3     |
| `permits`                        | 1      | 0      | 0      | 0      | 0      | 1     |
| `pipelines`                      | 0      | 2      | 1      | 0      | 0      | 3     |
| `production_checklists`          | 1      | 0      | 0      | 0      | 0      | 1     |
| `production_expenses`            | 1      | 3      | 0      | 0      | 0      | 4     |
| `production_milestones`          | 0      | 1      | 0      | 0      | 0      | 1     |
| `production_sops`                | 1      | 0      | 0      | 0      | 0      | 1     |
| `production_tasks`               | 0      | 3      | 0      | 0      | 0      | 3     |
| `production_time_entries`        | 1      | 4      | 1      | 0      | 0      | 6     |
| `profiles`                       | 3      | 0      | 5      | 3      | 0      | 11    |
| `project_assignments`            | 0      | 3      | 1      | 0      | 0      | 4     |
| `project_templates`              | 0      | 5      | 0      | 0      | 0      | 5     |
| `projects`                       | 0      | 5      | 0      | 0      | 0      | 5     |
| `proposal_items`                 | 0      | 1      | 0      | 0      | 0      | 1     |
| `proposals`                      | 0      | 7      | 0      | 0      | 0      | 7     |
| `purchase_orders`                | 1      | 1      | 1      | 0      | 0      | 3     |
| `purchase_requisitions`          | 1      | 0      | 0      | 0      | 0      | 1     |
| `quality_check_templates`        | 0      | 1      | 0      | 0      | 0      | 1     |
| `quality_checks`                 | 0      | 2      | 0      | 0      | 0      | 2     |
| `rate_card_items`                | 0      | 1      | 0      | 0      | 0      | 1     |
| `rate_cards`                     | 1      | 3      | 0      | 0      | 0      | 4     |
| `record_activity_log`            | 1      | 0      | 0      | 0      | 0      | 1     |
| `record_comments`                | 0      | 2      | 0      | 0      | 0      | 2     |
| `recurring_invoices`             | 1      | 2      | 0      | 0      | 0      | 3     |
| `report_definitions`             | 0      | 3      | 0      | 0      | 0      | 3     |
| `resource_bookings`              | 0      | 4      | 0      | 0      | 0      | 4     |
| `revenue_recognition_entries`    | 0      | 1      | 0      | 1      | 0      | 2     |
| `revenue_schedules`              | 1      | 0      | 0      | 0      | 0      | 1     |
| `review_cycles`                  | 1      | 0      | 0      | 0      | 0      | 1     |
| `review_feedback_requests`       | 0      | 1      | 0      | 0      | 0      | 1     |
| `review_stats`                   | 1      | 0      | 0      | 0      | 0      | 1     |
| `reviews`                        | 1      | 0      | 0      | 0      | 0      | 1     |
| `rfqs`                           | 0      | 1      | 0      | 0      | 0      | 1     |
| `risk_assessments`               | 1      | 0      | 0      | 0      | 0      | 1     |
| `role_definitions`               | 0      | 1      | 0      | 2      | 0      | 3     |
| `saved_views`                    | 0      | 3      | 1      | 0      | 0      | 4     |
| `schedule_entries`               | 0      | 4      | 0      | 0      | 0      | 4     |
| `scopes_of_work`                 | 0      | 5      | 1      | 0      | 0      | 6     |
| `service_requests`               | 1      | 0      | 0      | 0      | 0      | 1     |
| `setting_definitions`            | 2      | 0      | 0      | 1      | 0      | 3     |
| `settings`                       | 2      | 0      | 1      | 4      | 0      | 7     |
| `settings_change_log`            | 0      | 2      | 0      | 0      | 0      | 2     |
| `settings_change_requests`       | 0      | 2      | 0      | 2      | 0      | 4     |
| `shifts`                         | 0      | 2      | 0      | 0      | 0      | 2     |
| `shipments`                      | 2      | 2      | 0      | 0      | 0      | 4     |
| `sla_policies`                   | 0      | 2      | 0      | 0      | 0      | 2     |
| `sops`                           | 0      | 1      | 0      | 0      | 0      | 1     |
| `sow_change_log`                 | 0      | 1      | 0      | 0      | 0      | 1     |
| `sow_deliverables`               | 0      | 3      | 1      | 0      | 1      | 5     |
| `stakeholder_projects`           | 0      | 2      | 0      | 0      | 1      | 3     |
| `stakeholders`                   | 1      | 1      | 1      | 0      | 0      | 3     |
| `survey_responses`               | 0      | 2      | 0      | 0      | 0      | 2     |
| `survey_templates`               | 0      | 2      | 0      | 0      | 0      | 2     |
| `tasks`                          | 0      | 4      | 0      | 0      | 0      | 4     |
| `tech_sheets`                    | 1      | 4      | 0      | 0      | 0      | 5     |
| `testimonials`                   | 0      | 3      | 0      | 0      | 0      | 3     |
| `time_entries`                   | 0      | 2      | 0      | 0      | 0      | 2     |
| `time_off_requests`              | 0      | 3      | 1      | 0      | 0      | 4     |
| `time_tracking_policies`         | 0      | 0      | 0      | 2      | 0      | 2     |
| `timesheets`                     | 1      | 0      | 0      | 0      | 0      | 1     |
| `user_onboarding_progress`       | 1      | 0      | 0      | 3      | 0      | 4     |
| `user_profiles`                  | 1      | 0      | 0      | 0      | 0      | 1     |
| `user_sessions`                  | 0      | 0      | 2      | 0      | 0      | 2     |
| `v_budget_profitability`         | 1      | 0      | 0      | 0      | 0      | 1     |
| `v_client_invoice_aging`         | 1      | 0      | 0      | 0      | 0      | 1     |
| `v_crew_utilization`             | 1      | 0      | 1      | 0      | 0      | 2     |
| `v_invoice_aging`                | 1      | 0      | 0      | 0      | 0      | 1     |
| `v_pipeline_summary`             | 1      | 0      | 0      | 0      | 0      | 1     |
| `v_project_profitability`        | 1      | 0      | 0      | 0      | 0      | 1     |
| `v_revenue_recognition_summary`  | 0      | 0      | 0      | 1      | 0      | 1     |
| `v_sla_status`                   | 0      | 1      | 0      | 0      | 0      | 1     |
| `v_sow_deliverable_summary`      | 1      | 0      | 0      | 0      | 0      | 1     |
| `v_time_tracking_compliance`     | 0      | 1      | 0      | 0      | 0      | 1     |
| `vault_documents`                | 1      | 1      | 0      | 0      | 0      | 2     |
| `vehicles`                       | 1      | 1      | 0      | 0      | 0      | 2     |
| `vendor_compliance_documents`    | 1      | 0      | 0      | 0      | 0      | 1     |
| `vendor_reviews`                 | 1      | 0      | 0      | 0      | 0      | 1     |
| `vendors`                        | 1      | 3      | 0      | 0      | 0      | 4     |
| `warehouses`                     | 1      | 1      | 0      | 0      | 0      | 2     |
| `work_orders`                    | 1      | 0      | 0      | 0      | 0      | 1     |
| `worker_profiles`                | 1      | 0      | 0      | 0      | 0      | 1     |
| `workflow_instances`             | 0      | 2      | 1      | 0      | 0      | 3     |
| `workflow_step_approvals`        | 0      | 1      | 0      | 0      | 0      | 1     |
| `workflows`                      | 1      | 0      | 0      | 0      | 0      | 1     |

## Verdict

**FAIL** — 397 error(s) found. See sections above for details.
