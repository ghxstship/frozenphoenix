"use client";

import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { AlertTriangle, CheckCircle2, Clock, Gauge, XCircle } from "lucide-react";
import { READINESS_GATE_STATUS_MAP } from "@/config/domain-config";
import { useReadinessGates } from "@/lib/supabase";
import { OperationalDashboardShell } from "@/components/shells/operational-dashboard-shell";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";

type Row = Record<string, unknown>;

const STATUS_OPTIONS = ["all", "passed", "in_progress", "not_started", "failed", "waived"] as const;

const CONFIG: DashboardPageConfig = {
    resource: "live_ops",
    title: "Readiness Gates",
    description:
        "Pre-show verification checkpoints — all blocking gates must pass before doors open",
    stats: [
        {
            label: "Passed",
            icon: CheckCircle2,
            compute: (d) => d.filter((r) => r.status === "passed").length,
        },
        {
            label: "In Progress",
            icon: Clock,
            compute: (d) => d.filter((r) => r.status === "in_progress").length,
        },
        {
            label: "Not Started",
            icon: Gauge,
            compute: (d) => d.filter((r) => r.status === "not_started").length,
        },
        {
            label: "Blocking Remaining",
            icon: AlertTriangle,
            compute: (d) =>
                d.filter((r) => r.is_blocking && !["passed", "waived"].includes(r.status as string))
                    .length,
        },
    ],
    alerts: [
        {
            condition: (d) =>
                d.filter((r) => r.is_blocking && !["passed", "waived"].includes(r.status as string))
                    .length > 0,
            message: (d) => {
                const count = d.filter(
                    (r) => r.is_blocking && !["passed", "waived"].includes(r.status as string)
                ).length;
                return `${count} blocking gate(s) still outstanding — doors cannot open`;
            },
            severity: "destructive",
            icon: XCircle,
        },
    ],
    filters: [
        {
            id: "status",
            label: "Status",
            type: "button-group",
            options: STATUS_OPTIONS.map((s) => ({
                value: s,
                label:
                    s === "all"
                        ? "All"
                        : (READINESS_GATE_STATUS_MAP[s as keyof typeof READINESS_GATE_STATUS_MAP]
                              ?.label ?? s),
            })),
            defaultValue: "all",
            predicate: (item, val) => item.status === val,
        },
    ],
    cardRenderer: (item: Row) => (
        <Card
            className={`hover:shadow-sm transition-all ${Boolean(item.is_blocking) && !["passed", "waived"].includes(item.status as string) ? "border-l-2 border-l-destructive" : ""}`}
        >
            <CardContent className="py-3">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0 text-sm font-bold">
                        G{item.gate_number as string}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold truncate">
                                {item.name as string}
                            </h3>
                            <StatusBadge
                                status={item.status as string}
                                className="density-caption shrink-0"
                            />
                            {Boolean(item.is_blocking) && (
                                <span className="density-caption text-destructive font-medium shrink-0">
                                    BLOCKING
                                </span>
                            )}
                        </div>
                        <p className="density-caption text-muted-foreground mt-0.5">
                            Verifier: {item.verifier_role as string}
                        </p>
                    </div>
                    {typeof item.verified_by_id === "string" && (
                        <div className="text-right text-xs shrink-0">
                            <p className="font-medium">{item.verified_by_id}</p>
                            <p className="density-caption text-muted-foreground">
                                {typeof item.verified_at === "string"
                                    ? new Date(item.verified_at).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                      })
                                    : ""}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    ),
    emptyState: {
        icon: Gauge,
        title: "No readiness gates",
        description: "Readiness gates will appear here when configured for an event.",
    },
};

export function ReadinessGatesPageClient() {
    const { data, isLoading } = useReadinessGates();

    return (
        <OperationalDashboardShell
            config={CONFIG}
            data={data as Row[] | null}
            isLoading={isLoading}
        />
    );
}
