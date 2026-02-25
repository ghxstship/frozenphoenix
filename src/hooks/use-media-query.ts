"use client";

import { useSyncExternalStore } from "react";
import { BREAKPOINTS } from "@/config/design-tokens";

/**
 * Hook to detect if a media query matches using useSyncExternalStore
 * @param query - CSS media query string
 * @returns boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
    const subscribe = (callback: () => void) => {
        if (typeof window === "undefined") return () => {};
        const mediaQuery = window.matchMedia(query);
        mediaQuery.addEventListener("change", callback);
        return () => mediaQuery.removeEventListener("change", callback);
    };

    const getSnapshot = () => {
        if (typeof window === "undefined") return false;
        return window.matchMedia(query).matches;
    };

    const getServerSnapshot = () => false;

    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Hook to get current breakpoint
 * @returns Current breakpoint name and utilities
 */
export function useBreakpoint() {
    const isSm = useMediaQuery(`(min-width: ${BREAKPOINTS.sm}px)`);
    const isMd = useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`);
    const isLg = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);
    const isXl = useMediaQuery(`(min-width: ${BREAKPOINTS.xl}px)`);
    const is2Xl = useMediaQuery(`(min-width: ${BREAKPOINTS["2xl"]}px)`);

    const current = is2Xl ? "2xl" : isXl ? "xl" : isLg ? "lg" : isMd ? "md" : isSm ? "sm" : "xs";

    return {
        current,
        isMobile: !isMd,
        isTablet: isMd && !isLg,
        isDesktop: isLg,
        isXs: !isSm,
        isSm,
        isMd,
        isLg,
        isXl,
        is2Xl,
    };
}

/**
 * Hook to detect touch device
 */
export function useIsTouchDevice(): boolean {
    const getSnapshot = () => {
        if (typeof window === "undefined") return false;
        return "ontouchstart" in window || navigator.maxTouchPoints > 0;
    };

    return useSyncExternalStore(
        () => () => {},
        getSnapshot,
        () => false
    );
}

/**
 * Hook to detect reduced motion preference
 */
export function useReducedMotion(): boolean {
    return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/**
 * Hook to detect high contrast mode
 */
export function useHighContrast(): boolean {
    return useMediaQuery("(prefers-contrast: more)");
}

/**
 * Hook to detect dark mode preference
 */
export function usePrefersColorScheme(): "light" | "dark" {
    const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
    return prefersDark ? "dark" : "light";
}

/**
 * Hook to get viewport dimensions
 */
export function useViewportSize() {
    const subscribe = (callback: () => void) => {
        if (typeof window === "undefined") return () => {};
        window.addEventListener("resize", callback);
        return () => window.removeEventListener("resize", callback);
    };

    const getSnapshot = () => {
        if (typeof window === "undefined") return { width: 0, height: 0 };
        return { width: window.innerWidth, height: window.innerHeight };
    };

    const getServerSnapshot = () => ({ width: 0, height: 0 });

    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Hook to detect orientation
 */
export function useOrientation(): "portrait" | "landscape" {
    const isPortrait = useMediaQuery("(orientation: portrait)");
    return isPortrait ? "portrait" : "landscape";
}
