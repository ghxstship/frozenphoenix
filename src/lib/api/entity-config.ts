/* ═══════════════════════════════════════════════════════════════
   ENTITY CONFIG REGISTRY — Central SSOT for all entity metadata
   
   Combines CRUD factory config, state machines, validation schemas,
   and mutation hooks into a single declarative registry per entity.
   
   Usage:
     import { ENTITY_CONFIGS, getEntityConfig } from "@/lib/api/entity-config";
     
     const config = getEntityConfig("project");
     // → { table, resource, displayName, stateMachine, schemas, ... }
   ═══════════════════════════════════════════════════════════════ */

import type { CrudConfig } from "./crud-factory";
import type { StateMachineDefinition } from "@/lib/state-machine";
import type { ZodSchema } from "zod";
import {
    ACTIVATION_MACHINE,
    ASSET_MACHINE,
    CAMPAIGN_MACHINE,
    CHANGE_ORDER_MACHINE,
    CLIENT_INVOICE_MACHINE,
    CONTRACT_MACHINE,
    CREW_SHIFT_MACHINE,
    DEAL_MACHINE,
    DOCUMENT_MACHINE,
    ESTIMATE_MACHINE,
    EXPENSE_MACHINE,
    INCIDENT_MACHINE,
    INVOICE_MACHINE,
    LEAD_MACHINE,
    LIVE_EVENT_MACHINE,
    MILESTONE_MACHINE,
    OPPORTUNITY_MACHINE,
    PAYMENT_MACHINE,
    PERMIT_MACHINE,
    PROJECT_MACHINE,
    PROPOSAL_MACHINE,
    PURCHASE_ORDER_MACHINE,
    READINESS_GATE_MACHINE,
    RENTAL_AGREEMENT_MACHINE,
    RIGHTS_MACHINE,
    ROS_CUE_MACHINE,
    SERVICE_REQUEST_MACHINE,
    SHIPMENT_MACHINE,
    SOW_MACHINE,
    TASK_MACHINE,
    TIME_ENTRY_MACHINE,
    VENDOR_MACHINE,
    WORK_ORDER_MACHINE,
} from "@/lib/state-machines";
import { getSchemasForEntity } from "@/lib/validation/schema-registry";

// ─── Types ───────────────────────────────────────────────────

export interface EntityConfig {
    /** Snake_case entity name (DB table name) */
    entityName: string;
    /** Human-readable display name */
    displayName: string;
    /** Plural display name */
    displayNamePlural: string;
    /** RBAC resource key */
    resource: string;
    /** Supabase table name */
    table: string;
    /** URL slug (kebab-case) */
    slug: string;
    /** API base path */
    basePath: string;
    /** React Query cache key */
    queryKey: string[];
    /** State machine definition (if entity has lifecycle) */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stateMachine?: StateMachineDefinition<any>;
    /** Column that holds status (default: "status") */
    statusColumn: string;
    /** Zod create schema */
    createSchema?: ZodSchema;
    /** Zod update schema */
    updateSchema?: ZodSchema;
    /** Supabase select for list queries */
    selectList: string;
    /** Supabase select for detail queries */
    selectDetail: string;
    /** Searchable columns for ?search= */
    searchColumns: string[];
    /** Soft delete via deleted_at */
    softDelete: boolean;
    /** Track created_by / updated_by */
    trackAuthor: boolean;
    /** Icon name (Lucide) */
    icon: string;
    /** Related entity keys for cache invalidation */
    relatedKeys?: string[][];
}

// ─── Config Definitions ──────────────────────────────────────

function defineEntity(
    partial: Partial<EntityConfig> &
        Pick<
            EntityConfig,
            "entityName" | "displayName" | "displayNamePlural" | "table" | "resource"
        >
): EntityConfig {
    const slug = partial.slug ?? partial.entityName.replace(/_/g, "-");
    const schemas = getSchemasForEntity(partial.entityName);
    return {
        statusColumn: "status",
        selectList: "*",
        selectDetail: "*",
        searchColumns: ["name"],
        softDelete: true,
        trackAuthor: true,
        icon: "FileText",
        basePath: `/api/${slug}`,
        queryKey: [partial.entityName],
        slug,
        createSchema: schemas?.create,
        updateSchema: schemas?.update,
        ...partial,
    };
}

// ─── Registry ────────────────────────────────────────────────

export const ENTITY_CONFIGS: Record<string, EntityConfig> = {
    project: defineEntity({
        entityName: "project",
        displayName: "Project",
        displayNamePlural: "Projects",
        table: "projects",
        resource: "projects",
        slug: "projects",
        stateMachine: PROJECT_MACHINE,
        selectList: "*, profiles:manager_id(name), companies:client_company_id(name)",
        selectDetail:
            "*, profiles:manager_id(name, avatar_url), companies:client_company_id(name), project_members(profile_id, profiles(name, email, avatar_url))",
        searchColumns: ["name", "description"],
        icon: "FolderKanban",
    }),

    task: defineEntity({
        entityName: "task",
        displayName: "Task",
        displayNamePlural: "Tasks",
        table: "tasks",
        resource: "tasks",
        slug: "tasks",
        stateMachine: TASK_MACHINE,
        selectList: "*, projects:project_id(name), profiles:assigned_to(name)",
        selectDetail: "*, projects:project_id(name), profiles:assigned_to(name, avatar_url)",
        searchColumns: ["title", "description"],
        icon: "CheckSquare",
        relatedKeys: [["project"]],
    }),

    deal: defineEntity({
        entityName: "deal",
        displayName: "Deal",
        displayNamePlural: "Deals",
        table: "deals",
        resource: "deals",
        slug: "deals",
        stateMachine: DEAL_MACHINE,
        searchColumns: ["title", "company_name", "contact_name"],
        icon: "Handshake",
    }),

    contract: defineEntity({
        entityName: "contract",
        displayName: "Contract",
        displayNamePlural: "Contracts",
        table: "contracts",
        resource: "contracts",
        slug: "contracts",
        stateMachine: CONTRACT_MACHINE,
        selectList: "*, vendors:vendor_id(name), projects:project_id(name)",
        selectDetail: "*, vendors:vendor_id(name), projects:project_id(name)",
        searchColumns: ["title", "contract_number"],
        icon: "FileSignature",
    }),

    invoice: defineEntity({
        entityName: "invoice",
        displayName: "Invoice",
        displayNamePlural: "Invoices",
        table: "invoices",
        resource: "invoices",
        slug: "invoices",
        stateMachine: INVOICE_MACHINE,
        selectList: "*, vendors:vendor_id(name)",
        selectDetail: "*, vendors:vendor_id(name), purchase_orders(total_amount)",
        searchColumns: ["invoice_number"],
        icon: "Receipt",
    }),

    vendor: defineEntity({
        entityName: "vendor",
        displayName: "Vendor",
        displayNamePlural: "Vendors",
        table: "vendors",
        resource: "vendors",
        slug: "vendors",
        stateMachine: VENDOR_MACHINE,
        searchColumns: ["name", "contact_name", "category"],
        icon: "Building2",
        softDelete: false,
    }),

    asset: defineEntity({
        entityName: "asset",
        displayName: "Asset",
        displayNamePlural: "Assets",
        table: "assets",
        resource: "assets",
        slug: "assets",
        stateMachine: ASSET_MACHINE,
        searchColumns: ["name", "barcode", "category"],
        icon: "Package",
    }),

    crew_member: defineEntity({
        entityName: "crew_member",
        displayName: "Crew Member",
        displayNamePlural: "Crew Members",
        table: "crew_members",
        resource: "crew",
        slug: "crew",
        searchColumns: ["name", "email", "role"],
        icon: "Users",
        softDelete: false,
    }),

    opportunity: defineEntity({
        entityName: "opportunity",
        displayName: "Opportunity",
        displayNamePlural: "Opportunities",
        table: "opportunities",
        resource: "opportunities",
        slug: "opportunities",
        stateMachine: OPPORTUNITY_MACHINE,
        searchColumns: ["title", "account_name"],
        icon: "Target",
    }),

    sow: defineEntity({
        entityName: "sow",
        displayName: "Scope of Work",
        displayNamePlural: "Scopes of Work",
        table: "scopes_of_work",
        resource: "sow",
        slug: "scopes-of-work",
        stateMachine: SOW_MACHINE,
        selectList: "*, projects:project_id(name)",
        selectDetail: "*, projects:project_id(name), deals:deal_id(title)",
        searchColumns: ["title"],
        icon: "ClipboardList",
    }),

    expense: defineEntity({
        entityName: "expense",
        displayName: "Expense",
        displayNamePlural: "Expenses",
        table: "expenses",
        resource: "expenses",
        slug: "expenses",
        stateMachine: EXPENSE_MACHINE,
        selectList: "*, projects:project_id(name), profiles:submitted_by(name)",
        selectDetail:
            "*, projects:project_id(name), profiles:submitted_by(name, avatar_url), vendors:vendor_id(name)",
        searchColumns: ["description", "category"],
        icon: "CreditCard",
    }),

    work_order: defineEntity({
        entityName: "work_order",
        displayName: "Work Order",
        displayNamePlural: "Work Orders",
        table: "work_orders",
        resource: "work_orders",
        slug: "work-orders",
        stateMachine: WORK_ORDER_MACHINE,
        selectList: "*, vendors:vendor_id(name), projects:project_id(name)",
        selectDetail: "*, vendors:vendor_id(name), projects:project_id(name)",
        searchColumns: ["title", "description"],
        icon: "Wrench",
    }),

    shipment: defineEntity({
        entityName: "shipment",
        displayName: "Shipment",
        displayNamePlural: "Shipments",
        table: "shipments",
        resource: "shipments",
        slug: "shipments",
        stateMachine: SHIPMENT_MACHINE,
        selectList: "*, origin:origin_location_id(name), destination:destination_location_id(name)",
        selectDetail:
            "*, origin:origin_location_id(name), destination:destination_location_id(name), projects:project_id(name)",
        searchColumns: ["tracking_number"],
        icon: "Truck",
    }),

    change_order: defineEntity({
        entityName: "change_order",
        displayName: "Change Order",
        displayNamePlural: "Change Orders",
        table: "change_orders",
        resource: "change_orders",
        slug: "change-orders",
        stateMachine: CHANGE_ORDER_MACHINE,
        selectList: "*, projects:project_id(name)",
        selectDetail: "*, projects:project_id(name), contracts:contract_id(title)",
        searchColumns: ["title", "description"],
        icon: "GitBranch",
    }),

    service_request: defineEntity({
        entityName: "service_request",
        displayName: "Service Request",
        displayNamePlural: "Service Requests",
        table: "service_requests",
        resource: "service_requests",
        slug: "service-requests",
        stateMachine: SERVICE_REQUEST_MACHINE,
        selectList: "*, projects:project_id(name), assignee:assigned_to(name)",
        selectDetail:
            "*, projects:project_id(name), assignee:assigned_to(name, avatar_url), locations:location_id(name)",
        searchColumns: ["title", "description"],
        icon: "HeadsetIcon",
    }),

    purchase_order: defineEntity({
        entityName: "purchase_order",
        displayName: "Purchase Order",
        displayNamePlural: "Purchase Orders",
        table: "purchase_orders",
        resource: "purchase_orders",
        slug: "purchase-orders",
        stateMachine: PURCHASE_ORDER_MACHINE,
        selectList: "*, vendors:vendor_id(name)",
        selectDetail: "*, vendors:vendor_id(name), purchase_order_items(*)",
        searchColumns: ["po_number"],
        icon: "ShoppingCart",
    }),

    milestone: defineEntity({
        entityName: "milestone",
        displayName: "Milestone",
        displayNamePlural: "Milestones",
        table: "milestones",
        resource: "milestones",
        slug: "milestones",
        stateMachine: MILESTONE_MACHINE,
        selectList: "*, projects:project_id(name)",
        selectDetail: "*, projects:project_id(name)",
        searchColumns: ["title"],
        icon: "Flag",
    }),

    crew_shift: defineEntity({
        entityName: "crew_shift",
        displayName: "Crew Shift",
        displayNamePlural: "Crew Shifts",
        table: "crew_shifts",
        resource: "crew",
        slug: "crew-shifts",
        stateMachine: CREW_SHIFT_MACHINE,
        selectList: "*, crew_members:crew_member_id(name), projects:project_id(name)",
        selectDetail:
            "*, crew_members:crew_member_id(name, role), projects:project_id(name), events:event_id(name)",
        searchColumns: ["department"],
        icon: "Clock",
    }),

    time_entry: defineEntity({
        entityName: "time_entry",
        displayName: "Time Entry",
        displayNamePlural: "Time Entries",
        table: "time_entries",
        resource: "time_tracking",
        slug: "time-entries",
        stateMachine: TIME_ENTRY_MACHINE,
        selectList:
            "*, projects:project_id(name), tasks:task_id(title), crew_members:crew_member_id(name)",
        selectDetail:
            "*, projects:project_id(name), tasks:task_id(title), crew_members:crew_member_id(name)",
        searchColumns: ["description"],
        icon: "Timer",
    }),

    live_event: defineEntity({
        entityName: "live_event",
        displayName: "Live Event",
        displayNamePlural: "Live Events",
        table: "events",
        resource: "events",
        slug: "events",
        stateMachine: LIVE_EVENT_MACHINE,
        searchColumns: ["name", "description"],
        icon: "Radio",
    }),

    ros_cue: defineEntity({
        entityName: "ros_cue",
        displayName: "ROS Cue",
        displayNamePlural: "ROS Cues",
        table: "ros_cues",
        resource: "events",
        slug: "ros-cues",
        stateMachine: ROS_CUE_MACHINE,
        selectList: "*, events:event_id(name)",
        selectDetail: "*, events:event_id(name)",
        searchColumns: ["cue_number", "description", "department"],
        icon: "Zap",
    }),

    readiness_gate: defineEntity({
        entityName: "readiness_gate",
        displayName: "Readiness Gate",
        displayNamePlural: "Readiness Gates",
        table: "readiness_gates",
        resource: "events",
        slug: "readiness-gates",
        stateMachine: READINESS_GATE_MACHINE,
        selectList: "*, events:event_id(name)",
        selectDetail: "*, events:event_id(name), profiles:responsible_id(name)",
        searchColumns: ["gate_name", "department"],
        icon: "ShieldCheck",
    }),

    document: defineEntity({
        entityName: "document",
        displayName: "Document",
        displayNamePlural: "Documents",
        table: "documents",
        resource: "documents",
        slug: "documents",
        stateMachine: DOCUMENT_MACHINE,
        selectList: "*, projects:project_id(name)",
        selectDetail: "*, projects:project_id(name)",
        searchColumns: ["title"],
        icon: "FileText",
    }),

    incident: defineEntity({
        entityName: "incident",
        displayName: "Incident",
        displayNamePlural: "Incidents",
        table: "incidents",
        resource: "incidents",
        slug: "incidents",
        stateMachine: INCIDENT_MACHINE,
        selectList: "*, projects:project_id(name), events:event_id(name)",
        selectDetail:
            "*, projects:project_id(name), events:event_id(name), locations:location_id(name), reporter:reported_by(name), assignee:assigned_to(name)",
        searchColumns: ["title", "description"],
        icon: "AlertTriangle",
    }),

    estimate: defineEntity({
        entityName: "estimate",
        displayName: "Estimate",
        displayNamePlural: "Estimates",
        table: "estimates",
        resource: "estimates",
        slug: "estimates",
        stateMachine: ESTIMATE_MACHINE,
        selectList: "*, projects:project_id(name)",
        selectDetail: "*, projects:project_id(name), deals:deal_id(title)",
        searchColumns: ["title", "client_name"],
        icon: "Calculator",
    }),

    rental_agreement: defineEntity({
        entityName: "rental_agreement",
        displayName: "Rental Agreement",
        displayNamePlural: "Rental Agreements",
        table: "rental_agreements",
        resource: "assets",
        slug: "rental-agreements",
        stateMachine: RENTAL_AGREEMENT_MACHINE,
        selectList: "*, vendors:vendor_id(name), projects:project_id(name)",
        selectDetail: "*, vendors:vendor_id(name), projects:project_id(name)",
        searchColumns: ["title"],
        icon: "KeyRound",
    }),

    rights: defineEntity({
        entityName: "rights",
        displayName: "Rights License",
        displayNamePlural: "Rights Licenses",
        table: "rights_licenses",
        resource: "documents",
        slug: "rights",
        stateMachine: RIGHTS_MACHINE,
        selectList: "*, projects:project_id(name)",
        selectDetail: "*, projects:project_id(name)",
        searchColumns: ["title", "licensor"],
        icon: "Scale",
    }),

    team: defineEntity({
        entityName: "team",
        displayName: "Team",
        displayNamePlural: "Teams",
        table: "teams",
        resource: "teams",
        slug: "teams",
        selectList: "*, user_profiles:created_by(display_name)",
        selectDetail:
            "*, user_profiles:created_by(display_name, avatar_url), team_members(id, user_id, role, joined_at, user_profiles(display_name, avatar_url, email))",
        searchColumns: ["name", "slug", "description"],
        icon: "Users",
        softDelete: false,
        trackAuthor: false,
    }),

    team_member: defineEntity({
        entityName: "team_member",
        displayName: "Team Member",
        displayNamePlural: "Team Members",
        table: "team_members",
        resource: "team_members",
        slug: "team-members",
        searchColumns: [],
        icon: "UserPlus",
        softDelete: false,
        trackAuthor: false,
        statusColumn: "role",
    }),

    // ─── Entities below added for dashboard pages with DB tables ──

    activation: defineEntity({
        entityName: "activation",
        displayName: "Activation",
        displayNamePlural: "Activations",
        table: "activations",
        resource: "activations",
        slug: "activations",
        stateMachine: ACTIVATION_MACHINE,
        selectList: "*, projects:project_id(name), locations:location_id(name)",
        selectDetail:
            "*, projects:project_id(name), locations:location_id(name), events:event_id(name)",
        searchColumns: ["name", "description"],
        icon: "Zap",
    }),

    approval: defineEntity({
        entityName: "approval",
        displayName: "Approval",
        displayNamePlural: "Approvals",
        table: "approvals",
        resource: "approvals",
        slug: "approvals",
        selectList: "*, projects:project_id(name)",
        selectDetail: "*, projects:project_id(name), profiles:approver_id(name, avatar_url)",
        searchColumns: ["milestone_name"],
        icon: "ThumbsUp",
    }),

    budget: defineEntity({
        entityName: "budget",
        displayName: "Budget",
        displayNamePlural: "Budgets",
        table: "budgets",
        resource: "budgets",
        slug: "budgets",
        selectList: "*, projects:project_id(name)",
        selectDetail: "*, projects:project_id(name)",
        searchColumns: ["name"],
        icon: "PiggyBank",
    }),

    lead: defineEntity({
        entityName: "lead",
        displayName: "Lead",
        displayNamePlural: "Leads",
        table: "leads",
        resource: "leads",
        slug: "leads",
        stateMachine: LEAD_MACHINE,
        searchColumns: ["first_name", "last_name", "email", "company_name"],
        icon: "UserPlus",
    }),

    location: defineEntity({
        entityName: "location",
        displayName: "Location",
        displayNamePlural: "Locations",
        table: "locations",
        resource: "locations",
        slug: "locations",
        searchColumns: ["name", "address_street1", "city"],
        icon: "MapPin",
    }),

    company: defineEntity({
        entityName: "company",
        displayName: "Company",
        displayNamePlural: "Companies",
        table: "companies",
        resource: "accounts",
        slug: "companies",
        searchColumns: ["name", "legal_name", "industry"],
        icon: "Building",
        softDelete: false,
    }),

    campaign: defineEntity({
        entityName: "campaign",
        displayName: "Campaign",
        displayNamePlural: "Campaigns",
        table: "campaigns",
        resource: "campaigns",
        slug: "campaigns",
        stateMachine: CAMPAIGN_MACHINE,
        selectList: "*, projects:project_id(name)",
        selectDetail: "*, projects:project_id(name)",
        searchColumns: ["name", "description"],
        icon: "Megaphone",
    }),

    call_sheet: defineEntity({
        entityName: "call_sheet",
        displayName: "Call Sheet",
        displayNamePlural: "Call Sheets",
        table: "call_sheets",
        resource: "call_sheets",
        slug: "call-sheets",
        selectList: "*, events:event_id(name), projects:project_id(name)",
        selectDetail: "*, events:event_id(name), projects:project_id(name)",
        searchColumns: ["title"],
        icon: "Phone",
    }),

    certification: defineEntity({
        entityName: "certification",
        displayName: "Certification",
        displayNamePlural: "Certifications",
        table: "asset_certifications",
        resource: "certifications",
        slug: "certifications",
        selectList: "*",
        selectDetail: "*",
        searchColumns: ["title", "cert_type"],
        icon: "Award",
        softDelete: false,
    }),

    proposal: defineEntity({
        entityName: "proposal",
        displayName: "Proposal",
        displayNamePlural: "Proposals",
        table: "proposals",
        resource: "proposals",
        slug: "proposals",
        stateMachine: PROPOSAL_MACHINE,
        selectList: "*, deals:deal_id(title)",
        selectDetail: "*, deals:deal_id(title), projects:project_id(name)",
        searchColumns: ["title"],
        icon: "FileText",
    }),

    purchase_requisition: defineEntity({
        entityName: "purchase_requisition",
        displayName: "Purchase Requisition",
        displayNamePlural: "Purchase Requisitions",
        table: "purchase_requisitions",
        resource: "purchase_requisitions",
        slug: "purchase-requisitions",
        selectList: "*, projects:project_id(name)",
        selectDetail: "*, projects:project_id(name), profiles:requested_by(name)",
        searchColumns: ["title", "description"],
        icon: "FileInput",
    }),

    recurring_invoice: defineEntity({
        entityName: "recurring_invoice",
        displayName: "Recurring Invoice",
        displayNamePlural: "Recurring Invoices",
        table: "recurring_invoices",
        resource: "recurring_invoices",
        slug: "recurring-invoices",
        searchColumns: ["description"],
        icon: "Repeat",
    }),

    brand_guideline: defineEntity({
        entityName: "brand_guideline",
        displayName: "Brand Guideline",
        displayNamePlural: "Brand Guidelines",
        table: "brand_guidelines",
        resource: "brand_guidelines",
        slug: "brand-guidelines",
        searchColumns: ["title"],
        icon: "Brush",
        softDelete: false,
    }),

    brand_kit: defineEntity({
        entityName: "brand_kit",
        displayName: "Brand Kit",
        displayNamePlural: "Brand Kits",
        table: "brand_kits",
        resource: "brand",
        slug: "brand-kits",
        searchColumns: ["name"],
        icon: "SwatchBook",
        softDelete: false,
    }),

    creative_brief: defineEntity({
        entityName: "creative_brief",
        displayName: "Creative Brief",
        displayNamePlural: "Creative Briefs",
        table: "creative_briefs",
        resource: "creative_briefs",
        slug: "briefs",
        selectList: "*, projects:project_id(name)",
        selectDetail: "*, projects:project_id(name), campaigns:campaign_id(name)",
        searchColumns: ["title", "description"],
        icon: "PenTool",
    }),

    case_study: defineEntity({
        entityName: "case_study",
        displayName: "Case Study",
        displayNamePlural: "Case Studies",
        table: "case_studies",
        resource: "case_studies",
        slug: "case-studies",
        selectList: "*, projects:project_id(name)",
        selectDetail: "*, projects:project_id(name)",
        searchColumns: ["title"],
        icon: "BookOpen",
        softDelete: false,
    }),

    client_invoice: defineEntity({
        entityName: "client_invoice",
        displayName: "Client Invoice",
        displayNamePlural: "Client Invoices",
        table: "client_invoices",
        resource: "invoices",
        slug: "client-invoices",
        stateMachine: CLIENT_INVOICE_MACHINE,
        selectList: "*, projects:project_id(name), companies:company_id(name)",
        selectDetail: "*, projects:project_id(name), companies:company_id(name)",
        searchColumns: ["number", "description"],
        icon: "Receipt",
    }),

    deck: defineEntity({
        entityName: "deck",
        displayName: "Deck",
        displayNamePlural: "Decks",
        table: "decks",
        resource: "decks",
        slug: "decks",
        selectList: "*, projects:project_id(name)",
        selectDetail: "*, projects:project_id(name), deck_slides(*)",
        searchColumns: ["title"],
        icon: "Presentation",
    }),

    digital_asset: defineEntity({
        entityName: "digital_asset",
        displayName: "Digital Asset",
        displayNamePlural: "Digital Assets",
        table: "digital_assets",
        resource: "digital_assets",
        slug: "digital-assets",
        searchColumns: ["name", "description"],
        icon: "Image",
    }),

    insurance_policy: defineEntity({
        entityName: "insurance_policy",
        displayName: "Insurance Policy",
        displayNamePlural: "Insurance Policies",
        table: "insurance_policies",
        resource: "insurance_policies",
        slug: "insurance-policies",
        searchColumns: ["policy_number", "provider"],
        icon: "Shield",
    }),

    knowledge_base_article: defineEntity({
        entityName: "knowledge_base_article",
        displayName: "Knowledge Base Article",
        displayNamePlural: "Knowledge Base Articles",
        table: "knowledge_base_articles",
        resource: "kb",
        slug: "knowledge-base",
        searchColumns: ["title", "content"],
        icon: "BookOpen",
    }),

    payment: defineEntity({
        entityName: "payment",
        displayName: "Payment",
        displayNamePlural: "Payments",
        table: "payments",
        resource: "payments",
        slug: "payments",
        stateMachine: PAYMENT_MACHINE,
        searchColumns: ["reference_number"],
        icon: "Wallet",
    }),

    rate_card: defineEntity({
        entityName: "rate_card",
        displayName: "Rate Card",
        displayNamePlural: "Rate Cards",
        table: "rate_cards",
        resource: "rate_cards",
        slug: "rate-cards",
        searchColumns: ["name"],
        icon: "CreditCard",
        softDelete: false,
    }),

    saved_view: defineEntity({
        entityName: "saved_view",
        displayName: "Saved View",
        displayNamePlural: "Saved Views",
        table: "saved_views",
        resource: "saved_views",
        slug: "saved-views",
        searchColumns: ["name"],
        icon: "Bookmark",
        softDelete: false,
    }),

    tech_sheet: defineEntity({
        entityName: "tech_sheet",
        displayName: "Tech Sheet",
        displayNamePlural: "Tech Sheets",
        table: "tech_sheets",
        resource: "tech_sheets",
        slug: "tech-sheets",
        selectList: "*, events:event_id(name), locations:location_id(name)",
        selectDetail: "*, events:event_id(name), locations:location_id(name)",
        searchColumns: ["title"],
        icon: "Cpu",
    }),

    vendor_review: defineEntity({
        entityName: "vendor_review",
        displayName: "Vendor Review",
        displayNamePlural: "Vendor Reviews",
        table: "vendor_reviews",
        resource: "vendor_reviews",
        slug: "vendor-reviews",
        selectList: "*, vendors:vendor_id(name)",
        selectDetail: "*, vendors:vendor_id(name), profiles:reviewer_id(name)",
        searchColumns: ["comments"],
        icon: "Star",
        softDelete: false,
    }),

    warehouse: defineEntity({
        entityName: "warehouse",
        displayName: "Warehouse",
        displayNamePlural: "Warehouses",
        table: "warehouses",
        resource: "warehouses",
        slug: "warehouses",
        searchColumns: ["name", "address"],
        icon: "Warehouse",
        softDelete: false,
    }),

    permit: defineEntity({
        entityName: "permit",
        displayName: "Permit",
        displayNamePlural: "Permits",
        table: "permits",
        resource: "permits",
        slug: "permits",
        stateMachine: PERMIT_MACHINE,
        selectList: "*, projects:project_id(name), locations:location_id(name)",
        selectDetail: "*, projects:project_id(name), locations:location_id(name)",
        searchColumns: ["permit_number", "type"],
        icon: "FileCheck",
    }),

    credit_note: defineEntity({
        entityName: "credit_note",
        displayName: "Credit Note",
        displayNamePlural: "Credit Notes",
        table: "credit_notes",
        resource: "credit_notes",
        slug: "credit-notes",
        selectList: "*, client_invoices(number)",
        selectDetail: "*, client_invoices(number)",
        searchColumns: ["number", "reason"],
        icon: "ReceiptText",
    }),

    ip_right: defineEntity({
        entityName: "ip_right",
        displayName: "IP Right",
        displayNamePlural: "IP Rights",
        table: "ip_rights",
        resource: "ip_rights",
        slug: "ip-rights",
        selectList: "*, projects:project_id(name)",
        selectDetail: "*, projects:project_id(name)",
        searchColumns: ["title", "description"],
        icon: "Scale",
    }),

    goods_receipt: defineEntity({
        entityName: "goods_receipt",
        displayName: "Goods Receipt",
        displayNamePlural: "Goods Receipts",
        table: "goods_receipts",
        resource: "goods_receipts",
        slug: "goods-receipts",
        selectList: "*, purchase_orders:purchase_order_id(po_number)",
        selectDetail: "*, purchase_orders:purchase_order_id(po_number, vendor_id)",
        searchColumns: ["receipt_number"],
        icon: "PackageCheck",
    }),

    budget_approval: defineEntity({
        entityName: "budget_approval",
        displayName: "Budget Approval",
        displayNamePlural: "Budget Approvals",
        table: "budget_approvals",
        resource: "budget_approvals",
        slug: "budget-approvals",
        selectList: "*, budgets:budget_id(name)",
        selectDetail: "*, budgets:budget_id(name), profiles:approver_id(name)",
        searchColumns: ["comments"],
        icon: "BadgeCheck",
    }),

    payment_approval: defineEntity({
        entityName: "payment_approval",
        displayName: "Payment Approval",
        displayNamePlural: "Payment Approvals",
        table: "payment_approvals",
        resource: "payment_approvals",
        slug: "payment-approvals",
        searchColumns: ["comments"],
        icon: "BadgeDollarSign",
    }),

    engineering_approval: defineEntity({
        entityName: "engineering_approval",
        displayName: "Engineering Approval",
        displayNamePlural: "Engineering Approvals",
        table: "engineering_approvals",
        resource: "engineering_approvals",
        slug: "engineering-approvals",
        selectList: "*, projects:project_id(name)",
        selectDetail: "*, projects:project_id(name), profiles:approver_id(name)",
        searchColumns: ["title", "description"],
        icon: "HardHat",
    }),

    gl_account: defineEntity({
        entityName: "gl_account",
        displayName: "GL Account",
        displayNamePlural: "GL Accounts",
        table: "gl_accounts",
        resource: "gl_accounts",
        slug: "gl-accounts",
        searchColumns: ["name", "code"],
        icon: "Landmark",
        softDelete: false,
    }),

    obligation: defineEntity({
        entityName: "obligation",
        displayName: "Obligation",
        displayNamePlural: "Obligations",
        table: "contract_obligations",
        resource: "obligations",
        slug: "obligations",
        selectList: "*, contracts:contract_id(title)",
        selectDetail: "*, contracts:contract_id(title)",
        searchColumns: ["description"],
        icon: "AlertCircle",
    }),

    dispatch_entry: defineEntity({
        entityName: "dispatch_entry",
        displayName: "Dispatch Entry",
        displayNamePlural: "Dispatch Entries",
        table: "dispatch_entries",
        resource: "dispatch",
        slug: "dispatch",
        selectList: "*, crew_members:crew_member_id(name), projects:project_id(name)",
        selectDetail:
            "*, crew_members:crew_member_id(name), projects:project_id(name), locations:location_id(name)",
        searchColumns: ["notes"],
        icon: "Send",
    }),

    sop: defineEntity({
        entityName: "sop",
        displayName: "SOP",
        displayNamePlural: "SOPs",
        table: "sops",
        resource: "sops",
        slug: "sops",
        searchColumns: ["title", "content"],
        icon: "FileText",
        softDelete: false,
    }),

    compliance_checklist: defineEntity({
        entityName: "compliance_checklist",
        displayName: "Compliance Checklist",
        displayNamePlural: "Compliance Checklists",
        table: "compliance_checklists",
        resource: "compliance_checklists",
        slug: "compliance-checklists",
        searchColumns: ["title"],
        icon: "ClipboardCheck",
    }),

    vehicle: defineEntity({
        entityName: "vehicle",
        displayName: "Vehicle",
        displayNamePlural: "Vehicles",
        table: "vehicles",
        resource: "fleet",
        slug: "fleet",
        searchColumns: ["name", "license_plate", "vin"],
        icon: "Car",
        softDelete: false,
    }),

    document_template: defineEntity({
        entityName: "document_template",
        displayName: "Document Template",
        displayNamePlural: "Document Templates",
        table: "document_templates",
        resource: "templates",
        slug: "templates",
        searchColumns: ["title", "description"],
        icon: "LayoutTemplate",
    }),

    notification: defineEntity({
        entityName: "notification",
        displayName: "Notification",
        displayNamePlural: "Notifications",
        table: "notifications",
        resource: "dashboard",
        slug: "notifications",
        searchColumns: ["title", "message"],
        icon: "Bell",
        softDelete: false,
    }),

    comment: defineEntity({
        entityName: "comment",
        displayName: "Comment",
        displayNamePlural: "Comments",
        table: "comments",
        resource: "projects",
        slug: "comments",
        selectList: "*, profiles(name, avatar_url)",
        selectDetail: "*, profiles(name, avatar_url)",
        searchColumns: ["body"],
        icon: "MessageSquare",
        softDelete: false,
    }),

    activity_log_entry: defineEntity({
        entityName: "activity_log_entry",
        displayName: "Activity Log Entry",
        displayNamePlural: "Activity Log Entries",
        table: "activity_log",
        resource: "audit_log",
        slug: "activity-log",
        selectList: "*, profiles(name)",
        selectDetail: "*, profiles(name)",
        searchColumns: ["action", "entity_type"],
        icon: "Activity",
        softDelete: false,
        trackAuthor: false,
    }),

    calendar_event: defineEntity({
        entityName: "calendar_event",
        displayName: "Calendar Event",
        displayNamePlural: "Calendar Events",
        table: "calendar_events",
        resource: "calendar",
        slug: "calendar-events",
        selectList: "*, projects(name)",
        selectDetail: "*, projects(name)",
        searchColumns: ["title"],
        icon: "Calendar",
    }),

    shift: defineEntity({
        entityName: "shift",
        displayName: "Shift",
        displayNamePlural: "Shifts",
        table: "shifts",
        resource: "schedule",
        slug: "shifts",
        selectList: "*, crew_members(name, role), projects(name)",
        selectDetail: "*, crew_members(name, role), projects(name)",
        searchColumns: ["notes"],
        icon: "Clock",
    }),

    project_template: defineEntity({
        entityName: "project_template",
        displayName: "Project Template",
        displayNamePlural: "Project Templates",
        table: "project_templates",
        resource: "templates",
        slug: "project-templates",
        searchColumns: ["name", "description"],
        icon: "Copy",
    }),

    integration: defineEntity({
        entityName: "integration",
        displayName: "Integration",
        displayNamePlural: "Integrations",
        table: "integrations",
        resource: "settings",
        slug: "integrations",
        searchColumns: ["name"],
        icon: "Plug",
        softDelete: false,
    }),

    budget_line_item: defineEntity({
        entityName: "budget_line_item",
        displayName: "Budget Line Item",
        displayNamePlural: "Budget Line Items",
        table: "budget_line_items",
        resource: "budgets",
        slug: "budget-line-items",
        searchColumns: ["category", "description"],
        icon: "ListOrdered",
    }),

    production_task: defineEntity({
        entityName: "production_task",
        displayName: "Production Task",
        displayNamePlural: "Production Tasks",
        table: "production_tasks",
        resource: "tasks",
        slug: "production-tasks",
        selectList: "*, profiles(name), vendors(name), locations(name)",
        selectDetail: "*, profiles(name), vendors(name), locations(name)",
        searchColumns: ["title", "description"],
        icon: "ListTodo",
    }),

    production_milestone: defineEntity({
        entityName: "production_milestone",
        displayName: "Production Milestone",
        displayNamePlural: "Production Milestones",
        table: "production_milestones",
        resource: "projects",
        slug: "production-milestones",
        selectList: "*, profiles(name), approvals(*)",
        selectDetail: "*, profiles(name), approvals(*)",
        searchColumns: ["title"],
        icon: "Flag",
    }),

    crew_availability: defineEntity({
        entityName: "crew_availability",
        displayName: "Crew Availability",
        displayNamePlural: "Crew Availability",
        table: "crew_availability",
        resource: "crew",
        slug: "crew-availability",
        selectList: "*, crew_members(name), projects(name)",
        selectDetail: "*, crew_members(name), projects(name)",
        searchColumns: [],
        icon: "UserCheck",
        softDelete: false,
    }),

    asset_assignment: defineEntity({
        entityName: "asset_assignment",
        displayName: "Asset Assignment",
        displayNamePlural: "Asset Assignments",
        table: "asset_assignments",
        resource: "assets",
        slug: "asset-assignments",
        selectList: "*, assets(name, barcode), projects(name), profiles(name)",
        selectDetail: "*, assets(name, barcode), projects(name), profiles(name)",
        searchColumns: [],
        icon: "ArrowRightLeft",
        softDelete: false,
    }),

    production_sop: defineEntity({
        entityName: "production_sop",
        displayName: "Production SOP",
        displayNamePlural: "Production SOPs",
        table: "production_sops",
        resource: "sops",
        slug: "production-sops",
        selectList: "*, profiles(name)",
        selectDetail: "*, profiles(name)",
        searchColumns: ["title", "number"],
        icon: "BookOpen",
    }),

    production_checklist: defineEntity({
        entityName: "production_checklist",
        displayName: "Production Checklist",
        displayNamePlural: "Production Checklists",
        table: "production_checklists",
        resource: "checklists",
        slug: "production-checklists",
        selectList: "*, profiles(name), projects(name), events(name)",
        selectDetail: "*, profiles(name), projects(name), events(name)",
        searchColumns: ["title"],
        icon: "ClipboardCheck",
    }),

    rfq: defineEntity({
        entityName: "rfq",
        displayName: "RFQ",
        displayNamePlural: "RFQs",
        table: "rfqs",
        resource: "procurement",
        slug: "rfqs",
        selectList: "*, profiles(name)",
        selectDetail: "*, profiles(name)",
        searchColumns: ["title"],
        icon: "FileQuestion",
    }),

    stakeholder: defineEntity({
        entityName: "stakeholder",
        displayName: "Stakeholder",
        displayNamePlural: "Stakeholders",
        table: "stakeholders",
        resource: "stakeholders",
        slug: "stakeholders",
        selectList: "*, stakeholder_projects(project_id)",
        selectDetail: "*, stakeholder_projects(project_id)",
        searchColumns: ["name", "email", "company"],
        icon: "UserCheck",
        softDelete: true,
        trackAuthor: true,
    }),

    vault_document: defineEntity({
        entityName: "vault_document",
        displayName: "Vault Document",
        displayNamePlural: "Vault Documents",
        table: "vault_documents",
        resource: "vault",
        slug: "vault-documents",
        selectList: "*, profiles(name)",
        selectDetail: "*, profiles(name)",
        searchColumns: ["title", "description"],
        icon: "FileArchive",
        softDelete: true,
        trackAuthor: true,
    }),

    // ─── hooks-pages.ts entities ────────────────────────────────

    access_audit_log: defineEntity({
        entityName: "access_audit_log",
        displayName: "Access Audit Log",
        displayNamePlural: "Access Audit Logs",
        table: "access_audit_log",
        resource: "security",
        slug: "access-audit-log",
        selectList: "*, profiles(name)",
        selectDetail: "*, profiles(name)",
        searchColumns: ["action"],
        icon: "ShieldCheck",
    }),

    approval_step: defineEntity({
        entityName: "approval_step",
        displayName: "Approval Step",
        displayNamePlural: "Approval Steps",
        table: "approval_steps",
        resource: "approvals",
        slug: "approval-steps",
        selectList: "*, profiles(name)",
        selectDetail: "*, profiles(name)",
        searchColumns: ["name"],
        icon: "CheckCircle",
    }),

    automation: defineEntity({
        entityName: "automation",
        displayName: "Automation",
        displayNamePlural: "Automations",
        table: "automations",
        resource: "automations",
        slug: "automations",
        searchColumns: ["name", "description"],
        icon: "Zap",
        softDelete: true,
        trackAuthor: true,
    }),

    brand_guideline_section: defineEntity({
        entityName: "brand_guideline_section",
        displayName: "Brand Guideline Section",
        displayNamePlural: "Brand Guideline Sections",
        table: "brand_guideline_sections",
        resource: "brand",
        slug: "brand-guideline-sections",
        searchColumns: ["title"],
        icon: "Palette",
    }),

    brief_template: defineEntity({
        entityName: "brief_template",
        displayName: "Brief Template",
        displayNamePlural: "Brief Templates",
        table: "brief_templates",
        resource: "briefs",
        slug: "brief-templates",
        searchColumns: ["name"],
        icon: "FileText",
    }),

    campaign_asset: defineEntity({
        entityName: "campaign_asset",
        displayName: "Campaign Asset",
        displayNamePlural: "Campaign Assets",
        table: "campaign_assets",
        resource: "campaigns",
        slug: "campaign-assets",
        searchColumns: ["name"],
        icon: "Image",
        trackAuthor: true,
    }),

    campaign_channel: defineEntity({
        entityName: "campaign_channel",
        displayName: "Campaign Channel",
        displayNamePlural: "Campaign Channels",
        table: "campaign_channels",
        resource: "campaigns",
        slug: "campaign-channels",
        searchColumns: ["name"],
        icon: "Radio",
    }),

    campaign_kpi: defineEntity({
        entityName: "campaign_kpi",
        displayName: "Campaign KPI",
        displayNamePlural: "Campaign KPIs",
        table: "campaign_kpis",
        resource: "campaigns",
        slug: "campaign-kpis",
        searchColumns: ["name"],
        icon: "BarChart3",
    }),

    checklist_template: defineEntity({
        entityName: "checklist_template",
        displayName: "Checklist Template",
        displayNamePlural: "Checklist Templates",
        table: "checklist_templates",
        resource: "checklists",
        slug: "checklist-templates",
        searchColumns: ["name"],
        icon: "ListChecks",
    }),

    checklist: defineEntity({
        entityName: "checklist",
        displayName: "Checklist",
        displayNamePlural: "Checklists",
        table: "job_checklists",
        resource: "checklists",
        slug: "checklists",
        searchColumns: ["title"],
        icon: "CheckSquare",
        trackAuthor: true,
    }),

    clause_library_entry: defineEntity({
        entityName: "clause_library_entry",
        displayName: "Clause",
        displayNamePlural: "Clause Library",
        table: "contract_clauses",
        resource: "contracts",
        slug: "clause-library",
        searchColumns: ["title", "content"],
        icon: "BookOpen",
    }),

    compliance_requirement: defineEntity({
        entityName: "compliance_requirement",
        displayName: "Compliance Requirement",
        displayNamePlural: "Compliance Requirements",
        table: "compliance_requirements",
        resource: "compliance",
        slug: "compliance-requirements",
        searchColumns: ["name"],
        icon: "ShieldCheck",
    }),

    consumable: defineEntity({
        entityName: "consumable",
        displayName: "Consumable",
        displayNamePlural: "Consumables",
        table: "consumables",
        resource: "inventory",
        slug: "consumables",
        selectList: "*, projects(name)",
        selectDetail: "*, projects(name)",
        searchColumns: ["name", "sku"],
        icon: "Package",
        softDelete: true,
    }),

    contract_obligation: defineEntity({
        entityName: "contract_obligation",
        displayName: "Contract Obligation",
        displayNamePlural: "Contract Obligations",
        table: "contract_obligations",
        resource: "contracts",
        slug: "contract-obligations",
        searchColumns: ["description"],
        icon: "FileWarning",
    }),

    creative_review: defineEntity({
        entityName: "creative_review",
        displayName: "Creative Review",
        displayNamePlural: "Creative Reviews",
        table: "creative_reviews",
        resource: "brand",
        slug: "creative-reviews",
        selectList: "*, profiles(name)",
        selectDetail: "*, profiles(name)",
        searchColumns: ["title"],
        icon: "Eye",
        trackAuthor: true,
    }),

    dashboard_widget: defineEntity({
        entityName: "dashboard_widget",
        displayName: "Dashboard Widget",
        displayNamePlural: "Dashboard Widgets",
        table: "dashboard_widgets",
        resource: "dashboards",
        slug: "dashboard-widgets",
        selectList: "*, dashboards(name)",
        selectDetail: "*, dashboards(name)",
        searchColumns: ["title"],
        icon: "LayoutDashboard",
    }),

    data_export_request: defineEntity({
        entityName: "data_export_request",
        displayName: "Data Export Request",
        displayNamePlural: "Data Export Requests",
        table: "data_export_requests",
        resource: "settings",
        slug: "data-export-requests",
        searchColumns: ["export_format"],
        icon: "Download",
        trackAuthor: true,
    }),

    domain_event: defineEntity({
        entityName: "domain_event",
        displayName: "Domain Event",
        displayNamePlural: "Domain Events",
        table: "domain_events",
        resource: "system",
        slug: "domain-events",
        searchColumns: ["event_type"],
        icon: "Activity",
    }),

    e_signature: defineEntity({
        entityName: "e_signature",
        displayName: "E-Signature",
        displayNamePlural: "E-Signatures",
        table: "e_signatures",
        resource: "documents",
        slug: "e-signatures",
        searchColumns: ["signer_name"],
        icon: "PenTool",
        trackAuthor: true,
    }),

    expense_report: defineEntity({
        entityName: "expense_report",
        displayName: "Expense Report",
        displayNamePlural: "Expense Reports",
        table: "expense_reports",
        resource: "expenses",
        slug: "expense-reports",
        searchColumns: ["title"],
        icon: "Receipt",
        trackAuthor: true,
    }),

    goal: defineEntity({
        entityName: "goal",
        displayName: "Goal",
        displayNamePlural: "Goals",
        table: "goals",
        resource: "goals",
        slug: "goals",
        selectList: "*, profiles(name)",
        selectDetail: "*, profiles(name)",
        searchColumns: ["title"],
        icon: "Target",
        trackAuthor: true,
    }),

    insurance_requirement: defineEntity({
        entityName: "insurance_requirement",
        displayName: "Insurance Requirement",
        displayNamePlural: "Insurance Requirements",
        table: "insurance_requirements",
        resource: "insurance",
        slug: "insurance-requirements",
        searchColumns: ["requirement_name"],
        icon: "Shield",
    }),

    invitation: defineEntity({
        entityName: "invitation",
        displayName: "Invitation",
        displayNamePlural: "Invitations",
        table: "invitations",
        resource: "settings",
        slug: "invitations",
        selectList: "*, profiles(name)",
        selectDetail: "*, profiles(name)",
        searchColumns: ["email"],
        icon: "Mail",
    }),

    job_cost_entry: defineEntity({
        entityName: "job_cost_entry",
        displayName: "Job Cost Entry",
        displayNamePlural: "Job Cost Entries",
        table: "job_cost_entries",
        resource: "budgets",
        slug: "job-cost-entries",
        searchColumns: ["description"],
        icon: "DollarSign",
        trackAuthor: true,
    }),

    live_crew_assignment: defineEntity({
        entityName: "live_crew_assignment",
        displayName: "Live Crew Assignment",
        displayNamePlural: "Live Crew Assignments",
        table: "live_crew_assignments",
        resource: "live_ops",
        slug: "live-crew-assignments",
        selectList: "*, profiles(name)",
        selectDetail: "*, profiles(name)",
        searchColumns: ["role"],
        icon: "Users",
    }),

    login_audit_log: defineEntity({
        entityName: "login_audit_log",
        displayName: "Login Audit Log",
        displayNamePlural: "Login Audit Logs",
        table: "login_audit_log",
        resource: "security",
        slug: "login-audit-log",
        searchColumns: ["email"],
        icon: "LogIn",
    }),

    payroll_batch: defineEntity({
        entityName: "payroll_batch",
        displayName: "Payroll Batch",
        displayNamePlural: "Payroll Batches",
        table: "payroll_batches",
        resource: "payroll",
        slug: "payroll-batches",
        selectList: "*, profiles(name)",
        selectDetail: "*, profiles(name)",
        searchColumns: ["batch_name"],
        icon: "Banknote",
        trackAuthor: true,
    }),

    production_budget_line: defineEntity({
        entityName: "production_budget_line",
        displayName: "Production Budget Line",
        displayNamePlural: "Production Budget Lines",
        table: "production_budget_lines",
        resource: "budgets",
        slug: "production-budget-lines",
        searchColumns: ["description"],
        icon: "DollarSign",
    }),

    production_expense: defineEntity({
        entityName: "production_expense",
        displayName: "Production Expense",
        displayNamePlural: "Production Expenses",
        table: "production_expenses",
        resource: "expenses",
        slug: "production-expenses",
        selectList: "*, projects(name), vendors(name), profiles(name), locations(name)",
        selectDetail: "*, projects(name), vendors(name), profiles(name), locations(name)",
        searchColumns: ["description", "vendor_name"],
        icon: "Receipt",
        trackAuthor: true,
    }),

    production_time_entry: defineEntity({
        entityName: "production_time_entry",
        displayName: "Production Time Entry",
        displayNamePlural: "Production Time Entries",
        table: "production_time_entries",
        resource: "time_tracking",
        slug: "production-time-entries",
        selectList: "*, profiles(name), projects(name), production_tasks(title)",
        selectDetail: "*, profiles(name), projects(name), production_tasks(title)",
        searchColumns: ["description"],
        icon: "Clock",
        trackAuthor: true,
    }),

    profile: defineEntity({
        entityName: "profile",
        displayName: "Profile",
        displayNamePlural: "Profiles",
        table: "profiles",
        resource: "users",
        slug: "profiles",
        searchColumns: ["name", "email"],
        icon: "User",
    }),

    resilience_target: defineEntity({
        entityName: "resilience_target",
        displayName: "Resilience Target",
        displayNamePlural: "Resilience Targets",
        table: "resilience_targets",
        resource: "system",
        slug: "resilience-targets",
        searchColumns: ["service_name"],
        icon: "Shield",
    }),

    resource_booking: defineEntity({
        entityName: "resource_booking",
        displayName: "Resource Booking",
        displayNamePlural: "Resource Bookings",
        table: "resource_bookings",
        resource: "scheduling",
        slug: "resource-bookings",
        selectList: "*, profiles(name), projects(name)",
        selectDetail: "*, profiles(name), projects(name)",
        searchColumns: ["notes"],
        icon: "CalendarDays",
        trackAuthor: true,
    }),

    revenue_schedule: defineEntity({
        entityName: "revenue_schedule",
        displayName: "Revenue Schedule",
        displayNamePlural: "Revenue Schedules",
        table: "revenue_schedules",
        resource: "finance",
        slug: "revenue-schedules",
        selectList: "*, projects(name)",
        selectDetail: "*, projects(name)",
        searchColumns: ["description"],
        icon: "TrendingUp",
    }),

    risk_assessment: defineEntity({
        entityName: "risk_assessment",
        displayName: "Risk Assessment",
        displayNamePlural: "Risk Assessments",
        table: "vendor_risk_scores",
        resource: "safety",
        slug: "risk-assessments",
        searchColumns: ["title", "description"],
        icon: "AlertTriangle",
        trackAuthor: true,
    }),

    role_change_log: defineEntity({
        entityName: "role_change_log",
        displayName: "Role Change Log",
        displayNamePlural: "Role Change Logs",
        table: "role_change_log",
        resource: "security",
        slug: "role-change-log",
        selectList: "*, profiles(name)",
        selectDetail: "*, profiles(name)",
        searchColumns: ["new_role"],
        icon: "UserCog",
    }),

    service_health_check: defineEntity({
        entityName: "service_health_check",
        displayName: "Service Health Check",
        displayNamePlural: "Service Health Checks",
        table: "service_health_checks",
        resource: "system",
        slug: "service-health-checks",
        searchColumns: ["service_name"],
        icon: "HeartPulse",
    }),

    sla_definition: defineEntity({
        entityName: "sla_definition",
        displayName: "SLA Definition",
        displayNamePlural: "SLA Definitions",
        table: "sla_definitions",
        resource: "system",
        slug: "sla-definitions",
        searchColumns: ["name"],
        icon: "Timer",
    }),

    sla_tracking: defineEntity({
        entityName: "sla_tracking",
        displayName: "SLA Tracking",
        displayNamePlural: "SLA Tracking Records",
        table: "sla_tracking",
        resource: "system",
        slug: "sla-tracking",
        selectList: "*, sla_definitions(name, target_hours)",
        selectDetail: "*, sla_definitions(name, target_hours)",
        searchColumns: [],
        icon: "Timer",
    }),

    temporary_access_grant: defineEntity({
        entityName: "temporary_access_grant",
        displayName: "Temporary Access Grant",
        displayNamePlural: "Temporary Access Grants",
        table: "temporary_access_grants",
        resource: "security",
        slug: "temporary-access-grants",
        selectList: "*, profiles(name)",
        selectDetail: "*, profiles(name)",
        searchColumns: ["reason"],
        icon: "KeyRound",
    }),

    timesheet: defineEntity({
        entityName: "timesheet",
        displayName: "Timesheet",
        displayNamePlural: "Timesheets",
        table: "timesheets",
        resource: "time_tracking",
        slug: "timesheets",
        searchColumns: ["notes"],
        icon: "Clock",
        trackAuthor: true,
    }),

    vendor_compliance_document: defineEntity({
        entityName: "vendor_compliance_document",
        displayName: "Vendor Compliance Document",
        displayNamePlural: "Vendor Compliance Documents",
        table: "vendor_compliance_docs",
        resource: "vendors",
        slug: "vendor-compliance-documents",
        searchColumns: ["document_name"],
        icon: "FileCheck",
        trackAuthor: true,
    }),

    worker_offboarding_run: defineEntity({
        entityName: "worker_offboarding_run",
        displayName: "Worker Offboarding Run",
        displayNamePlural: "Worker Offboarding Runs",
        table: "worker_offboarding_runs",
        resource: "hr",
        slug: "worker-offboarding-runs",
        selectList: "*, profiles(name)",
        selectDetail: "*, profiles(name)",
        searchColumns: [],
        icon: "UserMinus",
    }),

    worker_onboarding_run: defineEntity({
        entityName: "worker_onboarding_run",
        displayName: "Worker Onboarding Run",
        displayNamePlural: "Worker Onboarding Runs",
        table: "worker_onboarding_runs",
        resource: "hr",
        slug: "worker-onboarding-runs",
        selectList: "*, profiles(name)",
        selectDetail: "*, profiles(name)",
        searchColumns: [],
        icon: "UserPlus",
    }),

    worker_profile: defineEntity({
        entityName: "worker_profile",
        displayName: "Worker Profile",
        displayNamePlural: "Worker Profiles",
        table: "worker_profiles",
        resource: "hr",
        slug: "worker-profiles",
        searchColumns: ["job_title"],
        icon: "UserCircle",
    }),

    worker_review: defineEntity({
        entityName: "worker_review",
        displayName: "Worker Review",
        displayNamePlural: "Worker Reviews",
        table: "worker_reviews",
        resource: "hr",
        slug: "worker-reviews",
        selectList: "*, profiles(name)",
        selectDetail: "*, profiles(name)",
        searchColumns: ["summary"],
        icon: "Star",
        trackAuthor: true,
    }),

    workflow: defineEntity({
        entityName: "workflow",
        displayName: "Workflow",
        displayNamePlural: "Workflows",
        table: "workflow_instances",
        resource: "automations",
        slug: "workflows",
        searchColumns: ["name", "description"],
        icon: "Workflow",
        softDelete: true,
        trackAuthor: true,
    }),

    maintenance_record: defineEntity({
        entityName: "maintenance_record",
        displayName: "Maintenance Record",
        displayNamePlural: "Maintenance Records",
        table: "maintenance_records",
        resource: "assets",
        slug: "maintenance-records",
        selectList: "*, assets(name), profiles(name)",
        selectDetail: "*, assets(name), profiles(name)",
        searchColumns: ["description"],
        icon: "Wrench",
        trackAuthor: true,
    }),

    project_assignment: defineEntity({
        entityName: "project_assignment",
        displayName: "Project Assignment",
        displayNamePlural: "Project Assignments",
        table: "project_assignments",
        resource: "projects",
        slug: "project-assignments",
        selectList: "*, crew_members(name), projects(name)",
        selectDetail: "*, crew_members(name), projects(name)",
        searchColumns: ["role"],
        icon: "UserPlus",
        trackAuthor: true,
    }),

    schedule_entry: defineEntity({
        entityName: "schedule_entry",
        displayName: "Schedule Entry",
        displayNamePlural: "Schedule Entries",
        table: "schedule_entries",
        resource: "scheduling",
        slug: "schedule-entries",
        selectList: "*, projects(name), locations(name), profiles(name)",
        selectDetail: "*, projects(name), locations(name), profiles(name)",
        searchColumns: ["title", "description"],
        icon: "CalendarDays",
        trackAuthor: true,
    }),

    report_definition: defineEntity({
        entityName: "report_definition",
        displayName: "Report Definition",
        displayNamePlural: "Report Definitions",
        table: "report_definitions",
        resource: "reports",
        slug: "report-definitions",
        selectList: "*, profiles(name)",
        selectDetail: "*, profiles(name)",
        searchColumns: ["name", "description"],
        icon: "BarChart",
        trackAuthor: true,
    }),

    invoice_template: defineEntity({
        entityName: "invoice_template",
        displayName: "Invoice Template",
        displayNamePlural: "Invoice Templates",
        table: "invoice_templates",
        resource: "invoices",
        slug: "invoice-templates",
        searchColumns: ["name"],
        icon: "ReceiptText",
    }),

    lost_reason: defineEntity({
        entityName: "lost_reason",
        displayName: "Lost Reason",
        displayNamePlural: "Lost Reasons",
        table: "lost_reasons",
        resource: "deals",
        slug: "lost-reasons",
        searchColumns: ["name"],
        icon: "XCircle",
        softDelete: false,
    }),

    organization: defineEntity({
        entityName: "organization",
        displayName: "Organization",
        displayNamePlural: "Organizations",
        table: "organizations",
        resource: "settings",
        slug: "organizations",
        searchColumns: ["name"],
        icon: "Building",
        softDelete: false,
    }),

    automation_log: defineEntity({
        entityName: "automation_log",
        displayName: "Automation Log",
        displayNamePlural: "Automation Logs",
        table: "automation_logs",
        resource: "automations",
        slug: "automation-logs",
        searchColumns: ["event_type"],
        icon: "ScrollText",
        softDelete: false,
        trackAuthor: false,
    }),

    stakeholder_project: defineEntity({
        entityName: "stakeholder_project",
        displayName: "Stakeholder Project",
        displayNamePlural: "Stakeholder Projects",
        table: "stakeholder_projects",
        resource: "projects",
        slug: "stakeholder-projects",
        searchColumns: [],
        icon: "Link",
        softDelete: false,
    }),

    consumable_usage: defineEntity({
        entityName: "consumable_usage",
        displayName: "Consumable Usage",
        displayNamePlural: "Consumable Usage",
        table: "consumable_usage",
        resource: "inventory",
        slug: "consumable-usage",
        selectList: "*, consumables(name), profiles(name)",
        selectDetail: "*, consumables(name), profiles(name)",
        searchColumns: [],
        icon: "PackageMinus",
        softDelete: false,
        trackAuthor: false,
    }),

    // ─── Category C Orphan Tables — CRM ─────────────────────────

    contact: defineEntity({
        entityName: "contact",
        displayName: "Contact",
        displayNamePlural: "Contacts",
        table: "contacts",
        resource: "contacts",
        slug: "contacts",
        searchColumns: ["first_name", "last_name", "email", "company"],
        icon: "Contact",
    }),

    // ─── Planning ───────────────────────────────────────────────

    scenario: defineEntity({
        entityName: "scenario",
        displayName: "Scenario",
        displayNamePlural: "Scenarios",
        table: "scenarios",
        resource: "scenarios",
        slug: "scenarios",
        searchColumns: ["name", "description"],
        icon: "GitBranch",
    }),

    // ─── Production ─────────────────────────────────────────────

    work_package: defineEntity({
        entityName: "work_package",
        displayName: "Work Package",
        displayNamePlural: "Work Packages",
        table: "work_packages",
        resource: "production",
        slug: "work-packages",
        selectList: "*, projects:project_id(name)",
        selectDetail: "*, projects:project_id(name)",
        searchColumns: ["name", "description"],
        icon: "Boxes",
    }),

    bom: defineEntity({
        entityName: "bom",
        displayName: "Bill of Materials",
        displayNamePlural: "Bills of Materials",
        table: "boms",
        resource: "production",
        slug: "boms",
        selectList: "*, projects:project_id(name)",
        selectDetail: "*, projects:project_id(name)",
        searchColumns: ["name"],
        icon: "ClipboardList",
    }),

    production_run: defineEntity({
        entityName: "production_run",
        displayName: "Production Run",
        displayNamePlural: "Production Runs",
        table: "production_runs",
        resource: "production",
        slug: "production-runs",
        searchColumns: ["name"],
        icon: "Factory",
    }),

    production_vertical: defineEntity({
        entityName: "production_vertical",
        displayName: "Production Vertical",
        displayNamePlural: "Production Verticals",
        table: "production_verticals",
        resource: "production",
        slug: "production-verticals",
        searchColumns: ["name"],
        icon: "Layers",
        softDelete: false,
    }),

    technical_spec: defineEntity({
        entityName: "technical_spec",
        displayName: "Technical Spec",
        displayNamePlural: "Technical Specs",
        table: "technical_specs",
        resource: "production",
        slug: "technical-specs",
        searchColumns: ["title"],
        icon: "FileCode",
    }),

    // ─── Advancing ──────────────────────────────────────────────

    production_advance: defineEntity({
        entityName: "production_advance",
        displayName: "Production Advance",
        displayNamePlural: "Production Advances",
        table: "production_advances",
        resource: "advancing",
        slug: "production-advances",
        searchColumns: ["reference_number"],
        icon: "BadgeDollarSign",
    }),

    production_advance_item: defineEntity({
        entityName: "production_advance_item",
        displayName: "Advance Item",
        displayNamePlural: "Advance Items",
        table: "production_advance_items",
        resource: "advancing",
        slug: "production-advance-items",
        searchColumns: ["description"],
        icon: "ListOrdered",
        softDelete: false,
    }),

    advance_template: defineEntity({
        entityName: "advance_template",
        displayName: "Advance Template",
        displayNamePlural: "Advance Templates",
        table: "advance_templates",
        resource: "advancing",
        slug: "advance-templates",
        searchColumns: ["name"],
        icon: "FileTemplate",
    }),

    advance_status_history: defineEntity({
        entityName: "advance_status_history",
        displayName: "Advance Status History",
        displayNamePlural: "Advance Status History",
        table: "advance_status_history",
        resource: "advancing",
        slug: "advance-status-history",
        searchColumns: [],
        icon: "History",
        softDelete: false,
        trackAuthor: false,
    }),

    activity: defineEntity({
        entityName: "activity",
        displayName: "Activity",
        displayNamePlural: "Activities",
        table: "activities",
        resource: "advancing",
        slug: "activities",
        searchColumns: ["name", "description"],
        icon: "Activity",
    }),

    // ─── Quality ────────────────────────────────────────────────

    qc_gate: defineEntity({
        entityName: "qc_gate",
        displayName: "QC Gate",
        displayNamePlural: "QC Gates",
        table: "qc_gates",
        resource: "quality",
        slug: "qc-gates",
        searchColumns: ["name"],
        icon: "ShieldCheck",
    }),

    quality_check: defineEntity({
        entityName: "quality_check",
        displayName: "Quality Check",
        displayNamePlural: "Quality Checks",
        table: "quality_checks",
        resource: "quality",
        slug: "quality-checks",
        searchColumns: ["name"],
        icon: "CheckCircle2",
    }),

    quality_check_template: defineEntity({
        entityName: "quality_check_template",
        displayName: "Quality Check Template",
        displayNamePlural: "Quality Check Templates",
        table: "quality_check_templates",
        resource: "quality",
        slug: "quality-check-templates",
        searchColumns: ["name"],
        icon: "FileCheck2",
    }),

    // ─── Assets & Logistics ─────────────────────────────────────

    kit: defineEntity({
        entityName: "kit",
        displayName: "Kit",
        displayNamePlural: "Kits",
        table: "kits",
        resource: "assets",
        slug: "kits",
        searchColumns: ["name", "description"],
        icon: "Package2",
    }),

    load_plan: defineEntity({
        entityName: "load_plan",
        displayName: "Load Plan",
        displayNamePlural: "Load Plans",
        table: "load_plans",
        resource: "logistics",
        slug: "load-plans",
        searchColumns: ["name"],
        icon: "Truck",
    }),

    inventory_audit: defineEntity({
        entityName: "inventory_audit",
        displayName: "Inventory Audit",
        displayNamePlural: "Inventory Audits",
        table: "inventory_audits",
        resource: "assets",
        slug: "inventory-audits",
        searchColumns: ["name"],
        icon: "ClipboardCheck",
    }),

    asset_version: defineEntity({
        entityName: "asset_version",
        displayName: "Asset Version",
        displayNamePlural: "Asset Versions",
        table: "asset_versions",
        resource: "digital_assets",
        slug: "asset-versions",
        searchColumns: [],
        icon: "GitCommit",
        softDelete: false,
    }),

    asset_tag: defineEntity({
        entityName: "asset_tag",
        displayName: "Asset Tag",
        displayNamePlural: "Asset Tags",
        table: "asset_tags",
        resource: "digital_assets",
        slug: "asset-tags",
        searchColumns: ["name"],
        icon: "Tag",
        softDelete: false,
    }),

    // ─── Live Ops ───────────────────────────────────────────────

    space_booking: defineEntity({
        entityName: "space_booking",
        displayName: "Space Booking",
        displayNamePlural: "Space Bookings",
        table: "space_bookings",
        resource: "locations",
        slug: "space-bookings",
        searchColumns: ["name"],
        icon: "MapPin",
    }),

    scan_event: defineEntity({
        entityName: "scan_event",
        displayName: "Scan Event",
        displayNamePlural: "Scan Events",
        table: "scan_events",
        resource: "events",
        slug: "scan-events",
        searchColumns: [],
        icon: "ScanLine",
        softDelete: false,
        trackAuthor: false,
    }),

    foh_zone: defineEntity({
        entityName: "foh_zone",
        displayName: "FOH Zone",
        displayNamePlural: "FOH Zones",
        table: "foh_zones",
        resource: "events",
        slug: "foh-zones",
        searchColumns: ["name"],
        icon: "LayoutGrid",
    }),

    foh_zone_reading: defineEntity({
        entityName: "foh_zone_reading",
        displayName: "FOH Zone Reading",
        displayNamePlural: "FOH Zone Readings",
        table: "foh_zone_readings",
        resource: "events",
        slug: "foh-zone-readings",
        searchColumns: [],
        icon: "Gauge",
        softDelete: false,
        trackAuthor: false,
    }),

    live_event_instance: defineEntity({
        entityName: "live_event_instance",
        displayName: "Live Event Instance",
        displayNamePlural: "Live Event Instances",
        table: "live_event_instances",
        resource: "events",
        slug: "live-event-instances",
        searchColumns: ["name"],
        icon: "Radio",
    }),

    live_financial_snapshot: defineEntity({
        entityName: "live_financial_snapshot",
        displayName: "Live Financial Snapshot",
        displayNamePlural: "Live Financial Snapshots",
        table: "live_financial_snapshots",
        resource: "events",
        slug: "live-financial-snapshots",
        searchColumns: [],
        icon: "BarChart3",
        softDelete: false,
        trackAuthor: false,
    }),

    post_event_report: defineEntity({
        entityName: "post_event_report",
        displayName: "Post-Event Report",
        displayNamePlural: "Post-Event Reports",
        table: "post_event_reports",
        resource: "events",
        slug: "post-event-reports",
        searchColumns: ["title"],
        icon: "FileBarChart",
    }),

    vip_guest: defineEntity({
        entityName: "vip_guest",
        displayName: "VIP Guest",
        displayNamePlural: "VIP Guests",
        table: "vip_guests",
        resource: "events",
        slug: "vip-guests",
        searchColumns: ["name", "email"],
        icon: "Crown",
    }),

    vip_service_request: defineEntity({
        entityName: "vip_service_request",
        displayName: "VIP Service Request",
        displayNamePlural: "VIP Service Requests",
        table: "vip_service_requests",
        resource: "events",
        slug: "vip-service-requests",
        searchColumns: ["description"],
        icon: "Star",
    }),

    guest_incident: defineEntity({
        entityName: "guest_incident",
        displayName: "Guest Incident",
        displayNamePlural: "Guest Incidents",
        table: "guest_incidents",
        resource: "events",
        slug: "guest-incidents",
        searchColumns: ["description"],
        icon: "AlertTriangle",
    }),

    strike_sequence: defineEntity({
        entityName: "strike_sequence",
        displayName: "Strike Sequence",
        displayNamePlural: "Strike Sequences",
        table: "strike_sequences",
        resource: "events",
        slug: "strike-sequences",
        searchColumns: ["name"],
        icon: "ListChecks",
    }),

    // ─── Messaging ──────────────────────────────────────────────

    message: defineEntity({
        entityName: "message",
        displayName: "Message",
        displayNamePlural: "Messages",
        table: "messages",
        resource: "messages",
        slug: "messages",
        searchColumns: ["content"],
        icon: "MessageSquare",
        softDelete: false,
    }),

    conversation: defineEntity({
        entityName: "conversation",
        displayName: "Conversation",
        displayNamePlural: "Conversations",
        table: "conversations",
        resource: "messages",
        slug: "conversations",
        searchColumns: ["subject"],
        icon: "MessagesSquare",
    }),

    // ─── Credentialing ──────────────────────────────────────────

    credential_type: defineEntity({
        entityName: "credential_type",
        displayName: "Credential Type",
        displayNamePlural: "Credential Types",
        table: "credential_types",
        resource: "credentials",
        slug: "credential-types",
        searchColumns: ["name"],
        icon: "BadgeCheck",
        softDelete: false,
    }),

    credential_assignment: defineEntity({
        entityName: "credential_assignment",
        displayName: "Credential Assignment",
        displayNamePlural: "Credential Assignments",
        table: "credential_assignments",
        resource: "credentials",
        slug: "credential-assignments",
        searchColumns: [],
        icon: "UserCheck",
    }),

    credential_inventory_pool: defineEntity({
        entityName: "credential_inventory_pool",
        displayName: "Credential Inventory Pool",
        displayNamePlural: "Credential Inventory Pools",
        table: "credential_inventory_pools",
        resource: "credentials",
        slug: "credential-inventory-pools",
        searchColumns: ["name"],
        icon: "Warehouse",
    }),

    // ─── External Sync ──────────────────────────────────────────

    provider_connection: defineEntity({
        entityName: "provider_connection",
        displayName: "Provider Connection",
        displayNamePlural: "Provider Connections",
        table: "provider_connections",
        resource: "integrations",
        slug: "provider-connections",
        searchColumns: ["provider_name"],
        icon: "Plug",
    }),

    sync_event: defineEntity({
        entityName: "sync_event",
        displayName: "Sync Event",
        displayNamePlural: "Sync Events",
        table: "sync_events",
        resource: "integrations",
        slug: "sync-events",
        searchColumns: [],
        icon: "RefreshCw",
        softDelete: false,
        trackAuthor: false,
    }),

    // ─── HR ─────────────────────────────────────────────────────

    review: defineEntity({
        entityName: "review",
        displayName: "Performance Review",
        displayNamePlural: "Performance Reviews",
        table: "reviews",
        resource: "hr",
        slug: "reviews",
        searchColumns: ["title"],
        icon: "ClipboardPen",
    }),

    review_cycle: defineEntity({
        entityName: "review_cycle",
        displayName: "Review Cycle",
        displayNamePlural: "Review Cycles",
        table: "review_cycles",
        resource: "hr",
        slug: "review-cycles",
        searchColumns: ["name"],
        icon: "RotateCcw",
    }),

    time_off_request: defineEntity({
        entityName: "time_off_request",
        displayName: "Time Off Request",
        displayNamePlural: "Time Off Requests",
        table: "time_off_requests",
        resource: "hr",
        slug: "time-off-requests",
        searchColumns: ["reason"],
        icon: "CalendarOff",
    }),

    worker_classification: defineEntity({
        entityName: "worker_classification",
        displayName: "Worker Classification",
        displayNamePlural: "Worker Classifications",
        table: "worker_classifications",
        resource: "hr",
        slug: "worker-classifications",
        searchColumns: ["name"],
        icon: "Users",
        softDelete: false,
    }),

    worker_compliance_doc: defineEntity({
        entityName: "worker_compliance_doc",
        displayName: "Worker Compliance Document",
        displayNamePlural: "Worker Compliance Documents",
        table: "worker_compliance_docs",
        resource: "hr",
        slug: "worker-compliance-docs",
        searchColumns: ["document_name"],
        icon: "FileWarning",
    }),

    // ─── Brand ──────────────────────────────────────────────────

    brand: defineEntity({
        entityName: "brand",
        displayName: "Brand",
        displayNamePlural: "Brands",
        table: "brands",
        resource: "brand",
        slug: "brands",
        searchColumns: ["name"],
        icon: "Palette",
    }),

    // ─── System & Automation ────────────────────────────────────

    custom_field_definition: defineEntity({
        entityName: "custom_field_definition",
        displayName: "Custom Field Definition",
        displayNamePlural: "Custom Field Definitions",
        table: "custom_field_definitions",
        resource: "settings",
        slug: "custom-field-definitions",
        searchColumns: ["name", "label"],
        icon: "Settings2",
        softDelete: false,
    }),

    custom_field: defineEntity({
        entityName: "custom_field",
        displayName: "Custom Field",
        displayNamePlural: "Custom Fields",
        table: "custom_fields",
        resource: "settings",
        slug: "custom-fields",
        searchColumns: [],
        icon: "FormInput",
        softDelete: false,
    }),

    dashboard: defineEntity({
        entityName: "dashboard",
        displayName: "Dashboard",
        displayNamePlural: "Dashboards",
        table: "dashboards",
        resource: "dashboards",
        slug: "dashboards",
        searchColumns: ["name"],
        icon: "LayoutDashboard",
    }),

    automation_rule: defineEntity({
        entityName: "automation_rule",
        displayName: "Automation Rule",
        displayNamePlural: "Automation Rules",
        table: "automation_rules",
        resource: "automations",
        slug: "automation-rules",
        searchColumns: ["name"],
        icon: "Workflow",
    }),

    automation_execution: defineEntity({
        entityName: "automation_execution",
        displayName: "Automation Execution",
        displayNamePlural: "Automation Executions",
        table: "automation_executions",
        resource: "automations",
        slug: "automation-executions",
        searchColumns: [],
        icon: "Play",
        softDelete: false,
        trackAuthor: false,
    }),

    // ─── Finance ────────────────────────────────────────────────

    depreciation_schedule: defineEntity({
        entityName: "depreciation_schedule",
        displayName: "Depreciation Schedule",
        displayNamePlural: "Depreciation Schedules",
        table: "depreciation_schedules",
        resource: "finance",
        slug: "depreciation-schedules",
        searchColumns: [],
        icon: "TrendingDown",
        softDelete: false,
    }),

    // ─── Legal ──────────────────────────────────────────────────

    contract_amendment: defineEntity({
        entityName: "contract_amendment",
        displayName: "Contract Amendment",
        displayNamePlural: "Contract Amendments",
        table: "contract_amendments",
        resource: "contracts",
        slug: "contract-amendments",
        selectList: "*, contracts:contract_id(title)",
        selectDetail: "*, contracts:contract_id(title)",
        searchColumns: ["title", "description"],
        icon: "FilePen",
    }),

    legal_hold: defineEntity({
        entityName: "legal_hold",
        displayName: "Legal Hold",
        displayNamePlural: "Legal Holds",
        table: "legal_holds",
        resource: "contracts",
        slug: "legal-holds",
        searchColumns: ["name", "description"],
        icon: "Scale",
    }),

    // ─── Documents ──────────────────────────────────────────────

    document_version: defineEntity({
        entityName: "document_version",
        displayName: "Document Version",
        displayNamePlural: "Document Versions",
        table: "document_versions",
        resource: "documents",
        slug: "document-versions",
        searchColumns: [],
        icon: "FileClock",
        softDelete: false,
    }),

    // ─── Feedback ───────────────────────────────────────────────

    survey_template: defineEntity({
        entityName: "survey_template",
        displayName: "Survey Template",
        displayNamePlural: "Survey Templates",
        table: "survey_templates",
        resource: "surveys",
        slug: "survey-templates",
        searchColumns: ["title"],
        icon: "FileQuestion",
    }),

    survey_response: defineEntity({
        entityName: "survey_response",
        displayName: "Survey Response",
        displayNamePlural: "Survey Responses",
        table: "survey_responses",
        resource: "surveys",
        slug: "survey-responses",
        searchColumns: [],
        icon: "MessageCircle",
        softDelete: false,
    }),

    // ─── Storage ────────────────────────────────────────────────

    storage_object: defineEntity({
        entityName: "storage_object",
        displayName: "Storage Object",
        displayNamePlural: "Storage Objects",
        table: "storage_objects",
        resource: "storage",
        slug: "storage-objects",
        searchColumns: ["filename"],
        icon: "HardDrive",
        softDelete: false,
    }),

    // ─── Marketing ──────────────────────────────────────────────

    testimonial: defineEntity({
        entityName: "testimonial",
        displayName: "Testimonial",
        displayNamePlural: "Testimonials",
        table: "testimonials",
        resource: "marketing",
        slug: "testimonials",
        searchColumns: ["author_name", "content"],
        icon: "Quote",
    }),

    // ─── Vendors ────────────────────────────────────────────────

    vendor_communication: defineEntity({
        entityName: "vendor_communication",
        displayName: "Vendor Communication",
        displayNamePlural: "Vendor Communications",
        table: "vendor_communications",
        resource: "vendors",
        slug: "vendor-communications",
        selectList: "*, vendors:vendor_id(name)",
        selectDetail: "*, vendors:vendor_id(name)",
        searchColumns: ["subject"],
        icon: "Mail",
        softDelete: false,
    }),

    // ─── HR/Compliance ──────────────────────────────────────────

    hr_certification: defineEntity({
        entityName: "hr_certification",
        displayName: "Certification",
        displayNamePlural: "Certifications",
        table: "certifications",
        resource: "hr",
        slug: "certifications",
        searchColumns: ["name"],
        icon: "Award",
    }),

    // ─── CRM / Revenue ──────────────────────────────────────────

    account_health_score: defineEntity({
        entityName: "account_health_score",
        displayName: "Account Health Score",
        displayNamePlural: "Account Health Scores",
        table: "account_health_scores",
        resource: "companies",
        slug: "account-health-scores",
        selectList: "*, companies:company_id(name)",
        selectDetail: "*, companies:company_id(name)",
        searchColumns: ["notes"],
        icon: "HeartPulse",
        softDelete: false,
        trackAuthor: false,
    }),

    // ─── Workflows ───────────────────────────────────────────────

    approval_workflow: defineEntity({
        entityName: "approval_workflow",
        displayName: "Approval Workflow",
        displayNamePlural: "Approval Workflows",
        table: "approval_workflows",
        resource: "approvals",
        slug: "approval-workflows",
        searchColumns: ["name", "description"],
        icon: "GitBranch",
        statusColumn: "status",
    }),

    // ─── Catalog ─────────────────────────────────────────────────

    catalog_category: defineEntity({
        entityName: "catalog_category",
        displayName: "Catalog Category",
        displayNamePlural: "Catalog Categories",
        table: "catalog_categories",
        resource: "catalog",
        slug: "catalog-categories",
        searchColumns: ["name", "description"],
        icon: "LayoutGrid",
    }),

    catalog_item: defineEntity({
        entityName: "catalog_item",
        displayName: "Catalog Item",
        displayNamePlural: "Catalog Items",
        table: "catalog_items",
        resource: "catalog",
        slug: "catalog-items",
        searchColumns: ["name", "description", "sku"],
        icon: "Package",
        statusColumn: "status",
    }),

    // ─── Messaging / Comms ───────────────────────────────────────

    channel_template: defineEntity({
        entityName: "channel_template",
        displayName: "Channel Template",
        displayNamePlural: "Channel Templates",
        table: "channel_templates",
        resource: "messaging",
        slug: "channel-templates",
        searchColumns: ["name", "event_type"],
        icon: "Radio",
    }),

    comm_channel: defineEntity({
        entityName: "comm_channel",
        displayName: "Comm Channel",
        displayNamePlural: "Comm Channels",
        table: "comm_channels",
        resource: "live_ops",
        slug: "comm-channels",
        selectList: "*, live_event_instances:live_event_id(name)",
        selectDetail: "*, live_event_instances:live_event_id(name)",
        searchColumns: ["name", "assignment"],
        icon: "Radio",
        softDelete: false,
    }),

    // ─── Live Ops ────────────────────────────────────────────────

    command_position: defineEntity({
        entityName: "command_position",
        displayName: "Command Position",
        displayNamePlural: "Command Positions",
        table: "command_positions",
        resource: "live_ops",
        slug: "command-positions",
        selectList: "*, profiles:profile_id(name), live_event_instances:live_event_id(name)",
        selectDetail:
            "*, profiles:profile_id(name, avatar_url), live_event_instances:live_event_id(name)",
        searchColumns: ["radio_callsign", "custom_label"],
        icon: "Shield",
        softDelete: false,
    }),

    environmental_reading: defineEntity({
        entityName: "environmental_reading",
        displayName: "Environmental Reading",
        displayNamePlural: "Environmental Readings",
        table: "environmental_readings",
        resource: "live_ops",
        slug: "environmental-readings",
        selectList: "*, live_event_instances:live_event_id(name)",
        selectDetail: "*, live_event_instances:live_event_id(name), profiles:recorded_by(name)",
        searchColumns: ["notes"],
        icon: "Thermometer",
        softDelete: false,
        trackAuthor: false,
    }),

    equipment_check_in: defineEntity({
        entityName: "equipment_check_in",
        displayName: "Equipment Check-In",
        displayNamePlural: "Equipment Check-Ins",
        table: "equipment_check_ins",
        resource: "live_ops",
        slug: "equipment-check-ins",
        selectList: "*, assets:asset_id(name), live_event_instances:live_event_id(name)",
        selectDetail:
            "*, assets:asset_id(name, category), live_event_instances:live_event_id(name), profiles:checked_in_by(name)",
        searchColumns: ["condition_notes", "deployed_location"],
        icon: "ClipboardCheck",
        statusColumn: "status",
        softDelete: false,
    }),

    // ─── Workforce / Compliance ──────────────────────────────────

    compliance_template: defineEntity({
        entityName: "compliance_template",
        displayName: "Compliance Template",
        displayNamePlural: "Compliance Templates",
        table: "compliance_templates",
        resource: "compliance",
        slug: "compliance-templates",
        searchColumns: ["name", "description"],
        icon: "FileCheck",
    }),

    engagement_term: defineEntity({
        entityName: "engagement_term",
        displayName: "Engagement Term",
        displayNamePlural: "Engagement Terms",
        table: "engagement_terms",
        resource: "workforce",
        slug: "engagement-terms",
        selectList: "*, worker_profiles:worker_profile_id(display_name), projects:project_id(name)",
        selectDetail:
            "*, worker_profiles:worker_profile_id(display_name), projects:project_id(name), contracts:contract_id(name)",
        searchColumns: ["role", "billing_code"],
        icon: "Handshake",
        statusColumn: "status",
    }),

    time_tracking_policy: defineEntity({
        entityName: "time_tracking_policy",
        displayName: "Time Tracking Policy",
        displayNamePlural: "Time Tracking Policies",
        table: "time_tracking_policies",
        resource: "time_tracking",
        slug: "time-tracking-policies",
        searchColumns: [],
        icon: "Clock",
        softDelete: false,
        trackAuthor: false,
    }),

    // ─── Email ───────────────────────────────────────────────────

    email_message: defineEntity({
        entityName: "email_message",
        displayName: "Email Message",
        displayNamePlural: "Email Messages",
        table: "email_messages",
        resource: "messaging",
        slug: "email-messages",
        searchColumns: ["subject", "from_address", "body_text"],
        icon: "Mail",
        softDelete: false,
        trackAuthor: false,
    }),

    // ─── Assets / Logistics ──────────────────────────────────────

    inventory_reservation: defineEntity({
        entityName: "inventory_reservation",
        displayName: "Inventory Reservation",
        displayNamePlural: "Inventory Reservations",
        table: "inventory_reservations",
        resource: "assets",
        slug: "inventory-reservations",
        selectList: "*, assets:asset_id(name), projects:project_id(name)",
        selectDetail:
            "*, assets:asset_id(name), projects:project_id(name), profiles:reserved_by(name)",
        searchColumns: ["notes"],
        icon: "CalendarClock",
        statusColumn: "status",
        softDelete: false,
    }),

    logistics_event: defineEntity({
        entityName: "logistics_event",
        displayName: "Logistics Event",
        displayNamePlural: "Logistics Events",
        table: "logistics_events",
        resource: "shipments",
        slug: "logistics-events",
        selectList: "*, shipments:shipment_id(name)",
        selectDetail: "*, shipments:shipment_id(name), profiles:reported_by(name)",
        searchColumns: ["notes", "location_text"],
        icon: "Truck",
        softDelete: false,
        trackAuthor: false,
    }),

    maintenance_schedule: defineEntity({
        entityName: "maintenance_schedule",
        displayName: "Maintenance Schedule",
        displayNamePlural: "Maintenance Schedules",
        table: "maintenance_schedules",
        resource: "assets",
        slug: "maintenance-schedules",
        selectList: "*, assets:asset_id(name)",
        selectDetail: "*, assets:asset_id(name, category)",
        searchColumns: ["name", "description"],
        icon: "Wrench",
    }),

    // ─── Knowledge Base ──────────────────────────────────────────

    knowledge_article: defineEntity({
        entityName: "knowledge_article",
        displayName: "Knowledge Article",
        displayNamePlural: "Knowledge Articles",
        table: "knowledge_articles",
        resource: "knowledge_base",
        slug: "knowledge-articles",
        selectList: "*, profiles:author_id(name)",
        selectDetail: "*, profiles:author_id(name, avatar_url)",
        searchColumns: ["title", "body"],
        icon: "BookOpen",
        statusColumn: "status",
    }),

    // ─── Finance ─────────────────────────────────────────────────

    revenue_recognition_entry: defineEntity({
        entityName: "revenue_recognition_entry",
        displayName: "Revenue Recognition Entry",
        displayNamePlural: "Revenue Recognition Entries",
        table: "revenue_recognition_entries",
        resource: "finance",
        slug: "revenue-recognition-entries",
        selectList: "*, projects:project_id(name)",
        selectDetail: "*, projects:project_id(name)",
        searchColumns: ["notes"],
        icon: "TrendingUp",
        softDelete: false,
    }),

    pos_transaction: defineEntity({
        entityName: "pos_transaction",
        displayName: "POS Transaction",
        displayNamePlural: "POS Transactions",
        table: "pos_transactions",
        resource: "finance",
        slug: "pos-transactions",
        selectList: "*, events:event_id(name), vendors:vendor_id(name)",
        selectDetail:
            "*, events:event_id(name), vendors:vendor_id(name), provider_connections:connection_id(provider_name)",
        searchColumns: ["operator_name", "terminal_id"],
        icon: "CreditCard",
        softDelete: false,
        trackAuthor: false,
    }),

    // ─── SLA / Service ───────────────────────────────────────────

    sla_policy: defineEntity({
        entityName: "sla_policy",
        displayName: "SLA Policy",
        displayNamePlural: "SLA Policies",
        table: "sla_policies",
        resource: "service_requests",
        slug: "sla-policies",
        searchColumns: ["name", "description"],
        icon: "Timer",
    }),

    // ─── Pricing / Upsell ────────────────────────────────────────

    upsell_trigger: defineEntity({
        entityName: "upsell_trigger",
        displayName: "Upsell Trigger",
        displayNamePlural: "Upsell Triggers",
        table: "upsell_triggers",
        resource: "settings",
        slug: "upsell-triggers",
        searchColumns: ["name", "description"],
        icon: "Zap",
        softDelete: false,
        trackAuthor: false,
    }),

    upsell_event: defineEntity({
        entityName: "upsell_event",
        displayName: "Upsell Event",
        displayNamePlural: "Upsell Events",
        table: "upsell_events",
        resource: "settings",
        slug: "upsell-events",
        selectList: "*, upsell_triggers:trigger_id(name)",
        selectDetail: "*, upsell_triggers:trigger_id(name)",
        searchColumns: [],
        icon: "TrendingUp",
        softDelete: false,
        trackAuthor: false,
    }),
};

// ─── Lookups ─────────────────────────────────────────────────

/**
 * Get entity config by name. Supports snake_case and kebab-case.
 */
export function getEntityConfig(entityName: string): EntityConfig | undefined {
    const normalized = entityName.toLowerCase().replace(/-/g, "_");
    return ENTITY_CONFIGS[normalized];
}

/**
 * Get entity config by URL slug.
 */
export function getEntityConfigBySlug(slug: string): EntityConfig | undefined {
    return Object.values(ENTITY_CONFIGS).find((c) => c.slug === slug);
}

/**
 * Get a CrudConfig by entity name. Throws if entity is not registered.
 * Designed for use in API route files where the entity is guaranteed to exist.
 */
export function getEntityCrudConfig(entityName: string): CrudConfig {
    const entity = getEntityConfig(entityName);
    if (!entity) {
        throw new Error(`Entity "${entityName}" not found in ENTITY_CONFIGS registry`);
    }
    return toCrudConfig(entity);
}

/**
 * Convert EntityConfig to CrudConfig for the CRUD factory.
 */
export function toCrudConfig(entity: EntityConfig): CrudConfig {
    return {
        table: entity.table,
        resource: entity.resource,
        displayName: entity.displayName,
        selectList: entity.selectList,
        selectDetail: entity.selectDetail,
        createSchema: entity.createSchema,
        updateSchema: entity.updateSchema,
        searchColumns: entity.searchColumns,
        stateMachine: entity.stateMachine,
        statusColumn: entity.statusColumn,
        softDelete: entity.softDelete,
        trackAuthor: entity.trackAuthor,
    };
}
