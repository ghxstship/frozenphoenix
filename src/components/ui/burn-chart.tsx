"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface BurnChartPoint {
    label: string;
    planned: number;
    actual: number;
    forecast?: number;
}

interface BurnChartProps {
    data: BurnChartPoint[];
    budgetTotal: number;
    formatValue?: (value: number) => string;
    className?: string;
    height?: number;
}

export function BurnChart({
    data,
    budgetTotal,
    formatValue = (v) => v.toLocaleString(),
    className,
    height = 200,
}: BurnChartProps) {
    if (data.length === 0) return null;

    const maxVal = Math.max(
        budgetTotal,
        ...data.map((d) => Math.max(d.planned, d.actual, d.forecast ?? 0))
    );
    const padding = { top: 20, right: 16, bottom: 32, left: 8 };
    const chartW = 100;
    const chartH = height;
    const innerW = chartW - padding.left - padding.right;
    const innerH = chartH - padding.top - padding.bottom;

    const toX = (i: number) => padding.left + (i / Math.max(data.length - 1, 1)) * innerW;
    const toY = (v: number) => padding.top + innerH - (v / (maxVal || 1)) * innerH;

    const makePath = (key: "planned" | "actual" | "forecast") => {
        const points = data
            .map((d, i) => {
                const val = key === "forecast" ? d.forecast : d[key];
                if (val === undefined || val === null) return null;
                return `${i === 0 ? "M" : "L"} ${toX(i).toFixed(2)} ${toY(val).toFixed(2)}`;
            })
            .filter(Boolean);
        return points.join(" ");
    };

    const budgetY = toY(budgetTotal);

    const lastActual = data.findLast((d) => d.actual > 0);
    const burnPercent = lastActual ? (lastActual.actual / budgetTotal) * 100 : 0;
    const burnColor =
        burnPercent >= 90
            ? "text-destructive"
            : burnPercent >= 70
              ? "text-warning"
              : "text-success";

    return (
        <div className={cn("space-y-3", className)}>
            <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                        <span className="h-0.5 w-4 bg-muted-foreground inline-block rounded" />
                        Planned
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="h-0.5 w-4 bg-primary inline-block rounded" />
                        Actual
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span
                            className="h-0.5 w-4 bg-warning inline-block rounded opacity-60"
                            style={{ borderBottom: "1px dashed" }}
                        />
                        Forecast
                    </span>
                </div>
                <span className={cn("font-semibold tabular-nums", burnColor)}>
                    {burnPercent.toFixed(0)}% burned
                </span>
            </div>

            <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="w-full"
                style={{ height }}
                role="img"
                aria-label="Budget burn chart"
            >
                {/* Budget threshold line */}
                <line
                    x1={padding.left}
                    y1={budgetY}
                    x2={chartW - padding.right}
                    y2={budgetY}
                    stroke="currentColor"
                    strokeWidth="0.3"
                    strokeDasharray="2 2"
                    className="text-destructive/40"
                />
                <text
                    x={chartW - padding.right}
                    y={budgetY - 2}
                    textAnchor="end"
                    className="text-destructive/60 fill-current"
                    fontSize="3"
                >
                    Budget: {formatValue(budgetTotal)}
                </text>

                {/* Planned line */}
                <path
                    d={makePath("planned")}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    className="text-muted-foreground/50"
                />

                {/* Actual line */}
                <path
                    d={makePath("actual")}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.8"
                    className="text-primary"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Forecast line */}
                {data.some((d) => d.forecast !== undefined) && (
                    <path
                        d={makePath("forecast")}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        strokeDasharray="1.5 1.5"
                        className="text-warning/60"
                    />
                )}

                {/* Dots for actual */}
                {data.map((d, i) =>
                    d.actual > 0 ? (
                        <circle
                            key={i}
                            cx={toX(i)}
                            cy={toY(d.actual)}
                            r="1"
                            className="fill-primary"
                        />
                    ) : null
                )}

                {/* X-axis labels */}
                {data.map((d, i) => (
                    <text
                        key={i}
                        x={toX(i)}
                        y={chartH - 4}
                        textAnchor="middle"
                        className="fill-muted-foreground"
                        fontSize="3"
                    >
                        {d.label}
                    </text>
                ))}
            </svg>
        </div>
    );
}
