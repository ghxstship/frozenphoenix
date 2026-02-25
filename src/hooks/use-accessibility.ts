"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Hook to manage focus trap within a container
 * Essential for modals, dialogs, and dropdown menus (WCAG 2.4.3)
 */
export function useFocusTrap(isActive: boolean = true) {
    const containerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!isActive || !containerRef.current) return;

        const container = containerRef.current;
        const focusableElements = container.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== "Tab") return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };

        container.addEventListener("keydown", handleKeyDown);
        firstElement.focus();

        return () => {
            container.removeEventListener("keydown", handleKeyDown);
        };
    }, [isActive]);

    return containerRef;
}

/**
 * Hook to restore focus when a component unmounts
 * Essential for modals and dialogs (WCAG 2.4.3)
 */
export function useFocusReturn() {
    const previousFocusRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        previousFocusRef.current = document.activeElement as HTMLElement;

        return () => {
            previousFocusRef.current?.focus();
        };
    }, []);
}

/**
 * Hook to handle escape key press
 * Essential for dismissible UI elements (WCAG 2.1.2)
 */
export function useEscapeKey(onEscape: () => void, isActive: boolean = true) {
    useEffect(() => {
        if (!isActive) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onEscape();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onEscape, isActive]);
}

/**
 * Hook to handle keyboard navigation in lists
 * Essential for menus and listboxes (WCAG 2.1.1)
 */
export function useArrowNavigation(
    itemCount: number,
    currentIndex: number,
    setCurrentIndex: (index: number) => void,
    onSelect?: (index: number) => void
) {
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setCurrentIndex(Math.min(currentIndex + 1, itemCount - 1));
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setCurrentIndex(Math.max(currentIndex - 1, 0));
                    break;
                case "Home":
                    e.preventDefault();
                    setCurrentIndex(0);
                    break;
                case "End":
                    e.preventDefault();
                    setCurrentIndex(itemCount - 1);
                    break;
                case "Enter":
                case " ":
                    e.preventDefault();
                    onSelect?.(currentIndex);
                    break;
            }
        },
        [itemCount, currentIndex, setCurrentIndex, onSelect]
    );

    return { handleKeyDown };
}

/**
 * Hook to announce messages to screen readers
 * Essential for dynamic content updates (WCAG 4.1.3)
 */
export function useAnnounce() {
    const announce = useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
        const announcer = document.getElementById(`sr-announcer-${priority}`);
        if (announcer) {
            announcer.textContent = "";
            requestAnimationFrame(() => {
                announcer.textContent = message;
            });
        }
    }, []);

    return announce;
}

/**
 * Hook to detect if user is navigating with keyboard
 * Used to show focus indicators only for keyboard users
 */
export function useKeyboardNavigation() {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Tab") {
                document.body.classList.add("keyboard-navigation");
            }
        };

        const handleMouseDown = () => {
            document.body.classList.remove("keyboard-navigation");
        };

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("mousedown", handleMouseDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("mousedown", handleMouseDown);
        };
    }, []);
}

/**
 * Generate unique IDs for ARIA relationships
 */
let idCounter = 0;
export function useId(prefix: string = "id"): string {
    const idRef = useRef<string | null>(null);
    if (idRef.current === null) {
        idRef.current = `${prefix}-${++idCounter}`;
    }
    return idRef.current;
}
