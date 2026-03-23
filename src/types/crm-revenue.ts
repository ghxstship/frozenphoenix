/* ═══════════════════════════════════════════════════════════════
   ATLVS — CRM & Revenue Pipeline Types
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

export type OpportunityType = "new_business" | "expansion" | "renewal" | "upsell";

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

export type AccountRiskLevel = "low" | "medium" | "high" | "critical";

// ─── Opportunity ───

export interface Opportunity {
    id: string;
    companyId: string;
    primaryContactId?: string | undefined;
    leadId?: string | undefined;
    pipelineId?: string | undefined;
    name: string;
    description?: string | undefined;
    type: OpportunityType;
    stage: OpportunityStage;

    value: number;
    probability: number;
    weightedValue: number;
    currency: string;

    expectedCloseDate?: string | undefined;
    actualCloseDate?: string | undefined;
    assignedTo?: string | undefined;
    assignedToName?: string | undefined;
    convertedToDealId?: string | undefined;
    lostReasonId?: string | undefined;
    lostReasonNote?: string | undefined;
    competitor?: string | undefined;
    nextStep?: string | undefined;
    lastActivityAt?: string | undefined;
    tags: string[];

    // Joined fields (from company/contact)
    companyName?: string | undefined;
    contactName?: string | undefined;
    contactEmail?: string | undefined;
    organizationId: string;
    createdBy?: string | undefined;
    updatedBy?: string | undefined;
    createdAt: string;
    updatedAt: string;
}

// ─── Opportunity Activity ───

export interface OpportunityActivity {
    id: string;
    opportunityId: string;

    type: OpportunityActivityType;
    subject: string;
    description?: string | undefined;
    contactId?: string | undefined;
    contactName?: string | undefined;
    performedBy?: string | undefined;
    performedByName?: string | undefined;
    performedAt: string;

    durationMinutes?: number | undefined;
    outcome?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    organizationId: string;
    createdAt: string;
}

// ─── Change Order ───

export interface ChangeOrder {
    id: string;
    projectId: string;
    sowId?: string | undefined;
    companyId: string;

    number: string;
    title: string;
    description?: string | undefined;
    changeType: ChangeOrderType;
    valueImpact: number;
    scheduleImpactDays: number;

    reason?: string | undefined;
    businessCase?: string | undefined;
    status: ChangeOrderStatus;
    requestedBy?: string | undefined;
    requestedByName?: string | undefined;
    requestedAt: string;
    reviewedBy?: string | undefined;
    reviewedAt?: string | undefined;
    approvedBy?: string | undefined;
    approvedAt?: string | undefined;
    clientApprovedBy?: string | undefined;
    clientApprovedAt?: string | undefined;
    scopeAdditions?: string | undefined;
    scopeRemovals?: string | undefined;
    deliverablesAdded: Record<string, unknown>[];
    deliverablesRemoved: Record<string, unknown>[];

    notes?: string | undefined;
    tags: string[];

    // Joined fields
    projectName?: string | undefined;
    companyName?: string | undefined;
    organizationId: string;
    createdBy?: string | undefined;
    updatedBy?: string | undefined;
    createdAt: string;
    updatedAt: string;
}

// ─── Change Order Log Entry ───

export interface ChangeOrderLogEntry {
    id: string;
    changeOrderId: string;

    action: string;
    fieldName?: string | undefined;
    oldValue?: string | undefined;
    newValue?: string | undefined;
    changeSummary?: string | undefined;
    performedBy?: string | undefined;
    performedByName?: string | undefined;
    performedAt: string;

    metadata?: Record<string, unknown> | undefined;
    organizationId: string;
}

// ─── Revenue Schedule ───

export interface RevenueSchedule {
    id: string;
    projectId: string;
    dealId?: string | undefined;
    sowDeliverableId?: string | undefined;
    changeOrderId?: string | undefined;
    clientInvoiceId?: string | undefined;
    type: RevenueRecognitionType;
    description: string;

    contractedAmount: number;
    invoicedAmount: number;
    recognizedAmount: number;
    currency: string;

    scheduledDate: string;
    invoicedAt?: string | undefined;
    recognizedAt?: string | undefined;
    status: RevenueScheduleStatus;
    percentComplete: number;

    notes?: string | undefined;
    // Joined fields
    projectName?: string | undefined;
    dealTitle?: string | undefined;
    deliverableName?: string | undefined;
    organizationId: string;
    createdBy?: string | undefined;
    updatedBy?: string | undefined;
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

    notes?: string | undefined;
    scoredBy?: string | undefined;
    // Joined
    companyName?: string | undefined;
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
    lastDealDate?: string | undefined;
    lastOpportunityDate?: string | undefined;
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
    notes?: string | undefined;
    createdAt: string;
    updatedAt: string;

    // New FK fields (migration 013)
    companyId?: string | undefined;
    contactId?: string | undefined;
    opportunityId?: string | undefined;
    contractedValue?: number | undefined;
    contractId?: string | undefined;
    closedAt?: string | undefined;
    closedBy?: string | undefined;
    totalInvoiced: number;
    totalRecognized: number;
    totalCollected: number;

    // Joined
    companyName?: string | undefined;
    contactFullName?: string | undefined;
}

// ─── Project with Revenue Fields ───

export interface ProjectRevenue {
    id: string;
    name: string;
    client: string;
    clientLogo?: string | undefined;
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
    companyId?: string | undefined;
    dealId?: string | undefined;
    primaryContactId?: string | undefined;
    contractedValue?: number | undefined;
    changeOrderValue: number;
    grossMarginPercent?: number | undefined;
    // Computed
    totalContracted?: number | undefined;
    // Joined
    companyName?: string | undefined;
    dealTitle?: string | undefined;
    contactName?: string | undefined;
}
