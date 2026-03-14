import { NextResponse } from "next/server";
import { checkPermission } from "@/app/api/middleware/permissions";

/**
 * GET /api/docs/ui → Scalar API Reference UI
 * RBAC-gated: requires settings.read (exec, director, pm).
 */
export async function GET() {
    // ─── RBAC Gate ───────────────────────────────────────────
    const perm = await checkPermission("settings", "read");
    if (!perm.authorized) {
        const status = perm.userId ? 403 : 401;
        return NextResponse.json(
            { error: perm.error ?? "API docs require admin access" },
            { status }
        );
    }

    // ─── Serve Scalar UI ─────────────────────────────────────
    const html = `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>FrozenPhoenix API Reference</title>
    <meta name="description" content="Interactive API documentation for the FrozenPhoenix platform" />
    <style>body { margin: 0; padding: 0; }</style>
</head>
<body>
    <script
        id="api-reference"
        data-url="/api/docs"
        data-configuration='${JSON.stringify({
            theme: "kepler",
            layout: "modern",
            hiddenClients: [],
            defaultHttpClient: { targetKey: "javascript", clientKey: "fetch" },
            metaData: { title: "FrozenPhoenix API" },
        })}'
    ></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference@1/browser/standalone.min.js" crossorigin></script>
</body>
</html>`;

    return new NextResponse(html, {
        status: 200,
        headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "private, no-store",
        },
    });
}
