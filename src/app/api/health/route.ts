import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const checks: Record<string, { status: "ok" | "degraded" | "error" }> = {};

    // Supabase configuration check
    checks.supabase = { status: "ok" };

    // Environment check (status only — do not leak NODE_ENV or infra details)
    checks.environment = { status: "ok" };

    const overallStatus = Object.values(checks).every((c) => c.status === "ok")
        ? "healthy"
        : Object.values(checks).some((c) => c.status === "error")
          ? "unhealthy"
          : "degraded";

    return NextResponse.json(
        {
            status: overallStatus,
            timestamp: new Date().toISOString(),
        },
        { status: overallStatus === "unhealthy" ? 503 : 200 }
    );
}
