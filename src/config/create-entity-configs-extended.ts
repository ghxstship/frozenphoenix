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

        {
            key: "approver_id",
            label: "Approver",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.approver_id,
        },
        { key: "deadline", label: "Deadline", type: "text", placeholder: "Deadline" },
        { key: "deliverable_url", label: "Deliverable Url", type: "url" },
        {
            key: "milestone_id",
            label: "Milestone",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.milestone_id,
        },
        {
            key: "milestone_name",
            label: "Milestone Name",
            type: "text",
            placeholder: "Milestone Name",
        },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        {
            key: "timeline_impact_days",
            label: "Timeline Impact Days",
            type: "text",
            placeholder: "Timeline Impact Days",
        },

        { key: "requested_at", label: "Requested At", type: "text", placeholder: "Requested At" },
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

        {
            key: "activation_id",
            label: "Activation",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.activation_id,
        },
        { key: "check_out_date", label: "Check Out Date", type: "date" },
        { key: "expected_return_date", label: "Expected Return Date", type: "date" },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },

        { key: "actual_return_date", label: "Actual Return Date", type: "date" },
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

        { key: "tag_group", label: "Tag Group", type: "text", placeholder: "Tag Group" },
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

        {
            key: "action_config",
            label: "Action Config",
            type: "text",
            placeholder: "Action Config",
        },
        {
            key: "execution_order",
            label: "Execution Order",
            type: "text",
            placeholder: "Execution Order",
        },
        {
            key: "trigger_config",
            label: "Trigger Config",
            type: "text",
            placeholder: "Trigger Config",
        },
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

        { key: "code", label: "Code", type: "text", placeholder: "Code" },
        { key: "estimated_cost", label: "Estimated Cost", type: "currency" },
        {
            key: "output_quantity",
            label: "Output Quantity",
            type: "text",
            placeholder: "Output Quantity",
        },
        {
            key: "unit_of_measure",
            label: "Unit Of Measure",
            type: "text",
            placeholder: "Unit Of Measure",
        },
        { key: "version", label: "Version", type: "number", min: 0 },
        { key: "yield_factor", label: "Yield Factor", type: "text", placeholder: "Yield Factor" },

        {
            key: "digital_asset_id",
            label: "Digital Asset",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/digital-assets", labelField: "title" },
        },
        {
            key: "parent_bom_id",
            label: "Parent BOM",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/boms", labelField: "title" },
        },
        {
            key: "vertical_id",
            label: "Vertical",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/production-verticals", labelField: "name" },
        },
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

        { key: "color_accent", label: "Color Accent", type: "text", placeholder: "Color Accent" },
        {
            key: "color_background",
            label: "Color Background",
            type: "text",
            placeholder: "Color Background",
        },
        {
            key: "color_foreground",
            label: "Color Foreground",
            type: "text",
            placeholder: "Color Foreground",
        },
        { key: "color_muted", label: "Color Muted", type: "text", placeholder: "Color Muted" },
        {
            key: "color_primary",
            label: "Color Primary",
            type: "text",
            placeholder: "Color Primary",
        },
        { key: "support_email", label: "Support Email", type: "email" },
        {
            key: "support_phone",
            label: "Support Phone",
            type: "text",
            placeholder: "+1 (555) 000-0000",
        },
        { key: "support_url", label: "Support Url", type: "url" },
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

        {
            key: "default_deliverable_manifest",
            label: "Default Deliverable Manifest",
            type: "text",
            placeholder: "Default Deliverable Manifest",
        },
        { key: "default_kpis", label: "Default Kpis", type: "text", placeholder: "Default Kpis" },
        {
            key: "template_sections",
            label: "Template Sections",
            type: "text",
            placeholder: "Template Sections",
        },
        { key: "usage_count", label: "Usage Count", type: "number", min: 0 },
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

        { key: "amount", label: "Amount", type: "currency" },
        {
            key: "approval_level",
            label: "Approval Level",
            type: "text",
            placeholder: "Approval Level",
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
            key: "delegated_from",
            label: "Delegated From",
            type: "text",
            placeholder: "Delegated From",
        },
        {
            key: "delegated_reason",
            label: "Delegated Reason",
            type: "text",
            placeholder: "Delegated Reason",
        },
        {
            key: "justification",
            label: "Justification",
            type: "textarea",
            placeholder: "Justification...",
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        { key: "threshold_amount", label: "Threshold Amount", type: "currency" },
        {
            key: "threshold_rule",
            label: "Threshold Rule",
            type: "text",
            placeholder: "Threshold Rule",
        },

        { key: "expires_at", label: "Expires At", type: "text", placeholder: "Expires At" },
        { key: "requested_at", label: "Requested At", type: "text", placeholder: "Requested At" },
        { key: "requested_by", label: "Requested By", type: "text", placeholder: "Requested By" },

        {
            key: "parent_approval_id",
            label: "Parent Approval",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/approvals", labelField: "title" },
        },
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

        { key: "all_day", label: "All Day", type: "text", placeholder: "All Day" },
        { key: "color", label: "Color", type: "text", placeholder: "Color" },
        { key: "end_date", label: "End Date", type: "date" },
        { key: "event_type", label: "Event Type", type: "text", placeholder: "Event Type" },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "start_date", label: "Start Date", type: "date" },
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

        { key: "usage_count", label: "Usage Count", type: "number", min: 0 },
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

        {
            key: "applies_to_categories",
            label: "Applies To Categories",
            type: "text",
            placeholder: "Applies To Categories",
        },
        {
            key: "applies_to_vendor_types",
            label: "Applies To Vendor Types",
            type: "text",
            placeholder: "Applies To Vendor Types",
        },
        {
            key: "auto_suspend_on_expiry",
            label: "Auto Suspend On Expiry",
            type: "text",
            placeholder: "Auto Suspend On Expiry",
        },
        { key: "doc_type", label: "Doc Type", type: "text", placeholder: "Doc Type" },
        {
            key: "expiry_warning_days",
            label: "Expiry Warning Days",
            type: "text",
            placeholder: "Expiry Warning Days",
        },
        { key: "has_expiry", label: "Has Expiry", type: "select", options: YES_NO_OPTIONS },
        { key: "is_required", label: "Is Required", type: "select", options: YES_NO_OPTIONS },
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

        { key: "asset_class", label: "Asset Class", type: "text", placeholder: "Asset Class" },
        { key: "batch_number", label: "Batch Number", type: "text", placeholder: "Batch Number" },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Description...",
        },
        { key: "expiry_date", label: "Expiry Date", type: "date" },
        { key: "is_hazardous", label: "Is Hazardous", type: "select", options: YES_NO_OPTIONS },
        {
            key: "location_id",
            label: "Location",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.location_id,
        },
        { key: "lot_number", label: "Lot Number", type: "text", placeholder: "Lot Number" },
        {
            key: "reorder_quantity",
            label: "Reorder Quantity",
            type: "text",
            placeholder: "Reorder Quantity",
        },
        { key: "sku", label: "Sku", type: "text", placeholder: "Sku" },
        { key: "unit_cost", label: "Unit Cost", type: "currency" },
        {
            key: "warehouse_location_id",
            label: "Warehouse Loc.",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/warehouse-locations", labelField: "name" },
        },

        {
            key: "preferred_vendor_id",
            label: "Preferred Vendor",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/vendors", labelField: "name" },
        },
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

        {
            key: "amendment_number",
            label: "Amendment Number",
            type: "text",
            placeholder: "Amendment Number",
        },
        { key: "document_url", label: "Document Url", type: "url" },
        { key: "expiration_date", label: "Expiration Date", type: "date" },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Notes..." },
        {
            key: "schedule_impact_days",
            label: "Schedule Impact Days",
            type: "text",
            placeholder: "Schedule Impact Days",
        },
        {
            key: "scope_changes",
            label: "Scope Changes",
            type: "text",
            placeholder: "Scope Changes",
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        { key: "value_impact", label: "Value Impact", type: "text", placeholder: "Value Impact" },

        {
            key: "counterparty_signed_at",
            label: "Counterparty Signed At",
            type: "text",
            placeholder: "Counterparty Signed At",
        },
        {
            key: "counterparty_signed_by",
            label: "Counterparty Signed By",
            type: "text",
            placeholder: "Counterparty Signed By",
        },
        { key: "prepared_by", label: "Prepared By", type: "text", placeholder: "Prepared By" },
        { key: "reviewed_at", label: "Reviewed At", type: "text", placeholder: "Reviewed At" },
        { key: "reviewed_by", label: "Reviewed By", type: "text", placeholder: "Reviewed By" },
        { key: "signed_by", label: "Signed By", type: "text", placeholder: "Signed By" },
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

        {
            key: "amendment_of_id",
            label: "Amendment Of",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/briefs", labelField: "title" },
        },
        {
            key: "brand_guideline_id",
            label: "Brand Guideline",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/brand-guidelines", labelField: "title" },
        },
        {
            key: "budget_breakdown",
            label: "Budget Breakdown",
            type: "text",
            placeholder: "Budget Breakdown",
        },
        {
            key: "business_objectives",
            label: "Business Objectives",
            type: "text",
            placeholder: "Business Objectives",
        },
        { key: "channels", label: "Channels", type: "text", placeholder: "Channels" },
        {
            key: "company_id",
            label: "Company",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.company_id,
        },
        {
            key: "competitive_context",
            label: "Competitive Context",
            type: "text",
            placeholder: "Competitive Context",
        },
        {
            key: "competitor_references",
            label: "Competitor References",
            type: "text",
            placeholder: "Competitor References",
        },
        {
            key: "contingency_pct",
            label: "Contingency Pct",
            type: "text",
            placeholder: "Contingency Pct",
        },
        {
            key: "contributor_ids",
            label: "Contributor Ids",
            type: "text",
            placeholder: "Contributor Ids",
        },
        {
            key: "deal_id",
            label: "Deal",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.deal_id,
        },
        {
            key: "deliverable_manifest",
            label: "Deliverable Manifest",
            type: "text",
            placeholder: "Deliverable Manifest",
        },
        { key: "end_date", label: "End Date", type: "date" },
        {
            key: "inspiration_assets",
            label: "Inspiration Assets",
            type: "text",
            placeholder: "Inspiration Assets",
        },
        {
            key: "kpi_definitions",
            label: "Kpi Definitions",
            type: "text",
            placeholder: "Kpi Definitions",
        },
        {
            key: "milestone_dates",
            label: "Milestone Dates",
            type: "text",
            placeholder: "Milestone Dates",
        },
        {
            key: "objective_summary",
            label: "Objective Summary",
            type: "text",
            placeholder: "Objective Summary",
        },
        {
            key: "owner_id",
            label: "Owner",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.owner_id,
        },
        { key: "personas", label: "Personas", type: "text", placeholder: "Personas" },
        {
            key: "previous_campaign_ids",
            label: "Previous Campaign Ids",
            type: "text",
            placeholder: "Previous Campaign Ids",
        },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        {
            key: "retrospective_notes",
            label: "Retrospective Notes",
            type: "text",
            placeholder: "Retrospective Notes",
        },
        { key: "start_date", label: "Start Date", type: "date" },
        {
            key: "success_criteria",
            label: "Success Criteria",
            type: "text",
            placeholder: "Success Criteria",
        },
        {
            key: "target_segments",
            label: "Target Segments",
            type: "text",
            placeholder: "Target Segments",
        },
        {
            key: "template_id",
            label: "Template",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/templates", labelField: "name" },
        },
        {
            key: "tone_direction",
            label: "Tone Direction",
            type: "text",
            placeholder: "Tone Direction",
        },
        { key: "total_budget", label: "Total Budget", type: "currency" },
        { key: "version", label: "Version", type: "number", min: 0 },
        {
            key: "visual_direction",
            label: "Visual Direction",
            type: "text",
            placeholder: "Visual Direction",
        },
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

        { key: "annotations", label: "Annotations", type: "text", placeholder: "Annotations" },
        { key: "feedback", label: "Feedback", type: "text", placeholder: "Feedback" },
        {
            key: "review_deadline",
            label: "Review Deadline",
            type: "text",
            placeholder: "Review Deadline",
        },
        {
            key: "reviewer_id",
            label: "Reviewer",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.reviewer_id,
        },
        { key: "score", label: "Score", type: "text", placeholder: "Score" },

        { key: "requested_at", label: "Requested At", type: "text", placeholder: "Requested At" },
        { key: "reviewed_at", label: "Reviewed At", type: "text", placeholder: "Reviewed At" },

        {
            key: "campaign_asset_id",
            label: "Campaign Asset",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/campaign-assets", labelField: "name" },
        },
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

        { key: "background_check_date", label: "Background Check Date", type: "date" },
        {
            key: "capacity_hours_per_day",
            label: "Capacity Hours Per Day",
            type: "text",
            placeholder: "Capacity Hours Per Day",
        },
        { key: "day_rate", label: "Day Rate", type: "currency" },
        { key: "drug_test_date", label: "Drug Test Date", type: "date" },
        {
            key: "emergency_contact",
            label: "Emergency Contact",
            type: "text",
            placeholder: "Emergency Contact",
        },
        {
            key: "emergency_contact_name",
            label: "Emergency Contact Name",
            type: "text",
            placeholder: "Emergency Contact Name",
        },
        {
            key: "employee_id",
            label: "Employee",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/user-profiles", labelField: "display_name" },
        },
        {
            key: "employment_type",
            label: "Employment Type",
            type: "text",
            placeholder: "Employment Type",
        },
        { key: "hire_date", label: "Hire Date", type: "date" },
        { key: "hourly_rate", label: "Hourly Rate", type: "currency" },
        { key: "i9_verified", label: "I9 Verified", type: "text", placeholder: "I9 Verified" },
        { key: "name", label: "Name", type: "text", placeholder: "Name" },
        { key: "primary_role", label: "Primary Role", type: "text", placeholder: "Primary Role" },
        { key: "reports_to", label: "Reports To", type: "text", placeholder: "Reports To" },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        {
            key: "supervisor_id",
            label: "Supervisor",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.supervisor_id,
        },
        { key: "termination_date", label: "Termination Date", type: "date" },
        { key: "union_local", label: "Union Local", type: "text", placeholder: "Union Local" },
        { key: "union_member", label: "Union Member", type: "text", placeholder: "Union Member" },
        {
            key: "worker_profile_id",
            label: "Worker Profile",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.worker_profile_id,
        },
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

        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
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

        { key: "default_value", label: "Default Value", type: "currency" },
        { key: "entity_types", label: "Entity Types", type: "text", placeholder: "Entity Types" },
        { key: "is_filterable", label: "Is Filterable", type: "select", options: YES_NO_OPTIONS },
        { key: "options", label: "Options", type: "text", placeholder: "Options" },
        { key: "section", label: "Section", type: "text", placeholder: "Section" },
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

        {
            key: "accumulated_depreciation",
            label: "Accumulated Depreciation",
            type: "text",
            placeholder: "Accumulated Depreciation",
        },
        { key: "cost_basis", label: "Cost Basis", type: "text", placeholder: "Cost Basis" },
        { key: "current_book_value", label: "Current Book Value", type: "currency" },
        {
            key: "gl_account_id",
            label: "GL Account",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/gl-accounts", labelField: "name" },
        },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Notes..." },
        { key: "residual_value", label: "Residual Value", type: "currency" },

        {
            key: "last_calculated_at",
            label: "Last Calculated At",
            type: "text",
            placeholder: "Last Calculated At",
        },
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

        { key: "content", label: "Content", type: "textarea", placeholder: "Content..." },
        {
            key: "document_type",
            label: "Document Type",
            type: "text",
            placeholder: "Document Type",
        },
        { key: "preview_image_url", label: "Preview Image Url", type: "url" },
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

        { key: "access_token", label: "Access Token", type: "text", placeholder: "Access Token" },
        { key: "signer_email", label: "Signer Email", type: "email" },
        { key: "signer_name", label: "Signer Name", type: "text", placeholder: "Signer Name" },
        { key: "signer_role", label: "Signer Role", type: "text", placeholder: "Signer Role" },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },

        { key: "expires_at", label: "Expires At", type: "text", placeholder: "Expires At" },
        {
            key: "reminder_sent_at",
            label: "Reminder Sent At",
            type: "text",
            placeholder: "Reminder Sent At",
        },
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
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Description...",
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        { key: "total_amount", label: "Total Amount", type: "currency" },

        { key: "submitted_by", label: "Submitted By", type: "text", placeholder: "Submitted By" },
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

        {
            key: "live_event_id",
            label: "Live Event",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/live-events", labelField: "name" },
        },
        {
            key: "location_description",
            label: "Location Description",
            type: "text",
            placeholder: "Location Description",
        },

        {
            key: "zone_lead_id",
            label: "Zone Lead",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/user-profiles", labelField: "display_name" },
        },
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

        {
            key: "compensation_offered",
            label: "Compensation Offered",
            type: "text",
            placeholder: "Compensation Offered",
        },
        {
            key: "escalated_to_incident_id",
            label: "Escalated To",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/incidents", labelField: "title" },
        },
        {
            key: "foh_zone_id",
            label: "FOH Zone",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/foh-zones", labelField: "name" },
        },
        {
            key: "guest_contact",
            label: "Guest Contact",
            type: "text",
            placeholder: "Guest Contact",
        },
        {
            key: "live_event_id",
            label: "Live Event",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/live-events", labelField: "name" },
        },
        { key: "resolution", label: "Resolution", type: "textarea", placeholder: "Resolution..." },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        { key: "type", label: "Type", type: "text", placeholder: "Type" },

        { key: "reported_at", label: "Reported At", type: "text", placeholder: "Reported At" },
        { key: "reported_by", label: "Reported By", type: "text", placeholder: "Reported By" },
        { key: "resolved_at", label: "Resolved At", type: "text", placeholder: "Resolved At" },

        {
            key: "assigned_to_id",
            label: "Assigned To",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/user-profiles", labelField: "display_name" },
        },
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

        {
            key: "auto_suspend_on_expiry",
            label: "Auto Suspend On Expiry",
            type: "text",
            placeholder: "Auto Suspend On Expiry",
        },
        {
            key: "contract_category",
            label: "Contract Category",
            type: "text",
            placeholder: "Contract Category",
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
            key: "expiry_warning_days",
            label: "Expiry Warning Days",
            type: "text",
            placeholder: "Expiry Warning Days",
        },
        {
            key: "required_before",
            label: "Required Before",
            type: "text",
            placeholder: "Required Before",
        },
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

        { key: "audit_type", label: "Audit Type", type: "text", placeholder: "Audit Type" },
        { key: "discrepancy_count", label: "Discrepancy Count", type: "number", min: 0 },
        { key: "discrepancy_value", label: "Discrepancy Value", type: "currency" },
        { key: "planned_date", label: "Planned Date", type: "date" },
        {
            key: "total_items_counted",
            label: "Total Items Counted",
            type: "text",
            placeholder: "Total Items Counted",
        },
        {
            key: "zone_id",
            label: "Zone",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.zone_id,
        },

        { key: "conducted_by", label: "Conducted By", type: "text", placeholder: "Conducted By" },

        {
            key: "warehouse_id",
            label: "Warehouse",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/warehouses", labelField: "name" },
        },
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

        { key: "accent_color", label: "Accent Color", type: "text", placeholder: "Accent Color" },
        { key: "bank_details", label: "Bank Details", type: "text", placeholder: "Bank Details" },
        { key: "footer_text", label: "Footer Text", type: "text", placeholder: "Footer Text" },
        { key: "header_text", label: "Header Text", type: "text", placeholder: "Header Text" },
        {
            key: "payment_instructions",
            label: "Payment Instructions",
            type: "text",
            placeholder: "Payment Instructions",
        },
        {
            key: "primary_color",
            label: "Primary Color",
            type: "text",
            placeholder: "Primary Color",
        },
        {
            key: "show_company_address",
            label: "Show Company Address",
            type: "text",
            placeholder: "Show Company Address",
        },
        {
            key: "show_line_item_details",
            label: "Show Line Item Details",
            type: "text",
            placeholder: "Show Line Item Details",
        },
        { key: "show_logo", label: "Show Logo", type: "text", placeholder: "Show Logo" },
        {
            key: "show_tax_breakdown",
            label: "Show Tax Breakdown",
            type: "text",
            placeholder: "Show Tax Breakdown",
        },
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

        { key: "billable", label: "Billable", type: "text", placeholder: "Billable" },
        { key: "billed", label: "Billed", type: "text", placeholder: "Billed" },
        { key: "budgeted_amount", label: "Budgeted Amount", type: "currency" },
        { key: "cost_date", label: "Cost Date", type: "date" },
        { key: "cost_type", label: "Cost Type", type: "text", placeholder: "Cost Type" },
        {
            key: "crew_member_id",
            label: "Crew Member",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.crew_member_id,
        },
        {
            key: "expense_id",
            label: "Expense",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/expenses", labelField: "description" },
        },
        {
            key: "invoice_id",
            label: "Invoice",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/invoices", labelField: "number" },
        },
        { key: "quantity", label: "Quantity", type: "number", min: 0 },
        {
            key: "time_entry_id",
            label: "Time Entry",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/time-entries", labelField: "description" },
        },
        { key: "unit", label: "Unit", type: "text", placeholder: "Unit" },
        { key: "unit_cost", label: "Unit Cost", type: "currency" },
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

        { key: "barcode", label: "Barcode", type: "text", placeholder: "Barcode" },
        {
            key: "template_id",
            label: "Template",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/templates", labelField: "name" },
        },
        { key: "total_value", label: "Total Value", type: "currency" },
        { key: "total_weight", label: "Total Weight", type: "number", min: 0 },
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

        {
            key: "acknowledgment_ids",
            label: "Acknowledgment Ids",
            type: "text",
            placeholder: "Acknowledgment Ids",
        },
        {
            key: "attachment_ids",
            label: "Attachment Ids",
            type: "text",
            placeholder: "Attachment Ids",
        },
        { key: "next_review_date", label: "Next Review Date", type: "date" },
        { key: "purpose", label: "Purpose", type: "textarea", placeholder: "Purpose..." },
        {
            key: "related_article_ids",
            label: "Related Article Ids",
            type: "text",
            placeholder: "Related Article Ids",
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        { key: "summary", label: "Summary", type: "text", placeholder: "Summary" },
        { key: "version", label: "Version", type: "number", min: 0 },

        { key: "reviewed_at", label: "Reviewed At", type: "text", placeholder: "Reviewed At" },

        {
            key: "author_id",
            label: "Author",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/user-profiles", labelField: "display_name" },
        },
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

        { key: "counsel_name", label: "Counsel Name", type: "text", placeholder: "Counsel Name" },
        {
            key: "matter_number",
            label: "Matter Number",
            type: "text",
            placeholder: "Matter Number",
        },
        { key: "scope_type", label: "Scope Type", type: "text", placeholder: "Scope Type" },

        { key: "placed_at", label: "Placed At", type: "text", placeholder: "Placed At" },
        { key: "placed_by", label: "Placed By", type: "text", placeholder: "Placed By" },
        { key: "released_at", label: "Released At", type: "text", placeholder: "Released At" },
        { key: "released_by", label: "Released By", type: "text", placeholder: "Released By" },
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

        {
            key: "departure_datetime",
            label: "Departure Datetime",
            type: "text",
            placeholder: "Departure Datetime",
        },
        {
            key: "load_sequence_notes",
            label: "Load Sequence Notes",
            type: "text",
            placeholder: "Load Sequence Notes",
        },
        {
            key: "shipment_id",
            label: "Shipment",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.shipment_id,
        },
        {
            key: "special_instructions",
            label: "Special Instructions",
            type: "textarea",
            placeholder: "Special Instructions...",
        },
        { key: "total_weight", label: "Total Weight", type: "number", min: 0 },
        { key: "utilization_percent", label: "Utilization Percent", type: "number", min: 0 },
        {
            key: "weight_capacity",
            label: "Weight Capacity",
            type: "text",
            placeholder: "Weight Capacity",
        },

        { key: "planned_by", label: "Planned By", type: "text", placeholder: "Planned By" },

        {
            key: "vehicle_id",
            label: "Vehicle",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/vehicles", labelField: "name" },
        },
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

        { key: "date", label: "Date", type: "date" },
        { key: "downtime_hours", label: "Downtime Hours", type: "number", min: 0 },
        {
            key: "maintenance_schedule_id",
            label: "Maint. Schedule",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/maintenance-schedules", labelField: "name" },
        },
        { key: "next_due_date", label: "Next Due Date", type: "date" },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Notes..." },
        { key: "parts_used", label: "Parts Used", type: "text", placeholder: "Parts Used" },
        { key: "type", label: "Type", type: "text", placeholder: "Type" },
        {
            key: "vendor_id",
            label: "Vendor",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.vendor_id,
        },
        {
            key: "warranty_claim",
            label: "Warranty Claim",
            type: "text",
            placeholder: "Warranty Claim",
        },
        {
            key: "warranty_claim_number",
            label: "Warranty Claim Number",
            type: "text",
            placeholder: "Warranty Claim Number",
        },
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

        {
            key: "enable_item_modifications",
            label: "Enable Item Modifications",
            type: "text",
            placeholder: "Enable Item Modifications",
        },
        { key: "sso_domain", label: "Sso Domain", type: "text", placeholder: "Sso Domain" },
        { key: "tagline", label: "Tagline", type: "text", placeholder: "Tagline" },
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

        { key: "amount", label: "Amount", type: "currency" },
        {
            key: "budget_within_limit",
            label: "Budget Within Limit",
            type: "text",
            placeholder: "Budget Within Limit",
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
            key: "delegated_from",
            label: "Delegated From",
            type: "text",
            placeholder: "Delegated From",
        },
        { key: "payee_name", label: "Payee Name", type: "text", placeholder: "Payee Name" },
        { key: "payment_type", label: "Payment Type", type: "text", placeholder: "Payment Type" },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        {
            key: "three_way_match_verified",
            label: "Three Way Match Verified",
            type: "text",
            placeholder: "Three Way Match Verified",
        },
        { key: "threshold_amount", label: "Threshold Amount", type: "currency" },
        {
            key: "threshold_rule",
            label: "Threshold Rule",
            type: "text",
            placeholder: "Threshold Rule",
        },
        {
            key: "vendor_compliance_verified",
            label: "Vendor Compliance Verified",
            type: "text",
            placeholder: "Vendor Compliance Verified",
        },
        {
            key: "vendor_id",
            label: "Vendor",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.vendor_id,
        },

        { key: "expires_at", label: "Expires At", type: "text", placeholder: "Expires At" },
        { key: "requested_at", label: "Requested At", type: "text", placeholder: "Requested At" },
        { key: "requested_by", label: "Requested By", type: "text", placeholder: "Requested By" },
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

        { key: "period_end", label: "Period End", type: "date" },
        { key: "period_start", label: "Period Start", type: "date" },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        {
            key: "tax_withholding_total",
            label: "Tax Withholding Total",
            type: "text",
            placeholder: "Tax Withholding Total",
        },
        {
            key: "time_entry_ids",
            label: "Time Entry Ids",
            type: "text",
            placeholder: "Time Entry Ids",
        },
        {
            key: "total_deductions",
            label: "Total Deductions",
            type: "text",
            placeholder: "Total Deductions",
        },
        { key: "total_gross", label: "Total Gross", type: "text", placeholder: "Total Gross" },
        { key: "total_net", label: "Total Net", type: "text", placeholder: "Total Net" },
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

        {
            key: "assets_damaged",
            label: "Assets Damaged",
            type: "text",
            placeholder: "Assets Damaged",
        },
        {
            key: "assets_missing",
            label: "Assets Missing",
            type: "text",
            placeholder: "Assets Missing",
        },
        { key: "challenges", label: "Challenges", type: "text", placeholder: "Challenges" },
        { key: "final_margin_percent", label: "Final Margin Percent", type: "number", min: 0 },
        { key: "highlights", label: "Highlights", type: "text", placeholder: "Highlights" },
        {
            key: "incidents_by_severity",
            label: "Incidents By Severity",
            type: "text",
            placeholder: "Incidents By Severity",
        },
        {
            key: "live_event_id",
            label: "Live Event",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/live-events", labelField: "name" },
        },
        {
            key: "load_in_variance_minutes",
            label: "Load In Variance Minutes",
            type: "text",
            placeholder: "Load In Variance Minutes",
        },
        { key: "nps_score", label: "Nps Score", type: "text", placeholder: "Nps Score" },
        {
            key: "peak_attendance",
            label: "Peak Attendance",
            type: "text",
            placeholder: "Peak Attendance",
        },
        {
            key: "recommendations",
            label: "Recommendations",
            type: "text",
            placeholder: "Recommendations",
        },
        {
            key: "show_end_variance_minutes",
            label: "Show End Variance Minutes",
            type: "text",
            placeholder: "Show End Variance Minutes",
        },
        {
            key: "show_start_variance_minutes",
            label: "Show Start Variance Minutes",
            type: "text",
            placeholder: "Show Start Variance Minutes",
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        {
            key: "strike_variance_minutes",
            label: "Strike Variance Minutes",
            type: "text",
            placeholder: "Strike Variance Minutes",
        },
        {
            key: "total_assets_deployed",
            label: "Total Assets Deployed",
            type: "text",
            placeholder: "Total Assets Deployed",
        },
        {
            key: "total_attendance",
            label: "Total Attendance",
            type: "text",
            placeholder: "Total Attendance",
        },
        { key: "total_budget", label: "Total Budget", type: "currency" },
        { key: "total_damage_cost", label: "Total Damage Cost", type: "currency" },
        {
            key: "total_incidents",
            label: "Total Incidents",
            type: "text",
            placeholder: "Total Incidents",
        },
        {
            key: "total_revenue",
            label: "Total Revenue",
            type: "text",
            placeholder: "Total Revenue",
        },
        { key: "total_spent", label: "Total Spent", type: "text", placeholder: "Total Spent" },
        {
            key: "vendor_scores",
            label: "Vendor Scores",
            type: "text",
            placeholder: "Vendor Scores",
        },
        { key: "vip_count", label: "Vip Count", type: "number", min: 0 },

        { key: "compiled_at", label: "Compiled At", type: "text", placeholder: "Compiled At" },
        { key: "compiled_by", label: "Compiled By", type: "text", placeholder: "Compiled By" },
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

        {
            key: "advance_number",
            label: "Advance Number",
            type: "text",
            placeholder: "Advance Number",
        },
        {
            key: "client_notes",
            label: "Client Notes",
            type: "textarea",
            placeholder: "Client Notes...",
        },
        {
            key: "client_originated",
            label: "Client Originated",
            type: "text",
            placeholder: "Client Originated",
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
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Description...",
        },
        {
            key: "event_id",
            label: "Event",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.event_id,
        },
        {
            key: "internal_notes",
            label: "Internal Notes",
            type: "textarea",
            placeholder: "Internal Notes...",
        },
        {
            key: "point_of_contact",
            label: "Point Of Contact",
            type: "text",
            placeholder: "Point Of Contact",
        },
        { key: "priority", label: "Priority", type: "text", placeholder: "Priority" },
        {
            key: "service_duration_days",
            label: "Service Duration Days",
            type: "text",
            placeholder: "Service Duration Days",
        },
        { key: "service_end_date", label: "Service End Date", type: "date" },
        { key: "service_start_date", label: "Service Start Date", type: "date" },
        {
            key: "source_template_id",
            label: "Source Template",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/templates", labelField: "name" },
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        { key: "total_actual_cost", label: "Total Actual Cost", type: "currency" },
        { key: "total_estimated_cost", label: "Total Estimated Cost", type: "currency" },
        { key: "total_items", label: "Total Items", type: "text", placeholder: "Total Items" },

        { key: "fulfilled_at", label: "Fulfilled At", type: "text", placeholder: "Fulfilled At" },
        { key: "submitted_by", label: "Submitted By", type: "text", placeholder: "Submitted By" },
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

        { key: "completion_percent", label: "Completion Percent", type: "number", min: 0 },
        { key: "due_date", label: "Due Date", type: "date" },
        {
            key: "event_id",
            label: "Event",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.event_id,
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        {
            key: "template_id",
            label: "Template",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/templates", labelField: "name" },
        },
        { key: "title", label: "Title", type: "text", placeholder: "Title" },
        { key: "type", label: "Type", type: "text", placeholder: "Type" },

        {
            key: "assigned_to_id",
            label: "Assigned To",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/user-profiles", labelField: "display_name" },
        },
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

        {
            key: "budget_line_id",
            label: "Budget Line",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/budget-line-items", labelField: "description" },
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
        { key: "expense_date", label: "Expense Date", type: "date" },
        {
            key: "invoice_id",
            label: "Invoice",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/invoices", labelField: "number" },
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
        {
            key: "justification",
            label: "Justification",
            type: "textarea",
            placeholder: "Justification...",
        },
        {
            key: "purchase_order_id",
            label: "Purchase Order",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.purchase_order_id,
        },
        { key: "receipt_url", label: "Receipt Url", type: "url" },
        { key: "reimbursable", label: "Reimbursable", type: "text", placeholder: "Reimbursable" },
        {
            key: "sow_deliverable_id",
            label: "SOW Deliverable",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/sow-deliverables", labelField: "title" },
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        {
            key: "vendor_id",
            label: "Vendor",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.vendor_id,
        },
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
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
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

        { key: "batch_number", label: "Batch Number", type: "text", placeholder: "Batch Number" },
        {
            key: "bom_id",
            label: "Bill of Materials",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/boms", labelField: "title" },
        },
        {
            key: "environmental_waste_kg",
            label: "Environmental Waste Kg",
            type: "text",
            placeholder: "Environmental Waste Kg",
        },
        {
            key: "equipment_ids",
            label: "Equipment Ids",
            type: "text",
            placeholder: "Equipment Ids",
        },
        {
            key: "location_id",
            label: "Location",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.location_id,
        },
        {
            key: "planned_quantity",
            label: "Planned Quantity",
            type: "text",
            placeholder: "Planned Quantity",
        },
        { key: "run_number", label: "Run Number", type: "text", placeholder: "Run Number" },
        {
            key: "waste_quantity",
            label: "Waste Quantity",
            type: "text",
            placeholder: "Waste Quantity",
        },
        {
            key: "work_package_id",
            label: "Work Package",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/work-packages", labelField: "name" },
        },
        { key: "yield_percent", label: "Yield Percent", type: "number", min: 0 },

        {
            key: "actual_output",
            label: "Actual Output",
            type: "text",
            placeholder: "Actual Output",
        },

        {
            key: "operator_id",
            label: "Operator",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/user-profiles", labelField: "display_name" },
        },
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

        {
            key: "applicable_roles",
            label: "Applicable Roles",
            type: "text",
            placeholder: "Applicable Roles",
        },
        { key: "effective_date", label: "Effective Date", type: "date" },
        { key: "form_ids", label: "Form Ids", type: "text", placeholder: "Form Ids" },
        { key: "number", label: "Number", type: "text", placeholder: "Number" },
        {
            key: "owner_id",
            label: "Owner",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.owner_id,
        },
        { key: "purpose", label: "Purpose", type: "textarea", placeholder: "Purpose..." },
        {
            key: "related_sop_ids",
            label: "Related Sop Ids",
            type: "text",
            placeholder: "Related Sop Ids",
        },
        {
            key: "requires_training",
            label: "Requires Training",
            type: "select",
            options: YES_NO_OPTIONS,
        },
        { key: "review_date", label: "Review Date", type: "date" },
        {
            key: "safety_related",
            label: "Safety Related",
            type: "text",
            placeholder: "Safety Related",
        },
        { key: "scope", label: "Scope", type: "textarea", placeholder: "Scope..." },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        { key: "steps", label: "Steps", type: "text", placeholder: "Steps" },
        {
            key: "training_material_ids",
            label: "Training Material Ids",
            type: "text",
            placeholder: "Training Material Ids",
        },
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
        {
            key: "assignee_id",
            label: "Assignee",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.assignee_id,
        },
        { key: "blockers", label: "Blockers", type: "textarea", placeholder: "Blockers..." },
        {
            key: "deliverables",
            label: "Deliverables",
            type: "textarea",
            placeholder: "Deliverables...",
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Description...",
        },
        { key: "estimated_hours", label: "Estimated Hours", type: "number", min: 0 },
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
        {
            key: "milestone_id",
            label: "Milestone",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.milestone_id,
        },
        {
            key: "parent_task_id",
            label: "Parent Task",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.parent_task_id,
        },
        { key: "phase", label: "Phase", type: "text", placeholder: "Phase" },
        {
            key: "reviewer_id",
            label: "Reviewer",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.reviewer_id,
        },
        {
            key: "sow_deliverable_id",
            label: "SOW Deliverable",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/sow-deliverables", labelField: "title" },
        },
        { key: "start_date", label: "Start Date", type: "date" },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        { key: "title", label: "Title", type: "text", placeholder: "Title" },
        {
            key: "vendor_id",
            label: "Vendor",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.vendor_id,
        },
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

        {
            key: "applicable_budget_categories",
            label: "Applicable Budget Categories",
            type: "text",
            placeholder: "Applicable Budget Categories",
        },
        { key: "color", label: "Color", type: "text", placeholder: "Color" },
        {
            key: "default_qc_gates",
            label: "Default Qc Gates",
            type: "text",
            placeholder: "Default Qc Gates",
        },
        { key: "icon", label: "Icon", type: "text", placeholder: "Icon" },
        {
            key: "phase_definitions",
            label: "Phase Definitions",
            type: "text",
            placeholder: "Phase Definitions",
        },
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

        {
            key: "compliance_doc_id",
            label: "Compliance Doc",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/compliance-checklists", labelField: "title" },
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Description...",
        },
        {
            key: "next_gate_id",
            label: "Next Gate",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/qc-gates", labelField: "title" },
        },
        {
            key: "permit_id",
            label: "Permit",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/permits", labelField: "title" },
        },
        {
            key: "production_run_id",
            label: "Production Run",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/production-runs", labelField: "name" },
        },
        { key: "required", label: "Required", type: "text", placeholder: "Required" },
        {
            key: "reviewer_id",
            label: "Reviewer",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.reviewer_id,
        },
        { key: "title", label: "Title", type: "text", placeholder: "Title" },
        {
            key: "work_package_id",
            label: "Work Package",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/work-packages", labelField: "name" },
        },

        { key: "reviewed_at", label: "Reviewed At", type: "text", placeholder: "Reviewed At" },
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

        { key: "check_items", label: "Check Items", type: "text", placeholder: "Check Items" },
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

        { key: "columns", label: "Columns", type: "text", placeholder: "Columns" },
        { key: "type", label: "Type", type: "text", placeholder: "Type" },

        { key: "group_by", label: "Group By", type: "text", placeholder: "Group By" },
        { key: "sort_by", label: "Sort By", type: "text", placeholder: "Sort By" },
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

        {
            key: "backup_frequency",
            label: "Backup Frequency",
            type: "text",
            placeholder: "Backup Frequency",
        },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Notes..." },
        { key: "rpo_minutes", label: "Rpo Minutes", type: "text", placeholder: "Rpo Minutes" },
        { key: "rto_minutes", label: "Rto Minutes", type: "text", placeholder: "Rto Minutes" },
        { key: "service_name", label: "Service Name", type: "text", placeholder: "Service Name" },
        { key: "test_result", label: "Test Result", type: "text", placeholder: "Test Result" },

        {
            key: "last_tested_at",
            label: "Last Tested At",
            type: "text",
            placeholder: "Last Tested At",
        },
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

        {
            key: "change_order_id",
            label: "Change Order",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/change-orders", labelField: "number" },
        },
        {
            key: "client_invoice_id",
            label: "Client Invoice",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/client-invoices", labelField: "number" },
        },
        { key: "contracted_amount", label: "Contracted Amount", type: "currency" },
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
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Description...",
        },
        { key: "invoiced_amount", label: "Invoiced Amount", type: "currency" },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Notes..." },
        { key: "recognized_amount", label: "Recognized Amount", type: "currency" },
        { key: "scheduled_date", label: "Scheduled Date", type: "date" },
        {
            key: "sow_deliverable_id",
            label: "SOW Deliverable",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/sow-deliverables", labelField: "title" },
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        { key: "type", label: "Type", type: "text", placeholder: "Type" },

        { key: "invoiced_at", label: "Invoiced At", type: "text", placeholder: "Invoiced At" },
        {
            key: "recognized_at",
            label: "Recognized At",
            type: "text",
            placeholder: "Recognized At",
        },
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

        { key: "content", label: "Content", type: "textarea", placeholder: "Content..." },
        { key: "external_url", label: "External Url", type: "url" },
        { key: "flagged", label: "Flagged", type: "text", placeholder: "Flagged" },
        { key: "helpful_count", label: "Helpful Count", type: "number", min: 0 },
        { key: "platform", label: "Platform", type: "text", placeholder: "Platform" },
        { key: "rating", label: "Rating", type: "text", placeholder: "Rating" },
        { key: "response", label: "Response", type: "text", placeholder: "Response" },
        { key: "response_date", label: "Response Date", type: "date" },
        { key: "review_date", label: "Review Date", type: "date" },
        { key: "reviewer_avatar_url", label: "Reviewer Avatar Url", type: "url" },
        {
            key: "reviewer_name",
            label: "Reviewer Name",
            type: "text",
            placeholder: "Reviewer Name",
        },
        { key: "title", label: "Title", type: "text", placeholder: "Title" },
        { key: "visible", label: "Visible", type: "text", placeholder: "Visible" },
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

        { key: "cycle_type", label: "Cycle Type", type: "text", placeholder: "Cycle Type" },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
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

        { key: "budget_code", label: "Budget Code", type: "text", placeholder: "Budget Code" },
        { key: "issue_date", label: "Issue Date", type: "date" },
        {
            key: "justification",
            label: "Justification",
            type: "textarea",
            placeholder: "Justification...",
        },
        { key: "number", label: "Number", type: "text", placeholder: "Number" },
        { key: "required_by_date", label: "Required By Date", type: "date" },
        {
            key: "response_deadline",
            label: "Response Deadline",
            type: "text",
            placeholder: "Response Deadline",
        },
        { key: "responses", label: "Responses", type: "text", placeholder: "Responses" },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        { key: "vendor_ids", label: "Vendor Ids", type: "text", placeholder: "Vendor Ids" },

        {
            key: "awarded_po_id",
            label: "Awarded PO",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/purchase-orders", labelField: "number" },
        },
        {
            key: "delivery_location_id",
            label: "Delivery Location",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/locations", labelField: "name" },
        },
        {
            key: "requested_by_id",
            label: "Requested By",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/user-profiles", labelField: "display_name" },
        },
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

        {
            key: "applies_to_role",
            label: "Applies To Role",
            type: "text",
            placeholder: "Applies To Role",
        },
        { key: "warning_percent", label: "Warning Percent", type: "number", min: 0 },
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

        {
            key: "activation_id",
            label: "Activation",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.activation_id,
        },
        { key: "booking_type", label: "Booking Type", type: "text", placeholder: "Booking Type" },
        { key: "end_datetime", label: "End Datetime", type: "text", placeholder: "End Datetime" },
        {
            key: "event_id",
            label: "Event",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.event_id,
        },
        {
            key: "expected_attendance",
            label: "Expected Attendance",
            type: "text",
            placeholder: "Expected Attendance",
        },
        {
            key: "location_id",
            label: "Location",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.location_id,
        },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Notes..." },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        {
            key: "setup_minutes",
            label: "Setup Minutes",
            type: "text",
            placeholder: "Setup Minutes",
        },
        {
            key: "setup_minutes_before",
            label: "Setup Minutes Before",
            type: "text",
            placeholder: "Setup Minutes Before",
        },
        {
            key: "start_datetime",
            label: "Start Datetime",
            type: "text",
            placeholder: "Start Datetime",
        },
        {
            key: "teardown_minutes_after",
            label: "Teardown Minutes After",
            type: "text",
            placeholder: "Teardown Minutes After",
        },

        { key: "booked_by", label: "Booked By", type: "text", placeholder: "Booked By" },
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

        {
            key: "company_id",
            label: "Company",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.company_id,
        },
        { key: "phone", label: "Phone", type: "text", placeholder: "+1 (555) 000-0000" },
        { key: "title", label: "Title", type: "text", placeholder: "Title" },
        { key: "type", label: "Type", type: "text", placeholder: "Type" },
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

        {
            key: "depends_on_ids",
            label: "Depends On Ids",
            type: "text",
            placeholder: "Depends On Ids",
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Description...",
        },
        {
            key: "estimated_end",
            label: "Estimated End",
            type: "text",
            placeholder: "Estimated End",
        },
        {
            key: "estimated_start",
            label: "Estimated Start",
            type: "text",
            placeholder: "Estimated Start",
        },
        {
            key: "live_event_id",
            label: "Live Event",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/live-events", labelField: "name" },
        },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Notes..." },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },

        {
            key: "actual_duration_minutes",
            label: "Actual Duration Minutes",
            type: "text",
            placeholder: "Actual Duration Minutes",
        },

        {
            key: "responsible_id",
            label: "Responsible",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/user-profiles", labelField: "display_name" },
        },
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

        { key: "questions", label: "Questions", type: "text", placeholder: "Questions" },
        { key: "trigger_on", label: "Trigger On", type: "text", placeholder: "Trigger On" },
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

        { key: "is_required", label: "Is Required", type: "select", options: YES_NO_OPTIONS },
        { key: "max_value", label: "Max Value", type: "currency" },
        { key: "min_value", label: "Min Value", type: "currency" },
        {
            key: "spec_category",
            label: "Spec Category",
            type: "text",
            placeholder: "Spec Category",
        },
        { key: "spec_key", label: "Spec Key", type: "text", placeholder: "Spec Key" },
        { key: "spec_value", label: "Spec Value", type: "currency" },
        {
            key: "structural_engineer_signoff",
            label: "Structural Engineer Signoff",
            type: "text",
            placeholder: "Structural Engineer Signoff",
        },
        { key: "tolerance", label: "Tolerance", type: "text", placeholder: "Tolerance" },
        { key: "unit", label: "Unit", type: "text", placeholder: "Unit" },
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

        { key: "actions", label: "Actions", type: "text", placeholder: "Actions" },
        {
            key: "permission_level",
            label: "Permission Level",
            type: "text",
            placeholder: "Permission Level",
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        {
            key: "user_id",
            label: "User",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.user_id,
        },

        { key: "granted_by", label: "Granted By", type: "text", placeholder: "Granted By" },
        { key: "starts_at", label: "Starts At", type: "text", placeholder: "Starts At" },
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

        { key: "author_avatar_url", label: "Author Avatar Url", type: "url" },
        {
            key: "author_company",
            label: "Author Company",
            type: "text",
            placeholder: "Author Company",
        },
        { key: "author_name", label: "Author Name", type: "text", placeholder: "Author Name" },
        { key: "author_title", label: "Author Title", type: "text", placeholder: "Author Title" },
        { key: "featured", label: "Featured", type: "text", placeholder: "Featured" },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        { key: "verified", label: "Verified", type: "text", placeholder: "Verified" },

        { key: "received_at", label: "Received At", type: "text", placeholder: "Received At" },

        {
            key: "case_study_id",
            label: "Case Study",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/case-studies", labelField: "title" },
        },
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

        { key: "period_end", label: "Period End", type: "date" },
        { key: "period_start", label: "Period Start", type: "date" },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        {
            key: "user_id",
            label: "User",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.user_id,
        },
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

        { key: "affiliation", label: "Affiliation", type: "text", placeholder: "Affiliation" },
        { key: "contact_email", label: "Contact Email", type: "email" },
        {
            key: "contact_phone",
            label: "Contact Phone",
            type: "text",
            placeholder: "+1 (555) 000-0000",
        },
        {
            key: "dietary_restrictions",
            label: "Dietary Restrictions",
            type: "text",
            placeholder: "Dietary Restrictions",
        },
        {
            key: "expected_arrival",
            label: "Expected Arrival",
            type: "text",
            placeholder: "Expected Arrival",
        },
        {
            key: "live_event_id",
            label: "Live Event",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/live-events", labelField: "name" },
        },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Notes..." },
        {
            key: "special_requests",
            label: "Special Requests",
            type: "text",
            placeholder: "Special Requests",
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        { key: "tier", label: "Tier", type: "text", placeholder: "Tier" },
        { key: "zone_access", label: "Zone Access", type: "text", placeholder: "Zone Access" },

        {
            key: "actual_arrival",
            label: "Actual Arrival",
            type: "text",
            placeholder: "Actual Arrival",
        },
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

        {
            key: "live_event_id",
            label: "Live Event",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/live-events", labelField: "name" },
        },
        {
            key: "resolution_notes",
            label: "Resolution Notes",
            type: "text",
            placeholder: "Resolution Notes",
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        {
            key: "vip_guest_id",
            label: "VIP Guest",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/vip-guests", labelField: "name" },
        },

        { key: "requested_at", label: "Requested At", type: "text", placeholder: "Requested At" },
        { key: "resolved_at", label: "Resolved At", type: "text", placeholder: "Resolved At" },

        {
            key: "assigned_to_id",
            label: "Assigned To",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/user-profiles", labelField: "display_name" },
        },
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

        {
            key: "activation_id",
            label: "Activation",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.activation_id,
        },
        {
            key: "bom_id",
            label: "Bill of Materials",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/boms", labelField: "title" },
        },
        {
            key: "budget_line_id",
            label: "Budget Line",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/budget-line-items", labelField: "description" },
        },
        {
            key: "campaign_id",
            label: "Campaign",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/campaigns", labelField: "name" },
        },
        { key: "code", label: "Code", type: "text", placeholder: "Code" },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Description...",
        },
        { key: "estimated_cost", label: "Estimated Cost", type: "currency" },
        {
            key: "event_id",
            label: "Event",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.event_id,
        },
        {
            key: "lead_id",
            label: "Lead",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.lead_id,
        },
        {
            key: "location_id",
            label: "Location",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.location_id,
        },
        { key: "phase", label: "Phase", type: "text", placeholder: "Phase" },
        {
            key: "reviewer_id",
            label: "Reviewer",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.reviewer_id,
        },
        {
            key: "safety_plan_required",
            label: "Safety Plan Required",
            type: "text",
            placeholder: "Safety Plan Required",
        },
        { key: "start_date", label: "Start Date", type: "date" },
        { key: "title", label: "Title", type: "text", placeholder: "Title" },
        {
            key: "vendor_id",
            label: "Vendor",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.vendor_id,
        },
        {
            key: "work_package_type",
            label: "Work Package Type",
            type: "text",
            placeholder: "Work Package Type",
        },

        {
            key: "parent_work_package_id",
            label: "Parent Work Package",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/work-packages", labelField: "name" },
        },
        {
            key: "vertical_id",
            label: "Vertical",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/production-verticals", labelField: "name" },
        },
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
        {
            key: "lifecycle_status",
            label: "Lifecycle Status",
            type: "text",
            placeholder: "Lifecycle Status",
        },
        { key: "most_recent_engagement_date", label: "Most Recent Engagement Date", type: "date" },
        { key: "offboarding_date", label: "Offboarding Date", type: "date" },
        { key: "primary_role", label: "Primary Role", type: "text", placeholder: "Primary Role" },

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

        {
            key: "classification_id",
            label: "Classification",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/worker-classifications", labelField: "name" },
        },
        {
            key: "completed_steps",
            label: "Completed Steps",
            type: "text",
            placeholder: "Completed Steps",
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        { key: "target_completion_date", label: "Target Completion Date", type: "date" },
        { key: "total_steps", label: "Total Steps", type: "text", placeholder: "Total Steps" },
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

        {
            key: "completed_steps",
            label: "Completed Steps",
            type: "text",
            placeholder: "Completed Steps",
        },
        {
            key: "eligible_for_rehire",
            label: "Eligible For Rehire",
            type: "text",
            placeholder: "Eligible For Rehire",
        },
        {
            key: "exit_interview_completed",
            label: "Exit Interview Completed",
            type: "text",
            placeholder: "Exit Interview Completed",
        },
        {
            key: "exit_interview_notes",
            label: "Exit Interview Notes",
            type: "text",
            placeholder: "Exit Interview Notes",
        },
        { key: "is_voluntary", label: "Is Voluntary", type: "select", options: YES_NO_OPTIONS },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Notes..." },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        { key: "total_steps", label: "Total Steps", type: "text", placeholder: "Total Steps" },
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

        { key: "invite_type", label: "Invite Type", type: "text", placeholder: "Invite Type" },
        { key: "max_uses", label: "Max Uses", type: "text", placeholder: "Max Uses" },
        {
            key: "personal_message",
            label: "Personal Message",
            type: "text",
            placeholder: "Personal Message",
        },
        { key: "project_ids", label: "Project Ids", type: "text", placeholder: "Project Ids" },
        {
            key: "referral_code",
            label: "Referral Code",
            type: "text",
            placeholder: "Referral Code",
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        { key: "token", label: "Token", type: "text", placeholder: "Token" },

        { key: "accepted_at", label: "Accepted At", type: "text", placeholder: "Accepted At" },
        { key: "accepted_by", label: "Accepted By", type: "text", placeholder: "Accepted By" },
        { key: "expires_at", label: "Expires At", type: "text", placeholder: "Expires At" },
        { key: "invited_by", label: "Invited By", type: "text", placeholder: "Invited By" },
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

        {
            key: "export_format",
            label: "Export Format",
            type: "text",
            placeholder: "Export Format",
        },
        { key: "file_path", label: "File Path", type: "text", placeholder: "File Path" },
        {
            key: "file_size_bytes",
            label: "File Size Bytes",
            type: "text",
            placeholder: "File Size Bytes",
        },
        {
            key: "user_id",
            label: "User",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.user_id,
        },

        { key: "expires_at", label: "Expires At", type: "text", placeholder: "Expires At" },
        { key: "requested_at", label: "Requested At", type: "text", placeholder: "Requested At" },
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

        { key: "access_token", label: "Access Token", type: "text", placeholder: "Access Token" },
        { key: "api_key", label: "Api Key", type: "text", placeholder: "Api Key" },
        { key: "api_secret", label: "Api Secret", type: "text", placeholder: "Api Secret" },
        { key: "display_name", label: "Display Name", type: "text", placeholder: "Display Name" },
        { key: "error_count", label: "Error Count", type: "number", min: 0 },
        {
            key: "event_id",
            label: "Event",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.event_id,
        },
        { key: "last_error", label: "Last Error", type: "text", placeholder: "Last Error" },
        { key: "oauth_state", label: "Oauth State", type: "text", placeholder: "Oauth State" },
        {
            key: "provider_type",
            label: "Provider Type",
            type: "text",
            placeholder: "Provider Type",
        },
        {
            key: "rate_limit_config",
            label: "Rate Limit Config",
            type: "text",
            placeholder: "Rate Limit Config",
        },
        {
            key: "refresh_token",
            label: "Refresh Token",
            type: "text",
            placeholder: "Refresh Token",
        },
        { key: "scopes", label: "Scopes", type: "text", placeholder: "Scopes" },
        {
            key: "sync_direction",
            label: "Sync Direction",
            type: "text",
            placeholder: "Sync Direction",
        },
        {
            key: "webhook_secret",
            label: "Webhook Secret",
            type: "text",
            placeholder: "Webhook Secret",
        },
        { key: "webhook_url", label: "Webhook Url", type: "url" },

        { key: "last_sync_at", label: "Last Sync At", type: "text", placeholder: "Last Sync At" },
        {
            key: "token_expires_at",
            label: "Token Expires At",
            type: "text",
            placeholder: "Token Expires At",
        },
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

        { key: "category", label: "Category", type: "text", placeholder: "Category" },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Description...",
        },
        {
            key: "event_id",
            label: "Event",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.event_id,
        },
        {
            key: "is_announcement_only",
            label: "Is Announcement Only",
            type: "select",
            options: YES_NO_OPTIONS,
        },
        { key: "is_archived", label: "Is Archived", type: "select", options: YES_NO_OPTIONS },
        { key: "is_ephemeral", label: "Is Ephemeral", type: "select", options: YES_NO_OPTIONS },
        { key: "is_public", label: "Is Public", type: "select", options: YES_NO_OPTIONS },
        { key: "message_count", label: "Message Count", type: "number", min: 0 },
        { key: "name", label: "Name", type: "text", placeholder: "Name" },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        {
            key: "required_credential_type",
            label: "Required Credential Type",
            type: "text",
            placeholder: "Required Credential Type",
        },
        {
            key: "template_id",
            label: "Template",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/templates", labelField: "name" },
        },
        { key: "type", label: "Type", type: "text", placeholder: "Type" },

        {
            key: "last_message_at",
            label: "Last Message At",
            type: "text",
            placeholder: "Last Message At",
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

        {
            key: "legal_first_name",
            label: "Legal First Name",
            type: "text",
            placeholder: "Legal First Name",
        },
        { key: "name", label: "Name", type: "text", placeholder: "Name" },
        { key: "role", label: "Role", type: "text", placeholder: "Role" },
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

        {
            key: "approver_user_ids",
            label: "Approver User Ids",
            type: "text",
            placeholder: "Approver User Ids",
        },
        {
            key: "escalation_to_role",
            label: "Escalation To Role",
            type: "text",
            placeholder: "Escalation To Role",
        },
        {
            key: "on_approve_action",
            label: "On Approve Action",
            type: "text",
            placeholder: "On Approve Action",
        },
        {
            key: "on_reject_action",
            label: "On Reject Action",
            type: "text",
            placeholder: "On Reject Action",
        },

        {
            key: "escalation_to_user_id",
            label: "Escalation To",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/user-profiles", labelField: "display_name" },
        },
        {
            key: "workflow_id",
            label: "Workflow",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/workflows", labelField: "name" },
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

        {
            key: "asset_id",
            label: "Asset",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.asset_id,
        },
        { key: "checksum", label: "Checksum", type: "text", placeholder: "Checksum" },
        { key: "content", label: "Content", type: "textarea", placeholder: "Content..." },
        { key: "content_text", label: "Content Text", type: "text", placeholder: "Content Text" },
        {
            key: "diff_from_previous",
            label: "Diff From Previous",
            type: "text",
            placeholder: "Diff From Previous",
        },
        { key: "is_major", label: "Is Major", type: "select", options: YES_NO_OPTIONS },
        { key: "mime_type", label: "Mime Type", type: "text", placeholder: "Mime Type" },
        { key: "size_bytes", label: "Size Bytes", type: "text", placeholder: "Size Bytes" },
        {
            key: "version_number",
            label: "Version Number",
            type: "text",
            placeholder: "Version Number",
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

        { key: "assigned_to", label: "Assigned To", type: "text", placeholder: "Assigned To" },
        {
            key: "brand_compliance_score",
            label: "Brand Compliance Score",
            type: "text",
            placeholder: "Brand Compliance Score",
        },
        {
            key: "brief_id",
            label: "Brief",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.brief_id,
        },
        {
            key: "campaign_id",
            label: "Campaign",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/campaigns", labelField: "name" },
        },
        { key: "locale", label: "Locale", type: "text", placeholder: "Locale" },
        {
            key: "localization_notes",
            label: "Localization Notes",
            type: "text",
            placeholder: "Localization Notes",
        },
        { key: "specs", label: "Specs", type: "text", placeholder: "Specs" },
        {
            key: "target_channels",
            label: "Target Channels",
            type: "text",
            placeholder: "Target Channels",
        },

        { key: "deployed_at", label: "Deployed At", type: "text", placeholder: "Deployed At" },

        {
            key: "digital_asset_id",
            label: "Digital Asset",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/digital-assets", labelField: "title" },
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

        { key: "budget_pct", label: "Budget Pct", type: "text", placeholder: "Budget Pct" },
        {
            key: "campaign_id",
            label: "Campaign",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/campaigns", labelField: "name" },
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
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

        {
            key: "campaign_id",
            label: "Campaign",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/campaigns", labelField: "name" },
        },
        { key: "data_source", label: "Data Source", type: "text", placeholder: "Data Source" },
        {
            key: "measurement_method",
            label: "Measurement Method",
            type: "text",
            placeholder: "Measurement Method",
        },
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

        {
            key: "category_type",
            label: "Category Type",
            type: "text",
            placeholder: "Category Type",
        },
        { key: "depth", label: "Depth", type: "text", placeholder: "Depth" },
        { key: "item_count", label: "Item Count", type: "number", min: 0 },
        {
            key: "parent_id",
            label: "Parent Task",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/tasks", labelField: "title" },
        },
        { key: "unspsc_code", label: "Unspsc Code", type: "text", placeholder: "Unspsc Code" },
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

        {
            key: "channels_config",
            label: "Channels Config",
            type: "text",
            placeholder: "Channels Config",
        },
        { key: "event_type", label: "Event Type", type: "text", placeholder: "Event Type" },
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

        {
            key: "live_event_id",
            label: "Live Event",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/live-events", labelField: "name" },
        },
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

        {
            key: "live_event_id",
            label: "Live Event",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/live-events", labelField: "name" },
        },
        {
            key: "profile_id",
            label: "Profile",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.profile_id,
        },

        {
            key: "primary_channel_id",
            label: "Primary Channel",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/comm-channels", labelField: "name" },
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

        { key: "content", label: "Content", type: "textarea", placeholder: "Content..." },
        { key: "mentions", label: "Mentions", type: "text", placeholder: "Mentions" },

        {
            key: "author_id",
            label: "Author",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/user-profiles", labelField: "display_name" },
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

        {
            key: "auto_suspend_on_expiry",
            label: "Auto Suspend On Expiry",
            type: "text",
            placeholder: "Auto Suspend On Expiry",
        },
        {
            key: "blocks_onboarding_completion",
            label: "Blocks Onboarding Completion",
            type: "text",
            placeholder: "Blocks Onboarding Completion",
        },
        {
            key: "blocks_scheduling",
            label: "Blocks Scheduling",
            type: "text",
            placeholder: "Blocks Scheduling",
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

        {
            key: "consumable_id",
            label: "Consumable",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/consumables", labelField: "name" },
        },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
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

        { key: "color", label: "Color", type: "text", placeholder: "Color" },
        { key: "config", label: "Config", type: "text", placeholder: "Config" },
        {
            key: "refresh_interval_seconds",
            label: "Refresh Interval Seconds",
            type: "text",
            placeholder: "Refresh Interval Seconds",
        },
        { key: "subtitle", label: "Subtitle", type: "text", placeholder: "Subtitle" },
        { key: "title", label: "Title", type: "text", placeholder: "Title" },

        {
            key: "last_refreshed_at",
            label: "Last Refreshed At",
            type: "text",
            placeholder: "Last Refreshed At",
        },

        {
            key: "dashboard_id",
            label: "Dashboard",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/dashboards", labelField: "name" },
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

        { key: "billing_code", label: "Billing Code", type: "text", placeholder: "Billing Code" },
        {
            key: "classification_id",
            label: "Classification",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/worker-classifications", labelField: "name" },
        },
        {
            key: "contract_id",
            label: "Contract",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.contract_id,
        },
        { key: "is_billable", label: "Is Billable", type: "select", options: YES_NO_OPTIONS },
        { key: "is_ongoing", label: "Is Ongoing", type: "select", options: YES_NO_OPTIONS },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        {
            key: "work_order_id",
            label: "Work Order",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.work_order_id,
        },
        {
            key: "worker_profile_id",
            label: "Worker Profile",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.worker_profile_id,
        },
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

        {
            key: "asset_id",
            label: "Asset",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.asset_id,
        },
        {
            key: "condition_photos",
            label: "Condition Photos",
            type: "text",
            placeholder: "Condition Photos",
        },
        {
            key: "departure_notes",
            label: "Departure Notes",
            type: "text",
            placeholder: "Departure Notes",
        },
        {
            key: "departure_photos",
            label: "Departure Photos",
            type: "text",
            placeholder: "Departure Photos",
        },
        {
            key: "expected_quantity",
            label: "Expected Quantity",
            type: "text",
            placeholder: "Expected Quantity",
        },
        {
            key: "live_event_id",
            label: "Live Event",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/live-events", labelField: "name" },
        },
        {
            key: "received_quantity",
            label: "Received Quantity",
            type: "text",
            placeholder: "Received Quantity",
        },
        {
            key: "returned_quantity",
            label: "Returned Quantity",
            type: "text",
            placeholder: "Returned Quantity",
        },

        {
            key: "checked_in_by",
            label: "Checked In By",
            type: "text",
            placeholder: "Checked In By",
        },
        {
            key: "checked_out_by",
            label: "Checked Out By",
            type: "text",
            placeholder: "Checked Out By",
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

        {
            key: "asset_category",
            label: "Asset Category",
            type: "text",
            placeholder: "Asset Category",
        },
        {
            key: "asset_id",
            label: "Asset",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.asset_id,
        },
        {
            key: "certification_type",
            label: "Certification Type",
            type: "text",
            placeholder: "Certification Type",
        },
        {
            key: "checklist_template",
            label: "Checklist Template",
            type: "text",
            placeholder: "Checklist Template",
        },
        {
            key: "requires_certification",
            label: "Requires Certification",
            type: "select",
            options: YES_NO_OPTIONS,
        },
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

        {
            key: "budget_id",
            label: "Budget",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.budget_id,
        },
        { key: "budgeted_amount", label: "Budgeted Amount", type: "currency" },
        { key: "committed_amount", label: "Committed Amount", type: "currency" },
        { key: "phase", label: "Phase", type: "text", placeholder: "Phase" },
        {
            key: "vendor_id",
            label: "Vendor",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.vendor_id,
        },

        { key: "actual_amount", label: "Actual Amount", type: "currency" },
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

        {
            key: "crew_member_id",
            label: "Crew Member",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.crew_member_id,
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

        {
            key: "team_id",
            label: "Team",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/teams", labelField: "name" },
        },
        {
            key: "user_id",
            label: "User",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.user_id,
        },

        { key: "joined_at", label: "Joined At", type: "text", placeholder: "Joined At" },
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

        {
            key: "non_working_days",
            label: "Non Working Days",
            type: "text",
            placeholder: "Non Working Days",
        },
        {
            key: "required_fields",
            label: "Required Fields",
            type: "text",
            placeholder: "Required Fields",
        },
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

        { key: "target_tier", label: "Target Tier", type: "text", placeholder: "Target Tier" },
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

        {
            key: "attachment_urls",
            label: "Attachment Urls",
            type: "text",
            placeholder: "Attachment Urls",
        },
        { key: "body", label: "Body", type: "textarea", placeholder: "Body..." },
        { key: "direction", label: "Direction", type: "text", placeholder: "Direction" },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        {
            key: "sender_id",
            label: "Sender",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/user-profiles", labelField: "display_name" },
        },
        { key: "sender_name", label: "Sender Name", type: "text", placeholder: "Sender Name" },
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

        { key: "read_at", label: "Read At", type: "text", placeholder: "Read At" },
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

        {
            key: "agency_vendor_id",
            label: "Agency/Vendor",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/vendors", labelField: "name" },
        },
        {
            key: "benefits_eligible",
            label: "Benefits Eligible",
            type: "text",
            placeholder: "Benefits Eligible",
        },
        { key: "categories", label: "Categories", type: "text", placeholder: "Categories" },
        { key: "company_name", label: "Company Name", type: "text", placeholder: "Company Name" },
        {
            key: "contract_auto_renew",
            label: "Contract Auto Renew",
            type: "text",
            placeholder: "Contract Auto Renew",
        },
        { key: "contract_end_date", label: "Contract End Date", type: "date" },
        {
            key: "contract_renewal_notice_days",
            label: "Contract Renewal Notice Days",
            type: "text",
            placeholder: "Contract Renewal Notice Days",
        },
        { key: "contract_start_date", label: "Contract Start Date", type: "date" },
        { key: "day_rate", label: "Day Rate", type: "currency" },
        {
            key: "employee_id",
            label: "Employee",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/user-profiles", labelField: "display_name" },
        },
        {
            key: "insurance_minimum",
            label: "Insurance Minimum",
            type: "text",
            placeholder: "Insurance Minimum",
        },
        { key: "is_seasonal", label: "Is Seasonal", type: "select", options: YES_NO_OPTIONS },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Notes..." },
        { key: "payment_terms_days", label: "Payment Terms Days", type: "number", min: 0 },
        { key: "pto_accrual_rate", label: "Pto Accrual Rate", type: "currency" },
        { key: "rate_effective_date", label: "Rate Effective Date", type: "date" },
        { key: "rate_notes", label: "Rate Notes", type: "text", placeholder: "Rate Notes" },
        {
            key: "returning_worker",
            label: "Returning Worker",
            type: "text",
            placeholder: "Returning Worker",
        },
        {
            key: "season_end_month",
            label: "Season End Month",
            type: "text",
            placeholder: "Season End Month",
        },
        {
            key: "season_start_month",
            label: "Season Start Month",
            type: "text",
            placeholder: "Season Start Month",
        },
        {
            key: "seasons_completed",
            label: "Seasons Completed",
            type: "text",
            placeholder: "Seasons Completed",
        },
        {
            key: "service_areas",
            label: "Service Areas",
            type: "text",
            placeholder: "Service Areas",
        },
        {
            key: "supervisor_id",
            label: "Supervisor",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.supervisor_id,
        },
        {
            key: "tax_id_on_file",
            label: "Tax Id On File",
            type: "text",
            placeholder: "Tax Id On File",
        },
        { key: "union_local", label: "Union Local", type: "text", placeholder: "Union Local" },
        { key: "union_member", label: "Union Member", type: "text", placeholder: "Union Member" },
        {
            key: "worker_profile_id",
            label: "Worker Profile",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.worker_profile_id,
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

        { key: "granted", label: "Granted", type: "text", placeholder: "Granted" },
        { key: "resource", label: "Resource", type: "text", placeholder: "Resource" },
        { key: "role_key", label: "Role Key", type: "text", placeholder: "Role Key" },
        { key: "scope_type", label: "Scope Type", type: "text", placeholder: "Scope Type" },
        {
            key: "user_id",
            label: "User",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.user_id,
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

        {
            key: "activation_id",
            label: "Activation",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.activation_id,
        },
        {
            key: "contingency_plan",
            label: "Contingency Plan",
            type: "text",
            placeholder: "Contingency Plan",
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Description...",
        },
        { key: "end_time", label: "End Time", type: "text" },
        {
            key: "equipment_needed",
            label: "Equipment Needed",
            type: "text",
            placeholder: "Equipment Needed",
        },
        {
            key: "event_id",
            label: "Event",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.event_id,
        },
        { key: "frequency", label: "Frequency", type: "text", placeholder: "Frequency" },
        { key: "instructions", label: "Instructions", type: "text", placeholder: "Instructions" },
        {
            key: "lead_id",
            label: "Lead",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.lead_id,
        },
        { key: "name", label: "Name", type: "text", placeholder: "Name" },
        { key: "objective", label: "Objective", type: "textarea", placeholder: "Objective..." },
        { key: "participant_count", label: "Participant Count", type: "number", min: 0 },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "requirements", label: "Requirements", type: "text", placeholder: "Requirements" },
        {
            key: "specific_location",
            label: "Specific Location",
            type: "text",
            placeholder: "Specific Location",
        },
        { key: "staff_ids", label: "Staff Ids", type: "text", placeholder: "Staff Ids" },
        { key: "start_time", label: "Start Time", type: "text" },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        { key: "type", label: "Type", type: "text", placeholder: "Type" },
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

        { key: "reason", label: "Reason", type: "text", placeholder: "Reason" },

        { key: "changed_by", label: "Changed By", type: "text", placeholder: "Changed By" },
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

        {
            key: "actions_executed",
            label: "Actions Executed",
            type: "text",
            placeholder: "Actions Executed",
        },
        { key: "duration_ms", label: "Duration Ms", type: "text", placeholder: "Duration Ms" },
        { key: "error", label: "Error", type: "text", placeholder: "Error" },
        {
            key: "trigger_record_type",
            label: "Trigger Record Type",
            type: "text",
            placeholder: "Trigger Record Type",
        },
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

        {
            key: "execution_data",
            label: "Execution Data",
            type: "text",
            placeholder: "Execution Data",
        },
        { key: "success", label: "Success", type: "text", placeholder: "Success" },

        {
            key: "automation_rule_id",
            label: "Automation Rule",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/automation-rules", labelField: "name" },
        },
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

        {
            key: "source_domain",
            label: "Source Domain",
            type: "text",
            placeholder: "Source Domain",
        },
        {
            key: "target_domain",
            label: "Target Domain",
            type: "text",
            placeholder: "Target Domain",
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

        {
            key: "avg_wait_minutes",
            label: "Avg Wait Minutes",
            type: "text",
            placeholder: "Avg Wait Minutes",
        },
        { key: "entry_rate", label: "Entry Rate", type: "currency" },
        { key: "exit_rate", label: "Exit Rate", type: "currency" },
        { key: "incidents_count", label: "Incidents Count", type: "number", min: 0 },
        {
            key: "live_event_id",
            label: "Live Event",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/live-events", labelField: "name" },
        },
        { key: "occupancy_count", label: "Occupancy Count", type: "number", min: 0 },
        { key: "queue_length", label: "Queue Length", type: "text", placeholder: "Queue Length" },
        { key: "transactions_count", label: "Transactions Count", type: "number", min: 0 },

        { key: "recorded_at", label: "Recorded At", type: "text", placeholder: "Recorded At" },
        { key: "recorded_by", label: "Recorded By", type: "text", placeholder: "Recorded By" },
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

        { key: "budget_total", label: "Budget Total", type: "text", placeholder: "Budget Total" },
        {
            key: "burn_rate_per_hour",
            label: "Burn Rate Per Hour",
            type: "text",
            placeholder: "Burn Rate Per Hour",
        },
        {
            key: "committed_not_spent",
            label: "Committed Not Spent",
            type: "text",
            placeholder: "Committed Not Spent",
        },
        { key: "equipment_cost", label: "Equipment Cost", type: "currency" },
        {
            key: "labor_double_time",
            label: "Labor Double Time",
            type: "text",
            placeholder: "Labor Double Time",
        },
        {
            key: "labor_overtime",
            label: "Labor Overtime",
            type: "text",
            placeholder: "Labor Overtime",
        },
        {
            key: "labor_regular",
            label: "Labor Regular",
            type: "text",
            placeholder: "Labor Regular",
        },
        {
            key: "live_event_id",
            label: "Live Event",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/live-events", labelField: "name" },
        },
        { key: "margin_percent", label: "Margin Percent", type: "number", min: 0 },
        {
            key: "onsite_procurement",
            label: "Onsite Procurement",
            type: "text",
            placeholder: "Onsite Procurement",
        },
        {
            key: "ot_alert_level",
            label: "Ot Alert Level",
            type: "text",
            placeholder: "Ot Alert Level",
        },
        {
            key: "projected_total",
            label: "Projected Total",
            type: "text",
            placeholder: "Projected Total",
        },
        { key: "revenue_fb", label: "Revenue Fb", type: "text", placeholder: "Revenue Fb" },
        {
            key: "revenue_merch",
            label: "Revenue Merch",
            type: "text",
            placeholder: "Revenue Merch",
        },
        {
            key: "revenue_other",
            label: "Revenue Other",
            type: "text",
            placeholder: "Revenue Other",
        },
        { key: "spent_to_date", label: "Spent To Date", type: "date" },
        { key: "vendor_cost", label: "Vendor Cost", type: "currency" },

        { key: "captured_by", label: "Captured By", type: "text", placeholder: "Captured By" },
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

        { key: "city", label: "City", type: "text", placeholder: "City" },
        { key: "country_code", label: "Country Code", type: "text", placeholder: "Country Code" },
        {
            key: "device_fingerprint",
            label: "Device Fingerprint",
            type: "text",
            placeholder: "Device Fingerprint",
        },
        { key: "email", label: "Email", type: "email" },
        { key: "error_code", label: "Error Code", type: "text", placeholder: "Error Code" },
        {
            key: "failure_reason",
            label: "Failure Reason",
            type: "text",
            placeholder: "Failure Reason",
        },
        { key: "success", label: "Success", type: "text", placeholder: "Success" },
        {
            key: "user_id",
            label: "User",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.user_id,
        },
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

        { key: "body_html", label: "Body Html", type: "text", placeholder: "Body Html" },
        {
            key: "conversation_id",
            label: "Conversation",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/conversations", labelField: "title" },
        },
        { key: "is_internal", label: "Is Internal", type: "select", options: YES_NO_OPTIONS },
        {
            key: "is_mandatory_read",
            label: "Is Mandatory Read",
            type: "select",
            options: YES_NO_OPTIONS,
        },
        { key: "is_pinned", label: "Is Pinned", type: "select", options: YES_NO_OPTIONS },
        {
            key: "is_system_message",
            label: "Is System Message",
            type: "select",
            options: YES_NO_OPTIONS,
        },
        {
            key: "mentioned_user_ids",
            label: "Mentioned User Ids",
            type: "text",
            placeholder: "Mentioned User Ids",
        },
        { key: "priority", label: "Priority", type: "text", placeholder: "Priority" },
        {
            key: "sender_id",
            label: "Sender",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/user-profiles", labelField: "display_name" },
        },
        {
            key: "shift_id",
            label: "Shift",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/shifts", labelField: "title" },
        },
        { key: "thread_message_count", label: "Thread Message Count", type: "number", min: 0 },

        { key: "edited_at", label: "Edited At", type: "text", placeholder: "Edited At" },
        { key: "pinned_at", label: "Pinned At", type: "text", placeholder: "Pinned At" },
        { key: "pinned_by", label: "Pinned By", type: "text", placeholder: "Pinned By" },
        { key: "scheduled_at", label: "Scheduled At", type: "text", placeholder: "Scheduled At" },
        {
            key: "thread_last_reply_at",
            label: "Thread Last Reply At",
            type: "text",
            placeholder: "Thread Last Reply At",
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

        { key: "action_url", label: "Action Url", type: "url" },
        { key: "channel", label: "Channel", type: "text", placeholder: "Channel" },
        { key: "message", label: "Message", type: "text", placeholder: "Message" },
        { key: "read", label: "Read", type: "text", placeholder: "Read" },
        {
            key: "user_id",
            label: "User",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.user_id,
        },

        { key: "read_at", label: "Read At", type: "text", placeholder: "Read At" },
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

        { key: "change_type", label: "Change Type", type: "text", placeholder: "Change Type" },
        { key: "new_value", label: "New Value", type: "currency" },
        { key: "old_value", label: "Old Value", type: "currency" },

        { key: "changed_by", label: "Changed By", type: "text", placeholder: "Changed By" },
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

        {
            key: "asset_id",
            label: "Asset",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.asset_id,
        },
        {
            key: "consumable_id",
            label: "Consumable",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/consumables", labelField: "name" },
        },
        {
            key: "device_id",
            label: "Device",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/assets", labelField: "name" },
        },
        {
            key: "kit_id",
            label: "Kit",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/kits", labelField: "name" },
        },
        { key: "latitude", label: "Latitude", type: "text", placeholder: "Latitude" },
        {
            key: "location_context",
            label: "Location Context",
            type: "text",
            placeholder: "Location Context",
        },
        { key: "longitude", label: "Longitude", type: "text", placeholder: "Longitude" },
        { key: "scan_method", label: "Scan Method", type: "text", placeholder: "Scan Method" },
        {
            key: "warehouse_location_id",
            label: "Warehouse Loc.",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/warehouse-locations", labelField: "name" },
        },

        { key: "scanned_at", label: "Scanned At", type: "text", placeholder: "Scanned At" },
        { key: "scanned_by", label: "Scanned By", type: "text", placeholder: "Scanned By" },
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

        { key: "cdn_url", label: "Cdn Url", type: "url" },
        {
            key: "checksum_sha256",
            label: "Checksum Sha256",
            type: "text",
            placeholder: "Checksum Sha256",
        },
        {
            key: "is_deduplicated",
            label: "Is Deduplicated",
            type: "select",
            options: YES_NO_OPTIONS,
        },
        { key: "object_path", label: "Object Path", type: "text", placeholder: "Object Path" },
        {
            key: "original_filename",
            label: "Original Filename",
            type: "text",
            placeholder: "Original Filename",
        },
        { key: "preview_url", label: "Preview Url", type: "url" },
        {
            key: "processing_error",
            label: "Processing Error",
            type: "text",
            placeholder: "Processing Error",
        },
        {
            key: "processing_status",
            label: "Processing Status",
            type: "text",
            placeholder: "Processing Status",
        },
        { key: "provider", label: "Provider", type: "text", placeholder: "Provider" },
        { key: "size_bytes", label: "Size Bytes", type: "text", placeholder: "Size Bytes" },
        { key: "storage_url", label: "Storage Url", type: "url" },
        { key: "thumbnail_url", label: "Thumbnail Url", type: "url" },
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

        {
            key: "conflict_field",
            label: "Conflict Field",
            type: "text",
            placeholder: "Conflict Field",
        },
        {
            key: "conflict_local",
            label: "Conflict Local",
            type: "text",
            placeholder: "Conflict Local",
        },
        {
            key: "conflict_remote",
            label: "Conflict Remote",
            type: "text",
            placeholder: "Conflict Remote",
        },
        {
            key: "connection_id",
            label: "Connection",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/integrations", labelField: "name" },
        },
        { key: "duration_ms", label: "Duration Ms", type: "text", placeholder: "Duration Ms" },
        {
            key: "records_failed",
            label: "Records Failed",
            type: "text",
            placeholder: "Records Failed",
        },
        {
            key: "records_processed",
            label: "Records Processed",
            type: "text",
            placeholder: "Records Processed",
        },
        { key: "resolution", label: "Resolution", type: "textarea", placeholder: "Resolution..." },
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

        { key: "active_project_count", label: "Active Project Count", type: "number", min: 0 },
        {
            key: "delivery_score",
            label: "Delivery Score",
            type: "text",
            placeholder: "Delivery Score",
        },
        {
            key: "engagement_score",
            label: "Engagement Score",
            type: "text",
            placeholder: "Engagement Score",
        },
        {
            key: "expansion_score",
            label: "Expansion Score",
            type: "text",
            placeholder: "Expansion Score",
        },
        {
            key: "lifetime_revenue",
            label: "Lifetime Revenue",
            type: "text",
            placeholder: "Lifetime Revenue",
        },
        { key: "open_opportunity_count", label: "Open Opportunity Count", type: "number", min: 0 },
        { key: "overdue_invoice_count", label: "Overdue Invoice Count", type: "number", min: 0 },
        {
            key: "payment_score",
            label: "Payment Score",
            type: "text",
            placeholder: "Payment Score",
        },
        {
            key: "recommendations",
            label: "Recommendations",
            type: "text",
            placeholder: "Recommendations",
        },
        { key: "risk_factors", label: "Risk Factors", type: "text", placeholder: "Risk Factors" },
        {
            key: "satisfaction_score",
            label: "Satisfaction Score",
            type: "text",
            placeholder: "Satisfaction Score",
        },
        { key: "scored_by", label: "Scored By", type: "text", placeholder: "Scored By" },
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

        {
            key: "lifecycle_stage",
            label: "Lifecycle Stage",
            type: "text",
            placeholder: "Lifecycle Stage",
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        { key: "version", label: "Version", type: "number", min: 0 },
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

        {
            key: "brand_guideline_id",
            label: "Brand Guideline",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/brand-guidelines", labelField: "title" },
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Description...",
        },
        { key: "is_inherited", label: "Is Inherited", type: "select", options: YES_NO_OPTIONS },
        { key: "section_type", label: "Section Type", type: "text", placeholder: "Section Type" },

        {
            key: "brand_kit_id",
            label: "Brand Kit",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/brand-kits", labelField: "name" },
        },
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

        { key: "allocated_count", label: "Allocated Count", type: "number", min: 0 },
        {
            key: "event_id",
            label: "Event",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.event_id,
        },
        {
            key: "live_event_id",
            label: "Live Event",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/live-events", labelField: "name" },
        },
        { key: "valid_from", label: "Valid From", type: "text", placeholder: "Valid From" },
        { key: "valid_until", label: "Valid Until", type: "date" },
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

        {
            key: "change_description",
            label: "Change Description",
            type: "text",
            placeholder: "Change Description",
        },
        { key: "content", label: "Content", type: "textarea", placeholder: "Content..." },
        {
            key: "document_id",
            label: "Document",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.document_id,
        },
        { key: "title", label: "Title", type: "text", placeholder: "Title" },
        {
            key: "version_number",
            label: "Version Number",
            type: "text",
            placeholder: "Version Number",
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

        { key: "body_html", label: "Body Html", type: "text", placeholder: "Body Html" },
        { key: "body_text", label: "Body Text", type: "text", placeholder: "Body Text" },
        { key: "direction", label: "Direction", type: "text", placeholder: "Direction" },
        { key: "from_address", label: "From Address", type: "text", placeholder: "From Address" },
        { key: "from_name", label: "From Name", type: "text", placeholder: "From Name" },
        { key: "in_reply_to", label: "In Reply To", type: "text", placeholder: "In Reply To" },
        { key: "to_addresses", label: "To Addresses", type: "text", placeholder: "To Addresses" },

        { key: "linked_by", label: "Linked By", type: "text", placeholder: "Linked By" },
        { key: "received_at", label: "Received At", type: "text", placeholder: "Received At" },

        {
            key: "message_id",
            label: "Message",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/messages", labelField: "content" },
        },
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

        { key: "generator_fuel_percent", label: "Generator Fuel Percent", type: "number", min: 0 },
        { key: "humidity_percent", label: "Humidity Percent", type: "number", min: 0 },
        {
            key: "live_event_id",
            label: "Live Event",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/live-events", labelField: "name" },
        },
        {
            key: "noise_level_db",
            label: "Noise Level Db",
            type: "text",
            placeholder: "Noise Level Db",
        },
        {
            key: "noise_location",
            label: "Noise Location",
            type: "text",
            placeholder: "Noise Location",
        },
        {
            key: "power_capacity_amps",
            label: "Power Capacity Amps",
            type: "text",
            placeholder: "Power Capacity Amps",
        },
        {
            key: "precipitation",
            label: "Precipitation",
            type: "text",
            placeholder: "Precipitation",
        },
        {
            key: "temperature_f",
            label: "Temperature F",
            type: "text",
            placeholder: "Temperature F",
        },
        {
            key: "total_power_load_amps",
            label: "Total Power Load Amps",
            type: "text",
            placeholder: "Total Power Load Amps",
        },
        { key: "visibility", label: "Visibility", type: "text", placeholder: "Visibility" },
        {
            key: "weather_alert",
            label: "Weather Alert",
            type: "text",
            placeholder: "Weather Alert",
        },
        {
            key: "weather_alert_source",
            label: "Weather Alert Source",
            type: "text",
            placeholder: "Weather Alert Source",
        },
        {
            key: "wet_bulb_globe_temp",
            label: "Wet Bulb Globe Temp",
            type: "text",
            placeholder: "Wet Bulb Globe Temp",
        },
        {
            key: "wind_gusts_mph",
            label: "Wind Gusts Mph",
            type: "text",
            placeholder: "Wind Gusts Mph",
        },
        {
            key: "wind_speed_mph",
            label: "Wind Speed Mph",
            type: "text",
            placeholder: "Wind Speed Mph",
        },

        { key: "recorded_at", label: "Recorded At", type: "text", placeholder: "Recorded At" },
        { key: "recorded_by", label: "Recorded By", type: "text", placeholder: "Recorded By" },
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

        {
            key: "activation_id",
            label: "Activation",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.activation_id,
        },
        {
            key: "consumable_id",
            label: "Consumable",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/consumables", labelField: "name" },
        },
        {
            key: "event_id",
            label: "Event",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.event_id,
        },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },

        { key: "reserved_by", label: "Reserved By", type: "text", placeholder: "Reserved By" },
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

        { key: "body", label: "Body", type: "textarea", placeholder: "Body..." },
        { key: "version", label: "Version", type: "number", min: 0 },

        {
            key: "author_id",
            label: "Author",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/user-profiles", labelField: "display_name" },
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

        { key: "break_end", label: "Break End", type: "text", placeholder: "Break End" },
        { key: "break_start", label: "Break Start", type: "text", placeholder: "Break Start" },
        {
            key: "crew_member_id",
            label: "Crew Member",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.crew_member_id,
        },
        { key: "hours_worked", label: "Hours Worked", type: "text", placeholder: "Hours Worked" },
        {
            key: "live_event_id",
            label: "Live Event",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/live-events", labelField: "name" },
        },
        {
            key: "overtime_flagged",
            label: "Overtime Flagged",
            type: "text",
            placeholder: "Overtime Flagged",
        },
        {
            key: "radio_callsign",
            label: "Radio Callsign",
            type: "text",
            placeholder: "Radio Callsign",
        },
        {
            key: "role_description",
            label: "Role Description",
            type: "text",
            placeholder: "Role Description",
        },
        {
            key: "shift_id",
            label: "Shift",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/shifts", labelField: "title" },
        },
        {
            key: "total_break_minutes",
            label: "Total Break Minutes",
            type: "text",
            placeholder: "Total Break Minutes",
        },
        { key: "zone", label: "Zone", type: "text", placeholder: "Zone" },

        {
            key: "credentials_verified_by",
            label: "Credentials Verified By",
            type: "text",
            placeholder: "Credentials Verified By",
        },
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

        {
            key: "activation_id",
            label: "Activation",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.activation_id,
        },
        {
            key: "current_attendance",
            label: "Current Attendance",
            type: "text",
            placeholder: "Current Attendance",
        },
        {
            key: "event_id",
            label: "Event",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.event_id,
        },
        {
            key: "fire_marshal_capacity",
            label: "Fire Marshal Capacity",
            type: "text",
            placeholder: "Fire Marshal Capacity",
        },
        {
            key: "location_id",
            label: "Location",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.location_id,
        },
        {
            key: "permitted_capacity",
            label: "Permitted Capacity",
            type: "text",
            placeholder: "Permitted Capacity",
        },
        { key: "phase", label: "Phase", type: "text", placeholder: "Phase" },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "risk_level", label: "Risk Level", type: "text", placeholder: "Risk Level" },
        { key: "risk_score", label: "Risk Score", type: "text", placeholder: "Risk Score" },
        {
            key: "scheduled_doors",
            label: "Scheduled Doors",
            type: "text",
            placeholder: "Scheduled Doors",
        },
        {
            key: "scheduled_load_in",
            label: "Scheduled Load In",
            type: "text",
            placeholder: "Scheduled Load In",
        },
        {
            key: "scheduled_show_end",
            label: "Scheduled Show End",
            type: "text",
            placeholder: "Scheduled Show End",
        },
        {
            key: "scheduled_show_start",
            label: "Scheduled Show Start",
            type: "text",
            placeholder: "Scheduled Show Start",
        },
        {
            key: "scheduled_strike_complete",
            label: "Scheduled Strike Complete",
            type: "text",
            placeholder: "Scheduled Strike Complete",
        },
        {
            key: "venue_capacity",
            label: "Venue Capacity",
            type: "text",
            placeholder: "Venue Capacity",
        },
        {
            key: "weather_alert_level",
            label: "Weather Alert Level",
            type: "text",
            placeholder: "Weather Alert Level",
        },
        {
            key: "weather_status",
            label: "Weather Status",
            type: "text",
            placeholder: "Weather Status",
        },

        { key: "actual_doors", label: "Actual Doors", type: "text", placeholder: "Actual Doors" },
        {
            key: "actual_load_in",
            label: "Actual Load In",
            type: "text",
            placeholder: "Actual Load In",
        },
        {
            key: "actual_show_end",
            label: "Actual Show End",
            type: "text",
            placeholder: "Actual Show End",
        },
        {
            key: "actual_show_start",
            label: "Actual Show Start",
            type: "text",
            placeholder: "Actual Show Start",
        },
        {
            key: "actual_strike_complete",
            label: "Actual Strike Complete",
            type: "text",
            placeholder: "Actual Strike Complete",
        },
        {
            key: "phase_changed_at",
            label: "Phase Changed At",
            type: "text",
            placeholder: "Phase Changed At",
        },
        {
            key: "phase_changed_by",
            label: "Phase Changed By",
            type: "text",
            placeholder: "Phase Changed By",
        },
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

        { key: "latitude", label: "Latitude", type: "text", placeholder: "Latitude" },
        { key: "longitude", label: "Longitude", type: "text", placeholder: "Longitude" },
        { key: "occurred_at", label: "Occurred At", type: "datetime-local" },

        { key: "reported_by", label: "Reported By", type: "text", placeholder: "Reported By" },
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

        { key: "category", label: "Category", type: "text", placeholder: "Category" },
        {
            key: "connection_id",
            label: "Connection",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/integrations", labelField: "name" },
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
        {
            key: "event_id",
            label: "Event",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.event_id,
        },
        {
            key: "foh_zone_id",
            label: "FOH Zone",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/foh-zones", labelField: "name" },
        },
        { key: "is_refund", label: "Is Refund", type: "select", options: YES_NO_OPTIONS },
        {
            key: "live_event_id",
            label: "Live Event",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/live-events", labelField: "name" },
        },
        {
            key: "operator_name",
            label: "Operator Name",
            type: "text",
            placeholder: "Operator Name",
        },
        { key: "raw_payload", label: "Raw Payload", type: "text", placeholder: "Raw Payload" },
        {
            key: "refund_reason",
            label: "Refund Reason",
            type: "text",
            placeholder: "Refund Reason",
        },
        { key: "subtotal", label: "Subtotal", type: "currency" },
        { key: "tax_amount", label: "Tax Amount", type: "currency" },
        { key: "tip_amount", label: "Tip Amount", type: "currency" },
        { key: "total_amount", label: "Total Amount", type: "currency" },
        {
            key: "vendor_id",
            label: "Vendor",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.vendor_id,
        },

        {
            key: "transaction_at",
            label: "Transaction At",
            type: "text",
            placeholder: "Transaction At",
        },
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

        {
            key: "advance_id",
            label: "Advance",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.advance_id,
        },
        { key: "assigned_to", label: "Assigned To", type: "text", placeholder: "Assigned To" },
        {
            key: "budget_line_id",
            label: "Budget Line",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/budget-line-items", labelField: "description" },
        },
        {
            key: "delivery_location",
            label: "Delivery Location",
            type: "text",
            placeholder: "Delivery Location",
        },
        {
            key: "is_critical_path",
            label: "Is Critical Path",
            type: "select",
            options: YES_NO_OPTIONS,
        },
        {
            key: "reservation_id",
            label: "Reservation",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/inventory-reservations", labelField: "number" },
        },
        {
            key: "scheduled_delivery",
            label: "Scheduled Delivery",
            type: "text",
            placeholder: "Scheduled Delivery",
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        {
            key: "vendor_id",
            label: "Vendor",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.vendor_id,
        },

        {
            key: "actual_delivery",
            label: "Actual Delivery",
            type: "text",
            placeholder: "Actual Delivery",
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

        { key: "billable", label: "Billable", type: "text", placeholder: "Billable" },
        {
            key: "crew_member_id",
            label: "Crew Member",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.crew_member_id,
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Description...",
        },
        { key: "end_time", label: "End Time", type: "text" },
        {
            key: "invoice_id",
            label: "Invoice",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/invoices", labelField: "number" },
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
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        {
            key: "shift_id",
            label: "Shift",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/shifts", labelField: "title" },
        },
        {
            key: "sow_deliverable_id",
            label: "SOW Deliverable",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/sow-deliverables", labelField: "title" },
        },
        { key: "start_time", label: "Start Time", type: "text" },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        {
            key: "task_id",
            label: "Task",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/tasks", labelField: "title" },
        },
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

        { key: "deferred_amount", label: "Deferred Amount", type: "currency" },
        { key: "invoiced_amount", label: "Invoiced Amount", type: "currency" },
        { key: "method", label: "Method", type: "text", placeholder: "Method" },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Notes..." },
        { key: "period_end", label: "Period End", type: "date" },
        { key: "period_start", label: "Period Start", type: "date" },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "recognized_amount", label: "Recognized Amount", type: "currency" },
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

        { key: "all_day", label: "All Day", type: "text", placeholder: "All Day" },
        { key: "assignee_ids", label: "Assignee Ids", type: "text", placeholder: "Assignee Ids" },
        { key: "color", label: "Color", type: "text", placeholder: "Color" },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Description...",
        },
        { key: "end_datetime", label: "End Datetime", type: "text", placeholder: "End Datetime" },
        {
            key: "location_id",
            label: "Location",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.location_id,
        },
        {
            key: "location_name",
            label: "Location Name",
            type: "text",
            placeholder: "Location Name",
        },
        { key: "priority", label: "Priority", type: "text", placeholder: "Priority" },
        {
            key: "project_id",
            label: "Project",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.project_id,
        },
        { key: "recurrence", label: "Recurrence", type: "text", placeholder: "Recurrence" },
        {
            key: "reference_name",
            label: "Reference Name",
            type: "text",
            placeholder: "Reference Name",
        },
        {
            key: "reminder_minutes",
            label: "Reminder Minutes",
            type: "text",
            placeholder: "Reminder Minutes",
        },
        {
            key: "start_datetime",
            label: "Start Datetime",
            type: "text",
            placeholder: "Start Datetime",
        },
        { key: "status", label: "Status", type: "text", placeholder: "Status" },
        { key: "timezone", label: "Timezone", type: "text", placeholder: "Timezone" },
        { key: "type", label: "Type", type: "text", placeholder: "Type" },
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

        { key: "endpoint_url", label: "Endpoint Url", type: "url" },
        { key: "latency_ms", label: "Latency Ms", type: "text", placeholder: "Latency Ms" },
        { key: "uptime_pct", label: "Uptime Pct", type: "text", placeholder: "Uptime Pct" },

        {
            key: "last_checked_at",
            label: "Last Checked At",
            type: "text",
            placeholder: "Last Checked At",
        },
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

        { key: "due_at", label: "Due At", type: "text", placeholder: "Due At" },
        { key: "elapsed_hours", label: "Elapsed Hours", type: "number", min: 0 },
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

        { key: "answers", label: "Answers", type: "text", placeholder: "Answers" },
        { key: "comments", label: "Comments", type: "textarea", placeholder: "Comments..." },
        { key: "nps_score", label: "Nps Score", type: "text", placeholder: "Nps Score" },
        { key: "respondent_email", label: "Respondent Email", type: "email" },
        {
            key: "respondent_name",
            label: "Respondent Name",
            type: "text",
            placeholder: "Respondent Name",
        },
        {
            key: "template_id",
            label: "Template",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/templates", labelField: "name" },
        },

        {
            key: "respondent_id",
            label: "Respondent",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/user-profiles", labelField: "display_name" },
        },
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

        { key: "converted", label: "Converted", type: "text", placeholder: "Converted" },
        {
            key: "user_id",
            label: "User",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.user_id,
        },

        { key: "converted_at", label: "Converted At", type: "text", placeholder: "Converted At" },
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

        {
            key: "auto_reminder_enabled",
            label: "Auto Reminder Enabled",
            type: "text",
            placeholder: "Auto Reminder Enabled",
        },
        { key: "carrier_name", label: "Carrier Name", type: "text", placeholder: "Carrier Name" },
        { key: "coverage_amount", label: "Coverage Amount", type: "currency" },
        { key: "doc_name", label: "Doc Name", type: "text", placeholder: "Doc Name" },
        { key: "doc_number", label: "Doc Number", type: "text", placeholder: "Doc Number" },
        { key: "document_url", label: "Document Url", type: "url" },
        { key: "issued_date", label: "Issued Date", type: "date" },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Notes..." },
        {
            key: "policy_number",
            label: "Policy Number",
            type: "text",
            placeholder: "Policy Number",
        },
        {
            key: "rejection_reason",
            label: "Rejection Reason",
            type: "text",
            placeholder: "Rejection Reason",
        },
        {
            key: "template_id",
            label: "Template",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/templates", labelField: "name" },
        },

        { key: "reviewed_at", label: "Reviewed At", type: "text", placeholder: "Reviewed At" },
        { key: "reviewed_by", label: "Reviewed By", type: "text", placeholder: "Reviewed By" },
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

        {
            key: "acknowledgment_notes",
            label: "Acknowledgment Notes",
            type: "textarea",
            placeholder: "Acknowledgment Notes...",
        },
        {
            key: "areas_for_improvement",
            label: "Areas For Improvement",
            type: "textarea",
            placeholder: "Areas For Improvement...",
        },
        { key: "comments", label: "Comments", type: "textarea", placeholder: "Comments..." },
        {
            key: "communication_rating",
            label: "Communication Rating",
            type: "number",
            min: 1,
            max: 5,
        },
        {
            key: "engagement_term_id",
            label: "Engagement Term",
            type: "entity-lookup",
            lookupConfig: { apiPath: "/api/entities/engagement-terms", labelField: "title" },
        },
        { key: "goals", label: "Goals", type: "textarea", placeholder: "Goals..." },
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
        { key: "reliability_rating", label: "Reliability Rating", type: "number", min: 1, max: 5 },
        { key: "review_date", label: "Review Date", type: "date" },
        {
            key: "review_period_end",
            label: "Review Period End",
            type: "text",
            placeholder: "Review Period End",
        },
        {
            key: "review_period_start",
            label: "Review Period Start",
            type: "text",
            placeholder: "Review Period Start",
        },
        {
            key: "reviewer_id",
            label: "Reviewer",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.reviewer_id,
        },
        { key: "safety_rating", label: "Safety Rating", type: "number", min: 1, max: 5 },
        { key: "strengths", label: "Strengths", type: "textarea", placeholder: "Strengths..." },
        { key: "target_type", label: "Target Type", type: "text", placeholder: "Target Type" },
        { key: "timeliness_rating", label: "Timeliness Rating", type: "number", min: 1, max: 5 },
        {
            key: "work_order_id",
            label: "Work Order",
            type: "entity-lookup",
            lookupConfig: FK_LOOKUP_CONFIGS.work_order_id,
        },
        { key: "would_reengage", label: "Would Reengage", type: "select", options: YES_NO_OPTIONS },
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
