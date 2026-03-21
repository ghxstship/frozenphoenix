# 🧭 WAYFINDER — Tab Inventory

**Prompt Code:** `FP-UX-WAYFINDER-001` · **Phase 1.2** · **Date:** 2026-03-21

---

## Tab Infrastructure

| Component | File | Details |
|-----------|------|---------|
| `TabBar` | `src/components/ui/tab-bar.tsx` | Underline & pill variants, keyboard nav, aria-selected, AnimatePresence |
| `TabPanel` | `src/components/ui/tab-bar.tsx` | Framer Motion fade transition, role="tabpanel" |
| `PageShell` (legacy) | `src/components/layouts/page-shell.tsx` | **Deprecated** — wraps TabBar, replaced by purpose-built shells |
| `ListPageShell` | `src/components/shells/list-page-shell.tsx` | Primary shell — built-in tabs via config |
| `DetailPageShell` | `src/components/shells/detail-page-shell.tsx` | Entity detail — tab support for facets |
| `OperationalDashboardShell` | `src/components/shells/operational-dashboard-shell.tsx` | Stats + tabs + card grids |
| `SettingsPageShell` | `src/components/shells/settings-page-shell.tsx` | Settings panels with vertical tabs |
| `FormPageShell` | `src/components/shells/form-page-shell.tsx` | Create/edit forms — no tabs |
| `WizardShell` | `src/components/shells/wizard-shell.tsx` | Multi-step flows — stepper, not tabs |

---

## Tab Bars Per Page

> **Note:** Frozen Phoenix uses a catch-all route handler (`[[...slug]]/page.tsx`) and config-driven shells. Most list pages derive tabs from their list-page-config. Below documents the tab patterns found.

### Settings Page — `/settings`

| Tab | Content Type | Default? |
|-----|-------------|----------|
| (Custom `_tabs/` directory) | settings | — |

- **Tab count:** Implementation uses route-level `_tabs/` pattern
- **URL behavior:** Tab content loaded via route segments
- **Persistence:** Browser URL preserves active tab
- **Mobile:** Horizontal scroll expected
- **Role visibility:** Settings requires `settings.manage` permission

### List Pages (Config-Driven Pattern)

Most list pages use `ListPageShell` which renders tabs from `list-page-configs/*.ts`. The standard tab pattern is:

| Tab | Content Type | Notes |
|-----|-------------|-------|
| "All" or "Active" | list | Default active — shows filtered list |
| Status-based tabs | list | Filter by entity status (Draft, Active, Archived, etc.) |
| View-mode tabs | list/dashboard | Table vs Card vs Calendar views |

- **Tab count:** Typically 3–5 per list page (status filters)
- **URL behavior:** Tabs do NOT update URL (state lives in component state via `onValueChange`)
- **Persistence:** Tab state resets on navigation away and back
- **Data loading:** All tabs share the same dataset, filtered client-side
- **Mobile:** Horizontal scroll with `overflow-x-auto scrollbar-hide`

### Detail Pages (Config-Driven Pattern)

Detail pages use `DetailPageShell` with tab facets:

| Tab | Content Type | Notes |
|-----|-------------|-------|
| "Overview" | detail | Default — key fields, summary |
| "Activity" | list | Timeline of changes |
| Entity-specific facets | list/detail | e.g., "Crew", "Budget", "Documents" |

- **Tab count:** Typically 3–6 per detail page
- **URL behavior:** Tabs do NOT update URL
- **Persistence:** Resets on navigation
- **Mobile:** Horizontal scroll

### Operational Dashboard Pattern

The `OperationalDashboardShell` uses tabs for dashboard views:

| Tab | Content Type | Notes |
|-----|-------------|-------|
| "Overview" | dashboard | Cards with KPIs |
| Domain-specific tabs | dashboard/list | Filtered operational views |

- **Tab count:** 2–4 typically

---

## Tab Bar Technical Properties

| Property | Value |
|----------|-------|
| **Variants** | `underline` (default), `pill` |
| **Sizes** | `sm` (12px text, 8px pad), `md` (14px text, 10px pad) |
| **Orientation** | `horizontal` (default), `vertical` |
| **Keyboard navigation** | Arrow Left/Right (horizontal), Arrow Up/Down (vertical), Home, End |
| **ARIA** | `role="tablist"`, `aria-selected`, `aria-controls`, `aria-orientation` |
| **Animation** | Pill variant uses `SlidingIndicator`; panel uses `AnimatePresence` (150ms fade) |
| **Disabled support** | `disabled` prop skips item in keyboard nav |
| **Count badges** | Optional `count` prop renders pill badge next to label |
| **Icon support** | Optional `icon` prop renders before label |

---

## Flagged Issues

| # | Severity | Finding |
|---|----------|---------|
| 1 | 🔴 FAIL | **Tab state not reflected in URL** — users cannot bookmark or share a tab state. "All" vs "Active" tab is lost on page refresh or link share. |
| 2 | 🟡 WARN | **Tab persistence missing** — switching away from a page and returning resets to the default tab. Previous selection is lost. |
| 3 | 🟡 WARN | **No lazy loading per tab** — all tab content shares the same dataset filtered client-side. Not a problem now but will be at scale. |
| 4 | 🟡 WARN | **Sidebar active state does not change when tabs change** — sidebar highlight stays on the parent route regardless of active tab. |
| 5 | ⚠️ NOTE | **Settings uses `_tabs/` route pattern** — inconsistent with other pages that use client-side `TabBar`. Consider standardizing. |
| 6 | ⚠️ NOTE | **Detail page tab counts are reasonable** (3–6) but should be monitored as features are added. |
