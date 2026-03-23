"use client";

import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { OperationalDashboardShell } from "@/components/shells";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";
import { Badge } from "@/components/ui/badge";
import { TabBar } from "@/components/ui/tab-bar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";
import {
    AlertTriangle,
    ArrowRight,
    BarChart3,
    DollarSign,
    Target,
    TrendingUp,
    Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

type ForecastView = "revenue" | "utilization" | "budget" | "hiring";

interface ForecastingData {
    projects: Array<Record<string, unknown>>;
    deals: Array<Record<string, unknown>>;
    crew: Array<Record<string, unknown>>;
}

interface RevenueMonth {
    month: string;
    actual: number | null;
    forecast: number;
    target: number;
}

interface BudgetForecast {
    project: string;
    totalBudget: number;
    spent: number;
    burnRate: number;
    forecastedTotal: number;
    daysRemaining: number;
    status: "on_track" | "at_risk" | "over_budget";
}

interface UtilizationForecast {
    department: string;
    currentUtil: number;
    forecastedUtil: number;
    headcount: number;
    openRoles: number;
    target: number;
}

interface HiringNeed {
    role: string;
    department: string;
    urgency: "critical" | "high" | "medium";
    reason: string;
    forecastedStartDate: string;
    estimatedCost: number;
}

const URGENCY_CONFIG: Record<
    string,
    { label: string; variant: "destructive" | "warning" | "info" }
> = {
    critical: { label: "Critical", variant: "destructive" },
    high: { label: "High", variant: "warning" },
    medium: { label: "Medium", variant: "info" },
};

const STAGE_PROBABILITY: Record<string, number> = {
    won: 100,
    lost: 0,
    negotiation: 70,
    proposal: 40,
    qualified: 20,
    discovery: 10,
    lead: 5,
};

const BUDGET_STATUS_CONFIG: Record<
    string,
    { label: string; variant: "success" | "warning" | "destructive" }
> = {
    on_track: { label: "On Track", variant: "success" },
    at_risk: { label: "At Risk", variant: "warning" },
    over_budget: { label: "Over Budget", variant: "destructive" },
};

function useForecastingData() {
    return useQuery<ForecastingData>({
        queryKey: ["forecasting-bff"],
        queryFn: async () => {
            const res = await fetch("/api/forecasting");
            if (!res.ok) throw new Error(`Forecasting BFF failed: ${res.status}`);
            return res.json();
        },
        staleTime: 30_000,
    });
}

export function ForecastingPageClient() {
    const FORECAST_VIEWS = ["revenue", "utilization", "budget", "hiring"] as const;
    const [view, setView] = useQueryTabState({
        key: "tab",
        defaultValue: "revenue",
        validValues: FORECAST_VIEWS,
    });

    const { data, isLoading: loadingForecasting } = useForecastingData();

    const projects = useMemo(
        () => (data?.projects ?? []) as Array<Record<string, unknown>>,
        [data?.projects]
    );
    const deals = useMemo(
        () => (data?.deals ?? []) as Array<Record<string, unknown>>,
        [data?.deals]
    );
    const crew = useMemo(() => (data?.crew ?? []) as Array<Record<string, unknown>>, [data?.crew]);

    const revenueData: RevenueMonth[] = useMemo(() => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
        const totalPlanned = projects.reduce((s, p) => s + Number(p.budget_planned ?? 0), 0);
        const totalActual = projects.reduce((s, p) => s + Number(p.budget_actual ?? 0), 0);
        const monthlyTarget = totalPlanned > 0 ? totalPlanned / 6 : 0;
        const monthlyActual = totalActual > 0 ? totalActual / 6 : 0;
        const now = new Date();
        const currentMonth = now.getMonth();
        return months.map((month, i) => ({
            month,
            actual: i <= currentMonth ? Math.round(monthlyActual * (0.9 + (i + 1) * 0.04)) : null,
            forecast: Math.round(monthlyTarget * (0.95 + i * 0.03)),
            target: Math.round(monthlyTarget),
        }));
    }, [projects]);

    const budgetForecasts: BudgetForecast[] = useMemo(() => {
        return projects
            .filter((p) => p.status === "active" || p.status === "in_progress")
            .slice(0, 5)
            .map((p) => {
                const totalBudget = Number(p.budget_planned ?? 0);
                const spent = Number(p.budget_actual ?? 0);
                const progress = Number(p.progress ?? 50);
                const remaining = Math.max(100 - progress, 1);
                const daysRemaining = Math.max(Math.round(remaining * 0.3), 1);
                const burnRate =
                    daysRemaining > 0 ? Math.round((totalBudget - spent) / daysRemaining) : 0;
                const forecastedTotal = spent + burnRate * daysRemaining;
                const ratio = totalBudget > 0 ? forecastedTotal / totalBudget : 0;
                const status: BudgetForecast["status"] =
                    ratio > 1.1 ? "over_budget" : ratio > 0.95 ? "at_risk" : "on_track";
                return {
                    project: String(p.name ?? ""),
                    totalBudget,
                    spent,
                    burnRate,
                    forecastedTotal,
                    daysRemaining,
                    status,
                };
            });
    }, [projects]);

    const utilizationForecasts: UtilizationForecast[] = useMemo(() => {
        const deptMap = new Map<string, { count: number; assigned: number }>();
        for (const c of crew) {
            const dept = String(c.department ?? "General");
            const entry = deptMap.get(dept) ?? { count: 0, assigned: 0 };
            entry.count++;
            if (c.status === "assigned") entry.assigned++;
            deptMap.set(dept, entry);
        }
        return Array.from(deptMap.entries()).map(([department, stats]) => {
            const currentUtil =
                stats.count > 0 ? Math.round((stats.assigned / stats.count) * 100) : 0;
            return {
                department,
                currentUtil,
                forecastedUtil: Math.min(currentUtil + 5, 100),
                headcount: stats.count,
                openRoles: 0,
                target: 80,
            };
        });
    }, [crew]);

    const pipelineProjection = useMemo(() => {
        const stageMap = new Map<string, number>();
        for (const d of deals) {
            const stage = String(d.stage ?? "unknown");
            stageMap.set(stage, (stageMap.get(stage) ?? 0) + Number(d.value ?? 0));
        }
        return Array.from(stageMap.entries()).map(([stage, value]) => ({
            stage,
            value,
            probability: STAGE_PROBABILITY[stage] ?? 30,
        }));
    }, [deals]);

    const hiringNeeds: HiringNeed[] = useMemo(() => {
        return utilizationForecasts
            .filter((u) => u.forecastedUtil > u.target + 5)
            .map((u) => ({
                role: `${u.department} Team Member`,
                department: u.department,
                urgency: (u.forecastedUtil > u.target + 15
                    ? "critical"
                    : u.forecastedUtil > u.target + 10
                      ? "high"
                      : "medium") as HiringNeed["urgency"],
                reason: `Forecasted utilization ${u.forecastedUtil}% exceeds target ${u.target}%`,
                forecastedStartDate: "TBD",
                estimatedCost: 75000,
            }));
    }, [utilizationForecasts]);

    const totalForecastedRevenue = revenueData.reduce((s, m) => s + m.forecast, 0);
    const totalTarget = revenueData.reduce((s, m) => s + m.target, 0);
    const atRiskProjects = budgetForecasts.filter((b) => b.status !== "on_track").length;
    const avgUtilization =
        utilizationForecasts.length > 0
            ? Math.round(
                  utilizationForecasts.reduce((s, u) => s + u.forecastedUtil, 0) /
                      utilizationForecasts.length
              )
            : 0;
    const criticalHires = hiringNeeds.filter((h) => h.urgency === "critical").length;

    const contentSlot = (
        <>
            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 density-gap-card">
                <StatCard
                    title="H1 Revenue Forecast"
                    value={formatCurrency(totalForecastedRevenue)}
                    description={`target: ${formatCurrency(totalTarget)}`}
                    icon={TrendingUp}
                />
                <StatCard
                    title="At-Risk Projects"
                    value={atRiskProjects}
                    description="need attention"
                    icon={AlertTriangle}
                />
                <StatCard
                    title="Avg Utilization (Forecast)"
                    value={`${avgUtilization}%`}
                    description="next 3 months"
                    icon={BarChart3}
                />
                <StatCard
                    title="Critical Hires Needed"
                    value={criticalHires}
                    description="to meet demand"
                    icon={Users}
                />
            </div>

            <TabBar
                items={[
                    {
                        id: "revenue",
                        label: "Revenue",
                        icon: <DollarSign className="h-3.5 w-3.5" />,
                    },
                    {
                        id: "budget",
                        label: "Budget Burn",
                        icon: <Target className="h-3.5 w-3.5" />,
                    },
                    {
                        id: "utilization",
                        label: "Utilization",
                        icon: <BarChart3 className="h-3.5 w-3.5" />,
                    },
                    { id: "hiring", label: "Hiring", icon: <Users className="h-3.5 w-3.5" /> },
                ]}
                value={view}
                onValueChange={(v) => setView(v as ForecastView)}
                ariaLabel="Forecast category"
            />

            {/* Revenue Forecast */}
            {view === "revenue" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 density-gap-card">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Monthly Revenue — Actual vs Forecast
                            </CardTitle>
                            <CardDescription>Solid = actual, dashed = forecast</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {revenueData.map((m) => {
                                    const maxVal = Math.max(
                                        ...revenueData.map((d) => Math.max(d.forecast, d.target))
                                    );
                                    return (
                                        <div key={m.month} className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-medium w-8">{m.month}</span>
                                                <span className="text-muted-foreground">
                                                    {m.actual
                                                        ? formatCurrency(m.actual)
                                                        : formatCurrency(m.forecast)}
                                                    {!m.actual && " (forecast)"}
                                                </span>
                                            </div>
                                            <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`absolute h-full rounded-full ${m.actual ? "bg-primary" : "bg-primary/40 border-r-2 border-dashed border-primary"}`}
                                                    style={{
                                                        width: `${(m.forecast / maxVal) * 100}%`,
                                                    }}
                                                />
                                                <div
                                                    className="absolute h-full border-r-2 border-warning"
                                                    style={{
                                                        left: `${(m.target / maxVal) * 100}%`,
                                                    }}
                                                    title={`Target: ${formatCurrency(m.target)}`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Pipeline Revenue Projection</CardTitle>
                            <CardDescription>Based on deal probability weights</CardDescription>
                        </CardHeader>
                        <CardContent className="density-gap-section">
                            {pipelineProjection.map((s) => (
                                <div key={s.stage} className="flex items-center gap-4">
                                    <div className="w-32 text-xs font-medium">{s.stage}</div>
                                    <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                                        <div
                                            className="h-full bg-info rounded flex items-center justify-end px-2"
                                            style={{
                                                width: `${(s.value * s.probability) / 100 / 12000}%`,
                                                minWidth: "60px",
                                            }}
                                        >
                                            <span className="density-caption text-info-foreground font-medium">
                                                {s.probability}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-24 text-right text-xs">
                                        <p className="font-medium">
                                            {formatCurrency((s.value * s.probability) / 100)}
                                        </p>
                                        <p className="text-muted-foreground">
                                            {formatCurrency(s.value)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div className="pt-3 border-t flex justify-between text-sm">
                                <span className="text-muted-foreground">Weighted Pipeline</span>
                                <span className="font-bold">
                                    {formatCurrency(
                                        pipelineProjection.reduce(
                                            (sum, s) => sum + (s.value * s.probability) / 100,
                                            0
                                        )
                                    )}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Budget Burn Forecast */}
            {view === "budget" && (
                <div className="space-y-3">
                    {budgetForecasts.map((b) => {
                        const spentPct = (b.spent / b.totalBudget) * 100;
                        const forecastPct = (b.forecastedTotal / b.totalBudget) * 100;
                        return (
                            <Card
                                key={b.project}
                                className="hover:bg-secondary/30 transition-colors"
                            >
                                <CardContent className="py-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold">{b.project}</p>
                                                <Badge
                                                    variant={
                                                        BUDGET_STATUS_CONFIG[b.status]?.variant
                                                    }
                                                    className="density-caption"
                                                >
                                                    {BUDGET_STATUS_CONFIG[b.status]?.label}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {b.daysRemaining} days remaining · burn rate{" "}
                                                {formatCurrency(b.burnRate)}/day
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold">
                                                {formatCurrency(b.spent)}{" "}
                                                <span className="font-normal text-muted-foreground">
                                                    / {formatCurrency(b.totalBudget)}
                                                </span>
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Forecast: {formatCurrency(b.forecastedTotal)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="absolute h-full bg-primary rounded-full"
                                            style={{ width: `${Math.min(spentPct, 100)}%` }}
                                        />
                                        <div
                                            className={`absolute h-full rounded-full opacity-30 ${b.status === "over_budget" ? "bg-destructive" : b.status === "at_risk" ? "bg-warning" : "bg-success"}`}
                                            style={{ width: `${Math.min(forecastPct, 100)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between density-caption text-muted-foreground mt-1">
                                        <span>{Math.round(spentPct)}% spent</span>
                                        <span>{Math.round(forecastPct)}% forecasted</span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Utilization Forecast */}
            {view === "utilization" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Department Utilization — Current vs Forecast (Next 3 Months)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="density-gap-section">
                            {utilizationForecasts.map((u) => {
                                const overTarget = u.forecastedUtil > u.target + 10;
                                return (
                                    <div key={u.department} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium w-28">
                                                    {u.department}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {u.headcount} people
                                                </span>
                                                {u.openRoles > 0 && (
                                                    <Badge
                                                        variant="warning"
                                                        className="density-caption"
                                                    >
                                                        {u.openRoles} open
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs">
                                                <span>
                                                    Now: <strong>{u.currentUtil}%</strong>
                                                </span>
                                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                <span
                                                    className={
                                                        overTarget
                                                            ? "text-destructive font-bold"
                                                            : "font-bold"
                                                    }
                                                >
                                                    {u.forecastedUtil}%
                                                </span>
                                                {overTarget && (
                                                    <AlertTriangle className="h-3 w-3 text-destructive" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="absolute h-full bg-info rounded-full opacity-50"
                                                style={{ width: `${u.currentUtil}%` }}
                                            />
                                            <div
                                                className={`absolute h-full rounded-full ${overTarget ? "bg-destructive" : "bg-info"}`}
                                                style={{ width: `${u.forecastedUtil}%` }}
                                            />
                                            <div
                                                className="absolute h-full border-r-2 border-warning"
                                                style={{ left: `${u.target}%` }}
                                                title={`Target: ${u.target}%`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Hiring Needs */}
            {view === "hiring" && (
                <div className="space-y-3">
                    {hiringNeeds.map((h, i) => (
                        <Card key={i} className="hover:bg-secondary/30 transition-colors">
                            <CardContent className="flex items-center gap-4 py-4">
                                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                    <Users className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold">{h.role}</p>
                                        <Badge
                                            variant={URGENCY_CONFIG[h.urgency]?.variant}
                                            className="density-caption"
                                        >
                                            {URGENCY_CONFIG[h.urgency]?.label}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {h.department} — {h.reason}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-sm font-medium">
                                        {formatCurrency(h.estimatedCost)}/yr
                                    </p>
                                    <p className="density-caption text-muted-foreground">
                                        Start by {h.forecastedStartDate}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    <Card className="bg-muted/30">
                        <CardContent className="flex items-center justify-between py-4">
                            <span className="text-sm text-muted-foreground">
                                Total Annual Cost Impact
                            </span>
                            <span className="text-lg font-bold">
                                {formatCurrency(
                                    hiringNeeds.reduce((s, h) => s + h.estimatedCost, 0)
                                )}
                            </span>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );

    const config: DashboardPageConfig = {
        resource: "forecasting",
        action: "read",
        title: "Forecasting",
        description: "Predict revenue, track budget burns, and plan resource needs",
        contentSlot,
    };

    return <OperationalDashboardShell config={config} isLoading={loadingForecasting} />;
}
