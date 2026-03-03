import { describe, expect, it } from "vitest";
import {
    type DbPermissionGrant,
    FIELD_VISIBILITY_MASKS,
    hasPermission,
    isFieldVisible,
    maskSensitiveFields,
    PERMISSION_MATRIX,
    resolvePermissionsFromGrants,
    shouldRevokeAccess,
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

    it("director has broad access with manage on key resources", () => {
        expect(hasPermission("director", "projects", "read")).toBe(true);
        expect(hasPermission("director", "projects", "write")).toBe(true);
        expect(hasPermission("director", "projects", "manage")).toBe(true);
        expect(hasPermission("director", "budgets", "manage")).toBe(true);
    });

    it("member has task execution access but limited scope", () => {
        expect(hasPermission("member", "tasks", "read")).toBe(true);
        expect(hasPermission("member", "tasks", "write")).toBe(true);
        expect(hasPermission("member", "projects", "read")).toBe(true);
        expect(hasPermission("member", "projects", "write")).toBe(false);
        expect(hasPermission("member", "payroll", "read")).toBe(false);
    });

    it("collaborator has minimal access", () => {
        expect(hasPermission("collaborator", "tasks", "read")).toBe(true);
        expect(hasPermission("collaborator", "projects", "read")).toBe(false);
        expect(hasPermission("collaborator", "payroll", "read")).toBe(false);
    });

    it("unknown resource returns false for non-exec roles", () => {
        expect(hasPermission("pm", "nonexistent_resource", "read")).toBe(false);
        expect(hasPermission("client", "nonexistent_resource", "read")).toBe(false);
        expect(hasPermission("collaborator", "nonexistent_resource", "read")).toBe(false);
    });

    it("exec can access unknown resources via wildcard", () => {
        expect(hasPermission("exec", "nonexistent_resource", "read")).toBe(true);
    });
});

// ─── hasPermission (DB grants) ──────────────────────────────

describe("hasPermission — DB grants", () => {
    it("allows via DB grant even if static matrix denies", () => {
        const grants = [grant("payroll", "read")];
        expect(hasPermission("collaborator", "payroll", "read", { dbGrants: grants })).toBe(true);
    });

    it("deny grant overrides allow", () => {
        const grants = [grant("projects", "read", "allow"), grant("projects", "read", "deny")];
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
    const levels: PermissionLevel[] = [
        "exec",
        "director",
        "pm",
        "member",
        "client",
        "collaborator",
    ];

    it("defines all six permission levels", () => {
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

    it("permission levels decrease in scope: director >= pm > member > client > collaborator", () => {
        const counts = levels.map((l) => PERMISSION_MATRIX[l].length);
        // exec has 1 (wildcard), director >= pm (director has broader actions, not necessarily more resources)
        expect(counts[1]).toBeGreaterThanOrEqual(counts[2]!);
        expect(counts[2]).toBeGreaterThan(counts[3]!);
        expect(counts[3]).toBeGreaterThan(counts[4]!);
        expect(counts[4]).toBeGreaterThan(counts[5]!);
    });
});

// ─── isFieldVisible ─────────────────────────────────────────

describe("isFieldVisible", () => {
    it("unrestricted fields are visible to all roles", () => {
        expect(isFieldVisible("exec", "project_name")).toBe(true);
        expect(isFieldVisible("collaborator", "project_name")).toBe(true);
    });

    it("exec can see all restricted fields", () => {
        for (const field of Object.keys(FIELD_VISIBILITY_MASKS)) {
            expect(isFieldVisible("exec", field)).toBe(true);
        }
    });

    it("collaborator cannot see financial fields", () => {
        expect(isFieldVisible("collaborator", "hourly_rate")).toBe(false);
        expect(isFieldVisible("collaborator", "margin")).toBe(false);
        expect(isFieldVisible("collaborator", "salary")).toBe(false);
    });

    it("director can see financial fields but not PII", () => {
        expect(isFieldVisible("director", "hourly_rate")).toBe(true);
        expect(isFieldVisible("director", "margin")).toBe(true);
        expect(isFieldVisible("director", "salary")).toBe(false);
    });

    it("member cannot see financial or PII fields", () => {
        expect(isFieldVisible("member", "hourly_rate")).toBe(false);
        expect(isFieldVisible("member", "margin")).toBe(false);
        expect(isFieldVisible("member", "salary")).toBe(false);
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

    it("collaborator gets sensitive fields nulled", () => {
        const result = maskSensitiveFields(record, "collaborator");
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
        maskSensitiveFields(record, "collaborator");
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

    it("never revokes director access", () => {
        const pastDate = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
        expect(shouldRevokeAccess("director", pastDate)).toBe(false);
    });

    it("never revokes member access", () => {
        const pastDate = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
        expect(shouldRevokeAccess("member", pastDate)).toBe(false);
    });

    it("does not revoke if no load-out date", () => {
        expect(shouldRevokeAccess("client", null)).toBe(false);
        expect(shouldRevokeAccess("collaborator", null)).toBe(false);
    });

    it("does not revoke before 48 hours", () => {
        const recentDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        expect(shouldRevokeAccess("client", recentDate)).toBe(false);
        expect(shouldRevokeAccess("collaborator", recentDate)).toBe(false);
    });

    it("revokes client/collaborator access after 48 hours", () => {
        const oldDate = new Date(Date.now() - 49 * 60 * 60 * 1000).toISOString();
        expect(shouldRevokeAccess("client", oldDate)).toBe(true);
        expect(shouldRevokeAccess("collaborator", oldDate)).toBe(true);
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
        const grants = [grant("secrets", "read"), grant("secrets", "read", "deny")];
        const perms = resolvePermissionsFromGrants(grants);
        expect(perms.find((p) => p.resource === "secrets")).toBeUndefined();
    });

    it("returns empty array for empty grants", () => {
        expect(resolvePermissionsFromGrants([])).toEqual([]);
    });
});
