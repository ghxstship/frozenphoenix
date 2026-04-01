/* ═══════════════════════════════════════════════════════════════
   API ROUTE CONFIG REGISTRY

   Centralizes per-entity API route configurations (filters,
   immutable columns) that were previously scattered across ~435
   individual route.ts files. Used by catch-all API routes.
   ═══════════════════════════════════════════════════════════════ */

import type { FilterOperator } from "./crud-factory";

export interface CollectionRouteConfig {
    entity: string;
    filters: Array<{ column: string; operator: FilterOperator }>;
}

export interface ItemRouteConfig {
    entity: string;
    immutableColumns: string[];
}

export const COLLECTION_ROUTES: Record<string, CollectionRouteConfig> = {
    "access-audit-log": { entity: "access_audit_log", filters: [] },
    "account-health-scores": { entity: "account_health_score", filters: [] },
    activations: {
        entity: "activation",
        filters: [
            { column: "status", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "event_id", operator: "eq" },
            { column: "location_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "active-timers": {
        entity: "active_timer",
        filters: [
            { column: "user_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "activity-log": {
        entity: "activity_log_entry",
        filters: [
            { column: "entity_type", operator: "eq" },
            { column: "entity_id", operator: "eq" },
            { column: "user_id", operator: "eq" },
        ],
    },
    "advance-status-history": { entity: "advance_status_history", filters: [] },
    "ai-report-queries": {
        entity: "ai_report_query",
        filters: [{ column: "organization_id", operator: "eq" }],
    },
    "approval-steps": { entity: "approval_step", filters: [] },
    "approval-workflows": { entity: "approval_workflow", filters: [] },
    approvals: {
        entity: "approval",
        filters: [
            { column: "status", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "approver_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "asset-assignments": {
        entity: "asset_assignment",
        filters: [
            { column: "project_id", operator: "eq" },
            { column: "asset_id", operator: "eq" },
        ],
    },
    "asset-tags": { entity: "asset_tag", filters: [] },
    "asset-versions": { entity: "asset_version", filters: [] },
    assets: {
        entity: "asset",
        filters: [
            { column: "category", operator: "eq" },
            { column: "condition", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "automation-executions": { entity: "automation_execution", filters: [] },
    "automation-logs": {
        entity: "automation_log",
        filters: [
            { column: "automation_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "automation-rules": { entity: "automation_rule", filters: [] },
    automations: {
        entity: "automation",
        filters: [
            { column: "status", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    boms: { entity: "bom", filters: [] },
    "brand-guideline-sections": { entity: "brand_guideline_section", filters: [] },
    "brand-guidelines": {
        entity: "brand_guideline",
        filters: [{ column: "organization_id", operator: "eq" }],
    },
    "brand-kits": { entity: "brand_kit", filters: [{ column: "organization_id", operator: "eq" }] },
    brands: { entity: "brand", filters: [] },
    "brief-templates": { entity: "brief_template", filters: [] },
    briefs: {
        entity: "creative_brief",
        filters: [
            { column: "status", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "campaign_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "budget-approvals": {
        entity: "budget_approval",
        filters: [
            { column: "status", operator: "eq" },
            { column: "budget_id", operator: "eq" },
            { column: "approver_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "budget-line-items": {
        entity: "budget_line_item",
        filters: [
            { column: "project_id", operator: "eq" },
            { column: "category", operator: "eq" },
        ],
    },
    budgets: {
        entity: "budget",
        filters: [
            { column: "status", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "calendar-events": {
        entity: "calendar_event",
        filters: [{ column: "project_id", operator: "eq" }],
    },
    "call-sheets": {
        entity: "call_sheet",
        filters: [
            { column: "event_id", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "campaign-assets": {
        entity: "campaign_asset",
        filters: [{ column: "campaign_id", operator: "eq" }],
    },
    "campaign-channels": {
        entity: "campaign_channel",
        filters: [{ column: "campaign_id", operator: "eq" }],
    },
    "campaign-kpis": {
        entity: "campaign_kpi",
        filters: [{ column: "campaign_id", operator: "eq" }],
    },
    campaigns: {
        entity: "campaign",
        filters: [
            { column: "status", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "case-studies": {
        entity: "case_study",
        filters: [
            { column: "status", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "catalog-categories": { entity: "catalog_category", filters: [] },
    "catalog-items": { entity: "catalog_item", filters: [] },
    certifications: {
        entity: "certification",
        filters: [
            { column: "cert_type", operator: "eq" },
            { column: "asset_id", operator: "eq" },
            { column: "status", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "change-orders": {
        entity: "change_order",
        filters: [
            { column: "status", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "channel-templates": { entity: "channel_template", filters: [] },
    "checklist-templates": { entity: "checklist_template", filters: [] },
    checklists: { entity: "checklist", filters: [] },
    "clause-library": { entity: "clause_library_entry", filters: [] },
    "client-invoices": {
        entity: "client_invoice",
        filters: [
            { column: "status", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "comm-channels": { entity: "comm_channel", filters: [] },
    "command-positions": { entity: "command_position", filters: [] },
    comments: {
        entity: "comment",
        filters: [
            { column: "entity_type", operator: "eq" },
            { column: "entity_id", operator: "eq" },
        ],
    },
    companies: {
        entity: "company",
        filters: [
            { column: "industry", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "compliance-checklists": {
        entity: "compliance_checklist",
        filters: [
            { column: "status", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "compliance-requirements": { entity: "compliance_requirement", filters: [] },
    "compliance-templates": { entity: "compliance_template", filters: [] },
    "consumable-usage": {
        entity: "consumable_usage",
        filters: [
            { column: "consumable_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    consumables: { entity: "consumable", filters: [] },
    conversations: { entity: "conversation", filters: [] },
    contacts: {
        entity: "contact",
        filters: [
            { column: "company_id", operator: "eq" },
            { column: "status", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "contract-amendments": { entity: "contract_amendment", filters: [] },
    "contract-obligations": {
        entity: "contract_obligation",
        filters: [{ column: "contract_id", operator: "eq" }],
    },
    contracts: {
        entity: "contract",
        filters: [
            { column: "status", operator: "eq" },
            { column: "vendor_id", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "contract_type", operator: "eq" },
        ],
    },
    "creative-reviews": { entity: "creative_review", filters: [] },
    "credential-assignments": { entity: "credential_assignment", filters: [] },
    "credential-inventory-pools": { entity: "credential_inventory_pool", filters: [] },
    "credential-types": { entity: "credential_type", filters: [] },
    "credit-notes": {
        entity: "credit_note",
        filters: [
            { column: "status", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    crew: {
        entity: "crew_member",
        filters: [
            { column: "status", operator: "eq" },
            { column: "role", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "crew-availability": {
        entity: "crew_availability",
        filters: [{ column: "crew_member_id", operator: "eq" }],
    },
    "crew-members": {
        entity: "crew_member",
        filters: [
            { column: "status", operator: "eq" },
            { column: "department", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "crew-shifts": {
        entity: "crew_shift",
        filters: [
            { column: "status", operator: "eq" },
            { column: "crew_member_id", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "event_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "custom-field-definitions": { entity: "custom_field_definition", filters: [] },
    "custom-field-values": {
        entity: "custom_field_value",
        filters: [
            { column: "entity_type", operator: "eq" },
            { column: "entity_id", operator: "eq" },
            { column: "field_definition_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "dashboard-widgets": { entity: "dashboard_widget", filters: [] },
    dashboards: {
        entity: "dashboard",
        filters: [
            { column: "owner_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "data-export-requests": { entity: "data_export_request", filters: [] },
    "data-retention-policies": { entity: "data_retention_policy", filters: [] },
    deals: {
        entity: "deal",
        filters: [
            { column: "stage", operator: "eq" },
            { column: "pipeline_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    decks: {
        entity: "deck",
        filters: [
            { column: "status", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "department-statuses": {
        entity: "department_status",
        filters: [
            { column: "department_name", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "depreciation-schedules": { entity: "depreciation_schedule", filters: [] },
    "digital-assets": {
        entity: "digital_asset",
        filters: [
            { column: "type", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    dispatch: {
        entity: "dispatch_entry",
        filters: [
            { column: "status", operator: "eq" },
            { column: "crew_member_id", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "document-templates": { entity: "document_template", filters: [] },
    "document-versions": { entity: "document_version", filters: [] },
    documents: {
        entity: "document",
        filters: [
            { column: "status", operator: "eq" },
            { column: "type", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "domain-events": { entity: "domain_event", filters: [] },
    "e-signatures": { entity: "e_signature", filters: [] },
    "email-messages": { entity: "email_message", filters: [] },
    "engagement-terms": { entity: "engagement_term", filters: [] },
    "engineering-approvals": {
        entity: "engineering_approval",
        filters: [
            { column: "status", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "approver_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "environmental-readings": { entity: "environmental_reading", filters: [] },
    "equipment-check-ins": { entity: "equipment_check_in", filters: [] },
    estimates: {
        entity: "estimate",
        filters: [
            { column: "status", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    events: {
        entity: "live_event",
        filters: [
            { column: "status", operator: "eq" },
            { column: "type", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "expense-reports": { entity: "expense_report", filters: [] },
    expenses: {
        entity: "expense",
        filters: [
            { column: "status", operator: "eq" },
            { column: "category", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "feature-flags": { entity: "feature_flag", filters: [] },
    "financial-periods": {
        entity: "financial_period",
        filters: [
            { column: "status", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    fleet: {
        entity: "vehicle",
        filters: [
            { column: "status", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "foh-zone-readings": { entity: "foh_zone_reading", filters: [] },
    "foh-zones": { entity: "foh_zone", filters: [] },
    "gl-accounts": {
        entity: "gl_account",
        filters: [
            { column: "type", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    goals: { entity: "goal", filters: [] },
    "goods-receipts": {
        entity: "goods_receipt",
        filters: [
            { column: "status", operator: "eq" },
            { column: "purchase_order_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "guest-incidents": {
        entity: "guest_incident",
        filters: [
            { column: "status", operator: "eq" },
            { column: "severity", operator: "eq" },
            { column: "event_instance_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "hr-certifications": {
        entity: "hr_certification",
        filters: [
            { column: "status", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    incidents: {
        entity: "incident",
        filters: [
            { column: "status", operator: "eq" },
            { column: "severity", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "event_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "insurance-policies": {
        entity: "insurance_policy",
        filters: [
            { column: "status", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "insurance-requirements": { entity: "insurance_requirement", filters: [] },
    integrations: {
        entity: "integration",
        filters: [
            { column: "type", operator: "eq" },
            { column: "status", operator: "eq" },
        ],
    },
    "inventory-audits": { entity: "inventory_audit", filters: [] },
    "inventory-reservations": { entity: "inventory_reservation", filters: [] },
    "invoice-templates": {
        entity: "invoice_template",
        filters: [{ column: "organization_id", operator: "eq" }],
    },
    "invoice-line-items": {
        entity: "invoice_line_item",
        filters: [{ column: "invoice_id", operator: "eq" }],
    },
    invoices: {
        entity: "invoice",
        filters: [
            { column: "status", operator: "eq" },
            { column: "vendor_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
            { column: "invoice_type", operator: "eq" },
        ],
    },
    "ip-rights": {
        entity: "ip_right",
        filters: [
            { column: "status", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "job-cost-entries": { entity: "job_cost_entry", filters: [] },
    kits: { entity: "kit", filters: [] },
    "knowledge-articles": {
        entity: "knowledge_article",
        filters: [
            { column: "status", operator: "eq" },
            { column: "category", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "knowledge-base": {
        entity: "knowledge_base_article",
        filters: [
            { column: "status", operator: "eq" },
            { column: "category", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "knowledge-base-articles": { entity: "knowledge_base_article", filters: [] },
    "lead-activities": {
        entity: "lead_activity",
        filters: [
            { column: "lead_id", operator: "eq" },
            { column: "activity_type", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    leads: {
        entity: "lead",
        filters: [
            { column: "status", operator: "eq" },
            { column: "source", operator: "eq" },
            { column: "assigned_to", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "lead-sources": { entity: "lead_source", filters: [] },
    "legal-holds": { entity: "legal_hold", filters: [] },
    "live-crew-assignments": {
        entity: "live_crew_assignment",
        filters: [{ column: "event_id", operator: "eq" }],
    },
    "live-event-instances": { entity: "live_event_instance", filters: [] },
    "live-events": {
        entity: "live_event",
        filters: [
            { column: "status", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "live-financial-snapshots": { entity: "live_financial_snapshot", filters: [] },
    "load-plans": { entity: "load_plan", filters: [] },
    locations: {
        entity: "location",
        filters: [
            { column: "type", operator: "eq" },
            { column: "city", operator: "eq" },
            { column: "state", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "login-audit-log": { entity: "login_audit_log", filters: [] },
    "logistics-events": { entity: "logistics_event", filters: [] },
    "lost-reasons": {
        entity: "lost_reason",
        filters: [{ column: "organization_id", operator: "eq" }],
    },
    "maintenance-records": {
        entity: "maintenance_record",
        filters: [
            { column: "asset_id", operator: "eq" },
            { column: "status", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "maintenance-schedules": { entity: "maintenance_schedule", filters: [] },
    messages: { entity: "message", filters: [{ column: "conversation_id", operator: "eq" }] },
    milestones: {
        entity: "milestone",
        filters: [
            { column: "status", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "notification-preferences": {
        entity: "notification_preference",
        filters: [
            { column: "user_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    notifications: {
        entity: "notification",
        filters: [
            { column: "read", operator: "eq" },
            { column: "type", operator: "eq" },
            { column: "user_id", operator: "eq" },
        ],
    },
    obligations: {
        entity: "obligation",
        filters: [
            { column: "status", operator: "eq" },
            { column: "contract_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    opportunities: {
        entity: "opportunity",
        filters: [
            { column: "stage", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "payment-approvals": {
        entity: "payment_approval",
        filters: [
            { column: "status", operator: "eq" },
            { column: "approver_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    payments: {
        entity: "payment",
        filters: [
            { column: "status", operator: "eq" },
            { column: "direction", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "payroll-batches": { entity: "payroll_batch", filters: [] },
    permits: {
        entity: "permit",
        filters: [
            { column: "status", operator: "eq" },
            { column: "type", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "location_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    pipelines: {
        entity: "pipeline",
        filters: [
            { column: "status", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "pos-transactions": { entity: "pos_transaction", filters: [] },
    "post-event-reports": {
        entity: "post_event_report",
        filters: [
            { column: "event_instance_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "production-advance-items": { entity: "production_advance_item", filters: [] },
    "production-budget-lines": {
        entity: "production_budget_line",
        filters: [{ column: "budget_id", operator: "eq" }],
    },
    "production-checklists": {
        entity: "production_checklist",
        filters: [
            { column: "project_id", operator: "eq" },
            { column: "event_id", operator: "eq" },
        ],
    },
    "production-expenses": { entity: "production_expense", filters: [] },
    "production-milestones": {
        entity: "production_milestone",
        filters: [
            { column: "project_id", operator: "eq" },
            { column: "status", operator: "eq" },
        ],
    },
    "production-runs": { entity: "production_run", filters: [] },
    "production-sops": {
        entity: "production_sop",
        filters: [
            { column: "department", operator: "eq" },
            { column: "status", operator: "eq" },
        ],
    },
    "production-tasks": {
        entity: "production_task",
        filters: [
            { column: "project_id", operator: "eq" },
            { column: "department", operator: "eq" },
            { column: "status", operator: "eq" },
        ],
    },
    "production-time-entries": { entity: "production_time_entry", filters: [] },
    "production-verticals": { entity: "production_vertical", filters: [] },
    profiles: { entity: "profile", filters: [] },
    "project-assignments": {
        entity: "project_assignment",
        filters: [
            { column: "project_id", operator: "eq" },
            { column: "crew_member_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "project-templates": { entity: "project_template", filters: [] },
    projects: {
        entity: "project",
        filters: [
            { column: "status", operator: "eq" },
            { column: "manager_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "proposal-items": {
        entity: "proposal_item",
        filters: [
            { column: "proposal_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    proposals: {
        entity: "proposal",
        filters: [
            { column: "status", operator: "eq" },
            { column: "deal_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "provider-connections": { entity: "provider_connection", filters: [] },
    "purchase-orders": {
        entity: "purchase_order",
        filters: [
            { column: "status", operator: "eq" },
            { column: "vendor_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "purchase-requisitions": {
        entity: "purchase_requisition",
        filters: [
            { column: "status", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "requested_by", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "qc-gates": { entity: "qc_gate", filters: [] },
    "quality-check-templates": { entity: "quality_check_template", filters: [] },
    "quality-checks": { entity: "quality_check", filters: [] },
    "rate-card-items": {
        entity: "rate_card_item",
        filters: [
            { column: "rate_card_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "rate-cards": { entity: "rate_card", filters: [{ column: "organization_id", operator: "eq" }] },
    "readiness-gates": {
        entity: "readiness_gate",
        filters: [
            { column: "status", operator: "eq" },
            { column: "event_id", operator: "eq" },
            { column: "department", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "recurring-invoices": {
        entity: "recurring_invoice",
        filters: [
            { column: "status", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "rental-agreements": {
        entity: "rental_agreement",
        filters: [
            { column: "status", operator: "eq" },
            { column: "vendor_id", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "report-definitions": {
        entity: "report_definition",
        filters: [{ column: "organization_id", operator: "eq" }],
    },
    "resilience-targets": { entity: "resilience_target", filters: [] },
    "resource-bookings": { entity: "resource_booking", filters: [] },
    "revenue-recognition-entries": { entity: "revenue_recognition_entry", filters: [] },
    "revenue-schedules": { entity: "revenue_schedule", filters: [] },
    "review-cycles": { entity: "review_cycle", filters: [] },
    reviews: {
        entity: "review",
        filters: [
            { column: "status", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    rfqs: {
        entity: "rfq",
        filters: [
            { column: "project_id", operator: "eq" },
            { column: "status", operator: "eq" },
        ],
    },
    rights: {
        entity: "rights",
        filters: [
            { column: "status", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "risk-assessments": { entity: "risk_assessment", filters: [] },
    "role-change-log": { entity: "role_change_log", filters: [] },
    roles: {
        entity: "role",
        filters: [
            { column: "status", operator: "eq" },
            { column: "is_system", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "ros-cues": {
        entity: "ros_cue",
        filters: [
            { column: "status", operator: "eq" },
            { column: "event_id", operator: "eq" },
            { column: "department", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "saved-views": {
        entity: "saved_view",
        filters: [
            { column: "entity_type", operator: "eq" },
            { column: "visibility", operator: "eq" },
            { column: "created_by", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "scan-events": { entity: "scan_event", filters: [] },
    scenarios: {
        entity: "scenario",
        filters: [
            { column: "project_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "schedule-entries": {
        entity: "schedule_entry",
        filters: [
            { column: "project_id", operator: "eq" },
            { column: "start_datetime", operator: "gte" },
            { column: "end_datetime", operator: "lte" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "scopes-of-work": {
        entity: "sow",
        filters: [
            { column: "status", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "service-health-checks": { entity: "service_health_check", filters: [] },
    "service-requests": {
        entity: "service_request",
        filters: [
            { column: "status", operator: "eq" },
            { column: "priority", operator: "eq" },
            { column: "assigned_to", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    shifts: {
        entity: "shift",
        filters: [
            { column: "project_id", operator: "eq" },
            { column: "date", operator: "eq" },
        ],
    },
    shipments: {
        entity: "shipment",
        filters: [
            { column: "status", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "sla-definitions": { entity: "sla_definition", filters: [] },
    "sla-policies": { entity: "sla_policy", filters: [] },
    "sla-tracking": { entity: "sla_tracking", filters: [] },
    sops: {
        entity: "sop",
        filters: [
            { column: "status", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "sow-deliverables": {
        entity: "sow_deliverable",
        filters: [{ column: "sow_id", operator: "eq" }],
    },
    sows: {
        entity: "sow",
        filters: [
            { column: "status", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "space-bookings": { entity: "space_booking", filters: [] },
    "stakeholder-projects": {
        entity: "stakeholder_project",
        filters: [
            { column: "stakeholder_id", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    stakeholders: { entity: "stakeholder", filters: [] },
    "storage-objects": {
        entity: "storage_object",
        filters: [{ column: "organization_id", operator: "eq" }],
    },
    "strike-sequences": { entity: "strike_sequence", filters: [] },
    "survey-responses": { entity: "survey_response", filters: [] },
    "survey-templates": { entity: "survey_template", filters: [] },
    "sync-events": { entity: "sync_event", filters: [] },
    tags: {
        entity: "tag",
        filters: [
            { column: "organization_id", operator: "eq" },
            { column: "category", operator: "eq" },
        ],
    },
    tasks: {
        entity: "task",
        filters: [
            { column: "status", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "assigned_to", operator: "eq" },
            { column: "priority", operator: "eq" },
        ],
    },
    teams: {
        entity: "team",
        filters: [
            { column: "organization_id", operator: "eq" },
            { column: "is_default", operator: "eq" },
        ],
    },
    "tech-sheets": {
        entity: "tech_sheet",
        filters: [
            { column: "event_id", operator: "eq" },
            { column: "location_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "technical-specs": { entity: "technical_spec", filters: [] },
    templates: {
        entity: "document_template",
        filters: [
            { column: "type", operator: "eq" },
            { column: "status", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "temporary-access-grants": { entity: "temporary_access_grant", filters: [] },
    testimonials: { entity: "testimonial", filters: [] },
    "time-entries": {
        entity: "time_entry",
        filters: [
            { column: "status", operator: "eq" },
            { column: "crew_member_id", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "task_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "time-off-requests": { entity: "time_off_request", filters: [] },
    "time-tracking-policies": { entity: "time_tracking_policy", filters: [] },
    timesheets: { entity: "timesheet", filters: [] },
    "transfer-orders": {
        entity: "transfer_order",
        filters: [
            { column: "status", operator: "eq" },
            { column: "organization_id", operator: "eq" },
            { column: "origin_location_id", operator: "eq" },
            { column: "destination_location_id", operator: "eq" },
            { column: "priority", operator: "eq" },
        ],
    },
    "upsell-events": { entity: "upsell_event", filters: [] },
    "upsell-triggers": { entity: "upsell_trigger", filters: [] },
    "user-certifications": {
        entity: "user_certification",
        filters: [
            { column: "user_id", operator: "eq" },
            { column: "certification_id", operator: "eq" },
            { column: "status", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "user-profiles": { entity: "profile", filters: [] },
    "vault-documents": { entity: "vault_document", filters: [] },
    vehicles: { entity: "vehicle", filters: [] },
    "vendor-communications": { entity: "vendor_communication", filters: [] },
    "vendor-compliance-documents": {
        entity: "vendor_compliance_document",
        filters: [{ column: "vendor_id", operator: "eq" }],
    },
    "vendor-reviews": {
        entity: "vendor_review",
        filters: [
            { column: "vendor_id", operator: "eq" },
            { column: "reviewer_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    vendors: {
        entity: "vendor",
        filters: [
            { column: "status", operator: "eq" },
            { column: "category", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "vip-guests": {
        entity: "vip_guest",
        filters: [
            { column: "status", operator: "eq" },
            { column: "event_instance_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "vip-service-requests": { entity: "vip_service_request", filters: [] },
    warehouses: { entity: "warehouse", filters: [{ column: "organization_id", operator: "eq" }] },
    "warehouse-locations": {
        entity: "warehouse_location",
        filters: [{ column: "warehouse_id", operator: "eq" }],
    },
    "work-orders": {
        entity: "work_order",
        filters: [
            { column: "status", operator: "eq" },
            { column: "vendor_id", operator: "eq" },
            { column: "project_id", operator: "eq" },
            { column: "organization_id", operator: "eq" },
        ],
    },
    "work-packages": { entity: "work_package", filters: [] },
    "worker-classifications": { entity: "worker_classification", filters: [] },
    "worker-compliance-docs": { entity: "worker_compliance_doc", filters: [] },
    "worker-offboarding-runs": { entity: "worker_offboarding_run", filters: [] },
    "worker-onboarding-runs": { entity: "worker_onboarding_run", filters: [] },
    "worker-profiles": { entity: "worker_profile", filters: [] },
    "worker-reviews": { entity: "worker_review", filters: [] },
    workflows: { entity: "workflow", filters: [] },
};

export const ITEM_ROUTES: Record<string, ItemRouteConfig> = {
    "access-audit-log": { entity: "access_audit_log", immutableColumns: ["organization_id"] },
    activations: { entity: "activation", immutableColumns: ["organization_id"] },
    "active-timers": { entity: "active_timer", immutableColumns: ["organization_id"] },
    "activity-log": { entity: "activity_log_entry", immutableColumns: ["organization_id"] },
    "advance-status-history": {
        entity: "advance_status_history",
        immutableColumns: ["organization_id"],
    },
    "ai-report-queries": { entity: "ai_report_query", immutableColumns: ["organization_id"] },
    "approval-steps": { entity: "approval_step", immutableColumns: ["organization_id"] },
    "approval-workflows": { entity: "approval_workflow", immutableColumns: ["organization_id"] },
    approvals: { entity: "approval", immutableColumns: ["organization_id"] },
    "asset-assignments": { entity: "asset_assignment", immutableColumns: ["organization_id"] },
    "asset-tags": { entity: "asset_tag", immutableColumns: ["organization_id"] },
    "asset-versions": { entity: "asset_version", immutableColumns: ["organization_id"] },
    assets: { entity: "asset", immutableColumns: ["organization_id"] },
    "automation-executions": {
        entity: "automation_execution",
        immutableColumns: ["organization_id"],
    },
    "automation-rules": { entity: "automation_rule", immutableColumns: ["organization_id"] },
    automations: { entity: "automation", immutableColumns: ["organization_id"] },
    boms: { entity: "bom", immutableColumns: ["organization_id"] },
    "brand-guideline-sections": {
        entity: "brand_guideline_section",
        immutableColumns: ["organization_id"],
    },
    "brand-guidelines": { entity: "brand_guideline", immutableColumns: ["organization_id"] },
    "brand-kits": { entity: "brand_kit", immutableColumns: ["organization_id"] },
    "brief-templates": { entity: "brief_template", immutableColumns: ["organization_id"] },
    briefs: { entity: "creative_brief", immutableColumns: ["organization_id"] },
    "budget-approvals": { entity: "budget_approval", immutableColumns: ["organization_id"] },
    "budget-line-items": { entity: "budget_line_item", immutableColumns: ["project_id"] },
    budgets: { entity: "budget", immutableColumns: ["organization_id"] },
    "calendar-events": { entity: "calendar_event", immutableColumns: ["organization_id"] },
    "call-sheets": { entity: "call_sheet", immutableColumns: ["organization_id"] },
    "campaign-assets": { entity: "campaign_asset", immutableColumns: ["organization_id"] },
    "campaign-channels": { entity: "campaign_channel", immutableColumns: ["organization_id"] },
    "campaign-kpis": { entity: "campaign_kpi", immutableColumns: ["organization_id"] },
    campaigns: { entity: "campaign", immutableColumns: ["organization_id"] },
    "case-studies": { entity: "case_study", immutableColumns: ["organization_id"] },
    certifications: { entity: "certification", immutableColumns: ["organization_id"] },
    "change-orders": { entity: "change_order", immutableColumns: ["organization_id"] },
    "checklist-templates": { entity: "checklist_template", immutableColumns: ["organization_id"] },
    checklists: { entity: "checklist", immutableColumns: ["organization_id"] },
    "clause-library": { entity: "clause_library_entry", immutableColumns: ["organization_id"] },
    "client-invoices": { entity: "client_invoice", immutableColumns: ["organization_id"] },
    comments: { entity: "comment", immutableColumns: ["organization_id"] },
    companies: { entity: "company", immutableColumns: ["organization_id"] },
    "compliance-checklists": {
        entity: "compliance_checklist",
        immutableColumns: ["organization_id"],
    },
    "compliance-requirements": {
        entity: "compliance_requirement",
        immutableColumns: ["organization_id"],
    },
    "compliance-templates": {
        entity: "compliance_template",
        immutableColumns: ["organization_id"],
    },
    consumables: { entity: "consumable", immutableColumns: ["organization_id"] },
    conversations: { entity: "conversation", immutableColumns: ["organization_id"] },
    contacts: { entity: "contact", immutableColumns: ["organization_id"] },
    "contract-amendments": { entity: "contract_amendment", immutableColumns: ["organization_id"] },
    "contract-obligations": {
        entity: "contract_obligation",
        immutableColumns: ["organization_id"],
    },
    contracts: { entity: "contract", immutableColumns: ["organization_id"] },
    "creative-reviews": { entity: "creative_review", immutableColumns: ["organization_id"] },
    "credit-notes": { entity: "credit_note", immutableColumns: ["organization_id"] },
    crew: { entity: "crew_member", immutableColumns: ["organization_id"] },
    "crew-availability": { entity: "crew_availability", immutableColumns: ["organization_id"] },
    "crew-members": { entity: "crew_member", immutableColumns: ["organization_id"] },
    "crew-shifts": { entity: "crew_shift", immutableColumns: ["organization_id"] },
    "custom-field-values": { entity: "custom_field_value", immutableColumns: ["organization_id"] },
    "dashboard-widgets": { entity: "dashboard_widget", immutableColumns: ["organization_id"] },
    dashboards: { entity: "dashboard", immutableColumns: ["organization_id"] },
    "data-export-requests": {
        entity: "data_export_request",
        immutableColumns: ["organization_id"],
    },
    "data-retention-policies": {
        entity: "data_retention_policy",
        immutableColumns: ["organization_id"],
    },
    deals: { entity: "deal", immutableColumns: ["organization_id"] },
    decks: { entity: "deck", immutableColumns: ["organization_id"] },
    "department-statuses": { entity: "department_status", immutableColumns: ["organization_id"] },
    "digital-assets": { entity: "digital_asset", immutableColumns: ["organization_id"] },
    dispatch: { entity: "dispatch_entry", immutableColumns: ["organization_id"] },
    "document-templates": { entity: "document_template", immutableColumns: ["organization_id"] },
    documents: { entity: "document", immutableColumns: ["organization_id"] },
    "domain-events": { entity: "domain_event", immutableColumns: ["organization_id"] },
    "e-signatures": { entity: "e_signature", immutableColumns: ["organization_id"] },
    "email-messages": { entity: "email_message", immutableColumns: ["organization_id"] },
    "engineering-approvals": {
        entity: "engineering_approval",
        immutableColumns: ["organization_id"],
    },
    estimates: { entity: "estimate", immutableColumns: ["organization_id"] },
    events: { entity: "live_event", immutableColumns: ["organization_id"] },
    "expense-reports": { entity: "expense_report", immutableColumns: ["organization_id"] },
    expenses: { entity: "expense", immutableColumns: ["organization_id"] },
    "financial-periods": { entity: "financial_period", immutableColumns: ["organization_id"] },
    fleet: { entity: "vehicle", immutableColumns: ["organization_id"] },
    "gl-accounts": { entity: "gl_account", immutableColumns: ["organization_id"] },
    goals: { entity: "goal", immutableColumns: ["organization_id"] },
    "goods-receipts": { entity: "goods_receipt", immutableColumns: ["organization_id"] },
    "guest-incidents": { entity: "guest_incident", immutableColumns: ["organization_id"] },
    "hr-certifications": { entity: "hr_certification", immutableColumns: ["organization_id"] },
    incidents: { entity: "incident", immutableColumns: ["organization_id"] },
    "insurance-policies": { entity: "insurance_policy", immutableColumns: ["organization_id"] },
    "insurance-requirements": {
        entity: "insurance_requirement",
        immutableColumns: ["organization_id"],
    },
    integrations: { entity: "integration", immutableColumns: ["organization_id"] },
    inventory: { entity: "catalog_item", immutableColumns: ["organization_id"] },
    "inventory-audits": { entity: "inventory_audit", immutableColumns: ["organization_id"] },
    "invoice-templates": { entity: "invoice_template", immutableColumns: ["organization_id"] },
    "invoice-line-items": { entity: "invoice_line_item", immutableColumns: ["organization_id"] },
    invoices: { entity: "invoice", immutableColumns: ["organization_id", "invoice_number"] },
    "ip-rights": { entity: "ip_right", immutableColumns: ["organization_id"] },
    "job-cost-entries": { entity: "job_cost_entry", immutableColumns: ["organization_id"] },
    "job-costing": { entity: "job_cost_entry", immutableColumns: ["organization_id"] },
    kits: { entity: "kit", immutableColumns: ["organization_id"] },
    "knowledge-articles": { entity: "knowledge_article", immutableColumns: ["organization_id"] },
    "knowledge-base": { entity: "knowledge_base_article", immutableColumns: ["organization_id"] },
    "knowledge-base-articles": {
        entity: "knowledge_base_article",
        immutableColumns: ["organization_id"],
    },
    "lead-activities": { entity: "lead_activity", immutableColumns: ["organization_id"] },
    leads: { entity: "lead", immutableColumns: ["organization_id"] },
    "lead-sources": { entity: "lead_source", immutableColumns: ["organization_id"] },
    "legal-holds": { entity: "legal_hold", immutableColumns: ["organization_id"] },
    "live-crew-assignments": {
        entity: "live_crew_assignment",
        immutableColumns: ["organization_id"],
    },
    "live-event-instances": {
        entity: "live_event_instance",
        immutableColumns: ["organization_id"],
    },
    "live-events": { entity: "live_event", immutableColumns: ["organization_id"] },
    locations: { entity: "location", immutableColumns: ["organization_id"] },
    "login-audit-log": { entity: "login_audit_log", immutableColumns: ["organization_id"] },
    "lost-reasons": { entity: "lost_reason", immutableColumns: ["organization_id"] },
    "maintenance-records": { entity: "maintenance_record", immutableColumns: ["organization_id"] },
    "maintenance-schedules": {
        entity: "maintenance_schedule",
        immutableColumns: ["organization_id"],
    },
    messages: { entity: "message", immutableColumns: ["organization_id"] },
    milestones: { entity: "milestone", immutableColumns: ["organization_id"] },
    "notification-preferences": {
        entity: "notification_preference",
        immutableColumns: ["organization_id"],
    },
    notifications: { entity: "notification", immutableColumns: ["organization_id"] },
    obligations: { entity: "obligation", immutableColumns: ["organization_id"] },
    opportunities: { entity: "opportunity", immutableColumns: ["organization_id"] },
    "payment-approvals": { entity: "payment_approval", immutableColumns: ["organization_id"] },
    payments: { entity: "payment", immutableColumns: ["organization_id"] },
    "payroll-batches": { entity: "payroll_batch", immutableColumns: ["organization_id"] },
    permits: { entity: "permit", immutableColumns: ["organization_id"] },
    pipeline: { entity: "pipeline", immutableColumns: ["organization_id"] },
    pipelines: { entity: "pipeline", immutableColumns: ["organization_id"] },
    "post-event-reports": { entity: "post_event_report", immutableColumns: ["organization_id"] },
    procurement: { entity: "purchase_requisition", immutableColumns: ["organization_id"] },
    "production-budget-lines": {
        entity: "production_budget_line",
        immutableColumns: ["organization_id"],
    },
    "production-checklists": {
        entity: "production_checklist",
        immutableColumns: ["organization_id"],
    },
    "production-expenses": { entity: "production_expense", immutableColumns: ["organization_id"] },
    "production-milestones": { entity: "production_milestone", immutableColumns: ["project_id"] },
    "production-sops": { entity: "production_sop", immutableColumns: ["organization_id"] },
    "production-tasks": { entity: "production_task", immutableColumns: ["project_id"] },
    "production-time-entries": {
        entity: "production_time_entry",
        immutableColumns: ["organization_id"],
    },
    profiles: { entity: "profile", immutableColumns: ["organization_id"] },
    "project-assignments": { entity: "project_assignment", immutableColumns: ["organization_id"] },
    "project-templates": { entity: "project_template", immutableColumns: ["organization_id"] },
    projects: { entity: "project", immutableColumns: ["organization_id"] },
    "proposal-items": { entity: "proposal_item", immutableColumns: ["organization_id"] },
    proposals: { entity: "proposal", immutableColumns: ["organization_id"] },
    "purchase-orders": { entity: "purchase_order", immutableColumns: ["organization_id"] },
    "purchase-requisitions": {
        entity: "purchase_requisition",
        immutableColumns: ["organization_id"],
    },
    "qc-gates": { entity: "qc_gate", immutableColumns: ["organization_id"] },
    "quality-check-templates": {
        entity: "quality_check_template",
        immutableColumns: ["organization_id"],
    },
    "quality-checks": { entity: "quality_check", immutableColumns: ["organization_id"] },
    "rate-card-items": { entity: "rate_card_item", immutableColumns: ["organization_id"] },
    "rate-cards": { entity: "rate_card", immutableColumns: ["organization_id"] },
    "readiness-gates": { entity: "readiness_gate", immutableColumns: ["organization_id"] },
    "recurring-invoices": { entity: "recurring_invoice", immutableColumns: ["organization_id"] },
    "rental-agreements": { entity: "rental_agreement", immutableColumns: ["organization_id"] },
    "report-definitions": { entity: "report_definition", immutableColumns: ["organization_id"] },
    "resilience-targets": { entity: "resilience_target", immutableColumns: ["organization_id"] },
    "resource-bookings": { entity: "resource_booking", immutableColumns: ["organization_id"] },
    revenue: { entity: "revenue_recognition_entry", immutableColumns: ["organization_id"] },
    "revenue-schedules": { entity: "revenue_schedule", immutableColumns: ["organization_id"] },
    reviews: { entity: "review", immutableColumns: ["organization_id"] },
    rfqs: { entity: "rfq", immutableColumns: ["organization_id"] },
    rights: { entity: "rights", immutableColumns: ["organization_id"] },
    "risk-assessments": { entity: "risk_assessment", immutableColumns: ["organization_id"] },
    "role-change-log": { entity: "role_change_log", immutableColumns: ["organization_id"] },
    roles: { entity: "role", immutableColumns: ["organization_id", "is_system"] },
    "ros-cues": { entity: "ros_cue", immutableColumns: ["organization_id"] },
    "saved-views": { entity: "saved_view", immutableColumns: ["organization_id"] },
    scenarios: { entity: "scenario", immutableColumns: ["organization_id"] },
    "schedule-entries": { entity: "schedule_entry", immutableColumns: ["organization_id"] },
    "scopes-of-work": { entity: "sow", immutableColumns: ["organization_id"] },
    "service-health-checks": {
        entity: "service_health_check",
        immutableColumns: ["organization_id"],
    },
    "service-requests": { entity: "service_request", immutableColumns: ["organization_id"] },
    shifts: { entity: "shift", immutableColumns: ["organization_id"] },
    shipments: { entity: "shipment", immutableColumns: ["organization_id"] },
    "sla-definitions": { entity: "sla_definition", immutableColumns: ["organization_id"] },
    "sla-tracking": { entity: "sla_tracking", immutableColumns: ["organization_id"] },
    sops: { entity: "sop", immutableColumns: ["organization_id"] },
    "sow-deliverables": { entity: "sow_deliverable", immutableColumns: ["organization_id"] },
    sows: { entity: "sow", immutableColumns: ["organization_id"] },
    "stakeholder-projects": {
        entity: "stakeholder_project",
        immutableColumns: ["organization_id"],
    },
    stakeholders: { entity: "stakeholder", immutableColumns: ["organization_id"] },
    "storage-objects": { entity: "storage_object", immutableColumns: ["organization_id"] },
    surveys: { entity: "survey", immutableColumns: ["organization_id"] },
    tags: { entity: "tag", immutableColumns: ["organization_id"] },
    tasks: { entity: "task", immutableColumns: ["project_id"] },
    teams: { entity: "team", immutableColumns: ["organization_id"] },
    "tech-sheets": { entity: "tech_sheet", immutableColumns: ["organization_id"] },
    templates: { entity: "document_template", immutableColumns: ["organization_id"] },
    "temporary-access-grants": {
        entity: "temporary_access_grant",
        immutableColumns: ["organization_id"],
    },
    testimonials: { entity: "testimonial", immutableColumns: ["organization_id"] },
    "time-entries": { entity: "time_entry", immutableColumns: ["organization_id"] },
    "time-off": { entity: "time_off_request", immutableColumns: ["organization_id"] },
    "time-off-requests": { entity: "time_off_request", immutableColumns: ["organization_id"] },
    timesheets: { entity: "timesheet", immutableColumns: ["organization_id"] },
    "transfer-orders": { entity: "transfer_order", immutableColumns: ["organization_id"] },
    "upsell-events": { entity: "upsell_event", immutableColumns: ["organization_id"] },
    "upsell-triggers": { entity: "upsell_trigger", immutableColumns: ["organization_id"] },
    "user-certifications": { entity: "user_certification", immutableColumns: ["organization_id"] },
    "user-management": { entity: "user_management", immutableColumns: ["organization_id"] },
    "user-profiles": { entity: "profile", immutableColumns: ["organization_id"] },
    vault: { entity: "vault_document", immutableColumns: ["organization_id"] },
    "vault-documents": { entity: "vault_document", immutableColumns: ["organization_id"] },
    vehicles: { entity: "vehicle", immutableColumns: ["organization_id"] },
    "vendor-compliance-documents": {
        entity: "vendor_compliance_document",
        immutableColumns: ["organization_id"],
    },
    "vendor-onboarding": { entity: "vendor_onboarding", immutableColumns: ["organization_id"] },
    "vendor-reviews": { entity: "vendor_review", immutableColumns: ["organization_id"] },
    "vendor-risk": { entity: "risk_assessment", immutableColumns: ["organization_id"] },
    vendors: { entity: "vendor", immutableColumns: ["organization_id"] },
    "vip-guests": { entity: "vip_guest", immutableColumns: ["organization_id"] },
    warehouses: { entity: "warehouse", immutableColumns: ["organization_id"] },
    "warehouse-locations": { entity: "warehouse_location", immutableColumns: ["organization_id"] },
    "work-orders": { entity: "work_order", immutableColumns: ["organization_id"] },
    "worker-offboarding-runs": {
        entity: "worker_offboarding_run",
        immutableColumns: ["organization_id"],
    },
    "worker-onboarding-runs": {
        entity: "worker_onboarding_run",
        immutableColumns: ["organization_id"],
    },
    "worker-profiles": { entity: "worker_profile", immutableColumns: ["organization_id"] },
    "worker-reviews": { entity: "worker_review", immutableColumns: ["organization_id"] },
    workflows: { entity: "workflow", immutableColumns: ["organization_id"] },
};
