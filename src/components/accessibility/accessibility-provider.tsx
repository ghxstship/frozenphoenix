"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useHighContrast, useReducedMotion } from "@/hooks/use-media-query";
import { useKeyboardNavigation } from "@/hooks/use-accessibility";

interface AccessibilityContextType {
    reducedMotion: boolean;
    highContrast: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
    reducedMotion: false,
    highContrast: false,
});

export function useAccessibility() {
    return useContext(AccessibilityContext);
}

interface AccessibilityProviderProps {
    children: React.ReactNode;
}

/**
 * Accessibility Provider
 *
 * Provides accessibility context and sets up:
 * - Screen reader announcer regions (WCAG 4.1.3)
 * - Keyboard navigation detection
 * - Reduced motion preference
 * - High contrast mode detection
 */
export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
    const reducedMotion = useReducedMotion();
    const highContrast = useHighContrast();

    useKeyboardNavigation();

    useEffect(() => {
        if (reducedMotion) {
            document.documentElement.classList.add("reduce-motion");
        } else {
            document.documentElement.classList.remove("reduce-motion");
        }
    }, [reducedMotion]);

    useEffect(() => {
        if (highContrast) {
            document.documentElement.classList.add("high-contrast");
        } else {
            document.documentElement.classList.remove("high-contrast");
        }
    }, [highContrast]);

    return (
        <AccessibilityContext.Provider value={{ reducedMotion, highContrast }}>
            {children}

            {/* Screen Reader Announcer Regions (WCAG 4.1.3) */}
            <div
                id="sr-announcer-polite"
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
            />
            <div
                id="sr-announcer-assertive"
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                className="sr-only"
            />
        </AccessibilityContext.Provider>
    );
}
