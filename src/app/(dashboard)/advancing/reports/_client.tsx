"use client";

import * as React from "react";
import { BarChart3, DollarSign, Package, TrendingUp } from "lucide-react";
import { OperationalDashboardShell } from "@/components/shells";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/layouts/empty-state";
import { AdvanceStatusBadge } from "@/components/advancing";
import { useAdvances } from "@/lib/supabase/hooks-advancing";
import { useAdvancesRealtime } from "@/lib/supabase/realtime-advancing";
import { ADVANCE_STATUSES, formatAdvanceCost } from "@/config/advancing-config";
import type { AdvanceStatus } from "@/types";

export function AdvancingReportsPageClient() {
    useAdvancesRealtime();
    const { data: allAdvances, isLoading } = useAdvances({});

    const advances = React.useMemo(
        () => (allAdvances as Record<string, unknown>[] | undefined) ?? [],
        [allAdvances]
    );

    const statusBreakdown = React.useMemo(() => {
        const counts: Record<string, { count: number; value: number }> = {};
        for (const status of Object.keys(ADVANCE_STATUSES)) {
            counts[status] = { count: 0, value: 0 };
        }
        for (const a of advances) {
            const s = String(a.status ?? "draft");
            if (!counts[s]) counts[s] = { count: 0, value: 0 };
            counts[s].count += 1;
            counts[s].value += Number(a.total_estimated_cost ?? 0);
        }
        return counts;
    }, [advances]);

    const totalValue = advances.reduce((sum, a) => sum + Number(a.total_estimated_cost ?? 0), 0);
    const totalItems = advances.reduce((sum, a) => sum + Number(a.total_items ?? 0), 0);
    const avgValue = advances.length > 0 ? totalValue / advances.length : 0;

    const contentSlot = (
        <div className="density-gap-page">
            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
            ) : advances.length === 0 ? (
                <EmptyState
                    icon={BarChart3}
                    title="No data yet"
                    description="Reports will populate once advances are created"
                />
            ) : (
                <>
                    {/* Summary stats */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardContent className="pt-4">
                                <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                                    <Package className="h-4 w-4" />
                                    <span className="text-xs">Total Advances</span>
                                </div>
                                <p className="text-2xl font-bold">{advances.length}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                                    <DollarSign className="h-4 w-4" />
                                    <span className="text-xs">Total Value</span>
                                </div>
                                <p className="text-2xl font-bold">
                                    {formatAdvanceCost(totalValue)}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                                    <TrendingUp className="h-4 w-4" />
                                    <span className="text-xs">Avg Value</span>
                                </div>
                                <p className="text-2xl font-bold">{formatAdvanceCost(avgValue)}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="mb-1 text-xs text-muted-foreground">
                                    Total Line Items
                                </div>
                                <p className="text-2xl font-bold">{totalItems}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Status breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Status Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {Object.entries(statusBreakdown)
                                    .filter(([, v]) => v.count > 0)
                                    .map(([status, { count, value }]) => {
                                        const pct =
                                            advances.length > 0
                                                ? Math.round((count / advances.length) * 100)
                                                : 0;
                                        return (
                                            <div key={status} className="flex items-center gap-4">
                                                <AdvanceStatusBadge
                                                    status={status as AdvanceStatus}
                                                />
                                                <div className="flex-1">
                                                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className="h-full rounded-full bg-primary transition-all"
                                                            style={{
                                                                width: `${pct}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">
                                                    {count}
                                                </span>
                                                <span className="w-20 text-right text-xs font-medium tabular-nums">
                                                    {formatAdvanceCost(value)}
                                                </span>
                                            </div>
                                        );
                                    })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent advances */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Recent Advances</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y">
                                {advances.slice(0, 10).map((a) => (
                                    <div
                                        key={a.id as string}
                                        className="flex items-center gap-4 py-3"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono text-muted-foreground">
                                                    {String(a.advance_number)}
                                                </span>
                                                <AdvanceStatusBadge
                                                    status={a.status as AdvanceStatus}
                                                />
                                            </div>
                                            <p className="mt-0.5 truncate text-sm font-medium">
                                                {String(a.title)}
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-sm font-semibold tabular-nums">
                                                {formatAdvanceCost(
                                                    Number(a.total_estimated_cost ?? 0)
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(
                                                    String(a.created_at)
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );

    const config: DashboardPageConfig = {
        resource: "advancing",
        action: "manage",
        title: "Advancing Reports",
        description: "Analytics and reporting for production advances",
        contentSlot,
    };

    return <OperationalDashboardShell config={config} />;
}
