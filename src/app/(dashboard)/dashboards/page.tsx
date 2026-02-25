"use client";

import { useState } from "react";
import {
    Plus,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    Clock,
    Target,
    Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { cn, formatCompactCurrency } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/progress-bar";

interface DashboardWidget {
    id: string;
    title: string;
    type: "number" | "chart" | "list" | "progress";
    value: string | number;
    change?: number;
    changeLabel?: string;
    data?: unknown;
}

const mockWidgets: DashboardWidget[] = [
    { id: "1", title: "Total Revenue", type: "number", value: "$2.4M", change: 12.5, changeLabel: "vs last month" },
    { id: "2", title: "Active Projects", type: "number", value: 24, change: 3, changeLabel: "new this month" },
    { id: "3", title: "Team Utilization", type: "number", value: "78%", change: -2.3, changeLabel: "vs last week" },
    { id: "4", title: "Open Proposals", type: "number", value: 8, change: 2, changeLabel: "pending response" },
    { id: "5", title: "Pipeline Value", type: "number", value: "$1.8M", change: 15, changeLabel: "weighted" },
    { id: "6", title: "Overdue Tasks", type: "number", value: 12, change: -5, changeLabel: "resolved this week" },
];

const projectProfitability = [
    { name: "Nike Air Max Launch", revenue: 485000, cost: 320000, margin: 34 },
    { name: "Red Bull Festival", revenue: 320000, cost: 245000, margin: 23 },
    { name: "Coachella Experience", revenue: 750000, cost: 520000, margin: 31 },
    { name: "TechStart Launch", revenue: 125000, cost: 95000, margin: 24 },
];

const utilizationByDepartment = [
    { department: "Production", utilization: 85, headcount: 12 },
    { department: "Technical", utilization: 92, headcount: 8 },
    { department: "Fabrication", utilization: 78, headcount: 15 },
    { department: "Logistics", utilization: 65, headcount: 6 },
    { department: "Scenic", utilization: 88, headcount: 10 },
];

const pipelineStages = [
    { stage: "Lead", count: 5, value: 450000 },
    { stage: "Qualified", count: 3, value: 680000 },
    { stage: "Proposal", count: 4, value: 920000 },
    { stage: "Negotiation", count: 2, value: 350000 },
];


export default function DashboardsPage() {
    const [selectedDashboard, setSelectedDashboard] = useState("overview");

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboards</h1>
                    <p className="text-muted-foreground">
                        Real-time insights into your business performance
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        Edit Dashboard
                    </Button>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Dashboard
                    </Button>
                </div>
            </div>

            {/* Dashboard Tabs */}
            <div className="flex gap-2 border-b pb-2">
                {["overview", "projects", "sales", "resources"].map((tab) => (
                    <Button
                        key={tab}
                        variant={selectedDashboard === tab ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setSelectedDashboard(tab)}
                        className="capitalize"
                    >
                        {tab}
                    </Button>
                ))}
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {mockWidgets.map((widget) => (
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
                                <p className={cn(
                                    "text-xs",
                                    widget.change > 0 ? "text-success" : widget.change < 0 ? "text-destructive" : "text-muted-foreground"
                                )}>
                                    {widget.change > 0 ? "+" : ""}{widget.change}% {widget.changeLabel}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Dashboard Content */}
            <div className="grid gap-6 lg:grid-cols-2">
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
                        <div className="space-y-4">
                            {projectProfitability.map((project) => (
                                <div key={project.name} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm">{project.name}</span>
                                        <Badge variant={project.margin >= 30 ? "default" : "secondary"}>
                                            {project.margin}% margin
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ProgressBar value={(project.cost / project.revenue) * 100} size="md" />
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
                        <div className="space-y-4">
                            {utilizationByDepartment.map((dept) => (
                                <div key={dept.department} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm">{dept.department}</span>
                                        <span className="text-sm text-muted-foreground">
                                            {dept.headcount} people
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ProgressBar value={dept.utilization} size="md" className="flex-1" />
                                        <span className={cn(
                                            "text-sm font-medium w-12 text-right",
                                            dept.utilization >= 90 ? "text-destructive" :
                                            dept.utilization >= 75 ? "text-warning" : "text-success"
                                        )}>
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
                        <div className="space-y-4">
                            {pipelineStages.map((stage, index) => (
                                <div key={stage.stage} className="flex items-center gap-4">
                                    <div className="w-24 text-sm font-medium">{stage.stage}</div>
                                    <div className="flex-1">
                                        <div 
                                            className="h-8 bg-info rounded flex items-center justify-end px-2"
                                            style={{ 
                                                width: `${(stage.value / Math.max(...pipelineStages.map(s => s.value))) * 100}%`,
                                                opacity: 1 - (index * 0.15)
                                            }}
                                        >
                                            <span className="text-xs text-white font-medium">
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
                                {formatCompactCurrency(pipelineStages.reduce((sum, s) => sum + s.value, 0))}
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
                        <div className="space-y-4">
                            {[
                                { action: "Proposal accepted", project: "Nike Air Max Launch", time: "2 hours ago", type: "success" },
                                { action: "Task completed", project: "Red Bull Festival", time: "4 hours ago", type: "info" },
                                { action: "Budget warning", project: "Coachella Experience", time: "6 hours ago", type: "warning" },
                                { action: "New comment", project: "TechStart Launch", time: "8 hours ago", type: "info" },
                                { action: "Milestone approved", project: "Nike Air Max Launch", time: "1 day ago", type: "success" },
                            ].map((activity, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className={cn(
                                        "h-2 w-2 rounded-full mt-2",
                                        activity.type === "success" ? "bg-success" :
                                        activity.type === "warning" ? "bg-warning" : "bg-info"
                                    )} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">{activity.action}</p>
                                        <p className="text-xs text-muted-foreground truncate">{activity.project}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {activity.time}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
