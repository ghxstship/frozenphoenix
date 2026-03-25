/**
 * CRUD Surface Area Validation
 *
 * Ensures every page in the navigation has end-to-end infrastructure:
 * a list page with config, a create form, a detail page, and CRUD wiring.
 * This is a comprehensive structural integrity test — not a functional test.
 */

import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { flattenNavItems, navigationConfig } from "@/config/navigation";
import { SLUG_TO_CONFIG_KEY } from "@/config/list-page-configs/slug-registry";
import * as allConfigs from "@/config/list-page-configs";
import type { ListPageConfig } from "@/types/list-page-config";

const ROOT = process.cwd();
const DASHBOARD_DIR = join(ROOT, "src/app/(dashboard)");

function fileExists(relativePath: string): boolean {
    return existsSync(join(ROOT, relativePath));
}

// ═══════════════════════════════════════════════════════════════
// Collect all exported ListPageConfig objects
// ═══════════════════════════════════════════════════════════════

const CONFIGS: Record<string, ListPageConfig> = {};
for (const [key, val] of Object.entries(allConfigs)) {
    if (key.endsWith("_PAGE") && typeof val === "object" && val !== null && "entityKey" in val) {
        CONFIGS[key] = val as ListPageConfig;
    }
}

// ═══════════════════════════════════════════════════════════════
// TIER 1: NAVIGATION → PAGE ROUTE COVERAGE
// ═══════════════════════════════════════════════════════════════

describe("Navigation → Page Route Coverage", () => {
    const navItems = flattenNavItems(navigationConfig);

    // Exclude paths that are sub-routes or dashboard-type pages (not entity lists)
    const entityListPaths = navItems
        .filter((item) => {
            const path = item.path;
            // Skip compound paths (sub-pages under advancing, live-ops, settings, etc.)
            if (path.startsWith("/live-ops/")) return false;
            if (path.startsWith("/advancing/")) return false;
            if (path.startsWith("/settings/")) return false;
            if (path.startsWith("/integrations/")) return false;
            if (path.startsWith("/time-tracking/")) return false;
            if (path.startsWith("/user-management/")) return false;
            if (path.startsWith("/workforce/")) return false;
            if (path.startsWith("/service-requests/")) return false;
            if (path.startsWith("/finance/")) return false;
            if (path.startsWith("/assets/")) return false;
            if (path.startsWith("/credentials/")) return false;
            if (path.startsWith("/reports/")) return false;
            // Skip special pages
            if (path === "/dashboard") return false;
            if (path === "/calendar") return false;
            if (path === "/messages") return false;
            if (path === "/notifications") return false;
            if (path === "/home/tasks") return false;
            if (path === "/home/documents") return false;
            if (path === "/live-ops") return false;
            // Skip section overview/landing pages (dashboard-type, not entity lists)
            if (path === "/production") return false;
            if (path === "/workforce-overview") return false;
            if (path === "/vendor-overview") return false;
            if (path === "/resources") return false;
            if (path === "/vendor-invoices") return false;
            if (path === "/platform") return false;
            return true;
        })
        .map((item) => item.path);

    it("has nav items to validate", () => {
        expect(entityListPaths.length).toBeGreaterThan(50);
    });

    it.each(entityListPaths.map((p) => [p]))(
        "nav path %s has dedicated page.tsx OR slug registry entry",
        (path) => {
            const slug = path.replace(/^\//, "").split("/")[0]!;
            const hasDedicatedPage = fileExists(`src/app/(dashboard)/${slug}/page.tsx`);
            const hasSlugEntry = slug in SLUG_TO_CONFIG_KEY;
            expect(
                hasDedicatedPage || hasSlugEntry,
                `Path "${path}" (slug: "${slug}") has neither a dedicated page.tsx nor a slug-registry entry`
            ).toBe(true);
        }
    );
});

// ═══════════════════════════════════════════════════════════════
// TIER 2: CREATE FORM COMPLETENESS
// ═══════════════════════════════════════════════════════════════

describe("Create Form Completeness", () => {
    const configsWithCreate = Object.entries(CONFIGS).filter(([, c]) => c.createConfig);

    it("at least 150 configs have createConfig", () => {
        expect(configsWithCreate.length).toBeGreaterThanOrEqual(150);
    });

    it.each(configsWithCreate)(
        "%s createConfig has entityName and non-empty fields",
        (_key, config) => {
            const cc = config.createConfig!;
            expect(cc.entityName, `${_key}: createConfig.entityName is empty`).toBeTruthy();
            expect(cc.fields.length, `${_key}: createConfig.fields is empty`).toBeGreaterThan(0);
        }
    );

    it.each(configsWithCreate)(
        "%s createConfig fields have valid key/label/type",
        (_key, config) => {
            const validTypes = [
                "text",
                "email",
                "url",
                "number",
                "date",
                "datetime-local",
                "select",
                "textarea",
                "currency",
                "entity-lookup",
            ];
            for (const field of config.createConfig!.fields) {
                expect(field.key, `${_key}: field missing key`).toBeTruthy();
                expect(field.label, `${_key}: field ${field.key} missing label`).toBeTruthy();
                expect(
                    validTypes,
                    `${_key}: field ${field.key} has invalid type "${field.type}"`
                ).toContain(field.type);
            }
        }
    );

    // Select fields must have options
    const configsWithSelectFields = configsWithCreate.filter(([, c]) =>
        c.createConfig!.fields.some((f) => f.type === "select")
    );

    it.each(configsWithSelectFields)("%s select fields have options", (_key, config) => {
        for (const field of config.createConfig!.fields) {
            if (field.type === "select") {
                expect(
                    field.options?.length,
                    `${_key}: select field ${field.key} has no options`
                ).toBeGreaterThan(0);
            }
        }
    });

    // Entity-lookup fields must have lookupConfig
    const configsWithLookupFields = configsWithCreate.filter(([, c]) =>
        c.createConfig!.fields.some((f) => f.type === "entity-lookup")
    );

    if (configsWithLookupFields.length > 0) {
        it.each(configsWithLookupFields)(
            "%s entity-lookup fields have lookupConfig",
            (_key, config) => {
                for (const field of config.createConfig!.fields) {
                    if (field.type === "entity-lookup") {
                        expect(
                            field.lookupConfig,
                            `${_key}: entity-lookup field ${field.key} missing lookupConfig`
                        ).toBeDefined();
                    }
                }
            }
        );
    }

    // No duplicate field keys within a single form
    it.each(configsWithCreate)("%s createConfig has no duplicate field keys", (_key, config) => {
        const keys = config.createConfig!.fields.map((f) => f.key);
        const uniqueKeys = new Set(keys);
        expect(
            uniqueKeys.size,
            `${_key}: has duplicate field keys: ${keys.filter((k, i) => keys.indexOf(k) !== i).join(", ")}`
        ).toBe(keys.length);
    });

    // At least 90% of create forms should have at least one required field
    // (some read-only or lightweight forms like conversations may not)
    it("at least 90% of create forms have a required field", () => {
        const withRequired = configsWithCreate.filter(([, c]) =>
            c.createConfig!.fields.some((f) => f.required)
        );
        const ratio = withRequired.length / configsWithCreate.length;
        expect(
            ratio,
            `Only ${withRequired.length}/${configsWithCreate.length} (${(ratio * 100).toFixed(0)}%) create forms have required fields`
        ).toBeGreaterThan(0.9);
    });
});

// ═══════════════════════════════════════════════════════════════
// TIER 3: DETAIL PAGE COMPLETENESS
// ═══════════════════════════════════════════════════════════════

describe("Detail Page Completeness", () => {
    // Find all [id] directories
    const entityDirs = readdirSync(DASHBOARD_DIR, { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith("[") && !d.name.startsWith("_"))
        .map((d) => d.name);

    const dirsWithDetailPage = entityDirs.filter((dir) =>
        existsSync(join(DASHBOARD_DIR, dir, "[id]", "page.tsx"))
    );

    it("at least 100 entities have detail pages", () => {
        expect(dirsWithDetailPage.length).toBeGreaterThanOrEqual(100);
    });

    it.each(dirsWithDetailPage.map((d) => [d]))(
        "%s/[id]/ has both page.tsx and _client.tsx",
        (dir) => {
            const detailDir = join(DASHBOARD_DIR, dir, "[id]");
            expect(existsSync(join(detailDir, "page.tsx")), `${dir}/[id]/page.tsx is missing`).toBe(
                true
            );
            expect(
                existsSync(join(detailDir, "_client.tsx")),
                `${dir}/[id]/_client.tsx is missing`
            ).toBe(true);
        }
    );

    // SSR prefetch pattern — page.tsx should import prefetchDetailRecord
    it.each(dirsWithDetailPage.map((d) => [d]))(
        "%s/[id]/page.tsx uses SSR prefetch pattern",
        (dir) => {
            const pagePath = join(DASHBOARD_DIR, dir, "[id]", "page.tsx");
            const content = readFileSync(pagePath, "utf-8");
            expect(
                content.includes("prefetchDetailRecord"),
                `${dir}/[id]/page.tsx does not use prefetchDetailRecord for SSR`
            ).toBe(true);
        }
    );

    // _client.tsx should use DetailPageShell
    it.each(dirsWithDetailPage.map((d) => [d]))(
        "%s/[id]/_client.tsx uses DetailPageShell",
        (dir) => {
            const clientPath = join(DASHBOARD_DIR, dir, "[id]", "_client.tsx");
            const content = readFileSync(clientPath, "utf-8");
            expect(
                content.includes("DetailPageShell"),
                `${dir}/[id]/_client.tsx does not use DetailPageShell`
            ).toBe(true);
        }
    );
});

// ═══════════════════════════════════════════════════════════════
// TIER 4: CRUD HOOK WIRING
// ═══════════════════════════════════════════════════════════════

describe("CRUD Hook Wiring", () => {
    const entityDirs = readdirSync(DASHBOARD_DIR, { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith("[") && !d.name.startsWith("_"))
        .map((d) => d.name);

    const dirsWithDetailClient = entityDirs.filter((dir) =>
        existsSync(join(DASHBOARD_DIR, dir, "[id]", "_client.tsx"))
    );

    // _client.tsx files using useDetailCrud should pass required params
    const clientsWithCrud = dirsWithDetailClient.filter((dir) => {
        const content = readFileSync(join(DASHBOARD_DIR, dir, "[id]", "_client.tsx"), "utf-8");
        return content.includes("useDetailCrud");
    });

    it("most detail clients use useDetailCrud", () => {
        expect(clientsWithCrud.length).toBeGreaterThan(50);
    });

    it.each(clientsWithCrud.map((d) => [d]))(
        "%s/[id]/_client.tsx passes required useDetailCrud params",
        (dir) => {
            const content = readFileSync(join(DASHBOARD_DIR, dir, "[id]", "_client.tsx"), "utf-8");
            expect(content, `${dir}: missing entityId param`).toContain("entityId");
            expect(content, `${dir}: missing entityLabel param`).toContain("entityLabel");
            expect(content, `${dir}: missing listPath param`).toContain("listPath");
        }
    );

    // Detail clients using useDetailCrud should pass menuItems to DetailPageShell
    it.each(clientsWithCrud.map((d) => [d]))(
        "%s/[id]/_client.tsx passes CRUD menuItems to DetailPageShell",
        (dir) => {
            const content = readFileSync(join(DASHBOARD_DIR, dir, "[id]", "_client.tsx"), "utf-8");
            expect(
                content.includes("menuItems"),
                `${dir}: _client.tsx uses useDetailCrud but doesn't pass menuItems to shell`
            ).toBe(true);
        }
    );
});

// ═══════════════════════════════════════════════════════════════
// ENTITY KEY CROSS-REFERENCE — config ↔ entityConfig
// ═══════════════════════════════════════════════════════════════

describe("List Page Config Entity Key Validity", () => {
    it("all 233+ configs are present", () => {
        expect(Object.keys(CONFIGS).length).toBeGreaterThanOrEqual(233);
    });

    it.each(Object.entries(CONFIGS))("%s has non-empty entityKey", (_key, config) => {
        expect(config.entityKey).toBeTruthy();
        expect(typeof config.entityKey).toBe("string");
    });
});
