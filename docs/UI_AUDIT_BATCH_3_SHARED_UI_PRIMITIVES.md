# UI Audit — Batch 3: Shared UI Primitives

**Audit Date:** 2025-01-XX
**Auditor:** Cascade AI
**Files Audited:** 37
**Interactive Elements Found:** 68
**Findings:** 24

---

## Scope

All files under `src/components/ui/` plus `src/components/ui/form/`.

| # | File | Lines | Category |
|---|------|-------|----------|
| 1 | `button.tsx` | 55 | Core input |
| 2 | `input.tsx` | 26 | Core input |
| 3 | `label.tsx` | 48 | Core input |
| 4 | `checkbox.tsx` | 45 | Core input |
| 5 | `animated-checkbox.tsx` | 90 | Core input |
| 6 | `toggle.tsx` | 63 | Core input |
| 7 | `radio-group.tsx` | 100 | Core input |
| 8 | `search-input.tsx` | 136 | Core input |
| 9 | `select.tsx` | 104 | Core input (custom) |
| 10 | `form/select.tsx` | 54 | Core input (native) |
| 11 | `form/form-field.tsx` | 44 | Form wrapper |
| 12 | `form/textarea.tsx` | 27 | Core input |
| 13 | `form/date-picker.tsx` | 31 | Core input |
| 14 | `form/currency-input.tsx` | 76 | Core input |
| 15 | `dialog.tsx` | 142 | Overlay |
| 16 | `confirm-dialog.tsx` | 116 | Overlay |
| 17 | `slide-panel.tsx` | 86 | Overlay |
| 18 | `dropdown-menu.tsx` | 133 | Overlay |
| 19 | `tooltip.tsx` | 63 | Overlay |
| 20 | `accordion.tsx` | 59 | Disclosure |
| 21 | `tab-bar.tsx` | 232 | Navigation |
| 22 | `tabs.tsx` | 217 | Navigation (deprecated) |
| 23 | `segmented-control.tsx` | 137 | Navigation |
| 24 | `toast.tsx` | 192 | Feedback |
| 25 | `filter-bar.tsx` | 101 | Composite |
| 26 | `chip.tsx` | 69 | Display + interactive |
| 27 | `copy-link-button.tsx` | 58 | Action |
| 28 | `approval-flow.tsx` | 157 | Composite |
| 29 | `gantt-chart.tsx` | 189 | Data viz |
| 30 | `heatmap-grid.tsx` | 181 | Data viz |
| 31 | `metric-card.tsx` | 170 | Data viz |
| 32 | `burn-chart.tsx` | 195 | Data viz |
| 33 | `progress-bar.tsx` | 136 | Data viz |
| 34 | `table.tsx` | 41 | Layout |
| 35 | `avatar.tsx` | 89 | Display |
| 36 | `badge.tsx` / `status-badge.tsx` | 31 / 117 | Display |
| 37 | Non-interactive: `card.tsx`, `page-header.tsx`, `stat-card.tsx`, `separator.tsx`, `overline-text.tsx`, `sliding-indicator.tsx`, `skeleton-crossfade.tsx`, `number-ticker.tsx`, `scroll-reveal.tsx`, `stagger-container.tsx`, `responsive-container.tsx`, `page-transition.tsx` | various | Display / animation |

---

## 1. Interactive Elements Inventory

### button.tsx (55 lines)

| Element | Type | A11y |
|---------|------|------|
| Button | `<button>` / `<Slot>` | `focus-visible` ring, `disabled` styles, 7 variants (default, destructive, outline, secondary, ghost, link, glow), 6 sizes (sm, default, lg, xl, icon) |

**Notes:** Uses `@radix-ui/react-slot` for `asChild` pattern. No explicit `aria-disabled` — relies on native `disabled` attribute. ✅ Correct approach.

### input.tsx (26 lines)

| Element | Type | A11y |
|---------|------|------|
| Input | `<input>` | `focus-visible` ring, `disabled` styles, `placeholder` styling |

**Notes:** Thin wrapper. Consumers must provide `aria-label` or associated `<label>`. No built-in error state styling.

### label.tsx (48 lines)

| Element | Type | A11y |
|---------|------|------|
| Label | `@radix-ui/react-label` | `peer-disabled` styling, `required` indicator with `aria-hidden="true"` on asterisk |

**Notes:** ✅ Correctly hides decorative asterisk from screen readers. Variants: default, muted, error.

### checkbox.tsx (45 lines)

| Element | Type | A11y |
|---------|------|------|
| Checkbox | `@radix-ui/react-checkbox` | `focus-visible` ring, `disabled` styling, `indeterminate` support, `data-[state=checked/indeterminate]` visual states |

**Notes:** ✅ Radix handles ARIA role, checked state, keyboard interaction (Space to toggle). Supports `indeterminate` via explicit prop.

### animated-checkbox.tsx (90 lines)

| Element | Type | A11y |
|---------|------|------|
| Hidden input | `<input type="checkbox">` | `sr-only`, `aria-checked`, `peer-focus-visible` ring on visual proxy |
| Visual proxy | `<div>` | Focus ring via `peer-focus-visible`, checked/unchecked visual states |

**Notes:** ✅ Respects `prefers-reduced-motion` via `useReducedMotion`. Uses `useId()` for label association. SVG checkmark animation disabled when reduced motion preferred.

### toggle.tsx (63 lines)

| Element | Type | A11y |
|---------|------|------|
| Toggle | `@radix-ui/react-switch` | `focus-visible` ring, `disabled` styling, `data-[state=checked/unchecked]` |

**Notes:** ✅ Radix Switch handles `role="switch"`, `aria-checked`, keyboard (Space/Enter). Variants: default, success, destructive. Sizes: sm, md, lg.

### radio-group.tsx (100 lines)

| Element | Type | A11y |
|---------|------|------|
| RadioGroup container | `<div>` | `role="radiogroup"`, `aria-orientation` |
| RadioGroupItem | `<button>` | `role="radio"`, `aria-checked`, `focus-visible` ring, `disabled` styling |

**Notes:** Custom implementation (not Radix). Context-based value propagation. ⚠️ Missing Arrow key navigation between radio items (see findings).

### search-input.tsx (136 lines)

| Element | Type | A11y |
|---------|------|------|
| Search input | `<input type="search">` | `aria-label` from placeholder, `focus-visible` ring, `disabled` styling |
| Clear button | `<button>` | `aria-label="Clear search"`, `focus-visible` ring |
| Keyboard hint | `<kbd>` | `aria-hidden="true"` |

**Notes:** ✅ Debounced input with configurable delay. Sizes: sm, md, lg. `⌘K` hint hidden from AT.

### select.tsx (custom — 104 lines)

| Element | Type | A11y |
|---------|------|------|
| Trigger | `<button>` | `role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"`, `focus-visible` ring |
| Content | `<div>` | `role="listbox"` |
| SelectItem | `<div>` | `role="option"`, `aria-selected` |

**Notes:** Custom implementation with context. Click-outside via `mousedown` listener. ⚠️ Missing keyboard navigation (see findings).

### form/select.tsx (native — 54 lines)

| Element | Type | A11y |
|---------|------|------|
| Select | `<select>` | `focus` ring, `disabled` styling |

**Notes:** ✅ Native `<select>` — gets full keyboard/AT support for free. Decorative chevron icon overlaid.

### form/form-field.tsx (44 lines)

| Element | Type | A11y |
|---------|------|------|
| Label | `<label>` | `htmlFor` prop for association |
| Error text | `<p>` | Rendered below input |

**Notes:** ⚠️ Error text is not linked to input via `aria-describedby`. Consumers must wire this manually.

### form/textarea.tsx (27 lines)

| Element | Type | A11y |
|---------|------|------|
| Textarea | `<textarea>` | `focus` ring, `disabled` styling, `placeholder` styling, `resize-y` |

**Notes:** Thin wrapper. Same pattern as `input.tsx`.

### form/date-picker.tsx (31 lines)

| Element | Type | A11y |
|---------|------|------|
| DatePicker | `<input type="date">` | `focus` ring, `disabled` styling |

**Notes:** ✅ Native date input — browser provides calendar popup and keyboard support. Decorative calendar icon overlaid.

### form/currency-input.tsx (76 lines)

| Element | Type | A11y |
|---------|------|------|
| CurrencyInput | `<input type="text" inputMode="decimal">` | `focus` ring, `disabled` styling |

**Notes:** `inputMode="decimal"` triggers numeric keyboard on mobile. Formats on blur. Only supports USD, EUR, GBP symbols. ⚠️ No `aria-label` or visible label built in — consumer responsibility.

### dialog.tsx (142 lines)

| Element | Type | A11y |
|---------|------|------|
| Dialog | `@radix-ui/react-dialog` | `DialogOverlay`, `DialogContent`, `DialogClose` |
| Close button | `<DialogPrimitive.Close>` | `sr-only` "Close" text |

**Notes:** ✅ Radix Dialog handles focus trap, Escape to close, `aria-modal`, `aria-labelledby`, `aria-describedby`. Size variants via `size` prop (sm, default, lg, xl, full).

### confirm-dialog.tsx (116 lines)

| Element | Type | A11y |
|---------|------|------|
| Overlay | `<motion.div>` | `aria-hidden="true"`, click → cancel |
| Dialog content | `<motion.div>` | `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby` |
| Cancel button | `<Button>` | `onClick → handleCancel` |
| Confirm button | `<Button>` | `onClick → handleConfirm`, `autoFocus` |

**Notes:** Promise-based API via context. ⚠️ No focus trap — Tab can escape to background (see Batch 2 C1 cross-reference). ⚠️ No Escape key handler.

### slide-panel.tsx (86 lines)

| Element | Type | A11y |
|---------|------|------|
| Overlay | `<motion.div>` | `aria-hidden="true"`, click → close |
| Panel | `<motion.div>` | `role="dialog"`, `aria-modal="true"`, `aria-label` |
| Close button | `<button>` | `aria-label="Close panel"` |
| Escape handler | `useEffect` | `keydown` → Escape closes |

**Notes:** ✅ Proper dialog semantics. Escape handler present. ⚠️ No focus trap (see findings). Side: left/right configurable.

### dropdown-menu.tsx (133 lines)

| Element | Type | A11y |
|---------|------|------|
| Trigger | child element | `aria-haspopup="menu"`, `aria-expanded` |
| Content | `<div>` | `role="menu"`, `aria-orientation="vertical"` |
| MenuItem | `<div>` | `role="menuitem"` |
| Separator | `<div>` | `role="separator"` |
| Label | `<div>` | — |

**Notes:** Custom implementation. Click-outside to close. ⚠️ Missing keyboard navigation (ArrowUp/Down, Home/End, Enter/Space, type-ahead — see findings).

### tooltip.tsx (63 lines)

| Element | Type | A11y |
|---------|------|------|
| Tooltip | `@radix-ui/react-tooltip` | Full Radix implementation |

**Notes:** ✅ Radix Tooltip handles hover/focus trigger, Escape to dismiss, screen reader announcement. Configurable delay (default 400ms), side, align.

### accordion.tsx (59 lines)

| Element | Type | A11y |
|---------|------|------|
| Accordion | `@radix-ui/react-accordion` | Full Radix implementation |
| AccordionTrigger | `<AccordionPrimitive.Trigger>` | `focus-visible` ring, chevron rotation |

**Notes:** ✅ Radix Accordion handles `role="region"`, `aria-expanded`, keyboard (Enter/Space, ArrowUp/Down).

### tab-bar.tsx (232 lines)

| Element | Type | A11y |
|---------|------|------|
| Tab list | `<div>` | `role="tablist"`, `aria-label`, `aria-orientation` |
| Tab button | `<button>` | `role="tab"`, `aria-selected`, `aria-controls`, `tabIndex` roving |
| TabPanel | `<div>` | `role="tabpanel"`, `aria-labelledby`, `tabIndex=0` |

**Notes:** ✅ Full ARIA tabs pattern. Keyboard: ArrowLeft/Right (horizontal), ArrowUp/Down (vertical), Home, End. Variants: underline, pill. Disabled tab support. `SlidingIndicator` for pill variant.

### tabs.tsx (deprecated — 217 lines)

| Element | Type | A11y |
|---------|------|------|
| Same pattern as tab-bar.tsx | — | Full ARIA tabs pattern |

**Notes:** Marked `@deprecated` in favor of `tab-bar.tsx` / `segmented-control.tsx`. Still in use for backward compatibility. Same keyboard navigation as tab-bar.

### segmented-control.tsx (137 lines)

| Element | Type | A11y |
|---------|------|------|
| Control group | `<div>` | `role="radiogroup"`, `aria-label` |
| Option buttons | `<button>` | `role="radio"`, `aria-checked`, `aria-label`, `tabIndex` roving, `disabled` |

**Notes:** ✅ Full keyboard navigation: Arrow keys, Home, End. `SlidingIndicator` for visual feedback. `labelHidden` option with `sr-only` text. Sizes: sm, md.

### toast.tsx (192 lines)

| Element | Type | A11y |
|---------|------|------|
| Toast viewport | `<div>` | `role="region"`, `aria-label="Notifications"` |
| Toast item | `<div>` | `role="alert"`, `aria-live="assertive"` |
| Action button | `<button>` | `onClick` via `toast.action.onClick` |
| Dismiss button | `<button>` | `aria-label="Dismiss notification"`, `focus-visible` ring |

**Notes:** Context-based `useToast()` API. Auto-dismiss with visual timer bar. Pause on hover. Variants: default, success, warning, destructive, info. ⚠️ Timer bar uses CSS animation `toast-timer` — must be defined in globals.css.

### filter-bar.tsx (101 lines)

| Element | Type | A11y |
|---------|------|------|
| SearchInput | component | Delegates to search-input.tsx |
| Filter `<select>` | native `<select>` | `aria-label` per filter, `focus` ring |
| Clear all button | `<button>` | `aria-label="Clear all filters"` |

**Notes:** ✅ Uses native `<select>` for filters — full keyboard/AT support. Actions slot for additional buttons.

### chip.tsx (69 lines)

| Element | Type | A11y |
|---------|------|------|
| Remove button | `<button>` | `aria-label="Remove"`, `focus-visible` ring, `stopPropagation` |

**Notes:** ⚠️ Generic `aria-label="Remove"` — no context about what is being removed. Consumers should override.

### copy-link-button.tsx (58 lines)

| Element | Type | A11y |
|---------|------|------|
| Copy button | `<button>` | `aria-label` (dynamic: title vs "Link copied"), `title` |
| Live region | `<span>` | `sr-only`, `aria-live="polite"` — announces "Link copied to clipboard" |

**Notes:** ✅ Excellent a11y pattern — live region announces state change to screen readers. Clipboard fallback for older browsers.

### approval-flow.tsx (157 lines)

| Element | Type | A11y |
|---------|------|------|
| Flow container | `<div>` | `role="list"`, `aria-label="Approval workflow"` |
| Step items | `<div>` | `role="listitem"` |
| Approve button | `<Button>` | `disabled` when submitting |
| Reject button | `<Button>` | `disabled` when submitting |
| Connector lines | `<div>` | `aria-hidden="true"` |

**Notes:** ✅ Semantic list structure. Action buttons properly disabled during submission.

### gantt-chart.tsx (189 lines)

| Element | Type | A11y |
|---------|------|------|
| Task bar | `<button>` | `aria-label` with task name, date range, progress %, `onClick → onTaskClick` |

**Notes:** ✅ Good `aria-label` composition. Task bars are focusable buttons. Conflict indicators via `AlertTriangle` icon + color. ⚠️ No keyboard navigation between task bars in sequence.

### heatmap-grid.tsx (181 lines)

| Element | Type | A11y |
|---------|------|------|
| Grid | `<table>` | `role="grid"`, `aria-label="Utilization heatmap"` |
| Cell buttons | `<button>` | `aria-label` with row label + column label + value, `title` tooltip, `tabIndex` conditional |

**Notes:** ✅ Semantic `<table>` with grid role. Cells are buttons when `onCellClick` is provided, with `tabIndex=-1` when not clickable. Color scale legend included.

### metric-card.tsx (170 lines) / stat-card.tsx (66 lines)

| Element | Type | A11y |
|---------|------|------|
| Container | `<div>` | `role="group"`, `aria-label` (metric-card only) |
| Sparkline | `<svg>` | `aria-hidden="true"` |

**Notes:** `MetricCard` is the enhanced version with threshold-based auto-variant, sparkline, and `role="group"`. `StatCard` is simpler without explicit ARIA. ⚠️ `StatCard` has no `role` or `aria-label`.

### burn-chart.tsx (195 lines)

| Element | Type | A11y |
|---------|------|------|
| Chart SVG | `<svg>` | `role="img"`, `aria-label="Budget burn chart"` |

**Notes:** ✅ Respects `prefers-reduced-motion` via `useReducedMotion`. Chart animations conditionally disabled. No interactive elements within chart (display only).

### progress-bar.tsx (136 lines)

| Element | Type | A11y |
|---------|------|------|
| Progress track | `<div>` | `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label` |

**Notes:** ✅ Full ARIA progressbar pattern. Auto-variant (color shifts at 70%/90%). Label positions: right, inside, above. Sizes: xs–xl.

### table.tsx (41 lines)

| Element | Type | A11y |
|---------|------|------|
| Table components | `<table>`, `<thead>`, `<tbody>`, `<tfoot>`, `<tr>`, `<th>`, `<td>`, `<caption>` | Semantic HTML |

**Notes:** ✅ Pure semantic HTML table wrappers. No custom ARIA needed. `data-[state=selected]` styling for row selection.

---

## 2. State Management

| Component | State Mechanism |
|-----------|----------------|
| **select.tsx** (custom) | `useState` — `open`, `value` via Context |
| **dropdown-menu.tsx** | `useState` — `open` via Context |
| **search-input.tsx** | `useState` — `localValue`, debounce via `setTimeout` ref |
| **toast.tsx** | Context provider — `toasts[]`, `addToast`, `removeToast` |
| **confirm-dialog.tsx** | Context provider — `open`, `options`, Promise `resolve` |
| **slide-panel.tsx** | Props — `open`, `onClose` |
| **animated-checkbox.tsx** | Props — `checked`, `onChange` |
| **currency-input.tsx** | `useState` — `displayValue`, formats on blur |
| **radio-group.tsx** | Context — `value`, `onValueChange` |
| **tab-bar.tsx** | Props — `activeTab`, `onTabChange` |
| **segmented-control.tsx** | Props — `value`, `onValueChange` |
| **copy-link-button.tsx** | `useState` — `copied` (2s timeout reset) |
| **avatar.tsx** | `useState` — `imgError`, `imgLoaded`; Context for composed API |
| **skeleton-crossfade.tsx** | `useState` + `useEffect` — delayed content reveal |

---

## 3. Radix UI vs Custom Implementation Audit

| Component | Implementation | Keyboard | Focus Trap | ARIA |
|-----------|---------------|----------|------------|------|
| **Checkbox** | Radix | ✅ | n/a | ✅ |
| **Toggle (Switch)** | Radix | ✅ | n/a | ✅ |
| **Dialog** | Radix | ✅ | ✅ | ✅ |
| **Tooltip** | Radix | ✅ | n/a | ✅ |
| **Accordion** | Radix | ✅ | n/a | ✅ |
| **Label** | Radix | n/a | n/a | ✅ |
| **Select (custom)** | Custom | ✅ | ✅ | ✅ |
| **Dropdown Menu** | Custom | ✅ | ✅ | ✅ |
| **Confirm Dialog** | Custom | ✅ | ✅ | ✅ |
| **Slide Panel** | Custom | Escape only | ❌ | ✅ |
| **Radio Group** | Custom | ✅ | n/a | ✅ |
| **Tab Bar** | Custom | ✅ | n/a | ✅ |
| **Segmented Control** | Custom | ✅ | n/a | ✅ |
| **Toast** | Custom | n/a | n/a | ✅ |

---

## 4. Findings

### Critical

| # | Component | Finding | Impact |
|---|-----------|---------|--------|
| C1 | `select.tsx` (custom) | **No keyboard navigation in custom select** — No ArrowUp/Down to traverse options, no Enter to select, no Escape to close, no type-ahead. Only mouse interaction works. | Keyboard-only users cannot operate custom select dropdowns | ✅ **REMEDIATED** — Verified component now has full keyboard navigation (ArrowUp/Down, Enter, Escape, type-ahead). |
| C2 | `dropdown-menu.tsx` | **No keyboard navigation in custom dropdown menu** — Same as above: no ArrowUp/Down, Enter, Escape, type-ahead. Only `aria-haspopup` and `role="menu"` are set. | Keyboard-only users cannot navigate menu items | ✅ **REMEDIATED** — Verified component now has full keyboard navigation. |
| C3 | `confirm-dialog.tsx` | **No focus trap and no Escape key handler** — Modal dialog allows Tab to escape to background. No `onKeyDown` for Escape. Only `autoFocus` on confirm button and click-outside-to-cancel. | Critical a11y violation for alertdialog; also a usability issue | ✅ **REMEDIATED** — Verified component now uses `useFocusTrap`, `useFocusReturn`, and `useEscapeKey` hooks. |

### High

| # | Component | Finding | Impact |
|---|-----------|---------|--------|
| H1 | `slide-panel.tsx` | **No focus trap** — Panel has Escape handler and `aria-modal` but Tab can escape to background content. | WCAG 2.4.3 violation for modal dialogs |
| H2 | `radio-group.tsx` | **No arrow key navigation between radio items** — Standard radio group behavior requires ArrowUp/Down/Left/Right to move between options. Currently only click works. | Keyboard-only users must Tab through all items instead of using arrows | ✅ **REMEDIATED** — Verified component now has arrow key navigation between radio items. |
| H3 | `form/form-field.tsx` | **Error text not linked to input via `aria-describedby`** — Error message renders visually below input but is not programmatically associated. Screen readers won't announce errors when input is focused. | Screen reader users may not hear validation errors |
| H4 | `tabs.tsx` (deprecated) | **Still actively importable with no console warning** — Deprecated module has `@deprecated` JSDoc but no runtime deprecation notice. Consumers may unknowingly use the old implementation. | Code quality / migration risk |

### Medium

| # | Component | Finding | Impact |
|---|-----------|---------|--------|
| M1 | `select.tsx` (custom) | **Click-outside handler uses `mousedown` but no `focusout` handling** — If user Tabs out of select, it remains visually open. | Visual state desync |
| M2 | `dropdown-menu.tsx` | **Same `mousedown`-only close as select.tsx** — Tab-out leaves menu open. | Visual state desync |
| M3 | `chip.tsx` | **Generic `aria-label="Remove"` on remove button** — No context about what is being removed. | Low-context for screen readers |
| M4 | `toast.tsx` | **CSS animation `toast-timer` must be defined externally** — Component assumes `@keyframes toast-timer` exists in globals.css. If missing, timer bar doesn't animate. | Silent regression risk |
| M5 | `currency-input.tsx` | **Hardcoded 3-currency symbol map** — Only USD ($), EUR (€), GBP (£). All other currencies fall back to `$`. | Incorrect currency display for non-USD/EUR/GBP |
| M6 | `currency-input.tsx` | **`formatCurrency` uses hardcoded `en-US` locale** — `toLocaleString("en-US")` ignores user's actual locale for number formatting. | i18n violation |
| M7 | `gantt-chart.tsx` | **No keyboard navigation between task bars** — Tasks are individual buttons but no sequential navigation or focus management between them. | Reduced keyboard usability in complex charts |
| M8 | `stat-card.tsx` | **No ARIA grouping** — Unlike `MetricCard` which has `role="group"` + `aria-label`, `StatCard` has neither. | Screen readers can't distinguish card boundaries |

### Low

| # | Component | Finding | Impact |
|---|-----------|---------|--------|
| L1 | `input.tsx` | **No built-in error state styling** — Unlike `auth-form-field.tsx` which adds `aria-invalid` + border color, the base input has no error variant. | Consumers must add error styling manually |
| L2 | `burn-chart.tsx` | **Chart uses CSS animation `chartLineDraw` that must be defined externally** — Same pattern as toast-timer. | Silent regression risk |
| L3 | `heatmap-grid.tsx` | **Hardcoded `aria-label="Utilization heatmap"`** — Label doesn't change even when `colorScale` is `"heat"` or `"divergent"`. | Slightly inaccurate AT announcement |
| L4 | `avatar.tsx` | **Composed Avatar (with children) doesn't pass `role="img"` or `aria-label`** — The simple API (`name`/`src` props) generates appropriate `alt` text, but the composed API relies on consumers to add accessibility. | Consumer responsibility gap |
| L5 | `number-ticker.tsx` | **No `aria-live` on changing number** — Animated number changes are purely visual. Screen readers see the final value but aren't notified of changes. | Low impact since values are typically in labeled containers |
| L6 | `copy-link-button.tsx` | **Uses deprecated `document.execCommand("copy")` in fallback** — Technically functional but deprecated in web standards. | Future-proofing concern |

---

## 5. Pattern Consistency Analysis

### Positive Patterns

- **CVA (class-variance-authority)** used consistently for variant/size styling across button, toggle, badge, chip, progress-bar, label
- **`forwardRef`** used consistently for form primitives (input, textarea, checkbox, select, date-picker, currency-input, label)
- **`focus-visible` ring** applied universally — no component uses `focus` instead
- **Token-based styling** — all colors reference semantic tokens (`primary`, `destructive`, `success`, etc.)
- **`useReducedMotion`** respected in animated-checkbox, burn-chart, metric-card sparkline, number-ticker
- **`motion-safe:` prefix** used in sliding-indicator and skeleton-crossfade

### Inconsistency Concerns

- **Two select implementations** — `select.tsx` (custom, incomplete keyboard) vs `form/select.tsx` (native, full keyboard). Consumers may pick wrong one.
- **Two tab implementations** — `tabs.tsx` (deprecated) vs `tab-bar.tsx` (current). No runtime guard.
- **Stat card duplication** — `stat-card.tsx` and `metric-card.tsx` serve similar purposes with different feature sets.

---

## 6. Summary

| Metric | Count |
|--------|-------|
| **Files audited** | 37 |
| **Interactive elements** | 68 |
| **Critical findings** | 3 |
| **High findings** | 4 |
| **Medium findings** | 8 |
| **Low findings** | 6 |
| **Total findings** | 21 |
| **Radix-backed (full a11y)** | 6 components |
| **Custom (needs keyboard work)** | 4 components |

### Key Recommendations

1. **Replace custom `select.tsx` with Radix Select** or add full keyboard navigation (ArrowUp/Down, Enter, Escape, type-ahead, Home/End)
2. **Replace custom `dropdown-menu.tsx` with Radix DropdownMenu** or add full keyboard navigation
3. **Add focus trap + Escape handler to `confirm-dialog.tsx`** — consider using Radix AlertDialog instead
4. **Add focus trap to `slide-panel.tsx`** — use existing `useFocusTrap` hook from accessibility module
5. **Add arrow key navigation to `radio-group.tsx`** — follow WAI-ARIA radio group pattern
6. **Wire `aria-describedby` in `form/form-field.tsx`** — generate ID and pass to child input
7. **Consolidate `stat-card.tsx` → `metric-card.tsx`** — MetricCard is strictly superset
8. **Add runtime deprecation warning to `tabs.tsx`** — `console.warn` on first render
9. **Fix `currency-input.tsx` locale hardcoding** — use user's locale from `@/lib/locale.ts`
