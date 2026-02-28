"use client";

import React, { useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";

export interface TabConfig {
    id: string;
    label: string;
    href?: string;
    count?: number;
}

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

export interface PageShellProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    tabs?: TabConfig[];
    activeTab?: string;
    onTabChange?: (tabId: string) => void;
    breadcrumbs?: BreadcrumbItem[];
    className?: string;
    children: React.ReactNode;
}

export function PageShell({
    title,
    description,
    actions,
    tabs,
    activeTab,
    onTabChange,
    className,
    children,
}: PageShellProps) {
    const tabsRef = useRef<HTMLDivElement>(null);

    const handleTabKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
        if (!tabs || !tabsRef.current) return;
        const buttons = tabsRef.current.querySelectorAll<HTMLButtonElement>("[role='tab']");
        let next = index;

        if (e.key === "ArrowRight") { e.preventDefault(); next = (index + 1) % tabs.length; }
        else if (e.key === "ArrowLeft") { e.preventDefault(); next = (index - 1 + tabs.length) % tabs.length; }
        else if (e.key === "Home") { e.preventDefault(); next = 0; }
        else if (e.key === "End") { e.preventDefault(); next = tabs.length - 1; }
        else return;

        buttons[next]?.focus();
        const nextTab = tabs[next];
        if (nextTab) onTabChange?.(nextTab.id);
    }, [tabs, onTabChange]);

    return (
        <div className={cn("space-y-6 animate-fade-in", className)}>
            <PageHeader title={title} description={description}>
                {actions}
            </PageHeader>

            {tabs && tabs.length > 0 && (
                <div
                    ref={tabsRef}
                    className="flex gap-1 border-b border-border overflow-x-auto scrollbar-hide"
                    role="tablist"
                    aria-label="Page tabs"
                >
                    {tabs.map((tab, index) => (
                        <button
                            key={tab.id}
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            aria-controls={`tabpanel-${tab.id}`}
                            tabIndex={activeTab === tab.id ? 0 : -1}
                            onClick={() => onTabChange?.(tab.id)}
                            onKeyDown={(e) => handleTabKeyDown(e, index)}
                            className={cn(
                                "px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                                activeTab === tab.id
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                            )}
                        >
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className={cn(
                                    "ml-2 text-xs px-1.5 py-0.5 rounded-full tabular-nums",
                                    activeTab === tab.id
                                        ? "bg-primary/15 text-primary"
                                        : "bg-muted text-muted-foreground"
                                )}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            <div role="tabpanel" id={activeTab ? `tabpanel-${activeTab}` : undefined}>
                {children}
            </div>
        </div>
    );
}
