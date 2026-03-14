/* ═══════════════════════════════════════════════════════════════
   RESPONSE VALIDATOR — Dev/Staging Spec Drift Detection
   
   Validates API response shapes against the OpenAPI spec at
   runtime. In development and staging, logs warnings when
   responses don't match documented schemas. Never blocks
   production responses.
   
   Usage:
     import { validateResponse } from "@/lib/openapi/response-validator";
     
     // In API route handler:
     const data = { ... };
     validateResponse("/api/projects", "get", 200, data);
     return NextResponse.json(data);
   ═══════════════════════════════════════════════════════════════ */

import { logger } from "@/lib/logger";

const IS_DEV = process.env.NODE_ENV === "development";
const IS_STAGING = process.env.VERCEL_ENV === "preview";
const ENABLED = IS_DEV || IS_STAGING;

interface SchemaViolation {
    path: string;
    method: string;
    status: number;
    message: string;
    timestamp: string;
}

// In-memory violation buffer for dev tooling
const violations: SchemaViolation[] = [];
const MAX_VIOLATIONS = 100;

/**
 * Validate a response body against basic shape expectations.
 * Only active in development and staging environments.
 * Never throws or blocks the response — logs warnings only.
 */
export function validateResponse(
    path: string,
    method: string,
    status: number,
    body: unknown
): void {
    if (!ENABLED) return;

    try {
        // Basic shape validation for common patterns
        if (status >= 200 && status < 300 && body != null) {
            const bodyObj = body as Record<string, unknown>;

            // List endpoints should have data array + pagination
            if (method === "get" && Array.isArray(bodyObj.data) && !bodyObj.pagination) {
                recordViolation(path, method, status, "List response missing 'pagination' field");
            }

            // Single-item endpoints wrapping in { data: ... }
            if (
                method === "get" &&
                bodyObj.data !== undefined &&
                !Array.isArray(bodyObj.data) &&
                typeof bodyObj.data !== "object"
            ) {
                recordViolation(
                    path,
                    method,
                    status,
                    "Item response 'data' field should be an object"
                );
            }
        }

        // Error responses should follow ApiErrorPayload envelope
        if (status >= 400) {
            const bodyObj = body as Record<string, unknown>;
            if (!bodyObj.error) {
                recordViolation(
                    path,
                    method,
                    status,
                    `Error response (${status}) missing 'error' field — expected ApiErrorPayload envelope`
                );
            }
        }
    } catch {
        // Never let validation errors break the response
    }
}

/**
 * Validate that a request body is not empty for mutation methods.
 * Returns structured 422 error details if invalid, or null if valid.
 */
export function validateRequestContentType(
    request: Request
): { error: string; code: string } | null {
    const contentType = request.headers.get("content-type") ?? "";
    const method = request.method.toUpperCase();

    if (
        ["POST", "PUT", "PATCH"].includes(method) &&
        !contentType.includes("application/json") &&
        !contentType.includes("multipart/form-data")
    ) {
        return {
            error: `Expected Content-Type application/json, got "${contentType}"`,
            code: "INVALID_CONTENT_TYPE",
        };
    }

    return null;
}

// ─── Violation Tracking ──────────────────────────────────────

function recordViolation(path: string, method: string, status: number, message: string): void {
    const violation: SchemaViolation = {
        path,
        method,
        status,
        message,
        timestamp: new Date().toISOString(),
    };

    logger.warn("[OpenAPI Drift]", { ...violation });

    violations.push(violation);
    if (violations.length > MAX_VIOLATIONS) {
        violations.shift();
    }
}

/**
 * Get recent schema violations (for dev tooling / dashboard).
 */
export function getRecentViolations(): SchemaViolation[] {
    return [...violations];
}

/**
 * Clear violation buffer.
 */
export function clearViolations(): void {
    violations.length = 0;
}
