"use client";

/* ═══════════════════════════════════════════════════════════════
   MOTION FRAMEWORK — Unified Animation Control
   ═══════════════════════════════════════════════════════════════
   
   Provides per-component reduced-motion awareness,
   named motion scales, and deterministic animation helpers.
   
   All motion must:
   - Respect prefers-reduced-motion
   - Use tokenized durations from MOTION_SCALE
   - Be purpose-driven (no decorative-only animation)
   - Target 60fps minimum
   ═══════════════════════════════════════════════════════════════ */

import { useCallback, useMemo } from "react";
import { useReducedMotion } from "@/hooks/use-media-query";
import {
    EXIT_SCALE,
    type ExitScaleToken,
    MOTION_SCALE,
    type MotionScaleToken,
    SPRING_PRESETS,
    type SpringPresetToken,
} from "@/config/design-tokens";

export interface SpringConfig {
    stiffness: number;
    damping: number;
    mass: number;
}

export interface MotionConfig {
    reducedMotion: boolean;
    duration: (scale: MotionScaleToken) => number;
    durationMs: (scale: MotionScaleToken) => string;
    exitDuration: (scale: ExitScaleToken) => number;
    shouldAnimate: boolean;
    getTransition: (scale?: MotionScaleToken) => string;
    getExitTransition: (scale?: ExitScaleToken) => string;
    getStaggerDelay: (index: number, interval?: number) => string;
    getSpring: (preset?: SpringPresetToken) => SpringConfig | { duration: 0 };
}

export function useMotion(): MotionConfig {
    const reducedMotion = useReducedMotion();

    const duration = useCallback(
        (scale: MotionScaleToken): number => {
            if (reducedMotion) return 0;
            return MOTION_SCALE[scale];
        },
        [reducedMotion]
    );

    const durationMs = useCallback(
        (scale: MotionScaleToken): string => {
            return `${duration(scale)}ms`;
        },
        [duration]
    );

    const getTransition = useCallback(
        (scale: MotionScaleToken = "md"): string => {
            if (reducedMotion) return "none";
            return `all ${MOTION_SCALE[scale]}ms cubic-bezier(0.16, 1, 0.3, 1)`;
        },
        [reducedMotion]
    );

    const exitDuration = useCallback(
        (scale: ExitScaleToken): number => {
            if (reducedMotion) return 0;
            return EXIT_SCALE[scale];
        },
        [reducedMotion]
    );

    const getExitTransition = useCallback(
        (scale: ExitScaleToken = "normal"): string => {
            if (reducedMotion) return "none";
            return `all ${EXIT_SCALE[scale]}ms cubic-bezier(0.4, 0, 1, 1)`;
        },
        [reducedMotion]
    );

    const getStaggerDelay = useCallback(
        (index: number, interval: number = 50): string => {
            if (reducedMotion) return "0ms";
            return `${index * interval}ms`;
        },
        [reducedMotion]
    );

    const getSpring = useCallback(
        (preset: SpringPresetToken = "snappy"): SpringConfig | { duration: 0 } => {
            if (reducedMotion) return { duration: 0 };
            return SPRING_PRESETS[preset];
        },
        [reducedMotion]
    );

    return useMemo(
        () => ({
            reducedMotion,
            duration,
            durationMs,
            exitDuration,
            shouldAnimate: !reducedMotion,
            getTransition,
            getExitTransition,
            getStaggerDelay,
            getSpring,
        }),
        [
            reducedMotion,
            duration,
            durationMs,
            exitDuration,
            getTransition,
            getExitTransition,
            getStaggerDelay,
            getSpring,
        ]
    );
}

// ─── Animation Class Helpers ───
// Use these in className to conditionally apply animations

export function motionClass(animate: boolean, className: string): string {
    return animate ? className : "";
}

export function staggerClass(animate: boolean): string {
    return animate ? "animate-slide-up" : "";
}

export function fadeClass(animate: boolean): string {
    return animate ? "animate-fade-in" : "";
}

export function scaleClass(animate: boolean): string {
    return animate ? "animate-scale-in" : "";
}
