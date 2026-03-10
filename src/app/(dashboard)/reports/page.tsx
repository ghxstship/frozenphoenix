"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import React from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { PageShell } from "@/components/layouts/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCrewMembers, useDeals, useProjects, useTasks, useVendors } from "@/lib/supabase/hooks";
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
    Loader2,
    PieChart,
    TrendingUp,
    Truck,
    Users,
} from "lucide-react";

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

    const deals = sbDeals ?? [];
    const projects = sbProjects ?? [];
    const tasks = sbTasks ?? [];
    const crew = sbCrew ?? [];
    const vendors = sbVendors ?? [];
    const isLoading =
        dealsLoading || projectsLoading || tasksLoading || crewLoading || vendorsLoading;

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
        return (
            <LoadingState />
        );
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
                                            <Button size="sm" variant="ghost">
                                                <BarChart3 className="h-4 w-4" />
                                                View Report
                                            </Button>
                                            <Button size="sm" variant="ghost">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </StaggerItem>
                        );
                    })}
                </div>

                {/* Quick Charts */}
                <div className="grid grid-cols-2 gap-4">
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
