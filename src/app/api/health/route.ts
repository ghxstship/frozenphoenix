import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
    const checks: Record<string, { status: "ok" | "degraded" | "error" }> = {};
    const start = performance.now();

    // Supabase connectivity check — lightweight query
    try {
        const supabase = await createClient();
        if (!supabase) {
            checks.supabase = { status: "error" };
        } else {
            const { error } = await supabase
                .from("organizations")
                .select("id", { count: "exact", head: true })
                .limit(1);
            checks.supabase = { status: error ? "degraded" : "ok" };
        }
    } catch {
        checks.supabase = { status: "error" };
    }

    // Environment check (status only — do not leak NODE_ENV or infra details)
    checks.environment = { status: "ok" };

    const overallStatus = Object.values(checks).every((c) => c.status === "ok")
        ? "healthy"
        : Object.values(checks).some((c) => c.status === "error")
          ? "unhealthy"
          : "degraded";

    const responseTimeMs = Math.round(performance.now() - start);

    if (overallStatus !== "healthy") {
        logger.warn("Health check returned non-healthy status", {
            status: overallStatus,
            checks,
            responseTimeMs,
        });
    }

    return NextResponse.json(
        {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            responseTimeMs,
        },
        { status: overallStatus === "unhealthy" ? 503 : 200 }
    );
}
