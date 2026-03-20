"use client";

import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Lock, Radio } from "lucide-react";
import { useCommChannels } from "@/lib/supabase";
import { OperationalDashboardShell } from "@/components/shells/operational-dashboard-shell";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";
import { PRIORITY_BORDER_CLASSES } from "@/config/ui-variants";

type Row = Record<string, unknown>;

const CONFIG: DashboardPageConfig = {
    resource: "live_ops",
    title: "Communications",
    description: "Radio channel assignments, priority routing, and communication log",
    stats: [
        { label: "Active Channels", icon: Radio, compute: (d) => d.length },
        {
            label: "Restricted",
            icon: Lock,
            compute: (d) => d.filter((r) => r.is_restricted).length,
        },
        { label: "Total Channels", icon: Radio, compute: (d) => d.length },
        {
            label: "Emergency",
            icon: Radio,
            compute: (d) => d.filter((r) => r.priority === "emergency").length,
        },
    ],
    cardLayout: "grid",
    gridCols: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3",
    cardRenderer: (item: Row) => (
        <Card
            className={`hover:shadow-sm transition-all border-l-2 ${PRIORITY_BORDER_CLASSES[item.priority as string] ?? ""}`}
        >
            <CardContent className="py-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-secondary px-1.5 py-0.5 rounded">
                            CH {item.channel_number as string}
                        </span>
                        <h3 className="text-sm font-semibold">{item.name as string}</h3>
                    </div>
                    <StatusBadge status={item.priority as string} className="density-caption" />
                </div>
                <p className="density-caption text-muted-foreground mb-2">
                    {item.assignment as string}
                </p>
                <div className="flex items-center justify-between density-caption">
                    <span className="text-muted-foreground">
                        {(item.discipline as string) ?? ""}
                    </span>
                    {Boolean(item.is_restricted) && (
                        <span className="flex items-center gap-0.5 text-warning">
                            <Lock className="h-2.5 w-2.5" />
                            Restricted
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    ),
    emptyState: {
        icon: Radio,
        title: "No channels",
        description: "Communication channels will appear here during live events.",
    },
};

export function CommsPageClient() {
    const { data, isLoading } = useCommChannels();

    return (
        <OperationalDashboardShell
            config={CONFIG}
            data={data as Row[] | null}
            isLoading={isLoading}
        />
    );
}
