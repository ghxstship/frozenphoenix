# IRON CURTAIN — Phase 4: Forms & Input Elements Audit

> Audited: 2026-03-21 | Scope: All form components, validation, and input elements

## Executive Summary

| Classification | Count |
|---|---|
| ✅ PASS | 14 |
| 🟡 MINOR | 1 |
| 🔴 BROKEN | 0 |
| ⚫ MISSING | 0 |

---

## FormField — Semantic Form Layout

| Test | Result | Notes |
|---|---|---|
| Label association via `htmlFor` | ✅ PASS | Auto-generated ID via `useId()` if not provided |
| Required indicator | ✅ PASS | Red `*` next to label |
| Error display with `role="alert"` | ✅ PASS | Red text below field with proper ID for `aria-describedby` |
| Description text | ✅ PASS | Shown when no error; linked via `aria-describedby` |
| `aria-invalid` injection | ✅ PASS | Auto-cloned onto child input when error is present |
| `aria-describedby` chaining | ✅ PASS | Combines error + description IDs |

## Input Components

### CurrencyInput

| Test | Result | Notes |
|---|---|---|
| Currency symbol display | ✅ PASS | `Intl.NumberFormat` with `narrowSymbol` and fallback |
| Non-numeric stripping | ✅ PASS | `replace(/[^0-9.]/g, "")` |
| Format on blur | ✅ PASS | `toLocaleString` with up to 2 decimal places |
| Undefined value for empty | ✅ PASS | `onChange?.(undefined)` when input is cleared |
| `inputMode="decimal"` | ✅ PASS | Correct mobile keyboard on touch devices |

### EntityLookupSelect

| Test | Result | Notes |
|---|---|---|
| API data fetching | ✅ PASS | `apiList` with `per_page: 500` on mount |
| Loading state | ✅ PASS | Spinner with "Loading…" text |
| Error state | ✅ PASS | Red border with error message |
| Search within dropdown | ✅ PASS | `autoFocus` search input with case-insensitive filter |
| Clear selection option | ✅ PASS | Shows "Clear selection" when value is set |
| ARIA attributes | ✅ PASS | `aria-haspopup="listbox"`, `role="option"`, `aria-selected` |
| Backdrop close | ✅ PASS | Fixed inset backdrop closes dropdown on click |
| Secondary field disambiguation | ✅ PASS | Shows `"name (email)"` format when configured |

### CreateEntityDialog Form Integration

| Test | Result | Notes |
|---|---|---|
| 10 input types supported | ✅ PASS | text, email, url, number, date, datetime-local, select, textarea, currency, entity-lookup |
| Required field validation | ✅ PASS | Checks empty/null/undefined on submit |
| Error clear on input | ✅ PASS | Error removed when field value changes |
| Fields disabled during submit | ✅ PASS | All inputs + buttons get `disabled={submitting}` |
| Number field handling | ✅ PASS | Uses `e.target.valueAsNumber` for number type |
| min/max/step support | ✅ PASS | Passed through to `<Input>` for number fields |

### 🟡 MINOR — No Dirty State Tracking

The `CreateEntityDialog` does not track whether the user has made changes. Closing the dialog with unsaved changes does not prompt for confirmation. For the simple create flow this is acceptable, but could frustrate users who accidentally close a partially-filled form.
