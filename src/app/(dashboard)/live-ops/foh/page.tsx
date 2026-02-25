"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Users, TrendingUp, Clock, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MockZone {
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

const mockZones: MockZone[] = [
    { id: "1", name: "Main Entry", zoneType: "entry", capacity: 500, occupancy: 340, entryRate: 45, queueLength: 120, avgWaitMinutes: 8, salesAmount: 0, incidents: 0 },
    { id: "2", name: "General Admission", zoneType: "general", capacity: 5000, occupancy: 3200, entryRate: 0, queueLength: 0, avgWaitMinutes: 0, salesAmount: 0, incidents: 2 },
    { id: "3", name: "VIP Lounge", zoneType: "vip", capacity: 200, occupancy: 145, entryRate: 5, queueLength: 0, avgWaitMinutes: 0, salesAmount: 8400, incidents: 0 },
    { id: "4", name: "Main Bar", zoneType: "fb", capacity: 300, occupancy: 210, entryRate: 12, queueLength: 35, avgWaitMinutes: 6, salesAmount: 14200, incidents: 1 },
    { id: "5", name: "Merch Tent", zoneType: "merch", capacity: 150, occupancy: 85, entryRate: 8, queueLength: 22, avgWaitMinutes: 4, salesAmount: 6800, incidents: 0 },
    { id: "6", name: "Medical Station", zoneType: "medical", capacity: 20, occupancy: 3, entryRate: 1, queueLength: 0, avgWaitMinutes: 0, salesAmount: 0, incidents: 4 },
];

export default function FohPage() {
    const totalOccupancy = mockZones.reduce((s, z) => s + z.occupancy, 0);
    const totalCapacity = mockZones.reduce((s, z) => s + z.capacity, 0);
    const totalSales = mockZones.reduce((s, z) => s + z.salesAmount, 0);
    const totalIncidents = mockZones.reduce((s, z) => s + z.incidents, 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Front of House" description="Zone occupancy, queue management, sales tracking, and crowd flow" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Attendance" value={`${totalOccupancy.toLocaleString()} / ${totalCapacity.toLocaleString()}`} icon={Users} />
                <StatCard title="Occupancy" value={`${Math.round((totalOccupancy / totalCapacity) * 100)}%`} icon={TrendingUp} />
                <StatCard title="Zone Sales" value={formatCurrency(totalSales)} icon={ShoppingCart} />
                <StatCard title="Active Incidents" value={totalIncidents} icon={Clock} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockZones.map((zone, i) => {
                    const utilPct = Math.round((zone.occupancy / zone.capacity) * 100);
                    return (
                        <Card key={zone.id} className="hover:shadow-sm transition-all animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
                            <CardContent className="py-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold">{zone.name}</h3>
                                    <StatusBadge status={zone.zoneType} className="text-[10px]" />
                                </div>
                                <div className="mb-3">
                                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                        <span>Occupancy</span>
                                        <span className="font-medium">{zone.occupancy} / {zone.capacity} ({utilPct}%)</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                        <div className={`h-full rounded-full transition-all ${utilPct > 90 ? "bg-destructive" : utilPct > 75 ? "bg-warning" : "bg-success"}`} style={{ width: `${utilPct}%` }} />
                                    </div>
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
                                        <p className="font-medium">{zone.salesAmount > 0 ? formatCurrency(zone.salesAmount) : "—"}</p>
                                    </div>
                                </div>
                                {zone.incidents > 0 && (
                                    <p className="text-[10px] text-warning mt-2">{zone.incidents} active incident{zone.incidents > 1 ? "s" : ""}</p>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
