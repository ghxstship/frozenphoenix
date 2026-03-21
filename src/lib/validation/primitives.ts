/* ═══════════════════════════════════════════════════════════════
   VALIDATION PRIMITIVES — Single Source of Truth
   
   Shared Zod primitives used by all entity schema files.
   Import from here instead of redeclaring locally.
   ═══════════════════════════════════════════════════════════════ */

import { z } from "zod";

export const nonEmptyString = z.string().min(1, "Required");
export const optionalString = z.string().optional().default("");
export const positiveNumber = z.number().positive("Must be greater than 0");
export const nonNegativeNumber = z.number().min(0, "Must be 0 or greater");
export const positiveInt = z.number().int().positive("Must be at least 1");
export const emailField = z.string().email("Invalid email address");
export const phoneField = z
    .string()
    .regex(/^[+]?[\d\s\-()]{7,20}$/, "Invalid phone number")
    .optional()
    .or(z.literal(""));
export const dateField = z.string().regex(/^\d{4}-\d{2}-\d{2}/, "Invalid date format");
export const optionalDate = z.string().optional().or(z.literal(""));
export const uuidField = z.string().uuid("Invalid ID");
export const optionalUuid = uuidField.optional().or(z.literal(""));
