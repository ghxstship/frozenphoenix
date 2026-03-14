"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, type LucideIcon, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { NumberTicker } from "@/components/ui/number-ticker";
import { useReducedMotion } from "@/hooks/use-media-query";

type MetricVariant = "default" | "success" | "warning" | "danger" | "info";

interface MetricCardProps {
    label: string;
    value: string | number;
    previousValue?: string | number;
    change?: number;
    changeSuffix?: string;
    icon?: LucideIcon;
    unit?: string;
    description?: string;
    variant?: MetricVariant;
    threshold?: { warning: number; danger: number };
    sparkline?: number[];
    className?: string;
}

const VARIANT_STYLES: Record<MetricVariant, string> = {
    default: "",
    success: "border-success/30 bg-success/5",
    warning: "border-warning/30 bg-warning/5",
    danger: "border-destructive/30 bg-destructive/5",
    info: "border-info/30 bg-info/5",
};

const VARIANT_ICON_STYLES: Record<MetricVariant, string> = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-destructive/10 text-destructive",
    info: "bg-info/10 text-info",
};

function resolveVariant(
    variant?: MetricVariant,
    value?: string | number,
    threshold?: { warning: number; danger: number }
): MetricVariant {
    if (variant) return variant;
    if (!threshold || typeof value !== "number") return "default";
    if (value >= threshold.danger) return "danger";
    if (value >= threshold.warning) return "warning";
    return "default";
}

function MiniSparkline({ data, className }: { data: number[]; className?: string }) {
    const reducedMotion = useReducedMotion();

    if (data.length < 2) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const h = 24;
    const w = 64;
    const step = w / (data.length - 1);

    const points = data.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`).join(" ");

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className={cn("w-16 h-6", className)} aria-hidden="true">
            <polyline
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
                {...(!reducedMotion && {
                    strokeDasharray: 200,
                    strokeDashoffset: 200,
                    style: { animation: "chartLineDraw 0.8s ease-out 0.3s forwards" },
                })}
            />
        </svg>
    );
}

export function MetricCard({
    label,
    value,
    previousValue,
    change,
    changeSuffix = "%",
    icon: Icon,
    unit,
    description,
    variant: variantProp,
    threshold,
    sparkline,
    className,
}: MetricCardProps) {
    const resolved = resolveVariant(variantProp, value, threshold);
    const isPositive = change !== undefined && change > 0;
    const isNegative = change !== undefined && change < 0;
    const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

    return (
        <div
            className={cn(
                "spatial-card p-5 motion-safe:animate-fade-in transition-colors",
                VARIANT_STYLES[resolved],
                className
            )}
            role="group"
            aria-label={`${label}: ${value}${unit ? ` ${unit}` : ""}`}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground truncate">{label}</p>
                    <div className="flex items-baseline gap-1.5">
                        <p className="text-2xl font-bold tracking-tight tabular-nums">
                            {typeof value === "number" ? <NumberTicker value={value} /> : value}
                        </p>
                        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {sparkline && <MiniSparkline data={sparkline} />}
                    {Icon && (
                        <div
                            className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center",
                                VARIANT_ICON_STYLES[resolved]
                            )}
                        >
                            {resolved === "danger" ? (
                                <AlertTriangle className="h-5 w-5" />
                            ) : (
                                <Icon className="h-5 w-5" />
                            )}
                        </div>
                    )}
                </div>
            </div>
            {(change !== undefined || description || previousValue !== undefined) && (
                <div className="mt-3 flex items-center gap-2 text-xs flex-wrap">
                    {change !== undefined && (
                        <span
                            className={cn(
                                "flex items-center gap-0.5 font-medium",
                                isPositive && "text-success",
                                isNegative && "text-destructive",
                                !isPositive && !isNegative && "text-muted-foreground"
                            )}
                        >
                            <TrendIcon className="h-3 w-3" />
                            {isPositive && "+"}
                            {Math.abs(change)}
                            {changeSuffix}
                        </span>
                    )}
                    {previousValue !== undefined && (
                        <span className="text-muted-foreground">from {previousValue}</span>
                    )}
                    {description && <span className="text-muted-foreground">{description}</span>}
                </div>
            )}
        </div>
    );
}
