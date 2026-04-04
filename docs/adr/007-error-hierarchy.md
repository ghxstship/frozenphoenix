# ADR-007: Canonical AppError Hierarchy

**Date:** 2026-04-03
**Status:** Accepted

## Context

Error handling across API routes was inconsistent — some threw raw `Error`, others returned ad-hoc `{ error: string }` objects, and error-to-HTTP-status mapping was duplicated in every handler.

## Decision

Implement a **canonical error hierarchy** (`src/lib/errors.ts`) with typed subclasses:

| Class                  | Code                     | HTTP     | Usage                               |
| ---------------------- | ------------------------ | -------- | ----------------------------------- |
| `AppError`             | (base)                   | (custom) | Never throw directly                |
| `ValidationError`      | `VALIDATION_ERROR`       | 400      | Invalid input (Zod, business rules) |
| `AuthenticationError`  | `AUTHENTICATION_ERROR`   | 401      | Not authenticated                   |
| `AuthorizationError`   | `AUTHORIZATION_ERROR`    | 403      | Insufficient permissions            |
| `NotFoundError`        | `NOT_FOUND`              | 404      | Resource doesn't exist              |
| `ConflictError`        | `CONFLICT`               | 409      | Duplicate, optimistic lock          |
| `UnprocessableError`   | `UNPROCESSABLE_ENTITY`   | 422      | Semantically invalid                |
| `RateLimitError`       | `RATE_LIMIT_EXCEEDED`    | 429      | Too many requests                   |
| `ExternalServiceError` | `EXTERNAL_SERVICE_ERROR` | 502      | Third-party failure                 |

Companion: `src/lib/api/response.ts` provides `apiError(error)` which maps any `AppError` to a sanitized HTTP response with structured logging.

## Consequences

**Positive:**

- Single error-to-HTTP mapping — no more scattered status code decisions
- `instanceof` checks work correctly (proper prototype chain)
- Structured `context` field enables rich debugging without leaking internals to clients
- Composable with `withValidation()` for automatic Zod error formatting

**Negative:**

- Requires gradual adoption across existing routes (currently using `ApiErrors.*` helper pattern)
- Two error patterns coexist during migration (`ApiErrors.*` and `new XError()`)
