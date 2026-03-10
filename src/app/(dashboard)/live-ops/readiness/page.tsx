"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Clock, Gauge, XCircle } from "lucide-react";
import { READINESS_GATE_STATUS_MAP } from "@/config/domain-config";
import { StaggerItem } from "@/components/ui/stagger-container";
import { LoadingState } from "@/components/layouts/loading-state";
import { useReadinessGates } from "@/lib/supabase/hooks-live-ops";

export default function ReadinessGatesPage() {
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const { data: gates, isLoading } = useReadinessGates();

    if (isLoading) return <LoadingState />;

    const rows = gates ?? [];
    const passed = rows.filter((g) => g.status === "passed").length;
    const inProgress = rows.filter((g) => g.status === "in_progress").length;
    const notStarted = rows.filter((g) => g.status === "not_started").length;
    const blockingRemaining = rows.filter(
        (g) => g.is_blocking && !["passed", "waived"].includes(g.status)
    ).length;

    const filtered = rows.filter((g) => statusFilter === "all" || g.status === statusFilter);

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Readiness Gates"
                description="Pre-show verification checkpoints — all blocking gates must pass before doors open"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Passed" value={passed} icon={CheckCircle2} />
                <StatCard title="In Progress" value={inProgress} icon={Clock} />
                <StatCard title="Not Started" value={notStarted} icon={Gauge} />
                <StatCard
                    title="Blocking Remaining"
                    value={blockingRemaining}
                    icon={AlertTriangle}
                />
            </div>

            {blockingRemaining > 0 && (
                <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="py-3 flex items-center gap-3">
                        <XCircle className="h-5 w-5 text-destructive shrink-0" />
                        <p className="text-sm font-medium text-destructive">
                            {blockingRemaining} blocking gate(s) still outstanding — doors cannot
                            open
                        </p>
                    </CardContent>
                </Card>
            )}

            <div className="flex gap-2 flex-wrap">
                {["all", "passed", "in_progress", "not_started", "failed", "waived"].map((s) => (
                    <Button
                        key={s}
                        variant={statusFilter === s ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter(s)}
                    >
                        {s === "all"
                            ? "All"
                            : (READINESS_GATE_STATUS_MAP[
                                  s as keyof typeof READINESS_GATE_STATUS_MAP
                              ]?.label ?? s)}
                    </Button>
                ))}
            </div>

            <div className="space-y-2">
                {filtered.map((gate, i) => (
                    <StaggerItem key={gate.id} index={i} stagger="tight">
                        <Card
                            className={`hover:shadow-sm transition-all ${gate.is_blocking && !["passed", "waived"].includes(gate.status) ? "border-l-2 border-l-destructive" : ""}`}
                        >
                            <CardContent className="py-3">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0 text-sm font-bold">
                                        G{gate.gate_number}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-semibold truncate">
                                                {gate.name}
                                            </h3>
                                            <StatusBadge
                                                status={gate.status}
                                                className="text-[10px] shrink-0"
                                            />
                                            {gate.is_blocking && (
                                                <span className="text-[10px] text-destructive font-medium shrink-0">
                                                    BLOCKING
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                            Verifier: {gate.verifier_role}
                                        </p>
                                    </div>
                                    {gate.verified_by_id && (
                                        <div className="text-right text-xs shrink-0">
                                            <p className="font-medium">{gate.verified_by_id}</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {gate.verified_at
                                                    ? new Date(gate.verified_at).toLocaleTimeString(
                                                          [],
                                                          { hour: "2-digit", minute: "2-digit" }
                                                      )
                                                    : ""}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </StaggerItem>
                ))}
            </div>
        </div>
    );
}
