"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronDown, Package, Truck } from "lucide-react";
import { ListPageShell } from "@/components/shells";
import type { ListPageConfig } from "@/types/list-page-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/layouts/empty-state";
import { AdvanceStatusBadge } from "@/components/advancing";
import {
    useAdvanceItems,
    useAdvances,
    useUpdateAdvanceItemStatus,
} from "@/lib/supabase/hooks-advancing";
import { useAdvancesRealtime } from "@/lib/supabase/realtime-advancing";
import { formatAdvanceCost } from "@/config/advancing-config";
import type { AdvanceStatus } from "@/types";

const ITEM_STATUS_FLOW: Record<string, { next: string; label: string } | undefined> = {
    pending: { next: "sourcing", label: "Start Sourcing" },
    sourcing: { next: "ordered", label: "Mark Ordered" },
    ordered: { next: "shipped", label: "Mark Shipped" },
    shipped: { next: "received", label: "Mark Received" },
    received: { next: "inspected", label: "Mark Inspected" },
    inspected: { next: "delivered", label: "Mark Delivered" },
};

function AdvanceItemsPanel({ advanceId }: { advanceId: string }) {
    const { data: items, isLoading } = useAdvanceItems(advanceId);
    const updateStatus = useUpdateAdvanceItemStatus();
    const itemList = (items ?? []) as Record<string, unknown>[];

    if (isLoading) {
        return (
            <div className="py-4 text-center text-xs text-muted-foreground">Loading items...</div>
        );
    }

    if (itemList.length === 0) {
        return <div className="py-4 text-center text-xs text-muted-foreground">No items</div>;
    }

    return (
        <div className="space-y-2">
            {itemList.map((item) => {
                const status = String(item.status ?? "pending");
                const flow = ITEM_STATUS_FLOW[status];
                const catalogItem = item.catalog_items as Record<string, unknown> | null;
                return (
                    <div
                        key={String(item.id)}
                        className="flex items-center justify-between rounded-lg border p-3"
                    >
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                                {String(catalogItem?.name ?? `Item ${String(item.id).slice(0, 8)}`)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Qty: {String(item.quantity_requested ?? 0)}
                                {item.quantity_confirmed
                                    ? ` (${String(item.quantity_confirmed)} confirmed)`
                                    : ""}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge
                                variant={
                                    status === "delivered" || status === "inspected"
                                        ? "success"
                                        : status === "received" || status === "shipped"
                                          ? "info"
                                          : status === "ordered" || status === "sourcing"
                                            ? "warning"
                                            : "ghost"
                                }
                                className="density-caption"
                            >
                                {status}
                            </Badge>
                            {flow && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={updateStatus.isPending}
                                    onClick={() =>
                                        updateStatus.mutate({
                                            advanceId,
                                            itemId: String(item.id),
                                            status: flow.next,
                                        })
                                    }
                                >
                                    {flow.label}
                                </Button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export function FulfillmentPageClient() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = React.useState("");
    const [expandedId, setExpandedId] = React.useState<string | null>(null);
    useAdvancesRealtime();

    const { data: approved, isLoading: l1 } = useAdvances({ status: "approved" });
    const { data: inProgress, isLoading: l2 } = useAdvances({ status: "in_progress" });

    const approvedList = React.useMemo(
        () => (approved as Record<string, unknown>[] | undefined) ?? [],
        [approved]
    );
    const inProgressList = React.useMemo(
        () => (inProgress as Record<string, unknown>[] | undefined) ?? [],
        [inProgress]
    );

    const allActive = React.useMemo(
        () => [...approvedList, ...inProgressList],
        [approvedList, inProgressList]
    );

    const filtered = React.useMemo(() => {
        if (!searchQuery) return allActive;
        const q = searchQuery.toLowerCase();
        return allActive.filter((a) => {
            const title = String(a.title ?? "").toLowerCase();
            const num = String(a.advance_number ?? "").toLowerCase();
            return title.includes(q) || num.includes(q);
        });
    }, [allActive, searchQuery]);

    const isLoading = l1 || l2;

    const contentSlot = (
        <div className="density-gap-page">
            {/* Pipeline stats */}
            <div className="grid grid-cols-1 density-gap-card sm:grid-cols-3">
                <Card>
                    <CardContent className="pt-4">
                        <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                            <Package className="h-4 w-4" />
                            <span className="text-xs">Approved</span>
                        </div>
                        <p className="text-2xl font-bold">{approvedList.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                            <Truck className="h-4 w-4" />
                            <span className="text-xs">In Progress</span>
                        </div>
                        <p className="text-2xl font-bold">{inProgressList.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-xs">Total Value</span>
                        </div>
                        <p className="text-2xl font-bold">
                            {formatAdvanceCost(
                                allActive.reduce(
                                    (sum, a) => sum + Number(a.total_estimated_cost ?? 0),
                                    0
                                )
                            )}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}

            {/* List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="h-6 w-6 motion-safe:animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState
                    icon={Truck}
                    title="No active fulfillments"
                    description="Approved advances will appear here for fulfillment tracking"
                />
            ) : (
                <div className="density-gap-section">
                    {filtered.map((advance) => {
                        const id = advance.id as string;
                        const isExpanded = expandedId === id;
                        return (
                            <Card key={id} className="transition-shadow hover:shadow-md">
                                <CardHeader
                                    className="pb-2 cursor-pointer"
                                    onClick={() => setExpandedId(isExpanded ? null : id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ChevronDown
                                                className={`h-4 w-4 text-muted-foreground transition-transform ${!isExpanded ? "-rotate-90" : ""}`}
                                            />
                                            <span className="text-xs font-mono text-muted-foreground">
                                                {String(advance.advance_number)}
                                            </span>
                                            <AdvanceStatusBadge
                                                status={advance.status as AdvanceStatus}
                                            />
                                        </div>
                                        <span className="text-sm font-semibold">
                                            {formatAdvanceCost(
                                                Number(advance.total_estimated_cost ?? 0)
                                            )}
                                        </span>
                                    </div>
                                    <CardTitle className="text-sm">
                                        {String(advance.title)}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground mb-3">
                                        {Number(advance.total_items ?? 0)} items &middot; Created{" "}
                                        {new Date(String(advance.created_at)).toLocaleDateString()}
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="ml-2 h-auto p-0"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/advancing/${id}`);
                                            }}
                                        >
                                            View Detail
                                        </Button>
                                    </p>
                                    {isExpanded && <AdvanceItemsPanel advanceId={id} />}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );

    const config: ListPageConfig = {
        entityKey: "advancing",
        resource: "advancing",
        action: "manage",
        title: "Fulfillment Tracking",
        description: "Track approved advances through sourcing, ordering, and delivery",
        searchState: {
            value: searchQuery,
            onValueChange: setSearchQuery,
            placeholder: "Search active advances...",
        },
        contentSlot,
    };

    return <ListPageShell config={config} isLoading={isLoading} />;
}
