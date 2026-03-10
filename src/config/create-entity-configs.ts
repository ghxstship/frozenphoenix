import type { CreateEntityConfig } from "@/components/create-entity-dialog";
import {
    DEAL_STAGE_MAP,
    PROJECT_STATUS_MAP,
    TASK_PRIORITY_MAP,
    TASK_STATUS_MAP,
} from "@/config/domain-config";

// ─── Helpers ───

function mapToOptions(map: Record<string, { label: string }>): { value: string; label: string }[] {
    return Object.entries(map).map(([value, { label }]) => ({ value, label }));
}

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
        { key: "budget", label: "Budget", type: "currency" },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Brief project description...",
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
            options: [
                { value: "experiential", label: "Experiential" },
                { value: "digital", label: "Digital" },
                { value: "sampling", label: "Sampling" },
                { value: "sponsorship", label: "Sponsorship" },
                { value: "retail", label: "Retail" },
            ],
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
            options: [
                { value: "draft", label: "Draft" },
                { value: "in_review", label: "In Review" },
                { value: "approved", label: "Approved" },
                { value: "active", label: "Active" },
            ],
            defaultValue: "draft",
            required: true,
        },
        { key: "start_date", label: "Start Date", type: "date" },
        { key: "end_date", label: "End Date", type: "date" },
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
        { key: "contact", label: "Contact Name", type: "text", placeholder: "Primary contact" },
    ],
};

export const CREATE_LEAD_CONFIG: CreateEntityConfig = {
    entityName: "Lead",
    description: "Create a new lead.",
    fields: [
        { key: "name", label: "Name", type: "text", placeholder: "Full name", required: true },
        { key: "email", label: "Email", type: "email", placeholder: "email@company.com" },
        { key: "company", label: "Company", type: "text", placeholder: "Company name" },
        { key: "phone", label: "Phone", type: "text", placeholder: "+1 (555) 000-0000" },
        {
            key: "source",
            label: "Source",
            type: "select",
            options: [
                { value: "website", label: "Website" },
                { value: "referral", label: "Referral" },
                { value: "cold_outreach", label: "Cold Outreach" },
                { value: "event", label: "Event" },
                { value: "social", label: "Social Media" },
                { value: "other", label: "Other" },
            ],
        },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Initial notes..." },
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
            options: [
                { value: "qualification", label: "Qualification" },
                { value: "discovery", label: "Discovery" },
                { value: "proposal", label: "Proposal" },
                { value: "negotiation", label: "Negotiation" },
                { value: "closed_won", label: "Closed Won" },
                { value: "closed_lost", label: "Closed Lost" },
            ],
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
            options: [
                { value: "client", label: "Client" },
                { value: "brand", label: "Brand" },
                { value: "agency", label: "Agency" },
                { value: "vendor", label: "Vendor" },
                { value: "partner", label: "Partner" },
            ],
            defaultValue: "client",
            required: true,
        },
        { key: "industry", label: "Industry", type: "text", placeholder: "e.g. Technology" },
        { key: "website", label: "Website", type: "text", placeholder: "https://example.com" },
        { key: "email", label: "Email", type: "email", placeholder: "info@company.com" },
        { key: "phone", label: "Phone", type: "text", placeholder: "+1 (555) 000-0000" },
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
            options: [
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "urgent", label: "Urgent" },
            ],
            defaultValue: "medium",
            required: true,
        },
        {
            key: "category",
            label: "Category",
            type: "select",
            options: [
                { value: "technical", label: "Technical" },
                { value: "logistics", label: "Logistics" },
                { value: "billing", label: "Billing" },
                { value: "general", label: "General" },
            ],
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Describe the request...",
            required: true,
        },
    ],
};

// ─── Finance ───

export const CREATE_INVOICE_CONFIG: CreateEntityConfig = {
    entityName: "Invoice",
    description: "Create a new invoice.",
    fields: [
        {
            key: "invoice_number",
            label: "Invoice Number",
            type: "text",
            placeholder: "INV-001",
            required: true,
        },
        {
            key: "company_name",
            label: "Client",
            type: "text",
            placeholder: "Client or company name",
            required: true,
        },
        { key: "amount", label: "Amount", type: "currency", required: true },
        { key: "issue_date", label: "Issue Date", type: "date", required: true },
        { key: "due_date", label: "Due Date", type: "date", required: true },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: [
                { value: "draft", label: "Draft" },
                { value: "sent", label: "Sent" },
                { value: "paid", label: "Paid" },
            ],
            defaultValue: "draft",
        },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Invoice notes..." },
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
            options: [
                { value: "travel", label: "Travel" },
                { value: "materials", label: "Materials" },
                { value: "equipment", label: "Equipment" },
                { value: "venue", label: "Venue" },
                { value: "catering", label: "Catering" },
                { value: "labor", label: "Labor" },
                { value: "marketing", label: "Marketing" },
                { value: "other", label: "Other" },
            ],
            required: true,
        },
        { key: "date", label: "Date", type: "date", required: true },
        { key: "vendor", label: "Vendor", type: "text", placeholder: "Vendor name" },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Receipt details..." },
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
            key: "client",
            label: "Client",
            type: "text",
            placeholder: "Client name",
            required: true,
        },
        { key: "amount", label: "Estimated Amount", type: "currency", required: true },
        { key: "valid_until", label: "Valid Until", type: "date" },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: [
                { value: "draft", label: "Draft" },
                { value: "sent", label: "Sent" },
                { value: "accepted", label: "Accepted" },
                { value: "declined", label: "Declined" },
            ],
            defaultValue: "draft",
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Estimate details...",
        },
    ],
};

export const CREATE_BUDGET_CONFIG: CreateEntityConfig = {
    entityName: "Budget",
    description: "Create a new budget.",
    fields: [
        {
            key: "name",
            label: "Budget Name",
            type: "text",
            placeholder: "e.g. Event Production Budget",
            required: true,
        },
        { key: "total_amount", label: "Total Amount", type: "currency", required: true },
        { key: "start_date", label: "Start Date", type: "date" },
        { key: "end_date", label: "End Date", type: "date" },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: [
                { value: "draft", label: "Draft" },
                { value: "pending_approval", label: "Pending Approval" },
                { value: "approved", label: "Approved" },
                { value: "active", label: "Active" },
            ],
            defaultValue: "draft",
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Budget notes...",
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
            options: [
                { value: "draft", label: "Draft" },
                { value: "issued", label: "Issued" },
            ],
            defaultValue: "draft",
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
            options: [
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "urgent", label: "Urgent" },
            ],
            defaultValue: "medium",
        },
        {
            key: "justification",
            label: "Justification",
            type: "textarea",
            placeholder: "Why is this purchase needed?",
            required: true,
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
            options: [
                { value: "creative", label: "Creative" },
                { value: "production", label: "Production" },
                { value: "marketing", label: "Marketing" },
                { value: "event", label: "Event" },
            ],
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
            options: [
                { value: "planning", label: "Planning" },
                { value: "active", label: "Active" },
                { value: "paused", label: "Paused" },
                { value: "completed", label: "Completed" },
            ],
            defaultValue: "planning",
        },
        { key: "start_date", label: "Start Date", type: "date" },
        { key: "end_date", label: "End Date", type: "date" },
        { key: "budget", label: "Budget", type: "currency" },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Campaign overview...",
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
            key: "client",
            label: "Client",
            type: "text",
            placeholder: "Client name",
            required: true,
        },
        { key: "value", label: "Proposed Value", type: "currency" },
        { key: "due_date", label: "Submission Deadline", type: "date" },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: [
                { value: "draft", label: "Draft" },
                { value: "in_review", label: "In Review" },
                { value: "sent", label: "Sent" },
                { value: "accepted", label: "Accepted" },
                { value: "declined", label: "Declined" },
            ],
            defaultValue: "draft",
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Proposal summary...",
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
            options: [
                { value: "production", label: "Production" },
                { value: "av", label: "AV & Technical" },
                { value: "catering", label: "Catering" },
                { value: "staffing", label: "Staffing" },
                { value: "logistics", label: "Logistics" },
                { value: "creative", label: "Creative" },
                { value: "venue", label: "Venue" },
                { value: "other", label: "Other" },
            ],
        },
        { key: "website", label: "Website", type: "url", placeholder: "https://..." },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Vendor details..." },
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
        { key: "vendor", label: "Vendor", type: "text", placeholder: "Assigned vendor" },
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
            defaultValue: "medium",
            required: true,
        },
        { key: "due_date", label: "Due Date", type: "date" },
        { key: "budget", label: "Budget", type: "currency" },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Work order details...",
            required: true,
        },
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
            options: [
                { value: "vendor", label: "Vendor Agreement" },
                { value: "client", label: "Client Agreement" },
                { value: "nda", label: "NDA" },
                { value: "employment", label: "Employment" },
                { value: "lease", label: "Lease" },
                { value: "other", label: "Other" },
            ],
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
            options: [
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "critical", label: "Critical" },
            ],
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
            options: [
                { value: "av", label: "AV Equipment" },
                { value: "staging", label: "Staging" },
                { value: "lighting", label: "Lighting" },
                { value: "furniture", label: "Furniture" },
                { value: "signage", label: "Signage" },
                { value: "vehicle", label: "Vehicle" },
                { value: "tool", label: "Tool" },
                { value: "other", label: "Other" },
            ],
            required: true,
        },
        { key: "serial_number", label: "Serial Number", type: "text", placeholder: "S/N" },
        { key: "purchase_cost", label: "Purchase Cost", type: "currency" },
        { key: "purchase_date", label: "Purchase Date", type: "date" },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Asset details..." },
    ],
};

export const CREATE_SHIPMENT_CONFIG: CreateEntityConfig = {
    entityName: "Shipment",
    description: "Create a new shipment.",
    fields: [
        {
            key: "reference",
            label: "Reference / Tracking",
            type: "text",
            placeholder: "e.g. SHIP-2024-001",
            required: true,
        },
        {
            key: "origin",
            label: "Origin",
            type: "text",
            placeholder: "Warehouse or address",
            required: true,
        },
        {
            key: "destination",
            label: "Destination",
            type: "text",
            placeholder: "Venue or address",
            required: true,
        },
        { key: "ship_date", label: "Ship Date", type: "date", required: true },
        { key: "expected_arrival", label: "Expected Arrival", type: "date" },
        { key: "carrier", label: "Carrier", type: "text", placeholder: "Carrier name" },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Shipment details..." },
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
            options: [
                { value: "client", label: "Client" },
                { value: "partner", label: "Partner" },
                { value: "sponsor", label: "Sponsor" },
                { value: "agency", label: "Agency" },
                { value: "other", label: "Other" },
            ],
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
            key: "name",
            label: "Full Name",
            type: "text",
            placeholder: "e.g. John Doe",
            required: true,
        },
        { key: "role", label: "Role", type: "text", placeholder: "e.g. Stagehand", required: true },
        { key: "email", label: "Email", type: "email", placeholder: "john@company.com" },
        { key: "phone", label: "Phone", type: "text", placeholder: "+1 (555) 000-0000" },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: [
                { value: "active", label: "Active" },
                { value: "on_leave", label: "On Leave" },
                { value: "inactive", label: "Inactive" },
            ],
            defaultValue: "active",
        },
        { key: "hourly_rate", label: "Hourly Rate", type: "currency" },
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
            options: [
                { value: "visual_identity", label: "Visual Identity" },
                { value: "typography", label: "Typography" },
                { value: "color", label: "Color" },
                { value: "photography", label: "Photography" },
                { value: "tone_of_voice", label: "Tone of Voice" },
                { value: "general", label: "General" },
            ],
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
            options: [
                { value: "draft", label: "Draft" },
                { value: "active", label: "Active" },
                { value: "archived", label: "Archived" },
            ],
            defaultValue: "draft",
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Kit contents and usage...",
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
            options: [
                { value: "pitch", label: "Pitch" },
                { value: "portfolio", label: "Portfolio" },
                { value: "case_study", label: "Case Study" },
                { value: "internal", label: "Internal" },
                { value: "other", label: "Other" },
            ],
        },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: [
                { value: "draft", label: "Draft" },
                { value: "in_review", label: "In Review" },
                { value: "final", label: "Final" },
            ],
            defaultValue: "draft",
        },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Deck purpose and contents...",
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
            options: [
                { value: "av", label: "AV / Audio Visual" },
                { value: "lighting", label: "Lighting" },
                { value: "staging", label: "Staging" },
                { value: "power", label: "Power / Electrical" },
                { value: "rigging", label: "Rigging" },
                { value: "network", label: "Network / IT" },
                { value: "other", label: "Other" },
            ],
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
            options: [
                { value: "active", label: "Active" },
                { value: "expired", label: "Expired" },
                { value: "pending", label: "Pending Renewal" },
            ],
            defaultValue: "active",
        },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Additional details..." },
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
            options: [
                { value: "safety", label: "Safety" },
                { value: "regulatory", label: "Regulatory" },
                { value: "quality", label: "Quality" },
                { value: "environmental", label: "Environmental" },
                { value: "general", label: "General" },
            ],
            required: true,
        },
        { key: "due_date", label: "Due Date", type: "date" },
        {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Checklist scope and requirements...",
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
            options: [
                { value: "general_liability", label: "General Liability" },
                { value: "workers_comp", label: "Workers' Compensation" },
                { value: "property", label: "Property" },
                { value: "professional_liability", label: "Professional Liability" },
                { value: "event_cancellation", label: "Event Cancellation" },
                { value: "auto", label: "Auto" },
                { value: "umbrella", label: "Umbrella" },
            ],
            required: true,
        },
        { key: "coverage_amount", label: "Coverage Amount", type: "currency", required: true },
        { key: "start_date", label: "Effective Date", type: "date", required: true },
        { key: "end_date", label: "Expiration Date", type: "date", required: true },
        { key: "premium", label: "Premium", type: "currency" },
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
            options: [
                { value: "event", label: "Event Permit" },
                { value: "building", label: "Building Permit" },
                { value: "noise", label: "Noise Permit" },
                { value: "fire", label: "Fire Safety" },
                { value: "health", label: "Health / Food" },
                { value: "alcohol", label: "Alcohol License" },
                { value: "other", label: "Other" },
            ],
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
        {
            key: "client_name",
            label: "Client",
            type: "text",
            placeholder: "Client name",
            required: true,
        },
        { key: "amount", label: "Amount", type: "currency", required: true },
        { key: "issue_date", label: "Issue Date", type: "date", required: true },
        { key: "due_date", label: "Due Date", type: "date", required: true },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: [
                { value: "draft", label: "Draft" },
                { value: "sent", label: "Sent" },
                { value: "paid", label: "Paid" },
                { value: "overdue", label: "Overdue" },
            ],
            defaultValue: "draft",
        },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Invoice notes..." },
    ],
};

export const CREATE_RECURRING_INVOICE_CONFIG: CreateEntityConfig = {
    entityName: "Recurring Invoice",
    description: "Set up a new recurring invoice.",
    fields: [
        {
            key: "title",
            label: "Title",
            type: "text",
            placeholder: "e.g. Monthly Retainer — Acme",
            required: true,
        },
        {
            key: "client_name",
            label: "Client",
            type: "text",
            placeholder: "Client name",
            required: true,
        },
        { key: "amount", label: "Amount", type: "currency", required: true },
        {
            key: "frequency",
            label: "Frequency",
            type: "select",
            options: [
                { value: "weekly", label: "Weekly" },
                { value: "biweekly", label: "Bi-weekly" },
                { value: "monthly", label: "Monthly" },
                { value: "quarterly", label: "Quarterly" },
                { value: "annually", label: "Annually" },
            ],
            defaultValue: "monthly",
            required: true,
        },
        { key: "start_date", label: "Start Date", type: "date", required: true },
        { key: "end_date", label: "End Date", type: "date" },
    ],
};

// ─── Operations (additional) ───

export const CREATE_DISPATCH_CONFIG: CreateEntityConfig = {
    entityName: "Dispatch",
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
            options: [
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "urgent", label: "Urgent" },
            ],
            defaultValue: "medium",
        },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Dispatch details..." },
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
            options: [
                { value: "quality", label: "Quality of Work" },
                { value: "timeliness", label: "Timeliness" },
                { value: "communication", label: "Communication" },
                { value: "value", label: "Value for Money" },
                { value: "overall", label: "Overall" },
            ],
            defaultValue: "overall",
        },
        {
            key: "comments",
            label: "Comments",
            type: "textarea",
            placeholder: "Performance notes...",
            required: true,
        },
    ],
};

// ─── Automations ───

export const CREATE_AUTOMATION_CONFIG: CreateEntityConfig = {
    entityName: "Automation",
    description: "Create a new trigger-action automation.",
    fields: [
        { key: "name", label: "Automation Name", type: "text", placeholder: "e.g. Auto-assign on task creation", required: true },
        { key: "description", label: "Description", type: "textarea", placeholder: "What does this automation do?" },
        {
            key: "entity_type",
            label: "Entity Type",
            type: "select",
            options: [
                { value: "project", label: "Project" },
                { value: "task", label: "Task" },
                { value: "deal", label: "Deal" },
                { value: "invoice", label: "Invoice" },
                { value: "event", label: "Event" },
            ],
            required: true,
        },
    ],
};

// ─── Call Sheets ───

export const CREATE_CALL_SHEET_CONFIG: CreateEntityConfig = {
    entityName: "Call Sheet",
    description: "Create a new daily call sheet for a production.",
    fields: [
        { key: "title", label: "Title", type: "text", placeholder: "e.g. Day 1 — Main Stage Load-In", required: true },
        { key: "date", label: "Date", type: "date", required: true },
        { key: "venue_name", label: "Venue Name", type: "text", placeholder: "Venue or location name" },
        { key: "venue_address", label: "Venue Address", type: "text", placeholder: "Full address" },
        { key: "special_instructions", label: "Special Instructions", type: "textarea", placeholder: "Parking, load-in notes, etc." },
    ],
};

// ─── Case Studies ───

export const CREATE_CASE_STUDY_CONFIG: CreateEntityConfig = {
    entityName: "Case Study",
    description: "Draft a new case study for a completed project.",
    fields: [
        { key: "title", label: "Title", type: "text", placeholder: "e.g. Nike Air Max Global Launch", required: true },
        { key: "client", label: "Client", type: "text", placeholder: "Client name", required: true },
        { key: "summary", label: "Summary", type: "textarea", placeholder: "Brief overview of the project and outcomes", required: true },
    ],
};

// ─── Checklists ───

export const CREATE_CHECKLIST_CONFIG: CreateEntityConfig = {
    entityName: "Checklist",
    description: "Create a new checklist template.",
    fields: [
        { key: "title", label: "Title", type: "text", placeholder: "e.g. Pre-Event Safety Checklist", required: true },
        { key: "description", label: "Description", type: "textarea", placeholder: "Purpose and scope of this checklist" },
        {
            key: "type",
            label: "Type",
            type: "select",
            options: [
                { value: "custom", label: "Custom" },
                { value: "safety", label: "Safety" },
                { value: "quality", label: "Quality" },
                { value: "setup", label: "Setup" },
                { value: "teardown", label: "Teardown" },
            ],
            defaultValue: "custom",
        },
    ],
};

// ─── Clause Library ───

export const CREATE_CLAUSE_CONFIG: CreateEntityConfig = {
    entityName: "Contract Clause",
    description: "Add a reusable clause to the library.",
    fields: [
        { key: "description", label: "Clause Text", type: "textarea", placeholder: "Full clause language...", required: true },
        { key: "clause_reference", label: "Reference Code", type: "text", placeholder: "e.g. IP-001" },
        {
            key: "party",
            label: "Obligated Party",
            type: "select",
            options: [
                { value: "client", label: "Client" },
                { value: "vendor", label: "Vendor" },
                { value: "company", label: "Company" },
                { value: "both", label: "Both Parties" },
            ],
            required: true,
        },
    ],
};

// ─── Credentials ───

export const CREATE_CREDENTIAL_CONFIG: CreateEntityConfig = {
    entityName: "Credential Type",
    description: "Define a new credential type for event access.",
    fields: [
        { key: "name", label: "Credential Name", type: "text", placeholder: "e.g. All-Access Pass", required: true },
        { key: "description", label: "Description", type: "textarea", placeholder: "Access level and restrictions" },
    ],
};

// ─── Credit Notes ───

export const CREATE_CREDIT_NOTE_CONFIG: CreateEntityConfig = {
    entityName: "Credit Note",
    description: "Issue a new credit note against an invoice.",
    fields: [
        { key: "number", label: "Credit Note Number", type: "text", placeholder: "e.g. CN-001", required: true },
        { key: "amount", label: "Amount", type: "number", min: 0, step: 0.01, required: true },
        { key: "reason", label: "Reason", type: "textarea", placeholder: "Reason for the credit note", required: true },
    ],
};

// ─── Dashboards ───

export const CREATE_DASHBOARD_CONFIG: CreateEntityConfig = {
    entityName: "Dashboard",
    description: "Create a new custom dashboard.",
    fields: [
        { key: "name", label: "Dashboard Name", type: "text", placeholder: "e.g. Executive Overview", required: true },
        { key: "description", label: "Description", type: "textarea", placeholder: "What data should this dashboard display?" },
    ],
};

// ─── Documents ───

export const CREATE_DOCUMENT_CONFIG: CreateEntityConfig = {
    entityName: "Document",
    description: "Create a new document.",
    fields: [
        { key: "title", label: "Title", type: "text", placeholder: "e.g. Production Brief — Q4 Campaign", required: true },
        {
            key: "document_type",
            label: "Document Type",
            type: "select",
            options: [
                { value: "doc", label: "Document" },
                { value: "wiki", label: "Wiki" },
                { value: "meeting_notes", label: "Meeting Notes" },
                { value: "sow", label: "Scope of Work" },
                { value: "template", label: "Template" },
            ],
            defaultValue: "doc",
        },
    ],
};

// ─── Engineering Approvals ───

export const CREATE_ENGINEERING_APPROVAL_CONFIG: CreateEntityConfig = {
    entityName: "Engineering Approval",
    description: "Request a new engineering approval.",
    fields: [
        { key: "engineer_name", label: "Engineer Name", type: "text", placeholder: "Licensed engineer", required: true },
        { key: "engineering_firm", label: "Engineering Firm", type: "text", placeholder: "Firm name" },
        {
            key: "entity_type",
            label: "Entity Type",
            type: "select",
            options: [
                { value: "activation", label: "Activation" },
                { value: "location", label: "Location" },
                { value: "asset", label: "Asset" },
                { value: "event", label: "Event" },
            ],
            required: true,
        },
        { key: "conditions", label: "Conditions / Notes", type: "textarea", placeholder: "Any special conditions..." },
    ],
};

// ─── Fleet / Vehicles ───

export const CREATE_VEHICLE_CONFIG: CreateEntityConfig = {
    entityName: "Vehicle",
    description: "Add a new vehicle to the fleet.",
    fields: [
        { key: "name", label: "Vehicle Name", type: "text", placeholder: "e.g. Box Truck #3", required: true },
        {
            key: "type",
            label: "Type",
            type: "select",
            options: [
                { value: "box_truck", label: "Box Truck" },
                { value: "sprinter_van", label: "Sprinter Van" },
                { value: "flatbed", label: "Flatbed" },
                { value: "pickup", label: "Pickup" },
                { value: "trailer", label: "Trailer" },
                { value: "other", label: "Other" },
            ],
            required: true,
        },
        { key: "license_plate", label: "License Plate", type: "text", placeholder: "ABC-1234", required: true },
        { key: "driver_name", label: "Driver Name", type: "text", placeholder: "Assigned driver", required: true },
        { key: "driver_phone", label: "Driver Phone", type: "text", placeholder: "+1 555-0100", required: true },
        { key: "dock_height", label: "Dock Height", type: "text", placeholder: "e.g. 48\"", required: true },
    ],
};

// ─── GL Accounts ───

export const CREATE_GL_ACCOUNT_CONFIG: CreateEntityConfig = {
    entityName: "GL Account",
    description: "Add a new general ledger account.",
    fields: [
        { key: "code", label: "Account Code", type: "text", placeholder: "e.g. 5100", required: true },
        { key: "name", label: "Account Name", type: "text", placeholder: "e.g. Cost of Goods Sold", required: true },
        { key: "description", label: "Description", type: "textarea", placeholder: "Purpose of this account" },
    ],
};

// ─── Goods Receipts ───

export const CREATE_GOODS_RECEIPT_CONFIG: CreateEntityConfig = {
    entityName: "Goods Receipt",
    description: "Record receipt of goods from a purchase order.",
    fields: [
        { key: "receipt_number", label: "Receipt Number", type: "text", placeholder: "e.g. GR-001", required: true },
        { key: "delivery_location", label: "Delivery Location", type: "text", placeholder: "Where goods were received" },
        { key: "condition_notes", label: "Condition Notes", type: "textarea", placeholder: "Note any damage or discrepancies" },
    ],
};

// ─── Integrations ───

export const CREATE_INTEGRATION_CONFIG: CreateEntityConfig = {
    entityName: "Integration",
    description: "Connect a new external service.",
    fields: [
        { key: "name", label: "Connection Name", type: "text", placeholder: "e.g. Main QuickBooks", required: true },
        {
            key: "type",
            label: "Service",
            type: "select",
            options: [
                { value: "quickbooks", label: "QuickBooks" },
                { value: "xero", label: "Xero" },
                { value: "slack", label: "Slack" },
                { value: "google_calendar", label: "Google Calendar" },
                { value: "dropbox", label: "Dropbox" },
                { value: "google_drive", label: "Google Drive" },
                { value: "zapier", label: "Zapier" },
            ],
            required: true,
        },
    ],
};

// ─── Inventory ───

export const CREATE_INVENTORY_ITEM_CONFIG: CreateEntityConfig = {
    entityName: "Inventory Item",
    description: "Add a new item to inventory.",
    fields: [
        { key: "name", label: "Item Name", type: "text", placeholder: "e.g. LED Panel 4×8", required: true },
        { key: "category", label: "Category", type: "text", placeholder: "e.g. Lighting", required: true },
        { key: "barcode", label: "Barcode / SKU", type: "text", placeholder: "Scan or enter barcode", required: true },
        { key: "location", label: "Location", type: "text", placeholder: "Storage location", required: true },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Additional details..." },
    ],
};

// ─── IP Rights ───

export const CREATE_IP_RIGHT_CONFIG: CreateEntityConfig = {
    entityName: "IP Right",
    description: "Register a new intellectual property right.",
    fields: [
        { key: "asset_description", label: "Asset Description", type: "textarea", placeholder: "Describe the IP asset", required: true },
        { key: "territory", label: "Territory", type: "text", placeholder: "e.g. Worldwide", defaultValue: "worldwide" },
        { key: "duration", label: "Duration", type: "text", placeholder: "e.g. In perpetuity" },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Additional terms..." },
    ],
};

// ─── Obligations ───

export const CREATE_OBLIGATION_CONFIG: CreateEntityConfig = {
    entityName: "Obligation",
    description: "Track a new contractual obligation.",
    fields: [
        { key: "description", label: "Description", type: "textarea", placeholder: "What must be delivered or performed", required: true },
        { key: "clause_reference", label: "Clause Reference", type: "text", placeholder: "e.g. Section 4.2" },
        { key: "due_date", label: "Due Date", type: "date" },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Additional context..." },
    ],
};

// ─── Payments ───

export const CREATE_PAYMENT_CONFIG: CreateEntityConfig = {
    entityName: "Payment",
    description: "Record a new payment against an invoice.",
    fields: [
        { key: "amount", label: "Amount", type: "number", min: 0, step: 0.01, required: true },
        { key: "payment_date", label: "Payment Date", type: "date", required: true },
        { key: "reference_number", label: "Reference Number", type: "text", placeholder: "Check/wire reference" },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Payment details..." },
    ],
};

// ─── Quality Checks ───

export const CREATE_QUALITY_CHECK_CONFIG: CreateEntityConfig = {
    entityName: "Quality Inspection",
    description: "Start a new quality inspection.",
    fields: [
        {
            key: "entity_type",
            label: "Entity Type",
            type: "select",
            options: [
                { value: "asset", label: "Asset" },
                { value: "shipment", label: "Shipment" },
                { value: "activation", label: "Activation" },
                { value: "warehouse", label: "Warehouse" },
            ],
            required: true,
        },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Inspection scope and objectives..." },
    ],
};

// ─── Rate Cards ───

export const CREATE_RATE_CARD_CONFIG: CreateEntityConfig = {
    entityName: "Rate Card",
    description: "Create a new rate card for pricing.",
    fields: [
        { key: "name", label: "Rate Card Name", type: "text", placeholder: "e.g. 2026 Standard Rates", required: true },
        { key: "description", label: "Description", type: "textarea", placeholder: "Applicable services and terms" },
        { key: "currency", label: "Currency", type: "text", placeholder: "USD", defaultValue: "USD" },
        { key: "effective_date", label: "Effective Date", type: "date" },
        { key: "expiration_date", label: "Expiration Date", type: "date" },
    ],
};

// ─── Resource Bookings ───

export const CREATE_RESOURCE_BOOKING_CONFIG: CreateEntityConfig = {
    entityName: "Resource Booking",
    description: "Book a crew member for a project.",
    fields: [
        { key: "placeholder_name", label: "Resource / Name", type: "text", placeholder: "Crew member or placeholder name", required: true },
        { key: "role", label: "Role", type: "text", placeholder: "e.g. Lead Technician" },
        { key: "start_date", label: "Start Date", type: "date", required: true },
        { key: "end_date", label: "End Date", type: "date", required: true },
        { key: "hours_per_day", label: "Hours per Day", type: "number", min: 0, max: 24, step: 0.5, defaultValue: "8" },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Booking details..." },
    ],
};

// ─── Saved Views ───

export const CREATE_SAVED_VIEW_CONFIG: CreateEntityConfig = {
    entityName: "Saved View",
    description: "Save a custom view configuration.",
    fields: [
        { key: "name", label: "View Name", type: "text", placeholder: "e.g. My Active Projects", required: true },
        { key: "description", label: "Description", type: "textarea", placeholder: "What does this view show?" },
        {
            key: "view_type",
            label: "View Type",
            type: "select",
            options: [
                { value: "table", label: "Table" },
                { value: "board", label: "Board" },
                { value: "list", label: "List" },
                { value: "calendar", label: "Calendar" },
                { value: "timeline", label: "Timeline" },
                { value: "gantt", label: "Gantt" },
            ],
            defaultValue: "table",
            required: true,
        },
    ],
};

// ─── Scenarios ───

export const CREATE_SCENARIO_CONFIG: CreateEntityConfig = {
    entityName: "Scenario",
    description: "Create a new what-if scenario.",
    fields: [
        { key: "name", label: "Scenario Name", type: "text", placeholder: "e.g. Headcount +20%", required: true },
        { key: "description", label: "Description", type: "textarea", placeholder: "What assumptions does this scenario explore?" },
        {
            key: "scenario_type",
            label: "Type",
            type: "select",
            options: [
                { value: "combined", label: "Combined" },
                { value: "budget", label: "Budget" },
                { value: "resource", label: "Resource" },
                { value: "timeline", label: "Timeline" },
            ],
            defaultValue: "combined",
        },
    ],
};

// ─── Scheduling / Shifts ───

export const CREATE_SHIFT_CONFIG: CreateEntityConfig = {
    entityName: "Shift",
    description: "Schedule a new crew shift.",
    fields: [
        { key: "date", label: "Date", type: "date", required: true },
        { key: "start_time", label: "Start Time", type: "text", placeholder: "e.g. 08:00", required: true },
        { key: "end_time", label: "End Time", type: "text", placeholder: "e.g. 18:00", required: true },
        { key: "role", label: "Role", type: "text", placeholder: "e.g. Stage Manager" },
    ],
};

// ─── SOPs ───

export const CREATE_SOP_CONFIG: CreateEntityConfig = {
    entityName: "SOP",
    description: "Create a new Standard Operating Procedure.",
    fields: [
        { key: "title", label: "Title", type: "text", placeholder: "e.g. Emergency Evacuation Procedure", required: true },
        { key: "role", label: "Applicable Role", type: "text", placeholder: "e.g. All Crew", required: true },
        { key: "content", label: "Content", type: "textarea", placeholder: "Step-by-step instructions...", required: true },
        { key: "version", label: "Version", type: "text", placeholder: "1.0", defaultValue: "1.0" },
    ],
};

// ─── Surveys ───

export const CREATE_SURVEY_CONFIG: CreateEntityConfig = {
    entityName: "Survey Template",
    description: "Create a new survey template.",
    fields: [
        { key: "name", label: "Survey Name", type: "text", placeholder: "e.g. Post-Event Satisfaction", required: true },
        { key: "description", label: "Description", type: "textarea", placeholder: "Purpose and audience" },
        {
            key: "survey_type",
            label: "Survey Type",
            type: "select",
            options: [
                { value: "csat", label: "CSAT" },
                { value: "nps", label: "NPS" },
                { value: "post_event", label: "Post-Event" },
                { value: "post_project", label: "Post-Project" },
                { value: "custom", label: "Custom" },
            ],
            defaultValue: "csat",
        },
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
    ],
};

// ─── Time Tracking ───

export const CREATE_TIME_ENTRY_CONFIG: CreateEntityConfig = {
    entityName: "Time Entry",
    description: "Log a new time entry.",
    fields: [
        { key: "date", label: "Date", type: "date", required: true },
        { key: "hours_worked", label: "Hours", type: "number", min: 0.25, max: 24, step: 0.25, required: true },
        { key: "hourly_rate", label: "Hourly Rate", type: "number", min: 0, step: 0.01, required: true },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "What did you work on?" },
    ],
};

// ─── User Invitations ───

export const CREATE_USER_INVITE_CONFIG: CreateEntityConfig = {
    entityName: "User Invitation",
    description: "Invite a new team member.",
    fields: [
        { key: "email", label: "Email", type: "text", placeholder: "name@company.com", required: true },
        { key: "full_name", label: "Full Name", type: "text", placeholder: "First and last name", required: true },
        {
            key: "role",
            label: "Role",
            type: "select",
            options: [
                { value: "exec", label: "Executive" },
                { value: "director", label: "Director" },
                { value: "pm", label: "Project Manager" },
                { value: "member", label: "Member" },
                { value: "client", label: "Client" },
                { value: "collaborator", label: "Collaborator" },
            ],
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
        { key: "name", label: "Document Name", type: "text", placeholder: "e.g. Venue NDA — Nike", required: true },
        {
            key: "category",
            label: "Category",
            type: "select",
            options: [
                { value: "contract", label: "Contract" },
                { value: "nda", label: "NDA" },
                { value: "permit", label: "Permit" },
                { value: "blueprint", label: "Blueprint" },
                { value: "site_map", label: "Site Map" },
                { value: "other", label: "Other" },
            ],
            defaultValue: "other",
            required: true,
        },
    ],
};

// ─── Vendor Onboarding ───

export const CREATE_VENDOR_ONBOARDING_CONFIG: CreateEntityConfig = {
    entityName: "Vendor Invitation",
    description: "Invite a vendor to begin onboarding.",
    fields: [
        { key: "name", label: "Vendor Name", type: "text", placeholder: "Company or contractor name", required: true },
        { key: "contact_name", label: "Contact Name", type: "text", placeholder: "Primary contact", required: true },
        { key: "email", label: "Email", type: "text", placeholder: "vendor@company.com", required: true },
        { key: "specialty", label: "Specialty", type: "text", placeholder: "e.g. AV, Rigging, Catering", required: true },
    ],
};

// ─── Warehouses ───

export const CREATE_WAREHOUSE_CONFIG: CreateEntityConfig = {
    entityName: "Warehouse",
    description: "Add a new warehouse or storage facility.",
    fields: [
        { key: "name", label: "Warehouse Name", type: "text", placeholder: "e.g. Main Warehouse — Brooklyn", required: true },
        {
            key: "type",
            label: "Type",
            type: "select",
            options: [
                { value: "primary", label: "Primary" },
                { value: "satellite", label: "Satellite" },
                { value: "staging", label: "Staging" },
                { value: "vendor", label: "Vendor" },
            ],
            defaultValue: "primary",
        },
        { key: "address_street1", label: "Street Address", type: "text", placeholder: "Street address" },
        { key: "address_city", label: "City", type: "text", placeholder: "City" },
        { key: "address_state", label: "State", type: "text", placeholder: "State" },
        { key: "address_postal_code", label: "Postal Code", type: "text", placeholder: "Zip code" },
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
            options: [
                { value: "labor", label: "Labor" },
                { value: "materials", label: "Materials" },
                { value: "equipment", label: "Equipment" },
                { value: "rentals", label: "Rentals" },
                { value: "travel", label: "Travel" },
                { value: "shipping", label: "Shipping" },
                { value: "permits", label: "Permits" },
                { value: "contingency", label: "Contingency" },
                { value: "overhead", label: "Overhead" },
            ],
        },
        { key: "description", label: "Description", type: "text", required: true, placeholder: "Line item description" },
        { key: "estimated_amount", label: "Estimated Amount", type: "number", required: true, placeholder: "0.00" },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Additional notes" },
    ],
};

// ── Project Members ──
export const CREATE_PROJECT_MEMBER_CONFIG: CreateEntityConfig = {
    entityName: "Project Member",
    description: "Add a team member to this project.",
    fields: [
        { key: "profile_id", label: "Team Member", type: "text", required: true, placeholder: "Member profile ID" },
        {
            key: "role",
            label: "Role",
            type: "select",
            options: [
                { value: "member", label: "Member" },
                { value: "lead", label: "Lead" },
                { value: "reviewer", label: "Reviewer" },
                { value: "contributor", label: "Contributor" },
            ],
            defaultValue: "member",
        },
    ],
};

export const CREATE_CUSTOM_FIELD_CONFIG: CreateEntityConfig = {
    entityName: "Custom Field",
    description: "Define a new custom property field on an entity type.",
    fields: [
        { key: "name", label: "Field Name", type: "text", required: true, placeholder: "e.g. Priority Score" },
        { key: "field_key", label: "Field Key", type: "text", required: true, placeholder: "e.g. priority_score" },
        {
            key: "entity_type",
            label: "Entity Type",
            type: "select",
            required: true,
            options: [
                { value: "project", label: "Project" },
                { value: "event", label: "Event" },
                { value: "vendor", label: "Vendor" },
                { value: "asset", label: "Asset" },
                { value: "contact", label: "Contact" },
                { value: "invoice", label: "Invoice" },
            ],
        },
        {
            key: "field_type",
            label: "Field Type",
            type: "select",
            required: true,
            options: [
                { value: "text", label: "Text" },
                { value: "number", label: "Number" },
                { value: "date", label: "Date" },
                { value: "boolean", label: "Toggle" },
                { value: "select", label: "Dropdown" },
                { value: "multi_select", label: "Multi-Select" },
            ],
            defaultValue: "text",
        },
        { key: "description", label: "Description", type: "textarea", placeholder: "What is this field for?" },
    ],
};

export const CREATE_GOAL_CONFIG: CreateEntityConfig = {
    entityName: "Goal",
    description: "Create a new goal or OKR.",
    fields: [
        { key: "title", label: "Title", type: "text", required: true, placeholder: "Goal title" },
        { key: "description", label: "Description", type: "textarea", placeholder: "What does success look like?" },
        {
            key: "goal_type",
            label: "Type",
            type: "select",
            required: true,
            options: [
                { value: "individual", label: "Individual" },
                { value: "team", label: "Team" },
                { value: "company", label: "Company" },
                { value: "project", label: "Project" },
            ],
            defaultValue: "individual",
        },
        { key: "target_value", label: "Target Value", type: "number", placeholder: "100" },
        { key: "unit", label: "Unit", type: "text", placeholder: "e.g. count, %, hours" },
        { key: "due_date", label: "Due Date", type: "date" },
    ],
};

export const CREATE_ONBOARDING_RUN_CONFIG: CreateEntityConfig = {
    entityName: "Onboarding Run",
    description: "Start a new onboarding workflow for a worker.",
    fields: [
        { key: "worker_profile_id", label: "Worker", type: "text", required: true, placeholder: "Worker profile ID" },
        { key: "target_completion_date", label: "Target Completion", type: "date" },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Additional context" },
    ],
};

export const CREATE_WORKER_REVIEW_CONFIG: CreateEntityConfig = {
    entityName: "Performance Review",
    description: "Create a new worker performance review.",
    fields: [
        { key: "worker_profile_id", label: "Worker", type: "text", required: true, placeholder: "Worker profile ID" },
        {
            key: "target_type",
            label: "Worker Type",
            type: "select",
            required: true,
            options: [
                { value: "employee", label: "Employee" },
                { value: "contractor", label: "Contractor" },
                { value: "vendor", label: "Vendor" },
                { value: "freelancer", label: "Freelancer" },
                { value: "intern", label: "Intern" },
            ],
            defaultValue: "employee",
        },
        {
            key: "review_type",
            label: "Review Type",
            type: "select",
            required: true,
            options: [
                { value: "periodic", label: "Periodic" },
                { value: "project_end", label: "End of Project" },
                { value: "mid_project", label: "Mid-Project" },
            ],
            defaultValue: "periodic",
        },
        { key: "overall_rating", label: "Overall Rating (1-5)", type: "number", required: true, placeholder: "1-5" },
        { key: "strengths", label: "Strengths", type: "textarea", placeholder: "Key strengths observed" },
        { key: "areas_for_improvement", label: "Areas for Improvement", type: "textarea", placeholder: "Growth opportunities" },
    ],
};
