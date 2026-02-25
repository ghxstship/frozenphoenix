/* ═══════════════════════════════════════════════════════════════
   PLAYBOOK — CRM & Revenue Pipeline Types
   Migration 013 entities
   ═══════════════════════════════════════════════════════════════ */

// ─── Opportunity Enums ───

export type OpportunityStage =
    | "discovery"
    | "qualification"
    | "proposal_sent"
    | "proposal_review"
    | "negotiation"
    | "contract_sent"
    | "won"
    | "lost"
    | "on_hold";

export type OpportunityType =
    | "new_business"
    | "expansion"
    | "renewal"
    | "upsell";

export type OpportunityActivityType =
    | "call"
    | "email"
    | "meeting"
    | "note"
    | "task"
    | "proposal_sent"
    | "contract_sent";

// ─── Change Order Enums ───

export type ChangeOrderType =
    | "scope_addition"
    | "scope_reduction"
    | "timeline_change"
    | "budget_adjustment"
    | "combined";

export type ChangeOrderStatus =
    | "draft"
    | "pending_review"
    | "pending_client"
    | "approved"
    | "rejected"
    | "void";

// ─── Revenue Enums ───

export type RevenueRecognitionType =
    | "milestone"
    | "percentage_of_completion"
    | "time_based"
    | "event_based";

export type RevenueScheduleStatus =
    | "scheduled"
    | "invoiced"
    | "recognized"
    | "deferred"
    | "reversed";

// ─── Account Health Enums ───

export type AccountRiskLevel =
    | "low"
    | "medium"
    | "high"
    | "critical";

// ─── Opportunity ───

export interface Opportunity {
    id: string;
    companyId: string;
    primaryContactId?: string;
    leadId?: string;
    pipelineId?: string;

    name: string;
    description?: string;

    type: OpportunityType;
    stage: OpportunityStage;

    value: number;
    probability: number;
    weightedValue: number;
    currency: string;

    expectedCloseDate?: string;
    actualCloseDate?: string;

    assignedTo?: string;
    assignedToName?: string;

    convertedToDealId?: string;
    lostReasonId?: string;
    lostReasonNote?: string;

    competitor?: string;
    nextStep?: string;
    lastActivityAt?: string;

    tags: string[];

    // Joined fields (from company/contact)
    companyName?: string;
    contactName?: string;
    contactEmail?: string;

    organizationId: string;
    createdBy?: string;
    updatedBy?: string;
    createdAt: string;
    updatedAt: string;
}

// ─── Opportunity Activity ───

export interface OpportunityActivity {
    id: string;
    opportunityId: string;

    type: OpportunityActivityType;
    subject: string;
    description?: string;

    contactId?: string;
    contactName?: string;
    performedBy?: string;
    performedByName?: string;
    performedAt: string;

    durationMinutes?: number;
    outcome?: string;

    metadata?: Record<string, unknown>;
    organizationId: string;
    createdAt: string;
}

// ─── Change Order ───

export interface ChangeOrder {
    id: string;
    projectId: string;
    sowId?: string;
    companyId: string;

    number: string;
    title: string;
    description?: string;

    changeType: ChangeOrderType;
    valueImpact: number;
    scheduleImpactDays: number;

    reason?: string;
    businessCase?: string;

    status: ChangeOrderStatus;
    requestedBy?: string;
    requestedByName?: string;
    requestedAt: string;
    reviewedBy?: string;
    reviewedAt?: string;
    approvedBy?: string;
    approvedAt?: string;
    clientApprovedBy?: string;
    clientApprovedAt?: string;

    scopeAdditions?: string;
    scopeRemovals?: string;
    deliverablesAdded: Record<string, unknown>[];
    deliverablesRemoved: Record<string, unknown>[];

    notes?: string;
    tags: string[];

    // Joined fields
    projectName?: string;
    companyName?: string;

    organizationId: string;
    createdBy?: string;
    updatedBy?: string;
    createdAt: string;
    updatedAt: string;
}

// ─── Change Order Log Entry ───

export interface ChangeOrderLogEntry {
    id: string;
    changeOrderId: string;

    action: string;
    fieldName?: string;
    oldValue?: string;
    newValue?: string;
    changeSummary?: string;

    performedBy?: string;
    performedByName?: string;
    performedAt: string;

    metadata?: Record<string, unknown>;
    organizationId: string;
}

// ─── Revenue Schedule ───

export interface RevenueSchedule {
    id: string;
    projectId: string;
    dealId?: string;
    sowDeliverableId?: string;
    changeOrderId?: string;
    clientInvoiceId?: string;

    type: RevenueRecognitionType;
    description: string;

    contractedAmount: number;
    invoicedAmount: number;
    recognizedAmount: number;
    currency: string;

    scheduledDate: string;
    invoicedAt?: string;
    recognizedAt?: string;

    status: RevenueScheduleStatus;
    percentComplete: number;

    notes?: string;

    // Joined fields
    projectName?: string;
    dealTitle?: string;
    deliverableName?: string;

    organizationId: string;
    createdBy?: string;
    updatedBy?: string;
    createdAt: string;
    updatedAt: string;
}

// ─── Account Health Score ───

export interface AccountHealthScore {
    id: string;
    companyId: string;

    scoreDate: string;
    overallScore: number;

    deliveryScore: number;
    paymentScore: number;
    engagementScore: number;
    satisfactionScore: number;
    expansionScore: number;

    riskLevel: AccountRiskLevel;
    riskFactors: { factor: string; severity: AccountRiskLevel; detail?: string }[];
    recommendations: { action: string; priority: string; detail?: string }[];

    lifetimeRevenue: number;
    activeProjectCount: number;
    openOpportunityCount: number;
    overdueInvoiceCount: number;

    notes?: string;
    scoredBy?: string;

    // Joined
    companyName?: string;

    organizationId: string;
    createdAt: string;
}

// ─── Account Revenue Summary (View projection) ───

export interface AccountRevenueSummary {
    companyId: string;
    companyName: string;
    companyStatus: string;
    organizationId: string;
    dealCount: number;
    projectCount: number;
    openOpportunityCount: number;
    totalContracted: number;
    totalInvoiced: number;
    totalRecognized: number;
    totalCollected: number;
    lastDealDate?: string;
    lastOpportunityDate?: string;
}

// ─── Pipeline Forecast (View projection) ───

export interface PipelineForecast {
    organizationId: string;
    forecastMonth: string;
    opportunityType: OpportunityType;
    stage: OpportunityStage;
    opportunityCount: number;
    totalValue: number;
    weightedValue: number;
    avgProbability: number;
}

// ─── Deal with Revenue Fields (extends productive-features DealExtended) ───

export interface DealRevenue {
    id: string;
    title: string;
    company: string;
    contactName: string;
    contactEmail: string;
    value: number;
    stage: string;
    probability: number;
    expectedCloseDate: string;
    assignedTo: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;

    // New FK fields (migration 013)
    companyId?: string;
    contactId?: string;
    opportunityId?: string;
    contractedValue?: number;
    contractId?: string;
    closedAt?: string;
    closedBy?: string;
    totalInvoiced: number;
    totalRecognized: number;
    totalCollected: number;

    // Joined
    companyName?: string;
    contactFullName?: string;
}

// ─── Project with Revenue Fields ───

export interface ProjectRevenue {
    id: string;
    name: string;
    client: string;
    clientLogo?: string;
    status: string;
    currentPhase: string;
    startDate: string;
    endDate: string;
    budgetPlanned: number;
    budgetActual: number;
    progress: number;
    managerId: string;
    teamIds: string[];
    createdAt: string;

    // New FK fields (migration 013)
    companyId?: string;
    dealId?: string;
    primaryContactId?: string;
    contractedValue?: number;
    changeOrderValue: number;
    grossMarginPercent?: number;

    // Computed
    totalContracted?: number;

    // Joined
    companyName?: string;
    dealTitle?: string;
    contactName?: string;
}
