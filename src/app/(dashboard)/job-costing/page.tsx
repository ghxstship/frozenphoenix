"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import {
    Calculator, Search, DollarSign, TrendingUp, TrendingDown,
    BarChart3,
} from "lucide-react";
import { MOCK_JOB_COST_ENTRIES } from "@/lib/mock-data-vendor-lifecycle";
import type { JobCostType } from "@/types/vendor-lifecycle";

const COST_TYPE_CONFIG: Record<JobCostType, { label: string; color: string }> = {
    labor: { label: "Labor", color: "bg-info" },
    material: { label: "Material", color: "bg-success" },
    equipment: { label: "Equipment", color: "bg-primary" },
    subcontractor: { label: "Subcontractor", color: "bg-warning" },
    expense: { label: "Expense", color: "bg-destructive" },
    overhead: { label: "Overhead", color: "bg-muted-foreground" },
};

export default function JobCostingPage() {
    const [search, setSearch] = useState("");
    const [projectFilter, setProjectFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");

    const entries = MOCK_JOB_COST_ENTRIES;

    const projects = [...new Set(entries.map(e => e.projectName).filter(Boolean))] as string[];

    const filtered = entries.filter(e => {
        const matchesSearch = !search || e.description.toLowerCase().includes(search.toLowerCase()) || (e.vendorName || "").toLowerCase().includes(search.toLowerCase());
        const matchesProject = projectFilter === "all" || e.projectName === projectFilter;
        const matchesType = typeFilter === "all" || e.costType === typeFilter;
        return matchesSearch && matchesProject && matchesType;
    });

    const totalCost = filtered.reduce((s, e) => s + e.totalCost, 0);
    const totalBudgeted = filtered.reduce((s, e) => s + (e.budgetedAmount || 0), 0);
    const variance = totalBudgeted - totalCost;
    const billableAmount = filtered.filter(e => e.billable).reduce((s, e) => s + e.totalCost, 0);

    const costByType = Object.keys(COST_TYPE_CONFIG).map(type => ({
        type: type as JobCostType,
        ...COST_TYPE_CONFIG[type as JobCostType],
        total: filtered.filter(e => e.costType === type).reduce((s, e) => s + e.totalCost, 0),
        budgeted: filtered.filter(e => e.costType === type).reduce((s, e) => s + (e.budgetedAmount || 0), 0),
    })).filter(c => c.total > 0);

    const projectSummaries = projects.map(project => {
        const projectEntries = entries.filter(e => e.projectName === project);
        const cost = projectEntries.reduce((s, e) => s + e.totalCost, 0);
        const budget = projectEntries.reduce((s, e) => s + (e.budgetedAmount || 0), 0);
        return { project, cost, budget, variance: budget - cost, entries: projectEntries.length };
    });

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Job Costing" description="Per-project profitability tracking with labor, material, equipment, and subcontractor cost breakdown">
                <Button size="sm"><Calculator className="h-4 w-4" /> Export Report</Button>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Costs" value={formatCurrency(totalCost)} icon={DollarSign} />
                <StatCard title="Total Budgeted" value={formatCurrency(totalBudgeted)} icon={BarChart3} />
                <StatCard title="Variance" value={formatCurrency(variance)} icon={variance >= 0 ? TrendingUp : TrendingDown} />
                <StatCard title="Billable Amount" value={formatCurrency(billableAmount)} icon={Calculator} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Cost Breakdown by Type</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {costByType.map(ct => {
                            const pct = totalCost > 0 ? (ct.total / totalCost) * 100 : 0;
                            return (
                                <div key={ct.type} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{ct.label}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-muted-foreground">Budget: {formatCurrency(ct.budgeted)}</span>
                                            <span className="font-medium">{formatCurrency(ct.total)}</span>
                                        </div>
                                    </div>
                                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                                        <div className={`h-full rounded-full ${ct.color} transition-all`} style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Project Profitability</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {projectSummaries.map(ps => (
                            <div key={ps.project} className="p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer">
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="text-sm font-medium">{ps.project}</h4>
                                    <Badge variant={ps.variance >= 0 ? "success" : "destructive"} className="text-[10px]">
                                        {ps.variance >= 0 ? "Under Budget" : "Over Budget"}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div>
                                        <p className="text-muted-foreground">Budget</p>
                                        <p className="font-medium">{formatCurrency(ps.budget)}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Actual</p>
                                        <p className="font-medium">{formatCurrency(ps.cost)}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Variance</p>
                                        <p className={`font-medium ${ps.variance >= 0 ? "text-success" : "text-destructive"}`}>
                                            {ps.variance >= 0 ? "+" : ""}{formatCurrency(ps.variance)}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${ps.budget > 0 && ps.cost / ps.budget > 1 ? "bg-destructive" : "bg-primary"}`}
                                        style={{ width: `${Math.min(ps.budget > 0 ? (ps.cost / ps.budget) * 100 : 0, 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search cost entries..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
                <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="all">All Projects</option>
                    {projects.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="all">All Types</option>
                    {Object.entries(COST_TYPE_CONFIG).map(([key, cfg]) => (
                        <option key={key} value={key}>{cfg.label}</option>
                    ))}
                </select>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="text-left p-3 font-medium">Date</th>
                                    <th className="text-left p-3 font-medium">Description</th>
                                    <th className="text-left p-3 font-medium">Project</th>
                                    <th className="text-left p-3 font-medium">Type</th>
                                    <th className="text-left p-3 font-medium">Vendor / Crew</th>
                                    <th className="text-right p-3 font-medium">Qty</th>
                                    <th className="text-right p-3 font-medium">Unit Cost</th>
                                    <th className="text-right p-3 font-medium">Total</th>
                                    <th className="text-right p-3 font-medium">Budgeted</th>
                                    <th className="text-center p-3 font-medium">Billable</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(entry => (
                                    <tr key={entry.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                        <td className="p-3 text-xs text-muted-foreground">{entry.costDate}</td>
                                        <td className="p-3 font-medium">{entry.description}</td>
                                        <td className="p-3 text-xs text-muted-foreground">{entry.projectName}</td>
                                        <td className="p-3">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                                                {COST_TYPE_CONFIG[entry.costType].label}
                                            </span>
                                        </td>
                                        <td className="p-3 text-xs text-muted-foreground">{entry.vendorName || entry.crewMemberName || "—"}</td>
                                        <td className="p-3 text-right text-xs">{entry.quantity} {entry.unit}</td>
                                        <td className="p-3 text-right text-xs">{formatCurrency(entry.unitCost)}</td>
                                        <td className="p-3 text-right font-medium">{formatCurrency(entry.totalCost)}</td>
                                        <td className="p-3 text-right text-xs text-muted-foreground">{entry.budgetedAmount ? formatCurrency(entry.budgetedAmount) : "—"}</td>
                                        <td className="p-3 text-center">
                                            {entry.billable ? (
                                                <Badge variant="success" className="text-[9px]">Yes</Badge>
                                            ) : (
                                                <Badge variant="default" className="text-[9px]">No</Badge>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t-2 border-border bg-muted/30 font-bold">
                                    <td className="p-3" colSpan={7}>Total</td>
                                    <td className="p-3 text-right">{formatCurrency(totalCost)}</td>
                                    <td className="p-3 text-right">{formatCurrency(totalBudgeted)}</td>
                                    <td className="p-3" />
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
