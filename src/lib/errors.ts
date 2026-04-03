/* ═══════════════════════════════════════════════════════════════
   CANONICAL ERROR HIERARCHY — TITANIUM STANDARD L5
   
   Every application error inherits from AppError. Each subclass
   carries a machine-readable `code`, an HTTP `statusCode`, and
   optional structured `context` for debugging.
   
   Usage:
     import { NotFoundError, ValidationError } from "@/lib/errors";
     
     throw new NotFoundError("Project not found", { id: projectId });
     throw new ValidationError("Invalid email address", {
       field: "email",
       value: input.email,
     });
   
   Route handlers catch these and map to HTTP responses via
   `mapErrorToResponse()` from `@/lib/api/response`.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Base application error. All domain-specific errors inherit from this.
 * Never throw raw `Error` — always use a typed subclass.
 */
export class AppError extends Error {
    /** Machine-readable error code (e.g., "NOT_FOUND", "VALIDATION_ERROR"). */
    readonly code: string;
    /** HTTP status code to return when this error reaches the API boundary. */
    readonly statusCode: number;
    /** Structured metadata for debugging — never sent to clients in production. */
    readonly context?: Record<string, unknown> | undefined;

    constructor(
        message: string,
        code: string,
        statusCode: number,
        context?: Record<string, unknown>
    ) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;
        this.context = context;

        // Maintain proper prototype chain for instanceof checks
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

/**
 * Input validation failed (Zod parse, business rule constraint, etc.).
 * Maps to HTTP 400 Bad Request.
 */
export class ValidationError extends AppError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(message, "VALIDATION_ERROR", 400, context);
    }
}

/**
 * The caller is authenticated but lacks permission for this action.
 * Maps to HTTP 403 Forbidden.
 */
export class AuthorizationError extends AppError {
    constructor(
        message = "You do not have permission to perform this action",
        context?: Record<string, unknown>
    ) {
        super(message, "AUTHORIZATION_ERROR", 403, context);
    }
}

/**
 * The caller is not authenticated.
 * Maps to HTTP 401 Unauthorized.
 */
export class AuthenticationError extends AppError {
    constructor(message = "Authentication required", context?: Record<string, unknown>) {
        super(message, "AUTHENTICATION_ERROR", 401, context);
    }
}

/**
 * The requested resource does not exist.
 * Maps to HTTP 404 Not Found.
 */
export class NotFoundError extends AppError {
    constructor(message = "Resource not found", context?: Record<string, unknown>) {
        super(message, "NOT_FOUND", 404, context);
    }
}

/**
 * A write operation conflicts with existing state
 * (duplicate, optimistic lock violation, illegal state transition, etc.).
 * Maps to HTTP 409 Conflict.
 */
export class ConflictError extends AppError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(message, "CONFLICT", 409, context);
    }
}

/**
 * A call to an external service (Stripe, email provider, AI SDK, etc.) failed.
 * Maps to HTTP 502 Bad Gateway.
 */
export class ExternalServiceError extends AppError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(message, "EXTERNAL_SERVICE_ERROR", 502, context);
    }
}

/**
 * Rate limit exceeded.
 * Maps to HTTP 429 Too Many Requests.
 */
export class RateLimitError extends AppError {
    constructor(message = "Rate limit exceeded", context?: Record<string, unknown>) {
        super(message, "RATE_LIMIT_EXCEEDED", 429, context);
    }
}

/**
 * The request contains syntactically valid but semantically unprocessable data.
 * Maps to HTTP 422 Unprocessable Entity.
 */
export class UnprocessableError extends AppError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(message, "UNPROCESSABLE_ENTITY", 422, context);
    }
}
