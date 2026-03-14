/* ═══════════════════════════════════════════════════════════════
   CSV TEMPLATE OVERRIDES — Human-authored polish for dynamic templates

   This file preserves all curated descriptions, examples, headers,
   enum values, and import/export flags that were previously hardcoded
   in the static template definitions.

   When the dynamic generator builds a CsvEntityTemplate from
   EntityConfig + Zod schema, it merges these overrides so the
   resulting templates retain their human polish.

   KEY CONVENTION: Override keys use the DB *table* name (plural
   snake_case), matching the `entity` / `dbTable` fields on
   CsvEntityTemplate and the keys in ENTITY_CONFIGS.
   ═══════════════════════════════════════════════════════════════ */

import type { TemplateOverride } from "./csv-template-generator";

// ═══════════════════════════════════════════════════════════════
// TIER 1 — Core Business Entities
// ═══════════════════════════════════════════════════════════════

const COMPANIES_OVERRIDE: TemplateOverride = {
    description: "Client and partner companies",
    defaultSort: { column: "name", ascending: true },
    fields: {
        name: {
            csvHeader: "Company Name",
            required: true,
            example: "Acme Corp",
            description: "Company legal name",
        },
        legal_name: {
            csvHeader: "Legal Name",
            example: "Acme Corporation Inc.",
            description: "Registered legal name",
        },
        industry: { example: "Technology", description: "Industry vertical" },
        website: { type: "url", example: "https://acme.com", description: "Company website URL" },
        phone: { example: "+1-555-0100", description: "Primary phone number" },
        email: { type: "email", example: "info@acme.com", description: "Primary contact email" },
        address_street1: {
            csvHeader: "Street Address",
            example: "123 Main St",
            description: "Street address line 1",
        },
        address_city: { csvHeader: "City", example: "San Francisco", description: "City" },
        address_state: { csvHeader: "State", example: "CA", description: "State or province" },
        address_postal_code: {
            csvHeader: "Postal Code",
            example: "94105",
            description: "ZIP or postal code",
        },
        address_country: { csvHeader: "Country", example: "USA", description: "Country code" },
        company_type: {
            csvHeader: "Company Type",
            type: "enum",
            enumValues: ["client", "brand", "agency", "vendor", "partner"],
            example: "client",
            description: "Relationship type",
        },
        type: {
            csvHeader: "Company Type",
            type: "enum",
            enumValues: ["client", "brand", "agency", "vendor", "partner"],
            example: "client",
            description: "Relationship type",
        },
        status: {
            type: "enum",
            enumValues: ["prospect", "active", "inactive", "churned"],
            example: "active",
            description: "Company status",
        },
        default_currency: {
            csvHeader: "Default Currency",
            example: "USD",
            description: "Default currency code (ISO 4217)",
        },
        tax_id: {
            csvHeader: "Tax ID",
            example: "12-3456789",
            description: "Tax identification number",
        },
        notes: { example: "Key account", description: "Free-text notes" },
    },
};

const DEALS_OVERRIDE: TemplateOverride = {
    description: "Sales pipeline deals and opportunities",
    defaultSort: { column: "created_at", ascending: false },
    fields: {
        title: {
            csvHeader: "Deal Title",
            required: true,
            example: "Q1 Brand Activation",
            description: "Deal title",
        },
        company_name: {
            csvHeader: "Company",
            required: true,
            example: "Acme Corp",
            description: "Company name",
        },
        contact_name: {
            csvHeader: "Contact Name",
            required: true,
            example: "Jane Smith",
            description: "Primary contact",
        },
        contact_email: {
            csvHeader: "Contact Email",
            type: "email",
            required: true,
            example: "jane@acme.com",
            description: "Contact email",
        },
        value: { csvHeader: "Deal Value", example: "50000", description: "Monetary value" },
        stage: {
            type: "enum",
            enumValues: ["lead", "qualified", "proposal", "negotiation", "won", "lost"],
            example: "proposal",
            description: "Pipeline stage",
        },
        probability: {
            csvHeader: "Probability (%)",
            example: "75",
            description: "Win probability (0-100)",
        },
        expected_close_date: {
            csvHeader: "Expected Close Date",
            type: "date",
            required: true,
            example: "2025-06-30",
            description: "Target close date (YYYY-MM-DD)",
        },
        notes: { example: "Follow up in April", description: "Deal notes" },
    },
};

const LEADS_OVERRIDE: TemplateOverride = {
    description: "Sales leads and prospects",
    defaultSort: { column: "created_at", ascending: false },
    fields: {
        first_name: {
            csvHeader: "First Name",
            required: true,
            example: "John",
            description: "Contact first name",
        },
        last_name: { csvHeader: "Last Name", example: "Doe", description: "Contact last name" },
        email: {
            type: "email",
            required: true,
            example: "john@example.com",
            description: "Contact email",
        },
        phone: { example: "+1-555-0200", description: "Contact phone" },
        company: { example: "Riverside Events", description: "Company name" },
        job_title: {
            csvHeader: "Job Title",
            example: "Event Director",
            description: "Contact job title",
        },
        source: {
            type: "enum",
            enumValues: [
                "website",
                "referral",
                "trade_show",
                "cold_outreach",
                "social_media",
                "advertising",
                "partner",
                "other",
            ],
            example: "website",
            description: "Lead source channel",
        },
        status: {
            type: "enum",
            enumValues: [
                "new",
                "contacted",
                "qualified",
                "proposal_sent",
                "negotiating",
                "won",
                "lost",
                "nurturing",
            ],
            example: "new",
            description: "Lead status",
        },
        description: { example: "Interested in brand activation", description: "Lead description" },
        notes: { example: "Met at trade show", description: "Notes" },
    },
};

const PROJECTS_OVERRIDE: TemplateOverride = {
    description: "Production projects",
    defaultSort: { column: "name", ascending: true },
    fields: {
        name: {
            csvHeader: "Project Name",
            required: true,
            example: "Summer Festival 2025",
            description: "Project title",
        },
        client_name: {
            csvHeader: "Client",
            required: true,
            example: "Acme Corp",
            description: "Client company name",
        },
        status: {
            type: "enum",
            enumValues: ["draft", "active", "on_hold", "completed", "cancelled"],
            example: "draft",
            description: "Project lifecycle status",
        },
        phase: {
            type: "enum",
            enumValues: [
                "pre_production",
                "fabrication",
                "logistics",
                "load_in",
                "show",
                "strike",
                "load_out",
            ],
            example: "pre_production",
            description: "Production phase",
        },
        start_date: {
            csvHeader: "Start Date",
            type: "date",
            required: true,
            example: "2025-06-01",
            description: "Project start date",
        },
        end_date: {
            csvHeader: "End Date",
            type: "date",
            required: true,
            example: "2025-06-30",
            description: "Project end date",
        },
        budget_planned: {
            csvHeader: "Budget Planned",
            example: "150000",
            description: "Planned budget amount",
        },
        description: { example: "", description: "Project description" },
    },
};

const TASKS_OVERRIDE: TemplateOverride = {
    description: "Project tasks and action items",
    defaultSort: { column: "due_date", ascending: true },
    fields: {
        title: {
            csvHeader: "Task Title",
            required: true,
            example: "Design stage layout",
            description: "Task name",
        },
        description: {
            example: "Create 3D render of main stage",
            description: "Detailed description",
        },
        status: {
            type: "enum",
            enumValues: ["backlog", "todo", "in_progress", "review", "done"],
            example: "todo",
            description: "Task status",
        },
        priority: {
            type: "enum",
            enumValues: ["critical", "high", "medium", "low"],
            example: "medium",
            description: "Task priority",
        },
        due_date: {
            csvHeader: "Due Date",
            type: "date",
            example: "2025-05-15",
            description: "Due date (YYYY-MM-DD)",
        },
        start_date: {
            csvHeader: "Start Date",
            type: "date",
            example: "2025-05-01",
            description: "Start date (YYYY-MM-DD)",
        },
        project_id: {
            csvHeader: "Project ID",
            type: "uuid",
            example: "uuid-of-project",
            description: "Parent project ID (UUID)",
        },
        phase: {
            type: "enum",
            enumValues: [
                "pre_production",
                "fabrication",
                "logistics",
                "load_in",
                "show",
                "strike",
                "load_out",
            ],
            example: "pre_production",
            description: "Production phase",
        },
        assigned_to: {
            csvHeader: "Assigned To",
            type: "uuid",
            example: "uuid-of-user",
            description: "Assigned user UUID",
        },
    },
};

const CREW_MEMBERS_OVERRIDE: TemplateOverride = {
    description: "Workforce and crew personnel",
    defaultSort: { column: "name", ascending: true },
    fields: {
        name: {
            csvHeader: "Full Name",
            required: true,
            example: "Maria Garcia",
            description: "Crew member full name",
        },
        email: {
            type: "email",
            required: true,
            example: "maria@example.com",
            description: "Email address",
        },
        phone: { required: true, example: "+1-555-0300", description: "Phone number" },
        role: { required: true, example: "Lighting Technician", description: "Job role or title" },
        department: { example: "Production", description: "Department" },
        hourly_rate: { csvHeader: "Hourly Rate", example: "45", description: "Hourly pay rate" },
        day_rate: { csvHeader: "Day Rate", example: "360", description: "Day rate" },
        status: {
            type: "enum",
            enumValues: ["available", "assigned", "unavailable"],
            example: "available",
            description: "Availability status",
        },
    },
};

const VENDORS_OVERRIDE: TemplateOverride = {
    description: "Supplier and vendor companies",
    defaultSort: { column: "name", ascending: true },
    fields: {
        name: {
            csvHeader: "Vendor Name",
            required: true,
            example: "Soundwave Audio",
            description: "Vendor company name",
        },
        contact_name: {
            csvHeader: "Contact Name",
            required: true,
            example: "John Smith",
            description: "Primary contact person",
        },
        contact_email: {
            type: "email",
            required: true,
            example: "info@soundwave.com",
            description: "Primary email",
        },
        contact_phone: { required: true, example: "+1-555-0400", description: "Phone number" },
        category: {
            csvHeader: "Specialty",
            required: true,
            example: "Audio/Visual",
            description: "Vendor specialty",
        },
        status: {
            type: "enum",
            enumValues: ["active", "suspended", "pending"],
            example: "active",
            description: "Vendor status",
        },
        rating: { example: "4.5", description: "Rating (0-5)" },
        notes: { example: "", description: "Notes" },
    },
};

const ASSETS_OVERRIDE: TemplateOverride = {
    description: "Physical assets and equipment inventory",
    defaultSort: { column: "name", ascending: true },
    fields: {
        name: {
            csvHeader: "Asset Name",
            required: true,
            example: "LED Video Wall 10x6",
            description: "Asset name",
        },
        category: { required: true, example: "video", description: "Asset category" },
        barcode: {
            required: true,
            example: "AST-2025-00123",
            description: "Asset barcode identifier",
        },
        condition: {
            type: "enum",
            enumValues: ["excellent", "good", "fair", "needs_repair", "decommissioned"],
            example: "good",
            description: "Physical condition",
        },
        location: {
            required: true,
            example: "Warehouse A, Bay 12",
            description: "Current location",
        },
        owned_or_rental: {
            csvHeader: "Ownership",
            type: "enum",
            enumValues: ["owned", "rental"],
            example: "owned",
            description: "Owned or rental",
        },
        purchase_price: {
            csvHeader: "Purchase Price",
            example: "12500",
            description: "Original purchase price",
        },
        daily_rental_cost: {
            csvHeader: "Daily Rental Cost",
            example: "150",
            description: "Daily rental cost if applicable",
        },
        notes: { example: "Annual calibration due March", description: "Notes" },
    },
};

const INVOICES_OVERRIDE: TemplateOverride = {
    description: "Vendor invoices",
    defaultSort: { column: "created_at", ascending: false },
    fields: {
        invoice_number: {
            csvHeader: "Invoice Number",
            required: true,
            example: "INV-2025-001",
            description: "Invoice reference number",
        },
        vendor_id: {
            csvHeader: "Vendor ID",
            type: "uuid",
            required: true,
            example: "uuid-of-vendor",
            description: "Vendor UUID",
        },
        amount: { required: true, example: "15000", description: "Invoice amount" },
        currency: { example: "USD", description: "Currency code (ISO 4217)" },
        status: {
            type: "enum",
            enumValues: ["pending", "approved", "paid", "disputed"],
            example: "pending",
            description: "Invoice status",
        },
        due_date: {
            csvHeader: "Due Date",
            type: "date",
            required: true,
            example: "2025-05-01",
            description: "Payment due date",
        },
        project_id: {
            csvHeader: "Project ID",
            type: "uuid",
            example: "uuid-of-project",
            description: "Related project UUID",
        },
        purchase_order_id: {
            csvHeader: "Purchase Order ID",
            type: "uuid",
            example: "uuid-of-po",
            description: "Associated PO UUID",
        },
        notes: { example: "", description: "Notes" },
    },
};

const EXPENSES_OVERRIDE: TemplateOverride = {
    description: "Expense records and receipts",
    defaultSort: { column: "created_at", ascending: false },
    fields: {
        description: {
            required: true,
            example: "Venue rental deposit",
            description: "Expense description",
        },
        amount: { required: true, example: "5000", description: "Expense amount" },
        category: {
            type: "enum",
            enumValues: [
                "materials",
                "labor",
                "travel",
                "equipment_rental",
                "shipping",
                "permits",
                "catering",
                "misc",
            ],
            required: true,
            example: "materials",
            description: "Expense category",
        },
        status: {
            type: "enum",
            enumValues: ["pending", "approved", "rejected", "reimbursed"],
            example: "pending",
            description: "Approval status",
        },
        project_id: {
            csvHeader: "Project ID",
            type: "uuid",
            example: "uuid-of-project",
            description: "Related project",
        },
        receipt_url: {
            csvHeader: "Receipt URL",
            type: "url",
            example: "https://storage.example.com/receipt.pdf",
            description: "Receipt file URL",
        },
    },
};

const CONTRACTS_OVERRIDE: TemplateOverride = {
    description: "Legal contracts and agreements",
    defaultSort: { column: "effective_date", ascending: false },
    fields: {
        title: {
            csvHeader: "Contract Title",
            required: true,
            example: "Venue Rental Agreement",
            description: "Contract name",
        },
        contract_number: {
            csvHeader: "Contract Number",
            required: true,
            example: "CTR-2025-001",
            description: "Contract reference number",
        },
        type: {
            type: "enum",
            enumValues: ["vendor", "client", "venue", "talent", "sponsor", "nda", "other"],
            example: "vendor",
            description: "Contract type",
        },
        status: {
            type: "enum",
            enumValues: [
                "draft",
                "pending_review",
                "pending_signature",
                "active",
                "expired",
                "terminated",
            ],
            example: "active",
            description: "Contract status",
        },
        counterparty_name: {
            csvHeader: "Counterparty",
            required: true,
            example: "City Events LLC",
            description: "Other party name",
        },
        effective_date: {
            csvHeader: "Effective Date",
            type: "date",
            required: true,
            example: "2025-01-01",
            description: "Effective start date",
        },
        expiration_date: {
            csvHeader: "Expiration Date",
            type: "date",
            required: true,
            example: "2025-12-31",
            description: "Expiration date",
        },
        value: {
            csvHeader: "Contract Value",
            example: "75000",
            description: "Total contract value",
        },
        description: {
            example: "AV equipment rental for summer events",
            description: "Contract description",
        },
        auto_renew: {
            csvHeader: "Auto Renew",
            example: "false",
            description: "Whether contract auto-renews",
        },
        vendor_id: {
            csvHeader: "Vendor ID",
            type: "uuid",
            example: "uuid-of-vendor",
            description: "Vendor UUID",
        },
        project_id: {
            csvHeader: "Project ID",
            type: "uuid",
            example: "uuid-of-project",
            description: "Project UUID",
        },
        notes: { example: "", description: "Notes" },
    },
};

const LOCATIONS_OVERRIDE: TemplateOverride = {
    description: "Venues, warehouses, and work locations",
    defaultSort: { column: "name", ascending: true },
    fields: {
        name: {
            csvHeader: "Location Name",
            required: true,
            example: "Convention Center Hall A",
            description: "Location name",
        },
        type: {
            type: "enum",
            enumValues: [
                "venue",
                "warehouse",
                "office",
                "fabrication_shop",
                "staging_area",
                "hotel",
                "airport",
                "other",
            ],
            example: "venue",
            description: "Location type",
        },
        description: { example: "Main exhibit hall", description: "Location description" },
        address_street1: {
            csvHeader: "Street Address",
            example: "1000 Event Drive",
            description: "Street address",
        },
        address_city: { csvHeader: "City", example: "Las Vegas", description: "City" },
        address_state: { csvHeader: "State", example: "NV", description: "State/province" },
        address_postal_code: {
            csvHeader: "Postal Code",
            example: "89109",
            description: "Postal code",
        },
        address_country: { csvHeader: "Country", example: "USA", description: "Country code" },
        capacity: { example: "5000", description: "Maximum capacity" },
        contact_name: {
            csvHeader: "Contact Name",
            example: "Venue Manager",
            description: "On-site contact",
        },
        contact_phone: {
            csvHeader: "Contact Phone",
            example: "+1-555-0500",
            description: "Contact phone",
        },
        contact_email: {
            csvHeader: "Contact Email",
            type: "email",
            example: "manager@venue.com",
            description: "Contact email",
        },
    },
};

// ═══════════════════════════════════════════════════════════════
// TIER 2 — Operational Entities
// ═══════════════════════════════════════════════════════════════

const EVENTS_OVERRIDE: TemplateOverride = {
    description: "Live events and productions",
    defaultSort: { column: "date", ascending: false },
    fields: {
        name: {
            csvHeader: "Event Name",
            required: true,
            example: "Summer Music Fest 2025",
            description: "Event title",
        },
        type: {
            type: "enum",
            enumValues: [
                "show",
                "rehearsal",
                "setup",
                "strike",
                "meeting",
                "walkthrough",
                "training",
                "press",
                "vip",
            ],
            example: "show",
            description: "Event type",
        },
        status: {
            type: "enum",
            enumValues: [
                "scheduled",
                "confirmed",
                "in_progress",
                "completed",
                "cancelled",
                "postponed",
            ],
            example: "scheduled",
            description: "Event status",
        },
        date: {
            type: "date",
            required: true,
            example: "2025-07-01",
            description: "Event date (YYYY-MM-DD)",
        },
        start_time: {
            csvHeader: "Start Time",
            required: true,
            example: "18:00",
            description: "Start time (HH:MM)",
        },
        end_time: {
            csvHeader: "End Time",
            required: true,
            example: "23:00",
            description: "End time (HH:MM)",
        },
        project_id: {
            csvHeader: "Project ID",
            type: "uuid",
            required: true,
            example: "uuid-of-project",
            description: "Parent project UUID",
        },
        attendee_count: {
            csvHeader: "Attendee Count",
            example: "10000",
            description: "Anticipated headcount",
        },
        description: { example: "3-day multi-stage event", description: "Event description" },
        budget: { example: "50000", description: "Event budget" },
    },
};

const ACTIVATIONS_OVERRIDE: TemplateOverride = {
    description: "Brand activations and experiential activities",
    defaultSort: { column: "install_date", ascending: false },
    fields: {
        name: {
            csvHeader: "Activation Name",
            required: true,
            example: "VIP Lounge Experience",
            description: "Activation title",
        },
        type: {
            type: "enum",
            enumValues: ["booth", "stage", "installation", "pop_up", "mobile", "digital", "hybrid"],
            example: "booth",
            description: "Activation type",
        },
        status: {
            type: "enum",
            enumValues: ["planning", "design", "build", "installed", "active", "struck", "stored"],
            example: "planning",
            description: "Status",
        },
        project_id: {
            csvHeader: "Project ID",
            type: "uuid",
            required: true,
            example: "uuid-of-project",
            description: "Parent project UUID",
        },
        install_date: {
            csvHeader: "Install Date",
            type: "date",
            example: "2025-07-01",
            description: "Installation date",
        },
        strike_date: {
            csvHeader: "Strike Date",
            type: "date",
            example: "2025-07-03",
            description: "Strike/teardown date",
        },
        budget: { example: "25000", description: "Activation budget" },
        description: { example: "Requires power drop", description: "Description" },
    },
};

const BUDGETS_OVERRIDE: TemplateOverride = {
    description: "Project and event budgets",
    defaultSort: { column: "effective_date", ascending: false },
    fields: {
        name: {
            csvHeader: "Budget Name",
            required: true,
            example: "Main Event Budget",
            description: "Budget name",
        },
        project_id: {
            csvHeader: "Project ID",
            type: "uuid",
            required: true,
            example: "uuid-of-project",
            description: "Parent project UUID",
        },
        total_amount: {
            csvHeader: "Total Budget",
            required: true,
            example: "200000",
            description: "Total budget amount",
        },
        status: {
            type: "enum",
            enumValues: ["draft", "pending_approval", "approved", "locked"],
            example: "draft",
            description: "Budget status",
        },
        currency: { example: "USD", description: "Currency code" },
        notes: { example: "Approved by CFO", description: "Notes" },
    },
};

const CAMPAIGNS_OVERRIDE: TemplateOverride = {
    description: "Marketing and brand campaigns",
    defaultSort: { column: "start_date", ascending: false },
    fields: {
        name: {
            csvHeader: "Campaign Name",
            required: true,
            example: "Holiday Brand Push",
            description: "Campaign title",
        },
        status: {
            type: "enum",
            enumValues: [
                "planning",
                "brief_approved",
                "in_production",
                "review",
                "approved",
                "launching",
                "live",
                "optimizing",
                "completed",
                "archived",
            ],
            example: "planning",
            description: "Campaign status",
        },
        description: {
            example: "Multi-channel holiday campaign",
            description: "Campaign description",
        },
        objective: { example: "Increase brand awareness", description: "Campaign objective" },
        target_audience: {
            csvHeader: "Target Audience",
            example: "18-35 urban professionals",
            description: "Target demographic",
        },
        start_date: {
            csvHeader: "Start Date",
            type: "date",
            example: "2025-11-01",
            description: "Launch date",
        },
        end_date: {
            csvHeader: "End Date",
            type: "date",
            example: "2025-12-31",
            description: "End date",
        },
        total_budget: { csvHeader: "Budget", example: "50000", description: "Campaign budget" },
    },
};

const ESTIMATES_OVERRIDE: TemplateOverride = {
    description: "Project cost estimates and quotes",
    defaultSort: { column: "created_at", ascending: false },
    fields: {
        title: {
            csvHeader: "Estimate Title",
            required: true,
            example: "Stage Build Estimate",
            description: "Estimate name",
        },
        number: {
            csvHeader: "Estimate Number",
            required: true,
            example: "EST-2025-001",
            description: "Reference number",
        },
        status: {
            type: "enum",
            enumValues: ["draft", "sent", "viewed", "accepted", "rejected", "expired", "converted"],
            example: "draft",
            description: "Estimate status",
        },
        total: { csvHeader: "Total Amount", example: "35000", description: "Total estimated cost" },
        subtotal: { example: "32000", description: "Subtotal before tax/discount" },
        valid_until: {
            csvHeader: "Valid Until",
            type: "date",
            example: "2025-04-30",
            description: "Expiry date",
        },
        company_id: {
            csvHeader: "Company ID",
            type: "uuid",
            example: "uuid-of-company",
            description: "Client company UUID",
        },
        description: {
            example: "Includes materials and labor",
            description: "Estimate description",
        },
    },
};

const OPPORTUNITIES_OVERRIDE: TemplateOverride = {
    description: "Sales opportunities",
    defaultSort: { column: "created_at", ascending: false },
    fields: {
        name: {
            csvHeader: "Opportunity Name",
            required: true,
            example: "Enterprise Event Package",
            description: "Opportunity title",
        },
        company_id: {
            csvHeader: "Company ID",
            type: "uuid",
            required: true,
            example: "uuid-of-company",
            description: "Account company UUID",
        },
        type: {
            type: "enum",
            enumValues: ["new_business", "expansion", "renewal", "upsell"],
            example: "new_business",
            description: "Opportunity type",
        },
        stage: {
            type: "enum",
            enumValues: [
                "discovery",
                "qualification",
                "proposal_sent",
                "proposal_review",
                "negotiation",
                "contract_sent",
                "won",
                "lost",
                "on_hold",
            ],
            example: "discovery",
            description: "Pipeline stage",
        },
        value: { example: "100000", description: "Opportunity value" },
        probability: {
            csvHeader: "Probability (%)",
            example: "60",
            description: "Win probability (0-100)",
        },
        expected_close_date: {
            csvHeader: "Expected Close Date",
            type: "date",
            example: "2025-09-30",
            description: "Target close date",
        },
        description: { example: "Large enterprise deal", description: "Description" },
    },
};

const CHANGE_ORDERS_OVERRIDE: TemplateOverride = {
    description: "Project change requests and orders",
    defaultSort: { column: "created_at", ascending: false },
    fields: {
        title: { required: true, example: "Add second stage", description: "Change order title" },
        number: {
            csvHeader: "CO Number",
            required: true,
            example: "CO-2025-001",
            description: "Change order number",
        },
        project_id: {
            csvHeader: "Project ID",
            type: "uuid",
            required: true,
            example: "uuid-of-project",
            description: "Parent project UUID",
        },
        company_id: {
            csvHeader: "Company ID",
            type: "uuid",
            required: true,
            example: "uuid-of-company",
            description: "Client company UUID",
        },
        change_type: {
            csvHeader: "Change Type",
            type: "enum",
            enumValues: [
                "scope_addition",
                "scope_reduction",
                "timeline_change",
                "cost_adjustment",
                "combined",
            ],
            example: "scope_addition",
            description: "Type of change",
        },
        status: {
            type: "enum",
            enumValues: [
                "draft",
                "pending_review",
                "pending_client",
                "approved",
                "rejected",
                "void",
            ],
            example: "draft",
            description: "Status",
        },
        description: {
            example: "Client requests additional B-stage",
            description: "Detailed description",
        },
        value_impact: {
            csvHeader: "Cost Impact",
            example: "15000",
            description: "Budget impact amount",
        },
        schedule_impact_days: {
            csvHeader: "Schedule Impact (Days)",
            example: "5",
            description: "Schedule impact in days",
        },
        reason: { example: "Client scope expansion", description: "Reason for change" },
        notes: { example: "Approved by PM", description: "Notes" },
    },
};

const PURCHASE_ORDERS_OVERRIDE: TemplateOverride = {
    description: "Vendor purchase orders",
    defaultSort: { column: "created_at", ascending: false },
    fields: {
        project_id: {
            csvHeader: "Project ID",
            type: "uuid",
            required: true,
            example: "uuid-of-project",
            description: "Parent project UUID",
        },
        vendor_id: {
            csvHeader: "Vendor ID",
            type: "uuid",
            required: true,
            example: "uuid-of-vendor",
            description: "Vendor UUID",
        },
        total_amount: { csvHeader: "Total Amount", example: "8500", description: "Total PO value" },
        status: {
            type: "enum",
            enumValues: ["draft", "issued", "received", "matched", "disputed"],
            example: "draft",
            description: "PO status",
        },
        issued_date: {
            csvHeader: "Issued Date",
            type: "date",
            required: true,
            example: "2025-03-01",
            description: "Date issued",
        },
    },
};

const CERTIFICATIONS_OVERRIDE: TemplateOverride = {
    description: "Crew certifications and qualifications",
    defaultSort: { column: "expiry_date", ascending: true },
    fields: {
        crew_member_id: {
            csvHeader: "Crew Member ID",
            type: "uuid",
            required: true,
            example: "uuid-of-crew-member",
            description: "Crew member UUID",
        },
        type: {
            type: "enum",
            enumValues: [
                "osha_10",
                "osha_30",
                "forklift",
                "rigging",
                "electrical",
                "union_card",
                "first_aid",
            ],
            required: true,
            example: "osha_30",
            description: "Certification type",
        },
        label: {
            required: true,
            example: "OSHA 30-Hour Construction",
            description: "Certification display name",
        },
        issued_date: {
            csvHeader: "Issue Date",
            type: "date",
            required: true,
            example: "2024-06-15",
            description: "Date issued",
        },
        expiry_date: {
            csvHeader: "Expiry Date",
            type: "date",
            required: true,
            example: "2026-06-15",
            description: "Expiration date",
        },
        document_url: {
            csvHeader: "Document URL",
            type: "url",
            example: "https://storage.example.com/cert.pdf",
            description: "Certificate document URL",
        },
    },
};

const SHIPMENTS_OVERRIDE: TemplateOverride = {
    description: "Asset and equipment shipments",
    defaultSort: { column: "pickup_date", ascending: false },
    fields: {
        number: {
            csvHeader: "Shipment Number",
            required: true,
            example: "SHP-2025-001",
            description: "Unique shipment number",
        },
        project_id: {
            csvHeader: "Project ID",
            type: "uuid",
            required: true,
            example: "uuid-of-project",
            description: "Parent project UUID",
        },
        type: {
            type: "enum",
            enumValues: ["outbound", "inbound", "transfer", "return"],
            example: "outbound",
            description: "Shipment type",
        },
        carrier_name: {
            csvHeader: "Carrier",
            required: true,
            example: "UPS Freight",
            description: "Shipping carrier name",
        },
        status: {
            type: "enum",
            enumValues: [
                "planning",
                "booked",
                "picked_up",
                "in_transit",
                "out_for_delivery",
                "delivered",
                "exception",
                "cancelled",
            ],
            example: "planning",
            description: "Shipment status",
        },
        priority: {
            type: "enum",
            enumValues: ["standard", "expedited", "rush", "hot"],
            example: "standard",
            description: "Shipment priority",
        },
        pickup_date: {
            csvHeader: "Pickup Date",
            type: "date",
            required: true,
            example: "2025-03-10",
            description: "Pickup date",
        },
        estimated_delivery_date: {
            csvHeader: "Est. Delivery Date",
            type: "date",
            required: true,
            example: "2025-03-15",
            description: "Expected delivery date",
        },
        tracking_number: {
            csvHeader: "Tracking Number",
            example: "1Z999AA10123456784",
            description: "Carrier tracking number",
        },
        total_weight: { csvHeader: "Total Weight", example: "250", description: "Total weight" },
        description: { example: "Fragile - LED panels", description: "Shipment description" },
        cost: { example: "1500", description: "Shipment cost" },
    },
};

// ═══════════════════════════════════════════════════════════════
// TIER 3 — Export Only
// ═══════════════════════════════════════════════════════════════

const APPROVALS_OVERRIDE: TemplateOverride = {
    description: "Approval requests and decisions",
    importEnabled: false,
    exportEnabled: true,
    defaultSort: { column: "created_at", ascending: false },
    fields: {
        title: { required: true, example: "Design Review Approval", description: "Approval title" },
        type: {
            type: "enum",
            enumValues: [
                "budget",
                "creative",
                "production",
                "vendor",
                "change_order",
                "milestone",
                "financial",
            ],
            example: "production",
            description: "Approval type",
        },
        project_id: {
            csvHeader: "Project ID",
            type: "uuid",
            required: true,
            example: "uuid-of-project",
            description: "Project UUID",
        },
        requested_by: {
            csvHeader: "Requested By",
            type: "uuid",
            example: "uuid-of-user",
            description: "Requester profile UUID",
        },
        description: { example: "Stage design review needed", description: "Description" },
        priority: {
            type: "enum",
            enumValues: ["low", "medium", "high", "urgent"],
            example: "medium",
            description: "Priority level",
        },
        status: {
            type: "enum",
            enumValues: ["pending", "approved", "rejected", "deferred"],
            example: "pending",
            description: "Decision status",
        },
    },
};

const TIME_ENTRIES_OVERRIDE: TemplateOverride = {
    description: "Time tracking records",
    importEnabled: false,
    exportEnabled: true,
    defaultSort: { column: "date", ascending: false },
    fields: {
        date: { type: "date", required: true, example: "2025-03-01", description: "Work date" },
        crew_member_id: {
            csvHeader: "Crew Member ID",
            type: "uuid",
            example: "uuid-of-crew-member",
            description: "Crew member UUID",
        },
        project_id: {
            csvHeader: "Project ID",
            type: "uuid",
            example: "uuid-of-project",
            description: "Project UUID",
        },
        hours_worked: {
            csvHeader: "Hours Worked",
            required: true,
            example: "8",
            description: "Hours worked",
        },
        hourly_rate: {
            csvHeader: "Hourly Rate",
            required: true,
            example: "45",
            description: "Hourly rate",
        },
        notes: { example: "Stage build", description: "Work notes" },
        status: {
            type: "enum",
            enumValues: ["pending", "approved", "rejected"],
            example: "pending",
            description: "Status",
        },
    },
};

const INCIDENTS_OVERRIDE: TemplateOverride = {
    description: "Safety and operational incidents",
    importEnabled: false,
    exportEnabled: true,
    defaultSort: { column: "reported_at", ascending: false },
    fields: {
        title: { required: true, example: "Equipment malfunction", description: "Incident title" },
        project_id: {
            csvHeader: "Project ID",
            type: "uuid",
            required: true,
            example: "uuid-of-project",
            description: "Project UUID",
        },
        severity: {
            type: "enum",
            enumValues: ["minor", "moderate", "serious", "critical"],
            example: "moderate",
            description: "Severity level",
        },
        status: {
            type: "enum",
            enumValues: ["reported", "investigating", "mitigated", "resolved", "closed"],
            example: "reported",
            description: "Status",
        },
        reported_at: {
            csvHeader: "Reported At",
            type: "date",
            required: true,
            example: "2025-03-01T14:30:00Z",
            description: "Report timestamp",
        },
        location: { example: "Main stage, Bay 3", description: "Incident location" },
        description: {
            example: "LED panel failure during load-in",
            description: "Detailed description",
        },
        corrective_action: {
            csvHeader: "Corrective Action",
            example: "Replacement ordered, crew briefed",
            description: "Action taken",
        },
    },
};

// ═══════════════════════════════════════════════════════════════
// REGISTRY — Keyed by entity config key (singular snake_case)
// ═══════════════════════════════════════════════════════════════

export const CSV_TEMPLATE_OVERRIDES: Record<string, TemplateOverride> = {
    // Tier 1
    company: COMPANIES_OVERRIDE,
    deal: DEALS_OVERRIDE,
    lead: LEADS_OVERRIDE,
    project: PROJECTS_OVERRIDE,
    task: TASKS_OVERRIDE,
    crew_member: CREW_MEMBERS_OVERRIDE,
    vendor: VENDORS_OVERRIDE,
    asset: ASSETS_OVERRIDE,
    invoice: INVOICES_OVERRIDE,
    expense: EXPENSES_OVERRIDE,
    contract: CONTRACTS_OVERRIDE,
    location: LOCATIONS_OVERRIDE,
    // Tier 2
    event: EVENTS_OVERRIDE,
    activation: ACTIVATIONS_OVERRIDE,
    budget: BUDGETS_OVERRIDE,
    campaign: CAMPAIGNS_OVERRIDE,
    estimate: ESTIMATES_OVERRIDE,
    opportunity: OPPORTUNITIES_OVERRIDE,
    change_order: CHANGE_ORDERS_OVERRIDE,
    purchase_order: PURCHASE_ORDERS_OVERRIDE,
    certification: CERTIFICATIONS_OVERRIDE,
    hr_certification: CERTIFICATIONS_OVERRIDE,
    shipment: SHIPMENTS_OVERRIDE,
    // Tier 3 (export only)
    approval: APPROVALS_OVERRIDE,
    time_entry: TIME_ENTRIES_OVERRIDE,
    incident: INCIDENTS_OVERRIDE,
};
