"use client";

import { useCallback, useEffect, useRef } from "react";

interface SwipeGestureOptions {
    /** Minimum distance (px) to trigger swipe. Default: 50 */
    threshold?: number | undefined; /** Minimum velocity (px/ms) to trigger swipe. Default: 0.3 */
    velocityThreshold?: number | undefined; /** Callbacks per direction */
    onSwipeLeft?: (() => void) | undefined;
    onSwipeRight?: (() => void) | undefined;
    onSwipeUp?: (() => void) | undefined;
    onSwipeDown?:
        | (() => void)
        | undefined; /** Whether to constrain to edge-only swipes (within edgeWidth px of screen edge) */
    edgeOnly?: boolean | undefined; /** Edge detection width in px. Default: 20 */
    edgeWidth?: number | undefined; /** Whether gesture is currently enabled. Default: true */
    enabled?: boolean | undefined;
}

interface TouchState {
    startX: number;
    startY: number;
    startTime: number;
    isEdge: boolean;
}

/**
 * Hook that detects swipe gestures on a ref element.
 * Respects prefers-reduced-motion by skipping haptic feedback.
 */
export function useSwipeGesture<T extends HTMLElement>(options: SwipeGestureOptions) {
    const {
        threshold = 50,
        velocityThreshold = 0.3,
        onSwipeLeft,
        onSwipeRight,
        onSwipeUp,
        onSwipeDown,
        edgeOnly = false,
        edgeWidth = 20,
        enabled = true,
    } = options;

    const ref = useRef<T>(null);
    const touchStateRef = useRef<TouchState | null>(null);

    const handleTouchStart = useCallback(
        (e: TouchEvent) => {
            if (!enabled) return;
            const touch = e.touches[0];
            if (!touch) return;

            const isEdge =
                touch.clientX <= edgeWidth || touch.clientX >= window.innerWidth - edgeWidth;

            touchStateRef.current = {
                startX: touch.clientX,
                startY: touch.clientY,
                startTime: Date.now(),
                isEdge,
            };
        },
        [enabled, edgeWidth]
    );

    const handleTouchEnd = useCallback(
        (e: TouchEvent) => {
            if (!enabled || !touchStateRef.current) return;
            const touch = e.changedTouches[0];
            if (!touch) return;

            const { startX, startY, startTime, isEdge } = touchStateRef.current;
            touchStateRef.current = null;

            if (edgeOnly && !isEdge) return;

            const deltaX = touch.clientX - startX;
            const deltaY = touch.clientY - startY;
            const elapsed = Date.now() - startTime;
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);

            // Determine if this is a horizontal or vertical swipe
            const isHorizontal = absX > absY;
            const distance = isHorizontal ? absX : absY;
            const velocity = distance / Math.max(elapsed, 1);

            if (distance < threshold && velocity < velocityThreshold) return;

            // Haptic feedback (skip if reduced motion preferred)
            const prefersReduced =
                typeof window !== "undefined" &&
                window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            if (!prefersReduced && navigator.vibrate) {
                navigator.vibrate(10);
            }

            if (isHorizontal) {
                if (deltaX < 0) {
                    onSwipeLeft?.();
                } else {
                    onSwipeRight?.();
                }
            } else {
                if (deltaY < 0) {
                    onSwipeUp?.();
                } else {
                    onSwipeDown?.();
                }
            }
        },
        [
            enabled,
            edgeOnly,
            threshold,
            velocityThreshold,
            onSwipeLeft,
            onSwipeRight,
            onSwipeUp,
            onSwipeDown,
        ]
    );

    useEffect(() => {
        const el = ref.current;
        if (!el || !enabled) return;

        el.addEventListener("touchstart", handleTouchStart, { passive: true });
        el.addEventListener("touchend", handleTouchEnd, { passive: true });

        return () => {
            el.removeEventListener("touchstart", handleTouchStart);
            el.removeEventListener("touchend", handleTouchEnd);
        };
    }, [enabled, handleTouchStart, handleTouchEnd]);

    return ref;
}
