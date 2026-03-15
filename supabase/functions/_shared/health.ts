/**
 * H-018: Shared health check handler for edge functions.
 *
 * Each edge function can add a health check endpoint by checking for
 * `GET /<function>?health=true` or a dedicated `/health` path.
 *
 * Returns:
 *   - Function name and version
 *   - Supabase connectivity status
 *   - Uptime / timestamp
 *   - Memory usage (if available)
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface HealthCheckResult {
    status: "healthy" | "degraded" | "unhealthy";
    function_name: string;
    timestamp: string;
    checks: {
        supabase: "ok" | "error";
        supabase_latency_ms?: number;
    };
    metadata?: Record<string, unknown>;
}

/**
 * Run a health check for the current edge function.
 * Tests Supabase connectivity via a lightweight query.
 */
export async function runHealthCheck(
    functionName: string,
    metadata?: Record<string, unknown>,
): Promise<HealthCheckResult> {
    const timestamp = new Date().toISOString();
    let supabaseStatus: "ok" | "error" = "error";
    let latencyMs: number | undefined;

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

        if (supabaseUrl && supabaseKey) {
            const supabase = createClient(supabaseUrl, supabaseKey);
            const start = performance.now();
            // Lightweight connectivity test — select 1 from any small table
            const { error } = await supabase
                .from("organizations")
                .select("id")
                .limit(1);
            latencyMs = Math.round(performance.now() - start);

            supabaseStatus = error ? "error" : "ok";
        }
    } catch {
        supabaseStatus = "error";
    }

    const status = supabaseStatus === "ok" ? "healthy" : "degraded";

    return {
        status,
        function_name: functionName,
        timestamp,
        checks: {
            supabase: supabaseStatus,
            ...(latencyMs !== undefined ? { supabase_latency_ms: latencyMs } : {}),
        },
        ...(metadata ? { metadata } : {}),
    };
}

/**
 * Convenience: check if the request is a health check probe and respond.
 * Returns null if this is not a health check request.
 */
export async function handleHealthCheck(
    req: Request,
    functionName: string,
): Promise<Response | null> {
    const url = new URL(req.url);
    const isHealthCheck =
        url.searchParams.get("health") === "true" ||
        url.pathname.endsWith("/health");

    if (!isHealthCheck) return null;

    const result = await runHealthCheck(functionName);
    return new Response(JSON.stringify(result), {
        status: result.status === "healthy" ? 200 : 503,
        headers: { "Content-Type": "application/json" },
    });
}
