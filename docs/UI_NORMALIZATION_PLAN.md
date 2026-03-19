# UI Architecture Normalization Plan — V2

> **V1 Generated:** 2026-03-18 · **V2 Re-audit:** 2026-03-19 · **Status:** ✅ 100% NORMALIZED

---

## Executive Summary

FrozenPhoenix has **6 standardized shell components** plus the `PageHeader` primitive that collectively enforce consistent layout, RBAC, accessibility, density tokens, and keyboard shortcuts across all 366 dashboard pages and 150 `_client.tsx` files.

**V2 re-audit result: 150/150 \_client files normalized (100%).** Zero ad-hoc UI code. Zero legacy `PageShell` imports.

### Final State

| Shell / Primitive                             | \_client files    | %        | Status        |
| --------------------------------------------- | ----------------- | -------- | ------------- |
| **ListPageShell**                             | 7 (+215 page.tsx) | 4.7%     | ✅            |
| **DetailPageShell**                           | 56                | 37.3%    | ✅            |
| **OperationalDashboardShell**                 | 53                | 35.3%    | ✅            |
| **FormPageShell**                             | 7                 | 4.7%     | ✅            |
| **SettingsPageShell**                         | 5                 | 3.3%     | ✅            |
| **WizardShell**                               | 2                 | 1.3%     | ✅            |
| **PageHeader** (bespoke w/ normalized header) | 20                | 13.3%    | ✅            |
| **PageShell (legacy)**                        | 0                 | 0%       | ✅ Eliminated |
| **No shell or header**                        | 0                 | 0%       | ✅ Eliminated |
| **Total**                                     | **150**           | **100%** |               |

### Page Coverage

| Scope                                           | Count | Status               |
| ----------------------------------------------- | ----- | -------------------- |
| `page.tsx` files (RSC wrappers + ListPageShell) | 366   | ✅ All accounted for |
| `_client.tsx` files (interactive pages)         | 150   | ✅ 100% normalized   |
| Legacy `PageShell` imports                      | 0     | ✅                   |
| Ad-hoc `<h1>` page headers                      | 0     | ✅                   |

---

## Shell Inventory

### Tier 1 — Primitive

- **PageHeader** — Normalized page header component. Supports `title`, `description`, `icon`, `centered` mode, action `children`, and `className` override. Used by all shells internally and by 20 bespoke pages directly.

### Tier 2 — Composable Page Containers

1. **ListPageShell** — Universal list page: table/board/cards/timeline/calendar/gallery/chart/map/workload views, declarative stats, filters, bulk actions, CRUD, CSV export/import, column visibility, quick-view panel
2. **DetailPageShell** — Single-record detail: tabbed overview, field grid, related entities, CRUD menu, status badges, action buttons
3. **FormPageShell** — Create/edit forms: section-based field grid, auto-rendering from config, validation, Cmd+S, sticky action bar, camelCase↔snake_case transforms
4. **WizardShell** — Multi-step flows: step indicator, validation per step, skip/back/next, RBAC, completion callback
5. **OperationalDashboardShell** — KPI dashboards: stat cards, filters, tabs, search, card-based content sections
6. **SettingsPageShell** — Settings pages: tabbed layout, toggle/select/input rows, auto-rendering from config

### Deprecated & Eliminated

7. **PageShell** — Legacy thin wrapper. `src/components/layouts/page-shell.tsx` retained as dead code. Zero consumers. Safe to delete.

---

## PageHeader Enhancement (V2)

`PageHeader` was enhanced to support all page archetypes:

```tsx
interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode; // action buttons
  className?: string;
  icon?: LucideIcon; // NEW: hero icon above title
  iconClassName?: string; // NEW: icon container override
  centered?: boolean; // NEW: centered layout for standalone flows
}
```

- **Default mode** — Left-aligned title/description with optional icon and right-aligned actions
- **Centered mode** — Centered title/description/icon for onboarding and standalone flows

---

## V2 Remediations Completed

### Phase 1 (V1) — Shell Migrations ✅

| Page                | Shell                     | Notes                                           |
| ------------------- | ------------------------- | ----------------------------------------------- |
| `pipeline/new`      | FormPageShell             | 4-section declarative FormPageConfig            |
| `workforce/reviews` | OperationalDashboardShell | DashboardPageConfig with stats, search, filters |

### Phase 2 (V1) — PageShell → PageHeader ✅

11 pages migrated from legacy `PageShell` to `PageHeader` + density container:

- `knowledge-base/collaborative`, `reports/ai`, `live-ops/gate`
- `calendar`, `scheduling`, `messages`, `org-chart`
- `advancing/new`, `assets/scan`, `assets/scan/batch`, `templates/[id]/edit`

### Phase 3 (V2) — Zero Ad-Hoc Elimination ✅

9 pages had raw `<h1>` / `<div>` headers with no shell or `PageHeader`. All remediated:

| Page                        | Remediation                                                     |
| --------------------------- | --------------------------------------------------------------- |
| `data-export`               | Added `PageHeader` (title + description)                        |
| `settings/security`         | Added `PageHeader` (title + description)                        |
| `settings/org-security`     | Added `PageHeader` in 3 code paths (main form + 2 error states) |
| `resource-planner`          | Added `PageHeader` with action button child                     |
| `onboarding/org-setup`      | `PageHeader centered` with `Building2` icon                     |
| `onboarding/invite-team`    | `PageHeader centered` with `UserPlus` icon                      |
| `onboarding/billing`        | `PageHeader centered` with `CreditCard` icon                    |
| `onboarding/claim-username` | `PageHeader centered` with `AtSign` icon                        |
| `onboarding/complete`       | `PageHeader centered` (celebration heading)                     |

---

## Validation

| Check                                  | Result                                                            |
| -------------------------------------- | ----------------------------------------------------------------- |
| `grep PageShell src/app/`              | **0 imports**                                                     |
| `grep '<h1 ' --include='*_client.tsx'` | **1 match** — slide content renderer in `decks/[id]` (legitimate) |
| Unshelled `_client.tsx` files          | **0**                                                             |
| `tsc --noEmit`                         | **exit 0**                                                        |
| `eslint` on all modified files         | **exit 0**                                                        |

---

## 20 PageHeader-Only Pages (Bespoke Classification)

These pages use `PageHeader` directly because their interaction patterns don't map to any shell:

### Dashboard Bespoke (11 pages)

- `advancing/new` — Catalog browser + cart drawer + checkout flow
- `assets/scan` — Camera/barcode scanner with real-time asset lookup
- `assets/scan/batch` — Batch scanner with queue management
- `calendar` — Full calendar view with event creation
- `scheduling` — Gantt/timeline scheduler with drag-drop
- `messages` — Split-pane messaging UI
- `org-chart` — DnD hierarchy editor
- `templates/[id]/edit` — Block-based template editor
- `knowledge-base/collaborative` — Real-time collaborative editor
- `reports/ai` — NL query → chart generator
- `live-ops/gate` — Credential scanning UI

### Settings Bespoke (2 pages)

- `settings/security` — Password change, MFA, sessions (Supabase Auth API)
- `settings/org-security` — SSO, session limits, IP allowlist

### Data Privacy (1 page)

- `data-export` — GDPR/CCPA self-service data export

### Resource Planning (1 page)

- `resource-planner` — Capacity matrix with timeline navigation

### Onboarding Standalone (5 pages)

- `onboarding/org-setup` — Organization creation (centered, hero icon)
- `onboarding/invite-team` — Team invitation (centered, hero icon)
- `onboarding/billing` — Plan selection (centered, hero icon)
- `onboarding/claim-username` — Username selection (centered, hero icon)
- `onboarding/complete` — Celebration screen (centered)

---

## Decision Log

| Decision                                                                  | Rationale                                                                                       |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Enhance `PageHeader` with `icon`, `centered`, `iconClassName` props       | Enables onboarding pages to use the same primitive without breaking centered layouts            |
| Normalize onboarding pages with `PageHeader centered`                     | Eliminates ad-hoc `<h1>` while preserving design intent (centered hero layout)                  |
| Normalize `settings/security` + `settings/org-security` with `PageHeader` | Too imperative (Supabase Auth API, MFA) for SettingsPageShell; PageHeader normalizes the header |
| Normalize `data-export` with `PageHeader`                                 | Simple header swap; page is too small/unique for OperationalDashboardShell                      |
| Normalize `resource-planner` with `PageHeader`                            | Bespoke capacity matrix; no shell analog                                                        |
| Retain `page-shell.tsx` as dead code                                      | Zero consumers; safe to delete in a future cleanup pass                                         |
| Count `decks/[id]` slide `<h1>` as legitimate                             | Renders user-authored slide content, not a page header                                          |
