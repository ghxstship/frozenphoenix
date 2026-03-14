# OpenAPI 3.1 Migration Checklist

**Status:** ✅ Complete — all 6 phases delivered  
**Spec:** 521 paths · 454 schemas · 248 tags · 6-tier RBAC documented  
**Generated:** `npm run gen:api` → `src/types/api.generated.ts` (93K lines)

---

## Phase 1 — Schema Generation ✅

| #   | Task                                                      | File                                | Status |
| --- | --------------------------------------------------------- | ----------------------------------- | ------ |
| 1.1 | Zod → JSON Schema bridge (Zod v4 built-in `toJSONSchema`) | `src/lib/openapi/zod-to-schema.ts`  | ✅     |
| 1.2 | Shared reusable schemas (pagination, errors, envelopes)   | `src/lib/openapi/shared-schemas.ts` | ✅     |
| 1.3 | CRUD path auto-generation from ENTITY_CONFIGS             | `src/lib/openapi/crud-paths.ts`     | ✅     |
| 1.4 | Custom routes registry (non-CRUD endpoints)               | `src/lib/openapi/custom-routes.ts`  | ✅     |
| 1.5 | Main spec builder (assembles full OpenAPI 3.1 JSON)       | `src/lib/openapi/spec-builder.ts`   | ✅     |
| 1.6 | Barrel export                                             | `src/lib/openapi/index.ts`          | ✅     |
| 1.7 | Replace hand-maintained api-docs.ts (now re-exports)      | `src/lib/api-docs.ts`               | ✅     |

## Phase 2 — Spec Hosting & UI ✅

| #   | Task                                                    | File                           | Status |
| --- | ------------------------------------------------------- | ------------------------------ | ------ |
| 2.1 | `/api/docs` serves OpenAPI JSON (existing, unchanged)   | `src/app/api/docs/route.ts`    | ✅     |
| 2.2 | `/api/docs/ui` serves Scalar API Reference (RBAC-gated) | `src/app/api/docs/ui/route.ts` | ✅     |

## Phase 3 — Validation Middleware ✅

| #   | Task                                                         | File                                    | Status            |
| --- | ------------------------------------------------------------ | --------------------------------------- | ----------------- |
| 3.1 | Request validation (existing `parseAndValidate`, 422 errors) | `src/lib/api-utils.ts`                  | ✅ (pre-existing) |
| 3.2 | Response drift detection (dev/staging only, logs warnings)   | `src/lib/openapi/response-validator.ts` | ✅                |

## Phase 4 — Auth Documentation ✅

| #   | Task                                                          | File                                 | Status |
| --- | ------------------------------------------------------------- | ------------------------------------ | ------ |
| 4.1 | Bearer + Cookie security schemes in spec                      | `src/lib/openapi/spec-builder.ts`    | ✅     |
| 4.2 | `x-rbac-resource`, `x-rbac-action`, `x-rbac-roles` on all ops | `crud-paths.ts` + `custom-routes.ts` | ✅     |
| 4.3 | Full RBAC permission matrix as `x-rbac-matrix` extension      | `src/lib/openapi/spec-builder.ts`    | ✅     |

## Phase 5 — SDK & Client Generation ✅

| #   | Task                                                         | File                             | Status |
| --- | ------------------------------------------------------------ | -------------------------------- | ------ |
| 5.1 | Install `openapi-typescript` (v7.13.0)                       | `package.json` (devDependencies) | ✅     |
| 5.2 | Generation script (builds spec → writes JSON → generates TS) | `scripts/gen-api-types.ts`       | ✅     |
| 5.3 | `npm run gen:api` script                                     | `package.json`                   | ✅     |
| 5.4 | `npm run gen:api:spec-only` script (JSON only, no TS types)  | `package.json`                   | ✅     |
| 5.5 | Generated types output                                       | `src/types/api.generated.ts`     | ✅     |
| 5.6 | Spec JSON gitignored (derivable from code)                   | `.gitignore`                     | ✅     |

## Phase 6 — CI/Hygiene ✅

| #   | Task                                          | File                                      | Status |
| --- | --------------------------------------------- | ----------------------------------------- | ------ |
| 6.1 | Undocumented endpoint checker (100% coverage) | `scripts/check-undocumented-endpoints.ts` | ✅     |
| 6.2 | `npm run check:api-coverage` script           | `package.json`                            | ✅     |
| 6.3 | Spectral OpenAPI linting config               | `.spectral.yml`                           | ✅     |
| 6.4 | `npm run lint:api-spec` script                | `package.json`                            | ✅     |
| 6.5 | Install `@stoplight/spectral-cli`             | `package.json` (devDependencies)          | ✅     |
| 6.6 | CI quality gate stage (API Spec Hygiene)      | `.github/workflows/quality-gate.yml`      | ✅     |

---

## New Files Created

```
src/lib/openapi/
├── index.ts                  — Barrel export
├── zod-to-schema.ts          — Zod v4 → JSON Schema bridge
├── shared-schemas.ts         — Reusable component schemas
├── crud-paths.ts             — Auto-generated CRUD paths from ENTITY_CONFIGS
├── custom-routes.ts          — Non-CRUD route registry (1686 lines)
├── spec-builder.ts           — Main spec assembler
└── response-validator.ts     — Dev/staging response drift detection

src/app/api/docs/
└── ui/route.ts               — Scalar API Reference UI (RBAC-gated)

scripts/
├── gen-api-types.ts          — OpenAPI type generation script
└── check-undocumented-endpoints.ts — Filesystem vs spec coverage checker

src/types/
├── openapi.json              — Generated spec (gitignored)
└── api.generated.ts          — Generated TypeScript types (93K lines)

.spectral.yml                 — Spectral linting rules
```

## Modified Files

```
src/lib/api-docs.ts           — Replaced 231-line hand-maintained spec with 18-line re-export
.gitignore                    — Added src/types/openapi.json
.github/workflows/quality-gate.yml — Added API Spec Hygiene stage
package.json                  — Added 4 scripts + 2 devDependencies
```

## npm Scripts Added

| Script                       | Purpose                                  |
| ---------------------------- | ---------------------------------------- |
| `npm run gen:api`            | Build spec + generate TypeScript types   |
| `npm run gen:api:spec-only`  | Build spec JSON only (no TS types)       |
| `npm run check:api-coverage` | Check for undocumented filesystem routes |
| `npm run lint:api-spec`      | Spectral lint the generated spec         |

## devDependencies Added

| Package                   | Version | Purpose                             |
| ------------------------- | ------- | ----------------------------------- |
| `openapi-typescript`      | ^7.13.0 | Generate TS types from OpenAPI spec |
| `@stoplight/spectral-cli` | latest  | OpenAPI linting                     |

## No Breaking Changes

- Existing `/api/docs` route continues to serve JSON spec (unchanged contract)
- `buildOpenApiSpec()` export maintained from `@/lib/api-docs` (backward-compatible)
- All existing API routes documented without modification
- No route behavior changes — documentation only

## Architecture Decisions

1. **Spec derived from code** — not hand-maintained. ENTITY_CONFIGS + Zod schemas are SSOT.
2. **Zod v4 built-in `toJSONSchema`** — no external conversion dependency needed.
3. **Scalar UI over Swagger UI** — lighter, modern, CDN-loaded (zero npm dependency).
4. **Response bodies use `additionalProperties: true`** — entity shapes live in Supabase types, not Zod. Full entity schemas will come when Supabase type generation is integrated.
5. **Spec JSON gitignored** — 149K lines, fully derivable via `npm run gen:api`.
6. **Generated TS types committed** — enables CI type-checking without running generator.
7. **RBAC documented via OpenAPI extensions** — `x-rbac-resource`, `x-rbac-action`, `x-rbac-roles`, `x-rbac-matrix`.
