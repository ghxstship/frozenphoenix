# TODO/FIXME Triage — FIND-005

## Overview

50 TODO/FIXME comments found across 33 files. Triaged by category below.

## Category A: Placeholder Pages (Low Priority — Expected)

These are stub/placeholder pages that will be implemented as features are built out.
No action required until the feature is scheduled.

| File | Comment | Action |
|------|---------|--------|
| `dashboards/page.tsx` | TODO: Custom dashboard builder | Feature backlog |
| `data-export/page.tsx` | TODO: Export functionality | Feature backlog |
| `forecasting/page.tsx` | TODO: Forecasting engine | Feature backlog |
| `live-ops/page.tsx` | TODO: Live ops dashboard | Feature backlog |
| `org-chart/page.tsx` | TODO: Org chart visualization | Feature backlog |
| `resource-planner/page.tsx` | TODO: Resource planning | Feature backlog |
| `saved-views/page.tsx` | TODO: Saved views | Feature backlog |
| `scenarios/page.tsx` | TODO: Scenario planning | Feature backlog |
| `system-health/page.tsx` | TODO: System health monitoring | Feature backlog |
| `tasks/page.tsx` | TODO: Task management | Feature backlog |
| `time-off/page.tsx` | TODO: Time-off management | Feature backlog |

## Category B: Implementation Gaps (Medium Priority)

| File | Comment | Priority | Action |
|------|---------|----------|--------|
| `vendor-portal/page.tsx` | TODO: vendor portal features (×5) | Medium | Wire to Supabase hooks |
| `contracts/[id]/page.tsx` | TODO: contract detail features (×3) | Medium | Wire to Supabase hooks |
| `procurement/page.tsx` | TODO: procurement features (×2) | Medium | Wire to Supabase hooks |
| `projects/[id]/page.tsx` | TODO: project detail features (×2) | Medium | Wire to Supabase hooks |

## Category C: Architecture TODOs (High Priority)

| File | Comment | Priority | Action |
|------|---------|----------|--------|
| `theme-provider.tsx` | TODO: token persistence (×4) | High | Part of settings/brand work |
| `change-requests/review/route.ts` | TODO: notification on review (×2) | High | Wire to notification system |
| `supabase/hooks.ts` | TODO: pagination, real-time (×2) | Medium | Already addressed in hooks-extended |
| `permissions/field-resolver.ts` | TODO: cache invalidation | Medium | Permission cache exists |
| `sidebar.tsx` | TODO: collapsed state persistence | Low | Already uses Zustand persist |

## Category D: Type System TODOs (Low Priority)

| File | Comment | Priority | Action |
|------|---------|----------|--------|
| `database.types.ts` | Auto-generated TODOs (×2) | None | Supabase CLI regenerated |
| `types/index.ts` | TODO: consolidate types | Low | Type refactor sprint |
| `types/normalized.ts` | TODO: add remaining normalized types | Low | Type refactor sprint |
| `types/production.ts` | TODO: production type extensions | Low | Type refactor sprint |

## Category E: Demo Data (No Action)

| File | Comment | Action |
|------|---------|--------|
| `demo-data-production.ts` | TODO: more realistic demo data | No action — demo scaffolding |
| `demo-data-vendor-lifecycle.ts` | TODO: vendor lifecycle scenarios | No action — demo scaffolding |
| `demo-data-user-lifecycle.ts` | TODO: user lifecycle scenarios | No action — demo scaffolding |
| `demo-data.ts` | TODO: seed from DB | No action — demo scaffolding |

## Summary

- **50 total** TODO/FIXME comments
- **11** are placeholder pages (expected, feature backlog)
- **12** are implementation gaps (medium priority, scheduled)
- **9** are architecture TODOs (high priority, active remediation)
- **6** are type system TODOs (low priority)
- **4** are demo data (no action needed)
- **8** are config/test/validation TODOs (low priority)

**Recommendation**: No TODO is blocking deployment. High-priority items in Category C are tracked in the remediation backlog.
