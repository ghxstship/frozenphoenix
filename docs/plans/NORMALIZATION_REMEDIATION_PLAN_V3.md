# Normalization Remediation Plan v3.0

> **Date:** 2026-03-21
> **Scope:** Full-codebase normalization audit across all application layers
> **Methodology:** Directory-by-directory file inspection, grep pattern analysis, cross-reference validation

---

## Executive Summary

After systematically auditing every directory in the FrozenPhoenix codebase (~2,018 source files, 133 supabase files, 16 scripts), **28 normalization violations** were identified across **9 categories**. Previous normalization passes (V1, V2) resolved spacing tokens, shell architecture, hook consolidation, casing, and tab primitives. This V3 audit focuses on **remaining structural duplication, SSOT violations, and architectural drift** that accumulated during rapid feature buildout.

**Severity distribution:** 6 P0 (Critical), 9 P1 (High), 8 P2 (Medium), 5 P3 (Low)

---

## Category A — Validation Layer (P0 Critical)

### A-1: Zod Shared Primitives Duplicated ×6

**Violation:** Identical `nonEmptyString`, `optionalString`, `positiveNumber`, `nonNegativeNumber`, `dateField`, `optionalDate`, `uuidField`, `optionalUuid`, `emailField` primitives are redeclared as file-local `const` in **6 separate files**:

| File | Lines |
|------|-------|
| `src/lib/validation/schemas.ts` | 4–16 |
| `src/lib/validation/entity-schemas.ts` | 11–19 |
| `src/lib/validation/extended-entity-schemas.ts` | 11–19 |
| `src/lib/validation/remaining-entity-schemas.ts` | 11–19 |
| `src/lib/validation/phase-h-entity-schemas.ts` | 11–19 |
| `src/lib/validation/advancing-schemas.ts` | 8–18 |

**Impact:** ~60 duplicated LOC. Drift risk (e.g., `advancing-schemas.ts` already has a subtly different `optionalDate` with `.transform()`). Any regex/format change requires editing 6 files.

**Fix:** Create `src/lib/validation/primitives.ts` exporting all shared Zod primitives. All 6 schema files import from it. Delete all file-local copies.

**Estimated effort:** 1 hour | **Files modified:** 7

---

### A-2: Enum Values Hardcoded in Zod Schemas — Drift from DB Enums

**Violation:** Zod `.enum()` arrays in validation schemas are hand-typed string literals that diverge from:
1. The PostgreSQL `CREATE TYPE` enums in migrations
2. The `EnumConfig` arrays in `domain-config.ts` / `domain-config-extended.ts`
3. The `types/index.ts` type aliases

**Examples of observed drift:**
- `schemas.ts` deal stage enum includes `"closed_won"`, `"closed_lost"` — but `types/index.ts` `DealStage` uses `"won"`, `"lost"`, and `domain-config.ts` `DEAL_STAGES` also uses `"won"`, `"lost"`.
- `schemas.ts` project status includes `"archived"`, `"pre_production"`, `"in_production"`, `"post_production"`, `"wrap"` — but `domain-config.ts` `PROJECT_STATUSES` only has `draft`, `active`, `on_hold`, `completed`, `cancelled`.
- `schemas.ts` project phase includes `"concept"`, `"planning"`, `"execution"`, `"review"`, `"closed"` — but `domain-config.ts` `PROJECT_PHASES` has `pre_production`, `fabrication`, `logistics`, `load_in`, `show`, `strike`, `load_out`.
- `schemas.ts` task status includes `"in_review"` — but `types/index.ts` and `domain-config.ts` use `"review"`.

**Impact:** API accepts values the UI/DB won't render or store correctly. Silent data corruption risk.

**Fix:** Derive Zod enums from the SSOT `domain-config.ts` arrays:
```typescript
import { DEAL_STAGES } from "@/config/domain-config";
const dealStageEnum = z.enum(DEAL_STAGES.map(s => s.value) as [string, ...string[]]);
```

**Estimated effort:** 4 hours | **Files modified:** 6

---

## Category B — Config Layer (P0 Critical)

### B-1: Dual EnumConfig Interfaces — `domain-config.ts` vs `domain-config-extended.ts`

**Violation:** Two parallel enum config systems exist with incompatible types:

| File | Interface | Typing |
|------|-----------|--------|
| `domain-config.ts` | `EnumConfig<T extends string>` | Generic, imports `BadgeVariant` from `ui-variants.ts` |
| `domain-config-extended.ts` | `EnumEntry` | Non-generic, re-declares `Variant` type locally |
| `advancing-config.ts` | `EnumConfig<T extends string>` | Duplicate of `domain-config.ts` version |

`domain-config-extended.ts` uses `as const` arrays with inline `variant: "info" as const` casts + a local `toMap()` helper. `domain-config.ts` uses typed `EnumConfig<T>[]` arrays + inline `Object.fromEntries()`.

**Impact:** Two config files defining enum metadata for the same UI layer using structurally similar but type-incompatible interfaces. Consumers must know which file to import from. The `EnumEntry.value` is `string` (not generic) — loses type narrowing.

**Fix:**
1. Export `EnumConfig<T>` and `toEnumMap()` from a shared `src/config/enum-types.ts`
2. Migrate `domain-config-extended.ts` to use `EnumConfig<T>` generics
3. Remove duplicate `EnumConfig` from `advancing-config.ts`
4. Consider merging `domain-config-extended.ts` into `domain-config.ts` (they serve the same purpose — the split was a historical accident from incremental buildout)

**Estimated effort:** 3 hours | **Files modified:** 4

---

### B-2: `mapToOptions()` Duplicated in Create-Entity Config Files

**Violation:** Identical `mapToOptions()` helper function is defined in both:
- `src/config/create-entity-configs.ts` (line 66)
- `src/config/phase-h-create-entity-configs.ts` (line 43)

Additionally, `YES_NO_OPTIONS` constant is defined only in `phase-h-create-entity-configs.ts` but is a generic primitive that should be shared.

**Fix:** Extract to `src/config/config-utils.ts`:
```typescript
export function mapToOptions(map: Record<string, { label: string }>): { value: string; label: string }[] { ... }
export const YES_NO_OPTIONS = [...];
```

**Estimated effort:** 30 min | **Files modified:** 3

---

### B-3: Mega Config Files — `domain-config.ts` (94KB), `domain-config-extended.ts` (120KB), `entity-config.ts` (169KB)

**Violation:** Three files exceed sustainable maintenance thresholds:

| File | Size | Entries |
|------|------|---------|
| `src/config/domain-config.ts` | 94KB / 2,289 lines | ~80 enum arrays + maps |
| `src/config/domain-config-extended.ts` | 120KB / 2,055 lines | ~100 enum arrays + maps |
| `src/lib/api/entity-config.ts` | 169KB / 4,916 lines | ~375 entity configs |

These are not code-split. Every page that imports any single enum from `domain-config.ts` pulls the entire 94KB module into the bundle (tree-shaking is limited because the maps are computed at module evaluation time via `Object.fromEntries`).

**Fix:**
1. Split `domain-config.ts` + `domain-config-extended.ts` into domain-scoped modules: `enum-configs/crm.ts`, `enum-configs/production.ts`, `enum-configs/finance.ts`, etc.
2. Split `entity-config.ts` into domain-scoped modules (mirror the list-page-configs pattern which already did this)
3. Barrel re-export from index files for backward compatibility

**Estimated effort:** 6 hours | **Files modified:** ~20 new files + ~15 consumer updates

---

## Category C — API Infrastructure (P1 High)

### C-1: `resolveRoleAndOrg()` Duplicated in 2 Files

**Violation:** Nearly identical `resolveRoleAndOrg()` function exists in both:
- `src/lib/api/crud-factory.ts` (line 183)
- `src/lib/api/with-api-handler.ts` (line 45)

Both also duplicate `VALID_ROLES` set. The only difference is a null-safety check (`if (!supabase)` in crud-factory).

**Fix:** Extract to `src/lib/api/auth-resolver.ts`, import from both consumers.

**Estimated effort:** 30 min | **Files modified:** 3

---

### C-2: `generateRequestId()` Defined in 3 Places

**Violation:** `generateRequestId()` exists in:
- `src/lib/api-utils.ts` (SSOT — exported)
- `src/lib/api/crud-factory.ts` (imports from api-utils ✓)
- `src/lib/api/route-handler.ts` (line 72 — **re-declares locally**, does NOT import from api-utils)

**Fix:** Delete local `generateRequestId()` from `route-handler.ts`, import from `@/lib/api-utils`.

**Estimated effort:** 5 min | **Files modified:** 1

---

### C-3: Three Parallel API Handler Wrappers

**Violation:** Three separate wrapper patterns exist for API route handlers:

| Wrapper | File | Purpose |
|---------|------|---------|
| `createCrudHandlers` | `crud-factory.ts` | CRUD routes (437 route files) |
| `withApiHandler` / `withApiHandlerParams` | `with-api-handler.ts` | Custom bespoke routes (~20 files) |
| `withRouteHandler` | `route-handler.ts` | Lightweight custom routes |

Each re-implements: auth resolution, rate limiting, error boundary, correlation ID, logging. `withRouteHandler` lacks RBAC enforcement entirely. `withApiHandler` and `withRouteHandler` overlap significantly — the latter appears to be an older/simpler version that was never consolidated.

**Fix:**
1. Deprecate `route-handler.ts` — migrate its few consumers to `withApiHandler`
2. Extract shared auth/rate-limit/logging into a composable middleware chain consumed by both `crud-factory.ts` and `with-api-handler.ts`

**Estimated effort:** 3 hours | **Files modified:** ~8

---

## Category D — Type System (P1 High)

### D-1: Hand-Authored Types in `types/index.ts` — Phantom Fields & Casing Drift

**Violation:** `src/types/index.ts` contains ~600 lines of hand-authored TypeScript interfaces (`Project`, `Task`, `Deal`, `Vendor`, `Asset`, `Invoice`, etc.) that diverge from the Supabase-generated types in `src/lib/supabase/database.types.ts` (2MB) and `src/types/supabase.ts` (1.5MB):

- **Phantom fields** (exist in TS, not in DB): `clientLogo`, `teamIds`, `fabricationStatus`, `dependencies`, `coiValid`, `ndaSigned`, `w9Uploaded`, `variance`, `deliverables`, `approvalId`
- **Casing mismatch**: Hand types use camelCase (`projectId`, `createdAt`, `dueDate`), DB types use snake_case (`project_id`, `created_at`, `due_date`)
- **Missing fields**: Hand types omit `organization_id`, `created_by`, `updated_by`, `deleted_at` — columns present on every DB table

**Impact:** Any code consuming `types/index.ts` interfaces operates on a fictional data shape. Form submissions using these types will silently drop fields or send wrong keys. This was flagged in the original FULLSTACK_AUDIT_REPORT.md but not yet remediated.

**Fix:**
1. Derive entity types from `database.types.ts` using projection types:
   ```typescript
   import type { Tables } from "@/lib/supabase/database.types";
   export type Project = Tables<"projects">;
   ```
2. Deprecate all hand-authored interfaces
3. Create camelCase transform utilities where UI consumption requires it

**Estimated effort:** 8 hours | **Files modified:** ~50 consumers

---

### D-2: Dual Generated Type Files — `database.types.ts` (2MB) + `supabase.ts` (1.5MB)

**Violation:** Two massive auto-generated Supabase type files exist:
- `src/lib/supabase/database.types.ts` (2,050,518 bytes) — imported by 24 files
- `src/types/supabase.ts` (1,501,219 bytes) — imported by 0 files (orphaned)
- `src/types/api.generated.ts` (3,075,766 bytes) — OpenAPI generated types

Additionally, `src/types/database.types.ts` (1,183,596 bytes) exists as a **third copy** at a different path — grep confirms **0 imports** from this path.

**Impact:** 4.7MB of orphaned generated type files. `supabase.ts` (0 imports) and `src/types/database.types.ts` (0 imports) are confirmed stale copies from previous generation runs.

**Fix:**
1. Delete `src/types/supabase.ts` (0 imports — confirmed)
2. Delete `src/types/database.types.ts` (0 imports — confirmed)
3. Ensure `gen:api` script only outputs to one canonical location
4. Add `.gitignore` entries for generated files with a `gen:types` rebuild step

**Estimated effort:** 30 min | **Files modified:** 2 deleted, 2 config

---

### D-3: 15+ Domain Type Files — Overlapping Exports

**Violation:** `src/types/` contains 15+ domain-specific type files (`production.ts`, `governance.ts`, `live-operations.ts`, `workforce.ts`, etc.) that are all re-exported via `types/index.ts`. Several define types that overlap with each other and with `types/index.ts` hand-authored types:

- `types/index.ts` defines `Project`, `Task`, `Deal`, etc.
- `types/production.ts` defines `ProductionProject`, `ProductionTask`, etc. with different shapes
- `types/governance.ts` defines `Contract`, `Invoice` with fields different from `types/index.ts`

**Impact:** Consumers importing from `@/types` get ambiguous type names. No single canonical type per entity.

**Fix:** Audit all 15 domain type files. For each entity:
1. If DB table exists → derive from `Tables<"table_name">`
2. If UI-only view model → prefix with `View` (e.g., `ViewProject`)
3. Eliminate overlapping definitions

**Estimated effort:** 6 hours | **Files modified:** ~15

---

## Category E — Barrel & Import Hygiene (P1 High)

### E-1: Supabase Barrel Mixed Export Strategies

**Violation:** `src/lib/supabase/index.ts` uses two conflicting export patterns:

| Pattern | Files | Risk |
|---------|-------|------|
| `export * from "./hooks-core"` | 11 domain hook files | Namespace collision risk |
| Named `export { ... } from "./hooks-messaging"` | 8 specialty files | Safe but verbose |

The reason for named exports on 8 files is documented: "to avoid conflicts with domain files above." This means export collisions already occurred and were manually worked around.

**Impact:** Any new hook added to a `export *` file that shares a name with another domain file will cause a build error. The collision workaround for `useSyncEvents` (aliased to `useSyncEventsExternal`) and `useDeleteMessage` (aliased to `useDeleteMessageHook`) are symptoms.

**Fix:** Standardize on named exports for ALL hook files in the barrel. Use code generation to keep barrel in sync with domain files.

**Estimated effort:** 2 hours | **Files modified:** 1

---

### E-2: `src/config/index.ts` Re-exports Everything — Bundle Pollution

**Violation:** The config barrel uses `export *` from 6 large modules (`domain-config`, `design-tokens`, `ui-variants`, `production-config`, `rbac`, `navigation`). Any file that does `import { DEAL_STAGES } from "@/config"` pulls in the transitive closure of ALL config modules.

The `list-page-configs/registry.ts` already solved this for list page configs via lazy dynamic imports. But the main config barrel has not been similarly optimized.

**Impact:** Every dashboard page bundles ~400KB+ of config even if it only needs 2-3 enum maps.

**Fix:** Convert `src/config/index.ts` to named exports only. Encourage direct module imports (`from "@/config/domain-config"`) for leaf consumers. The barrel remains for convenience in files that genuinely need cross-cutting config.

**Estimated effort:** 2 hours | **Files modified:** ~30 consumer updates

---

## Category F — Documentation Proliferation (P2 Medium)

### F-1: 109 Audit/Plan Documents in `/docs/`

**Violation:** The `/docs/` directory contains **109 markdown files** totaling multiple megabytes. Many are superseded by later audits:

- `FULLSTACK_AUDIT_REPORT.md` vs `FULLSTACK_AUDIT_REPORT_V6.md` vs `FULL_STACK_AUDIT_REPORT.md` — 3 versions
- `NORMALIZATION_AUDIT_V2.md` (now superseded by this V3)
- `SCHEMA_OPTIMIZATION_PLAN.md` vs `SCHEMA_OPTIMIZATION_AND_ENRICHMENT_PLAN.md` vs `SCHEMA_OPTIMIZATION_PASS_2.md` — 3 overlapping
- `UI_AUDIT_BATCH_1` through `UI_AUDIT_BATCH_7` — 7 sequential files
- `DATA_LAYER_AUDIT_EXECUTION_REPORT.md` (1.96MB) and `DATA_LAYER_AUDIT_FULL_TRACE.json` (2.44MB) — huge trace files

**Impact:** Stale docs mislead. Large files bloat the repo. No index or versioning policy.

**Fix:**
1. Create `docs/archive/` for superseded documents
2. Create `docs/README.md` index with current-state links
3. Move trace/report files to `.gitignore`'d `docs/.reports/`
4. Establish naming convention: `{DOMAIN}_{TYPE}_{VERSION}.md`

**Estimated effort:** 2 hours | **Files modified:** ~60 moves

---

### F-2: `src/types/openapi.json` (4MB) Committed to Git

**Violation:** `src/types/openapi.json` is 4,091,643 bytes of generated OpenAPI spec committed to version control. Combined with the generated type files, the `src/types/` directory alone is ~10MB.

**Fix:** Add to `.gitignore`. Generate on-demand via `npm run gen:api:spec-only`.

**Estimated effort:** 10 min | **Files modified:** 2

---

## Category G — Component Patterns (P2 Medium)

### G-1: `entity-create-dialog.tsx` — Dead Code (248 lines)

**Violation:** `src/components/entity-create-dialog.tsx` (248 lines) is a higher-level wrapper around `create-entity-dialog.tsx` that was built as P0.6 infrastructure but **never adopted by any consumer**. Grep confirms 0 external imports — only self-references within the file.

Meanwhile, `src/components/create-entity-dialog.tsx` is the actual SSOT with 28 consumers.

**Impact:** 248 lines of dead code. It also eagerly imports ALL `CREATE_*_CONFIG` objects, which would cause bundle bloat if ever imported.

**Fix:** Delete `src/components/entity-create-dialog.tsx`.

**Estimated effort:** 5 min | **Files modified:** 1 deleted

---

### G-2: `EnumConfig` Label Lookups — 3 Competing Strategies

**Violation:** Three different patterns exist for converting enum values to display labels:

1. **Domain config maps:** `DEAL_STAGE_MAP["won"].label` — used by most list/detail pages
2. **`enum-labels.ts`:** `SCAN_ACTION_LABELS["check_in"]` — separate flat `Record<string, string>` maps
3. **`ui-variants.ts`:** `getStatusLabel(status)` — with dev-mode warnings for unmapped values

Pattern 2 (`enum-labels.ts`) re-invents what `domain-config.ts` already provides but for a narrower set of enums. Pattern 3 is a fallback that generates labels via regex transformation.

**Fix:** Migrate `enum-labels.ts` entries into `domain-config.ts` / `domain-config-extended.ts` as proper `EnumConfig` entries. Deprecate `enumLabel()` fallback in favor of explicit maps.

**Estimated effort:** 1 hour | **Files modified:** 4

---

## Category H — Database Import Paths (P2 Medium)

### H-1: Mixed Import Paths for Database Types

**Violation:** Database types are imported via 3 different paths:
- `from "@/lib/supabase/database.types"` — 5 files (bespoke API routes)
- `from "@/lib/supabase"` barrel → re-exports `Database` type — 19 files
- `from "./database.types"` — relative imports in hooks files

The 5 bespoke API routes bypass the barrel and import directly from the database types file.

**Fix:** Standardize all imports through the barrel `@/lib/supabase`. Remove direct `database.types` imports.

**Estimated effort:** 30 min | **Files modified:** 5

---

## Category I — Structural Redundancy (P3 Low)

### I-1: `create-entity-configs.ts` (94KB) + `phase-h-create-entity-configs.ts` (128KB)

**Violation:** Two separate files define create-entity form configs. The `phase-h-` prefix indicates this was a buildout phase artifact. Both share identical structure, both import from `domain-config`.

**Fix:** Merge into a single file or split by domain (mirroring list-page-configs pattern).

**Estimated effort:** 2 hours | **Files modified:** 3

---

### I-2: `schema-registry.ts` (41KB) — Manual Import Wiring

**Violation:** `src/lib/validation/schema-registry.ts` manually imports 151 schema pairs from 5 files and registers them in a `Map`. Every new entity requires manually adding imports + registration.

**Fix:** Use a code-generation script or convention-based auto-discovery to build the registry at build time.

**Estimated effort:** 3 hours | **Files modified:** 2

---

### I-3: Validation Schema Files — Historical Split

**Violation:** Zod schemas are spread across 6 files by historical accident (each buildout phase created a new file):

| File | Schemas | Size |
|------|---------|------|
| `schemas.ts` | 29 (original) | 19KB |
| `entity-schemas.ts` | 33 (P0.5) | 18KB |
| `extended-entity-schemas.ts` | 33 (P1) | 20KB |
| `remaining-entity-schemas.ts` | 89 (P1.1) | 52KB |
| `phase-h-entity-schemas.ts` | ~100 (Phase H) | 61KB |
| `advancing-schemas.ts` | 8 (Advancing) | 6KB |

**Fix:** Reorganize by domain (matching the hooks pattern):
- `validation/schemas-crm.ts`
- `validation/schemas-finance.ts`
- `validation/schemas-production.ts`
- etc.

**Estimated effort:** 4 hours | **Files modified:** ~12

---

### I-4: Edge Function Shared Utilities — No Barrel

**Violation:** `supabase/functions/_shared/` contains 9 utility files but no `index.ts` barrel. Each edge function imports individual files with relative paths.

**Fix:** Add `supabase/functions/_shared/index.ts` barrel export.

**Estimated effort:** 15 min | **Files modified:** 1

---

### I-5: `src/lib/api/mutation-hook-factory.ts` — Dead Code (13KB)

**Violation:** Two hook factory files exist:
- `src/lib/supabase/hook-factories.ts` (SSOT, 153 lines) — `makeListHook`, `makeDetailHook`, `makeCreateHook`, `makeUpdateHook`, `makeDeleteHook`
- `src/lib/api/mutation-hook-factory.ts` (13,561 bytes) — separate factory pattern, **0 external imports confirmed**

The mutation-hook-factory is exported from `src/lib/api/index.ts` barrel but never consumed by any file.

**Fix:** Delete `src/lib/api/mutation-hook-factory.ts` and remove its barrel export.

**Estimated effort:** 5 min | **Files modified:** 2

---

## Remediation Roadmap

### Sprint 1 — Critical SSOT (Week 1)
| ID | Priority | Effort | Description |
|----|----------|--------|-------------|
| A-1 | P0 | 1h | Extract shared Zod primitives |
| A-2 | P0 | 4h | Derive Zod enums from domain-config SSOT |
| B-1 | P0 | 3h | Unify EnumConfig interface |
| C-1 | P1 | 30m | Extract resolveRoleAndOrg |
| C-2 | P1 | 5m | Delete duplicate generateRequestId |
| B-2 | P0 | 30m | Extract mapToOptions + YES_NO_OPTIONS |

**Sprint 1 total: ~9 hours**

### Sprint 2 — Type System (Week 2)
| ID | Priority | Effort | Description |
|----|----------|--------|-------------|
| D-1 | P1 | 8h | Derive entity types from DB types |
| D-2 | P1 | 1h | Delete orphaned type files |
| D-3 | P1 | 6h | Resolve overlapping domain types |
| H-1 | P2 | 30m | Standardize DB type import paths |

**Sprint 2 total: ~15.5 hours**

### Sprint 3 — Bundle & Architecture (Week 3)
| ID | Priority | Effort | Description |
|----|----------|--------|-------------|
| B-3 | P0 | 6h | Split mega config files |
| E-1 | P1 | 2h | Standardize barrel exports |
| E-2 | P1 | 2h | Optimize config barrel |
| C-3 | P1 | 3h | Consolidate API handler wrappers |
| G-1 | P2 | 5m | Delete dead entity-create-dialog.tsx |

**Sprint 3 total: ~15 hours**

### Sprint 4 — Cleanup (Week 4)
| ID | Priority | Effort | Description |
|----|----------|--------|-------------|
| F-1 | P2 | 2h | Archive superseded docs |
| F-2 | P2 | 10m | Gitignore generated specs |
| G-2 | P2 | 1h | Consolidate enum label strategies |
| I-1 | P3 | 2h | Merge create-entity config files |
| I-2 | P3 | 3h | Auto-generate schema registry |
| I-3 | P3 | 4h | Reorganize validation schemas by domain |
| I-4 | P3 | 15m | Add edge function barrel |
| I-5 | P3 | 5m | Delete dead mutation-hook-factory.ts |

**Sprint 4 total: ~13.5 hours**

---

## Metrics

| Metric | Before | After (projected) |
|--------|--------|-------------------|
| Duplicated Zod primitives | 6 copies | 1 SSOT |
| Enum drift points | ~15 known | 0 (derived from SSOT) |
| EnumConfig interfaces | 3 variants | 1 shared |
| resolveRoleAndOrg copies | 2 | 1 |
| generateRequestId copies | 3 | 1 |
| API handler wrappers | 3 | 2 (CRUD factory + custom wrapper) |
| Hand-authored entity types | ~25 interfaces | 0 (derived from DB) |
| Orphaned generated type files | 2 (~2.9MB) | 0 |
| Dead code files | 3 (~14KB + 1.2MB + 13KB) | 0 |
| Stale/superseded docs | ~30 | 0 (archived) |
| Config barrel tree-shake | None (export *) | Named exports, domain-split |

---

## Verification Protocol

Each sprint closes with:
1. `tsc --noEmit` — 0 new errors
2. `eslint` — 0 new errors
3. `npm run build` — successful
4. Cross-reference: grep for known duplication patterns returns 0 matches
5. Bundle size comparison (before/after)

---

## Appendix: Files Audited

### Directories traversed (complete list):
- `/` (root config: package.json, tsconfig.json, next.config.ts, eslint, etc.)
- `/src/config/` (23 files + 5 subdirectories)
- `/src/config/brands/` (4 files)
- `/src/config/list-page-configs/` (12 files)
- `/src/config/dashboard-page-configs/` (2 files)
- `/src/config/form-page-configs/` (1 file)
- `/src/config/settings-page-configs/` (1 file)
- `/src/config/wizard-configs/` (1 file)
- `/src/types/` (33 files)
- `/src/lib/` (all 201 files across 13 subdirectories)
- `/src/lib/supabase/` (41 files)
- `/src/lib/validation/` (9 files)
- `/src/lib/api/` (12 files)
- `/src/lib/i18n/` (33 files)
- `/src/lib/ai/` (24 files)
- `/src/lib/state-machines/` (36 files)
- `/src/lib/settings/` (4 files)
- `/src/lib/permissions/` (1 file)
- `/src/lib/csv/` (6 files)
- `/src/lib/email/` (2 files)
- `/src/hooks/` (20 files)
- `/src/components/` (207 files across 19 subdirectories)
- `/src/components/ui/` (66 files)
- `/src/components/shells/` (10 files)
- `/src/components/layouts/` (8 files)
- `/src/components/data-view/` (13 files)
- `/src/components/auth/` (7 files)
- `/src/components/advancing/` (12 files)
- `/src/app/(dashboard)/` (~350 page directories)
- `/src/app/api/` (~280 route directories, 570 files)
- `/src/app/(public)/` (8 files)
- `/supabase/` (133 files)
- `/supabase/functions/` (16 function directories)
- `/supabase/migrations/` (102 migration files)
- `/scripts/` (16 files)
- `/public/` (10 files)
- `/docs/` (109 files + 1 subdirectory)
