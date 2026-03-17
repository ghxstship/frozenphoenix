"use client";

import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { CheckCircle2, Clock, ListOrdered, Timer } from "lucide-react";
import { useStrikeSequences } from "@/lib/supabase";
import { OperationalDashboardShell } from "@/components/shells/operational-dashboard-shell";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";

type Row = Record<string, unknown>;

const CONFIG: DashboardPageConfig = {
    resource: "live_ops",
    title: "Strike & Load-Out",
    description: "Demobilization sequence, dependency tracking, and load-out progress",
    stats: [
        {
            label: "Completed",
            icon: CheckCircle2,
            compute: (d) => {
                const done = d.filter((r) => r.status === "completed").length;
                return `${done}/${d.length}`;
            },
        },
        { label: "Total Steps", icon: ListOrdered, compute: (d) => d.length },
        {
            label: "Estimated Total",
            icon: Timer,
            compute: (d) => {
                const mins = d.reduce((s, r) => s + (Number(r.estimated_duration_minutes) || 0), 0);
                return `${Math.round(mins / 60)}h ${mins % 60}m`;
            },
        },
        {
            label: "Blocked",
            icon: Clock,
            compute: (d) => d.filter((r) => r.status === "blocked").length,
        },
    ],
    cardRenderer: (item: Row) => (
        <Card className="hover:shadow-sm transition-all">
            <CardContent className="py-3">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0 text-sm font-bold">
                        {item.sequence as string}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold truncate">
                                {item.name as string}
                            </h3>
                            <StatusBadge
                                status={item.status as string}
                                className="text-[10px] shrink-0"
                            />
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                            <span>{(item.department as string) ?? ""}</span>
                            <span>{(item.responsible_id as string) ?? ""}</span>
                            {Array.isArray(item.depends_on_ids) &&
                                (item.depends_on_ids as string[]).length > 0 && (
                                    <span>
                                        After: {(item.depends_on_ids as string[]).join(", ")}
                                    </span>
                                )}
                        </div>
                        {typeof item.notes === "string" && item.notes && (
                            <p className="text-[10px] text-warning mt-1">{item.notes}</p>
                        )}
                    </div>
                    <div className="text-right text-sm shrink-0">
                        <p className="font-medium">
                            {
                                (item.actual_duration_minutes ??
                                    item.estimated_duration_minutes ??
                                    0) as number
                            }
                            m
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                            {item.actual_duration_minutes ? "actual" : "estimated"}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    ),
    emptyState: {
        icon: ListOrdered,
        title: "No strike sequences",
        description: "Strike & load-out sequences will appear here when created.",
    },
};

export default function StrikePage() {
    const { data, isLoading } = useStrikeSequences();

    return (
        <OperationalDashboardShell
            config={CONFIG}
            data={data as Row[] | null}
            isLoading={isLoading}
        />
    );
}
