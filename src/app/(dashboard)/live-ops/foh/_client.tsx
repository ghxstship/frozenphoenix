"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Clock, ShoppingCart, Ticket, TrendingUp, Users } from "lucide-react";
import { StaggerItem } from "@/components/ui/stagger-container";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatCurrency } from "@/lib/utils";
import { useCredentialAssignments } from "@/lib/supabase/hooks-credentialing";
import { useFohZoneReadings, useFohZones } from "@/lib/supabase";
import { OperationalDashboardShell } from "@/components/shells/operational-dashboard-shell";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";

type Row = Record<string, unknown>;

interface ZoneView {
    id: string;
    name: string;
    zoneType: string;
    capacity: number;
    occupancy: number;
    entryRate: number;
    queueLength: number;
    avgWaitMinutes: number;
    salesAmount: number;
    incidents: number;
}

const BASE_CONFIG: DashboardPageConfig = {
    resource: "live_ops",
    title: "Front of House",
    description: "Zone occupancy, queue management, sales tracking, and crowd flow",
    emptyState: {
        icon: Users,
        title: "No zones configured",
        description: "Front of house zones will appear here when configured for an event.",
    },
};

export function FohPageClient() {
    const { data: zones, isLoading: zonesLoading } = useFohZones();
    const { data: readings, isLoading: readingsLoading } = useFohZoneReadings();
    const { data: credentialAssignments } = useCredentialAssignments({
        status: ["approved", "issued", "checked_in", "checked_out"],
    });

    const isLoading = zonesLoading || readingsLoading;

    const zoneViews: ZoneView[] = useMemo(() => {
        if (!zones) return [];
        const readingsByZone = new Map<string, Row>();
        for (const r of (readings ?? []) as Row[]) {
            const zid = r.zone_id as string;
            if (!readingsByZone.has(zid)) readingsByZone.set(zid, r);
        }
        return (zones as Row[]).map((z) => {
            const r = readingsByZone.get(z.id as string);
            return {
                id: z.id as string,
                name: z.name as string,
                zoneType: (z.zone_type as string) ?? "",
                capacity: (z.capacity as number) ?? 0,
                occupancy: (r?.occupancy_count as number) ?? 0,
                entryRate: (r?.entry_rate as number) ?? 0,
                queueLength: (r?.queue_length as number) ?? 0,
                avgWaitMinutes: (r?.avg_wait_minutes as number) ?? 0,
                salesAmount: (r?.sales_amount as number) ?? 0,
                incidents: (r?.incidents_count as number) ?? 0,
            };
        });
    }, [zones, readings]);

    const zoneRows = useMemo(() => (zones ?? []) as Row[], [zones]);

    const credRows = useMemo(() => (credentialAssignments ?? []) as Row[], [credentialAssignments]);
    const credCheckedIn = credRows.filter((r) => r.status === "checked_in").length;
    const credIssued = credRows.filter((r) =>
        ["approved", "issued"].includes(r.status as string)
    ).length;

    const totalOccupancy = zoneViews.reduce((s, z) => s + z.occupancy, 0);
    const totalCapacity = zoneViews.reduce((s, z) => s + z.capacity, 0);
    const totalSales = zoneViews.reduce((s, z) => s + z.salesAmount, 0);
    const totalIncidents = zoneViews.reduce((s, z) => s + z.incidents, 0);

    const config = useMemo<DashboardPageConfig>(
        () => ({
            ...BASE_CONFIG,
            stats: [
                {
                    label: "Total Attendance",
                    icon: Users,
                    value: `${totalOccupancy.toLocaleString()} / ${totalCapacity.toLocaleString()}`,
                },
                {
                    label: "Occupancy",
                    icon: TrendingUp,
                    value:
                        totalCapacity > 0
                            ? `${Math.round((totalOccupancy / totalCapacity) * 100)}%`
                            : "0%",
                },
                { label: "Zone Sales", icon: ShoppingCart, value: formatCurrency(totalSales) },
                { label: "Active Incidents", icon: Clock, value: totalIncidents },
            ],
        }),
        [totalOccupancy, totalCapacity, totalSales, totalIncidents]
    );

    return (
        <OperationalDashboardShell config={config} data={zoneRows} isLoading={isLoading}>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <Ticket className="h-4 w-4" />
                        Credential Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Badge variant="success" className="density-caption">
                                {credCheckedIn}
                            </Badge>
                            <span className="text-xs text-muted-foreground">Checked In</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="info" className="density-caption">
                                {credIssued}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                                Issued / Pending Entry
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="density-caption">
                                {credRows.length}
                            </Badge>
                            <span className="text-xs text-muted-foreground">Total Active</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 density-gap-card">
                {zoneViews.map((zone, i) => {
                    const utilPct =
                        zone.capacity > 0 ? Math.round((zone.occupancy / zone.capacity) * 100) : 0;
                    return (
                        <StaggerItem key={zone.id} index={i} stagger="tight">
                            <Card className="hover:shadow-sm transition-all">
                                <CardContent className="py-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-semibold">{zone.name}</h3>
                                        <StatusBadge
                                            status={zone.zoneType}
                                            className="density-caption"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                            <span>Occupancy</span>
                                            <span className="font-medium">
                                                {zone.occupancy} / {zone.capacity} ({utilPct}%)
                                            </span>
                                        </div>
                                        <ProgressBar value={utilPct} size="sm" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 density-caption">
                                        <div>
                                            <p className="text-muted-foreground">Queue</p>
                                            <p className="font-medium">{zone.queueLength}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Wait</p>
                                            <p className="font-medium">{zone.avgWaitMinutes}m</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Sales</p>
                                            <p className="font-medium">
                                                {zone.salesAmount > 0
                                                    ? formatCurrency(zone.salesAmount)
                                                    : "—"}
                                            </p>
                                        </div>
                                    </div>
                                    {zone.incidents > 0 && (
                                        <p className="density-caption text-warning mt-2">
                                            {zone.incidents} active incident
                                            {zone.incidents > 1 ? "s" : ""}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </StaggerItem>
                    );
                })}
            </div>
        </OperationalDashboardShell>
    );
}
