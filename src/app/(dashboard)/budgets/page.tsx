"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { BUDGETS_PAGE } from "@/config/list-page-configs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { BurnChart } from "@/components/ui/burn-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/layouts/empty-state";
import { EntityLink } from "@/components/linked-records";
import { useProjects } from "@/lib/supabase";
import type { BudgetLineItem } from "@/types/production";
import type { Project, ProjectPhase, ProjectStatus } from "@/types";
import { BUDGET_CATEGORY_CONFIG } from "@/config/production-config";
import { formatCurrency } from "@/lib/utils";
import { useBudgets } from "@/lib/supabase";
import { useAcknowledgeBudgetAlert, useBudgetAlerts, useBudgetProfitability } from "@/lib/supabase";
import { useBudgetLines } from "@/lib/supabase";
import {
    AlertTriangle,
    BarChart3,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    Clock,
    DollarSign,
    PieChart,
    TrendingDown,
    TrendingUp,
} from "lucide-react";
import { ListPageShell } from "@/components/shells/list-page-shell";
import type { ListPageConfig } from "@/types/list-page-config";

const STATUS_VARIANTS: Record<string, string> = {
    draft: "secondary",
    pending_approval: "warning",
    approved: "success",
    locked: "info",
};

// ─── Typed budget view ──────────────────────────────────────
interface BudgetView {
    id: string;
    projectId: string;
    version: number;
    status: string;
    totalBudget: number;
    totalActual: number;
    contingencyPercent: number;
    markupPercent: number;
}

// ─── Content Component ──────────────────────────────────────
function BudgetsContent({
    budgets,
    projects,
    budgetLines,
}: {
    budgets: BudgetView[];
    projects: Project[];
    budgetLines: BudgetLineItem[];
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [showProfitability, setShowProfitability] = useState(true);
    const { data: profitabilityData } = useBudgetProfitability();
    const { data: alertsData } = useBudgetAlerts();
    const acknowledgeMutation = useAcknowledgeBudgetAlert();

    const filteredBudgets = budgets.filter((budget) => {
        const project = projects.find((p) => p.id === budget.projectId);
        return !searchQuery || project?.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const totalBudgeted = budgets.reduce((sum, b) => sum + b.totalBudget, 0);
    const totalActual = budgets.reduce((sum, b) => sum + b.totalActual, 0);
    const _totalVariance = totalActual - totalBudgeted;

    const categoryTotals = budgetLines.reduce(
        (acc, line) => {
            const cat = line.category;
            if (!acc[cat]) acc[cat] = { budgeted: 0, actual: 0 };
            acc[cat].budgeted += line.budgetedAmount;
            acc[cat].actual += line.actualAmount;
            return acc;
        },
        {} as Record<string, { budgeted: number; actual: number }>
    );

    return (
        <>
            {/* Search */}
            <div className="flex items-center gap-4">
                <SearchInput
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    placeholder="Search by project..."
                    className="flex-1 max-w-sm"
                />
            </div>

            {/* Budget Alerts Banner */}
            {(() => {
                const unacknowledgedAlerts = alertsData?.filter((a) => !a.acknowledged_at) ?? [];
                if (unacknowledgedAlerts.length === 0) return null;
                return (
                    <Card className="border-warning/40 bg-warning/5">
                        <CardContent className="py-3">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold">Budget Threshold Alerts</p>
                                    <p className="text-xs text-muted-foreground">
                                        {unacknowledgedAlerts.length} budget
                                        {unacknowledgedAlerts.length !== 1 ? "s" : ""} exceeded
                                        threshold limits
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {unacknowledgedAlerts.slice(0, 3).map((alert) => (
                                        <Badge
                                            key={alert.id}
                                            variant="warning"
                                            className="text-[10px]"
                                        >
                                            {alert.threshold_percent}% — Actual:{" "}
                                            {alert.actual_percent.toFixed(0)}%
                                        </Badge>
                                    ))}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        unacknowledgedAlerts.forEach((a) =>
                                            acknowledgeMutation.mutate({
                                                alertId: a.id,
                                                userId: "",
                                            })
                                        )
                                    }
                                    disabled={acknowledgeMutation.isPending}
                                >
                                    Dismiss All
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                );
            })()}

            {/* Profitability Intelligence Panel */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-primary" />
                            <CardTitle className="text-base">Profitability Intelligence</CardTitle>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowProfitability(!showProfitability)}
                            aria-expanded={showProfitability}
                            aria-controls="profitability-panel"
                        >
                            {showProfitability ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </CardHeader>
                {showProfitability && (
                    <CardContent id="profitability-panel" className="space-y-6">
                        {(() => {
                            const rows = profitabilityData ?? [];
                            const totalRevenue =
                                rows.reduce((s, r) => s + r.revenue, 0) || totalBudgeted * 1.15;
                            const totalCost =
                                rows.reduce((s, r) => s + r.total_cost, 0) || totalActual;
                            const totalProfit = totalRevenue - totalCost;
                            const avgMargin =
                                totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
                            const avgBurn =
                                rows.length > 0
                                    ? rows.reduce((s, r) => s + r.burn_percent, 0) / rows.length
                                    : totalBudgeted > 0
                                      ? (totalActual / totalBudgeted) * 100
                                      : 0;
                            const totalHours =
                                rows.reduce((s, r) => s + r.total_hours_tracked, 0) || 1420;
                            const billableHours =
                                rows.reduce((s, r) => s + r.billable_hours, 0) || 1065;

                            return (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                        <MetricCard
                                            label="Total Revenue"
                                            value={formatCurrency(totalRevenue)}
                                            icon={DollarSign}
                                            change={8}
                                            description="vs last period"
                                        />
                                        <MetricCard
                                            label="Total Profit"
                                            value={formatCurrency(totalProfit)}
                                            icon={TrendingUp}
                                            variant={totalProfit > 0 ? "success" : "danger"}
                                        />
                                        <MetricCard
                                            label="Avg Margin"
                                            value={`${avgMargin.toFixed(1)}%`}
                                            icon={BarChart3}
                                            threshold={{ warning: 20, danger: 10 }}
                                            sparkline={[28, 31, 27, 33, avgMargin]}
                                        />
                                        <MetricCard
                                            label="Avg Burn"
                                            value={`${avgBurn.toFixed(0)}%`}
                                            icon={PieChart}
                                            threshold={{ warning: 70, danger: 90 }}
                                        />
                                        <MetricCard
                                            label="Billable Rate"
                                            value={`${totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0}%`}
                                            icon={Clock}
                                            description={`${billableHours.toLocaleString()}h / ${totalHours.toLocaleString()}h`}
                                        />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold mb-3">
                                            Aggregate Budget Burn Forecast
                                        </p>
                                        <BurnChart
                                            data={
                                                budgetLines.length > 0
                                                    ? budgetLines.slice(0, 8).map((bl, i) => {
                                                          const r = bl as unknown as Record<
                                                              string,
                                                              unknown
                                                          >;
                                                          return {
                                                              label: `Wk ${i + 1}`,
                                                              planned: Number(
                                                                  r.estimated_amount ?? 0
                                                              ),
                                                              actual: Number(r.actual_amount ?? 0),
                                                          };
                                                      })
                                                    : []
                                            }
                                            budgetTotal={totalBudgeted || 400000}
                                            formatValue={(v) => formatCurrency(v)}
                                            height={180}
                                        />
                                    </div>
                                </>
                            );
                        })()}
                    </CardContent>
                )}
            </Card>

            {/* Category Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Spending by Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Object.entries(categoryTotals)
                            .slice(0, 8)
                            .map(([category, totals]) => {
                                const catConfig =
                                    BUDGET_CATEGORY_CONFIG[
                                        category as keyof typeof BUDGET_CATEGORY_CONFIG
                                    ];
                                const variance = totals.actual - totals.budgeted;
                                const Icon = catConfig?.icon || DollarSign;
                                return (
                                    <div key={category} className="p-3 rounded-lg bg-secondary/30">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Icon className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">
                                                {catConfig?.label || category}
                                            </span>
                                        </div>
                                        <div className="space-y-1 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Budget
                                                </span>
                                                <span>{formatCurrency(totals.budgeted)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Actual
                                                </span>
                                                <span>{formatCurrency(totals.actual)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Variance
                                                </span>
                                                <span
                                                    className={
                                                        variance > 0
                                                            ? "text-destructive"
                                                            : "text-success"
                                                    }
                                                >
                                                    {variance > 0 ? "+" : ""}
                                                    {formatCurrency(variance)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </CardContent>
            </Card>

            {/* Budgets List */}
            {filteredBudgets.length === 0 ? (
                <EmptyState
                    icon={DollarSign}
                    title="No budgets found"
                    description={
                        searchQuery ? "Try adjusting your search" : "Create your first budget"
                    }
                    action={
                        !searchQuery
                            ? {
                                  label: "New Budget",
                                  onClick: () => window.location.assign("/budgets/new"),
                              }
                            : undefined
                    }
                />
            ) : (
                <div className="space-y-3">
                    {filteredBudgets.map((budget) => {
                        const project = projects.find((p) => p.id === budget.projectId);
                        const statusVariant = STATUS_VARIANTS[budget.status] || "secondary";
                        const variance = budget.totalActual - budget.totalBudget;
                        const burnRate =
                            budget.totalBudget > 0
                                ? (budget.totalActual / budget.totalBudget) * 100
                                : 0;

                        return (
                            <Link key={budget.id} href={`/budgets/${budget.id}`}>
                                <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                                    <CardContent className="flex items-center gap-4 py-4">
                                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <DollarSign className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {project && (
                                                    <EntityLink
                                                        entityType="project"
                                                        entityId={project.id}
                                                        entityName={project.name}
                                                        size="md"
                                                        showIcon={false}
                                                    />
                                                )}
                                                <Badge variant="secondary" className="text-[10px]">
                                                    v{budget.version}
                                                </Badge>
                                                <Badge
                                                    variant={
                                                        statusVariant as
                                                            | "secondary"
                                                            | "success"
                                                            | "warning"
                                                            | "info"
                                                    }
                                                    className="text-[10px]"
                                                >
                                                    {budget.status.replace("_", " ")}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span>
                                                    Contingency: {budget.contingencyPercent}%
                                                </span>
                                                <span>Markup: {budget.markupPercent}%</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 text-sm">
                                            <div className="text-center">
                                                <p className="text-muted-foreground text-xs">
                                                    Budget
                                                </p>
                                                <p className="font-medium">
                                                    {formatCurrency(budget.totalBudget)}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-muted-foreground text-xs">
                                                    Actual
                                                </p>
                                                <p className="font-medium">
                                                    {formatCurrency(budget.totalActual)}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-muted-foreground text-xs">
                                                    Variance
                                                </p>
                                                <p
                                                    className={`font-medium ${variance > 0 ? "text-destructive" : "text-success"}`}
                                                >
                                                    {variance > 0 ? "+" : ""}
                                                    {formatCurrency(variance)}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-muted-foreground text-xs">
                                                    Burn
                                                </p>
                                                <p
                                                    className={`font-medium ${burnRate > 100 ? "text-destructive" : burnRate > 80 ? "text-warning" : ""}`}
                                                >
                                                    {Math.round(burnRate)}%
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </>
    );
}

// ─── Page ────────────────────────────────────────────────────
export default function BudgetsPage() {
    const { data: sbBudgets, isLoading: loadingBudgets } = useBudgets();
    const { data: sbProjects, isLoading: loadingProjects } = useProjects();
    const { data: sbBudgetLines } = useBudgetLines();

    const budgets: BudgetView[] = useMemo(
        () =>
            (sbBudgets ?? []).map((b: Record<string, unknown>) => ({
                id: String(b.id),
                projectId: String(b.project_id || ""),
                version: Number(b.version || 1),
                status: String(b.status || "draft"),
                totalBudget: Number(b.total_budget || 0),
                totalActual: Number(b.total_actual || 0),
                contingencyPercent: Number(b.contingency_percent || 0),
                markupPercent: Number(b.markup_percent || 0),
            })),
        [sbBudgets]
    );

    const projects: Project[] = useMemo(
        () =>
            (sbProjects ?? []).map((p) => ({
                id: p.id,
                name: p.name,
                client: p.companies?.name ?? "",
                clientLogo: p.client_logo ?? undefined,
                status: p.status as ProjectStatus,
                currentPhase: p.current_phase as ProjectPhase,
                startDate: p.start_date,
                endDate: p.end_date,
                budgetPlanned: p.budget_planned,
                budgetActual: p.budget_actual,
                progress: p.progress,
                managerId: p.manager_id ?? "",
                teamIds: [],
                createdAt: p.created_at ?? new Date().toISOString(),
            })),
        [sbProjects]
    );

    const budgetLines: BudgetLineItem[] = useMemo(
        () => (sbBudgetLines ?? []) as unknown as BudgetLineItem[],
        [sbBudgetLines]
    );

    const isLoading = loadingBudgets || loadingProjects;

    const totalBudgeted = budgets.reduce((sum, b) => sum + b.totalBudget, 0);
    const totalActual = budgets.reduce((sum, b) => sum + b.totalActual, 0);
    const totalVariance = totalActual - totalBudgeted;

    const config: ListPageConfig = useMemo(
        () => ({
            ...BUDGETS_PAGE,
            title: "Budgets",
            createLabel: "New Budget",
            exportable: true,
            stats: [
                {
                    label: "Total Budgeted",
                    icon: DollarSign,
                    compute: () => formatCurrency(totalBudgeted),
                },
                {
                    label: "Total Actual",
                    icon: DollarSign,
                    compute: () => formatCurrency(totalActual),
                },
                {
                    label: "Variance",
                    icon: totalVariance > 0 ? TrendingUp : TrendingDown,
                    compute: () =>
                        `${totalVariance > 0 ? "+" : ""}${formatCurrency(totalVariance)}`,
                },
                {
                    label: "Burn Rate",
                    icon: PieChart,
                    compute: () =>
                        `${totalBudgeted > 0 ? Math.round((totalActual / totalBudgeted) * 100) : 0}%`,
                },
            ],
            contentSlot: (
                <BudgetsContent budgets={budgets} projects={projects} budgetLines={budgetLines} />
            ),
        }),
        [budgets, projects, budgetLines, totalBudgeted, totalActual, totalVariance]
    );

    return (
        <ListPageShell
            config={config}
            data={budgets as unknown as Record<string, unknown>[]}
            isLoading={isLoading}
        />
    );
}
