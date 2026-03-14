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
        apiPath: "/api/user-profiles",
        labelField: "display_name",
        secondaryField: "email",
    },
    asset_id: { apiPath: "/api/assets", labelField: "name", secondaryField: "barcode" },
    automation_id: { apiPath: "/api/automations", labelField: "name" },
    budget_id: { apiPath: "/api/budgets", labelField: "name" },
    company_id: { apiPath: "/api/companies", labelField: "name" },
    contract_id: { apiPath: "/api/contracts", labelField: "name" },
    credential_id: { apiPath: "/api/credentials", labelField: "name" },
    credential_type_id: { apiPath: "/api/credentials", labelField: "name" },
    crew_member_id: { apiPath: "/api/crew", labelField: "name" },
    document_id: { apiPath: "/api/documents", labelField: "title" },
    event_id: { apiPath: "/api/events", labelField: "name" },
    grantee_id: {
        apiPath: "/api/user-profiles",
        labelField: "display_name",
        secondaryField: "email",
    },
    payment_id: { apiPath: "/api/payments", labelField: "reference_number" },
    profile_id: {
        apiPath: "/api/user-profiles",
        labelField: "display_name",
        secondaryField: "email",
    },
    project_id: { apiPath: "/api/projects", labelField: "name" },
    resource_id: { apiPath: "/api/assets", labelField: "name" },
    shipment_id: { apiPath: "/api/shipments", labelField: "tracking_number" },
    signer_id: {
        apiPath: "/api/user-profiles",
        labelField: "display_name",
        secondaryField: "email",
    },
    sla_definition_id: { apiPath: "/api/sla-definitions", labelField: "name" },
    space_id: { apiPath: "/api/locations", labelField: "name" },
    stakeholder_id: { apiPath: "/api/stakeholders", labelField: "name" },
    subject_id: {
        apiPath: "/api/user-profiles",
        labelField: "display_name",
        secondaryField: "email",
    },
    survey_template_id: { apiPath: "/api/templates", labelField: "name" },
    trigger_id: { apiPath: "/api/automations", labelField: "name" },
    user_id: { apiPath: "/api/user-profiles", labelField: "display_name", secondaryField: "email" },
    vendor_id: { apiPath: "/api/vendors", labelField: "name" },
    venue_id: { apiPath: "/api/locations", labelField: "name" },
    worker_profile_id: { apiPath: "/api/worker-profiles", labelField: "name" },
    zone_id: { apiPath: "/api/locations", labelField: "name" },
};
