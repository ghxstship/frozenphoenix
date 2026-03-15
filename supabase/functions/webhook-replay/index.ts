/**
 * H-017: Webhook Replay Edge Function
 *
 * Allows administrators to replay failed webhook events by re-fetching the
 * stored raw payload from `webhook_events` and re-dispatching it to the
 * appropriate webhook handler function.
 *
 * Endpoints:
 *   POST /webhook-replay  { event_id: string }
 *   GET  /webhook-replay?health=true  (health check)
 *
 * Security: Requires SUPABASE_SERVICE_ROLE_KEY — not exposed to public.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleHealthCheck } from "../_shared/health.ts";

const PROVIDER_FUNCTION_MAP: Record<string, string> = {
    eventbrite: "webhook-eventbrite",
    square: "webhook-square",
};

Deno.serve(async (req: Request) => {
    // Health check
    const healthResponse = await handleHealthCheck(req, "webhook-replay");
    if (healthResponse) return healthResponse;

    if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" },
        });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceKey) {
        return new Response(
            JSON.stringify({ error: "Missing Supabase configuration" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // ─── Auth: require service role or admin user ───────────────
    const authHeader = req.headers.get("authorization") ?? "";
    if (!authHeader.includes(serviceKey)) {
        // Fall back to user auth — check if user is exec/director
        const { data: { user } } = await supabase.auth.getUser(
            authHeader.replace("Bearer ", ""),
        );
        if (!user) {
            return new Response(
                JSON.stringify({ error: "Unauthorized" }),
                { status: 401, headers: { "Content-Type": "application/json" } },
            );
        }

        const { data: membership } = await supabase
            .from("org_memberships")
            .select("role")
            .eq("user_id", user.id)
            .limit(1)
            .single();

        if (!membership || !["exec", "director"].includes(membership.role)) {
            return new Response(
                JSON.stringify({ error: "Forbidden — admin role required" }),
                { status: 403, headers: { "Content-Type": "application/json" } },
            );
        }
    }

    // ─── Parse request ──────────────────────────────────────────
    let body: { event_id?: string };
    try {
        body = await req.json();
    } catch {
        return new Response(
            JSON.stringify({ error: "Invalid JSON body" }),
            { status: 400, headers: { "Content-Type": "application/json" } },
        );
    }

    if (!body.event_id) {
        return new Response(
            JSON.stringify({ error: "event_id is required" }),
            { status: 400, headers: { "Content-Type": "application/json" } },
        );
    }

    // ─── Fetch the failed event ─────────────────────────────────
    const { data: event, error: fetchError } = await supabase
        .from("webhook_events")
        .select("*")
        .eq("id", body.event_id)
        .single();

    if (fetchError || !event) {
        return new Response(
            JSON.stringify({ error: "Webhook event not found" }),
            { status: 404, headers: { "Content-Type": "application/json" } },
        );
    }

    if (event.status === "processed") {
        return new Response(
            JSON.stringify({ error: "Event already processed successfully", event_id: event.id }),
            { status: 409, headers: { "Content-Type": "application/json" } },
        );
    }

    // ─── Determine target function ──────────────────────────────
    const targetFunction = PROVIDER_FUNCTION_MAP[event.provider_name];
    if (!targetFunction) {
        return new Response(
            JSON.stringify({
                error: `No replay handler for provider "${event.provider_name}"`,
                supported_providers: Object.keys(PROVIDER_FUNCTION_MAP),
            }),
            { status: 422, headers: { "Content-Type": "application/json" } },
        );
    }

    // ─── Mark as pending replay ─────────────────────────────────
    await supabase
        .from("webhook_events")
        .update({
            status: "pending",
            error_message: `Replay initiated at ${new Date().toISOString()}`,
        })
        .eq("id", event.id);

    // ─── Invoke the target function with the stored payload ─────
    const targetUrl = `${supabaseUrl}/functions/v1/${targetFunction}`;

    try {
        const response = await fetch(targetUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${serviceKey}`,
                "X-Replay-Event-Id": event.id,
            },
            body: JSON.stringify(event.raw_payload),
        });

        const resultBody = await response.text();

        if (response.ok) {
            return new Response(
                JSON.stringify({
                    success: true,
                    event_id: event.id,
                    provider: event.provider_name,
                    replay_status: response.status,
                    message: "Event replayed successfully",
                }),
                { status: 200, headers: { "Content-Type": "application/json" } },
            );
        }

        // Replay failed — update event with new error
        await supabase
            .from("webhook_events")
            .update({
                status: "failed",
                error_message: `Replay failed (${response.status}): ${resultBody.slice(0, 500)}`,
            })
            .eq("id", event.id);

        return new Response(
            JSON.stringify({
                success: false,
                event_id: event.id,
                replay_status: response.status,
                error: resultBody.slice(0, 500),
            }),
            { status: 502, headers: { "Content-Type": "application/json" } },
        );
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);

        await supabase
            .from("webhook_events")
            .update({
                status: "failed",
                error_message: `Replay error: ${errorMsg}`,
            })
            .eq("id", event.id);

        return new Response(
            JSON.stringify({
                success: false,
                event_id: event.id,
                error: errorMsg,
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        );
    }
});
