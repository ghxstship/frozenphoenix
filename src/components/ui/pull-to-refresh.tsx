"use client";

/* ═══════════════════════════════════════════════════════════════
   PULL TO REFRESH — Mobile gesture-driven refresh wrapper

   Wraps a content area with vertical pull-down gesture detection.
   When the user pulls past the threshold and releases, triggers
   onRefresh. Shows a spring-animated spinner indicator.

   Only active on touch devices at mobile breakpoints.
   Respects prefers-reduced-motion.
   ═══════════════════════════════════════════════════════════════ */

import React, { useCallback, useRef, useState } from "react";
import { useDrag } from "@use-gesture/react";
import { cn } from "@/lib/utils";
import { useBreakpoint, useReducedMotion } from "@/hooks/use-media-query";
import { hapticImpact } from "@/lib/haptics";
import { Loader2 } from "lucide-react";

/** Pull distance (px) to trigger refresh */
const TRIGGER_THRESHOLD = 80;
/** Maximum visual pull distance */
const MAX_PULL = 120;
/** Resistance factor */
const DAMPING = 0.45;

interface PullToRefreshProps {
    /** Called when user completes pull gesture */
    onRefresh: () => void;
    /** Whether data is currently being fetched (shows spinner) */
    isFetching?: boolean;
    /** Wrapper className */
    className?: string;
    children: React.ReactNode;
}

export function PullToRefresh({
    onRefresh,
    isFetching = false,
    className,
    children,
}: PullToRefreshProps) {
    const { isMobile } = useBreakpoint();
    const reducedMotion = useReducedMotion();
    const [pullOffset, setPullOffset] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const hasCrossedThreshold = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        onRefresh();
        // Reset after a delay to let the data re-fetch
        setTimeout(() => {
            setIsRefreshing(false);
            setPullOffset(0);
        }, 1000);
    }, [onRefresh]);

    const bind = useDrag(
        ({ down, movement: [, my], cancel }) => {
            // Only allow pull when scrolled to top
            const container = containerRef.current;
            const scrollParent = container?.closest("#shell-main-content") as HTMLElement | null;
            if (scrollParent && scrollParent.scrollTop > 5) {
                cancel();
                return;
            }

            // Already refreshing? Ignore
            if (isRefreshing) {
                cancel();
                return;
            }

            // Only allow downward pull
            if (my < 0) {
                setPullOffset(0);
                return;
            }

            if (down) {
                const dampened = Math.min(my * DAMPING, MAX_PULL);
                setPullOffset(dampened);

                // Haptic feedback at threshold
                if (dampened >= TRIGGER_THRESHOLD && !hasCrossedThreshold.current) {
                    hasCrossedThreshold.current = true;
                    hapticImpact();
                } else if (dampened < TRIGGER_THRESHOLD) {
                    hasCrossedThreshold.current = false;
                }
            } else {
                // Released
                hasCrossedThreshold.current = false;
                if (pullOffset >= TRIGGER_THRESHOLD) {
                    handleRefresh();
                } else {
                    setPullOffset(0);
                }
            }
        },
        {
            enabled: isMobile && !reducedMotion && !isRefreshing,
            axis: "y",
            filterTaps: true,
            pointer: { touch: true },
            from: () => [0, 0],
        }
    );

    // Desktop or reduced-motion: render children directly
    if (!isMobile || reducedMotion) {
        return <div className={className}>{children}</div>;
    }

    const pullProgress = Math.min(pullOffset / TRIGGER_THRESHOLD, 1);
    const showing = pullOffset > 10 || isRefreshing || isFetching;

    return (
        <div
            ref={containerRef}
            className={cn("relative", className)}
            {...bind()}
            style={{ touchAction: "pan-x pan-down" }}
        >
            {/* Pull indicator */}
            <div
                className={cn(
                    "absolute left-0 right-0 top-0 flex items-center justify-center overflow-hidden transition-[height,opacity] duration-normal",
                    showing ? "opacity-100" : "opacity-0"
                )}
                style={{
                    height: isRefreshing || isFetching ? 48 : pullOffset,
                }}
                aria-hidden="true"
            >
                <div
                    className="flex items-center justify-center gap-2 text-muted-foreground"
                    style={{
                        transform: `rotate(${pullProgress * 360}deg)`,
                        transition: isRefreshing
                            ? "none"
                            : `transform var(--duration-micro) var(--ease-out-expo)`,
                    }}
                >
                    <Loader2
                        className={cn(
                            "h-5 w-5",
                            (isRefreshing || isFetching) && "motion-safe:animate-spin"
                        )}
                    />
                </div>
                {pullOffset >= TRIGGER_THRESHOLD && !isRefreshing && (
                    <span className="text-xs text-muted-foreground ml-2">Release to refresh</span>
                )}
            </div>

            {/* Content with pull offset */}
            <div
                style={{
                    transform: `translateY(${isRefreshing || isFetching ? 48 : pullOffset}px)`,
                    transition:
                        !pullOffset || isRefreshing
                            ? `transform var(--duration-slow) var(--ease-spring-gentle)`
                            : "none",
                }}
            >
                {children}
            </div>
        </div>
    );
}
