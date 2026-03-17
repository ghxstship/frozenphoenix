import { NextResponse } from "next/server";
import { buildOpenApiSpec } from "@/lib/api-docs";
import { checkPermission } from "@/app/api/middleware/permissions";

/**
 * M-009: OpenAPI specification endpoint.
 * GET /api/docs → returns the OpenAPI 3.1 JSON spec.
 * RBAC-gated: requires settings.read (exec, director, pm).
 */
export async function GET() {
    const perm = await checkPermission("settings", "read");
    if (!perm.authorized) {
        const status = perm.userId ? 403 : 401;
        return NextResponse.json({ error: "API docs require admin access" }, { status });
    }

    return NextResponse.json(buildOpenApiSpec(), {
        headers: { "Cache-Control": "private, no-store" },
    });
}
