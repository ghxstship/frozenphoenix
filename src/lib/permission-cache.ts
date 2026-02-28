/* ═══════════════════════════════════════════════════════════════
   PERMISSION CACHE — Memoize resolved permissions per session
   
   Server-side LRU cache keyed by userId + orgId.
   TTL-based expiry ensures stale permissions don't persist.
   ═══════════════════════════════════════════════════════════════ */

interface CachedPermission {
    role: string;
    orgId: string;
    grants: Array<{
        resource: string;
        action: string;
        scope_id: string | null;
        effect: string;
    }>;
    cachedAt: number;
}

interface CacheEntry {
    key: string;
    value: CachedPermission;
    expiresAt: number;
}

const DEFAULT_TTL_MS = 60_000; // 1 minute
const MAX_ENTRIES = 500;

class PermissionCache {
    private cache = new Map<string, CacheEntry>();
    private ttlMs: number;
    private maxEntries: number;

    constructor(ttlMs = DEFAULT_TTL_MS, maxEntries = MAX_ENTRIES) {
        this.ttlMs = ttlMs;
        this.maxEntries = maxEntries;
    }

    private makeKey(userId: string, orgId: string): string {
        return `${userId}::${orgId}`;
    }

    get(userId: string, orgId: string): CachedPermission | null {
        const key = this.makeKey(userId, orgId);
        const entry = this.cache.get(key);

        if (!entry) return null;

        // Check TTL expiry
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.value;
    }

    set(userId: string, orgId: string, value: CachedPermission): void {
        const key = this.makeKey(userId, orgId);

        // Evict oldest entries if at capacity
        if (this.cache.size >= this.maxEntries && !this.cache.has(key)) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) this.cache.delete(oldestKey);
        }

        this.cache.set(key, {
            key,
            value,
            expiresAt: Date.now() + this.ttlMs,
        });
    }

    invalidate(userId: string, orgId?: string): void {
        if (orgId) {
            this.cache.delete(this.makeKey(userId, orgId));
        } else {
            // Invalidate all entries for this user across all orgs
            for (const [key] of this.cache) {
                if (key.startsWith(`${userId}::`)) {
                    this.cache.delete(key);
                }
            }
        }
    }

    invalidateOrg(orgId: string): void {
        for (const [key] of this.cache) {
            if (key.endsWith(`::${orgId}`)) {
                this.cache.delete(key);
            }
        }
    }

    clear(): void {
        this.cache.clear();
    }

    get size(): number {
        return this.cache.size;
    }

    /**
     * Prune expired entries. Call periodically to prevent memory leaks.
     */
    prune(): number {
        const now = Date.now();
        let pruned = 0;
        for (const [key, entry] of this.cache) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
                pruned++;
            }
        }
        return pruned;
    }
}

// Singleton instance for server-side use
export const permissionCache = new PermissionCache();

/**
 * Helper to check permission from cache, falling back to a resolver function.
 * This wraps the cache get/set pattern for convenience.
 */
export async function cachedPermissionCheck(
    userId: string,
    orgId: string,
    resolver: () => Promise<CachedPermission>
): Promise<CachedPermission> {
    const cached = permissionCache.get(userId, orgId);
    if (cached) return cached;

    const resolved = await resolver();
    permissionCache.set(userId, orgId, resolved);
    return resolved;
}

export type { CachedPermission };
