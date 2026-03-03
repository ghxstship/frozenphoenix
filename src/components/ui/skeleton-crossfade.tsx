"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonCrossfadeProps {
    isLoading: boolean;
    skeleton: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export function SkeletonCrossfade({
    isLoading,
    skeleton,
    children,
    className,
}: SkeletonCrossfadeProps) {
    const [showContent, setShowContent] = React.useState(!isLoading);

    React.useEffect(() => {
        if (!isLoading) {
            const timer = setTimeout(() => setShowContent(true), 50);
            return () => clearTimeout(timer);
        }
        setShowContent(false);
    }, [isLoading]);

    return (
        <div className={cn("relative", className)}>
            {/* Skeleton layer */}
            <div
                className={cn(
                    "motion-safe:transition-opacity motion-safe:duration-200",
                    showContent ? "opacity-0 pointer-events-none absolute inset-0" : "opacity-100"
                )}
                aria-hidden={showContent}
            >
                {skeleton}
            </div>
            {/* Content layer */}
            {showContent && <div className="motion-safe:animate-fade-in">{children}</div>}
        </div>
    );
}
