"use client";

/* ═══════════════════════════════════════════════════════════════
   OPERATIONAL DASHBOARD SHELL — Universal composable dashboard container

   Composes PermissionGate, PageHeader, StatCard grid, SearchInput,
   filter bar, and card list/grid from a pure-data DashboardPageConfig.
   Handles loading/error/empty states, search filtering, and URL-synced
   tab routing.

   Pattern A from NON_LIST_PAGE_INFRASTRUCTURE_AUDIT.md:
   PermissionGate → PageHeader → StatCard grid → Filter bar → Card list/grid

   Target: ~35 operational dashboard pages
   ═══════════════════════════════════════════════════════════════ */

import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { PermissionGate } from "@/components/app/permission-guard";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatsGrid } from "@/components/ui/stats-grid";
import { AlertBanner } from "@/components/ui/alert-banner";
import { LoadingState } from "@/components/layouts/loading-state";
import { ListToolbar } from "@/components/ui/filter-bar";
import { StaggerItem } from "@/components/ui/stagger-container";
import { Card, CardContent } from "@/components/ui/card";
import { TabBar, TabPanel } from "@/components/ui/tab-bar";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { Inbox } from "lucide-react";
import { SHELLS_STRINGS } from "@/lib/i18n/shells-strings";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";
import { computeStatValue, matchesSearch } from "@/lib/formatters/record-utils";
import type { EntityRecord } from "@/types/entity";

// ─── Types ───────────────────────────────────────────────────

type DataRow = EntityRecord;

export interface OperationalDashboardShellProps {
    config: DashboardPageConfig;
    /** External data array */
    data?: DataRow[] | null | undefined; /** External loading state */
    isLoading?:
        | boolean
        | undefined; /** Children override — when provided, replaces the card list entirely */
    children?: React.ReactNode | undefined;
}

// ─── Main Component ─────────────────────────────────────────

export function OperationalDashboardShell({
    config,
    data: externalData,
    isLoading = false,
    children,
}: OperationalDashboardShellProps) {
    const [search, setSearch] = useState("");

    // Tab state (URL-synced)
    const hasTabs = Boolean(config.tabs && config.tabs.length > 0);
    const tabIds = useMemo(() => (config.tabs ?? []).map((t) => t.id), [config.tabs]);
    const [activeTab, setActiveTab] = useQueryTabState({
        defaultValue: config.tabs?.[0]?.id ?? "default",
        validValues: tabIds,
    });

    const data = useMemo(() => externalData ?? [], [externalData]);

    // Search + filter
    const searchKeys = useMemo(() => config.searchKeys ?? [], [config.searchKeys]);
    const searchable = config.searchable !== false && searchKeys.length > 0;

    const filtered = useMemo(() => {
        let result = data;

        // Apply search
        if (search && searchKeys.length > 0) {
            result = result.filter((item) =>
                matchesSearch(item as EntityRecord, search, searchKeys)
            );
        }

        return result;
    }, [data, search, searchKeys]);

    // Stat values
    const statValues = useMemo(() => {
        if (!config.stats) return null;
        return config.stats.map((s) => ({
            label: s.label,
            value: computeStatValue(s, data),
            icon: s.icon,
        }));
    }, [config.stats, data]);

    // Active alerts
    const activeAlerts = useMemo(() => {
        if (!config.alerts) return [];
        return config.alerts.filter((a) => a.condition(data));
    }, [config.alerts, data]);

    // Tab items for TabBar
    const tabItems = useMemo(() => {
        if (!config.tabs) return [];
        return config.tabs.map((t) => ({
            id: t.id,
            label: t.label,
            icon: t.icon ? React.createElement(t.icon, { className: "h-4 w-4" }) : undefined,
        }));
    }, [config.tabs]);

    // Empty state
    const EmptyIcon = config.emptyState?.icon ?? Inbox;
    const emptyTitle = config.emptyState?.title ?? SHELLS_STRINGS.dashboard_no_data;
    const emptyDescription =
        config.emptyState?.description ?? SHELLS_STRINGS.dashboard_no_data_desc;

    // Loading state — must be after all hooks
    // Note: We do NOT return early. The shell chrome (header, actions) renders
    // immediately for perceived performance. Only the data-dependent content
    // area shows a skeleton while loading.

    return (
        <PermissionGate
            resource={config.resource}
            action={config.action as "read" | "write" | "delete" | "manage" | undefined}
        >
            <div className="density-gap-page motion-safe:animate-fade-in">
                {/* Header */}
                <PageHeader title={config.title} description={config.description}>
                    {config.headerActions}
                </PageHeader>

                {/* Stats — show skeleton placeholders while loading */}
                {statValues && statValues.length > 0 && (
                    <StatsGrid>
                        {statValues.map((s) => (
                            <StatCard
                                key={s.label}
                                title={s.label}
                                value={isLoading ? "—" : s.value}
                                icon={s.icon}
                            />
                        ))}
                    </StatsGrid>
                )}

                {/* Alerts */}
                {!isLoading &&
                    activeAlerts.map((alert, i) => {
                        const message =
                            typeof alert.message === "function"
                                ? alert.message(data)
                                : alert.message;
                        return (
                            <AlertBanner
                                key={i}
                                message={message}
                                severity={alert.severity ?? "warning"}
                                icon={alert.icon}
                            />
                        );
                    })}

                {/* After-stats slot */}
                {config.afterStatsSlot}

                {/* Canonical toolbar — always rendered */}
                {(searchable || config.searchState || config.toolbarActions) &&
                    (() => {
                        const toolbarProps: React.ComponentProps<typeof ListToolbar> = {};
                        if (config.searchState) {
                            toolbarProps.search = config.searchState;
                        } else if (searchable) {
                            toolbarProps.search = {
                                value: search,
                                onValueChange: setSearch,
                                placeholder:
                                    config.searchPlaceholder ??
                                    SHELLS_STRINGS.dashboard_search_placeholder,
                            };
                        }
                        if (config.toolbarActions) {
                            toolbarProps.actions = config.toolbarActions;
                        }
                        return <ListToolbar {...toolbarProps} />;
                    })()}

                {/* Content: show loading skeleton when data is still fetching */}
                {isLoading ? (
                    <LoadingState variant="table" rows={6} />
                ) : config.contentSlot ? (
                    config.contentSlot
                ) : (
                    <>
                        {/* Tabs */}
                        {hasTabs && config.tabs ? (
                            <>
                                <TabBar
                                    items={tabItems}
                                    value={activeTab}
                                    onValueChange={setActiveTab}
                                    ariaLabel={`${config.title} tabs`}
                                />
                                {config.tabs.map((tab) => (
                                    <TabPanel key={tab.id} value={tab.id} activeValue={activeTab}>
                                        {tab.content}
                                    </TabPanel>
                                ))}
                            </>
                        ) : (
                            <>
                                {/* Card list/grid or children */}
                                {children ? (
                                    children
                                ) : config.cardRenderer ? (
                                    filtered.length > 0 ? (
                                        <div
                                            className={cn(
                                                config.cardLayout === "grid"
                                                    ? (config.gridCols ??
                                                          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 density-gap-card")
                                                    : "density-gap-section"
                                            )}
                                        >
                                            {filtered.map((item, i) => (
                                                <StaggerItem
                                                    key={(item.id as string) ?? i}
                                                    index={i}
                                                    stagger="tight"
                                                >
                                                    {config.cardRenderer!(item, i)}
                                                </StaggerItem>
                                            ))}
                                        </div>
                                    ) : (
                                        <Card>
                                            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                                                <EmptyIcon className="h-10 w-10 text-muted-foreground/50 mb-3" />
                                                <h3 className="text-sm font-semibold">
                                                    {emptyTitle}
                                                </h3>
                                                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                                                    {emptyDescription}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    )
                                ) : null}
                            </>
                        )}

                        {/* After-cards slot */}
                        {config.afterCardsSlot}
                    </>
                )}
            </div>
        </PermissionGate>
    );
}

OperationalDashboardShell.displayName = "OperationalDashboardShell";
