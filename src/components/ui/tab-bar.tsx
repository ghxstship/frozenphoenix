"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "@/lib/motion";
import { SlidingIndicator } from "@/components/ui/sliding-indicator";

export interface TabBarItem {
    id: string;
    label: string;
    count?: number;
    icon?: React.ReactNode;
    disabled?: boolean;
}

export interface TabBarProps {
    items: TabBarItem[];
    value: string;
    onValueChange: (value: string) => void;
    size?: "sm" | "md";
    variant?: "underline" | "pill";
    orientation?: "horizontal" | "vertical";
    ariaLabel?: string;
    idPrefix?: string;
    className?: string;
    /** When set, syncs the active tab with a URL search parameter (e.g. "tab" → ?tab=value).
     *  Also persists to localStorage as fallback. URL takes precedence on mount. */
    urlParam?: string;
}

/**
 * Hook that syncs tab state with URL searchParams and localStorage.
 * Returns the resolved initial value and an onChange wrapper.
 */
function useUrlTabState(
    urlParam: string | undefined,
    value: string,
    onValueChange: (v: string) => void,
    items: TabBarItem[]
) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // On mount, resolve initial value from URL > localStorage > prop default
    const didInit = React.useRef(false);
    React.useEffect(() => {
        if (!urlParam || didInit.current) return;
        didInit.current = true;

        const fromUrl = searchParams.get(urlParam);
        if (fromUrl && items.some((i) => i.id === fromUrl)) {
            onValueChange(fromUrl);
            return;
        }

        const storageKey = `fp-tab-${urlParam}`;
        try {
            const fromStorage = localStorage.getItem(storageKey);
            if (fromStorage && items.some((i) => i.id === fromStorage)) {
                onValueChange(fromStorage);
            }
        } catch {
            // localStorage unavailable
        }
    }, [urlParam, searchParams, items, onValueChange]);

    // Wrapped onChange that also updates URL + localStorage
    const handleChange = React.useCallback(
        (newValue: string) => {
            onValueChange(newValue);

            if (!urlParam) return;

            // Update URL search param via router.replace (no history entry)
            const params = new URLSearchParams(searchParams.toString());
            params.set(urlParam, newValue);
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });

            // Persist to localStorage as fallback
            try {
                localStorage.setItem(`fp-tab-${urlParam}`, newValue);
            } catch {
                // localStorage unavailable
            }
        },
        [onValueChange, urlParam, router, pathname, searchParams]
    );

    return { handleChange };
}

export function TabBar({
    items,
    value,
    onValueChange,
    size = "md",
    variant = "underline",
    orientation = "horizontal",
    ariaLabel,
    idPrefix,
    className,
    urlParam,
}: TabBarProps) {
    const { handleChange } = useUrlTabState(urlParam, value, onValueChange, items);
    const tabListRef = React.useRef<HTMLDivElement>(null);
    const prefix = idPrefix ? `${idPrefix}-` : "";

    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent) => {
            const enabledItems = items.filter((item) => !item.disabled);
            if (enabledItems.length === 0) return;

            const currentIndex = enabledItems.findIndex((item) => item.id === value);
            let nextIndex = currentIndex;

            switch (e.key) {
                case "ArrowRight":
                    if (orientation !== "horizontal") return;
                    e.preventDefault();
                    nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % enabledItems.length;
                    break;
                case "ArrowLeft":
                    if (orientation !== "horizontal") return;
                    e.preventDefault();
                    nextIndex =
                        currentIndex < 0
                            ? 0
                            : (currentIndex - 1 + enabledItems.length) % enabledItems.length;
                    break;
                case "ArrowDown":
                    if (orientation !== "vertical") return;
                    e.preventDefault();
                    nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % enabledItems.length;
                    break;
                case "ArrowUp":
                    if (orientation !== "vertical") return;
                    e.preventDefault();
                    nextIndex =
                        currentIndex < 0
                            ? 0
                            : (currentIndex - 1 + enabledItems.length) % enabledItems.length;
                    break;
                case "Home":
                    e.preventDefault();
                    nextIndex = 0;
                    break;
                case "End":
                    e.preventDefault();
                    nextIndex = enabledItems.length - 1;
                    break;
                default:
                    return;
            }

            const nextItem = enabledItems[nextIndex];
            if (nextItem) {
                handleChange(nextItem.id);
                const btn = Array.from(
                    tabListRef.current?.querySelectorAll<HTMLButtonElement>("[role='tab']") ?? []
                ).find((tabButton) => tabButton.dataset.tabValue === nextItem.id);
                btn?.focus();
            }
        },
        [items, value, handleChange, orientation]
    );

    const activeSelector = `[data-tab-value="${value}"]`;

    return (
        <div
            ref={tabListRef}
            role="tablist"
            aria-orientation={orientation}
            aria-label={ariaLabel ?? "Tabs"}
            onKeyDown={handleKeyDown}
            className={cn(
                "relative flex",
                orientation === "vertical" && "flex-col",
                variant === "underline" &&
                    orientation === "horizontal" &&
                    "gap-1 border-b border-border",
                variant === "underline" &&
                    orientation === "vertical" &&
                    "gap-1 border-r border-border",
                variant === "pill" && "gap-1 bg-muted p-1 rounded-lg",
                className
            )}
        >
            {variant === "pill" && (
                <SlidingIndicator
                    containerRef={tabListRef}
                    activeSelector={activeSelector}
                    layoutDirection={orientation}
                    className="bg-background rounded-md shadow-sm z-0"
                />
            )}
            {items.map((item) => (
                <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={value === item.id}
                    aria-controls={`${prefix}tabpanel-${item.id}`}
                    id={`${prefix}tab-${item.id}`}
                    data-tab-value={item.id}
                    disabled={item.disabled}
                    tabIndex={value === item.id ? 0 : -1}
                    onClick={() => handleChange(item.id)}
                    className={cn(
                        "relative z-[var(--z-tab-active)] inline-flex items-center whitespace-nowrap font-medium transition-colors",
                        orientation === "horizontal" && "justify-center",
                        orientation === "vertical" && "justify-start",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        "disabled:pointer-events-none disabled:opacity-50",
                        size === "sm" ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm",
                        variant === "underline" &&
                            orientation === "horizontal" && [
                                "border-b-2 -mb-px",
                                value === item.id
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
                            ],
                        variant === "underline" &&
                            orientation === "vertical" && [
                                "border-r-2 -mr-px",
                                value === item.id
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
                            ],
                        variant === "pill" && [
                            "rounded-md",
                            value === item.id
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-foreground",
                        ]
                    )}
                >
                    {item.icon && <span className="mr-1.5">{item.icon}</span>}
                    {item.label}
                    {item.count !== undefined && item.count > 0 && (
                        <span
                            className={cn(
                                "ml-2 text-xs px-1.5 py-0.5 rounded-full tabular-nums",
                                value === item.id
                                    ? "bg-primary/10 text-primary"
                                    : "bg-muted text-muted-foreground"
                            )}
                        >
                            {item.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
    activeValue: string;
    tabId?: string;
    idPrefix?: string;
}

export function TabPanel({
    value,
    activeValue,
    tabId,
    idPrefix,
    className,
    children,
}: TabPanelProps) {
    const isActive = value === activeValue;
    const prefix = idPrefix ? `${idPrefix}-` : "";

    return (
        <AnimatePresence mode="wait">
            {isActive && (
                <motion.div
                    key={value}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    role="tabpanel"
                    id={`${prefix}tabpanel-${value}`}
                    aria-labelledby={tabId ?? `${prefix}tab-${value}`}
                    tabIndex={0}
                    className={cn(
                        "mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        className
                    )}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
