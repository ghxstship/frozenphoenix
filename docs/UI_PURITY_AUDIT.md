# UI Purity Audit — IRON FACADE Protocol

> **Audit Date:** 2026-04-01  
> **Status:** ✅ PASS — Zero violations across all categories  
> **TypeScript:** `tsc --noEmit` passes clean (0 errors)

## Scope

All files under `src/app/` and `src/components/` (excluding `src/components/ui/` internals) were audited for raw HTML element usage where a canonical UI library component exists.

## Results

| Element                                  | Canonical Component  | Files Remediated | Violations Fixed | Remaining |
| ---------------------------------------- | -------------------- | ---------------- | ---------------- | --------- |
| `<button>`                               | `Button`             | 14+              | 23+              | **0**     |
| `<label>`                                | `Label`              | 30               | 68               | **0**     |
| `<input>` (text-like)                    | `Input`              | 13               | 29               | **0**     |
| `<textarea>`                             | `Textarea` (NEW)     | 10               | 13               | **0**     |
| `<select>`                               | `NativeSelect` (NEW) | 13               | 19               | **0**     |
| `<table>/<thead>/<tbody>/<tr>/<th>/<td>` | `Table` family       | 10               | 60+              | **0**     |

### Exceptions (Legitimate Raw HTML)

The following raw HTML elements are **approved exceptions** and do not require remediation:

- `<input type="file">` — File upload triggers (no canonical component needed)
- `<input type="hidden">` — Hidden form fields
- `<input type="checkbox">` / `<input type="radio">` — Used inside compound components
- `<option>` — Children of `NativeSelect`, semantic HTML requirement
- `style={{}}` — Dynamic values bound to runtime data (progress bars, color swatches, chart dimensions, CSS variables)

## New Components Created

### `src/components/ui/textarea.tsx`

- Mirrors `Input` component API: `className`, `error`, `ref` forwarding
- Consistent border, ring, and disabled styles with the design system
- Default `min-h-[80px]` with `resize-y`

### `src/components/ui/native-select.tsx`

- Wraps `<select>` with canonical Input-consistent styling
- Supports `error` prop for validation state
- Drop-in replacement for raw `<select>` — children are `<option>` elements

## Enforcement

All future development **must** use the following canonical components:

| Need                   | Use                                                   |
| ---------------------- | ----------------------------------------------------- |
| Clickable action       | `<Button>` from `@/components/ui/button`              |
| Form label             | `<Label>` from `@/components/ui/label`                |
| Text/number/date input | `<Input>` from `@/components/ui/input`                |
| Multi-line text        | `<Textarea>` from `@/components/ui/textarea`          |
| Native dropdown        | `<NativeSelect>` from `@/components/ui/native-select` |
| Custom dropdown        | `<Select>` from `@/components/ui/select`              |
| Data table             | `<Table>` family from `@/components/ui/table`         |
