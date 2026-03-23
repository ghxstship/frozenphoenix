// ═══════════════════════════════════════════════════════════════════════════
// ATLVS — Vendor/Contractor/Subcontractor Lifecycle Types
// HeyPros + Jobber feature parity for creative/experiential production
// Maintains 3NF compliance and SSOT principles
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// VENDOR PROFILE EXTENSIONS
// ─────────────────────────────────────────────────────────────────────────────

export type VendorType =
    | "vendor"
    | "subcontractor"
    | "independent_contractor"
    | "freelancer"
    | "agency"
    | "supplier";

export type OnboardingStatus =
    | "invited"
    | "application_submitted"
    | "under_review"
    | "documents_pending"
    | "documents_received"
    | "background_check"
    | "approved"
    | "rejected"
    | "archived";

// ─────────────────────────────────────────────────────────────────────────────
// COMPLIANCE DOCUMENTS
// ─────────────────────────────────────────────────────────────────────────────

export type ComplianceDocType =
    | "coi"
    | "w9"
    | "w8ben"
    | "nda"
    | "msa"
    | "business_license"
    | "workers_comp"
    | "auto_insurance"
    | "professional_license"
    | "union_card"
    | "background_check"
    | "drug_test"
    | "safety_cert"
    | "equipment_cert"
    | "diversity_cert"
    | "tax_exempt"
    | "bank_info"
    | "other";

export type ComplianceDocStatus =
    | "not_submitted"
    | "pending_review"
    | "approved"
    | "rejected"
    | "expired"
    | "expiring_soon";

export interface ComplianceRequirement {
    id: string;
    name: string;
    docType: ComplianceDocType;
    description?: string | undefined;
    appliesToVendorTypes: VendorType[];
    appliesToCategories: string[];
    isRequired: boolean;
    hasExpiry: boolean;
    expiryWarningDays: number;
    autoSuspendOnExpiry: boolean;
    displayOrder: number;
    isActive: boolean;
}

export interface VendorComplianceDoc {
    id: string;
    vendorId: string;
    requirementId?: string | undefined;
    docType: ComplianceDocType;
    docName: string;
    docNumber?: string | undefined;
    documentUrl?: string | undefined;
    issuedDate?: string | undefined;
    expiryDate?: string | undefined;
    submittedAt: string;
    reviewedAt?: string | undefined;
    status: ComplianceDocStatus;
    reviewedBy?: string | undefined;
    rejectionReason?: string | undefined;
    coverageAmount?: number | undefined;
    policyNumber?: string | undefined;
    carrierName?: string | undefined;
    notes?: string | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// WORK ORDERS
// ─────────────────────────────────────────────────────────────────────────────

export type WorkOrderStatus =
    | "draft"
    | "posted"
    | "bidding"
    | "assigned"
    | "accepted"
    | "scheduled"
    | "in_progress"
    | "on_hold"
    | "completed"
    | "verified"
    | "invoiced"
    | "cancelled"
    | "disputed";

export type WorkOrderPriority = "low" | "normal" | "high" | "urgent" | "emergency";

export interface WorkOrderFull {
    id: string;
    projectId: string;
    projectName?: string | undefined;
    locationId?: string | undefined;
    locationName?: string | undefined;
    number: string;
    title: string;
    description?: string | undefined;
    vendorId?: string | undefined;
    vendorName?: string | undefined;
    assignedCrewIds: string[];
    supervisorId?: string | undefined;
    category?: string | undefined;
    department?: string | undefined;
    phase?: string | undefined;
    scheduledStart?: string | undefined;
    scheduledEnd?: string | undefined;
    actualStart?: string | undefined;
    actualEnd?: string | undefined;
    estimatedHours?: number | undefined;
    actualHours?: number | undefined;
    estimatedCost?: number | undefined;
    actualCost?: number | undefined;
    notToExceed?: number | undefined;
    billingType?: string | undefined;
    priority: WorkOrderPriority;
    status: WorkOrderStatus;
    isOpenForBids: boolean;
    bidDeadline?: string | undefined;
    maxBidders?: number | undefined;
    requiresChecklistCompletion: boolean;
    completedAt?: string | undefined;
    completionNotes?: string | undefined;
    completionPhotos: string[];
    createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// WORK ORDER BIDS
// ─────────────────────────────────────────────────────────────────────────────

export type BidStatus = "submitted" | "under_review" | "accepted" | "rejected" | "withdrawn";

export interface WorkOrderBid {
    id: string;
    workOrderId: string;
    vendorId: string;
    vendorName?: string | undefined;
    bidAmount: number;
    estimatedHours?: number | undefined;
    proposedStart?: string | undefined;
    proposedEnd?: string | undefined;
    notes?: string | undefined;
    status: BidStatus;
    submittedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// DISPATCH
// ─────────────────────────────────────────────────────────────────────────────

export type DispatchStatus =
    | "unassigned"
    | "offered"
    | "accepted"
    | "declined"
    | "en_route"
    | "on_site"
    | "in_progress"
    | "completed"
    | "no_show";

export interface DispatchEntry {
    id: string;
    workOrderId: string;
    workOrderTitle?: string | undefined;
    vendorId?: string | undefined;
    vendorName?: string | undefined;
    crewMemberId?: string | undefined;
    crewMemberName?: string | undefined;
    role?: string | undefined;
    status: DispatchStatus;
    dispatchedAt?: string | undefined;
    arrivedAt?: string | undefined;
    startedAt?: string | undefined;
    completedAt?: string | undefined;
    dispatchNotes?: string | undefined;
    confirmedAt?: string | undefined;
    declinedReason?: string | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// VENDOR REVIEWS
// ─────────────────────────────────────────────────────────────────────────────

export type VendorReviewType = "project_completion" | "periodic" | "incident" | "self_assessment";

export interface VendorReview {
    id: string;
    vendorId: string;
    vendorName?: string | undefined;
    projectId?: string | undefined;
    projectName?: string | undefined;
    workOrderId?: string | undefined;
    reviewerId: string;
    reviewerName?: string | undefined;
    reviewType: VendorReviewType;
    overallRating: number;
    qualityRating?: number | undefined;
    timelinessRating?: number | undefined;
    communicationRating?: number | undefined;
    professionalismRating?: number | undefined;
    valueRating?: number | undefined;
    safetyRating?: number | undefined;
    strengths?: string | undefined;
    improvements?: string | undefined;
    comments?: string | undefined;
    wouldRehire?: boolean | undefined;
    reviewDate: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// JOB CHECKLISTS
// ─────────────────────────────────────────────────────────────────────────────

export type JobChecklistStatus =
    | "not_started"
    | "in_progress"
    | "completed"
    | "skipped"
    | "blocked";

export interface ChecklistTemplate {
    id: string;
    name: string;
    description?: string | undefined;
    category?: string | undefined;
    department?: string | undefined;
    items: ChecklistItemDef[];
    isActive: boolean;
    usageCount: number;
}

export interface ChecklistItemDef {
    id: string;
    title: string;
    description?: string | undefined;
    required: boolean;
    order: number;
}

export interface JobChecklist {
    id: string;
    templateId?: string | undefined;
    workOrderId?: string | undefined;
    projectId?: string | undefined;
    assignedToId?: string | undefined;
    vendorId?: string | undefined;
    title: string;
    items: ChecklistItem[];
    status: JobChecklistStatus;
    totalItems: number;
    completedItems: number;
    completionPercent: number;
    dueDate?: string | undefined;
    completedAt?: string | undefined;
}

export interface ChecklistItem {
    id: string;
    title: string;
    completed: boolean;
    completedAt?: string | undefined;
    completedBy?: string | undefined;
    notes?: string | undefined;
    photoUrl?: string | undefined;
    required: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// ESTIMATES / QUOTES
// ─────────────────────────────────────────────────────────────────────────────

export type EstimateStatus =
    | "draft"
    | "sent"
    | "viewed"
    | "accepted"
    | "rejected"
    | "expired"
    | "converted";

export interface Estimate {
    id: string;
    companyId?: string | undefined;
    companyName?: string | undefined;
    contactId?: string | undefined;
    contactName?: string | undefined;
    dealId?: string | undefined;
    number: string;
    title: string;
    description?: string | undefined;
    lineItems: EstimateLineItem[];
    subtotal: number;
    discountPercent: number;
    discountAmount: number;
    taxPercent: number;
    taxAmount: number;
    total: number;
    currency: string;
    validUntil?: string | undefined;
    proposedStartDate?: string | undefined;
    proposedEndDate?: string | undefined;
    status: EstimateStatus;
    sentAt?: string | undefined;
    viewedAt?: string | undefined;
    acceptedAt?: string | undefined;
    rejectedAt?: string | undefined;
    signatureRequired: boolean;
    signedBy?: string | undefined;
    signedAt?: string | undefined;
    convertedProjectId?: string | undefined;
    internalNotes?: string | undefined;
    clientNotes?: string | undefined;
    createdAt: string;
}

export interface EstimateLineItem {
    id: string;
    name: string;
    description?: string | undefined;
    qty: number;
    unit: string;
    unitPrice: number;
    total: number;
    optional: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// JOB COSTING
// ─────────────────────────────────────────────────────────────────────────────

export type JobCostType =
    | "labor"
    | "material"
    | "equipment"
    | "subcontractor"
    | "expense"
    | "overhead";

export interface JobCostEntry {
    id: string;
    projectId: string;
    projectName?: string | undefined;
    workOrderId?: string | undefined;
    costType: JobCostType;
    description: string;
    vendorId?: string | undefined;
    vendorName?: string | undefined;
    crewMemberId?: string | undefined;
    crewMemberName?: string | undefined;
    quantity: number;
    unit: string;
    unitCost: number;
    totalCost: number;
    budgetedAmount?: number | undefined;
    costDate: string;
    billable: boolean;
    billed: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// VENDOR COMMUNICATION
// ─────────────────────────────────────────────────────────────────────────────

export type CommChannel = "in_app" | "email" | "sms" | "phone" | "portal";
export type CommDirection = "inbound" | "outbound";

export interface VendorCommunication {
    id: string;
    vendorId: string;
    vendorName?: string | undefined;
    workOrderId?: string | undefined;
    projectId?: string | undefined;
    channel: CommChannel;
    direction: CommDirection;
    subject?: string | undefined;
    body: string;
    senderName?: string | undefined;
    readAt?: string | undefined;
    attachmentUrls: string[];
    createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE REQUESTS (Jobber feature parity)
// ─────────────────────────────────────────────────────────────────────────────

export type ServiceRequestStatus =
    | "new"
    | "acknowledged"
    | "assessment_scheduled"
    | "quoted"
    | "approved"
    | "converted"
    | "declined"
    | "cancelled"
    | "archived";

export type ServiceRequestSource =
    | "client_portal"
    | "online_booking"
    | "phone"
    | "email"
    | "walk_in"
    | "referral"
    | "social_media"
    | "website_form"
    | "vendor_portal"
    | "internal";

export type ServiceRequestPriority = "low" | "normal" | "high" | "urgent" | "emergency";

export interface ServiceRequest {
    id: string;
    companyId?: string | undefined;
    companyName?: string | undefined;
    contactId?: string | undefined;
    contactName?: string | undefined;
    requesterName?: string | undefined;
    requesterEmail?: string | undefined;
    requesterPhone?: string | undefined;
    title: string;
    description?: string | undefined;
    category?: string | undefined;
    serviceType?: string | undefined;
    locationName?: string | undefined;
    locationNotes?: string | undefined;
    preferredDate?: string | undefined;
    preferredTimeStart?: string | undefined;
    preferredTimeEnd?: string | undefined;
    isFlexible: boolean;
    priority: ServiceRequestPriority;
    status: ServiceRequestStatus;
    source: ServiceRequestSource;
    requiresAssessment: boolean;
    assessmentDate?: string | undefined;
    assessmentNotes?: string | undefined;
    assessedByName?: string | undefined;
    attachmentUrls: string[];
    convertedToType?: "estimate" | "work_order" | "project" | "deal" | undefined;
    convertedToId?: string | undefined;
    convertedAt?: string | undefined;
    assignedToId?: string | undefined;
    assignedToName?: string | undefined;
    internalNotes?: string | undefined;
    createdAt: string;
}
