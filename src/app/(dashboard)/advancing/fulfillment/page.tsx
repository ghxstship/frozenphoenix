"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Package, Truck } from "lucide-react";
import { PageShell } from "@/components/layouts/page-shell";
import { PermissionGate } from "@/components/permission-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/layouts/empty-state";
import { AdvanceStatusBadge } from "@/components/advancing";
import { useAdvances } from "@/lib/supabase/hooks-advancing";
import { useAdvancesRealtime } from "@/lib/supabase/realtime-advancing";
import { formatAdvanceCost } from "@/config/advancing-config";
import type { AdvanceStatus } from "@/types";

export default function FulfillmentPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = React.useState("");
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

    return (
        <PermissionGate resource="advancing" action="manage">
            <PageShell
                title="Fulfillment Tracking"
                description="Track approved advances through sourcing, ordering, and delivery"
            >
                {/* Pipeline stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                <SearchInput
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    placeholder="Search active advances..."
                    className="max-w-sm"
                />

                {/* List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState
                        icon={Truck}
                        title="No active fulfillments"
                        description="Approved advances will appear here for fulfillment tracking"
                    />
                ) : (
                    <div className="space-y-4">
                        {filtered.map((advance) => (
                            <Card
                                key={advance.id as string}
                                className="cursor-pointer transition-shadow hover:shadow-md"
                                onClick={() => router.push(`/advancing/${advance.id}`)}
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
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
                                    <p className="text-xs text-muted-foreground">
                                        {Number(advance.total_items ?? 0)} items &middot;{" "}
                                        Created{" "}
                                        {new Date(
                                            String(advance.created_at)
                                        ).toLocaleDateString()}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </PageShell>
        </PermissionGate>
    );
}
