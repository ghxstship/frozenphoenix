"use client";

import React, { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { CsvExportDialog } from "./csv-export-dialog";

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
    const [exportOpen, setExportOpen] = useState(false);

    const button = (
        <Button
            variant={variant}
            size={size}
            onClick={() => setExportOpen(true)}
            disabled={disabled}
            className={className}
            aria-label={`Export ${entity.replace(/_/g, " ")} as CSV`}
        >
            <Download className="h-4 w-4" />
            {size !== "icon" && label}
        </Button>
    );

    return (
        <>
            {size === "icon" ? (
                <Tooltip content={label} side="bottom">
                    {button}
                </Tooltip>
            ) : (
                button
            )}
            <CsvExportDialog
                entity={entity}
                open={exportOpen}
                onOpenChange={setExportOpen}
                filters={filters}
                limit={limit}
            />
        </>
    );
}
