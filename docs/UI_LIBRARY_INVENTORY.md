# UI Library Inventory — IRON FACADE Protocol

> **Audit Date:** 2026-04-03
> **Component Directory:** `src/components/ui/`
> **Total Components:** 74 (68 root + 6 form subcomponents)
> **Barrel Export:** `src/components/ui/index.ts`
> **Icon Library:** `lucide-react` (exclusive — 0 violations)
> **Design Tokens:** Tailwind v4 CSS-first via `src/app/globals.css`

---

## Atoms — Primitive Components

### Button

| Field           | Value                                                                     |
| --------------- | ------------------------------------------------------------------------- |
| File            | `button.tsx`                                                              |
| Variants        | `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`, `glow` |
| Sizes           | `default`, `sm`, `lg`, `xl`, `icon`                                       |
| Props           | `ButtonHTMLAttributes` + `variant`, `size`, `asChild`                     |
| Composition     | Atomic, supports `asChild` via `@radix-ui/react-slot`                     |
| Ref Forwarding  | ✅ `forwardRef`                                                           |
| className merge | ✅ via `cn()`                                                             |
| Test Coverage   | No                                                                        |

### Input

| Field           | Value                                     |
| --------------- | ----------------------------------------- |
| File            | `input.tsx`                               |
| Variants        | None (uniform styling)                    |
| Props           | `InputHTMLAttributes` + `error?: boolean` |
| Composition     | Atomic                                    |
| Ref Forwarding  | ✅ `forwardRef`                           |
| className merge | ✅                                        |
| Test Coverage   | No                                        |

### Textarea

| Field           | Value                                        |
| --------------- | -------------------------------------------- |
| File            | `textarea.tsx`                               |
| Props           | `TextareaHTMLAttributes` + `error?: boolean` |
| Composition     | Atomic                                       |
| Ref Forwarding  | ✅ `forwardRef`                              |
| className merge | ✅                                           |
| Test Coverage   | No                                           |

### Label

| Field          | Value                                               |
| -------------- | --------------------------------------------------- |
| File           | `label.tsx`                                         |
| Variants       | `default`, `muted`, `error`                         |
| Props          | `LabelPrimitive.Root` props + `variant`, `required` |
| Dependencies   | `@radix-ui/react-label`                             |
| Ref Forwarding | ✅                                                  |
| Test Coverage  | No                                                  |

### Badge

| Field          | Value                                                                                   |
| -------------- | --------------------------------------------------------------------------------------- |
| File           | `badge.tsx`                                                                             |
| Variants       | `default`, `secondary`, `destructive`, `warning`, `success`, `info`, `outline`, `ghost` |
| Props          | `HTMLAttributes<div>` + `variant`, `animate`                                            |
| Composition    | Atomic                                                                                  |
| Ref Forwarding | ❌ (function component)                                                                 |
| Test Coverage  | No                                                                                      |

### StatusBadge / PriorityBadge / ConditionBadge / GenericBadge

| Field       | Value                                                            |
| ----------- | ---------------------------------------------------------------- |
| File        | `status-badge.tsx`                                               |
| Composition | Wrappers around `Badge` with semantic variant mapping            |
| Exports     | `StatusBadge`, `PriorityBadge`, `ConditionBadge`, `GenericBadge` |

### Chip

| Field          | Value                                             |
| -------------- | ------------------------------------------------- |
| File           | `chip.tsx`                                        |
| Variants       | `default`, `secondary`, `outline`                 |
| Sizes          | `default`, `sm`, `lg`                             |
| Props          | `variant`, `size`, `onRemove`, `icon`, `children` |
| Ref Forwarding | ❌                                                |

### Checkbox

| Field          | Value                      |
| -------------- | -------------------------- |
| File           | `checkbox.tsx`             |
| Props          | `CheckboxPrimitive` props  |
| Dependencies   | `@radix-ui/react-checkbox` |
| Ref Forwarding | ✅                         |

### Toggle (Switch)

| Field          | Value                    |
| -------------- | ------------------------ |
| File           | `toggle.tsx`             |
| Variants       | `default`                |
| Sizes          | `default`, `sm`, `lg`    |
| Dependencies   | `@radix-ui/react-switch` |
| Ref Forwarding | ✅                       |

### Avatar

| Field       | Value                                     |
| ----------- | ----------------------------------------- |
| File        | `avatar.tsx`                              |
| Sizes       | `xs`, `sm`, `md`, `lg`, `xl`              |
| Exports     | `Avatar`, `AvatarImage`, `AvatarFallback` |
| Composition | Compound                                  |

### Separator

| Field          | Value                       |
| -------------- | --------------------------- |
| File           | `separator.tsx`             |
| Dependencies   | `@radix-ui/react-separator` |
| Ref Forwarding | ✅                          |

### ProgressBar

| Field    | Value                                             |
| -------- | ------------------------------------------------- |
| File     | `progress-bar.tsx`                                |
| Variants | `default`, `success`, `warning`, `danger`, `info` |
| Sizes    | `sm`, `md`, `lg`                                  |
| Props    | `value`, `max`, `showLabel`, `animate`            |

### RadioGroup / RadioGroupItem

| File | `radio-group.tsx` |

### AlertBanner

| File | `alert-banner.tsx` |
| Composition | Wraps `Card` + `CardContent` with severity styling |

### IconContainer

| File | `icon-container.tsx` |
| Variants | `default`, `success`, `warning`, `danger`, `info` |

### OverlineText

| File | `overline-text.tsx` |

### BackLink

| File | `back-link.tsx` |

---

## Molecules — Composition Components

### Card (Compound)

| Field          | Value                                                                             |
| -------------- | --------------------------------------------------------------------------------- |
| File           | `card.tsx`                                                                        |
| Exports        | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` |
| Ref Forwarding | ✅ (all subcomponents)                                                            |

### Dialog (Compound)

| Field        | Value                                                                                                                                                          |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| File         | `dialog.tsx`                                                                                                                                                   |
| Exports      | `Dialog`, `DialogPortal`, `DialogOverlay`, `DialogClose`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription` |
| Sizes        | `sm`, `md`, `lg`, `xl`, `full`                                                                                                                                 |
| Dependencies | `@radix-ui/react-dialog`                                                                                                                                       |
| Mobile       | Bottom sheet with swipe-to-dismiss                                                                                                                             |

### ConfirmDialog

| File | `confirm-dialog.tsx` |
| Exports | `ConfirmDialogProvider`, `useConfirm` |

### Select (Compound)

| Field    | Value                                                                   |
| -------- | ----------------------------------------------------------------------- |
| File     | `select.tsx`                                                            |
| Exports  | `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem` |
| Keyboard | Full arrow/enter/escape/type-ahead support                              |
| ARIA     | `role="combobox"`, `role="listbox"`, `role="option"`                    |

### NativeSelect

| File | `native-select.tsx` |
| Ref Forwarding | ✅ |

### DropdownMenu (Compound)

| Field   | Value                                                                                                                                               |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| File    | `dropdown-menu.tsx`                                                                                                                                 |
| Exports | `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator`, `DropdownMenuLabel`, `DropdownMenuGroup` |

### Popover (Compound)

| Field        | Value                                                          |
| ------------ | -------------------------------------------------------------- |
| File         | `popover.tsx`                                                  |
| Exports      | `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor` |
| Dependencies | `@radix-ui/react-popover`                                      |

### Sheet (Compound)

| File | `sheet.tsx` |
| Exports | `Sheet`, `SheetTrigger`, `SheetContent`, `SheetClose`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription` |
| Dependencies | `@radix-ui/react-dialog` |

### Tooltip

| Field        | Value                                                                                         |
| ------------ | --------------------------------------------------------------------------------------------- |
| File         | `tooltip.tsx`                                                                                 |
| Exports      | `Tooltip` (convenience), `TooltipProvider`, `TooltipRoot`, `TooltipTrigger`, `TooltipContent` |
| Dependencies | `@radix-ui/react-tooltip`                                                                     |

### Accordion (Compound)

| Field        | Value                                                                |
| ------------ | -------------------------------------------------------------------- |
| File         | `accordion.tsx`                                                      |
| Exports      | `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` |
| Dependencies | `@radix-ui/react-accordion`                                          |

### Table (Compound)

| Field          | Value                                                                                                    |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| File           | `table.tsx`                                                                                              |
| Exports        | `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption` |
| Ref Forwarding | ❌ (function components, not forwardRef)                                                                 |

### TabBar

| File | `tab-bar.tsx` |
| Exports | `TabBar`, `TabPanel` |
| Features | URL-synced navigation, scoping tabs with counts |

### SearchInput

| File | `search-input.tsx` |
| Props | `value`, `onChange`, `onClear`, `debounceMs` |

### FilterBar / ListToolbar

| File | `filter-bar.tsx` |
| Exports | `ListToolbar`, `FilterBar` (alias) |

### Toast

| Field    | Value                                                  |
| -------- | ------------------------------------------------------ |
| File     | `toast.tsx`                                            |
| Exports  | `ToastProvider`, `useToast`, `toastVariants`           |
| Variants | `default`, `success`, `destructive`, `warning`, `info` |

### ViewSwitcher

| File | `view-switcher.tsx` |
| Types | `table`, `board`, `cards`, `calendar`, `timeline`, `gallery`, `chart`, `map`, `workload` |

### BulkActionBar

| File | `bulk-action-bar.tsx` |

### StaggerContainer / StaggerItem

| File | `stagger-container.tsx` |

---

## Organisms — Complex Components

### CommandPalette

| File | `command-palette.tsx` |
| Features | ⌘K shortcut, fuzzy search, keyboard navigation |

### AdvancedFilterPopover

| File | `advanced-filter-popover.tsx` |

### ColumnVisibilityPopover

| File | `column-visibility-popover.tsx` |

### GanttChart

| File | `gantt-chart.tsx` |

### HeatmapGrid

| File | `heatmap-grid.tsx` |

### BurnChart

| File | `burn-chart.tsx` |

---

## Specialized / Animation Components

| Component                                              | File                          | Purpose                               |
| ------------------------------------------------------ | ----------------------------- | ------------------------------------- |
| AnimatedCheckbox                                       | `animated-checkbox.tsx`       | SVG-animated checkbox                 |
| AnimatedList / AnimatedListItem                        | `animated-list.tsx`           | Framer Motion list animation          |
| LayoutTransition / LayoutTransitionItem                | `layout-transition.tsx`       | Framer Motion layout animation        |
| PageTransition                                         | `page-transition.tsx`         | Route transition wrapper              |
| ScrollReveal                                           | `scroll-reveal.tsx`           | Intersection Observer reveal          |
| SkeletonCrossfade                                      | `skeleton-crossfade.tsx`      | Loading skeleton → content transition |
| SlidingIndicator                                       | `sliding-indicator.tsx`       | Tab indicator animation               |
| NumberTicker                                           | `number-ticker.tsx`           | Animated number counter               |
| PullToRefresh                                          | `pull-to-refresh.tsx`         | Mobile pull-to-refresh                |
| OfflineIndicator                                       | `offline-indicator.tsx`       | Network status banner                 |
| TruncatedText                                          | `truncated-text.tsx`          | Text truncation with tooltip          |
| ResponsiveContainer / ResponsiveGrid / ResponsiveStack | `responsive-container.tsx`    | Responsive layout primitives          |
| StepIndicator                                          | `step-indicator.tsx`          | Multi-step wizard indicator           |
| SegmentedControl                                       | `segmented-control.tsx`       | iOS-style segmented selector          |
| SlidePanel                                             | `slide-panel.tsx`             | Animated slide-over panel             |
| AvatarCropDialog                                       | `avatar-crop-dialog.tsx`      | Avatar image upload + crop            |
| CopyLinkButton                                         | `copy-link-button.tsx`        | Copy-to-clipboard button              |
| DuplicateOrderWarning                                  | `duplicate-order-warning.tsx` | Deduplication warning dialog          |
| ApprovalFlow                                           | `approval-flow.tsx`           | Multi-step approval viewer            |
| PageHeader                                             | `page-header.tsx`             | Standard page header layout           |
| MetricCard                                             | `metric-card.tsx`             | KPI metric display card               |
| StatCard                                               | `stat-card.tsx`               | Simple stat display                   |
| StatsGrid                                              | `stats-grid.tsx`              | Grid layout for stat cards            |
| NlpDateInput                                           | `nlp-date-input.tsx`          | Natural language date input           |
| EmptyRow                                               | `empty-row.tsx`               | Empty table row message               |

---

## Form Subcomponents (`ui/form/`)

| Component          | File                            | Purpose                          |
| ------------------ | ------------------------------- | -------------------------------- |
| FormField          | `form/form-field.tsx`           | Field wrapper with label + error |
| Select (form)      | `form/select.tsx`               | Native `<select>` with styling   |
| Textarea (form)    | `form/textarea.tsx`             | Form-integrated textarea         |
| DatePicker         | `form/date-picker.tsx`          | Native date input wrapper        |
| CurrencyInput      | `form/currency-input.tsx`       | Currency-aware numeric input     |
| EntityLookupSelect | `form/entity-lookup-select.tsx` | Async entity search dropdown     |

---

## Design Token System

All tokens defined in `src/app/globals.css` via CSS custom properties:

| Category              | Examples                                                                                                                                                    |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Semantic Colors**   | `--primary`, `--destructive`, `--warning`, `--success`, `--info`                                                                                            |
| **Surface Elevation** | `--surface-elevated`, `--surface-overlay`, `--surface-sunken`                                                                                               |
| **Shadows**           | `--shadow-xs` through `--shadow-xl`                                                                                                                         |
| **Radius**            | `--radius-sm` through `--radius-2xl`                                                                                                                        |
| **Animation**         | `--ease-spring`, `--duration-fast` (150ms), `--duration-normal` (200ms), `--duration-slow` (300ms)                                                          |
| **Z-Index**           | `--z-tab-active: 1`, `--z-overlay: 100`, `--z-panel: 101`, `--z-toast: 100`, `--z-modal: 150`, `--z-confirm: 200`, `--z-banner: 250`, `--z-skip-link: 9999` |
| **Glass Morphism**    | `--glass-bg`, `--glass-border`, `--glass-blur`, `--glass-saturate`                                                                                          |

Dark mode fully supported via `.dark` selector with all tokens redefined.
