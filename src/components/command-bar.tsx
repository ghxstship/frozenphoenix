"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { navigationConfig } from "@/config/navigation";
import {
    Search,
    X,
    ArrowRight,
    Command,
} from "lucide-react";

interface CommandBarProps {
    className?: string;
}

interface CommandItem {
    id: string;
    title: string;
    path: string;
    section: string;
    icon?: React.ReactNode;
}

export function CommandBar({ className }: CommandBarProps) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const listRef = React.useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Build flat command list from navigation config
    const allCommands = React.useMemo<CommandItem[]>(() => {
        const items: CommandItem[] = [];
        navigationConfig.forEach((section) => {
            section.items.forEach((item) => {
                items.push({
                    id: item.path,
                    title: item.title,
                    path: item.path,
                    section: section.title,
                });
            });
        });
        return items;
    }, []);

    // Filter commands by query
    const filteredCommands = React.useMemo(() => {
        if (!query) return allCommands.slice(0, 20);
        const q = query.toLowerCase();
        return allCommands.filter(
            (cmd) =>
                cmd.title.toLowerCase().includes(q) ||
                cmd.section.toLowerCase().includes(q) ||
                cmd.path.toLowerCase().includes(q)
        );
    }, [query, allCommands]);

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

    // Focus input when opened
    React.useEffect(() => {
        if (open) {
            setQuery("");
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    const handleSelect = (item: CommandItem) => {
        setOpen(false);
        router.push(item.path);
    };

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
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                onClick={() => setOpen(false)}
                aria-hidden="true"
            />

            {/* Command Panel */}
            <div
                className={cn(
                    "fixed top-[20%] left-1/2 -translate-x-1/2 z-50",
                    "w-full max-w-lg",
                    "bg-popover border border-border rounded-xl shadow-2xl overflow-hidden",
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
                        aria-activedescendant={filteredCommands[selectedIndex]?.id}
                    />
                    <kbd className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        <span>esc</span>
                    </kbd>
                    <button
                        onClick={() => setOpen(false)}
                        className="text-muted-foreground hover:text-foreground sm:hidden"
                        aria-label="Close command bar"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Results */}
                <div
                    ref={listRef}
                    className="max-h-[300px] overflow-y-auto py-2"
                    role="listbox"
                    aria-label="Search results"
                >
                    {filteredCommands.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                            No results found
                        </div>
                    ) : (
                        filteredCommands.map((cmd, i) => (
                            <button
                                key={cmd.id}
                                data-selected={i === selectedIndex}
                                onClick={() => handleSelect(cmd)}
                                onMouseEnter={() => setSelectedIndex(i)}
                                className={cn(
                                    "w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left text-sm",
                                    "transition-colors",
                                    i === selectedIndex
                                        ? "bg-accent text-accent-foreground"
                                        : "text-foreground hover:bg-accent/50"
                                )}
                                role="option"
                                aria-selected={i === selectedIndex}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="font-medium truncate">{cmd.title}</span>
                                    <span className="text-xs text-muted-foreground truncate">{cmd.section}</span>
                                </div>
                                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            </button>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <kbd className="bg-muted px-1 py-0.5 rounded">↑↓</kbd> navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="bg-muted px-1 py-0.5 rounded">↵</kbd> select
                        </span>
                    </div>
                    <span className="flex items-center gap-1">
                        <Command className="h-3 w-3" />K to toggle
                    </span>
                </div>
            </div>
        </>
    );
}
