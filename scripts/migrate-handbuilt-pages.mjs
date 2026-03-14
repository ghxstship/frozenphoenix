#!/usr/bin/env node
/**
 * Phase 3: Migrate hand-built list pages to ListPageShell.
 *
 * Strategy:
 * 1. Read each hand-built page
 * 2. Extract: hook, createConfig, title, description, icon, entity key, columns
 * 3. Generate inline ListPageConfig + rewrite page to use ListPageShell with data/isLoading
 *
 * Pages that are too complex (settings, dashboard, org-chart, messages, etc.)
 * are skipped and listed for manual migration.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { execSync } from "child_process";

const ROOT = new URL("..", import.meta.url).pathname;

// Find all hand-built pages (not using ListPageShell)
const allPages = execSync(
    `find src/app/\\(dashboard\\) -name "page.tsx" -maxdepth 2 -exec grep -L "ListPageShell" {} \\;`,
    { cwd: ROOT, encoding: "utf-8" }
).trim().split("\n").filter(Boolean);

// Pages to skip — too specialized, not list pages, or need manual migration
const SKIP_DIRS = new Set([
    "settings",       // 1349 lines, settings page not a list
    "dashboard",      // KPI dashboard, not a list
    "dashboards",     // multi-tab dashboard
    "calendar",       // calendar view
    "org-chart",      // org chart view
    "messages",       // messaging interface
    "resource-planner", // Gantt-style planner
    "forecasting",    // charts/forecasting
    "reports",        // report builder
    "system-health",  // system monitoring
    "scenarios",      // scenario builder with complex state
    "time-tracking",  // time tracking with timers
    "client-portal",  // portal view
    "vendor-portal",  // portal view
    "compliance",     // multi-section compliance dashboard
    "finance",        // finance dashboard with multiple tables
    "live-ops",       // live ops dashboard
    "scheduling",     // scheduling interface
    "data-export",    // export interface
    "approvals",      // multi-tab approval workflow
]);

// ─── Extraction helpers ───────────────────────────────────────

function extractQuotedString(content, pattern) {
    const m = content.match(pattern);
    return m ? m[1] : null;
}

function extractHook(content) {
    // Find the main data hook (useXxx pattern with Supabase data)
    const hookPatterns = [
        /const\s*\{\s*data:\s*\w+,\s*isLoading\s*\}\s*=\s*(use\w+)\(\)/,
        /const\s*\{\s*data:\s*\w+,\s*isLoading\s*\}\s*=\s*(use\w+)\(/,
        /const\s*\{\s*data,\s*isLoading\s*\}\s*=\s*(use\w+)\(/,
    ];
    for (const re of hookPatterns) {
        const m = content.match(re);
        if (m) return m[1];
    }
    return null;
}

function extractHookDataVar(content) {
    const m = content.match(/const\s*\{\s*data:\s*(\w+),\s*isLoading/);
    return m ? m[1] : "data";
}

function extractHookImport(content) {
    const hook = extractHook(content);
    if (!hook) return null;
    // Find import line for this hook
    const importRe = new RegExp(`import\\s*\\{[^}]*\\b${hook}\\b[^}]*\\}\\s*from\\s*"([^"]+)"`);
    const m = content.match(importRe);
    return m ? { hook, path: m[1] } : null;
}

function extractCreateConfig(content) {
    const m = content.match(/import\s*\{\s*(CREATE_\w+_CONFIG)\s*\}\s*from\s*"([^"]+)"/);
    return m ? { name: m[1], path: m[2] } : null;
}

function extractTitle(content) {
    const m = content.match(/title="([^"]+)"/);
    return m ? m[1] : null;
}

function extractDescription(content) {
    const m = content.match(/description="([^"]+)"/);
    return m ? m[1] : null;
}

function extractIcon(content) {
    // Look for icon in PageHeader or StatCard
    const headerIcon = content.match(/icon=\{(\w+)\}/);
    // Look for lucide imports
    const lucideImport = content.match(/from\s*"lucide-react";\s*$/m);
    return null; // We'll use LayoutList as default
}

function extractEntityKey(dirName) {
    return dirName.replace(/-/g, "_");
}

function extractTableColumns(content) {
    // Extract from <th> elements in <table>
    const cols = [];
    const thMatches = content.matchAll(/<th[^>]*>([^<]+)<\/th>/g);
    for (const m of thMatches) {
        const label = m[1].trim();
        if (label) cols.push(label);
    }
    return cols;
}

function extractTableCells(content) {
    // Extract accessor keys from <td> cells
    const cells = [];
    const tdMatches = content.matchAll(/\{(?:r|c|cn|item|wh|row)\.\s*(\w+)/g);
    for (const m of tdMatches) {
        cells.push(m[1]);
    }
    return [...new Set(cells)];
}

function guessColumnsFromContent(content, entityKey) {
    // Try to extract from <table> headers first
    const tableHeaders = extractTableColumns(content);

    if (tableHeaders.length > 0) {
        // Try to map headers to accessor keys from cell content
        const cells = extractTableCells(content);
        const cols = [];
        for (let i = 0; i < tableHeaders.length; i++) {
            const header = tableHeaders[i];
            const key = cells[i] || header.toLowerCase().replace(/[^a-z0-9]+/g, "_");
            const col = { id: key, header, accessorKey: key };
            // Guess field types
            if (/status/i.test(header)) col.fieldType = "status";
            else if (/date|created|updated|issued|expir/i.test(header)) col.fieldType = "date";
            else if (/amount|cost|total|price|budget|revenue/i.test(header)) col.fieldType = "currency";
            cols.push(col);
        }
        return cols;
    }

    // Default columns for card-based pages
    return [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ];
}

function extractLucideIcons(content) {
    const m = content.match(/import\s*\{([^}]+)\}\s*from\s*"lucide-react"/);
    if (!m) return [];
    return m[1].split(",").map(s => s.trim()).filter(Boolean);
}

function pickMainIcon(icons, entityKey) {
    // Pick the most relevant icon (not Plus, not utility icons)
    const skip = new Set(["Plus", "Upload", "Download", "Search", "X", "Check", "ChevronDown", "ChevronRight", "ChevronUp", "ArrowLeft", "ArrowRight", "MoreHorizontal", "MoreVertical", "Eye", "EyeOff", "Edit", "Trash", "Trash2", "Copy", "ExternalLink", "Link"]);
    const candidates = icons.filter(i => !skip.has(i));
    return candidates[0] || "LayoutList";
}

// ─── Main ─────────────────────────────────────────────────────

let migrated = 0;
let skipped = 0;
const skipList = [];
const errors = [];

for (const relPath of allPages) {
    const dirName = relPath.split("/").slice(-2, -1)[0];

    if (SKIP_DIRS.has(dirName)) {
        skipped++;
        skipList.push(`SKIP (complex): ${dirName}`);
        continue;
    }

    const fullPath = ROOT + relPath;
    const content = readFileSync(fullPath, "utf-8");
    const lines = content.split("\n").length;

    // Skip very complex pages (>500 lines)
    if (lines > 500) {
        skipped++;
        skipList.push(`SKIP (${lines} lines): ${dirName}`);
        continue;
    }

    const hookInfo = extractHookImport(content);
    if (!hookInfo) {
        skipped++;
        skipList.push(`SKIP (no hook): ${dirName}`);
        continue;
    }

    const entityKey = extractEntityKey(dirName);
    const title = extractTitle(content) || dirName.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    const description = extractDescription(content) || `Manage ${title.toLowerCase()}`;
    const createConfig = extractCreateConfig(content);
    const lucideIcons = extractLucideIcons(content);
    const mainIcon = pickMainIcon(lucideIcons, entityKey);
    const columns = guessColumnsFromContent(content, entityKey);
    const hookDataVar = extractHookDataVar(content);

    // Determine search keys from the page's search filter
    const searchKeys = [];
    const searchMatch = content.match(/\.toLowerCase\(\)\.includes\(search\.toLowerCase\(\)\)/g);
    const searchFieldMatches = content.matchAll(/(\w+)\.toLowerCase\(\)\.includes\(search/g);
    for (const m of searchFieldMatches) {
        const field = m[1];
        if (field !== "search" && field !== "searchQuery" && field !== "query") {
            // Extract the object property: r.name -> name
            const propMatch = content.match(new RegExp(`(?:r|c|cn|item|wh|row|person|doc|sop)\\.([\\w.]+)\\.toLowerCase\\(\\)\\.includes\\(search`, "g"));
            if (propMatch) {
                for (const pm of propMatch) {
                    const propKey = pm.match(/\.(\w+)\.toLowerCase/);
                    if (propKey) searchKeys.push(propKey[1]);
                }
            }
        }
    }
    const uniqueSearchKeys = [...new Set(searchKeys)].slice(0, 3);
    if (uniqueSearchKeys.length === 0) uniqueSearchKeys.push("name");

    // Build column definitions string
    const colDefs = columns.map(c => {
        let def = `        { id: "${c.id}", header: "${c.header}", accessorKey: "${c.accessorKey}"`;
        if (c.fieldType) def += `, fieldType: "${c.fieldType}"`;
        def += " }";
        return def;
    }).join(",\n");

    // Build imports
    const imports = [];
    imports.push(`import { ListPageShell } from "@/components/shells";`);
    imports.push(`import { ${hookInfo.hook} } from "${hookInfo.path}";`);
    if (createConfig) {
        imports.push(`import { ${createConfig.name} } from "${createConfig.path}";`);
    }
    imports.push(`import { ${mainIcon} } from "lucide-react";`);
    imports.push(`import type { ListPageConfig } from "@/types/list-page-config";`);

    // Build config
    const configLines = [];
    configLines.push(`const config: ListPageConfig = {`);
    configLines.push(`    entityKey: "${entityKey}",`);
    configLines.push(`    title: "${title}",`);
    configLines.push(`    description: "${description}",`);
    configLines.push(`    icon: ${mainIcon},`);
    if (createConfig) {
        configLines.push(`    createConfig: ${createConfig.name},`);
    }
    configLines.push(`    searchKeys: [${uniqueSearchKeys.map(k => `"${k}"`).join(", ")}],`);
    configLines.push(`    columns: [`);
    configLines.push(colDefs);
    configLines.push(`    ],`);

    // Add exportable if the page had CsvExportButton
    if (content.includes("CsvExportButton")) {
        configLines.push(`    exportable: true,`);
    }

    configLines.push(`};`);

    // Build function name
    const funcMatch = content.match(/export default function (\w+)/);
    const funcName = funcMatch ? funcMatch[1] : "Page";

    // Generate the new page
    const newContent = `"use client";

${imports.join("\n")}

${configLines.join("\n")}

export default function ${funcName}() {
    const { data: rawData, isLoading } = ${hookInfo.hook}();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
`;

    writeFileSync(fullPath, newContent, "utf-8");
    migrated++;
}

console.log(`\nMigrated: ${migrated}`);
console.log(`Skipped: ${skipped}`);
console.log(`\nSkipped pages:`);
skipList.forEach(s => console.log(`  ${s}`));
if (errors.length > 0) {
    console.log(`\nErrors:`);
    errors.forEach(e => console.log(`  ${e}`));
}
