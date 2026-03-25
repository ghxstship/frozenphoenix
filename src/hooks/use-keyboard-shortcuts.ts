"use client";

/* ═══════════════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS HOOK — Global Keyboard Shortcut System

   Registers platform-wide shortcuts respecting input focus.
   Shortcuts are disabled when focus is inside input/textarea/select
   or contenteditable elements.

   Usage:
     useKeyboardShortcuts([
       { key: "k", meta: true, action: () => openPalette() },
       { key: "d", sequence: "g", action: () => goToDashboard() },
     ]);
   ═══════════════════════════════════════════════════════════════ */

import { useCallback, useEffect, useRef } from "react";

export interface KeyboardShortcut {
    /** Main key (lowercase) */
    key: string;
    /** Require ⌘/Ctrl modifier */
    meta?: boolean | undefined;
    /** Require Shift modifier */
    shift?: boolean | undefined;
    /** Two-key sequence prefix (e.g., "g" for "G then D") */
    sequence?: string | undefined;
    /** Action to execute */
    action: () => void;
    /** Human-readable label for command palette */
    label?: string | undefined;
    /** Category for display grouping */
    category?: string | undefined;
}

const FOCUSABLE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

function isEditableElement(el: EventTarget | null): boolean {
    if (!el || !(el instanceof HTMLElement)) return false;
    if (FOCUSABLE_TAGS.has(el.tagName)) return true;
    if (el.isContentEditable) return true;
    return false;
}

/**
 * Register keyboard shortcuts at the document level.
 * Automatically handles two-key sequences and modifier keys.
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
    const sequenceRef = useRef<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            // Skip when focus is in an editable element
            if (isEditableElement(e.target)) return;

            const key = e.key.toLowerCase();
            const meta = e.metaKey || e.ctrlKey;
            const shift = e.shiftKey;

            for (const shortcut of shortcuts) {
                // Meta shortcut (⌘K, ⌘⇧F, etc.)
                if (shortcut.meta) {
                    if (meta && key === shortcut.key && (!shortcut.shift || shift)) {
                        e.preventDefault();
                        shortcut.action();
                        return;
                    }
                    continue;
                }

                // Two-key sequence (G then D, G then P, etc.)
                if (shortcut.sequence) {
                    if (
                        sequenceRef.current === shortcut.sequence &&
                        key === shortcut.key &&
                        !meta
                    ) {
                        e.preventDefault();
                        sequenceRef.current = null;
                        if (timerRef.current) clearTimeout(timerRef.current);
                        shortcut.action();
                        return;
                    }
                    continue;
                }

                // Single key (no modifiers, no sequence)
                if (!meta && !shift && key === shortcut.key && !shortcut.sequence) {
                    e.preventDefault();
                    shortcut.action();
                    return;
                }
            }

            // Capture sequence prefix
            if (!meta && !shift) {
                const isPrefix = shortcuts.some((s) => s.sequence === key);
                if (isPrefix) {
                    sequenceRef.current = key;
                    if (timerRef.current) clearTimeout(timerRef.current);
                    timerRef.current = setTimeout(() => {
                        sequenceRef.current = null;
                    }, 800);
                }
            }
        },
        [shortcuts]
    );

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [handleKeyDown]);
}

/** Built-in shortcut definitions for the platform */
export const PLATFORM_SHORTCUTS: KeyboardShortcut[] = [
    // Command palette — defined but action set by CommandPalette
    { key: "k", meta: true, label: "Open Command Palette", category: "General", action: () => {} },
    {
        key: "/",
        meta: true,
        label: "Keyboard Shortcuts Help",
        category: "General",
        action: () => {},
    },

    // Navigation sequences (G then X)
    { key: "d", sequence: "g", label: "Go to Dashboard", category: "Navigation", action: () => {} },
    { key: "p", sequence: "g", label: "Go to Projects", category: "Navigation", action: () => {} },
    { key: "t", sequence: "g", label: "Go to Tasks", category: "Navigation", action: () => {} },
    { key: "c", sequence: "g", label: "Go to Calendar", category: "Navigation", action: () => {} },
    { key: "m", sequence: "g", label: "Go to Messages", category: "Navigation", action: () => {} },
    {
        key: "s",
        sequence: "g",
        label: "Go to Scheduling",
        category: "Navigation",
        action: () => {},
    },
    {
        key: "n",
        sequence: "g",
        label: "Go to Notifications",
        category: "Navigation",
        action: () => {},
    },

    // Global search
    {
        key: "f",
        meta: true,
        shift: true,
        label: "Global Search",
        category: "General",
        action: () => {},
    },
];

/** Map of sequence keys to their routes */
export const SHORTCUT_ROUTES: Record<string, string> = {
    d: "/dashboard",
    p: "/projects",
    t: "/tasks",
    c: "/calendar",
    m: "/messages",
    s: "/scheduling",
    n: "/notifications",
};
