# `src/config/` — Application Configuration Registry

Centralized configuration for all application entities, UI layouts, navigation, RBAC, and business rules.

## Key Files

| File                       | SSOT For                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------ |
| `rbac.ts`                  | Six-tier RBAC permission matrix (812 lines) — the authority for all access control   |
| `navigation.ts`            | Sidebar navigation structure, route-to-icon mapping, role-based visibility           |
| `domain-config.ts`         | Entity metadata — enum values, status labels, color tokens for all domain entities   |
| `tier-entitlements.ts`     | Pricing tier → feature gates (core/pro/enterprise)                                   |
| `entity-lookup-configs.ts` | Entity lookup/autocomplete configurations for relational fields                      |
| `design-tokens.ts`         | TypeScript-accessible design token constants                                         |
| `ui-variants.ts`           | CVA (class-variance-authority) variant definitions for UI components                 |
| `quality-standards.ts`     | Quality gate thresholds and standards registry                                       |
| `index.ts`                 | Entity configuration registry — maps entity keys to DB tables, schemas, and metadata |

## Subdirectories

| Directory                | Purpose                                                          |
| ------------------------ | ---------------------------------------------------------------- |
| `list-page-configs/`     | Column definitions, filters, sort options for all 99+ list pages |
| `form-page-configs/`     | Form field definitions for entity creation/editing               |
| `settings-page-configs/` | Settings panel configurations                                    |
| `wizard-configs/`        | Multi-step wizard flow definitions                               |
| `brands/`                | Brand/theme presets                                              |
| `_archive/`              | Deprecated configs (retained for reference)                      |

## Boundaries

- **DO:** Static configuration objects, enum definitions, type-safe registry maps
- **DO NOT:** Business logic, API calls, React components, side effects
- **IMPORT FROM:** `@/types/` only
- **IMPORTED BY:** Everything — this is the config SSOT
