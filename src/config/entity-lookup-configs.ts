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
    advance_id: { apiPath: "/api/advancing", labelField: "name" },
    approver_id: {
        apiPath: "/api/entities/user-profiles",
        labelField: "display_name",
        secondaryField: "email",
    },
    asset_id: { apiPath: "/api/entities/assets", labelField: "name", secondaryField: "barcode" },
    automation_id: { apiPath: "/api/entities/automations", labelField: "name" },
    budget_id: { apiPath: "/api/entities/budgets", labelField: "name" },
    company_id: { apiPath: "/api/entities/companies", labelField: "name" },
    contract_id: { apiPath: "/api/entities/contracts", labelField: "name" },
    credential_id: { apiPath: "/api/entities/credential-types", labelField: "name" },
    credential_type_id: { apiPath: "/api/entities/credential-types", labelField: "name" },
    crew_member_id: { apiPath: "/api/entities/crew", labelField: "name" },
    document_id: { apiPath: "/api/entities/documents", labelField: "title" },
    event_id: { apiPath: "/api/entities/events", labelField: "name" },
    grantee_id: {
        apiPath: "/api/entities/user-profiles",
        labelField: "display_name",
        secondaryField: "email",
    },
    payment_id: { apiPath: "/api/entities/payments", labelField: "reference_number" },
    profile_id: {
        apiPath: "/api/entities/user-profiles",
        labelField: "display_name",
        secondaryField: "email",
    },
    project_id: { apiPath: "/api/entities/projects", labelField: "name" },
    resource_id: { apiPath: "/api/entities/assets", labelField: "name" },
    shipment_id: { apiPath: "/api/entities/shipments", labelField: "tracking_number" },
    signer_id: {
        apiPath: "/api/entities/user-profiles",
        labelField: "display_name",
        secondaryField: "email",
    },
    sla_definition_id: { apiPath: "/api/entities/sla-definitions", labelField: "name" },
    space_id: { apiPath: "/api/entities/locations", labelField: "name" },
    stakeholder_id: { apiPath: "/api/entities/stakeholders", labelField: "name" },
    subject_id: {
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
    worker_profile_id: { apiPath: "/api/entities/worker-profiles", labelField: "name" },
    zone_id: { apiPath: "/api/entities/locations", labelField: "name" },
};
