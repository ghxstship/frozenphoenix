// ═══════════════════════════════════════════════════════════════════════════
// ATLVS — Production Domain Configuration
// Single Source of Truth for all production lifecycle enums, labels, and mappings
// ═══════════════════════════════════════════════════════════════════════════

import type { LucideIcon } from "lucide-react";
import {
    Activity,
    AlertTriangle,
    Archive,
    BookOpen,
    Building,
    Calendar,
    CheckCircle,
    Clock,
    CreditCard,
    DollarSign,
    Eye,
    FileText,
    FolderKanban,
    Hammer,
    HardHat,
    MapPin,
    Package,
    Pause,
    Play,
    Printer,
    Receipt,
    Send,
    Shield,
    Sparkles,
    Truck,
    Users,
    Utensils,
    Warehouse as WarehouseIcon,
    Wrench,
    XCircle,
    Zap,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT HIERARCHY CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export const PROJECT_TYPE_CONFIG = {
    tour: { label: "Tour", icon: "truck", color: "primary" },
    festival: { label: "Festival", icon: "music", color: "accent" },
    activation: { label: "Brand Activation", icon: "sparkles", color: "success" },
    installation: { label: "Installation", icon: "box", color: "info" },
    broadcast: { label: "Broadcast", icon: "tv", color: "warning" },
    corporate: { label: "Corporate Event", icon: "building", color: "secondary" },
    retail: { label: "Retail", icon: "store", color: "primary" },
    experiential: { label: "Experiential", icon: "star", color: "accent" },
} as const;

export const PROJECT_STATUS_CONFIG = {
    draft: { label: "Draft", variant: "secondary", icon: FileText },
    planning: { label: "Planning", variant: "info", icon: Calendar },
    pre_production: { label: "Pre-Production", variant: "warning", icon: Wrench },
    in_production: { label: "In Production", variant: "success", icon: Play },
    wrap: { label: "Wrap", variant: "info", icon: Archive },
    completed: { label: "Completed", variant: "success", icon: CheckCircle },
    cancelled: { label: "Cancelled", variant: "destructive", icon: XCircle },
    on_hold: { label: "On Hold", variant: "warning", icon: Pause },
} as const;

export const PRODUCTION_PHASE_CONFIG = {
    discovery: { label: "Discovery", order: 1, color: "hsl(var(--chart-2))" },
    design: { label: "Design", order: 2, color: "hsl(var(--chart-7))" },
    pre_production: { label: "Pre-Production", order: 3, color: "hsl(var(--chart-8))" },
    procurement: { label: "Procurement", order: 4, color: "hsl(var(--chart-4))" },
    fabrication: { label: "Fabrication", order: 5, color: "hsl(var(--chart-1))" },
    logistics: { label: "Logistics", order: 6, color: "hsl(var(--chart-2))" },
    load_in: { label: "Load In", order: 7, color: "hsl(var(--chart-6))" },
    rehearsal: { label: "Rehearsal", order: 8, color: "hsl(var(--chart-3))" },
    show: { label: "Show", order: 9, color: "hsl(var(--chart-5))" },
    strike: { label: "Strike", order: 10, color: "hsl(var(--chart-2))" },
    load_out: { label: "Load Out", order: 11, color: "hsl(var(--chart-2))" },
    wrap: { label: "Wrap", order: 12, color: "hsl(var(--chart-4))" },
} as const;

export const LOCATION_TYPE_CONFIG = {
    venue: { label: "Venue", icon: Building },
    warehouse: { label: "Warehouse", icon: WarehouseIcon },
    office: { label: "Office", icon: Building },
    fabrication_shop: { label: "Fabrication Shop", icon: Hammer },
    staging_area: { label: "Staging Area", icon: Package },
    hotel: { label: "Hotel", icon: Building },
    airport: { label: "Airport", icon: Building },
    other: { label: "Other", icon: MapPin },
} as const;

export const ACTIVATION_TYPE_CONFIG = {
    booth: { label: "Booth", icon: "box" },
    stage: { label: "Stage", icon: "mic" },
    installation: { label: "Installation", icon: "box" },
    pop_up: { label: "Pop-Up", icon: "store" },
    mobile: { label: "Mobile", icon: "truck" },
    digital: { label: "Digital", icon: "monitor" },
    hybrid: { label: "Hybrid", icon: "layers" },
} as const;

export const EVENT_TYPE_CONFIG = {
    show: { label: "Show", variant: "success", icon: Play },
    rehearsal: { label: "Rehearsal", variant: "warning", icon: Clock },
    setup: { label: "Setup", variant: "info", icon: Wrench },
    strike: { label: "Strike", variant: "secondary", icon: Package },
    meeting: { label: "Meeting", variant: "default", icon: Users },
    walkthrough: { label: "Walkthrough", variant: "info", icon: Eye },
    training: { label: "Training", variant: "warning", icon: BookOpen },
    press: { label: "Press", variant: "accent", icon: FileText },
    vip: { label: "VIP", variant: "primary", icon: Shield },
} as const;

export const ACTIVITY_TYPE_CONFIG = {
    performance: { label: "Performance", icon: "mic" },
    presentation: { label: "Presentation", icon: "presentation" },
    demo: { label: "Demo", icon: "play" },
    sampling: { label: "Sampling", icon: "gift" },
    photo_op: { label: "Photo Op", icon: "camera" },
    game: { label: "Game", icon: "gamepad" },
    workshop: { label: "Workshop", icon: "wrench" },
    meet_greet: { label: "Meet & Greet", icon: "users" },
    other: { label: "Other", icon: "circle" },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT MANAGEMENT CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export const DEPARTMENT_CONFIG = {
    production: { label: "Production", icon: FolderKanban, color: "hsl(var(--chart-2))" },
    construction: { label: "Construction", icon: Hammer, color: "hsl(var(--chart-8))" },
    technical: { label: "Technical", icon: Zap, color: "hsl(var(--chart-1))" },
    fabrication: { label: "Fabrication", icon: Wrench, color: "hsl(var(--chart-4))" },
    print: { label: "Print", icon: Printer, color: "hsl(var(--chart-7))" },
    scenic: { label: "Scenic", icon: Sparkles, color: "hsl(var(--chart-2))" },
    props: { label: "Props", icon: Package, color: "hsl(var(--chart-6))" },
    av: { label: "AV", icon: Zap, color: "hsl(var(--chart-5))" },
    lighting: { label: "Lighting", icon: Zap, color: "hsl(var(--chart-3))" },
    rigging: { label: "Rigging", icon: HardHat, color: "hsl(var(--chart-2))" },
    food_beverage: { label: "Food & Beverage", icon: Utensils, color: "hsl(var(--chart-4))" },
    staffing: { label: "Staffing", icon: Users, color: "hsl(var(--chart-1))" },
    logistics: { label: "Logistics", icon: Truck, color: "hsl(var(--chart-2))" },
    finance: { label: "Finance", icon: DollarSign, color: "hsl(var(--chart-4))" },
    creative: { label: "Creative", icon: Sparkles, color: "hsl(var(--chart-7))" },
} as const;

// TASK_STATUS_CONFIG and TASK_PRIORITY_CONFIG have been consolidated into
// @/config/domain-config (TASK_STATUS_MAP, TASK_PRIORITY_MAP) as part of
// 3NF/SSOT remediation. Import from domain-config instead.

// ─────────────────────────────────────────────────────────────────────────────
// PROCUREMENT CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export const PROCUREMENT_STATUS_CONFIG = {
    draft: { label: "Draft", variant: "secondary", icon: FileText },
    pending_approval: { label: "Pending Approval", variant: "warning", icon: Clock },
    approved: { label: "Approved", variant: "success", icon: CheckCircle },
    sent: { label: "Sent", variant: "info", icon: Send },
    acknowledged: { label: "Acknowledged", variant: "info", icon: Eye },
    in_progress: { label: "In Progress", variant: "info", icon: Play },
    shipped: { label: "Shipped", variant: "info", icon: Truck },
    received: { label: "Received", variant: "success", icon: Package },
    completed: { label: "Completed", variant: "success", icon: CheckCircle },
    cancelled: { label: "Cancelled", variant: "destructive", icon: XCircle },
    disputed: { label: "Disputed", variant: "destructive", icon: AlertTriangle },
} as const;

export const CONTRACT_TYPE_CONFIG = {
    vendor: { label: "Vendor Agreement", icon: "file-text" },
    client: { label: "Client Contract", icon: "file-signature" },
    venue: { label: "Venue Contract", icon: "building" },
    talent: { label: "Talent Agreement", icon: "user" },
    sponsor: { label: "Sponsorship Agreement", icon: "star" },
    nda: { label: "NDA", icon: "shield" },
    other: { label: "Other", icon: "file" },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// PERSONNEL CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export const EMPLOYMENT_TYPE_CONFIG = {
    employee: { label: "Employee", variant: "success" },
    contractor: { label: "Contractor", variant: "info" },
    freelance: { label: "Freelance", variant: "warning" },
    temp: { label: "Temporary", variant: "secondary" },
    intern: { label: "Intern", variant: "default" },
    volunteer: { label: "Volunteer", variant: "accent" },
} as const;

export const CREW_STATUS_CONFIG = {
    active: { label: "Active", variant: "success" },
    inactive: { label: "Inactive", variant: "secondary" },
    on_leave: { label: "On Leave", variant: "warning" },
    terminated: { label: "Terminated", variant: "destructive" },
    do_not_rehire: { label: "Do Not Rehire", variant: "destructive" },
} as const;

export const SHIFT_STATUS_CONFIG = {
    scheduled: { label: "Scheduled", variant: "default" },
    confirmed: { label: "Confirmed", variant: "info" },
    checked_in: { label: "Checked In", variant: "success" },
    on_break: { label: "On Break", variant: "warning" },
    checked_out: { label: "Checked Out", variant: "secondary" },
    no_show: { label: "No Show", variant: "destructive" },
    cancelled: { label: "Cancelled", variant: "destructive" },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// INVENTORY CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export const ASSET_CATEGORY_CONFIG = {
    staging: { label: "Staging", icon: "box" },
    lighting: { label: "Lighting", icon: "lightbulb" },
    audio: { label: "Audio", icon: "speaker" },
    video: { label: "Video", icon: "monitor" },
    rigging: { label: "Rigging", icon: "anchor" },
    scenic: { label: "Scenic", icon: "image" },
    props: { label: "Props", icon: "package" },
    furniture: { label: "Furniture", icon: "armchair" },
    tools: { label: "Tools", icon: "wrench" },
    vehicles: { label: "Vehicles", icon: "truck" },
    technology: { label: "Technology", icon: "cpu" },
    safety: { label: "Safety", icon: "shield" },
    other: { label: "Other", icon: "circle" },
} as const;

export const ASSET_CONDITION_CONFIG = {
    new: { label: "New", variant: "success", order: 0 },
    excellent: { label: "Excellent", variant: "success", order: 1 },
    good: { label: "Good", variant: "info", order: 2 },
    fair: { label: "Fair", variant: "warning", order: 3 },
    needs_repair: { label: "Needs Repair", variant: "destructive", order: 4 },
    decommissioned: { label: "Decommissioned", variant: "secondary", order: 5 },
} as const;

export const ASSET_OWNERSHIP_CONFIG = {
    owned: { label: "Owned", variant: "success" },
    rental: { label: "Rental", variant: "warning" },
    client_provided: { label: "Client Provided", variant: "info" },
    vendor_provided: { label: "Vendor Provided", variant: "info" },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// LOGISTICS CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export const SHIPMENT_TYPE_CONFIG = {
    outbound: { label: "Outbound", icon: Send, color: "hsl(var(--chart-1))" },
    inbound: { label: "Inbound", icon: Package, color: "hsl(var(--chart-4))" },
    transfer: { label: "Transfer", icon: Truck, color: "hsl(var(--chart-8))" },
    return: { label: "Return", icon: Archive, color: "hsl(var(--chart-2))" },
} as const;

export const SHIPMENT_STATUS_CONFIG = {
    planning: { label: "Planning", variant: "secondary" },
    booked: { label: "Booked", variant: "info" },
    picked_up: { label: "Picked Up", variant: "info" },
    in_transit: { label: "In Transit", variant: "warning" },
    out_for_delivery: { label: "Out for Delivery", variant: "warning" },
    delivered: { label: "Delivered", variant: "success" },
    exception: { label: "Exception", variant: "destructive" },
    cancelled: { label: "Cancelled", variant: "destructive" },
} as const;

export const VEHICLE_TYPE_CONFIG = {
    box_truck: { label: "Box Truck", capacity: "typical 1500-2500 lbs" },
    semi: { label: "Semi Truck", capacity: "typical 40,000+ lbs" },
    sprinter: { label: "Sprinter Van", capacity: "typical 2500-3500 lbs" },
    pickup: { label: "Pickup Truck", capacity: "typical 1000-2000 lbs" },
    trailer: { label: "Trailer", capacity: "varies" },
    forklift: { label: "Forklift", capacity: "varies" },
    other: { label: "Other", capacity: "varies" },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// FINANCE CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export const BUDGET_CATEGORY_CONFIG = {
    labor: { label: "Labor", group: "People", icon: Users },
    materials: { label: "Materials", group: "Production", icon: Package },
    equipment_rental: { label: "Equipment Rental", group: "Production", icon: Wrench },
    equipment_purchase: { label: "Equipment Purchase", group: "Production", icon: Package },
    fabrication: { label: "Fabrication", group: "Production", icon: Hammer },
    print: { label: "Print", group: "Production", icon: Printer },
    av: { label: "AV", group: "Technical", icon: Zap },
    lighting: { label: "Lighting", group: "Technical", icon: Zap },
    scenic: { label: "Scenic", group: "Production", icon: Sparkles },
    travel: { label: "Travel", group: "Travel", icon: Truck },
    lodging: { label: "Lodging", group: "Travel", icon: Building },
    per_diem: { label: "Per Diem", group: "Travel", icon: DollarSign },
    shipping: { label: "Shipping", group: "Logistics", icon: Truck },
    trucking: { label: "Trucking", group: "Logistics", icon: Truck },
    venue: { label: "Venue", group: "Venue", icon: Building },
    permits: { label: "Permits", group: "Venue", icon: FileText },
    insurance: { label: "Insurance", group: "Admin", icon: Shield },
    talent: { label: "Talent", group: "People", icon: Users },
    catering: { label: "Catering", group: "People", icon: Utensils },
    staffing: { label: "Staffing", group: "People", icon: Users },
    security: { label: "Security", group: "Venue", icon: Shield },
    contingency: { label: "Contingency", group: "Admin", icon: AlertTriangle },
    overhead: { label: "Overhead", group: "Admin", icon: DollarSign },
    markup: { label: "Markup", group: "Admin", icon: DollarSign },
} as const;

export const EXPENSE_STATUS_CONFIG = {
    draft: { label: "Draft", variant: "secondary" },
    submitted: { label: "Submitted", variant: "info" },
    pending_approval: { label: "Pending Approval", variant: "warning" },
    approved: { label: "Approved", variant: "success" },
    rejected: { label: "Rejected", variant: "destructive" },
    reimbursed: { label: "Reimbursed", variant: "success" },
} as const;

export const INVOICE_STATUS_CONFIG = {
    draft: { label: "Draft", variant: "secondary" },
    sent: { label: "Sent", variant: "info" },
    viewed: { label: "Viewed", variant: "info" },
    partial: { label: "Partial Payment", variant: "warning" },
    paid: { label: "Paid", variant: "success" },
    overdue: { label: "Overdue", variant: "destructive" },
    disputed: { label: "Disputed", variant: "destructive" },
    void: { label: "Void", variant: "secondary" },
} as const;

export const PAYMENT_METHOD_CONFIG = {
    corporate_card: { label: "Corporate Card", icon: CreditCard },
    personal_card: { label: "Personal Card", icon: CreditCard },
    cash: { label: "Cash", icon: DollarSign },
    check: { label: "Check", icon: Receipt },
    wire: { label: "Wire Transfer", icon: Send },
    ach: { label: "ACH", icon: Send },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// INCIDENTS CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export const INCIDENT_TYPE_CONFIG = {
    safety: { label: "Safety", icon: Shield, color: "hsl(var(--chart-5))" },
    injury: { label: "Injury", icon: AlertTriangle, color: "hsl(var(--destructive))" },
    property_damage: {
        label: "Property Damage",
        icon: AlertTriangle,
        color: "hsl(var(--chart-8))",
    },
    theft: { label: "Theft", icon: AlertTriangle, color: "hsl(var(--chart-5))" },
    security: { label: "Security", icon: Shield, color: "hsl(var(--chart-8))" },
    weather: { label: "Weather", icon: AlertTriangle, color: "hsl(var(--chart-1))" },
    equipment_failure: { label: "Equipment Failure", icon: Wrench, color: "hsl(var(--chart-8))" },
    vendor_issue: { label: "Vendor Issue", icon: AlertTriangle, color: "hsl(var(--chart-8))" },
    client_complaint: {
        label: "Client Complaint",
        icon: AlertTriangle,
        color: "hsl(var(--chart-8))",
    },
    other: { label: "Other", icon: AlertTriangle, color: "hsl(var(--muted-foreground))" },
} as const;

export const INCIDENT_SEVERITY_CONFIG = {
    minor: { label: "Minor", variant: "secondary", color: "hsl(var(--muted-foreground))" },
    moderate: { label: "Moderate", variant: "warning", color: "hsl(var(--warning))" },
    major: { label: "Major", variant: "destructive", color: "hsl(var(--chart-5))" },
    critical: { label: "Critical", variant: "destructive", color: "hsl(var(--destructive))" },
} as const;

export const INCIDENT_STATUS_CONFIG = {
    reported: { label: "Reported", variant: "info" },
    investigating: { label: "Investigating", variant: "warning" },
    pending_action: { label: "Pending Action", variant: "warning" },
    resolved: { label: "Resolved", variant: "success" },
    closed: { label: "Closed", variant: "secondary" },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE BASE CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export const DOCUMENT_CATEGORY_CONFIG = {
    sop: { label: "SOP", icon: FileText },
    template: { label: "Template", icon: FileText },
    checklist: { label: "Checklist", icon: CheckCircle },
    guide: { label: "Guide", icon: BookOpen },
    policy: { label: "Policy", icon: Shield },
    form: { label: "Form", icon: FileText },
    reference: { label: "Reference", icon: BookOpen },
    training: { label: "Training", icon: BookOpen },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// ENTITY RELATIONSHIP MAP — For linked records navigation
// ─────────────────────────────────────────────────────────────────────────────

export interface EntityRelationship {
    entity: string;
    label: string;
    pluralLabel: string;
    icon: LucideIcon;
    path: string;
    parentEntities: string[];
    childEntities: string[];
    relatedEntities: string[];
}

export const ENTITY_RELATIONSHIP_MAP: Record<string, EntityRelationship> = {
    project: {
        entity: "project",
        label: "Project",
        pluralLabel: "Projects",
        icon: FolderKanban,
        path: "/projects",
        parentEntities: ["deal", "client"],
        childEntities: [
            "location",
            "activation",
            "event",
            "task",
            "milestone",
            "budget",
            "shipment",
            "incident",
        ],
        relatedEntities: ["crew_member", "vendor", "asset", "purchase_order", "invoice"],
    },
    location: {
        entity: "location",
        label: "Location",
        pluralLabel: "Locations",
        icon: MapPin,
        path: "/locations",
        parentEntities: ["project"],
        childEntities: ["activation", "event"],
        relatedEntities: ["shipment", "asset"],
    },
    activation: {
        entity: "activation",
        label: "Activation",
        pluralLabel: "Activations",
        icon: Sparkles,
        path: "/activations",
        parentEntities: ["project", "location"],
        childEntities: ["event", "activity", "task"],
        relatedEntities: ["asset", "crew_member", "vendor"],
    },
    event: {
        entity: "event",
        label: "Event",
        pluralLabel: "Events",
        icon: Calendar,
        path: "/events",
        parentEntities: ["project", "location", "activation"],
        childEntities: ["activity", "shift"],
        relatedEntities: ["crew_member", "asset"],
    },
    activity: {
        entity: "activity",
        label: "Activity",
        pluralLabel: "Activities",
        icon: Activity,
        path: "/activities",
        parentEntities: ["event", "activation"],
        childEntities: [],
        relatedEntities: ["crew_member", "asset", "consumable"],
    },
    task: {
        entity: "task",
        label: "Task",
        pluralLabel: "Tasks",
        icon: CheckCircle,
        path: "/tasks",
        parentEntities: ["project", "milestone", "activation"],
        childEntities: ["task"],
        relatedEntities: ["crew_member", "vendor", "asset", "purchase_order"],
    },
    crew_member: {
        entity: "crew_member",
        label: "Crew Member",
        pluralLabel: "Crew",
        icon: Users,
        path: "/crew",
        parentEntities: [],
        childEntities: ["shift", "time_entry"],
        relatedEntities: ["project", "task", "event"],
    },
    vendor: {
        entity: "vendor",
        label: "Vendor",
        pluralLabel: "Vendors",
        icon: Building,
        path: "/vendors",
        parentEntities: [],
        childEntities: ["purchase_order", "invoice", "contract"],
        relatedEntities: ["project", "task", "asset"],
    },
    asset: {
        entity: "asset",
        label: "Asset",
        pluralLabel: "Assets",
        icon: Package,
        path: "/assets",
        parentEntities: ["warehouse"],
        childEntities: ["maintenance_record"],
        relatedEntities: ["project", "activation", "shipment"],
    },
    purchase_order: {
        entity: "purchase_order",
        label: "Purchase Order",
        pluralLabel: "Purchase Orders",
        icon: Receipt,
        path: "/procurement/purchase-orders",
        parentEntities: ["project", "vendor"],
        childEntities: ["invoice", "shipment"],
        relatedEntities: ["task", "budget_line"],
    },
    shipment: {
        entity: "shipment",
        label: "Shipment",
        pluralLabel: "Shipments",
        icon: Truck,
        path: "/logistics/shipments",
        parentEntities: ["project", "purchase_order"],
        childEntities: [],
        relatedEntities: ["asset", "location", "vehicle"],
    },
    incident: {
        entity: "incident",
        label: "Incident",
        pluralLabel: "Incidents",
        icon: AlertTriangle,
        path: "/incidents",
        parentEntities: ["project", "location"],
        childEntities: ["task"],
        relatedEntities: ["crew_member"],
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// WHO/WHAT/WHEN/WHERE/WHY/HOW/IF-THEN FIELD MAPPINGS
// ─────────────────────────────────────────────────────────────────────────────

export type FieldCategory =
    | "who"
    | "what"
    | "when"
    | "where"
    | "why"
    | "how"
    | "if_then"
    | "relationships";

export interface FieldMapping {
    field: string;
    label: string;
    category: FieldCategory;
    type:
        | "text"
        | "number"
        | "date"
        | "datetime"
        | "currency"
        | "select"
        | "multiselect"
        | "reference"
        | "boolean"
        | "textarea";
    referenceEntity?: string | undefined;
    required?: boolean | undefined;
    editable?: boolean | undefined;
}

export const ENTITY_FIELD_MAPPINGS: Record<string, FieldMapping[]> = {
    project: [
        {
            field: "clientId",
            label: "Client",
            category: "who",
            type: "reference",
            referenceEntity: "client",
            required: true,
        },
        {
            field: "accountManagerId",
            label: "Account Manager",
            category: "who",
            type: "reference",
            referenceEntity: "crew_member",
        },
        {
            field: "projectManagerId",
            label: "Project Manager",
            category: "who",
            type: "reference",
            referenceEntity: "crew_member",
        },
        {
            field: "teamIds",
            label: "Team Members",
            category: "who",
            type: "multiselect",
            referenceEntity: "crew_member",
        },
        { field: "name", label: "Project Name", category: "what", type: "text", required: true },
        { field: "type", label: "Project Type", category: "what", type: "select" },
        { field: "description", label: "Description", category: "what", type: "textarea" },
        { field: "scope", label: "Scope", category: "what", type: "textarea" },
        { field: "startDate", label: "Start Date", category: "when", type: "date", required: true },
        { field: "endDate", label: "End Date", category: "when", type: "date", required: true },
        { field: "loadInDate", label: "Load In Date", category: "when", type: "date" },
        { field: "loadOutDate", label: "Load Out Date", category: "when", type: "date" },
        {
            field: "primaryLocationId",
            label: "Primary Location",
            category: "where",
            type: "reference",
            referenceEntity: "location",
        },
        { field: "objectives", label: "Objectives", category: "why", type: "textarea" },
        { field: "successMetrics", label: "Success Metrics", category: "why", type: "textarea" },
        { field: "budget", label: "Budget", category: "how", type: "currency", required: true },
        { field: "status", label: "Status", category: "how", type: "select" },
        { field: "riskLevel", label: "Risk Level", category: "if_then", type: "select" },
        {
            field: "contingencyPercent",
            label: "Contingency %",
            category: "if_then",
            type: "number",
        },
    ],
    task: [
        {
            field: "assigneeId",
            label: "Assignee",
            category: "who",
            type: "reference",
            referenceEntity: "crew_member",
        },
        {
            field: "reviewerId",
            label: "Reviewer",
            category: "who",
            type: "reference",
            referenceEntity: "crew_member",
        },
        {
            field: "vendorId",
            label: "Vendor",
            category: "who",
            type: "reference",
            referenceEntity: "vendor",
        },
        { field: "title", label: "Title", category: "what", type: "text", required: true },
        { field: "description", label: "Description", category: "what", type: "textarea" },
        { field: "deliverables", label: "Deliverables", category: "what", type: "textarea" },
        { field: "startDate", label: "Start Date", category: "when", type: "date" },
        { field: "dueDate", label: "Due Date", category: "when", type: "date" },
        { field: "estimatedHours", label: "Estimated Hours", category: "when", type: "number" },
        {
            field: "locationId",
            label: "Location",
            category: "where",
            type: "reference",
            referenceEntity: "location",
        },
        {
            field: "activationId",
            label: "Activation",
            category: "where",
            type: "reference",
            referenceEntity: "activation",
        },
        { field: "priority", label: "Priority", category: "why", type: "select", required: true },
        { field: "impactIfDelayed", label: "Impact if Delayed", category: "why", type: "textarea" },
        { field: "status", label: "Status", category: "how", type: "select", required: true },
        { field: "percentComplete", label: "% Complete", category: "how", type: "number" },
        {
            field: "dependencies",
            label: "Dependencies",
            category: "if_then",
            type: "multiselect",
            referenceEntity: "task",
        },
        { field: "blockers", label: "Blockers", category: "if_then", type: "textarea" },
    ],
};

// ─────────────────────────────────────────────────────────────────────────────
// REPORT TYPES CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export const REPORT_TYPE_CONFIG = {
    project_summary: { label: "Project Summary", category: "Project", icon: FolderKanban },
    budget_vs_actual: { label: "Budget vs Actual", category: "Finance", icon: DollarSign },
    labor_summary: { label: "Labor Summary", category: "Personnel", icon: Users },
    vendor_spend: { label: "Vendor Spend", category: "Finance", icon: Building },
    asset_utilization: { label: "Asset Utilization", category: "Inventory", icon: Package },
    crew_utilization: { label: "Crew Utilization", category: "Personnel", icon: Users },
    incident_summary: { label: "Incident Summary", category: "Safety", icon: AlertTriangle },
    milestone_status: { label: "Milestone Status", category: "Project", icon: CheckCircle },
    procurement_status: { label: "Procurement Status", category: "Procurement", icon: Receipt },
    logistics_summary: { label: "Logistics Summary", category: "Logistics", icon: Truck },
    daily_production: { label: "Daily Production Report", category: "Project", icon: FileText },
    wrap_report: { label: "Wrap Report", category: "Project", icon: Archive },
    post_mortem: { label: "Post-Mortem", category: "Project", icon: BookOpen },
} as const;
