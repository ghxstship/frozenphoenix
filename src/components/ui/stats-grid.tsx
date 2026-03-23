import * as React from "react";
import { cn } from "@/lib/utils";

interface StatsGridProps {
    children: React.ReactNode;
    className?: string | undefined;
}

/**
 * Auto-sizing responsive grid for stat/metric cards.
 * Counts children to pick the optimal column layout.
 */
export function StatsGrid({ children, className }: StatsGridProps) {
    const count = React.Children.count(children);

    const gridCols =
        count <= 2
            ? "grid-cols-1 sm:grid-cols-2"
            : count === 3
              ? "grid-cols-1 sm:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

    return <div className={cn("grid density-gap-card", gridCols, className)}>{children}</div>;
}
