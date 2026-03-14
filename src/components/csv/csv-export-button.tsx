"use client";

import React, { useCallback, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/toast";

export interface CsvExportButtonProps {
    /** Entity name matching csv-templates registry (e.g., "companies", "deals") */
    entity: string;
    /** Optional filters to apply to the export query */
    filters?: Record<string, unknown>;
    /** Optional row limit (default: 10,000) */
    limit?: number;
    /** Button variant */
    variant?: "default" | "outline" | "ghost" | "secondary";
    /** Button size */
    size?: "default" | "sm" | "lg" | "icon";
    /** Optional custom label */
    label?: string;
    /** Optional className override */
    className?: string;
    /** Disable the button */
    disabled?: boolean;
}

export function CsvExportButton({
    entity,
    filters,
    limit,
    variant = "outline",
    size = "sm",
    label = "Export CSV",
    className,
    disabled = false,
}: CsvExportButtonProps) {
    const [exporting, setExporting] = useState(false);
    const { addToast } = useToast();

    const handleExport = useCallback(async () => {
        setExporting(true);
        try {
            const response = await fetch("/api/csv/export", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ entity, filters, limit }),
            });

            if (!response.ok) {
                const errorData = (await response.json().catch(() => null)) as {
                    error?: { message?: string };
                } | null;
                throw new Error(errorData?.error?.message ?? `Export failed (${response.status})`);
            }

            // Get the CSV content and trigger download
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

            addToast({
                title: "Export complete",
                description: `${entity.replace(/_/g, " ")} data exported successfully.`,
                variant: "success",
            });
        } catch (error) {
            addToast({
                title: "Export failed",
                description:
                    error instanceof Error ? error.message : "An unexpected error occurred",
                variant: "destructive",
            });
        } finally {
            setExporting(false);
        }
    }, [entity, filters, limit, addToast]);

    const button = (
        <Button
            variant={variant}
            size={size}
            onClick={handleExport}
            disabled={disabled || exporting}
            className={className}
            aria-label={`Export ${entity.replace(/_/g, " ")} as CSV`}
        >
            {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Download className="h-4 w-4" />
            )}
            {size !== "icon" && (exporting ? "Exporting..." : label)}
        </Button>
    );

    if (size === "icon") {
        return (
            <Tooltip content={exporting ? "Exporting..." : label} side="bottom">
                {button}
            </Tooltip>
        );
    }

    return button;
}
