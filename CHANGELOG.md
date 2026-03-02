# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- **Quality Gate** — 360-criterion deployment gate system with CI pipeline, waivers, and attestations
- **Structured Logger** — `src/lib/logger.ts` with child logger support; `no-console` ESLint rule
- **Environment Validation** — Zod-based `src/lib/env.ts` with fail-fast in production
- **Pre-commit Hooks** — Husky + lint-staged + Prettier for code quality enforcement
- **SEO** — `app/sitemap.ts` and `app/robots.ts` via Next.js metadata API
- **Import Ordering** — `sort-imports` ESLint rule for consistent import member ordering
- **Integration Tests** — env validation, locale utilities, logger, middleware permissions (26 new tests)
- **CONTRIBUTING.md** — Developer onboarding and code standards guide
- **CHANGELOG.md** — This file
- `.editorconfig` for cross-IDE consistency

### Changed

- **CSP Hardened** — `unsafe-eval` now dev-only conditional in middleware
- **Docker Support** — Added `output: "standalone"` to `next.config.ts`
- **RTL Support** — Migrated physical CSS `margin-left` to logical `margin-inline-start` in dashboard layout
- **Dynamic Locale** — `<html lang>` and `dir` attributes derived from locale config
- **RBAC Enforcement** — `automations/execute` route wrapped with `withPermission` middleware + org scoping
- **Standardized Errors** — All API routes now use `ApiErrors` envelope from `@/lib/api-utils`
- **Safe Area** — Dashboard shell respects `safe-area-inset-top` for notched devices
- **Console Cleanup** — Replaced `console.*` with structured logger in 6 core lib/component files

### Fixed

- **C-001** — Renumbered duplicate migration `030` → `035` for `settings_approval_workflow`

### Removed

- **Dead Code** — Deleted empty `src/config/constants.ts` (consumers already migrated)

## [0.1.0] — 2026-02-15

### Added

- Initial codebase: Next.js 15 + Supabase + TailwindCSS enterprise platform
- 35 Supabase migrations
- ~95 dashboard route pages
- 19 API endpoints
- 4-tier RBAC system with field-level masking
- Design token system with white-label brand support
- Accessibility infrastructure (skip links, focus trap, keyboard nav, reduced motion)
