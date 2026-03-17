/* ═══════════════════════════════════════════════════════════════
   API HANDLER WRAPPER — Hardening for custom (non-CRUD) routes
   
   Provides:
   - Request-scoped correlation ID (X-Request-Id header)
   - Child logger with request context
   - Top-level try/catch (prevents unhandled promise rejections)
   - Optional mutation rate limiting
   - Optional RBAC enforcement
   - Consistent error envelope
   
   Usage:
     export const POST = withApiHandler({
         method: "POST",
         route: "/api/approval-engine/decide",
         mutation: true,
         rbac: { resource: "approvals", action: "write" },
     }, async (request, { log, supabase, user, role }) => {
         // ... handler logic, just return NextResponse
     });
   ═══════════════════════════════════════════════════════════════ */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { hasPermission } from "@/config/rbac";
import type { PermissionLevel } from "@/types";
import { logger } from "@/lib/logger";
import { getClientId, rateLimit, rateLimitResponse } from "@/lib/rate-limit";

// ─── Shared Mutation Rate Limiter ────────────────────────────
// 30 mutations per minute per client across all custom endpoints
const customMutationLimiter = rateLimit({ windowMs: 60_000, max: 30 });

// ─── Auth Rate Limiter (stricter) ────────────────────────────
// 10 auth attempts per minute per client
const authLimiter = rateLimit({ windowMs: 60_000, max: 10 });

function generateRequestId(): string {
    return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Valid roles for cookie validation ───────────────────────
const VALID_ROLES = new Set<string>(["exec", "director", "pm", "member", "client", "collaborator"]);

async function resolveUserRole(
    supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
    userId: string,
    cachedRole?: string | null
): Promise<PermissionLevel> {
    if (cachedRole && VALID_ROLES.has(cachedRole)) {
        return cachedRole as PermissionLevel;
    }

    const { data } = await supabase
        .from("org_memberships")
        .select("role")
        .eq("user_id", userId)
        .eq("is_default_org", true)
        .single();

    return (data?.role as PermissionLevel) ?? "member";
}

// ─── Types ───────────────────────────────────────────────────

type LoggerInstance = ReturnType<typeof logger.child>;

export interface HandlerContext {
    log: LoggerInstance;
    requestId: string;
    supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>;
    user: { id: string; email?: string };
    role: PermissionLevel;
    orgId: string;
}

export interface HandlerOptions {
    /** HTTP method for logging */
    method: string;
    /** Route path for logging */
    route: string;
    /** If true, applies mutation rate limiting (default: false) */
    mutation?: boolean;
    /** If true, applies stricter auth rate limiting (default: false) */
    authRoute?: boolean;
    /** RBAC check — if provided, enforced before handler runs */
    rbac?: { resource: string; action: "read" | "write" | "delete" };
    /** If true, skips auth check (for public/internal endpoints) */
    skipAuth?: boolean;
}

type HandlerFn = (
    request: NextRequest,
    context: HandlerContext
) => Promise<NextResponse | Response>;

type HandlerWithParamsFn = (
    request: NextRequest,
    context: HandlerContext,
    routeContext: { params: Promise<{ [key: string]: string }> }
) => Promise<NextResponse | Response>;

// ─── Wrapper (no route params) ───────────────────────────────

export function withApiHandler(
    options: HandlerOptions,
    handler: HandlerFn
): (request: NextRequest) => Promise<Response> {
    return async (request: NextRequest) => {
        const requestId = generateRequestId();
        const log = logger.child({
            requestId,
            method: options.method,
            route: options.route,
        });

        try {
            // Rate limiting
            if (options.mutation) {
                const rlCheck = customMutationLimiter.check(getClientId(request));
                if (!rlCheck.allowed) {
                    log.warn("Rate limit exceeded (mutation)");
                    return rateLimitResponse(rlCheck.retryAfterSeconds);
                }
            }
            if (options.authRoute) {
                const rlCheck = authLimiter.check(getClientId(request));
                if (!rlCheck.allowed) {
                    log.warn("Rate limit exceeded (auth)");
                    return rateLimitResponse(rlCheck.retryAfterSeconds);
                }
            }

            // Auth
            if (options.skipAuth) {
                const result = await handler(request, {
                    log,
                    requestId,
                    supabase: null as unknown as HandlerContext["supabase"],
                    user: { id: "anonymous" },
                    role: "member" as PermissionLevel,
                    orgId: "",
                });
                result.headers.set("X-Request-Id", requestId);
                return result;
            }

            const supabase = await createClient();
            if (!supabase) return ApiErrors.serviceUnavailable();

            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return ApiErrors.unauthorized();

            const cachedRole = request.cookies.get("fp-user-role")?.value;
            const role = await resolveUserRole(supabase, user.id, cachedRole);

            // Resolve orgId from default org membership
            const { data: orgMembership } = await supabase
                .from("org_memberships")
                .select("organization_id")
                .eq("user_id", user.id)
                .eq("is_default_org", true)
                .single();
            const orgId = orgMembership?.organization_id ?? "";

            // RBAC
            if (options.rbac) {
                if (!hasPermission(role, options.rbac.resource, options.rbac.action)) {
                    return ApiErrors.forbidden(
                        `Role "${role}" cannot ${options.rbac.action} ${options.rbac.resource}`
                    );
                }
            }

            const result = await handler(request, {
                log,
                requestId,
                supabase,
                user: { id: user.id, email: user.email },
                role,
                orgId,
            });
            result.headers.set("X-Request-Id", requestId);
            return result;
        } catch (err) {
            log.error("Unhandled error in API handler", {
                error: err instanceof Error ? err.message : String(err),
                stack: err instanceof Error ? err.stack : undefined,
            });
            return ApiErrors.internalError();
        }
    };
}

// ─── Wrapper (with route params) ─────────────────────────────

export function withApiHandlerParams(
    options: HandlerOptions,
    handler: HandlerWithParamsFn
): (
    request: NextRequest,
    routeContext: { params: Promise<{ [key: string]: string }> }
) => Promise<Response> {
    return async (
        request: NextRequest,
        routeContext: { params: Promise<{ [key: string]: string }> }
    ) => {
        const requestId = generateRequestId();
        const log = logger.child({
            requestId,
            method: options.method,
            route: options.route,
        });

        try {
            // Rate limiting
            if (options.mutation) {
                const rlCheck = customMutationLimiter.check(getClientId(request));
                if (!rlCheck.allowed) {
                    log.warn("Rate limit exceeded (mutation)");
                    return rateLimitResponse(rlCheck.retryAfterSeconds);
                }
            }
            if (options.authRoute) {
                const rlCheck = authLimiter.check(getClientId(request));
                if (!rlCheck.allowed) {
                    log.warn("Rate limit exceeded (auth)");
                    return rateLimitResponse(rlCheck.retryAfterSeconds);
                }
            }

            const supabase = await createClient();
            if (!supabase) return ApiErrors.serviceUnavailable();

            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return ApiErrors.unauthorized();

            const cachedRole = request.cookies.get("fp-user-role")?.value;
            const role = await resolveUserRole(supabase, user.id, cachedRole);

            // Resolve orgId from default org membership
            const { data: orgMembership } = await supabase
                .from("org_memberships")
                .select("organization_id")
                .eq("user_id", user.id)
                .eq("is_default_org", true)
                .single();
            const orgId = orgMembership?.organization_id ?? "";

            // RBAC
            if (options.rbac) {
                if (!hasPermission(role, options.rbac.resource, options.rbac.action)) {
                    return ApiErrors.forbidden(
                        `Role "${role}" cannot ${options.rbac.action} ${options.rbac.resource}`
                    );
                }
            }

            const result = await handler(
                request,
                {
                    log,
                    requestId,
                    supabase,
                    user: { id: user.id, email: user.email },
                    role,
                    orgId,
                },
                routeContext
            );
            result.headers.set("X-Request-Id", requestId);
            return result;
        } catch (err) {
            log.error("Unhandled error in API handler", {
                error: err instanceof Error ? err.message : String(err),
                stack: err instanceof Error ? err.stack : undefined,
            });
            return ApiErrors.internalError();
        }
    };
}
