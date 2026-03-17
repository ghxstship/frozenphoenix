/**
 * Server-side Rate Limiter (G15)
 *
 * In-memory sliding window rate limiter for API routes.
 * Supports per-tenant, per-API-key, and per-IP throttling.
 *
 * For production, replace the in-memory store with Redis or
 * Supabase-backed counters for multi-instance deployments.
 */

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

interface RateLimitEntry {
    count: number;
    windowStart: number;
}

const store = new Map<string, RateLimitEntry>();
const WINDOW_MS = 60 * 1000; // 1 minute
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Cleanup every 5 minutes

// Periodic cleanup of expired entries
if (typeof setInterval !== "undefined") {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of store) {
            if (now - entry.windowStart > WINDOW_MS * 2) {
                store.delete(key);
            }
        }
    }, CLEANUP_INTERVAL_MS);
}

export interface RateLimitConfig {
    maxRequests: number;
    windowMs?: number;
    keyPrefix?: string;
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    limit: number;
    resetAt: number;
}

/**
 * Check and increment rate limit for a given key.
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
    const windowMs = config.windowMs ?? WINDOW_MS;
    const now = Date.now();
    const fullKey = config.keyPrefix ? `${config.keyPrefix}:${key}` : key;

    const entry = store.get(fullKey);

    if (!entry || now - entry.windowStart >= windowMs) {
        // Start new window
        store.set(fullKey, { count: 1, windowStart: now });
        return {
            allowed: true,
            remaining: config.maxRequests - 1,
            limit: config.maxRequests,
            resetAt: now + windowMs,
        };
    }

    // Within existing window
    entry.count++;
    const remaining = Math.max(0, config.maxRequests - entry.count);
    const allowed = entry.count <= config.maxRequests;

    if (!allowed) {
        logger.warn("Rate limit exceeded", {
            key: fullKey,
            count: entry.count,
            limit: config.maxRequests,
        });
    }

    return {
        allowed,
        remaining,
        limit: config.maxRequests,
        resetAt: entry.windowStart + windowMs,
    };
}

/**
 * Add rate limit headers to a response.
 */
export function addRateLimitHeaders(response: NextResponse, result: RateLimitResult): NextResponse {
    response.headers.set("X-RateLimit-Limit", String(result.limit));
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    response.headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)));
    return response;
}

/**
 * Create a 429 Too Many Requests response with rate limit headers.
 */
export function rateLimitExceededResponse(result: RateLimitResult): NextResponse {
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
    const response = NextResponse.json(
        {
            error: "Too Many Requests",
            message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
            retry_after: retryAfter,
        },
        { status: 429 }
    );
    response.headers.set("Retry-After", String(retryAfter));
    return addRateLimitHeaders(response, result);
}

/**
 * Middleware helper — extract a rate limit key from a request.
 */
export function extractRateLimitKey(request: Request): string {
    // Priority: API key prefix > user ID > IP
    const authHeader = request.headers.get("authorization") ?? "";
    const apiKeyMatch = authHeader.match(/^Bearer (fpx_[a-f0-9]{8})/);
    if (apiKeyMatch) {
        return `apikey:${apiKeyMatch[1]}`;
    }

    // Fall back to IP address
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
    return `ip:${ip}`;
}
