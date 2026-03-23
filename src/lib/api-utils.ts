/* ═══════════════════════════════════════════════════════════════
   API UTILITIES — Standard error envelope & request validation
   FIND-022 / FIND-026: Consistent API error responses + Zod validation
   ═══════════════════════════════════════════════════════════════ */

import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";

// ─── Standard Error Envelope ─────────────────────────────────
export interface ApiErrorPayload {
    error: {
        code: string;
        message: string;
        details?: Record<string, string[]> | undefined;
        requestId?: string | undefined;
    };
}

export function generateRequestId(): string {
    return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function apiError(
    code: string,
    message: string,
    status: number,
    details?: Record<string, string[]>
): NextResponse<ApiErrorPayload> {
    return NextResponse.json(
        {
            error: {
                code,
                message,
                ...(details && { details }),
                requestId: generateRequestId(),
            },
        },
        { status }
    );
}

// ─── Common Error Factories ──────────────────────────────────
export const ApiErrors = {
    unauthorized: (message = "Authentication required") => apiError("UNAUTHORIZED", message, 401),

    forbidden: (message = "Insufficient permissions") => apiError("FORBIDDEN", message, 403),

    notFound: (resource = "Resource") => apiError("NOT_FOUND", `${resource} not found`, 404),

    conflict: (message: string) => apiError("CONFLICT", message, 409),

    gone: (message: string) => apiError("GONE", message, 410),

    validationError: (details: Record<string, string[]>) =>
        apiError("VALIDATION_ERROR", "Request validation failed", 422, details),

    badRequest: (message: string) => apiError("BAD_REQUEST", message, 400),

    badGateway: (message = "Upstream service failed") => apiError("BAD_GATEWAY", message, 502),

    serviceUnavailable: (message = "Service unavailable") =>
        apiError("SERVICE_UNAVAILABLE", message, 503),

    internalError: (message = "An unexpected error occurred") =>
        apiError("INTERNAL_ERROR", message, 500),
} as const;

// ─── Request Body Validation ─────────────────────────────────
export async function parseAndValidate<T>(
    request: Request,
    schema: ZodSchema<T>
): Promise<
    { success: true; data: T } | { success: false; response: NextResponse<ApiErrorPayload> }
> {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return {
            success: false,
            response: apiError("INVALID_JSON", "Request body must be valid JSON", 400),
        };
    }

    const result = schema.safeParse(body);
    if (!result.success) {
        const details: Record<string, string[]> = {};
        for (const issue of result.error.issues) {
            const path = issue.path.join(".") || "_root";
            if (!details[path]) details[path] = [];
            details[path]!.push(issue.message);
        }
        return {
            success: false,
            response: ApiErrors.validationError(details),
        };
    }

    return { success: true, data: result.data };
}
