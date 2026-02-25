// ═══════════════════════════════════════════════════════════════════════════
// PLAYBOOK — Unified Workforce Lifecycle Types
// Resolves SSOT violations between crew_members and vendors.
// Single identity model for all worker classifications.
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export type WorkerLifecycleStatus =
    | 'prospect' | 'onboarding' | 'active' | 'on_leave'
    | 'suspended' | 'offboarding' | 'alumni' | 'do_not_engage';

export type WorkerClassification =
    | 'full_time_employee' | 'part_time_employee' | 'seasonal_employee'
    | 'contract_employee' | 'independent_contractor' | 'subcontractor'
    | 'freelancer' | 'agency_worker' | 'temp_worker' | 'intern' | 'volunteer';

export type TaxClassification = 'w2' | 'w2_seasonal' | '1099' | 'corp_to_corp' | 'foreign' | 'exempt';

export type LifecycleStepStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped' | 'blocked' | 'overdue';

export type ReviewTargetType = 'employee' | 'contractor' | 'vendor' | 'freelancer' | 'intern';

export type ComplianceScope = 'employment' | 'vendor' | 'universal';

export type ICAssessmentMethod = 'irs_20_factor' | 'abc_test' | 'economic_reality' | 'common_law' | 'custom';

export type ICAssessmentResult = 'properly_classified' | 'at_risk' | 'misclassified' | 'needs_review';

// ─────────────────────────────────────────────────────────────────────────────
// WORKER PROFILES
// ─────────────────────────────────────────────────────────────────────────────

export interface WorkerProfile {
    id: string;
    firstName: string;
    lastName: string;
    preferredName?: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
    emergencyContactName?: string;
    emergencyContactRelationship?: string;
    emergencyContactPhone?: string;
    primaryClassification: WorkerClassification;
    taxClassification: TaxClassification;
    lifecycleStatus: WorkerLifecycleStatus;
    lifecycleStatusChangedAt?: string;
    initialEngagementDate?: string;
    mostRecentEngagementDate?: string;
    offboardingDate?: string;
    portalAccessEnabled: boolean;
    primaryRole?: string;
    secondaryRoles: string[];
    skills: string[];
    department?: string;
    homeBase?: string;
    willingToTravel: boolean;
    travelRadius?: number;
    tags: string[];
    preferred: boolean;
    doNotEngage: boolean;
    doNotEngageReason?: string;
    createdAt: string;
    // Computed/joined
    classifications?: WorkerClassificationRecord[];
    activeEngagements?: number;
    complianceScore?: number;
    averageRating?: number;
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
    endDate?: string;
    taxClassification: TaxClassification;
    taxIdOnFile: boolean;
    hourlyRate?: number;
    overtimeRate?: number;
    dayRate?: number;
    rateType: string;
    employeeId?: string;
    benefitsEligible: boolean;
    ptoAccrualRate?: number;
    supervisorName?: string;
    isSeasonal: boolean;
    seasonStartMonth?: number;
    seasonEndMonth?: number;
    seasonsCompleted: number;
    returningWorker: boolean;
    contractStartDate?: string;
    contractEndDate?: string;
    contractAutoRenew: boolean;
    companyName?: string;
    paymentTermsDays: number;
    unionMember: boolean;
    unionLocal?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGAGEMENT TERMS
// ─────────────────────────────────────────────────────────────────────────────

export interface EngagementTerm {
    id: string;
    workerProfileId: string;
    workerName?: string;
    classificationId: string;
    projectId?: string;
    projectName?: string;
    workOrderId?: string;
    role: string;
    department?: string;
    startDate: string;
    endDate?: string;
    isOngoing: boolean;
    rate: number;
    rateType: string;
    overtimeRate?: number;
    notToExceed?: number;
    estimatedHours?: number;
    status: string;
    isBillable: boolean;
    billingCode?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIFIED COMPLIANCE
// ─────────────────────────────────────────────────────────────────────────────

export interface ComplianceTemplate {
    id: string;
    name: string;
    docType: string;
    description?: string;
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
    workerName?: string;
    templateId?: string;
    docType: string;
    docName: string;
    docNumber?: string;
    documentUrl?: string;
    issuedDate?: string;
    expiryDate?: string;
    submittedAt: string;
    reviewedAt?: string;
    status: string;
    reviewedBy?: string;
    rejectionReason?: string;
    coverageAmount?: number;
    policyNumber?: string;
    carrierName?: string;
    notes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ONBOARDING & OFFBOARDING
// ─────────────────────────────────────────────────────────────────────────────

export interface OnboardingStepTemplate {
    id: string;
    name: string;
    description?: string;
    appliesToClassifications: WorkerClassification[];
    stepOrder: number;
    isRequired: boolean;
    defaultDueDays: number;
    assigneeRole?: string;
    linkedComplianceTemplateId?: string;
    autoCompleteOnDocApproval: boolean;
    isActive: boolean;
}

export interface WorkerOnboardingRun {
    id: string;
    workerProfileId: string;
    workerName?: string;
    classificationId?: string;
    classification?: WorkerClassification;
    startedAt: string;
    completedAt?: string;
    targetCompletionDate?: string;
    status: LifecycleStepStatus;
    totalSteps: number;
    completedSteps: number;
    notes?: string;
    steps?: OnboardingStepProgress[];
}

export interface OnboardingStepProgress {
    id: string;
    runId: string;
    templateStepId: string;
    stepName?: string;
    status: LifecycleStepStatus;
    dueDate?: string;
    completedAt?: string;
    completedByName?: string;
    assignedToName?: string;
    evidenceUrl?: string;
    notes?: string;
}

export interface WorkerOffboardingRun {
    id: string;
    workerProfileId: string;
    workerName?: string;
    reason?: string;
    isVoluntary?: boolean;
    eligibleForRehire?: boolean;
    startedAt: string;
    completedAt?: string;
    status: LifecycleStepStatus;
    totalSteps: number;
    completedSteps: number;
    exitInterviewCompleted: boolean;
    exitInterviewNotes?: string;
    notes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKER REVIEWS (Universal)
// ─────────────────────────────────────────────────────────────────────────────

export interface WorkerReview {
    id: string;
    workerProfileId: string;
    workerName?: string;
    projectId?: string;
    projectName?: string;
    workOrderId?: string;
    engagementTermId?: string;
    reviewerId: string;
    reviewerName?: string;
    reviewType: string;
    targetType: ReviewTargetType;
    overallRating: number;
    qualityRating?: number;
    timelinessRating?: number;
    communicationRating?: number;
    professionalismRating?: number;
    reliabilityRating?: number;
    safetyRating?: number;
    strengths?: string;
    areasForImprovement?: string;
    goals?: string;
    comments?: string;
    wouldReengage?: boolean;
    reviewPeriodStart?: string;
    reviewPeriodEnd?: string;
    reviewDate: string;
    acknowledgedAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// IC CLASSIFICATION ASSESSMENTS
// ─────────────────────────────────────────────────────────────────────────────

export interface ClassificationAssessment {
    id: string;
    workerProfileId: string;
    workerName?: string;
    assessmentMethod: ICAssessmentMethod;
    assessmentDate: string;
    nextAssessmentDate?: string;
    result: ICAssessmentResult;
    score?: number;
    factors: Record<string, unknown>;
    assessorId: string;
    assessorName?: string;
    rationale?: string;
    recommendedAction?: string;
    reclassifyTo?: WorkerClassification;
    reclassificationCompleted: boolean;
    reclassificationDate?: string;
    supportingDocUrls: string[];
}
