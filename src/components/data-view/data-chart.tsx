"use client";

/* ═══════════════════════════════════════════════════════════════
   DATA CHART — SVG-based chart view for list data aggregation

   Renders bar, pie, or donut charts from record data. Aggregates
   records by a category key, counts or sums values, and renders
   interactive SVG. Zero external dependencies.
   ═══════════════════════════════════════════════════════════════ */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";
import { useReducedMotion } from "@/hooks/use-media-query";

// ─── Types ───

export interface ChartSegment {
    label: string;
    value: number;
    color: string;
}

interface DataChartProps {
    segments: ChartSegment[];
    type: "bar" | "pie" | "donut";
    className?: string;
    height?: number;
}

// ─── Color Palette (re-exported from shared module) ───

export { getChartColor } from "./chart-colors";

// ─── Bar Chart ───

function BarChart({ segments, height = 240 }: { segments: ChartSegment[]; height: number }) {
    const reducedMotion = useReducedMotion();
    const maxValue = Math.max(...segments.map((s) => s.value), 1);
    const barWidth = Math.min(48, Math.max(20, 400 / segments.length));
    const gap = Math.min(12, Math.max(4, 200 / segments.length));

    return (
        <div className="flex flex-col items-center">
            <svg
                width={segments.length * (barWidth + gap) + gap}
                height={height + 40}
                role="img"
                aria-label="Bar chart"
                className="overflow-visible"
            >
                {/* Y-axis grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                    const y = height - pct * height;
                    return (
                        <g key={pct}>
                            <line
                                x1={0}
                                y1={y}
                                x2={segments.length * (barWidth + gap) + gap}
                                y2={y}
                                stroke="currentColor"
                                strokeWidth="0.5"
                                className="text-border/40"
                            />
                            <text
                                x={-4}
                                y={y + 3}
                                textAnchor="end"
                                className="fill-muted-foreground"
                                fontSize="9"
                            >
                                {Math.round(maxValue * pct)}
                            </text>
                        </g>
                    );
                })}

                {/* Bars */}
                {segments.map((seg, i) => {
                    const barHeight = (seg.value / maxValue) * height;
                    const x = gap + i * (barWidth + gap);
                    const y = height - barHeight;

                    return (
                        <g key={seg.label}>
                            <Tooltip
                                content={`${seg.label}: ${seg.value.toLocaleString()}`}
                                side="top"
                            >
                                <rect
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={barHeight}
                                    rx={3}
                                    fill={seg.color}
                                    className="transition-opacity hover:opacity-80"
                                    role="graphics-symbol"
                                    aria-label={`${seg.label}: ${seg.value}`}
                                    {...(!reducedMotion && {
                                        style: {
                                            transformOrigin: `${x + barWidth / 2}px ${height}px`,
                                            animation: `scaleIn 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms both`,
                                        },
                                    })}
                                />
                            </Tooltip>
                            {/* X-axis label */}
                            <text
                                x={x + barWidth / 2}
                                y={height + 16}
                                textAnchor="middle"
                                className="fill-muted-foreground"
                                fontSize="9"
                            >
                                {seg.label.length > 8
                                    ? seg.label.slice(0, 7) + "\u2026"
                                    : seg.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

// ─── Pie / Donut Chart ───

function PieChart({
    segments,
    height = 240,
    donut = false,
}: {
    segments: ChartSegment[];
    height: number;
    donut: boolean;
}) {
    const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
    const size = height;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 8;
    const innerRadius = donut ? radius * 0.55 : 0;

    // Pre-compute cumulative angles to avoid mutable reassignment in render
    const angleOffsets = segments.reduce<number[]>((acc, seg, i) => {
        const prevEnd =
            i === 0 ? -Math.PI / 2 : acc[i - 1]! + (segments[i - 1]!.value / total) * 2 * Math.PI;
        acc.push(prevEnd);
        return acc;
    }, []);

    const slices = segments.map((seg, i) => {
        const angle = (seg.value / total) * 2 * Math.PI;
        const startAngle = angleOffsets[i]!;
        const endAngle = startAngle + angle;

        const largeArc = angle > Math.PI ? 1 : 0;

        const x1 = cx + radius * Math.cos(startAngle);
        const y1 = cy + radius * Math.sin(startAngle);
        const x2 = cx + radius * Math.cos(endAngle);
        const y2 = cy + radius * Math.sin(endAngle);

        let path: string;
        if (innerRadius > 0) {
            const ix1 = cx + innerRadius * Math.cos(startAngle);
            const iy1 = cy + innerRadius * Math.sin(startAngle);
            const ix2 = cx + innerRadius * Math.cos(endAngle);
            const iy2 = cy + innerRadius * Math.sin(endAngle);
            path = [
                `M ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                `L ${ix2} ${iy2}`,
                `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}`,
                "Z",
            ].join(" ");
        } else {
            path = [
                `M ${cx} ${cy}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                "Z",
            ].join(" ");
        }

        const percent = ((seg.value / total) * 100).toFixed(1);

        return { ...seg, path, percent };
    });

    return (
        <div className="flex items-center gap-6 flex-wrap justify-center">
            <svg
                width={size}
                height={size}
                role="img"
                aria-label={donut ? "Donut chart" : "Pie chart"}
            >
                {slices.map((slice) => (
                    <Tooltip
                        key={slice.label}
                        content={`${slice.label}: ${slice.value.toLocaleString()} (${slice.percent}%)`}
                        side="top"
                    >
                        <path
                            d={slice.path}
                            fill={slice.color}
                            className="transition-opacity hover:opacity-80"
                            stroke="hsl(var(--background))"
                            strokeWidth="1.5"
                            role="graphics-symbol"
                            aria-label={`${slice.label}: ${slice.value}`}
                        />
                    </Tooltip>
                ))}
                {/* Center label for donut */}
                {donut && (
                    <text
                        x={cx}
                        y={cy}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="fill-foreground font-semibold"
                        fontSize="16"
                    >
                        {total.toLocaleString()}
                    </text>
                )}
            </svg>

            {/* Legend */}
            <div className="flex flex-col gap-1.5">
                {slices.map((slice) => (
                    <div key={slice.label} className="flex items-center gap-2 text-xs">
                        <span
                            className="h-2.5 w-2.5 rounded-sm shrink-0"
                            style={{ backgroundColor: slice.color }}
                        />
                        <span className="text-muted-foreground">{slice.label}</span>
                        <span className="font-medium tabular-nums ml-auto">
                            {slice.value.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Main Component ───

export function DataChart({ segments, type, className, height = 240 }: DataChartProps) {
    if (segments.length === 0) {
        return (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
                No data to chart
            </div>
        );
    }

    return (
        <div className={cn("py-4", className)}>
            {type === "bar" && <BarChart segments={segments} height={height} />}
            {type === "pie" && <PieChart segments={segments} height={height} donut={false} />}
            {type === "donut" && <PieChart segments={segments} height={height} donut={true} />}
        </div>
    );
}

DataChart.displayName = "DataChart";
