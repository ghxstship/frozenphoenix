// ═══════════════════════════════════════════════════════════════════════════
// FROZEN PHOENIX — Productive.io Feature Types
// CRM, Resource Planning, Billing, Dashboards, Documents, and Automations
// Maintains 3NF compliance and SSOT principles
// ═══════════════════════════════════════════════════════════════════════════

import type { AuditFields, ProductionPhase, Address } from './production';

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: CRM FOUNDATION
// ─────────────────────────────────────────────────────────────────────────────

export type CompanyType = 'client' | 'brand' | 'agency' | 'vendor' | 'partner';
export type CompanyStatus = 'prospect' | 'active' | 'inactive' | 'churned';
export type ContactStatus = 'active' | 'inactive';
export type PreferredContactMethod = 'email' | 'phone' | 'mobile';

export interface Company extends AuditFields {
    id: string;
    name: string;
    legalName?: string;
    industry?: string;
    website?: string;
    
    // Contact Info
    phone?: string;
    email?: string;
    
    // Address
    address?: Address;
    
    // Billing
    billingAddressSame: boolean;
    billingAddress?: Address;
    defaultCurrency: string;
    paymentTermsDays: number;
    taxId?: string;
    
    // Relationship
    companyType: CompanyType;
    accountManagerId?: string;
    parentCompanyId?: string;
    
    // Branding
    brandKitId?: string;
    logoUrl?: string;
    
    // Status
    status: CompanyStatus;
    
    // Metadata
    notes?: string;
    tags: string[];
    
    organizationId: string;
}

export interface Contact extends AuditFields {
    id: string;
    companyId?: string;
    
    // Name
    firstName: string;
    lastName: string;
    fullName: string;
    preferredName?: string;
    
    // Contact Info
    email?: string;
    phone?: string;
    mobile?: string;
    
    // Position
    title?: string;
    department?: string;
    
    // Role in relationship
    isPrimary: boolean;
    isBillingContact: boolean;
    isDecisionMaker: boolean;
    
    // Social
    linkedinUrl?: string;
    
    // Communication
    preferredContactMethod: PreferredContactMethod;
    timezone: string;
    
    // Status
    status: ContactStatus;
    
    // Notes
    notes?: string;
    tags: string[];
    
    organizationId: string;
}

export interface PipelineStage {
    id: string;
    name: string;
    order: number;
    probability: number;
    color: string;
    rottingDays?: number;
}

export interface Pipeline extends AuditFields {
    id: string;
    name: string;
    description?: string;
    
    // Configuration
    isDefault: boolean;
    color?: string;
    icon?: string;
    
    // Stages
    stages: PipelineStage[];
    
    // Automation
    defaultAssigneeId?: string;
    
    // Status
    isActive: boolean;
    
    organizationId: string;
}

export interface LostReason {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    organizationId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: CUSTOM FIELDS
// ─────────────────────────────────────────────────────────────────────────────

export type CustomFieldType = 
    | 'text' | 'number' | 'date' | 'datetime' | 'boolean' 
    | 'select' | 'multi_select' | 'url' | 'email' | 'phone' 
    | 'currency' | 'user' | 'file';

export type EntityType = 
    | 'project' | 'task' | 'deal' | 'contact' | 'company' 
    | 'crew_member' | 'asset' | 'invoice' | 'proposal' | 'document';

export interface CustomFieldOption {
    value: string;
    label: string;
    color?: string;
}

export interface CustomFieldValidation {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
}

export interface CustomField extends AuditFields {
    id: string;
    entityType: EntityType;
    
    // Definition
    name: string;
    fieldKey: string;
    fieldType: CustomFieldType;
    description?: string;
    
    // Configuration
    isRequired: boolean;
    isFilterable: boolean;
    isVisibleInList: boolean;
    defaultValue?: string;
    
    // For select/multi_select types
    options: CustomFieldOption[];
    
    // Validation
    validationRules: CustomFieldValidation;
    
    // Display
    displayOrder: number;
    groupName?: string;
    
    organizationId: string;
}

export interface CustomFieldValue {
    id: string;
    customFieldId: string;
    entityId: string;
    
    // Value storage
    valueText?: string;
    valueNumber?: number;
    valueBoolean?: boolean;
    valueDate?: string;
    valueDatetime?: string;
    valueJson?: Record<string, unknown>;
    
    organizationId: string;
    createdAt: string;
    updatedAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: SAVED VIEWS
// ─────────────────────────────────────────────────────────────────────────────

export type ViewType = 'board' | 'list' | 'table' | 'calendar' | 'timeline' | 'gantt' | 'workload';

export interface ViewFilter {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'is_empty' | 'is_not_empty';
    value: unknown;
}

export interface ViewSort {
    field: string;
    direction: 'asc' | 'desc';
}

export interface BoardConfig {
    groupBy: string;
    cardFields: string[];
    showEmptyColumns: boolean;
    columnOrder?: string[];
}

export interface SavedView extends AuditFields {
    id: string;
    entityType: EntityType;
    projectId?: string;
    
    // Definition
    name: string;
    description?: string;
    
    // View Configuration
    viewType: ViewType;
    
    // Filters, Sorting, Grouping
    filters: ViewFilter[];
    sortBy: ViewSort[];
    groupBy?: string;
    
    // Column Configuration
    visibleColumns: string[];
    columnWidths: Record<string, number>;
    
    // Board Configuration
    boardConfig?: BoardConfig;
    
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
    | 'created' | 'updated' | 'status_changed' | 'assigned' 
    | 'due_date_approaching' | 'overdue' | 'field_changed' 
    | 'time_logged' | 'budget_threshold' | 'scheduled';

export type AutomationAction = 
    | 'send_notification' | 'send_email' | 'update_field' 
    | 'create_task' | 'assign_user' | 'move_stage' 
    | 'add_comment' | 'webhook' | 'slack_message';

export interface AutomationTriggerConfig {
    field?: string;
    from?: string;
    to?: string;
    daysBefore?: number;
    threshold?: number;
    schedule?: string; // cron expression
}

export interface AutomationCondition {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'gt' | 'lt' | 'is_empty' | 'is_not_empty';
    value: unknown;
}

export interface AutomationActionConfig {
    userId?: string;
    userIds?: string[];
    message?: string;
    field?: string;
    value?: unknown;
    taskTitle?: string;
    webhookUrl?: string;
    channel?: string;
    template?: string;
}

export interface Automation extends AuditFields {
    id: string;
    name: string;
    description?: string;
    
    // Scope
    entityType: EntityType;
    projectId?: string;
    
    // Status
    isActive: boolean;
    
    // Execution
    lastTriggeredAt?: string;
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
    updatedAt?: string;
}

export interface AutomationLog {
    id: string;
    automationId: string;
    automationRuleId?: string;
    
    // Execution
    entityId: string;
    triggeredAt: string;
    
    // Result
    success: boolean;
    errorMessage?: string;
    executionData: Record<string, unknown>;
    
    organizationId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: RATE CARDS & BILLING
// ─────────────────────────────────────────────────────────────────────────────

export type BillingType = 'fixed_price' | 'time_and_materials' | 'retainer' | 'non_billable' | 'milestone';
export type RateType = 'hourly' | 'daily' | 'weekly' | 'flat';

export interface RateCard extends AuditFields {
    id: string;
    name: string;
    description?: string;
    
    // Type
    isDefault: boolean;
    companyId?: string;
    
    // Currency
    currency: string;
    
    // Validity
    effectiveDate?: string;
    expirationDate?: string;
    
    // Status
    isActive: boolean;
    
    organizationId: string;
}

export interface RateCardItem {
    id: string;
    rateCardId: string;
    
    // Service Definition
    serviceName: string;
    serviceDescription?: string;
    
    // Role/Department
    role?: string;
    department?: string;
    
    // Rates
    hourlyRate?: number;
    dailyRate?: number;
    unitRate?: number;
    unitName: string;
    
    // Cost (internal)
    internalCostRate?: number;
    
    // Billing
    billingType: BillingType;
    isBillable: boolean;
    
    createdAt: string;
    updatedAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6: RESOURCE PLANNING
// ─────────────────────────────────────────────────────────────────────────────

export type BookingStatus = 'tentative' | 'confirmed' | 'cancelled';
export type BookingType = 'project_work' | 'internal' | 'time_off' | 'training' | 'admin';
export type TimeOffType = 'vacation' | 'sick' | 'personal' | 'parental' | 'bereavement' | 'jury_duty' | 'holiday' | 'unpaid' | 'other';
export type TimeOffStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface ResourceBooking extends AuditFields {
    id: string;
    
    // Resource
    crewMemberId?: string;
    placeholderName?: string;
    
    // Project/Task
    projectId?: string;
    taskId?: string;
    
    // Booking Details
    bookingType: BookingType;
    status: BookingStatus;
    
    // Time
    startDate: string;
    endDate: string;
    hoursPerDay: number;
    totalHours: number;
    
    // Role
    role?: string;
    department?: string;
    
    // Rates
    rate?: number;
    rateType: RateType;
    
    // Notes
    notes?: string;
    
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
    reason?: string;
    
    // Approval
    status: TimeOffStatus;
    approverId?: string;
    approvedAt?: string;
    rejectionReason?: string;
    
    // Notes
    notes?: string;
    
    organizationId: string;
}

export interface ActiveTimer {
    id: string;
    userId: string;
    
    // What are we timing
    projectId?: string;
    taskId?: string;
    
    // Timer
    startedAt: string;
    description?: string;
    
    // Billing
    isBillable: boolean;
    
    organizationId: string;
}

export interface UtilizationData {
    crewMemberId: string;
    crewMemberName: string;
    department?: string;
    periodStart: string;
    periodEnd: string;
    availableHours: number;
    bookedHours: number;
    utilizationPercent: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7: PROPOSALS & QUOTES
// ─────────────────────────────────────────────────────────────────────────────

export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'revised';

export interface Proposal extends AuditFields {
    id: string;
    dealId?: string;
    companyId?: string;
    contactId?: string;
    
    // Identification
    number: string;
    title: string;
    
    // Content
    introduction?: string;
    scopeOfWork?: string;
    deliverables?: string;
    termsAndConditions?: string;
    
    // Pricing
    subtotal: number;
    discountPercent: number;
    discountAmount: number;
    taxPercent: number;
    taxAmount: number;
    total: number;
    currency: string;
    
    // Timeline
    validUntil?: string;
    proposedStartDate?: string;
    proposedEndDate?: string;
    
    // Status
    status: ProposalStatus;
    sentAt?: string;
    viewedAt?: string;
    acceptedAt?: string;
    rejectedAt?: string;
    
    // Signature
    signatureRequired: boolean;
    signedBy?: string;
    signedAt?: string;
    signatureIp?: string;
    
    // Conversion
    convertedProjectId?: string;
    
    // Template
    templateId?: string;
    
    // Versioning
    version: number;
    parentProposalId?: string;
    
    organizationId: string;
}

export interface ProposalItem {
    id: string;
    proposalId: string;
    
    // Item Details
    name: string;
    description?: string;
    
    // Pricing
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
    
    // Categorization
    category?: string;
    phase?: ProductionPhase;
    
    // Rate Card Reference
    rateCardItemId?: string;
    
    // Display
    displayOrder: number;
    isOptional: boolean;
    
    createdAt: string;
    updatedAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 8: ENHANCED INVOICING
// ─────────────────────────────────────────────────────────────────────────────

export type InvoiceDeliveryStatus = 'draft' | 'sent' | 'viewed' | 'reminded' | 'paid' | 'overdue' | 'disputed' | 'void';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded' | 'failed';
export type PaymentMethod = 'corporate_card' | 'personal_card' | 'cash' | 'check' | 'wire' | 'ach';

export interface InvoiceTemplate extends AuditFields {
    id: string;
    name: string;
    
    // Branding
    logoUrl?: string;
    headerText?: string;
    footerText?: string;
    
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
    paymentInstructions?: string;
    bankDetails?: string;
    
    // Default
    isDefault: boolean;
    
    organizationId: string;
}

export interface RecurringInvoice extends AuditFields {
    id: string;
    companyId: string;
    projectId?: string;
    
    // Schedule
    frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';
    dayOfMonth?: number;
    dayOfWeek?: number;
    
    // Dates
    startDate: string;
    endDate?: string;
    nextInvoiceDate: string;
    lastInvoiceDate?: string;
    
    // Amount
    amount: number;
    currency: string;
    
    // Template
    templateId?: string;
    
    // Content
    description?: string;
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
    referenceNumber?: string;
    
    // Status
    status: PaymentStatus;
    
    // Notes
    notes?: string;
    
    organizationId: string;
    createdBy?: string;
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
    status: 'draft' | 'issued' | 'applied' | 'void';
    issuedAt?: string;
    appliedAt?: string;
    
    organizationId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 9: DASHBOARDS & REPORTING
// ─────────────────────────────────────────────────────────────────────────────

export type WidgetType = 
    | 'number' | 'chart_bar' | 'chart_line' | 'chart_pie' | 'chart_donut' 
    | 'table' | 'list' | 'progress' | 'gauge' | 'calendar' | 'timeline';

export type TimeRange = 
    | 'today' | 'yesterday' | 'this_week' | 'last_week' 
    | 'this_month' | 'last_month' | 'this_quarter' | 'last_quarter' 
    | 'this_year' | 'last_year' | 'custom';

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
    description?: string;
    
    // Layout
    layout: DashboardLayout[];
    
    // Sharing
    isDefault: boolean;
    isShared: boolean;
    sharedWithRole?: string;
    
    // Owner
    ownerId: string;
    
    organizationId: string;
}

export interface WidgetConfig {
    metric?: string;
    xAxis?: string;
    yAxis?: string;
    groupBy?: string;
    aggregation?: 'count' | 'sum' | 'avg' | 'min' | 'max';
    limit?: number;
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
    customStartDate?: string;
    customEndDate?: string;
    
    // Refresh
    refreshIntervalSeconds: number;
    lastRefreshedAt?: string;
    
    // Display
    title?: string;
    subtitle?: string;
    color?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 10: DOCUMENTS & COLLABORATION
// ─────────────────────────────────────────────────────────────────────────────

export type DocumentType = 'doc' | 'wiki' | 'meeting_notes' | 'specification' | 'proposal_doc' | 'sow' | 'template';
export type DocumentStatus = 'draft' | 'pending_review' | 'published' | 'archived';

export interface Document extends AuditFields {
    id: string;
    
    // Hierarchy
    parentId?: string;
    projectId?: string;
    
    // Content
    title: string;
    content: Record<string, unknown>; // ProseMirror/TipTap JSON format
    
    // Type
    documentType: DocumentType;
    
    // Template
    templateId?: string;
    
    // Status
    status: DocumentStatus;
    publishedAt?: string;
    
    // Cover
    coverImageUrl?: string;
    icon?: string;
    
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
    lastEditedBy?: string;
    
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
    createdBy?: string;
    createdAt: string;
    
    // Change Description
    changeDescription?: string;
}

export interface DocumentTemplate extends AuditFields {
    id: string;
    name: string;
    description?: string;
    
    // Content
    content: Record<string, unknown>;
    
    // Type
    documentType: DocumentType;
    
    // Category
    category?: string;
    
    // Preview
    previewImageUrl?: string;
    
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
    notes?: string;
    
    // New fields
    pipelineId?: string;
    companyId?: string;
    contactId?: string;
    lostReasonId?: string;
    convertedProjectId?: string;
    convertedAt?: string;
    
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
    companyId?: string;
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
    pipelineId?: string;
    pipelineName?: string;
    stage: string;
    dealCount: number;
    totalValue: number;
    avgProbability: number;
    weightedValue: number;
}

export interface InvoiceAging {
    organizationId: string;
    invoiceId: string;
    vendorId?: string;
    companyId?: string;
    amount: number;
    dueDate: string;
    status: string;
    daysOverdue: number;
    agingBucket: 'current' | '1-30 days' | '31-60 days' | '61-90 days' | '90+ days';
}
