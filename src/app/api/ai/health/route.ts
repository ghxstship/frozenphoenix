/* ═══════════════════════════════════════════════════════════════
   AI Copilot — Health Check Endpoint
   GET /api/ai/health
   
   Returns status of AI subsystem: provider availability,
   encryption config, DB connectivity.
   ═══════════════════════════════════════════════════════════════ */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { ModelRegistry } from "@/lib/ai/model-registry";

export const dynamic = "force-dynamic";

export async function GET() {
    const checks: Record<string, { status: "ok" | "degraded" | "error"; message?: string }> = {};

    // 1. Database connectivity
    const admin = createAdminClient();
    if (admin) {
        const { error } = await admin.from("ai_providers").select("id").limit(1);
        checks.database = error ? { status: "error", message: error.message } : { status: "ok" };
    } else {
        checks.database = { status: "error", message: "Service role key not configured" };
    }

    // 2. Provider registry
    try {
        const registry = ModelRegistry.getInstance();
        const providers = registry.listActiveProviders();
        checks.providers = {
            status: providers.length > 0 ? "ok" : "degraded",
            message: `${providers.length} active provider(s)`,
        };
    } catch {
        checks.providers = { status: "degraded", message: "Registry not initialized" };
    }

    // 3. Encryption config
    checks.encryption = process.env.AI_ENCRYPTION_SECRET
        ? { status: "ok" }
        : { status: "degraded", message: "AI_ENCRYPTION_SECRET not set" };

    // 4. pgvector extension
    if (admin) {
        const { error } = await admin.rpc("match_document_chunks", {
            query_embedding: JSON.stringify(Array(1536).fill(0)),
            match_count: 1,
            match_threshold: 0.99,
        });
        checks.vector_search = error
            ? { status: "degraded", message: "Vector search RPC not available" }
            : { status: "ok" };
    } else {
        checks.vector_search = { status: "error", message: "No DB connection" };
    }

    const overallStatus = Object.values(checks).every((c) => c.status === "ok")
        ? "healthy"
        : Object.values(checks).some((c) => c.status === "error")
          ? "unhealthy"
          : "degraded";

    return NextResponse.json(
        {
            service: "ai-copilot",
            status: overallStatus,
            timestamp: new Date().toISOString(),
            checks,
        },
        { status: overallStatus === "unhealthy" ? 503 : 200 }
    );
}
