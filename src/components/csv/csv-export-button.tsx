"use client";

import React, { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import dynamic from "next/dynamic";
const CsvExportDialog = dynamic(() => import("./csv-export-dialog").then((m) => m.CsvExportDialog));

export interface CsvExportButtonProps {
    /** Entity name matching csv-templates registry (e.g., "companies", "deals") */
    entity: string;
    /** Optional filters to apply to the export query */
    filters?: Record<string, unknown> | undefined; /** Optional row limit (default: 10,000) */
    limit?: number | undefined; /** Button variant */
    variant?: "default" | "outline" | "ghost" | "secondary" | undefined; /** Button size */
    size?: "default" | "sm" | "lg" | "icon" | undefined; /** Optional custom label */
    label?: string | undefined; /** Optional className override */
    className?: string | undefined; /** Disable the button */
    disabled?: boolean | undefined;
}

export function CsvExportButton({
    entity,
    filters,
    limit,
    variant = "outline",
    size = "sm",
    label = "Export",
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
            aria-label={`Export ${entity.replace(/_/g, " ")} data`}
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
