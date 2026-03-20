"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const progressBarVariants = cva("relative w-full overflow-hidden rounded-full bg-muted", {
    variants: {
        size: {
            xs: "h-1",
            sm: "h-1.5",
            md: "h-2",
            lg: "h-3",
            xl: "h-4",
        },
        variant: {
            default: "",
            success: "",
            warning: "",
            destructive: "",
            info: "",
        },
    },
    defaultVariants: { size: "md", variant: "default" },
});

const progressFillVariants = cva("h-full rounded-full transition-all duration-300 ease-out", {
    variants: {
        variant: {
            default: "bg-primary",
            success: "bg-success",
            warning: "bg-warning",
            destructive: "bg-destructive",
            info: "bg-info",
        },
        animated: {
            true: "motion-safe:animate-progress-fill",
            false: "",
        },
    },
    defaultVariants: { variant: "default", animated: false },
});

export interface ProgressBarProps
    extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof progressBarVariants> {
    value: number;
    max?: number;
    showLabel?: boolean;
    labelPosition?: "right" | "inside" | "above";
    formatLabel?: (value: number, max: number) => string;
    animated?: boolean;
}

export function ProgressBar({
    value,
    max = 100,
    size = "md",
    variant = "default",
    showLabel = false,
    labelPosition = "right",
    formatLabel,
    animated = false,
    className,
    ...props
}: ProgressBarProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const label = formatLabel ? formatLabel(value, max) : `${Math.round(percentage)}%`;

    const autoVariant =
        variant === "default"
            ? percentage >= 90
                ? "destructive"
                : percentage >= 70
                  ? "warning"
                  : "default"
            : variant;

    return (
        <div
            className={cn(
                "flex items-center gap-2",
                labelPosition === "above" && "flex-col items-start gap-1",
                className
            )}
            {...props}
        >
            {showLabel && labelPosition === "above" && (
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
            )}
            <div
                className={cn(progressBarVariants({ size, variant }))}
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={max}
                aria-label={label}
            >
                <div
                    className={cn(
                        progressFillVariants({
                            variant: autoVariant,
                            animated,
                        })
                    )}
                    style={{ width: `${percentage}%` }}
                >
                    {showLabel && labelPosition === "inside" && size !== "xs" && size !== "sm" && (
                        <span className="absolute inset-0 flex items-center justify-center density-caption font-bold text-primary-foreground">
                            {label}
                        </span>
                    )}
                </div>
            </div>
            {showLabel && labelPosition === "right" && (
                <span className="text-xs font-medium text-muted-foreground shrink-0 tabular-nums">
                    {label}
                </span>
            )}
        </div>
    );
}
