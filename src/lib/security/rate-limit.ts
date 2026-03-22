/* ═══════════════════════════════════════════════════════════════
   L-004: Server-Side Rate Limiting with Retry-After Header
   ═══════════════════════════════════════════════════════════════
   
   In-memory sliding window rate limiter for API routes.
   Returns a 429 response with standard Retry-After header when
   the limit is exceeded.
   
   Usage:
     import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
     
     const limiter = rateLimit({ windowMs: 60_000, max: 10 });
     
     export async function POST(req: Request) {
         const check = limiter.check(getClientId(req));
         if (!check.allowed) return rateLimitResponse(check.retryAfterSeconds);
         // ... handle request
     }
   ═══════════════════════════════════════════════════════════════ */

import { NextResponse } from "next/server";

interface RateLimitOptions {
    /** Window duration in milliseconds. Default: 60_000 (1 minute). */
    windowMs?: number;
    /** Maximum requests per window. Default: 30. */
    max?: number;
}

interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    retryAfterSeconds: number;
}

interface WindowEntry {
    timestamps: number[];
}

/**
 * Create a rate limiter instance scoped to a logical endpoint.
 * Uses an in-memory sliding window — suitable for single-instance
 * deployments. For distributed systems, swap with Redis.
 */
export function rateLimit(options: RateLimitOptions = {}) {
    const windowMs = options.windowMs ?? 60_000;
    const max = options.max ?? 30;
    const store = new Map<string, WindowEntry>();

    // Periodic cleanup to prevent memory leaks
    const CLEANUP_INTERVAL = Math.max(windowMs * 2, 120_000);
    let lastCleanup = Date.now();

    function cleanup(now: number) {
        if (now - lastCleanup < CLEANUP_INTERVAL) return;
        lastCleanup = now;
        for (const [key, entry] of store.entries()) {
            entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
            if (entry.timestamps.length === 0) store.delete(key);
        }
    }

    return {
        check(clientId: string): RateLimitResult {
            const now = Date.now();
            cleanup(now);

            let entry = store.get(clientId);
            if (!entry) {
                entry = { timestamps: [] };
                store.set(clientId, entry);
            }

            // Slide the window
            entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

            if (entry.timestamps.length >= max) {
                const oldestInWindow = entry.timestamps[0]!;
                const retryAfterMs = oldestInWindow + windowMs - now;
                return {
                    allowed: false,
                    remaining: 0,
                    retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
                };
            }

            entry.timestamps.push(now);
            return {
                allowed: true,
                remaining: max - entry.timestamps.length,
                retryAfterSeconds: 0,
            };
        },
    };
}

/**
 * Build a standard 429 Too Many Requests response with Retry-After header.
 */
export function rateLimitResponse(retryAfterSeconds: number): NextResponse {
    return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
            status: 429,
            headers: {
                "Retry-After": String(Math.max(1, retryAfterSeconds)),
                "X-RateLimit-Reset": new Date(Date.now() + retryAfterSeconds * 1000).toISOString(),
            },
        }
    );
}

/**
 * Extract a client identifier from a request.
 * Uses X-Forwarded-For → X-Real-IP → "anonymous" fallback.
 */
export function getClientId(req: Request): string {
    const headers = new Headers(req.headers);
    return (
        headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headers.get("x-real-ip") ||
        "anonymous"
    );
}
