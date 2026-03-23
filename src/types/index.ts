/* ═══════════════════════════════════════════════════════════════
   ATLVS — Core Type Definitions
   ═══════════════════════════════════════════════════════════════ */

// Re-export Productive.io feature types
export * from "./productive-features";

// Re-export Vendor/Contractor lifecycle types
export * from "./vendor-lifecycle";

// Re-export Unified Workforce lifecycle types
export * from "./workforce";

// Re-export Normalized/Consolidated types (3NF compliant)
export * from "./normalized";

// Re-export CRM & Revenue Pipeline types (Migration 013)
export * from "./crm-revenue";

// Re-export Digital Asset Lifecycle types (Migration 014)
export * from "./digital-assets";

// Re-export User Lifecycle & Identity types (Migration 018)
export * from "./user-lifecycle";

// Re-export Creative, Brand & Campaign Lifecycle types (Migration 015)
export * from "./creative-brand";

// Re-export Legal, Compliance, Finance & Procurement types (Migration 016)
export * from "./governance";

// Re-export Asset, Inventory, Logistics & Warehousing types (Migration 019)
export * from "./asset-logistics";

// Re-export Live Event Operations types (Migration 020)
export * from "./live-operations";

// Re-export Location Spatial Hierarchy types (Migration 017)
export * from "./spatial-hierarchy";

// Re-export Integrated Production Lifecycle types (Migration 021)
export * from "./production-lifecycle";

// Re-export Audit Remediation types (Migration 022)
export * from "./audit-remediation";

// Re-export Messaging & Communications types (Migration 046)
export * from "./messaging";

// Re-export Production Advancing types (Migrations 047-049)
export * from "./advancing";

// Re-export Credentialing & Ticketing types (Migrations 050-051)
export * from "./credentialing";

// Re-export External Sync & POS Integration types (Migration 052)
export * from "./external-sync";

// ─── Auth & RBAC ───
export type PermissionLevel = "exec" | "director" | "pm" | "member" | "client" | "collaborator";

export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string | undefined;
    role: PermissionLevel;
    organizationId: string;
}

// ─── CRM / Pipeline ───
export type DealStage = "lead" | "qualified" | "proposal" | "negotiation" | "won" | "lost";

export interface Lead {
    id: string;
    name: string;
    company: string;
    email: string;
    phone?: string | undefined;
    projectType: string;
    budgetRange: string;
    source: string;
    createdAt: string;
}

export interface Deal {
    id: string;
    title: string;
    company: string;
    contactName: string;
    contactEmail: string;
    value: number;
    stage: DealStage;
    probability: number;
    expectedCloseDate: string;
    assignedTo: string;
    notes?: string | undefined;
    createdAt: string;
    updatedAt: string;
}

export interface ProjectCharter {
    id: string;
    projectId: string;
    roles: { role: string; person: string; responsibility: string }[];
    successMetrics: { metric: string; target: string; current: string }[];
    kpis: { name: string; value: number; unit: string }[];
    createdAt: string;
}

export interface CaseStudy {
    id: string;
    projectId: string;
    title: string;
    client: string;
    summary: string;
    heroImage?: string | undefined;
    metrics: { label: string; value: string }[];
    photos: string[];
    publishedAt?: string | undefined;
    status: "draft" | "published";
}

// ─── Production ───
export type ProjectPhase =
    | "pre_production"
    | "fabrication"
    | "logistics"
    | "load_in"
    | "show"
    | "strike"
    | "load_out"
    | "discovery"
    | "design"
    | "procurement"
    | "rehearsal"
    | "wrap";
export type ProjectStatus =
    | "draft"
    | "active"
    | "on_hold"
    | "completed"
    | "cancelled"
    | "planning"
    | "pre_production"
    | "in_production"
    | "wrap";
export type TaskStatus =
    | "backlog"
    | "todo"
    | "in_progress"
    | "review"
    | "done"
    | "blocked"
    | "completed"
    | "cancelled";
export type TaskPriority = "critical" | "high" | "medium" | "low" | "urgent";
export type FabricationStatus =
    | "not_started"
    | "design"
    | "cutting"
    | "assembly"
    | "finishing"
    | "complete";

export interface Project {
    id: string;
    name: string;
    client: string;
    clientLogo?: string | undefined;
    status: ProjectStatus;
    currentPhase: ProjectPhase;
    startDate: string;
    endDate: string;
    budgetPlanned: number;
    budgetActual: number;
    progress: number;
    managerId: string;
    teamIds: string[];
    createdAt: string;
}

export interface Task {
    id: string;
    projectId: string;
    parentId?: string | undefined;
    title: string;
    description?: string | undefined;
    status: TaskStatus;
    priority: TaskPriority;
    assigneeId?: string | undefined;
    assigneeName?: string | undefined;
    phase: ProjectPhase;
    fabricationStatus?: FabricationStatus | undefined;
    materialCost?: number | undefined;
    estimatedHours?: number | undefined;
    dependencies: string[];
    startDate?: string | undefined;
    dueDate?: string | undefined;
    completedAt?: string | undefined;
    createdAt: string;
}

// ─── Documents ───
export type DocumentType =
    | "doc"
    | "wiki"
    | "meeting_notes"
    | "specification"
    | "proposal_doc"
    | "sow"
    | "template";
export type DocumentStatus = "draft" | "pending_review" | "published" | "archived";

// ─── Crew & Labor ───
export type CertificationType =
    | "osha_10"
    | "osha_30"
    | "forklift"
    | "rigging"
    | "electrical"
    | "union_card"
    | "first_aid";

export interface CrewMember {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    avatar?: string | undefined;
    hourlyRate: number;
    certifications: Certification[];
    status: "available" | "assigned" | "unavailable";
}

export interface Certification {
    id: string;
    type: CertificationType;
    label: string;
    issuedDate: string;
    expiryDate: string;
    isValid: boolean;
    documentUrl?: string | undefined;
}

export interface Shift {
    id: string;
    projectId: string;
    crewMemberId: string;
    date: string;
    startTime: string;
    endTime: string;
    role: string;
    status: "scheduled" | "checked_in" | "checked_out" | "no_show";
}

// ─── Assets & Fleet ───
export type AssetCondition =
    | "new"
    | "excellent"
    | "good"
    | "fair"
    | "needs_repair"
    | "decommissioned";

export interface Asset {
    id: string;
    name: string;
    category: string;
    barcode: string;
    condition: AssetCondition;
    location: string;
    ownedOrRental: "owned" | "rental";
    rentalReturnDate?: string | undefined;
    dailyRentalCost?: number | undefined;
    purchasePrice?: number | undefined;
    imageUrl?: string | undefined;
    notes?: string | undefined;
}

export interface Vehicle {
    id: string;
    name: string;
    type: string;
    licensePlate: string;
    dockHeight: string;
    driverName: string;
    driverPhone: string;
    gpsEnabled: boolean;
    status: "available" | "in_transit" | "loading" | "maintenance";
}

// ─── Creative & Brand ───
export interface BrandKit {
    id: string;
    clientId: string;
    clientName: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    logoUrl?: string | undefined;
    guidelines?: string | undefined;
}

export interface Deck {
    id: string;
    projectId: string;
    type: "pitch" | "progress" | "wrap";
    title: string;
    status: "draft" | "ready" | "presented";
    slides: DeckSlide[];
    createdAt: string;
}

export interface DeckSlide {
    id: string;
    order: number;
    title: string;
    content: string;
    dataBindings?: { key: string; source: string }[] | undefined;
}

export interface Approval {
    id: string;
    projectId: string;
    milestoneId: string;
    milestoneName: string;
    status: "pending" | "approved" | "revision_requested" | "overdue";
    requestedAt: string;
    deadline: string;
    approvedAt?: string | undefined;
    approverName: string;
    deliverableUrl?: string | undefined;
    timelineImpactDays?: number | undefined;
}

// ─── Vendor & Finance ───
export interface Vendor {
    id: string;
    name: string;
    contactName: string;
    email: string;
    phone: string;
    specialty: string;
    coiExpiryDate?: string | undefined;
    coiValid: boolean;
    ndaSigned: boolean;
    w9Uploaded: boolean;
    rating: number;
    status: "active" | "suspended" | "pending";
}

export interface PurchaseOrder {
    id: string;
    projectId: string;
    vendorId: string;
    vendorName: string;
    items: { description: string; quantity: number; unitPrice: number; total: number }[];
    totalAmount: number;
    status: "draft" | "issued" | "received" | "matched" | "disputed";
    issuedDate: string;
}

export interface WorkOrder {
    id: string;
    projectId: string;
    vendorId: string;
    vendorName: string;
    description: string;
    totalAmount: number;
    status: "draft" | "assigned" | "in_progress" | "completed";
    startDate: string;
    endDate: string;
}

export interface Invoice {
    id: string;
    vendorId: string;
    vendorName: string;
    purchaseOrderId?: string | undefined;
    workOrderId?: string | undefined;
    amount: number;
    status: "pending" | "approved" | "paid" | "disputed";
    invoiceDate: string;
    dueDate: string;
    variance?: number | undefined;
}

// ─── People & Org ───
export type StakeholderType = "internal" | "client" | "freelance" | "subcontractor";

export interface Stakeholder {
    id: string;
    name: string;
    email: string;
    phone?: string | undefined;
    type: StakeholderType;
    role: string;
    avatar?: string | undefined;
    projectIds: string[];
}

export interface OrgChartNode {
    id: string;
    projectId: string;
    personName: string;
    role: string;
    parentId?: string | undefined;
    sopIds: string[];
}

export interface SOP {
    id: string;
    title: string;
    role: string;
    content: string;
    version: string;
    lastUpdated: string;
    acknowledgments: { userId: string; acknowledgedAt: string }[];
}

// ─── Documents & Vault ───
export interface VaultDocument {
    id: string;
    name: string;
    category: "site_map" | "nda" | "contract" | "blueprint" | "permit" | "other";
    projectId?: string | undefined;
    uploadedBy: string;
    uploadedAt: string;
    size: number;
    mimeType: string;
    url: string;
    accessLevel: PermissionLevel;
    expiringLinkUrl?: string | undefined;
    expiringLinkExpiresAt?: string | undefined;
}

// ─── Notifications ───
export interface Notification {
    id: string;
    title: string;
    message: string;
    type: "info" | "warning" | "error" | "success";
    read: boolean;
    actionUrl?: string | undefined;
    createdAt: string;
}

// ─── Time Tracking ───
export type TimeEntryStatus = "pending" | "approved" | "rejected";

export interface TimeEntry {
    id: string;
    projectId: string;
    taskId?: string | undefined;
    crewMemberId: string;
    date: string;
    hoursWorked: number;
    hourlyRate: number;
    totalCost: number;
    notes?: string | undefined;
    status: TimeEntryStatus;
    approvedBy?: string | undefined;
    createdAt: string;
}

// ─── Expenses ───
export type ExpenseCategory =
    | "materials"
    | "labor"
    | "travel"
    | "equipment_rental"
    | "shipping"
    | "permits"
    | "catering"
    | "misc";
export type ExpenseStatus = "pending" | "approved" | "rejected" | "reimbursed";

export interface Expense {
    id: string;
    projectId: string;
    category: ExpenseCategory;
    description: string;
    amount: number;
    receiptUrl?: string | undefined;
    submittedBy: string;
    submittedAt: string;
    status: ExpenseStatus;
    approvedBy?: string | undefined;
    createdAt: string;
}

// ─── Budget ───
export type BudgetCategory =
    | "labor"
    | "materials"
    | "equipment"
    | "rentals"
    | "travel"
    | "shipping"
    | "permits"
    | "contingency"
    | "overhead"
    | "equipment_rental"
    | "equipment_purchase"
    | "fabrication"
    | "print"
    | "av"
    | "lighting"
    | "scenic"
    | "lodging"
    | "per_diem"
    | "trucking"
    | "venue"
    | "insurance"
    | "talent"
    | "catering"
    | "staffing"
    | "security"
    | "markup";

export interface BudgetLineItem {
    id: string;
    projectId: string;
    category: BudgetCategory;
    description: string;
    estimatedAmount: number;
    actualAmount: number;
    variance: number;
    notes?: string | undefined;
    createdAt: string;
}

// ─── Milestones ───
export type MilestoneStatus = "pending" | "in_progress" | "completed" | "overdue";

export interface Milestone {
    id: string;
    projectId: string;
    name: string;
    description?: string | undefined;
    dueDate: string;
    completedAt?: string | undefined;
    status: MilestoneStatus;
    deliverables: string[];
    approvalRequired: boolean;
    approvalId?: string | undefined;
    createdAt: string;
}

// ─── Comments & Activity ───
export type ActivityAction =
    | "created"
    | "updated"
    | "deleted"
    | "status_changed"
    | "assigned"
    | "commented"
    | "approved"
    | "rejected";

export interface Comment {
    id: string;
    entityType: "project" | "task" | "approval" | "deal";
    entityId: string;
    authorId: string;
    authorName: string;
    content: string;
    createdAt: string;
    updatedAt?: string | undefined;
    mentions: string[];
    attachments: string[];
}

export interface ActivityLogEntry {
    id: string;
    entityType: string;
    entityId: string;
    action: ActivityAction;
    actorId: string;
    actorName: string;
    metadata: Record<string, unknown>;
    createdAt: string;
}

// ─── Reports ───
export type ReportType =
    | "project_summary"
    | "budget_variance"
    | "crew_utilization"
    | "vendor_spend"
    | "approval_timeline"
    | "pipeline_forecast";

export interface ReportDefinition {
    id: string;
    name: string;
    type: ReportType;
    filters: Record<string, unknown>[];
    columns: string[];
    groupBy?: string | undefined;
    sortBy?: string | undefined;
    isTemplate: boolean;
    createdBy: string;
    createdAt: string;
}

// ─── Templates ───
export interface ProjectTemplate {
    id: string;
    name: string;
    description: string;
    phases: TemplatePhase[];
    defaultBudgetCategories: BudgetCategory[];
    defaultRoles: string[];
    createdBy: string;
    createdAt: string;
}

export interface TemplatePhase {
    phase: ProjectPhase;
    defaultDurationDays: number;
    defaultTasks: TemplateTask[];
}

export interface TemplateTask {
    title: string;
    description?: string | undefined;
    priority: TaskPriority;
    estimatedHours?: number | undefined;
    dependencies: number[];
}

// ─── Integrations ───
export type IntegrationType =
    | "quickbooks"
    | "xero"
    | "slack"
    | "google_calendar"
    | "dropbox"
    | "google_drive"
    | "zapier";
export type IntegrationStatus = "active" | "inactive" | "error";

export interface Integration {
    id: string;
    type: IntegrationType;
    name: string;
    status: IntegrationStatus;
    config: Record<string, unknown>;
    lastSyncAt?: string | undefined;
    createdAt: string;
}
