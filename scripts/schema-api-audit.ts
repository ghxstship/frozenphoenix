#!/usr/bin/env npx tsx
/* eslint-disable no-console, @typescript-eslint/no-unused-vars */
/**
 * Schema-to-API Column Audit Script
 *
 * Parses all SQL migration files to extract table schemas, then scans all
 * TypeScript/TSX source files for Supabase `.from("table")` calls and
 * cross-references the queried tables/columns against the schema.
 *
 * Usage: npx tsx scripts/schema-api-audit.ts
 */

import * as fs from "fs";
import * as path from "path";

// ─── Configuration ───
const ROOT = path.resolve(__dirname, "..");
const MIGRATIONS_DIR = path.join(ROOT, "supabase", "migrations");
const SRC_DIR = path.join(ROOT, "src");

// ─── Types ───
interface ColumnDef {
    name: string;
    type: string;
    generated: boolean;
    migration: string;
    lineNumber: number;
}

interface TableSchema {
    name: string;
    columns: Map<string, ColumnDef>;
    migration: string;
    lineNumber: number;
    isView: boolean;
}

interface QueryUsage {
    table: string;
    operation: "select" | "insert" | "update" | "upsert" | "delete" | "count" | "unknown";
    selectColumns: string[]; // columns explicitly in .select()
    filterColumns: string[]; // columns in .eq(), .gte(), .in(), etc.
    updateColumns: string[]; // columns in .update({...})
    joinTables: string[]; // foreign table references in select
    file: string;
    lineNumber: number;
    rawSelect: string;
}

interface AuditFinding {
    severity: "ERROR" | "WARNING" | "INFO";
    category: string;
    message: string;
    file: string;
    lineNumber: number;
    table: string;
    column?: string;
}

// ─── 1. Parse Migrations ───

function parseMigrations(): Map<string, TableSchema> {
    const tables = new Map<string, TableSchema>();

    const migrationFiles = fs
        .readdirSync(MIGRATIONS_DIR)
        .filter((f) => f.endsWith(".sql"))
        .sort();

    for (const file of migrationFiles) {
        const filePath = path.join(MIGRATIONS_DIR, file);
        const sql = fs.readFileSync(filePath, "utf-8");
        const lines = sql.split("\n");

        parseCreateTables(lines, file, tables);
        parseAlterTableAddColumn(lines, file, tables);
        parseCreateViews(lines, file, tables);
    }

    return tables;
}

function parseCreateTables(
    lines: string[],
    migration: string,
    tables: Map<string, TableSchema>
): void {
    // Multi-line CREATE TABLE parsing
    let inCreateTable = false;
    let currentTable: TableSchema | null = null;
    let parenDepth = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const lineNum = i + 1;

        // Skip comments
        if (line.startsWith("--") || line.startsWith("/*")) continue;

        // Detect CREATE TABLE
        const createMatch = line.match(
            /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?["']?(\w+)["']?\s*\(/i
        );
        if (createMatch) {
            const tableName = createMatch[1].toLowerCase();
            inCreateTable = true;
            parenDepth = 1;

            if (!tables.has(tableName)) {
                currentTable = {
                    name: tableName,
                    columns: new Map(),
                    migration,
                    lineNumber: lineNum,
                    isView: false,
                };
                tables.set(tableName, currentTable);
            } else {
                currentTable = tables.get(tableName)!;
            }

            // Check if there are columns on the same line after the opening paren
            const afterParen = line.substring(line.indexOf("(") + 1);
            if (afterParen.trim()) {
                parseColumnLine(afterParen, currentTable, migration, lineNum);
            }
            continue;
        }

        if (inCreateTable && currentTable) {
            // Track paren depth
            for (const ch of line) {
                if (ch === "(") parenDepth++;
                if (ch === ")") parenDepth--;
            }

            if (parenDepth <= 0) {
                inCreateTable = false;
                currentTable = null;
                continue;
            }

            parseColumnLine(line, currentTable, migration, lineNum);
        }
    }
}

function parseColumnLine(
    line: string,
    table: TableSchema,
    migration: string,
    lineNum: number
): void {
    const trimmed = line.trim();

    // Skip constraints, indexes, etc.
    if (
        /^(CONSTRAINT|PRIMARY\s+KEY|UNIQUE|CHECK|FOREIGN\s+KEY|EXCLUDE|CREATE\s+INDEX)/i.test(
            trimmed
        )
    )
        return;
    if (trimmed === "" || trimmed === "," || trimmed === ");") return;

    // Parse column definition: column_name TYPE ...
    const colMatch = trimmed.match(/^["']?(\w+)["']?\s+(\S+)/);
    if (!colMatch) return;

    const colName = colMatch[1].toLowerCase();
    const colType = colMatch[2].toUpperCase();

    // Skip SQL keywords that aren't column names
    const skipWords = new Set([
        "constraint",
        "primary",
        "unique",
        "check",
        "foreign",
        "exclude",
        "index",
        "using",
        "references",
        "on",
        "create",
        "alter",
        "drop",
        "insert",
        "update",
        "delete",
        "select",
        "from",
        "where",
        "and",
        "or",
        "not",
        "in",
        "is",
        "null",
        "default",
        "set",
        "grant",
        "revoke",
        "if",
        "then",
        "else",
        "end",
        "begin",
        "return",
        "declare",
        "as",
        "with",
        "values",
        "into",
    ]);
    if (skipWords.has(colName)) return;

    const isGenerated = /GENERATED\s+ALWAYS\s+AS/i.test(trimmed);

    table.columns.set(colName, {
        name: colName,
        type: colType,
        generated: isGenerated,
        migration,
        lineNumber: lineNum,
    });
}

function parseAlterTableAddColumn(
    lines: string[],
    migration: string,
    tables: Map<string, TableSchema>
): void {
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const lineNum = i + 1;

        // ALTER TABLE table_name ADD COLUMN col_name TYPE ...
        const alterMatch = line.match(
            /ALTER\s+TABLE\s+(?:IF\s+EXISTS\s+)?(?:public\.)?["']?(\w+)["']?\s+ADD\s+(?:COLUMN\s+)?(?:IF\s+NOT\s+EXISTS\s+)?["']?(\w+)["']?\s+(\S+)/i
        );
        if (alterMatch) {
            const tableName = alterMatch[1].toLowerCase();
            const colName = alterMatch[2].toLowerCase();
            const colType = alterMatch[3].toUpperCase();

            if (tables.has(tableName)) {
                const table = tables.get(tableName)!;
                const isGenerated = /GENERATED\s+ALWAYS\s+AS/i.test(line);
                table.columns.set(colName, {
                    name: colName,
                    type: colType,
                    generated: isGenerated,
                    migration,
                    lineNumber: lineNum,
                });
            }
        }
    }
}

function parseCreateViews(
    lines: string[],
    migration: string,
    tables: Map<string, TableSchema>
): void {
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const lineNum = i + 1;

        const viewMatch = line.match(
            /CREATE\s+(?:OR\s+REPLACE\s+)?(?:MATERIALIZED\s+)?VIEW\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?["']?(\w+)["']?\s+AS/i
        );
        if (viewMatch) {
            const viewName = viewMatch[1].toLowerCase();
            if (!tables.has(viewName)) {
                tables.set(viewName, {
                    name: viewName,
                    columns: new Map(), // Views have dynamic columns; we track them as known entities
                    migration,
                    lineNumber: lineNum,
                    isView: true,
                });
            }
        }
    }
}

// ─── 2. Scan Source Files for Supabase Queries ───

function scanSourceFiles(): QueryUsage[] {
    const usages: QueryUsage[] = [];

    function walk(dir: string): void {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (entry.name === "node_modules" || entry.name === ".next") continue;
                walk(fullPath);
            } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
                scanFile(fullPath, usages);
            }
        }
    }

    walk(SRC_DIR);
    return usages;
}

function scanFile(filePath: string, usages: QueryUsage[]): void {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    const relPath = path.relative(ROOT, filePath);

    // Find all .from("table_name") or fromTable("table_name") patterns
    const fromRegex =
        /\.from\(\s*["']([^"']+)["']\s*(?:as\s+never)?\s*\)|fromTable\(\s*["']([^"']+)["']\s*\)/g;

    let match: RegExpExecArray | null;
    while ((match = fromRegex.exec(content)) !== null) {
        const tableName = (match[1] || match[2]).toLowerCase();
        const charIndex = match.index;

        // Determine line number
        const lineNum = content.substring(0, charIndex).split("\n").length;

        // Extract the full chain after .from() — look ahead up to 1000 chars or next semicolon/function boundary
        const chainStart = charIndex;
        const chainEnd = Math.min(content.length, chainStart + 2000);
        const chainText = content.substring(chainStart, chainEnd);

        // Determine operation
        const operation = detectOperation(chainText);

        // Parse .select() columns
        const selectMatch = chainText.match(/\.select\(\s*["'`]([^"'`]*)["'`]/);
        const rawSelect = selectMatch ? selectMatch[1] : "";
        const { columns: selectColumns, joinTables } = parseSelectString(rawSelect);

        // Parse filter columns (.eq, .gte, .lte, .in, .neq, .is, .contains, etc.)
        const filterColumns = parseFilterColumns(chainText);

        // Parse update/insert columns
        const updateColumns = parseUpdateColumns(chainText);

        usages.push({
            table: tableName,
            operation,
            selectColumns,
            filterColumns,
            updateColumns,
            joinTables,
            file: relPath,
            lineNumber: lineNum,
            rawSelect,
        });
    }
}

function detectOperation(chain: string): QueryUsage["operation"] {
    // Check in order of specificity
    if (/\.upsert\s*\(/.test(chain)) return "upsert";
    if (/\.insert\s*\(/.test(chain)) return "insert";
    if (/\.update\s*\(/.test(chain)) return "update";
    if (/\.delete\s*\(/.test(chain)) return "delete";
    if (/\.select\s*\(/.test(chain)) return "select";
    if (/count:\s*["']exact["']/.test(chain)) return "count";
    return "unknown";
}

function parseSelectString(selectStr: string): {
    columns: string[];
    joinTables: string[];
} {
    if (!selectStr || selectStr === "*") {
        return { columns: [], joinTables: [] };
    }

    const columns: string[] = [];
    const joinTables: string[] = [];

    // Split by comma, handling nested parens for join syntax
    const parts: string[] = [];
    let depth = 0;
    let current = "";
    for (const ch of selectStr) {
        if (ch === "(") depth++;
        if (ch === ")") depth--;
        if (ch === "," && depth === 0) {
            parts.push(current.trim());
            current = "";
        } else {
            current += ch;
        }
    }
    if (current.trim()) parts.push(current.trim());

    for (const part of parts) {
        if (part === "*") continue;

        // Check for join: table_name(col1, col2) or alias:table_name(col1, col2)
        const joinMatch = part.match(/(?:(\w+):)?(\w+)\s*\(([^)]*)\)/);
        if (joinMatch) {
            const joinTable = joinMatch[2];
            joinTables.push(joinTable);
            continue;
        }

        // Plain column, possibly with alias: alias:column_name
        const colMatch = part.match(/(?:\w+:)?(\w+)/);
        if (colMatch) {
            columns.push(colMatch[1]);
        }
    }

    return { columns, joinTables };
}

function parseFilterColumns(chain: string): string[] {
    const columns: string[] = [];
    // Match .eq("col", ...), .gte("col", ...), .lte("col", ...), .in("col", ...), .neq("col", ...), .is("col", ...)
    const filterRegex =
        /\.(?:eq|neq|gt|gte|lt|lte|like|ilike|in|is|contains|overlaps|match)\(\s*["'](\w+)["']/g;
    let m: RegExpExecArray | null;
    while ((m = filterRegex.exec(chain)) !== null) {
        columns.push(m[1]);
    }
    return columns;
}

function parseUpdateColumns(chain: string): string[] {
    const columns: string[] = [];
    // Look for .update({ col: ... }) or .insert({ col: ... }) patterns
    const updateMatch = chain.match(/\.(?:update|insert|upsert)\(\s*\{([^}]*)\}/);
    if (updateMatch) {
        const body = updateMatch[1];
        const keyRegex = /(\w+)\s*:/g;
        let m: RegExpExecArray | null;
        while ((m = keyRegex.exec(body)) !== null) {
            columns.push(m[1]);
        }
    }
    return columns;
}

// ─── 3. Cross-Reference & Produce Findings ───

function crossReference(schema: Map<string, TableSchema>, usages: QueryUsage[]): AuditFinding[] {
    const findings: AuditFinding[] = [];

    for (const usage of usages) {
        const table = schema.get(usage.table);

        // Skip storage.from() calls (these are bucket references, not table queries)
        if (
            usage.file.includes("storage.ts") &&
            [
                "avatars",
                "assets",
                "documents",
                "contracts",
                "brand-kits",
                "deliverables",
                "expenses",
                "temp",
            ].includes(usage.table)
        ) {
            continue;
        }

        // Finding 1: Table referenced in code doesn't exist in schema
        if (!table) {
            findings.push({
                severity: "ERROR",
                category: "MISSING_TABLE",
                message: `Table "${usage.table}" referenced in code but not found in any migration`,
                file: usage.file,
                lineNumber: usage.lineNumber,
                table: usage.table,
            });
            continue;
        }

        // Views have dynamic columns — skip column-level checks
        if (table.isView) continue;

        // Finding 2: Specific select columns not in schema
        for (const col of usage.selectColumns) {
            if (!table.columns.has(col)) {
                findings.push({
                    severity: "ERROR",
                    category: "MISSING_SELECT_COLUMN",
                    message: `Column "${col}" selected from "${usage.table}" but not found in schema`,
                    file: usage.file,
                    lineNumber: usage.lineNumber,
                    table: usage.table,
                    column: col,
                });
            }
        }

        // Finding 3: Filter columns not in schema
        for (const col of usage.filterColumns) {
            if (!table.columns.has(col)) {
                findings.push({
                    severity: "ERROR",
                    category: "MISSING_FILTER_COLUMN",
                    message: `Filter column "${col}" used on "${usage.table}" but not found in schema`,
                    file: usage.file,
                    lineNumber: usage.lineNumber,
                    table: usage.table,
                    column: col,
                });
            }
        }

        // Finding 4: Update/insert columns not in schema
        for (const col of usage.updateColumns) {
            if (!table.columns.has(col)) {
                findings.push({
                    severity: "ERROR",
                    category: "MISSING_WRITE_COLUMN",
                    message: `Write column "${col}" used on "${usage.table}" but not found in schema`,
                    file: usage.file,
                    lineNumber: usage.lineNumber,
                    table: usage.table,
                    column: col,
                });
            }
        }

        // Finding 5: Writing to generated columns
        for (const col of usage.updateColumns) {
            const colDef = table.columns.get(col);
            if (colDef?.generated) {
                findings.push({
                    severity: "ERROR",
                    category: "WRITE_TO_GENERATED",
                    message: `Attempting to write to GENERATED column "${col}" on "${usage.table}"`,
                    file: usage.file,
                    lineNumber: usage.lineNumber,
                    table: usage.table,
                    column: col,
                });
            }
        }

        // Finding 6: Join tables not in schema
        for (const joinTable of usage.joinTables) {
            if (!schema.has(joinTable)) {
                findings.push({
                    severity: "ERROR",
                    category: "MISSING_JOIN_TABLE",
                    message: `Join table "${joinTable}" referenced from "${usage.table}" query but not found in schema`,
                    file: usage.file,
                    lineNumber: usage.lineNumber,
                    table: usage.table,
                    column: joinTable,
                });
            }
        }

        // Future: .order() column validation could be added here
    }

    return findings;
}

// ─── 4. Report Generation ───

function generateReport(
    schema: Map<string, TableSchema>,
    usages: QueryUsage[],
    findings: AuditFinding[]
): string {
    const lines: string[] = [];

    lines.push("# Schema-to-API Column Audit Report");
    lines.push(`> Generated: ${new Date().toISOString()}`);
    lines.push("");

    // ─── Summary ───
    const errorCount = findings.filter((f) => f.severity === "ERROR").length;
    const warningCount = findings.filter((f) => f.severity === "WARNING").length;
    const infoCount = findings.filter((f) => f.severity === "INFO").length;

    lines.push("## Summary");
    lines.push("");
    lines.push(`| Metric | Count |`);
    lines.push(`|--------|-------|`);
    lines.push(`| Total DB Tables (incl. views) | ${schema.size} |`);
    lines.push(
        `| Total Tables (non-view) | ${[...schema.values()].filter((t) => !t.isView).length} |`
    );
    lines.push(
        `| Total Columns | ${[...schema.values()].reduce((s, t) => s + t.columns.size, 0)} |`
    );
    lines.push(`| Total Supabase Query Usages | ${usages.length} |`);
    lines.push(`| Unique Tables Queried | ${new Set(usages.map((u) => u.table)).size} |`);
    lines.push(`| **Errors** | **${errorCount}** |`);
    lines.push(`| Warnings | ${warningCount} |`);
    lines.push(`| Info | ${infoCount} |`);
    lines.push("");

    // ─── Schema-Defined Tables Never Queried ───
    const queriedTables = new Set(usages.map((u) => u.table));
    const unqueriedTables = [...schema.values()].filter(
        (t) => !t.isView && !queriedTables.has(t.name)
    );
    if (unqueriedTables.length > 0) {
        lines.push("## Schema Tables Never Queried in App Code");
        lines.push("");
        lines.push("These tables exist in migrations but no `.from()` call references them.");
        lines.push(
            "This may be expected (e.g., junction tables managed by triggers) or may indicate dead schema."
        );
        lines.push("");
        lines.push("| Table | Migration | Columns |");
        lines.push("|-------|-----------|---------|");
        for (const t of unqueriedTables.sort((a, b) => a.name.localeCompare(b.name))) {
            lines.push(`| \`${t.name}\` | ${t.migration} | ${t.columns.size} |`);
        }
        lines.push("");
    }

    // ─── Tables Queried but Not in Schema ───
    const missingTableFindings = findings.filter((f) => f.category === "MISSING_TABLE");
    if (missingTableFindings.length > 0) {
        lines.push("## ERRORS: Tables Queried but Not in Schema");
        lines.push("");
        lines.push(
            "These `.from()` calls reference tables that do not exist in any migration file."
        );
        lines.push("");
        lines.push("| Table | File | Line |");
        lines.push("|-------|------|------|");
        const seen = new Set<string>();
        for (const f of missingTableFindings) {
            const key = `${f.table}:${f.file}:${f.lineNumber}`;
            if (seen.has(key)) continue;
            seen.add(key);
            lines.push(`| \`${f.table}\` | \`${f.file}\` | ${f.lineNumber} |`);
        }
        lines.push("");
    }

    // ─── Column Mismatches ───
    const columnFindings = findings.filter((f) =>
        ["MISSING_SELECT_COLUMN", "MISSING_FILTER_COLUMN", "MISSING_WRITE_COLUMN"].includes(
            f.category
        )
    );
    if (columnFindings.length > 0) {
        lines.push("## ERRORS: Column Mismatches");
        lines.push("");
        lines.push("Columns referenced in queries that do not exist in the target table's schema.");
        lines.push("");
        lines.push("| Severity | Category | Table | Column | File | Line | Message |");
        lines.push("|----------|----------|-------|--------|------|------|---------|");
        for (const f of columnFindings) {
            lines.push(
                `| ${f.severity} | ${f.category} | \`${f.table}\` | \`${f.column}\` | \`${f.file}\` | ${f.lineNumber} | ${f.message} |`
            );
        }
        lines.push("");
    }

    // ─── Write to Generated Columns ───
    const genFindings = findings.filter((f) => f.category === "WRITE_TO_GENERATED");
    if (genFindings.length > 0) {
        lines.push("## ERRORS: Writes to Generated Columns");
        lines.push("");
        lines.push(
            "These mutations attempt to write to `GENERATED ALWAYS AS` columns, which will fail."
        );
        lines.push("");
        lines.push("| Table | Column | File | Line |");
        lines.push("|-------|--------|------|------|");
        for (const f of genFindings) {
            lines.push(`| \`${f.table}\` | \`${f.column}\` | \`${f.file}\` | ${f.lineNumber} |`);
        }
        lines.push("");
    }

    // ─── Missing Join Tables ───
    const joinFindings = findings.filter((f) => f.category === "MISSING_JOIN_TABLE");
    if (joinFindings.length > 0) {
        lines.push("## ERRORS: Missing Join Tables");
        lines.push("");
        lines.push("Foreign table references in `.select()` that don't exist in the schema.");
        lines.push("");
        lines.push("| Parent Table | Join Table | File | Line |");
        lines.push("|-------------|-----------|------|------|");
        const seen = new Set<string>();
        for (const f of joinFindings) {
            const key = `${f.table}:${f.column}:${f.file}`;
            if (seen.has(key)) continue;
            seen.add(key);
            lines.push(`| \`${f.table}\` | \`${f.column}\` | \`${f.file}\` | ${f.lineNumber} |`);
        }
        lines.push("");
    }

    // ─── Full Table Inventory ───
    lines.push("## Appendix A: Complete Table Inventory");
    lines.push("");
    lines.push("| # | Table | Columns | Migration | Queried? | View? |");
    lines.push("|---|-------|---------|-----------|----------|-------|");
    let idx = 0;
    for (const [name, table] of [...schema.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
        idx++;
        const queried = queriedTables.has(name) ? "Yes" : "No";
        const isView = table.isView ? "Yes" : "No";
        lines.push(
            `| ${idx} | \`${name}\` | ${table.columns.size} | ${table.migration} | ${queried} | ${isView} |`
        );
    }
    lines.push("");

    // ─── Query Coverage by Table ───
    lines.push("## Appendix B: Query Coverage by Table");
    lines.push("");
    lines.push("| Table | select | insert | update | upsert | delete | Total |");
    lines.push("|-------|--------|--------|--------|--------|--------|-------|");
    const tableCounts = new Map<
        string,
        { select: number; insert: number; update: number; upsert: number; delete: number }
    >();
    for (const u of usages) {
        if (!tableCounts.has(u.table)) {
            tableCounts.set(u.table, {
                select: 0,
                insert: 0,
                update: 0,
                upsert: 0,
                delete: 0,
            });
        }
        const counts = tableCounts.get(u.table)!;
        if (u.operation === "select" || u.operation === "count") counts.select++;
        else if (u.operation === "insert") counts.insert++;
        else if (u.operation === "update") counts.update++;
        else if (u.operation === "upsert") counts.upsert++;
        else if (u.operation === "delete") counts.delete++;
    }
    for (const [name, counts] of [...tableCounts.entries()].sort((a, b) =>
        a[0].localeCompare(b[0])
    )) {
        const total = counts.select + counts.insert + counts.update + counts.upsert + counts.delete;
        lines.push(
            `| \`${name}\` | ${counts.select} | ${counts.insert} | ${counts.update} | ${counts.upsert} | ${counts.delete} | ${total} |`
        );
    }
    lines.push("");

    // ─── Verdict ───
    lines.push("## Verdict");
    lines.push("");
    if (errorCount === 0) {
        lines.push("**PASS** — All queried tables and columns match the schema. 0 errors found.");
    } else {
        lines.push(`**FAIL** — ${errorCount} error(s) found. See sections above for details.`);
    }
    lines.push("");

    return lines.join("\n");
}

// ─── Main ───

function main(): void {
    console.log("🔍 Schema-to-API Column Audit");
    console.log("─".repeat(50));

    console.log("\n📂 Parsing migration files...");
    const schema = parseMigrations();
    console.log(
        `   Found ${schema.size} tables/views across ${
            fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).length
        } migration files`
    );
    console.log(
        `   Total columns: ${[...schema.values()].reduce((s, t) => s + t.columns.size, 0)}`
    );

    console.log("\n📄 Scanning source files for Supabase queries...");
    const usages = scanSourceFiles();
    console.log(`   Found ${usages.length} .from() call sites`);
    console.log(`   Unique tables queried: ${new Set(usages.map((u) => u.table)).size}`);

    console.log("\n🔀 Cross-referencing schema vs queries...");
    const findings = crossReference(schema, usages);
    const errors = findings.filter((f) => f.severity === "ERROR");
    const warnings = findings.filter((f) => f.severity === "WARNING");

    if (errors.length === 0) {
        console.log("   ✅ No errors found!");
    } else {
        console.log(`   ❌ ${errors.length} error(s) found`);
    }
    if (warnings.length > 0) {
        console.log(`   ⚠️  ${warnings.length} warning(s)`);
    }

    console.log("\n📝 Generating report...");
    const report = generateReport(schema, usages, findings);
    const reportPath = path.join(ROOT, "docs", "SCHEMA_API_AUDIT_REPORT.md");
    fs.writeFileSync(reportPath, report, "utf-8");
    console.log(`   Report written to: ${reportPath}`);

    // Also print findings to console
    if (errors.length > 0) {
        console.log("\n" + "═".repeat(50));
        console.log("ERRORS:");
        console.log("═".repeat(50));
        for (const f of errors) {
            console.log(`  ❌ [${f.category}] ${f.table}${f.column ? "." + f.column : ""}`);
            console.log(`     ${f.file}:${f.lineNumber}`);
            console.log(`     ${f.message}`);
            console.log("");
        }
    }

    // Exit with error code if issues found
    process.exit(errors.length > 0 ? 1 : 0);
}

main();
