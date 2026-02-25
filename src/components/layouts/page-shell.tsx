"use client";

import React from "react";
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
    return (
        <div className={cn("space-y-6 animate-fade-in", className)}>
            <PageHeader title={title} description={description}>
                {actions}
            </PageHeader>

            {tabs && tabs.length > 0 && (
                <div className="flex gap-1 border-b border-border">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange?.(tab.id)}
                            className={cn(
                                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
                                activeTab === tab.id
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                            )}
                        >
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className="ml-2 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {children}
        </div>
    );
}
