"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Lock, Radio } from "lucide-react";
import { StaggerItem } from "@/components/ui/stagger-container";
import { LoadingState } from "@/components/layouts/loading-state";
import { useCommChannels } from "@/lib/supabase/hooks-live-ops";

const PRIORITY_COLORS: Record<string, string> = {
    emergency: "border-l-destructive",
    critical: "border-l-destructive",
    high: "border-l-warning",
    medium: "",
    low: "",
};

export default function CommsPage() {
    const { data: channels, isLoading } = useCommChannels();

    if (isLoading) return <LoadingState />;

    const rows = channels ?? [];
    const restricted = rows.filter((c) => c.is_restricted).length;

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Communications"
                description="Radio channel assignments, priority routing, and communication log"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Active Channels" value={rows.length} icon={Radio} />
                <StatCard title="Restricted" value={restricted} icon={Lock} />
                <StatCard title="Total Channels" value={rows.length} icon={Radio} />
                <StatCard title="Emergency" value={rows.filter((c) => c.priority === "emergency").length} icon={Radio} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {rows.map((ch, i) => (
                    <StaggerItem key={ch.id} index={i} stagger="tight">
                        <Card
                            className={`hover:shadow-sm transition-all border-l-2 ${PRIORITY_COLORS[ch.priority] ?? ""}`}
                        >
                            <CardContent className="py-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono font-bold bg-secondary px-1.5 py-0.5 rounded">
                                            CH {ch.channel_number}
                                        </span>
                                        <h3 className="text-sm font-semibold">{ch.name}</h3>
                                    </div>
                                    <StatusBadge status={ch.priority} className="text-[10px]" />
                                </div>
                                <p className="text-[11px] text-muted-foreground mb-2">
                                    {ch.assignment}
                                </p>
                                <div className="flex items-center justify-between text-[10px]">
                                    <span className="text-muted-foreground">
                                        {ch.discipline ?? ""}
                                    </span>
                                    {ch.is_restricted && (
                                        <span className="flex items-center gap-0.5 text-warning">
                                            <Lock className="h-2.5 w-2.5" />
                                            Restricted
                                        </span>
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
