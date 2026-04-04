# `src/lib/` — Shared Library Layer

Core business logic, utilities, and infrastructure that is shared across the application.

## Directory Structure

| Directory         | Purpose                                                                                           | SSOT For                   |
| ----------------- | ------------------------------------------------------------------------------------------------- | -------------------------- |
| `ai/`             | AI/LLM integration — model registry, copilot, conversation manager, rate limiter                  | AI provider abstraction    |
| `api/`            | API utilities — auth resolver, CRUD factory, rate limiting, response envelope, validation wrapper | API handler infrastructure |
| `audio/`          | Audio processing utilities                                                                        | Audio pipeline             |
| `auth/`           | Auth provider clients (Bluesky OAuth)                                                             | External auth integrations |
| `csv/`            | CSV import/export engine                                                                          | Tabular data I/O           |
| `data-hooks/`     | TanStack Query hooks — one per entity type (34 hooks)                                             | Server state management    |
| `email/`          | Email sending via Resend                                                                          | Transactional email        |
| `formatters/`     | Display formatters (currency, dates, numbers, durations)                                          | Presentation logic         |
| `i18n/`           | Internationalization strings (20 language modules)                                                | UI copy / translations     |
| `integrations/`   | External service connectors (OAuth, calendar sync)                                                | Third-party integrations   |
| `openapi/`        | OpenAPI spec generation and documentation                                                         | API documentation          |
| `permissions/`    | Field-level RBAC resolver with visibility masking                                                 | Field access control       |
| `scanning/`       | QR/NFC device scanning utilities                                                                  | Device I/O                 |
| `security/`       | CSRF protection, rate limiting, permission cache                                                  | Security infrastructure    |
| `seed-data/`      | Development seed data generators                                                                  | Test data                  |
| `settings/`       | Application settings management                                                                   | Configuration              |
| `state-machines/` | 36 entity lifecycle state machines with transition maps                                           | Status workflows           |
| `stripe/`         | Stripe billing integration                                                                        | Payment processing         |
| `supabase/`       | Supabase client, middleware, auth actions, DB types (43 files)                                    | Database access layer      |
| `validation/`     | Zod schemas shared between client and server (10 files)                                           | Input validation           |

## Key Files

| File        | Purpose                                                               |
| ----------- | --------------------------------------------------------------------- |
| `errors.ts` | Canonical `AppError` hierarchy (ValidationError, NotFoundError, etc.) |
| `logger.ts` | Structured JSON logger with child logger support                      |
| `motion.ts` | Animation preset SSOT (GPU-accelerated, motion-safe)                  |
| `utils.ts`  | `cn()` class merge utility                                            |

## Boundaries

- **DO:** Pure functions, type definitions, SDK wrappers, data transformation
- **DO NOT:** React components, UI state, route handlers, page-level logic
- **IMPORT FROM:** `@/types`, `@/config`, external packages
- **IMPORTED BY:** `src/app/`, `src/components/`, `src/features/`, `src/hooks/`
