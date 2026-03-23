/**
 * @deprecated Use TabBar/TabPanel from '@/components/ui/tab-bar' for content tabs,
 * or SegmentedControl from '@/components/ui/segmented-control' for view-mode toggles.
 * This module is retained only for backward compatibility and will be removed in a future release.
 */
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
    value: string;
    onValueChange: (value: string) => void;
    idPrefix: string;
    orientation: "horizontal" | "vertical";
}

const TabsContext = React.createContext<TabsContextValue>({
    value: "",
    onValueChange: () => {},
    idPrefix: "tabs",
    orientation: "horizontal",
});

const _tabsDeprecationWarned = { current: false };

export function Tabs({
    value,
    onValueChange,
    children,
    className,
    idPrefix,
    orientation = "horizontal",
}: {
    value: string;
    onValueChange: (v: string) => void;
    children: React.ReactNode;
    className?: string | undefined;
    idPrefix?: string | undefined;
    orientation?: "horizontal" | "vertical" | undefined;
}) {
    const reactId = React.useId();
    const generatedIdPrefix = React.useMemo(() => `tabs-${reactId.replace(/:/g, "")}`, [reactId]);
    const resolvedIdPrefix = idPrefix ?? generatedIdPrefix;

    React.useEffect(() => {
        if (!_tabsDeprecationWarned.current) {
            _tabsDeprecationWarned.current = true;
            // eslint-disable-next-line no-console
            console.warn(
                "[FrozenPhoenix] <Tabs> is deprecated. Use <TabBar>/<TabPanel> from '@/components/ui/tab-bar' for content tabs, or <SegmentedControl> from '@/components/ui/segmented-control' for view-mode toggles. This component will be removed in a future release."
            );
        }
    }, []);

    return (
        <TabsContext.Provider
            value={{ value, onValueChange, idPrefix: resolvedIdPrefix, orientation }}
        >
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    );
}

export function TabsList({
    children,
    className,
    ariaLabel,
    orientation,
}: {
    children: React.ReactNode;
    className?: string | undefined;
    ariaLabel?: string | undefined;
    orientation?: "horizontal" | "vertical" | undefined;
}) {
    const {
        value: selectedValue,
        onValueChange,
        orientation: contextOrientation,
    } = React.useContext(TabsContext);
    const tabsRef = React.useRef<HTMLDivElement>(null);
    const resolvedOrientation = orientation ?? contextOrientation;

    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            const tabButtons = Array.from(
                tabsRef.current?.querySelectorAll<HTMLButtonElement>(
                    "[role='tab']:not([disabled])"
                ) ?? []
            );
            if (tabButtons.length === 0) return;

            const currentIndex = tabButtons.findIndex(
                (tabButton) => tabButton.dataset.tabValue === selectedValue
            );
            let nextIndex = currentIndex;

            switch (e.key) {
                case "ArrowRight":
                    if (resolvedOrientation !== "horizontal") return;
                    e.preventDefault();
                    nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % tabButtons.length;
                    break;
                case "ArrowLeft":
                    if (resolvedOrientation !== "horizontal") return;
                    e.preventDefault();
                    nextIndex =
                        currentIndex < 0
                            ? 0
                            : (currentIndex - 1 + tabButtons.length) % tabButtons.length;
                    break;
                case "ArrowDown":
                    if (resolvedOrientation !== "vertical") return;
                    e.preventDefault();
                    nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % tabButtons.length;
                    break;
                case "ArrowUp":
                    if (resolvedOrientation !== "vertical") return;
                    e.preventDefault();
                    nextIndex =
                        currentIndex < 0
                            ? 0
                            : (currentIndex - 1 + tabButtons.length) % tabButtons.length;
                    break;
                case "Home":
                    e.preventDefault();
                    nextIndex = 0;
                    break;
                case "End":
                    e.preventDefault();
                    nextIndex = tabButtons.length - 1;
                    break;
                default:
                    return;
            }

            const nextTab = tabButtons[nextIndex];
            const nextValue = nextTab?.dataset.tabValue;

            if (nextTab && nextValue) {
                onValueChange(nextValue);
                nextTab.focus();
            }
        },
        [onValueChange, resolvedOrientation, selectedValue]
    );

    return (
        <div
            ref={tabsRef}
            role="tablist"
            aria-orientation={resolvedOrientation}
            aria-label={ariaLabel ?? "Tabs"}
            onKeyDown={handleKeyDown}
            className={cn(
                "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
                resolvedOrientation === "vertical" && "h-auto flex-col items-stretch",
                className
            )}
        >
            {children}
        </div>
    );
}

export function TabsTrigger({
    value,
    children,
    className,
}: {
    value: string;
    children: React.ReactNode;
    className?: string | undefined;
}) {
    const {
        value: selectedValue,
        onValueChange,
        idPrefix,
        orientation,
    } = React.useContext(TabsContext);
    return (
        <button
            type="button"
            role="tab"
            aria-selected={selectedValue === value}
            aria-controls={`${idPrefix}-tabpanel-${value}`}
            id={`${idPrefix}-tab-${value}`}
            data-tab-value={value}
            tabIndex={selectedValue === value ? 0 : -1}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                orientation === "vertical" && "justify-start",
                selectedValue === value && "bg-background text-foreground shadow-sm",
                className
            )}
            onClick={() => onValueChange(value)}
        >
            {children}
        </button>
    );
}

export function TabsContent({
    value,
    children,
    className,
}: {
    value: string;
    children: React.ReactNode;
    className?: string | undefined;
}) {
    const { value: selectedValue, idPrefix } = React.useContext(TabsContext);
    if (selectedValue !== value) return null;
    return (
        <div
            role="tabpanel"
            id={`${idPrefix}-tabpanel-${value}`}
            aria-labelledby={`${idPrefix}-tab-${value}`}
            tabIndex={0}
            className={cn(
                "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                className
            )}
        >
            {children}
        </div>
    );
}
