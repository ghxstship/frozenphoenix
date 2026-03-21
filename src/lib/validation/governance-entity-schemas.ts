/* ═══════════════════════════════════════════════════════════════
   PHASE H — Complete Validation Coverage
   
   Zod validation schemas for all remaining entity configs
   that were missing schemas in the registry.
   ═══════════════════════════════════════════════════════════════ */

import { z } from "zod";
import {
    dateField,
    nonEmptyString,
    nonNegativeNumber,
    optionalDate,
    optionalString,
    optionalUuid,
    positiveNumber,
    uuidField,
} from "./primitives";

// ═══════════════════════════════════════════════════════════════
// ADVANCING / PRODUCTION DOMAIN
// ═══════════════════════════════════════════════════════════════

// ─── Activities ─────────────────────────────────────────────
export const activityCreateSchema = z.object({
    name: nonEmptyString.max(200),
    description: optionalString,
    project_id: optionalUuid,
    event_id: optionalUuid,
    activity_type: optionalString,
    status: z.enum(["planned", "in_progress", "completed", "cancelled"]).default("planned"),
    start_time: optionalDate,
    end_time: optionalDate,
    location_id: optionalUuid,
    notes: optionalString,
});
export const activityUpdateSchema = activityCreateSchema.partial();

// ─── Advance Status History ─────────────────────────────────
export const advanceStatusHistoryCreateSchema = z.object({
    advance_id: uuidField,
    from_status: optionalString,
    to_status: nonEmptyString,
    changed_by: optionalUuid,
    notes: optionalString,
});
export const advanceStatusHistoryUpdateSchema = advanceStatusHistoryCreateSchema.partial();

// ─── Advance Templates ──────────────────────────────────────
export const advanceTemplateCreateSchema = z.object({
    name: nonEmptyString.max(200),
    description: optionalString,
    template_type: optionalString,
    checklist_items: z.any().optional(),
    default_departments: z.any().optional(),
    is_active: z.boolean().default(true),
});
export const advanceTemplateUpdateSchema = advanceTemplateCreateSchema.partial();

// ─── Production Advances ────────────────────────────────────
export const productionAdvanceCreateSchema = z.object({
    project_id: optionalUuid,
    event_id: optionalUuid,
    advance_type: nonEmptyString,
    title: nonEmptyString.max(200),
    description: optionalString,
    status: z.enum(["draft", "in_progress", "submitted", "approved", "rejected"]).default("draft"),
    due_date: optionalDate,
    assigned_to: optionalUuid,
    template_id: optionalUuid,
    notes: optionalString,
});
export const productionAdvanceUpdateSchema = productionAdvanceCreateSchema.partial();

// ─── Production Advance Items ───────────────────────────────
export const productionAdvanceItemCreateSchema = z.object({
    advance_id: uuidField,
    department: optionalString,
    item_type: optionalString,
    description: nonEmptyString,
    status: z.enum(["pending", "confirmed", "issue", "resolved"]).default("pending"),
    assigned_to: optionalUuid,
    notes: optionalString,
    sort_order: z.number().int().default(0),
});
export const productionAdvanceItemUpdateSchema = productionAdvanceItemCreateSchema.partial();

// ─── Production Runs ────────────────────────────────────────
export const productionRunCreateSchema = z.object({
    project_id: uuidField,
    name: nonEmptyString.max(200),
    description: optionalString,
    status: z
        .enum(["planned", "setup", "active", "wrap", "completed", "cancelled"])
        .default("planned"),
    start_date: optionalDate,
    end_date: optionalDate,
    location_id: optionalUuid,
    notes: optionalString,
});
export const productionRunUpdateSchema = productionRunCreateSchema.partial();

// ─── Production Verticals ───────────────────────────────────
export const productionVerticalCreateSchema = z.object({
    name: nonEmptyString.max(200),
    description: optionalString,
    code: optionalString,
    is_active: z.boolean().default(true),
});
export const productionVerticalUpdateSchema = productionVerticalCreateSchema.partial();

// ═══════════════════════════════════════════════════════════════
// ASSET / INVENTORY DOMAIN
// ═══════════════════════════════════════════════════════════════

// ─── Asset Tags ─────────────────────────────────────────────
export const assetTagCreateSchema = z.object({
    name: nonEmptyString.max(100),
    color: optionalString,
    description: optionalString,
});
export const assetTagUpdateSchema = assetTagCreateSchema.partial();

// ─── Asset Versions ─────────────────────────────────────────
export const assetVersionCreateSchema = z.object({
    asset_id: uuidField,
    version_number: nonEmptyString,
    file_url: optionalString,
    file_size: nonNegativeNumber.optional(),
    changes_description: optionalString,
    uploaded_by: optionalUuid,
});
export const assetVersionUpdateSchema = assetVersionCreateSchema.partial();

// ─── BOMs (Bill of Materials) ───────────────────────────────
export const bomCreateSchema = z.object({
    name: nonEmptyString.max(200),
    project_id: optionalUuid,
    event_id: optionalUuid,
    description: optionalString,
    status: z.enum(["draft", "active", "archived"]).default("draft"),
    version: optionalString,
    notes: optionalString,
});
export const bomUpdateSchema = bomCreateSchema.partial();

// ─── Depreciation Schedules ─────────────────────────────────
export const depreciationScheduleCreateSchema = z.object({
    asset_id: uuidField,
    method: z
        .enum(["straight_line", "declining_balance", "units_of_production"])
        .default("straight_line"),
    useful_life_months: positiveNumber,
    salvage_value: nonNegativeNumber.default(0),
    start_date: dateField,
    notes: optionalString,
});
export const depreciationScheduleUpdateSchema = depreciationScheduleCreateSchema.partial();

// ─── Inventory Audits ───────────────────────────────────────
export const inventoryAuditCreateSchema = z.object({
    warehouse_id: optionalUuid,
    name: nonEmptyString.max(200),
    status: z.enum(["planned", "in_progress", "completed", "cancelled"]).default("planned"),
    scheduled_date: optionalDate,
    completed_date: optionalDate,
    audited_by: optionalUuid,
    notes: optionalString,
});
export const inventoryAuditUpdateSchema = inventoryAuditCreateSchema.partial();

// ─── Kits ───────────────────────────────────────────────────
export const kitCreateSchema = z.object({
    name: nonEmptyString.max(200),
    description: optionalString,
    category: optionalString,
    status: z.enum(["active", "archived", "draft"]).default("active"),
    notes: optionalString,
});
export const kitUpdateSchema = kitCreateSchema.partial();

// ─── Load Plans ─────────────────────────────────────────────
export const loadPlanCreateSchema = z.object({
    name: nonEmptyString.max(200),
    project_id: optionalUuid,
    event_id: optionalUuid,
    vehicle_id: optionalUuid,
    status: z.enum(["draft", "confirmed", "loaded", "in_transit", "delivered"]).default("draft"),
    departure_time: optionalDate,
    arrival_time: optionalDate,
    notes: optionalString,
});
export const loadPlanUpdateSchema = loadPlanCreateSchema.partial();

// ─── Storage Objects ────────────────────────────────────────
export const storageObjectCreateSchema = z.object({
    name: nonEmptyString.max(500),
    bucket: nonEmptyString,
    path: nonEmptyString,
    content_type: optionalString,
    size: nonNegativeNumber.optional(),
    entity_id: optionalUuid,
    entity_type: optionalString,
});
export const storageObjectUpdateSchema = storageObjectCreateSchema.partial();

// ═══════════════════════════════════════════════════════════════
// AUTOMATION DOMAIN
// ═══════════════════════════════════════════════════════════════

// ─── Automation Executions ──────────────────────────────────
export const automationExecutionCreateSchema = z.object({
    automation_id: uuidField,
    trigger_event: nonEmptyString,
    status: z.enum(["pending", "running", "completed", "failed", "cancelled"]).default("pending"),
    input_data: z.any().optional(),
    output_data: z.any().optional(),
    error_message: optionalString,
});
export const automationExecutionUpdateSchema = automationExecutionCreateSchema.partial();

// ─── Automation Rules ───────────────────────────────────────
export const automationRuleCreateSchema = z.object({
    automation_id: uuidField,
    name: nonEmptyString.max(200),
    rule_type: z.enum(["condition", "action", "delay", "branch"]).default("condition"),
    configuration: z.any().optional(),
    sort_order: z.number().int().default(0),
    is_active: z.boolean().default(true),
});
export const automationRuleUpdateSchema = automationRuleCreateSchema.partial();

// ═══════════════════════════════════════════════════════════════
// BRAND / CREATIVE DOMAIN
// ═══════════════════════════════════════════════════════════════

// ─── Brands ─────────────────────────────────────────────────
export const brandCreateSchema = z.object({
    name: nonEmptyString.max(200),
    description: optionalString,
    logo_url: optionalString,
    primary_color: optionalString,
    secondary_color: optionalString,
    is_active: z.boolean().default(true),
});
export const brandUpdateSchema = brandCreateSchema.partial();

// ═══════════════════════════════════════════════════════════════
// COMPLIANCE / LEGAL DOMAIN
// ═══════════════════════════════════════════════════════════════

// ─── Contract Amendments ────────────────────────────────────
export const contractAmendmentCreateSchema = z.object({
    contract_id: uuidField,
    title: nonEmptyString.max(200),
    description: optionalString,
    amendment_type: optionalString,
    effective_date: optionalDate,
    value_change: nonNegativeNumber.default(0),
    status: z
        .enum(["draft", "pending_approval", "approved", "rejected", "executed"])
        .default("draft"),
    notes: optionalString,
});
export const contractAmendmentUpdateSchema = contractAmendmentCreateSchema.partial();

// ─── Legal Holds ────────────────────────────────────────────
export const legalHoldCreateSchema = z.object({
    name: nonEmptyString.max(200),
    description: optionalString,
    hold_type: optionalString,
    entity_id: optionalUuid,
    entity_type: optionalString,
    status: z.enum(["active", "released", "expired"]).default("active"),
    start_date: dateField,
    end_date: optionalDate,
    custodian_id: optionalUuid,
    notes: optionalString,
});
export const legalHoldUpdateSchema = legalHoldCreateSchema.partial();

// ═══════════════════════════════════════════════════════════════
// COMMUNICATION / MESSAGING DOMAIN
// ═══════════════════════════════════════════════════════════════

// ─── Conversations ──────────────────────────────────────────
export const conversationCreateSchema = z.object({
    title: optionalString,
    channel_type: z.enum(["direct", "group", "project", "entity"]).default("direct"),
    entity_id: optionalUuid,
    entity_type: optionalString,
    is_archived: z.boolean().default(false),
});
export const conversationUpdateSchema = conversationCreateSchema.partial();

// ─── Messages ───────────────────────────────────────────────
export const messageCreateSchema = z.object({
    conversation_id: uuidField,
    body: nonEmptyString,
    message_type: z.enum(["text", "system", "file", "reaction"]).default("text"),
    parent_id: optionalUuid,
    file_url: optionalString,
    metadata: z.any().optional(),
});
export const messageUpdateSchema = messageCreateSchema.partial();

// ─── Vendor Communications ──────────────────────────────────
export const vendorCommunicationCreateSchema = z.object({
    vendor_id: uuidField,
    channel: z.enum(["in_app", "email", "sms", "phone", "portal"]).default("in_app"),
    direction: z.enum(["inbound", "outbound"]).default("outbound"),
    subject: optionalString,
    body: nonEmptyString,
    work_order_id: optionalUuid,
    project_id: optionalUuid,
});
export const vendorCommunicationUpdateSchema = vendorCommunicationCreateSchema.partial();

// ═══════════════════════════════════════════════════════════════
// CREDENTIALING / TICKETING DOMAIN
// ═══════════════════════════════════════════════════════════════

// ─── Credential Assignments ─────────────────────────────────
export const credentialAssignmentCreateSchema = z.object({
    credential_type_id: uuidField,
    profile_id: optionalUuid,
    entity_id: optionalUuid,
    entity_type: optionalString,
    status: z.enum(["active", "revoked", "expired", "suspended"]).default("active"),
    valid_from: optionalDate,
    valid_until: optionalDate,
    notes: optionalString,
});
export const credentialAssignmentUpdateSchema = credentialAssignmentCreateSchema.partial();

// ─── Credential Inventory Pools ─────────────────────────────
export const credentialInventoryPoolCreateSchema = z.object({
    credential_type_id: uuidField,
    event_id: optionalUuid,
    total_quantity: positiveNumber,
    assigned_quantity: nonNegativeNumber.default(0),
    reserved_quantity: nonNegativeNumber.default(0),
    notes: optionalString,
});
export const credentialInventoryPoolUpdateSchema = credentialInventoryPoolCreateSchema.partial();

// ─── Credential Types ───────────────────────────────────────
export const credentialTypeCreateSchema = z.object({
    name: nonEmptyString.max(200),
    description: optionalString,
    category: optionalString,
    access_level: optionalString,
    is_transferable: z.boolean().default(false),
    requires_photo: z.boolean().default(false),
    max_per_event: z.number().int().optional(),
    template_design: z.any().optional(),
});
export const credentialTypeUpdateSchema = credentialTypeCreateSchema.partial();

// ═══════════════════════════════════════════════════════════════
// CUSTOM FIELDS / PLATFORM DOMAIN
// ═══════════════════════════════════════════════════════════════

// ─── Custom Fields ──────────────────────────────────────────
export const customFieldCreateSchema = z.object({
    entity_type: nonEmptyString,
    entity_id: uuidField,
    custom_field_id: uuidField,
    field_key: nonEmptyString,
    value: optionalString,
});
export const customFieldUpdateSchema = customFieldCreateSchema.partial();

// ─── Custom Field Definitions ───────────────────────────────
export const customFieldDefinitionCreateSchema = z.object({
    name: nonEmptyString.max(200),
    field_key: nonEmptyString.max(100),
    field_type: z.enum([
        "text",
        "number",
        "date",
        "select",
        "multi_select",
        "boolean",
        "currency",
        "person",
        "url",
        "email",
        "phone",
    ]),
    entity_types: z.array(z.string()).default([]),
    options: z.any().default([]),
    default_value: optionalString,
    is_required: z.boolean().default(false),
    is_filterable: z.boolean().default(true),
    display_order: z.number().int().default(0),
    section: optionalString,
});
export const customFieldDefinitionUpdateSchema = customFieldDefinitionCreateSchema.partial();

// ─── Dashboards ─────────────────────────────────────────────
export const dashboardCreateSchema = z.object({
    name: nonEmptyString.max(200),
    description: optionalString,
    layout: z.any().optional(),
    is_default: z.boolean().default(false),
    is_shared: z.boolean().default(false),
});
export const dashboardUpdateSchema = dashboardCreateSchema.partial();

// ═══════════════════════════════════════════════════════════════
// DOCUMENT DOMAIN
// ═══════════════════════════════════════════════════════════════

// ─── Document Versions ──────────────────────────────────────
export const documentVersionCreateSchema = z.object({
    document_id: uuidField,
    version_number: nonEmptyString,
    file_url: optionalString,
    file_size: nonNegativeNumber.optional(),
    changes_description: optionalString,
    uploaded_by: optionalUuid,
});
export const documentVersionUpdateSchema = documentVersionCreateSchema.partial();

// ═══════════════════════════════════════════════════════════════
// LIVE EVENT OPERATIONS DOMAIN
// ═══════════════════════════════════════════════════════════════

// ─── FOH Zones ──────────────────────────────────────────────
export const fohZoneCreateSchema = z.object({
    name: nonEmptyString.max(200),
    event_id: optionalUuid,
    location_id: optionalUuid,
    zone_type: optionalString,
    capacity: z.number().int().optional(),
    status: z.enum(["setup", "open", "restricted", "closed"]).default("setup"),
    notes: optionalString,
});
export const fohZoneUpdateSchema = fohZoneCreateSchema.partial();

// ─── FOH Zone Readings ──────────────────────────────────────
export const fohZoneReadingCreateSchema = z.object({
    foh_zone_id: uuidField,
    reading_type: nonEmptyString,
    value: nonNegativeNumber,
    unit: optionalString,
    recorded_by: optionalUuid,
    notes: optionalString,
});
export const fohZoneReadingUpdateSchema = fohZoneReadingCreateSchema.partial();

// ─── Guest Incidents ────────────────────────────────────────
export const guestIncidentCreateSchema = z.object({
    event_id: optionalUuid,
    location_id: optionalUuid,
    incident_type: nonEmptyString,
    description: nonEmptyString,
    severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
    status: z.enum(["reported", "investigating", "resolved", "closed"]).default("reported"),
    reported_by: optionalUuid,
    guest_name: optionalString,
    notes: optionalString,
});
export const guestIncidentUpdateSchema = guestIncidentCreateSchema.partial();

// ─── Live Event Instances ───────────────────────────────────
export const liveEventInstanceCreateSchema = z.object({
    event_id: uuidField,
    instance_date: dateField,
    instance_number: z.number().int().default(1),
    status: z.enum(["scheduled", "active", "completed", "cancelled"]).default("scheduled"),
    doors_time: optionalDate,
    start_time: optionalDate,
    end_time: optionalDate,
    attendance: z.number().int().optional(),
    notes: optionalString,
});
export const liveEventInstanceUpdateSchema = liveEventInstanceCreateSchema.partial();

// ─── Live Financial Snapshots ───────────────────────────────
export const liveFinancialSnapshotCreateSchema = z.object({
    event_id: uuidField,
    snapshot_type: optionalString,
    total_revenue: nonNegativeNumber.default(0),
    total_expenses: nonNegativeNumber.default(0),
    net_profit: z.number().default(0),
    ticket_revenue: nonNegativeNumber.default(0),
    merchandise_revenue: nonNegativeNumber.default(0),
    food_beverage_revenue: nonNegativeNumber.default(0),
    notes: optionalString,
});
export const liveFinancialSnapshotUpdateSchema = liveFinancialSnapshotCreateSchema.partial();

// ─── Post Event Reports ─────────────────────────────────────
export const postEventReportCreateSchema = z.object({
    event_id: uuidField,
    title: nonEmptyString.max(200),
    summary: optionalString,
    attendance: z.number().int().optional(),
    total_revenue: nonNegativeNumber.optional(),
    total_expenses: nonNegativeNumber.optional(),
    lessons_learned: optionalString,
    recommendations: optionalString,
    status: z.enum(["draft", "submitted", "approved"]).default("draft"),
});
export const postEventReportUpdateSchema = postEventReportCreateSchema.partial();

// ─── Scan Events ────────────────────────────────────────────
export const scanEventCreateSchema = z.object({
    credential_id: optionalUuid,
    scan_point_id: optionalUuid,
    event_id: optionalUuid,
    scan_type: z.enum(["entry", "exit", "checkpoint", "vip"]).default("entry"),
    result: z.enum(["valid", "invalid", "duplicate", "expired"]).default("valid"),
    scanned_by: optionalUuid,
    notes: optionalString,
});
export const scanEventUpdateSchema = scanEventCreateSchema.partial();

// ─── Strike Sequences ───────────────────────────────────────
export const strikeSequenceCreateSchema = z.object({
    event_id: uuidField,
    name: nonEmptyString.max(200),
    description: optionalString,
    sequence_order: z.number().int().default(0),
    department: optionalString,
    estimated_duration_minutes: z.number().int().optional(),
    status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
    notes: optionalString,
});
export const strikeSequenceUpdateSchema = strikeSequenceCreateSchema.partial();

// ─── VIP Guests ─────────────────────────────────────────────
export const vipGuestCreateSchema = z.object({
    event_id: optionalUuid,
    name: nonEmptyString.max(200),
    email: optionalString,
    phone: optionalString,
    company: optionalString,
    vip_tier: z.enum(["standard", "gold", "platinum", "diamond"]).default("standard"),
    special_requirements: optionalString,
    notes: optionalString,
});
export const vipGuestUpdateSchema = vipGuestCreateSchema.partial();

// ─── VIP Service Requests ───────────────────────────────────
export const vipServiceRequestCreateSchema = z.object({
    vip_guest_id: optionalUuid,
    event_id: optionalUuid,
    request_type: nonEmptyString,
    description: nonEmptyString,
    priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
    status: z
        .enum(["pending", "assigned", "in_progress", "completed", "cancelled"])
        .default("pending"),
    assigned_to: optionalUuid,
    notes: optionalString,
});
export const vipServiceRequestUpdateSchema = vipServiceRequestCreateSchema.partial();

// ═══════════════════════════════════════════════════════════════
// HR / WORKFORCE DOMAIN
// ═══════════════════════════════════════════════════════════════

// ─── HR Certifications ──────────────────────────────────────
export const hrCertificationCreateSchema = z.object({
    worker_profile_id: optionalUuid,
    name: nonEmptyString.max(200),
    issuing_body: optionalString,
    certification_number: optionalString,
    issued_date: optionalDate,
    expiry_date: optionalDate,
    status: z.enum(["active", "expired", "revoked", "pending"]).default("active"),
    document_url: optionalString,
    notes: optionalString,
});
export const hrCertificationUpdateSchema = hrCertificationCreateSchema.partial();

// ─── Reviews ────────────────────────────────────────────────
export const reviewCreateSchema = z.object({
    subject_id: uuidField,
    reviewer_id: optionalUuid,
    review_type: optionalString,
    rating: z.number().min(1).max(5).optional(),
    summary: optionalString,
    strengths: optionalString,
    improvements: optionalString,
    status: z.enum(["draft", "submitted", "acknowledged"]).default("draft"),
});
export const reviewUpdateSchema = reviewCreateSchema.partial();

// ─── Review Cycles ──────────────────────────────────────────
export const reviewCycleCreateSchema = z.object({
    name: nonEmptyString.max(200),
    description: optionalString,
    cycle_type: optionalString,
    start_date: dateField,
    end_date: optionalDate,
    status: z.enum(["draft", "active", "completed", "cancelled"]).default("draft"),
});
export const reviewCycleUpdateSchema = reviewCycleCreateSchema.partial();

// ─── Worker Classifications ─────────────────────────────────
export const workerClassificationCreateSchema = z.object({
    worker_profile_id: uuidField,
    classification: nonEmptyString,
    is_active: z.boolean().default(true),
    effective_date: dateField,
    end_date: optionalDate,
    tax_classification: z.enum(["w2", "1099", "corp_to_corp", "international"]).default("w2"),
    hourly_rate: nonNegativeNumber.optional(),
    overtime_rate: nonNegativeNumber.optional(),
    day_rate: nonNegativeNumber.optional(),
    rate_type: z.enum(["hourly", "daily", "weekly", "flat"]).default("hourly"),
});
export const workerClassificationUpdateSchema = workerClassificationCreateSchema.partial();

// ─── Worker Compliance Docs ─────────────────────────────────
export const workerComplianceDocCreateSchema = z.object({
    worker_profile_id: uuidField,
    doc_type: nonEmptyString,
    doc_name: nonEmptyString.max(200),
    doc_number: optionalString,
    document_url: optionalString,
    issued_date: optionalDate,
    expiry_date: optionalDate,
    status: z
        .enum(["not_submitted", "pending_review", "approved", "rejected", "expired"])
        .default("not_submitted"),
    notes: optionalString,
});
export const workerComplianceDocUpdateSchema = workerComplianceDocCreateSchema.partial();

// ═══════════════════════════════════════════════════════════════
// QUALITY / ENGINEERING DOMAIN
// ═══════════════════════════════════════════════════════════════

// ─── QC Gates ───────────────────────────────────────────────
export const qcGateCreateSchema = z.object({
    name: nonEmptyString.max(200),
    project_id: optionalUuid,
    entity_id: optionalUuid,
    entity_type: optionalString,
    gate_type: optionalString,
    status: z.enum(["pending", "passed", "failed", "waived"]).default("pending"),
    criteria: optionalString,
    notes: optionalString,
});
export const qcGateUpdateSchema = qcGateCreateSchema.partial();

// ─── Quality Checks ─────────────────────────────────────────
export const qualityCheckCreateSchema = z.object({
    entity_id: uuidField,
    entity_type: nonEmptyString,
    template_id: optionalUuid,
    title: nonEmptyString.max(200),
    status: z.enum(["pending", "in_progress", "passed", "failed"]).default("pending"),
    checked_by: optionalUuid,
    checked_at: optionalDate,
    score: z.number().min(0).max(100).optional(),
    notes: optionalString,
});
export const qualityCheckUpdateSchema = qualityCheckCreateSchema.partial();

// ─── Quality Check Templates ────────────────────────────────
export const qualityCheckTemplateCreateSchema = z.object({
    name: nonEmptyString.max(200),
    description: optionalString,
    entity_type: nonEmptyString,
    checklist_items: z.any().default([]),
    passing_score: z.number().min(0).max(100).default(80),
    is_active: z.boolean().default(true),
});
export const qualityCheckTemplateUpdateSchema = qualityCheckTemplateCreateSchema.partial();

// ═══════════════════════════════════════════════════════════════
// SCHEDULING / RESOURCE DOMAIN
// ═══════════════════════════════════════════════════════════════

// ─── Scenarios ──────────────────────────────────────────────
export const scenarioCreateSchema = z.object({
    name: nonEmptyString.max(200),
    project_id: optionalUuid,
    description: optionalString,
    scenario_type: optionalString,
    status: z.enum(["draft", "active", "archived"]).default("draft"),
    assumptions: optionalString,
    notes: optionalString,
});
export const scenarioUpdateSchema = scenarioCreateSchema.partial();

// ─── Space Bookings ─────────────────────────────────────────
export const spaceBookingCreateSchema = z.object({
    space_id: uuidField,
    event_id: optionalUuid,
    booked_by: optionalUuid,
    start_time: dateField,
    end_time: dateField,
    purpose: optionalString,
    status: z.enum(["tentative", "confirmed", "cancelled"]).default("tentative"),
    notes: optionalString,
});
export const spaceBookingUpdateSchema = spaceBookingCreateSchema.partial();

// ═══════════════════════════════════════════════════════════════
// CRM / MARKETING DOMAIN
// ═══════════════════════════════════════════════════════════════

// ─── Survey Responses ───────────────────────────────────────
export const surveyResponseCreateSchema = z.object({
    survey_template_id: uuidField,
    respondent_id: optionalUuid,
    respondent_email: optionalString,
    responses: z.any().default({}),
    status: z.enum(["in_progress", "completed", "abandoned"]).default("in_progress"),
    submitted_at: optionalDate,
    score: z.number().optional(),
});
export const surveyResponseUpdateSchema = surveyResponseCreateSchema.partial();

// ─── Survey Templates ───────────────────────────────────────
export const surveyTemplateCreateSchema = z.object({
    name: nonEmptyString.max(200),
    description: optionalString,
    survey_type: optionalString,
    questions: z.any().default([]),
    is_active: z.boolean().default(true),
    settings: z.any().optional(),
});
export const surveyTemplateUpdateSchema = surveyTemplateCreateSchema.partial();

// ─── Testimonials ───────────────────────────────────────────
export const testimonialCreateSchema = z.object({
    company_id: optionalUuid,
    contact_id: optionalUuid,
    project_id: optionalUuid,
    quote: nonEmptyString,
    full_testimonial: optionalString,
    rating: z.number().min(1).max(5).optional(),
    category: optionalString,
    status: z.enum(["pending", "approved", "rejected", "featured"]).default("pending"),
});
export const testimonialUpdateSchema = testimonialCreateSchema.partial();

// ═══════════════════════════════════════════════════════════════
// INTEGRATION / SYNC DOMAIN
// ═══════════════════════════════════════════════════════════════

// ─── Provider Connections ───────────────────────────────────
export const providerConnectionCreateSchema = z.object({
    provider: nonEmptyString.max(100),
    provider_account_id: optionalString,
    status: z.enum(["active", "inactive", "error", "expired"]).default("active"),
    config: z.any().optional(),
    credentials_encrypted: optionalString,
    last_sync_at: optionalDate,
});
export const providerConnectionUpdateSchema = providerConnectionCreateSchema.partial();

// ─── Sync Events ────────────────────────────────────────────
export const syncEventCreateSchema = z.object({
    provider: nonEmptyString,
    entity_type: nonEmptyString,
    entity_id: optionalUuid,
    direction: z.enum(["inbound", "outbound"]).default("inbound"),
    status: z.enum(["pending", "success", "failed", "conflict"]).default("pending"),
    payload: z.any().optional(),
    error_message: optionalString,
});
export const syncEventUpdateSchema = syncEventCreateSchema.partial();

// ═══════════════════════════════════════════════════════════════
// ENGINEERING / TECHNICAL DOMAIN
// ═══════════════════════════════════════════════════════════════

// ─── Technical Specs ────────────────────────────────────────
export const technicalSpecCreateSchema = z.object({
    name: nonEmptyString.max(200),
    entity_id: optionalUuid,
    entity_type: optionalString,
    spec_type: optionalString,
    content: optionalString,
    version: optionalString,
    status: z.enum(["draft", "review", "approved", "superseded"]).default("draft"),
    notes: optionalString,
});
export const technicalSpecUpdateSchema = technicalSpecCreateSchema.partial();

// ─── Work Packages ──────────────────────────────────────────
export const workPackageCreateSchema = z.object({
    project_id: uuidField,
    name: nonEmptyString.max(200),
    description: optionalString,
    status: z
        .enum(["planned", "in_progress", "completed", "on_hold", "cancelled"])
        .default("planned"),
    priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
    estimated_hours: nonNegativeNumber.optional(),
    actual_hours: nonNegativeNumber.default(0),
    start_date: optionalDate,
    due_date: optionalDate,
    lead_id: optionalUuid,
});
export const workPackageUpdateSchema = workPackageCreateSchema.partial();

// ═══════════════════════════════════════════════════════════════
// HR / TIME OFF DOMAIN
// ═══════════════════════════════════════════════════════════════

// ─── Time Off Requests ──────────────────────────────────────
export const timeOffRequestCreateSchema = z.object({
    crew_member_id: uuidField,
    time_off_type: z
        .enum(["vacation", "sick", "personal", "bereavement", "jury_duty", "other"])
        .default("vacation"),
    start_date: dateField,
    end_date: dateField,
    hours_per_day: nonNegativeNumber.default(8),
    is_half_day: z.boolean().default(false),
    reason: optionalString,
    status: z.enum(["pending", "approved", "denied", "cancelled"]).default("pending"),
    notes: optionalString,
});
export const timeOffRequestUpdateSchema = timeOffRequestCreateSchema.partial();

// ═══════════════════════════════════════════════════════════════
// REMEDIATION R1 — 22 Missing Schemas (Audit 2025-03-16)
// ═══════════════════════════════════════════════════════════════

// ─── Account Health Scores ──────────────────────────────────
export const accountHealthScoreCreateSchema = z.object({
    company_id: uuidField,
    score_date: optionalDate,
    overall_score: z.number().int().min(0).max(100),
    delivery_score: z.number().int().min(0).max(100).default(0),
    payment_score: z.number().int().min(0).max(100).default(0),
    engagement_score: z.number().int().min(0).max(100).default(0),
    satisfaction_score: z.number().int().min(0).max(100).default(0),
    expansion_score: z.number().int().min(0).max(100).default(0),
    risk_level: z.enum(["low", "medium", "high", "critical"]).default("low"),
    risk_factors: z.any().optional(),
    recommendations: z.any().optional(),
    lifetime_revenue: nonNegativeNumber.default(0),
    active_project_count: z.number().int().min(0).default(0),
    open_opportunity_count: z.number().int().min(0).default(0),
    overdue_invoice_count: z.number().int().min(0).default(0),
    notes: optionalString,
});
export const accountHealthScoreUpdateSchema = accountHealthScoreCreateSchema.partial();

// ─── Approval Workflows ─────────────────────────────────────
export const approvalWorkflowCreateSchema = z.object({
    name: nonEmptyString.max(200),
    description: optionalString,
    entity_type: nonEmptyString,
    lifecycle_stage: optionalString,
    auto_escalation_hours: z.number().int().min(0).default(72),
    allow_delegation: z.boolean().default(true),
    require_comments: z.boolean().default(false),
    status: z.enum(["draft", "active", "archived"]).default("draft"),
    version: z.number().int().min(1).default(1),
});
export const approvalWorkflowUpdateSchema = approvalWorkflowCreateSchema.partial();

// ─── Catalog Categories ─────────────────────────────────────
export const catalogCategoryCreateSchema = z.object({
    name: nonEmptyString.max(200),
    slug: nonEmptyString.max(100),
    category_type: optionalString.default("custom"),
    parent_id: optionalUuid,
    description: optionalString,
    icon: optionalString,
    sort_order: z.number().int().default(0),
    depth: z.number().int().min(0).max(2).default(0),
    is_active: z.boolean().default(true),
});
export const catalogCategoryUpdateSchema = catalogCategoryCreateSchema.partial();

// ─── Catalog Items ──────────────────────────────────────────
export const catalogItemCreateSchema = z.object({
    category_id: uuidField,
    name: nonEmptyString.max(300),
    description: optionalString,
    sku: optionalString,
    make: optionalString,
    model: optionalString,
    specifications: z.any().optional(),
    tags: z.array(z.string()).default([]),
    default_unit_cost: nonNegativeNumber.default(0),
    currency: z.string().default("USD"),
    unit_of_measure: z.string().default("each"),
    status: z.enum(["active", "discontinued", "draft", "archived"]).default("active"),
    is_custom: z.boolean().default(false),
    is_critical_path: z.boolean().default(false),
    client_visible: z.boolean().default(true),
    image_url: optionalString,
    thumbnail_url: optionalString,
    available_quantity: z.number().int().min(0).default(0),
    min_lead_time_days: z.number().int().min(0).default(0),
    sort_order: z.number().int().default(0),
});
export const catalogItemUpdateSchema = catalogItemCreateSchema.partial();

// ─── Channel Templates ──────────────────────────────────────
export const channelTemplateCreateSchema = z.object({
    name: nonEmptyString.max(200),
    event_type: nonEmptyString,
    channels_config: z.any().default([]),
    is_active: z.boolean().default(true),
});
export const channelTemplateUpdateSchema = channelTemplateCreateSchema.partial();

// ─── Comm Channels ──────────────────────────────────────────
export const commChannelCreateSchema = z.object({
    live_event_id: uuidField,
    channel_number: z.number().int().positive(),
    name: nonEmptyString.max(100),
    priority: z.enum(["critical", "high", "medium", "low"]).default("medium"),
    assignment: nonEmptyString,
    discipline: optionalString,
    is_restricted: z.boolean().default(false),
});
export const commChannelUpdateSchema = commChannelCreateSchema.partial();

// ─── Command Positions ──────────────────────────────────────
export const commandPositionCreateSchema = z.object({
    live_event_id: uuidField,
    position_type: nonEmptyString,
    layer: nonEmptyString,
    profile_id: uuidField,
    radio_callsign: optionalString,
    primary_channel_id: optionalUuid,
    mobile_number: optionalString,
    is_active: z.boolean().default(true),
    custom_label: optionalString,
});
export const commandPositionUpdateSchema = commandPositionCreateSchema.partial();

// ─── Compliance Templates ───────────────────────────────────
export const complianceTemplateCreateSchema = z.object({
    name: nonEmptyString.max(200),
    doc_type: nonEmptyString,
    description: optionalString,
    applies_to_classifications: z.array(z.string()).default([]),
    scope: z.enum(["universal", "organization", "project"]).default("universal"),
    is_required: z.boolean().default(true),
    has_expiry: z.boolean().default(true),
    expiry_warning_days: z.number().int().min(0).default(30),
    auto_suspend_on_expiry: z.boolean().default(false),
    blocks_scheduling: z.boolean().default(false),
    blocks_onboarding_completion: z.boolean().default(false),
    display_order: z.number().int().default(0),
    is_active: z.boolean().default(true),
});
export const complianceTemplateUpdateSchema = complianceTemplateCreateSchema.partial();

// ─── Email Messages ─────────────────────────────────────────
export const emailMessageCreateSchema = z.object({
    entity_type: nonEmptyString,
    entity_id: uuidField,
    from_address: z.string().email("Invalid email"),
    from_name: optionalString,
    to_addresses: z.array(z.string()).default([]),
    cc_addresses: z.array(z.string()).default([]),
    subject: nonEmptyString.max(500),
    body_text: optionalString,
    body_html: optionalString,
    message_id: optionalString,
    in_reply_to: optionalString,
    thread_id: optionalString,
    direction: z.enum(["inbound", "outbound"]).default("inbound"),
    attachments: z.any().default([]),
});
export const emailMessageUpdateSchema = emailMessageCreateSchema.partial();

// ─── Engagement Terms ───────────────────────────────────────
export const engagementTermCreateSchema = z.object({
    worker_profile_id: uuidField,
    classification_id: uuidField,
    project_id: optionalUuid,
    work_order_id: optionalUuid,
    contract_id: optionalUuid,
    role: nonEmptyString,
    department: optionalString,
    start_date: dateField,
    end_date: optionalDate,
    is_ongoing: z.boolean().default(false),
    rate: positiveNumber,
    rate_type: z.enum(["hourly", "daily", "weekly", "monthly", "flat"]).default("hourly"),
    overtime_rate: nonNegativeNumber.optional(),
    not_to_exceed: nonNegativeNumber.optional(),
    estimated_hours: nonNegativeNumber.optional(),
    status: z.enum(["pending", "active", "completed", "terminated"]).default("pending"),
    is_billable: z.boolean().default(true),
    billing_code: optionalString,
});
export const engagementTermUpdateSchema = engagementTermCreateSchema.partial();

// ─── Environmental Readings ─────────────────────────────────
export const environmentalReadingCreateSchema = z.object({
    live_event_id: uuidField,
    temperature_f: z.number().optional(),
    humidity_percent: z.number().int().min(0).max(100).optional(),
    wind_speed_mph: nonNegativeNumber.optional(),
    wind_gusts_mph: nonNegativeNumber.optional(),
    precipitation: optionalString,
    visibility: optionalString,
    weather_alert: optionalString,
    weather_alert_source: optionalString,
    noise_level_db: nonNegativeNumber.optional(),
    noise_location: optionalString,
    total_power_load_amps: nonNegativeNumber.optional(),
    power_capacity_amps: nonNegativeNumber.optional(),
    generator_fuel_percent: z.number().int().min(0).max(100).optional(),
    notes: optionalString,
});
export const environmentalReadingUpdateSchema = environmentalReadingCreateSchema.partial();

// ─── Equipment Check-Ins ────────────────────────────────────
export const equipmentCheckInCreateSchema = z.object({
    live_event_id: uuidField,
    asset_id: uuidField,
    asset_assignment_id: optionalUuid,
    condition_on_arrival: z
        .enum(["excellent", "good", "fair", "damaged", "non_functional"])
        .default("good"),
    condition_notes: optionalString,
    condition_photos: z.array(z.string()).default([]),
    status: z.enum(["checked_in", "deployed", "checked_out", "missing"]).default("checked_in"),
    deployed_location: optionalString,
    department: optionalString,
    expected_quantity: z.number().int().min(1).default(1),
    received_quantity: z.number().int().min(0).default(1),
});
export const equipmentCheckInUpdateSchema = equipmentCheckInCreateSchema.partial();

// ─── Inventory Reservations ─────────────────────────────────
export const inventoryReservationCreateSchema = z.object({
    asset_id: optionalUuid,
    consumable_id: optionalUuid,
    quantity: nonNegativeNumber.default(1),
    project_id: uuidField,
    activation_id: optionalUuid,
    event_id: optionalUuid,
    reserved_by: uuidField,
    status: z
        .enum(["pending", "confirmed", "checked_out", "returned", "cancelled"])
        .default("pending"),
    reserved_from: dateField,
    reserved_until: dateField,
    notes: optionalString,
    priority: z.number().int().default(0),
});
export const inventoryReservationUpdateSchema = inventoryReservationCreateSchema.partial();

// ─── Knowledge Articles ─────────────────────────────────────
export const knowledgeArticleCreateSchema = z.object({
    title: nonEmptyString.max(300),
    body: optionalString,
    category: z.string().default("guide"),
    tags: z.array(z.string()).default([]),
    status: z.enum(["draft", "published", "archived"]).default("draft"),
    version: z.number().int().min(1).default(1),
    author_id: uuidField,
});
export const knowledgeArticleUpdateSchema = knowledgeArticleCreateSchema.partial();

// ─── Logistics Events ───────────────────────────────────────
export const logisticsEventCreateSchema = z.object({
    shipment_id: uuidField,
    event_type: nonEmptyString,
    occurred_at: optionalDate,
    location_text: optionalString,
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    notes: optionalString,
});
export const logisticsEventUpdateSchema = logisticsEventCreateSchema.partial();

// ─── Maintenance Schedules ──────────────────────────────────
export const maintenanceScheduleCreateSchema = z.object({
    name: nonEmptyString.max(200),
    description: optionalString,
    asset_id: optionalUuid,
    asset_category: optionalString,
    frequency_type: z.enum(["calendar", "usage", "condition"]).default("calendar"),
    frequency_value: z.number().int().positive().default(90),
    frequency_unit: z.enum(["days", "weeks", "months", "years", "hours", "miles"]).default("days"),
    estimated_duration_hours: nonNegativeNumber.optional(),
    estimated_cost: nonNegativeNumber.optional(),
    requires_certification: z.boolean().default(false),
    certification_type: optionalString,
    checklist_template: z.any().default([]),
    is_active: z.boolean().default(true),
});
export const maintenanceScheduleUpdateSchema = maintenanceScheduleCreateSchema.partial();

// ─── POS Transactions ───────────────────────────────────────
export const posTransactionCreateSchema = z.object({
    connection_id: uuidField,
    event_id: optionalUuid,
    live_event_id: optionalUuid,
    foh_zone_id: optionalUuid,
    provider_transaction_id: nonEmptyString,
    subtotal: nonNegativeNumber.default(0),
    tax_amount: nonNegativeNumber.default(0),
    tip_amount: nonNegativeNumber.default(0),
    discount_amount: nonNegativeNumber.default(0),
    total_amount: nonNegativeNumber.default(0),
    currency: z.string().default("USD"),
    payment_method: z
        .enum(["cash", "credit_card", "debit_card", "mobile", "rfid", "comp", "other"])
        .optional(),
    category: z
        .enum(["ticket", "food_beverage", "merchandise", "parking", "vip_upgrade", "other"])
        .optional(),
    vendor_id: optionalUuid,
    terminal_id: optionalString,
    operator_name: optionalString,
    is_refund: z.boolean().default(false),
    original_transaction_id: optionalUuid,
    refund_reason: optionalString,
    raw_payload: z.any().optional(),
});
export const posTransactionUpdateSchema = posTransactionCreateSchema.partial();

// ─── Revenue Recognition Entries ────────────────────────────
export const revenueRecognitionEntryCreateSchema = z.object({
    project_id: uuidField,
    period_start: dateField,
    period_end: dateField,
    recognized_amount: nonNegativeNumber.default(0),
    deferred_amount: nonNegativeNumber.default(0),
    invoiced_amount: nonNegativeNumber.default(0),
    method: z
        .enum([
            "percentage_of_completion",
            "milestone",
            "time_and_materials",
            "completed_contract",
            "retainer",
        ])
        .default("time_and_materials"),
    notes: optionalString,
});
export const revenueRecognitionEntryUpdateSchema = revenueRecognitionEntryCreateSchema.partial();

// ─── SLA Policies ───────────────────────────────────────────
export const slaPolicyCreateSchema = z.object({
    name: nonEmptyString.max(200),
    description: optionalString,
    priority: z.enum(["critical", "high", "medium", "low"]).default("medium"),
    response_time_hours: positiveNumber,
    resolution_time_hours: positiveNumber,
    escalation_after_hours: nonNegativeNumber.optional(),
    escalation_to: optionalUuid,
    applies_to_types: z.array(z.string()).default([]),
    is_active: z.boolean().default(true),
});
export const slaPolicyUpdateSchema = slaPolicyCreateSchema.partial();

// ─── Time Tracking Policies ─────────────────────────────────
export const timeTrackingPolicyCreateSchema = z.object({
    max_daily_hours: nonNegativeNumber.default(12),
    required_fields: z.array(z.string()).default(["project_id"]),
    logging_deadline_hour: z.number().int().min(0).max(23).default(20),
    non_working_days: z.array(z.number().int()).default([0, 6]),
    overtime_threshold_daily: nonNegativeNumber.default(8),
    overtime_threshold_weekly: nonNegativeNumber.default(40),
    require_task: z.boolean().default(false),
    require_description: z.boolean().default(false),
    reminder_enabled: z.boolean().default(true),
    is_active: z.boolean().default(true),
});
export const timeTrackingPolicyUpdateSchema = timeTrackingPolicyCreateSchema.partial();

// ─── Upsell Events ──────────────────────────────────────────
export const upsellEventCreateSchema = z.object({
    trigger_id: uuidField,
    user_id: optionalUuid,
    metadata: z.any().default({}),
    converted: z.boolean().default(false),
});
export const upsellEventUpdateSchema = upsellEventCreateSchema.partial();

// ─── Upsell Triggers ────────────────────────────────────────
export const upsellTriggerCreateSchema = z.object({
    name: nonEmptyString.max(200),
    description: optionalString,
    trigger_type: z.enum([
        "field_access_attempt",
        "export_attempt",
        "api_tier_insufficient",
        "user_growth",
    ]),
    threshold_count: z.number().int().positive().default(10),
    threshold_window_days: z.number().int().positive().default(3),
    target_tier: nonEmptyString,
    notification_type: z.enum(["in_app", "email", "slack_webhook"]),
    is_active: z.boolean().default(true),
});
export const upsellTriggerUpdateSchema = upsellTriggerCreateSchema.partial();

// ─── Departments ────────────────────────────────────────────
export const departmentCreateSchema = z.object({
    name: nonEmptyString.max(200),
    slug: nonEmptyString.max(200),
    description: optionalString,
    parent_department_id: z.string().uuid().nullable().optional(),
    head_user_id: z.string().uuid().nullable().optional(),
    is_active: z.boolean().default(true),
    sort_order: z.number().int().default(0),
    cost_center_code: optionalString,
});
export const departmentUpdateSchema = departmentCreateSchema.partial();

// ─── Lead Sources ───────────────────────────────────────────
export const leadSourceCreateSchema = z.object({
    name: nonEmptyString.max(200),
    description: optionalString,
    category: z
        .enum(["referral", "inbound", "outbound", "event", "partner", "organic", "paid", "other"])
        .default("other"),
    is_active: z.boolean().default(true),
});
export const leadSourceUpdateSchema = leadSourceCreateSchema.partial();
