"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { DollarSign, TrendingUp, AlertTriangle, Clock } from "lucide-react";

const snapshot = {
    budgetTotal: 185000,
    spentToDate: 142500,
    committedNotSpent: 18000,
    laborRegular: 48000,
    laborOvertime: 8200,
    laborDoubleTime: 3100,
    equipmentCost: 35000,
    vendorCost: 28000,
    onsiteProcurement: 2200,
    revenueTickets: 95000,
    revenueFb: 18500,
    revenueMerch: 7200,
    revenueOther: 3500,
    marginPercent: 18.2,
    burnRatePerHour: 1850,
    otAlertLevel: "advisory" as string,
};

const fmt = (n: number) => `$${n.toLocaleString()}`;
const remaining = snapshot.budgetTotal - snapshot.spentToDate - snapshot.committedNotSpent;
const burnPct = Math.round((snapshot.spentToDate / snapshot.budgetTotal) * 100);
const totalRevenue = snapshot.revenueTickets + snapshot.revenueFb + snapshot.revenueMerch + snapshot.revenueOther;

export default function LiveFinancialsPage() {
    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Live Financials" description="Real-time budget burn, labor costs, revenue tracking, and margin monitoring" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Budget Spent" value={`${burnPct}%`} icon={DollarSign} />
                <StatCard title="Remaining" value={fmt(remaining)} icon={TrendingUp} />
                <StatCard title="Burn Rate" value={`${fmt(snapshot.burnRatePerHour)}/hr`} icon={Clock} />
                <StatCard title="Margin" value={`${snapshot.marginPercent}%`} icon={TrendingUp} />
            </div>

            {snapshot.otAlertLevel !== "none" && (
                <Card className="border-warning/30 bg-warning/5">
                    <CardContent className="py-3 flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                        <p className="text-sm font-medium text-warning">Overtime alert: {snapshot.otAlertLevel.toUpperCase()} — labor overtime at {fmt(snapshot.laborOvertime)}</p>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="py-4">
                        <h3 className="text-sm font-semibold mb-3">Budget Overview</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Total Budget</span><span className="font-medium">{fmt(snapshot.budgetTotal)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Spent to Date</span><span className="font-medium">{fmt(snapshot.spentToDate)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Committed</span><span className="font-medium">{fmt(snapshot.committedNotSpent)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Remaining</span><span className={`font-medium ${remaining < 10000 ? "text-destructive" : "text-success"}`}>{fmt(remaining)}</span></div>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${burnPct > 90 ? "bg-destructive" : burnPct > 75 ? "bg-warning" : "bg-success"}`} style={{ width: `${burnPct}%` }} />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-4">
                        <h3 className="text-sm font-semibold mb-3">Labor Costs</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Regular</span><span className="font-medium">{fmt(snapshot.laborRegular)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Overtime (1.5x)</span><span className="font-medium text-warning">{fmt(snapshot.laborOvertime)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Double Time (2x)</span><span className="font-medium text-destructive">{fmt(snapshot.laborDoubleTime)}</span></div>
                            <div className="flex justify-between border-t border-border pt-2 mt-2"><span className="font-medium">Total Labor</span><span className="font-bold">{fmt(snapshot.laborRegular + snapshot.laborOvertime + snapshot.laborDoubleTime)}</span></div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-4">
                        <h3 className="text-sm font-semibold mb-3">Revenue</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Tickets</span><span className="font-medium">{fmt(snapshot.revenueTickets)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">F&B</span><span className="font-medium">{fmt(snapshot.revenueFb)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Merch</span><span className="font-medium">{fmt(snapshot.revenueMerch)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Other</span><span className="font-medium">{fmt(snapshot.revenueOther)}</span></div>
                            <div className="flex justify-between border-t border-border pt-2 mt-2"><span className="font-medium">Total Revenue</span><span className="font-bold">{fmt(totalRevenue)}</span></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
