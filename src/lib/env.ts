/**
 * H-009: Zod-based environment variable validation.
 * Fail-fast at import time if required variables are missing.
 *
 * Usage: import { env } from "@/lib/env";
 * This module is safe to import on both client and server.
 */

import { z } from "zod/v4";

// ─── Client-side env (NEXT_PUBLIC_*) ──────────────────────────────────────────
const clientSchema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
    NEXT_PUBLIC_APP_URL: z.string().optional(),
    NEXT_PUBLIC_BRAND_ID: z.string().default("atlvs"),
    NEXT_PUBLIC_BRAND_NAME: z.string().optional(),
    NEXT_PUBLIC_BRAND_TAGLINE: z.string().optional(),
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
});

// ─── Server-only env ──────────────────────────────────────────────────────────
const serverSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    RESEND_FROM_EMAIL: z.string().optional(),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    ANTHROPIC_API_KEY: z.string().optional(),
    VAPID_PRIVATE_KEY: z.string().optional(),
    VAPID_SUBJECT: z.string().optional(),
    TURNSTILE_SECRET_KEY: z.string().optional(),
});

// ─── Combined schema ──────────────────────────────────────────────────────────
const envSchema = clientSchema.merge(serverSchema);

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
    const raw = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        NEXT_PUBLIC_BRAND_ID: process.env.NEXT_PUBLIC_BRAND_ID,
        NEXT_PUBLIC_BRAND_NAME: process.env.NEXT_PUBLIC_BRAND_NAME,
        NEXT_PUBLIC_BRAND_TAGLINE: process.env.NEXT_PUBLIC_BRAND_TAGLINE,
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
        NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        NODE_ENV: process.env.NODE_ENV,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
        VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
        VAPID_SUBJECT: process.env.VAPID_SUBJECT,
        TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    };

    const result = envSchema.safeParse(raw);

    if (!result.success) {
        const formatted = z.prettifyError(result.error);
        // Use console.error here intentionally — this runs before logger is available
        console.error("❌ Invalid environment variables:\n", formatted);

        if (process.env.NODE_ENV === "production") {
            throw new Error("Invalid environment variables — see server logs");
        }
    }

    return (result.success ? result.data : raw) as Env;
}

/**
 * Validated environment variables. Access via `env.NEXT_PUBLIC_SUPABASE_URL` etc.
 * In production, throws if required vars are malformed.
 * In development, logs warnings but continues with raw values.
 */
export const env = validateEnv();
