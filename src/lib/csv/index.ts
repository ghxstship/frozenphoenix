/* ═══════════════════════════════════════════════════════════════
   CSV — Barrel Export
   ═══════════════════════════════════════════════════════════════ */

// Utilities
export {
    autoMapHeaders,
    csvResponse,
    downloadCsvBlob,
    escapeCsvCell,
    generateTemplateCsv,
    mapCsvRowsToRecords,
    sanitizeFilename,
    serializeCsv,
} from "./csv-utils";

// Templates
export type { CsvEntityTemplate, CsvFieldDef, CsvFieldType } from "./csv-templates";
export {
    CSV_ENTITY_TEMPLATES,
    getEntityTemplate,
    getExportableEntities,
    getExportableFields,
    getImportableEntities,
    getImportableFields,
} from "./csv-templates";

// Validator
export type { FieldError, ValidationResult } from "./csv-validator";
export {
    generateErrorReportCsv,
    validateImportRecords,
    validationSummary,
} from "./csv-validator";
