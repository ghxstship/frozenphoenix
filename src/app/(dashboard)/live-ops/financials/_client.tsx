"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { AlertTriangle, Clock, CreditCard, DollarSign, TrendingUp } from "lucide-react";
import { OT_ALERT_LEVEL_MAP } from "@/config/domain-config";
import { usePosTransactions } from "@/lib/supabase/hooks-external-sync";
import { useLiveFinancialSnapshots } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { OperationalDashboardShell } from "@/components/shells/operational-dashboard-shell";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";

type Row = Record<string, unknown>;

const fmt = (n: number) => `$${n.toLocaleString()}`;

const BASE_CONFIG: DashboardPageConfig = {
    resource: "live_ops",
    title: "Live Financials",
    description: "Real-time budget burn, labor costs, revenue tracking, and margin monitoring",
    emptyState: {
        icon: DollarSign,
        title: "No financial data",
        description: "Financial snapshots will appear here during live events.",
    },
};

export function LiveFinancialsPageClient() {
    const { data: snapshots, isLoading } = useLiveFinancialSnapshots();
    const { data: posTransactions } = usePosTransactions();

    const rows = useMemo(() => (snapshots ?? []) as Row[], [snapshots]);
    const latest = rows[0] as Row | undefined;

    const budgetTotal = Number(latest?.budget_total) || 0;
    const spentToDate = Number(latest?.spent_to_date) || 0;
    const committedNotSpent = Number(latest?.committed_not_spent) || 0;
    const laborRegular = Number(latest?.labor_regular) || 0;
    const laborOvertime = Number(latest?.labor_overtime) || 0;
    const laborDoubleTime = Number(latest?.labor_double_time) || 0;
    const revenueTickets = Number(latest?.revenue_tickets) || 0;
    const revenueFb = Number(latest?.revenue_fb) || 0;
    const revenueMerch = Number(latest?.revenue_merch) || 0;
    const revenueOther = Number(latest?.revenue_other) || 0;
    const marginPercent = Number(latest?.margin_percent) || 0;
    const burnRatePerHour = Number(latest?.burn_rate_per_hour) || 0;
    const otAlertLevel = (latest?.ot_alert_level as string) ?? "none";
    const remaining = budgetTotal - spentToDate - committedNotSpent;
    const burnPct = budgetTotal > 0 ? Math.round((spentToDate / budgetTotal) * 100) : 0;
    const totalRevenue = revenueTickets + revenueFb + revenueMerch + revenueOther;

    const posTxns = useMemo(() => (posTransactions ?? []) as Row[], [posTransactions]);
    const posTotal = posTxns.reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0);
    const posTax = posTxns.reduce((sum, t) => sum + (Number(t.tax_amount) || 0), 0);
    const posCount = posTxns.length;
    const posCategories = useMemo(
        () =>
            posTxns.reduce<Record<string, number>>((acc, t) => {
                const cat = (t.category as string) || "uncategorized";
                acc[cat] = (acc[cat] || 0) + (Number(t.total_amount) || 0);
                return acc;
            }, {}),
        [posTxns]
    );

    const config = useMemo<DashboardPageConfig>(() => {
        if (!latest) return BASE_CONFIG;
        return {
            ...BASE_CONFIG,
            stats: [
                { label: "Budget Spent", icon: DollarSign, value: `${burnPct}%` },
                { label: "Remaining", icon: TrendingUp, value: fmt(remaining) },
                { label: "Burn Rate", icon: Clock, value: `${fmt(burnRatePerHour)}/hr` },
                { label: "Margin", icon: TrendingUp, value: `${marginPercent}%` },
            ],
            alerts:
                otAlertLevel !== "none"
                    ? [
                          {
                              condition: () => true,
                              message: `Overtime alert: ${OT_ALERT_LEVEL_MAP[otAlertLevel as keyof typeof OT_ALERT_LEVEL_MAP]?.label ?? otAlertLevel} — labor overtime at ${fmt(laborOvertime)}`,
                              severity: "warning" as const,
                              icon: AlertTriangle,
                          },
                      ]
                    : [],
        };
    }, [latest, burnPct, remaining, burnRatePerHour, marginPercent, otAlertLevel, laborOvertime]);

    return (
        <OperationalDashboardShell config={config} data={rows} isLoading={isLoading}>
            {latest && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 density-gap-card">
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
                                        <span className="text-muted-foreground">
                                            Overtime (1.5x)
                                        </span>
                                        <span className="font-medium text-warning">
                                            {fmt(laborOvertime)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Double Time (2x)
                                        </span>
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
                            <div className="grid grid-cols-1 sm:grid-cols-4 density-gap-card mb-4">
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
                                    <p className="text-xs text-muted-foreground mb-2">
                                        Revenue by Category
                                    </p>
                                    <div className="space-y-1.5">
                                        {Object.entries(posCategories)
                                            .sort(([, a], [, b]) => b - a)
                                            .map(([cat, amount]) => (
                                                <div
                                                    key={cat}
                                                    className="flex items-center justify-between"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant="secondary"
                                                            className="density-caption capitalize"
                                                        >
                                                            {cat.replaceAll("_", " ")}
                                                        </Badge>
                                                    </div>
                                                    <span className="text-xs font-medium">
                                                        {formatCurrency(amount)}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                            {posCount === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No POS transactions synced yet. Connect a POS provider in
                                    Integrations.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </OperationalDashboardShell>
    );
}
