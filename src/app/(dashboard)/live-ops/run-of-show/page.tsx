"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStatusLabel } from "@/config/ui-variants";
import { Button } from "@/components/ui/button";
import { StaggerItem } from "@/components/ui/stagger-container";
import { SearchInput } from "@/components/ui/search-input";
import { CheckCircle2, Clock, Megaphone, Play, Plus } from "lucide-react";
import { useRosCues, useUpdateRosCue } from "@/lib/supabase";
import { OperationalDashboardShell } from "@/components/shells/operational-dashboard-shell";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";

type Row = Record<string, unknown>;

const BASE_CONFIG: DashboardPageConfig = {
    resource: "live_ops",
    title: "Run of Show",
    description: "Live cue management — sequence, timing, and execution tracking",
    headerActions: (
        <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Cue
        </Button>
    ),
    emptyState: {
        icon: Megaphone,
        title: "No cues",
        description: "Run of show cues will appear here when configured for a live event.",
    },
};

export default function RunOfShowPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const { data: cues, isLoading } = useRosCues();
    const updateCue = useUpdateRosCue();

    const rows = useMemo(() => (cues ?? []) as Row[], [cues]);

    const completed = rows.filter((c) => c.status === "completed").length;
    const inProgress = rows.filter((c) =>
        ["in_progress", "standby", "called"].includes(c.status as string)
    ).length;
    const upcoming = rows.filter((c) => c.status === "pending").length;

    const filtered = rows.filter((c) => {
        const matchesSearch =
            !search ||
            String(c.title ?? "")
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            String(c.cue_number ?? "")
                .toLowerCase()
                .includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const config = useMemo<DashboardPageConfig>(
        () => ({
            ...BASE_CONFIG,
            stats: [
                { label: "Total Cues", icon: Megaphone, value: rows.length },
                { label: "Completed", icon: CheckCircle2, value: completed },
                { label: "Active / Standby", icon: Play, value: inProgress },
                { label: "Upcoming", icon: Clock, value: upcoming },
            ],
        }),
        [rows.length, completed, inProgress, upcoming]
    );

    return (
        <OperationalDashboardShell config={config} data={rows} isLoading={isLoading}>
            <div className="flex items-center gap-3">
                <SearchInput
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Search cues..."
                    className="flex-1 max-w-sm"
                />
                <div className="flex gap-2 flex-wrap">
                    {[
                        "all",
                        "completed",
                        "in_progress",
                        "standby",
                        "called",
                        "pending",
                        "held",
                        "skipped",
                    ].map((s) => (
                        <Button
                            key={s}
                            variant={statusFilter === s ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter(s)}
                        >
                            {s === "all" ? "All" : getStatusLabel(s)}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                {filtered.map((cue, i) => (
                    <StaggerItem key={cue.id as string} index={i} stagger="tight">
                        <Card
                            className={`hover:shadow-sm transition-all ${cue.is_critical ? "border-l-2 border-l-destructive" : ""}`}
                        >
                            <CardContent className="py-3">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 text-center shrink-0">
                                        <p className="text-sm font-mono font-bold">
                                            {cue.cue_number as string}
                                        </p>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-semibold truncate">
                                                {cue.title as string}
                                            </h3>
                                            <StatusBadge
                                                status={cue.status as string}
                                                className="text-[10px] shrink-0"
                                            />
                                            {Boolean(cue.is_critical) && (
                                                <span className="text-[10px] text-destructive font-medium shrink-0">
                                                    CRITICAL
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                                            <span>{(cue.department as string) ?? ""}</span>
                                            {typeof cue.responsible_id === "string" &&
                                                cue.responsible_id && (
                                                    <span>{cue.responsible_id}</span>
                                                )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm shrink-0">
                                        {typeof cue.scheduled_time === "string" && (
                                            <div className="text-right mr-2">
                                                <p className="font-medium">
                                                    {new Date(
                                                        cue.scheduled_time
                                                    ).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    scheduled
                                                </p>
                                            </div>
                                        )}
                                        {typeof cue.actual_time === "string" && (
                                            <div className="text-right mr-2">
                                                <p className="font-medium">
                                                    {new Date(cue.actual_time).toLocaleTimeString(
                                                        [],
                                                        {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        }
                                                    )}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    actual
                                                </p>
                                            </div>
                                        )}
                                        {(cue.status === "pending" || cue.status === "standby") && (
                                            <Button
                                                size="sm"
                                                variant="default"
                                                disabled={updateCue.isPending}
                                                onClick={() =>
                                                    updateCue.mutate({
                                                        id: cue.id as string,
                                                        status: "in_progress",
                                                        actual_time: new Date().toISOString(),
                                                    })
                                                }
                                            >
                                                <Play className="h-3 w-3" /> Go
                                            </Button>
                                        )}
                                        {cue.status === "in_progress" && (
                                            <Button
                                                size="sm"
                                                variant="default"
                                                disabled={updateCue.isPending}
                                                onClick={() =>
                                                    updateCue.mutate({
                                                        id: cue.id as string,
                                                        status: "completed",
                                                    })
                                                }
                                            >
                                                <CheckCircle2 className="h-3 w-3" /> Complete
                                            </Button>
                                        )}
                                        {(cue.status === "pending" ||
                                            cue.status === "standby" ||
                                            cue.status === "in_progress") && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={updateCue.isPending}
                                                onClick={() =>
                                                    updateCue.mutate({
                                                        id: cue.id as string,
                                                        status: "held",
                                                    })
                                                }
                                            >
                                                Hold
                                            </Button>
                                        )}
                                        {cue.status === "held" && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={updateCue.isPending}
                                                onClick={() =>
                                                    updateCue.mutate({
                                                        id: cue.id as string,
                                                        status: "standby",
                                                    })
                                                }
                                            >
                                                Resume
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </StaggerItem>
                ))}
            </div>

            {filtered.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-1">No cues found</h3>
                        <p className="text-muted-foreground text-center">
                            Adjust filters or search terms
                        </p>
                    </CardContent>
                </Card>
            )}
        </OperationalDashboardShell>
    );
}
