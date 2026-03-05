#!/usr/bin/env npx tsx
/* eslint-disable no-console */
/**
 * AST-based Mock Data Migration Script using ts-morph
 *
 * Safely transforms all isSupabaseConfigured patterns in page files.
 */

import { Node, Project, SourceFile, SyntaxKind, ts } from "ts-morph";
import * as path from "path";
import { execSync } from "child_process";

const ROOT = path.resolve(__dirname, "..");

function getAffectedFiles(): string[] {
    try {
        const result = execSync(
            `grep -rln "isSupabaseConfigured" src/app/ --include="*.tsx" --include="*.ts"`,
            { encoding: "utf-8", cwd: ROOT }
        );
        return result
            .trim()
            .split("\n")
            .filter(Boolean)
            .filter((f) => !f.includes("api/health"))
            .map((f) => path.join(ROOT, f));
    } catch {
        return [];
    }
}

function migrateFile(sourceFile: SourceFile): string[] {
    const changes: string[] = [];
    let iterations = 0;

    // ─── Pass 1: Remove isSupabaseConfigured from named imports ───
    for (const importDecl of sourceFile.getImportDeclarations()) {
        const moduleSpec = importDecl.getModuleSpecifierValue();
        if (!moduleSpec.includes("supabase")) continue;
        const namedImports = importDecl.getNamedImports();
        const isc = namedImports.find((ni) => ni.getName() === "isSupabaseConfigured");
        if (isc) {
            if (namedImports.length === 1) {
                importDecl.remove();
                changes.push("Removed isSupabaseConfigured-only import");
            } else {
                isc.remove();
                changes.push("Removed isSupabaseConfigured from import");
            }
        }
    }

    // ─── Pass 2: Iteratively resolve all isSupabaseConfigured usages ───
    while (iterations < 100) {
        iterations++;
        const refs = sourceFile
            .getDescendantsOfKind(SyntaxKind.Identifier)
            .filter((id) => id.getText() === "isSupabaseConfigured");
        if (refs.length === 0) break;

        const ref = refs[0]!;
        const parent = ref.getParent();
        if (!parent) {
            ref.replaceWithText("true");
            changes.push("Replaced orphan ref");
            continue;
        }

        // ─── void isSupabaseConfigured; ───
        if (Node.isVoidExpression(parent)) {
            const exprStmt = parent.getParent();
            if (exprStmt && Node.isExpressionStatement(exprStmt)) {
                exprStmt.remove();
                changes.push("Removed void isSupabaseConfigured");
                continue;
            }
        }

        // ─── !isSupabaseConfigured ───
        if (
            Node.isPrefixUnaryExpression(parent) &&
            parent.getOperatorToken() === ts.SyntaxKind.ExclamationToken
        ) {
            const gp = parent.getParent();

            // if (!isSupabaseConfigured) { ... } or if (!isSupabaseConfigured) return;
            if (gp && Node.isIfStatement(gp) && gp.getExpression() === parent) {
                gp.remove();
                changes.push("Removed if (!isSupabaseConfigured) block");
                continue;
            }

            // X || !isSupabaseConfigured or !isSupabaseConfigured || X
            if (gp && Node.isBinaryExpression(gp)) {
                const op = gp.getOperatorToken().getText();
                if (op === "||") {
                    const left = gp.getLeft();
                    const right = gp.getRight();
                    const other = left === parent ? right : left;
                    gp.replaceWithText(other.getText());
                    changes.push("Removed !isSupabaseConfigured from || condition");
                    continue;
                }
            }

            parent.replaceWithText("false");
            changes.push("Replaced !isSupabaseConfigured with false");
            continue;
        }

        // ─── isSupabaseConfigured && X ───
        if (Node.isBinaryExpression(parent) && parent.getOperatorToken().getText() === "&&") {
            const left = parent.getLeft();
            const right = parent.getRight();
            const isOnLeft =
                left === ref ||
                (Node.isIdentifier(left) && left.getText() === "isSupabaseConfigured");
            const isOnRight =
                right === ref ||
                (Node.isIdentifier(right) && right.getText() === "isSupabaseConfigured");

            if (isOnLeft) {
                const gp = parent.getParent();
                const rightText = right.getText();

                // Ternary: isSupabaseConfigured && X ? trueExpr : falseExpr
                if (gp && Node.isConditionalExpression(gp) && gp.getCondition() === parent) {
                    const trueText = gp.getWhenTrue().getText();
                    const falseText = gp.getWhenFalse().getText();
                    const varName = rightText.trim();

                    if (trueText.includes(`${varName}.map(`)) {
                        // Pattern: sbX.map(row => ({...})) — wrap with ?? []
                        const newTrue = trueText.replace(
                            `${varName}.map(`,
                            `(${varName} ?? []).map(`
                        );
                        gp.replaceWithText(newTrue);
                        changes.push(`Ternary → (${varName} ?? []).map(...)`);
                    } else if (trueText.includes(" as unknown as ")) {
                        // Pattern: (sbX as unknown as Type) — keep cast, add ?? fallback
                        // Replace condition with just varName, keep ternary structure
                        gp.replaceWithText(
                            `${varName}\n        ? ${trueText}\n        : ${falseText}`
                        );
                        changes.push(`Cast ternary → ${varName} ? cast : fallback`);
                    } else if (trueText.startsWith("{")) {
                        // Object literal transform — keep structure
                        gp.replaceWithText(`${varName}\n        ? ${trueText}\n        : null`);
                        changes.push(`Object ternary → ${varName} ? {...} : null`);
                    } else if (trueText.trim() === varName) {
                        // Simple identity: sbX ? sbX : MOCK → sbX ?? MOCK
                        gp.replaceWithText(`${varName} ?? ${falseText}`);
                        changes.push(`Simple ternary → ${varName} ?? fallback`);
                    } else {
                        // Unknown pattern — simplify condition only
                        gp.replaceWithText(
                            `${varName}\n        ? ${trueText}\n        : ${falseText}`
                        );
                        changes.push(`Ternary → ${varName} ? true : false`);
                    }
                    continue;
                }

                // if (isSupabaseConfigured && X) { body }
                if (gp && Node.isIfStatement(gp) && gp.getExpression() === parent) {
                    // Replace condition with just X
                    parent.replaceWithText(rightText);
                    changes.push("Simplified if (isSupabaseConfigured && X)");
                    continue;
                }

                // General: isSupabaseConfigured && expr → expr
                parent.replaceWithText(rightText);
                changes.push(`Replaced && guard → ${rightText.slice(0, 30)}`);
                continue;
            }

            if (isOnRight) {
                parent.replaceWithText(left.getText());
                changes.push("Removed trailing && isSupabaseConfigured");
                continue;
            }
        }

        // ─── if (isSupabaseConfigured) { body } ───
        if (Node.isIfStatement(parent) && parent.getExpression() === ref) {
            const thenStmt = parent.getThenStatement();
            if (Node.isBlock(thenStmt)) {
                const stmts = thenStmt.getStatements().map((s) => s.getText());
                parent.replaceWithText(stmts.join("\n"));
                changes.push("Unwrapped if (isSupabaseConfigured) block");
            } else {
                parent.replaceWithText(thenStmt.getText());
                changes.push("Unwrapped if (isSupabaseConfigured) statement");
            }
            continue;
        }

        // Fallback
        ref.replaceWithText("true");
        changes.push("Replaced isSupabaseConfigured → true (fallback)");
    }

    // ─── Pass 3: Remove demo-data imports if no MOCK_ / DEMO_ refs in code body ───
    const text = sourceFile.getFullText();
    const codeOnly = text.replace(/^import\s+[^\n]+\n/gm, "");
    const hasMock = /\b(?:MOCK_|DEMO_)\w+/.test(codeOnly);
    if (!hasMock) {
        for (const imp of sourceFile.getImportDeclarations()) {
            if (imp.getModuleSpecifierValue().includes("demo-data")) {
                imp.remove();
                changes.push("Removed unused demo-data import");
            }
        }
    }

    if (changes.length > 0) {
        sourceFile.saveSync();
    }
    return changes;
}

// ─── Main ───
const files = getAffectedFiles();
console.log(`Found ${files.length} files with isSupabaseConfigured\n`);

const project = new Project({
    tsConfigFilePath: path.join(ROOT, "tsconfig.json"),
    skipAddingFilesFromTsConfig: true,
});

let totalMigrated = 0;

for (const file of files) {
    const relPath = path.relative(ROOT, file);
    try {
        const sourceFile = project.addSourceFileAtPath(file);
        const changes = migrateFile(sourceFile);
        if (changes.length > 0) {
            totalMigrated++;
            console.log(`✓ ${relPath} (${changes.length} changes)`);
            for (const c of changes) console.log(`    ${c}`);
        }
    } catch (err) {
        console.error(`✗ ${relPath}: ${err}`);
    }
}

console.log(`\nMigrated: ${totalMigrated}/${files.length} files`);

// Verification
console.log(`\n─── Verification ───`);
try {
    const r1 = execSync(
        `grep -rn "isSupabaseConfigured" src/app/ --include="*.tsx" --include="*.ts" | grep -v api/health | wc -l`,
        { encoding: "utf-8", cwd: ROOT }
    );
    console.log(`isSupabaseConfigured refs in pages: ${r1.trim()}`);
} catch {
    console.log("isSupabaseConfigured refs: 0");
}
try {
    const r2 = execSync(
        `grep -rn "import.*demo-data" src/app/ --include="*.tsx" --include="*.ts" | wc -l`,
        { encoding: "utf-8", cwd: ROOT }
    );
    console.log(`demo-data imports remaining: ${r2.trim()}`);
} catch {
    console.log("demo-data imports: 0");
}

console.log("\nRunning tsc...");
try {
    execSync("npx tsc --noEmit 2>&1", { encoding: "utf-8", cwd: ROOT });
    console.log("✓ TypeScript clean");
} catch (err) {
    const output = (err as { stdout?: string }).stdout ?? String(err);
    const lines = output.split("\n").filter((l: string) => l.includes("error TS"));
    console.log(`✗ ${lines.length} TypeScript errors:`);
    for (const l of lines.slice(0, 20)) console.log(`  ${l}`);
    if (lines.length > 20) console.log(`  ... and ${lines.length - 20} more`);
}
