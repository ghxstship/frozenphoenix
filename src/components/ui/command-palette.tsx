"use client";

/* ═══════════════════════════════════════════════════════════════
   COMMAND PALETTE — ⌘K Global Command Dialog

   Fuzzy-searchable command palette accessible from any page.
   Searches across navigation items, recent entities, and
   platform actions. Uses existing navigationConfig for entries.
   ═══════════════════════════════════════════════════════════════ */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { flattenNavItems, navigationConfig } from "@/config/navigation";
import {
    PLATFORM_SHORTCUTS,
    SHORTCUT_ROUTES,
    useKeyboardShortcuts,
} from "@/hooks/use-keyboard-shortcuts";
import type { KeyboardShortcut } from "@/hooks/use-keyboard-shortcuts";
import { ArrowRight, Command, CornerDownLeft, Search } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────

interface CommandEntry {
    id: string;
    label: string;
    category: string;
    icon?: React.ReactNode | undefined;
    shortcut?: string | undefined;
    action: () => void;
}

// ─── Fuzzy Search ────────────────────────────────────────────

function fuzzyMatch(query: string, target: string): boolean {
    const q = query.toLowerCase();
    const t = target.toLowerCase();
    if (t.includes(q)) return true;
    // Character-by-character fuzzy
    let qi = 0;
    for (let ti = 0; ti < t.length && qi < q.length; ti++) {
        if (t[ti] === q[qi]) qi++;
    }
    return qi === q.length;
}

// ─── Component ───────────────────────────────────────────────

export function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Build command entries from navigation
    const commands: CommandEntry[] = useMemo(() => {
        const entries: CommandEntry[] = [];

        // Navigation items
        const allItems = flattenNavItems(navigationConfig);
        for (const item of allItems) {
            entries.push({
                id: `nav-${item.path}`,
                label: item.title,
                category: "Navigation",
                icon: item.icon ? <item.icon className="h-4 w-4" /> : undefined,
                action: () => {
                    router.push(item.path);
                    setIsOpen(false);
                },
            });
        }

        // Keyboard shortcut nav commands
        for (const shortcut of PLATFORM_SHORTCUTS) {
            if (shortcut.sequence === "g" && shortcut.key in SHORTCUT_ROUTES) {
                const existing = entries.find(
                    (e) => e.id === `nav-${SHORTCUT_ROUTES[shortcut.key]}`
                );
                if (existing) {
                    existing.shortcut = `G → ${shortcut.key.toUpperCase()}`;
                }
            }
        }

        // Quick actions
        entries.push({
            id: "action-new-project",
            label: "Create New Project",
            category: "Actions",
            action: () => {
                router.push("/projects?action=create");
                setIsOpen(false);
            },
        });
        entries.push({
            id: "action-new-task",
            label: "Create New Task",
            category: "Actions",
            action: () => {
                router.push("/tasks?action=create");
                setIsOpen(false);
            },
        });
        entries.push({
            id: "action-new-contact",
            label: "Create New Contact",
            category: "Actions",
            action: () => {
                router.push("/contacts?action=create");
                setIsOpen(false);
            },
        });

        return entries;
    }, [router]);

    // Filter by query
    const filtered = useMemo(() => {
        if (!query.trim()) return commands.slice(0, 20);
        return commands.filter((c) => fuzzyMatch(query, c.label));
    }, [commands, query]);

    // Group by category
    const grouped = useMemo(() => {
        const groups: Record<string, CommandEntry[]> = {};
        for (const entry of filtered) {
            if (!groups[entry.category]) groups[entry.category] = [];
            groups[entry.category]!.push(entry);
        }
        return groups;
    }, [filtered]);

    // Register ⌘K shortcut
    const shortcuts: KeyboardShortcut[] = useMemo(
        () => [
            {
                key: "k",
                meta: true,
                action: () => setIsOpen((prev) => !prev),
            },
        ],
        []
    );
    useKeyboardShortcuts(shortcuts);

    // Register G+X navigation shortcuts
    const navShortcuts: KeyboardShortcut[] = useMemo(
        () =>
            Object.entries(SHORTCUT_ROUTES).map(([key, path]) => ({
                key,
                sequence: "g",
                action: () => router.push(path),
            })),
        [router]
    );
    useKeyboardShortcuts(navShortcuts);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setQuery("");
            setSelectedIndex(0);
            requestAnimationFrame(() => inputRef.current?.focus());
        }
    }, [isOpen]);

    // Escape to close
    useEffect(() => {
        if (!isOpen) return;
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                setIsOpen(false);
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen]);

    // Arrow key navigation
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter") {
                e.preventDefault();
                filtered[selectedIndex]?.action();
            }
        },
        [filtered, selectedIndex]
    );

    // Scroll selected item into view
    useEffect(() => {
        const list = listRef.current;
        if (!list) return;
        const selected = list.querySelector("[data-selected='true']");
        selected?.scrollIntoView({ block: "nearest" });
    }, [selectedIndex]);

    if (!isOpen) return null;

    let flatIndex = -1;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] motion-safe:animate-fade-in"
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
            />

            {/* Dialog */}
            <div
                className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-[61] motion-safe:animate-slide-up"
                role="dialog"
                aria-label="Command palette"
                aria-modal="true"
            >
                <div className="bg-popover border rounded-xl shadow-2xl overflow-hidden">
                    {/* Search input */}
                    <div className="flex items-center gap-3 border-b px-4 py-3">
                        <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Type a command or search..."
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setSelectedIndex(0);
                            }}
                            onKeyDown={handleKeyDown}
                            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                            aria-label="Command palette search"
                        />
                        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                            ESC
                        </kbd>
                    </div>

                    {/* Results */}
                    <div
                        ref={listRef}
                        className="max-h-[320px] overflow-y-auto py-2"
                        role="listbox"
                    >
                        {filtered.length === 0 ? (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                No results found for &quot;{query}&quot;
                            </div>
                        ) : (
                            Object.entries(grouped).map(([category, entries]) => (
                                <div key={category}>
                                    <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        {category}
                                    </div>
                                    {entries.map((entry) => {
                                        flatIndex++;
                                        const isSelected = flatIndex === selectedIndex;
                                        const currentIdx = flatIndex;
                                        return (
                                            <button
                                                key={entry.id}
                                                type="button"
                                                role="option"
                                                aria-selected={isSelected}
                                                data-selected={isSelected}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors",
                                                    isSelected
                                                        ? "bg-accent text-accent-foreground"
                                                        : "hover:bg-accent/50"
                                                )}
                                                onClick={entry.action}
                                                onMouseEnter={() => setSelectedIndex(currentIdx)}
                                            >
                                                <span className="shrink-0 text-muted-foreground">
                                                    {entry.icon ?? (
                                                        <ArrowRight className="h-4 w-4" />
                                                    )}
                                                </span>
                                                <span className="flex-1 truncate">
                                                    {entry.label}
                                                </span>
                                                {entry.shortcut && (
                                                    <kbd className="hidden sm:inline text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                                        {entry.shortcut}
                                                    </kbd>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t px-4 py-2 text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                                <CornerDownLeft className="h-3 w-3" /> Select
                            </span>
                            <span className="flex items-center gap-1">↑↓ Navigate</span>
                        </div>
                        <span className="flex items-center gap-1">
                            <Command className="h-3 w-3" />K to toggle
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}

CommandPalette.displayName = "CommandPalette";
