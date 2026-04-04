# ADR-006: Structured JSON Logging

**Date:** 2025-06-15
**Status:** Accepted

## Context

Application logging used unstructured `console.log` calls with free-form messages. This made log aggregation, search, and alerting unreliable in production.

## Decision

Implement a **structured JSON logging** system (`src/lib/logger.ts`):

- **Production:** All log output is JSON with canonical fields: `level`, `msg`, `timestamp`, plus arbitrary context
- **Development:** Human-readable colored output for terminal readability
- **Log Levels:** `debug` (dev traces), `info` (business events), `warn` (recoverable issues), `error` (failures requiring attention)
- **Environment-aware defaults:** Production defaults to `warn+`; development defaults to `debug+`
- **Child loggers:** `logger.child({ requestId, route })` for request-scoped context
- **Integration:** `withApiHandler` automatically creates child loggers per request with correlation IDs

Rules:

- **No `console.log`** in application code — all logging through `logger.*`
- **No PII in logs** — user IDs only, never emails/names/tokens
- **Structured context** — always pass objects, not string interpolation

## Consequences

**Positive:**

- Machine-parseable logs enable log aggregator queries (Datadog, Grafana, CloudWatch)
- Request correlation IDs enable distributed tracing across middleware → handler → service
- Level-based filtering reduces noise in production without losing debug capability

**Negative:**

- JSON logs are less readable in raw terminal output (mitigated by dev-mode formatting)
- Requires discipline to pass structured context rather than string messages
