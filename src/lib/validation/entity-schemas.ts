/* ═══════════════════════════════════════════════════════════════
   ENTITY SCHEMAS — P0.5 Foundation Infrastructure
   
   Zod validation schemas for all entities not yet covered by
   schemas.ts. Each entity has a create + update schema pair.
   ═══════════════════════════════════════════════════════════════ */

import { z } from "zod";

// ─── Shared Primitives ───────────────────────────────────────
const nonEmptyString = z.string().min(1, "Required");
const optionalString = z.string().optional().default("");
const positiveNumber = z.number().positive("Must be greater than 0");
const nonNegativeNumber = z.number().min(0, "Must be 0 or greater");
const dateField = z.string().regex(/^\d{4}-\d{2}-\d{2}/, "Invalid date format");
const optionalDate = z.string().optional().or(z.literal(""));
const uuidField = z.string().uuid("Invalid ID");
const optionalUuid = uuidField.optional().or(z.literal(""));
const emailField = z.string().email("Invalid email address");

// ─── Opportunities ───────────────────────────────────────────

export const opportunityCreateSchema = z.object({
    title: nonEmptyString.max(200),
    account_name: optionalString.pipe(z.string().max(200)),
    contact_name: optionalString.pipe(z.string().max(200)),
    contact_email: emailField.optional().or(z.literal("")),
    value: nonNegativeNumber.default(0),
    probability: z.number().min(0).max(100).default(20),
    stage: z
        .enum([
            "identified",
            "qualified",
            "proposal",
            "negotiation",
            "verbal_commit",
            "won",
            "lost",
            "dormant",
        ])
        .default("identified"),
    expected_close_date: optionalDate,
    source: optionalString,
    notes: optionalString,
});

export const opportunityUpdateSchema = opportunityCreateSchema.partial();

// ─── SOW (Scope of Work) ────────────────────────────────────

export const sowCreateSchema = z.object({
    title: nonEmptyString.max(300),
    project_id: optionalUuid,
    deal_id: optionalUuid,
    version: z.number().int().min(1).default(1),
    status: z
        .enum([
            "draft",
            "internal_review",
            "client_review",
            "revision",
            "approved",
            "active",
            "completed",
            "cancelled",
        ])
        .default("draft"),
    total_value: nonNegativeNumber.default(0),
    currency: z.string().length(3).default("USD"),
    start_date: optionalDate,
    end_date: optionalDate,
    payment_terms: optionalString,
    notes: optionalString,
});

export const sowUpdateSchema = sowCreateSchema.partial();

// ─── Expenses ────────────────────────────────────────────────

export const expenseCreateSchema = z.object({
    description: nonEmptyString.max(500),
    amount: positiveNumber,
    currency: z.string().length(3).default("USD"),
    category: nonEmptyString.max(100),
    project_id: optionalUuid,
    vendor_id: optionalUuid,
    receipt_url: optionalString,
    expense_date: dateField,
    status: z.enum(["draft", "submitted", "approved", "rejected", "reimbursed"]).default("draft"),
    notes: optionalString,
});

export const expenseUpdateSchema = expenseCreateSchema.partial();

// ─── Work Orders ─────────────────────────────────────────────

export const workOrderCreateSchema = z.object({
    title: nonEmptyString.max(300),
    description: optionalString,
    vendor_id: optionalUuid,
    project_id: optionalUuid,
    priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
    status: z
        .enum([
            "draft",
            "pending_approval",
            "approved",
            "dispatched",
            "in_progress",
            "completed",
            "invoiced",
            "cancelled",
        ])
        .default("draft"),
    estimated_cost: nonNegativeNumber.default(0),
    actual_cost: nonNegativeNumber.optional(),
    scheduled_start: optionalDate,
    scheduled_end: optionalDate,
    notes: optionalString,
});

export const workOrderUpdateSchema = workOrderCreateSchema.partial();

// ─── Shipments ───────────────────────────────────────────────

export const shipmentCreateSchema = z.object({
    tracking_number: optionalString,
    carrier: optionalString.pipe(z.string().max(200)),
    origin_location_id: optionalUuid,
    destination_location_id: optionalUuid,
    project_id: optionalUuid,
    status: z
        .enum([
            "pending",
            "picked_up",
            "in_transit",
            "out_for_delivery",
            "delivered",
            "returned",
            "lost",
        ])
        .default("pending"),
    ship_date: optionalDate,
    estimated_arrival: optionalDate,
    actual_arrival: optionalDate,
    weight_kg: nonNegativeNumber.optional(),
    notes: optionalString,
});

export const shipmentUpdateSchema = shipmentCreateSchema.partial();

// ─── Change Orders ───────────────────────────────────────────

export const changeOrderCreateSchema = z.object({
    title: nonEmptyString.max(300),
    description: nonEmptyString.max(5000),
    project_id: optionalUuid,
    contract_id: optionalUuid,
    change_type: z.enum(["scope", "schedule", "budget", "resource", "other"]).default("scope"),
    status: z
        .enum(["draft", "submitted", "under_review", "approved", "rejected", "implemented"])
        .default("draft"),
    cost_impact: z.number().default(0),
    schedule_impact_days: z.number().int().default(0),
    justification: optionalString,
    notes: optionalString,
});

export const changeOrderUpdateSchema = changeOrderCreateSchema.partial();

// ─── Service Requests ────────────────────────────────────────

export const serviceRequestCreateSchema = z.object({
    title: nonEmptyString.max(300),
    description: nonEmptyString.max(5000),
    request_type: z
        .enum(["maintenance", "support", "installation", "inspection", "other"])
        .default("support"),
    priority: z.enum(["low", "medium", "high", "urgent", "critical"]).default("medium"),
    status: z
        .enum(["open", "triaged", "assigned", "in_progress", "on_hold", "resolved", "closed"])
        .default("open"),
    project_id: optionalUuid,
    location_id: optionalUuid,
    requested_by: optionalUuid,
    assigned_to: optionalUuid,
    due_date: optionalDate,
    notes: optionalString,
});

export const serviceRequestUpdateSchema = serviceRequestCreateSchema.partial();

// ─── Purchase Orders ─────────────────────────────────────────

export const purchaseOrderCreateSchema = z.object({
    po_number: optionalString,
    vendor_id: optionalUuid,
    project_id: optionalUuid,
    status: z
        .enum([
            "draft",
            "submitted",
            "approved",
            "ordered",
            "partially_received",
            "received",
            "invoiced",
            "cancelled",
        ])
        .default("draft"),
    total_amount: nonNegativeNumber.default(0),
    currency: z.string().length(3).default("USD"),
    order_date: optionalDate,
    expected_delivery: optionalDate,
    shipping_address: optionalString,
    notes: optionalString,
});

export const purchaseOrderUpdateSchema = purchaseOrderCreateSchema.partial();

// ─── Milestones ──────────────────────────────────────────────

export const milestoneCreateSchema = z.object({
    title: nonEmptyString.max(300),
    description: optionalString,
    project_id: optionalUuid,
    status: z
        .enum(["pending", "in_progress", "completed", "missed", "deferred"])
        .default("pending"),
    due_date: dateField,
    completed_date: optionalDate,
    deliverables: optionalString,
    payment_amount: nonNegativeNumber.optional(),
    notes: optionalString,
});

export const milestoneUpdateSchema = milestoneCreateSchema.partial();

// ─── Crew Shifts ─────────────────────────────────────────────

export const crewShiftCreateSchema = z.object({
    crew_member_id: uuidField,
    project_id: optionalUuid,
    event_id: optionalUuid,
    shift_date: dateField,
    call_time: nonEmptyString,
    end_time: nonEmptyString,
    role: optionalString.pipe(z.string().max(200)),
    status: z
        .enum([
            "scheduled",
            "confirmed",
            "checked_in",
            "active",
            "completed",
            "no_show",
            "cancelled",
        ])
        .default("scheduled"),
    department: optionalString,
    notes: optionalString,
});

export const crewShiftUpdateSchema = crewShiftCreateSchema.partial();

// ─── Time Entries ────────────────────────────────────────────

export const timeEntryCreateSchema = z.object({
    crew_member_id: uuidField,
    project_id: optionalUuid,
    task_id: optionalUuid,
    date: dateField,
    hours: z.number().min(0.25).max(24),
    rate: nonNegativeNumber.optional(),
    status: z.enum(["draft", "submitted", "approved", "rejected", "invoiced"]).default("draft"),
    description: optionalString,
    billable: z.boolean().default(true),
});

export const timeEntryUpdateSchema = timeEntryCreateSchema.partial();

// ─── Live Events ─────────────────────────────────────────────

export const liveEventCreateSchema = z.object({
    name: nonEmptyString.max(300),
    description: optionalString,
    event_type: z
        .enum(["conference", "concert", "festival", "corporate", "sporting", "exhibition", "other"])
        .default("other"),
    status: z
        .enum([
            "draft",
            "planning",
            "pre_production",
            "load_in",
            "rehearsal",
            "live",
            "intermission",
            "strike",
            "post_event",
            "completed",
            "cancelled",
        ])
        .default("draft"),
    venue_id: optionalUuid,
    project_id: optionalUuid,
    start_date: dateField,
    end_date: dateField,
    doors_time: optionalString,
    show_time: optionalString,
    expected_attendance: z.number().int().min(0).optional(),
    notes: optionalString,
});

export const liveEventUpdateSchema = liveEventCreateSchema.partial();

// ─── ROS Cues ────────────────────────────────────────────────

export const rosCueCreateSchema = z.object({
    event_id: uuidField,
    cue_number: nonEmptyString.max(50),
    department: nonEmptyString.max(100),
    description: nonEmptyString.max(1000),
    status: z
        .enum(["standby", "go", "executing", "complete", "skipped", "aborted"])
        .default("standby"),
    scheduled_time: optionalString,
    duration_seconds: z.number().int().min(0).optional(),
    depends_on_cue: optionalString,
    notes: optionalString,
});

export const rosCueUpdateSchema = rosCueCreateSchema.partial();

// ─── Readiness Gates ─────────────────────────────────────────

export const readinessGateCreateSchema = z.object({
    event_id: uuidField,
    gate_name: nonEmptyString.max(200),
    department: nonEmptyString.max(100),
    status: z.enum(["not_ready", "partial", "ready", "overridden"]).default("not_ready"),
    checklist_items: z.array(z.string()).optional(),
    responsible_id: optionalUuid,
    notes: optionalString,
});

export const readinessGateUpdateSchema = readinessGateCreateSchema.partial();

// ─── Documents ───────────────────────────────────────────────

export const documentCreateSchema = z.object({
    title: nonEmptyString.max(300),
    document_type: z
        .enum(["call_sheet", "tech_sheet", "proposal", "brief", "report", "template", "other"])
        .default("other"),
    status: z
        .enum(["draft", "in_review", "approved", "published", "archived", "superseded"])
        .default("draft"),
    project_id: optionalUuid,
    version: z.number().int().min(1).default(1),
    file_url: optionalString,
    content: optionalString,
    notes: optionalString,
});

export const documentUpdateSchema = documentCreateSchema.partial();

// ─── Incidents ───────────────────────────────────────────────

export const incidentCreateSchema = z.object({
    title: nonEmptyString.max(300),
    description: nonEmptyString.max(5000),
    severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
    category: z
        .enum(["safety", "security", "equipment", "weather", "medical", "environmental", "other"])
        .default("other"),
    status: z
        .enum(["reported", "triaged", "investigating", "mitigating", "resolved", "closed"])
        .default("reported"),
    project_id: optionalUuid,
    event_id: optionalUuid,
    location_id: optionalUuid,
    reported_by: optionalUuid,
    assigned_to: optionalUuid,
    occurred_at: optionalDate,
    notes: optionalString,
});

export const incidentUpdateSchema = incidentCreateSchema.partial();

// ─── Estimates ───────────────────────────────────────────────

export const estimateCreateSchema = z.object({
    title: nonEmptyString.max(300),
    description: optionalString,
    client_name: optionalString.pipe(z.string().max(200)),
    project_id: optionalUuid,
    deal_id: optionalUuid,
    status: z
        .enum(["draft", "pending_review", "sent", "accepted", "rejected", "expired", "converted"])
        .default("draft"),
    total_amount: nonNegativeNumber.default(0),
    currency: z.string().length(3).default("USD"),
    valid_until: optionalDate,
    notes: optionalString,
});

export const estimateUpdateSchema = estimateCreateSchema.partial();

// ─── Rental Agreements ───────────────────────────────────────

export const rentalAgreementCreateSchema = z.object({
    title: nonEmptyString.max(300),
    vendor_id: optionalUuid,
    project_id: optionalUuid,
    asset_ids: z.array(uuidField).optional(),
    status: z
        .enum([
            "draft",
            "pending_approval",
            "approved",
            "active",
            "extended",
            "returned",
            "overdue",
            "cancelled",
        ])
        .default("draft"),
    daily_rate: nonNegativeNumber.default(0),
    total_cost: nonNegativeNumber.default(0),
    currency: z.string().length(3).default("USD"),
    start_date: dateField,
    end_date: dateField,
    return_date: optionalDate,
    notes: optionalString,
});

export const rentalAgreementUpdateSchema = rentalAgreementCreateSchema.partial();

// ─── Rights / Licenses ───────────────────────────────────────

export const rightsCreateSchema = z.object({
    title: nonEmptyString.max(300),
    rights_type: z
        .enum(["music", "image", "video", "likeness", "brand", "venue", "other"])
        .default("other"),
    status: z
        .enum(["draft", "pending_clearance", "cleared", "active", "expired", "revoked", "disputed"])
        .default("draft"),
    licensor: optionalString.pipe(z.string().max(200)),
    project_id: optionalUuid,
    territory: optionalString.pipe(z.string().max(200)),
    usage_scope: optionalString.pipe(z.string().max(500)),
    fee: nonNegativeNumber.default(0),
    currency: z.string().length(3).default("USD"),
    effective_date: optionalDate,
    expiration_date: optionalDate,
    notes: optionalString,
});

export const rightsUpdateSchema = rightsCreateSchema.partial();
