"use client";

/* ═══════════════════════════════════════════════════════════════
   USE SWIPE TO DISMISS — Vertical swipe-down gesture hook

   Provides swipe-to-dismiss behavior for mobile bottom sheets.
   Uses @use-gesture/react for physics-correct drag tracking
   with velocity-based fling detection and rubber-band resistance.

   Only active on touch devices at sm and below. Respects
   prefers-reduced-motion by disabling gesture entirely.
   ═══════════════════════════════════════════════════════════════ */

import { useCallback, useRef } from "react";
import { useDrag } from "@use-gesture/react";
import { useReducedMotion } from "@/hooks/use-media-query";
import { hapticImpact } from "@/lib/haptics";

/** Minimum downward distance (px) to trigger dismiss */
const DISMISS_THRESHOLD = 80;
/** Minimum fling velocity (px/ms) to dismiss regardless of distance */
const FLING_VELOCITY = 0.5;
/** Rubber-band resistance factor (0-1, lower = more resistance) */
const RUBBER_BAND = 0.4;

interface SwipeToDismissOptions {
    /** Called when user swipes past threshold or flings */
    onDismiss: () => void;
    /** Whether the swipe gesture is enabled (e.g. only on mobile) */
    enabled?: boolean;
}

interface SwipeToDismissReturn {
    /** Bind handlers — spread onto the target element */
    bind: ReturnType<typeof useDrag>;
    /** Current translateY value for the element (pixels) */
    offsetY: React.MutableRefObject<number>;
    /** Current opacity (1 at rest, decreases during drag) */
    opacity: React.MutableRefObject<number>;
    /** Whether user is actively dragging */
    isDragging: React.MutableRefObject<boolean>;
}

export function useSwipeToDismiss({
    onDismiss,
    enabled = true,
}: SwipeToDismissOptions): SwipeToDismissReturn {
    const reducedMotion = useReducedMotion();
    const offsetY = useRef(0);
    const opacity = useRef(1);
    const isDragging = useRef(false);
    const hasCrossedThreshold = useRef(false);

    const handleDismiss = useCallback(() => {
        onDismiss();
    }, [onDismiss]);

    const bind = useDrag(
        ({ down, movement: [, my], velocity: [, vy], direction: [, dy], cancel, event }) => {
            // Only allow downward drag (positive Y)
            if (my < 0) {
                cancel();
                return;
            }

            isDragging.current = down;

            if (down) {
                // Apply rubber-band resistance as distance increases
                const dampened =
                    my * RUBBER_BAND + my * (1 - RUBBER_BAND) * Math.max(0, 1 - my / 400);
                offsetY.current = dampened;
                opacity.current = Math.max(0.3, 1 - dampened / 300);

                // Haptic feedback when crossing threshold
                if (dampened >= DISMISS_THRESHOLD && !hasCrossedThreshold.current) {
                    hasCrossedThreshold.current = true;
                    hapticImpact();
                } else if (dampened < DISMISS_THRESHOLD) {
                    hasCrossedThreshold.current = false;
                }

                // Update the element style directly for 60fps performance
                const el = (event?.target as HTMLElement)?.closest?.(
                    "[data-swipe-dismiss]"
                ) as HTMLElement | null;
                if (el) {
                    el.style.transform = `translateY(${dampened}px)`;
                    el.style.opacity = String(opacity.current);
                }
            } else {
                // Released — check if should dismiss
                const shouldDismiss =
                    offsetY.current >= DISMISS_THRESHOLD || (vy > FLING_VELOCITY && dy > 0);

                hasCrossedThreshold.current = false;

                if (shouldDismiss) {
                    // Animate out before dismiss
                    const el = (event?.target as HTMLElement)?.closest?.(
                        "[data-swipe-dismiss]"
                    ) as HTMLElement | null;
                    if (el) {
                        el.style.transition = "transform 200ms ease-out, opacity 200ms ease-out";
                        el.style.transform = "translateY(100%)";
                        el.style.opacity = "0";
                        setTimeout(() => {
                            el.style.transition = "";
                            handleDismiss();
                        }, 200);
                    } else {
                        handleDismiss();
                    }
                } else {
                    // Snap back
                    const el = (event?.target as HTMLElement)?.closest?.(
                        "[data-swipe-dismiss]"
                    ) as HTMLElement | null;
                    if (el) {
                        el.style.transition =
                            "transform 300ms cubic-bezier(0.25, 1, 0.5, 1), opacity 300ms cubic-bezier(0.25, 1, 0.5, 1)";
                        el.style.transform = "translateY(0)";
                        el.style.opacity = "1";
                        setTimeout(() => {
                            if (el) el.style.transition = "";
                        }, 300);
                    }
                }
                offsetY.current = 0;
                opacity.current = 1;
            }
        },
        {
            enabled: enabled && !reducedMotion,
            axis: "y",
            filterTaps: true,
            pointer: { touch: true },
            from: () => [0, 0],
        }
    );

    return { bind, offsetY, opacity, isDragging };
}
