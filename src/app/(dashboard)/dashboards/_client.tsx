"use client";

import { CreateEntityDialog, useCreateAction } from "@/components/app/create-entity-dialog";
import { CREATE_DASHBOARD_CONFIG } from "@/config/create-entity-configs";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { useQuery } from "@tanstack/react-query";
import { TabBar } from "@/components/ui/tab-bar";
import {
    Activity,
    Clock,
    DollarSign,
    Plus,
    Target,
    TrendingDown,
    TrendingUp,
    Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCompactCurrency } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/progress-bar";
import { OperationalDashboardShell } from "@/components/shells";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";
import { useCreateDashboard } from "@/lib/supabase/hooks-automation";
import { useMemo } from "react";

interface DashboardsData {
    projects: Array<Record<string, unknown>>;
    deals: Array<Record<string, unknown>>;
    tasks: Array<Record<string, unknown>>;
    crew: Array<Record<string, unknown>>;
    approvals: Array<Record<string, unknown>>;
    activities: Array<Record<string, unknown>>;
}

interface DashboardWidget {
    id: string;
    title: string;
    type: "number" | "chart" | "list" | "progress";
    value: string | number;
    change?: number | undefined;
    changeLabel?: string | undefined;
    data?: unknown | undefined;
}

function useDashboardsData() {
    return useQuery<DashboardsData>({
        queryKey: ["dashboards-bff"],
        queryFn: async () => {
            const res = await fetch("/api/dashboards");
            if (!res.ok) throw new Error(`Dashboards BFF failed: ${res.status}`);
            return res.json();
        },
        staleTime: 30_000,
    });
}

export function DashboardsPageClient() {
    const createDashboard = useCreateDashboard();
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const DASHBOARD_TABS = ["overview", "projects", "sales", "resources"] as const;
    const [selectedDashboard, setSelectedDashboard] = useQueryTabState({
        key: "tab",
        defaultValue: "overview",
        validValues: DASHBOARD_TABS,
    });

    const { data, isLoading: loadingData } = useDashboardsData();

    const projects = useMemo(
        () => (data?.projects ?? []) as Array<Record<string, unknown>>,
        [data?.projects]
    );
    const deals = useMemo(
        () => (data?.deals ?? []) as Array<Record<string, unknown>>,
        [data?.deals]
    );
    const tasks = useMemo(
        () => (data?.tasks ?? []) as Array<Record<string, unknown>>,
        [data?.tasks]
    );
    const crew = useMemo(() => (data?.crew ?? []) as Array<Record<string, unknown>>, [data?.crew]);

    const activeProjects = useMemo(
        () => projects.filter((p) => p.status === "active" || p.status === "in_progress"),
        [projects]
    );
    const overdueTasks = useMemo(
        () =>
            tasks.filter((t) => {
                const due = t.due_date as string | null;
                return (
                    due &&
                    new Date(due) < new Date() &&
                    t.status !== "done" &&
                    t.status !== "completed"
                );
            }),
        [tasks]
    );
    const totalRevenue = useMemo(
        () => projects.reduce((sum, p) => sum + Number(p.budget_planned ?? 0), 0),
        [projects]
    );
    const pipelineValue = useMemo(
        () => deals.reduce((sum, d) => sum + Number(d.value ?? 0), 0),
        [deals]
    );
    const pendingApprovals = useMemo(
        () =>
            (data?.approvals ?? []).filter((a: Record<string, unknown>) => a.status === "pending")
                .length,
        [data?.approvals]
    );
    const crewUtilization = useMemo(() => {
        const assigned = crew.filter((c) => c.status === "assigned").length;
        return crew.length > 0 ? Math.round((assigned / crew.length) * 100) : 0;
    }, [crew]);

    const widgets: DashboardWidget[] = useMemo(
        () => [
            {
                id: "1",
                title: "Total Revenue",
                type: "number",
                value: formatCompactCurrency(totalRevenue),
            },
            { id: "2", title: "Active Projects", type: "number", value: activeProjects.length },
            { id: "3", title: "Team Utilization", type: "number", value: `${crewUtilization}%` },
            { id: "4", title: "Pending Approvals", type: "number", value: pendingApprovals },
            {
                id: "5",
                title: "Pipeline Value",
                type: "number",
                value: formatCompactCurrency(pipelineValue),
            },
            { id: "6", title: "Overdue Tasks", type: "number", value: overdueTasks.length },
        ],
        [
            totalRevenue,
            activeProjects.length,
            crewUtilization,
            pendingApprovals,
            pipelineValue,
            overdueTasks.length,
        ]
    );

    const projectProfitability = useMemo(
        () =>
            projects.slice(0, 4).map((p) => {
                const revenue = Number(p.budget_planned ?? 0);
                const cost = Number(p.budget_actual ?? 0);
                const margin = revenue > 0 ? Math.round(((revenue - cost) / revenue) * 100) : 0;
                return { name: String(p.name ?? ""), revenue, cost, margin };
            }),
        [projects]
    );

    const utilizationByDepartment = useMemo(() => {
        const deptMap = new Map<string, { count: number; assigned: number }>();
        for (const c of crew) {
            const dept = String(c.department ?? "General");
            const entry = deptMap.get(dept) ?? { count: 0, assigned: 0 };
            entry.count++;
            if (c.status === "assigned") entry.assigned++;
            deptMap.set(dept, entry);
        }
        return Array.from(deptMap.entries()).map(([department, stats]) => ({
            department,
            utilization: stats.count > 0 ? Math.round((stats.assigned / stats.count) * 100) : 0,
            headcount: stats.count,
        }));
    }, [crew]);

    const pipelineStages = useMemo(() => {
        const stageMap = new Map<string, { count: number; value: number }>();
        for (const d of deals) {
            const stage = String(d.stage ?? "unknown");
            const entry = stageMap.get(stage) ?? { count: 0, value: 0 };
            entry.count++;
            entry.value += Number(d.value ?? 0);
            stageMap.set(stage, entry);
        }
        return Array.from(stageMap.entries()).map(([stage, stats]) => ({
            stage,
            count: stats.count,
            value: stats.value,
        }));
    }, [deals]);

    const recentActivities: Array<{ action: string; project: string; time: string; type: string }> =
        useMemo(() => {
            const acts = (data?.activities ?? []) as Array<Record<string, unknown>>;
            const now = new Date();
            return acts.slice(0, 5).map((a) => {
                const createdAt = a.created_at as string | null;
                let time = "";
                if (createdAt) {
                    const diff = now.getTime() - new Date(createdAt).getTime();
                    const hours = Math.floor(diff / 3600000);
                    time =
                        hours < 1
                            ? "Just now"
                            : hours < 24
                              ? `${hours}h ago`
                              : `${Math.floor(hours / 24)}d ago`;
                }
                return {
                    action: String(a.title ?? a.activity_type ?? "Activity"),
                    project: String(a.description ?? ""),
                    time,
                    type: "info",
                };
            });
        }, [data?.activities]);

    const contentSlot = (
        <>
            {/* Dashboard Tabs */}
            <TabBar
                items={[
                    { id: "overview", label: "Overview" },
                    { id: "projects", label: "Projects" },
                    { id: "sales", label: "Sales" },
                    { id: "resources", label: "Resources" },
                ]}
                value={selectedDashboard}
                onValueChange={(v) => setSelectedDashboard(v as (typeof DASHBOARD_TABS)[number])}
                ariaLabel="Dashboard sections"
            />

            {/* KPI Cards */}
            <div className="grid density-gap-card md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {widgets.map((widget) => (
                    <Card key={widget.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {widget.title}
                            </CardTitle>
                            {widget.change !== undefined && widget.change > 0 ? (
                                <TrendingUp className="h-4 w-4 text-success" />
                            ) : widget.change !== undefined && widget.change < 0 ? (
                                <TrendingDown className="h-4 w-4 text-destructive" />
                            ) : (
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{widget.value}</div>
                            {widget.change !== undefined && (
                                <p
                                    className={cn(
                                        "text-xs",
                                        widget.change > 0
                                            ? "text-success"
                                            : widget.change < 0
                                              ? "text-destructive"
                                              : "text-muted-foreground"
                                    )}
                                >
                                    {widget.change > 0 ? "+" : ""}
                                    {widget.change}% {widget.changeLabel}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Dashboard Content */}
            <div className="grid density-gap-card lg:grid-cols-2">
                {/* Project Profitability */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Project Profitability
                        </CardTitle>
                        <CardDescription>Revenue, costs, and margins by project</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="density-gap-section">
                            {projectProfitability.map((project) => (
                                <div key={project.name} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm">{project.name}</span>
                                        <Badge
                                            variant={project.margin >= 30 ? "default" : "secondary"}
                                        >
                                            {project.margin}% margin
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ProgressBar
                                            value={(project.cost / project.revenue) * 100}
                                            size="md"
                                        />
                                        <span className="text-xs text-muted-foreground w-20 text-right">
                                            {formatCompactCurrency(project.revenue)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Team Utilization */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Team Utilization
                        </CardTitle>
                        <CardDescription>Capacity by department</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="density-gap-section">
                            {utilizationByDepartment.map((dept) => (
                                <div key={dept.department} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm">
                                            {dept.department}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {dept.headcount} people
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ProgressBar
                                            value={dept.utilization}
                                            size="md"
                                            className="flex-1"
                                        />
                                        <span
                                            className={cn(
                                                "text-sm font-medium w-12 text-right",
                                                dept.utilization >= 90
                                                    ? "text-destructive"
                                                    : dept.utilization >= 75
                                                      ? "text-warning"
                                                      : "text-success"
                                            )}
                                        >
                                            {dept.utilization}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Sales Pipeline */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Sales Pipeline
                        </CardTitle>
                        <CardDescription>Deals by stage</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="density-gap-section">
                            {pipelineStages.map((stage, index) => (
                                <div key={stage.stage} className="flex items-center gap-4">
                                    <div className="w-24 text-sm font-medium">{stage.stage}</div>
                                    <div className="flex-1">
                                        <div
                                            className="h-8 bg-info rounded flex items-center justify-end px-2"
                                            style={{
                                                width: `${(stage.value / Math.max(...pipelineStages.map((s) => s.value))) * 100}%`,
                                                opacity: 1 - index * 0.15,
                                            }}
                                        >
                                            <span className="text-xs text-primary-foreground font-medium">
                                                {stage.count} deals
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-20 text-right text-sm font-medium">
                                        {formatCompactCurrency(stage.value)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Pipeline</span>
                            <span className="font-bold">
                                {formatCompactCurrency(
                                    pipelineStages.reduce((sum, s) => sum + s.value, 0)
                                )}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Recent Activity
                        </CardTitle>
                        <CardDescription>Latest updates across projects</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="density-gap-section">
                            {recentActivities.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No recent activity</p>
                            ) : (
                                recentActivities.map((activity, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div
                                            className={cn(
                                                "h-2 w-2 rounded-full mt-2",
                                                activity.type === "success"
                                                    ? "bg-success"
                                                    : activity.type === "warning"
                                                      ? "bg-warning"
                                                      : "bg-info"
                                            )}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium">{activity.action}</p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {activity.project}
                                            </p>
                                        </div>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {activity.time}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <CreateEntityDialog
                config={CREATE_DASHBOARD_CONFIG}
                open={createOpen}
                onClose={closeCreate}
                onSubmit={async (values) => {
                    await createDashboard.mutateAsync(
                        values as Parameters<typeof createDashboard.mutateAsync>[0]
                    );
                }}
            />
        </>
    );

    const config: DashboardPageConfig = {
        resource: "dashboards",
        action: "read",
        title: "Dashboards",
        description: "Real-time insights into your business performance",
        headerActions: (
            <div className="flex items-center gap-2">
                <Button variant="outline">Edit Dashboard</Button>
                <Button onClick={openCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Dashboard
                </Button>
            </div>
        ),
        contentSlot,
    };

    return <OperationalDashboardShell config={config} isLoading={loadingData} />;
}
