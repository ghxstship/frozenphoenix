"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";
import {
    TrendingUp, DollarSign, Users,
    AlertTriangle, BarChart3, Target,
    ArrowRight,
} from "lucide-react";

type ForecastView = "revenue" | "utilization" | "budget" | "hiring";

interface RevenueMonth {
    month: string;
    actual: number | null;
    forecast: number;
    target: number;
}

const revenueData: RevenueMonth[] = [
    { month: "Jan", actual: 420000, forecast: 420000, target: 400000 },
    { month: "Feb", actual: 385000, forecast: 385000, target: 400000 },
    { month: "Mar", actual: null, forecast: 450000, target: 420000 },
    { month: "Apr", actual: null, forecast: 480000, target: 440000 },
    { month: "May", actual: null, forecast: 520000, target: 460000 },
    { month: "Jun", actual: null, forecast: 495000, target: 480000 },
];

interface BudgetForecast {
    project: string;
    totalBudget: number;
    spent: number;
    burnRate: number;
    forecastedTotal: number;
    daysRemaining: number;
    status: "on_track" | "at_risk" | "over_budget";
}

const budgetForecasts: BudgetForecast[] = [
    { project: "Nike Air Max Launch", totalBudget: 485000, spent: 320000, burnRate: 8500, forecastedTotal: 472000, daysRemaining: 18, status: "on_track" },
    { project: "Red Bull Festival", totalBudget: 320000, spent: 245000, burnRate: 6200, forecastedTotal: 338000, daysRemaining: 15, status: "at_risk" },
    { project: "Coachella Experience", totalBudget: 750000, spent: 520000, burnRate: 12000, forecastedTotal: 724000, daysRemaining: 17, status: "on_track" },
    { project: "Glossier Pop-Up", totalBudget: 125000, spent: 110000, burnRate: 4500, forecastedTotal: 146000, daysRemaining: 8, status: "over_budget" },
    { project: "TechStart Launch", totalBudget: 200000, spent: 80000, burnRate: 5000, forecastedTotal: 180000, daysRemaining: 20, status: "on_track" },
];

interface UtilizationForecast {
    department: string;
    currentUtil: number;
    forecastedUtil: number;
    headcount: number;
    openRoles: number;
    target: number;
}

const utilizationForecasts: UtilizationForecast[] = [
    { department: "Production", currentUtil: 85, forecastedUtil: 92, headcount: 12, openRoles: 2, target: 80 },
    { department: "Technical", currentUtil: 91, forecastedUtil: 88, headcount: 8, openRoles: 1, target: 80 },
    { department: "Fabrication", currentUtil: 78, forecastedUtil: 85, headcount: 15, openRoles: 3, target: 75 },
    { department: "Logistics", currentUtil: 65, forecastedUtil: 72, headcount: 6, openRoles: 0, target: 70 },
    { department: "Design", currentUtil: 88, forecastedUtil: 95, headcount: 10, openRoles: 2, target: 80 },
];

interface HiringNeed {
    role: string;
    department: string;
    urgency: "critical" | "high" | "medium";
    reason: string;
    forecastedStartDate: string;
    estimatedCost: number;
}

const hiringNeeds: HiringNeed[] = [
    { role: "Senior Production Manager", department: "Production", urgency: "critical", reason: "Utilization at 92% — capacity ceiling", forecastedStartDate: "2026-03-15", estimatedCost: 95000 },
    { role: "Fabrication Lead", department: "Fabrication", urgency: "high", reason: "3 new projects starting Q2", forecastedStartDate: "2026-04-01", estimatedCost: 85000 },
    { role: "Technical Director", department: "Technical", urgency: "high", reason: "Scaling AV capabilities", forecastedStartDate: "2026-04-15", estimatedCost: 110000 },
    { role: "Junior Designer", department: "Design", urgency: "medium", reason: "Support design team growth", forecastedStartDate: "2026-05-01", estimatedCost: 60000 },
    { role: "Production Coordinator", department: "Production", urgency: "critical", reason: "Pipeline demand exceeds capacity", forecastedStartDate: "2026-03-01", estimatedCost: 55000 },
];

const URGENCY_CONFIG: Record<string, { label: string; variant: "destructive" | "warning" | "info" }> = {
    critical: { label: "Critical", variant: "destructive" },
    high: { label: "High", variant: "warning" },
    medium: { label: "Medium", variant: "info" },
};

const BUDGET_STATUS_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "destructive" }> = {
    on_track: { label: "On Track", variant: "success" },
    at_risk: { label: "At Risk", variant: "warning" },
    over_budget: { label: "Over Budget", variant: "destructive" },
};

export default function ForecastingPage() {
    const [view, setView] = useState<ForecastView>("revenue");

    const totalForecastedRevenue = revenueData.reduce((s, m) => s + m.forecast, 0);
    const totalTarget = revenueData.reduce((s, m) => s + m.target, 0);
    const atRiskProjects = budgetForecasts.filter((b) => b.status !== "on_track").length;
    const avgUtilization = Math.round(utilizationForecasts.reduce((s, u) => s + u.forecastedUtil, 0) / utilizationForecasts.length);
    const criticalHires = hiringNeeds.filter((h) => h.urgency === "critical").length;

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Forecasting" description="Predict revenue, track budget burns, and plan resource needs" />

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="H1 Revenue Forecast" value={formatCurrency(totalForecastedRevenue)} description={`target: ${formatCurrency(totalTarget)}`} icon={TrendingUp} change={8} />
                <StatCard title="At-Risk Projects" value={atRiskProjects} description="need attention" icon={AlertTriangle} />
                <StatCard title="Avg Utilization (Forecast)" value={`${avgUtilization}%`} description="next 3 months" icon={BarChart3} />
                <StatCard title="Critical Hires Needed" value={criticalHires} description="to meet demand" icon={Users} />
            </div>

            {/* View Tabs */}
            <div className="flex gap-2 border-b pb-2">
                {(["revenue", "budget", "utilization", "hiring"] as ForecastView[]).map((v) => (
                    <Button key={v} variant={view === v ? "default" : "ghost"} size="sm" onClick={() => setView(v)} className="capitalize">
                        {v === "revenue" && <DollarSign className="mr-1 h-3.5 w-3.5" />}
                        {v === "budget" && <Target className="mr-1 h-3.5 w-3.5" />}
                        {v === "utilization" && <BarChart3 className="mr-1 h-3.5 w-3.5" />}
                        {v === "hiring" && <Users className="mr-1 h-3.5 w-3.5" />}
                        {v === "budget" ? "Budget Burn" : v}
                    </Button>
                ))}
            </div>

            {/* Revenue Forecast */}
            {view === "revenue" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Monthly Revenue — Actual vs Forecast</CardTitle>
                            <CardDescription>Solid = actual, dashed = forecast</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {revenueData.map((m) => {
                                    const maxVal = Math.max(...revenueData.map((d) => Math.max(d.forecast, d.target)));
                                    return (
                                        <div key={m.month} className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-medium w-8">{m.month}</span>
                                                <span className="text-muted-foreground">
                                                    {m.actual ? formatCurrency(m.actual) : formatCurrency(m.forecast)}
                                                    {!m.actual && " (forecast)"}
                                                </span>
                                            </div>
                                            <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`absolute h-full rounded-full ${m.actual ? "bg-primary" : "bg-primary/40 border-r-2 border-dashed border-primary"}`}
                                                    style={{ width: `${(m.forecast / maxVal) * 100}%` }}
                                                />
                                                <div
                                                    className="absolute h-full border-r-2 border-yellow-500"
                                                    style={{ left: `${(m.target / maxVal) * 100}%` }}
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
                        <CardContent className="space-y-4">
                            {[
                                { stage: "Won (Booked)", value: 1200000, probability: 100 },
                                { stage: "Negotiation", value: 450000, probability: 70 },
                                { stage: "Proposal Sent", value: 680000, probability: 40 },
                                { stage: "Qualified", value: 920000, probability: 20 },
                            ].map((s) => (
                                <div key={s.stage} className="flex items-center gap-4">
                                    <div className="w-32 text-xs font-medium">{s.stage}</div>
                                    <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                                        <div
                                            className="h-full bg-info rounded flex items-center justify-end px-2"
                                            style={{ width: `${(s.value * s.probability / 100) / 12000}%`, minWidth: "60px" }}
                                        >
                                            <span className="text-[10px] text-white font-medium">{s.probability}%</span>
                                        </div>
                                    </div>
                                    <div className="w-24 text-right text-xs">
                                        <p className="font-medium">{formatCurrency(s.value * s.probability / 100)}</p>
                                        <p className="text-muted-foreground">{formatCurrency(s.value)}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="pt-3 border-t flex justify-between text-sm">
                                <span className="text-muted-foreground">Weighted Pipeline</span>
                                <span className="font-bold">{formatCurrency(1200000 + 315000 + 272000 + 184000)}</span>
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
                            <Card key={b.project} className="hover:bg-secondary/30 transition-colors">
                                <CardContent className="py-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold">{b.project}</p>
                                                <Badge variant={BUDGET_STATUS_CONFIG[b.status].variant} className="text-[10px]">
                                                    {BUDGET_STATUS_CONFIG[b.status].label}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {b.daysRemaining} days remaining · burn rate {formatCurrency(b.burnRate)}/day
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold">{formatCurrency(b.spent)} <span className="font-normal text-muted-foreground">/ {formatCurrency(b.totalBudget)}</span></p>
                                            <p className="text-xs text-muted-foreground">Forecast: {formatCurrency(b.forecastedTotal)}</p>
                                        </div>
                                    </div>
                                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="absolute h-full bg-primary rounded-full" style={{ width: `${Math.min(spentPct, 100)}%` }} />
                                        <div
                                            className={`absolute h-full rounded-full opacity-30 ${b.status === "over_budget" ? "bg-destructive" : b.status === "at_risk" ? "bg-warning" : "bg-success"}`}
                                            style={{ width: `${Math.min(forecastPct, 100)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
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
                        <CardTitle className="text-base">Department Utilization — Current vs Forecast (Next 3 Months)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {utilizationForecasts.map((u) => {
                                const overTarget = u.forecastedUtil > u.target + 10;
                                return (
                                    <div key={u.department} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium w-28">{u.department}</span>
                                                <span className="text-xs text-muted-foreground">{u.headcount} people</span>
                                                {u.openRoles > 0 && (
                                                    <Badge variant="warning" className="text-[9px]">{u.openRoles} open</Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs">
                                                <span>Now: <strong>{u.currentUtil}%</strong></span>
                                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                <span className={overTarget ? "text-destructive font-bold" : "font-bold"}>
                                                    {u.forecastedUtil}%
                                                </span>
                                                {overTarget && <AlertTriangle className="h-3 w-3 text-destructive" />}
                                            </div>
                                        </div>
                                        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                                            <div className="absolute h-full bg-info rounded-full opacity-50" style={{ width: `${u.currentUtil}%` }} />
                                            <div
                                                className={`absolute h-full rounded-full ${overTarget ? "bg-destructive" : "bg-info"}`}
                                                style={{ width: `${u.forecastedUtil}%` }}
                                            />
                                            <div className="absolute h-full border-r-2 border-warning" style={{ left: `${u.target}%` }} title={`Target: ${u.target}%`} />
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
                                        <Badge variant={URGENCY_CONFIG[h.urgency].variant} className="text-[10px]">
                                            {URGENCY_CONFIG[h.urgency].label}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">{h.department} — {h.reason}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-sm font-medium">{formatCurrency(h.estimatedCost)}/yr</p>
                                    <p className="text-[10px] text-muted-foreground">Start by {h.forecastedStartDate}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    <Card className="bg-muted/30">
                        <CardContent className="flex items-center justify-between py-4">
                            <span className="text-sm text-muted-foreground">Total Annual Cost Impact</span>
                            <span className="text-lg font-bold">{formatCurrency(hiringNeeds.reduce((s, h) => s + h.estimatedCost, 0))}</span>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
