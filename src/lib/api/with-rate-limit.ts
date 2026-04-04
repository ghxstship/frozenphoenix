/* ═══════════════════════════════════════════════════════════════
   WRITE RATE LIMITER — TITANIUM STANDARD L3

   Middleware-level rate limiter applied to all state-mutating API
   operations (POST, PUT, PATCH, DELETE). Uses a tiered strategy:

   - Auth endpoints:  5 req/min  (brute-force protection)
   - Write endpoints: 30 req/min (standard write throttle)
   - Read endpoints:  120 req/min (relaxed)

   Usage (applied in individual route handlers):
     import { withWriteRateLimit } from "@/lib/api/with-rate-limit";

     export const POST = withWriteRateLimit(async (request) => {
       // ... your handler
     });

   Or compose with withPermission:
     export const POST = withWriteRateLimit(
       withPermission("projects", "write", async (request, ctx) => {
         // ... your handler
       })
     );
   ═══════════════════════════════════════════════════════════════ */

import { NextResponse } from "next/server";
import { getClientId, rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

// ─── Tiered Rate Limiters ────────────────────────────────────

/** Auth endpoints: strict (5/min) to prevent brute-force */
const authLimiter = rateLimit({ windowMs: 60_000, max: 5 });

/** Write endpoints: moderate (30/min) */
const writeLimiter = rateLimit({ windowMs: 60_000, max: 30 });

/** Read endpoints: relaxed (120/min) */
const readLimiter = rateLimit({ windowMs: 60_000, max: 120 });

// ─── Middleware Wrappers ─────────────────────────────────────

type RouteHandler = (request: Request, context?: unknown) => Promise<NextResponse>;

/**
 * Apply write-tier rate limiting (30 req/min per client).
 * Use on POST/PUT/PATCH/DELETE route handlers.
 */
export function withWriteRateLimit(handler: RouteHandler): RouteHandler {
    return async (request: Request, context?: unknown) => {
        const clientId = getClientId(request);
        const check = writeLimiter.check(clientId);
        if (!check.allowed) return rateLimitResponse(check.retryAfterSeconds);
        return handler(request, context);
    };
}

/**
 * Apply auth-tier rate limiting (5 req/min per client).
 * Use on login, signup, password reset, MFA routes.
 */
export function withAuthRateLimit(handler: RouteHandler): RouteHandler {
    return async (request: Request, context?: unknown) => {
        const clientId = getClientId(request);
        const check = authLimiter.check(clientId);
        if (!check.allowed) return rateLimitResponse(check.retryAfterSeconds);
        return handler(request, context);
    };
}

/**
 * Apply read-tier rate limiting (120 req/min per client).
 * Use on high-traffic GET endpoints that need throttling.
 */
export function withReadRateLimit(handler: RouteHandler): RouteHandler {
    return async (request: Request, context?: unknown) => {
        const clientId = getClientId(request);
        const check = readLimiter.check(clientId);
        if (!check.allowed) return rateLimitResponse(check.retryAfterSeconds);
        return handler(request, context);
    };
}
