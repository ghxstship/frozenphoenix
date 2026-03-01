import { describe, it, expect } from "vitest";
import {
    hasPermission,
    isFieldVisible,
    maskSensitiveFields,
    shouldRevokeAccess,
    resolvePermissionsFromGrants,
    PERMISSION_MATRIX,
    FIELD_VISIBILITY_MASKS,
    type DbPermissionGrant,
} from "@/config/rbac";
import type { PermissionLevel } from "@/types";

function grant(
    resource: string,
    action: string,
    effect: "allow" | "deny" = "allow"
): DbPermissionGrant {
    return {
        role_definition_id: "test-role",
        resource,
        action,
        scope_type: "global",
        scope_id: null,
        effect,
        conditions: null,
    };
}

// ─── hasPermission (static matrix) ──────────────────────────

describe("hasPermission — static matrix", () => {
    it("exec has wildcard access to all resources and actions", () => {
        expect(hasPermission("exec", "projects", "read")).toBe(true);
        expect(hasPermission("exec", "projects", "write")).toBe(true);
        expect(hasPermission("exec", "projects", "delete")).toBe(true);
        expect(hasPermission("exec", "projects", "manage")).toBe(true);
        expect(hasPermission("exec", "payroll", "manage")).toBe(true);
    });

    it("pm can read and write projects but not manage", () => {
        expect(hasPermission("pm", "projects", "read")).toBe(true);
        expect(hasPermission("pm", "projects", "write")).toBe(true);
        expect(hasPermission("pm", "projects", "manage")).toBe(false);
    });

    it("client can read projects but not write", () => {
        expect(hasPermission("client", "projects", "read")).toBe(true);
        expect(hasPermission("client", "projects", "write")).toBe(false);
    });

    it("vendor has minimal access", () => {
        expect(hasPermission("vendor", "tasks", "read")).toBe(true);
        expect(hasPermission("vendor", "projects", "read")).toBe(false);
        expect(hasPermission("vendor", "payroll", "read")).toBe(false);
    });

    it("unknown resource returns false for non-exec roles", () => {
        expect(hasPermission("pm", "nonexistent_resource", "read")).toBe(false);
        expect(hasPermission("client", "nonexistent_resource", "read")).toBe(false);
        expect(hasPermission("vendor", "nonexistent_resource", "read")).toBe(false);
    });

    it("exec can access unknown resources via wildcard", () => {
        expect(hasPermission("exec", "nonexistent_resource", "read")).toBe(true);
    });
});

// ─── hasPermission (DB grants) ──────────────────────────────

describe("hasPermission — DB grants", () => {
    it("allows via DB grant even if static matrix denies", () => {
        const grants = [grant("payroll", "read")];
        expect(hasPermission("vendor", "payroll", "read", { dbGrants: grants })).toBe(true);
    });

    it("deny grant overrides allow", () => {
        const grants = [
            grant("projects", "read", "allow"),
            grant("projects", "read", "deny"),
        ];
        expect(hasPermission("pm", "projects", "read", { dbGrants: grants })).toBe(false);
    });

    it("wildcard deny blocks all resources", () => {
        const grants = [grant("*", "read", "deny")];
        expect(hasPermission("exec", "projects", "read", { dbGrants: grants })).toBe(false);
    });

    it("falls through to static matrix when grants don't match", () => {
        const grants = [grant("unrelated", "write")];
        // pm has static read access to projects
        expect(hasPermission("pm", "projects", "read", { dbGrants: grants })).toBe(true);
    });
});

// ─── PERMISSION_MATRIX structure ────────────────────────────

describe("PERMISSION_MATRIX", () => {
    const levels: PermissionLevel[] = ["exec", "pm", "client", "vendor"];

    it("defines all four permission levels", () => {
        for (const level of levels) {
            expect(PERMISSION_MATRIX[level]).toBeDefined();
            expect(Array.isArray(PERMISSION_MATRIX[level])).toBe(true);
        }
    });

    it("exec has exactly one wildcard entry", () => {
        const execPerms = PERMISSION_MATRIX.exec;
        expect(execPerms).toHaveLength(1);
        expect(execPerms[0]?.resource).toBe("*");
        expect(execPerms[0]?.actions).toContain("manage");
    });

    it("permission levels decrease in scope: exec > pm > client > vendor", () => {
        const counts = levels.map((l) => PERMISSION_MATRIX[l].length);
        // exec has 1 (wildcard), pm has many, client has fewer, vendor has fewest
        expect(counts[1]).toBeGreaterThan(counts[2]!);
        expect(counts[2]).toBeGreaterThan(counts[3]!);
    });
});

// ─── isFieldVisible ─────────────────────────────────────────

describe("isFieldVisible", () => {
    it("unrestricted fields are visible to all roles", () => {
        expect(isFieldVisible("exec", "project_name")).toBe(true);
        expect(isFieldVisible("vendor", "project_name")).toBe(true);
    });

    it("exec can see all restricted fields", () => {
        for (const field of Object.keys(FIELD_VISIBILITY_MASKS)) {
            expect(isFieldVisible("exec", field)).toBe(true);
        }
    });

    it("vendor cannot see financial fields", () => {
        expect(isFieldVisible("vendor", "hourly_rate")).toBe(false);
        expect(isFieldVisible("vendor", "margin")).toBe(false);
        expect(isFieldVisible("vendor", "salary")).toBe(false);
    });

    it("client cannot see internal cost fields", () => {
        expect(isFieldVisible("client", "internal_rate")).toBe(false);
        expect(isFieldVisible("client", "margin")).toBe(false);
        expect(isFieldVisible("client", "payroll_rate")).toBe(false);
    });

    it("pm can see cost_rate but not margin", () => {
        expect(isFieldVisible("pm", "cost_rate")).toBe(true);
        expect(isFieldVisible("pm", "margin")).toBe(false);
    });
});

// ─── maskSensitiveFields ────────────────────────────────────

describe("maskSensitiveFields", () => {
    const record = {
        id: "123",
        project_name: "Test Project",
        hourly_rate: 150,
        margin: 0.35,
        ssn: "123-45-6789",
        status: "active",
    };

    it("exec sees all fields unmasked", () => {
        const result = maskSensitiveFields(record, "exec");
        expect(result.hourly_rate).toBe(150);
        expect(result.margin).toBe(0.35);
        expect(result.ssn).toBe("123-45-6789");
    });

    it("vendor gets sensitive fields nulled", () => {
        const result = maskSensitiveFields(record, "vendor");
        expect(result.id).toBe("123");
        expect(result.project_name).toBe("Test Project");
        expect(result.status).toBe("active");
        expect(result.hourly_rate).toBeNull();
        expect(result.margin).toBeNull();
        expect(result.ssn).toBeNull();
    });

    it("pm sees hourly_rate but not margin or ssn", () => {
        const result = maskSensitiveFields(record, "pm");
        expect(result.hourly_rate).toBe(150);
        expect(result.margin).toBeNull();
        expect(result.ssn).toBeNull();
    });

    it("does not mutate the original object", () => {
        const original = { ...record };
        maskSensitiveFields(record, "vendor");
        expect(record).toEqual(original);
    });
});

// ─── shouldRevokeAccess ─────────────────────────────────────

describe("shouldRevokeAccess", () => {
    it("never revokes exec access", () => {
        const pastDate = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
        expect(shouldRevokeAccess("exec", pastDate)).toBe(false);
    });

    it("never revokes pm access", () => {
        const pastDate = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
        expect(shouldRevokeAccess("pm", pastDate)).toBe(false);
    });

    it("does not revoke if no load-out date", () => {
        expect(shouldRevokeAccess("client", null)).toBe(false);
        expect(shouldRevokeAccess("vendor", null)).toBe(false);
    });

    it("does not revoke before 48 hours", () => {
        const recentDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        expect(shouldRevokeAccess("client", recentDate)).toBe(false);
        expect(shouldRevokeAccess("vendor", recentDate)).toBe(false);
    });

    it("revokes client/vendor access after 48 hours", () => {
        const oldDate = new Date(Date.now() - 49 * 60 * 60 * 1000).toISOString();
        expect(shouldRevokeAccess("client", oldDate)).toBe(true);
        expect(shouldRevokeAccess("vendor", oldDate)).toBe(true);
    });
});

// ─── resolvePermissionsFromGrants ───────────────────────────

describe("resolvePermissionsFromGrants", () => {
    it("resolves allow grants into permissions", () => {
        const grants = [
            grant("projects", "read"),
            grant("projects", "write"),
            grant("tasks", "read"),
        ];
        const perms = resolvePermissionsFromGrants(grants);
        expect(perms).toHaveLength(2);
        const projectPerm = perms.find((p) => p.resource === "projects");
        expect(projectPerm?.actions).toContain("read");
        expect(projectPerm?.actions).toContain("write");
    });

    it("removes denied actions", () => {
        const grants = [
            grant("projects", "read"),
            grant("projects", "write"),
            grant("projects", "write", "deny"),
        ];
        const perms = resolvePermissionsFromGrants(grants);
        const projectPerm = perms.find((p) => p.resource === "projects");
        expect(projectPerm?.actions).toContain("read");
        expect(projectPerm?.actions).not.toContain("write");
    });

    it("removes resource entirely if all actions denied", () => {
        const grants = [
            grant("secrets", "read"),
            grant("secrets", "read", "deny"),
        ];
        const perms = resolvePermissionsFromGrants(grants);
        expect(perms.find((p) => p.resource === "secrets")).toBeUndefined();
    });

    it("returns empty array for empty grants", () => {
        expect(resolvePermissionsFromGrants([])).toEqual([]);
    });
});
