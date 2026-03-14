import { z } from "zod";

// ─── Shared Primitives ───
const uuidField = z.string().uuid("Invalid ID");
const optionalUuid = z
    .string()
    .uuid("Invalid ID")
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined);
const nonEmptyString = z.string().min(1, "Required");
const optionalString = z.string().optional().default("");
const optionalDate = z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined);
const nonNegativeNumber = z.number().min(0, "Must be 0 or greater");
const positiveInt = z.number().int().positive("Must be at least 1");

// ─── Enums ───
const advanceTypeEnum = z.enum(["pre_event", "load_in", "show_day", "strike", "post_event"]);
const advanceStatusEnum = z.enum([
    "draft",
    "submitted",
    "in_review",
    "approved",
    "in_progress",
    "fulfilled",
    "completed",
    "cancelled",
]);
const advancePriorityEnum = z.enum(["low", "medium", "high", "urgent", "critical"]);
const advanceItemStatusEnum = z.enum([
    "pending",
    "confirmed",
    "in_transit",
    "delivered",
    "installed",
    "operational",
    "struck",
    "returned",
    "complete",
]);
const priceAdjustmentTypeEnum = z.enum(["flat", "percentage", "per_unit"]);

// ─── Selected Modifier ───
const selectedModifierSchema = z.object({
    modifier_id: uuidField,
    modifier_name: z.string(),
    option_id: uuidField,
    option_label: z.string(),
    option_value: z.string(),
    price_adjustment: z.number().default(0),
    adjustment_type: priceAdjustmentTypeEnum.default("flat"),
});

// ─── Advance Item (for create) ───
export const createAdvanceItemSchema = z.object({
    catalog_item_id: uuidField,
    category_id: optionalUuid,
    quantity_requested: positiveInt,
    unit_cost: nonNegativeNumber,
    selected_modifiers: z.array(selectedModifierSchema).optional().default([]),
    item_specifications: z.record(z.string(), z.unknown()).optional().default({}),
    vendor_id: optionalUuid,
    notes: optionalString,
    is_critical_path: z.boolean().optional().default(false),
    delivery_zone: optionalString,
    delivery_location: optionalString,
    location_id: optionalUuid,
    scheduled_delivery: optionalDate,
    start_date: optionalDate,
    end_date: optionalDate,
    operational_purpose: optionalString,
    special_requests: optionalString,
});

// ─── Create Advance ───
export const createAdvanceSchema = z.object({
    event_id: uuidField,
    project_id: optionalUuid,
    title: nonEmptyString.max(300),
    description: optionalString,
    advance_type: advanceTypeEnum.default("pre_event"),
    priority: advancePriorityEnum.default("medium"),
    service_start_date: optionalDate,
    service_end_date: optionalDate,
    internal_notes: optionalString,
    client_notes: optionalString,
    source_template_id: optionalUuid,
    items: z.array(createAdvanceItemSchema).min(0).default([]),
});

// ─── Update Advance ───
export const updateAdvanceSchema = z.object({
    title: nonEmptyString.max(300).optional(),
    description: z.string().optional(),
    advance_type: advanceTypeEnum.optional(),
    priority: advancePriorityEnum.optional(),
    service_start_date: optionalDate,
    service_end_date: optionalDate,
    point_of_contact: optionalUuid,
    internal_notes: z.string().optional(),
    client_notes: z.string().optional(),
});

// ─── Status Transition ───
export const advanceStatusTransitionSchema = z.object({
    status: advanceStatusEnum,
    reason: z.string().optional(),
});

export const advanceItemStatusTransitionSchema = z.object({
    status: advanceItemStatusEnum,
    reason: z.string().optional(),
    quantity_confirmed: z.number().int().min(0).optional(),
});

// ─── Update Advance Item ───
export const updateAdvanceItemSchema = z.object({
    quantity_requested: positiveInt.optional(),
    unit_cost: nonNegativeNumber.optional(),
    selected_modifiers: z.array(selectedModifierSchema).optional(),
    item_specifications: z.record(z.string(), z.unknown()).optional(),
    category_id: optionalUuid,
    vendor_id: optionalUuid,
    assigned_to: optionalUuid,
    notes: z.string().optional(),
    is_critical_path: z.boolean().optional(),
    delivery_zone: z.string().optional(),
    delivery_location: z.string().optional(),
    location_id: optionalUuid,
    scheduled_delivery: optionalDate,
    start_date: optionalDate,
    end_date: optionalDate,
    operational_purpose: z.string().optional(),
    special_requests: z.string().optional(),
});

// ─── Advance Template ───
export const createAdvanceTemplateSchema = z.object({
    name: nonEmptyString.max(200),
    description: optionalString,
    advance_type: advanceTypeEnum.default("pre_event"),
    template_items: z
        .array(
            z.object({
                catalog_item_id: uuidField,
                quantity: positiveInt,
                selected_modifiers: z.array(selectedModifierSchema).optional(),
                notes: z.string().optional(),
                is_critical_path: z.boolean().optional(),
            })
        )
        .min(1, "At least one template item required"),
    is_public: z.boolean().default(false),
    tags: z.array(z.string()).optional().default([]),
});

export const updateAdvanceTemplateSchema = createAdvanceTemplateSchema.partial();

// ─── Catalog Search ───
export const catalogSearchSchema = z.object({
    q: z.string().min(2, "Search query must be at least 2 characters"),
    limit: z.coerce.number().int().min(1).max(100).default(50),
});
