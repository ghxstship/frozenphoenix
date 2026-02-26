import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export async function GET() {
    const checks: Record<string, { status: "ok" | "degraded" | "error"; message?: string }> = {};

    // Supabase configuration check
    checks.supabase = isSupabaseConfigured
        ? { status: "ok" }
        : { status: "degraded", message: "Running in mock data mode" };

    // Environment check
    checks.environment = {
        status: "ok",
        message: process.env.NODE_ENV ?? "unknown",
    };

    const overallStatus = Object.values(checks).every((c) => c.status === "ok")
        ? "healthy"
        : Object.values(checks).some((c) => c.status === "error")
            ? "unhealthy"
            : "degraded";

    return NextResponse.json(
        {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            checks,
        },
        { status: overallStatus === "unhealthy" ? 503 : 200 }
    );
}
