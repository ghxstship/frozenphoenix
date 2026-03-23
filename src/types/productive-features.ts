// ═══════════════════════════════════════════════════════════════════════════
// ATLVS — Productive.io Feature Types
// CRM, Resource Planning, Billing, Dashboards, Documents, and Automations
// Maintains 3NF compliance and SSOT principles
// ═══════════════════════════════════════════════════════════════════════════

import type { Address, AuditFields, ProductionPhase } from "./production";

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: CRM FOUNDATION
// ─────────────────────────────────────────────────────────────────────────────

export type CompanyType = "client" | "brand" | "agency" | "vendor" | "partner";
export type CompanyStatus = "prospect" | "active" | "inactive" | "churned";
export type ContactStatus = "active" | "inactive";
export type PreferredContactMethod = "email" | "phone" | "mobile";

export interface Company extends AuditFields {
    id: string;
    name: string;
    legalName?: string | undefined;
    industry?: string | undefined;
    website?: string | undefined;
    // Contact Info
    phone?: string | undefined;
    email?: string | undefined;
    // Address
    address?: Address | undefined;
    // Billing
    billingAddressSame: boolean;
    billingAddress?: Address | undefined;
    defaultCurrency: string;
    paymentTermsDays: number;
    taxId?: string | undefined;
    // Relationship
    companyType: CompanyType;
    accountManagerId?: string | undefined;
    parentCompanyId?: string | undefined;
    // Branding
    brandKitId?: string | undefined;
    logoUrl?: string | undefined;
    // Status
    status: CompanyStatus;

    // Metadata
    notes?: string | undefined;
    tags: string[];

    organizationId: string;
}

export interface Contact extends AuditFields {
    id: string;
    companyId?: string | undefined;
    // Name
    firstName: string;
    lastName: string;
    fullName: string;
    preferredName?: string | undefined;
    // Contact Info
    email?: string | undefined;
    phone?: string | undefined;
    mobile?: string | undefined;
    // Position
    title?: string | undefined;
    department?: string | undefined;
    // Role in relationship
    isPrimary: boolean;
    isBillingContact: boolean;
    isDecisionMaker: boolean;

    // Social
    linkedinUrl?: string | undefined;
    // Communication
    preferredContactMethod: PreferredContactMethod;
    timezone: string;

    // Status
    status: ContactStatus;

    // Notes
    notes?: string | undefined;
    tags: string[];

    organizationId: string;
}

export interface PipelineStage {
    id: string;
    name: string;
    order: number;
    probability: number;
    color: string;
    rottingDays?: number | undefined;
}

export interface Pipeline extends AuditFields {
    id: string;
    name: string;
    description?: string | undefined;
    // Configuration
    isDefault: boolean;
    color?: string | undefined;
    icon?: string | undefined;
    // Stages
    stages: PipelineStage[];

    // Automation
    defaultAssigneeId?: string | undefined;
    // Status
    isActive: boolean;

    organizationId: string;
}

export interface LostReason {
    id: string;
    name: string;
    description?: string | undefined;
    isActive: boolean;
    organizationId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: CUSTOM FIELDS
// ─────────────────────────────────────────────────────────────────────────────

export type CustomFieldType =
    | "text"
    | "number"
    | "date"
    | "datetime"
    | "boolean"
    | "select"
    | "multi_select"
    | "url"
    | "email"
    | "phone"
    | "currency"
    | "user"
    | "file";

export type EntityType =
    | "project"
    | "task"
    | "deal"
    | "contact"
    | "company"
    | "crew_member"
    | "asset"
    | "invoice"
    | "proposal"
    | "document";

export interface CustomFieldOption {
    value: string;
    label: string;
    color?: string | undefined;
}

export interface CustomFieldValidation {
    min?: number | undefined;
    max?: number | undefined;
    pattern?: string | undefined;
    minLength?: number | undefined;
    maxLength?: number | undefined;
}

export interface CustomField extends AuditFields {
    id: string;
    entityType: EntityType;

    // Definition
    name: string;
    fieldKey: string;
    fieldType: CustomFieldType;
    description?: string | undefined;
    // Configuration
    isRequired: boolean;
    isFilterable: boolean;
    isVisibleInList: boolean;
    defaultValue?: string | undefined;
    // For select/multi_select types
    options: CustomFieldOption[];

    // Validation
    validationRules: CustomFieldValidation;

    // Display
    displayOrder: number;
    groupName?: string | undefined;
    organizationId: string;
}

export interface CustomFieldValue {
    id: string;
    customFieldId: string;
    entityId: string;

    // Value storage
    valueText?: string | undefined;
    valueNumber?: number | undefined;
    valueBoolean?: boolean | undefined;
    valueDate?: string | undefined;
    valueDatetime?: string | undefined;
    valueJson?: Record<string, unknown> | undefined;
    organizationId: string;
    createdAt: string;
    updatedAt?: string | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: SAVED VIEWS
// ─────────────────────────────────────────────────────────────────────────────

export type ViewType = "board" | "list" | "table" | "calendar" | "timeline" | "gantt" | "workload";

export interface ViewFilter {
    field: string;
    operator:
        | "equals"
        | "not_equals"
        | "contains"
        | "not_contains"
        | "gt"
        | "gte"
        | "lt"
        | "lte"
        | "in"
        | "not_in"
        | "is_empty"
        | "is_not_empty";
    value: unknown;
}

export interface ViewSort {
    field: string;
    direction: "asc" | "desc";
}

export interface BoardConfig {
    groupBy: string;
    cardFields: string[];
    showEmptyColumns: boolean;
    columnOrder?: string[] | undefined;
}

export interface SavedView extends AuditFields {
    id: string;
    entityType: EntityType;
    projectId?: string | undefined;
    // Definition
    name: string;
    description?: string | undefined;
    // View Configuration
    viewType: ViewType;

    // Filters, Sorting, Grouping
    filters: ViewFilter[];
    sortBy: ViewSort[];
    groupBy?: string | undefined;
    // Column Configuration
    visibleColumns: string[];
    columnWidths: Record<string, number>;

    // Board Configuration
    boardConfig?: BoardConfig | undefined;
    // Sharing
    isDefault: boolean;
    isShared: boolean;
    sharedWithTeamIds: string[];

    // Owner
    ownerId: string;

    organizationId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4: AUTOMATIONS
// ─────────────────────────────────────────────────────────────────────────────

export type AutomationTrigger =
    | "created"
    | "updated"
    | "status_changed"
    | "assigned"
    | "due_date_approaching"
    | "overdue"
    | "field_changed"
    | "time_logged"
    | "budget_threshold"
    | "scheduled";

export type AutomationAction =
    | "send_notification"
    | "send_email"
    | "update_field"
    | "create_task"
    | "assign_user"
    | "move_stage"
    | "add_comment"
    | "webhook"
    | "slack_message";

export interface AutomationTriggerConfig {
    field?: string | undefined;
    from?: string | undefined;
    to?: string | undefined;
    daysBefore?: number | undefined;
    threshold?: number | undefined;
    schedule?: string; // cron expression
}

export interface AutomationCondition {
    field: string;
    operator: "equals" | "not_equals" | "contains" | "gt" | "lt" | "is_empty" | "is_not_empty";
    value: unknown;
}

export interface AutomationActionConfig {
    userId?: string | undefined;
    userIds?: string[] | undefined;
    message?: string | undefined;
    field?: string | undefined;
    value?: unknown | undefined;
    taskTitle?: string | undefined;
    webhookUrl?: string | undefined;
    channel?: string | undefined;
    template?: string | undefined;
}

export interface Automation extends AuditFields {
    id: string;
    name: string;
    description?: string | undefined;
    // Scope
    entityType: EntityType;
    projectId?: string | undefined;
    // Status
    isActive: boolean;

    // Execution
    lastTriggeredAt?: string | undefined;
    triggerCount: number;

    organizationId: string;
}

export interface AutomationRule {
    id: string;
    automationId: string;

    // Trigger
    triggerType: AutomationTrigger;
    triggerConfig: AutomationTriggerConfig;

    // Conditions
    conditions: AutomationCondition[];

    // Action
    actionType: AutomationAction;
    actionConfig: AutomationActionConfig;

    // Order
    executionOrder: number;

    // Status
    isActive: boolean;

    createdAt: string;
    updatedAt?: string | undefined;
}

export interface AutomationLog {
    id: string;
    automationId: string;
    automationRuleId?: string | undefined;
    // Execution
    entityId: string;
    triggeredAt: string;

    // Result
    success: boolean;
    errorMessage?: string | undefined;
    executionData: Record<string, unknown>;

    organizationId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: RATE CARDS & BILLING
// ─────────────────────────────────────────────────────────────────────────────

export type BillingType =
    | "fixed_price"
    | "time_and_materials"
    | "retainer"
    | "non_billable"
    | "milestone";
export type RateType = "hourly" | "daily" | "weekly" | "flat";

export interface RateCard extends AuditFields {
    id: string;
    name: string;
    description?: string | undefined;
    // Type
    isDefault: boolean;
    companyId?: string | undefined;
    // Currency
    currency: string;

    // Validity
    effectiveDate?: string | undefined;
    expirationDate?: string | undefined;
    // Status
    isActive: boolean;

    organizationId: string;
}

export interface RateCardItem {
    id: string;
    rateCardId: string;

    // Service Definition
    serviceName: string;
    serviceDescription?: string | undefined;
    // Role/Department
    role?: string | undefined;
    department?: string | undefined;
    // Rates
    hourlyRate?: number | undefined;
    dailyRate?: number | undefined;
    unitRate?: number | undefined;
    unitName: string;

    // Cost (internal)
    internalCostRate?: number | undefined;
    // Billing
    billingType: BillingType;
    isBillable: boolean;

    createdAt: string;
    updatedAt?: string | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6: RESOURCE PLANNING
// ─────────────────────────────────────────────────────────────────────────────

export type BookingStatus = "tentative" | "confirmed" | "cancelled";
export type BookingType = "project_work" | "internal" | "time_off" | "training" | "admin";
export type TimeOffType =
    | "vacation"
    | "sick"
    | "personal"
    | "parental"
    | "bereavement"
    | "jury_duty"
    | "holiday"
    | "unpaid"
    | "other";
export type TimeOffStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface ResourceBooking extends AuditFields {
    id: string;

    // Resource
    crewMemberId?: string | undefined;
    placeholderName?: string | undefined;
    // Project/Task
    projectId?: string | undefined;
    taskId?: string | undefined;
    // Booking Details
    bookingType: BookingType;
    status: BookingStatus;

    // Time
    startDate: string;
    endDate: string;
    hoursPerDay: number;
    totalHours: number;

    // Role
    role?: string | undefined;
    department?: string | undefined;
    // Rates
    rate?: number | undefined;
    rateType: RateType;

    // Notes
    notes?: string | undefined;
    // Conflict tracking
    hasConflict: boolean;

    organizationId: string;
}

export interface TimeOffRequest extends AuditFields {
    id: string;
    crewMemberId: string;

    // Request Details
    timeOffType: TimeOffType;
    startDate: string;
    endDate: string;
    hoursPerDay: number;
    isHalfDay: boolean;

    // Reason
    reason?: string | undefined;
    // Approval
    status: TimeOffStatus;
    approverId?: string | undefined;
    approvedAt?: string | undefined;
    rejectionReason?: string | undefined;
    // Notes
    notes?: string | undefined;
    organizationId: string;
}

export interface ActiveTimer {
    id: string;
    userId: string;

    // What are we timing
    projectId?: string | undefined;
    taskId?: string | undefined;
    // Timer
    startedAt: string;
    description?: string | undefined;
    // Billing
    isBillable: boolean;

    organizationId: string;
}

export interface UtilizationData {
    crewMemberId: string;
    crewMemberName: string;
    department?: string | undefined;
    periodStart: string;
    periodEnd: string;
    availableHours: number;
    bookedHours: number;
    utilizationPercent: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7: PROPOSALS & QUOTES
// ─────────────────────────────────────────────────────────────────────────────

export type ProposalStatus =
    | "draft"
    | "sent"
    | "viewed"
    | "accepted"
    | "rejected"
    | "expired"
    | "revised";

export interface Proposal extends AuditFields {
    id: string;
    dealId?: string | undefined;
    companyId?: string | undefined;
    contactId?: string | undefined;
    // Identification
    number: string;
    title: string;

    // Content
    introduction?: string | undefined;
    scopeOfWork?: string | undefined;
    deliverables?: string | undefined;
    termsAndConditions?: string | undefined;
    // Pricing
    subtotal: number;
    discountPercent: number;
    discountAmount: number;
    taxPercent: number;
    taxAmount: number;
    total: number;
    currency: string;

    // Timeline
    validUntil?: string | undefined;
    proposedStartDate?: string | undefined;
    proposedEndDate?: string | undefined;
    // Status
    status: ProposalStatus;
    sentAt?: string | undefined;
    viewedAt?: string | undefined;
    acceptedAt?: string | undefined;
    rejectedAt?: string | undefined;
    // Signature
    signatureRequired: boolean;
    signedBy?: string | undefined;
    signedAt?: string | undefined;
    signatureIp?: string | undefined;
    // Conversion
    convertedProjectId?: string | undefined;
    // Template
    templateId?: string | undefined;
    // Versioning
    version: number;
    parentProposalId?: string | undefined;
    organizationId: string;
}

export interface ProposalItem {
    id: string;
    proposalId: string;

    // Item Details
    name: string;
    description?: string | undefined;
    // Pricing
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;

    // Categorization
    category?: string | undefined;
    phase?: ProductionPhase | undefined;
    // Rate Card Reference
    rateCardItemId?: string | undefined;
    // Display
    displayOrder: number;
    isOptional: boolean;

    createdAt: string;
    updatedAt?: string | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 8: ENHANCED INVOICING
// ─────────────────────────────────────────────────────────────────────────────

export type InvoiceDeliveryStatus =
    | "draft"
    | "sent"
    | "viewed"
    | "reminded"
    | "paid"
    | "overdue"
    | "disputed"
    | "void";
export type PaymentStatus = "pending" | "partial" | "paid" | "refunded" | "failed";
export type PaymentMethod = "corporate_card" | "personal_card" | "cash" | "check" | "wire" | "ach";

export interface InvoiceTemplate extends AuditFields {
    id: string;
    name: string;

    // Branding
    logoUrl?: string | undefined;
    headerText?: string | undefined;
    footerText?: string | undefined;
    // Styling
    primaryColor: string;
    accentColor: string;
    fontFamily: string;

    // Content
    showLogo: boolean;
    showCompanyAddress: boolean;
    showLineItemDetails: boolean;
    showTaxBreakdown: boolean;

    // Payment
    paymentInstructions?: string | undefined;
    bankDetails?: string | undefined;
    // Default
    isDefault: boolean;

    organizationId: string;
}

export interface RecurringInvoice extends AuditFields {
    id: string;
    companyId: string;
    projectId?: string | undefined;
    // Schedule
    frequency: "weekly" | "biweekly" | "monthly" | "quarterly" | "annually";
    dayOfMonth?: number | undefined;
    dayOfWeek?: number | undefined;
    // Dates
    startDate: string;
    endDate?: string | undefined;
    nextInvoiceDate: string;
    lastInvoiceDate?: string | undefined;
    // Amount
    amount: number;
    currency: string;

    // Template
    templateId?: string | undefined;
    // Content
    description?: string | undefined;
    lineItems: RecurringInvoiceLineItem[];

    // Status
    isActive: boolean;
    invoicesGenerated: number;

    organizationId: string;
}

export interface RecurringInvoiceLineItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface Payment {
    id: string;
    invoiceId: string;

    // Payment Details
    amount: number;
    currency: string;
    paymentDate: string;

    // Method
    paymentMethod: PaymentMethod;
    referenceNumber?: string | undefined;
    // Status
    status: PaymentStatus;

    // Notes
    notes?: string | undefined;
    organizationId: string;
    createdBy?: string | undefined;
    createdAt: string;
}

export interface CreditNote extends AuditFields {
    id: string;
    invoiceId: string;

    // Identification
    number: string;

    // Amount
    amount: number;
    currency: string;

    // Reason
    reason: string;

    // Status
    status: "draft" | "issued" | "applied" | "void";
    issuedAt?: string | undefined;
    appliedAt?: string | undefined;
    organizationId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 9: DASHBOARDS & REPORTING
// ─────────────────────────────────────────────────────────────────────────────

export type WidgetType =
    | "number"
    | "chart_bar"
    | "chart_line"
    | "chart_pie"
    | "chart_donut"
    | "table"
    | "list"
    | "progress"
    | "gauge"
    | "calendar"
    | "timeline";

export type TimeRange =
    | "today"
    | "yesterday"
    | "this_week"
    | "last_week"
    | "this_month"
    | "last_month"
    | "this_quarter"
    | "last_quarter"
    | "this_year"
    | "last_year"
    | "custom";

export interface DashboardLayout {
    widgetId: string;
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface Dashboard extends AuditFields {
    id: string;
    name: string;
    description?: string | undefined;
    // Layout
    layout: DashboardLayout[];

    // Sharing
    isDefault: boolean;
    isShared: boolean;
    sharedWithRole?: string | undefined;
    // Owner
    ownerId: string;

    organizationId: string;
}

export interface WidgetConfig {
    metric?: string | undefined;
    xAxis?: string | undefined;
    yAxis?: string | undefined;
    groupBy?: string | undefined;
    aggregation?: "count" | "sum" | "avg" | "min" | "max" | undefined;
    limit?: number | undefined;
}

export interface DashboardWidget extends AuditFields {
    id: string;
    dashboardId: string;

    // Widget Definition
    name: string;
    widgetType: WidgetType;

    // Data Source
    dataSource: string;

    // Configuration
    config: WidgetConfig;

    // Filters
    filters: ViewFilter[];

    // Time Range
    timeRange: TimeRange;
    customStartDate?: string | undefined;
    customEndDate?: string | undefined;
    // Refresh
    refreshIntervalSeconds: number;
    lastRefreshedAt?: string | undefined;
    // Display
    title?: string | undefined;
    subtitle?: string | undefined;
    color?: string | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 10: DOCUMENTS & COLLABORATION
// ─────────────────────────────────────────────────────────────────────────────

export type DocumentType =
    | "doc"
    | "wiki"
    | "meeting_notes"
    | "specification"
    | "proposal_doc"
    | "sow"
    | "template";
export type DocumentStatus = "draft" | "pending_review" | "published" | "archived";

export interface Document extends AuditFields {
    id: string;

    // Hierarchy
    parentId?: string | undefined;
    projectId?: string | undefined;
    // Content
    title: string;
    content: Record<string, unknown>; // ProseMirror/TipTap JSON format

    // Type
    documentType: DocumentType;

    // Template
    templateId?: string | undefined;
    // Status
    status: DocumentStatus;
    publishedAt?: string | undefined;
    // Cover
    coverImageUrl?: string | undefined;
    icon?: string | undefined;
    // Sharing
    isPublic: boolean;
    sharedWithUserIds: string[];
    sharedWithTeamIds: string[];

    // Permissions
    canComment: boolean;
    canEdit: boolean;

    // Owner
    ownerId: string;

    // Last Editor
    lastEditedBy?: string | undefined;
    organizationId: string;
}

export interface DocumentVersion {
    id: string;
    documentId: string;

    // Version
    versionNumber: number;

    // Content Snapshot
    content: Record<string, unknown>;
    title: string;

    // Metadata
    createdBy?: string | undefined;
    createdAt: string;

    // Change Description
    changeDescription?: string | undefined;
}

export interface DocumentTemplate extends AuditFields {
    id: string;
    name: string;
    description?: string | undefined;
    // Content
    content: Record<string, unknown>;

    // Type
    documentType: DocumentType;

    // Category
    category?: string | undefined;
    // Preview
    previewImageUrl?: string | undefined;
    // Status
    isActive: boolean;

    organizationId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 11: EXTENDED DEAL TYPE
// ─────────────────────────────────────────────────────────────────────────────

export interface DealExtended {
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
    // New fields
    pipelineId?: string | undefined;
    companyId?: string | undefined;
    contactId?: string | undefined;
    lostReasonId?: string | undefined;
    convertedProjectId?: string | undefined;
    convertedAt?: string | undefined;
    createdAt: string;
    updatedAt: string;
    organizationId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 12: REPORTING VIEWS
// ─────────────────────────────────────────────────────────────────────────────

export interface ProjectProfitability {
    projectId: string;
    name: string;
    client: string;
    companyId?: string | undefined;
    budgetPlanned: number;
    budgetActual: number;
    budgetVariance: number;
    marginPercent: number;
    totalHoursLogged: number;
    totalLaborCost: number;
    totalExpenses: number;
}

export interface PipelineSummary {
    organizationId: string;
    pipelineId?: string | undefined;
    pipelineName?: string | undefined;
    stage: string;
    dealCount: number;
    totalValue: number;
    avgProbability: number;
    weightedValue: number;
}

export interface InvoiceAging {
    organizationId: string;
    invoiceId: string;
    vendorId?: string | undefined;
    companyId?: string | undefined;
    amount: number;
    dueDate: string;
    status: string;
    daysOverdue: number;
    agingBucket: "current" | "1-30 days" | "31-60 days" | "61-90 days" | "90+ days";
}
