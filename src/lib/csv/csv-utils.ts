/* ═══════════════════════════════════════════════════════════════
   CSV UTILITIES — RFC 4180 compliant CSV serialization & parsing
   ═══════════════════════════════════════════════════════════════ */

/**
 * Escape a single CSV cell value per RFC 4180.
 * - Wraps in double quotes if the value contains comma, quote, or newline
 * - Escapes internal double quotes by doubling them
 */
export function escapeCsvCell(value: unknown): string {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

/**
 * Serialize an array of objects into a RFC 4180 CSV string.
 * @param rows - Array of record objects
 * @param headers - Ordered array of { key, label } for columns
 * @returns CSV string with CRLF line endings
 */
export function serializeCsv(
    rows: Record<string, unknown>[],
    headers: { key: string; label: string }[]
): string {
    const headerLine = headers.map((h) => escapeCsvCell(h.label)).join(",");
    const dataLines = rows.map((row) => headers.map((h) => escapeCsvCell(row[h.key])).join(","));
    return [headerLine, ...dataLines].join("\r\n");
}

/**
 * Generate a template CSV with headers, a description row, and example rows.
 * @param headers - Column definitions
 * @param examples - Example data rows
 * @param descriptions - Field description row (shown as commented row)
 */
export function generateTemplateCsv(
    headers: { key: string; label: string; description?: string; example?: string }[],
    examples?: Record<string, string>[]
): string {
    const headerLine = headers.map((h) => escapeCsvCell(h.label)).join(",");

    // Description row (prefixed with # for clarity)
    const descLine = headers.map((h) => escapeCsvCell(h.description ?? "")).join(",");

    const lines = [headerLine, `# ${descLine}`];

    if (examples) {
        for (const ex of examples) {
            lines.push(headers.map((h) => escapeCsvCell(ex[h.key] ?? h.example ?? "")).join(","));
        }
    } else {
        // Generate single example row from header definitions
        lines.push(headers.map((h) => escapeCsvCell(h.example ?? "")).join(","));
    }

    return lines.join("\r\n");
}

/**
 * Create a downloadable CSV Blob response.
 */
export function csvResponse(csv: string, filename: string): Response {
    // Add UTF-8 BOM for Excel compatibility
    const bom = "\uFEFF";
    return new Response(bom + csv, {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${sanitizeFilename(filename)}"`,
        },
    });
}

/**
 * Sanitize a filename for Content-Disposition header.
 */
export function sanitizeFilename(name: string): string {
    return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
}

/**
 * Trigger a CSV file download in the browser.
 */
export function downloadCsvBlob(csvContent: string, filename: string): void {
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = sanitizeFilename(filename);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Parse a header row and attempt to fuzzy-match against known field labels.
 * Returns a mapping of csvHeaderIndex → dbColumn.
 */
export function autoMapHeaders(
    csvHeaders: string[],
    templateFields: { dbColumn: string; csvHeader: string }[]
): Map<number, string> {
    const mapping = new Map<number, string>();
    const usedDbColumns = new Set<string>();
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

    for (let i = 0; i < csvHeaders.length; i++) {
        const normalized = normalize(csvHeaders[i] ?? "");

        // Exact match on normalized csvHeader
        const exactMatch = templateFields.find(
            (f) => normalize(f.csvHeader) === normalized && !usedDbColumns.has(f.dbColumn)
        );
        if (exactMatch) {
            mapping.set(i, exactMatch.dbColumn);
            usedDbColumns.add(exactMatch.dbColumn);
            continue;
        }

        // Exact match on dbColumn (snake_case)
        const colMatch = templateFields.find(
            (f) => normalize(f.dbColumn) === normalized && !usedDbColumns.has(f.dbColumn)
        );
        if (colMatch) {
            mapping.set(i, colMatch.dbColumn);
            usedDbColumns.add(colMatch.dbColumn);
            continue;
        }

        // Fuzzy: check if csvHeader contains the db column words
        const fuzzyMatch = templateFields.find((f) => {
            const words = f.dbColumn.split("_");
            return words.every((w) => normalized.includes(w)) && !usedDbColumns.has(f.dbColumn);
        });
        if (fuzzyMatch) {
            mapping.set(i, fuzzyMatch.dbColumn);
            usedDbColumns.add(fuzzyMatch.dbColumn);
        }
    }

    return mapping;
}

/**
 * Convert mapped CSV rows into DB-ready records.
 */
export function mapCsvRowsToRecords(
    rows: string[][],
    headerMapping: Map<number, string>
): Record<string, unknown>[] {
    return rows.map((row) => {
        const record: Record<string, unknown> = {};
        for (const [colIndex, dbColumn] of headerMapping.entries()) {
            const value = row[colIndex]?.trim();
            record[dbColumn] = value === "" ? null : value;
        }
        return record;
    });
}
