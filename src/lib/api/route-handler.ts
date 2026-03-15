/* ═══════════════════════════════════════════════════════════════
   API Route Handler Wrapper — H-007 / H-009 / H-013
   
   Provides:
   1. Top-level try/catch with structured error logging
   2. Per-route rate limiting for mutation endpoints
   3. Request-scoped child logger with correlation ID
   
   Usage:
     import { withRouteHandler } from "@/lib/api/route-handler";
     
     export const POST = withRouteHandler(async (req, { log }) => {
         log.info("Processing request");
         // ... handler logic
         return NextResponse.json({ data: result });
     }, { rateLimit: { windowMs: 60_000, max: 30 } });
   ═══════════════════════════════════════════════════════════════ */

import { type NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { ApiErrors } from "@/lib/api-utils";
import { rateLimit as createRateLimiter, getClientId, rateLimitResponse } from "@/lib/rate-limit";

// ─── Types ───────────────────────────────────────────────────

interface RateLimitConfig {
    /** Window duration in milliseconds. Default: 60_000 (1 min). */
    windowMs?: number;
    /** Maximum requests per window. Default: 30. */
    max?: number;
}

interface RouteHandlerOptions {
    /** Enable rate limiting for this route. Pass `true` for defaults or a config object. */
    rateLimit?: boolean | RateLimitConfig;
}

type Logger = ReturnType<typeof logger.child>;

interface HandlerContext {
    /** Request-scoped logger with correlation ID */
    log: Logger;
    /** Unique request correlation ID */
    requestId: string;
}

type RouteHandlerFn = (
    req: NextRequest,
    ctx: HandlerContext,
    routeCtx?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse>;

// ─── Limiter Cache ───────────────────────────────────────────
// One limiter instance per unique config key to avoid re-creation
const limiterCache = new Map<string, ReturnType<typeof createRateLimiter>>();

function getLimiter(config: RateLimitConfig): ReturnType<typeof createRateLimiter> {
    const key = `${config.windowMs ?? 60_000}:${config.max ?? 30}`;
    let limiter = limiterCache.get(key);
    if (!limiter) {
        limiter = createRateLimiter({
            windowMs: config.windowMs ?? 60_000,
            max: config.max ?? 30,
        });
        limiterCache.set(key, limiter);
    }
    return limiter;
}

// ─── Request ID ──────────────────────────────────────────────

function generateRequestId(): string {
    return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Wrapper ─────────────────────────────────────────────────

/**
 * Wrap a Next.js API route handler with:
 * - Correlation ID injection
 * - Request-scoped child logger
 * - Optional rate limiting
 * - Top-level error boundary
 */
export function withRouteHandler(
    handler: RouteHandlerFn,
    options?: RouteHandlerOptions,
) {
    // Pre-create limiter if rate limiting is enabled
    const rateLimitConfig = options?.rateLimit
        ? typeof options.rateLimit === "object"
            ? options.rateLimit
            : {}
        : null;
    const limiter = rateLimitConfig ? getLimiter(rateLimitConfig) : null;

    return async function wrappedHandler(
        req: NextRequest,
        routeCtx?: { params: Promise<Record<string, string>> },
    ): Promise<NextResponse> {
        const requestId = generateRequestId();
        const log = logger.child({
            requestId,
            method: req.method,
            path: req.nextUrl.pathname,
        });

        try {
            // Rate limit check
            if (limiter) {
                const clientId = getClientId(req);
                const check = limiter.check(clientId);
                if (!check.allowed) {
                    log.warn("Rate limit exceeded", { clientId });
                    return rateLimitResponse(check.retryAfterSeconds);
                }
            }

            const response = await handler(req, { log, requestId }, routeCtx);

            // Inject correlation ID header
            response.headers.set("X-Request-Id", requestId);
            return response;
        } catch (err) {
            log.error("Unhandled API error", {
                error: err instanceof Error ? err.message : String(err),
                stack: err instanceof Error ? err.stack : undefined,
            });
            const errorResponse = ApiErrors.internalError();
            errorResponse.headers.set("X-Request-Id", requestId);
            return errorResponse;
        }
    };
}
