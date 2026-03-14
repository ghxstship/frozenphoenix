/* ═══════════════════════════════════════════════════════════════
   EXTENDED ENTITY SCHEMAS — P1 Validation Coverage
   
   Zod validation schemas for entities that have create form configs
   but were missing validation schemas in the registry.
   ═══════════════════════════════════════════════════════════════ */

import { z } from "zod";

// ─── Shared Primitives ───────────────────────────────────────
const nonEmptyString = z.string().min(1, "Required");
const optionalString = z.string().optional().default("");
const nonNegativeNumber = z.number().min(0, "Must be 0 or greater");
const positiveNumber = z.number().positive("Must be greater than 0");
const dateField = z.string().regex(/^\d{4}-\d{2}-\d{2}/, "Invalid date format");
const optionalDate = z.string().optional().or(z.literal(""));
const uuidField = z.string().uuid("Invalid ID");
const optionalUuid = uuidField.optional().or(z.literal(""));
const emailField = z.string().email("Invalid email address");

// ─── Events ─────────────────────────────────────────────────

export const eventCreateSchema = z.object({
    name: nonEmptyString.max(300),
    description: optionalString,
    start_date: dateField,
    end_date: dateField,
    location: optionalString.pipe(z.string().max(300)),
    status: z
        .enum([
            "draft",
            "planning",
            "confirmed",
            "in_progress",
            "completed",
            "cancelled",
            "postponed",
        ])
        .default("draft"),
});

export const eventUpdateSchema = eventCreateSchema.partial();

// ─── Activations ────────────────────────────────────────────

export const activationCreateSchema = z.object({
    name: nonEmptyString.max(300),
    type: z
        .enum(["booth", "stage", "installation", "pop_up", "mobile", "digital", "hybrid"])
        .default("booth"),
    status: z
        .enum(["planning", "design", "build", "installed", "active", "struck", "stored"])
        .default("planning"),
    project_id: uuidField,
    budget: nonNegativeNumber.optional(),
    description: optionalString,
});

export const activationUpdateSchema = activationCreateSchema.partial();

// ─── Leads ──────────────────────────────────────────────────

export const leadCreateSchema = z.object({
    first_name: nonEmptyString.max(100),
    last_name: optionalString.pipe(z.string().max(100)),
    email: emailField.optional().or(z.literal("")),
    company: optionalString.pipe(z.string().max(200)),
    phone: optionalString.pipe(z.string().max(30)),
    source: z
        .enum(["website", "referral", "cold_outreach", "event", "social", "partner", "other"])
        .default("website"),
    status: z.enum(["new", "contacted", "qualified", "unqualified", "converted"]).default("new"),
});

export const leadUpdateSchema = leadCreateSchema.partial();

// ─── Companies ──────────────────────────────────────────────

export const companyCreateSchema = z.object({
    name: nonEmptyString.max(200),
    type: z.enum(["client", "brand", "agency", "partner", "venue", "other"]).default("client"),
    industry: optionalString.pipe(z.string().max(200)),
    website: optionalString.pipe(z.string().max(500)),
    phone: optionalString.pipe(z.string().max(30)),
    email: emailField.optional().or(z.literal("")),
    notes: optionalString,
});

export const companyUpdateSchema = companyCreateSchema.partial();

// ─── Contacts ───────────────────────────────────────────────

export const contactCreateSchema = z.object({
    first_name: nonEmptyString.max(100),
    last_name: optionalString.pipe(z.string().max(100)),
    email: emailField.optional().or(z.literal("")),
    phone: optionalString.pipe(z.string().max(30)),
    title: optionalString.pipe(z.string().max(200)),
    company_id: optionalUuid,
    notes: optionalString,
});

export const contactUpdateSchema = contactCreateSchema.partial();

// ─── Purchase Requisitions ──────────────────────────────────

export const purchaseRequisitionCreateSchema = z.object({
    title: nonEmptyString.max(300),
    description: optionalString,
    vendor: optionalString.pipe(z.string().max(200)),
    amount: nonNegativeNumber.default(0),
    status: z
        .enum(["draft", "submitted", "approved", "ordered", "rejected", "cancelled"])
        .default("draft"),
    priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
    needed_by: optionalDate,
    project_id: optionalUuid,
});

export const purchaseRequisitionUpdateSchema = purchaseRequisitionCreateSchema.partial();

// ─── Briefs ─────────────────────────────────────────────────

export const briefCreateSchema = z.object({
    title: nonEmptyString.max(300),
    type: z.enum(["creative", "production", "event", "campaign", "general"]).default("creative"),
    status: z.enum(["draft", "in_review", "approved", "active", "archived"]).default("draft"),
    description: optionalString,
    project_id: optionalUuid,
    due_date: optionalDate,
});

export const briefUpdateSchema = briefCreateSchema.partial();

// ─── Campaigns ──────────────────────────────────────────────

export const campaignCreateSchema = z.object({
    name: nonEmptyString.max(300),
    status: z
        .enum([
            "planning",
            "brief_approved",
            "in_production",
            "review",
            "approved",
            "launching",
            "live",
            "optimizing",
            "completed",
            "archived",
        ])
        .default("planning"),
    start_date: optionalDate,
    end_date: optionalDate,
    total_budget: nonNegativeNumber.optional(),
    description: optionalString,
    objective: optionalString,
    target_audience: optionalString,
});

export const campaignUpdateSchema = campaignCreateSchema.partial();

// ─── Proposals ──────────────────────────────────────────────

export const proposalCreateSchema = z.object({
    title: nonEmptyString.max(300),
    number: nonEmptyString.max(50),
    status: z
        .enum(["draft", "in_review", "sent", "accepted", "declined", "expired"])
        .default("draft"),
    subtotal: nonNegativeNumber.default(0),
    total: nonNegativeNumber.default(0),
    valid_until: optionalDate,
    description: optionalString,
    project_id: optionalUuid,
});

export const proposalUpdateSchema = proposalCreateSchema.partial();

// ─── Worker Profiles (Workforce) ────────────────────────────

export const workerProfileCreateSchema = z.object({
    first_name: nonEmptyString.max(100),
    last_name: nonEmptyString.max(100),
    email: emailField,
    phone: optionalString.pipe(z.string().max(30)),
    primary_role: optionalString.pipe(z.string().max(200)),
    lifecycle_status: z
        .enum(["active", "on_leave", "inactive", "onboarding", "offboarding", "terminated"])
        .default("active"),
});

export const workerProfileUpdateSchema = workerProfileCreateSchema.partial();

// ─── Brand Guidelines ───────────────────────────────────────

export const brandGuidelineCreateSchema = z.object({
    title: nonEmptyString.max(300),
    version: optionalString.pipe(z.string().max(20)),
    status: z.enum(["draft", "published", "archived"]).default("draft"),
    description: optionalString,
});

export const brandGuidelineUpdateSchema = brandGuidelineCreateSchema.partial();

// ─── Brand Kits ─────────────────────────────────────────────

export const brandKitCreateSchema = z.object({
    name: nonEmptyString.max(200),
    primary_color: nonEmptyString.max(7),
    secondary_color: optionalString.pipe(z.string().max(7)),
    accent_color: optionalString.pipe(z.string().max(7)),
    font_family: optionalString.pipe(z.string().max(100)),
    description: optionalString,
});

export const brandKitUpdateSchema = brandKitCreateSchema.partial();

// ─── Decks ──────────────────────────────────────────────────

export const deckCreateSchema = z.object({
    title: nonEmptyString.max(300),
    type: z.enum(["pitch", "progress", "wrap", "strategy", "creative", "other"]).default("pitch"),
    status: z.enum(["draft", "ready", "presented", "archived"]).default("draft"),
    description: optionalString,
    project_id: optionalUuid,
});

export const deckUpdateSchema = deckCreateSchema.partial();

// ─── Tech Sheets ────────────────────────────────────────────

export const techSheetCreateSchema = z.object({
    title: nonEmptyString.max(300),
    category: z
        .enum(["av", "lighting", "staging", "power", "rigging", "network", "other"])
        .default("av"),
    venue: optionalString.pipe(z.string().max(200)),
    description: nonEmptyString.max(5000),
});

export const techSheetUpdateSchema = techSheetCreateSchema.partial();

// ─── Certifications ────────────────────────────────────────

export const certificationCreateSchema = z.object({
    name: nonEmptyString.max(200),
    issuing_body: nonEmptyString.max(200),
    issue_date: dateField,
    expiry_date: optionalDate,
    status: z.enum(["active", "expired", "pending"]).default("active"),
    notes: optionalString,
});

export const certificationUpdateSchema = certificationCreateSchema.partial();

// ─── Compliance Checklists ──────────────────────────────────

export const complianceChecklistCreateSchema = z.object({
    title: nonEmptyString.max(300),
    type: z
        .enum([
            "ada",
            "osha",
            "fire_safety",
            "health_safety",
            "noise",
            "environmental",
            "electrical_safety",
            "crowd_management",
            "food_safety",
            "alcohol_service",
            "general",
        ])
        .default("general"),
    due_date: optionalDate,
    description: optionalString,
    project_id: optionalUuid,
});

export const complianceChecklistUpdateSchema = complianceChecklistCreateSchema.partial();

// ─── Insurance Policies ────────────────────────────────────

export const insurancePolicyCreateSchema = z.object({
    policy_number: nonEmptyString.max(100),
    provider: nonEmptyString.max(200),
    type: z
        .enum([
            "general_liability",
            "workers_comp",
            "property",
            "professional_liability",
            "event_cancellation",
            "auto",
            "umbrella",
        ])
        .default("general_liability"),
    coverage_amount: positiveNumber,
    start_date: dateField,
    end_date: dateField,
    premium: nonNegativeNumber.optional(),
});

export const insurancePolicyUpdateSchema = insurancePolicyCreateSchema.partial();

// ─── Permits ────────────────────────────────────────────────

export const permitCreateSchema = z.object({
    name: nonEmptyString.max(200),
    type: z
        .enum(["event", "building", "noise", "fire", "health", "alcohol", "other"])
        .default("event"),
    issuing_authority: optionalString.pipe(z.string().max(200)),
    issue_date: optionalDate,
    expiry_date: optionalDate,
    notes: optionalString,
});

export const permitUpdateSchema = permitCreateSchema.partial();

// ─── Locations ──────────────────────────────────────────────

export const locationCreateSchema = z.object({
    name: nonEmptyString.max(200),
    type: z.enum(["venue", "studio", "warehouse", "office", "outdoor", "other"]).default("venue"),
    capacity: z.number().int().min(0).optional(),
    address: optionalString.pipe(z.string().max(500)),
    notes: optionalString,
});

export const locationUpdateSchema = locationCreateSchema.partial();

// ─── Client Invoices ────────────────────────────────────────

export const clientInvoiceCreateSchema = z.object({
    invoice_number: nonEmptyString.max(50),
    project_id: uuidField,
    subtotal: nonNegativeNumber,
    total: nonNegativeNumber,
    invoice_date: dateField,
    due_date: dateField,
    status: z
        .enum([
            "draft",
            "pending_approval",
            "approved",
            "sent",
            "viewed",
            "partial",
            "paid",
            "overdue",
            "disputed",
            "void",
            "credited",
        ])
        .default("draft"),
    notes: optionalString,
});

export const clientInvoiceUpdateSchema = clientInvoiceCreateSchema.partial();

// ─── Recurring Invoices ─────────────────────────────────────

export const recurringInvoiceCreateSchema = z.object({
    description: optionalString,
    company_id: uuidField,
    amount: positiveNumber,
    frequency: z
        .enum(["weekly", "biweekly", "monthly", "quarterly", "annually"])
        .default("monthly"),
    start_date: dateField,
    end_date: optionalDate,
});

export const recurringInvoiceUpdateSchema = recurringInvoiceCreateSchema.partial();

// ─── Dispatches ─────────────────────────────────────────────

export const dispatchCreateSchema = z.object({
    reference: nonEmptyString.max(100),
    origin: nonEmptyString.max(300),
    destination: nonEmptyString.max(300),
    dispatch_date: dateField,
    priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
    notes: optionalString,
});

export const dispatchUpdateSchema = dispatchCreateSchema.partial();

// ─── Vendor Reviews ─────────────────────────────────────────

export const vendorReviewCreateSchema = z.object({
    vendor_name: nonEmptyString.max(200),
    overall_score: z.number().int().min(1).max(5),
    review_date: dateField,
    category: z
        .enum(["quality", "timeliness", "communication", "value", "overall"])
        .default("overall"),
    comments: nonEmptyString.max(5000),
});

export const vendorReviewUpdateSchema = vendorReviewCreateSchema.partial();

// ─── Automations ────────────────────────────────────────────

export const automationCreateSchema = z.object({
    name: nonEmptyString.max(200),
    description: optionalString,
    entity_type: z.enum(["project", "task", "deal", "invoice", "event"]).default("task"),
});

export const automationUpdateSchema = automationCreateSchema.partial();

// ─── Call Sheets ────────────────────────────────────────────

export const callSheetCreateSchema = z.object({
    title: nonEmptyString.max(300),
    date: dateField,
    venue_name: optionalString.pipe(z.string().max(200)),
    venue_address: optionalString.pipe(z.string().max(500)),
    special_instructions: optionalString,
    project_id: optionalUuid,
});

export const callSheetUpdateSchema = callSheetCreateSchema.partial();

// ─── Case Studies ───────────────────────────────────────────

export const caseStudyCreateSchema = z.object({
    title: nonEmptyString.max(300),
    client: nonEmptyString.max(200),
    summary: nonEmptyString.max(5000),
    project_id: optionalUuid,
});

export const caseStudyUpdateSchema = caseStudyCreateSchema.partial();

// ─── Checklists ─────────────────────────────────────────────

export const checklistCreateSchema = z.object({
    title: nonEmptyString.max(300),
    description: optionalString,
    type: z.enum(["custom", "safety", "quality", "setup", "teardown"]).default("custom"),
});

export const checklistUpdateSchema = checklistCreateSchema.partial();

// ─── Contract Clauses ───────────────────────────────────────

export const clauseCreateSchema = z.object({
    description: nonEmptyString.max(10000),
    clause_reference: optionalString.pipe(z.string().max(50)),
    party: z.enum(["client", "vendor", "company", "both"]).default("company"),
});

export const clauseUpdateSchema = clauseCreateSchema.partial();

// ─── Credentials ────────────────────────────────────────────

export const credentialCreateSchema = z.object({
    name: nonEmptyString.max(200),
    description: optionalString,
});

export const credentialUpdateSchema = credentialCreateSchema.partial();

// ─── Credit Notes ───────────────────────────────────────────

export const creditNoteCreateSchema = z.object({
    number: nonEmptyString.max(50),
    amount: nonNegativeNumber,
    reason: nonEmptyString.max(5000),
});

export const creditNoteUpdateSchema = creditNoteCreateSchema.partial();

// ─── Accounts ───────────────────────────────────────────────

export const accountCreateSchema = z.object({
    name: nonEmptyString.max(200),
    type: z.enum(["client", "partner", "vendor", "internal", "other"]).default("client"),
    industry: optionalString.pipe(z.string().max(200)),
    website: optionalString.pipe(z.string().max(500)),
    phone: optionalString.pipe(z.string().max(30)),
    notes: optionalString,
});

export const accountUpdateSchema = accountCreateSchema.partial();

// ─── Persons ────────────────────────────────────────────────

export const personCreateSchema = z.object({
    first_name: nonEmptyString.max(100),
    last_name: optionalString.pipe(z.string().max(100)),
    email: emailField.optional().or(z.literal("")),
    phone: optionalString.pipe(z.string().max(30)),
    department: optionalString.pipe(z.string().max(200)),
    notes: optionalString,
});

export const personUpdateSchema = personCreateSchema.partial();
