import type { CreateEntityConfig } from "@/components/app/create-entity-dialog";
import { FK_LOOKUP_CONFIGS } from "@/config/entity-lookup-configs";
import {
    ACTIVATION_TYPE_MAP,
    ADVANCE_TYPE_MAP,
    ASSET_CATEGORY_MAP,
    BRAND_GUIDELINE_CATEGORY_MAP,
    BRAND_GUIDELINE_STATUS_MAP,
    BUDGET_LINE_CATEGORY_MAP,
    BUDGET_STATUS_MAP,
    CAMPAIGN_STATUS_MAP,
    CERTIFICATION_TYPE_MAP,
    CHANGE_ORDER_STATUS_MAP,
    CHANGE_ORDER_TYPE_MAP,
    CHECKLIST_TYPE_MAP,
    CLAUSE_PARTY_MAP,
    COMPANY_TYPE_MAP,
    CONTRACT_TYPE_MAP,
    CREATIVE_BRIEF_FORM_TYPE_MAP,
    DEAL_STAGE_MAP,
    DECK_TYPE_MAP,
    DIGITAL_ASSET_CLASS_MAP,
    DOCUMENT_CATEGORY_MAP,
    DOCUMENT_TYPE_MAP,
    EMAIL_PROVIDER_MAP,
    ENGINEERING_ENTITY_TYPE_MAP,
    ESTIMATE_STATUS_MAP,
    EXPENSE_CATEGORY_MAP,
    GOAL_TYPE_MAP,
    INCIDENT_SEVERITY_MAP,
    INTEGRATION_TYPE_MAP,
    INVOICE_STATUS_MAP,
    KB_ARTICLE_CATEGORY_MAP,
    LEAD_SOURCE_MAP,
    OPPORTUNITY_FORM_STAGE_MAP,
    PERMISSION_LEVEL_MAP,
    PROJECT_MEMBER_ROLE_MAP,
    PROJECT_STATUS_MAP,
    PROJECT_TEMPLATE_CATEGORY_MAP,
    PURCHASE_ORDER_STATUS_MAP,
    QUALITY_CHECK_ENTITY_TYPE_MAP,
    READINESS_GATE_STATUS_MAP,
    RENTAL_AGREEMENT_STATUS_MAP,
    RENTAL_AGREEMENT_TYPE_MAP,
    ROS_CUE_STATUS_MAP,
    SAVED_VIEW_TYPE_MAP,
    SCENARIO_TYPE_MAP,
    SERVICE_REQUEST_CATEGORY_MAP,
    SERVICE_REQUEST_PRIORITY_MAP,
    SOW_STATUS_MAP,
    SURVEY_TYPE_MAP,
    TASK_PRIORITY_MAP,
    TASK_STATUS_MAP,
    TEMPLATE_CATEGORY_MAP,
    VEHICLE_TYPE_MAP,
    VENDOR_CATEGORY_MAP,
    WAREHOUSE_TYPE_MAP,
    WORK_ORDER_PRIORITY_MAP,
    WORKER_REVIEW_TYPE_MAP,
    WORKER_TARGET_TYPE_MAP,
    WORKFORCE_STATUS_MAP,
} from "@/config/domain-config";

import { mapToOptions, YES_NO_OPTIONS } from "@/config/config-utils";

// ─── Production ───

export const CREATE_PROJECT_CONFIG: CreateEntityConfig = {
    entityName: "Project",
    description: "Create a new production project.",
    fields: [
        {
            key: "name",
            label: "Project Name",
            type: "text",
            placeholder: "e.g. Summer Brand Activation",
            required: true,
        },
        {
            key: "client",
            label: "Client",
            type: "text",
            placeholder: "Client or company name",
            required: true,
        },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: mapToOptions(PROJECT_STATUS_MAP),
            defaultValue: "planning",
            required: true,
        },
        { key: "start_date", label: "Start Date", type: "date" },
        { key: "end_date", label: "End Date", type: "date" },
        { key: "budget_planned", label: "Budget", type: "currency" },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Brief project description...",
        },

        {
            key: "billing_policy",
            label: "Billing Policy",
            type: "text",
            placeholder: "Billing Policy",
        },
        { key: "billing_type", label: "Billing Type", type: "text", placeholder: "Billing Type" },
        {
            key: "budget_actual",
            label: "Budget Actual",
            type: "text",
            placeholder: "Budget Actual",
        },
        {
            key: "client_company_id",
            label: "Client Company",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/companies", labelField: "name" },
        },
        { key: "client_logo", label: "Client Logo", type: "text", placeholder: "Client Logo" },
        {
            key: "company_id",
            label: "Company",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.company_id,
        },
        { key: "csat_score", label: "Csat Score", type: "text", placeholder: "Csat Score" },
        {
            key: "insurance_policy_id",
            label: "Insurance Policy",
            type: "entity-lookup",
            lookupConfig: {
                apiPath: "/api/entities/insurance-policies",
                labelField: "policy_number",
            },
        },
        {
            key: "organizer_company_id",
            label: "Organizer",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/companies", labelField: "name" },
        },
        { key: "progress", label: "Progress", type: "text", placeholder: "Progress" },
        {
            key: "rate_card_id",
            label: "Rate Card",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/rate-cards", labelField: "name" },
        },
        {
            key: "sustainability_score",
            label: "Sustainability Score",
            type: "text",
            placeholder: "Sustainability Score",
        },
        {
            key: "team_id",
            label: "Team",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/teams", labelField: "name" },
        },
        {
            key: "template_id",
            label: "Template",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/templates", labelField: "name" },
        },
        {
            key: "template_version",
            label: "Template Version",
            type: "text",
            placeholder: "Template Version",
        },
        { key: "timezone", label: "Timezone", type: "text", placeholder: "Timezone" },

        {
            key: "current_phase",
            label: "Current Phase",
            type: "text",
            placeholder: "Current Phase",
        },
        {
            key: "manager_id",
            label: "Manager",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.manager_id,
        },
    ],
};

export const CREATE_TASK_CONFIG: CreateEntityConfig = {
    entityName: "Task",
    description: "Create a new task.",
    fields: [
        {
            key: "title",
            label: "Task Title",
            type: "text",
            placeholder: "e.g. Design stage layout",
            required: true,
        },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: mapToOptions(TASK_STATUS_MAP),
            defaultValue: "backlog",
            required: true,
        },
        {
            key: "priority",
            label: "Priority",
            type: "select",
            options: mapToOptions(TASK_PRIORITY_MAP),
            defaultValue: "medium",
            required: true,
        },
        { key: "due_date", label: "Due Date", type: "date" },
        {
            key: "estimated_hours",
            label: "Estimated Hours",
            type: "number",
            placeholder: "0",
            min: 0,
            step: 0.5,
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Task details...",
        },

        {
            key: "acceptance_criteria",
            label: "Acceptance Criteria",
            type: "textarea",
            placeholder: "Acceptance Criteria...",
        },
        {
            key: "activation_id",
            label: "Activation",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.activation_id,
        },
        { key: "blockers", label: "Blockers", type: "textarea", placeholder: "Blockers..." },
        {
            key: "campaign_id",
            label: "Campaign",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/campaigns", labelField: "name" },
        },
        {
            key: "deliverables",
            label: "Deliverables",
            type: "textarea",
            placeholder: "Deliverables...",
        },
        { key: "department", label: "Department", type: "text", placeholder: "Department" },
        {
            key: "event_id",
            label: "Event",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.event_id,
        },
        {
            key: "fabrication_status",
            label: "Fabrication Status",
            type: "text",
            placeholder: "Fabrication Status",
        },
        {
            key: "impact_if_delayed",
            label: "Impact If Delayed",
            type: "textarea",
            placeholder: "Impact If Delayed...",
        },
        {
            key: "location_id",
            label: "Location",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.location_id,
        },
        { key: "material_cost", label: "Material Cost", type: "currency" },
        {
            key: "parent_id",
            label: "Parent Task",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/tasks", labelField: "title" },
        },
        {
            key: "reviewer_id",
            label: "Reviewer",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.reviewer_id,
        },
        {
            key: "safety_critical",
            label: "Safety Critical",
            type: "text",
            placeholder: "Safety Critical",
        },
        {
            key: "sow_deliverable_id",
            label: "SOW Deliverable",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/sow-deliverables", labelField: "title" },
        },
        {
            key: "vendor_id",
            label: "Vendor",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.vendor_id,
        },

        {
            key: "assignee_id",
            label: "Assignee",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.assignee_id,
        },
        {
            key: "milestone_id",
            label: "Milestone",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.milestone_id,
        },
        { key: "phase", label: "Phase", type: "text", placeholder: "Phase" },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "start_date", label: "Start Date", type: "date" },
    ],
};

export const CREATE_EVENT_CONFIG: CreateEntityConfig = {
    entityName: "Event",
    description: "Create a new event.",
    fields: [
        {
            key: "name",
            label: "Event Name",
            type: "text",
            placeholder: "e.g. Product Launch Gala",
            required: true,
        },
        { key: "venue", label: "Venue", type: "text", placeholder: "Venue name or address" },
        { key: "start_date", label: "Start Date", type: "datetime-local", required: true },
        { key: "end_date", label: "End Date", type: "datetime-local" },
        {
            key: "expected_attendance",
            label: "Expected Attendance",
            type: "number",
            placeholder: "0",
            min: 0,
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Event description...",
        },

        {
            key: "activation_id",
            label: "Activation",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.activation_id,
        },
        {
            key: "cancellation_policy",
            label: "Cancellation Policy",
            type: "text",
            placeholder: "Cancellation Policy",
        },
        { key: "rain_plan", label: "Rain Plan", type: "text", placeholder: "Rain Plan" },
        { key: "run_of_show", label: "Run Of Show", type: "text", placeholder: "Run Of Show" },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        { key: "type", label: "Type", type: "text", placeholder: "Type" },
        { key: "vip_count", label: "Vip Count", type: "number", min: 0 },

        { key: "attendee_count", label: "Attendee Count", type: "number", min: 0 },
        { key: "budget", label: "Budget", type: "currency" },
        { key: "date", label: "Date", type: "date" },
        { key: "doors_time", label: "Doors Time", type: "text" },
        { key: "end_time", label: "End Time", type: "text" },
        {
            key: "location_id",
            label: "Location",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.location_id,
        },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "purpose", label: "Purpose", type: "textarea", placeholder: "Purpose..." },
        {
            key: "specific_location",
            label: "Specific Location",
            type: "text",
            placeholder: "Specific Location",
        },
        { key: "start_time", label: "Start Time", type: "text" },

        {
            key: "producer_id",
            label: "Producer",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/user-profiles", labelField: "display_name" },
        },
        {
            key: "stage_manager_id",
            label: "Stage Manager",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/user-profiles", labelField: "display_name" },
        },
    ],
};

export const CREATE_ACTIVATION_CONFIG: CreateEntityConfig = {
    entityName: "Activation",
    description: "Create a new brand activation.",
    fields: [
        {
            key: "name",
            label: "Activation Name",
            type: "text",
            placeholder: "e.g. Pop-up Experience",
            required: true,
        },
        {
            key: "type",
            label: "Type",
            type: "select",
            options: mapToOptions(ACTIVATION_TYPE_MAP),
            required: true,
        },
        { key: "start_date", label: "Start Date", type: "date", required: true },
        { key: "end_date", label: "End Date", type: "date" },
        { key: "budget", label: "Budget", type: "currency" },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Activation brief...",
        },

        { key: "backup_plan", label: "Backup Plan", type: "text", placeholder: "Backup Plan" },
        { key: "components", label: "Components", type: "text", placeholder: "Components" },
        { key: "depth", label: "Depth", type: "text", placeholder: "Depth" },
        {
            key: "dimension_unit",
            label: "Dimension Unit",
            type: "text",
            placeholder: "Dimension Unit",
        },
        {
            key: "expected_footfall",
            label: "Expected Footfall",
            type: "text",
            placeholder: "Expected Footfall",
        },
        {
            key: "experience_goals",
            label: "Experience Goals",
            type: "text",
            placeholder: "Experience Goals",
        },
        {
            key: "floor_plan_position",
            label: "Floor Plan Position",
            type: "text",
            placeholder: "Floor Plan Position",
        },
        { key: "height", label: "Height", type: "text", placeholder: "Height" },
        { key: "install_date", label: "Install Date", type: "date" },
        {
            key: "lead_id",
            label: "Lead",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.lead_id,
        },
        { key: "operating_hours", label: "Operating Hours", type: "number", min: 0 },
        {
            key: "power_requirements",
            label: "Power Requirements",
            type: "text",
            placeholder: "Power Requirements",
        },
        {
            key: "staffing_requirements",
            label: "Staffing Requirements",
            type: "text",
            placeholder: "Staffing Requirements",
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        { key: "strike_date", label: "Strike Date", type: "date" },
        { key: "team_ids", label: "Team Ids", type: "text", placeholder: "Team Ids" },
        { key: "vendor_ids", label: "Vendor Ids", type: "text", placeholder: "Vendor Ids" },
        {
            key: "weather_contingency",
            label: "Weather Contingency",
            type: "text",
            placeholder: "Weather Contingency",
        },
        { key: "width", label: "Width", type: "text", placeholder: "Width" },
        { key: "zone", label: "Zone", type: "text", placeholder: "Zone" },

        {
            key: "location_id",
            label: "Location",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.location_id,
        },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        {
            key: "target_audience",
            label: "Target Audience",
            type: "text",
            placeholder: "Target Audience",
        },
    ],
};

export const CREATE_SOW_CONFIG: CreateEntityConfig = {
    entityName: "Scope of Work",
    description: "Create a new scope of work.",
    fields: [
        {
            key: "title",
            label: "Title",
            type: "text",
            placeholder: "e.g. Q3 Production Services",
            required: true,
        },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: mapToOptions(SOW_STATUS_MAP),
            defaultValue: "draft",
            required: true,
        },
        { key: "estimated_start_date", label: "Start Date", type: "date" },
        { key: "estimated_end_date", label: "End Date", type: "date" },
        { key: "total_value", label: "Total Value", type: "currency" },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Scope details...",
        },
    ],
};

// ─── Sales & CRM ───

export const CREATE_DEAL_CONFIG: CreateEntityConfig = {
    entityName: "Deal",
    description: "Create a new deal in the pipeline.",
    fields: [
        {
            key: "title",
            label: "Deal Title",
            type: "text",
            placeholder: "e.g. Brand Partnership Q3",
            required: true,
        },
        {
            key: "company",
            label: "Company",
            type: "text",
            placeholder: "Company name",
            required: true,
        },
        {
            key: "stage",
            label: "Stage",
            type: "select",
            options: mapToOptions(DEAL_STAGE_MAP),
            defaultValue: "lead",
            required: true,
        },
        { key: "value", label: "Deal Value", type: "currency", required: true },
        {
            key: "probability",
            label: "Probability (%)",
            type: "number",
            placeholder: "50",
            min: 0,
            max: 100,
        },
        { key: "expected_close_date", label: "Expected Close", type: "date" },
        {
            key: "contact_name",
            label: "Contact Name",
            type: "text",
            placeholder: "Primary contact",
        },

        { key: "assigned_to", label: "Assigned To", type: "text", placeholder: "Assigned To" },
        {
            key: "company_id",
            label: "Company",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.company_id,
        },
        {
            key: "contact_id",
            label: "Contact",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.contact_id,
        },
        {
            key: "converted_project_id",
            label: "Converted Project",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/projects", labelField: "name" },
        },
        {
            key: "currency",
            label: "Currency",
            type: "select",
            options: [
                { value: "USD", label: "USD" },
                { value: "EUR", label: "EUR" },
                { value: "GBP", label: "GBP" },
                { value: "CAD", label: "CAD" },
            ],
            defaultValue: "USD",
        },
        {
            key: "lead_id",
            label: "Lead",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.lead_id,
        },
        { key: "lost_reason", label: "Lost Reason", type: "text", placeholder: "Lost Reason" },
        {
            key: "lost_reason_id",
            label: "Lost Reason",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/lost-reasons", labelField: "name" },
        },
        {
            key: "lost_to_competitor",
            label: "Lost To Competitor",
            type: "text",
            placeholder: "Lost To Competitor",
        },
        { key: "next_step", label: "Next Step", type: "text", placeholder: "Next Step" },
        { key: "next_step_date", label: "Next Step Date", type: "date" },
        {
            key: "pipeline_id",
            label: "Pipeline",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.pipeline_id,
        },
        {
            key: "source_id",
            label: "Source",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/lead-sources", labelField: "name" },
        },
        { key: "weighted_value", label: "Weighted Value", type: "currency" },

        { key: "contact_email", label: "Contact Email", type: "email" },
        { key: "converted_at", label: "Converted At", type: "text", placeholder: "Converted At" },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Notes..." },
        { key: "source", label: "Source", type: "text", placeholder: "Source" },
    ],
};

export const CREATE_LEAD_CONFIG: CreateEntityConfig = {
    entityName: "Lead",
    description: "Create a new lead.",
    fields: [
        {
            key: "first_name",
            label: "First Name",
            type: "text",
            placeholder: "First name",
            required: true,
        },
        { key: "last_name", label: "Last Name", type: "text", placeholder: "Last name" },
        { key: "email", label: "Email", type: "email", placeholder: "email@company.com" },
        { key: "company", label: "Company", type: "text", placeholder: "Company name" },
        { key: "phone", label: "Phone", type: "text", placeholder: "+1 (555) 000-0000" },
        {
            key: "source",
            label: "Source",
            type: "select",
            options: mapToOptions(LEAD_SOURCE_MAP),
        },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Initial notes..." },

        { key: "assigned_to", label: "Assigned To", type: "text", placeholder: "Assigned To" },
        {
            key: "company_id",
            label: "Company",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.company_id,
        },
        {
            key: "marketing_consent",
            label: "Marketing Consent",
            type: "text",
            placeholder: "Marketing Consent",
        },
        {
            key: "privacy_accepted",
            label: "Privacy Accepted",
            type: "text",
            placeholder: "Privacy Accepted",
        },
        { key: "project_type", label: "Project Type", type: "text", placeholder: "Project Type" },
        { key: "referrer_url", label: "Referrer Url", type: "url" },
        { key: "score", label: "Score", type: "text", placeholder: "Score" },
        {
            key: "source_detail",
            label: "Source Detail",
            type: "text",
            placeholder: "Source Detail",
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        { key: "utm_campaign", label: "Utm Campaign", type: "text", placeholder: "Utm Campaign" },
        { key: "utm_medium", label: "Utm Medium", type: "text", placeholder: "Utm Medium" },
        { key: "utm_source", label: "Utm Source", type: "text", placeholder: "Utm Source" },

        { key: "converted_at", label: "Converted At", type: "text", placeholder: "Converted At" },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Description...",
        },
        { key: "job_title", label: "Job Title", type: "text", placeholder: "Job Title" },
        {
            key: "last_contacted_at",
            label: "Last Contacted At",
            type: "text",
            placeholder: "Last Contacted At",
        },
        { key: "timeline", label: "Timeline", type: "text", placeholder: "Timeline" },

        {
            key: "converted_to_deal_id",
            label: "Converted To Deal",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/deals", labelField: "name" },
        },
    ],
};

export const CREATE_OPPORTUNITY_CONFIG: CreateEntityConfig = {
    entityName: "Opportunity",
    description: "Create a new sales opportunity.",
    fields: [
        {
            key: "title",
            label: "Opportunity Title",
            type: "text",
            placeholder: "e.g. Annual Sponsorship",
            required: true,
        },
        {
            key: "company",
            label: "Company",
            type: "text",
            placeholder: "Company name",
            required: true,
        },
        { key: "value", label: "Value", type: "currency" },
        {
            key: "stage",
            label: "Stage",
            type: "select",
            options: mapToOptions(OPPORTUNITY_FORM_STAGE_MAP),
            defaultValue: "qualification",
            required: true,
        },
        { key: "expected_close_date", label: "Expected Close", type: "date" },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Opportunity details...",
        },

        { key: "competitor", label: "Competitor", type: "text", placeholder: "Competitor" },
        {
            key: "currency",
            label: "Currency",
            type: "select",
            options: [
                { value: "USD", label: "USD" },
                { value: "EUR", label: "EUR" },
                { value: "GBP", label: "GBP" },
                { value: "CAD", label: "CAD" },
            ],
            defaultValue: "USD",
        },
        {
            key: "lead_id",
            label: "Lead",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.lead_id,
        },
        {
            key: "lost_reason_id",
            label: "Lost Reason",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/lost-reasons", labelField: "name" },
        },
        {
            key: "lost_reason_note",
            label: "Lost Reason Note",
            type: "text",
            placeholder: "Lost Reason Note",
        },
        {
            key: "pipeline_id",
            label: "Pipeline",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.pipeline_id,
        },
        { key: "weighted_value", label: "Weighted Value", type: "currency" },

        { key: "actual_close_date", label: "Actual Close Date", type: "date" },
        { key: "assigned_to", label: "Assigned To", type: "text", placeholder: "Assigned To" },
        {
            key: "company_id",
            label: "Company",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.company_id,
        },
        { key: "name", label: "Name", type: "text", placeholder: "Name" },
        { key: "next_step", label: "Next Step", type: "text", placeholder: "Next Step" },
        {
            key: "primary_contact_id",
            label: "Primary Contact",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/contacts", labelField: "first_name" },
        },
        { key: "probability", label: "Probability", type: "text", placeholder: "Probability" },
        { key: "type", label: "Type", type: "text", placeholder: "Type" },

        {
            key: "converted_to_deal_id",
            label: "Converted To Deal",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/deals", labelField: "name" },
        },
    ],
};

export const CREATE_COMPANY_CONFIG: CreateEntityConfig = {
    entityName: "Company",
    description: "Add a new client, brand, agency, or partner.",
    fields: [
        {
            key: "name",
            label: "Company Name",
            type: "text",
            placeholder: "e.g. Acme Corp",
            required: true,
        },
        {
            key: "company_type",
            label: "Type",
            type: "select",
            options: mapToOptions(COMPANY_TYPE_MAP),
            defaultValue: "client",
            required: true,
        },
        { key: "industry", label: "Industry", type: "text", placeholder: "e.g. Technology" },
        { key: "website", label: "Website", type: "text", placeholder: "https://example.com" },
        { key: "email", label: "Email", type: "email", placeholder: "info@company.com" },
        { key: "phone", label: "Phone", type: "text", placeholder: "+1 (555) 000-0000" },

        {
            key: "address_street2",
            label: "Address Street2",
            type: "text",
            placeholder: "Address Street2",
        },
        {
            key: "billing_address_same",
            label: "Billing Address Same",
            type: "text",
            placeholder: "Billing Address Same",
        },
        { key: "billing_city", label: "Billing City", type: "text", placeholder: "Billing City" },
        {
            key: "billing_country",
            label: "Billing Country",
            type: "text",
            placeholder: "Billing Country",
        },
        {
            key: "billing_postal_code",
            label: "Billing Postal Code",
            type: "text",
            placeholder: "Billing Postal Code",
        },
        {
            key: "billing_state",
            label: "Billing State",
            type: "text",
            placeholder: "Billing State",
        },
        {
            key: "billing_street1",
            label: "Billing Street1",
            type: "text",
            placeholder: "Billing Street1",
        },
        {
            key: "billing_street2",
            label: "Billing Street2",
            type: "text",
            placeholder: "Billing Street2",
        },
        {
            key: "default_currency",
            label: "Default Currency",
            type: "text",
            placeholder: "Default Currency",
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        {
            key: "team_id",
            label: "Team",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/teams", labelField: "name" },
        },

        { key: "address_city", label: "Address City", type: "text", placeholder: "Address City" },
        {
            key: "address_country",
            label: "Address Country",
            type: "text",
            placeholder: "Address Country",
        },
        {
            key: "address_postal_code",
            label: "Address Postal Code",
            type: "text",
            placeholder: "Address Postal Code",
        },
        {
            key: "address_state",
            label: "Address State",
            type: "text",
            placeholder: "Address State",
        },
        {
            key: "address_street1",
            label: "Address Street1",
            type: "text",
            placeholder: "Address Street1",
        },
        { key: "legal_name", label: "Legal Name", type: "text", placeholder: "Legal Name" },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Notes..." },
        { key: "payment_terms_days", label: "Payment Terms Days", type: "number", min: 0 },

        {
            key: "account_manager_id",
            label: "Account Manager",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/user-profiles", labelField: "display_name" },
        },
        {
            key: "brand_kit_id",
            label: "Brand Kit",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/brand-kits", labelField: "name" },
        },
        {
            key: "parent_company_id",
            label: "Parent Company",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/companies", labelField: "name" },
        },
    ],
};

export const CREATE_CONTACT_CONFIG: CreateEntityConfig = {
    entityName: "Contact",
    description: "Create a new contact or company.",
    fields: [
        {
            key: "name",
            label: "Name",
            type: "text",
            placeholder: "Person or company name",
            required: true,
        },
        { key: "email", label: "Email", type: "email", placeholder: "email@company.com" },
        { key: "phone", label: "Phone", type: "text", placeholder: "+1 (555) 000-0000" },
        { key: "company", label: "Company", type: "text", placeholder: "Company name" },
        {
            key: "role",
            label: "Role / Title",
            type: "text",
            placeholder: "e.g. Marketing Director",
        },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Additional context..." },

        {
            key: "dietary_restrictions",
            label: "Dietary Restrictions",
            type: "text",
            placeholder: "Dietary Restrictions",
        },
        { key: "full_name", label: "Full Name", type: "text", placeholder: "Full Name" },
        {
            key: "is_billing_contact",
            label: "Is Billing Contact",
            type: "select",
            options: YES_NO_OPTIONS,
        },
        {
            key: "is_decision_maker",
            label: "Is Decision Maker",
            type: "select",
            options: YES_NO_OPTIONS,
        },
        { key: "is_primary", label: "Is Primary", type: "select", options: YES_NO_OPTIONS },
        { key: "linkedin_url", label: "Linkedin Url", type: "url" },
        {
            key: "preferred_contact_method",
            label: "Preferred Contact Method",
            type: "text",
            placeholder: "Preferred Contact Method",
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        { key: "timezone", label: "Timezone", type: "text", placeholder: "Timezone" },

        {
            key: "company_id",
            label: "Company",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.company_id,
        },
        { key: "department", label: "Department", type: "text", placeholder: "Department" },
        { key: "first_name", label: "First Name", type: "text", placeholder: "First Name" },
        {
            key: "gdpr_consent_at",
            label: "Gdpr Consent At",
            type: "text",
            placeholder: "Gdpr Consent At",
        },
        { key: "last_name", label: "Last Name", type: "text", placeholder: "Last Name" },
        { key: "mobile", label: "Mobile", type: "text", placeholder: "Mobile" },
        { key: "title", label: "Title", type: "text", placeholder: "Title" },
    ],
};

export const CREATE_SERVICE_REQUEST_CONFIG: CreateEntityConfig = {
    entityName: "Service Request",
    description: "Create a new service request.",
    fields: [
        {
            key: "title",
            label: "Title",
            type: "text",
            placeholder: "e.g. Equipment malfunction",
            required: true,
        },
        {
            key: "priority",
            label: "Priority",
            type: "select",
            options: mapToOptions(SERVICE_REQUEST_PRIORITY_MAP),
            defaultValue: "medium",
            required: true,
        },
        {
            key: "category",
            label: "Category",
            type: "select",
            options: mapToOptions(SERVICE_REQUEST_CATEGORY_MAP),
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Describe the request...",
            required: true,
        },

        { key: "assessment_date", label: "Assessment Date", type: "date" },
        {
            key: "assessment_notes",
            label: "Assessment Notes",
            type: "text",
            placeholder: "Assessment Notes",
        },
        { key: "assigned_to", label: "Assigned To", type: "text", placeholder: "Assigned To" },
        {
            key: "attachment_urls",
            label: "Attachment Urls",
            type: "text",
            placeholder: "Attachment Urls",
        },
        {
            key: "company_id",
            label: "Company",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.company_id,
        },
        {
            key: "contact_id",
            label: "Contact",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.contact_id,
        },
        {
            key: "converted_to_id",
            label: "Converted To",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/service-requests", labelField: "title" },
        },
        {
            key: "converted_to_type",
            label: "Converted To Type",
            type: "text",
            placeholder: "Converted To Type",
        },
        { key: "csat_rating", label: "Csat Rating", type: "number", min: 1, max: 5 },
        {
            key: "internal_notes",
            label: "Internal Notes",
            type: "textarea",
            placeholder: "Internal Notes...",
        },
        { key: "is_flexible", label: "Is Flexible", type: "select", options: YES_NO_OPTIONS },
        {
            key: "location_notes",
            label: "Location Notes",
            type: "text",
            placeholder: "Location Notes",
        },
        { key: "preferred_date", label: "Preferred Date", type: "date" },
        {
            key: "preferred_time_end",
            label: "Preferred Time End",
            type: "text",
            placeholder: "Preferred Time End",
        },
        {
            key: "preferred_time_start",
            label: "Preferred Time Start",
            type: "text",
            placeholder: "Preferred Time Start",
        },
        { key: "requester_email", label: "Requester Email", type: "email" },
        {
            key: "requester_name",
            label: "Requester Name",
            type: "text",
            placeholder: "Requester Name",
        },
        {
            key: "requester_phone",
            label: "Requester Phone",
            type: "text",
            placeholder: "+1 (555) 000-0000",
        },
        {
            key: "requires_assessment",
            label: "Requires Assessment",
            type: "select",
            options: YES_NO_OPTIONS,
        },
        { key: "service_type", label: "Service Type", type: "text", placeholder: "Service Type" },
        { key: "sla_breached", label: "Sla Breached", type: "text", placeholder: "Sla Breached" },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },

        { key: "assessed_by", label: "Assessed By", type: "text", placeholder: "Assessed By" },
        { key: "converted_at", label: "Converted At", type: "text", placeholder: "Converted At" },
        { key: "converted_by", label: "Converted By", type: "text", placeholder: "Converted By" },
        {
            key: "location_id",
            label: "Location",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.location_id,
        },
        {
            key: "sla_resolution_due_at",
            label: "Sla Resolution Due At",
            type: "text",
            placeholder: "Sla Resolution Due At",
        },
        {
            key: "sla_resolved_at",
            label: "Sla Resolved At",
            type: "text",
            placeholder: "Sla Resolved At",
        },
        {
            key: "sla_responded_at",
            label: "Sla Responded At",
            type: "text",
            placeholder: "Sla Responded At",
        },
        {
            key: "sla_response_due_at",
            label: "Sla Response Due At",
            type: "text",
            placeholder: "Sla Response Due At",
        },

        {
            key: "sla_policy_id",
            label: "SLA Policy",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/sla-definitions", labelField: "name" },
        },
    ],
};

// ─── Finance ───

export const CREATE_INVOICE_CONFIG: CreateEntityConfig = {
    entityName: "Invoice",
    description: "Create a new invoice.",
    fields: [
        {
            key: "vendor_id",
            label: "Vendor",
            type: "text",
            placeholder: "Vendor ID",
            required: true,
        },
        { key: "amount", label: "Amount", type: "currency", required: true },
        { key: "invoice_date", label: "Invoice Date", type: "date", required: true },
        { key: "due_date", label: "Due Date", type: "date", required: true },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: mapToOptions(INVOICE_STATUS_MAP),
            defaultValue: "draft",
        },

        {
            key: "company_id",
            label: "Company",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.company_id,
        },
        {
            key: "delivery_status",
            label: "Delivery Status",
            type: "text",
            placeholder: "Delivery Status",
        },
        {
            key: "generated_from_time_entries",
            label: "Generated From Time Entries",
            type: "text",
            placeholder: "Generated From Time Entries",
        },
        {
            key: "invoice_number",
            label: "Invoice Number",
            type: "text",
            placeholder: "Invoice Number",
        },
        { key: "source", label: "Source", type: "text", placeholder: "Source" },
        {
            key: "template_id",
            label: "Template",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/templates", labelField: "name" },
        },

        { key: "paid_at", label: "Paid At", type: "text", placeholder: "Paid At" },
        {
            key: "purchase_order_id",
            label: "Purchase Order",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.purchase_order_id,
        },
        {
            key: "reminder_sent_at",
            label: "Reminder Sent At",
            type: "text",
            placeholder: "Reminder Sent At",
        },
        { key: "sent_at", label: "Sent At", type: "text", placeholder: "Sent At" },
        { key: "viewed_at", label: "Viewed At", type: "text", placeholder: "Viewed At" },

        {
            key: "goods_receipt_id",
            label: "Goods Receipt",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/goods-receipts", labelField: "number" },
        },
    ],
};

export const CREATE_EXPENSE_CONFIG: CreateEntityConfig = {
    entityName: "Expense",
    description: "Log a new expense.",
    fields: [
        {
            key: "description",
            label: "Description",
            type: "text",
            placeholder: "e.g. Venue deposit",
            required: true,
        },
        { key: "amount", label: "Amount", type: "currency", required: true },
        {
            key: "category",
            label: "Category",
            type: "select",
            options: mapToOptions(EXPENSE_CATEGORY_MAP),
            required: true,
        },

        {
            key: "receipt_verified",
            label: "Receipt Verified",
            type: "text",
            placeholder: "Receipt Verified",
        },
        {
            key: "sow_deliverable_id",
            label: "SOW Deliverable",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/sow-deliverables", labelField: "title" },
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },

        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "receipt_url", label: "Receipt Url", type: "url" },
        { key: "submitted_by", label: "Submitted By", type: "text", placeholder: "Submitted By" },
    ],
};

export const CREATE_ESTIMATE_CONFIG: CreateEntityConfig = {
    entityName: "Estimate",
    description: "Create a new cost estimate.",
    fields: [
        {
            key: "title",
            label: "Estimate Title",
            type: "text",
            placeholder: "e.g. Q3 Production Estimate",
            required: true,
        },
        {
            key: "number",
            label: "Estimate Number",
            type: "text",
            placeholder: "EST-001",
            required: true,
        },
        { key: "subtotal", label: "Subtotal", type: "currency", required: true },
        { key: "total", label: "Total", type: "currency", required: true },
        { key: "valid_until", label: "Valid Until", type: "date" },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: mapToOptions(ESTIMATE_STATUS_MAP),
            defaultValue: "draft",
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Estimate details...",
        },

        {
            key: "converted_project_id",
            label: "Converted Project",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/projects", labelField: "name" },
        },
        {
            key: "currency",
            label: "Currency",
            type: "select",
            options: [
                { value: "USD", label: "USD" },
                { value: "EUR", label: "EUR" },
                { value: "GBP", label: "GBP" },
                { value: "CAD", label: "CAD" },
            ],
            defaultValue: "USD",
        },
        {
            key: "deal_id",
            label: "Deal",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.deal_id,
        },
        { key: "discount_amount", label: "Discount Amount", type: "currency" },
        { key: "discount_percent", label: "Discount Percent", type: "number", min: 0 },
        {
            key: "internal_notes",
            label: "Internal Notes",
            type: "textarea",
            placeholder: "Internal Notes...",
        },
        {
            key: "signature_required",
            label: "Signature Required",
            type: "text",
            placeholder: "Signature Required",
        },
        { key: "tax_amount", label: "Tax Amount", type: "currency" },
        { key: "tax_percent", label: "Tax Percent", type: "number", min: 0 },

        { key: "accepted_at", label: "Accepted At", type: "text", placeholder: "Accepted At" },
        {
            key: "client_notes",
            label: "Client Notes",
            type: "textarea",
            placeholder: "Client Notes...",
        },
        {
            key: "company_id",
            label: "Company",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.company_id,
        },
        {
            key: "contact_id",
            label: "Contact",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.contact_id,
        },
        { key: "proposed_end_date", label: "Proposed End Date", type: "date" },
        { key: "proposed_start_date", label: "Proposed Start Date", type: "date" },
        { key: "sent_at", label: "Sent At", type: "text", placeholder: "Sent At" },
        { key: "signed_by", label: "Signed By", type: "text", placeholder: "Signed By" },
        { key: "viewed_at", label: "Viewed At", type: "text", placeholder: "Viewed At" },

        {
            key: "converted_sow_id",
            label: "Converted SOW",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/sows", labelField: "title" },
        },
    ],
};

export const CREATE_BUDGET_CONFIG: CreateEntityConfig = {
    entityName: "Budget",
    description: "Create a new budget.",
    fields: [
        {
            key: "project_id",
            label: "Project",
            type: "text",
            placeholder: "Project ID",
            required: true,
        },
        { key: "total_budget", label: "Total Budget", type: "currency", required: true },
        { key: "effective_date", label: "Effective Date", type: "date", required: true },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: mapToOptions(BUDGET_STATUS_MAP),
            defaultValue: "draft",
        },
        {
            key: "notes",
            label: "Notes",
            type: "textarea",
            placeholder: "Budget notes...",
        },

        {
            key: "alert_thresholds",
            label: "Alert Thresholds",
            type: "text",
            placeholder: "Alert Thresholds",
        },
        { key: "contingency_percent", label: "Contingency Percent", type: "number", min: 0 },
        {
            key: "currency",
            label: "Currency",
            type: "select",
            options: [
                { value: "USD", label: "USD" },
                { value: "EUR", label: "EUR" },
                { value: "GBP", label: "GBP" },
                { value: "CAD", label: "CAD" },
            ],
            defaultValue: "USD",
        },
        { key: "markup_percent", label: "Markup Percent", type: "number", min: 0 },
        { key: "total_actual", label: "Total Actual", type: "text", placeholder: "Total Actual" },
        {
            key: "total_variance",
            label: "Total Variance",
            type: "text",
            placeholder: "Total Variance",
        },
        { key: "version", label: "Version", type: "number", min: 0 },

        {
            key: "prepared_by_id",
            label: "Prepared By",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/user-profiles", labelField: "display_name" },
        },
    ],
};

export const CREATE_PURCHASE_ORDER_CONFIG: CreateEntityConfig = {
    entityName: "Purchase Order",
    description: "Create a new purchase order for a vendor.",
    fields: [
        {
            key: "vendor_id",
            label: "Vendor",
            type: "text",
            placeholder: "Vendor ID or name",
            required: true,
        },
        { key: "total_amount", label: "Total Amount", type: "currency", required: true },
        { key: "issued_date", label: "Issue Date", type: "date", required: true },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: mapToOptions(PURCHASE_ORDER_STATUS_MAP),
            defaultValue: "draft",
        },

        {
            key: "contract_id",
            label: "Contract",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.contract_id,
        },
        { key: "po_number", label: "Po Number", type: "text", placeholder: "Po Number" },

        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
    ],
};

export const CREATE_PURCHASE_REQUISITION_CONFIG: CreateEntityConfig = {
    entityName: "Purchase Requisition",
    description: "Create a new purchase requisition.",
    fields: [
        {
            key: "title",
            label: "Title",
            type: "text",
            placeholder: "e.g. AV Equipment for Event",
            required: true,
        },
        { key: "vendor", label: "Vendor", type: "text", placeholder: "Preferred vendor" },
        { key: "amount", label: "Estimated Cost", type: "currency", required: true },
        { key: "needed_by", label: "Needed By", type: "date" },
        {
            key: "priority",
            label: "Priority",
            type: "select",
            options: mapToOptions(SERVICE_REQUEST_PRIORITY_MAP),
            defaultValue: "medium",
        },
        {
            key: "justification",
            label: "Justification",
            type: "textarea",
            placeholder: "Why is this purchase needed?",
            required: true,
        },

        { key: "budget_code", label: "Budget Code", type: "text", placeholder: "Budget Code" },
        {
            key: "converted_po_id",
            label: "Converted PO",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/purchase-orders", labelField: "number" },
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Description...",
        },
        { key: "estimated_cost", label: "Estimated Cost", type: "currency" },
        {
            key: "gl_account_id",
            label: "GL Account",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/gl-accounts", labelField: "name" },
        },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Notes..." },
        { key: "number", label: "Number", type: "text", placeholder: "Number" },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        {
            key: "requester_id",
            label: "Requester",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/user-profiles", labelField: "display_name" },
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },

        {
            key: "suggested_vendor_id",
            label: "Suggested Vendor",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/vendors", labelField: "name" },
        },
    ],
};

// ─── Creative & Docs ───

export const CREATE_BRIEF_CONFIG: CreateEntityConfig = {
    entityName: "Brief",
    description: "Create a new creative brief.",
    fields: [
        {
            key: "title",
            label: "Brief Title",
            type: "text",
            placeholder: "e.g. Summer Campaign Visual Identity",
            required: true,
        },
        {
            key: "type",
            label: "Brief Type",
            type: "select",
            options: mapToOptions(CREATIVE_BRIEF_FORM_TYPE_MAP),
            required: true,
        },
        { key: "due_date", label: "Due Date", type: "date" },
        {
            key: "objective",
            label: "Objective",
            type: "textarea",
            placeholder: "What is the goal of this brief?",
            required: true,
        },
        {
            key: "description",
            label: "Details",
            type: "textarea",
            placeholder: "Additional context and requirements...",
        },
    ],
};

export const CREATE_CAMPAIGN_CONFIG: CreateEntityConfig = {
    entityName: "Campaign",
    description: "Create a new marketing campaign.",
    fields: [
        {
            key: "name",
            label: "Campaign Name",
            type: "text",
            placeholder: "e.g. Holiday Brand Push",
            required: true,
        },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: mapToOptions(CAMPAIGN_STATUS_MAP),
            defaultValue: "planning",
        },
        { key: "start_date", label: "Start Date", type: "date" },
        { key: "end_date", label: "End Date", type: "date" },
        { key: "total_budget", label: "Budget", type: "currency" },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Campaign overview...",
        },

        {
            key: "company_id",
            label: "Company",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.company_id,
        },
        { key: "key_messages", label: "Key Messages", type: "text", placeholder: "Key Messages" },
        { key: "launch_date", label: "Launch Date", type: "date" },
        {
            key: "owner_id",
            label: "Owner",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.owner_id,
        },
        {
            key: "post_analysis_notes",
            label: "Post Analysis Notes",
            type: "text",
            placeholder: "Post Analysis Notes",
        },
        { key: "roi", label: "Roi", type: "text", placeholder: "Roi" },
        { key: "roi_percent", label: "Roi Percent", type: "number", min: 0 },
        { key: "spent_budget", label: "Spent Budget", type: "currency" },
        {
            key: "team_member_ids",
            label: "Team Member Ids",
            type: "text",
            placeholder: "Team Member Ids",
        },
        {
            key: "total_conversions",
            label: "Total Conversions",
            type: "text",
            placeholder: "Total Conversions",
        },
        {
            key: "total_engagements",
            label: "Total Engagements",
            type: "text",
            placeholder: "Total Engagements",
        },
        {
            key: "total_impressions",
            label: "Total Impressions",
            type: "text",
            placeholder: "Total Impressions",
        },
        { key: "total_reach", label: "Total Reach", type: "text", placeholder: "Total Reach" },

        {
            key: "brief_id",
            label: "Brief",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.brief_id,
        },
        { key: "objective", label: "Objective", type: "textarea", placeholder: "Objective..." },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        {
            key: "target_audience",
            label: "Target Audience",
            type: "text",
            placeholder: "Target Audience",
        },
    ],
};

export const CREATE_PROPOSAL_CONFIG: CreateEntityConfig = {
    entityName: "Proposal",
    description: "Create a new proposal.",
    fields: [
        {
            key: "title",
            label: "Proposal Title",
            type: "text",
            placeholder: "e.g. Q4 Production Services Proposal",
            required: true,
        },
        {
            key: "number",
            label: "Proposal Number",
            type: "text",
            placeholder: "PROP-001",
            required: true,
        },
        { key: "subtotal", label: "Subtotal", type: "currency", required: true },
        { key: "total", label: "Total", type: "currency", required: true },
        { key: "valid_until", label: "Valid Until", type: "date" },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: mapToOptions(ESTIMATE_STATUS_MAP),
            defaultValue: "draft",
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Proposal summary...",
        },

        {
            key: "company_id",
            label: "Company",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.company_id,
        },
        {
            key: "contact_id",
            label: "Contact",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.contact_id,
        },
        {
            key: "converted_project_id",
            label: "Converted Project",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/projects", labelField: "name" },
        },
        {
            key: "currency",
            label: "Currency",
            type: "select",
            options: [
                { value: "USD", label: "USD" },
                { value: "EUR", label: "EUR" },
                { value: "GBP", label: "GBP" },
                { value: "CAD", label: "CAD" },
            ],
            defaultValue: "USD",
        },
        {
            key: "deal_id",
            label: "Deal",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.deal_id,
        },
        {
            key: "deliverables",
            label: "Deliverables",
            type: "textarea",
            placeholder: "Deliverables...",
        },
        { key: "discount_amount", label: "Discount Amount", type: "currency" },
        { key: "discount_percent", label: "Discount Percent", type: "number", min: 0 },
        { key: "introduction", label: "Introduction", type: "text", placeholder: "Introduction" },
        { key: "proposed_end_date", label: "Proposed End Date", type: "date" },
        { key: "proposed_start_date", label: "Proposed Start Date", type: "date" },
        { key: "public_token", label: "Public Token", type: "text", placeholder: "Public Token" },
        {
            key: "scope_of_work",
            label: "Scope Of Work",
            type: "text",
            placeholder: "Scope Of Work",
        },
        { key: "signature_ip", label: "Signature Ip", type: "text", placeholder: "Signature Ip" },
        {
            key: "signature_required",
            label: "Signature Required",
            type: "text",
            placeholder: "Signature Required",
        },
        { key: "tax_amount", label: "Tax Amount", type: "currency" },
        { key: "tax_percent", label: "Tax Percent", type: "number", min: 0 },
        {
            key: "template_id",
            label: "Template",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/templates", labelField: "name" },
        },
        {
            key: "terms_and_conditions",
            label: "Terms And Conditions",
            type: "text",
            placeholder: "Terms And Conditions",
        },
        { key: "version", label: "Version", type: "number", min: 0 },

        { key: "accepted_at", label: "Accepted At", type: "text", placeholder: "Accepted At" },
        { key: "sent_at", label: "Sent At", type: "text", placeholder: "Sent At" },
        { key: "signed_by", label: "Signed By", type: "text", placeholder: "Signed By" },
        { key: "viewed_at", label: "Viewed At", type: "text", placeholder: "Viewed At" },

        {
            key: "parent_proposal_id",
            label: "Parent Proposal",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/proposals", labelField: "title" },
        },
    ],
};

// ─── Vendor & Operations ───

export const CREATE_VENDOR_CONFIG: CreateEntityConfig = {
    entityName: "Vendor",
    description: "Add a new vendor.",
    fields: [
        {
            key: "name",
            label: "Vendor Name",
            type: "text",
            placeholder: "e.g. StageWorks Inc.",
            required: true,
        },
        { key: "email", label: "Email", type: "email", placeholder: "contact@vendor.com" },
        { key: "phone", label: "Phone", type: "text", placeholder: "+1 (555) 000-0000" },
        {
            key: "category",
            label: "Category",
            type: "select",
            options: mapToOptions(VENDOR_CATEGORY_MAP),
        },
        { key: "website", label: "Website", type: "url", placeholder: "https://..." },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Vendor details..." },

        { key: "average_rating", label: "Average Rating", type: "number", min: 1, max: 5 },
        { key: "categories", label: "Categories", type: "text", placeholder: "Categories" },
        { key: "coi_expiry_date", label: "Coi Expiry Date", type: "date" },
        { key: "company_name", label: "Company Name", type: "text", placeholder: "Company Name" },
        { key: "contact_name", label: "Contact Name", type: "text", placeholder: "Contact Name" },
        { key: "default_day_rate", label: "Default Day Rate", type: "currency" },
        { key: "default_hourly_rate", label: "Default Hourly Rate", type: "currency" },
        { key: "do_not_hire", label: "Do Not Hire", type: "text", placeholder: "Do Not Hire" },
        {
            key: "insurance_minimum",
            label: "Insurance Minimum",
            type: "text",
            placeholder: "Insurance Minimum",
        },
        { key: "last_project_date", label: "Last Project Date", type: "date" },
        { key: "nda_signed", label: "Nda Signed", type: "text", placeholder: "Nda Signed" },
        {
            key: "onboarding_status",
            label: "Onboarding Status",
            type: "text",
            placeholder: "Onboarding Status",
        },
        { key: "payment_terms_days", label: "Payment Terms Days", type: "number", min: 0 },
        { key: "rating", label: "Rating", type: "text", placeholder: "Rating" },
        {
            key: "service_areas",
            label: "Service Areas",
            type: "text",
            placeholder: "Service Areas",
        },
        { key: "specialty", label: "Specialty", type: "text", placeholder: "Specialty" },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        {
            key: "total_projects",
            label: "Total Projects",
            type: "text",
            placeholder: "Total Projects",
        },
        { key: "total_spend", label: "Total Spend", type: "text", placeholder: "Total Spend" },
        { key: "w9_uploaded", label: "W9 Uploaded", type: "text", placeholder: "W9 Uploaded" },
        {
            key: "worker_profile_id",
            label: "Worker Profile",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.worker_profile_id,
        },

        {
            key: "onboarding_completed_at",
            label: "Onboarding Completed At",
            type: "text",
            placeholder: "Onboarding Completed At",
        },
        { key: "vendor_type", label: "Vendor Type", type: "text", placeholder: "Vendor Type" },
    ],
};

export const CREATE_WORK_ORDER_CONFIG: CreateEntityConfig = {
    entityName: "Work Order",
    description: "Create a new work order.",
    fields: [
        {
            key: "title",
            label: "Title",
            type: "text",
            placeholder: "e.g. Stage Build — Main Hall",
            required: true,
        },
        {
            key: "vendor_id",
            label: "Vendor",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.vendor_id,
        },
        {
            key: "priority",
            label: "Priority",
            type: "select",
            options: mapToOptions(WORK_ORDER_PRIORITY_MAP),
            defaultValue: "medium",
            required: true,
        },
        { key: "scheduled_end", label: "Due Date", type: "date" },
        { key: "estimated_cost", label: "Budget", type: "currency" },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Work order details...",
            required: true,
        },

        { key: "bid_deadline", label: "Bid Deadline", type: "date" },
        { key: "billing_type", label: "Billing Type", type: "text", placeholder: "Billing Type" },
        { key: "category", label: "Category", type: "text", placeholder: "Category" },
        {
            key: "checklist_template_id",
            label: "Checklist Template",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.checklist_template_id,
        },
        {
            key: "completion_notes",
            label: "Completion Notes",
            type: "textarea",
            placeholder: "Completion Notes...",
        },
        {
            key: "completion_photos",
            label: "Completion Photos",
            type: "text",
            placeholder: "Completion Photos",
        },
        {
            key: "is_open_for_bids",
            label: "Is Open For Bids",
            type: "select",
            options: YES_NO_OPTIONS,
        },
        { key: "max_bidders", label: "Max Bidders", type: "number", min: 0 },
        { key: "number", label: "Number", type: "text", placeholder: "Number" },
        {
            key: "parent_work_order_id",
            label: "Parent Work Order",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/work-orders", labelField: "title" },
        },
        {
            key: "purchase_order_id",
            label: "Purchase Order",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.purchase_order_id,
        },
        {
            key: "requires_checklist_completion",
            label: "Requires Checklist Completion",
            type: "select",
            options: YES_NO_OPTIONS,
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        {
            key: "supervisor_id",
            label: "Supervisor",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.supervisor_id,
        },

        { key: "estimated_hours", label: "Estimated Hours", type: "number", min: 0 },
        {
            key: "location_id",
            label: "Location",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.location_id,
        },
        { key: "not_to_exceed", label: "Not To Exceed", type: "currency" },
        { key: "phase", label: "Phase", type: "text", placeholder: "Phase" },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "scheduled_start", label: "Scheduled Start", type: "datetime-local" },
    ],
};

export const CREATE_CONTRACT_CONFIG: CreateEntityConfig = {
    entityName: "Contract",
    description: "Create a new contract.",
    fields: [
        {
            key: "title",
            label: "Contract Title",
            type: "text",
            placeholder: "e.g. Vendor Services Agreement",
            required: true,
        },
        {
            key: "counterparty",
            label: "Counterparty",
            type: "text",
            placeholder: "Company or individual name",
            required: true,
        },
        {
            key: "type",
            label: "Type",
            type: "select",
            options: mapToOptions(CONTRACT_TYPE_MAP),
            required: true,
        },
        { key: "value", label: "Contract Value", type: "currency" },
        { key: "start_date", label: "Start Date", type: "date" },
        { key: "end_date", label: "End Date", type: "date" },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Contract summary...",
        },

        {
            key: "amendment_ids",
            label: "Amendment Ids",
            type: "text",
            placeholder: "Amendment Ids",
        },
        { key: "auto_renew", label: "Auto Renew", type: "text", placeholder: "Auto Renew" },
        { key: "document_url", label: "Document Url", type: "url" },
        {
            key: "indemnification_clause",
            label: "Indemnification Clause",
            type: "text",
            placeholder: "Indemnification Clause",
        },
        {
            key: "termination_clause",
            label: "Termination Clause",
            type: "text",
            placeholder: "Termination Clause",
        },

        {
            key: "counterparty_name",
            label: "Counterparty Name",
            type: "text",
            placeholder: "Counterparty Name",
        },
        { key: "effective_date", label: "Effective Date", type: "date" },
        { key: "expiration_date", label: "Expiration Date", type: "date" },
        { key: "number", label: "Number", type: "text", placeholder: "Number" },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "scope", label: "Scope", type: "textarea", placeholder: "Scope..." },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        {
            key: "vendor_id",
            label: "Vendor",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.vendor_id,
        },

        {
            key: "parent_contract_id",
            label: "Parent Contract",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/contracts", labelField: "title" },
        },
        {
            key: "signatory_id",
            label: "Signatory",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/contacts", labelField: "first_name" },
        },
    ],
};

export const CREATE_INCIDENT_CONFIG: CreateEntityConfig = {
    entityName: "Incident",
    description: "Report a new incident.",
    fields: [
        {
            key: "title",
            label: "Incident Title",
            type: "text",
            placeholder: "e.g. Equipment failure at venue",
            required: true,
        },
        {
            key: "severity",
            label: "Severity",
            type: "select",
            options: mapToOptions(INCIDENT_SEVERITY_MAP),
            defaultValue: "medium",
            required: true,
        },
        { key: "date", label: "Date / Time", type: "datetime-local", required: true },
        { key: "location", label: "Location", type: "text", placeholder: "Where did it occur?" },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Describe what happened...",
            required: true,
        },

        {
            key: "attachment_ids",
            label: "Attachment Ids",
            type: "text",
            placeholder: "Attachment Ids",
        },
        {
            key: "auto_escalated",
            label: "Auto Escalated",
            type: "text",
            placeholder: "Auto Escalated",
        },
        { key: "claim_number", label: "Claim Number", type: "text", placeholder: "Claim Number" },
        {
            key: "environmental_conditions",
            label: "Environmental Conditions",
            type: "text",
            placeholder: "Environmental Conditions",
        },
        {
            key: "escalation_level",
            label: "Escalation Level",
            type: "text",
            placeholder: "Escalation Level",
        },
        { key: "estimated_cost", label: "Estimated Cost", type: "currency" },
        { key: "event_phase", label: "Event Phase", type: "text", placeholder: "Event Phase" },
        {
            key: "evidence_urls",
            label: "Evidence Urls",
            type: "text",
            placeholder: "Evidence Urls",
        },
        {
            key: "first_responder_id",
            label: "First Responder",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/user-profiles", labelField: "display_name" },
        },
        {
            key: "follow_up_task_ids",
            label: "Follow Up Task Ids",
            type: "text",
            placeholder: "Follow Up Task Ids",
        },
        {
            key: "immediate_actions",
            label: "Immediate Actions",
            type: "textarea",
            placeholder: "Immediate Actions...",
        },
        {
            key: "insurance_claim",
            label: "Insurance Claim",
            type: "text",
            placeholder: "Insurance Claim",
        },
        {
            key: "insurance_notified",
            label: "Insurance Notified",
            type: "text",
            placeholder: "Insurance Notified",
        },
        {
            key: "involved_party_ids",
            label: "Involved Party Ids",
            type: "text",
            placeholder: "Involved Party Ids",
        },
        {
            key: "live_event_id",
            label: "Live Event",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/live-events", labelField: "name" },
        },
        {
            key: "location_id",
            label: "Location",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.location_id,
        },
        {
            key: "medical_transport",
            label: "Medical Transport",
            type: "text",
            placeholder: "Medical Transport",
        },
        { key: "number", label: "Number", type: "text", placeholder: "Number" },
        { key: "occurred_at", label: "Occurred At", type: "datetime-local" },
        {
            key: "osha_reportable",
            label: "Osha Reportable",
            type: "text",
            placeholder: "Osha Reportable",
        },
        {
            key: "preventive_measures",
            label: "Preventive Measures",
            type: "text",
            placeholder: "Preventive Measures",
        },
        { key: "resolution", label: "Resolution", type: "textarea", placeholder: "Resolution..." },
        {
            key: "response_team_ids",
            label: "Response Team Ids",
            type: "text",
            placeholder: "Response Team Ids",
        },
        {
            key: "response_time_seconds",
            label: "Response Time Seconds",
            type: "text",
            placeholder: "Response Time Seconds",
        },
        { key: "root_cause", label: "Root Cause", type: "text", placeholder: "Root Cause" },
        {
            key: "specific_location",
            label: "Specific Location",
            type: "text",
            placeholder: "Specific Location",
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        {
            key: "transport_destination",
            label: "Transport Destination",
            type: "text",
            placeholder: "Transport Destination",
        },
        { key: "witness_ids", label: "Witness Ids", type: "text", placeholder: "Witness Ids" },
        {
            key: "witness_statements",
            label: "Witness Statements",
            type: "text",
            placeholder: "Witness Statements",
        },

        {
            key: "insurance_notified_at",
            label: "Insurance Notified At",
            type: "text",
            placeholder: "Insurance Notified At",
        },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "reported_at", label: "Reported At", type: "text", placeholder: "Reported At" },
        { key: "resolved_at", label: "Resolved At", type: "text", placeholder: "Resolved At" },
        { key: "type", label: "Type", type: "text", placeholder: "Type" },

        {
            key: "assigned_to_id",
            label: "Assigned To",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/user-profiles", labelField: "display_name" },
        },
        {
            key: "reported_by_id",
            label: "Reported By",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/user-profiles", labelField: "display_name" },
        },
    ],
};

// ─── Assets & Logistics ───

export const CREATE_ASSET_CONFIG: CreateEntityConfig = {
    entityName: "Asset",
    description: "Register a new asset.",
    fields: [
        {
            key: "name",
            label: "Asset Name",
            type: "text",
            placeholder: "e.g. LED Panel 4x8",
            required: true,
        },
        {
            key: "category",
            label: "Category",
            type: "select",
            options: mapToOptions(ASSET_CATEGORY_MAP),
            required: true,
        },
        { key: "serial_number", label: "Serial Number", type: "text", placeholder: "S/N" },
        { key: "barcode", label: "Barcode", type: "text", placeholder: "Barcode", required: true },
        {
            key: "location",
            label: "Location",
            type: "text",
            placeholder: "Current location",
            required: true,
        },
        {
            key: "condition",
            label: "Condition",
            type: "text",
            placeholder: "e.g. Good",
            required: true,
        },
        {
            key: "owned_or_rental",
            label: "Ownership",
            type: "text",
            placeholder: "Owned or Rental",
            required: true,
        },
        { key: "purchase_price", label: "Purchase Price", type: "currency" },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Asset details..." },

        { key: "asset_class", label: "Asset Class", type: "text", placeholder: "Asset Class" },
        {
            key: "certification_types",
            label: "Certification Types",
            type: "text",
            placeholder: "Certification Types",
        },
        {
            key: "current_custodian_id",
            label: "Custodian",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/user-profiles", labelField: "display_name" },
        },
        {
            key: "current_location_id",
            label: "Current Location",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/locations", labelField: "name" },
        },
        { key: "daily_rental_cost", label: "Daily Rental Cost", type: "currency" },
        { key: "disposal_date", label: "Disposal Date", type: "date" },
        {
            key: "disposal_method",
            label: "Disposal Method",
            type: "text",
            placeholder: "Disposal Method",
        },
        { key: "disposal_value", label: "Disposal Value", type: "currency" },
        {
            key: "home_location_id",
            label: "Home Location",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/locations", labelField: "name" },
        },
        { key: "insurance_value", label: "Insurance Value", type: "currency" },
        { key: "is_serialized", label: "Is Serialized", type: "select", options: YES_NO_OPTIONS },
        { key: "last_certification_date", label: "Last Certification Date", type: "date" },
        { key: "last_maintenance_date", label: "Last Maintenance Date", type: "date" },
        {
            key: "maintenance_schedule",
            label: "Maintenance Schedule",
            type: "text",
            placeholder: "Maintenance Schedule",
        },
        { key: "manufacturer", label: "Manufacturer", type: "text", placeholder: "Manufacturer" },
        { key: "next_maintenance_date", label: "Next Maintenance Date", type: "date" },
        { key: "nfc_tag", label: "Nfc Tag", type: "text", placeholder: "Nfc Tag" },
        {
            key: "owner_id",
            label: "Owner",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.owner_id,
        },
        { key: "qr_code_url", label: "Qr Code Url", type: "url" },
        { key: "rental_return_date", label: "Rental Return Date", type: "date" },
        {
            key: "requires_certification",
            label: "Requires Certification",
            type: "select",
            options: YES_NO_OPTIONS,
        },
        { key: "sku", label: "Sku", type: "text", placeholder: "Sku" },
        {
            key: "specifications",
            label: "Specifications",
            type: "text",
            placeholder: "Specifications",
        },
        { key: "subcategory", label: "Subcategory", type: "text", placeholder: "Subcategory" },
        {
            key: "vendor_id",
            label: "Vendor",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.vendor_id,
        },
        {
            key: "warehouse_location_id",
            label: "Warehouse Loc.",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/warehouse-locations", labelField: "name" },
        },
        {
            key: "warranty_expiry",
            label: "Warranty Expiry",
            type: "text",
            placeholder: "Warranty Expiry",
        },
        { key: "weight", label: "Weight", type: "number", min: 0 },
        { key: "weight_unit", label: "Weight Unit", type: "text", placeholder: "Weight Unit" },

        { key: "model", label: "Model", type: "text", placeholder: "Model" },
    ],
};

export const CREATE_SHIPMENT_CONFIG: CreateEntityConfig = {
    entityName: "Shipment",
    description: "Create a new shipment.",
    fields: [
        {
            key: "number",
            label: "Shipment Number",
            type: "text",
            placeholder: "e.g. SHIP-2024-001",
            required: true,
        },
        {
            key: "tracking_number",
            label: "Tracking Number",
            type: "text",
            placeholder: "Carrier tracking #",
        },
        {
            key: "carrier_name",
            label: "Carrier",
            type: "text",
            placeholder: "Carrier name",
            required: true,
        },
        { key: "pickup_date", label: "Pickup Date", type: "date", required: true },
        {
            key: "estimated_delivery_date",
            label: "Expected Delivery",
            type: "date",
            required: true,
        },
        {
            key: "special_instructions",
            label: "Special Instructions",
            type: "textarea",
            placeholder: "Shipment details...",
        },

        {
            key: "appointment_required",
            label: "Appointment Required",
            type: "text",
            placeholder: "Appointment Required",
        },
        {
            key: "carrier_id",
            label: "Carrier",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/vendors", labelField: "name" },
        },
        {
            key: "coordinator_id",
            label: "Coordinator",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/contacts", labelField: "first_name" },
        },
        { key: "cost", label: "Cost", type: "currency" },
        {
            key: "customs_clearance_status",
            label: "Customs Clearance Status",
            type: "text",
            placeholder: "Customs Clearance Status",
        },
        {
            key: "customs_declaration_number",
            label: "Customs Declaration Number",
            type: "text",
            placeholder: "Customs Declaration Number",
        },
        { key: "declared_value", label: "Declared Value", type: "currency" },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Description...",
        },
        {
            key: "destination_address",
            label: "Destination Address",
            type: "text",
            placeholder: "Destination Address",
        },
        {
            key: "destination_location_id",
            label: "Dest. Location",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/locations", labelField: "name" },
        },
        {
            key: "driver_id",
            label: "Driver",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/contacts", labelField: "first_name" },
        },
        {
            key: "export_license",
            label: "Export License",
            type: "text",
            placeholder: "Export License",
        },
        { key: "hazmat_class", label: "Hazmat Class", type: "text", placeholder: "Hazmat Class" },
        { key: "hs_codes", label: "Hs Codes", type: "text", placeholder: "Hs Codes" },
        { key: "incoterms", label: "Incoterms", type: "text", placeholder: "Incoterms" },
        {
            key: "inside_delivery",
            label: "Inside Delivery",
            type: "text",
            placeholder: "Inside Delivery",
        },
        { key: "insurance_value", label: "Insurance Value", type: "currency" },
        {
            key: "liftgate_required",
            label: "Liftgate Required",
            type: "text",
            placeholder: "Liftgate Required",
        },
        {
            key: "origin_address",
            label: "Origin Address",
            type: "text",
            placeholder: "Origin Address",
        },
        { key: "pickup_time", label: "Pickup Time", type: "text", placeholder: "Pickup Time" },
        { key: "priority", label: "Priority", type: "text", placeholder: "Priority" },
        {
            key: "purchase_order_id",
            label: "Purchase Order",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.purchase_order_id,
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        { key: "total_pieces", label: "Total Pieces", type: "number", min: 0 },
        { key: "total_weight", label: "Total Weight", type: "number", min: 0 },
        { key: "weight_unit", label: "Weight Unit", type: "text", placeholder: "Weight Unit" },

        { key: "actual_delivery_date", label: "Actual Delivery Date", type: "date" },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "type", label: "Type", type: "text", placeholder: "Type" },

        {
            key: "origin_location_id",
            label: "Origin Location",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/locations", labelField: "name" },
        },
        {
            key: "vehicle_id",
            label: "Vehicle",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/vehicles", labelField: "name" },
        },
    ],
};

// ─── Teams ───

export const CREATE_TEAM_CONFIG: CreateEntityConfig = {
    entityName: "Team",
    description: "Create a new team to organize members.",
    fields: [
        {
            key: "name",
            label: "Team Name",
            type: "text",
            placeholder: "e.g. Camera Department",
            required: true,
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "What this team does...",
        },

        { key: "max_capacity", label: "Max Capacity", type: "text", placeholder: "Max Capacity" },
    ],
};

// ─── Accounts & People ───

export const CREATE_ACCOUNT_CONFIG: CreateEntityConfig = {
    entityName: "Account",
    description: "Create a new account (stakeholder).",
    fields: [
        {
            key: "name",
            label: "Account Name",
            type: "text",
            placeholder: "e.g. Acme Corp",
            required: true,
        },
        {
            key: "type",
            label: "Type",
            type: "select",
            options: mapToOptions(COMPANY_TYPE_MAP),
            required: true,
        },
        { key: "email", label: "Email", type: "email", placeholder: "contact@company.com" },
        { key: "phone", label: "Phone", type: "text", placeholder: "+1 (555) 000-0000" },
        { key: "website", label: "Website", type: "url", placeholder: "https://..." },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Account details..." },
    ],
};

export const CREATE_PERSON_CONFIG: CreateEntityConfig = {
    entityName: "Person",
    description: "Add a new person to the directory.",
    fields: [
        {
            key: "name",
            label: "Full Name",
            type: "text",
            placeholder: "e.g. Jane Smith",
            required: true,
        },
        {
            key: "email",
            label: "Email",
            type: "email",
            placeholder: "jane@company.com",
            required: true,
        },
        { key: "phone", label: "Phone", type: "text", placeholder: "+1 (555) 000-0000" },
        {
            key: "role",
            label: "Role / Title",
            type: "text",
            placeholder: "e.g. Production Manager",
        },
        { key: "department", label: "Department", type: "text", placeholder: "e.g. Operations" },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Additional context..." },
    ],
};

export const CREATE_WORKFORCE_CONFIG: CreateEntityConfig = {
    entityName: "Worker Profile",
    description: "Create a new worker profile.",
    fields: [
        {
            key: "first_name",
            label: "First Name",
            type: "text",
            placeholder: "e.g. John",
            required: true,
        },
        {
            key: "last_name",
            label: "Last Name",
            type: "text",
            placeholder: "e.g. Doe",
            required: true,
        },
        { key: "primary_role", label: "Role", type: "text", placeholder: "e.g. Stagehand" },
        {
            key: "email",
            label: "Email",
            type: "email",
            placeholder: "john@company.com",
            required: true,
        },
        { key: "phone", label: "Phone", type: "text", placeholder: "+1 (555) 000-0000" },
        {
            key: "lifecycle_status",
            label: "Status",
            type: "select",
            options: mapToOptions(WORKFORCE_STATUS_MAP),
            defaultValue: "active",
        },

        {
            key: "background_check_status",
            label: "Background Check Status",
            type: "text",
            placeholder: "Background Check Status",
        },
        {
            key: "do_not_engage",
            label: "Do Not Engage",
            type: "text",
            placeholder: "Do Not Engage",
        },
        {
            key: "do_not_engage_reason",
            label: "Do Not Engage Reason",
            type: "text",
            placeholder: "Do Not Engage Reason",
        },
        { key: "emergency_contact_email", label: "Emergency Contact Email", type: "email" },
        {
            key: "emergency_contact_name",
            label: "Emergency Contact Name",
            type: "text",
            placeholder: "Emergency Contact Name",
        },
        {
            key: "emergency_contact_phone",
            label: "Emergency Contact Phone",
            type: "text",
            placeholder: "+1 (555) 000-0000",
        },
        {
            key: "emergency_contact_relationship",
            label: "Emergency Contact Relationship",
            type: "text",
            placeholder: "Emergency Contact Relationship",
        },
        { key: "initial_engagement_date", label: "Initial Engagement Date", type: "date" },
        {
            key: "internal_notes",
            label: "Internal Notes",
            type: "textarea",
            placeholder: "Internal Notes...",
        },
        { key: "most_recent_engagement_date", label: "Most Recent Engagement Date", type: "date" },
        { key: "offboarding_date", label: "Offboarding Date", type: "date" },

        {
            key: "lifecycle_status_changed_at",
            label: "Lifecycle Status Changed At",
            type: "text",
            placeholder: "Lifecycle Status Changed At",
        },
        {
            key: "lifecycle_status_changed_by",
            label: "Lifecycle Status Changed By",
            type: "text",
            placeholder: "Lifecycle Status Changed By",
        },

        {
            key: "user_profile_id",
            label: "User Profile",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/user-profiles", labelField: "display_name" },
        },
    ],
};

// ─── Brand & Creative ───

export const CREATE_BRAND_GUIDELINE_CONFIG: CreateEntityConfig = {
    entityName: "Brand Guideline",
    description: "Create a new brand guideline document.",
    fields: [
        {
            key: "title",
            label: "Title",
            type: "text",
            placeholder: "e.g. Logo Usage Guidelines",
            required: true,
        },
        {
            key: "category",
            label: "Category",
            type: "select",
            options: mapToOptions(BRAND_GUIDELINE_CATEGORY_MAP),
            required: true,
        },
        { key: "version", label: "Version", type: "text", placeholder: "e.g. 1.0" },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Guideline details...",
            required: true,
        },

        { key: "brand_level", label: "Brand Level", type: "text", placeholder: "Brand Level" },
        {
            key: "current_version",
            label: "Current Version",
            type: "text",
            placeholder: "Current Version",
        },
        { key: "name", label: "Name", type: "text", placeholder: "Name" },
        {
            key: "parent_id",
            label: "Parent Task",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/tasks", labelField: "title" },
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },

        {
            key: "brand_kit_id",
            label: "Brand Kit",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/brand-kits", labelField: "name" },
        },
    ],
};

export const CREATE_BRAND_KIT_CONFIG: CreateEntityConfig = {
    entityName: "Brand Kit",
    description: "Create a new brand kit.",
    fields: [
        {
            key: "name",
            label: "Kit Name",
            type: "text",
            placeholder: "e.g. Summer 2026 Brand Kit",
            required: true,
        },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: mapToOptions(BRAND_GUIDELINE_STATUS_MAP),
            defaultValue: "draft",
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Kit contents and usage...",
        },

        { key: "accent_color", label: "Accent Color", type: "text", placeholder: "Accent Color" },
        {
            key: "brand_voice_guidelines",
            label: "Brand Voice Guidelines",
            type: "text",
            placeholder: "Brand Voice Guidelines",
        },
        {
            key: "client_company_id",
            label: "Client Company",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/companies", labelField: "name" },
        },
        {
            key: "client_id",
            label: "Client",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/companies", labelField: "name" },
        },
        { key: "client_name", label: "Client Name", type: "text", placeholder: "Client Name" },
        { key: "guidelines", label: "Guidelines", type: "text", placeholder: "Guidelines" },
        {
            key: "primary_color",
            label: "Primary Color",
            type: "text",
            placeholder: "Primary Color",
        },
        {
            key: "secondary_color",
            label: "Secondary Color",
            type: "text",
            placeholder: "Secondary Color",
        },
    ],
};

export const CREATE_DECK_CONFIG: CreateEntityConfig = {
    entityName: "Deck",
    description: "Create a new presentation deck.",
    fields: [
        {
            key: "title",
            label: "Deck Title",
            type: "text",
            placeholder: "e.g. Q3 Client Pitch Deck",
            required: true,
        },
        {
            key: "type",
            label: "Type",
            type: "select",
            options: mapToOptions(DECK_TYPE_MAP),
        },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: mapToOptions(DOCUMENT_TYPE_MAP),
            defaultValue: "draft",
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Deck purpose and contents...",
        },

        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
    ],
};

export const CREATE_TECH_SHEET_CONFIG: CreateEntityConfig = {
    entityName: "Tech Sheet",
    description: "Create a new technical specification sheet.",
    fields: [
        {
            key: "title",
            label: "Title",
            type: "text",
            placeholder: "e.g. Main Stage AV Specs",
            required: true,
        },
        {
            key: "category",
            label: "Category",
            type: "select",
            options: mapToOptions(ASSET_CATEGORY_MAP),
            required: true,
        },
        { key: "venue", label: "Venue / Location", type: "text", placeholder: "Venue name" },
        {
            key: "description",
            label: "Technical Details",
            type: "textarea",
            placeholder: "Specifications...",
            required: true,
        },

        {
            key: "activation_id",
            label: "Activation",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.activation_id,
        },
        {
            key: "audio_requirements",
            label: "Audio Requirements",
            type: "text",
            placeholder: "Audio Requirements",
        },
        {
            key: "bandwidth_requirements",
            label: "Bandwidth Requirements",
            type: "text",
            placeholder: "Bandwidth Requirements",
        },
        {
            key: "ceiling_height",
            label: "Ceiling Height",
            type: "text",
            placeholder: "Ceiling Height",
        },
        { key: "electrical_diagram_url", label: "Electrical Diagram Url", type: "url" },
        {
            key: "emergency_exits",
            label: "Emergency Exits",
            type: "text",
            placeholder: "Emergency Exits",
        },
        {
            key: "equipment_list",
            label: "Equipment List",
            type: "text",
            placeholder: "Equipment List",
        },
        {
            key: "event_id",
            label: "Event",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.event_id,
        },
        {
            key: "fire_safety_notes",
            label: "Fire Safety Notes",
            type: "text",
            placeholder: "Fire Safety Notes",
        },
        { key: "floor_plan_url", label: "Floor Plan Url", type: "url" },
        { key: "floor_type", label: "Floor Type", type: "text", placeholder: "Floor Type" },
        {
            key: "generator_required",
            label: "Generator Required",
            type: "text",
            placeholder: "Generator Required",
        },
        {
            key: "generator_specs",
            label: "Generator Specs",
            type: "text",
            placeholder: "Generator Specs",
        },
        {
            key: "internet_required",
            label: "Internet Required",
            type: "text",
            placeholder: "Internet Required",
        },
        {
            key: "lighting_requirements",
            label: "Lighting Requirements",
            type: "text",
            placeholder: "Lighting Requirements",
        },
        {
            key: "load_in_access",
            label: "Load In Access",
            type: "text",
            placeholder: "Load In Access",
        },
        {
            key: "location_id",
            label: "Location",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.location_id,
        },
        {
            key: "max_occupancy",
            label: "Max Occupancy",
            type: "text",
            placeholder: "Max Occupancy",
        },
        {
            key: "network_equipment",
            label: "Network Equipment",
            type: "text",
            placeholder: "Network Equipment",
        },
        {
            key: "power_requirements",
            label: "Power Requirements",
            type: "text",
            placeholder: "Power Requirements",
        },
        { key: "power_source", label: "Power Source", type: "text", placeholder: "Power Source" },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        {
            key: "rigging_notes",
            label: "Rigging Notes",
            type: "text",
            placeholder: "Rigging Notes",
        },
        { key: "rigging_plot_url", label: "Rigging Plot Url", type: "url" },
        {
            key: "rigging_points",
            label: "Rigging Points",
            type: "text",
            placeholder: "Rigging Points",
        },
        {
            key: "rigging_weight_limit",
            label: "Rigging Weight Limit",
            type: "text",
            placeholder: "Rigging Weight Limit",
        },
        {
            key: "safety_equipment",
            label: "Safety Equipment",
            type: "text",
            placeholder: "Safety Equipment",
        },
        {
            key: "special_requirements",
            label: "Special Requirements",
            type: "textarea",
            placeholder: "Special Requirements...",
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        {
            key: "tech_sheet_number",
            label: "Tech Sheet Number",
            type: "text",
            placeholder: "Tech Sheet Number",
        },
        {
            key: "total_amperage",
            label: "Total Amperage",
            type: "text",
            placeholder: "Total Amperage",
        },
        { key: "vendor_notes", label: "Vendor Notes", type: "text", placeholder: "Vendor Notes" },
        {
            key: "venue_dimensions",
            label: "Venue Dimensions",
            type: "text",
            placeholder: "Venue Dimensions",
        },
        { key: "venue_name", label: "Venue Name", type: "text", placeholder: "Venue Name" },
        { key: "version", label: "Version", type: "number", min: 0 },
        {
            key: "video_requirements",
            label: "Video Requirements",
            type: "text",
            placeholder: "Video Requirements",
        },

        { key: "reviewed_at", label: "Reviewed At", type: "text", placeholder: "Reviewed At" },
        { key: "reviewed_by", label: "Reviewed By", type: "text", placeholder: "Reviewed By" },
    ],
};

// ─── Compliance & Legal ───

export const CREATE_CERTIFICATION_CONFIG: CreateEntityConfig = {
    entityName: "Certification",
    description: "Record a new certification.",
    fields: [
        {
            key: "name",
            label: "Certification Name",
            type: "text",
            placeholder: "e.g. OSHA 30-Hour",
            required: true,
        },
        {
            key: "issuing_body",
            label: "Issuing Body",
            type: "text",
            placeholder: "e.g. OSHA",
            required: true,
        },
        { key: "issue_date", label: "Issue Date", type: "date", required: true },
        { key: "expiry_date", label: "Expiry Date", type: "date" },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: mapToOptions(CERTIFICATION_TYPE_MAP),
            defaultValue: "active",
        },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Additional details..." },

        {
            key: "crew_member_id",
            label: "Crew Member",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.crew_member_id,
        },
        { key: "document_url", label: "Document Url", type: "url" },
        { key: "issued_date", label: "Issued Date", type: "date" },
        {
            key: "issuing_authority",
            label: "Issuing Authority",
            type: "text",
            placeholder: "Issuing Authority",
        },
        { key: "type", label: "Type", type: "text", placeholder: "Type" },
    ],
};

export const CREATE_COMPLIANCE_CHECKLIST_CONFIG: CreateEntityConfig = {
    entityName: "Compliance Checklist",
    description: "Create a new compliance checklist.",
    fields: [
        {
            key: "title",
            label: "Checklist Title",
            type: "text",
            placeholder: "e.g. Pre-Event Safety Audit",
            required: true,
        },
        {
            key: "type",
            label: "Type",
            type: "select",
            options: mapToOptions(CHECKLIST_TYPE_MAP),
            required: true,
        },
        { key: "due_date", label: "Due Date", type: "date" },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Checklist scope and requirements...",
        },

        {
            key: "checklist_type",
            label: "Checklist Type",
            type: "text",
            placeholder: "Checklist Type",
        },
        {
            key: "completed_items",
            label: "Completed Items",
            type: "text",
            placeholder: "Completed Items",
        },
        { key: "completion_percent", label: "Completion Percent", type: "number", min: 0 },
        { key: "findings", label: "Findings", type: "text", placeholder: "Findings" },
        { key: "next_due", label: "Next Due", type: "text", placeholder: "Next Due" },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Notes..." },
        {
            key: "recurrence_days",
            label: "Recurrence Days",
            type: "text",
            placeholder: "Recurrence Days",
        },
        {
            key: "remediation_deadline",
            label: "Remediation Deadline",
            type: "text",
            placeholder: "Remediation Deadline",
        },
        {
            key: "remediation_required",
            label: "Remediation Required",
            type: "text",
            placeholder: "Remediation Required",
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        { key: "total_items", label: "Total Items", type: "text", placeholder: "Total Items" },

        { key: "inspected_at", label: "Inspected At", type: "text", placeholder: "Inspected At" },

        {
            key: "inspector_id",
            label: "Inspector",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/user-profiles", labelField: "display_name" },
        },
    ],
};

export const CREATE_INSURANCE_POLICY_CONFIG: CreateEntityConfig = {
    entityName: "Insurance Policy",
    description: "Record a new insurance policy.",
    fields: [
        {
            key: "policy_number",
            label: "Policy Number",
            type: "text",
            placeholder: "e.g. POL-2026-001",
            required: true,
        },
        {
            key: "provider",
            label: "Provider",
            type: "text",
            placeholder: "Insurance company name",
            required: true,
        },
        {
            key: "type",
            label: "Type",
            type: "select",
            options: mapToOptions(DOCUMENT_CATEGORY_MAP),
            required: true,
        },
        { key: "coverage_amount", label: "Coverage Amount", type: "currency", required: true },
        { key: "start_date", label: "Effective Date", type: "date", required: true },
        { key: "end_date", label: "Expiration Date", type: "date", required: true },
        { key: "premium", label: "Premium", type: "currency" },

        {
            key: "additional_insured",
            label: "Additional Insured",
            type: "text",
            placeholder: "Additional Insured",
        },
        {
            key: "additional_insured_required",
            label: "Additional Insured Required",
            type: "text",
            placeholder: "Additional Insured Required",
        },
        { key: "carrier", label: "Carrier", type: "text", placeholder: "Carrier" },
        { key: "certificate_url", label: "Certificate Url", type: "url" },
        {
            key: "currency",
            label: "Currency",
            type: "select",
            options: [
                { value: "USD", label: "USD" },
                { value: "EUR", label: "EUR" },
                { value: "GBP", label: "GBP" },
                { value: "CAD", label: "CAD" },
            ],
            defaultValue: "USD",
        },
        { key: "deductible", label: "Deductible", type: "currency" },
        { key: "document_url", label: "Document Url", type: "url" },
        { key: "effective_date", label: "Effective Date", type: "date" },
        { key: "expiry_date", label: "Expiry Date", type: "date" },
        {
            key: "holder_id",
            label: "Holder",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/vendors", labelField: "name" },
        },
        { key: "holder_type", label: "Holder Type", type: "text", placeholder: "Holder Type" },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Notes..." },
        { key: "policy_type", label: "Policy Type", type: "text", placeholder: "Policy Type" },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        {
            key: "verification_notes",
            label: "Verification Notes",
            type: "text",
            placeholder: "Verification Notes",
        },
        {
            key: "waiver_of_subrogation",
            label: "Waiver Of Subrogation",
            type: "text",
            placeholder: "Waiver Of Subrogation",
        },

        {
            key: "requirement_id",
            label: "Requirement",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/compliance-requirements", labelField: "title" },
        },
    ],
};

export const CREATE_PERMIT_CONFIG: CreateEntityConfig = {
    entityName: "Permit",
    description: "Record a new permit or license.",
    fields: [
        {
            key: "name",
            label: "Permit Name",
            type: "text",
            placeholder: "e.g. Temporary Event Permit",
            required: true,
        },
        {
            key: "type",
            label: "Type",
            type: "select",
            options: mapToOptions(DOCUMENT_CATEGORY_MAP),
            required: true,
        },
        {
            key: "issuing_authority",
            label: "Issuing Authority",
            type: "text",
            placeholder: "City or agency name",
        },
        { key: "issue_date", label: "Issue Date", type: "date" },
        { key: "expiry_date", label: "Expiry Date", type: "date" },
        {
            key: "notes",
            label: "Notes",
            type: "textarea",
            placeholder: "Permit conditions or notes...",
        },

        {
            key: "application_fee",
            label: "Application Fee",
            type: "text",
            placeholder: "Application Fee",
        },
        { key: "application_url", label: "Application Url", type: "url" },
        { key: "applied_date", label: "Applied Date", type: "date" },
        { key: "approved_date", label: "Approved Date", type: "date" },
        {
            key: "blocks_entity",
            label: "Blocks Entity",
            type: "text",
            placeholder: "Blocks Entity",
        },
        {
            key: "conditions_met",
            label: "Conditions Met",
            type: "text",
            placeholder: "Conditions Met",
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Description...",
        },
        { key: "document_url", label: "Document Url", type: "url" },
        { key: "effective_date", label: "Effective Date", type: "date" },
        { key: "inspection_date", label: "Inspection Date", type: "date" },
        {
            key: "inspection_passed",
            label: "Inspection Passed",
            type: "text",
            placeholder: "Inspection Passed",
        },
        {
            key: "inspector_name",
            label: "Inspector Name",
            type: "text",
            placeholder: "Inspector Name",
        },
        { key: "jurisdiction", label: "Jurisdiction", type: "text", placeholder: "Jurisdiction" },
        {
            key: "jurisdiction_contact_phone",
            label: "Jurisdiction Contact Phone",
            type: "text",
            placeholder: "+1 (555) 000-0000",
        },
        {
            key: "jurisdiction_level",
            label: "Jurisdiction Level",
            type: "text",
            placeholder: "Jurisdiction Level",
        },
        { key: "permit_fee", label: "Permit Fee", type: "text", placeholder: "Permit Fee" },
        {
            key: "permit_number",
            label: "Permit Number",
            type: "text",
            placeholder: "Permit Number",
        },
        { key: "permit_type", label: "Permit Type", type: "text", placeholder: "Permit Type" },
        { key: "renewal_date", label: "Renewal Date", type: "date" },
        {
            key: "requires_inspection",
            label: "Requires Inspection",
            type: "select",
            options: YES_NO_OPTIONS,
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        { key: "submitted_date", label: "Submitted Date", type: "date" },
        { key: "title", label: "Title", type: "text", placeholder: "Title" },
    ],
};

export const CREATE_LOCATION_CONFIG: CreateEntityConfig = {
    entityName: "Location",
    description: "Add a new production location or venue.",
    fields: [
        {
            key: "name",
            label: "Location Name",
            type: "text",
            placeholder: "e.g. Main Stage Area",
            required: true,
        },
        {
            key: "type",
            label: "Type",
            type: "select",
            options: mapToOptions(WAREHOUSE_TYPE_MAP),
            required: true,
        },
        { key: "capacity", label: "Capacity", type: "number", placeholder: "0", min: 0 },
        {
            key: "address",
            label: "Address",
            type: "textarea",
            placeholder: "Street, City, State, ZIP",
        },
        {
            key: "notes",
            label: "Notes",
            type: "textarea",
            placeholder: "Access details, parking, load-in info...",
        },

        { key: "access_end_date", label: "Access End Date", type: "date" },
        { key: "access_start_date", label: "Access Start Date", type: "date" },
        {
            key: "ada_compliant",
            label: "Ada Compliant",
            type: "text",
            placeholder: "Ada Compliant",
        },
        { key: "ada_notes", label: "Ada Notes", type: "text", placeholder: "Ada Notes" },
        { key: "address_city", label: "Address City", type: "text", placeholder: "Address City" },
        {
            key: "address_country",
            label: "Address Country",
            type: "text",
            placeholder: "Address Country",
        },
        {
            key: "address_postal_code",
            label: "Address Postal Code",
            type: "text",
            placeholder: "Address Postal Code",
        },
        {
            key: "address_state",
            label: "Address State",
            type: "text",
            placeholder: "Address State",
        },
        {
            key: "address_street1",
            label: "Address Street1",
            type: "text",
            placeholder: "Address Street1",
        },
        {
            key: "address_street2",
            label: "Address Street2",
            type: "text",
            placeholder: "Address Street2",
        },
        {
            key: "alcohol_license",
            label: "Alcohol License",
            type: "text",
            placeholder: "Alcohol License",
        },
        { key: "amenities", label: "Amenities", type: "text", placeholder: "Amenities" },
        {
            key: "capacity_fire_code",
            label: "Capacity Fire Code",
            type: "text",
            placeholder: "Capacity Fire Code",
        },
        {
            key: "capacity_seated",
            label: "Capacity Seated",
            type: "text",
            placeholder: "Capacity Seated",
        },
        {
            key: "capacity_standing",
            label: "Capacity Standing",
            type: "text",
            placeholder: "Capacity Standing",
        },
        {
            key: "climate_controlled",
            label: "Climate Controlled",
            type: "text",
            placeholder: "Climate Controlled",
        },
        { key: "code", label: "Code", type: "text", placeholder: "Code" },
        { key: "contact_email", label: "Contact Email", type: "email" },
        { key: "contact_name", label: "Contact Name", type: "text", placeholder: "Contact Name" },
        {
            key: "contact_phone",
            label: "Contact Phone",
            type: "text",
            placeholder: "+1 (555) 000-0000",
        },
        { key: "daily_rate", label: "Daily Rate", type: "currency" },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Description...",
        },
        { key: "dock_info", label: "Dock Info", type: "text", placeholder: "Dock Info" },
        { key: "floor_number", label: "Floor Number", type: "text", placeholder: "Floor Number" },
        {
            key: "floorplan_asset_id",
            label: "Floorplan",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/digital-assets", labelField: "title" },
        },
        {
            key: "hierarchy_depth",
            label: "Hierarchy Depth",
            type: "text",
            placeholder: "Hierarchy Depth",
        },
        {
            key: "hierarchy_path",
            label: "Hierarchy Path",
            type: "text",
            placeholder: "Hierarchy Path",
        },
        {
            key: "insurance_required",
            label: "Insurance Required",
            type: "text",
            placeholder: "Insurance Required",
        },
        {
            key: "internet_available",
            label: "Internet Available",
            type: "text",
            placeholder: "Internet Available",
        },
        {
            key: "is_ada_accessible",
            label: "Is Ada Accessible",
            type: "select",
            options: YES_NO_OPTIONS,
        },
        {
            key: "load_in_windows",
            label: "Load In Windows",
            type: "text",
            placeholder: "Load In Windows",
        },
        {
            key: "load_out_windows",
            label: "Load Out Windows",
            type: "text",
            placeholder: "Load Out Windows",
        },
        {
            key: "manager_id",
            label: "Manager",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.manager_id,
        },
        {
            key: "noise_curfew_time",
            label: "Noise Curfew Time",
            type: "text",
            placeholder: "Noise Curfew Time",
        },
        { key: "noise_max_db", label: "Noise Max Db", type: "text", placeholder: "Noise Max Db" },
        { key: "outdoor", label: "Outdoor", type: "text", placeholder: "Outdoor" },
        { key: "ownership", label: "Ownership", type: "text", placeholder: "Ownership" },
        {
            key: "parent_location_id",
            label: "Parent Location",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/locations", labelField: "name" },
        },
        { key: "parking_info", label: "Parking Info", type: "text", placeholder: "Parking Info" },
        {
            key: "permits_required",
            label: "Permits Required",
            type: "text",
            placeholder: "Permits Required",
        },
        {
            key: "power_available",
            label: "Power Available",
            type: "text",
            placeholder: "Power Available",
        },
        {
            key: "primary_contact_id",
            label: "Primary Contact",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/contacts", labelField: "first_name" },
        },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "purpose", label: "Purpose", type: "textarea", placeholder: "Purpose..." },
        {
            key: "regulatory_jurisdiction",
            label: "Regulatory Jurisdiction",
            type: "text",
            placeholder: "Regulatory Jurisdiction",
        },
        { key: "restrictions", label: "Restrictions", type: "text", placeholder: "Restrictions" },
        {
            key: "security_level",
            label: "Security Level",
            type: "text",
            placeholder: "Security Level",
        },
        {
            key: "square_footage",
            label: "Square Footage",
            type: "text",
            placeholder: "Square Footage",
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        { key: "timezone", label: "Timezone", type: "text", placeholder: "Timezone" },
        {
            key: "zoning_classification",
            label: "Zoning Classification",
            type: "text",
            placeholder: "Zoning Classification",
        },

        {
            key: "venue_rep_id",
            label: "Venue Rep",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/contacts", labelField: "first_name" },
        },
    ],
};

// ─── Finance (additional) ───

export const CREATE_CLIENT_INVOICE_CONFIG: CreateEntityConfig = {
    entityName: "Client Invoice",
    description: "Create a new client invoice.",
    fields: [
        {
            key: "invoice_number",
            label: "Invoice Number",
            type: "text",
            placeholder: "e.g. CINV-001",
            required: true,
        },
        { key: "subtotal", label: "Subtotal", type: "currency", required: true },
        { key: "total", label: "Total", type: "currency", required: true },
        { key: "invoice_date", label: "Invoice Date", type: "date", required: true },
        { key: "due_date", label: "Due Date", type: "date", required: true },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: mapToOptions(INVOICE_STATUS_MAP),
            defaultValue: "draft",
        },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Invoice notes..." },

        { key: "amount_paid", label: "Amount Paid", type: "text", placeholder: "Amount Paid" },
        { key: "balance_due", label: "Balance Due", type: "text", placeholder: "Balance Due" },
        {
            key: "billing_period_end",
            label: "Billing Period End",
            type: "text",
            placeholder: "Billing Period End",
        },
        {
            key: "billing_period_start",
            label: "Billing Period Start",
            type: "text",
            placeholder: "Billing Period Start",
        },
        {
            key: "company_id",
            label: "Company",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.company_id,
        },
        {
            key: "contact_id",
            label: "Contact",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.contact_id,
        },
        {
            key: "currency",
            label: "Currency",
            type: "select",
            options: [
                { value: "USD", label: "USD" },
                { value: "EUR", label: "EUR" },
                { value: "GBP", label: "GBP" },
                { value: "CAD", label: "CAD" },
            ],
            defaultValue: "USD",
        },
        { key: "discount_amount", label: "Discount Amount", type: "currency" },
        { key: "discount_percent", label: "Discount Percent", type: "number", min: 0 },
        {
            key: "payment_instructions",
            label: "Payment Instructions",
            type: "text",
            placeholder: "Payment Instructions",
        },
        { key: "payment_terms_days", label: "Payment Terms Days", type: "number", min: 0 },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "reference", label: "Reference", type: "text", placeholder: "Reference" },
        { key: "reminder_count", label: "Reminder Count", type: "number", min: 0 },
        { key: "retention_percent", label: "Retention Percent", type: "number", min: 0 },
        {
            key: "sow_id",
            label: "Sow",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.sow_id,
        },
        { key: "tax_amount", label: "Tax Amount", type: "currency" },
        { key: "tax_percent", label: "Tax Percent", type: "number", min: 0 },
        {
            key: "template_id",
            label: "Template",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/templates", labelField: "name" },
        },
        { key: "title", label: "Title", type: "text", placeholder: "Title" },

        {
            key: "asc_606_recognized_at",
            label: "Asc 606 Recognized At",
            type: "text",
            placeholder: "Asc 606 Recognized At",
        },
        {
            key: "last_reminder_at",
            label: "Last Reminder At",
            type: "text",
            placeholder: "Last Reminder At",
        },
        { key: "paid_at", label: "Paid At", type: "text", placeholder: "Paid At" },
        { key: "sent_at", label: "Sent At", type: "text", placeholder: "Sent At" },
        { key: "viewed_at", label: "Viewed At", type: "text", placeholder: "Viewed At" },
    ],
};

export const CREATE_RECURRING_INVOICE_CONFIG: CreateEntityConfig = {
    entityName: "Recurring Invoice",
    description: "Set up a new recurring invoice.",
    fields: [
        {
            key: "description",
            label: "Description",
            type: "text",
            placeholder: "e.g. Monthly Retainer — Acme",
        },
        {
            key: "company_id",
            label: "Company",
            type: "text",
            placeholder: "Company ID",
            required: true,
        },
        { key: "amount", label: "Amount", type: "currency", required: true },
        {
            key: "frequency",
            label: "Frequency",
            type: "select",
            options: mapToOptions(BUDGET_LINE_CATEGORY_MAP),
            defaultValue: "monthly",
            required: true,
        },
        { key: "start_date", label: "Start Date", type: "date", required: true },
        { key: "end_date", label: "End Date", type: "date" },

        {
            key: "currency",
            label: "Currency",
            type: "select",
            options: [
                { value: "USD", label: "USD" },
                { value: "EUR", label: "EUR" },
                { value: "GBP", label: "GBP" },
                { value: "CAD", label: "CAD" },
            ],
            defaultValue: "USD",
        },
        { key: "day_of_month", label: "Day Of Month", type: "text", placeholder: "Day Of Month" },
        { key: "day_of_week", label: "Day Of Week", type: "text", placeholder: "Day Of Week" },
        {
            key: "invoices_generated",
            label: "Invoices Generated",
            type: "text",
            placeholder: "Invoices Generated",
        },
        { key: "last_invoice_date", label: "Last Invoice Date", type: "date" },
        { key: "next_invoice_date", label: "Next Invoice Date", type: "date" },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        {
            key: "template_id",
            label: "Template",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/templates", labelField: "name" },
        },
    ],
};

// ─── Operations (additional) ───

export const CREATE_DISPATCH_CONFIG: CreateEntityConfig = {
    entityName: "Dispatch Entry",
    description: "Create a new dispatch record.",
    fields: [
        {
            key: "reference",
            label: "Reference",
            type: "text",
            placeholder: "e.g. DSP-2026-001",
            required: true,
        },
        {
            key: "origin",
            label: "Origin",
            type: "text",
            placeholder: "Pickup location",
            required: true,
        },
        {
            key: "destination",
            label: "Destination",
            type: "text",
            placeholder: "Delivery location",
            required: true,
        },
        { key: "dispatch_date", label: "Dispatch Date", type: "datetime-local", required: true },
        {
            key: "priority",
            label: "Priority",
            type: "select",
            options: mapToOptions(WORK_ORDER_PRIORITY_MAP),
            defaultValue: "medium",
        },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Dispatch details..." },

        {
            key: "crew_member_id",
            label: "Crew Member",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.crew_member_id,
        },
        {
            key: "declined_reason",
            label: "Declined Reason",
            type: "text",
            placeholder: "Declined Reason",
        },
        {
            key: "dispatch_notes",
            label: "Dispatch Notes",
            type: "text",
            placeholder: "Dispatch Notes",
        },
        { key: "role", label: "Role", type: "text", placeholder: "Role" },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        {
            key: "vendor_id",
            label: "Vendor",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.vendor_id,
        },
        {
            key: "work_order_id",
            label: "Work Order",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.work_order_id,
        },

        { key: "arrived_at", label: "Arrived At", type: "text", placeholder: "Arrived At" },
    ],
};

export const CREATE_VENDOR_REVIEW_CONFIG: CreateEntityConfig = {
    entityName: "Vendor Review",
    description: "Submit a new vendor performance review.",
    fields: [
        {
            key: "vendor_name",
            label: "Vendor",
            type: "text",
            placeholder: "Vendor name",
            required: true,
        },
        {
            key: "overall_score",
            label: "Overall Score (1–5)",
            type: "number",
            min: 1,
            max: 5,
            step: 1,
            required: true,
        },
        { key: "review_date", label: "Review Date", type: "date", required: true },
        {
            key: "category",
            label: "Category",
            type: "select",
            options: mapToOptions(VENDOR_CATEGORY_MAP),
            defaultValue: "overall",
        },
        {
            key: "comments",
            label: "Comments",
            type: "textarea",
            placeholder: "Performance notes...",
            required: true,
        },

        {
            key: "communication_rating",
            label: "Communication Rating",
            type: "number",
            min: 1,
            max: 5,
        },
        { key: "improvements", label: "Improvements", type: "text", placeholder: "Improvements" },
        { key: "overall_rating", label: "Overall Rating", type: "number", min: 1, max: 5 },
        {
            key: "professionalism_rating",
            label: "Professionalism Rating",
            type: "number",
            min: 1,
            max: 5,
        },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "quality_rating", label: "Quality Rating", type: "number", min: 1, max: 5 },
        { key: "review_type", label: "Review Type", type: "text", placeholder: "Review Type" },
        {
            key: "reviewer_id",
            label: "Reviewer",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.reviewer_id,
        },
        { key: "safety_rating", label: "Safety Rating", type: "number", min: 1, max: 5 },
        { key: "strengths", label: "Strengths", type: "textarea", placeholder: "Strengths..." },
        { key: "timeliness_rating", label: "Timeliness Rating", type: "number", min: 1, max: 5 },
        { key: "value_rating", label: "Value Rating", type: "number", min: 1, max: 5 },
        {
            key: "vendor_id",
            label: "Vendor",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.vendor_id,
        },
        {
            key: "work_order_id",
            label: "Work Order",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.work_order_id,
        },
        { key: "would_rehire", label: "Would Rehire", type: "select", options: YES_NO_OPTIONS },
    ],
};

// ─── Automations ───

export const CREATE_AUTOMATION_CONFIG: CreateEntityConfig = {
    entityName: "Automation",
    description: "Create a new trigger-action automation.",
    fields: [
        {
            key: "name",
            label: "Automation Name",
            type: "text",
            placeholder: "e.g. Auto-assign on task creation",
            required: true,
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "What does this automation do?",
        },
        {
            key: "entity_type",
            label: "Entity Type",
            type: "select",
            options: mapToOptions(ENGINEERING_ENTITY_TYPE_MAP),
            required: true,
        },

        { key: "error_count", label: "Error Count", type: "number", min: 0 },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        {
            key: "schedule_cron",
            label: "Schedule Cron",
            type: "text",
            placeholder: "Schedule Cron",
        },
        {
            key: "schedule_timezone",
            label: "Schedule Timezone",
            type: "text",
            placeholder: "Schedule Timezone",
        },
        { key: "trigger_count", label: "Trigger Count", type: "number", min: 0 },
        { key: "version", label: "Version", type: "number", min: 0 },

        {
            key: "last_triggered_at",
            label: "Last Triggered At",
            type: "text",
            placeholder: "Last Triggered At",
        },
        {
            key: "next_scheduled_at",
            label: "Next Scheduled At",
            type: "text",
            placeholder: "Next Scheduled At",
        },
    ],
};

// ─── Call Sheets ───

export const CREATE_CALL_SHEET_CONFIG: CreateEntityConfig = {
    entityName: "Call Sheet",
    description: "Create a new daily call sheet for a production.",
    fields: [
        {
            key: "title",
            label: "Title",
            type: "text",
            placeholder: "e.g. Day 1 — Main Stage Load-In",
            required: true,
        },
        { key: "date", label: "Date", type: "date", required: true },
        {
            key: "venue_name",
            label: "Venue Name",
            type: "text",
            placeholder: "Venue or location name",
        },
        { key: "venue_address", label: "Venue Address", type: "text", placeholder: "Full address" },
        {
            key: "special_instructions",
            label: "Special Instructions",
            type: "textarea",
            placeholder: "Parking, load-in notes, etc.",
        },

        { key: "breakfast_time", label: "Breakfast Time", type: "text" },
        {
            key: "call_sheet_number",
            label: "Call Sheet Number",
            type: "text",
            placeholder: "Call Sheet Number",
        },
        {
            key: "craft_services_notes",
            label: "Craft Services Notes",
            type: "textarea",
            placeholder: "Craft Services Notes...",
        },
        {
            key: "emergency_contact_name",
            label: "Emergency Contact Name",
            type: "text",
            placeholder: "Emergency Contact Name",
        },
        {
            key: "emergency_contact_phone",
            label: "Emergency Contact Phone",
            type: "text",
            placeholder: "+1 (555) 000-0000",
        },
        {
            key: "event_id",
            label: "Event",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.event_id,
        },
        { key: "first_shot_time", label: "First Shot Time", type: "text" },
        { key: "general_call_time", label: "General Call Time", type: "text" },
        {
            key: "load_in_instructions",
            label: "Load In Instructions",
            type: "textarea",
            placeholder: "Load In Instructions...",
        },
        {
            key: "location_id",
            label: "Location",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.location_id,
        },
        { key: "lunch_time", label: "Lunch Time", type: "text" },
        {
            key: "nearest_hospital",
            label: "Nearest Hospital",
            type: "text",
            placeholder: "Nearest Hospital",
        },
        {
            key: "nearest_hospital_address",
            label: "Nearest Hospital Address",
            type: "text",
            placeholder: "Nearest Hospital Address",
        },
        {
            key: "parking_instructions",
            label: "Parking Instructions",
            type: "textarea",
            placeholder: "Parking Instructions...",
        },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        {
            key: "weather_forecast",
            label: "Weather Forecast",
            type: "textarea",
            placeholder: "Weather Forecast...",
        },
        {
            key: "weather_temp_high",
            label: "Weather Temp High",
            type: "text",
            placeholder: "Weather Temp High",
        },
        {
            key: "weather_temp_low",
            label: "Weather Temp Low",
            type: "text",
            placeholder: "Weather Temp Low",
        },
        { key: "wrap_time", label: "Wrap Time", type: "text" },
    ],
};

// ─── Case Studies ───

export const CREATE_CASE_STUDY_CONFIG: CreateEntityConfig = {
    entityName: "Case Study",
    description: "Draft a new case study for a completed project.",
    fields: [
        {
            key: "title",
            label: "Title",
            type: "text",
            placeholder: "e.g. Nike Air Max Global Launch",
            required: true,
        },
        {
            key: "client",
            label: "Client",
            type: "text",
            placeholder: "Client name",
            required: true,
        },
        {
            key: "summary",
            label: "Summary",
            type: "textarea",
            placeholder: "Brief overview of the project and outcomes",
            required: true,
        },

        { key: "featured", label: "Featured", type: "text", placeholder: "Featured" },
        {
            key: "gallery_images",
            label: "Gallery Images",
            type: "text",
            placeholder: "Gallery Images",
        },
        { key: "hero_image", label: "Hero Image", type: "text", placeholder: "Hero Image" },
        { key: "hero_image_url", label: "Hero Image Url", type: "url" },
        {
            key: "industry_tags",
            label: "Industry Tags",
            type: "text",
            placeholder: "Industry Tags",
        },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        {
            key: "public_visible",
            label: "Public Visible",
            type: "text",
            placeholder: "Public Visible",
        },
        {
            key: "seo_description",
            label: "Seo Description",
            type: "text",
            placeholder: "Seo Description",
        },
        { key: "seo_title", label: "Seo Title", type: "text", placeholder: "Seo Title" },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        { key: "video_url", label: "Video Url", type: "url" },
    ],
};

// ─── Checklists ───

export const CREATE_CHECKLIST_CONFIG: CreateEntityConfig = {
    entityName: "Checklist",
    description: "Create a new checklist template.",
    fields: [
        {
            key: "title",
            label: "Title",
            type: "text",
            placeholder: "e.g. Pre-Event Safety Checklist",
            required: true,
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Purpose and scope of this checklist",
        },
        {
            key: "type",
            label: "Type",
            type: "select",
            options: mapToOptions(CHECKLIST_TYPE_MAP),
            defaultValue: "custom",
        },
    ],
};

// ─── Clause Library ───

export const CREATE_CLAUSE_CONFIG: CreateEntityConfig = {
    entityName: "Contract Clause",
    description: "Add a reusable clause to the library.",
    fields: [
        {
            key: "description",
            label: "Clause Text",
            type: "textarea",
            placeholder: "Full clause language...",
            required: true,
        },
        {
            key: "clause_reference",
            label: "Reference Code",
            type: "text",
            placeholder: "e.g. IP-001",
        },
        {
            key: "party",
            label: "Obligated Party",
            type: "select",
            options: mapToOptions(CLAUSE_PARTY_MAP),
            required: true,
        },

        { key: "body", label: "Body", type: "textarea", placeholder: "Body..." },
        {
            key: "clause_number",
            label: "Clause Number",
            type: "text",
            placeholder: "Clause Number",
        },
        { key: "clause_type", label: "Clause Type", type: "text", placeholder: "Clause Type" },
        {
            key: "contract_id",
            label: "Contract",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.contract_id,
        },
        { key: "is_standard", label: "Is Standard", type: "select", options: YES_NO_OPTIONS },
        { key: "negotiable", label: "Negotiable", type: "text", placeholder: "Negotiable" },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Notes..." },
        { key: "risk_level", label: "Risk Level", type: "text", placeholder: "Risk Level" },
        { key: "title", label: "Title", type: "text", placeholder: "Title" },
    ],
};

// ─── Credentials ───

export const CREATE_CREDENTIAL_CONFIG: CreateEntityConfig = {
    entityName: "Credential Type",
    description: "Define a new credential type for event access.",
    fields: [
        {
            key: "name",
            label: "Credential Name",
            type: "text",
            placeholder: "e.g. All-Access Pass",
            required: true,
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Access level and restrictions",
        },

        { key: "category", label: "Category", type: "text", placeholder: "Category" },
        { key: "color_hex", label: "Color Hex", type: "text", placeholder: "Color Hex" },
        {
            key: "default_zone_access",
            label: "Default Zone Access",
            type: "text",
            placeholder: "Default Zone Access",
        },
        { key: "format", label: "Format", type: "text", placeholder: "Format" },
        { key: "tier_level", label: "Tier Level", type: "text", placeholder: "Tier Level" },
    ],
};

// ─── Credit Notes ───

export const CREATE_CREDIT_NOTE_CONFIG: CreateEntityConfig = {
    entityName: "Credit Note",
    description: "Issue a new credit note against an invoice.",
    fields: [
        {
            key: "number",
            label: "Credit Note Number",
            type: "text",
            placeholder: "e.g. CN-001",
            required: true,
        },
        { key: "amount", label: "Amount", type: "number", min: 0, step: 0.01, required: true },
        {
            key: "reason",
            label: "Reason",
            type: "textarea",
            placeholder: "Reason for the credit note",
            required: true,
        },

        {
            key: "currency",
            label: "Currency",
            type: "select",
            options: [
                { value: "USD", label: "USD" },
                { value: "EUR", label: "EUR" },
                { value: "GBP", label: "GBP" },
                { value: "CAD", label: "CAD" },
            ],
            defaultValue: "USD",
        },
        {
            key: "invoice_id",
            label: "Invoice",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/invoices", labelField: "number" },
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },

        { key: "applied_at", label: "Applied At", type: "text", placeholder: "Applied At" },
    ],
};

// ─── Dashboards ───

export const CREATE_DASHBOARD_CONFIG: CreateEntityConfig = {
    entityName: "Dashboard",
    description: "Create a new custom dashboard.",
    fields: [
        {
            key: "name",
            label: "Dashboard Name",
            type: "text",
            placeholder: "e.g. Executive Overview",
            required: true,
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "What data should this dashboard display?",
        },

        { key: "is_shared", label: "Is Shared", type: "select", options: YES_NO_OPTIONS },
        { key: "layout", label: "Layout", type: "text", placeholder: "Layout" },
        {
            key: "owner_id",
            label: "Owner",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.owner_id,
        },
        {
            key: "shared_with_role",
            label: "Shared With Role",
            type: "text",
            placeholder: "Shared With Role",
        },
    ],
};

// ─── Documents ───

export const CREATE_DOCUMENT_CONFIG: CreateEntityConfig = {
    entityName: "Document",
    description: "Create a new document.",
    fields: [
        {
            key: "title",
            label: "Title",
            type: "text",
            placeholder: "e.g. Production Brief — Q4 Campaign",
            required: true,
        },
        {
            key: "document_type",
            label: "Document Type",
            type: "select",
            options: mapToOptions(DOCUMENT_TYPE_MAP),
            defaultValue: "doc",
        },

        { key: "can_comment", label: "Can Comment", type: "text", placeholder: "Can Comment" },
        { key: "can_edit", label: "Can Edit", type: "text", placeholder: "Can Edit" },
        { key: "content", label: "Content", type: "textarea", placeholder: "Content..." },
        { key: "cover_image_url", label: "Cover Image Url", type: "url" },
        { key: "icon", label: "Icon", type: "text", placeholder: "Icon" },
        { key: "is_public", label: "Is Public", type: "select", options: YES_NO_OPTIONS },
        {
            key: "owner_id",
            label: "Owner",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.owner_id,
        },
        {
            key: "parent_id",
            label: "Parent Task",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/tasks", labelField: "title" },
        },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        {
            key: "shared_with_team_ids",
            label: "Shared With Team Ids",
            type: "text",
            placeholder: "Shared With Team Ids",
        },
        {
            key: "shared_with_user_ids",
            label: "Shared With User Ids",
            type: "text",
            placeholder: "Shared With User Ids",
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        {
            key: "template_id",
            label: "Template",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/templates", labelField: "name" },
        },

        {
            key: "last_edited_by",
            label: "Last Edited By",
            type: "text",
            placeholder: "Last Edited By",
        },
    ],
};

// ─── Engineering Approvals ───

export const CREATE_ENGINEERING_APPROVAL_CONFIG: CreateEntityConfig = {
    entityName: "Engineering Approval",
    description: "Request a new engineering approval.",
    fields: [
        {
            key: "engineer_name",
            label: "Engineer Name",
            type: "text",
            placeholder: "Licensed engineer",
            required: true,
        },
        {
            key: "engineering_firm",
            label: "Engineering Firm",
            type: "text",
            placeholder: "Firm name",
        },
        {
            key: "entity_type",
            label: "Entity Type",
            type: "select",
            options: mapToOptions(ENGINEERING_ENTITY_TYPE_MAP),
            required: true,
        },
        {
            key: "conditions",
            label: "Conditions / Notes",
            type: "textarea",
            placeholder: "Any special conditions...",
        },

        { key: "approval_document_url", label: "Approval Document Url", type: "url" },
        {
            key: "approval_type",
            label: "Approval Type",
            type: "text",
            placeholder: "Approval Type",
        },
        { key: "calculations_url", label: "Calculations Url", type: "url" },
        {
            key: "conditions_met",
            label: "Conditions Met",
            type: "text",
            placeholder: "Conditions Met",
        },
        { key: "drawings_url", label: "Drawings Url", type: "url" },
        {
            key: "engineer_license_number",
            label: "Engineer License Number",
            type: "text",
            placeholder: "Engineer License Number",
        },
        {
            key: "inspection_schedule",
            label: "Inspection Schedule",
            type: "text",
            placeholder: "Inspection Schedule",
        },
        { key: "last_inspection_date", label: "Last Inspection Date", type: "date" },
        {
            key: "last_inspection_result",
            label: "Last Inspection Result",
            type: "text",
            placeholder: "Last Inspection Result",
        },
        { key: "load_chart_url", label: "Load Chart Url", type: "url" },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Notes..." },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        { key: "valid_until", label: "Valid Until", type: "date" },
    ],
};

// ─── Fleet / Vehicles ───

export const CREATE_VEHICLE_CONFIG: CreateEntityConfig = {
    entityName: "Vehicle",
    description: "Add a new vehicle to the fleet.",
    fields: [
        {
            key: "name",
            label: "Vehicle Name",
            type: "text",
            placeholder: "e.g. Box Truck #3",
            required: true,
        },
        {
            key: "type",
            label: "Type",
            type: "select",
            options: mapToOptions(VEHICLE_TYPE_MAP),
            required: true,
        },
        {
            key: "license_plate",
            label: "License Plate",
            type: "text",
            placeholder: "ABC-1234",
            required: true,
        },
        {
            key: "driver_name",
            label: "Driver Name",
            type: "text",
            placeholder: "Assigned driver",
            required: true,
        },
        {
            key: "driver_phone",
            label: "Driver Phone",
            type: "text",
            placeholder: "+1 555-0100",
            required: true,
        },
        {
            key: "dock_height",
            label: "Dock Height",
            type: "text",
            placeholder: 'e.g. 48"',
            required: true,
        },

        { key: "cargo_height", label: "Cargo Height", type: "text", placeholder: "Cargo Height" },
        { key: "cargo_length", label: "Cargo Length", type: "text", placeholder: "Cargo Length" },
        { key: "cargo_width", label: "Cargo Width", type: "text", placeholder: "Cargo Width" },
        {
            key: "current_mileage",
            label: "Current Mileage",
            type: "text",
            placeholder: "Current Mileage",
        },
        {
            key: "dimension_unit",
            label: "Dimension Unit",
            type: "text",
            placeholder: "Dimension Unit",
        },
        { key: "fuel_type", label: "Fuel Type", type: "text", placeholder: "Fuel Type" },
        { key: "gps_enabled", label: "Gps Enabled", type: "text", placeholder: "Gps Enabled" },
        {
            key: "insurance_expiry",
            label: "Insurance Expiry",
            type: "text",
            placeholder: "Insurance Expiry",
        },
        {
            key: "insurance_policy_number",
            label: "Insurance Policy Number",
            type: "text",
            placeholder: "Insurance Policy Number",
        },
        { key: "last_inspection_date", label: "Last Inspection Date", type: "date" },
        {
            key: "max_payload_unit",
            label: "Max Payload Unit",
            type: "text",
            placeholder: "Max Payload Unit",
        },
        {
            key: "max_payload_weight",
            label: "Max Payload Weight",
            type: "text",
            placeholder: "Max Payload Weight",
        },
        { key: "mileage", label: "Mileage", type: "text", placeholder: "Mileage" },
        {
            key: "registration_expiry",
            label: "Registration Expiry",
            type: "text",
            placeholder: "Registration Expiry",
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        { key: "vin", label: "Vin", type: "text", placeholder: "Vin" },
    ],
};

// ─── GL Accounts ───

export const CREATE_GL_ACCOUNT_CONFIG: CreateEntityConfig = {
    entityName: "GL Account",
    description: "Add a new general ledger account.",
    fields: [
        {
            key: "code",
            label: "Account Code",
            type: "text",
            placeholder: "e.g. 5100",
            required: true,
        },
        {
            key: "name",
            label: "Account Name",
            type: "text",
            placeholder: "e.g. Cost of Goods Sold",
            required: true,
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Purpose of this account",
        },

        { key: "account_type", label: "Account Type", type: "text", placeholder: "Account Type" },
        {
            key: "parent_id",
            label: "Parent Task",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/tasks", labelField: "title" },
        },
    ],
};

// ─── Goods Receipts ───

export const CREATE_GOODS_RECEIPT_CONFIG: CreateEntityConfig = {
    entityName: "Goods Receipt",
    description: "Record receipt of goods from a purchase order.",
    fields: [
        {
            key: "receipt_number",
            label: "Receipt Number",
            type: "text",
            placeholder: "e.g. GR-001",
            required: true,
        },
        {
            key: "delivery_location",
            label: "Delivery Location",
            type: "text",
            placeholder: "Where goods were received",
        },
        {
            key: "condition_notes",
            label: "Condition Notes",
            type: "textarea",
            placeholder: "Note any damage or discrepancies",
        },

        {
            key: "discrepancies",
            label: "Discrepancies",
            type: "text",
            placeholder: "Discrepancies",
        },
        { key: "document_url", label: "Document Url", type: "url" },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Notes..." },
        { key: "photos", label: "Photos", type: "text", placeholder: "Photos" },
        {
            key: "purchase_order_id",
            label: "Purchase Order",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.purchase_order_id,
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        {
            key: "warehouse_location_id",
            label: "Warehouse Loc.",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/warehouse-locations", labelField: "name" },
        },

        { key: "received_at", label: "Received At", type: "text", placeholder: "Received At" },
        { key: "received_by", label: "Received By", type: "text", placeholder: "Received By" },
        { key: "signed_by", label: "Signed By", type: "text", placeholder: "Signed By" },

        {
            key: "warehouse_id",
            label: "Warehouse",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/warehouses", labelField: "name" },
        },
    ],
};

// ─── Integrations ───

export const CREATE_INTEGRATION_CONFIG: CreateEntityConfig = {
    entityName: "Integration",
    description: "Connect a new external service.",
    fields: [
        {
            key: "display_name",
            label: "Connection Name",
            type: "text",
            placeholder: "e.g. Main QuickBooks",
            required: true,
        },
        {
            key: "provider_type",
            label: "Service",
            type: "select",
            options: mapToOptions(INTEGRATION_TYPE_MAP),
            required: true,
        },
        {
            key: "sync_direction",
            label: "Sync Direction",
            type: "select",
            options: [
                { value: "inbound", label: "Inbound (provider → platform)" },
                { value: "outbound", label: "Outbound (platform → provider)" },
                { value: "bidirectional", label: "Bidirectional" },
            ],
            required: true,
        },

        { key: "config", label: "Config", type: "text", placeholder: "Config" },
        { key: "name", label: "Name", type: "text", placeholder: "Name" },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        { key: "type", label: "Type", type: "text", placeholder: "Type" },

        { key: "last_sync_at", label: "Last Sync At", type: "text", placeholder: "Last Sync At" },
    ],
};

// ─── Inventory ───

export const CREATE_INVENTORY_ITEM_CONFIG: CreateEntityConfig = {
    entityName: "Inventory Item",
    description: "Add a new item to inventory.",
    fields: [
        {
            key: "name",
            label: "Item Name",
            type: "text",
            placeholder: "e.g. LED Panel 4×8",
            required: true,
        },
        {
            key: "category",
            label: "Category",
            type: "text",
            placeholder: "e.g. Lighting",
            required: true,
        },
        {
            key: "barcode",
            label: "Barcode / SKU",
            type: "text",
            placeholder: "Scan or enter barcode",
            required: true,
        },
        {
            key: "location",
            label: "Location",
            type: "text",
            placeholder: "Storage location",
            required: true,
        },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Additional details..." },
    ],
};

// ─── IP Rights ───

export const CREATE_IP_RIGHT_CONFIG: CreateEntityConfig = {
    entityName: "IP Right",
    description: "Register a new intellectual property right.",
    fields: [
        {
            key: "asset_description",
            label: "Asset Description",
            type: "textarea",
            placeholder: "Describe the IP asset",
            required: true,
        },
        {
            key: "territory",
            label: "Territory",
            type: "text",
            placeholder: "e.g. Worldwide",
            defaultValue: "worldwide",
        },
        { key: "duration", label: "Duration", type: "text", placeholder: "e.g. In perpetuity" },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Additional terms..." },

        { key: "asset_type", label: "Asset Type", type: "text", placeholder: "Asset Type" },
        { key: "buyout_amount", label: "Buyout Amount", type: "currency" },
        {
            key: "contract_id",
            label: "Contract",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.contract_id,
        },
        { key: "effective_date", label: "Effective Date", type: "date" },
        { key: "exclusivity", label: "Exclusivity", type: "text", placeholder: "Exclusivity" },
        { key: "expiry_date", label: "Expiry Date", type: "date" },
        { key: "license_type", label: "License Type", type: "text", placeholder: "License Type" },
        {
            key: "permitted_uses",
            label: "Permitted Uses",
            type: "text",
            placeholder: "Permitted Uses",
        },
        {
            key: "prohibited_uses",
            label: "Prohibited Uses",
            type: "text",
            placeholder: "Prohibited Uses",
        },
        { key: "restrictions", label: "Restrictions", type: "text", placeholder: "Restrictions" },
        { key: "royalty_rate", label: "Royalty Rate", type: "currency" },
        {
            key: "royalty_terms",
            label: "Royalty Terms",
            type: "text",
            placeholder: "Royalty Terms",
        },
        {
            key: "sublicensable",
            label: "Sublicensable",
            type: "text",
            placeholder: "Sublicensable",
        },
    ],
};

// ─── Obligations ───

export const CREATE_OBLIGATION_CONFIG: CreateEntityConfig = {
    entityName: "Contract Obligation",
    description: "Track a new contractual obligation.",
    fields: [
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "What must be delivered or performed",
            required: true,
        },
        {
            key: "clause_reference",
            label: "Clause Reference",
            type: "text",
            placeholder: "e.g. Section 4.2",
        },
        { key: "due_date", label: "Due Date", type: "date" },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Additional context..." },

        {
            key: "contract_id",
            label: "Contract",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.contract_id,
        },
        { key: "evidence_url", label: "Evidence Url", type: "url" },
        { key: "is_critical", label: "Is Critical", type: "select", options: YES_NO_OPTIONS },
        { key: "is_recurring", label: "Is Recurring", type: "select", options: YES_NO_OPTIONS },
        { key: "next_due_date", label: "Next Due Date", type: "date" },
        {
            key: "recurrence_pattern",
            label: "Recurrence Pattern",
            type: "text",
            placeholder: "Recurrence Pattern",
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
    ],
};

// ─── Payments ───

export const CREATE_PAYMENT_CONFIG: CreateEntityConfig = {
    entityName: "Payment",
    description: "Record a new payment against an invoice.",
    fields: [
        { key: "amount", label: "Amount", type: "number", min: 0, step: 0.01, required: true },
        { key: "payment_date", label: "Payment Date", type: "date", required: true },
        {
            key: "reference_number",
            label: "Reference Number",
            type: "text",
            placeholder: "Check/wire reference",
        },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Payment details..." },

        {
            key: "currency",
            label: "Currency",
            type: "select",
            options: [
                { value: "USD", label: "USD" },
                { value: "EUR", label: "EUR" },
                { value: "GBP", label: "GBP" },
                { value: "CAD", label: "CAD" },
            ],
            defaultValue: "USD",
        },
        {
            key: "invoice_id",
            label: "Invoice",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/invoices", labelField: "number" },
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
    ],
};

// ─── Project Templates ───

export const CREATE_PROJECT_TEMPLATE_CONFIG: CreateEntityConfig = {
    entityName: "Project Template",
    description: "Create a reusable project template with tasks, milestones, and roles.",
    fields: [
        {
            key: "name",
            label: "Template Name",
            type: "text",
            placeholder: "e.g. Festival Build-Out",
            required: true,
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Describe the template scope and use case",
        },
        {
            key: "category",
            label: "Category",
            type: "select",
            options: mapToOptions(PROJECT_TEMPLATE_CATEGORY_MAP),
            required: true,
        },
        {
            key: "estimated_duration",
            label: "Estimated Duration",
            type: "text",
            placeholder: "e.g. 6 weeks",
        },

        {
            key: "default_budget_categories",
            label: "Default Budget Categories",
            type: "text",
            placeholder: "Default Budget Categories",
        },
        {
            key: "default_roles",
            label: "Default Roles",
            type: "text",
            placeholder: "Default Roles",
        },
        { key: "phases", label: "Phases", type: "text", placeholder: "Phases" },
        { key: "structure", label: "Structure", type: "text", placeholder: "Structure" },
        { key: "version", label: "Version", type: "number", min: 0 },
    ],
};

// ─── Quality Checks ───

export const CREATE_QUALITY_CHECK_CONFIG: CreateEntityConfig = {
    entityName: "Quality Check",
    description: "Start a new quality inspection.",
    fields: [
        {
            key: "entity_type",
            label: "Entity Type",
            type: "select",
            options: mapToOptions(QUALITY_CHECK_ENTITY_TYPE_MAP),
            required: true,
        },
        {
            key: "notes",
            label: "Notes",
            type: "textarea",
            placeholder: "Inspection scope and objectives...",
        },

        { key: "photos", label: "Photos", type: "text", placeholder: "Photos" },
        { key: "results", label: "Results", type: "text", placeholder: "Results" },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        {
            key: "template_id",
            label: "Template",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/templates", labelField: "name" },
        },

        {
            key: "inspector_id",
            label: "Inspector",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/user-profiles", labelField: "display_name" },
        },
    ],
};

// ─── Rate Cards ───

export const CREATE_RATE_CARD_CONFIG: CreateEntityConfig = {
    entityName: "Rate Card",
    description: "Create a new rate card for pricing.",
    fields: [
        {
            key: "name",
            label: "Rate Card Name",
            type: "text",
            placeholder: "e.g. 2026 Standard Rates",
            required: true,
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Applicable services and terms",
        },
        {
            key: "currency",
            label: "Currency",
            type: "text",
            placeholder: "USD",
            defaultValue: "USD",
        },
        { key: "effective_date", label: "Effective Date", type: "date" },
        { key: "expiration_date", label: "Expiration Date", type: "date" },

        {
            key: "company_id",
            label: "Company",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.company_id,
        },
    ],
};

// ─── Resource Bookings ───

export const CREATE_RESOURCE_BOOKING_CONFIG: CreateEntityConfig = {
    entityName: "Resource Booking",
    description: "Book a crew member for a project.",
    fields: [
        {
            key: "placeholder_name",
            label: "Resource / Name",
            type: "text",
            placeholder: "Crew member or placeholder name",
            required: true,
        },
        { key: "role", label: "Role", type: "text", placeholder: "e.g. Lead Technician" },
        { key: "start_date", label: "Start Date", type: "date", required: true },
        { key: "end_date", label: "End Date", type: "date", required: true },
        {
            key: "hours_per_day",
            label: "Hours per Day",
            type: "number",
            min: 0,
            max: 24,
            step: 0.5,
            defaultValue: "8",
        },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Booking details..." },

        { key: "booking_type", label: "Booking Type", type: "text", placeholder: "Booking Type" },
        {
            key: "crew_member_id",
            label: "Crew Member",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.crew_member_id,
        },
        { key: "has_conflict", label: "Has Conflict", type: "select", options: YES_NO_OPTIONS },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "rate", label: "Rate", type: "text", placeholder: "Rate" },
        { key: "rate_type", label: "Rate Type", type: "text", placeholder: "Rate Type" },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        {
            key: "task_id",
            label: "Task",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/tasks", labelField: "title" },
        },
        { key: "total_hours", label: "Total Hours", type: "number", min: 0 },
    ],
};

// ─── Saved Views ───

export const CREATE_SAVED_VIEW_CONFIG: CreateEntityConfig = {
    entityName: "Saved View",
    description: "Save a custom view configuration.",
    fields: [
        {
            key: "name",
            label: "View Name",
            type: "text",
            placeholder: "e.g. My Active Projects",
            required: true,
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "What does this view show?",
        },
        {
            key: "view_type",
            label: "View Type",
            type: "select",
            options: mapToOptions(SAVED_VIEW_TYPE_MAP),
            defaultValue: "table",
            required: true,
        },

        { key: "board_config", label: "Board Config", type: "text", placeholder: "Board Config" },
        {
            key: "column_widths",
            label: "Column Widths",
            type: "text",
            placeholder: "Column Widths",
        },
        { key: "is_shared", label: "Is Shared", type: "select", options: YES_NO_OPTIONS },
        {
            key: "owner_id",
            label: "Owner",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.owner_id,
        },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        {
            key: "shared_with_team_ids",
            label: "Shared With Team Ids",
            type: "text",
            placeholder: "Shared With Team Ids",
        },
        {
            key: "visible_columns",
            label: "Visible Columns",
            type: "text",
            placeholder: "Visible Columns",
        },

        { key: "group_by", label: "Group By", type: "text", placeholder: "Group By" },
        { key: "sort_by", label: "Sort By", type: "text", placeholder: "Sort By" },
    ],
};

// ─── Scenarios ───

export const CREATE_SCENARIO_CONFIG: CreateEntityConfig = {
    entityName: "Scenario",
    description: "Create a new what-if scenario.",
    fields: [
        {
            key: "name",
            label: "Scenario Name",
            type: "text",
            placeholder: "e.g. Headcount +20%",
            required: true,
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "What assumptions does this scenario explore?",
        },
        {
            key: "scenario_type",
            label: "Type",
            type: "select",
            options: mapToOptions(SCENARIO_TYPE_MAP),
            defaultValue: "combined",
        },

        {
            key: "budget_id",
            label: "Budget",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.budget_id,
        },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },

        {
            key: "base_scenario_id",
            label: "Base Scenario",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/scenarios", labelField: "name" },
        },
    ],
};

// ─── Scheduling / Shifts ───

export const CREATE_SHIFT_CONFIG: CreateEntityConfig = {
    entityName: "Shift",
    description: "Schedule a new crew shift.",
    fields: [
        { key: "date", label: "Date", type: "date", required: true },
        {
            key: "start_time",
            label: "Start Time",
            type: "text",
            placeholder: "e.g. 08:00",
            required: true,
        },
        {
            key: "end_time",
            label: "End Time",
            type: "text",
            placeholder: "e.g. 18:00",
            required: true,
        },
        { key: "role", label: "Role", type: "text", placeholder: "e.g. Stage Manager" },

        {
            key: "crew_member_id",
            label: "Crew Member",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.crew_member_id,
        },
        {
            key: "location_id",
            label: "Location",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.location_id,
        },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
    ],
};

// ─── SOPs ───

export const CREATE_SOP_CONFIG: CreateEntityConfig = {
    entityName: "SOP",
    description: "Create a new Standard Operating Procedure.",
    fields: [
        {
            key: "title",
            label: "Title",
            type: "text",
            placeholder: "e.g. Emergency Evacuation Procedure",
            required: true,
        },
        {
            key: "role",
            label: "Applicable Role",
            type: "text",
            placeholder: "e.g. All Crew",
            required: true,
        },
        {
            key: "content",
            label: "Content",
            type: "textarea",
            placeholder: "Step-by-step instructions...",
            required: true,
        },
        { key: "version", label: "Version", type: "text", placeholder: "1.0", defaultValue: "1.0" },
    ],
};

// ─── Surveys ───

export const CREATE_SURVEY_CONFIG: CreateEntityConfig = {
    entityName: "Survey Template",
    description: "Create a new survey template.",
    fields: [
        {
            key: "name",
            label: "Survey Name",
            type: "text",
            placeholder: "e.g. Post-Event Satisfaction",
            required: true,
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Purpose and audience",
        },
        {
            key: "survey_type",
            label: "Survey Type",
            type: "select",
            options: mapToOptions(SURVEY_TYPE_MAP),
            defaultValue: "csat",
        },

        { key: "questions", label: "Questions", type: "text", placeholder: "Questions" },
        { key: "trigger_on", label: "Trigger On", type: "text", placeholder: "Trigger On" },
    ],
};

// ─── Time Off ───

export const CREATE_TIME_OFF_REQUEST_CONFIG: CreateEntityConfig = {
    entityName: "Time Off Request",
    description: "Submit a new time off request.",
    fields: [
        { key: "start_date", label: "Start Date", type: "date", required: true },
        { key: "end_date", label: "End Date", type: "date", required: true },
        { key: "reason", label: "Reason", type: "textarea", placeholder: "Reason for time off" },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Additional context..." },

        {
            key: "approver_id",
            label: "Approver",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.approver_id,
        },
        {
            key: "crew_member_id",
            label: "Crew Member",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.crew_member_id,
        },
        {
            key: "hours_per_day",
            label: "Hours Per Day",
            type: "text",
            placeholder: "Hours Per Day",
        },
        { key: "is_half_day", label: "Is Half Day", type: "select", options: YES_NO_OPTIONS },
        {
            key: "rejection_reason",
            label: "Rejection Reason",
            type: "text",
            placeholder: "Rejection Reason",
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        {
            key: "time_off_type",
            label: "Time Off Type",
            type: "text",
            placeholder: "Time Off Type",
        },
    ],
};

// ─── Time Tracking ───

export const CREATE_TIME_ENTRY_CONFIG: CreateEntityConfig = {
    entityName: "Time Entry",
    description: "Log a new time entry.",
    fields: [
        { key: "date", label: "Date", type: "date", required: true },
        {
            key: "hours_worked",
            label: "Hours",
            type: "number",
            min: 0.25,
            max: 24,
            step: 0.25,
            required: true,
        },
        {
            key: "hourly_rate",
            label: "Hourly Rate",
            type: "number",
            min: 0,
            step: 0.01,
            required: true,
        },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "What did you work on?" },

        {
            key: "crew_member_id",
            label: "Crew Member",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.crew_member_id,
        },
        {
            key: "invoice_line_item_id",
            label: "Invoice Line",
            type: "entity-lookup",
            lookupConfig: {
                apiPath: "/api/entities/invoice-line-items",
                labelField: "description",
            },
        },
        { key: "is_billable", label: "Is Billable", type: "select", options: YES_NO_OPTIONS },
        {
            key: "overtime_flag",
            label: "Overtime Flag",
            type: "text",
            placeholder: "Overtime Flag",
        },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        {
            key: "sow_deliverable_id",
            label: "SOW Deliverable",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/sow-deliverables", labelField: "title" },
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        {
            key: "task_id",
            label: "Task",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/tasks", labelField: "title" },
        },
    ],
};

// ─── User Invitations ───

export const CREATE_USER_INVITE_CONFIG: CreateEntityConfig = {
    entityName: "User Invitation",
    description: "Invite a new team member.",
    fields: [
        {
            key: "email",
            label: "Email",
            type: "text",
            placeholder: "name@company.com",
            required: true,
        },
        {
            key: "full_name",
            label: "Full Name",
            type: "text",
            placeholder: "First and last name",
            required: true,
        },
        {
            key: "role",
            label: "Role",
            type: "select",
            options: mapToOptions(PERMISSION_LEVEL_MAP),
            defaultValue: "member",
            required: true,
        },
    ],
};

// ─── Vault Documents ───

export const CREATE_VAULT_DOCUMENT_CONFIG: CreateEntityConfig = {
    entityName: "Vault Document",
    description: "Upload a document to the vault.",
    fields: [
        {
            key: "name",
            label: "Document Name",
            type: "text",
            placeholder: "e.g. Venue NDA — Nike",
            required: true,
        },
        {
            key: "category",
            label: "Category",
            type: "select",
            options: mapToOptions(DOCUMENT_CATEGORY_MAP),
            defaultValue: "other",
            required: true,
        },

        { key: "access_level", label: "Access Level", type: "text", placeholder: "Access Level" },
        { key: "expiring_link_url", label: "Expiring Link Url", type: "url" },
        { key: "mime_type", label: "Mime Type", type: "text", placeholder: "Mime Type" },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "size", label: "Size", type: "text", placeholder: "Size" },
        { key: "url", label: "Url", type: "text", placeholder: "Url" },

        {
            key: "expiring_link_expires_at",
            label: "Expiring Link Expires At",
            type: "text",
            placeholder: "Expiring Link Expires At",
        },
        { key: "uploaded_by", label: "Uploaded By", type: "text", placeholder: "Uploaded By" },
    ],
};

// ─── Vendor Onboarding ───

export const CREATE_VENDOR_ONBOARDING_CONFIG: CreateEntityConfig = {
    entityName: "Vendor Invitation",
    description: "Invite a vendor to begin onboarding.",
    fields: [
        {
            key: "name",
            label: "Vendor Name",
            type: "text",
            placeholder: "Company or contractor name",
            required: true,
        },
        {
            key: "contact_name",
            label: "Contact Name",
            type: "text",
            placeholder: "Primary contact",
            required: true,
        },
        {
            key: "email",
            label: "Email",
            type: "text",
            placeholder: "vendor@company.com",
            required: true,
        },
        {
            key: "specialty",
            label: "Specialty",
            type: "text",
            placeholder: "e.g. AV, Rigging, Catering",
            required: true,
        },
    ],
};

// ─── Warehouses ───

export const CREATE_WAREHOUSE_CONFIG: CreateEntityConfig = {
    entityName: "Warehouse",
    description: "Add a new warehouse or storage facility.",
    fields: [
        {
            key: "name",
            label: "Warehouse Name",
            type: "text",
            placeholder: "e.g. Main Warehouse — Brooklyn",
            required: true,
        },
        {
            key: "type",
            label: "Type",
            type: "select",
            options: mapToOptions(WAREHOUSE_TYPE_MAP),
            defaultValue: "primary",
        },
        {
            key: "address_street1",
            label: "Street Address",
            type: "text",
            placeholder: "Street address",
        },
        { key: "address_city", label: "City", type: "text", placeholder: "City" },
        { key: "address_state", label: "State", type: "text", placeholder: "State" },
        { key: "address_postal_code", label: "Postal Code", type: "text", placeholder: "Zip code" },

        {
            key: "address_country",
            label: "Address Country",
            type: "text",
            placeholder: "Address Country",
        },
        {
            key: "address_street2",
            label: "Address Street2",
            type: "text",
            placeholder: "Address Street2",
        },
        {
            key: "climate_controlled",
            label: "Climate Controlled",
            type: "text",
            placeholder: "Climate Controlled",
        },
        { key: "contact_email", label: "Contact Email", type: "email" },
        {
            key: "contact_phone",
            label: "Contact Phone",
            type: "text",
            placeholder: "+1 (555) 000-0000",
        },
        { key: "coordinates", label: "Coordinates", type: "text", placeholder: "Coordinates" },
        {
            key: "loading_docks",
            label: "Loading Docks",
            type: "text",
            placeholder: "Loading Docks",
        },
        {
            key: "location_id",
            label: "Location",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.location_id,
        },
        {
            key: "manager_id",
            label: "Manager",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.manager_id,
        },
        { key: "operating_hours", label: "Operating Hours", type: "number", min: 0 },
        {
            key: "security_level",
            label: "Security Level",
            type: "text",
            placeholder: "Security Level",
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        {
            key: "total_square_footage",
            label: "Total Square Footage",
            type: "text",
            placeholder: "Total Square Footage",
        },
        {
            key: "usable_square_footage",
            label: "Usable Square Footage",
            type: "text",
            placeholder: "Usable Square Footage",
        },
        { key: "zones", label: "Zones", type: "text", placeholder: "Zones" },
    ],
};

// ─── Milestones ───

export const CREATE_MILESTONE_CONFIG: CreateEntityConfig = {
    entityName: "Milestone",
    description: "Create a new project milestone.",
    fields: [
        {
            key: "name",
            label: "Milestone Name",
            type: "text",
            placeholder: "e.g. Creative Approval Gate",
            required: true,
        },
        { key: "due_date", label: "Due Date", type: "date", required: true },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Milestone scope and deliverables...",
        },
        {
            key: "approval_required",
            label: "Approval Required",
            type: "select",
            options: [
                { value: "true", label: "Yes" },
                { value: "false", label: "No" },
            ],
            defaultValue: "false",
        },

        {
            key: "approval_id",
            label: "Approval",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/approvals", labelField: "title" },
        },
        {
            key: "client_facing",
            label: "Client Facing",
            type: "text",
            placeholder: "Client Facing",
        },
        {
            key: "deliverables",
            label: "Deliverables",
            type: "textarea",
            placeholder: "Deliverables...",
        },
        {
            key: "is_critical_path",
            label: "Is Critical Path",
            type: "select",
            options: YES_NO_OPTIONS,
        },
        {
            key: "owner_id",
            label: "Owner",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.owner_id,
        },
        { key: "payment_amount", label: "Payment Amount", type: "currency" },
        {
            key: "payment_trigger",
            label: "Payment Trigger",
            type: "text",
            placeholder: "Payment Trigger",
        },
        { key: "phase", label: "Phase", type: "text", placeholder: "Phase" },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
    ],
};

// ─── Crew Shifts ───

export const CREATE_CREW_SHIFT_CONFIG: CreateEntityConfig = {
    entityName: "Crew Shift",
    description: "Schedule a new crew shift assignment.",
    fields: [
        {
            key: "role",
            label: "Role",
            type: "text",
            placeholder: "e.g. Stage Manager",
            required: true,
        },
        { key: "date", label: "Date", type: "date", required: true },
        {
            key: "call_time",
            label: "Call Time",
            type: "text",
            placeholder: "e.g. 07:00",
            required: true,
        },
        {
            key: "start_time",
            label: "Start Time",
            type: "text",
            placeholder: "e.g. 08:00",
            required: true,
        },
        {
            key: "end_time",
            label: "End Time",
            type: "text",
            placeholder: "e.g. 18:00",
            required: true,
        },
        {
            key: "hourly_rate",
            label: "Hourly Rate",
            type: "number",
            min: 0,
            step: 0.01,
            required: true,
        },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Shift details..." },

        {
            key: "crew_member_id",
            label: "Crew Member",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.crew_member_id,
        },
        { key: "duties", label: "Duties", type: "text", placeholder: "Duties" },
        {
            key: "event_id",
            label: "Event",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.event_id,
        },
        {
            key: "location_id",
            label: "Location",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.location_id,
        },
        {
            key: "meal_provided",
            label: "Meal Provided",
            type: "text",
            placeholder: "Meal Provided",
        },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        {
            key: "reporting_location",
            label: "Reporting Location",
            type: "text",
            placeholder: "Reporting Location",
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        {
            key: "supervisor_id",
            label: "Supervisor",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.supervisor_id,
        },
        {
            key: "time_entry_id",
            label: "Time Entry",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/time-entries", labelField: "description" },
        },
        {
            key: "travel_reimbursement",
            label: "Travel Reimbursement",
            type: "text",
            placeholder: "Travel Reimbursement",
        },
        { key: "wrap_time", label: "Wrap Time", type: "text" },
    ],
};

// ─── ROS Cues ───

export const CREATE_ROS_CUE_CONFIG: CreateEntityConfig = {
    entityName: "ROS Cue",
    description: "Add a new cue to the run of show.",
    fields: [
        {
            key: "cue_number",
            label: "Cue Number",
            type: "text",
            placeholder: "e.g. Q-001",
            required: true,
        },
        {
            key: "title",
            label: "Title",
            type: "text",
            placeholder: "e.g. House Lights Down",
            required: true,
        },
        { key: "scheduled_time", label: "Scheduled Time", type: "datetime-local" },
        {
            key: "duration_seconds",
            label: "Duration (seconds)",
            type: "number",
            min: 0,
            placeholder: "0",
        },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: mapToOptions(ROS_CUE_STATUS_MAP),
            defaultValue: "pending",
        },
        {
            key: "is_critical",
            label: "Critical Cue",
            type: "select",
            options: [
                { value: "true", label: "Yes" },
                { value: "false", label: "No" },
            ],
            defaultValue: "false",
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Cue details...",
        },

        {
            key: "live_event_id",
            label: "Live Event",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/live-events", labelField: "name" },
        },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Notes..." },
        {
            key: "variance_seconds",
            label: "Variance Seconds",
            type: "text",
            placeholder: "Variance Seconds",
        },

        {
            key: "actual_duration_seconds",
            label: "Actual Duration Seconds",
            type: "text",
            placeholder: "Actual Duration Seconds",
        },
        { key: "actual_time", label: "Actual Time", type: "text", placeholder: "Actual Time" },
        { key: "called_at", label: "Called At", type: "text", placeholder: "Called At" },

        {
            key: "responsible_id",
            label: "Responsible",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/user-profiles", labelField: "display_name" },
        },
    ],
};

// ─── Readiness Gates ───

export const CREATE_READINESS_GATE_CONFIG: CreateEntityConfig = {
    entityName: "Readiness Gate",
    description: "Define a new readiness gate for an event.",
    fields: [
        {
            key: "name",
            label: "Gate Name",
            type: "text",
            placeholder: "e.g. Fire Marshal Inspection",
            required: true,
        },
        {
            key: "gate_number",
            label: "Gate Number",
            type: "number",
            min: 1,
            required: true,
        },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: mapToOptions(READINESS_GATE_STATUS_MAP),
            defaultValue: "not_started",
        },
        {
            key: "is_blocking",
            label: "Blocking",
            type: "select",
            options: [
                { value: "true", label: "Yes — blocks go-live" },
                { value: "false", label: "No — advisory only" },
            ],
            defaultValue: "true",
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Gate requirements and criteria...",
        },

        {
            key: "checklist_ids",
            label: "Checklist Ids",
            type: "text",
            placeholder: "Checklist Ids",
        },
        {
            key: "evidence_notes",
            label: "Evidence Notes",
            type: "text",
            placeholder: "Evidence Notes",
        },
        {
            key: "evidence_urls",
            label: "Evidence Urls",
            type: "text",
            placeholder: "Evidence Urls",
        },
        {
            key: "live_event_id",
            label: "Live Event",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/live-events", labelField: "name" },
        },
        { key: "permit_ids", label: "Permit Ids", type: "text", placeholder: "Permit Ids" },
        {
            key: "verifier_role",
            label: "Verifier Role",
            type: "text",
            placeholder: "Verifier Role",
        },
    ],
};

// ─── Change Orders ───

export const CREATE_CHANGE_ORDER_CONFIG: CreateEntityConfig = {
    entityName: "Change Order",
    description: "Create a new change order for a project.",
    fields: [
        {
            key: "title",
            label: "Title",
            type: "text",
            placeholder: "e.g. Add LED Wall to Main Stage",
            required: true,
        },
        {
            key: "number",
            label: "Change Order Number",
            type: "text",
            placeholder: "e.g. CO-001",
            required: true,
        },
        {
            key: "change_type",
            label: "Change Type",
            type: "select",
            options: mapToOptions(CHANGE_ORDER_TYPE_MAP),
            defaultValue: "scope_addition",
            required: true,
        },
        {
            key: "value_impact",
            label: "Value Impact ($)",
            type: "number",
            step: 0.01,
            placeholder: "0.00",
            required: true,
        },
        {
            key: "schedule_impact_days",
            label: "Schedule Impact (days)",
            type: "number",
            placeholder: "0",
        },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: mapToOptions(CHANGE_ORDER_STATUS_MAP),
            defaultValue: "draft",
        },
        {
            key: "reason",
            label: "Reason",
            type: "textarea",
            placeholder: "Why is this change needed?",
            required: true,
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Scope of the change...",
        },

        {
            key: "business_case",
            label: "Business Case",
            type: "text",
            placeholder: "Business Case",
        },
        {
            key: "company_id",
            label: "Company",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.company_id,
        },
        {
            key: "deliverables_added",
            label: "Deliverables Added",
            type: "text",
            placeholder: "Deliverables Added",
        },
        {
            key: "deliverables_removed",
            label: "Deliverables Removed",
            type: "text",
            placeholder: "Deliverables Removed",
        },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Notes..." },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        {
            key: "scope_additions",
            label: "Scope Additions",
            type: "text",
            placeholder: "Scope Additions",
        },
        {
            key: "scope_removals",
            label: "Scope Removals",
            type: "text",
            placeholder: "Scope Removals",
        },
        {
            key: "sow_id",
            label: "Sow",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.sow_id,
        },

        {
            key: "client_approved_at",
            label: "Client Approved At",
            type: "text",
            placeholder: "Client Approved At",
        },
        {
            key: "client_approved_by",
            label: "Client Approved By",
            type: "text",
            placeholder: "Client Approved By",
        },
        { key: "requested_at", label: "Requested At", type: "text", placeholder: "Requested At" },
        { key: "requested_by", label: "Requested By", type: "text", placeholder: "Requested By" },
        { key: "reviewed_at", label: "Reviewed At", type: "text", placeholder: "Reviewed At" },
        { key: "reviewed_by", label: "Reviewed By", type: "text", placeholder: "Reviewed By" },
    ],
};

// ─── Rental Agreements ───

export const CREATE_RENTAL_AGREEMENT_CONFIG: CreateEntityConfig = {
    entityName: "Rental Agreement",
    description: "Create a new rental or equipment agreement.",
    fields: [
        {
            key: "agreement_number",
            label: "Agreement Number",
            type: "text",
            placeholder: "e.g. RA-2026-001",
            required: true,
        },
        {
            key: "agreement_type",
            label: "Type",
            type: "select",
            options: mapToOptions(RENTAL_AGREEMENT_TYPE_MAP),
            defaultValue: "rental",
            required: true,
        },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: mapToOptions(RENTAL_AGREEMENT_STATUS_MAP),
            defaultValue: "draft",
        },
        { key: "event_date", label: "Event Date", type: "date" },
        { key: "pickup_date", label: "Pickup Date", type: "date", required: true },
        { key: "return_date", label: "Return Date", type: "date", required: true },
        { key: "deposit_amount", label: "Deposit Amount", type: "currency" },
        {
            key: "notes",
            label: "Notes",
            type: "textarea",
            placeholder: "Agreement terms and notes...",
        },

        {
            key: "client_id",
            label: "Client",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/companies", labelField: "name" },
        },
        {
            key: "contact_id",
            label: "Contact",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.contact_id,
        },
        {
            key: "damage_charges",
            label: "Damage Charges",
            type: "text",
            placeholder: "Damage Charges",
        },
        { key: "deposit_paid", label: "Deposit Paid", type: "text", placeholder: "Deposit Paid" },
        {
            key: "location_id",
            label: "Location",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.location_id,
        },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        {
            key: "stylist_id",
            label: "Stylist",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/user-profiles", labelField: "display_name" },
        },
        { key: "subtotal", label: "Subtotal", type: "currency" },
        { key: "tax_amount", label: "Tax Amount", type: "currency" },
        { key: "total_amount", label: "Total Amount", type: "currency" },

        { key: "actual_return_date", label: "Actual Return Date", type: "date" },
    ],
};

// ── Budget Line Items ──
export const CREATE_BUDGET_LINE_ITEM_CONFIG: CreateEntityConfig = {
    entityName: "Budget Line Item",
    description: "Add a new line item to this budget.",
    fields: [
        {
            key: "category",
            label: "Category",
            type: "select",
            required: true,
            options: mapToOptions(BUDGET_LINE_CATEGORY_MAP),
        },
        {
            key: "description",
            label: "Description",
            type: "text",
            required: true,
            placeholder: "Line item description",
        },
        {
            key: "estimated_amount",
            label: "Estimated Amount",
            type: "number",
            required: true,
            placeholder: "0.00",
        },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Additional notes" },

        {
            key: "activation_id",
            label: "Activation",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.activation_id,
        },
        {
            key: "campaign_id",
            label: "Campaign",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/campaigns", labelField: "name" },
        },
        { key: "committed_amount", label: "Committed Amount", type: "currency" },
        { key: "cost_center", label: "Cost Center", type: "text", placeholder: "Cost Center" },
        { key: "cost_code", label: "Cost Code", type: "text", placeholder: "Cost Code" },
        { key: "department", label: "Department", type: "text", placeholder: "Department" },
        {
            key: "event_id",
            label: "Event",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.event_id,
        },
        {
            key: "gl_account_id",
            label: "GL Account",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/gl-accounts", labelField: "name" },
        },
        { key: "phase", label: "Phase", type: "text", placeholder: "Phase" },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        {
            key: "vendor_id",
            label: "Vendor",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.vendor_id,
        },
        {
            key: "work_package_id",
            label: "Work Package",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/work-packages", labelField: "name" },
        },

        { key: "actual_amount", label: "Actual Amount", type: "currency" },
    ],
};

// ── Project Members ──
export const CREATE_PROJECT_MEMBER_CONFIG: CreateEntityConfig = {
    entityName: "Project Member",
    description: "Add a team member to this project.",
    fields: [
        {
            key: "profile_id",
            label: "Team Member",
            type: "text",
            required: true,
            placeholder: "Member profile ID",
        },
        {
            key: "role",
            label: "Role",
            type: "select",
            options: mapToOptions(PROJECT_MEMBER_ROLE_MAP),
            defaultValue: "member",
        },

        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },

        {
            key: "access_expires_at",
            label: "Access Expires At",
            type: "text",
            placeholder: "Access Expires At",
        },
    ],
};

export const CREATE_CUSTOM_FIELD_CONFIG: CreateEntityConfig = {
    entityName: "Custom Field",
    description: "Define a new custom property field on an entity type.",
    fields: [
        {
            key: "name",
            label: "Field Name",
            type: "text",
            required: true,
            placeholder: "e.g. Priority Score",
        },
        {
            key: "field_key",
            label: "Field Key",
            type: "text",
            required: true,
            placeholder: "e.g. priority_score",
        },
        {
            key: "entity_type",
            label: "Entity Type",
            type: "select",
            required: true,
            options: mapToOptions(ENGINEERING_ENTITY_TYPE_MAP),
        },
        {
            key: "field_type",
            label: "Field Type",
            type: "select",
            required: true,
            options: mapToOptions(SAVED_VIEW_TYPE_MAP),
            defaultValue: "text",
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "What is this field for?",
        },

        { key: "default_value", label: "Default Value", type: "currency" },
        { key: "group_name", label: "Group Name", type: "text", placeholder: "Group Name" },
        { key: "is_filterable", label: "Is Filterable", type: "select", options: YES_NO_OPTIONS },
        { key: "is_required", label: "Is Required", type: "select", options: YES_NO_OPTIONS },
        {
            key: "is_visible_in_list",
            label: "Is Visible In List",
            type: "select",
            options: YES_NO_OPTIONS,
        },
        { key: "options", label: "Options", type: "text", placeholder: "Options" },
        {
            key: "validation_rules",
            label: "Validation Rules",
            type: "text",
            placeholder: "Validation Rules",
        },
    ],
};

export const CREATE_GOAL_CONFIG: CreateEntityConfig = {
    entityName: "Goal",
    description: "Create a new goal or OKR.",
    fields: [
        { key: "title", label: "Title", type: "text", required: true, placeholder: "Goal title" },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "What does success look like?",
        },
        {
            key: "goal_type",
            label: "Type",
            type: "select",
            required: true,
            options: mapToOptions(GOAL_TYPE_MAP),
            defaultValue: "individual",
        },
        { key: "target_value", label: "Target Value", type: "number", placeholder: "100" },
        { key: "unit", label: "Unit", type: "text", placeholder: "e.g. count, %, hours" },
        { key: "due_date", label: "Due Date", type: "date" },

        {
            key: "owner_id",
            label: "Owner",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.owner_id,
        },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },

        {
            key: "parent_goal_id",
            label: "Parent Goal",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/goals", labelField: "title" },
        },
    ],
};

export const CREATE_ONBOARDING_RUN_CONFIG: CreateEntityConfig = {
    entityName: "Onboarding Run",
    description: "Start a new onboarding workflow for a worker.",
    fields: [
        {
            key: "worker_profile_id",
            label: "Worker",
            type: "text",
            required: true,
            placeholder: "Worker profile ID",
        },
        { key: "target_completion_date", label: "Target Completion", type: "date" },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Additional context" },
    ],
};

export const CREATE_WORKER_REVIEW_CONFIG: CreateEntityConfig = {
    entityName: "Performance Review",
    description: "Create a new worker performance review.",
    fields: [
        {
            key: "worker_profile_id",
            label: "Worker",
            type: "text",
            required: true,
            placeholder: "Worker profile ID",
        },
        {
            key: "target_type",
            label: "Worker Type",
            type: "select",
            required: true,
            options: mapToOptions(WORKER_TARGET_TYPE_MAP),
            defaultValue: "employee",
        },
        {
            key: "review_type",
            label: "Review Type",
            type: "select",
            required: true,
            options: mapToOptions(WORKER_REVIEW_TYPE_MAP),
            defaultValue: "periodic",
        },
        {
            key: "overall_rating",
            label: "Overall Rating (1-5)",
            type: "number",
            required: true,
            placeholder: "1-5",
        },
        {
            key: "strengths",
            label: "Strengths",
            type: "textarea",
            placeholder: "Key strengths observed",
        },
        {
            key: "areas_for_improvement",
            label: "Areas for Improvement",
            type: "textarea",
            placeholder: "Growth opportunities",
        },
    ],
};

// ─── Templates ───

export const CREATE_TEMPLATE_CONFIG: CreateEntityConfig = {
    entityName: "Template",
    description: "Create a new document template.",
    fields: [
        {
            key: "name",
            label: "Template Name",
            type: "text",
            placeholder: "e.g. Standard Services Agreement",
            required: true,
        },
        {
            key: "category",
            label: "Category",
            type: "select",
            options: mapToOptions(TEMPLATE_CATEGORY_MAP),
            required: true,
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Template purpose and usage notes...",
        },
    ],
};

// ─── Knowledge Base ───

export const CREATE_KB_ARTICLE_CONFIG: CreateEntityConfig = {
    entityName: "Article",
    description: "Create a new knowledge base article.",
    fields: [
        {
            key: "title",
            label: "Article Title",
            type: "text",
            placeholder: "e.g. How to Submit Time-Off Requests",
            required: true,
        },
        {
            key: "category",
            label: "Category",
            type: "select",
            options: mapToOptions(KB_ARTICLE_CATEGORY_MAP),
            required: true,
        },
        {
            key: "summary",
            label: "Summary",
            type: "textarea",
            placeholder: "Brief summary of this article...",
        },
    ],
};

// ─── Advancing ───

export const CREATE_ADVANCE_CONFIG: CreateEntityConfig = {
    entityName: "Advance",
    description: "Create a new production advance request.",
    fields: [
        {
            key: "title",
            label: "Title",
            type: "text",
            placeholder: "e.g. Stage Build Materials",
            required: true,
        },
        {
            key: "advance_type",
            label: "Type",
            type: "select",
            options: mapToOptions(ADVANCE_TYPE_MAP),
            required: true,
        },
        {
            key: "priority",
            label: "Priority",
            type: "select",
            options: mapToOptions(WORK_ORDER_PRIORITY_MAP),
        },
        {
            key: "total_estimated_cost",
            label: "Estimated Cost",
            type: "number",
            placeholder: "0.00",
        },
        {
            key: "notes",
            label: "Notes",
            type: "textarea",
            placeholder: "Additional details...",
        },
    ],
};

export const CREATE_CATALOG_ITEM_CONFIG: CreateEntityConfig = {
    entityName: "Catalog Item",
    description: "Add a new item to the advance catalog.",
    fields: [
        {
            key: "name",
            label: "Item Name",
            type: "text",
            placeholder: "e.g. Gaffer Tape Roll",
            required: true,
        },
        {
            key: "sku",
            label: "SKU",
            type: "text",
            placeholder: "e.g. GT-001",
        },
        {
            key: "unit_cost",
            label: "Unit Cost",
            type: "number",
            placeholder: "0.00",
            required: true,
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Item description...",
        },

        {
            key: "available_quantity",
            label: "Available Quantity",
            type: "text",
            placeholder: "Available Quantity",
        },
        {
            key: "client_visible",
            label: "Client Visible",
            type: "text",
            placeholder: "Client Visible",
        },
        {
            key: "currency",
            label: "Currency",
            type: "select",
            options: [
                { value: "USD", label: "USD" },
                { value: "EUR", label: "EUR" },
                { value: "GBP", label: "GBP" },
                { value: "CAD", label: "CAD" },
            ],
            defaultValue: "USD",
        },
        { key: "default_unit_cost", label: "Default Unit Cost", type: "currency" },
        {
            key: "hierarchical_sku",
            label: "Hierarchical Sku",
            type: "text",
            placeholder: "Hierarchical Sku",
        },
        {
            key: "is_critical_path",
            label: "Is Critical Path",
            type: "select",
            options: YES_NO_OPTIONS,
        },
        { key: "is_custom", label: "Is Custom", type: "select", options: YES_NO_OPTIONS },
        { key: "make", label: "Make", type: "text", placeholder: "Make" },
        {
            key: "min_lead_time_days",
            label: "Min Lead Time Days",
            type: "text",
            placeholder: "Min Lead Time Days",
        },
        { key: "model", label: "Model", type: "text", placeholder: "Model" },
        {
            key: "specifications",
            label: "Specifications",
            type: "text",
            placeholder: "Specifications",
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        { key: "thumbnail_url", label: "Thumbnail Url", type: "url" },
        {
            key: "unit_of_measure",
            label: "Unit Of Measure",
            type: "text",
            placeholder: "Unit Of Measure",
        },

        {
            key: "category_id",
            label: "Category",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/catalog-categories", labelField: "name" },
        },
    ],
};

export const CREATE_ADVANCE_TEMPLATE_CONFIG: CreateEntityConfig = {
    entityName: "Advance Template",
    description: "Create a reusable advance template.",
    fields: [
        {
            key: "name",
            label: "Template Name",
            type: "text",
            placeholder: "e.g. Standard Stage Build",
            required: true,
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "What this template includes...",
        },

        { key: "advance_type", label: "Advance Type", type: "text", placeholder: "Advance Type" },
        { key: "is_public", label: "Is Public", type: "select", options: YES_NO_OPTIONS },
        {
            key: "template_items",
            label: "Template Items",
            type: "text",
            placeholder: "Template Items",
        },
        { key: "use_count", label: "Use Count", type: "number", min: 0 },
    ],
};

// ─── Credentials ───

export const CREATE_CREDENTIAL_ASSIGNMENT_CONFIG: CreateEntityConfig = {
    entityName: "Credential Assignment",
    description: "Assign a credential to a person.",
    fields: [
        {
            key: "assignee_name",
            label: "Assignee Name",
            type: "text",
            placeholder: "e.g. Jane Smith",
            required: true,
        },
        {
            key: "assignee_email",
            label: "Email",
            type: "email",
            placeholder: "jane@company.com",
        },
        {
            key: "zone_access",
            label: "Zone Access",
            type: "text",
            placeholder: "e.g. VIP, Backstage",
        },
        {
            key: "valid_from",
            label: "Valid From",
            type: "date",
        },
        {
            key: "valid_until",
            label: "Valid Until",
            type: "date",
        },

        {
            key: "credential_type_id",
            label: "Credential Type",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.credential_type_id,
        },
        {
            key: "crew_member_id",
            label: "Crew Member",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.crew_member_id,
        },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Notes..." },
        {
            key: "pool_id",
            label: "Pool",
            type: "entity-lookup",
            lookupConfig: {
                apiPath: "/api/entities/credential-inventory-pools",
                labelField: "name",
            },
        },
        {
            key: "profile_id",
            label: "Profile",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.profile_id,
        },
        {
            key: "revocation_reason",
            label: "Revocation Reason",
            type: "textarea",
            placeholder: "Revocation Reason...",
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        {
            key: "vendor_id",
            label: "Vendor",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.vendor_id,
        },
        {
            key: "vip_guest_id",
            label: "VIP Guest",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/vip-guests", labelField: "name" },
        },
    ],
};

// ─── Digital Assets ───

export const CREATE_DIGITAL_ASSET_CONFIG: CreateEntityConfig = {
    entityName: "Digital Asset",
    description: "Register a new digital asset.",
    fields: [
        {
            key: "name",
            label: "Asset Name",
            type: "text",
            placeholder: "e.g. Hero Image - Main Stage",
            required: true,
        },
        {
            key: "asset_class",
            label: "Asset Class",
            type: "select",
            options: mapToOptions(DIGITAL_ASSET_CLASS_MAP),
            required: true,
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Asset details...",
        },

        {
            key: "document_number",
            label: "Document Number",
            type: "text",
            placeholder: "Document Number",
        },
        { key: "filename", label: "Filename", type: "text", placeholder: "Filename" },
        { key: "next_review_date", label: "Next Review Date", type: "date" },
        {
            key: "owner_id",
            label: "Owner",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.owner_id,
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },

        { key: "expires_at", label: "Expires At", type: "text", placeholder: "Expires At" },

        {
            key: "retention_policy_id",
            label: "Retention Policy",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/data-retention-policies", labelField: "name" },
        },
    ],
};

// ─── SLA Policies ───

export const CREATE_SLA_POLICY_CONFIG: CreateEntityConfig = {
    entityName: "SLA Policy",
    description: "Create a new SLA policy for service requests.",
    fields: [
        {
            key: "name",
            label: "Policy Name",
            type: "text",
            placeholder: "e.g. Critical Response SLA",
            required: true,
        },
        {
            key: "priority",
            label: "Priority",
            type: "select",
            options: mapToOptions(SERVICE_REQUEST_PRIORITY_MAP),
            required: true,
        },
        {
            key: "response_time_minutes",
            label: "Response Time (minutes)",
            type: "number",
            placeholder: "15",
            required: true,
        },
        {
            key: "resolution_time_minutes",
            label: "Resolution Time (minutes)",
            type: "number",
            placeholder: "60",
            required: true,
        },
        {
            key: "assign_to_team",
            label: "Assign to Team",
            type: "text",
            placeholder: "e.g. Operations",
        },

        {
            key: "applies_to_types",
            label: "Applies To Types",
            type: "text",
            placeholder: "Applies To Types",
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Description...",
        },
        { key: "escalation_after_hours", label: "Escalation After Hours", type: "number", min: 0 },
        {
            key: "escalation_to",
            label: "Escalation To",
            type: "text",
            placeholder: "Escalation To",
        },
        { key: "resolution_time_hours", label: "Resolution Time Hours", type: "number", min: 0 },
        { key: "response_time_hours", label: "Response Time Hours", type: "number", min: 0 },
    ],
};

// ─── Email Integration ───

export const CREATE_EMAIL_ACCOUNT_CONFIG: CreateEntityConfig = {
    entityName: "Email Account",
    description: "Connect an email account for bi-directional sync.",
    fields: [
        {
            key: "email",
            label: "Email Address",
            type: "email",
            placeholder: "team@company.com",
            required: true,
        },
        {
            key: "provider",
            label: "Provider",
            type: "select",
            options: mapToOptions(EMAIL_PROVIDER_MAP),
            required: true,
        },
        {
            key: "label",
            label: "Account Label",
            type: "text",
            placeholder: "e.g. Sales Inbox",
        },
    ],
};

export const CREATE_LIVE_EVENT_INSTANCE_CONFIG: CreateEntityConfig = {
    entityName: "Live Event Instance",
    description: "Create a new live event instance for real-time operations tracking.",
    fields: [
        {
            key: "event_id",
            label: "Event",
            type: "entity-lookup",
            placeholder: "Select linked event",
            required: true,
            lookupConfig: FK_LOOKUP_CONFIGS.event_id,
        },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            placeholder: "Select linked project",
            required: true,
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        {
            key: "permitted_capacity",
            label: "Permitted Capacity",
            type: "number",
            placeholder: "e.g. 5000",
        },
        {
            key: "venue_capacity",
            label: "Venue Capacity",
            type: "number",
            placeholder: "e.g. 8000",
        },
        {
            key: "scheduled_load_in",
            label: "Scheduled Load-In",
            type: "datetime-local",
        },
        {
            key: "scheduled_doors",
            label: "Scheduled Doors",
            type: "datetime-local",
        },
        {
            key: "scheduled_show_start",
            label: "Scheduled Show Start",
            type: "datetime-local",
        },
        {
            key: "notes",
            label: "Notes",
            type: "textarea",
            placeholder: "Operational notes for this event instance...",
        },
    ],
};
