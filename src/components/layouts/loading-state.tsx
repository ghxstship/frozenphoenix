"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface LoadingStateProps {
    variant?: "page" | "card" | "list" | "table";
    rows?: number;
    className?: string;
}

export function LoadingState({
    variant = "page",
    rows = 3,
    className,
}: LoadingStateProps) {
    if (variant === "page") {
        return (
            <div className={cn("space-y-6 animate-pulse", className)}>
                {/* Header skeleton */}
                <div className="space-y-2">
                    <div className="h-8 w-64 bg-muted rounded-lg" />
                    <div className="h-4 w-96 bg-muted rounded-lg" />
                </div>
                {/* Stats skeleton */}
                <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 bg-muted rounded-xl" />
                    ))}
                </div>
                {/* Content skeleton */}
                <div className="h-64 bg-muted rounded-xl" />
            </div>
        );
    }

    if (variant === "card") {
        return (
            <div className={cn("animate-pulse", className)}>
                <div className="h-48 bg-muted rounded-xl" />
            </div>
        );
    }

    if (variant === "list") {
        return (
            <div className={cn("space-y-3 animate-pulse", className)}>
                {[...Array(rows)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                        <div className="h-10 w-10 bg-muted-foreground/20 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-48 bg-muted-foreground/20 rounded" />
                            <div className="h-3 w-32 bg-muted-foreground/20 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (variant === "table") {
        return (
            <div className={cn("animate-pulse", className)}>
                {/* Header */}
                <div className="flex gap-4 p-4 border-b border-border">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-4 flex-1 bg-muted rounded" />
                    ))}
                </div>
                {/* Rows */}
                {[...Array(rows)].map((_, i) => (
                    <div key={i} className="flex gap-4 p-4 border-b border-border/50">
                        {[...Array(5)].map((_, j) => (
                            <div key={j} className="h-4 flex-1 bg-muted rounded" />
                        ))}
                    </div>
                ))}
            </div>
        );
    }

    return null;
}

export function Skeleton({ className }: { className?: string }) {
    return <div className={cn("animate-pulse bg-muted rounded", className)} />;
}
