#!/usr/bin/env npx tsx
/* eslint-disable no-console */
/* ═══════════════════════════════════════════════════════════════
   UNDOCUMENTED ENDPOINT CHECKER
   
   Compares filesystem API routes against the OpenAPI spec to
   find routes that exist on disk but aren't documented.
   
   Exit code 0 = all routes documented
   Exit code 1 = undocumented routes found
   
   Usage:
     npx tsx scripts/check-undocumented-endpoints.ts
     # or via npm script:
     npm run check:api-coverage
   ═══════════════════════════════════════════════════════════════ */

import { readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");
const API_DIR = join(ROOT, "src/app/api");

// ─── Discover Filesystem Routes ──────────────────────────────

function discoverRoutes(dir: string, prefix = "/api"): string[] {
    const routes: string[] = [];
    let entries: string[];
    try {
        entries = readdirSync(dir);
    } catch {
        return routes;
    }

    for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
            // Convert Next.js dynamic segments: [id] → {id}
            const segment = entry.replace(/\[(\w+)\]/g, "{$1}");
            routes.push(...discoverRoutes(fullPath, `${prefix}/${segment}`));
        } else if (entry === "route.ts" || entry === "route.tsx") {
            routes.push(prefix);
        }
    }

    return routes;
}

// ─── Main ────────────────────────────────────────────────────

async function main() {
    console.log("🔍 Checking for undocumented API endpoints...\n");

    // Build spec from code
    const { buildOpenApiSpec } = await import("../src/lib/openapi/spec-builder");
    const spec = buildOpenApiSpec();
    const specPaths = new Set(Object.keys(spec.paths));

    // Discover filesystem routes
    const fsRoutes = discoverRoutes(API_DIR);
    const fsPathSet = new Set(fsRoutes);

    // Find undocumented routes
    const undocumented = fsRoutes.filter((route) => !specPaths.has(route));

    // Find orphaned spec paths (documented but no route file)
    const orphaned = [...specPaths].filter((path) => !fsPathSet.has(path));

    // Report
    console.log(`📁 Filesystem routes: ${fsRoutes.length}`);
    console.log(`📖 Spec paths:        ${specPaths.size}`);
    console.log("");

    if (undocumented.length > 0) {
        console.log(`⚠️  ${undocumented.length} UNDOCUMENTED route(s):`);
        for (const route of undocumented.sort()) {
            console.log(`   ✘ ${route}`);
        }
        console.log("");
    }

    if (orphaned.length > 0) {
        console.log(`ℹ️  ${orphaned.length} spec-only path(s) (no route file):`);
        for (const path of orphaned.sort()) {
            console.log(`   ○ ${path}`);
        }
        console.log("");
    }

    if (undocumented.length === 0) {
        console.log("✅ All filesystem routes are documented in the OpenAPI spec.");
        process.exit(0);
    } else {
        console.log("❌ Add missing routes to ENTITY_CONFIGS or custom-routes.ts registry.");
        process.exit(1);
    }
}

main().catch((err) => {
    console.error("❌ Fatal error:", err);
    process.exit(1);
});
