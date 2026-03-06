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
