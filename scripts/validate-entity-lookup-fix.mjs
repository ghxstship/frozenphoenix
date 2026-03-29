/**
 * Full-stack validation script for the entity-lookup lean-select fix.
 *
 * Tests scenarios against the live Supabase instance:
 *   1. Lean select (id, name) — what the fixed EntityLookupSelect uses
 *   2. Full join select — what was previously used
 *   3. Notifications unread-count pattern — without deleted_at (fix applied)
 *
 * Run: node --env-file=.env.local scripts/validate-entity-lookup-fix.mjs
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !serviceKey || !anonKey) {
    console.error("❌ Missing env vars. Run with: node --env-file=.env.local scripts/validate-entity-lookup-fix.mjs");
    process.exit(1);
}

const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

const anon = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

const TESTS = [];

async function test(name, fn) {
    try {
        const result = await fn();
        TESTS.push({ name, status: "✅ PASS", detail: result });
        console.log(`✅ PASS — ${name}: ${result}`);
    } catch (err) {
        TESTS.push({ name, status: "❌ FAIL", detail: err.message });
        console.error(`❌ FAIL — ${name}: ${err.message}`);
    }
}

// ─── Test 1: Lean select (the fix) ─────────────────────────
await test("Lean select: projects (id, name) via service role", async () => {
    const { data, error } = await admin
        .from("projects")
        .select("id, name")
        .limit(5);
    if (error) throw new Error(`Supabase error: ${error.message} (${error.code})`);
    return `OK — ${data.length} rows returned`;
});

// ─── Test 2: Full join select ──────────────────────────────
await test("Full join select: projects with user_profiles + companies", async () => {
    const { data, error } = await admin
        .from("projects")
        .select("*, user_profiles:manager_id(display_name), companies:client_company_id(name)")
        .limit(5);
    if (error) throw new Error(`Supabase error: ${error.message} (${error.code})`);
    return `OK — ${data.length} rows returned`;
});

// ─── Test 3: Notifications unread count (FIXED — no deleted_at) ─
await test("Notifications: unread count (FIXED — no deleted_at)", async () => {
    const { count, error } = await admin
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("read", false);
    if (error) throw new Error(`Supabase error: ${error.message} (${error.code})`);
    return `OK — ${count ?? 0} unread notifications`;
});

// ─── Test 3b: Verify deleted_at DOES fail (regression check) ─
await test("Notifications: deleted_at filter correctly fails (regression)", async () => {
    const { error } = await admin
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("read", false)
        .is("deleted_at", null);
    if (!error) throw new Error("Expected error for deleted_at filter but got none — column may have been added");
    return `OK — correctly rejects deleted_at filter (column does not exist)`;
});

// ─── Test 4: Lean select with ANON key ─────────────────────
await test("Lean select: projects (id, name) via ANON key (RLS enforced)", async () => {
    const { data, error } = await anon
        .from("projects")
        .select("id, name")
        .limit(5);
    if (error) throw new Error(`Supabase error: ${error.message} (${error.code})`);
    return `OK — ${data.length} rows (RLS filtered)`;
});

// ─── Test 5: Full select with ANON key ─────────────────────
await test("Full join select: projects via ANON key (RLS enforced)", async () => {
    const { data, error } = await anon
        .from("projects")
        .select("*, user_profiles:manager_id(display_name), companies:client_company_id(name)")
        .limit(5);
    if (error) throw new Error(`Supabase error: ${error.message} (${error.code})`);
    return `OK — ${data.length} rows (RLS filtered)`;
});

// ─── Test 6: Select override validation ────────────────────
await test("Select override: projects with comma-separated fields", async () => {
    const selectFields = "id,name";
    const { data, error } = await admin
        .from("projects")
        .select(selectFields)
        .limit(5);
    if (error) throw new Error(`Supabase error: ${error.message} (${error.code})`);
    if (data.length > 0) {
        const keys = Object.keys(data[0]);
        const extraKeys = keys.filter(k => !["id", "name"].includes(k));
        if (extraKeys.length > 0) {
            throw new Error(`Unexpected columns: ${extraKeys.join(", ")}`);
        }
    }
    return `OK — ${data.length} rows with only id,name columns`;
});

// ─── Test 7: Profile lookup ────────────────────────────────
await test("Lean select: user_profiles (id, display_name, email)", async () => {
    const { data, error } = await admin
        .from("user_profiles")
        .select("id, display_name, email")
        .limit(5);
    if (error) throw new Error(`Supabase error: ${error.message} (${error.code})`);
    return `OK — ${data.length} profiles returned`;
});

// ─── Test 8: Auth resolver table ───────────────────────────
await test("Auth resolver: org_memberships query", async () => {
    const { data, error } = await admin
        .from("org_memberships")
        .select("role, organization_id, user_id, is_default_org")
        .limit(3);
    if (error) throw new Error(`Supabase error: ${error.message} (${error.code})`);
    return `OK — ${data.length} memberships found`;
});

// ─── Summary ───────────────────────────────────────────────
console.log("\n" + "═".repeat(60));
console.log("VALIDATION SUMMARY");
console.log("═".repeat(60));
const passed = TESTS.filter(t => t.status.includes("PASS")).length;
const failed = TESTS.filter(t => t.status.includes("FAIL")).length;
TESTS.forEach(t => console.log(`  ${t.status} ${t.name}`));
console.log("─".repeat(60));
console.log(`  ${passed} passed, ${failed} failed out of ${TESTS.length} tests`);
console.log("═".repeat(60));

process.exit(failed > 0 ? 1 : 0);
