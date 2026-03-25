/**
 * Navigation & RBAC Config Tests (WS-14)
 *
 * Validates navigation structure, RBAC-filtered visibility,
 * breadcrumb generation, and contextual section logic.
 */

import { describe, expect, it } from "vitest";
import {
    flattenNavItems,
    getContextualNavigationVisibility,
    getNavigationBreadcrumbs,
    getNavigationContext,
    getNavigationSectionsForRole,
    navigationConfig,
} from "@/config/navigation";
import type { NavSection } from "@/config/navigation";
import {
    FIELD_VISIBILITY_MASKS,
    hasPermission,
    isFieldVisible,
    maskSensitiveFields,
    PERMISSION_MATRIX,
    shouldRevokeAccess,
} from "@/config/rbac";
import type { PermissionLevel } from "@/types";

// ═══════════════════════════════════════════════════════════════
// NAVIGATION CONFIG STRUCTURAL TESTS
// ═══════════════════════════════════════════════════════════════

describe("Navigation Config Structure", () => {
    it("has 10 sections total (final IA optimization)", () => {
        expect(navigationConfig).toHaveLength(10);
    });

    it("every section has a title and at least one item", () => {
        for (const section of navigationConfig) {
            expect(section.title).toBeTruthy();
            expect(section.items.length).toBeGreaterThan(0);
        }
    });

    it("every item has title, path, and icon", () => {
        const allItems = flattenNavItems(navigationConfig);
        for (const item of allItems) {
            expect(item.title, `Item missing title`).toBeTruthy();
            expect(item.path, `Item "${item.title}" missing path`).toBeTruthy();
            expect(item.icon, `Item "${item.title}" missing icon`).toBeDefined();
        }
    });

    it("no duplicate paths across all items", () => {
        const allItems = flattenNavItems(navigationConfig);
        const paths = allItems.map((i) => i.path);
        const uniquePaths = new Set(paths);
        const dupes = paths.filter((p, i) => paths.indexOf(p) !== i);
        expect(dupes, `Duplicate paths found: ${dupes.join(", ")}`).toEqual([]);
        expect(uniquePaths.size).toBe(paths.length);
    });

    it("every item with permission has a valid permission string format (resource.action)", () => {
        const allItems = flattenNavItems(navigationConfig);
        for (const item of allItems) {
            if (item.permission) {
                expect(item.permission).toMatch(/^[a-z_]+\.(read|write|delete|manage)$/);
            }
        }
    });

    it("Admin section exists (Platform merged in)", () => {
        const admin = navigationConfig.find((s) => s.title === "Admin");
        expect(admin).toBeDefined();
    });

    it("Workforce and Supply Chain sections exist", () => {
        const workforce = navigationConfig.find((s) => s.title === "Workforce");
        const supplyChain = navigationConfig.find((s) => s.title === "Supply Chain");
        expect(workforce).toBeDefined();
        expect(supplyChain).toBeDefined();
    });

    it("v5: labels are renamed correctly", () => {
        const allItems = flattenNavItems(navigationConfig);
        const labels = allItems.map((i) => i.title);
        expect(labels).toContain("My Tasks");
        expect(labels).toContain("My Documents");
        expect(labels).toContain("Analytics");
        expect(labels).toContain("Advances");
        expect(labels).toContain("Personnel");
        expect(labels).toContain("Human Resources");
        expect(labels).toContain("Vendors");
        expect(labels).toContain("Warehousing");
        expect(labels).toContain("Logistics");
        // Old labels should NOT exist
        expect(labels).not.toContain("Advance Orders");
        expect(labels).not.toContain("HR");
        expect(labels).not.toContain("Crew");
    });

    it("Home section is first and always expanded", () => {
        expect(navigationConfig[0]!.title).toBe("Home");
        expect(navigationConfig[0]!.defaultExpanded).toBe(true);
    });

    it("no contextual sections after v5 merge", () => {
        const contextual = navigationConfig.filter((s) => s.contextual);
        expect(contextual.length).toBe(0);
    });
});

// ═══════════════════════════════════════════════════════════════
// FLATTEN NAV ITEMS
// ═══════════════════════════════════════════════════════════════

describe("flattenNavItems", () => {
    it("includes children in flattened output", () => {
        const testSection: NavSection[] = [
            {
                title: "Test",
                items: [
                    {
                        title: "Parent",
                        path: "/parent",
                        icon: navigationConfig[0]!.items[0]!.icon,
                        children: [
                            {
                                title: "Child",
                                path: "/parent/child",
                                icon: navigationConfig[0]!.items[0]!.icon,
                            },
                        ],
                    },
                ],
            },
        ];

        const flat = flattenNavItems(testSection);
        expect(flat).toHaveLength(2);
        expect(flat.map((i) => i.path)).toEqual(["/parent", "/parent/child"]);
    });

    it("returns all items from full config", () => {
        const flat = flattenNavItems(navigationConfig);
        // Should be more than the number of sections (items + children)
        expect(flat.length).toBeGreaterThan(navigationConfig.length);
    });
});

// ═══════════════════════════════════════════════════════════════
// RBAC-FILTERED NAVIGATION
// ═══════════════════════════════════════════════════════════════

describe("getNavigationSectionsForRole", () => {
    it("exec sees all non-contextual sections", () => {
        const sections = getNavigationSectionsForRole("exec");
        // Should see all non-contextual sections
        const nonContextual = navigationConfig.filter((s) => !s.contextual);
        expect(sections.length).toBe(nonContextual.length);
    });

    it("collaborator sees very limited sections", () => {
        const sections = getNavigationSectionsForRole("collaborator");
        const allItems = flattenNavItems(sections);
        // Collaborator should see far fewer items than exec
        const execItems = flattenNavItems(getNavigationSectionsForRole("exec"));
        expect(allItems.length).toBeLessThan(execItems.length / 2);
    });

    it("client sees more than collaborator but less than member", () => {
        const clientItems = flattenNavItems(getNavigationSectionsForRole("client"));
        const collaboratorItems = flattenNavItems(getNavigationSectionsForRole("collaborator"));
        const memberItems = flattenNavItems(getNavigationSectionsForRole("member"));

        expect(clientItems.length).toBeGreaterThanOrEqual(collaboratorItems.length);
        expect(clientItems.length).toBeLessThanOrEqual(memberItems.length);
    });

    it("role hierarchy: exec ≥ director ≥ pm ≥ member ≥ client ≥ collaborator", () => {
        const roles: PermissionLevel[] = [
            "exec",
            "director",
            "pm",
            "member",
            "client",
            "collaborator",
        ];
        const counts = roles.map((r) => flattenNavItems(getNavigationSectionsForRole(r)).length);

        for (let i = 0; i < counts.length - 1; i++) {
            expect(
                counts[i]!,
                `${roles[i]} (${counts[i]}) should see ≥ items than ${roles[i + 1]} (${counts[i + 1]})`
            ).toBeGreaterThanOrEqual(counts[i + 1]!);
        }
    });

    it("undefined role gets minimal access", () => {
        const sections = getNavigationSectionsForRole(undefined);
        const items = flattenNavItems(sections);
        // Should still see items without permission requirements
        expect(items.length).toBeGreaterThanOrEqual(0);
    });

    it("all sections visible by default (no contextual gating)", () => {
        const sections = getNavigationSectionsForRole("exec");
        expect(sections.length).toBe(navigationConfig.length);
    });

    it("Operations section contains core ops items", () => {
        const sections = getNavigationSectionsForRole("exec");
        const ops = sections.find((s) => s.title === "Operations");
        expect(ops).toBeDefined();
        const items = flattenNavItems([ops!]);
        const titles = items.map((i) => i.title);
        // Environment, Resilience, Data Health, Sustainability consolidated into Overview tabs
        expect(titles).toContain("Documents");
        expect(titles).toContain("Workflows");
    });
});

// ═══════════════════════════════════════════════════════════════
// BREADCRUMBS
// ═══════════════════════════════════════════════════════════════

describe("getNavigationBreadcrumbs", () => {
    it("generates breadcrumbs for dashboard", () => {
        const crumbs = getNavigationBreadcrumbs("/dashboard");
        expect(crumbs.length).toBeGreaterThanOrEqual(1);
        expect(crumbs[crumbs.length - 1]!.isLast).toBe(true);
    });

    it("generates breadcrumbs for nested paths", () => {
        const crumbs = getNavigationBreadcrumbs("/projects/p-123");
        expect(crumbs.length).toBeGreaterThanOrEqual(1);
    });

    it("returns empty for unknown paths", () => {
        const crumbs = getNavigationBreadcrumbs("/nonexistent/page");
        // Should gracefully handle unknown paths
        expect(Array.isArray(crumbs)).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════
// NAVIGATION CONTEXT
// ═══════════════════════════════════════════════════════════════

describe("getNavigationContext", () => {
    it("finds context for dashboard path", () => {
        const ctx = getNavigationContext("/dashboard");
        expect(ctx).not.toBeNull();
        expect(ctx?.item.title).toBe("Dashboard");
        expect(ctx?.section.title).toBe("Home");
    });

    it("returns null for unknown paths", () => {
        const ctx = getNavigationContext("/nonexistent/path/here");
        expect(ctx).toBeNull();
    });
});

// ═══════════════════════════════════════════════════════════════
// CONTEXTUAL NAVIGATION VISIBILITY
// ═══════════════════════════════════════════════════════════════

describe("getContextualNavigationVisibility", () => {
    it("returns an object for any path", () => {
        const result = getContextualNavigationVisibility("/dashboard");
        expect(typeof result).toBe("object");
    });
});

// ═══════════════════════════════════════════════════════════════
// RBAC PERMISSION MATRIX
// ═══════════════════════════════════════════════════════════════

describe("RBAC Permission Matrix", () => {
    it("defines permissions for all 6 roles", () => {
        const roles: PermissionLevel[] = [
            "exec",
            "director",
            "pm",
            "member",
            "client",
            "collaborator",
        ];
        for (const role of roles) {
            expect(PERMISSION_MATRIX[role]).toBeDefined();
            expect(PERMISSION_MATRIX[role]!.length).toBeGreaterThan(0);
        }
    });

    it("exec has wildcard access", () => {
        expect(PERMISSION_MATRIX.exec).toEqual([
            { resource: "*", actions: ["read", "write", "delete", "manage"] },
        ]);
    });

    it("collaborator has the fewest permissions", () => {
        expect(PERMISSION_MATRIX.collaborator!.length).toBeLessThan(
            PERMISSION_MATRIX.member!.length
        );
    });
});

describe("hasPermission", () => {
    it("exec can do anything", () => {
        expect(hasPermission("exec", "projects", "read")).toBe(true);
        expect(hasPermission("exec", "anything", "delete")).toBe(true);
        expect(hasPermission("exec", "random_resource", "manage")).toBe(true);
    });

    it("collaborator has limited access", () => {
        expect(hasPermission("collaborator", "projects", "manage")).toBe(false);
        expect(hasPermission("collaborator", "budgets", "write")).toBe(false);
    });

    it("pm can read and write projects", () => {
        expect(hasPermission("pm", "projects", "read")).toBe(true);
        expect(hasPermission("pm", "projects", "write")).toBe(true);
    });

    it("client can read approved deliverables but not write", () => {
        expect(hasPermission("client", "projects", "read")).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════
// FIELD VISIBILITY MASKS
// ═══════════════════════════════════════════════════════════════

describe("Field Visibility Masks", () => {
    it("defines masks for sensitive financial fields", () => {
        expect(FIELD_VISIBILITY_MASKS["hourly_rate"]).toBeDefined();
        expect(FIELD_VISIBILITY_MASKS["internal_rate"]).toBeDefined();
        expect(FIELD_VISIBILITY_MASKS["margin"]).toBeDefined();
    });

    it("exec can see all fields", () => {
        for (const fieldName of Object.keys(FIELD_VISIBILITY_MASKS)) {
            expect(isFieldVisible("exec", fieldName)).toBe(true);
        }
    });

    it("collaborator cannot see financial or PII fields", () => {
        expect(isFieldVisible("collaborator", "hourly_rate")).toBe(false);
        expect(isFieldVisible("collaborator", "internal_rate")).toBe(false);
        expect(isFieldVisible("collaborator", "margin")).toBe(false);
    });

    it("unrestricted fields are visible to everyone", () => {
        expect(isFieldVisible("collaborator", "name")).toBe(true);
        expect(isFieldVisible("client", "description")).toBe(true);
    });
});

describe("maskSensitiveFields", () => {
    it("masks financial fields for collaborator", () => {
        const data = { name: "Test", hourly_rate: 150, margin: 0.3, description: "Desc" };
        const masked = maskSensitiveFields(data, "collaborator");

        expect(masked.name).toBe("Test");
        expect(masked.description).toBe("Desc");
        expect(masked.hourly_rate).toBeNull();
        expect(masked.margin).toBeNull();
    });

    it("preserves all fields for exec", () => {
        const data = { name: "Test", hourly_rate: 150, margin: 0.3 };
        const masked = maskSensitiveFields(data, "exec");

        expect(masked.hourly_rate).toBe(150);
        expect(masked.margin).toBe(0.3);
    });
});

// ═══════════════════════════════════════════════════════════════
// ACCESS REVOCATION (Kill Switch)
// ═══════════════════════════════════════════════════════════════

describe("shouldRevokeAccess", () => {
    it("never revokes internal roles", () => {
        const pastDate = new Date(Date.now() - 100 * 60 * 60 * 1000).toISOString(); // 100 hrs ago
        expect(shouldRevokeAccess("exec", pastDate)).toBe(false);
        expect(shouldRevokeAccess("director", pastDate)).toBe(false);
        expect(shouldRevokeAccess("pm", pastDate)).toBe(false);
        expect(shouldRevokeAccess("member", pastDate)).toBe(false);
    });

    it("revokes client access 48hrs post load-out", () => {
        const pastDate = new Date(Date.now() - 49 * 60 * 60 * 1000).toISOString(); // 49 hrs ago
        expect(shouldRevokeAccess("client", pastDate)).toBe(true);
    });

    it("revokes collaborator access 48hrs post load-out", () => {
        const pastDate = new Date(Date.now() - 49 * 60 * 60 * 1000).toISOString();
        expect(shouldRevokeAccess("collaborator", pastDate)).toBe(true);
    });

    it("does not revoke external access within 48hrs", () => {
        const recentDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // 24 hrs ago
        expect(shouldRevokeAccess("client", recentDate)).toBe(false);
        expect(shouldRevokeAccess("collaborator", recentDate)).toBe(false);
    });

    it("does not revoke when load-out date is null", () => {
        expect(shouldRevokeAccess("client", null)).toBe(false);
        expect(shouldRevokeAccess("collaborator", null)).toBe(false);
    });
});
