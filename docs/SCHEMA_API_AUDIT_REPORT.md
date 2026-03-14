# Schema-to-API Column Audit Report

> Generated: 2026-03-13T08:33:58.419Z

## Summary

| Metric                        | Count   |
| ----------------------------- | ------- |
| Total DB Tables (incl. views) | 375     |
| Total Tables (non-view)       | 348     |
| Total Columns                 | 5857    |
| Total Supabase Query Usages   | 355     |
| Unique Tables Queried         | 136     |
| **Errors**                    | **396** |
| Warnings                      | 0       |
| Info                          | 0       |

## Schema Tables Never Queried in App Code

These tables exist in migrations but no `.from()` call references them.
This may be expected (e.g., junction tables managed by triggers) or may indicate dead schema.

| Table                          | Migration                                     | Columns |
| ------------------------------ | --------------------------------------------- | ------- |
| `account_health_scores`        | 013_crm_revenue_pipeline.sql                  | 20      |
| `activation_assets`            | 012_production_consolidation.sql              | 12      |
| `activities`                   | 003_production_lifecycle.sql                  | 25      |
| `activity_assets`              | 012_production_consolidation.sql              | 9       |
| `activity_consumables`         | 012_production_consolidation.sql              | 9       |
| `activity_log`                 | 002_extended_schema.sql                       | 8       |
| `anonymization_queue`          | 022_audit_remediation.sql                     | 8       |
| `api_tokens`                   | 018_user_lifecycle_identity.sql               | 18      |
| `approvals`                    | 001_initial_schema.sql                        | 14      |
| `asset_access_controls`        | 014_digital_asset_lifecycle.sql               | 15      |
| `asset_access_log`             | 014_digital_asset_lifecycle.sql               | 10      |
| `asset_assignments`            | 003_production_lifecycle.sql                  | 16      |
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
| `assets`                       | 001_initial_schema.sql                        | 43      |
| `audit_count_items`            | 019_asset_inventory_logistics_warehousing.sql | 14      |
| `automation_logs`              | 005_productive_features.sql                   | 9       |
| `bom_lines`                    | 021_integrated_production_lifecycle.sql       | 18      |
| `boms`                         | 021_integrated_production_lifecycle.sql       | 21      |
| `brand_guideline_sections`     | 015_creative_brand_campaign.sql               | 11      |
| `brand_guideline_versions`     | 015_creative_brand_campaign.sql               | 7       |
| `brand_guidelines`             | 015_creative_brand_campaign.sql               | 13      |
| `brand_kits`                   | 001_initial_schema.sql                        | 12      |
| `brief_templates`              | 015_creative_brand_campaign.sql               | 13      |
| `budget_approvals`             | 016_legal_compliance_finance_procurement.sql  | 22      |
| `budget_line_items`            | 002_extended_schema.sql                       | 20      |
| `budgets`                      | 003_production_lifecycle.sql                  | 20      |
| `calendar_events`              | 001_initial_schema.sql                        | 13      |
| `campaign_assets`              | 015_creative_brand_campaign.sql               | 21      |
| `campaign_channels`            | 015_creative_brand_campaign.sql               | 12      |
| `campaign_kpis`                | 015_creative_brand_campaign.sql               | 13      |
| `campaign_metrics`             | 015_creative_brand_campaign.sql               | 9       |
| `campaigns`                    | 015_creative_brand_campaign.sql               | 29      |
| `case_studies`                 | 001_initial_schema.sql                        | 20      |
| `case_study_metrics`           | 001_initial_schema.sql                        | 5       |
| `catalog_modifier_options`     | 047_master_catalog.sql                        | 11      |
| `certifications`               | 001_initial_schema.sql                        | 8       |
| `change_order_log`             | 013_crm_revenue_pipeline.sql                  | 11      |
| `change_orders`                | 013_crm_revenue_pipeline.sql                  | 32      |
| `channel_templates`            | 046_messaging_foundation.sql                  | 10      |
| `checklist_templates`          | 008_vendor_contractor_lifecycle.sql           | 12      |
| `classification_assessments`   | 011_unified_workforce.sql                     | 18      |
| `comm_log_entries`             | 020_live_event_operations.sql                 | 14      |
| `command_positions`            | 020_live_event_operations.sql                 | 15      |
| `comments`                     | 002_extended_schema.sql                       | 10      |
| `compliance_checklists`        | 016_legal_compliance_finance_procurement.sql  | 23      |
| `compliance_requirements`      | 008_vendor_contractor_lifecycle.sql           | 16      |
| `compliance_templates`         | 011_unified_workforce.sql                     | 17      |
| `consumable_usage`             | 003_production_lifecycle.sql                  | 9       |
| `consumables`                  | 003_production_lifecycle.sql                  | 23      |
| `contract_amendments`          | 016_legal_compliance_finance_procurement.sql  | 25      |
| `contract_clauses`             | 016_legal_compliance_finance_procurement.sql  | 17      |
| `contract_obligations`         | 016_legal_compliance_finance_procurement.sql  | 21      |
| `contracts`                    | 003_production_lifecycle.sql                  | 24      |
| `creative_briefs`              | 015_creative_brand_campaign.sql               | 42      |
| `creative_reviews`             | 015_creative_brand_campaign.sql               | 12      |
| `credit_notes`                 | 005_productive_features.sql                   | 13      |
| `crew_availability`            | 003_production_lifecycle.sql                  | 9       |
| `crew_members`                 | 001_initial_schema.sql                        | 35      |
| `crew_shifts`                  | 003_production_lifecycle.sql                  | 28      |
| `data_export_requests`         | 022_audit_remediation.sql                     | 11      |
| `data_retention_policies`      | 018_user_lifecycle_identity.sql               | 10      |
| `deck_slides`                  | 001_initial_schema.sql                        | 8       |
| `decks`                        | 001_initial_schema.sql                        | 8       |
| `depreciation_schedules`       | 019_asset_inventory_logistics_warehousing.sql | 17      |
| `digital_assets`               | 014_digital_asset_lifecycle.sql               | 31      |
| `dispatch_entries`             | 008_vendor_contractor_lifecycle.sql           | 17      |
| `document_templates`           | 005_productive_features.sql                   | 12      |
| `domain_events`                | 022_audit_remediation.sql                     | 12      |
| `engagement_terms`             | 011_unified_workforce.sql                     | 23      |
| `engineering_approvals`        | 016_legal_compliance_finance_procurement.sql  | 26      |
| `entity_dependencies`          | 016_legal_compliance_finance_procurement.sql  | 18      |
| `estimates`                    | 008_vendor_contractor_lifecycle.sql           | 35      |
| `event_assets`                 | 012_production_consolidation.sql              | 12      |
| `event_space_overlays`         | 017_location_spatial_hierarchy.sql            | 16      |
| `events`                       | 003_production_lifecycle.sql                  | 27      |
| `exchange_rates`               | 022_audit_remediation.sql                     | 8       |
| `expenses`                     | 002_extended_schema.sql                       | 13      |
| `field_access_overrides`       | 031_field_level_rbac_pricing.sql              | 14      |
| `field_bundle_items`           | 031_field_level_rbac_pricing.sql              | 4       |
| `field_bundles`                | 031_field_level_rbac_pricing.sql              | 9       |
| `field_role_access`            | 031_field_level_rbac_pricing.sql              | 11      |
| `field_tier_assignments`       | 031_field_level_rbac_pricing.sql              | 8       |
| `field_usage_daily`            | 031_field_level_rbac_pricing.sql              | 8       |
| `field_usage_events`           | 031_field_level_rbac_pricing.sql              | 9       |
| `financial_periods`            | 022_audit_remediation.sql                     | 11      |
| `gl_accounts`                  | 016_legal_compliance_finance_procurement.sql  | 14      |
| `goods_receipt_lines`          | 022_audit_remediation.sql                     | 14      |
| `goods_receipts`               | 016_legal_compliance_finance_procurement.sql  | 20      |
| `governance_audit_log`         | 016_legal_compliance_finance_procurement.sql  | 15      |
| `idempotency_keys`             | 022_audit_remediation.sql                     | 7       |
| `incident_insurance_links`     | 022_audit_remediation.sql                     | 11      |
| `incidents`                    | 003_production_lifecycle.sql                  | 47      |
| `insurance_policies`           | 016_legal_compliance_finance_procurement.sql  | 28      |
| `insurance_requirements`       | 016_legal_compliance_finance_procurement.sql  | 16      |
| `integrations`                 | 002_extended_schema.sql                       | 9       |
| `inventory_audits`             | 019_asset_inventory_logistics_warehousing.sql | 19      |
| `inventory_reservations`       | 019_asset_inventory_logistics_warehousing.sql | 16      |
| `invitations`                  | 018_user_lifecycle_identity.sql               | 17      |
| `invoice_templates`            | 005_productive_features.sql                   | 19      |
| `ip_rights`                    | 016_legal_compliance_finance_procurement.sql  | 23      |
| `job_checklists`               | 008_vendor_contractor_lifecycle.sql           | 18      |
| `job_cost_entries`             | 008_vendor_contractor_lifecycle.sql           | 22      |
| `kit_items`                    | 019_asset_inventory_logistics_warehousing.sql | 10      |
| `kits`                         | 019_asset_inventory_logistics_warehousing.sql | 15      |
| `knowledge_base_articles`      | 003_production_lifecycle.sql                  | 24      |
| `legal_holds`                  | 014_digital_asset_lifecycle.sql               | 15      |
| `load_plan_items`              | 019_asset_inventory_logistics_warehousing.sql | 6       |
| `load_plans`                   | 019_asset_inventory_logistics_warehousing.sql | 17      |
| `location_compliance_docs`     | 017_location_spatial_hierarchy.sql            | 14      |
| `location_contacts`            | 017_location_spatial_hierarchy.sql            | 8       |
| `location_costs`               | 017_location_spatial_hierarchy.sql            | 17      |
| `location_inspections`         | 017_location_spatial_hierarchy.sql            | 17      |
| `locations`                    | 003_production_lifecycle.sql                  | 62      |
| `logistics_events`             | 019_asset_inventory_logistics_warehousing.sql | 11      |
| `lost_reasons`                 | 005_productive_features.sql                   | 6       |
| `maintenance_records`          | 003_production_lifecycle.sql                  | 19      |
| `maintenance_schedules`        | 019_asset_inventory_logistics_warehousing.sql | 18      |
| `message_reactions`            | 046_messaging_foundation.sql                  | 5       |
| `message_read_receipts`        | 046_messaging_foundation.sql                  | 3       |
| `messaging_escalation_rules`   | 050_messaging_production.sql                  | 10      |
| `milestones`                   | 002_extended_schema.sql                       | 23      |
| `offboarding_step_progress`    | 011_unified_workforce.sql                     | 11      |
| `offboarding_step_templates`   | 011_unified_workforce.sql                     | 12      |
| `onboarding_step_progress`     | 011_unified_workforce.sql                     | 12      |
| `onboarding_step_templates`    | 011_unified_workforce.sql                     | 14      |
| `opportunities`                | 013_crm_revenue_pipeline.sql                  | 28      |
| `opportunity_activities`       | 013_crm_revenue_pipeline.sql                  | 13      |
| `org_bundle_subscriptions`     | 031_field_level_rbac_pricing.sql              | 9       |
| `org_subscriptions`            | 031_field_level_rbac_pricing.sql              | 13      |
| `payment_approvals`            | 016_legal_compliance_finance_procurement.sql  | 23      |
| `payroll_batches`              | 003_production_lifecycle.sql                  | 15      |
| `permits`                      | 016_legal_compliance_finance_procurement.sql  | 36      |
| `portal_sessions`              | 034_v2_feature_gaps.sql                       | 7       |
| `pos_transaction_items`        | 055_external_sync_infrastructure.sql          | 11      |
| `production_budget_lines`      | 003_production_lifecycle.sql                  | 20      |
| `production_checklists`        | 003_production_lifecycle.sql                  | 18      |
| `production_expenses`          | 003_production_lifecycle.sql                  | 25      |
| `production_milestones`        | 003_production_lifecycle.sql                  | 21      |
| `production_run_inputs`        | 021_integrated_production_lifecycle.sql       | 13      |
| `production_runs`              | 021_integrated_production_lifecycle.sql       | 22      |
| `production_sops`              | 003_production_lifecycle.sql                  | 23      |
| `production_tasks`             | 003_production_lifecycle.sql                  | 33      |
| `production_verticals`         | 021_integrated_production_lifecycle.sql       | 13      |
| `project_assignments`          | 003_production_lifecycle.sql                  | 17      |
| `project_locations`            | 017_location_spatial_hierarchy.sql            | 14      |
| `project_members`              | 001_initial_schema.sql                        | 5       |
| `purchase_order_items`         | 001_initial_schema.sql                        | 7       |
| `purchase_orders`              | 001_initial_schema.sql                        | 9       |
| `purchase_requisitions`        | 016_legal_compliance_finance_procurement.sql  | 25      |
| `qc_gates`                     | 021_integrated_production_lifecycle.sql       | 21      |
| `released_usernames`           | 039_usernames_handles.sql                     | 6       |
| `rental_agreement_lines`       | 021_integrated_production_lifecycle.sql       | 15      |
| `rental_agreements`            | 021_integrated_production_lifecycle.sql       | 25      |
| `report_definitions`           | 002_extended_schema.sql                       | 12      |
| `reserved_usernames`           | 039_usernames_handles.sql                     | 3       |
| `resilience_targets`           | 022_audit_remediation.sql                     | 11      |
| `revenue_schedules`            | 013_crm_revenue_pipeline.sql                  | 23      |
| `rfqs`                         | 003_production_lifecycle.sql                  | 22      |
| `rights_licenses`              | 021_integrated_production_lifecycle.sql       | 25      |
| `role_change_log`              | 018_user_lifecycle_identity.sql               | 11      |
| `scan_events`                  | 019_asset_inventory_logistics_warehousing.sql | 15      |
| `scenario_outcomes`            | 009_scenario_builder.sql                      | 12      |
| `scenario_resource_plans`      | 009_scenario_builder.sql                      | 12      |
| `scenario_variables`           | 009_scenario_builder.sql                      | 12      |
| `schedule_entries`             | 003_production_lifecycle.sql                  | 24      |
| `service_health_checks`        | 055_service_health_checks.sql                 | 11      |
| `service_requests`             | 010_service_requests.sql                      | 41      |
| `settings_change_requests`     | 035_settings_approval_workflow.sql            | 17      |
| `shifts`                       | 001_initial_schema.sql                        | 10      |
| `shipment_items`               | 019_asset_inventory_logistics_warehousing.sql | 19      |
| `shipments`                    | 003_production_lifecycle.sql                  | 42      |
| `sla_definitions`              | 022_audit_remediation.sql                     | 10      |
| `sla_tracking`                 | 022_audit_remediation.sql                     | 11      |
| `sop_acknowledgments`          | 001_initial_schema.sql                        | 4       |
| `sops`                         | 001_initial_schema.sql                        | 8       |
| `space_bookings`               | 017_location_spatial_hierarchy.sql            | 19      |
| `stakeholder_projects`         | 001_initial_schema.sql                        | 4       |
| `stakeholders`                 | 001_initial_schema.sql                        | 10      |
| `storage_objects`              | 014_digital_asset_lifecycle.sql               | 18      |
| `task_dependencies`            | 001_initial_schema.sql                        | 4       |
| `tasks`                        | 001_initial_schema.sql                        | 37      |
| `technical_specs`              | 021_integrated_production_lifecycle.sql       | 14      |
| `temporary_access_grants`      | 018_user_lifecycle_identity.sql               | 16      |
| `tier_usage_counters`          | 057_four_tier_pricing.sql                     | 8       |
| `time_entries`                 | 002_extended_schema.sql                       | 15      |
| `upsell_events`                | 031_field_level_rbac_pricing.sql              | 8       |
| `upsell_triggers`              | 031_field_level_rbac_pricing.sql              | 11      |
| `user_compliance_acks`         | 018_user_lifecycle_identity.sql               | 10      |
| `user_preferences`             | 018_user_lifecycle_identity.sql               | 6       |
| `username_change_log`          | 039_usernames_handles.sql                     | 7       |
| `vault_documents`              | 001_initial_schema.sql                        | 14      |
| `vehicles`                     | 001_initial_schema.sql                        | 23      |
| `vendor_communications`        | 008_vendor_contractor_lifecycle.sql           | 14      |
| `vendor_compliance_docs`       | 008_vendor_contractor_lifecycle.sql           | 22      |
| `vendor_portal_tokens`         | 008_vendor_contractor_lifecycle.sql           | 10      |
| `vendor_reviews`               | 008_vendor_contractor_lifecycle.sql           | 21      |
| `vendor_risk_scores`           | 016_legal_compliance_finance_procurement.sql  | 19      |
| `vendor_vertical_capabilities` | 021_integrated_production_lifecycle.sql       | 6       |
| `vendors`                      | 001_initial_schema.sql                        | 36      |
| `vip_service_requests`         | 020_live_event_operations.sql                 | 15      |
| `warehouse_locations`          | 019_asset_inventory_logistics_warehousing.sql | 16      |
| `warehouse_zones`              | 019_asset_inventory_logistics_warehousing.sql | 17      |
| `warehouses`                   | 003_production_lifecycle.sql                  | 27      |
| `work_order_bids`              | 008_vendor_contractor_lifecycle.sql           | 15      |
| `work_orders`                  | 008_vendor_contractor_lifecycle.sql           | 40      |
| `work_package_dependencies`    | 021_integrated_production_lifecycle.sql       | 8       |
| `work_packages`                | 021_integrated_production_lifecycle.sql       | 34      |
| `worker_classifications`       | 011_unified_workforce.sql                     | 39      |
| `worker_compliance_docs`       | 011_unified_workforce.sql                     | 22      |
| `worker_offboarding_runs`      | 011_unified_workforce.sql                     | 18      |
| `worker_onboarding_runs`       | 011_unified_workforce.sql                     | 14      |
| `worker_profiles`              | 011_unified_workforce.sql                     | 39      |
| `worker_reviews`               | 011_unified_workforce.sql                     | 28      |

## ERRORS: Column Mismatches

Columns referenced in queries that do not exist in the target table's schema.

| Severity | Category              | Table                         | Column                        | File                                                 | Line | Message                                                                                              |
| -------- | --------------------- | ----------------------------- | ----------------------------- | ---------------------------------------------------- | ---- | ---------------------------------------------------------------------------------------------------- |
| ERROR    | MISSING_FILTER_COLUMN | `org_memberships`             | `team_id`                     | `src/app/api/teams/[id]/members/[memberId]/route.ts` | 14   | Filter column "team_id" used on "org_memberships" but not found in schema                            |
| ERROR    | MISSING_FILTER_COLUMN | `org_memberships`             | `team_id`                     | `src/app/api/teams/[id]/members/route.ts`            | 14   | Filter column "team_id" used on "org_memberships" but not found in schema                            |
| ERROR    | MISSING_SELECT_COLUMN | `organizations`               | `settings`                    | `src/config/brands/index.ts`                         | 60   | Column "settings" selected from "organizations" but not found in schema                              |
| ERROR    | MISSING_FILTER_COLUMN | `approval_workflows`          | `workflow_id`                 | `src/lib/approval-engine.ts`                         | 72   | Filter column "workflow_id" used on "approval_workflows" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `approval_workflows`          | `entity_id`                   | `src/lib/approval-engine.ts`                         | 72   | Filter column "entity_id" used on "approval_workflows" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `approval_workflows`          | `workflow_id`                 | `src/lib/approval-engine.ts`                         | 72   | Filter column "workflow_id" used on "approval_workflows" but not found in schema                     |
| ERROR    | MISSING_WRITE_COLUMN  | `approval_steps`              | `entity_id`                   | `src/lib/approval-engine.ts`                         | 117  | Write column "entity_id" used on "approval_steps" but not found in schema                            |
| ERROR    | MISSING_WRITE_COLUMN  | `approval_steps`              | `entity_type`                 | `src/lib/approval-engine.ts`                         | 117  | Write column "entity_type" used on "approval_steps" but not found in schema                          |
| ERROR    | MISSING_WRITE_COLUMN  | `approval_steps`              | `entity_name`                 | `src/lib/approval-engine.ts`                         | 117  | Write column "entity_name" used on "approval_steps" but not found in schema                          |
| ERROR    | MISSING_WRITE_COLUMN  | `approval_steps`              | `organization_id`             | `src/lib/approval-engine.ts`                         | 117  | Write column "organization_id" used on "approval_steps" but not found in schema                      |
| ERROR    | MISSING_WRITE_COLUMN  | `approval_steps`              | `initiated_by`                | `src/lib/approval-engine.ts`                         | 117  | Write column "initiated_by" used on "approval_steps" but not found in schema                         |
| ERROR    | MISSING_WRITE_COLUMN  | `approval_steps`              | `initiated_at`                | `src/lib/approval-engine.ts`                         | 117  | Write column "initiated_at" used on "approval_steps" but not found in schema                         |
| ERROR    | MISSING_WRITE_COLUMN  | `approval_steps`              | `current_step_id`             | `src/lib/approval-engine.ts`                         | 117  | Write column "current_step_id" used on "approval_steps" but not found in schema                      |
| ERROR    | MISSING_WRITE_COLUMN  | `approval_steps`              | `status`                      | `src/lib/approval-engine.ts`                         | 117  | Write column "status" used on "approval_steps" but not found in schema                               |
| ERROR    | MISSING_WRITE_COLUMN  | `approval_steps`              | `context`                     | `src/lib/approval-engine.ts`                         | 117  | Write column "context" used on "approval_steps" but not found in schema                              |
| ERROR    | MISSING_FILTER_COLUMN | `workflow_instances`          | `instance_id`                 | `src/lib/approval-engine.ts`                         | 181  | Filter column "instance_id" used on "workflow_instances" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `workflow_instances`          | `step_id`                     | `src/lib/approval-engine.ts`                         | 181  | Filter column "step_id" used on "workflow_instances" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `workflow_instances`          | `approver_id`                 | `src/lib/approval-engine.ts`                         | 181  | Filter column "approver_id" used on "workflow_instances" but not found in schema                     |
| ERROR    | MISSING_SELECT_COLUMN | `workflow_step_approvals`     | `step_type`                   | `src/lib/approval-engine.ts`                         | 240  | Column "step_type" selected from "workflow_step_approvals" but not found in schema                   |
| ERROR    | MISSING_SELECT_COLUMN | `workflow_step_approvals`     | `on_reject_action`            | `src/lib/approval-engine.ts`                         | 240  | Column "on_reject_action" selected from "workflow_step_approvals" but not found in schema            |
| ERROR    | MISSING_SELECT_COLUMN | `workflow_step_approvals`     | `step_type`                   | `src/lib/approval-engine.ts`                         | 249  | Column "step_type" selected from "workflow_step_approvals" but not found in schema                   |
| ERROR    | MISSING_SELECT_COLUMN | `workflow_step_approvals`     | `on_reject_action`            | `src/lib/approval-engine.ts`                         | 249  | Column "on_reject_action" selected from "workflow_step_approvals" but not found in schema            |
| ERROR    | MISSING_SELECT_COLUMN | `workflow_step_approvals`     | `step_type`                   | `src/lib/approval-engine.ts`                         | 268  | Column "step_type" selected from "workflow_step_approvals" but not found in schema                   |
| ERROR    | MISSING_SELECT_COLUMN | `workflow_step_approvals`     | `on_reject_action`            | `src/lib/approval-engine.ts`                         | 268  | Column "on_reject_action" selected from "workflow_step_approvals" but not found in schema            |
| ERROR    | MISSING_WRITE_COLUMN  | `approval_steps`              | `status`                      | `src/lib/approval-engine.ts`                         | 278  | Write column "status" used on "approval_steps" but not found in schema                               |
| ERROR    | MISSING_WRITE_COLUMN  | `approval_steps`              | `cancelled_at`                | `src/lib/approval-engine.ts`                         | 278  | Write column "cancelled_at" used on "approval_steps" but not found in schema                         |
| ERROR    | MISSING_WRITE_COLUMN  | `approval_steps`              | `cancelled_reason`            | `src/lib/approval-engine.ts`                         | 278  | Write column "cancelled_reason" used on "approval_steps" but not found in schema                     |
| ERROR    | MISSING_WRITE_COLUMN  | `approval_steps`              | `step`                        | `src/lib/approval-engine.ts`                         | 278  | Write column "step" used on "approval_steps" but not found in schema                                 |
| ERROR    | MISSING_WRITE_COLUMN  | `workflow_instances`          | `step`                        | `src/lib/approval-engine.ts`                         | 305  | Write column "step" used on "workflow_instances" but not found in schema                             |
| ERROR    | MISSING_FILTER_COLUMN | `workflow_instances`          | `instance_id`                 | `src/lib/approval-engine.ts`                         | 343  | Filter column "instance_id" used on "workflow_instances" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `workflow_instances`          | `step_id`                     | `src/lib/approval-engine.ts`                         | 343  | Filter column "step_id" used on "workflow_instances" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `workflow_instances`          | `decision`                    | `src/lib/approval-engine.ts`                         | 343  | Filter column "decision" used on "workflow_instances" but not found in schema                        |
| ERROR    | MISSING_WRITE_COLUMN  | `workflow_instances`          | `escalated`                   | `src/lib/approval-engine.ts`                         | 343  | Write column "escalated" used on "workflow_instances" but not found in schema                        |
| ERROR    | MISSING_WRITE_COLUMN  | `workflow_instances`          | `escalated_at`                | `src/lib/approval-engine.ts`                         | 343  | Write column "escalated_at" used on "workflow_instances" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `approval_steps`              | `instance_id`                 | `src/lib/approval-engine.ts`                         | 366  | Filter column "instance_id" used on "approval_steps" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `approval_steps`              | `step_id`                     | `src/lib/approval-engine.ts`                         | 366  | Filter column "step_id" used on "approval_steps" but not found in schema                             |
| ERROR    | MISSING_FILTER_COLUMN | `approval_steps`              | `decision`                    | `src/lib/approval-engine.ts`                         | 366  | Filter column "decision" used on "approval_steps" but not found in schema                            |
| ERROR    | MISSING_WRITE_COLUMN  | `approval_steps`              | `escalated`                   | `src/lib/approval-engine.ts`                         | 366  | Write column "escalated" used on "approval_steps" but not found in schema                            |
| ERROR    | MISSING_WRITE_COLUMN  | `approval_steps`              | `escalated_at`                | `src/lib/approval-engine.ts`                         | 366  | Write column "escalated_at" used on "approval_steps" but not found in schema                         |
| ERROR    | MISSING_SELECT_COLUMN | `workflow_step_approvals`     | `status`                      | `src/lib/approval-engine.ts`                         | 381  | Column "status" selected from "workflow_step_approvals" but not found in schema                      |
| ERROR    | MISSING_SELECT_COLUMN | `workflow_step_approvals`     | `status`                      | `src/lib/approval-engine.ts`                         | 392  | Column "status" selected from "workflow_step_approvals" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `workflow_instances`          | `instance_id`                 | `src/lib/approval-engine.ts`                         | 446  | Filter column "instance_id" used on "workflow_instances" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `workflow_instances`          | `instance_id`                 | `src/lib/approval-engine.ts`                         | 474  | Filter column "instance_id" used on "workflow_instances" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `workflow_instances`          | `instance_id`                 | `src/lib/approval-engine.ts`                         | 474  | Filter column "instance_id" used on "workflow_instances" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `workflow_instances`          | `step_id`                     | `src/lib/approval-engine.ts`                         | 474  | Filter column "step_id" used on "workflow_instances" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `approval_steps`              | `instance_id`                 | `src/lib/approval-engine.ts`                         | 489  | Filter column "instance_id" used on "approval_steps" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `approval_steps`              | `instance_id`                 | `src/lib/approval-engine.ts`                         | 489  | Filter column "instance_id" used on "approval_steps" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `approval_steps`              | `step_id`                     | `src/lib/approval-engine.ts`                         | 489  | Filter column "step_id" used on "approval_steps" but not found in schema                             |
| ERROR    | MISSING_FILTER_COLUMN | `workflow_step_approvals`     | `workflow_id`                 | `src/lib/approval-engine.ts`                         | 527  | Filter column "workflow_id" used on "workflow_step_approvals" but not found in schema                |
| ERROR    | MISSING_WRITE_COLUMN  | `approval_steps`              | `status`                      | `src/lib/approval-engine.ts`                         | 581  | Write column "status" used on "approval_steps" but not found in schema                               |
| ERROR    | MISSING_WRITE_COLUMN  | `approval_steps`              | `completed_at`                | `src/lib/approval-engine.ts`                         | 581  | Write column "completed_at" used on "approval_steps" but not found in schema                         |
| ERROR    | MISSING_WRITE_COLUMN  | `approval_steps`              | `current_step_id`             | `src/lib/approval-engine.ts`                         | 581  | Write column "current_step_id" used on "approval_steps" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `setting_definitions`         | `scope_type`                  | `src/lib/settings/hooks.ts`                          | 27   | Filter column "scope_type" used on "setting_definitions" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `setting_definitions`         | `scope_id`                    | `src/lib/settings/hooks.ts`                          | 27   | Filter column "scope_id" used on "setting_definitions" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `setting_definitions`         | `scope_id`                    | `src/lib/settings/hooks.ts`                          | 27   | Filter column "scope_id" used on "setting_definitions" but not found in schema                       |
| ERROR    | MISSING_WRITE_COLUMN  | `setting_definitions`         | `definition_id`               | `src/lib/settings/hooks.ts`                          | 27   | Write column "definition_id" used on "setting_definitions" but not found in schema                   |
| ERROR    | MISSING_WRITE_COLUMN  | `setting_definitions`         | `scope_type`                  | `src/lib/settings/hooks.ts`                          | 27   | Write column "scope_type" used on "setting_definitions" but not found in schema                      |
| ERROR    | MISSING_WRITE_COLUMN  | `setting_definitions`         | `scope_id`                    | `src/lib/settings/hooks.ts`                          | 27   | Write column "scope_id" used on "setting_definitions" but not found in schema                        |
| ERROR    | MISSING_WRITE_COLUMN  | `setting_definitions`         | `value`                       | `src/lib/settings/hooks.ts`                          | 27   | Write column "value" used on "setting_definitions" but not found in schema                           |
| ERROR    | MISSING_WRITE_COLUMN  | `setting_definitions`         | `changed_by`                  | `src/lib/settings/hooks.ts`                          | 27   | Write column "changed_by" used on "setting_definitions" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `settings`                    | `setting_id`                  | `src/lib/settings/hooks.ts`                          | 104  | Filter column "setting_id" used on "settings" but not found in schema                                |
| ERROR    | MISSING_WRITE_COLUMN  | `settings`                    | `lockedBy`                    | `src/lib/settings/hooks.ts`                          | 104  | Write column "lockedBy" used on "settings" but not found in schema                                   |
| ERROR    | MISSING_FILTER_COLUMN | `settings_change_log`         | `flag_id`                     | `src/lib/settings/hooks.ts`                          | 129  | Filter column "flag_id" used on "settings_change_log" but not found in schema                        |
| ERROR    | MISSING_FILTER_COLUMN | `feature_flags`               | `flag_id`                     | `src/lib/settings/hooks.ts`                          | 149  | Filter column "flag_id" used on "feature_flags" but not found in schema                              |
| ERROR    | MISSING_WRITE_COLUMN  | `feature_flags`               | `flag_id`                     | `src/lib/settings/hooks.ts`                          | 177  | Write column "flag_id" used on "feature_flags" but not found in schema                               |
| ERROR    | MISSING_WRITE_COLUMN  | `feature_flags`               | `scope_type`                  | `src/lib/settings/hooks.ts`                          | 177  | Write column "scope_type" used on "feature_flags" but not found in schema                            |
| ERROR    | MISSING_WRITE_COLUMN  | `feature_flags`               | `scope_id`                    | `src/lib/settings/hooks.ts`                          | 177  | Write column "scope_id" used on "feature_flags" but not found in schema                              |
| ERROR    | MISSING_WRITE_COLUMN  | `feature_flags`               | `value`                       | `src/lib/settings/hooks.ts`                          | 177  | Write column "value" used on "feature_flags" but not found in schema                                 |
| ERROR    | MISSING_WRITE_COLUMN  | `feature_flags`               | `reason`                      | `src/lib/settings/hooks.ts`                          | 177  | Write column "reason" used on "feature_flags" but not found in schema                                |
| ERROR    | MISSING_WRITE_COLUMN  | `feature_flags`               | `flag_id`                     | `src/lib/settings/hooks.ts`                          | 195  | Write column "flag_id" used on "feature_flags" but not found in schema                               |
| ERROR    | MISSING_WRITE_COLUMN  | `feature_flags`               | `scope_type`                  | `src/lib/settings/hooks.ts`                          | 195  | Write column "scope_type" used on "feature_flags" but not found in schema                            |
| ERROR    | MISSING_WRITE_COLUMN  | `feature_flags`               | `scope_id`                    | `src/lib/settings/hooks.ts`                          | 195  | Write column "scope_id" used on "feature_flags" but not found in schema                              |
| ERROR    | MISSING_WRITE_COLUMN  | `feature_flags`               | `value`                       | `src/lib/settings/hooks.ts`                          | 195  | Write column "value" used on "feature_flags" but not found in schema                                 |
| ERROR    | MISSING_WRITE_COLUMN  | `feature_flags`               | `reason`                      | `src/lib/settings/hooks.ts`                          | 195  | Write column "reason" used on "feature_flags" but not found in schema                                |
| ERROR    | MISSING_FILTER_COLUMN | `feature_flag_overrides`      | `is_active`                   | `src/lib/settings/hooks.ts`                          | 221  | Filter column "is_active" used on "feature_flag_overrides" but not found in schema                   |
| ERROR    | MISSING_WRITE_COLUMN  | `role_definitions`            | `role_definition_id`          | `src/lib/settings/hooks.ts`                          | 298  | Write column "role_definition_id" used on "role_definitions" but not found in schema                 |
| ERROR    | MISSING_WRITE_COLUMN  | `role_definitions`            | `resource`                    | `src/lib/settings/hooks.ts`                          | 298  | Write column "resource" used on "role_definitions" but not found in schema                           |
| ERROR    | MISSING_WRITE_COLUMN  | `role_definitions`            | `action`                      | `src/lib/settings/hooks.ts`                          | 298  | Write column "action" used on "role_definitions" but not found in schema                             |
| ERROR    | MISSING_WRITE_COLUMN  | `role_definitions`            | `scope_type`                  | `src/lib/settings/hooks.ts`                          | 298  | Write column "scope_type" used on "role_definitions" but not found in schema                         |
| ERROR    | MISSING_WRITE_COLUMN  | `role_definitions`            | `scope_id`                    | `src/lib/settings/hooks.ts`                          | 298  | Write column "scope_id" used on "role_definitions" but not found in schema                           |
| ERROR    | MISSING_FILTER_COLUMN | `permission_grants`           | `user_id`                     | `src/lib/settings/hooks.ts`                          | 349  | Filter column "user_id" used on "permission_grants" but not found in schema                          |
| ERROR    | MISSING_WRITE_COLUMN  | `notification_preferences`    | `is_active`                   | `src/lib/settings/hooks.ts`                          | 403  | Write column "is_active" used on "notification_preferences" but not found in schema                  |
| ERROR    | MISSING_WRITE_COLUMN  | `notification_preferences`    | `ended_at`                    | `src/lib/settings/hooks.ts`                          | 403  | Write column "ended_at" used on "notification_preferences" but not found in schema                   |
| ERROR    | MISSING_FILTER_COLUMN | `brands`                      | `user_id`                     | `src/lib/settings/hooks.ts`                          | 422  | Filter column "user_id" used on "brands" but not found in schema                                     |
| ERROR    | MISSING_WRITE_COLUMN  | `brands`                      | `ended_at`                    | `src/lib/settings/hooks.ts`                          | 422  | Write column "ended_at" used on "brands" but not found in schema                                     |
| ERROR    | MISSING_WRITE_COLUMN  | `user_sessions`               | `is_active`                   | `src/lib/settings/hooks.ts`                          | 436  | Write column "is_active" used on "user_sessions" but not found in schema                             |
| ERROR    | MISSING_WRITE_COLUMN  | `user_sessions`               | `ended_at`                    | `src/lib/settings/hooks.ts`                          | 436  | Write column "ended_at" used on "user_sessions" but not found in schema                              |
| ERROR    | MISSING_WRITE_COLUMN  | `user_sessions`               | `is_active`                   | `src/lib/settings/hooks.ts`                          | 451  | Write column "is_active" used on "user_sessions" but not found in schema                             |
| ERROR    | MISSING_WRITE_COLUMN  | `user_sessions`               | `ended_at`                    | `src/lib/settings/hooks.ts`                          | 451  | Write column "ended_at" used on "user_sessions" but not found in schema                              |
| ERROR    | MISSING_FILTER_COLUMN | `setting_definitions`         | `is_active`                   | `src/lib/settings/settings-provider.tsx`             | 142  | Filter column "is_active" used on "setting_definitions" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `settings`                    | `is_active`                   | `src/lib/settings/settings-provider.tsx`             | 156  | Filter column "is_active" used on "settings" but not found in schema                                 |
| ERROR    | MISSING_FILTER_COLUMN | `org_memberships`             | `slug`                        | `src/lib/supabase/auth-context.tsx`                  | 83   | Filter column "slug" used on "org_memberships" but not found in schema                               |
| ERROR    | MISSING_WRITE_COLUMN  | `organizations`               | `user_id`                     | `src/lib/supabase/auth-context.tsx`                  | 97   | Write column "user_id" used on "organizations" but not found in schema                               |
| ERROR    | MISSING_WRITE_COLUMN  | `organizations`               | `organization_id`             | `src/lib/supabase/auth-context.tsx`                  | 97   | Write column "organization_id" used on "organizations" but not found in schema                       |
| ERROR    | MISSING_WRITE_COLUMN  | `organizations`               | `role`                        | `src/lib/supabase/auth-context.tsx`                  | 97   | Write column "role" used on "organizations" but not found in schema                                  |
| ERROR    | MISSING_WRITE_COLUMN  | `organizations`               | `status`                      | `src/lib/supabase/auth-context.tsx`                  | 97   | Write column "status" used on "organizations" but not found in schema                                |
| ERROR    | MISSING_WRITE_COLUMN  | `organizations`               | `is_default_org`              | `src/lib/supabase/auth-context.tsx`                  | 97   | Write column "is_default_org" used on "organizations" but not found in schema                        |
| ERROR    | MISSING_SELECT_COLUMN | `user_profiles`               | `username`                    | `src/lib/supabase/auth-context.tsx`                  | 173  | Column "username" selected from "user_profiles" but not found in schema                              |
| ERROR    | MISSING_FILTER_COLUMN | `catalog_categories`          | `category_id`                 | `src/lib/supabase/hooks-advancing.ts`                | 22   | Filter column "category_id" used on "catalog_categories" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `catalog_categories`          | `category_id`                 | `src/lib/supabase/hooks-advancing.ts`                | 22   | Filter column "category_id" used on "catalog_categories" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `catalog_categories`          | `status`                      | `src/lib/supabase/hooks-advancing.ts`                | 22   | Filter column "status" used on "catalog_categories" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `catalog_categories`          | `category_id`                 | `src/lib/supabase/hooks-advancing.ts`                | 45   | Filter column "category_id" used on "catalog_categories" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `catalog_categories`          | `category_id`                 | `src/lib/supabase/hooks-advancing.ts`                | 45   | Filter column "category_id" used on "catalog_categories" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `catalog_categories`          | `status`                      | `src/lib/supabase/hooks-advancing.ts`                | 45   | Filter column "status" used on "catalog_categories" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `catalog_categories`          | `is_critical_path`            | `src/lib/supabase/hooks-advancing.ts`                | 45   | Filter column "is_critical_path" used on "catalog_categories" but not found in schema                |
| ERROR    | MISSING_FILTER_COLUMN | `catalog_categories`          | `tags`                        | `src/lib/supabase/hooks-advancing.ts`                | 45   | Filter column "tags" used on "catalog_categories" but not found in schema                            |
| ERROR    | MISSING_FILTER_COLUMN | `catalog_categories`          | `default_unit_cost`           | `src/lib/supabase/hooks-advancing.ts`                | 45   | Filter column "default_unit_cost" used on "catalog_categories" but not found in schema               |
| ERROR    | MISSING_FILTER_COLUMN | `catalog_categories`          | `default_unit_cost`           | `src/lib/supabase/hooks-advancing.ts`                | 45   | Filter column "default_unit_cost" used on "catalog_categories" but not found in schema               |
| ERROR    | MISSING_FILTER_COLUMN | `catalog_items`               | `category_type`               | `src/lib/supabase/hooks-advancing.ts`                | 65   | Filter column "category_type" used on "catalog_items" but not found in schema                        |
| ERROR    | MISSING_FILTER_COLUMN | `catalog_categories`          | `category_id`                 | `src/lib/supabase/hooks-advancing.ts`                | 72   | Filter column "category_id" used on "catalog_categories" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `catalog_categories`          | `status`                      | `src/lib/supabase/hooks-advancing.ts`                | 72   | Filter column "status" used on "catalog_categories" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `catalog_categories`          | `is_critical_path`            | `src/lib/supabase/hooks-advancing.ts`                | 72   | Filter column "is_critical_path" used on "catalog_categories" but not found in schema                |
| ERROR    | MISSING_FILTER_COLUMN | `catalog_categories`          | `tags`                        | `src/lib/supabase/hooks-advancing.ts`                | 72   | Filter column "tags" used on "catalog_categories" but not found in schema                            |
| ERROR    | MISSING_FILTER_COLUMN | `catalog_categories`          | `default_unit_cost`           | `src/lib/supabase/hooks-advancing.ts`                | 72   | Filter column "default_unit_cost" used on "catalog_categories" but not found in schema               |
| ERROR    | MISSING_FILTER_COLUMN | `catalog_categories`          | `default_unit_cost`           | `src/lib/supabase/hooks-advancing.ts`                | 72   | Filter column "default_unit_cost" used on "catalog_categories" but not found in schema               |
| ERROR    | MISSING_FILTER_COLUMN | `catalog_items`               | `catalog_item_id`             | `src/lib/supabase/hooks-advancing.ts`                | 108  | Filter column "catalog_item_id" used on "catalog_items" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `catalog_items`               | `catalog_item_id`             | `src/lib/supabase/hooks-advancing.ts`                | 125  | Filter column "catalog_item_id" used on "catalog_items" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `catalog_org_overrides`       | `status`                      | `src/lib/supabase/hooks-advancing.ts`                | 166  | Filter column "status" used on "catalog_org_overrides" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `catalog_org_overrides`       | `status`                      | `src/lib/supabase/hooks-advancing.ts`                | 166  | Filter column "status" used on "catalog_org_overrides" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `catalog_org_overrides`       | `status`                      | `src/lib/supabase/hooks-advancing.ts`                | 182  | Filter column "status" used on "catalog_org_overrides" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `catalog_org_overrides`       | `status`                      | `src/lib/supabase/hooks-advancing.ts`                | 182  | Filter column "status" used on "catalog_org_overrides" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `catalog_org_overrides`       | `advance_type`                | `src/lib/supabase/hooks-advancing.ts`                | 182  | Filter column "advance_type" used on "catalog_org_overrides" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `catalog_org_overrides`       | `priority`                    | `src/lib/supabase/hooks-advancing.ts`                | 182  | Filter column "priority" used on "catalog_org_overrides" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `catalog_org_overrides`       | `event_id`                    | `src/lib/supabase/hooks-advancing.ts`                | 182  | Filter column "event_id" used on "catalog_org_overrides" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `catalog_org_overrides`       | `project_id`                  | `src/lib/supabase/hooks-advancing.ts`                | 182  | Filter column "project_id" used on "catalog_org_overrides" but not found in schema                   |
| ERROR    | MISSING_FILTER_COLUMN | `catalog_org_overrides`       | `submitted_by`                | `src/lib/supabase/hooks-advancing.ts`                | 182  | Filter column "submitted_by" used on "catalog_org_overrides" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `production_advances`         | `entity_id`                   | `src/lib/supabase/hooks-advancing.ts`                | 333  | Filter column "entity_id" used on "production_advances" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `production_advances`         | `entity_id`                   | `src/lib/supabase/hooks-advancing.ts`                | 353  | Filter column "entity_id" used on "production_advances" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `production_advances`         | `to_status`                   | `src/lib/supabase/hooks-advancing.ts`                | 353  | Filter column "to_status" used on "production_advances" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `production_advances`         | `entity_id`                   | `src/lib/supabase/hooks-advancing.ts`                | 373  | Filter column "entity_id" used on "production_advances" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `production_advances`         | `to_status`                   | `src/lib/supabase/hooks-advancing.ts`                | 373  | Filter column "to_status" used on "production_advances" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `production_advances`         | `advance_id`                  | `src/lib/supabase/hooks-advancing.ts`                | 373  | Filter column "advance_id" used on "production_advances" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `advance_status_history`      | `advance_id`                  | `src/lib/supabase/hooks-advancing.ts`                | 383  | Filter column "advance_id" used on "advance_status_history" but not found in schema                  |
| ERROR    | MISSING_FILTER_COLUMN | `advance_status_history`      | `deleted_at`                  | `src/lib/supabase/hooks-advancing.ts`                | 383  | Filter column "deleted_at" used on "advance_status_history" but not found in schema                  |
| ERROR    | MISSING_FILTER_COLUMN | `production_advance_items`    | `entity_type`                 | `src/lib/supabase/hooks-advancing.ts`                | 519  | Filter column "entity_type" used on "production_advance_items" but not found in schema               |
| ERROR    | MISSING_FILTER_COLUMN | `production_advance_items`    | `entity_id`                   | `src/lib/supabase/hooks-advancing.ts`                | 519  | Filter column "entity_id" used on "production_advance_items" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `advance_status_history`      | `deleted_at`                  | `src/lib/supabase/hooks-advancing.ts`                | 545  | Filter column "deleted_at" used on "advance_status_history" but not found in schema                  |
| ERROR    | MISSING_FILTER_COLUMN | `advance_status_history`      | `organization_id`             | `src/lib/supabase/hooks-advancing.ts`                | 545  | Filter column "organization_id" used on "advance_status_history" but not found in schema             |
| ERROR    | MISSING_FILTER_COLUMN | `credential_types`            | `event_id`                    | `src/lib/supabase/hooks-credentialing.ts`            | 58   | Filter column "event_id" used on "credential_types" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `credential_types`            | `credential_type_id`          | `src/lib/supabase/hooks-credentialing.ts`            | 58   | Filter column "credential_type_id" used on "credential_types" but not found in schema                |
| ERROR    | MISSING_FILTER_COLUMN | `credential_types`            | `event_id`                    | `src/lib/supabase/hooks-credentialing.ts`            | 79   | Filter column "event_id" used on "credential_types" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `credential_types`            | `credential_type_id`          | `src/lib/supabase/hooks-credentialing.ts`            | 79   | Filter column "credential_type_id" used on "credential_types" but not found in schema                |
| ERROR    | MISSING_FILTER_COLUMN | `credential_inventory_pools`  | `pool_id`                     | `src/lib/supabase/hooks-credentialing.ts`            | 146  | Filter column "pool_id" used on "credential_inventory_pools" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `credential_inventory_pools`  | `pool_id`                     | `src/lib/supabase/hooks-credentialing.ts`            | 167  | Filter column "pool_id" used on "credential_inventory_pools" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `credential_inventory_pools`  | `status`                      | `src/lib/supabase/hooks-credentialing.ts`            | 167  | Filter column "status" used on "credential_inventory_pools" but not found in schema                  |
| ERROR    | MISSING_FILTER_COLUMN | `credential_inventory_pools`  | `status`                      | `src/lib/supabase/hooks-credentialing.ts`            | 167  | Filter column "status" used on "credential_inventory_pools" but not found in schema                  |
| ERROR    | MISSING_FILTER_COLUMN | `credential_inventory_pools`  | `assignee_name`               | `src/lib/supabase/hooks-credentialing.ts`            | 167  | Filter column "assignee_name" used on "credential_inventory_pools" but not found in schema           |
| ERROR    | MISSING_FILTER_COLUMN | `credential_inventory_pools`  | `zone_access`                 | `src/lib/supabase/hooks-credentialing.ts`            | 167  | Filter column "zone_access" used on "credential_inventory_pools" but not found in schema             |
| ERROR    | MISSING_FILTER_COLUMN | `credential_assignments`      | `assignment_id`               | `src/lib/supabase/hooks-credentialing.ts`            | 255  | Filter column "assignment_id" used on "credential_assignments" but not found in schema               |
| ERROR    | MISSING_FILTER_COLUMN | `credential_assignments`      | `assignment_id`               | `src/lib/supabase/hooks-credentialing.ts`            | 278  | Filter column "assignment_id" used on "credential_assignments" but not found in schema               |
| ERROR    | MISSING_WRITE_COLUMN  | `credential_assignments`      | `scanned_at`                  | `src/lib/supabase/hooks-credentialing.ts`            | 278  | Write column "scanned_at" used on "credential_assignments" but not found in schema                   |
| ERROR    | MISSING_FILTER_COLUMN | `credential_scan_log`         | `entity_type`                 | `src/lib/supabase/hooks-credentialing.ts`            | 397  | Filter column "entity_type" used on "credential_scan_log" but not found in schema                    |
| ERROR    | MISSING_FILTER_COLUMN | `deals`                       | `featured`                    | `src/lib/supabase/hooks-crm.ts`                      | 99   | Filter column "featured" used on "deals" but not found in schema                                     |
| ERROR    | MISSING_WRITE_COLUMN  | `deals`                       | `status`                      | `src/lib/supabase/hooks-crm.ts`                      | 99   | Write column "status" used on "deals" but not found in schema                                        |
| ERROR    | MISSING_WRITE_COLUMN  | `deals`                       | `converted_to_deal_id`        | `src/lib/supabase/hooks-crm.ts`                      | 99   | Write column "converted_to_deal_id" used on "deals" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `leads`                       | `featured`                    | `src/lib/supabase/hooks-crm.ts`                      | 108  | Filter column "featured" used on "leads" but not found in schema                                     |
| ERROR    | MISSING_FILTER_COLUMN | `lead_activities`             | `featured`                    | `src/lib/supabase/hooks-crm.ts`                      | 133  | Filter column "featured" used on "lead_activities" but not found in schema                           |
| ERROR    | MISSING_FILTER_COLUMN | `lead_activities`             | `status`                      | `src/lib/supabase/hooks-crm.ts`                      | 133  | Filter column "status" used on "lead_activities" but not found in schema                             |
| ERROR    | MISSING_FILTER_COLUMN | `lead_activities`             | `status`                      | `src/lib/supabase/hooks-crm.ts`                      | 133  | Filter column "status" used on "lead_activities" but not found in schema                             |
| ERROR    | MISSING_FILTER_COLUMN | `testimonials`                | `visible`                     | `src/lib/supabase/hooks-crm.ts`                      | 153  | Filter column "visible" used on "testimonials" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `testimonials`                | `visible`                     | `src/lib/supabase/hooks-crm.ts`                      | 176  | Filter column "visible" used on "testimonials" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `testimonials`                | `visible`                     | `src/lib/supabase/hooks-crm.ts`                      | 192  | Filter column "visible" used on "testimonials" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `provider_connections`        | `connection_id`               | `src/lib/supabase/hooks-external-sync.ts`            | 86   | Filter column "connection_id" used on "provider_connections" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `provider_connections`        | `connection_id`               | `src/lib/supabase/hooks-external-sync.ts`            | 106  | Filter column "connection_id" used on "provider_connections" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `provider_connections`        | `connection_id`               | `src/lib/supabase/hooks-external-sync.ts`            | 106  | Filter column "connection_id" used on "provider_connections" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `provider_ticket_map`         | `event_id`                    | `src/lib/supabase/hooks-external-sync.ts`            | 126  | Filter column "event_id" used on "provider_ticket_map" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `provider_ticket_map`         | `foh_zone_id`                 | `src/lib/supabase/hooks-external-sync.ts`            | 126  | Filter column "foh_zone_id" used on "provider_ticket_map" but not found in schema                    |
| ERROR    | MISSING_FILTER_COLUMN | `provider_ticket_map`         | `category`                    | `src/lib/supabase/hooks-external-sync.ts`            | 126  | Filter column "category" used on "provider_ticket_map" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `provider_ticket_map`         | `payment_method`              | `src/lib/supabase/hooks-external-sync.ts`            | 126  | Filter column "payment_method" used on "provider_ticket_map" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `provider_ticket_map`         | `transaction_at`              | `src/lib/supabase/hooks-external-sync.ts`            | 126  | Filter column "transaction_at" used on "provider_ticket_map" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `provider_ticket_map`         | `transaction_at`              | `src/lib/supabase/hooks-external-sync.ts`            | 126  | Filter column "transaction_at" used on "provider_ticket_map" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `provider_ticket_map`         | `is_refund`                   | `src/lib/supabase/hooks-external-sync.ts`            | 126  | Filter column "is_refund" used on "provider_ticket_map" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `pos_transactions`            | `direction`                   | `src/lib/supabase/hooks-external-sync.ts`            | 199  | Filter column "direction" used on "pos_transactions" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `pos_transactions`            | `status`                      | `src/lib/supabase/hooks-external-sync.ts`            | 199  | Filter column "status" used on "pos_transactions" but not found in schema                            |
| ERROR    | MISSING_FILTER_COLUMN | `webhook_events`              | `direction`                   | `src/lib/supabase/hooks-external-sync.ts`            | 219  | Filter column "direction" used on "webhook_events" but not found in schema                           |
| ERROR    | MISSING_FILTER_COLUMN | `webhook_events`              | `entity_type`                 | `src/lib/supabase/hooks-external-sync.ts`            | 219  | Filter column "entity_type" used on "webhook_events" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `budget_alerts`               | `entity_type`                 | `src/lib/supabase/hooks-feature-gaps.ts`             | 105  | Filter column "entity_type" used on "budget_alerts" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `budget_alerts`               | `entity_id`                   | `src/lib/supabase/hooks-feature-gaps.ts`             | 105  | Filter column "entity_id" used on "budget_alerts" but not found in schema                            |
| ERROR    | MISSING_FILTER_COLUMN | `budget_alerts`               | `entity_type`                 | `src/lib/supabase/hooks-feature-gaps.ts`             | 120  | Filter column "entity_type" used on "budget_alerts" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `budget_alerts`               | `entity_id`                   | `src/lib/supabase/hooks-feature-gaps.ts`             | 120  | Filter column "entity_id" used on "budget_alerts" but not found in schema                            |
| ERROR    | MISSING_FILTER_COLUMN | `record_activity_log`         | `is_active`                   | `src/lib/supabase/hooks-feature-gaps.ts`             | 210  | Filter column "is_active" used on "record_activity_log" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `quality_check_templates`     | `entity_id`                   | `src/lib/supabase/hooks-feature-gaps.ts`             | 241  | Filter column "entity_id" used on "quality_check_templates" but not found in schema                  |
| ERROR    | MISSING_FILTER_COLUMN | `quality_checks`              | `review_cycle_id`             | `src/lib/supabase/hooks-feature-gaps.ts`             | 325  | Filter column "review_cycle_id" used on "quality_checks" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `quality_checks`              | `reviewee_id`                 | `src/lib/supabase/hooks-feature-gaps.ts`             | 325  | Filter column "reviewee_id" used on "quality_checks" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `review_cycles`               | `review_cycle_id`             | `src/lib/supabase/hooks-feature-gaps.ts`             | 356  | Filter column "review_cycle_id" used on "review_cycles" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `review_cycles`               | `reviewee_id`                 | `src/lib/supabase/hooks-feature-gaps.ts`             | 356  | Filter column "reviewee_id" used on "review_cycles" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `review_feedback_requests`    | `owner_id`                    | `src/lib/supabase/hooks-feature-gaps.ts`             | 383  | Filter column "owner_id" used on "review_feedback_requests" but not found in schema                  |
| ERROR    | MISSING_FILTER_COLUMN | `goals`                       | `category`                    | `src/lib/supabase/hooks-feature-gaps.ts`             | 438  | Filter column "category" used on "goals" but not found in schema                                     |
| ERROR    | MISSING_FILTER_COLUMN | `goals`                       | `category`                    | `src/lib/supabase/hooks-feature-gaps.ts`             | 450  | Filter column "category" used on "goals" but not found in schema                                     |
| ERROR    | MISSING_FILTER_COLUMN | `knowledge_articles`          | `entity_type`                 | `src/lib/supabase/hooks-feature-gaps.ts`             | 515  | Filter column "entity_type" used on "knowledge_articles" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `knowledge_articles`          | `entity_id`                   | `src/lib/supabase/hooks-feature-gaps.ts`             | 515  | Filter column "entity_id" used on "knowledge_articles" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `knowledge_articles`          | `entity_type`                 | `src/lib/supabase/hooks-feature-gaps.ts`             | 530  | Filter column "entity_type" used on "knowledge_articles" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `knowledge_articles`          | `entity_id`                   | `src/lib/supabase/hooks-feature-gaps.ts`             | 530  | Filter column "entity_id" used on "knowledge_articles" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `live_event_instances`        | `live_event_id`               | `src/lib/supabase/hooks-live-ops.ts`                 | 16   | Filter column "live_event_id" used on "live_event_instances" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `live_event_instances`        | `live_event_id`               | `src/lib/supabase/hooks-live-ops.ts`                 | 16   | Filter column "live_event_id" used on "live_event_instances" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `conversation_members`        | `is_archived`                 | `src/lib/supabase/hooks-messaging.ts`                | 49   | Filter column "is_archived" used on "conversation_members" but not found in schema                   |
| ERROR    | MISSING_FILTER_COLUMN | `conversations`               | `conversation_id`             | `src/lib/supabase/hooks-messaging.ts`                | 109  | Filter column "conversation_id" used on "conversations" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `conversations`               | `conversation_id`             | `src/lib/supabase/hooks-messaging.ts`                | 109  | Filter column "conversation_id" used on "conversations" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `conversations`               | `deleted_at`                  | `src/lib/supabase/hooks-messaging.ts`                | 109  | Filter column "deleted_at" used on "conversations" but not found in schema                           |
| ERROR    | MISSING_FILTER_COLUMN | `conversations`               | `parent_message_id`           | `src/lib/supabase/hooks-messaging.ts`                | 109  | Filter column "parent_message_id" used on "conversations" but not found in schema                    |
| ERROR    | MISSING_FILTER_COLUMN | `conversation_members`        | `deleted_at`                  | `src/lib/supabase/hooks-messaging.ts`                | 127  | Filter column "deleted_at" used on "conversation_members" but not found in schema                    |
| ERROR    | MISSING_FILTER_COLUMN | `conversation_members`        | `parent_message_id`           | `src/lib/supabase/hooks-messaging.ts`                | 127  | Filter column "parent_message_id" used on "conversation_members" but not found in schema             |
| ERROR    | MISSING_FILTER_COLUMN | `conversation_members`        | `created_at`                  | `src/lib/supabase/hooks-messaging.ts`                | 127  | Filter column "created_at" used on "conversation_members" but not found in schema                    |
| ERROR    | MISSING_FILTER_COLUMN | `conversation_members`        | `deleted_at`                  | `src/lib/supabase/hooks-messaging.ts`                | 225  | Filter column "deleted_at" used on "conversation_members" but not found in schema                    |
| ERROR    | MISSING_FILTER_COLUMN | `conversation_members`        | `created_at`                  | `src/lib/supabase/hooks-messaging.ts`                | 225  | Filter column "created_at" used on "conversation_members" but not found in schema                    |
| ERROR    | MISSING_FILTER_COLUMN | `conversation_members`        | `deleted_at`                  | `src/lib/supabase/hooks-messaging.ts`                | 225  | Filter column "deleted_at" used on "conversation_members" but not found in schema                    |
| ERROR    | MISSING_FILTER_COLUMN | `conversation_members`        | `deleted_at`                  | `src/lib/supabase/hooks-messaging.ts`                | 225  | Filter column "deleted_at" used on "conversation_members" but not found in schema                    |
| ERROR    | MISSING_FILTER_COLUMN | `companies`                   | `company_id`                  | `src/lib/supabase/hooks-productive.ts`               | 85   | Filter column "company_id" used on "companies" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `companies`                   | `company_id`                  | `src/lib/supabase/hooks-productive.ts`               | 101  | Filter column "company_id" used on "companies" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `companies`                   | `company_id`                  | `src/lib/supabase/hooks-productive.ts`               | 120  | Filter column "company_id" used on "companies" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `pipelines`                   | `entity_type`                 | `src/lib/supabase/hooks-productive.ts`               | 212  | Filter column "entity_type" used on "pipelines" but not found in schema                              |
| ERROR    | MISSING_FILTER_COLUMN | `pipelines`                   | `entity_type`                 | `src/lib/supabase/hooks-productive.ts`               | 226  | Filter column "entity_type" used on "pipelines" but not found in schema                              |
| ERROR    | MISSING_FILTER_COLUMN | `pipelines`                   | `entity_type`                 | `src/lib/supabase/hooks-productive.ts`               | 242  | Filter column "entity_type" used on "pipelines" but not found in schema                              |
| ERROR    | MISSING_FILTER_COLUMN | `pipelines`                   | `entity_id`                   | `src/lib/supabase/hooks-productive.ts`               | 242  | Filter column "entity_id" used on "pipelines" but not found in schema                                |
| ERROR    | MISSING_FILTER_COLUMN | `custom_fields`               | `entity_id`                   | `src/lib/supabase/hooks-productive.ts`               | 263  | Filter column "entity_id" used on "custom_fields" but not found in schema                            |
| ERROR    | MISSING_FILTER_COLUMN | `custom_fields`               | `project_id`                  | `src/lib/supabase/hooks-productive.ts`               | 300  | Filter column "project_id" used on "custom_fields" but not found in schema                           |
| ERROR    | MISSING_FILTER_COLUMN | `custom_field_values`         | `entity_type`                 | `src/lib/supabase/hooks-productive.ts`               | 316  | Filter column "entity_type" used on "custom_field_values" but not found in schema                    |
| ERROR    | MISSING_FILTER_COLUMN | `custom_field_values`         | `project_id`                  | `src/lib/supabase/hooks-productive.ts`               | 316  | Filter column "project_id" used on "custom_field_values" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `rate_card_items`             | `project_id`                  | `src/lib/supabase/hooks-productive.ts`               | 533  | Filter column "project_id" used on "rate_card_items" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `rate_card_items`             | `crew_member_id`              | `src/lib/supabase/hooks-productive.ts`               | 533  | Filter column "crew_member_id" used on "rate_card_items" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `rate_card_items`             | `end_date`                    | `src/lib/supabase/hooks-productive.ts`               | 533  | Filter column "end_date" used on "rate_card_items" but not found in schema                           |
| ERROR    | MISSING_FILTER_COLUMN | `rate_card_items`             | `start_date`                  | `src/lib/supabase/hooks-productive.ts`               | 533  | Filter column "start_date" used on "rate_card_items" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `rate_card_items`             | `project_id`                  | `src/lib/supabase/hooks-productive.ts`               | 551  | Filter column "project_id" used on "rate_card_items" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `rate_card_items`             | `crew_member_id`              | `src/lib/supabase/hooks-productive.ts`               | 551  | Filter column "crew_member_id" used on "rate_card_items" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `rate_card_items`             | `end_date`                    | `src/lib/supabase/hooks-productive.ts`               | 551  | Filter column "end_date" used on "rate_card_items" but not found in schema                           |
| ERROR    | MISSING_FILTER_COLUMN | `rate_card_items`             | `start_date`                  | `src/lib/supabase/hooks-productive.ts`               | 551  | Filter column "start_date" used on "rate_card_items" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `time_off_requests`           | `user_id`                     | `src/lib/supabase/hooks-productive.ts`               | 690  | Filter column "user_id" used on "time_off_requests" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `time_off_requests`           | `user_id`                     | `src/lib/supabase/hooks-productive.ts`               | 719  | Filter column "user_id" used on "time_off_requests" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `active_timers`               | `status`                      | `src/lib/supabase/hooks-productive.ts`               | 761  | Filter column "status" used on "active_timers" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `active_timers`               | `status`                      | `src/lib/supabase/hooks-productive.ts`               | 778  | Filter column "status" used on "active_timers" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `active_timers`               | `status`                      | `src/lib/supabase/hooks-productive.ts`               | 785  | Filter column "status" used on "active_timers" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `dashboard_widgets`           | `project_id`                  | `src/lib/supabase/hooks-productive.ts`               | 953  | Filter column "project_id" used on "dashboard_widgets" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `dashboard_widgets`           | `project_id`                  | `src/lib/supabase/hooks-productive.ts`               | 974  | Filter column "project_id" used on "dashboard_widgets" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `documents`                   | `document_id`                 | `src/lib/supabase/hooks-productive.ts`               | 997  | Filter column "document_id" used on "documents" but not found in schema                              |
| ERROR    | MISSING_FILTER_COLUMN | `documents`                   | `document_id`                 | `src/lib/supabase/hooks-productive.ts`               | 1017 | Filter column "document_id" used on "documents" but not found in schema                              |
| ERROR    | MISSING_FILTER_COLUMN | `recurring_invoices`          | `invoice_id`                  | `src/lib/supabase/hooks-productive.ts`               | 1107 | Filter column "invoice_id" used on "recurring_invoices" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `recurring_invoices`          | `invoice_id`                  | `src/lib/supabase/hooks-productive.ts`               | 1121 | Filter column "invoice_id" used on "recurring_invoices" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `scopes_of_work`              | `sow_id`                      | `src/lib/supabase/hooks-sow.ts`                      | 78   | Filter column "sow_id" used on "scopes_of_work" but not found in schema                              |
| ERROR    | MISSING_FILTER_COLUMN | `scopes_of_work`              | `sow_id`                      | `src/lib/supabase/hooks-sow.ts`                      | 94   | Filter column "sow_id" used on "scopes_of_work" but not found in schema                              |
| ERROR    | MISSING_FILTER_COLUMN | `sow_deliverables`            | `project_id`                  | `src/lib/supabase/hooks-sow.ts`                      | 173  | Filter column "project_id" used on "sow_deliverables" but not found in schema                        |
| ERROR    | MISSING_FILTER_COLUMN | `sow_deliverables`            | `project_id`                  | `src/lib/supabase/hooks-sow.ts`                      | 194  | Filter column "project_id" used on "sow_deliverables" but not found in schema                        |
| ERROR    | MISSING_FILTER_COLUMN | `client_invoices`             | `client_invoice_id`           | `src/lib/supabase/hooks-sow.ts`                      | 251  | Filter column "client_invoice_id" used on "client_invoices" but not found in schema                  |
| ERROR    | MISSING_FILTER_COLUMN | `client_invoices`             | `client_invoice_id`           | `src/lib/supabase/hooks-sow.ts`                      | 270  | Filter column "client_invoice_id" used on "client_invoices" but not found in schema                  |
| ERROR    | MISSING_FILTER_COLUMN | `invoice_line_items`          | `invoice_line_item_id`        | `src/lib/supabase/hooks-sow.ts`                      | 335  | Filter column "invoice_line_item_id" used on "invoice_line_items" but not found in schema            |
| ERROR    | MISSING_FILTER_COLUMN | `invoice_line_items`          | `invoice_line_item_id`        | `src/lib/supabase/hooks-sow.ts`                      | 357  | Filter column "invoice_line_item_id" used on "invoice_line_items" but not found in schema            |
| ERROR    | MISSING_FILTER_COLUMN | `invoice_time_entries`        | `sow_id`                      | `src/lib/supabase/hooks-sow.ts`                      | 379  | Filter column "sow_id" used on "invoice_time_entries" but not found in schema                        |
| ERROR    | MISSING_FILTER_COLUMN | `invoice_time_entries`        | `sow_id`                      | `src/lib/supabase/hooks-sow.ts`                      | 394  | Filter column "sow_id" used on "invoice_time_entries" but not found in schema                        |
| ERROR    | MISSING_FILTER_COLUMN | `invoice_time_entries`        | `sow_deliverable_id`          | `src/lib/supabase/hooks-sow.ts`                      | 394  | Filter column "sow_deliverable_id" used on "invoice_time_entries" but not found in schema            |
| ERROR    | MISSING_FILTER_COLUMN | `teams`                       | `team_id`                     | `src/lib/supabase/hooks-switcher.ts`                 | 24   | Filter column "team_id" used on "teams" but not found in schema                                      |
| ERROR    | MISSING_FILTER_COLUMN | `teams`                       | `company_type`                | `src/lib/supabase/hooks-switcher.ts`                 | 24   | Filter column "company_type" used on "teams" but not found in schema                                 |
| ERROR    | MISSING_FILTER_COLUMN | `teams`                       | `team_id`                     | `src/lib/supabase/hooks-switcher.ts`                 | 24   | Filter column "team_id" used on "teams" but not found in schema                                      |
| ERROR    | MISSING_FILTER_COLUMN | `team_members`                | `organization_id`             | `src/lib/supabase/hooks-switcher.ts`                 | 46   | Filter column "organization_id" used on "team_members" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `team_members`                | `company_type`                | `src/lib/supabase/hooks-switcher.ts`                 | 46   | Filter column "company_type" used on "team_members" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `team_members`                | `organization_id`             | `src/lib/supabase/hooks-switcher.ts`                 | 46   | Filter column "organization_id" used on "team_members" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `companies`                   | `client_company_id`           | `src/lib/supabase/hooks-switcher.ts`                 | 70   | Filter column "client_company_id" used on "companies" but not found in schema                        |
| ERROR    | MISSING_FILTER_COLUMN | `projects`                    | `project_id`                  | `src/lib/supabase/hooks-switcher.ts`                 | 102  | Filter column "project_id" used on "projects" but not found in schema                                |
| ERROR    | MISSING_FILTER_COLUMN | `automation_executions`       | `project_id`                  | `src/lib/supabase/hooks-v2-features.ts`              | 21   | Filter column "project_id" used on "automation_executions" but not found in schema                   |
| ERROR    | MISSING_FILTER_COLUMN | `automation_executions`       | `project_id`                  | `src/lib/supabase/hooks-v2-features.ts`              | 37   | Filter column "project_id" used on "automation_executions" but not found in schema                   |
| ERROR    | MISSING_FILTER_COLUMN | `automation_executions`       | `project_id`                  | `src/lib/supabase/hooks-v2-features.ts`              | 52   | Filter column "project_id" used on "automation_executions" but not found in schema                   |
| ERROR    | MISSING_FILTER_COLUMN | `revenue_recognition_entries` | `is_active`                   | `src/lib/supabase/hooks-v2-features.ts`              | 72   | Filter column "is_active" used on "revenue_recognition_entries" but not found in schema              |
| ERROR    | MISSING_FILTER_COLUMN | `revenue_recognition_entries` | `is_active`                   | `src/lib/supabase/hooks-v2-features.ts`              | 100  | Filter column "is_active" used on "revenue_recognition_entries" but not found in schema              |
| ERROR    | MISSING_FILTER_COLUMN | `time_tracking_policies`      | `is_read`                     | `src/lib/supabase/hooks-v2-features.ts`              | 122  | Filter column "is_read" used on "time_tracking_policies" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `time_tracking_policies`      | `is_read`                     | `src/lib/supabase/hooks-v2-features.ts`              | 136  | Filter column "is_read" used on "time_tracking_policies" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `time_tracking_policies`      | `is_read`                     | `src/lib/supabase/hooks-v2-features.ts`              | 136  | Filter column "is_read" used on "time_tracking_policies" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `notifications`               | `is_read`                     | `src/lib/supabase/hooks-v2-features.ts`              | 168  | Filter column "is_read" used on "notifications" but not found in schema                              |
| ERROR    | MISSING_FILTER_COLUMN | `notifications`               | `is_read`                     | `src/lib/supabase/hooks-v2-features.ts`              | 168  | Filter column "is_read" used on "notifications" but not found in schema                              |
| ERROR    | MISSING_WRITE_COLUMN  | `notifications`               | `is_read`                     | `src/lib/supabase/hooks-v2-features.ts`              | 168  | Write column "is_read" used on "notifications" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `notifications`               | `is_read`                     | `src/lib/supabase/hooks-v2-features.ts`              | 184  | Filter column "is_read" used on "notifications" but not found in schema                              |
| ERROR    | MISSING_FILTER_COLUMN | `notifications`               | `is_read`                     | `src/lib/supabase/hooks-v2-features.ts`              | 184  | Filter column "is_read" used on "notifications" but not found in schema                              |
| ERROR    | MISSING_WRITE_COLUMN  | `notifications`               | `is_read`                     | `src/lib/supabase/hooks-v2-features.ts`              | 184  | Write column "is_read" used on "notifications" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `notifications`               | `is_read`                     | `src/lib/supabase/hooks-v2-features.ts`              | 197  | Filter column "is_read" used on "notifications" but not found in schema                              |
| ERROR    | MISSING_WRITE_COLUMN  | `notifications`               | `is_read`                     | `src/lib/supabase/hooks-v2-features.ts`              | 197  | Write column "is_read" used on "notifications" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `notifications`               | `is_read`                     | `src/lib/supabase/hooks-v2-features.ts`              | 214  | Filter column "is_read" used on "notifications" but not found in schema                              |
| ERROR    | MISSING_WRITE_COLUMN  | `notifications`               | `is_read`                     | `src/lib/supabase/hooks-v2-features.ts`              | 214  | Write column "is_read" used on "notifications" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `notifications`               | `is_read`                     | `src/lib/supabase/hooks-v2-features.ts`              | 230  | Filter column "is_read" used on "notifications" but not found in schema                              |
| ERROR    | MISSING_WRITE_COLUMN  | `notifications`               | `is_read`                     | `src/lib/supabase/hooks-v2-features.ts`              | 230  | Write column "is_read" used on "notifications" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `notification_preferences`    | `entity_type`                 | `src/lib/supabase/hooks-v2-features.ts`              | 247  | Filter column "entity_type" used on "notification_preferences" but not found in schema               |
| ERROR    | MISSING_FILTER_COLUMN | `notification_preferences`    | `entity_id`                   | `src/lib/supabase/hooks-v2-features.ts`              | 247  | Filter column "entity_id" used on "notification_preferences" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `notification_preferences`    | `entity_type`                 | `src/lib/supabase/hooks-v2-features.ts`              | 260  | Filter column "entity_type" used on "notification_preferences" but not found in schema               |
| ERROR    | MISSING_FILTER_COLUMN | `notification_preferences`    | `entity_id`                   | `src/lib/supabase/hooks-v2-features.ts`              | 260  | Filter column "entity_id" used on "notification_preferences" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `email_messages`              | `survey_type`                 | `src/lib/supabase/hooks-v2-features.ts`              | 280  | Filter column "survey_type" used on "email_messages" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `email_messages`              | `survey_type`                 | `src/lib/supabase/hooks-v2-features.ts`              | 297  | Filter column "survey_type" used on "email_messages" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `survey_templates`            | `template_id`                 | `src/lib/supabase/hooks-v2-features.ts`              | 316  | Filter column "template_id" used on "survey_templates" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `survey_templates`            | `entity_type`                 | `src/lib/supabase/hooks-v2-features.ts`              | 316  | Filter column "entity_type" used on "survey_templates" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `survey_templates`            | `entity_id`                   | `src/lib/supabase/hooks-v2-features.ts`              | 316  | Filter column "entity_id" used on "survey_templates" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `survey_templates`            | `template_id`                 | `src/lib/supabase/hooks-v2-features.ts`              | 331  | Filter column "template_id" used on "survey_templates" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `survey_templates`            | `entity_type`                 | `src/lib/supabase/hooks-v2-features.ts`              | 331  | Filter column "entity_type" used on "survey_templates" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `survey_templates`            | `entity_id`                   | `src/lib/supabase/hooks-v2-features.ts`              | 331  | Filter column "entity_id" used on "survey_templates" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `survey_templates`            | `template_id`                 | `src/lib/supabase/hooks-v2-features.ts`              | 343  | Filter column "template_id" used on "survey_templates" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `survey_templates`            | `entity_type`                 | `src/lib/supabase/hooks-v2-features.ts`              | 343  | Filter column "entity_type" used on "survey_templates" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `survey_templates`            | `entity_id`                   | `src/lib/supabase/hooks-v2-features.ts`              | 343  | Filter column "entity_id" used on "survey_templates" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `sla_policies`                | `entity_types`                | `src/lib/supabase/hooks-v2-features.ts`              | 392  | Filter column "entity_types" used on "sla_policies" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `sla_policies`                | `entity_types`                | `src/lib/supabase/hooks-v2-features.ts`              | 403  | Filter column "entity_types" used on "sla_policies" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `custom_field_definitions`    | `entity_type`                 | `src/lib/supabase/hooks-v2-features.ts`              | 450  | Filter column "entity_type" used on "custom_field_definitions" but not found in schema               |
| ERROR    | MISSING_FILTER_COLUMN | `custom_field_definitions`    | `entity_id`                   | `src/lib/supabase/hooks-v2-features.ts`              | 450  | Filter column "entity_id" used on "custom_field_definitions" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `custom_field_definitions`    | `entity_type`                 | `src/lib/supabase/hooks-v2-features.ts`              | 463  | Filter column "entity_type" used on "custom_field_definitions" but not found in schema               |
| ERROR    | MISSING_FILTER_COLUMN | `custom_field_definitions`    | `entity_id`                   | `src/lib/supabase/hooks-v2-features.ts`              | 463  | Filter column "entity_id" used on "custom_field_definitions" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `custom_field_definitions`    | `entity_type`                 | `src/lib/supabase/hooks-v2-features.ts`              | 478  | Filter column "entity_type" used on "custom_field_definitions" but not found in schema               |
| ERROR    | MISSING_FILTER_COLUMN | `custom_field_definitions`    | `entity_id`                   | `src/lib/supabase/hooks-v2-features.ts`              | 478  | Filter column "entity_id" used on "custom_field_definitions" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `custom_field_definitions`    | `is_active`                   | `src/lib/supabase/hooks-v2-features.ts`              | 478  | Filter column "is_active" used on "custom_field_definitions" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `custom_field_values`         | `entity_type`                 | `src/lib/supabase/hooks-v2-features.ts`              | 494  | Filter column "entity_type" used on "custom_field_values" but not found in schema                    |
| ERROR    | MISSING_FILTER_COLUMN | `custom_field_values`         | `is_active`                   | `src/lib/supabase/hooks-v2-features.ts`              | 494  | Filter column "is_active" used on "custom_field_values" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `custom_field_values`         | `is_active`                   | `src/lib/supabase/hooks-v2-features.ts`              | 509  | Filter column "is_active" used on "custom_field_values" but not found in schema                      |
| ERROR    | MISSING_FILTER_COLUMN | `ai_report_queries`           | `billable`                    | `src/lib/supabase/hooks-v2-features.ts`              | 577  | Filter column "billable" used on "ai_report_queries" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `ai_report_queries`           | `invoice_id`                  | `src/lib/supabase/hooks-v2-features.ts`              | 577  | Filter column "invoice_id" used on "ai_report_queries" but not found in schema                       |
| ERROR    | MISSING_FILTER_COLUMN | `ai_report_queries`           | `billable`                    | `src/lib/supabase/hooks-v2-features.ts`              | 591  | Filter column "billable" used on "ai_report_queries" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `ai_report_queries`           | `invoice_id`                  | `src/lib/supabase/hooks-v2-features.ts`              | 591  | Filter column "invoice_id" used on "ai_report_queries" but not found in schema                       |
| ERROR    | MISSING_WRITE_COLUMN  | `production_time_entries`     | `amount`                      | `src/lib/supabase/hooks-v2-features.ts`              | 617  | Write column "amount" used on "production_time_entries" but not found in schema                      |
| ERROR    | MISSING_WRITE_COLUMN  | `production_time_entries`     | `source`                      | `src/lib/supabase/hooks-v2-features.ts`              | 617  | Write column "source" used on "production_time_entries" but not found in schema                      |
| ERROR    | MISSING_WRITE_COLUMN  | `production_time_entries`     | `generated_from_time_entries` | `src/lib/supabase/hooks-v2-features.ts`              | 617  | Write column "generated_from_time_entries" used on "production_time_entries" but not found in schema |
| ERROR    | MISSING_WRITE_COLUMN  | `invoices`                    | `project_id`                  | `src/lib/supabase/hooks-v2-features.ts`              | 643  | Write column "project_id" used on "invoices" but not found in schema                                 |
| ERROR    | MISSING_WRITE_COLUMN  | `invoices`                    | `notes`                       | `src/lib/supabase/hooks-v2-features.ts`              | 643  | Write column "notes" used on "invoices" but not found in schema                                      |
| ERROR    | MISSING_FILTER_COLUMN | `call_sheets`                 | `call_sheet_id`               | `src/lib/supabase/hooks-workflows.ts`                | 66   | Filter column "call_sheet_id" used on "call_sheets" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `call_sheets`                 | `call_sheet_id`               | `src/lib/supabase/hooks-workflows.ts`                | 82   | Filter column "call_sheet_id" used on "call_sheets" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `call_sheets`                 | `call_sheet_id`               | `src/lib/supabase/hooks-workflows.ts`                | 98   | Filter column "call_sheet_id" used on "call_sheets" but not found in schema                          |
| ERROR    | MISSING_FILTER_COLUMN | `call_sheet_crew`             | `project_id`                  | `src/lib/supabase/hooks-workflows.ts`                | 118  | Filter column "project_id" used on "call_sheet_crew" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `approval_workflows`          | `workflow_id`                 | `src/lib/supabase/hooks-workflows.ts`                | 224  | Filter column "workflow_id" used on "approval_workflows" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `approval_workflows`          | `workflow_id`                 | `src/lib/supabase/hooks-workflows.ts`                | 240  | Filter column "workflow_id" used on "approval_workflows" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `approval_workflows`          | `workflow_id`                 | `src/lib/supabase/hooks-workflows.ts`                | 259  | Filter column "workflow_id" used on "approval_workflows" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `approval_steps`              | `entity_type`                 | `src/lib/supabase/hooks-workflows.ts`                | 280  | Filter column "entity_type" used on "approval_steps" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `approval_steps`              | `entity_id`                   | `src/lib/supabase/hooks-workflows.ts`                | 280  | Filter column "entity_id" used on "approval_steps" but not found in schema                           |
| ERROR    | MISSING_FILTER_COLUMN | `approval_steps`              | `entity_type`                 | `src/lib/supabase/hooks-workflows.ts`                | 296  | Filter column "entity_type" used on "approval_steps" but not found in schema                         |
| ERROR    | MISSING_FILTER_COLUMN | `approval_steps`              | `entity_id`                   | `src/lib/supabase/hooks-workflows.ts`                | 296  | Filter column "entity_id" used on "approval_steps" but not found in schema                           |
| ERROR    | MISSING_FILTER_COLUMN | `workflow_instances`          | `instance_id`                 | `src/lib/supabase/hooks-workflows.ts`                | 334  | Filter column "instance_id" used on "workflow_instances" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `workflow_instances`          | `instance_id`                 | `src/lib/supabase/hooks-workflows.ts`                | 353  | Filter column "instance_id" used on "workflow_instances" but not found in schema                     |
| ERROR    | MISSING_FILTER_COLUMN | `workflow_step_approvals`     | `entity_type`                 | `src/lib/supabase/hooks-workflows.ts`                | 371  | Filter column "entity_type" used on "workflow_step_approvals" but not found in schema                |
| ERROR    | MISSING_FILTER_COLUMN | `workflow_step_approvals`     | `entity_id`                   | `src/lib/supabase/hooks-workflows.ts`                | 371  | Filter column "entity_id" used on "workflow_step_approvals" but not found in schema                  |
| ERROR    | MISSING_FILTER_COLUMN | `e_signatures`                | `user_id`                     | `src/lib/supabase/hooks-workflows.ts`                | 391  | Filter column "user_id" used on "e_signatures" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `e_signatures`                | `user_id`                     | `src/lib/supabase/hooks-workflows.ts`                | 408  | Filter column "user_id" used on "e_signatures" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `user_profiles`               | `user_id`                     | `src/lib/supabase/middleware.ts`                     | 105  | Filter column "user_id" used on "user_profiles" but not found in schema                              |
| ERROR    | MISSING_FILTER_COLUMN | `user_profiles`               | `status`                      | `src/lib/supabase/middleware.ts`                     | 105  | Filter column "status" used on "user_profiles" but not found in schema                               |
| ERROR    | MISSING_FILTER_COLUMN | `org_memberships`             | `gate_access`                 | `src/lib/supabase/middleware.ts`                     | 144  | Filter column "gate_access" used on "org_memberships" but not found in schema                        |
| ERROR    | MISSING_FILTER_COLUMN | `org_memberships`             | `gate_access`                 | `src/lib/supabase/middleware.ts`                     | 156  | Filter column "gate_access" used on "org_memberships" but not found in schema                        |
| ERROR    | MISSING_FILTER_COLUMN | `org_memberships`             | `step_definition_id`          | `src/lib/supabase/middleware.ts`                     | 156  | Filter column "step_definition_id" used on "org_memberships" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `onboarding_step_definitions` | `user_id`                     | `src/lib/supabase/middleware.ts`                     | 185  | Filter column "user_id" used on "onboarding_step_definitions" but not found in schema                |
| ERROR    | MISSING_FILTER_COLUMN | `onboarding_step_definitions` | `status`                      | `src/lib/supabase/middleware.ts`                     | 185  | Filter column "status" used on "onboarding_step_definitions" but not found in schema                 |
| ERROR    | MISSING_FILTER_COLUMN | `onboarding_step_definitions` | `step_definition_id`          | `src/lib/supabase/middleware.ts`                     | 185  | Filter column "step_definition_id" used on "onboarding_step_definitions" but not found in schema     |

## ERRORS: Missing Join Tables

Foreign table references in `.select()` that don't exist in the schema.

| Parent Table                 | Join Table                                  | File                                      | Line |
| ---------------------------- | ------------------------------------------- | ----------------------------------------- | ---- |
| `workflow_instances`         | `initiated_by`                              | `src/lib/approval-engine.ts`              | 446  |
| `workflow_step_approvals`    | `approver_id`                               | `src/lib/approval-engine.ts`              | 496  |
| `production_advances`        | `event_id`                                  | `src/lib/supabase/hooks-advancing.ts`     | 204  |
| `production_advances`        | `project_id`                                | `src/lib/supabase/hooks-advancing.ts`     | 204  |
| `production_advances`        | `submitted_by`                              | `src/lib/supabase/hooks-advancing.ts`     | 204  |
| `production_advances`        | `point_of_contact`                          | `src/lib/supabase/hooks-advancing.ts`     | 204  |
| `production_advances`        | `approved_by`                               | `src/lib/supabase/hooks-advancing.ts`     | 204  |
| `production_advances`        | `catalog_item_id`                           | `src/lib/supabase/hooks-advancing.ts`     | 373  |
| `production_advances`        | `vendor_id`                                 | `src/lib/supabase/hooks-advancing.ts`     | 373  |
| `production_advances`        | `assigned_to`                               | `src/lib/supabase/hooks-advancing.ts`     | 373  |
| `advance_status_history`     | `catalog_item_id`                           | `src/lib/supabase/hooks-advancing.ts`     | 383  |
| `advance_status_history`     | `vendor_id`                                 | `src/lib/supabase/hooks-advancing.ts`     | 383  |
| `advance_status_history`     | `assigned_to`                               | `src/lib/supabase/hooks-advancing.ts`     | 383  |
| `production_advance_items`   | `catalog_item_id`                           | `src/lib/supabase/hooks-advancing.ts`     | 410  |
| `production_advance_items`   | `vendor_id`                                 | `src/lib/supabase/hooks-advancing.ts`     | 410  |
| `production_advance_items`   | `assigned_to`                               | `src/lib/supabase/hooks-advancing.ts`     | 410  |
| `credential_types`           | `credential_type_id`                        | `src/lib/supabase/hooks-credentialing.ts` | 58   |
| `credential_inventory_pools` | `credential_type_id`                        | `src/lib/supabase/hooks-credentialing.ts` | 103  |
| `credential_assignments`     | `credential_type_id`                        | `src/lib/supabase/hooks-credentialing.ts` | 191  |
| `credential_scan_log`        | `assignment_id`                             | `src/lib/supabase/hooks-credentialing.ts` | 397  |
| `provider_connections`       | `assignment_id`                             | `src/lib/supabase/hooks-external-sync.ts` | 86   |
| `provider_ticket_map`        | `assignment_id`                             | `src/lib/supabase/hooks-external-sync.ts` | 126  |
| `sync_events`                | `connection_id`                             | `src/lib/supabase/hooks-external-sync.ts` | 244  |
| `review_feedback_requests`   | `review_feedback_requests_reviewer_id_fkey` | `src/lib/supabase/hooks-feature-gaps.ts`  | 383  |
| `messages`                   | `sender_id`                                 | `src/lib/supabase/hooks-messaging.ts`     | 153  |
| `companies`                  | `account_manager_id`                        | `src/lib/supabase/hooks-productive.ts`    | 55   |
| `custom_fields`              | `owner_id`                                  | `src/lib/supabase/hooks-productive.ts`    | 300  |
| `custom_field_values`        | `owner_id`                                  | `src/lib/supabase/hooks-productive.ts`    | 316  |
| `saved_views`                | `owner_id`                                  | `src/lib/supabase/hooks-productive.ts`    | 338  |
| `resource_bookings`          | `approver_id`                               | `src/lib/supabase/hooks-productive.ts`    | 603  |
| `time_off_requests`          | `approver_id`                               | `src/lib/supabase/hooks-productive.ts`    | 654  |
| `proposals`                  | `owner_id`                                  | `src/lib/supabase/hooks-productive.ts`    | 863  |
| `proposal_items`             | `owner_id`                                  | `src/lib/supabase/hooks-productive.ts`    | 883  |
| `dashboards`                 | `owner_id`                                  | `src/lib/supabase/hooks-productive.ts`    | 905  |
| `dashboard_widgets`          | `owner_id`                                  | `src/lib/supabase/hooks-productive.ts`    | 953  |
| `documents`                  | `owner_id`                                  | `src/lib/supabase/hooks-productive.ts`    | 997  |
| `invoice_time_entries`       | `changed_by`                                | `src/lib/supabase/hooks-sow.ts`           | 394  |
| `sow_change_log`             | `changed_by`                                | `src/lib/supabase/hooks-sow.ts`           | 419  |
| `org_memberships`            | `inner`                                     | `src/lib/supabase/middleware.ts`          | 156  |

## Appendix A: Complete Table Inventory

| #   | Table                            | Columns | Migration                                     | Queried? | View? |
| --- | -------------------------------- | ------- | --------------------------------------------- | -------- | ----- |
| 1   | `access_audit_log`               | 12      | 028_rbac_custom_roles.sql                     | Yes      | No    |
| 2   | `account_health_scores`          | 20      | 013_crm_revenue_pipeline.sql                  | No       | No    |
| 3   | `account_revenue_summary`        | 0       | 013_crm_revenue_pipeline.sql                  | No       | Yes   |
| 4   | `activation_assets`              | 12      | 012_production_consolidation.sql              | No       | No    |
| 5   | `activations`                    | 33      | 003_production_lifecycle.sql                  | Yes      | No    |
| 6   | `active_timers`                  | 8       | 005_productive_features.sql                   | Yes      | No    |
| 7   | `activities`                     | 25      | 003_production_lifecycle.sql                  | No       | No    |
| 8   | `activity_assets`                | 9       | 012_production_consolidation.sql              | No       | No    |
| 9   | `activity_consumables`           | 9       | 012_production_consolidation.sql              | No       | No    |
| 10  | `activity_log`                   | 8       | 002_extended_schema.sql                       | No       | No    |
| 11  | `advance_status_history`         | 9       | 048_production_advances_core.sql              | Yes      | No    |
| 12  | `advance_templates`              | 13      | 048_production_advances_core.sql              | Yes      | No    |
| 13  | `ai_report_queries`              | 10      | 034_v2_feature_gaps.sql                       | Yes      | No    |
| 14  | `anonymization_queue`            | 8       | 022_audit_remediation.sql                     | No       | No    |
| 15  | `api_tokens`                     | 18      | 018_user_lifecycle_identity.sql               | No       | No    |
| 16  | `approval_steps`                 | 16      | 006_workflow_documents.sql                    | Yes      | No    |
| 17  | `approval_workflows`             | 15      | 006_workflow_documents.sql                    | Yes      | No    |
| 18  | `approvals`                      | 14      | 001_initial_schema.sql                        | No       | No    |
| 19  | `asset_access_controls`          | 15      | 014_digital_asset_lifecycle.sql               | No       | No    |
| 20  | `asset_access_log`               | 10      | 014_digital_asset_lifecycle.sql               | No       | No    |
| 21  | `asset_assignments`              | 16      | 003_production_lifecycle.sql                  | No       | No    |
| 22  | `asset_certifications`           | 18      | 016_legal_compliance_finance_procurement.sql  | No       | No    |
| 23  | `asset_channel_deployments`      | 10      | 015_creative_brand_campaign.sql               | No       | No    |
| 24  | `asset_damage_reports`           | 22      | 019_asset_inventory_logistics_warehousing.sql | No       | No    |
| 25  | `asset_dependencies`             | 11      | 014_digital_asset_lifecycle.sql               | No       | No    |
| 26  | `asset_links`                    | 15      | 014_digital_asset_lifecycle.sql               | No       | No    |
| 27  | `asset_reconciliation_items`     | 26      | 020_live_event_operations.sql                 | No       | No    |
| 28  | `asset_retention_policies`       | 17      | 014_digital_asset_lifecycle.sql               | No       | No    |
| 29  | `asset_tag_assignments`          | 2       | 014_digital_asset_lifecycle.sql               | No       | No    |
| 30  | `asset_tags`                     | 7       | 014_digital_asset_lifecycle.sql               | No       | No    |
| 31  | `asset_versions`                 | 15      | 014_digital_asset_lifecycle.sql               | No       | No    |
| 32  | `assets`                         | 43      | 001_initial_schema.sql                        | No       | No    |
| 33  | `audit_count_items`              | 14      | 019_asset_inventory_logistics_warehousing.sql | No       | No    |
| 34  | `automation_executions`          | 11      | 034_v2_feature_gaps.sql                       | Yes      | No    |
| 35  | `automation_logs`                | 9       | 005_productive_features.sql                   | No       | No    |
| 36  | `automation_rules`               | 11      | 005_productive_features.sql                   | Yes      | No    |
| 37  | `automations`                    | 15      | 005_productive_features.sql                   | Yes      | No    |
| 38  | `bom_lines`                      | 18      | 021_integrated_production_lifecycle.sql       | No       | No    |
| 39  | `boms`                           | 21      | 021_integrated_production_lifecycle.sql       | No       | No    |
| 40  | `brand_guideline_sections`       | 11      | 015_creative_brand_campaign.sql               | No       | No    |
| 41  | `brand_guideline_versions`       | 7       | 015_creative_brand_campaign.sql               | No       | No    |
| 42  | `brand_guidelines`               | 13      | 015_creative_brand_campaign.sql               | No       | No    |
| 43  | `brand_kits`                     | 12      | 001_initial_schema.sql                        | No       | No    |
| 44  | `brands`                         | 26      | 029_role_based_rls.sql                        | Yes      | No    |
| 45  | `brief_pipeline`                 | 0       | 015_creative_brand_campaign.sql               | No       | Yes   |
| 46  | `brief_templates`                | 13      | 015_creative_brand_campaign.sql               | No       | No    |
| 47  | `budget_alerts`                  | 9       | 033_competitive_feature_gaps.sql              | Yes      | No    |
| 48  | `budget_approvals`               | 22      | 016_legal_compliance_finance_procurement.sql  | No       | No    |
| 49  | `budget_line_items`              | 20      | 002_extended_schema.sql                       | No       | No    |
| 50  | `budgets`                        | 20      | 003_production_lifecycle.sql                  | No       | No    |
| 51  | `bulk_import_jobs`               | 18      | 054_bulk_export_infrastructure.sql            | Yes      | No    |
| 52  | `calendar_events`                | 13      | 001_initial_schema.sql                        | No       | No    |
| 53  | `call_sheet_crew`                | 15      | 006_workflow_documents.sql                    | Yes      | No    |
| 54  | `call_sheets`                    | 35      | 006_workflow_documents.sql                    | Yes      | No    |
| 55  | `campaign_assets`                | 21      | 015_creative_brand_campaign.sql               | No       | No    |
| 56  | `campaign_channels`              | 12      | 015_creative_brand_campaign.sql               | No       | No    |
| 57  | `campaign_kpis`                  | 13      | 015_creative_brand_campaign.sql               | No       | No    |
| 58  | `campaign_metrics`               | 9       | 015_creative_brand_campaign.sql               | No       | No    |
| 59  | `campaign_overview`              | 0       | 015_creative_brand_campaign.sql               | No       | Yes   |
| 60  | `campaigns`                      | 29      | 015_creative_brand_campaign.sql               | No       | No    |
| 61  | `case_studies`                   | 20      | 001_initial_schema.sql                        | No       | No    |
| 62  | `case_study_metrics`             | 5       | 001_initial_schema.sql                        | No       | No    |
| 63  | `catalog_categories`             | 15      | 047_master_catalog.sql                        | Yes      | No    |
| 64  | `catalog_item_modifiers`         | 13      | 047_master_catalog.sql                        | Yes      | No    |
| 65  | `catalog_items`                  | 26      | 047_master_catalog.sql                        | Yes      | No    |
| 66  | `catalog_modifier_options`       | 11      | 047_master_catalog.sql                        | No       | No    |
| 67  | `catalog_org_overrides`          | 15      | 047_master_catalog.sql                        | Yes      | No    |
| 68  | `certifications`                 | 8       | 001_initial_schema.sql                        | No       | No    |
| 69  | `change_order_log`               | 11      | 013_crm_revenue_pipeline.sql                  | No       | No    |
| 70  | `change_orders`                  | 32      | 013_crm_revenue_pipeline.sql                  | No       | No    |
| 71  | `channel_templates`              | 10      | 046_messaging_foundation.sql                  | No       | No    |
| 72  | `checklist_templates`            | 12      | 008_vendor_contractor_lifecycle.sql           | No       | No    |
| 73  | `classification_assessments`     | 18      | 011_unified_workforce.sql                     | No       | No    |
| 74  | `client_invoices`                | 38      | 007_sow_lifecycle.sql                         | Yes      | No    |
| 75  | `comm_channels`                  | 13      | 020_live_event_operations.sql                 | Yes      | No    |
| 76  | `comm_log_entries`               | 14      | 020_live_event_operations.sql                 | No       | No    |
| 77  | `command_positions`              | 15      | 020_live_event_operations.sql                 | No       | No    |
| 78  | `comments`                       | 10      | 002_extended_schema.sql                       | No       | No    |
| 79  | `companies`                      | 37      | 005_productive_features.sql                   | Yes      | No    |
| 80  | `compliance_checklists`          | 23      | 016_legal_compliance_finance_procurement.sql  | No       | No    |
| 81  | `compliance_requirements`        | 16      | 008_vendor_contractor_lifecycle.sql           | No       | No    |
| 82  | `compliance_templates`           | 17      | 011_unified_workforce.sql                     | No       | No    |
| 83  | `consumable_usage`               | 9       | 003_production_lifecycle.sql                  | No       | No    |
| 84  | `consumables`                    | 23      | 003_production_lifecycle.sql                  | No       | No    |
| 85  | `contacts`                       | 25      | 005_productive_features.sql                   | Yes      | No    |
| 86  | `contract_amendments`            | 25      | 016_legal_compliance_finance_procurement.sql  | No       | No    |
| 87  | `contract_clauses`               | 17      | 016_legal_compliance_finance_procurement.sql  | No       | No    |
| 88  | `contract_obligations`           | 21      | 016_legal_compliance_finance_procurement.sql  | No       | No    |
| 89  | `contracts`                      | 24      | 003_production_lifecycle.sql                  | No       | No    |
| 90  | `conversation_members`           | 10      | 046_messaging_foundation.sql                  | Yes      | No    |
| 91  | `conversations`                  | 20      | 046_messaging_foundation.sql                  | Yes      | No    |
| 92  | `creative_briefs`                | 42      | 015_creative_brand_campaign.sql               | No       | No    |
| 93  | `creative_reviews`               | 12      | 015_creative_brand_campaign.sql               | No       | No    |
| 94  | `credential_assignments`         | 30      | 051_credentialing_ticketing.sql               | Yes      | No    |
| 95  | `credential_inventory_pools`     | 14      | 051_credentialing_ticketing.sql               | Yes      | No    |
| 96  | `credential_scan_log`            | 13      | 051_credentialing_ticketing.sql               | Yes      | No    |
| 97  | `credential_types`               | 14      | 051_credentialing_ticketing.sql               | Yes      | No    |
| 98  | `credit_notes`                   | 13      | 005_productive_features.sql                   | No       | No    |
| 99  | `crew_availability`              | 9       | 003_production_lifecycle.sql                  | No       | No    |
| 100 | `crew_members`                   | 35      | 001_initial_schema.sql                        | No       | No    |
| 101 | `crew_shifts`                    | 28      | 003_production_lifecycle.sql                  | No       | No    |
| 102 | `custom_field_definitions`       | 15      | 034_v2_feature_gaps.sql                       | Yes      | No    |
| 103 | `custom_field_values`            | 12      | 005_productive_features.sql                   | Yes      | No    |
| 104 | `custom_fields`                  | 18      | 005_productive_features.sql                   | Yes      | No    |
| 105 | `dashboard_widgets`              | 15      | 005_productive_features.sql                   | Yes      | No    |
| 106 | `dashboards`                     | 11      | 005_productive_features.sql                   | Yes      | No    |
| 107 | `data_export_requests`           | 11      | 022_audit_remediation.sql                     | No       | No    |
| 108 | `data_retention_policies`        | 10      | 018_user_lifecycle_identity.sql               | No       | No    |
| 109 | `deals`                          | 26      | 001_initial_schema.sql                        | Yes      | No    |
| 110 | `deck_slides`                    | 8       | 001_initial_schema.sql                        | No       | No    |
| 111 | `decks`                          | 8       | 001_initial_schema.sql                        | No       | No    |
| 112 | `deliverable_progress_snapshots` | 13      | 007_sow_lifecycle.sql                         | Yes      | No    |
| 113 | `department_statuses`            | 15      | 020_live_event_operations.sql                 | Yes      | No    |
| 114 | `depreciation_schedules`         | 17      | 019_asset_inventory_logistics_warehousing.sql | No       | No    |
| 115 | `digital_assets`                 | 31      | 014_digital_asset_lifecycle.sql               | No       | No    |
| 116 | `dispatch_entries`               | 17      | 008_vendor_contractor_lifecycle.sql           | No       | No    |
| 117 | `document_templates`             | 12      | 005_productive_features.sql                   | No       | No    |
| 118 | `document_versions`              | 8       | 005_productive_features.sql                   | Yes      | No    |
| 119 | `documents`                      | 21      | 005_productive_features.sql                   | Yes      | No    |
| 120 | `domain_events`                  | 12      | 022_audit_remediation.sql                     | No       | No    |
| 121 | `e_signatures`                   | 18      | 006_workflow_documents.sql                    | Yes      | No    |
| 122 | `email_messages`                 | 19      | 034_v2_feature_gaps.sql                       | Yes      | No    |
| 123 | `engagement_terms`               | 23      | 011_unified_workforce.sql                     | No       | No    |
| 124 | `engineering_approvals`          | 26      | 016_legal_compliance_finance_procurement.sql  | No       | No    |
| 125 | `entity_dependencies`            | 18      | 016_legal_compliance_finance_procurement.sql  | No       | No    |
| 126 | `environmental_readings`         | 20      | 020_live_event_operations.sql                 | Yes      | No    |
| 127 | `equipment_check_ins`            | 21      | 020_live_event_operations.sql                 | Yes      | No    |
| 128 | `estimates`                      | 35      | 008_vendor_contractor_lifecycle.sql           | No       | No    |
| 129 | `event_assets`                   | 12      | 012_production_consolidation.sql              | No       | No    |
| 130 | `event_space_overlays`           | 16      | 017_location_spatial_hierarchy.sql            | No       | No    |
| 131 | `events`                         | 27      | 003_production_lifecycle.sql                  | No       | No    |
| 132 | `exchange_rates`                 | 8       | 022_audit_remediation.sql                     | No       | No    |
| 133 | `expenses`                       | 13      | 002_extended_schema.sql                       | No       | No    |
| 134 | `export_templates`               | 13      | 054_bulk_export_infrastructure.sql            | Yes      | No    |
| 135 | `feature_flag_overrides`         | 10      | 027_feature_flags.sql                         | Yes      | No    |
| 136 | `feature_flags`                  | 19      | 027_feature_flags.sql                         | Yes      | No    |
| 137 | `field_access_overrides`         | 14      | 031_field_level_rbac_pricing.sql              | No       | No    |
| 138 | `field_bundle_items`             | 4       | 031_field_level_rbac_pricing.sql              | No       | No    |
| 139 | `field_bundles`                  | 9       | 031_field_level_rbac_pricing.sql              | No       | No    |
| 140 | `field_role_access`              | 11      | 031_field_level_rbac_pricing.sql              | No       | No    |
| 141 | `field_tier_assignments`         | 8       | 031_field_level_rbac_pricing.sql              | No       | No    |
| 142 | `field_usage_daily`              | 8       | 031_field_level_rbac_pricing.sql              | No       | No    |
| 143 | `field_usage_events`             | 9       | 031_field_level_rbac_pricing.sql              | No       | No    |
| 144 | `financial_periods`              | 11      | 022_audit_remediation.sql                     | No       | No    |
| 145 | `foh_zone_readings`              | 16      | 020_live_event_operations.sql                 | Yes      | No    |
| 146 | `foh_zones`                      | 12      | 020_live_event_operations.sql                 | Yes      | No    |
| 147 | `gl_accounts`                    | 14      | 016_legal_compliance_finance_procurement.sql  | No       | No    |
| 148 | `goals`                          | 16      | 033_competitive_feature_gaps.sql              | Yes      | No    |
| 149 | `goods_receipt_lines`            | 14      | 022_audit_remediation.sql                     | No       | No    |
| 150 | `goods_receipts`                 | 20      | 016_legal_compliance_finance_procurement.sql  | No       | No    |
| 151 | `governance_audit_log`           | 15      | 016_legal_compliance_finance_procurement.sql  | No       | No    |
| 152 | `guest_incidents`                | 21      | 020_live_event_operations.sql                 | Yes      | No    |
| 153 | `idempotency_keys`               | 7       | 022_audit_remediation.sql                     | No       | No    |
| 154 | `incident_insurance_links`       | 11      | 022_audit_remediation.sql                     | No       | No    |
| 155 | `incidents`                      | 47      | 003_production_lifecycle.sql                  | No       | No    |
| 156 | `insurance_policies`             | 28      | 016_legal_compliance_finance_procurement.sql  | No       | No    |
| 157 | `insurance_requirements`         | 16      | 016_legal_compliance_finance_procurement.sql  | No       | No    |
| 158 | `integrations`                   | 9       | 002_extended_schema.sql                       | No       | No    |
| 159 | `inventory_audits`               | 19      | 019_asset_inventory_logistics_warehousing.sql | No       | No    |
| 160 | `inventory_reservations`         | 16      | 019_asset_inventory_logistics_warehousing.sql | No       | No    |
| 161 | `invitations`                    | 17      | 018_user_lifecycle_identity.sql               | No       | No    |
| 162 | `invoice_line_items`             | 20      | 007_sow_lifecycle.sql                         | Yes      | No    |
| 163 | `invoice_templates`              | 19      | 005_productive_features.sql                   | No       | No    |
| 164 | `invoice_time_entries`           | 8       | 007_sow_lifecycle.sql                         | Yes      | No    |
| 165 | `invoices`                       | 20      | 001_initial_schema.sql                        | Yes      | No    |
| 166 | `ip_rights`                      | 23      | 016_legal_compliance_finance_procurement.sql  | No       | No    |
| 167 | `job_checklists`                 | 18      | 008_vendor_contractor_lifecycle.sql           | No       | No    |
| 168 | `job_cost_entries`               | 22      | 008_vendor_contractor_lifecycle.sql           | No       | No    |
| 169 | `kit_items`                      | 10      | 019_asset_inventory_logistics_warehousing.sql | No       | No    |
| 170 | `kits`                           | 15      | 019_asset_inventory_logistics_warehousing.sql | No       | No    |
| 171 | `knowledge_article_links`        | 6       | 033_competitive_feature_gaps.sql              | Yes      | No    |
| 172 | `knowledge_articles`             | 12      | 033_competitive_feature_gaps.sql              | Yes      | No    |
| 173 | `knowledge_base_articles`        | 24      | 003_production_lifecycle.sql                  | No       | No    |
| 174 | `lead_activities`                | 7       | 004_crm_public.sql                            | Yes      | No    |
| 175 | `lead_pipeline_stats`            | 0       | 004_crm_public.sql                            | Yes      | Yes   |
| 176 | `leads`                          | 28      | 004_crm_public.sql                            | Yes      | No    |
| 177 | `legal_holds`                    | 15      | 014_digital_asset_lifecycle.sql               | No       | No    |
| 178 | `live_crew_assignments`          | 22      | 020_live_event_operations.sql                 | Yes      | No    |
| 179 | `live_event_instances`           | 32      | 020_live_event_operations.sql                 | Yes      | No    |
| 180 | `live_financial_snapshots`       | 23      | 020_live_event_operations.sql                 | Yes      | No    |
| 181 | `load_plan_items`                | 6       | 019_asset_inventory_logistics_warehousing.sql | No       | No    |
| 182 | `load_plans`                     | 17      | 019_asset_inventory_logistics_warehousing.sql | No       | No    |
| 183 | `location_compliance_docs`       | 14      | 017_location_spatial_hierarchy.sql            | No       | No    |
| 184 | `location_contacts`              | 8       | 017_location_spatial_hierarchy.sql            | No       | No    |
| 185 | `location_costs`                 | 17      | 017_location_spatial_hierarchy.sql            | No       | No    |
| 186 | `location_inspections`           | 17      | 017_location_spatial_hierarchy.sql            | No       | No    |
| 187 | `locations`                      | 62      | 003_production_lifecycle.sql                  | No       | No    |
| 188 | `login_audit_log`                | 15      | 018_user_lifecycle_identity.sql               | Yes      | No    |
| 189 | `logistics_events`               | 11      | 019_asset_inventory_logistics_warehousing.sql | No       | No    |
| 190 | `lost_reasons`                   | 6       | 005_productive_features.sql                   | No       | No    |
| 191 | `maintenance_records`            | 19      | 003_production_lifecycle.sql                  | No       | No    |
| 192 | `maintenance_schedules`          | 18      | 019_asset_inventory_logistics_warehousing.sql | No       | No    |
| 193 | `mandatory_read_acknowledgments` | 7       | 046_messaging_foundation.sql                  | Yes      | No    |
| 194 | `message_reactions`              | 5       | 046_messaging_foundation.sql                  | No       | No    |
| 195 | `message_read_receipts`          | 3       | 046_messaging_foundation.sql                  | No       | No    |
| 196 | `messages`                       | 26      | 046_messaging_foundation.sql                  | Yes      | No    |
| 197 | `messaging_escalation_rules`     | 10      | 050_messaging_production.sql                  | No       | No    |
| 198 | `milestones`                     | 23      | 002_extended_schema.sql                       | No       | No    |
| 199 | `notification_preferences`       | 20      | 006_workflow_documents.sql                    | Yes      | No    |
| 200 | `notifications`                  | 14      | 001_initial_schema.sql                        | Yes      | No    |
| 201 | `offboarding_step_progress`      | 11      | 011_unified_workforce.sql                     | No       | No    |
| 202 | `offboarding_step_templates`     | 12      | 011_unified_workforce.sql                     | No       | No    |
| 203 | `onboarding_step_definitions`    | 12      | 018_user_lifecycle_identity.sql               | Yes      | No    |
| 204 | `onboarding_step_progress`       | 12      | 011_unified_workforce.sql                     | No       | No    |
| 205 | `onboarding_step_templates`      | 14      | 011_unified_workforce.sql                     | No       | No    |
| 206 | `opportunities`                  | 28      | 013_crm_revenue_pipeline.sql                  | No       | No    |
| 207 | `opportunity_activities`         | 13      | 013_crm_revenue_pipeline.sql                  | No       | No    |
| 208 | `org_bundle_subscriptions`       | 9       | 031_field_level_rbac_pricing.sql              | No       | No    |
| 209 | `org_memberships`                | 15      | 018_user_lifecycle_identity.sql               | Yes      | No    |
| 210 | `org_subscriptions`              | 13      | 031_field_level_rbac_pricing.sql              | No       | No    |
| 211 | `organizations`                  | 7       | 001_initial_schema.sql                        | Yes      | No    |
| 212 | `payment_approvals`              | 23      | 016_legal_compliance_finance_procurement.sql  | No       | No    |
| 213 | `payments`                       | 12      | 005_productive_features.sql                   | Yes      | No    |
| 214 | `payroll_batches`                | 15      | 003_production_lifecycle.sql                  | No       | No    |
| 215 | `permission_grants`              | 11      | 028_rbac_custom_roles.sql                     | Yes      | No    |
| 216 | `permits`                        | 36      | 016_legal_compliance_finance_procurement.sql  | No       | No    |
| 217 | `pipeline_forecast`              | 0       | 013_crm_revenue_pipeline.sql                  | No       | Yes   |
| 218 | `pipelines`                      | 14      | 005_productive_features.sql                   | Yes      | No    |
| 219 | `portal_sessions`                | 7       | 034_v2_feature_gaps.sql                       | No       | No    |
| 220 | `pos_transaction_items`          | 11      | 055_external_sync_infrastructure.sql          | No       | No    |
| 221 | `pos_transactions`               | 24      | 055_external_sync_infrastructure.sql          | Yes      | No    |
| 222 | `post_event_reports`             | 32      | 020_live_event_operations.sql                 | Yes      | No    |
| 223 | `production_advance_items`       | 30      | 048_production_advances_core.sql              | Yes      | No    |
| 224 | `production_advances`            | 35      | 048_production_advances_core.sql              | Yes      | No    |
| 225 | `production_budget_lines`        | 20      | 003_production_lifecycle.sql                  | No       | No    |
| 226 | `production_checklists`          | 18      | 003_production_lifecycle.sql                  | No       | No    |
| 227 | `production_expenses`            | 25      | 003_production_lifecycle.sql                  | No       | No    |
| 228 | `production_milestones`          | 21      | 003_production_lifecycle.sql                  | No       | No    |
| 229 | `production_milestones_view`     | 0       | 012_production_consolidation.sql              | No       | Yes   |
| 230 | `production_run_inputs`          | 13      | 021_integrated_production_lifecycle.sql       | No       | No    |
| 231 | `production_runs`                | 22      | 021_integrated_production_lifecycle.sql       | No       | No    |
| 232 | `production_sops`                | 23      | 003_production_lifecycle.sql                  | No       | No    |
| 233 | `production_tasks`               | 33      | 003_production_lifecycle.sql                  | No       | No    |
| 234 | `production_tasks_view`          | 0       | 012_production_consolidation.sql              | No       | Yes   |
| 235 | `production_time_entries`        | 29      | 003_production_lifecycle.sql                  | Yes      | No    |
| 236 | `production_verticals`           | 13      | 021_integrated_production_lifecycle.sql       | No       | No    |
| 237 | `profiles`                       | 9       | 001_initial_schema.sql                        | Yes      | No    |
| 238 | `project_assignments`            | 17      | 003_production_lifecycle.sql                  | No       | No    |
| 239 | `project_locations`              | 14      | 017_location_spatial_hierarchy.sql            | No       | No    |
| 240 | `project_members`                | 5       | 001_initial_schema.sql                        | No       | No    |
| 241 | `project_templates`              | 14      | 002_extended_schema.sql                       | Yes      | No    |
| 242 | `projects`                       | 24      | 001_initial_schema.sql                        | Yes      | No    |
| 243 | `proposal_items`                 | 15      | 005_productive_features.sql                   | Yes      | No    |
| 244 | `proposals`                      | 39      | 005_productive_features.sql                   | Yes      | No    |
| 245 | `provider_connections`           | 19      | 055_external_sync_infrastructure.sql          | Yes      | No    |
| 246 | `provider_ticket_map`            | 14      | 055_external_sync_infrastructure.sql          | Yes      | No    |
| 247 | `purchase_order_items`           | 7       | 001_initial_schema.sql                        | No       | No    |
| 248 | `purchase_orders`                | 9       | 001_initial_schema.sql                        | No       | No    |
| 249 | `purchase_requisitions`          | 25      | 016_legal_compliance_finance_procurement.sql  | No       | No    |
| 250 | `qc_gates`                       | 21      | 021_integrated_production_lifecycle.sql       | No       | No    |
| 251 | `quality_check_templates`        | 9       | 033_competitive_feature_gaps.sql              | Yes      | No    |
| 252 | `quality_checks`                 | 13      | 033_competitive_feature_gaps.sql              | Yes      | No    |
| 253 | `rate_card_items`                | 15      | 005_productive_features.sql                   | Yes      | No    |
| 254 | `rate_cards`                     | 14      | 005_productive_features.sql                   | Yes      | No    |
| 255 | `readiness_gates`                | 18      | 020_live_event_operations.sql                 | Yes      | No    |
| 256 | `record_activity_log`            | 9       | 033_competitive_feature_gaps.sql              | Yes      | No    |
| 257 | `record_comments`                | 12      | 033_competitive_feature_gaps.sql              | Yes      | No    |
| 258 | `recurring_invoices`             | 21      | 005_productive_features.sql                   | Yes      | No    |
| 259 | `released_usernames`             | 6       | 039_usernames_handles.sql                     | No       | No    |
| 260 | `rental_agreement_lines`         | 15      | 021_integrated_production_lifecycle.sql       | No       | No    |
| 261 | `rental_agreements`              | 25      | 021_integrated_production_lifecycle.sql       | No       | No    |
| 262 | `report_definitions`             | 12      | 002_extended_schema.sql                       | No       | No    |
| 263 | `reserved_usernames`             | 3       | 039_usernames_handles.sql                     | No       | No    |
| 264 | `resilience_targets`             | 11      | 022_audit_remediation.sql                     | No       | No    |
| 265 | `resource_bookings`              | 22      | 005_productive_features.sql                   | Yes      | No    |
| 266 | `revenue_recognition_entries`    | 13      | 034_v2_feature_gaps.sql                       | Yes      | No    |
| 267 | `revenue_recognition_summary`    | 0       | 013_crm_revenue_pipeline.sql                  | No       | Yes   |
| 268 | `revenue_schedules`              | 23      | 013_crm_revenue_pipeline.sql                  | No       | No    |
| 269 | `review_cycles`                  | 11      | 033_competitive_feature_gaps.sql              | Yes      | No    |
| 270 | `review_feedback_requests`       | 13      | 033_competitive_feature_gaps.sql              | Yes      | No    |
| 271 | `review_stats`                   | 0       | 004_crm_public.sql                            | Yes      | Yes   |
| 272 | `reviews`                        | 17      | 004_crm_public.sql                            | Yes      | No    |
| 273 | `rfqs`                           | 22      | 003_production_lifecycle.sql                  | No       | No    |
| 274 | `rights_licenses`                | 25      | 021_integrated_production_lifecycle.sql       | No       | No    |
| 275 | `role_change_log`                | 11      | 018_user_lifecycle_identity.sql               | No       | No    |
| 276 | `role_definitions`               | 11      | 028_rbac_custom_roles.sql                     | Yes      | No    |
| 277 | `ros_cues`                       | 25      | 020_live_event_operations.sql                 | Yes      | No    |
| 278 | `saved_views`                    | 19      | 005_productive_features.sql                   | Yes      | No    |
| 279 | `scan_events`                    | 15      | 019_asset_inventory_logistics_warehousing.sql | No       | No    |
| 280 | `scenario_outcomes`              | 12      | 009_scenario_builder.sql                      | No       | No    |
| 281 | `scenario_resource_plans`        | 12      | 009_scenario_builder.sql                      | No       | No    |
| 282 | `scenario_variables`             | 12      | 009_scenario_builder.sql                      | No       | No    |
| 283 | `scenarios`                      | 14      | 009_scenario_builder.sql                      | Yes      | No    |
| 284 | `schedule_entries`               | 24      | 003_production_lifecycle.sql                  | No       | No    |
| 285 | `scopes_of_work`                 | 36      | 007_sow_lifecycle.sql                         | Yes      | No    |
| 286 | `service_health_checks`          | 11      | 055_service_health_checks.sql                 | No       | No    |
| 287 | `service_requests`               | 41      | 010_service_requests.sql                      | No       | No    |
| 288 | `setting_definitions`            | 18      | 026_settings_framework.sql                    | Yes      | No    |
| 289 | `settings`                       | 16      | 026_settings_framework.sql                    | Yes      | No    |
| 290 | `settings_change_log`            | 11      | 026_settings_framework.sql                    | Yes      | No    |
| 291 | `settings_change_requests`       | 17      | 035_settings_approval_workflow.sql            | No       | No    |
| 292 | `shifts`                         | 10      | 001_initial_schema.sql                        | No       | No    |
| 293 | `shipment_items`                 | 19      | 019_asset_inventory_logistics_warehousing.sql | No       | No    |
| 294 | `shipments`                      | 42      | 003_production_lifecycle.sql                  | No       | No    |
| 295 | `sla_definitions`                | 10      | 022_audit_remediation.sql                     | No       | No    |
| 296 | `sla_policies`                   | 13      | 034_v2_feature_gaps.sql                       | Yes      | No    |
| 297 | `sla_tracking`                   | 11      | 022_audit_remediation.sql                     | No       | No    |
| 298 | `sop_acknowledgments`            | 4       | 001_initial_schema.sql                        | No       | No    |
| 299 | `sops`                           | 8       | 001_initial_schema.sql                        | No       | No    |
| 300 | `sow_change_log`                 | 12      | 007_sow_lifecycle.sql                         | Yes      | No    |
| 301 | `sow_deliverables`               | 33      | 007_sow_lifecycle.sql                         | Yes      | No    |
| 302 | `space_bookings`                 | 19      | 017_location_spatial_hierarchy.sql            | No       | No    |
| 303 | `stakeholder_projects`           | 4       | 001_initial_schema.sql                        | No       | No    |
| 304 | `stakeholders`                   | 10      | 001_initial_schema.sql                        | No       | No    |
| 305 | `storage_objects`                | 18      | 014_digital_asset_lifecycle.sql               | No       | No    |
| 306 | `strike_sequences`               | 22      | 020_live_event_operations.sql                 | Yes      | No    |
| 307 | `survey_responses`               | 14      | 034_v2_feature_gaps.sql                       | Yes      | No    |
| 308 | `survey_templates`               | 11      | 034_v2_feature_gaps.sql                       | Yes      | No    |
| 309 | `sync_conflict_policies`         | 9       | 055_external_sync_infrastructure.sql          | Yes      | No    |
| 310 | `sync_events`                    | 17      | 055_external_sync_infrastructure.sql          | Yes      | No    |
| 311 | `task_dependencies`              | 4       | 001_initial_schema.sql                        | No       | No    |
| 312 | `tasks`                          | 37      | 001_initial_schema.sql                        | No       | No    |
| 313 | `team_members`                   | 5       | 056_teams.sql                                 | Yes      | No    |
| 314 | `teams`                          | 10      | 056_teams.sql                                 | Yes      | No    |
| 315 | `tech_sheets`                    | 47      | 006_workflow_documents.sql                    | Yes      | No    |
| 316 | `technical_specs`                | 14      | 021_integrated_production_lifecycle.sql       | No       | No    |
| 317 | `temporary_access_grants`        | 16      | 018_user_lifecycle_identity.sql               | No       | No    |
| 318 | `testimonials`                   | 21      | 004_crm_public.sql                            | Yes      | No    |
| 319 | `tier_usage_counters`            | 8       | 057_four_tier_pricing.sql                     | No       | No    |
| 320 | `time_entries`                   | 15      | 002_extended_schema.sql                       | No       | No    |
| 321 | `time_off_requests`              | 17      | 005_productive_features.sql                   | Yes      | No    |
| 322 | `time_tracking_policies`         | 14      | 034_v2_feature_gaps.sql                       | Yes      | No    |
| 323 | `upsell_events`                  | 8       | 031_field_level_rbac_pricing.sql              | No       | No    |
| 324 | `upsell_triggers`                | 11      | 031_field_level_rbac_pricing.sql              | No       | No    |
| 325 | `user_compliance_acks`           | 10      | 018_user_lifecycle_identity.sql               | No       | No    |
| 326 | `user_onboarding_progress`       | 9       | 018_user_lifecycle_identity.sql               | Yes      | No    |
| 327 | `user_preferences`               | 6       | 018_user_lifecycle_identity.sql               | No       | No    |
| 328 | `user_profiles`                  | 19      | 018_user_lifecycle_identity.sql               | Yes      | No    |
| 329 | `user_profiles_with_org`         | 0       | 018_user_lifecycle_identity.sql               | No       | Yes   |
| 330 | `user_sessions`                  | 16      | 018_user_lifecycle_identity.sql               | Yes      | No    |
| 331 | `username_change_log`            | 7       | 039_usernames_handles.sql                     | No       | No    |
| 332 | `v_budget_profitability`         | 0       | 033_competitive_feature_gaps.sql              | Yes      | Yes   |
| 333 | `v_client_invoice_aging`         | 0       | 007_sow_lifecycle.sql                         | No       | Yes   |
| 334 | `v_crew_utilization`             | 0       | 005_productive_features.sql                   | Yes      | Yes   |
| 335 | `v_invoice_aging`                | 0       | 005_productive_features.sql                   | Yes      | Yes   |
| 336 | `v_location_compliance_summary`  | 0       | 017_location_spatial_hierarchy.sql            | No       | Yes   |
| 337 | `v_location_hierarchy`           | 0       | 017_location_spatial_hierarchy.sql            | No       | Yes   |
| 338 | `v_location_profitability`       | 0       | 017_location_spatial_hierarchy.sql            | No       | Yes   |
| 339 | `v_pipeline_summary`             | 0       | 005_productive_features.sql                   | Yes      | Yes   |
| 340 | `v_project_production_summary`   | 0       | 021_integrated_production_lifecycle.sql       | No       | Yes   |
| 341 | `v_project_profitability`        | 0       | 005_productive_features.sql                   | Yes      | Yes   |
| 342 | `v_revenue_recognition_summary`  | 0       | 034_v2_feature_gaps.sql                       | Yes      | Yes   |
| 343 | `v_sla_status`                   | 0       | 034_v2_feature_gaps.sql                       | Yes      | Yes   |
| 344 | `v_sow_deliverable_summary`      | 0       | 007_sow_lifecycle.sql                         | No       | Yes   |
| 345 | `v_sow_summary`                  | 0       | 007_sow_lifecycle.sql                         | No       | Yes   |
| 346 | `v_time_tracking_compliance`     | 0       | 034_v2_feature_gaps.sql                       | Yes      | Yes   |
| 347 | `v_vertical_budget_summary`      | 0       | 021_integrated_production_lifecycle.sql       | No       | Yes   |
| 348 | `v_work_package_cost_summary`    | 0       | 021_integrated_production_lifecycle.sql       | No       | Yes   |
| 349 | `vault_documents`                | 14      | 001_initial_schema.sql                        | No       | No    |
| 350 | `vehicles`                       | 23      | 001_initial_schema.sql                        | No       | No    |
| 351 | `vendor_communications`          | 14      | 008_vendor_contractor_lifecycle.sql           | No       | No    |
| 352 | `vendor_compliance_docs`         | 22      | 008_vendor_contractor_lifecycle.sql           | No       | No    |
| 353 | `vendor_portal_tokens`           | 10      | 008_vendor_contractor_lifecycle.sql           | No       | No    |
| 354 | `vendor_reviews`                 | 21      | 008_vendor_contractor_lifecycle.sql           | No       | No    |
| 355 | `vendor_risk_scores`             | 19      | 016_legal_compliance_finance_procurement.sql  | No       | No    |
| 356 | `vendor_vertical_capabilities`   | 6       | 021_integrated_production_lifecycle.sql       | No       | No    |
| 357 | `vendors`                        | 36      | 001_initial_schema.sql                        | No       | No    |
| 358 | `vip_guests`                     | 20      | 020_live_event_operations.sql                 | Yes      | No    |
| 359 | `vip_service_requests`           | 15      | 020_live_event_operations.sql                 | No       | No    |
| 360 | `warehouse_locations`            | 16      | 019_asset_inventory_logistics_warehousing.sql | No       | No    |
| 361 | `warehouse_zones`                | 17      | 019_asset_inventory_logistics_warehousing.sql | No       | No    |
| 362 | `warehouses`                     | 27      | 003_production_lifecycle.sql                  | No       | No    |
| 363 | `webhook_events`                 | 14      | 055_external_sync_infrastructure.sql          | Yes      | No    |
| 364 | `work_order_bids`                | 15      | 008_vendor_contractor_lifecycle.sql           | No       | No    |
| 365 | `work_orders`                    | 40      | 008_vendor_contractor_lifecycle.sql           | No       | No    |
| 366 | `work_package_dependencies`      | 8       | 021_integrated_production_lifecycle.sql       | No       | No    |
| 367 | `work_packages`                  | 34      | 021_integrated_production_lifecycle.sql       | No       | No    |
| 368 | `worker_classifications`         | 39      | 011_unified_workforce.sql                     | No       | No    |
| 369 | `worker_compliance_docs`         | 22      | 011_unified_workforce.sql                     | No       | No    |
| 370 | `worker_offboarding_runs`        | 18      | 011_unified_workforce.sql                     | No       | No    |
| 371 | `worker_onboarding_runs`         | 14      | 011_unified_workforce.sql                     | No       | No    |
| 372 | `worker_profiles`                | 39      | 011_unified_workforce.sql                     | No       | No    |
| 373 | `worker_reviews`                 | 28      | 011_unified_workforce.sql                     | No       | No    |
| 374 | `workflow_instances`             | 16      | 006_workflow_documents.sql                    | Yes      | No    |
| 375 | `workflow_step_approvals`        | 13      | 006_workflow_documents.sql                    | Yes      | No    |

## Appendix B: Query Coverage by Table

| Table                            | select | insert | update | upsert | delete | Total |
| -------------------------------- | ------ | ------ | ------ | ------ | ------ | ----- |
| `access_audit_log`               | 0      | 0      | 0      | 1      | 0      | 1     |
| `activations`                    | 1      | 0      | 0      | 0      | 0      | 1     |
| `active_timers`                  | 0      | 2      | 0      | 0      | 2      | 4     |
| `advance_status_history`         | 0      | 2      | 0      | 0      | 0      | 2     |
| `advance_templates`              | 0      | 3      | 2      | 0      | 0      | 5     |
| `ai_report_queries`              | 0      | 2      | 0      | 0      | 0      | 2     |
| `approval_steps`                 | 1      | 5      | 2      | 0      | 0      | 8     |
| `approval_workflows`             | 0      | 5      | 0      | 0      | 0      | 5     |
| `automation_executions`          | 0      | 3      | 0      | 0      | 0      | 3     |
| `automation_rules`               | 0      | 1      | 0      | 0      | 0      | 1     |
| `automations`                    | 0      | 3      | 0      | 0      | 0      | 3     |
| `brands`                         | 0      | 0      | 1      | 0      | 0      | 1     |
| `budget_alerts`                  | 0      | 1      | 1      | 0      | 0      | 2     |
| `bulk_import_jobs`               | 0      | 3      | 0      | 0      | 0      | 3     |
| `call_sheet_crew`                | 0      | 1      | 0      | 0      | 0      | 1     |
| `call_sheets`                    | 0      | 3      | 1      | 0      | 0      | 4     |
| `catalog_categories`             | 3      | 0      | 0      | 0      | 0      | 3     |
| `catalog_item_modifiers`         | 1      | 0      | 0      | 0      | 0      | 1     |
| `catalog_items`                  | 3      | 0      | 0      | 0      | 0      | 3     |
| `catalog_org_overrides`          | 2      | 0      | 0      | 0      | 0      | 2     |
| `client_invoices`                | 0      | 4      | 0      | 0      | 0      | 4     |
| `comm_channels`                  | 1      | 0      | 0      | 0      | 0      | 1     |
| `companies`                      | 1      | 4      | 1      | 0      | 0      | 6     |
| `contacts`                       | 0      | 4      | 0      | 0      | 0      | 4     |
| `conversation_members`           | 3      | 0      | 0      | 0      | 0      | 3     |
| `conversations`                  | 2      | 0      | 0      | 0      | 0      | 2     |
| `credential_assignments`         | 1      | 3      | 0      | 0      | 0      | 4     |
| `credential_inventory_pools`     | 0      | 3      | 1      | 0      | 0      | 4     |
| `credential_scan_log`            | 1      | 2      | 0      | 0      | 0      | 3     |
| `credential_types`               | 0      | 3      | 1      | 0      | 0      | 4     |
| `custom_field_definitions`       | 0      | 1      | 0      | 2      | 0      | 3     |
| `custom_field_values`            | 0      | 0      | 0      | 4      | 0      | 4     |
| `custom_fields`                  | 0      | 0      | 0      | 2      | 0      | 2     |
| `dashboard_widgets`              | 0      | 1      | 1      | 0      | 0      | 2     |
| `dashboards`                     | 0      | 3      | 0      | 0      | 0      | 3     |
| `deals`                          | 0      | 1      | 0      | 0      | 0      | 1     |
| `deliverable_progress_snapshots` | 0      | 2      | 0      | 0      | 0      | 2     |
| `department_statuses`            | 1      | 0      | 0      | 0      | 0      | 1     |
| `document_versions`              | 0      | 2      | 0      | 0      | 0      | 2     |
| `documents`                      | 0      | 4      | 0      | 0      | 0      | 4     |
| `e_signatures`                   | 0      | 0      | 0      | 2      | 0      | 2     |
| `email_messages`                 | 0      | 2      | 0      | 0      | 0      | 2     |
| `environmental_readings`         | 1      | 0      | 0      | 0      | 0      | 1     |
| `equipment_check_ins`            | 1      | 0      | 0      | 0      | 0      | 1     |
| `export_templates`               | 0      | 2      | 1      | 0      | 0      | 3     |
| `feature_flag_overrides`         | 1      | 1      | 0      | 1      | 0      | 3     |
| `feature_flags`                  | 1      | 1      | 0      | 2      | 0      | 4     |
| `foh_zone_readings`              | 1      | 0      | 0      | 0      | 0      | 1     |
| `foh_zones`                      | 1      | 0      | 0      | 0      | 0      | 1     |
| `goals`                          | 0      | 2      | 1      | 0      | 0      | 3     |
| `guest_incidents`                | 0      | 0      | 1      | 0      | 0      | 1     |
| `invoice_line_items`             | 0      | 3      | 1      | 0      | 0      | 4     |
| `invoice_time_entries`           | 0      | 2      | 0      | 0      | 0      | 2     |
| `invoices`                       | 0      | 1      | 0      | 0      | 0      | 1     |
| `knowledge_article_links`        | 0      | 2      | 0      | 0      | 0      | 2     |
| `knowledge_articles`             | 0      | 4      | 0      | 0      | 0      | 4     |
| `lead_activities`                | 0      | 1      | 0      | 0      | 0      | 1     |
| `lead_pipeline_stats`            | 1      | 0      | 0      | 0      | 0      | 1     |
| `leads`                          | 0      | 5      | 0      | 0      | 0      | 5     |
| `live_crew_assignments`          | 0      | 0      | 2      | 0      | 0      | 2     |
| `live_event_instances`           | 0      | 0      | 1      | 0      | 0      | 1     |
| `live_financial_snapshots`       | 1      | 0      | 0      | 0      | 0      | 1     |
| `login_audit_log`                | 1      | 0      | 0      | 0      | 0      | 1     |
| `mandatory_read_acknowledgments` | 0      | 0      | 1      | 0      | 0      | 1     |
| `messages`                       | 6      | 0      | 0      | 0      | 0      | 6     |
| `notification_preferences`       | 0      | 0      | 0      | 6      | 0      | 6     |
| `notifications`                  | 0      | 3      | 0      | 2      | 0      | 5     |
| `onboarding_step_definitions`    | 1      | 0      | 0      | 0      | 0      | 1     |
| `org_memberships`                | 6      | 0      | 1      | 2      | 0      | 9     |
| `organizations`                  | 1      | 0      | 0      | 1      | 0      | 2     |
| `payments`                       | 0      | 2      | 0      | 0      | 0      | 2     |
| `permission_grants`              | 0      | 0      | 0      | 2      | 0      | 2     |
| `pipelines`                      | 0      | 2      | 1      | 0      | 0      | 3     |
| `pos_transactions`               | 2      | 0      | 0      | 0      | 0      | 2     |
| `post_event_reports`             | 1      | 0      | 0      | 0      | 0      | 1     |
| `production_advance_items`       | 0      | 3      | 3      | 0      | 0      | 6     |
| `production_advances`            | 1      | 2      | 3      | 0      | 0      | 6     |
| `production_time_entries`        | 0      | 1      | 1      | 0      | 0      | 2     |
| `profiles`                       | 0      | 0      | 2      | 2      | 0      | 4     |
| `project_templates`              | 0      | 3      | 0      | 0      | 0      | 3     |
| `projects`                       | 1      | 0      | 0      | 0      | 0      | 1     |
| `proposal_items`                 | 0      | 1      | 0      | 0      | 0      | 1     |
| `proposals`                      | 0      | 4      | 0      | 0      | 0      | 4     |
| `provider_connections`           | 0      | 3      | 1      | 0      | 1      | 5     |
| `provider_ticket_map`            | 1      | 0      | 0      | 0      | 0      | 1     |
| `quality_check_templates`        | 1      | 0      | 0      | 0      | 0      | 1     |
| `quality_checks`                 | 0      | 3      | 1      | 0      | 0      | 4     |
| `rate_card_items`                | 0      | 2      | 0      | 0      | 0      | 2     |
| `rate_cards`                     | 0      | 3      | 0      | 0      | 0      | 3     |
| `readiness_gates`                | 0      | 0      | 1      | 0      | 0      | 1     |
| `record_activity_log`            | 1      | 0      | 0      | 0      | 0      | 1     |
| `record_comments`                | 0      | 2      | 0      | 0      | 0      | 2     |
| `recurring_invoices`             | 0      | 2      | 0      | 0      | 0      | 2     |
| `resource_bookings`              | 0      | 4      | 0      | 0      | 0      | 4     |
| `revenue_recognition_entries`    | 0      | 1      | 0      | 1      | 0      | 2     |
| `review_cycles`                  | 1      | 0      | 0      | 0      | 0      | 1     |
| `review_feedback_requests`       | 0      | 1      | 0      | 0      | 0      | 1     |
| `review_stats`                   | 1      | 0      | 0      | 0      | 0      | 1     |
| `reviews`                        | 1      | 0      | 0      | 0      | 0      | 1     |
| `role_definitions`               | 0      | 1      | 0      | 2      | 0      | 3     |
| `ros_cues`                       | 0      | 0      | 2      | 0      | 0      | 2     |
| `saved_views`                    | 0      | 3      | 1      | 0      | 0      | 4     |
| `scenarios`                      | 1      | 0      | 0      | 0      | 0      | 1     |
| `scopes_of_work`                 | 0      | 3      | 1      | 0      | 0      | 4     |
| `setting_definitions`            | 1      | 0      | 0      | 1      | 0      | 2     |
| `settings`                       | 1      | 0      | 1      | 3      | 0      | 5     |
| `settings_change_log`            | 0      | 1      | 0      | 0      | 0      | 1     |
| `sla_policies`                   | 0      | 2      | 0      | 0      | 0      | 2     |
| `sow_change_log`                 | 0      | 1      | 0      | 0      | 0      | 1     |
| `sow_deliverables`               | 0      | 3      | 1      | 0      | 1      | 5     |
| `strike_sequences`               | 1      | 0      | 0      | 0      | 0      | 1     |
| `survey_responses`               | 0      | 2      | 0      | 0      | 0      | 2     |
| `survey_templates`               | 0      | 3      | 0      | 0      | 0      | 3     |
| `sync_conflict_policies`         | 0      | 2      | 1      | 0      | 0      | 3     |
| `sync_events`                    | 1      | 0      | 0      | 0      | 0      | 1     |
| `team_members`                   | 1      | 0      | 0      | 0      | 0      | 1     |
| `teams`                          | 1      | 0      | 0      | 0      | 0      | 1     |
| `tech_sheets`                    | 0      | 4      | 0      | 0      | 0      | 4     |
| `testimonials`                   | 0      | 3      | 0      | 0      | 0      | 3     |
| `time_off_requests`              | 0      | 3      | 1      | 0      | 0      | 4     |
| `time_tracking_policies`         | 0      | 0      | 0      | 2      | 0      | 2     |
| `user_onboarding_progress`       | 1      | 0      | 0      | 0      | 0      | 1     |
| `user_profiles`                  | 2      | 0      | 0      | 0      | 0      | 2     |
| `user_sessions`                  | 0      | 0      | 2      | 0      | 0      | 2     |
| `v_budget_profitability`         | 1      | 0      | 0      | 0      | 0      | 1     |
| `v_crew_utilization`             | 1      | 0      | 1      | 0      | 0      | 2     |
| `v_invoice_aging`                | 1      | 0      | 0      | 0      | 0      | 1     |
| `v_pipeline_summary`             | 1      | 0      | 0      | 0      | 0      | 1     |
| `v_project_profitability`        | 1      | 0      | 0      | 0      | 0      | 1     |
| `v_revenue_recognition_summary`  | 0      | 0      | 0      | 1      | 0      | 1     |
| `v_sla_status`                   | 0      | 1      | 0      | 0      | 0      | 1     |
| `v_time_tracking_compliance`     | 0      | 1      | 0      | 0      | 0      | 1     |
| `vip_guests`                     | 1      | 0      | 0      | 0      | 0      | 1     |
| `webhook_events`                 | 1      | 0      | 0      | 0      | 0      | 1     |
| `workflow_instances`             | 1      | 6      | 7      | 0      | 0      | 14    |
| `workflow_step_approvals`        | 2      | 7      | 1      | 0      | 0      | 10    |

## Verdict

**FAIL** — 396 error(s) found. See sections above for details.
