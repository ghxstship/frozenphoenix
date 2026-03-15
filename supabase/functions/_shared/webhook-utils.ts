/**
 * Shared webhook utilities for Supabase Edge Functions.
 * Handles HMAC validation, deduplication, and common response helpers.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WebhookValidationResult {
    valid: boolean;
    error?: string;
}

export interface WebhookContext {
    supabase: ReturnType<typeof createClient>;
    connectionId: string;
    providerName: string;
}

// ---------------------------------------------------------------------------
// HMAC Signature Validation
// ---------------------------------------------------------------------------

export async function validateHmacSignature(
    payload: string,
    signature: string,
    secret: string,
    algorithm: "sha256" | "sha1" = "sha256",
): Promise<WebhookValidationResult> {
    if (!signature || !secret) {
        return { valid: false, error: "Missing signature or secret" };
    }

    try {
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode(secret),
            { name: "HMAC", hash: `SHA-${algorithm === "sha256" ? "256" : "1"}` },
            false,
            ["sign"],
        );
        const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
        const computed = new Uint8Array(sig);

        // Strip prefix like "sha256=" if present
        const cleanSig = signature.replace(/^sha\d+=/, "");

        // Decode hex signature to bytes for constant-time comparison
        const expectedBytes = new Uint8Array(cleanSig.length / 2);
        for (let i = 0; i < expectedBytes.length; i++) {
            expectedBytes[i] = parseInt(cleanSig.slice(i * 2, i * 2 + 2), 16);
        }

        // Constant-time comparison to prevent timing attacks
        if (computed.length !== expectedBytes.length) {
            return { valid: false, error: "Signature mismatch" };
        }
        let diff = 0;
        for (let i = 0; i < computed.length; i++) {
            diff |= computed[i]! ^ expectedBytes[i]!;
        }
        if (diff !== 0) {
            return { valid: false, error: "Signature mismatch" };
        }
        return { valid: true };
    } catch (err) {
        return { valid: false, error: `HMAC validation error: ${(err as Error).message}` };
    }
}

// ---------------------------------------------------------------------------
// Deduplication via payload_hash
// ---------------------------------------------------------------------------

export async function computePayloadHash(payload: string): Promise<string> {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(payload));
    return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

export async function isDuplicate(
    supabase: ReturnType<typeof createClient>,
    payloadHash: string,
    providerName: string,
): Promise<boolean> {
    const { data } = await supabase
        .from("webhook_events")
        .select("id")
        .eq("payload_hash", payloadHash)
        .eq("provider_name", providerName)
        .eq("status", "processed")
        .limit(1)
        .single();

    return !!data;
}

// ---------------------------------------------------------------------------
// Webhook Event Logging
// ---------------------------------------------------------------------------

export async function logWebhookEvent(
    supabase: ReturnType<typeof createClient>,
    params: {
        connectionId: string;
        providerName: string;
        eventType: string;
        payloadHash: string;
        rawPayload: Record<string, unknown>;
        status: "pending" | "processed" | "failed" | "duplicate";
        errorMessage?: string;
        processedAt?: string;
    },
): Promise<string | null> {
    const { data, error } = await supabase
        .from("webhook_events")
        .insert({
            connection_id: params.connectionId,
            provider_name: params.providerName,
            event_type: params.eventType,
            payload_hash: params.payloadHash,
            raw_payload: params.rawPayload,
            status: params.status,
            error_message: params.errorMessage ?? null,
            processed_at: params.processedAt ?? null,
        })
        .select("id")
        .single();

    if (error) {
        console.error("Failed to log webhook event:", error.message);
        return null;
    }
    return data?.id ?? null;
}

export async function updateWebhookEventStatus(
    supabase: ReturnType<typeof createClient>,
    eventId: string,
    status: "processed" | "failed",
    errorMessage?: string,
): Promise<void> {
    await supabase
        .from("webhook_events")
        .update({
            status,
            error_message: errorMessage ?? null,
            processed_at: new Date().toISOString(),
        })
        .eq("id", eventId);
}

// ---------------------------------------------------------------------------
// Supabase Client Factory
// ---------------------------------------------------------------------------

export function createServiceClient(): ReturnType<typeof createClient> {
    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    return createClient(url, key);
}

// ---------------------------------------------------------------------------
// Response Helpers
// ---------------------------------------------------------------------------

export function jsonResponse(body: Record<string, unknown>, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

export function errorResponse(message: string, status = 400): Response {
    return jsonResponse({ error: message }, status);
}
