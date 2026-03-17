"use client";

import { logger } from "@/lib/logger";
import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
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
import type { ActivityItem, CommentItem } from "@/components/activity";
import { PROJECT_PHASE_MAP } from "@/config/domain-config";
import {
    useApprovals,
    useBudgetLineItems,
    useCreateTask,
    useDeleteProject,
    useProject,
    useStakeholders,
    useTasks,
    useUpdateProject,
} from "@/lib/supabase";
import { useProjectCollaborators } from "@/lib/supabase/hooks-collaborators";
import { useCreateRecordComment, useRecordActivityLog, useRecordComments } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { DetailPageConfig } from "@/types/detail-page-config";
import {
    AlertTriangle,
    CheckSquare,
    Clock,
    DollarSign,
    Edit,
    FolderKanban,
    Handshake,
    Loader2,
    TrendingUp,
    Users,
} from "lucide-react";

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "projects",
    titleKey: "name",
    statusKey: "status",
    icon: FolderKanban,
    backHref: "/projects",
    backLabel: "Projects",
    chatter: false,
    fields: [],
    tabs: [],
};

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;
    const [addTaskOpen, setAddTaskOpen] = useState(false);
    const [taskTitle, setTaskTitle] = useState("");
    const updateProject = useUpdateProject();
    const deleteProject = useDeleteProject();
    const createTask = useCreateTask();

    const { data: project, isLoading } = useProject(projectId);
    const { data: sbActivity } = useRecordActivityLog("project", projectId);
    const { data: sbComments } = useRecordComments("project", projectId);
    const createComment = useCreateRecordComment();

    const activityItems: ActivityItem[] = useMemo(
        () =>
            (sbActivity ?? []).map((a) => ({
                id: a.id,
                action: a.action as ActivityItem["action"],
                actorName: a.user_profiles?.display_name ?? "System",
                entityType: a.entity_type,
                description: (a.metadata?.description as string) ?? undefined,
                createdAt: a.created_at,
            })),
        [sbActivity]
    );

    const chatterComments: CommentItem[] = useMemo(
        () =>
            (sbComments ?? []).map((c) => ({
                id: c.id,
                authorId: c.author_id,
                authorName: c.user_profiles?.display_name ?? "",
                content: c.body,
                createdAt: c.created_at,
                updatedAt: c.updated_at,
            })),
        [sbComments]
    );

    const handleArchive = async () => {
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
        try {
            await deleteProject.mutateAsync(projectId);
            router.push("/projects");
        } catch (error) {
            logger.error("Failed to delete project", { error });
        }
    };

    const handleAddTask = async () => {
        if (!taskTitle.trim()) return;
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
    const { data: sbTasks } = useTasks({ project_id: projectId });
    const { data: sbCollaborators } = useProjectCollaborators(projectId);
    const projectCollaborators = (sbCollaborators ?? []) as Record<string, unknown>[];
    const { data: sbBudgetLines } = useBudgetLineItems({ project_id: projectId });
    const { data: sbApprovals } = useApprovals();
    const { data: sbStakeholders } = useStakeholders();
    const projectTasks = sbTasks ?? [];
    const projectApprovals = (sbApprovals ?? []).filter(
        (a: Record<string, unknown>) => a.project_id === projectId
    );
    const projectStakeholders = (sbStakeholders ?? []).filter((s: Record<string, unknown>) => {
        const pIds = s.project_ids ?? s.projectIds;
        return Array.isArray(pIds) ? pIds.includes(projectId) : false;
    });

    const phaseConfig = project
        ? PROJECT_PHASE_MAP[project.current_phase as keyof typeof PROJECT_PHASE_MAP]
        : undefined;
    const budgetUtilization =
        project && project.budget_planned > 0
            ? Math.round((project.budget_actual / project.budget_planned) * 100)
            : 0;
    const pendingApprovals = projectApprovals.filter(
        (a) => a.status === "pending" || a.status === "overdue"
    );
    const completedTasks = projectTasks.filter((t) => t.status === "done").length;

    const handleAddComment = async (content: string) => {
        await createComment.mutateAsync({
            entity_type: "project",
            entity_id: projectId,
            author_id: "u1",
            body: content,
        });
    };

    const sidebarSlot =
        project && phaseConfig ? (
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Project Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Client</span>
                            <span className="font-medium">{project.companies?.name ?? "—"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Phase</span>
                            <Badge variant={phaseConfig.variant}>{phaseConfig.label}</Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Start Date</span>
                            <span>{formatDate(project.start_date)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">End Date</span>
                            <span>{formatDate(project.end_date)}</span>
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
        ) : undefined;

    const overviewSlot = project ? (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <DollarSign className="h-4 w-4" />
                            <span className="text-xs">Budget</span>
                        </div>
                        <p className="text-xl font-bold">
                            {formatCurrency(project.budget_planned)}
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
                        <p className="text-xl font-bold">{projectStakeholders.length}</p>
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
                                        <p className="text-sm font-medium">{task.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {task.due_date && `Due ${formatDate(task.due_date)}`}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <PriorityBadge
                                            priority={task.priority}
                                            className="text-[10px]"
                                        />
                                        <StatusBadge status={task.status} className="text-[10px]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    ) : undefined;

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        subtitleFn: () => project?.companies?.name ?? "",
        sidebarSlot,
        overviewSlot,
        tabs: [
            {
                id: "tasks",
                label: "Tasks",
                count: projectTasks.length,
                content: (
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
                                                        {
                                                            PROJECT_PHASE_MAP[
                                                                task.phase as keyof typeof PROJECT_PHASE_MAP
                                                            ]?.label
                                                        }
                                                        {task.due_date &&
                                                            ` · Due ${formatDate(task.due_date)}`}
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
                ),
            },
            {
                id: "team",
                label: "Team",
                count: projectStakeholders.length,
                content: (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Team Members</CardTitle>
                            <Button
                                size="sm"
                                onClick={() => router.push(`/crew/new?projectId=${projectId}`)}
                            >
                                Add Member
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {projectStakeholders.length === 0 ? (
                                <EmptyState
                                    icon={Users}
                                    title="No team members"
                                    description="Add team members to this project"
                                    action={{
                                        label: "Add Member",
                                        onClick: () =>
                                            router.push(`/crew/new?projectId=${projectId}`),
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
                ),
            },
            {
                id: "collaborators",
                label: "Collaborators",
                count: projectCollaborators.length,
                content: (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Handshake className="h-4 w-4" />
                                Collaborators
                            </CardTitle>
                            <Button
                                size="sm"
                                onClick={() => router.push(`/advancing?projectId=${projectId}`)}
                            >
                                Invite Collaborator
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {projectCollaborators.length === 0 ? (
                                <EmptyState
                                    icon={Handshake}
                                    title="No collaborators"
                                    description="Invite vendors and partners to collaborate on this project"
                                    action={{
                                        label: "Invite Collaborator",
                                        onClick: () =>
                                            router.push(`/advancing?projectId=${projectId}`),
                                    }}
                                />
                            ) : (
                                <div className="space-y-3">
                                    {projectCollaborators.map((collab) => {
                                        const vendor = collab.vendors as Record<
                                            string,
                                            unknown
                                        > | null;
                                        const reqs = (collab.collaborator_requirements ??
                                            []) as Record<string, unknown>[];
                                        const totalReqs = reqs.length;
                                        const completedReqs = reqs.filter(
                                            (r) => r.status === "approved" || r.status === "waived"
                                        ).length;
                                        return (
                                            <div
                                                key={String(collab.id)}
                                                className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {String(vendor?.name ?? "Vendor")}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {String(collab.engagement_type ?? "vendor")}
                                                        {totalReqs > 0 &&
                                                            ` · ${completedReqs}/${totalReqs} requirements complete`}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant={
                                                        collab.status === "active"
                                                            ? "success"
                                                            : collab.status === "onboarding"
                                                              ? "info"
                                                              : collab.status === "suspended" ||
                                                                  collab.status === "terminated"
                                                                ? "destructive"
                                                                : "warning"
                                                    }
                                                >
                                                    {String(collab.status ?? "invited")}
                                                </Badge>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ),
            },
            {
                id: "budget",
                label: "Budget",
                content: project ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <StatCard
                                title="Planned Budget"
                                value={formatCurrency(project.budget_planned)}
                            />
                            <StatCard
                                title="Actual Spend"
                                value={formatCurrency(project.budget_actual)}
                            />
                            <StatCard
                                title="Remaining"
                                value={formatCurrency(
                                    project.budget_planned - project.budget_actual
                                )}
                            />
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Budget Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {(sbBudgetLines ?? []).length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        No budget line items yet
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {(sbBudgetLines ?? []).map(
                                            (line: Record<string, unknown>) => (
                                                <div
                                                    key={String(line.id)}
                                                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                                                >
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {String(
                                                                line.description ??
                                                                    line.category ??
                                                                    "Line Item"
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {String(line.category ?? "")}
                                                            {line.vendor_id
                                                                ? " · Vendor assigned"
                                                                : ""}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold">
                                                            {formatCurrency(
                                                                Number(line.estimated_amount ?? 0)
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Actual:{" "}
                                                            {formatCurrency(
                                                                Number(line.actual_amount ?? 0)
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                ) : undefined,
            },
            {
                id: "approvals",
                label: "Approvals",
                count: pendingApprovals.length,
                content: (
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
                                                    {
                                                        (approval as Record<string, unknown>)
                                                            .milestone_name as string
                                                    }
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Deadline: {formatDate(approval.deadline)} ·
                                                    Approver:{" "}
                                                    {String(
                                                        (approval as Record<string, unknown>)
                                                            .approver_name ?? ""
                                                    )}
                                                </p>
                                            </div>
                                            <StatusBadge status={approval.status} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ),
            },
            {
                id: "chatter",
                label: "Chatter",
                count: chatterComments.length,
                content: (
                    <RecordChatter
                        recordType="project"
                        recordId={projectId}
                        activityItems={activityItems}
                        comments={chatterComments}
                        currentUserId="u1"
                        onAddComment={handleAddComment}
                    />
                ),
            },
        ],
    };

    const rec = project as unknown as Record<string, unknown> | null;
    const record = rec ? { ...rec } : null;

    return (
        <>
            <DetailPageShell
                config={config}
                id={projectId}
                record={record}
                isLoading={isLoading}
                menuItems={[
                    {
                        label: "Duplicate Project",
                        onClick: () => router.push(`/projects/new?duplicateFrom=${projectId}`),
                    },
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
                avatar={
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-primary-foreground">
                        {project?.name.charAt(0) ?? "P"}
                    </div>
                }
                actions={
                    <Button onClick={() => router.push(`/projects/${projectId}/edit`)}>
                        <Edit className="h-4 w-4" />
                        Edit
                    </Button>
                }
            />

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
