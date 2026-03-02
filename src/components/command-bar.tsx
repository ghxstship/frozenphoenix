"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { navigationConfig } from "@/config/navigation";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Clock, Command, Search, Sparkles, X } from "lucide-react";

interface CommandBarProps {
    className?: string;
}

interface CommandItem {
    id: string;
    title: string;
    path: string;
    section: string;
    icon: LucideIcon;
}

interface GroupedResults {
    section: string;
    items: { cmd: CommandItem; flatIndex: number }[];
}

export function CommandBar({ className }: CommandBarProps) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [recentPaths, setRecentPaths] = React.useState<string[]>([]);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const listRef = React.useRef<HTMLDivElement>(null);
    const panelRef = React.useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Load recent paths from localStorage
    React.useEffect(() => {
        try {
            const stored = localStorage.getItem("pb-recent-nav");
            if (stored) setRecentPaths(JSON.parse(stored));
        } catch {
            /* ignore */
        }
    }, []);

    // Build flat command list from navigation config (including nested children)
    const allCommands = React.useMemo<CommandItem[]>(() => {
        const items: CommandItem[] = [];
        navigationConfig.forEach((section) => {
            section.items.forEach((item) => {
                items.push({
                    id: item.path,
                    title: item.title,
                    path: item.path,
                    section: section.title,
                    icon: item.icon,
                });
                if (item.children) {
                    item.children.forEach((child) => {
                        items.push({
                            id: child.path,
                            title: child.title,
                            path: child.path,
                            section: section.title,
                            icon: child.icon,
                        });
                    });
                }
            });
        });
        return items;
    }, []);

    // Filter commands by query
    const filteredCommands = React.useMemo(() => {
        if (!query) {
            // Show recent items first, then fill with default
            const recents = recentPaths
                .map((p) => allCommands.find((c) => c.path === p))
                .filter(Boolean) as CommandItem[];
            const recentIds = new Set(recents.map((r) => r.id));
            const rest = allCommands.filter((c) => !recentIds.has(c.id));
            return [...recents, ...rest].slice(0, 20);
        }
        const q = query.toLowerCase();
        return allCommands.filter(
            (cmd) =>
                cmd.title.toLowerCase().includes(q) ||
                cmd.section.toLowerCase().includes(q) ||
                cmd.path.toLowerCase().includes(q)
        );
    }, [query, allCommands, recentPaths]);

    // Group results by section for display
    const groupedResults = React.useMemo<GroupedResults[]>(() => {
        if (!query && recentPaths.length > 0) {
            // Show "Recent" section first
            const recentItems = recentPaths
                .map((p) => allCommands.find((c) => c.path === p))
                .filter(Boolean) as CommandItem[];

            const groups: GroupedResults[] = [];
            let flatIndex = 0;

            if (recentItems.length > 0) {
                groups.push({
                    section: "Recent",
                    items: recentItems.map((cmd) => ({ cmd, flatIndex: flatIndex++ })),
                });
            }

            const recentIds = new Set(recentItems.map((r) => r.id));
            const rest = filteredCommands.filter((c) => !recentIds.has(c.id));

            const sectionMap = new Map<string, { cmd: CommandItem; flatIndex: number }[]>();
            rest.forEach((cmd) => {
                const existing = sectionMap.get(cmd.section) ?? [];
                existing.push({ cmd, flatIndex: flatIndex++ });
                sectionMap.set(cmd.section, existing);
            });
            sectionMap.forEach((items, section) => {
                groups.push({ section, items });
            });

            return groups;
        }

        const sectionMap = new Map<string, { cmd: CommandItem; flatIndex: number }[]>();
        filteredCommands.forEach((cmd, i) => {
            const existing = sectionMap.get(cmd.section) ?? [];
            existing.push({ cmd, flatIndex: i });
            sectionMap.set(cmd.section, existing);
        });

        const groups: GroupedResults[] = [];
        sectionMap.forEach((items, section) => {
            groups.push({ section, items });
        });
        return groups;
    }, [filteredCommands, query, recentPaths, allCommands]);

    // Reset selected index when results change
    React.useEffect(() => {
        setSelectedIndex(0);
    }, [filteredCommands.length]);

    // Scroll selected item into view
    React.useEffect(() => {
        if (!listRef.current) return;
        const selected = listRef.current.querySelector("[data-selected=true]");
        selected?.scrollIntoView({ block: "nearest" });
    }, [selectedIndex]);

    // Global keyboard shortcut
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
            if (e.key === "Escape") {
                setOpen(false);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Focus input when opened; trap focus inside panel
    React.useEffect(() => {
        if (open) {
            setQuery("");
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    // Focus trap
    React.useEffect(() => {
        if (!open) return;
        const handleTab = (e: KeyboardEvent) => {
            if (e.key !== "Tab" || !panelRef.current) return;
            const focusable = panelRef.current.querySelectorAll<HTMLElement>(
                'input, button, [tabindex]:not([tabindex="-1"])'
            );
            if (focusable.length === 0) return;
            const first = focusable[0] as HTMLElement | undefined;
            const last = focusable[focusable.length - 1] as HTMLElement | undefined;
            if (!first || !last) return;
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last?.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first?.focus();
            }
        };
        document.addEventListener("keydown", handleTab);
        return () => document.removeEventListener("keydown", handleTab);
    }, [open]);

    const handleSelect = React.useCallback(
        (item: CommandItem) => {
            // Track recent navigation
            setRecentPaths((prev) => {
                const next = [item.path, ...prev.filter((p) => p !== item.path)].slice(0, 5);
                try {
                    localStorage.setItem("pb-recent-nav", JSON.stringify(next));
                } catch {
                    /* ignore */
                }
                return next;
            });
            setOpen(false);
            router.push(item.path);
        },
        [router]
    );

    const handleKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((i) => Math.max(i - 1, 0));
                break;
            case "Enter":
                e.preventDefault();
                if (filteredCommands[selectedIndex]) {
                    handleSelect(filteredCommands[selectedIndex]);
                }
                break;
        }
    };

    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm animate-fade-in"
                onClick={() => setOpen(false)}
                aria-hidden="true"
            />

            {/* Command Panel */}
            <div
                ref={panelRef}
                className={cn(
                    "fixed top-[20%] left-1/2 -translate-x-1/2 z-50",
                    "w-[calc(100vw-2rem)] max-w-lg",
                    "bg-popover border border-border rounded-xl shadow-2xl overflow-hidden",
                    "animate-scale-in",
                    className
                )}
                role="dialog"
                aria-label="Command bar"
                aria-modal="true"
            >
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                    <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search pages, actions..."
                        className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                        aria-label="Search commands"
                        role="combobox"
                        aria-expanded="true"
                        aria-controls="command-results"
                        aria-activedescendant={filteredCommands[selectedIndex]?.id}
                    />
                    {query && (
                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full tabular-nums">
                            {filteredCommands.length}
                        </span>
                    )}
                    <kbd className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        esc
                    </kbd>
                    <button
                        onClick={() => setOpen(false)}
                        className="text-muted-foreground hover:text-foreground sm:hidden"
                        aria-label="Close command bar"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Results — grouped by section */}
                <div
                    ref={listRef}
                    id="command-results"
                    className="max-h-[320px] overflow-y-auto py-1"
                    role="listbox"
                    aria-label="Search results"
                >
                    {filteredCommands.length === 0 ? (
                        <div className="px-4 py-10 text-center">
                            <Sparkles className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">
                                No results for &ldquo;{query}&rdquo;
                            </p>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                                Try a different search term
                            </p>
                        </div>
                    ) : (
                        groupedResults.map((group) => (
                            <div key={group.section} className="mb-1">
                                <div className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                                    {group.section === "Recent" && <Clock className="h-3 w-3" />}
                                    {group.section}
                                </div>
                                {group.items.map(({ cmd, flatIndex }) => {
                                    const Icon = cmd.icon;
                                    return (
                                        <button
                                            key={cmd.id}
                                            id={cmd.id}
                                            data-selected={flatIndex === selectedIndex}
                                            onClick={() => handleSelect(cmd)}
                                            onMouseEnter={() => setSelectedIndex(flatIndex)}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors",
                                                flatIndex === selectedIndex
                                                    ? "bg-accent text-accent-foreground"
                                                    : "text-foreground hover:bg-accent/50"
                                            )}
                                            role="option"
                                            aria-selected={flatIndex === selectedIndex}
                                        >
                                            <Icon
                                                className={cn(
                                                    "h-4 w-4 shrink-0",
                                                    flatIndex === selectedIndex
                                                        ? "text-primary"
                                                        : "text-muted-foreground"
                                                )}
                                            />
                                            <span className="font-medium truncate flex-1">
                                                {cmd.title}
                                            </span>
                                            {flatIndex === selectedIndex && (
                                                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <kbd className="bg-muted px-1 py-0.5 rounded text-[10px]">↑↓</kbd>{" "}
                            navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="bg-muted px-1 py-0.5 rounded text-[10px]">↵</kbd> open
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="bg-muted px-1 py-0.5 rounded text-[10px]">esc</kbd>{" "}
                            close
                        </span>
                    </div>
                    <span className="flex items-center gap-1">
                        <Command className="h-3 w-3" />K
                    </span>
                </div>
            </div>
        </>
    );
}
