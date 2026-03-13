"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Calendar, Clock, DollarSign, FileText, Plus } from "lucide-react";
import { PageShell } from "@/components/layouts/page-shell";
import { PermissionGate } from "@/components/permission-guard";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_ADVANCE_CONFIG } from "@/config/create-entity-configs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/layouts/empty-state";
import { AdvancePriorityBadge, AdvanceStatusBadge, AdvanceTypeBadge } from "@/components/advancing";
import { useAdvances } from "@/lib/supabase/hooks-advancing";
import { useAdvancesRealtime } from "@/lib/supabase/realtime-advancing";
import { ADVANCE_STATUSES, formatAdvanceCost } from "@/config/advancing-config";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import type { AdvancePriority, AdvanceStatus, AdvanceType } from "@/types";

const STATUS_FILTER_OPTIONS = [
    { value: "all" as const, label: "All" },
    ...ADVANCE_STATUSES.map((s) => ({ value: s.value, label: s.label })),
];

export default function AdvancingPage() {
    const router = useRouter();
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const [searchQuery, setSearchQuery] = React.useState("");
    const statusValues = React.useMemo(
        () => ["all", ...ADVANCE_STATUSES.map((s) => s.value)] as const,
        []
    );
    const [statusFilter, setStatusFilter] = useQueryTabState({
        key: "status",
        defaultValue: "all",
        validValues: statusValues,
    });

    // Realtime subscriptions
    useAdvancesRealtime();

    const { data: advances, isLoading } = useAdvances(
        statusFilter !== "all" ? { status: statusFilter as AdvanceStatus } : undefined
    );

    const advancesList = React.useMemo(
        () => (advances as Record<string, unknown>[] | undefined) ?? [],
        [advances]
    );

    const filtered = React.useMemo(() => {
        if (!searchQuery) return advancesList;
        const q = searchQuery.toLowerCase();
        return advancesList.filter((a) => {
            const title = (a.title as string)?.toLowerCase() ?? "";
            const number = (a.advance_number as string)?.toLowerCase() ?? "";
            return title.includes(q) || number.includes(q);
        });
    }, [advancesList, searchQuery]);

    // Stats
    const totalAdvances = advancesList.length;
    const pendingCount = advancesList.filter(
        (a) => a.status === "submitted" || a.status === "in_review"
    ).length;
    const totalEstimated = advancesList.reduce(
        (sum, a) => sum + ((a.total_estimated_cost as number) ?? 0),
        0
    );
    const totalActual = advancesList.reduce(
        (sum, a) => sum + ((a.total_actual_cost as number) ?? 0),
        0
    );

    return (
        <>
            <PermissionGate resource="advancing" action="read">
                <PageShell
                    title="Advancing"
                    description="Manage production advances, catalog orders, and fulfillment"
                    actions={
                        <Button onClick={openCreate}>
                            <Plus className="h-4 w-4" />
                            New Advance
                        </Button>
                    }
                >
                    {/* Filters */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <SearchInput
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                            placeholder="Search advances..."
                            className="max-w-sm flex-1"
                        />
                        <SegmentedControl
                            options={STATUS_FILTER_OPTIONS}
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                            ariaLabel="Filter by status"
                        />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard title="Total Advances" value={totalAdvances} icon={FileText} />
                        <StatCard
                            title="Pending Review"
                            value={pendingCount}
                            icon={Clock}
                            className={pendingCount > 0 ? "border-warning/50 bg-warning/5" : ""}
                        />
                        <StatCard
                            title="Est. Cost"
                            value={formatAdvanceCost(totalEstimated)}
                            icon={DollarSign}
                        />
                        <StatCard
                            title="Actual Cost"
                            value={formatAdvanceCost(totalActual)}
                            icon={DollarSign}
                        />
                    </div>

                    {/* List */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <EmptyState
                            icon={FileText}
                            title="No advances found"
                            description={
                                searchQuery
                                    ? "Try adjusting your search"
                                    : "Create your first production advance"
                            }
                            action={
                                !searchQuery
                                    ? {
                                          label: "New Advance",
                                          onClick: openCreate,
                                      }
                                    : undefined
                            }
                        />
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((advance) => (
                                <Card
                                    key={advance.id as string}
                                    className="cursor-pointer transition-shadow hover:shadow-md"
                                    onClick={() => router.push(`/advancing/${advance.id}`)}
                                >
                                    <CardContent className="flex items-center gap-4 py-4">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono text-muted-foreground">
                                                    {String(advance.advance_number)}
                                                </span>
                                                <AdvanceStatusBadge
                                                    status={advance.status as AdvanceStatus}
                                                />
                                                <AdvancePriorityBadge
                                                    priority={advance.priority as AdvancePriority}
                                                />
                                            </div>
                                            <h3 className="mt-1 truncate text-sm font-medium">
                                                {String(advance.title)}
                                            </h3>
                                            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                                                <AdvanceTypeBadge
                                                    type={advance.advance_type as AdvanceType}
                                                />
                                                {Boolean(advance.events) && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {String(
                                                            (
                                                                advance.events as Record<
                                                                    string,
                                                                    unknown
                                                                >
                                                            )?.name ?? ""
                                                        )}
                                                    </span>
                                                )}
                                                <span>
                                                    {Number(advance.total_items ?? 0)} items
                                                </span>
                                            </div>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-sm font-semibold">
                                                {formatAdvanceCost(
                                                    (advance.total_estimated_cost as number) ?? 0
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(
                                                    advance.created_at as string
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </PageShell>
            </PermissionGate>
            <CreateEntityDialog
                config={CREATE_ADVANCE_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </>
    );
}

function StatCard({
    title,
    value,
    icon: Icon,
    className,
}: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    className?: string;
}) {
    return (
        <Card className={cn(className)}>
            <CardContent className="pt-4">
                <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{title}</span>
                </div>
                <p className="text-2xl font-bold">{value}</p>
            </CardContent>
        </Card>
    );
}
