"use client";

import React from "react";
import { cn } from "@/lib/utils";

function ShimmerBlock({ className }: { className?: string }) {
    return <div className={cn("animate-shimmer bg-muted rounded-lg", className)} />;
}

export interface LoadingStateProps {
    variant?: "page" | "card" | "list" | "table";
    rows?: number;
    className?: string;
}

export function LoadingState({ variant = "page", rows = 3, className }: LoadingStateProps) {
    if (variant === "page") {
        return (
            <div
                className={cn("density-gap-page", className)}
                role="status"
                aria-busy="true"
                aria-label="Loading content"
            >
                <div className="space-y-3">
                    <ShimmerBlock className="h-8 w-56 rounded-lg" />
                    <ShimmerBlock className="h-4 w-80 rounded" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 density-gap-card">
                    {[...Array(4)].map((_, i) => (
                        <ShimmerBlock key={i} className="h-24 rounded-xl" />
                    ))}
                </div>
                <ShimmerBlock className="h-64 rounded-xl" />
                <span className="sr-only">Loading...</span>
            </div>
        );
    }

    if (variant === "card") {
        return (
            <div
                className={cn("space-y-3", className)}
                role="status"
                aria-busy="true"
                aria-label="Loading card"
            >
                <ShimmerBlock className="h-40 rounded-xl" />
                <ShimmerBlock className="h-4 w-3/4 rounded" />
                <ShimmerBlock className="h-3 w-1/2 rounded" />
                <span className="sr-only">Loading...</span>
            </div>
        );
    }

    if (variant === "list") {
        return (
            <div
                className={cn("space-y-3", className)}
                role="status"
                aria-busy="true"
                aria-label="Loading list"
            >
                {[...Array(rows)].map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-4 p-4 rounded-xl border border-border/30"
                    >
                        <ShimmerBlock className="h-10 w-10 rounded-full shrink-0" />
                        <div className="flex-1 space-y-2">
                            <ShimmerBlock className="h-4 w-48 rounded" />
                            <ShimmerBlock className="h-3 w-32 rounded" />
                        </div>
                        <ShimmerBlock className="h-6 w-16 rounded-full shrink-0" />
                    </div>
                ))}
                <span className="sr-only">Loading...</span>
            </div>
        );
    }

    if (variant === "table") {
        return (
            <div
                className={cn("rounded-lg border border-border overflow-hidden", className)}
                role="status"
                aria-busy="true"
                aria-label="Loading table"
            >
                <div className="flex gap-4 p-4 bg-muted/30 border-b border-border">
                    {[...Array(5)].map((_, i) => (
                        <ShimmerBlock key={i} className="h-3 flex-1 rounded" />
                    ))}
                </div>
                {[...Array(rows)].map((_, i) => (
                    <div
                        key={i}
                        className="flex gap-4 p-4 border-b border-border/30 last:border-b-0"
                    >
                        <ShimmerBlock className="h-4 w-8 rounded shrink-0" />
                        {[...Array(4)].map((_, j) => (
                            <ShimmerBlock key={j} className="h-4 flex-1 rounded" />
                        ))}
                    </div>
                ))}
                <span className="sr-only">Loading...</span>
            </div>
        );
    }

    return null;
}

export function Skeleton({ className }: { className?: string }) {
    return <div className={cn("animate-shimmer bg-muted rounded", className)} aria-hidden="true" />;
}
