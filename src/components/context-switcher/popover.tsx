"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useFocusTrap, useId } from "@/hooks/use-accessibility";
import { Check, Loader2, Plus, Search, X } from "lucide-react";
import { CONTEXT_SWITCHER_STRINGS } from "@/lib/i18n/context-switcher-strings";
import type { SwitcherItem } from "@/types/workspace-context";

// ─── Props ───────────────────────────────────────────────────

export interface ContextSwitcherPopoverProps {
    items: SwitcherItem[];
    activeId: string | null;
    onSelect: (id: string) => void;
    onClear?: (() => void) | undefined;
    clearLabel?: string | undefined;
    searchPlaceholder?: string | undefined;
    createLabel?: string | undefined;
    createHref?: string | undefined;
    onCreateClick?: (() => void) | undefined;
    viewAllLabel?: string | undefined;
    viewAllHref?: string | undefined;
    isLoading?: boolean | undefined;
    emptyMessage?: string | undefined;
    canCreate?: boolean | undefined;
    trigger: React.ReactNode;
    align?: "start" | "end" | undefined;
    width?: number | string | undefined;
    label?: string | undefined;
}

// ─── Component ───────────────────────────────────────────────

export function ContextSwitcherPopover({
    items,
    activeId,
    onSelect,
    onClear,
    clearLabel,
    searchPlaceholder = "Search\u2026",
    createLabel,
    createHref,
    onCreateClick,
    viewAllLabel,
    viewAllHref,
    isLoading = false,
    emptyMessage = "No items found",
    canCreate = false,
    trigger,
    align = "start",
    width = 260,
    label = "Switcher",
}: ContextSwitcherPopoverProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [focusIndex, setFocusIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const trapRef = useFocusTrap(open);
    const listboxId = useId("ctx-listbox");

    // ── Filtered items ───────────────────────────────────────
    const filtered = useMemo(() => {
        if (!query.trim()) return items;
        const q = query.toLowerCase();
        return items.filter((item) => item.name.toLowerCase().includes(q));
    }, [items, query]);

    // ── Build selectable list (clear option + filtered items) ─
    const selectableItems = useMemo(() => {
        const list: Array<{ id: string | null; name: string; isClear?: boolean }> = [];
        if (onClear && clearLabel) {
            list.push({ id: null, name: clearLabel, isClear: true });
        }
        for (const item of filtered) {
            list.push({ id: item.id, name: item.name });
        }
        return list;
    }, [filtered, onClear, clearLabel]);

    // ── Open / Close ─────────────────────────────────────────
    const openPopover = useCallback(() => {
        setOpen(true);
        setQuery("");
        setFocusIndex(-1);
        requestAnimationFrame(() => searchRef.current?.focus());
    }, []);

    const closePopover = useCallback(() => {
        setOpen(false);
        setQuery("");
        setFocusIndex(-1);
    }, []);

    // ── Click outside ────────────────────────────────────────
    useEffect(() => {
        if (!open) return;
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                closePopover();
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open, closePopover]);

    // ── Keyboard navigation ──────────────────────────────────
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setFocusIndex((prev) => Math.min(prev + 1, selectableItems.length - 1));
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setFocusIndex((prev) => Math.max(prev - 1, 0));
                    break;
                case "Enter": {
                    e.preventDefault();
                    const item = selectableItems[focusIndex];
                    if (item) {
                        if (item.isClear && onClear) {
                            onClear();
                        } else if (item.id) {
                            onSelect(item.id);
                        }
                        closePopover();
                    }
                    break;
                }
                case "Escape":
                    e.preventDefault();
                    closePopover();
                    break;
            }
        },
        [selectableItems, focusIndex, onSelect, onClear, closePopover]
    );

    // ── Scroll focused item into view ────────────────────────
    useEffect(() => {
        if (focusIndex < 0 || !listRef.current) return;
        const el = listRef.current.children[focusIndex] as HTMLElement | undefined;
        el?.scrollIntoView({ block: "nearest" });
    }, [focusIndex]);

    // ── Selection handler ────────────────────────────────────
    const handleSelect = useCallback(
        (id: string | null, isClear?: boolean) => {
            if (isClear && onClear) {
                onClear();
            } else if (id) {
                onSelect(id);
            }
            closePopover();
        },
        [onSelect, onClear, closePopover]
    );

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger */}
            <div
                role="button"
                tabIndex={0}
                onClick={openPopover}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openPopover();
                    }
                }}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={label}
                className="cursor-pointer"
            >
                {trigger}
            </div>

            {/* Popover */}
            {open && (
                <div
                    ref={trapRef as React.RefObject<HTMLDivElement>}
                    className={cn(
                        "absolute z-50 mt-1 rounded-lg border bg-popover text-popover-foreground shadow-lg",
                        "animate-in fade-in-0 zoom-in-95 duration-100",
                        align === "end" ? "right-0" : "left-0"
                    )}
                    style={{ width }}
                    role="dialog"
                    aria-label={label}
                    onKeyDown={handleKeyDown}
                >
                    {/* Search */}
                    <div className="flex items-center gap-2 px-3 py-2 border-b">
                        <Search className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                        <input
                            ref={searchRef}
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setFocusIndex(-1);
                            }}
                            placeholder={searchPlaceholder}
                            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/40"
                            aria-label={searchPlaceholder}
                        />
                        {query && (
                            <button
                                onClick={() => {
                                    setQuery("");
                                    searchRef.current?.focus();
                                }}
                                className="h-4 w-4 rounded-sm flex items-center justify-center text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                                aria-label={CONTEXT_SWITCHER_STRINGS.shared.close}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                        <kbd className="density-caption text-muted-foreground/30 bg-muted px-1 py-0.5 rounded font-mono">
                            Esc
                        </kbd>
                    </div>

                    {/* List */}
                    <div
                        ref={listRef}
                        id={listboxId}
                        role="listbox"
                        aria-label={label}
                        className="max-h-64 overflow-y-auto py-1"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-4 w-4 motion-safe:animate-spin text-muted-foreground" />
                                <span className="ml-2 text-xs text-muted-foreground">
                                    {CONTEXT_SWITCHER_STRINGS.shared.loading}
                                </span>
                            </div>
                        ) : selectableItems.length === 0 ? (
                            <div className="px-3 py-6 text-center">
                                <p className="text-xs text-muted-foreground/60">
                                    {query
                                        ? CONTEXT_SWITCHER_STRINGS.shared.noResults.replace(
                                              "{query}",
                                              query
                                          )
                                        : emptyMessage}
                                </p>
                            </div>
                        ) : (
                            selectableItems.map((item, i) => {
                                const isActive = item.isClear
                                    ? activeId === null
                                    : item.id === activeId;
                                const isFocused = i === focusIndex;

                                return (
                                    <div
                                        key={item.id ?? "__clear__"}
                                        role="option"
                                        aria-selected={isActive}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer transition-colors",
                                            isFocused && "bg-accent",
                                            isActive
                                                ? "text-foreground font-medium"
                                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                        )}
                                        onClick={() => handleSelect(item.id, item.isClear)}
                                        onMouseEnter={() => setFocusIndex(i)}
                                    >
                                        <span className="flex-1 truncate">{item.name}</span>
                                        {isActive && (
                                            <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer actions */}
                    {(canCreate || viewAllLabel) && (
                        <div className="border-t py-1">
                            {canCreate && createLabel && (
                                <a
                                    href={createHref ?? "#"}
                                    onClick={(e) => {
                                        if (onCreateClick) {
                                            e.preventDefault();
                                            onCreateClick();
                                            closePopover();
                                        }
                                    }}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    {createLabel}
                                </a>
                            )}
                            {viewAllLabel && viewAllHref && (
                                <a
                                    href={viewAllHref}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                                    onClick={closePopover}
                                >
                                    {viewAllLabel}
                                </a>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
