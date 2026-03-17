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
import { PermissionGate } from "@/components/permission-guard";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { LoadingState } from "@/components/layouts/loading-state";
import { StaggerItem } from "@/components/ui/stagger-container";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TabBar, TabPanel } from "@/components/ui/tab-bar";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { AlertTriangle, Inbox } from "lucide-react";
import type {
    DashboardFilterDef,
    DashboardPageConfig,
    DashboardStatDef,
} from "@/types/dashboard-page-config";

// ─── Types ───────────────────────────────────────────────────

type DataRow = Record<string, unknown>;

export interface OperationalDashboardShellProps {
    config: DashboardPageConfig;
    /** External data array */
    data?: DataRow[] | null;
    /** External loading state */
    isLoading?: boolean;
    /** Children override — when provided, replaces the card list entirely */
    children?: React.ReactNode;
}

// ─── Helpers ─────────────────────────────────────────────────

function getNestedValue(record: DataRow, key: string): unknown {
    const parts = key.split(".");
    let current: unknown = record;
    for (const part of parts) {
        if (current == null || typeof current !== "object") return undefined;
        current = (current as DataRow)[part];
    }
    return current;
}

function computeStatValue(stat: DashboardStatDef, data: DataRow[]): string | number {
    if (stat.compute) return stat.compute(data);
    if (stat.value != null) return stat.value;
    return "—";
}

function matchesSearch(item: DataRow, query: string, keys: string[]): boolean {
    if (!query) return true;
    const q = query.toLowerCase();
    return keys.some((key) => {
        const val = getNestedValue(item, key);
        return val != null && String(val).toLowerCase().includes(q);
    });
}

// ─── Main Component ─────────────────────────────────────────

export function OperationalDashboardShell({
    config,
    data: externalData,
    isLoading = false,
    children,
}: OperationalDashboardShellProps) {
    const [search, setSearch] = useState("");
    const [filterValues, setFilterValues] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        for (const f of config.filters ?? []) {
            initial[f.id] = f.defaultValue ?? f.options[0]?.value ?? "all";
        }
        return initial;
    });

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
            result = result.filter((item) => matchesSearch(item, search, searchKeys));
        }

        // Apply filters
        for (const filterDef of config.filters ?? []) {
            const val = filterValues[filterDef.id];
            if (val && val !== "all") {
                result = result.filter((item) => filterDef.predicate(item, val));
            }
        }

        return result;
    }, [data, search, searchKeys, config.filters, filterValues]);

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
    const emptyTitle = config.emptyState?.title ?? "No data";
    const emptyDescription =
        config.emptyState?.description ?? "No records found matching your criteria.";

    // Loading state — must be after all hooks
    if (isLoading) return <LoadingState />;

    return (
        <PermissionGate
            resource={config.resource}
            action={config.action as "read" | "write" | "delete" | "manage" | undefined}
        >
            <div className="space-y-6 motion-safe:animate-fade-in">
                {/* Header */}
                <PageHeader title={config.title} description={config.description}>
                    {config.headerActions}
                </PageHeader>

                {/* Stats */}
                {statValues && statValues.length > 0 && (
                    <div
                        className={cn(
                            "grid gap-4",
                            statValues.length <= 2
                                ? "grid-cols-1 sm:grid-cols-2"
                                : statValues.length === 3
                                  ? "grid-cols-1 sm:grid-cols-3"
                                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                        )}
                    >
                        {statValues.map((s) => (
                            <StatCard key={s.label} title={s.label} value={s.value} icon={s.icon} />
                        ))}
                    </div>
                )}

                {/* Alerts */}
                {activeAlerts.map((alert, i) => {
                    const AlertIcon = alert.icon ?? AlertTriangle;
                    const severity = alert.severity ?? "warning";
                    const message =
                        typeof alert.message === "function" ? alert.message(data) : alert.message;
                    return (
                        <Card
                            key={i}
                            className={cn(
                                severity === "warning" && "border-warning/30 bg-warning/5",
                                severity === "destructive" &&
                                    "border-destructive/30 bg-destructive/5",
                                severity === "info" && "border-info/30 bg-info/5"
                            )}
                        >
                            <CardContent className="py-3 flex items-center gap-3">
                                <AlertIcon
                                    className={cn(
                                        "h-5 w-5 shrink-0",
                                        severity === "warning" && "text-warning",
                                        severity === "destructive" && "text-destructive",
                                        severity === "info" && "text-info"
                                    )}
                                />
                                <p
                                    className={cn(
                                        "text-sm font-medium",
                                        severity === "warning" && "text-warning",
                                        severity === "destructive" && "text-destructive",
                                        severity === "info" && "text-info"
                                    )}
                                >
                                    {message}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}

                {/* After-stats slot */}
                {config.afterStatsSlot}

                {/* Content slot override */}
                {config.contentSlot ? (
                    config.contentSlot
                ) : (
                    <>
                        {/* Search + Filters */}
                        {(searchable || (config.filters && config.filters.length > 0)) && (
                            <div className="flex flex-col sm:flex-row gap-3">
                                {searchable && (
                                    <SearchInput
                                        value={search}
                                        onValueChange={setSearch}
                                        placeholder={config.searchPlaceholder ?? "Search..."}
                                        className="max-w-sm"
                                    />
                                )}
                                {config.filters?.map((filterDef) => (
                                    <FilterControl
                                        key={filterDef.id}
                                        filter={filterDef}
                                        value={filterValues[filterDef.id] ?? "all"}
                                        onChange={(val) =>
                                            setFilterValues((prev) => ({
                                                ...prev,
                                                [filterDef.id]: val,
                                            }))
                                        }
                                    />
                                ))}
                            </div>
                        )}

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
                                                          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4")
                                                    : "space-y-2"
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

// ─── Filter Control ─────────────────────────────────────────

function FilterControl({
    filter,
    value,
    onChange,
}: {
    filter: DashboardFilterDef;
    value: string;
    onChange: (value: string) => void;
}) {
    if (filter.type === "button-group") {
        return (
            <div className="flex gap-1.5" role="group" aria-label={filter.label}>
                {filter.options.map((opt) => (
                    <Button
                        key={opt.value}
                        variant={value === opt.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => onChange(opt.value)}
                    >
                        {opt.label}
                    </Button>
                ))}
            </div>
        );
    }

    // select
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label={filter.label}
        >
            {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
}
