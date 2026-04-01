import type { EntityLookupConfig } from "@/components/ui/form/entity-lookup-select";

/**
 * Central mapping from FK field keys to their EntityLookupConfig.
 * Used by create-entity configs to resolve `_id` text fields into
 * searchable entity-lookup selects.
 *
 * Convention: key = the FK column name (e.g. "project_id"),
 * value = { apiPath, labelField?, secondaryField? }
 */
export const FK_LOOKUP_CONFIGS: Record<string, EntityLookupConfig> = {
    activation_id: { apiPath: "/api/entities/activations", labelField: "name" },
    advance_id: { apiPath: "/api/advancing", labelField: "name" },
    approver_id: {
        apiPath: "/api/entities/user-profiles",
        labelField: "display_name",
        secondaryField: "email",
    },
    asset_id: { apiPath: "/api/entities/assets", labelField: "name", secondaryField: "barcode" },
    assignee_id: {
        apiPath: "/api/entities/user-profiles",
        labelField: "display_name",
        secondaryField: "email",
    },
    automation_id: { apiPath: "/api/entities/automations", labelField: "name" },
    brief_id: { apiPath: "/api/entities/briefs", labelField: "title" },
    budget_id: { apiPath: "/api/entities/budgets", labelField: "version" },
    checklist_template_id: { apiPath: "/api/entities/checklist-templates", labelField: "name" },
    company_id: { apiPath: "/api/entities/companies", labelField: "name" },
    contact_id: {
        apiPath: "/api/entities/contacts",
        labelField: "full_name",
        secondaryField: "email",
    },
    contract_id: { apiPath: "/api/entities/contracts", labelField: "title" },
    credential_id: { apiPath: "/api/entities/credential-types", labelField: "name" },
    credential_type_id: { apiPath: "/api/entities/credential-types", labelField: "name" },
    crew_member_id: { apiPath: "/api/entities/crew", labelField: "name" },
    deal_id: { apiPath: "/api/entities/deals", labelField: "title" },
    document_id: { apiPath: "/api/entities/documents", labelField: "title" },
    event_id: { apiPath: "/api/entities/events", labelField: "name" },
    grantee_id: {
        apiPath: "/api/entities/user-profiles",
        labelField: "display_name",
        secondaryField: "email",
    },
    incident_id: { apiPath: "/api/entities/incidents", labelField: "title" },
    lead_id: { apiPath: "/api/entities/leads", labelField: "first_name", secondaryField: "email" },
    location_id: { apiPath: "/api/entities/locations", labelField: "name" },
    manager_id: {
        apiPath: "/api/entities/user-profiles",
        labelField: "display_name",
        secondaryField: "email",
    },
    milestone_id: { apiPath: "/api/entities/milestones", labelField: "name" },
    owner_id: {
        apiPath: "/api/entities/user-profiles",
        labelField: "display_name",
        secondaryField: "email",
    },
    parent_task_id: { apiPath: "/api/entities/tasks", labelField: "title" },
    payment_id: { apiPath: "/api/entities/payments", labelField: "reference_number" },
    pipeline_id: { apiPath: "/api/entities/pipelines", labelField: "name" },
    profile_id: {
        apiPath: "/api/entities/user-profiles",
        labelField: "display_name",
        secondaryField: "email",
    },
    project_id: { apiPath: "/api/entities/projects", labelField: "name" },
    purchase_order_id: {
        apiPath: "/api/entities/purchase-orders",
        labelField: "total_amount",
        secondaryField: "status",
    },
    resource_id: { apiPath: "/api/entities/assets", labelField: "name" },
    reviewer_id: {
        apiPath: "/api/entities/user-profiles",
        labelField: "display_name",
        secondaryField: "email",
    },
    shipment_id: { apiPath: "/api/entities/shipments", labelField: "tracking_number" },
    signer_id: {
        apiPath: "/api/entities/user-profiles",
        labelField: "display_name",
        secondaryField: "email",
    },
    sla_definition_id: { apiPath: "/api/entities/sla-definitions", labelField: "name" },
    sow_id: { apiPath: "/api/entities/scopes-of-work", labelField: "title" },
    space_id: { apiPath: "/api/entities/locations", labelField: "name" },
    stakeholder_id: { apiPath: "/api/entities/stakeholders", labelField: "name" },
    subject_id: {
        apiPath: "/api/entities/user-profiles",
        labelField: "display_name",
        secondaryField: "email",
    },
    supervisor_id: {
        apiPath: "/api/entities/user-profiles",
        labelField: "display_name",
        secondaryField: "email",
    },
    survey_template_id: { apiPath: "/api/entities/survey-templates", labelField: "name" },
    trigger_id: { apiPath: "/api/entities/automations", labelField: "name" },
    user_id: {
        apiPath: "/api/entities/user-profiles",
        labelField: "display_name",
        secondaryField: "email",
    },
    vendor_id: { apiPath: "/api/entities/vendors", labelField: "name" },
    venue_id: { apiPath: "/api/entities/locations", labelField: "name" },
    work_order_id: { apiPath: "/api/entities/work-orders", labelField: "title" },
    worker_profile_id: {
        apiPath: "/api/entities/worker-profiles",
        labelField: "preferred_name",
        secondaryField: "email",
    },
    zone_id: { apiPath: "/api/entities/locations", labelField: "name" },
};
