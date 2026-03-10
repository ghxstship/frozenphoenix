/* ═══════════════════════════════════════════════════════════════
   CSV VALIDATOR — Row-level validation engine for CSV imports
   ═══════════════════════════════════════════════════════════════ */

import type { CsvEntityTemplate, CsvFieldDef } from "./csv-templates";
import { getImportableFields } from "./csv-templates";

// ─── Validation Result Types ───

export interface FieldError {
    row: number;
    field: string;
    header: string;
    value: string;
    message: string;
}

export interface ValidationResult {
    valid: boolean;
    totalRows: number;
    validRows: number;
    errorRows: number;
    errors: FieldError[];
    /** Rows that passed validation, ready for import */
    validRecords: Record<string, unknown>[];
    /** Row indices (0-based) that failed validation */
    failedRowIndices: number[];
}

// ─── Type Validators ───

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/.+/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidDate(value: string): boolean {
    // Accept ISO 8601, YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY
    const d = new Date(value);
    if (!isNaN(d.getTime())) return true;

    // Try common formats
    const usMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value);
    if (usMatch) {
        const [, m, day, y] = usMatch;
        const parsed = new Date(`${y}-${m!.padStart(2, "0")}-${day!.padStart(2, "0")}`);
        return !isNaN(parsed.getTime());
    }
    return false;
}

function validateFieldValue(
    value: string | null | undefined,
    fieldDef: CsvFieldDef
): string | null {
    // Required check
    if (fieldDef.required && (!value || value.trim() === "")) {
        return `Required field "${fieldDef.csvHeader}" is missing`;
    }

    // Skip further validation for empty optional fields
    if (!value || value.trim() === "") return null;

    const trimmed = value.trim();

    switch (fieldDef.type) {
        case "number": {
            const num = Number(trimmed);
            if (isNaN(num)) return `"${fieldDef.csvHeader}" must be a number, got "${trimmed}"`;
            break;
        }
        case "boolean": {
            const lower = trimmed.toLowerCase();
            if (!["true", "false", "yes", "no", "1", "0"].includes(lower)) {
                return `"${fieldDef.csvHeader}" must be true/false/yes/no, got "${trimmed}"`;
            }
            break;
        }
        case "date": {
            if (!isValidDate(trimmed)) {
                return `"${fieldDef.csvHeader}" must be a valid date, got "${trimmed}"`;
            }
            break;
        }
        case "enum": {
            if (fieldDef.enumValues && !fieldDef.enumValues.includes(trimmed)) {
                return `"${fieldDef.csvHeader}" must be one of [${fieldDef.enumValues.join(", ")}], got "${trimmed}"`;
            }
            break;
        }
        case "email": {
            if (!EMAIL_RE.test(trimmed)) {
                return `"${fieldDef.csvHeader}" must be a valid email, got "${trimmed}"`;
            }
            break;
        }
        case "url": {
            if (!URL_RE.test(trimmed)) {
                return `"${fieldDef.csvHeader}" must be a valid URL (https://...), got "${trimmed}"`;
            }
            break;
        }
        case "uuid": {
            if (!UUID_RE.test(trimmed)) {
                return `"${fieldDef.csvHeader}" must be a valid UUID, got "${trimmed}"`;
            }
            break;
        }
        // string and json pass through
    }

    return null;
}

/**
 * Coerce a raw string value to the appropriate JS type for DB insertion.
 */
function coerceValue(value: string | null | undefined, fieldDef: CsvFieldDef): unknown {
    if (!value || value.trim() === "") return null;
    const trimmed = value.trim();

    switch (fieldDef.type) {
        case "number":
            return Number(trimmed);
        case "boolean": {
            const lower = trimmed.toLowerCase();
            return lower === "true" || lower === "yes" || lower === "1";
        }
        case "date": {
            // Attempt ISO parse; if it looks like a US date, convert
            const usMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
            if (usMatch) {
                const [, m, d, y] = usMatch;
                return `${y}-${m!.padStart(2, "0")}-${d!.padStart(2, "0")}`;
            }
            return trimmed;
        }
        case "json":
            try {
                return JSON.parse(trimmed);
            } catch {
                return trimmed;
            }
        default:
            return trimmed;
    }
}

/**
 * Validate an array of mapped records against an entity template.
 *
 * @param records - Array of { dbColumn: value } records from CSV mapping
 * @param template - Entity template with field definitions
 * @returns Validation result with valid records and error details
 */
export function validateImportRecords(
    records: Record<string, unknown>[],
    template: CsvEntityTemplate
): ValidationResult {
    const importableFields = getImportableFields(template);
    const fieldMap = new Map<string, CsvFieldDef>();
    for (const f of importableFields) {
        fieldMap.set(f.dbColumn, f);
    }

    const errors: FieldError[] = [];
    const validRecords: Record<string, unknown>[] = [];
    const failedRowIndices: number[] = [];

    for (let i = 0; i < records.length; i++) {
        const record = records[i]!;
        let rowValid = true;
        const coercedRecord: Record<string, unknown> = {};

        for (const [dbColumn, fieldDef] of fieldMap) {
            const rawValue = record[dbColumn] as string | null | undefined;
            const error = validateFieldValue(rawValue, fieldDef);

            if (error) {
                errors.push({
                    row: i + 1,
                    field: dbColumn,
                    header: fieldDef.csvHeader,
                    value: String(rawValue ?? ""),
                    message: error,
                });
                rowValid = false;
            } else {
                coercedRecord[dbColumn] = coerceValue(rawValue, fieldDef);
            }
        }

        if (rowValid) {
            validRecords.push(coercedRecord);
        } else {
            failedRowIndices.push(i);
        }
    }

    return {
        valid: errors.length === 0,
        totalRows: records.length,
        validRows: validRecords.length,
        errorRows: failedRowIndices.length,
        errors,
        validRecords,
        failedRowIndices,
    };
}

/**
 * Generate a CSV error report from validation errors.
 */
export function generateErrorReportCsv(errors: FieldError[]): string {
    const headers = ["Row", "Field", "Header", "Value", "Error"];
    const lines = [
        headers.join(","),
        ...errors.map((e) =>
            [
                String(e.row),
                e.field,
                `"${e.header.replace(/"/g, '""')}"`,
                `"${e.value.replace(/"/g, '""')}"`,
                `"${e.message.replace(/"/g, '""')}"`,
            ].join(",")
        ),
    ];
    return lines.join("\r\n");
}

/**
 * Quick summary string for validation result.
 */
export function validationSummary(result: ValidationResult): string {
    if (result.valid) {
        return `All ${result.totalRows} rows are valid and ready for import.`;
    }
    return `${result.validRows} of ${result.totalRows} rows valid. ${result.errorRows} rows have errors (${result.errors.length} total issues).`;
}
