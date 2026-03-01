import { describe, it, expect, beforeEach } from "vitest";
import { permissionCache, cachedPermissionCheck, type CachedPermission } from "@/lib/permission-cache";

beforeEach(() => {
    permissionCache.clear();
});

// ─── PermissionCache basic operations ───────────────────────

describe("PermissionCache", () => {
    const userId = "user-1";
    const orgId = "org-1";
    const entry: CachedPermission = {
        role: "pm",
        orgId,
        grants: [
            { resource: "projects", action: "read", scope_id: null, effect: "allow" },
        ],
        cachedAt: Date.now(),
    };

    it("returns null for missing keys", () => {
        expect(permissionCache.get(userId, orgId)).toBeNull();
    });

    it("stores and retrieves entries", () => {
        permissionCache.set(userId, orgId, entry);
        const cached = permissionCache.get(userId, orgId);
        expect(cached).not.toBeNull();
        expect(cached?.role).toBe("pm");
        expect(cached?.orgId).toBe(orgId);
    });

    it("isolates entries by userId + orgId", () => {
        permissionCache.set("user-a", "org-1", { ...entry, role: "exec" });
        permissionCache.set("user-b", "org-1", { ...entry, role: "vendor" });
        expect(permissionCache.get("user-a", "org-1")?.role).toBe("exec");
        expect(permissionCache.get("user-b", "org-1")?.role).toBe("vendor");
    });

    it("invalidate removes a specific user+org entry", () => {
        permissionCache.set(userId, orgId, entry);
        permissionCache.set(userId, "org-2", { ...entry, orgId: "org-2" });
        expect(permissionCache.size).toBe(2);

        permissionCache.invalidate(userId, orgId);
        expect(permissionCache.get(userId, orgId)).toBeNull();
        expect(permissionCache.get(userId, "org-2")).not.toBeNull();
    });

    it("invalidate without orgId removes all entries for user", () => {
        permissionCache.set(userId, "org-1", entry);
        permissionCache.set(userId, "org-2", { ...entry, orgId: "org-2" });
        permissionCache.set("other-user", "org-1", { ...entry, role: "exec" });
        expect(permissionCache.size).toBe(3);

        permissionCache.invalidate(userId);
        expect(permissionCache.size).toBe(1);
        expect(permissionCache.get(userId, "org-1")).toBeNull();
        expect(permissionCache.get(userId, "org-2")).toBeNull();
        expect(permissionCache.get("other-user", "org-1")).not.toBeNull();
    });

    it("invalidateOrg removes all entries for an org", () => {
        permissionCache.set("user-a", orgId, entry);
        permissionCache.set("user-b", orgId, { ...entry, role: "vendor" });
        permissionCache.set("user-a", "org-2", { ...entry, orgId: "org-2" });
        expect(permissionCache.size).toBe(3);

        permissionCache.invalidateOrg(orgId);
        expect(permissionCache.size).toBe(1);
        expect(permissionCache.get("user-a", orgId)).toBeNull();
        expect(permissionCache.get("user-b", orgId)).toBeNull();
        expect(permissionCache.get("user-a", "org-2")).not.toBeNull();
    });

    it("clear removes all entries", () => {
        permissionCache.set("a", "1", entry);
        permissionCache.set("b", "2", entry);
        permissionCache.clear();
        expect(permissionCache.size).toBe(0);
    });

    it("prune on fresh entries removes nothing", () => {
        permissionCache.set(userId, orgId, entry);
        const pruned = permissionCache.prune();
        expect(pruned).toBe(0);
        expect(permissionCache.size).toBe(1);
    });
});

// ─── cachedPermissionCheck ──────────────────────────────────

describe("cachedPermissionCheck", () => {
    const userId = "user-1";
    const orgId = "org-1";
    const resolved: CachedPermission = {
        role: "pm",
        orgId,
        grants: [
            { resource: "projects", action: "read", scope_id: null, effect: "allow" },
        ],
        cachedAt: Date.now(),
    };

    it("calls resolver on cache miss", async () => {
        let resolverCalls = 0;
        const result = await cachedPermissionCheck(userId, orgId, async () => {
            resolverCalls++;
            return resolved;
        });
        expect(resolverCalls).toBe(1);
        expect(result.role).toBe("pm");
    });

    it("returns cached value on cache hit without calling resolver", async () => {
        // Prime the cache
        await cachedPermissionCheck(userId, orgId, async () => resolved);

        let resolverCalls = 0;
        const result = await cachedPermissionCheck(userId, orgId, async () => {
            resolverCalls++;
            return { ...resolved, role: "exec" };
        });
        expect(resolverCalls).toBe(0);
        expect(result.role).toBe("pm"); // original cached value
    });

    it("calls resolver again after invalidation", async () => {
        // Prime
        await cachedPermissionCheck(userId, orgId, async () => resolved);

        // Invalidate
        permissionCache.invalidate(userId, orgId);

        let resolverCalls = 0;
        const result = await cachedPermissionCheck(userId, orgId, async () => {
            resolverCalls++;
            return { ...resolved, role: "exec" };
        });
        expect(resolverCalls).toBe(1);
        expect(result.role).toBe("exec");
    });
});
