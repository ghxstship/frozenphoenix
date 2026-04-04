# ADR-005: Canonical State Machine Architecture

**Date:** 2025-04-01
**Status:** Accepted

## Context

The platform manages 35+ entity types with complex lifecycle progressions (e.g., lead → opportunity → deal → project, or draft → submitted → approved → active → completed). Status transitions must be validated at the domain level to prevent illegal state changes.

## Decision

Implement a **canonical state machine architecture** with one file per entity in `src/lib/state-machines/`:

- Each state machine exports:
  - `STATUS_VALUES` — array of all valid states (ordered)
  - `STATUS_LABELS` — human-readable labels map
  - `STATUS_COLORS` — semantic color tokens per state
  - `TRANSITIONS` — directed graph of legal transitions
  - `isValidTransition(from, to)` — guard function
  - `getNextStatuses(current)` — available transitions from current state

- A central `src/lib/state-machines/registry.ts` provides:
  - `getStateMachine(entityType)` — lookup by entity key
  - Type-safe registration of all 36 machines

- State transitions are validated:
  1. **Domain layer:** `isValidTransition()` check before any status write
  2. **Database layer:** CHECK constraints and trigger functions where applicable
  3. **UI layer:** Only valid next-states shown in dropdowns

## Consequences

**Positive:**

- Illegal state transitions caught at domain level — not just UI
- 36 entity lifecycles documented as code — executable specification
- Consistent color/label system across all entity status badges
- Unit tests cover all transition paths (5,444 tests pass)

**Negative:**

- Adding a new status requires updating machine, labels, colors, and transitions
- Complex multi-entity workflows (e.g., deal-to-project conversion) span multiple machines
