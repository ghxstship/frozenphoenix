"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface HeatmapRow {
    id: string;
    label: string;
    sublabel?: string;
    avatar?: string;
    cells: HeatmapCell[];
}

interface HeatmapCell {
    value: number;
    label?: string;
    tooltip?: string;
}

interface HeatmapGridProps {
    rows: HeatmapRow[];
    columnLabels: string[];
    maxValue?: number;
    formatValue?: (value: number) => string;
    colorScale?: "utilization" | "heat" | "divergent";
    emptyLabel?: string;
    className?: string;
    onCellClick?: (rowId: string, colIndex: number) => void;
}

function getUtilizationColor(percent: number): string {
    if (percent === 0) return "bg-muted/30";
    if (percent < 50) return "bg-info/20 text-info";
    if (percent < 70) return "bg-info/40 text-info";
    if (percent < 85) return "bg-success/40 text-success";
    if (percent < 100) return "bg-success/60 text-success-foreground";
    if (percent === 100) return "bg-primary/60 text-primary-foreground";
    return "bg-destructive/60 text-destructive-foreground";
}

function getHeatColor(percent: number): string {
    if (percent === 0) return "bg-muted/30";
    if (percent < 25) return "bg-info/20";
    if (percent < 50) return "bg-info/40";
    if (percent < 75) return "bg-warning/40";
    return "bg-destructive/50";
}

function getDivergentColor(percent: number): string {
    if (percent < -25) return "bg-destructive/40";
    if (percent < 0) return "bg-destructive/20";
    if (percent === 0) return "bg-muted/30";
    if (percent < 25) return "bg-success/20";
    return "bg-success/40";
}

function getColor(value: number, max: number, scale: HeatmapGridProps["colorScale"]): string {
    const percent = max > 0 ? (value / max) * 100 : 0;
    switch (scale) {
        case "heat":
            return getHeatColor(percent);
        case "divergent":
            return getDivergentColor(value);
        case "utilization":
        default:
            return getUtilizationColor(percent);
    }
}

export function HeatmapGrid({
    rows,
    columnLabels,
    maxValue = 100,
    formatValue = (v) => (v > 0 ? `${v}` : ""),
    colorScale = "utilization",
    emptyLabel = "\u2014",
    className,
    onCellClick,
}: HeatmapGridProps) {
    return (
        <div className={cn("overflow-x-auto", className)}>
            <table className="w-full min-w-[700px]" role="grid" aria-label={`${colorScale === "heat" ? "Heat" : colorScale === "divergent" ? "Divergent" : "Utilization"} heatmap`}>
                <thead>
                    <tr className="border-b border-border">
                        <th className="text-left p-3 text-xs font-semibold text-muted-foreground w-48 sticky left-0 bg-background z-10">
                            Resource
                        </th>
                        {columnLabels.map((label) => (
                            <th
                                key={label}
                                className="text-center p-2 text-xs font-semibold text-muted-foreground min-w-[60px]"
                            >
                                {label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr
                            key={row.id}
                            className="border-b border-border/30 hover:bg-secondary/10"
                        >
                            <td className="p-3 sticky left-0 bg-background z-10">
                                <div className="flex items-center gap-2">
                                    {row.avatar && (
                                        <Image
                                            src={row.avatar}
                                            alt=""
                                            width={24}
                                            height={24}
                                            className="h-6 w-6 rounded-full object-cover"
                                        />
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium truncate">{row.label}</p>
                                        {row.sublabel && (
                                            <p className="text-[10px] text-muted-foreground truncate">
                                                {row.sublabel}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </td>
                            {row.cells.map((cell, colIdx) => {
                                const colorClass = getColor(cell.value, maxValue, colorScale);
                                return (
                                    <td key={colIdx} className="p-1">
                                        <button
                                            type="button"
                                            className={cn(
                                                "w-full h-10 rounded-md flex items-center justify-center text-[10px] font-medium tabular-nums transition-colors",
                                                colorClass,
                                                onCellClick &&
                                                    "cursor-pointer hover:ring-2 hover:ring-primary/30",
                                                !onCellClick && "cursor-default"
                                            )}
                                            title={cell.tooltip ?? `${row.label}: ${cell.value}`}
                                            aria-label={
                                                cell.tooltip ??
                                                `${row.label}, ${columnLabels[colIdx]}: ${cell.value}`
                                            }
                                            onClick={() => onCellClick?.(row.id, colIdx)}
                                            tabIndex={onCellClick ? 0 : -1}
                                        >
                                            {cell.value > 0 ? formatValue(cell.value) : emptyLabel}
                                        </button>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Legend */}
            {colorScale === "utilization" && (
                <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground px-3">
                    <span>Utilization:</span>
                    <span className="flex items-center gap-1">
                        <span className="h-3 w-3 rounded bg-muted/30" /> 0%
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="h-3 w-3 rounded bg-info/30" /> &lt;70%
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="h-3 w-3 rounded bg-success/50" /> 70-99%
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="h-3 w-3 rounded bg-primary/60" /> 100%
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="h-3 w-3 rounded bg-destructive/60" /> Over
                    </span>
                </div>
            )}
        </div>
    );
}
