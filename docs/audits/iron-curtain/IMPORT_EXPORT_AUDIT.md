# IRON CURTAIN — Phase 3: Import & Export Audit

> Audited: 2026-03-21 | Scope: CSV import/export infrastructure

## Executive Summary

| Classification | Count |
|---|---|
| ✅ PASS | 18 |
| 🟡 MINOR | 0 |
| 🔴 BROKEN | 0 |
| ⚫ MISSING | 0 |

---

## CSV Import — `CsvImportDialog` (720 lines)

| Test | Result | Notes |
|---|---|---|
| 5-step wizard flow | ✅ PASS | Upload → Mapping → Validation → Importing → Result |
| File size validation | ✅ PASS | 10MB limit with user-friendly error message |
| File type validation | ✅ PASS | Checks `.csv` extension and `text/csv` MIME |
| CSV header row enforcement | ✅ PASS | Requires header + at least 1 data row |
| Comment row filtering | ✅ PASS | Rows starting with `#` are excluded |
| Auto-header mapping | ✅ PASS | `autoMapHeaders()` matches CSV headers to DB fields |
| Manual column mapping UI | ✅ PASS | Dropdown per column with "already mapped" disabled state |
| Unmapped required fields warning | ✅ PASS | Alert shows missing required fields by name |
| Validation step | ✅ PASS | `validateImportRecords()` runs before import; shows per-row errors |
| Error report download | ✅ PASS | `generateErrorReportCsv()` generates downloadable CSV |
| Import with CSRF headers | ✅ PASS | `csrfHeaders()` sent with POST request |
| Result status handling | ✅ PASS | Completed/partial/failed with distinct visuals and toasts |
| State reset on close | ✅ PASS | `resetState()` clears all state including file input ref |
| Template download | ✅ PASS | Fetches from `/api/csv/template/{entity}` |
| Papaparse dynamic import | ✅ PASS | `import("papaparse")` — lazy-loaded, not in critical bundle |
| Accessibility | ✅ PASS | `role="alert"`, `role="button"`, `aria-label` on file input/drop zone |

---

## CSV Export — `CsvExportDialog` (558 lines)

| Test | Result | Notes |
|---|---|---|
| Column selection (select/deselect all) | ✅ PASS | Toggle individual, select all, deselect all |
| Preview step | ✅ PASS | Shows row count + first 5 rows before export |
| Export with filters | ✅ PASS | Active filters passed to API and displayed in configure step |
| Row limit display | ✅ PASS | Shows max rows (default 10,000), UTF-8 format |
| File download via blob | ✅ PASS | Creates and clicks hidden `<a>` with blob URL, then revokes |
| Filename from Content-Disposition | ✅ PASS | Parses `filename` from response header with fallback |
| Error handling | ✅ PASS | Catches API errors, shows toast, updates result step |
| State reset on close | ✅ PASS | Complete reset function clears all state |
| "Export again" flow | ✅ PASS | Returns to configure step preserving selected columns |

---

## Integration with ListPageShell

| Test | Result | Notes |
|---|---|---|
| Import button shown when `importable` | ✅ PASS | Auto-enabled when entity has template |
| Export button shown when `exportable` | ✅ PASS | Uses `CsvExportButton` component |
| Post-import data refresh | ✅ PASS | `onImportComplete` triggers query invalidation |
