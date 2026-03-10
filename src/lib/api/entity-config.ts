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
    ASSET_MACHINE,
    CHANGE_ORDER_MACHINE,
    CONTRACT_MACHINE,
    CREW_SHIFT_MACHINE,
    DEAL_MACHINE,
    DOCUMENT_MACHINE,
    ESTIMATE_MACHINE,
    EXPENSE_MACHINE,
    INCIDENT_MACHINE,
    INVOICE_MACHINE,
    LIVE_EVENT_MACHINE,
    MILESTONE_MACHINE,
    OPPORTUNITY_MACHINE,
    PROJECT_MACHINE,
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
        selectList: "*, profiles:manager_id(name)",
        selectDetail:
            "*, profiles:manager_id(name, avatar_url), project_members(profile_id, profiles(name, email, avatar_url))",
        searchColumns: ["name", "description", "client_name"],
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
        selectDetail: "*, user_profiles:created_by(display_name, avatar_url), team_members(id, user_id, role, joined_at, user_profiles(display_name, avatar_url, email))",
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
