"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OverlineText } from "@/components/ui/overline-text";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";
import {
    FlaskConical, Plus, TrendingUp,
    ArrowRight, Copy, Trash2, CheckCircle2, BarChart3,
    GitCompare,
} from "lucide-react";
import { PermissionGate } from "@/components/permission-guard";

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

const mockScenarios: Scenario[] = [
    {
        id: "1",
        name: "Nike Q2 — Aggressive Growth",
        description: "What if we increase the crew by 3 and take on 2 additional projects?",
        scenarioType: "combined",
        status: "active",
        projectName: "Nike Air Max Launch",
        createdBy: "Sarah Chen",
        updatedAt: "2026-02-24",
        tags: ["growth", "hiring"],
        variables: [
            { name: "Senior Producer Headcount", baseValue: 2, adjustedValue: 3, unit: "people", category: "resource" },
            { name: "Project Count (Q2)", baseValue: 4, adjustedValue: 6, unit: "projects", category: "revenue" },
            { name: "Avg Project Value", baseValue: 250000, adjustedValue: 250000, unit: "USD", category: "revenue" },
            { name: "Bill Rate — Senior Producer", baseValue: 185, adjustedValue: 195, unit: "USD/hr", category: "pricing" },
        ],
        outcomes: [
            { metric: "Q2 Revenue", baseValue: 1000000, projectedValue: 1500000, type: "currency" },
            { metric: "Q2 Costs", baseValue: 680000, projectedValue: 920000, type: "currency" },
            { metric: "Q2 Profit", baseValue: 320000, projectedValue: 580000, type: "currency" },
            { metric: "Profit Margin", baseValue: 32, projectedValue: 38.7, type: "percentage" },
            { metric: "Team Utilization", baseValue: 78, projectedValue: 88, type: "percentage" },
        ],
    },
    {
        id: "2",
        name: "Nike Q2 — Conservative",
        description: "Keep current team size, focus on margin improvement",
        scenarioType: "pricing",
        status: "active",
        projectName: "Nike Air Max Launch",
        createdBy: "Sarah Chen",
        updatedAt: "2026-02-24",
        tags: ["conservative", "margin"],
        variables: [
            { name: "Bill Rate Increase", baseValue: 0, adjustedValue: 8, unit: "%", category: "pricing" },
            { name: "Overhead Reduction", baseValue: 0, adjustedValue: 5, unit: "%", category: "budget" },
        ],
        outcomes: [
            { metric: "Q2 Revenue", baseValue: 1000000, projectedValue: 1080000, type: "currency" },
            { metric: "Q2 Costs", baseValue: 680000, projectedValue: 646000, type: "currency" },
            { metric: "Q2 Profit", baseValue: 320000, projectedValue: 434000, type: "currency" },
            { metric: "Profit Margin", baseValue: 32, projectedValue: 40.2, type: "percentage" },
        ],
    },
    {
        id: "3",
        name: "Red Bull — What If We Lose?",
        description: "Impact analysis if the Red Bull deal falls through",
        scenarioType: "revenue",
        status: "draft",
        projectName: "Red Bull Festival",
        createdBy: "Mike Johnson",
        updatedAt: "2026-02-22",
        tags: ["risk", "contingency"],
        variables: [
            { name: "Red Bull Revenue", baseValue: 320000, adjustedValue: 0, unit: "USD", category: "revenue" },
            { name: "Available Capacity", baseValue: 0, adjustedValue: 2400, unit: "hours", category: "resource" },
        ],
        outcomes: [
            { metric: "Q2 Revenue", baseValue: 1000000, projectedValue: 680000, type: "currency" },
            { metric: "Team Utilization", baseValue: 78, projectedValue: 62, type: "percentage" },
            { metric: "Idle Cost", baseValue: 0, projectedValue: 180000, type: "currency" },
        ],
    },
    {
        id: "4",
        name: "Hiring Plan — 3 New Roles",
        description: "Cost and capacity impact of planned Q2 hires",
        scenarioType: "hiring",
        status: "selected",
        projectName: null,
        createdBy: "Mike Johnson",
        updatedAt: "2026-02-20",
        tags: ["hiring", "capacity"],
        variables: [
            { name: "Production Coordinator", baseValue: 0, adjustedValue: 1, unit: "people", category: "hiring" },
            { name: "Fabrication Lead", baseValue: 0, adjustedValue: 1, unit: "people", category: "hiring" },
            { name: "Junior Designer", baseValue: 0, adjustedValue: 1, unit: "people", category: "hiring" },
            { name: "Annual Salary Total", baseValue: 0, adjustedValue: 200000, unit: "USD", category: "budget" },
        ],
        outcomes: [
            { metric: "Annual Cost Impact", baseValue: 0, projectedValue: 200000, type: "currency" },
            { metric: "Capacity Added", baseValue: 0, projectedValue: 4800, type: "hours" },
            { metric: "Break-Even Revenue", baseValue: 0, projectedValue: 312000, type: "currency" },
            { metric: "Team Utilization (Post-Hire)", baseValue: 85, projectedValue: 76, type: "percentage" },
        ],
    },
];

export default function ScenariosPage() {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<"all" | ScenarioType>("all");
    const [expandedId, setExpandedId] = useState<string | null>("1");

    const filtered = mockScenarios.filter((s) => {
        if (typeFilter !== "all" && s.scenarioType !== typeFilter) return false;
        if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const bestProfit = Math.max(...mockScenarios.flatMap((s) => s.outcomes.filter((o) => o.metric.includes("Profit") && o.type === "currency").map((o) => o.projectedValue)));
    const bestMargin = Math.max(...mockScenarios.flatMap((s) => s.outcomes.filter((o) => o.metric.includes("Margin")).map((o) => o.projectedValue)));

    return (
        <PermissionGate resource="scenarios" action="read">
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Scenario Builder" description="Simulate pricing, resource, and budget outcomes to make data-driven decisions">
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> New Scenario
                </Button>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Active Scenarios" value={mockScenarios.filter((s) => s.status === "active").length} description="being evaluated" icon={FlaskConical} />
                <StatCard title="Best Projected Profit" value={formatCurrency(bestProfit)} description="across all scenarios" icon={TrendingUp} change={12} />
                <StatCard title="Best Margin" value={`${bestMargin.toFixed(1)}%`} description="highest projected" icon={BarChart3} />
                <StatCard title="Selected Plans" value={mockScenarios.filter((s) => s.status === "selected").length} description="approved for execution" icon={CheckCircle2} />
            </div>

            <div className="flex items-center gap-4 flex-wrap">
                <SearchInput value={search} onValueChange={setSearch} placeholder="Search scenarios..." className="flex-1 max-w-sm" />
                <div className="flex gap-1 flex-wrap">
                    {(["all", "combined", "budget", "revenue", "pricing", "hiring", "resource"] as const).map((t) => (
                        <Button key={t} variant={typeFilter === t ? "default" : "ghost"} size="sm" onClick={() => setTypeFilter(t)} className="text-xs">
                            {t === "all" ? "All" : TYPE_LABELS[t]}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Compare Banner */}
            {mockScenarios.filter((s) => s.status === "active").length >= 2 && (
                <Card className="border-dashed border-primary/30 bg-primary/5">
                    <CardContent className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-2 text-sm">
                            <GitCompare className="h-4 w-4 text-primary" />
                            <span className="font-medium">Compare active scenarios side-by-side</span>
                        </div>
                        <Button variant="outline" size="sm">Compare Scenarios</Button>
                    </CardContent>
                </Card>
            )}

            {/* Scenario Cards */}
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
                                            <CardTitle className="text-base">{scenario.name}</CardTitle>
                                            <StatusBadge status={scenario.status} className="text-[10px]" />
                                            <Badge variant="ghost" className="text-[10px]">{TYPE_LABELS[scenario.scenarioType]}</Badge>
                                        </div>
                                        <CardDescription>{scenario.description}</CardDescription>
                                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                                            {scenario.projectName && <span>{scenario.projectName}</span>}
                                            <span>by {scenario.createdBy}</span>
                                            <span>Updated {scenario.updatedAt}</span>
                                            {scenario.tags.map((t) => (
                                                <Badge key={t} variant="ghost" className="text-[8px] px-1">{t}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => e.stopPropagation()}>
                                            <Copy className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={(e) => e.stopPropagation()}>
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            {isExpanded && (
                                <CardContent className="pt-0 space-y-6">
                                    {/* Variables */}
                                    <div>
                                        <OverlineText as="h4" className="mb-3">Adjustable Variables</OverlineText>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {scenario.variables.map((v, i) => {
                                                const changed = v.baseValue !== v.adjustedValue;
                                                const isUp = v.adjustedValue > v.baseValue;
                                                return (
                                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                                                        <div>
                                                            <p className="text-xs font-medium">{v.name}</p>
                                                            <p className="text-[10px] text-muted-foreground">{{ budget: "Budget", revenue: "Revenue", pricing: "Pricing", hiring: "Hiring", resource: "Resource" }[v.category] ?? v.category}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-muted-foreground tabular-nums">
                                                                {v.unit === "USD" || v.unit === "USD/hr" ? formatCurrency(v.baseValue) : v.baseValue}
                                                            </span>
                                                            {changed && (
                                                                <>
                                                                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                                    <span className={`text-xs font-bold tabular-nums ${isUp ? "text-success" : "text-destructive"}`}>
                                                                        {v.unit === "USD" || v.unit === "USD/hr" ? formatCurrency(v.adjustedValue) : v.adjustedValue}
                                                                    </span>
                                                                </>
                                                            )}
                                                            <span className="text-[9px] text-muted-foreground">{v.unit === "USD" ? "" : v.unit}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Projected Outcomes */}
                                    <div>
                                        <OverlineText as="h4" className="mb-3">Projected Outcomes</OverlineText>
                                        <div className="border rounded-lg overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-muted/50 border-b">
                                                        <th className="text-left p-3 font-medium text-xs">Metric</th>
                                                        <th className="text-right p-3 font-medium text-xs">Baseline</th>
                                                        <th className="text-right p-3 font-medium text-xs">Projected</th>
                                                        <th className="text-right p-3 font-medium text-xs">Variance</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {scenario.outcomes.map((o, i) => {
                                                        const variance = o.projectedValue - o.baseValue;
                                                        const variancePct = o.baseValue !== 0 ? (variance / o.baseValue) * 100 : 0;
                                                        const isPositive = (o.metric.includes("Cost") || o.metric.includes("Idle")) ? variance <= 0 : variance >= 0;
                                                        const fmt = (v: number) => o.type === "currency" ? formatCurrency(v) : o.type === "percentage" ? `${v.toFixed(1)}%` : v.toLocaleString();
                                                        return (
                                                            <tr key={i} className="border-b last:border-0 hover:bg-secondary/30">
                                                                <td className="p-3 font-medium text-xs">{o.metric}</td>
                                                                <td className="p-3 text-right text-xs text-muted-foreground tabular-nums">{fmt(o.baseValue)}</td>
                                                                <td className="p-3 text-right text-xs font-bold tabular-nums">{fmt(o.projectedValue)}</td>
                                                                <td className={`p-3 text-right text-xs font-medium tabular-nums ${isPositive ? "text-success" : "text-destructive"}`}>
                                                                    {variance > 0 ? "+" : ""}{fmt(variance)}
                                                                    {o.baseValue !== 0 && (
                                                                        <span className="text-[10px] ml-1">
                                                                            ({variancePct > 0 ? "+" : ""}{variancePct.toFixed(1)}%)
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
                                                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Select This Scenario
                                            </Button>
                                        )}
                                        <Button variant="outline" size="sm">
                                            <Copy className="mr-1.5 h-3.5 w-3.5" /> Duplicate & Adjust
                                        </Button>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
        </PermissionGate>
    );
}
