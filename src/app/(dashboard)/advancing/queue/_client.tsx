"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, FileText, Filter } from "lucide-react";
import { ListPageShell } from "@/components/shells";
import type { ListPageConfig } from "@/types/list-page-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/layouts/empty-state";
import { AdvancePriorityBadge, AdvanceStatusBadge } from "@/components/advancing";
import { useAdvances } from "@/lib/supabase/hooks-advancing";
import { useAdvancesRealtime } from "@/lib/supabase/realtime-advancing";
import { formatAdvanceCost } from "@/config/advancing-config";
import type { AdvancePriority, AdvanceStatus } from "@/types";

export function QueuePageClient() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = React.useState("");
    useAdvancesRealtime();

    const { data: submitted, isLoading: l1 } = useAdvances({ status: "submitted" });
    const { data: inReview, isLoading: l2 } = useAdvances({ status: "in_review" });

    const submittedList = React.useMemo(
        () => (submitted as Record<string, unknown>[] | undefined) ?? [],
        [submitted]
    );
    const inReviewList = React.useMemo(
        () => (inReview as Record<string, unknown>[] | undefined) ?? [],
        [inReview]
    );

    const allPending = React.useMemo(
        () => [...submittedList, ...inReviewList],
        [submittedList, inReviewList]
    );

    const filtered = React.useMemo(() => {
        if (!searchQuery) return allPending;
        const q = searchQuery.toLowerCase();
        return allPending.filter((a) => {
            const title = String(a.title ?? "").toLowerCase();
            const num = String(a.advance_number ?? "").toLowerCase();
            return title.includes(q) || num.includes(q);
        });
    }, [allPending, searchQuery]);

    const isLoading = l1 || l2;

    const contentSlot = (
        <div className="density-gap-page">
            {/* Stats */}
            <div className="grid grid-cols-1 density-gap-card sm:grid-cols-3">
                <StatCard
                    title="Awaiting Review"
                    value={submittedList.length}
                    icon={Clock}
                    className={submittedList.length > 0 ? "border-warning/50 bg-warning/5" : ""}
                />
                <StatCard title="In Review" value={inReviewList.length} icon={Filter} />
                <StatCard
                    title="Total Pending Value"
                    value={formatAdvanceCost(
                        allPending.reduce((sum, a) => sum + Number(a.total_estimated_cost ?? 0), 0)
                    )}
                    icon={FileText}
                />
            </div>

            {/* Search */}

            {/* Queue list */}
            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="h-6 w-6 motion-safe:animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState
                    icon={CheckCircle2}
                    title="Queue is clear"
                    description="No advances are waiting for review"
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
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {Number(advance.total_items ?? 0)} items &middot;{" "}
                                        {new Date(String(advance.created_at)).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="shrink-0 text-right">
                                    <p className="text-sm font-semibold">
                                        {formatAdvanceCost(
                                            Number(advance.total_estimated_cost ?? 0)
                                        )}
                                    </p>
                                    <div className="mt-1 flex gap-1">
                                        <Button
                                            size="sm"
                                            variant="default"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/advancing/${advance.id}`);
                                            }}
                                        >
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            Review
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );

    const config: ListPageConfig = {
        entityKey: "advancing",
        resource: "advancing",
        action: "manage",
        title: "Advance Queue",
        description: "Review and approve pending production advances",
        searchState: {
            value: searchQuery,
            onValueChange: setSearchQuery,
            placeholder: "Search pending advances...",
        },
        contentSlot,
    };

    return <ListPageShell config={config} isLoading={isLoading} />;
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
    className?: string | undefined;
}) {
    return (
        <Card className={className}>
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
