#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Exhaustive Page Load & Health Test
 *
 * Tests EVERY page in the FrozenPhoenix codebase (382 routes).
 * For each page, records: HTTP status, response time, body size,
 * whether the HTML contains a React root (proof of render), and
 * whether the response contains an error boundary or Next.js
 * error page. Results written to a structured report file.
 *
 * Usage:  node scripts/measure-page-load.mjs [--base http://localhost:3000]
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const BASE = process.argv.includes("--base")
    ? process.argv[process.argv.indexOf("--base") + 1]
    : "http://localhost:3000";

const CONCURRENCY = 4;
const TIMEOUT_MS = 30_000;
const REPORT_PATH = resolve("scripts", "page-load-report.txt");

// ─── Every route in src/app — extracted from filesystem ───────
// Dynamic segments use a test placeholder ID.
const TEST_ID = "00000000-0000-0000-0000-000000000001";
const TEST_TOKEN = "test-token-placeholder";
const TEST_SLUG = "test-org";
const TEST_USERNAME = "testuser";

const ALL_ROUTES = [
    // ─── Root / Public / Auth ──────────────────────────────────
    "",                                          // root page
    "login",
    "signup",
    "forgot-password",
    "legal/privacy",
    "legal/terms",
    `invite/${TEST_TOKEN}`,
    `sign/${TEST_TOKEN}`,
    `portal/${TEST_TOKEN}`,
    `u/${TEST_USERNAME}`,
    `org/${TEST_SLUG}`,
    "auth/mfa-setup",
    "auth/mfa-verify",
    "auth/reset-password",

    // ─── Onboarding ────────────────────────────────────────────
    "onboarding/org-setup",
    "onboarding/invite-team",
    "onboarding/billing",
    "onboarding/claim-username",
    "onboarding/complete",

    // ─── Dashboard: List pages (alphabetical) ──────────────────
    "access-audit-log",
    "account-health-scores",
    "accounts",
    "activations",
    "activity-log",
    "advance-status-history",
    "advancing",
    "advancing/catalog",
    "advancing/fulfillment",
    "advancing/inventory",
    "advancing/new",
    "advancing/queue",
    "advancing/reports",
    "advancing/templates",
    "approval-steps",
    "approval-workflows",
    "approvals",
    "asset-assignments",
    "asset-tags",
    "asset-versions",
    "assets",
    "assets/new",
    "assets/scan",
    "assets/scan/batch",
    "automation-executions",
    "automation-logs",
    "automation-rules",
    "automations",
    "boms",
    "brand-guideline-sections",
    "brand-guidelines",
    "brand-kit",
    "brands",
    "brief-templates",
    "briefs",
    "budget-approvals",
    "budget-line-items",
    "budgets",
    "calendar",
    "call-sheets",
    "campaign-assets",
    "campaign-channels",
    "campaign-kpis",
    "campaigns",
    "case-studies",
    "catalog-categories",
    "catalog-items",
    "certifications",
    "change-orders",
    "channel-templates",
    "checklist-templates",
    "checklists",
    "clause-library",
    "client-invoices",
    "client-portal",
    "comm-channels",
    "command-positions",
    "companies",
    "compliance",
    "compliance-checklists",
    "compliance-requirements",
    "compliance-templates",
    "consumable-usage",
    "consumables",
    "contacts",
    "contract-amendments",
    "contract-obligations",
    "contracts",
    "contracts/new",
    "creative-assets",
    "creative-reviews",
    "credential-assignments",
    "credential-inventory-pools",
    "credential-types",
    "credentials",
    "credentials/assignments",
    "credit-notes",
    "crew",
    "crew-availability",
    "crew-shifts",
    "crew/new",
    "custom-field-definitions",
    "dashboard",
    "dashboard-widgets",
    "dashboards",
    "data-export",
    "data-export-requests",
    "deals",
    "decks",
    "depreciation-schedules",
    "digital-assets",
    "dispatch",
    "document-templates",
    "document-versions",
    "documents",
    "e-signatures",
    "email-messages",
    "engagement-terms",
    "engineering-approvals",
    "environmental-readings",
    "equipment-check-ins",
    "estimates",
    "events",
    "expense-reports",
    "expenses",
    "feature-flags",
    "finance",
    "finance/revenue-recognition",
    "financial-periods",
    "fleet",
    "foh-zone-readings",
    "foh-zones",
    "forecasting",
    "gl-accounts",
    "goods-receipts",
    "home/documents",
    "home/tasks",
    "incidents",
    "insurance-policies",
    "insurance-requirements",
    "integrations",
    "integrations/marketplace",
    "integrations/sync-log",
    "inventory",
    "inventory-audits",
    "inventory-reservations",
    "invoice-templates",
    "invoices",
    "invoices/new",
    "ip-rights",
    "job-cost-entries",
    "job-costing",
    "kits",
    "knowledge-base",
    "knowledge-base/collaborative",
    "leads",
    "legal-holds",
    "live-crew-assignments",
    "live-event-instances",
    "live-financial-snapshots",
    "live-ops",
    "live-ops/comms",
    "live-ops/credentials",
    "live-ops/crew",
    "live-ops/departments",
    "live-ops/environment",
    "live-ops/equipment",
    "live-ops/financials",
    "live-ops/foh",
    "live-ops/gate",
    "live-ops/guest-incidents",
    "live-ops/readiness",
    "live-ops/reconciliation",
    "live-ops/reports",
    "live-ops/run-of-show",
    "live-ops/strike",
    "live-ops/vip",
    "load-plans",
    "locations",
    "logistics-events",
    "lost-reasons",
    "maintenance-records",
    "maintenance-schedules",
    "messages",
    "milestones",
    "notifications",
    "obligations",
    "opportunities",
    "org-chart",
    "organizations",
    "payment-approvals",
    "payments",
    "payroll-batches",
    "people",
    "permits",
    "pipeline",
    "pipeline/new",
    "pos-transactions",
    "post-event-reports",
    "procurement",
    "production-advance-items",
    "production-budget-lines",
    "production-checklists",
    "production-expenses",
    "production-milestones",
    "production-runs",
    "production-sops",
    "production-tasks",
    "production-time-entries",
    "production-verticals",
    "project-assignments",
    "project-templates",
    "projects",
    "projects/new",
    "projects/templates",
    "proposals",
    "proposals/new",
    "provider-connections",
    "purchase-orders",
    "purchase-requisitions",
    "qc-gates",
    "quality-check-templates",
    "quality-checks",
    "rate-cards",
    "readiness-gates",
    "recurring-invoices",
    "rental-agreements",
    "report-definitions",
    "reports",
    "reports/ai",
    "resilience-targets",
    "resource-bookings",
    "resource-planner",
    "revenue",
    "revenue-recognition-entries",
    "revenue-schedules",
    "review-cycles",
    "reviews",
    "rfqs",
    "risk-assessments",
    "role-change-log",
    "roles",
    "ros-cues",
    "saved-views",
    "scan-events",
    "scenarios",
    "schedule-entries",
    "scheduling",
    "scopes-of-work",
    "service-health-checks",
    "service-requests",
    "service-requests/sla",
    "settings",
    "settings/ai",
    "settings/custom-fields",
    "settings/developer",
    "settings/email-integration",
    "settings/notifications",
    "settings/org-security",
    "settings/security",
    "shifts",
    "shipments",
    "sla-definitions",
    "sla-policies",
    "sla-tracking",
    "sops",
    "space-bookings",
    "stakeholder-projects",
    "stakeholders",
    "strike-sequences",
    "survey-responses",
    "survey-templates",
    "surveys",
    "sync-events",
    "system-health",
    "tags",
    "tasks",
    "teams",
    "tech-sheets",
    "technical-specs",
    "templates",
    "temporary-access-grants",
    "testimonials",
    "time-entries",
    "time-off",
    "time-off-requests",
    "time-tracking",
    "time-tracking/compliance",
    "time-tracking-policies",
    "timesheets",
    "transfer-orders",
    "upsell-events",
    "upsell-triggers",
    "user-management",
    "user-management/access-reviews",
    "user-management/audit-log",
    "user-management/invitations",
    "vault",
    "vault-documents",
    "vendor-communications",
    "vendor-compliance",
    "vendor-compliance-documents",
    "vendor-onboarding",
    "vendor-portal",
    "vendor-reviews",
    "vendor-risk",
    "vendors",
    "vendors/new",
    "vip-service-requests",
    "warehouses",
    "work-orders",
    "work-packages",
    "worker-classifications",
    "worker-compliance-docs",
    "worker-offboarding-runs",
    "worker-onboarding-runs",
    "worker-profiles",
    "worker-reviews",
    "workflows",
    "workforce",
    "workforce/goals",
    "workforce/onboarding",
    "workforce/reviews",

    // ─── Dashboard: Detail [id] pages ──────────────────────────
    `accounts/${TEST_ID}`,
    `activations/${TEST_ID}`,
    `advancing/${TEST_ID}`,
    `approval-workflows/${TEST_ID}`,
    `approvals/${TEST_ID}`,
    `assets/${TEST_ID}`,
    `automations/${TEST_ID}`,
    `brand-guidelines/${TEST_ID}`,
    `brand-kit/${TEST_ID}`,
    `briefs/${TEST_ID}`,
    `budgets/${TEST_ID}`,
    `call-sheets/${TEST_ID}`,
    `campaigns/${TEST_ID}`,
    `certifications/${TEST_ID}`,
    `change-orders/${TEST_ID}`,
    `client-invoices/${TEST_ID}`,
    `companies/${TEST_ID}`,
    `compliance-checklists/${TEST_ID}`,
    `contacts/${TEST_ID}`,
    `contracts/${TEST_ID}`,
    `creative-assets/${TEST_ID}`,
    `crew/${TEST_ID}`,
    `deals/${TEST_ID}`,
    `decks/${TEST_ID}`,
    `digital-assets/${TEST_ID}`,
    `dispatch/${TEST_ID}`,
    `documents/${TEST_ID}`,
    `estimates/${TEST_ID}`,
    `events/${TEST_ID}`,
    `expenses/${TEST_ID}`,
    `incidents/${TEST_ID}`,
    `insurance-policies/${TEST_ID}`,
    `integrations/${TEST_ID}`,
    `invoices/${TEST_ID}`,
    `knowledge-base/${TEST_ID}`,
    `leads/${TEST_ID}`,
    `live-ops/${TEST_ID}`,
    `locations/${TEST_ID}`,
    `opportunities/${TEST_ID}`,
    `people/${TEST_ID}`,
    `permits/${TEST_ID}`,
    `projects/${TEST_ID}`,
    `projects/${TEST_ID}/edit`,
    `proposals/${TEST_ID}`,
    `purchase-orders/${TEST_ID}`,
    `purchase-requisitions/${TEST_ID}`,
    `recurring-invoices/${TEST_ID}`,
    `scopes-of-work/${TEST_ID}`,
    `service-requests/${TEST_ID}`,
    `shipments/${TEST_ID}`,
    `tasks/${TEST_ID}`,
    `tech-sheets/${TEST_ID}`,
    `templates/${TEST_ID}`,
    `templates/${TEST_ID}/edit`,
    `vendor-reviews/${TEST_ID}`,
    `vendors/${TEST_ID}`,
    `work-orders/${TEST_ID}`,
    `workforce/${TEST_ID}`,
];

// ─── Measurement ──────────────────────────────────────────────

async function measureRoute(route) {
    const url = `${BASE}/${route}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const start = performance.now();
        const res = await fetch(url, {
            signal: controller.signal,
            headers: { Accept: "text/html" },
            redirect: "follow",
        });
        const html = await res.text();
        const elapsed = performance.now() - start;
        clearTimeout(timer);

        // Evidence checks
        const hasDoctype = html.toLowerCase().includes("<!doctype html");
        const hasReactRoot = html.includes("__next") || html.includes("__NEXT_DATA__");
        const hasErrorBoundary = html.includes("application-error") || html.includes("__next-error");
        const hasNextError = html.includes("Internal Server Error") || html.includes("NEXT_NOT_FOUND");
        const hasRuntimeError = html.includes("Unhandled Runtime Error");
        const redirectedToAuth = res.url.includes("/login") || res.url.includes("/auth/");

        const rendered = hasDoctype && hasReactRoot && !hasErrorBoundary && !hasNextError && !hasRuntimeError;

        return {
            route,
            url: res.url,
            status: res.status,
            timeMs: Math.round(elapsed),
            sizeKb: Math.round(html.length / 1024),
            ok: res.ok,
            rendered,
            redirectedToAuth,
            hasErrorBoundary,
            hasNextError,
            hasRuntimeError,
            evidence: {
                doctype: hasDoctype,
                reactRoot: hasReactRoot,
                errorBoundary: hasErrorBoundary,
                nextError: hasNextError,
                runtimeError: hasRuntimeError,
            },
        };
    } catch (err) {
        clearTimeout(timer);
        return {
            route,
            url,
            status: 0,
            timeMs: -1,
            sizeKb: 0,
            ok: false,
            rendered: false,
            redirectedToAuth: false,
            hasErrorBoundary: false,
            hasNextError: false,
            hasRuntimeError: false,
            error: err.name === "AbortError" ? "TIMEOUT" : err.message,
            evidence: {},
        };
    }
}

async function runBatch(routes, concurrency) {
    const results = [];
    const queue = [...routes];
    let done = 0;
    const total = routes.length;

    async function worker() {
        while (queue.length > 0) {
            const route = queue.shift();
            const result = await measureRoute(route);
            results.push(result);
            done++;
            const pct = ((done / total) * 100).toFixed(0).padStart(3);
            const icon = result.rendered ? "✅" : result.redirectedToAuth ? "🔒" : result.ok ? "⚠️ " : "❌";
            const timeStr = result.timeMs >= 0 ? `${result.timeMs}ms` : "ERR";
            process.stdout.write(
                `  [${pct}%] ${icon} /${route.padEnd(48)} ${timeStr.padStart(7)}  ${result.sizeKb}KB  HTTP ${result.status}\n`
            );
        }
    }

    const workers = Array.from({ length: concurrency }, () => worker());
    await Promise.all(workers);
    return results;
}

// ─── Report ───────────────────────────────────────────────────

function generateReport(results) {
    const lines = [];
    const now = new Date().toISOString();
    const sep = "═".repeat(100);

    lines.push(sep);
    lines.push(`  EXHAUSTIVE PAGE LOAD TEST REPORT — ${now}`);
    lines.push(`  Base URL: ${BASE}   Routes tested: ${results.length}`);
    lines.push(sep);
    lines.push("");

    // Categorize
    const rendered = results.filter((r) => r.rendered);
    const authRedirects = results.filter((r) => r.redirectedToAuth && !r.rendered);
    const errors = results.filter((r) => !r.rendered && !r.redirectedToAuth && (r.hasErrorBoundary || r.hasNextError || r.hasRuntimeError));
    const httpErrors = results.filter((r) => !r.ok && !r.redirectedToAuth);
    const networkErrors = results.filter((r) => r.error);

    lines.push("  SUMMARY");
    lines.push("  " + "─".repeat(50));
    lines.push(`  ✅ Rendered successfully:    ${rendered.length}`);
    lines.push(`  🔒 Auth redirect (expected): ${authRedirects.length}`);
    lines.push(`  ⚠️  React error boundary:     ${errors.length}`);
    lines.push(`  ❌ HTTP errors:               ${httpErrors.length}`);
    lines.push(`  � Network/timeout errors:    ${networkErrors.length}`);
    lines.push(`  ── Total:                    ${results.length}`);
    lines.push("");

    // Timing stats (for rendered + auth redirect pages, since both successfully responded)
    const respondedOk = results.filter((r) => r.ok);
    const times = respondedOk.map((r) => r.timeMs).sort((a, b) => a - b);
    if (times.length > 0) {
        const avg = Math.round(times.reduce((s, t) => s + t, 0) / times.length);
        const median = times[Math.floor(times.length / 2)];
        const p95 = times[Math.floor(times.length * 0.95)];
        const p99 = times[Math.floor(times.length * 0.99)];
        lines.push("  PERFORMANCE (all HTTP 200/3xx responses)");
        lines.push("  " + "─".repeat(50));
        lines.push(`  Min:      ${times[0]}ms`);
        lines.push(`  Median:   ${median}ms`);
        lines.push(`  Average:  ${avg}ms`);
        lines.push(`  P95:      ${p95}ms`);
        lines.push(`  P99:      ${p99}ms`);
        lines.push(`  Max:      ${times[times.length - 1]}ms`);
        lines.push("");

        const buckets = [
            { label: "< 100ms  (instant)", max: 100 },
            { label: "100-200ms (fast)", max: 200 },
            { label: "200-500ms (good)", max: 500 },
            { label: "500ms-1s (acceptable)", max: 1000 },
            { label: "1-2s (slow)", max: 2000 },
            { label: "2-5s (very slow)", max: 5000 },
            { label: "> 5s (critical)", max: Infinity },
        ];
        lines.push("  DISTRIBUTION");
        lines.push("  " + "─".repeat(50));
        for (const bucket of buckets) {
            const prevMax = buckets[buckets.indexOf(bucket) - 1]?.max ?? 0;
            const count = times.filter((t) => t > prevMax && t <= bucket.max).length;
            const bar = "█".repeat(Math.ceil((count / times.length) * 40));
            const pct = ((count / times.length) * 100).toFixed(1);
            lines.push(`    ${bucket.label.padEnd(28)} ${String(count).padStart(4)} (${pct.padStart(5)}%) ${bar}`);
        }
        lines.push("");
    }

    // ─── Per-page evidence ────────────────────────────────────
    lines.push(sep);
    lines.push("  EXPLICIT PER-PAGE EVIDENCE");
    lines.push(sep);
    lines.push("");
    lines.push(
        "  " +
        "STATUS".padEnd(7) +
        "TIME".padStart(8) +
        "SIZE".padStart(8) +
        "  " +
        "ROUTE".padEnd(52) +
        "EVIDENCE"
    );
    lines.push("  " + "─".repeat(95));

    // Sort: errors first, then auth redirects, then rendered (by time desc)
    const sorted = [...results].sort((a, b) => {
        const aScore = a.error ? 0 : !a.ok ? 1 : !a.rendered && !a.redirectedToAuth ? 2 : a.redirectedToAuth ? 3 : 4;
        const bScore = b.error ? 0 : !b.ok ? 1 : !b.rendered && !b.redirectedToAuth ? 2 : b.redirectedToAuth ? 3 : 4;
        if (aScore !== bScore) return aScore - bScore;
        return b.timeMs - a.timeMs;
    });

    for (const r of sorted) {
        let icon, evidence;
        if (r.error) {
            icon = "💥 ERR";
            evidence = r.error;
        } else if (!r.ok) {
            icon = `❌ ${r.status}`;
            evidence = `HTTP ${r.status}`;
        } else if (r.hasErrorBoundary || r.hasNextError || r.hasRuntimeError) {
            icon = "⚠️  ERR";
            const parts = [];
            if (r.evidence.errorBoundary) parts.push("error-boundary");
            if (r.evidence.nextError) parts.push("next-error");
            if (r.evidence.runtimeError) parts.push("runtime-error");
            evidence = parts.join(", ");
        } else if (r.redirectedToAuth) {
            icon = "🔒 AUTH";
            evidence = `redirect→${r.url.replace(BASE, "")}`;
        } else {
            icon = "✅ OK ";
            evidence = `doctype=${r.evidence.doctype} react=${r.evidence.reactRoot}`;
        }

        const timeStr = r.timeMs >= 0 ? `${r.timeMs}ms` : "---";
        const sizeStr = r.sizeKb > 0 ? `${r.sizeKb}KB` : "---";
        lines.push(
            "  " +
            icon.padEnd(7) +
            timeStr.padStart(8) +
            sizeStr.padStart(8) +
            "  " +
            `/${r.route}`.padEnd(52) +
            evidence
        );
    }

    lines.push("");
    lines.push(sep);

    // Verdict
    const brokenPages = results.filter(
        (r) => !r.rendered && !r.redirectedToAuth && !r.error
    );
    if (brokenPages.length === 0 && networkErrors.length === 0) {
        lines.push("  ✅ ALL PAGES PASS — No errors, no broken renders.");
    } else {
        if (brokenPages.length > 0) {
            lines.push(`  ⚠️  ${brokenPages.length} page(s) rendered with errors — review above.`);
        }
        if (networkErrors.length > 0) {
            lines.push(`  ❌ ${networkErrors.length} page(s) had network/timeout errors.`);
        }
    }
    lines.push(sep);
    lines.push("");

    return lines.join("\n");
}

// ─── Main ─────────────────────────────────────────────────────

async function main() {
    console.log(`\n📊 Exhaustive Page Test — ${ALL_ROUTES.length} routes`);
    console.log(`   Base: ${BASE}  Concurrency: ${CONCURRENCY}`);
    console.log(`   Report: ${REPORT_PATH}\n`);

    // Warm up
    console.log("⏳ Warming up dev server...");
    try {
        await fetch(`${BASE}/dashboard`, { headers: { Accept: "text/html" } });
        await fetch(`${BASE}/login`, { headers: { Accept: "text/html" } });
    } catch {
        console.error(`❌ Cannot reach ${BASE}. Is the dev server running?`);
        process.exit(1);
    }
    console.log("✅ Server is ready\n");

    console.log("🔄 Testing every page...\n");
    const results = await runBatch(ALL_ROUTES, CONCURRENCY);

    // Generate and write report
    const report = generateReport(results);
    writeFileSync(REPORT_PATH, report, "utf-8");

    // Print summary to console
    const rendered = results.filter((r) => r.rendered).length;
    const authRedir = results.filter((r) => r.redirectedToAuth && !r.rendered).length;
    const errored = results.filter((r) => !r.rendered && !r.redirectedToAuth).length;

    console.log("\n" + "═".repeat(60));
    console.log(`  ✅ Rendered:  ${rendered}   🔒 Auth redirect: ${authRedir}   ⚠️  Issues: ${errored}`);
    console.log(`  📄 Full report: ${REPORT_PATH}`);
    console.log("═".repeat(60) + "\n");
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
