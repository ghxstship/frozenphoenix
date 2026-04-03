# UI Component Status — IRON FACADE Protocol

> **Audit Date:** 2026-04-03
> **Quality Gate Standard:** WCAG 2.1 AA + Production SaaS (Linear/Vercel/Notion tier)

## Status Legend

| Symbol | Meaning                               |
| ------ | ------------------------------------- |
| ✅     | Fully compliant                       |
| ⚠️     | Partial — functional but not hardened |
| ❌     | Missing / needs work                  |
| N/A    | Not applicable to this component      |

---

## Core Input Components

| Component       | forwardRef | cn() merge | ...rest | Variants      | A11y/ARIA         | Keyboard | Loading              | Error State     | Responsive | Status     |
| --------------- | ---------- | ---------- | ------- | ------------- | ----------------- | -------- | -------------------- | --------------- | ---------- | ---------- |
| Button          | ✅         | ✅         | ✅      | ✅ 7 variants | ✅                | ✅       | ⚠️ no `loading` prop | N/A             | ✅         | Production |
| Input           | ✅         | ✅         | ✅      | —             | ✅ `aria-invalid` | ✅       | N/A                  | ✅ `error` prop | ✅         | Production |
| Textarea        | ✅         | ✅         | ✅      | —             | ✅ `aria-invalid` | ✅       | N/A                  | ✅ `error` prop | ✅         | Production |
| Checkbox        | ✅         | ✅         | ✅      | —             | ✅ Radix          | ✅       | N/A                  | N/A             | ✅         | Production |
| Toggle (Switch) | ✅         | ✅         | ✅      | sizes         | ✅ Radix          | ✅       | N/A                  | N/A             | ✅         | Production |
| RadioGroup      | ❌         | ✅         | ⚠️      | —             | ✅                | ✅       | N/A                  | N/A             | ✅         | Needs Work |
| Label           | ✅         | ✅         | ✅      | 3 variants    | ✅ Radix          | ✅       | N/A                  | N/A             | ✅         | Production |
| NativeSelect    | ✅         | ✅         | ✅      | —             | ✅                | ✅       | N/A                  | ✅              | ✅         | Production |
| SearchInput     | ❌         | ✅         | ⚠️      | —             | ⚠️                | ✅       | N/A                  | N/A             | ✅         | Needs Work |

## Selection & Menus

| Component      | forwardRef | cn() merge | ...rest | Variants | A11y/ARIA           | Keyboard | Loading | Empty State | Status     |
| -------------- | ---------- | ---------- | ------- | -------- | ------------------- | -------- | ------- | ----------- | ---------- |
| Select         | ❌ context | ✅         | ❌      | —        | ✅ combobox/listbox | ✅ full  | N/A     | N/A         | Production |
| DropdownMenu   | ❌ context | ✅         | ❌      | —        | ⚠️                  | ⚠️       | N/A     | N/A         | Needs Work |
| CommandPalette | N/A        | ✅         | N/A     | —        | ✅ dialog/listbox   | ✅ full  | N/A     | ✅          | Production |

## Layout & Display

| Component       | forwardRef | cn() merge | ...rest | Truncation | Responsive | Status     |
| --------------- | ---------- | ---------- | ------- | ---------- | ---------- | ---------- |
| Card (compound) | ✅ all     | ✅         | ✅      | N/A        | ✅         | Production |
| Badge           | ❌         | ✅         | ✅      | N/A        | ✅         | Needs Work |
| Chip            | ❌         | ✅         | ✅      | N/A        | ✅         | Needs Work |
| StatusBadge     | ❌         | ✅         | ✅      | N/A        | ✅         | Production |
| Avatar          | ❌         | ✅         | ⚠️      | N/A        | ⚠️         | Needs Work |
| Separator       | ✅         | ✅         | ✅      | N/A        | ✅         | Production |
| ProgressBar     | ❌         | ✅         | ⚠️      | N/A        | ✅         | Needs Work |
| TruncatedText   | ❌         | ✅         | ✅      | ✅         | ✅         | Production |
| MetricCard      | ❌         | ✅         | ⚠️      | ⚠️         | ✅         | Needs Work |
| StatCard        | ❌         | ✅         | ⚠️      | N/A        | ✅         | Needs Work |
| IconContainer   | ❌         | ✅         | ⚠️      | N/A        | ✅         | Needs Work |

## Overlays & Panels

| Component          | forwardRef | cn() merge | ...rest | A11y/ARIA | Keyboard | Focus Trap | Motion Safe | Status     |
| ------------------ | ---------- | ---------- | ------- | --------- | -------- | ---------- | ----------- | ---------- |
| Dialog (compound)  | ✅         | ✅         | ✅      | ✅ Radix  | ✅       | ✅ Radix   | ✅          | Production |
| ConfirmDialog      | N/A        | N/A        | N/A     | ⚠️        | ✅       | ⚠️         | ✅          | Needs Work |
| Sheet (compound)   | ✅         | ✅         | ✅      | ✅ Radix  | ✅       | ✅ Radix   | ✅          | Production |
| Popover (compound) | ✅         | ✅         | ✅      | ✅ Radix  | ✅       | ✅         | ✅          | Production |
| Tooltip            | ❌         | ✅         | ⚠️      | ✅ Radix  | ✅       | N/A        | ✅          | Production |
| SlidePanel         | ❌         | ✅         | ⚠️      | ⚠️        | ⚠️       | ⚠️         | ✅          | Needs Work |
| Toast              | N/A        | ✅         | N/A     | ⚠️        | N/A      | N/A        | ✅          | Production |

## Navigation & Data

| Component        | forwardRef | cn() merge | ...rest | A11y/ARIA      | Keyboard | Empty State    | Status     |
| ---------------- | ---------- | ---------- | ------- | -------------- | -------- | -------------- | ---------- |
| Table (compound) | ❌         | ✅         | ✅      | ✅ semantic    | ✅       | N/A (consumer) | Needs Work |
| TabBar           | ❌         | ✅         | ⚠️      | ✅ tablist/tab | ✅       | N/A            | Production |
| Accordion        | ✅         | ✅         | ✅      | ✅ Radix       | ✅       | N/A            | Production |
| ViewSwitcher     | ❌         | ✅         | ⚠️      | ⚠️             | ⚠️       | N/A            | Needs Work |
| FilterBar        | ❌         | ✅         | ⚠️      | N/A            | N/A      | N/A            | Needs Work |
| BulkActionBar    | ❌         | ✅         | ⚠️      | ⚠️             | ✅       | N/A            | Needs Work |
| SegmentedControl | ❌         | ✅         | ⚠️      | ⚠️             | ✅       | N/A            | Needs Work |
| StepIndicator    | ❌         | ✅         | ⚠️      | ⚠️             | ✅       | N/A            | Needs Work |

---

## Summary

| Category          | Total  | Production | Needs Work |
| ----------------- | ------ | ---------- | ---------- |
| Core Inputs       | 9      | 7          | 2          |
| Selection & Menus | 3      | 2          | 1          |
| Layout & Display  | 11     | 4          | 7          |
| Overlays & Panels | 7      | 5          | 2          |
| Navigation & Data | 8      | 2          | 6          |
| **Total**         | **38** | **20**     | **18**     |

### Priority Improvements

1. **Badge / Chip** — Add `forwardRef`
2. **Table** — Add `forwardRef` to all sub-components
3. **Button** — Add `loading` prop with spinner + width preservation
4. **DropdownMenu** — Improve ARIA pattern and keyboard navigation
5. **ConfirmDialog** — Proper focus trap and ARIA attributes
6. **RadioGroup / SearchInput** — Add `forwardRef`

### Architecture Strengths

- ✅ All Radix-based components inherit excellent ARIA + keyboard support
- ✅ `cn()` merge used consistently across 100% of components
- ✅ All motion wrapped in `motion-safe:` / `prefers-reduced-motion`
- ✅ Design token system is comprehensive (colors, shadows, radius, z-index, timing)
- ✅ Dark mode fully supported via CSS custom properties
- ✅ Single icon library (`lucide-react`) — zero deviations
