#!/usr/bin/env npx tsx
/* eslint-disable no-console */
/* ═══════════════════════════════════════════════════════════════
   OPENAPI TYPE GENERATOR — Generates TypeScript types from spec
   
   1. Builds the OpenAPI 3.1 spec from code (ENTITY_CONFIGS + Zod)
   2. Writes openapi.json to src/types/
   3. Runs openapi-typescript to generate typed API client types
   
   Usage:
     npx tsx scripts/gen-api-types.ts
     # or via npm script:
     npm run gen:api
   ═══════════════════════════════════════════════════════════════ */

import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");
const SPEC_PATH = resolve(ROOT, "src/types/openapi.json");
const TYPES_PATH = resolve(ROOT, "src/types/api.generated.ts");

async function main() {
    console.log("🔧 Building OpenAPI 3.1 spec from code...");

    // Dynamic import to resolve path aliases via tsx
    const { buildOpenApiSpec } = await import("../src/lib/openapi/spec-builder");

    const spec = buildOpenApiSpec();

    // Count paths and schemas
    const pathCount = Object.keys(spec.paths).length;
    const schemaCount = Object.keys(spec.components.schemas).length;
    const tagCount = spec.tags.length;

    // Write spec JSON
    writeFileSync(SPEC_PATH, JSON.stringify(spec, null, 2) + "\n", "utf-8");
    console.log(`✅ Wrote ${SPEC_PATH}`);
    console.log(`   → ${pathCount} paths, ${schemaCount} schemas, ${tagCount} tags`);

    // Generate TypeScript types
    console.log("\n🔧 Generating TypeScript types via openapi-typescript...");
    try {
        execSync(`npx openapi-typescript ${SPEC_PATH} -o ${TYPES_PATH}`, {
            cwd: ROOT,
            stdio: "inherit",
        });
        console.log(`✅ Wrote ${TYPES_PATH}`);
    } catch (err) {
        console.error("❌ openapi-typescript failed:", err);
        process.exit(1);
    }

    console.log("\n✨ API type generation complete!");
}

main().catch((err) => {
    console.error("❌ Fatal error:", err);
    process.exit(1);
});
