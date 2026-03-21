/* ═══════════════════════════════════════════════════════════════
   REMAINING ENTITY SCHEMAS — Full Validation Coverage
   
   Zod validation schemas for all entity configs that were missing
   validation in the registry. Organized by domain.
   ═══════════════════════════════════════════════════════════════ */

import { z } from "zod";
import {
    dateField,
    emailField,
    nonEmptyString,
    nonNegativeNumber,
    optionalDate,
    optionalString,
    optionalUuid,
    positiveNumber,
    uuidField,
} from "./primitives";

// ═══════════════════════════════════════════════════════════════
// FINANCIAL DOMAIN
// ═══════════════════════════════════════════════════════════════

// ─── Payments ────────────────────────────────────────────────
export const paymentCreateSchema = z.object({
    amount: positiveNumber,
    payment_date: dateField,
    payment_method: z
        .enum(["bank_transfer", "check", "credit_card", "cash", "wire", "ach", "other"])
        .default("bank_transfer"),
    reference_number: optionalString.pipe(z.string().max(100)),
    status: z
        .enum(["pending", "processing", "completed", "failed", "refunded", "cancelled"])
        .default("pending"),
    invoice_id: optionalUuid,
    vendor_id: optionalUuid,
    notes: optionalString,
});
export const paymentUpdateSchema = paymentCreateSchema.partial();

// ─── GL Accounts ─────────────────────────────────────────────
export const glAccountCreateSchema = z.object({
    name: nonEmptyString.max(200),
    code: nonEmptyString.max(20),
    type: z.enum(["asset", "liability", "equity", "revenue", "expense"]).default("expense"),
    description: optionalString,
    is_active: z.boolean().default(true),
});
export const glAccountUpdateSchema = glAccountCreateSchema.partial();

// ─── Revenue Schedules ──────────────────────────────────────
export const revenueScheduleCreateSchema = z.object({
    project_id: uuidField,
    description: optionalString,
    total_amount: nonNegativeNumber,
    recognized_amount: nonNegativeNumber.default(0),
    start_date: dateField,
    end_date: optionalDate,
    recognition_method: z
        .enum(["straight_line", "percentage_completion", "milestone", "manual"])
        .default("straight_line"),
});
export const revenueScheduleUpdateSchema = revenueScheduleCreateSchema.partial();

// ─── Budget Line Items ──────────────────────────────────────
export const budgetLineItemCreateSchema = z.object({
    category: nonEmptyString.max(200),
    description: optionalString,
    estimated_amount: nonNegativeNumber,
    actual_amount: nonNegativeNumber.default(0),
    project_id: optionalUuid,
    budget_id: optionalUuid,
});
export const budgetLineItemUpdateSchema = budgetLineItemCreateSchema.partial();

// ─── Job Cost Entries ───────────────────────────────────────
export const jobCostEntryCreateSchema = z.object({
    description: nonEmptyString.max(500),
    amount: nonNegativeNumber,
    cost_type: z
        .enum(["labor", "material", "equipment", "subcontractor", "overhead", "other"])
        .default("labor"),
    entry_date: dateField,
    project_id: optionalUuid,
});
export const jobCostEntryUpdateSchema = jobCostEntryCreateSchema.partial();

// ─── Payment Approvals ──────────────────────────────────────
export const paymentApprovalCreateSchema = z.object({
    payment_id: uuidField,
    approver_id: optionalUuid,
    status: z.enum(["pending", "approved", "rejected"]).default("pending"),
    comments: optionalString,
});
export const paymentApprovalUpdateSchema = paymentApprovalCreateSchema.partial();

// ─── Budget Approvals ───────────────────────────────────────
export const budgetApprovalCreateSchema = z.object({
    budget_id: uuidField,
    approver_id: optionalUuid,
    status: z.enum(["pending", "approved", "rejected"]).default("pending"),
    comments: optionalString,
});
export const budgetApprovalUpdateSchema = budgetApprovalCreateSchema.partial();

// ─── Production Expenses ────────────────────────────────────
export const productionExpenseCreateSchema = z.object({
    description: nonEmptyString.max(500),
    amount: nonNegativeNumber,
    category: z
        .enum([
            "talent",
            "crew",
            "equipment",
            "location",
            "catering",
            "transport",
            "materials",
            "post_production",
            "other",
        ])
        .default("other"),
    expense_date: dateField,
    project_id: optionalUuid,
    vendor_id: optionalUuid,
    status: z.enum(["pending", "approved", "paid", "rejected"]).default("pending"),
});
export const productionExpenseUpdateSchema = productionExpenseCreateSchema.partial();

// ─── Production Budget Lines ────────────────────────────────
export const productionBudgetLineCreateSchema = z.object({
    description: optionalString,
    estimated_amount: nonNegativeNumber,
    actual_amount: nonNegativeNumber.default(0),
    category: optionalString.pipe(z.string().max(200)),
    budget_id: optionalUuid,
});
export const productionBudgetLineUpdateSchema = productionBudgetLineCreateSchema.partial();

// ─── Payroll Batches ────────────────────────────────────────
export const payrollBatchCreateSchema = z.object({
    batch_name: nonEmptyString.max(200),
    pay_period_start: dateField,
    pay_period_end: dateField,
    status: z.enum(["draft", "processing", "completed", "cancelled"]).default("draft"),
    total_amount: nonNegativeNumber.default(0),
});
export const payrollBatchUpdateSchema = payrollBatchCreateSchema.partial();

// ─── Expense Reports ────────────────────────────────────────
export const expenseReportCreateSchema = z.object({
    title: nonEmptyString.max(300),
    status: z.enum(["draft", "submitted", "approved", "rejected", "reimbursed"]).default("draft"),
    total_amount: nonNegativeNumber.default(0),
    submission_date: optionalDate,
    notes: optionalString,
});
export const expenseReportUpdateSchema = expenseReportCreateSchema.partial();

// ─── Invoice Templates ─────────────────────────────────────
export const invoiceTemplateCreateSchema = z.object({
    name: nonEmptyString.max(200),
    description: optionalString,
    content: optionalString,
});
export const invoiceTemplateUpdateSchema = invoiceTemplateCreateSchema.partial();

// ═══════════════════════════════════════════════════════════════
// ASSETS & INVENTORY DOMAIN
// ═══════════════════════════════════════════════════════════════

// ─── Digital Assets ─────────────────────────────────────────
export const digitalAssetCreateSchema = z.object({
    name: nonEmptyString.max(200),
    asset_class: z
        .enum(["image", "video", "audio", "document", "3d_model", "font", "template", "other"])
        .default("image"),
    file_url: optionalString.pipe(z.string().max(2000)),
    description: optionalString,
    tags: optionalString,
});
export const digitalAssetUpdateSchema = digitalAssetCreateSchema.partial();

// ─── Asset Assignments ──────────────────────────────────────
export const assetAssignmentCreateSchema = z.object({
    asset_id: uuidField,
    assigned_to: uuidField,
    project_id: optionalUuid,
    assigned_date: dateField,
    return_date: optionalDate,
    notes: optionalString,
});
export const assetAssignmentUpdateSchema = assetAssignmentCreateSchema.partial();

// ─── Vehicles ───────────────────────────────────────────────
export const vehicleCreateSchema = z.object({
    name: nonEmptyString.max(200),
    type: z.enum(["truck", "van", "car", "trailer", "forklift", "other"]).default("truck"),
    license_plate: optionalString.pipe(z.string().max(20)),
    vin: optionalString.pipe(z.string().max(17)),
    make: optionalString.pipe(z.string().max(100)),
    model: optionalString.pipe(z.string().max(100)),
    year: z.number().int().min(1900).max(2100).optional(),
});
export const vehicleUpdateSchema = vehicleCreateSchema.partial();

// ─── Warehouses ─────────────────────────────────────────────
export const warehouseCreateSchema = z.object({
    name: nonEmptyString.max(200),
    type: z
        .enum(["primary", "secondary", "satellite", "temporary", "cold_storage", "other"])
        .default("primary"),
    address: optionalString.pipe(z.string().max(500)),
    capacity: z.number().int().min(0).optional(),
    notes: optionalString,
});
export const warehouseUpdateSchema = warehouseCreateSchema.partial();

// ─── Consumables ────────────────────────────────────────────
export const consumableCreateSchema = z.object({
    name: nonEmptyString.max(200),
    sku: optionalString.pipe(z.string().max(50)),
    quantity: z.number().int().min(0).default(0),
    unit: optionalString.pipe(z.string().max(30)),
    reorder_point: z.number().int().min(0).optional(),
    project_id: optionalUuid,
});
export const consumableUpdateSchema = consumableCreateSchema.partial();

// ─── Consumable Usage ───────────────────────────────────────
export const consumableUsageCreateSchema = z.object({
    consumable_id: uuidField,
    quantity_used: z.number().int().min(1),
    used_date: dateField,
    used_by: optionalUuid,
    notes: optionalString,
});
export const consumableUsageUpdateSchema = consumableUsageCreateSchema.partial();

// ─── Maintenance Records ────────────────────────────────────
export const maintenanceRecordCreateSchema = z.object({
    asset_id: uuidField,
    description: nonEmptyString.max(2000),
    maintenance_type: z.enum(["preventive", "corrective", "emergency"]).default("preventive"),
    performed_date: dateField,
    cost: nonNegativeNumber.optional(),
    performed_by: optionalUuid,
    notes: optionalString,
});
export const maintenanceRecordUpdateSchema = maintenanceRecordCreateSchema.partial();

// ═══════════════════════════════════════════════════════════════
// PRODUCTION DOMAIN
// ═══════════════════════════════════════════════════════════════

// ─── Production Tasks ───────────────────────────────────────
export const productionTaskCreateSchema = z.object({
    title: nonEmptyString.max(300),
    description: optionalString,
    status: z.enum(["pending", "in_progress", "completed", "cancelled"]).default("pending"),
    priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
    assigned_to: optionalUuid,
    project_id: optionalUuid,
    due_date: optionalDate,
});
export const productionTaskUpdateSchema = productionTaskCreateSchema.partial();

// ─── Production Milestones ──────────────────────────────────
export const productionMilestoneCreateSchema = z.object({
    title: nonEmptyString.max(300),
    description: optionalString,
    due_date: optionalDate,
    status: z.enum(["pending", "in_progress", "completed", "missed"]).default("pending"),
    project_id: optionalUuid,
});
export const productionMilestoneUpdateSchema = productionMilestoneCreateSchema.partial();

// ─── Production SOPs ────────────────────────────────────────
export const productionSopCreateSchema = z.object({
    title: nonEmptyString.max(300),
    number: optionalString.pipe(z.string().max(50)),
    content: optionalString,
    status: z.enum(["draft", "active", "archived"]).default("draft"),
});
export const productionSopUpdateSchema = productionSopCreateSchema.partial();

// ─── Production Checklists ──────────────────────────────────
export const productionChecklistCreateSchema = z.object({
    title: nonEmptyString.max(300),
    description: optionalString,
    status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
    project_id: optionalUuid,
    event_id: optionalUuid,
});
export const productionChecklistUpdateSchema = productionChecklistCreateSchema.partial();

// ─── Production Time Entries ────────────────────────────────
export const productionTimeEntryCreateSchema = z.object({
    description: optionalString,
    hours: positiveNumber,
    entry_date: dateField,
    user_id: optionalUuid,
    project_id: optionalUuid,
    production_task_id: optionalUuid,
});
export const productionTimeEntryUpdateSchema = productionTimeEntryCreateSchema.partial();

// ═══════════════════════════════════════════════════════════════
// HR & WORKFORCE DOMAIN
// ═══════════════════════════════════════════════════════════════

// ─── Crew Availability ──────────────────────────────────────
export const crewAvailabilityCreateSchema = z.object({
    crew_member_id: uuidField,
    start_date: dateField,
    end_date: dateField,
    status: z.enum(["available", "unavailable", "tentative"]).default("available"),
    notes: optionalString,
});
export const crewAvailabilityUpdateSchema = crewAvailabilityCreateSchema.partial();

// ─── Shifts ─────────────────────────────────────────────────
export const shiftCreateSchema = z.object({
    start_time: nonEmptyString,
    end_time: nonEmptyString,
    crew_member_id: optionalUuid,
    project_id: optionalUuid,
    notes: optionalString,
});
export const shiftUpdateSchema = shiftCreateSchema.partial();

// ─── Timesheets ─────────────────────────────────────────────
export const timesheetCreateSchema = z.object({
    week_start: dateField,
    status: z.enum(["draft", "submitted", "approved", "rejected"]).default("draft"),
    total_hours: nonNegativeNumber.default(0),
    notes: optionalString,
});
export const timesheetUpdateSchema = timesheetCreateSchema.partial();

// ─── Worker Reviews ─────────────────────────────────────────
export const workerReviewCreateSchema = z.object({
    target_type: z.enum(["self", "peer", "manager", "360"]).default("manager"),
    review_type: z.enum(["performance", "probation", "annual", "project"]).default("performance"),
    rating: z.number().int().min(1).max(5).optional(),
    summary: optionalString,
    review_period_start: optionalDate,
    review_period_end: optionalDate,
    worker_id: optionalUuid,
});
export const workerReviewUpdateSchema = workerReviewCreateSchema.partial();

// ─── Worker Onboarding Runs ─────────────────────────────────
export const workerOnboardingRunCreateSchema = z.object({
    worker_id: uuidField,
    status: z.enum(["pending", "in_progress", "completed", "cancelled"]).default("pending"),
    start_date: optionalDate,
    notes: optionalString,
});
export const workerOnboardingRunUpdateSchema = workerOnboardingRunCreateSchema.partial();

// ─── Worker Offboarding Runs ────────────────────────────────
export const workerOffboardingRunCreateSchema = z.object({
    worker_id: uuidField,
    status: z.enum(["pending", "in_progress", "completed", "cancelled"]).default("pending"),
    start_date: optionalDate,
    notes: optionalString,
});
export const workerOffboardingRunUpdateSchema = workerOffboardingRunCreateSchema.partial();

// ─── Goals ──────────────────────────────────────────────────
export const goalCreateSchema = z.object({
    title: nonEmptyString.max(300),
    type: z.enum(["individual", "team", "department", "company"]).default("individual"),
    status: z.enum(["draft", "active", "completed", "cancelled"]).default("draft"),
    target_date: optionalDate,
    owner_id: optionalUuid,
    description: optionalString,
});
export const goalUpdateSchema = goalCreateSchema.partial();

// ─── Project Assignments ────────────────────────────────────
export const projectAssignmentCreateSchema = z.object({
    project_id: uuidField,
    crew_member_id: uuidField,
    role: optionalString.pipe(z.string().max(100)),
    start_date: optionalDate,
    end_date: optionalDate,
});
export const projectAssignmentUpdateSchema = projectAssignmentCreateSchema.partial();

// ─── Live Crew Assignments ──────────────────────────────────
export const liveCrewAssignmentCreateSchema = z.object({
    event_id: uuidField,
    user_id: uuidField,
    role: optionalString.pipe(z.string().max(100)),
    check_in_time: optionalString,
    check_out_time: optionalString,
});
export const liveCrewAssignmentUpdateSchema = liveCrewAssignmentCreateSchema.partial();

// ═══════════════════════════════════════════════════════════════
// SCHEDULING & CALENDAR DOMAIN
// ═══════════════════════════════════════════════════════════════

// ─── Calendar Events ────────────────────────────────────────
export const calendarEventCreateSchema = z.object({
    title: nonEmptyString.max(300),
    start_time: nonEmptyString,
    end_time: nonEmptyString,
    all_day: z.boolean().default(false),
    location: optionalString.pipe(z.string().max(300)),
    description: optionalString,
    project_id: optionalUuid,
});
export const calendarEventUpdateSchema = calendarEventCreateSchema.partial();

// ─── Schedule Entries ───────────────────────────────────────
export const scheduleEntryCreateSchema = z.object({
    title: nonEmptyString.max(300),
    start_time: nonEmptyString,
    end_time: nonEmptyString,
    description: optionalString,
    project_id: optionalUuid,
    location_id: optionalUuid,
    assigned_to: optionalUuid,
});
export const scheduleEntryUpdateSchema = scheduleEntryCreateSchema.partial();

// ─── Resource Bookings ──────────────────────────────────────
export const resourceBookingCreateSchema = z.object({
    resource_type: nonEmptyString.max(100),
    resource_id: uuidField,
    start_date: dateField,
    end_date: dateField,
    project_id: optionalUuid,
    notes: optionalString,
});
export const resourceBookingUpdateSchema = resourceBookingCreateSchema.partial();

// ═══════════════════════════════════════════════════════════════
// CONTRACTS & LEGAL DOMAIN
// ═══════════════════════════════════════════════════════════════

// ─── Contract Obligations ───────────────────────────────────
export const contractObligationCreateSchema = z.object({
    contract_id: uuidField,
    description: nonEmptyString.max(2000),
    due_date: optionalDate,
    status: z.enum(["pending", "in_progress", "completed", "overdue"]).default("pending"),
    responsible_party: optionalString.pipe(z.string().max(200)),
});
export const contractObligationUpdateSchema = contractObligationCreateSchema.partial();

// ─── IP Rights ──────────────────────────────────────────────
export const ipRightCreateSchema = z.object({
    title: nonEmptyString.max(300),
    type: z
        .enum(["copyright", "trademark", "patent", "trade_secret", "license", "other"])
        .default("copyright"),
    description: optionalString,
    owner: optionalString.pipe(z.string().max(200)),
    registration_number: optionalString.pipe(z.string().max(100)),
    expiry_date: optionalDate,
    project_id: optionalUuid,
});
export const ipRightUpdateSchema = ipRightCreateSchema.partial();

// ─── E-Signatures ───────────────────────────────────────────
export const eSignatureCreateSchema = z.object({
    document_id: uuidField,
    signer_name: nonEmptyString.max(200),
    signer_email: emailField,
    status: z.enum(["pending", "signed", "declined", "expired"]).default("pending"),
});
export const eSignatureUpdateSchema = eSignatureCreateSchema.partial();

// ═══════════════════════════════════════════════════════════════
// PROCUREMENT DOMAIN
// ═══════════════════════════════════════════════════════════════

// ─── Goods Receipts ─────────────────────────────────────────
export const goodsReceiptCreateSchema = z.object({
    receipt_number: nonEmptyString.max(50),
    purchase_order_id: uuidField,
    received_date: dateField,
    status: z.enum(["pending", "partial", "complete", "rejected"]).default("pending"),
    notes: optionalString,
});
export const goodsReceiptUpdateSchema = goodsReceiptCreateSchema.partial();

// ─── RFQs ───────────────────────────────────────────────────
export const rfqCreateSchema = z.object({
    title: nonEmptyString.max(300),
    description: optionalString,
    due_date: optionalDate,
    status: z.enum(["draft", "open", "closed", "awarded", "cancelled"]).default("draft"),
    project_id: optionalUuid,
});
export const rfqUpdateSchema = rfqCreateSchema.partial();

// ─── Rate Cards ─────────────────────────────────────────────
export const rateCardCreateSchema = z.object({
    name: nonEmptyString.max(200),
    description: optionalString,
    effective_date: optionalDate,
    expiry_date: optionalDate,
    is_active: z.boolean().default(true),
});
export const rateCardUpdateSchema = rateCardCreateSchema.partial();

// ═══════════════════════════════════════════════════════════════
// ENGINEERING & APPROVALS DOMAIN
// ═══════════════════════════════════════════════════════════════

// ─── Engineering Approvals ──────────────────────────────────
export const engineeringApprovalCreateSchema = z.object({
    title: nonEmptyString.max(300),
    entity_type: z
        .enum(["activation", "set_build", "rigging", "electrical", "structural", "other"])
        .default("structural"),
    description: optionalString,
    status: z.enum(["pending", "approved", "rejected", "revision_required"]).default("pending"),
    project_id: optionalUuid,
    approver_id: optionalUuid,
});
export const engineeringApprovalUpdateSchema = engineeringApprovalCreateSchema.partial();

// ─── Approval Steps ─────────────────────────────────────────
export const approvalStepCreateSchema = z.object({
    name: nonEmptyString.max(200),
    order: z.number().int().min(0),
    approver_id: optionalUuid,
    approval_id: optionalUuid,
    status: z.enum(["pending", "approved", "rejected"]).default("pending"),
});
export const approvalStepUpdateSchema = approvalStepCreateSchema.partial();

// ═══════════════════════════════════════════════════════════════
// COMPLIANCE & SAFETY DOMAIN
// ═══════════════════════════════════════════════════════════════

// ─── Compliance Requirements ────────────────────────────────
export const complianceRequirementCreateSchema = z.object({
    name: nonEmptyString.max(300),
    description: optionalString,
    category: optionalString.pipe(z.string().max(100)),
    is_mandatory: z.boolean().default(true),
});
export const complianceRequirementUpdateSchema = complianceRequirementCreateSchema.partial();

// ─── Insurance Requirements ────────────────────────────────
export const insuranceRequirementCreateSchema = z.object({
    requirement_name: nonEmptyString.max(300),
    description: optionalString,
    min_coverage_amount: nonNegativeNumber.optional(),
    is_required: z.boolean().default(true),
});
export const insuranceRequirementUpdateSchema = insuranceRequirementCreateSchema.partial();

// ─── Risk Assessments ───────────────────────────────────────
export const riskAssessmentCreateSchema = z.object({
    title: nonEmptyString.max(300),
    description: optionalString,
    likelihood: z.enum(["low", "medium", "high", "critical"]).default("medium"),
    impact: z.enum(["low", "medium", "high", "critical"]).default("medium"),
    mitigation: optionalString,
});
export const riskAssessmentUpdateSchema = riskAssessmentCreateSchema.partial();

// ─── Vendor Compliance Documents ────────────────────────────
export const vendorComplianceDocumentCreateSchema = z.object({
    document_name: nonEmptyString.max(300),
    vendor_id: uuidField,
    document_type: optionalString.pipe(z.string().max(100)),
    expiry_date: optionalDate,
    status: z.enum(["valid", "expired", "pending", "rejected"]).default("pending"),
});
export const vendorComplianceDocumentUpdateSchema = vendorComplianceDocumentCreateSchema.partial();

// ═══════════════════════════════════════════════════════════════
// DOCUMENTS & KNOWLEDGE DOMAIN
// ═══════════════════════════════════════════════════════════════

// ─── Document Templates ─────────────────────────────────────
export const documentTemplateCreateSchema = z.object({
    title: nonEmptyString.max(300),
    description: optionalString,
    content: optionalString,
    category: optionalString.pipe(z.string().max(100)),
});
export const documentTemplateUpdateSchema = documentTemplateCreateSchema.partial();

// ─── Knowledge Base Articles ────────────────────────────────
export const knowledgeBaseArticleCreateSchema = z.object({
    title: nonEmptyString.max(300),
    content: nonEmptyString,
    category: z
        .enum(["general", "how_to", "troubleshooting", "policy", "reference", "faq"])
        .default("general"),
    status: z.enum(["draft", "published", "archived"]).default("draft"),
    tags: optionalString,
});
export const knowledgeBaseArticleUpdateSchema = knowledgeBaseArticleCreateSchema.partial();

// ─── Vault Documents ────────────────────────────────────────
export const vaultDocumentCreateSchema = z.object({
    title: nonEmptyString.max(300),
    description: optionalString,
    category: z
        .enum(["contract", "certificate", "license", "policy", "report", "other"])
        .default("other"),
    file_url: optionalString.pipe(z.string().max(2000)),
    expiry_date: optionalDate,
});
export const vaultDocumentUpdateSchema = vaultDocumentCreateSchema.partial();

// ═══════════════════════════════════════════════════════════════
// BRAND & CREATIVE DOMAIN
// ═══════════════════════════════════════════════════════════════

// ─── Brand Guideline Sections ───────────────────────────────
export const brandGuidelineSectionCreateSchema = z.object({
    title: nonEmptyString.max(300),
    content: optionalString,
    order: z.number().int().min(0).default(0),
    brand_guideline_id: uuidField,
});
export const brandGuidelineSectionUpdateSchema = brandGuidelineSectionCreateSchema.partial();

// ─── Brief Templates ────────────────────────────────────────
export const briefTemplateCreateSchema = z.object({
    name: nonEmptyString.max(200),
    description: optionalString,
    content: optionalString,
});
export const briefTemplateUpdateSchema = briefTemplateCreateSchema.partial();

// ─── Creative Briefs ────────────────────────────────────────
export const creativeBriefCreateSchema = z.object({
    title: nonEmptyString.max(300),
    description: optionalString,
    status: z.enum(["draft", "in_review", "approved", "active", "archived"]).default("draft"),
    project_id: optionalUuid,
    campaign_id: optionalUuid,
    due_date: optionalDate,
});
export const creativeBriefUpdateSchema = creativeBriefCreateSchema.partial();

// ─── Creative Reviews ───────────────────────────────────────
export const creativeReviewCreateSchema = z.object({
    title: nonEmptyString.max(300),
    status: z
        .enum(["pending", "in_review", "approved", "revision_required", "rejected"])
        .default("pending"),
    feedback: optionalString,
    reviewer_id: optionalUuid,
});
export const creativeReviewUpdateSchema = creativeReviewCreateSchema.partial();

// ─── Case Study Metrics (Campaign Assets/Channels/KPIs) ────
export const campaignAssetCreateSchema = z.object({
    name: nonEmptyString.max(200),
    campaign_id: uuidField,
    asset_type: optionalString.pipe(z.string().max(100)),
    url: optionalString.pipe(z.string().max(2000)),
});
export const campaignAssetUpdateSchema = campaignAssetCreateSchema.partial();

export const campaignChannelCreateSchema = z.object({
    name: nonEmptyString.max(200),
    campaign_id: uuidField,
    channel_type: optionalString.pipe(z.string().max(100)),
    budget: nonNegativeNumber.optional(),
});
export const campaignChannelUpdateSchema = campaignChannelCreateSchema.partial();

export const campaignKpiCreateSchema = z.object({
    name: nonEmptyString.max(200),
    campaign_id: uuidField,
    target_value: nonNegativeNumber.optional(),
    current_value: nonNegativeNumber.optional(),
    unit: optionalString.pipe(z.string().max(50)),
});
export const campaignKpiUpdateSchema = campaignKpiCreateSchema.partial();

// ═══════════════════════════════════════════════════════════════
// STAKEHOLDERS & CONTACTS DOMAIN
// ═══════════════════════════════════════════════════════════════

// ─── Stakeholders ───────────────────────────────────────────
export const stakeholderCreateSchema = z.object({
    name: nonEmptyString.max(200),
    email: emailField.optional().or(z.literal("")),
    phone: optionalString.pipe(z.string().max(30)),
    company: optionalString.pipe(z.string().max(200)),
    role: optionalString.pipe(z.string().max(100)),
    notes: optionalString,
});
export const stakeholderUpdateSchema = stakeholderCreateSchema.partial();

// ─── Stakeholder Projects ───────────────────────────────────
export const stakeholderProjectCreateSchema = z.object({
    stakeholder_id: uuidField,
    project_id: uuidField,
    role: optionalString.pipe(z.string().max(100)),
});
export const stakeholderProjectUpdateSchema = stakeholderProjectCreateSchema.partial();

// ═══════════════════════════════════════════════════════════════
// SYSTEM & PLATFORM DOMAIN
// ═══════════════════════════════════════════════════════════════

// ─── Notifications ──────────────────────────────────────────
export const notificationCreateSchema = z.object({
    title: nonEmptyString.max(300),
    message: optionalString,
    type: z.enum(["info", "success", "warning", "error", "action"]).default("info"),
    user_id: uuidField,
});
export const notificationUpdateSchema = notificationCreateSchema.partial();

// ─── Comments ───────────────────────────────────────────────
export const commentCreateSchema = z.object({
    body: nonEmptyString.max(10000),
    entity_type: nonEmptyString.max(50),
    entity_id: uuidField,
});
export const commentUpdateSchema = commentCreateSchema.partial();

// ─── Integrations ───────────────────────────────────────────
export const integrationCreateSchema = z.object({
    name: nonEmptyString.max(200),
    type: z.enum(["webhook", "api", "oauth", "native", "custom"]).default("api"),
    status: z.enum(["active", "inactive", "error"]).default("inactive"),
    config: optionalString,
});
export const integrationUpdateSchema = integrationCreateSchema.partial();

// ─── Saved Views ────────────────────────────────────────────
export const savedViewCreateSchema = z.object({
    name: nonEmptyString.max(200),
    type: z.enum(["table", "kanban", "calendar", "timeline", "chart"]).default("table"),
    entity_type: nonEmptyString.max(50),
    config: optionalString,
    is_default: z.boolean().default(false),
});
export const savedViewUpdateSchema = savedViewCreateSchema.partial();

// ─── SOPs ───────────────────────────────────────────────────
export const sopCreateSchema = z.object({
    title: nonEmptyString.max(300),
    content: optionalString,
    status: z.enum(["draft", "active", "archived"]).default("draft"),
    version: optionalString.pipe(z.string().max(20)),
});
export const sopUpdateSchema = sopCreateSchema.partial();

// ─── Automations ────────────────────────────────────────────
// NOTE: Already exists in extended-entity-schemas. This is an alias re-export.

// ─── Workflows ──────────────────────────────────────────────
export const workflowCreateSchema = z.object({
    name: nonEmptyString.max(200),
    description: optionalString,
    status: z.enum(["draft", "active", "paused", "completed", "failed"]).default("draft"),
    trigger_type: optionalString.pipe(z.string().max(100)),
});
export const workflowUpdateSchema = workflowCreateSchema.partial();

// ─── Project Templates ──────────────────────────────────────
export const projectTemplateCreateSchema = z.object({
    name: nonEmptyString.max(200),
    description: optionalString,
    category: z
        .enum(["event", "campaign", "production", "corporate", "general"])
        .default("general"),
});
export const projectTemplateUpdateSchema = projectTemplateCreateSchema.partial();

// ─── Dashboard Widgets ──────────────────────────────────────
export const dashboardWidgetCreateSchema = z.object({
    title: nonEmptyString.max(200),
    widget_type: nonEmptyString.max(50),
    dashboard_id: uuidField,
    config: optionalString,
    position: z.number().int().min(0).default(0),
});
export const dashboardWidgetUpdateSchema = dashboardWidgetCreateSchema.partial();

// ─── Report Definitions ─────────────────────────────────────
export const reportDefinitionCreateSchema = z.object({
    name: nonEmptyString.max(200),
    description: optionalString,
    report_type: optionalString.pipe(z.string().max(100)),
    config: optionalString,
});
export const reportDefinitionUpdateSchema = reportDefinitionCreateSchema.partial();

// ─── Invitations ────────────────────────────────────────────
export const invitationCreateSchema = z.object({
    email: emailField,
    role: z.enum(["admin", "manager", "member", "viewer"]).default("member"),
    expires_at: optionalDate,
});
export const invitationUpdateSchema = invitationCreateSchema.partial();

// ─── Organizations ──────────────────────────────────────────
export const organizationCreateSchema = z.object({
    name: nonEmptyString.max(200),
    slug: optionalString.pipe(z.string().max(100)),
    industry: optionalString.pipe(z.string().max(100)),
});
export const organizationUpdateSchema = organizationCreateSchema.partial();

// ─── Data Export Requests ───────────────────────────────────
export const dataExportRequestCreateSchema = z.object({
    export_format: z.enum(["csv", "json", "xlsx", "pdf"]).default("csv"),
    entity_type: nonEmptyString.max(50),
    filters: optionalString,
});
export const dataExportRequestUpdateSchema = dataExportRequestCreateSchema.partial();

// ═══════════════════════════════════════════════════════════════
// AUDIT & SECURITY DOMAIN (Read-only — minimal create schemas)
// ═══════════════════════════════════════════════════════════════

// ─── Access Audit Logs ──────────────────────────────────────
export const accessAuditLogCreateSchema = z.object({
    action: nonEmptyString.max(100),
    resource: nonEmptyString.max(100),
    user_id: uuidField,
    details: optionalString,
});
export const accessAuditLogUpdateSchema = accessAuditLogCreateSchema.partial();

// ─── Activity Log Entries ───────────────────────────────────
export const activityLogEntryCreateSchema = z.object({
    action: nonEmptyString.max(100),
    entity_type: nonEmptyString.max(50),
    entity_id: optionalUuid,
    user_id: optionalUuid,
    details: optionalString,
});
export const activityLogEntryUpdateSchema = activityLogEntryCreateSchema.partial();

// ─── Automation Logs ────────────────────────────────────────
export const automationLogCreateSchema = z.object({
    automation_id: uuidField,
    event_type: nonEmptyString.max(100),
    status: z.enum(["success", "failure", "skipped"]).default("success"),
    details: optionalString,
});
export const automationLogUpdateSchema = automationLogCreateSchema.partial();

// ─── Domain Events ──────────────────────────────────────────
export const domainEventCreateSchema = z.object({
    event_type: nonEmptyString.max(100),
    entity_type: nonEmptyString.max(50),
    entity_id: optionalUuid,
    payload: optionalString,
});
export const domainEventUpdateSchema = domainEventCreateSchema.partial();

// ─── Login Audit Logs ───────────────────────────────────────
export const loginAuditLogCreateSchema = z.object({
    email: emailField,
    action: nonEmptyString.max(100),
    ip_address: optionalString.pipe(z.string().max(45)),
    user_agent: optionalString,
    success: z.boolean().default(true),
});
export const loginAuditLogUpdateSchema = loginAuditLogCreateSchema.partial();

// ─── Role Change Logs ───────────────────────────────────────
export const roleChangeLogCreateSchema = z.object({
    user_id: uuidField,
    old_role: optionalString.pipe(z.string().max(50)),
    new_role: nonEmptyString.max(50),
    changed_by: optionalUuid,
    reason: optionalString,
});
export const roleChangeLogUpdateSchema = roleChangeLogCreateSchema.partial();

// ─── Temporary Access Grants ────────────────────────────────
export const temporaryAccessGrantCreateSchema = z.object({
    user_id: uuidField,
    resource: nonEmptyString.max(100),
    granted_by: optionalUuid,
    expires_at: nonEmptyString,
    reason: optionalString,
});
export const temporaryAccessGrantUpdateSchema = temporaryAccessGrantCreateSchema.partial();

// ═══════════════════════════════════════════════════════════════
// OPERATIONS & SERVICES DOMAIN
// ═══════════════════════════════════════════════════════════════

// ─── Dispatch Entries ───────────────────────────────────────
export const dispatchEntryCreateSchema = z.object({
    crew_member_id: optionalUuid,
    project_id: optionalUuid,
    location_id: optionalUuid,
    dispatch_date: dateField,
    priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
    status: z
        .enum(["scheduled", "dispatched", "in_transit", "on_site", "completed", "cancelled"])
        .default("scheduled"),
    notes: optionalString,
});
export const dispatchEntryUpdateSchema = dispatchEntryCreateSchema.partial();

// ─── Obligation ─────────────────────────────────────────────
export const obligationCreateSchema = z.object({
    contract_id: uuidField,
    description: nonEmptyString.max(2000),
    due_date: optionalDate,
    status: z.enum(["pending", "in_progress", "completed", "overdue"]).default("pending"),
    responsible_party: optionalString.pipe(z.string().max(200)),
});
export const obligationUpdateSchema = obligationCreateSchema.partial();

// ─── Service Health Checks ──────────────────────────────────
export const serviceHealthCheckCreateSchema = z.object({
    service_name: nonEmptyString.max(200),
    status: z.enum(["healthy", "degraded", "unhealthy", "unknown"]).default("healthy"),
    response_time_ms: z.number().int().min(0).optional(),
    last_checked: optionalString,
});
export const serviceHealthCheckUpdateSchema = serviceHealthCheckCreateSchema.partial();

// ─── SLA Definitions ────────────────────────────────────────
export const slaDefinitionCreateSchema = z.object({
    name: nonEmptyString.max(200),
    target_hours: positiveNumber,
    description: optionalString,
    priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
});
export const slaDefinitionUpdateSchema = slaDefinitionCreateSchema.partial();

// ─── SLA Tracking ───────────────────────────────────────────
export const slaTrackingCreateSchema = z.object({
    sla_definition_id: uuidField,
    entity_type: nonEmptyString.max(50),
    entity_id: uuidField,
    status: z.enum(["on_track", "at_risk", "breached"]).default("on_track"),
    started_at: optionalString,
});
export const slaTrackingUpdateSchema = slaTrackingCreateSchema.partial();

// ─── Resilience Targets ─────────────────────────────────────
export const resilienceTargetCreateSchema = z.object({
    service_name: nonEmptyString.max(200),
    target_uptime: z.number().min(0).max(100).default(99.9),
    rpo_minutes: z.number().int().min(0).optional(),
    rto_minutes: z.number().int().min(0).optional(),
});
export const resilienceTargetUpdateSchema = resilienceTargetCreateSchema.partial();

// ─── Checklist Templates ────────────────────────────────────
export const checklistTemplateCreateSchema = z.object({
    name: nonEmptyString.max(200),
    description: optionalString,
    category: optionalString.pipe(z.string().max(100)),
});
export const checklistTemplateUpdateSchema = checklistTemplateCreateSchema.partial();

// ─── Clause Library Entries ─────────────────────────────────
export const clauseLibraryEntryCreateSchema = z.object({
    title: nonEmptyString.max(300),
    content: nonEmptyString.max(10000),
    category: optionalString.pipe(z.string().max(100)),
    contract_id: optionalUuid,
});
export const clauseLibraryEntryUpdateSchema = clauseLibraryEntryCreateSchema.partial();

// ─── Lost Reasons ───────────────────────────────────────────
export const lostReasonCreateSchema = z.object({
    name: nonEmptyString.max(200),
    description: optionalString,
});
export const lostReasonUpdateSchema = lostReasonCreateSchema.partial();

// ─── User Profiles ──────────────────────────────────────────
export const profileCreateSchema = z.object({
    display_name: nonEmptyString.max(200),
    email: emailField,
    avatar_url: optionalString.pipe(z.string().max(2000)),
});
export const profileUpdateSchema = profileCreateSchema.partial();
