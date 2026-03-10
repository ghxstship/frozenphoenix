/* ═══════════════════════════════════════════════════════════════
   CSV TEMPLATES — Entity field mapping definitions (SSOT)
   
   Each template defines the complete field mapping for CSV
   import/export of a specific entity type. This is the single
   source of truth for column headers, types, validation rules,
   and example data.
   ═══════════════════════════════════════════════════════════════ */

// ─── Field Definition ───

export type CsvFieldType =
    | "string"
    | "number"
    | "boolean"
    | "date"
    | "enum"
    | "email"
    | "url"
    | "uuid"
    | "json";

export interface CsvFieldDef {
    dbColumn: string;
    csvHeader: string;
    required: boolean;
    type: CsvFieldType;
    enumValues?: string[];
    importable: boolean;
    exportable: boolean;
    example: string;
    description: string;
}

export interface CsvEntityTemplate {
    entity: string;
    dbTable: string;
    displayName: string;
    description: string;
    rbacResource: string;
    importEnabled: boolean;
    exportEnabled: boolean;
    fields: CsvFieldDef[];
    /** Optional select string for Supabase (joins) */
    selectQuery?: string;
    /** Default sort for export */
    defaultSort?: { column: string; ascending: boolean };
}

// ─── Helper to define a field ───

function field(
    dbColumn: string,
    csvHeader: string,
    opts: Partial<CsvFieldDef> & { type: CsvFieldType }
): CsvFieldDef {
    return {
        dbColumn,
        csvHeader,
        required: false,
        importable: true,
        exportable: true,
        example: "",
        description: "",
        ...opts,
    };
}

// System fields common to most entities
const ID_FIELD = field("id", "ID", {
    type: "uuid",
    importable: false,
    description: "System-generated unique identifier",
    example: "auto-generated",
});

const CREATED_AT = field("created_at", "Created At", {
    type: "date",
    importable: false,
    description: "Record creation timestamp (ISO 8601)",
    example: "2025-01-15T10:30:00Z",
});

const UPDATED_AT = field("updated_at", "Updated At", {
    type: "date",
    importable: false,
    description: "Last update timestamp (ISO 8601)",
    example: "2025-02-01T14:00:00Z",
});

const ORG_ID = field("organization_id", "Organization ID", {
    type: "uuid",
    importable: false,
    exportable: false,
    description: "Auto-set from authenticated user",
});

// ═══════════════════════════════════════════════════════════════
// TIER 1 — Core Business Entities (Import + Export)
// ═══════════════════════════════════════════════════════════════

export const COMPANIES_TEMPLATE: CsvEntityTemplate = {
    entity: "companies",
    dbTable: "companies",
    displayName: "Companies",
    description: "Client and partner companies",
    rbacResource: "companies",
    importEnabled: true,
    exportEnabled: true,
    defaultSort: { column: "name", ascending: true },
    fields: [
        field("name", "Company Name", { type: "string", required: true, example: "Acme Corp", description: "Company legal name" }),
        field("legal_name", "Legal Name", { type: "string", example: "Acme Corporation Inc.", description: "Registered legal name" }),
        field("industry", "Industry", { type: "string", example: "Technology", description: "Industry vertical" }),
        field("website", "Website", { type: "url", example: "https://acme.com", description: "Company website URL" }),
        field("phone", "Phone", { type: "string", example: "+1-555-0100", description: "Primary phone number" }),
        field("email", "Email", { type: "email", example: "info@acme.com", description: "Primary contact email" }),
        field("address_street1", "Street Address", { type: "string", example: "123 Main St", description: "Street address line 1" }),
        field("address_city", "City", { type: "string", example: "San Francisco", description: "City" }),
        field("address_state", "State", { type: "string", example: "CA", description: "State or province" }),
        field("address_postal_code", "Postal Code", { type: "string", example: "94105", description: "ZIP or postal code" }),
        field("address_country", "Country", { type: "string", example: "USA", description: "Country code" }),
        field("company_type", "Company Type", { type: "enum", enumValues: ["client", "brand", "agency", "vendor", "partner"], example: "client", description: "Relationship type" }),
        field("status", "Status", { type: "enum", enumValues: ["prospect", "active", "inactive", "churned"], example: "active", description: "Company status" }),
        field("default_currency", "Default Currency", { type: "string", example: "USD", description: "Default currency code (ISO 4217)" }),
        field("tax_id", "Tax ID", { type: "string", example: "12-3456789", description: "Tax identification number" }),
        field("notes", "Notes", { type: "string", example: "Key account", description: "Free-text notes" }),
        ID_FIELD, CREATED_AT, UPDATED_AT, ORG_ID,
    ],
};

export const DEALS_TEMPLATE: CsvEntityTemplate = {
    entity: "deals",
    dbTable: "deals",
    displayName: "Deals",
    description: "Sales pipeline deals and opportunities",
    rbacResource: "deals",
    importEnabled: true,
    exportEnabled: true,
    defaultSort: { column: "created_at", ascending: false },
    fields: [
        field("title", "Deal Title", { type: "string", required: true, example: "Q1 Brand Activation", description: "Deal title" }),
        field("company", "Company", { type: "string", required: true, example: "Acme Corp", description: "Company name" }),
        field("contact_name", "Contact Name", { type: "string", required: true, example: "Jane Smith", description: "Primary contact" }),
        field("contact_email", "Contact Email", { type: "email", required: true, example: "jane@acme.com", description: "Contact email" }),
        field("value", "Deal Value", { type: "number", example: "50000", description: "Monetary value" }),
        field("stage", "Stage", { type: "enum", enumValues: ["lead", "qualified", "proposal", "negotiation", "won", "lost"], example: "proposal", description: "Pipeline stage" }),
        field("probability", "Probability (%)", { type: "number", example: "75", description: "Win probability (0-100)" }),
        field("expected_close_date", "Expected Close Date", { type: "date", required: true, example: "2025-06-30", description: "Target close date (YYYY-MM-DD)" }),
        field("notes", "Notes", { type: "string", example: "Follow up in April", description: "Deal notes" }),
        ID_FIELD, CREATED_AT, UPDATED_AT, ORG_ID,
    ],
};

export const LEADS_TEMPLATE: CsvEntityTemplate = {
    entity: "leads",
    dbTable: "leads",
    displayName: "Leads",
    description: "Sales leads and prospects",
    rbacResource: "leads",
    importEnabled: true,
    exportEnabled: true,
    defaultSort: { column: "created_at", ascending: false },
    fields: [
        field("first_name", "First Name", { type: "string", required: true, example: "John", description: "Contact first name" }),
        field("last_name", "Last Name", { type: "string", example: "Doe", description: "Contact last name" }),
        field("email", "Email", { type: "email", required: true, example: "john@example.com", description: "Contact email" }),
        field("phone", "Phone", { type: "string", example: "+1-555-0200", description: "Contact phone" }),
        field("company", "Company", { type: "string", example: "Riverside Events", description: "Company name" }),
        field("job_title", "Job Title", { type: "string", example: "Event Director", description: "Contact job title" }),
        field("source", "Source", { type: "enum", enumValues: ["website", "referral", "trade_show", "cold_outreach", "social_media", "advertising", "partner", "other"], example: "website", description: "Lead source channel" }),
        field("status", "Status", { type: "enum", enumValues: ["new", "contacted", "qualified", "proposal_sent", "negotiating", "won", "lost", "nurturing"], example: "new", description: "Lead status" }),
        field("description", "Description", { type: "string", example: "Interested in brand activation", description: "Lead description" }),
        field("notes", "Notes", { type: "string", example: "Met at trade show", description: "Notes" }),
        ID_FIELD, CREATED_AT, UPDATED_AT,
    ],
};

export const PROJECTS_TEMPLATE: CsvEntityTemplate = {
    entity: "projects",
    dbTable: "projects",
    displayName: "Projects",
    description: "Production projects",
    rbacResource: "projects",
    importEnabled: true,
    exportEnabled: true,
    defaultSort: { column: "name", ascending: true },
    fields: [
        field("name", "Project Name", { type: "string", required: true, example: "Summer Festival 2025", description: "Project title" }),
        field("client", "Client", { type: "string", required: true, example: "Acme Corp", description: "Client company name" }),
        field("status", "Status", { type: "enum", enumValues: ["draft", "active", "on_hold", "completed", "cancelled"], example: "draft", description: "Project lifecycle status" }),
        field("current_phase", "Phase", { type: "enum", enumValues: ["pre_production", "fabrication", "logistics", "load_in", "show", "strike", "load_out"], example: "pre_production", description: "Production phase" }),
        field("start_date", "Start Date", { type: "date", required: true, example: "2025-06-01", description: "Project start date" }),
        field("end_date", "End Date", { type: "date", required: true, example: "2025-06-30", description: "Project end date" }),
        field("budget_planned", "Budget Planned", { type: "number", example: "150000", description: "Planned budget amount" }),
        ID_FIELD, CREATED_AT, UPDATED_AT, ORG_ID,
    ],
};

export const TASKS_TEMPLATE: CsvEntityTemplate = {
    entity: "tasks",
    dbTable: "tasks",
    displayName: "Tasks",
    description: "Project tasks and action items",
    rbacResource: "tasks",
    importEnabled: true,
    exportEnabled: true,
    defaultSort: { column: "due_date", ascending: true },
    fields: [
        field("title", "Task Title", { type: "string", required: true, example: "Design stage layout", description: "Task name" }),
        field("description", "Description", { type: "string", example: "Create 3D render of main stage", description: "Detailed description" }),
        field("status", "Status", { type: "enum", enumValues: ["backlog", "todo", "in_progress", "review", "done"], example: "todo", description: "Task status" }),
        field("priority", "Priority", { type: "enum", enumValues: ["critical", "high", "medium", "low"], example: "medium", description: "Task priority" }),
        field("due_date", "Due Date", { type: "date", example: "2025-05-15", description: "Due date (YYYY-MM-DD)" }),
        field("start_date", "Start Date", { type: "date", example: "2025-05-01", description: "Start date (YYYY-MM-DD)" }),
        field("project_id", "Project ID", { type: "uuid", example: "uuid-of-project", description: "Parent project ID (UUID)" }),
        field("phase", "Phase", { type: "enum", enumValues: ["pre_production", "fabrication", "logistics", "load_in", "show", "strike", "load_out"], example: "pre_production", description: "Production phase" }),
        ID_FIELD, CREATED_AT, UPDATED_AT,
    ],
};

export const CREW_MEMBERS_TEMPLATE: CsvEntityTemplate = {
    entity: "crew_members",
    dbTable: "crew_members",
    displayName: "Crew Members",
    description: "Workforce and crew personnel",
    rbacResource: "crew",
    importEnabled: true,
    exportEnabled: true,
    defaultSort: { column: "name", ascending: true },
    fields: [
        field("name", "Full Name", { type: "string", required: true, example: "Maria Garcia", description: "Crew member full name" }),
        field("email", "Email", { type: "email", required: true, example: "maria@example.com", description: "Email address" }),
        field("phone", "Phone", { type: "string", required: true, example: "+1-555-0300", description: "Phone number" }),
        field("role", "Role", { type: "string", required: true, example: "Lighting Technician", description: "Job role or title" }),
        field("hourly_rate", "Hourly Rate", { type: "number", example: "45", description: "Hourly pay rate" }),
        field("status", "Status", { type: "enum", enumValues: ["available", "assigned", "unavailable"], example: "available", description: "Availability status" }),
        ID_FIELD, CREATED_AT, UPDATED_AT, ORG_ID,
    ],
};

export const VENDORS_TEMPLATE: CsvEntityTemplate = {
    entity: "vendors",
    dbTable: "vendors",
    displayName: "Vendors",
    description: "Supplier and vendor companies",
    rbacResource: "vendors",
    importEnabled: true,
    exportEnabled: true,
    defaultSort: { column: "name", ascending: true },
    fields: [
        field("name", "Vendor Name", { type: "string", required: true, example: "Soundwave Audio", description: "Vendor company name" }),
        field("contact_name", "Contact Name", { type: "string", required: true, example: "John Smith", description: "Primary contact person" }),
        field("email", "Email", { type: "email", required: true, example: "info@soundwave.com", description: "Primary email" }),
        field("phone", "Phone", { type: "string", required: true, example: "+1-555-0400", description: "Phone number" }),
        field("specialty", "Specialty", { type: "string", required: true, example: "Audio/Visual", description: "Vendor specialty" }),
        field("status", "Status", { type: "enum", enumValues: ["active", "suspended", "pending"], example: "active", description: "Vendor status" }),
        field("rating", "Rating", { type: "number", example: "4.5", description: "Rating (0-5)" }),
        ID_FIELD, CREATED_AT, UPDATED_AT, ORG_ID,
    ],
};

export const ASSETS_TEMPLATE: CsvEntityTemplate = {
    entity: "assets",
    dbTable: "assets",
    displayName: "Assets",
    description: "Physical assets and equipment inventory",
    rbacResource: "assets",
    importEnabled: true,
    exportEnabled: true,
    defaultSort: { column: "name", ascending: true },
    fields: [
        field("name", "Asset Name", { type: "string", required: true, example: "LED Video Wall 10x6", description: "Asset name" }),
        field("category", "Category", { type: "string", required: true, example: "video", description: "Asset category" }),
        field("barcode", "Barcode", { type: "string", required: true, example: "AST-2025-00123", description: "Asset barcode identifier" }),
        field("condition", "Condition", { type: "enum", enumValues: ["excellent", "good", "fair", "needs_repair", "decommissioned"], example: "good", description: "Physical condition" }),
        field("location", "Location", { type: "string", required: true, example: "Warehouse A, Bay 12", description: "Current location" }),
        field("owned_or_rental", "Ownership", { type: "enum", enumValues: ["owned", "rental"], example: "owned", description: "Owned or rental" }),
        field("purchase_price", "Purchase Price", { type: "number", example: "12500", description: "Original purchase price" }),
        field("daily_rental_cost", "Daily Rental Cost", { type: "number", example: "150", description: "Daily rental cost if applicable" }),
        field("notes", "Notes", { type: "string", example: "Annual calibration due March", description: "Notes" }),
        ID_FIELD, CREATED_AT, UPDATED_AT, ORG_ID,
    ],
};

export const INVOICES_TEMPLATE: CsvEntityTemplate = {
    entity: "invoices",
    dbTable: "invoices",
    displayName: "Invoices",
    description: "Vendor invoices",
    rbacResource: "invoices",
    importEnabled: true,
    exportEnabled: true,
    defaultSort: { column: "created_at", ascending: false },
    fields: [
        field("vendor_id", "Vendor ID", { type: "uuid", required: true, example: "uuid-of-vendor", description: "Vendor UUID" }),
        field("amount", "Amount", { type: "number", required: true, example: "15000", description: "Invoice amount" }),
        field("status", "Status", { type: "enum", enumValues: ["pending", "approved", "paid", "disputed"], example: "pending", description: "Invoice status" }),
        field("invoice_date", "Invoice Date", { type: "date", required: true, example: "2025-04-01", description: "Date of invoice" }),
        field("due_date", "Due Date", { type: "date", required: true, example: "2025-05-01", description: "Payment due date" }),
        field("purchase_order_id", "Purchase Order ID", { type: "uuid", example: "uuid-of-po", description: "Associated PO UUID" }),
        ID_FIELD, CREATED_AT, UPDATED_AT, ORG_ID,
    ],
};

export const EXPENSES_TEMPLATE: CsvEntityTemplate = {
    entity: "expenses",
    dbTable: "expenses",
    displayName: "Expenses",
    description: "Expense records and receipts",
    rbacResource: "expenses",
    importEnabled: true,
    exportEnabled: true,
    defaultSort: { column: "created_at", ascending: false },
    fields: [
        field("description", "Description", { type: "string", required: true, example: "Venue rental deposit", description: "Expense description" }),
        field("amount", "Amount", { type: "number", required: true, example: "5000", description: "Expense amount" }),
        field("category", "Category", { type: "enum", enumValues: ["materials", "labor", "travel", "equipment_rental", "shipping", "permits", "catering", "misc"], required: true, example: "materials", description: "Expense category" }),
        field("status", "Status", { type: "enum", enumValues: ["pending", "approved", "rejected", "reimbursed"], example: "pending", description: "Approval status" }),
        field("project_id", "Project ID", { type: "uuid", example: "uuid-of-project", description: "Related project" }),
        field("receipt_url", "Receipt URL", { type: "url", example: "https://storage.example.com/receipt.pdf", description: "Receipt file URL" }),
        ID_FIELD, CREATED_AT, UPDATED_AT, ORG_ID,
    ],
};

export const CONTRACTS_TEMPLATE: CsvEntityTemplate = {
    entity: "contracts",
    dbTable: "contracts",
    displayName: "Contracts",
    description: "Legal contracts and agreements",
    rbacResource: "contracts",
    importEnabled: true,
    exportEnabled: true,
    defaultSort: { column: "effective_date", ascending: false },
    fields: [
        field("title", "Contract Title", { type: "string", required: true, example: "Venue Rental Agreement", description: "Contract name" }),
        field("number", "Contract Number", { type: "string", required: true, example: "CTR-2025-001", description: "Contract reference number" }),
        field("type", "Type", { type: "enum", enumValues: ["vendor", "client", "venue", "talent", "sponsor", "nda", "other"], example: "vendor", description: "Contract type" }),
        field("status", "Status", { type: "enum", enumValues: ["draft", "pending_review", "pending_signature", "active", "expired", "terminated"], example: "active", description: "Contract status" }),
        field("counterparty_name", "Counterparty", { type: "string", required: true, example: "City Events LLC", description: "Other party name" }),
        field("effective_date", "Effective Date", { type: "date", required: true, example: "2025-01-01", description: "Effective start date" }),
        field("expiration_date", "Expiration Date", { type: "date", required: true, example: "2025-12-31", description: "Expiration date" }),
        field("value", "Contract Value", { type: "number", example: "75000", description: "Total contract value" }),
        field("description", "Description", { type: "string", example: "AV equipment rental for summer events", description: "Contract description" }),
        ID_FIELD, CREATED_AT, UPDATED_AT, ORG_ID,
    ],
};

export const LOCATIONS_TEMPLATE: CsvEntityTemplate = {
    entity: "locations",
    dbTable: "locations",
    displayName: "Locations",
    description: "Venues, warehouses, and work locations",
    rbacResource: "locations",
    importEnabled: true,
    exportEnabled: true,
    defaultSort: { column: "name", ascending: true },
    fields: [
        field("name", "Location Name", { type: "string", required: true, example: "Convention Center Hall A", description: "Location name" }),
        field("type", "Type", { type: "enum", enumValues: ["venue", "warehouse", "office", "fabrication_shop", "staging_area", "hotel", "airport", "other"], example: "venue", description: "Location type" }),
        field("description", "Description", { type: "string", example: "Main exhibit hall", description: "Location description" }),
        field("address_street1", "Street Address", { type: "string", example: "1000 Event Drive", description: "Street address" }),
        field("address_city", "City", { type: "string", example: "Las Vegas", description: "City" }),
        field("address_state", "State", { type: "string", example: "NV", description: "State/province" }),
        field("address_postal_code", "Postal Code", { type: "string", example: "89109", description: "Postal code" }),
        field("address_country", "Country", { type: "string", example: "USA", description: "Country code" }),
        field("capacity", "Capacity", { type: "number", example: "5000", description: "Maximum capacity" }),
        field("contact_name", "Contact Name", { type: "string", example: "Venue Manager", description: "On-site contact" }),
        field("contact_phone", "Contact Phone", { type: "string", example: "+1-555-0500", description: "Contact phone" }),
        field("contact_email", "Contact Email", { type: "email", example: "manager@venue.com", description: "Contact email" }),
        ID_FIELD, CREATED_AT, UPDATED_AT, ORG_ID,
    ],
};

// ═══════════════════════════════════════════════════════════════
// TIER 2 — Operational Entities (Import + Export)
// ═══════════════════════════════════════════════════════════════

export const EVENTS_TEMPLATE: CsvEntityTemplate = {
    entity: "events",
    dbTable: "events",
    displayName: "Events",
    description: "Live events and productions",
    rbacResource: "events",
    importEnabled: true,
    exportEnabled: true,
    defaultSort: { column: "date", ascending: false },
    fields: [
        field("name", "Event Name", { type: "string", required: true, example: "Summer Music Fest 2025", description: "Event title" }),
        field("type", "Type", { type: "enum", enumValues: ["show", "rehearsal", "setup", "strike", "meeting", "walkthrough", "training", "press", "vip"], example: "show", description: "Event type" }),
        field("status", "Status", { type: "enum", enumValues: ["scheduled", "confirmed", "in_progress", "completed", "cancelled", "postponed"], example: "scheduled", description: "Event status" }),
        field("date", "Date", { type: "date", required: true, example: "2025-07-01", description: "Event date (YYYY-MM-DD)" }),
        field("start_time", "Start Time", { type: "string", required: true, example: "18:00", description: "Start time (HH:MM)" }),
        field("end_time", "End Time", { type: "string", required: true, example: "23:00", description: "End time (HH:MM)" }),
        field("project_id", "Project ID", { type: "uuid", required: true, example: "uuid-of-project", description: "Parent project UUID" }),
        field("attendee_count", "Attendee Count", { type: "number", example: "10000", description: "Anticipated headcount" }),
        field("description", "Description", { type: "string", example: "3-day multi-stage event", description: "Event description" }),
        field("budget", "Budget", { type: "number", example: "50000", description: "Event budget" }),
        ID_FIELD, CREATED_AT, UPDATED_AT, ORG_ID,
    ],
};

export const ACTIVATIONS_TEMPLATE: CsvEntityTemplate = {
    entity: "activations",
    dbTable: "activations",
    displayName: "Activations",
    description: "Brand activations and experiential activities",
    rbacResource: "activations",
    importEnabled: true,
    exportEnabled: true,
    defaultSort: { column: "install_date", ascending: false },
    fields: [
        field("name", "Activation Name", { type: "string", required: true, example: "VIP Lounge Experience", description: "Activation title" }),
        field("type", "Type", { type: "enum", enumValues: ["booth", "stage", "installation", "pop_up", "mobile", "digital", "hybrid"], example: "booth", description: "Activation type" }),
        field("status", "Status", { type: "enum", enumValues: ["planning", "design", "build", "installed", "active", "struck", "stored"], example: "planning", description: "Status" }),
        field("project_id", "Project ID", { type: "uuid", required: true, example: "uuid-of-project", description: "Parent project UUID" }),
        field("install_date", "Install Date", { type: "date", example: "2025-07-01", description: "Installation date" }),
        field("strike_date", "Strike Date", { type: "date", example: "2025-07-03", description: "Strike/teardown date" }),
        field("budget", "Budget", { type: "number", example: "25000", description: "Activation budget" }),
        field("description", "Description", { type: "string", example: "Requires power drop", description: "Description" }),
        ID_FIELD, CREATED_AT, UPDATED_AT, ORG_ID,
    ],
};

export const BUDGETS_TEMPLATE: CsvEntityTemplate = {
    entity: "budgets",
    dbTable: "budgets",
    displayName: "Budgets",
    description: "Project and event budgets",
    rbacResource: "budgets",
    importEnabled: true,
    exportEnabled: true,
    defaultSort: { column: "effective_date", ascending: false },
    fields: [
        field("project_id", "Project ID", { type: "uuid", required: true, example: "uuid-of-project", description: "Parent project UUID" }),
        field("version", "Version", { type: "number", example: "1", description: "Budget version number" }),
        field("total_budget", "Total Budget", { type: "number", required: true, example: "200000", description: "Total budget amount" }),
        field("status", "Status", { type: "enum", enumValues: ["draft", "pending_approval", "approved", "locked"], example: "draft", description: "Budget status" }),
        field("effective_date", "Effective Date", { type: "date", required: true, example: "2025-01-01", description: "Budget effective date" }),
        field("currency", "Currency", { type: "string", example: "USD", description: "Currency code" }),
        field("notes", "Notes", { type: "string", example: "Approved by CFO", description: "Notes" }),
        ID_FIELD, CREATED_AT, UPDATED_AT, ORG_ID,
    ],
};

export const CAMPAIGNS_TEMPLATE: CsvEntityTemplate = {
    entity: "campaigns",
    dbTable: "campaigns",
    displayName: "Campaigns",
    description: "Marketing and brand campaigns",
    rbacResource: "campaigns",
    importEnabled: true,
    exportEnabled: true,
    defaultSort: { column: "start_date", ascending: false },
    fields: [
        field("name", "Campaign Name", { type: "string", required: true, example: "Holiday Brand Push", description: "Campaign title" }),
        field("status", "Status", { type: "enum", enumValues: ["planning", "brief_approved", "in_production", "review", "approved", "launching", "live", "optimizing", "completed", "archived"], example: "planning", description: "Campaign status" }),
        field("description", "Description", { type: "string", example: "Multi-channel holiday campaign", description: "Campaign description" }),
        field("objective", "Objective", { type: "string", example: "Increase brand awareness", description: "Campaign objective" }),
        field("target_audience", "Target Audience", { type: "string", example: "18-35 urban professionals", description: "Target demographic" }),
        field("start_date", "Start Date", { type: "date", example: "2025-11-01", description: "Launch date" }),
        field("end_date", "End Date", { type: "date", example: "2025-12-31", description: "End date" }),
        field("total_budget", "Budget", { type: "number", example: "50000", description: "Campaign budget" }),
        ID_FIELD, CREATED_AT, UPDATED_AT, ORG_ID,
    ],
};

export const ESTIMATES_TEMPLATE: CsvEntityTemplate = {
    entity: "estimates",
    dbTable: "estimates",
    displayName: "Estimates",
    description: "Project cost estimates and quotes",
    rbacResource: "estimates",
    importEnabled: true,
    exportEnabled: true,
    defaultSort: { column: "created_at", ascending: false },
    fields: [
        field("title", "Estimate Title", { type: "string", required: true, example: "Stage Build Estimate", description: "Estimate name" }),
        field("number", "Estimate Number", { type: "string", required: true, example: "EST-2025-001", description: "Reference number" }),
        field("status", "Status", { type: "enum", enumValues: ["draft", "sent", "viewed", "accepted", "rejected", "expired", "converted"], example: "draft", description: "Estimate status" }),
        field("total", "Total Amount", { type: "number", example: "35000", description: "Total estimated cost" }),
        field("subtotal", "Subtotal", { type: "number", example: "32000", description: "Subtotal before tax/discount" }),
        field("valid_until", "Valid Until", { type: "date", example: "2025-04-30", description: "Expiry date" }),
        field("company_id", "Company ID", { type: "uuid", example: "uuid-of-company", description: "Client company UUID" }),
        field("description", "Description", { type: "string", example: "Includes materials and labor", description: "Estimate description" }),
        ID_FIELD, CREATED_AT, UPDATED_AT, ORG_ID,
    ],
};

export const OPPORTUNITIES_TEMPLATE: CsvEntityTemplate = {
    entity: "opportunities",
    dbTable: "opportunities",
    displayName: "Opportunities",
    description: "Sales opportunities",
    rbacResource: "opportunities",
    importEnabled: true,
    exportEnabled: true,
    defaultSort: { column: "created_at", ascending: false },
    fields: [
        field("name", "Opportunity Name", { type: "string", required: true, example: "Enterprise Event Package", description: "Opportunity title" }),
        field("company_id", "Company ID", { type: "uuid", required: true, example: "uuid-of-company", description: "Account company UUID" }),
        field("type", "Type", { type: "enum", enumValues: ["new_business", "expansion", "renewal", "upsell"], example: "new_business", description: "Opportunity type" }),
        field("stage", "Stage", { type: "enum", enumValues: ["discovery", "qualification", "proposal_sent", "proposal_review", "negotiation", "contract_sent", "won", "lost", "on_hold"], example: "discovery", description: "Pipeline stage" }),
        field("value", "Value", { type: "number", example: "100000", description: "Opportunity value" }),
        field("probability", "Probability (%)", { type: "number", example: "60", description: "Win probability (0-100)" }),
        field("expected_close_date", "Expected Close Date", { type: "date", example: "2025-09-30", description: "Target close date" }),
        field("description", "Description", { type: "string", example: "Large enterprise deal", description: "Description" }),
        ID_FIELD, CREATED_AT, UPDATED_AT, ORG_ID,
    ],
};

export const CHANGE_ORDERS_TEMPLATE: CsvEntityTemplate = {
    entity: "change_orders",
    dbTable: "change_orders",
    displayName: "Change Orders",
    description: "Project change requests and orders",
    rbacResource: "change_orders",
    importEnabled: true,
    exportEnabled: true,
    defaultSort: { column: "created_at", ascending: false },
    fields: [
        field("title", "Title", { type: "string", required: true, example: "Add second stage", description: "Change order title" }),
        field("number", "CO Number", { type: "string", required: true, example: "CO-2025-001", description: "Change order number" }),
        field("project_id", "Project ID", { type: "uuid", required: true, example: "uuid-of-project", description: "Parent project UUID" }),
        field("company_id", "Company ID", { type: "uuid", required: true, example: "uuid-of-company", description: "Client company UUID" }),
        field("change_type", "Change Type", { type: "enum", enumValues: ["scope_addition", "scope_reduction", "timeline_change", "cost_adjustment", "combined"], example: "scope_addition", description: "Type of change" }),
        field("status", "Status", { type: "enum", enumValues: ["draft", "pending_review", "pending_client", "approved", "rejected", "void"], example: "draft", description: "Status" }),
        field("description", "Description", { type: "string", example: "Client requests additional B-stage", description: "Detailed description" }),
        field("value_impact", "Cost Impact", { type: "number", example: "15000", description: "Budget impact amount" }),
        field("schedule_impact_days", "Schedule Impact (Days)", { type: "number", example: "5", description: "Schedule impact in days" }),
        field("reason", "Reason", { type: "string", example: "Client scope expansion", description: "Reason for change" }),
        field("notes", "Notes", { type: "string", example: "Approved by PM", description: "Notes" }),
        ID_FIELD, CREATED_AT, UPDATED_AT, ORG_ID,
    ],
};

export const PURCHASE_ORDERS_TEMPLATE: CsvEntityTemplate = {
    entity: "purchase_orders",
    dbTable: "purchase_orders",
    displayName: "Purchase Orders",
    description: "Vendor purchase orders",
    rbacResource: "purchase_orders",
    importEnabled: true,
    exportEnabled: true,
    defaultSort: { column: "created_at", ascending: false },
    fields: [
        field("project_id", "Project ID", { type: "uuid", required: true, example: "uuid-of-project", description: "Parent project UUID" }),
        field("vendor_id", "Vendor ID", { type: "uuid", required: true, example: "uuid-of-vendor", description: "Vendor UUID" }),
        field("total_amount", "Total Amount", { type: "number", example: "8500", description: "Total PO value" }),
        field("status", "Status", { type: "enum", enumValues: ["draft", "issued", "received", "matched", "disputed"], example: "draft", description: "PO status" }),
        field("issued_date", "Issued Date", { type: "date", required: true, example: "2025-03-01", description: "Date issued" }),
        ID_FIELD, CREATED_AT, UPDATED_AT, ORG_ID,
    ],
};

export const CERTIFICATIONS_TEMPLATE: CsvEntityTemplate = {
    entity: "certifications",
    dbTable: "certifications",
    displayName: "Certifications",
    description: "Crew certifications and qualifications",
    rbacResource: "certifications",
    importEnabled: true,
    exportEnabled: true,
    defaultSort: { column: "expiry_date", ascending: true },
    fields: [
        field("crew_member_id", "Crew Member ID", { type: "uuid", required: true, example: "uuid-of-crew-member", description: "Crew member UUID" }),
        field("type", "Type", { type: "enum", enumValues: ["osha_10", "osha_30", "forklift", "rigging", "electrical", "union_card", "first_aid"], required: true, example: "osha_30", description: "Certification type" }),
        field("label", "Label", { type: "string", required: true, example: "OSHA 30-Hour Construction", description: "Certification display name" }),
        field("issued_date", "Issue Date", { type: "date", required: true, example: "2024-06-15", description: "Date issued" }),
        field("expiry_date", "Expiry Date", { type: "date", required: true, example: "2026-06-15", description: "Expiration date" }),
        field("document_url", "Document URL", { type: "url", example: "https://storage.example.com/cert.pdf", description: "Certificate document URL" }),
        ID_FIELD, CREATED_AT,
    ],
};

export const SHIPMENTS_TEMPLATE: CsvEntityTemplate = {
    entity: "shipments",
    dbTable: "shipments",
    displayName: "Shipments",
    description: "Asset and equipment shipments",
    rbacResource: "shipments",
    importEnabled: true,
    exportEnabled: true,
    defaultSort: { column: "pickup_date", ascending: false },
    fields: [
        field("number", "Shipment Number", { type: "string", required: true, example: "SHP-2025-001", description: "Unique shipment number" }),
        field("project_id", "Project ID", { type: "uuid", required: true, example: "uuid-of-project", description: "Parent project UUID" }),
        field("type", "Type", { type: "enum", enumValues: ["outbound", "inbound", "transfer", "return"], example: "outbound", description: "Shipment type" }),
        field("carrier_name", "Carrier", { type: "string", required: true, example: "UPS Freight", description: "Shipping carrier name" }),
        field("status", "Status", { type: "enum", enumValues: ["planning", "booked", "picked_up", "in_transit", "out_for_delivery", "delivered", "exception", "cancelled"], example: "planning", description: "Shipment status" }),
        field("priority", "Priority", { type: "enum", enumValues: ["standard", "expedited", "rush", "hot"], example: "standard", description: "Shipment priority" }),
        field("pickup_date", "Pickup Date", { type: "date", required: true, example: "2025-03-10", description: "Pickup date" }),
        field("estimated_delivery_date", "Est. Delivery Date", { type: "date", required: true, example: "2025-03-15", description: "Expected delivery date" }),
        field("tracking_number", "Tracking Number", { type: "string", example: "1Z999AA10123456784", description: "Carrier tracking number" }),
        field("total_weight", "Total Weight", { type: "number", example: "250", description: "Total weight" }),
        field("description", "Description", { type: "string", example: "Fragile - LED panels", description: "Shipment description" }),
        field("cost", "Cost", { type: "number", example: "1500", description: "Shipment cost" }),
        ID_FIELD, CREATED_AT, UPDATED_AT, ORG_ID,
    ],
};

// ═══════════════════════════════════════════════════════════════
// TIER 3 — Export Only
// ═══════════════════════════════════════════════════════════════

export const APPROVALS_TEMPLATE: CsvEntityTemplate = {
    entity: "approvals",
    dbTable: "approvals",
    displayName: "Approvals",
    description: "Approval requests and decisions",
    rbacResource: "approvals",
    importEnabled: false,
    exportEnabled: true,
    defaultSort: { column: "created_at", ascending: false },
    fields: [
        field("project_id", "Project ID", { type: "uuid", required: true, example: "uuid-of-project", description: "Project UUID" }),
        field("milestone_id", "Milestone ID", { type: "string", required: true, example: "MS-001", description: "Milestone identifier" }),
        field("milestone_name", "Milestone Name", { type: "string", required: true, example: "Design Review", description: "Milestone display name" }),
        field("status", "Status", { type: "enum", enumValues: ["pending", "approved", "revision_requested", "overdue"], example: "pending", description: "Decision status" }),
        field("approver_id", "Approver ID", { type: "uuid", required: true, example: "uuid-of-approver", description: "Approver profile UUID" }),
        field("deadline", "Deadline", { type: "date", example: "2025-03-15T00:00:00Z", description: "Approval deadline" }),
        field("approved_at", "Approved At", { type: "date", example: "2025-03-05T14:30:00Z", description: "Date of approval" }),
        field("deliverable_url", "Deliverable URL", { type: "url", example: "https://storage.example.com/deliverable.pdf", description: "Deliverable link" }),
        ID_FIELD, CREATED_AT, UPDATED_AT, ORG_ID,
    ],
};

export const TIME_ENTRIES_TEMPLATE: CsvEntityTemplate = {
    entity: "time_entries",
    dbTable: "time_entries",
    displayName: "Time Entries",
    description: "Time tracking records",
    rbacResource: "time_entries",
    importEnabled: false,
    exportEnabled: true,
    defaultSort: { column: "date", ascending: false },
    fields: [
        field("date", "Date", { type: "date", required: true, example: "2025-03-01", description: "Work date" }),
        field("crew_member_id", "Crew Member ID", { type: "uuid", example: "uuid-of-crew-member", description: "Crew member UUID" }),
        field("project_id", "Project ID", { type: "uuid", example: "uuid-of-project", description: "Project UUID" }),
        field("hours_worked", "Hours Worked", { type: "number", required: true, example: "8", description: "Hours worked" }),
        field("hourly_rate", "Hourly Rate", { type: "number", required: true, example: "45", description: "Hourly rate" }),
        field("notes", "Notes", { type: "string", example: "Stage build", description: "Work notes" }),
        field("status", "Status", { type: "enum", enumValues: ["pending", "approved", "rejected"], example: "pending", description: "Status" }),
        ID_FIELD, CREATED_AT, UPDATED_AT, ORG_ID,
    ],
};

export const INCIDENTS_TEMPLATE: CsvEntityTemplate = {
    entity: "incidents",
    dbTable: "incidents",
    displayName: "Incidents",
    description: "Safety and operational incidents",
    rbacResource: "incidents",
    importEnabled: false,
    exportEnabled: true,
    defaultSort: { column: "reported_at", ascending: false },
    fields: [
        field("title", "Title", { type: "string", required: true, example: "Equipment malfunction", description: "Incident title" }),
        field("project_id", "Project ID", { type: "uuid", required: true, example: "uuid-of-project", description: "Project UUID" }),
        field("severity", "Severity", { type: "enum", enumValues: ["minor", "moderate", "serious", "critical"], example: "moderate", description: "Severity level" }),
        field("status", "Status", { type: "enum", enumValues: ["reported", "investigating", "mitigated", "resolved", "closed"], example: "reported", description: "Status" }),
        field("reported_at", "Reported At", { type: "date", required: true, example: "2025-03-01T14:30:00Z", description: "Report timestamp" }),
        field("location", "Location", { type: "string", example: "Main stage, Bay 3", description: "Incident location" }),
        field("description", "Description", { type: "string", example: "LED panel failure during load-in", description: "Detailed description" }),
        field("corrective_action", "Corrective Action", { type: "string", example: "Replacement ordered, crew briefed", description: "Action taken" }),
        ID_FIELD, CREATED_AT, UPDATED_AT, ORG_ID,
    ],
};

// ═══════════════════════════════════════════════════════════════
// REGISTRY — All templates indexed by entity name
// ═══════════════════════════════════════════════════════════════

export const CSV_ENTITY_TEMPLATES: Record<string, CsvEntityTemplate> = {
    // Tier 1
    companies: COMPANIES_TEMPLATE,
    deals: DEALS_TEMPLATE,
    leads: LEADS_TEMPLATE,
    projects: PROJECTS_TEMPLATE,
    tasks: TASKS_TEMPLATE,
    crew_members: CREW_MEMBERS_TEMPLATE,
    vendors: VENDORS_TEMPLATE,
    assets: ASSETS_TEMPLATE,
    invoices: INVOICES_TEMPLATE,
    expenses: EXPENSES_TEMPLATE,
    contracts: CONTRACTS_TEMPLATE,
    locations: LOCATIONS_TEMPLATE,
    // Tier 2
    events: EVENTS_TEMPLATE,
    activations: ACTIVATIONS_TEMPLATE,
    budgets: BUDGETS_TEMPLATE,
    campaigns: CAMPAIGNS_TEMPLATE,
    estimates: ESTIMATES_TEMPLATE,
    opportunities: OPPORTUNITIES_TEMPLATE,
    change_orders: CHANGE_ORDERS_TEMPLATE,
    purchase_orders: PURCHASE_ORDERS_TEMPLATE,
    certifications: CERTIFICATIONS_TEMPLATE,
    shipments: SHIPMENTS_TEMPLATE,
    // Tier 3 (export only)
    approvals: APPROVALS_TEMPLATE,
    time_entries: TIME_ENTRIES_TEMPLATE,
    incidents: INCIDENTS_TEMPLATE,
};

/**
 * Get a template by entity name (case-insensitive, accepts hyphens or underscores).
 */
export function getEntityTemplate(entity: string): CsvEntityTemplate | undefined {
    const normalized = entity.toLowerCase().replace(/-/g, "_");
    return CSV_ENTITY_TEMPLATES[normalized];
}

/**
 * Get all importable entity templates.
 */
export function getImportableEntities(): CsvEntityTemplate[] {
    return Object.values(CSV_ENTITY_TEMPLATES).filter((t) => t.importEnabled);
}

/**
 * Get all exportable entity templates.
 */
export function getExportableEntities(): CsvEntityTemplate[] {
    return Object.values(CSV_ENTITY_TEMPLATES).filter((t) => t.exportEnabled);
}

/**
 * Get importable fields for a template (excludes system-generated fields).
 */
export function getImportableFields(template: CsvEntityTemplate): CsvFieldDef[] {
    return template.fields.filter((f) => f.importable);
}

/**
 * Get exportable fields for a template.
 */
export function getExportableFields(template: CsvEntityTemplate): CsvFieldDef[] {
    return template.fields.filter((f) => f.exportable);
}
