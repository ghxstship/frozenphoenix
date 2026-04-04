# `src/types/` — TypeScript Type Definitions

Canonical type definitions for all domain entities, configuration shapes, and API contracts.

## Core Files

| File               | SSOT For                                                                                  |
| ------------------ | ----------------------------------------------------------------------------------------- |
| `index.ts`         | Core shared types: `PermissionLevel`, `EntityConfig`, `BaseEntity`, pagination, filtering |
| `entity.ts`        | Entity metadata types and CRUD operation shapes                                           |
| `api.generated.ts` | Auto-generated Supabase API types (DO NOT EDIT)                                           |

## Domain Types

| File                      | Domain                                         |
| ------------------------- | ---------------------------------------------- |
| `advancing.ts`            | Advancing/petty cash workflows                 |
| `asset-logistics.ts`      | Warehouse, inventory, kits, reservations       |
| `creative-brand.ts`       | Creative briefs, brand guidelines, campaigns   |
| `credentialing.ts`        | Credential types, pools, assignments, scans    |
| `crm-revenue.ts`          | Leads, deals, opportunities, accounts, revenue |
| `digital-assets.ts`       | Digital asset management                       |
| `governance.ts`           | Legal, compliance, insurance, permits          |
| `harbor-master.ts`        | Invitation, join request, access gate types    |
| `live-operations.ts`      | Live event command, readiness gates, ROS cues  |
| `messaging.ts`            | Conversations, messages, channels, reactions   |
| `production.ts`           | Projects, tasks, SOW, milestones               |
| `production-lifecycle.ts` | Work packages, BOMs, QC gates, production runs |
| `spatial-hierarchy.ts`    | Locations, spaces, bookings, inspections       |
| `user-lifecycle.ts`       | Users, memberships, onboarding, sessions       |
| `vendor-lifecycle.ts`     | Vendor onboarding, compliance, reviews         |
| `workforce.ts`            | Workforce management, scheduling               |

## Configuration Types

| File                      | Purpose                            |
| ------------------------- | ---------------------------------- |
| `list-page-config.ts`     | List page column/filter/sort shape |
| `form-page-config.ts`     | Form field definition shape        |
| `detail-page-config.ts`   | Detail page section/tab shape      |
| `settings-page-config.ts` | Settings panel shape               |
| `wizard-config.ts`        | Multi-step wizard shape            |
| `workspace-context.ts`    | Workspace/org context shape        |

## Boundaries

- **DO:** Type definitions, interfaces, type utilities, discriminated unions
- **DO NOT:** Runtime logic, constants, functions, React components
- **IMPORT FROM:** Nothing (types are leaf nodes in the dependency graph)
- **IMPORTED BY:** Everything
