"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { StaggerItem } from "@/components/ui/stagger-container";
import { LoadingState } from "@/components/layouts/loading-state";
import { CheckCircle2, Clock, ListOrdered, Timer } from "lucide-react";
import { useStrikeSequences } from "@/lib/supabase/hooks-live-ops";

export default function StrikePage() {
    const { data: steps, isLoading } = useStrikeSequences();

    if (isLoading) return <LoadingState />;

    const rows = steps ?? [];
    const completed = rows.filter((s) => s.status === "completed").length;
    const totalEstimated = rows.reduce((s, step) => s + (step.estimated_duration_minutes ?? 0), 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Strike & Load-Out"
                description="Demobilization sequence, dependency tracking, and load-out progress"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Completed"
                    value={`${completed}/${rows.length}`}
                    icon={CheckCircle2}
                />
                <StatCard title="Total Steps" value={rows.length} icon={ListOrdered} />
                <StatCard
                    title="Estimated Total"
                    value={`${Math.round(totalEstimated / 60)}h ${totalEstimated % 60}m`}
                    icon={Timer}
                />
                <StatCard
                    title="Blocked"
                    value={rows.filter((s) => s.status === "blocked").length}
                    icon={Clock}
                />
            </div>

            <div className="space-y-2">
                {rows.map((step, i) => (
                    <StaggerItem key={step.id} index={i} stagger="tight">
                        <Card className="hover:shadow-sm transition-all">
                            <CardContent className="py-3">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0 text-sm font-bold">
                                        {step.sequence}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-semibold truncate">
                                                {step.name}
                                            </h3>
                                            <StatusBadge
                                                status={step.status}
                                                className="text-[10px] shrink-0"
                                            />
                                        </div>
                                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                                            <span>{step.department ?? ""}</span>
                                            <span>{step.responsible_id ?? ""}</span>
                                            {step.depends_on_ids && step.depends_on_ids.length > 0 && (
                                                <span>After: {step.depends_on_ids.join(", ")}</span>
                                            )}
                                        </div>
                                        {step.notes && (
                                            <p className="text-[10px] text-warning mt-1">
                                                {step.notes}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right text-sm shrink-0">
                                        <p className="font-medium">
                                            {step.actual_duration_minutes ?? step.estimated_duration_minutes ?? 0}m
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {step.actual_duration_minutes ? "actual" : "estimated"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </StaggerItem>
                ))}
            </div>
        </div>
    );
}
