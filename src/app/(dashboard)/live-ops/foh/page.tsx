"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Clock, ShoppingCart, Ticket, TrendingUp, Users } from "lucide-react";
import { StaggerItem } from "@/components/ui/stagger-container";
import { ProgressBar } from "@/components/ui/progress-bar";
import { LoadingState } from "@/components/layouts/loading-state";
import { formatCurrency } from "@/lib/utils";
import { useCredentialAssignments } from "@/lib/supabase/hooks-credentialing";
import { useFohZoneReadings, useFohZones } from "@/lib/supabase/hooks-live-ops";

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

export default function FohPage() {
    const { data: zones, isLoading: zonesLoading } = useFohZones();
    const { data: readings, isLoading: readingsLoading } = useFohZoneReadings();
    const { data: credentialAssignments } = useCredentialAssignments({
        status: ["approved", "issued", "checked_in", "checked_out"],
    });

    const isLoading = zonesLoading || readingsLoading;

    const zoneViews: ZoneView[] = useMemo(() => {
        if (!zones) return [];
        const readingsByZone = new Map<string, Record<string, unknown>>();
        for (const r of (readings ?? []) as Record<string, unknown>[]) {
            const zid = r.zone_id as string;
            if (!readingsByZone.has(zid)) readingsByZone.set(zid, r);
        }
        return (zones as Record<string, unknown>[]).map((z) => {
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

    if (isLoading) return <LoadingState />;

    const credRows = (credentialAssignments ?? []) as Record<string, unknown>[];
    const credCheckedIn = credRows.filter((r) => r.status === "checked_in").length;
    const credIssued = credRows.filter((r) => ["approved", "issued"].includes(r.status as string)).length;

    const totalOccupancy = zoneViews.reduce((s, z) => s + z.occupancy, 0);
    const totalCapacity = zoneViews.reduce((s, z) => s + z.capacity, 0);
    const totalSales = zoneViews.reduce((s, z) => s + z.salesAmount, 0);
    const totalIncidents = zoneViews.reduce((s, z) => s + z.incidents, 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Front of House"
                description="Zone occupancy, queue management, sales tracking, and crowd flow"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Attendance"
                    value={`${totalOccupancy.toLocaleString()} / ${totalCapacity.toLocaleString()}`}
                    icon={Users}
                />
                <StatCard
                    title="Occupancy"
                    value={totalCapacity > 0 ? `${Math.round((totalOccupancy / totalCapacity) * 100)}%` : "0%"}
                    icon={TrendingUp}
                />
                <StatCard
                    title="Zone Sales"
                    value={formatCurrency(totalSales)}
                    icon={ShoppingCart}
                />
                <StatCard title="Active Incidents" value={totalIncidents} icon={Clock} />
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <Ticket className="h-4 w-4" />
                        Credential Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Badge variant="success" className="text-[10px]">{credCheckedIn}</Badge>
                            <span className="text-xs text-muted-foreground">Checked In</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="info" className="text-[10px]">{credIssued}</Badge>
                            <span className="text-xs text-muted-foreground">Issued / Pending Entry</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px]">{credRows.length}</Badge>
                            <span className="text-xs text-muted-foreground">Total Active</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {zoneViews.map((zone, i) => {
                    const utilPct = Math.round((zone.occupancy / zone.capacity) * 100);
                    return (
                        <StaggerItem key={zone.id} index={i} stagger="tight">
                            <Card className="hover:shadow-sm transition-all">
                                <CardContent className="py-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-semibold">{zone.name}</h3>
                                        <StatusBadge
                                            status={zone.zoneType}
                                            className="text-[10px]"
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
                                    <div className="grid grid-cols-3 gap-2 text-[11px]">
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
                                        <p className="text-[10px] text-warning mt-2">
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
        </div>
    );
}
