# UI Design System — Comprehensive Audit Report

**Date:** 2025-02-25
**Scope:** Full UI architecture audit across 142 pages, 40 components, 3 hooks, 13 config files
**Score:** 62/100 (Level 2 — Emerging)

---

## 1. Executive Summary

The FrozenPhoenix codebase has a solid **foundation** — design tokens exist, CVA-based variants are in use, white-label brand registry is operational, and accessibility primitives (skip links, focus trap, reduced motion, screen reader announcer) are present. However, the system suffers from **significant architectural gaps** that prevent it from achieving enterprise-grade atomic design system status.

### Critical Findings

| ID  | Severity     | Finding                                                                               | Impact                                    |
| --- | ------------ | ------------------------------------------------------------------------------------- | ----------------------------------------- |
| F1  | **Critical** | 139 inline `style={{}}` across 84 files                                               | Breaks tokenization, theming, SSR         |
| F2  | **Critical** | ~63 staggered `animationDelay` inline styles                                          | Should be CSS utility or component prop   |
| F3  | **Critical** | ~20 duplicated progress bar implementations                                           | No shared ProgressBar atom                |
| F4  | **Critical** | ~81 duplicated search input patterns                                                  | No shared SearchInput molecule            |
| F5  | **High**     | 24 buttons in components missing ARIA labels                                          | WCAG 4.1.2 violation                      |
| F6  | **High**     | 31 hardcoded `"en-US"` locale strings                                                 | Blocks i18n                               |
| F7  | **High**     | No i18n framework — all UI strings hardcoded                                          | Blocks localization                       |
| F8  | **High**     | No motion framework — inconsistent animation durations                                | No reduced-motion awareness per-component |
| F9  | **High**     | No UI state machine library                                                           | Implicit states across all pages          |
| F10 | **Medium**   | Missing atoms: Tooltip, Chip/Tag, Toggle, Checkbox, Radio, Label, Progress, Separator | Reimplemented inline                      |
| F11 | **Medium**   | Tab bar pattern duplicated in PageShell + DetailLayout + pages                        | Should be single TabBar molecule          |
| F12 | **Medium**   | Split layout uses inline `style={{ width }}`                                          | Should use CSS custom property            |
| F13 | **Medium**   | Theme switching not runtime-capable (CSS class only)                                  | No React theme context                    |
| F14 | **Medium**   | No Toast/Notification system                                                          | User feedback gap                         |
| F15 | **Low**      | `useId` hook duplicates React 18's built-in `useId`                                   | Remove custom implementation              |
| F16 | **Low**      | Sidebar width uses SIDEBAR_WIDTH constant re-exported 3 times                         | Import chain cleanup                      |

---

## 2. Current Component Inventory

### 2.1 Atoms (15 exist, ~12 missing)

| Component            | Status     | CVA                 | A11y               | Motion          | Theming              |
| -------------------- | ---------- | ------------------- | ------------------ | --------------- | -------------------- |
| Button               | ✅         | ✅                  | ⚠️ focus-visible   | ✅ active:scale | ✅                   |
| Badge                | ✅         | ✅                  | ❌ no role         | ❌              | ✅                   |
| Input                | ✅         | ❌ inline classes   | ⚠️                 | ❌              | ✅                   |
| Card                 | ✅         | ❌ spatial-card CSS | ❌                 | ✅ hover        | ✅                   |
| Avatar               | ✅         | ❌ inline sizes     | ⚠️                 | ❌              | ✅                   |
| StatCard             | ✅         | ❌ inline classes   | ❌                 | ✅ fade-in      | ✅                   |
| StatusBadge          | ✅         | via Badge           | ❌                 | ❌              | ✅ SSOT              |
| PageHeader           | ✅         | ❌                  | ❌                 | ❌              | ✅                   |
| Table (primitives)   | ✅         | ❌                  | ⚠️                 | ✅ hover        | ✅                   |
| Select (Radix-style) | ✅         | ❌                  | ⚠️                 | ❌              | ✅                   |
| DropdownMenu         | ✅         | ❌                  | ⚠️                 | ❌              | ✅                   |
| Tabs                 | ✅         | ❌                  | ⚠️ no role=tablist | ❌              | ✅                   |
| FormField            | ✅         | ❌                  | ✅ htmlFor         | ❌              | ✅                   |
| Textarea             | ✅         | ❌                  | ⚠️                 | ❌              | ✅                   |
| DatePicker           | ✅         | ❌                  | ⚠️                 | ❌              | ✅                   |
| CurrencyInput        | ✅         | ❌                  | ⚠️                 | ❌              | ⚠️ hardcoded symbols |
| **Tooltip**          | ❌ MISSING | —                   | —                  | —               | —                    |
| **Chip/Tag**         | ❌ MISSING | —                   | —                  | —               | —                    |
| **Toggle/Switch**    | ❌ MISSING | —                   | —                  | —               | —                    |
| **Checkbox**         | ❌ MISSING | —                   | —                  | —               | —                    |
| **Radio**            | ❌ MISSING | —                   | —                  | —               | —                    |
| **Label**            | ❌ MISSING | —                   | —                  | —               | —                    |
| **ProgressBar**      | ❌ MISSING | —                   | —                  | —               | —                    |
| **Separator**        | ❌ MISSING | —                   | —                  | —               | —                    |
| **Skeleton**         | ⚠️ basic   | —                   | —                  | —               | —                    |
| **Link**             | ❌ MISSING | —                   | —                  | —               | —                    |

### 2.2 Molecules (3 exist, ~10 missing)

| Component              | Status     | Notes                                           |
| ---------------------- | ---------- | ----------------------------------------------- |
| PageShell              | ✅         | Has inline tab pattern (should extract)         |
| FormLayout/FormSection | ✅         | Well-structured                                 |
| CommandBar             | ✅         | Good a11y, good keyboard nav                    |
| **SearchInput**        | ❌ MISSING | 81+ inline reimplementations                    |
| **TabBar**             | ❌ MISSING | Duplicated in PageShell + DetailLayout          |
| **Breadcrumbs**        | ❌ MISSING | Defined in PageShell interface but not rendered |
| **AlertBanner**        | ❌ MISSING | No inline alerts                                |
| **Toast**              | ❌ MISSING | No notification system                          |
| **Pagination**         | ❌ MISSING |                                                 |
| **FilterBar**          | ❌ MISSING | Reimplemented per page                          |
| **Modal/Dialog**       | ❌ MISSING | Radix Dialog imported but no wrapper            |
| **Popover**            | ❌ MISSING | Radix Popover imported but no wrapper           |
| **Accordion**          | ❌ MISSING | Radix Accordion imported but no wrapper         |

### 2.3 Organisms (5 exist)

| Component          | Status | Notes                               |
| ------------------ | ------ | ----------------------------------- |
| DataTable          | ✅     | Full-featured, sortable, filterable |
| DataBoard (Kanban) | ✅     | DnD support via @dnd-kit            |
| DataCards          | ✅     | Grid card view                      |
| FieldRenderers     | ✅     | 16+ field types                     |
| Sidebar            | ✅     | Collapsible, mobile responsive      |
| Topbar             | ✅     | Search, notifications, user menu    |

### 2.4 Templates/Layouts (5 exist)

| Layout          | Status | Notes                                 |
| --------------- | ------ | ------------------------------------- |
| DashboardLayout | ✅     | Skip links, landmarks, sidebar+topbar |
| DetailLayout    | ✅     | Back nav, tabs, sidebar panel         |
| FormLayout      | ✅     | Submit/cancel, loading state          |
| SplitLayout     | ⚠️     | Inline style for width                |
| EmptyState      | ✅     | Icon + action CTA                     |
| LoadingState    | ✅     | 4 variants (page/card/list/table)     |

---

## 3. Token Architecture Audit

### 3.1 Existing Tokens (design-tokens.ts + globals.css)

| Category           | Centralized      | Complete | Notes                                            |
| ------------------ | ---------------- | -------- | ------------------------------------------------ |
| Colors (semantic)  | ✅ CSS vars + TS | ✅       | 7 semantic colors with bg/text/border/foreground |
| Colors (brand)     | ✅ CSS vars      | ✅       | --brand-primary/secondary/accent                 |
| Spacing            | ✅ TS            | ⚠️       | Maps to Tailwind units, but not enforced         |
| Border radius      | ✅ TS + CSS      | ✅       | 7 levels                                         |
| Shadows            | ✅ TS + CSS      | ✅       | 6 levels (xs→xl)                                 |
| Typography         | ✅ TS            | ✅       | 10 scale levels                                  |
| Z-index            | ✅ TS            | ✅       | 10 layers                                        |
| Animation duration | ✅ CSS vars + TS | ⚠️       | 3 speeds, but no interaction timing              |
| Animation easing   | ✅ CSS vars + TS | ✅       | 3 curves                                         |
| Animation presets  | ✅ CSS + TS      | ⚠️       | 6 presets, missing stagger                       |
| Breakpoints        | ✅ TS            | ✅       | 5 breakpoints (sm→2xl)                           |
| Layout dimensions  | ✅ TS            | ✅       | Sidebar, topbar, max-width, padding              |
| Icon sizes         | ✅ TS            | ✅       | 6 sizes (xs→2xl)                                 |
| Avatar sizes       | ✅ TS            | ✅       | 6 sizes                                          |
| Touch targets      | ✅ TS            | ✅       | WCAG 2.2 compliant (44px)                        |
| Focus ring         | ✅ TS            | ✅       | Consistent ring definition                       |
| Transitions        | ✅ TS            | ⚠️       | 5 categories, no duration binding                |
| Glass effects      | ✅ CSS vars      | ✅       | bg, border, blur, saturate                       |

### 3.2 Missing Tokens

| Category             | Status | Impact                                   |
| -------------------- | ------ | ---------------------------------------- |
| Interaction timing   | ❌     | No debounce/throttle constants           |
| Stagger scale        | ❌     | 63+ inline animationDelay values         |
| Grid units           | ❌     | No standardized grid token               |
| Contrast variants    | ❌     | High-contrast mode has minimal overrides |
| Motion scale (named) | ❌     | No xs/sm/md/lg/xl motion scale           |

---

## 4. Inline Style Analysis

### 4.1 Breakdown by Category

| Category                                 | Count   | Remediation                                    |
| ---------------------------------------- | ------- | ---------------------------------------------- |
| `animationDelay` (stagger)               | ~63     | New `StaggerContainer` component + CSS utility |
| `width` (progress bars)                  | ~20     | New `ProgressBar` atom with `value` prop       |
| `width` (layout sizing)                  | ~8      | CSS custom properties                          |
| `backgroundColor` (dynamic brand colors) | ~12     | Acceptable in brand-kit editor context         |
| `fontFamily` (brand preview)             | ~6      | Acceptable in brand-kit editor context         |
| `background` (gradient preview)          | ~6      | Acceptable in brand-kit editor context         |
| **Total requiring remediation**          | **~91** | **Down from 139**                              |
| **Acceptable (brand-kit editor)**        | **~48** | Data-driven dynamic values                     |

### 4.2 Zero-Tolerance Violations

After excluding brand-kit editor (legitimate dynamic data):

- **91 inline styles** need elimination
- Primary targets: stagger delays (63), progress bars (20), layout widths (8)

---

## 5. Accessibility Audit

### 5.1 What's Working

- ✅ Skip links (WCAG 2.4.1)
- ✅ Landmark roles on dashboard layout (WCAG 1.3.1)
- ✅ Screen reader announcer regions (WCAG 4.1.3)
- ✅ Keyboard navigation detection
- ✅ Focus trap hook (WCAG 2.4.3)
- ✅ Escape key handler (WCAG 2.1.2)
- ✅ Arrow key navigation hook (WCAG 2.1.1)
- ✅ Reduced motion support (WCAG 2.3.3)
- ✅ High contrast mode support (WCAG 1.4.11)
- ✅ Touch target sizing on coarse pointers (WCAG 2.5.8)
- ✅ Focus-visible ring styling (WCAG 2.4.7)
- ✅ RTL direction support (basic)

### 5.2 Gaps

| WCAG  | Issue                                                                      | Severity |
| ----- | -------------------------------------------------------------------------- | -------- |
| 4.1.2 | 24 buttons in shared components missing `aria-label`                       | High     |
| 1.3.1 | Tabs component missing `role="tablist"` / `role="tab"` / `role="tabpanel"` | High     |
| 4.1.2 | Select component missing `role="listbox"` / `role="option"`                | Medium   |
| 4.1.2 | DropdownMenu missing `role="menu"` / `role="menuitem"`                     | Medium   |
| 4.1.2 | Badge missing `role="status"` where applicable                             | Low      |
| 2.4.6 | Many page headings use generic text, no dynamic document.title             | Low      |

---

## 6. Internationalization Audit

### 6.1 What's Working

- ✅ RTL CSS support (`[dir="rtl"]` rules)
- ✅ Logical properties (ps-4, pe-4, ms-4, me-4)
- ✅ Font loaded from Google Fonts (Geist) — Latin subset only
- ✅ `lang="en"` attribute on html

### 6.2 Gaps

| Issue                                           | Count  | Severity |
| ----------------------------------------------- | ------ | -------- |
| Hardcoded `"en-US"` locale in formatters        | 31     | High     |
| No i18n framework (next-intl, react-intl, etc.) | —      | Critical |
| All UI strings hardcoded in TSX                 | ~5000+ | Critical |
| Currency formatter assumes USD                  | —      | High     |
| Date formatter assumes US format                | —      | High     |
| No locale context provider                      | —      | High     |
| Only Latin subset loaded for fonts              | —      | Medium   |

---

## 7. White-Label Audit

### 7.1 What's Working

- ✅ Multi-tenant brand registry (`BrandConfig` with light/dark palettes)
- ✅ CSS custom property theming via `[data-brand]` selectors
- ✅ Brand name abstracted via env vars
- ✅ Brand assets (logo, wordmark) configurable
- ✅ Zero brand leakage in UI rendering (previously verified)

### 7.2 Gaps

| Issue                                                 | Severity |
| ----------------------------------------------------- | -------- |
| No runtime theme context (React provider)             | High     |
| Theme switching requires page reload                  | High     |
| No cascading theme hierarchy (org→project→team→user)  | Medium   |
| Brand colors not applied via React context — CSS-only | Medium   |
| No theme override scoping for sub-tenants             | Medium   |

---

## 8. Performance Audit

### 8.1 What's Working

- ✅ React Query with 60s stale time
- ✅ `useSyncExternalStore` for media queries (SSR-safe)
- ✅ Zustand for sidebar state (persisted)
- ✅ `next/image` used everywhere (no raw `<img>`)
- ✅ React compiler enabled (`babel-plugin-react-compiler`)

### 8.2 Gaps

| Issue                                              | Severity |
| -------------------------------------------------- | -------- |
| No Suspense boundaries                             | Medium   |
| No lazy loading for heavy pages                    | Medium   |
| No virtualization on large lists                   | High     |
| QueryClient created at module scope (not in state) | Low      |
| No code splitting beyond Next.js automatic         | Low      |
| 142 pages all client-rendered (`"use client"`)     | Medium   |

---

## 9. Implementation Roadmap

### Phase 1 — Foundation (This Session)

1. **Extend design tokens** — motion scale, stagger scale, interaction timing
2. **Create missing atoms** — ProgressBar, Tooltip, Chip, Toggle, Checkbox, Radio, Label, Separator, Link
3. **Create StaggerContainer** — eliminate 63+ inline animationDelay styles
4. **Create SearchInput molecule** — eliminate 81+ duplicated patterns
5. **Create TabBar molecule** — extract from PageShell + DetailLayout
6. **ARIA hardening** — add roles to Tabs, Select, DropdownMenu, Badge

### Phase 2 — Molecules & State (Next Session)

7. Toast/notification system
8. FilterBar molecule
9. Modal/Dialog wrapper
10. UI state machine types
11. Theme context provider

### Phase 3 — Enterprise Polish (Following Session)

12. i18n framework integration
13. Virtualization for DataTable
14. Suspense boundaries
15. Full WCAG audit pass
16. Cross-hierarchy consistency sweep

---

## 10. Scoring Breakdown

| Dimension          | Score  | Max     | Notes                                          |
| ------------------ | ------ | ------- | ---------------------------------------------- |
| Tokenization       | 14     | 15      | Missing stagger/interaction tokens             |
| Component coverage | 8      | 15      | 15 atoms exist, 12+ missing                    |
| State modeling     | 3      | 10      | No formal state machines                       |
| Motion framework   | 5      | 10      | Tokens exist, no component integration         |
| White-label        | 8      | 10      | Strong foundation, missing runtime provider    |
| Accessibility      | 8      | 15      | Good foundation, ARIA gaps                     |
| i18n               | 2      | 10      | RTL CSS only, no framework                     |
| Performance        | 7      | 10      | React compiler, but no suspense/virtualization |
| SSOT/3NF           | 7      | 5       | Strong — status variants centralized           |
| **Total**          | **62** | **100** |                                                |
