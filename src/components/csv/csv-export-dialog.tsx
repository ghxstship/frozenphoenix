"use client";

import React, { useCallback, useMemo, useState } from "react";
import { AlertCircle, CheckCircle, Download, FileSpreadsheet, Loader2 } from "lucide-react";
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
import { getEntityTemplate, getExportableFields } from "@/lib/csv/csv-templates";
import type { CsvFieldDef } from "@/lib/csv/csv-templates";

// ─── Types ───

type ExportStep = "configure" | "preview" | "exporting" | "result";

interface PreviewData {
    rows: Record<string, unknown>[];
    total_count: number;
    columns: { key: string; label: string; type: string }[];
}

interface ExportResult {
    status: "completed" | "failed";
    row_count: number;
    filename: string;
}

export interface CsvExportDialogProps {
    /** Entity name matching csv-templates registry */
    entity: string;
    /** Controls dialog open state */
    open: boolean;
    /** Called when dialog should close */
    onOpenChange: (open: boolean) => void;
    /** Optional filters to apply to the export query */
    filters?: Record<string, unknown>;
    /** Optional row limit (default: 10,000) */
    limit?: number;
}

// ─── Constants ───

const MAX_PREVIEW_ROWS = 5;
const DEFAULT_LIMIT = 10_000;

// ─── Component ───

export function CsvExportDialog({
    entity,
    open,
    onOpenChange,
    filters,
    limit = DEFAULT_LIMIT,
}: CsvExportDialogProps) {
    const { addToast } = useToast();

    // State
    const [step, setStep] = useState<ExportStep>("configure");
    const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set());
    const [previewData, setPreviewData] = useState<PreviewData | null>(null);
    const [exportResult, setExportResult] = useState<ExportResult | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const template = useMemo(() => getEntityTemplate(entity), [entity]);
    const exportableFields = useMemo(
        () => (template ? getExportableFields(template) : []),
        [template]
    );

    // Initialize selected columns to all exportable fields on first open
    const initializeColumns = useCallback(() => {
        setSelectedColumns(new Set(exportableFields.map((f) => f.dbColumn)));
    }, [exportableFields]);

    // Reset all state when dialog closes
    const resetState = useCallback(() => {
        setStep("configure");
        setSelectedColumns(new Set());
        setPreviewData(null);
        setExportResult(null);
        setPreviewLoading(false);
        setError(null);
    }, []);

    const handleClose = useCallback(() => {
        resetState();
        onOpenChange(false);
    }, [resetState, onOpenChange]);

    // Initialize columns when dialog opens
    const handleOpenChange = useCallback(
        (isOpen: boolean) => {
            if (isOpen) {
                initializeColumns();
            } else {
                resetState();
            }
            onOpenChange(isOpen);
        },
        [initializeColumns, resetState, onOpenChange]
    );

    // ─── Column Selection ───

    const handleToggleColumn = useCallback((dbColumn: string) => {
        setSelectedColumns((prev) => {
            const next = new Set(prev);
            if (next.has(dbColumn)) {
                next.delete(dbColumn);
            } else {
                next.add(dbColumn);
            }
            return next;
        });
    }, []);

    const handleSelectAll = useCallback(() => {
        setSelectedColumns(new Set(exportableFields.map((f) => f.dbColumn)));
    }, [exportableFields]);

    const handleDeselectAll = useCallback(() => {
        setSelectedColumns(new Set());
    }, []);

    // ─── Step 2: Preview ───

    const handlePreview = useCallback(async () => {
        setPreviewLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/csv/export", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    entity,
                    filters,
                    limit,
                    preview: true,
                    columns: Array.from(selectedColumns),
                }),
            });

            if (!response.ok) {
                const errorData = (await response.json().catch(() => null)) as {
                    error?: { message?: string };
                } | null;
                throw new Error(errorData?.error?.message ?? `Preview failed (${response.status})`);
            }

            const result = (await response.json()) as { data: PreviewData };
            setPreviewData(result.data);
            setStep("preview");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load preview");
        } finally {
            setPreviewLoading(false);
        }
    }, [entity, filters, limit, selectedColumns]);

    // ─── Step 3: Export ───

    const handleExport = useCallback(async () => {
        setStep("exporting");
        setError(null);

        try {
            const response = await fetch("/api/csv/export", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    entity,
                    filters,
                    limit,
                    columns: Array.from(selectedColumns),
                }),
            });

            if (!response.ok) {
                const errorData = (await response.json().catch(() => null)) as {
                    error?: { message?: string };
                } | null;
                throw new Error(errorData?.error?.message ?? `Export failed (${response.status})`);
            }

            // Trigger download
            const blob = await response.blob();
            const disposition = response.headers.get("Content-Disposition");
            const filenameMatch = disposition?.match(/filename="?([^"]+)"?/);
            const filename = filenameMatch?.[1] ?? `${entity}_export.csv`;

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setExportResult({
                status: "completed",
                row_count: previewData?.total_count ?? 0,
                filename,
            });
            setStep("result");

            addToast({
                title: "Export complete",
                description: `${entity.replace(/_/g, " ")} data exported successfully.`,
                variant: "success",
            });
        } catch (err) {
            setExportResult({
                status: "failed",
                row_count: 0,
                filename: "",
            });
            setStep("result");

            addToast({
                title: "Export failed",
                description: err instanceof Error ? err.message : "An unexpected error occurred",
                variant: "destructive",
            });
        }
    }, [entity, filters, limit, selectedColumns, previewData, addToast]);

    // ─── Active filter summary ───

    const activeFilters = useMemo(() => {
        if (!filters) return [];
        return Object.entries(filters)
            .filter(([, v]) => v !== null && v !== undefined && v !== "")
            .map(([key, value]) => ({ key, value: String(value) }));
    }, [filters]);

    if (!template) return null;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent size="xl" className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        Export {template.displayName}
                    </DialogTitle>
                    <DialogDescription>{template.description}</DialogDescription>
                </DialogHeader>

                {/* Step indicator */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    {(
                        [
                            ["configure", "Configure"],
                            ["preview", "Preview"],
                            ["result", "Result"],
                        ] as const
                    ).map(([s, label], i) => (
                        <React.Fragment key={s}>
                            {i > 0 && <div className="h-px w-4 bg-border" />}
                            <span
                                className={cn(
                                    "px-2 py-1 rounded-md",
                                    step === s || step === "exporting"
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-muted-foreground"
                                )}
                            >
                                {label}
                            </span>
                        </React.Fragment>
                    ))}
                </div>

                {/* ═══ STEP: Configure ═══ */}
                {step === "configure" && (
                    <div className="space-y-4">
                        {/* Active filters summary */}
                        {activeFilters.length > 0 && (
                            <div className="flex items-center gap-2 text-sm p-3 bg-secondary/50 rounded-lg">
                                <span className="font-medium">Active filters:</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {activeFilters.map(({ key, value }) => (
                                        <span
                                            key={key}
                                            className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-md"
                                        >
                                            {key.replace(/_/g, " ")}: {value}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Column selection */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium">
                                    Columns to export ({selectedColumns.size} of{" "}
                                    {exportableFields.length})
                                </h4>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleSelectAll}
                                        disabled={selectedColumns.size === exportableFields.length}
                                    >
                                        Select all
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleDeselectAll}
                                        disabled={selectedColumns.size === 0}
                                    >
                                        Deselect all
                                    </Button>
                                </div>
                            </div>
                            <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                                {exportableFields.map((field) => (
                                    <ColumnRow
                                        key={field.dbColumn}
                                        field={field}
                                        selected={selectedColumns.has(field.dbColumn)}
                                        onToggle={handleToggleColumn}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Export settings */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground p-3 bg-secondary/50 rounded-lg">
                            <span>
                                Format:{" "}
                                <span className="font-medium text-foreground">CSV (UTF-8)</span>
                            </span>
                            <span>
                                Max rows:{" "}
                                <span className="font-medium text-foreground">
                                    {limit.toLocaleString()}
                                </span>
                            </span>
                        </div>

                        {error && (
                            <div
                                className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                                role="alert"
                            >
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                {error}
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="ghost" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handlePreview}
                                disabled={selectedColumns.size === 0 || previewLoading}
                            >
                                {previewLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading preview...
                                    </>
                                ) : (
                                    "Preview"
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {/* ═══ STEP: Preview ═══ */}
                {step === "preview" && previewData && (
                    <div className="space-y-4">
                        {/* Summary */}
                        <div
                            className="flex items-center justify-between text-sm p-3 bg-secondary/50 rounded-lg"
                            role="status"
                        >
                            <span>
                                <span className="font-medium">
                                    {previewData.total_count.toLocaleString()}
                                </span>{" "}
                                rows will be exported
                            </span>
                            <span className="text-muted-foreground">
                                {previewData.columns.length} columns selected
                            </span>
                        </div>

                        {/* Preview table */}
                        <div className="border rounded-lg overflow-auto max-h-60">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        {previewData.columns.map((col) => (
                                            <th
                                                key={col.key}
                                                className="px-3 py-2 text-left font-medium whitespace-nowrap"
                                            >
                                                {col.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.rows.slice(0, MAX_PREVIEW_ROWS).map((row, ri) => (
                                        <tr key={ri} className="border-b last:border-0">
                                            {previewData.columns.map((col) => (
                                                <td
                                                    key={col.key}
                                                    className="px-3 py-1.5 whitespace-nowrap max-w-[200px] truncate"
                                                >
                                                    {row[col.key] != null
                                                        ? String(row[col.key])
                                                        : ""}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {previewData.total_count > MAX_PREVIEW_ROWS && (
                            <p className="text-xs text-muted-foreground">
                                Showing first {Math.min(previewData.rows.length, MAX_PREVIEW_ROWS)}{" "}
                                of {previewData.total_count.toLocaleString()} rows.
                            </p>
                        )}

                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setStep("configure")}>
                                Back
                            </Button>
                            <Button onClick={handleExport}>
                                <Download className="h-4 w-4" />
                                Export {previewData.total_count.toLocaleString()} rows
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {/* ═══ STEP: Exporting ═══ */}
                {step === "exporting" && (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm font-medium">Exporting records...</p>
                        <p className="text-xs text-muted-foreground">
                            This may take a moment for large datasets.
                        </p>
                    </div>
                )}

                {/* ═══ STEP: Result ═══ */}
                {step === "result" && exportResult && (
                    <div className="space-y-4">
                        <div
                            className={cn(
                                "flex items-start gap-3 p-4 rounded-lg text-sm",
                                exportResult.status === "completed"
                                    ? "bg-success/10 text-success"
                                    : "bg-destructive/10 text-destructive"
                            )}
                            role="status"
                            aria-live="polite"
                        >
                            {exportResult.status === "completed" ? (
                                <CheckCircle className="h-5 w-5 shrink-0" />
                            ) : (
                                <AlertCircle className="h-5 w-5 shrink-0" />
                            )}
                            <div>
                                <p className="font-medium">
                                    {exportResult.status === "completed"
                                        ? "Export completed successfully"
                                        : "Export failed"}
                                </p>
                                {exportResult.status === "completed" && (
                                    <p className="text-xs mt-1 opacity-80">
                                        {exportResult.row_count.toLocaleString()} rows exported to{" "}
                                        {exportResult.filename}
                                    </p>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="ghost" onClick={handleClose}>
                                Close
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setStep("configure");
                                    setPreviewData(null);
                                    setExportResult(null);
                                    setError(null);
                                }}
                            >
                                Export again
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

// ─── Sub-component: Column Row ───

interface ColumnRowProps {
    field: CsvFieldDef;
    selected: boolean;
    onToggle: (dbColumn: string) => void;
}

function ColumnRow({ field, selected, onToggle }: ColumnRowProps) {
    return (
        <label
            className={cn(
                "flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors",
                selected ? "text-foreground" : "text-muted-foreground"
            )}
        >
            <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggle(field.dbColumn)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                aria-label={`Include ${field.csvHeader} column`}
            />
            <div className="flex-1 min-w-0">
                <span className="text-sm font-medium block truncate">{field.csvHeader}</span>
            </div>
            <span className="text-xs text-muted-foreground hidden sm:block">{field.type}</span>
        </label>
    );
}
