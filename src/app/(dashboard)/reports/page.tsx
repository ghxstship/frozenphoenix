"use client";

import React, { useState } from "react";
import { PageShell } from "@/components/layouts/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_PROJECTS, MOCK_DEALS, MOCK_TASKS, MOCK_CREW, MOCK_VENDORS } from "@/lib/demo-data";
import { formatCurrency } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StaggerItem } from "@/components/ui/stagger-container";
import {
    BarChart3,
    PieChart,
    TrendingUp,
    Users,
    DollarSign,
    CheckSquare,
    Download,
    FileText,
    Truck,
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
    { id: "project-summary", title: "Project Summary", description: "Overview of all projects with status, budget, and timeline", icon: FileText, category: "production" },
    { id: "budget-variance", title: "Budget Variance", description: "Planned vs actual spend by project and category", icon: DollarSign, category: "financial" },
    { id: "crew-utilization", title: "Crew Utilization", description: "Hours worked, availability, and labor costs", icon: Users, category: "resources" },
    { id: "vendor-spend", title: "Vendor Spend", description: "Spend analysis by vendor with PO/Invoice matching", icon: Truck, category: "financial" },
    { id: "pipeline-forecast", title: "Pipeline Forecast", description: "Weighted pipeline value by stage and close date", icon: TrendingUp, category: "sales" },
    { id: "task-completion", title: "Task Completion", description: "Task completion rates by project and phase", icon: CheckSquare, category: "production" },
];

const categoryConfig = {
    financial: { label: "Financial", variant: "success" as const },
    production: { label: "Production", variant: "info" as const },
    resources: { label: "Resources", variant: "warning" as const },
    sales: { label: "Sales", variant: "default" as const },
};

export default function ReportsPage() {
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    // Calculate summary stats
    const totalPipelineValue = MOCK_DEALS.reduce((sum, d) => sum + d.value * (d.probability / 100), 0);
    const totalBudget = MOCK_PROJECTS.reduce((sum, p) => sum + p.budgetPlanned, 0);
    const totalActual = MOCK_PROJECTS.reduce((sum, p) => sum + p.budgetActual, 0);
    const completedTasks = MOCK_TASKS.filter((t) => t.status === "done").length;
    const availableCrew = MOCK_CREW.filter((c) => c.status === "available").length;

    const filteredReports = selectedCategory === "all"
        ? REPORTS
        : REPORTS.filter((r) => r.category === selectedCategory);

    return (
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
                        <p className="text-xl font-bold">{formatCurrency(totalPipelineValue)}</p>
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
                        <p className="text-xs text-muted-foreground">{Math.round((totalActual / totalBudget) * 100)}% utilized</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <CheckSquare className="h-4 w-4" />
                            <span className="text-xs">Tasks Completed</span>
                        </div>
                        <p className="text-xl font-bold">{completedTasks}/{MOCK_TASKS.length}</p>
                        <p className="text-xs text-muted-foreground">{Math.round((completedTasks / MOCK_TASKS.length) * 100)}% done</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Users className="h-4 w-4" />
                            <span className="text-xs">Crew Available</span>
                        </div>
                        <p className="text-xl font-bold">{availableCrew}/{MOCK_CREW.length}</p>
                        <p className="text-xs text-muted-foreground">ready to assign</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Truck className="h-4 w-4" />
                            <span className="text-xs">Active Vendors</span>
                        </div>
                        <p className="text-xl font-bold">{MOCK_VENDORS.filter((v) => v.status === "active").length}</p>
                        <p className="text-xs text-muted-foreground">vendors</p>
                    </CardContent>
                </Card>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2">
                <Button
                    variant={selectedCategory === "all" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                >
                    All Reports
                </Button>
                {Object.entries(categoryConfig).map(([key, config]) => (
                    <Button
                        key={key}
                        variant={selectedCategory === key ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setSelectedCategory(key)}
                    >
                        {config.label}
                    </Button>
                ))}
            </div>

            {/* Report Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredReports.map((report, i) => {
                    const Icon = report.icon;
                    const category = categoryConfig[report.category];

                    return (
                        <StaggerItem key={report.id} index={i} stagger="relaxed">
                        <Card
                            className="hover:shadow-md transition-shadow cursor-pointer"
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <Badge variant={category.variant} className="text-[10px]">
                                        {category.label}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <h3 className="font-semibold mb-1">{report.title}</h3>
                                <p className="text-xs text-muted-foreground mb-4">{report.description}</p>
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
                                const count = MOCK_PROJECTS.filter((p) => p.status === status).length;
                                const percentage = Math.round((count / MOCK_PROJECTS.length) * 100);
                                return (
                                    <div key={status} className="flex items-center gap-3">
                                        <div className="w-20 text-xs text-muted-foreground capitalize">{status.replace("_", " ")}</div>
                                        <ProgressBar value={percentage} size="md" className="flex-1" />
                                        <div className="w-12 text-xs text-right">{count} ({percentage}%)</div>
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
                            {["lead", "qualified", "proposal", "negotiation", "won"].map((stage) => {
                                const deals = MOCK_DEALS.filter((d) => d.stage === stage);
                                const value = deals.reduce((sum, d) => sum + d.value, 0);
                                const maxValue = Math.max(...["lead", "qualified", "proposal", "negotiation", "won"].map((s) =>
                                    MOCK_DEALS.filter((d) => d.stage === s).reduce((sum, d) => sum + d.value, 0)
                                ));
                                const percentage = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;
                                return (
                                    <div key={stage} className="flex items-center gap-3">
                                        <div className="w-20 text-xs text-muted-foreground capitalize">{stage}</div>
                                        <ProgressBar value={percentage} size="md" />
                                        <div className="w-20 text-xs text-right">{formatCurrency(value)}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageShell>
    );
}
