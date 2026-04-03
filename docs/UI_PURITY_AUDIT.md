# UI Purity Audit — IRON FACADE Protocol

> **Audit Date:** 2026-04-03 (updated from 2026-04-01)
> **Status:** ✅ PASS — Zero violations across all categories
> **TypeScript:** `tsc --noEmit` passes clean (0 errors)
> **Icon Library:** `lucide-react` — exclusive (0 deviations)

## Scope

All 921 consumer files under `src/app/` and `src/components/` (excluding `src/components/ui/` internals) were scanned for raw HTML element usage, hardcoded styles, and behavioral violations.

---

## Phase 1 Results — Category A: Raw HTML Element Violations

| Element                                            | Canonical Component | Files Remediated | Violations Fixed | Remaining |
| -------------------------------------------------- | ------------------- | ---------------- | ---------------- | --------- |
| `<button>`                                         | `Button`            | 16+              | 26+              | **0**     |
| `<label>`                                          | `Label`             | 30               | 68               | **0**     |
| `<input>` (text-like)                              | `Input`             | 13               | 29               | **0**     |
| `<input type="checkbox">`                          | `Checkbox`          | 1                | 1                | **0**     |
| `<textarea>`                                       | `Textarea`          | 10               | 13               | **0**     |
| `<select>`                                         | `NativeSelect`      | 13               | 19               | **0**     |
| `<table>`/`<thead>`/`<tbody>`/`<tr>`/`<th>`/`<td>` | `Table` family      | 10               | 60+              | **0**     |

### 2026-04-03 Remediation Pass

| File Path                         | Line(s) | Violation Category                | Description                                             | Resolution                                                 |
| --------------------------------- | ------- | --------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------- |
| `settings/invite-codes/page.tsx`  | 284–295 | A — Raw `<input type="checkbox">` | Raw checkbox with inline `style={{}}` for sizing/accent | Replaced with `<Checkbox>` from `@/components/ui/checkbox` |
| `settings/invite-codes/page.tsx`  | 377–388 | A — Raw `<button>`                | Raw button for toggle code active/inactive              | Replaced with `<Button variant="ghost" size="icon">`       |
| `settings/invite-codes/page.tsx`  | 389–396 | A — Raw `<button>`                | Raw button for copy invite link                         | Replaced with `<Button variant="ghost" size="icon">`       |
| `settings/join-requests/page.tsx` | 132–146 | A — Raw `<button>`                | Raw button for status filter tabs                       | Replaced with `<Button variant="ghost">`                   |

---

## Phase 1 Results — Category B: Hardcoded Style Violations

| File Path                         | Line(s) | Violation                                   | Resolution                                   |
| --------------------------------- | ------- | ------------------------------------------- | -------------------------------------------- |
| `settings/invite-codes/page.tsx`  | 632–634 | Hardcoded `color: #34d399`                  | Migrated to `color: hsl(var(--success))`     |
| `settings/join-requests/page.tsx` | 513     | Hardcoded `#059669` (green)                 | Migrated to `hsl(var(--success))`            |
| `settings/join-requests/page.tsx` | 514     | Hardcoded `#047857` (green hover)           | Migrated to `hsl(var(--success) / 0.85)`     |
| `settings/join-requests/page.tsx` | 515     | Hardcoded `#f87171` (red)                   | Migrated to `hsl(var(--destructive))`        |
| `settings/join-requests/page.tsx` | 516     | Hardcoded `rgba(248,113,113,0.08)`          | Migrated to `hsl(var(--destructive) / 0.08)` |
| `settings/join-requests/page.tsx` | 517     | Hardcoded `#34d399`, `rgba(5,150,105,0.15)` | Migrated to `hsl(var(--success))` tokens     |
| `settings/join-requests/page.tsx` | 518     | Hardcoded `#f87171`, `rgba(239,68,68,0.12)` | Migrated to `hsl(var(--destructive))` tokens |
| `ui/command-palette.tsx`          | 217     | Hardcoded `z-[60]`                          | Migrated to `z-[var(--z-overlay)]`           |
| `ui/command-palette.tsx`          | 224     | Hardcoded `z-[61]`                          | Migrated to `z-[var(--z-panel)]`             |

---

## Phase 1 Results — Category C: Behavioral Violations

| Check                                | Status                                                                            |
| ------------------------------------ | --------------------------------------------------------------------------------- |
| Icon library consolidation           | ✅ `lucide-react` exclusive (0 react-icons, 0 heroicons, 0 @radix-ui/react-icons) |
| Re-implemented components            | ✅ None found                                                                     |
| Wrapper components adding zero value | ✅ None found                                                                     |
| Custom state for library-handled UI  | ✅ None found                                                                     |

---

## Approved Exceptions (Legitimate Raw HTML)

| Element                                          | Location                   | Justification                                                                 |
| ------------------------------------------------ | -------------------------- | ----------------------------------------------------------------------------- |
| `<input type="file">`                            | Various                    | File upload triggers (no canonical component)                                 |
| `<input type="hidden">`                          | Various                    | Hidden form fields                                                            |
| `<input type="checkbox">`/`<input type="radio">` | Inside compound components | Semantic elements within library internals                                    |
| `<option>`                                       | Inside `NativeSelect`      | Required children of native `<select>`                                        |
| `<img>`                                          | `auth/mfa-setup/page.tsx`  | Data URI from Supabase TOTP — not optimizable by `next/image`                 |
| `<input>` in `data-table.tsx`                    | Table inline editing       | Specialized inline cell editing inputs                                        |
| `<input>` in `command-bar.tsx`                   | Command palette search     | Internal library component implementation                                     |
| `<input>` in `barcode-scanner.tsx`               | Camera/file input          | Hardware interface input                                                      |
| `style={{}}` on dynamic values                   | Various                    | Runtime-computed widths, backgroundColor, fontFamily — approved dynamic usage |

---

## Enforcement

All future development **must** use canonical components:

| Need                      | Use                                                   |
| ------------------------- | ----------------------------------------------------- |
| Clickable action          | `<Button>` from `@/components/ui/button`              |
| Form label                | `<Label>` from `@/components/ui/label`                |
| Text/number/date input    | `<Input>` from `@/components/ui/input`                |
| Multi-line text           | `<Textarea>` from `@/components/ui/textarea`          |
| Boolean toggle (checkbox) | `<Checkbox>` from `@/components/ui/checkbox`          |
| Boolean toggle (switch)   | `<Toggle>` from `@/components/ui/toggle`              |
| Native dropdown           | `<NativeSelect>` from `@/components/ui/native-select` |
| Custom dropdown           | `<Select>` from `@/components/ui/select`              |
| Data table                | `<Table>` family from `@/components/ui/table`         |
| Status indicator          | `<Badge>` / `<StatusBadge>` from `@/components/ui`    |
| Colors                    | Design tokens only — never hardcoded hex values       |
| Z-index                   | `var(--z-*)` tokens only — never arbitrary numbers    |
