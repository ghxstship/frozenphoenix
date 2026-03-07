"use client";

import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { AlertTriangle, Clock, CreditCard, DollarSign, TrendingUp } from "lucide-react";
import { OT_ALERT_LEVEL_MAP } from "@/config/domain-config";
import { usePosTransactions } from "@/lib/supabase/hooks-external-sync";
import { formatCurrency } from "@/lib/utils";

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
const totalRevenue =
    snapshot.revenueTickets + snapshot.revenueFb + snapshot.revenueMerch + snapshot.revenueOther;

export default function LiveFinancialsPage() {
    const { data: posTransactions } = usePosTransactions();
    const posTxns = (posTransactions ?? []) as Record<string, unknown>[];
    const posTotal = posTxns.reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0);
    const posTax = posTxns.reduce((sum, t) => sum + (Number(t.tax_amount) || 0), 0);
    const posCount = posTxns.length;
    const posCategories = posTxns.reduce<Record<string, number>>((acc, t) => {
        const cat = (t.category as string) || "uncategorized";
        acc[cat] = (acc[cat] || 0) + (Number(t.total_amount) || 0);
        return acc;
    }, {});

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Live Financials"
                description="Real-time budget burn, labor costs, revenue tracking, and margin monitoring"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Budget Spent" value={`${burnPct}%`} icon={DollarSign} />
                <StatCard title="Remaining" value={fmt(remaining)} icon={TrendingUp} />
                <StatCard
                    title="Burn Rate"
                    value={`${fmt(snapshot.burnRatePerHour)}/hr`}
                    icon={Clock}
                />
                <StatCard title="Margin" value={`${snapshot.marginPercent}%`} icon={TrendingUp} />
            </div>

            {snapshot.otAlertLevel !== "none" && (
                <Card className="border-warning/30 bg-warning/5">
                    <CardContent className="py-3 flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                        <p className="text-sm font-medium text-warning">
                            Overtime alert:{" "}
                            {OT_ALERT_LEVEL_MAP[
                                snapshot.otAlertLevel as keyof typeof OT_ALERT_LEVEL_MAP
                            ]?.label ?? snapshot.otAlertLevel}{" "}
                            — labor overtime at {fmt(snapshot.laborOvertime)}
                        </p>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="py-4">
                        <h3 className="text-sm font-semibold mb-3">Budget Overview</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Budget</span>
                                <span className="font-medium">{fmt(snapshot.budgetTotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Spent to Date</span>
                                <span className="font-medium">{fmt(snapshot.spentToDate)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Committed</span>
                                <span className="font-medium">
                                    {fmt(snapshot.committedNotSpent)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Remaining</span>
                                <span
                                    className={`font-medium ${remaining < 10000 ? "text-destructive" : "text-success"}`}
                                >
                                    {fmt(remaining)}
                                </span>
                            </div>
                        </div>
                        <ProgressBar value={burnPct} size="md" className="mt-3" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-4">
                        <h3 className="text-sm font-semibold mb-3">Labor Costs</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Regular</span>
                                <span className="font-medium">{fmt(snapshot.laborRegular)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Overtime (1.5x)</span>
                                <span className="font-medium text-warning">
                                    {fmt(snapshot.laborOvertime)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Double Time (2x)</span>
                                <span className="font-medium text-destructive">
                                    {fmt(snapshot.laborDoubleTime)}
                                </span>
                            </div>
                            <div className="flex justify-between border-t border-border pt-2 mt-2">
                                <span className="font-medium">Total Labor</span>
                                <span className="font-bold">
                                    {fmt(
                                        snapshot.laborRegular +
                                            snapshot.laborOvertime +
                                            snapshot.laborDoubleTime
                                    )}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-4">
                        <h3 className="text-sm font-semibold mb-3">Revenue</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tickets</span>
                                <span className="font-medium">{fmt(snapshot.revenueTickets)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">F&B</span>
                                <span className="font-medium">{fmt(snapshot.revenueFb)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Merch</span>
                                <span className="font-medium">{fmt(snapshot.revenueMerch)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Other</span>
                                <span className="font-medium">{fmt(snapshot.revenueOther)}</span>
                            </div>
                            <div className="flex justify-between border-t border-border pt-2 mt-2">
                                <span className="font-medium">Total Revenue</span>
                                <span className="font-bold">{fmt(totalRevenue)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <CreditCard className="h-4 w-4" />
                        POS Transactions (Live)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                        <div>
                            <p className="text-xs text-muted-foreground">Transactions</p>
                            <p className="text-lg font-bold">{posCount}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Gross Revenue</p>
                            <p className="text-lg font-bold">{formatCurrency(posTotal)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Tax Collected</p>
                            <p className="text-lg font-bold">{formatCurrency(posTax)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Avg Transaction</p>
                            <p className="text-lg font-bold">
                                {posCount > 0 ? formatCurrency(posTotal / posCount) : "—"}
                            </p>
                        </div>
                    </div>
                    {Object.keys(posCategories).length > 0 && (
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">Revenue by Category</p>
                            <div className="space-y-1.5">
                                {Object.entries(posCategories)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([cat, amount]) => (
                                        <div key={cat} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-[9px] capitalize">
                                                    {cat.replace("_", " ")}
                                                </Badge>
                                            </div>
                                            <span className="text-xs font-medium">{formatCurrency(amount)}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                    {posCount === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No POS transactions synced yet. Connect a POS provider in Integrations.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
