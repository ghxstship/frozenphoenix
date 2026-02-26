"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

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
    className?: string;
}

export function TabBar({
    items,
    value,
    onValueChange,
    size = "md",
    variant = "underline",
    className,
}: TabBarProps) {
    const tabListRef = React.useRef<HTMLDivElement>(null);

    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent) => {
            const enabledItems = items.filter((item) => !item.disabled);
            const currentIndex = enabledItems.findIndex((item) => item.id === value);
            let nextIndex = currentIndex;

            switch (e.key) {
                case "ArrowRight":
                    e.preventDefault();
                    nextIndex = (currentIndex + 1) % enabledItems.length;
                    break;
                case "ArrowLeft":
                    e.preventDefault();
                    nextIndex = (currentIndex - 1 + enabledItems.length) % enabledItems.length;
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
                onValueChange(nextItem.id);
                const btn = tabListRef.current?.querySelector<HTMLButtonElement>(`#tab-${nextItem.id}`);
                btn?.focus();
            }
        },
        [items, value, onValueChange]
    );

    return (
        <div
            ref={tabListRef}
            role="tablist"
            aria-orientation="horizontal"
            onKeyDown={handleKeyDown}
            className={cn(
                "flex",
                variant === "underline" && "gap-1 border-b border-border",
                variant === "pill" && "gap-1 bg-muted p-1 rounded-lg",
                className
            )}
        >
            {items.map((item) => (
                <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={value === item.id}
                    aria-controls={`tabpanel-${item.id}`}
                    id={`tab-${item.id}`}
                    disabled={item.disabled}
                    tabIndex={value === item.id ? 0 : -1}
                    onClick={() => onValueChange(item.id)}
                    className={cn(
                        "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        "disabled:pointer-events-none disabled:opacity-50",
                        size === "sm" ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm",
                        variant === "underline" && [
                            "border-b-2 -mb-px",
                            value === item.id
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
                        ],
                        variant === "pill" && [
                            "rounded-md",
                            value === item.id
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground",
                        ]
                    )}
                >
                    {item.icon && <span className="mr-1.5">{item.icon}</span>}
                    {item.label}
                    {item.count !== undefined && (
                        <span className={cn(
                            "ml-2 text-xs px-1.5 py-0.5 rounded-full",
                            value === item.id
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                        )}>
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
}

export function TabPanel({
    value,
    activeValue,
    tabId,
    className,
    children,
    ...props
}: TabPanelProps) {
    if (value !== activeValue) return null;

    return (
        <div
            role="tabpanel"
            id={`tabpanel-${value}`}
            aria-labelledby={tabId ?? `tab-${value}`}
            tabIndex={0}
            className={cn("mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}
            {...props}
        >
            {children}
        </div>
    );
}
