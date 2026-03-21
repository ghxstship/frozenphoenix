import { z } from "zod";
import {
    dateField,
    emailField,
    nonEmptyString,
    nonNegativeNumber,
    optionalDate,
    optionalString,
    phoneField,
    positiveNumber,
    uuidField,
} from "./primitives";

// ─── Deals ───
export const dealCreateSchema = z.object({
    title: nonEmptyString.max(200),
    company_name: nonEmptyString.max(200),
    contact_name: optionalString.pipe(z.string().max(200)),
    contact_email: emailField.optional().or(z.literal("")),
    value: nonNegativeNumber,
    probability: z.number().min(0).max(100).default(50),
    stage: z
        .enum(["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"])
        .default("lead"),
    expected_close_date: optionalDate,
    notes: optionalString,
});

export const dealUpdateSchema = dealCreateSchema.partial().extend({
    id: uuidField,
});

// ─── Projects ───
export const projectCreateSchema = z.object({
    name: nonEmptyString.max(200),
    description: optionalString,
    status: z
        .enum([
            "draft",
            "active",
            "on_hold",
            "completed",
            "cancelled",
            "archived",
            "pre_production",
            "in_production",
            "post_production",
            "wrap",
        ])
        .default("draft"),
    phase: z
        .enum([
            "concept",
            "pre_production",
            "production",
            "post_production",
            "wrap",
            "closed",
            "discovery",
            "planning",
            "execution",
            "review",
        ])
        .default("concept"),
    start_date: optionalDate,
    end_date: optionalDate,
    budget_planned: nonNegativeNumber.default(0),
    client_name: optionalString,
});

export const projectUpdateSchema = projectCreateSchema.partial().extend({
    id: uuidField,
});

// ─── Tasks ───
export const taskCreateSchema = z.object({
    title: nonEmptyString.max(300),
    description: optionalString,
    status: z
        .enum(["todo", "in_progress", "in_review", "done", "blocked", "cancelled", "backlog"])
        .default("todo"),
    priority: z.enum(["low", "medium", "high", "urgent", "critical"]).default("medium"),
    phase: z
        .enum([
            "pre_production",
            "production",
            "post_production",
            "wrap",
            "concept",
            "planning",
            "execution",
            "review",
        ])
        .default("pre_production"),
    project_id: uuidField.optional(),
    assigned_to: uuidField.optional(),
    due_date: optionalDate,
});

export const taskUpdateSchema = taskCreateSchema.partial().extend({
    id: uuidField,
});

// ─── Crew Members ───
export const crewCreateSchema = z.object({
    name: nonEmptyString.max(200),
    email: emailField,
    phone: phoneField,
    role: nonEmptyString.max(100),
    department: optionalString,
    status: z.enum(["available", "on_project", "unavailable", "on_leave"]).default("available"),
    hourly_rate: nonNegativeNumber.optional(),
    day_rate: nonNegativeNumber.optional(),
});

export const crewUpdateSchema = crewCreateSchema.partial().extend({
    id: uuidField,
});

// ─── Assets ───
export const assetCreateSchema = z.object({
    name: nonEmptyString.max(200),
    barcode: optionalString,
    category: nonEmptyString.max(100),
    condition: z.enum(["new", "good", "fair", "poor", "damaged", "decommissioned"]).default("good"),
    owned_or_rental: z.enum(["owned", "rental"]).default("owned"),
    location: optionalString,
    purchase_price: nonNegativeNumber.optional(),
    daily_rental_cost: nonNegativeNumber.optional(),
    notes: optionalString,
});

export const assetUpdateSchema = assetCreateSchema.partial().extend({
    id: uuidField,
});

// ─── Contracts ───
export const contractCreateSchema = z.object({
    title: nonEmptyString.max(300),
    contract_number: optionalString,
    type: z
        .enum(["msa", "sow", "nda", "vendor", "client", "amendment", "addendum", "other"])
        .default("msa"),
    status: z
        .enum([
            "draft",
            "pending_review",
            "pending_signature",
            "active",
            "expired",
            "terminated",
            "renewed",
        ])
        .default("draft"),
    value: nonNegativeNumber.default(0),
    effective_date: optionalDate,
    expiration_date: optionalDate,
    auto_renew: z.boolean().default(false),
    vendor_id: uuidField.optional(),
    project_id: uuidField.optional(),
    notes: optionalString,
});

export const contractUpdateSchema = contractCreateSchema.partial().extend({
    id: uuidField,
});

// ─── Vendors ───
export const vendorCreateSchema = z.object({
    name: nonEmptyString.max(200),
    category: optionalString,
    contact_name: optionalString,
    contact_email: emailField.optional().or(z.literal("")),
    contact_phone: phoneField,
    status: z.enum(["active", "inactive", "pending", "blocked"]).default("active"),
    rating: z.number().min(0).max(5).optional(),
    notes: optionalString,
});

export const vendorUpdateSchema = vendorCreateSchema.partial().extend({
    id: uuidField,
});

// ─── Invoices ───
export const invoiceCreateSchema = z.object({
    invoice_number: nonEmptyString,
    vendor_id: uuidField.optional(),
    project_id: uuidField.optional(),
    purchase_order_id: uuidField.optional(),
    amount: positiveNumber,
    currency: z.string().length(3).default("USD"),
    status: z.enum(["draft", "sent", "paid", "overdue", "cancelled", "void"]).default("draft"),
    due_date: dateField,
    notes: optionalString,
});

export const invoiceUpdateSchema = invoiceCreateSchema.partial().extend({
    id: uuidField,
});

// ─── Approvals ───
export const approvalCreateSchema = z.object({
    title: nonEmptyString.max(300),
    type: z
        .enum([
            "budget",
            "creative",
            "production",
            "vendor",
            "change_order",
            "milestone",
            "financial",
        ])
        .default("production"),
    project_id: uuidField.optional(),
    requested_by: uuidField.optional(),
    description: optionalString,
    priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
});

export const approvalUpdateSchema = z.object({
    id: uuidField,
    status: z.enum(["pending", "approved", "rejected", "deferred"]),
    approved_at: z.string().optional(),
    rejected_at: z.string().optional(),
    notes: optionalString,
});

// ─── Budgets ───
export const budgetCreateSchema = z.object({
    name: nonEmptyString.max(200),
    project_id: uuidField.optional(),
    total_amount: positiveNumber,
    currency: z.string().length(3).default("USD"),
    status: z.enum(["draft", "active", "closed", "over_budget"]).default("draft"),
    notes: optionalString,
});

// ─── Comments / Notes ───
export const commentCreateSchema = z.object({
    entity_type: nonEmptyString,
    entity_id: uuidField,
    content: nonEmptyString.max(5000),
});

// ─── Invitations ───
const orgInviteeSchema = z.object({
    email: emailField,
    role: z.enum(["exec", "director", "pm", "member", "client", "collaborator"]).default("member"),
});

const referralInviteeSchema = z.object({
    email: emailField,
});

export const invitationCreateSchema = z
    .object({
        invite_type: z.enum(["org_invite", "referral"]).default("org_invite"),
        invitees: z
            .array(orgInviteeSchema)
            .min(1, "At least one invitee is required")
            .max(50, "Maximum 50 invitations at once"),
        organization_id: uuidField.optional(),
        message: z.string().max(1000).optional(),
        referral_code: z.string().max(100).optional(),
    })
    .refine((data) => data.invite_type === "referral" || !!data.organization_id, {
        message: "Organization is required for org invites",
        path: ["organization_id"],
    });

export const referralInviteSchema = z.object({
    invite_type: z.literal("referral"),
    invitees: z
        .array(referralInviteeSchema)
        .min(1, "At least one invitee is required")
        .max(50, "Maximum 50 invitations at once"),
    message: z.string().max(1000).optional(),
    referral_code: z.string().max(100).optional(),
});

// ─── Organizations ───
export const organizationCreateSchema = z.object({
    name: z.string().min(2, "Organization name must be at least 2 characters").max(200),
    slug: z
        .string()
        .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
        .max(100)
        .optional(),
    industry: z.string().max(100).optional(),
    timezone: z.string().max(50).optional(),
    currency: z.string().length(3, "Currency must be a 3-letter code").optional(),
    role: z.enum(["exec", "director", "pm", "member"]).default("pm"),
});

// ─── Usernames ───
const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]*[a-z0-9]$/;
const USERNAME_NO_CONSECUTIVE = /(.)\1{2,}|\.{2}|--{1}|__{1}/;

export const usernameField = z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(40, "Username must be at most 40 characters")
    .transform((v) => v.toLowerCase().trim())
    .pipe(
        z
            .string()
            .regex(
                USERNAME_PATTERN,
                "Username must start and end with a letter or number, and can only contain letters, numbers, dots, hyphens, and underscores"
            )
            .refine(
                (v) => !USERNAME_NO_CONSECUTIVE.test(v),
                "Username cannot contain consecutive special characters"
            )
    );

export const usernameCheckSchema = z.object({
    username: usernameField,
});

export const usernameClaimSchema = z.object({
    username: usernameField,
});

export const usernameChangeSchema = z.object({
    username: usernameField,
});

export const profileVisibilitySchema = z.object({
    profile_visibility: z.enum(["public", "connections", "organization", "private"]),
});

export const userProfileUpdateSchema = z.object({
    display_name: z.string().min(1).max(200).optional(),
    headline: z.string().max(200).optional(),
    bio: z.string().max(2000).optional(),
    website_url: z.string().url("Invalid URL").max(500).optional().or(z.literal("")),
    linkedin_url: z.string().url("Invalid URL").max(500).optional().or(z.literal("")),
    location: z.string().max(200).optional(),
    profile_visibility: z.enum(["public", "connections", "organization", "private"]).optional(),
});

export const orgProfileUpdateSchema = z.object({
    tagline: z.string().max(300).optional(),
    description: z.string().max(5000).optional(),
    website_url: z.string().url("Invalid URL").max(500).optional().or(z.literal("")),
    linkedin_url: z.string().url("Invalid URL").max(500).optional().or(z.literal("")),
    location: z.string().max(200).optional(),
    employee_count_range: z
        .enum(["1-10", "11-50", "51-200", "201-500", "501-1000", "1001-5000", "5000+"])
        .optional(),
    profile_visibility: z.enum(["public", "connections", "private"]).optional(),
});

// ─── Organization Update (PATCH) ───
export const organizationUpdateSchema = z.object({
    name: z.string().min(2).max(200).optional(),
    slug: z
        .string()
        .regex(/^[a-z0-9-]+$/)
        .max(100)
        .optional(),
    industry: z.string().max(100).optional(),
    timezone: z.string().max(50).optional(),
    currency: z.string().length(3).optional(),
    logo_url: z.string().url().max(500).optional().or(z.literal("")).or(z.null()),
    website_url: z.string().url().max(500).optional().or(z.literal("")).or(z.null()),
});

// ─── Organization Security ───
export const orgSecurityUpdateSchema = z.object({
    require_mfa: z.boolean().optional(),
    enforce_sso: z.boolean().optional(),
    sso_domain: z.string().max(255).optional().or(z.literal("")).or(z.null()),
    allowed_email_domains: z.array(z.string().max(255)).optional(),
    session_timeout_hours: z.number().int().min(1).max(8760).optional(),
    max_sessions_per_user: z.number().int().min(1).max(50).optional(),
    invitation_expiry_days: z.number().int().min(1).max(90).optional(),
    default_role: z.enum(["exec", "pm", "client", "vendor"]).optional(),
});

// ─── Settings Change Requests ───
export const settingsChangeRequestCreateSchema = z.object({
    organization_id: uuidField,
    setting_key: nonEmptyString.max(200),
    scope_type: z.string().max(50).optional().default("organization"),
    scope_id: uuidField.optional().or(z.null()),
    current_value: z.unknown().optional(),
    proposed_value: z.unknown(),
    reason: z.string().max(2000).optional().or(z.null()),
});

export const settingsChangeRequestReviewSchema = z.object({
    action: z.enum(["approved", "rejected"]),
    comment: z.string().max(2000).optional().or(z.null()),
});

// ─── Integration Connections ───
export const integrationConnectionCreateSchema = z.object({
    provider_type: nonEmptyString.max(100),
    display_name: nonEmptyString.max(200),
    event_id: uuidField.optional().or(z.null()),
    api_key: z.string().max(500).optional().or(z.null()),
    api_secret: z.string().max(500).optional().or(z.null()),
    webhook_secret: z.string().max(500).optional().or(z.null()),
    sync_direction: z.enum(["inbound", "outbound", "bidirectional"]).optional().default("inbound"),
});

// ─── CSV Export / Import ───
export const csvExportSchema = z.object({
    entity: nonEmptyString.max(100),
    filters: z.record(z.string(), z.unknown()).optional(),
    limit: z.number().int().positive().max(10_000).optional(),
    preview: z.boolean().optional().default(false),
    columns: z.array(z.string().max(100)).optional(),
});

export const csvImportSchema = z.object({
    entity: nonEmptyString.max(100),
    rows: z.array(z.record(z.string(), z.unknown())).min(1).max(5_000),
});

// ─── Automation Execute ───
export const automationExecuteSchema = z.object({
    trigger_type: nonEmptyString.max(100),
    entity_type: nonEmptyString.max(100),
    record: z.record(z.string(), z.unknown()),
});

// ─── Notification Dispatch ───
export const notificationDispatchByIdSchema = z.object({
    notification_id: uuidField,
});

export const notificationDispatchCreateSchema = z.object({
    user_id: uuidField,
    title: nonEmptyString.max(500),
    body: z.string().max(5000).optional(),
    type: z.string().max(50).optional().default("info"),
    entity_type: z.string().max(100).optional(),
    entity_id: uuidField.optional(),
    action_url: z.string().url().max(1000).optional().or(z.null()),
    organization_id: uuidField.optional(),
});

// ─── Asset QR Batch ───
export const assetQrBatchSchema = z.object({
    asset_ids: z.array(uuidField).min(1).max(100),
    size: z.number().int().min(64).max(1024).optional().default(256),
});

// ─── Asset Scan ───
export const assetScanSchema = z.object({
    identifier: nonEmptyString.max(500),
    identifier_type: z.enum(["barcode", "rfid", "nfc", "auto"]).optional().default("auto"),
    scan_action: z.enum([
        "check_in",
        "check_out",
        "transfer",
        "verify",
        "count",
        "damage",
        "audit",
        "receive",
        "ship",
    ]),
    scan_method: z.string().max(50).optional().default("keyboard"),
    location_id: uuidField.optional(),
    notes: z.string().max(2000).optional(),
});

// ─── Asset NFC ───
export const assetNfcRegisterSchema = z.object({
    nfc_serial: nonEmptyString.max(200),
});

// ─── Credential Scan ───
export const credentialScanSchema = z
    .object({
        identifier: z.string().max(500).optional(),
        barcode_value: z.string().max(500).optional(),
        identifier_type: z.enum(["barcode", "rfid", "nfc", "auto"]).optional().default("auto"),
        scan_method: z.string().max(50).optional().default("keyboard"),
        scan_type: nonEmptyString.max(50),
        zone_id: uuidField.optional(),
        device_id: z.string().max(200).optional(),
        latitude: z.number().min(-90).max(90).optional(),
        longitude: z.number().min(-180).max(180).optional(),
        notes: z.string().max(2000).optional(),
    })
    .refine((d) => !!(d.identifier || d.barcode_value), {
        message: "identifier or barcode_value is required",
        path: ["identifier"],
    });

// ─── Credential Bulk Import ───
export const credentialBulkImportSchema = z.object({
    entity_type: nonEmptyString.max(100),
    target_pool_id: uuidField.optional(),
    file_name: nonEmptyString.max(500),
    file_size_bytes: z.number().int().nonnegative().optional(),
    rows: z.array(z.record(z.string(), z.unknown())).min(1).max(10_000),
});

// ─── Credential Assign ───
export const credentialAssignSchema = z.object({
    pool_id: uuidField,
    credential_type_id: uuidField,
    assignee_name: nonEmptyString.max(200),
    assignee_email: emailField.optional().or(z.literal("")),
    profile_id: uuidField.optional(),
    crew_member_id: uuidField.optional(),
    vip_guest_id: uuidField.optional(),
    vendor_id: uuidField.optional(),
    zone_access: z.array(z.string().max(200)).optional().default([]),
    valid_from: optionalDate,
    valid_until: optionalDate,
    notes: z.string().max(2000).optional(),
});

// ─── Credential Export ───
export const credentialExportSchema = z.object({
    entity_type: z.enum(["credential_assignments", "credential_scan_log", "pos_transactions"]),
    template_id: uuidField.optional(),
    format: z.enum(["csv", "json", "xlsx", "pdf"]),
    filters: z
        .object({
            event_id: uuidField.optional(),
            pool_id: uuidField.optional(),
            status: z.string().max(50).optional(),
            date_from: z.string().max(30).optional(),
            date_to: z.string().max(30).optional(),
        })
        .optional(),
});

// ─── Event Channels ───
export const eventChannelCreateSchema = z.object({
    template_id: uuidField.optional(),
});

// ─── Auth Reset Password ───
export const resetPasswordSchema = z.object({
    email: emailField,
});

// ─── Validation helper ───
export type ValidationResult<T> =
    | { success: true; data: T }
    | { success: false; errors: Record<string, string[]> };

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    const errors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
        const path = issue.path.join(".");
        if (!errors[path]) errors[path] = [];
        errors[path].push(issue.message);
    }
    return { success: false, errors };
}
