"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import React, { useCallback, useMemo, useState } from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { PageShell } from "@/components/layouts/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCrewMembers, useDeals, useProjects, useTasks, useVendors } from "@/lib/supabase";
import { PermissionGate } from "@/components/permission-guard";
import { formatCurrency } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getStatusLabel } from "@/config/ui-variants";
import { StaggerItem } from "@/components/ui/stagger-container";
import {
    BarChart3,
    CheckSquare,
    DollarSign,
    Download,
    FileText,
    PieChart,
    TrendingUp,
    Truck,
    Users,
} from "lucide-react";
import { EmptyState } from "@/components/layouts/empty-state";
import { downloadCsvBlob, serializeCsv } from "@/lib/csv/csv-utils";

interface ReportCard {
    id: string;
    title: string;
    description: string;
    icon: typeof BarChart3;
    category: "financial" | "production" | "resources" | "sales";
    lastRun?: string;
}

const REPORTS: ReportCard[] = [
    {
        id: "project-summary",
        title: "Project Summary",
        description: "Overview of all projects with status, budget, and timeline",
        icon: FileText,
        category: "production",
    },
    {
        id: "budget-variance",
        title: "Budget Variance",
        description: "Planned vs actual spend by project and category",
        icon: DollarSign,
        category: "financial",
    },
    {
        id: "crew-utilization",
        title: "Crew Utilization",
        description: "Hours worked, availability, and labor costs",
        icon: Users,
        category: "resources",
    },
    {
        id: "vendor-spend",
        title: "Vendor Spend",
        description: "Spend analysis by vendor with PO/Invoice matching",
        icon: Truck,
        category: "financial",
    },
    {
        id: "pipeline-forecast",
        title: "Pipeline Forecast",
        description: "Weighted pipeline value by stage and close date",
        icon: TrendingUp,
        category: "sales",
    },
    {
        id: "task-completion",
        title: "Task Completion",
        description: "Task completion rates by project and phase",
        icon: CheckSquare,
        category: "production",
    },
];

const categoryConfig = {
    financial: { label: "Financial", variant: "success" as const },
    production: { label: "Production", variant: "info" as const },
    resources: { label: "Resources", variant: "warning" as const },
    sales: { label: "Sales", variant: "default" as const },
};

export default function ReportsPage() {
    const CATEGORY_FILTERS = ["all", "financial", "production", "resources", "sales"] as const;
    const [selectedCategory, setSelectedCategory] = useQueryTabState({
        key: "category",
        defaultValue: "all",
        validValues: CATEGORY_FILTERS,
    });
    const { data: sbDeals, isLoading: dealsLoading } = useDeals();
    const { data: sbProjects, isLoading: projectsLoading } = useProjects();
    const { data: sbTasks, isLoading: tasksLoading } = useTasks();
    const { data: sbCrew, isLoading: crewLoading } = useCrewMembers();
    const { data: sbVendors, isLoading: vendorsLoading } = useVendors();

    const deals = useMemo(() => sbDeals ?? [], [sbDeals]);
    const projects = useMemo(() => sbProjects ?? [], [sbProjects]);
    const tasks = useMemo(() => sbTasks ?? [], [sbTasks]);
    const crew = useMemo(() => sbCrew ?? [], [sbCrew]);
    const vendors = useMemo(() => sbVendors ?? [], [sbVendors]);
    const isLoading =
        dealsLoading || projectsLoading || tasksLoading || crewLoading || vendorsLoading;

    const [selectedReport, setSelectedReport] = useState<string | null>(null);

    const getReportData = useCallback(
        (
            reportId: string
        ): { headers: { key: string; label: string }[]; rows: Record<string, unknown>[] } => {
            switch (reportId) {
                case "project-summary":
                    return {
                        headers: [
                            { key: "name", label: "Project" },
                            { key: "status", label: "Status" },
                            { key: "budget_planned", label: "Budget Planned" },
                            { key: "budget_actual", label: "Budget Actual" },
                            { key: "variance", label: "Variance" },
                        ],
                        rows: projects.map((p: Record<string, unknown>) => ({
                            name: p.name ?? "",
                            status: getStatusLabel((p.status as string) ?? ""),
                            budget_planned: (p.budget_planned as number) ?? 0,
                            budget_actual: (p.budget_actual as number) ?? 0,
                            variance:
                                ((p.budget_planned as number) ?? 0) -
                                ((p.budget_actual as number) ?? 0),
                        })),
                    };
                case "budget-variance":
                    return {
                        headers: [
                            { key: "name", label: "Project" },
                            { key: "planned", label: "Planned" },
                            { key: "actual", label: "Actual" },
                            { key: "variance", label: "Variance" },
                            { key: "pct", label: "% Utilized" },
                        ],
                        rows: projects.map((p: Record<string, unknown>) => {
                            const planned = (p.budget_planned as number) ?? 0;
                            const actual = (p.budget_actual as number) ?? 0;
                            return {
                                name: p.name ?? "",
                                planned,
                                actual,
                                variance: planned - actual,
                                pct: planned > 0 ? Math.round((actual / planned) * 100) : 0,
                            };
                        }),
                    };
                case "crew-utilization":
                    return {
                        headers: [
                            { key: "name", label: "Crew Member" },
                            { key: "role", label: "Role" },
                            { key: "status", label: "Status" },
                        ],
                        rows: crew.map((c: Record<string, unknown>) => ({
                            name: c.name ?? c.full_name ?? "",
                            role: c.role ?? c.primary_role ?? "",
                            status: c.status ?? "",
                        })),
                    };
                case "vendor-spend":
                    return {
                        headers: [
                            { key: "name", label: "Vendor" },
                            { key: "status", label: "Status" },
                            { key: "category", label: "Category" },
                        ],
                        rows: vendors.map((v: Record<string, unknown>) => ({
                            name: v.name ?? v.company_name ?? "",
                            status: v.status ?? "",
                            category: v.category ?? "",
                        })),
                    };
                case "pipeline-forecast":
                    return {
                        headers: [
                            { key: "name", label: "Deal" },
                            { key: "stage", label: "Stage" },
                            { key: "value", label: "Value" },
                            { key: "probability", label: "Probability %" },
                            { key: "weighted", label: "Weighted Value" },
                        ],
                        rows: deals.map((d: Record<string, unknown>) => ({
                            name: d.name ?? d.title ?? "",
                            stage: d.stage ?? "",
                            value: (d.value as number) ?? 0,
                            probability: (d.probability as number) ?? 0,
                            weighted:
                                ((d.value as number) ?? 0) *
                                (((d.probability as number) ?? 0) / 100),
                        })),
                    };
                case "task-completion":
                    return {
                        headers: [
                            { key: "title", label: "Task" },
                            { key: "status", label: "Status" },
                            { key: "priority", label: "Priority" },
                        ],
                        rows: tasks.map((t: Record<string, unknown>) => ({
                            title: t.title ?? t.name ?? "",
                            status: t.status ?? "",
                            priority: t.priority ?? "",
                        })),
                    };
                default:
                    return { headers: [], rows: [] };
            }
        },
        [projects, crew, vendors, deals, tasks]
    );

    const handleDownloadReport = useCallback(
        (reportId: string) => {
            const { headers, rows } = getReportData(reportId);
            if (rows.length === 0) return;
            const csv = serializeCsv(rows, headers);
            downloadCsvBlob(csv, `${reportId}_${new Date().toISOString().split("T")[0]}.csv`);
        },
        [getReportData]
    );

    // Calculate summary stats
    const totalPipelineValue = deals.reduce(
        (sum: number, d: Record<string, unknown>) =>
            sum + ((d.value as number) ?? 0) * (((d.probability as number) ?? 0) / 100),
        0
    );
    const totalBudget = projects.reduce(
        (sum: number, p: Record<string, unknown>) =>
            sum + ((p.budget_planned as number) ?? (p.budgetPlanned as number) ?? 0),
        0
    );
    const totalActual = projects.reduce(
        (sum: number, p: Record<string, unknown>) =>
            sum + ((p.budget_actual as number) ?? (p.budgetActual as number) ?? 0),
        0
    );
    const completedTasks = tasks.filter((t) => t.status === "done").length;
    const availableCrew = crew.filter((c) => c.status === "available").length;

    if (isLoading) {
        return <LoadingState />;
    }

    const filteredReports =
        selectedCategory === "all"
            ? REPORTS
            : REPORTS.filter((r) => r.category === selectedCategory);

    return (
        <PermissionGate resource="reports" action="read">
            <PageShell
                title="Reports"
                description="Analytics and reporting dashboard"
                actions={
                    <Button>
                        <Download className="h-4 w-4" />
                        Export All
                    </Button>
                }
            >
                {/* Summary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <TrendingUp className="h-4 w-4" />
                                <span className="text-xs">Pipeline Value</span>
                            </div>
                            <p className="text-xl font-bold">
                                {formatCurrency(totalPipelineValue)}
                            </p>
                            <p className="text-xs text-muted-foreground">weighted</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <DollarSign className="h-4 w-4" />
                                <span className="text-xs">Total Budget</span>
                            </div>
                            <p className="text-xl font-bold">{formatCurrency(totalBudget)}</p>
                            <p className="text-xs text-muted-foreground">
                                {Math.round((totalActual / totalBudget) * 100)}% utilized
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <CheckSquare className="h-4 w-4" />
                                <span className="text-xs">Tasks Completed</span>
                            </div>
                            <p className="text-xl font-bold">
                                {completedTasks}/{tasks.length}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {tasks.length > 0
                                    ? Math.round((completedTasks / tasks.length) * 100)
                                    : 0}
                                % done
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Users className="h-4 w-4" />
                                <span className="text-xs">Crew Available</span>
                            </div>
                            <p className="text-xl font-bold">
                                {availableCrew}/{crew.length}
                            </p>
                            <p className="text-xs text-muted-foreground">ready to assign</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Truck className="h-4 w-4" />
                                <span className="text-xs">Active Vendors</span>
                            </div>
                            <p className="text-xl font-bold">
                                {vendors.filter((v) => v.status === "active").length}
                            </p>
                            <p className="text-xs text-muted-foreground">vendors</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Category Filter */}
                <SegmentedControl
                    ariaLabel="Report category filter"
                    value={selectedCategory}
                    onValueChange={(v) =>
                        setSelectedCategory(v as (typeof CATEGORY_FILTERS)[number])
                    }
                    size="sm"
                    options={[
                        { value: "all", label: "All Reports" },
                        { value: "financial", label: "Financial" },
                        { value: "production", label: "Production" },
                        { value: "resources", label: "Resources" },
                        { value: "sales", label: "Sales" },
                    ]}
                />

                {/* Report Cards */}
                {filteredReports.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title="No reports found"
                        description="Try selecting a different category"
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredReports.map((report, i) => {
                            const Icon = report.icon;
                            const category = categoryConfig[report.category];

                            return (
                                <StaggerItem key={report.id} index={i} stagger="relaxed">
                                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-start justify-between">
                                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                    <Icon className="h-5 w-5 text-primary" />
                                                </div>
                                                <Badge
                                                    variant={category.variant}
                                                    className="text-[10px]"
                                                >
                                                    {category.label}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <h3 className="font-semibold mb-1">{report.title}</h3>
                                            <p className="text-xs text-muted-foreground mb-4">
                                                {report.description}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        setSelectedReport(
                                                            selectedReport === report.id
                                                                ? null
                                                                : report.id
                                                        )
                                                    }
                                                >
                                                    <BarChart3 className="h-4 w-4" />
                                                    {selectedReport === report.id
                                                        ? "Hide"
                                                        : "View Report"}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDownloadReport(report.id)}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </StaggerItem>
                            );
                        })}
                    </div>
                )}

                {/* Selected Report Detail */}
                {selectedReport &&
                    (() => {
                        const reportDef = REPORTS.find((r) => r.id === selectedReport);
                        const { headers, rows } = getReportData(selectedReport);
                        if (!reportDef || rows.length === 0) return null;
                        return (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <reportDef.icon className="h-4 w-4" />
                                            {reportDef.title}
                                        </CardTitle>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="ghost" className="text-[10px]">
                                                {rows.length} rows
                                            </Badge>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDownloadReport(selectedReport)}
                                            >
                                                <Download className="h-4 w-4" />
                                                Export CSV
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0 overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                {headers.map((h) => (
                                                    <th
                                                        key={h.key}
                                                        className="text-left p-3 font-medium"
                                                    >
                                                        {h.label}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.slice(0, 25).map((row, i) => (
                                                <tr
                                                    key={i}
                                                    className="border-b hover:bg-secondary/30 transition-colors"
                                                >
                                                    {headers.map((h) => (
                                                        <td
                                                            key={h.key}
                                                            className="p-3 tabular-nums"
                                                        >
                                                            {typeof row[h.key] === "number"
                                                                ? h.key.includes("pct") ||
                                                                  h.key.includes("probability")
                                                                    ? `${row[h.key]}%`
                                                                    : h.key.includes("budget") ||
                                                                        h.key.includes(
                                                                            "variance"
                                                                        ) ||
                                                                        h.key.includes("planned") ||
                                                                        h.key.includes("actual") ||
                                                                        h.key.includes("value") ||
                                                                        h.key.includes("weighted")
                                                                      ? formatCurrency(
                                                                            row[h.key] as number
                                                                        )
                                                                      : String(row[h.key])
                                                                : String(row[h.key] ?? "")}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {rows.length > 25 && (
                                        <p className="text-xs text-muted-foreground text-center py-3">
                                            Showing 25 of {rows.length} rows. Export CSV for full
                                            data.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })()}

                {/* Quick Charts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <PieChart className="h-4 w-4" />
                                Projects by Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {["active", "draft", "completed", "on_hold"].map((status) => {
                                    const count = projects.filter(
                                        (p) => p.status === status
                                    ).length;
                                    const percentage =
                                        projects.length > 0
                                            ? Math.round((count / projects.length) * 100)
                                            : 0;
                                    return (
                                        <div key={status} className="flex items-center gap-3">
                                            <div className="w-20 text-xs text-muted-foreground">
                                                {getStatusLabel(status)}
                                            </div>
                                            <ProgressBar
                                                value={percentage}
                                                size="md"
                                                className="flex-1"
                                            />
                                            <div className="w-12 text-xs text-right">
                                                {count} ({percentage}%)
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                Pipeline by Stage
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {["lead", "qualified", "proposal", "negotiation", "won"].map(
                                    (stage) => {
                                        const stageDeals = deals.filter((d) => d.stage === stage);
                                        const value = stageDeals.reduce(
                                            (sum, d) => sum + d.value,
                                            0
                                        );
                                        const maxValue = Math.max(
                                            ...[
                                                "lead",
                                                "qualified",
                                                "proposal",
                                                "negotiation",
                                                "won",
                                            ].map((s) =>
                                                deals
                                                    .filter((d) => d.stage === s)
                                                    .reduce(
                                                        (sum: number, d: Record<string, unknown>) =>
                                                            sum + ((d.value as number) ?? 0),
                                                        0
                                                    )
                                            )
                                        );
                                        const percentage =
                                            maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;
                                        return (
                                            <div key={stage} className="flex items-center gap-3">
                                                <div className="w-20 text-xs text-muted-foreground">
                                                    {
                                                        {
                                                            lead: "Lead",
                                                            qualified: "Qualified",
                                                            proposal: "Proposal",
                                                            negotiation: "Negotiation",
                                                            won: "Won",
                                                        }[stage]
                                                    }
                                                </div>
                                                <ProgressBar value={percentage} size="md" />
                                                <div className="w-20 text-xs text-right">
                                                    {formatCurrency(value)}
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </PageShell>
        </PermissionGate>
    );
}
