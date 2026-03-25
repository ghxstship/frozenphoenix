/**
 * Route Coverage Test — ensures every navigation path resolves to
 * either a dedicated page.tsx OR the [‍...slug] catch-all via the slug registry.
 *
 * This prevents regressions where new route directories are added
 * (e.g. for [id] detail pages) but the corresponding list page.tsx is forgotten,
 * causing the directory to shadow the catch-all and produce a 404.
 */

import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { flattenNavItems, navigationConfig } from "@/config/navigation";
import { SLUG_TO_CONFIG_KEY } from "@/config/list-page-configs/slug-registry";

const DASHBOARD_DIR = path.resolve(__dirname, "../../app/(dashboard)");

function hasPageFile(routePath: string): boolean {
    const segments = routePath.replace(/^\//, "").split("/");
    const dir = path.join(DASHBOARD_DIR, ...segments);
    return fs.existsSync(path.join(dir, "page.tsx"));
}

function canCatchAllResolve(routePath: string): boolean {
    const segments = routePath.replace(/^\//, "").split("/");
    const topSlug = segments[0]!;
    const topDir = path.join(DASHBOARD_DIR, topSlug);
    // If a directory exists at the top level, it blocks the catch-all
    const dirBlocks = fs.existsSync(topDir) && fs.statSync(topDir).isDirectory();
    const slugRegistered = topSlug in SLUG_TO_CONFIG_KEY;
    return !dirBlocks && slugRegistered;
}

describe("Route Coverage — every nav path resolves without 404", () => {
    const allItems = flattenNavItems(navigationConfig);

    it("every navigation item has a resolvable page", () => {
        const unresolved: string[] = [];

        for (const item of allItems) {
            const resolves = hasPageFile(item.path) || canCatchAllResolve(item.path);
            if (!resolves) {
                unresolved.push(`${item.title} (${item.path})`);
            }
        }

        expect(
            unresolved,
            `Unresolved routes will 404:\n${unresolved.join("\n")}\n\nFix: add a page.tsx OR register the slug in slug-registry.ts`
        ).toEqual([]);
    });

    it("no duplicate paths across navigation config", () => {
        const paths = allItems.map((i) => i.path);
        const seen = new Set<string>();
        const dupes: string[] = [];
        for (const p of paths) {
            if (seen.has(p)) dupes.push(p);
            seen.add(p);
        }
        expect(dupes, `Duplicate nav paths: ${dupes.join(", ")}`).toEqual([]);
    });

    it("every directory with subdirectories has a page.tsx (catch-all shadow guard)", () => {
        const SKIP = new Set(["home", "onboarding", "live-ops", "settings", "dashboard"]);
        const entries = fs.readdirSync(DASHBOARD_DIR, { withFileTypes: true });
        const shadowedDirs: string[] = [];

        for (const entry of entries) {
            if (!entry.isDirectory()) continue;
            if (SKIP.has(entry.name) || entry.name.startsWith("[")) continue;

            const dir = path.join(DASHBOARD_DIR, entry.name);
            const hasSubdirs = fs
                .readdirSync(dir, { withFileTypes: true })
                .some((e) => e.isDirectory());

            if (hasSubdirs && !fs.existsSync(path.join(dir, "page.tsx"))) {
                shadowedDirs.push(entry.name);
            }
        }

        expect(
            shadowedDirs,
            `Directories shadow [‍...slug] catch-all (missing page.tsx):\n${shadowedDirs.join("\n")}`
        ).toEqual([]);
    });
});
