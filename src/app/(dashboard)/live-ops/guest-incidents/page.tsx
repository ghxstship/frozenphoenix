"use client";

import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { useGuestIncidents } from "@/lib/supabase";
import { OperationalDashboardShell } from "@/components/shells/operational-dashboard-shell";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";

type Row = Record<string, unknown>;

const SEVERITY_BORDERS: Record<string, string> = {
    minor: "",
    moderate: "border-l-warning",
    major: "border-l-destructive",
};

const CONFIG: DashboardPageConfig = {
    resource: "live_ops",
    title: "Guest Incidents",
    description: "Complaints, injuries, lost items, and disturbances — tracking and resolution",
    searchable: true,
    searchPlaceholder: "Search incidents...",
    searchKeys: ["description", "guest_name"],
    stats: [
        { label: "Total Incidents", icon: AlertTriangle, compute: (d) => d.length },
        {
            label: "Active",
            icon: Clock,
            compute: (d) =>
                d.filter((r) => r.status !== "resolved" && r.status !== "closed").length,
        },
        {
            label: "Resolved",
            icon: CheckCircle2,
            compute: (d) => d.filter((r) => r.status === "resolved").length,
        },
        {
            label: "Major",
            icon: AlertTriangle,
            compute: (d) => d.filter((r) => r.severity === "major").length,
        },
    ],
    cardRenderer: (item: Row) => (
        <Card
            className={`hover:shadow-sm transition-all border-l-2 ${SEVERITY_BORDERS[item.severity as string] ?? ""}`}
        >
            <CardContent className="py-3">
                <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                        <span className="text-xs font-mono font-bold bg-secondary px-1.5 py-0.5 rounded">
                            {String(item.id).slice(0, 8)}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <StatusBadge status={item.type as string} className="text-[10px]" />
                            <StatusBadge status={item.severity as string} className="text-[10px]" />
                            <StatusBadge status={item.status as string} className="text-[10px]" />
                        </div>
                        <p className="text-sm mt-1">{item.description as string}</p>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                            {typeof item.foh_zone_id === "string" && item.foh_zone_id && (
                                <span>{item.foh_zone_id}</span>
                            )}
                            {typeof item.reported_at === "string" && (
                                <span>
                                    {new Date(item.reported_at).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            )}
                            {typeof item.guest_name === "string" && item.guest_name && (
                                <span>Guest: {item.guest_name}</span>
                            )}
                            {typeof item.assigned_to_id === "string" && item.assigned_to_id && (
                                <span>Assigned: {item.assigned_to_id}</span>
                            )}
                        </div>
                        {typeof item.resolution === "string" && item.resolution && (
                            <p className="text-[11px] text-success mt-1">
                                Resolution: {item.resolution}
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    ),
    emptyState: {
        icon: AlertTriangle,
        title: "No incidents",
        description: "Guest incident reports will appear here during live events.",
    },
};

export default function GuestIncidentsPage() {
    const { data, isLoading } = useGuestIncidents();

    return (
        <OperationalDashboardShell
            config={CONFIG}
            data={data as Row[] | null}
            isLoading={isLoading}
        />
    );
}
