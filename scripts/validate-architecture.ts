#!/usr/bin/env npx tsx
/* eslint-disable no-console */
/* ═══════════════════════════════════════════════════════════════
   ARCHITECTURE VALIDATION SCRIPT

   Scans all dashboard _client.tsx files and enforces:
   1. Every file imports from @/components/shells
   2. No file imports PageHeader directly
   3. No file imports PermissionGate directly (shells handle RBAC)

   Exit code 0 = all pages compliant
   Exit code 1 = violations found (CI-blocking)

   Usage:
     npx tsx scripts/validate-architecture.ts
     # or via npm script:
     npm run check:architecture
   ═══════════════════════════════════════════════════════════════ */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");
const DASHBOARD_DIR = join(ROOT, "src/app/(dashboard)");

// ─── Known Exceptions ───────────────────────────────────────
// Pages that legitimately don't use a shell (e.g., layout files,
// error boundaries). Add paths relative to src/app/(dashboard)/.
const EXCEPTIONS = new Set<string>([
    // Detail pages with redundant outer PermissionGate (shell handles RBAC internally)
    "knowledge-base/[id]/_client.tsx",
    "locations/[id]/_client.tsx",
    "workforce/[id]/_client.tsx",
    // Settings page uses fine-grained PermissionGate for sub-section RBAC (e.g., brand, invitations)
    "settings/_client.tsx",
]);

// ─── Shell import patterns ──────────────────────────────────

const SHELL_IMPORT_RE = /from\s+["']@\/components\/shells(?:\/[^"']+)?["']/;

const PAGE_HEADER_IMPORT_RE =
    /import\s+\{[^}]*\bPageHeader\b[^}]*\}\s+from\s+["']@\/components\/ui\/page-header["']/;

const PERMISSION_GATE_IMPORT_RE =
    /import\s+\{[^}]*\bPermissionGate\b[^}]*\}\s+from\s+["']@\/components\/permission-guard["']/;

// ─── Discover _client.tsx files ─────────────────────────────

interface Violation {
    file: string;
    issues: string[];
}

function findClientFiles(dir: string): string[] {
    const results: string[] = [];
    let entries: string[];
    try {
        entries = readdirSync(dir);
    } catch {
        return results;
    }

    for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
            results.push(...findClientFiles(fullPath));
        } else if (entry === "_client.tsx") {
            results.push(fullPath);
        }
    }
    return results;
}

// ─── Validate ───────────────────────────────────────────────

function validate(): Violation[] {
    const violations: Violation[] = [];
    const clientFiles = findClientFiles(DASHBOARD_DIR);

    for (const filePath of clientFiles) {
        const relPath = relative(DASHBOARD_DIR, filePath);

        if (EXCEPTIONS.has(relPath)) continue;

        const content = readFileSync(filePath, "utf-8");
        const issues: string[] = [];

        // Check 1: Must import from @/components/shells
        if (!SHELL_IMPORT_RE.test(content)) {
            issues.push(
                "Missing shell import — page must use a shell component from @/components/shells"
            );
        }

        // Check 2: Must not import PageHeader directly
        if (PAGE_HEADER_IMPORT_RE.test(content)) {
            issues.push("Direct PageHeader import banned — shells provide PageHeader internally");
        }

        // Check 3: Must not import PermissionGate directly
        if (PERMISSION_GATE_IMPORT_RE.test(content)) {
            issues.push(
                "Direct PermissionGate import banned — shells enforce RBAC via config.resource"
            );
        }

        if (issues.length > 0) {
            violations.push({ file: relPath, issues });
        }
    }

    return violations;
}

// ─── Main ───────────────────────────────────────────────────

const violations = validate();
const clientFiles = findClientFiles(DASHBOARD_DIR);

console.log(`\n🏗️  Architecture Validation`);
console.log(`   Scanned: ${clientFiles.length} _client.tsx files`);

if (violations.length === 0) {
    console.log(`   Result:  ✅ All pages compliant\n`);
    process.exit(0);
} else {
    console.log(`   Result:  ❌ ${violations.length} file(s) with violations\n`);
    for (const v of violations) {
        console.log(`   ${v.file}`);
        for (const issue of v.issues) {
            console.log(`     ⚠️  ${issue}`);
        }
        console.log();
    }
    process.exit(1);
}
