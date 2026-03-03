import { z } from "zod";

// ─── Shared Primitives ───
const nonEmptyString = z.string().min(1, "Required");
const optionalString = z.string().optional().default("");
const positiveNumber = z.number().positive("Must be greater than 0");
const nonNegativeNumber = z.number().min(0, "Must be 0 or greater");
const emailField = z.string().email("Invalid email address");
const phoneField = z
    .string()
    .regex(/^[+]?[\d\s\-()]{7,20}$/, "Invalid phone number")
    .optional()
    .or(z.literal(""));
const dateField = z.string().regex(/^\d{4}-\d{2}-\d{2}/, "Invalid date format");
const optionalDate = z.string().optional().or(z.literal(""));
const uuidField = z.string().uuid("Invalid ID");

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
const inviteeSchema = z.object({
    email: emailField,
    role: z.enum(["exec", "director", "pm", "member", "client", "collaborator"]).default("member"),
});

export const invitationCreateSchema = z.object({
    invitees: z
        .array(inviteeSchema)
        .min(1, "At least one invitee is required")
        .max(50, "Maximum 50 invitations at once"),
    organization_id: uuidField,
    message: z.string().max(1000).optional(),
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
