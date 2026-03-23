"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SlidingIndicatorProps {
    containerRef: React.RefObject<HTMLElement | null>;
    activeSelector: string;
    className?: string | undefined;
    layoutDirection?: "horizontal" | "vertical" | undefined;
}

export function SlidingIndicator({
    containerRef,
    activeSelector,
    className,
    layoutDirection = "horizontal",
}: SlidingIndicatorProps) {
    const [style, setStyle] = React.useState<React.CSSProperties>({
        opacity: 0,
    });

    const measure = React.useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        const activeEl = container.querySelector<HTMLElement>(activeSelector);
        if (!activeEl) {
            setStyle((prev) => ({ ...prev, opacity: 0 }));
            return;
        }

        const containerRect = container.getBoundingClientRect();
        const activeRect = activeEl.getBoundingClientRect();

        if (layoutDirection === "horizontal") {
            setStyle({
                width: activeRect.width,
                height: activeRect.height,
                transform: `translateX(${activeRect.left - containerRect.left}px)`,
                opacity: 1,
            });
        } else {
            setStyle({
                width: activeRect.width,
                height: activeRect.height,
                transform: `translateY(${activeRect.top - containerRect.top}px)`,
                opacity: 1,
            });
        }
    }, [containerRef, activeSelector, layoutDirection]);

    React.useEffect(() => {
        measure();
    }, [measure]);

    React.useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new ResizeObserver(() => measure());
        observer.observe(container);
        return () => observer.disconnect();
    }, [containerRef, measure]);

    return (
        <div
            aria-hidden="true"
            className={cn(
                "absolute top-0 left-0 motion-safe:transition-[transform,width,height] motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none",
                className
            )}
            style={style}
        />
    );
}
