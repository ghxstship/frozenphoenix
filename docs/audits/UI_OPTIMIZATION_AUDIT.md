# UI Optimization Audit — Comprehensive Findings

> **Audited:** 2026-03-19  
> **Scope:** Design system primitives, shell components, layout components, data-view layer, form system, CSS/styling, component composition patterns  
> **Objective:** Identify all UI optimization opportunities while maintaining 3NF, SSOT, and canonical design system compliance

---

## Executive Summary

The codebase demonstrates strong architectural discipline: a well-layered shell system (6 purpose-built shells), tokenized styling via CSS custom properties + `design-tokens.ts`, declarative config-driven pages, and lazy-loaded data views. The overall design system is **SSOT-compliant at the macro level** — tokens flow from `design-tokens.ts` → `globals.css` → components.

However, the audit identified **27 optimization opportunities** across 8 categories, ranging from DRY violations (duplicated utility functions) to missed consolidation (StatCard vs MetricCard), to performance improvements (eager imports, `window.location.reload` anti-pattern). None are blocking, but collectively they represent meaningful bundle size, maintainability, and consistency improvements.

---

## Finding Categories

| #   | Category                       | Findings | Severity |
| --- | ------------------------------ | -------- | -------- |
| 1   | Duplicated Utility Functions   | 3        | High     |
| 2   | Component Consolidation        | 4        | High     |
| 3   | Performance Anti-Patterns      | 4        | High     |
| 4   | SSOT Violations                | 4        | Medium   |
| 5   | Layout/Styling Normalization   | 4        | Medium   |
| 6   | Form System Gaps               | 3        | Medium   |
| 7   | Dead Code / Legacy Surface     | 3        | Low      |
| 8   | Accessibility / UX Refinements | 2        | Low      |

---

## 1. Duplicated Utility Functions (High)

### 1.1 `getNestedValue` — 5 identical copies

**Files:**

- `src/components/shells/list-page-shell.tsx`
- `src/components/shells/detail-page-shell.tsx`
- `src/components/shells/field-grid.tsx`
- `src/components/shells/operational-dashboard-shell.tsx`
- `src/components/shells/quick-view-panel.tsx`

**Violation:** SSOT — same function defined in 5 places. Any bug fix must be applied 5 times.

**Recommendation:** Extract to `src/lib/utils.ts` (or a new `src/lib/record-utils.ts`):

```ts
export function getNestedValue(record: Record<string, unknown>, key: string): unknown { ... }
```

All 5 files import from the single source. ~60 lines removed.

### 1.2 `matchesSearch` — 2 identical copies

**Files:**

- `src/components/shells/list-page-shell.tsx`
- `src/components/shells/operational-dashboard-shell.tsx`

**Recommendation:** Extract to `src/lib/record-utils.ts` alongside `getNestedValue`.

### 1.3 `computeStatValue` — 2 near-identical copies

**Files:**

- `src/components/shells/detail-page-shell.tsx` (operates on `DetailStatDef`)
- `src/components/shells/quick-view-panel.tsx` (operates on `DetailStatDef`)

Both have identical logic. A third variant in `operational-dashboard-shell.tsx` operates on `DashboardStatDef` with slightly different signature.

**Recommendation:** Unify into a generic `computeStatValue<T>` in `src/lib/record-utils.ts`. The `DashboardStatDef` variant can be a thin wrapper.

### 1.4 `toDataTableColumn` — 2 identical copies

**Files:**

- `src/components/shells/list-page-shell.tsx`
- `src/components/shells/related-entities.tsx`

Both map `ListColumnDef → ColumnDef<EntityRecord>` with identical field-by-field assignment.

**Recommendation:** Export from `src/components/data-view/data-table.tsx` or a shared `src/lib/column-utils.ts`.

---

## 2. Component Consolidation (High)

### 2.1 `StatCard` vs `MetricCard` — overlapping primitives

**Files:**

- `src/components/ui/stat-card.tsx` (71 lines)
- `src/components/ui/metric-card.tsx` (170 lines)

Both render a card with: title, value (with `NumberTicker`), optional icon (in identical `h-10 w-10 rounded-xl bg-primary/10` container), optional trend indicator, optional description. `MetricCard` adds: variant theming, thresholds, sparkline, unit, previousValue.

**Violation:** Two atoms in the design system that serve overlapping purposes. Consumers must decide which to use; the visual output is nearly identical for basic use cases.

**Recommendation:** Merge into a single `MetricCard` with backward-compatible `StatCard` alias:

```ts
export const StatCard = MetricCard; // backward compat
```

Or extend `StatCard` props to subsume `MetricCard` features. Net reduction: ~70 lines + one fewer component to document.

### 2.2 `FormLayout` vs `FormPageShell` — redundant form containers

**Files:**

- `src/components/layouts/form-layout.tsx` (183 lines)
- `src/components/shells/form-page-shell.tsx` (784 lines)

`FormPageShell` internally replicates the entire layout of `FormLayout` (back link, header, form wrapper, sticky action bar with ⌘S hint). `FormLayout` is imported by `FormPageShell` only for `FormSection`, not for the `FormLayout` wrapper itself.

**Current state:** Only 1 consumer of `FormLayout` import exists (for `FormSection`). The wrapper component itself appears orphaned.

**Recommendation:** Mark `FormLayout` as `@deprecated` (the wrapper, not `FormSection`). `FormSection` should be extracted to its own file or kept as-is since `FormPageShell` depends on it.

### 2.3 Alert Banner — 2 near-identical implementations

**Files:**

- `src/components/shells/list-page-shell.tsx` (lines 155-172, `AlertBanner` component)
- `src/components/shells/operational-dashboard-shell.tsx` (lines 193-230, inline alert rendering)

Both render `Card` with `border-{severity}/30 bg-{severity}/5` + icon + message. The list-page version is a clean extracted component; the dashboard version is inline with `cn()` composition.

**Recommendation:** Extract `AlertBanner` to a shared `src/components/ui/alert-banner.tsx` primitive. Both shells consume it. The severity→color mapping (`warning`, `info`, `destructive`) is repeated in `metric-card.tsx` as `VARIANT_STYLES` — consolidate the mapping into design tokens or a shared constant.

### 2.4 `EntityRecord` type alias — 6 identical declarations

**Files:** list-page-shell, detail-page-shell, field-grid, quick-view-panel, related-entities, server-fetch.ts

All declare `type EntityRecord = Record<string, unknown>`.

**Recommendation:** Export once from `src/types/entity.ts`:

```ts
export type EntityRecord = Record<string, unknown>;
```

---

## 3. Performance Anti-Patterns (High)

### 3.1 `window.location.reload()` — 4 occurrences in list-page-shell

**File:** `src/components/shells/list-page-shell.tsx` (lines 828, 914, 1078, 1110)

Used after delete, bulk delete, board drag-end, and create operations. This triggers a full page reload, destroying React state, re-fetching all data, and resetting scroll position.

**Recommendation:** Replace with React Query cache invalidation:

```ts
queryClient.invalidateQueries({ queryKey: [config.entityKey] });
```

This is the standard pattern for optimistic UI with reconciliation. Full page reloads are a P0 UX regression in an SPA.

### 3.2 `window.location.href` navigation in `related-entities.tsx`

**File:** `src/components/shells/related-entities.tsx` (line 128)

Uses `window.location.href = href` instead of Next.js router, causing a full navigation instead of client-side transition.

**Recommendation:** Replace with `router.push(href)` from `useRouter()`.

### 3.3 `FormLayout` import in `FormPageShell`

**File:** `src/components/shells/form-page-shell.tsx` (line 24)

Imports `FormSection` from `@/components/layouts/form-layout`, which also includes the `FormLayout` component (183 lines) that `FormPageShell` does not use. Tree-shaking should handle this, but named exports from the same file may not always be eliminated depending on bundler behavior.

**Recommendation:** Extract `FormSection` to its own file to guarantee zero dead-code import risk.

### 3.4 Eager prefetch of all configs on first load

**File:** `src/components/shells/list-page-shell.tsx` (lines 510, 519)

`prefetchAllConfigs()` is called both after the first config resolves AND when a config is already cached. This is aggressive — it loads all 10 domain config modules (~13K lines) during idle time. For users who only visit 1-2 domains, this is wasted bandwidth.

**Recommendation:** Consider a more targeted prefetch strategy — prefetch only the domain modules for the current user's role or recently visited pages. Or gate behind `navigator.connection?.effectiveType` to skip on slow connections.

---

## 4. SSOT Violations (Medium)

### 4.1 Entity metadata resolution — 5 identical patterns

**Files:** list-page-shell, detail-page-shell, form-page-shell, quick-view-panel, related-entities

All shells independently resolve:

```ts
const entityConfig = getEntityConfig(config.entityKey);
const basePath = entityConfig?.basePath ?? `/api/${config.entityKey.replace(/_/g, "-")}`;
const slug = entityConfig?.slug ?? config.entityKey.replace(/_/g, "-");
```

**Recommendation:** Create a `useEntityMeta(entityKey)` hook or a `resolveEntityMeta(entityKey)` utility that returns `{ resource, basePath, slug, displayName, displayNamePlural }` as a single SSOT.

### 4.2 Severity color mapping — 3 separate definitions

**Files:**

- `list-page-shell.tsx` (line 159-163, `colorMap` object)
- `operational-dashboard-shell.tsx` (lines 201-205, inline `cn()`)
- `metric-card.tsx` (lines 26-32, `VARIANT_STYLES`)

All map `warning | info | destructive` to `border-{x}/30 bg-{x}/5` patterns.

**Recommendation:** Define once in `design-tokens.ts` or `ui-variants.ts`:

```ts
export const SEVERITY_STYLES = {
  warning: "border-warning/30 bg-warning/5 text-warning",
  info: "border-info/30 bg-info/5 text-info",
  destructive: "border-destructive/30 bg-destructive/5 text-destructive",
} as const;
```

### 4.3 Icon container pattern — repeated inline

The `h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center` pattern appears in `stat-card.tsx`, `quick-view-panel.tsx`, `page-header.tsx`, and `metric-card.tsx`.

**Recommendation:** Define as a design token class in `globals.css`:

```css
.icon-container {
  @apply h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center;
}
```

Or better: a tiny `IconContainer` component.

### 4.4 Stats grid layout — 3 near-identical grid patterns

**Files:**

- `list-page-shell.tsx`: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`
- `detail-page-shell.tsx`: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 density-gap-card`
- `operational-dashboard-shell.tsx`: Conditional logic with `statValues.length` to pick column count

**Recommendation:** Create a `StatsGrid` component that auto-sizes based on child count and density tokens. This normalizes the responsive breakpoint logic.

---

## 5. Layout/Styling Normalization (Medium)

### 5.1 Inconsistent gap tokens

- `list-page-shell.tsx` uses inline `style={{ gap: "var(--density-page-gap)" }}`
- `detail-page-shell.tsx` uses `density-gap-page` class
- `operational-dashboard-shell.tsx` uses `density-gap-page` class
- `form-page-shell.tsx` uses `density-gap-page` class in sections but `className="space-y-6"` elsewhere

**Recommendation:** Standardize on `density-gap-page` CSS class everywhere. Remove inline `style` gap overrides in list-page-shell.

### 5.2 Inconsistent animation entry

Most shells use `motion-safe:animate-fade-in` on the root div. However:

- `form-page-shell.tsx` applies it 3 times (once per layout variant + loading state)
- `detail-page-shell.tsx` delegates to `DetailLayout` which applies it

**Recommendation:** Make `motion-safe:animate-fade-in` a standard trait of all shell root containers. Consider a `ShellContainer` primitive that all shells wrap content in, enforcing consistent animation, density gap, and aria semantics.

### 5.3 Back link pattern — 3 identical implementations

**Files:**

- `detail-layout.tsx` (lines 125-131)
- `form-page-shell.tsx` (lines 628-635, 701-708)
- `form-layout.tsx` (lines 65-72)

All render:

```tsx
<Link
  href={backHref}
  className="group inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
>
  <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
  {backLabel}
</Link>
```

**Recommendation:** Extract to `src/components/ui/back-link.tsx`. ~40 lines removed across 3 files.

### 5.4 `select` element with unstyled native browser appearance

**Files:**

- `operational-dashboard-shell.tsx` (lines 364-376)
- `settings-page-shell.tsx` (lines 73-85)

Both render raw `<select>` with manually applied classes. The form system has `src/components/ui/form/select.tsx` but it's not used here.

**Recommendation:** Use the `Select` component from the form system (or create a lightweight `NativeSelect` primitive) to ensure consistent styling and accessibility.

---

## 6. Form System Gaps (Medium)

### 6.1 `FormPageShell` checkbox renders raw `<input type="checkbox">`

**File:** `src/components/shells/form-page-shell.tsx` (lines 157-171)

Uses a plain HTML `<input type="checkbox">` instead of the design system's `Checkbox` component from `src/components/ui/checkbox.tsx`.

**Recommendation:** Use the existing `Checkbox` primitive for visual consistency and accessibility compliance (focus ring, reduced-motion, etc.).

### 6.2 `FormPageShell` color input renders raw `<input type="color">`

**File:** `src/components/shells/form-page-shell.tsx` (lines 183-200)

Uses raw HTML color picker. No design system primitive exists for this.

**Recommendation:** Create a `ColorPicker` primitive in the form system that wraps the native input with token-compliant styling and a text input for hex value entry (which it already partially does inline).

### 6.3 Missing `file` field type implementation

**File:** `src/components/shells/form-page-shell.tsx`

The `FieldType` in `field-renderers.tsx` includes `"file"` but `FormPageShell`'s `renderField` switch has no `case "file"` — it falls through to the default `<Input>` text field.

**Recommendation:** Implement a `FileUpload` field type or at minimum render `<Input type="file">`.

---

## 7. Dead Code / Legacy Surface (Low)

### 7.1 `PageShell` — legacy thin wrapper with 0 runtime consumers

**File:** `src/components/layouts/page-shell.tsx`

Marked with `@internal` comment stating "retained for 21 justified-bespoke pages" but `grep` finds 0 imports from `src/app/`. The deprecated `TabConfig` type alias and `BreadcrumbItem` interface are also unused.

**Recommendation:** Verify via build-time dead code analysis. If truly unused, remove. If used by bespoke pages not caught by grep, add an import count comment for future auditors.

### 7.2 `FormLayout` wrapper — likely orphaned

**File:** `src/components/layouts/form-layout.tsx`

Only 1 import found: `FormPageShell` imports `FormSection` from this file, not `FormLayout` itself. The wrapper component's `FormLayoutProps` and rendering logic are fully superseded by `FormPageShell`.

**Recommendation:** Extract `FormSection` to its own file. Mark `FormLayout` wrapper as `@deprecated` with a removal timeline.

### 7.3 `DetailTabConfig` deprecated type alias

**File:** `src/components/layouts/detail-layout.tsx` (line 17)

```ts
/** @deprecated Use TabBarItem from '@/components/ui/tab-bar' directly */
export type DetailTabConfig = TabBarItem;
```

**Recommendation:** Search for consumers and remove if zero.

---

## 8. Accessibility / UX Refinements (Low)

### 8.1 `SplitLayout` uses inline SVG instead of Lucide icon

**File:** `src/components/layouts/split-layout.tsx` (lines 53-55)

Renders a hand-drawn `<svg>` back arrow instead of using `ChevronLeft` from Lucide like every other back-navigation pattern in the codebase.

**Recommendation:** Replace with `<ChevronLeft className="h-4 w-4" />` for visual consistency.

### 8.2 `DetailLayout` custom dropdown menu — should use DropdownMenu primitive

**File:** `src/components/layouts/detail-layout.tsx` (lines 161-202)

Hand-builds a dropdown menu with custom keyboard handling (ArrowUp/Down, Escape, Home/End), click-outside detection, and focus management. The codebase has a full `DropdownMenu` component in `src/components/ui/dropdown-menu.tsx` (7.6KB) that already handles all of this.

**Recommendation:** Replace the custom implementation with `DropdownMenu` + `DropdownMenuItem`. Removes ~50 lines of custom keyboard/focus code and ensures consistent behavior with all other dropdown menus in the app.

---

## Prioritized Remediation Roadmap

### Phase 1 — Quick Wins (1-2 hours, high impact)

1. **Extract `getNestedValue`, `matchesSearch`, `computeStatValue`, `toDataTableColumn`** to shared modules → eliminates 5x duplication
2. **Extract `EntityRecord` type** to `src/types/entity.ts`
3. **Extract `BackLink` component** → eliminates 3x duplication
4. **Replace `window.location.reload()`** with query invalidation → major UX improvement

### Phase 2 — Component Consolidation (2-4 hours)

5. **Merge `StatCard`/`MetricCard`** into unified component
6. **Extract `AlertBanner`** to shared primitive
7. **Extract `SEVERITY_STYLES`** to design tokens
8. **Create `useEntityMeta` hook** for entity metadata resolution
9. **Replace `DetailLayout` custom menu** with `DropdownMenu` primitive

### Phase 3 — Normalization (2-3 hours)

10. **Standardize gap tokens** — replace inline styles with `density-gap-*` classes
11. **Replace raw `<select>`** with design system `Select` or `NativeSelect`
12. **Replace raw `<input type="checkbox">`** with `Checkbox` primitive
13. **Create `StatsGrid` component** for responsive stat card layouts
14. **Create `IconContainer` primitive** for icon badge pattern

### Phase 4 — Cleanup (1 hour)

15. **Remove/deprecate `PageShell`** if confirmed zero consumers
16. **Extract `FormSection`** from `form-layout.tsx`, deprecate `FormLayout` wrapper
17. **Remove deprecated type aliases** (`DetailTabConfig`, `TabConfig`)
18. **Replace `SplitLayout` inline SVG** with Lucide icon

---

## Metrics

| Metric                                    | Current                                                 | After Remediation                                                 |
| ----------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------- |
| Duplicated utility functions              | 12 copies across 5 files                                | 0 (4 canonical sources)                                           |
| Overlapping components                    | 2 pairs (StatCard/MetricCard, FormLayout/FormPageShell) | 0                                                                 |
| `window.location.reload()` calls          | 4                                                       | 0                                                                 |
| Raw HTML elements bypassing design system | 3 (select, checkbox, svg)                               | 0                                                                 |
| Severity color mapping definitions        | 3                                                       | 1                                                                 |
| Entity metadata resolution patterns       | 5                                                       | 1 (shared hook)                                                   |
| Estimated lines removed                   | —                                                       | ~300-400                                                          |
| Estimated bundle impact                   | —                                                       | Marginal (consolidation) + significant (reload → invalidation UX) |

---

## Compliance Assessment

| Principle                   | Status                    | Notes                                                                                          |
| --------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------- |
| **3NF**                     | ✅ Compliant              | Tokens are atomic; no persisted derived data in the UI layer                                   |
| **SSOT**                    | ⚠️ 4 violations           | Utility function duplication, entity meta resolution, severity mapping, icon container pattern |
| **White-label**             | ✅ Compliant              | All styling via tokens; no hardcoded brand values in component layer                           |
| **Accessibility**           | ✅ Compliant (minor gaps) | WCAG 2.2 AA met; 2 refinement opportunities noted                                              |
| **Design System Canonical** | ⚠️ 3 bypasses             | Raw select, checkbox, SVG bypass the component library                                         |
| **Performance**             | ⚠️ 4 anti-patterns        | `window.location.reload`, `window.location.href`, eager prefetch, potential dead import        |
