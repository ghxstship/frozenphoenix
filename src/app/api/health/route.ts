import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const startedAt = Date.now();

export async function GET() {
    const checks: Record<string, { status: "ok" | "degraded" | "error"; latencyMs?: number }> = {};
    const start = performance.now();

    // Supabase connectivity check — lightweight query
    try {
        const dbStart = performance.now();
        const supabase = await createClient();
        if (!supabase) {
            checks.database = { status: "error" };
        } else {
            const { error } = await supabase
                .from("organizations")
                .select("id", { count: "exact", head: true })
                .limit(1);
            checks.database = {
                status: error ? "degraded" : "ok",
                latencyMs: Math.round(performance.now() - dbStart),
            };
        }
    } catch {
        checks.database = { status: "error" };
    }

    // Application process check
    checks.application = { status: "ok" };

    const overallStatus = Object.values(checks).every((c) => c.status === "ok")
        ? "healthy"
        : Object.values(checks).some((c) => c.status === "error")
          ? "unhealthy"
          : "degraded";

    const responseTimeMs = Math.round(performance.now() - start);

    if (overallStatus !== "healthy") {
        logger.warn("Health check returned non-healthy status", {
            service: "health",
            status: overallStatus,
            checks,
            responseTimeMs,
        });
    }

    return NextResponse.json(
        {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            uptime: Math.round((Date.now() - startedAt) / 1000),
            responseTimeMs,
            checks,
        },
        { status: overallStatus === "unhealthy" ? 503 : 200 }
    );
}
