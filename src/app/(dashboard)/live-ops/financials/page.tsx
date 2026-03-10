"use client";

import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { AlertTriangle, Clock, CreditCard, DollarSign, TrendingUp } from "lucide-react";
import { OT_ALERT_LEVEL_MAP } from "@/config/domain-config";
import { usePosTransactions } from "@/lib/supabase/hooks-external-sync";
import { useLiveFinancialSnapshots } from "@/lib/supabase/hooks-live-ops";
import { LoadingState } from "@/components/layouts/loading-state";
import { formatCurrency } from "@/lib/utils";

const fmt = (n: number) => `$${n.toLocaleString()}`;

export default function LiveFinancialsPage() {
    const { data: snapshots, isLoading } = useLiveFinancialSnapshots();
    const { data: posTransactions } = usePosTransactions();

    if (isLoading) return <LoadingState />;

    const latest = (snapshots ?? [])[0];
    const budgetTotal = latest?.budget_total ?? 0;
    const spentToDate = latest?.spent_to_date ?? 0;
    const committedNotSpent = latest?.committed_not_spent ?? 0;
    const laborRegular = latest?.labor_regular ?? 0;
    const laborOvertime = latest?.labor_overtime ?? 0;
    const laborDoubleTime = latest?.labor_double_time ?? 0;
    const revenueTickets = latest?.revenue_tickets ?? 0;
    const revenueFb = latest?.revenue_fb ?? 0;
    const revenueMerch = latest?.revenue_merch ?? 0;
    const revenueOther = latest?.revenue_other ?? 0;
    const marginPercent = latest?.margin_percent ?? 0;
    const burnRatePerHour = latest?.burn_rate_per_hour ?? 0;
    const otAlertLevel = latest?.ot_alert_level ?? "none";
    const remaining = budgetTotal - spentToDate - committedNotSpent;
    const burnPct = budgetTotal > 0 ? Math.round((spentToDate / budgetTotal) * 100) : 0;
    const totalRevenue = revenueTickets + revenueFb + revenueMerch + revenueOther;
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
                    value={`${fmt(burnRatePerHour)}/hr`}
                    icon={Clock}
                />
                <StatCard title="Margin" value={`${marginPercent}%`} icon={TrendingUp} />
            </div>

            {otAlertLevel !== "none" && (
                <Card className="border-warning/30 bg-warning/5">
                    <CardContent className="py-3 flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                        <p className="text-sm font-medium text-warning">
                            Overtime alert:{" "}
                            {OT_ALERT_LEVEL_MAP[
                                otAlertLevel as keyof typeof OT_ALERT_LEVEL_MAP
                            ]?.label ?? otAlertLevel}{" "}
                            — labor overtime at {fmt(laborOvertime)}
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
                                <span className="font-medium">{fmt(budgetTotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Spent to Date</span>
                                <span className="font-medium">{fmt(spentToDate)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Committed</span>
                                <span className="font-medium">
                                    {fmt(committedNotSpent)}
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
                                <span className="font-medium">{fmt(laborRegular)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Overtime (1.5x)</span>
                                <span className="font-medium text-warning">
                                    {fmt(laborOvertime)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Double Time (2x)</span>
                                <span className="font-medium text-destructive">
                                    {fmt(laborDoubleTime)}
                                </span>
                            </div>
                            <div className="flex justify-between border-t border-border pt-2 mt-2">
                                <span className="font-medium">Total Labor</span>
                                <span className="font-bold">
                                    {fmt(laborRegular + laborOvertime + laborDoubleTime)}
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
                                <span className="font-medium">{fmt(revenueTickets)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">F&B</span>
                                <span className="font-medium">{fmt(revenueFb)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Merch</span>
                                <span className="font-medium">{fmt(revenueMerch)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Other</span>
                                <span className="font-medium">{fmt(revenueOther)}</span>
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
