/* ═══════════════════════════════════════════════════════════════
   NORMALIZED TYPE DEFINITIONS — 3NF Compliant Schemas
   ═══════════════════════════════════════════════════════════════ */

import type { CertificationType } from "./index";

// ─── Certification (Normalized — separate from CrewMember) ───
export interface CertificationRecord {
    id: string;
    crewMemberId: string;
    type: CertificationType;
    issuedDate: string;
    expiryDate: string;
    documentUrl?: string | undefined;
}

// ─── Crew Member (3NF — no embedded certifications) ───
export interface CrewMemberNormalized {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    avatar?: string | undefined;
    hourlyRate: number;
    status: "available" | "assigned" | "unavailable";
}

// ─── Purchase Order (3NF — no vendorName duplication) ───
export interface PurchaseOrderNormalized {
    id: string;
    projectId: string;
    vendorId: string;
    totalAmount: number;
    status: "draft" | "issued" | "received" | "matched" | "disputed";
    issuedDate: string;
}

// ─── Purchase Order Line Item (Normalized) ───
export interface PurchaseOrderLineItem {
    id: string;
    purchaseOrderId: string;
    description: string;
    quantity: number;
    unitPrice: number;
}

// ─── Work Order (3NF — no vendorName duplication) ───
export interface WorkOrderNormalized {
    id: string;
    projectId: string;
    vendorId: string;
    description: string;
    totalAmount: number;
    status: "draft" | "assigned" | "in_progress" | "completed";
    startDate: string;
    endDate: string;
}

// ─── Invoice (3NF — no vendorName duplication) ───
export interface InvoiceNormalized {
    id: string;
    vendorId: string;
    purchaseOrderId?: string | undefined;
    workOrderId?: string | undefined;
    amount: number;
    status: "pending" | "approved" | "paid" | "disputed";
    invoiceDate: string;
    dueDate: string;
    variance?: number | undefined;
}

// ─── Consolidated Task (unified tasks + production_tasks) ───
export type ConsolidatedTaskStatus =
    | "backlog"
    | "todo"
    | "in_progress"
    | "review"
    | "done"
    | "blocked"
    | "completed"
    | "cancelled";
export type ConsolidatedTaskPriority = "critical" | "high" | "medium" | "low" | "urgent";
export type ProductionPhase =
    | "discovery"
    | "design"
    | "pre_production"
    | "procurement"
    | "fabrication"
    | "logistics"
    | "load_in"
    | "rehearsal"
    | "show"
    | "strike"
    | "load_out"
    | "wrap";
export type Department =
    | "production"
    | "construction"
    | "technical"
    | "fabrication"
    | "print"
    | "scenic"
    | "props"
    | "av"
    | "lighting"
    | "rigging"
    | "food_beverage"
    | "staffing"
    | "logistics"
    | "finance"
    | "creative";

export interface ConsolidatedTask {
    id: string;
    projectId: string;
    parentId?: string | undefined;
    title: string;
    description?: string | undefined;
    status: ConsolidatedTaskStatus;
    priority: ConsolidatedTaskPriority;
    assigneeId?: string | undefined;
    phase: string;
    fabricationStatus?: string | undefined;
    materialCost?: number | undefined;
    startDate?: string | undefined;
    dueDate?: string | undefined;
    completedAt?: string | undefined;
    createdAt: string;
    updatedAt: string;
    // Production-extended fields
    department?: Department | undefined;
    reviewerId?: string | undefined;
    vendorId?: string | undefined;
    deliverables?: string[] | undefined;
    acceptanceCriteria?: string[] | undefined;
    estimatedHours?: number | undefined;
    actualHours?: number | undefined;
    locationId?: string | undefined;
    activationId?: string | undefined;
    eventId?: string | undefined;
    impactIfDelayed?: string | undefined;
    percentComplete?: number | undefined;
    blockers?: string[] | undefined;
    milestoneId?: string | undefined;
    sowDeliverableId?: string | undefined;
    createdBy?: string | undefined;
    updatedBy?: string | undefined;
    organizationId: string;
}

// ─── Consolidated Milestone (unified milestones + production_milestones) ───
export type ConsolidatedMilestoneStatus =
    | "pending"
    | "in_progress"
    | "completed"
    | "overdue"
    | "pending_approval"
    | "approved"
    | "rejected";

export interface ConsolidatedMilestone {
    id: string;
    projectId: string;
    name: string;
    description?: string | undefined;
    dueDate: string;
    completedAt?: string | undefined;
    status: ConsolidatedMilestoneStatus;
    deliverables: string[];
    approvalRequired: boolean;
    approvalId?: string | undefined;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
    // Production-extended fields
    phase?: ProductionPhase | undefined;
    ownerId?: string | undefined;
    approverIds?: string[] | undefined;
    isCriticalPath?: boolean | undefined;
    clientFacing?: boolean | undefined;
    paymentTrigger?: boolean | undefined;
    paymentAmount?: number | undefined;
    createdBy?: string | undefined;
    updatedBy?: string | undefined;
}

// ─── Junction: Activation ↔ Asset ───
export type JunctionAssetStatus = "assigned" | "in_use" | "returned" | "damaged";

export interface ActivationAsset {
    id: string;
    activationId: string;
    assetId: string;
    role?: string | undefined;
    quantity: number;
    notes?: string | undefined;
    assignedAt: string;
    returnedAt?: string | undefined;
    status: JunctionAssetStatus;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
}

// ─── Junction: Event ↔ Asset ───
export interface EventAsset {
    id: string;
    eventId: string;
    assetId: string;
    role?: string | undefined;
    quantity: number;
    notes?: string | undefined;
    assignedAt: string;
    returnedAt?: string | undefined;
    status: JunctionAssetStatus;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
}

// ─── Junction: Activity ↔ Asset ───
export interface ActivityAsset {
    id: string;
    activityId: string;
    assetId: string;
    role?: string | undefined;
    quantity: number;
    notes?: string | undefined;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
}

// ─── Junction: Activity ↔ Consumable ───
export interface ActivityConsumable {
    id: string;
    activityId: string;
    consumableId: string;
    estimatedQuantity: number;
    actualQuantity?: number | undefined;
    notes?: string | undefined;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
}

// ─── Lookup Helpers (for UI projections) ───
export interface LookupTables {
    vendors: Map<string, { id: string; name: string }>;
    projects: Map<string, { id: string; name: string; client: string }>;
    crewMembers: Map<string, { id: string; name: string }>;
}

/**
 * Creates a lookup map from an array of entities
 */
export function createLookup<T extends { id: string }>(
    entities: T[],
    selector: (entity: T) => { id: string; [key: string]: unknown }
): Map<string, ReturnType<typeof selector>> {
    return new Map(entities.map((e) => [e.id, selector(e)]));
}
