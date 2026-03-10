# UI Audit — Batch 4: Shared Interactive Components

**Audit Date:** 2025-01-XX
**Auditor:** Cascade AI
**Files Audited:** 13
**Interactive Elements Found:** 62
**Findings:** 18

---

## Scope

All shared interactive components used across multiple dashboard pages: command bar, cookie consent, entity creation dialogs, CSV import/export, data views (table/board/cards), field renderers, entity links, and permission guards.

| # | File | Lines | Category |
|---|------|-------|----------|
| 1 | `src/components/command-bar.tsx` | 418 | Global navigation |
| 2 | `src/components/cookie-consent.tsx` | 172 | Compliance / consent |
| 3 | `src/components/create-entity-dialog.tsx` | 245 | Entity creation (base) |
| 4 | `src/components/entity-create-dialog.tsx` | 248 | Entity creation (wired) |
| 5 | `src/components/csv/csv-export-button.tsx` | 109 | Data export |
| 6 | `src/components/csv/csv-import-dialog.tsx` | 801 | Data import (wizard) |
| 7 | `src/components/data-view/data-table.tsx` | 545 | Table view |
| 8 | `src/components/data-view/data-board.tsx` | 265 | Kanban board view |
| 9 | `src/components/data-view/data-cards.tsx` | 240 | Card grid view |
| 10 | `src/components/data-view/field-renderers.tsx` | 653 | Field type rendering |
| 11 | `src/components/data-view/index.ts` | 36 | Barrel export |
| 12 | `src/components/linked-records/entity-link.tsx` | 70 | Cross-entity navigation |
| 13 | `src/components/permission-guard.tsx` | 116 | RBAC gate components |

---

## 1. Interactive Elements Inventory

### command-bar.tsx (418 lines)

| Element | Type | Handler / Wiring | A11y |
|---------|------|-----------------|------|
| Backdrop overlay | `<motion.div>` | `onClick → setOpen(false)` | `aria-hidden="true"` |
| Command panel | `<motion.div>` | — | `role="dialog"`, `aria-label="Command bar"`, `aria-modal="true"` |
| Search input | `<input>` | `onChange → setQuery`, `onKeyDown → ArrowUp/Down/Enter` | `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-label` |
| Close button | `<button>` | `onClick → setOpen(false)` | `aria-label="Close command bar"` |
| Results listbox | `<div>` | — | `role="listbox"`, `aria-label="Search results"` |
| Result items | `<button>` (each) | `onClick → handleSelect`, `onMouseEnter → setSelectedIndex` | `role="option"`, `aria-selected` |
| Global shortcut | `useEffect` | `Cmd+K → toggle`, `Escape → close` | — |
| Focus trap | `useEffect` | Tab key intercepted, wraps first↔last | ✅ Implemented |

**Notes:** ✅ Excellent a11y pattern — full combobox ARIA, focus trap, keyboard navigation (ArrowUp/Down, Enter, Escape). Recent navigation tracked in `localStorage`. Message search appended when messaging enabled.

### cookie-consent.tsx (172 lines)

| Element | Type | Handler / Wiring | A11y |
|---------|------|-----------------|------|
| Banner container | `<div>` | — | `role="dialog"`, `aria-label="Cookie consent"`, `aria-live="polite"` |
| Essential checkbox | `<input type="checkbox">` | disabled, always checked | `aria-label="Essential cookies (always active)"` |
| Functional checkbox | `<input type="checkbox">` | `onChange → setFunctional` | `aria-label="Functional cookies"` |
| Analytics checkbox | `<input type="checkbox">` | `onChange → setAnalytics` | `aria-label="Analytics cookies"` |
| Accept All button | `<button>` | `onClick → saveConsent("all")` | — |
| Essential Only / Save Preferences | `<button>` | `onClick → saveConsent(...)` | — |
| Customize link | `<button>` | `onClick → setShowDetails(true)` | — |
| Privacy Policy link | `<a>` | `href="/privacy"` | — |

**Notes:** GDPR/CCPA-compliant. Dispatches `CustomEvent("cookie-consent-updated")` for analytics providers. Consent persisted to `localStorage`. Three categories: essential (always on), functional, analytics.

### create-entity-dialog.tsx (245 lines)

| Element | Type | Handler / Wiring | A11y |
|---------|------|-----------------|------|
| Dialog | `@radix-ui/react-dialog` | `open`, `onOpenChange → onClose` | ✅ Radix Dialog (focus trap, Escape, modal) |
| Form | `<form>` | `onSubmit → handleSubmit` | — |
| Dynamic fields | `<Input>`, `<Select>`, `<Textarea>`, `<CurrencyInput>` | `onChange → setValue(field.key, ...)` | `id` linked to `FormField` label via `htmlFor` |
| Cancel button | `<Button>` | `onClick → onClose` | `type="button"` |
| Submit button | `<Button>` | `type="submit"` | `disabled` when submitting |
| `useCreateAction` hook | — | URL query sync `?action=create` | — |

**Notes:** Config-driven form generation from `CreateEntityConfig`. Supports text, email, url, number, date, datetime-local, select, textarea, currency. Client-side validation for required fields. Form resets on dialog open.

### entity-create-dialog.tsx (248 lines)

| Element | Type | Handler / Wiring | A11y |
|---------|------|-----------------|------|
| Wraps `CreateEntityDialog` | component | `onSubmit → handleSubmit` | Inherits all Radix Dialog a11y |

**Notes:** Higher-level wrapper. Resolves form config + Zod schema + API path by entity name. 37 entity configs mapped in `FORM_CONFIGS`. POST with `X-Idempotency-Key` header. Invalidates React Query cache on success. Toast notifications for success/error.

### csv-export-button.tsx (109 lines)

| Element | Type | Handler / Wiring | A11y |
|---------|------|-----------------|------|
| Export button | `<Button>` | `onClick → handleExport` | `aria-label="Export {entity} as CSV"`, `disabled` when exporting |

**Notes:** ✅ Proper loading state with `Loader2` spinner. Downloads via blob URL + programmatic `<a>` click. Toast feedback on success/error. POST to `/api/csv/export` with entity + filters + limit.

### csv-import-dialog.tsx (801 lines)

| Element | Type | Handler / Wiring | A11y |
|---------|------|-----------------|------|
| Dialog | `@radix-ui/react-dialog` | `open`, `onOpenChange → handleClose` | ✅ Radix Dialog |
| Step indicator | `<span>` (×4) | — | Visual only |
| Drop zone | `<div>` | `onClick/onKeyDown → fileInput.click()` | `role="button"`, `tabIndex=0`, `aria-label` |
| File input | `<input type="file">` | `onChange → handleFileSelect` | `accept=".csv,text/csv"`, `aria-label` |
| Parse error | `<div>` | — | `role="alert"` |
| Template download | `<Button>` | `onClick → handleDownloadTemplate` | — |
| Column mapping selects | `<select>` (per header) | `onChange → handleMappingChange` | `aria-label="Map CSV column ... to a database field"` |
| Unmapped required warning | `<div>` | — | `role="alert"` |
| Validation summary | `<div>` | — | `role="status"`, `aria-live="polite"` |
| Error table | `<table>` | — | Semantic HTML |
| Download error report | `<Button>` | `onClick → handleDownloadErrors` | — |
| Import button | `<Button>` | `onClick → handleImport` | `disabled` when no valid records |
| Import result | `<div>` | — | `role="status"`, `aria-live="polite"` |
| Back/Close/Import More buttons | `<Button>` (various) | navigation between steps | — |

**Notes:** 4-step wizard: Upload → Map Fields → Validate → Result. Uses `papaparse` for CSV parsing. Auto-maps headers via `autoMapHeaders`. Client-side validation via `validateImportRecords`. Error report CSV download. Max 10MB file, preview first 5 rows. `MappingRow` sub-component with native `<select>` for field mapping.

### data-table.tsx (545 lines)

| Element | Type | Handler / Wiring | A11y |
|---------|------|-----------------|------|
| Search input | `<Input>` | `onChange → setSearch` | `placeholder` |
| Clear search button | `<button>` | `onClick → setSearch("")` | `aria-label="Clear search"` |
| Selection clear button | `<button>` | `onClick → setSelected(new Set())` | — |
| Table | `<table>` | — | `role="table"`, `aria-label` (from `caption` prop) |
| Caption | `<caption>` | — | `sr-only` |
| Header cells | `<th>` | `onClick → handleSort` | `aria-sort` ("ascending"/"descending") |
| Select-all checkbox | `<input type="checkbox">` | `onChange → handleSelectAll` | — |
| Row checkboxes | `<input type="checkbox">` | `onChange → handleSelectRow` | — |
| Clickable rows | `<tr>` | `onClick/onKeyDown → onRowClick` | `tabIndex=0`, `role="button"`, `focus-visible` ring |
| Page size select | `<select>` | `onChange → setPageSize` | — |
| Pagination buttons (×4) | `<Button>` | first/prev/next/last page | `aria-label` on prev/next, `sr-only` on first/last |
| Row action cells | `<td>` | `onClick → stopPropagation` | — |

**Notes:** Feature-rich data table: sorting (3-state cycle: asc → desc → none), global search, pagination with configurable page sizes, row selection, clickable rows, sticky headers, striped/compact modes. Uses `FieldRenderer` for typed cells.

### data-board.tsx (265 lines)

| Element | Type | Handler / Wiring | A11y |
|---------|------|-----------------|------|
| Board container | `<div>` | — | `role="region"`, `aria-label="Kanban board"` |
| Column containers | `<div>` (per column) | — | `role="group"`, `aria-label="{title} column, {count} items"` |
| Card items | `<div>` (per item) | `onClick/onKeyDown → onCardClick` | `role="button"` (when clickable), `tabIndex=0`, `aria-label`, `focus-visible` ring |

**Notes:** Horizontal scrolling kanban. `snap-x snap-mandatory` for scroll snapping. `onDragEnd` prop defined but drag-and-drop NOT implemented (no DnD library wired). Cards structured with header/body/footer field positions. Uses `FieldRenderer` for typed card fields.

### data-cards.tsx (240 lines)

| Element | Type | Handler / Wiring | A11y |
|---------|------|-----------------|------|
| Card grid | `<div>` | — | `role="list"`, `aria-label="Data cards"` |
| Card items | `<Card>` (per item) | `onClick/onKeyDown → onCardClick` | `role="listitem"`, `tabIndex=0`, `aria-label`, `focus-visible` ring |
| Card images | `<Image>` | — | `alt` from title |
| Action containers | `<div>` | `onClick → stopPropagation` | — |

**Notes:** Responsive grid: 1→2→3→4 columns with breakpoints. Supports image headers, badge overlays, progress bars, and action slots. Uses `FieldRenderer` for typed fields.

### field-renderers.tsx (653 lines)

| Element | Type | Handler / Wiring | A11y |
|---------|------|-----------------|------|
| StatusField | `<Badge>` | — | — |
| PriorityField | icon + text | — | Color-coded (destructive/warning/info/success) |
| ProgressField | `<div>` bar | — | No `role="progressbar"` ⚠️ |
| CurrencyField | `<span>` | — | `tabular-nums` |
| PercentageField | `<span>` | — | — |
| DateField | `<span>` with `<Calendar>` icon | — | — |
| UserField | `<Avatar>` + name | — | — |
| UsersField | stacked avatars | — | — |
| BooleanField | `<CheckCircle2>` / `<Circle>` | — | — |
| RatingField | `<Star>` icons | — | — |
| TagsField | `<Badge>` × N | — | — |
| EmailField | `<a href="mailto:">` | — | — |
| PhoneField | `<a href="tel:">` | — | — |
| URLField | `<a>` | — | `target="_blank"`, `rel="noopener noreferrer"` |
| LocationField | `<MapPin>` + text | — | — |

**Notes:** 20 field types with consistent rendering. `FieldRenderer` dispatches by `FieldConfig.type`. `StatusField` warns in dev when `labelMap` entry is missing. `CurrencyField` uses `Intl.NumberFormat` with compact notation option. `URLField` wraps in `new URL()` — ⚠️ will throw on invalid URLs.

### entity-link.tsx (70 lines)

| Element | Type | Handler / Wiring | A11y |
|---------|------|-----------------|------|
| Entity link | `<Link>` | navigation | — |

**Notes:** Resolves entity type → icon + path via `ENTITY_RELATIONSHIP_MAP`. Size variants: sm/md/lg. Optional status badge. Falls back to plain `<span>` for unknown entity types.

### permission-guard.tsx (116 lines)

| Element | Type | Handler / Wiring | A11y |
|---------|------|-----------------|------|
| Access denied card | `<Card>` | — | `<ShieldX>` icon |
| Go Back button | `<Button>` | `onClick → window.history.back()` | — |
| Field guard mask | `<span>` | — | `title="Restricted"`, `<Lock>` icon |

**Notes:** Exports 5 utilities: `usePermissionLevel`, `useHasPermission`, `useFieldVisible`, `useMaskFields`, `PermissionGate`, `FieldGuard`. `PermissionGate` wraps page content with 3 fallback modes: custom fallback, silent (render nothing), or access-denied card. Uses 6-tier RBAC (exec/director/pm/member/client/collaborator). Default role: `"collaborator"`.

---

## 2. State Management

| Component | State Mechanism | Key State Variables |
|-----------|----------------|---------------------|
| **command-bar.tsx** | `useState` | `open`, `query`, `selectedIndex`, `recentPaths` (localStorage) |
| **cookie-consent.tsx** | `useState` | `visible`, `showDetails`, `analytics`, `functional` (localStorage) |
| **create-entity-dialog.tsx** | `useState` | `values` (Record), `errors` (Record), `submitting` |
| **entity-create-dialog.tsx** | Props + hooks | `useQueryClient`, `useToast` — delegates form state to base dialog |
| **csv-export-button.tsx** | `useState` | `exporting` |
| **csv-import-dialog.tsx** | `useState` | `step`, `file`, `csvHeaders`, `csvRows`, `headerMapping` (Map), `validation`, `importResult`, `parseError` |
| **data-table.tsx** | `useState` | `sort`, `search`, `page`, `pageSize`, `internalSelectedKeys` (Set) |
| **data-board.tsx** | Props + `useMemo` | Grouped data derived from `columns[].filter` |
| **data-cards.tsx** | Props only | No internal state |
| **field-renderers.tsx** | Props only | Stateless renderers |
| **entity-link.tsx** | Props only | Stateless |
| **permission-guard.tsx** | `useAuth` context | `profile.role` → `PermissionLevel` |

---

## 3. Component Integration Map

| Component | Used By |
|-----------|---------|
| **CommandBar** | Dashboard layout (topbar trigger), global `Cmd+K` |
| **CookieConsent** | Root layout / Providers |
| **CreateEntityDialog** | ~27 dashboard list pages via `useCreateAction` |
| **EntityCreateDialog** | Higher-level alternative, used via entity name lookup |
| **CsvExportButton** | crew, assets, activations, approvals, budgets, campaigns, companies |
| **CsvImportDialog** | crew, assets, companies |
| **DataTable** | credentials, certifications, change-orders, budget-approvals, assets, crew |
| **DataBoard** | creative-assets, crew, campaigns |
| **DataCards** | Used indirectly — pages build their own cards but share `CardFieldDef` pattern |
| **FieldRenderer** | DataTable cells, DataBoard cards, DataCards fields |
| **EntityLink** | activations, budgets, tasks, projects, invoices, and ~30 detail pages |
| **PermissionGate** | Every dashboard list page wraps content in `PermissionGate` |
| **FieldGuard** | Detail pages for sensitive fields (financial, PII) |

---

## 4. Findings

### Critical

| # | Component | Finding | Impact |
|---|-----------|---------|--------|
| C1 | `cookie-consent.tsx` | **No focus trap on consent banner** — Banner is `role="dialog"` but Tab can escape to page content behind it. Since it overlays the page at the bottom, users can interact with both simultaneously. | GDPR UX concern — users may navigate past consent without making a choice | ✅ **REMEDIATED** — Added `useFocusTrap`, `useFocusReturn`, and `useEscapeKey` hooks to cookie consent banner. Focus is now trapped within the dialog when visible. |

### High

| # | Component | Finding | Impact |
|---|-----------|---------|--------|
| H1 | `field-renderers.tsx` — `ProgressField` | **Missing `role="progressbar"` and ARIA value attributes** — The `ProgressField` component renders a visual progress bar but lacks `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`. The base `progress-bar.tsx` (Batch 3) has these; this is a separate implementation without them. | Screen readers cannot announce progress values |
| H2 | `data-table.tsx` | **Select-all checkbox has no `aria-label`** — The header checkbox for "select all" has no accessible name. Row checkboxes similarly have no `aria-label`. | Screen readers announce generic "checkbox" without context |
| H3 | `csv-import-dialog.tsx` | **Step indicator not accessible** — The 4-step wizard indicator is purely visual (`<span>` elements with color changes). No `aria-current="step"`, no `role="progressbar"`, no screen reader announcement of current step. | Screen reader users cannot determine wizard progress |
| H4 | `data-board.tsx` | **`onDragEnd` prop declared but drag-and-drop not implemented** — The `DataBoardProps` interface includes `onDragEnd` callback but no DnD library is wired. Cards are not draggable. | Misleading API — consumers may expect DnD to work |

### Medium

| # | Component | Finding | Impact |
|---|-----------|---------|--------|
| M1 | `field-renderers.tsx` — `URLField` | **`new URL(value)` throws on invalid URLs** — If the value is not a valid URL (e.g. missing protocol), `new URL(value).hostname` will throw an unhandled error, crashing the field renderer and potentially the entire row/card. | Runtime crash on malformed URL data |
| M2 | `field-renderers.tsx` — `CurrencyField` | **Hardcoded `en-US` locale in compact formatter** — `Intl.NumberFormat("en-US", ...)` ignores user locale. Non-compact path delegates to `formatCurrency` which may have the same issue. | i18n violation — see also Batch 3 M6 |
| M3 | `field-renderers.tsx` — `TagsField` | **Dynamic Tailwind classes via string interpolation** — `` `bg-${tag.color}-100 text-${tag.color}-700` `` generates class names at runtime. Tailwind's JIT compiler cannot detect these; they will be purged from the CSS bundle. | Tags with custom colors will render without color styling in production |
| M4 | `data-table.tsx` | **Page size `<select>` has no `aria-label`** — The pagination "Rows per page" select relies on adjacent text for context but is not programmatically linked. | Screen readers announce generic "select" |
| M5 | `create-entity-dialog.tsx` | **`FormField` error not linked via `aria-describedby`** — Inherits the same issue from Batch 3 H3: error messages render visually but are not programmatically associated with the input. | Screen reader users may not hear validation errors |
| M6 | `entity-create-dialog.tsx` | **All 37 entity form configs eagerly imported** — All `CREATE_*_CONFIG` objects are imported at module level. This pulls the entire `create-entity-configs.ts` bundle even if only one entity dialog is rendered. | Bundle size impact — defeats tree-shaking |
| M7 | `cookie-consent.tsx` | **Consent buttons lack focus ring styling** — Buttons use custom `className` strings without `focus-visible:ring-*` styles, unlike buttons using the `Button` component. | Keyboard users may not see focus indicator |
| M8 | `data-board.tsx` | **Horizontal scroll not keyboard-accessible** — Board uses `overflow-x-auto` but no keyboard mechanism to scroll between columns. Users must use mouse/trackpad. | Keyboard-only users cannot reach off-screen columns |

### Low

| # | Component | Finding | Impact |
|---|-----------|---------|--------|
| L1 | `command-bar.tsx` | **`localStorage` key `pb-recent-nav` uses legacy prefix** — `pb-` suggests "Phoenix Base" or similar. Rest of codebase doesn't consistently use this prefix. | Naming inconsistency |
| L2 | `field-renderers.tsx` — `StatusField` | **Dev-only `logger.warn` for missing `labelMap` entry** — Useful but could flood console in development when rendering lists with many statuses. | Console noise in dev |
| L3 | `permission-guard.tsx` | **`window.history.back()` in Go Back button** — If the user arrived directly at a restricted page (e.g. bookmarked URL), `history.back()` navigates away from the app entirely. | Edge case — could navigate to external site |
| L4 | `data-cards.tsx` | **`Image` component uses `fill` without parent `relative` positioning** — The image header `<div>` has `aspect-video` but no `relative` class. `next/image` with `fill` requires a positioned parent. | Image may not render correctly |

---

## 5. Pattern Consistency Analysis

### Positive Patterns

- **Radix Dialog** used consistently for all modal dialogs (command bar, entity create, CSV import) — gets focus trap, Escape, `aria-modal` for free
- **FieldRenderer system** provides SSOT for field type rendering across table/board/cards views
- **Permission architecture** is layered: `usePermissionLevel` → `useHasPermission` → `PermissionGate` / `FieldGuard`
- **Toast feedback** used consistently for async operations (export, import, entity creation)
- **Keyboard navigation** in command bar is exemplary: ArrowUp/Down, Enter, Escape, Tab trap, `aria-activedescendant`
- **Idempotency keys** on entity creation POST requests

### Inconsistency Concerns

- **Two entity creation dialogs** — `CreateEntityDialog` (base) and `EntityCreateDialog` (wired). Consumers must know which to use. Some pages use the base with inline `onSubmit`, others use the wired version.
- **Two progress bar implementations** — `progress-bar.tsx` (Batch 3, full ARIA) vs `ProgressField` in field-renderers (no ARIA)
- **Cookie consent uses raw `<button>`** instead of the `Button` component — different focus styling
- **`CurrencyField` vs `currency-input.tsx`** — both handle currency formatting but with different locale behavior

---

## 6. Summary

| Metric | Count |
|--------|-------|
| **Files audited** | 13 |
| **Interactive elements** | 62 |
| **Critical findings** | 1 |
| **High findings** | 4 |
| **Medium findings** | 8 |
| **Low findings** | 4 |
| **Total findings** | 17 |

### Key Recommendations

1. **Add focus trap to `CookieConsent`** — use Radix Dialog or manual trap; ensure users must make a consent choice before interacting with page
2. **Add ARIA progressbar attributes to `ProgressField`** in field-renderers, or delegate to the existing `progress-bar.tsx` component
3. **Add `aria-label` to DataTable checkboxes** — "Select all rows" for header, "Select row {name}" for each row
4. **Add `aria-current="step"` to CSV import wizard** step indicator
5. **Remove `onDragEnd` prop from `DataBoard`** or implement DnD (e.g. `@dnd-kit/core`)
6. **Wrap `new URL()` in try/catch** in `URLField` to prevent crashes on malformed URLs
7. **Use safelist or explicit classes** for `TagsField` color interpolation to prevent Tailwind purging
8. **Lazy-load entity form configs** in `EntityCreateDialog` via dynamic import or a registry function
9. **Consolidate `ProgressField` and `progress-bar.tsx`** into one SSOT component
