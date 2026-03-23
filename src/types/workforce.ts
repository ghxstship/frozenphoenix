// ═══════════════════════════════════════════════════════════════════════════
// ATLVS — Unified Workforce Lifecycle Types
// Resolves SSOT violations between crew_members and vendors.
// Single identity model for all worker classifications.
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export type WorkerLifecycleStatus =
    | "prospect"
    | "onboarding"
    | "active"
    | "on_leave"
    | "suspended"
    | "offboarding"
    | "alumni"
    | "do_not_engage";

export type WorkerClassification =
    | "full_time_employee"
    | "part_time_employee"
    | "seasonal_employee"
    | "contract_employee"
    | "independent_contractor"
    | "subcontractor"
    | "freelancer"
    | "agency_worker"
    | "temp_worker"
    | "intern"
    | "volunteer";

export type TaxClassification =
    | "w2"
    | "w2_seasonal"
    | "1099"
    | "corp_to_corp"
    | "foreign"
    | "exempt";

export type LifecycleStepStatus =
    | "not_started"
    | "in_progress"
    | "completed"
    | "skipped"
    | "blocked"
    | "overdue";

export type ReviewTargetType = "employee" | "contractor" | "vendor" | "freelancer" | "intern";

export type ComplianceScope = "employment" | "vendor" | "universal";

export type ICAssessmentMethod =
    | "irs_20_factor"
    | "abc_test"
    | "economic_reality"
    | "common_law"
    | "custom";

export type ICAssessmentResult =
    | "properly_classified"
    | "at_risk"
    | "misclassified"
    | "needs_review";

// ─────────────────────────────────────────────────────────────────────────────
// WORKER PROFILES
// ─────────────────────────────────────────────────────────────────────────────

export interface WorkerProfile {
    id: string;
    firstName: string;
    lastName: string;
    preferredName?: string | undefined;
    email: string;
    phone?: string | undefined;
    avatarUrl?: string | undefined;
    emergencyContactName?: string | undefined;
    emergencyContactRelationship?: string | undefined;
    emergencyContactPhone?: string | undefined;
    primaryClassification: WorkerClassification;
    taxClassification: TaxClassification;
    lifecycleStatus: WorkerLifecycleStatus;
    lifecycleStatusChangedAt?: string | undefined;
    initialEngagementDate?: string | undefined;
    mostRecentEngagementDate?: string | undefined;
    offboardingDate?: string | undefined;
    portalAccessEnabled: boolean;
    primaryRole?: string | undefined;
    secondaryRoles: string[];
    skills: string[];
    department?: string | undefined;
    homeBase?: string | undefined;
    willingToTravel: boolean;
    travelRadius?: number | undefined;
    tags: string[];
    preferred: boolean;
    doNotEngage: boolean;
    doNotEngageReason?: string | undefined;
    createdAt: string;
    // Computed/joined
    classifications?: WorkerClassificationRecord[] | undefined;
    activeEngagements?: number | undefined;
    complianceScore?: number | undefined;
    averageRating?: number | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// CLASSIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface WorkerClassificationRecord {
    id: string;
    workerProfileId: string;
    classification: WorkerClassification;
    isActive: boolean;
    effectiveDate: string;
    endDate?: string | undefined;
    taxClassification: TaxClassification;
    taxIdOnFile: boolean;
    hourlyRate?: number | undefined;
    overtimeRate?: number | undefined;
    dayRate?: number | undefined;
    rateType: string;
    employeeId?: string | undefined;
    benefitsEligible: boolean;
    ptoAccrualRate?: number | undefined;
    supervisorName?: string | undefined;
    isSeasonal: boolean;
    seasonStartMonth?: number | undefined;
    seasonEndMonth?: number | undefined;
    seasonsCompleted: number;
    returningWorker: boolean;
    contractStartDate?: string | undefined;
    contractEndDate?: string | undefined;
    contractAutoRenew: boolean;
    companyName?: string | undefined;
    paymentTermsDays: number;
    unionMember: boolean;
    unionLocal?: string | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGAGEMENT TERMS
// ─────────────────────────────────────────────────────────────────────────────

export interface EngagementTerm {
    id: string;
    workerProfileId: string;
    workerName?: string | undefined;
    classificationId: string;
    projectId?: string | undefined;
    projectName?: string | undefined;
    workOrderId?: string | undefined;
    role: string;
    department?: string | undefined;
    startDate: string;
    endDate?: string | undefined;
    isOngoing: boolean;
    rate: number;
    rateType: string;
    overtimeRate?: number | undefined;
    notToExceed?: number | undefined;
    estimatedHours?: number | undefined;
    status: string;
    isBillable: boolean;
    billingCode?: string | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIFIED COMPLIANCE
// ─────────────────────────────────────────────────────────────────────────────

export interface ComplianceTemplate {
    id: string;
    name: string;
    docType: string;
    description?: string | undefined;
    appliesToClassifications: WorkerClassification[];
    scope: ComplianceScope;
    isRequired: boolean;
    hasExpiry: boolean;
    expiryWarningDays: number;
    autoSuspendOnExpiry: boolean;
    blocksScheduling: boolean;
    blocksOnboardingCompletion: boolean;
    displayOrder: number;
    isActive: boolean;
}

export interface WorkerComplianceDoc {
    id: string;
    workerProfileId: string;
    workerName?: string | undefined;
    templateId?: string | undefined;
    docType: string;
    docName: string;
    docNumber?: string | undefined;
    documentUrl?: string | undefined;
    issuedDate?: string | undefined;
    expiryDate?: string | undefined;
    submittedAt: string;
    reviewedAt?: string | undefined;
    status: string;
    reviewedBy?: string | undefined;
    rejectionReason?: string | undefined;
    coverageAmount?: number | undefined;
    policyNumber?: string | undefined;
    carrierName?: string | undefined;
    notes?: string | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// ONBOARDING & OFFBOARDING
// ─────────────────────────────────────────────────────────────────────────────

export interface OnboardingStepTemplate {
    id: string;
    name: string;
    description?: string | undefined;
    appliesToClassifications: WorkerClassification[];
    stepOrder: number;
    isRequired: boolean;
    defaultDueDays: number;
    assigneeRole?: string | undefined;
    linkedComplianceTemplateId?: string | undefined;
    autoCompleteOnDocApproval: boolean;
    isActive: boolean;
}

export interface WorkerOnboardingRun {
    id: string;
    workerProfileId: string;
    workerName?: string | undefined;
    classificationId?: string | undefined;
    classification?: WorkerClassification | undefined;
    startedAt: string;
    completedAt?: string | undefined;
    targetCompletionDate?: string | undefined;
    status: LifecycleStepStatus;
    totalSteps: number;
    completedSteps: number;
    notes?: string | undefined;
    steps?: OnboardingStepProgress[] | undefined;
}

export interface OnboardingStepProgress {
    id: string;
    runId: string;
    templateStepId: string;
    stepName?: string | undefined;
    status: LifecycleStepStatus;
    dueDate?: string | undefined;
    completedAt?: string | undefined;
    completedByName?: string | undefined;
    assignedToName?: string | undefined;
    evidenceUrl?: string | undefined;
    notes?: string | undefined;
}

export interface WorkerOffboardingRun {
    id: string;
    workerProfileId: string;
    workerName?: string | undefined;
    reason?: string | undefined;
    isVoluntary?: boolean | undefined;
    eligibleForRehire?: boolean | undefined;
    startedAt: string;
    completedAt?: string | undefined;
    status: LifecycleStepStatus;
    totalSteps: number;
    completedSteps: number;
    exitInterviewCompleted: boolean;
    exitInterviewNotes?: string | undefined;
    notes?: string | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKER REVIEWS (Universal)
// ─────────────────────────────────────────────────────────────────────────────

export interface WorkerReview {
    id: string;
    workerProfileId: string;
    workerName?: string | undefined;
    projectId?: string | undefined;
    projectName?: string | undefined;
    workOrderId?: string | undefined;
    engagementTermId?: string | undefined;
    reviewerId: string;
    reviewerName?: string | undefined;
    reviewType: string;
    targetType: ReviewTargetType;
    overallRating: number;
    qualityRating?: number | undefined;
    timelinessRating?: number | undefined;
    communicationRating?: number | undefined;
    professionalismRating?: number | undefined;
    reliabilityRating?: number | undefined;
    safetyRating?: number | undefined;
    strengths?: string | undefined;
    areasForImprovement?: string | undefined;
    goals?: string | undefined;
    comments?: string | undefined;
    wouldReengage?: boolean | undefined;
    reviewPeriodStart?: string | undefined;
    reviewPeriodEnd?: string | undefined;
    reviewDate: string;
    acknowledgedAt?: string | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// IC CLASSIFICATION ASSESSMENTS
// ─────────────────────────────────────────────────────────────────────────────

export interface ClassificationAssessment {
    id: string;
    workerProfileId: string;
    workerName?: string | undefined;
    assessmentMethod: ICAssessmentMethod;
    assessmentDate: string;
    nextAssessmentDate?: string | undefined;
    result: ICAssessmentResult;
    score?: number | undefined;
    factors: Record<string, unknown>;
    assessorId: string;
    assessorName?: string | undefined;
    rationale?: string | undefined;
    recommendedAction?: string | undefined;
    reclassifyTo?: WorkerClassification | undefined;
    reclassificationCompleted: boolean;
    reclassificationDate?: string | undefined;
    supportingDocUrls: string[];
}
