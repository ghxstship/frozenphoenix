# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) documenting significant technical decisions for the Frozen Phoenix platform.

## Format

Each ADR follows this structure:

```
# ADR-NNN: Title

**Date:** YYYY-MM-DD
**Status:** Accepted | Deprecated | Superseded by ADR-NNN

## Context
What is the issue that we're seeing that is motivating this decision?

## Decision
What is the change that we're proposing and/or doing?

## Consequences
What becomes easier or more difficult to do because of this change?
```

## Index

| ADR                                       | Title                                | Status   | Date       |
| ----------------------------------------- | ------------------------------------ | -------- | ---------- |
| [001](./001-supabase-auth-platform.md)    | Supabase as Auth & Data Platform     | Accepted | 2025-01-15 |
| [002](./002-next-app-router.md)           | Next.js App Router Architecture      | Accepted | 2025-01-15 |
| [003](./003-tailwind-v4-design-tokens.md) | Tailwind v4 CSS-First Design Tokens  | Accepted | 2025-03-01 |
| [004](./004-rbac-six-tier-hierarchy.md)   | Six-Tier RBAC Permission Model       | Accepted | 2025-02-10 |
| [005](./005-state-machine-transitions.md) | Canonical State Machine Architecture | Accepted | 2025-04-01 |
| [006](./006-structured-logging.md)        | Structured JSON Logging              | Accepted | 2025-06-15 |
| [007](./007-error-hierarchy.md)           | Canonical AppError Hierarchy         | Accepted | 2026-04-03 |
