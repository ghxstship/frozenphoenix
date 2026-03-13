"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    useApprovals,
    useCrewMembers,
    useDeals,
    useMyTaskCounts,
    useMyTasks,
    useNotifications,
    useProjects,
} from "@/lib/supabase/hooks";
import { useMyDocuments } from "@/lib/supabase/hooks-pages";
import { TaskRow } from "@/components/home/task-row";
import { DOCUMENT_TYPE_MAP } from "@/config/domain-config";
import type { DocumentType, TaskPriority, TaskStatus } from "@/types";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { StaggerContainer, StaggerItem } from "@/components/ui/stagger-container";
import { ProgressBar } from "@/components/ui/progress-bar";
import { OnboardingChecklist } from "@/components/onboarding/onboarding-checklist";
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    DollarSign,
    FileText,
    FolderKanban,
    TrendingUp,
    Users,
} from "lucide-react";
import Link from "next/link";
import { PermissionGate } from "@/components/permission-guard";

export default function DashboardPage() {
    const { data: sbProjects, isLoading: loadingProjects } = useProjects();
    const { data: sbDeals, isLoading: loadingDeals } = useDeals();
    const { data: sbNotifications } = useNotifications();
    const { data: sbApprovals } = useApprovals();
    const { data: sbCrew } = useCrewMembers();
    const { data: myTasks } = useMyTasks();
    const { data: myTaskCounts } = useMyTaskCounts();
    const { data: myDocs } = useMyDocuments();

    const isLoading = loadingProjects || loadingDeals;

    // Transform Supabase data or fall back to mock data
    const projects = (sbProjects ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        client: p.client,
        clientLogo: p.client_logo,
        status: p.status,
        currentPhase: p.current_phase,
        startDate: p.start_date,
        endDate: p.end_date,
        budgetPlanned: p.budget_planned,
        budgetActual: p.budget_actual,
        progress: p.progress,
        managerId: p.manager_id ?? "",
        teamIds:
            (p as { project_members?: { profile_id: string }[] }).project_members?.map(
                (m: { profile_id: string }) => m.profile_id
            ) || [],
        createdAt: p.created_at ?? new Date().toISOString(),
    }));

    const deals = (sbDeals ?? []).map((d) => ({
        id: d.id,
        title: d.title,
        company: d.company,
        contactName: d.contact_name,
        contactEmail: d.contact_email,
        value: d.value,
        stage: d.stage,
        probability: d.probability,
        expectedCloseDate: d.expected_close_date,
        assignedTo: d.assigned_to,
        notes: d.notes,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
    }));

    const notifications = (sbNotifications ?? []).map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        read: n.read,
        actionUrl: n.action_url,
        createdAt: n.created_at,
    }));

    const approvals = (sbApprovals ?? []).map((a) => ({
        id: a.id,
        projectId: a.project_id,
        milestoneId: a.milestone_id,
        milestoneName: a.milestone_name,
        status: a.status,
        requestedAt: a.requested_at,
        deadline: a.deadline,
        approvedAt: a.approved_at,
        approverName: (a as { profiles?: { name: string } }).profiles?.name || "",
        deliverableUrl: a.deliverable_url,
        timelineImpactDays: a.timeline_impact_days,
    }));

    const activeProjects = projects.filter((p) => p.status === "active");
    const pipelineValue = deals
        .filter((d) => !["won", "lost"].includes(d.stage))
        .reduce((sum, d) => sum + d.value, 0);
    const wonValue = deals.filter((d) => d.stage === "won").reduce((sum, d) => sum + d.value, 0);
    const overdueApprovals = approvals.filter((a) => a.status === "overdue");

    if (isLoading) {
        return <LoadingState />;
    }

    return (
        <PermissionGate resource="dashboard" action="read">
            <div className="space-y-6 animate-fade-in">
                <OnboardingChecklist />
                <PageHeader
                    title="Command Center"
                    description="Real-time overview of your production ecosystem"
                />

                {/* KPI Row */}
                <StaggerContainer
                    stagger="tight"
                    animation="slide-up"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    <StatCard
                        title="Pipeline Value"
                        value={formatCurrency(pipelineValue)}
                        change={12}
                        description="vs last quarter"
                        icon={TrendingUp}
                    />
                    <StatCard
                        title="Revenue Won"
                        value={formatCurrency(wonValue)}
                        change={8}
                        description="this quarter"
                        icon={DollarSign}
                    />
                    <StatCard
                        title="Active Projects"
                        value={activeProjects.length}
                        change={2}
                        changeSuffix=""
                        description="new this month"
                        icon={FolderKanban}
                    />
                    <StatCard
                        title="Active Crew"
                        value={
                            (sbCrew ?? []).filter(
                                (c) => c.status === "active" || c.status === "on_project"
                            ).length
                        }
                        change={-1}
                        changeSuffix=""
                        description="vs last week"
                        icon={Users}
                    />
                </StaggerContainer>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Active Projects */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Active Productions</CardTitle>
                                    <Link
                                        href="/projects"
                                        className="text-xs text-primary hover:underline flex items-center gap-1"
                                    >
                                        View all <ArrowRight className="h-3 w-3" />
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {activeProjects.map((project, i) => (
                                    <StaggerItem key={project.id} index={i} stagger="relaxed">
                                        <div className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold truncate">
                                                        {project.name}
                                                    </p>
                                                    <Badge
                                                        variant={
                                                            project.status === "active"
                                                                ? "success"
                                                                : "ghost"
                                                        }
                                                        className="text-[10px]"
                                                    >
                                                        {project.currentPhase.replace("_", " ")}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {project.client}
                                                </p>
                                            </div>
                                            {/* Progress bar */}
                                            <div className="w-32 flex items-center gap-2">
                                                <ProgressBar
                                                    value={project.progress}
                                                    size="xs"
                                                    className="flex-1"
                                                />
                                                <span className="text-xs font-medium text-muted-foreground w-8 text-right">
                                                    {project.progress}%
                                                </span>
                                            </div>
                                            {/* Budget */}
                                            <div className="text-right hidden sm:block">
                                                <p className="text-xs font-medium">
                                                    {formatCurrency(project.budgetActual)}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    of {formatCurrency(project.budgetPlanned)}
                                                </p>
                                            </div>
                                        </div>
                                    </StaggerItem>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Overdue Approvals */}
                        {overdueApprovals.length > 0 && (
                            <Card className="border-warning/30 bg-warning/5">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-warning" />
                                        <CardTitle className="text-base">
                                            Overdue Approvals
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {overdueApprovals.map((approval) => (
                                        <div
                                            key={approval.id}
                                            className="p-2 rounded-lg bg-background/60"
                                        >
                                            <p className="text-xs font-medium">
                                                {approval.milestoneName}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                                {approval.timelineImpactDays && (
                                                    <span className="text-destructive font-medium">
                                                        +{approval.timelineImpactDays}d impact
                                                    </span>
                                                )}
                                                {" · "}
                                                {approval.approverName}
                                            </p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* My Tasks Widget */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">
                                        My Tasks
                                        {(myTaskCounts?.overdue ?? 0) > 0 && (
                                            <Badge
                                                variant="destructive"
                                                className="ml-2 text-[9px]"
                                            >
                                                {myTaskCounts?.overdue} overdue
                                            </Badge>
                                        )}
                                    </CardTitle>
                                    <Link
                                        href="/home/tasks"
                                        className="text-xs text-primary hover:underline flex items-center gap-1"
                                    >
                                        View all <ArrowRight className="h-3 w-3" />
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-0.5">
                                {(myTasks ?? []).slice(0, 5).map((t) => (
                                    <TaskRow
                                        key={t.id}
                                        task={{
                                            id: t.id,
                                            title: t.title,
                                            status: t.status as TaskStatus,
                                            priority: t.priority as TaskPriority,
                                            dueDate: t.due_date,
                                            projectName: t.projects?.name ?? null,
                                        }}
                                    />
                                ))}
                                {(myTasks ?? []).length === 0 && (
                                    <p className="text-xs text-muted-foreground py-4 text-center">
                                        No tasks assigned
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Documents Widget */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">Recent Documents</CardTitle>
                                    <Link
                                        href="/home/documents"
                                        className="text-xs text-primary hover:underline flex items-center gap-1"
                                    >
                                        View all <ArrowRight className="h-3 w-3" />
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {(myDocs ?? []).slice(0, 4).map((d: Record<string, unknown>) => (
                                    <Link
                                        key={d.id as string}
                                        href={`/documents/${d.id as string}`}
                                        className="flex items-start gap-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                                    >
                                        <FileText className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate">
                                                {(d.title as string) ?? "Untitled"}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {DOCUMENT_TYPE_MAP[
                                                    ((d.document_type as string) ??
                                                        "doc") as DocumentType
                                                ]?.label ?? "Document"}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                                {(myDocs ?? []).length === 0 && (
                                    <p className="text-xs text-muted-foreground py-4 text-center">
                                        No documents found
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {notifications.slice(0, 4).map((notif) => (
                                    <div key={notif.id} className="flex items-start gap-2 p-2">
                                        <CheckCircle2
                                            className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${
                                                notif.type === "success"
                                                    ? "text-success"
                                                    : notif.type === "warning"
                                                      ? "text-warning"
                                                      : notif.type === "error"
                                                        ? "text-destructive"
                                                        : "text-info"
                                            }`}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate">
                                                {notif.title}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {formatRelativeTime(
                                                    notif.createdAt ?? new Date().toISOString()
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PermissionGate>
    );
}
