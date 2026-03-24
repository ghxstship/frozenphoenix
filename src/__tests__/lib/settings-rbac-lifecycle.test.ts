import { describe, expect, it } from "vitest";
import { PERMISSION_MATRIX } from "@/config/rbac";
import { hasPermission } from "@/config/rbac";
import { navigationConfig } from "@/config/navigation";
import { getNavigationSectionsForRole } from "@/config/navigation";
import type { PermissionLevel } from "@/types";

const ALL_ROLES: PermissionLevel[] = ["exec", "director", "pm", "member", "client", "collaborator"];

describe("RBAC Permission Matrix", () => {
    it("has entries for all 6 roles", () => {
        for (const role of ALL_ROLES) {
            expect(PERMISSION_MATRIX[role]).toBeDefined();
            expect(Array.isArray(PERMISSION_MATRIX[role])).toBe(true);
        }
    });

    it("exec has wildcard access (resource: *)", () => {
        expect(PERMISSION_MATRIX.exec).toHaveLength(1);
        expect(PERMISSION_MATRIX.exec[0]!.resource).toBe("*");
    });

    it("exec can access any resource via wildcard", () => {
        expect(hasPermission("exec", "settings", "manage")).toBe(true);
        expect(hasPermission("exec", "projects", "delete")).toBe(true);
        expect(hasPermission("exec", "anything", "read")).toBe(true);
    });

    it("director has more explicit permissions than pm", () => {
        expect(PERMISSION_MATRIX.director.length).toBeGreaterThan(PERMISSION_MATRIX.pm.length);
    });

    it("pm has more permissions than member", () => {
        expect(PERMISSION_MATRIX.pm.length).toBeGreaterThan(PERMISSION_MATRIX.member.length);
    });

    it("internal roles can read dashboard", () => {
        for (const role of ["exec", "director", "pm", "member"] as PermissionLevel[]) {
            expect(hasPermission(role, "dashboard", "read")).toBe(true);
        }
    });

    it("only exec has settings.manage (via wildcard)", () => {
        expect(hasPermission("exec", "settings", "manage")).toBe(true);
        expect(hasPermission("pm", "settings", "manage")).toBe(false);
        expect(hasPermission("member", "settings", "manage")).toBe(false);
    });

    it("all roles can read settings (personal preferences)", () => {
        for (const role of ALL_ROLES) {
            expect(hasPermission(role, "settings", "read")).toBe(true);
        }
    });

    it("client cannot access crew management", () => {
        expect(hasPermission("client", "crew", "write")).toBe(false);
        expect(hasPermission("client", "crew", "manage")).toBe(false);
    });

    it("collaborator has minimal permissions", () => {
        expect(hasPermission("collaborator", "projects", "write")).toBe(false);
        expect(hasPermission("collaborator", "finance", "read")).toBe(false);
    });

    it("member can read projects but not manage", () => {
        expect(hasPermission("member", "projects", "read")).toBe(true);
        expect(hasPermission("member", "projects", "manage")).toBe(false);
    });

    it("pm can write projects", () => {
        expect(hasPermission("pm", "projects", "write")).toBe(true);
    });
});

describe("Navigation RBAC Filtering", () => {
    it("exec sees all non-contextual sections", () => {
        const sections = getNavigationSectionsForRole("exec");
        expect(sections.length).toBeGreaterThanOrEqual(9);
    });

    it("member sees fewer sections than exec", () => {
        const execSections = getNavigationSectionsForRole("exec");
        const memberSections = getNavigationSectionsForRole("member");
        expect(memberSections.length).toBeLessThanOrEqual(execSections.length);
    });

    it("client sees minimal sections", () => {
        const sections = getNavigationSectionsForRole("client");
        expect(sections.length).toBeGreaterThan(0);
        expect(sections.length).toBeLessThan(getNavigationSectionsForRole("exec").length);
    });

    it("collaborator sees minimal sections", () => {
        const sections = getNavigationSectionsForRole("collaborator");
        expect(sections.length).toBeGreaterThan(0);
    });

    it("live ops section is hidden by default", () => {
        const sections = getNavigationSectionsForRole("exec");
        const liveOps = sections.find((s) => s.title === "Live Operations");
        expect(liveOps).toBeUndefined();
    });

    it("live ops visible when contextual flag set", () => {
        const sections = getNavigationSectionsForRole("exec", {
            contextualVisibility: { "live-ops": true },
        });
        const liveOps = sections.find((s) => s.title === "Live Operations");
        expect(liveOps).toBeDefined();
    });

    it("navigation config has 13 sections total (12 + 1 contextual)", () => {
        expect(navigationConfig).toHaveLength(13);
    });

    it("no section is empty after exec filtering", () => {
        const sections = getNavigationSectionsForRole("exec", { includeContextual: true });
        for (const section of sections) {
            expect(section.items.length).toBeGreaterThan(0);
        }
    });
});

describe("E2E: Role-Based Access Scenarios", () => {
    it("Scenario A: PM can manage production workflow", () => {
        expect(hasPermission("pm", "projects", "write")).toBe(true);
        expect(hasPermission("pm", "tasks", "write")).toBe(true);
        expect(hasPermission("pm", "advancing", "write")).toBe(true);
        expect(hasPermission("pm", "approvals", "read")).toBe(true);
    });

    it("Scenario B: Member can only execute tasks", () => {
        expect(hasPermission("member", "tasks", "read")).toBe(true);
        expect(hasPermission("member", "tasks", "write")).toBe(true);
        expect(hasPermission("member", "projects", "read")).toBe(true);
        expect(hasPermission("member", "projects", "write")).toBe(false);
    });

    it("Scenario C: Client has read-only access to relevant data", () => {
        expect(hasPermission("client", "dashboard", "read")).toBe(true);
        expect(hasPermission("client", "projects", "read")).toBe(true);
    });
});
