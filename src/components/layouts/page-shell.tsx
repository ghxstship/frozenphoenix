"use client";

/**
 * @deprecated This entire module is deprecated. Zero consumers remain.
 * New pages should use one of the purpose-built shells:
 * - ListPageShell, DetailPageShell, OperationalDashboardShell,
 *   SettingsPageShell, WizardShell, FormPageShell
 */

import React from "react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { TabBar } from "@/components/ui/tab-bar";
import type { TabBarItem } from "@/components/ui/tab-bar";

/** @deprecated Use TabBarItem from '@/components/ui/tab-bar' directly */
export type TabConfig = TabBarItem;

/** @internal Retained for justified-bespoke pages. New pages should not use this type. */
export interface BreadcrumbItem {
    label: string;
    href?: string;
}

/** @internal Retained for justified-bespoke pages. New pages should use a purpose-built shell. */
export interface PageShellProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    tabs?: TabBarItem[];
    activeTab?: string;
    onTabChange?: (tabId: string) => void;
    breadcrumbs?: BreadcrumbItem[];
    className?: string;
    children: React.ReactNode;
}

/**
 * @internal Legacy thin wrapper — retained for 21 justified-bespoke pages (tool/editor patterns).
 * New pages should use one of the purpose-built shells:
 * - `ListPageShell` — list / card-grid pages
 * - `DetailPageShell` — record detail pages
 * - `OperationalDashboardShell` — stats + tabs + card grids
 * - `SettingsPageShell` — settings panels
 * - `WizardShell` — multi-step flows
 * - `FormPageShell` — create/edit forms
 */
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
    const hasTabs = Boolean(tabs && tabs.length > 0);
    const tabIdPrefix = `page-shell-${React.useId().replace(/:/g, "")}`;
    const resolvedActiveTab = activeTab ?? tabs?.[0]?.id;

    return (
        <div className={cn("density-gap-page motion-safe:animate-fade-in", className)}>
            <PageHeader title={title} description={description}>
                {actions}
            </PageHeader>

            {hasTabs && resolvedActiveTab && tabs && (
                <TabBar
                    items={tabs}
                    value={resolvedActiveTab}
                    onValueChange={(tabId) => onTabChange?.(tabId)}
                    idPrefix={tabIdPrefix}
                    ariaLabel="Page tabs"
                    className="overflow-x-auto scrollbar-hide"
                />
            )}

            <div
                className={
                    hasTabs && resolvedActiveTab
                        ? "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        : undefined
                }
                role={hasTabs && resolvedActiveTab ? "tabpanel" : undefined}
                id={
                    hasTabs && resolvedActiveTab
                        ? `${tabIdPrefix}-tabpanel-${resolvedActiveTab}`
                        : undefined
                }
                aria-labelledby={
                    hasTabs && resolvedActiveTab
                        ? `${tabIdPrefix}-tab-${resolvedActiveTab}`
                        : undefined
                }
                tabIndex={hasTabs && resolvedActiveTab ? 0 : undefined}
            >
                {children}
            </div>
        </div>
    );
}

PageShell.displayName = "PageShell";
