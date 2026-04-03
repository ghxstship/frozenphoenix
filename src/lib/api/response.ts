/* ═══════════════════════════════════════════════════════════════
   API RESPONSE UTILITIES — TITANIUM STANDARD L3

   Canonical response envelope, error mapping, and Zod validation
   wrapper for all API route handlers.

   Usage:
     import { apiSuccess, apiCreated, apiError, withValidation } from "@/lib/api/response";

     // Success
     return apiSuccess(data);
     return apiCreated(record);
     return apiSuccess(records, { page: 1, totalCount: 42 });

     // Error mapping (from AppError)
     return apiError(new NotFoundError("Project not found"));

     // Validated route handler
     export const POST = withValidation(bodySchema, async (validated, req) => {
       // validated is the parsed Zod result
       return apiSuccess(await createProject(validated));
     });
   ═══════════════════════════════════════════════════════════════ */

import { NextResponse } from "next/server";
import { type ZodError, type ZodType } from "zod";
import { AppError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";

// ─── Response Envelope Types ─────────────────────────────────

export interface ApiSuccessResponse<T> {
    data: T;
    meta?: {
        page?: number;
        pageSize?: number;
        totalCount?: number;
        timestamp?: string;
    };
}

export interface ApiErrorResponse {
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
}

// ─── Success Helpers ─────────────────────────────────────────

/**
 * Return a 200 OK response with the canonical success envelope.
 */
export function apiSuccess<T>(
    data: T,
    meta?: ApiSuccessResponse<T>["meta"],
    status = 200
): NextResponse<ApiSuccessResponse<T>> {
    return NextResponse.json(
        {
            data,
            ...(meta ? { meta: { ...meta, timestamp: new Date().toISOString() } } : {}),
        },
        { status }
    );
}

/**
 * Return a 201 Created response.
 */
export function apiCreated<T>(data: T): NextResponse<ApiSuccessResponse<T>> {
    return apiSuccess(data, undefined, 201);
}

/**
 * Return a 204 No Content response (e.g., successful DELETE).
 */
export function apiNoContent(): NextResponse {
    return new NextResponse(null, { status: 204 });
}

// ─── Error Helpers ───────────────────────────────────────────

/**
 * Map an AppError (or unknown error) to a canonical error response.
 * Never leaks stack traces or internal state to the client.
 */
export function apiError(
    error: unknown,
    context?: Record<string, unknown>
): NextResponse<ApiErrorResponse> {
    if (error instanceof AppError) {
        logger.error(error.message, {
            code: error.code,
            statusCode: error.statusCode,
            ...error.context,
            ...context,
        });

        return NextResponse.json(
            {
                error: {
                    code: error.code,
                    message: error.message,
                },
            },
            { status: error.statusCode }
        );
    }

    // Unknown/unhandled error — log full details, return sanitized 500
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    logger.error("Unhandled error in API route", {
        error: message,
        stack: error instanceof Error ? error.stack : undefined,
        ...context,
    });

    return NextResponse.json(
        {
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "An unexpected error occurred",
            },
        },
        { status: 500 }
    );
}

// ─── Zod Validation Wrapper ──────────────────────────────────

/**
 * Format a ZodError into a human-readable details object.
 */
function formatZodError(error: ZodError): Record<string, string[]> {
    const details: Record<string, string[]> = {};
    for (const issue of error.issues) {
        const path = issue.path.join(".") || "_root";
        if (!details[path]) details[path] = [];
        details[path].push(issue.message);
    }
    return details;
}

/**
 * Wrap an API route handler with Zod body validation.
 * If validation fails, a 400 response is returned automatically.
 *
 * @example
 * ```ts
 * const bodySchema = z.object({ name: z.string().min(1) });
 *
 * export const POST = withValidation(bodySchema, async (data, request) => {
 *   const project = await createProject(data);
 *   return apiCreated(project);
 * });
 * ```
 */
export function withValidation<T>(
    schema: ZodType<T>,
    handler: (data: T, request: Request) => Promise<NextResponse>
) {
    return async (request: Request): Promise<NextResponse> => {
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return apiError(
                new ValidationError("Invalid or missing JSON body", {
                    contentType: request.headers.get("content-type"),
                })
            );
        }

        const result = schema.safeParse(body);
        if (!result.success) {
            return apiError(
                new ValidationError("Request validation failed", {
                    details: formatZodError(result.error),
                })
            );
        }

        try {
            return await handler(result.data, request);
        } catch (error) {
            return apiError(error, { route: request.url });
        }
    };
}
