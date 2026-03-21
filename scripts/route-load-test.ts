#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Route Load-Time Test
 *
 * Hits every static dashboard route via curl and measures total response time.
 * Uses curl subprocess for reliable IPv4/IPv6 handling.
 *
 * Usage:
 *   npx tsx scripts/route-load-test.ts [--base-url=http://localhost:3000] [--threshold=1000]
 */

import { execFileSync } from "child_process";

const THRESHOLD_MS = parseInt(
    process.argv.find((a) => a.startsWith("--threshold="))?.split("=")[1] ?? "1000",
    10
);
const BASE_URL =
    process.argv.find((a) => a.startsWith("--base-url="))?.split("=")[1] ?? "http://localhost:3000";

// ─── All static dashboard routes (no [id] dynamic segments) ───
const STATIC_ROUTES: string[] = [
    "/",
    "/login",
    "/signup",
    "/forgot-password",
    "/dashboard",
    "/messages",
    "/home/tasks",
    "/home/documents",
    "/calendar",
    "/notifications",
    "/reports",
    "/dashboards",
    "/forecasting",
    "/saved-views",
    "/reports/ai",
    "/scenarios",
    "/report-definitions",
    "/pipeline",
    "/leads",
    "/opportunities",
    "/deals",
    "/proposals",
    "/estimates",
    "/change-orders",
    "/upsell-events",
    "/upsell-triggers",
    "/lost-reasons",
    "/accounts",
    "/companies",
    "/stakeholders",
    "/contacts",
    "/projects",
    "/scopes-of-work",
    "/events",
    "/activations",
    "/tasks",
    "/scheduling",
    "/boms",
    "/locations",
    "/advancing",
    "/advancing/catalog",
    "/advancing/new",
    "/advancing/queue",
    "/advancing/fulfillment",
    "/advancing/inventory",
    "/advancing/templates",
    "/advancing/reports",
    "/advance-status-history",
    "/approvals",
    "/approval-workflows",
    "/checklists",
    "/checklist-templates",
    "/service-requests",
    "/service-requests/sla",
    "/sla-definitions",
    "/workflows",
    "/automations",
    "/quality-checks",
    "/quality-check-templates",
    "/qc-gates",
    "/documents",
    "/call-sheets",
    "/tech-sheets",
    "/templates",
    "/email-messages",
    "/resilience-targets",
    "/crew",
    "/shifts",
    "/crew-availability",
    "/resource-planner",
    "/time-tracking",
    "/time-entries",
    "/timesheets",
    "/time-tracking/compliance",
    "/time-off",
    "/time-off-requests",
    "/certifications",
    "/workforce",
    "/workforce/onboarding",
    "/workforce/reviews",
    "/workforce/goals",
    "/vendors",
    "/vendor-onboarding",
    "/vendor-compliance",
    "/work-orders",
    "/vendor-reviews",
    "/assets",
    "/assets/scan",
    "/assets/scan/batch",
    "/assets/new",
    "/transfer-orders",
    "/maintenance-schedules",
    "/inventory",
    "/warehouses",
    "/fleet",
    "/dispatch",
    "/shipments",
    "/purchase-orders",
    "/expense-reports",
    "/briefs",
    "/brand-kit",
    "/brand-guidelines",
    "/creative-assets",
    "/digital-assets",
    "/creative-reviews",
    "/decks",
    "/campaigns",
    "/case-studies",
    "/surveys",
    "/testimonials",
    "/finance",
    "/revenue",
    "/invoices",
    "/invoices/new",
    "/client-invoices",
    "/payments",
    "/recurring-invoices",
    "/credit-notes",
    "/expenses",
    "/budgets",
    "/milestones",
    "/job-costing",
    "/rate-cards",
    "/finance/revenue-recognition",
    "/payroll-batches",
    "/procurement",
    "/purchase-requisitions",
    "/goods-receipts",
    "/vendor-risk",
    "/gl-accounts",
    "/budget-approvals",
    "/payment-approvals",
    "/financial-periods",
    "/contracts",
    "/contracts/new",
    "/obligations",
    "/permits",
    "/insurance-policies",
    "/ip-rights",
    "/incidents",
    "/compliance-checklists",
    "/engineering-approvals",
    "/clause-library",
    "/user-management",
    "/user-management/invitations",
    "/user-management/access-reviews",
    "/user-management/audit-log",
    "/roles",
    "/teams",
    "/org-chart",
    "/people",
    "/knowledge-base",
    "/knowledge-base/collaborative",
    "/sops",
    "/vault",
    "/settings",
    "/settings/security",
    "/settings/notifications",
    "/settings/email-integration",
    "/settings/custom-fields",
    "/settings/ai",
    "/settings/developer",
    "/settings/org-security",
    "/tags",
    "/integrations",
    "/integrations/sync-log",
    "/integrations/marketplace",
    "/credentials",
    "/credentials/assignments",
    "/client-portal",
    "/vendor-portal",
    "/system-health",
    "/data-export",
    "/live-ops",
    "/live-ops/run-of-show",
    "/live-ops/readiness",
    "/live-ops/departments",
    "/live-ops/crew",
    "/live-ops/equipment",
    "/live-ops/comms",
    "/live-ops/foh",
    "/live-ops/credentials",
    "/live-ops/gate",
    "/live-ops/vip",
    "/live-ops/guest-incidents",
    "/live-ops/environment",
    "/live-ops/financials",
    "/live-ops/strike",
    "/live-ops/reconciliation",
    "/live-ops/reports",
    "/onboarding/org-setup",
    "/onboarding/invite-team",
    "/onboarding/billing",
    "/onboarding/claim-username",
    "/onboarding/complete",
    "/access-audit-log",
    "/account-health-scores",
    "/activity-log",
    "/approval-steps",
    "/asset-assignments",
    "/asset-tags",
    "/asset-versions",
    "/automation-executions",
    "/automation-logs",
    "/automation-rules",
    "/brand-guideline-sections",
    "/brands",
    "/brief-templates",
    "/budget-line-items",
    "/campaign-assets",
    "/campaign-channels",
    "/campaign-kpis",
    "/catalog-categories",
    "/catalog-items",
    "/channel-templates",
    "/comm-channels",
    "/command-positions",
    "/compliance",
    "/compliance-requirements",
    "/compliance-templates",
    "/consumable-usage",
    "/consumables",
    "/contract-amendments",
    "/contract-obligations",
    "/credential-assignments",
    "/credential-inventory-pools",
    "/credential-types",
    "/crew-shifts",
    "/custom-field-definitions",
    "/dashboard-widgets",
    "/data-export-requests",
    "/depreciation-schedules",
    "/document-templates",
    "/document-versions",
    "/e-signatures",
    "/engagement-terms",
    "/environmental-readings",
    "/equipment-check-ins",
    "/feature-flags",
    "/foh-zone-readings",
    "/foh-zones",
    "/insurance-requirements",
    "/inventory-audits",
    "/inventory-reservations",
    "/invoice-templates",
    "/job-cost-entries",
    "/kits",
    "/legal-holds",
    "/live-crew-assignments",
    "/live-event-instances",
    "/live-financial-snapshots",
    "/load-plans",
    "/logistics-events",
    "/maintenance-records",
    "/organizations",
    "/pipeline/new",
    "/pos-transactions",
    "/post-event-reports",
    "/production-advance-items",
    "/production-budget-lines",
    "/production-checklists",
    "/production-expenses",
    "/production-milestones",
    "/production-runs",
    "/production-sops",
    "/production-tasks",
    "/production-time-entries",
    "/production-verticals",
    "/project-assignments",
    "/project-templates",
    "/projects/new",
    "/projects/templates",
    "/proposals/new",
    "/provider-connections",
    "/readiness-gates",
    "/resource-bookings",
    "/revenue-recognition-entries",
    "/revenue-schedules",
    "/review-cycles",
    "/reviews",
    "/rfqs",
    "/risk-assessments",
    "/role-change-log",
    "/ros-cues",
    "/scan-events",
    "/schedule-entries",
    "/service-health-checks",
    "/sla-policies",
    "/sla-tracking",
    "/space-bookings",
    "/stakeholder-projects",
    "/strike-sequences",
    "/survey-responses",
    "/survey-templates",
    "/sync-events",
    "/technical-specs",
    "/temporary-access-grants",
    "/vault-documents",
    "/vendor-communications",
    "/vendor-compliance-documents",
    "/vip-service-requests",
    "/work-packages",
    "/worker-classifications",
    "/worker-compliance-docs",
    "/worker-offboarding-runs",
    "/worker-onboarding-runs",
    "/worker-profiles",
    "/worker-reviews",
];

interface RouteResult {
    route: string;
    status: number;
    timeMs: number;
    error: string | null;
}

function testRoute(route: string): RouteResult {
    const url = `${BASE_URL}${route}`;
    try {
        // curl -w outputs timing + status, -o /dev/null discards body, -s silent, -L follows redirects
        const output = execFileSync("curl", [
            "-s", "-o", "/dev/null",
            "-L",
            "-w", "%{http_code}|%{time_total}",
            "--max-time", "10",
            "-H", "Accept: text/html",
            url,
        ], { encoding: "utf-8", timeout: 15_000 });

        const [statusStr, timeStr] = output.trim().split("|");
        const status = parseInt(statusStr ?? "0", 10);
        const timeMs = Math.round(parseFloat(timeStr ?? "0") * 1000);

        return { route, status, timeMs, error: null };
    } catch (err) {
        return {
            route,
            status: 0,
            timeMs: 10000,
            error: err instanceof Error ? err.message.slice(0, 80) : String(err),
        };
    }
}

function main() {
    const total = STATIC_ROUTES.length;
    console.log("╔══════════════════════════════════════════════════════════════╗");
    console.log("║           ROUTE LOAD-TIME VALIDATION TEST                   ║");
    console.log("╠══════════════════════════════════════════════════════════════╣");
    console.log(`║  Base URL:     ${BASE_URL.padEnd(44)}║`);
    console.log(`║  Threshold:    ${(THRESHOLD_MS + "ms").padEnd(44)}║`);
    console.log(`║  Total Routes: ${String(total).padEnd(44)}║`);
    console.log("╚══════════════════════════════════════════════════════════════╝\n");

    // Warm-up
    console.log("⏳ Warming up dev server...");
    const warmup = testRoute("/");
    if (warmup.error) {
        console.error("❌ Cannot reach dev server at " + BASE_URL);
        console.error("   " + warmup.error);
        console.error("   Start the dev server first: npm run dev");
        process.exit(1);
    }
    console.log(`✅ Dev server responded in ${warmup.timeMs}ms\n`);

    console.log(`🚀 Testing ${total} routes (sequential for accurate timing)...\n`);

    const results: RouteResult[] = [];

    for (let i = 0; i < total; i++) {
        const route = STATIC_ROUTES[i]!;
        const result = testRoute(route);
        results.push(result);

        const icon = result.error ? "💥" : result.timeMs > THRESHOLD_MS ? "🐌" : "✅";
        const errSuffix = result.error ? ` [ERR]` : "";
        console.log(
            `  ${icon} [${String(i + 1).padStart(3)}/${total}] ${String(result.timeMs).padStart(5)}ms  ${String(result.status).padStart(3)}  ${result.route}${errSuffix}`
        );
    }

    // Sort by time descending
    results.sort((a, b) => b.timeMs - a.timeMs);

    // ─── Summary ───
    const failures = results.filter((r) => r.timeMs > THRESHOLD_MS && !r.error);
    const errors = results.filter((r) => r.error);
    const notFound = results.filter((r) => r.status === 404);
    const serverErrors = results.filter((r) => r.status >= 500);
    const passed = results.filter((r) => !r.error && r.status < 500 && r.timeMs <= THRESHOLD_MS);

    const times = results.filter((r) => !r.error).map((r) => r.timeMs);
    const avgTime = times.length ? Math.round(times.reduce((s, t) => s + t, 0) / times.length) : 0;
    const sortedTimes = [...times].sort((a, b) => a - b);
    const medianTime = sortedTimes[Math.floor(sortedTimes.length / 2)] ?? 0;
    const p95Time = sortedTimes[Math.floor(sortedTimes.length * 0.95)] ?? 0;
    const maxTime = sortedTimes[sortedTimes.length - 1] ?? 0;
    const minTime = sortedTimes[0] ?? 0;

    console.log("\n" + "═".repeat(80));
    console.log("  RESULTS SUMMARY");
    console.log("═".repeat(80));
    console.log(`  Total Routes Tested:  ${results.length}`);
    console.log(`  ✅ Passed (≤${THRESHOLD_MS}ms):  ${passed.length}`);
    console.log(`  🐌 Slow (>${THRESHOLD_MS}ms):     ${failures.length}`);
    console.log(`  💥 Errors:             ${errors.length}`);
    console.log(`  🔍 404 Not Found:      ${notFound.length}`);
    console.log(`  🔥 500+ Server Error:  ${serverErrors.length}`);
    console.log("─".repeat(80));
    console.log(`  Min:    ${minTime}ms`);
    console.log(`  Avg:    ${avgTime}ms`);
    console.log(`  Median: ${medianTime}ms`);
    console.log(`  P95:    ${p95Time}ms`);
    console.log(`  Max:    ${maxTime}ms`);
    console.log("═".repeat(80));

    if (failures.length > 0) {
        console.log(`\n🐌 ROUTES EXCEEDING ${THRESHOLD_MS}ms THRESHOLD:`);
        console.log("─".repeat(80));
        for (const f of failures) {
            console.log(`  ${String(f.timeMs).padStart(5)}ms  ${String(f.status).padStart(3)}  ${f.route}`);
        }
    }

    if (errors.length > 0) {
        console.log("\n💥 ROUTES WITH ERRORS:");
        console.log("─".repeat(80));
        for (const e of errors) {
            console.log(`  ${e.route}: ${e.error}`);
        }
    }

    if (notFound.length > 0) {
        console.log("\n🔍 404 NOT FOUND:");
        console.log("─".repeat(80));
        for (const n of notFound) {
            console.log(`  ${n.route}`);
        }
    }

    if (serverErrors.length > 0) {
        console.log("\n🔥 500+ SERVER ERRORS:");
        console.log("─".repeat(80));
        for (const s of serverErrors) {
            console.log(`  ${s.status}  ${s.route}`);
        }
    }

    // Top 20 slowest
    console.log("\n📊 TOP 20 SLOWEST ROUTES:");
    console.log("─".repeat(80));
    for (const r of results.slice(0, 20)) {
        const icon = r.timeMs > THRESHOLD_MS ? "🐌" : r.error ? "💥" : "✅";
        console.log(`  ${icon} ${String(r.timeMs).padStart(5)}ms  ${String(r.status).padStart(3)}  ${r.route}`);
    }

    // Exit code
    const totalFailures = failures.length + errors.length + serverErrors.length;
    if (totalFailures > 0) {
        console.log(`\n❌ ${totalFailures} route(s) failed validation.`);
        process.exit(1);
    } else {
        console.log(`\n✅ All ${results.length} routes loaded within ${THRESHOLD_MS}ms threshold.`);
        process.exit(0);
    }
}

main();
