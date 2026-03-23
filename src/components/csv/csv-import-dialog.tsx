"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { csrfHeaders } from "@/lib/security/csrf";
import {
    AlertCircle,
    CheckCircle,
    Download,
    FileSpreadsheet,
    Loader2,
    Upload,
    XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { autoMapHeaders, downloadCsvBlob, mapCsvRowsToRecords } from "@/lib/csv/csv-utils";
import { getEntityTemplate, getImportableFields } from "@/lib/csv/csv-templates";
import type { CsvFieldDef } from "@/lib/csv/csv-templates";
import {
    generateErrorReportCsv,
    validateImportRecords,
    validationSummary,
} from "@/lib/csv/csv-validator";
import type { FieldError, ValidationResult } from "@/lib/csv/csv-validator";

// ─── Types ───

type ImportStep = "upload" | "mapping" | "validation" | "importing" | "result";

interface ImportResult {
    status: "completed" | "partial" | "failed";
    total_rows: number;
    imported_rows: number;
    skipped_rows?: number | undefined;
    error_rows?: number | undefined;
    errors?: FieldError[] | undefined;
}

export interface CsvImportDialogProps {
    /** Entity name matching csv-templates registry */
    entity: string;
    /** Controls dialog open state */
    open: boolean;
    /** Called when dialog should close */
    onOpenChange: (open: boolean) => void;
    /** Called after successful import to refresh data */
    onImportComplete?: (() => void) | undefined;
}

// ─── Constants ───

const MAX_PREVIEW_ROWS = 5;
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// ─── Component ───

export function CsvImportDialog({
    entity,
    open,
    onOpenChange,
    onImportComplete,
}: CsvImportDialogProps) {
    const { addToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State
    const [step, setStep] = useState<ImportStep>("upload");
    const [file, setFile] = useState<File | null>(null);
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [csvRows, setCsvRows] = useState<string[][]>([]);
    const [headerMapping, setHeaderMapping] = useState<Map<number, string>>(new Map());
    const [validation, setValidation] = useState<ValidationResult | null>(null);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [parseError, setParseError] = useState<string | null>(null);

    const template = useMemo(() => getEntityTemplate(entity), [entity]);
    const importableFields = useMemo(
        () => (template ? getImportableFields(template) : []),
        [template]
    );

    // ─── Reset ───

    const resetState = useCallback(() => {
        setStep("upload");
        setFile(null);
        setCsvHeaders([]);
        setCsvRows([]);
        setHeaderMapping(new Map());
        setValidation(null);
        setImportResult(null);
        setParseError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }, []);

    const handleClose = useCallback(() => {
        resetState();
        onOpenChange(false);
    }, [resetState, onOpenChange]);

    // ─── Step 1: Upload & Parse ───

    const handleFileSelect = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFile = e.target.files?.[0];
            if (!selectedFile) return;

            setParseError(null);

            if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
                setParseError(
                    `File exceeds ${MAX_FILE_SIZE_MB}MB limit (${(selectedFile.size / 1024 / 1024).toFixed(1)}MB).`
                );
                return;
            }

            if (!selectedFile.name.endsWith(".csv") && !selectedFile.type.includes("csv")) {
                setParseError("Please select a CSV file.");
                return;
            }

            setFile(selectedFile);

            const Papa = (await import("papaparse")).default;

            Papa.parse<string[]>(selectedFile, {
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        setParseError(
                            `CSV parse error: ${results.errors[0]?.message ?? "Unknown error"}`
                        );
                        return;
                    }

                    const allRows = results.data;
                    if (allRows.length < 2) {
                        setParseError("CSV must have at least a header row and one data row.");
                        return;
                    }

                    // Filter out comment rows (starting with #)
                    const headers = allRows[0]!;
                    const dataRows = allRows.slice(1).filter((row) => {
                        const firstCell = row[0]?.trim() ?? "";
                        return !firstCell.startsWith("#");
                    });

                    if (dataRows.length === 0) {
                        setParseError("No data rows found (only headers/comments).");
                        return;
                    }

                    setCsvHeaders(headers);
                    setCsvRows(dataRows);

                    // Auto-map headers
                    const mapping = autoMapHeaders(headers, importableFields);
                    setHeaderMapping(mapping);

                    setStep("mapping");
                },
                error: (error) => {
                    setParseError(`Failed to read file: ${error.message}`);
                },
            });
        },
        [importableFields]
    );

    const handleDownloadTemplate = useCallback(async () => {
        try {
            const response = await fetch(`/api/csv/template/${entity}`);
            if (!response.ok) throw new Error("Failed to download template");
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${entity}_import_template.csv`;
            link.click();
            URL.revokeObjectURL(url);
        } catch {
            addToast({
                title: "Download failed",
                description: "Could not download the import template.",
                variant: "destructive",
            });
        }
    }, [entity, addToast]);

    // ─── Step 2: Column Mapping ───

    const handleMappingChange = useCallback((csvIndex: number, dbColumn: string) => {
        setHeaderMapping((prev) => {
            const next = new Map(prev);
            if (dbColumn === "") {
                next.delete(csvIndex);
            } else {
                next.set(csvIndex, dbColumn);
            }
            return next;
        });
    }, []);

    const mappedDbColumns = useMemo(() => new Set(headerMapping.values()), [headerMapping]);

    const unmappedRequired = useMemo(() => {
        return importableFields.filter((f) => f.required && !mappedDbColumns.has(f.dbColumn));
    }, [importableFields, mappedDbColumns]);

    // ─── Step 3: Validate ───

    const handleValidate = useCallback(() => {
        if (!template) return;
        const records = mapCsvRowsToRecords(csvRows, headerMapping);
        const result = validateImportRecords(records, template);
        setValidation(result);
        setStep("validation");
    }, [csvRows, headerMapping, template]);

    // ─── Step 4: Import ───

    const handleImport = useCallback(async () => {
        if (!validation || validation.validRecords.length === 0) return;

        setStep("importing");

        try {
            const response = await fetch("/api/csv/import", {
                method: "POST",
                headers: csrfHeaders({ "Content-Type": "application/json" }),
                body: JSON.stringify({
                    entity,
                    rows: validation.validRecords,
                }),
            });

            const data = (await response.json()) as { data: ImportResult };
            setImportResult(data.data);
            setStep("result");

            if (data.data.status === "completed") {
                addToast({
                    title: "Import complete",
                    description: `${data.data.imported_rows} records imported successfully.`,
                    variant: "success",
                });
                onImportComplete?.();
            } else if (data.data.status === "partial") {
                addToast({
                    title: "Import partially complete",
                    description: `${data.data.imported_rows} of ${data.data.total_rows} records imported.`,
                    variant: "warning",
                });
                onImportComplete?.();
            } else {
                addToast({
                    title: "Import failed",
                    description: "No records were imported. Check the error details.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            addToast({
                title: "Import failed",
                description:
                    error instanceof Error ? error.message : "An unexpected error occurred",
                variant: "destructive",
            });
            setStep("validation");
        }
    }, [entity, validation, addToast, onImportComplete]);

    // ─── Error Report Download ───

    const handleDownloadErrors = useCallback(() => {
        const errors = validation?.errors ?? importResult?.errors ?? [];
        if (errors.length === 0) return;
        const csv = generateErrorReportCsv(errors);
        downloadCsvBlob(csv, `${entity}_import_errors.csv`);
    }, [entity, validation, importResult]);

    if (!template) return null;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent size="xl" className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        Import {template.displayName}
                    </DialogTitle>
                    <DialogDescription>{template.description}</DialogDescription>
                </DialogHeader>

                {/* Step indicator */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    {(
                        [
                            ["upload", "Upload"],
                            ["mapping", "Map Fields"],
                            ["validation", "Validate"],
                            ["result", "Result"],
                        ] as const
                    ).map(([s, label], i) => (
                        <React.Fragment key={s}>
                            {i > 0 && <div className="h-px w-4 bg-border" />}
                            <span
                                className={cn(
                                    "px-2 py-1 rounded-md",
                                    step === s || step === "importing"
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-muted-foreground"
                                )}
                            >
                                {label}
                            </span>
                        </React.Fragment>
                    ))}
                </div>

                {/* ═══ STEP: Upload ═══ */}
                {step === "upload" && (
                    <div className="density-gap-section">
                        <div
                            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    fileInputRef.current?.click();
                                }
                            }}
                            role="button"
                            tabIndex={0}
                            aria-label="Click to select a CSV file for import"
                        >
                            <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                            <p className="text-sm font-medium">Click to select a CSV file</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Maximum {MAX_FILE_SIZE_MB}MB. UTF-8 encoded.
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,text/csv"
                                onChange={handleFileSelect}
                                className="hidden"
                                aria-label="CSV file input"
                            />
                        </div>

                        {parseError && (
                            <div
                                className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                                role="alert"
                            >
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                {parseError}
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="ghost" size="sm" onClick={handleDownloadTemplate}>
                                <Download className="h-4 w-4" />
                                Download template
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {/* ═══ STEP: Mapping ═══ */}
                {step === "mapping" && (
                    <div className="density-gap-section">
                        {/* File info */}
                        <div className="flex items-center justify-between text-sm p-3 bg-secondary/50 rounded-lg">
                            <span className="font-medium">{file?.name}</span>
                            <span className="text-muted-foreground">
                                {csvRows.length} data rows
                            </span>
                        </div>

                        {/* Preview table */}
                        <div className="border rounded-lg overflow-auto max-h-40">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        {csvHeaders.map((h, i) => (
                                            <th
                                                key={i}
                                                className="px-3 py-2 text-left font-medium whitespace-nowrap"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {csvRows.slice(0, MAX_PREVIEW_ROWS).map((row, ri) => (
                                        <tr key={ri} className="border-b last:border-0">
                                            {row.map((cell, ci) => (
                                                <td
                                                    key={ci}
                                                    className="px-3 py-1.5 whitespace-nowrap max-w-[200px] truncate"
                                                >
                                                    {cell}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Column mapping */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Column mapping</h4>
                            <p className="text-xs text-muted-foreground">
                                Map each CSV column to a database field. Unmapped columns will be
                                skipped.
                            </p>
                            <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                                {csvHeaders.map((header, i) => (
                                    <MappingRow
                                        key={i}
                                        csvHeader={header}
                                        csvIndex={i}
                                        selectedDbColumn={headerMapping.get(i) ?? ""}
                                        importableFields={importableFields}
                                        usedDbColumns={mappedDbColumns}
                                        onChange={handleMappingChange}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Unmapped required fields warning */}
                        {unmappedRequired.length > 0 && (
                            <div
                                className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 text-warning text-sm"
                                role="alert"
                            >
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-medium">Required fields not mapped:</p>
                                    <p className="text-xs mt-1">
                                        {unmappedRequired.map((f) => f.csvHeader).join(", ")}
                                    </p>
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    resetState();
                                    setStep("upload");
                                }}
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleValidate}
                                disabled={headerMapping.size === 0 || unmappedRequired.length > 0}
                            >
                                Validate
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {/* ═══ STEP: Validation ═══ */}
                {step === "validation" && validation && (
                    <div className="density-gap-section">
                        {/* Summary */}
                        <div
                            className={cn(
                                "flex items-start gap-3 p-4 rounded-lg text-sm",
                                validation.valid
                                    ? "bg-success/10 text-success"
                                    : "bg-warning/10 text-warning"
                            )}
                            role="status"
                            aria-live="polite"
                        >
                            {validation.valid ? (
                                <CheckCircle className="h-5 w-5 shrink-0" />
                            ) : (
                                <AlertCircle className="h-5 w-5 shrink-0" />
                            )}
                            <div>
                                <p className="font-medium">{validationSummary(validation)}</p>
                                {validation.valid && (
                                    <p className="text-xs mt-1 opacity-80">
                                        All rows are ready for import.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Error table */}
                        {validation.errors.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium">
                                        Validation errors ({validation.errors.length})
                                    </h4>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleDownloadErrors}
                                    >
                                        <Download className="h-3 w-3" />
                                        Download error report
                                    </Button>
                                </div>
                                <div className="border rounded-lg overflow-auto max-h-48">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="px-3 py-2 text-left">Row</th>
                                                <th className="px-3 py-2 text-left">Field</th>
                                                <th className="px-3 py-2 text-left">Value</th>
                                                <th className="px-3 py-2 text-left">Error</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {validation.errors.slice(0, 50).map((err, i) => (
                                                <tr key={i} className="border-b last:border-0">
                                                    <td className="px-3 py-1.5">{err.row}</td>
                                                    <td className="px-3 py-1.5 font-medium">
                                                        {err.header}
                                                    </td>
                                                    <td className="px-3 py-1.5 max-w-[150px] truncate text-muted-foreground">
                                                        {err.value || "(empty)"}
                                                    </td>
                                                    <td className="px-3 py-1.5 text-destructive">
                                                        {err.message}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {validation.errors.length > 50 && (
                                    <p className="text-xs text-muted-foreground">
                                        Showing first 50 of {validation.errors.length} errors.
                                        Download the full report above.
                                    </p>
                                )}
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setStep("mapping")}>
                                Back
                            </Button>
                            <Button
                                onClick={handleImport}
                                disabled={validation.validRecords.length === 0}
                            >
                                Import {validation.validRecords.length} records
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {/* ═══ STEP: Importing ═══ */}
                {step === "importing" && (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                        <Loader2 className="h-8 w-8 motion-safe:animate-spin text-primary" />
                        <p className="text-sm font-medium">Importing records...</p>
                        <p className="text-xs text-muted-foreground">
                            This may take a moment for large datasets.
                        </p>
                    </div>
                )}

                {/* ═══ STEP: Result ═══ */}
                {step === "result" && importResult && (
                    <div className="density-gap-section">
                        <div
                            className={cn(
                                "flex items-start gap-3 p-4 rounded-lg text-sm",
                                importResult.status === "completed"
                                    ? "bg-success/10 text-success"
                                    : importResult.status === "partial"
                                      ? "bg-warning/10 text-warning"
                                      : "bg-destructive/10 text-destructive"
                            )}
                            role="status"
                            aria-live="polite"
                        >
                            {importResult.status === "completed" ? (
                                <CheckCircle className="h-5 w-5 shrink-0" />
                            ) : importResult.status === "partial" ? (
                                <AlertCircle className="h-5 w-5 shrink-0" />
                            ) : (
                                <XCircle className="h-5 w-5 shrink-0" />
                            )}
                            <div>
                                <p className="font-medium">
                                    {importResult.status === "completed"
                                        ? "Import completed successfully"
                                        : importResult.status === "partial"
                                          ? "Import partially completed"
                                          : "Import failed"}
                                </p>
                                <p className="text-xs mt-1 opacity-80">
                                    {importResult.imported_rows} of {importResult.total_rows}{" "}
                                    records imported.
                                    {(importResult.skipped_rows ?? 0) > 0 &&
                                        ` ${importResult.skipped_rows} skipped.`}
                                </p>
                            </div>
                        </div>

                        {importResult.errors && importResult.errors.length > 0 && (
                            <Button variant="outline" size="sm" onClick={handleDownloadErrors}>
                                <Download className="h-4 w-4" />
                                Download error report
                            </Button>
                        )}

                        <DialogFooter>
                            <Button variant="ghost" onClick={handleClose}>
                                Close
                            </Button>
                            <Button variant="outline" onClick={resetState}>
                                Import more
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

// ─── Sub-component: Mapping Row ───

interface MappingRowProps {
    csvHeader: string;
    csvIndex: number;
    selectedDbColumn: string;
    importableFields: CsvFieldDef[];
    usedDbColumns: Set<string>;
    onChange: (csvIndex: number, dbColumn: string) => void;
}

function MappingRow({
    csvHeader,
    csvIndex,
    selectedDbColumn,
    importableFields,
    usedDbColumns,
    onChange,
}: MappingRowProps) {
    const isMapped = selectedDbColumn !== "";
    const selectedField = importableFields.find((f) => f.dbColumn === selectedDbColumn);

    return (
        <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex-1 min-w-0">
                <span
                    className={cn(
                        "text-sm font-medium truncate block",
                        isMapped ? "text-foreground" : "text-muted-foreground"
                    )}
                >
                    {csvHeader}
                </span>
            </div>
            <div className="text-muted-foreground text-xs">→</div>
            <div className="flex-1 min-w-0">
                <select
                    value={selectedDbColumn}
                    onChange={(e) => onChange(csvIndex, e.target.value)}
                    className={cn(
                        "w-full text-sm rounded-md border border-input bg-background px-2 py-1.5",
                        "focus:outline-none focus:ring-2 focus:ring-ring",
                        !isMapped && "text-muted-foreground"
                    )}
                    aria-label={`Map CSV column "${csvHeader}" to a database field`}
                >
                    <option value="">Skip this column</option>
                    {importableFields.map((f) => {
                        const isUsed =
                            usedDbColumns.has(f.dbColumn) && f.dbColumn !== selectedDbColumn;
                        return (
                            <option key={f.dbColumn} value={f.dbColumn} disabled={isUsed}>
                                {f.csvHeader}
                                {f.required ? " *" : ""}
                                {isUsed ? " (already mapped)" : ""}
                            </option>
                        );
                    })}
                </select>
            </div>
            {selectedField && (
                <div className="hidden sm:block text-xs text-muted-foreground max-w-[120px] truncate">
                    {selectedField.type}
                    {selectedField.required ? " (required)" : ""}
                </div>
            )}
        </div>
    );
}
