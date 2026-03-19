"use client";

import * as React from "react";
import { AlertTriangle, Box, Package } from "lucide-react";
import { OperationalDashboardShell } from "@/components/shells";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/layouts/empty-state";
import { useCatalogItems } from "@/lib/supabase/hooks-advancing";
import { formatAdvanceCost } from "@/config/advancing-config";

export function AdvancingInventoryPageClient() {
    const [searchQuery, setSearchQuery] = React.useState("");
    const { data: items, isLoading } = useCatalogItems();

    const itemList = React.useMemo(
        () => (items as Record<string, unknown>[] | undefined) ?? [],
        [items]
    );

    const filtered = React.useMemo(() => {
        if (!searchQuery) return itemList;
        const q = searchQuery.toLowerCase();
        return itemList.filter(
            (i) =>
                String(i.name ?? "")
                    .toLowerCase()
                    .includes(q) ||
                String(i.sku ?? "")
                    .toLowerCase()
                    .includes(q)
        );
    }, [itemList, searchQuery]);

    const totalItems = itemList.length;
    const activeItems = itemList.filter((i) => Boolean(i.is_active)).length;
    const criticalPath = itemList.filter((i) => Boolean(i.is_critical_path)).length;
    const totalValue = itemList.reduce((sum, i) => sum + Number(i.base_cost ?? 0), 0);

    const contentSlot = (
        <div className="density-gap-page">
            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                            <Package className="h-4 w-4" />
                            <span className="text-xs">Total Items</span>
                        </div>
                        <p className="text-2xl font-bold">{totalItems}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                            <Box className="h-4 w-4" />
                            <span className="text-xs">Active</span>
                        </div>
                        <p className="text-2xl font-bold">{activeItems}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-xs">Critical Path</span>
                        </div>
                        <p className="text-2xl font-bold">{criticalPath}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="mb-1 text-xs text-muted-foreground">
                            Total Catalog Value
                        </div>
                        <p className="text-2xl font-bold">{formatAdvanceCost(totalValue)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <SearchInput
                value={searchQuery}
                onValueChange={setSearchQuery}
                placeholder="Search inventory..."
                className="max-w-sm"
            />

            {/* Items table */}
            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState
                    icon={Package}
                    title="No inventory items"
                    description="Catalog items will appear here once added"
                />
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Inventory ({filtered.length} items)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y">
                            {filtered.map((item) => (
                                <div
                                    key={item.id as string}
                                    className="flex items-center gap-4 py-3"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">
                                                {String(item.name)}
                                            </span>
                                            <span className="text-xs font-mono text-muted-foreground">
                                                {String(item.sku)}
                                            </span>
                                            {Boolean(item.is_critical_path) && (
                                                <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                                            )}
                                        </div>
                                        <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                                            <span>{String(item.unit_of_measure ?? "ea")}</span>
                                            <span>Lead: {Number(item.lead_time_days ?? 0)}d</span>
                                            {Boolean(item.min_order_qty) && (
                                                <span>Min: {Number(item.min_order_qty)}</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                                        {formatAdvanceCost(Number(item.base_cost ?? 0))}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    const config: DashboardPageConfig = {
        resource: "advancing",
        action: "manage",
        title: "Inventory Dashboard",
        description: "Monitor catalog inventory, availability, and cross-event allocation",
        contentSlot,
    };

    return <OperationalDashboardShell config={config} isLoading={isLoading} />;
}
