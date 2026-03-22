import type { CreateEntityConfig } from "@/components/app/create-entity-dialog";
import { FK_LOOKUP_CONFIGS } from "@/config/entity-lookup-configs";
import {
    ACCOUNT_RISK_LEVEL_MAP,
    BOM_STATUS_MAP,
    BOM_TYPE_MAP,
    CAMPAIGN_ASSET_PRODUCTION_STATUS_MAP,
    CHANNEL_CATEGORY_MAP,
    COMMAND_LAYER_MAP,
    COMPLIANCE_POLICY_TYPE_MAP,
    CREATIVE_BRIEF_STATUS_MAP,
    CREATIVE_BRIEF_TYPE_MAP,
    CREATIVE_REVIEW_STATUS_MAP,
    DOCUMENT_STATUS_MAP,
    EQUIPMENT_LIVE_STATUS_MAP,
    FOH_ZONE_TYPE_MAP,
    GUEST_INCIDENT_SEVERITY_MAP,
    GUEST_INCIDENT_TYPE_MAP,
    INVENTORY_AUDIT_STATUS_MAP,
    KIT_STATUS_MAP,
    LOAD_PLAN_STATUS_MAP,
    PRODUCTION_RUN_STATUS_MAP,
    QC_GATE_STATUS_MAP,
    QC_GATE_TYPE_MAP,
    RIGHTS_TYPE_MAP,
    RISK_LEVEL_MAP,
    SPACE_BOOKING_STATUS_MAP,
    STAKEHOLDER_TYPE_MAP,
    STRIKE_DIRECTION_MAP,
    SURVEY_TYPE_MAP,
    VIP_TIER_MAP,
    WORK_PACKAGE_STATUS_MAP,
    WORKFLOW_STATUS_MAP,
} from "@/config/domain-config";

import { mapToOptions, YES_NO_OPTIONS } from "@/config/config-utils";

// ═══════════════════════════════════════════════════════════════
// PHASE H — Complete Create Form Coverage
// ═══════════════════════════════════════════════════════════════

// ─── Approvals ───

export const CREATE_APPROVAL_CONFIG: CreateEntityConfig = {
    entityName: "Approval",
    description: "Create a new approval request.",
    fields: [
        {
            key: "title",
            label: "Title",
            type: "text",
            placeholder: "e.g. Budget Approval Q3",
            required: true,
        },
        {
            key: "entity_type",
            label: "Entity Type",
            type: "text",
            placeholder: "e.g. budget",
            required: true,
        },
        {
            key: "entity_id",
            label: "Entity",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
            required: true,
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Reason for approval",
        },
        {
            key: "priority",
            label: "Priority",
            type: "select",
            options: [
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "urgent", label: "Urgent" },
            ],
        },
    ],
};

// ─── Asset Management ───

export const CREATE_ASSET_ASSIGNMENT_CONFIG: CreateEntityConfig = {
    entityName: "Asset Assignment",
    description: "Assign an asset to a person or project.",
    fields: [
        {
            key: "asset_id",
            label: "Asset",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.asset_id,
            required: true,
        },
        {
            key: "assigned_to",
            label: "Assigned To",
            type: "text",
            placeholder: "Person or project ID",
            required: true,
        },
        {
            key: "assignment_type",
            label: "Type",
            type: "select",
            options: [
                { value: "person", label: "Person" },
                { value: "project", label: "Project" },
                { value: "location", label: "Location" },
                { value: "department", label: "Department" },
            ],
        },
        { key: "start_date", label: "Start Date", type: "date", required: true },
        { key: "end_date", label: "End Date", type: "date" },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

export const CREATE_ASSET_TAG_CONFIG: CreateEntityConfig = {
    entityName: "Asset Tag",
    description: "Create a tag for categorizing assets.",
    fields: [
        {
            key: "name",
            label: "Tag Name",
            type: "text",
            placeholder: "e.g. Fragile",
            required: true,
        },
        { key: "color", label: "Color", type: "text", placeholder: "#FF5733" },
        { key: "description", label: "Description", type: "textarea" },
    ],
};

// ─── Automation ───

export const CREATE_AUTOMATION_RULE_CONFIG: CreateEntityConfig = {
    entityName: "Automation Rule",
    description: "Add a rule to an automation workflow.",
    fields: [
        {
            key: "automation_id",
            label: "Automation",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.automation_id,
            required: true,
        },
        {
            key: "name",
            label: "Rule Name",
            type: "text",
            placeholder: "e.g. Check budget threshold",
            required: true,
        },
        {
            key: "rule_type",
            label: "Type",
            type: "select",
            options: [
                { value: "condition", label: "Condition" },
                { value: "action", label: "Action" },
                { value: "delay", label: "Delay" },
                { value: "branch", label: "Branch" },
            ],
        },
        { key: "sort_order", label: "Order", type: "number", placeholder: "0" },
    ],
};

// ─── Bill of Materials ───

export const CREATE_BOM_CONFIG: CreateEntityConfig = {
    entityName: "Bill of Materials",
    description: "Create a new BOM for a project or event.",
    fields: [
        {
            key: "name",
            label: "BOM Name",
            type: "text",
            placeholder: "e.g. Stage Setup BOM",
            required: true,
        },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "status", label: "Status", type: "select", options: mapToOptions(BOM_STATUS_MAP) },
        { key: "bom_type", label: "Type", type: "select", options: mapToOptions(BOM_TYPE_MAP) },
        { key: "description", label: "Description", type: "textarea" },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

// ─── Brand ───

export const CREATE_BRAND_CONFIG: CreateEntityConfig = {
    entityName: "Brand",
    description: "Create a new brand entity.",
    fields: [
        {
            key: "name",
            label: "Brand Name",
            type: "text",
            placeholder: "e.g. Acme Corp",
            required: true,
        },
        { key: "description", label: "Description", type: "textarea" },
        { key: "logo_url", label: "Logo URL", type: "url", placeholder: "https://..." },
        { key: "primary_color", label: "Primary Color", type: "text", placeholder: "#000000" },
    ],
};

// ─── Brief Templates ───

export const CREATE_BRIEF_TEMPLATE_CONFIG: CreateEntityConfig = {
    entityName: "Brief Template",
    description: "Create a reusable brief template.",
    fields: [
        {
            key: "name",
            label: "Template Name",
            type: "text",
            placeholder: "e.g. Event Brief Template",
            required: true,
        },
        { key: "description", label: "Description", type: "textarea" },
        {
            key: "brief_type",
            label: "Brief Type",
            type: "select",
            options: mapToOptions(CREATIVE_BRIEF_TYPE_MAP),
        },
        { key: "is_active", label: "Active", type: "select", options: YES_NO_OPTIONS },
    ],
};

// ─── Budget Approval ───

export const CREATE_BUDGET_APPROVAL_CONFIG: CreateEntityConfig = {
    entityName: "Budget Approval",
    description: "Request budget approval.",
    fields: [
        {
            key: "budget_id",
            label: "Budget",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.budget_id,
            required: true,
        },
        {
            key: "approver_id",
            label: "Approver",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.approver_id,
            required: true,
        },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

// ─── Calendar Event ───

export const CREATE_CALENDAR_EVENT_CONFIG: CreateEntityConfig = {
    entityName: "Calendar Event",
    description: "Create a new calendar event.",
    fields: [
        {
            key: "title",
            label: "Title",
            type: "text",
            placeholder: "e.g. Production Meeting",
            required: true,
        },
        { key: "start_time", label: "Start Time", type: "datetime-local", required: true },
        { key: "end_time", label: "End Time", type: "datetime-local" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "location", label: "Location", type: "text", placeholder: "e.g. Studio A" },
    ],
};

// ─── Checklist Template ───

export const CREATE_CHECKLIST_TEMPLATE_CONFIG: CreateEntityConfig = {
    entityName: "Checklist Template",
    description: "Create a reusable checklist template.",
    fields: [
        {
            key: "name",
            label: "Template Name",
            type: "text",
            placeholder: "e.g. Pre-Event Checklist",
            required: true,
        },
        { key: "description", label: "Description", type: "textarea" },
        { key: "category", label: "Category", type: "text", placeholder: "e.g. Safety" },
        { key: "is_active", label: "Active", type: "select", options: YES_NO_OPTIONS },
    ],
};

// ─── Clause Library ───

export const CREATE_CLAUSE_LIBRARY_ENTRY_CONFIG: CreateEntityConfig = {
    entityName: "Clause Library Entry",
    description: "Add a clause to the library for contract reuse.",
    fields: [
        {
            key: "title",
            label: "Clause Title",
            type: "text",
            placeholder: "e.g. Force Majeure",
            required: true,
        },
        { key: "body", label: "Clause Text", type: "textarea", required: true },
        { key: "category", label: "Category", type: "text", placeholder: "e.g. Legal" },
        { key: "is_active", label: "Active", type: "select", options: YES_NO_OPTIONS },
    ],
};

// ─── Compliance Requirement ───

export const CREATE_COMPLIANCE_REQUIREMENT_CONFIG: CreateEntityConfig = {
    entityName: "Compliance Requirement",
    description: "Define a compliance requirement.",
    fields: [
        {
            key: "name",
            label: "Requirement",
            type: "text",
            placeholder: "e.g. Fire safety certificate",
            required: true,
        },
        {
            key: "policy_type",
            label: "Policy Type",
            type: "select",
            options: mapToOptions(COMPLIANCE_POLICY_TYPE_MAP),
        },
        { key: "description", label: "Description", type: "textarea" },
        { key: "due_date", label: "Due Date", type: "date" },
    ],
};

// ─── Consumable ───

export const CREATE_CONSUMABLE_CONFIG: CreateEntityConfig = {
    entityName: "Consumable",
    description: "Track a consumable inventory item.",
    fields: [
        {
            key: "name",
            label: "Name",
            type: "text",
            placeholder: "e.g. Gaffer Tape",
            required: true,
        },
        { key: "category", label: "Category", type: "text", placeholder: "e.g. Tape & Adhesive" },
        { key: "unit", label: "Unit", type: "text", placeholder: "e.g. rolls" },
        { key: "quantity_on_hand", label: "Qty On Hand", type: "number", placeholder: "0" },
        { key: "reorder_point", label: "Reorder Point", type: "number", placeholder: "10" },
    ],
};

// ─── Contract Amendment ───

export const CREATE_CONTRACT_AMENDMENT_CONFIG: CreateEntityConfig = {
    entityName: "Contract Amendment",
    description: "Create an amendment to an existing contract.",
    fields: [
        {
            key: "contract_id",
            label: "Contract",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.contract_id,
            required: true,
        },
        {
            key: "title",
            label: "Title",
            type: "text",
            placeholder: "e.g. Scope Extension",
            required: true,
        },
        { key: "description", label: "Description", type: "textarea" },
        { key: "effective_date", label: "Effective Date", type: "date" },
        { key: "value_change", label: "Value Change ($)", type: "number", placeholder: "0" },
    ],
};

// ─── Creative Brief ───

export const CREATE_CREATIVE_BRIEF_CONFIG: CreateEntityConfig = {
    entityName: "Creative Brief",
    description: "Create a new creative brief.",
    fields: [
        {
            key: "title",
            label: "Title",
            type: "text",
            placeholder: "e.g. Product Launch Campaign Brief",
            required: true,
        },
        {
            key: "brief_type",
            label: "Type",
            type: "select",
            options: mapToOptions(CREATIVE_BRIEF_TYPE_MAP),
        },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: mapToOptions(CREATIVE_BRIEF_STATUS_MAP),
        },
        { key: "description", label: "Description", type: "textarea" },
        { key: "objectives", label: "Objectives", type: "textarea" },
    ],
};

// ─── Creative Review ───

export const CREATE_CREATIVE_REVIEW_CONFIG: CreateEntityConfig = {
    entityName: "Creative Review",
    description: "Submit a creative asset for review.",
    fields: [
        {
            key: "title",
            label: "Title",
            type: "text",
            placeholder: "e.g. Logo V2 Review",
            required: true,
        },
        {
            key: "asset_id",
            label: "Asset",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.asset_id,
        },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: mapToOptions(CREATIVE_REVIEW_STATUS_MAP),
        },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

// ─── Credential Type ───

export const CREATE_CREDENTIAL_TYPE_CONFIG: CreateEntityConfig = {
    entityName: "Credential Type",
    description: "Define a type of credential/badge.",
    fields: [
        {
            key: "name",
            label: "Type Name",
            type: "text",
            placeholder: "e.g. VIP All-Access",
            required: true,
        },
        { key: "category", label: "Category", type: "text", placeholder: "e.g. Backstage" },
        { key: "access_level", label: "Access Level", type: "text", placeholder: "e.g. Full" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "requires_photo", label: "Requires Photo", type: "select", options: YES_NO_OPTIONS },
    ],
};

// ─── Crew ───

export const CREATE_CREW_MEMBER_CONFIG: CreateEntityConfig = {
    entityName: "Crew Member",
    description: "Add a new crew member.",
    fields: [
        { key: "first_name", label: "First Name", type: "text", required: true },
        { key: "last_name", label: "Last Name", type: "text", required: true },
        { key: "email", label: "Email", type: "email" },
        { key: "phone", label: "Phone", type: "text", placeholder: "+1 555-0100" },
        { key: "department", label: "Department", type: "text", placeholder: "e.g. Lighting" },
        { key: "role", label: "Role", type: "text", placeholder: "e.g. Technician" },
    ],
};

export const CREATE_CREW_AVAILABILITY_CONFIG: CreateEntityConfig = {
    entityName: "Crew Availability",
    description: "Record crew member availability.",
    fields: [
        {
            key: "crew_member_id",
            label: "Crew Member",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.crew_member_id,
            required: true,
        },
        { key: "date", label: "Date", type: "date", required: true },
        { key: "is_available", label: "Available", type: "select", options: YES_NO_OPTIONS },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

// ─── Custom Field Definition ───

export const CREATE_CUSTOM_FIELD_DEFINITION_CONFIG: CreateEntityConfig = {
    entityName: "Custom Field Definition",
    description: "Define a custom field for entities.",
    fields: [
        {
            key: "name",
            label: "Field Name",
            type: "text",
            placeholder: "e.g. Priority Score",
            required: true,
        },
        {
            key: "field_key",
            label: "Field Key",
            type: "text",
            placeholder: "e.g. priority_score",
            required: true,
        },
        {
            key: "field_type",
            label: "Field Type",
            type: "select",
            options: [
                { value: "text", label: "Text" },
                { value: "number", label: "Number" },
                { value: "date", label: "Date" },
                { value: "select", label: "Select" },
                { value: "boolean", label: "Boolean" },
                { value: "currency", label: "Currency" },
            ],
            required: true,
        },
        { key: "is_required", label: "Required", type: "select", options: YES_NO_OPTIONS },
    ],
};

// ─── Depreciation Schedule ───

export const CREATE_DEPRECIATION_SCHEDULE_CONFIG: CreateEntityConfig = {
    entityName: "Depreciation Schedule",
    description: "Create a depreciation schedule for an asset.",
    fields: [
        {
            key: "asset_id",
            label: "Asset",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.asset_id,
            required: true,
        },
        {
            key: "method",
            label: "Method",
            type: "select",
            options: [
                { value: "straight_line", label: "Straight Line" },
                { value: "declining_balance", label: "Declining Balance" },
                { value: "units_of_production", label: "Units of Production" },
            ],
        },
        {
            key: "useful_life_months",
            label: "Useful Life (months)",
            type: "number",
            required: true,
        },
        { key: "salvage_value", label: "Salvage Value ($)", type: "number", placeholder: "0" },
        { key: "start_date", label: "Start Date", type: "date", required: true },
    ],
};

// ─── Document Template ───

export const CREATE_DOCUMENT_TEMPLATE_CONFIG: CreateEntityConfig = {
    entityName: "Document Template",
    description: "Create a reusable document template.",
    fields: [
        {
            key: "name",
            label: "Template Name",
            type: "text",
            placeholder: "e.g. NDA Template",
            required: true,
        },
        { key: "category", label: "Category", type: "text", placeholder: "e.g. Legal" },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: mapToOptions(DOCUMENT_STATUS_MAP),
        },
        { key: "description", label: "Description", type: "textarea" },
    ],
};

// ─── E-Signature ───

export const CREATE_E_SIGNATURE_CONFIG: CreateEntityConfig = {
    entityName: "E-Signature",
    description: "Send a document for electronic signature.",
    fields: [
        {
            key: "document_id",
            label: "Document",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.document_id,
            required: true,
        },
        {
            key: "signer_id",
            label: "Signer",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.signer_id,
            required: true,
        },
        { key: "due_date", label: "Due Date", type: "date" },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

// ─── Expense Report ───

export const CREATE_EXPENSE_REPORT_CONFIG: CreateEntityConfig = {
    entityName: "Expense Report",
    description: "Submit a new expense report.",
    fields: [
        {
            key: "title",
            label: "Report Title",
            type: "text",
            placeholder: "e.g. Q3 Travel Expenses",
            required: true,
        },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "period_start", label: "Period Start", type: "date" },
        { key: "period_end", label: "Period End", type: "date" },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

// ─── FOH Zone ───

export const CREATE_FOH_ZONE_CONFIG: CreateEntityConfig = {
    entityName: "FOH Zone",
    description: "Define a front-of-house zone.",
    fields: [
        {
            key: "name",
            label: "Zone Name",
            type: "text",
            placeholder: "e.g. Main Entrance",
            required: true,
        },
        {
            key: "zone_type",
            label: "Zone Type",
            type: "select",
            options: mapToOptions(FOH_ZONE_TYPE_MAP),
        },
        { key: "capacity", label: "Capacity", type: "number" },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

// ─── Guest Incident ───

export const CREATE_GUEST_INCIDENT_CONFIG: CreateEntityConfig = {
    entityName: "Guest Incident",
    description: "Report a guest incident at an event.",
    fields: [
        {
            key: "incident_type",
            label: "Type",
            type: "select",
            options: mapToOptions(GUEST_INCIDENT_TYPE_MAP),
            required: true,
        },
        {
            key: "severity",
            label: "Severity",
            type: "select",
            options: mapToOptions(GUEST_INCIDENT_SEVERITY_MAP),
        },
        { key: "description", label: "Description", type: "textarea", required: true },
        { key: "guest_name", label: "Guest Name", type: "text" },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

// ─── HR Certification ───

export const CREATE_HR_CERTIFICATION_CONFIG: CreateEntityConfig = {
    entityName: "HR Certification",
    description: "Record a worker certification.",
    fields: [
        {
            key: "name",
            label: "Certification Name",
            type: "text",
            placeholder: "e.g. OSHA 30-Hour",
            required: true,
        },
        { key: "issuing_body", label: "Issuing Body", type: "text", placeholder: "e.g. OSHA" },
        { key: "certification_number", label: "Cert Number", type: "text" },
        { key: "issued_date", label: "Issued Date", type: "date" },
        { key: "expiry_date", label: "Expiry Date", type: "date" },
    ],
};

// ─── Insurance Requirement ───

export const CREATE_INSURANCE_REQUIREMENT_CONFIG: CreateEntityConfig = {
    entityName: "Insurance Requirement",
    description: "Define an insurance requirement.",
    fields: [
        {
            key: "name",
            label: "Requirement",
            type: "text",
            placeholder: "e.g. General Liability $1M",
            required: true,
        },
        {
            key: "coverage_type",
            label: "Coverage Type",
            type: "text",
            placeholder: "e.g. General Liability",
        },
        { key: "minimum_amount", label: "Minimum Amount ($)", type: "number" },
        { key: "description", label: "Description", type: "textarea" },
    ],
};

// ─── Inventory Audit ───

export const CREATE_INVENTORY_AUDIT_CONFIG: CreateEntityConfig = {
    entityName: "Inventory Audit",
    description: "Schedule an inventory audit.",
    fields: [
        {
            key: "name",
            label: "Audit Name",
            type: "text",
            placeholder: "e.g. Q4 Warehouse Audit",
            required: true,
        },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: mapToOptions(INVENTORY_AUDIT_STATUS_MAP),
        },
        { key: "scheduled_date", label: "Scheduled Date", type: "date" },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

// ─── Invoice Template ───

export const CREATE_INVOICE_TEMPLATE_CONFIG: CreateEntityConfig = {
    entityName: "Invoice Template",
    description: "Create a reusable invoice template.",
    fields: [
        {
            key: "name",
            label: "Template Name",
            type: "text",
            placeholder: "e.g. Standard Invoice",
            required: true,
        },
        { key: "description", label: "Description", type: "textarea" },
        { key: "is_default", label: "Default Template", type: "select", options: YES_NO_OPTIONS },
    ],
};

// ─── Job Cost Entry ───

export const CREATE_JOB_COST_ENTRY_CONFIG: CreateEntityConfig = {
    entityName: "Job Cost Entry",
    description: "Record a job cost entry.",
    fields: [
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
            required: true,
        },
        {
            key: "category",
            label: "Category",
            type: "text",
            placeholder: "e.g. Labor",
            required: true,
        },
        { key: "description", label: "Description", type: "textarea" },
        { key: "amount", label: "Amount ($)", type: "number", required: true },
        { key: "date", label: "Date", type: "date" },
    ],
};

// ─── Kit ───

export const CREATE_KIT_CONFIG: CreateEntityConfig = {
    entityName: "Kit",
    description: "Create an equipment kit.",
    fields: [
        {
            key: "name",
            label: "Kit Name",
            type: "text",
            placeholder: "e.g. Lighting Kit A",
            required: true,
        },
        { key: "category", label: "Category", type: "text", placeholder: "e.g. Lighting" },
        { key: "status", label: "Status", type: "select", options: mapToOptions(KIT_STATUS_MAP) },
        { key: "description", label: "Description", type: "textarea" },
    ],
};

// ─── Knowledge Base Article ───

export const CREATE_KNOWLEDGE_BASE_ARTICLE_CONFIG: CreateEntityConfig = {
    entityName: "Knowledge Base Article",
    description: "Create a new knowledge base article.",
    fields: [
        {
            key: "title",
            label: "Title",
            type: "text",
            placeholder: "e.g. How to setup audio",
            required: true,
        },
        { key: "category", label: "Category", type: "text", placeholder: "e.g. Technical" },
        { key: "content", label: "Content", type: "textarea" },
        { key: "is_published", label: "Publish", type: "select", options: YES_NO_OPTIONS },
    ],
};

// ─── Legal Hold ───

export const CREATE_LEGAL_HOLD_CONFIG: CreateEntityConfig = {
    entityName: "Legal Hold",
    description: "Place a legal hold on records.",
    fields: [
        {
            key: "name",
            label: "Hold Name",
            type: "text",
            placeholder: "e.g. Contract Dispute Hold",
            required: true,
        },
        { key: "hold_type", label: "Type", type: "text", placeholder: "e.g. Litigation" },
        { key: "start_date", label: "Start Date", type: "date", required: true },
        { key: "end_date", label: "End Date", type: "date" },
        { key: "description", label: "Description", type: "textarea" },
    ],
};

// ─── Live Event ───

export const CREATE_LIVE_EVENT_CONFIG: CreateEntityConfig = {
    entityName: "Live Event",
    description: "Create a new live event.",
    fields: [
        {
            key: "name",
            label: "Event Name",
            type: "text",
            placeholder: "e.g. Summer Concert Series",
            required: true,
        },
        { key: "event_date", label: "Event Date", type: "date", required: true },
        {
            key: "venue_id",
            label: "Venue",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.venue_id,
        },
        { key: "expected_attendance", label: "Expected Attendance", type: "number" },
        { key: "description", label: "Description", type: "textarea" },
    ],
};

// ─── Load Plan ───

export const CREATE_LOAD_PLAN_CONFIG: CreateEntityConfig = {
    entityName: "Load Plan",
    description: "Create a logistics load plan.",
    fields: [
        {
            key: "name",
            label: "Plan Name",
            type: "text",
            placeholder: "e.g. Truck 1 Load Out",
            required: true,
        },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: mapToOptions(LOAD_PLAN_STATUS_MAP),
        },
        { key: "departure_time", label: "Departure Time", type: "datetime-local" },
        { key: "arrival_time", label: "Arrival Time", type: "datetime-local" },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

// ─── Lost Reason ───

export const CREATE_LOST_REASON_CONFIG: CreateEntityConfig = {
    entityName: "Lost Reason",
    description: "Define a reason for losing a deal.",
    fields: [
        {
            key: "name",
            label: "Reason",
            type: "text",
            placeholder: "e.g. Price too high",
            required: true,
        },
        { key: "description", label: "Description", type: "textarea" },
        { key: "is_active", label: "Active", type: "select", options: YES_NO_OPTIONS },
    ],
};

// ─── Maintenance Record ───

export const CREATE_MAINTENANCE_RECORD_CONFIG: CreateEntityConfig = {
    entityName: "Maintenance Record",
    description: "Log a maintenance activity.",
    fields: [
        {
            key: "asset_id",
            label: "Asset",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.asset_id,
            required: true,
        },
        {
            key: "maintenance_type",
            label: "Type",
            type: "select",
            options: [
                { value: "preventive", label: "Preventive" },
                { value: "corrective", label: "Corrective" },
                { value: "emergency", label: "Emergency" },
                { value: "inspection", label: "Inspection" },
            ],
        },
        { key: "description", label: "Description", type: "textarea", required: true },
        { key: "scheduled_date", label: "Scheduled Date", type: "date" },
        { key: "cost", label: "Cost ($)", type: "number" },
    ],
};

// ─── Organization ───

export const CREATE_ORGANIZATION_CONFIG: CreateEntityConfig = {
    entityName: "Organization",
    description: "Create a new organization/tenant.",
    fields: [
        {
            key: "name",
            label: "Organization Name",
            type: "text",
            placeholder: "e.g. Acme Productions",
            required: true,
        },
        { key: "slug", label: "URL Slug", type: "text", placeholder: "e.g. acme-productions" },
        { key: "industry", label: "Industry", type: "text", placeholder: "e.g. Entertainment" },
    ],
};

// ─── Payment Approval ───

export const CREATE_PAYMENT_APPROVAL_CONFIG: CreateEntityConfig = {
    entityName: "Payment Approval",
    description: "Request payment approval.",
    fields: [
        {
            key: "payment_id",
            label: "Payment",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.payment_id,
            required: true,
        },
        {
            key: "approver_id",
            label: "Approver",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.approver_id,
            required: true,
        },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

// ─── Payroll Batch ───

export const CREATE_PAYROLL_BATCH_CONFIG: CreateEntityConfig = {
    entityName: "Payroll Batch",
    description: "Create a payroll processing batch.",
    fields: [
        {
            key: "name",
            label: "Batch Name",
            type: "text",
            placeholder: "e.g. January 2025 Payroll",
            required: true,
        },
        { key: "pay_period_start", label: "Period Start", type: "date", required: true },
        { key: "pay_period_end", label: "Period End", type: "date", required: true },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

// ─── Post Event Report ───

export const CREATE_POST_EVENT_REPORT_CONFIG: CreateEntityConfig = {
    entityName: "Post Event Report",
    description: "Create a post-event analysis report.",
    fields: [
        {
            key: "event_id",
            label: "Event",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.event_id,
            required: true,
        },
        {
            key: "title",
            label: "Report Title",
            type: "text",
            placeholder: "e.g. Summer Fest 2025 Debrief",
            required: true,
        },
        { key: "summary", label: "Summary", type: "textarea" },
        { key: "attendance", label: "Attendance", type: "number" },
        { key: "lessons_learned", label: "Lessons Learned", type: "textarea" },
    ],
};

// ─── Production ───

export const CREATE_PRODUCTION_ADVANCE_CONFIG: CreateEntityConfig = {
    entityName: "Production Advance",
    description: "Create a production advance checklist.",
    fields: [
        {
            key: "title",
            label: "Title",
            type: "text",
            placeholder: "e.g. Venue Advance",
            required: true,
        },
        {
            key: "advance_type",
            label: "Type",
            type: "text",
            placeholder: "e.g. venue",
            required: true,
        },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "due_date", label: "Due Date", type: "date" },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

export const CREATE_PRODUCTION_CHECKLIST_CONFIG: CreateEntityConfig = {
    entityName: "Production Checklist",
    description: "Create a production checklist.",
    fields: [
        {
            key: "name",
            label: "Checklist Name",
            type: "text",
            placeholder: "e.g. Load-In Checklist",
            required: true,
        },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "department", label: "Department", type: "text", placeholder: "e.g. Audio" },
        { key: "description", label: "Description", type: "textarea" },
    ],
};

export const CREATE_PRODUCTION_EXPENSE_CONFIG: CreateEntityConfig = {
    entityName: "Production Expense",
    description: "Log a production expense.",
    fields: [
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
            required: true,
        },
        {
            key: "category",
            label: "Category",
            type: "text",
            placeholder: "e.g. Equipment Rental",
            required: true,
        },
        { key: "description", label: "Description", type: "textarea" },
        { key: "amount", label: "Amount ($)", type: "number", required: true },
        { key: "date", label: "Date", type: "date" },
    ],
};

export const CREATE_PRODUCTION_MILESTONE_CONFIG: CreateEntityConfig = {
    entityName: "Production Milestone",
    description: "Define a production milestone.",
    fields: [
        {
            key: "name",
            label: "Milestone",
            type: "text",
            placeholder: "e.g. First Edit Complete",
            required: true,
        },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "due_date", label: "Due Date", type: "date" },
        { key: "description", label: "Description", type: "textarea" },
    ],
};

export const CREATE_PRODUCTION_RUN_CONFIG: CreateEntityConfig = {
    entityName: "Production Run",
    description: "Create a production run.",
    fields: [
        {
            key: "name",
            label: "Run Name",
            type: "text",
            placeholder: "e.g. Day 1 Shoot",
            required: true,
        },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
            required: true,
        },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: mapToOptions(PRODUCTION_RUN_STATUS_MAP),
        },
        { key: "start_date", label: "Start Date", type: "date" },
        { key: "end_date", label: "End Date", type: "date" },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

export const CREATE_PRODUCTION_SOP_CONFIG: CreateEntityConfig = {
    entityName: "Production SOP",
    description: "Create a standard operating procedure.",
    fields: [
        {
            key: "title",
            label: "SOP Title",
            type: "text",
            placeholder: "e.g. Rigging Safety Protocol",
            required: true,
        },
        { key: "department", label: "Department", type: "text", placeholder: "e.g. Rigging" },
        { key: "content", label: "Content", type: "textarea" },
        { key: "version", label: "Version", type: "text", placeholder: "1.0" },
    ],
};

export const CREATE_PRODUCTION_TASK_CONFIG: CreateEntityConfig = {
    entityName: "Production Task",
    description: "Create a production task.",
    fields: [
        {
            key: "name",
            label: "Task Name",
            type: "text",
            placeholder: "e.g. Build Stage Right",
            required: true,
        },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
            required: true,
        },
        { key: "department", label: "Department", type: "text", placeholder: "e.g. Staging" },
        {
            key: "priority",
            label: "Priority",
            type: "select",
            options: [
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "critical", label: "Critical" },
            ],
        },
        { key: "due_date", label: "Due Date", type: "date" },
    ],
};

export const CREATE_PRODUCTION_VERTICAL_CONFIG: CreateEntityConfig = {
    entityName: "Production Vertical",
    description: "Define a production vertical.",
    fields: [
        {
            key: "name",
            label: "Vertical Name",
            type: "text",
            placeholder: "e.g. Live Events",
            required: true,
        },
        { key: "code", label: "Code", type: "text", placeholder: "e.g. LIVE" },
        { key: "description", label: "Description", type: "textarea" },
    ],
};

// ─── QC Gate ───

export const CREATE_QC_GATE_CONFIG: CreateEntityConfig = {
    entityName: "QC Gate",
    description: "Define a quality control gate.",
    fields: [
        {
            key: "name",
            label: "Gate Name",
            type: "text",
            placeholder: "e.g. Pre-Show QC",
            required: true,
        },
        {
            key: "gate_type",
            label: "Type",
            type: "select",
            options: mapToOptions(QC_GATE_TYPE_MAP),
        },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: mapToOptions(QC_GATE_STATUS_MAP),
        },
        { key: "criteria", label: "Criteria", type: "textarea" },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

// ─── Quality Check Template ───

export const CREATE_QUALITY_CHECK_TEMPLATE_CONFIG: CreateEntityConfig = {
    entityName: "Quality Check Template",
    description: "Create a reusable quality check template.",
    fields: [
        {
            key: "name",
            label: "Template Name",
            type: "text",
            placeholder: "e.g. Audio QC Checklist",
            required: true,
        },
        {
            key: "entity_type",
            label: "Entity Type",
            type: "text",
            placeholder: "e.g. asset",
            required: true,
        },
        { key: "passing_score", label: "Passing Score (%)", type: "number", placeholder: "80" },
        { key: "description", label: "Description", type: "textarea" },
    ],
};

// ─── Report Definition ───

export const CREATE_REPORT_DEFINITION_CONFIG: CreateEntityConfig = {
    entityName: "Report Definition",
    description: "Define a custom report.",
    fields: [
        {
            key: "name",
            label: "Report Name",
            type: "text",
            placeholder: "e.g. Monthly Revenue Report",
            required: true,
        },
        { key: "description", label: "Description", type: "textarea" },
        { key: "report_type", label: "Type", type: "text", placeholder: "e.g. financial" },
    ],
};

// ─── Resilience Target ───

export const CREATE_RESILIENCE_TARGET_CONFIG: CreateEntityConfig = {
    entityName: "Resilience Target",
    description: "Define a resilience/recovery target.",
    fields: [
        {
            key: "name",
            label: "Target Name",
            type: "text",
            placeholder: "e.g. API Uptime 99.9%",
            required: true,
        },
        { key: "target_value", label: "Target Value", type: "number" },
        { key: "description", label: "Description", type: "textarea" },
    ],
};

// ─── Revenue Schedule ───

export const CREATE_REVENUE_SCHEDULE_CONFIG: CreateEntityConfig = {
    entityName: "Revenue Schedule",
    description: "Create a revenue recognition schedule.",
    fields: [
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
            required: true,
        },
        { key: "total_amount", label: "Total Amount ($)", type: "number", required: true },
        {
            key: "recognition_method",
            label: "Method",
            type: "select",
            options: [
                { value: "straight_line", label: "Straight Line" },
                { value: "percentage_completion", label: "% Completion" },
                { value: "milestone", label: "Milestone" },
                { value: "manual", label: "Manual" },
            ],
        },
        { key: "start_date", label: "Start Date", type: "date", required: true },
        { key: "end_date", label: "End Date", type: "date" },
    ],
};

// ─── Review ───

export const CREATE_REVIEW_CONFIG: CreateEntityConfig = {
    entityName: "Review",
    description: "Create a performance review.",
    fields: [
        {
            key: "subject_id",
            label: "Subject",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.subject_id,
            required: true,
        },
        { key: "review_type", label: "Type", type: "text", placeholder: "e.g. annual" },
        { key: "summary", label: "Summary", type: "textarea" },
    ],
};

export const CREATE_REVIEW_CYCLE_CONFIG: CreateEntityConfig = {
    entityName: "Review Cycle",
    description: "Create a review cycle.",
    fields: [
        {
            key: "name",
            label: "Cycle Name",
            type: "text",
            placeholder: "e.g. Annual Review 2025",
            required: true,
        },
        { key: "start_date", label: "Start Date", type: "date", required: true },
        { key: "end_date", label: "End Date", type: "date" },
        { key: "description", label: "Description", type: "textarea" },
    ],
};

// ─── RFQ ───

export const CREATE_RFQ_CONFIG: CreateEntityConfig = {
    entityName: "RFQ",
    description: "Create a Request for Quotation.",
    fields: [
        {
            key: "title",
            label: "RFQ Title",
            type: "text",
            placeholder: "e.g. AV Equipment RFQ",
            required: true,
        },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "due_date", label: "Response Due", type: "date" },
        { key: "description", label: "Description", type: "textarea" },
    ],
};

// ─── Rights ───

export const CREATE_RIGHTS_CONFIG: CreateEntityConfig = {
    entityName: "Rights",
    description: "Register intellectual property rights.",
    fields: [
        {
            key: "name",
            label: "Rights Name",
            type: "text",
            placeholder: "e.g. Music License",
            required: true,
        },
        {
            key: "rights_type",
            label: "Type",
            type: "select",
            options: mapToOptions(RIGHTS_TYPE_MAP),
        },
        { key: "start_date", label: "Start Date", type: "date" },
        { key: "end_date", label: "End Date", type: "date" },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

// ─── Risk Assessment ───

export const CREATE_RISK_ASSESSMENT_CONFIG: CreateEntityConfig = {
    entityName: "Risk Assessment",
    description: "Create a risk assessment.",
    fields: [
        {
            key: "name",
            label: "Risk Name",
            type: "text",
            placeholder: "e.g. Weather Disruption",
            required: true,
        },
        {
            key: "risk_level",
            label: "Risk Level",
            type: "select",
            options: mapToOptions(RISK_LEVEL_MAP),
        },
        { key: "description", label: "Description", type: "textarea" },
        { key: "mitigation", label: "Mitigation Plan", type: "textarea" },
    ],
};

// ─── SLA ───

export const CREATE_SLA_DEFINITION_CONFIG: CreateEntityConfig = {
    entityName: "SLA Definition",
    description: "Define a service level agreement.",
    fields: [
        {
            key: "name",
            label: "SLA Name",
            type: "text",
            placeholder: "e.g. Response within 4 hours",
            required: true,
        },
        { key: "target_hours", label: "Target (hours)", type: "number", required: true },
        {
            key: "priority",
            label: "Priority",
            type: "select",
            options: [
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "critical", label: "Critical" },
            ],
        },
        { key: "description", label: "Description", type: "textarea" },
    ],
};

// ─── Space Booking ───

export const CREATE_SPACE_BOOKING_CONFIG: CreateEntityConfig = {
    entityName: "Space Booking",
    description: "Book a space or venue.",
    fields: [
        {
            key: "space_id",
            label: "Space",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.space_id,
            required: true,
        },
        { key: "start_time", label: "Start Time", type: "datetime-local", required: true },
        { key: "end_time", label: "End Time", type: "datetime-local", required: true },
        { key: "purpose", label: "Purpose", type: "text", placeholder: "e.g. Rehearsal" },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: mapToOptions(SPACE_BOOKING_STATUS_MAP),
        },
    ],
};

// ─── Stakeholder ───

export const CREATE_STAKEHOLDER_CONFIG: CreateEntityConfig = {
    entityName: "Stakeholder",
    description: "Add a project stakeholder.",
    fields: [
        {
            key: "name",
            label: "Name",
            type: "text",
            placeholder: "e.g. John Smith",
            required: true,
        },
        {
            key: "stakeholder_type",
            label: "Type",
            type: "select",
            options: mapToOptions(STAKEHOLDER_TYPE_MAP),
        },
        { key: "email", label: "Email", type: "email" },
        { key: "role", label: "Role", type: "text", placeholder: "e.g. Executive Sponsor" },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

// ─── Strike Sequence ───

export const CREATE_STRIKE_SEQUENCE_CONFIG: CreateEntityConfig = {
    entityName: "Strike Sequence",
    description: "Define a strike/tear-down sequence.",
    fields: [
        {
            key: "event_id",
            label: "Event",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.event_id,
            required: true,
        },
        {
            key: "name",
            label: "Sequence Name",
            type: "text",
            placeholder: "e.g. Stage Strike",
            required: true,
        },
        { key: "department", label: "Department", type: "text", placeholder: "e.g. Staging" },
        {
            key: "direction",
            label: "Direction",
            type: "select",
            options: mapToOptions(STRIKE_DIRECTION_MAP),
        },
        { key: "estimated_duration_minutes", label: "Est. Duration (min)", type: "number" },
    ],
};

// ─── Survey Template ───

export const CREATE_SURVEY_TEMPLATE_CONFIG: CreateEntityConfig = {
    entityName: "Survey Template",
    description: "Create a survey template.",
    fields: [
        {
            key: "name",
            label: "Survey Name",
            type: "text",
            placeholder: "e.g. Post-Event Satisfaction",
            required: true,
        },
        {
            key: "survey_type",
            label: "Type",
            type: "select",
            options: mapToOptions(SURVEY_TYPE_MAP),
        },
        { key: "description", label: "Description", type: "textarea" },
    ],
};

// ─── Technical Spec ───

export const CREATE_TECHNICAL_SPEC_CONFIG: CreateEntityConfig = {
    entityName: "Technical Spec",
    description: "Create a technical specification.",
    fields: [
        {
            key: "name",
            label: "Spec Name",
            type: "text",
            placeholder: "e.g. Stage Rigging Spec",
            required: true,
        },
        { key: "spec_type", label: "Type", type: "text", placeholder: "e.g. Rigging" },
        { key: "version", label: "Version", type: "text", placeholder: "1.0" },
        { key: "content", label: "Content", type: "textarea" },
    ],
};

// ─── Temporary Access Grant ───

export const CREATE_TEMPORARY_ACCESS_GRANT_CONFIG: CreateEntityConfig = {
    entityName: "Temporary Access Grant",
    description: "Grant temporary access to a user.",
    fields: [
        {
            key: "grantee_id",
            label: "Grantee",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.grantee_id,
            required: true,
        },
        {
            key: "resource_type",
            label: "Resource Type",
            type: "text",
            placeholder: "e.g. project",
            required: true,
        },
        {
            key: "resource_id",
            label: "Resource",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.resource_id,
            required: true,
        },
        { key: "expires_at", label: "Expires At", type: "datetime-local", required: true },
        { key: "reason", label: "Reason", type: "textarea" },
    ],
};

// ─── Testimonial ───

export const CREATE_TESTIMONIAL_CONFIG: CreateEntityConfig = {
    entityName: "Testimonial",
    description: "Capture a client testimonial.",
    fields: [
        { key: "quote", label: "Quote", type: "textarea", required: true },
        { key: "full_testimonial", label: "Full Testimonial", type: "textarea" },
        { key: "rating", label: "Rating (1-5)", type: "number" },
        { key: "category", label: "Category", type: "text", placeholder: "e.g. Service Quality" },
    ],
};

// ─── Timesheet ───

export const CREATE_TIMESHEET_CONFIG: CreateEntityConfig = {
    entityName: "Timesheet",
    description: "Submit a timesheet.",
    fields: [
        { key: "week_start", label: "Week Starting", type: "date", required: true },
        { key: "total_hours", label: "Total Hours", type: "number" },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

// ─── Vendor Compliance Document ───

export const CREATE_VENDOR_COMPLIANCE_DOCUMENT_CONFIG: CreateEntityConfig = {
    entityName: "Vendor Compliance Document",
    description: "Upload a vendor compliance document.",
    fields: [
        {
            key: "vendor_id",
            label: "Vendor",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.vendor_id,
            required: true,
        },
        {
            key: "doc_type",
            label: "Document Type",
            type: "text",
            placeholder: "e.g. Insurance Certificate",
            required: true,
        },
        { key: "name", label: "Document Name", type: "text", required: true },
        { key: "expiry_date", label: "Expiry Date", type: "date" },
    ],
};

// ─── VIP Guest ───

export const CREATE_VIP_GUEST_CONFIG: CreateEntityConfig = {
    entityName: "VIP Guest",
    description: "Register a VIP guest.",
    fields: [
        {
            key: "name",
            label: "Guest Name",
            type: "text",
            placeholder: "e.g. Jane Doe",
            required: true,
        },
        { key: "email", label: "Email", type: "email" },
        { key: "phone", label: "Phone", type: "text", placeholder: "+1 555-0100" },
        { key: "company", label: "Company", type: "text" },
        { key: "vip_tier", label: "VIP Tier", type: "select", options: mapToOptions(VIP_TIER_MAP) },
        { key: "special_requirements", label: "Special Requirements", type: "textarea" },
    ],
};

export const CREATE_VIP_SERVICE_REQUEST_CONFIG: CreateEntityConfig = {
    entityName: "VIP Service Request",
    description: "Create a VIP service request.",
    fields: [
        {
            key: "request_type",
            label: "Request Type",
            type: "text",
            placeholder: "e.g. Transportation",
            required: true,
        },
        { key: "description", label: "Description", type: "textarea", required: true },
        {
            key: "priority",
            label: "Priority",
            type: "select",
            options: [
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "urgent", label: "Urgent" },
            ],
        },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

// ─── Workflow ───

export const CREATE_WORKFLOW_CONFIG: CreateEntityConfig = {
    entityName: "Workflow",
    description: "Create a new workflow definition.",
    fields: [
        {
            key: "name",
            label: "Workflow Name",
            type: "text",
            placeholder: "e.g. Invoice Approval Workflow",
            required: true,
        },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: mapToOptions(WORKFLOW_STATUS_MAP),
        },
        { key: "description", label: "Description", type: "textarea" },
        { key: "trigger_type", label: "Trigger", type: "text", placeholder: "e.g. on_create" },
    ],
};

// ─── Work Package ───

export const CREATE_WORK_PACKAGE_CONFIG: CreateEntityConfig = {
    entityName: "Work Package",
    description: "Create a work package.",
    fields: [
        {
            key: "name",
            label: "Package Name",
            type: "text",
            placeholder: "e.g. Stage Construction",
            required: true,
        },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
            required: true,
        },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: mapToOptions(WORK_PACKAGE_STATUS_MAP),
        },
        {
            key: "priority",
            label: "Priority",
            type: "select",
            options: [
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "critical", label: "Critical" },
            ],
        },
        { key: "estimated_hours", label: "Estimated Hours", type: "number" },
        { key: "due_date", label: "Due Date", type: "date" },
    ],
};

// ─── Worker Profile ───

export const CREATE_WORKER_PROFILE_CONFIG: CreateEntityConfig = {
    entityName: "Worker Profile",
    description: "Create a worker profile.",
    fields: [
        { key: "first_name", label: "First Name", type: "text", required: true },
        { key: "last_name", label: "Last Name", type: "text", required: true },
        { key: "email", label: "Email", type: "email" },
        { key: "phone", label: "Phone", type: "text", placeholder: "+1 555-0100" },
        { key: "department", label: "Department", type: "text", placeholder: "e.g. Production" },
        { key: "job_title", label: "Job Title", type: "text" },
    ],
};

// ─── Worker Lifecycle ───

export const CREATE_WORKER_ONBOARDING_RUN_CONFIG: CreateEntityConfig = {
    entityName: "Worker Onboarding Run",
    description: "Start a worker onboarding process.",
    fields: [
        {
            key: "worker_profile_id",
            label: "Worker",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.worker_profile_id,
            required: true,
        },
        { key: "start_date", label: "Start Date", type: "date", required: true },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

export const CREATE_WORKER_OFFBOARDING_RUN_CONFIG: CreateEntityConfig = {
    entityName: "Worker Offboarding Run",
    description: "Start a worker offboarding process.",
    fields: [
        {
            key: "worker_profile_id",
            label: "Worker",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.worker_profile_id,
            required: true,
        },
        { key: "last_day", label: "Last Day", type: "date", required: true },
        { key: "reason", label: "Reason", type: "textarea" },
    ],
};

// ─── Invitation ───

export const CREATE_INVITATION_CONFIG: CreateEntityConfig = {
    entityName: "Invitation",
    description: "Send a team invitation.",
    fields: [
        { key: "email", label: "Email", type: "email", required: true },
        {
            key: "role",
            label: "Role",
            type: "select",
            options: [
                { value: "admin", label: "Admin" },
                { value: "member", label: "Member" },
                { value: "viewer", label: "Viewer" },
            ],
        },
        { key: "message", label: "Message", type: "textarea" },
    ],
};

// ─── Data Export Request ───

export const CREATE_DATA_EXPORT_REQUEST_CONFIG: CreateEntityConfig = {
    entityName: "Data Export Request",
    description: "Request a data export.",
    fields: [
        {
            key: "export_type",
            label: "Export Type",
            type: "select",
            options: [
                { value: "csv", label: "CSV" },
                { value: "json", label: "JSON" },
                { value: "pdf", label: "PDF" },
            ],
            required: true,
        },
        {
            key: "entity_type",
            label: "Entity Type",
            type: "text",
            placeholder: "e.g. projects",
            required: true,
        },
        {
            key: "filters",
            label: "Filters",
            type: "textarea",
            placeholder: "Optional filter criteria",
        },
    ],
};

// ─── Provider Connection ───

export const CREATE_PROVIDER_CONNECTION_CONFIG: CreateEntityConfig = {
    entityName: "Provider Connection",
    description: "Connect an external provider.",
    fields: [
        {
            key: "provider",
            label: "Provider",
            type: "text",
            placeholder: "e.g. quickbooks",
            required: true,
        },
        { key: "provider_account_id", label: "Account ID", type: "text" },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

// ─── Conversation ───

export const CREATE_CONVERSATION_CONFIG: CreateEntityConfig = {
    entityName: "Conversation",
    description: "Start a new conversation.",
    fields: [
        { key: "title", label: "Title", type: "text", placeholder: "e.g. Project Discussion" },
        {
            key: "channel_type",
            label: "Channel",
            type: "select",
            options: [
                { value: "direct", label: "Direct Message" },
                { value: "group", label: "Group" },
                { value: "project", label: "Project Channel" },
            ],
        },
    ],
};

// ─── Profile ───

export const CREATE_PROFILE_CONFIG: CreateEntityConfig = {
    entityName: "Profile",
    description: "Create a user profile.",
    fields: [
        { key: "first_name", label: "First Name", type: "text", required: true },
        { key: "last_name", label: "Last Name", type: "text", required: true },
        { key: "email", label: "Email", type: "email" },
        { key: "job_title", label: "Job Title", type: "text" },
    ],
};

// ═══════════════════════════════════════════════════════════════
// PHASE H — Batch 2: Remaining entity page create coverage
// ═══════════════════════════════════════════════════════════════

// ─── Approval Steps ───

export const CREATE_APPROVAL_STEP_CONFIG: CreateEntityConfig = {
    entityName: "Approval Step",
    description: "Add a step to an approval workflow.",
    fields: [
        {
            key: "name",
            label: "Step Name",
            type: "text",
            placeholder: "e.g. Manager Review",
            required: true,
        },
        { key: "step_order", label: "Step Order", type: "number", min: 1, required: true },
        {
            key: "step_type",
            label: "Step Type",
            type: "select",
            options: [
                { value: "single", label: "Single Approver" },
                { value: "all", label: "All Must Approve" },
                { value: "any", label: "Any May Approve" },
            ],
            required: true,
        },
        {
            key: "approver_role",
            label: "Approver Role",
            type: "text",
            placeholder: "e.g. finance_manager",
        },
        { key: "escalation_hours", label: "Escalation After (hours)", type: "number", min: 1 },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Step requirements...",
        },
    ],
};

// ─── Asset Versions ───

export const CREATE_ASSET_VERSION_CONFIG: CreateEntityConfig = {
    entityName: "Asset Version",
    description: "Upload a new version of a digital asset.",
    fields: [
        { key: "version_label", label: "Version Label", type: "text", placeholder: "e.g. Rev C" },
        {
            key: "change_type",
            label: "Change Type",
            type: "select",
            options: [
                { value: "create", label: "Create" },
                { value: "update", label: "Update" },
                { value: "amendment", label: "Amendment" },
                { value: "revision", label: "Revision" },
                { value: "correction", label: "Correction" },
            ],
            required: true,
        },
        {
            key: "change_description",
            label: "Change Description",
            type: "textarea",
            placeholder: "What changed in this version?",
        },
    ],
};

// ─── Campaign Assets ───

export const CREATE_CAMPAIGN_ASSET_CONFIG: CreateEntityConfig = {
    entityName: "Campaign Asset",
    description: "Add a creative asset to a campaign.",
    fields: [
        {
            key: "name",
            label: "Asset Name",
            type: "text",
            placeholder: "e.g. Hero Banner — Instagram",
            required: true,
        },
        {
            key: "asset_role",
            label: "Role",
            type: "select",
            options: [
                { value: "hero", label: "Hero" },
                { value: "supporting", label: "Supporting" },
                { value: "thumbnail", label: "Thumbnail" },
                { value: "video", label: "Video" },
            ],
        },
        {
            key: "production_status",
            label: "Status",
            type: "select",
            options: mapToOptions(CAMPAIGN_ASSET_PRODUCTION_STATUS_MAP),
        },
        { key: "due_date", label: "Due Date", type: "date" },
        {
            key: "compliance_notes",
            label: "Compliance Notes",
            type: "textarea",
            placeholder: "Brand compliance notes...",
        },
    ],
};

// ─── Campaign Channels ───

export const CREATE_CAMPAIGN_CHANNEL_CONFIG: CreateEntityConfig = {
    entityName: "Campaign Channel",
    description: "Add a distribution channel to a campaign.",
    fields: [
        {
            key: "channel_type",
            label: "Channel Type",
            type: "select",
            options: mapToOptions(CHANNEL_CATEGORY_MAP),
            required: true,
        },
        { key: "label", label: "Label", type: "text", placeholder: "e.g. Instagram — Paid" },
        {
            key: "budget_allocation",
            label: "Budget Allocation",
            type: "number",
            min: 0,
            step: 0.01,
        },
        { key: "launch_date", label: "Launch Date", type: "date" },
        { key: "end_date", label: "End Date", type: "date" },
        {
            key: "notes",
            label: "Notes",
            type: "textarea",
            placeholder: "Channel strategy notes...",
        },
    ],
};

// ─── Campaign KPIs ───

export const CREATE_CAMPAIGN_KPI_CONFIG: CreateEntityConfig = {
    entityName: "Campaign KPI",
    description: "Define a key performance indicator for a campaign.",
    fields: [
        {
            key: "metric_name",
            label: "Metric Name",
            type: "text",
            placeholder: "e.g. Click-Through Rate",
            required: true,
        },
        {
            key: "metric_type",
            label: "Metric Type",
            type: "select",
            options: [
                { value: "count", label: "Count" },
                { value: "rate", label: "Rate" },
                { value: "currency", label: "Currency" },
                { value: "percentage", label: "Percentage" },
            ],
            required: true,
        },
        { key: "target_value", label: "Target Value", type: "number", step: 0.01, required: true },
        {
            key: "reporting_frequency",
            label: "Reporting Frequency",
            type: "select",
            options: [
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
                { value: "monthly", label: "Monthly" },
                { value: "quarterly", label: "Quarterly" },
            ],
        },
        { key: "is_primary", label: "Primary KPI", type: "select", options: YES_NO_OPTIONS },
    ],
};

// ─── Catalog Categories ───

export const CREATE_CATALOG_CATEGORY_CONFIG: CreateEntityConfig = {
    entityName: "Catalog Category",
    description: "Create a new catalog category.",
    fields: [
        {
            key: "name",
            label: "Category Name",
            type: "text",
            placeholder: "e.g. Lighting Equipment",
            required: true,
        },
        {
            key: "slug",
            label: "Slug",
            type: "text",
            placeholder: "e.g. lighting-equipment",
            required: true,
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Category description...",
        },
        { key: "icon", label: "Icon", type: "text", placeholder: "e.g. Lightbulb" },
        { key: "sort_order", label: "Sort Order", type: "number", min: 0 },
    ],
};

// ─── Channel Templates ───

export const CREATE_CHANNEL_TEMPLATE_CONFIG: CreateEntityConfig = {
    entityName: "Channel Template",
    description: "Create a reusable communication channel template.",
    fields: [
        {
            key: "name",
            label: "Template Name",
            type: "text",
            placeholder: "e.g. Event Ops Radio Plan",
            required: true,
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Template purpose...",
        },
        { key: "channel_count", label: "Channel Count", type: "number", min: 1, placeholder: "8" },
    ],
};

// ─── Comm Channels ───

export const CREATE_COMM_CHANNEL_CONFIG: CreateEntityConfig = {
    entityName: "Comm Channel",
    description: "Assign a radio/comms channel for a live event.",
    fields: [
        { key: "channel_number", label: "Channel Number", type: "number", min: 1, required: true },
        {
            key: "name",
            label: "Channel Name",
            type: "text",
            placeholder: "e.g. Stage Ops",
            required: true,
        },
        {
            key: "assignment",
            label: "Assignment",
            type: "text",
            placeholder: "e.g. Stage Management Team",
            required: true,
        },
        { key: "discipline", label: "Discipline", type: "text", placeholder: "e.g. Production" },
        {
            key: "priority",
            label: "Priority",
            type: "select",
            options: [
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "critical", label: "Critical" },
            ],
        },
        { key: "is_restricted", label: "Restricted", type: "select", options: YES_NO_OPTIONS },
    ],
};

// ─── Command Positions ───

export const CREATE_COMMAND_POSITION_CONFIG: CreateEntityConfig = {
    entityName: "Command Position",
    description: "Assign a command position for a live event.",
    fields: [
        {
            key: "position_type",
            label: "Position Type",
            type: "select",
            options: [
                { value: "event_director", label: "Event Director" },
                { value: "stage_manager", label: "Stage Manager" },
                { value: "production_manager", label: "Production Manager" },
                { value: "safety_officer", label: "Safety Officer" },
                { value: "custom", label: "Custom" },
            ],
            required: true,
        },
        {
            key: "layer",
            label: "Command Layer",
            type: "select",
            options: mapToOptions(COMMAND_LAYER_MAP),
            required: true,
        },
        {
            key: "radio_callsign",
            label: "Radio Callsign",
            type: "text",
            placeholder: "e.g. Stage-1",
        },
        { key: "mobile_number", label: "Mobile Number", type: "text", placeholder: "+1 555-0100" },
        {
            key: "custom_label",
            label: "Custom Label",
            type: "text",
            placeholder: "Custom position title",
        },
    ],
};

// ─── Comments ───

export const CREATE_COMMENT_CONFIG: CreateEntityConfig = {
    entityName: "Comment",
    description: "Add a comment to a record.",
    fields: [
        {
            key: "body",
            label: "Comment",
            type: "textarea",
            placeholder: "Write your comment...",
            required: true,
        },
    ],
};

// ─── Compliance Templates ───

export const CREATE_COMPLIANCE_TEMPLATE_CONFIG: CreateEntityConfig = {
    entityName: "Compliance Template",
    description: "Define a compliance document template.",
    fields: [
        {
            key: "name",
            label: "Template Name",
            type: "text",
            placeholder: "e.g. W-9 Verification",
            required: true,
        },
        {
            key: "doc_type",
            label: "Document Type",
            type: "select",
            options: [
                { value: "tax_form", label: "Tax Form" },
                { value: "insurance", label: "Insurance" },
                { value: "license", label: "License" },
                { value: "certification", label: "Certification" },
                { value: "nda", label: "NDA" },
                { value: "other", label: "Other" },
            ],
            required: true,
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Template description...",
        },
        { key: "is_required", label: "Required", type: "select", options: YES_NO_OPTIONS },
        { key: "has_expiry", label: "Has Expiry", type: "select", options: YES_NO_OPTIONS },
        {
            key: "expiry_warning_days",
            label: "Expiry Warning (days)",
            type: "number",
            min: 1,
            placeholder: "30",
        },
    ],
};

// ─── Consumable Usage ───

export const CREATE_CONSUMABLE_USAGE_CONFIG: CreateEntityConfig = {
    entityName: "Consumable Usage",
    description: "Record usage of a consumable item.",
    fields: [
        {
            key: "quantity",
            label: "Quantity Used",
            type: "number",
            min: 0.01,
            step: 0.01,
            required: true,
        },
        { key: "date", label: "Date", type: "date", required: true },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Usage details..." },
    ],
};

// ─── Dashboard Widgets ───

export const CREATE_DASHBOARD_WIDGET_CONFIG: CreateEntityConfig = {
    entityName: "Dashboard Widget",
    description: "Add a widget to a dashboard.",
    fields: [
        {
            key: "name",
            label: "Widget Name",
            type: "text",
            placeholder: "e.g. Revenue This Month",
            required: true,
        },
        {
            key: "widget_type",
            label: "Widget Type",
            type: "select",
            options: [
                { value: "number", label: "Number" },
                { value: "chart", label: "Chart" },
                { value: "table", label: "Table" },
                { value: "list", label: "List" },
                { value: "progress", label: "Progress" },
            ],
            required: true,
        },
        {
            key: "data_source",
            label: "Data Source",
            type: "text",
            placeholder: "e.g. invoices",
            required: true,
        },
        {
            key: "time_range",
            label: "Time Range",
            type: "select",
            options: [
                { value: "today", label: "Today" },
                { value: "this_week", label: "This Week" },
                { value: "this_month", label: "This Month" },
                { value: "this_quarter", label: "This Quarter" },
                { value: "this_year", label: "This Year" },
            ],
        },
    ],
};

// ─── Engagement Terms ───

export const CREATE_ENGAGEMENT_TERM_CONFIG: CreateEntityConfig = {
    entityName: "Engagement Term",
    description: "Define engagement terms for a worker.",
    fields: [
        {
            key: "role",
            label: "Role",
            type: "text",
            placeholder: "e.g. Lead Rigger",
            required: true,
        },
        { key: "start_date", label: "Start Date", type: "date", required: true },
        { key: "end_date", label: "End Date", type: "date" },
        { key: "rate", label: "Rate", type: "number", min: 0, step: 0.01, required: true },
        {
            key: "rate_type",
            label: "Rate Type",
            type: "select",
            options: [
                { value: "hourly", label: "Hourly" },
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
                { value: "flat", label: "Flat Fee" },
            ],
            required: true,
        },
        { key: "estimated_hours", label: "Estimated Hours", type: "number", min: 0, step: 0.5 },
        { key: "not_to_exceed", label: "Not to Exceed", type: "number", min: 0, step: 0.01 },
    ],
};

// ─── Equipment Check-Ins ───

export const CREATE_EQUIPMENT_CHECK_IN_CONFIG: CreateEntityConfig = {
    entityName: "Equipment Check-In",
    description: "Record equipment arrival at a live event.",
    fields: [
        {
            key: "condition_on_arrival",
            label: "Condition on Arrival",
            type: "select",
            options: [
                { value: "excellent", label: "Excellent" },
                { value: "good", label: "Good" },
                { value: "fair", label: "Fair" },
                { value: "damaged", label: "Damaged" },
            ],
            required: true,
        },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: mapToOptions(EQUIPMENT_LIVE_STATUS_MAP),
        },
        {
            key: "deployed_location",
            label: "Deployed Location",
            type: "text",
            placeholder: "e.g. Main Stage Left",
        },
        {
            key: "condition_notes",
            label: "Condition Notes",
            type: "textarea",
            placeholder: "Note any damage or issues...",
        },
    ],
};

// ─── Maintenance Schedules ───

export const CREATE_MAINTENANCE_SCHEDULE_CONFIG: CreateEntityConfig = {
    entityName: "Maintenance Schedule",
    description: "Define a recurring maintenance schedule for assets.",
    fields: [
        {
            key: "name",
            label: "Schedule Name",
            type: "text",
            placeholder: "e.g. Quarterly Generator Service",
            required: true,
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Maintenance scope...",
        },
        {
            key: "frequency_type",
            label: "Frequency Type",
            type: "select",
            options: [
                { value: "calendar", label: "Calendar-Based" },
                { value: "usage", label: "Usage-Based" },
                { value: "condition", label: "Condition-Based" },
            ],
            required: true,
        },
        {
            key: "frequency_value",
            label: "Frequency Value",
            type: "number",
            min: 1,
            required: true,
        },
        {
            key: "frequency_unit",
            label: "Frequency Unit",
            type: "select",
            options: [
                { value: "days", label: "Days" },
                { value: "weeks", label: "Weeks" },
                { value: "months", label: "Months" },
                { value: "years", label: "Years" },
            ],
            required: true,
        },
        {
            key: "estimated_duration_hours",
            label: "Est. Duration (hours)",
            type: "number",
            min: 0,
            step: 0.5,
        },
        { key: "estimated_cost", label: "Est. Cost", type: "number", min: 0, step: 0.01 },
    ],
};

// ─── Production Budget Lines ───

export const CREATE_PRODUCTION_BUDGET_LINE_CONFIG: CreateEntityConfig = {
    entityName: "Production Budget Line",
    description: "Add a line item to a production budget.",
    fields: [
        {
            key: "description",
            label: "Description",
            type: "text",
            placeholder: "Line item description",
            required: true,
        },
        {
            key: "category",
            label: "Category",
            type: "text",
            placeholder: "e.g. labor, equipment, venue",
            required: true,
        },
        { key: "subcategory", label: "Subcategory", type: "text", placeholder: "e.g. lighting" },
        {
            key: "quantity",
            label: "Quantity",
            type: "number",
            min: 0.01,
            step: 0.01,
            required: true,
        },
        { key: "unit", label: "Unit", type: "text", placeholder: "e.g. ea, hrs, days" },
        {
            key: "unit_cost",
            label: "Unit Cost",
            type: "number",
            min: 0,
            step: 0.01,
            required: true,
        },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Additional notes..." },
    ],
};

// ─── Project Assignments ───

export const CREATE_PROJECT_ASSIGNMENT_CONFIG: CreateEntityConfig = {
    entityName: "Project Assignment",
    description: "Assign a crew member to a project.",
    fields: [
        {
            key: "role",
            label: "Role",
            type: "text",
            placeholder: "e.g. Lead Technician",
            required: true,
        },
        { key: "start_date", label: "Start Date", type: "date", required: true },
        { key: "end_date", label: "End Date", type: "date", required: true },
        { key: "rate", label: "Rate", type: "number", min: 0, step: 0.01, required: true },
        {
            key: "rate_type",
            label: "Rate Type",
            type: "select",
            options: [
                { value: "hourly", label: "Hourly" },
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
                { value: "flat", label: "Flat Fee" },
            ],
            required: true,
        },
        { key: "estimated_hours", label: "Estimated Hours", type: "number", min: 0, step: 0.5 },
    ],
};

// ─── Stakeholder Projects ───

export const CREATE_STAKEHOLDER_PROJECT_CONFIG: CreateEntityConfig = {
    entityName: "Stakeholder Project",
    description: "Link a stakeholder to a project.",
    fields: [
        {
            key: "stakeholder_id",
            label: "Stakeholder",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.stakeholder_id,
            required: true,
        },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
            required: true,
        },
    ],
};

// ─── Team Members ───

export const CREATE_TEAM_MEMBER_CONFIG: CreateEntityConfig = {
    entityName: "Team Member",
    description: "Add a member to a team.",
    fields: [
        {
            key: "role",
            label: "Role",
            type: "select",
            options: [
                { value: "lead", label: "Lead" },
                { value: "member", label: "Member" },
            ],
            required: true,
        },
    ],
};

// ─── Time Tracking Policies ───

export const CREATE_TIME_TRACKING_POLICY_CONFIG: CreateEntityConfig = {
    entityName: "Time Tracking Policy",
    description: "Define a time tracking policy for the organization.",
    fields: [
        {
            key: "max_daily_hours",
            label: "Max Daily Hours",
            type: "number",
            min: 1,
            max: 24,
            step: 0.5,
            required: true,
        },
        {
            key: "overtime_threshold_daily",
            label: "OT Threshold (daily)",
            type: "number",
            min: 0,
            step: 0.5,
        },
        {
            key: "overtime_threshold_weekly",
            label: "OT Threshold (weekly)",
            type: "number",
            min: 0,
            step: 0.5,
        },
        {
            key: "logging_deadline_hour",
            label: "Logging Deadline (hour)",
            type: "number",
            min: 0,
            max: 23,
        },
        { key: "require_task", label: "Require Task", type: "select", options: YES_NO_OPTIONS },
        {
            key: "require_description",
            label: "Require Description",
            type: "select",
            options: YES_NO_OPTIONS,
        },
        { key: "reminder_enabled", label: "Reminders", type: "select", options: YES_NO_OPTIONS },
    ],
};

// ─── Upsell Triggers ───

export const CREATE_UPSELL_TRIGGER_CONFIG: CreateEntityConfig = {
    entityName: "Upsell Trigger",
    description: "Define a trigger for upsell notifications.",
    fields: [
        {
            key: "name",
            label: "Trigger Name",
            type: "text",
            placeholder: "e.g. API Rate Limit Warning",
            required: true,
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "What triggers this upsell?",
        },
        {
            key: "trigger_type",
            label: "Trigger Type",
            type: "select",
            options: [
                { value: "field_access_attempt", label: "Field Access Attempt" },
                { value: "export_attempt", label: "Export Attempt" },
                { value: "api_tier_insufficient", label: "API Tier Insufficient" },
                { value: "user_growth", label: "User Growth" },
            ],
            required: true,
        },
        {
            key: "threshold_count",
            label: "Threshold Count",
            type: "number",
            min: 1,
            required: true,
        },
        {
            key: "threshold_window_days",
            label: "Window (days)",
            type: "number",
            min: 1,
            required: true,
        },
        {
            key: "notification_type",
            label: "Notification Type",
            type: "select",
            options: [
                { value: "in_app", label: "In-App" },
                { value: "email", label: "Email" },
                { value: "slack_webhook", label: "Slack Webhook" },
            ],
            required: true,
        },
    ],
};

// ─── Vendor Communications ───

export const CREATE_VENDOR_COMMUNICATION_CONFIG: CreateEntityConfig = {
    entityName: "Vendor Communication",
    description: "Log a communication with a vendor.",
    fields: [
        {
            key: "subject",
            label: "Subject",
            type: "text",
            placeholder: "e.g. Equipment delivery update",
            required: true,
        },
        {
            key: "message",
            label: "Message",
            type: "textarea",
            placeholder: "Communication details...",
            required: true,
        },
        {
            key: "channel",
            label: "Channel",
            type: "select",
            options: [
                { value: "email", label: "Email" },
                { value: "phone", label: "Phone" },
                { value: "in_person", label: "In Person" },
                { value: "portal", label: "Vendor Portal" },
            ],
        },
    ],
};

// ─── Worker Classifications ───

export const CREATE_WORKER_CLASSIFICATION_CONFIG: CreateEntityConfig = {
    entityName: "Worker Classification",
    description: "Define a worker's employment classification.",
    fields: [
        {
            key: "classification",
            label: "Classification",
            type: "select",
            options: [
                { value: "employee", label: "Employee" },
                { value: "contractor", label: "Contractor" },
                { value: "freelancer", label: "Freelancer" },
                { value: "volunteer", label: "Volunteer" },
                { value: "intern", label: "Intern" },
                { value: "seasonal", label: "Seasonal" },
            ],
            required: true,
        },
        {
            key: "tax_classification",
            label: "Tax Classification",
            type: "select",
            options: [
                { value: "w2", label: "W-2" },
                { value: "1099", label: "1099" },
            ],
            required: true,
        },
        { key: "effective_date", label: "Effective Date", type: "date", required: true },
        { key: "end_date", label: "End Date", type: "date" },
        { key: "hourly_rate", label: "Hourly Rate", type: "number", min: 0, step: 0.01 },
        {
            key: "rate_type",
            label: "Rate Type",
            type: "select",
            options: [
                { value: "hourly", label: "Hourly" },
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
                { value: "salary", label: "Salary" },
            ],
        },
    ],
};

// ═══════════════════════════════════════════════════════════════
// PHASE H — Batch 3: Final L4 coverage (34 remaining entities)
// ═══════════════════════════════════════════════════════════════

// ─── System / Log / Read-Only Entities ───
// These entities are typically system-generated, but configs are
// provided for admin override / manual-entry use cases.

export const CREATE_ACCESS_AUDIT_LOG_CONFIG: CreateEntityConfig = {
    entityName: "Access Audit Log",
    description: "Manually log an access audit entry.",
    fields: [
        {
            key: "action",
            label: "Action",
            type: "text",
            placeholder: "e.g. login, export, view",
            required: true,
        },
        {
            key: "resource_type",
            label: "Resource Type",
            type: "text",
            placeholder: "e.g. project",
            required: true,
        },
        { key: "resource_id", label: "Resource ID", type: "text", placeholder: "Resource UUID" },
        {
            key: "details",
            label: "Details",
            type: "textarea",
            placeholder: "Additional context...",
        },
    ],
};

export const CREATE_ACTIVITY_CONFIG: CreateEntityConfig = {
    entityName: "Activity",
    description: "Log an activity.",
    fields: [
        {
            key: "activity_type",
            label: "Activity Type",
            type: "text",
            placeholder: "e.g. call, meeting, email",
            required: true,
        },
        {
            key: "subject",
            label: "Subject",
            type: "text",
            placeholder: "e.g. Follow-up call with client",
            required: true,
        },
        { key: "scheduled_at", label: "Scheduled At", type: "datetime-local" },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Activity details..." },
    ],
};

export const CREATE_ACTIVITY_LOG_ENTRY_CONFIG: CreateEntityConfig = {
    entityName: "Activity Log Entry",
    description: "Record an activity log entry.",
    fields: [
        {
            key: "action",
            label: "Action",
            type: "text",
            placeholder: "e.g. created, updated, deleted",
            required: true,
        },
        { key: "entity_type", label: "Entity Type", type: "text", placeholder: "e.g. project" },
        { key: "entity_id", label: "Entity ID", type: "text", placeholder: "Entity UUID" },
        { key: "description", label: "Description", type: "textarea" },
    ],
};

export const CREATE_ADVANCE_STATUS_HISTORY_CONFIG: CreateEntityConfig = {
    entityName: "Advance Status History",
    description: "Record a production advance status change.",
    fields: [
        {
            key: "advance_id",
            label: "Advance",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.advance_id,
            required: true,
        },
        { key: "from_status", label: "From Status", type: "text", placeholder: "Previous status" },
        {
            key: "to_status",
            label: "To Status",
            type: "text",
            placeholder: "New status",
            required: true,
        },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

export const CREATE_AUTOMATION_EXECUTION_CONFIG: CreateEntityConfig = {
    entityName: "Automation Execution",
    description: "Log an automation execution run.",
    fields: [
        {
            key: "automation_id",
            label: "Automation",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.automation_id,
            required: true,
        },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: [
                { value: "success", label: "Success" },
                { value: "failure", label: "Failure" },
                { value: "skipped", label: "Skipped" },
            ],
            required: true,
        },
        { key: "error_message", label: "Error Message", type: "textarea" },
    ],
};

export const CREATE_AUTOMATION_LOG_CONFIG: CreateEntityConfig = {
    entityName: "Automation Log",
    description: "Record an automation log entry.",
    fields: [
        {
            key: "automation_id",
            label: "Automation",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.automation_id,
            required: true,
        },
        {
            key: "log_level",
            label: "Level",
            type: "select",
            options: [
                { value: "info", label: "Info" },
                { value: "warning", label: "Warning" },
                { value: "error", label: "Error" },
                { value: "debug", label: "Debug" },
            ],
            required: true,
        },
        { key: "message", label: "Message", type: "textarea", required: true },
    ],
};

export const CREATE_DOMAIN_EVENT_CONFIG: CreateEntityConfig = {
    entityName: "Domain Event",
    description: "Emit a domain event.",
    fields: [
        {
            key: "event_type",
            label: "Event Type",
            type: "text",
            placeholder: "e.g. project.created",
            required: true,
        },
        {
            key: "aggregate_type",
            label: "Aggregate Type",
            type: "text",
            placeholder: "e.g. project",
        },
        { key: "aggregate_id", label: "Aggregate ID", type: "text", placeholder: "Entity UUID" },
        {
            key: "payload",
            label: "Payload (JSON)",
            type: "textarea",
            placeholder: '{"key": "value"}',
        },
    ],
};

export const CREATE_FOH_ZONE_READING_CONFIG: CreateEntityConfig = {
    entityName: "FOH Zone Reading",
    description: "Record a front-of-house zone reading.",
    fields: [
        {
            key: "zone_id",
            label: "Zone",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.zone_id,
            required: true,
        },
        { key: "occupancy", label: "Occupancy", type: "number", min: 0, required: true },
        { key: "sales_amount", label: "Sales Amount", type: "number", min: 0, step: 0.01 },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

export const CREATE_LIVE_FINANCIAL_SNAPSHOT_CONFIG: CreateEntityConfig = {
    entityName: "Live Financial Snapshot",
    description: "Record a live event financial snapshot.",
    fields: [
        { key: "snapshot_time", label: "Snapshot Time", type: "datetime-local", required: true },
        { key: "revenue_tickets", label: "Ticket Revenue", type: "number", min: 0, step: 0.01 },
        { key: "revenue_foh", label: "FOH Revenue", type: "number", min: 0, step: 0.01 },
        { key: "total_expenses", label: "Total Expenses", type: "number", min: 0, step: 0.01 },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

export const CREATE_LOGIN_AUDIT_LOG_CONFIG: CreateEntityConfig = {
    entityName: "Login Audit Log",
    description: "Manually record a login audit entry.",
    fields: [
        {
            key: "event_type",
            label: "Event Type",
            type: "select",
            options: [
                { value: "login", label: "Login" },
                { value: "logout", label: "Logout" },
                { value: "failed_login", label: "Failed Login" },
                { value: "password_reset", label: "Password Reset" },
            ],
            required: true,
        },
        { key: "ip_address", label: "IP Address", type: "text", placeholder: "e.g. 192.168.1.1" },
        { key: "user_agent", label: "User Agent", type: "text" },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

export const CREATE_MESSAGE_CONFIG: CreateEntityConfig = {
    entityName: "Message",
    description: "Send a message.",
    fields: [
        {
            key: "body",
            label: "Message",
            type: "textarea",
            placeholder: "Write your message...",
            required: true,
        },
    ],
};

export const CREATE_NOTIFICATION_CONFIG: CreateEntityConfig = {
    entityName: "Notification",
    description: "Create a notification.",
    fields: [
        {
            key: "title",
            label: "Title",
            type: "text",
            placeholder: "Notification title",
            required: true,
        },
        {
            key: "body",
            label: "Body",
            type: "textarea",
            placeholder: "Notification content...",
            required: true,
        },
        {
            key: "type",
            label: "Type",
            type: "select",
            options: [
                { value: "info", label: "Info" },
                { value: "warning", label: "Warning" },
                { value: "success", label: "Success" },
                { value: "error", label: "Error" },
            ],
        },
    ],
};

export const CREATE_ROLE_CHANGE_LOG_CONFIG: CreateEntityConfig = {
    entityName: "Role Change Log",
    description: "Record a role change.",
    fields: [
        {
            key: "user_id",
            label: "User",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.user_id,
            required: true,
        },
        { key: "from_role", label: "From Role", type: "text", placeholder: "Previous role" },
        { key: "to_role", label: "To Role", type: "text", placeholder: "New role", required: true },
        { key: "reason", label: "Reason", type: "textarea" },
    ],
};

export const CREATE_SCAN_EVENT_CONFIG: CreateEntityConfig = {
    entityName: "Scan Event",
    description: "Record a credential scan event.",
    fields: [
        {
            key: "scan_type",
            label: "Scan Type",
            type: "select",
            options: [
                { value: "check_in", label: "Check In" },
                { value: "check_out", label: "Check Out" },
            ],
            required: true,
        },
        {
            key: "credential_id",
            label: "Credential",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.credential_id,
        },
        { key: "location", label: "Location", type: "text", placeholder: "Scan location" },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

export const CREATE_STORAGE_OBJECT_CONFIG: CreateEntityConfig = {
    entityName: "Storage Object",
    description: "Register a storage object reference.",
    fields: [
        {
            key: "name",
            label: "File Name",
            type: "text",
            placeholder: "e.g. report.pdf",
            required: true,
        },
        {
            key: "bucket",
            label: "Bucket",
            type: "text",
            placeholder: "e.g. documents",
            required: true,
        },
        { key: "path", label: "Path", type: "text", placeholder: "e.g. /projects/123/report.pdf" },
        { key: "mime_type", label: "MIME Type", type: "text", placeholder: "e.g. application/pdf" },
    ],
};

export const CREATE_SYNC_EVENT_CONFIG: CreateEntityConfig = {
    entityName: "Sync Event",
    description: "Record an external sync event.",
    fields: [
        {
            key: "provider",
            label: "Provider",
            type: "text",
            placeholder: "e.g. quickbooks",
            required: true,
        },
        {
            key: "direction",
            label: "Direction",
            type: "select",
            options: [
                { value: "inbound", label: "Inbound" },
                { value: "outbound", label: "Outbound" },
            ],
            required: true,
        },
        { key: "entity_type", label: "Entity Type", type: "text", placeholder: "e.g. invoice" },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: [
                { value: "success", label: "Success" },
                { value: "failure", label: "Failure" },
                { value: "partial", label: "Partial" },
            ],
        },
        { key: "error_message", label: "Error", type: "textarea" },
    ],
};

// ─── Domain Entities ───

export const CREATE_ACCOUNT_HEALTH_SCORE_CONFIG: CreateEntityConfig = {
    entityName: "Account Health Score",
    description: "Record an account health score assessment.",
    fields: [
        {
            key: "company_id",
            label: "Company",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.company_id,
            required: true,
        },
        { key: "score_date", label: "Score Date", type: "date", required: true },
        {
            key: "overall_score",
            label: "Overall Score (0–100)",
            type: "number",
            min: 0,
            max: 100,
            required: true,
        },
        {
            key: "risk_level",
            label: "Risk Level",
            type: "select",
            options: mapToOptions(ACCOUNT_RISK_LEVEL_MAP),
        },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Assessment notes..." },
    ],
};

export const CREATE_APPROVAL_WORKFLOW_CONFIG: CreateEntityConfig = {
    entityName: "Approval Workflow",
    description: "Define an approval workflow.",
    fields: [
        {
            key: "name",
            label: "Workflow Name",
            type: "text",
            placeholder: "e.g. Budget Approval Workflow",
            required: true,
        },
        {
            key: "entity_type",
            label: "Entity Type",
            type: "text",
            placeholder: "e.g. purchase_order",
            required: true,
        },
        { key: "description", label: "Description", type: "textarea" },
        { key: "auto_escalation_hours", label: "Auto-Escalation (hours)", type: "number", min: 1 },
        {
            key: "allow_delegation",
            label: "Allow Delegation",
            type: "select",
            options: YES_NO_OPTIONS,
        },
        {
            key: "require_comments",
            label: "Require Comments",
            type: "select",
            options: YES_NO_OPTIONS,
        },
    ],
};

export const CREATE_BRAND_GUIDELINE_SECTION_CONFIG: CreateEntityConfig = {
    entityName: "Brand Guideline Section",
    description: "Add a section to a brand guideline.",
    fields: [
        {
            key: "title",
            label: "Section Title",
            type: "text",
            placeholder: "e.g. Logo Usage",
            required: true,
        },
        {
            key: "content",
            label: "Content",
            type: "textarea",
            placeholder: "Section content...",
            required: true,
        },
        { key: "sort_order", label: "Sort Order", type: "number", min: 0 },
    ],
};

export const CREATE_CREDENTIAL_INVENTORY_POOL_CONFIG: CreateEntityConfig = {
    entityName: "Credential Inventory Pool",
    description: "Create a credential inventory pool for an event.",
    fields: [
        {
            key: "credential_type_id",
            label: "Credential Type",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.credential_type_id,
            required: true,
        },
        { key: "total_quantity", label: "Total Quantity", type: "number", min: 1, required: true },
        { key: "allocated_quantity", label: "Allocated", type: "number", min: 0 },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

export const CREATE_DOCUMENT_VERSION_CONFIG: CreateEntityConfig = {
    entityName: "Document Version",
    description: "Upload a new document version.",
    fields: [
        {
            key: "version_label",
            label: "Version Label",
            type: "text",
            placeholder: "e.g. v2.1",
            required: true,
        },
        {
            key: "change_summary",
            label: "Change Summary",
            type: "textarea",
            placeholder: "What changed?",
            required: true,
        },
    ],
};

export const CREATE_EMAIL_MESSAGE_CONFIG: CreateEntityConfig = {
    entityName: "Email Message",
    description: "Compose an email message.",
    fields: [
        {
            key: "subject",
            label: "Subject",
            type: "text",
            placeholder: "Email subject",
            required: true,
        },
        { key: "to_address", label: "To", type: "email", required: true },
        {
            key: "body",
            label: "Body",
            type: "textarea",
            placeholder: "Email body...",
            required: true,
        },
        { key: "cc_addresses", label: "CC", type: "text", placeholder: "Comma-separated emails" },
    ],
};

export const CREATE_ENVIRONMENTAL_READING_CONFIG: CreateEntityConfig = {
    entityName: "Environmental Reading",
    description: "Record an environmental reading at a live event.",
    fields: [
        {
            key: "reading_type",
            label: "Reading Type",
            type: "select",
            options: [
                { value: "temperature", label: "Temperature" },
                { value: "humidity", label: "Humidity" },
                { value: "noise_level", label: "Noise Level" },
                { value: "wind_speed", label: "Wind Speed" },
                { value: "air_quality", label: "Air Quality" },
            ],
            required: true,
        },
        { key: "value", label: "Value", type: "number", step: 0.1, required: true },
        { key: "unit", label: "Unit", type: "text", placeholder: "e.g. °F, dB, mph" },
        { key: "location", label: "Location", type: "text", placeholder: "e.g. Main Stage" },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

export const CREATE_INVENTORY_RESERVATION_CONFIG: CreateEntityConfig = {
    entityName: "Inventory Reservation",
    description: "Reserve inventory for a project or event.",
    fields: [
        {
            key: "asset_id",
            label: "Asset",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.asset_id,
        },
        { key: "quantity", label: "Quantity", type: "number", min: 1, required: true },
        { key: "reserved_from", label: "Reserved From", type: "date", required: true },
        { key: "reserved_until", label: "Reserved Until", type: "date", required: true },
        {
            key: "priority",
            label: "Priority",
            type: "select",
            options: [
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "critical", label: "Critical" },
            ],
        },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

export const CREATE_KNOWLEDGE_ARTICLE_CONFIG: CreateEntityConfig = {
    entityName: "Knowledge Article",
    description: "Create a knowledge base article.",
    fields: [
        {
            key: "title",
            label: "Title",
            type: "text",
            placeholder: "e.g. How to Set Up Comms",
            required: true,
        },
        {
            key: "content",
            label: "Content",
            type: "textarea",
            placeholder: "Article content...",
            required: true,
        },
        { key: "category", label: "Category", type: "text", placeholder: "e.g. Operations" },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: mapToOptions(DOCUMENT_STATUS_MAP),
        },
    ],
};

export const CREATE_LIVE_CREW_ASSIGNMENT_CONFIG: CreateEntityConfig = {
    entityName: "Live Crew Assignment",
    description: "Assign crew to a live event position.",
    fields: [
        {
            key: "role",
            label: "Role",
            type: "text",
            placeholder: "e.g. Stage Manager",
            required: true,
        },
        { key: "call_time", label: "Call Time", type: "datetime-local", required: true },
        { key: "end_time", label: "End Time", type: "datetime-local" },
        {
            key: "credentials_verified",
            label: "Credentials Verified",
            type: "select",
            options: YES_NO_OPTIONS,
        },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

export const CREATE_LIVE_EVENT_INSTANCE_CONFIG: CreateEntityConfig = {
    entityName: "Live Event Instance",
    description: "Create a live event instance (show day).",
    fields: [
        {
            key: "name",
            label: "Instance Name",
            type: "text",
            placeholder: "e.g. Day 1 — Main Show",
            required: true,
        },
        { key: "event_date", label: "Event Date", type: "date", required: true },
        { key: "doors_open", label: "Doors Open", type: "datetime-local" },
        { key: "show_start", label: "Show Start", type: "datetime-local" },
        { key: "show_end", label: "Show End", type: "datetime-local" },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

export const CREATE_LOGISTICS_EVENT_CONFIG: CreateEntityConfig = {
    entityName: "Logistics Event",
    description: "Record a logistics event for a shipment.",
    fields: [
        {
            key: "shipment_id",
            label: "Shipment",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.shipment_id,
            required: true,
        },
        {
            key: "event_type",
            label: "Event Type",
            type: "select",
            options: [
                { value: "pickup", label: "Pickup" },
                { value: "in_transit", label: "In Transit" },
                { value: "delivered", label: "Delivered" },
                { value: "delayed", label: "Delayed" },
                { value: "customs", label: "Customs" },
                { value: "exception", label: "Exception" },
            ],
            required: true,
        },
        {
            key: "location_text",
            label: "Location",
            type: "text",
            placeholder: "e.g. LAX Warehouse",
        },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

export const CREATE_POS_TRANSACTION_CONFIG: CreateEntityConfig = {
    entityName: "POS Transaction",
    description: "Record a point-of-sale transaction.",
    fields: [
        {
            key: "transaction_id",
            label: "Transaction ID",
            type: "text",
            placeholder: "e.g. TXN-001",
            required: true,
        },
        { key: "amount", label: "Amount", type: "number", min: 0, step: 0.01, required: true },
        {
            key: "payment_method",
            label: "Payment Method",
            type: "select",
            options: [
                { value: "cash", label: "Cash" },
                { value: "card", label: "Card" },
                { value: "mobile", label: "Mobile Pay" },
                { value: "comp", label: "Comp" },
            ],
        },
        { key: "transaction_time", label: "Transaction Time", type: "datetime-local" },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

export const CREATE_PRODUCTION_ADVANCE_ITEM_CONFIG: CreateEntityConfig = {
    entityName: "Advance Item",
    description: "Add a line item to a production advance.",
    fields: [
        {
            key: "catalog_item_id",
            label: "Catalog Item",
            type: "text",
            placeholder: "Select a catalog item",
            required: true,
        },
        {
            key: "category_id",
            label: "Category",
            type: "text",
            placeholder: "Category override (optional)",
        },
        {
            key: "quantity_requested",
            label: "Quantity",
            type: "number",
            min: 1,
            step: 1,
            required: true,
        },
        {
            key: "unit_cost",
            label: "Unit Cost",
            type: "number",
            min: 0,
            step: 0.01,
            required: true,
        },
        {
            key: "start_date",
            label: "Start Date",
            type: "date",
        },
        {
            key: "end_date",
            label: "End Date",
            type: "date",
        },
        {
            key: "location_id",
            label: "Location (Workspace/Activation)",
            type: "text",
            placeholder: "Select a location",
        },
        {
            key: "operational_purpose",
            label: "Operational Purpose",
            type: "textarea",
            placeholder: "How this item will be used operationally...",
        },
        {
            key: "special_requests",
            label: "Special Requests",
            type: "textarea",
            placeholder: "Special handling or configuration requests...",
        },
        {
            key: "notes",
            label: "Notes",
            type: "textarea",
            placeholder: "Additional notes...",
        },
    ],
};

export const CREATE_PRODUCTION_TIME_ENTRY_CONFIG: CreateEntityConfig = {
    entityName: "Production Time Entry",
    description: "Log a production time entry.",
    fields: [
        { key: "date", label: "Date", type: "date", required: true },
        {
            key: "hours",
            label: "Hours",
            type: "number",
            min: 0,
            max: 24,
            step: 0.25,
            required: true,
        },
        {
            key: "task_description",
            label: "Task Description",
            type: "text",
            placeholder: "What was done",
        },
        { key: "is_billable", label: "Billable", type: "select", options: YES_NO_OPTIONS },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

export const CREATE_REVENUE_RECOGNITION_ENTRY_CONFIG: CreateEntityConfig = {
    entityName: "Revenue Recognition Entry",
    description: "Record a revenue recognition entry.",
    fields: [
        { key: "recognition_date", label: "Recognition Date", type: "date", required: true },
        { key: "amount", label: "Amount", type: "number", min: 0, step: 0.01, required: true },
        {
            key: "entry_type",
            label: "Entry Type",
            type: "select",
            options: [
                { value: "recognized", label: "Recognized" },
                { value: "deferred", label: "Deferred" },
                { value: "adjustment", label: "Adjustment" },
            ],
            required: true,
        },
        { key: "description", label: "Description", type: "textarea" },
    ],
};

export const CREATE_SCHEDULE_ENTRY_CONFIG: CreateEntityConfig = {
    entityName: "Schedule Entry",
    description: "Create a schedule entry.",
    fields: [
        {
            key: "title",
            label: "Title",
            type: "text",
            placeholder: "e.g. Load-In Day 1",
            required: true,
        },
        { key: "start_time", label: "Start", type: "datetime-local", required: true },
        { key: "end_time", label: "End", type: "datetime-local", required: true },
        { key: "location", label: "Location", type: "text", placeholder: "Location name" },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

export const CREATE_SERVICE_HEALTH_CHECK_CONFIG: CreateEntityConfig = {
    entityName: "Service Health Check",
    description: "Record a service health check result.",
    fields: [
        {
            key: "service_name",
            label: "Service Name",
            type: "text",
            placeholder: "e.g. API Gateway",
            required: true,
        },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: [
                { value: "healthy", label: "Healthy" },
                { value: "degraded", label: "Degraded" },
                { value: "down", label: "Down" },
            ],
            required: true,
        },
        { key: "response_time_ms", label: "Response Time (ms)", type: "number", min: 0 },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

export const CREATE_SLA_TRACKING_CONFIG: CreateEntityConfig = {
    entityName: "SLA Tracking",
    description: "Track an SLA compliance record.",
    fields: [
        {
            key: "sla_definition_id",
            label: "SLA Definition",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.sla_definition_id,
            required: true,
        },
        {
            key: "entity_type",
            label: "Entity Type",
            type: "text",
            placeholder: "e.g. service_request",
        },
        { key: "entity_id", label: "Entity ID", type: "text", placeholder: "Entity UUID" },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: [
                { value: "within_sla", label: "Within SLA" },
                { value: "at_risk", label: "At Risk" },
                { value: "breached", label: "Breached" },
            ],
        },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

export const CREATE_SURVEY_RESPONSE_CONFIG: CreateEntityConfig = {
    entityName: "Survey Response",
    description: "Submit a survey response.",
    fields: [
        {
            key: "survey_template_id",
            label: "Survey Template",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.survey_template_id,
            required: true,
        },
        {
            key: "overall_rating",
            label: "Overall Rating (1–5)",
            type: "number",
            min: 1,
            max: 5,
            step: 1,
        },
        { key: "feedback", label: "Feedback", type: "textarea", placeholder: "Your feedback..." },
    ],
};

export const CREATE_UPSELL_EVENT_CONFIG: CreateEntityConfig = {
    entityName: "Upsell Event",
    description: "Log an upsell event.",
    fields: [
        {
            key: "trigger_id",
            label: "Trigger",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.trigger_id,
            required: true,
        },
        {
            key: "event_type",
            label: "Event Type",
            type: "select",
            options: [
                { value: "shown", label: "Shown" },
                { value: "clicked", label: "Clicked" },
                { value: "converted", label: "Converted" },
                { value: "dismissed", label: "Dismissed" },
            ],
        },
        { key: "notes", label: "Notes", type: "textarea" },
    ],
};

export const CREATE_WORKER_COMPLIANCE_DOC_CONFIG: CreateEntityConfig = {
    entityName: "Worker Compliance Document",
    description: "Upload a worker compliance document.",
    fields: [
        {
            key: "worker_profile_id",
            label: "Worker",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.worker_profile_id,
            required: true,
        },
        {
            key: "doc_type",
            label: "Document Type",
            type: "text",
            placeholder: "e.g. W-9, Insurance",
            required: true,
        },
        { key: "name", label: "Document Name", type: "text", required: true },
        { key: "expiry_date", label: "Expiry Date", type: "date" },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: [
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
                { value: "expired", label: "Expired" },
            ],
        },
    ],
};

export const CREATE_WORKER_REVIEW_CONFIG: CreateEntityConfig = {
    entityName: "Worker Review",
    description: "Create a worker performance review.",
    fields: [
        {
            key: "worker_profile_id",
            label: "Worker",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.worker_profile_id,
            required: true,
        },
        {
            key: "review_type",
            label: "Review Type",
            type: "select",
            options: [
                { value: "performance", label: "Performance" },
                { value: "probation", label: "Probation" },
                { value: "annual", label: "Annual" },
                { value: "project", label: "Project-Based" },
            ],
        },
        {
            key: "overall_rating",
            label: "Overall Rating (1–5)",
            type: "number",
            min: 1,
            max: 5,
            step: 1,
        },
        { key: "summary", label: "Summary", type: "textarea" },
    ],
};

// ═══════════════════════════════════════════════════════════════
// DEPARTMENTS
// ═══════════════════════════════════════════════════════════════

export const CREATE_DEPARTMENT_CONFIG: CreateEntityConfig = {
    entityName: "Department",
    description: "Create a new department.",
    fields: [
        { key: "name", label: "Department Name", type: "text", required: true },
        { key: "slug", label: "Slug", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "cost_center_code", label: "Cost Center Code", type: "text" },
        { key: "head_user_id", label: "Department Head (User ID)", type: "text" },
        { key: "parent_department_id", label: "Parent Department (ID)", type: "text" },
        { key: "sort_order", label: "Sort Order", type: "number", min: 0 },
        { key: "is_active", label: "Active", type: "select", options: YES_NO_OPTIONS },
    ],
};

// ═══════════════════════════════════════════════════════════════
// LEAD SOURCES
// ═══════════════════════════════════════════════════════════════

export const CREATE_LEAD_SOURCE_CONFIG: CreateEntityConfig = {
    entityName: "Lead Source",
    description: "Create a new lead source for CRM tracking.",
    fields: [
        { key: "name", label: "Source Name", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
        {
            key: "category",
            label: "Category",
            type: "select",
            options: [
                { value: "referral", label: "Referral" },
                { value: "inbound", label: "Inbound" },
                { value: "outbound", label: "Outbound" },
                { value: "event", label: "Event" },
                { value: "partner", label: "Partner" },
                { value: "organic", label: "Organic" },
                { value: "paid", label: "Paid" },
                { value: "other", label: "Other" },
            ],
        },
        { key: "is_active", label: "Active", type: "select", options: YES_NO_OPTIONS },
    ],
};
