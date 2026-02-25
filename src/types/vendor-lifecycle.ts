// ═══════════════════════════════════════════════════════════════════════════
// FROZEN PHOENIX — Vendor/Contractor/Subcontractor Lifecycle Types
// HeyPros + Jobber feature parity for creative/experiential production
// Maintains 3NF compliance and SSOT principles
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// VENDOR PROFILE EXTENSIONS
// ─────────────────────────────────────────────────────────────────────────────

export type VendorType = 'vendor' | 'subcontractor' | 'independent_contractor' | 'freelancer' | 'agency' | 'supplier';

export type OnboardingStatus =
    | 'invited' | 'application_submitted' | 'under_review' | 'documents_pending'
    | 'documents_received' | 'background_check' | 'approved' | 'rejected' | 'archived';

// ─────────────────────────────────────────────────────────────────────────────
// COMPLIANCE DOCUMENTS
// ─────────────────────────────────────────────────────────────────────────────

export type ComplianceDocType =
    | 'coi' | 'w9' | 'w8ben' | 'nda' | 'msa' | 'business_license' | 'workers_comp'
    | 'auto_insurance' | 'professional_license' | 'union_card' | 'background_check'
    | 'drug_test' | 'safety_cert' | 'equipment_cert' | 'diversity_cert' | 'tax_exempt'
    | 'bank_info' | 'other';

export type ComplianceDocStatus = 'not_submitted' | 'pending_review' | 'approved' | 'rejected' | 'expired' | 'expiring_soon';

export interface ComplianceRequirement {
    id: string;
    name: string;
    docType: ComplianceDocType;
    description?: string;
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
    requirementId?: string;
    docType: ComplianceDocType;
    docName: string;
    docNumber?: string;
    documentUrl?: string;
    issuedDate?: string;
    expiryDate?: string;
    submittedAt: string;
    reviewedAt?: string;
    status: ComplianceDocStatus;
    reviewedBy?: string;
    rejectionReason?: string;
    coverageAmount?: number;
    policyNumber?: string;
    carrierName?: string;
    notes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// WORK ORDERS
// ─────────────────────────────────────────────────────────────────────────────

export type WorkOrderStatus =
    | 'draft' | 'posted' | 'bidding' | 'assigned' | 'accepted' | 'scheduled'
    | 'in_progress' | 'on_hold' | 'completed' | 'verified' | 'invoiced' | 'cancelled' | 'disputed';

export type WorkOrderPriority = 'low' | 'normal' | 'high' | 'urgent' | 'emergency';

export interface WorkOrderFull {
    id: string;
    projectId: string;
    projectName?: string;
    locationId?: string;
    locationName?: string;
    number: string;
    title: string;
    description?: string;
    vendorId?: string;
    vendorName?: string;
    assignedCrewIds: string[];
    supervisorId?: string;
    category?: string;
    department?: string;
    phase?: string;
    scheduledStart?: string;
    scheduledEnd?: string;
    actualStart?: string;
    actualEnd?: string;
    estimatedHours?: number;
    actualHours?: number;
    estimatedCost?: number;
    actualCost?: number;
    notToExceed?: number;
    billingType?: string;
    priority: WorkOrderPriority;
    status: WorkOrderStatus;
    isOpenForBids: boolean;
    bidDeadline?: string;
    maxBidders?: number;
    requiresChecklistCompletion: boolean;
    completedAt?: string;
    completionNotes?: string;
    completionPhotos: string[];
    createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// WORK ORDER BIDS
// ─────────────────────────────────────────────────────────────────────────────

export type BidStatus = 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';

export interface WorkOrderBid {
    id: string;
    workOrderId: string;
    vendorId: string;
    vendorName?: string;
    bidAmount: number;
    estimatedHours?: number;
    proposedStart?: string;
    proposedEnd?: string;
    notes?: string;
    status: BidStatus;
    submittedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// DISPATCH
// ─────────────────────────────────────────────────────────────────────────────

export type DispatchStatus =
    | 'unassigned' | 'offered' | 'accepted' | 'declined' | 'en_route'
    | 'on_site' | 'in_progress' | 'completed' | 'no_show';

export interface DispatchEntry {
    id: string;
    workOrderId: string;
    workOrderTitle?: string;
    vendorId?: string;
    vendorName?: string;
    crewMemberId?: string;
    crewMemberName?: string;
    role?: string;
    status: DispatchStatus;
    dispatchedAt?: string;
    arrivedAt?: string;
    startedAt?: string;
    completedAt?: string;
    dispatchNotes?: string;
    confirmedAt?: string;
    declinedReason?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// VENDOR REVIEWS
// ─────────────────────────────────────────────────────────────────────────────

export type VendorReviewType = 'project_completion' | 'periodic' | 'incident' | 'self_assessment';

export interface VendorReview {
    id: string;
    vendorId: string;
    vendorName?: string;
    projectId?: string;
    projectName?: string;
    workOrderId?: string;
    reviewerId: string;
    reviewerName?: string;
    reviewType: VendorReviewType;
    overallRating: number;
    qualityRating?: number;
    timelinessRating?: number;
    communicationRating?: number;
    professionalismRating?: number;
    valueRating?: number;
    safetyRating?: number;
    strengths?: string;
    improvements?: string;
    comments?: string;
    wouldRehire?: boolean;
    reviewDate: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// JOB CHECKLISTS
// ─────────────────────────────────────────────────────────────────────────────

export type JobChecklistStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped' | 'blocked';

export interface ChecklistTemplate {
    id: string;
    name: string;
    description?: string;
    category?: string;
    department?: string;
    items: ChecklistItemDef[];
    isActive: boolean;
    usageCount: number;
}

export interface ChecklistItemDef {
    id: string;
    title: string;
    description?: string;
    required: boolean;
    order: number;
}

export interface JobChecklist {
    id: string;
    templateId?: string;
    workOrderId?: string;
    projectId?: string;
    assignedToId?: string;
    vendorId?: string;
    title: string;
    items: ChecklistItem[];
    status: JobChecklistStatus;
    totalItems: number;
    completedItems: number;
    completionPercent: number;
    dueDate?: string;
    completedAt?: string;
}

export interface ChecklistItem {
    id: string;
    title: string;
    completed: boolean;
    completedAt?: string;
    completedBy?: string;
    notes?: string;
    photoUrl?: string;
    required: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// ESTIMATES / QUOTES
// ─────────────────────────────────────────────────────────────────────────────

export type EstimateStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'converted';

export interface Estimate {
    id: string;
    companyId?: string;
    companyName?: string;
    contactId?: string;
    contactName?: string;
    dealId?: string;
    number: string;
    title: string;
    description?: string;
    lineItems: EstimateLineItem[];
    subtotal: number;
    discountPercent: number;
    discountAmount: number;
    taxPercent: number;
    taxAmount: number;
    total: number;
    currency: string;
    validUntil?: string;
    proposedStartDate?: string;
    proposedEndDate?: string;
    status: EstimateStatus;
    sentAt?: string;
    viewedAt?: string;
    acceptedAt?: string;
    rejectedAt?: string;
    signatureRequired: boolean;
    signedBy?: string;
    signedAt?: string;
    convertedProjectId?: string;
    internalNotes?: string;
    clientNotes?: string;
    createdAt: string;
}

export interface EstimateLineItem {
    id: string;
    name: string;
    description?: string;
    qty: number;
    unit: string;
    unitPrice: number;
    total: number;
    optional: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// JOB COSTING
// ─────────────────────────────────────────────────────────────────────────────

export type JobCostType = 'labor' | 'material' | 'equipment' | 'subcontractor' | 'expense' | 'overhead';

export interface JobCostEntry {
    id: string;
    projectId: string;
    projectName?: string;
    workOrderId?: string;
    costType: JobCostType;
    description: string;
    vendorId?: string;
    vendorName?: string;
    crewMemberId?: string;
    crewMemberName?: string;
    quantity: number;
    unit: string;
    unitCost: number;
    totalCost: number;
    budgetedAmount?: number;
    costDate: string;
    billable: boolean;
    billed: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// VENDOR COMMUNICATION
// ─────────────────────────────────────────────────────────────────────────────

export type CommChannel = 'in_app' | 'email' | 'sms' | 'phone' | 'portal';
export type CommDirection = 'inbound' | 'outbound';

export interface VendorCommunication {
    id: string;
    vendorId: string;
    vendorName?: string;
    workOrderId?: string;
    projectId?: string;
    channel: CommChannel;
    direction: CommDirection;
    subject?: string;
    body: string;
    senderName?: string;
    readAt?: string;
    attachmentUrls: string[];
    createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE REQUESTS (Jobber feature parity)
// ─────────────────────────────────────────────────────────────────────────────

export type ServiceRequestStatus =
    | 'new' | 'acknowledged' | 'assessment_scheduled' | 'quoted' | 'approved'
    | 'converted' | 'declined' | 'cancelled' | 'archived';

export type ServiceRequestSource =
    | 'client_portal' | 'online_booking' | 'phone' | 'email' | 'walk_in'
    | 'referral' | 'social_media' | 'website_form' | 'vendor_portal' | 'internal';

export type ServiceRequestPriority = 'low' | 'normal' | 'high' | 'urgent' | 'emergency';

export interface ServiceRequest {
    id: string;
    companyId?: string;
    companyName?: string;
    contactId?: string;
    contactName?: string;
    requesterName?: string;
    requesterEmail?: string;
    requesterPhone?: string;
    title: string;
    description?: string;
    category?: string;
    serviceType?: string;
    locationName?: string;
    locationNotes?: string;
    preferredDate?: string;
    preferredTimeStart?: string;
    preferredTimeEnd?: string;
    isFlexible: boolean;
    priority: ServiceRequestPriority;
    status: ServiceRequestStatus;
    source: ServiceRequestSource;
    requiresAssessment: boolean;
    assessmentDate?: string;
    assessmentNotes?: string;
    assessedByName?: string;
    attachmentUrls: string[];
    convertedToType?: 'estimate' | 'work_order' | 'project' | 'deal';
    convertedToId?: string;
    convertedAt?: string;
    assignedToId?: string;
    assignedToName?: string;
    internalNotes?: string;
    createdAt: string;
}
