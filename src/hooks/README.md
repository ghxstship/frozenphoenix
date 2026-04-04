# `src/hooks/` — Shared React Hooks

Reusable React hooks that provide cross-cutting functionality to any component in the application.

## Hook Inventory

### UI & Interaction

| Hook                        | Purpose                                                 |
| --------------------------- | ------------------------------------------------------- |
| `use-media-query.ts`        | Responsive breakpoint detection                         |
| `use-sidebar.ts`            | Sidebar open/close state management                     |
| `use-keyboard-shortcuts.ts` | Global keyboard shortcut registration                   |
| `use-swipe-gesture.ts`      | Touch swipe gesture detection                           |
| `use-swipe-to-dismiss.ts`   | Swipe-to-dismiss pattern for mobile                     |
| `use-motion.ts`             | Motion preference detection (`prefers-reduced-motion`)  |
| `use-accessibility.ts`      | Accessibility state helpers (focus trap, screen reader) |
| `use-hydrated.ts`           | Client-side hydration detection                         |

### Data & State

| Hook                        | Purpose                                       |
| --------------------------- | --------------------------------------------- |
| `use-detail-crud.ts`        | Entity detail page CRUD operations            |
| `use-entity-meta.ts`        | Entity metadata resolution                    |
| `use-column-preferences.ts` | Persisted table column visibility preferences |
| `use-query-tab-state.ts`    | URL-synced tab state management               |
| `use-workspace-context.ts`  | Current workspace/org context                 |
| `use-tier-gate.ts`          | Pricing tier feature gating                   |

### Communication

| Hook                        | Purpose                            |
| --------------------------- | ---------------------------------- |
| `use-messaging.ts`          | Real-time messaging state          |
| `use-messaging-enabled.ts`  | Messaging feature flag check       |
| `use-messaging-strings.ts`  | Messaging i18n strings             |
| `use-push-notifications.ts` | Web push notification subscription |

### Domain-Specific

| Hook                     | Purpose                         |
| ------------------------ | ------------------------------- |
| `use-copilot.ts`         | AI copilot integration          |
| `use-copilot-context.ts` | AI copilot context provider     |
| `use-scan-device.ts`     | QR/NFC scanner device state     |
| `use-wedge-scanner.ts`   | USB wedge barcode scanner       |
| `use-advance-cart.ts`    | Advancing/petty cash cart state |
| `use-offline-sync.ts`    | Offline data synchronization    |

## Boundaries

- **DO:** Encapsulate reusable stateful logic, compose other hooks
- **DO NOT:** Render UI, fetch data directly (use `src/lib/data-hooks/` for TanStack Query)
- **IMPORT FROM:** `@/lib/`, `@/config/`, `@/types/`
- **IMPORTED BY:** `src/components/`, `src/features/`, `src/app/`
