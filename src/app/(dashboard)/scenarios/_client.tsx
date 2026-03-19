"use client";

import { useCallback, useMemo, useState } from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { OperationalDashboardShell } from "@/components/shells";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OverlineText } from "@/components/ui/overline-text";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/ui/stat-card";
// MetricCard available for future scenario summary cards
import { formatCurrency } from "@/lib/utils";
import {
    ArrowRight,
    BarChart3,
    CheckCircle2,
    Copy,
    FlaskConical,
    GitBranch,
    GitCompare,
    Plus,
    SlidersHorizontal,
    Trash2,
    TrendingUp,
    X,
} from "lucide-react";
import { EmptyState } from "@/components/layouts/empty-state";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_SCENARIO_CONFIG } from "@/config/create-entity-configs";
import { useScenarios } from "@/lib/supabase";
import {
    useCreateScenario,
    useDeleteScenario,
    useUpdateScenario,
} from "@/lib/supabase/hooks-production";

type ScenarioStatus = "draft" | "active" | "archived" | "selected";
type ScenarioType = "budget" | "revenue" | "resource" | "pricing" | "hiring" | "combined";

interface ScenarioVariable {
    name: string;
    baseValue: number;
    adjustedValue: number;
    unit: string;
    category: string;
}

interface ScenarioOutcome {
    metric: string;
    baseValue: number;
    projectedValue: number;
    type: string;
}

interface Scenario {
    id: string;
    name: string;
    description: string;
    scenarioType: ScenarioType;
    status: ScenarioStatus;
    projectName: string | null;
    createdBy: string;
    updatedAt: string;
    variables: ScenarioVariable[];
    outcomes: ScenarioOutcome[];
    tags: string[];
}

const TYPE_LABELS: Record<ScenarioType, string> = {
    budget: "Budget",
    revenue: "Revenue",
    resource: "Resource",
    pricing: "Pricing",
    hiring: "Hiring",
    combined: "Combined",
};

function parseMetadataArray<T>(metadata: Record<string, unknown> | null, key: string): T[] {
    if (!metadata || !Array.isArray(metadata[key])) return [];
    return metadata[key] as T[];
}

// ─── Outcome Bar Visualization ───
function OutcomeBar({
    label,
    base,
    projected,
    format,
}: {
    label: string;
    base: number;
    projected: number;
    format: "currency" | "percentage" | "hours";
}) {
    const max = Math.max(base, projected, 1);
    const basePct = (base / max) * 100;
    const projPct = (projected / max) * 100;
    const isPositive =
        label.includes("Cost") || label.includes("Idle") ? projected <= base : projected >= base;
    const fmt = (v: number) =>
        format === "currency"
            ? formatCurrency(v)
            : format === "percentage"
              ? `${v.toFixed(1)}%`
              : `${v.toLocaleString()}h`;

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{label}</span>
                <span
                    className={`font-bold tabular-nums ${isPositive ? "text-success" : "text-destructive"}`}
                >
                    {fmt(projected)}
                </span>
            </div>
            <div className="relative h-5 rounded bg-muted/50 overflow-hidden">
                <div
                    className="absolute inset-y-0 left-0 bg-muted-foreground/20 rounded"
                    style={{ width: `${basePct}%` }}
                />
                <div
                    className={`absolute inset-y-0 left-0 rounded ${isPositive ? "bg-success/40" : "bg-destructive/40"}`}
                    style={{ width: `${projPct}%` }}
                />
                <div className="absolute inset-0 flex items-center px-2">
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                        Base: {fmt(base)}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ─── Variable Slider ───
function VariableSlider({
    variable,
    onChange,
}: {
    variable: ScenarioVariable;
    onChange: (newValue: number) => void;
}) {
    const isMonetary = variable.unit === "USD" || variable.unit === "USD/hr";
    const min = Math.min(variable.baseValue * 0.5, variable.adjustedValue * 0.5, 0);
    const max = Math.max(variable.baseValue * 2, variable.adjustedValue * 2, 1);
    const step = isMonetary ? Math.max(1, Math.floor(max / 100)) : max > 100 ? 10 : 1;
    const fmt = (v: number) => (isMonetary ? formatCurrency(v) : v.toLocaleString());
    const changed = variable.baseValue !== variable.adjustedValue;

    return (
        <div className="p-3 rounded-lg bg-secondary/50 space-y-2">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium">{variable.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                        {{
                            budget: "Budget",
                            revenue: "Revenue",
                            pricing: "Pricing",
                            hiring: "Hiring",
                            resource: "Resource",
                        }[variable.category] ?? variable.category}
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs tabular-nums">
                    <span className="text-muted-foreground">{fmt(variable.baseValue)}</span>
                    {changed && (
                        <>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span
                                className={`font-bold ${variable.adjustedValue > variable.baseValue ? "text-success" : "text-destructive"}`}
                            >
                                {fmt(variable.adjustedValue)}
                            </span>
                        </>
                    )}
                    <span className="text-[9px] text-muted-foreground">
                        {variable.unit === "USD" ? "" : variable.unit}
                    </span>
                </div>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={variable.adjustedValue}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                aria-label={`Adjust ${variable.name}`}
            />
            <div className="flex justify-between text-[9px] text-muted-foreground tabular-nums">
                <span>{fmt(min)}</span>
                <span>{fmt(max)}</span>
            </div>
        </div>
    );
}

export function ScenariosPageClient() {
    const _createScenario = useCreateScenario();
    const _updateScenario = useUpdateScenario();
    const _deleteScenario = useDeleteScenario();
    const [search, setSearch] = useState("");
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const TYPE_FILTERS = [
        "all",
        "combined",
        "budget",
        "revenue",
        "pricing",
        "hiring",
        "resource",
    ] as const;
    const [typeFilter, setTypeFilter] = useQueryTabState({
        key: "type",
        defaultValue: "all",
        validValues: TYPE_FILTERS,
    });
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [compareMode, setCompareMode] = useState(false);
    const [adjustedVariables, setAdjustedVariables] = useState<
        Record<string, Record<number, number>>
    >({});

    const { data: sbScenarios, isLoading } = useScenarios();

    const scenarios: Scenario[] = useMemo(
        () =>
            (sbScenarios ?? []).map((row) => {
                const r = row as unknown as Record<string, unknown>;
                const meta = (r.metadata ?? {}) as Record<string, unknown>;
                return {
                    id: (r.id as string) ?? "",
                    name: (r.name as string) ?? "",
                    description: (r.description as string) ?? "",
                    scenarioType: ((r.scenario_type as string) ?? "combined") as ScenarioType,
                    status: ((r.status as string) ?? "draft") as ScenarioStatus,
                    projectName: ((r.projects as Record<string, unknown>)?.name as string) ?? null,
                    createdBy: (r.created_by as string) ?? "",
                    updatedAt: (r.updated_at as string)?.slice(0, 10) ?? "",
                    variables: parseMetadataArray<ScenarioVariable>(meta, "variables"),
                    outcomes: parseMetadataArray<ScenarioOutcome>(meta, "outcomes"),
                    tags: (r.tags as string[]) ?? [],
                };
            }),
        [sbScenarios]
    );

    const getAdjustedScenario = useCallback(
        (scenario: Scenario): Scenario => {
            const overrides = adjustedVariables[scenario.id];
            if (!overrides) return scenario;
            return {
                ...scenario,
                variables: scenario.variables.map((v, i) => ({
                    ...v,
                    adjustedValue: overrides[i] ?? v.adjustedValue,
                })),
            };
        },
        [adjustedVariables]
    );

    const updateVariable = useCallback((scenarioId: string, varIndex: number, newValue: number) => {
        setAdjustedVariables((prev) => ({
            ...prev,
            [scenarioId]: {
                ...prev[scenarioId],
                [varIndex]: newValue,
            },
        }));
    }, []);

    const filtered = scenarios.filter((s) => {
        if (typeFilter !== "all" && s.scenarioType !== typeFilter) return false;
        if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const activeScenarios = scenarios.filter((s) => s.status === "active");

    const profitValues = scenarios.flatMap((s) =>
        s.outcomes
            .filter((o) => o.metric.includes("Profit") && o.type === "currency")
            .map((o) => o.projectedValue)
    );
    const bestProfit = profitValues.length > 0 ? Math.max(...profitValues) : 0;

    const marginValues = scenarios.flatMap((s) =>
        s.outcomes.filter((o) => o.metric.includes("Margin")).map((o) => o.projectedValue)
    );
    const bestMargin = marginValues.length > 0 ? Math.max(...marginValues) : 0;

    const contentSlot = (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Active Scenarios"
                    value={scenarios.filter((s) => s.status === "active").length}
                    description="being evaluated"
                    icon={FlaskConical}
                />
                <StatCard
                    title="Best Projected Profit"
                    value={formatCurrency(bestProfit)}
                    description="across all scenarios"
                    icon={TrendingUp}
                    change={12}
                />
                <StatCard
                    title="Best Margin"
                    value={`${bestMargin.toFixed(1)}%`}
                    description="highest projected"
                    icon={BarChart3}
                />
                <StatCard
                    title="Selected Plans"
                    value={scenarios.filter((s) => s.status === "selected").length}
                    description="approved for execution"
                    icon={CheckCircle2}
                />
            </div>

            <div className="flex items-center gap-4 flex-wrap">
                <SearchInput
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Search scenarios..."
                    className="flex-1 max-w-sm"
                />
                <SegmentedControl
                    ariaLabel="Scenario type filter"
                    value={typeFilter}
                    onValueChange={(v) => setTypeFilter(v as (typeof TYPE_FILTERS)[number])}
                    size="sm"
                    options={[
                        { value: "all", label: "All" },
                        ...(
                            [
                                "combined",
                                "budget",
                                "revenue",
                                "pricing",
                                "hiring",
                                "resource",
                            ] as const
                        ).map((t) => ({ value: t, label: TYPE_LABELS[t] })),
                    ]}
                />
            </div>

            {/* Compare Banner */}
            {activeScenarios.length >= 2 && !compareMode && (
                <Card className="border-dashed border-primary/30 bg-primary/5">
                    <CardContent className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-2 text-sm">
                            <GitCompare className="h-4 w-4 text-primary" />
                            <span className="font-medium">
                                Compare {activeScenarios.length} active scenarios side-by-side
                            </span>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setCompareMode(true)}>
                            Compare Scenarios
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Side-by-Side Comparison View */}
            {compareMode && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <GitCompare className="h-4 w-4 text-primary" />
                                Scenario Comparison
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => setCompareMode(false)}>
                                <X className="h-4 w-4 mr-1" />
                                Close
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Comparison Header */}
                        <div
                            className="grid gap-4"
                            style={{
                                gridTemplateColumns: `200px repeat(${activeScenarios.length}, 1fr)`,
                            }}
                        >
                            <div className="text-xs font-medium text-muted-foreground">Metric</div>
                            {activeScenarios.map((s) => (
                                <div key={s.id} className="text-center">
                                    <p className="text-sm font-semibold">{s.name}</p>
                                    <Badge variant="ghost" className="text-[10px]">
                                        {TYPE_LABELS[s.scenarioType]}
                                    </Badge>
                                </div>
                            ))}
                        </div>

                        {/* Outcomes Comparison */}
                        {(() => {
                            const allMetrics = [
                                ...new Set(
                                    activeScenarios.flatMap((s) => s.outcomes.map((o) => o.metric))
                                ),
                            ];
                            return allMetrics.map((metric) => (
                                <div
                                    key={metric}
                                    className="grid gap-4 py-2 border-b border-border/30 last:border-0"
                                    style={{
                                        gridTemplateColumns: `200px repeat(${activeScenarios.length}, 1fr)`,
                                    }}
                                >
                                    <div className="flex items-center text-xs font-medium">
                                        {metric}
                                    </div>
                                    {activeScenarios.map((s) => {
                                        const outcome = s.outcomes.find((o) => o.metric === metric);
                                        if (!outcome)
                                            return (
                                                <div
                                                    key={s.id}
                                                    className="text-center text-xs text-muted-foreground"
                                                >
                                                    —
                                                </div>
                                            );
                                        const variance = outcome.projectedValue - outcome.baseValue;
                                        const isPositive =
                                            metric.includes("Cost") || metric.includes("Idle")
                                                ? variance <= 0
                                                : variance >= 0;
                                        const fmt = (v: number) =>
                                            outcome.type === "currency"
                                                ? formatCurrency(v)
                                                : outcome.type === "percentage"
                                                  ? `${v.toFixed(1)}%`
                                                  : v.toLocaleString();
                                        return (
                                            <div key={s.id} className="text-center">
                                                <p
                                                    className={`text-sm font-bold tabular-nums ${isPositive ? "text-success" : "text-destructive"}`}
                                                >
                                                    {fmt(outcome.projectedValue)}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground tabular-nums">
                                                    {variance > 0 ? "+" : ""}
                                                    {fmt(variance)} from base
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            ));
                        })()}

                        {/* Winner Summary */}
                        <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                            <div className="flex items-center gap-2 text-sm font-medium text-success">
                                <CheckCircle2 className="h-4 w-4" />
                                Recommendation
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Based on projected outcomes,{" "}
                                <strong>
                                    {
                                        activeScenarios.reduce((best, s) => {
                                            const bestProfit =
                                                best.outcomes.find(
                                                    (o) =>
                                                        o.metric.includes("Profit") &&
                                                        o.type === "currency"
                                                )?.projectedValue ?? 0;
                                            const sProfit =
                                                s.outcomes.find(
                                                    (o) =>
                                                        o.metric.includes("Profit") &&
                                                        o.type === "currency"
                                                )?.projectedValue ?? 0;
                                            return sProfit > bestProfit ? s : best;
                                        }).name
                                    }
                                </strong>{" "}
                                yields the highest projected profit.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Scenario Cards */}
            {filtered.length === 0 ? (
                <EmptyState
                    icon={GitBranch}
                    title="No scenarios found"
                    description={search ? "Try adjusting your search" : "No scenarios created yet"}
                />
            ) : (
                <div className="space-y-4">
                    {filtered.map((scenario) => {
                        const isExpanded = expandedId === scenario.id;
                        return (
                            <Card key={scenario.id} className="overflow-hidden">
                                <CardHeader
                                    className="cursor-pointer hover:bg-secondary/30 transition-colors"
                                    onClick={() => setExpandedId(isExpanded ? null : scenario.id)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <CardTitle className="text-base">
                                                    {scenario.name}
                                                </CardTitle>
                                                <StatusBadge
                                                    status={scenario.status}
                                                    className="text-[10px]"
                                                />
                                                <Badge variant="ghost" className="text-[10px]">
                                                    {TYPE_LABELS[scenario.scenarioType]}
                                                </Badge>
                                            </div>
                                            <CardDescription>
                                                {scenario.description}
                                            </CardDescription>
                                            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                                                {scenario.projectName && (
                                                    <span>{scenario.projectName}</span>
                                                )}
                                                <span>by {scenario.createdBy}</span>
                                                <span>Updated {scenario.updatedAt}</span>
                                                {scenario.tags.map((t) => (
                                                    <Badge
                                                        key={t}
                                                        variant="ghost"
                                                        className="text-[8px] px-1"
                                                    >
                                                        {t}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Copy className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 text-destructive"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>

                                {isExpanded &&
                                    (() => {
                                        const adjusted = getAdjustedScenario(scenario);
                                        return (
                                            <CardContent className="pt-0 space-y-6">
                                                {/* Interactive Variables */}
                                                <div>
                                                    <OverlineText
                                                        as="h4"
                                                        className="mb-3 flex items-center gap-2"
                                                    >
                                                        <SlidersHorizontal className="h-3.5 w-3.5" />
                                                        Adjustable Variables
                                                    </OverlineText>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {adjusted.variables.map((v, i) => (
                                                            <VariableSlider
                                                                key={i}
                                                                variable={v}
                                                                onChange={(newVal) =>
                                                                    updateVariable(
                                                                        scenario.id,
                                                                        i,
                                                                        newVal
                                                                    )
                                                                }
                                                            />
                                                        ))}
                                                    </div>
                                                    {adjustedVariables[scenario.id] && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="mt-2 text-xs"
                                                            onClick={() =>
                                                                setAdjustedVariables((prev) => {
                                                                    const next = {
                                                                        ...prev,
                                                                    };
                                                                    delete next[scenario.id];
                                                                    return next;
                                                                })
                                                            }
                                                        >
                                                            Reset to defaults
                                                        </Button>
                                                    )}
                                                </div>

                                                {/* Visual Outcome Bars */}
                                                <div>
                                                    <OverlineText as="h4" className="mb-3">
                                                        Projected Outcomes
                                                    </OverlineText>
                                                    <div className="space-y-3">
                                                        {scenario.outcomes.map((o, i) => (
                                                            <OutcomeBar
                                                                key={i}
                                                                label={o.metric}
                                                                base={o.baseValue}
                                                                projected={o.projectedValue}
                                                                format={
                                                                    o.type as
                                                                        | "currency"
                                                                        | "percentage"
                                                                        | "hours"
                                                                }
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Outcome Detail Table */}
                                                <div>
                                                    <OverlineText as="h4" className="mb-3">
                                                        Detailed Breakdown
                                                    </OverlineText>
                                                    <div className="border rounded-lg overflow-hidden">
                                                        <table className="w-full text-sm">
                                                            <thead>
                                                                <tr className="bg-muted/50 border-b">
                                                                    <th className="text-left p-3 font-medium text-xs">
                                                                        Metric
                                                                    </th>
                                                                    <th className="text-right p-3 font-medium text-xs">
                                                                        Baseline
                                                                    </th>
                                                                    <th className="text-right p-3 font-medium text-xs">
                                                                        Projected
                                                                    </th>
                                                                    <th className="text-right p-3 font-medium text-xs">
                                                                        Variance
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {scenario.outcomes.map((o, i) => {
                                                                    const variance =
                                                                        o.projectedValue -
                                                                        o.baseValue;
                                                                    const variancePct =
                                                                        o.baseValue !== 0
                                                                            ? (variance /
                                                                                  o.baseValue) *
                                                                              100
                                                                            : 0;
                                                                    const isPositive =
                                                                        o.metric.includes("Cost") ||
                                                                        o.metric.includes("Idle")
                                                                            ? variance <= 0
                                                                            : variance >= 0;
                                                                    const fmt = (v: number) =>
                                                                        o.type === "currency"
                                                                            ? formatCurrency(v)
                                                                            : o.type ===
                                                                                "percentage"
                                                                              ? `${v.toFixed(1)}%`
                                                                              : v.toLocaleString();
                                                                    return (
                                                                        <tr
                                                                            key={i}
                                                                            className="border-b last:border-0 hover:bg-secondary/30"
                                                                        >
                                                                            <td className="p-3 font-medium text-xs">
                                                                                {o.metric}
                                                                            </td>
                                                                            <td className="p-3 text-right text-xs text-muted-foreground tabular-nums">
                                                                                {fmt(o.baseValue)}
                                                                            </td>
                                                                            <td className="p-3 text-right text-xs font-bold tabular-nums">
                                                                                {fmt(
                                                                                    o.projectedValue
                                                                                )}
                                                                            </td>
                                                                            <td
                                                                                className={`p-3 text-right text-xs font-medium tabular-nums ${isPositive ? "text-success" : "text-destructive"}`}
                                                                            >
                                                                                {variance > 0
                                                                                    ? "+"
                                                                                    : ""}
                                                                                {fmt(variance)}
                                                                                {o.baseValue !==
                                                                                    0 && (
                                                                                    <span className="text-[10px] ml-1">
                                                                                        (
                                                                                        {variancePct >
                                                                                        0
                                                                                            ? "+"
                                                                                            : ""}
                                                                                        {variancePct.toFixed(
                                                                                            1
                                                                                        )}
                                                                                        %)
                                                                                    </span>
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex items-center gap-2 pt-2 border-t">
                                                    {scenario.status === "active" && (
                                                        <Button size="sm">
                                                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />{" "}
                                                            Select This Scenario
                                                        </Button>
                                                    )}
                                                    <Button variant="outline" size="sm">
                                                        <Copy className="mr-1.5 h-3.5 w-3.5" />{" "}
                                                        Duplicate & Adjust
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        );
                                    })()}
                            </Card>
                        );
                    })}
                </div>
            )}
            <CreateEntityDialog
                config={CREATE_SCENARIO_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </>
    );

    const config: DashboardPageConfig = {
        resource: "scenarios",
        action: "read",
        title: "Scenario Builder",
        description:
            "Simulate pricing, resource, and budget outcomes to make data-driven decisions",
        headerActions: (
            <Button onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" /> New Scenario
            </Button>
        ),
        contentSlot,
    };

    return <OperationalDashboardShell config={config} isLoading={isLoading} />;
}
