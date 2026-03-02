"use client";

import { logger } from "@/lib/logger";
import React, { useState } from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { useParams, useRouter } from "next/navigation";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PriorityBadge, StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/layouts/empty-state";
import { RecordChatter } from "@/components/activity";
import type { ActivityItem } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { MOCK_APPROVALS, MOCK_PROJECTS, MOCK_STAKEHOLDERS, MOCK_TASKS } from "@/lib/demo-data";
import { PROJECT_PHASE_MAP } from "@/config/domain-config";
import {
    isSupabaseConfigured,
    useCreateTask,
    useDeleteProject,
    useUpdateProject,
} from "@/lib/supabase/hooks";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
    AlertTriangle,
    CheckSquare,
    Clock,
    DollarSign,
    Edit,
    FolderKanban,
    Loader2,
    TrendingUp,
    Users,
} from "lucide-react";

type TabId = "overview" | "tasks" | "team" | "budget" | "approvals" | "chatter";
const TAB_VALUES = ["overview", "tasks", "team", "budget", "approvals", "chatter"] as const;

const MOCK_ACTIVITY: ActivityItem[] = [
    {
        id: "a1",
        action: "created",
        actorName: "Sarah Chen",
        entityType: "project",
        entityName: "this project",
        createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
    {
        id: "a2",
        action: "assigned",
        actorName: "Sarah Chen",
        entityType: "team",
        entityName: "Mike Johnson",
        description: "Added as Production Lead",
        createdAt: new Date(Date.now() - 13 * 86400000).toISOString(),
    },
    {
        id: "a3",
        action: "status_changed",
        actorName: "Mike Johnson",
        entityType: "project",
        description: "Status changed from Draft to Active",
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
    {
        id: "a4",
        action: "commented",
        actorName: "Alex Rivera",
        entityType: "project",
        description: "Budget looks tight — can we revisit vendor quotes?",
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
        id: "a5",
        action: "updated",
        actorName: "Sarah Chen",
        entityType: "budget",
        description: "Budget increased by $15,000",
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
        id: "a6",
        action: "approved",
        actorName: "Jordan Lee",
        entityType: "milestone",
        entityName: "Design Sign-Off",
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
];

const MOCK_COMMENTS: CommentItem[] = [
    {
        id: "c1",
        authorId: "u2",
        authorName: "Mike Johnson",
        content:
            "Kickoff meeting went well. Client confirmed the creative direction — we're good to proceed with fabrication specs.",
        createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    },
    {
        id: "c2",
        authorId: "u3",
        authorName: "Alex Rivera",
        content:
            "Budget looks tight for the AV package. Can we revisit the vendor quotes before committing?",
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
        id: "c3",
        authorId: "u1",
        authorName: "Sarah Chen",
        content:
            "Good call Alex — I've renegotiated with the AV vendor and added $15k buffer. Updated the budget tab.",
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
        id: "c4",
        authorId: "u4",
        authorName: "Jordan Lee",
        content:
            "Design sign-off is approved. Moving to fabrication phase. @Mike please update the schedule.",
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
];

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "overview",
        validValues: TAB_VALUES,
    });
    const [addTaskOpen, setAddTaskOpen] = useState(false);
    const [taskTitle, setTaskTitle] = useState("");
    const [chatterComments, setChatterComments] = useState<CommentItem[]>(MOCK_COMMENTS);
    const updateProject = useUpdateProject();
    const deleteProject = useDeleteProject();
    const createTask = useCreateTask();

    const project = MOCK_PROJECTS.find((p) => p.id === projectId);

    const handleArchive = async () => {
        if (!isSupabaseConfigured) return;
        try {
            await updateProject.mutateAsync({
                id: projectId,
                status: "completed",
            } as unknown as Parameters<typeof updateProject.mutateAsync>[0]);
        } catch (error) {
            logger.error("Failed to archive project", { error });
        }
    };

    const handleDelete = async () => {
        if (!isSupabaseConfigured) return;
        try {
            await deleteProject.mutateAsync(projectId);
            router.push("/projects");
        } catch (error) {
            logger.error("Failed to delete project", { error });
        }
    };

    const handleAddTask = async () => {
        if (!taskTitle.trim() || !isSupabaseConfigured) return;
        try {
            await createTask.mutateAsync({
                project_id: projectId,
                title: taskTitle,
                status: "todo",
                priority: "medium",
                phase: "pre_production",
            } as unknown as Parameters<typeof createTask.mutateAsync>[0]);
            setAddTaskOpen(false);
            setTaskTitle("");
        } catch (error) {
            logger.error("Failed to add task", { error });
        }
    };
    const projectTasks = MOCK_TASKS.filter((t) => t.projectId === projectId);
    const projectApprovals = MOCK_APPROVALS.filter((a) => a.projectId === projectId);
    const projectStakeholders = MOCK_STAKEHOLDERS.filter((s) => s.projectIds.includes(projectId));

    if (!project) {
        return (
            <EmptyState
                icon={FolderKanban}
                title="Project not found"
                description="The project you're looking for doesn't exist or has been deleted."
                action={{ label: "Back to Projects", onClick: () => router.push("/projects") }}
            />
        );
    }

    const phaseConfig = PROJECT_PHASE_MAP[project.currentPhase];
    const budgetUtilization =
        project.budgetPlanned > 0
            ? Math.round((project.budgetActual / project.budgetPlanned) * 100)
            : 0;
    const pendingApprovals = projectApprovals.filter(
        (a) => a.status === "pending" || a.status === "overdue"
    );
    const completedTasks = projectTasks.filter((t) => t.status === "done").length;

    const handleAddComment = async (content: string) => {
        const newComment: CommentItem = {
            id: `c-${Date.now()}`,
            authorId: "u1",
            authorName: "Sarah Chen",
            content,
            createdAt: new Date().toISOString(),
        };
        setChatterComments((prev) => [...prev, newComment]);
    };

    const tabs = [
        { id: "overview" as const, label: "Overview" },
        { id: "tasks" as const, label: "Tasks", count: projectTasks.length },
        { id: "team" as const, label: "Team", count: projectStakeholders.length },
        { id: "budget" as const, label: "Budget" },
        { id: "approvals" as const, label: "Approvals", count: pendingApprovals.length },
        { id: "chatter" as const, label: "Chatter", count: chatterComments.length },
    ];

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Client</span>
                        <span className="font-medium">{project.client}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Phase</span>
                        <Badge variant={phaseConfig.variant}>{phaseConfig.label}</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Start Date</span>
                        <span>{formatDate(project.startDate)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">End Date</span>
                        <span>{formatDate(project.endDate)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                    </div>
                </CardContent>
            </Card>

            {pendingApprovals.length > 0 && (
                <Card className="border-warning/50 bg-warning/5">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-warning mb-2">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm font-medium">Pending Approvals</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {pendingApprovals.length} approval
                            {pendingApprovals.length > 1 ? "s" : ""} waiting
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    return (
        <>
            <DetailLayout
                backHref="/projects"
                backLabel="Projects"
                title={project.name}
                subtitle={project.client}
                status={project.status}
                avatar={
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-primary-foreground">
                        {project.name.charAt(0)}
                    </div>
                }
                actions={
                    <Button onClick={() => router.push(`/projects/${projectId}/edit`)}>
                        <Edit className="h-4 w-4" />
                        Edit
                    </Button>
                }
                menuItems={[
                    { label: "Duplicate Project", onClick: () => {} },
                    {
                        label: updateProject.isPending ? "Archiving..." : "Archive Project",
                        onClick: handleArchive,
                    },
                    {
                        label: deleteProject.isPending ? "Deleting..." : "Delete Project",
                        onClick: handleDelete,
                        variant: "destructive",
                    },
                ]}
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={(id) => setActiveTab(id as TabId)}
                sidebar={sidebar}
            >
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <DollarSign className="h-4 w-4" />
                                        <span className="text-xs">Budget</span>
                                    </div>
                                    <p className="text-xl font-bold">
                                        {formatCurrency(project.budgetPlanned)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {budgetUtilization}% utilized
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <CheckSquare className="h-4 w-4" />
                                        <span className="text-xs">Tasks</span>
                                    </div>
                                    <p className="text-xl font-bold">
                                        {completedTasks}/{projectTasks.length}
                                    </p>
                                    <p className="text-xs text-muted-foreground">completed</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <Users className="h-4 w-4" />
                                        <span className="text-xs">Team</span>
                                    </div>
                                    <p className="text-xl font-bold">
                                        {projectStakeholders.length}
                                    </p>
                                    <p className="text-xs text-muted-foreground">members</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <TrendingUp className="h-4 w-4" />
                                        <span className="text-xs">Progress</span>
                                    </div>
                                    <p className="text-xl font-bold">{project.progress}%</p>
                                    <ProgressBar value={project.progress} size="sm" />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Tasks */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Recent Tasks</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {projectTasks.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No tasks yet
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {projectTasks.slice(0, 5).map((task) => (
                                            <div
                                                key={task.id}
                                                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {task.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {task.dueDate &&
                                                            `Due ${formatDate(task.dueDate)}`}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <PriorityBadge
                                                        priority={task.priority}
                                                        className="text-[10px]"
                                                    />
                                                    <StatusBadge
                                                        status={task.status}
                                                        className="text-[10px]"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === "tasks" && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">All Tasks</CardTitle>
                            <Button size="sm" onClick={() => setAddTaskOpen(true)}>
                                Add Task
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {projectTasks.length === 0 ? (
                                <EmptyState
                                    icon={CheckSquare}
                                    title="No tasks"
                                    description="Create your first task for this project"
                                    action={{
                                        label: "Add Task",
                                        onClick: () => setAddTaskOpen(true),
                                    }}
                                />
                            ) : (
                                <div className="space-y-2">
                                    {projectTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`h-2 w-2 rounded-full ${task.status === "done" ? "bg-success" : task.status === "in_progress" ? "bg-info" : "bg-muted-foreground"}`}
                                                />
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {task.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {PROJECT_PHASE_MAP[task.phase]?.label}
                                                        {task.dueDate &&
                                                            ` · Due ${formatDate(task.dueDate)}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <PriorityBadge
                                                    priority={task.priority}
                                                    className="text-[10px]"
                                                />
                                                <StatusBadge
                                                    status={task.status}
                                                    className="text-[10px]"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {activeTab === "team" && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Team Members</CardTitle>
                            <Button size="sm">Add Member</Button>
                        </CardHeader>
                        <CardContent>
                            {projectStakeholders.length === 0 ? (
                                <EmptyState
                                    icon={Users}
                                    title="No team members"
                                    description="Add team members to this project"
                                    action={{
                                        label: "Add Member",
                                        onClick: () => {} /* TODO: wire add member dialog */,
                                    }}
                                />
                            ) : (
                                <div className="space-y-3">
                                    {projectStakeholders.map((person) => (
                                        <div
                                            key={person.id}
                                            className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                                                    {person.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {person.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {person.role}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge
                                                variant={
                                                    person.type === "internal"
                                                        ? "default"
                                                        : person.type === "client"
                                                          ? "warning"
                                                          : "secondary"
                                                }
                                            >
                                                {person.type}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {activeTab === "budget" && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <StatCard
                                title="Planned Budget"
                                value={formatCurrency(project.budgetPlanned)}
                            />
                            <StatCard
                                title="Actual Spend"
                                value={formatCurrency(project.budgetActual)}
                            />
                            <StatCard
                                title="Remaining"
                                value={formatCurrency(project.budgetPlanned - project.budgetActual)}
                            />
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Budget Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    Budget line items will be displayed here when connected to
                                    Supabase
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === "approvals" && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Approvals</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {projectApprovals.length === 0 ? (
                                <EmptyState
                                    icon={Clock}
                                    title="No approvals"
                                    description="No approval milestones for this project yet"
                                />
                            ) : (
                                <div className="space-y-3">
                                    {projectApprovals.map((approval) => (
                                        <div
                                            key={approval.id}
                                            className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors"
                                        >
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {approval.milestoneName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Deadline: {formatDate(approval.deadline)} ·
                                                    Approver: {approval.approverName}
                                                </p>
                                            </div>
                                            <StatusBadge status={approval.status} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
                {/* Chatter Tab */}
                {activeTab === "chatter" && (
                    <RecordChatter
                        recordType="project"
                        recordId={projectId}
                        activityItems={MOCK_ACTIVITY}
                        comments={chatterComments}
                        currentUserId="u1"
                        onAddComment={handleAddComment}
                    />
                )}
            </DetailLayout>

            {/* Add Task Dialog */}
            <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Task</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <label className="text-sm font-medium">Task Title</label>
                        <Input
                            placeholder="Enter task title"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setAddTaskOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddTask}
                            disabled={!taskTitle.trim() || createTask.isPending}
                        >
                            {createTask.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                            Add Task
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
